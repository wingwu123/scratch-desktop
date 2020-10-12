/**
 * service-config.js
 *
 */

import log from '../../common/log.js'
import fs from 'fs'
import Path, { resolve } from 'path'
import _ from "lodash"

import { registerProxy, ProxyPropertyType } from 'electron-ipc-proxy'
import { reject } from 'async';
import { app } from 'electron';

class ServiceConfig {

    constructor() {

        
    }

    register() {

        const service = {
            load: this.load.bind(this),
            save: this.save.bind(this),
            set: this.set.bind(this),
            setAndSave: this.setAndSave.bind(this),
            get: this.get.bind(this)
        }
        
        const handle = registerProxy(service, {
            channel: 'ServiceConfig',
            properties: {
                load: ProxyPropertyType.Function,
                save: ProxyPropertyType.Function,
                set: ProxyPropertyType.Function,
                setAndSave: ProxyPropertyType.Function,
                get: ProxyPropertyType.Function
            }
        });
        
        this.unregister = handle;

        return handle;
    }

    load () {

        this.filePath = Path.join( app.getPath('userData') ,"config/config.json");

        console.info("ServiceConfig ", this.filePath);

        let path = Path.dirname(this.filePath);
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }

        let buffer = fs.readFileSync(this.filePath, {flag:"a+"});

        try{
            this.data = JSON.parse(buffer.toString()) ;
        }
        catch(error){
            this.data = {};
        }
    }

    save() {
        return new Promise((resolve, reject) => {
            let buffer = Buffer.from(JSON.stringify(this.data, null, "  "));
            fs.writeFileSync(this.filePath, buffer);
        });
    }

    set(path, value) {
        let path_list = [];
        if(!_.isArray(path)) {
            path_list = path.split('.');
        }
        else {
            path_list = path;
            path = path.join('.');
        }

        let last = path_list.pop();

        console.info("ServiceConfig set ", path_list);

        let ret = this.data;
        for (const key in path_list) {
            if(!ret.hasOwnProperty(path_list[key]))
            {
                ret[path_list[key]] = {};
            }
            ret = ret[path_list[key]];
        }

        ret[last] = value;

        return true;
    }
    setAndSave(path, value) {
        if(this.set(path, value))
        {
            this.save()
        }
    }

    get(path) {

        console.info("ServiceConfig get ");

        if(path == "" || path == null)
        {
            return this.data;
        }

        let path_list = [];
        if (!_.isArray(path)) {
            path_list = path.split('.');
        }
        else {
            path_list = path;
            path = path.join('.');
        }

        console.info("ServiceConfig get ", path_list);

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

let serviceConfig = new ServiceConfig();

export default serviceConfig;