const vscode = require('vscode');
const fs = require('fs');
const { exec } = require("child_process");

const terminal = vscode.window.createTerminal(`VSC Export`);
const rootPath = vscode.workspace.rootPath;

var reportPanel;
var reportText, reportHead = `<h4>VSC Extensions | Export & Import</h4> <hr/> <br/>`;
var reportTitle = `VSC Extension - Report | `;
var isPanelActive = false;
var importFailed = 0;

function activate(context) {

	console.log('Congratulations, your extension "vsc-export" is now active!');

	let exportCommand = vscode.commands.registerCommand('extension.vsc-export', function () {

		exportExts();
	});

	let importCommand = vscode.commands.registerCommand('extension.vsc-import', function () {

		importStart();
	});

	context.subscriptions.push(exportCommand);
	context.subscriptions.push(importCommand);
}

exports.activate = activate;

function deactivate() { }

function importStart() {

	importFailed = 0;

	vscode.window.setStatusBarMessage('Please wait, importing...');
	updateReport(`Importing...`, `Please wait, importing... <br/><br/>`, true);

	fs.readFile(rootPath + '/vsc-extensions.txt', 'utf8', function (err, data) {

		if (!err) {

			vscode.window.setStatusBarMessage(`Importing from 'vsc-extensions.txt'`);
			updateReport(`Importing...`, `Importing from 'vsc-extensions.txt' <br/><br/>`, false);

			importExts(data.trim().split("\n"), 0);

		} else {
			vscode.window.setStatusBarMessage(`Woops! smething went wrong - ${err}`);
			updateReport(`Import failed`, `Woops! smething went wrong <br/><br/> ${err}`, true);
		}

	});
}

function importExts(extensions, index) {

	if (extensions.length > 0) {

		if (index < extensions.length) {

			if (extensions[index].length > 2) {

				vscode.window.setStatusBarMessage(`${index + 1} of ${extensions.length} | Importing.. ${extensions[index]}`);
				updateReport(`Importing...`, `${index + 1} of ${extensions.length} | Importing.. ${extensions[index]}`, false);

				if (extensions[index] == "aslamanver.vsc-export") {

					updateReport(`Importing...`, ` | Success <br/>`, false);

					index++
					importExts(extensions, index);

					return;
				}

				terminal.show();
				terminal.sendText(`code --install-extension ${extensions[index]}`);
				terminal.processId.then(pid => {

					updateReport(`Importing...`, ` | Success <br/>`, false);

					index++
					importExts(extensions, index);

				});

				if (false) {

					exec(`code --install-extension ${extensions[index]}`, (error, stdout, stderr) => {

						if (error) {

							importFailed++;
							vscode.window.setStatusBarMessage(`Failed to import ${extensions[index]}`);
							updateReport(`Importing...`, ` | Failed <br/>`, false);

						} else {
							updateReport(`Importing...`, ` | Success <br/>`, false);
						}

						index++
						importExts(extensions, index);
					});
				}
			}

		} else {
			vscode.window.setStatusBarMessage(`Successfully installed extensions`);
			updateReport(`Successfully imported`, `<h2> ${extensions.length - importFailed} of ${extensions.length} Successfully installed </h2>`, false);
		}
	}
}

function exportExts() {

	vscode.window.setStatusBarMessage(`Please wait, exporting...`);
	updateReport(`Exporting...`, `Please wait, exporting...`, true);

	terminal.sendText(`code --list-extensions > vsc-extensions.txt`);
	terminal.processId.then(pid => {

		let msg = `Successfully exported into 'vsc-extensions.txt'`;

		vscode.window.setStatusBarMessage(msg);
		vscode.window.showInformationMessage(msg);
		updateReport(`Successfully exported`, msg + '<br/><br/>', true);

		fs.readFile(rootPath + '/vsc-extensisons.txt', 'utf8', function (err, data) {

			if (!err) {

				let list = data.trim().split("\n");

				list.forEach((name, i) => {
					updateReport(null, `${i + 1}. ${name} <br/>`, false);
				});

			} else {

				vscode.window.setStatusBarMessage(`Woops! smething went wrong - ${err}`);
				updateReport(`Export failed`, `Woops! smething went wrong <br/><br/> ${err}`, true);
			}
		});
	});

	if (false) {

		exec("code --list-extensions", (error, stdout, stderr) => {

			if (!error) {

				let rootPath = vscode.workspace.rootPath;

				fs.writeFile(rootPath + '/vsc-extensions.txt', stdout, function (err, file) {

					if (!err) {

						let msg = `Successfully exported into 'vsc-extensions.txt'`;

						vscode.window.setStatusBarMessage(msg);
						vscode.window.showInformationMessage(msg);
						updateReport(`Successfully exported`, msg + '<br/><br/>', true);

						let list = stdout.trim().split("\n");

						list.forEach((name, i) => {
							updateReport(null, `${i + 1}. ${name} <br/>`, false);
						});

					} else {
						vscode.window.setStatusBarMessage(`Woops! smething went wrong - ${err}`);
						updateReport(`Export failed`, `Woops! smething went wrong <br/><br/> ${err}`, true);
					}
				});

			} else {
				vscode.window.setStatusBarMessage(`Woops! smething went wrong - ${stderr}`);
				updateReport(`Export failed`, `Woops! smething went wrong <br/><br/> ${stderr}`, true);
			}
		});
	}
}

function updateReport(title, text, clear) {

	if (!isPanelActive) getReport();

	reportText = clear ? reportHead + text : reportText + text;
	reportPanel.webview.html = reportText;

	if (title) {
		reportPanel.title = reportTitle + title;
	}
}

function getReport() {

	if (isPanelActive) return reportPanel;

	reportPanel = vscode.window.createWebviewPanel('vsc-extension', reportTitle, vscode.ViewColumn.One, {});

	isPanelActive = true;

	reportPanel.onDidDispose(() => {
		isPanelActive = false;
	});

	return reportPanel;
}

module.exports = {
	activate,
	deactivate
}
