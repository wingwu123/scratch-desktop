import minilog from 'minilog';
import fs from 'fs';
minilog.enable();
minilog.pipe(fs.createWriteStream('./scratch-log.log', { flags: 'a' }));

const namespace = (() => {
    switch (process.type) {
    case 'browser': return 'main';
    case 'renderer': return 'web';
    default: return process.type; // probably 'worker' for a web worker
    }
})();

export default minilog(`app-${namespace}`);
