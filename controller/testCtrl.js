const sequelize = require('../database').db;
var contactStatusModel = require('../model/contactStatusModel');
const apiIntegrationModel = require('../model/campaignApiIntegrationModel');
const axios = require('axios');
var http = require('http');
var qs = require('qs');
var {broadcastIntegration} = require('./campaignCtrl')
var callReport = require('../helper/callReport')
var scheduled_Jobs = {}
const schedule = require('node-schedule');
async function check(req, res, next) {
  try {
    var id = '401'
    var campaignNameWithoutSpaces = `401`;
    var innerScheduleCampaignNameWithoutSpaces = `401` + '_s';
    var runningUnique = campaignNameWithoutSpaces + '_running'
    var pauseUnique = campaignNameWithoutSpaces + '_pause'
    console.log("campaignNameWithoutSpaces.....", campaignNameWithoutSpaces)
    console.log("innerScheduleCampaignNameWithoutSpaces.....", innerScheduleCampaignNameWithoutSpaces)
    console.log("runningUnique.....", runningUnique)
    console.log("pauseUnique.....", pauseUnique)
    var my_job = schedule.scheduledJobs[campaignNameWithoutSpaces];
    if (my_job != undefined)
      my_job.cancel();
    var innserSchedule_job = schedule.scheduledJobs[innerScheduleCampaignNameWithoutSpaces];
    if (innserSchedule_job != undefined)
      innserSchedule_job.cancel();
    var running = schedule.scheduledJobs[runningUnique];
    if (running != undefined)
      running.cancel();
    var pause = schedule.scheduledJobs[pauseUnique];
    if (pause != undefined)
      pause.cancel();
    var scheduledJob = scheduled_Jobs[id];
    if (scheduledJob) {
      clearInterval(scheduledJob.intervalId);
      delete scheduled_Jobs[id];
    }

    res.locals.result = "succes";
    next()


  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next()
  }
}
async function get_test(req, res, next) {
  try {
    // var results = [
    //     {"user_id": 242533,"user_name": "Thanuja","mobile_no": "cFC2bKvklPNQZ+fZLcjUyQ==","plan_name": "Onam Offer","expiry_date": "18-11-2023","plan_status": "expiring","email": "7B9OM694N/7zrd7Ewsnys+Uslot3sFRqUJ4cDAICUfw="},
    //     {"user_id": 242532,"user_name": "test","mobile_no": "XOiCqS5kVVeVjtrNVu8AIA==","plan_name": "Monthly Plan","expiry_date": "09-11-2023","plan_status": "expiring","email": "jhdJpYizFhP/wJQs3YkxxnDey+WJWhgmH3cFLPzEqE4="},
    //     {"user_id": 242620,"user_name": "raj","mobile_no": null,"plan_name": "Monthly Plan","expiry_date": "25-11-2023","plan_status": "expiring","email": "Rlv9tCOn5h+OZj9xIujv/qUtA+gVCwZ/SEo/jH13KxM="},
    //     {"user_id": 242618,"user_name": "","mobile_no": null,"plan_name": "Monthly Plan","expiry_date": "15-11-2023","plan_status": "expiring","email": "odTLSDo2VNJDZ1wSmhEndWkUhn1eVhIRJ51DbhzgXmY="},
    //     {"user_id": 242545,"user_name": "anji","mobile_no": "NsRtESKl4s6m8LVBRgpfvg==","plan_name": "Monthly Plan","expiry_date": "15-11-2023","plan_status": "expiring","email": "G4hooK1sO24UVlYJcuWonVt5RDsFFbKKM5wZj4ZxQyM="}
    // ]
    var update = await contactStatusModel.find({ campaignId: 18 });
    res.locals.result = update;
    next()
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next()
  }
}
async function url_test(req, res, next) {
  try {
    var agentId = 945;
    var campaignId = 710;
    var is_data_submited = 0;
    var call_end_time = '2024-01-31 09:37:44'
    var uniqueId = 859130;
    var path = `/click_to_call_end?agentId=${agentId}&campaignId=${campaignId}&isDataSubmited=${is_data_submited}&callEndTime=${encodeURIComponent(call_end_time)}&uniqueId=${uniqueId}&status=3`
    // var path = `click_to_call_end?agentId=945&campaignId=710&isDataSubmited=0&callEndTime=${encodeURIComponent('2024-01-31 09:37:44')}&uniqueId=859130&status=3`
    var post_options = {
      host: process.env.API_IP,
      port: process.env.CURRENTIP_PORT,
      path: path,
      method: 'get'
    };
    var post_req = http.request(post_options, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
      });
    });
    post_req.end();
    res.locals.result = "success";
    next()
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next()
  }
}
async function api_integration_testing_url(req, res, next) {
  try {
    var callStatus = req.query.callStatus;
    var campaignId = req.query.campaignId;
    var totalCallDuration = 20;
    var call_start_time = "2024-03-18 12:08:09"
    var cr_file = "logDataJson.cr_file";
    var didNumber = '1234567890';
    var contact_number = req.query.contact_number;
    if (callStatus == 'ANSWER') {
      var integrationData = await apiIntegrationModel.find({ campaign_id: campaignId, broadcast_call_status: '3' })
      if (integrationData.length != 0) {
        var jwtaxiosConfig = {}
        var header = {};
        var data = {};
        if (integrationData[0]._doc.broadcast_url) {
          var url = integrationData[0]._doc.broadcast_url;
          jwtaxiosConfig.url = url;
          jwtaxiosConfig.method = integrationData[0]._doc.broadcast_method;
          // if (integrationData[0]._doc.broadcast_token) {
          //   jwtaxiosConfig.headers = {
          //     Authorization: `Bearer ${integrationData[0]._doc.broadcast_token}`,
          //   }
          // }
          if (integrationData[0]._doc.headerParams) {
            jwtaxiosConfig.headers = integrationData[0]._doc.headerParams
          }
          var form_type = integrationData[0]._doc.data_format;
          // if (form_type == '1') {
          //   if (integrationData[0]._doc.structure != undefined) {
          //     var objectKey = Object.keys(integrationData[0]._doc.structure);
          //     var dataStructure = integrationData[0]._doc.structure[objectKey];
          //     var structure = JSON.stringify(dataStructure);
          //     // Filter and extract values starting with "$"
          //     for (var key in dataStructure) {
          //       if (dataStructure.hasOwnProperty(key)) {
          //         var value = dataStructure[key];
          //         if (value.startsWith('$')) {
          //           console.log(value);
          //           var remove_value = value.replace('$', '');
          //           if (remove_value == 'callStatus'){
          //             structure = structure.replace(value, callStatus);
          //           }else if (remove_value == 'totalCallDuration'){
          //             structure = structure.replace(value, totalCallDuration);
          //           }else if (remove_value == 'cr_file'){
          //             structure = structure.replace(value, cr_file);
          //           }else if (remove_value == 'didNumber'){
          //             structure = structure.replace(value, didNumber);
          //           }else if (remove_value == 'call_start_time'){
          //             structure = structure.replace(value, call_start_time);
          //           }else if (remove_value == 'contact_number'){
          //             structure = structure.replace(value, contact_number);
          //           } else {
          //             structure = structure.replace(value, remove_value);
          //           }
          //         }
          //       }
          //     }
          //     integrationData[0]._doc.structure[objectKey] = structure;
          //     var jsonDataStructure = integrationData[0]._doc.structure;
          //     var result = { ...bodyParams, ...jsonDataStructure };
          //   } else {
          //     var result = bodyParams
          //   }
          //   jwtaxiosConfig.data = result;
          // }
          if (form_type == '1') {
            if (integrationData[0]._doc.structure != undefined) {
              var jsonstructure = integrationData[0]._doc.structure;
              var objectKey = Object.keys(integrationData[0]._doc.structure);
              var dataStructure = integrationData[0]._doc.structure[objectKey];
              var structure = JSON.stringify(jsonstructure);
              // Filter and extract values starting with "$"
              var regex = /\$[^\s,"]+/g;

              var matches = structure.match(regex);
              matches.map(async (value) => {
                var remove_value = value.replace('$', '');
                if (remove_value == 'callStatus') {
                  structure = structure.replace(value, callStatus);
                } else if (remove_value == 'totalCallDuration') {
                  structure = structure.replace(value, totalCallDuration);
                } else if (remove_value == 'cr_file') {
                  structure = structure.replace(value, cr_file);
                } else if (remove_value == 'didNumber') {
                  structure = structure.replace(value, didNumber);
                } else if (remove_value == 'call_start_time') {
                  structure = structure.replace(value, call_start_time);
                } else if (remove_value == 'contact_number') {
                  structure = structure.replace(value, contact_number);
                } else {
                  structure = structure.replace(value, remove_value);
                }
              })


              // var structure = JSON.stringify(structure);
              // var regex = /\$[^\s,"]+/g;

              // var matches = structure.match(regex);
              // matches.map(async (value) => {
              //   var remove_value = value.replace('$', '');
              //   if (remove_value == 'callStatus') {
              //     structure = structure.replace(value, callStatus);
              //   } else if (remove_value == 'totalCallDuration') {
              //     structure = structure.replace(value, totalCallDuration);
              //   } else if (remove_value == 'cr_file') {
              //     structure = structure.replace(value, cr_file);
              //   } else if (remove_value == 'didNumber') {
              //     structure = structure.replace(value, didNumber);
              //   } else if (remove_value == 'call_start_time') {
              //     structure = structure.replace(value, call_start_time);
              //   } else if (remove_value == 'contact_number') {
              //     structure = structure.replace(value, contact_number);
              //   } else {
              //     structure = structure.replace(value, remove_value);
              //   }
              // })
              // var jsonstructure = JSON.parse(structure);

              // var objectKey = Object.keys(bodyParams);
              // var paramskey = objectKey[0]
              // if(paramskey == 'JSON'){
              //   var result = {paramskey : JSON.parse(structure)};
              // }
              var parsedStructure = JSON.parse(structure);
              if (integrationData[0]._doc.bodyParams != undefined) {
                var bodyParams = integrationData[0]._doc.bodyParams;

                var result = { ...bodyParams, ...jsonstructure };
              } else {
                var result = parsedStructure
              }
              jwtaxiosConfig.data = result;
            } else {
              jwtaxiosConfig.data = {}
            }
          } else if (form_type == '2') {
            if (integrationData[0]._doc.bodyParams != undefined) {
              var bodyParams = integrationData[0]._doc.bodyParams;
              var bodyParams_key = Object.keys(bodyParams);
              var data = {}
              bodyParams_key.map((input_value) => {
                var value = bodyParams[input_value];
                if (value == 'callStatus') {
                  data[input_value] = callStatus;
                } else if (value == 'totalCallDuration') {
                  data[input_value] = totalCallDuration;
                } else if (value == 'cr_file') {
                  data[input_value] = cr_file;
                } else if (value == 'didNumber') {
                  data[input_value] = didNumber;
                } else if (value == 'call_start_time') {
                  data[input_value] = call_start_time;
                } else if (value == 'contact_number') {
                  data[input_value] = contact_number;
                } else {
                  data[input_value] = value;
                }
              })
              data = qs.stringify(data);
              header['Content-Type'] = 'application/x-www-form-urlencoded';
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
                  input.append(input_value, callStatus);
                } else if (value == 'totalCallDuration') {
                  input.append(input_value, totalCallDuration);
                } else if (value == 'cr_file') {
                  input.append(input_value, cr_file);
                } else if (value == 'didNumber') {
                  input.append(input_value, didNumber);
                } else if (value == 'call_start_time') {
                  input.append(input_value, call_start_time);
                } else if (value == 'contact_number') {
                  input.append(input_value, contact_number);
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
                  url += input_value + '=' + callStatus + "&";
                } else if (value == 'totalCallDuration') {
                  url += input_value + '=' + totalCallDuration + "&";
                } else if (value == 'cr_file') {
                  url += input_value + '=' + cr_file + "&";
                } else if (value == 'didNumber') {
                  url += input_value + '=' + didNumber + "&";
                } else if (value == 'call_start_time') {
                  url += input_value + '=' + call_start_time + "&";
                } else if (value == 'contact_number') {
                  url += input_value + '=' + contact_number + "&";
                } else {
                  url += input_value + '=' + value + "&";
                }
              })
              jwtaxiosConfig.url = url
            }
          }
          const response = await axios(jwtaxiosConfig);
        }
      }
    } else {
      var integrationData = await apiIntegrationModel.find({ campaign_id: campaignId, broadcast_call_status: '2' })
      if (integrationData.length != 0) {
        var jwtaxiosConfig = {}
        if (integrationData[0]._doc.broadcast_url) {
          var url = integrationData[0]._doc.broadcast_url;
          jwtaxiosConfig.url = url;
          jwtaxiosConfig.method = integrationData[0]._doc.broadcast_method;
          // if (integrationData[0]._doc.broadcast_token) {
          //   jwtaxiosConfig.headers = {
          //     Authorization: `Bearer ${integrationData[0]._doc.broadcast_token}`,
          //   }
          // }
          if (integrationData[0]._doc.headerParams) {
            jwtaxiosConfig.headers = integrationData[0]._doc.headerParams
          }
          if (integrationData[0]._doc.bodyParams != undefined) {
            var bodyParams = integrationData[0]._doc.bodyParams;
            var form_type = integrationData[0]._doc.data_format;
            if (form_type == '1') {
              if (integrationData[0]._doc.structure != undefined) {
                var objectKey = Object.keys(integrationData[0]._doc.structure);
                var dataStructure = integrationData[0]._doc.structure[objectKey];
                var structure = JSON.stringify(dataStructure);
                // Filter and extract values starting with "$"
                for (var key in dataStructure) {
                  if (dataStructure.hasOwnProperty(key)) {
                    var value = dataStructure[key];
                    if (value.startsWith('$')) {
                      console.log(value);
                      var remove_value = value.replace('$', '');
                      if (remove_value == 'callStatus') {
                        structure = structure.replace(value, callStatus);
                      } else if (remove_value == 'totalCallDuration') {
                        structure = structure.replace(value, totalCallDuration);
                      } else if (remove_value == 'cr_file') {
                        structure = structure.replace(value, cr_file);
                      } else if (remove_value == 'didNumber') {
                        structure = structure.replace(value, didNumber);
                      } else if (remove_value == 'call_start_time') {
                        structure = structure.replace(value, call_start_time);
                      } else if (remove_value == 'contact_number') {
                        structure = structure.replace(value, contact_number);
                      } else {
                        structure = structure.replace(value, remove_value);
                      }
                    }
                  }
                }
                integrationData[0]._doc.structure[objectKey] = structure;
                var jsonDataStructure = integrationData[0]._doc.structure;
                var result = { ...bodyParams, ...jsonDataStructure };
              } else {
                var result = bodyParams
              }
              jwtaxiosConfig.data = result;
            } else if (form_type == '2') {
              var bodyParams_key = Object.keys(bodyParams);
              var data = {}
              bodyParams_key.map((input_value) => {
                var value = bodyParams[input_value];
                if (value == 'callStatus') {
                  data[input_value] = callStatus;
                } else if (value == 'totalCallDuration') {
                  data[input_value] = totalCallDuration;
                } else if (value == 'cr_file') {
                  data[input_value] = cr_file;
                } else if (value == 'didNumber') {
                  data[input_value] = didNumber;
                } else if (value == 'call_start_time') {
                  data[input_value] = call_start_time;
                } else if (value == 'contact_number') {
                  data[input_value] = contact_number;
                } else {
                  data[input_value] = value;
                }
              })
              jwtaxiosConfig.data = data;
            } else if (form_type == '3') {
              var input = new FormData();
              var bodyParams_key = Object.keys(bodyParams);
              bodyParams_key.map((input_value) => {
                var value = bodyParams[input_value];
                if (value == 'callStatus') {
                  input.append(input_value, callStatus);
                } else if (value == 'totalCallDuration') {
                  input.append(input_value, totalCallDuration);
                } else if (value == 'cr_file') {
                  input.append(input_value, cr_file);
                } else if (value == 'didNumber') {
                  input.append(input_value, didNumber);
                } else if (value == 'call_start_time') {
                  input.append(input_value, call_start_time);
                } else if (value == 'contact_number') {
                  input.append(input_value, contact_number);
                } else {
                  input.append(input_value, value);
                }
              })
              jwtaxiosConfig.data = input;
            } else {
              url += "?";
              var bodyParams_key = Object.keys(bodyParams);
              bodyParams_key.map((input_value) => {
                var value = bodyParams[input_value];
                if (value == 'callStatus') {
                  url += input_value + '=' + callStatus + "&";
                } else if (value == 'totalCallDuration') {
                  url += input_value + '=' + totalCallDuration + "&";
                } else if (value == 'cr_file') {
                  url += input_value + '=' + cr_file + "&";
                } else if (value == 'didNumber') {
                  url += input_value + '=' + didNumber + "&";
                } else if (value == 'call_start_time') {
                  url += input_value + '=' + call_start_time + "&";
                } else if (value == 'contact_number') {
                  url += input_value + '=' + contact_number + "&";
                } else {
                  url += input_value + '=' + value + "&";
                }
              })
              jwtaxiosConfig.url = url
            }
          } else {
            jwtaxiosConfig.data = {}
          }
          const response = await axios(jwtaxiosConfig);
        }
      }
    }
    res.locals.result = "success";
    next()
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next()
  }
}
async function broadcastIntegrationApi(req, res, next) {
  try {
    var data = req.body;
    var livecall = await broadcastIntegration(data.campaignId,data.broadcastSettings)
    res.locals.result = livecall;
    next()
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next()
  }
}
async function development_call_event(req, res, next) {
  try {
    var evt = req.body.event;
    var callData = req.body.callData;
    var result = await callReport.developmentCallEvent(evt, callData)
    res.locals.result = result;
    next()
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next()
  }
}
async function development_call_event_multiple(req, res, next) {
  try {
    let datas = req.body
    let results = [];

    for (let i = 0; i < datas.length; i++) {
      const evt = datas[i].event
      const callData = datas[i].callData
      const result = await callReport.developmentCallEvent(evt, callData);
      results.push(result);
    }

    res.locals.result = results;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}


module.exports = {
  check,
  get_test,
  url_test,
  api_integration_testing_url,
  broadcastIntegrationApi,
  development_call_event,
  development_call_event_multiple,
}