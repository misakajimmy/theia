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
    const dsApiFactory = createAPIFactory(rpc);
    const handler = {
        get: (target: any, name: string) => {
            console.log(name);
            const plugin = plugins.get(name);
            if (plugin) {
                let apiImpl = pluginsApiImpl.get(plugin.model.id);
                if (!apiImpl) {
                    apiImpl = dsApiFactory(plugin);
                    pluginsApiImpl.set(plugin.model.id, apiImpl);
                }
                console.log(apiImpl);
                return apiImpl;
            }

            if (!defaultApi) {
                defaultApi = dsApiFactory(emptyPlugin);
            }

            return defaultApi;
        },
    };
    console.log(ctx.ds);
    console.log(ctx.theia);
    ctx['ds'] = new Proxy(Object.create(null), handler);
    console.log(dsApiFactory)
    console.log(ctx.ds.Handler);
    console.log(ctx.theia.Handler);
};
