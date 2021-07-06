import {ReactDialog} from "@theia/core/lib/browser/dialogs/react-dialog";
import {inject, injectable} from "inversify";
import * as React from "react";
import {DialogProps} from "@theia/core/lib/browser";

@injectable()
export class TestDialogProps extends DialogProps {
}

@injectable()
export class TestDialog extends ReactDialog<void> {

    constructor(
        @inject(TestDialogProps) protected readonly props: TestDialogProps,
    ) {
        super({
            title: "hello",
        });
    }

    protected render(): React.ReactNode {
        return <div>
            hello
        </div>;
    }

    get value(): void {
        return undefined;
    }

}
