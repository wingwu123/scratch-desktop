import { createProxy, ProxyPropertyType } from 'electron-ipc-proxy/src/client';
import { Observable } from 'rxjs';

class PortBroker{
    constructor() {

        let options = {
            channel: 'ServicePort',
            properties: {
                connect: ProxyPropertyType.Function,
                disconnect: ProxyPropertyType.Function,
                list: ProxyPropertyType.Function,
                wirte: ProxyPropertyType.Function,
                read: ProxyPropertyType.Function,
                onClosed: ProxyPropertyType.Value$,
            }
        };
        
        this.broker = createProxy(options, Observable);
    }
    connect() {
        return this.broker.connect();
    }

    disconnect() {
        return this.broker.disconnect();
    }

    list() {
        return this.broker.list();
    }

    wirte() {
        return this.broker.wirte();
    }

    read() {
        return this.broker.read();
    }

    onClosed() {
        return this.broker.onClosed;
    }
}

export default PortBroker;