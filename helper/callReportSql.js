const sequelize = require('../database').db;
const getConnection = require('../database').getConnection;
var livecallModel = require('../model/livecallsModel')
var callReportModel = require('../model/callFlowReportModel')
var smsProviderModel = require('../model/smsIntegrationModel')
var smsProviderHead = require('../model/smsIntegrationHead')
var smsProviderBody = require('../model/smsIntegrationBody')
var whatsappProviderModel = require('../model/whatsappIntegrationModel')
var whatsappProviderHead = require('../model/whatsappIntegrationHead')
var whatsappProviderBody = require('../model/whatsappIntegrationBody')
var apiProviderModel = require('../model/ApiIntegrationModel')
var apiProviderHead = require('../model/apiIntegrationHead')
var apiProviderBody = require('../model/ApiIntegrationBody')
var callflowSubSms = require('../model/callFlowSmsSub')
var callflowSubWhatsapp = require('../model/callFlowWhatsappSub')
var callTemplateApiModelSub = require('../model/callFlowTemplateApiSub')
const CallTaskContacts = require("../model/callTaskContactsModel");
const transferCallReportModel = require("../model/ccTransferReportModel")
const User = require("../model/commonUserModel")
const callByotApi = require('./callByotApi');
var contactsModel = require('../model/contactsModel');
const autoxCalllog = require('../model/autox/autoxCalllog')
const CallTask = require("../model/callTaskModel");
const AutoxServices = require("../model/autoxServicePredications");
const AutoxInsurance = require("../model/autoxInsurancePredications");

var calltransferModel = require("../model/calltransferModel")

var FormData = require('form-data');
const querystring = require('querystring');
var qs = require('qs');
let ObjectId = require('mongodb').ObjectId;
const integration = {};

const config = require('../config/config')
if (process.env.PRODUCTION == 'development') {
    var { adminSocket, userSocket, departmentSocket, didSocket, smartgroupSocket, subadminSocket } = require('./developmentSocket');
} else {
    var { adminSocket, userSocket, departmentSocket, didSocket, smartgroupSocket, subadminSocket } = require('./liveSocket');
}
const { rate_calculation } = require('./callBilling');
const { clickTocallLog,dashboardAgentActivityLog } = require('../logger');


async function add_livecall(data, callType) {
    try {
        var currentDate = new Date();
        var obj = {
            id: data.uniqueId,
            phnNo: data.source,
            type: data.type,
            time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
            didNumber: data.destination,
            event: 'start',
            dtmfNo: data.dtmf,
            dtmfName: data.dtmfName
        }
        var startObj = {
            id_department: data.id_department,
            id_user: data.id_user,
            date: data.time,
            contact_number: data.source,
            didNumber: data.destination,
            CallBargingCode: data.livekey,
            user_id: data.user_id,
            uniqueId: data.uniqueId,
            status: 1,
            app: data.app,
            appId: data.appId,
            channel: data.channel
        }
        var monotioringObj = {
            calls: +1,
            lastCalls: +1,
        }
        if (data.type == 'incoming') {
            obj.currentCallStatus = 1
            startObj.type = 1
            monotioringObj.currentCallStatus = 1,
                monotioringObj.direction = 'incoming'
        } if (data.type == 'outgoing') {
            obj.currentCallStatus = 3
            startObj.type = 0
            monotioringObj.currentCallStatus = 3,
                monotioringObj.direction = 'outgoing'
        }
        if (data.user_id != undefined) {
            obj.agentId = data.user_id;
            const contact_data = await contactsModel.findOne(
                { phone_number: data.source, id_user: data.id_user, id_department: Number(data.id_department || 0) }, 
                { name: 1, phone_number: 1, _id: 0 }
            ).lean();            

            obj.contact_name = contact_data?.name
            
            // var msg3 = 'userCallStartPopup'
           
            // var userpopup = {
            //     agentId: Number(data.user_id),
            //     count: +1,
            //     available: -1
            // }
            // var userpopupCountMsg = "userActivityOnpopupCount"
            // var userpopupRes = await adminSocket(data.id_user, userpopupCountMsg, userpopup);
            // var socket6 = await departmentSocket(data.id_department,userpopupCountMsg, userpopup);
            // var useroncallCountMsg = "userActivityOncallCount"
            // var useroncall = await adminSocket(data.id_user, useroncallCountMsg, userpopup);
            // var socket6 = await departmentSocket(data.id_department,useroncallCountMsg, userpopup);
            // if(data.callType !== "callTaskDestination" && data.callType !== "callTaskSource") {
            //     var sql = `SELECT popup_status FROM user_live_data WHERE user_id = ${data.user_id}`;
            //     var [popupRes] = await sequelize.query(sql);
            //     console.log("popupRes ---------->",popupRes)
            //     if(popupRes.length != 0){
            //         if(popupRes[0].popup_status != 1){
            //             var socket3 = await userSocket(data.user_id, msg3, obj);
            //         }
            //     }
            // }
            var msg2 = 'startAdminMonitoring'
            var socket2 = await adminSocket(data.id_user, msg2, obj);
            if (data.id_department != 0) {
                var socket1 = await departmentSocket(data.id_department, msg2, obj);
            }
            monotioringObj.user_id = data.user_id
            var msg6 = 'userMonitoringCallstatus'
            var socket6 = await adminSocket(data.id_user, msg6, monotioringObj);
        }

        var msg1 = 'startLiveCallReport'
        var socket1 = await adminSocket(data.id_user, msg1, startObj);
        var countObj = { count: +1, type: data.type }
        var msg4 = 'adminDashboardLivecallCount'
        var socket4 = await adminSocket(data.id_user, msg4, countObj);
        var dashConnectObj = {
            type: data.type,
            uniqueId: data.uniqueId,
            answeredCount: 0,
            ringCount: 1
        }
        console.log("dashConnectObj ----->", dashConnectObj)
        var dashboardCountMsg = "dashboardLiveCallConnectCount";
        var socket5 = await adminSocket(data.id_user, dashboardCountMsg, dashConnectObj);
        if (data.id_department != 0) {
            var msg1 = 'startLiveCallReport'
            var socket1 = await departmentSocket(data.id_department, msg1, startObj);
            var msg12 = 'deptDashboardLivecallCount'
            var socket12 = await departmentSocket(data.id_department, msg12, countObj);
            var deptDashboardCountMsg = "deptDashboardLiveCallConnectCount";
            var socket6 = await departmentSocket(data.id_department, deptDashboardCountMsg, dashConnectObj);
        }
        if (data.destination != undefined) {
            var socket5 = await didSocket(data.destination, msg1);
        }
        if (callType == 'smartgroup') {
            smart_group_monitoring({ id: data.smartgroupId, id_user: data.id_user })
            var msg = 'smartGroupOnCallCount'
            var obj = { count: +1, smartGroupId: data.smartgroupId }
            var socket6 = await smartgroupSocket(data.smartgroupId, msg, obj);
            var socket5 = await adminSocket(data.id_user, msg, obj);
            var socket7 = await smartgroupSocket(data.smartgroupId, msg1, startObj);
        }
        var subadmin_id = await get_subadmin_id(data.id_department, data.id_user)
        if (subadmin_id.length != 0) {
            subadmin_id.map(async (value) => {
                var msg8 = 'startAdminMonitoring'
                var socket2 = await subadminSocket(value.id_subadmin, msg8, obj);
                var msg9 = 'userMonitoringCallstatus'
                var socket9 = await subadminSocket(value.id_subadmin, msg9, monotioringObj);
                var msg10 = 'startLiveCallReport'
                var socket10 = await subadminSocket(value.id_subadmin, msg10, startObj);
                var msg11 = 'subAdminDashboardLivecallCount'
                var socket4 = await subadminSocket(value.id_subadmin, msg11, countObj);
                var subDashboardCountMsg = "subDashboardLiveCallConnectCount";
                var socket11 = await subadminSocket(value.id_subadmin, subDashboardCountMsg, dashConnectObj);
            })
        }

        console.log("inside add livecLL function -------->",data)
        var result = await livecallModel.create(data);
        return result
    } catch (err) {
        console.error(err);
    }
}
async function update_livecall(data, uniqueId, module,agentChannel,callType) {
    try {
        var id_user = data.id_user
        var id_department = data.deptId;
        var type = data.type
        var user_id = data.user_id
        if(user_id == undefined){
            user_id = 0;
        }
        var connectObj = {
            user_id: user_id,
            uniqueId: uniqueId,
            status: 2,
            answeredTime: data.answeredTime
        }
        var msg1 = 'connectLiveCallReport'
        console.log("module     ----->",module)
        var msg1 = 'connectLiveCallReport'
        var dashConnectObj  ={
            type:type,
            uniqueId: uniqueId,
            answeredCount: +1,
            ringCount:-1
        }

        var currentDate = new Date();

        const contact_data = await contactsModel.findOne(
            { phone_number: data.source, id_user, id_department: Number(id_department || 0) },
            { name: 1, phone_number: 1, _id: 0 }
        ).lean();
        
        
        var obj = {
            id: data.uniqueId,
            phnNo: data.source,
            type: type,
            time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
            didNumber: data.destination,
            event: 'connect',
            channel: data.channel,
            agentChannel: data.agentChannel,
            contact_name: contact_data?.name,
        }


        if (type == 'incoming') {
            obj.currentCallStatus = 2
        } if (type == 'outgoing') {
            obj.currentCallStatus = 4
        }
        console.log("connected call obj user", obj)
        if (callType !== "callTaskDestination" && callType !== "callTaskSource") {
            var sql = `SELECT popup_status FROM user_live_data WHERE user_id = ${data.user_id}`;
            var [popupRes] = await getConnection.query(sql);
            console.log("popupRes ---------->", popupRes)
            if (popupRes.length != 0) {
                if (popupRes[0].popup_status != 1) {
                    var msg2 = 'userConnectPopup'
                    var socket4 = await userSocket(user_id, msg2, obj);
                }
            }
        }
        var dashboardCountMsg = "dashboardLiveCallConnectCount";
        console.log("dashConnectObj ----->",dashConnectObj)
        var socket5 = await adminSocket(id_user, dashboardCountMsg, dashConnectObj);
        var deptDashboardCountMsg = "deptDashboardLiveCallConnectCount";
        var socket6 = await departmentSocket(id_department, deptDashboardCountMsg, dashConnectObj);
        var userpopup = {
            agentId: Number(user_id),
            count: +1,
            available: -1
        }
        // var userpopupCountMsg = "userActivityOnpopupCount"
        // var userpopupRes = await adminSocket(id_user, userpopupCountMsg, userpopup);
        // var socket6 = await departmentSocket(id_department, userpopupCountMsg, userpopup);
        var callObj = {
            agentId: Number(data.user_id),
            status: "onCall"
        }
        var msg10 = 'userActivityCallStatus'
        var socket3 = await adminSocket(data.id_user, msg10, callObj);
        var socket6 = await departmentSocket(id_department, msg10, callObj);
        var useroncallCountMsg = "userActivityOncallCount"
        var useroncall = await adminSocket(id_user, useroncallCountMsg, userpopup);
        var socket6 = await departmentSocket(id_department, useroncallCountMsg, userpopup);
        if (module == 'smartgroup') {
            smart_group_monitoring({ id: data.appId, id_user: id_user })
            var socket5 = await smartgroupSocket(data.appId, msg1, connectObj);
            var msg2 = 'smartGroupConnected'
            connectObj.smartGroupId = data.appId
            console.log("smartGroupConnected    ------->",connectObj)
            var socket6 = await smartgroupSocket(data.appId, msg2, connectObj);
            var socket7 = await adminSocket(id_user, msg2, connectObj);
        }
        var socket1 = await adminSocket(id_user, msg1, connectObj);
        var msg1 = 'connectLiveCallReport'
        var socket2 = await departmentSocket(id_department, msg1, connectObj);
        var subadmin_id = await get_subadmin_id(id_department, id_user)
        if (subadmin_id.length != 0) {
            subadmin_id.map(async (value) => {
                var socket10 = await subadminSocket(value.id_subadmin, msg1, connectObj);
                var subDashboardCountMsg = "subDashboardLiveCallConnectCount";
                var socket11 = await subadminSocket(value.id_subadmin, subDashboardCountMsg, dashConnectObj);
                var socket6 = await subadminSocket(value.id_subadmin,  msg10, callObj);
                var socket6 = await subadminSocket(value.id_subadmin, useroncallCountMsg, userpopup);
            })
        }
        dashboardAgentActivityLog("userActivityCallStatus......" + data.user_id)
        dashboardAgentActivityLog(callObj)
        dashboardAgentActivityLog("userActivityOncallCount......" + data.user_id)
        dashboardAgentActivityLog(userpopup)
        if (data.destination != undefined) {
            var socket3 = await didSocket(data.destination, msg1);
        }
        var updateSql =`UPDATE livecalls SET user_id=${user_id},connect_channel = '${agentChannel}' WHERE uniqueId ='${uniqueId}'`;
        var [updateRes] = await sequelize.query(updateSql);

        var updateSql =`UPDATE user_live_data SET currentCallStatus='${obj.currentCallStatus}',currentCallAnsTime='${data.answeredTime}',currentCallStartTime='${data.callStartTime}' WHERE user_id ='${user_id}'`;
        var [updateRes] = await sequelize.query(updateSql);

        return "result"
    } catch (err) {
        console.error(err);
    }
}
async function delete_livecall(uniqueId) {
    try {
        var result = await livecallModel.destroy({ where: { uniqueId: uniqueId } });
        return result
    } catch (err) {
        console.error(err);
    }
}
async function add_incomingcall(liveData, data) {
    try {
        if (liveData.app == 'user') {
            var user_id = liveData.appId
        } else if (liveData.app == 'smartgroup' || liveData.app == 'callflow' || liveData.callType == 'Internal') {
            var user_id = liveData.userId
        } else {
            var user_id = 0
        }

        // Remove user from hold in case the direct call ends
        if(liveData.holded_time) {
            await userLiveData.update({ isHold: 0 }, { where: { user_id }});
        }
        
        const callstarttime = new Date(liveData.eventTime);
        const callendtime = new Date(data.end_time);
        const durationInMilliseconds = callendtime - callstarttime;
        const durationInSeconds = Math.abs(durationInMilliseconds / 1000);
        console.log("livecall answered time--------->", liveData.answeredTime)
        if (liveData.answeredTime != undefined) {
            var userpopup = {
                agentId: Number(user_id),
                count: -1,
                available: +1
            }
            var useroncallCountMsg = "userActivityOncallCount"
            var useroncall = await adminSocket(liveData.customerId, useroncallCountMsg, userpopup);
            var useroncall1 = await departmentSocket(liveData.deptId, useroncallCountMsg, userpopup);
            var dashConnectObj = {
                type: "incoming",
                uniqueId: data.call_unique_id,
                answeredCount: -1,
                ringCount: 0
            }
            console.log("dashConnectObj ----->", dashConnectObj)
            var dashboardCountMsg = "dashboardLiveCallConnectCount";
            var socket5 = await adminSocket(liveData.customerId, dashboardCountMsg, dashConnectObj);
            var deptDashboardCountMsg = "deptDashboardLiveCallConnectCount";
            var socket6 = await departmentSocket(liveData.deptId, deptDashboardCountMsg, dashConnectObj);
            var subadmin_id = await get_subadmin_id(liveData.deptId, liveData.customerId)
            if (subadmin_id.length != 0) {
                subadmin_id.map(async (value) => {
                    var subDashboardCountMsg = "subDashboardLiveCallConnectCount";
                    var socket11 = await subadminSocket(value.id_subadmin, subDashboardCountMsg, dashConnectObj);
                    var useroncall1 = await subadminSocket(value.id_subadmin, useroncallCountMsg, userpopup);
                })
            }
            dashboardAgentActivityLog("userActivityOncallCount......" + user_id)
            dashboardAgentActivityLog(userpopup)
            var status = 'ANSWERED'
            var socketStatus = 'connected'
            const callConnectedTime = new Date(liveData.answeredTime);
            const connectedDurationInMilliseconds = callendtime - callConnectedTime;
            var connectedDurationInSeconds = Math.abs(connectedDurationInMilliseconds / 1000);
            var missedcallUpdate = update_unique_missedcall(liveData.callerNumber, liveData.customerId, liveData.deptId, status, liveData.eventTime, data.call_unique_id, liveData.didNumber, user_id, connectedDurationInSeconds, data.tried_agents)
        } else {
            var userpopup = {
                agentId: Number(user_id),
                count: +1,
                available: -1
            }
            var userpopupCountMsg = "userActivityOnpopupCount"
            var userpopupRes = await adminSocket(liveData.customerId, userpopupCountMsg, userpopup);
            var socket6 = await departmentSocket(liveData.deptId, userpopupCountMsg, userpopup);
            var dashConnectObj = {
                type: "incoming",
                uniqueId: data.call_unique_id,
                answeredCount: 0,
                ringCount: -1
            }
            console.log("dashConnectObj ----->", dashConnectObj)
            var dashboardCountMsg = "dashboardLiveCallConnectCount";
            var socket5 = await adminSocket(liveData.customerId, dashboardCountMsg, dashConnectObj );
            var deptDashboardCountMsg = "deptDashboardLiveCallConnectCount";
            var socket6 = await departmentSocket(liveData.deptId, deptDashboardCountMsg, dashConnectObj);
            var subadmin_id = await get_subadmin_id(liveData.deptId, liveData.customerId)
            if (subadmin_id.length != 0) {
                subadmin_id.map(async (value) => {
                    var subDashboardCountMsg = "subDashboardLiveCallConnectCount";
                    var socket11 = await subadminSocket(value.id_subadmin, subDashboardCountMsg, dashConnectObj);
                    var socket6 = await subadminSocket(value.id_subadmin, userpopupCountMsg, userpopup);
                })
            }
            var status = 'FAILED'
            var socketStatus = 'missed'
            var connectedDurationInSeconds = 0
            liveData.user_id = user_id;
            var missedcall = await add_unique_missedcall(liveData, data)
        }
        var callObj = {
            agentId: Number(user_id),
            status: "onPopup"
        }
        var msg10 = 'userActivityCallStatus'
        var socket3 = await adminSocket(liveData.customerId, msg10, callObj);
        var socket6 = await departmentSocket(liveData.deptId, msg10, callObj);
        var obj = {
            id_department: liveData.deptId,
            id_user: liveData.customerId,
            user_id: user_id,
            call_start_time: liveData.eventTime,
            call_end_time: data.end_time,
            call_connected_time: liveData.answeredTime,
            uniqueid: data.call_unique_id,
            source: liveData.callerNumber,
            destination: liveData.didNumber,
            connected_user_id: user_id,
            connected_user: user_id,
            connected_duration: connectedDurationInSeconds,
            total_duration: durationInSeconds,
            call_status: status,
            user_status: status,
            cr_file: data.cr_file,
            app: liveData.app,
            appId: liveData.appId,
            dtmf_sequence: liveData.dtmf_sequence,
            first_tried_user : liveData.firstTriedUser,
            last_tried_user : liveData.lastTriedUser,
            calltask_contact_id : liveData.callProcessId,
            sticky_status : Number(liveData.sticky_status),
            total_hold_time: liveData.total_hold_time,
            app_target_id: liveData.app_target_id,
        }
        if (data.cr_file) {
            if (liveData.callType == 'Transfer') {
                obj.cr_file = liveData.cr_file
            }
        }
        console.log("obj ---------------->",obj)
        console.log("userStatus ---------------->",data.userStatus)
        console.log("data.callStatus ---------------->",data.callStatus)
        
        if(liveData.app == 'smartgroup' || liveData.app == 'callflow'){
            if(data.callStatus != undefined && data.callStatus){
                obj.call_status =  data.callStatus
            }
            if (data.userStatus != undefined){
                obj.user_status = data.userStatus
            }
        }
        if (liveData.answeredTime != undefined) {
            console.log("live data ---->", liveData)
            let didSql = `SELECT did,cf_number FROM user_settings WHERE user_id = ${user_id}`;
            let [didRes] = await getConnection.query(didSql);
            if(liveData.callType == 'Internal' && liveData.callForwardNumber != undefined){
                console.log("call forward number",didRes)
                if(didRes.length != 0){
                    var calculatedRate = await rate_calculation({ did: didRes[0].did, destinationType: liveData.destinationType == "pstn" ? "pstn" : "incoming", id_user: obj.id_user, totalCallDuration: connectedDurationInSeconds, contact_number: liveData.callForwardNumber, callType: liveData.callType })
                }
            }else{
                let contactNumber;
                if(liveData.destinationType == "pstn"){
                    contactNumber=didRes[0].cf_number;
                }else{
                    contactNumber = liveData.callerNumber
                }
                var calculatedRate = await rate_calculation({ did: liveData.didNumber, destinationType: liveData.destinationType == "pstn" ? "pstn" : "incoming", id_user: obj.id_user, totalCallDuration: connectedDurationInSeconds, contact_number: contactNumber, callType: liveData.callType })
            }
            console.log("calculatedRate ------------------>", calculatedRate)
            obj.cost = calculatedRate
            if (calculatedRate != undefined && calculatedRate != 0) {
                var rateObj = {
                    rate: calculatedRate
                }
                var msg = 'rateCalculation'
                var socket = await adminSocket(obj.id_user, msg, rateObj);
            }
        }
        console.log("incoming call data obj ----->",obj)
        const result = await retryTransaction(async (transaction) => {
            return await incomingCallReportModel.create(obj, { transaction });
        });
        var livecallDeleteSql = `DELETE FROM livecalls WHERE uniqueId = '${data.call_unique_id}'`;
        var [livecallDelete] = await sequelize.query(livecallDeleteSql);
        var currentDate = new Date();
        var obj1 = {
            phnNo: liveData.callerNumber,
            type: liveData.type,
            agentId: liveData.user_id,
            time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
            didNumber: liveData.didNumber,
            event: 'end',
            currentCallStatus: 5,
            id: data.call_unique_id,
            regNumber: liveData.user_id,
        }
        if (user_id != undefined) {
             //for getting calls even in popup
            update_pop_status(user_id)
            if (liveData.callType !== "callTaskDestination" && liveData.callType !== "callTaskSource") {
                if (liveData.app == 'smartgroup' || liveData.app == 'callflow') {
                    console.log("end pop ------------>", liveData.app)
                    if (obj.user_status == "ANSWERED") {
                        console.log("end pop ------------>", obj.user_status)
                        // var sql = `SELECT popup_status FROM user_live_data WHERE user_id = ${user_id}`;
                        // var [popupRes] = await sequelize.query(sql);
                        // console.log("popupRes ---------->", popupRes)
                        // if (popupRes.length != 0) {
                        //     if (popupRes[0].popup_status != 1) {
                                var msg3 = 'endUserCallPopup'
                                var socket3 = await userSocket(user_id, msg3, obj1);
                        //     }
                        // }
                    }
                } else {
                    // var sql = `SELECT popup_status FROM user_live_data WHERE user_id = ${user_id}`;
                    // var [popupRes] = await sequelize.query(sql);
                    // console.log("popupRes ---------->", popupRes)
                    // if (popupRes.length != 0) {
                    //     if (popupRes[0].popup_status != 1) {
                            var msg3 = 'endUserCallPopup'
                            var socket3 = await userSocket(user_id, msg3, obj1);
                    //     }
                    // }
                }
            }
            var msg2 = 'endAdminMonitoring'
            var socket1 = await adminSocket(liveData.customerId, msg2, obj1);
            var socket1 = await departmentSocket(liveData.deptId, msg2, obj1);
            var subadmin_id = await get_subadmin_id(liveData.deptId, liveData.customerId)
            if (subadmin_id.length != 0) {
                subadmin_id.map(async (value) => {
                    var socket10 = await subadminSocket(value.id_subadmin, msg2, obj1);
                })
            }
            var monotioringObj = {
                calls: 0,
                lastCalls: 0,
                user_id: user_id,
                call_end_time: data.end_time,
                currentCallStatus: 1,
                direction: 'incoming_call_end'
            }
            var msg6 = 'userMonitoringCallstatus'
            var socket6 = await adminSocket(liveData.customerId, msg6, monotioringObj);
        }
        var endObj = {
            uniqueId: data.call_unique_id,
        }
        var countObj = { count: -1, type: 'incoming' }
        var msg3 = 'adminDashboardLivecallCount'
        var socket3 = await adminSocket(liveData.customerId, msg3, countObj);
        var msg1 = 'endLiveCallReport'
        var socket1 = await adminSocket(liveData.customerId, msg1, endObj);
       
        var msg1 = 'endLiveCallReport'
        if (liveData.callType == 'Transfer') {
            var endObj1 = {
                uniqueId: liveData.parentUniqueId
            }
            var msg11 = 'endLiveCallReport'
            var socket1 = await adminSocket(liveData.customerId, msg11, endObj1);
            var socket1 = await departmentSocket(liveData.deptId, msg11, endObj1);
            var subadmin_id = await get_subadmin_id(liveData.deptId, liveData.customerId)
            if (subadmin_id.length != 0) {
                subadmin_id.map(async (value) => {
                    var socket6 = await subadminSocket(value.id_subadmin, msg11, endObj1);
                })
            }
        }
        var socket1 = await departmentSocket(liveData.deptId, msg1, endObj);
        var msg11 = 'deptDashboardLivecallCount'
        var socket11 = await departmentSocket(liveData.deptId, msg11, countObj);
        var subadmin_id = await get_subadmin_id(liveData.deptId, liveData.customerId)
        if (subadmin_id.length != 0) {
            subadmin_id.map(async (value) => {
                var socket10 = await subadminSocket(value.id_subadmin, msg1, endObj);
                var msg12 = 'subAdminDashboardLivecallCount'
                var socket12 = await subadminSocket(value.id_subadmin, msg12, countObj);
                var msg10 = 'userActivityCallStatus'
                var socket6 = await subadminSocket(value.id_subadmin, msg10, callObj);
            })
        }
        dashboardAgentActivityLog("userActivityCallStatus......" + user_id)
        dashboardAgentActivityLog(callObj)
        if (liveData.didNumber != undefined) {
            var socket5 = await didSocket(liveData.didNumber, msg1);
        }
       
        if (liveData.app == 'smartgroup') {
            var obj2 = { count: -1, smartGroupId: liveData.appId }
            var msg7 = 'smartGroupOnCallCount'
            var socket5 = await adminSocket(liveData.customerId, msg7, obj2);
            var socket6 = await smartgroupSocket(liveData.appId, msg7, obj2);
            var socket11 = await smartgroupSocket(liveData.appId, msg1, obj2);

            var callMsg = 'livecallSmartgroup'
            var endObj = { count: -1, status: 'end', smartgroupId: liveData.appId, userId: user_id, uniqueid: data.call_unique_id }
            console.log("livecallSmartgroup in add_incomingcall function ------->", callMsg)
            console.log("livecallSmartgroup obj in add_incomingcall function ------->", endObj)
            var socket7 = await smartgroupSocket(liveData.appId, callMsg, endObj);
            var socket8 = await adminSocket(liveData.customerId, callMsg, endObj);

            var callMsg = 'livecallSmartgroupConnected'
            var connectCallObj = { count: +1, status: socketStatus, smartgroupId: liveData.appId, uniqueId: data.call_unique_id, userId: user_id }
            console.log("livecallSmartgroupConnected in add_incomingcall function ------->", callMsg)
            console.log("livecallSmartgroupConnected obj in add_incomingcall function ------->", connectCallObj)
            var socket9 = await smartgroupSocket(liveData.appId, callMsg, connectCallObj);
            var socket10 = await adminSocket(liveData.customerId, callMsg, connectCallObj);

            var callMsg = 'smartgroupAgentStatusEnd'
            var AgentStatusObj = { smartgroupId: liveData.appId, uniqueId: data.call_unique_id }
            console.log("smartgroupAgentStatusEnd in add_incomingcall function ------->", callMsg)
            console.log("smartgroupAgentStatusEnd obj in add_incomingcall function ------->", AgentStatusObj)
            var socket9 = await smartgroupSocket(liveData.appId, callMsg, AgentStatusObj);
            var socket10 = await adminSocket(liveData.customerId, callMsg, AgentStatusObj);
        }
        
        var updateSql =`UPDATE user_live_data SET lastCallEndTime='${data.end_time}',currentCallStatus= 0  WHERE user_id ='${user_id}'`;
        var [updateRes] = await sequelize.query(updateSql);

    } catch (err) {
        console.error(err);
    }
}
async function add_unique_missedcall(liveData, data) {
    try {
        var status = 'FAILED'
        var connectedDurationInSeconds = 0
        var missedSql = `SELECT * FROM unique_missed_reports WHERE sourceNumber = '${liveData.callerNumber}' and id_user = '${liveData.customerId}' and id_department = '${liveData.deptId}' ORDER BY insertedTime DESC LIMIT 1`
        var missedRes = await retryTransaction(async (transaction) => {
            return await sequelize.query(missedSql, { transaction });
        });
        missedRes = missedRes[0];
        console.log("missed data length---------->", missedRes.length)
        console.log(missedRes)
        var get_did = await get_didSettings()
        var did_result = get_did.find(item => item.did === liveData.didNumber);
        if (did_result != undefined) {
            console.log("missed call consideration ------------>",did_result.missed_consideration)
            console.log("missedRes length---------->", missedRes.length)
            if (Number(did_result.missed_consideration) == 1) {
                if (missedRes.length == 0) {
                    var missedObj = {
                        id_user: liveData.customerId,
                        id_department: liveData.deptId,
                        call_start_time: liveData.eventTime,
                        firstCallStartTime: liveData.eventTime,
                        latestCallStartTime: liveData.eventTime,
                        sourceNumber: liveData.callerNumber,
                        didNumber: liveData.didNumber,
                        connectedDuration: connectedDurationInSeconds,
                        callStatus: status,
                        application: liveData.app,
                        callUniqueId: data.call_unique_id,
                        missed_count: 1,
                        type: 'missed',
                        destination_app: liveData.app,
                        destination_name: liveData.app,
                        destination_id: liveData.appId,
                        user_id: liveData.user_id,
                    }
                    console.log("missed call insert data obj ------------>",missedObj)
                    const result = await retryTransaction(async (transaction) => {
                        return await missedcallReportModel.create(missedObj, { transaction });
                    });
                    var uniqueMissedObj = {
                        id_user: liveData.customerId,
                        id_department: liveData.deptId,
                        unique_missedcall_id: result.dataValues.id,
                        status: 1,
                        missedcall_count: 1,
                        latestCallStartTime: liveData.eventTime,
                        callUniqueId: data.call_unique_id,
                        tried_agents: data.tried_agents
                    }
                    console.log("unique missed update obj ------------>",uniqueMissedObj)
                    var missedcall = await uniqueMissedcallModel.create(uniqueMissedObj);
                    return result
                } else {
                    var missedcallData = await uniqueMissedcallModel.find({ unique_missedcall_id: missedRes[0].id });
                    console.log("missedcallData ------------>",missedcallData)
                    if (missedcallData.length != 0) {
                        console.log("missed status ------------>",missedcallData[0]._doc.status)
                        if (missedcallData[0]._doc.status == 1) {
                            var result = await uniqueMissedcallModel.updateOne({ unique_missedcall_id: missedRes[0].id }, { $inc: { missedcall_count: 1 }, latestCallStartTime: liveData.eventTime, callUniqueId: data.call_unique_id,tried_agents: data.tried_agents });
                        } else {
                            var missedObj = {
                                id_user: liveData.customerId,
                                id_department: liveData.deptId,
                                call_start_time: liveData.eventTime,
                                firstCallStartTime: liveData.eventTime,
                                latestCallStartTime: liveData.eventTime,
                                sourceNumber: liveData.callerNumber,
                                didNumber: liveData.didNumber,
                                connectedDuration: connectedDurationInSeconds,
                                callStatus: status,
                                application: liveData.app,
                                uniqueid: data.call_unique_id,
                                missed_count: 1,
                                type: 'missed',
                                destination_app: liveData.app,
                                destination_name: liveData.app,
                                destination_id: liveData.appId,
                                user_id: liveData.user_id,
                            }
                            console.log("missed call insert data obj ------------>",missedObj)
                            const result = await retryTransaction(async (transaction) => {
                                return await missedcallReportModel.create(missedObj, { transaction });
                            });
                            var uniqueMissedObj = {
                                id_user: liveData.customerId,
                                id_department: liveData.deptId,
                                unique_missedcall_id: result.dataValues.id,
                                status: 1,
                                missedcall_count: 1,
                                latestCallStartTime: liveData.eventTime,
                                callUniqueId: data.call_unique_id,
                                tried_agents: data.tried_agents
                            }
                            console.log("unique missed update obj ------------>",uniqueMissedObj)
                            var missedcall = await uniqueMissedcallModel.create(uniqueMissedObj);
                        }
                        return result
                    }
                }
            } else {
                if (Number(did_result.missed_consideration) == 0) {
                    console.log("event_status ------------>",liveData.event_status)
                    if (liveData.event_status != 'dailAnswered') {
                        console.log("missedRes length---------->", missedRes.length)
                        if (missedRes.length == 0) {
                            var missedObj = {
                                id_user: liveData.customerId,
                                id_department: liveData.deptId,
                                call_start_time: liveData.eventTime,
                                firstCallStartTime: liveData.eventTime,
                                latestCallStartTime: liveData.eventTime,
                                sourceNumber: liveData.callerNumber,
                                didNumber: liveData.didNumber,
                                connectedDuration: connectedDurationInSeconds,
                                callStatus: status,
                                application: liveData.app,
                                callUniqueId: data.call_unique_id,
                                missed_count: 1,
                                type: 'missed',
                                destination_app: liveData.app,
                                destination_name: liveData.app,
                                destination_id: liveData.appId,
                                user_id: liveData.user_id,
                            }
                            console.log("missed call insert data obj ------------>",missedObj)
                            const result = await retryTransaction(async (transaction) => {
                                return await missedcallReportModel.create(missedObj, { transaction });
                            });
                            var uniqueMissedObj = {
                                id_user: liveData.customerId,
                                id_department: liveData.deptId,
                                unique_missedcall_id: result.dataValues.id,
                                status: 1,
                                missedcall_count: 1,
                                latestCallStartTime: liveData.eventTime,
                                callUniqueId: data.call_unique_id,
                                tried_agents: data.tried_agents
                            }
                            console.log("unique missed update obj ------------>",uniqueMissedObj)
                            var missedcall = await uniqueMissedcallModel.create(uniqueMissedObj);
                            return result
                        } else {
                            var missedcallData = await uniqueMissedcallModel.find({ unique_missedcall_id: missedRes[0].id });
                            console.log("missedcallData ------------>",missedcallData)
                            if (missedcallData.length != 0) {
                                console.log("missed status ------------>",missedcallData[0]._doc.status)
                                if (missedcallData[0]._doc.status == 1) {
                                    var result = await uniqueMissedcallModel.updateOne({ unique_missedcall_id: missedRes[0].id }, { $inc: { missedcall_count: 1 }, latestCallStartTime: liveData.eventTime, callUniqueId: data.call_unique_id,tried_agents: data.tried_agents });
                                } else {
                                    var missedObj = {
                                        id_user: liveData.customerId,
                                        id_department: liveData.deptId,
                                        call_start_time: liveData.eventTime,
                                        firstCallStartTime: liveData.eventTime,
                                        latestCallStartTime: liveData.eventTime,
                                        sourceNumber: liveData.callerNumber,
                                        didNumber: liveData.didNumber,
                                        connectedDuration: connectedDurationInSeconds,
                                        callStatus: status,
                                        application: liveData.app,
                                        uniqueid: data.call_unique_id,
                                        missed_count: 1,
                                        type: 'missed',
                                        destination_app: liveData.app,
                                        destination_name: liveData.app,
                                        destination_id: liveData.appId,
                                        user_id: liveData.user_id,
                                    }
                                    console.log("missed call insert data obj ------------>",missedObj)
                                    const result = await retryTransaction(async (transaction) => {
                                        return await missedcallReportModel.create(missedObj, { transaction });
                                    });
                                    var uniqueMissedObj = {
                                        id_user: liveData.customerId,
                                        id_department: liveData.deptId,
                                        unique_missedcall_id: result.dataValues.id,
                                        status: 1,
                                        missedcall_count: 1,
                                        latestCallStartTime: liveData.eventTime,
                                        callUniqueId: data.call_unique_id,
                                        tried_agents: data.tried_agents
                                    }
                                    console.log("unique missed update obj ------------>",uniqueMissedObj)
                                    var missedcall = await uniqueMissedcallModel.create(uniqueMissedObj);
                                }
                                return result
                            }
                        }
                    }
                }
            }
        } else {
            console.log("missedRes length---------->", missedRes.length)
            if (missedRes.length == 0) {
                var missedObj = {
                    id_user: liveData.customerId,
                    id_department: liveData.deptId,
                    call_start_time: liveData.eventTime,
                    firstCallStartTime: liveData.eventTime,
                    latestCallStartTime: liveData.eventTime,
                    sourceNumber: liveData.callerNumber,
                    didNumber: liveData.didNumber,
                    connectedDuration: connectedDurationInSeconds,
                    callStatus: status,
                    application: liveData.app,
                    callUniqueId: data.call_unique_id,
                    missed_count: 1,
                    type: 'missed',
                    destination_app: liveData.app,
                    destination_name: liveData.app,
                    destination_id: liveData.appId,
                    user_id: liveData.user_id,
                }
                console.log("missed call insert data obj ------------>",missedObj)
                const result = await retryTransaction(async (transaction) => {
                    return await missedcallReportModel.create(missedObj, { transaction });
                });
                var uniqueMissedObj = {
                    id_user: liveData.customerId,
                    id_department: liveData.deptId,
                    unique_missedcall_id: result.dataValues.id,
                    status: 1,
                    missedcall_count: 1,
                    latestCallStartTime: liveData.eventTime,
                    callUniqueId: data.call_unique_id,
                    tried_agents: data.tried_agents
                }
                console.log("unique missed update obj ------------>",uniqueMissedObj)
                var missedcall = await uniqueMissedcallModel.create(uniqueMissedObj);
                return result
            } else {
                var missedcallData = await uniqueMissedcallModel.find({ unique_missedcall_id: missedRes[0].id });
                console.log("missedcallData ------------>",missedcallData)
                if (missedcallData.length != 0) {
                    console.log("missed status ------------>",missedcallData[0]._doc.status)
                    if (missedcallData[0]._doc.status == 1) {
                        var result = await uniqueMissedcallModel.updateOne({ unique_missedcall_id: missedRes[0].id }, { $inc: { missedcall_count: 1 }, latestCallStartTime: liveData.eventTime, callUniqueId: data.call_unique_id,tried_agents: data.tried_agents });
                    } else {
                        var missedObj = {
                            id_user: liveData.customerId,
                            id_department: liveData.deptId,
                            call_start_time: liveData.eventTime,
                            firstCallStartTime: liveData.eventTime,
                            latestCallStartTime: liveData.eventTime,
                            sourceNumber: liveData.callerNumber,
                            didNumber: liveData.didNumber,
                            connectedDuration: connectedDurationInSeconds,
                            callStatus: status,
                            application: liveData.app,
                            uniqueid: data.call_unique_id,
                            missed_count: 1,
                            type: 'missed',
                            destination_app: liveData.app,
                            destination_name: liveData.app,
                            destination_id: liveData.appId,
                            user_id: liveData.user_id,
                        }
                        console.log("missed call insert data obj ------------>",missedObj)
                        const result = await retryTransaction(async (transaction) => {
                            return await missedcallReportModel.create(missedObj, { transaction });
                        });
                        var uniqueMissedObj = {
                            id_user: liveData.customerId,
                            id_department: liveData.deptId,
                            unique_missedcall_id: result.dataValues.id,
                            status: 1,
                            missedcall_count: 1,
                            latestCallStartTime: liveData.eventTime,
                            callUniqueId: data.call_unique_id,
                            tried_agents: data.tried_agents
                        }
                        console.log("unique missed update obj ------------>",uniqueMissedObj)
                        var missedcall = await uniqueMissedcallModel.create(uniqueMissedObj);
                    }
                    return result
                }
            }
        }

    } catch (err) {
        console.error(err);
    }
}
async function update_unique_missedcall(callerNumber, id_user, id_department, status, eventTime, callUniqueId, didNumber,user_id,connectedDurationInSeconds,tried_agents) {
    try {
        if (status == 'ANSWER' || status == 'answer' || status == 'ANSWERED' || status == 'answered') {
            var get_did = await get_didSettings()
            var did_result = get_did.find(item => item.did === didNumber);
            console.log("did_result------->", did_result)
            if (did_result != undefined) {
                console.log("did_result.missed_completion_by------->", did_result.missed_completion_by)
                if (Number(did_result.missed_completion_by) == 1) {
                    var missedSql = `SELECT * FROM unique_missed_reports WHERE sourceNumber = '${callerNumber}' and id_user = '${id_user}' and id_department = '${id_department}'  ORDER BY insertedTime DESC LIMIT 1`
                    const [missedRes] = await retryTransaction(async (transaction) => {
                        return await sequelize.query(missedSql, { transaction });
                    });
                    console.log("missed data length---------->", missedRes.length)
                    if (missedRes.length != 0) {
                        var missedcallData = await uniqueMissedcallModel.find({ unique_missedcall_id: missedRes[0].id });
                        if (missedcallData.length != 0) {
                            if (missedcallData[0]._doc.status == 1) {
                                var updateSql = `UPDATE unique_missed_reports SET connectedDuration='${connectedDurationInSeconds}',user_id = '${user_id}',callback_count = callback_count + 1 WHERE id = '${missedRes[0].id}' `
                                const [updateRes] = await retryTransaction(async (transaction) => {
                                    return await sequelize.query(updateSql, { transaction });
                                });
                                var result = await uniqueMissedcallModel.updateOne({ unique_missedcall_id: missedRes[0].id }, { $set: { status: 0, latestCallStartTime: eventTime, callUniqueId: callUniqueId,tried_agents: tried_agents }, $inc: { callback_count: 1 }});
                            }
                        }
                    }
                } else {
                    var missedSql = `SELECT * FROM unique_missed_reports WHERE sourceNumber = '${callerNumber}' and id_user = '${id_user}' and id_department = '${id_department}'  ORDER BY insertedTime DESC LIMIT 1`
                    const [missedRes] = await retryTransaction(async (transaction) => {
                        return await sequelize.query(missedSql, { transaction });
                    });
                    console.log("missed data length---------->", missedRes.length)
                    if (missedRes.length != 0) {
                        console.log("missedRes[0].didNumber------->", missedRes[0].didNumber)
                        console.log("didNumber------->", didNumber)
                        if (missedRes[0].didNumber == didNumber) {
                            var missedcallData = await uniqueMissedcallModel.find({ unique_missedcall_id: missedRes[0].id });
                            if (missedcallData.length != 0) {
                                if (missedcallData[0]._doc.status == 1) {
                                    var updateSql = `UPDATE unique_missed_reports SET connectedDuration=${connectedDurationInSeconds},user_id = '${user_id}',callback_count = callback_count + 1 WHERE id = '${missedRes[0].id}' `
                                    const [updateRes] = await retryTransaction(async (transaction) => {
                                        return await sequelize.query(updateSql, { transaction });
                                    });
                                    var result = await uniqueMissedcallModel.updateOne({ unique_missedcall_id: missedRes[0].id }, { $set: { status: 0, latestCallStartTime: eventTime, callUniqueId: callUniqueId,tried_agents: tried_agents }, $inc: { callback_count: 1 }});
                                }
                            }
                        }
                    }
                }
            } else {
                var missedSql = `SELECT * FROM unique_missed_reports WHERE sourceNumber = '${callerNumber}' and id_user = '${id_user}' and id_department = '${id_department}'  ORDER BY insertedTime DESC LIMIT 1`
                const [missedRes] = await retryTransaction(async (transaction) => {
                    return await sequelize.query(missedSql, { transaction });
                });
                console.log("didNumber   ---->", didNumber)
                var didNumberFrom = didNumber
                console.log("didNumber   ---->", didNumberFrom)
                console.log("missed data length---------->", missedRes.length)
                if (missedRes.length != 0) {
                    console.log("missedRes[0].didNumber------>", missedRes[0].didNumber, " did ----->", didNumberFrom)
                    if (missedRes[0].didNumber == didNumberFrom) {
                        var missedcallData = await uniqueMissedcallModel.find({ unique_missedcall_id: Number(missedRes[0].id) });
                        console.log("missedRes[0].id   ---->", missedRes[0].id)
                        console.log("missedcallData   ---->", missedcallData)
                        if (missedcallData.length != 0) {
                            if (missedcallData[0]._doc.status == 1) {
                                var updateSql = `UPDATE unique_missed_reports SET connectedDuration='${connectedDurationInSeconds}',user_id = '${user_id}',callback_count = callback_count + 1 WHERE id = '${missedRes[0].id}' `
                                const [updateRes] = await retryTransaction(async (transaction) => {
                                    return await sequelize.query(updateSql, { transaction });
                                });
                                console.log("inner check    ---->", missedRes[0])
                                var result = await uniqueMissedcallModel.updateOne({ unique_missedcall_id: missedRes[0].id }, { $set: { status: 0, latestCallStartTime: eventTime, callUniqueId: callUniqueId, tried_agents: tried_agents }, $inc: { callback_count: 1 } });

                            }
                        }
                    }
                }
            }
        }else{
            var missedSql = `SELECT * FROM unique_missed_reports WHERE sourceNumber = '${callerNumber}' and id_user = '${id_user}' and id_department = '${id_department}'  ORDER BY insertedTime DESC LIMIT 1`
            const [missedRes] = await retryTransaction(async (transaction) => {
                return await sequelize.query(missedSql, { transaction });
            });
            if (missedRes.length != 0) {
                console.log("missedRes[0].didNumber------->", missedRes[0].didNumber)
                console.log("didNumber------->", didNumber)
                if (missedRes[0].didNumber == didNumber) {
                    var missedcallData = await uniqueMissedcallModel.find({ unique_missedcall_id: missedRes[0].id });
                    if (missedcallData.length != 0) {
                        if (missedcallData[0]._doc.status == 1) {
                            // var updateSql = `UPDATE unique_missed_reports SET callback_count = callback_count + 1 WHERE id = '${missedRes[0].id}' `
                            // const [updateRes] = await retryTransaction(async (transaction) => {
                            //     return await sequelize.query(updateSql, { transaction });
                            // });
                            var result = await uniqueMissedcallModel.updateOne({ unique_missedcall_id: missedRes[0].id }, { $inc: { callback_count: 1 }})
                        }
                    }
                }
            }
        }
        return callerNumber
    } catch (err) {
        console.error(err);
        return err
    }
}
async function add_outgoingcall(liveData, data) {
    try {
        console.log("liveData ------>",liveData.callProcessId)
        if (liveData.app == 'user') {
            var user_id = liveData.appId
        } else if (liveData.direction == 'outgoing') {
            var user_id = liveData.userId
        } else {
            var user_id = 0
        }

        // Remove user from hold in case the direct call ends
        if(liveData.holded_time) {
            await userLiveData.update({ isHold: 0 }, { where: { user_id }});
        }
        
        console.log("outgoing answered time------->", liveData.answeredTime)
        console.log("livecall clicktoCallScndLeg--------->", liveData.clicktoCallScndLeg)
        console.log("livecall clicktoCallAnswertTime--------->", liveData.clicktoCallAnswertTime)
        var callObj = {
            agentId: Number(user_id),
            status: "onPopup"
        }
        var msg10 = 'userActivityCallStatus'
        var socket3 = await adminSocket(liveData.customerId, msg10, callObj);
        var socket6 = await departmentSocket(liveData.deptId, msg10, callObj);
        if (liveData.answeredTime != 'Invalid Date' && liveData.clicktoCallAnswertTime == undefined) {
            var answeredTime = new Date(liveData.answeredTime);
            if (liveData.callType == "Transfer") {
                var callendtime = new Date(liveData.parentCallendTime);
            } else {
                var callendtime = new Date(data.end_time);
            }
            var durationInMilliseconds = callendtime - answeredTime;
            var durationInSeconds = Math.abs(durationInMilliseconds / 1000);
            if (liveData.clicktoCallScndLeg == 'clickToCallDestination') {
                console.log("liveData.clicktoCallAnswertTime ----->", liveData.clicktoCallAnswertTime)
                if (liveData.clicktoCallAnswertTime != undefined) {
                    var secndLegAnsweredTime = new Date(liveData.clicktoCallAnswertTime);
                    var secndLegCallendtime = new Date(data.end_time);
                    var secndLegDurationInMilliseconds = secndLegCallendtime - secndLegAnsweredTime;
                    var secndLegDurationInSeconds = Math.abs(secndLegDurationInMilliseconds / 1000);
                } else {
                    var secndLegDurationInSeconds = 0
                }
            } else {
                var secndLegDurationInSeconds = 0
            }
        } else if (liveData.clicktoCallScndLeg == 'clickToCallDestination') {
            var answeredTime = new Date(liveData.answeredTime);
            var callendtime = new Date(data.end_time);
            var durationInMilliseconds = callendtime - answeredTime;
            var durationInSeconds = Math.abs(durationInMilliseconds / 1000);
            console.log("liveData.clicktoCallAnswertTime ----->", liveData.clicktoCallAnswertTime)
            if (liveData.clicktoCallAnswertTime != undefined) {
                var secndLegAnsweredTime = new Date(liveData.clicktoCallAnswertTime);
                var secndLegCallendtime = new Date(data.end_time);
                var secndLegDurationInMilliseconds = secndLegCallendtime - secndLegAnsweredTime;
                var secndLegDurationInSeconds = Math.abs(secndLegDurationInMilliseconds / 1000);
            } else {
                var secndLegDurationInSeconds = 0
            }
        } else {
            var secndLegDurationInSeconds = 0
            var durationInSeconds = 0
        }
        if (liveData.answeredTime != 'Invalid Date' && liveData.answeredTime != undefined) {
            var dashConnectObj = {
                type: "outgoing",
                uniqueId: data.call_unique_id,
                answeredCount: -1,
                ringCount: 0
            }
            console.log("dashConnectObj ----->", dashConnectObj)
            var dashboardCountMsg = "dashboardLiveCallConnectCount";
            var socket5 = await adminSocket(liveData.customerId, dashboardCountMsg, dashConnectObj);
            var deptDashboardCountMsg = "deptDashboardLiveCallConnectCount";
            var socket6 = await departmentSocket(liveData.deptId, deptDashboardCountMsg, dashConnectObj);
            var subadmin_id = await get_subadmin_id(liveData.deptId, liveData.customerId)
            if (subadmin_id.length != 0) {
                subadmin_id.map(async (value) => {
                    var subDashboardCountMsg = "subDashboardLiveCallConnectCount";
                    var socket11 = await subadminSocket(value.id_subadmin, subDashboardCountMsg, dashConnectObj);
                })
            }
        }else{
             var userpopup = {
                agentId: Number(user_id),
                count: +1,
                available: -1
            }
            var userpopupCountMsg = "userActivityOnpopupCount"
            var userpopupRes = await adminSocket(liveData.customerId, userpopupCountMsg, userpopup);
            var socket6 = await departmentSocket(liveData.deptId, userpopupCountMsg, userpopup);
            var dashConnectObj = {
                type: "outgoing",
                uniqueId: data.call_unique_id,
                answeredCount: 0,
                ringCount: -1
            }
            console.log("dashConnectObj ----->", dashConnectObj)
            var dashboardCountMsg = "dashboardLiveCallConnectCount";
            var socket5 = await adminSocket(liveData.customerId, dashboardCountMsg, dashConnectObj);
            var deptDashboardCountMsg = "deptDashboardLiveCallConnectCount";
            var socket6 = await departmentSocket(liveData.deptId, deptDashboardCountMsg, dashConnectObj);
            var subadmin_id = await get_subadmin_id(liveData.deptId, liveData.customerId)
            if (subadmin_id.length != 0) {
                subadmin_id.map(async (value) => {
                    var subDashboardCountMsg = "subDashboardLiveCallConnectCount";
                    var socket11 = await subadminSocket(value.id_subadmin, subDashboardCountMsg, dashConnectObj);
                    var socket11 = await subadminSocket(value.id_subadmin, userpopupCountMsg, userpopup);
                })
            }
        }
        
        var obj = {
            id_department: liveData.deptId,
            id_user: liveData.customerId,
            user_id: user_id,
            date: liveData.eventTime,
            call_end_time: data.end_time,
            answeredTime: liveData.answeredTime,
            uniqueid: data.call_unique_id,
            callerid: liveData.didNumber,
            destination: liveData.dialedNumber,
            duration: durationInSeconds,
            status: data.callStatus,
            type: 'Outbound',
            cr_file: data.cr_file,
            app: "user",
            calltask_contact_id : liveData.callProcessId?.split("|")[0],
            total_hold_time: liveData.total_hold_time
        }
        if(liveData.callType == 'connectSmartgroupDestination'){
            obj.app = 'smartgroup'
        }
        var destinationType = 'sip'
        if (liveData.clicktoCallScndLeg == 'clickToCallDestination') {
            destinationType = 'clickToCallDestination'
        } else if(liveData.clicktoCallAnswertTime == undefined && data.callStatus == 'ANSWER' && (liveData.callType == 'clickToCallSource' || liveData.callType == 'clickToCallDestination')){
            destinationType = 'clickToCallSource'
        }else {
            destinationType = 'sip'
        }
        if (liveData.answeredTime != undefined) {
            console.log("live data ---->", liveData)
            if(liveData.callType == 'Internal' && liveData.callForwardNumber != undefined){
                var didSql = `SELECT did,user_id FROM user_settings WHERE user_id = ${liveData.userId}`;
                var [didRes] = await getConnection.query(didSql);
                if(didRes.length != 0){
                    var calculatedRate = await rate_calculation({ did: didRes[0].did, destinationType: destinationType, id_user: obj.id_user, totalCallDuration: durationInSeconds, contact_number: liveData.callForwardNumber, secndLegDuration: secndLegDurationInSeconds, callType: liveData.callType })
                }
            }else{
                var calculatedRate = await rate_calculation({ did: obj.callerid, destinationType: destinationType, id_user: obj.id_user, totalCallDuration: durationInSeconds, contact_number: obj.destination, secndLegDuration: secndLegDurationInSeconds, callType: liveData.callType })
            }
            console.log("calculatedRate ------------------>", calculatedRate)
            obj.cost = calculatedRate
            if (calculatedRate != undefined || calculatedRate != 0) {
                var rateObj = {
                    rate: calculatedRate
                }
                var msg = 'rateCalculation'
                var socket = await adminSocket(obj.id_user, msg, rateObj);
            }
            var userpopup = {
                agentId: Number(user_id),
                count: -1,
                available: +1
            }
            var useroncallCountMsg = "userActivityOncallCount"
            var useroncall = await adminSocket(liveData.customerId, useroncallCountMsg, userpopup);
            var useroncall1 = await departmentSocket(liveData.deptId, useroncallCountMsg, userpopup);
            var subadmin_id = await get_subadmin_id(liveData.deptId, liveData.customerId)
            if (subadmin_id.length != 0) {
                subadmin_id.map(async (value) => {
                    var socket12 = await subadminSocket(value.id_subadmin, useroncallCountMsg, userpopup);
                })
            }
            dashboardAgentActivityLog("userActivityOncallCount......" + user_id)
            dashboardAgentActivityLog(userpopup)
        }
        console.log("obj ------>", obj)
        const result = await retryTransaction(async (transaction) => {
            return await cc_outgoingCallReportModel.create(obj, { transaction });
        });
        var livecallDeleteSql = `DELETE FROM livecalls WHERE uniqueId = '${data.call_unique_id}'`;
        var [livecallDelete] = await sequelize.query(livecallDeleteSql);
        var missedcallUpdate = update_unique_missedcall(liveData.dialedNumber, liveData.customerId, liveData.deptId, data.callStatus, liveData.eventTime, data.call_unique_id, liveData.didNumber,user_id,durationInSeconds)
        var currentDate = new Date();
        var obj1 = {
            phnNo: liveData.dialedNumber,
            type: liveData.type,
            agentId: liveData.user_id,
            time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
            didNumber: liveData.didNumber,
            event: 'end',
            currentCallStatus: 5,
            id: data.call_unique_id,
            regNumber: liveData.user_id,
        }
        if (user_id != undefined) {
            //for getting calls even in popup
            update_pop_status(user_id)
            if (liveData.callType !== "callTaskDestination" && liveData.callType !== "callTaskSource") {
                // var sql = `SELECT popup_status FROM user_live_data WHERE user_id = ${user_id}`;
                // var [popupRes] = await sequelize.query(sql);
                // console.log("popupRes ---------->", popupRes)
                // if (popupRes.length != 0) {
                //     if (popupRes[0].popup_status != 1) {
                        var msg3 = 'endUserCallPopup'
                        var socket3 = await userSocket(user_id, msg3, obj1);
                //     }
                // }
            }
            var msg2 = 'endAdminMonitoring'
            var socket1 = await adminSocket(liveData.customerId, msg2, obj1);
            var socket1 = await departmentSocket(liveData.deptId, msg2, obj1);
            var subadmin_id = await get_subadmin_id(liveData.deptId, liveData.customerId)
            if (subadmin_id.length != 0) {
                subadmin_id.map(async (value) => {
                    var socket10 = await subadminSocket(value.id_subadmin, msg2, obj1);
                })
            }
            var monotioringObj = {
                calls: 0,
                lastCalls: 0,
                user_id: user_id,
                call_end_time: data.end_time,
                currentCallStatus: 3,
                direction: 'outgoing_call_end'
            }
            var msg6 = 'userMonitoringCallstatus'
            var socket6 = await adminSocket(liveData.customerId, msg6, monotioringObj);
        }
        var endObj = {
            uniqueId: data.call_unique_id,
        }
        var msg1 = 'endLiveCallReport'
        var socket1 = await adminSocket(liveData.customerId, msg1, endObj);
        var msg1 = 'endLiveCallReport'
        var socket1 = await departmentSocket(liveData.deptId, msg1, endObj);
        if(liveData.callType == 'Transfer'){
            var endObj1 = {
                uniqueId: liveData.parentUniqueId
            }
            var msg11 = 'endLiveCallReport'
            var socket1 = await adminSocket(liveData.customerId, msg11, endObj1);
            var socket1 = await departmentSocket(liveData.deptId, msg11, endObj1);
            var subadmin_id = await get_subadmin_id(liveData.deptId, liveData.customerId)
            if (subadmin_id.length != 0) {
                subadmin_id.map(async (value) => {
                    var socket6 = await subadminSocket(value.id_subadmin, msg11, endObj1);
                })
            }
        }
       
        var countObj = { count: -1, type: 'outgoing' }
        var msg3 = 'adminDashboardLivecallCount'
        var socket3 = await adminSocket(liveData.customerId, msg3, countObj);
        var msg11 = 'deptDashboardLivecallCount'
        var socket11 = await departmentSocket(liveData.deptId, msg11, countObj);
        var subadmin_id = await get_subadmin_id(liveData.deptId, liveData.customerId)
        if (subadmin_id.length != 0) {
            subadmin_id.map(async (value) => {
                var socket10 = await subadminSocket(value.id_subadmin, msg1, endObj);
                var msg12 = 'subAdminDashboardLivecallCount'
                var socket12 = await subadminSocket(value.id_subadmin, msg12, countObj);
                var socket6 = await subadminSocket(value.id_subadmin, msg10, callObj);
            })
        }
        dashboardAgentActivityLog("userActivityCallStatus......" + user_id)
        dashboardAgentActivityLog(callObj)
        if (liveData.didNumber != undefined) {
            var socket5 = await didSocket(liveData.didNumber, msg1);
        }

       var updateSql =`UPDATE user_live_data SET lastCallEndTime='${data.end_time}',currentCallStatus= 0  WHERE user_id ='${user_id}'`;
       var [updateRes] = await sequelize.query(updateSql);

    } catch (err) {
        console.error(err);
    }
}
async function insert_callreport(callData,data) {
    try {
        if (callData.direction == 'incoming') {
            var incoming = await add_incomingcall(callData, data)
        }
        if (callData.direction == 'outgoing') {
            var outgoing = await add_outgoingcall(callData, data)
        }
    } catch (err) {
        console.error(err);
    }
}
async function smart_group_monitoring(data) {
    try {
        var id = Number(data.id);
        var id_user = Number(data.id_user);
        var msg = 'smartGroupMonitoring'
        var socket = await adminSocket(id_user, msg, id);
        console.log("smartGroupMonitoring...............", id)
        return socket
    }
    catch (err) {
        console.log(err)
        return err
    }
}
async function smart_group_livecall(status, id_user, smartgroupId, userId, uniqueId) {
    try {
        var callMsg = 'livecallSmartgroup'
        var user = userId.split('&');
        if(user.length != 0){
            user.map(async (value) => {
                var callStatusObj1 = { count: +1, status: status, smartgroupId: smartgroupId, userId: value, uniqueId: uniqueId }
                console.log("livecallSmartgroup in smart_group_livecall function ------->", callMsg)
                console.log("livecallSmartgroup obj in smart_group_livecall function ------->", callStatusObj1)
                var socket5 = await smartgroupSocket(smartgroupId, callMsg, callStatusObj1);
                console.log("callStatusObj smart_group_livecall function ------->", callStatusObj1)
                var socket6 = await adminSocket(id_user, callMsg, callStatusObj1);
            })
        }
        return callMsg
    }
    catch (err) {
        console.log(err)
        return err
    }
}
async function smart_group_user_availble_status(id_user, smartgroupId, userId, uniqueId) {
    try {
        var callMsg = 'smartgroupAgentStatus'
        var user = userId.split('&');
        if(user.length != 0){
            user.map(async (value) => {
                var smartgroupAgentObj = { smartgroupId: smartgroupId, userId: value, uniqueId: uniqueId }
                console.log("smartgroupAgentStatus in smart_group_user_availble_status function ------->", callMsg)
                console.log("smartgroupAgentStatus obj in smart_group_user_availble_status function ------->", smartgroupAgentObj)
                var socket1 = await smartgroupSocket(smartgroupId, callMsg, smartgroupAgentObj);
                var socket2 = await adminSocket(id_user, callMsg, smartgroupAgentObj);
            })
        }
        return callMsg
    }
    catch (err) {
        console.log(err)
        return err
    }
}
async function update_smartgroup(data, id) {
    try {
        console.log("smartgroooup update  with data", data)
        console.log("smartgroooup update  id", id)
        var result = await smartGroupModel.update(data, { where: { id: id } });
        return result
    } catch (err) {
        console.error(err);
    }
}
async function insert_smartgroup_report(data) {
    try {
        var result = await smartGroupReport.insertMany(data);
        return result
    } catch (err) {
        console.error(err);
    }
}
async function insert_callflow_report(data) {
    try {
        var result = await callReportModel.insertMany(data);
        return result
    } catch (err) {
        console.error(err);
    }
}
async function check_exsist_module_id(arr, obj) {
    try {

        if (obj.module == 'smartGroup') {
            var exists = arr.find(item => item.eventTime === obj.eventTime && item.userId === obj.userId && item.eventStatus === obj.eventStatus && item.uniqueId === obj.uniqueId && item.moduleId === obj.moduleId);
            console.log("exists ---------------->", exists)
            if (exists) {
                return false
            } else {
                return true
            }
        } else if (obj.module == 'user') {
            var exists = arr.find(item => item.callFlowId === obj.callFlowId && item.uniqueId === obj.uniqueId && item.userId === obj.userId);
            console.log("given obj check", obj)
            if (exists) {
                console.log(' exists checking inside ....', false)
                return false
            } else {
                console.log(' exists checking inside ....', true)
                return true
            }
        } else {
            var exists = arr.find(item => item.eventTime === obj.eventTime && item.moduleId === obj.moduleId && item.uniqueId === obj.uniqueId && item.eventStatus === obj.eventStatus);
            console.log("given obj check", obj)
            if (exists) {
                return false
            } else {
                return true
            }
        }

    } catch (err) {
        console.error(err);
    }
}
function data_based_on_first_user_id(originalData) {
    try {
        console.log("originalData:", originalData);

        if (originalData.length !== 0) {
            // Create a shallow copy and remove the first item
            const data = [...originalData].slice(1);

            console.log("-databased-");
            console.log(data);

            const userIdData = data.filter(item => item.userId !== undefined);
            console.log("userIdData ----->", userIdData);

            if (userIdData.length !== 0) {
                const firstTriedUser = userIdData[0].userId;
                const lastTriedUser = userIdData[userIdData.length - 1].userId;

                const result = [...data]; // Copy again to be safe
                if (result.length > 0) {
                    result[0] = {
                        ...result[0],
                        firstTriedUser,
                        lastTriedUser,
                    };
                }

                console.log("result ----->", result);
                return { result };
            }
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}


function get_smartgroup_datas(data) {
    try {
        var first_data = data[0]
        var { app, appId, ...restFirstData } = first_data;
        first_data = restFirstData;
        var result = data.filter(item => item.module == "smartGroup");
        result.unshift(first_data);
        var moduleId = [...new Set(result.map(item => item.moduleId).filter(id => id !== undefined))];
        result.map(item => item.moduleId = moduleId[0])
        console.log("get_smartgroup_datas- ---->", result);
        var smartGroupIds = [...new Set(result.map(item => item.smartGroupId).filter(id => id !== undefined))];
        if (result.length != 0) {
            result[0].app = "smartGroup"
            result[0].appId = smartGroupIds[0]
        }
        return { result };
    } catch (err) {
        console.log(err);
        return err;
    }
}
function get_dtmf_sequence(data) {
    const dtmfValues = data
        .filter(
            (item) => item.eventStatus === 'dtmf' && item.dtmf !== undefined
        )
        .map((item) => item.dtmf);
    if (dtmfValues) {
        return dtmfValues.join(",");
    }
    return ""
}
const retryTransaction = async (callback, retries = 3) => {
    while (retries > 0) {
        try {
            return await sequelize.transaction(callback);
        } catch (error) {
            if (error.name === 'SequelizeDatabaseError' && retries > 1) {
                retries -= 1;
                console.log('Retrying transaction...', retries);
            } else {
                throw error;
            }
        }
    }
};
async function get_userId_by_call_flow_module_id(call_flow_module_id) {
    var sql = `select user_id FROM call_flow_user WHERE call_flow_module_id = '${call_flow_module_id}'`;
    var [user_id] = await getConnection.query(sql);
    console.log("user_id ----->", user_id)
    if (user_id.length != 0)
        return user_id[0].user_id;
    else
        return 0
}
async function get_live_data(id_user, id_department) {
    try {
        const redis = config.redis;
        var liveData = [];
        id_department = id_department != undefined ? id_department : 0

        const keys = await new Promise((resolve, reject) => {
            redis.keys('*', (err, keys) => {
                if (err) return reject(err);
                resolve(keys);
            });
        });

        const results = []; // Array to store matching objects

        for (const key of keys) {
            const value = await new Promise((resolve, reject) => {
                redis.get(key, (err, value) => {
                    if (err) return reject(err);
                    resolve(value);
                });
            });

            if (value) {
                try {
                    const jsonData = JSON.parse(value);
                    if (jsonData.length !== 0) {
                        for (const data of jsonData) {
                            if (data.eventTime != undefined) {
                                var eventDate = new Date(data.eventTime).toISOString().split('T')[0];
                                var currentDate = new Date().toISOString().split('T')[0];
                                if (
                                    data.event == 'start' &&
                                    data.customerId == id_user &&
                                    eventDate === currentDate &&
                                    data.apiManagement != 1 &&
                                    data.isDeleted != 1
                                ) {
                                    // if (id_department == 0) {
                                    //     data.status = 1
                                    //     if (data.answeredTime != undefined) {
                                    //         data.status = 2
                                    //     }
                                    //     if (data.app == 'user') data.userId = data.appId
                                    //     results.push(data);
                                    // } else {
                                    //     if (data.deptId == id_department) {
                                    //         data.status = 1
                                    //         if (data.answeredTime != undefined) {
                                    //             data.status = 2
                                    //         }
                                    //         if (data.app == 'user') data.userId = data.appId
                                    //         results.push(data);
                                    //     }
                                    // }
                                    if (id_department == 0) {
                                        data.status = 1
                                        if (data.answeredTime != undefined) {
                                            data.status = 2
                                        }
                                        if (data.app == 'user') data.userId = data.appId
                                        results.push(data);
                                    } else {
                                        if (id_department.includes(Number(data.deptId))) { 
                                        data.status = 1
                                        if (data.answeredTime != undefined) {
                                            data.status = 2
                                        }
                                        if (data.app == 'user') data.userId = data.appId
                                        results.push(data);
                                    }
                                    }
                                    // Add matching object to the array
                                }
                            }

                        }
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            }
        }
        return results; // Return the array of matches


    } catch (err) {
        console.log(err);
        return err;
    }
}
async function livecall_dtmf(data) {
    var dtmfObj = {
        uniqueId: data.call_unique_id,
        dtmfSeq: data.dtmfSeq
    }
    var msg1 = 'dtmfLiveCallReport'
    var socket1 = await adminSocket(data.customerId, msg1, dtmfObj);
    // var socket2 = await smartgroupSocket(data.appId, msg1, dtmfObj);
    return socket1
}

async function add_user_call_reports(data) {
    try {
        var result = await userCallReportModel.insertMany(data);
        return result
    } catch (err) {
        console.error(err);
    }
}
async function click_to_call(data, ip) {
    try {
        if (data.upin != undefined) {
            var upin = data.upin
        } else {
            var upin = data.pin
        }
        var result = await clicktocallModel.find({ uid: data.uid, upin: upin });
        if (result.length != 0) {
            if (result[0]._doc.clickToCall != undefined) {
                var whitelist_ip = result[0]._doc.clickToCall.whitelist_ip
                if (whitelist_ip != 1) {               //check ip (allow all ip or selected ip)
                    var whitelist_ipList = result[0]._doc.clickToCall.whitelist_ipList
                    if (whitelist_ipList.includes(ip)) {
                        var clickToCallData = await clickToCall(data, result)
                        return clickToCallData
                    } else {
                        var msg = { msg: "This IP is not allowed", status: false }
                        return msg
                    }
                } else {
                    var clickToCallData = await clickToCall(data, result)
                    return clickToCallData
                }
            }else{
                var msg = { msg: "No click To Call exists with this UID and UPIN number", status: false }
                return msg
            }
        } else {
            var msg = { msg: "No customer exists with this UID and UPIN number", status: false }
            return msg
        }
    } catch (err) {
        console.log(err);
        var msg = "err";
        return msg
    }
}
async function connect_with_call_flow(data) {
    try {
        var result = await clicktocallModel.find({ uid: data.uid, upin: data.upin });
        if (result.length != 0) {
            if (result[0]._doc.connectCallFlow != undefined) {
                var whitelist_ip = result[0]._doc.connectCallFlow.whitelist_ip
                if (whitelist_ip != 1) {
                    var whitelist_ipList = result[0]._doc.connectCallFlow.whitelist_ipList
                    if (whitelist_ipList.includes(ip)) {
                        var connectCallFlowData = await call_flow(data, result)
                        return connectCallFlowData
                    } else {
                        var msg = { msg: "This IP is not allowed", status: false }
                        return msg
                    }
                } else {
                    var connectCallFlowData = await call_flow(data, result)
                    return connectCallFlowData
                }
            } else {
                var msg = { msg: "No connect callflow exists with this UID and UPIN number", status: false }
                return msg
            }
        } else {
            var msg = { msg: "No customer exists with this UID and UPIN number", status: false }
            return msg
        }
    } catch (err) {
        console.log(err)
        var msg = "err";
        return msg
    }
}
async function connect_with_smartgroup(data) {
    try {
        var result = await clicktocallModel.find({ uid: data.uid, upin: data.upin });
        if (result.length != 0) {
            if (result[0]._doc.connectSmartgroup != undefined) {
                var whitelist_ip = result[0]._doc.connectSmartgroup.whitelist_ip
                if (whitelist_ip != 1) {
                    var whitelist_ipList = result[0]._doc.connectSmartgroup.whitelist_ipList
                    if (whitelist_ipList.includes(ip)) {
                        var smartGroupData = await smartGroup(data, result)
                        return smartGroupData
                    } else {
                        var msg = { msg: "This IP is not allowed", status: false }
                        return msg
                    }
                } else {
                    var smartGroupData = await smartGroup(data, result)
                    return smartGroupData
                }
            }else{
                var msg = { msg: "No connect smartgroup exists with this UID and UPIN number", status: false }
                return msg
            }
        } else {
            var msg = { msg: "No customer exists with this UID and UPIN number", status: false }
            return msg
        }
    } catch (err) {
        console.log(err)
        var msg = "err";
        return msg
    }
}
async function clickToCall(data, result) {
    try {
        if (result[0]._doc.clickToCall.is_active == true) {         //Checking whether Click-to-Call is active or inactive
            var id_user = result[0]._doc.id_user;
            var customerSql = `SELECT id,call_uid, call_pin,status,balance,credit_limit,zoho_status,lead_square_status FROM customers WHERE id = '${result[0]._doc.id_user}' `;
            var [customerRes] = await getConnection.query(customerSql);
            if (customerRes.length != 0) {
                if (customerRes[0].status == 1 || customerRes[0].status == 2) {
                    var replaceVariable = result[0]._doc.clickToCall.parameter_array;
                    var arrData = []             // Stored replaceVariables
                    const sourceObj = replaceVariable.find(item => item.name === 'Source');        //Find the renamed value of source
                    var sourceRenameValue = sourceObj ? sourceObj.renamedValue : undefined;
                    var sourceValue = data[sourceRenameValue];
                    console.log('Source Value:', sourceValue);
                    const destinationObj = replaceVariable.find(item => item.name === 'Destination');         //Find the renamed value of Destination
                    var destinationRenameValue = destinationObj ? destinationObj.renamedValue : undefined;
                    var destinationValue = data[destinationRenameValue];
                    if (destinationObj != undefined) {
                        destinationObj.value = destinationValue
                        arrData.push(destinationObj)
                    }
                    console.log('Destination Value:', destinationValue);
                    function cleanNumber(phone) {
                        if (phone.startsWith("91+")) {
                            return phone.slice(3); // Remove first 3 characters
                        }else if(phone.startsWith("91 ")){
                            return phone.slice(3);
                        }
                        return phone;
                    }
                    if(destinationValue != undefined){
                        destinationValue = cleanNumber(destinationValue);
                    }
                    console.log('Destination Value:', destinationValue);
                    const userextObj = replaceVariable.find(item => item.name === 'User Ext No');        //Find the renamed value of User Ext No
                    var userRenameValue = userextObj ? userextObj.renamedValue : undefined;
                    const userextValue = data[userRenameValue];
                    if (userextObj != undefined) {
                        userextObj.value = userextValue
                        arrData.push(userextObj)
                    }
                    console.log('User Ext No:', userextValue);
                    const uidObj = replaceVariable.find(item => item.name === 'UID Number');       //Find the renamed value of UID Number
                    if (uidObj != undefined)
                        arrData.push(uidObj)
                    var uidRenameValue = uidObj ? uidObj.renamedValue : undefined;
                    const uidValue = data[uidRenameValue];
                    console.log('UID Number:', uidValue);
                    const upinObj = replaceVariable.find(item => item.name === 'PIN Number');          //Find the renamed value of PIN Number
                    if (upinObj != undefined)
                        arrData.push(upinObj)
                    var upinRenameValue = upinObj ? upinObj.renamedValue : undefined;
                    const upinValue = data[upinRenameValue];
                    console.log('PIN Number:', upinValue);
                    var extraParamArr = []
                    if (replaceVariable.length != 0) {
                        replaceVariable.map((variable, index) => {
                            if (variable.name != 'PIN Number' && variable.name != 'UID Number' && variable.name != 'User Ext No' && variable.name != 'Destination' && variable.name != 'Source') {
                                var value = data[variable.renamedValue];
                                if (value != undefined) {
                                    variable.value = value
                                    arrData.push(variable)
                                    extraParamArr.push(variable)
                                }
                            }
                        });
                    }
                    console.log("id_dept ---------------->",data.id_dept)
                    if(data.id_dept != undefined){
                        var didSql = `SELECT did,did_type,cf_status,cf_type,cf_number,user.id as user_id,user.id_department,user_settings.regNumber FROM user_settings LEFT JOIN user ON user.id = user_settings.user_id WHERE extNumber = '${userextValue}' and id_user = '${id_user}' and id_department = '${data.id_dept}' `;
                        var [didRes] = await getConnection.query(didSql);
                    }else{
                        var didSql = `SELECT did,did_type,cf_status,cf_type,cf_number,user.id as user_id,user.id_department,user_settings.regNumber FROM user_settings LEFT JOIN user ON user.id = user_settings.user_id WHERE extNumber = '${userextValue}' and id_user = '${id_user}' `;
                        var [didRes] = await getConnection.query(didSql);
                    }
                    console.log("didSql ----------------->",didSql)
                    if (didRes.length != 0) {
                        var user_id = didRes[0].user_id;
                        var id_department = didRes[0].id_department;
                        var regNumber = didRes[0].regNumber;
                        var didNumber = didRes[0].did;
                        if (didRes[0].did_type == 1) {     // check did type did group or single did. did_type == 1 single did , did_type == 2 did group
                            didNumber = didRes[0].did;
                        } else if (didRes[0].did_type == 2) {
                            var didGroupSql = `SELECT * FROM did_group_setting WHERE grouping_id = '${didRes[0].did}'`;
                            var [didGroupRes] = await getConnection.query(didGroupSql);
                            if (didGroupRes.length != 0) {
                                var didId = didGroupRes[0].did_id;
                                var didNoSql = `SELECT id,did FROM did WHERE id = '${didId}'`;
                                var [didNoRes] = await getConnection.query(didNoSql);
                                if (didNoRes.length != 0) {
                                    didNumber = didNoRes[0].did;
                                }
                            }
                        }
                        if (didNumber != sourceValue) {
                            if (sourceValue == undefined) {
                                if (didRes[0].cf_status == 1) {           //Check the call forwarding status.
                                    var sourceNumber = didRes[0].cf_number;
                                    var sourceType = 1;
                                } else {
                                    var sourceType = 0;
                                    var sourceNumber = didRes[0].did;
                                }
                            } else {
                                var sourceType = 1;
                                var sourceNumber = sourceValue
                            }
                            function isValidPhoneNumber(phoneNumber) {          //Checking whether the phone number is valid or invalid 
                                const regex = /^\d{10,16}$/;
                                return regex.test(phoneNumber);
                            }
                            if (isValidPhoneNumber(sourceNumber)) {
                                if (isValidPhoneNumber(destinationValue)) {
                                    var checkDidSql = `SELECT id,outgoing_call_ratecard_id,status,pricing_plan as plan_type,outgoing_provider,callrecord,outgoing_blacklist_id,channels FROM did WHERE did = '${didNumber}' and id_user = '${id_user}'`;
                                    var [checkDidRes] = await getConnection.query(checkDidSql);
                                    if (checkDidRes.length != 0) {
                                        var blacklistSql = `SELECT * FROM cc_blacklist_contacts WHERE phone_no = '${destinationValue}' and blacklist_id = '${checkDidRes[0].outgoing_blacklist_id}'`;
                                        var [blacklistRes] = await getConnection.query(blacklistSql);
                                        if (blacklistRes.length == 0) {
                                            if (checkDidRes[0].status == 1) {          // Checking DID status
                                                if (checkDidRes[0].plan_type == 0) {           // Checking plan type: 0 for unlimited, or pay-per-use
                                                    var RateSql = `SELECT prefix,sellrate,pulse FROM rates WHERE id_ratecard = ${checkDidRes[0].outgoing_call_ratecard_id}`;
                                                    var [rateRes] = await getConnection.query(RateSql);
                                                    if (rateRes.length != 0) {
                                                        console.log("rateRes --->", rateRes)
                                                        console.log("credit_limit---->", customerRes[0].credit_limit)
                                                        if (Number(customerRes[0].credit_limit) >= 0) {
                                                            var credit_limit = Number(customerRes[0].credit_limit)
                                                        } else {
                                                            var credit_limit = 0
                                                        }
                                                        console.log("credit_limit---->", customerRes[0].credit_limit)
                                                        console.log("balance---->", customerRes[0].balance)
                                                        var balance = Number(customerRes[0].balance) + credit_limit
                                                        console.log("balance---->", balance)
                                                        var creditValueData = await get_prefix(destinationValue, rateRes)       //Find the prefix and its sell rate 
                                                        if (creditValueData) {          // Prefix matching check
                                                            if (creditValueData.prefix == '91') {       //Unlimited plans are only applicable for the 91 prefix
                                                                if (sourceType == 1) {
                                                                    var Source_creditValueData = await get_prefix(sourceNumber, rateRes)   //Find the prefix and its sell rate 
                                                                    if (Source_creditValueData) {          // Prefix matching check
                                                                        if (Source_creditValueData.prefix == '91') {    //Unlimited plans are only applicable for the 91 prefix
                                                                            const uniqueId = generateUniqueId();  // Generate a unique ID 
                                                                            console.log(uniqueId);
                                                                            if (didRes[0].cf_status == 0 && sourceValue == undefined) {       //Check if the source number is undefined or call forwarding is not enabled
                                                                                var obj = {
                                                                                    did: didNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: 3600, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                }
                                                                                var new_obj = {
                                                                                    did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: 3600, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                                }
                                                                            } else {
                                                                                var obj = {
                                                                                    did: didNumber, [sourceRenameValue]: sourceNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: 3600, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                }
                                                                                var new_obj = {
                                                                                    did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: 3600, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                                }
                                                                            }
                                                                            var extraParamObj = {}
                                                                            if (extraParamArr.length != 0) {
                                                                                extraParamArr.map(item => {
                                                                                    if (item.api_status == 1) {
                                                                                        extraParamObj[item.renamedValue] = item.value
                                                                                    }
                                                                                });
                                                                                obj.apiParams = extraParamObj;
                                                                            }
                                                                            var returnObj = { obj, new_obj }       // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                            console.log("result obj ------->", returnObj)
                                                                            if (sourceObj != undefined) {
                                                                                sourceObj.value = sourceNumber
                                                                                arrData.push(sourceObj)
                                                                            }
                                                                            var responseData = await response(result[0]._doc.clickToCall.response, arrData)   //Function for formatted response
                                                                            returnObj.response = responseData
                                                                            return returnObj     // Returning obj, new_obj, and response
                                                                        } else {
                                                                            var source_onemin = 60 / Number(Source_creditValueData.pulse)
                                                                            console.log("pulse---->", Source_creditValueData.pulse)
                                                                            console.log("source_onemin---->", source_onemin)
                                                                            var source_oneminCost = source_onemin * Number(Source_creditValueData.sellrate)
                                                                            console.log("source_oneminCost---->", source_oneminCost)
                                                                            var source_min = balance / source_oneminCost
                                                                            console.log("source_min---------->", source_min)
                                                                            var source_seconds = source_min * 60;
                                                                            console.log("source_seconds---------->", source_seconds)
                                                                            if (balance >= source_oneminCost) {       // Balance checking
                                                                                const uniqueId = generateUniqueId();  // Generate a unique ID 
                                                                                console.log(uniqueId);
                                                                                if (didRes[0].cf_status == 0 && sourceValue == undefined) {
                                                                                    var obj = {
                                                                                        did: didNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                    }
                                                                                    var new_obj = {
                                                                                        did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                                    }
                                                                                } else {
                                                                                    var obj = {
                                                                                        did: didNumber, [sourceRenameValue]: sourceNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                    }
                                                                                    var new_obj = {
                                                                                        did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                                    }
                                                                                }
                                                                                var extraParamObj = {}
                                                                                if (extraParamArr.length != 0) {
                                                                                    extraParamArr.map(item => {
                                                                                        if (item.api_status == 1) {
                                                                                            extraParamObj[item.renamedValue] = item.value
                                                                                        }
                                                                                    });
                                                                                    obj.apiParams = extraParamObj;
                                                                                }
                                                                                var returnObj = { obj, new_obj }       // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                                console.log("result obj ------->", returnObj)
                                                                                if (sourceObj != undefined) {
                                                                                    sourceObj.value = sourceNumber
                                                                                    arrData.push(sourceObj)
                                                                                }
                                                                                var responseData = await response(result[0]._doc.clickToCall.response, arrData)
                                                                                returnObj.response = responseData
                                                                                return returnObj      // Returning obj, new_obj, and response
                                                                            } else {
                                                                                var msg = { msg: "Not enough proper balance", status: false }
                                                                                return msg
                                                                            }
                                                                        }
                                                                    } else {
                                                                        var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                                        return msg
                                                                    }
                                                                } else {
                                                                    var source_seconds = 0
                                                                    var source_min = 0
                                                                    const uniqueId = generateUniqueId();   // Generate a unique ID 
                                                                    console.log(uniqueId);
                                                                    if (didRes[0].cf_status == 0 && sourceValue == undefined) {
                                                                        var obj = {
                                                                            did: didNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                        }
                                                                        var new_obj = {
                                                                            did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                        }
                                                                    } else {
                                                                        var obj = {
                                                                            did: didNumber, [sourceRenameValue]: sourceNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                        }
                                                                        var new_obj = {
                                                                            did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                        }
                                                                    }
                                                                    var extraParamObj = {}
                                                                    if (extraParamArr.length != 0) {
                                                                        extraParamArr.map(item => {
                                                                            if (item.api_status == 1) {
                                                                                extraParamObj[item.renamedValue] = item.value
                                                                            }
                                                                        });
                                                                        obj.apiParams = extraParamObj;
                                                                    }
                                                                    var returnObj = { obj, new_obj }        // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                    console.log("result obj ------->", returnObj)
                                                                    if (sourceObj != undefined) {
                                                                        sourceObj.value = sourceNumber
                                                                        arrData.push(sourceObj)
                                                                    }
                                                                    var responseData = await response(result[0]._doc.clickToCall.response, arrData)
                                                                    returnObj.response = responseData
                                                                    return returnObj    // Returning obj, new_obj, and response
                                                                }
                                                            } else {
                                                                var destination_onemin = 60 / Number(pulse)
                                                                console.log("pulse---->", creditValueData.pulse)
                                                                console.log("destination_onemin---->", destination_onemin)
                                                                var destination_oneminCost = destination_onemin * Number(creditValueData.sellrate)
                                                                console.log("destination_oneminCost---->", destination_oneminCost)
                                                                var destination_min = balance / destination_oneminCost
                                                                console.log("destination_min---------->", destination_min)
                                                                var destination_seconds = destination_min * 60;
                                                                console.log("destination_seconds---------->", destination_seconds)
                                                                if (balance >= destination_onemin) {
                                                                    console.log("sourceNumber --->", sourceNumber)
                                                                    if (sourceType == 1) {
                                                                        var Source_creditValueData = await get_prefix(sourceNumber, rateRes)        //Find the prefix and its sell rate 
                                                                        if (Source_creditValueData) {
                                                                            if (Source_creditValueData.prefix == '91') {         //Unlimited plans are only applicable for the 91 prefix
                                                                                const uniqueId = generateUniqueId();      // Generate a unique ID 
                                                                                console.log(uniqueId);
                                                                                if (didRes[0].cf_status == 0 && sourceValue == undefined) {
                                                                                    var obj = {
                                                                                        did: didNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: 3600, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                    }
                                                                                    var new_obj = {
                                                                                        did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: 3600, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                                    }
                                                                                } else {
                                                                                    var obj = {
                                                                                        did: didNumber, [sourceRenameValue]: sourceNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: 3600, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                    }
                                                                                    var new_obj = {
                                                                                        did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: 3600, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                                    }
                                                                                }
                                                                                var extraParamObj = {}
                                                                                if (extraParamArr.length != 0) {
                                                                                    extraParamArr.map(item => {
                                                                                        if (item.api_status == 1) {
                                                                                            extraParamObj[item.renamedValue] = item.value
                                                                                        }
                                                                                    });
                                                                                    obj.apiParams = extraParamObj;
                                                                                }
                                                                                var returnObj = { obj, new_obj }       // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                                console.log("result obj ------->", returnObj)
                                                                                if (sourceObj != undefined) {
                                                                                    sourceObj.value = sourceNumber
                                                                                    arrData.push(sourceObj)
                                                                                } var responseData = await response(result[0]._doc.clickToCall.response, arrData)
                                                                                var responseData = await response(result[0]._doc.clickToCall.response, arrData)
                                                                                returnObj.response = responseData
                                                                                return returnObj       // Returning obj, new_obj, and response
                                                                            } else {
                                                                                var source_onemin = 60 / Number(Source_creditValueData.pulse)
                                                                                console.log("pulse---->", Source_creditValueData.pulse)
                                                                                console.log("source_onemin---->", source_onemin)
                                                                                var source_oneminCost = source_onemin * Number(Source_creditValueData.sellrate)
                                                                                console.log("source_oneminCost---->", source_oneminCost)
                                                                                var source_min = balance / source_oneminCost
                                                                                console.log("source_min---------->", source_min)
                                                                                var source_seconds = source_min * 60;
                                                                                console.log("source_seconds---------->", source_seconds)
                                                                                if (balance >= source_oneminCost) {
                                                                                    const uniqueId = generateUniqueId();       // Generate a unique ID 
                                                                                    console.log(uniqueId);
                                                                                    if (didRes[0].cf_status == 0 && sourceValue == undefined) {
                                                                                        var obj = {
                                                                                            did: didNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                        }
                                                                                        var new_obj = {
                                                                                            did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, ser_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                                        }
                                                                                    } else {
                                                                                        var obj = {
                                                                                            did: didNumber, [sourceRenameValue]: sourceNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, ourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                        }
                                                                                        var new_obj = {
                                                                                            did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                                        }
                                                                                    }
                                                                                    var extraParamObj = {}
                                                                                    if (extraParamArr.length != 0) {
                                                                                        extraParamArr.map(item => {
                                                                                            if (item.api_status == 1) {
                                                                                                extraParamObj[item.renamedValue] = item.value
                                                                                            }
                                                                                        });
                                                                                        obj.apiParams = extraParamObj;
                                                                                    }
                                                                                    var returnObj = { obj, new_obj }       // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                                    console.log("result obj ------->", returnObj)
                                                                                    if (sourceObj != undefined) {
                                                                                        sourceObj.value = sourceNumber
                                                                                        arrData.push(sourceObj)
                                                                                    }
                                                                                    var responseData = await response(result[0]._doc.clickToCall.response, arrData)
                                                                                    returnObj.response = responseData
                                                                                    return returnObj         // Returning obj, new_obj, and response
                                                                                } else {
                                                                                    var msg = { msg: "Not enough proper balance", status: false }
                                                                                    return msg
                                                                                }
                                                                            }
                                                                        } else {
                                                                            var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                                            return msg
                                                                        }
                                                                    } else {
                                                                        var source_seconds = 0
                                                                        var source_min = 0
                                                                        const uniqueId = generateUniqueId();   // Generate a unique ID 
                                                                        console.log(uniqueId);
                                                                        if (didRes[0].cf_status == 0 && sourceValue == undefined) {
                                                                            var obj = {
                                                                                did: didNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                            }
                                                                            var new_obj = {
                                                                                did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, hannel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                            }
                                                                        } else {
                                                                            var obj = {
                                                                                did: didNumber, [sourceRenameValue]: sourceNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, ser_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                            }
                                                                            var new_obj = {
                                                                                did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                            }
                                                                        }
                                                                        var extraParamObj = {}
                                                                        if (extraParamArr.length != 0) {
                                                                            extraParamArr.map(item => {
                                                                                if (item.api_status == 1) {
                                                                                    extraParamObj[item.renamedValue] = item.value
                                                                                }
                                                                            });
                                                                            obj.apiParams = extraParamObj;
                                                                        }
                                                                        var returnObj = { obj, new_obj }            // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                        console.log("result obj ------->", returnObj)
                                                                        if (sourceObj != undefined) {
                                                                            sourceObj.value = sourceNumber
                                                                            arrData.push(sourceObj)
                                                                        }
                                                                        var responseData = await response(result[0]._doc.clickToCall.response, arrData)
                                                                        returnObj.response = responseData
                                                                        return returnObj        // Returning obj, new_obj, and response
                                                                    }
                                                                } else {
                                                                    var msg = { msg: "Not enough proper balance", status: false }
                                                                    return msg
                                                                }
                                                            }
                                                        } else {
                                                            var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                            return msg
                                                        }
                                                    } else {
                                                        var msg = { msg: "There is no rate card selected", status: false }
                                                        return msg
                                                    }
                                                } else {
                                                    if (customerRes[0].balance > 0) {
                                                        var RateSql = `SELECT prefix,sellrate,pulse FROM rates WHERE id_ratecard = ${checkDidRes[0].outgoing_call_ratecard_id}`;
                                                        var [rateRes] = await getConnection.query(RateSql);
                                                        if (rateRes.length != 0) {
                                                            console.log("rateRes --->", rateRes)
                                                            var creditValueData = await get_prefix(destinationValue, rateRes)  //Find the prefix and its sell rate 
                                                            if (creditValueData) {
                                                                console.log("credit_limit---->", customerRes[0].credit_limit)
                                                                if (Number(customerRes[0].credit_limit) >= 0) {
                                                                    var credit_limit = Number(customerRes[0].credit_limit)
                                                                } else {
                                                                    var credit_limit = 0
                                                                }
                                                                console.log("credit_limit---->", customerRes[0].credit_limit)
                                                                console.log("balance---->", customerRes[0].balance)
                                                                var balance = Number(customerRes[0].balance) + credit_limit
                                                                console.log("balance---->", balance)
                                                                var destination_onemin = 60 / Number(creditValueData.pulse)
                                                                console.log("pulse---->", creditValueData.pulse)
                                                                console.log("destination_onemin---->", destination_onemin)
                                                                var destination_oneminCost = destination_onemin * Number(creditValueData.sellrate)
                                                                console.log("destination_oneminCost---->", destination_oneminCost)
                                                                var destination_min = balance / destination_oneminCost
                                                                console.log("min---------->", destination_min)
                                                                var destination_seconds = destination_min * 60;
                                                                console.log("destination_seconds---------->", destination_seconds)
                                                                if (balance >= destination_oneminCost) {
                                                                    console.log("sourceNumber --->", sourceNumber)
                                                                    if (sourceType == 1) {
                                                                        var Source_creditValueData = await get_prefix(sourceNumber, rateRes)   //Find the prefix and its sell rate 
                                                                        if (Source_creditValueData) {
                                                                            var source_onemin = 60 / Number(Source_creditValueData.pulse)
                                                                            console.log("pulse---->", Source_creditValueData.pulse)
                                                                            console.log("source_onemin---->", source_onemin)
                                                                            var source_oneminCost = source_onemin * Number(Source_creditValueData.sellrate)
                                                                            console.log("source_oneminCost---->", source_oneminCost)
                                                                            var source_min = balance / source_oneminCost
                                                                            console.log("source_min---------->", source_min)
                                                                            var source_seconds = source_min * 60;
                                                                            console.log("source_seconds---------->", source_seconds)
                                                                            if (balance >= source_oneminCost) {
                                                                                const uniqueId = generateUniqueId();   // Generate a unique ID 
                                                                                console.log(uniqueId);
                                                                                if (didRes[0].cf_status == 0 && sourceValue == undefined) {
                                                                                    var obj = {
                                                                                        did: didNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                    }
                                                                                    var new_obj = {
                                                                                        did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, niqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                                    }
                                                                                } else {
                                                                                    var obj = {
                                                                                        did: didNumber, [sourceRenameValue]: sourceNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                    }
                                                                                    var new_obj = {
                                                                                        did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, allrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                                    }
                                                                                }
                                                                                var extraParamObj = {}
                                                                                if (extraParamArr.length != 0) {
                                                                                    extraParamArr.map(item => {
                                                                                        if (item.api_status == 1) {
                                                                                            extraParamObj[item.renamedValue] = item.value
                                                                                        }
                                                                                    });
                                                                                    obj.apiParams = extraParamObj;
                                                                                }
                                                                                var returnObj = { obj, new_obj }    // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                                console.log("result obj ------->", returnObj)
                                                                                if (sourceObj != undefined) {
                                                                                    sourceObj.value = sourceNumber
                                                                                    arrData.push(sourceObj)
                                                                                }
                                                                                var responseData = await response(result[0]._doc.clickToCall.response, arrData)
                                                                                returnObj.response = responseData
                                                                                return returnObj      // Returning obj, new_obj, and response
                                                                            } else {
                                                                                var msg = { msg: "Not enough proper balance", status: false }
                                                                                return msg
                                                                            }
                                                                        } else {
                                                                            var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                                            return msg
                                                                        }
                                                                    } else {
                                                                        var source_seconds = 3600;
                                                                        var source_min = 0
                                                                        const uniqueId = generateUniqueId();  // Generate a unique ID 
                                                                        console.log(uniqueId);
                                                                        if (didRes[0].cf_status == 0 && sourceValue == undefined) {
                                                                            var obj = {
                                                                                did: didNumber, [destinationRenameValue]: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, estinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, ser_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels
                                                                            }
                                                                            var new_obj = {
                                                                                did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                            }
                                                                        } else {
                                                                            var obj = {
                                                                                did: didNumber, [sourceRenameValue]: sourceNumber, [destinationRenameValue]: destinationValue, urceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, ser_id: user_id, id_department: id_department, regNumber: regNumber, allrecord: checkDidRes[0].callrecord, hannel: checkDidRes[0].channels
                                                                            }
                                                                            var new_obj = {
                                                                                did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, ourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels,planType : checkDidRes[0].plan_type,sourceCallType:'clickToCallSource',destinationCallType:'clickToCallDestination'
                                                                            }
                                                                        }
                                                                        var extraParamObj = {}
                                                                        if (extraParamArr.length != 0) {
                                                                            extraParamArr.map(item => {
                                                                                if (item.api_status == 1) {
                                                                                    extraParamObj[item.renamedValue] = item.value
                                                                                }
                                                                            });
                                                                            obj.apiParams = extraParamObj;
                                                                        }
                                                                        var returnObj = { obj, new_obj }        // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                        console.log("result obj ------->", returnObj)
                                                                        if (sourceObj != undefined) {
                                                                            sourceObj.value = sourceNumber
                                                                            arrData.push(sourceObj)
                                                                        }
                                                                        var responseData = await response(result[0]._doc.clickToCall.response, arrData)
                                                                        returnObj.response = responseData
                                                                        return returnObj     // Returning obj, new_obj, and response
                                                                    }
                                                                } else {
                                                                    var msg = { msg: "Not enough proper balance", status: false }
                                                                    return msg
                                                                }
                                                            } else {
                                                                var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                                return msg
                                                            }
                                                        } else {
                                                            var msg = { msg: "There is no rate card selected", status: false }
                                                            return msg
                                                        }
                                                    } else {
                                                        var msg = { msg: "Not enough proper balance", status: false }
                                                        return msg
                                                    }
                                                }
                                            } else {
                                                var msg = { msg: "This DID number is not active", status: false }
                                                return msg
                                            }
                                        } else {
                                            var msg = { msg: "The destination number is in the blacklist and cannot be processed", status: false }
                                            return msg
                                        }
                                    } else {
                                        var msg = { msg: "This DID does not belong to this customer", status: false }
                                        return msg
                                    }
                                } else {
                                    var msg = { msg: "This destination number is not valid", status: false }
                                    return msg
                                }
                            } else {
                                var msg = { msg: "This source number is not valid", status: false }
                                return msg
                            }
                        } else {
                            var msg = { msg: "This source number is the same as the user's DID number", status: false }
                            return msg
                        }
                    } else {
                        var msg = { msg: "No user exists for this extension", status: false }
                        return msg
                    }
                } else {
                    var msg = { msg: "The customer is not active", status: false }
                    return msg
                }
            } else {
                var msg = { msg: "No customer exists with this UID and UPIN number", status: false }
                return msg
            }
        } else {
            var msg = { msg: "This click-to-call feature is not active", status: false }
            return msg
        }
    } catch (err) {
        console.error(err);
        return err
    }
}
async function call_flow(data, result) {
    try {
        if (result[0]._doc.connectCallFlow.is_active == true) {
            var id_user = result[0]._doc.id_user;
            var customerSql = `SELECT id,call_uid, call_pin,status,balance,credit_limit,zoho_status,lead_square_status FROM customers WHERE id = '${result[0]._doc.id_user}' `;
            var [customerRes] = await getConnection.query(customerSql);
            if (customerRes.length != 0) {
                if (customerRes[0].status == 1 || customerRes[0].status == 2) {
                    var replaceVariable = result[0]._doc.connectCallFlow.parameter_array;
                    var arrData = []
                    const sourceObj = replaceVariable.find(item => item.name === 'Did Number');          //Find the renamed value of Did Number
                    var sourceRenameValue = sourceObj ? sourceObj.renamedValue : undefined;
                    const sourceValue = data[sourceRenameValue];
                    var sourceNumber = sourceValue;
                    console.log('Did Number Value:', sourceValue);
                    console.log('Did Number Value:', sourceNumber);
                    if (sourceObj != undefined) {
                        sourceObj.value = sourceNumber
                        arrData.push(sourceObj)
                    }
                    const destinationObj = replaceVariable.find(item => item.name === 'Phone Number');           //Find the renamed value of Phone Number
                    var destinationRenameValue = destinationObj ? destinationObj.renamedValue : undefined;
                    const destinationValue = data[destinationRenameValue];
                    if (destinationObj != undefined) {
                        destinationObj.value = destinationValue
                        arrData.push(destinationObj)
                    }
                    console.log('Phone Number Value:', destinationValue);
                    const callflowObj = replaceVariable.find(item => item.name === 'Call Flow name');         //Find the renamed value of Call Flow name
                    const callflowRenameValue = callflowObj ? callflowObj.renamedValue : undefined;
                    const callflowValue = data[callflowRenameValue];
                    if (callflowObj != undefined) {
                        callflowObj.value = callflowValue
                        arrData.push(callflowObj)
                    }
                    console.log('Call Flow name Value:', callflowValue);
                    const uidObj = replaceVariable.find(item => item.name === 'UID Number');          //Find the renamed value of UID Number
                    if (uidObj != undefined)
                        arrData.push(uidObj)
                    var uidRenameValue = uidObj ? uidObj.renamedValue : undefined;
                    const uidValue = data[uidRenameValue];
                    console.log('UID Number:', uidValue);
                    const upinObj = replaceVariable.find(item => item.name === 'PIN Number');         //Find the renamed value of PIN Number
                    if (upinObj != undefined)
                        arrData.push(upinObj)
                    var upinRenameValue = upinObj ? upinObj.renamedValue : undefined;
                    const upinValue = data[upinRenameValue];
                    console.log('PIN Number:', upinValue);
                    var extraParamArr = []
                    if (replaceVariable.length != 0) {
                        replaceVariable.map((variable, index) => {
                            if (variable.name != 'PIN Number' && variable.name != 'UID Number' && variable.name != 'Call Flow name' && variable.name != 'Phone Number' && variable.name != 'Did Number') {
                                var value = data[variable.renamedValue];
                                if (value != undefined) {
                                    variable.value = value
                                    arrData.push(variable)
                                    extraParamArr.push(variable)
                                }
                            }
                        });
                    }
                    function isValidPhoneNumber(phoneNumber) {           //Checking whether the phone number is valid or invalid 
                        const regex = /^\d{10,16}$/;
                        return regex.test(phoneNumber);
                    }
                    if (isValidPhoneNumber(sourceNumber)) {
                        if (isValidPhoneNumber(destinationValue)) {
                            var checkDidSql = `SELECT id,outgoing_call_ratecard_id,status,pricing_plan as plan_type,outgoing_provider,callrecord,outgoing_blacklist_id FROM did WHERE did = '${sourceNumber}' and id_user = '${id_user}'`;
                            var [checkDidRes] = await getConnection.query(checkDidSql);
                            if (checkDidRes.length != 0) {
                                var blacklistSql = `SELECT * FROM cc_blacklist_contacts WHERE phone_no = '${checkDidRes[0].outgoing_blacklist_id}'`;
                                var [blacklistRes] = await getConnection.query(blacklistSql);
                                if (blacklistRes.length == 0) {
                                    if (checkDidRes[0].status == 1) {
                                        if (checkDidRes[0].plan_type == 0) {          //Checking plan type: 0 for unlimited, or pay-per-use
                                                var callflowSql = `SELECT name,id,id_department FROM call_flow WHERE name = '${callflowValue}' and id_user = '${id_user}'`;
                                                var [callflowRes] = await getConnection.query(callflowSql);
                                                if (callflowRes.length != 0) {
                                                    var RateSql = `SELECT prefix,sellrate,pulse FROM rates WHERE id_ratecard = ${checkDidRes[0].outgoing_call_ratecard_id}`;
                                                    var [rateRes] = await getConnection.query(RateSql);
                                                    if (rateRes.length != 0) {
                                                        console.log("rateRes --->", rateRes)
                                                        var creditValueData = await get_prefix(destinationValue, rateRes);     //Find the prefix and its sell rate
                                                        if (creditValueData) {
                                                            if (creditValueData.prefix == '91') {        //Unlimited plans are only applicable for the 91 prefix
                                                                console.log("sourceValue --->", sourceValue)
                                                                if (sourceValue != undefined) {
                                                                    var Source_creditValueData = await get_prefix(sourceNumber, rateRes);   //Find the prefix and its sell rate 
                                                                    if (Source_creditValueData) {
                                                                        if (Source_creditValueData.prefix == '91') {          //Unlimited plans are only applicable for the 91 prefix
                                                                            const uniqueId = generateUniqueId();     // Generate a unique ID 
                                                                            console.log(uniqueId);
                                                                            var obj = {
                                                                                did: sourceValue, didId: checkDidRes[0].id, [sourceRenameValue]: sourceValue, [destinationRenameValue]: destinationValue, sourceDuration: 3600, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, id_department: callflowRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                            }
                                                                            var new_obj = {
                                                                                did: sourceValue, didId: checkDidRes[0].id, source: sourceValue, destination: destinationValue, sourceDuration: 3600, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, id_department: callflowRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type
                                                                            }
                                                                            var extraParamObj = {}
                                                                            if (extraParamArr.length != 0) {
                                                                                extraParamArr.map(item => {
                                                                                    if (item.api_status == 1) {
                                                                                        extraParamObj[item.renamedValue] = item.value
                                                                                    }
                                                                                });
                                                                                obj.apiParams = extraParamObj;
                                                                            }
                                                                            var returnObj = { obj, new_obj }    // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                            console.log("result obj ------->", returnObj)
                                                                            var responseData = await response(result[0]._doc.connectCallFlow.response, arrData)
                                                                            returnObj.response = responseData
                                                                            return returnObj        // Returning obj, new_obj, and response
                                                                        } else {
                                                                            var source_onemin = 60 / Number(Source_creditValueData.pulse)
                                                                            console.log("source_pulse---->", Source_creditValueData.pulse)
                                                                            console.log("source_onemin---->", source_onemin)
                                                                            var source_oneminCost = source_onemin * Number(Source_creditValueData.sellrate)
                                                                            console.log("source_oneminCost---->", source_oneminCost)
                                                                            var source_min = balance / source_oneminCost
                                                                            console.log("source_min---------->", source_min)
                                                                            var source_seconds = source_min * 60;
                                                                            console.log("source_seconds---------->", source_seconds)
                                                                            if (balance >= source_oneminCost) {
                                                                                const uniqueId = generateUniqueId();     // Generate a unique ID 
                                                                                console.log(uniqueId);
                                                                                var obj = {
                                                                                    did: sourceValue, didId: checkDidRes[0].id, [sourceRenameValue]: sourceValue, [destinationRenameValue]: destinationValue, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, id_department: callflowRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                }
                                                                                var new_obj = {
                                                                                    did: sourceValue, didId: checkDidRes[0].id, source: sourceValue, destination: destinationValue, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, id_department: callflowRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type
                                                                                }
                                                                                var extraParamObj = {}
                                                                                if (extraParamArr.length != 0) {
                                                                                    extraParamArr.map(item => {
                                                                                        if (item.api_status == 1) {
                                                                                            extraParamObj[item.renamedValue] = item.value
                                                                                        }
                                                                                    });
                                                                                    obj.apiParams = extraParamObj;
                                                                                }
                                                                                var returnObj = { obj, new_obj }  // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                                console.log("result obj ------->", returnObj)
                                                                                var responseData = await response(result[0]._doc.connectCallFlow.response, arrData)
                                                                                returnObj.response = responseData
                                                                                return returnObj      // Returning obj, new_obj, and response
                                                                            } else {
                                                                                var msg = { msg: "Not enough proper balance", status: false }
                                                                                return msg
                                                                            }
                                                                        }
                                                                    } else {
                                                                        var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                                        return msg
                                                                    }
                                                                } else {
                                                                    var source_seconds = 0
                                                                    var source_min = 0
                                                                    const uniqueId = generateUniqueId();      // Generate a unique ID 
                                                                    console.log(uniqueId);
                                                                    var obj = {
                                                                        did: sourceValue, didId: checkDidRes[0].id, [sourceRenameValue]: sourceValue, [destinationRenameValue]: destinationValue, sourceType: 1, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                    }
                                                                    var new_obj = {
                                                                        did: sourceValue, didId: checkDidRes[0].id, source: sourceValue, destination: destinationValue, sourceType: 1, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, id_department: callflowRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type
                                                                    }
                                                                    var extraParamObj = {}
                                                                    if (extraParamArr.length != 0) {
                                                                        extraParamArr.map(item => {
                                                                            if (item.api_status == 1) {
                                                                                extraParamObj[item.renamedValue] = item.value
                                                                            }
                                                                        });
                                                                        obj.apiParams = extraParamObj;
                                                                    }
                                                                    var returnObj = { obj, new_obj }      // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                    console.log("result obj ------->", returnObj)
                                                                    var responseData = await response(result[0]._doc.connectCallFlow.response, arrData)
                                                                    returnObj.response = responseData
                                                                    return returnObj      // Returning obj, new_obj, and response
                                                                }
                                                            } else {
                                                                console.log("credit_limit---->", customerRes[0].credit_limit)
                                                                if (Number(customerRes[0].credit_limit) >= 0) {
                                                                    var credit_limit = Number(customerRes[0].credit_limit)
                                                                } else {
                                                                    var credit_limit = 0
                                                                }
                                                                console.log("credit_limit---->", customerRes[0].credit_limit)
                                                                console.log("balance---->", customerRes[0].balance)
                                                                var balance = Number(customerRes[0].balance) + credit_limit
                                                                console.log("balance---->", balance)
                                                                var destination_onemin = 60 / Number(creditValueData.pulse)
                                                                console.log("pulse---->", creditValueData.pulse)
                                                                console.log("destination_onemin---->", destination_onemin)
                                                                var destination_oneminCost = destination_onemin * Number(creditValueData.sellrate)
                                                                console.log("destination_oneminCost---->", destination_oneminCost)
                                                                var destination_min = balance / destination_oneminCost
                                                                console.log("destination_min---------->", destination_min)
                                                                var destination_seconds = destination_min * 60;
                                                                console.log("destination_seconds---------->", destination_seconds)
                                                                if (balance >= destination_oneminCost) {
                                                                    console.log("sourceValue --->", sourceValue)
                                                                    if (sourceValue != undefined) {
                                                                        var Source_creditValueData = await get_prefix(sourceNumber, rateRes);   //Find the prefix and its sell rate 
                                                                        if (Source_creditValueData) {
                                                                            if (Source_creditValueData.prefix == '91') {           //Unlimited plans are only applicable for the 91 prefix
                                                                                const uniqueId = generateUniqueId();          // Generate a unique ID 
                                                                                console.log(uniqueId);
                                                                                var obj = {
                                                                                    did: sourceValue, didId: checkDidRes[0].id, [destinationRenameValue]: destinationValue, [sourceRenameValue]: sourceValue, destinationDuration: destination_seconds, sourceDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, id_department: callflowRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                }
                                                                                var new_obj = {
                                                                                    did: sourceValue, didId: checkDidRes[0].id, destination: destinationValue, source: sourceValue, destinationDuration: destination_seconds, sourceDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, id_department: callflowRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type
                                                                                }
                                                                                var extraParamObj = {}
                                                                                if (extraParamArr.length != 0) {
                                                                                    extraParamArr.map(item => {
                                                                                        if (item.api_status == 1) {
                                                                                            extraParamObj[item.renamedValue] = item.value
                                                                                        }
                                                                                    });
                                                                                    obj.apiParams = extraParamObj;
                                                                                }
                                                                                var returnObj = { obj, new_obj }         // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                                console.log("result obj ------->", returnObj)
                                                                                var responseData = await response(result[0]._doc.connectCallFlow.response, arrData)
                                                                                returnObj.response = responseData
                                                                                return returnObj      // Returning obj, new_obj, and response
                                                                            } else {
                                                                                var source_onemin = 60 / Number(Source_creditValueData.pulse)
                                                                                console.log("source_pulse---->", Source_creditValueData.pulse)
                                                                                console.log("source_onemin---->", source_onemin)
                                                                                var source_oneminCost = source_onemin * Number(Source_creditValueData.sellrate)
                                                                                console.log("source_oneminCost---->", source_oneminCost)
                                                                                var source_min = balance / source_oneminCost
                                                                                console.log("source_min---------->", source_min)
                                                                                var source_seconds = source_min * 60;
                                                                                console.log("source_seconds---------->", source_seconds)
                                                                                if (balance >= source_oneminCost) {
                                                                                    const uniqueId = generateUniqueId();    // Generate a unique ID 
                                                                                    console.log(uniqueId);
                                                                                    var obj = {
                                                                                        did: sourceValue, didId: checkDidRes[0].id, [destinationRenameValue]: destinationValue, [sourceRenameValue]: sourceValue, destinationDuration: destination_seconds, sourceDuration: source_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, id_department: callflowRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                    }
                                                                                    var new_obj = {
                                                                                        did: sourceValue, didId: checkDidRes[0].id, destination: destinationValue, source: sourceValue, destinationDuration: destination_seconds, sourceDuration: source_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, id_department: callflowRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type
                                                                                    }
                                                                                    var extraParamObj = {}
                                                                                    if (extraParamArr.length != 0) {
                                                                                        extraParamArr.map(item => {
                                                                                            if (item.api_status == 1) {
                                                                                                extraParamObj[item.renamedValue] = item.value
                                                                                            }
                                                                                        });
                                                                                        obj.apiParams = extraParamObj;
                                                                                    }
                                                                                    var returnObj = { obj, new_obj }        // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                                    console.log("result obj ------->", returnObj)
                                                                                    var responseData = await response(result[0]._doc.connectCallFlow.response, arrData)
                                                                                    returnObj.response = responseData
                                                                                    return returnObj       // Returning obj, new_obj, and response
                                                                                } else {
                                                                                    var msg = { msg: "Not enough proper balance", status: false }
                                                                                    return msg
                                                                                }
                                                                            }
                                                                        } else {
                                                                            var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                                            return msg
                                                                        }
                                                                    } else {
                                                                        var source_seconds = 0
                                                                        var source_min = 0
                                                                        const uniqueId = generateUniqueId();       // Generate a unique ID 
                                                                        console.log(uniqueId);
                                                                        var obj = {
                                                                            did: sourceValue, didId: checkDidRes[0].id, [sourceRenameValue]: sourceValue, [destinationRenameValue]: destinationValue, sourceType: 1, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                        }
                                                                        var new_obj = {
                                                                            did: sourceValue, didId: checkDidRes[0].id, source: sourceValue, destination: destinationValue, sourceType: 1, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, id_department: callflowRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type
                                                                        }
                                                                        var extraParamObj = {}
                                                                        if (extraParamArr.length != 0) {
                                                                            extraParamArr.map(item => {
                                                                                if (item.api_status == 1) {
                                                                                    extraParamObj[item.renamedValue] = item.value
                                                                                }
                                                                            });
                                                                            obj.apiParams = extraParamObj;
                                                                        }
                                                                        var returnObj = { obj, new_obj }    // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                        console.log("result obj ------->", returnObj)
                                                                        var responseData = await response(result[0]._doc.connectCallFlow.response, arrData)
                                                                        returnObj.response = responseData
                                                                        return returnObj     // Returning obj, new_obj, and response
                                                                    }
                                                                } else {
                                                                    var msg = { msg: "Not enough proper balance", status: false }
                                                                    return msg
                                                                }
                                                            }
                                                        } else {
                                                            var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                            return msg
                                                        }
                                                    } else {
                                                        var msg = { msg: "There is no rate card selected", status: false }
                                                        return msg
                                                    }
                                                } else {
                                                    var msg = { msg: "This call flow does not belong to this customer", status: false }
                                                    return msg
                                                }
                                        } else {
                                            if (customerRes[0].balance > 0) {
                                                var callflowSql = `SELECT name,id,id_department FROM call_flow WHERE name = '${callflowValue}' and id_user = '${id_user}'`;
                                                var [callflowRes] = await getConnection.query(callflowSql);
                                                if (callflowRes.length != 0) {
                                                    var RateSql = `SELECT prefix,sellrate,pulse FROM rates WHERE id_ratecard = ${checkDidRes[0].outgoing_call_ratecard_id}`;
                                                    var [rateRes] = await getConnection.query(RateSql);
                                                    if (rateRes.length != 0) {
                                                        console.log("rateRes --->", rateRes)
                                                        var creditValueData = await get_prefix(destinationValue, rateRes);     //Find the prefix and its sell rate 
                                                        if (creditValueData) {
                                                            console.log("credit_limit---->", customerRes[0].credit_limit)
                                                            if (Number(customerRes[0].credit_limit) >= 0) {
                                                                var credit_limit = Number(customerRes[0].credit_limit)
                                                            } else {
                                                                var credit_limit = 0
                                                            }
                                                            console.log("credit_limit---->", customerRes[0].credit_limit)
                                                            console.log("balance---->", customerRes[0].balance)
                                                            var balance = Number(customerRes[0].balance) + credit_limit
                                                            console.log("balance---->", balance)
                                                            var destination_onemin = 60 / Number(creditValueData.pulse)
                                                            console.log("pulse---->", creditValueData.pulse)
                                                            console.log("destination_onemin---->", destination_onemin)
                                                            var destination_oneminCost = destination_onemin * Number(creditValueData.sellrate)
                                                            console.log("destination_oneminCost---->", destination_oneminCost)
                                                            var destination_min = balance / destination_oneminCost
                                                            console.log("destination_min---------->", destination_min)
                                                            var destination_seconds = destination_min * 60;
                                                            console.log("destination_seconds---------->", destination_seconds)
                                                            if (balance >= destination_oneminCost) {
                                                                console.log("sourceValue --->", sourceValue)
                                                                if (sourceValue != undefined) {
                                                                    var Source_creditValueData = await get_prefix(sourceNumber, rateRes);      //Find the prefix and its sell rate 
                                                                    if (Source_creditValueData) {
                                                                        var source_onemin = 60 / Number(Source_creditValueData.pulse)
                                                                        console.log("source_pulse---->", Source_creditValueData.pulse)
                                                                        console.log("source_onemin---->", source_onemin)
                                                                        var source_oneminCost = source_onemin * Number(Source_creditValueData.sellrate)
                                                                        console.log("source_oneminCost---->", source_oneminCost)
                                                                        var source_min = balance / source_oneminCost
                                                                        console.log("source_min---------->", source_min)
                                                                        var source_seconds = source_min * 60;
                                                                        console.log("source_seconds---------->", source_seconds)
                                                                        if (balance >= source_oneminCost) {
                                                                            const uniqueId = generateUniqueId();       // Generate a unique ID 
                                                                            console.log(uniqueId);
                                                                            var obj = {
                                                                                did: sourceValue, didId: checkDidRes[0].id, [destinationRenameValue]: destinationValue, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, id_department: callflowRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                            }
                                                                            var new_obj = {
                                                                                did: sourceValue, didId: checkDidRes[0].id, destination: destinationValue, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, id_department: callflowRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type
                                                                            }
                                                                            var extraParamObj = {}
                                                                            if (extraParamArr.length != 0) {
                                                                                extraParamArr.map(item => {
                                                                                    if (item.api_status == 1) {
                                                                                        extraParamObj[item.renamedValue] = item.value
                                                                                    }
                                                                                });
                                                                                obj.apiParams = extraParamObj;
                                                                            }
                                                                            var returnObj = { obj, new_obj }    // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                            console.log("result obj ------->", returnObj)
                                                                            var responseData = await response(result[0]._doc.connectCallFlow.response, arrData)
                                                                            returnObj.response = responseData
                                                                            return returnObj        // Returning obj, new_obj, and response
                                                                        } else {
                                                                            var msg = { msg: "Not enough proper balance", status: false }
                                                                            return msg
                                                                        }
                                                                    } else {
                                                                        var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                                        return msg
                                                                    }
                                                                } else {
                                                                    var source_seconds = 0
                                                                    var source_min = 0
                                                                    const uniqueId = generateUniqueId();    // Generate a unique ID 
                                                                    console.log(uniqueId);
                                                                    var obj = {
                                                                        did: sourceValue, didId: checkDidRes[0].id, [sourceRenameValue]: sourceValue, [destinationRenameValue]: destinationValue, sourceType: 1, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                    }
                                                                    var new_obj = {
                                                                        did: sourceValue, didId: checkDidRes[0].id, source: sourceValue, destination: destinationValue, sourceType: 1, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, callFlowId: callflowRes[0].id, id_department: callflowRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,planType : checkDidRes[0].plan_type
                                                                    }
                                                                    var extraParamObj = {}
                                                                    if (extraParamArr.length != 0) {
                                                                        extraParamArr.map(item => {
                                                                            if (item.api_status == 1) {
                                                                                extraParamObj[item.renamedValue] = item.value
                                                                            }
                                                                        });
                                                                        obj.apiParams = extraParamObj;
                                                                    }
                                                                    var returnObj = { obj, new_obj }     // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                    console.log("result obj ------->", returnObj)
                                                                    var responseData = await response(result[0]._doc.connectCallFlow.response, arrData)
                                                                    returnObj.response = responseData
                                                                    return returnObj      // Returning obj, new_obj, and response
                                                                }
                                                            } else {
                                                                var msg = { msg: "Not enough proper balance", status: false }
                                                                return msg
                                                            }
                                                        } else {
                                                            var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                            return msg
                                                        }
                                                    } else {
                                                        var msg = { msg: "There is no rate card selected", status: false }
                                                        return msg
                                                    }
                                                } else {
                                                    var msg = { msg: "This call flow does not belong to this customer", status: false }
                                                    return msg
                                                }
                                            } else {
                                                var msg = { msg: "Not enough proper balance", status: false }
                                                return msg
                                            }
                                        }
                                    } else {
                                        var msg = { msg: "This DID number is not active", status: false }
                                        return msg
                                    }
                                } else {
                                    var msg = { msg: "The destination number is in the blacklist and cannot be processed", status: false }
                                    return msg
                                }
                            } else {
                                var msg = { msg: "This DID does not belong to this customer", status: false }
                                return msg
                            }
                        } else {
                            var msg = { msg: "This destination number is not valid", status: false }
                            return msg
                        }
                    } else {
                        var msg = { msg: "This source number is not valid", status: false }
                        return msg
                    }
                } else {
                    var msg = { msg: "The customer is not active", status: false }
                    return msg
                }
            } else {
                var msg = { msg: "No customer exists with this UID and UPIN number", status: false }
                return msg
            }
        } else {
            var msg = { msg: "This call-flow feature is not active", status: false }
            return msg
        }
    } catch (err) {
        console.log(err)
        var msg = "err";
        return msg
    }
}
async function smartGroup(data, result) {
    try {
        if (result[0]._doc.connectSmartgroup.is_active == true) {
            var id_user = result[0]._doc.id_user;
            var customerSql = `SELECT id,call_uid, call_pin,status,balance,credit_limit,zoho_status,lead_square_status FROM customers WHERE id = '${result[0]._doc.id_user}' `;
            var [customerRes] = await getConnection.query(customerSql);
            if (customerRes.length != 0) {
                if (customerRes[0].status == 1 || customerRes[0].status == 2) {
                    var replaceVariable = result[0]._doc.connectSmartgroup.parameter_array;
                    var arrData = []
                    const didObj = replaceVariable.find(item => item.name === 'Did Number');          //Find the renamed value of Did Number
                    var didRenameValue = didObj ? didObj.renamedValue : undefined;
                    const didValue = data[didRenameValue];
                    var didNumber = didValue;
                    console.log('Did Number Value:', didValue);
                    console.log('Did Number:', didNumber);
                    if (didObj != undefined) {
                        didObj.value = didNumber
                        arrData.push(didObj)
                    }
                    const sourceObj = replaceVariable.find(item => item.name === 'Smartgroup UniqueID');        //Find the renamed value of source
                    var sourceRenameValue = sourceObj ? sourceObj.renamedValue : undefined;
                    var sourceValue = data[sourceRenameValue];
                    console.log('Smartgroup UniqueID:', sourceValue);
                    if (sourceObj != undefined) {
                        sourceObj.value = sourceValue
                        arrData.push(sourceObj)
                    }
                    const destinationObj = replaceVariable.find(item => item.name === 'Phone Number');           //Find the renamed value of Phone Number
                    var destinationRenameValue = destinationObj ? destinationObj.renamedValue : undefined;
                    const destinationValue = data[destinationRenameValue];
                    if (destinationObj != undefined) {
                        destinationObj.value = destinationValue
                        arrData.push(destinationObj)
                    }
                    console.log('Phone Number Value:', destinationValue);
                    const uidObj = replaceVariable.find(item => item.name === 'UID Number');          //Find the renamed value of UID Number
                    if (uidObj != undefined)
                        arrData.push(uidObj)
                    var uidRenameValue = uidObj ? uidObj.renamedValue : undefined;
                    const uidValue = data[uidRenameValue];
                    console.log('UID Number:', uidValue);
                    const upinObj = replaceVariable.find(item => item.name === 'PIN Number');         //Find the renamed value of PIN Number
                    if (upinObj != undefined)
                        arrData.push(upinObj)
                    var upinRenameValue = upinObj ? upinObj.renamedValue : undefined;
                    const upinValue = data[upinRenameValue];
                    console.log('PIN Number:', upinValue);
                    var extraParamArr = []
                    if (replaceVariable.length != 0) {
                        replaceVariable.map((variable, index) => {
                            if (variable.name != 'PIN Number' && variable.name != 'UID Number' && variable.name != 'Call Flow name' && variable.name != 'Phone Number' && variable.name != 'Did Number') {
                                var value = data[variable.renamedValue];
                                if (value != undefined) {
                                    variable.value = value
                                    arrData.push(variable)
                                    extraParamArr.push(variable)
                                }
                            }
                        });
                    }
                    var smargroupSql = `SELECT id,id_department FROM smart_group WHERE unique_id = '${sourceValue}' and id_user = '${id_user}'`;
                    var [smargroupRes] = await getConnection.query(smargroupSql);
                    if(smargroupRes.length != 0){
                        function isValidPhoneNumber(phoneNumber) {           //Checking whether the phone number is valid or invalid 
                            const regex = /^\d{10,16}$/;
                            return regex.test(phoneNumber);
                        }
                        if(didNumber != undefined){
                            if (isValidPhoneNumber(didNumber)) {
                                if (isValidPhoneNumber(destinationValue)) {
                                    var checkDidSql = `SELECT id,outgoing_call_ratecard_id,status,pricing_plan as plan_type,outgoing_provider,callrecord,outgoing_blacklist_id FROM did WHERE did = '${didNumber}' and id_user = '${id_user}'`;
                                    var [checkDidRes] = await getConnection.query(checkDidSql);
                                    if (checkDidRes.length != 0) {
                                        var blacklistSql = `SELECT * FROM cc_blacklist_contacts WHERE phone_no = '${checkDidRes[0].outgoing_blacklist_id}'`;
                                        var [blacklistRes] = await getConnection.query(blacklistSql);
                                        if (blacklistRes.length == 0) {
                                            if (checkDidRes[0].status == 1) {
                                                if (checkDidRes[0].plan_type == 0) {          //Checking plan type: 0 for unlimited, or pay-per-use
                                                    var RateSql = `SELECT prefix,sellrate,pulse FROM rates WHERE id_ratecard = ${checkDidRes[0].outgoing_call_ratecard_id}`;
                                                    var [rateRes] = await getConnection.query(RateSql);
                                                    if (rateRes.length != 0) {
                                                        console.log("rateRes --->", rateRes)
                                                        var creditValueData = await get_prefix(destinationValue, rateRes);     //Find the prefix and its sell rate
                                                        if (creditValueData) {
                                                            if (creditValueData.prefix == '91') {        //Unlimited plans are only applicable for the 91 prefix
                                                                console.log("didValue --->", didValue)
                                                                if (didValue != undefined) {
                                                                    var Source_creditValueData = await get_prefix(didNumber, rateRes);   //Find the prefix and its sell rate 
                                                                    if (Source_creditValueData) {
                                                                        if (Source_creditValueData.prefix == '91') {          //Unlimited plans are only applicable for the 91 prefix
                                                                            const uniqueId = generateUniqueId();     // Generate a unique ID 
                                                                            console.log(uniqueId);
                                                                            var obj = {
                                                                                did: didValue, didId: checkDidRes[0].id, [sourceRenameValue]: sourceValue, [destinationRenameValue]: destinationValue,sourceType: 2,  sourceDuration: 3600, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                            }
                                                                            var new_obj = {
                                                                                did: didValue, didId: checkDidRes[0].id, source: sourceValue, destination: destinationValue,sourceType: 2,  sourceDuration: 3600, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,sourceCallType:'connectSmartgroupSource',destinationCallType:'connectSmartgroupDestination'
                                                                            }
                                                                            var extraParamObj = {}
                                                                            if (extraParamArr.length != 0) {
                                                                                extraParamArr.map(item => {
                                                                                    if (item.api_status == 1) {
                                                                                        extraParamObj[item.renamedValue] = item.value
                                                                                    }
                                                                                });
                                                                                obj.apiParams = extraParamObj;
                                                                            }
                                                                            var returnObj = { obj, new_obj }    // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                            console.log("result obj ------->", returnObj)
                                                                            var responseData = await response(result[0]._doc.connectSmartgroup.response, arrData)
                                                                            returnObj.response = responseData
                                                                            return returnObj        // Returning obj, new_obj, and response
                                                                        } else {
                                                                            var source_onemin = 60 / Number(Source_creditValueData.pulse)
                                                                            console.log("source_pulse---->", Source_creditValueData.pulse)
                                                                            console.log("source_onemin---->", source_onemin)
                                                                            var source_oneminCost = source_onemin * Number(Source_creditValueData.sellrate)
                                                                            console.log("source_oneminCost---->", source_oneminCost)
                                                                            var source_min = balance / source_oneminCost
                                                                            console.log("source_min---------->", source_min)
                                                                            var source_seconds = source_min * 60;
                                                                            console.log("source_seconds---------->", source_seconds)
                                                                            if (balance >= source_oneminCost) {
                                                                                const uniqueId = generateUniqueId();     // Generate a unique ID 
                                                                                console.log(uniqueId);
                                                                                var obj = {
                                                                                    did: didValue, didId: checkDidRes[0].id, [sourceRenameValue]: sourceValue, [destinationRenameValue]: destinationValue,sourceType: 2,  sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                }
                                                                                var new_obj = {
                                                                                    did: didValue, didId: checkDidRes[0].id, source: sourceValue, destination: destinationValue,sourceType: 2,  sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,sourceCallType:'connectSmartgroupSource',destinationCallType:'connectSmartgroupDestination'
                                                                                }
                                                                                var extraParamObj = {}
                                                                                if (extraParamArr.length != 0) {
                                                                                    extraParamArr.map(item => {
                                                                                        if (item.api_status == 1) {
                                                                                            extraParamObj[item.renamedValue] = item.value
                                                                                        }
                                                                                    });
                                                                                    obj.apiParams = extraParamObj;
                                                                                }
                                                                                var returnObj = { obj, new_obj }  // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                                console.log("result obj ------->", returnObj)
                                                                                var responseData = await response(result[0]._doc.connectSmartgroup.response, arrData)
                                                                                returnObj.response = responseData
                                                                                return returnObj      // Returning obj, new_obj, and response
                                                                            } else {
                                                                                var msg = { msg: "Not enough proper balance", status: false }
                                                                                return msg
                                                                            }
                                                                        }
                                                                    } else {
                                                                        var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                                        return msg
                                                                    }
                                                                } else {
                                                                    var source_seconds = 0
                                                                    var source_min = 0
                                                                    const uniqueId = generateUniqueId();      // Generate a unique ID 
                                                                    console.log(uniqueId);
                                                                    var obj = {
                                                                        did: didValue, didId: checkDidRes[0].id, [sourceRenameValue]: sourceValue, [destinationRenameValue]: destinationValue, sourceType: 2, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                    }
                                                                    var new_obj = {
                                                                        did: didValue, didId: checkDidRes[0].id, source: sourceValue, destination: destinationValue, sourceType: 2, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,sourceCallType:'connectSmartgroupSource',destinationCallType:'connectSmartgroupDestination'
                                                                    }
                                                                    var extraParamObj = {}
                                                                    if (extraParamArr.length != 0) {
                                                                        extraParamArr.map(item => {
                                                                            if (item.api_status == 1) {
                                                                                extraParamObj[item.renamedValue] = item.value
                                                                            }
                                                                        });
                                                                        obj.apiParams = extraParamObj;
                                                                    }
                                                                    var returnObj = { obj, new_obj }      // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                    console.log("result obj ------->", returnObj)
                                                                    var responseData = await response(result[0]._doc.connectSmartgroup.response, arrData)
                                                                    returnObj.response = responseData
                                                                    return returnObj      // Returning obj, new_obj, and response
                                                                }
                                                            } else {
                                                                console.log("credit_limit---->", customerRes[0].credit_limit)
                                                                if (Number(customerRes[0].credit_limit) >= 0) {
                                                                    var credit_limit = Number(customerRes[0].credit_limit)
                                                                } else {
                                                                    var credit_limit = 0
                                                                }
                                                                console.log("credit_limit---->", customerRes[0].credit_limit)
                                                                console.log("balance---->", customerRes[0].balance)
                                                                var balance = Number(customerRes[0].balance) + credit_limit
                                                                console.log("balance---->", balance)
                                                                var destination_onemin = 60 / Number(creditValueData.pulse)
                                                                console.log("pulse---->", creditValueData.pulse)
                                                                console.log("destination_onemin---->", destination_onemin)
                                                                var destination_oneminCost = destination_onemin * Number(creditValueData.sellrate)
                                                                console.log("destination_oneminCost---->", destination_oneminCost)
                                                                var destination_min = balance / destination_oneminCost
                                                                console.log("destination_min---------->", destination_min)
                                                                var destination_seconds = destination_min * 60;
                                                                console.log("destination_seconds---------->", destination_seconds)
                                                                if (balance >= destination_oneminCost) {
                                                                    console.log("didValue --->", didValue)
                                                                    if (didValue != undefined) {
                                                                        var Source_creditValueData = await get_prefix(didNumber, rateRes);   //Find the prefix and its sell rate 
                                                                        if (Source_creditValueData) {
                                                                            if (Source_creditValueData.prefix == '91') {           //Unlimited plans are only applicable for the 91 prefix
                                                                                const uniqueId = generateUniqueId();          // Generate a unique ID 
                                                                                console.log(uniqueId);
                                                                                var obj = {
                                                                                    did: didValue, didId: checkDidRes[0].id, [destinationRenameValue]: destinationValue, [sourceRenameValue]: sourceValue, sourceType: 2, destinationDuration: destination_seconds, sourceDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                }
                                                                                var new_obj = {
                                                                                    did: didValue, didId: checkDidRes[0].id, destination: destinationValue, source: sourceValue,sourceType: 2,  destinationDuration: destination_seconds, sourceDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,sourceCallType:'connectSmartgroupSource',destinationCallType:'connectSmartgroupDestination'
                                                                                }
                                                                                var extraParamObj = {}
                                                                                if (extraParamArr.length != 0) {
                                                                                    extraParamArr.map(item => {
                                                                                        if (item.api_status == 1) {
                                                                                            extraParamObj[item.renamedValue] = item.value
                                                                                        }
                                                                                    });
                                                                                    obj.apiParams = extraParamObj;
                                                                                }
                                                                                var returnObj = { obj, new_obj }         // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                                console.log("result obj ------->", returnObj)
                                                                                var responseData = await response(result[0]._doc.connectSmartgroup.response, arrData)
                                                                                returnObj.response = responseData
                                                                                return returnObj      // Returning obj, new_obj, and response
                                                                            } else {
                                                                                var source_onemin = 60 / Number(Source_creditValueData.pulse)
                                                                                console.log("source_pulse---->", Source_creditValueData.pulse)
                                                                                console.log("source_onemin---->", source_onemin)
                                                                                var source_oneminCost = source_onemin * Number(Source_creditValueData.sellrate)
                                                                                console.log("source_oneminCost---->", source_oneminCost)
                                                                                var source_min = balance / source_oneminCost
                                                                                console.log("source_min---------->", source_min)
                                                                                var source_seconds = source_min * 60;
                                                                                console.log("source_seconds---------->", source_seconds)
                                                                                if (balance >= source_oneminCost) {
                                                                                    const uniqueId = generateUniqueId();    // Generate a unique ID 
                                                                                    console.log(uniqueId);
                                                                                    var obj = {
                                                                                        did: didValue, didId: checkDidRes[0].id, [destinationRenameValue]: destinationValue, [sourceRenameValue]: sourceValue, sourceType: 2, destinationDuration: destination_seconds, sourceDuration: source_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                    }
                                                                                    var new_obj = {
                                                                                        did: didValue, didId: checkDidRes[0].id, destination: destinationValue, source: sourceValue, sourceType: 2, destinationDuration: destination_seconds, sourceDuration: source_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,sourceCallType:'connectSmartgroupSource',destinationCallType:'connectSmartgroupDestination'
                                                                                    }
                                                                                    var extraParamObj = {}
                                                                                    if (extraParamArr.length != 0) {
                                                                                        extraParamArr.map(item => {
                                                                                            if (item.api_status == 1) {
                                                                                                extraParamObj[item.renamedValue] = item.value
                                                                                            }
                                                                                        });
                                                                                        obj.apiParams = extraParamObj;
                                                                                    }
                                                                                    var returnObj = { obj, new_obj }        // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                                    console.log("result obj ------->", returnObj)
                                                                                    var responseData = await response(result[0]._doc.connectSmartgroup.response, arrData)
                                                                                    returnObj.response = responseData
                                                                                    return returnObj       // Returning obj, new_obj, and response
                                                                                } else {
                                                                                    var msg = { msg: "Not enough proper balance", status: false }
                                                                                    return msg
                                                                                }
                                                                            }
                                                                        } else {
                                                                            var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                                            return msg
                                                                        }
                                                                    } else {
                                                                        var source_seconds = 0
                                                                        var source_min = 0
                                                                        const uniqueId = generateUniqueId();       // Generate a unique ID 
                                                                        console.log(uniqueId);
                                                                        var obj = {
                                                                            did: didValue, didId: checkDidRes[0].id, [sourceRenameValue]: sourceValue, [destinationRenameValue]: destinationValue, sourceType: 2, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                        }
                                                                        var new_obj = {
                                                                            did: didValue, didId: checkDidRes[0].id, source: sourceValue, destination: destinationValue, sourceType: 2, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,sourceCallType:'connectSmartgroupSource',destinationCallType:'connectSmartgroupDestination'
                                                                        }
                                                                        var extraParamObj = {}
                                                                        if (extraParamArr.length != 0) {
                                                                            extraParamArr.map(item => {
                                                                                if (item.api_status == 1) {
                                                                                    extraParamObj[item.renamedValue] = item.value
                                                                                }
                                                                            });
                                                                            obj.apiParams = extraParamObj;
                                                                        }
                                                                        var returnObj = { obj, new_obj }    // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                        console.log("result obj ------->", returnObj)
                                                                        var responseData = await response(result[0]._doc.connectSmartgroup.response, arrData)
                                                                        returnObj.response = responseData
                                                                        return returnObj     // Returning obj, new_obj, and response
                                                                    }
                                                                } else {
                                                                    var msg = { msg: "Not enough proper balance", status: false }
                                                                    return msg
                                                                }
                                                            }
                                                        } else {
                                                            var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                            return msg
                                                        }
                                                    } else {
                                                        var msg = { msg: "There is no rate card selected", status: false }
                                                        return msg
                                                    }
                                                } else {
                                                    if (customerRes[0].balance > 0) {
                                                        var RateSql = `SELECT prefix,sellrate,pulse FROM rates WHERE id_ratecard = ${checkDidRes[0].outgoing_call_ratecard_id}`;
                                                        var [rateRes] = await getConnection.query(RateSql);
                                                        if (rateRes.length != 0) {
                                                            console.log("rateRes --->", rateRes)
                                                            var creditValueData = await get_prefix(destinationValue, rateRes);     //Find the prefix and its sell rate 
                                                            if (creditValueData) {
                                                                console.log("credit_limit---->", customerRes[0].credit_limit)
                                                                if (Number(customerRes[0].credit_limit) >= 0) {
                                                                    var credit_limit = Number(customerRes[0].credit_limit)
                                                                } else {
                                                                    var credit_limit = 0
                                                                }
                                                                console.log("credit_limit---->", customerRes[0].credit_limit)
                                                                console.log("balance---->", customerRes[0].balance)
                                                                var balance = Number(customerRes[0].balance) + credit_limit
                                                                console.log("balance---->", balance)
                                                                var destination_onemin = 60 / Number(creditValueData.pulse)
                                                                console.log("pulse---->", creditValueData.pulse)
                                                                console.log("destination_onemin---->", destination_onemin)
                                                                var destination_oneminCost = destination_onemin * Number(creditValueData.sellrate)
                                                                console.log("destination_oneminCost---->", destination_oneminCost)
                                                                var destination_min = balance / destination_oneminCost
                                                                console.log("destination_min---------->", destination_min)
                                                                var destination_seconds = destination_min * 60;
                                                                console.log("destination_seconds---------->", destination_seconds)
                                                                if (balance >= destination_oneminCost) {
                                                                    console.log("didValue --->", didValue)
                                                                    if (didValue != undefined) {
                                                                        var Source_creditValueData = await get_prefix(didNumber, rateRes);      //Find the prefix and its sell rate 
                                                                        if (Source_creditValueData) {
                                                                            var source_onemin = 60 / Number(Source_creditValueData.pulse)
                                                                            console.log("source_pulse---->", Source_creditValueData.pulse)
                                                                            console.log("source_onemin---->", source_onemin)
                                                                            var source_oneminCost = source_onemin * Number(Source_creditValueData.sellrate)
                                                                            console.log("source_oneminCost---->", source_oneminCost)
                                                                            var source_min = balance / source_oneminCost
                                                                            console.log("source_min---------->", source_min)
                                                                            var source_seconds = source_min * 60;
                                                                            console.log("source_seconds---------->", source_seconds)
                                                                            if (balance >= source_oneminCost) {
                                                                                const uniqueId = generateUniqueId();       // Generate a unique ID 
                                                                                console.log(uniqueId);
                                                                                var obj = {
                                                                                    did: didValue, didId: checkDidRes[0].id, [destinationRenameValue]: destinationValue,[sourceRenameValue]: sourceValue,sourceType: 2, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                                }
                                                                                var new_obj = {
                                                                                    did: didValue, didId: checkDidRes[0].id, destination: destinationValue,source: sourceValue,sourceType: 2, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,sourceCallType:'connectSmartgroupSource',destinationCallType:'connectSmartgroupDestination'
                                                                                }
                                                                                var extraParamObj = {}
                                                                                if (extraParamArr.length != 0) {
                                                                                    extraParamArr.map(item => {
                                                                                        if (item.api_status == 1) {
                                                                                            extraParamObj[item.renamedValue] = item.value
                                                                                        }
                                                                                    });
                                                                                    obj.apiParams = extraParamObj;
                                                                                }
                                                                                var returnObj = { obj, new_obj }    // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                                console.log("result obj ------->", returnObj)
                                                                                var responseData = await response(result[0]._doc.connectSmartgroup.response, arrData)
                                                                                returnObj.response = responseData
                                                                                return returnObj        // Returning obj, new_obj, and response
                                                                            } else {
                                                                                var msg = { msg: "Not enough proper balance", status: false }
                                                                                return msg
                                                                            }
                                                                        } else {
                                                                            var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                                            return msg
                                                                        }
                                                                    } else {
                                                                        var source_seconds = 0
                                                                        var source_min = 0
                                                                        const uniqueId = generateUniqueId();    // Generate a unique ID 
                                                                        console.log(uniqueId);
                                                                        var obj = {
                                                                            did: didValue, didId: checkDidRes[0].id, [sourceRenameValue]: sourceValue, [destinationRenameValue]: destinationValue, sourceType: 2, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                                                        }
                                                                        var new_obj = {
                                                                            did: didValue, didId: checkDidRes[0].id, source: sourceValue, destination: destinationValue, sourceType: 2, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, callrecord: checkDidRes[0].callrecord, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,sourceCallType:'connectSmartgroupSource',destinationCallType:'connectSmartgroupDestination'
                                                                        }
                                                                        var extraParamObj = {}
                                                                        if (extraParamArr.length != 0) {
                                                                            extraParamArr.map(item => {
                                                                                if (item.api_status == 1) {
                                                                                    extraParamObj[item.renamedValue] = item.value
                                                                                }
                                                                            });
                                                                            obj.apiParams = extraParamObj;
                                                                        }
                                                                        var returnObj = { obj, new_obj }     // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                        console.log("result obj ------->", returnObj)
                                                                        var responseData = await response(result[0]._doc.connectSmartgroup.response, arrData)
                                                                        returnObj.response = responseData
                                                                        return returnObj      // Returning obj, new_obj, and response
                                                                    }
                                                                } else {
                                                                    var msg = { msg: "Not enough proper balance", status: false }
                                                                    return msg
                                                                }
                                                            } else {
                                                                var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                                return msg
                                                            }
                                                        } else {
                                                            var msg = { msg: "There is no rate card selected", status: false }
                                                            return msg
                                                        }
                                                    } else {
                                                        var msg = { msg: "Not enough proper balance", status: false }
                                                        return msg
                                                    }
                                                }
                                            } else {
                                                var msg = { msg: "This DID number is not active", status: false }
                                                return msg
                                            }
                                        } else {
                                            var msg = { msg: "The destination number is in the blacklist and cannot be processed", status: false }
                                            return msg
                                        }
                                    } else {
                                        var msg = { msg: "This DID does not belong to this customer", status: false }
                                        return msg
                                    }
                                } else {
                                    var msg = { msg: "This destination number is not valid", status: false }
                                    return msg
                                }
                            } else {
                                var msg = { msg: "This did number is not valid", status: false }
                                return msg
                            }
                        }else{
                            if (isValidPhoneNumber(destinationValue)) {
                                const uniqueId = generateUniqueId();     // Generate a unique ID 
                                console.log(uniqueId);
                                var obj = {
                                    [sourceRenameValue]: sourceValue, [destinationRenameValue]: destinationValue, sourceType: 2, sourceDuration: 3600, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status
                                }
                                var new_obj = {
                                    source: sourceValue, destination: destinationValue, sourceType: 2, sourceDuration: 3600, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, smartGroupId: smargroupRes[0].id, id_department: smargroupRes[0].id_department, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status,sourceCallType:'connectSmartgroupSource',destinationCallType:'connectSmartgroupDestination'
                                }
                                var extraParamObj = {}
                                if (extraParamArr.length != 0) {
                                    extraParamArr.map(item => {
                                        if (item.api_status == 1) {
                                            extraParamObj[item.renamedValue] = item.value
                                        }
                                    });
                                    obj.apiParams = extraParamObj;
                                }
                                var returnObj = { obj, new_obj }    // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                console.log("result obj ------->", returnObj)
                                var responseData = await response(result[0]._doc.connectSmartgroup.response, arrData)
                                returnObj.response = responseData
                                return returnObj        // Returning obj, new_obj, and response
                            } else {
                                var msg = { msg: "This destination number is not valid", status: false }
                                return msg
                            }
                        }
                    }else{
                        var msg = { msg: "This smartgroup not belong to this customer", status: false }
                        return msg
                    }
                } else {
                    var msg = { msg: "The customer is not active", status: false }
                    return msg
                }
            } else {
                var msg = { msg: "No customer exists with this UID and UPIN number", status: false }
                return msg
            }
        } else {
            var msg = { msg: "This smartgroup feature is not active", status: false }
            return msg
        }
    } catch (err) {
        console.log(err)
        var msg = "err";
        return msg
    }
}
async function call_task_click_to_call(data) {
    try {
        var result = await CallTaskContacts.find({ _id : ObjectId(data.contact_id) });
        if (result.length != 0) {
            var updateStatus = await CallTaskContacts.updateOne({ _id: ObjectId(data.contact_id) }, { $set: { call_status: 1 } } );
            var id_user = result[0]._doc.id_user;
            var id_department = result[0].id_department;
            var destinationValue = result[0]._doc.phone_number;
            var user_id = result[0]._doc.user_id
            var userSql = `SELECT user_id,cf_status,cf_type,cf_number,extNumber,regNumber,did FROM user_settings WHERE user_id = '${user_id}'`;
            var [userRes] = await getConnection.query(userSql);
            if (userRes.length != 0) {
                var customerSql = `SELECT id,status,balance,credit_limit,zoho_status,lead_square_status FROM customers WHERE id = '${result[0]._doc.id_user}' `;
                var [customerRes] = await getConnection.query(customerSql);
                if (customerRes.length != 0) {
                    var didNumber = userRes[0].did;
                    var regNumber = userRes[0].regNumber;
                    if (userRes[0].cf_status == 1) {
                        var sourceNumber = userRes[0].cf_number;
                        var sourceType = 1
                    } else {
                        var sourceNumber = userRes[0].extNumber;
                        var sourceType = 0
                    }
                    function isValidPhoneNumber(phoneNumber) {          //Checking whether the phone number is valid or invalid 
                        const regex = /^\d{10,16}$/;
                        return regex.test(phoneNumber);
                    }
                    if (isValidPhoneNumber(destinationValue)) {
                        var checkDidSql = `SELECT id,outgoing_call_ratecard_id,status,pricing_plan as plan_type,outgoing_provider,callrecord,outgoing_blacklist_id,channels FROM did WHERE did = '${didNumber}' and id_user = '${id_user}'`;
                        var [checkDidRes] = await getConnection.query(checkDidSql);
                        if (checkDidRes.length != 0) {
                            var blacklistSql = `SELECT * FROM cc_blacklist_contacts WHERE phone_no = '${destinationValue}' and blacklist_id = '${checkDidRes[0].outgoing_blacklist_id}'`;
                            var [blacklistRes] = await getConnection.query(blacklistSql);
                            if (blacklistRes.length == 0) {
                                if (checkDidRes[0].status == 1) {          // Checking DID status
                                    if (checkDidRes[0].plan_type == 0) {           // Checking plan type: 0 for unlimited, or pay-per-use
                                        var RateSql = `SELECT prefix,sellrate,pulse FROM rates WHERE id_ratecard = ${checkDidRes[0].outgoing_call_ratecard_id}`;
                                        var [rateRes] = await getConnection.query(RateSql);
                                        if (rateRes.length != 0) {
                                            console.log("rateRes --->", rateRes)
                                            console.log("credit_limit---->", customerRes[0].credit_limit)
                                            if (Number(customerRes[0].credit_limit) >= 0) {
                                                var credit_limit = Number(customerRes[0].credit_limit)
                                            } else {
                                                var credit_limit = 0
                                            }
                                            console.log("credit_limit---->", customerRes[0].credit_limit)
                                            console.log("balance---->", customerRes[0].balance)
                                            var balance = Number(customerRes[0].balance) + credit_limit
                                            console.log("balance---->", balance)
                                            var creditValueData = await get_prefix(destinationValue, rateRes)       //Find the prefix and its sell rate 
                                            if (creditValueData) {          // Prefix matching check
                                                if (creditValueData.prefix == '91') {       //Unlimited plans are only applicable for the 91 prefix
                                                    if (sourceType == 1) {
                                                        var Source_creditValueData = await get_prefix(sourceNumber, rateRes)   //Find the prefix and its sell rate 
                                                        if (Source_creditValueData) {          // Prefix matching check
                                                            if (Source_creditValueData.prefix == '91') {    //Unlimited plans are only applicable for the 91 prefix
                                                                const uniqueId = generateUniqueId();  // Generate a unique ID 
                                                                console.log(uniqueId);
                                                                if (userRes[0].cf_status == 0) {       //Check if the source number is undefined or call forwarding is not enabled
                                                                    var new_obj = {
                                                                        did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: 3600, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,callProcessId:data.contact_id,sourceCallType:'callTaskSource',destinationCallType:'callTaskDestination'
                                                                    }
                                                                } else {
                                                                    var new_obj = {
                                                                        did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: 3600, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,callProcessId:data.contact_id,sourceCallType:'callTaskSource',destinationCallType:'callTaskDestination'
                                                                    }
                                                                }
                                                                var returnObj = new_obj     // The source and destination variables have been renamed. The renamed values are being used in the obj object, but the new_obj is not using the renamed values
                                                                console.log("result obj ------->", returnObj)
                                                                if (sourceObj != undefined) {
                                                                    sourceObj.value = sourceNumber
                                                                    arrData.push(sourceObj)
                                                                }
                                                                var responseData = await response(result[0]._doc.clickToCall.response, arrData)   //Function for formatted response
                                                                returnObj.response = responseData
                                                                return returnObj     // Returning obj, new_obj, and response
                                                            } else {
                                                                var source_onemin = 60 / Number(Source_creditValueData.pulse)
                                                                console.log("pulse---->", Source_creditValueData.pulse)
                                                                console.log("source_onemin---->", source_onemin)
                                                                var source_oneminCost = source_onemin * Number(Source_creditValueData.sellrate)
                                                                console.log("source_oneminCost---->", source_oneminCost)
                                                                var source_min = balance / source_oneminCost
                                                                console.log("source_min---------->", source_min)
                                                                var source_seconds = source_min * 60;
                                                                console.log("source_seconds---------->", source_seconds)
                                                                if (balance >= source_oneminCost) {       // Balance checking
                                                                    const uniqueId = generateUniqueId();  // Generate a unique ID 
                                                                    console.log(uniqueId);
                                                                    if (userRes[0].cf_status == 0) {
                                                                        var new_obj = {
                                                                            did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,callProcessId:data.contact_id, sourceCallType:'callTaskSource',destinationCallType:'callTaskDestination'
                                                                        }
                                                                    } else {
                                                                        var new_obj = {
                                                                            did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,callProcessId:data.contact_id, sourceCallType:'callTaskSource',destinationCallType:'callTaskDestination'
                                                                        }
                                                                    }
                                                                    return { new_obj: new_obj }      // Returning obj, new_obj, and response
                                                                } else {
                                                                    var msg = { msg: "Not enough proper balance", status: false }
                                                                    return msg
                                                                }
                                                            }
                                                        } else {
                                                            var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                            return msg
                                                        }
                                                    } else {
                                                        var source_seconds = 0
                                                        var source_min = 0
                                                        const uniqueId = generateUniqueId();   // Generate a unique ID 
                                                        console.log(uniqueId);
                                                        if (userRes[0].cf_status == 0) {
                                                            var new_obj = {
                                                                did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,callProcessId:data.contact_id, sourceCallType:'callTaskSource',destinationCallType:'callTaskDestination'
                                                            }
                                                        } else {
                                                            var new_obj = {
                                                                did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: 3600, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,callProcessId:data.contact_id, sourceCallType:'callTaskSource',destinationCallType:'callTaskDestination'
                                                            }
                                                        }
                                                        return { new_obj: new_obj }     // Returning obj, new_obj, and response
                                                    }
                                                } else {
                                                    var destination_onemin = 60 / Number(pulse)
                                                    console.log("pulse---->", creditValueData.pulse)
                                                    console.log("destination_onemin---->", destination_onemin)
                                                    var destination_oneminCost = destination_onemin * Number(creditValueData.sellrate)
                                                    console.log("destination_oneminCost---->", destination_oneminCost)
                                                    var destination_min = balance / destination_oneminCost
                                                    console.log("destination_min---------->", destination_min)
                                                    var destination_seconds = destination_min * 60;
                                                    console.log("destination_seconds---------->", destination_seconds)
                                                    if (balance >= destination_onemin) {
                                                        console.log("sourceNumber --->", sourceNumber)
                                                        if (sourceType == 1) {
                                                            var Source_creditValueData = await get_prefix(sourceNumber, rateRes)        //Find the prefix and its sell rate 
                                                            if (Source_creditValueData) {
                                                                if (Source_creditValueData.prefix == '91') {         //Unlimited plans are only applicable for the 91 prefix
                                                                    const uniqueId = generateUniqueId();      // Generate a unique ID 
                                                                    console.log(uniqueId);
                                                                    if (userRes[0].cf_status == 0) {
                                                                        var new_obj = {
                                                                            did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: 3600, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type, sourceCallType: 'clickToCallSource', destinationCallType: 'clickToCallDestination'
                                                                        }
                                                                    } else {
                                                                        var new_obj = {
                                                                            did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: 3600, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type, sourceCallType: 'clickToCallSource', destinationCallType: 'clickToCallDestination'
                                                                        }
                                                                    }
                                                                    return { new_obj: new_obj }        // Returning obj, new_obj, and response
                                                                } else {
                                                                    var source_onemin = 60 / Number(Source_creditValueData.pulse)
                                                                    console.log("pulse---->", Source_creditValueData.pulse)
                                                                    console.log("source_onemin---->", source_onemin)
                                                                    var source_oneminCost = source_onemin * Number(Source_creditValueData.sellrate)
                                                                    console.log("source_oneminCost---->", source_oneminCost)
                                                                    var source_min = balance / source_oneminCost
                                                                    console.log("source_min---------->", source_min)
                                                                    var source_seconds = source_min * 60;
                                                                    console.log("source_seconds---------->", source_seconds)
                                                                    if (balance >= source_oneminCost) {
                                                                        const uniqueId = generateUniqueId();       // Generate a unique ID 
                                                                        console.log(uniqueId);
                                                                        if (userRes[0].cf_status == 0) {
                                                                            var new_obj = {
                                                                                did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, ser_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type, sourceCallType: 'clickToCallSource', destinationCallType: 'clickToCallDestination'
                                                                            }
                                                                        } else {
                                                                            var new_obj = {
                                                                                did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type, sourceCallType: 'clickToCallSource', destinationCallType: 'clickToCallDestination'
                                                                            }
                                                                        }
                                                                        return { new_obj: new_obj }          // Returning obj, new_obj, and response
                                                                    } else {
                                                                        var msg = { msg: "Not enough proper balance", status: false }
                                                                        return msg
                                                                    }
                                                                }
                                                            } else {
                                                                var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                                return msg
                                                            }
                                                        } else {
                                                            var source_seconds = 0
                                                            var source_min = 0
                                                            const uniqueId = generateUniqueId();   // Generate a unique ID 
                                                            console.log(uniqueId);
                                                            if (userRes[0].cf_status == 0) {
                                                                var new_obj = {
                                                                    did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, hannel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type, sourceCallType: 'clickToCallSource', destinationCallType: 'clickToCallDestination'
                                                                }
                                                            } else {
                                                                var new_obj = {
                                                                    did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type, sourceCallType: 'clickToCallSource', destinationCallType: 'clickToCallDestination'
                                                                }
                                                            }
                                                            return { new_obj: new_obj }        // Returning obj, new_obj, and response
                                                        }
                                                    } else {
                                                        var msg = { msg: "Not enough proper balance", status: false }
                                                        return msg
                                                    }
                                                }
                                            } else {
                                                var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                return msg
                                            }
                                        } else {
                                            var msg = { msg: "There is no rate card selected", status: false }
                                            return msg
                                        }
                                    } else {
                                        if (customerRes[0].balance > 0) {
                                            var RateSql = `SELECT prefix,sellrate,pulse FROM rates WHERE id_ratecard = ${checkDidRes[0].outgoing_call_ratecard_id}`;
                                            var [rateRes] = await getConnection.query(RateSql);
                                            if (rateRes.length != 0) {
                                                console.log("rateRes --->", rateRes)
                                                var creditValueData = await get_prefix(destinationValue, rateRes)  //Find the prefix and its sell rate 
                                                if (creditValueData) {
                                                    console.log("credit_limit---->", customerRes[0].credit_limit)
                                                    if (Number(customerRes[0].credit_limit) >= 0) {
                                                        var credit_limit = Number(customerRes[0].credit_limit)
                                                    } else {
                                                        var credit_limit = 0
                                                    }
                                                    console.log("credit_limit---->", customerRes[0].credit_limit)
                                                    console.log("balance---->", customerRes[0].balance)
                                                    var balance = Number(customerRes[0].balance) + credit_limit
                                                    console.log("balance---->", balance)
                                                    var destination_onemin = 60 / Number(creditValueData.pulse)
                                                    console.log("pulse---->", creditValueData.pulse)
                                                    console.log("destination_onemin---->", destination_onemin)
                                                    var destination_oneminCost = destination_onemin * Number(creditValueData.sellrate)
                                                    console.log("destination_oneminCost---->", destination_oneminCost)
                                                    var destination_min = balance / destination_oneminCost
                                                    console.log("min---------->", destination_min)
                                                    var destination_seconds = destination_min * 60;
                                                    console.log("destination_seconds---------->", destination_seconds)
                                                    if (balance >= destination_oneminCost) {
                                                        console.log("sourceNumber --->", sourceNumber)
                                                        if (sourceType == 1) {
                                                            var Source_creditValueData = await get_prefix(sourceNumber, rateRes)   //Find the prefix and its sell rate 
                                                            if (Source_creditValueData) {
                                                                var source_onemin = 60 / Number(Source_creditValueData.pulse)
                                                                console.log("pulse---->", Source_creditValueData.pulse)
                                                                console.log("source_onemin---->", source_onemin)
                                                                var source_oneminCost = source_onemin * Number(Source_creditValueData.sellrate)
                                                                console.log("source_oneminCost---->", source_oneminCost)
                                                                var source_min = balance / source_oneminCost
                                                                console.log("source_min---------->", source_min)
                                                                var source_seconds = source_min * 60;
                                                                console.log("source_seconds---------->", source_seconds)
                                                                if (balance >= source_oneminCost) {
                                                                    const uniqueId = generateUniqueId();   // Generate a unique ID 
                                                                    console.log(uniqueId);
                                                                    if (userRes[0].cf_status == 0) {
                                                                        var new_obj = {
                                                                            did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, niqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,callProcessId:data.contact_id, sourceCallType:'callTaskSource',destinationCallType:'callTaskDestination'
                                                                        }
                                                                    } else {
                                                                        var new_obj = {
                                                                            did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, allrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, zohoStatus: customerRes[0].zoho_status, lsqStatus: customerRes[0].lead_square_status, planType: checkDidRes[0].plan_type,callProcessId:data.contact_id, sourceCallType:'callTaskSource',destinationCallType:'callTaskDestination'
                                                                        }
                                                                    }
                                                                    return { new_obj: new_obj }      // Returning obj, new_obj, and response
                                                                } else {
                                                                    var msg = { msg: "Not enough proper balance", status: false }
                                                                    return msg
                                                                }
                                                            } else {
                                                                var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                                return msg
                                                            }
                                                        } else {
                                                            var source_seconds = 3600;
                                                            var source_min = 0
                                                            const uniqueId = generateUniqueId();  // Generate a unique ID 
                                                            console.log(uniqueId);
                                                            if (userRes[0].cf_status == 0) {
                                                                var new_obj = {
                                                                    did: didNumber, destination: destinationValue, source: regNumber, sourceType: sourceType, sourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, planType: checkDidRes[0].plan_type,callProcessId:data.contact_id, sourceCallType:'callTaskSource',destinationCallType:'callTaskDestination'
                                                                }
                                                            } else {
                                                                var new_obj = {
                                                                    did: didNumber, source: sourceNumber, destination: destinationValue, sourceType: sourceType, ourceDuration: source_seconds, destinationDuration: destination_seconds, customer_id: id_user, uniqueId: uniqueId, did_provider_id: checkDidRes[0].outgoing_provider, user_id: user_id, id_department: id_department, regNumber: regNumber, callrecord: checkDidRes[0].callrecord, channel: checkDidRes[0].channels, planType: checkDidRes[0].plan_type,callProcessId:data.contact_id, sourceCallType:'callTaskSource',destinationCallType:'callTaskDestination'
                                                                }
                                                            }
                                                            return { new_obj: new_obj }     // Returning obj, new_obj, and response
                                                        }
                                                    } else {
                                                        var msg = { msg: "Not enough proper balance", status: false }
                                                        return msg
                                                    }
                                                } else {
                                                    var msg = { msg: "You are not eligible to make this call with this prefix", status: false }
                                                    return msg
                                                }
                                            } else {
                                                var msg = { msg: "There is no rate card selected", status: false }
                                                return msg
                                            }
                                        } else {
                                            var msg = { msg: "Not enough proper balance", status: false }
                                            return msg
                                        }
                                    }
                                } else {
                                    var msg = { msg: "This DID number is not active", status: false }
                                    return msg
                                }
                            } else {
                                var msg = { msg: "The destination number is in the blacklist and cannot be processed", status: false }
                                return msg
                            }
                        } else {
                            var msg = { msg: "This DID does not belong to this customer", status: false }
                            return msg
                        }
                    } else {
                        var msg = { msg: "This destination number is not valid", status: false }
                        return msg
                    }
                }
                
            }
        } else {
            var msg = { msg: "No contact exists with this id", status: false }
            return msg
        }
    } catch (err) {
        console.log(err);
        var msg = "err";
        return msg
    }
}
async function get_prefix(Value, rateRes) {           //Find the prefix and its corresponding sell rate
    try {
        var digit_6 = Value.toString().substring(0, 6);
        var digit_5 = Value.toString().substring(0, 5);
        var digit_4 = Value.toString().substring(0, 4);
        var digit_3 = Value.toString().substring(0, 3);
        var digit_2 = Value.toString().substring(0, 2);
        var creditValueData = rateRes.find(item => item.prefix == digit_6);
        if (!creditValueData)
            var creditValueData = rateRes.find(item => item.prefix == digit_5);
        if (!creditValueData)
            var creditValueData = rateRes.find(item => item.prefix == digit_4);
        if (!creditValueData)
            var creditValueData = rateRes.find(item => item.prefix == digit_3);
        if (!creditValueData)
            var creditValueData = rateRes.find(item => item.prefix == digit_2);
        if (creditValueData)
            return creditValueData        //Returning creditValueData if this prefix matches
    } catch (err) {
        console.error(err);
        return err
    }
}
function generateUniqueId() {
    // const prefix = "in";
    // const timestamp = Date.now();
    // const randomDigits = Math.floor(100000 + Math.random() * 900000);
    // return `${prefix}${timestamp}${randomDigits}`;
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Ensure 2 digits
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    return `${randomNum}${year}${month}${day}${hour}${minute}${second}`;
}
async function response(result, arrData) {
    try {
        if (result.dataType == 1) {    //datatype 1 is JSON 
            var jsonData = result.jsonData
            if (jsonData != undefined) {
                arrData.map(item => {
                    var placeholder = `$${item.renamedValue}$`;
                    jsonData = jsonData.replace(placeholder, item.value);
                });
                console.log("replaced jsondata response---------->", jsonData)
                console.log(jsonData);
                var responseData = jsonData
            }
        }  else if (result.dataType == 2) {    //datatype 2 is plain test
            var plainText = result.plainText;
            if (plainText != undefined) {
                arrData.map(item => {
                    var placeholder = `$${item.renamedValue}$`;
                    plainText = plainText.replace(placeholder, item.value);
                });
                console.log("plainText ---------->", plainText)
            }
            var responseData = plainText
        }else if (result.dataType == 3) {    //datatype 3 is form-data
            var input = new FormData();
            var dataForm = result.formData;
            if (dataForm != undefined) {
                const valueMapping = new Map(arrData.map(item => [item.renamedValue, item.value]));
                const updatedDataForm = dataForm.map(item => ({
                    ...item,
                    value: valueMapping.get(item.name) || item.value // Update if there's a matching value
                }));
                console.log("updatedDataform ---------->", updatedDataForm)
                console.log(updatedDataForm);
                updatedDataForm.map((item) => {
                    input.append(item.name, item.value);
                });
                console.log("input ---------->", input)
            }
            var responseData = input
        } else {
            var responseData = ''
        }
        return responseData         //Returning responseData
    } catch (err) {
        console.error(err);
        return err
    }
}
async function didSettings() {
    try {
        if (process.env.PRODUCTION == 'development') {
            var didsql = `SELECT id,did,missed_completion_by,missed_consideration FROM did WHERE (missed_completion_by = 1 or missed_consideration = 1 )`;
            var [didRes] = await getConnection.query(didsql);
            return didRes
        } else if (process.env.PRODUCTION == 'developmentLive' || process.env.PRODUCTION == 'live') {
            const redis = config.redis;
            var didsql = `SELECT id,did,missed_completion_by,missed_consideration FROM did WHERE (missed_completion_by = 1 or missed_consideration = 1 )`;
            var [didRes] = await getConnection.query(didsql);
            console.log("save didSettings --->", didRes);
            redis.set("didSettings", JSON.stringify(didRes));
        }
    } catch (err) {
        console.error(err);
        return err
    }
}
async function get_didSettings() {
    try {
        if (process.env.PRODUCTION == 'development') {
            var did = [
                { "id": "1", "did": "911212121214", "missed_completion_by": "0", "missed_consideration": "0" },
                { "id": "2", "did": "911212121212", "missed_completion_by": "0", "missed_consideration": "0" },
                { "id": "3", "did": "1313131314", "missed_completion_by": "0", "missed_consideration": "0" },
                { "id": "4", "did": "1313131315", "missed_completion_by": "0", "missed_consideration": "0" }
            ]
            return did
        } else if (process.env.PRODUCTION == 'developmentLive' || process.env.PRODUCTION == 'live') {
            const redis = config.redis;
            var cachedRedisStringData = await redis.get("didSettings");
            console.log("didSettings --->", cachedRedisStringData);
            var cachedRedisParseData = JSON.parse(cachedRedisStringData)
            return cachedRedisParseData
        }
    } catch (err) {
        console.error(err);
        return err
    }
}
async function did_update(didId) {
    try {
        var getDid = await get_didSettings()
        var didsql = `SELECT id,did,missed_completion_by,missed_consideration FROM did WHERE id = '${didId}'`;
        var [didRes] = await getConnection.query(didsql);
        if (didRes.length != 0) {
            const index = getDid.findIndex(item => item.id == didRes[0].id);
            if (index !== -1) {
                // Replace the object if found
                getDid[index] = didRes[0];
                console.log('Object replaced:', getDid);
            } else {
                // Add the new object if not found
                getDid.push(didRes[0]);
                console.log('Object added:', getDid);
            }
        }
        return getDid
    } catch (err) {
        console.error(err);
        return err
    }
}
async function get_subadmin_id(id_department,id_user) {
    try {
        var sql = `SELECT id_subadmin,id_dept FROM subadmin_departments JOIN subadmin ON subadmin.id = subadmin_departments.id_subadmin WHERE id_dept = '${id_department}' AND id_user = '${id_user}'`;
        var [result] = await getConnection.query(sql);
        return result
    } catch (err) {
        console.error(err);
        return err
    }
}

async function callflowSmsAxiosCall(callflowModuleId, phn_no) {
    try {

        var smsIdSql = `select id from call_flow_sms where call_flow_module_id = '${callflowModuleId}'`;
        var [smsIdSqlResult] = await getConnection.query(smsIdSql);
        if (smsIdSqlResult.length != 0) {
            var sms_id = smsIdSqlResult[0].id

            var callflowSmsSubResult = await callflowSubSms.find({ sms_id: sms_id });
            if (callflowSmsSubResult.length != 0) {
                var templateId = callflowSmsSubResult[0]._doc.template_id;
                var smsMsgVariables = callflowSmsSubResult[0]._doc.selected_values;
                var smsJsonVariables = callflowSmsSubResult[0]._doc.json_variables;
                var smsParamsVariables = callflowSmsSubResult[0]._doc.params_variable;
                // if (smsMsgVariables) {
                //   smsMsgVariables = smsMsgVariables.map(item => data[item] ? data[item] : item);
                // }
                if (smsJsonVariables.length != 0) {
                    smsJsonVariables = smsJsonVariables.map(item => {
                        if (item == '$phNo') {
                            return `${phn_no}`
                        }
                        else {
                            return data[item] ? data[item] : item;
                        }
                    });
                }
                if (smsParamsVariables.length != 0) {
                    smsParamsVariables = smsParamsVariables.map(item => {
                        var key = Object.keys(item)
                        if (item[key] == '$phNo') {
                            item[key] = phn_no
                            return item
                        }
                        else {
                            return data[item] ? data[item] : item;
                        }
                    });
                }
                var providerDataSms = await smsProviderModel.find({ _id: templateId });
                let smsMessage;
                if (providerDataSms.length != 0) {
                    var providerValuesHeadSms = await smsProviderHead.find({ sms_table_id: new ObjectId(templateId) });
                    providerValuesHeadSms = providerValuesHeadSms.reduce((acc, item) => {
                        if (item.name && item.value) {
                            acc[item.name] = item.value;
                        }
                        return acc;
                    }, {});

                    var providerValuesBodySms = await smsProviderBody.find({ sms_table_id: new ObjectId(templateId) });
                    // if(providerValuesBodySms.length != 0){
                    console.log("providerDataSms", providerDataSms)
                    if (providerDataSms[0].type != "JSON") {
                        var providerValuesBodySms = providerValuesBodySms.reduce((acc, item) => {
                            if (item.name && item.value) {
                                acc[item.name] = item.value;
                            }
                            return acc;
                        }, {});
                    }
                    console.log("2nd ---->")

                    // if (providerDataSms._doc && providerDataSms._doc.message) {
                    //   smsMessage = providerDataSms._doc.message.message;
                    //   if (smsMessage != undefined) {
                    //     smsMessage = smsMessage.replace(/\n/g, '\\n');
                    //     function replaceVariables(template, replacements) {
                    //       let resultsms = template;
                    //       replacements.map((variable, index) => {
                    //         resultsms = resultsms.replace('$variable$', variable);
                    //       });
                    //       return resultsms;
                    //     }
                    //     var stringSms = replaceVariables(smsMessage, smsMsgVariables);
                    //   }
                    // }

                    //   if (providerValuesBodySms != undefined && Object.keys(providerValuesBodySms).length != 0) {
                    var url = providerDataSms[0].url
                    console.log("url ---->", url)
                    const axiosConfigSms = {
                        method: providerDataSms[0].method.toLowerCase(),
                        url: providerDataSms[0].url
                    };
                    if (providerValuesHeadSms) {
                        axiosConfigSms.headers = providerValuesHeadSms
                    }
                    console.log("providerDataSms", providerDataSms)
                    if (providerDataSms[0].type == "JSON") {
                        var data = {}
                        console.log("providerDataSms", providerDataSms)
                        if (providerValuesBodySms != undefined) {
                            var str = providerValuesBodySms[0].smsJsonBodyData;
                            function replaceVariables(template, replacements) {
                                let resultSms = template;
                                replacements.map((variable, index) => {
                                    resultSms = resultSms.replace('$variable$', variable);
                                });
                                return resultSms;
                            }
                            if (smsJsonVariables.length != 0) {
                                str = replaceVariables(str, smsJsonVariables);
                            }
                            const value = JSON.parse(str);
                            axiosConfigSms.data = value;
                        } else {
                            axiosConfigSms.data = {}
                        }
                        console.log("axiosConfigSms", axiosConfigSms)
                    }
                    else if (providerDataSms[0].type == "www-form-urlencode") {
                        if (providerValuesBodySms != undefined) {
                            var data = {}
                            var bodyParams_key = Object.keys(providerValuesBodySms);
                            bodyParams_key.map((input_value) => {
                                var value = bodyParams[input_value];
                                if (value == '$variable') {
                                    function replaceVariables(template, replacements) {
                                        let resultSms = template;
                                        replacements.map((variable, index) => {
                                            resultSms = resultSms.replace('$variable$', variable);
                                        });
                                        return resultSms;
                                    }
                                    if (smsParamsVariables.length != 0) {
                                        str = replaceVariables(value, smsParamsVariables);
                                    }
                                    data[input_value] = str;

                                } else {
                                    data[input_value] = value;
                                }
                            })
                            data = qs.stringify(data);
                            var header = { 'Content-Type': 'application/x-www-form-urlencoded' }
                            axiosConfigSms.data = data;
                            axiosConfigSms.headers = header;
                        } else {
                            axiosConfigSms.data = {}
                        }
                    }
                    else if (providerDataSms[0].type == "form-data") {
                        var input = new FormData();
                        if (providerValuesBodySms != undefined) {
                            var bodyParams_key = Object.keys(providerValuesBodySms);
                            bodyParams_key.map((input_value) => {
                                var value = bodyParams[input_value];
                                if (value == '$variable$') {
                                    function replaceVariables(template, replacements) {
                                        let resultSms = template;
                                        replacements.map((variable, index) => {
                                            resultSms = resultSms.replace('$variable$', variable);
                                        });
                                        return resultSms;
                                    }
                                    if (smsParamsVariables.length != 0) {
                                        str = replaceVariables(value, smsParamsVariables);
                                    }
                                    input.append(input_value, str);
                                } else {
                                    input.append(input_value, value);
                                }
                            })
                            axiosConfigSms.data = input;
                        } else {
                            axiosConfigSms.data = {}
                        }
                    }
                    else {
                        if (providerValuesBodySms != undefined) {
                            url += "?";
                            var api_data_keys = Object.keys(providerValuesBodySms);
                            api_data_keys.map(async (input_value) => {
                                var value = providerValuesBodySms[input_value];
                                if (value == '$variable$') {
                                    function replaceVariables(template, replacements) {
                                        let resultSms = template;
                                        replacements.map((variable, index) => {
                                            var key = Object.keys(variable)
                                            resultSms = resultSms.replace('$variable$', variable[key]);
                                        });
                                        return resultSms;
                                    }
                                    if (smsParamsVariables.length != 0) {
                                        str = replaceVariables(value, smsParamsVariables);
                                    }
                                    url += input_value + "=" + str + "&"
                                } else {
                                    url += input_value + "=" + providerValuesBodySms[input_value] + "&"
                                }
                            })
                            axiosConfigSms.url = url
                        }
                    }
                    console.log("axiosConfigSms --->", axiosConfigSms)
                    var response = await callFlowAxios(axiosConfigSms)
                    return response
                    //   }
                    // } else {
                    //   var err = 'Message field is undefined in providerDataSms._doc'
                    //   console.error('Message field is undefined in providerDataSms._doc');
                    //   return err
                    // }
                } else {
                    var err = 'No providerDataSms found with the given ID'
                    console.error('No providerDataSms found with the given ID');
                    return err
                }
            } else {
                var err = 'smsTemplateId is undefined or falsy'
                console.error('smsTemplateId is undefined or falsy');
                return err
            }
        } else {
            var err = 'smsTemplateId is not found'
            console.error('smsTemplateId is not found');
            return err
        }
    } catch (err) {
        console.log(err);
        return err
    }
}
async function callflowWhatsappAxiosCall(callflowModuleId, phn_no) {
    try {

        var whatsappIdSql = `select id from call_flow_whatsapp where call_flow_module_id = '${callflowModuleId}'`;
        var [whatsappIdSqlResult] = await getConnection.query(whatsappIdSql);
        console.log("whatsappIdSqlResult=============================================================================", whatsappIdSqlResult)
        if (whatsappIdSqlResult.length != 0) {
            var whatsapp_id = whatsappIdSqlResult[0].id

            var callflowWhatsappSubResult = await callflowSubWhatsapp.find({ whatsapp_id: whatsapp_id });
            if (callflowWhatsappSubResult.length != 0) {
                var templateId = callflowWhatsappSubResult[0]._doc.template_id;
                var whatsappMsgVariables = callflowWhatsappSubResult[0]._doc.selected_values;
                var whatsappJsonVariables = callflowWhatsappSubResult[0]._doc.json_variables;
                var whatsappParamsVariables = callflowWhatsappSubResult[0]._doc.params_variable;
                // if (whatsappMsgVariables) {
                //   whatsappMsgVariables = whatsappMsgVariables.map(item => data[item] ? data[item] : item);
                // }
                if (whatsappJsonVariables.length != 0) {
                    whatsappJsonVariables = whatsappJsonVariables.map(item => {
                        if (item == '$phNo') {
                            return `${phn_no}`
                        }
                        else {
                            return data[item] ? data[item] : item;
                        }
                    });
                }
                if (whatsappParamsVariables.length != 0) {
                    whatsappParamsVariables = whatsappParamsVariables.map(item => {
                        var key = Object.keys(item)
                        if (item[key] == '$phNo') {
                            item[key] = phn_no
                            return item
                        }
                        else {
                            return data[item] ? data[item] : item;
                        }
                    });
                }
                var providerDataWhatsapp = await whatsappProviderModel.find({ _id: templateId });
                console.log("providerDataWhatsapp=========================================================================================", providerDataWhatsapp)
                if (providerDataWhatsapp.length != 0) {
                    var providerValuesHeadWhatsapp = await whatsappProviderHead.find({ whatsapp_table_id: new ObjectId(templateId) });
                    providerValuesHeadWhatsapp = providerValuesHeadWhatsapp.reduce((acc, item) => {
                        if (item.name && item.value) {
                            acc[item.name] = item.value;
                        }
                        return acc;
                    }, {});
                    var providerValuesBodyWhatsapp = await whatsappProviderBody.find({ whatsapp_table_id: new ObjectId(templateId) });
                    console.log("providerValuesBodyWhatsapp=====================================================================================", providerValuesBodyWhatsapp)
                    if (providerValuesBodyWhatsapp.length) {
                        smsMessage = providerDataWhatsapp[0].message.message;
                        if (providerDataWhatsapp[0].type != "JSON") {
                            var providerValuesBodySms = providerValuesBodySms.reduce((acc, item) => {
                                if (item.name && item.value) {
                                    acc[item.name] = item.value;
                                }
                                return acc;
                            }, {});
                        }
                        var url = providerDataWhatsapp[0].url
                        const axiosConfigWhatsapp = {
                            method: providerDataWhatsapp[0].method.toLowerCase(),
                            url: providerDataWhatsapp[0].url
                        };
                        if (providerValuesHeadWhatsapp) {
                            axiosConfigWhatsapp.headers = providerValuesHeadWhatsapp
                        }

                        //    if (providerDataSms && providerDataSms[0].message) {
                        //   smsMessage = providerDataSms[0].message.message;
                        //   if (smsMessage != undefined) {
                        //     smsMessage = smsMessage.replace(/\n/g, '\\n');
                        //     function replaceVariables(template, replacements) {
                        //       let resultsms = template;
                        //       replacements.map((variable, index) => {
                        //         resultsms = resultsms.replace('$variable$', variable);
                        //       });
                        //       return resultsms;
                        //     }
                        //     var stringSms = replaceVariables(smsMessage, whatsappMsgVariables);
                        //   }
                        // }


                        if (providerDataWhatsapp[0].type == "JSON") {
                            var data = {}
                            if (providerValuesBodyWhatsapp != undefined) {
                                var str = providerValuesBodyWhatsapp[0].whatsappJsonBodyData;
                                // str = str.replace('$message', stringSms);
                                function replaceVariables(template, replacements) {
                                    let resultSms = template;
                                    replacements.map((variable, index) => {
                                        resultSms = resultSms.replace('$variable$', variable);
                                    });
                                    return resultSms;
                                }
                                str = replaceVariables(str, whatsappJsonVariables);
                                const value = JSON.parse(str);
                                axiosConfigWhatsapp.data = value;
                            } else {
                                axiosConfigWhatsapp.data = {}
                            }
                        }
                        else if (providerDataWhatsapp[0].type == "www-form-urlencode") {
                            if (providerValuesBodyWhatsapp != undefined) {
                                var data = {}
                                var bodyParams_key = Object.keys(providerValuesBodyWhatsapp);
                                bodyParams_key.map((input_value) => {
                                    var value = bodyParams[input_value];
                                    // if (value == '$message') {
                                    //     data[input_value] = stringSms;
                                    // } else {
                                    //     if (value == '$variable$') {
                                    //         function replaceVariables(template, replacements) {
                                    //             let resultSms = template;
                                    //             replacements.map((variable, index) => {
                                    //                 resultSms = resultSms.replace('$variable$', variable);
                                    //             });
                                    //             return resultSms;
                                    //         }
                                    //         if (whatsappParamsVariables.length != 0) {
                                    //             str = replaceVariables(value, whatsappParamsVariables);
                                    //         }
                                    //         data[input_value] = str;
                                    //     } else {
                                    //         data[input_value] = value;
                                    //     }
                                    // }

                                    if (value == '$variable') {
                                        function replaceVariables(template, replacements) {
                                            let resultSms = template;
                                            replacements.map((variable, index) => {
                                                resultSms = resultSms.replace('$variable$', variable);
                                            });
                                            return resultSms;
                                        }
                                        if (whatsappParamsVariables.length != 0) {
                                            str = replaceVariables(value, whatsappParamsVariables);
                                        }
                                        data[input_value] = str;
                                    } else {
                                        data[input_value] = value;
                                    }
                                })

                                data = qs.stringify(data);
                                var header = { 'Content-Type': 'application/x-www-form-urlencoded' }
                                axiosConfigWhatsapp.data = data;
                                axiosConfigWhatsapp.headers = header;
                            } else {
                                axiosConfigWhatsapp.data = {}
                            }
                        }
                        else if (providerDataWhatsapp[0].type == "form-data") {
                            var input = new FormData();
                            if (providerValuesBodyWhatsapp != undefined) {
                                var bodyParams_key = Object.keys(providerValuesBodyWhatsapp);
                                bodyParams_key.map((input_value) => {
                                    var value = bodyParams[input_value];
                                    // if (value == '$message') {
                                    //     input.append(input_value, stringSms);
                                    // } else {
                                    //     if (value == '$variable$') {
                                    //         function replaceVariables(template, replacements) {
                                    //             let resultSms = template;
                                    //             replacements.map((variable, index) => {
                                    //                 resultSms = resultSms.replace('$variable$', variable);
                                    //             });
                                    //             return resultSms;
                                    //         }
                                    //         if (whatsappParamsVariables.length != 0) {
                                    //             str = replaceVariables(value, whatsappParamsVariables);
                                    //         }
                                    //         input.append(input_value, str);
                                    //     } else {
                                    //         input.append(input_value, value);
                                    //     }
                                    // }


                                    if (value == '$variable') {
                                        function replaceVariables(template, replacements) {
                                            let resultSms = template;
                                            replacements.map((variable, index) => {
                                                resultSms = resultSms.replace('$variable$', variable);
                                            });
                                            return resultSms;
                                        }
                                        if (whatsappParamsVariables.length != 0) {
                                            str = replaceVariables(value, whatsappParamsVariables);
                                        }
                                        input.append(input_value, str);
                                    } else {
                                        input.append(input_value, value);
                                    }
                                })
                                axiosConfigWhatsapp.data = input;
                            } else {
                                axiosConfigWhatsapp.data = {}
                            }
                        }
                        else {
                            if (providerValuesBodyWhatsapp != undefined) {
                                url += "?";
                                var api_data_keys = Object.keys(providerValuesBodyWhatsapp);
                                api_data_keys.map(async (input_value) => {
                                    var value = providerValuesBodyWhatsapp[input_value];

                                    // if (value == '$message') {
                                    //     url += input_value + "=" + stringSms + "&"
                                    // } else {
                                    //     if (value == '$variable$') {
                                    //         function replaceVariables(template, replacements) {
                                    //             let resultSms = template;
                                    //             replacements.map((variable, index) => {
                                    //                 resultSms = resultSms.replace('$variable$', variable);
                                    //             });
                                    //             return resultSms;
                                    //         }
                                    //         if (whatsappParamsVariables.length != 0) {
                                    //             str = replaceVariables(value, whatsappParamsVariables);
                                    //         }
                                    //         url += input_value + "=" + str + "&"
                                    //     } else {
                                    //         url += input_value + "=" + providerValuesBodyWhatsapp[input_value] + "&"
                                    //     }
                                    // }

                                    if (value == '$variable$') {
                                        function replaceVariables(template, replacements) {
                                            let resultSms = template;
                                            replacements.map((variable, index) => {
                                                resultSms = resultSms.replace('$variable$', variable);
                                            });
                                            return resultSms;
                                        }
                                        if (whatsappParamsVariables.length != 0) {
                                            str = replaceVariables(value, whatsappParamsVariables);
                                        }
                                        url += input_value + "=" + str + "&"
                                    } else {
                                        url += input_value + "=" + providerValuesBodyWhatsapp[input_value] + "&"
                                    }
                                })
                                axiosConfigWhatsapp.url = url
                            }
                        }
                        console.log("axiosConfigWhatsapp==================================================================================================", axiosConfigWhatsapp)
                        var response = await callFlowAxios(axiosConfigWhatsapp)
                        return response
                    }
                } else {
                    var err = 'No providerDataWhatsapp found with the given ID'
                    console.error('No providerDataWhatsapp found with the given ID');
                    return err
                }
            } else {
                var err = 'whatappTemplateId is undefined or falsy'
                console.error('whatappTemplateId is undefined or falsy');
                return err
            }
        } else {
            var err = 'whatappTemplateId is found'
            console.error('whatappTemplateId is found');
            return err
        }
    } catch (err) {
        console.log(err);
        return err
    }
}
async function callflowApiAxiosCall(callflowModuleId, phn_no) {
    try {

        var apiIdSql = `select id from call_flow_integration_api where call_flow_module_id = '${callflowModuleId}'`;
        var [apiIdSqlResult] = await getConnection.query(apiIdSql);
        console.log("apiIdSqlResult==================================================================================================", apiIdSqlResult)
        if (apiIdSqlResult.length != 0) {
            var api_id = apiIdSqlResult[0].id

            var callflowApiSubResult = await callTemplateApiModelSub.find({ api_id: api_id });
            console.log("callflowApiSubResult==================================================================================================", callflowApiSubResult)
            if (callflowApiSubResult.length != 0) {
                var templateId = callflowApiSubResult[0]._doc.template_id;
                var apiMsgVariables = callflowApiSubResult[0]._doc.selected_values;
                var apiJsonVariables = callflowApiSubResult[0]._doc.json_variables;
                var apiParamsVariables = callflowApiSubResult[0]._doc.params_variable;
                // if (apiMsgVariables) {
                //   apiMsgVariables = apiMsgVariables.map(item => data[item] ? data[item] : item);
                // }
                if (apiJsonVariables.length != 0) {
                    apiJsonVariables = apiJsonVariables.map(item => {
                        if (item == '$phNo') {
                            return `${phn_no}`
                        }
                        else {
                            return data[item] ? data[item] : item;
                        }
                    });
                }
                if (apiParamsVariables.length != 0) {
                    apiParamsVariables = apiParamsVariables.map(item => {
                        var key = Object.keys(item)
                        if (item[key] == '$phNo') {
                            item[key] = phn_no
                            return item
                        }
                        else {
                            return data[item] ? data[item] : item;
                        }
                    });
                }
                var providerDataApi = await apiProviderModel.find({ _id: templateId });
                console.log("providerDataApi==================================================================================================", providerDataApi)
                if (providerDataApi.length != 0) {
                    var providerValuesHeadApi = await apiProviderHead.find({ api_table_id: new ObjectId(templateId) });
                    providerValuesHeadApi = providerValuesHeadApi.reduce((acc, item) => {
                        if (item.name && item.value) {
                            acc[item.name] = item.value;
                        }
                        return acc;
                    }, {});
                    var providerValuesBodyApi = await apiProviderBody.find({ api_table_id: new ObjectId(templateId) });
                    if (providerValuesBodyApi.length) {
                        if (providerDataApi[0].type != "JSON") {
                            var providerValuesBodyApi = providerValuesBodyApi.reduce((acc, item) => {
                                if (item.name && item.value) {
                                    acc[item.name] = item.value;
                                }
                                return acc;
                            }, {});
                        }

                        var url = providerDataApi[0].url
                        const axiosConfigSms = {
                            method: providerDataApi[0].method.toLowerCase(),
                            url: providerDataApi[0].url
                        };
                        if (providerValuesHeadApi) {
                            axiosConfigSms.headers = providerValuesHeadApi
                        }
                        if (providerDataApi[0].type == "JSON") {
                            var data = {}
                            if (providerValuesBodyApi != undefined) {
                                var str = providerValuesBodyApi[0].apiJsonBodyData;
                                function replaceVariables(template, replacements) {
                                    let resultSms = template;
                                    replacements.map((variable, index) => {
                                        resultSms = resultSms.replace('$variable$', variable);
                                    });
                                    return resultSms;
                                }
                                str = replaceVariables(str, apiJsonVariables);
                                const value = JSON.parse(str);
                                axiosConfigSms.data = value;
                            } else {
                                axiosConfigSms.data = {}
                            }
                        }
                        else if (providerDataApi[0].type == "www-form-urlencode") {
                            if (providerValuesBodyApi != undefined) {
                                var data = {}
                                var bodyParams_key = Object.keys(providerValuesBodyApi);
                                bodyParams_key.map((input_value) => {
                                    var value = bodyParams[input_value];
                                    if (value == '$variable$') {
                                        function replaceVariables(template, replacements) {
                                            let resultSms = template;
                                            replacements.map((variable, index) => {
                                                resultSms = resultSms.replace('$variable$', variable);
                                            });
                                            return resultSms;
                                        }
                                        if (apiParamsVariables.length != 0) {
                                            str = replaceVariables(value, apiParamsVariables);
                                        }
                                        data[input_value] = str;
                                    } else {
                                        data[input_value] = value;
                                    }
                                })
                                data = qs.stringify(data);
                                var header = { 'Content-Type': 'application/x-www-form-urlencoded' }
                                axiosConfigSms.data = data;
                                axiosConfigSms.headers = header;
                            } else {
                                axiosConfigSms.data = {}
                            }
                        }
                        else if (providerDataApi[0].type == "form-data") {
                            var input = new FormData();
                            if (providerValuesBodyApi != undefined) {
                                var bodyParams_key = Object.keys(providerValuesBodyApi);
                                bodyParams_key.map((input_value) => {
                                    var value = bodyParams[input_value];
                                    if (value == '$variable$') {
                                        function replaceVariables(template, replacements) {
                                            let resultSms = template;
                                            replacements.map((variable, index) => {
                                                resultSms = resultSms.replace('$variable$', variable);
                                            });
                                            return resultSms;
                                        }
                                        if (apiParamsVariables.length != 0) {
                                            str = replaceVariables(value, apiParamsVariables);
                                        }
                                        input.append(input_value, str);
                                    } else {
                                        input.append(input_value, value);
                                    }
                                })
                                axiosConfigSms.data = input;
                            } else {
                                axiosConfigSms.data = {}
                            }
                        }
                        else {
                            if (providerValuesBodyApi != undefined) {
                                url += "?";
                                var api_data_keys = Object.keys(providerValuesBodyApi);
                                api_data_keys.map(async (input_value) => {
                                    var value = providerValuesBodyApi[input_value];
                                    if (value == '$variable$') {
                                        function replaceVariables(template, replacements) {
                                            let resultSms = template;
                                            replacements.map((variable, index) => {
                                                var key = Object.keys(variable)
                                                // variable[key] = phn_no
                                                resultSms = resultSms.replace('$variable$', variable[key]);
                                            });
                                            return resultSms;
                                        }
                                        if (apiParamsVariables.length != 0) {
                                            str = replaceVariables(value, apiParamsVariables);
                                        }
                                        url += input_value + "=" + str + "&"
                                    } else {
                                        url += input_value + "=" + providerValuesBodyApi[input_value] + "&"
                                    }
                                })
                                axiosConfigSms.url = url
                            }
                        }
                        console.log(axiosConfigSms)
                        console.log("axiosConfigApi==================================================================================================", axiosConfigSms)
                        var response = await callFlowAxios(axiosConfigSms)
                        return response
                    }

                } else {
                    var err = 'No providerDataApi found with the given ID'
                    console.error('No providerDataApi found with the given ID');
                    return err
                }
            } else {
                var err = 'apiTemplateId is undefined or falsy'
                console.error('apiTemplateId is undefined or falsy');
                return err
            }
        } else {
            var err = 'apiTemplateId is not found'
            console.error('apiTemplateId is not found');
            return err
        }
    } catch (err) {
        console.log(err);
        return err
    }
}
async function callFlowAxios(axiosConfigApi) {
    try {
        console.log(axiosConfigApi)
        var axios = require('axios');
        const axiosResponseApi = await axios(axiosConfigApi);
        console.log(axiosResponseApi.data);
        return axiosResponseApi.data
    } catch (err) {
        console.log(err);
        return err
    }
}
async function add_call_transfer(data) {
    try {
        var currentDate = new Date();
        var obj = {
            id_user: data.id_user,
            id_department: data.id_department,
            from_user_id: data.from_user_id,
            to_user_id: data.to_user_id,
            time: currentDate,
            call_start_time: data.call_start_time,
            answered_time: data.answered_time,
            uniqueid: data.uniqueid,
            cost: data.cost
        }
        var result = await calltransferModel.create(obj);
        return result
    } catch (err) {
        console.error(err);
    }
}
async function get_call_transfer() {
    try {
        var result = await calltransferModel.findAll();
        return result
    } catch (err) {
        console.error(err);
    }
}

async function get_trieduser(data) {
    try {
        var result = data.slice(1).map(item => item.userId);
        console.log(result)
        result = result.join(',');
        console.log(result)
        return result
    } catch (err) {
        console.error(err);
    }
}
async function send_sms_rate(id_user) {
    var rateObj = {
        rate: 1
    }
    var msg = 'smsRateCalculation'
    var socket = await adminSocket(id_user, msg, rateObj);
    return socket
}
async function call_task_end(user_id,callProcessId) {
    var obj ={
        user_id : user_id,
        contact_id : callProcessId?.split("|")[0],
    }
    var msg = 'endCallTaskClickToCall'
    var socket = await userSocket(user_id, msg, obj);
    return socket
}

async function update_pop_status(user_id) {
    try {
        var sql = ` select id,call_on_popup from user_settings where user_id = ${user_id} and call_on_popup = 1`
        var [userResult] = await getConnection.query(sql)
        if (userResult.length != 0) {
            if (userResult[0].call_on_popup == 1) {
                var result = await userLiveData.update(
                    { popup_status: 0 },
                    { where: { user_id: user_id } }
                );

                //byot
                const customerInfo = await User.findByPk(user_id, { attributes: ["id", "id_user"] });
                callByotApi("PUT", `/user/${user_id}/update-livedata`, { data: { popup_status: 0 }}, undefined, undefined, customerInfo.id_user);
                
                return result[0]
            }
            else {
                return 0
            }
        }
        else {
            var err = 'user call_on_popup not found'
            console.error('user call_on_popup not found');
            return err
        }
    } catch (error) {
        console.log(error);
    }
}
async function update_call_task_contacts(id,call_result,call_status,answeredTime ) {
    try {

        const [_id, calltype = "1"] = (id || "").split("|");

        if (calltype === "3" && call_status) { // autox service call
        return await AutoxServices.updateOne({ _id }, { $set: { call_status } });
        } else if (calltype === "4" && call_status) { // autox insurance call
        return await AutoxInsurance.updateOne({ _id }, { $set: { call_status } });
        }
                
        if(answeredTime != undefined){
            var result = await CallTaskContacts.updateOne(
                { _id }, 
                { $set: { call_status: call_status, call_result: call_result, answeredTime:answeredTime } } 
            );
        }else{
            var result = await CallTaskContacts.updateOne(
                { _id }, 
                { $inc: { retryCount: 1 } }
            );
        }
        console.log("update_call_task_contacts ------>",result)
        return result
    } catch (error) {
        console.log(error);
    }
}

async function get_user_data(regNumber) {
    try {
        var sql = `SELECT user_id,regNumber FROM user_settings WHERE regNumber = '${regNumber}'`
        var [userResult] = await getConnection.query(sql)
        if(userResult.length != 0){
            return userResult[0].user_id 
        }else{
            return 0
        }
    } catch (error) {
        console.log(error);
    }
}
async function get_userid_by_extnumber(extNumber,deptId,id_user) {
    try {
        if (deptId == '') {
            deptId = 0
        }
        console.log("dept id ---------->",deptId)
        var sql = `SELECT user_id,extNumber FROM user_settings left join user on user.id = user_settings.user_id WHERE extNumber = '${extNumber}' and user.id_user = '${id_user}' and id_department = '${deptId}' `
        var [userResult] = await getConnection.query(sql)
        if(userResult.length != 0){
            return userResult[0].user_id 
        }else{
            return 0
        }
    } catch (error) {
        console.log(error);
    }
}
async function smartgroup_missedcall_user(appId) {
    try {
        var smargroupSql = `SELECT show_missedcall_to FROM smart_group WHERE id = '${appId}'`;
        var [smargroupRes] = await getConnection.query(smargroupSql);
        return smargroupRes
    } catch (error) {
        console.log(error)
    }
}
async function firebasepushnotification(userId, sourceNumber,deptId,id_user) {
    try {
        
        var admin = require("firebase-admin");
        if (!admin.apps.length) {
            var serviceAccount = require("../voxbay-app-firebase-adminsdk-ku5k3-b4ebc265f2.json");
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
        if (userId != undefined) {
            var fcm_tokenSql = `SELECT fcm_token FROM user_settings WHERE user_id = '${userId}'`;
            var [fcm_token] = await getConnection.query(fcm_tokenSql);
            const contact_data = await contactsModel.findOne(
                { phone_number: sourceNumber, id_user: id_user, id_department: Number(deptId || 0) }, 
                { name: 1, phone_number: 1, _id: 0 }
            ).lean();  
            const contatNumber = { "phone": sourceNumber };
            let iosContatNumber = sourceNumber
if (contact_data?.name) {
    contatNumber.name = contact_data.name;
    iosContatNumber = sourceNumber + " (" + contact_data.name + ")"
}         
            contact_data?.name ? sourceNumber = `${sourceNumber} (${contact_data?.name})` : sourceNumber
            console.log("firbase notifcation ---------->")
        console.log("sourceNumber  --->",sourceNumber)
        console.log("contatNumber  --->",contatNumber)
            if (fcm_token.length != 0) {
                const fcmToken = fcm_token[0].fcm_token;
                console.log("inner event", fcmToken);
                if(fcmToken != undefined){
                    // const message = { notification: { title: "notification", body: iosContatNumber },
                    //  data: { title: "notification", body: JSON.stringify(contatNumber) },
                    //   token: fcmToken, apns: { payload: { aps: { sound: 'default'}}}
                    // };

                    const message = { data: { title: "notification", body: JSON.stringify(contatNumber) },
                     token: fcmToken, apns: 
                     { payload: { aps: { sound: 'default', alert: { title: "notification", body: iosContatNumber}}}}};

                    admin.messaging().send(message).then((resp) => {
                        console.log(resp)
                    }).catch((err) => {
                        console.log(err)
                    });
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}
async function popup_end(data) {
    var currentDate = new Date();
    var dtmfObj = {
        phnNo: data.callerNumber,
        agentId: data.userId,
        time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
        event: 'end',
        currentCallStatus: 5,
        id: data.uniqueId,
        regNumber:data.userId,
        type: data.type,
        didNumber: data.didNumber,
    }
    var msg1 = 'userPopupEnd'
    console.log("userPopupEnd.................")
    console.log("popup end Obj.................",dtmfObj)
    console.log("popup end userId.................",data.userId)
    var socket1 = await userSocket(data.userId, msg1, dtmfObj);
    return socket1
}
async function transfer_call_popup(data) {
    var currentDate = new Date();
    var dtmfObj = {
        id: data.uniqueId,
        phnNo: data.source,
        type: data.type,
        time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
        extNumber: data.extNumber,
        event: 'start'
    }
    var msg1 = 'transferCallPopup'
    console.log("transferCallPopup.................")
    console.log("transfer userId.................",data.userId)
    var socket1 = await userSocket(data.userId, msg1, dtmfObj);
    return socket1
}
async function get_user_status_first_tried(data,user_id) {
    try {
        console.log("data inside the get_user_status function ---------->",data)
        console.log("user_id inside the get_user_status function ---------->",user_id)
        if (data.length != 0) {
            var userIdData = data.filter(item => item.eventStatus === 'dial_end');
            console.log("dial end cachedRedisParseData ----->", userIdData[0])
            return userIdData[0]
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}
async function get_user_status_last_tried(data,user_id) {
    try {
        console.log("data inside the get_user_status function ---------->",data)
        console.log("user_id inside the get_user_status function ---------->",user_id)
        if (data.length != 0) {
            var userIdData = data.filter(item => item.eventStatus === 'dial_end');
            console.log("dial end cachedRedisParseData ----->",  userIdData[userIdData.length - 1])
            return userIdData[userIdData.length - 1]
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}
async function add_user_call_reports_api(data) {
    try {
        var result = await userReportModel.insertMany(data);
        return result
    } catch (err) {
        console.error(err);
    }
}
async function call_transfer_report(liveData, callData) {
    try {
        console.log("transfer call report liveData --------------->", liveData)
        console.log("transfer call report callData --------------->", callData)
        // const transfer_from_data = await userReportModel.find({uniqueId:liveData.parentUniqueId})
        const user_id = liveData.userId
        const callstarttime = new Date(liveData.transferCallStartTime);
        const callendtime = new Date(liveData.endTime);
        const durationInMilliseconds = callendtime - callstarttime;
        const transfer_call_durationInSeconds = Math.abs(durationInMilliseconds / 1000);
        var obj = {
            id_user: liveData.customerId,
            id_department: liveData.deptId,
            uniqueId: liveData.uniqueId,
            parentUniqueId: liveData.parentUniqueId,
            landed_agent: user_id,
            transfered_agent: user_id,
            transfer_time: liveData.transferCallStartTime,
            transfer_duration: transfer_call_durationInSeconds,
            application: liveData.app,
            call_end_time: liveData.endTime,
            call_landed_department: liveData.deptId,
            transfer_call_status: liveData.callStatus,
            first_attempted_agent: liveData.transferFrom,
            transfer_call_recording: callData.crFile,
            final_application: liveData.final_application,
            initial_application: liveData.initial_application,
            call_type: liveData.direction,
            call_recording: liveData.parentCrFile,
            first_call_end_time: liveData.parentCallendTime,
            call_start_time: liveData.eventTime,
            final_app_id: liveData.final_app_id,
            initial_app_id: liveData.initial_app_id,
        }
        // obj.transfer_department = transfer_from_data[0]._doc.deptId;
        const callstarttimeTotal = new Date(liveData.eventTime);
        const callendtimeTotal = new Date(liveData.endTime);
        const durationInMillisecondsTotal = callstarttimeTotal - callendtimeTotal;
        const transfer_call_durationInSeconds_total = Math.abs(durationInMillisecondsTotal / 1000);
        obj.call_duration = transfer_call_durationInSeconds_total
        if (liveData.direction == "outgoing") {
            obj.customer_number = liveData.dialedNumber;
        }
        if (liveData.direction == "incoming") {
            obj.customer_number = liveData.callerNumber;
        }
        if(liveData.transferAnsweredTime != undefined){
            obj.transfer_call_status = "ANSWERED"
        }else{
            obj.transfer_call_status = "FAILED"
        }
        console.log("transfer call report data --------------->", obj)
        return await transferCallReportModel.create(obj);
    } catch (err) {
        console.error(err);
    }
}

function emit_autox_call_popup(uniqueNum, agentChannel, channel, agentId) {
    console.log("---------emit autox call popup---------------");
    try {
        if(!uniqueNum || !agentChannel || !channel || !agentId) return;
        
        let socketData = {
            channel,
            agentChannel,
            uniqueNum
        }
        userSocket(agentId, "autox-call-popup", socketData);
    } catch (error) {
        console.log(error)
    }
}

function user_call_answered(uniqueNum, agentChannel, channel, agentId) {
    console.log("[SOCKET] Attempting to emit 'user_call_answered' event...");
    try {
        if(!uniqueNum || !agentChannel || !channel || !agentId) {
            console.log("[SOCKET] Emission blocked. Missing required fields:");
            console.table({ uniqueNum, agentChannel, channel, agentId });
            console.log("Event 'user_call_answered' was NOT emitted.");
            return;
        };
        
        let socketData = {
            channel,
            agentChannel,
            uniqueNum
        }
        userSocket(agentId, "user_call_answered", socketData);
    } catch (error) {
        console.log(error)
    }
}

async function add_autox_calllog(data) {
    try {

        console.log("add_autox_calllog data ---->",data)
        
        var obj = {
            uniqueId : data[0].uniqueId,
            phnNo : data[0].dialedNumber,
            userId : data[0].userId,
            eventTime : data[0].eventTime,
            id_user: data[0].customerId ? data[0].customerId*1 : undefined,
        }

        const [processedId = "", calltype = 1] = data[0].callProcessId?.split("|") ?? "";
        // data[0].callProcessId = processedId;
        
        if(calltype == 1 || calltype == 2) {
            if (processedId != undefined) {
                obj.contact_id = new ObjectId(processedId)
            }

            var result = await CallTaskContacts.find({ _id : ObjectId(processedId) });
            if (result.length != 0) {
                console.log("result ---->",result)
                var callTaskData = await CallTask.find({ _id : ObjectId(result[0].call_task_id) });
                if(callTaskData.length != 0){
                    console.log("callTaskData ---->",callTaskData)
                    obj.callTaskName = callTaskData[0].name
                    obj.customer_id = callTaskData[0].customer_id
                }
            }
        }else if(calltype == 3){  //service

            const service = await AutoxServices.findOne({ _id: processedId });
            obj.customer_id = service?.customer_id;
            
            obj.callTaskName =  "Service call";
        }else if(calltype == 4) { //insurance

            const insurance = await AutoxInsurance.findOne({ _id: processedId });
            obj.customer_id = insurance?.customer_id;

        }

        const newDocument = new autoxCalllog(obj);
        const savedDocument = await newDocument.save();
        return savedDocument
    } catch (err) {
        console.log(err);
        return err
    }
}
async function getCallflowName(module_id,data) {
     var sql = `SELECT ivr_id,call_flow.name FROM call_flow_ivr join call_flow on call_flow.id = call_flow_ivr.ivr_id WHERE call_flow_module_id = ${module_id}`
        var [ivrResult] = await getConnection.query(sql)
        console.log("ivrResult --------->",ivrResult);
        if(ivrResult.length != 0){
            let app_target_id = ivrResult[0].ivr_id;
            let appName = ivrResult[0].name
            if(data.app_target_id != undefined){
                data.app_target_id = data.app_target_id + ","+ app_target_id
            }else{
                data.app_target_id = data.appId + "," + app_target_id
            }
            
              var connectObj = {
            uniqueId: data.uniqueId,
            appName: appName
        }
        console.log("ivrResult --------->",ivrResult);
        var id_user = data.customerId
        var id_department = data.deptId;
        
        var msg1 = 'connectLiveCallReport'
        var socket1 = await adminSocket(id_user, msg1, connectObj);
        var socket2 = await departmentSocket(id_department, msg1, connectObj);
        }
        
}
module.exports = {
    add_livecall,
    update_livecall,
    delete_livecall,
    add_incomingcall,
    add_unique_missedcall,
    add_outgoingcall,
    insert_callreport,
    smart_group_monitoring,
    smart_group_livecall,
    smart_group_user_availble_status,
    update_smartgroup,
    insert_smartgroup_report,
    insert_callflow_report,
    check_exsist_module_id,
    data_based_on_first_user_id,
    get_smartgroup_datas,
    get_dtmf_sequence,
    get_live_data,
    get_userId_by_call_flow_module_id,
    livecall_dtmf,
    add_user_call_reports,
    click_to_call,
    connect_with_call_flow,
    connect_with_smartgroup,
    call_task_click_to_call,
    didSettings,
    did_update,
    callflowSmsAxiosCall,
    callflowWhatsappAxiosCall,
    callflowApiAxiosCall,
    add_call_transfer,
    get_call_transfer,
    get_trieduser,
    get_subadmin_id,
    send_sms_rate,
    call_task_end,
    update_pop_status,
    update_call_task_contacts,
    get_user_data,
    get_userid_by_extnumber,
    smartgroup_missedcall_user,
    firebasepushnotification,
    popup_end,
    transfer_call_popup,
    get_user_status_first_tried,
    get_user_status_last_tried,
    add_user_call_reports_api,
    call_transfer_report,
    emit_autox_call_popup,
    add_autox_calllog,
    getCallflowName,
    user_call_answered,
}
