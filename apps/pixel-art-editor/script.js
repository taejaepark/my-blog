(function () {
  "use strict";

  var GRID_SIZE = 16;
  var THEME_KEY = "theme-pixel-art-editor";

  var DEFAULT_PALETTE = [
    "#000000", "#ffffff", "#9ca3af", "#4b5563",
    "#ef4444", "#f97316", "#facc15", "#a3e635",
    "#22c55e", "#14b8a6", "#3b82f6", "#1e3a8a",
    "#8b5cf6", "#ec4899", "#92400e", "#fcd9b6"
  ];

  var canvas = document.getElementById("pixel-canvas");
  var ctx = canvas.getContext("2d");
  var paletteEl = document.getElementById("palette");
  var eraserBtn = document.getElementById("eraser-btn");
  var customColorInput = document.getElementById("custom-color");
  var currentColorSwatch = document.getElementById("current-color-swatch");
  var clearBtn = document.getElementById("clear-btn");
  var saveBtn = document.getElementById("save-btn");
  var themeToggle = document.getElementById("theme-toggle");

  // 도트 데이터: null은 빈 칸(투명)
  var pixels = [];
  for (var r = 0; r < GRID_SIZE; r++) {
    pixels.push(new Array(GRID_SIZE).fill(null));
  }

  var currentColor = DEFAULT_PALETTE[0];
  var isEraser = false;
  var isDrawing = false;
  var swatchEls = [];

  ctx.imageSmoothingEnabled = false;

  function buildPalette() {
    DEFAULT_PALETTE.forEach(function (color) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "color-swatch";
      btn.style.background = color;
      btn.dataset.color = color;
      btn.setAttribute("aria-label", color);
      btn.addEventListener("click", function () {
        currentColor = color;
        isEraser = false;
        updateToolSelection();
      });
      paletteEl.appendChild(btn);
      swatchEls.push(btn);
    });
  }

  function updateToolSelection() {
    swatchEls.forEach(function (el) {
      var isSelected = !isEraser && el.dataset.color === currentColor;
      el.classList.toggle("selected", isSelected);
    });
    eraserBtn.classList.toggle("selected", isEraser);
    currentColorSwatch.style.background = isEraser ? "" : currentColor;
  }

  function render() {
    var cellSize = canvas.width / GRID_SIZE;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var row = 0; row < GRID_SIZE; row++) {
      for (var col = 0; col < GRID_SIZE; col++) {
        var color = pixels[row][col];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }

    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--grid-line").trim() || "#cccccc";
    ctx.lineWidth = 1;
    for (var i = 0; i <= GRID_SIZE; i++) {
      var pos = Math.round(i * cellSize) + 0.5;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(canvas.width, pos);
      ctx.stroke();
    }
  }

  function paintAt(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var cellW = rect.width / GRID_SIZE;
    var cellH = rect.height / GRID_SIZE;
    var col = Math.floor((clientX - rect.left) / cellW);
    var row = Math.floor((clientY - rect.top) / cellH);

    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      return;
    }

    pixels[row][col] = isEraser ? null : currentColor;
    render();
  }

  // 마우스 입력
  canvas.addEventListener("mousedown", function (e) {
    isDrawing = true;
    paintAt(e.clientX, e.clientY);
  });

  canvas.addEventListener("mousemove", function (e) {
    if (isDrawing) {
      paintAt(e.clientX, e.clientY);
    }
  });

  canvas.addEventListener("mouseleave", function () {
    isDrawing = false;
  });

  window.addEventListener("mouseup", function () {
    isDrawing = false;
  });

  // 터치 입력
  canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    isDrawing = true;
    var touch = e.touches[0];
    if (touch) {
      paintAt(touch.clientX, touch.clientY);
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", function (e) {
    e.preventDefault();
    if (isDrawing) {
      var touch = e.touches[0];
      if (touch) {
        paintAt(touch.clientX, touch.clientY);
      }
    }
  }, { passive: false });

  canvas.addEventListener("touchend", function () {
    isDrawing = false;
  });

  canvas.addEventListener("touchcancel", function () {
    isDrawing = false;
  });

  // 지우개 / 커스텀 색상
  eraserBtn.addEventListener("click", function () {
    isEraser = true;
    updateToolSelection();
  });

  customColorInput.addEventListener("input", function () {
    currentColor = customColorInput.value;
    isEraser = false;
    updateToolSelection();
  });

  // 전체 지우기
  clearBtn.addEventListener("click", function () {
    for (var row = 0; row < GRID_SIZE; row++) {
      for (var col = 0; col < GRID_SIZE; col++) {
        pixels[row][col] = null;
      }
    }
    render();
  });

  // PNG 저장: 16x16 원본 해상도 오프스크린 캔버스 사용
  saveBtn.addEventListener("click", function () {
    var exportCanvas = document.createElement("canvas");
    exportCanvas.width = GRID_SIZE;
    exportCanvas.height = GRID_SIZE;
    var exportCtx = exportCanvas.getContext("2d");

    for (var row = 0; row < GRID_SIZE; row++) {
      for (var col = 0; col < GRID_SIZE; col++) {
        var color = pixels[row][col];
        if (color) {
          exportCtx.fillStyle = color;
          exportCtx.fillRect(col, row, 1, 1);
        }
      }
    }

    var dataUrl = exportCanvas.toDataURL("image/png");
    var link = document.createElement("a");
    link.href = dataUrl;
    link.download = "pixel-art.png";
    link.click();
  });

  // 다크모드 토글
  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function initTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    applyTheme(saved);
  }

  themeToggle.addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme");
    var isDark = current
      ? current === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    var next = isDark ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  // 초기화
  buildPalette();
  updateToolSelection();
  initTheme();
  render();
})();
