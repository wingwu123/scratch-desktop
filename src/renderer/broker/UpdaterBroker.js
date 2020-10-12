import { createProxy, ProxyPropertyType } from 'electron-ipc-proxy/src/client';
import { Observable } from 'rxjs';

class UpdaterBroker{
    constructor() {

        let options = {
            channel: 'ServiceUpdater',
            properties: {
                checkForUpdates: ProxyPropertyType.Function,
                downloadUpdate: ProxyPropertyType.Function,
                setMessages: ProxyPropertyType.Function,
                appInfo: ProxyPropertyType.Function,
                progress: ProxyPropertyType.Value$,
                hasUpdate: ProxyPropertyType.Value$,
            }
        };
        
        //this.broker = createProxy(options, Observable);
        this.broker = createProxy(options, Observable);
        /*
        this.broker.progress.subscribe(value => {
            console.info("UpdaterBroker progress ", value);
        });

        //{productName: "WOBOT Scratch", version: "1.0.0", Electron: "8.2.5", Chrome: "80.0.3987.165"}
        this.broker.appInfo().then(info => {
            console.info("UpdaterBroker info ", info);
        });
        */
    }
    checkForUpdates() {
        this.broker.checkForUpdates()
    }

    downloadUpdate() {
        this.broker.downloadUpdate()
    }

    setMessages(messages) {
        this.broker.setMessages(messages)
    }

    appInfo() {
        return this.broker.appInfo();
    }

    progress() {
        return this.broker.progress;
    }

    hasUpdate() {
        return this.broker.hasUpdate;
    }
}

export default UpdaterBroker;