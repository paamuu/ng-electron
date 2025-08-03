// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// 定义API接口类型
export interface ElectronAPI {
  // 文件系统相关
  fs: {
    readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
    writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
    exists: (filePath: string) => Promise<{ success: boolean; exists: boolean }>;
  };
  
  // 对话框相关
  dialog: {
    showOpenDialog: (options: any) => Promise<any>;
    showSaveDialog: (options: any) => Promise<any>;
    showMessageBox: (options: any) => Promise<any>;
  };
  
  // 系统信息相关
  system: {
    getAppVersion: () => Promise<string>;
    getAppPath: () => Promise<string>;
    getPlatform: () => Promise<string>;
  };
  
  // Shell相关
  shell: {
    openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
    showItemInFolder: (fullPath: string) => Promise<{ success: boolean; error?: string }>;
  };
  
  // 窗口相关
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
  };
}

// 安全地暴露API到渲染进程
const electronAPI: ElectronAPI = {
  fs: {
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
    exists: (filePath: string) => ipcRenderer.invoke('fs:exists', filePath),
  },
  
  dialog: {
    showOpenDialog: (options: any) => ipcRenderer.invoke('dialog:showOpenDialog', options),
    showSaveDialog: (options: any) => ipcRenderer.invoke('dialog:showSaveDialog', options),
    showMessageBox: (options: any) => ipcRenderer.invoke('dialog:showMessageBox', options),
  },
  
  system: {
    getAppVersion: () => ipcRenderer.invoke('system:getAppVersion'),
    getAppPath: () => ipcRenderer.invoke('system:getAppPath'),
    getPlatform: () => ipcRenderer.invoke('system:getPlatform'),
  },
  
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
    showItemInFolder: (fullPath: string) => ipcRenderer.invoke('shell:showItemInFolder', fullPath),
  },
  
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
};

// 通过contextBridge安全地暴露API
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
