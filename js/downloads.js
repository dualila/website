// downloads.js — accordion behaviour for the filing-cabinet drawers.
// Only one drawer open at a time. To allow multiple open at once, delete
// the "close every other drawer" block below.

document.addEventListener("DOMContentLoaded", () => {
  const drawers = document.querySelectorAll(".drawer");

  drawers.forEach((drawer) => {
    const button = drawer.querySelector(".drawer-title");
    const symbol = button.querySelector("span");

    button.addEventListener("click", () => {
      const isOpen = drawer.classList.contains("open");

      // close every other drawer (accordion style)
      drawers.forEach((otherDrawer) => {
        otherDrawer.classList.remove("open");
        const otherSymbol = otherDrawer.querySelector(".drawer-title span");
        if (otherSymbol) otherSymbol.textContent = "+";
      });

      // then open this one, unless it was already open (i.e. clicking an
      // open drawer closes it rather than doing nothing)
      if (!isOpen) {
        drawer.classList.add("open");
        symbol.textContent = "−";
      }
    });
  });
});