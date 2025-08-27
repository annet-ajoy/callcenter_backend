const sequelize = require('../database').db;
const getConnection = require('../database').getConnection;
var incomingCallReportModel = require('../model/incomingCallReportModel')
var cc_outgoingCallReportModel = require('../model/cc_outgoingCallReportModel')
var livecallModel = require('../model/livecallsModel')
// var missedcallReportModel = require('../model/missedcallReportModel')
const callByotApi = require('../helper/callByotApi');


const { adminSocket,userSocket } = require('./socket');

async function add_livecall(data,callType) {
    try {
        var currentDate = new Date();
        var obj = {
            id: data.uniqueId,
            phnNo: data.source,
            type: data.type,
            time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
            didNumber: data.destination,
            event: 'start'
        }
        if (data.type == 'incoming') {
            obj.currentCallStatus = 1
        } if (data.type == 'outgoing') {
            obj.currentCallStatus = 3
        }
        if (data.user_id != undefined) {
            obj.agentId = data.user_id;
            var msg3 = 'userCallStartPopup'
            var socket3 = await userSocket(data.user_id, msg3, obj);
            var msg2 = 'startAdminMonitoring'
            var socket2 = await adminSocket(data.user_id, msg2, obj);
        }
        var result = await livecallModel.create(data);
        //byot 
        callByotApi("POST", "/call/add-to-live", { data: { ...data, id: result.id } }, undefined, undefined, data.id_user);
        
        var msg1 = 'startLiveCallReport'
        var socket1 = await adminSocket(data.id_user, msg1);
        var msg4 = 'adminDashboardLivecall'
        var socket4 = await adminSocket(data.id_user, msg4);
        if(callType == 'smartgroup') smart_group_monitoring({id:data.appId,id_user:data.id_user})
        return result
    } catch (err) {
        console.error(err);
    }
}
async function update_livecall(data, uniqueId,module) {
    try {
        // var result = await livecallModel.updateOne({ uniqueId: uniqueId }, { $set: data });
        var result = await livecallModel.update(data, { where: { uniqueId: uniqueId } });
        //byot
        callByotApi("PATCH", `/call/${data.id_user}/${uniqueId}/update-live`, { data }, undefined, undefined, data.id_user);
        
        // var data = await livecallModel.findOne( { uniqueId: uniqueId } );
        var data = await livecallModel.findOne( { where: { uniqueId: uniqueId } });
        var id_user = data.dataValues.id_user
        var type = data.dataValues.type
        var user_id = data.dataValues.user_id
        if(module == 'smartgroup'){
            smart_group_monitoring({id:data.dataValues.appId,id_user:id_user})
        }
        var msg1 = 'startLiveCallReport'
        var socket1 = await adminSocket(id_user, msg1);
        var currentDate = new Date();
        var obj = {
            id: data.uniqueId,
            phnNo: data.source,
            type: type,
            time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
            didNumber: data.destination,
            event: 'connect'
        }
        if (type == 'incoming') {
            obj.currentCallStatus = 2
        } if (type == 'outgoing') {
            obj.currentCallStatus = 4
        }
        var msg2 = 'userConnectPopup'
        var socket2 = await userSocket(user_id, msg2, obj);
        return result
    } catch (err) {
        console.error(err);
    }
}
async function delete_livecall(uniqueId) {
    try {
        var result = await livecallModel.destroy({ where: { uniqueId: uniqueId } });
        // var result = await livecallModel.deleteOne({ uniqueId: data.call_unique_id });
        return result
    } catch (err) {
        console.error(err);
    }
}
async function add_incomingcall(liveData,data) {
    try {
        // var livecallSql = `SELECT id,id_department,id_user,time,answeredTime,source,destination,dtmfNo,app,type,id_ext FROM livecalls WHERE uniqueId = '${data.call_unique_id}'`;
        // var [livecallRes] = await sequelize.query(livecallSql);
        // if (livecallRes.length != 0) {
            if(liveData.app == 'user'){
                var user_id = liveData.appId
            }else{
                var user_id = 0
            }
            const callstarttime = new Date(liveData.time);
            const callendtime = new Date(data.end_time);
            const durationInMilliseconds = callendtime - callstarttime;
            const durationInSeconds = Math.abs(durationInMilliseconds / 1000);
            console.log("livecall answered time--------->",liveData.answeredTime)
            if(liveData.answeredTime != 'Invalid Date'){
                var status = 'ANSWERED'
                const callConnectedTime =  new Date(liveData.answeredTime);
                const connectedDurationInMilliseconds =  callendtime - callConnectedTime ;
                var connectedDurationInSeconds = Math.abs(connectedDurationInMilliseconds / 1000);
            }else{
                var status = 'FAILED'
                var connectedDurationInSeconds = 0
                // var missedObj = {
                //     id_department: liveData.id_department,
                //     id_user: liveData.id_user,
                //     user_id: user_id,
                //     call_start_time: liveData.time,
                //     call_end_time: data.end_time,
                //     call_connected_time: liveData.answeredTime,
                //     uniqueid: data.call_unique_id,
                //     source: liveData.source,
                //     destination: liveData.destination,
                //     connected_user_id: user_id,
                //     connected_user: user_id,
                //     connected_duration: connectedDurationInSeconds,
                //     total_duration: durationInSeconds,
                //     call_status: status,
                //     user_status: data.user_status,
                //     cr_file: data.cr_file,
                //     app: liveData.app,
                //     appId: liveData.appId,
                //     dtmf_sequence: liveData.dtmfNo,
                // }
                // var result = await missedcallReportModel.create(missedObj);   
            }
            var obj = {
                id_department: liveData.id_department,
                id_user: liveData.id_user,
                user_id: user_id,
                call_start_time: liveData.time,
                call_end_time: data.end_time,
                call_connected_time: liveData.answeredTime,
                uniqueid: data.call_unique_id,
                source: liveData.source,
                destination: liveData.destination,
                connected_user_id: user_id,
                connected_user: user_id,
                connected_duration: connectedDurationInSeconds,
                total_duration: durationInSeconds,
                call_status: status,
                user_status: data.user_status,
                cr_file: data.cr_file,
                // cost: data.cost,
                app: liveData.app,
                appId: liveData.appId,
                dtmf_sequence: liveData.dtmfNo,
                // first_tried_user_id: data.first_tried_user_id,
                // first_tried_user: data.first_tried_user,
                // voicemail: data.voicemail,
                // voicemail_file: data.voicemail_file,
            }
            var result = await incomingCallReportModel.create(obj);    
            var livecallDeleteSql = `DELETE FROM livecalls WHERE uniqueId = '${data.call_unique_id}'`;
            var [livecallDelete] = await sequelize.query(livecallDeleteSql);
            // var livecallDelete = await livecallModel.deleteOne({ uniqueId: data.call_unique_id });
            var currentDate = new Date();
            var obj1 = {
                phnNo: liveData.source,
                type: liveData.type,
                agentId: liveData.user_id,
                time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
                didNumber: liveData.destination,
                event: 'end',
                currentCallStatus: 5,
                id: data.call_unique_id,
                regNumber: liveData.user_id,
            }
            if (liveData.user_id != undefined) {
                var msg3 = 'endUserCallPopup'
                var socket3 = await userSocket(liveData.user_id, msg3, obj1);
                var msg2 = 'endAdminMonitoring'
                var socket1 = await adminSocket(liveData.id_user, msg2,obj1);
            }
            var msg1 = 'endLiveCallReport'
            var socket1 = await adminSocket(liveData.id_user, msg1);
            var msg3 = 'endAdminDashboardLivecall'
            var socket1 = await adminSocket(liveData.id_user, msg3);
        // }
    } catch (err) {
        console.error(err);
    }
}
async function add_outgoingcall(liveData,data) {
    try {
        // var livecallSql = `SELECT id,id_department,id_user,time,answeredTime,source,destination,dtmfNo,app,type,id_ext FROM livecalls WHERE uniqueId = '${data.call_unique_id}'`;
        // var [livecallRes] = await sequelize.query(livecallSql);
        // if (livecallRes.length != 0) {
            const callstarttime = new Date(liveData.time);
            const callendtime = new Date(data.end_time);
            const durationInMilliseconds = callendtime - callstarttime;
            const durationInSeconds = Math.abs(durationInMilliseconds / 1000);
            if(liveData.app == 'user'){
                var user_id = liveData.appId
            }else{
                var user_id = 0
            }
            var obj = {
                id_department: liveData.id_department,
                id_user: liveData.id_user,
                user_id: user_id,
                date : liveData.time,
                call_end_time: data.end_time,
                answeredTime: liveData.answeredTime,
                uniqueid: data.call_unique_id,
                callerid: liveData.destination,
                destination: liveData.source,
                duration: durationInSeconds,
                status: data.callStatus,
                type: 'Outbound',
                cr_file: data.cr_file,
                // cost: data.cost
            }
            var result = await cc_outgoingCallReportModel.create(obj);
            var livecallDeleteSql = `DELETE FROM livecalls WHERE uniqueId = '${data.call_unique_id}'`;
            var [livecallDelete] = await sequelize.query(livecallDeleteSql);
            // var livecallDelete = await livecallModel.deleteOne({ uniqueId: data.call_unique_id });
            var currentDate = new Date();
            var obj1 = {
                phnNo: liveData.source,
                type: liveData.type,
                agentId: liveData.user_id,
                time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
                didNumber: liveData.destination,
                event: 'end',
                currentCallStatus: 5,
                id: data.call_unique_id,
                regNumber: liveData.user_id,
            }
            if (liveData.user_id != undefined) {
                var msg3 = 'endAgentCallPopup'
                var socket3 = await userSocket(liveData.user_id, msg3, obj1);
                var msg2 = 'endAdminMonitoring'
                var socket1 = await adminSocket(liveData.id_user, msg2,obj1);
            }
            var msg1 = 'endLiveCallReport'
            var socket1 = await adminSocket(liveData.id_user, msg1);
            var msg3 = 'endAdminDashboardLivecall'
            var socket1 = await adminSocket(liveData.id_user, msg3);
        // }
    } catch (err) {
        console.error(err);
    }
}
async function insert_callreport(data) {
    try {
        var livecallSql = `SELECT * FROM livecalls WHERE uniqueId = '${data.call_unique_id}'`;
        var [livecallRes] = await getConnection.query(livecallSql);
        // var livecallRes = await livecallModel.find( { uniqueId: data.call_unique_id } );
        if (livecallRes.length != 0) {
            if(livecallRes[0].type == 'incoming'){
                var incoming = await add_incomingcall(livecallRes[0],data)
            }
            if(livecallRes[0].type == 'outgoing'){
                var outgoing = await add_outgoingcall(livecallRes[0],data)
            }
        }
    } catch (err) {
        console.error(err);
    }
}
async function smart_group_monitoring(data) {
    try {
      var id = Number(data.id);
      var id_user =  Number(data.id_user);
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
  
module.exports = {
    add_livecall,
    update_livecall,
    delete_livecall,
    add_incomingcall,
    add_outgoingcall,
    insert_callreport,
    smart_group_monitoring
}