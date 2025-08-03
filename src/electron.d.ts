// TypeScript类型定义文件，用于Angular项目中的Electron API

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

// 声明全局window对象上的electronAPI
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};