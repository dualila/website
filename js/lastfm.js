const LASTFM_USER = "lily-wkfld";
const LASTFM_KEY = "320c29920c2820467b0ac8daae64cb76";
const FALLBACK_IMAGE = "/images/default-album.png"; // Change to your own placeholder path

async function loadLastFM() {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
                `&user=${LASTFM_USER}` +
                `&api_key=${LASTFM_KEY}` +
                `&format=json&limit=5`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Safety check: ensure recenttracks and track array exist
        if (!data?.recenttracks?.track) {
            document.getElementById("recent-tracks").innerHTML = "unable to fetch logs.";
            return;
        }

        const tracks = data.recenttracks.track;
        let output = "";

        tracks.forEach((track) => {
            // Check if track is currently playing
            const playing = track["@attr"] && track["@attr"].nowplaying === "true";

            // Fallback if album art doesn't exist
            const image = track.image[2]["#text"] || FALLBACK_IMAGE;

            output += `
            <div class="track">
                <img src="${image}" alt="${track.name} album artwork">
                <div class="track-info">
                    ${playing ? '<span class="now">▶ NOW</span>' : ''}
                    <span class="track-name">${track.name}</span>
                    <br>
                    <span class="artist">${track.artist["#text"]}</span>
                </div>
            </div>
            `;
        });

        document.getElementById("recent-tracks").innerHTML = output;

    } catch (error) {
        console.error("Last.fm Fetch Error:", error);
        document.getElementById("recent-tracks").innerHTML = "audio logs offline.";
    }
}

// Run on load
loadLastFM();