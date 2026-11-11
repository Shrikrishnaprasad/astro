const { app, BrowserWindow } = require("electron");
const path = require("path");

const isDev = process.env.ELECTRON_DEV === "true";

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    title: "Astro — Vedic Astrology",
    icon: path.join(__dirname, "../public/pwa-192x192.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: "#0b0d14",
    show: false, // wait until ready-to-show to avoid white flash
  });

  if (isDev) {
    // In dev mode, load from Vite dev server (port passed via env or defaults to 5173)
    const port = process.env.VITE_PORT || "5173";
    win.loadURL(`http://localhost:${port}`);
    // Uncomment the line below if you want DevTools open during dev:
    // win.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Show the window once it's fully loaded (no white flash)
  win.once("ready-to-show", () => {
    win.show();
  });

  // Closing the window quits the app
  win.on("closed", () => {
    app.exit(0); // hard exit so concurrently kills the Vite server too
  });
}

app.whenReady().then(() => {
  createWindow();

  // macOS: re-create window when dock icon is clicked and no windows are open
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed (Windows / Linux)
app.on("window-all-closed", () => {
  app.exit(0); // hard exit so concurrently kills the Vite server too
});
