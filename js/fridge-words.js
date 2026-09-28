
export const WORDS = [
  // little words
  "the", "the", "a", "a", "i", "i", "you", "you", "we", "me", "my", "your", "our",
  "is", "is", "are", "was", "were", "am", "be",
  "and", "and", "but", "or", "not", "of", "in", "on", "at", "to", "to", "for", "with", "like", "so", "if",
  "too", "very", "all", "always", "never", "again", "maybe", "just", "still", "almost",
  "here", "there", "now", "then", "when", "where", "how", "why",

  // suffixes
  "s", "s", "ing", "ed", "ly", "er", "'s",

  // naarm
  "naarm", "tram", "86", "myki", "flinders st station", "laneway", "yarra", "merri creek",
  "brunswick", "smith st", "long black", "magpie", "possum", "bag of beans",
  "op shop", "dim sim", "vape", "cherry pomegranate", "footy", "bombers", "ticket inspector",

  // verbs (shake your bumpa)
  "wait", "miss", "want", "need", "hold", "stay", "leave", "ride", "dance", "sing", "cry",
  "kiss", "dream", "glow", "forget", "remember", "run", "fall",

  // feelings
  "soft", "loud", "late", "lonely", "lucky", "brave", "tired", "sweet", "strange", "electric", "tender",

  // people & hearts
  "heart", "love", "girl", "boy", "friend", "enemy",

  // colour
  "pink", "blue", "gold", "silver", "chrome", "glitter",

  // law school
  "objection", "evidence", "hearsay", "verdict", "guilty", "precedent", "sustained", "your honour",

  // optics
  "lens", "frames", "blurry", "sunglasses", "glasses", "contact lenses",

  // online
  "the orb", "orb", "pixel", "online", "offline", "brb", "xoxo", "lol", "omg", "emoji",

  // sky & time
  "sun", "moon", "star", "morning", "night", "tonight", "forever",

  // sparkle & punctuation
  "✦", "✦", "☆", "!!", "?", ",", "<3",
  "💜", "💖", "💛", "💚", "💙", "🖤", "💔",

  // me me me
  "lily", "wakefield", "lily wakefield", "lilywakefield.com.au", "lily wakefield dot com dot au"
];

export const SPARKLY = new Set(["✦", "☆", "!!", "<3"]);

// bits that stick to the word before them, with no space
export const STICKY = new Set(["s", "ing", "ed", "ly", "er", "'s", ",", "?", "!!"]);

// "the" -> "w_the", second "the" -> "w_the-2"; encoded so emoji and ? are safe as Firestore ids
export function wordIds(words = WORDS) {
  const seen = {};
  return words.map((word) => {
    seen[word] = (seen[word] || 0) + 1;
    return "w_" + encodeURIComponent(word) + (seen[word] > 1 ? "-" + seen[word] : "");
  });
}