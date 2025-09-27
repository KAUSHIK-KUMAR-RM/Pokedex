"use strict";

const API_BASE = "https://pokeapi.co/api/v2/pokemon";
const PAGE_SIZE = 60;

let nextUrl = `${API_BASE}?limit=${PAGE_SIZE}&offset=0`;
let allItems = [];
let loadingPage = false;

const grid = document.getElementById("grid");
const loadBtn = document.getElementById("loadMore");
const statusEl = document.getElementById("status");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const countPill = document.getElementById("countPill");

const loadingBox = document.getElementById("loading");
const detail = document.getElementById("pokemonCard");
const dName = document.getElementById("pokemonName");
const dImg = document.getElementById("pokemonImage");
const dType = document.getElementById("pokemonType");
const dExp = document.getElementById("pokemonExp");
const dAbilities = document.getElementById("pokemonAbilities");
const dStats = document.getElementById("pokemonStats");

function idFromUrl(url) {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}
function artworkUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
function capitalizeName(name) {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function render(items) {
  grid.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (const p of items) {
    const card = document.createElement("a");
    card.className = "card";
    card.href = `#${p.id}`; // in-page deep link
    card.dataset.id = String(p.id);
    card.setAttribute(
      "aria-label",
      `${p.name} — ${String(p.id).padStart(3, "0")}`
    );
    card.innerHTML = `
            <div class="thumb">
              <img loading="lazy" src="${p.img}" alt="${
      p.name
    }" onerror="this.style.opacity=.3"/>
            </div>
            <div class="meta">
              <div class="name">${p.name}</div>
              <div class="id">#${String(p.id).padStart(3, "0")}</div>
            </div>
          `;
    frag.appendChild(card);
  }
  grid.appendChild(frag);
  countPill.textContent = `Loaded: ${allItems.length}`;
}

function appendAndRenderBatch(results) {
  const mapped = results.map((r) => ({
    id: idFromUrl(r.url),
    name: r.name,
    img: artworkUrl(idFromUrl(r.url)),
  }));
  allItems = allItems.concat(mapped);
  const term = searchInput.value.trim().toLowerCase();
  if (term) applySearch(term);
  else render(allItems);
}

async function fetchNext() {
  if (!nextUrl || loadingPage) return;
  loadingPage = true;
  statusEl.textContent = "Loading…";
  loadBtn.disabled = true;
  try {
    const res = await fetch(nextUrl);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    nextUrl = data.next;
    appendAndRenderBatch(data.results || []);
    statusEl.textContent = nextUrl ? "" : "All Pokémon loaded.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Failed to load. Please try again.";
  } finally {
    loadingPage = false;
    loadBtn.disabled = !nextUrl;
    loadBtn.textContent = nextUrl ? "Load more" : "No more to load";
  }
}

function applySearch(term) {
  const isId = /^\d+$/.test(term);
  const filtered = allItems.filter((p) =>
    isId ? String(p.id).includes(term) : p.name.includes(term)
  );
  render(filtered);
  statusEl.textContent = filtered.length
    ? ""
    : "No results in loaded batch. Load more to expand results or clear search.";
}

let detailController; // at top-level

async function openDetail(nameOrId) {
  try {
    if (detailController) detailController.abort();
    detailController = new AbortController();

    grid.classList.add("hidden");
    document.querySelector(".footer-actions").classList.add("hidden");
    statusEl.textContent = "";
    detail.classList.add("hidden");
    loadingBox.classList.remove("hidden");

    const timeout = setTimeout(() => detailController.abort(), 15000);
    const res = await fetch(`${API_BASE}/${nameOrId}`, {
      signal: detailController.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error("Pokémon not found");
    const data = await res.json();

    dName.textContent = capitalizeName(data.name);
    dImg.src =
      data.sprites?.other?.["official-artwork"]?.front_default ||
      data.sprites?.front_default ||
      data.sprites?.front_shiny ||
      "";
    dImg.onerror = function () {
      this.style.opacity = 0.5;
    };
    dType.textContent = (data.types || []).map((t) => t.type.name).join(", ");
    dExp.textContent = data.base_experience || "N/A";
    dAbilities.textContent = (data.abilities || [])
      .map((a) => a.ability.name)
      .join(", ");

    dStats.innerHTML = "";
    (data.stats || []).forEach((stat, i) => {
      const li = document.createElement("li");
      const value = stat.base_stat;
      const pct = Math.min((value / 150) * 100, 100);
      li.innerHTML = `<span>${stat.stat.name.toUpperCase()}: ${value}</span>`;
      li.style.setProperty("--stat-width", "0%");
      dStats.appendChild(li);
      setTimeout(
        () => li.style.setProperty("--stat-width", `${pct}%`),
        i * 200 + 300
      );
    });

    loadingBox.classList.add("hidden");
    detail.classList.remove("hidden");

    if (location.hash !== `#${data.id}`) location.hash = `#${data.id}`;
    setTimeout(() => {
      const headerOffset =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--topbar-h"
          )
        ) || 72;
      const y =
        detail.getBoundingClientRect().top +
        window.pageYOffset -
        (headerOffset + 16);
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 100);
  } catch (err) {
    console.error(err);
    loadingBox.classList.add("hidden");
    detail.innerHTML = `
            <div style="text-align:center;padding:20px">
              <h2 style="font-family:'Press Start 2P',cursive;color:#cf6679;margin:0 0 12px">❌ Pokémon Not Found</h2>
              <button class="back-btn" id="backToGrid">Back to Grid</button>
            </div>
          `;
    detail.classList.remove("hidden");
  }
}

function closeDetail() {
  detail.classList.add("hidden");
  grid.classList.remove("hidden");
  document.querySelector(".footer-actions").classList.remove("hidden");
  statusEl.textContent = "";
  if (location.hash)
    history.replaceState(
      "",
      document.title,
      window.location.pathname + window.location.search
    );
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Events
loadBtn.addEventListener("click", fetchNext);
// util
const debounce = (fn, ms = 200) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

// Events
searchInput.addEventListener(
  "input",
  debounce((e) => {
    const term = e.target.value.trim().toLowerCase();
    if (!term) {
      render(allItems);
      statusEl.textContent = "";
      return;
    }
    applySearch(term);
  }, 150)
);

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  render(allItems);
  statusEl.textContent = "";
  searchInput.focus();
});

// Card click → open detail (event delegation)
grid.addEventListener("click", (e) => {
  const a = e.target.closest("a.card");
  if (!a) return;
  e.preventDefault();
  const id = a.dataset.id || a.getAttribute("href").slice(1);
  openDetail(id);
});

// Back button in detail (event delegation)
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "backToGrid") closeDetail();
});

// Keyboard: ESC closes detail
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !detail.classList.contains("hidden")) closeDetail();
});

// Hash routing
window.addEventListener("hashchange", () => {
  const id = location.hash.replace("#", "").trim();
  if (id) openDetail(id);
  else if (!detail.classList.contains("hidden")) closeDetail();
});

// Infinite scroll
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) fetchNext();
    });
  },
  { rootMargin: "600px" }
);
io.observe(loadBtn);

// Boot
fetchNext();
// Open deep link directly on load if present
if (location.hash) {
  const idOnLoad = location.hash.replace("#", "").trim();
  if (idOnLoad) openDetail(idOnLoad);
}
