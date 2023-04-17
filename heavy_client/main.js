const { app, BrowserWindow } = require('electron');

let appWindow;

function initWindow() {
    appWindow = new BrowserWindow({
        // fullscreen: true,
        height: 800,
        width: 1000,
        webPreferences: {
            nodeIntegration: true,
            enablePreferredSizeMode: false,
        },
    });
    // Electron Build Path
    const path = `file://${__dirname}/dist/client/index.html`;
    appWindow.loadURL(path);
    let isZoomSet = false;
    appWindow.webContents.setZoomFactor(0.8);
    appWindow.webContents.on('did-finish-load', () => {
        if (!isZoomSet) {
            appWindow.webContents.setZoomFactor(0.8);
            isZoomSet = true;
        }
    });

    appWindow.setMenuBarVisibility(false);

    // Initialize the DevTools.
    // appWindow.webContents.openDevTools()
    appWindow.on('resize', function () {
        appWindow.webContents.setZoomFactor(0.8);
    });

    appWindow.on('closed', function () {
        appWindow = null;
    });
}

// app.whenReady().then(initWindow);
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
