/**
 * service-mgr.js
 *
 */

import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import child_process from 'child_process';
import serviceUpdater from './service-updater';
import serviceConfig from './service-config';
import serviceAppState from './service-appstate';


/**
 * 

 */

class ServicesMgr {
    constructor(){
        this.services = [];
    }

    install() {
        this.services.push(serviceUpdater);
        serviceUpdater.register();

        this.services.push(serviceConfig);
        serviceConfig.register();
        serviceConfig.load();

        this.services.push(serviceAppState);
        serviceAppState.register();
    }

    uninstall() {
        for (const key in this.services) {
            this.services[key].unregister();
        }
    }
}

let servicesMgr = new ServicesMgr();

export default servicesMgr;