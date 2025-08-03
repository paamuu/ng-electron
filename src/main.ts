import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the Angular app from dist directory
  // Check if we're in development or production
  const isDev = !app.isPackaged;
  let distPath: string;
  
  if (isDev) {
    // Development: use project root directory + dist
    // app.getAppPath() returns the project root directory
    distPath = path.join(app.getAppPath(), 'dist', 'index.html');
  } else {
    // Production: from extraResource
    distPath = path.join(process.resourcesPath, 'dist', 'index.html');
  }
  
  console.log('Loading Angular app from:', distPath);
  console.log('File exists:', require('fs').existsSync(distPath));
  
  mainWindow.loadFile(distPath).catch(err => {
    console.error('Failed to load Angular app:', err);
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
