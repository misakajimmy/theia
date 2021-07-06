import {DsWebSerialMain} from "../common/wm-protocol";
import {interfaces} from "inversify";
import {WebSerialService} from "@wm/webserial/lib/browser/base/webserial-service";
import {SerialOptions, SerialPortFilter} from "@wm/webserial/lib/common/webserial-control";

export class DsWebserialMainImpl implements DsWebSerialMain {
    private readonly webSerialService: WebSerialService;

    constructor(container: interfaces.Container) {
        this.webSerialService = container.get(WebSerialService);
    }

    $requestPort(filters?: SerialPortFilter[]): Promise<boolean> {
        return this.webSerialService.requestPort(filters);
    }

    $openSerialPort(serialOptions?: SerialOptions): Promise<boolean> {
        return this.webSerialService.openSerialPort(serialOptions);
    }

    $disconnect(): Promise<boolean> {
        return this.webSerialService.disconnect();
    }

    $write(data: Uint8Array | string, length?: number): Promise<void> {
        return this.webSerialService.write(data);
    }

    $onData(channel: string): number[]{
        return this.webSerialService.onData(channel);
    }

    $openTerminal(): Promise<void> {
        return this.webSerialService.openTerminal();
    }

    $closeTerminal(): boolean {
        return this.webSerialService.closeTerminal();
    }

    $connected(): boolean {
        return this.webSerialService.connected();
    }

    $terminalOpened(): boolean{
        return this.webSerialService.terminalOpened();
    }

    $writeListData(data: number[]): Promise<void>  {
        return this.webSerialService.writeListData(data);
    }

    $clearData(channel: string): void {
        return this.webSerialService.clearData(channel);
    }
}
