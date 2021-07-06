import {inject, injectable} from "inversify";
import {Command, CommandContribution, CommandRegistry} from "@theia/core/lib/common";
import {TestDialog} from "./test-dialog";
import {NyanProcessBarDialog} from "./process-bars/nyan-process-bar/nyan-process-bar-dialog";
import {DialogMessage} from "./message/dialog-message";

export namespace DialogCommands {
    const DIALOG_CATEGORY = 'Dialog';
    export const TEST: Command = {
        id: 'dialog:test',
        category: DIALOG_CATEGORY,
        label: 'test',
    };
    export const NYAN: Command = {
        id: 'dialog:nyan',
        category: DIALOG_CATEGORY,
        label: 'nyan',
    }
}

@injectable()
export class DialogContribution implements CommandContribution {

    constructor(
        @inject(TestDialog) protected readonly testDialog: TestDialog,
        @inject(DialogMessage) protected readonly dialogMessage: DialogMessage,
        @inject(NyanProcessBarDialog) protected readonly nyanProcessBarDialog: NyanProcessBarDialog,
    ) {
    }

    registerCommands(commandRegistry: CommandRegistry) {
        commandRegistry.registerCommand(DialogCommands.TEST, {
            execute: () => this.showDialog()
        });
        commandRegistry.registerCommand(DialogCommands.NYAN, {
            execute: () => this.showNyanProcessBar()
        });
    }

    private showDialog() {
        this.testDialog.open();
    }

    private showNyanProcessBar() {
        this.nyanProcessBarDialog.open();
        this.nyanProcessBarDialog.setPercent(1);
        this.nyanProcessBarDialog.setTitle("hello");
        this.nyanProcessBarDialog.removeCloseButtom();
    }

    processBarOpen(style: string) {
        console.log(style);
        this.nyanProcessBarDialog.open();
    }

    processBarSetPercent(percent: number) {
        this.nyanProcessBarDialog.setPercent(percent);
    }

    processBarSetTitle(title: string) {
        this.nyanProcessBarDialog.setTitle(title);
    }

    processBarRemoveCloseButtom() {
        this.nyanProcessBarDialog.removeCloseButtom();
    }

    processBarClose() {
        this.nyanProcessBarDialog.close();
    }

    processBarSetContent(innerHTML: string) {
        let body = document.getElementsByClassName("dialogContent").item(0);
        if (body !== null) {
            body.innerHTML = innerHTML;
        }
    }

    messageOpen() {
        this.dialogMessage.open();
    }

    messageSetTitle(title: string) {
        this.dialogMessage.setTitle(title);
    }

    messageCloseButtom() {
        this.dialogMessage.removeCloseButtom();
    }

    messageSetContent(innerHTML: string) {
        this.dialogMessage.setContent(innerHTML);
    }

    messageClose() {
        this.dialogMessage.close();
    }
}
