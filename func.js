const fs = require("fs");
const path = require("path");

const hiddenReg = /^(?!\.|node_modules|config).+/; // 숨김 폴더와 node_modules는 제외하는 정규식

module.exports = {
  /**
   * @description 파일을 받아서 폴더인지 아닌지 판별하여, 파일인경우 script파일들만 넣어준다.
   * @param {*} selectPath
   * @param {*} filePush
   */
  jsFilePush(selectPath, filePush) {
    fs.readdirSync(selectPath).forEach((underFile) => {
      // selectPath는 서치하는 경로 기준
      const resultPath = `${selectPath}/${path.basename(underFile)}`;

      // 스크립트 파일 확인 (mjs, js, jsx, ts, tsx)
      // const scriptReg = /.?\.+(m?(js|x)+|(ts|x)+)$/;
      const scriptReg = /.?\.+(m?(js|x)+|(ts|x)+)$/;
      // fs.lstatSync를 통해서 파일인지 디렉토리인지 확인 디렉터리라면 숨김폴더나 node_modules가 아닌지 확인
      if (
        scriptReg.test(path.extname(underFile)) ||
        (!fs.lstatSync(resultPath).isFile() &&
          hiddenReg.test(path.basename(underFile))) // 스크립트 파일의 경우에는 배열에 담아준다. 폴더이면서 .이 앞에 붙는 숨김 파일을 제외하고 출력
      ) {
        if (!filePush(resultPath)) {
          // 파일이 아니라 폴더가 나오면 다시 한번 더 돌려
          module.exports.recursiveFileExplorer([resultPath], filePush);
        }
      }
    });
  },
  /**
   * @description main에서 호출해준다.
   * @param {*} filePaths
   * @param {*} callback
   */
  recursiveFileExplorer(filePaths, callback) {
    // 파일 패스를 배열로 받은다음 처리하자
    filePaths.forEach((selectPath) => {
      module.exports.jsFilePush(selectPath, callback);
    });
  },
};
