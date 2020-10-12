/**
 * service-config.js
 *
 */

import {BrowserWindow, app, dialog } from 'electron';
import log from '../../common/log.js'
import fs from 'fs'
import Path, { resolve } from 'path'
import _ from "lodash"
import { registerProxy, ProxyPropertyType } from 'electron-ipc-proxy'


class ServiceAppState {

    constructor() {
        this.messages = {};
        this.messages.QuitDialog = {
            message: 'Leave Scratch?',
            detail: 'Any unsaved changes will be lost.',
            buttons: ['Stay', 'Leave'],
        };
    }

    register() {

        const service = {
            setMessages: this.setMessages.bind(this),
            quit: this.quit.bind(this)
        }
        
        const handle = registerProxy(service, {
            channel: 'ServiceAppState',
            properties: {
                setMessages: ProxyPropertyType.Function,
                quit: ProxyPropertyType.Function,
            }
        });
        
        this.unregister = handle;

        return handle;
    }

    mainWindow() {
        const wins = BrowserWindow.getAllWindows();

        for (const key in wins) {
            let parent = wins[key].getParentWindow();
            if(parent == null)
            {
                return wins[key];
            }

            return parent;
        }

        return null;
    }

    willPreventUnload (window) {

        console.info("ServiceAppState willPreventUnload ");

        const choice = dialog.showMessageBoxSync(window, {
            type: 'question',
            message: this.messages.QuitDialog.message,
            detail: this.messages.QuitDialog.detail,
            buttons: this.messages.QuitDialog.buttons,
            cancelId: 0, // closing the dialog means "stay"
            defaultId: 0 // pressing enter or space without explicitly selecting something means "stay"
        });
        
        return choice;
    }

    setMessages(messages) {
        this.messages = Object.assign(this.messages, messages);
    }

    quit() {
        app.quit();
    }
}

let serviceAppState = new ServiceAppState();

export default serviceAppState;