import fs from 'fs'
import path from 'path'
//import Rpc from '../compiler/rpc/rpc'
import { app, ipcMain } from 'electron'
import child_process from 'child_process';
import log from '../common/log'
import SerialPort from 'serialport'
import Timer from '../renderer/timer'
import EventEmitter from 'events';

/**
 * 

 */

class Port extends EventEmitter {
    constructor(){
        super();
        this.port = null;
        this.hasData = false;
        this.count = 0;
    }

    getData() {
        this.hasData = false;
        const dt = this.port.read();
        console.log('Port getData ', dt, this.hasData);
        return dt;
    }

    onReadable() {
        this.hasData = true;
        console.log('Port onReadable ');
    }

    onClose(error) {

        if(error != null && error.disconnected) {
            console.info("Port onClose ", error);
        }

        this.emit('close', error != null);

    }

    connect(portName){
        return new Promise((resolve, reject) => {
            this.port = new SerialPort(portName, {autoOpen : false, baudRate: 115200 });

            this.port.open(resolve);

            this.port.on('readable', this.onReadable.bind(this));
            this.port.on('close', this.onClose.bind(this));
        });
    }

    disconnect(){
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

let port = new Port();

export default port;