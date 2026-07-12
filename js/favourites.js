const LASTFM_ALBUM_USER = "lily-wkfld";
const LASTFM_ALBUM_KEY = "320c29920c2820467b0ac8daae64cb76";

async function loadTopAlbums() {

    const url =
`https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums` +
`&user=${LASTFM_ALBUM_USER}` +
`&api_key=${LASTFM_ALBUM_KEY}` +
`&period=overall` +
`&limit=5` +
`&format=json`;

    try {

        const response = await fetch(url);
        const data = await response.json();

        console.log("Last.fm response:", data);

        if (data.error) {
            throw new Error(data.message);
        }

        const albums = data.topalbums.album;

        let output = "";

        albums.forEach((album, index) => {

            const image = album.image?.[2]?.["#text"] || "";

            output += `
            <div class="album-card">

                ${image ? `<img src="${image}" alt="album artwork">` : ""}

                <div class="album-info">

                    <span class="album-name">
                        ${index + 1}. ${album.name}
                    </span>

                    <br>

                    <span class="album-artist">
                        ${album.artist.name}
                    </span>

                    <br>

                    <span class="album-count">
                        ${album.playcount} listens
                    </span>

                </div>

            </div>
            `;

        });

        document.getElementById("top-albums").innerHTML = output;

    } catch (error) {

        console.error("Last.fm error:", error);

        document.getElementById("top-albums").innerHTML =
        `
        <span style="color:red">
        ERROR: ${error.message}
        </span>
        `;

    }
}

loadTopAlbums();