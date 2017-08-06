var sys = require('sys');
var navigator = require('navigator');
var WebSocket = require('ws');
var request = require('request');
var storage = require('node-persist');
var abrinSdk={wssUri:"wss://abrin.ir:4282/abrin",wsUri:"ws://abrin.ir:4284/abrin",secure:!0,machineID:"",token:"",ENCODING:"utf-16le",websocket:{},machine:{},ABRIN_APP_ID:"",ABRIN_APP_NAME:"",onMachineRegisteredFn:"",onMachineUnregisteredFn:"",onPushReceivedFn:"",onDataReceivedFn:"",onEventReceivedFn:"",onUserEventReceivedFn:"",handleDataUpdateFn:"",onRegisterRequestAcceptedFn:"",onRemoveRequestAcceptedFn:"",debugMode:!1,on:function(e,n){var i="on"+abrinSdk.ucfirst(e)+"Fn";abrinSdk[i]=n},init:function(e,n,i){if(storage.initSync(),abrinSdk.machine=abrinSdk.get_machine(),!e&&!n)return abrinSdk.debugMode&&sys.debug("appID و appName خالی است."),!1;abrinSdk.ABRIN_APP_ID=e,abrinSdk.ABRIN_APP_NAME=n;for(var r in i)abrinSdk[r]=i[r];abrinSdk.machineID=storage.getItemSync("duid"),abrinSdk.token=storage.getItemSync("token"),abrinSdk.machineID&&abrinSdk.token?abrinSdk.connect():abrinSdk.register()},register:function(){var e={app:abrinSdk.ABRIN_APP_ID,appname:abrinSdk.ABRIN_APP_NAME,did:"UNKNOWN",alias:"",os:"3",osversion:abrinSdk.machine.version,manufacturer:abrinSdk.machine.name,model:navigator.oscpu,data:navigator.userAgent};abrinSdk.ajax.post("https://api.abrin.ir/device/register",e,function(e){if(e){abrinSdk.machineID=e.regid,abrinSdk.token=e.token,storage.setItemSync("duid",abrinSdk.machineID),storage.setItemSync("token",abrinSdk.token),abrinSdk.debugMode&&sys.debug("Registeration OK "+abrinSdk.machineID);try{abrinSdk.onMachineRegisteredFn&&"function"==typeof abrinSdk.onMachineRegisteredFn&&abrinSdk.onMachineRegisteredFn(abrinSdk.machineID)}catch(n){}abrinSdk.connect()}else abrinSdk.debugMode&&sys.debug("متاسفانه ثبت انجام نشد، لطفا پارمتر های خود را چک کنید: "+statusCode)})},connect:function(){abrinSdk.debugMode&&sys.debug("اتصال...");var e=abrinSdk.secure?abrinSdk.wssUri:abrinSdk.wsUri;abrinSdk.websocket=new WebSocket(e),abrinSdk.websocket.binaryType="arraybuffer",abrinSdk.websocket.onmessage=function(e){abrinSdk.onMessage(e)},abrinSdk.websocket.onerror=function(e){abrinSdk.onError(e)},abrinSdk.websocket.onopen=function(e){abrinSdk.onOpen(e)},abrinSdk.websocket.onclose=function(e){abrinSdk.onClose(e)}},removeDevice:function(){var e={app:ABRIN_APP_ID,device:machineID,token:token};abrinSdk.ajax.post("https://api.abrin.ir/device/unregister",e,function(e){if(e){var n=e.info;abrinSdk.resetAccount(),abrinSdk.debugMode&&sys.debug("Removed Device OK "+n);try{abrinSdk.onMachineUnregisteredFn&&"function"==typeof abrinSdk.onMachineUnregisteredFn&&abrinSdk.onMachineUnregisteredFn(n)}catch(i){}}else abrinSdk.debugMode&&sys.debug("متاسفانه حذف انجام نشد، لطفا پارمتر های خود را چک کنید: "+statusCode)})},onMessage:function(e){var n=JSON.parse(e.data);try{switch(n.t){case 1:0==n.c?(abrinSdk.debugMode&&sys.debug("کانال پوش آماده است..."),abrinSdk.onReadyFn&&"function"==typeof abrinSdk.onReadyFn&&abrinSdk.onReadyFn(!0,abrinSdk.machineID)):abrinSdk.resetAccount();break;case 2:break;case 3:var i={uid:n.id,group:n.g};try{if(abrinSdk.sendAck(i),abrinSdk.onDataReceivedFn&&"function"==typeof abrinSdk.onDataReceivedFn){var r={uid:n.id,from:n.f,body:n.data,group:n.g,time:n.time};abrinSdk.onDataReceivedFn(r)}}catch(a){sys.debug(a)}break;case 4:try{if(abrinSdk.nEventReceivedFn&&"function"==typeof abrinSdk.onEventReceivedFn){var r={eventtype:n.eventtype,deviceid:n.deviceid,data:n.eventsource,time:n.time};abrinSdk.onEventReceivedFn(r)}}catch(a){}break;case 5:try{if(abrinSdk.debugMode&&sys.debug("درخواست ثبت پذیرفته شد"),abrinSdk.onRegisterRequestAcceptedFn&&"function"==typeof abrinSdk.onRegisterRequestAcceptedFn){var t={request_id:n.reqid};abrinSdk.onRegisterRequestAcceptedFn(t)}}catch(a){}break;case 6:try{if(abrinSdk.debugMode&&sys.debug("درخواست حذف پذیرفته شد"),abrinSdk.onRemoveRequestAcceptedFn&&"function"==typeof abrinSdk.onRemoveRequestAcceptedFn){var t={request_id:n.reqid};abrinSdk.onRemoveRequestAcceptedFn(t)}}catch(a){}break;case 7:try{if(abrinSdk.onUserEventReceivedFn&&"function"==typeof abrinSdk.onUserEventReceivedFn){var t={channel:n.channelid,sorurce:n.src,data:n.data,time:n.time};abrinSdk.onUserEventReceivedFn(t)}}catch(a){}}}catch(a){abrinSdk.debugMode&&sys.debug("Client ERROR: "+a.message)}},onError:function(e){abrinSdk.debugMode&&sys.debug("خطا در زمان اتصال "+e.reason),abrinSdk.onReadyFn&&"function"==typeof abrinSdk.onReadyFn&&abrinSdk.onReadyFn(!1,0)},resetAccount:function(){storage.removeItemSync("duid"),storage.removeItemSync("token")},onOpen:function(e){abrinSdk.debugMode&&sys.debug("اتصال برقرار شد...");var n={t:1,siteid:abrinSdk.ABRIN_APP_ID,version:1,iid:abrinSdk.machineID,token:abrinSdk.token};abrinSdk.sendText(JSON.stringify(n))},onClose:function(e){abrinSdk.onReadyFn&&"function"==typeof abrinSdk.onReadyFn&&abrinSdk.onReadyFn(!1,0),abrinSdk.debugMode&&sys.debug("قطع اتصال "+e.code+" "+e.reason)},notifyUser:function(){},tag:function(e,n){requestId=arguments[2]?arguments[2]:1;var i={t:5,evttype:1,p:"/"+abrinSdk.machineID+"/"+abrinSdk.ABRIN_APP_ID+"/"+e+"/"+n,reqid:requestId};abrinSdk.sendText(JSON.stringify(i))},alias:function(e){requestId=arguments[1]?arguments[1]:1;var n={t:5,evttype:4,p:"/"+abrinSdk.machineID+"/"+abrinSdk.ABRIN_APP_ID+"/"+e,reqid:requestId};abrinSdk.sendText(JSON.stringify(n))},removeTag:function(e){requestId=arguments[1]?arguments[1]:1;var n={t:6,evttype:1,p:"/"+abrinSdk.machineID+"/"+abrinSdk.ABRIN_APP_ID+"/"+e,reqid:requestId};abrinSdk.sendText(JSON.stringify(n))},listenPresence:function(e){requestId=arguments[1]?arguments[1]:1;var n={t:5,evttype:2,p:"/"+abrinSdk.machineID+"/"+abrinSdk.ABRIN_APP_ID+"/"+e,reqid:requestId};abrinSdk.sendText(JSON.stringify(n))},removePresenceListener:function(e){requestId=arguments[1]?arguments[1]:1;var n={t:6,evttype:2,p:"/"+abrinSdk.machineID+"/"+abrinSdk.ABRIN_APP_ID+"/"+e,reqid:requestId};abrinSdk.sendText(JSON.stringify(n))},listenUserEvents:function(e){requestId=arguments[1]?arguments[1]:1;var n={t:5,evttype:3,p:"/"+abrinSdk.machineID+"/"+abrinSdk.ABRIN_APP_ID+"/"+e,reqid:requestId};abrinSdk.sendText(JSON.stringify(n))},removeUserEventListener:function(e){requestId=arguments[1]?arguments[1]:1;var n={t:6,evttype:3,p:"/"+abrinSdk.machineID+"/"+abrinSdk.ABRIN_APP_ID+"/"+e,reqid:requestId};abrinSdk.sendText(JSON.stringify(n))},chat:function(e,n,i){i=i?i:"";var r={t:3,chat_session_id:i,p:"/"+n+"/"+abrinSdk.ABRIN_APP_ID,to:n,data:e,from:abrinSdk.machineID};abrinSdk.sendText(JSON.stringify(r))},status:function(e,n){var i={t:7,appid:abrinSdk.ABRIN_APP_ID,source:abrinSdk.machineID,channelid:e,data:n};abrinSdk.sendText(JSON.stringify(i))},sendText:function(e){abrinSdk.debugMode&&sys.debug("sending text: "+e),abrinSdk.websocket.send(e)},updateData:function(e){var n=JSON.parse(e);abrinSdk.handleDataUpdateFn(n)},notifyUser:function(e,n){"Notification"in window?"granted"===Notification.permission?abrinSdk.showNotif(e,n):"denied"!==Notification.permission&&Notification.requestPermission(function(i){"granted"===i&&abrinSdk.showNotif(e,n)}):abrinSdk.debugMode&&sys.debug("This machine does not support system notifications")},showNotif:function(e,n){new Notification(e,n);abrinSdk.sendAck(n)},sendAck:function(e){var n=[],i={id:e.uid,u:abrinSdk.machineID,ap:abrinSdk.ABRIN_APP_ID,g:e.group,at:1};n[0]=i;var r={t:4,p:"/"+abrinSdk.machineID+"/"+abrinSdk.ABRIN_APP_ID,acks:n};abrinSdk.sendText(JSON.stringify(r))},getBytes:function(e){var n=new ByteBuffer;return Charset.UTF8.encode(e,n),n.flip(),n.array},getUUID:function(){var e=(abrinSdk.S4()+abrinSdk.S4()+"-"+abrinSdk.S4()+"-4"+abrinSdk.S4().substr(0,3)+"-"+abrinSdk.S4()+"-"+abrinSdk.S4()+abrinSdk.S4()+abrinSdk.S4()).toLowerCase();return e},S4:function(){return(65536*(1+Math.random())|0).toString(16).substring(1)},str2ab:function(e){for(var n=new ArrayBuffer(2*e.length),i=new Uint16Array(n),r=0,a=e.length;a>r;r++)i[r]=e.charCodeAt(r);return n},ajax:{post:function(e,n,i){var r={url:e,method:"POST",form:n};request(r,function(e,n,r){e||200!=n.statusCode||i(JSON.parse(r))})}},getMachineId:function(){return abrinSdk.machineID},get_machine:function(){var e,n=navigator.userAgent,i=n.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i)||[];return/trident/i.test(i[1])?(e=/\brv[ :]+(\d+)/g.exec(n)||[],{name:"IE",version:e[1]||""}):"Chrome"===i[1]&&(e=n.match(/\bOPR|Edge\/(\d+)/),null!=e)?{name:"Opera",version:e[1]}:(i=i[2]?[i[1],i[2]]:[navigator.appName,navigator.appVersion,"-?"],null!=(e=n.match(/version\/(\d+)/i))&&i.splice(1,1,e[1]),i[1]=i[1]?i[1]:"",{name:i[0],version:i[1]})},ucfirst:function(e){return e.charAt(0).toUpperCase()+e.slice(1)}};
module.exports = {
    init: function(ABRIN_APP_ID, ABRIN_APP_NAME,options){
        abrinSdk.init(ABRIN_APP_ID, ABRIN_APP_NAME,options);   
    },
    on: function(name,callback){
        abrinSdk.on(name,callback);
    },
    removeDevice: function(){
        return abrinSdk.removeDevice();
    },
    getMachineId: function(){
        return abrinSdk.getMachineId();
    },
    sendData: function(msg,machineId,channelId){
        return abrinSdk.chat(msg,machineId,channelId);
    },
    sendUserEvent: function(targetId, data){
        return abrinSdk.status(targetId, data);
    },
    removeUserEventListener: function(targetId){
        return abrinSdk.removeUserEventListener(targetId);
    },
    listenUserEvents: function(targetId){
        return abrinSdk.listenUserEvents(targetId);
    },
    removePresenceListener: function(targetId){
        return abrinSdk.removePresenceListener(targetId);
    },
    listenPresence: function(targetId){
        return abrinSdk.listenPresence(targetId);
    }
};

///////////////////////////////////////////////////////


