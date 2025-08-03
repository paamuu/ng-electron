import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,  // 禁用node集成以提高安全性
      contextIsolation: true,  // 启用上下文隔离
      sandbox: false,  // 保持false以便preload脚本工作
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
  console.log('File exists:', await fs.access(distPath).then(() => true).catch(() => false));
  
  mainWindow.loadFile(distPath).catch(err => {
    console.error('Failed to load Angular app:', err);
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// IPC 处理器设置
const setupIpcHandlers = () => {
  // 文件系统相关API
  ipcMain.handle('fs:readFile', async (_, filePath: string) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('fs:exists', async (_, filePath: string) => {
    try {
      await fs.access(filePath);
      return { success: true, exists: true };
    } catch {
      return { success: true, exists: false };
    }
  });

  // 对话框相关API
  ipcMain.handle('dialog:showOpenDialog', async (_, options) => {
    const result = await dialog.showOpenDialog(options);
    return result;
  });

  ipcMain.handle('dialog:showSaveDialog', async (_, options) => {
    const result = await dialog.showSaveDialog(options);
    return result;
  });

  ipcMain.handle('dialog:showMessageBox', async (_, options) => {
    const result = await dialog.showMessageBox(options);
    return result;
  });

  // 系统相关API
  ipcMain.handle('system:getAppVersion', async () => {
    return app.getVersion();
  });

  ipcMain.handle('system:getAppPath', async () => {
    return app.getAppPath();
  });

  ipcMain.handle('system:getPlatform', async () => {
    return process.platform;
  });

  // Shell相关API
  ipcMain.handle('shell:openExternal', async (_, url: string) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('shell:showItemInFolder', async (_, fullPath: string) => {
    try {
      shell.showItemInFolder(fullPath);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // 窗口相关API
  ipcMain.handle('window:minimize', async () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.minimize();
    }
  });

  ipcMain.handle('window:maximize', async () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      if (focusedWindow.isMaximized()) {
        focusedWindow.unmaximize();
      } else {
        focusedWindow.maximize();
      }
    }
  });

  ipcMain.handle('window:close', async () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.close();
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  setupIpcHandlers();
  createWindow();
});

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
