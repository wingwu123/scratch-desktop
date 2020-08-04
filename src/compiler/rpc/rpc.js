import protobuf from 'protobufjs';
import grpc from 'grpc';

class Rpc {

  constructor() {

    const grpcServerUrl = '127.0.0.1:12020';

    const Client = grpc.makeGenericClientConstructor({});
    const client = new Client(
      grpcServerUrl,
      grpc.credentials.createInsecure()
    );

    const rpcImplFactroy = function (serviceName) {

      const rpcImpl = function (method, requestData, callback) {

        client.makeUnaryRequest(
          serviceName + '/' + method.name,
          arg => arg,
          arg => arg,
          requestData,
          callback
        );
      };

      return rpcImpl;
    }

    var root = protobuf.Root.fromJSON(require("./commands.json"));

    let ArduinoCore = root.lookup('cc.arduino.cli.commands.ArduinoCore');
    this.arduinoCore = ArduinoCore.create(rpcImplFactroy('cc.arduino.cli.commands.ArduinoCore'), false, false);
  }

  Init(callback){
    this.arduinoCore.init({ library_manager_only: false } , function (err, response) {
      console.log("arduinoCore init", 'error:[' + err + ']', JSON.stringify(response));
      this.instance = response.instance.id;
      callback(err, this.instance);
    });
  }

  Destroy(){
    this.arduinoCore.destroy({ instance: {id:this.instance} }, function (err, response) {
      console.log("arduinoCore destroy", 'error:[' + err + ']', JSON.stringify(response));

    });
  }

  Compile(){
    let req = {
      instance: {id:this.instance},
      fqbn:'',
      sketchPath:'',
      buildPath:''
    };
    this.arduinoCore.compile(req, function (err, response) {
      console.log("arduinoCore Compile", 'error:[' + err + ']', JSON.stringify(response));

    });
  }
}

export default Rpc;




/*
arduinoCore.version({}, function (err, response) {
    console.log("arduinoCore version", 'error:[' + err + ']', JSON.stringify(response) );
  });
  */


