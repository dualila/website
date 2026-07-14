const LASTFM_TOP_USER = "lily-wkfld";
const LASTFM_TOP_KEY = "320c29920c2820467b0ac8daae64cb76";

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

    el.innerHTML = tracks
      .map((t, i) => {
        const rank = i + 1;
        const plays = t.playcount;
        return `
          <div class="track-row">
            <span class="track-rank">#${rank}</span>
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