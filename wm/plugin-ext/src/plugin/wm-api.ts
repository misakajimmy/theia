import * as wm from "@wm/plugin";
import {Plugin} from '@theia/plugin-ext/lib/common/plugin-api-rpc';
import {RPCProtocol} from "@theia/plugin-ext/lib/common/rpc-protocol";
import {PLUGIN_RPC_CONTEXT} from "../common/wm-protocol";
import {DsWebserialImpl} from "./wm-webserial";
import {SerialOptions, SerialPortFilter} from "@wm/webserial/lib/common/webserial-control";
import {DsDialogImpl} from "./wm-dialog";

export interface DsApiFactory {
    (plugin: Plugin): typeof wm;
}

export function createAPIFactory(rpc: RPCProtocol): DsApiFactory {
    const dsWebSerialImpl = rpc.set(PLUGIN_RPC_CONTEXT.DS_WEBSERIAL, new DsWebserialImpl(rpc));
    const dsDialogImpl = rpc.set(PLUGIN_RPC_CONTEXT.DS_DIALOG, new DsDialogImpl(rpc));

    return function (plugin: Plugin): typeof wm {
        const webserial: typeof wm.webserial = {

            requestPort(filters?: SerialPortFilter[]): Promise<boolean> {
                return dsWebSerialImpl.requestPort(filters);
            },

            openSerialPort(serialOptions?: SerialOptions): Promise<boolean> {
                return dsWebSerialImpl.openSerialPort(serialOptions);
            },

            disconnect(): Promise<boolean> {
                return dsWebSerialImpl.disconnect();
            },

            write(data: Uint8Array | string, length?: number): Promise<void> {
                return dsWebSerialImpl.write(data);
            },

            onData(channel: string): number[] {
                return dsWebSerialImpl.onData(channel);
            },

            openTerminal(): Promise<void> {
                return dsWebSerialImpl.openTerminal();
            },

            closeTerminal(): boolean {
                return dsWebSerialImpl.closeTerminal();
            },

            connected(): boolean {
                return dsWebSerialImpl.connected();
            },

            terminalOpened(): boolean {
                return dsWebSerialImpl.terminalOpened();
            },

            writeListData(data: number[]): Promise<void> {
                return dsWebSerialImpl.writeListData(data);
            },

            clearData(channel: string): void {
                return dsWebSerialImpl.clearData(channel);
            }
        };

        const processBar: typeof wm.dialog.processBar = {
            open(style: string): void {
                return dsDialogImpl.processBarOpen(style);
            },
            setPercent(percent: number): void {
                return dsDialogImpl.processBarSetPercent(percent);
            },
            setTitle(title: string): void {
                return dsDialogImpl.processBarSetTitle(title);
            },
            removeCloseButtom(): void {
                return dsDialogImpl.processBarRemoveCloseButtom();
            },
            close(): void {
                return dsDialogImpl.processBarClose();
            },
            setContent(innerHTML: string): void {
                return dsDialogImpl.processBarSetContent(innerHTML);
            }
        };

        const message: typeof wm.dialog.message = {
            open():void {
                return dsDialogImpl.messageOpen();
            },
            setTitle(title: string): void {
                return dsDialogImpl.messageSetTitle(title);
            },
            closeButtom(): void {
                return dsDialogImpl.messageCloseButtom();
            },
            setContent(innerHTML: string): void {
                return dsDialogImpl.messageSetContent(innerHTML);
            },
            close(): void {
                return dsDialogImpl.messageClose();
            }
        }

        const dialog: typeof wm.dialog = {
            processBar,
            message,
        }

        return <typeof wm>{
            webserial,
            dialog
        };
    };
}
