import {injectable} from "inversify";
import { ExtPluginApi, ExtPluginApiProvider } from '@theia/plugin-ext/lib/common/plugin-ext-api-contribution';
import * as path from "path";


@injectable()
export class WmPluginApiProvider implements ExtPluginApiProvider {
    provideApi(): ExtPluginApi {
        return {
            frontendExtApi: {
                initPath: './wm/api/wm-api-worker-provider.js',
                initFunction: 'initializeApi',
                initVariable: 'wm_api_provider',
            },
            backendInitPath: path.join('@wm/plugin-ext/lib/plugin/node/wm-api-node-provider.js'),
        }
    }
}
