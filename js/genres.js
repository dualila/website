const LASTFM_GENRE_USER = "lily-wkfld";
const LASTFM_GENRE_KEY = "320c29920c2820467b0ac8daae64cb76";

// last.fm doesn't expose "genres" directly, so this pulls your top artists
// then grabs each artist's top tags and weights them by how much you've
// played that artist. tags that aren't really genres get filtered out below.
const ARTIST_LIMIT = 12;
const TAGS_PER_ARTIST = 5;
const GENRES_TO_SHOW = 20;

// last.fm tags are crowd-sourced and messy — strip out the non-genre noise
const TAG_BLOCKLIST = new Set([
  "seen live", "favorites", "favourite", "favourites", "favorite",
  "female vocalists", "male vocalists", "awesome", "amazing", "love",
  "beautiful", "cool", "under 2000 listeners", "spotify", "0",
  LASTFM_GENRE_USER.toLowerCase()
]);

async function fetchTopArtists() {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists` +
              `&user=${LASTFM_GENRE_USER}` +
              `&api_key=${LASTFM_GENRE_KEY}` +
              `&period=12month&limit=${ARTIST_LIMIT}&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const data = await res.json();

  if (!data?.topartists?.artist) throw new Error("no top artists found");
  return data.topartists.artist;
}

async function fetchArtistTags(artistName) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags` +
              `&artist=${encodeURIComponent(artistName)}` +
              `&api_key=${LASTFM_GENRE_KEY}` +
              `&autocorrect=1&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data?.toptags?.tag || [];
  } catch (err) {
    console.error(`tag fetch failed for ${artistName}:`, err);
    return [];
  }
}

async function loadTopGenres() {
  const mount = document.getElementById("top-genres");

  try {
    const artists = await fetchTopArtists();

    // weight = artist's own playcount, so heavily-played artists' tags count more
    const tagResults = await Promise.all(
      artists.map((artist) => fetchArtistTags(artist.name))
    );

    const scores = {};

    artists.forEach((artist, i) => {
      const weight = parseInt(artist.playcount, 10) || 1;
      const tags = tagResults[i].slice(0, TAGS_PER_ARTIST);

      tags.forEach((tag) => {
        const name = tag.name.toLowerCase().trim();
        if (!name || TAG_BLOCKLIST.has(name)) return;

        // each artist's own tag ranking also carries some signal (count 0-100)
        const tagWeight = weight * (1 + (parseInt(tag.count, 10) || 0) / 100);
        scores[name] = (scores[name] || 0) + tagWeight;
      });
    });

    const ranked = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, GENRES_TO_SHOW);

    if (ranked.length === 0) {
      mount.innerHTML = "no genre data yet — go listen to something.";
      return;
    }

    const maxScore = ranked[0][1];

    mount.innerHTML = ranked
      .map(([name, score]) => {
        // biggest genre gets the brightest tag, rest scale down
        const strength = score / maxScore;
        const cls = strength > 0.66 ? "genre-tag-hot" : strength > 0.33 ? "genre-tag-warm" : "genre-tag-cool";
        return `<span class="genre-tag ${cls}">${name}</span>`;
      })
      .join("");

  } catch (error) {
    console.error("Genre aggregation error:", error);
    mount.innerHTML = `<span style="color:red">ERROR: ${error.message}</span>`;
  }
}

loadTopGenres();
