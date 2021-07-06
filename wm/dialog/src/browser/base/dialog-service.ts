export const DialogService = Symbol('DialogService');

export interface DialogService {
    processBarOpen(style: string): void;

    processBarSetPercent(percent: number): void;

    processBarSetTitle(title: string): void;

    processBarRemoveCloseButtom(): void;

    processBarClose(): void;

    processBarSetContent(innerHTML: string): void;

    messageOpen(): void;

    messageSetTitle(title: string): void;

    messageCloseButtom(): void;

    messageSetContent(innerHTML: string): void;

    messageClose(): void;
}
