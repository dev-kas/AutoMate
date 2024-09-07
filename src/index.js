const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const axios = require('axios');
const fs = require('fs');
const os = require('os');
const { execSync, spawn } = require('child_process');
const Database = require("@codegame/open-db");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const dbPath = path.join(app.getPath("userData"), "database.db");
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, "");
}
const FILES_DB = new Database("files", dbPath);

FILES_DB.setScheme({
  name: {
    type: "string",
    required: true,
    default: "Untitled.km"
  },
  dir: {
    type: "string",
    required: true,
    default: path.join(os.homedir(), "Documents", "AutoMate Scripts")
  },
  fullPath: {
    type: "string",
    required: true,
    default: path.join(os.homedir(), "Documents", "AutoMate Scripts", "Untitled.km")
  }
})

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  let win = createWindow();
  let childMacro = null;
  
  ipcMain.on("chk_amcli_av", (event, arg) => {
    console.log("chk_amcli_av recieved from rernederer")
    let isAmCliAvailable = fs.existsSync(path.resolve(app.getPath("userData"), "automate.exe")) || fs.existsSync(path.resolve(app.getPath("userData"), "automate"));
    if (isAmCliAvailable) {
      event.sender.send("res:chk_amcli_av", true);
    } else {
      event.sender.send("res:chk_amcli_av", false);
      axios.get("https://api.github.com/repos/dev-kas/AutoMate-CLI/releases/latest")
        .then((response) => {
          let url = "";
          response?.data?.assets?.forEach((asset) => {
            console.log(asset.name, process.arch);
            if (process.platform === "win32" && asset.name.includes(".exe")) {
              url = asset.browser_download_url;
            } else if (process.platform === "linux" && asset.name.includes("linux")) {
              url = asset.browser_download_url;
            } else if (process.platform === "darwin" && asset.name.includes("mac") && asset.name.includes(process.arch)) {
              url = asset.browser_download_url;
            }
          });
          console.log(`Downloading ${url}`);
          if (url !== "") {
            console.log(`Downloading from ${url}`);
            let writer;
            if (process.platform === "win32") { writer = fs.createWriteStream(path.resolve(app.getPath("userData"), "automate.exe"));
            } else if (process.platform === "linux") { writer = fs.createWriteStream(path.resolve(app.getPath("userData"), "automate"));
            } else if (process.platform === "darwin") { writer = fs.createWriteStream(path.resolve(app.getPath("userData"), "automate"));
            } else { throw new Error("Unsupported platform"); }
            const total = parseInt(response.headers["content-length"], 10);
            let downloaded = 0;
            axios({
              url,
              method: "GET",
              responseType: "stream"
            })
              .then(response => {
                const totalLength = parseInt(response.headers["content-length"], 10);
                response.data.on("data", chunk => {
                  downloaded += chunk.length;
                  writer.write(chunk);
                  console.log(`Completed ${Math.floor((downloaded / total) * 100)}%`);
                });
                response.data.on("end", () => {
                  writer.end();
                  console.log("Completed");
                  if (process.platform !== "win32") { execSync(`chmod +x "${path.join(app.getPath("userData"), "automate")}"`) };
                  try {
                    let amVer = execSync(`"${path.join(app.getPath("userData"), (process.platform === "win32" ? "automate.exe" : "automate"))}" --version`).toString();
                    if (amVer) {
                      event.sender.send("res:chk_amcli_av", true);
                    }
                  } catch (error) {
                    console.log(error);
                  }
                });
                response.data.on("error", err => {
                  writer.end();
                  console.log("Error: ", err);
                });
              })
              .catch(err => {
                console.log("Error: ", err);
              });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  })

  ipcMain.on("chk_perm_av", (event, arg) => {
    console.log("chk_perm_av recieved from rernederer")
    let amProcess = spawn(path.join(app.getPath("userData"), "automate"), {
      stdio: ["pipe", "pipe", "pipe"],
    });
    amProcess.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      if (code === 0) {
        event.sender.send("res:chk_perm_av", true);
      } else {
        event.sender.send("res:chk_perm_av", false);
      };
    });
    amProcess.stdin.write("move ; exit\n");
    amProcess.stdin.end();
  });

  ipcMain.on("new_file", (event, arg) => {
    console.log("new_file recieved from rernederer")
    dialog.showSaveDialog(win, {
      title: "New File",
      defaultPath: path.join(os.homedir(), "Documents", "AutoMate Scripts", "Untitled.km"),
      filters: [
        { name: "AutoMate MacroScript", extensions: ["km"] },
      ],
    }).then(result => {
      if (!result.canceled) {
        // console.log("New file created: ", result.filePath);
        fs.writeFileSync(result.filePath, "", "utf-8");
        let info = path.parse(result.filePath);
        FILES_DB.createItem(result.filePath, {
          name: info.base,
          dir: info.dir,
          fullPath: result.filePath
        });
        info.content = fs.readFileSync(result.filePath, "utf-8");
        info.fullPath = result.filePath;
        event.sender.send("res:new_file", info);
      }
    }).catch(error => {
      console.log(error);
    });
  });

  ipcMain.on("update_file", (event, info) => {
    console.log("update_file recieved from rernederer", info)
    fs.writeFileSync(path.join(info.dir, info.base), info.content, "utf-8");
  });

  ipcMain.on("open_file", (event, p) => {
    console.log("open_file recieved from rernederer", p)
    let info = path.parse(p);
    info.content = fs.readFileSync(p, "utf-8");
    info.fullPath = p;
    event.sender.send("res:open_file", info);
  });

  ipcMain.on("play_macro", (event, p) => {
    console.log("play_macro recieved from rernederer", p)
    if (childMacro) { return }
    childMacro = spawn(path.join(app.getPath("userData"), process.platform === "win32" ? "automate.exe" : "automate"), ["run", path.relative(app.getPath("userData"), p)], {
      stdio: ["pipe", "pipe", "pipe"],
    })
    // console.log("Process exited with code: ", amProcess);
    childMacro.on('exit', (code) => {
      console.log(`Process exited with code: ${code}`);
      event.sender.send("macro_stopped", code);
      childMacro = null;
    });

    childMacro.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
      event.sender.send("macro_stderr", data.toString());
    });
  });

  ipcMain.on("stop_macro", (event) => {
    if (childMacro) { childMacro.kill(); childMacro = null; }
    event.sender.send("macro_stopped", 0);
  });

  ipcMain.on("start_recording", (event) => {
    console.log("start_recording recieved from rernederer")
    if (childMacro) { return }
    // TODO: Start recording Macro
  });

  ipcMain.on("stop_recording", (event) => {
    console.log("stop_recording recieved from rernederer")
    // TODO: Stop recording Macro
    event.sender.send("recording_stopped", 0);
  });

  ipcMain.on("load_files", (event, arg) => {
    for (let i = 0; i < FILES_DB.data.length; i++) {
      if (FILES_DB.data[i].key === "scheme") { continue }
      if (!fs.existsSync(FILES_DB.data[i].value.fullPath)) { continue }
      let info = path.parse(FILES_DB.data[i].value.fullPath);
      info.content = fs.readFileSync(FILES_DB.data[i].value.fullPath, "utf-8");
      info.fullPath = FILES_DB.data[i].value.fullPath;
      win.webContents.send("res:new_file", info);
      console.log(info);
    }
  })

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      win = createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
