const LASTFM_TOP_USER = "lily-wkfld";
const LASTFM_TOP_KEY = "320c29920c2820467b0ac8daae64cb76";

// last.fm's default "no image" placeholder — treat it as no art
const LASTFM_PLACEHOLDER = "2a96cbd8b46e442fc41c2b86b821562f";

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

async function loadTopTracks() {
  const el = document.getElementById("top-tracks");
  if (!el) return;

  // "as of" note under the header, so "this month" isn't ambiguous
  const noteEl = document.getElementById("top-tracks-note");
  if (noteEl) {
    const today = new Date().toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    noteEl.textContent = `as of ${today.toLowerCase()} · rolling 30 days`;
  }

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${LASTFM_TOP_USER}&period=1month&limit=3&api_key=${LASTFM_TOP_KEY}&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    const tracks = data?.toptracks?.track;

    if (!tracks || tracks.length === 0) {
      el.innerHTML = `<p>no scrobbles this month yet...</p>`;
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