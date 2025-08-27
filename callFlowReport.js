const sequelize = require('./database').db;
var callReportModel = require('./model/callFlowReportModel')
var incomingCallReportModel = require('./model/incomingCallReportModel')
var outgoingCallReportModel = require('./model/outgoingCallReportModel')
var livecallModel = require('./model/livecallsModel')
var smartGroupReport = require('./model/smartGroupReport');
// const smartGroupReport = require('./model/smartGroupReport');
var smartGroupDetailModel = require('./model/callFlowDetailModel')

async function add_call_flow_report(req, res, next) {
    try {
        const data = req.body;
        const id = req.query.id;
        let values = {};
        const {
            module,
            eventTime,
            uniqueId,
            didNumber,
            callerNumber,
            module_id,
            app,
            appId,
            ...otherData 
        } = data;
        if(data.app == "callflow"){
        if (data.module == "end") {
            values = {
                call_flow_id: data.call_flow_id,
                call_flow_module: data.module,
                end_time: data.eventTime,
                call_unique_id: data.uniqueId,
                did_number: data.didNumber,
                source_number: data.callerNumber,
                module_id: data.module_id,
                ...otherData
            };
            var result = await callReportModel.updateMany(
                { call_unique_id: data.uniqueId },
                { $set: values }
            );
            var liveData = {
                id_department: data.deptId,
                id_user: data.customerId,
                time: data.eventTime,
                source: data.callerNumber,
                destination: data.didNumber,
                type: data.direction,
                livekey: data.livekey,
                id_ext: data.user_id,
                uniqueId: data.uniqueId,
                currentStatus: 0,
                app:data.app,
                appId:data.appId,
            }
            var liveCallresult = await livecallModel.create(liveData);
            res.locals.result = result;
        } else {
            values = {
                call_flow_id: data.call_flow_id,
                call_flow_module: data.module,
                start_time: data.eventTime,
                call_unique_id: data.uniqueId,
                did_number: data.didNumber,
                source_number: data.callerNumber,
                module_id: data.module_id,
                ...otherData
            };
            var result = await callReportModel.create(values);
            res.locals.result = result;
        }
    }
    else if (data.app == "smartGroup"){

        if(data.module == "smartGroup"){
            var result = await smartGroupDetailModel.create(data);
            res.locals.result = result
        }
        else{
        if (data.module == "end") {
            var end_time_data = await smartGroupReport.findOne(
                { call_unique_id: data.uniqueId },
            );
            if(end_time_data){
            var event_time = new Date(end_time_data.connected_time.replace(' ', 'T'));
            var end_time = new Date(data.eventTime.replace(' ', 'T'));
            }
            var connected_duration = (end_time - event_time) / 1000;
            values = {
                smartGroupId: data.smartgroup_id,
                end_time: data.eventTime,
                call_unique_id: data.uniqueId,
                connected_duration:connected_duration?connected_duration:0,
                ...otherData
            };
            var result = await smartGroupReport.updateMany(
                { call_unique_id: data.uniqueId },
                { $set: values }
            );
            res.locals.result = result; 
        } 
       else if (data.module == "dial start") {

            values = {
                smartGroupId: data.smartgroup_id,
                connected_time : data.eventTime,
                ...otherData
            };
            var result = await smartGroupReport.updateMany(
                { call_unique_id: data.uniqueId },
                { $set: values }
            );
            res.locals.result = result; 
        }else {
            values = {
                smartGroupId: data.smartgroup_id,
                start_time: data.eventTime,
                call_unique_id: data.uniqueId,
                connected_duration:0,
                // did_number: data.didNumber,
                // source_number: data.callerNumber,
                // module_id: data.module_id,
                ...otherData
            };
            var result = await smartGroupReport.create(values);
            var liveData = {
                id_department: data.deptId,
                id_user: data.customerId,
                time: data.eventTime,
                source: data.callerNumber,
                destination: data.didNumber,
                type: data.direction,
                livekey: data.livekey,
                id_ext: data.user_id,
                uniqueId: data.uniqueId,
                currentStatus: 0,
                app:data.app,
                appId:data.appId,
            }
            var liveCallresult = await livecallModel.create(liveData);
            const results = await callReportModel.create(values);
            res.locals.result = result;
        }
    }
}
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next(err);
    }
}
async function delete_call_flow_report(req, res, next) {
    try {
        const id = req.query.id
        const result = await callReportModel.deleteOne({ _id: id });
        res.locals.result = result;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next(err);
    }
}
// async function get_call_flow_count(req, res, next) {
//     try {
//         const call_flow_id = req.query.id;
//         const result = await callReportModel.find({ call_flow_id: call_flow_id });

//         const countByModuleIdAndKey = result.reduce((acc, item) => {
//             if (!acc[item.call_flow_module]) {
//                 acc[item.call_flow_module] = [];
//             }

//             // Handle counting for different modules
//             switch (item.call_flow_module) {
//                 case "audio":
//                 case "smartGroup": {
//                     const existingEntry = acc[item.call_flow_module].find(entry => entry.module_id === item.module_id);
//                     if (existingEntry) {
//                         existingEntry.count++;
//                     } else {
//                         acc[item.call_flow_module].push({ module_id: item.module_id, count: 1 });
//                     }
//                     break;
//                 }
//                 case "dtmf": {
//                     const existingEntry = acc[item.call_flow_module].find(entry => entry.module_id === item.module_id);
//                     if (!existingEntry) {
//                         acc[item.call_flow_module].push({ module_id: item.module_id, keys: {} });
//                     }
//                     const keyEntry = acc[item.call_flow_module].find(entry => entry.module_id === item.module_id).keys[item.key];
//                     if (keyEntry !== undefined) {
//                         acc[item.call_flow_module].find(entry => entry.module_id === item.module_id).keys[item.key]++;
//                     } else {
//                         acc[item.call_flow_module].find(entry => entry.module_id === item.module_id).keys[item.key] = 1;
//                     }
//                     break;
//                 }
//                 case "timeCondition": {
//                     const existingEntry = acc[item.call_flow_module].find(entry => entry.module_id === item.module_id);
//                     if (!existingEntry) {
//                         acc[item.call_flow_module].push({ module_id: item.module_id, trueCount: 0, falseCount: 0 });
//                     }
//                     const currentEntry = acc[item.call_flow_module].find(entry => entry.module_id === item.module_id);
//                     if (currentEntry) {
//                         if (item.eventStatus === "true") {
//                             currentEntry.trueCount++;
//                         } else if (item.eventStatus === "false") {
//                             currentEntry.falseCount++;
//                         }
//                     }
//                     break;
//                 }
//             }
//             return acc;
//         }, {});

//         // Fetch names for all modules using a single query with CASE
//         const sqlModuleNames = `
//             SELECT 
//                 name, 
//                 call_flow_module_id, 
//                 CASE 
//                     WHEN module_type = 'audio' THEN 'audio'
//                     WHEN module_type = 'dtmf' THEN 'dtmf'
//                     WHEN module_type = 'timeCondition' THEN 'timeCondition'
//                     WHEN module_type = 'smartGroup' THEN 'smartGroup'
//                 END AS module_name
//             FROM (
//                 SELECT name, call_flow_module_id, 'audio' AS module_type FROM call_flow_audio
//                 UNION ALL
//                 SELECT dtmf_name AS name, call_flow_module_id, 'dtmf' AS module_type FROM call_flow_dtmf
//                 UNION ALL
//                 SELECT name AS name, call_flow_module_id, 'timeCondition' AS module_type FROM call_flow_time_condition
//                 UNION ALL
//                 SELECT name AS name, call_flow_module_id, 'smartGroup' AS module_type FROM call_flow_call_group
//             ) AS combined_modules
//         `;
//         const [moduleNames] = await sequelize.query(sqlModuleNames);

//         // Prepare the final output array
//         const output = [];

//         // Process audio results
//         if (countByModuleIdAndKey.audio) {
//             countByModuleIdAndKey.audio.forEach(audio => {
//                 const nameObj = moduleNames.find(name => name.call_flow_module_id === audio.module_id);
//                 output.push({
//                     module_id: audio.module_id,
//                     count: audio.count,
//                     name: nameObj ? nameObj.name : null,
//                     module_name: "audio"
//                 });
//             });
//         }

//         // Process smartgroup results
//         if (countByModuleIdAndKey.smartGroup) {
//             countByModuleIdAndKey.smartGroup.forEach(smartGroup => {
//                 const nameObj = moduleNames.find(name => name.call_flow_module_id === smartGroup.module_id);
//                 output.push({
//                     module_id: smartGroup.module_id,
//                     count: smartGroup.count,
//                     name: nameObj ? nameObj.name : null,
//                     module_name: "smartGroup"
//                 });
//             });
//         }

//         // Process dtmf results
//         if (countByModuleIdAndKey.dtmf) {
//             countByModuleIdAndKey.dtmf.forEach(dtmf => {
//                 const nameObj = moduleNames.find(name => name.call_flow_module_id === dtmf.module_id);
//                 output.push({
//                     module_id: dtmf.module_id,
//                     keys: dtmf.keys,
//                     name: nameObj ? nameObj.name : null,
//                     module_name: "dtmf"
//                 });
//             });
//         }

//         // Process timeCondition results
//         if (countByModuleIdAndKey.timeCondition) {
//             countByModuleIdAndKey.timeCondition.forEach(timeCondition => {
//                 const nameObj = moduleNames.find(name => name.call_flow_module_id === timeCondition.module_id);
//                 output.push({
//                     module_id: timeCondition.module_id,
//                     trueCount: timeCondition.trueCount,
//                     falseCount: timeCondition.falseCount,
//                     name: nameObj ? nameObj.name : null,
//                     module_name: "timeCondition"
//                 });
//             });
//         }

//         res.locals.result = output; // Assuming you want to send the output
//         next();
//     } catch (err) {
//         console.log(err);
//         res.locals.result = "err";
//         next(err);
//     }
// }
async function add_callreport(req, res, next) {
    try {
        var data = req.body;
        if(data.direction == "incoming"){
            var uniqueId = data.uniqueId
            if(data.event == "start"){
                var obj = {
                    id_department: data.deptId,
                    id_user: data.customerId,
                    call_start_time: data.eventTime,
                    source: data.callerNumber,
                    destination: data.didNumber,
                    uniqueid: uniqueId,
                    app: data.app,
                    user_id : data.user_id,
                } 
                var result = await incomingCallReportModel.create(obj);
                var userLiveDateSql = `UPDATE user_live_data SET currentCallStatus=1,liveCallKey='${data.liveCallKey}' WHERE user_id = '${data.user_id}'`
                var [userLiveDataRes] = await sequelize.query(userLiveDateSql);
                var liveData = {
                    id_department: data.deptId,
                    id_user: data.customerId,
                    time: data.eventTime,
                    source: data.callerNumber,
                    destination: data.didNumber,
                    type: 'incoming',
                    livekey: data.livekey,
                    id_ext : data.user_id,
                    uniqueId: uniqueId,
                    currentStatus:0
                } 
                var result = await livecallModel.create(liveData);
            }else if(data.event == "connect"){
                var obj = {
                    call_connected_time: data.eventTime,
                    connected_user_id: data.user_id,
                } 
                var result = await incomingCallReportModel.update(obj, { where: { uniqueid: uniqueId } });
                var userLiveDateSql = `UPDATE user_live_data SET currentCallStatus=2,currentCallAnsTime='${data.eventTime}' WHERE user_id = '${data.user_id}'`
                var [userLiveDataRes] = await sequelize.query(userLiveDateSql);
                var liveData = {
                    answeredTime: data.eventTime,
                    id_ext: data.user_id,
                    currentStatus:1
                } 
                var result = await livecallModel.update(obj, { where: { uniqueId: uniqueId } });
            }else if (data.event == "end") {
                var connectedTimeSql = `SELECT call_connected_time,call_start_time FROM incoming_reports WHERE uniqueid = '${uniqueId}'`
                var [connectedRes] = await sequelize.query(connectedTimeSql);
                if (connectedRes.length != 0) {
                    var callStartTime = new Date(connectedRes[0].call_start_time);
                    var callConnectedTime = new Date(connectedRes[0].call_connected_time);
                    var currentDate = new Date();
                    var diffInMs = currentDate - callStartTime;
                    var totalDuration = Math.floor(diffInMs / 1000);
                    var connectedDiffInMs = currentDate - callConnectedTime;
                    var connectedDuration = Math.floor(connectedDiffInMs / 1000);
                }
                var obj = {
                    call_end_time: data.eventTime,
                    connected_duration : connectedDuration,
                    total_duration : totalDuration
                } 
                var result = await incomingCallReportModel.update(obj, { where: { uniqueid: uniqueId } });
                var userLiveDateSql = `UPDATE user_live_data SET currentCallStatus=2,lastCallEndTime='${data.eventTime}' WHERE user_id = '${data.user_id}'`
                var [userLiveDataRes] = await sequelize.query(userLiveDateSql);
                var result = await livecallModel.destroy({ where: { uniqueId: uniqueId } });
            }
            res.locals.result = uniqueId;
        }else{
            var uniqueId = data.uniqueId
            if(data.event == "start"){
                var obj = {
                    id_department: data.deptId,
                    id_user: data.customerId,
                    date: data.eventTime,
                    destination: data.callerNumber,
                    callerid: data.didNumber,
                    uniqueid: uniqueId,
                    id_ext : data.user_id,
                    type : 'Outbound',
                    user_id : data.user_id,
                } 
                var result = await outgoingCallReportModel.create(obj);
                var userLiveDateSql = `UPDATE user_live_data SET currentCallStatus=1,liveCallKey='${data.liveCallKey}' WHERE user_id = '${data.user_id}'`
                var [userLiveDataRes] = await sequelize.query(userLiveDateSql);
                var liveData = {
                    id_department: data.deptId,
                    id_user: data.customerId,
                    time: data.eventTime,
                    source: data.callerNumber,
                    destination: data.didNumber,
                    type: 'incoming',
                    livekey: data.livekey,
                    id_ext : data.user_id,
                    uniqueId: uniqueId,
                    currentStatus:0
                } 
                var result = await livecallModel.create(liveData);
            }else if(data.event == "connect"){
                // var obj = {
                //     call_connected_time: data.eventTime,
                //     connected_user_id: data.user_id,
                // } 
                // var result = await incomingCallReportModel.update(obj, { where: { uniqueid: uniqueId } });
                var userLiveDateSql = `UPDATE user_live_data SET currentCallStatus=2,currentCallAnsTime='${data.eventTime}' WHERE user_id = '${data.user_id}'`
                var [userLiveDataRes] = await sequelize.query(userLiveDateSql);
                var liveData = {
                    answeredTime: data.eventTime,
                    id_ext: data.user_id,
                    currentStatus:1
                } 
                var result = await livecallModel.update(obj, { where: { uniqueId: uniqueId } });
            }else if (data.event == "end") {
                var connectedTimeSql = `SELECT date FROM outgoing_reports WHERE uniqueId = '${uniqueId}'`
                var [connectedRes] = await sequelize.query(connectedTimeSql);
                if (connectedRes.length != 0) {
                    var callStartTime = new Date(connectedRes[0].date);
                    var currentDate = new Date();
                    var diffInMs = currentDate - callStartTime;
                    var totalDuration = Math.floor(diffInMs / 1000);
                }
                var obj = {
                    duration : totalDuration
                } 
                var result = await outgoingCallReportModel.update(obj, { where: { uniqueid: uniqueId } });
                var userLiveDateSql = `UPDATE user_live_data SET currentCallStatus=2,lastCallEndTime='${data.eventTime}' WHERE user_id = '${data.user_id}'`
                var [userLiveDataRes] = await sequelize.query(userLiveDateSql);
                var result = await livecallModel.destroy({ where: { uniqueId: uniqueId } });
            }
            res.locals.result = uniqueId;
        }
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next(err);
    }
}

async function add_livecall(req, res, next) {
    try {
        var data = req.body;
        var liveData = {
            id_department: data.deptId,
            id_user: data.customerId,
            time: data.eventTime,
            source: data.callerNumber,
            destination: data.didNumber,
            type: data.direction,
            livekey: data.livekey,
            id_ext: data.user_id,
            uniqueId: data.uniqueId,
            currentStatus: 0,
            app:data.app,
            appId:data.appId,
        }
        var result = await livecallModel.create(liveData);
        res.locals.result = result;
        next();
    } catch (err) {
        console.error(err);
        res.locals.result = "err";
        next(err);
    }
}

async function add_call_flow_smart_group(req, res, next) {
    try {
            const data = req.body;
            if(data.module == "smartGroup"){
            var result = await smartGroupReport.create(data);
            res.locals.result = result
            }
            next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next(err);
    }
}




module.exports = {
    add_call_flow_report,
    delete_call_flow_report,
    add_callreport,
    add_livecall,
    add_call_flow_smart_group,
}