let electron = require("electron");
//#region src/preload.ts
electron.contextBridge.exposeInMainWorld("Projects", {
	sendTemp: (text) => {
		console.log("ContextBridge have sent");
		electron.ipcRenderer.send("saveText", text);
	},
	getProjects: () => electron.ipcRenderer.invoke("getProjects"),
	createProject: (project_name) => electron.ipcRenderer.invoke("createProject", project_name)
});
electron.contextBridge.exposeInMainWorld("Files", {
	getResource: (path, file_name = "index.html") => electron.ipcRenderer.invoke("getResource", path, file_name),
	save: (path, new_content, file_name = "index.html") => electron.ipcRenderer.invoke("save", path, new_content, file_name),
	getResourceArray: (path, file_name = "index.html") => electron.ipcRenderer.invoke("getResourceArray", path, file_name),
	saveToPdf: (path, htmlContent) => {
		electron.ipcRenderer.invoke("saveToPdf", path, htmlContent);
	}
});
//#endregion
