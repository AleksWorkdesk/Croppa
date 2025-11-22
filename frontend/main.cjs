const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'assets/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        backgroundColor: '#111827',
        show: false,
        autoHideMenuBar: true,  // Hide menu bar by default (press Alt to show)
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, dist is in the same directory as main.cjs
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function startPythonBackend() {
    // In development, run Python script directly
    // In production (packaged), run the standalone executable from extraResources
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
        const backendPath = '../backend';
        const pythonScript = path.join(__dirname, backendPath, 'app.py');
        const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';

        pythonProcess = spawn(pythonExecutable, [pythonScript], {
            cwd: path.join(__dirname, backendPath),
        });
    } else {
        // In production, extraResources are in process.resourcesPath
        // With --onedir, the structure is: resources/backend/dist/croppa-backend/croppa-backend.exe
        const backendExe = path.join(process.resourcesPath, 'backend', 'dist', 'croppa-backend', 'croppa-backend.exe');
        const backendCwd = path.join(process.resourcesPath, 'backend', 'dist', 'croppa-backend');

        console.log('Starting backend from:', backendExe);
        console.log('Working directory:', backendCwd);

        pythonProcess = spawn(backendExe, [], {
            cwd: backendCwd,
        });
    }

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });
}

app.whenReady().then(() => {
    startPythonBackend();

    // Give Python a moment to start
    setTimeout(() => {
        createWindow();
    }, 2000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
});
