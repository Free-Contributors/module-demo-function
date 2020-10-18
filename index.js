const {
  app,
  BrowserWindow,
  Notification,
  dialog,
  ipcMain,
} = require("electron");
const func = require("./func");
let jsFileArray = [];
const path = require("path");
const fs = require("fs");

const filePush = (file) => {
  // 스크립트 파일 확인 (mjs, js, jsx, ts, tsx)
  const scriptReg = /.?\.+(m?(js|x)+|(ts|x)+)$/;
  if (scriptReg.test(path.basename(file))) {
    jsFileArray.push(file);
    return true;
  } else {
    return false;
  }
};
// folderExplorer 이벤트를 받아서 처리해준다.
ipcMain.on("folderExplorer", async (e, argument) => {
  // const res = shell.openPath(ROOT_PATH);
  const res = await dialog.showOpenDialog({
    // 파일 탐색에 대한 것
    properties: ["openDirectory", "multiSelections"],
  });

  // 사용자가 선택한 폴더들의 배열을 이용해서 탐색을 시작한다.
  jsFileArray = [];
  func.recursiveFileExplorer(res.filePaths, filePush);

  // const regex = /^(const|import).+\s+.+('|")$/gms;
  const regex = /(const.+require\(('|").+('|").+$)|(import.+\s+.+('|")$)/gms;
  const MapObj = new Map();

  jsFileArray.forEach((jsFile) => {
    fs.readFile(jsFile, "utf8", function (err, data) {
      const res = data
        .split(";")
        .filter((item) => !!item.match(regex))
        .map((item) => item.replace("(\\n/g)", "").trim());

      if (res.length > 0) {
        // obj[jsFile] = res;
        // console.log(jsFile, res);
        MapObj.set(jsFile, res);
      }
      console.log(MapObj); // 여기서는 잘찍힘...
    });
  });
  console.log(MapObj); // 여기서 하면 Map초기화된 상태임..

  e.reply("folderList", jsFileArray);
});

/**
 * @description 창열어주기
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // 웹뷰 형식으로 열어줄 html파일
  win.loadFile("index.html");

  // 푸시메시지 보내주기
  callNotification();

  // 개발자도구 열어줘
  win.webContents.openDevTools();
}

// 알림 메시지 관련 함수
function callNotification() {
  const notif = {
    title: "File Node List",
    body: "Happy Hacking",
  };
  const notice = new Notification(notif);

  notice.show();
}

// app이 준비가되면 createWindow함수 호출
app.whenReady().then(() => createWindow());

// 프로그램 닫기 버튼 클릭시 발생할 이벤트
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
