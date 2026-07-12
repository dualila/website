document.getElementById("last-updated").textContent =
    new Date(document.lastModified).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });