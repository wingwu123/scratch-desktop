import { createProxy, ProxyPropertyType } from 'electron-ipc-proxy/src/client';
import { Observable } from 'rxjs';
import Timer from '../timer';

class ConfigBroker{
    constructor() {

        let options = {
            channel: 'ServiceConfig',
            properties: {
                load: ProxyPropertyType.Function,
                save: ProxyPropertyType.Function,
                set: ProxyPropertyType.Function,
                setAndSave: ProxyPropertyType.Function,
                get: ProxyPropertyType.Function
            }
        };
        
        //this.broker = createProxy(options, Observable);
        this.broker = createProxy(options);
        this.data = {};
    }

    initialize () {
        let timer = new Timer();
        timer.start();
        return this.get("").then(data => {
            this.data = data;
            console.info("initialize timeElapsed ", data, timer.timeElapsed());
        });
    }

    load() {
        this.broker.load();
    }

    save() {
        this.broker.save();
    }

    set(path, value) {
        this.broker.set(path, value);
    }
    
    setAndSave(path, value) {
        this.broker.setAndSave(path, value);
    }
    get(path) {
        return this.broker.get(path);
    }

    getSync(path) {
        console.info("ConfigBroker get ");

        let path_list = [];
        if (!_.isArray(path)) {
            path_list = path.split('.');
        }
        else {
            path_list = path;
            path = path.join('.');
        }

        console.info("ConfigBroker get ", path_list);

        let ret = this.data;
        for (const key in path_list) {
            if (!ret.hasOwnProperty(path_list[key])) {
                return "";
            }
            ret = ret[path_list[key]];
        }

        return ret;
    }
}

export default ConfigBroker;