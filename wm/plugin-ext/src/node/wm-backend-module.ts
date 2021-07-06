import {ContainerModule} from "inversify";
import {WmPluginApiProvider} from "./wm-plugin-api-provider";
import {ExtPluginApiProvider} from "@theia/plugin-ext/lib/common/plugin-ext-api-contribution";
import {DsPluginApiContribution} from "./wm-plugin-script-service";
import {BackendApplicationContribution} from "@theia/core/lib/node/backend-application";

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(WmPluginApiProvider).toSelf().inSingletonScope();
    bind(Symbol.for(ExtPluginApiProvider)).toService(WmPluginApiProvider);
    bind(DsPluginApiContribution).toSelf().inSingletonScope();
    bind(BackendApplicationContribution).toService(DsPluginApiContribution);
})
