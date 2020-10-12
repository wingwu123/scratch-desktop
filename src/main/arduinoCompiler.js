import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import child_process from 'child_process';
import { stderr } from 'process';
import log from '../common/log'
import Port from './port'

/**
 * 
Board Name                       FQBN
Adafruit Circuit Playground      arduino:avr:circuitplay32u4cat
Arduino BT                       arduino:avr:bt
Arduino Duemilanove or Diecimila arduino:avr:diecimila
Arduino Esplora                  arduino:avr:esplora
Arduino Ethernet                 arduino:avr:ethernet
Arduino Fio                      arduino:avr:fio
Arduino Gemma                    arduino:avr:gemma
Arduino Industrial 101           arduino:avr:chiwawa
Arduino Leonardo                 arduino:avr:leonardo
Arduino Leonardo ETH             arduino:avr:leonardoeth
Arduino Mega ADK                 arduino:avr:megaADK
Arduino Mega or Mega 2560        arduino:avr:mega
Arduino Micro                    arduino:avr:micro
Arduino Mini                     arduino:avr:mini
Arduino NG or older              arduino:avr:atmegang
Arduino Nano                     arduino:avr:nano
Arduino Nano Every               arduino:megaavr:nona4809
Arduino Pro or Pro Mini          arduino:avr:pro
Arduino Robot Control            arduino:avr:robotControl
Arduino Robot Motor              arduino:avr:robotMotor
Arduino Uno                      arduino:avr:uno
Arduino Uno WiFi                 arduino:avr:unowifi
Arduino Uno WiFi Rev2            arduino:megaavr:uno2018
Arduino Yún                      arduino:avr:yun
Arduino Yún Mini                 arduino:avr:yunmini
LilyPad Arduino                  arduino:avr:lilypad
LilyPad Arduino USB              arduino:avr:LilyPadUSB
Linino One                       arduino:avr:one
 */

class ArduinoCompiler{
    constructor(){

        this.appPath = app.getAppPath();
        log.log('getAppPath ', this.appPath);
        this.appPath = path.dirname(path.dirname(this.appPath));
        log.log('getAppPath new ', this.appPath);
        this.port = '';
        this.libraries = path.resolve(this.appPath, 'Arduino/libraries/');

        this.compiler_path = path.resolve(this.appPath, 'Arduino/arduino-cli.exe');
        this.options = {cwd:path.resolve(this.appPath, 'Arduino/Arduino15')};

        log.log('compiler_path ', this.compiler_path);
    }

    connect(){
        return this.boardList();
    }

    //arduino-cli board list --timeout 10s
    boardList(){
        return Port.list();
        /*
        return new Promise((resolve, reject) => {

            protocol.list().then()

            console.log("boardList compiler_path ", this.compiler_path);

            child_process.execFile(this.compiler_path, ['board', 'list', '--format', 'json', '--timeout', '10s'], this.options, (err, stdout, stderr) => {
                if(!err){
                    if(stderr){
                        reject(stderr);
                        return;
                    }

                    let json = JSON.parse(stdout);
                    if(json && json.length > 0){
                        let ports = json.map((value) => value.address);
                        resolve(ports);
                    }
                    else{
                        reject('');
                    }
                }
                else{
                    reject(err);
                }
            });
        });
        */
    }

    saveCode(code){
        return new Promise((resolve, reject) => {
            fs.writeFile(path.resolve(this.libraries, 'WhalesbotApp/WhalesbotApp.ino'), code, (err) => {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve();
                }
            });
        });
    }

    compile(){
        return new Promise((resolve, reject) => {
            let sketch_path = path.resolve(this.libraries, 'WhalesbotApp');
            let build_cache_path = path.resolve(sketch_path, 'build_cache');
            child_process.execFile(this.compiler_path, ['compile', '-b', 'arduino:avr:mega','--format','json','--libraries', this.libraries, '--build-cache-path', build_cache_path , sketch_path], this.options, (err, stdout, stderr) => {
                if(!err){
                    if(stderr){
                        reject(stderr);
                    }
                    else{
                        resolve(stdout);
                    }
                }
                else{
                    reject(err);
                }
            });
        });
    }

    upload(){
        return new Promise((resolve, reject) => {
            let sketch_path = path.resolve(this.libraries, 'WhalesbotApp');
            child_process.execFile(this.compiler_path, ['upload', '-b', 'arduino:avr:mega','--format','json','-p',this.port, sketch_path], this.options, (err, stdout, stderr) => {
                if(!err){
                    if(stderr){
                        reject(stderr);
                    }
                    else{
                        resolve(stdout);
                    }
                }
                else{
                    reject(err);
                }
            });
        });
    }
}

let arduinoCompiler = new ArduinoCompiler();

export default arduinoCompiler;