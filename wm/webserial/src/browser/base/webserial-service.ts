import {SerialOptions, SerialPortFilter} from "../../common/webserial-control";

export const WebSerialService = Symbol('WebSerialService');

export interface WebSerialService {
    requestPort(filters?: SerialPortFilter[]): Promise<boolean>;

    openSerialPort(serialOptions?: SerialOptions): Promise<boolean>;

    connected(): boolean;

    disconnect(): Promise<boolean>;

    write(data: Uint8Array | string, length?: number): Promise<void>;

    writeListData(data: number[]): Promise<void>;

    onData(channel: string): number[];

    openTerminal(): Promise<void>;

    closeTerminal(): boolean;

    terminalOpened(): boolean;

    clearData(channel: string): void;
}
