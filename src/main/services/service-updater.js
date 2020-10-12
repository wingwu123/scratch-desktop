/**
 * service-updater.js
 *
 */

import { dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from '../../common/log.js'
import {productName, version} from '../../../package.json';
import { registerProxy, ProxyPropertyType } from 'electron-ipc-proxy';
import { interval, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import serviceConfig from './service-config.js';


class ServiceUpdater {

    constructor() {

        autoUpdater.autoDownload = false;
        autoUpdater.logger = log;
        autoUpdater.version = version;
        autoUpdater.name = productName;
        autoUpdater.logger.info("log running");

        this.messages = {}

        this.messages.errorDialog = {title:"Error:"};

        autoUpdater.on('error', (error) => {
            dialog.showErrorBox(this.messages.errorDialog.title, error == null ? "unknown" : (error.stack || error).toString())
        })

        this.messages.availablerDialog = 
        {
            title:"Found Updates",
            message: 'Found updates, do you want update now?',
            buttons: ['Sure', 'No']
        };

        autoUpdater.on('update-available', this.onUpdateAvailable.bind(this));

        autoUpdater.on('update-not-available', () => {
            /*
            dialog.showMessageBox({
              title: 'No Updates',
              message: 'Current version is up-to-date.'
            })
            updater.enabled = true
            updater = null
            */
        });

        this.messages.downloadedDialog = 
        {
            title:"Install Updates",
            message: 'Updates downloaded, application will be quit for update...',
            buttons: ['确定']
        };

        autoUpdater.on('update-downloaded', this.onUpdateDownloaded.bind(this));

        autoUpdater.on('download-progress', (info) => {

            this.progress.next(info.percent.toFixed(2));
        })

        this.progress = new Subject();
        this.hasUpdate = new Subject();
    }

    register() {

        const service = {
            checkForUpdates: this.checkForUpdates.bind(this),
            downloadUpdate: this.downloadUpdate.bind(this),
            setMessages: this.setMessages.bind(this),
            appInfo: this.appInfo.bind(this),
            progress: this.progress,
            hasUpdate: this.hasUpdate
        }
        
        const handle = registerProxy(service, {
            channel: 'ServiceUpdater',
            properties: {
                checkForUpdates: ProxyPropertyType.Function,
                downloadUpdate: ProxyPropertyType.Function,
                setMessages: ProxyPropertyType.Function,
                appInfo: ProxyPropertyType.Function,
                progress: ProxyPropertyType.Value$,
                hasUpdate: ProxyPropertyType.Value$,
            }
        });
        
        this.unregister = handle;

        return handle;
    }

    checkForUpdates () {
        autoUpdater.checkForUpdates();
    }

    downloadUpdate () {
        autoUpdater.downloadUpdate()
    }

    setMessages(messages) {
        this.messages = Object.assign(this.messages, messages);
    }

    appInfo() {

        let info = {
            productName:productName, 
            version:version
        };

        ['Electron', 'Chrome'].map(component => {
            const componentVersion = process.versions[component.toLowerCase()];
            info[component] = componentVersion;
        });

        return info;
    }

    onUpdateAvailable(updateInfo) {

        const config_Id = "updater.notified_versions";

        let versions = serviceConfig.get(config_Id);

        if(!_.isArray(versions))
        {
            versions = [];
        }

        this.hasUpdate.next(updateInfo.version);

        if(versions.length != 0 && _.some(versions, (item) => { return item == updateInfo.version; })) {
            
            return;
        }

        dialog.showMessageBox({
            type: 'info',
            title: this.messages.availablerDialog.title,
            message: this.messages.availablerDialog.message,
            buttons: this.messages.availablerDialog.buttons
        }).then(({ response, checkboxChecked }) => {

            if (response === 0) {
                autoUpdater.downloadUpdate()
            }
            else {

                versions.push(updateInfo.version);
                serviceConfig.setAndSave(config_Id, versions);
            }
        });
    }

    onUpdateDownloaded() {

        dialog.showMessageBox({
            title:  this.messages.downloadedDialog.title,
            message: this.messages.downloadedDialog.message,
            buttons: this.messages.downloadedDialog.buttons,
            cancelId: -1
        }).then(({ response, checkboxChecked }) => {

            if (response >= 0) {
                setImmediate(() => {
                    
                    autoUpdater.quitAndInstall()
                });
            }
        });
    }
}

let serviceUpdater = new ServiceUpdater();

// export this to MenuItem click callback

export default serviceUpdater;