import {DsDialog, DsDialogMain, DsDialogMessage, DsDialogProcessBar, PLUGIN_RPC_CONTEXT} from "../common/wm-protocol";
import {RPCProtocol} from "@theia/plugin-ext/lib/common/rpc-protocol";

export class DsDialogImpl implements DsDialog {
    private readonly dialogMain: DsDialogMain;

    constructor(rpc: RPCProtocol) {
        this.dialogMain = rpc.getProxy(PLUGIN_RPC_CONTEXT.DS_DIALOG_MAIN);
    }

    processBar: DsDialogProcessBar = {
        open: this.processBarOpen,
        setTitle: this.processBarSetTitle,
        setPercent: this.processBarSetPercent,
        removeCloseButtom: this.processBarRemoveCloseButtom,
        close: this.processBarClose,
        setContent: this.processBarSetContent,
    }

    message: DsDialogMessage = {
        open: this.messageOpen,
        setTitle: this.messageSetTitle,
        setContent: this.messageSetContent,
        closeButtom: this.messageCloseButtom,
        close: this.messageClose,
    }

    processBarOpen(style: string): void {
        return this.dialogMain.$processBarOpen(style);
    }

    processBarSetPercent(percent: number): void {
        return this.dialogMain.$processBarSetPercent(percent);
    }

    processBarSetTitle(title: string): void {
        return this.dialogMain.$processBarSetTitle(title);
    }

    processBarRemoveCloseButtom(): void {
        return this.dialogMain.$processBarRemoveCloseButtom();
    }

    processBarClose(): void {
        return this.dialogMain.$processBarClose();
    }

    processBarSetContent(innerHTML: string): void {
        return this.dialogMain.$processBarSetContent(innerHTML);
    }

    messageOpen(): void {
        return this.dialogMain.$messageOpen();
    }

    messageSetTitle(title: string): void {
        return this.dialogMain.$messageSetTitle(title);
    }

    messageCloseButtom(): void {
        return this.dialogMain.$messageCloseButtom();
    }

    messageSetContent(innerHTML: string): void {
        return this.dialogMain.$messageSetContent(innerHTML);
    }

    messageClose(): void {
        return this.dialogMain.$messageClose();
    }
}
