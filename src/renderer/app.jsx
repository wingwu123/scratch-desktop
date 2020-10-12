import {ipcRenderer, shell} from 'electron';
import bindAll from 'lodash.bindall';
import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';
import GUI, {AppStateHOC} from 'scratch-gui';

import ElectronStorageHelper from '../common/ElectronStorageHelper';

import styles from './app.css';

import {v1 as UUIDv1} from 'uuid';

import "react-monaco-editor";

import serviceFactory from './broker/ServiceFactory.js';

const app = require('electron').remote.app;

const electron = {
    compiler:app.arduinoCompiler,
    port:app.port,
    fs:app.fs,
    path:app.path,
    root_path:app.root_path
};

function electron_properties_paint(){
    console.info("electron.fs", electron.fs);
    console.info("electron.path", electron.path);
    console.info("electron.root_path", electron.root_path);
}

electron_properties_paint();



const defaultProjectId = 0;

// override window.open so that it uses the OS's default browser, not an electron browser
window.open = function (url, target) {
    if (target === '_blank') {
        shell.openExternal(url);
    }
};
// Register "base" page view
// analytics.pageview('/');

const appTarget = document.getElementById('app');
appTarget.className = styles.app || 'app'; // TODO
document.body.appendChild(appTarget);

GUI.setAppElement(appTarget);

const ScratchDesktopHOC = function (WrappedComponent) {
    class ScratchDesktopComponent extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'handleProjectTelemetryEvent',
                'handleSetTitleFromSave',
                'handleStorageInit',
                'handleTelemetryModalOptIn',
                'handleTelemetryModalOptOut',
                'handleUpdateProjectTitle',
                'ipcResponse',
                'ipcRequest',
                'handleSaveConfirm'
            ]);
            this.state = {
                projectTitle: null
            };
            ipcRenderer.callbacks = {};
        }

        ipcRequest(message, options){
            if(!!options.callback)
            {
                let cbId = UUIDv1();
                ipcRenderer.callbacks[cbId] = options.callback;
                options.callback = cbId;
            }
            ipcRenderer.send(message, options);
        }

        ipcResponse(event, options) {
            if(!!options.callback && ipcRenderer.callbacks[options.callback])
            {
                let handle = ipcRenderer.callbacks[options.callback];
                delete ipcRenderer.callbacks[options.callback];
                handle(options);
            }
        }

        componentDidMount () {
            ipcRenderer.on('setTitleFromSave', this.handleSetTitleFromSave);
            ipcRenderer.on('ipc-response', this.ipcResponse);
        }
        componentWillUnmount () {
            ipcRenderer.removeListener('setTitleFromSave', this.handleSetTitleFromSave);
            ipcRenderer.removeListener('ipc-response', this.ipcResponse);
        }
        handleClickLogo () {
            ipcRenderer.send('open-about-window');
        }
        handleSaveConfirm (options) {
            this.ipcRequest('save-confirm', options);
        }
        handleProjectTelemetryEvent (event, metadata) {
            ipcRenderer.send(event, metadata);
        }
        handleSetTitleFromSave (event, args) {
            this.handleUpdateProjectTitle(args.title);
        }
        handleStorageInit (storageInstance) {
            storageInstance.addHelper(new ElectronStorageHelper(storageInstance));
        }
        handleTelemetryModalOptIn () {
            ipcRenderer.send('setTelemetryDidOptIn', true);
        }
        handleTelemetryModalOptOut () {
            ipcRenderer.send('setTelemetryDidOptIn', false);
        }
        handleUpdateProjectTitle (newTitle) {
            this.setState({projectTitle: newTitle});
        }
        render () {
            const shouldShowTelemetryModal = (typeof ipcRenderer.sendSync('getTelemetryDidOptIn') !== 'boolean');
            return (<WrappedComponent
                canEditTitle
                isScratchDesktop
                projectId={defaultProjectId}
                projectTitle={this.state.projectTitle}
                showTelemetryModal={shouldShowTelemetryModal}
                /*
                    onClickLogo={this.handleClickLogo}
                */
                
                onSaveConfirm={this.handleSaveConfirm}
                onProjectTelemetryEvent={this.handleProjectTelemetryEvent}
                onStorageInit={this.handleStorageInit}
                onTelemetryModalOptIn={this.handleTelemetryModalOptIn}
                onTelemetryModalOptOut={this.handleTelemetryModalOptOut}
                onUpdateProjectTitle={this.handleUpdateProjectTitle}
                electron = {electron}
                {...this.props}
            />);
        }
    }

    return ScratchDesktopComponent;
};

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedGui = compose(
    ScratchDesktopHOC,
    AppStateHOC
)(GUI);

ReactDOM.render(<WrappedGui />, appTarget);
