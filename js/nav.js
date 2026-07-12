// nav.js — builds the sidebar site-map on every page.
// To add/rename/remove a page !!! lily when u edit NAV_TREE below and every page updates don't forget to do this okay grl

const NAV_TREE = [
  { label: "home", href: "index.html" },
  { label: "chatroom", href: "chatroom.html" },
  {
    label: "stuff",
    children: [
      { label: "about me", href: "about.html" },
      { label: "downloads", href: "downloads.html" },
      { label: "cool links", href: "coollinks.html"}
    ]
  },
];

function currentFile() {
  const path = window.location.pathname;
  const file = path.substring(path.lastIndexOf("/") + 1);
  return file === "" ? "index.html" : file;
}

function buildSidebar() {
  const mount = document.getElementById("sidebar");
  if (!mount) return;

  const here = currentFile();
  const branchWithChildren = NAV_TREE.find((item) => item.children);
  const isOnShrinePage = branchWithChildren
    ? branchWithChildren.children.some((c) => c.href === here)
    : false;

  const nav = document.createElement("nav");
  nav.className = "sidebar";
  nav.setAttribute("aria-label", "Site navigation");

  const title = document.createElement("p");
  title.className = "sidebar-title";
  title.textContent = "★ site map ★";
  nav.appendChild(title);

  const topList = document.createElement("ul");

  NAV_TREE.forEach((item, index) => {
    const isLast = index === NAV_TREE.length - 1;
    const li = document.createElement("li");

    if (item.children) {
      // "Shrines" — expandable branch
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "toggle-btn";
      toggle.textContent = `├── ${item.label} ${isOnShrinePage ? "▾" : "▸"}`;

      const subList = document.createElement("ul");
      subList.className = "submenu" + (isOnShrinePage ? " open" : "");

      item.children.forEach((child, childIndex) => {
        const childLi = document.createElement("li");
        const prefix = childIndex === item.children.length - 1 ? "│     └── " : "│     ├── ";
        childLi.innerHTML = `<span class="tree-line">${prefix}</span>`;

        const a = document.createElement("a");
        a.href = child.href;
        a.textContent = child.label;
        if (child.href === here) a.classList.add("active");
        childLi.appendChild(a);
        subList.appendChild(childLi);
      });

      toggle.addEventListener("click", () => {
        const open = subList.classList.toggle("open");
        toggle.textContent = `├── ${item.label} ${open ? "▾" : "▸"}`;
      });

      li.appendChild(toggle);
      li.appendChild(subList);
    } else {
      const prefix = isLast ? "└── " : "├── ";
      li.innerHTML = `<span class="tree-line">${prefix}</span>`;

      const a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      if (item.href === here) a.classList.add("active");
      li.appendChild(a);
    }

    topList.appendChild(li);
  });

  nav.appendChild(topList);
  mount.replaceWith(nav);
}

document.addEventListener("DOMContentLoaded", buildSidebar);