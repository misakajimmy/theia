/**
 * Generated using theia-extension-generator
 */
import {
    CommandContribution,
} from "@theia/core/lib/common";
import {ContainerModule} from "inversify";
import {DialogContribution} from "./dialog-contribution";
import {TestDialog, TestDialogProps} from "./test-dialog";
import {NyanProcessBarDialog, NyanProcessBarDialogProps} from "./process-bars/nyan-process-bar/nyan-process-bar-dialog";
import {DialogService} from "./base/dialog-service";
import {DialogMessage, DialogMessageProps} from "./message/dialog-message";

export default new ContainerModule(bind => {
    // bind test test dialog
    bind(TestDialog).toSelf().inSingletonScope();
    bind(TestDialogProps).toSelf().inSingletonScope();

    // bind nyan processbar dialog
    bind(NyanProcessBarDialog).toSelf().inSingletonScope();
    bind(NyanProcessBarDialogProps).toSelf().inSingletonScope();

    bind(DialogMessage).toSelf().inSingletonScope();
    bind(DialogMessageProps).toSelf().inSingletonScope();

    bind(DialogContribution).toSelf().inSingletonScope();
    bind(DialogService).toService(DialogContribution);

    // add your contribution bindings here
    bind(CommandContribution).to(DialogContribution);
});
