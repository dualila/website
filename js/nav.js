// nav.js — builds the sidebar site-map on every page.
// To add/rename/remove a page !!! lily when u edit NAV_TREE below and every page updates don't forget to do this okay grl
//

const NAV_TREE = [
  { label: "home", href: "/index.html" },
  { label: "chatroom", href: "/chatroom.html" },
  {
    label: "stuff",
    children: [
      { label: "downloads", href: "/downloads.html" },
      { label: "cool links", href: "/coollinks.html" },
      { label: "radio", href: "/radio.html" },
            {
        label: "now  ",
        href: "/now/now.html", // clicking "now" goes to the current now page
        children: [
          // the archive — clicking the arrow reveals these
          {label: "now", href:"/now/now.html" },
          
        ]
      },
    ]
  },
  {
    label: "coming soon ", 
    href: "/comingsoon.html",
    children: [
      { label: "coming soon", href: "/comingsoon.html" },
    ]
  },
];

// full current path, normalised: "/" becomes "/index.html",
// "/now/" becomes "/now/index.html", etc.
function currentPath() {
  let p = window.location.pathname;
  if (p.endsWith("/")) p += "index.html";
  return p;
}

// true if this item, or anything nested inside it, is the current page
function containsHere(item, here) {
  if (item.href === here) return true;
  if (item.children) return item.children.some((c) => containsHere(c, here));
  return false;
}

// build the "│     │     ├── " style prefix for a node.
// ancestorsLast = array of booleans: for each ancestor level, was that
// ancestor the last item among its siblings? (last = blank space,
// not-last = "│     " continuation line)
function treePrefix(ancestorsLast, isLastSelf) {
  const lead = ancestorsLast.map((wasLast) => (wasLast ? "      " : "│     ")).join("");
  return lead + (isLastSelf ? "└── " : "├── ");
}

function makePrefixSpan(prefix) {
  const span = document.createElement("span");
  span.className = "tree-line";
  span.textContent = prefix;
  return span;
}

// recursively render a list of items into a <ul>
function buildLevel(items, here, ancestorsLast) {
  const ul = document.createElement("ul");
  if (ancestorsLast.length > 0) ul.className = "submenu";

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const li = document.createElement("li");
    const prefix = treePrefix(ancestorsLast, isLast);

    if (item.children) {
      const isOpen = containsHere(item, here);
      const subList = buildLevel(item.children, here, [...ancestorsLast, isLast]);
      if (isOpen) subList.classList.add("open");

      if (item.href) {
        // linked branch: label is a real link, arrow alone toggles
        li.appendChild(makePrefixSpan(prefix));

        const a = document.createElement("a");
        a.href = item.href;
        a.textContent = item.label;
        if (item.href === here) a.classList.add("active");
        li.appendChild(a);

        const arrowBtn = document.createElement("button");
        arrowBtn.type = "button";
        arrowBtn.className = "toggle-btn arrow-only";
        arrowBtn.textContent = ` ${isOpen ? "▾" : "▸"}`;
        arrowBtn.setAttribute("aria-label", `toggle ${item.label} submenu`);

        arrowBtn.addEventListener("click", () => {
          const open = subList.classList.toggle("open");
          arrowBtn.textContent = ` ${open ? "▾" : "▸"}`;
        });

        li.appendChild(arrowBtn);
      } else {
        // plain branch: whole row is the toggle (original behaviour)
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "toggle-btn";

        toggle.appendChild(makePrefixSpan(prefix));

        const labelSpan = document.createElement("span");
        labelSpan.textContent = `${item.label} ${isOpen ? "▾" : "▸"}`;
        toggle.appendChild(labelSpan);

        toggle.addEventListener("click", () => {
          const open = subList.classList.toggle("open");
          labelSpan.textContent = `${item.label} ${open ? "▾" : "▸"}`;
        });

        li.appendChild(toggle);
      }

      li.appendChild(subList);
    } else {
      li.appendChild(makePrefixSpan(prefix));

      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      if (item.href === here) a.classList.add("active");
      li.appendChild(a);
    }

    ul.appendChild(li);
  });

  return ul;
}

function buildSidebar() {
  const mount = document.getElementById("sidebar");
  if (!mount) return;

  const here = currentPath();

  const nav = document.createElement("nav");
  nav.className = "sidebar";
  nav.setAttribute("aria-label", "Site navigation");

  const title = document.createElement("p");
  title.className = "sidebar-title";
  title.textContent = "★ click something ??? ★";
  nav.appendChild(title);

  nav.appendChild(buildLevel(NAV_TREE, here, []));

  mount.replaceWith(nav);
}

document.addEventListener("DOMContentLoaded", buildSidebar);