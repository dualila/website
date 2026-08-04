const LASTFM_TOP_USER = "lily-wkfld";
const LASTFM_TOP_KEY = "320c29920c2820467b0ac8daae64cb76";

const LASTFM_PLACEHOLDER = "2a96cbd8b46e442fc41c2b86b821562f";

const TARGET_MONTH = window.NOW_PAGE_MONTH || "2026-08";
// ─────────────────────────────────────────────────────────────

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

// Is TARGET_MONTH the month we're currently in?
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
function artFromScrobble(t) {
  const imgs = t.image || [];
  const img =
    imgs.find((i) => i.size === "extralarge")?.["#text"] ||
    imgs.find((i) => i.size === "large")?.["#text"] ||
    imgs[imgs.length - 1]?.["#text"];
  return img && !img.includes(LASTFM_PLACEHOLDER) ? img : null;
}

async function fetchMonthScrobbles(yyyyMm, limit = 4) {
  const { from, to: monthEnd } = monthToRange(yyyyMm);
  const to = isCurrentMonth(yyyyMm)
    ? Math.floor(Date.now() / 1000) // current month → up to right now
    : monthEnd - 1; // archived month → up to (but not into) the next month

  const PER_PAGE = 200; // last.fm max
  const MAX_PAGES = 40; // safety cap (~8000 scrobbles/month)
  const tally = new Map(); // "artist||track" -> { name, artist, url, playcount, art }

  let page = 1;
  let totalPages = 1;

  do {
    const url =
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
      `&user=${LASTFM_TOP_USER}&api_key=${LASTFM_TOP_KEY}&format=json` +
      `&from=${from}&to=${to}&limit=${PER_PAGE}&page=${page}`;
    const res = await fetch(url);
    const data = await res.json();

    const rt = data?.recenttracks;
    if (!rt) break;

    totalPages = Number(rt["@attr"]?.totalPages) || 1;

    const raw = rt.track;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

    for (const t of list) {
      if (t["@attr"]?.nowplaying === "true" || !t.date) continue;

      const artistName = t.artist?.["#text"] || t.artist?.name || t.artist;
      if (!artistName || !t.name) continue; // skip malformed entries defensively

      const key = `${artistName}||${t.name}`;
      let entry = tally.get(key);
      if (!entry) {
        entry = {
          name: t.name,
          artist: { name: artistName },
          url: t.url,
          playcount: 0,
          art: null,
        };
        tally.set(key, entry);
      }
      entry.playcount += 1; // one recenttracks row = one play
      if (!entry.art) entry.art = artFromScrobble(t); // grab art off the scrobble
    }

    page += 1;
  } while (page <= totalPages && page <= MAX_PAGES);

  if (page > MAX_PAGES && page <= totalPages) {
    console.warn(
      `top tracks: hit the ${MAX_PAGES}-page cap for ${yyyyMm}; earliest scrobbles may be missing.`
    );
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
    const tracks = await fetchMonthScrobbles(TARGET_MONTH, 4);

    if (!tracks || tracks.length === 0) {
      el.innerHTML = `<p>no scrobbles that month...</p>`;
      return;
    }

    // most art already came off the scrobbles; only look up the stragglers
    const artUrls = await Promise.all(
      tracks.map((t) =>
        t.art ? Promise.resolve(t.art) : fetchTrackArt(t.artist.name, t.name)
      )
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