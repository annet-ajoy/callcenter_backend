// var callReportModel = require('../model/callFlowReportModel')
// var smartGroupReport = require('../model/smartGroupReport');
// const callEventDBactions = require('./callEventSqlFun');
const config = require('../config/config');
const redis = config.redis
var developmentCallEvent = require('./DevelopmentCallEvents')
var liveCallEvent = require('./liveCallEvents')
const { calleventlog,clickTocallLog,logMessage } = require('../logger');
const {  string_decode } = require('../helper/auth');
const querystring = require('querystring');
const sequelize = require('../database').db;
const crypto = require('crypto');
const callByotApi = require('./callByotApi');
const LiveCall = require("../model/livecallsModel");
const amqp = require('amqplib');

// var ami = new require('asterisk-manager')(process.env.ASTERISK_PORT, process.env.ASTERISK_IP, process.env.ASTERISK_GATE, process.env.ASTERISK_PASSWORD, true);
// ami.keepConnected();
// ami.on('userevent', async function (evt) {

//   if (evt) {
//      event_handling(evt)
//   }
// })

async function resumeCallFromHold(uniqueNum, now, userId,id_user,id_department, type) {
  try {
    const last_activity_time = type === "hangup" ? getISTTimePlus(72) : undefined;
    await UserLiveData.update({ last_activity_time }, { where: { user_id: userId } });
    
    const redisDataStr = await redis.get(uniqueNum);
    if (!redisDataStr) return;
    
    const redisData = JSON.parse(redisDataStr);
    if(!redisData[0]?.holded_time) return;
    now += 72 * 1000;

    if (process.env.PRODUCTION == 'developmentLive' || process.env.PRODUCTION == 'development') {
      developmentCallEvent.agentActivityCallHoldSocket(userId, id_user, 2, id_department)
    } else {
      liveCallEvent.agentActivityCallHoldSocket(userId, id_user, 2, id_department)
    }
  
    // Convert duration to seconds
    const heldDuration = Math.floor((now - redisData[0].holded_time) / 1000);
    redisData[0].total_hold_time = (redisData[0].total_hold_time || 0) + heldDuration;
    delete redisData[0].holded_time;

    await redis.set(uniqueNum, JSON.stringify(redisData));

    // Update DB with total hold time (in seconds)
    await Promise.all([
      LiveCall.update({
        total_hold_time: redisData[0].total_hold_time, holded_time: null }, { where: { uniqueId: uniqueNum } }),
      UserLiveData.update({ isHold: 0, holded_time: null }, { where: { user_id: userId } }),
    ]);

  } catch (error) {
    console.log("Error updating total call duration", error);
  }
}


async function updateHoldDuration(uniqueNum, now, userId) {
  try {
    now += 72 * 1000;

    const redisDataStr = await redis.get(uniqueNum);

    const redisDataArray = redisDataStr ? JSON.parse(redisDataStr) : [];
  
    // Only set holdedTime if it's not already on hold
    if (redisDataArray != "" && !redisDataArray[0].holded_time) {
      redisDataArray[0].holded_time = now;
      await redis.set(uniqueNum, JSON.stringify(redisDataArray));
  
      await Promise.all([
        LiveCall.update({ holded_time: now }, { where: { uniqueId: uniqueNum } }),
        UserLiveData.update({ isHold: 1,holded_time: now}, { where: { user_id: userId } }),
      ]) 
      
    }
  } catch (error) {
    console.log("Error updating call duration", error);
  }
}

async function event_handling(evt,dd){
  
  const encodedString = evt.data
    if (encodedString != undefined) {
      const decodedString = decodeURIComponent(encodedString);
      const callData = JSON.parse(decodedString);
      var customerId = callData.customerId;
      const cachedData = await redis.get(callData.uniqueId+"_socket");
      if (cachedData) {
        var t = JSON.parse(cachedData)
        customerId = t[0].customerId
      }
      if(callData.project == "demo_cc_voxbay" || callData.project == "cc_voxbay"){
        if(callData.customerId != undefined){
          customerId = callData.customerId
        }
      }
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var hours = today.getHours();
      var min = today.getMinutes();
      var sec = today.getSeconds();
      var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`;
      if (process.env.CALLEVENT == "stop") {
        if (process.env.PRODUCTION == 'live') {
          calleventlog("current date time ---------------- >"+todayDate)
          console.log("current date time ---------------- >",todayDate)
          calleventlog("evt---------------- >")
          calleventlog(evt)
          calleventlog("callData---------------- >")
          calleventlog(callData)
          liveCallEvent.developmentCallEvent(evt, callData)
        }
      } else {
        if (process.env.PRODUCTION == 'developmentLive' || process.env.PRODUCTION == 'development') {
          if(callData.callFlowId == 487){
            console.log("evt---------------- >",evt)
            console.log("callData---------------- >",callData)
            console.log("cachedData---------------- >",cachedData)
          }
          if (customerId == '13' || customerId == '3296' || customerId == '3306') {
            calleventlog("current date time ---------------- >"+todayDate)
          console.log("current date time ---------------- >",todayDate)
          console.log("evt ---------------- >",evt)
          console.log("callData ---------------- >",callData)
          calleventlog("evt---------------- >")
          calleventlog(evt)
          calleventlog("callData---------------- >")
          calleventlog(callData)
            developmentCallEvent.developmentCallEvent(evt, callData)
          }
        } else {
          if (customerId != '13' && customerId != '3296' && customerId != '3306') {
            if(dd != undefined){
              console.log("events from rabbit ---->",evt)
            }
            calleventlog("current date time ---------------- >"+todayDate)
            console.log("current date time ---------------- >",todayDate)
            calleventlog("evt---------------- >")
            calleventlog(evt)
            calleventlog("callData---------------- >")
            calleventlog(callData)
            liveCallEvent.developmentCallEvent(evt, callData)
          }
        }
      }
    }
}
if (process.env.PRODUCTION == 'live') {
  async function hybridCallEvents(evt) {
    const callReport = require('./callReport')
    const encodedString = evt.data
    if (encodedString != undefined) {
      const decodedString = decodeURIComponent(encodedString);
      const callData = JSON.parse(decodedString);
      var customerId = callData.customerId;
      const cachedData = await redis.get(callData.uniqueId);
      if (cachedData) {
        var t = JSON.parse(cachedData)
        customerId = t[0].customerId
      }
      if (callData.project == "demo_cc_voxbay" || callData.project == "cc_voxbay") {
        if (callData.customerId != undefined) {
          customerId = callData.customerId
        }
      }
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var hours = today.getHours();
      var min = today.getMinutes();
      var sec = today.getSeconds();
      var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`;

      if (process.env.PRODUCTION == 'developmentLive' || process.env.PRODUCTION == 'development') {
        if (callData.callFlowId == 487) {
          console.log("evt---------------- >", evt)
          console.log("callData---------------- >", callData)
          console.log("cachedData---------------- >", cachedData)
        }
        if (customerId == '13' || customerId == '3296' || customerId == '3306') {
          calleventlog("current date time ---------------- >" + todayDate)
          console.log("current date time ---------------- >", todayDate)
          console.log("evt ---------------- >", evt)
          console.log("callData ---------------- >", callData)
          calleventlog("evt---------------- >")
          calleventlog(evt)
          calleventlog("callData---------------- >")
          calleventlog(callData)
          callReport.developmentCallEvent(evt, callData)
        }
      }
    }


  }
  let connection;
  let channel;
  async function consumeMessages() {
    try {
      // Construct the RabbitMQ connection URL
      const rabbitmqUrl = process.env.RABBITMQ_URL;
      // Connect to RabbitMQ

      const connection = await amqp.connect(rabbitmqUrl);
      connection.on("error", (err) => {
        console.error("RabbitMQ Connection Error:", err);
        reconnectConsumer(); // Restart consumer on error
      });
      connection.on("close", () => {
        console.warn("RabbitMQ Connection Closed. Reconnecting...");
        reconnectConsumer(); // Restart consumer on close
      });
      const channel = await connection.createChannel();
      const queue = 'voxbay';
      // Assert the queue without changing its existing properties
      await channel.assertQueue(queue, { durable: true, autoDelete: false });
      console.log(`Waiting for messages in ${queue}...`);
      channel.consume(queue, async (msg) => {
        if (msg !== null) {
          try {
            let evt = JSON.parse(msg.content.toString());

            console.log("---event----", evt);

            await hybridCallEvents(evt, 1)
            console.log("Rabbit - message received");
            channel.ack(msg); // Acknowledge message
          } catch (err) {
            console.log("Rabbit - failed message")
            console.log(err)
            channel.nack(msg, false, false);
          }
        }
      });
      channel.on("error", (err) => {
        console.error("RabbitMQ Channel Error:", err);
        //        reconnectConsumer(); // Restart consumer if the channel crashes
      });

      channel.on("close", () => {
        console.warn("RabbitMQ Channel Closed. Reconnecting...");
        reconnectConsumer();
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
  async function reconnectConsumer() {
    try {
      if (channel) {
        await channel.close(); // Close the channel first
        channel = null;
      }
      if (connection) {
        await connection.close();
        console.log("Closed previous RabbitMQ connection.");
      }
    } catch (err) {
      console.error("Error closing previous connection:", err);
    }
    console.log("Reconnecting to RabbitMQ...");
    setTimeout(consumeMessages, 5000); // Reconnect after 5 seconds
  }
  consumeMessages();
}

async function rackServerRabbitMq() {
  try {
      // Construct the RabbitMQ connection URL
      const rabbitmqUrl = process.env.RABBITMQ_RACK_URL;
      // Connect to RabbitMQ
      const connection = await amqp.connect(rabbitmqUrl);
      connection.on("error", (err) => {
        console.error("RabbitMQ Connection Error:", err);
        reconnectRackConsumer(); // Restart consumer on error
    });
    connection.on("close", () => {
      console.warn("RabbitMQ Connection Closed. Reconnecting...");
      reconnectRackConsumer(); // Restart consumer on close
  });
      const channel = await connection.createChannel();
      const queue = 'queue_1';
      // Assert the queue without changing its existing properties
      await channel.assertQueue(queue, { durable: true, autoDelete: false });
      console.log(`Waiting for messages in ${queue}...`);
      channel.consume(queue, async (msg) => {
          if (msg !== null) {
            try{
               let evt = JSON.parse(msg.content.toString())
               if(process.env.PRODUCTION == 'developmentLive'){
                
                const callReport = require('./callReport')
                const encodedString = evt.data
                if (encodedString != undefined) {
                  const decodedString = decodeURIComponent(encodedString);
                  const callData = JSON.parse(decodedString);
                  
                  var customerId = callData.customerId;
                  const cachedData = await redis.get(callData.uniqueId);
                  if (cachedData) {
                    var t = JSON.parse(cachedData)
                    customerId = t[0].customerId
                  }
                  if (customerId == '13') {
                    console.log("inside customer 13",callData)
                  console.log("evt ---------------- >",evt)
                  console.log("callData ---------------- >",callData)
                  calleventlog("evt---------------- >")
                  calleventlog(evt)
                  calleventlog("callData---------------- >")
                  calleventlog(callData)
                  callReport.developmentCallEvent(evt, callData)
                  }
                }
               }else{
                await event_handling(evt,1)
               }
              channel.ack(msg); // Acknowledge message
            }catch(err){
              console.log(err)
            }
          }
      });
      channel.on("error", (err) => {
        console.error("RabbitMQ Channel Error:", err);
        reconnectRackConsumer(); // Restart consumer if the channel crashes
    });

    channel.on("close", () => {
        console.warn("RabbitMQ Channel Closed. Reconnecting...");
        reconnectRackConsumer();
    });
  } catch (error) {
      console.error('Error:', error);
  }
}
function reconnectRackConsumer() {
  console.log("Reconnecting to RabbitMQ...");
  setTimeout(rackServerRabbitMq, 5000); // Reconnect after 5 seconds
}
rackServerRabbitMq();
var CallActionAmi = new require('asterisk-manager')(process.env.ASTERISK_PORT, process.env.ASTERISK_IP, process.env.AMI_USERNAME, process.env.AMI_PASSWORD, true);
CallActionAmi.keepConnected();
CallActionAmi.on('connect', () => {
  console.log('Connected to CallActionAmi ');

});
async function click_to_call(req, res, next) {
  var channel = "SIP/" + req.token.regNumber;
  var callbackId = req.query.callbackId;
  var sourceNumber = req.query.sourceNumber;
  if (req.token.phn_number_mask == 1) {
    var sNum = await string_decode(sourceNumber);
    if (sNum) {
      sourceNumber = sNum;
    } else {
      sourceNumber
    }
  }
  var didNumber = req.query.didNumber;

  const amiData = {
    Action: "originate",
    'Channel': channel,
    'Timeout': 20000,
    "WaitTime": 30,
    Exten: "callback",
    'Context': "vx_missedCall_callback",
    Async: true,
    Priority: 1,
    'variable': {
      'callbackId': callbackId,
      'sourceNumber': sourceNumber,
      'didNumber': didNumber,
      agent: req.token.regNumber
    }
  }

  //byot
  if(req.token.byot) {
    callByotApi("GET", "/api/click-to-call-authenticated", { amiData }, undefined, { token: req.headers.token }, req.token.id_user);
    res.locals.result = "success";
    return next()
  }
  
  CallActionAmi.action(amiData, function (err, res) {
    console.log(err);
  });
  res.locals.result = "success";
  next()
}

async function hangupCall(req, res, next) {
  const now = Date.now()
  var channel = req.query.channel;
  var agentId = req.token.id
  var id_user = req.token.id_user
  var id_department = req.token.id_department
  const uniqueId = req.query.uniqueId;
  res.locals.result = "success";

  const amiData = {
    'action': 'Hangup',
    'Channel': channel,
    Cause: 16
  }
  //byot
  if(req.token.byot) {
    resumeCallFromHold(uniqueId, now, req.token.id,req.token.id_user,req.token.id_department, "hangup");
    callByotApi("GET", "/api/click-to-call-authenticated", { amiData }, undefined, { token: req.headers.token }, req.token.id_user);
    return next();
  } 
  
  CallActionAmi.action(amiData, function (err, res) {
    console.log(err);
  });

  resumeCallFromHold(uniqueId, now, req.token.id,req.token.id_user,req.token.id_department, "hangup");

  next()
}
async function api_click_to_call(req, res, next) {
  if (process.env.PRODUCTION == 'development') {
    var data = req.query;
    var ip = requestIp.getClientIp(req);
    var result = await developmentCallEvent.click_to_call(data, ip);
    if(result.obj != undefined){
      if(result.obj.apiParams != undefined){
        redis.set(result.new_obj.uniqueId+"_api", JSON.stringify([{apiParams:result.obj.apiParams,customerId:result.new_obj.customer_id}]));
      }
    }
    res.locals.result = result;
    const query = querystring.stringify(data);
    result = JSON.stringify(result);
    clickTocallLog("click to call url--------->" + process.env.CURRENTIP + 'api/click_to_call?' + query + ",current time-------->")
    clickTocallLog("response-------->" + result + ",current time-------->" + new Date())
    next()
  } else {
    var data = req.query;
   
    var result = await developmentCallEvent.click_to_call(data)
    console.log(result)
    if (result.status != false) {
      console.log("inner ami")
      console.log("data ----------->", data)
      if (result.obj.apiParams != undefined) {
        redis.set(result.new_obj.uniqueId + "_api", JSON.stringify([{ apiParams: result.obj.apiParams, customerId: result.new_obj.customer_id }]));
      }

      const amiData = {
        Action: "originate",
        'Channel': "local/start@vx_clickToCall_source/n",
        'Timeout': 20000,
        "WaitTime": 30,
        Exten: "start",
        'Context': "vx_clickToCall_destination",
        Async: true,
        Priority: 1,
        'variable': result.new_obj
      }

      //byot 
      try {
        const { id_user = 0 } = (await ClicktocallModel.findOne({ uid: data.uid, upin: data.upin ?? data.pin })) || {};
        const customer = await Customers.findByPk(id_user, { attributes: ["id", "byot"]});
        if(customer?.byot) {
          callByotApi("GET", "/api/click-to-call", { amiData }, undefined, undefined, id_user);
          return res.send(result.response);
        }  
      } catch (error) {
        console.log(error)
      }
      
      CallActionAmi.action(amiData, function (err, res) {
        console.log(err);
      });
      
      var status = {
        'status': true,
        'message': "Succes",
        result: result.response,
      }
      res.locals.result = result.response
    } else{
      var status = {
        'status': false,
        'message': "False",
        result: result.msg,
      }
      res.locals.result = result.msg
    }
    console.log("res.locals.result ------>",res.locals.result)
    next()
  }
  
}
async function connect_with_call_flow(req, res, next) {
  if (process.env.PRODUCTION == 'development') {
    var data = req.query;
    var result = await developmentCallEvent.connect_with_call_flow(data)
    res.locals.result = result;
    const query = querystring.stringify(data);
    result = JSON.stringify(result);
    clickTocallLog("connect with call flow url--------->" + process.env.CURRENTIP + 'api/connect_with_call_flow?' + query + ",current time-------->")
    clickTocallLog("response-------->" + result + ",current time-------->" + new Date())
    next()
  } else if (process.env.PRODUCTION == 'developmentLive' || process.env.PRODUCTION == 'live') {
    var data = req.query;
    var result = await developmentCallEvent.connect_with_call_flow(data);
    console.log(result);

    const amiData = {
      Action: "originate",
      'Channel': "local/start@vx_clickToCall_callflow_source/n",
      'Timeout': 20000,
      "WaitTime": 30,
      Exten: "start",
      'Context': "vx_clickToCall_callflow_destination",
      Async: true,
      Priority: 1,
      'variable': result.new_obj
    }
    
    res.locals.result = result;

    
    if (result.status != false) {
      
      //byot 
      try {
        const { id_user = 0 } = (await ClicktocallModel.findOne({ uid: data.uid, upin: data.upin })) || {};
        const customer = await Customers.findByPk(id_user, { attributes: ["id", "byot"]});
        if(customer?.byot) {
          callByotApi("GET", "/api/click-to-call", { amiData }, undefined, undefined, id_user);
          return next();
        }  
      } catch (error) {
        console.log(error)
      }
      
      CallActionAmi.action(amiData, function (err, res) {
        console.log(err);
      });
    }
    next()
  }
}
async function connect_with_smartgroup(req, res, next) {
  if (process.env.PRODUCTION == 'development') {
    var data = req.query;
    var result = await developmentCallEvent.connect_with_smartgroup(data)
    res.locals.result = result;
    const query = querystring.stringify(data);
    result = JSON.stringify(result);
    clickTocallLog("connect with smartgroup url--------->" + process.env.CURRENTIP + 'api/connect_with_smartgroup?' + query + ",current time-------->")
    clickTocallLog("response-------->" + result + ",current time-------->" + new Date())
    next()
  } else if (process.env.PRODUCTION == 'developmentLive' || process.env.PRODUCTION == 'live') {
    var data = req.query;
    var result = await developmentCallEvent.connect_with_smartgroup(data)
    console.log(result)

    res.locals.result = result

    const amiData = {
      Action: "originate",
      'Channel': "local/start@vx_clickToCall_source/n",
      'Timeout': 20000,
      "WaitTime": 30,
      Exten: "start",
      'Context': "vx_clickToCall_destination",
      Async: true,
      Priority: 1,
      'variable': result.new_obj
    }
    
    if (result.status != false) {
      //byot 
      try {
        const { id_user = 0 } = (await ClicktocallModel.findOne({ uid: data.uid, upin: data.upin })) || {};
        const customer = await Customers.findByPk(id_user, { attributes: ["id", "byot"]});
        if(customer?.byot) {
          callByotApi("GET", "/api/click-to-call", { amiData }, undefined, undefined, id_user);
          return next();
        }  
      } catch (error) {
        console.log(error)
      }
      
      CallActionAmi.action(amiData, function (err, res) {
        console.log(err);
      });
    }
    next()
  }
}
async function call_task_click_to_call(req, res, next) {
  if (process.env.PRODUCTION == 'development') {
    var data = req.query;
    var result = await developmentCallEvent.call_task_click_to_call(data);
    // if(result.obj != undefined){
    //   if(result.obj.apiParams != undefined){
    //     redis.set(result.new_obj.uniqueId+"_api", JSON.stringify([{apiParams:result.obj.apiParams,customerId:result.new_obj.customer_id}]));
    //   }
    // }
    res.locals.result = result;
    const query = querystring.stringify(data);
    result = JSON.stringify(result);
    clickTocallLog("call task click to call url--------->" + process.env.CURRENTIP + 'api/call_task_click_to_call?' + query + ",current time-------->")
    clickTocallLog("response-------->" + result + ",current time-------->" + new Date())
    next()
  } else {
    var data = req.query;
   
    var result = await developmentCallEvent.call_task_click_to_call(data)

    console.log("----------------------------------resssssuuuulttttt---------------------------------");
    console.log(result)
    
    console.log(result)
    if (result?.status != false) {
      console.log("inner ami")
      console.log("data ----------->",data)
      // if(result.obj != undefined){
      //   if(result.obj.apiParams != undefined){
      //     redis.set(result.new_obj.uniqueId+"_api", JSON.stringify([{apiParams:result.obj.apiParams,customerId:result.new_obj.customer_id}]));
      //   }
      // }

      res.locals.result = result.response

      const amiData = {
        Action: "originate",
        'Channel': "local/start@vx_clickToCall_source/n",
        'Timeout': 20000,
        "WaitTime": 30,
        Exten: "start",
        'Context': "vx_clickToCall_destination",
        Async: true,
        Priority: 1,
        'variable': result.new_obj
      }
      
      //byot 
      const [_id, calltype = "1"] = data?.contact_id || "";
      if(calltype === "1") {
        try {
          const { id_user = 0 } = (await CallTaskContactsModel.findById(_id, "id_user") || {});
          const customer = await Customers.findByPk(id_user, { attributes: ["id", "byot"]});
          if(customer?.byot) {
            callByotApi("GET", "/api/click-to-call", { amiData }, undefined, undefined, id_user);
            return next();
          }  
        } catch (error) {
          console.log(error)
        }
      }

      CallActionAmi.action(amiData, function (err, res) {
        console.log(err);
      });
    }else{
      res.locals.result = result.message ?? ""
    }
    console.log("res.locals.result ------>",res.locals.result)
    next()
  }
  
}
async function campaign_login_click_to_call(req, res, next) {
  var agentLoginData = req.agentLoginData;
  if (process.env.PRODUCTION == 'development') {
    if (agentLoginData != undefined) {
      var status = {
        'status': false,
        'message': "agent currently break",
        result: []
      }
      res.status(201).json(status);
      next()
    } else {
      var status = {
        'status': true,
        'message': "Success",
        result: []
      }
      res.status(240).json(status);
      next()
    }
  } else {
    console.log(" live campaign agent login ------------------------------------------>")
    if (agentLoginData != undefined) {
      var status = {
        'status': false,
        'message': "agent currently break",
        result: []
      }
      res.status(203).json(status);
      next()
    }
    function generateUniqueId() {
      const prefix = 'cam';
      const dateTime = new Date().toISOString().replace(/[-:.TZ]/g, ''); // Format: YYYYMMDDHHMMSS
      const randomHex = crypto.randomBytes(3).toString('hex'); // Generates a 6-character hex string
      return `${prefix}_${dateTime}${randomHex}`;
    }
    var uniqueId = generateUniqueId()
    var variable = {
      agentId: req.token.id,
      campaignId: req.query.id_campaign,
      customerId: req.token.id_user,
      uniqueId: uniqueId
    }
    var campaignsql = `SELECT * FROM cc_campaign WHERE id = '${req.query.id_campaign}'`;
    var [campaignRes] = await sequelize.query(campaignsql);
    if (campaignRes[0].moh != undefined && campaignRes[0].moh) {
      var sql = `SELECT * FROM musiconhold WHERE moh_name = '${campaignRes[0].moh}'`;
      var [Res] = await sequelize.query(sql);
      if (Res.length != 0)
        // variable.moh = Res[0].name;
        variable.wait_music = Res[0].name;
    }
    console.log(variable)
    if (process.env.PRODUCTION == 'developmentLive') {
      variable.projectType = "development";
    }
    var channel = "SIP/" + req.token.regNumber;

    const amiData = {
      Action: "originate",
      'Channel': channel,
      'Timeout': 20000,
      "WaitTime": 30,
      Exten: "login",
      'Context': "vx_cc_agent_login",
      Async: true,
      Priority: 1,
      'variable': variable
    }

    //byot
    if(req.token.byot) {
      callByotApi("GET", "/api/click-to-call-authenticated", { amiData }, undefined, { token: req.headers.token }, req.token.id_user);
      return next();
    }
  
    
    var result = new Promise(async function (resolve, reject) {
      CallActionAmi.action(amiData, function (err, res) {
        console.log("click to call respone ----------------------------->", res);
        resolve(res)
        console.log(err);
      });
    })
    var output = await result;
    if (output != undefined) {
      res.locals.result = output.response;
      next()
    } else {
      var status = {
        'status': false,
        'message': "Failed",
        result: []
      }
      res.status(240).json(status);
      next()
    }
  }

}
async function campaign_click_to_call(req, res, next) {
  if (process.env.PRODUCTION == 'development') {
    let caller
    var callerIdSql = `SELECT cc_campaign.id,caller_id,did FROM cc_campaign join did on did.id = cc_campaign.caller_id WHERE cc_campaign.id = ${req.body.id_campaign}`;
    var [callerIdRes] = await sequelize.query(callerIdSql);
    if (callerIdRes.length == 0) {
      var userDidSql = `SELECT us.user_id,us.did,us.did_type,d.did as didNumber FROM user_settings us LEFT JOIN did d ON us.did_type = 2 AND us.did = d.id WHERE us.user_id = ${req.token.id}`
      var [userDidRes] = await sequelize.query(userDidSql);
      if (userDidRes.length != 0) {
        if (userDidRes[0].didNumber != null) {
          caller = userDidRes[0].didNumber
        } else {
          caller = userDidRes[0].did
        }
      }
    } else {
      caller = callerIdRes[0].did
    }
    var digit_2 = caller.toString().substring(0, 2);
    var didSql = `SELECT pricing_plan,id_pay_per_calls_plans,id_pay_per_channel_plans,outgoing_call_ratecard_id FROM did where did like '${caller}'`;
    var [didRes] = await sequelize.query(didSql);
    if (didRes[0].pricing_plan != 1 && didRes[0].id_pay_per_channel_plans != 1) {
      var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${req.token.id_user}`;
      var [transRes] = await sequelize.query(transSql);
      console.log("transRes.........", transRes.length)
      if (transRes.length != 0) {
        var transCredit = transRes[0].trans_credit;
        console.log("transCredit.........", transCredit)
        if (transCredit <= 0) {
          console.log("no balance................")
          var status = {
            'status': false,
            'message': "recharge",
            result: []
          }
          res.status(240).json(status);
          // next()
        } else {
          var status = {
            'status': true,
            'message': "Success",
            result: []
          }
          res.status(240).json(status);
          next()
        }
      }
    } else {
      if (digit_2 != "91") {
        var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${req.token.id_user}`;
        var [transRes] = await sequelize.query(transSql);
        console.log("transRes.........", transRes.length)
        if (transRes.length != 0) {
          var transCredit = transRes[0].trans_credit;
          console.log("transCredit.........", transCredit)
          if (transCredit <= 0) {
            console.log("no balance................")
            var status = {
              'status': false,
              'message': "recharge",
              result: []
            }
            res.status(240).json(status);
            // next()
          } else {
            var status = {
              'status': true,
              'message': "Success",
              result: []
            }
            res.status(240).json(status);
            next()
          }
        }
      } else {
        var status = {
          'status': true,
          'message': "Success",
          result: []
        }
        res.status(240).json(status);
        next()
      }
    }


  } else {
    let caller
    var callerIdSql = `SELECT cc_campaign.id,caller_id,did FROM cc_campaign join did on did.id = cc_campaign.caller_id WHERE cc_campaign.id = ${req.body.id_campaign}`;
    var [callerIdRes] = await sequelize.query(callerIdSql);
    if (callerIdRes.length == 0) {
      var userDidSql = `SELECT us.user_id,us.did,us.did_type,d.did as didNumber FROM user_settings us LEFT JOIN did d ON us.did_type = 2 AND us.did = d.id WHERE us.user_id = ${req.token.id}`
      var [userDidRes] = await sequelize.query(userDidSql);
      if (userDidRes.length != 0) {
        if (userDidRes[0].didNumber != null) {
          caller = userDidRes[0].didNumber
        } else {
          caller = userDidRes[0].did
        }
      }
    } else {
      caller = callerIdRes[0].did
    }
    var digit_2 = caller.toString().substring(0, 2);
    var didSql = `SELECT pricing_plan,id_pay_per_calls_plans,id_pay_per_channel_plans,outgoing_call_ratecard_id FROM did where did like '${caller}'`;
    var [didRes] = await sequelize.query(didSql);
    if (didRes[0].pricing_plan != 1 && didRes[0].id_pay_per_channel_plans != 1) {
      var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${req.token.id_user}`;
      var [transRes] = await sequelize.query(transSql);
      console.log("transRes.........", transRes.length)
      if (transRes.length != 0) {
        var transCredit = transRes[0].trans_credit;
        console.log("transCredit.........", transCredit)
        if (transCredit <= 0) {
          console.log("no balance................")
          var status = {
            'status': false,
            'message': "recharge",
            result: []
          }
          res.status(240).json(status);
        } else {
          var channel = "SIP/" + req.token.regNumber;
          if (req.token.phn_number_mask == "1") {
            var pNo = await string_decode(req.body.contact_number);
            if (pNo) {
              var phone_number = pNo;
            } else {
              var phone_number = req.body.contact_number;
            }
            //  var phone_number = await string_decode(req.body.contact_number);
            console.log(phone_number);
          } else {
            var phone_number = req.body.contact_number;
          }

          var contactStatusId = req.body.id_contact;
          var agentId = req.token.id;
          var customerId = req.token.id_user;
          var campaignId = req.body.id_campaign;
          var phoneBookId = req.body.phonebook_id;
          var forceCallRecording = req.body.forceCallRecording;
          var forceCallerId = req.body.forceCallerId;
          var callerId = req.body.didNumber;
          var campainChannel = req.body.sourceChannel;
          var uniqueId = req.body.uniqueId;
          var api_integration = req.body.api_integration;
          var dial_type = req.body.dial_type;
          var fwd_provider = req.body.fwd_provider;
          // var callRecordSql = `SELECT outgoing_provider FROM did WHERE did = '${callerId}'`;
          // var [outgoing_provider] = await sequelize.query(callRecordSql);
          if (forceCallRecording == 0 || forceCallRecording == undefined) {
            var callRecordSql = `SELECT enableCallrecording FROM user_settings WHERE user_id = '${agentId}'`;
            var [callRecordRes] = await sequelize.query(callRecordSql);
            if (callRecordRes.length != 0) {
              if (callRecordRes[0].callRecord == 1) {
                forceCallRecording = 1;
              } else {
                forceCallRecording = 0;
              }
            } else {
              forceCallRecording = 0;
            }
          }
          var variable = {
            'agentId': agentId,
            'customerId': customerId,
            'forceCallRecording': forceCallRecording,
            'forceCallerId': 1,
            uniqueId: uniqueId,
            callerId: callerId,
            agentChannel: campainChannel,
            contactStatusId: contactStatusId,
            campaignId: campaignId,
            phoneBookId: phoneBookId,
            apiSettingIsEnabled: api_integration,
            didProvider: fwd_provider
          }
          if (process.env.PRODUCTION == 'developmentLive') {
            variable.projectType = "development";
          }

          let amiData;
          var result = new Promise(async function (resolve, reject) {
            if (dial_type == 3 || dial_type == 4) {
              amiData = {
                Action: "originate",
                'Channel': "local/" + phone_number + "@vx_cc_agent_connect/n",
                'Timeout': 20000,
                "WaitTime": 30,
                Exten: phone_number,
                'Context': "vx_cc_call_start",
                Async: true,
                Priority: 1,
                'variable': variable
              }

            } else {
              amiData = {
                Action: "originate",
                'Channel': "local/" + phone_number + "@vx_cc_call_start/n",
                'Timeout': 20000,
                "WaitTime": 30,
                Exten: "login",
                'Context': "vx_cc_agent_connect",
                Async: true,
                Priority: 1,
                'variable': variable
              }
            }

            //byot
            if (req.token.byot) {
              callByotApi("GET", "/api/click-to-call-authenticated", { amiData }, undefined, { token: req.headers.token }, req.token.id_user);
              return next();
            }

            CallActionAmi.action(amiData, function (err, res) {
              resolve(res)
              console.log(err);
            });
          })

          var output = await result;
          if (output != undefined) {
            var status = {
              'status': true,
              'message': "success",
              result: output
            }
            res.status(200).json(status);
            next()
          } else {
            var status = {
              'status': false,
              'message': "Failed",
              result: []
            }
            res.status(240).json(status);
            next()
          }
        }
      }
    } else {
      if (digit_2 != "91") {
        var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${req.token.id_user}`;
        var [transRes] = await sequelize.query(transSql);
        console.log("transRes.........", transRes.length)
        if (transRes.length != 0) {
          var transCredit = transRes[0].trans_credit;
          console.log("transCredit.........", transCredit)
          if (transCredit <= 0) {
            console.log("no balance................")
            var status = {
              'status': false,
              'message': "recharge",
              result: []
            }
            res.status(240).json(status);
          } else {
            var channel = "SIP/" + req.token.regNumber;
            if (req.token.phn_number_mask == "1") {
              var pNo = await string_decode(req.body.contact_number);
              if (pNo) {
                var phone_number = pNo;
              } else {
                var phone_number = req.body.contact_number;
              }
              //  var phone_number = await string_decode(req.body.contact_number);
              console.log(phone_number);
            } else {
              var phone_number = req.body.contact_number;
            }

            var contactStatusId = req.body.id_contact;
            var agentId = req.token.id;
            var customerId = req.token.id_user;
            var campaignId = req.body.id_campaign;
            var phoneBookId = req.body.phonebook_id;
            var forceCallRecording = req.body.forceCallRecording;
            var forceCallerId = req.body.forceCallerId;
            var callerId = req.body.didNumber;
            var campainChannel = req.body.sourceChannel;
            var uniqueId = req.body.uniqueId;
            var api_integration = req.body.api_integration;
            var dial_type = req.body.dial_type;
            var fwd_provider = req.body.fwd_provider;
            // var callRecordSql = `SELECT outgoing_provider FROM did WHERE did = '${callerId}'`;
            // var [outgoing_provider] = await sequelize.query(callRecordSql);
            if (forceCallRecording == 0 || forceCallRecording == undefined) {
              var callRecordSql = `SELECT enableCallrecording FROM user_settings WHERE user_id = '${agentId}'`;
              var [callRecordRes] = await sequelize.query(callRecordSql);
              if (callRecordRes.length != 0) {
                if (callRecordRes[0].callRecord == 1) {
                  forceCallRecording = 1;
                } else {
                  forceCallRecording = 0;
                }
              } else {
                forceCallRecording = 0;
              }
            }
            var variable = {
              'agentId': agentId,
              'customerId': customerId,
              'forceCallRecording': forceCallRecording,
              'forceCallerId': 1,
              uniqueId: uniqueId,
              callerId: callerId,
              agentChannel: campainChannel,
              contactStatusId: contactStatusId,
              campaignId: campaignId,
              phoneBookId: phoneBookId,
              apiSettingIsEnabled: api_integration,
              didProvider: fwd_provider
            }
            if (process.env.PRODUCTION == 'developmentLive') {
              variable.projectType = "development";
            }

            let amiData;
            var result = new Promise(async function (resolve, reject) {
              if (dial_type == 3 || dial_type == 4) {
                amiData = {
                  Action: "originate",
                  'Channel': "local/" + phone_number + "@vx_cc_agent_connect/n",
                  'Timeout': 20000,
                  "WaitTime": 30,
                  Exten: phone_number,
                  'Context': "vx_cc_call_start",
                  Async: true,
                  Priority: 1,
                  'variable': variable
                }

              } else {
                amiData = {
                  Action: "originate",
                  'Channel': "local/" + phone_number + "@vx_cc_call_start/n",
                  'Timeout': 20000,
                  "WaitTime": 30,
                  Exten: "login",
                  'Context': "vx_cc_agent_connect",
                  Async: true,
                  Priority: 1,
                  'variable': variable
                }
              }

              //byot
              if (req.token.byot) {
                callByotApi("GET", "/api/click-to-call-authenticated", { amiData }, undefined, { token: req.headers.token }, req.token.id_user);
                return next();
              }

              CallActionAmi.action(amiData, function (err, res) {
                resolve(res)
                console.log(err);
              });
            })

            var output = await result;
            if (output != undefined) {
              var status = {
                'status': true,
                'message': "success",
                result: output
              }
              res.status(200).json(status);
              next()
            } else {
              var status = {
                'status': false,
                'message': "Failed",
                result: []
              }
              res.status(240).json(status);
              next()
            }
          }
        }
      } else {

        var channel = "SIP/" + req.token.regNumber;
        if (req.token.phn_number_mask == "1") {
          var pNo = await string_decode(req.body.contact_number);
          if (pNo) {
            var phone_number = pNo;
          } else {
            var phone_number = req.body.contact_number;
          }
          //  var phone_number = await string_decode(req.body.contact_number);
          console.log(phone_number);
        } else {
          var phone_number = req.body.contact_number;
        }

        var contactStatusId = req.body.id_contact;
        var agentId = req.token.id;
        var customerId = req.token.id_user;
        var campaignId = req.body.id_campaign;
        var phoneBookId = req.body.phonebook_id;
        var forceCallRecording = req.body.forceCallRecording;
        var forceCallerId = req.body.forceCallerId;
        var callerId = req.body.didNumber;
        var campainChannel = req.body.sourceChannel;
        var uniqueId = req.body.uniqueId;
        var api_integration = req.body.api_integration;
        var dial_type = req.body.dial_type;
        var fwd_provider = req.body.fwd_provider;
        // var callRecordSql = `SELECT outgoing_provider FROM did WHERE did = '${callerId}'`;
        // var [outgoing_provider] = await sequelize.query(callRecordSql);
        if (forceCallRecording == 0 || forceCallRecording == undefined) {
          var callRecordSql = `SELECT enableCallrecording FROM user_settings WHERE user_id = '${agentId}'`;
          var [callRecordRes] = await sequelize.query(callRecordSql);
          if (callRecordRes.length != 0) {
            if (callRecordRes[0].callRecord == 1) {
              forceCallRecording = 1;
            } else {
              forceCallRecording = 0;
            }
          } else {
            forceCallRecording = 0;
          }
        }
        var variable = {
          'agentId': agentId,
          'customerId': customerId,
          'forceCallRecording': forceCallRecording,
          'forceCallerId': 1,
          uniqueId: uniqueId,
          callerId: callerId,
          agentChannel: campainChannel,
          contactStatusId: contactStatusId,
          campaignId: campaignId,
          phoneBookId: phoneBookId,
          apiSettingIsEnabled: api_integration,
          didProvider: fwd_provider
        }
        if (process.env.PRODUCTION == 'developmentLive') {
          variable.projectType = "development";
        }

        let amiData;
        var result = new Promise(async function (resolve, reject) {
          if (dial_type == 3 || dial_type == 4) {
            amiData = {
              Action: "originate",
              'Channel': "local/" + phone_number + "@vx_cc_agent_connect/n",
              'Timeout': 20000,
              "WaitTime": 30,
              Exten: phone_number,
              'Context': "vx_cc_call_start",
              Async: true,
              Priority: 1,
              'variable': variable
            }

          } else {
            amiData = {
              Action: "originate",
              'Channel': "local/" + phone_number + "@vx_cc_call_start/n",
              'Timeout': 20000,
              "WaitTime": 30,
              Exten: "login",
              'Context': "vx_cc_agent_connect",
              Async: true,
              Priority: 1,
              'variable': variable
            }
          }

          //byot
          if (req.token.byot) {
            callByotApi("GET", "/api/click-to-call-authenticated", { amiData }, undefined, { token: req.headers.token }, req.token.id_user);
            return next();
          }

          CallActionAmi.action(amiData, function (err, res) {
            resolve(res)
            console.log(err);
          });
        })

        var output = await result;
        if (output != undefined) {
          var status = {
            'status': true,
            'message': "success",
            result: output
          }
          res.status(200).json(status);
          next()
        } else {
          var status = {
            'status': false,
            'message': "Failed",
            result: []
          }
          res.status(240).json(status);
          next()
        }
      }
    }
  }

}
async function campaign_agent_logout(req, res, next) {
  if (process.env.PRODUCTION == 'development') {
    var status = {
      'status': true,
      'message': "Success",
      result: []
    }
    res.status(240).json(status);
    next()
  } else {
    var channel = req.query.channel;
    console.log("channel ---->",channel)

    const amiData = {
      'action': 'Hangup',
      'Channel': channel,
      Cause: 16
    }
    
    //byot
    if(req.token.byot) {
      callByotApi("GET", "/api/click-to-call-authenticated", { amiData }, undefined, { token: req.headers.token }, req.token.id_user);
      const status = {
        'status': true,
        'message': "succesfull response",
        result: res.locals.output
      }
      return res.status(200).json(status);
    } 
    
    var result = new Promise(async function (resolve, reject) {
      CallActionAmi.action(amiData, function (err, res) {
        console.log("click to call respone ----------------------------->", res);
        resolve(res)
        console.log(err);
      });
    })
    var output = await result;
    console.log("output ---->",output)
    if (output != undefined) {
      var status = {
        'status': true,
        'message': "succesfull response",
        result: res.locals.output
    }
    res.status(200).json(status);
    } else {
      var status = {
        'status': false,
        'message': "Failed",
        result: []
      }
      res.status(240).json(status);
      next()
    }
  }

}
async function broadcast_campaign_click_to_call(req, res, next) {
  if (process.env.PRODUCTION == 'development') {
    var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${req.token.id_user}`;
    var [transRes] = await sequelize.query(transSql);
    console.log("transRes.........", transRes.length)
    if (transRes.length != 0) {
      var transCredit = transRes[0].trans_credit;
      console.log("transCredit.........", transCredit)
      if (transCredit <= 0) {
        console.log("no balance................")
        var status = {
          'status': false,
          'message': "recharge",
          result: []
        }
        res.status(240).json(status);
        // next()
      } else {
        var status = {
          'status': true,
          'message': "Success",
          result: []
        }
        res.status(240).json(status);
        next()
      }
    }

  } else {
    var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${req.token.id_user}`;
    var [transRes] = await sequelize.query(transSql);
    console.log("transRes.........", transRes.length)
    if (transRes.length != 0) {
      var transCredit = transRes[0].trans_credit;
      console.log("transCredit.........", transCredit)
      if (transCredit <= 0) {
        console.log("no balance................")
        var status = {
          'status': false,
          'message': "recharge",
          result: []
        }
        res.status(240).json(status);
      } else {
        var channel = "SIP/" + req.token.regNumber;
        if (req.token.phn_number_mask == "1") {
          var pNo = await string_decode(req.body.contact_number);
          if (pNo) {
            var phone_number = pNo;
          } else {
            var phone_number = req.body.contact_number;
          }
          //  var phone_number = await string_decode(req.body.contact_number);
          console.log(phone_number);
        } else {
          var phone_number = req.body.contact_number;
        }

        var contactStatusId = req.body.id_contact;
        var agentId = req.token.id;
        var customerId = req.token.id_user;
        var campaignId = req.body.id_campaign;
        var phoneBookId = req.body.phonebook_id;
        var forceCallRecording = req.body.forceCallRecording;
        var forceCallerId = req.body.forceCallerId;
        var callerId = req.body.didNumber;
        var campainChannel = req.body.sourceChannel;
        var uniqueId = req.body.uniqueId;
        var api_integration = req.body.api_integration;
        var dial_type = req.body.dial_type;
        if (forceCallRecording == 0 || forceCallRecording == undefined) {
          var callRecordSql = `SELECT enableCallrecording FROM user_settings WHERE user_id = '${agentId}'`;
          var [callRecordRes] = await sequelize.query(callRecordSql);
          if (callRecordRes.length != 0) {
            if (callRecordRes[0].callRecord == 1) {
              forceCallRecording = 1;
            } else {
              forceCallRecording = 0;
            }
          } else {
            forceCallRecording = 0;
          }
        }
        var variable = {
          'agentId': agentId,
          'customerId': customerId,
          'forceCallRecording': forceCallRecording,
          'forceCallerId': 1,
          uniqueId: uniqueId,
          callerId: callerId,
          agentChannel: campainChannel,
          contactStatusId: contactStatusId,
          campaignId: campaignId,
          phoneBookId: phoneBookId,
          apiSettingIsEnabled: api_integration
        }
        if (process.env.PRODUCTION == 'developmentLive') {
          variable.projectType = "development";
        }
        console.log({
          Action: "originate",
          'Channel': "local/" + phone_number + "@cc_call_start/n",
          'Timeout': 20000,
          "WaitTime": 30,
          Exten: "login",
          'Context': "vx_cc_agent_connect",
          Async: true,
          Priority: 1,
          'variable': variable
        })
        var result = new Promise(async function (resolve, reject) {
          if (dial_type == 3 || dial_type == 4) {
            CallActionAmi.action({
              Action: "originate",
              'Channel': "local/" + phone_number + "@vx_cc_agent_connect/n",
              'Timeout': 20000,
              "WaitTime": 30,
              Exten: phone_number,
              'Context': "vx_cc_call_start",
              Async: true,
              Priority: 1,
              'variable': variable
            }, function (err, res) {
              resolve(res)
              console.log(err);
            });
          } else {
            CallActionAmi.action({
              Action: "originate",
              'Channel': "local/" + phone_number + "@vx_cc_call_start/n",
              'Timeout': 20000,
              "WaitTime": 30,
              Exten: "login",
              'Context': "vx_cc_agent_connect",
              Async: true,
              Priority: 1,
              'variable': variable
            }, function (err, res) {
              resolve(res)
              console.log(err);
            });
          }

        })

        var output = await result;
        if (output != undefined) {
          res.locals.result = output.response;
          next()
        } else {
          var status = {
            'status': false,
            'message': "Failed",
            result: []
          }
          res.status(240).json(status);
          next()
        }
      }
    }

  }

}
async function agent_call_hangup(req, res, next){
  if(process.env.PRODUCTION == 'development'){
    var status = {
      'status' : true,
      'message' :"Success",
      result: []
    } 
    res.status(240).json(status);
    next()
  }else{
    var channel = req.query.channel;
    var id_agent = req.query.agentId;
    var id_campaign = req.query.id_campaign;
    var phonebook_id = req.query.phonebook_id;
    var sql = `UPDATE cc_livecalls SET hangup_by ='${req.query.type}' WHERE uniqueId = '${req.query.uniqueId}' and id_campaign = '${id_campaign}'`;
    var [camapignRes] = await sequelize.query(sql);

    const amiData = {
      'action':'Hangup',
      'Channel':channel,
      Cause: 16
    }
    
    if(req.token.byot) {    
      callByotApi("GET", "/api/click-to-call-authenticated", { amiData }, undefined, { token: req.headers.token }, req.token.id_user);
      var status = {
        'status': true,
        'message': "success",
        result: {}
      }
      return res.status(200).json(status);
    }
    
    var result = new Promise(async function(resolve, reject) {
      CallActionAmi.action(amiData, function (err, res) {
        console.log("click to call respone ----------------------------->",res);
        resolve(res)
        console.log(err);
      });
    })
    var output = await result;
    if(output != undefined){
      var status = {
        'status': true,
        'message': "success",
        result: output
      }
      res.status(200).json(status);
      next()
    }else{
      var status = {
        'status' : false,
        'message' :"Failed",
        result: []
      } 
      res.status(240).json(status);
      next()
    }
  }
  
}
async function callHold(req, res, next) {
  const now = Date.now()
  var agentChannel = req.query.agentChannel;
  var channel = req.query.channel;
  var uniqueNum = req.query.uniqueNum;
  const uniqueId = req.query.uniqueId;
  var agentId = req.token.id;
  var campaignId = req.query.campaignId
  var id_user = req.token.id_user
  var id_department = req.token.id_department
  if (process.env.PRODUCTION == 'developmentLive' || process.env.PRODUCTION == 'development') {
    developmentCallEvent.agentActivityCallSocket(agentId,id_user, 1,id_department)
    developmentCallEvent.agentActivityCallHoldSocket(agentId,id_user, 1,id_department)
  }
  else {
    liveCallEvent.agentActivityCallSocket(agentId,id_user, 1,id_department)
    liveCallEvent.agentActivityCallHoldSocket(agentId,id_user, 1,id_department)
  }    
  

  const amiData = {
    'action': 'Redirect',
    'Channel': channel,
    'ExtraChannel': agentChannel,
    "Exten": uniqueNum,
    'ExtraExten': "hold",
    Context: "vx_parkFromWeb",
    ExtraContext: "vx_holdRequestFromWeb",
    Priority: 1,
    ExtraPriority: 1,
    'variable': {
      'channel': channel,
      'agentChannel': agentChannel
    }
  }
  
  res.locals.result = [];

  //byot
  if(req.token.byot) {
    updateHoldDuration(uniqueId, now, req.token.id);
    callByotApi("GET", "/api/click-to-call-authenticated", { amiData }, undefined, { token: req.headers.token }, req.token.id_user);
    return next();
  }  
  
  CallActionAmi.action(amiData, function (err, res) {
    console.log(err);
  });

  // Update hold call duration in Redis
  await updateHoldDuration(uniqueId, now, req.token.id);
  next()
}
async function unHold(req, res, next) {
  const now = Date.now();
  var agentChannel = req.query.agentChannel;
  var uniqueNum = req.query.uniqueNum;
  const uniqueId = req.query.uniqueId;
  var agentId = req.token.id;
  var id_user = req.token.id_user
  var id_department = req.token.id_department
  if (process.env.PRODUCTION == 'developmentLive' || process.env.PRODUCTION == 'development') {
    developmentCallEvent.agentActivityCallSocket(agentId,id_user, 2,id_department)
    developmentCallEvent.agentActivityCallHoldSocket(agentId,id_user, 2,id_department)

  }
  else {
    liveCallEvent.agentActivityCallSocket(agentId,id_user, 2,id_department)
    liveCallEvent.agentActivityCallHoldSocket(agentId,id_user, 2,id_department)

  }

  const amiData = {
    'action': 'Redirect',
    'Channel': agentChannel,
    Exten: uniqueNum,
    Context: 'vx_UnparkFromWeb',
    Priority: 1
  }

  res.locals.result = [];

  //byot
  if (req.token.byot) {
    resumeCallFromHold(uniqueId, now, req.token.id,req.token.id_user,req.token.id_department);
    callByotApi("GET", "/api/click-to-call-authenticated", { amiData }, undefined, { token: req.headers.token }, req.token.id_user);
    return next();
  }

  CallActionAmi.action(amiData, function (err, res) {
    console.log(err);
  });

  await resumeCallFromHold(uniqueId, now, req.token.id,req.token.id_user,req.token.id_department);
  next()
}
async function didSettings(req, res, next) {
  var result = await developmentCallEvent.didSettings()
  return result
}
async function campaign_broadcast_click_to_call(phone_number, contactStatusId, campaignId, phoneBookId, callerId, uniqueId, id_user, appId, whatsapp_integration, didProvider, call_duration, fwd_provider, token, byot, route) {
  console.log("broadcast ami...", phone_number, contactStatusId, campaignId, phoneBookId, callerId, uniqueId, id_user, appId, whatsapp_integration, didProvider, call_duration, fwd_provider, token, byot, route)
  logMessage("inside campaign_broadcast_click_to_call ---> phone_number :" + phone_number + ', contactStatusId :' + contactStatusId + ', campaignId :' + campaignId + ', phoneBookId :' + phoneBookId + ', callerId :' + callerId + ', uniqueId :' + uniqueId + ', id_user :' + id_user + ', appId :' + appId + ', whatsapp_integration:' + whatsapp_integration + ',didProvider :' + didProvider + ', call_duration:' + call_duration + ', fwd_provider:' + fwd_provider + ', token :' + token + ', byot :' + byot + ', route :' + route)
  // var callRecordSql = `SELECT outgoing_provider,id_user FROM did WHERE did = '${callerId}'`;
  // var [outgoing_provider] = await sequelize.query(callRecordSql);
  // if(outgoing_provider.length != 0){
  //   var didProvider = outgoing_provider[0].outgoing_provider
  //   var customerId =  outgoing_provider[0].id_user
  // }else{
  //   var didProvider = 0;
  //   var customerId = 13;
  // }
  var variable = {
    uniqueId: uniqueId,
    callerId: callerId,
    contactStatusId: contactStatusId,
    campaignId: campaignId,
    phoneBookId: phoneBookId,
    userId: id_user,
    ivrCampaign: 1,
    callFlowId: appId,
    apiSettingIsEnabled: whatsapp_integration,
    didProvider: didProvider,
    customerId: id_user,
    max_duration: call_duration,
    fwdProvider: fwd_provider,
    destinationNumber: phone_number,
    route: route
  }
  console.log("variable ----->", variable)
  logMessage("variable")
  logMessage(variable)
  // if (process.env.PRODUCTION == 'developmentLive') {
  //   variable.projectType = "development";
  // }

  const amiData = {
    Action: "originate",
    'Channel': "local/" + phone_number + "@vx_br_call_start/n",
    'Timeout': 20000,
    "WaitTime": 30,
    Exten: "888",
    'Context': "vx_br_connect",
    Async: true,
    Priority: 1,
    'variable': variable
  }

  //byot
  // if(call_duration.token.byot) {
  //   callByotApi("GET", "/api/click-to-call-authenticated", { amiData }, undefined, { token: req.headers.token }, req.token.id_user);
  //   return;
  // }

  var result = new Promise(async function (resolve, reject) {
    CallActionAmi.action(amiData, function (err, res) {
      resolve(res)
      console.log("err  broadcast--->", err);
    });
  })
  var output = await result;
  console.log("console  broadcast--->", output);
}
async function api_integration(callStatus,logDataJson,campaignId,selectRes){
  try {
    logMessage("in side api_integration function : "+ campaignId)
    if (callStatus == 'ANSWER') {
      logMessage("logDataJson.apiSettingIsEnabled..."+ logDataJson.apiSettingIsEnabled)
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
    } else  {
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


module.exports = {
  click_to_call,
  callHold,
  unHold,
  hangupCall,
  api_click_to_call,
  connect_with_call_flow,
  connect_with_smartgroup,
  call_task_click_to_call,
  campaign_login_click_to_call,
  campaign_click_to_call,
  campaign_agent_logout,
  broadcast_campaign_click_to_call,
  campaign_broadcast_click_to_call,
  agent_call_hangup,
  didSettings,
  api_integration,
}