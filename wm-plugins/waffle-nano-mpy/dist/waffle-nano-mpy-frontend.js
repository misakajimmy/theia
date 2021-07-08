var theia_waffle_nano_mpy=function(i){var t={};function o(e){if(t[e])return t[e].exports;var n=t[e]={i:e,l:!1,exports:{}};return i[e].call(n.exports,n,n.exports,o),n.l=!0,n.exports}return o.m=i,o.c=t,o.d=function(e,n,i){o.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:i})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(n,e){if(1&e&&(n=o(n)),8&e)return n;if(4&e&&"object"==typeof n&&n&&n.__esModule)return n;var i=Object.create(null);if(o.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:n}),2&e&&"string"!=typeof n)for(var t in n)o.d(i,t,function(e){return n[e]}.bind(null,t));return i},o.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(n,"a",n),n},o.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},o.p="",o(o.s=0)}([function(e,n,i){"use strict";var a,t,r=this&&this.__awaiter||function(e,r,d,l){return new(d=d||Promise)(function(i,n){function t(e){try{a(l.next(e))}catch(e){n(e)}}function o(e){try{a(l.throw(e))}catch(e){n(e)}}function a(e){var n;e.done?i(e.value):((n=e.value)instanceof d?n:new d(function(e){e(n)})).then(t,o)}a((l=l.apply(e,r||[])).next())})};Object.defineProperty(n,"__esModule",{value:!0}),n.stop=n.start=n.MPY=void 0;const d=i(1),l=i(2),o={webserialConnectCommand:{id:"waffle.nano.mpy.connect",label:"waffle nano:connect"},webserialDisconnectCommand:{id:"waffle.nano.mpy.disconnect",label:"waffle nano:disconnect"},webserialTerminalCommand:{id:"waffle.nano.mpy.terminal",label:"waffle nano:terminal"},mpyRunCommand:{id:"waffle.nano.mpy.run",label:"waffle nano:run"},mpyUploadCommand:{id:"waffle.nano.mpy.upload",label:"waffle nano:upload"}},s=new TextDecoder,c="waffle-nano-mpy";t=a=n.MPY||(n.MPY={}),(i=t.ReadMode||(t.ReadMode={}))[i.NONE=0]="NONE",i[i.WAIT_REPL=1]="WAIT_REPL",i[i.WAIT_PASTE=2]="WAIT_PASTE",(t=t.ReadDataRe||(t.ReadDataRe={})).NONE="",t.WAIT_REPL=">>>",t.WAIT_PASTE="===";let u,f,m,w,y=!1;function p(){return r(this,void 0,void 0,function*(){yield d.webserial.clearData(c),u=setInterval(()=>r(this,void 0,void 0,function*(){var n=yield d.webserial.onData(c);if(0<n.length){let e=[];for(var i of n)e=e.concat(Object.values(i));switch(console.log(f),f){case a.ReadMode.NONE:break;case a.ReadMode.WAIT_REPL:-1!==s.decode(new Uint8Array(e)).search(a.ReadDataRe.WAIT_REPL)&&(m=!0);break;case a.ReadMode.WAIT_PASTE:-1!==s.decode(new Uint8Array(e)).search(a.ReadDataRe.WAIT_PASTE)&&(m=!0)}}}),40)})}function b(){clearInterval(u)}function v(n){return new Promise(e=>setTimeout(e,n))}function h(){return r(this,void 0,void 0,function*(){for(yield p(),w=!1,m=!1,f=a.ReadMode.WAIT_REPL,yield d.webserial.write("\r\n");!m&&!w;)yield v(40);for(m=!1,f=a.ReadMode.WAIT_PASTE,yield d.webserial.writeListData([5]);!m&&!w;)yield v(40)})}function T(t){return r(this,void 0,void 0,function*(){var e=t.eol===l.EndOfLine.LF?"\n":"\r\n";let n=t.getText();var i,e=n.split(e);m=!1,f=a.ReadMode.WAIT_PASTE;for(i of e)for(yield d.webserial.write(i),m=!1,yield d.webserial.write("\r");!m;)yield v(40)})}function R(){return r(this,void 0,void 0,function*(){yield d.webserial.writeListData([4]),f=a.ReadMode.NONE,b()})}function P(){return r(this,void 0,void 0,function*(){for(yield p(),f=a.ReadMode.WAIT_REPL,m=!1,yield d.webserial.write("\r\n");!m;)yield v(40);for(m=!1,yield d.webserial.write("import machine\r\nmachine.reset()\r\n");!m;)yield v(40);f=a.ReadMode.NONE})}function _(o){return r(this,void 0,void 0,function*(){var e=o.eol===l.EndOfLine.LF?"\n":"\r\n";let n=o.getText();n=null===n||void 0===n?void 0:n.split('"').join('\\"');var i,t=n.split(e);for(f=a.ReadMode.WAIT_REPL,m=!1,yield d.webserial.write("\r\n");!m;)yield v(40);for(m=!1,yield d.webserial.write('o = open("main.py","w")\r\n');!m;)yield v(40);for(i in t)for(yield d.webserial.write('o.write("'),yield d.webserial.write(t[i]),yield d.webserial.write('\\r\\n")'),m=!1,yield d.webserial.write("\r\n");!m;)yield v(40);for(m=!1,yield d.webserial.write("o.close()\r\n");!m;)yield v(40)})}function A(){return r(this,void 0,void 0,function*(){f=a.ReadMode.WAIT_REPL,yield d.webserial.write("import machine\r\nmachine.reset()\r\n"),f=a.ReadMode.NONE,b()})}let E=l.window.createStatusBarItem(l.StatusBarAlignment.Left,5);E.text="Connect",E.command="waffle.nano.mpy.connect";let M=l.window.createStatusBarItem(l.StatusBarAlignment.Left,4);M.text="Run",M.command="waffle.nano.mpy.run";let I=l.window.createStatusBarItem(l.StatusBarAlignment.Left,3);I.text="Upload",I.command="waffle.nano.mpy.upload",n.start=function(e){E.show(),e.subscriptions.push(l.commands.registerCommand(o.webserialConnectCommand,()=>r(this,void 0,void 0,function*(){l.window.showInformationMessage("Please choose you device"),(yield d.webserial.requestPort([]))&&(yield d.webserial.openSerialPort(),E.text="Disconnect",E.command="waffle.nano.mpy.disconnect",M.show(),I.show(),l.window.showInformationMessage("Connected to your device"))}))),e.subscriptions.push(l.commands.registerCommand(o.webserialDisconnectCommand,()=>r(this,void 0,void 0,function*(){yield d.webserial.disconnect(),E.text="Connect",E.command="waffle.nano.mpy.connect",M.hide(),I.hide(),l.window.showInformationMessage("serial disconnected")}))),e.subscriptions.push(l.commands.registerCommand(o.webserialTerminalCommand,()=>r(this,void 0,void 0,function*(){(yield d.webserial.terminalOpened())?yield d.webserial.closeTerminal():yield d.webserial.openTerminal()}))),e.subscriptions.push(l.commands.registerCommand(o.mpyRunCommand,(...n)=>r(this,void 0,void 0,function*(){var e;y||(y=!0,(yield d.webserial.terminalOpened())||(yield d.webserial.openTerminal()),(yield d.webserial.connected())&&(null!=n&&n.fsPath?(yield h(),void 0!==(e=yield l.workspace.openTextDocument(n))&&(yield T(e)),yield R()):null!=(e=l.window.activeTextEditor)&&e.document&&(yield h(),yield T(e.document),yield R())),y=!1)}))),e.subscriptions.push(l.commands.registerCommand(o.mpyUploadCommand,(...n)=>r(this,void 0,void 0,function*(){var e;y||(y=!0,(yield d.webserial.terminalOpened())&&(yield d.webserial.closeTerminal()),(yield d.webserial.connected())&&(null!=n&&n.fsPath?(yield P(),void 0!==(e=yield l.workspace.openTextDocument(n))&&(yield _(e))):(yield P(),null!=(e=l.window.activeTextEditor)&&e.document&&(yield _(e.document))),yield A()),(yield d.webserial.terminalOpened())||(yield d.webserial.openTerminal()),y=!1)})))},n.stop=function(){}},function(e,n){e.exports=wm.plugin},function(e,n){e.exports=theia.plugin}]);