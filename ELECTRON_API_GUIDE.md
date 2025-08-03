# Electron API 使用指南

## 概述

本指南展示了如何在Angular项目中安全地使用Electron API。我们通过IPC（进程间通信）实现了主进程和渲染进程之间的安全通信。

## 架构说明

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Angular App   │ ←→ │  Preload Script  │ ←→ │  Main Process   │
│ (Renderer进程)  │    │  (Context Bridge) │    │  (Node.js APIs) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 文件结构

- `src/main.ts` - 主进程，处理IPC请求和系统API调用
- `src/preload.ts` - 预加载脚本，通过contextBridge安全暴露API
- `src/electron.d.ts` - TypeScript类型定义
- `dist/electron.service.ts` - Angular服务，封装Electron API调用
- `dist/electron-demo.component.ts` - 使用示例组件

## 在Angular项目中集成步骤

### 1. 复制文件到Angular项目

```bash
# 复制类型定义文件
cp src/electron.d.ts /path/to/your/angular/src/

# 复制Angular服务
cp dist/electron.service.ts /path/to/your/angular/src/app/services/

# 复制示例组件（可选）
cp dist/electron-demo.component.ts /path/to/your/angular/src/app/components/
```

### 2. 在Angular模块中注册服务

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { ElectronService } from './services/electron.service';

@NgModule({
  providers: [
    ElectronService,
    // ... 其他服务
  ],
  // ...
})
export class AppModule { }
```

### 3. 在组件中使用

```typescript
import { Component } from '@angular/core';
import { ElectronService } from '../services/electron.service';

@Component({
  selector: 'app-my-component',
  template: `
    <div *ngIf="electronService.isElectron">
      <h3>Electron环境</h3>
      <button (click)="openFile()">打开文件</button>
    </div>
    <div *ngIf="!electronService.isElectron">
      <h3>浏览器环境</h3>
      <p>某些功能只在Electron中可用</p>
    </div>
  `
})
export class MyComponent {
  constructor(public electronService: ElectronService) {}

  async openFile() {
    const filePaths = await this.electronService.showOpenDialog();
    if (filePaths && filePaths.length > 0) {
      const content = await this.electronService.readFile(filePaths[0]);
      console.log('文件内容:', content);
    }
  }
}
```

## 可用的API

### 文件系统操作

```typescript
// 读取文件
const content = await electronService.readFile('/path/to/file.txt');

// 写入文件
const success = await electronService.writeFile('/path/to/file.txt', 'Hello World');

// 检查文件是否存在
const exists = await electronService.fileExists('/path/to/file.txt');
```

### 对话框操作

```typescript
// 打开文件对话框
const filePaths = await electronService.showOpenDialog({
  properties: ['openFile', 'multiSelections'],
  filters: [
    { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
  ]
});

// 保存文件对话框
const filePath = await electronService.showSaveDialog({
  defaultPath: 'untitled.txt'
});

// 消息对话框
await electronService.showMessageBox('Hello from Electron!', 'info');
```

### 系统信息

```typescript
// 获取应用版本
const version = await electronService.getAppVersion();

// 获取操作系统平台
const platform = await electronService.getPlatform();

// 获取应用路径
const appPath = await electronService.getAppPath();
```

### Shell操作

```typescript
// 在默认浏览器中打开URL
await electronService.openExternal('https://electronjs.org');

// 在文件管理器中显示文件
await electronService.showItemInFolder('/path/to/file');
```

### 窗口控制

```typescript
// 最小化窗口
await electronService.minimizeWindow();

// 最大化/还原窗口
await electronService.maximizeWindow();

// 关闭窗口
await electronService.closeWindow();
```

## 安全特性

1. **Context Isolation**: 启用了上下文隔离，确保渲染进程无法直接访问Node.js API
2. **No Node Integration**: 禁用了Node.js集成，防止恶意代码执行
3. **Preload Script**: 通过预加载脚本和contextBridge安全地暴露API
4. **IPC通信**: 使用IPC进行主进程和渲染进程之间的通信

## 开发和调试

### 启动开发环境

```bash
npm start
```

### 查看日志

- 主进程日志：在终端中查看
- 渲染进程日志：在开发者工具的控制台中查看

### 常见问题

1. **API不可用**: 检查是否在Electron环境中运行
2. **文件路径错误**: 使用绝对路径，注意路径分隔符
3. **权限问题**: 确保应用有文件访问权限

## 扩展API

要添加新的API，需要：

1. 在`src/main.ts`中添加IPC处理器
2. 在`src/preload.ts`中暴露API接口
3. 更新`src/electron.d.ts`中的类型定义
4. 在`ElectronService`中添加对应方法

### 示例：添加获取CPU信息的API

```typescript
// 1. 在main.ts中添加处理器
import os from 'node:os';

ipcMain.handle('system:getCpuInfo', async () => {
  return os.cpus();
});

// 2. 在preload.ts中暴露
system: {
  // ... 现有方法
  getCpuInfo: () => ipcRenderer.invoke('system:getCpuInfo'),
}

// 3. 在service中添加方法
async getCpuInfo(): Promise<any[]> {
  if (!this.electronAPI) return [];
  return await this.electronAPI.system.getCpuInfo();
}
```

## 注意事项

1. 始终检查`electronService.isElectron`来确保功能可用性
2. 处理异步操作的错误情况
3. 对文件路径进行验证
4. 在生产环境中移除调试日志
5. 定期更新Electron版本以获得安全补丁

## 更多资源

- [Electron官方文档](https://www.electronjs.org/docs)
- [Angular官方文档](https://angular.io/docs)
- [Electron Forge文档](https://www.electronforge.io/)