// this is an async import so that it doesn't block the first render
// index.html contains a loading/splash screen which will display while this import loads


const route = new URLSearchParams(window.location.search).get('route') || 'app';
switch (route) {
case 'app':
    let {ServiceInstance} = require('scratch-gui') ;
    const serviceFactory = require('./broker/ServiceFactory.js') ;
    ServiceInstance.configure.initialize().then(() =>{

        import('./app.jsx'); // eslint-disable-line no-unused-expressions
    });
    
    break;
case 'about':
    import('./about.jsx'); // eslint-disable-line no-unused-expressions
    break;
}
