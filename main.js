// GAMES_DATA_PLACEHOLDER - To bo zamenjal shell skript
const GAMES_DATA = {};

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

function displayGames(year) {
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

  gamesGrid.innerHTML = games
    .map(
      (game) => `
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
    </div>
`,
    )
    .join("");
}

function playInIframe(gamePath, gameName) {
  const iframeContainer = document.getElementById("iframeContainer");
  const iframe = document.getElementById("gameIframe");
  const iframeTitle = document.getElementById("iframeTitle");

  iframe.src = gamePath;
  iframeTitle.textContent = `Igranje: ${gameName}`;
  iframeContainer.classList.add("show");

  updateUrlParams(null, gameName);
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

  updateUrlParams(null, "");
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

function updateUrlParams(year, game) {
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

  window.history.replaceState({}, "", url);
}

function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    year: urlParams.get("year"),
    game: urlParams.get("game"),
  };
}

function restoreFromUrl() {
  const params = getUrlParams();

  if (params.year && GAMES_DATA[params.year]) {
    const yearSelect = document.getElementById("yearSelect");
    yearSelect.value = params.year;
    displayGames(params.year);

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
        updateUrlParams(currentYear, null);
      }
    }
  }
}

document.getElementById("yearSelect").addEventListener("change", function () {
  displayGames(this.value);
  closeIframe();
  updateUrlParams(this.value, null);
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

  // Preveri spremembe vsakih 1000ms
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
  }, 1000);
}

// Inicializiraj hot reload ko je DOM pripravljen
document.addEventListener("DOMContentLoaded", initHotReload);
