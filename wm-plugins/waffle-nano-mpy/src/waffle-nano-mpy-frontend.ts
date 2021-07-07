/**
 * Generated using theia-plugin-generator
 */

import { webserial } from '@wm/plugin';
import * as theia from '@theia/plugin';

const commands = {
    webserialConnectCommand: {
        id: "waffle.nano.mpy.connect",
        label: "waffle nano:connect",
    },
    webserialDisconnectCommand: {
        id: "waffle.nano.mpy.disconnect",
        label: "waffle nano:disconnect",
    },
    webserialTerminalCommand: {
        id: "waffle.nano.mpy.terminal",
        label: "waffle nano:terminal",
    },
    mpyRunCommand: {
        id: "waffle.nano.mpy.run",
        label: "waffle nano:run",
    },
    mpyUploadCommand: {
        id: "waffle.nano.mpy.upload",
        label: "waffle nano:upload",
    },
}
const decoder = new TextDecoder();
const dataChannel = "waffle-nano-mpy";

export namespace MPY {
    export enum ReadMode {
        NONE,
        WAIT_REPL,
        WAIT_PASTE,
    }

    export enum ReadDataRe {
        NONE = "",
        WAIT_REPL = ">>>",
        WAIT_PASTE = "===",
    }
}

let readData: any;
let readMode: MPY.ReadMode;
let readOkFlag: boolean;
let breakFlag: boolean;
let actionLock: boolean = false;

async function startReadData() {
    await webserial.clearData(dataChannel);
    readData = setInterval(async () => {
        let data = await webserial.onData(dataChannel) as any;
        if (data.length > 0) {
            let dataList: number[] = [];
            for (let values of data) {
                dataList = dataList.concat(Object.values(values));
            }
            console.log(readMode);
            switch (readMode) {
                case MPY.ReadMode.NONE:
                    break;
                case MPY.ReadMode.WAIT_REPL:
                    if (decoder.decode(new Uint8Array(dataList)).search(MPY.ReadDataRe.WAIT_REPL) !== -1) {
                        readOkFlag = true;
                    }
                    break;
                case MPY.ReadMode.WAIT_PASTE:
                    if (decoder.decode(new Uint8Array(dataList)).search(MPY.ReadDataRe.WAIT_PASTE) !== -1) {
                        readOkFlag = true;
                    }
                    break;
                default:
                    break;
            }
        }
    }, 40);
}

function stopReadData() {
    clearInterval(readData);
}

function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function startRunMode() {
    await startReadData();
    breakFlag = false;
    readOkFlag = false;
    readMode = MPY.ReadMode.WAIT_REPL;
    await webserial.write(`\r\n`);
    while (!readOkFlag && !breakFlag) {
        await sleep(40);
    }

    readOkFlag = false;
    readMode = MPY.ReadMode.WAIT_PASTE;
    await webserial.writeListData([0x05]);
    while (!readOkFlag && !breakFlag) {
        await sleep(40);
    }
}

async function writeRunCode(document: theia.TextDocument) {
    let split = document.eol === theia.EndOfLine.LF ? `\n` : `\r\n`;
    let content = document.getText();
    let singleLine = content.split(split);
    readOkFlag = false;
    readMode = MPY.ReadMode.WAIT_PASTE;
    for (let line of singleLine) {
        await webserial.write(line);
        readOkFlag = false;
        await webserial.write(`\r`);
        while (!readOkFlag) {
            await sleep(40);
        }
    }
}

async function stopRunMode() {
    await webserial.writeListData([0x04]);
    readMode = MPY.ReadMode.NONE;
    stopReadData();
}

async function startUploadMode() {
    await startReadData();
    readMode = MPY.ReadMode.WAIT_REPL;
    readOkFlag = false;
    await webserial.write(`\r\n`);
    while (!readOkFlag) {
        await sleep(40);
    }
    readOkFlag = false;
    await webserial.write('import machine\r\nmachine.reset()\r\n');
    while (!readOkFlag) {
        await sleep(40);
    }
    readMode = MPY.ReadMode.NONE;
}

async function writeUploadCode(document: theia.TextDocument) {
    let split = document.eol === theia.EndOfLine.LF ? `\n` : `\r\n`;
    let content = document.getText();
    content = content?.split('"').join('\\"');
    let singleLine = content.split(split);

    readMode = MPY.ReadMode.WAIT_REPL;
    readOkFlag = false;
    await webserial.write(`\r\n`);
    while (!readOkFlag) {
        await sleep(40);
    }

    readOkFlag = false;
    await webserial.write('o = open("main.py","w")\r\n');
    while (!readOkFlag) {
        await sleep(40);
    }

    for (let i in singleLine) {
        await webserial.write('o.write("');
        await webserial.write(singleLine[i]);
        await webserial.write('\\r\\n")');
        readOkFlag = false;
        await webserial.write(`\r\n`);
        while (!readOkFlag) {
            await sleep(40);
        }
    }

    readOkFlag = false;
    await webserial.write('o.close()\r\n');
    while (!readOkFlag) {
        await sleep(40);
    }
}

async function stopUploadMode() {
    readMode = MPY.ReadMode.WAIT_REPL;
    await webserial.write('import machine\r\nmachine.reset()\r\n');
    readMode = MPY.ReadMode.NONE;
    stopReadData();
}

let connectStatusBar = theia.window.createStatusBarItem(theia.StatusBarAlignment.Left, 5);
connectStatusBar.text = "Connect";
connectStatusBar.command = "waffle.nano.mpy.connect";

let runStatusBar = theia.window.createStatusBarItem(theia.StatusBarAlignment.Left, 4);
runStatusBar.text = "Run";
runStatusBar.command = "waffle.nano.mpy.run"

let uploadStatusBar = theia.window.createStatusBarItem(theia.StatusBarAlignment.Left, 3);
uploadStatusBar.text = "Upload";
uploadStatusBar.command = "waffle.nano.mpy.upload"

export function start(context: theia.PluginContext) {

    connectStatusBar.show();

    context.subscriptions.push(
        theia.commands.registerCommand(commands.webserialConnectCommand, async (...args: any) => {
            theia.window.showInformationMessage("Please choose you device");
            if (await webserial.requestPort([
                // { usbProductId: 29987, usbVendorId: 6790 }
            ])) {
                await webserial.openSerialPort();
                connectStatusBar.text = "Disconnect";
                connectStatusBar.command = "waffle.nano.mpy.disconnect";
                runStatusBar.show();
                uploadStatusBar.show();
                theia.window.showInformationMessage("Connected to your device");
            }
        })
    );

    context.subscriptions.push(
        theia.commands.registerCommand(commands.webserialDisconnectCommand, async (...args: any) => {
            await webserial.disconnect();
            connectStatusBar.text = "Connect";
            connectStatusBar.command = "waffle.nano.mpy.connect";
            runStatusBar.hide();
            uploadStatusBar.hide();
            theia.window.showInformationMessage("serial disconnected");
        })
    );

    context.subscriptions.push(
        theia.commands.registerCommand(commands.webserialTerminalCommand, async (...arg: any) => {
            if (await webserial.terminalOpened()) {
                await webserial.closeTerminal();
            } else {
                await webserial.openTerminal();
            }
        })
    );

    context.subscriptions.push(theia.commands.registerCommand(commands.mpyRunCommand, async (...args: any) => {
        if (!actionLock) {
            actionLock = true;
            if (!(await webserial.terminalOpened())) {
                await webserial.openTerminal();
            }
            if (await webserial.connected()) {
                if (args?.fsPath) {
                    await startRunMode();
                    let document = await theia.workspace.openTextDocument(args);
                    if (document !== undefined) {
                        await writeRunCode(document);
                    }
                    await stopRunMode();
                } else {
                    let editor = theia.window.activeTextEditor;
                    if (editor?.document) {
                        await startRunMode();
                        await writeRunCode(editor.document);
                        await stopRunMode();
                    }
                }
            }
            actionLock = false;
        }
    }));

    context.subscriptions.push(theia.commands.registerCommand(commands.mpyUploadCommand, async (...args: any) => {
        if (!actionLock) {
            actionLock = true;
            if (await webserial.terminalOpened()) {
                await webserial.closeTerminal();
            }
            if (await webserial.connected()) {
                if (args?.fsPath) {
                    await startUploadMode();
                    let document = await theia.workspace.openTextDocument(args);
                    if (document !== undefined) {
                        await writeUploadCode(document);
                    }
                    await stopUploadMode();
                } else {
                    await startUploadMode();
                    let editor = theia.window.activeTextEditor;
                    if (editor?.document) {
                        await writeUploadCode(editor.document);
                    }
                    await stopUploadMode();
                }
            }
            if (!(await webserial.terminalOpened())) {
                await webserial.openTerminal();
            }
            actionLock = false;
        }
    }));
}

export function stop() {

}
