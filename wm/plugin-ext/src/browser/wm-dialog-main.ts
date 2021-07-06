import {DsDialogMain} from "../common/wm-protocol";
import {DialogService} from "@wm/dialog/lib/browser/base/dialog-service";
import {interfaces} from "inversify";

export class DsDialogMainImpl implements DsDialogMain {
    private readonly dialogService: DialogService;

    constructor(container: interfaces.Container) {
        this.dialogService = container.get(DialogService)
    }

    $processBarOpen(style: string) {
        this.dialogService.processBarOpen(style);
        return;
    }

    $processBarSetPercent(percent: number): void {
        this.dialogService.processBarSetPercent(percent);
        return;
    }

    $processBarSetTitle(title: string): void {
        this.dialogService.processBarSetTitle(title);
        return;
    }

    $processBarRemoveCloseButtom(): void {
        this.dialogService.processBarRemoveCloseButtom();
        return;
    }

    $processBarClose(): void {
        this.dialogService.processBarClose();
        return
    }

    $processBarSetContent(innerHTML: string) {
        this.dialogService.processBarSetContent(innerHTML);
        return;
    }

    $messageOpen(): void {
        this.dialogService.messageOpen();
        return;
    }

    $messageSetTitle(title: string): void {
        this.dialogService.messageSetTitle(title);
    }

    $messageCloseButtom(): void {
        this.dialogService.messageCloseButtom();
    }

    $messageSetContent(innerHTML: string): void {
        this.dialogService.messageSetContent(innerHTML);
    }

    $messageClose(): void {
        this.dialogService.messageClose();
    }
}
