const { app, BrowserWindow, utilityProcess, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');

let apiProcess;
const apiPort = Number(process.env.PORT || 4317);
const apiUrl = `http://127.0.0.1:${apiPort}`;

function waitForApi(attempt = 0) {
  return new Promise((resolve, reject) => {
    const request = http.get(`${apiUrl}/api/health`, (response) => {
      response.resume();
      if (response.statusCode === 200) resolve(); else retry();
    });
    request.setTimeout(800, () => request.destroy());
    request.on('error', retry);
    function retry() {
      if (attempt >= 40) reject(new Error('A API local não iniciou. Confira a conexão MongoDB e o arquivo .env.'));
      else setTimeout(() => waitForApi(attempt + 1).then(resolve, reject), 500);
    }
  });
}

function startBundledApi() {
  if (!app.isPackaged) return Promise.resolve();
  const envPath = path.join(app.getPath('userData'), '.env');
  if (fs.existsSync(envPath)) require('dotenv').config({ path: envPath });
  const entry = path.join(app.getAppPath(), 'server', 'src', 'index.js');
  apiProcess = utilityProcess.fork(entry, [], { env: { ...process.env, PORT: String(apiPort) }, stdio: 'pipe' });
  apiProcess.on('exit', (code) => console.log(`API finalizada (${code})`));
  return waitForApi();
}

async function createWindow() {
  const window = new BrowserWindow({
    width: 1440, height: 920, minWidth: 1040, minHeight: 680,
    backgroundColor: '#f4f7fa',
    icon: path.join(app.getAppPath(), 'assets', 'formis-app-icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  if (!app.isPackaged) await window.loadURL('http://127.0.0.1:5173');
  else await window.loadFile(path.join(app.getAppPath(), 'client', 'dist', 'index.html'));
}

app.whenReady().then(async () => {
  try { await startBundledApi(); await createWindow(); }
  catch (error) { dialog.showErrorBox('Benefícios Formis', `${error.message}\n\nNo pacote, configure MONGODB_URI em ${app.getPath('userData')}\\.env.`); app.quit(); }
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => { if (apiProcess) apiProcess.kill(); });
