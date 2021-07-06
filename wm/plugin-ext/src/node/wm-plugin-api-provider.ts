import {injectable} from "inversify";
import { ExtPluginApi, ExtPluginApiProvider } from '@theia/plugin-ext/lib/common/plugin-ext-api-contribution';
import * as path from "path";


@injectable()
export class WmPluginApiProvider implements ExtPluginApiProvider {
    provideApi(): ExtPluginApi {
        return {
            frontendExtApi: {
                initPath: './ds/api/ds-api-worker-provider.js',
                initFunction: 'initializeApi',
                initVariable: 'ds_api_provider',
            },
            backendInitPath: path.join('@ds/plugins-ext/lib/plugins/node/che-api-node-provider.js'),
        }
    }
}
