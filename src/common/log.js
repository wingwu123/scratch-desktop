import minilog from 'minilog';
import fs from 'fs';
minilog.enable();
const file = './scratch-log.log';
//const file = 'G:/scratch-log.log';
minilog.pipe(fs.createWriteStream(file /* './scratch-log.log'*/, { flags: 'w' }));

const namespace = (() => {
    switch (process.type) {
    case 'browser': return 'main';
    case 'renderer': return 'web';
    default: return process.type; // probably 'worker' for a web worker
    }
})();

export default minilog(`app-${namespace}`);
