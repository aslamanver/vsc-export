const vscode = require('vscode');
const fs = require('fs');
const { exec } = require("child_process");

const rootPath = vscode.workspace.workspaceFolders[0].uri.path;
const logFile = '.vsclog';
const terminalHideFromUser = true;

var terminal = vscode.window.createTerminal({ name: 'VSC Export', hideFromUser: terminalHideFromUser });
var reportPanel;
var reportText, reportHead = `<h4>VSC Extensions | Export & Import</h4> <hr/> <br/>`;
var reportTitle = `VSC Extension - Report | `;
var isPanelActive = false;

function activate(context) {

	console.log('Congratulations, your extension "vsc-export" is now active!');

	let exportCommand = vscode.commands.registerCommand('extension.vsc-export', function () {
		if (process.platform == 'win32') {
			exec('where  powershell', (err, stdout) => {
				if (!err) {
					terminal.dispose();
					terminal = vscode.window.createTerminal({
						name: 'VSC Export',
						shellPath: stdout.trim(),
						hideFromUser: terminalHideFromUser
					});
				}
				exportExtsTerminal();
			});
		} else {
			exportExtsTerminal();
		}
	});

	let importCommand = vscode.commands.registerCommand('extension.vsc-import', function () {
		if (process.platform == 'win32') {
			exec('where  powershell', (err, stdout) => {
				if (!err) {
					terminal.dispose();
					terminal = vscode.window.createTerminal({
						name: 'VSC Export',
						shellPath: stdout.trim(),
						hideFromUser: terminalHideFromUser
					});
				}
				importExtsTerminal();
			});
		} else {
			importExtsTerminal();
		}
	});

	context.subscriptions.push(exportCommand);
	context.subscriptions.push(importCommand);
}

function deactivate() { }

function importExtsTerminal(extensions, index) {

	if (extensions == null) {

		watchFile("Import")

		terminal.sendText(`echo 'START\n' > ${logFile}`);
		terminal.sendText(`echo 'Importing...\n' >> ${logFile}`);

		vscode.window.setStatusBarMessage(`Please wait, importing...`);
		updateReport(`Importing...`, `Please wait, importing...`, true);

		fs.readFile(rootPath + '/vsc-extensions.txt', process.platform == 'win32' ? 'ucs2' : 'utf-8', function (err, data) {
			if (!err) {
				terminal.sendText(`echo 'Importing from 'vsc-extensions.txt'...\n' >> ${logFile}`);
				importExtsTerminal(data.trim().split("\n"), 0);
			} else {
				terminal.sendText(`echo 'Import failed' >> ${logFile}`);
				terminal.sendText(`echo '\nEND' >> ${logFile}`);
			}
		});
		return;
	}

	if (extensions.length > 0) {
		if (index < extensions.length) {
			if (extensions[index].length > 2) {
				if (extensions[index] == "aslamanver.vsc-export") {
					index++
					importExtsTerminal(extensions, index);
					return;
				}
				terminal.sendText(`code --install-extension '${extensions[index]}' >> ${logFile}`);
				terminal.sendText(`echo '${extensions[index]}' >> ${logFile}`);
				terminal.processId.then(() => {
					index++
					importExtsTerminal(extensions, index);
				});
			}
		} else {
			terminal.sendText(`echo 'Successfully imported' >> ${logFile}`);
			terminal.sendText(`echo '\nEND' >> ${logFile}`);
		}
	}
}

function exportExtsTerminal() {

	terminal.sendText(`echo 'START\n' > ${logFile}`);
	terminal.sendText(`echo 'Exporting...\n' >> ${logFile}`);

	vscode.window.setStatusBarMessage(`Please wait, exporting...`);
	updateReport(`Exporting...`, `Please wait, exporting...`, true);

	// terminal.sendText(`code --list-extensions | sed '' > vsc-extensions.txt`);

	exec(`code --list-extensions | sed ''`, (stderr, stdout) => {
		if (!stderr) {
			fs.writeFile(`${rootPath}/vsc-extensions.txt`, stdout, (stderr2) => {
				if (!stderr2) {
					terminal.sendText(`echo 'Successfully exported' >> ${logFile}`);
				} else {
					terminal.sendText(`echo 'Export failed' >> ${logFile}`);
				}
				terminal.sendText(`echo '\nEND' >> ${logFile}`);
			});
		} else {
			terminal.sendText(`echo 'Export failed' >> ${logFile}`);
			terminal.sendText(`echo '\nEND' >> ${logFile}`);
		}
	});

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

	fs.watchFile(rootPath + `/${logFile}`, (curr, prev) => {

		fs.readFile(rootPath + `/${logFile}`, process.platform == 'win32' ? 'ucs2' : 'utf-8', function (err, data) {

			if (data.includes('END')) {

				fs.unwatchFile(rootPath + `/${logFile}`);
				fs.unlinkSync(rootPath + `/${logFile}`);

				// let msg = title == 'Import' ? 'imported' : 'exported';
				vscode.window.setStatusBarMessage(data.split('\n')[data.split('\n').length - 4]);
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
