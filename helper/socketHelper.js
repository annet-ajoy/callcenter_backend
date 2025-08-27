const sequelize = require('../database').db;
const {  string_decode } = require('../helper/auth');
if(process.env.PRODUCTION == 'development'){
    var { adminSocket, userSocket } = require('./developmentSocket');
}else{
    var { adminSocket, userSocket } = require('./liveSocket');
}

async function trigger_agent_call(logDataJson) {          //call connect 
    var agentId = logDataJson.agentId;
    var id_user = Number(logDataJson.id_user)
    // id_user = 'admin_' + `${id_user}`;
    var result = [];
    try {
        var currentDate = new Date();
        var obj = {
            id: logDataJson.callId,
            phnNo: logDataJson.phnNo,
            type: logDataJson.type,
            time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
            didNumber: logDataJson.didNumber,
            agentChannel: logDataJson.agentChannel,
            channel: logDataJson.channel,
            event: logDataJson.event
        }
        if (logDataJson.template != undefined && logDataJson.template != 0) {
            var [result1] = await sequelize.query("SELECT id,id_module FROM templates WHERE id = " + logDataJson.template);
            if (result1[0].length != 0) {
                obj.module = result1[0].id_module;
            }
            obj.template = logDataJson.template
        }
        if (logDataJson.dtmfNo != undefined) {
            obj.dtmfNo = logDataJson.dtmfNo
        }
        if (logDataJson.dtmfName != undefined) {
            obj.dtmfName = logDataJson.dtmfName
        }
        if (logDataJson.deptId != undefined && logDataJson.deptId != 0) {
            obj.deptId = logDataJson.deptId
        }
        if (logDataJson.type == 'incoming') {
            if (logDataJson.event == 'start') {
                obj.currentCallStatus = 1
            } if (logDataJson.event == 'connect') {
                obj.currentCallStatus = 2
            }
        } if (logDataJson.type == 'outgoing') {
            if (logDataJson.event == 'start') {
                obj.currentCallStatus = 3
            } if (logDataJson.event == 'connect') {
                obj.currentCallStatus = 4
            }
        }
        if (logDataJson.type == 'outgoing') {
            if (agentId != undefined) agentId = Number(agentId)
            obj.agentId = agentId;
        } else {
            obj.regNumber = logDataJson.agentId;
            var sql = `select id,phn_number_mask from agents where regNumber='${obj.regNumber}'`
            var [agentId] = await sequelize.query(sql)
            if (agentId.length != 0) {
                if (agentId[0].phn_number_mask == 1) {
                    var phone_number = await string_decode(obj.phnNo);
                    if (phone_number) {
                        obj.phnNo = phone_number;
                    }

                }
                obj.agentId = agentId[0].id;
                agentId = agentId[0].id;
            } else {
                agentId = "";
            }
        }
        const [results] = await customerPhnNumberModel.find({ phone_number: logDataJson.phnNo });
        if (results) {
            obj.customerName = results.name
        }
        if (agentId && agentId != undefined)
            var msg = 'adminSocketCall'
        var socket = await adminSocket(id_user, msg, obj);
        var msg1 = 'liveCallReport'
        var socket1 = await adminSocket(id_user, msg1);
        var msg2 = 'receivedMessage'
        var socket2 = await adminSocket(agentId, msg2, obj);
        //   io.to(agentId).emit('receivedMessage', obj);
        //   io.to(id_user).emit('adminSocketCall', { obj });
        //   io.to(id_user).emit('liveCallReport');
    }

    catch (err) {
        console.log(err)
    }
    return "succesfull response";
}
async function trigger_agent_call_startEvent(logDataJson) {            //call start outgoing
    var agentId = logDataJson.agentId;
    var id_user = Number(logDataJson.id_user)
    // id_user = 'admin_' + `${id_user}`;
    var result = [];
    try {
        var currentDate = new Date();
        var obj = {
            id: logDataJson.callId,
            phnNo: logDataJson.phnNo,
            type: logDataJson.type,
            time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
            didNumber: logDataJson.didNumber,
            agentChannel: logDataJson.agentChannel,
            channel: logDataJson.channel,
            event: logDataJson.event
        }
        if (logDataJson.template != undefined && logDataJson.template != 0) {
            var [result1] = await sequelize.query("SELECT id,id_module FROM templates WHERE id = " + logDataJson.template);
            if (result1[0].length != 0) {
                obj.module = result1[0].id_module;
            }
            obj.template = logDataJson.template
        }
        if (logDataJson.dtmfNo != undefined) {
            obj.dtmfNo = logDataJson.dtmfNo
        }
        if (logDataJson.dtmfName != undefined) {
            obj.dtmfName = logDataJson.dtmfName
        }
        if (logDataJson.deptId != undefined && logDataJson.deptId != 0) {
            obj.deptId = logDataJson.deptId
        }
        if (logDataJson.type == 'outgoing') {
            if (agentId != undefined) {
                agentId = Number(agentId)
                obj.agentId = agentId;
            }
        } else {
            obj.regNumber = logDataJson.agentId;
            var sql = `select id from agents where regNumber='${obj.regNumber}'`
            var [agentId] = await sequelize.query(sql)
            if (agentId.length != 0) {
                obj.agentId = agentId[0].id;
                agentId = agentId[0].id;
            } else {
                agentId = "";
            }
        }
        if (agentId && agentId != undefined)
            var msg = 'adminSocketCall'
        var socket = await adminSocket(id_user, msg, obj);
        var msg1 = 'dashboardLivecalls'
        var socket1 = await adminSocket(id_user, msg1);
        var msg2 = 'receivedStartCallMessage'
        var socket2 = await adminSocket(agentId, msg2, obj);
        // io.to(agentId).emit('receivedStartCallMessage', obj);
        // io.to(id_user).emit('adminSocketCall', { obj });
        // io.to(id_user).emit('dashboardLivecalls');
    }
    catch (err) {
        console.log(err)
    }
    return "succesfull response";
}
async function trigger_agent_call_end(logDataJson) {          //call end
    var agentId = logDataJson.agentId;
    var id_user = Number(logDataJson.id_user)
    // id_user = 'admin_' + `${id_user}`;
    var result = [];
    var currentDate = new Date();
    try {
        var obj = {
            phnNo: logDataJson.phnNo,
            type: logDataJson.type,
            agentId: agentId,
            time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
            didNumber: logDataJson.didNumber,
            event: logDataJson.event,
            currentCallStatus: 5
        }
        if (logDataJson.template != undefined) {
            obj.template = logDataJson.template
        }
        obj.id = logDataJson.callId
        if (logDataJson.type == 'outgoing') {
            if (agentId != undefined) agentId = Number(agentId)
        } else {
            obj.regNumber = logDataJson.agentId;
            var sql = `select id from agents where regNumber='${logDataJson.agentId}'`
            var [agentId] = await sequelize.query(sql)
            if (agentId.length != 0) {
                obj.agentId = agentId[0].id;
                agentId = agentId[0].id;
            } else {
                agentId = "";
            }
        }
    }
    catch (err) {
        console.log(err)
    }
    if (agentId && agentId != undefined)
        setTimeout(async () => {
            var msg = 'adminSocketCall'
            var socket = await adminSocket(id_user, msg, obj);
        }, 5000);
    var msg1 = 'dashboardLivecalls'
    var socket1 = await adminSocket(id_user, msg1);
    var msg2 = 'receivedEndCallMessage'
    var socket2 = await adminSocket(agentId, msg2, obj);
    //     io.to(agentId).emit('receivedEndCallMessage', obj);
    // //set delay for updating call data in db
    // setTimeout(() => {
    //     io.to(id_user).emit('adminSocketCall', { obj });
    // }, 5000);
    // io.to(id_user).emit('dashboardLivecalls');
    return "succesfull response";
}
async function trigger_agent_call_start(logDataJson) {   // call start incoming
    try {
        var obj = {}
        var msg = 'dashboardLivecalls'
        var socket = await adminSocket(logDataJson.id_user, msg, obj);
    }
    catch (err) {
        console.log(err)
    }
    return "succesfull response";
}

async function startCampaign(logDataJson) {       //campaign agent login
    try {
        var userId = logDataJson.agentId;
        var channel = logDataJson.channel;
        var id_campaign = logDataJson.campaignId;
        var id_user = Number(logDataJson.customerId);
        console.log("id_user ----------->",id_user)
        console.log("userId ----------->",userId)
        if (userId != undefined) {
            userId = Number(userId)
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            var hours = today.getHours();
            var min = today.getMinutes();
            var sec = today.getSeconds();
            var date = `${yyyy}-${mm}-${dd}`
            var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`
            var loginUpdate = `UPDATE cc_user_campaign SET currentStatus = '1',loginStartTime = '${todayDate}',agentChannel = '${channel}' WHERE user_id = '${userId}' and id_campaign = '${id_campaign}'`;
            var [loginUpdateRes] = await sequelize.query(loginUpdate);
            var campaignSummary = `UPDATE cc_campaign_call_summary SET agent_on_live = agent_on_live + 1 WHERE campaign_id = '${id_campaign}' and user_id = '${userId}' AND DATE(createdAt) = '${date}' `;
            var [campaignSummaryRes] = await sequelize.query(campaignSummary);
            console.log("campaignSummaryRes ----------->",campaignSummaryRes)
            console.log("campaignSummary ----------->",campaignSummary)
            var agentNameSql = `select CONCAT(user.first_name, ' ', user.last_name) AS name from user where id = '${userId}'`;
            var [agentNameRes] = await sequelize.query(agentNameSql);
            var msg = 'startCampaign'
            var socket = await userSocket(userId, msg, channel);
            var msg = 'adminCampaignLiveReport'
            var socket1 = await adminSocket(id_user, msg);
            var liveReportObj = {
                agentId: userId,
                status: "available",
                event: "login",
                name: agentNameRes[0].name,
                campaignId: id_campaign
            }
            var msg = 'campaignLiveReportAgent'
            var socket2 = await adminSocket(id_user, msg, liveReportObj);
            var msg = 'agentCampaignReport'
            var socket3 = await userSocket(userId, msg);
        }
    }
    catch (err) {
        console.log(err)
    }
    return "succesfull response";
}
async function campaignAgentLogout(logDataJson) {             //campaign agent logout
    try {
        var id_campaign = logDataJson.campaignId;
        var userId = Number(logDataJson.agentId);
        var id_user = Number(logDataJson.customerId);
        console.log("id_user ----------->",id_user)
        console.log("campaignAgentLogout.............................", userId)
        var socket = await userSocket(userId, 'campaignAgentLogout', userId);
        var socket1 = await adminSocket(id_user, 'adminCampaignLiveReport');
        var socket2 = await userSocket(userId, 'agentCampaignReport', id_campaign);
        var agentNameSql = `select CONCAT(user.first_name, ' ', user.last_name) AS name from user where id = '${userId}'`;
        var [agentNameRes] = await sequelize.query(agentNameSql);
        var liveReportObj = {
            agentId: userId,
            status: "logout",
            event: "logout",
            name: agentNameRes[0].name,
            campaignId: id_campaign
        }
        var socket = await adminSocket(id_user, 'campaignLiveReportAgent',liveReportObj);
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var hours = today.getHours();
        var min = today.getMinutes();
        var sec = today.getSeconds();
        var date = `${yyyy}-${mm}-${dd}`
        var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`
        var loginUpdate = `UPDATE cc_user_campaign SET currentStatus = '0',logoutTime = '${todayDate}' WHERE user_id = '${userId}' and id_campaign = '${id_campaign}'`;
        var [loginUpdateRes] = await sequelize.query(loginUpdate);
        var campaignSummary = `UPDATE cc_campaign_call_summary SET agent_on_live = CASE WHEN (agent_on_live > 0) THEN agent_on_live - 1 ELSE 0 END WHERE  campaign_id = '${id_campaign}' and user_id IN (${userId}) AND DATE(createdAt) = '${date}' `;
        var [campaignSummaryRes] = await sequelize.query(campaignSummary);
    }
    catch (err) {
        console.log(err)
    }
    return "succesfull response";
}
async function campaignDestinationChannel(logDataJson,status) {    // camapaign cal dial event
    try {
        var agentId = logDataJson.agentId;
        var id_campaign = logDataJson.campaignId;
        var phonebook_id = logDataJson.phoneBookId;
        var destinationChannel = logDataJson.destinationChannel;
        var delay_time = logDataJson.delay_time;
        var uniqueId = logDataJson.uniqueId;
        var status =  status;
        var id_user = Number(logDataJson.customerId);
        console.log("id_user ----------->",id_user)
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var date = `${yyyy}-${mm}-${dd}`
        if (agentId != undefined) {
            agentId = Number(agentId)
            var campaignSummary = `UPDATE cc_campaign_call_summary SET delay_time = '${delay_time}' WHERE campaign_id = '${id_campaign}' and phonebook_id = '${phonebook_id}' and user_id = '${agentId}' AND DATE(createdAt) = '${date}' `;
            var [campaignSummaryRes] = await sequelize.query(campaignSummary);
            var socket = await userSocket(agentId, 'campaignDestinationChannel', destinationChannel);
        }
        var socket2 = await adminSocket(id_user, 'adminCampaignLiveReport');
        var livecallObj = {
            uniqueId: uniqueId,
            status: status
        }
        console.log("liveCalls............................", livecallObj)
        var socket3 = await adminSocket(id_user, 'liveCalls', {livecallObj});
        var socket4 = await adminSocket(id_user, 'dashboardLivecalls');
    }
    catch (err) {
        console.log(err)
    }
    return "succesfull response";
}
async function campaignSourceChannel(logDataJson,status) {            //start campagin call (event)
    try {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var hours = today.getHours();
        var min = today.getMinutes();
        var sec = today.getSeconds();
        var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`
        var agentId = logDataJson.agentId;
        var sourceChannel = logDataJson.sourceChannel;
        var uniqueId = logDataJson.uniqueId;
        var status =  status;
        var id_campaign = logDataJson.campaignId;
        var id_user = Number(logDataJson.customerId);
        console.log("id_user --------------->",id_user)
        var obj = {
            sourceChannel: sourceChannel,
            uniqueId: uniqueId
        }
       
        if (agentId != undefined) {
            agentId = Number(agentId)
            var liveReportObj = {
                agentId: agentId,
                status: "on_call",
                event: "start",
                campaignId: id_campaign
            }
            var socket = await userSocket(agentId, 'campaignSourceChannel', {obj});
            var socket3 = await adminSocket(id_user, 'campaignLiveReportAgent',liveReportObj);
            var loginUpdate = `UPDATE user_live_data SET currentCallStatus = '3' WHERE user_id = '${agentId}' `;
            var [loginUpdateRes] = await sequelize.query(loginUpdate);
        }
        var livecallObj = {
            uniqueId: uniqueId,
            status: status
        }
        console.log("liveCalls............................", livecallObj)
        var socket1 = await adminSocket(id_user, 'adminCampaignLiveReport');
        var socket2 = await adminSocket(id_user, 'liveCalls',{livecallObj});
    }
    catch (err) {
        console.log(err)
    }
    return "succesfull response";
}
async function connectedCampaigncall(logDataJson,status) {          //connect campagin call event
    try {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var hours = today.getHours();
        var min = today.getMinutes();
        var sec = today.getSeconds();
        var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`
        var agentId = logDataJson.agentId;
        var uniqueId = logDataJson.uniqueId;
        var status =  status;
        var campaignId = logDataJson.campaignId;
        var id_user = Number(logDataJson.customerId);
        console.log("id_user ----------->",id_user)
        if (agentId != undefined) {
            agentId = Number(agentId)
            var liveReportObj = {
                agentId: agentId,
                status: "on_call",
                event: "connect",
                campaignId: campaignId
            }
            var socket = await userSocket(agentId, 'connectedCampaigncall', agentId);
            var socket3 = await adminSocket(id_user, 'campaignLiveReportAgent',liveReportObj);
            var loginUpdate = `UPDATE user_live_data SET currentCallStatus = '4',currentCallAnsTime = '${todayDate}' WHERE user_id = '${agentId}' `;
            var [loginUpdateRes] = await sequelize.query(loginUpdate);
        }
        var livecallObj = {
            uniqueId: uniqueId,
            status: status
        }
        var socket2 = await adminSocket(id_user, 'liveCalls',{livecallObj});
        var socket1 = await adminSocket(id_user, 'adminCampaignLiveReport');
        
    }
    catch (err) {
        console.log(err)
    }
    return "succesfull response";
}
async function click_to_call_end(logDataJson, status, isDataSubmited, call_end_time) {          // end campaign call evnet
    try {
        var agentId = logDataJson.agentId;
        var campaignId = logDataJson.campaignId;
        var is_data_submited = isDataSubmited;
        var call_end_time = logDataJson.callEndTime;
        var uniqueId = logDataJson.uniqueId;
        var status = status;
        var id_user = Number(logDataJson.customerId);
        console.log("id_user ----------->",id_user)
        var agentCoutSql = `SELECT user_id as id_agent FROM cc_user_campaign WHERE id_campaign = '${campaignId}' `;
        var [agentCoutRes] = await sequelize.query(agentCoutSql);
        if (agentId != undefined) {
            agentId = Number(agentId)
            var socket = await userSocket(agentId, 'click_to_call_end', agentId);
            var liveReportObj = {
                agentId: agentId,
                status: "end",
                event: "end",
                is_data_submited: is_data_submited,
                campaignId: campaignId
            }
            var socket4 = await adminSocket(id_user, 'campaignLiveReportAgent',liveReportObj);
            if (call_end_time != undefined) {
                var loginUpdate = `UPDATE user_live_data SET currentCallStatus = '0',lastCallEndTime = '${call_end_time}' WHERE user_id = '${agentId}' `;
                var [loginUpdateRes] = await sequelize.query(loginUpdate);
            }
        }
        var livecallObj = {
            uniqueId: uniqueId,
            status: status
        }
        var socket1 = await adminSocket(id_user, 'adminCampaignLiveReport');
        var socket2 = await adminSocket(id_user, 'liveCalls',{livecallObj});
        var socket3 = await adminSocket(id_user, 'dashboardLivecalls');
        if (agentCoutRes != undefined) {
            agentCoutRes.map(async data => {
                var agent = Number(data.id_agent)
                var socket5 = await userSocket(agent, 'agentCampaignReport', campaignId);
                console.log(agent)
            });
        }
    }
    catch (err) {
        console.log(err)
    }
    return "succesfull response";
}

module.exports = {
    trigger_agent_call,
    trigger_agent_call_startEvent,
    trigger_agent_call_end,
    trigger_agent_call_start,
    startCampaign,
    campaignAgentLogout,
    campaignDestinationChannel,
    campaignSourceChannel,
    connectedCampaigncall,
    click_to_call_end
};
