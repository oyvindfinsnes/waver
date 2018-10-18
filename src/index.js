const electron = require("electron");
const path = require("path");
const fs = require("fs");
const { app, globalShortcut, BrowserWindow, Tray, Menu } = require("electron");

// Keep a global reference of the window object, if not the window might be
// closed automatically when the JavaScript object is garbage-collected
let mainWindow = null;
let tray = null;

// Called when Electron has finished initialization and is ready to create
// browser windows. Some APIs can only be used after this event occurs
app.on("ready", setup);

// Unregister all shortcuts when app is about to quit
app.on("will-quit", () => globalShortcut.unregisterAll());

// Quit app when all windows are closed
app.on("window-all-closed", () => app.quit());

// Setup takes care of all tasks needed to create or reload the app
function setup() {

  const data = require(path.join(__dirname, "settings.json"));
  const w = data.window.size[0];
  const h = data.window.size[1];

  mainWindow = new BrowserWindow({
    show: false,
    frame: false,
    resizable: false,
    width: w,
    height: h,
    backgroundColor: "#151515",
    icon: path.join(__dirname, "images/icon.ico")
  });

  // Load main HTML-file into browserwindow
  const HTMLPath = path.join(__dirname, "index.html");
  mainWindow.loadURL(HTMLPath);

  // Window is initialized to not show to avoid app bg from flashing on startup
  mainWindow.on("ready-to-show", () => {

    mainWindow.show();
    mainWindow.openDevTools();

  });

  // Dereference window variable when window is closed
  mainWindow.on("closed", () => mainWindow = null);

  // Make a new system tray icon from the app icon
  const iconPath = path.join(__dirname, "images/icon.ico");
  tray = new Tray(iconPath);

  // Create a new contextmenu for the system tray icon
  const contextMenu = Menu.buildFromTemplate([
    { label: "Maximize", click: () => mainWindow.restore() },
    { label: "Minimize", click: () => mainWindow.minimize() },
    { label: "Reload", click: () => mainWindow.reload() },
    { type: "separator" },
    { label: "Exit", role: "quit" }
  ]);

  // Set the system tray context menu and tooltip
  tray.setContextMenu(contextMenu);
  tray.setToolTip("Music For the Command Prompt Traversers");

}