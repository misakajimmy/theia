import {inject, injectable} from "inversify";
import {DialogProps} from "@theia/core/lib/browser";
import {ReactDialog} from "@theia/core/lib/browser/dialogs/react-dialog";
import * as React from "react";
import '../../style/nyan.css';

@injectable()
export class NyanProcessBarDialogProps extends DialogProps {

}

@injectable()
export class NyanProcessBarDialog extends ReactDialog<void> {
    percent: number;
    containerWidth: number;

    constructor(
        @inject(NyanProcessBarDialogProps) protected readonly props: NyanProcessBarDialogProps,
    ) {
        super({
            title: "Nyan"
        });
        this.percent = 0;
        this.containerWidth = 376;
    }

    protected render(): JSX.Element {
        return <div>
            <div>
                <div id="rainbowContainer">
                    <div id="rainbow"
                         style={{width: 0 + "px"}}
                    >
                        <div id="nyanCat"
                             style={{
                                 left: 0 + "px",
                             }}/>
                        <div className="clearDiv"/>
                    </div>
                </div>
            </div>
        </div>;
    }

    private rerender() {
        if (this.containerWidth === 376) {
            let containerWidth = document.getElementById('rainbowContainer')?.clientWidth;
            console.log(containerWidth);
            if (containerWidth !== undefined) {
                this.containerWidth = containerWidth;
            }
        }
        let leftPx = (this.percent > 1 ? 1 : (this.percent < 0 ? 0 : this.percent)) * this.containerWidth;
        let rainbow = document.getElementById("rainbow");
        if (rainbow !== undefined && rainbow?.style !== undefined) {
            rainbow.style.width = leftPx + "px";
        }
        let nyanCat = document.getElementById("nyanCat");
        if (nyanCat !== undefined && nyanCat?.style !== undefined) {
            nyanCat.style.left = leftPx + "px";
        }
    }

    public setPercent(percent: number) {
        this.percent = percent;
        this.rerender();
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
