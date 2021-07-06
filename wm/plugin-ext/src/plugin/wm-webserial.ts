import {DsWebSerial, DsWebSerialMain, PLUGIN_RPC_CONTEXT} from "../common/wm-protocol";
import {RPCProtocol} from "@theia/plugin-ext/lib/common/rpc-protocol";
import {SerialOptions, SerialPortFilter} from "@wm/webserial/lib/common/webserial-control";

export class DsWebserialImpl implements DsWebSerial {
    private readonly webSerialMain: DsWebSerialMain;

    constructor(rpc: RPCProtocol) {
        this.webSerialMain = rpc.getProxy(PLUGIN_RPC_CONTEXT.DS_WEBSERIAL_MAIN);
    }

    requestPort(filters?: SerialPortFilter[]): Promise<boolean> {
        return this.webSerialMain.$requestPort(filters);
    }

    openSerialPort(serialOptions?: SerialOptions): Promise<boolean> {
        return this.webSerialMain.$openSerialPort(serialOptions);
    }

    disconnect(): Promise<boolean> {
        return this.webSerialMain.$disconnect();
    }

    write(data: Uint8Array | string, length?: number): Promise<void> {
        return this.webSerialMain.$write(data);
    }

    onData(channel: string): number[]{
        return this.webSerialMain.$onData(channel);
    }

    openTerminal(): Promise<void> {
        return this.webSerialMain.$openTerminal();
    }

    closeTerminal(): boolean {
        return this.webSerialMain.$closeTerminal();
    }

    connected(): boolean {
        return this.webSerialMain.$connected();
    }

    terminalOpened(): boolean {
        return this.webSerialMain.$terminalOpened();
    }

    writeListData(data: number[]): Promise<void> {
        return  this.webSerialMain.$writeListData(data);
    }

    clearData(channel: string): void {
        return this.webSerialMain.$clearData(channel);
    }
}
