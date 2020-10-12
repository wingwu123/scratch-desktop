import { createProxy, ProxyPropertyType } from 'electron-ipc-proxy/src/client';
import { Observable } from 'rxjs';

class AppStateBroker{
    constructor() {

        let options = {
            channel: 'ServiceAppState',
            properties: {
                setMessages: ProxyPropertyType.Function,
                quit: ProxyPropertyType.Function
            }
        };
        
        //this.broker = createProxy(options, Observable);
        this.broker = createProxy(options);
    }
    setMessages(messages) {
        this.broker.setMessages(messages);
    }

    quit() {
        this.broker.quit();
    }
}

export default AppStateBroker;