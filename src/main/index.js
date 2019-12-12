import { app, BrowserWindow, dialog } from "electron"; // eslint-disable-line
import { autoUpdater } from "electron-updater";
import Vue from "vue";
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\"); // eslint-disable-line
}

let mainWindow;
const winURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:9080"
    : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 694,
    useContentSize: true,
    width: 1093,
    frame: false,
    title: "CacheMonkey",
    webPreferences: {
      devTools: true,
      webSecurity: false
    }
  });

  mainWindow.loadURL(winURL);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", () => {
  createWindow();
  autoUpdater.checkForUpdates();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.updateDownloaded = false;
app.updateFailed = false;

autoUpdater.on("update-available", info => {
  app.updateDownloading = true;
  autoUpdater.downloadUpdate();
});

autoUpdater.on("update-downloaded", info => {
  app.updateDownloaded = true;

  try {
    autoUpdater.quitAndInstall();
  } catch (error) {
    console.error('Updated failed', error);
    app.updateFailed = true;
  }
});

app.reloadApp = () => {
  autoUpdater.quitAndInstall();
};

// app.getPath('temp')

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 import { autoUpdater } from 'electron-updater'
 */

// autoUpdater.checkForUpdatesAndNotify();

// app.on("ready", () => {

//   autoUpdater.checkForUpdates();
// });

// autoUpdater.on("update-available", info => {});

// autoUpdater.on("update-downloaded", info => {});

// autoUpdater.on("checking-for-update", () => {
//   dialog.showMessageBox({
//     type: "info",
//     title: "Checking for updates",
//     message: `Checking for updates...\nFeed URL: ${autoUpdater.getFeedURL()}\nCurrent: ${
//       autoUpdater.currentVersion
//     }`
//   });
// });
// autoUpdater.on("update-available", info => {
//   dialog.showMessageBox(
//       {
//           type: "info",
//           title: "Update Available",
//           message: `New update available, would you like to update now?\n\nVersion: ${
//               info.version
//             }`,
//             buttons: ["Yes", "No"]
//           },
//           buttonIndex => {
//               if (buttonIndex == 0) {
//         autoUpdater.downloadUpdate();
//       }
//     }
//   );
// });
// autoUpdater.on("error", error => {
//   dialog.showErrorBox(
//     "Error: ",
//     error == null ? "unknown" : (error.stack || error).toString()
//   );
// });

// autoUpdater.on("update-not-available", info => {
//   dialog.showMessageBox({
//     title: "No Updates",
//     message: `Current version is already up-to-date\n\nVersion: ${info.version}`
//   });
// });

// autoUpdater.on("update-downloaded", info => {
//   dialog.showMessageBox(
//     {
//       title: "Updates Downloaded",
//       message: `Updates successfully downloaded, application will now quit...\n\nVersion: ${
//         info.version
//       }`
//     },
//     () => {
//       setImmediate(() => autoUpdate.quitAndInstall());
//     }
//   );
// });

setInterval(() => {
  // Check for updates every 30 minutes
  // Do more with this in the events above this should only call the check for updates function.

  // USE THIS FOR THE DOWNLOAD PROGRESS FOR A PROGRESS BAR (ECT)
  // https://www.electron.build/auto-update#event-download-progress
  autoUpdater.checkForUpdates();
}, 1800000);
