(function () {
  "use strict";

  const SIZE = 4;
  const BEST_SCORE_KEY = "best-score";
  const THEME_KEY = "theme-2048";
  const SWIPE_THRESHOLD = 30;

  const boardEl = document.getElementById("board");
  const scoreEl = document.getElementById("score");
  const bestScoreEl = document.getElementById("best-score");
  const newGameBtn = document.getElementById("new-game-btn");
  const themeToggleBtn = document.getElementById("theme-toggle");
  const winOverlay = document.getElementById("win-overlay");
  const loseOverlay = document.getElementById("lose-overlay");
  const controlsPad = document.querySelector(".controls-pad");

  let board = createEmptyBoard();
  let score = 0;
  let best = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
  let isGameOver = false;
  let hasWon = false;

  function createEmptyBoard() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function cloneBoard(b) {
    return b.map((row) => row.slice());
  }

  function transpose(b) {
    return b[0].map((_, colIndex) => b.map((row) => row[colIndex]));
  }

  function reverseRows(b) {
    return b.map((row) => row.slice().reverse());
  }

  // 하나의 타일이 한 번의 이동에서 두 번 이상 병합되지 않도록,
  // 병합 결과를 다시 병합 대상으로 취급하지 않고 한 번의 패스로만 처리한다.
  function moveLeftRow(row) {
    const filtered = row.filter((v) => v !== 0);
    const merged = [];
    let scoreGain = 0;
    let i = 0;
    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const value = filtered[i] * 2;
        merged.push(value);
        scoreGain += value;
        i += 2;
      } else {
        merged.push(filtered[i]);
        i += 1;
      }
    }
    while (merged.length < SIZE) merged.push(0);
    const moved = row.some((v, idx) => v !== merged[idx]);
    return { row: merged, scoreGain, moved };
  }

  function moveLeftBoard(b) {
    let moved = false;
    let scoreGain = 0;
    const newBoard = b.map((row) => {
      const result = moveLeftRow(row);
      scoreGain += result.scoreGain;
      if (result.moved) moved = true;
      return result.row;
    });
    return { board: newBoard, scoreGain, moved };
  }

  // 4방향 입력을 "왼쪽 밀기" 하나로 통일해서 처리한다: 방향에 맞게
  // 보드를 회전/전치한 뒤 moveLeftBoard를 적용하고, 다시 원래대로 되돌린다.
  function applyMove(direction) {
    if (isGameOver || hasWon) return;

    let working = cloneBoard(board);
    if (direction === "right") {
      working = reverseRows(working);
    } else if (direction === "up") {
      working = transpose(working);
    } else if (direction === "down") {
      working = reverseRows(transpose(working));
    }

    const result = moveLeftBoard(working);
    if (!result.moved) return;

    let newBoard = result.board;
    if (direction === "right") {
      newBoard = reverseRows(newBoard);
    } else if (direction === "up") {
      newBoard = transpose(newBoard);
    } else if (direction === "down") {
      newBoard = transpose(reverseRows(newBoard));
    }

    board = newBoard;
    score += result.scoreGain;

    spawnTile();
    updateBest();
    checkGameState();
    render();
  }

  function spawnTile() {
    const emptyCells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === 0) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) return;
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  function canMove(b) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c] === 0) return true;
        if (c < SIZE - 1 && b[r][c] === b[r][c + 1]) return true;
        if (r < SIZE - 1 && b[r][c] === b[r + 1][c]) return true;
      }
    }
    return false;
  }

  function checkGameState() {
    if (!hasWon && board.some((row) => row.some((v) => v >= 2048))) {
      hasWon = true;
      showOverlay(winOverlay);
      return;
    }
    if (!canMove(board)) {
      isGameOver = true;
      showOverlay(loseOverlay);
    }
  }

  function showOverlay(overlayEl) {
    overlayEl.hidden = false;
  }

  function hideOverlays() {
    winOverlay.hidden = true;
    loseOverlay.hidden = true;
  }

  function updateBest() {
    if (score > best) {
      best = score;
      localStorage.setItem(BEST_SCORE_KEY, String(best));
    }
  }

  function render() {
    boardEl.innerHTML = "";
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const value = board[r][c];
        const cell = document.createElement("div");
        cell.className = "cell" + (value ? " " + tileClass(value) : "");
        if (value) cell.textContent = String(value);
        boardEl.appendChild(cell);
      }
    }
    scoreEl.textContent = String(score);
    bestScoreEl.textContent = String(best);
  }

  function tileClass(value) {
    return value <= 2048 ? "tile-" + value : "tile-super";
  }

  function newGame() {
    board = createEmptyBoard();
    score = 0;
    isGameOver = false;
    hasWon = false;
    hideOverlays();
    spawnTile();
    spawnTile();
    render();
  }

  // 입력 처리
  window.addEventListener("keydown", (e) => {
    const keyToDirection = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    const direction = keyToDirection[e.key];
    if (!direction) return;
    e.preventDefault();
    applyMove(direction);
  });

  newGameBtn.addEventListener("click", newGame);

  document.querySelectorAll("[data-restart]").forEach((btn) => {
    btn.addEventListener("click", newGame);
  });

  controlsPad.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-direction]");
    if (!btn) return;
    applyMove(btn.dataset.direction);
  });

  let touchStartX = 0;
  let touchStartY = 0;

  boardEl.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true }
  );

  boardEl.addEventListener("touchend", (e) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return;

    if (absDx > absDy) {
      applyMove(dx > 0 ? "right" : "left");
    } else {
      applyMove(dy > 0 ? "down" : "up");
    }
  });

  // 테마 처리: 저장된 값이 없으면 prefers-color-scheme 미디어쿼리가 자동으로 처리한다.
  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  applyTheme(localStorage.getItem(THEME_KEY));

  themeToggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    let next;
    if (current === "dark") {
      next = "light";
    } else if (current === "light") {
      next = "dark";
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      next = prefersDark ? "light" : "dark";
    }
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  // 초기화
  spawnTile();
  spawnTile();
  render();
})();
