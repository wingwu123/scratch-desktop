import fs from 'fs'
import path from 'path'
//import Rpc from './rpc/rpc'
const app = require('electron').remote.app
import child_process from 'child_process';
import { stderr } from 'process';

class ArduinoCompiler{
    constructor(){

        let compiler_path = path.resolve(app.getAppPath(), 'arduino-cli.exe');

        console.log('compiler_path ', compiler_path);

        child_process.execFile(compiler_path, ['daemon', '--port', '12020'], (err, stdout, stderr) => {
            if(!err){
                //this.rpc = new Rpc();
                console.log('arduino-cli launch successful ');
            }
            else{
                console.log('arduino-cli launch error ', err);
            }
        });
    }

    saveCode(code){
        return new Promise((resolve, reject) => {
            fs.writeFile(path.resolve(app.getAppPath(), 'code.c'), code, (err) => {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve();
                }
            })
        });
    }

    compile(){
        return new Promise((resolve, reject) => {
            //this.rpc.Compile()
        });
    }

    upload(){
        return new Promise((resolve, reject) => {
            reject('网页端不支持');
        });
    }
}

let arduinoCompiler = new ArduinoCompiler();

export default arduinoCompiler;