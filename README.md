# Abrin Cloud messaging nodejs SDK

[![Version npm](https://img.shields.io/npm/v/abrin.svg)](https://www.npmjs.com/package/abrin)
is a simple to use, blazing fast, and thoroughly tested Abrin client implementation.

**Note**: This module does not work in the browser. 

## Installing

```
npm install --save abrin
```

## Usage examples

### Initialize sdk 

```js
var abrin = require('abrin');
var ABRIN_APP_ID = ""; //give your app id from www.abrin.ir(http://www.abrin.ir)
var ABRIN_APP_NAME=""; //give your app name from www.abrin.ir(http://www.abrin.ir)
   
var options = {
    debugMode: false, //event and error logs
    secure: true //use ws or wss
};
abrin.init(ABRIN_APP_ID, ABRIN_APP_NAME,options);
```

### Available Triggers

```js
abrin.on('ready',function(flag,machineId){
  //sdk connection is ready
});

abrin.on('machineRegistered',function(machineId){

});

abrin.on('machineUnregistered',function(info){

});

abrin.on('dataReceived',function(data){

});

abrin.on('eventReceived',function(event){

});

abrin.on('userEventReceived',function(event){

});

abrin.on('registerRequestAccepted',function(request){

});

abrin.on('removeRequestAccepted',function(request){

});

```

### Available Methods

```js
abrin.removeDevice();

abrin.getMachineId();

abrin.sendData(msg,targetMachineId,channelId);

abrin.sendUserEvent(targetId, data);

abrin.removeUserEventListener(targetId);

abrin.listenUserEvents(targetId);

abrin.removePresenceListener(targetId);

abrin.listenPresence(targetId);
```



## License
[LGPL-3.0](LICENSE)
