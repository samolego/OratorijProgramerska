// GAMES_DATA_PLACEHOLDER - To bo zamenjal shell skript
const GAMES_DATA = {};

// Normalize Slovenian text for searching
function normalizeSlovenianText(text) {
  return text
    .toLowerCase()
    .replace(/č/g, "c")
    .replace(/ž/g, "z")
    .replace(/š/g, "s")
    .replace(/ć/g, "c")
    .replace(/đ/g, "d");
}

// Calculate Levenshtein distance between two strings
function calculateDistance(str1, str2) {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i - 1] + 1,
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Search games with closest matches
// Generate HTML for a game card
function generateGameCardHTML(game) {
  return `
    <div class="game-card" onclick="playInIframe('${game.path}', '${game.name}')">
        <div class="game-title">
          <a href="${game.path}" target="_blank">
            ${game.name}
          </a>
        </div>
        <div class="game-actions">
            <button class="btn btn-secondary" onclick="playInIframe('${game.path}', '${game.name}')">
                📺 Igraj
            </button>
            <a href="${game.path}" download="${game.name}.html" class="btn btn-tertiary">
                💾 Prenesi
            </a>
        </div>
    </div>`;
}

function searchGames(games, searchQuery) {
  if (!searchQuery.trim()) {
    return { exactMatches: games, closestMatches: [] };
  }

  const normalizedQuery = normalizeSlovenianText(searchQuery);
  const exactMatches = [];
  const gameDistances = [];

  games.forEach((game) => {
    const normalizedGameName = normalizeSlovenianText(game.name);

    if (normalizedGameName.includes(normalizedQuery)) {
      exactMatches.push(game);
    } else {
      const distance = calculateDistance(normalizedQuery, normalizedGameName);
      gameDistances.push({ game, distance });
    }
  });

  // Sort by distance
  gameDistances.sort((a, b) => a.distance - b.distance);
  const closestMatches = gameDistances
    .slice(0, 3) // Get top 3 closest matches
    .map((item) => item.game);

  return { exactMatches, closestMatches };
}

function populateYearSelector() {
  const yearSelect = document.getElementById("yearSelect");
  const years = Object.keys(GAMES_DATA).sort((a, b) => b - a);

  yearSelect.innerHTML = '<option value="">Izberi leto ...</option>';
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
}

function displayGames(year, searchQuery = "") {
  const gamesGrid = document.getElementById("gamesGrid");

  if (!year || !GAMES_DATA[year]) {
    gamesGrid.innerHTML = `
      <div class="no-games">
        <div class="no-games-icon">🎮</div>
        <div class="no-games-text">Ni najdenih iger za to leto</div>
        <div class="no-games-subtext">Poskusi z drugim letom</div>
      </div>`;
    return;
  }

  const games = GAMES_DATA[year];
  if (games.length === 0) {
    gamesGrid.innerHTML = `
      <div class="no-games">
        <div class="no-games-icon">🎮</div>
        <div class="no-games-text">Ni najdenih iger za to leto</div>
        <div class="no-games-subtext">Poskusi z drugim letom</div>
      </div>`;
    return;
  }

  const { exactMatches, closestMatches } = searchGames(games, searchQuery);

  if (exactMatches.length === 0 && searchQuery.trim()) {
    // Show closest matches when no exact matches found
    gamesGrid.innerHTML = `
      <div class="no-games">
        <div class="no-games-icon">🔍</div>
        <div class="no-games-text">Ni najdenih iger. Si mislil katero od teh treh?</div>
      </div>
      ${closestMatches.map(generateGameCardHTML).join("")}`;
    return;
  }

  const gamesToShow = exactMatches.length > 0 ? exactMatches : games;
  gamesGrid.innerHTML = gamesToShow.map(generateGameCardHTML).join("");
}

function playInIframe(gamePath, gameName) {
  const iframeContainer = document.getElementById("iframeContainer");
  const iframe = document.getElementById("gameIframe");
  const iframeTitle = document.getElementById("iframeTitle");

  iframe.src = gamePath;
  iframeTitle.textContent = `Igranje: ${gameName}`;
  iframeContainer.classList.add("show");

  updateUrlParams(null, gameName, null);
}

function restartIframe() {
  const iframe = document.getElementById("gameIframe");
  const currentSrc = iframe.src;
  iframe.src = "";
  setTimeout(() => {
    iframe.src = currentSrc;
  }, 100);
}

function closeIframe() {
  const iframeContainer = document.getElementById("iframeContainer");
  const iframe = document.getElementById("gameIframe");

  iframeContainer.classList.remove("show");
  iframe.src = "";

  updateUrlParams(null, "", null);
}

function openFullscreen() {
  const iframe = document.getElementById("gameIframe");
  const fullscreenOverlay = document.getElementById("fullscreenOverlay");
  const fullscreenIframe = document.getElementById("fullscreenIframe");
  const fullscreenTitle = document.getElementById("fullscreenTitle");
  const iframeTitle = document.getElementById("iframeTitle");

  if (iframe.src) {
    fullscreenIframe.src = iframe.src;
    fullscreenTitle.textContent = iframeTitle.textContent + " - Celozaslonsko";
    fullscreenOverlay.classList.add("show");
  }
}

function closeFullscreen() {
  const fullscreenOverlay = document.getElementById("fullscreenOverlay");
  const fullscreenIframe = document.getElementById("fullscreenIframe");

  fullscreenOverlay.classList.remove("show");
  fullscreenIframe.src = "";
}

function restartFullscreen() {
  const fullscreenIframe = document.getElementById("fullscreenIframe");
  const currentSrc = fullscreenIframe.src;
  fullscreenIframe.src = "";
  setTimeout(() => {
    fullscreenIframe.src = currentSrc;
  }, 100);
}

// ESC key za izhod iz celozaslonskega načina
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeFullscreen();
  }
});

function updateUrlParams(year, game, search) {
  const url = new URL(window.location);

  if (year !== null) {
    if (year) {
      url.searchParams.set("year", year);
    } else {
      url.searchParams.delete("year");
    }
  }

  if (game !== null) {
    if (game) {
      url.searchParams.set("game", game);
    } else {
      url.searchParams.delete("game");
    }
  }

  if (search !== null) {
    if (search) {
      url.searchParams.set("search", search);
    } else {
      url.searchParams.delete("search");
    }
  }

  window.history.replaceState({}, "", url);
}

function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    year: urlParams.get("year"),
    game: urlParams.get("game"),
    search: urlParams.get("search"),
  };
}

function restoreFromUrl() {
  const params = getUrlParams();

  if (params.year && GAMES_DATA[params.year]) {
    const yearSelect = document.getElementById("yearSelect");
    const searchInput = document.getElementById("gameSearch");

    yearSelect.value = params.year;

    if (params.search) {
      searchInput.value = params.search;
    }

    displayGames(params.year, params.search || "");

    if (params.game) {
      const games = GAMES_DATA[params.year];
      const selectedGame = games.find((game) => game.name === params.game);
      if (selectedGame) {
        setTimeout(() => {
          playInIframe(selectedGame.path, selectedGame.name);
        }, 100);
      }
    }
  } else {
    // If no URL params, let the default current year selection work
    const currentYear = new Date().getFullYear().toString();
    const years = Object.keys(GAMES_DATA).sort((a, b) => b - a);
    if (years.includes(currentYear)) {
      const yearSelect = document.getElementById("yearSelect");
      if (!yearSelect.value) {
        yearSelect.value = currentYear;
        displayGames(currentYear);
        updateUrlParams(currentYear, null, null);
      }
    }
  }
}

document.getElementById("yearSelect").addEventListener("change", function () {
  const searchInput = document.getElementById("gameSearch");
  const searchQuery = searchInput.value;
  displayGames(this.value, searchQuery);
  closeIframe();
  updateUrlParams(this.value, null, searchQuery);
});

// Search input event listener
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("gameSearch");
  const yearSelect = document.getElementById("yearSelect");

  searchInput.addEventListener("input", function () {
    const searchQuery = this.value;
    const selectedYear = yearSelect.value;

    if (selectedYear) {
      displayGames(selectedYear, searchQuery);
      updateUrlParams(null, null, searchQuery);
    }
  });
});

populateYearSelector();
// Restore URL state after populating data
setTimeout(() => {
  restoreFromUrl();
}, 0);

// Hot reload funkcionalnost samo za lokalni razvoj
function initHotReload() {
  // Preveri če teče na lokalnem hostu
  const isLocalDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0";

  if (!isLocalDevelopment) {
    console.log("🚀 Production mode - hot reload disabled");
    return;
  }

  console.log("🔄 Development mode - hot reload enabled");

  let lastTimestamp = null;

  // Preveri spremembe vsakih 100ms
  setInterval(async () => {
    try {
      const response = await fetch("/build-timestamp.txt?" + Date.now());
      if (response.ok) {
        const timestamp = await response.text();

        if (lastTimestamp === null) {
          lastTimestamp = timestamp;
          return;
        }

        if (timestamp !== lastTimestamp) {
          console.log("🔄 Spremembe zaznane, reload strani...");
          window.location.reload();
        }
      }
    } catch (error) {
      // Tiho ignoriraj napake (timestamp datoteka morda še ne obstaja)
    }
  }, 100);
}

// Inicializiraj hot reload ko je DOM pripravljen
document.addEventListener("DOMContentLoaded", initHotReload);
