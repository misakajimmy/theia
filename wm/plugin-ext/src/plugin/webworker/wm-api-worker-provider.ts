import * as wm from "@wm/plugin";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import {ExtPluginApiFrontendInitializationFn} from "@theia/plugin-ext";
import {Plugin, emptyPlugin} from "@theia/plugin-ext/lib/common/plugin-api-rpc";
import {createAPIFactory} from "../wm-api";
import {RPCProtocol} from "@theia/plugin-ext/lib/common/rpc-protocol";

const ctx = self as any;
const pluginsApiImpl = new Map<string, typeof wm>();
let defaultApi: typeof wm;

export const initializeApi: ExtPluginApiFrontendInitializationFn = (rpc: RPCProtocol, plugins: Map<string, Plugin>) => {
    const wmApiFactory = createAPIFactory(rpc);
    const handler = {
        get: (target: any, name: string) => {
            console.log(name);
            const plugin = plugins.get(name);
            if (plugin) {
                let apiImpl = pluginsApiImpl.get(plugin.model.id);
                if (!apiImpl) {
                    apiImpl = wmApiFactory(plugin);
                    pluginsApiImpl.set(plugin.model.id, apiImpl);
                }
                console.log(apiImpl);
                return apiImpl;
            }

            if (!defaultApi) {
                defaultApi = wmApiFactory(emptyPlugin);
            }

            return defaultApi;
        },
    };
    console.log(ctx.wm);
    console.log(ctx.theia);
    ctx['wm'] = new Proxy(Object.create(null), handler);
    console.log(wmApiFactory)
    console.log(ctx.wm.Handler);
    console.log(ctx.theia.Handler);
};
