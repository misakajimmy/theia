import {createProxyIdentifier} from "@theia/plugin-ext/lib/common/rpc-protocol";
import {SerialOptions, SerialPortFilter} from "@wm/webserial/lib/common/webserial-control";

export interface DsWebSerial {
    requestPort(filters?: SerialPortFilter[]): Promise<boolean>;

    openSerialPort(serialOptions?: SerialOptions): Promise<boolean>;

    disconnect(): Promise<boolean>;

    write(data: Uint8Array | string, length?: number): Promise<void>;

    onData(channel: string): number[];

    openTerminal(): Promise<void>;

    closeTerminal(): boolean;

    connected(): boolean;

    terminalOpened(): boolean;

    writeListData(data: number[]): Promise<void>;

    clearData(channel: string): void;
}

export interface DsWebSerialMain {
    $requestPort(filters?: SerialPortFilter[]): Promise<boolean>;

    $openSerialPort(serialOptions?: SerialOptions): Promise<boolean>;

    $disconnect(): Promise<boolean>;

    $write(data: Uint8Array | string, length?: number): Promise<void>;

    $onData(channel: string): number[];

    $openTerminal(): Promise<void>;

    $closeTerminal(): boolean;

    $connected(): boolean;

    $terminalOpened(): boolean;

    $writeListData(data: number[]): Promise<void>;

    $clearData(channel: string): void;
}

export interface DsDialog {
    processBar: DsDialogProcessBar;
    message: DsDialogMessage;
}

export interface DsDialogProcessBar {
    open(style: string): void;

    setPercent(percent: number): void;

    setTitle(title: string): void;

    removeCloseButtom(): void;

    close(): void;

    setContent(innerHTML: string): void;
}

export interface DsDialogMessage {
    open(): void;

    setTitle(title: string): void;

    closeButtom(): void;

    setContent(innerHTML: string): void;

    close(): void;
}

export interface DsDialogMain {
    $processBarOpen(style: string): void;

    $processBarSetPercent(percent: number): void;

    $processBarSetTitle(title: string): void;

    $processBarRemoveCloseButtom(): void;

    $processBarClose(): void;

    $processBarSetContent(innerHTML: string): void;

    $messageOpen(): void;

    $messageSetTitle(title: string): void;

    $messageCloseButtom(): void;

    $messageSetContent(innerHTML: string): void;

    $messageClose(): void;
}

export const PLUGIN_RPC_CONTEXT = {
    DS_WEBSERIAL: createProxyIdentifier<DsWebSerial>('DsWebSerial'),
    DS_WEBSERIAL_MAIN: createProxyIdentifier<DsWebSerialMain>('DsWebSerialMain'),
    DS_DIALOG: createProxyIdentifier<DsDialog>('DsDialog'),
    DS_DIALOG_MAIN: createProxyIdentifier<DsDialogMain>('DsDialogMain'),
}
