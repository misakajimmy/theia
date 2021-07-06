import {ContainerModule} from "inversify";
import {WmApiProvider} from "./wm-api-provider";
import {MainPluginApiProvider} from "@theia/plugin-ext";

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(WmApiProvider).toSelf().inSingletonScope();
    bind(MainPluginApiProvider).toService(WmApiProvider);
});
