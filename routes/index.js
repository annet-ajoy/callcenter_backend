var express = require('express');
var router = express.Router();
const sequelize = require('../database').db;
const { crypto_decode, string_decode } = require('../helper/auth');
const { isAuthenticated } = require('../helper/auth');
var jwt_decode = require('jwt-simple');
const logMessage = require('../logger');
const { NUMBER } = require('sequelize');
var callFlowReport = require('../callFlowReport')
if(process.env.PRODUCTION == 'developmentLive' || process.env.PRODUCTION == 'development'){
  var { adminSocket, departmentSocket, subadminSocket, userSocket,didSocket,smartgroupSocket } = require('../helper/developmentSocket');
}else{
  var { adminSocket, departmentSocket, subadminSocket, userSocket,didSocket,smartgroupSocket } = require('../helper/liveSocket');
}
var developmentCallEvent = require('../helper/DevelopmentCallEvents')

module.exports = function () {
  // io.on('connection', function (socket) {
  //   console.log('a user connected');
  //   socket.on("join_room", (data) => {
  //     if (data) {
  //       socket.join(data);
  //       console.log(`User with ID: ${socket.id} joined room: ${data}`);
  //     }
  //   });
  // });
  
  router.get('/trigger_agent_call_startEvent', isAuthenticated, async function (req, res, next) {
    var agentId = req.token.agentId;
    var id_user = Number(req.token.id_user)
    // id_user = 'admin_' +`${id_user}`;
    var result = [];
    try {
      // if(req.token.phnNo){
      //   var [result] =await sequelize.query("select id,name,date,email from company_contacts where phnNo = "+ req.token.phnNo);
      // }
      var currentDate = new Date();
      var obj = {
        id: req.token.callId,
        phnNo: req.token.phnNo,
        type: req.token.type,
        time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
        didNumber: req.token.didNumber,
        agentChannel: req.token.agentChannel,
        channel: req.token.channel,
        event: req.token.event
      }
      if (req.token.template != undefined && req.token.template != 0) {
        var [result1] = await sequelize.query("SELECT id,id_module FROM templates WHERE id = " + req.token.template);
        if (result1[0].length != 0) {
          obj.module = result1[0].id_module;
        }
        obj.template = req.token.template
      }
      if (req.token.dtmfNo != undefined) {
        obj.dtmfNo = req.token.dtmfNo
      }
      if (req.token.dtmfName != undefined) {
        obj.dtmfName = req.token.dtmfName
      }
      if (req.token.deptId != undefined && req.token.deptId != 0) {
        obj.deptId = req.token.deptId
      }
      // if(result.length != 0){
      //   obj.name = result[0].name;
      //   obj.date = result[0].date;
      //   obj.email = result[0].email;
      //   obj.contactId=result[0].id
      // }
      if (req.token.type == 'outgoing') {
        if (agentId != undefined) {
          agentId = Number(agentId)
          obj.agentId = agentId;
        }
      } else {
        obj.regNumber = req.token.agentId;
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
      // io.to(agentId).emit('receivedStartCallMessage', obj);
      // io.to(id_user).emit('adminSocketCall', { obj });
      // io.to(id_user).emit('dashboardLivecalls');
      var msg3 = 'receivedStartCallMessage'
      var socket3 = await userSocket(agentId, msg3, obj);
      var msg2 = 'adminSocketCall'
      var socket1 = await adminSocket(id_user, msg2,obj);
      var msg1 = 'dashboardLivecalls'
      var socket1 = await adminSocket(id_user, msg1);
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/trigger_agent_call_start', isAuthenticated, async function (req, res, next) {
    try {
      var id_user = Number(req.token.id_user)
      // id_user = 'admin_' +`${id_user}`;
      // io.to(id_user).emit('dashboardLivecalls');
      var msg1 = 'dashboardLivecalls'
      var socket1 = await adminSocket(id_user, msg1);
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/trigger_agent_call', isAuthenticated, async function (req, res, next) {
    var agentId = req.token.agentId;
    var id_user = Number(req.token.id_user)
    // id_user = 'admin_' +`${id_user}`;
    var result = [];
    try {
      // if(req.token.phnNo){
      //   var [result] =await sequelize.query("select id,name,date,email from company_contacts where phnNo = "+req.token.phnNo);
      // }
      var currentDate = new Date();
      var obj = {
        id: req.token.callId,
        phnNo: req.token.phnNo,
        // phnNo:918156890110,
        type: req.token.type,
        time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
        didNumber: req.token.didNumber,
        agentChannel: req.token.agentChannel,
        channel: req.token.channel,
        event: req.token.event
      }
      if (req.token.template != undefined && req.token.template != 0) {
        var [result1] = await sequelize.query("SELECT id,id_module FROM templates WHERE id = " + req.token.template);
        if (result1[0].length != 0) {
          obj.module = result1[0].id_module;
        }
        obj.template = req.token.template
      }
      if (req.token.dtmfNo != undefined) {
        obj.dtmfNo = req.token.dtmfNo
      }
      if (req.token.dtmfName != undefined) {
        obj.dtmfName = req.token.dtmfName
      }
      if (req.token.deptId != undefined && req.token.deptId != 0) {
        obj.deptId = req.token.deptId
      }
      // if(result.length != 0){
      //   obj.name = result[0].name;
      //   obj.date = result[0].date;
      //   obj.email = result[0].email;
      //   obj.contactId=result[0].id
      // }
      if (req.token.type == 'incoming') {
        if (req.token.event == 'start') {
          obj.currentCallStatus = 1
        } if (req.token.event == 'connect') {
          obj.currentCallStatus = 2
        }
      } if (req.token.type == 'outgoing') {
        if (req.token.event == 'start') {
          obj.currentCallStatus = 3
        } if (req.token.event == 'connect') {
          obj.currentCallStatus = 4
        }
      }
      if (req.token.type == 'outgoing') {
        if (agentId != undefined) agentId = Number(agentId)
        obj.agentId = agentId;
      } else {
        obj.regNumber = req.token.agentId;
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
      const [results] = await customerPhnNumberModel.find({phone_number:req.token.phnNo });
    if(results){
      obj.customerName = results.name
    }
      if (agentId && agentId != undefined)
      //   io.to(agentId).emit('receivedMessage', obj);
      // io.to(id_user).emit('adminSocketCall', { obj });
      // io.to(id_user).emit('liveCallReport');
      var msg3 = 'userCallStartPopup'
      var socket3 = await userSocket(agentId, msg3, obj);
      var msg2 = 'adminSocketCall'
      var socket1 = await adminSocket(id_user, msg2,obj);
      var msg1 = 'liveCallReport'
      var socket1 = await adminSocket(id_user, msg1);
      
    }

    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/trigger_agent_call_end', isAuthenticated, async function (req, res, next) {
    var agentId = req.token.agentId;
    var id_user = Number(req.token.id_user)
    // id_user = 'admin_' +`${id_user}`;
    var result = [];
    var currentDate = new Date();
    try {
      var obj = {
        phnNo: req.token.phnNo,
        type: req.token.type,
        agentId: agentId,
        time: currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds(),
        didNumber: req.token.didNumber,
        event: req.token.event,
        currentCallStatus: 5
      }
      if (req.token.template != undefined) {
        obj.template = req.token.template
      }
      obj.id = req.token.callId
      if (req.token.type == 'outgoing') {
        if (agentId != undefined) agentId = Number(agentId)
      } else {
        obj.regNumber = req.token.agentId;
        var sql = `select id from agents where regNumber='${req.token.agentId}'`
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
      // io.to(agentId).emit('receivedEndCallMessage', obj);
    var msg3 = 'endUserCallPopup'
    var socket3 = await userSocket(agentId, msg3, obj);
    //set delay for updating call data in db
    setTimeout(async() => {
      // io.to(id_user).emit('adminSocketCall', { obj });
      var msg2 = 'adminSocketCall'
      var socket1 = await adminSocket(id_user, msg2,obj);
    }, 5000);
    // io.to(id_user).emit('dashboardLivecalls');
    var msg1 = 'dashboardLivecalls'
    var socket1 = await adminSocket(id_user, msg1);
    res.send("succesfull response");
  }); //
  router.post('/trigger_agent_logout', async function (req, res, next) {
    res.send("succesfull response");
    try {
      var token = req.body.token;
      var decoded = jwt_decode.decode(token, process.env.jwt_secret);
      var token_var = { agentId: JSON.parse(decoded).agentId, dateTime: JSON.parse(decoded).dateTime }
      var agentId = token_var.agentId;
      var id_user = Number(token_var.id_user)
      // id_user = 'admin_' +`${id_user}`;
      if (agentId && agentId != undefined) {
        if (agentId != undefined) agentId = Number(agentId)
        var agent = `select id,regNumber from agents where id = ${agentId} `;
        var [agentRes] = await sequelize.query(agent);
        var sql = `SELECT id,id_user,id_department, startDate,session_id, id_break, break_name,break_type FROM agent_activities where id_agent='${agentId}' order by id desc limit 1`
        var [result] = await sequelize.query(sql);
        if (result.length != 0) {
          if (result[0].break_name != 'Logout') {
            var id_user = result[0].id_user;
            var id_department = result[0].id_department;
            var rowStartDate = result[0].startDate;
            var breakId = result[0].id_break;
            var breakName = result[0].break_name;
            var breakType = result[0].break_type;
            var startDateTime = new Date(rowStartDate);
            var session_id = result[0].session_id;
            var dd = startDateTime.getDate();
            var mm = startDateTime.getMonth() + 1;
            var yyyy = startDateTime.getFullYear();
            var startHH = startDateTime.getHours();
            var startMM = startDateTime.getMinutes();
            var startSEC = startDateTime.getSeconds();
            var StartDate = `${yyyy}-${mm}-${dd} ${startHH}:${startMM}:${startSEC}`
            var insertSql = `INSERT INTO agent_activities (id_user, id_department, id_agent, id_break, break_name,break_type,session_id) VALUES ('${id_user}', '${id_department}', '${agentId}','2','Logout','0','${session_id}')`
            var [result1] = await sequelize.query(insertSql);
            if (result1.length != 0) {
              var DateTime = new Date();
              var dd = DateTime.getDate();
              var mm = DateTime.getMonth() + 1;
              var yyyy = DateTime.getFullYear();
              var endHH = DateTime.getHours();
              var endMM = DateTime.getMinutes();
              var endSEC = DateTime.getSeconds();
              var currentDateTime = `${yyyy}-${mm}-${dd} ${endHH}:${endMM}:${endSEC}`
              var date1 = new Date(startDateTime);
              var date2 = new Date();
              if (date2 < date1) {
                date2.setDate(date2.getDate() + 1);
              }
              var diff = date2 - date1;
              var msec = diff;
              var hh = Math.floor(msec / 1000 / 60 / 60);
              msec -= hh * 1000 * 60 * 60;
              var mm = Math.floor(msec / 1000 / 60);
              msec -= mm * 1000 * 60;
              var ss = Math.floor(msec / 1000);
              var duration = hh + ":" + mm + ":" + ss;
              var insertSession = `INSERT INTO user_sessions (id_user, id_department, id_agent, startDate, duration, id_break, break_name,session_id,break_type) VALUES ('${id_user}', '${id_department}', '${agentId}', '${StartDate}', '${duration}', '${breakId}', '${breakName}','${session_id}','${breakType}')`;
              var [insertSessionRes] = await sequelize.query(insertSession);
              var updateSql = `UPDATE agents SET currentBreakId = '2', currentBreakName = 'Logout', currentSessionStart = '0', currentBreakStartDate = '${currentDateTime}', logged_in = '0' WHERE id = '${agentId}'`;
              var [insertActivityOnAgentTableRes] = await sequelize.query(updateSql);
            }
          }
          var tokenUpdate = `UPDATE login_logs SET token = " " where id_agent = '${agentId}' `;
          var [tokenUpdateRes] = await sequelize.query(tokenUpdate);
        }
        // io.to(agentId).emit('triggerLogout');
        var msg3 = 'triggerLogout'
       var socket3 = await userSocket(agentId, msg3);
        var obj = {
          agentId: agentId,
          breakName: "Logout",
          breakId: 1,
          time: DateTime
        }
        // io.to(id_user).emit('adminSocketCall', { obj });
        var msg2 = 'adminSocketCall'
        var socket1 = await adminSocket(id_user, msg2,obj);
        // ami.unpouse_sip(agentRes[0].regNumber, true)
      }

    }
    catch (err) {
      console.log(err)
    }
  });
  router.get('/trigger_agent_logout_by_id_user', async function (req, res, next) {
    res.send("succesfull response");
    try {
      var token = req.body.token;
      var decoded = jwt_decode.decode(token, process.env.jwt_secret);
      var id_user = req.query.id_user;
      // id_user = 'admin_' +`${id_user}`;
      var sql = `select id,regNumber from agents where id_user = ${id_user} and logged_in = '1' and isAgent = '1' `;
      var [result] = await sequelize.query(sql);
      var agentId = [];
      if (result.length != 0) {
        result.map(async (data) => {
          agentId.push(data.id)
        });
        var sql1 = `SELECT MAX(ul.id) as id,id_agent,MAX(id_user) as id_user,MAX(id_department) as id_department, MAX(startDate) as startDate,MAX(id_break) as id_break,MAX(break_name) as break_name, MAX(break_type) as break_type,MAX(session_id) as session_id FROM agent_activities ul where id_agent in(${agentId}) GROUP BY ul.id_agent`;
        var [AgentRes] = await sequelize.query(sql1);
        if (AgentRes.length != 0) {
          var insertAgentActivity = `INSERT INTO agent_activities (id_user, id_department, id_agent, id_break, break_name,break_type,session_id) VALUES`
          var insertSession = `INSERT INTO user_sessions (id_user, id_department, id_agent, startDate, duration, id_break, break_name,break_type,session_id) VALUES`;
          AgentRes.map(async (data, index) => {
            insertAgentActivity += `('${data.id_user}','${data.id_department}','${data.id_agent}','2','Logout','0','${data.session_id}')`
            var rowStartDate = data.startDate;
            var startDateTime = new Date(rowStartDate);
            var dd = startDateTime.getDate();
            var mm = startDateTime.getMonth() + 1;
            var yyyy = startDateTime.getFullYear();
            var startHH = startDateTime.getHours();
            var startMM = startDateTime.getMinutes();
            var startSEC = startDateTime.getSeconds();
            var StartDate = `${yyyy}-${mm}-${dd} ${startHH}:${startMM}:${startSEC}`
            var date1 = startDateTime
            var date2 = new Date();
            if (date2 < date1) {
              date2.setDate(date2.getDate() + 1);
            }
            var diff = date2 - date1;
            var msec = diff;
            var hh = Math.floor(msec / 1000 / 60 / 60);
            msec -= hh * 1000 * 60 * 60;
            var mm = Math.floor(msec / 1000 / 60);
            msec -= mm * 1000 * 60;
            var ss = Math.floor(msec / 1000);
            var duration = hh + ":" + mm + ":" + ss;
            insertSession += `('${data.id_user}', '${data.id_department}', '${data.id_agent}', '${StartDate}', '${duration}', '${data.id_break}', '${data.break_name}','${data.break_type}','${data.session_id}')`
            if (AgentRes.length != index + 1) {
              insertAgentActivity += ","
              insertSession += ","
            }
          });
        }
        var date2 = new Date();
        var dd = date2.getDate();
        var mm = date2.getMonth() + 1;
        var yyyy = date2.getFullYear();
        var endHH = date2.getHours();
        var endMM = date2.getMinutes();
        var endSEC = date2.getSeconds();
        var currentDateTime = `${yyyy}-${mm}-${dd} ${endHH}:${endMM}:${endSEC}`
        var [result1] = await sequelize.query(insertAgentActivity);
        var [insertSessionRes] = await sequelize.query(insertSession);
        var updateSql = `UPDATE agents SET currentBreakId = '2', currentBreakName = 'Logout', currentSessionStart = '0', currentBreakStartDate = '${currentDateTime}', logged_in = '0' WHERE id in(${agentId})`;
        var [insertActivityOnAgentTableRes] = await sequelize.query(updateSql);
        var tokenUpdate = `UPDATE login_logs SET token = " " where id_agent in(${agentId}) `;
        var [tokenUpdateRes] = await sequelize.query(tokenUpdate);
      }
      if (result.length != 0) {
        result.map(async (data) => {
          var agentId = Number(data.id)
          // io.to(agentId).emit('triggerLogout');
          var msg3 = 'triggerLogout'
       var socket3 = await userSocket(agentId, msg3);
          // ami.unpouse_sip(data.regNumber, true)
        });
      } else {
        res.send("failed");
      }
    }
    catch (err) {
      console.log(err)
    }
  });

  router.get('/logoutCall', async function (req, res, next) {
    try {
      var agentId = req.query.agentId;
      var logoutTime = req.query.logoutTime;
      var id_user = req.query.id_user;
      // id_user = 'admin_' +`${id_user}`;
      var obj = {
        agentId: agentId,
        breakName: "Logout",
        breakId: 1,
        time: logoutTime
      }
      if (agentId && agentId != undefined)
        // io.to(id_user).emit('adminSocketCall', { obj });
      var msg2 = 'adminSocketCall'
        var socket1 = await adminSocket(id_user, msg2,obj);
      console.log('adminSocketCall.................', { obj })
    }
    catch (err) {
      console.log(err)
    }
  }); //
  router.get('/loginCall', async function (req, res, next) {
    try {
      var agentId = req.query.agentId;
      var loginTime = req.query.loginTime;
      var id_user = req.query.id_user;
      // id_user = 'admin_' +`${id_user}`;
      // var date = new Date();
      // var dd = date.getDate();
      // var mm = date.getMonth() + 1
      // var yyyy = date.getFullYear();
      // var today = `${yyyy}-${mm}-${dd}`;
      // var breakCountsQuery = `select count(id_break) as totalBreaks,id_break from agent_sessions WHERE startDate  BETWEEN '${today} 00:00:00' AND '${today} 23:59:59' AND id_department='1' group by id_break,id_agent `;
      // var [breakCounts] = await sequelize.query(breakCountsQuery);
      var obj = {
        agentId: agentId,
        breakName: "Available",
        breakId: 1,
        time: loginTime
      }
      if (agentId && agentId != undefined)
        // io.to(id_user).emit('adminSocketCall', { obj, total: breakCounts });
        // console.log('adminSocketCall.................', { obj, total: breakCounts })
      io.to(id_user).emit('adminSocketCall', { obj });
      console.log('adminSocketCall.................', { obj })
    }
    catch (err) {
      console.log(err)
    }
  }); //
  router.get('/breakUpdate', async function (req, res, next) {
    try {
      var agentId = req.query.agentId;
      var breakName = req.query.breakName;
      var breakId = req.query.breakId;
      var id_user = req.query.id_user;
      // id_user = 'admin_' +`${id_user}`;
      var id_department = req.query.id_department
      var agentName = req.query.name;
      var breakType = req.query.break;
      var date = new Date();
      var dd = date.getDate();
      var mm = date.getMonth() + 1
      var yyyy = date.getFullYear();
      var today = `${yyyy}-${mm}-${dd}`;
      var breakCountsQuery = `select count(id_break) as totalBreaks,id_break from user_sessions WHERE startDate  BETWEEN '${today} 00:00:00' AND '${today} 23:59:59' AND id_department="${id_department}" group by id_break,id_agent `;
      var [breakCounts] = await sequelize.query(breakCountsQuery);
      var obj = {
        agentId: agentId,
        breakName: breakName,
        breakId: breakId,
        time: new Date(),
        break: 1
      }
      if (agentId && agentId != undefined)
        // io.to(id_user).emit('adminSocketCall', { obj, total: breakCounts });
      var msg2 = 'adminSocketCall'
        var socket1 = await adminSocket(id_user, msg2,obj);
      console.log('adminSocketCall................',obj, breakCounts)
    }
    catch (err) {
      console.log(err)
    }
  }); //

  router.get('/startCampaign', async function (req, res, next) {       //campaign agent login
    try {
      // console.log("startCampaign socket connected -------->")
      // var agentId = req.query.agentId;
      // var channel = req.query.channel;
      // var id_campaign = req.query.campaignId;
      // var id_user = Number(req.query.id_user);
      // // id_user = 'admin_' +`${id_user}`;
      // if (agentId != undefined) {
      //   agentId = Number(agentId)
      //   var today = new Date();
      //   var dd = today.getDate();
      //   var mm = today.getMonth() + 1;
      //   var yyyy = today.getFullYear();
      //   var hours = today.getHours();
      //   var min = today.getMinutes();
      //   var sec = today.getSeconds();
      //   var date = `${yyyy}-${mm}-${dd}`
      //   var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`
      //   var loginUpdate = `UPDATE cc_user_campaign SET currentStatus = '1',loginStartTime = '${todayDate}',agentChannel = '${channel}' WHERE user_id = '${agentId}' and id_campaign = '${id_campaign}'`;
      //   var [loginUpdateRes] = await sequelize.query(loginUpdate);
      //   var campaignSummary = `UPDATE cc_campaign_call_summary SET agent_on_live = agent_on_live + 1 WHERE campaign_id = '${id_campaign}' and user_id = '${agentId}' AND DATE(createdAt) = '${date}' `;
      //   var [campaignSummaryRes] = await sequelize.query(campaignSummary);
      //   var agentNameSql = `select name from agents where id = '${agentId}'`;
      //   var [agentNameRes] = await sequelize.query(agentNameSql);
      //   // io.to(agentId).emit('startCampaign', channel);
      //   var msg1 = 'receivedMessage'
      //   var socket1 = await userSocket(agentId, msg1, channel);
      //   // io.to(id_user).emit('adminCampaignLiveReport');
      //   var msg3 = 'adminCampaignLiveReport'
      //   var socket3 = await adminSocket(id_user, msg3);
      //   var liveReportObj = {
      //     agentId: agentId,
      //     status: "available",
      //     event: "login",
      //     name:agentNameRes[0].name,
      //     campaignId:id_campaign
      //   }
      //   // io.to(id_user).emit('campaignLiveReportAgent', { liveReportObj });
      //   var msg2 = 'campaignLiveReportAgent'
      //   var socket2 = await adminSocket(id_user, msg2,liveReportObj);
      //   // io.to(agentId).emit('agentCampaignReport'); // for agent login pie graph
      // }
      var data = await developmentCallEvent.startCampaign(req.query)
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/campaignDestinationChannel', async function (req, res, next) {
    try {
      // var agentId = req.query.agentId;
      // var id_campaign = req.query.campaignId;
      // var phonebook_id = req.query.phoneBookId;
      // var destinationChannel = req.query.destinationChannel;
      // var delay_time = req.query.delay_time;
      // var uniqueId = req.query.uniqueId;
      // var status = req.query.status;
      // var id_user = Number(req.query.id_user);
      // // id_user = 'admin_' +`${id_user}`;
      // var today = new Date();
      // var dd = today.getDate();
      // var mm = today.getMonth() + 1;
      // var yyyy = today.getFullYear();
      // var date = `${yyyy}-${mm}-${dd}`
      // if (agentId != undefined) {
      //   agentId = Number(agentId)
      //   var campaignSummary = `UPDATE cc_campaign_call_summary SET delay_time = '${delay_time}' WHERE campaign_id = '${id_campaign}' and phonebook_id = '${phonebook_id}' and user_id = '${agentId}' AND DATE(createdAt) = '${date}' `;
      //   var [campaignSummaryRes] = await sequelize.query(campaignSummary);
      //   // io.to(agentId).emit('campaignDestinationChannel', destinationChannel);
      //   var msg1 = 'campaignDestinationChannel'
      //   var socket1 = await userSocket(agentId, msg1, destinationChannel);
      //   // io.to(id_user).emit('adminCampaignLiveReport');
      //   var msg3 = 'adminCampaignLiveReport'
      //   var socket3 = await adminSocket(id_user, msg3);
      //   var livecallObj = {
      //     uniqueId:uniqueId,
      //     status:status
      //   }
      //   // io.to(id_user).emit('liveCalls',{ livecallObj });
      //   var msg2 = 'liveCalls'
      //   var socket2 = await adminSocket(id_user, msg2,liveReportObj);
      //   console.log("liveCalls............................", livecallObj)
      //   // io.to(id_user).emit('dashboardLivecalls');
      //   var msg = 'dashboardLivecalls'
      //   var socket = await adminSocket(id_user, msg);
      // }
      var data = await developmentCallEvent.campaignDestinationChannel(req.query)
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); // 
  router.get('/campaignSourceChannel', async function (req, res, next) {            //start campagin call (event)
    try {
      // var today = new Date();
      // var dd = today.getDate();
      // var mm = today.getMonth() + 1;
      // var yyyy = today.getFullYear();
      // var hours = today.getHours();
      // var min = today.getMinutes();
      // var sec = today.getSeconds();
      // var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`
      // var agentId = req.query.agentId;
      // var sourceChannel = req.query.sourceChannel;
      // var uniqueId = req.query.uniqueId;
      // var status = req.query.status;
      // var id_campaign = req.query.campaignId;
      // var id_user = Number(req.query.id_user);
      // // id_user = 'admin_' +`${id_user}`;
      // var obj = {
      //   sourceChannel: sourceChannel,
      //   uniqueId: uniqueId
      // }
      // var liveReportObj = {
      //   agentId: agentId,
      //   status: "on_call",
      //   event: "start",
      //   campaignId:id_campaign
      // }
      // if (agentId != undefined) {
      //   agentId = Number(agentId)
      //   // io.to(agentId).emit('campaignSourceChannel', { obj });
      //   var msg1 = 'campaignSourceChannel'
      //   var socket1 = await userSocket(agentId, msg1, obj);
      //   // io.to(id_user).emit('adminCampaignLiveReport');
      //   var msg = 'adminCampaignLiveReport'
      //   var socket = await adminSocket(id_user, msg);
      //   var livecallObj = {
      //     uniqueId:uniqueId,
      //     status:status
      //   }
      //   // io.to(id_user).emit('liveCalls',{ livecallObj });
      //   var msg2 = 'liveCalls'
      //   var socket2 = await adminSocket(id_user, msg2,livecallObj);
      //   console.log("liveCalls............................", livecallObj)
      //   // io.to(id_user).emit('campaignLiveReportAgent', { liveReportObj });
      //   var msg3 = 'campaignLiveReportAgent'
      //   var socket3 = await adminSocket(id_user, msg3,liveReportObj);
      //   var loginUpdate = `UPDATE agents SET currentCallStatus = '3' WHERE id = '${agentId}' `;
      //   var [loginUpdateRes] = await sequelize.query(loginUpdate);
      // }
      var data = await developmentCallEvent.campaignSourceChannel(req.query,req.query.status)
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //

  router.get('/deleteCampaign', async function (req, res, next) {
    try {
      var id_campaign = req.query.campaignId;
      var id_user = Number(req.query.id_user);
      // id_user = 'admin_' +`${id_user}`;
      var agentSql = `SELECT user_id as id_agent FROM cc_user_campaign WHERE id_campaign = '${id_campaign}' and currentStatus In(1,2) `;
      var [agentRes] = await sequelize.query(agentSql);
      if (agentRes.length != 0) {
        var agent = [];
        agentRes.map(async data => {
          agent.push(data.id_agent)
          var agentId = Number(data.id_agent)
          // io.to(agentId).emit('deleteCampaign', id_campaign);
          var msg1 = 'deleteCampaign'
         var socket1 = await userSocket(agentId, msg1, id_campaign);
        });
        // io.to(id_user).emit('adminCampaignLiveReport');
        var msg2 = 'adminCampaignLiveReport'
        var socket2 = await adminSocket(id_user, msg2);
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var hours = today.getHours();
        var min = today.getMinutes();
        var sec = today.getSeconds();
        var date = `${yyyy}-${mm}-${dd}`
        var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`
        var loginUpdate = `UPDATE cc_user_campaign SET currentStatus = '0',logoutTime = '${todayDate}' WHERE user_id IN (${agent}) `;
        var [loginUpdateRes] = await sequelize.query(loginUpdate);
        var campaignSummary = `UPDATE cc_campaign_call_summary SET agent_on_live = CASE WHEN (agent_on_live > 0) THEN agent_on_live - 1 ELSE 0 END WHERE  campaign_id = '${id_campaign}' and user_id IN (${agent}) AND DATE(createdAt) = '${date}'`;
        var [campaignSummaryRes] = await sequelize.query(campaignSummary);
      }
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/campaignAgentLogout', async function (req, res, next) {             //campaign agent logout
    try {
      // var id_campaign = req.query.campaignId;
      // var agentId = Number(req.query.agentId);
      // var id_user = Number(req.query.id_user);
      // // id_user = 'admin_' +`${id_user}`;
      // console.log("campaignAgentLogout.............................", agentId)
      // // io.to(agentId).emit('campaignAgentLogout', agentId);
      // var msg1 = 'campaignAgentLogout'
      // var socket1 = await userSocket(agentId, msg1, agentId);
      // // io.to(id_user).emit('adminCampaignLiveReport');
      // var msg2 = 'adminCampaignLiveReport'
      // var socket2 = await adminSocket(id_user, msg2);
      // // io.to(agentId).emit('agentCampaignReport', id_campaign); // for agent login pie graph
      // var msg3 = 'agentCampaignReport'
      // var socket3 = await adminSocket(id_user, msg3,id_campaign);
      // var agentNameSql = `select CONCAT(user.first_name, ' ', user.last_name) AS name from user where id = '${agentId}'`;
      // var [agentNameRes] = await sequelize.query(agentNameSql);
      // var liveReportObj = {
      //   agentId: agentId,
      //   status: "logout",
      //   event: "logout",
      //   name:agentNameRes[0].name,
      //   campaignId:id_campaign
      // }
      // // io.to(id_user).emit('campaignLiveReportAgent', { liveReportObj });
      // var msg4 = 'campaignLiveReportAgent'
      // var socket4 = await adminSocket(id_user, msg4,id_campaign);
      // var today = new Date();
      // var dd = today.getDate();
      // var mm = today.getMonth() + 1;
      // var yyyy = today.getFullYear();
      // var hours = today.getHours();
      // var min = today.getMinutes();
      // var sec = today.getSeconds();
      // var date = `${yyyy}-${mm}-${dd}`
      // var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`
      // var loginUpdate = `UPDATE cc_user_campaign SET currentStatus = '0',logoutTime = '${todayDate}' WHERE user_id = '${agentId}' and id_campaign = '${id_campaign}'`;
      // var [loginUpdateRes] = await sequelize.query(loginUpdate);
      // var campaignSummary = `UPDATE cc_campaign_call_summary SET agent_on_live = CASE WHEN (agent_on_live > 0) THEN agent_on_live - 1 ELSE 0 END WHERE  campaign_id = '${id_campaign}' and user_id IN (${agentId}) AND DATE(createdAt) = '${date}' `;
      // var [campaignSummaryRes] = await sequelize.query(campaignSummary);
      var data = await developmentCallEvent.campaignAgentLogout(req.query)
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/click_to_call_end', async function (req, res, next) {
    try {
      // var agentId = req.query.agentId;
      // var campaignId = req.query.campaignId;
      // var is_data_submited = req.query.isDataSubmited;
      // var call_end_time = req.query.callEndTime;
      // var uniqueId = req.query.uniqueId;
      // var status = req.query.status;
      // var id_user = Number(req.query.id_user);
      // // id_user = 'admin_' +`${id_user}`;
      // var agentCoutSql = `SELECT user_id as id_agent FROM cc_user_campaign WHERE id_campaign = '${campaignId}' `;
      // var [agentCoutRes] = await sequelize.query(agentCoutSql);
      // if (agentId != undefined) {
      //   agentId = Number(agentId)
      //   // io.to(agentId).emit('click_to_call_end', agentId);
      //   var msg1 = 'click_to_call_end'
      //   var socket1 = await userSocket(agentId, msg1, agentId);
      //   // io.to(id_user).emit('adminCampaignLiveReport');
      //   var msg2 = 'adminCampaignLiveReport'
      //   var socket2 = await adminSocket(id_user, msg2);
      //   var livecallObj = {
      //     uniqueId:uniqueId,
      //     status:status
      //   }
      //   // io.to(id_user).emit('liveCalls',{ livecallObj });
      //   var msg3 = 'liveCalls'
      //   var socket3 = await adminSocket(id_user, msg3,livecallObj);
      //   console.log("liveCalls............................", livecallObj)
      //   // io.to(id_user).emit('dashboardLivecalls');
      //   var msg4 = 'dashboardLivecalls'
      //   var socket4 = await adminSocket(id_user, msg4);
      //   var liveReportObj = {
      //     agentId: agentId,
      //     status: "end",
      //     event: "end",
      //     is_data_submited: is_data_submited,
      //     campaignId:campaignId
      //   }
      //   // io.to(id_user).emit('campaignLiveReportAgent', { liveReportObj });
      //   var msg5 = 'dashboardLivecalls'
      //   var socket5 = await adminSocket(id_user, msg5,liveReportObj);
      //   if(call_end_time != undefined){
      //     var loginUpdate = `UPDATE agents SET currentCallStatus = '0',lastCallEndTime = '${call_end_time}' WHERE id = '${agentId}' `;
      //     var [loginUpdateRes] = await sequelize.query(loginUpdate);
      //   }
      // }
      // if (agentCoutRes != undefined) {
      //   agentCoutRes.map(async data => {
      //     var agent = Number(data.id_agent)
      //     // io.to(agent).emit('agentCampaignReport', campaignId); // for agent login pie graph
      //     var msg6 = 'agentCampaignReport'
      //    var socket6 = await userSocket(agent, msg6, campaignId);
      //     console.log(agent)
      //   });
      // }
      var data = await developmentCallEvent.click_to_call_end(req.query)
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/connectedCampaigncall', async function (req, res, next) {          //connect campagin call event
    try {
      // var today = new Date();
      // var dd = today.getDate();
      // var mm = today.getMonth() + 1;
      // var yyyy = today.getFullYear();
      // var hours = today.getHours();
      // var min = today.getMinutes();
      // var sec = today.getSeconds();
      // var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`
      // var agentId = req.query.agentId;
      // var uniqueId = req.query.uniqueId;
      // var status = req.query.status;
      // var campaignId = req.query.campaignId;
      // var id_user = Number(req.query.id_user);
      // // id_user = 'admin_' +`${id_user}`;
      // if (agentId != undefined) {
      //   agentId = Number(agentId)
      //   var liveReportObj = {
      //     agentId: agentId,
      //     status: "on_call",
      //     event: "connect",
      //     campaignId:campaignId
      //   }
      //   // io.to(agentId).emit('connectedCampaigncall', agentId);
      //   var msg1 = 'connectedCampaigncall'
      //   var socket1 = await userSocket(agentId, msg1, agentId);
      //   // io.to(id_user).emit('adminCampaignLiveReport');
      //   var msg2 = 'adminCampaignLiveReport'
      //   var socket2 = await adminSocket(id_user, msg2);
      //   var livecallObj = {
      //     uniqueId:uniqueId,
      //     status:status
      //   }
      //   // io.to(id_user).emit('liveCalls',{ livecallObj });
      //   var msg3 = 'liveCalls'
      //   var socket3 = await adminSocket(id_user, msg3,livecallObj);
      //   console.log("liveCalls............................", livecallObj)
      //   // io.to(id_user).emit('campaignLiveReportAgent', { liveReportObj });
      //   var msg4 = 'campaignLiveReportAgent'
      //   var socket4 = await adminSocket(id_user, msg4,liveReportObj);
      //   var loginUpdate = `UPDATE agents SET currentCallStatus = '4',currentCallAnsTime = '${todayDate}' WHERE id = '${agentId}' `;
      //   var [loginUpdateRes] = await sequelize.query(loginUpdate);
      // }
      var data = await developmentCallEvent.connectedCampaigncall(req.query)
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/updateCampaignStatus', async function (req, res, next) {
    try {
      var agentId = req.query.agentId;
      var campaign_id = Number(req.query.campaign_id);
      var id_user = Number(req.query.id_user);
      // id_user = 'admin_' +`${id_user}`;
      var status = req.query.status;
      var obj = {
        campaign_id: campaign_id,
        status: status
      }
      if (agentId != undefined) {
        agentId.map(async data => {
          var agent = Number(data.id_agent)
          // io.to(agent).emit('updateCampaignStatus', { obj });
          var msg1 = 'updateCampaignStatus'
        var socket1 = await userSocket(agent, msg1, obj);
          console.log(agent)
        });
      }
      // io.to(id_user).emit('updateAdminCampaignStatus ', { obj });
      var msg2 = 'updateAdminCampaignStatus'
      var socket2 = await adminSocket(id_user, msg2,obj);
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/updateBroadcastCampaign', async function (req, res, next) {
    try {
      var id_user = Number(req.query.id_user);
      // id_user = 'admin_' +`${id_user}`;
      var campaign_id = Number(req.query.campaign_id);
      // io.to(id_user).emit('updateBroadcastCampaign', campaign_id);
      var msg2 = 'updateBroadcastCampaign'
      var socket2 = await adminSocket(id_user, msg2,campaign_id);
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); // 
  router.get('/campaignCallHold', async function (req, res, next) {
    try {
      var agentId = Number(req.query.agentId);
      var id_user = Number(req.query.id_user);
      // id_user = 'admin_' +`${id_user}`;
      var campaignId = req.query.campaignId;
      var liveReportObj = {
        agentId: agentId,
        status: "on_hold",
        event: "hold",
        campaignId:campaignId
      }
      // io.to(id_user).emit('campaignLiveReportAgent', { liveReportObj });
      var msg2 = 'campaignLiveReportAgent'
      var socket2 = await adminSocket(id_user, msg2,liveReportObj);
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); // 
  router.get('/campaignCallUnhold', async function (req, res, next) {
    try {
      var agentId = Number(req.query.agentId);
      var campaignId = req.query.campaignId;
      var id_user = Number(req.query.id_user);
      // id_user = 'admin_' +`${id_user}`;
      var liveReportObj = {
        agentId: agentId,
        status: "unhold",
        event: "unhold",
        campaignId:campaignId
      }
      // io.to(id_user).emit('campaignLiveReportAgent', { liveReportObj });
      var msg2 = 'campaignLiveReportAgent'
      var socket2 = await adminSocket(id_user, msg2,liveReportObj);
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/campaignAcw', async function (req, res, next) {
    try {
      var agentId = Number(req.query.agentId);
      var campaignId = req.query.campaignId;
      var id_user = Number(req.query.id_user);
      // id_user = 'admin_' +`${id_user}`;
      var liveReportObj = {
        agentId: agentId,
        status: "acw_end",
        event: "acw_end",
        campaignId:campaignId
      }
      // io.to(id_user).emit('campaignLiveReportAgent', { liveReportObj });
      var msg2 = 'campaignLiveReportAgent'
      var socket2 = await adminSocket(id_user, msg2,liveReportObj);
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/campaignStatus', async function (req, res, next) {
    try {
      var agentId = req.query.agentId;
      var status = req.query.status;
      var campaignId = req.query.campaign_id;
      var id_user = Number(req.query.id_user);
      // id_user = 'admin_' +`${id_user}`;
      if (agentId != undefined) {
        var liveReportObj = {
          agentId: agentId,
          campaignId:campaignId
        }
        if(status == 2){
          liveReportObj.status = "paused",
          liveReportObj.event = "paused"
        }
        if(status == 1){
          liveReportObj.status = "available",
          liveReportObj.event = "available"
        }
        // io.to(id_user).emit('campaignLiveReportAgent', { liveReportObj });
        var msg2 = 'campaignLiveReportAgent'
       var socket2 = await adminSocket(id_user, msg2,liveReportObj);
      }
      
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/remarks_skip_update', async function (req, res, next) {
    try {
      var agentId = req.query.agentId;
      var campaignId = req.query.campaignId;
      var is_data_submited = req.query.isDataSubmited;
      var uniqueId = req.query.uniqueId;
      var status = req.query.status;
      var id_user = Number(req.query.id_user);
      // id_user = 'admin_' +`${id_user}`;
      if (agentId != undefined) {
        agentId = Number(agentId)
        // io.to(id_user).emit('adminCampaignLiveReport');
        var msg2 = 'adminCampaignLiveReport'
        var socket2 = await adminSocket(id_user, msg2);
        var livecallObj = {
          uniqueId:uniqueId,
          status:status
        }
        // io.to(id_user).emit('liveCalls',{ livecallObj });
        var msg3 = 'liveCalls'
        var socket3 = await adminSocket(id_user, msg3,livecallObj);
        console.log("liveCalls............................", livecallObj)
        // io.to(id_user).emit('dashboardLivecalls');
        var msg4 = 'dashboardLivecalls'
        var socket4 = await adminSocket(id_user, msg4);
        var liveReportObj = {
          agentId: agentId,
          status: "end",
          event: "end",
          is_data_submited: is_data_submited,
          campaignId:campaignId
        }
        // io.to(id_user).emit('campaignLiveReportAgent', { liveReportObj });
        var msg4 = 'dashboardLivecalls'
        var socket4 = await adminSocket(id_user, msg4);
        console.log("campaignLiveReportAgent............................", liveReportObj)
      }
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //

  router.get('/updateReminder', async function (req, res, next) {
    try {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var currentDate = `${yyyy}-${mm}-${dd}`
      console.log("reminder update.............................................................")
      var agentId = Number(req.query.agentId);
      var obj = req.query.data;
      var reminderDate = new Date(obj.reminder_date);
      var reminder_dd = reminderDate.getDate();
      var reminder_mm = reminderDate.getMonth() + 1;
      var reminder_yyyy = reminderDate.getFullYear();
      var reminder_date = `${reminder_yyyy}-${reminder_mm}-${reminder_dd}`
      if(currentDate == reminder_date){
        if (agentId && agentId != undefined)
        io.to(agentId).emit('updateReminder', obj);
        console.log(obj)
      }
    }
    catch (err) {
      console.log(err)
    }
  }); //
  router.get('/reminderComplete', async function (req, res, next) {
    try {
      var agentId = Number(req.query.agentId);
        if (agentId && agentId != undefined)
        io.to(agentId).emit('reminderComplete', agentId);
        console.log("reminderComplete.............")
        console.log(agentId)
    }
    catch (err) {
      console.log(err)
    }
  }); // 
  router.get('/uploadReminder', async function (req, res, next) {
    try {
      console.log("reminder uploadReminder.............................................................")
      var agentId = Number(req.query.agentId);
      var obj = req.body;
      if (agentId && agentId != undefined)
        io.to(agentId).emit('uploadReminder', obj);
      console.log(obj)
    }
    catch (err) {
      console.log(err)
    }
  }); // 
  router.get('/deleteReminder', async function (req, res, next) {
    try {
      console.log("delete.............................................................")
      var agentId = Number(req.query.agentId);
      var id = req.query.id;
      if (agentId && agentId != undefined)
        io.to(agentId).emit('deleteReminder', id);
      console.log(id)
      console.log(agentId)
    }
    catch (err) {
      console.log(err)
    }
  }); //
  router.get('/check_shedule', async function (req, res, next) {
    try {
      var r = req.query.name;
      const schedule = require('node-schedule');

      // Schedule a job to run at 2:25 PM every day
      const job = schedule.scheduleJob('00 00 * * *', () => {
        // Your code to run at 2:25 PM every day
        console.log('Scheduled job ran at 2:25 PM.');
      });
    }
    catch (err) {
      console.log(err)
    }
  });
  router.get('/agentForceLogout', async function (req, res, next) {
    try {
      var agentId = req.query.agentId;
      agentId = Number(agentId)
      if (agentId != undefined)
        io.to(agentId).emit('agentForceLogout', agentId);
      console.log(agentId)
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //not using this api and socket
  router.get('/campaignPausedRecharge', async function (req, res, next) {
    try {
      var campaign_id = Number(req.query.campaign_id);
      var id_user = Number(req.query.id_user);
      // id_user = 'admin_' +`${id_user}`;
      io.to(id_user).emit('campaignPausedRecharge', campaign_id);
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //campaign paused on no balance socket

  router.get('/userForceLogout',isAuthenticated, async function (req, res, next) {
    try {
      var agent_id = Number(req.query.agent_id);
      var user_id = Number(req.query.user_id)
      var isSubAdmin = req.token.isSubAdmin;
      var isDept = req.token.isDept;
      var isAdmin = req.token.isAdmin;
      if(isAdmin == 1){
        var id_user = Number(req.token.id)
        var id_department = Number(req.token.id_department)
      }
      if(isDept == 1){
        var id_user = Number(req.token.id_user)
        var id_department = Number(req.token.id)
      }
      if(isSubAdmin == 1){
        var id_user = Number(req.token.id_user)
        var id_department = Number(req.query.id_department)
      }
      if (user_id != undefined) {
        // var islogin = `UPDATE user SET isLogin= 0 WHERE id = '${user_id}'`;
        // var [isloginRes] = await sequelize.query(islogin);
        var updateSql = `UPDATE user_live_data SET logged_in = '0',currentBreakId = '2', currentBreakName = 'Logout' WHERE user_id = '${user_id}'`;
        var [Res] = await sequelize.query(updateSql);
        var tokenUpdate = `DELETE FROM login_logs where id_agent = '${user_id}' `;
        var [tokenUpdateRes] = await sequelize.query(tokenUpdate);
        var msg = 'userForceLogout'
        var socket = await userSocket(user_id, msg, user_id);
        var msg1 = 'dashboardUserForceLogout'
        var socket1 = await adminSocket(id_user, msg1, user_id);
        var today = new Date();
        var obj = {
          agentId: user_id,
          breakName: "Logout",
          breakId: 1,
          time: today
        }
        var msg2 = 'startAdminMonitoring'
        var socket2 = await adminSocket(id_user, msg2, obj);
        if(id_department != 0){
          var socket3 = await departmentSocket(id_department, msg2, obj);
        }
        // io.to(user_id).emit('userForceLogout', user_id);
        console.log("userForceLogout..............", user_id)
        console.log("dashboardUserForceLogout..............", user_id)
      }
    }
    catch (err) {
      console.log(err)
    }
    // res.send("succesfull response");
    var status = {
      'status': true,
      'message': "succesfull response",
      result: user_id,
  }
  res.status(200).json(status);
  });
  router.get('/didForceLogout',isAuthenticated, async function (req, res, next) {
    try {
      var did = req.query.did;
        var msg = 'didForceLogout'
        var socket = await didSocket(did, msg, did);
    }
    catch (err) {
      console.log(err)
    }
    // res.send("succesfull response");
    var status = {
      'status': true,
      'message': "succesfull response",
      result: did,
  }
  res.status(200).json(status);
  });
  router.get('/smartgroupForceLogout',isAuthenticated, async function (req, res, next) {
    try {
      var smartgroupId = Number(req.query.smartgroupId);
        var msg = 'smartgroupForceLogout'
        var socket = await smartgroupSocket(smartgroupId, msg, smartgroupId);
    }
    catch (err) {
      console.log(err)
    }
    // res.send("succesfull response");
    var status = {
      'status': true,
      'message': "succesfull response",
      result: smartgroupId,
  }
  res.status(200).json(status);
  });
  router.get('/departmentForceLogout', async function (req, res, next) {
    try {
      var id = Number(req.query.id);
      var token = req["headers"].token
      var tokenUpdate = `DELETE FROM login_logs where id_department = '${id}' `;
      var [tokenUpdateRes] = await sequelize.query(tokenUpdate);
      var deptId = 'deptId_' +`${id}`;
      console.log(deptId)
      // io.to(deptId).emit('departmentForceLogout',id);
      var msg = 'departmentForceLogout'
      var socket = await departmentSocket(id, msg, id);
      console.log("departmentForceLogout...............", id)
    }
    catch (err) {
      console.log(err)
    }
    // res.send("succesfull response");
    var status = {
      'status': true,
      'message': "succesfull response",
      result: id,
  }
  res.status(200).json(status);
  });
  router.get('/subadminForceLogout', async function (req, res, next) {
    try {
      var id = Number(req.query.id);
      var subAdminId = 'subAdminId_' +`${id}`;
      console.log(subAdminId)
      var token = req["headers"].token
      var tokenUpdate = `DELETE FROM login_logs where subadmin_id = '${id}' `;
      var [tokenUpdateRes] = await sequelize.query(tokenUpdate);
      // io.to(subAdminId).emit('subadminForceLogout', id);
      var msg = 'subadminForceLogout'
      var socket = await subadminSocket(id, msg, id);
      console.log("subadminForceLogout...............", id)
    }
    catch (err) {
      console.log(err)
    }
    // res.send("succesfull response");
    var status = {
      'status': true,
      'message': "succesfull response",
      result: id,
  }
  res.status(200).json(status);
  });
  router.get('/smartGroupMonitoring', async function (req, res, next) {
    try {
      var id = Number(req.query.id);
      var id_user =  Number(req.query.id_user);
      var msg = 'smartGroupMonitoring'
      var socket = await adminSocket(id_user, msg, id);
      console.log("smartGroupMonitoring...............", id)
    }
    catch (err) {
      console.log(err)
    }
    // res.send("succesfull response");
    var status = {
      'status': true,
      'message': "succesfull response",
      result: id,
  }
  res.status(200).json(status);
  });

  router.get('/updateDepartmentPermission', async function (req, res, next) {
    try {
      var id = Number(req.body.id);
      var deptId = 'deptId_' +`${id}`;
      var socketPermissionArr = req.body.socketPermissionArr
      io.to(deptId).emit('updateDepartmentPermission', socketPermissionArr);
      console.log("updateDepartmentPermission..............", id)
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/updateSubadminPermission', async function (req, res, next) {
    try {
      var id = Number(req.body.id);
      var subAdminId = 'subAdminId_' +`${id}`;
      var socketPermissionArr = req.body.socketPermissionArr
      io.to(subAdminId).emit('updateSubadminPermission', socketPermissionArr);
      console.log("updateSubadminPermission..............", id)
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //

  router.get('/resetPassword', async function (req, res, next) {
    try {
      var id = req.query.id;
      id = Number(id)
      // id = 'admin_' +`${id}`;
      if (id != undefined)
      io.to(id).emit('resetPassword', id);
      console.log('resetPassword......',id)
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/resetPasswordDepartment', async function (req, res, next) {
    try {
      var id = req.query.id;
      id = Number(id)
      id = 'deptId_' +`${id}`;
      if (id != undefined)
      io.to(id).emit('resetPasswordDepartment', id);
      console.log('resetPasswordDepartment......',id)
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //
  router.get('/resetPasswordSubadmin', async function (req, res, next) {
    try {
      var id = req.query.id;
      id = Number(id)
      id = 'subAdminId_' +`${id}`;
      if (id != undefined)
      io.to(id).emit('resetPasswordSubadmin', id);
      console.log('resetPasswordSubadmin......',id)
    }
    catch (err) {
      console.log(err)
    }
    res.send("succesfull response");
  }); //


router.post('/add_call_flow_report',isAuthenticated, callFlowReport.add_call_flow_report, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
        var status = {
            'status': false,
            'message': "No result Found",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
        }
        res.status(200).json(status);
    }
});
router.post('/delete_call_flow_report',isAuthenticated, callFlowReport.delete_call_flow_report, function (req, res, next) {
  if (res.locals.result == 'err') {
      var status = {
          'status': false,
          'message': "Something went wrong",
          result: []
      }
      res.status(202).json(status);
  }
  else if (res.locals.result.length == 0) {
      var status = {
          'status': false,
          'message': "No result Found",
          result: [],
      }
      res.status(201).json(status);
  }
  else {
      var status = {
          'status': true,
          'message': "succesfull response",
          result: res.locals.result,
      }
      res.status(200).json(status);
  }
});
router.post('/add_callreport', callFlowReport.add_callreport, function (req, res, next) {
  if (res.locals.result == 'err') {
      var status = {
          'status': false,
          'message': "Something went wrong",
          result: []
      }
      res.status(202).json(status);
  }
  else if (res.locals.result.length == 0) {
      var status = {
          'status': false,
          'message': "No result Found",
          result: [],
      }
      res.status(201).json(status);
  }
  else {
      var status = {
          'status': true,
          'message': "succesfull response",
          result: res.locals.result,
      }
      res.status(200).json(status);
  }
});
router.post('/add_livecall', callFlowReport.add_livecall, function (req, res, next) {
  if (res.locals.result == 'err') {
      var status = {
          'status': false,
          'message': "Something went wrong",
          result: []
      }
      res.status(202).json(status);
  }
  else if (res.locals.result.length == 0) {
      var status = {
          'status': false,
          'message': "No result Found",
          result: [],
      }
      res.status(201).json(status);
  }
  else {
      var status = {
          'status': true,
          'message': "succesfull response",
          result: res.locals.result,
      }
      res.status(200).json(status);
  }
});
router.post('/add_call_flow_smart_group', callFlowReport.add_call_flow_smart_group, function (req, res, next) {
  if (res.locals.result == 'err') {
      var status = {
          'status': false,
          'message': "Something went wrong",
          result: []
      }
      res.status(202).json(status);
  }
  else if (res.locals.result.length == 0) {
      var status = {
          'status': false,
          'message': "No result Found",
          result: [],
      }
      res.status(201).json(status);
  }
  else {
      var status = {
          'status': true,
          'message': "succesfull response",
          result: res.locals.result,
      }
      res.status(200).json(status);
  }
});


return router;
}
  
