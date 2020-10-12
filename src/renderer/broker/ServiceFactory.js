import {ServiceInstance} from 'scratch-gui';
import UpdaterBroker from './UpdaterBroker';
import ConfigBroker from './ConfigBroker';
import AppStateBroker from './AppStateBroker';
import PortBroker from './PortBroker';

class ServiceFactory{
    constructor() {

        ServiceInstance.updater = new UpdaterBroker();
        ServiceInstance.configure = new ConfigBroker();
        ServiceInstance.appState = new AppStateBroker();
        //ServiceInstance.port = new PortBroker();
    }
}

let serviceFactory = new ServiceFactory();

export default serviceFactory;