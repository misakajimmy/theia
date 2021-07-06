import * as ds from "@wm/plugin";

import {ExtPluginApiBackendInitializationFn} from "@theia/plugin-ext";
import {Plugin, PluginManager, emptyPlugin} from '@theia/plugin-ext/lib/common/plugin-api-rpc';
import {RPCProtocol} from "@theia/plugin-ext/lib/common/rpc-protocol";
import {createAPIFactory} from "../wm-api";
import {DsApiFactory} from "../wm-api";

const pluginsApiImpl = new Map<string, typeof ds>();
let defaultApi: typeof ds;
let isLoadOverride = false;
let dsApiFactory: DsApiFactory;
let plugins: PluginManager;

export const provideApi: ExtPluginApiBackendInitializationFn = (rpc: RPCProtocol, pluginManager: PluginManager) => {
    dsApiFactory = createAPIFactory(rpc);
    plugins = pluginManager;

    if (!isLoadOverride) {
        overrideInternalLoad();
        isLoadOverride = true;
    }
}

function overrideInternalLoad(): void {
    const module = require('module');
    // save original load method
    const internalLoad = module._load;

    // if we try to resolve che module, return the filename entry to use cache.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    module._load = function (request: string, parent: any, isMain: {}): any {
        if (request !== '@wm/plugins') {
            return internalLoad.apply(this, arguments);
        }

        const plugin = findPlugin(parent.filename);
        if (plugin) {
            let apiImpl = pluginsApiImpl.get(plugin.model.id);
            if (!apiImpl) {
                apiImpl = dsApiFactory(plugin);
                pluginsApiImpl.set(plugin.model.id, apiImpl);
            }
            return apiImpl;
        }

        if (!defaultApi) {
            console.warn(`Could not identify plugin for 'Ds' require call from ${parent.filename}`);
            defaultApi = dsApiFactory(emptyPlugin);
        }

        return defaultApi;
    };
}


function findPlugin(filePath: string): Plugin | undefined {
    return plugins.getAllPlugins().find(plugin => filePath.startsWith(plugin.pluginFolder));
}

export default provideApi;
