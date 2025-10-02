const API_BASE = "https://pokeapi.co/api/v2";
const ARTWORK = id => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const PAGE_SIZE = 24;

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const detailEl = document.getElementById("detail");
const recentListEl = document.getElementById("recentList");
const favListEl = document.getElementById("favList");
const cardListEl = document.getElementById("cardList");
const topPaginationEl = document.getElementById("topPagination");
const bottomPaginationEl = document.getElementById("bottomPagination");
const statusEl = document.getElementById("status");
const themeBtn = document.getElementById("themeBtn");

let recents = JSON.parse(localStorage.getItem("recents") || "[]");
let favs = JSON.parse(localStorage.getItem("favs") || "[]");
let totalCount = 0;
let currentPage = 1;

function capitalize(s) {
  if (!s) return "";
  return s[0].toUpperCase() + s.slice(1);
}

function saveRecents() {
    localStorage.setItem("recents", JSON.stringify(recents));
}
function saveFavs() {
    localStorage.setItem("favs", JSON.stringify(favs));
}
function extractIdFromUrl(url) {
    const parts = url.split("/").filter(Boolean);
    return parts[parts.length - 1];
}
function setStatus(msg) {
    statusEl.textContent = msg;
}

// Cargar tema guardado en localStorage
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

themeBtn.onclick = () => {
    document.body.classList.toggle("dark");
    // Guardar preferencia
    const theme = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", theme);
};

// Fetch
async function fetchPokemon(nameOrId) {
    setStatus("Buscando…");
    const res = await fetch(`${API_BASE}/pokemon/${nameOrId}`);
    if (!res.ok) throw new Error("Pokémon no encontrado");
    return await res.json();
}
async function fetchList(page) {
    const offset = (page - 1) * PAGE_SIZE;
    setStatus("Cargando lista…");
    const res = await fetch(`${API_BASE}/pokemon?offset=${offset}&limit=${PAGE_SIZE}`);
    if (!res.ok) throw new Error("Error al cargar lista");
    return await res.json();
}

// Render 
function renderDetail(p) {
    const isFav = favs.some(f => f.id === p.id);
    const html = `
    <div class="panel">
      <h2>${capitalize(p.name)} <small>#${p.id}</small></h2>
      <img src="${ARTWORK(p.id)}" alt="${p.name}">
      <p><strong>Tipos:</strong> ${p.types.map(t => capitalize(t.type.name)).join(", ")}</p>
      <p><strong>Altura:</strong> ${p.height / 10} m · <strong>Peso:</strong> ${p.weight / 10} kg</p>
      <p><strong>Habilidades:</strong></p>
      <ul>${p.abilities.map(a => `<li>${capitalize(a.ability.name)}</li>`).join("")}</ul>
<button id="favBtn">${isFav ? "Quitar de Favoritos" : "Agregar a Favoritos"}</button>    </div>
  `;
    detailEl.innerHTML = html;

    document.getElementById("favBtn").onclick = () => {
        if (isFav) {
            favs = favs.filter(f => f.id !== p.id);
        } else {
            if (favs.length >= 50) favs.pop();
            favs.unshift({ id: p.id, name: p.name });
        }
        saveFavs();
        renderFavs();
        renderDetail(p); // actualizar botón
    };
}

function renderRecents() {
    recentListEl.innerHTML = "";
    recents.forEach(r => {
        const li = document.createElement("li");
        li.textContent = `${capitalize(r.name)} (#${r.id})`;
        li.onclick = () => openPokemon(r.name);
        recentListEl.appendChild(li);
    });
}
function renderFavs() {
    favListEl.innerHTML = "";
    favs.forEach(f => {
        const li = document.createElement("li");
        li.textContent = `${capitalize(f.name)} (#${f.id})`;
        li.onclick = () => openPokemon(f.id);
        favListEl.appendChild(li);
    });
}

function renderCards(list) {
    cardListEl.innerHTML = "";
    list.forEach(p => {
        const id = extractIdFromUrl(p.url);
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
      <img src="${ARTWORK(id)}" alt="${p.name}">
      <h3><span class="poke-name">${capitalize(p.name)}</span><br>
  <span class="poke-id">#${id}</span> </h3>
    `;
        card.onclick = () => openPokemon(p.name);
        cardListEl.appendChild(card);
    });
}
function renderPagination(container, current, totalPages) {
    container.innerHTML = "";
    const mkBtn = (txt, page) => {
        const b = document.createElement("button");
        b.textContent = txt;
        b.disabled = page === current;
        b.onclick = () => loadPage(page);
        container.appendChild(b);
    };
    mkBtn("«", 1);
    mkBtn("‹", Math.max(1, current - 1));
    for (let i = 1; i <= totalPages; i++) {
        if (i <= 2 || i > totalPages - 2 || Math.abs(i - current) <= 2) {
            mkBtn(i, i);
        }
    }
    mkBtn("›", Math.min(totalPages, current + 1));
    mkBtn("»", totalPages);
}

// Acciones
async function openPokemon(nameOrId) {
    try {
        const p = await fetchPokemon(nameOrId);
        renderDetail(p);
        // actualizar recientes
        recents = recents.filter(r => r.id !== p.id);
        recents.unshift({ id: p.id, name: p.name });
        if (recents.length > 10) recents.pop();
        saveRecents();
        renderRecents();
        setStatus("OK");
    } catch (e) {
        detailEl.innerHTML = `<div class="panel"><p>${e.message}</p></div>`;
        setStatus("Error");
    }
}
async function loadPage(page) {
    try {
        currentPage = page;
        const data = await fetchList(page);
        totalCount = data.count;
        renderCards(data.results);
        const totalPages = Math.ceil(totalCount / PAGE_SIZE);
        renderPagination(topPaginationEl, page, totalPages);
        renderPagination(bottomPaginationEl, page, totalPages);
        setStatus("OK");
    } catch {
        cardListEl.innerHTML = `<p>Error al cargar lista.</p>`;
    }
}

// inicializar
searchForm.onsubmit = e => {
    e.preventDefault();
    const q = searchInput.value.trim().toLowerCase();

    if (!q) {
        statusEl.textContent = "⚠️ Por favor ingresa un nombre o ID de Pokémon.";
        statusEl.classList.add("error");
        return;
    } else {
        statusEl.classList.remove("error");
    }

    openPokemon(q);
    searchInput.value = "";
};

renderRecents();
renderFavs();
loadPage(1);