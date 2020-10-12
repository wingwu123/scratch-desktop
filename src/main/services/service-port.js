/**
 * service-port.js
 *
 */

import log from '../../common/log.js'

import { registerProxy, ProxyPropertyType } from 'electron-ipc-proxy';
import { interval, Subject } from 'rxjs';
import serviceConfig from './service-config.js';


class ServicePort {

    constructor() {

        this.port = null;
        this.hasData = false;
        this.count = 0;

        this.onClosed = new Subject();
    }

    register() {

        const service = {
            connect: this.connect.bind(this),
            disconnect: this.disconnect.bind(this),
            list: this.list.bind(this),
            wirte: this.wirte.bind(this),
            read: this.read.bind(this),

            onClosed: this.onClosed
        }
        
        const handle = registerProxy(service, {
            channel: 'ServicePort',
            properties: {
                connect: ProxyPropertyType.Function,
                disconnect: ProxyPropertyType.Function,
                list: ProxyPropertyType.Function,
                wirte: ProxyPropertyType.Function,
                read: ProxyPropertyType.Function,
                onClosed: ProxyPropertyType.Value$,
            }
        });
        
        this.unregister = handle;

        return handle;
    }

    getData() {
        this.hasData = false;
        const dt = this.port.read();
        console.log('Port getData ', dt);
        return dt;
    }

    onReadable() {
        this.hasData = true;
        console.log('Port onReadable ');
    }

    onClose(error) {

        this.onClosed.next();
    }
    connect(portName){
        return new Promise((resolve, reject) => {
            this.port = new SerialPort(portName, {autoOpen : false, baudRate: 115200 });

            this.port.open(resolve);

            console.info("ServicePort connect");

            this.port.on('readable', this.onReadable.bind(this));
            this.port.on('close', this.onClose.bind(this));
        });
    }

    disconnect(){

        console.info("ServicePort disconnect");

        if(this.port && this.port.isOpen)
        {
            this.port.close();
            this.port = null;
        }
    }

    /**
     * SerialPort.list()
        .then(ports) {...});
        .catch(err) {...});
     */
    list(){
        return SerialPort.list()
    }

    wirte(data){
        return new Promise((resolve, reject) => {
            this.hasData = false;
            if(this.port != null)
            {
                this.port.write(data, () =>{

                    console.info(" port wirte : [" + this.count + "]", data);
                    this.count++;
                    this.port.drain((error) =>{

                        resolve(error);
                    });
                });
            }
            else
            {
                reject('port is not connected');
            }
        });
    }
    read(){
        return new Promise((resolve, reject) => {
            if(this.port != null)
            {
                const data = this.getData();
                console.info(" port read", data);
                resolve(data);
            }
            else
            {
                reject('port is not connected');
            }
        });
    }
}

let servicePort = new ServicePort();

// export this to MenuItem click callback

export default servicePort;