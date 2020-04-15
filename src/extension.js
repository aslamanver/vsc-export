const vscode = require('vscode');
const fs = require('fs');
const { exec } = require("child_process");

const rootPath = vscode.workspace.rootPath;

var terminal = vscode.window.createTerminal(`VSC Export`);
var reportPanel;
var reportText, reportHead = `<h4>VSC Extensions | Export & Import</h4> <hr/> <br/>`;
var reportTitle = `VSC Extension - Report | `;
var isPanelActive = false;
var importFailed = 0;

function activate(context) {

	console.log('Congratulations, your extension "vsc-export" is now active!');

	let exportCommand = vscode.commands.registerCommand('extension.vsc-export', function () {

		if (process.platform == 'win32') {
			exec('where  powershell', (err, stdout) => {
				if (!err) {
					terminal.dispose();
					terminal = vscode.window.createTerminal(`VSC Export`, stdout.trim());
				}
				exportExtsTerminal();
			});
			return;
		}

		exportExtsTerminal();
	});

	let importCommand = vscode.commands.registerCommand('extension.vsc-import', function () {

		if (process.platform == 'win32') {
			exec('where  powershell', (err, stdout) => {
				if (!err) {
					terminal.dispose();
					terminal = vscode.window.createTerminal(`VSC Export`, stdout.trim());
				}
				importStartTerminal();
			});
			return;
		}

		importStartTerminal();
	});

	context.subscriptions.push(exportCommand);
	context.subscriptions.push(importCommand);
}

/* OLD */
function importStart() {

	importFailed = 0;

	vscode.window.setStatusBarMessage('Please wait, importing...');
	updateReport(`Importing...`, `Please wait, importing... <br/><br/>`, true);

	let rootPath = vscode.workspace.rootPath;

	fs.readFile(rootPath + '/vsc-extensions.txt', 'ucs2', function (err, data) {

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

		} else {
			vscode.window.setStatusBarMessage(`Successfully installed extensions`);
			updateReport(`Successfully imported`, `<h2> ${extensions.length - importFailed} of ${extensions.length} Successfully installed </h2>`, false);
		}
	}
}

function exportExts() {

	vscode.window.setStatusBarMessage(`Please wait, exporting...`);
	updateReport(`Exporting...`, `Please wait, exporting...`, true);

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
/* OLD */

exports.activate = activate;

function deactivate() { }

function importStartTerminal() {

	importFailed = 0;

	vscode.window.setStatusBarMessage('Please wait, importing...');
	updateReport(`Importing...`, `Please wait, importing... <br/><br/>`, true);

	fs.readFile(rootPath + '/vsc-extensions.txt', process.platform == 'win32' ? 'ucs2' : 'ucs2', function (err, data) {

		if (!err) {

			vscode.window.setStatusBarMessage(`Importing from 'vsc-extensions.txt'`);

			terminal.sendText(`echo 'START\n' > vsclog.txt`);
			terminal.sendText(`echo 'Importing from 'vsc-extensions.txt'...\n' >> vsclog.txt`);

			watchFile('Import');

			importExtsTerminal(data.trim().split("\n"), 0);

		} else {

			vscode.window.setStatusBarMessage(`Woops! smething went wrong - ${err}`);
			updateReport(`Import failed`, `Woops! smething went wrong <br/><br/> ${err}`, true);
		}

	});
}

function importExtsTerminal(extensions, index) {

	if (extensions.length > 0) {

		if (index < extensions.length) {

			if (extensions[index].length > 2) {

				if (extensions[index] == "aslamanver.vsc-export") {

					index++
					importExtsTerminal(extensions, index);

					return;
				}

				terminal.sendText(`code --install-extension '${extensions[index]}' >> vsclog.txt`);
				terminal.sendText(`echo '' >> vsclog.txt`);
				terminal.processId.then(pid => {

					index++
					importExtsTerminal(extensions, index);

				});
			}

		} else {

			terminal.sendText(`echo 'Successfully imported' >> vsclog.txt`);
			terminal.sendText(`echo '\nEND' >> vsclog.txt`);
		}
	}
}

function exportExtsTerminal() {

	terminal.sendText(`echo 'START\n' > vsclog.txt`);
	terminal.sendText(`echo 'Exporting...\n' >> vsclog.txt`);

	vscode.window.setStatusBarMessage(`Please wait, exporting...`);
	updateReport(`Exporting...`, `Please wait, exporting...`, true);

	terminal.sendText(`code --list-extensions > vsc-extensions.txt`);

	terminal.sendText(`echo 'Successfully exported' >> vsclog.txt`);
	terminal.sendText(`echo '\nEND' >> vsclog.txt`);

	watchFile('Export');
}

function updateReport(title, text, clear) {

	if (!isPanelActive) getReport();

	reportText = clear ? reportHead + text : reportText + text;
	reportPanel.webview.html = reportText + `<script>window.scrollTo(0,document.body.scrollHeight);</script>`;

	if (title) {
		reportPanel.title = reportTitle + title;
	}
}

function getReport() {

	if (isPanelActive) return reportPanel;

	reportPanel = vscode.window.createWebviewPanel('vsc-extension', reportTitle, vscode.ViewColumn.One, { enableScripts: true });

	isPanelActive = true;

	reportPanel.onDidDispose(() => {
		isPanelActive = false;
	});

	return reportPanel;
}

function watchFile(title) {

	fs.watchFile(rootPath + '/vsclog.txt', (curr, prev) => {

		fs.readFile(rootPath + '/vsclog.txt', process.platform == 'win32' ? 'ucs2' : 'ucs2', function (err, data) {

			if (data.includes('END')) {
				fs.unwatchFile(rootPath + '/vsclog.txt');
				fs.unlinkSync(rootPath + '/vsclog.txt');

				let msg = title == 'Import' ? 'imported' : 'exported';
				vscode.window.setStatusBarMessage(`Successfully ` + msg + ` extensions`);
			}

			data = '<p>' + data.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") + '</p>';

			updateReport(title, data, true);
		});
	});
}

module.exports = {
	activate,
	deactivate
}
