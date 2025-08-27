var http = require('http');
const sequelize = require( './database' ).db;
const apiIntegrationModel = require('./model/campaignApiIntegrationModel');
var callcenter = require('./controller/callcenterCtrl')
var axios = require('axios');
var app = require('./app');
const { adminSocket } = require('./helper/socket');
var ami = new require('asterisk-manager')(process.env.ASTERISK_PORT,process.env.ASTERISK_IP,process.env.ASTERISK_GATE,process.env.ASTERISK_PASSWORD, true);

function unpouse_sip(regNumber,type){
  console.log("-------------------------------->Time of unpouse",new Date())
    ami.action({
        'action':'QueuePause',
        'ActionID':1,
        'Interface':"SIP/"+regNumber,
        "Paused":type,
      }, function(err, res) {
        console.log(err);
      });
}
async function call_pouse(req,res,next){
  console.log("-------------------------------->Time of pouse",new Date())
  if (process.env.PRODUCTION == 'development') {
    var status = {
      'status': true,
      'message': "Success",
      result: []
    }
    res.status(200).json(status);
  }else{
    var regNumber = req.token.regNumber;
    if(req.query.breakName == 'Available'){
      var type = false;
    }else{
      var type = true;
    }
    console.log("-------------------------------->Time of pouse",type," ----> ",new Date())
    var result = new Promise(async function(resolve, reject) {
      ami.action({
        'action':'QueuePause',
        'ActionID':1,
        'Interface':"SIP/"+regNumber,
        "Paused":type,
      }, function(err, respo) {
        resolve(respo)
        console.log(err);
      });
    })
    var output = await result;
    if(output != undefined){
      res.locals.pouseResult = output.response;
      next()
    }else{
      var status = {
        'status' : false,
        'message' :"poused Failed",
        result: []
        } 
      res.status(240).json(status);
    }
  }
}
async function getholdData(req,res,next){
    var agentChannel = req.query.agentChannel;
    var channel = req.query.channel;
    var uniqueNum = req.query.uniqueNum;
    var agentId = req.query.agentId;
    var campaignId = req.query.campaignId
    ami.action({
        'action':'ParkedCalls'
      }, function(err, res) {
        getresponse()
        unHold(agentChannel,channel,uniqueNum);
      });
      var liveReportObj = {
        agentId: agentId,
        status: "unhold",
        event: "unhold",
        campaignId:campaignId
      }
      var msg = 'campaignLiveReportAgent'
      var socket = await adminSocket(req.query.id_user, msg,liveReportObj);
      // var path = `/campaignCallUnhold?agentId=${agentId}&campaignId=${campaignId}`
      // var post_options = {
      //   host: process.env.API_IP,
      //   // hostname: 'localhost',
      //   port: process.env.CURRENTIP_PORT,
      //   path: path,
      //   method: 'get'
      // };
      // var post_req = http.request(post_options, function (res) {
      //   res.setEncoding('utf8');
      //   res.on('data', function (chunk) {
      //   });
      // });
      // post_req.end();
      res.locals.result = "success";
      next()
}
function getresponse(){
    
    ami.on('event', event => {
        // console.log("------------------------------------------>Event",event)
        if (event.event === 'ParkedCall') {
          console.log('Parked call details:');
          console.log('Channel:', event.variables.channel);
          console.log('CallerID:', event.variables.callerid);
          console.log('Exten:', event.variables.exten);
          console.log('Timeout:', event.variables.timeout);
          console.log('------------------------');
        }
      });
      ami.on('response', function (evt) {
        // console.log("------------------------------------------>Response",evt)
        if (evt.actionid === 'parkedCalls') {
          const parkedCalls = [];
          const lines = evt.data.split('\n');
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('ParkedCall:')) {
              const channel = lines[i + 1].split(': ')[1];
              const callerID = lines[i + 2].split(': ')[1];
              parkedCalls.push({ Channel: channel, CallerID: callerID });
            }
          }
      
          // Process the parkedCalls array containing Channel and CallerID information
          // console.log(parkedCalls);
        }
      });
      
      // Sending ParkedCalls action to Asterisk Manager Interface
      ami.action({
        action: 'ParkedCalls',
      }, function (err, res) {
        if (err) {
          console.log('Error:', err);
        }
      });      
}

async function callHold(req, res, next) {
  var agentChannel = req.query.agentChannel;
  var channel = req.query.channel;
  var uniqueNum = req.query.uniqueNum;
  var agentId = req.query.agentId;
  var campaignId = req.query.campaignId
  ami.action({
    'action': 'Redirect',
    'Channel': channel,
    'ExtraChannel': agentChannel,
    "Exten": uniqueNum,
    'ExtraExten': "hold",
    Context: "parkFromWeb",
    ExtraContext: "holdRequestFromWeb",
    Priority: 1,
    ExtraPriority: 1,
    'variable': {
      'channel': channel,
      'agentChannel': agentChannel
    }
  }, function (err, res) {
    console.log(err);
  });
  var liveReportObj = {
    agentId: agentId,
    status: "on_hold",
    event: "hold",
    campaignId:campaignId
  }
  var msg = 'adminCampaignLiveReport'
  var socket = await adminSocket(req.query.id_user, msg,liveReportObj);
  // var path = `/campaignCallHold?agentId=${agentId}&campaignId=${campaignId}`
  // var post_options = {
  //   host: process.env.API_IP,
  //   // hostname: 'localhost',
  //   port: process.env.CURRENTIP_PORT,
  //   path: path,
  //   method: 'get'
  // };
  // var post_req = http.request(post_options, function (res) {
  //   res.setEncoding('utf8');
  //   res.on('data', function (chunk) {
  //   });
  // });
  // post_req.end();
  res.locals.result = "success";
  next()
}
function unHold(agentChannel,channel,uniqueNum){
    ami.action({
        'action':'Redirect',
        'Channel':agentChannel,
        Exten: uniqueNum,
        Context: 'UnparkFromWeb',
        Priority: 1
      }, function(err, res) {
        console.log(err);
      });
}
function hangupCall(req,res,next){
    var channel = req.query.channel;
    ami.action({
        'action':'Hangup',
        'Channel':channel,
        Cause: 16
      }, function(err, res) {
        console.log(err);

      });
      res.locals.result = "success";
      next()
}

async function click_to_call(req,res,next){
    var channel = "SIP/"+req.token.regNumber;
    var callbackId =req.query.callbackId;
    var sourceNumber =req.query.sourceNumber;

    console.log("click to call reminder ------------------------>",sourceNumber);
    var didNumber =req.query.didNumber;
    ami.action({
        Action:"originate",
        'Channel':channel,
        'Timeout':20000,
        "WaitTime":30,
        Exten:"callback",
        'Context':"missedCall_callback",
        Async: true,
        Priority: 1,
        'variable':{
            'callbackId':callbackId,
            'sourceNumber':sourceNumber,
            'didNumber':didNumber,
            agent:req.token.regNumber
          }
      }, function(err, res) {
        console.log(err);
      });
      var sql =  `UPDATE missed_reports SET missed_status = 0 WHERE callUniqueId = '${callbackId}' `;
      var [result] =await sequelize.query(sql);
      res.locals.result = "success";
      next()
}
async function campaign_login_click_to_call(req, res, next) {
  var agentLoginData = req.agentLoginData;
  if(process.env.PRODUCTION == 'development'){
    if(agentLoginData != undefined){
      var status = {
        'status': false,
        'message': "agent currently break",
        result: []
      } 
      res.status(201).json(status);
      next()
    }else{
      var status = {
        'status' : true,
        'message' :"Success",
        result: []
      } 
      res.status(240).json(status);
      next()
    }
  }else{
    if(agentLoginData != undefined){
      var status = {
        'status': false,
        'message': "agent currently break",
        result: []
      } 
      res.status(203).json(status);
      next()
    }
    var variable = {
      agentId:req.token.id,
      campaignId:req.query.id_campaign
    }
    var campaignsql = `SELECT * FROM cc_campaign WHERE id = '${req.query.id_campaign}'`;
    var [campaignRes] = await sequelize.query(campaignsql);
    if (campaignRes[0].moh != undefined && campaignRes[0].moh) {
      var sql = `SELECT * FROM musiconhold WHERE moh_name = '${campaignRes[0].moh}'`;
      var [Res] = await sequelize.query(sql);
      if(Res.length != 0)
      // variable.moh = Res[0].name;
    variable.wait_music = Res[0].name;
    }
   console.log(variable)
    if(process.env.PRODUCTION == 'developmentLive'){
      variable.projectType= "development";
    }
    var channel = "SIP/" + req.token.regNumber;
    var result = new Promise(async function(resolve, reject) {
      ami.action({
        Action: "originate",
        'Channel': channel,
        'Timeout': 20000,
        "WaitTime": 30,
        Exten: "login",
        'Context': "cc_agent_login",
        Async: true,
        Priority: 1,
        'variable':variable
      }, function (err, res) {
        console.log("click to call respone ----------------------------->",res);
        resolve(res)
        console.log(err);
      });
    })
    var output = await result;
    if(output != undefined){
      res.locals.result = output.response;
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
async function campaign_click_to_call(req, res, next) {
  if(process.env.PRODUCTION == 'development'){
    var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${req.token.id_user}`;
    var [transRes] = await sequelize.query(transSql);
    console.log("transRes.........",transRes.length)
    if (transRes.length != 0) {
        var transCredit = transRes[0].trans_credit;
        console.log("transCredit.........",transCredit)
        if (transCredit <= transRes[0].trans_creditLimit) {
            console.log("no balance................")
            var status = {
              'status' : false,
              'message' :"recharge",
              result: []
            } 
            res.status(240).json(status);
            // next()
        } else {
          var status = {
            'status' : true,
            'message' :"Success",
            result: []
          } 
          res.status(240).json(status);
          next()
        }
      }
    
  }else{
    var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${req.token.id_user}`;
    var [transRes] = await sequelize.query(transSql);
    console.log("transRes.........",transRes.length)
    if (transRes.length != 0) {
        var transCredit = transRes[0].trans_credit;
        console.log("transCredit.........",transCredit)
        if (transCredit <= transRes[0].trans_creditLimit) {
            console.log("no balance................")
            var status = {
              'status' : false,
              'message' :"recharge",
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
            var callRecordSql = `SELECT callRecord FROM agents WHERE id = '${agentId}'`;
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
            'customerId':customerId,
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
            'Context': "cc_agent_connect",
            Async: true,
            Priority: 1,
            'variable': variable
          })
          var result = new Promise(async function (resolve, reject) {
            if (dial_type == 3 || dial_type == 4) {
              ami.action({
                Action: "originate",
                'Channel': "local/" + phone_number + "@cc_agent_connect/n",
                'Timeout': 20000,
                "WaitTime": 30,
                Exten: phone_number,
                'Context': "cc_call_start",
                Async: true,
                Priority: 1,
                'variable': variable
              }, function (err, res) {
                resolve(res)
                console.log(err);
              });
            } else {
              ami.action({
                Action: "originate",
                'Channel': "local/" + phone_number + "@cc_call_start/n",
                'Timeout': 20000,
                "WaitTime": 30,
                Exten: "login",
                'Context': "cc_agent_connect",
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
async function campaign_broadcast_click_to_call(phone_number,contactStatusId,campaignId,phoneBookId,callerId,uniqueId,id_user,appId,whatsapp_integration) {
  console.log("broadcast ami...",phone_number,contactStatusId,campaignId,phoneBookId,callerId,uniqueId,id_user,appId,whatsapp_integration) 
  logMessage("inside campaign_broadcast_click_to_call : "+phone_number+','+contactStatusId+','+campaignId+','+phoneBookId+','+callerId+','+uniqueId+','+id_user+','+appId+','+whatsapp_integration)
  var variable = {
    uniqueId:uniqueId,
    callerId:callerId,
    contactStatusId:contactStatusId,
    campaignId:campaignId,
    phoneBookId:phoneBookId,
    userId:id_user,
    ivrCampaign:1,
    callFlowId:appId,
    apiSettingIsEnabled:whatsapp_integration
      }
  if (process.env.PRODUCTION == 'developmentLive') {
    variable.projectType = "development";
  }
  var result = new Promise(async function(resolve, reject) {
      ami.action({
        Action: "originate",
        'Channel': "local/"+phone_number+"@vx_br_call_start/n",
        'Timeout': 20000,
        "WaitTime": 30,
        Exten: "888",
        'Context': "vx_br_connect",
        Async: true,
        Priority: 1,
        'variable':variable
      }, function (err, res) {
        resolve(res)
        console.log(err);
      });
    })
    var output = await result;
}
ami.on('managerevent', function(evt) {
  if(evt.application=="NoOp"){
		var logData=evt.appdata
    if(logData.includes("project")){
      var logDataJson = JSON.parse(logData)
      if(logDataJson.project == "cc_voxbay"){
        // console.log(evt)
           }
    }
   
   
  }

   
});
ami.on('queuememberpause',async event => {
  // Handle the event here
  // console.log('Queue member status changed:');
  // console.log(event);
  if(event.paused == 0){
    var agentFullId = event.membername.split("/");
    var agent =agentFullId[1];
  
    var sql =  `select popup_status,currentBreakName from agents where regNumber = '${agent}' `;
    var [agent_status] =await sequelize.query(sql);
    if(agent_status.length != 0){
      if(agent_status[0].popup_status == 1 || agent_status[0].currentBreakName != "Available"){
        // console.log('manual change');
        // console.log(event.membername);
        unpouse_sip(agent,true)
      }
    }
  }
 
});
async function campaign_agent_logout(req, res, next){
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
    var result = new Promise(async function(resolve, reject) {
      ami.action({
        'action':'Hangup',
        'Channel':channel,
        Cause: 16
      }, function (err, res) {
        console.log("click to call respone ----------------------------->",res);
        resolve(res)
        console.log(err);
      });
    })
    var output = await result;
    if(output != undefined){
      res.locals.result = output.response;
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
async function agent_group_logout(channel){
  var map_result = Promise.all(
    channel.map(async (data) => {
      ami.action({
        'action':'Hangup',
        'Channel':data.agentChannel,
        Cause: 16
      }, function (err, res) {
        console.log("click to call respone ----------------------------->",res);
        console.log(err);
      });
    })
  )
  var output = await map_result;
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
    
    var result = new Promise(async function(resolve, reject) {
      ami.action({
        'action':'Hangup',
        'Channel':channel,
        Cause: 16
      }, function (err, res) {
        console.log("click to call respone ----------------------------->",res);
        resolve(res)
        console.log(err);
      });
    })
    var output = await result;
    if(output != undefined){
      res.locals.result = output.response;
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
ami.on('connect', () => {
    console.log('Connected to Asterisk AMI');
    
  });

module.exports = {
    unpouse_sip,
    callHold,
    unHold,
    hangupCall,
    click_to_call,
    getholdData,
    call_pouse,
    campaign_click_to_call,
    campaign_login_click_to_call,
    campaign_agent_logout,
    agent_group_logout,
    agent_call_hangup,
    campaign_broadcast_click_to_call,
    api_integration
}