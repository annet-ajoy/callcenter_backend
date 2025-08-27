const sequelize = require('../database').db;
const socket_helper = require('./socketHelper');
const apiIntegrationModel = require('../model/campaignApiIntegrationModel');
const {logMessage} = require('../logger');
var callBilling = require('./callBilling')
var contactStatusModel = require('../model/contactStatusModel');
var campaignOutgoingModel = require('../model/campaignOutgoingMode');
const config = require('../config/config');
const redis = config.redis
var callEventDBactions = require('./callReportSql');

async function campaignCallEvent(logDataJson) {
    console.log("logDataJson------------------------------------>", logDataJson)
    logMessage("logDataJson............")
    logMessage(logDataJson)
    var currentDateTime = new Date();
    var agentId = logDataJson.agentId;
    var channel = logDataJson.channel;
    var uniqueIdSplit = logDataJson.uniqueId;
    var uniqueId = logDataJson.uniqueId;
    var contactStatusId = logDataJson.contactStatusId
    var campaignId = logDataJson.campaignId;
    var phoneBookId = logDataJson.phoneBookId;
    if (logDataJson.event == "login") {
        var socketHelper = await socket_helper.startCampaign(logDataJson);
    } else if (logDataJson.event == "logout") {
        var socketHelper = await socket_helper.campaignAgentLogout(logDataJson);
    } else if (logDataJson.event == "dial") {
        logMessage("DIAL" )
        logMessage("logDataJson dial---->")
        logMessage( logDataJson)
        console.log("logDataJson dial----->",logDataJson)
        logMessage("event---->" + logDataJson.event)
        logMessage("currentDateTime---->" + currentDateTime)
        logMessage("destinationChannel---->" + logDataJson.destinationChannel)
        logMessage("uniqueId---->" + logDataJson.uniqueId)
        logMessage("campaignId------->" + logDataJson.campaignId)
        var destinationChannel = logDataJson.destinationChannel;
        var status = 0;
        var socketHelper = await socket_helper.campaignDestinationChannel(logDataJson, status);
    } else if (logDataJson.event == "start") {
        var cachedRedisParseData = [{ ...logDataJson, event: "start" }];
        logMessage("START" )
        logMessage("logDataJson start---->")
        logMessage( logDataJson)
        console.log("logDataJson start----->",logDataJson)
        logMessage("event---->" + logDataJson.event)
        logMessage("currentDateTime---->" + currentDateTime)
        logMessage("destinationChannel---->" + logDataJson.destinationChannel)
        logMessage("uniqueId---->" + logDataJson.uniqueId)
        logMessage("callStartTime---->" + logDataJson.dateTime)
        logMessage("campaignId------->" + logDataJson.campaignId)
        var destinationChannel = logDataJson.destinationChannel;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1
        var yyyy = today.getFullYear();
        var hours = today.getHours();
        var minutes = today.getMinutes();
        var seconds = today.getSeconds();
        var Start = `${yyyy}-${mm}-${dd} ${hours}:${minutes}:${seconds}`;
        console.log("Start..............", today)
        console.log("Start..............", Start)
        var callStartTime = logDataJson.dateTime;
        cachedRedisParseData[0].callStartTime = logDataJson.dateTime;
        logMessage("cachedRedisParseData in call start---->"+"campaignId------->" + logDataJson.campaignId)
        logMessage(cachedRedisParseData)
        console.log("cachedRedisParseData ----->",cachedRedisParseData)
        await redis.set(logDataJson.uniqueId, JSON.stringify(cachedRedisParseData));
        console.log("callStartTime..........", callStartTime)
        setTimeout(async function () {
            var sql = `UPDATE cc_livecalls SET call_start_time = '${callStartTime}' WHERE uniqueId = '${uniqueId}' ORDER BY id DESC LIMIT 1 `;
            var [updateCallstartTime] = await sequelize.query(sql);
            logMessage("call_start_time update sql------->" + sql)
            logMessage("call_start_time update res------->")
            logMessage(updateCallstartTime)
        }, 2000);
        contactStatusModel.findOneAndUpdate(
            { _id: contactStatusId },
            { $set: { connectedDuration: 0 } },
            { new: true }
        ).then(async updatedDocument => {
            if (updatedDocument) {
                console.log('Connected updated successfully:', updatedDocument);
            } else {
                console.log('No document found with the specified contactStatusId.');
            }
        })
        var sourceChannel = logDataJson.sourceChannel;
        var status = 1;
        var socketHelper = await socket_helper.campaignSourceChannel(logDataJson, status);
    } else if (logDataJson.event == "connect") {
        logMessage("CONNECT" )
        logMessage("logDataJson connect---->")
        logMessage( logDataJson)
        console.log("logDataJson connect----->",logDataJson)
        let cachedRedisStringData = await redis.get(logDataJson.uniqueId);
        let cachedRedisParseData = JSON.parse(cachedRedisStringData)
        if(cachedRedisParseData.length != 0){
            cachedRedisParseData = [{
                ...cachedRedisParseData[0],
                callAnswerTime: logDataJson.dateTime
            },
            ...cachedRedisParseData.slice(1)
            ];
        }
        await redis.set(logDataJson.uniqueId, JSON.stringify(cachedRedisParseData));
        logMessage("cachedRedisParseData connect---->"+"campaignId------->" + logDataJson.campaignId)
        logMessage(cachedRedisParseData)
        console.log("cachedRedisParseData connect----->",cachedRedisParseData)
        logMessage("event---->" + logDataJson.event)
        logMessage("currentDateTime---->" + currentDateTime)
        logMessage("destinationChannel---->" + logDataJson.destinationChannel)
        logMessage("uniqueId---->" + logDataJson.uniqueId)
        logMessage("callAnswerTime---->" + logDataJson.dateTime)
        logMessage("campaignId------->" + logDataJson.campaignId)

        console.log('Connected destinationChannel:', destinationChannel);
        var callAnswerTime = logDataJson.dateTime;
        var sql = `UPDATE cc_livecalls SET answeredTime = '${callAnswerTime}',status = '2' WHERE uniqueId = '${uniqueId}' ORDER BY id DESC LIMIT 1`;
        var [updateAnserTime] = await sequelize.query(sql);
        logMessage("answeredTime update sql------->" + sql)
        logMessage("answeredTime update res------->")
        logMessage(updateAnserTime)
        contactStatusModel.findOneAndUpdate(
            { _id: contactStatusId },
            { $set: { status: 9 } },
            { new: true }
        ).then(async updatedDocument => {
            if (updatedDocument) {
                console.log('Connected updated successfully:', updatedDocument);
            } else {
                console.log('No document found with the specified contactStatusId.');
            }
        })
        var status = 2;
        var socketHelper = await socket_helper.connectedCampaigncall(logDataJson, status);
    } else if (logDataJson.event == "end") {
        logMessage("END" )
        logMessage("logDataJson end---->")
        logMessage( logDataJson)
        console.log("logDataJson end----->",logDataJson)
        logMessage("event---->" + logDataJson.event)
        logMessage("currentDateTime---->" + currentDateTime)
        logMessage("destinationChannel---->" + logDataJson.destinationChannel)
        logMessage("uniqueId---->" + logDataJson.uniqueId)
        logMessage("call_end_time---->" + logDataJson.dateTime)
        logMessage("callStatus---->" + logDataJson.callStatus)
        logMessage("campaignId------->" + logDataJson.campaignId)
        var call_end_time = logDataJson.dateTime;
        console.log("call_end_time --------------->",call_end_time)
        logMessage("call_end_time -------->" + call_end_time)
        var callStatus = logDataJson.callStatus;
        var duration = logDataJson.connectedDuration;
        var totalCallDuration = logDataJson.totalCallDuration
        var cr_file = logDataJson.cr_file;
        var hold_time = logDataJson.holdDuration;
        var dtmfSeq = logDataJson.dtmfSeq;
        console.log("end....")
        console.log(dtmfSeq)
        logMessage("dtmfSeq -------->" + dtmfSeq)
        let cachedRedisStringData = await redis.get(logDataJson.uniqueId);
        let cachedRedisParseData = JSON.parse(cachedRedisStringData)
        var camapignSql = `SELECT id,application_file FROM cc_campaign WHERE id = '${logDataJson.campaignId}'`;
        var [camapignRes] = await sequelize.query(camapignSql);
        logMessage("cachedRedisParseData end---->")
        logMessage(cachedRedisParseData)
        console.log("cachedRedisParseData end----->",cachedRedisParseData)
        if(cachedRedisParseData.length != 0){
            logDataJson.callAnswerTime = cachedRedisParseData[0].callAnswerTime;
            logDataJson.callStartTime = cachedRedisParseData[0].callStartTime;
            cachedRedisParseData[0].app = 'callflow';
            cachedRedisParseData[0].appId = camapignRes[0].application_file;
            cachedRedisParseData[0].callflowId = camapignRes[0].application_file;
        }
        callEventDBactions.insert_callflow_report(cachedRedisParseData)
        var sql = `UPDATE cc_livecalls SET is_live = '1' WHERE uniqueId = '${uniqueId}' ORDER BY id DESC LIMIT 1`;
        var [islive_update] = await sequelize.query(sql);
        var selectSql = `SELECT *,DATE_FORMAT(acw_time, '%Y-%m-%d %H:%i:%s') AS formatted_asw,DATE_FORMAT(answeredTime, '%Y-%m-%d %H:%i:%s') AS formatted_answeredTime,DATE_FORMAT(call_start_time, '%Y-%m-%d %H:%i:%s') AS call_start_time FROM cc_livecalls WHERE uniqueId = '${uniqueId}' ORDER BY id DESC LIMIT 1`;
        var [selectRes] = await sequelize.query(selectSql);
        console.log("livecall data result.....", selectRes);
        var status = 1;
        var summary_status = "connected_count = connected_count + 1";
        if (callStatus == 'ANSWER') {
            status = 3
            summary_status = "connected_count = connected_count + 1";
        } else if (callStatus == 'NOANSWER') {
            status = 2
            summary_status = "notconnected_count = notconnected_count + 1";
        }
        else if (callStatus == 'BUSY') {
            status = 5
            summary_status = "busy = busy + 1";
        }
        else if (callStatus == 'CANCEL') {
            status = 6
            summary_status = "cancel = cancel + 1";
        } else if (callStatus == 'CHANUNAVAIL') {
            status = 7
            summary_status = 'channel_unavailable =channel_unavailable + 1'
        } else if (callStatus == 'CONGESTION') {
            status = 8
            summary_status = 'congestion =congestion + 1'
        }
        logMessage("livecallSql....." + selectSql+ ",campaignId----->" + logDataJson.campaignId);
        logMessage("livecall data result.....");
        logMessage(selectRes);
        logMessage("livecall data length-------->" + selectRes.length + ",campaignId----->" + logDataJson.campaignId)
        redis.del(logDataJson.uniqueId);
        if (selectRes.length != 0) {
            console.log("is_data_submited ----------------------------------->", selectRes[0].is_data_submited + ",campaignId----->" + logDataJson.campaignId)
            logMessage("livecall data length-------->" + selectRes.length + ",campaignId----->" + logDataJson.campaignId)
            try {
                logMessage("selectRes[0].call_start_time -------->" + selectRes[0].call_start_time + ",campaignId----->" + logDataJson.campaignId)
                if (selectRes[0].call_start_time != '0000-00-00 00:00:00') {
                    logMessage("before outgoing_report fuction -------->" + currentDateTime + ",campaignId----->" + logDataJson.campaignId)
                    var outgoingRes = await outgoing_report(selectRes, call_end_time, duration, totalCallDuration, callStatus, dtmfSeq, status, uniqueId, contactStatusId, summary_status, hold_time, cr_file, agentId, logDataJson)
                } else {
                    logMessage("selectRes[0].call_start_time -------->" + selectRes[0].call_start_time + ",campaignId----->" + logDataJson.campaignId)
                    setTimeout(async function () {
                        logMessage("inside setTimeout function -------->" + currentDateTime + ",campaignId----->" + logDataJson.campaignId)
                        var selectSql = `SELECT *,DATE_FORMAT(acw_time, '%Y-%m-%d %H:%i:%s') AS formatted_asw,DATE_FORMAT(answeredTime, '%Y-%m-%d %H:%i:%s') AS formatted_answeredTime,DATE_FORMAT(call_start_time, '%Y-%m-%d %H:%i:%s') AS call_start_time FROM cc_livecalls WHERE uniqueId = '${uniqueId}' ORDER BY id DESC LIMIT 1`;
                        var [selectRes] = await sequelize.query(selectSql);
                        console.log("call_end_time --------------->",call_end_time)
                        logMessage("call_end_time -------->" + call_end_time)
                        var outgoingRes = await outgoing_report(selectRes, call_end_time, duration, totalCallDuration, callStatus, dtmfSeq, status, uniqueId, contactStatusId, summary_status, hold_time, cr_file, agentId, logDataJson)
                    }, 2000);
                }
            } catch (err) {
                console.log("brodacaset error ------->", err)
                logMessage("brodacaset error ------->" + err)
            }
        } else {
            setTimeout(async function () {
                var selectSql = `SELECT *,DATE_FORMAT(acw_time, '%Y-%m-%d %H:%i:%s') AS formatted_asw,DATE_FORMAT(answeredTime, '%Y-%m-%d %H:%i:%s') AS formatted_answeredTime,DATE_FORMAT(call_start_time, '%Y-%m-%d %H:%i:%s') AS call_start_time FROM cc_livecalls WHERE uniqueId = '${uniqueId}' ORDER BY id DESC LIMIT 1`;
                var [selectRes] = await sequelize.query(selectSql);
                logMessage("In livecall data length = 0 then retry after 2sec....." + selectSql);
                logMessage("livecallSql....." + selectSql);
                logMessage("livecall data result.....");
                logMessage(selectRes);
                logMessage("livecall data length-------->" + selectRes.length + "campaignId----->" + logDataJson.campaignId)
                if (selectRes.length != 0) {
                    try {
                        logMessage("selectRes[0].call_start_time -------->" + selectRes[0].call_start_time + "campaignId----->" + logDataJson.campaignId)
                        if (selectRes[0].call_start_time != '0000-00-00 00:00:00') {
                            logMessage("before outgoing_report fuction -------->" + currentDateTime + "campaignId----->" + logDataJson.campaignId)
                            var outgoingRes = await outgoing_report(selectRes, call_end_time, duration, totalCallDuration, callStatus, dtmfSeq, status, uniqueId, contactStatusId, summary_status, hold_time, cr_file, agentId, logDataJson)
                        } else {
                            logMessage("selectRes[0].call_start_time -------->" + selectRes[0].call_start_time + "campaignId----->" + logDataJson.campaignId)
                            setTimeout(async function () {
                                logMessage("inside setTimeout function -------->" + currentDateTime + "campaignId----->" + logDataJson.campaignId)
                                var selectSql = `SELECT *,DATE_FORMAT(acw_time, '%Y-%m-%d %H:%i:%s') AS formatted_asw,DATE_FORMAT(answeredTime, '%Y-%m-%d %H:%i:%s') AS formatted_answeredTime,DATE_FORMAT(call_start_time, '%Y-%m-%d %H:%i:%s') AS call_start_time FROM cc_livecalls WHERE uniqueId = '${uniqueId}' ORDER BY id DESC LIMIT 1`;
                                var [selectRes] = await sequelize.query(selectSql);
                                var outgoingRes = await outgoing_report(selectRes, call_end_time, duration, totalCallDuration, callStatus, dtmfSeq, status, uniqueId, contactStatusId, summary_status, hold_time, cr_file, agentId, logDataJson)
                            }, 2000);
                        }
                    } catch (err) {
                        console.log("brodacast error ------->", err)
                    }
                }
            }, 2000);
        }
        // var status = 3;
        if(selectRes.length != 0){
            var isDataSubmited = selectRes[0].is_data_submited;
        }else{
            var isDataSubmited = 0;
        }
        console.log("call_end_time --------------->",call_end_time)
        logMessage("call_end_time -------->" + call_end_time)
        var call_end_time = `${encodeURIComponent(call_end_time)}`;
        console.log("call_end_time --------------->",call_end_time)
        logMessage("call_end_time -------->" + call_end_time)
        var socketHelper = await socket_helper.click_to_call_end(logDataJson, status, isDataSubmited, call_end_time);
        var apiIntegration = await api_integration(callStatus, logDataJson, campaignId, selectRes);
    }
}
async function outgoing_report(selectRes, call_end_time, duration, totalCallDuration, callStatus, dtmfSeq, status, uniqueId, contactStatusId, summary_status, hold_time, cr_file, agentId, logDataJson) {
    var currentDateTime1 = new Date();
    logMessage("inside outgoing_report function -------->")
    logMessage(logDataJson)
    logMessage("inside outgoing_report function -------->" + currentDateTime1 + ",campaignId----->" + logDataJson.campaignId)
    if (selectRes.length != 0) {
        logMessage("inside outgoing_report function call_start_time ---->" + selectRes[0].call_start_time)
        console.log("inside outgoing_report function call_start_time ----->",selectRes[0].call_start_time)
        if(selectRes[0].call_start_time == "0000-00-00 00:00:00" || selectRes[0].call_start_time == null || selectRes[0].call_start_time){
            if(logDataJson.callStartTime != undefined){
                selectRes[0].call_start_time = logDataJson.callStartTime
            }
        }
        logMessage("inside outgoing_report function formatted_answeredTime ---->" + selectRes[0].formatted_answeredTime)
        console.log("inside outgoing_report function formatted_answeredTime ----->",selectRes[0].formatted_answeredTime)
        if((selectRes[0].formatted_answeredTime == "0000-00-00 00:00:00" || selectRes[0].formatted_answeredTime == null || selectRes[0].formatted_answeredTime) && callStatus == 'ANSWER'){
            if(logDataJson.callAnswerTime != undefined){
                selectRes[0].formatted_answeredTime = logDataJson.callAnswerTime
            }
        }
        var camapignSql = `SELECT id,route,type FROM cc_campaign WHERE id = '${logDataJson.campaignId}'`;
        var [camapignRes] = await sequelize.query(camapignSql);
        console.log("camapignRes -------->",camapignRes)
        logMessage("camapignRes -------->")
        logMessage(camapignRes)
        console.log("is_data_submited ----------------------------------->", selectRes[0].is_data_submited + ",campaignId----->" + logDataJson.campaignId)
        try {
            console.log("call_end_time --------------->",call_end_time)
            logMessage("start cost calculation -------->" + currentDateTime1)
            logMessage("campaignId before trans credit calculation----------------->" + logDataJson.campaignId)
            console.log("campaignId before trans credit calculation----------------->" + logDataJson.campaignId)
            logMessage("connectedDuration----------------->" + logDataJson.connectedDuration + ",campaignId----->" + logDataJson.campaignId)
            console.log("connectedDuration----------------->" + logDataJson.connectedDuration)
            if (logDataJson.campaignId != undefined) {
                logMessage("callStatus before trans credit calculation----------------->" + callStatus)
                console.log("callStatus before trans credit calculation----------------->" + callStatus)
                if (callStatus == 'ANSWER') {
                    var rateObj={did:selectRes[0].didNumber,destinationType:'sip',id_user:selectRes[0].id_user,totalCallDuration:totalCallDuration,contact_number:selectRes[0].contact_number}
                    logMessage("rateObj----------------->" + rateObj)
                    console.log("rateObj----------------->" + rateObj)
                    var calculatedRate = await callBilling.rate_calculation(rateObj)
                    logMessage("calculatedRate----------------->" + calculatedRate)
                    console.log("calculatedRate----------------->" + calculatedRate)
                    var transValue = calculatedRate;
                    logMessage("transValue----------------->" + transValue)
                    console.log("transValue----------------->" + transValue)
                } else {
                    var transValue = 0;
                }
            } else {
                var transValue = 0;
            }
            call_end_time = decodeURIComponent(call_end_time);
            logMessage("call_end_time -------->" + call_end_time)
            var outgoingcall = {
                id_campaign: selectRes[0].id_campaign,
                id_contact: selectRes[0].contact_status_id,
                answeredTime: selectRes[0].formatted_answeredTime,
                call_start_time: selectRes[0].call_start_time,
                call_endtime:  call_end_time,
                uniqueid: selectRes[0].uniqueId,
                user: selectRes[0].user,
                callerid: selectRes[0].didNumber,
                destination: selectRes[0].contact_number,
                acw_time: selectRes[0].formatted_asw,
                acw: 0,
                id_department: selectRes[0].id_department,
                id_user: selectRes[0].id_user,
                user_id: selectRes[0].user_id,
                duration: duration,
                total_duration: totalCallDuration,
                cost: transValue,
                callStatus: callStatus,
                retry_count: selectRes[0].retry_count,
                dialType: selectRes[0].calltype,
                dtmfSeq: dtmfSeq,
                route : camapignRes[0].route
            }
            if(camapignRes[0].type == 2){
                outgoingcall.user_id = logDataJson.userId
                outgoingcall.type = 0
            }
            if(camapignRes[0].type == 1){
                outgoingcall.type = 1
            }
            if(selectRes[0].hangup_by == 1){
                outgoingcall.hangup_by = 'User'
            }
            if(selectRes[0].hangup_by == 0){
                outgoingcall.hangup_by = 'Customer'
            }
            if (selectRes[0].retry_count > 0) {
                outgoingcall.retryStatus = 1
            } else {
                outgoingcall.retryStatus = 0
            }
            if (cr_file != undefined) {
                outgoingcall.cr_file = cr_file;
                outgoingcall.cr_status = 1;
            }
            if (hold_time != undefined) {
                outgoingcall.hold_time = hold_time;
            }
            console.log("outgoingcall --------------->",outgoingcall)
            logMessage("outgoingcall ------------>")
            logMessage(outgoingcall)
            var addoutgoing = await campaignOutgoingModel.create(outgoingcall);
        } catch (err) {
            console.log("brodacaset error ------->", err)
            logMessage("brodacaset error in outgoing report function------->" + err)
        }

    }
    if (selectRes[0].is_data_submited == 0) {
        var sql = `UPDATE cc_livecalls SET call_end_time = '${call_end_time}',duration = '${Number(duration)}',total_duration = '${Number(totalCallDuration)}',status = '${status}' WHERE uniqueId = '${uniqueId}' ORDER BY id DESC LIMIT 1`;
        var [update] = await sequelize.query(sql);
        logMessage("update live call data update ------->" + update +",sql ----->"+sql+ ",campaignId----->" + logDataJson.campaignId)
    } else {
        var sql = `DELETE FROM cc_livecalls WHERE uniqueId = '${uniqueId}' ORDER BY id DESC LIMIT 1`;
        var [delete_livecall] = await sequelize.query(sql);
        logMessage("delete_livecall ------->,campaignId----->" + logDataJson.campaignId)
        logMessage(delete_livecall)
    }

    var Duration = Number(duration)
    logMessage("status ----->" + status);
    contactStatusModel.findOneAndUpdate(
        { _id: contactStatusId },
        { $set: { status: status, connectedDuration: Duration } },
        { new: true }
    )
        .then(async updatedDocument => {
            if (updatedDocument) {
                if (updatedDocument._doc.attempt > 1) {
                    var retry_summary_update = `,retry = retry + 1`
                } else {
                    var retry_summary_update = `,retry = retry + 0`
                }
                console.log('Document updated successfully:', updatedDocument);
                const t = await sequelize.transaction();
                try {
                    var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth() + 1;
                    var yyyy = today.getFullYear();
                    var date = `${yyyy}-${mm}-${dd}`
                    if (!hold_time) {
                        hold_time = 0;
                    }
                    console.log("hold time ----------------------->", hold_time)
                    if (agentId != undefined) {
                        var sql = `update cc_campaign_call_summary SET ${summary_status},hold_time = hold_time + ${hold_time},connected_duration = connected_duration + ${duration},total_duration = total_duration + ${totalCallDuration},live_calls = CASE WHEN (live_calls > 0) THEN live_calls - 1 ELSE 0 END ${retry_summary_update} where id_user = '${updatedDocument._doc.id_user}' and id_department = '${updatedDocument._doc.id_department}' and phonebook_id = '${updatedDocument._doc.phonebook_id}' and campaign_id = '${updatedDocument._doc.campaignId}' and user_id = '${agentId}' AND DATE(createdAt) = '${date}'`
                    } else {
                        var sql = `update cc_campaign_call_summary SET ${summary_status},hold_time = hold_time + ${hold_time},connected_duration = connected_duration + ${duration},total_duration = total_duration + ${totalCallDuration},live_calls = CASE WHEN (live_calls > 0) THEN live_calls - 1 ELSE 0 END ${retry_summary_update} where id_user = '${updatedDocument._doc.id_user}' and id_department = '${updatedDocument._doc.id_department}' and phonebook_id = '${updatedDocument._doc.phonebook_id}' and campaign_id = '${updatedDocument._doc.campaignId}'  AND DATE(createdAt) = '${date}'`
                    }
                    logMessage(sql)
                    await sequelize.query(sql);
                    await t.commit();
                    console.log('Update successful');
                } catch (err) {
                    await t.rollback();
                }

            } else {
                console.log('No document found with the specified contactStatusId.');
            }
        })
        .catch(err => {
            console.error('Error while updating:', err);
        });
}
async function api_integration(callStatus, logDataJson, campaignId, selectRes) {
    try {
        logMessage("in side api_integration function : " + campaignId)
        if (callStatus == 'ANSWER') {
            logMessage("logDataJson.apiSettingIsEnabled..." + logDataJson.apiSettingIsEnabled)
            if (logDataJson.apiSettingIsEnabled == 1) {
                var integrationData = await apiIntegrationModel.find({ campaign_id: campaignId, broadcast_call_status: '3' })
                if (integrationData.length != 0) {
                    var jwtaxiosConfig = {}
                    if (integrationData[0]._doc.broadcast_url) {
                        var url = integrationData[0]._doc.broadcast_url;
                        jwtaxiosConfig.url = url;
                        jwtaxiosConfig.method = integrationData[0]._doc.broadcast_method;
                        if (integrationData[0]._doc.headerParams) {
                            jwtaxiosConfig.headers = integrationData[0]._doc.headerParams
                        }
                        var form_type = integrationData[0]._doc.data_format;
                        if (form_type == '1') {
                            var data = {}
                            if (integrationData[0]._doc.bodyParams != undefined) {
                                var bodyParams = integrationData[0]._doc.bodyParams;
                                var bodyParams_key = Object.keys(bodyParams);
                                bodyParams_key.map((input_value) => {
                                    var value = bodyParams[input_value];
                                    if (value == 'callStatus') {
                                        data[input_value] = logDataJson.callStatus;
                                    } else if (value == 'totalCallDuration') {
                                        data[input_value] = logDataJson.totalCallDuration;
                                    } else if (value == 'cr_file') {
                                        data[input_value] = logDataJson.cr_file;
                                    } else if (value == 'didNumber') {
                                        data[input_value] = selectRes[0].didNumber;
                                    } else if (value == 'call_start_time') {
                                        data[input_value] = selectRes[0].call_start_time;
                                    } else if (value == 'contact_number') {
                                        data[input_value] = selectRes[0].contact_number;
                                    } else {
                                        data[input_value] = value;
                                    }
                                })
                                jwtaxiosConfig.data = data;
                            } else {
                                jwtaxiosConfig.data = {}
                            }
                            if (integrationData[0]._doc.structure != '') {
                                var jsonstructure = integrationData[0]._doc.structure;
                                var objectKey = Object.keys(integrationData[0]._doc.structure);
                                var dataStructure = integrationData[0]._doc.structure[objectKey];
                                var structure = JSON.stringify(jsonstructure);
                                var regex = /\$[^\s,"]+/g;
                                var matches = structure.match(regex);
                                if (matches != null) {
                                    matches.map(async (value) => {
                                        var remove_value = value.replace('$', '');
                                        if (remove_value == 'callStatus') {
                                            structure = structure.replace(value, logDataJson.callStatus);
                                        } else if (remove_value == 'totalCallDuration') {
                                            structure = structure.replace(value, logDataJson.totalCallDuration);
                                        } else if (remove_value == 'cr_file') {
                                            structure = structure.replace(value, logDataJson.cr_file);
                                        } else if (remove_value == 'didNumber') {
                                            structure = structure.replace(value, selectRes[0].didNumber);
                                        } else if (remove_value == 'call_start_time') {
                                            structure = structure.replace(value, selectRes[0].call_start_time);
                                        } else if (remove_value == 'contact_number') {
                                            // structure = structure.replace(value, '919072903510');
                                            structure = structure.replace(value, selectRes[0].contact_number);
                                        } else {
                                            structure = structure.replace(value, remove_value);
                                        }
                                    })
                                    var parsedStructure = JSON.parse(structure);
                                    // var objectValues = Object.values(parsedStructure);
                                    // objectValues = objectValues[0]
                                    // var result = parsedStructure
                                    var result = { ...jwtaxiosConfig.data, ...parsedStructure };
                                } else {
                                    var result = { ...jwtaxiosConfig.data, ...jsonstructure };
                                }
                                jwtaxiosConfig.data = result;
                            }
                        } else if (form_type == '2') {
                            if (integrationData[0]._doc.bodyParams != undefined) {
                                var bodyParams = integrationData[0]._doc.bodyParams;
                                var bodyParams_key = Object.keys(bodyParams);
                                var data = {}
                                bodyParams_key.map((input_value) => {
                                    var value = bodyParams[input_value];
                                    if (value == 'callStatus') {
                                        data[input_value] = logDataJson.callStatus;
                                    } else if (value == 'totalCallDuration') {
                                        data[input_value] = logDataJson.totalCallDuration;
                                    } else if (value == 'cr_file') {
                                        data[input_value] = logDataJson.cr_file;
                                    } else if (value == 'didNumber') {
                                        data[input_value] = selectRes[0].didNumber;
                                    } else if (value == 'call_start_time') {
                                        data[input_value] = selectRes[0].call_start_time;
                                    } else if (value == 'contact_number') {
                                        data[input_value] = selectRes[0].contact_number;
                                    } else {
                                        data[input_value] = value;
                                    }
                                })
                                data = qs.stringify(data);
                                var header = { 'Content-Type': 'application/x-www-form-urlencoded' }
                                jwtaxiosConfig.data = data;
                                jwtaxiosConfig.headers = header;
                            } else {
                                jwtaxiosConfig.data = {}
                            }
                        } else if (form_type == '3') {
                            if (integrationData[0]._doc.bodyParams != undefined) {
                                var bodyParams = integrationData[0]._doc.bodyParams;
                                var input = new FormData();
                                var bodyParams_key = Object.keys(bodyParams);
                                bodyParams_key.map((input_value) => {
                                    var value = bodyParams[input_value];
                                    if (value == 'callStatus') {
                                        input.append(input_value, logDataJson.callStatus);
                                    } else if (value == 'totalCallDuration') {
                                        input.append(input_value, logDataJson.totalCallDuration);
                                    } else if (value == 'cr_file') {
                                        input.append(input_value, logDataJson.cr_file);
                                    } else if (value == 'didNumber') {
                                        input.append(input_value, selectRes[0].didNumber);
                                    } else if (value == 'call_start_time') {
                                        input.append(input_value, selectRes[0].call_start_time);
                                    } else if (value == 'contact_number') {
                                        input.append(input_value, selectRes[0].contact_number);
                                    } else {
                                        input.append(input_value, value);
                                    }
                                })
                                jwtaxiosConfig.data = input;
                            } else {
                                jwtaxiosConfig.data = {}
                            }
                        } else {
                            if (integrationData[0]._doc.bodyParams != undefined) {
                                var bodyParams = integrationData[0]._doc.bodyParams;
                                url += "?";
                                var bodyParams_key = Object.keys(bodyParams);
                                bodyParams_key.map((input_value) => {
                                    var value = bodyParams[input_value];
                                    if (value == 'callStatus') {
                                        url += input_value + '=' + logDataJson.callStatus + "&";
                                    } else if (value == 'totalCallDuration') {
                                        url += input_value + '=' + logDataJson.totalCallDuration + "&";
                                    } else if (value == 'cr_file') {
                                        url += input_value + '=' + logDataJson.cr_file + "&";
                                    } else if (value == 'didNumber') {
                                        url += input_value + '=' + selectRes[0].didNumber + "&";
                                    } else if (value == 'call_start_time') {
                                        url += input_value + '=' + selectRes[0].call_start_time + "&";
                                    } else if (value == 'contact_number') {
                                        url += input_value + '=' + selectRes[0].contact_number + "&";
                                    } else {
                                        url += input_value + '=' + value + "&";
                                    }
                                })
                                jwtaxiosConfig.url = url
                            }
                        }
                        console.log(jwtaxiosConfig)
                        logMessage("jwtaxiosConfig--------->")
                        logMessage(jwtaxiosConfig)
                        var response = await axios(jwtaxiosConfig);
                        console.log(response)
                        logMessage("whatsapp msg campaignId--------->" + campaignId)
                        logMessage("whatsapp msg response status--------->" + response.data.status)
                        logMessage("whatsapp msg response--------->" + JSON.stringify(response.data))
                        resolve(response.data.status)
                    }
                }
            }
        } else {
            if (logDataJson.apiSettingIsEnabled == 1) {
                var integrationData = await apiIntegrationModel.find({ campaign_id: campaignId, broadcast_call_status: '2' })
                if (integrationData.length != 0) {
                    var jwtaxiosConfig = {}
                    if (integrationData[0]._doc.broadcast_url) {
                        var url = integrationData[0]._doc.broadcast_url;
                        jwtaxiosConfig.url = url;
                        jwtaxiosConfig.method = integrationData[0]._doc.broadcast_method;
                        if (integrationData[0]._doc.headerParams) {
                            jwtaxiosConfig.headers = integrationData[0]._doc.headerParams
                        }
                        var form_type = integrationData[0]._doc.data_format;
                        if (form_type == '1') {
                            var data = {}
                            if (integrationData[0]._doc.bodyParams != undefined) {
                                var bodyParams = integrationData[0]._doc.bodyParams;
                                var bodyParams_key = Object.keys(bodyParams);
                                bodyParams_key.map((input_value) => {
                                    var value = bodyParams[input_value];
                                    if (value == 'callStatus') {
                                        data[input_value] = logDataJson.callStatus;
                                    } else if (value == 'totalCallDuration') {
                                        data[input_value] = logDataJson.totalCallDuration;
                                    } else if (value == 'cr_file') {
                                        data[input_value] = logDataJson.cr_file;
                                    } else if (value == 'didNumber') {
                                        data[input_value] = selectRes[0].didNumber;
                                    } else if (value == 'call_start_time') {
                                        data[input_value] = selectRes[0].call_start_time;
                                    } else if (value == 'contact_number') {
                                        data[input_value] = selectRes[0].contact_number;
                                    } else {
                                        data[input_value] = value;
                                    }
                                })
                                jwtaxiosConfig.data = data;
                            } else {
                                jwtaxiosConfig.data = {}
                            }
                            if (integrationData[0]._doc.structure != '') {
                                var jsonstructure = integrationData[0]._doc.structure;
                                var objectKey = Object.keys(integrationData[0]._doc.structure);
                                var dataStructure = integrationData[0]._doc.structure[objectKey];
                                var structure = JSON.stringify(jsonstructure);
                                var regex = /\$[^\s,"]+/g;
                                var matches = structure.match(regex);
                                if (matches != null) {
                                    matches.map(async (value) => {
                                        var remove_value = value.replace('$', '');
                                        if (remove_value == 'callStatus') {
                                            structure = structure.replace(value, logDataJson.callStatus);
                                        } else if (remove_value == 'totalCallDuration') {
                                            structure = structure.replace(value, logDataJson.totalCallDuration);
                                        } else if (remove_value == 'cr_file') {
                                            structure = structure.replace(value, logDataJson.cr_file);
                                        } else if (remove_value == 'didNumber') {
                                            structure = structure.replace(value, selectRes[0].didNumber);
                                        } else if (remove_value == 'call_start_time') {
                                            structure = structure.replace(value, selectRes[0].call_start_time);
                                        } else if (remove_value == 'contact_number') {
                                            // structure = structure.replace(value, '919072903510');
                                            structure = structure.replace(value, selectRes[0].contact_number);
                                        } else {
                                            structure = structure.replace(value, remove_value);
                                        }
                                    })
                                    var parsedStructure = JSON.parse(structure);
                                    // var objectValues = Object.values(parsedStructure);
                                    // objectValues = objectValues[0]
                                    // var result = parsedStructure
                                    var result = { ...jwtaxiosConfig.data, ...parsedStructure };
                                } else {
                                    var result = { ...jwtaxiosConfig.data, ...jsonstructure };
                                }
                                jwtaxiosConfig.data = result;
                            }
                        } else if (form_type == '2') {
                            if (integrationData[0]._doc.bodyParams != undefined) {
                                var bodyParams = integrationData[0]._doc.bodyParams;
                                var bodyParams_key = Object.keys(bodyParams);
                                var data = {}
                                bodyParams_key.map((input_value) => {
                                    var value = bodyParams[input_value];
                                    if (value == 'callStatus') {
                                        data[input_value] = logDataJson.callStatus;
                                    } else if (value == 'totalCallDuration') {
                                        data[input_value] = logDataJson.totalCallDuration;
                                    } else if (value == 'cr_file') {
                                        data[input_value] = logDataJson.cr_file;
                                    } else if (value == 'didNumber') {
                                        data[input_value] = selectRes[0].didNumber;
                                    } else if (value == 'call_start_time') {
                                        data[input_value] = selectRes[0].call_start_time;
                                    } else if (value == 'contact_number') {
                                        data[input_value] = selectRes[0].contact_number;
                                    } else {
                                        data[input_value] = value;
                                    }
                                })
                                data = qs.stringify(data);
                                var header = { 'Content-Type': 'application/x-www-form-urlencoded' }
                                jwtaxiosConfig.data = data;
                                jwtaxiosConfig.headers = header;
                            } else {
                                jwtaxiosConfig.data = {}
                            }
                        } else if (form_type == '3') {
                            if (integrationData[0]._doc.bodyParams != undefined) {
                                var bodyParams = integrationData[0]._doc.bodyParams;
                                var input = new FormData();
                                var bodyParams_key = Object.keys(bodyParams);
                                bodyParams_key.map((input_value) => {
                                    var value = bodyParams[input_value];
                                    if (value == 'callStatus') {
                                        input.append(input_value, logDataJson.callStatus);
                                    } else if (value == 'totalCallDuration') {
                                        input.append(input_value, logDataJson.totalCallDuration);
                                    } else if (value == 'cr_file') {
                                        input.append(input_value, logDataJson.cr_file);
                                    } else if (value == 'didNumber') {
                                        input.append(input_value, selectRes[0].didNumber);
                                    } else if (value == 'call_start_time') {
                                        input.append(input_value, selectRes[0].call_start_time);
                                    } else if (value == 'contact_number') {
                                        input.append(input_value, selectRes[0].contact_number);
                                    } else {
                                        input.append(input_value, value);
                                    }
                                })
                                jwtaxiosConfig.data = input;
                            } else {
                                jwtaxiosConfig.data = {}
                            }
                        } else {
                            if (integrationData[0]._doc.bodyParams != undefined) {
                                var bodyParams = integrationData[0]._doc.bodyParams;
                                url += "?";
                                var bodyParams_key = Object.keys(bodyParams);
                                bodyParams_key.map((input_value) => {
                                    var value = bodyParams[input_value];
                                    if (value == 'callStatus') {
                                        url += input_value + '=' + logDataJson.callStatus + "&";
                                    } else if (value == 'totalCallDuration') {
                                        url += input_value + '=' + logDataJson.totalCallDuration + "&";
                                    } else if (value == 'cr_file') {
                                        url += input_value + '=' + logDataJson.cr_file + "&";
                                    } else if (value == 'didNumber') {
                                        url += input_value + '=' + selectRes[0].didNumber + "&";
                                    } else if (value == 'call_start_time') {
                                        url += input_value + '=' + selectRes[0].call_start_time + "&";
                                    } else if (value == 'contact_number') {
                                        url += input_value + '=' + selectRes[0].contact_number + "&";
                                    } else {
                                        url += input_value + '=' + value + "&";
                                    }
                                })
                                jwtaxiosConfig.url = url
                            }
                        }
                        console.log(jwtaxiosConfig)
                        logMessage("jwtaxiosConfig--------->")
                        logMessage(jwtaxiosConfig)
                        var response = await axios(jwtaxiosConfig);
                        console.log(response)
                        logMessage("whatsapp msg campaignId--------->" + campaignId)
                        logMessage("whatsapp msg response status--------->" + response.data.status)
                        logMessage("whatsapp msg response--------->" + JSON.stringify(response.data))
                        resolve(response.data.status)
                    }
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}
module.exports = { campaignCallEvent };
