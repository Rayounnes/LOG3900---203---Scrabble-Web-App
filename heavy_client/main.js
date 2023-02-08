/* const { app, BrowserWindow } = require('electron')

function createWindow () {

const win = new BrowserWindow({

width: 800,

height: 600,

webPreferences: {

nodeIntegration: true } })

win.loadURL('http://localhost:4200/#/connexion')

win.webContents.openDevTools()

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {

if (process.platform !== 'darwin') {

app.quit() } })

app.on('activate', () => {

if (BrowserWindow.getAllWindows().length === 0) {

createWindow() } }) */

const { app, BrowserWindow } = require('electron');

let appWindow;

function initWindow() {
    appWindow = new BrowserWindow({
        // fullscreen: true,
        height: 800,
        width: 1000,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    // Electron Build Path
    const path = `file://${__dirname}/dist/client/index.html`;
    appWindow.loadURL(path);

    appWindow.setMenuBarVisibility(false)

    // Initialize the DevTools.
    // appWindow.webContents.openDevTools()

    appWindow.on('closed', function () {
        appWindow = null;
    });
}

app.on('ready', initWindow);

// Close when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (appWindow === null) {
        initWindow();
    }
});