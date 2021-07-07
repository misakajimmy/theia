import * as theia from '@theia/plugin';
import { webserial } from "@wm/plugin";
import { Hiburn } from "./hiburn";

const commands = {
    burnUploadCommand: {
        id: "waffle.nano.burn.upload",
        label: "waffle nano:upload"
    },
    burnBreakCommand: {
        id: "waffle.nano.burn.break",
        label: "waffle nano:break",
    }
}

const baudRate = 921600;
const hiburn: Hiburn = new Hiburn();

export function start(context: theia.PluginContext) {
    context.subscriptions.push(
        theia.commands.registerCommand(commands.burnUploadCommand, async (...args: any[]) => {
            if (args[0]?.fsPath && webserial.connected()) {
                let uri = theia.Uri.parse(args[0].fsPath);
                await hiburn.uploadFirmware(uri, baudRate);
            }
        })
    );

    context.subscriptions.push(
        theia.commands.registerCommand(commands.burnBreakCommand, async (...args: any) => {
            hiburn.setBreak();
        })
    );
}

export function stop() {

}
