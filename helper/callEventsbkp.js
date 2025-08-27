var callReportModel = require('../model/callFlowReportModel')
var smartGroupReport = require('../model/smartGroupReport');
const callEventDBactions = require('./callEventSqlFun');
const config = require('../config/config');
const redis = config.redis

var ami = new require('asterisk-manager')(process.env.ASTERISK_PORT, process.env.ASTERISK_IP, process.env.ASTERISK_GATE, process.env.ASTERISK_PASSWORD, true);
ami.keepConnected();
ami.on('userevent', async function (evt) {

    if (evt) {
        const encodedString = evt.data
        if(encodedString != undefined){
            const decodedString = decodeURIComponent(encodedString);
            const callData = JSON.parse(decodedString);
            var callType = "";
            console.log('callStart evnt callData....', evt)
            console.log('callStart userevent callData....', callData)
            if (evt.userevent == 'callStart') {
                
                await redis.set(callData.uniqueId, JSON.stringify(callData));
                if (callData.type == "report") {
                    if (callData.app == "callflow"){
                        
                        //call flow insertion starts here

                        values = {
                            call_flow_id: callData.appId,
                            start_time: callData.eventTime,
                            uniqueId: callData.uniqueId,
                            did_number: callData.didNumber,
                            source_number: callData.callerNumber,
                            id_user: callData.customerId,
                            id_department: callData.deptId,
                            event: "start",
                        };
                        callReportModel.create(values);
                    }
                    if (callData.app == "smartgroup"){
                    
                        //call flow insertion starts here
                        callType = "smartgroup";
                        values = {
                            smartgroup_id: callData.appId,
                            start_time: callData.eventTime,
                            uniqueId: callData.uniqueId,
                            did_number: callData.didNumber,
                            source_number: callData.callerNumber,
                            id_user: callData.customerId,
                            id_department: callData.deptId,
                            event: "start",
                        };
                        smartGroupReport.create(values);
                    }
                    //live call data insertion starts here
                    var user_id = 0;
                    if(callData.direction == 'outgoing'){
                        user_id = callData.userId
                    }else{
                        user_id = callData.app == 'user' ? callData.appId : 0
                    }
                    var livecallData = {
                        id_department: callData.deptId,
                        id_user: callData.customerId,
                        time: callData.eventTime,
                        source: callData.callerNumber ? callData.callerNumber : callData.dialedNumber,
                        destination: callData.didNumber,
                        type: callData.direction,
                        livekey: callData.liveKey,
                        user_id: user_id,
                        uniqueId: callData.uniqueId,
                        currentStatus: "start",
                        app:callData.direction == 'outgoing'? 'user' : callData.app,
                        appId: user_id,
                        channel:callData.sourceChannel
                    }
                    console.log('callStart userevent callData....', livecallData)
                    callEventDBactions.add_livecall(livecallData,callType)
                }
            }
            if (evt.userevent == 'smartGroup') {
                console.log('smartgroup userevent callData....', callData)
                if(callData.eventStatus == 'dial_answered'){
                    //call connection event for smart group user
                    var connectedData={
                        answeredTime : callData.eventTime,
                        currentStatus : 1,
                        user_id:callData.userId
                    }
                    callEventDBactions.update_livecall(connectedData,callData.uniqueId,'smartgroup')
                }
                smartGroupReport.create(callData);
            }
            if (evt.userevent == 'user') {
                //call connection event for user incoming
                if(callData.module == "user"){
                    if(callData.eventStatus == 'dial_answered'){
                        let connectedData = {
                            answeredTime : callData.eventTime,
                            currentStatus : 1,
                        }
                        callEventDBactions.update_livecall(connectedData,callData.uniqueId)
                    }
                }
            }
            if(evt.userevent == "callAnswered"){
                //call connection event for user outgoing
                if(callData.type == "report"){
                    if(callData.eventStatus == 'dial_answered'){
                        let connectedData = {
                            answeredTime : callData.eventTime,
                            currentStatus : 1,
                            appId : callData.userId,
                            app : "user",
                            user_id : callData.userId,
                        }
                        console.log('call connection event for user outgoing....', connectedData)
                        console.log('callData outgoing....', callData)
                        callEventDBactions.update_livecall(connectedData,callData.uniqueId)
                    }
                }
            }
            if (evt.userevent == 'callFlowReport') {
                console.log('callFlowReport evnt....', evt)
                console.log('callFlowReport decodeURIComponent....', callData)
                // call flow event insert start here
                if(callData.type == "report"){
                    let cachedRedisStringData = await redis.get(callData.uniqueId);
                    let cachedRedisParseData = JSON.parse(cachedRedisStringData)
                    values = {
                        call_flow_id: callData.appId,
                        did_number: callData.didNumber,
                        source_number: callData.callerNumber,
                        id_user: callData.customerId,
                        id_department: callData.deptId,
                    };
                    let reportData = {...callData,
                        call_flow_id: cachedRedisParseData[0].appId,
                        did_number: cachedRedisParseData[0].didNumber,
                        source_number: cachedRedisParseData[0].callerNumber,
                        id_user: cachedRedisParseData[0].customerId,
                        id_department: cachedRedisParseData[0].deptId,

                    }
                    cachedRedisParseData.push(reportData)
                    await redis.set("test", JSON.stringify(cachedRedisParseData));
                    console.log('callFlowReport insert call data....', callData)
                    callReportModel.create(callData);

                }
                if (callData.module == "end") {
                
                    values = {
                        call_flow_id: callData.call_flow_id,
                        call_flow_module: callData.module,
                        end_time: callData.eventTime,
                        uniqueId: callData.uniqueId,
                        did_number: callData.didNumber,
                        source_number: callData.callerNumber,
                        module_id: callData.module_id,
                        cr_file:callData.crFile
                    };
                    if(callData.call_flow_id){
                        await callReportModel.updateOne(
                                { uniqueId: callData.uniqueId,event: "start",call_flow_id: callData.call_flow_id},
                                { $set: values }
                            );
                    }
                
                }

            }
            if(evt.userevent == 'callEnd'){
                console.log('callEnd evnt....', evt)
                console.log('callEnd decodeURIComponent....', callData)
                values = {
                    call_flow_id: callData.call_flow_id,
                    call_flow_module: callData.module,
                    end_time: callData.eventTime,
                    call_unique_id: callData.uniqueId,
                    did_number: callData.didNumber,
                    source_number: callData.callerNumber,
                    module_id: callData.module_id,
                    cr_file:callData.crFile,
                    callStatus:callData.callStatus
                };
                callEventDBactions.insert_callreport(values)
            }
        }
        
    }
})
ami.on('connect', () => {
    console.log('Connected to Asterisk AMI');

});
    