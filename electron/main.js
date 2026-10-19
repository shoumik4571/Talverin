const { app, BrowserWindow, dialog, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

const isDev = process.env.TALVERIN_DEV === '1';
// Packaged builds serve the isolated `.next-prod` output (see next.config.mjs).
if (!isDev) process.env.TALVERIN_DIST = '.next-prod';

let alarmWindow = null;

function createAlarmWindow(alarmData) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  
  const windowWidth = 420;
  const windowHeight = 280;
  const x = screenWidth - windowWidth - 20; // 20px from right edge
  const y = screenHeight - windowHeight - 100; // 100px from bottom

  if (alarmWindow) {
    alarmWindow.close();
    alarmWindow = null;
  }

  alarmWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x,
    y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  alarmWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  alarmWindow.setAlwaysOnTop(true, 'screen-saver');

  const alarmHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: transparent;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
    }
    .alarm-container {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0B1917 0%, #0F2420 50%, #0B1917 100%);
      border-radius: 20px;
      border: 1px solid rgba(21, 195, 154, 0.3);
      box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.5), 0 0 0 1px rgba(21, 195, 154, 0.1);
      display: flex;
      flex-direction: column;
      animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .alarm-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(21, 195, 154, 0.15);
    }
    .alarm-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: rgba(21, 195, 154, 0.15);
      border: 1px solid rgba(21, 195, 154, 0.3);
      border-radius: 100px;
      color: #15C39A;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .alarm-badge.live {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.3);
      color: #EF4444;
      animation: pulse 1s infinite;
    }
    .alarm-time {
      font-family: 'SF Mono', 'Monaco', monospace;
      font-size: 13px;
      font-weight: 700;
      color: #15C39A;
      background: rgba(21, 195, 154, 0.1);
      padding: 4px 10px;
      border-radius: 8px;
    }
    .alarm-content {
      flex: 1;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .alarm-title {
      font-size: 16px;
      font-weight: 800;
      color: #fff;
      line-height: 1.3;
      margin-bottom: 8px;
    }
    .alarm-subtitle {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.4;
    }
    .alarm-progress {
      margin-top: 16px;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
    }
    .alarm-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #15C39A, #11A683);
      border-radius: 2px;
      animation: progressFill 1s ease-out;
    }
    @keyframes progressFill {
      from { width: 0%; }
    }
    .alarm-actions {
      display: flex;
      gap: 10px;
      padding: 16px 20px;
      border-top: 1px solid rgba(21, 195, 154, 0.15);
    }
    .alarm-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .alarm-btn.primary {
      background: linear-gradient(135deg, #15C39A, #11A683);
      color: #fff;
      box-shadow: 0 4px 16px rgba(21, 195, 154, 0.3);
    }
    .alarm-btn.primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(21, 195, 154, 0.4);
    }
    .alarm-btn.secondary {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .alarm-btn.secondary:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    .alarm-btn:active {
      transform: scale(0.98);
    }
    .alarm-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
    .sparkle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #15C39A;
      border-radius: 50%;
      animation: sparkleFloat 2s ease-in-out infinite;
      opacity: 0;
    }
    @keyframes sparkleFloat {
      0% { opacity: 0; transform: translate(0, 0) scale(0); }
      50% { opacity: 1; transform: translate(-20px, -30px) scale(1); }
      100% { opacity: 0; transform: translate(-40px, -60px) scale(0); }
    }
  </style>
</head>
<body>
  <div class="alarm-container" id="container">
    <div class="alarm-header">
      <div class="alarm-badge" id="badge">
        <span class="alarm-dot" style="width:8px;height:8px;border-radius:50%;background:currentColor;display:inline-block;"></span>
        <span id="badgeText">Session Starting</span>
      </div>
      <div class="alarm-time" id="alarmTime">10:30</div>
    </div>
    <div class="alarm-content">
      <div class="alarm-title" id="alarmTitle">Deep Work Session</div>
      <div class="alarm-subtitle" id="alarmSubtitle">45 min focus block</div>
      <div class="alarm-progress">
        <div class="alarm-progress-bar" id="progressBar" style="width: 0%;"></div>
      </div>
    </div>
    <div class="alarm-actions">
      <button class="alarm-btn primary" id="btnStart">
        <svg class="alarm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        Start Session
      </button>
      <button class="alarm-btn secondary" id="btnDismiss">
        <svg class="alarm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        Dismiss
      </button>
    </div>
  </div>
  <script>
    const { ipcRenderer } = require('electron');
    
    let alarmData = {};
    let progressInterval = null;
    let autoCloseTimer = null;
    
    // Receive alarm data from main process
    ipcRenderer.on('alarm-show', (event, data) => {
      alarmData = data;
      updateUI(data);
      startProgress();
      startAutoClose();
    });
    
    function updateUI(data) {
      const isLive = data.type === 'live';
      document.getElementById('badgeText').textContent = isLive ? 'Live Now' : 'Session Starting';
      document.getElementById('badge').className = 'alarm-badge' + (isLive ? ' live' : '');
      document.getElementById('alarmTime').textContent = data.startTime || '';
      document.getElementById('alarmTitle').textContent = data.title || 'Deep Work Session';
      document.getElementById('alarmSubtitle').textContent = data.duration + ' min focus block';
    }
    
    function startProgress() {
      const progressBar = document.getElementById('progressBar');
      let width = 0;
      const duration = 5000; // 5 seconds to fill
      const step = 100 / (duration / 50);
      
      progressInterval = setInterval(() => {
        width += step;
        if (width >= 100) {
          width = 100;
          clearInterval(progressInterval);
        }
        progressBar.style.width = width + '%';
      }, 50);
    }
    
    function startAutoClose() {
      // Auto-close after 30 seconds
      autoCloseTimer = setTimeout(() => {
        closeWindow();
      }, 30000);
    }
    
    function closeWindow() {
      if (progressInterval) clearInterval(progressInterval);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
      document.getElementById('container').style.animation = 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse';
      setTimeout(() => {
        ipcRenderer.send('alarm-close');
        window.close();
      }, 300);
    }
    
    document.getElementById('btnStart').addEventListener('click', () => {
      ipcRenderer.send('alarm-action', { action: 'start', id: alarmData.id });
      closeWindow();
    });
    
    document.getElementById('btnDismiss').addEventListener('click', () => {
      ipcRenderer.send('alarm-action', { action: 'dismiss', id: alarmData.id });
      closeWindow();
    });
    
    // Handle window blur - keep it open but don't auto-close immediately
    window.addEventListener('blur', () => {
      // Window stays open
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.getElementById('btnStart').click();
      } else if (e.key === 'Escape') {
        document.getElementById('btnDismiss').click();
      }
    });
  </script>
</body>
</html>
  `;

  alarmWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(alarmHTML));
  
  alarmWindow.once('ready-to-show', () => {
    alarmWindow.show();
    // Focus the window briefly to ensure it's visible
    alarmWindow.focus();
  });
  
  alarmWindow.on('closed', () => {
    alarmWindow = null;
  });
  
  alarmWindow.on('blur', () => {
    // Keep window on top even when it loses focus
    if (alarmWindow) {
      alarmWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  });

  return alarmWindow;
}

function logFile() {
  try {
    return path.join(app.getPath('userData'), 'talverin-startup.log');
  } catch {
    return path.join('/tmp', 'talverin-startup.log');
  }
}

function logStep(msg) {
  const line = `${new Date().toISOString()} ${msg}\n`;
  try {
    fs.appendFileSync(logFile(), line);
  } catch {
    /* ignore */
  }
}

function loadPackagedEnv() {
  const candidates = [
    path.join(process.resourcesPath || '', '.env.local'),
    path.join(__dirname, '..', '.env.local'),
  ];
  for (const p of candidates) {
    try {
      const text = fs.readFileSync(p, 'utf8');
      for (const line of text.split('\n')) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
        }
      }
      logStep(`env loaded from ${p}`);
      return;
    } catch {
      /* try next */
    }
  }
  logStep('no packaged .env.local found; using process env');
}

function failVisible(title, err) {
  const detail = err && err.stack ? String(err.stack).split('\n').slice(0, 6).join('\n') : String(err);
  logStep(`FATAL: ${title}: ${detail}`);
  try {
    dialog.showErrorBox(title, `${detail}\n\nFull log: ${logFile()}`);
  } catch {
    /* ignore */
  }
  app.quit();
}

async function startNextServer() {
  logStep('starting bundled Next.js server');
  const next = require('next');
  const dir = path.join(__dirname, '..');
  logStep(`next dir: ${dir}`);
  const nextApp = next({ dev: false, dir });
  await nextApp.prepare();
  logStep('next prepared');
  const handler = nextApp.getRequestHandler();
  const server = http.createServer((req, res) => {
    try {
      handler(req, res);
    } catch (e) {
      logStep(`request error: ${e && e.message}`);
      res.statusCode = 500;
      res.end('Talverin failed to serve this page.');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const port = server.address().port;
  logStep(`server listening on 127.0.0.1:${port}`);
  return port;
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'Talverin',
    backgroundColor: '#0B0B0C',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: true,
  });
  if (process.platform !== 'darwin') win.setMenu(null);

  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    failVisible('Talverin could not load its interface', `${code} ${desc} ${url}`);
  });
  win.webContents.on('dom-ready', () => logStep('dom-ready'));
  win.webContents.on('did-finish-load', () => logStep('did-finish-load'));
  win.webContents.on('console-message', (_e, level, message) => {
    if (level >= 2) logStep(`renderer console[${level}]: ${String(message).slice(0, 300)}`);
  });
  win.webContents.on('render-process-gone', (_e, details) => {
    if (isQuitting) return;
    failVisible('Talverin renderer stopped', JSON.stringify(details));
  });

  try {
    await win.loadURL(SPLASH_HTML);
    if (isDev) {
      await win.loadURL('http://localhost:3000');
    } else {
      const port = await startNextServer();
      await win.loadURL(`http://127.0.0.1:${port}`);
    }
    logStep('window loaded');
  } catch (err) {
    failVisible('Talverin failed to start', err);
  }
}

function maybeWarnRunningFromDmg() {
  try {
    const resPath = process.resourcesPath || '';
    if (app.isPackaged && resPath.startsWith('/Volumes/')) {
      dialog.showMessageBox({
        type: 'info',
        title: 'Talverin is running from the disk image',
        message: 'For best results, drag Talverin to Applications first, eject the DMG, then launch it from Applications.',
      });
    }
  } catch {
    /* ignore */
  }
}

process.on('uncaughtException', (err) => failVisible('Talverin crashed on startup', err));
process.on('unhandledRejection', (reason) => failVisible('Talverin failed to start', reason));

let isQuitting = false;

const SPLASH_HTML =
  'data:text/html;charset=utf-8,' +
  encodeURIComponent(
    `<!DOCTYPE html><html><body style="margin:0;background:#0B0B0C;display:flex;flex-direction:column;gap:18px;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;cursor:default;user-select:none;-webkit-user-select:none">
<div style="width:84px;height:84px;border-radius:20px;background:#101010;display:flex;align-items:center;justify-content:center;color:#CDE06A;font-weight:900;font-size:52px">T</div>
<div style="color:#fff;font-weight:800;font-size:20px;letter-spacing:-0.5px">talverin</div>
<div style="color:#71717a;font-family:monospace;font-size:11px;letter-spacing:3px">STARTING…</div>
</body></html>`,
  );

app.whenReady().then(() => {
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    app.quit();
    return;
  }
  app.on('second-instance', (_e, _argv, _dir, additionalData) => {
    const wins = BrowserWindow.getAllWindows();
    if (wins.length > 0) {
      const w = wins[0];
      if (w.isMinimized()) w.restore();
      w.focus();
      w.show();
    }
  });
  loadPackagedEnv();
  logStep('app ready');
  maybeWarnRunningFromDmg();
  void createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
});

app.on('window-all-closed', () => {
  isQuitting = true;
  app.quit();
});

// IPC handlers for alarm window
ipcMain.on('show-alarm', (event, alarmData) => {
  createAlarmWindow(alarmData);
});

ipcMain.on('alarm-close', () => {
  if (alarmWindow) {
    alarmWindow.close();
    alarmWindow = null;
  }
});

ipcMain.on('alarm-action', (event, actionData) => {
  // Forward action to main window
  const wins = BrowserWindow.getAllWindows();
  for (const win of wins) {
    if (win !== alarmWindow) {
      win.webContents.send('alarm-action', actionData);
    }
  }
  if (alarmWindow) {
    alarmWindow.close();
    alarmWindow = null;
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});
