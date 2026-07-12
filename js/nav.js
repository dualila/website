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
  {label: "coming soon", href: "comingsoon.html"}
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
  title.textContent = "★ click something ??? ★";
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

document.getElementById("last-updated").textContent =
    new Date(document.lastModified).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });


async function getWeather() {
    const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=-37.8136&longitude=144.9631&current=temperature_2m,weather_code"
    );

    const data = await response.json();

    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weather_code;

    const weatherIcons = {
        0: "☀️ clear",
        1: "🌤 mostly clear",
        2: "⛅ partly cloudy",
        3: "☁️ cloudy",
        61: "🌧 rain",
        80: "🌦 showers"
    };

    document.getElementById("weather").textContent =
        `${weatherIcons[code] || "🌡"} ${temp}°C`;
}

getWeather();