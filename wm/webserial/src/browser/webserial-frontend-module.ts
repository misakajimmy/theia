/**
 * Generated using theia-extension-generator
 */
import { WebSerialFrontendContribution } from './webserial-frontend-contribution';
import { ContainerModule } from "inversify";
import {WebSerialService} from "./base/webserial-service";
import {CommandContribution, MenuContribution} from "@theia/core";
import {WebSerialsControl} from "../common/webserial-control";

export default new ContainerModule(bind => {
   bind(WebSerialsControl).toSelf().inSingletonScope();

   bind(WebSerialFrontendContribution).toSelf().inSingletonScope();
   bind(WebSerialService).toService(WebSerialFrontendContribution);
   for (const identifier of [CommandContribution,MenuContribution]) {
      bind(identifier).toService(WebSerialFrontendContribution);
   }
});
