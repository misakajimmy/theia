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
    const wmWebSerialImpl = rpc.set(PLUGIN_RPC_CONTEXT.DS_WEBSERIAL, new DsWebserialImpl(rpc));
    const wmDialogImpl = rpc.set(PLUGIN_RPC_CONTEXT.DS_DIALOG, new DsDialogImpl(rpc));

    return function (plugin: Plugin): typeof wm {
        const webserial: typeof wm.webserial = {

            requestPort(filters?: SerialPortFilter[]): Promise<boolean> {
                return wmWebSerialImpl.requestPort(filters);
            },

            openSerialPort(serialOptions?: SerialOptions): Promise<boolean> {
                return wmWebSerialImpl.openSerialPort(serialOptions);
            },

            disconnect(): Promise<boolean> {
                return wmWebSerialImpl.disconnect();
            },

            write(data: Uint8Array | string, length?: number): Promise<void> {
                return wmWebSerialImpl.write(data);
            },

            onData(channel: string): number[] {
                return wmWebSerialImpl.onData(channel);
            },

            openTerminal(): Promise<void> {
                return wmWebSerialImpl.openTerminal();
            },

            closeTerminal(): boolean {
                return wmWebSerialImpl.closeTerminal();
            },

            connected(): boolean {
                return wmWebSerialImpl.connected();
            },

            terminalOpened(): boolean {
                return wmWebSerialImpl.terminalOpened();
            },

            writeListData(data: number[]): Promise<void> {
                return wmWebSerialImpl.writeListData(data);
            },

            clearData(channel: string): void {
                return wmWebSerialImpl.clearData(channel);
            }
        };

        const processBar: typeof wm.dialog.processBar = {
            open(style: string): void {
                return wmDialogImpl.processBarOpen(style);
            },
            setPercent(percent: number): void {
                return wmDialogImpl.processBarSetPercent(percent);
            },
            setTitle(title: string): void {
                return wmDialogImpl.processBarSetTitle(title);
            },
            removeCloseButtom(): void {
                return wmDialogImpl.processBarRemoveCloseButtom();
            },
            close(): void {
                return wmDialogImpl.processBarClose();
            },
            setContent(innerHTML: string): void {
                return wmDialogImpl.processBarSetContent(innerHTML);
            }
        };

        const message: typeof wm.dialog.message = {
            open():void {
                return wmDialogImpl.messageOpen();
            },
            setTitle(title: string): void {
                return wmDialogImpl.messageSetTitle(title);
            },
            closeButtom(): void {
                return wmDialogImpl.messageCloseButtom();
            },
            setContent(innerHTML: string): void {
                return wmDialogImpl.messageSetContent(innerHTML);
            },
            close(): void {
                return wmDialogImpl.messageClose();
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
