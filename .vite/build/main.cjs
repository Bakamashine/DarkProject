//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let electron = require("electron");
let path = require("path");
let fs = require("fs");
fs = __toESM(fs);
let node_url = require("node:url");
let node_path = require("node:path");
let node_fs_promises = require("node:fs/promises");
//#region src/main.ts
var isDev = !electron.app.isPackaged;
var env_scheme = { startPage: 1 };
var project_dir = "projects";
var __filename$1 = (0, node_url.fileURLToPath)({}.url);
var __dirname$1 = (0, node_path.dirname)(__filename$1);
var convertObjectToString = (scheme) => {
	let temp_string = "";
	for (const [key, value] of Object.entries(env_scheme)) temp_string += `${key}=${value}\n`;
	return temp_string;
};
var getBasicPath = (path, file_name = "index.html") => `${project_dir}/${path}/${file_name}`;
function createWindow() {
	const win = new electron.BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: true,
			preload: (0, path.join)(__dirname$1, "../preload/index.mjs"),
			devTools: true
		}
	});
	if (isDev && process.env["ELECTRON_RENDERER_URL"]) win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	else win.loadFile((0, path.join)(__dirname$1, "../renderer/index.html"));
	win.webContents.on("before-input-event", (_event, input) => {
		if (input.type === "keyDown" && (input.control || input.meta) && !input.alt && input.key.toLowerCase() === "r") _event.preventDefault();
	});
	fs.default.mkdirSync(project_dir, { recursive: true });
}
electron.ipcMain.handle("getProjects", async () => {
	const dirs = await fs.default.promises.readdir(project_dir);
	console.log("Get all projects: ", dirs);
	return dirs;
});
electron.ipcMain.handle("createProject", async (_, project_name) => {
	try {
		const _path = `${project_dir}/${project_name}`;
		await fs.default.promises.mkdir(_path);
		await fs.default.promises.access(_path);
		await fs.default.promises.writeFile(`${_path}/.env`, convertObjectToString(env_scheme));
		return project_name;
	} catch (err) {
		console.log(err);
		return null;
	}
});
electron.ipcMain.handle("getResource", async (_, path, file_name = "index.html") => {
	try {
		const res = await fs.default.promises.readFile(`${project_dir}/${path}/${file_name}`, "utf-8");
		console.log("getResource: ", res);
		return res;
	} catch (e) {
		console.log(e);
		return null;
	}
});
electron.ipcMain.handle("save", async (_, path, new_content, file_name) => {
	try {
		await fs.default.promises.writeFile(`${project_dir}/${path}/${file_name}`, new_content);
		console.log("file successfully updated!");
		return true;
	} catch (e) {
		console.log(e);
		return false;
	}
});
electron.ipcMain.handle("getResourceArray", async (_, path, file_name) => {
	try {
		const str_array = await (0, node_fs_promises.open)(getBasicPath(path));
		const temp_arr = [];
		for await (const line of str_array.readLines()) temp_arr.push(line);
		return temp_arr;
	} catch (e) {
		console.log(e);
		return null;
	}
});
electron.ipcMain.handle("saveToPdf", async (_, _path, htmlContent) => {
	const pdfPath = getBasicPath(_path, "main.pdf");
	const printWindow = new electron.BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true
		}
	});
	const styledHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 5mm 5mm 5mm 20mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Times New Roman", Times, serif; font-size: 14pt; }
    .page { page-break-after: always; width: 100%; }
    .page:last-child { page-break-after: auto; }
    .border { border: 1px solid #000; padding: 10px; min-height: 287mm; display: flex; flex-direction: column; }
    .title-one { text-align: center; font-size: 18pt; font-weight: bold; margin: 20px 0; }
    .stamp { margin: auto -10px -10px; height: 70px; border-top: 1px solid #000; display: flex; }
    .left { width: 270px; flex-shrink: 0; display: flex; flex-direction: column; }
    .left-top { height: 40px; border-bottom: 1px solid #000; display: grid; grid-template-columns: 40px 45px 90px 50px 45px; }
    .left-top div { border-right: 1px solid #000; }
    .left-top div:last-child { border-right: none; }
    .left-bottom { flex: 1; display: grid; grid-template-columns: 40px 45px 90px 50px 45px; }
    .left-bottom div { border-right: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 9pt; text-align: center; }
    .left-bottom div:last-child { border-right: none; }
    .center { flex: 1; border-left: 1px solid #000; border-right: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 10pt; }
    .right { width: 48px; flex-shrink: 0; display: flex; flex-direction: column; }
    .right-top { height: 22px; border-bottom: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 9pt; }
    .right-bottom { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 10pt; }
    img {width: 200px; height: 200px;}
    .img-one {width: 500px; height: 500px;}
  </style>
</head>
<body>${htmlContent}</body>
</html>`;
	await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(styledHtml)}`);
	const data = await printWindow.webContents.printToPDF({
		margins: {
			top: .19685,
			bottom: .19685,
			right: .19685,
			left: .7874
		},
		pageSize: "A4",
		printBackground: true,
		landscape: false
	});
	if (data) {
		await fs.default.promises.writeFile(pdfPath, data, { flag: "w" });
		console.log("PDF saved to", pdfPath);
	}
	printWindow.close();
});
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
	if (process.platform !== "darwin") electron.app.quit();
});
//#endregion
