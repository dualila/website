const LASTFM_TOP_USER = "lily-wkfld";
const LASTFM_TOP_KEY = "320c29920c2820467b0ac8daae64cb76";

const LASTFM_PLACEHOLDER = "2a96cbd8b46e442fc41c2b86b821562f";

const TARGET_MONTH = window.NOW_PAGE_MONTH || "2026-07";
// ─────────────────────────────────────────────────────────────

// Turn "2026-06" into { from, to } unix timestamps (UTC month bounds)
function monthToRange(yyyyMm) {
  const [year, month] = yyyyMm.split("-").map(Number);
  const from = Math.floor(Date.UTC(year, month - 1, 1) / 1000);
  const to = Math.floor(Date.UTC(year, month, 1) / 1000); // exclusive end
  return { from, to };
}

function formatMonthLabel(yyyyMm) {
  const [year, month] = yyyyMm.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, 1));
  return d.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
}

// Is TARGET_MONTH 
function isCurrentMonth(yyyyMm) {
  const now = new Date();
  const current = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return yyyyMm === current;
}

async function fetchTrackArt(artist, track) {
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&artist=${encodeURIComponent(
      artist
    )}&track=${encodeURIComponent(track)}&api_key=${LASTFM_TOP_KEY}&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    const images = data?.track?.album?.image;
    if (!images) return null;
    // prefer "large" (174px), fall back to whatever's biggest
    const img =
      images.find((i) => i.size === "large")?.["#text"] ||
      images[images.length - 1]?.["#text"];
    if (!img || img.includes(LASTFM_PLACEHOLDER)) return null;
    return img;
  } catch {
    return null;
  }
}

// getWeeklyTrackChart
async function getWeeksInMonth(from, to) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getweeklychartlist&user=${LASTFM_TOP_USER}&api_key=${LASTFM_TOP_KEY}&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const weeks = data?.weeklychartlist?.chart || [];
  return weeks.filter((w) => {
    const wFrom = Number(w.from);
    const wTo = Number(w.to);
    // overlap test: week starts before month ends AND week ends after month starts
    return wFrom < to && wTo > from;
  });
}

// For the CURRENT month: 
async function fetchCurrentMonthTopTracks(limit = 4) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${LASTFM_TOP_USER}&period=1month&limit=${limit}&api_key=${LASTFM_TOP_KEY}&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const tracks = data?.toptracks?.track;
  if (!tracks) return [];
  const list = Array.isArray(tracks) ? tracks : [tracks];
  return list.map((t) => ({
    name: t.name,
    artist: { name: t.artist?.name || t.artist?.["#text"] || t.artist },
    url: t.url,
    playcount: Number(t.playcount) || 0,
  }));
}

async function fetchMonthlyTopTracks(yyyyMm, limit = 4) {
  const { from, to } = monthToRange(yyyyMm);
  const weeks = await getWeeksInMonth(from, to);

  if (weeks.length === 0) return [];

  // Pull each overlapping week's track chart and merge playcounts by track
  const weekResults = await Promise.all(
    weeks.map(async (w) => {
      const url = `https://ws.audioscrobbler.com/2.0/?method=user.getweeklytrackchart&user=${LASTFM_TOP_USER}&from=${w.from}&to=${w.to}&api_key=${LASTFM_TOP_KEY}&format=json`;
      const res = await fetch(url);
      const data = await res.json();
      return data?.weeklytrackchart?.track || [];
    })
  );

  const tally = new Map(); // key: "artist||track" -> { artist, name, url, playcount }
  for (const weekTracks of weekResults) {
    const list = Array.isArray(weekTracks)
      ? weekTracks
      : weekTracks
      ? [weekTracks]
      : [];

    for (const t of list) {
      const artistName = t.artist?.["#text"] || t.artist?.name || t.artist;
      if (!artistName || !t.name) continue; // skip malformed entries defensively
      const key = `${artistName}||${t.name}`;
      const playcount = Number(t.playcount) || 0;
      if (tally.has(key)) {
        tally.get(key).playcount += playcount;
      } else {
        tally.set(key, {
          name: t.name,
          artist: { name: artistName },
          url: t.url,
          playcount,
        });
      }
    }
  }

  return [...tally.values()]
    .sort((a, b) => b.playcount - a.playcount)
    .slice(0, limit);
}

async function loadTopTracks() {
  const el = document.getElementById("top-tracks");
  if (!el) return;

  // "as of" note under the header 
  const noteEl = document.getElementById("top-tracks-note");
  const currentMonth = isCurrentMonth(TARGET_MONTH);
  if (noteEl) {
    noteEl.textContent = currentMonth
      ? `${formatMonthLabel(TARGET_MONTH).toLowerCase()} so far`
      : formatMonthLabel(TARGET_MONTH).toLowerCase();
  }

  try {
    const tracks = currentMonth
      ? await fetchCurrentMonthTopTracks(4)
      : await fetchMonthlyTopTracks(TARGET_MONTH, 4);

    if (!tracks || tracks.length === 0) {
      el.innerHTML = `<p>no scrobbles that month...</p>`;
      return;
    }

    // fetch album art for all three in parallel
    const artUrls = await Promise.all(
      tracks.map((t) => fetchTrackArt(t.artist.name, t.name))
    );

    el.innerHTML = tracks
      .map((t, i) => {
        const rank = i + 1;
        const plays = t.playcount;
        const art = artUrls[i]
          ? `<img class="track-art" src="${artUrls[i]}" alt="${t.name} album art" loading="lazy">`
          : `<div class="track-art track-art-empty">♪</div>`;
        return `
          <div class="track-row">
            <span class="track-rank">#${rank}</span>
            ${art}
            <div class="track-info">
              <a class="track-name" href="${t.url}" target="_blank" rel="noopener noreferrer">${t.name}</a>
              <span class="track-artist">${t.artist.name}</span>
            </div>
            <span class="track-plays">${plays}x</span>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    el.innerHTML = `<p>couldn't reach last.fm right now...</p>`;
    console.error("top tracks fetch failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadTopTracks);