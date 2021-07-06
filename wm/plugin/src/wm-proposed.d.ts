declare module '@wm/plugin' {
    export namespace webserial {
        export function requestPort(filters?: SerialPortFilter[]): Promise<boolean>;

        export function openSerialPort(serialOptions?: SerialOptions): Promise<boolean>;

        export function disconnect(): Promise<boolean>;

        export function write(data: Uint8Array | string, length?: number): Promise<void>;

        export function writeListData(data: number[]): Promise<void>;

        export function onData(channel: string): number[];

        export function openTerminal(): Promise<void>;

        export function closeTerminal(): boolean;

        export function connected(): boolean;

        export function terminalOpened(): boolean;

        export function clearData(channel: string): void;

        export interface SerialPortFilter {
            usbVendorId?: number;
            usbProductId?: number;
        }

        export interface SerialOptions {
            baudRate?: number;
            dataBits?: number;
            stopBits?: number;
            parity?: ParityType;
            bufferSize?: number;
            flowControl?: FlowControlType;
        }
    }

    export namespace dialog {
        export namespace processBar {
            function open(style: string): void;

            function setPercent(percent: number): void;

            function setTitle(title: string): void;

            function removeCloseButtom(): void;

            function close(): void;

            function setContent(innerHTML: string): void;
        }

        export namespace message {
            function open(): void;

            function setTitle(title: string): void;

            function closeButtom(): void;

            function setContent(innerHTML: string): void;

            function close(): void;
        }
    }
}
