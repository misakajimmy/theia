import { injectable, interfaces } from 'inversify';

import {MainPluginApiProvider} from "@theia/plugin-ext";
import {RPCProtocol} from "@theia/plugin-ext/lib/common/rpc-protocol";
import {PLUGIN_RPC_CONTEXT} from "../common/wm-protocol";
import {DsWebserialMainImpl} from "./wm-webserial-main";
import {DsDialogMainImpl} from "./wm-dialog-main";

@injectable()
export class WmApiProvider implements MainPluginApiProvider {
    initialize(rpc: RPCProtocol, container: interfaces.Container) {
        rpc.set(PLUGIN_RPC_CONTEXT.DS_WEBSERIAL_MAIN, new DsWebserialMainImpl(container));
        rpc.set(PLUGIN_RPC_CONTEXT.DS_DIALOG_MAIN, new DsDialogMainImpl(container));
    }
}
