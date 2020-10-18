const { ipcRenderer } = require("electron");

const $body = document.getElementsByTagName("body");
const $list = document.getElementById("file-list");
const $explorer_btn = document.getElementById("explorer");

$explorer_btn.addEventListener("click", () => {
  ipcRenderer.send("folderExplorer");
});

ipcRenderer.on("folderList", (e, arg) => {
  const $fragment = document.createDocumentFragment();
  $list.textContent = "";
  arg.map((item, index) => {
    const itemList = document.createElement("li");
    itemList.append(`${index}.${item}`);
    $fragment.append(itemList);
  });
  $list.append($fragment);
});
