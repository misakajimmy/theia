import 'xterm/css/xterm.css';

import {inject, injectable} from "inversify";
import {
    Command,
    CommandContribution,
    CommandRegistry,
    MAIN_MENU_BAR,
    MenuContribution,
    MenuModelRegistry,
} from "@theia/core/lib/common";
import {
    ApplicationShell,
    StatusBar,
    WidgetManager,
    WidgetOpenerOptions
} from "@theia/core/lib/browser";
import {SerialOptions, SerialPortFilter, WebSerialsControl} from "../common/webserial-control";
import {TerminalWidget, TerminalWidgetOptions} from "@theia/terminal/lib/browser/base/terminal-widget";
import {TerminalWidgetFactoryOptions} from "@theia/terminal/lib/browser/terminal-widget-impl";
import {Terminal} from 'xterm';
// @ts-ignore
import {Promise} from "bluebird";

export const TERMINAL_WIDGET_FACTORY_ID = 'terminal';

export namespace WebSerialMenus {
    export const WEBSERIAL = [...MAIN_MENU_BAR, '1_webserial'];
    export const WEBSERIAL_CONNECT = [...WEBSERIAL, '2_webserial'];
    export const WEBSERIAL_DISCONNECT = [...WEBSERIAL, '3_webserial'];
    export const WEBSERIAL_TERMINAL = [...WEBSERIAL, '4_webserial'];
}

export namespace WebSerialStatusBar {
    export const WEBSERIAL_CONNECTION = 'webserial:connection';
    export const WEBSERIAL_TERMINAL = 'webserial:terminal';
}

export namespace WebSerialCommands {
    const WEBSERIAL_CATEGORY = 'WebSerial';
    export const CONNECT: Command = {
        id: 'webserial:connect',
        category: WEBSERIAL_CATEGORY,
        label: "Connect",
    };
    export const DISCONNECT: Command = {
        id: 'webserial:disconnect',
        category: WEBSERIAL_CATEGORY,
        label: "Disconnect",
    };
    export const TERMINAL: Command = {
        id: 'webserial:terminal',
        category: WEBSERIAL_CATEGORY,
        label: "Terminal",
    }
}

interface serialData {
    [channel: string]: number[]
}

@injectable()
export class WebSerialFrontendContribution implements CommandContribution, MenuContribution {

    @inject(WebSerialsControl) protected readonly webSerialsServices: WebSerialsControl;
    @inject(WidgetManager) protected readonly widgetManager: WidgetManager;
    @inject(ApplicationShell) protected readonly shell: ApplicationShell;
    @inject(StatusBar) protected readonly statusBar: StatusBar;

    private termWidget?: TerminalWidget;
    private decoder = new TextDecoder();
    private terminalStatus: boolean;
    protected term: Terminal;

    constructor() {
        this.terminalStatus = false;
    }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(WebSerialCommands.CONNECT, {
            execute: () => this.connectWebserial()
        });
        registry.registerCommand(WebSerialCommands.DISCONNECT, {
            execute: () => this.disconnectWebserial()
        });
        registry.registerCommand(WebSerialCommands.TERMINAL, {
            execute: () => this.openTerminal()
        })
    }

    registerMenus(menus: MenuModelRegistry): void {
    }

    private setTerminalClose() {
        this.terminalStatus = false;
        // this.statusBar.setElement(WebSerialStatusBar.WEBSERIAL_TERMINAL, {
        //     text: `$(fas fa-terminal)`,
        //     alignment: StatusBarAlignment.LEFT,
        //     tooltip: "Open terminal",
        //     command: WebSerialCommands.TERMINAL.id,
        //     priority: 19,
        // })
    }

    private setTerminalOpen() {
        this.terminalStatus = true;
        // this.statusBar.setElement(WebSerialStatusBar.WEBSERIAL_TERMINAL, {
        //     text: `$(fas fa-terminal)`,
        //     alignment: StatusBarAlignment.LEFT,
        //     tooltip: "Close terminal",
        //     priority: 19,
        //     onclick: () => {
        //         this.termWidget?.close();
        //     }
        // })
    }

    protected async newTerminal(options: TerminalWidgetOptions): Promise<TerminalWidget> {
        return <TerminalWidget>await this.widgetManager.getOrCreateWidget(TERMINAL_WIDGET_FACTORY_ID, <TerminalWidgetFactoryOptions>{
            created: new Date().toString(),
            title: 'webserial',
            ...options
        });
    }

    protected async connectWebserial(): Promise<void> {
        if (await this.webSerialsServices.requestPort()) {
            if (await this.webSerialsServices.openSerialPort()) {
                this.readWebSerialData();
                this.syncReadData();
            }
        }
    }

    protected async readWebSerialData(): Promise<void> {
        let readableStream = this.webSerialsServices.getReadStream('main');
        let loop = async () => {
            if (this.webSerialsServices.access) {
                try {
                    await readableStream.read().then(({done, value}) => {
                        if (done) {
                            return;
                        }
                        // console.log(value.length);
                        if (this.termWidget) {
                            this.termWidget?.write(this.decoder.decode(value));
                        }
                    });
                } catch (e) {
                    Promise.delay(500).then(loop);
                } finally {
                    Promise.delay(20).then(loop);
                }
            }
        };
        loop();
    }

    protected async disconnectWebserial(): Promise<void> {
        await this.webSerialsServices.disconnect();
    }

    // TODO: reuse WidgetOpenHandler.open
    protected async open(widget: TerminalWidget, options?: WidgetOpenerOptions) {
        const op: WidgetOpenerOptions = {
            mode: 'activate',
            ...options,
            widgetOptions: {
                area: 'bottom',
                ...(options && options.widgetOptions)
            }
        };
        if (!widget.isAttached) {
            this.shell.addWidget(widget, op.widgetOptions);
        }
        if (op.mode === 'activate') {
            this.shell.activateWidget(widget.id);
        } else if (op.mode === 'reveal') {
            this.shell.revealWidget(widget.id);
        }
    }

    dataBuffer: serialData = {};

    protected async syncReadData() {
        let readableStream = this.webSerialsServices.getReadStream('plugin');
        let loop = async () => {
            if (this.webSerialsServices.access) {
                try {
                    await readableStream.read().then(({done, value}) => {
                        if (done) {
                            return;
                        }
                        for (let i in this.dataBuffer) {
                            this.dataBuffer[i].push(value);
                            if (this.dataBuffer[i].length > 1000) {
                                this.dataBuffer[i].slice(this.dataBuffer[i].length - 1000)
                            }
                        }
                    })
                } catch (e) {
                    Promise.delay(500).then(loop);
                } finally {
                    Promise.delay(40).then(loop);
                }
            }
        };
        loop();
    }

    async requestPort(filters?: SerialPortFilter[]): Promise<boolean> {
        return await this.webSerialsServices.requestPort(filters);
    }

    async openSerialPort(serialOptions?: SerialOptions): Promise<boolean> {
        if (await this.webSerialsServices.openSerialPort(serialOptions)) {
            this.syncReadData();
            this.readWebSerialData();
            return true;
        } else {
            return false;
        }
    }

    async disconnect(): Promise<boolean> {
        this.closeTerminal();
        if (await this.webSerialsServices.disconnect()) {
            return true;
        } else {
            return false;
        }
    }

    async write(data: Uint8Array | string, length?: number): Promise<void> {
        if (length !== undefined) {
            let arrayData = new Uint8Array(length);
            for (let i = 0; i < length; i++) {
                arrayData[i] = data[i] as number;
            }
        }
        await this.webSerialsServices.write(data);
        return;
    }

    async writeListData(data: number[]) {
        await this.webSerialsServices.write(new Uint8Array(data));
        return;
    }

    onData(channel: string): number[] {
        if (this.dataBuffer[channel] === undefined) {
            this.dataBuffer[channel] = [];
        }
        let data = this.dataBuffer[channel];
        this.dataBuffer[channel] = [];
        return data;
    }

    clearData(channel: string): void {
        this.dataBuffer[channel] = []
        return;
    }

    async openTerminal(): Promise<void> {
        this.termWidget = await this.newTerminal({
            isPseudoTerminal: true,
        });
        await this.termWidget.start();
        this.termWidget.clearOutput();
        this.open(this.termWidget);
        this.termWidget.clearOutput();
        this.termWidget.onData(e => {
            this.webSerialsServices.write(e);
        })
        this.setTerminalOpen();
    }

    closeTerminal(): boolean {
        if (this.termWidget !== undefined) {
            this.termWidget.close();
            this.setTerminalClose();
            return true;
        } else {
            return false;
        }
    }

    terminalOpened(): boolean {
        return this.terminalStatus;
    }

    connected(): boolean {
        return this.webSerialsServices.getStatus();
    }
}
