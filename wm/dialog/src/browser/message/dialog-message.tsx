import {inject, injectable} from "inversify";
import {DialogProps} from "@theia/core/lib/browser";
import {ReactDialog} from "@theia/core/lib/browser/dialogs/react-dialog";
import * as React from "react";

@injectable()
export class DialogMessageProps extends DialogProps {

}

@injectable()
export class DialogMessage extends ReactDialog<void> {
    constructor(
        @inject(DialogMessageProps) protected readonly props: DialogMessageProps,
    ) {
        super({
            title: "Message"
        });
    }

    protected render(): JSX.Element {
        return <div>
        </div>;
    }

    public setTitle(title: string) {
        let dialogTitle = document.getElementsByClassName("dialogTitle");
        let titleElement = dialogTitle.item(0);
        if (titleElement !== null && titleElement.innerHTML !== null) {
            if (titleElement.firstChild !== null) {
                titleElement.firstChild.textContent = title;
            }
        }
    }

    public setContent(innerHTML: string) {
        let body = document.getElementsByClassName("dialogContent").item(0);
        if (body !== null) {
            body.innerHTML = innerHTML;
        }
    }

    public removeCloseButtom() {
        let dialogTitle = document.getElementsByClassName("dialogTitle");
        let titleElement = dialogTitle.item(0);
        if (titleElement !== null && titleElement.innerHTML !== null) {
            if (titleElement.lastChild !== null) {
                titleElement.lastChild.remove();
            }
        }
    }

    get value(): void {
        return undefined;
    }
}
