const { calleventlog } = require('../logger');
const config = require('../config/config');
var socketHelper = require('../helper/socketHelper');
var campaignHelper = require('../helper/campaign')
const redis = config.redis

async function developmentCallEvent(evt, callData) {
    try {
        var callType = "";
        if (evt.userevent == 'callStart') {
            console.log('callStart userevent evt....', evt)
            console.log('callStart userevent callData....', callData)
            //firebase push notification
          
            if (callData.callType == 'clickToCallDestination') {
                var cachedRedisStringData = await redis.get(callData.uniqueId+"_socket");
                var cachedRedisParseData = JSON.parse(cachedRedisStringData)
                console.log("call start cachedRedisParseData get data ------->", cachedRedisParseData)
                // redisData = [{
                //     ...callData,
                //     clicktoCallScndLeg: callData.callType,
                //     clicktoCallStartTime: callData.eventTime,
                //     // answeredTime: (cachedRedisParseData) ? cachedRedisParseData[0].answeredTime : null,
                //     event: "start"
                // }
                // ];
                if(cachedRedisParseData){
                    cachedRedisParseData[0] = {
                        ...callData,
                        clicktoCallScndLeg: callData.callType,
                        clicktoCallStartTime: callData.eventTime,
                         answeredTime: (cachedRedisParseData) ? cachedRedisParseData[0].answeredTime : null,
                        event: "start",
                        socketredis:1
                    }
                    
                 
                    console.log("call start cachedRedisParseData before set ------->", cachedRedisParseData)
                     await redis.setex(callData.uniqueId+"_socket",3600, JSON.stringify(cachedRedisParseData));
                }else{
                    redisData = [{...callData,
                        clicktoCallScndLeg:callData.callType,
                        clicktoCallStartTime:callData.eventTime,
                        // answeredTime: (cachedRedisParseData) ? cachedRedisParseData[0].answeredTime : null,
                        event: "start",
                        socketredis:1
                        }
                    ];
                     await redis.setex(callData.uniqueId+"_socket",3600, JSON.stringify(redisData));
                }
            }else  if (callData.callType == 'connectSmartgroupDestination') {
                var cachedRedisStringData = await redis.get(callData.uniqueId+"_socket");
                var cachedRedisParseData = JSON.parse(cachedRedisStringData)
                console.log("call start cachedRedisParseData get data ------->", cachedRedisParseData)
                if(cachedRedisParseData){
                    cachedRedisParseData[0] = {
                        ...callData,
                        connectSmartgroupCallScndLeg: callData.callType,
                        connectSmartgroupCallStartTime: callData.eventTime,
                        event: "start",
                        socketredis:1
                    }
                    if (cachedRedisParseData) {
                        cachedRedisParseData[0].answeredTime = cachedRedisParseData[0].answeredTime
                    } else {
                        cachedRedisParseData[0].answeredTime = callData.eventTime
                    }
                    if (cachedRedisParseData) {
                        cachedRedisParseData.push(callData);
                    }
                    console.log("call start cachedRedisParseData before set ------->", cachedRedisParseData)
                     await redis.setex(callData.uniqueId+"_socket", 3600,JSON.stringify(cachedRedisParseData));
                }else{
                    redisData = [{...callData,
                        connectSmartgroupCallScndLeg:callData.callType,
                        connectSmartgroupCallStartTime:callData.eventTime,
                        // answeredTime: (cachedRedisParseData) ? cachedRedisParseData[0].answeredTime : null,
                        event: "start",
                        socketredis:1
                        }
                    ];
                     await redis.setex(callData.uniqueId+"_socket", 3600,JSON.stringify(redisData));
                }
            }else  if (callData.callType == 'Transfer') {
                var cachedRedisStringData = await redis.get(callData.parentUniqueId+"_socket");
                var cachedRedisParseData = JSON.parse(cachedRedisStringData)
                console.log("call start in tranfer call cachedRedisParseData  ------->", cachedRedisParseData)
                if (cachedRedisParseData) {
                    if (callData.deptId) {
                        callData.deptId = 0
                    }
                    cachedRedisParseData[0] = {
                        ...callData, ...cachedRedisParseData[0],
                        uniqueId:callData.uniqueId,
                        transferFrom:callData.userId,
                        transferCallUniqueId:callData.parentUniqueId,
                        transferCallStartTime:callData.eventTime,
                        transfer_department:callData.deptId,
                        initial_application:cachedRedisParseData[0].app,
                        final_application:callData.transferTo,
                        initial_app_id:cachedRedisParseData[0].appId,
                        final_appl_id:callData.transferTo,
                        event: "start",
                        socketredis: 1
                    }
                    console.log("dept id ---------->",callData.deptId)
                    cachedRedisParseData[0].userId = await callEventDBactions.get_userid_by_extnumber(callData.dialedNumber, callData.deptId, callData.customerId)
                    cachedRedisParseData[0].callType = callData.callType
                    console.log("call start cachedRedisParseData before set in transfer call------->", cachedRedisParseData)
                    await redis.setex(callData.uniqueId + "_socket", 3600, JSON.stringify(cachedRedisParseData));
                }
            }else{
                var cachedRedisParseData = [{ ...callData, event: "start",socketredis:1 }];
                // if (callData.callType == 'Transfer') {
                //     cachedRedisParseData[0].transferFrom = callData.userId
                //     cachedRedisParseData[0].transferCallUniqueId = callData.parentUniqueId
                //     if (callData.deptId) {
                //         callData.deptId = 0
                //     }
                //     cachedRedisParseData[0].userId = await callEventDBactions.get_userid_by_extnumber(callData.dialedNumber,callData.deptId,callData.customerId)              
                // }
                callData.userId = cachedRedisParseData[0].userId;
                await redis.setex(callData.uniqueId+"_socket", 3600,JSON.stringify(cachedRedisParseData));
            }
            calleventlog("call Start evnt....")
            calleventlog(evt)
            calleventlog("call Start callData---------------- >")
            calleventlog(callData)
            calleventlog("cachedRedisParseData data---------------- >")
            calleventlog(cachedRedisParseData)
            console.log("cachedRedisParseData in call start event ---->", cachedRedisParseData)
            if (callData.type == "report") {
                if (callData.app == "callflow") {
                }
                if (callData.app == "smartgroup") {

                    //call flow insertion starts here
                    callType = "smartgroup";

                }
                //live call data insertion starts here
                var user_id = 0;
                if (callData.direction == 'outgoing') {
                    user_id = callData.userId
                } else {
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
                    app: callData.direction == 'outgoing' ? 'user' : callData.app,
                    appId: user_id,
                    channel: callData.sourceChannel,
                    smartgroupId: callData.appId,
                    barge_code: callData.liveKey,
                    source_channel:callData.sourceChannel
                }
                console.log("smart callData ---->", callData)
                console.log("livecallData ---->", livecallData)
                callEventDBactions.add_livecall(livecallData, callType)
            }
        }
        if (evt.userevent == 'smartGroup') {
            console.log('smartgroup userevent callData....', callData)
            var cachedRedisStringData = await redis.get(callData.uniqueId+"_socket");
            if (cachedRedisStringData) {
                var cachedRedisParseData = JSON.parse(cachedRedisStringData)
                console.log('smartgroup userevent cachedRedisParseData....', cachedRedisParseData)
                if (callData.eventStatus == 'dial_start') {
                    callEventDBactions.smart_group_livecall("start", cachedRedisParseData[0].customerId, callData.smartGroupId, callData.userId, callData.uniqueId)
                    callEventDBactions.smart_group_user_availble_status(cachedRedisParseData[0].customerId, callData.smartGroupId, callData.userId, cachedRedisParseData[0].uniqueId)
                    //for smart group live report to show green colur for user
                    console.log("callData.userId -------->", callData.userId)
                    if (callData.ringType == 5) {
                        cachedRedisParseData[0].triedUsersIds = callData.userId
                        cachedRedisParseData[0].ringType = 5
                        delete callData.userId
                    }
                    // cachedRedisParseData[0].userId = callData.userId
                    if (cachedRedisParseData[0].callType == 'Transfer') {
                        var transferCallData = await redis.get(cachedRedisParseData[0].transferCallUniqueId + "_socket");
                        transferCallData = JSON.parse(transferCallData)
                        console.log("transferCallData in transfer call data ------>", transferCallData)
                        transferCallData[0].isTransfer = 1
                        console.log("transferCallData in transfer call data before set------>", transferCallData)
                        redis.setex(cachedRedisParseData[0].transferCallUniqueId + "_socket", 3600, JSON.stringify(transferCallData));
                    }
                }
                if (callData.eventStatus == 'dial_answered') {
                    if (cachedRedisParseData[0].app == 'callflow') {
                        cachedRedisParseData[0].isCallFlow = 1
                    }
                    //call connection event for smart group user
                    let connectedData = {
                        answeredTime: callData.eventTime,
                        currentStatus: 1,
                        user_id: callData.userId,
                        type: "incoming",
                        id_user: cachedRedisParseData[0].customerId,
                        destination: cachedRedisParseData[0].didNumber,
                        source: cachedRedisParseData[0].callerNumber,
                        deptId: cachedRedisParseData[0].deptId,
                        agentChannel: callData.agentChannel,
                        channel: cachedRedisParseData[0].sourceChannel,
                        uniqueId: cachedRedisParseData[0].uniqueId,
                        appId: cachedRedisParseData[0].appId
                    }
                    if (callData.ringType == 5) {
                        cachedRedisParseData[0].ringType = 5
                        cachedRedisParseData[0].triedUsersIds = callData.userId
                        var ringAllUser = await callEventDBactions.get_user_data(callData.regNumber)
                        console.log("user_id in ringall ---------->", ringAllUser)
                        connectedData.user_id = ringAllUser
                        callData.userId = ringAllUser
                    }
                    console.log("call evnt  -->", connectedData)
                    // update connection data to live calls
                    callEventDBactions.update_livecall(connectedData, callData.uniqueId, 'smartgroup', callData.agentChannel)
                    cachedRedisParseData = [{
                        ...cachedRedisParseData[0],
                        answeredTime: callData.eventTime,
                        currentStatus: 1, userId: callData.userId,
                        eventStatus: "dial_answered"
                    },
                    ...cachedRedisParseData.slice(1)
                    ];
                    if (callData.destinationType == 'pstn') {
                        cachedRedisParseData[0].destinationType = 'pstn'
                    }
                }
                if (callData.eventStatus == 'dial_end') {
                    if (callData.ringType == 5) {
                        if (cachedRedisParseData[0].event != 'dial_answered') {
                            delete callData.userId
                        }
                    }
                }
                //call landed from callflow
                cachedRedisParseData = [{
                    ...cachedRedisParseData[0],
                    callTransferedTo: cachedRedisParseData[0].app == 'callflow' ? "smargroup" : ""
                },
                ...cachedRedisParseData.slice(1)
                ];
                let redisData = callEventDBactions.check_exsist_module_id(cachedRedisParseData, callData)
                console.log('checking data result ....', redisData)
                if (redisData) {
                    cachedRedisParseData.push(callData);
                }
                let getRedisData = await redis.get(callData.uniqueId);
                console.log('getRedisData....', getRedisData)
                if (getRedisData) {
                redis.setex(callData.uniqueId + "_socket", 3600, JSON.stringify(cachedRedisParseData));
                // smartGroupReport.create(callData);
                }
            }
        }
        if (evt.userevent == 'user') {
            console.log('inside user evt....', evt)
            console.log('inside user callData....', callData)
            //call connection event for user incoming
            if (callData.module == "user") {
                if (callData.eventStatus == 'dial_answered') {
                    let cachedRedisStringData = await redis.get(callData.uniqueId+"_socket");
                    let cachedRedisParseData = JSON.parse(cachedRedisStringData)
                    if (cachedRedisParseData[0].callType == 'connectCallFlow') {
                        cachedRedisParseData = [{
                            ...cachedRedisParseData[0],
                            currentStatus: 1,
                            eventStatus: callData.eventStatus
                        },
                        ...cachedRedisParseData.slice(1)
                        ];
                        if (callData.destinationType == 'pstn') {
                            cachedRedisParseData = [{
                                ...cachedRedisParseData[0],
                                clicktoCallScndLeg: "clickToCallDestination",
                                clicktoCallAnswertTime: callData.eventTime
                            },
                            ...cachedRedisParseData.slice(1)
                            ];
                        }
                    } else {
                        cachedRedisParseData = [{
                            ...cachedRedisParseData[0],
                            answeredTime: callData.eventTime,
                            currentStatus: 1,
                            eventStatus: callData.eventStatus
                        },
                        ...cachedRedisParseData.slice(1)
                        ];
                    }

                    console.log('redis updation data ....', cachedRedisParseData)
                    if (callData.callFlowId != undefined) {
                        let reportData = {
                            ...callData,
                            callFlowId: cachedRedisParseData[0].appId,
                            didNumber: cachedRedisParseData[0].didNumber,
                            callerNumber: cachedRedisParseData[0].callerNumber,
                            customerId: cachedRedisParseData[0].customerId,
                            deptId: cachedRedisParseData[0].deptId
                        }
                        let redisData = callEventDBactions.check_exsist_module_id(cachedRedisParseData, callData)
                        console.log('checking data result ....', redisData)
                        if (redisData) {
                            cachedRedisParseData.push(reportData);
                        }
                    }
                    if (callData.destinationType == 'pstn') {
                        cachedRedisParseData[0].destinationType = 'pstn'
                    }
                     redis.setex(callData.uniqueId+"_socket", 3600,JSON.stringify(cachedRedisParseData));
                    let connectedData = {
                        answeredTime: callData.eventTime,
                        currentStatus: 1,
                        user_id: callData.userId,
                        type: "incoming",
                        id_user: cachedRedisParseData[0].customerId,
                        destination: cachedRedisParseData[0].didNumber,
                        source: cachedRedisParseData[0].callerNumber,
                        deptId: cachedRedisParseData[0].deptId,
                        agentChannel: callData.agentChannel,
                        channel: cachedRedisParseData[0].sourceChannel,
                        uniqueId: cachedRedisParseData[0].uniqueId
                    }

                    callEventDBactions.update_livecall(connectedData, callData.uniqueId,"user",callData.agentChannel)

                }
            }
        }
        if (evt.userevent == "callAnswered") {
            console.log('inside user dial_answered in outgoing....', evt)
            console.log('inside user dial_answered in outgoing....', callData)
            //call connection event for user outgoing
            if (callData.type == "report") {
                if (callData.eventStatus == 'dial_answered') {
                    let cachedRedisStringData = await redis.get(callData.uniqueId+"_socket");
                    let cachedRedisParseData = JSON.parse(cachedRedisStringData)
                    if (cachedRedisParseData[0].callType != 'Transfer') {
                        cachedRedisParseData = [{
                            ...cachedRedisParseData[0],
                            answeredTime: callData.eventTime,
                            currentStatus: 1,
                            appId: callData.userId,
                            app: "user",
                            eventStatus: "dial_answered",
                            userId: callData.userId
                        },
                        ...cachedRedisParseData.slice(1)
                        ];
                    }else{
                        if (cachedRedisParseData[0].callType == 'Transfer') {
                            cachedRedisParseData = [{
                                ...cachedRedisParseData[0],
                                transferAnsweredTime: callData.eventTime,
                                currentStatus: 1,
                                appId: cachedRedisParseData[0].userId,
                                app: "user",
                                eventStatus: "dial_answered",
                                userId: cachedRedisParseData[0].userId
                            },
                            ...cachedRedisParseData.slice(1)
                            ];
                            if (cachedRedisParseData) {
                                cachedRedisParseData.push(callData); 
                            }
                            callData.userId = cachedRedisParseData[0].userId;
                            var transferCallData = await redis.get(cachedRedisParseData[0].transferCallUniqueId+"_socket");
                            transferCallData = JSON.parse(transferCallData)
                            transferCallData[0].isTransfer = 1
                            callEventDBactions.popup_end({ uniqueId: callData.uniqueId, userId: cachedRedisParseData[0].transferFrom,didNumber:transferCallData[0].didNumber,callerNumber:transferCallData[0].callerNumber,type:transferCallData[0].direction})
                            redis.setex(cachedRedisParseData[0].transferCallUniqueId+"_socket",3600,JSON.stringify(transferCallData));
                        }
                    }
                    if (cachedRedisParseData[0].callType == 'clickToCallSource') {
                        if (cachedRedisParseData) {
                            cachedRedisParseData.push(callData); 
                        }
                    }
                    if (cachedRedisParseData[0].callType == 'Internal') {
                        if(callData.callForwardNumber != undefined){
                            cachedRedisParseData[0].callForwardNumber = callData.callForwardNumber
                        }
                        if (cachedRedisParseData) {
                            cachedRedisParseData.push(callData); 
                        }
                    }
                    //second leg answred
                    if (cachedRedisParseData[0].clicktoCallScndLeg == 'clickToCallDestination') {
                        // cachedRedisParseData = [{
                        //     ...cachedRedisParseData[0],
                        //     clicktoCallAnswertTime: callData.eventTime,
                        // },
                        // ...cachedRedisParseData.slice(1)
                        // ];
                        callData.destinationNumber = cachedRedisParseData[0].dialedNumber;
                        cachedRedisParseData[0].clicktoCallAnswertTime = callData.eventTime
                        if (cachedRedisParseData) {
                            cachedRedisParseData.push(callData); 
                        }
                    }
                    if (cachedRedisParseData[0].connectSmartgroupCallScndLeg == 'connectSmartgroupDestination') {
                        callData.destinationNumber = cachedRedisParseData[0].dialedNumber;
                        cachedRedisParseData[0].connectSmartgroupCallAnswertTime = callData.eventTime
                        if (cachedRedisParseData) {
                            cachedRedisParseData.push(callData); 
                        }
                    }
                    //second leg answred callflow
                    if (cachedRedisParseData[0].callType == 'connectCallFlow') {
                        cachedRedisParseData = [{
                            ...cachedRedisParseData[0],
                            app: "callflow",
                            appId: callData.callFlowId,
                            callerNumber: cachedRedisParseData[0].dialedNumber,
                        },
                        ...cachedRedisParseData.slice(1)
                        ];
                    }
                    console.log('redis updation data user dial_answered in outgoing....', cachedRedisParseData)
                     redis.setex(callData.uniqueId+"_socket", 3600,JSON.stringify(cachedRedisParseData));

                    console.log('callData outgoing....', callData)
                    let connectedData = {
                        answeredTime: callData.eventTime,
                        currentStatus: 1,
                        user_id: callData.userId,
                        type: "outgoing",
                        id_user: cachedRedisParseData[0].customerId,
                        destination: cachedRedisParseData[0].didNumber,
                        source: cachedRedisParseData[0].dialedNumber,
                        deptId: cachedRedisParseData[0].deptId,
                        agentChannel: callData.agentChannel,
                        channel: cachedRedisParseData[0].sourceChannel,
                        uniqueId: cachedRedisParseData[0].uniqueId
                    }
                    if (cachedRedisParseData[0].callType == 'Transfer') {
                        connectedData.user_id = cachedRedisParseData[0].userId
                        connectedData.destination = cachedRedisParseData[0].dialedNumber
                        connectedData.source = transferCallData[0].callerNumber
                    }
                    callEventDBactions.update_livecall(connectedData, callData.uniqueId,"callAnswered",callData.agentChannel);

                }
            }
        }
        if (evt.userevent == "userSelectorApi") {
            console.log('inside userSelectorApi ....', evt)
            console.log('inside userSelectorApi ....', callData)
            if (callData.type == "report") {
                if (callData.eventStatus == 'dial_answered') {
                    let cachedRedisStringData = await redis.get(callData.uniqueId+"_socket");
                    let cachedRedisParseData = JSON.parse(cachedRedisStringData)
                        cachedRedisParseData = [{
                            ...cachedRedisParseData[0],
                            answeredTime: callData.eventTime,
                            currentStatus: 1,
                            eventStatus: "dial_answered",
                            userId:callData.userId
                        },
                        ...cachedRedisParseData.slice(1)
                        ];
                    if (cachedRedisParseData) {
                        cachedRedisParseData.push(callData); 
                    }
                    console.log('redis updation data user dial_answered in outgoing....', cachedRedisParseData)
                     redis.setex(callData.uniqueId+"_socket",3600, JSON.stringify(cachedRedisParseData));
                    let connectedData = {
                        answeredTime: callData.eventTime,
                        currentStatus: 1,
                        id_user: cachedRedisParseData[0].customerId,
                        deptId: cachedRedisParseData[0].deptId,
                        uniqueId: cachedRedisParseData[0].uniqueId
                    }
                    callEventDBactions.update_livecall(connectedData, callData.uniqueId,"callAnswered",callData.agentChannel);

                }
            }
        }
        if (evt.userevent == 'callFlowReport') {
            console.log('callFlowReport evnt....', evt)
            console.log('callFlowReport decodeURIComponent....', callData)
            // call flow event insert start here
            if (callData.type == "report") {
                let cachedRedisStringData = await redis.get(callData.uniqueId+"_socket");
                if (cachedRedisStringData) {
                let cachedRedisParseData = JSON.parse(cachedRedisStringData)
                //broadcast with callflow
                if (cachedRedisParseData[0].campaign == 'broadcast') {
                    if (callData.module == "start") {
                        cachedRedisParseData[0].appId = callData.callFlowId
                        callData.event = 'connect';
                        callData.dateTime = callData.eventTime;
                        callData.campaignId = cachedRedisParseData[0].campaignId
                        callData.contactStatusId = cachedRedisParseData[0].contactStatusId;
                        callData.customerId = cachedRedisParseData[0].customerId
                        campaignHelper.campaignCallEvent(callData)
                    }
                }
                let reportData = {
                    ...callData,
                    callFlowId: cachedRedisParseData[0].appId,
                    didNumber: cachedRedisParseData[0].didNumber,
                    callerNumber: cachedRedisParseData[0].callerNumber,
                    customerId: cachedRedisParseData[0].customerId,
                    deptId: cachedRedisParseData[0].deptId,

                }
                //saving detmf sequence and send to to admin socket
                if (callData.eventStatus == 'dtmf' && callData.dtmf != undefined) {
                    cachedRedisParseData[0].dtmfSequence = cachedRedisParseData[0].dtmfSequence != undefined ? cachedRedisParseData[0].dtmfSequence + "," + callData.dtmf : callData.dtmf
                    callEventDBactions.livecall_dtmf({ call_unique_id: callData.uniqueId, dtmfSeq: cachedRedisParseData[0].dtmfSequence, customerId: cachedRedisParseData[0].customerId })
                }
                if (callData.module == 'user') {
                    let moduleId = callData.moduleId
                    let user_id = await callEventDBactions.get_userId_by_call_flow_module_id(moduleId);
                    cachedRedisParseData[0].userId = user_id;
                    reportData = {
                        ...callData,
                        userId: user_id
                    }
                }
                if (callData.module == 'smsIntegration') {
                    let moduleId = callData.moduleId
                    callEventDBactions.callflowSmsAxiosCall(moduleId, cachedRedisParseData[0].callerNumber);
                    reportData = callData

                }
                if (callData.module == 'apiIntegration') {
                    let moduleId = callData.moduleId
                    callEventDBactions.callflowApiAxiosCall(moduleId, cachedRedisParseData[0].callerNumber);
                    reportData = callData

                }
                if (callData.module == 'whatsappIntegration') {
                    let moduleId = callData.moduleId
                    callEventDBactions.callflowWhatsappAxiosCall(moduleId, cachedRedisParseData[0].callerNumber);
                    reportData = callData

                }
                console.log('redisData  ....', reportData)
                let redisData = callEventDBactions.check_exsist_module_id(cachedRedisParseData, reportData)

                if (redisData) {
                    cachedRedisParseData.push(reportData);
                    console.log('callFlowReport insert call data after push....', cachedRedisParseData)
                }
                console.log('reportData updated data....', reportData)
                let getRedisData = await redis.get(callData.uniqueId);
                console.log('getRedisData....', getRedisData)
                if (getRedisData) {
                 await redis.setex(callData.uniqueId+"_socket",3600, JSON.stringify(cachedRedisParseData));
                }
            }

            }

        }
        if (evt.userevent == 'callcenter') {
            console.log('inside userevent callcenter ...', evt)
            console.log('inside userevent callcenter calldata....', callData)
            calleventlog("inside userevent callcenter ...")
            calleventlog(evt)
            calleventlog("inside userevent callcenter calldata....")
            calleventlog(callData)
            if (callData.event == "start") {
                var redisData = [{ ...callData, event: "start", campaign: "broadcast", id_user: callData.customerId }];
            } else if (callData.event == "connect") {
                var cachedRedisStringData = await redis.get(callData.uniqueId+"_socket");
                var cachedRedisParseData = JSON.parse(cachedRedisStringData)
                cachedRedisParseData.push(callData)
                var redisData = cachedRedisParseData;
            } else {
                if (callData.event != "login") {
                    var cachedRedisStringData = await redis.get(callData.uniqueId + "_socket");
                    var cachedRedisParseData = JSON.parse(cachedRedisStringData)
                    if (cachedRedisParseData.length != 0) {
                        cachedRedisParseData.push(callData)
                        var redisData = cachedRedisParseData;
                    } else {
                        var cachedRedisParseData = []
                        cachedRedisParseData.push(callData)
                        var redisData = cachedRedisParseData;
                    }
                }
            }
            console.log("redisData  --->", redisData)
             await redis.setex(callData.uniqueId+"_socket",3600, JSON.stringify(redisData));
            callData.id_user = callData.customerId
            if (callData.event == 'end') {
                var dtmfSequence = callEventDBactions.get_dtmf_sequence(cachedRedisParseData)
                console.log("dtmfSequence ---->", dtmfSequence);
                if (dtmfSequence) {
                    callData.dtmfSeq = dtmfSequence;
                    cachedRedisParseData[0].dtmf_sequence = dtmfSequence
                }
                cachedRedisParseData[0].endTime = callData.eventTime
                console.log("call flow end  redis data", cachedRedisParseData[0]);
                callData.userId = cachedRedisParseData[0].userId;
                // insert to smartgroup report if the the call is passed to smartgroup
                if (cachedRedisParseData[0].callTransferedTo == 'smargroup') {
                    console.log("call flow smart group data ---->", cachedRedisParseData)
                    let smartgroupData = callEventDBactions.get_smartgroup_datas(cachedRedisParseData)
                    let missedUserData = callEventDBactions.data_based_on_first_user_id(smartgroupData.result)
                    console.log("missedUserData --->", missedUserData)
                    smartgroupData.result[0].endTime = callData.eventTime
                }
            }
            campaignHelper.campaignCallEvent(callData)
        }
        if (evt.userevent == 'callEnd') {
            console.log('callEnd evnt....', evt)
            console.log('callEnd decodeURIComponent....', callData)
            calleventlog("callEnd evnt....")
            calleventlog(evt)
            calleventlog("callEnd callData---------------- >")
            calleventlog(callData)
            let cachedRedisStringData = await redis.get(callData.uniqueId+"_socket");
            let cachedRedisParseData = JSON.parse(cachedRedisStringData)
            calleventlog("callEnd cachedRedisParseData---------------- >")
            calleventlog(cachedRedisParseData)
            console.log("call end redis data ---------->", cachedRedisParseData);
            if (cachedRedisParseData.length != 0) {
                if (cachedRedisParseData[0].isTransfer == 1) {
                    if (cachedRedisParseData) {
                        cachedRedisParseData[0].crFile = callData.crFile;
                        cachedRedisParseData[0].callStatus = callData.callStatus;
                        cachedRedisParseData[0].endTime = callData.eventTime;
                        await redis.setex(callData.uniqueId + "_socket", 3600, JSON.stringify(cachedRedisParseData));
                    }
                }
                if (cachedRedisParseData[0].uniqueId == callData.uniqueId) {
                    values = {
                        call_flow_id: callData.call_flow_id,
                        call_flow_module: callData.module,
                        end_time: callData.eventTime,
                        call_unique_id: cachedRedisParseData[0].uniqueId,
                        did_number: callData.didNumber,
                        source_number: callData.callerNumber,
                        module_id: callData.module_id,
                        cr_file: callData.crFile,
                        callStatus: callData.callStatus
                    };
                    if ((callData.callType != "" && callData.callType != 'clickToCallSource') || (callData.callType != "" && callData.callType != 'connectSmartgroupSource')) {
                        values.cr_file = callData.crFile
                        values.callStatus = callData.callStatus
                    }
                    if (cachedRedisParseData[0].clicktoCallScndLeg != undefined && callData.callType == 'clickToCallSource' && cachedRedisParseData[0].clicktoCallAnswertTime == undefined) {
                        values.callStatus = 'CANCEL'
                    }
                    if (cachedRedisParseData[0].connectSmartgroupCallScndLeg != undefined && callData.callType == 'connectSmartgroupSource' && cachedRedisParseData[0].connectSmartgroupCallAnswertTime == undefined) {
                        values.callStatus = 'CANCEL'
                    }
                    cachedRedisParseData[0].endTime = callData.eventTime
                }
                if (cachedRedisParseData[0].clicktoCallScndLeg == 'clickToCallDestination') {
                    if (cachedRedisParseData) {
                        cachedRedisParseData.push(callData);
                    }
                }
                if (cachedRedisParseData[0].connectSmartgroupCallScndLeg == 'connectSmartgroupDestination') {
                    if (cachedRedisParseData) {
                        cachedRedisParseData.push(callData);
                    }
                }
                if (cachedRedisParseData[0].callType == 'Internal') {
                    if (cachedRedisParseData) {
                        cachedRedisParseData.push(callData);
                    }
                }
                if (cachedRedisParseData[0].callType == 'Transfer') {
                    if (cachedRedisParseData) {
                        cachedRedisParseData.push(callData);
                    }
                }
                if (cachedRedisParseData[0].app == 'smartgroup') {
                    console.log('smartgroup create redisData....', cachedRedisParseData)
                    console.log("cachedRedisParseData --->", cachedRedisParseData)
                    // values.callStatus = 'ANSWERED'
                    if (values.callStatus == '') {          // The 'Channel Limit Exceeded' status was not displayed because it was replaced with 'Answered'. Therefore, it was changed.
                        values.callStatus = 'ANSWERED'
                    } else {
                        values.callStatus = callData.callStatus
                    }
                    console.log("cachedRedisParseData.triedUsersIds --->", cachedRedisParseData[0].triedUsersIds)
                    if (cachedRedisParseData[0].answeredTime == undefined && cachedRedisParseData[0].ringType == 5) {
                        if (cachedRedisParseData[0].triedUsersIds != undefined && cachedRedisParseData[0].ringType == 5) {
                            var missedUserDataId = cachedRedisParseData[0].triedUsersIds.split('&');
                            cachedRedisParseData[0].firstTriedUser = missedUserDataId[0];
                            cachedRedisParseData[0].lastTriedUser = missedUserDataId[1];
                            console.log("call flow smart group cachedRedisParseData  ---->", cachedRedisParseData[0])
                        }
                    } else {
                        if (cachedRedisParseData[0].triedUsersIds == undefined) {
                            let missedUserData = callEventDBactions.data_based_on_first_user_id(cachedRedisParseData)
                            console.log("missedUserData --->", missedUserData)
                            if (missedUserData != undefined) {
                                cachedRedisParseData[0].firstTriedUser = missedUserData.result[0].firstTriedUser;
                                cachedRedisParseData[0].lastTriedUser = missedUserData.result[0].lastTriedUser;
                                console.log("call flow smart group cachedRedisParseData  ---->", cachedRedisParseData[0])
                            }
                        }
                    }
                    console.log("cachedRedisParseData userId undefined chacking ---->", cachedRedisParseData[0].userId)
                    if (cachedRedisParseData[0].userId == undefined) {
                        var smargroupRes = await callEventDBactions.smartgroup_missedcall_user(cachedRedisParseData[0].appId)
                        if (smargroupRes.length != 0) {
                            console.log("smargroup show_missedcall_to ----->", smargroupRes[0].show_missedcall_to)
                            if (smargroupRes[0].show_missedcall_to == 1) {
                                cachedRedisParseData[0].userId = cachedRedisParseData[0].firstTriedUser;
                                cachedRedisParseData[0].smartGroupUserId = cachedRedisParseData[0].firstTriedUser;
                                var userStatusFunRes = await callEventDBactions.get_user_status_first_tried(cachedRedisParseData, cachedRedisParseData[0].firstTriedUser)
                                if (userStatusFunRes != undefined) {
                                    console.log("dialStatus -------------->", userStatusFunRes.dialStatus)
                                    if (userStatusFunRes.dialStatus != undefined) {
                                        values.userStatus = userStatusFunRes.dialStatus
                                    }
                                }
                            }
                            if (smargroupRes[0].show_missedcall_to == 2) {
                                cachedRedisParseData[0].userId = cachedRedisParseData[0].lastTriedUser;
                                cachedRedisParseData[0].smartGroupUserId = cachedRedisParseData[0].lastTriedUser;
                                var userStatusFunRes = await callEventDBactions.get_user_status_last_tried(cachedRedisParseData, cachedRedisParseData[0].lastTriedUser)
                                if (userStatusFunRes != undefined) {
                                    console.log("dialStatus -------------->", userStatusFunRes.dialStatus)
                                    if (userStatusFunRes.dialStatus != undefined) {
                                        values.userStatus = userStatusFunRes.dialStatus
                                    }
                                }
                            }
                        }
                    }
                }
                if (cachedRedisParseData[0].app == 'callflow') {
                    var dtmfSequence = callEventDBactions.get_dtmf_sequence(cachedRedisParseData)
                    console.log("dtmfSequence ---->", dtmfSequence);
                    if (dtmfSequence) {
                        cachedRedisParseData[0].dtmf_sequence = dtmfSequence
                    }
                    console.log("call flow end  redis data", cachedRedisParseData[0]);
                    // values.callStatus = 'ANSWERED'
                    if (values.callStatus == '') {          // The 'Channel Limit Exceeded' status was not displayed because it was replaced with 'Answered'. Therefore, it was changed.
                        values.callStatus = 'ANSWERED'
                    } else {
                        values.callStatus = callData.callStatus
                    }
                    // insert to smartgroup report if the the call is passed to smartgroup
                    if (cachedRedisParseData[0].callTransferedTo == 'smargroup') {
                        // cachedRedisParseData[0].isCallFlow = 1
                        console.log("call flow smart group data ---->", cachedRedisParseData)
                        // let smartgroupData = callEventDBactions.get_smartgroup_datas(cachedRedisParseData)
                        // let missedUserData = callEventDBactions.data_based_on_first_user_id(smartgroupData.result)
                        // console.log("missedUserData --->", missedUserData)
                        var smartgroupData = callEventDBactions.get_smartgroup_datas(cachedRedisParseData)
                        if (cachedRedisParseData[0].answeredTime == undefined && cachedRedisParseData[0].ringType == 5) {
                            if (cachedRedisParseData[0].triedUsersIds != undefined && cachedRedisParseData[0].ringType == 5) {
                                var missedUserDataId = cachedRedisParseData[0].triedUsersIds.split('&');
                                cachedRedisParseData[0].firstTriedUser = missedUserDataId[0];
                                cachedRedisParseData[0].lastTriedUser = missedUserDataId[1];
                                console.log("call flow smart group cachedRedisParseData  ---->", cachedRedisParseData[0])
                            }
                        } else {
                            if (cachedRedisParseData[0].triedUsersIds == undefined) {
                                var missedUserData = callEventDBactions.data_based_on_first_user_id(smartgroupData.result)
                                console.log("missedUserData --->", missedUserData)
                                if (missedUserData != undefined) {
                                    cachedRedisParseData[0].firstTriedUser = missedUserData.result[0].firstTriedUser;
                                    cachedRedisParseData[0].lastTriedUser = missedUserData.result[0].lastTriedUser;
                                    console.log("call flow smart group cachedRedisParseData  ---->", cachedRedisParseData[0])
                                }
                            }
                        }
                        console.log("cachedRedisParseData userId undefined chacking ---->", cachedRedisParseData[0].userId)
                        if (cachedRedisParseData[0].userId == undefined) {
                            console.log("smartgroup ----------------->", smartgroupData.result)
                            console.log("smartgroupid ----------------->", smartgroupData.result[0].appId)
                            var smargroupRes = await callEventDBactions.smartgroup_missedcall_user(smartgroupData.result[0].appId)
                            if (smargroupRes.length != 0) {
                                console.log("smargroup show_missedcall_to ----->", smargroupRes[0].show_missedcall_to)
                                if (smargroupRes[0].show_missedcall_to == 1) {
                                    cachedRedisParseData[0].userId = cachedRedisParseData[0].firstTriedUser;
                                    cachedRedisParseData[0].smartGroupUserId = cachedRedisParseData[0].firstTriedUser;
                                    var userStatusFunRes = await callEventDBactions.get_user_status_first_tried(cachedRedisParseData, cachedRedisParseData[0].firstTriedUser)
                                    if (userStatusFunRes != undefined) {
                                        console.log("dialStatus -------------->", userStatusFunRes.dialStatus)
                                        if (userStatusFunRes.dialStatus != undefined) {
                                            values.userStatus = userStatusFunRes.dialStatus
                                        }
                                    }
                                }
                                if (smargroupRes[0].show_missedcall_to == 2) {
                                    cachedRedisParseData[0].userId = cachedRedisParseData[0].lastTriedUser;
                                    cachedRedisParseData[0].smartGroupUserId = cachedRedisParseData[0].lastTriedUser;
                                    var userStatusFunRes = await callEventDBactions.get_user_status_last_tried(cachedRedisParseData, cachedRedisParseData[0].lastTriedUser)
                                    if (userStatusFunRes != undefined) {
                                        console.log("dialStatus -------------->", userStatusFunRes.dialStatus)
                                        if (userStatusFunRes.dialStatus != undefined) {
                                            values.userStatus = userStatusFunRes.dialStatus
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (cachedRedisParseData[0].direction == 'outgoing') {
                    if (cachedRedisParseData[0].didOutSms == 1) {
                        console.log("is_user ----------------------------->", cachedRedisParseData[0].customerId)
                        callEventDBactions.send_sms_rate(cachedRedisParseData[0].customerId)
                    }
                }
                if (cachedRedisParseData[0].direction == 'incoming') {
                    if (cachedRedisParseData[0].didInSms == 1) {
                        console.log("is_user ----------------------------->", cachedRedisParseData[0].customerId)
                        callEventDBactions.send_sms_rate(cachedRedisParseData[0].customerId)
                    }
                }
                var triedAgents = callEventDBactions.get_trieduser(cachedRedisParseData)
                if (triedAgents) {
                    cachedRedisParseData[0].tried_agents = triedAgents
                }
                if (cachedRedisParseData[0].callType == 'callTaskDestination') {
                    console.log("user_id (callType is callTask) ----------------------------->", cachedRedisParseData[0].userId)
                    callEventDBactions.call_task_end(cachedRedisParseData[0].userId, cachedRedisParseData[0].callProcessId)

                }
                console.log('values ....', values)
                if (cachedRedisParseData[0].callType == 'clickToCallSource' || cachedRedisParseData[0].callType == 'clickToCallDestination') {
                    console.log('clicktoCallAnswertTime ------------->', cachedRedisParseData[0].clicktoCallAnswertTime)
                    console.log('callData callType ------------->', callData.callType)

                    if (cachedRedisParseData[0].clicktoCallAnswertTime != undefined && callData.callType == 'clickToCallDestination') {
                        if (cachedRedisParseData[0].app == 'user' || cachedRedisParseData[0].direction == 'outgoing') {
                            if (cachedRedisParseData[0].direction == 'outgoing') { cachedRedisParseData[0].appId = cachedRedisParseData[0].userId }

                        }
                        callEventDBactions.insert_callreport(cachedRedisParseData[0], values)
                    } else if (cachedRedisParseData[0].clicktoCallAnswertTime == undefined && callData.callType == 'clickToCallDestination') {
                        if (cachedRedisParseData[0].app == 'user' || cachedRedisParseData[0].direction == 'outgoing') {
                            if (cachedRedisParseData[0].direction == 'outgoing') { cachedRedisParseData[0].appId = cachedRedisParseData[0].userId }

                        }
                        callEventDBactions.insert_callreport(cachedRedisParseData[0], values)
                    }
                } else if (cachedRedisParseData[0].callType == 'connectSmartgroupSource' || cachedRedisParseData[0].callType == 'connectSmartgroupDestination') {
                    console.log('connectSmartgroupCallAnswertTime ------------->', cachedRedisParseData[0].connectSmartgroupCallAnswertTime)
                    console.log('callData callType ------------->', callData.callType)

                    if (cachedRedisParseData[0].connectSmartgroupCallAnswertTime != undefined && callData.callType == 'connectSmartgroupDestination') {
                        if (cachedRedisParseData[0].app == 'user' || cachedRedisParseData[0].direction == 'outgoing') {
                            if (cachedRedisParseData[0].direction == 'outgoing') { cachedRedisParseData[0].appId = cachedRedisParseData[0].userId }

                        }
                        callEventDBactions.insert_callreport(cachedRedisParseData[0], values)
                    } else if (cachedRedisParseData[0].connectSmartgroupCallAnswertTime == undefined && callData.callType == 'connectSmartgroupDestination') {
                        if (cachedRedisParseData[0].app == 'user' || cachedRedisParseData[0].direction == 'outgoing') {
                            if (cachedRedisParseData[0].direction == 'outgoing') { cachedRedisParseData[0].appId = cachedRedisParseData[0].userId }

                        }
                        callEventDBactions.insert_callreport(cachedRedisParseData[0], values)
                    }
                } else if (callData.callType != "" && callData.callType != 'clickToCallSource' && callData.callType != 'clickToCallDestination') {

                    if (callData.callType != 'connectSmartgroupSource' && callData.callType != 'connectSmartgroupDestination') {
                        if (cachedRedisParseData[0].app == 'user' || cachedRedisParseData[0].direction == 'outgoing') {
                            if (cachedRedisParseData[0].direction == 'outgoing') { cachedRedisParseData[0].appId = cachedRedisParseData[0].userId }

                        }
                    } else {
                        if (cachedRedisParseData[0].app == 'user' || cachedRedisParseData[0].direction == 'outgoing') {
                            if (cachedRedisParseData[0].direction == 'outgoing') { cachedRedisParseData[0].appId = cachedRedisParseData[0].userId }

                        }
                    }
                    if (callData.callType == 'Transfer') {
                        console.log("cachedRedisParseData in new collection ----- >", cachedRedisParseData)
                        callEventDBactions.add_user_call_reports_api(cachedRedisParseData)
                        let dalldata = await redis.get(cachedRedisParseData[0].parentUniqueId + "_socket");
                        let dalldataParse = JSON.parse(dalldata)
                        console.log("parent data in end  ----- >", dalldataParse)
                        if (dalldataParse) {
                            cachedRedisParseData[0].parentCrFile = dalldataParse[0].crFile;
                            cachedRedisParseData[0].parentCallStatus = dalldataParse[0].callStatus;
                            cachedRedisParseData[0].parentCallendTime = dalldataParse[0].endTime;
                            values.cr_file = dalldataParse[0].crFile;
                            values.callStatus = dalldataParse[0].callStatus;
                            await redis.setex(cachedRedisParseData[0].uniqueId + "_socket", 3600, JSON.stringify(cachedRedisParseData));
                            redis.del(cachedRedisParseData[0].parentUniqueId + "_socket");
                        }
                        callEventDBactions.call_transfer_report(cachedRedisParseData[0], callData)
                    }
                }
                if (cachedRedisParseData[0].isTransfer != 1) {
                    callEventDBactions.insert_callreport(cachedRedisParseData[0], values)
                    redis.del(callData.uniqueId + "_socket");
                }
            }
        }
    } catch (error) {
        console.error("Error processing developmentCallEvent:", error);
    }
};
async function click_to_call(data, ip) {
    try {
        var result = await callEventDBactions.click_to_call(data, ip)
        return result
    } catch (error) {
        console.error("click_to_call:", error);
        return error
    }
};
async function connect_with_call_flow(data) {
    try {
        var result = await callEventDBactions.connect_with_call_flow(data)
        return result
    } catch (error) {
        console.error("connect_with_call_flow:", error);
        return error
    }
};
async function connect_with_smartgroup(data) {
    try {
        var result = await callEventDBactions.connect_with_smartgroup(data)
        return result
    } catch (error) {
        console.error("connect_with_smartgroup:", error);
        return error
    }
};
async function call_task_click_to_call(data) {
    try {
        var result = await callEventDBactions.call_task_click_to_call(data)
        return result
    } catch (error) {
        console.error("click_to_call:", error);
        return error
    }
};
async function didSettings() {
    try {
        var result = await callEventDBactions.didSettings()
        return result
    } catch (error) {
        console.error("didFuction:", error);
        return error
    }
};
async function startCampaign(logDataJson) {
    try {
        console.log("callData  ----->", logDataJson)
        var result = await socketHelper.startCampaign(logDataJson)
        return result
    } catch (error) {
        console.error("startCampaign function:", error);
        return error
    }
};
async function campaignAgentLogout(logDataJson) {
    try {
        var result = await socketHelper.campaignAgentLogout(logDataJson)
        return result
    } catch (error) {
        console.error("campaignAgentLogout Fuction:", error);
        return error
    }
};
async function campaignDestinationChannel(logDataJson) {
    try {
        var result = await socketHelper.campaignDestinationChannel(logDataJson)
        return result
    } catch (error) {
        console.error(" campaignDestinationChannel Fuction:", error);
        return error
    }
};
async function campaignSourceChannel(logDataJson, status) {
    try {
        var result = await socketHelper.campaignSourceChannel(logDataJson, status)
        return result
    } catch (error) {
        console.error(" campaignSourceChannel Fuction:", error);
        return error
    }
};
async function connectedCampaigncall(logDataJson) {
    try {
        var result = await socketHelper.connectedCampaigncall(logDataJson)
        return result
    } catch (error) {
        console.error(" connectedCampaigncall Fuction:", error);
        return error
    }
};
async function click_to_call_end(logDataJson) {
    try {
        var result = await socketHelper.click_to_call_end(logDataJson)
        return result
    } catch (error) {
        console.error(" click_to_call_end Fuction:", error);
        return error
    }
};
async function agentActivityCallSocket(agentId,id_user,type,id_department) {
    try {
        var result = await callEventDBactions.agentActivityCallSocket(agentId,id_user,type,id_department)
        return result
    } catch (error) {
        console.error(" click_to_call_end Fuction:", error);
        return error
    }
};
async function agentActivityCountSocket(agentId,id_user,id_department) {
    try {
        var result = await callEventDBactions.agentActivityCountSocket(agentId,id_user,id_department)
        return result
    } catch (error) {
        console.error(" error:", error);
        return error
    }
};
async function agentActivityCallHoldSocket(agentId,id_user,type,id_department) {
    try {
        var result = await callEventDBactions.agentActivityCallHoldSocket(agentId,id_user,type,id_department)
        return result
    } catch (error) {
        console.error(" error:", error);
        return error
    }
};
module.exports = {
    developmentCallEvent,
    click_to_call,
    connect_with_call_flow,
    connect_with_smartgroup,
    call_task_click_to_call,
    didSettings,
    startCampaign,
    campaignAgentLogout,
    campaignDestinationChannel,
    campaignSourceChannel,
    connectedCampaigncall,
    click_to_call_end,
    agentActivityCallSocket,
    agentActivityCountSocket,
    agentActivityCallHoldSocket
};