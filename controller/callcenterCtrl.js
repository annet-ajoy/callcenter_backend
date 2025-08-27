const {
  rackServer,
  getConnection,
  db: sequelize,
  db3: sequelize2,
} = require("../database");
if (
  process.env.PRODUCTION == "developmentLive" ||
  process.env.PRODUCTION == "development"
) {
  var {
    agentActivityCallSocket,
    agentActivityCountSocket,
    agentActivityCallHoldSocket,
    get_prefix_upload_csv,
  } = require("../helper/developmentCallEventSqlFun");
} else {
  var {
    agentActivityCallSocket,
    agentActivityCountSocket,
    agentActivityCallHoldSocket,
  } = require("../helper/liveCallEventSqlFun");
}
const { get_live_data } = require("../helper/developmentCallEventSqlFun");
var incomingCallReportModel = require("../model/incomingCallReportModel");
var cc_outgoingCallReportModel = require("../model/cc_outgoingCallReportModel");
var agentModel = require("../model/customModel");
var leadModel = require("../model/leadModel");

var templateModel = require("../model/templateModel");
var templatefieldModel = require("../model/templatefieldModel");
var reminderModel = require("../model/reminderModel");
var broadcastEventModel = require("../model/broadcastEventModel");
var smartGroupModel = require("../model/smartGroupModel");
var smartGroupAgents = require("../model/smartgroupAgentModel");
var smartGroupReport = require("../model/smartGroupReport");
var audiofileModel = require("../model/audioFilesModel");
var agentsModel = require("../model/agentModel");
var extModel = require("../model/extModel");
var callgroupModel = require("../model/callGroup");
var smsProviderModel = require("../model/smsIntegrationModel");
var smsProviderHead = require("../model/smsIntegrationHead");
var smsProviderBody = require("../model/smsIntegrationBody");
var whatsappProviderModel = require("../model/whatsappIntegrationModel");
var whatsappProviderHead = require("../model/whatsappIntegrationHead");
var whatsappProviderBody = require("../model/whatsappIntegrationBody");
var apiProviderModel = require("../model/ApiIntegrationModel");
var apiProviderHead = require("../model/apiIntegrationHead");
var apiProviderBody = require("../model/ApiIntegrationBody");
var smsProviderModelAdmin = require("../model/smsProviderModelAdmin");
var smsProviderHeadAdmin = require("../model/smsProviderHeadAdmin");
var smsProviderBodyAdmin = require("../model/smsProviderBodyAdmin");
var whatsappProviderModelAdmin = require("../model/whatsappProviderModelAdmin");
var whatsappProviderHeadAdmin = require("../model/whatsappProviderHeadAdmin");
var whatsappProviderBodyAdmin = require("../model/whatsappProviderBodyAdmin");
var apiProviderModelAdmin = require("../model/apiProviderModelAdmin");
var apiProviderHeadAdmin = require("../model/apiProviderHeadAdmin");
var apiProviderBodyAdmin = require("../model/apiProviderBodyAdmin");
var templateSettingsVariable = require("../model/templateSettingsVariableModel");
var customerPlanModel = require("../model/customerPlanModel");
var templateSms = require("../model/templateSmsModel");
var templateWhatsapp = require("../model/templateWhatsappModel");
var templateApi = require("../model/templateApiModel");
var breaksModel = require("../model/breaksModel");
var didGroupingModel = require("../model/didGrouping");
var didGroupSettingsModel = require("../model/didGroupSettings");
var ccBlacklistModel = require("../model/ccBlacklistModel");
var ccBlacklistContactsModel = require("../model/ccBlacklistContactsModel");
var uniqueMissedcallModel = require("../model/uniqueMissedcallModel");
var uniqueMissedcallModelLog = require("../model/uniqueMissedCallLog");
var smartGroupReport = require("../model/smartGroupReport");
var smsReportModel = require("../model/smsReportModel");
var defaultDatafromModel = require("../model/defaultDataformModel");
const DefaultCalltaskModel = require("../model/autox/autoxDefaultCalltaskForDataform")
const Callflow = require("../model/callFlow");
const CallDispositions = require("../model/callDispositonModel");
const CallTaskComment = require('../model/callTaskCommentModel');

let ObjectId = require("mongodb").ObjectId;
var moment = require("moment");
var axios = require("axios");
const nodemailer = require("nodemailer");
const { Op, Sequelize, json, NUMBER } = require("sequelize");
const {
  string_encode,
  string_decode,
  encrypteAes128,
  decryptAes128,
} = require("../helper/auth");
const User = require("../model/commonUserModel");
const UserLiveData = require("../model/userLiveDataModel");
var dashboardUserViewModel = require("../model/dashboardUserViewModel");

if (
  process.env.PRODUCTION == "developmentLive" ||
  process.env.PRODUCTION == "development"
) {
  var {
    adminSocket,
    userSocket,
    smartgroupSocket,
    departmentSocket,
    subadminSocket,
  } = require("../helper/developmentSocket");
} else {
  var {
    adminSocket,
    userSocket,
    smartgroupSocket,
    departmentSocket,
    subadminSocket,
  } = require("../helper/liveSocket");
}
const roundrobin_allocation = require("../model/roundrobinAllocation");
const Password = require("node-php-password");
var fs = require("fs");
var path = require("path");
var sox = require("sox");
const { token } = require("morgan");
const getAudioDurationInSeconds =
  require("get-audio-duration").getAudioDurationInSeconds;
const developmentCallEventSqlFun = require("../helper/developmentCallEventSqlFun");
const getDateRangeForReportingPeriode = require("../utils/getDateRangeForReportingPeriod");
const callByotApi = require("../helper/callByotApi");
const FormData = require("form-data");
const Departments = require("../model/departmentModel");
const SubAdminDepartment = require("../model/subadminDepartmentModel");
var contactsModel = require("../model/contactsModel");
const customers = require("../model/customers");
const userCallReportModel = require("../model/userCallReportModel");
const { callCenterPopupLog, dashboardAgentActivityLog } = require("../logger");
const { asyncHandler } = require("../utils/autox/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const { application } = require("express");


const getCallFlowName = (idsString, callFlowDetails, splitKey = ", ") => {
  if (!idsString) return "";

  const ids = idsString.split(",");

  const names = ids
    .map(id => callFlowDetails[id])
    .filter(Boolean); // Filter out undefined IDs

  return names.join(splitKey);
};

const getWorkingTImeBasedStartAndEnd = (worktime, filterBy) => {
  try {
    if (!["today", "yesterday"].includes(filterBy)) {
      return {};
    }

    let start, end;
    
    let [startTime, endTime] = worktime.split("-").map(t => t === "24:00" ? "23:59" : t);


    const baseDate = new Date();
    if (filterBy === "yesterday") {
      baseDate.setDate(baseDate.getDate() - 1);
    }

    const yyyy = baseDate.getFullYear();
    const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
    const dd = String(baseDate.getDate()).padStart(2, "0");

    start = `${yyyy}-${mm}-${dd} ${startTime}:00`;

    // Parse time parts
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const endDate = new Date(baseDate);
    const isNextDay =
      endHour < startHour || (endHour === startHour && endMin <= startMin);
    if (isNextDay) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const yyyyEnd = endDate.getFullYear();
    const mmEnd = String(endDate.getMonth() + 1).padStart(2, "0");
    const ddEnd = String(endDate.getDate()).padStart(2, "0");

    end = `${yyyyEnd}-${mmEnd}-${ddEnd} ${endTime}:00`;

    return { start, end };
  } catch (error) {
    return {};
  }
};

const uploadFilesByot = async (files, token, req) => {
  const payload = [];
  for (const file of files) {
    try {
      const filePath = path.join(
        process.env.file_PATH,
        "audio",
        file.systemfilename
      );

      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        continue;
      }

      payload.push({
        fileName: file.systemfilename,
        fileType: "audio/wav",
        fileUrl: `${req.protocol}://${req.get(
          "host"
        )}/callcenter/get_audiofile_path/${file.systemfilename}`,
      });

      console.log(`Prepared ${file.systemfilename}`);
    } catch (error) {
      console.error(`Error reading ${file.systemfilename}:`, error.message);
    }
  }

  if (payload.length === 0) {
    console.warn("No files to upload.");
    return;
  }

  await callByotApi(
    "POST",
    "/audio",
    { files: payload, data: files },
    {},
    { token },
    files[0].id_user
  );
};

async function get_missedcall_count(req, res, next) {
  try {
    var date = req.query.date;
    var fromdatetime = new Date();
    var todatetime = new Date();
    if (date != undefined) {
      if (date == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      // if (date == "lastweek") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 7)
      // }
      // if (date == "lastmonth") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 31)
      // }
      // var currentdate = fromdatetime.getDate();
      // var currentMnth = fromdatetime.getMonth() + 1;
      // var year = fromdatetime.getFullYear();
      // var fromDate = `${year}-${currentMnth}-${currentdate}`;
      if (date == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (date == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var Todate = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
    } else {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
      var Todate = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var regNumber = req.token.id;
    var id_user = req.token.id_user;
    var MisscallCount = `SELECT count(id) as misscall FROM incoming_reports WHERE id_user='${id_user}' AND user_id = '${regNumber}' AND user_status != 'ANSWERED' AND call_start_time BETWEEN '${fromDate}' AND '${Todate}' GROUP by id `;
    var [missCount] = await getConnection.query(MisscallCount);
    res.locals.result = missCount.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_answeredcall_count(req, res, next) {
  try {
    var date = req.query.date;
    var fromdatetime = new Date();
    var todatetime = new Date();
    if (date != undefined) {
      if (date == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      // if (date == "lastweek") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 7)
      // }
      // if (date == "lastmonth") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 31)
      // }
      // var currentdate = fromdatetime.getDate();
      // var currentMnth = fromdatetime.getMonth() + 1;
      // var year = fromdatetime.getFullYear();
      // var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      if (date == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (date == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var Todate = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
    } else {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
      var Todate = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var agentId = req.token.regNumber;
    var answeredCallCount = `SELECT count(id) as answeredCall FROM incoming_reports WHERE connected_duration != 0 and user_status = 'ANSWERED' and call_start_time BETWEEN '${fromDate}' and '${Todate}' and connected_user = '${agentId}' GROUP by id`;
    var [count] = await getConnection.query(answeredCallCount);
    res.locals.result = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_incomingcall_count(req, res, next) {
  try {
    var date = req.query.date;
    var fromdatetime = new Date();
    var todatetime = new Date();
    if (date != undefined) {
      if (date == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      // if (date == "lastweek") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 7)
      // }
      // if (date == "lastmonth") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 31)
      // }
      // var currentdate = fromdatetime.getDate();
      // var currentMnth = fromdatetime.getMonth() + 1;
      // var year = fromdatetime.getFullYear();
      // var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      if (date == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (date == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var Todate = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
    } else {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
      var Todate = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var agentId = req.token.regNumber;
    var incomingMissedCountSql = `SELECT count(id) as missed FROM incoming_reports WHERE call_start_time BETWEEN '${fromDate}' and '${Todate}' and user_id = '${agentId}' and user_status !='ANSWERED' GROUP by id`;
    var incomingAnsweredCountSql = `SELECT count(id) as answered,sum(connected_duration) as duration FROM incoming_reports WHERE call_start_time BETWEEN '${fromDate}' and '${Todate}' and incoming_reports.connected_user = '${agentId}' GROUP by incoming_reports.connected_user`;
    var [incomingAnsweredCount] = await getConnection.query(
      incomingAnsweredCountSql
    );
    var answeredCallCount = `SELECT count(id) as answeredCall FROM incoming_reports WHERE connected_duration != 0 and user_status = 'ANSWERED' and call_start_time BETWEEN '${fromDate}' and '${Todate}' and connected_user = '${agentId}' GROUP by id`;
    var [count] = await getConnection.query(answeredCallCount);
    res.locals.answeredCall = count.length;
    var total = 0;
    if (incomingAnsweredCount.length != 0) {
      total += incomingAnsweredCount[0].answered;
    }
    res.locals.result = total;
    if (incomingAnsweredCount.length != 0) {
      res.locals.duration = incomingAnsweredCount[0].duration;
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_notconnectedcall_count(req, res, next) {
  try {
    var date = req.query.date;
    var fromdatetime = new Date();
    var todatetime = new Date();
    if (date != undefined) {
      if (date == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      // if (date == "lastweek") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 7)
      // }
      // if (date == "lastmonth") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 31)
      // }
      // var currentdate = fromdatetime.getDate();
      // var currentMnth = fromdatetime.getMonth() + 1;
      // var year = fromdatetime.getFullYear();
      // var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      if (date == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (date == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var Todate = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("fromDate :", fromDate);
      console.log("Todate :", Todate);
    } else {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
      var Todate = `${yyyy}-${mm}-${dd} 23:59:59`;
      console.log("fromDate :", fromDate);
      console.log("Todate :", Todate);
    }
    var agentId = req.token.regNumber;
    var notconnectCount = `SELECT count(id) as incomingalls FROM incoming_reports WHERE duration = 0 and user_status != 'ANSWERED' and connected_user = '${agentId}' and call_start_time BETWEEN '${fromDate}' and '${Todate}' GROUP by id `;
    var [count] = await getConnection.query(notconnectCount);
    res.locals.result = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_outgoingcall_count(req, res, next) {
  try {
    var date = req.query.date;
    var fromdatetime = new Date();
    var todatetime = new Date();
    if (date != undefined) {
      if (date == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      // if (date == "lastweek") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 7)
      // }
      // if (date == "lastmonth") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 31)
      // }
      // var currentdate = fromdatetime.getDate();
      // var currentMnth = fromdatetime.getMonth() + 1;
      // var year = fromdatetime.getFullYear();
      // var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      if (date == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (date == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var Todate = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("fromDate :", fromDate);
      console.log("Todate :", Todate);
    } else {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
      var Todate = `${yyyy}-${mm}-${dd} 23:59:59`;
      console.log("fromDate :", fromDate);
      console.log("Todate :", Todate);
    }
    var id_agent = req.token.id;
    var outgoingCount = `SELECT count(id) as outgoingalls,sum(duration) as duration FROM cc_outgoing_reports WHERE date BETWEEN '${fromDate}' and '${Todate}' and user_id = '${id_agent}' GROUP by user_id`;
    var [count] = await rackServer.query(outgoingCount);
    if (count.length != 0) {
      var outgoingCallCount = count[0].outgoingalls;
      var outgoingCallDuration = count[0].duration;
    } else {
      var outgoingCallCount = 0;
      var outgoingCallDuration = 0;
    }
    var campaignOutgoingCount = `SELECT count(id) as campaign_calls,sum(duration) as duration FROM cc_campaign_outgoing_reports where createdAt between '${fromDate}' and '${Todate}' and user_id = '${id_agent}' GROUP by user_id`;
    var [campaignCount] = await rackServer.query(campaignOutgoingCount);
    if (campaignCount.length != 0) {
      var campaignCallCount = campaignCount[0].campaign_calls;
      var campaignCallDuration = campaignCount[0].duration;
    } else {
      var campaignCallCount = 0;
      var campaignCallDuration = 0;
    }
    var totalCount = Number(outgoingCallCount) + Number(campaignCallCount);
    var totalDuration =
      Number(outgoingCallDuration) + Number(campaignCallDuration);
    res.locals.result = totalCount;
    res.locals.duration = totalDuration;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_total_count(req, res, next) {
  try {
    var date = req.query.date;
    var fromdatetime = new Date();
    var todatetime = new Date();
    if (date != undefined) {
      if (date == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      // if (date == "lastweek") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 7)
      // }
      // if (date == "lastmonth") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 31)
      // }
      // var currentdate = fromdatetime.getDate();
      // var currentMnth = fromdatetime.getMonth() + 1;
      // var year = fromdatetime.getFullYear();
      // var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      if (date == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (date == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var Todate = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("fromDate :", fromDate);
      console.log("Todate :", Todate);
    } else {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
      var Todate = `${yyyy}-${mm}-${dd} 23:59:59`;
      console.log("fromDate :", fromDate);
      console.log("Todate :", Todate);
    }
    var id_agent = req.token.id;
    var agent = req.token.regNumber;
    var incomingAnsweredCountSql = `SELECT count(id) as incoming,sum(connected_duration) as duration FROM incoming_reports WHERE call_start_time BETWEEN '${fromDate}' and '${Todate}' and incoming_reports.connected_user = '${agent}' GROUP by incoming_reports.connected_user`;
    var [incomingAnsweredCount] = await getConnection.query(
      incomingAnsweredCountSql
    );
    if (incomingAnsweredCount != 0) {
      var incomingCount = Number(incomingAnsweredCount[0].incoming);
      var incomingDuration = Number(incomingAnsweredCount[0].duration);
    } else {
      var incomingCount = 0;
      var incomingDuration = 0;
    }
    var outgoingCountsql = `SELECT count(id) as outgoingalls,sum(duration) as duration FROM cc_outgoing_reports WHERE date BETWEEN '${fromDate}' and '${Todate}' and user_id = '${id_agent}' GROUP by user_id`;
    var [outgoing_count] = await getConnection.query(outgoingCountsql);
    if (outgoing_count != 0) {
      var outgoingCount = Number(outgoing_count[0].outgoingalls);
      var outboundDuration = Number(outgoing_count[0].duration);
    } else {
      var outgoingCount = 0;
      var outboundDuration = 0;
    }
    var campaignOutgoingCount = `SELECT count(id) as campaign_calls,sum(duration) as duration FROM cc_campaign_outgoing_reports where createdAt between '${fromDate}' and '${Todate}' and user_id = '${id_agent}' GROUP by user_id`;
    var [campaignCount] = await getConnection.query(campaignOutgoingCount);
    if (campaignCount.length != 0) {
      var campaignCallCount = Number(campaignCount[0].campaign_calls);
      var campaignCallDuration = Number(campaignCount[0].duration);
    } else {
      var campaignCallCount = 0;
      var campaignCallDuration = 0;
    }
    var totalCount = incomingCount + outgoingCount + campaignCallCount;
    var totalDuration =
      incomingDuration + outboundDuration + campaignCallDuration;
    res.locals.result = totalCount;
    res.locals.duration = totalDuration;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function call_report_status(req, res, next) {
  try {
    var date = req.query.date;
    var agentId = req.token.regNumber;
    var id_agent = req.token.id;
    var fromdatetime = new Date();
    var todatetime = new Date();
    if (date == "lastweek") {
      fromdatetime.setDate(fromdatetime.getDate() - 7);
    }
    if (date == "thirdweek") {
      todatetime.setDate(todatetime.getDate() - 7);
      fromdatetime.setDate(fromdatetime.getDate() - 14);
    }
    if (date == "secondweek") {
      todatetime.setDate(todatetime.getDate() - 14);
      fromdatetime.setDate(fromdatetime.getDate() - 21);
    }
    if (date == "firstweek") {
      todatetime.setDate(todatetime.getDate() - 21);
      fromdatetime.setDate(fromdatetime.getDate() - 28);
    }
    var currentdate = fromdatetime.getDate();
    var currentMnth = fromdatetime.getMonth() + 1;
    var year = fromdatetime.getFullYear();
    var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
    var currentdate = todatetime.getDate();
    var currentMnth = todatetime.getMonth() + 1;
    var year = todatetime.getFullYear();
    var Todate = `${year}-${currentMnth}-${currentdate} 23:59:59`;
    var incomingCount = `SELECT count(id) as incomingCount,DATE_FORMAT(call_start_time,'%d-%m-%y') as call_start_time FROM incoming_reports WHERE call_start_time BETWEEN '${fromDate}' and '${Todate}' and connected_user = '${agentId}' GROUP by DATE_FORMAT(call_start_time,'%y-%m-%d') order by call_start_time desc `;
    var [countIncoming] = await getConnection.query(incomingCount);
    var outgoingCount = `SELECT count(id) as outgoingCount,DATE_FORMAT(date,'%d-%m-%y') as date FROM cc_outgoing_reports WHERE date BETWEEN '${fromDate}' and '${Todate}' and user_id = '${id_agent}' GROUP by DATE_FORMAT(date,'%y-%m-%d')`;
    var [countOutgoing] = await getConnection.query(outgoingCount);
    var array = [];
    var concatedArray = countIncoming.concat(countOutgoing);
    if (concatedArray.length != 0) {
      var uniq = {};
      concatedArray = concatedArray.filter(
        (obj) => !uniq[obj.date] && (uniq[obj.date] = true)
      );
      concatedArray.map(async (concated) => {
        var resultObj = { incoming: 0, outgoing: 0, date: concated.date };
        if (countIncoming.length != 0) {
          var incIndex = countIncoming.findIndex(
            (i) => i.date === concated.date
          );
          if (incIndex !== -1) {
            resultObj.incoming = countIncoming[incIndex].incomingCount;
          }
        }
        if (countOutgoing.length != 0) {
          var outIndex = countOutgoing.findIndex(
            (i) => i.date === concated.date
          );
          if (outIndex !== -1) {
            resultObj.outgoing = countOutgoing[outIndex].outgoingCount;
          }
        }
        array.push(resultObj);
      });
    }
    array.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
    res.locals.result = array;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_incomingcall(req, res, next) {
  try {
    var i = 1;
    var id_user = req.token.id_user;
    var agentId = req.token.id;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var didNumber = req.query.didnumber;
    var sourceNumber = req.query.sourceNumber;
    var status = req.query.status;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }

    //limit start and end
    if (req.token.reporting_period) {
      const { startOfPeriod, endOfPeriod } =
        (await getDateRangeForReportingPeriode(agentId, Start, End)) || {};
      if (startOfPeriod) {
        Start = startOfPeriod;
      }
      if (endOfPeriod) {
        End = endOfPeriod;
      }
    }

    let callflowCondition = "";
    if (req.token.show_misscall_to_all_agents == 0) {
      // 1. Get smart groups where missed calls should be shown
      const smartGroupQuery = `
        SELECT sg.id
        FROM smart_group sg
        INNER JOIN smart_group_agents sga 
          ON sga.smart_groupId = sg.id
        WHERE sg.show_missedcall_to = 3 
          AND sga.user_id = :userId
      `;

      const [smartGroups] = await getConnection.query(smartGroupQuery, {
        replacements: { userId: req.token.id },
      });

      if (smartGroups.length > 0) {
        // 2. Extract smart group IDs
        const smartGroupIds = smartGroups.map((row) => row.id);

        // 3. Find callflow IDs for those smart groups
        const callFlowQuery = `
          SELECT DISTINCT cf.id AS call_flow_id
          FROM call_flow_call_group cfcg
          INNER JOIN call_flow_module cfm 
            ON cfm.id = cfcg.call_flow_module_id
          INNER JOIN call_flow cf 
            ON cf.id = cfm.call_flow_id
          WHERE cfcg.call_grp_id IN (:groupIds)
        `;

        const callFlowIds = await getConnection.query(callFlowQuery, {
          replacements: { groupIds: smartGroupIds },
          type: getConnection.QueryTypes.SELECT,
        });

        // 4. Prepare destination condition only if we got IDs
        if (callFlowIds.length > 0) {
          const callFlowIdList = callFlowIds.map((item) => item.call_flow_id).join(",");
          callflowCondition = `
            OR (
              (appId IN (${callFlowIdList}) AND app = "callflow" AND connected_duration = 0 )
              OR (appId IN (${smartGroupIds}) AND app = "smartgroup"  AND connected_duration = 0)
            )
          `;
        }
      }
    }

    var search = [];
    var sqlCount = `SELECT count(id) as incomingalls FROM incoming_reports where id_user = ${id_user} and (user_id = '${agentId}' ${callflowCondition} ) and call_start_time between '${Start}' and '${End}' `;
    var sql = `SELECT incoming_reports.id,incoming_reports.call_start_time as callStartTime,incoming_reports.app as application, incoming_reports.uniqueid uniqueId, incoming_reports.user_status as agentStatus, incoming_reports.call_status, incoming_reports.source  as sourceNumber, incoming_reports.destination as didNumber, incoming_reports.connected_duration as answeredDuration,incoming_reports.cr_file as callRecordFile,departments.id as deptId,departments.name as departmentName,CASE WHEN incoming_reports.app = 'user' THEN NULL WHEN incoming_reports.app = 'smartgroup' THEN smart_group.name WHEN incoming_reports.app = 'callflow' THEN call_flow.name END as appName FROM incoming_reports LEFT JOIN departments ON incoming_reports.id_department = departments.id LEFT JOIN smart_group ON incoming_reports.appId = smart_group.id LEFT JOIN call_flow ON incoming_reports.appId = call_flow.id where incoming_reports.id_user = ${id_user} and (user_id = '${agentId}' ${callflowCondition} ) and call_start_time between '${Start}' and '${End}' `;
    if (didNumber != undefined) {
      sqlCount += `and destination like $${i} `;
      sql += `and destination like $${i} `;
      search.push("%" + didNumber + "%");
      i += 1;
    }
    if (sourceNumber != undefined) {
      sqlCount += `and incoming_reports.source like $${i} `;
      sql += `and incoming_reports.source like $${i} `;
      search.push("%" + sourceNumber + "%");
      i += 1;
    }
    if (status != undefined) {
      sqlCount += `and user_status like $${i} `;
      sql += `and user_status like $${i} `;
      search.push("%" + status + "%");
      i += 1;
    }
    sqlCount += `GROUP BY id `;
    sql += ` order by id desc limit ${skip},${limit} `;
    var [result] = await rackServer.query(sql, { bind: search });
    var [count] = await rackServer.query(sqlCount, { bind: search });
    var total = count.length;

    // if (req.token.phn_number_mask == 1) {
    //   var map_result = Promise.all(
    //     result.map(async (value) => {
    //       var sNo = await string_encode(value.sourceNumber);
    //       if (sNo) {
    //         value.sourceNumber = sNo;
    //       }
    //       return value;
    //     })
    //   );
    //   var result = await map_result;
    // }

    const sourceNumbers = result.map((entry) => entry.sourceNumber);
    const contact_data = await contactsModel
      .find(
        { phone_number: { $in: sourceNumbers }, id_user: id_user },
        { name: 1, phone_number: 1, _id: 0 }
      )
      .lean();
    const updatedResult = result.map((item) => {
      const match = contact_data.find((entry) =>
        entry.phone_number.includes(item.sourceNumber)
      );
      if (match) {
        return { ...item, contact_name: match.name };
      }
      return item;
    });
    res.locals.result = updatedResult;
    res.locals.count = total;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_incomingcall_csv(req, res, next) {
  try {
    var i = 1;
    var id_user = req.token.id_user;
    var agentId = req.token.id;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var didNumber = req.query.didnumber;
    var sourceNumber = req.query.sourceNumber;
    var status = req.query.status;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");

    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }

    //limit start and end
    if (req.token.reporting_period) {
      const { startOfPeriod, endOfPeriod } =
        (await getDateRangeForReportingPeriode(agentId, Start, End)) || {};
      if (startOfPeriod) {
        Start = startOfPeriod;
      }
      if (endOfPeriod) {
        End = endOfPeriod;
      }
    }

    var search = [];
    var sqlCount = `SELECT count(id) as incomingalls FROM incoming_reports where id_user = ${id_user} and user_id = '${agentId}' and call_start_time between '${Start}' and '${End}' `;
    var sql = `SELECT incoming_reports.id,incoming_reports.call_start_time as callStartTime,incoming_reports.app as application,incoming_reports.user_status as agentStatus,incoming_reports.call_status, incoming_reports.source  as sourceNumber, incoming_reports.destination as didNumber, incoming_reports.connected_duration as answeredDuration,incoming_reports.cr_file as callRecordFile,departments.id as deptId,departments.name as departmentName,CASE WHEN incoming_reports.app = 'user' THEN NULL WHEN incoming_reports.app = 'smartgroup' THEN smart_group.name WHEN incoming_reports.app = 'callflow' THEN call_flow.name END as appName FROM incoming_reports LEFT JOIN departments ON incoming_reports.id_department = departments.id LEFT JOIN smart_group ON incoming_reports.appId = smart_group.id LEFT JOIN call_flow ON incoming_reports.appId = call_flow.id where incoming_reports.id_user = ${id_user} and user_id = '${agentId}' and call_start_time between '${Start}' and '${End}' `;
    if (didNumber != undefined) {
      sqlCount += `and destination like $${i} `;
      sql += `and destination like $${i} `;
      search.push("%" + didNumber + "%");
      i += 1;
    }
    if (sourceNumber != undefined) {
      sqlCount += `and incoming_reports.source like $${i} `;
      sql += `and incoming_reports.source like $${i} `;
      search.push("%" + sourceNumber + "%");
      i += 1;
    }
    if (status != undefined) {
      sqlCount += `and user_status like $${i} `;
      sql += `and user_status like $${i} `;
      search.push("%" + status + "%");
      i += 1;
    }
    sqlCount += `GROUP BY id `;
    sql += ` order by id desc `;
    var [result] = await rackServer.query(sql, { bind: search });
    var [count] = await rackServer.query(sqlCount, { bind: search });
    var total = count.length;
    if (result.length != 0) {
      var map_result = Promise.all(
        result.map(async (value) => {
          if (value.agentStatus == "ANSWERED") {
            var fromdateDateTime = value.callStartTime;
            var cntdate = fromdateDateTime
              .getDate()
              .toString()
              .padStart(2, "0");
            var currentMnth = (fromdateDateTime.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            var year = fromdateDateTime.getFullYear();
            var date = `${year}-${currentMnth}-${cntdate}`;
            value.callRecordFile =
              `${process.env.NODE_PATH}` +
              `callcenter/get_incoming_callrecordings_without_token/` +
              `${value.callRecordFile}.wav/` +
              `${date}/` +
              `${id_user}`;
          } else {
            value.callRecordFile = "";
          }
          return value;
        })
      );
      result = await map_result;
    }
    if (req.token.phn_number_mask == 1) {
      var map_result = Promise.all(
        result.map(async (value) => {
          var sNo = await string_encode(value.sourceNumber);
          if (sNo) {
            value.sourceNumber = sNo;
          }
          return value;
        })
      );
      var result = await map_result;
    }
    const sourceNumbers = result.map((entry) => entry.sourceNumber);
    const contact_data = await contactsModel
      .find(
        { phone_number: { $in: sourceNumbers }, id_user: id_user },
        { name: 1, phone_number: 1, _id: 0 }
      )
      .lean();
    const updatedResult = result.map((item) => {
      const match = contact_data.find((entry) =>
        entry.phone_number.includes(item.sourceNumber)
      );
      if (match) {
        return { ...item, contact_name: match.name };
      }
      return item;
    });
    res.locals.result = updatedResult;
    res.locals.count = total;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_incoming_missedcall(req, res, next) {
  try {
    var i = 1;
    var id_user = req.token.id_user;
    var agentId = req.token.id;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var didNumber = req.query.didnumber;
    var sourceNumber = req.query.sourceNumber;
    var status = req.query.status;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }

    //limit start and end
    if (req.token.reporting_period) {
      const { startOfPeriod, endOfPeriod } =
        (await getDateRangeForReportingPeriode(agentId, Start, End)) || {};
      if (startOfPeriod) {
        Start = startOfPeriod;
      }
      if (endOfPeriod) {
        End = endOfPeriod;
      }
    }

    var search = [];
    var sqlCount = `SELECT count(id) as incomingalls FROM incoming_reports where id_user = ${id_user} and user_id = '${agentId}' and call_start_time between '${Start}' and '${End}' and user_status != 'ANSWERED'`;
    var sql = `SELECT incoming_reports.id,incoming_reports.call_start_time as callStartTime,incoming_reports.user_status as agentStatus, incoming_reports.call_status, incoming_reports.source  as sourceNumber, incoming_reports.destination as didNumber, incoming_reports.connected_duration as answeredDuration,incoming_reports.cr_file as callRecordFile,departments.id as deptId,departments.name as departmentName FROM incoming_reports LEFT JOIN departments ON incoming_reports.id_department = departments.id where incoming_reports.id_user = ${id_user} and user_id = '${agentId}' and call_start_time between '${Start}' and '${End}' and user_status != 'ANSWERED'`;
    if (didNumber != undefined) {
      sqlCount += `and destination like $${i} `;
      sql += `and destination like $${i} `;
      search.push("%" + didNumber + "%");
      i += 1;
    }
    if (sourceNumber != undefined) {
      sqlCount += `and incoming_reports.source like $${i} `;
      sql += `and incoming_reports.source like $${i} `;
      search.push("%" + sourceNumber + "%");
      i += 1;
    }
    if (status != undefined) {
      sqlCount += `and user_status like $${i} `;
      sql += `and user_status like $${i} `;
      search.push("%" + status + "%");
      i += 1;
    }
    sqlCount += `GROUP BY id `;
    sql += ` order by id desc limit ${skip},${limit} `;
    var [result] = await getConnection.query(sql, { bind: search });
    var [count] = await getConnection.query(sqlCount, { bind: search });
    var total = count.length;
    if (req.token.phn_number_mask == 1) {
      var map_result = Promise.all(
        result.map(async (value) => {
          var sNo = await string_encode(value.sourceNumber);
          if (sNo) {
            value.sourceNumber = sNo;
          }
          return value;
        })
      );
      var result = await map_result;
      res.locals.result = result;
    } else {
      res.locals.result = result;
    }
    res.locals.result = result;
    res.locals.count = total;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_incoming_missedcall_csv(req, res, next) {
  try {
    var i = 1;
    var id_user = req.token.id_user;
    var agentId = req.token.id;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var didNumber = req.query.didnumber;
    var sourceNumber = req.query.sourceNumber;
    var status = req.query.status;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }

    //limit start and end
    if (req.token.reporting_period) {
      const { startOfPeriod, endOfPeriod } =
        (await getDateRangeForReportingPeriode(agentId, Start, End)) || {};
      if (startOfPeriod) {
        Start = startOfPeriod;
      }
      if (endOfPeriod) {
        End = endOfPeriod;
      }
    }

    var search = [];
    var sqlCount = `SELECT count(id) as incomingalls FROM incoming_reports where id_user = ${id_user} and user_id = '${agentId}' and call_start_time between '${Start}' and '${End}' and user_status != 'ANSWERED'`;
    var sql = `SELECT incoming_reports.id,incoming_reports.call_start_time as callStartTime,incoming_reports.user_status as agentStatus, incoming_reports.call_status, incoming_reports.source  as sourceNumber, incoming_reports.destination as didNumber, incoming_reports.connected_duration as answeredDuration,incoming_reports.cr_file as callRecordFile,departments.id as deptId,departments.name as departmentName FROM incoming_reports LEFT JOIN departments ON incoming_reports.id_department = departments.id where incoming_reports.id_user = ${id_user} and user_id = '${agentId}' and call_start_time between '${Start}' and '${End}' and user_status != 'ANSWERED'`;
    if (didNumber != undefined) {
      sqlCount += `and destination like $${i} `;
      sql += `and destination like $${i} `;
      search.push("%" + didNumber + "%");
      i += 1;
    }
    if (sourceNumber != undefined) {
      sqlCount += `and incoming_reports.source like $${i} `;
      sql += `and incoming_reports.source like $${i} `;
      search.push("%" + sourceNumber + "%");
      i += 1;
    }
    if (status != undefined) {
      sqlCount += `and user_status like $${i} `;
      sql += `and user_status like $${i} `;
      search.push("%" + status + "%");
      i += 1;
    }
    sqlCount += `GROUP BY id `;
    sql += ` order by id desc `;
    var [result] = await getConnection.query(sql, { bind: search });
    var [count] = await getConnection.query(sqlCount, { bind: search });
    var total = count.length;
    if (req.token.phn_number_mask == 1) {
      var map_result = Promise.all(
        result.map(async (value) => {
          var sNo = await string_encode(value.sourceNumber);
          if (sNo) {
            value.sourceNumber = sNo;
          }
          return value;
        })
      );
      var result = await map_result;
      res.locals.result = result;
    } else {
      res.locals.result = result;
    }
    res.locals.result = result;
    res.locals.count = total;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_outgoingcall(req, res, next) {
  try {
    var i = 1;
    var id_user = req.token.id_user;
    var agentId = req.token.id;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var didNumber = req.query.didnumber;
    var destination = req.query.destination;
    var status = req.query.status;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }

    //limit start and end
    if (req.token.reporting_period) {
      const { startOfPeriod, endOfPeriod } =
        (await getDateRangeForReportingPeriode(agentId, Start, End)) || {};
      if (startOfPeriod) {
        Start = startOfPeriod;
      }
      if (endOfPeriod) {
        End = endOfPeriod;
      }
    }

    var search = [];
    var sqlCount = `SELECT count(id) as outgoingcall FROM cc_outgoing_reports where id_user = ${id_user} and user_id = '${agentId}'  and date between '${Start}' and '${End}'`;
    var sql = `SELECT cc_outgoing_reports.id, cc_outgoing_reports.uniqueid uniqueId,cc_outgoing_reports.app as application, DATE_FORMAT(cc_outgoing_reports.date, '%Y-%m-%d %H:%i:%s') AS date,cc_outgoing_reports.destination, cc_outgoing_reports.callerid, cc_outgoing_reports.duration, cc_outgoing_reports.cost, cc_outgoing_reports.status as callStatus,cc_outgoing_reports.cr_file as callRecord,departments.id as deptId,departments.name as departmentName FROM cc_outgoing_reports LEFT JOIN departments ON cc_outgoing_reports.id_department = departments.id where cc_outgoing_reports.id_user = ${id_user} and user_id = '${agentId}' and date between '${Start}' and '${End}' `;
    if (didNumber != undefined) {
      sqlCount += `and callerid in (${didNumber})`;
      sql += `and callerid  in (${didNumber}) `;
    }
    if (destination != undefined) {
      sqlCount += `and destination like '%${destination}%' `;
      sql += `and destination like '%${destination}%' `;
    }
    if (status !== undefined) {
      if (status == "NOT ANSWERED") {
        sqlCount += `AND (cc_outgoing_reports.status = '${status}' OR cc_outgoing_reports.status = 'NO ANSWER' OR cc_outgoing_reports.status = 'NOANSWER') `;
        sql += `AND (cc_outgoing_reports.status = '${status}' OR cc_outgoing_reports.status = 'NO ANSWER' OR cc_outgoing_reports.status = 'NOANSWER')`;
      } else if (status == "ANSWERED") {
        sqlCount += `AND (cc_outgoing_reports.status = '${status}%' OR cc_outgoing_reports.status = 'ANSWER') `;
        sql += `AND (cc_outgoing_reports.status = '${status}' OR cc_outgoing_reports.status = 'ANSWER')`;
      } else {
        sqlCount += `AND cc_outgoing_reports.status = '${status}' `;
        sql += `AND cc_outgoing_reports.status = '${status}' `;
      }
    }
    sqlCount += `GROUP BY id `;
    sql += ` order by id desc limit ${skip},${limit} `;
    var [result] = await rackServer.query(sql);
    var [count] = await rackServer.query(sqlCount);

    // if (req.token.phn_number_mask == 1) {
    //   var map_result = Promise.all(
    //     result.map(async (value) => {
    //       var dest = await string_encode(value.destination);
    //       if (dest) {
    //         value.destination = dest;
    //       }
    //       return value;
    //     })
    //   );
    //   var result = await map_result;
    // }

    const sourceNumbers = result.map((entry) => entry.destination);
    const contact_data = await contactsModel
      .find(
        { phone_number: { $in: sourceNumbers }, id_user: id_user },
        { name: 1, phone_number: 1, _id: 0 }
      )
      .lean();
    const updatedResult = result.map((item) => {
      const match = contact_data.find((entry) =>
        entry.phone_number.includes(item.destination)
      );
      if (match) {
        return { ...item, contact_name: match.name };
      }
      return item;
    });
    res.locals.result = updatedResult;
    res.locals.count = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_outgoingcall_csv(req, res, next) {
  try {
    var i = 1;
    var id_user = req.token.id_user;
    var agentId = req.token.id;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var didNumber = req.query.didnumber;
    var destination = req.query.destination;
    var status = req.query.status;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }

    if (req.token.reporting_period) {
      const { startOfPeriod, endOfPeriod } =
        (await getDateRangeForReportingPeriode(agentId, Start, End)) || {};
      if (startOfPeriod) {
        Start = startOfPeriod;
      }
      if (endOfPeriod) {
        End = endOfPeriod;
      }
    }

    var search = [];
    var sqlCount = `SELECT count(id) as outgoingcall FROM cc_outgoing_reports where id_user = ${id_user} and user_id = '${agentId}'  and date between '${Start}' and '${End}'`;
    var sql = `SELECT cc_outgoing_reports.id,cc_outgoing_reports.app as application,DATE_FORMAT(cc_outgoing_reports.date, '%Y-%m-%d %H:%i:%s') AS date,cc_outgoing_reports.destination,cc_outgoing_reports.call_end_time as call_endtime, cc_outgoing_reports.callerid, cc_outgoing_reports.duration, cc_outgoing_reports.cost, cc_outgoing_reports.status as callStatus,cc_outgoing_reports.cr_file as callRecord,departments.id as deptId,departments.name as departmentName FROM cc_outgoing_reports LEFT JOIN departments ON cc_outgoing_reports.id_department = departments.id where cc_outgoing_reports.id_user = ${id_user} and user_id = '${agentId}' and date between '${Start}' and '${End}' `;
    if (didNumber != undefined) {
      sqlCount += `and callerid in (${didNumber})`;
      sql += `and callerid  in (${didNumber}) `;
    }
    if (destination != undefined) {
      sqlCount += `and destination like '%${destination}%' `;
      sql += `and destination like '%${destination}%' `;
    }
    if (status !== undefined) {
      if (status == "NOT ANSWERED") {
        sqlCount += `AND (cc_outgoing_reports.status = '${status}' OR cc_outgoing_reports.status = 'NO ANSWER' OR cc_outgoing_reports.status = 'NOANSWER') `;
        sql += `AND (cc_outgoing_reports.status = '${status}' OR cc_outgoing_reports.status = 'NO ANSWER' OR cc_outgoing_reports.status = 'NOANSWER')`;
      } else if (status == "ANSWERED") {
        sqlCount += `AND (cc_outgoing_reports.status = '${status}%' OR cc_outgoing_reports.status = 'ANSWER') `;
        sql += `AND (cc_outgoing_reports.status = '${status}' OR cc_outgoing_reports.status = 'ANSWER')`;
      } else {
        sqlCount += `AND cc_outgoing_reports.status = '${status}' `;
        sql += `AND cc_outgoing_reports.status = '${status}' `;
      }
    }
    sqlCount += `GROUP BY id `;
    sql += ` order by id desc `;
    var [result] = await getConnection.query(sql);
    var [count] = await getConnection.query(sqlCount);
    if (result.length != 0) {
      var map_result = Promise.all(
        result.map(async (value) => {
          if (value.callStatus == "ANSWER") {
            var fromdateDateTime = new Date(value.date);
            var cntdate = fromdateDateTime
              .getDate()
              .toString()
              .padStart(2, "0");
            var currentMnth = (fromdateDateTime.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            var year = fromdateDateTime.getFullYear();
            var date = `${year}-${currentMnth}-${cntdate}`;
            value.callRecord =
              `${process.env.NODE_PATH}` +
              `callcenter/get_outgoing_callrecordings_without_token/` +
              `${value.callRecord}.wav/` +
              `${date}/` +
              `${id_user}`;
          } else {
            value.callRecord = "";
          }
          return value;
        })
      );
      result = await map_result;
    }
    if (req.token.phn_number_mask == 1) {
      var map_result = Promise.all(
        result.map(async (value) => {
          var dest = await string_encode(value.destination);
          if (dest) {
            value.destination = dest;
          }
          return value;
        })
      );
      var result = await map_result;
    }
    const sourceNumbers = result.map((entry) => entry.destination);
    const contact_data = await contactsModel
      .find(
        { phone_number: { $in: sourceNumbers }, id_user: id_user },
        { name: 1, phone_number: 1, _id: 0 }
      )
      .lean();
    const updatedResult = result.map((item) => {
      const match = contact_data.find((entry) =>
        entry.phone_number.includes(item.destination)
      );
      if (match) {
        return { ...item, contact_name: match.name };
      }
      return item;
    });
    res.locals.result = updatedResult;
    res.locals.count = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_misscall(req, res, next) {
  try {
    var i = 1;
    var id_user = req.token.id_user;
    var regNumber = req.token.regNumber;
    var user_id = req.token.id;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var sourceNumber = req.query.sourceNumber;
    var didNumber = req.query.didnumber;
    var status = req.query.missed_status;
    var todaydate = new Date();
    todaydate.setDate(todaydate.getDate() - 14);
    var DD = todaydate.getDate();
    var MM = todaydate.getMonth() + 1;
    var YYYY = todaydate.getFullYear();
    MM = MM < 10 ? `0${MM}` : MM;
    DD = DD < 10 ? `0${DD}` : DD;
    var Start = `${YYYY}-${MM}-${DD} 00:00:00`;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    mm = mm < 10 ? `0${mm}` : mm;
    dd = dd < 10 ? `0${dd}` : dd;
    var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${YYYY}-${MM}-${DD} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    let smartgroupMissedSettings = 0;
    //limit start and end
    if (req.token.reporting_period) {
      const { startOfPeriod, endOfPeriod } =
        (await getDateRangeForReportingPeriode(user_id, Start, End)) || {};
      if (startOfPeriod) {
        Start = startOfPeriod;
      }
      if (endOfPeriod) {
        End = endOfPeriod;
      }
    }

    let query = {
      id_user: id_user,
      id_department: req.token.id_department,
      latestCallStartTime: { $gte: Start, $lte: End },
    };
    if (status != undefined) {
      query.status = status;
    }
    var missedData = await uniqueMissedcallModel
      .find(query)
      .sort({ latestCallStartTime: -1 });
    var missedCount = await uniqueMissedcallModel.find(query);
    var missedId = [];
    if (missedData.length != 0) {
      missedData.map(async (value) => {
        missedId.push(value.unique_missedcall_id);
      });
      var search = [];
       
      if (req.token.show_misscall_to_all_agents == 0) {
        var showAllSmartgroupMissedCall = `SELECT smart_group.id FROM smart_group join smart_group_agents on smart_group_agents.smart_groupId = smart_group.id WHERE  show_missedcall_to = 3 and smart_group_agents.user_id = '${user_id}'`;
        var [smartgroupSettings] = await getConnection.query(
          showAllSmartgroupMissedCall
        );

        if (smartgroupSettings.length != 0) {
          const destinationIds = smartgroupSettings.map((row) => row.id);
          smartgroupMissedSettings = 1;
          const placeholders = destinationIds.join(", ");

          const callFlowIdsQuery = `
            SELECT DISTINCT cf.id AS call_flow_id
            FROM call_flow_call_group cfcg
            INNER JOIN call_flow_module cfm 
              ON cfm.id = cfcg.call_flow_module_id
            INNER JOIN call_flow cf 
              ON cf.id = cfm.call_flow_id
            WHERE cfcg.call_grp_id IN (${placeholders})
          `;

          const callFlowIdArray = await getConnection.query(callFlowIdsQuery, {
            type: getConnection.QueryTypes.SELECT
          });

          const callFlowIds = callFlowIdArray.map(item => item.call_flow_id);
          
          var sql = `
            (
              SELECT 
                umr.id,
                umr.latestCallStartTime AS firstCallStartTime,
                umr.latestCallStartTime AS date,
                umr.sourceNumber,
                umr.didNumber,
                umr.user_id AS lastAgent,
                umr.connectedDuration,
                umr.application,
                umr.callUniqueId,
                umr.dtmfSeq,
                umr.callback_count,
                umr.type,
                CONCAT(u.first_name, ' ', u.last_name) AS userName
              FROM unique_missed_reports umr
              LEFT JOIN user u ON u.id = umr.user_id
              WHERE umr.id_user = '${id_user}'
                AND umr.user_id = '${user_id}'
            `;

          if (sourceNumber !== undefined) {
            sql += ` AND umr.sourceNumber LIKE '%${sourceNumber}%'`;
          }
          if (didNumber !== undefined) {
            sql += ` AND umr.didNumber LIKE '%${didNumber}%'`;
          }
          if (missedId) {
            sql += ` AND umr.id IN (${missedId})`;
          }

          if (callFlowIds.length > 0) {
            const ids = callFlowIds.join(",");

            sql += `
              )
              UNION
              (
                SELECT 
                  umr.id,
                  umr.latestCallStartTime AS firstCallStartTime,
                  umr.latestCallStartTime AS date,
                  umr.sourceNumber,
                  umr.didNumber,
                  umr.user_id AS lastAgent,
                  umr.connectedDuration,
                  umr.application,
                  umr.callUniqueId,
                  umr.dtmfSeq,
                  umr.callback_count,
                  umr.type,
                  CONCAT(u.first_name, ' ', u.last_name) AS userName
                FROM unique_missed_reports umr
                LEFT JOIN user u ON u.id = umr.user_id
                WHERE umr.id_user = '${id_user}'
                  AND umr.destination_id IN (${ids}) 
                  AND umr.destination_app = "callflow"
            `;
          }

          sql += `
            )
            UNION
            (
              SELECT 
                umr.id,
                umr.latestCallStartTime AS firstCallStartTime,
                umr.latestCallStartTime AS date,
                umr.sourceNumber,
                umr.didNumber,
                umr.user_id AS lastAgent,
                umr.connectedDuration,
                umr.application,
                umr.callUniqueId,
                umr.dtmfSeq,
                umr.callback_count,
                umr.type,
                CONCAT(u.first_name, ' ', u.last_name) AS userName
              FROM unique_missed_reports umr
              LEFT JOIN user u ON u.id = umr.user_id
              WHERE umr.id_user = '${id_user}'
                AND umr.destination_id IN (${placeholders})
            `;

          if (sourceNumber !== undefined) {
            sql += ` AND umr.sourceNumber LIKE '%${sourceNumber}%'`;
          }
          if (didNumber !== undefined) {
            sql += ` AND umr.didNumber LIKE '%${didNumber}%'`;
          }
          if (missedId) {
            sql += ` AND umr.id IN (${missedId})`;
          }

          sql += `) ORDER BY firstCallStartTime DESC`;
        } else {
          var sql = `SELECT unique_missed_reports.id,unique_missed_reports.latestCallStartTime as firstCallStartTime, unique_missed_reports.latestCallStartTime as date, unique_missed_reports.sourceNumber, unique_missed_reports.didNumber,user_id as lastAgent, unique_missed_reports.connectedDuration,  unique_missed_reports.application, unique_missed_reports.callUniqueId, unique_missed_reports.dtmfSeq as dtmfSeq, unique_missed_reports.callback_count, unique_missed_reports.type,CONCAT(user.first_name, ' ', user.last_name) AS userName FROM unique_missed_reports LEFT JOIN user ON user.id = unique_missed_reports.user_id WHERE unique_missed_reports.id_user = '${id_user}' AND user_id = '${user_id}'  `;
        }
      } else {
        var sql = `SELECT unique_missed_reports.id,unique_missed_reports.latestCallStartTime as firstCallStartTime, unique_missed_reports.latestCallStartTime as date, unique_missed_reports.sourceNumber, unique_missed_reports.didNumber,user_id as lastAgent, unique_missed_reports.connectedDuration,  unique_missed_reports.application, unique_missed_reports.callUniqueId, unique_missed_reports.dtmfSeq as dtmfSeq, unique_missed_reports.callback_count, unique_missed_reports.type,CONCAT(user.first_name, ' ', user.last_name) AS userName FROM unique_missed_reports LEFT JOIN user ON user.id = unique_missed_reports.user_id WHERE unique_missed_reports.id_user = '${id_user}' AND unique_missed_reports.id_department = '${req.token.id_department}'  `;
      }
      if(smartgroupMissedSettings == 0){
      if (sourceNumber != undefined) {
        sql += `and sourceNumber like '%${sourceNumber}%' `;
      }
      if (didNumber != undefined) {
        sql += `and didNumber like '%${didNumber}%' `;
      }
      sql += `AND unique_missed_reports.id in(${missedId})`;
    }
      var [result] = await getConnection.query(sql, { bind: search });
      if (missedData.length != 0) {
        var map_result = Promise.all(
          result.map(async (value) => {
            missedData.map(async (data) => {
              if (value.id == data.unique_missedcall_id) {
                value.missed_status = data.status;
                value.missed_count = data.missedcall_count;
                value.firstCallStartTime = data.latestCallStartTime;
                value.callUniqueId = data.callUniqueId;
              }
            });
            return value;
          })
        );
        result = await map_result;
      }
      if (status != undefined) {
        result = result.filter((obj) => obj.missed_status !== undefined);
      }
      var count = result.length;
      if (result.length != 0) {
        result.sort(
          (a, b) =>
            new Date(b.firstCallStartTime) - new Date(a.firstCallStartTime)
        );
        result = result.slice(skip, skip + limit);
      }
      const sourceNumbers = result.map((entry) => entry.sourceNumber);
      const contact_data = await contactsModel
        .find(
          { phone_number: { $in: sourceNumbers }, id_user: id_user },
          { name: 1, phone_number: 1, _id: 0 }
        )
        .lean();
      const updatedResult = result.map((item) => {
        const match = contact_data.find((entry) =>
          entry.phone_number.includes(item.sourceNumber)
        );
        if (match) {
          return { ...item, contact_name: match.name };
        }
        return item;
      });
      res.locals.result = updatedResult;
      if (sourceNumber != undefined || didNumber != undefined) {
        res.locals.count = result.length;
      } else {
        res.locals.count = count;
      }
    } else {
      res.locals.result = [];
      res.locals.count = 0;
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_misscall_csv(req, res, next) {
  try {
    var i = 1;
    var id_user = req.token.id_user;
    var regNumber = req.token.regNumber;
    var user_id = req.token.id;
    // var limit = Number(req.query.count);
    // var skip = req.query.page;
    // skip = (skip - 1) * limit;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var sourceNumber = req.query.sourceNumber;
    var didNumber = req.query.didnumber;
    var status = req.query.missed_status;
    var todaydate = new Date();
    todaydate.setDate(todaydate.getDate() - 14);
    var DD = todaydate.getDate();
    var MM = todaydate.getMonth() + 1;
    var YYYY = todaydate.getFullYear();
    MM = MM < 10 ? `0${MM}` : MM;
    DD = DD < 10 ? `0${DD}` : DD;
    var Start = `${YYYY}-${MM}-${DD} 00:00:00`;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    mm = mm < 10 ? `0${mm}` : mm;
    dd = dd < 10 ? `0${dd}` : dd;
    var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${YYYY}-${MM}-${DD} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }

    //limit start and end
    if (req.token.reporting_period) {
      const { startOfPeriod, endOfPeriod } =
        (await getDateRangeForReportingPeriode(user_id, Start, End)) || {};
      if (startOfPeriod) {
        Start = startOfPeriod;
      }
      if (endOfPeriod) {
        End = endOfPeriod;
      }
    }

    let query = {
      id_user: id_user,
      id_department: req.token.id_department,
      latestCallStartTime: { $gte: Start, $lte: End },
    };
    if (status != undefined) {
      query.status = status;
    }
    var missedData = await uniqueMissedcallModel
      .find(query)
      .sort({ latestCallStartTime: -1 });
    var missedCount = await uniqueMissedcallModel.find(query);
    var missedId = [];
    if (missedData.length != 0) {
      missedData.map(async (value) => {
        missedId.push(value.unique_missedcall_id);
      });
      var search = [];
      if (req.token.show_misscall_to_all_agents == 0) {
        var sql = `SELECT unique_missed_reports.id,unique_missed_reports.latestCallStartTime as firstCallStartTime, unique_missed_reports.latestCallStartTime as date, unique_missed_reports.sourceNumber, unique_missed_reports.didNumber,user_id as lastAgent, unique_missed_reports.connectedDuration,  unique_missed_reports.application, unique_missed_reports.callUniqueId, unique_missed_reports.dtmfSeq as dtmfSeq, unique_missed_reports.callback_count, unique_missed_reports.type FROM unique_missed_reports WHERE unique_missed_reports.id_user = '${id_user}' AND user_id = '${user_id}'  `;
      } else {
        var sql = `SELECT unique_missed_reports.id,unique_missed_reports.latestCallStartTime as firstCallStartTime, unique_missed_reports.latestCallStartTime as date, unique_missed_reports.sourceNumber, unique_missed_reports.didNumber,user_id as lastAgent, unique_missed_reports.connectedDuration,  unique_missed_reports.application, unique_missed_reports.callUniqueId, unique_missed_reports.dtmfSeq as dtmfSeq, unique_missed_reports.callback_count, unique_missed_reports.type FROM unique_missed_reports WHERE unique_missed_reports.id_user = '${id_user}' AND id_department = '${req.token.id_department}'  `;
      }
      if (sourceNumber != undefined) {
        sql += `and sourceNumber like '%${sourceNumber}%' `;
      }
      if (didNumber != undefined) {
        sql += `and didNumber like '%${didNumber}%' `;
      }
      sql += `AND unique_missed_reports.id in(${missedId})`;
      var [result] = await getConnection.query(sql, { bind: search });
      if (missedData.length != 0) {
        var map_result = Promise.all(
          result.map(async (value) => {
            missedData.map(async (data) => {
              if (value.id == data.unique_missedcall_id) {
                value.missed_status = data.status;
                value.missed_count = data.missedcall_count;
                value.firstCallStartTime = data.latestCallStartTime;
                value.callUniqueId = data.callUniqueId;
              }
            });
            return value;
          })
        );
        result = await map_result;
      }
      if (status != undefined) {
        result = result.filter((obj) => obj.missed_status !== undefined);
      }
      var count = result.length;
      if (result.length != 0) {
        result.sort(
          (a, b) =>
            new Date(b.firstCallStartTime) - new Date(a.firstCallStartTime)
        );
        // result = result.slice(skip, skip + limit);
      }
      res.locals.result = result;
      if (sourceNumber != undefined || didNumber != undefined) {
        res.locals.count = result.length;
      } else {
        res.locals.count = count;
      }
    } else {
      res.locals.result = [];
      res.locals.count = 0;
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_templates_by_id(req, res, next) {
  try {
    var id_user = Number(req.token.id_user);
    var id_module = req.query.type;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isAgent = req.token.isAgent;
    var isDept = req.token.isDept;
    var departement_id = req.query.id_department;
    let defaultData;
    if (process.env.PROJECT_NAME == "innovation") {
      var sql = `SELECT templates.id,templates.name FROM templates WHERE id_module = ${id_module} `;
      if (type == 1 || type == undefined) {
        sql += `and id_user = ${id_user} `;
      } else if (type == 2) {
        var subadmin_dept = `SELECT id_dept FROM subadmin_departments WHERE id_subadmin = '${id_user}'`;
        var [subadmin_deptRes] = await getConnection.query(subadmin_dept);
        if (subadmin_deptRes.length != 0) {
          var subadmin = [];
          subadmin_deptRes.map(async (data) => {
            subadmin.push(data.id_dept);
          });
          sql += `and id_department in(${subadmin}) `;
        }
      } else {
        sql += `and id_department = ${id_user} `;
      }
      var [result] = await getConnection.query(sql);
      res.locals.result = result;
    } else {
      if (isAdmin == 1) {
        // var id_department = Number(req.token.id_department);
        var result = await templateModel.find(
          { $and: [{ id_user: id_user }, { save_data_to: id_module }] },
          { name: 1, _id: 1 }
        );
        defaultData = await defaultDatafromModel
          .findOne({ id_user: req.token.id_user, save_data_to: 3, id_department: 0 })
          .lean();
      } else if (departement_id != undefined) {
        var id_department = Number(departement_id);
        var result = await templateModel.find(
          {
            $and: [
              { id_department: { $in: id_department } },
              { id_user: id_user },
              { save_data_to: id_module },
            ],
          },
          { name: 1, _id: 1 }
        );
        defaultData = await defaultDatafromModel
          .findOne({
            id_user: req.token.id_user,
            id_department: id_department,
            save_data_to: 3,
          })
          .lean();
      } else if (isSubAdmin == 1) {
        var id_department = req.token.id_department.split(",").map(Number);
        var result = await templateModel.find(
          {
            $and: [
              { id_department: { $in: id_department } },
              { id_user: id_user },
              { save_data_to: id_module },
            ],
          },
          { name: 1, _id: 1 }
        );
        defaultData = await defaultDatafromModel
          .findOne({
            id_user: req.token.id_user,
            id_department: { $in: id_department },
            save_data_to: 3,
          })
          .lean();
      } else if (isDept == 1) {
        var id_department = Number(req.token.id);
        var result = await templateModel.find(
          {
            $and: [
              { id_department: Number(id_department) },
              { id_user: id_user },
              { save_data_to: id_module },
            ],
          },
          { name: 1, _id: 1 }
        );
        defaultData = await defaultDatafromModel
          .findOne({
            id_user: req.token.id_user,
            id_department: Number(id_department),
            save_data_to: 3,
          })
          .lean();
      } else if (isAgent == 1) {
        var result = await templateModel.find(
          {
            $and: [
              { id_department: Number(req.token.id_department) },
              { id_user: id_user },
              { save_data_to: id_module },
            ],
          },
          { name: 1, _id: 1 }
        );
        defaultData = await defaultDatafromModel
          .findOne({
            id_user: req.token.id_user,
            id_department: Number(req.token.id_department),
            save_data_to: 3,
          })
          .lean();
      }

      res.locals.result = result;
      res.locals.default_dataform_id = defaultData?.dataform_id;
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_templates(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var deptId = req.token.id_department;
    if (process.env.PROJECT_NAME == "innovation") {
      var sql = `SELECT id,name,id_module FROM templates WHERE `;
      if (deptId != undefined) {
        sql += `id_department = ${deptId} `;
      } else {
        sql += `id_user = ${id_user} `;
      }
      var [result] = await getConnection.query(sql);
      res.locals.result = result;
    } else {
      var filter = [{ id_user: id_user }];
      if (deptId != undefined) {
        filter.push({ id_department: deptId });
      }
      console.log(filter);
      var result = await templateModel.find({ $and: filter });
      res.locals.result = result;
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_template_fields(req, res, next) {
  try {
    var id_template = req.query.id;
    const smsStatus = {};
    const smsHandover = {};
    if (id_template != undefined && id_template != "0") {
      if (process.env.PROJECT_NAME == "innovation") {
        var sql = `SELECT * FROM template_fields WHERE id_template = ${id_template}`;
        var [result] = await getConnection.query(sql);
        res.locals.result = result;
      } else {
        var result = await templatefieldModel.find({
          template_id: new ObjectId(id_template),
        });
        var [resultSms] = await templateSms.find({
          templateId: id_template,
          isHandover: false,
        });
        if (resultSms == undefined) {
          var resultSms = [];
        }

        var [resultWhatsapp] = await templateWhatsapp.find({
          templateId: id_template,
          isHandover: false,
        });
        if (resultWhatsapp == undefined) {
          var resultWhatsapp = [];
        }
        var [resultApi] = await templateApi.find({ templateId: id_template });
        if (resultApi == undefined) {
          var resultApi = [];
        }
        var integration = {
          sms: resultSms,
          whatsapp: resultWhatsapp,
          api: resultApi,
        };

          defaultData = await DefaultCalltaskModel
          .findOne({
            dataform_id:id_template
          })
          .lean();

           var callTaskRequired = await DefaultCalltaskModel.find({
                dataform_id: id_template,
              }).lean()
          
              if(callTaskRequired.length != 0){
                callTaskRequired = [{status : 1}]
              }else{
                callTaskRequired = [{status : 0}]
              } 
      
        res.locals.result = result;
        res.locals.integration = integration;
        res.locals.default_dataform_id = defaultData?.callTask_id;
        res.locals.isCallTaskRequired = callTaskRequired[0].status
      }
    } else {
      res.locals.result = [];
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function piegraph_count(req, res, next) {
  try {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
    var Todate = `${yyyy}-${mm}-${dd} 23:59:59`;
    var regNumber = req.token.regNumber;
    var id_user = req.token.id_user;

    var MisscallCount = `SELECT count(id) as misscall FROM incoming_reports WHERE id_user='${id_user}' AND user_id = '${regNumber}' AND user_status != 'ANSWERED' AND call_start_time BETWEEN '${fromDate}' AND '${Todate}' GROUP by id `;
    var [missCount] = await getConnection.query(MisscallCount);
    var answeredCallCount = `SELECT count(id) as answeredCall FROM incoming_reports WHERE duration != 0 and user_status = 'ANSWERED' and call_start_time BETWEEN '${fromDate}' and '${Todate}' and connected_user = '${regNumber}' GROUP by id`;
    var [answered] = await getConnection.query(answeredCallCount);
    var notconnectCount = `SELECT count(id) as notconnected FROM incoming_reports WHERE duration = 0 and user_status = 'ANSWERED' and call_start_time BETWEEN '${fromDate}' and '${Todate}'  and connected_user = '${regNumber}' GROUP by id `;
    var [notconnect] = await getConnection.query(notconnectCount);
    var busyCount = `SELECT count(id) as busy FROM incoming_reports WHERE user_status = 'busy' and call_start_time BETWEEN '${fromDate}' and '${Todate}' and connected_user = '${regNumber}' GROUP by id`;
    var [busy] = await getConnection.query(busyCount);
    var data = [
      { name: "Missed", value: missCount.length },
      { name: "Answered", value: answered.length },
      { name: "NotConnected", value: notconnect.length },
      { name: "Busy", value: busy.length },
    ];
    res.locals.result = data;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_lead_status(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    var isSubAdmin = req.token.isSubAdmin;
    var isAgent = req.token.isAgent;
    var isDept = req.token.isDept;
    var department_id = req.query.deptId;
    var sql = `SELECT id,name,id_department as Department_id FROM lead_status where id_user = ${id_user} `;
    if (department_id != undefined) {
      var sql = `SELECT id,name,id_department as Department_id FROM lead_status where id_user = ${id_user} and id_department in(${department_id})  `;
    } else if (isSubAdmin == 1) {
      sql += `and id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `and id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql += `and id_department = ${id_department} `;
    }
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_ticket_status(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var department_id = req.query.deptId;
    var sql = `SELECT id,name,id_department as Department_id FROM ticket_status where id_user = ${id_user} `;
    if (department_id != undefined) {
      var sql = `SELECT id,name,id_department as Department_id FROM ticket_status where id_user = ${id_user} and id_department in(${department_id})  `;
    } else if (isSubAdmin == 1) {
      sql += `and id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `and id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql += `and id_department = ${id_department} `;
    }
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_customer_status(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var department_id = req.query.deptId;
    var sql = `SELECT id,name,id_department as Department_id FROM customer_status where id_user = ${id_user} `;
    if (department_id != undefined) {
      var sql = `SELECT id,name,id_department as Department_id FROM customer_status where id_user = ${id_user} and id_department in(${department_id})  `;
    }
    if (isSubAdmin == 1) {
      sql += `and id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `and id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql += `and id_department = ${id_department} `;
    }
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_status(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var deptId = req.query.deptId;
    var customersSql = `SELECT id,name FROM customer_status where id_user = ${id_user} `;
    var leadSql = `SELECT id,name FROM lead_status where id_user = ${id_user} `;
    var ticketSql = `SELECT id,name FROM ticket_status where id_user = ${id_user} `;
    if (isSubAdmin == 1) {
      customersSql += `and id_department in(${id_department}) `;
      leadSql += `and id_department in(${id_department}) `;
      ticketSql += `and id_department in(${id_department}) `;
    } else if (isDept == 1) {
      customersSql += `and id_department = ${req.token.id}  `;
      leadSql += `and id_department = ${req.token.id} `;
      ticketSql += `and id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      customersSql += `and id_department = ${id_department} `;
      leadSql += `and id_department = ${id_department} `;
      ticketSql += `and id_department = ${id_department} `;
    }
    var [customersRes] = await getConnection.query(customersSql);
    var [leadRes] = await getConnection.query(leadSql);
    var [ticketRes] = await getConnection.query(ticketSql);
    var data = { leads: leadRes, customers: customersRes, tickets: ticketRes };
    res.locals.result = data;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_duration_by_agentId(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var id_agent = req.token.id;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
    var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    var startDate = `SELECT startDate FROM user_activities WHERE startDate BETWEEN '${Start}' AND '${End}' and user_id = '${id_agent}' ORDER BY id DESC LIMIT 1`;
    var [startDateRes] = await getConnection.query(startDate);
    var sql = `SELECT duration FROM user_sessions WHERE startDate BETWEEN '${Start}' AND '${End}' and user_id = '${id_agent}' and id_user = '${id_user}' `;
    var [result] = await getConnection.query(sql);
    var breakSql = `SELECT user_id,currentBreakId,currentBreakName FROM user_live_data WHERE user_id = '${id_agent}'`;
    var [breakRes] = await getConnection.query(breakSql);
    console.log("user activity data length", startDateRes.length);
    console.log("user session data length", result.length);
    console.log("breakRes data length", breakRes.length);
    if (result.length != 0) {
      var timeDataSeconds = result.map((obj) => {
        var hours = parseInt(obj.duration.split(":")[0]);
        var minutes = parseInt(obj.duration.split(":")[1]);
        var seconds = parseInt(obj.duration.split(":")[2]);
        return hours * 3600 + minutes * 60 + seconds;
      });
      var calculatedSeconds = timeDataSeconds.reduce(
        (acc, val) => acc + val,
        0
      );
      console.log("calculatedSeconds : ", calculatedSeconds);
      if (startDateRes.length != 0) {
        var date1 = new Date(startDateRes[0].startDate);
        var date2 = new Date();
        date2.setMinutes(date2.getMinutes() + 1);
        date2.setSeconds(date2.getSeconds() + 12);
        console.log("login time : ", date1);
        console.log("current time : ", date2);
        // if (date2 < date1) {
        //     date2.setDate(date2.getDate() + 1);
        // }
        if (date2 < date1) {
          date2 = date1;
        }
        var diff = date2 - date1;
        console.log("diff : ", diff);
        var lastLoginseconds = diff / 1000;
        console.log("lastLoginseconds : ", lastLoginseconds);
        var totalSeconds = calculatedSeconds + lastLoginseconds;
        console.log("totalSeconds : ", totalSeconds);
        totalSeconds = totalSeconds.toFixed(0);
        lastLoginseconds = lastLoginseconds.toFixed(0);
        console.log("totalSeconds : ", totalSeconds);
        console.log("lastLoginseconds : ", lastLoginseconds);
        // const epochTimeMs = (totalSeconds + Math.floor(Date.now() / 1000)) * 1000;
        res.locals.result = {
          breakId: breakRes[0].currentBreakId,
          breakName: breakRes[0].currentBreakName,
          totalAvailableDuration: totalSeconds,
          breakDuration: lastLoginseconds,
        };
      } else {
        res.locals.result = {
          breakId: breakRes[0].currentBreakId,
          breakName: breakRes[0].currentBreakName,
          totalAvailableDuration: 0,
          breakDuration: 0,
        };
      }
    } else {
      if (startDateRes.length != 0) {
        console.log(startDateRes[0].startDate);
        var date1 = new Date(startDateRes[0].startDate);
        var date2 = new Date();
        date2.setMinutes(date2.getMinutes() + 1);
        date2.setSeconds(date2.getSeconds() + 12);
        console.log("login time : ", date1);
        console.log("current time : ", date2);
        // if (date2 < date1) {
        //     console.log("inside date checking if condition : ",date2)
        //     date2.setDate(date2.getDate() + 1);
        // }
        if (date2 < date1) {
          date2 = date1;
          console.log("current time1 : ", date2);
        }
        var diff = date2 - date1;
        console.log("diff : ", diff);
        var seconds = diff / 1000;
        console.log("seconds : ", seconds);
        var sec = seconds.toFixed(0);
        console.log("sec : ", sec);
        // var firstlogin = Math.floor(date1.getTime()/1000.0)
        // var miliseconds = firstlogin * 1000;
        res.locals.result = {
          breakId: breakRes[0].currentBreakId,
          breakName: breakRes[0].currentBreakName,
          totalAvailableDuration: sec,
          breakDuration: sec,
        };
      } else {
        res.locals.result = {
          breakId: breakRes[0].currentBreakId,
          breakName: breakRes[0].currentBreakName,
          totalAvailableDuration: 0,
          breakDuration: 0,
        };
      }
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_break_status(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    var sql = `SELECT name,id,break_type,allow_outgoing as outgoing,allow_incoming as incoming FROM breaks where id_department = ${id_department} and id_user = ${id_user} order by id `;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_break_status_for_admin(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var sql = `SELECT name,id,break_type FROM breaks where id_user = ${id_user} `;
    if (isSubAdmin == 1) {
      sql += `and id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `and id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql += `and id_department = ${id_department} `;
    }
    sql += `order by id `;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function get_break_time_duration(req, res, next) {
  try {
    var DateTime = new Date();
    var dd = DateTime.getDate();
    var mm = DateTime.getMonth() + 1;
    var yyyy = DateTime.getFullYear();
    var currentDate = `${yyyy}-${mm}-${dd}`;
    var id_agent = req.token.id;
    var sessionId = req.token.sessionId;
    var id_user = req.token.id_user;
    var sql = `SELECT TIMEDIFF(startDate, NOW()) AS DateDiff from user_sessions WHERE user_id = '${id_agent}' AND startDate BETWEEN '${currentDate} 00:00:00' AND '${currentDate} 23:59:59' AND id_break != '1' AND  session_id = '${sessionId}' AND id_user = '${id_user}'`;
    var [result] = await getConnection.query(sql);
    res.locals.result = result[0];
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_did(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var sql = `SELECT id,did FROM did where id_user = ${id_user} `;
    if (isDept == 1) {
      sql += `and id_department = ${req.token.id}`;
    }
    if (isSubAdmin == 1) {
      sql += `and id_department in (${req.token.id_department})`;
    }
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_all_did(req, res, next) {
  try {
    var type = req.token.type;
    var id_user = req.token.id_user;
    var passwordCheck = "SELECT secret FROM did_numbers ";
    var [passwordExist] = await getConnection.query(passwordCheck);

    var sql = `SELECT id,did FROM did where `;
    if (type == 3) {
      sql += `id_department = ${id_user} `;
    } else if (type == 2) {
      var subadmin_dept = `SELECT id_dept FROM subadmin_departments WHERE id_subadmin = '${id_user}'`;
      var [subadmin_deptRes] = await getConnection.query(subadmin_dept);
      if (subadmin_deptRes.length != 0) {
        var subadmin = [];
        subadmin_deptRes.map(async (data) => {
          subadmin.push(data.id_dept);
        });
        sql += `id_department in(${subadmin}) `;
      }
    } else {
      sql += `id_user = ${id_user} `;
    }

    if (passwordExist.length > 0) {
      sql += `AND secret IS NOT NULL`; // Add condition when password is 1
    } else {
      sql += `AND secret IS NULL`; // Add condition when password is 0
    }

    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_password_did(req, res, next) {
  var id = req.body.id;
  var password = req.body.password;
  var sql = `update did_numbers set secret='${password}' where id=${id}`;
  var [result] = await sequelize.query(sql);
  res.locals.result = result;
  next();
}

async function get_agent_login_report(req, res, next) {
  try {
    var i = 1;
    var search = [];
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var agent = req.query.agentId;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var id_user = req.token.id_user;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var sql = `select name as agent,id from user where id_user = ${id_user} `;
    var sqlCount = `select count(id) from user where id_user = ${id_user}  `;
    if (isSubAdmin == 1) {
      sql += `and id_department in(${id_department}) `;
      sqlCount += `and id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `and id_department = ${req.token.id} `;
      sqlCount += `and id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql += `and id_department = ${id_department} `;
      sqlCount += `and id_department = ${id_department} `;
    }
    if (agent != undefined) {
      sql += `and id = $${i} `;
      sqlCount += `and id = $${i} `;
      search.push(agent);
      i += 1;
    }
    sqlCount += `GROUP by id `;
    sql += `GROUP BY id limit ${skip},${limit} `;
    var [agentData] = await getConnection.query(sql, { bind: search });
    var [count] = await getConnection.query(sqlCount, { bind: search });
    var agentId = [];
    if (agentData.length != 0) {
      agentData.map(async (data) => {
        agentId.push(data.id);
      });
      var lastRow = `select MAX(startDate) as lastInsertDate,MAX(date(startDate)) as date,user.id as agentId,CONCAT(user.first_name, ' ', user.last_name) as name from user_activities JOIN user ON user.id = user_activities.user_id where user_activities.user_id in(${agentId}) and break_name = 'Logout' and startDate BETWEEN '${Start}' AND '${End}' GROUP by user_activities.user_id,DATE(startDate)`;
      var [lastInsert] = await getConnection.query(lastRow, { bind: search });
      var fristRow = `select MIN(startDate) as fristInsertDate,MIN(date(startDate)) as date,user.id as agentId,CONCAT(user.first_name, ' ', user.last_name) as name from user_activities JOIN user ON user.id = user_activities.user_id where user_activities.user_id in(${agentId}) and break_name = 'Available' and startDate BETWEEN '${Start}' AND '${End}' GROUP by user_activities.user_id,DATE(startDate)`;
      var [fristInsert] = await getConnection.query(fristRow, { bind: search });
      var array = [];
      if (fristInsert.length != 0) {
        fristInsert.map(async (data) => {
          if (lastInsert.length != 0) {
            lastInsert.map(async (data1) => {
              if (data.agentId == data1.agentId && data.date == data1.date) {
                data.agent = data.name;
                data.logoutTime = data1.lastInsertDate;
              }
            });
          } else {
            data.agent = data.name;
            data.logoutTime = undefined;
          }
        });
      }
      agentData.map(async (data) => {
        var init = "init";
        data.loginReport = [];
        if (fristInsert.length != 0) {
          fristInsert.map(async (value, ind) => {
            if (data.id == value.agentId) {
              data.loginReport.push({
                loginTime: value.fristInsertDate,
                logoutTime: value.logoutTime,
              });
              init = ind;
            }
          });
        }
      });
      res.locals.result = agentData;
    } else {
      res.locals.result = [];
    }
    res.locals.count = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_agent_login_csv_report(req, res, next) {
  try {
    var i = 1;
    var search = [];
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var agent = req.query.agentId;
    var department_id = req.query.department_id;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var id_user = req.token.id_user;
    var type = req.token.type;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var sql = `select CONCAT(user.first_name, ' ', user.last_name) AS  user,id_department,user.id,loginStartTime from user join user_live_data ON user_live_data.user_id = user.id JOIN user_settings ON user.id = user_settings.user_id where is_agent = 1 and user.id_user = ${id_user} `;
    var sqlCount = `select count(user.id) from user join user_settings ON user_settings.user_id = user.id where is_agent = 1 and user.id_user = ${id_user} `;
    if (isSubAdmin == 1) {
      sql += `and id_department in(${id_department}) `;
      sqlCount += `and id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `and id_department = ${req.token.id} `;
      sqlCount += `and id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql += `and id_department = ${id_department} `;
      sqlCount += `and id_department = ${id_department} `;
    }
    if (agent != undefined) {
      sql += `and user.id = ${agent} `;
      sqlCount += `and user.id = ${agent} `;
    }
    if (department_id != undefined) {
      sql += `and id_department = ${department_id} `;
      sqlCount += `and id_department = ${department_id} `;
    }
    sqlCount += `GROUP by user.id`;
    sql += `GROUP BY user.id`;
    var [agentData] = await getConnection.query(sql);
    var [count] = await getConnection.query(sqlCount);
    if (agentData.length != 0) {
      const uniqueDepartments = [
        ...new Set(agentData.map((agent) => agent.id_department)),
      ];
      const formattedDepartments = `(${uniqueDepartments.join(", ")})`;
      if (formattedDepartments.length != 0) {
        departmentName = `select id,name from departments where id in ${formattedDepartments}`;
        var [departmentNameResult] = await getConnection.query(departmentName);

        agentData = agentData.map((agent) => {
          let departmentName;

          if (agent.id_department === 0) {
            departmentName = "Admin"; // Set departmentName as "Admin" if id_department is 0
          } else {
            const department = departmentNameResult.find(
              (dept) => dept.id == agent.id_department
            );
            departmentName = department ? department.name : null;
          }

          return {
            ...agent,
            departmentName: departmentName, // Add departmentName
          };
        });
      }
    }
    var agentId = [];
    if (agentData.length != 0) {
      agentData.map(async (data) => {
        agentId.push(data.id);
      });
      var lastRow = `select MAX(startDate) as lastInsertDate,MAX(date(startDate)) as date,user.id as agentId,CONCAT(user.first_name, ' ', user.last_name) as name from user_activities JOIN user ON user.id = user_activities.user_id where user_activities.user_id in(${agentId}) and break_name = 'Logout' and startDate BETWEEN '${Start}' AND '${End}' GROUP by user_activities.user_id,DATE(startDate)`;
      var [lastInsert] = await getConnection.query(lastRow, { bind: search });
      var fristRow = `select MIN(startDate) as fristInsertDate,MIN(date(startDate)) as date,user.id as agentId,CONCAT(user.first_name, ' ', user.last_name) as name from user_activities JOIN user ON user.id = user_activities.user_id where user_activities.user_id in(${agentId}) and break_name = 'Available' and startDate BETWEEN '${Start}' AND '${End}' GROUP by user_activities.user_id,DATE(startDate)`;
      var [fristInsert] = await getConnection.query(fristRow, { bind: search });
      var array = [];
      if (fristInsert.length != 0) {
        fristInsert.map(async (data) => {
          if (lastInsert.length != 0) {
            lastInsert.map(async (data1) => {
              if (data.agentId == data1.agentId && data.date == data1.date) {
                data.agent = data.name;
                data.logoutTime = data1.lastInsertDate;
              }
            });
          } else {
            data.agent = data.name;
            data.logoutTime = undefined;
          }
        });
      }
      agentData.map(async (data) => {
        var init = "init";
        data.loginReport = [];
        if (fristInsert.length != 0) {
          fristInsert.map(async (value, ind) => {
            if (data.id == value.agentId) {
              data.loginReport.push({
                loginTime: value.fristInsertDate,
                logoutTime: value.logoutTime,
              });
              init = ind;
            }
          });
        }
      });
      res.locals.result = agentData;
    } else {
      res.locals.result = [];
    }
    res.locals.count = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_agent_percentage_call_report(req, res, next) {
  try {
    var i = 1;
    var search = [];
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var agent = req.query.agentId;
    var id_user = req.token.id_user;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var sql5 = `select name as agent,id from user where id_user = ${id_user} `;
    var sqlCount = `select count(id) from user where id_user = ${id_user} `;
    if (isSubAdmin == 1) {
      sql5 += `and id_department in(${id_department}) `;
      sqlCount += `and id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql5 += `and id_department = ${req.token.id} `;
      sqlCount += `and id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql5 += `and id_department = ${id_department} `;
      sqlCount += `and id_department = ${id_department} `;
    }
    if (agent != undefined) {
      sql5 += `and id = $${i} `;
      sqlCount += `and id = $${i} `;
      search.push(agent);
      i += 1;
    }
    sqlCount += `GROUP by id `;
    sql5 += `limit ${skip},${limit}`;
    var [agentData] = await getConnection.query(sql5, { bind: search });
    var [count] = await getConnection.query(sqlCount, { bind: search });
    if (agentData.length != 0) {
      var sql = `select COUNT(incoming_reports.id) AS totalCalls,user.id as agentId,CONCAT(user.first_name, ' ', user.last_name) as name from incoming_reports  join user on incoming_reports.user_id = user.id where call_start_time  BETWEEN '${Start}' AND '${End}' and incoming_reports.id_user = ${id_user} `;
      if (isSubAdmin == 1) {
        sql += `and incoming_reports.id_department in(${id_department})`;
      } else if (isDept == 1) {
        sql += `and incoming_reports.id_department = ${req.token.id}`;
      } else if (isAgent == 1) {
        sql += `and incoming_reports.id_department = ${id_department}`;
      }
      sql += ` group by user_id `;
      var [total] = await getConnection.query(sql);
      var sql1 = `select COUNT(incoming_reports.id) AS answered,user.id as agentId from incoming_reports join user on incoming_reports.user_id = user.id where user_status = 'ANSWERED' and call_start_time  BETWEEN '${Start}' AND '${End}' and incoming_reports.id_user = ${id_user} `;
      if (isSubAdmin == 1) {
        sql1 += `and incoming_reports.id_department in(${id_department}) `;
      } else if (isDept == 1) {
        sql1 += `and incoming_reports.id_department = ${req.token.id} `;
      } else if (isAgent == 1) {
        sql1 += `and incoming_reports.id_department = ${id_department} `;
      }
      sql1 += `group by user_id `;
      var [answered] = await getConnection.query(sql1);
      var result = [];
      if (total.length != 0) {
        total.map((value) => {
          answered.map((ans) => {
            if (value.agentId == ans.agentId) {
              var missed = value.totalCalls - ans.answered;
              var missedPerc = Math.round((100 * missed) / value.totalCalls);
              var answeredPerc = Math.round(
                (100 * ans.answered) / value.totalCalls
              );
              result.push({
                missed: missedPerc + "%",
                missedCount: missed,
                agent: value.name,
                answered: answeredPerc + "%",
                answeredCount: ans.answered,
                totalCalls: value.totalCalls,
              });
            }
          });
        });
      }
      agentData.map(async (data) => {
        if (result.length != 0) {
          result.map(async (value) => {
            if (data.agent == value.agent) {
              (data.agent = data.agent),
                (data.totalCalls = value.totalCalls),
                (data.answeredCount = value.answeredCount),
                (data.missedCount = value.missedCount),
                (data.answered = value.answered),
                (data.missed = value.missed);
            }
          });
        }
      });
      res.locals.result = agentData;
    } else {
      res.locals.result = [];
    }
    if (count.length != 0) {
      res.locals.count = count.length;
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_agent_percentage_call_csv_report(req, res, next) {
  try {
    var i = 1;
    var search = [];
    var fromDate = req.query.from;
    var department_id = req.query.department_id;
    var toDate = req.query.to;
    var agent = req.query.agentId;
    var id_user = req.token.id_user;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var sql5 = `select CONCAT(user.first_name, ' ', user.last_name) AS user,id_department,user.id,regNumber from user JOIN user_settings ON user.id = user_settings.user_id JOIN user_role ON user_role.user_id = user.id where user.id_user = ${id_user} and role in(1,2) `;
    var sqlCount = `select count(user.id) from user JOIN user_settings ON user.id = user_settings.user_id JOIN user_role ON user_role.user_id = user.id where user.id_user = ${id_user} and role in(1,2) `;
    if (isSubAdmin == 1) {
      sql5 += `and user.id_department in(${id_department}) `;
      sqlCount += `and user.id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql5 += `and user.id_department = ${req.token.id} `;
      sqlCount += `and user.id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql5 += `and user.id_department = ${id_department} `;
      sqlCount += `and user.id_department = ${id_department} `;
    }
    if (agent != undefined) {
      sql5 += `and user.id = $${i} `;
      sqlCount += `and user.id = $${i} `;
      search.push(agent);
      i += 1;
    }
    if (department_id != undefined) {
      sql5 += `and user.id_department = ${department_id} `;
      sqlCount += `and user.id_department = ${department_id} `;
    }
    sqlCount += `GROUP by user.id `;
    var [agentData] = await getConnection.query(sql5, { bind: search });
    var [count] = await getConnection.query(sqlCount, { bind: search });

    const uniqueDepartments = [
      ...new Set(agentData.map((agent) => agent.id_department)),
    ];
    const formattedDepartments = `(${uniqueDepartments.join(", ")})`;
    if (formattedDepartments.length != 0) {
      departmentName = `select id,name from departments where id in ${formattedDepartments}`;
      var [departmentNameResult] = await getConnection.query(departmentName);

      agentData = agentData.map((agent) => {
        let departmentName = null;

        if (agent.id_department === 0) {
          departmentName = "Admin"; // Set departmentName as "Admin" if id_department is 0
        } else {
          const department = departmentNameResult.find(
            (dept) => dept.id == agent.id_department
          );
          departmentName = department ? department.name : null;
        }

        return {
          ...agent,
          departmentName: departmentName, // Add departmentName
        };
      });
    }
    if (agentData.length != 0) {
      var sql = `select incoming_reports.id AS totalCalls,CONCAT(user.first_name, ' ', user.last_name) as name,GROUP_CONCAT(user.id) as agentId,user_id as first_tried_agent from incoming_reports left JOIN user ON FIND_IN_SET(user.id,incoming_reports.user_id) > 0 where user_status != 'ANSWERED' and incoming_reports.call_start_time  BETWEEN '${Start}' AND '${End}' and incoming_reports.id_user = ${id_user} and app != 'smartgroup' `;
      if (isSubAdmin == 1) {
        sql += `and incoming_reports.id_department in(${id_department}) and incoming_reports.id_user = ${id_user} `;
      } else if (isDept == 1) {
        sql += `and incoming_reports.id_department = ${req.token.id} and incoming_reports.id_user = ${id_user} `;
      } else if (isAgent == 1) {
        sql += `and incoming_reports.id_department = ${id_department} and incoming_reports.id_user = ${id_user} `;
      }
      sql += `group by incoming_reports.id `;
      var [total] = await getConnection.query(sql);
      var sql1 = `select COUNT(incoming_reports.id) AS answered,user.id as agentId from incoming_reports join user on incoming_reports.connected_user_id = user.id where user_status = 'ANSWERED' and incoming_reports.call_start_time  BETWEEN '${Start}' AND '${End}' and incoming_reports.id_user = ${id_user} and app != 'smartgroup' `;
      if (isSubAdmin == 1) {
        sql1 += `and incoming_reports.id_department in(${id_department}) `;
      } else if (isDept == 1) {
        sql1 += `and incoming_reports.id_department = ${req.token.id} `;
      } else if (isAgent == 1) {
        sql1 += `and incoming_reports.id_department = ${id_department} `;
      }
      sql1 += `group by connected_user `;
      var [answered] = await getConnection.query(sql1);
      var smartgroupTotalCalls = await smartGroupReport.aggregate([
        {
          $match: {
            eventTime: { $gte: Start, $lte: End },
          },
        },
        {
          $group: {
            _id: "$uniqueId",
          },
        },
      ]);
      var smartgroupAnsweredCalls = await smartGroupReport.aggregate([
        {
          $match: {
            eventStatus: "dial_answered",
            event: "start",
            eventTime: { $gte: Start, $lte: End },
          },
        },
        {
          $group: {
            _id: "$userId", // Grouping by userId
            callCount: { $sum: 1 }, // Summing up the number of calls
          },
        },
      ]);
      var smartgroupMissedCalls = await smartGroupReport.aggregate([
        {
          $match: {
            event: "start",
            eventStatus: { $ne: "dial_answered" },
            eventTime: { $gte: Start, $lte: End },
          },
        },
        {
          $group: {
            _id: "$userId", // Group by userId
            callCount: { $sum: 1 }, // Count the number of calls per userId
          },
        },
      ]);
      var totalMissedCalls = total.length;
      var totalAnsweredCalls = 0;
      agentData.map(async (data) => {
        data.totalCalls = 0;
        data.missed = 0;
        data.missedCount = 0;
        data.answered = 0;
        data.answeredCount = 0;
        if (total.length != 0) {
          total.map(async (value) => {
            if (value.agentId != undefined) {
              if (value.first_tried_agent == data.id) {
                data.totalCalls += 1;
                data.missed = 0;
                data.missedCount += 1;
                data.answered = 0;
                data.answeredCount = 0;
                data.missedPerCalculation = Math.round(
                  (100 * data.missedCount) / data.totalCalls
                );
                data.missed = data.missedPerCalculation + "%";
              }
            }
          });
        }
        if (smartgroupAnsweredCalls.length != 0) {
          smartgroupAnsweredCalls.map(async (value) => {
            if (value._id != undefined) {
              if (value._id == data.id) {
                data.answeredCount += value.callCount;
                totalAnsweredCalls += value.callCount;
                data.totalCalls += value.callCount;
                var answeredPerc = Math.round(
                  (100 * data.answeredCount) / data.totalCalls
                );
                data.answered = answeredPerc + "%";
              }
            }
          });
        }
        if (smartgroupMissedCalls.length != 0) {
          smartgroupMissedCalls.map(async (value) => {
            if (value._id != undefined) {
              if (value._id == data.id) {
                data.missedCount += value.callCount;
                totalMissedCalls += value.callCount;
                data.totalCalls += value.callCount;
                var missedPerc = Math.round(
                  (100 * data.missedCount) / data.totalCalls
                );
                data.missed = missedPerc + "%";
              }
            }
          });
        }
      });
      agentData.map(async (data) => {
        if (answered.length != 0) {
          answered.map((ans) => {
            if (data.id == ans.agentId) {
              if (data.totalCalls != undefined) {
                var answer = ans.answered;
                totalAnsweredCalls += ans.answered;
                data.totalCalls += ans.answered;
                var missed = data.totalCalls - totalAnsweredCalls;
                var missedPerc = Math.round((100 * missed) / data.totalCalls);
                var answeredPerc = Math.round(
                  (100 * totalAnsweredCalls) / data.totalCalls
                );
                data.missed = missedPerc + "%";
                data.missedCount = Number(missed);
                data.answered = answeredPerc + "%";
                data.answeredCount += ans.answered;
              } else {
                totalAnsweredCalls += ans.answered;
                data.totalCalls += ans.answered;
                var answeredPerc = Math.round(
                  (100 * totalAnsweredCalls) / ans.answered
                );
                data.missed = 0 + "%";
                data.missedCount = 0;
                data.answered = answeredPerc + "%";
                data.answeredCount += ans.answered;
              }
            }
          });
        }
      });
      agentData.push({
        user: "Department missed call",
        totalCalls: 0,
        answeredCount: 0,
        missedCount: 0,
        answered: 0 + "%",
        missed: 0 + "%",
      });
      var lastIndex = agentData.length - 1;
      total.map(async (value) => {
        if (
          value.agentId == null ||
          value.agentId === "" ||
          value.agentId == undefined
        ) {
          agentData[lastIndex].totalCalls += 1;
          agentData[lastIndex].missedCount += 1;
          agentData[lastIndex].missed = 100 + "%";
        }
      });
      var totalCall = totalMissedCalls + totalAnsweredCalls;
      if (totalCall != 0) {
        var missedCallPerc = Math.round((100 * totalMissedCalls) / totalCall);
        var answeredCallPerc = Math.round(
          (100 * totalAnsweredCalls) / totalCall
        );
      } else {
        var missedCallPerc = 0;
        var answeredCallPerc = 0;
      }
      var total = {
        totalCall: totalCall,
        totalMissedCalls: totalMissedCalls,
        totalAnsweredCalls: totalAnsweredCalls,
        missedPerc: missedCallPerc + "%",
        answeredPerc: answeredCallPerc + "%",
      };
      res.locals.total = total;
      res.locals.result = agentData;
    } else {
      res.locals.result = [];
    }
    if (count.length != 0) {
      res.locals.count = count.length;
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_agents_by_id_user(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var sql = `select CONCAT(user.first_name, ' ', user.last_name) AS agent,user.id as user_id,regNumber from user LEFT JOIN user_settings ON user.id = user_settings.user_id where id_user = ${id_user} `;
    if (isSubAdmin == 1) {
      sql += `and id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `and id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql += `and id_department = ${id_department} `;
    }
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_agents_selectBox(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_department = req.token.id_department;
    var sql = `select CONCAT(user.first_name, ' ', user.last_name) AS agent,user.id as user_id,regNumber from user LEFT JOIN user_settings ON user.id = user_settings.user_id where user.id_user = ${id_user} `;
    if (isSubAdmin == 1) {
      sql += `and user.id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `and user.id_department = ${req.token.id} `;
    }
    var [result] = await getConnection.query(sql);

    if (result.length != 0) {
      var ids = result.map((user) => user.user_id).join(", ");
      var sqlRole = `select id,user_id, role  from user_role where user_id in (${ids})`;
      var [ResultSqlRole] = await getConnection.query(sqlRole);
    }

    const mergedArray = result.map((user) => {
      const userRoles = ResultSqlRole.filter(
        (role) => role.user_id == user.user_id
      );

      const roles = {};

      // Check for 'pbx' role
      roles.pbx = userRoles.some((role) => role.role == "1") ? 1 : 0;

      // Check for 'callcenter' role
      roles.callcenter = userRoles.some((role) => role.role == "2") ? 1 : 0;

      // Check for 'lead' role
      roles.lead = userRoles.some((role) => role.role == "3") ? 1 : 0;

      // Check for 'ticket' role
      roles.ticket = userRoles.some((role) => role.role == "4") ? 1 : 0;

      return {
        ...user,
        role: roles,
      };
    });
    var result = [mergedArray];

    function handleDIDAndRegNumber(users) {
      return users.map((user) => ({
        ...user,
        did: user.did || user.ext_did || null,
        regNumber: user.regNumber || user.reg_ext || null,
      }));
    }

    const updatedUser = handleDIDAndRegNumber(result[0]);
    res.locals.result = updatedUser;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_agents_and_ext_selectBox(req, res, next) {
  try {
    var id_user = req.token.id_user;    
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_department = req.token.id_department;
    var sql = `SELECT user.id, CONCAT(user.first_name, ' ', user.last_name) AS name, CASE WHEN user.id IS NOT NULL THEN 1 ELSE 0 END AS agentflag FROM user WHERE user.id_user = ${id_user} `;
    if (isSubAdmin == 1) {
      sql += `and user.id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `and user.id_department = ${req.token.id} `;
    }
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function update_popup_status(req, res, next) {
  try {
    var agentId = req.token.id;
    var id_user = req.token.id_user;
    var time = req.query.time;
    var callUniqueId = req.query.callId;
    var type = req.query.type;
    var breakName = req.query.breakName;
    callCenterPopupLog("AgentId --->" + agentId);
    callCenterPopupLog(
      "call unique id ---->" + callUniqueId + ",AgentId --->" + agentId
    );
    var date1 = new Date(time);
    date1.setHours(date1.getHours() - 5);
    date1.setMinutes(date1.getMinutes() - 30);
    var dd = date1.getDate();
    var mm = date1.getMonth() + 1;
    var yyyy = date1.getFullYear();
    var hr = date1.getHours();
    var min = date1.getMinutes();
    var sec = date1.getSeconds();
    const currentDate = `${yyyy}-${mm}-${dd}`;
    var Start = `${yyyy}-${mm}-${dd} ${hr}:${min}:${sec}`;
    callCenterPopupLog(
      "call unique id ---->" +
        callUniqueId +
        ",popup closed time ---->" +
        Start +
        ",AgentId --->" +
        agentId
    );
    console.log("start -->", Start);
    var date2 = new Date();
    var Start1 = `${date2.getFullYear()}-${
      date2.getMonth() + 1
    }-${date2.getDate()} ${date2.getHours()}:${date2.getMinutes()}:${date2.getSeconds()}`;
    console.log("start1 -->", Start1);
    var sql = `UPDATE user_live_data SET popup_status = 0,isHold = 0,currentCallStatus = 0,holded_time = '' WHERE user_id = ${agentId} `;
    var [result] = await sequelize.query(sql);
    console.log("update user live data details ---->", result);
    callCenterPopupLog("update user live data sql ---->" + sql);
    callCenterPopupLog("update user live data details ---->");
    callCenterPopupLog(result);
    //byot
    if (req.token.byot) {
      let byotData = {
        popup_status: 0,
      };
      console.log("before byot ---->", agentId);
      callCenterPopupLog("before byot ---->");
      callCenterPopupLog(byotData);
      callByotApi(
        "PUT",
        `/user/${agentId}/update-livedata`,
        { data: byotData },
        undefined,
        { token: req.headers.token },
        req.token.id_user
      );
    }

    var sqlregNumber = `select regNumber,currentBreakId,isHold from user_settings join user_live_data on user_settings.user_id = user_live_data.user_id WHERE user_settings.user_id = ${agentId} `;
    var [resultRegNumber] = await getConnection.query(sqlregNumber);
    console.log(resultRegNumber);
    console.log(callUniqueId);

    if (type == "incoming") {
      await sequelize.query(
        `UPDATE incoming_reports
              SET acw = TIMESTAMPDIFF(SECOND, call_end_time, NOW())
              WHERE uniqueid = :callUniqueId AND id_user = :id_user
            `,
        {
          replacements: { callUniqueId, id_user },
        }
      );
    } else if (type == "outgoing") {
      await sequelize.query(
        `UPDATE cc_outgoing_reports
              SET acw = TIMESTAMPDIFF(SECOND, call_end_time, NOW())
              WHERE uniqueid = :callUniqueId AND id_user = :id_user
            `,
        {
          replacements: { callUniqueId, id_user },
        }
      );
    }

    var reg = resultRegNumber[0].regNumber;
    var breakId = resultRegNumber[0].currentBreakId;
    res.locals.regNumber = reg;
    res.locals.result = result;
    if (breakId == 1) {
      res.locals.breaks = "Available";
    } else {
      res.locals.breaks = "break";
    }
    var socket = await agentActivityCallSocket(
      agentId,
      req.token.id_user,
      3,
      req.token.id_department
    );
    var socket2 = await agentActivityCountSocket(
      agentId,
      req.token.id_user,
      req.token.id_department
    );
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function popup_status(req, res, next) {
  try {
    var agentId = req.query.agentId;
    var sql = `UPDATE user_live_data SET popup_status = 1 WHERE user_id = ${agentId} `;
    var [result] = await sequelize.query(sql);
    var sqlregNumber = `select regNumber from user_settings WHERE user_id = ${agentId} `;
    var [resultRegNumber] = await getConnection.query(sqlregNumber);
    if (resultRegNumber.length != 0) {
      var reg = resultRegNumber[0].regNumber;
      res.locals.regNumber = reg;
    }
    res.locals.result = result;

    //byot
    const idUser = await User.findByPk(agentId, {
      attributes: ["id", "id_user"],
    });
    let byotData = {
      popup_status: 1,
    };
    callByotApi(
      "PUT",
      `/user/${agentId}/update-livedata`,
      { data: byotData },
      undefined,
      undefined,
      idUser.id_user
    );

    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function incoming_report(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var agentId = req.query.user_id;
    var status = req.query.status;
    var didNumber = req.query.callerid;
    var sourceNumber = req.query.sourceNumber;
    var fromDuration = req.query.fromDuration;
    var toDuration = req.query.toDuration;
    var fromTime = req.query.fromTime;
    var toTime = req.query.toTime;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var app = req.query.application;
    var filterBy = req.query.filterBy;
    var fromdatetime = new Date();
    var todatetime = new Date();
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var department_id = req.query.department_id;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (filterBy != undefined) {
      if (filterBy == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      if (filterBy == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (filterBy == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }

    // Restrict range to max last 30 days
    const maxDays = 30;
    let startDateObj = new Date(Start);
    let endDateObj = new Date(End);

    // If range is more than 30 days, adjust start date
    const diffMs = endDateObj - startDateObj;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > maxDays) {
      // Set start to (end - 30 days)
      startDateObj = new Date(endDateObj);
      startDateObj.setDate(startDateObj.getDate() - maxDays);
      Start = `${startDateObj.getFullYear()}-${(startDateObj.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${startDateObj
        .getDate()
        .toString()
        .padStart(2, "0")} 00:00:00`;
    }

    var sql = `SELECT incoming_reports.id,incoming_reports.last_tried_user,incoming_reports.first_tried_user,incoming_reports.cost,incoming_reports.dtmf_sequence as dtmfSeq,incoming_reports.call_start_time as callStartTime, incoming_reports.source as sourceNumber, incoming_reports.destination as didNumber, incoming_reports.connected_user as answeredAgent, incoming_reports.total_duration as totalDuration, incoming_reports.connected_duration as answeredDuration,incoming_reports.call_connected_time,incoming_reports.call_status,incoming_reports.user_status,incoming_reports.sticky_status, incoming_reports.total_hold_time hold_time,`;
    sql += ` incoming_reports.cr_file as callRecordFile, incoming_reports.app as application, incoming_reports.appId, incoming_reports.app_target_id, incoming_reports.uniqueid as callUniqueId, `;
    sql += `departments.name as deptName, user.id AS agentId, CONCAT(user.first_name, ' ', user.last_name) as agentName,user_settings.extNumber, CASE WHEN incoming_reports.app = 'user' THEN NULL WHEN incoming_reports.app = 'smartgroup' THEN smart_group.name WHEN incoming_reports.app = 'callflow' THEN call_flow.name END as appName FROM incoming_reports LEFT JOIN departments ON incoming_reports.id_department=departments.id LEFT JOIN user ON user.id = incoming_reports.user_id LEFT JOIN user_settings ON user_settings.user_id = incoming_reports.user_id  LEFT JOIN smart_group ON incoming_reports.appId = smart_group.id LEFT JOIN call_flow ON incoming_reports.appId = call_flow.id WHERE incoming_reports.call_start_time BETWEEN '${Start}' AND '${End}' AND incoming_reports.id_user='${id_user}' `;
    var sqlCount = `SELECT count(incoming_reports.id) as total FROM incoming_reports LEFT JOIN departments ON incoming_reports.id_department=departments.id LEFT JOIN user ON user.id = incoming_reports.user_id LEFT JOIN user_settings ON user_settings.user_id = incoming_reports.user_id WHERE incoming_reports.call_start_time BETWEEN '${Start}' AND '${End}' AND incoming_reports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      sql += `AND incoming_reports.id_department in (${id_department}) `;
      sqlCount += `AND incoming_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND incoming_reports.id_department='${req.token.id}' `;
      sqlCount += `AND incoming_reports.id_department='${req.token.id}' `;
    } else if (isAgent == 1) {
      sql += `AND incoming_reports.id_department='${id_department}' `;
      sqlCount += `AND incoming_reports.id_department='${id_department}' `;
    }
    if (agentId != undefined) {
      sql += `and incoming_reports.user_id = '${agentId}' `;
      sqlCount += `and incoming_reports.user_id = '${agentId}' `;
    }
    if (status != undefined) {
      sql += `AND incoming_reports.user_status = '${status}' `;
      sqlCount += `AND incoming_reports.user_status = '${status}' `;
    }
    if (didNumber != undefined) {
      sql += `AND incoming_reports.destination like "%${didNumber}%" `;
      sqlCount += `AND incoming_reports.destination like "%${didNumber}%" `;
    }
    if (app != undefined) {
      sql += `AND incoming_reports.app = '${app}' `;
      sqlCount += `AND incoming_reports.app = '${app}' `;
    }
    if (sourceNumber != undefined) {
      sql += `AND (incoming_reports.source like "%${sourceNumber}%" OR incoming_reports.source like "%91${sourceNumber}%" OR incoming_reports.source like "%0${sourceNumber}%") `;
      sqlCount += `AND incoming_reports.source like "%${sourceNumber}%" `;
    }
    if (fromDuration != undefined && toDuration != undefined) {
      function timeToSeconds(timeString) {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
      }
      var fromDur = timeToSeconds(req.query.fromDuration);
      var toDur = timeToSeconds(req.query.toDuration);
      sqlCount += `and incoming_reports.total_duration between ${fromDur} and ${toDur} `;
      sql += `and incoming_reports.total_duration between ${fromDur} and ${toDur} `;
    }
    if (fromTime != undefined && toTime != undefined) {
      sqlCount += `and TIME(incoming_reports.call_start_time) between '${fromTime}' and '${toTime}' `;
      sql += `and TIME(incoming_reports.call_start_time) between '${fromTime}' and '${toTime}' `;
    }
    if (department_id != undefined) {
      sql += `AND incoming_reports.id_department='${department_id}' `;
      sqlCount += `AND incoming_reports.id_department='${department_id}' `;
    }
    sql += `ORDER BY incoming_reports.call_start_time DESC`;
    if(req.query.count !== "All") {
      sql += ` limit ${skip},${limit}`
    }
    
    sqlCount += `GROUP BY  incoming_reports.id `;
    var [result] = await getConnection.query(sql);
    var [count] = await getConnection.query(sqlCount);

    const last_tried_user = result
      .map((item) => item.last_tried_user)
      .filter((user) => user != null);
    const first_tried_user = result
      .map((item) => item.first_tried_user)
      .filter((user) => user != null);

    // Remove duplicates and zero values
    const uniqueUserIds = [
      ...new Set(last_tried_user.filter((id) => id !== 0)),
    ];
    const uniqueFirstUserIds = [
      ...new Set(first_tried_user.filter((id) => id !== 0)),
    ];

    const userIdsArray = [...uniqueUserIds, ...uniqueFirstUserIds];

    const userIds = userIdsArray.filter(Number).join(",");

    if (userIds.length != 0) {
      const userSql = `SELECT id,CONCAT(first_name, ' ', last_name) AS name FROM user WHERE id IN (${userIds})`;
      var [userResult] = await getConnection.query(userSql);
    }
    if (userResult != undefined) {
      result.map((result) => {
        const matchingName = userResult.find(
          (name) => name.id === result.last_tried_user
        );
        if (matchingName) {
          result.last_tried_name = matchingName.name;
        }
      });
      result.map((result) => {
        const matchingName = userResult.find(
          (name) => name.id === result.first_tried_user
        );
        if (matchingName) {
          result.first_tried_name = matchingName.name;
        }
      });
    }

    const sourceNumbers = result.map((entry) => entry.sourceNumber);
    const contact_query = {
  phone_number: { $in: sourceNumbers },
  id_user: id_user,
};
if(isAdmin == 1){
  contact_query.id_department = 0
}
if(isDept == 1){
  contact_query.id_department = Number(req.token.id)
}
if (isSubAdmin == 1) {
  const departmentArray = req.token.id_department.split(',').map(Number); 
  contact_query.id_department = { $in: departmentArray };
}
const projection = {
  name: 1,
  phone_number: 1,
  _id: 0,
};

const callFlowDetails = {};

const callFlowIds = result
  .filter(record => record.application === "callflow") // Only "callflow"
  .flatMap(record => (record.app_target_id ? record.app_target_id.split(",") : [record.appId]));

if(callFlowIds.length) {
  const callflows = await Callflow.findAll({ where: { id: callFlowIds, id_user }, attributes: ["id", "name"], raw: true });
    // Create a lookup object: { id: name }
  callflows.forEach(cf => {
    callFlowDetails[cf.id] = cf.name;
  });
}

const contact_data = await contactsModel.find(contact_query, projection).lean();

    const updatedResult = result.map((item) => {
      if(item.application === "callflow") {
        item.appName = getCallFlowName(item.app_target_id ?? item.appId?.toString(), callFlowDetails);
      }
      
      const match = contact_data.find((entry) =>
        entry.phone_number.includes(item.sourceNumber)
      );
      if (match) {
        return { ...item, contact_name: match.name };
      }
      return item;
    });

    if (req.token.phone_number_masking == 1) {
      var map_result = Promise.all(
        updatedResult.map(async (value) => {
          var sourceNo = await string_encode(value.sourceNumber);
          if (sourceNo) {
            value.sourceNumber = sourceNo;
          }
          return value;
        })
      );
      updatedResult = await map_result;
    }

    res.locals.result = updatedResult;
    res.locals.total = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

function timeToSeconds(timeString) {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

async function missedCall_report(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin
    var id_user = req.token.id_user;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var agentId = req.query.agentId;
    var didNumber = req.query.didNumber;
    var sourceNumber = req.query.sourceNumber;
    var department_id = req.query.department_id;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var filterBy = req.query.filterBy;
    var fromdatetime = new Date();
    var todatetime = new Date();
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (filterBy != undefined) {
      if (filterBy == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      if (filterBy == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (filterBy == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var sql = `SELECT incoming_reports.id,incoming_reports.dtmf_sequence as dtmfSeq,incoming_reports.call_start_time as callStartTime, incoming_reports.source as sourceNumber, incoming_reports.destination as didNumber,  incoming_reports.connected_user as answeredAgent, incoming_reports.total_duration as totalDuration,incoming_reports.connected_duration as answeredDuration, incoming_reports.user_status as agentStatus,incoming_reports.cr_file as callRecordFile, incoming_reports.app as application, incoming_reports.uniqueid as callUniqueId,call_status,incoming_reports.user_id ,incoming_reports.first_tried_user,incoming_reports.last_tried_user,CONCAT(user.first_name, ' ', user.last_name) AS agentName,`;
    sql += `transfer_reports.tempValue, transfer_reports.destination as transferDestination, transfer_reports.duration as transferDuration, transfer_reports.recordStatus as transferRecordStatus, transfer_reports.recordFile as transferRecordFile, transfer_reports.transferType, departments.name as deptName,CASE WHEN incoming_reports.app = 'user' THEN NULL WHEN incoming_reports.app = 'smartgroup' THEN smart_group.name WHEN incoming_reports.app = 'callflow' THEN call_flow.name END as appName FROM incoming_reports LEFT JOIN transfer_reports ON incoming_reports.uniqueid=transfer_reports.callUniqueId LEFT JOIN departments ON incoming_reports.id_department=departments.id LEFT JOIN smart_group ON incoming_reports.appId = smart_group.id LEFT JOIN call_flow ON incoming_reports.appId = call_flow.id LEFT JOIN user ON incoming_reports.user_id = user.id  WHERE incoming_reports.call_start_time BETWEEN '${Start}' AND '${End}' AND user_status != 'ANSWERED' AND incoming_reports.id_user='${id_user}' `;
    var sqlCount = `SELECT count(incoming_reports.id) as total FROM incoming_reports LEFT JOIN transfer_reports ON incoming_reports.uniqueid=transfer_reports.callUniqueId LEFT JOIN departments ON incoming_reports.id_department=departments.id LEFT JOIN user ON incoming_reports.user_id=user.id  WHERE incoming_reports.call_start_time BETWEEN '${Start}' AND '${End}' AND user_status != 'ANSWERED' AND incoming_reports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      sql += `AND incoming_reports.id_department in (${id_department}) `;
      sqlCount += `AND incoming_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND incoming_reports.id_department='${req.token.id}' `;
      sqlCount += `AND incoming_reports.id_department='${req.token.id}' `;
    } else if (isAgent == 1) {
      sql += `AND incoming_reports.id_department='${id_department}' `;
      sqlCount += `AND incoming_reports.id_department='${id_department}' `;
    }
    if (agentId != undefined) {
      sql += `AND incoming_reports.user_id = '${agentId}' `;
      sqlCount += `AND incoming_reports.user_id = '${agentId}' `;
    }
    if (didNumber != undefined) {
      sql += `AND incoming_reports.destination in (${didNumber}) `;
      sqlCount += `AND incoming_reports.destination in (${didNumber}) `;
    }
    if (department_id != undefined) {
      sql += `AND incoming_reports.id_department = '${department_id}' `;
      sqlCount += `AND incoming_reports.id_department = '${department_id}' `;
    }
    if (sourceNumber != undefined) {
      sql += `AND (incoming_reports.source like "%${sourceNumber}%" OR incoming_reports.source like "%91${sourceNumber}%" OR incoming_reports.source like "%0${sourceNumber}%") `;
      sqlCount += `AND incoming_reports.source like "%${sourceNumber}%" `;
    }
    sql += `ORDER BY incoming_reports.call_start_time DESC limit ${skip},${limit}`;
    sqlCount += `GROUP BY  incoming_reports.id `;
    var [result] = await getConnection.query(sql);

    const last_tried_user = result
      .map((item) => item.last_tried_user)
      .filter((user) => user != null);
    const first_tried_user = result
      .map((item) => item.first_tried_user)
      .filter((user) => user != null);

    // Remove duplicates and zero values
    const uniqueUserIds = [
      ...new Set(last_tried_user.filter((id) => id !== 0)),
    ];
    const uniqueFirstUserIds = [
      ...new Set(first_tried_user.filter((id) => id !== 0)),
    ];

    const userIdsArray = [...uniqueUserIds, ...uniqueFirstUserIds];

    const userIds = userIdsArray.join(",");

    if (userIds.length != 0) {
      const userSql = `SELECT id,CONCAT(first_name, ' ', last_name) AS name FROM user WHERE id IN (${userIds})`;
      var [userResult] = await getConnection.query(userSql);
    }
    if (userResult != undefined) {
      result.map((result) => {
        const matchingName = userResult.find(
          (name) => name.id === result.last_tried_user
        );
        if (matchingName) {
          result.last_tried_name = matchingName.name;
        }
      });
      result.map((result) => {
        const matchingName = userResult.find(
          (name) => name.id === result.first_tried_user
        );
        if (matchingName) {
          result.first_tried_name = matchingName.name;
        }
      });
    }
    var [count] = await getConnection.query(sqlCount);

    const sourceNumbers = result.map((entry) => entry.sourceNumber);

       const contact_query = {
  phone_number: { $in: sourceNumbers },
  id_user: id_user,
};
if(isAdmin == 1){
  contact_query.id_department = 0
}
if(isDept == 1){
  contact_query.id_department = Number(req.token.id)
}
if (isSubAdmin == 1) {
  const departmentArray = req.token.id_department.split(',').map(Number); 
  contact_query.id_department = { $in: departmentArray };
}
const projection = {
  name: 1,
  phone_number: 1,
  _id: 0,
};
const contact_data = await contactsModel.find(contact_query, projection).lean();
    const updatedResult = result.map((item) => {
      const match = contact_data.find((entry) =>
        entry.phone_number.includes(item.sourceNumber)
      );
      if (match) {
        return { ...item, contact_name: match.name };
      }
      return item;
    });

       if (req.token.phone_number_masking == 1) {
      var map_result = Promise.all(
        updatedResult.map(async (value) => {
          var sn = await string_encode(value.sourceNumber);
          if (sn) {
            value.sourceNumber = sn;
          }
          return value;
        })
      );
      updatedResult = await map_result;
    }
    res.locals.result = updatedResult;
    res.locals.total = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function outgoing_report(req, res, next) {
  try {
    var i = 1;
    var isAdmin = req.token.isAdmin
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var agent_id = req.query.user_id;
    var agentFlag = req.query.agentFlag;
    var destination = req.query.destination;
    var department_id = req.query.department_id;
    var callerid = req.query.callerid;
    var status = req.query.status;
    var fromDuration = req.query.fromDuration;
    var toDuration = req.query.toDuration;
    var fromTime = req.query.fromTime;
    var toTime = req.query.toTime;
    var filterBy = req.query.filterBy;
    var fromdatetime = new Date();
    var todatetime = new Date();
    var today = new Date();
    var dd = today.getDate().toString().padStart(2, "0");
    var mm = (today.getMonth() + 1).toString().padStart(2, "0");
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (filterBy != undefined) {
      if (filterBy == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      if (filterBy == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (filterBy == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var search = [];
    var sqlCount = `SELECT count(id) as outgoingcall FROM cc_outgoing_reports  where date between '${Start}' and '${End}' and cc_outgoing_reports.id_user='${id_user}' `;
    var sql = `SELECT cc_outgoing_reports.id,cc_outgoing_reports.source_type ,app as application,cc_outgoing_reports.cost,cc_outgoing_reports.date,cc_outgoing_reports.call_end_time as call_endtime,cc_outgoing_reports.uniqueid, cc_outgoing_reports.destination,cc_outgoing_reports.callerid, cc_outgoing_reports.duration,cc_outgoing_reports.status as callStatus,cc_outgoing_reports.cr_file as callRecord,cc_outgoing_reports.id_department as deptId, cc_outgoing_reports.total_hold_time hold_time, departments.name as departmentName,CONCAT(user.first_name, ' ', user.last_name) as agentName,user_settings.extNumber as agent  FROM cc_outgoing_reports `;
    sql += `LEFT JOIN departments ON cc_outgoing_reports.id_department = departments.id LEFT JOIN user on cc_outgoing_reports.user_id = user.id LEFT JOIN user_settings on user_settings.user_id = cc_outgoing_reports.user_id where cc_outgoing_reports.date between '${Start}' and '${End}' and cc_outgoing_reports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      sql += `AND cc_outgoing_reports.id_department in (${id_department}) `;
      sqlCount += `AND cc_outgoing_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND cc_outgoing_reports.id_department='${req.token.id}' `;
      sqlCount += `AND cc_outgoing_reports.id_department='${req.token.id}' `;
    } else if (isAgent == 1) {
      sql += `AND cc_outgoing_reports.id_department='${id_department}' `;
      sqlCount += `AND cc_outgoing_reports.id_department='${id_department}' `;
    }
    if (agent_id != undefined) {
      sqlCount += `and cc_outgoing_reports.user_id = '${agent_id}' `;
      sql += `and cc_outgoing_reports.user_id = '${agent_id}' `;
    }
    if (destination != undefined) {
      sqlCount += `and cc_outgoing_reports.destination like '%${destination}%' `;
      sql += `and cc_outgoing_reports.destination like '%${destination}%' `;
    }
    if (department_id != undefined) {
      sqlCount += `and cc_outgoing_reports.id_department like '%${department_id}%' `;
      sql += `and cc_outgoing_reports.id_department like '%${department_id}%' `;
    }
    if (callerid != undefined) {
      sqlCount += `and (cc_outgoing_reports.callerid = '${callerid}' or  cc_outgoing_reports.callerid = '+${callerid}' )`;
      sql += `and (cc_outgoing_reports.callerid = '${callerid}' or cc_outgoing_reports.callerid = '+${callerid}' )`;
    }
    if (status != undefined) {
      if (status == "NO ANSWER") {
        sqlCount += `and (cc_outgoing_reports.status like '%NO ANSWER%' OR cc_outgoing_reports.status LIKE '%NOANSWER%') `;
        sql += `and (cc_outgoing_reports.status like '%NO ANSWER%' OR cc_outgoing_reports.status LIKE '%NOANSWER%') `;
      } else if (status == "ANSWER") {
        sqlCount += `AND (cc_outgoing_reports.status = '${status}' OR cc_outgoing_reports.status = 'ANSWERED') `;
        sql += `AND (cc_outgoing_reports.status = '${status}' OR cc_outgoing_reports.status = 'ANSWERED')`;
      } else {
        sqlCount += `and cc_outgoing_reports.status like '%${status}%' `;
        sql += `and cc_outgoing_reports.status like '%${status}%' `;
      }
    }
    if (fromDuration != undefined && toDuration != undefined) {
      function timeToSeconds(timeString) {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
      }
      var fromDur = timeToSeconds(req.query.fromDuration);
      var toDur = timeToSeconds(req.query.toDuration);
      sqlCount += `and duration between ${fromDur} and ${toDur} `;
      sql += `and duration between ${fromDur} and ${toDur} `;
    }
    if (fromTime != undefined && toTime != undefined) {
      sqlCount += `and TIME(date ) between '${fromTime}' and '${toTime}' `;
      sql += `and TIME(date ) between '${fromTime}' and '${toTime}' `;
    }
    sqlCount += `GROUP BY id `;
    sql += ` order by date desc limit ${skip},${limit} `;
    var [result] = await rackServer.query(sql, { bind: search });
    var [count] = await rackServer.query(sqlCount, { bind: search });

     const sourceNumbers = result.map((entry) => entry.destination);
   
     const contact_query = {
  phone_number: { $in: sourceNumbers },
  id_user: id_user,
};
if(isAdmin == 1){
  contact_query.id_department = 0
}
if(isDept == 1){
  contact_query.id_department = Number(req.token.id)
}
if (isSubAdmin == 1) {
  const departmentArray = req.token.id_department.split(',').map(Number); 
  contact_query.id_department = { $in: departmentArray };
}
const projection = {
  name: 1,
  phone_number: 1,
  _id: 0,
};
const contact_data = await contactsModel.find(contact_query, projection).lean();
    const updatedResult = result.map((item) => {
      const match = contact_data.find((entry) =>
        entry.phone_number.includes(item.destination)
      );
      if (match) {
        return { ...item, contact_name: match.name };
      }
      return item;
    });

        if (req.token.phone_number_masking == 1) {
      var map_result = Promise.all(
        updatedResult.map(async (value) => {
          var dest = await string_encode(value.destination);
          if (dest) {
            value.destination = dest;
          }
          return value;
        })
      );
      updatedResult = await map_result;
    }

    res.locals.result = updatedResult;
    res.locals.count = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_outgoing_failed_calls(req, res, next) {
  try {
    var i = 1;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var agent_id = req.query.user_id;
    var agentFlag = req.query.agentFlag;
    var destination = req.query.destination;
    var department_id = req.query.department_id;
    var callerid = req.query.callerid;
    var status = req.query.status;
    var fromDuration = req.query.fromDuration;
    var toDuration = req.query.toDuration;
    var fromTime = req.query.fromTime;
    var toTime = req.query.toTime;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var search = [];
    var sqlCount = `SELECT count(id) as outgoingcall FROM cc_outgoing_reports  where (cc_outgoing_reports.status NOT IN ('ANSWER', 'ANSWERED') OR cc_outgoing_reports.duration = 0) and date between '${Start}' and '${End}' and cc_outgoing_reports.id_user='${id_user}' `;
    var sql = `SELECT cc_outgoing_reports.id,cc_outgoing_reports.source_type as application,cc_outgoing_reports.cost,cc_outgoing_reports.date,cc_outgoing_reports.call_end_time as call_endtime,cc_outgoing_reports.uniqueid, cc_outgoing_reports.destination,cc_outgoing_reports.callerid, cc_outgoing_reports.duration,cc_outgoing_reports.status as callStatus,cc_outgoing_reports.cr_file as callRecord,cc_outgoing_reports.id_department as deptId,departments.name as departmentName,CONCAT(user.first_name, ' ', user.last_name) as agentName,user_settings.extNumber as agent  FROM cc_outgoing_reports `;
    sql += `LEFT JOIN departments ON cc_outgoing_reports.id_department = departments.id LEFT JOIN user on cc_outgoing_reports.user_id = user.id LEFT JOIN user_settings on user_settings.user_id = cc_outgoing_reports.user_id where (cc_outgoing_reports.status NOT IN ('ANSWER', 'ANSWERED') OR cc_outgoing_reports.duration = 0) and  cc_outgoing_reports.date between '${Start}' and '${End}' and cc_outgoing_reports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      sql += `AND cc_outgoing_reports.id_department in (${id_department}) `;
      sqlCount += `AND cc_outgoing_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND cc_outgoing_reports.id_department='${req.token.id}' `;
      sqlCount += `AND cc_outgoing_reports.id_department='${req.token.id}' `;
    } else if (isAgent == 1) {
      sql += `AND cc_outgoing_reports.id_department='${id_department}' `;
      sqlCount += `AND cc_outgoing_reports.id_department='${id_department}' `;
    }
    if (agent_id != undefined) {
      sqlCount += `and cc_outgoing_reports.user_id = '${agent_id}' `;
      sql += `and cc_outgoing_reports.user_id = '${agent_id}' `;
    }
    if (destination != undefined) {
      sqlCount += `and cc_outgoing_reports.destination like '%${destination}%' `;
      sql += `and cc_outgoing_reports.destination like '%${destination}%' `;
    }
    if (department_id != undefined) {
      sqlCount += `and cc_outgoing_reports.id_department like '%${department_id}%' `;
      sql += `and cc_outgoing_reports.id_department like '%${department_id}%' `;
    }
    if (callerid != undefined) {
      sqlCount += `and (cc_outgoing_reports.callerid = '${callerid}' or  cc_outgoing_reports.callerid = '+${callerid}' )`;
      sql += `and (cc_outgoing_reports.callerid = '${callerid}' or cc_outgoing_reports.callerid = '+${callerid}' )`;
    }
    if (status != undefined) {
      if (status == "NO ANSWER") {
        sqlCount += `and (cc_outgoing_reports.status like '%NO ANSWER%' OR cc_outgoing_reports.status LIKE '%NOANSWER%') `;
        sql += `and (cc_outgoing_reports.status like '%NO ANSWER%' OR cc_outgoing_reports.status LIKE '%NOANSWER%') `;
      } else if (status == "ANSWERED") {
        sqlCount += `AND (cc_outgoing_reports.status = '${status}%' OR cc_outgoing_reports.status = 'ANSWER') `;
        sql += `AND (cc_outgoing_reports.status = '${status}' OR cc_outgoing_reports.status = 'ANSWER')`;
      } else {
        sqlCount += `and cc_outgoing_reports.status like '%${status}%' `;
        sql += `and cc_outgoing_reports.status like '%${status}%' `;
      }
    }
    if (fromDuration != undefined && toDuration != undefined) {
      function timeToSeconds(timeString) {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
      }
      var fromDur = timeToSeconds(req.query.fromDuration);
      var toDur = timeToSeconds(req.query.toDuration);
      sqlCount += `and duration between ${fromDur} and ${toDur} `;
      sql += `and duration between ${fromDur} and ${toDur} `;
    }
    if (fromTime != undefined && toTime != undefined) {
      sqlCount += `and TIME(date ) between '${fromTime}' and '${toTime}' `;
      sql += `and TIME(date ) between '${fromTime}' and '${toTime}' `;
    }
    sqlCount += `GROUP BY id `;
    sql += ` order by id desc limit ${skip},${limit} `;
    var [result] = await getConnection.query(sql, { bind: search });
    var [count] = await getConnection.query(sqlCount, { bind: search });
    if (req.token.phone_number_masking == 1) {
      var map_result = Promise.all(
        result.map(async (value) => {
          var dest = await string_encode(value.destination);
          if (dest) {
            value.destination = dest;
          }
          return value;
        })
      );
      var output = await map_result;
      res.locals.result = output;
    } else {
      res.locals.result = result;
    }
    res.locals.count = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_outgoing_failed_calls_csv(req, res, next) {
  try {
    var i = 1;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var agent_id = req.query.user_id;
    var agentFlag = req.query.agentFlag;
    var destination = req.query.destination;
    var department_id = req.query.department_id;
    var callerid = req.query.callerid;
    var status = req.query.status;
    var fromDuration = req.query.fromDuration;
    var toDuration = req.query.toDuration;
    var fromTime = req.query.fromTime;
    var toTime = req.query.toTime;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var search = [];
    var sqlCount = `SELECT count(id) as outgoingcall FROM cc_outgoing_reports  where (cc_outgoing_reports.status NOT IN ('ANSWER', 'ANSWERED') OR cc_outgoing_reports.duration = 0) and date between '${Start}' and '${End}' and cc_outgoing_reports.id_user='${id_user}' `;
    var sql = `SELECT cc_outgoing_reports.id,cc_outgoing_reports.source_type as application,cc_outgoing_reports.cost,cc_outgoing_reports.date,cc_outgoing_reports.call_end_time as call_endtime,cc_outgoing_reports.uniqueid, cc_outgoing_reports.destination,cc_outgoing_reports.callerid, cc_outgoing_reports.duration,cc_outgoing_reports.status as callStatus,cc_outgoing_reports.cr_file as callRecord,cc_outgoing_reports.id_department as deptId,departments.name as departmentName,CONCAT(user.first_name, ' ', user.last_name) as agentName,user_settings.extNumber as agent  FROM cc_outgoing_reports `;
    sql += `LEFT JOIN departments ON cc_outgoing_reports.id_department = departments.id LEFT JOIN user on cc_outgoing_reports.user_id = user.id LEFT JOIN user_settings on user_settings.user_id = cc_outgoing_reports.user_id where (cc_outgoing_reports.status NOT IN ('ANSWER', 'ANSWERED') OR cc_outgoing_reports.duration = 0) and  cc_outgoing_reports.date between '${Start}' and '${End}' and cc_outgoing_reports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      sql += `AND cc_outgoing_reports.id_department in (${id_department}) `;
      sqlCount += `AND cc_outgoing_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND cc_outgoing_reports.id_department='${req.token.id}' `;
      sqlCount += `AND cc_outgoing_reports.id_department='${req.token.id}' `;
    } else if (isAgent == 1) {
      sql += `AND cc_outgoing_reports.id_department='${id_department}' `;
      sqlCount += `AND cc_outgoing_reports.id_department='${id_department}' `;
    }
    if (agent_id != undefined) {
      sqlCount += `and cc_outgoing_reports.user_id = '${agent_id}' `;
      sql += `and cc_outgoing_reports.user_id = '${agent_id}' `;
    }
    if (destination != undefined) {
      sqlCount += `and cc_outgoing_reports.destination like '%${destination}%' `;
      sql += `and cc_outgoing_reports.destination like '%${destination}%' `;
    }
    if (department_id != undefined) {
      sqlCount += `and cc_outgoing_reports.id_department like '%${department_id}%' `;
      sql += `and cc_outgoing_reports.id_department like '%${department_id}%' `;
    }
    if (callerid != undefined) {
      sqlCount += `and (cc_outgoing_reports.callerid = '${callerid}' or  cc_outgoing_reports.callerid = '+${callerid}' )`;
      sql += `and (cc_outgoing_reports.callerid = '${callerid}' or cc_outgoing_reports.callerid = '+${callerid}' )`;
    }
    if (status != undefined) {
      if (status == "NO ANSWER") {
        sqlCount += `and (cc_outgoing_reports.status like '%NO ANSWER%' OR cc_outgoing_reports.status LIKE '%NOANSWER%') `;
        sql += `and (cc_outgoing_reports.status like '%NO ANSWER%' OR cc_outgoing_reports.status LIKE '%NOANSWER%') `;
      } else if (status == "ANSWERED") {
        sqlCount += `AND (cc_outgoing_reports.status = '${status}%' OR cc_outgoing_reports.status = 'ANSWER') `;
        sql += `AND (cc_outgoing_reports.status = '${status}' OR cc_outgoing_reports.status = 'ANSWER')`;
      } else {
        sqlCount += `and cc_outgoing_reports.status like '%${status}%' `;
        sql += `and cc_outgoing_reports.status like '%${status}%' `;
      }
    }
    if (fromDuration != undefined && toDuration != undefined) {
      function timeToSeconds(timeString) {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
      }
      var fromDur = timeToSeconds(req.query.fromDuration);
      var toDur = timeToSeconds(req.query.toDuration);
      sqlCount += `and duration between ${fromDur} and ${toDur} `;
      sql += `and duration between ${fromDur} and ${toDur} `;
    }
    if (fromTime != undefined && toTime != undefined) {
      sqlCount += `and TIME(date ) between '${fromTime}' and '${toTime}' `;
      sql += `and TIME(date ) between '${fromTime}' and '${toTime}' `;
    }
    sqlCount += `GROUP BY id `;
    sql += ` order by id desc `;
    var [result] = await getConnection.query(sql, { bind: search });
    var [count] = await getConnection.query(sqlCount, { bind: search });
    if (req.token.phone_number_masking == 1) {
      var map_result = Promise.all(
        result.map(async (value) => {
          var dest = await string_encode(value.destination);
          if (dest) {
            value.destination = dest;
          }
          return value;
        })
      );
      var output = await map_result;
      res.locals.result = output;
    } else {
      res.locals.result = result;
    }
    res.locals.count = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function incoming_report_csv_report(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var didNumber = req.query.callerid;
    var sourceNumber = req.query.sourceNumber;
    var agentId = req.query.user_id;
    var status = req.query.status;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var fromDuration = req.query.fromDuration;
    var toDuration = req.query.toDuration;
    var fromTime = req.query.fromTime;
    var toTime = req.query.toTime;
    var app = req.query.application;
    var filterBy = req.query.filterBy;
    var fromdatetime = new Date();
    var todatetime = new Date();
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (filterBy != undefined) {
      if (filterBy == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      if (filterBy == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (filterBy == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var sql = `SELECT incoming_reports.id,incoming_reports.last_tried_user,incoming_reports.first_tried_user,incoming_reports.cost,COALESCE(incoming_reports.dtmf_sequence, '') AS dtmfSeq, incoming_reports.call_start_time as callStartTime, incoming_reports.source as sourceNumber, incoming_reports.destination as didNumber, incoming_reports.total_duration as totalDuration, incoming_reports.connected_duration as answeredDuration,incoming_reports.call_connected_time,incoming_reports.call_status,incoming_reports.user_status,incoming_reports.sticky_status, incoming_reports.total_hold_time hold_time,`;
    sql += ` incoming_reports.cr_file as callRecordFile, incoming_reports.app as application, incoming_reports.appId, incoming_reports.app_target_id, incoming_reports.uniqueid as callUniqueId, `;
    sql += `departments.name as deptName,CONCAT(user.first_name, ' ', user.last_name) as agentName,user_settings.extNumber, CASE WHEN incoming_reports.app = 'user' THEN NULL WHEN incoming_reports.app = 'smartgroup' THEN smart_group.name WHEN incoming_reports.app = 'callflow' THEN call_flow.name END as appName FROM incoming_reports LEFT JOIN departments ON incoming_reports.id_department=departments.id LEFT JOIN user ON user.id = incoming_reports.user_id LEFT JOIN user_settings ON user_settings.user_id = incoming_reports.user_id  LEFT JOIN smart_group ON incoming_reports.appId = smart_group.id LEFT JOIN call_flow ON incoming_reports.appId = call_flow.id WHERE incoming_reports.call_start_time BETWEEN '${Start}' AND '${End}' AND incoming_reports.id_user='${id_user}' `;
    var sqlCount = `SELECT count(incoming_reports.id) as total FROM incoming_reports LEFT JOIN departments ON incoming_reports.id_department=departments.id LEFT JOIN user ON user.id = incoming_reports.user_id LEFT JOIN user_settings ON user_settings.user_id = incoming_reports.user_id WHERE incoming_reports.call_start_time BETWEEN '${Start}' AND '${End}' AND incoming_reports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      sql += `AND incoming_reports.id_department in (${id_department}) `;
      sqlCount += `AND incoming_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND incoming_reports.id_department='${req.token.id}' `;
      sqlCount += `AND incoming_reports.id_department='${req.token.id}' `;
    } else if (isAgent == 1) {
      sql += `AND incoming_reports.id_department='${id_department}' `;
      sqlCount += `AND incoming_reports.id_department='${id_department}' `;
    }
    if (agentId != undefined) {
      sql += `and incoming_reports.user_id = '${agentId}' `;
      sqlCount += `and incoming_reports.user_id = '${agentId}' `;
    }
    if (status != undefined) {
      sql += `AND incoming_reports.user_status = '${status}' `;
      sqlCount += `AND incoming_reports.user_status = '${status}' `;
    }
    if (didNumber != undefined) {
      sql += `AND incoming_reports.destination like "%${didNumber}%" `;
      sqlCount += `AND incoming_reports.destination like "%${didNumber}%" `;
    }
    if (sourceNumber != undefined) {
      sql += `AND (incoming_reports.source like "%${sourceNumber}%" OR incoming_reports.source like "%91${sourceNumber}%" OR incoming_reports.source like "%0${sourceNumber}%") `;
      sqlCount += `AND incoming_reports.source like "%${sourceNumber}%" `;
    }
    if (fromDuration != undefined && toDuration != undefined) {
      function timeToSeconds(timeString) {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
      }
      var fromDur = timeToSeconds(req.query.fromDuration);
      var toDur = timeToSeconds(req.query.toDuration);
      sqlCount += `and incoming_reports.total_duration between ${fromDur} and ${toDur} `;
      sql += `and incoming_reports.total_duration between ${fromDur} and ${toDur} `;
    }
    if (fromTime != undefined && toTime != undefined) {
      sqlCount += `and TIME(incoming_reports.call_start_time) between '${fromTime}' and '${toTime}' `;
      sql += `and TIME(incoming_reports.call_start_time) between '${fromTime}' and '${toTime}' `;
    }
    if (app != undefined) {
      sql += `AND incoming_reports.app = '${app}' `;
      sqlCount += `AND incoming_reports.app = '${app}' `;
    }
    sql += `ORDER BY incoming_reports.call_start_time DESC `;
    sqlCount += `GROUP BY  incoming_reports.id `;
    var [result] = await getConnection.query(sql);
    if (result.length != 0) {
      var map_result = Promise.all(
        result.map(async (value) => {
          if (value.user_status == "ANSWERED") {
            var fromdateDateTime = value.callStartTime;
            var cntdate = fromdateDateTime
              .getDate()
              .toString()
              .padStart(2, "0");
            var currentMnth = (fromdateDateTime.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            var year = fromdateDateTime.getFullYear();
            var date = `${year}-${currentMnth}-${cntdate}`;
            value.callRecordFile =
              `${process.env.NODE_PATH}` +
              `callcenter/get_incoming_callrecordings_without_token/` +
              `${value.callRecordFile}.wav/` +
              `${date}/` +
              `${id_user}`;
          } else {
            value.callRecordFile = "";
          }
          return value;
        })
      );
      result = await map_result;
    }
    var [count] = await getConnection.query(sqlCount);

    const last_tried_user = result
      .map((item) => item.last_tried_user)
      .filter((user) => user != null);
    const first_tried_user = result
      .map((item) => item.first_tried_user)
      .filter((user) => user != null);

    // Remove duplicates and zero values
    const uniqueUserIds = [
      ...new Set(last_tried_user.filter((id) => id !== 0)),
    ];
    const uniqueFirstUserIds = [
      ...new Set(first_tried_user.filter((id) => id !== 0)),
    ];

    const userIdsArray = [...uniqueUserIds, ...uniqueFirstUserIds]
      .filter(id => id && Number.isFinite(Number(id)));

    const userIds = userIdsArray.join(",");

    if (userIds.length != 0) {
      const userSql = `SELECT id,CONCAT(first_name, ' ', last_name) AS name FROM user WHERE id IN (${userIds})`;
      var [userResult] = await getConnection.query(userSql);
    }
    if (userResult != undefined) {
      result.map((result) => {
        const matchingName = userResult.find(
          (name) => name.id === result.last_tried_user
        );
        if (matchingName) {
          result.last_tried_name = matchingName.name;
        }
      });
      result.map((result) => {
        const matchingName = userResult.find(
          (name) => name.id === result.first_tried_user
        );
        if (matchingName) {
          result.first_tried_name = matchingName.name;
        }
      });
    }
    const sourceNumbers = result.map((entry) => entry.sourceNumber);

    if (result.length > 0) {
      result[0].first_tried_name = result[0].first_tried_name || null;
      result[0].last_tried_name = result[0].last_tried_name || null;
    }

     const contact_query = {
  phone_number: { $in: sourceNumbers },
  id_user: id_user,
};
if(isAdmin == 1){
  contact_query.id_department = 0
}
if(isDept == 1){
  contact_query.id_department = Number(req.token.id)
}
if (isSubAdmin == 1) {
  const departmentArray = req.token.id_department.split(',').map(Number); 
  contact_query.id_department = { $in: departmentArray };
}
const projection = {
  name: 1,
  phone_number: 1,
  _id: 0,
};

//disposition and comments
const uniqueIdsArray = result.map(record => record.callUniqueId);
const [getDispositionDetails, latestCommentOfContacts] = await Promise.all([
  CallDispositions.find({
    unique_id: { $in: uniqueIdsArray },
  }).populate("disposition"),

  CallTaskComment.aggregate([
    {
      $match: {
        unique_id: { $in: uniqueIdsArray },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: "$unique_id",
        latestComment: { $first: "$comment" },
        latestCommentAt: { $first: "$createdAt" },
      },
    },
  ]),
]);

//disposition
const dispositionLookUp = getDispositionDetails.reduce((acc, item) => {
  acc[item.unique_id] = {
    disposition: item.disposition?.name || "",
  };
  return acc;
}, {});

//comments
const latestCommentMap = latestCommentOfContacts.reduce((acc, item) => {
  acc[item._id] = item.latestComment ?? "";
  return acc;
}, {});

const callFlowDetails = {};

const callFlowIds = result
  .filter(record => record.application === "callflow") // Only "callflow"
  .flatMap(record => (record.app_target_id ? record.app_target_id.split(",") : [record.appId]));

if(callFlowIds.length) {
  const callflows = await Callflow.findAll({ where: { id: callFlowIds, id_user }, attributes: ["id", "name"], raw: true });
    // Create a lookup object: { id: name }
  callflows.forEach(cf => {
    callFlowDetails[cf.id] = cf.name;
  });
}

const contact_data = await contactsModel.find(contact_query, projection).lean();
    const updatedResult = result.map((item) => {

      //disposition
      item.disposition = dispositionLookUp[item.callUniqueId]?.disposition || ""
      //comment
      item.latestComment = latestCommentMap[item.callUniqueId] || "";
      
      if(item.application === "callflow") {
        item.appName = getCallFlowName(item.app_target_id ?? item.appId?.toString(), callFlowDetails, "| ");
      }
      delete item.app_target_id;
      
      const match = contact_data.find((entry) =>
        entry.phone_number.includes(item.sourceNumber)
      );
      if (match) {
        return { ...item, contact_name: match.name };
      }
      return item;
    });

        if (req.token.phone_number_masking == 1) {
      var map_result = Promise.all(
        updatedResult.map(async (value) => {
          var source_num = await string_encode(value.sourceNumber);
          if (source_num) {
            value.sourceNumber = source_num;
          }
          return value;
        })
      );
      updatedResult = await map_result;
    }

    res.locals.result = updatedResult;
    res.locals.total = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function missedCall_report_csv_report(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var agentId = req.query.agentId;
    var didNumber = req.query.didNumber;
    var sourceNumber = req.query.sourceNumber;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var filterBy = req.query.filterBy;
    var fromdatetime = new Date();
    var todatetime = new Date();
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (filterBy != undefined) {
      if (filterBy == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      if (filterBy == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (filterBy == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var sql = `SELECT incoming_reports.id,incoming_reports.dtmf_sequence as dtmfSeq,incoming_reports.call_start_time as callStartTime,call_status, incoming_reports.source as sourceNumber, incoming_reports.destination as didNumber, incoming_reports.total_duration as totalDuration,incoming_reports.cr_file as callRecordFile, incoming_reports.app as application, incoming_reports.uniqueid as callUniqueId,user_status,incoming_reports.user_id ,incoming_reports.first_tried_user,incoming_reports.last_tried_user,CONCAT(user.first_name, ' ', user.last_name) AS agentName,`;
    sql += `transfer_reports.tempValue, transfer_reports.destination as transferDestination, transfer_reports.duration as transferDuration, transfer_reports.recordStatus as transferRecordStatus, transfer_reports.recordFile as transferRecordFile, transfer_reports.transferType, departments.name as deptName, CASE WHEN incoming_reports.app = 'user' THEN NULL WHEN incoming_reports.app = 'smartgroup' THEN smart_group.name WHEN incoming_reports.app = 'callflow' THEN call_flow.name END as appName FROM incoming_reports LEFT JOIN transfer_reports ON incoming_reports.uniqueid=transfer_reports.callUniqueId LEFT JOIN departments ON incoming_reports.id_department=departments.id LEFT JOIN smart_group ON incoming_reports.appId = smart_group.id LEFT JOIN call_flow ON incoming_reports.appId = call_flow.id LEFT JOIN user ON incoming_reports.user_id = user.id  WHERE incoming_reports.call_start_time BETWEEN '${Start}' AND '${End}' AND user_status != 'ANSWERED' AND incoming_reports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      sql += `AND incoming_reports.id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND incoming_reports.id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql += `AND incoming_reports.id_department = ${id_department} `;
    }
    if (agentId != undefined) {
      sql += `AND incoming_reports.user_id = '${agentId}' `;
    }
    if (didNumber != undefined) {
      sql += `AND incoming_reports.destination in (${didNumber}) `;
    }
    if (sourceNumber != undefined) {
      sql += `AND (incoming_reports.source like "%${sourceNumber}%" OR incoming_reports.source like "%91${sourceNumber}%" OR incoming_reports.source like "%0${sourceNumber}%") `;
    }
    sql += `ORDER BY incoming_reports.call_start_time DESC `;
    var [result] = await getConnection.query(sql);
    if (result.length != 0) {
      var map_result = Promise.all(
        result.map(async (value) => {
          if (value.user_status == "ANSWERED") {
            var fromdateDateTime = value.callStartTime;
            var cntdate = fromdateDateTime
              .getDate()
              .toString()
              .padStart(2, "0");
            var currentMnth = (fromdateDateTime.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            var year = fromdateDateTime.getFullYear();
            var date = `${year}-${currentMnth}-${cntdate}`;
            value.callRecordFile =
              `${process.env.NODE_PATH}` +
              `callcenter/get_incoming_callrecordings_without_token/` +
              `${value.callRecordFile}.wav/` +
              `${date}/` +
              `${id_user}`;
          } else {
            value.callRecordFile = "";
          }
          return value;
        })
      );
      result = await map_result;
    }

    const sourceNumbers = result.map((entry) => entry.sourceNumber);

     const contact_query = {
  phone_number: { $in: sourceNumbers },
  id_user: id_user,
};
if(isAdmin == 1){
  contact_query.id_department = 0
}
if(isDept == 1){
  contact_query.id_department = Number(req.token.id)
}
if (isSubAdmin == 1) {
  const departmentArray = req.token.id_department.split(',').map(Number); 
  contact_query.id_department = { $in: departmentArray };
}
const projection = {
  name: 1,
  phone_number: 1,
  _id: 0,
};
const contact_data = await contactsModel.find(contact_query, projection).lean();
    const updatedResult = result.map((item) => {
      const match = contact_data.find((entry) =>
        entry.phone_number.includes(item.sourceNumber)
      );
      if (match) {
        return { ...item, contact_name: match.name };
      }
      return item;
    });

         if (req.token.phone_number_masking == 1) {
      var map_result = Promise.all(
        updatedResult.map(async (value) => {
          var sn = await string_encode(value.sourceNumber);
          if (sn) {
            value.sourceNumber = sn;
          }
          return value;
        })
      );
      updatedResult = await map_result;
    }
    res.locals.result = updatedResult;
    res.locals.total = result.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function outgoing_report_csv_report(req, res, next) {
  try {
    var i = 1;
    var isAdmin = req.token.isAdmin
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var agent_id = req.query.user_id;
    var destination = req.query.destination;
    var callerid = req.query.callerid;
    var status = req.query.status;
    var fromDuration = req.query.fromDuration;
    var toDuration = req.query.toDuration;
    var fromTime = req.query.fromTime;
    var toTime = req.query.toTime;
    var filterBy = req.query.filterBy;
    var fromdatetime = new Date();
    var todatetime = new Date();
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (filterBy != undefined) {
      if (filterBy == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      if (filterBy == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (filterBy == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var search = [];
    var sqlCount = `SELECT count(id) as outgoingcall FROM cc_outgoing_reports where  date between '${Start}' and '${End}' AND cc_outgoing_reports.id_user='${id_user}' `;
    var sql = `SELECT cc_outgoing_reports.id,cc_outgoing_reports.app as application,cc_outgoing_reports.call_end_time as call_endtime,cc_outgoing_reports.cost,cc_outgoing_reports.date,cc_outgoing_reports.uniqueid, cc_outgoing_reports.destination,cc_outgoing_reports.callerid, cc_outgoing_reports.callerid, cc_outgoing_reports.duration,cc_outgoing_reports.status as callStatus,cc_outgoing_reports.cr_file as callRecord,cc_outgoing_reports.id_department as deptId,cc_outgoing_reports.total_hold_time hold_time, departments.name as departmentName,CONCAT(user.first_name, ' ', user.last_name) AS userName,user_settings.extNumber FROM cc_outgoing_reports `;
    sql += `LEFT JOIN departments ON cc_outgoing_reports.id_department = departments.id LEFT JOIN user on cc_outgoing_reports.user_id = user.id LEFT JOIN user_settings on user_settings.user_id = cc_outgoing_reports.user_id where cc_outgoing_reports.date between '${Start}' and '${End}' AND cc_outgoing_reports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      sql += `AND cc_outgoing_reports.id_department in(${id_department}) `;
      sqlCount += `AND cc_outgoing_reports.id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND cc_outgoing_reports.id_department = ${req.token.id} `;
      sqlCount += `AND cc_outgoing_reports.id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql += `AND cc_outgoing_reports.id_department = ${id_department} `;
      sqlCount += `AND cc_outgoing_reports.id_department = ${id_department} `;
    }
    if (agent_id != undefined) {
      sqlCount += `and cc_outgoing_reports.user_id like '%${agent_id}%' `;
      sql += `and cc_outgoing_reports.user_id like '%${agent_id}%' `;
    }
    if (destination != undefined) {
      sqlCount += `and cc_outgoing_reports.destination like '%${destination}%' `;
      sql += `and cc_outgoing_reports.destination like '%${destination}%' `;
    }
    if (callerid != undefined) {
      sqlCount += `and cc_outgoing_reports.callerid like '%${callerid}%' `;
      sql += `and cc_outgoing_reports.callerid like '%${callerid}%' `;
    }
    if (status != undefined) {
      if (status == "NO ANSWER") {
        sqlCount += `and (cc_outgoing_reports.status like '%NO ANSWER%' OR cc_outgoing_reports.status LIKE '%NOANSWER%') `;
        sql += `and (cc_outgoing_reports.status like '%NO ANSWER%' OR cc_outgoing_reports.status LIKE '%NOANSWER%') `;
      } else if (status == "ANSWERED") {
        sqlCount += `AND (cc_outgoing_reports.status = '${status}%' OR cc_outgoing_reports.status = 'ANSWER') `;
        sql += `AND (cc_outgoing_reports.status = '${status}' OR cc_outgoing_reports.status = 'ANSWER')`;
      } else {
        sqlCount += `and cc_outgoing_reports.status like '%${status}%' `;
        sql += `and cc_outgoing_reports.status like '%${status}%' `;
      }
    }
    if (fromDuration != undefined && toDuration != undefined) {
      function timeToSeconds(timeString) {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
      }
      var fromDur = timeToSeconds(req.query.fromDuration);
      var toDur = timeToSeconds(req.query.toDuration);
      sqlCount += `and duration between ${fromDur} and ${toDur} `;
      sql += `and duration between ${fromDur} and ${toDur} `;
    }
    if (fromTime != undefined && toTime != undefined) {
      sqlCount += `and TIME(date ) between '${fromTime}' and '${toTime}' `;
      sql += `and TIME(date ) between '${fromTime}' and '${toTime}' `;
    }
    sqlCount += `GROUP BY id `;
    sql += ` order by id desc `;
    var [result] = await getConnection.query(sql);
    var [count] = await getConnection.query(sqlCount);
    if (result.length != 0) {
      var map_result = Promise.all(
        result.map(async (value) => {
          if (value.callStatus == "ANSWER") {
            var fromdateDateTime = value.date;
            var cntdate = fromdateDateTime
              .getDate()
              .toString()
              .padStart(2, "0");
            var currentMnth = (fromdateDateTime.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            var year = fromdateDateTime.getFullYear();
            var date = `${year}-${currentMnth}-${cntdate}`;
            value.callRecord =
              `${process.env.NODE_PATH}` +
              `callcenter/get_outgoing_callrecordings_without_token/` +
              `${value.callRecord}.wav/` +
              `${date}/` +
              `${id_user}`;
          } else {
            value.callRecord = "";
          }
          return value;
        })
      );
      result = await map_result;
    }

    const sourceNumbers = result.map((entry) => entry.destination);


       const contact_query = {
  phone_number: { $in: sourceNumbers },
  id_user: id_user,
};
if(isAdmin == 1){
  contact_query.id_department = 0
}
if(isDept == 1){
  contact_query.id_department = Number(req.token.id)
}
if (isSubAdmin == 1) {
  const departmentArray = req.token.id_department.split(',').map(Number); 
  contact_query.id_department = { $in: departmentArray };
}
const projection = {
  name: 1,
  phone_number: 1,
  _id: 0,
};

    //get disposition and latest comment
    const uniqueIdsArray = result.map(record => record.uniqueid);
    
    const [getDispositionDetails, latestCommentOfContacts] = await Promise.all([
      CallDispositions.find({
        unique_id: { $in: uniqueIdsArray },
      }).populate("disposition"),

      CallTaskComment.aggregate([
        {
          $match: {
            unique_id: { $in: uniqueIdsArray },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: "$unique_id",
            latestComment: { $first: "$comment" },
            latestCommentAt: { $first: "$createdAt" },
          },
        },
      ]),
    ]);

    //disposition
    const dispositionLookUp = getDispositionDetails.reduce((acc, item) => {
      acc[item.unique_id] = {
        disposition: item.disposition?.name || "",
      };
      return acc;
    }, {});


    //comments
    const latestCommentMap = latestCommentOfContacts.reduce((acc, item) => {
      acc[item._id] = item.latestComment ?? "";
      return acc;
    }, {});


const contact_data = await contactsModel.find(contact_query, projection).lean();
    const updatedResult = result.map((item) => {
      
      //disposition
      item.disposition = dispositionLookUp[item.uniqueid]?.disposition || "";
      //comment
      item.latestComment = latestCommentMap[item.uniqueid] || "";

      
      const match = contact_data.find((entry) =>
        entry.phone_number.includes(item.destination)
      );
      if (match) {
        return { ...item, contact_name: match.name };
      }
      return item;
    });

        if (req.token.phone_number_masking == 1) {
      var map_result = Promise.all(
        updatedResult.map(async (value) => {
          var val_dest = await string_encode(value.destination);
          if (val_dest) {
            value.destination = val_dest;
          }
          return value;
        })
      );
      updatedResult = await map_result;
    }
    res.locals.result = updatedResult;
    res.locals.count = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_duration(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var id_agent = req.token.id;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
    var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    var startDate = `SELECT startDate FROM user_activities WHERE startDate BETWEEN '${Start}' AND '${End}' and user_id = '${id_agent}' ORDER BY id DESC LIMIT 1`;
    var [startDateRes] = await getConnection.query(startDate);
    var sql = `SELECT duration FROM user_sessions WHERE startDate BETWEEN '${Start}' AND '${End}' and user_id = '${id_agent}' and id_user = '${id_user}' and id_break = '1' `;
    var [result] = await getConnection.query(sql);
    if (result.length != 0) {
      var timeDataSeconds = result.map((obj) => {
        var hours = parseInt(obj.duration.split(":")[0]);
        var minutes = parseInt(obj.duration.split(":")[1]);
        var seconds = parseInt(obj.duration.split(":")[2]);
        return hours * 3600 + minutes * 60 + seconds;
      });
      var totalSeconds = timeDataSeconds.reduce((acc, val) => acc + val, 0);
      var value = {
        seconds: totalSeconds,
        date: startDateRes[0].startDate,
      };
      res.locals.result = value;
    } else {
      var date1 = new Date(startDateRes[0].startDate);
      var date2 = new Date();
      // if (date2 < date1) {
      //     date2.setDate(date2.getDate() + 1);
      // }
      if (date2 < date1) {
        date2 = date1;
        console.log("current time1 : ", date2);
      }
      var diff = date2 - date1;
      var msec = diff;
      var seconds = msec / 1000;
      var value = {
        seconds: seconds,
        date: date1,
      };
      res.locals.result = value;
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function agent_activities_for_admin(req, res, next) {
  try {
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var agent = req.query.agentId;
    if (agent != undefined) {
      var agentArray = agent.split(",");
    }
    var date = new Date();
    // var dd = date.getDate();
    // var mm = date.getMonth() + 1
    var dd = date.getDate().toString().padStart(2, "0");
    var mm = (date.getMonth() + 1).toString().padStart(2, "0");
    var yyyy = date.getFullYear();
    var today = `${yyyy}-${mm}-${dd} `;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var department_id = req.query.department_id;
    var dateRangeFrom = `${yyyy}-${mm}-${dd} `;
    var dateRangeTo = `${yyyy}-${mm}-${dd} `;
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
      dateRangeFrom = fromDate;
      dateRangeTo = toDate;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
      dateRangeFrom = fromDate;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
      dateRangeTo = toDate;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var sql = `SELECT agentQuery.id as agentId,CONCAT(agentQuery.first_name, ' ', agentQuery.last_name) AS name,extNumber as regNumber,username,departments.name as departmentName,GROUP_CONCAT(DISTINCT firstLoginsubquery.startDate ORDER BY firstLoginsubquery.startDate asc) as firstLoginTime,GROUP_CONCAT(DISTINCT logoutsubquery.startDate ORDER BY logoutsubquery.startDate asc) AS lastLogoutTime,GROUP_CONCAT(DISTINCT totalDurationsubquery.totalDuration,"_",totalDurationsubquery.date) as totalavailableDuration,GROUP_CONCAT(DISTINCT totalSpecialBreakDuration.duration,"_",totalSpecialBreakDuration.startDate,'_',totalSpecialBreakDuration.id_break) as totalSpecialBreakDuration  FROM user AS agentQuery JOIN user_settings ON user_settings.user_id = agentQuery.id JOIN user_live_data ON user_live_data.user_id = agentQuery.id `;
    if (agent != undefined) {
      sql = `SELECT agentQuery.id as agentId,CONCAT(agentQuery.first_name, ' ', agentQuery.last_name) AS name,extNumber as regNumber,departments.name as departmentName,GROUP_CONCAT(DISTINCT firstLoginsubquery.startDate) as firstLoginTime,GROUP_CONCAT(DISTINCT logoutsubquery.startDate) AS lastLogoutTime,GROUP_CONCAT(DISTINCT totalDurationsubquery.totalDuration,"_",totalDurationsubquery.date) as totalavailableDuration,GROUP_CONCAT(DISTINCT  totalSpecialBreakDuration.duration,"_",totalSpecialBreakDuration.startDate,'_',totalSpecialBreakDuration.id_break) as totalSpecialBreakDuration FROM user AS agentQuery JOIN user_settings ON user_settings.user_id = agentQuery.id JOIN user_live_data ON user_live_data.user_id = agentQuery.id `;
    }

    var firstLogin = `LEFT JOIN (SELECT MIN(user_activities.startDate) AS startDate,user_id as id_agent FROM user_activities WHERE  user_activities.break_name = 'Available' and user_activities.startDate BETWEEN '${Start}' AND '${End}' AND user_activities.id_user = '${id_user}' GROUP BY user_id,DATE(user_activities.startDate)) AS firstLoginsubquery ON agentQuery.id = firstLoginsubquery.id_agent `;
    if (agent != undefined) {
      firstLogin += `and firstLoginsubquery.id_agent in(${agentArray}) `;
    }
    var lastLogin = `LEFT JOIN (SELECT MAX(user_activities.startDate) AS startDate,user_id as id_agent FROM user_activities WHERE user_activities.break_name = 'Logout' and user_activities.startDate BETWEEN '${Start}' AND '${End}' AND user_activities.id_user = '${id_user}' GROUP BY user_id,DATE(user_activities.startDate) ) AS logoutsubquery ON agentQuery.id = logoutsubquery.id_agent `;
    if (agent != undefined) {
      lastLogin += `and logoutsubquery.id_agent in(${agentArray}) `;
    }
    var totalDuration = `LEFT JOIN (SELECT SEC_TO_TIME(SUM(TIME_TO_SEC(duration))) as totalDuration,DATE(user_sessions.startDate) as date,user_id as id_agent FROM user_sessions WHERE user_sessions.id_break='1' AND user_sessions.startDate BETWEEN '${Start}' AND '${End}' AND user_sessions.id_user = '${id_user}' GROUP BY user_id,DATE(user_sessions.startDate))  AS totalDurationsubquery ON agentQuery.id = totalDurationsubquery.id_agent `;
    if (agent != undefined) {
      totalDuration += `and totalDurationsubquery.id_agent in(${agentArray}) `;
    }

    var totalSpecialBreakDuration = `LEFT JOIN (SELECT SUM(time_to_sec(timediff(user_sessions.endDate, user_sessions.startDate))) as duration,user_sessions.startDate as startDate,id_break,user_id as id_agent FROM user_sessions WHERE user_sessions.startDate BETWEEN '${Start}' AND '${End}' AND user_sessions.id_break!='1' AND user_sessions.break_type='0' AND user_sessions.id_user = '${id_user}' GROUP BY user_id,DATE(user_sessions.startDate),id_break ) as totalSpecialBreakDuration ON agentQuery.id = totalSpecialBreakDuration.id_agent `;
    if (agent != undefined) {
      totalSpecialBreakDuration += `and totalSpecialBreakDuration.id_agent in(${agentArray}) `;
    }
    sql += firstLogin;
    sql += lastLogin;
    sql += totalDuration;
    sql += totalSpecialBreakDuration;
    sql += `left JOIN departments on agentQuery.id_department = departments.id where agentQuery.id_user = '${id_user}' and is_agent = '1' `;
    if (isSubAdmin == 1) {
      sql += `  and id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `  and id_department = ${req.token.id} `;
    }
    if (department_id != undefined) {
      sql += `and id_department = ${department_id} `;
    }
    if (agent != undefined) {
      sql += `and agentQuery.id in(${agentArray}) GROUP BY agentId `;
    }
    if (agent == undefined) {
      sql += `GROUP BY agentQuery.id `;
    }
    var [result] = await getConnection.query(sql);
    var totalBreak = `SELECT SUM(time_to_sec(timediff(user_sessions.endDate, user_sessions.startDate))) as duration,user_sessions.startDate as startDate,id_break,user_id as id_agent FROM user_sessions WHERE user_sessions.startDate BETWEEN '${Start}' AND '${End}' AND user_sessions.id_break NOT IN (1,2) AND user_sessions.break_type='3' AND id_user = '${id_user}'  `;
    if (isSubAdmin == 1) {
      totalBreak += `AND id_department in(${id_department}) `;
    } else if (isDept == 1) {
      totalBreak += `AND id_department = '${req.token.id}' `;
    }
    totalBreak += `GROUP BY user_id,DATE(user_sessions.startDate),id_break`;
    var [breakDurationUnderscoreSplit] = await getConnection.query(totalBreak);

    var outgoingReportsSql = `SELECT user_id as id_agent, DATE_FORMAT(date, '%Y-%m-%d') AS date, status as callStatus, SUM(duration) as outboundDuration, COUNT(*) as calls,SUM(total_hold_time) as holdDuration FROM cc_outgoing_reports WHERE date BETWEEN '${Start}' AND '${End}' AND id_user='${id_user}' AND ((status = 'ANSWER' OR status = 'ANSWERED') OR (status != 'ANSWER' OR status != 'ANSWERED')) `;
    if (isSubAdmin == 1) {
      outgoingReportsSql += ` AND id_department in(${id_department}) `;
    } else if (isDept == 1) {
      outgoingReportsSql += ` AND id_department='${req.token.id}' `;
    }
    outgoingReportsSql += `GROUP BY user_id, (status = 'ANSWER' OR status = 'ANSWERED'),DATE(date)`;
    var [outgoingReports] = await getConnection.query(outgoingReportsSql);

    var campaignCount = `SELECT user_id as id_agent,duration,callStatus,callerid,call_start_time,hold_time FROM cc_campaign_outgoing_reports where createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
    if (isSubAdmin == 1) {
      campaignCount += `and cc_campaign_outgoing_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      campaignCount += `and cc_campaign_outgoing_reports.id_department = '${req.token.id}' `;
    }
    var [campaign_outgoingCount] = await getConnection.query(campaignCount);

    var campaignSummeryCount = `SELECT id, id_user, id_department, user_id as agent_id, regNumber,createdAt, campaign_id,sum(ACW) as acw,sum(total_duration) as total_duration , call_delay,sum(hold_time) as hold_time FROM cc_campaign_call_summary WHERE createdAt between '${Start}' and '${End}' and cc_campaign_call_summary.id_user = '${id_user}' `;
    if (isSubAdmin == 1) {
      campaignSummeryCount += `and cc_campaign_call_summary.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      campaignSummeryCount += `and cc_campaign_call_summary.id_department = '${req.token.id}' `;
    }
    var [campaignSummeryRes] = await getConnection.query(campaignSummeryCount);

    var outgoingAcwReportSql = `SELECT user_id as id_agent, DATE_FORMAT(date, '%Y-%m-%d') AS date ,status as callStatus,SUM(acw) as totalACW FROM cc_outgoing_reports WHERE date BETWEEN '${Start} ' AND '${End}'  AND id_user ='${id_user}' `;
    if (isSubAdmin == 1) {
      outgoingAcwReportSql += ` AND id_department in(${id_department}) `;
    } else if (isDept == 1) {
      outgoingAcwReportSql += ` AND id_department ='${req.token.id}' `;
    }
    outgoingAcwReportSql += `GROUP BY user_id,DATE(date)`;
    var [outgoingAcwReport] = await getConnection.query(outgoingAcwReportSql);
    var incomingReportsSql = `SELECT GROUP_CONCAT(user.id) as agentId,incoming_reports.user_id as agents_list, DATE_FORMAT(incoming_reports.call_start_time, '%Y-%m-%d') AS date, user_status as agentStatus, SUM(connected_duration) as inboundDuration,COUNT(*) as calls,SUM(total_hold_time) as holdDuration FROM incoming_reports JOIN user ON FIND_IN_SET(user.id,incoming_reports.user_id) > 0 WHERE incoming_reports.call_start_time BETWEEN '${Start} ' AND '${End}' AND incoming_reports.id_user='${id_user}' AND (user_status='ANSWERED' OR user_status!='ANSWERED') and app != 'smartgroup' `;
    if (isSubAdmin == 1) {
      incomingReportsSql += ` AND incoming_reports.id_department in(${id_department}) `;
    } else if (isDept == 1) {
      incomingReportsSql += ` AND incoming_reports.id_department='${req.token.id}' `;
    }
    incomingReportsSql += `GROUP BY user_id, user_status,DATE(incoming_reports.call_start_time ),incoming_reports.id`;
    var [incomingReports] = await getConnection.query(incomingReportsSql);

    var incomingMissedReportsSql = `SELECT GROUP_CONCAT(user.id) as agentId,incoming_reports.user_id AS agents_list, DATE_FORMAT(incoming_reports.call_start_time, '%Y-%m-%d') AS date, user_status as agentStatus, SUM(connected_duration) as inboundDuration,COUNT(*) as calls,SUM(total_hold_time) as holdDuration FROM incoming_reports JOIN user ON FIND_IN_SET(user.id,incoming_reports.user_id) > 0 WHERE incoming_reports.call_start_time BETWEEN '${Start} ' AND '${End}' AND incoming_reports.id_user='${id_user}' AND user_status !='ANSWERED' and app != 'smartgroup' `;
    if (isSubAdmin == 1) {
      incomingMissedReportsSql += ` AND incoming_reports.id_department in(${id_department}) `;
    } else if (isDept == 1) {
      incomingMissedReportsSql += ` AND incoming_reports.id_department='${req.token.id}' `;
    }
    incomingMissedReportsSql += `GROUP BY user_id, user_status,DATE(incoming_reports.call_start_time),incoming_reports.id`;
    var [incomingMissedReports] = await getConnection.query(
      incomingMissedReportsSql
    );
    var smartgroupAnsweredCalls = await smartGroupReport.find({
      eventStatus: "dial_answered",
      isCallFlow: { $exists: false },
      event: "start",
      eventTime: { $gte: Start, $lte: End },
    });
    var smartgroupMissedCalls = await smartGroupReport.find({
      event: "start",
      isCallFlow: { $exists: false },
      eventStatus: { $ne: "dial_answered" },
      eventTime: { $gte: Start, $lte: End },
    });
    var incomingEmptyReportsSql = `SELECT GROUP_CONCAT(user.id) as agentId,incoming_reports.user_id as first_tried_agent, DATE_FORMAT(incoming_reports.call_start_time, '%Y-%m-%d') AS date,user_status as agentStatus, SUM(connected_duration) as inboundDuration,COUNT(*) as calls,SUM(total_hold_time) as holdDuration FROM incoming_reports JOIN user ON FIND_IN_SET(user.id,incoming_reports.user_id) > 0 WHERE incoming_reports.call_start_time BETWEEN '${Start} ' AND '${End}' AND incoming_reports.id_user='${id_user}' AND  user_status  ='' `;
    if (isSubAdmin == 1) {
      incomingEmptyReportsSql += ` AND incoming_reports.id_department in(${id_department}) `;
    } else if (isDept == 1) {
      incomingEmptyReportsSql += ` AND incoming_reports.id_department='${req.token.id}' `;
    }
    incomingEmptyReportsSql += `GROUP BY user_id, user_status,DATE(incoming_reports.call_start_time),incoming_reports.id`;
    var [incomingEmptyReports] = await getConnection.query(
      incomingEmptyReportsSql
    );

    var incomingAcwReportSql = `SELECT user_id as answeredAgent, DATE_FORMAT(incoming_reports.call_start_time , '%Y-%m-%d') AS call_start_time,SUM(acw) as totalACW FROM incoming_reports WHERE incoming_reports.call_start_time BETWEEN '${Start} ' AND '${End}' and call_connected_time != 0 AND id_user ='${id_user}' `;
    if (isSubAdmin == 1) {
      incomingAcwReportSql += ` AND id_department in(${id_department}) `;
    } else if (isDept == 1) {
      incomingAcwReportSql += ` AND id_department ='${req.token.id}' `;
    }
    incomingAcwReportSql += `GROUP BY user_id,DATE(incoming_reports.call_start_time)`;
    var [incomingAcwReport] = await getConnection.query(incomingAcwReportSql);
    var dates = getAllDates(dateRangeFrom, dateRangeTo);
    var output = [];
    if (result.length != 0) {
      result.map((data) => {
        var agentData = {
          agentId: data.agentId,
          agent_name: data.name,
          username: data.username,
          registration_name: data.regNumber,
          departmentName: data.departmentName,
          activity: [],
        };
        if (data.totalavailableDuration != null) {
          var totalavailableDurationCommaSplit =
            data.totalavailableDuration.split(",");
          var totalavailableDurationUnderscoreSplit =
            totalavailableDurationCommaSplit.map((availableDuration) => {
              var re = availableDuration.split("_");
              return { date: re[1], duration: re[0] };
            });
        }
        if (data.totalBreakDuration != null) {
          var totalBreakDurationCommaSplit = data.totalBreakDuration.split(",");
          var totalBreakDurationUnderscoreSplit =
            totalBreakDurationCommaSplit.map((totalBreakDuration) => {
              var re = totalBreakDuration.split("_");
              return { date: re[1], duration: re[0] };
            });
        }
        if (data.totalSpecialBreakDuration != null) {
          var totalSpecialBreakDurationCommaSplit =
            data.totalSpecialBreakDuration.split(",");
          var totalSpecialBreakDurationUnderscoreSplit =
            totalSpecialBreakDurationCommaSplit.map((breakDuration) => {
              var re = breakDuration.split("_");
              return { date: re[1], duration: re[0], id_break: re[2] };
            });
        }
        if (data.lastLogoutTime != null) {
          var lastLogoutSplit = data.lastLogoutTime.split(",");
        }
        if (data.firstLoginTime != null) {
          var firstLoginSplit = data.firstLoginTime.split(",");
          firstLoginSplit.map((log) => {
            var currentDate = convert_date(log);
            if (lastLogoutSplit != undefined) {
              var lastlogout = undefined;
              lastLogoutSplit.map((logout) => {
                var logoutDate = convert_date(logout);
                if (currentDate == logoutDate) {
                  lastlogout = logout;
                }
              });
            }
            var totalAvailableDuration = 0;
            if (totalavailableDurationUnderscoreSplit != undefined) {
              totalavailableDurationUnderscoreSplit.map((duration) => {
                if (currentDate == duration.date) {
                  totalAvailableDuration = duration.duration;
                }
              });
            }
            var totalBreakDuration = 0;
            var breaksDuration = [];
            if (breakDurationUnderscoreSplit.length != 0) {
              var breaksDurationArray = breakDurationUnderscoreSplit.map(
                (breaks) => {
                  if (agentData.agentId == breaks.id_agent) {
                    var dateVal = convert_date(breaks.startDate);
                    if (currentDate == dateVal) {
                      totalBreakDuration += Number(breaks.duration);
                      return {
                        duration: breaks.duration,
                        id_break: breaks.id_break,
                      };
                    }
                  }
                }
              );
              var breaksDuration = breaksDurationArray.filter(function (value) {
                return value !== undefined;
              });
            }
            var totalSpecialbreakDuration = 0;
            if (totalSpecialBreakDurationUnderscoreSplit != undefined) {
              totalSpecialBreakDurationUnderscoreSplit.map((duration) => {
                if (currentDate == convert_date(duration.date)) {
                  totalSpecialbreakDuration += Number(duration.duration);
                  breaksDuration.push({
                    duration: duration.duration,
                    id_break: duration.id_break,
                  });
                }
              });
            }
            var totalOutgoingDuration = 0;
            var answeredOutgoing = 0;
            var totalHoldTime = 0;
            var totalOutgoingCall = 0;
            var total_Talk_Time = 0;
            var totalAcw = 0;
            if (outgoingReports.length != 0) {
              outgoingReports.map((outgoing) => {
                var outdate = convert_date(outgoing.date);
                if (
                  currentDate == outdate &&
                  agentData.agentId == outgoing.id_agent
                ) {
                  totalOutgoingDuration =
                    totalOutgoingDuration + Number(outgoing.outboundDuration);
                  if (
                    outgoing.callStatus == "ANSWERED" ||
                    outgoing.callStatus == "ANSWER"
                  ) {
                    answeredOutgoing += outgoing.calls;
                  }
                  totalHoldTime += Number(outgoing.holdDuration);
                  totalOutgoingCall += Number(outgoing.calls);
                }
              });
            }
            if (campaign_outgoingCount.length != 0) {
              campaign_outgoingCount.map((outgoing) => {
                var outdate = convert_date(outgoing.call_start_time);
                if (
                  currentDate == outdate &&
                  agentData.agentId == outgoing.id_agent
                ) {
                  totalOutgoingDuration += Number(outgoing.duration);
                  if (outgoing.callStatus == "ANSWER") {
                    answeredOutgoing += 1;
                  }
                  totalHoldTime += Number(outgoing.hold_time);
                  totalOutgoingCall += 1;
                }
              });
            }
            if (campaignSummeryRes.length != 0) {
              campaignSummeryRes.map((outgoing) => {
                var outdate = convert_date(outgoing.createdAt);
                if (
                  currentDate == outdate &&
                  agentData.agentId == outgoing.agent_id
                ) {
                  totalOutgoingDuration += Number(outgoing.total_duration);
                  totalHoldTime += Number(outgoing.hold_time);
                  var incomingAcw = Math.abs(outgoing.ACW);
                  totalAcw += Number(incomingAcw);
                }
              });
            }
            total_Talk_Time += totalOutgoingDuration;
            var totalCalls = 0;
            var totalIncomingCall = 0;
            var answeredIncoming = 0;
            var totalMissedCalls = 0;
            var totalIncomingDuration = 0;

            if (incomingReports.length != 0) {
              incomingReports.map((incoming) => {
                var indate = convert_date(incoming.date);
                if (currentDate == indate) {
                  if (incoming.agentStatus == "ANSWERED") {
                    if (incoming.agents_list == agentData.agentId) {
                      answeredIncoming += 1;
                      totalIncomingCall += 1;
                      totalIncomingDuration += Number(incoming.inboundDuration);
                      totalHoldTime += Number(incoming.holdDuration);
                    }
                  }
                  totalCalls = totalIncomingCall;
                }
              });
            }
            if (smartgroupAnsweredCalls.length != 0) {
              smartgroupAnsweredCalls.map((incoming) => {
                var indate = convert_date(incoming.eventTime);
                if (currentDate == indate) {
                  if (incoming.userId == agentData.agentId) {
                    answeredIncoming += 1;
                    totalIncomingCall += 1;
                  }
                }
                totalCalls = totalIncomingCall;
              });
            }
            if (incomingMissedReports.length != 0) {
              incomingMissedReports.map((incoming) => {
                var indate = convert_date(incoming.date);
                if (currentDate == indate) {
                  if (
                    incoming.agentStatus != "ANSWERED" &&
                    incoming.agentStatus != ""
                  ) {
                    if (incoming.agents_list == agentData.agentId) {
                      totalMissedCalls += 1;
                      totalIncomingCall += 1;
                      totalHoldTime += Number(incoming.holdDuration);
                    }
                  }
                  totalCalls = totalIncomingCall;
                }
              });
            }
            if (smartgroupMissedCalls.length != 0) {
              smartgroupMissedCalls.map((incoming) => {
                var indate = convert_date(incoming.eventTime);
                if (currentDate == indate) {
                  if (Number(incoming.smartGroupUserId) == agentData.agentId) {
                    totalMissedCalls += 1;
                    totalIncomingCall += 1;
                  }
                  totalCalls = totalIncomingCall;
                }
              });
            }
            if (incomingEmptyReports.length != 0) {
              incomingEmptyReports.map((incoming) => {
                var indate = convert_date(incoming.date);
                if (currentDate == indate) {
                  if (incoming.agentStatus == "") {
                    if (incoming.agentId == agentData.agentId) {
                      totalMissedCalls += 1;
                      totalIncomingCall += 1;
                      totalHoldTime += Number(incoming.holdDuration);
                    }
                  }
                  if (incoming.agentStatus == "CHANUNAVAIL") {
                    if (incoming.agentId == agentData.agentId) {
                      totalMissedCalls += 1;
                      totalIncomingCall += 1;
                      totalHoldTime += Number(incoming.holdDuration);
                    }
                  }
                  totalCalls = totalIncomingCall;
                }
              });
            }
            if (outgoingAcwReport.length != 0) {
              outgoingAcwReport.map((outgoingAcw) => {
                var outgoingAcwdate = convert_date(outgoingAcw.date);
                if (
                  currentDate == outgoingAcwdate &&
                  agentData.agentId == outgoingAcw.id_agent
                ) {
                  var outgoingAcw = Math.abs(outgoingAcw.totalACW);
                  totalAcw += Number(outgoingAcw);
                }
              });
            }
            if (incomingAcwReport.length != 0) {
              incomingAcwReport.map((incoming) => {
                var incomingdate = convert_date(incoming.call_start_time);
                if (
                  currentDate == incomingdate &&
                  agentData.agentId == incoming.answeredAgent
                ) {
                  var incomingAcw = Math.abs(incoming.totalACW);
                  totalAcw += Number(incomingAcw);
                }
              });
            }
            var total_Talk_Time = totalIncomingDuration + totalOutgoingDuration;
            if (totalAvailableDuration != 0) {
              var [hours, minutes, seconds] = totalAvailableDuration
                .split(":")
                .map(Number);
              var totalSeconds = hours * 3600 + minutes * 60 + seconds;
              if (totalBreakDuration <= totalSeconds) {
                var wrkingDuration = totalSeconds - totalBreakDuration;
              } else {
                var wrkingDuration = totalBreakDuration - totalSeconds;
              }
              var idle_Time = Math.abs(wrkingDuration - total_Talk_Time);
            }
            var numberOfCallsHandled = answeredOutgoing + answeredIncoming;
            if (numberOfCallsHandled != 0) {
              var averageCallHandlingTimePlus =
                total_Talk_Time + Number(totalHoldTime) + Number(totalAcw);
              var averageCallHandlingTimeFix =
                averageCallHandlingTimePlus / numberOfCallsHandled;
              if (isNaN(averageCallHandlingTimeFix)) {
                var averageCallHandlingTime = 0;
              } else {
                var averageCallHandlingTime =
                  averageCallHandlingTimeFix.toFixed(2);
              }
            }
            if (totalCalls == 0) totalCalls = undefined;
            if (totalIncomingCall == 0) totalIncomingCall = undefined;
            if (answeredIncoming == 0) answeredIncoming = undefined;
            if (totalIncomingDuration == 0) totalIncomingDuration = undefined;
            if (totalOutgoingDuration == 0) totalOutgoingDuration = undefined;
            if (answeredOutgoing == 0) answeredOutgoing = undefined;
            if (totalMissedCalls == 0) totalMissedCalls = undefined;
            if (totalHoldTime == 0) totalHoldTime = undefined;
            if (totalOutgoingCall == 0) totalOutgoingCall = undefined;
            if (totalAcw == 0) totalAcw = undefined;
            if (breaksDuration.length == 0) breaksDuration = undefined;
            var activity = {
              firstLoginTime: log,
              lastLogoutTime: lastlogout,
              availableDuration: totalAvailableDuration,
              totalBreakTime: totalBreakDuration,
              breakType: breaksDuration,
              totalSpecialbreakDuration: totalSpecialbreakDuration,
              outgoing: totalOutgoingCall,
              answeredOutgoing: answeredOutgoing,
              outgoingDuration: totalOutgoingDuration,
              totalHoldTime: totalHoldTime,
              totalIncomingCalls: totalIncomingCall,
              totalMissedCalls: totalMissedCalls,
              totalCalls: totalCalls,
              answeredIncoming: answeredIncoming,
              incomingDuration: totalIncomingDuration,
              totalACW: totalAcw,
              idleTime: idle_Time,
              totalTalkTime: total_Talk_Time,
              numberOfCallsHandled: numberOfCallsHandled,
              averageCallHandlingTime: averageCallHandlingTime,
            };
            agentData.activity.push(activity);
          });
        }
        output.push(agentData);
      });
      res.locals.result = output;
    } else {
      res.locals.result = [];
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
function convert_date(date) {
  date = new Date(date);
  var dd = String(date.getDate()).padStart(2, "0");
  var mm = String(date.getMonth() + 1).padStart(2, "0");
  var yyyy = date.getFullYear();
  var covertedDate = `${yyyy}-${mm}-${dd}`;
  return covertedDate;
}
function getAllDates(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    dates.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
async function agent_monitoring(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var agentName = req.query.name;
    var department_id = req.query.department_id;
    var date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var time = hours + ":" + minutes + ":" + seconds;
    var today = `${yyyy}-${mm}-${dd}`;
    var presentTime = `${yyyy}-${mm}-${dd} ${time}`;
    if (process.env.PROJECT_NAME == "innovation") {
      const now = new Date();
      const dubaiOffset = 4 * 60; // Dubai time zone offset in minutes (UTC+4)
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000; // Convert to UTC time
      const dubaiTime = utcTime + dubaiOffset * 60000; // Convert to Dubai time
      var updated_date = new Date(dubaiTime);
    } else {
      var updated_date = new Date();
    }
    updated_date.setHours(updated_date.getHours() - 1);
    const year = updated_date.getFullYear();
    const month = String(updated_date.getMonth() + 1).padStart(2, "0");
    const day = String(updated_date.getDate()).padStart(2, "0");
    const hours1 = String(updated_date.getHours()).padStart(2, "0");
    const minutes1 = String(updated_date.getMinutes()).padStart(2, "0");
    const seconds1 = String(updated_date.getSeconds()).padStart(2, "0");

    const pastTime = `${year}-${month}-${day} ${hours1}:${minutes1}:${seconds1}`;
    updated_date.setHours(updated_date.getHours() - 2);
    const hours2 = String(updated_date.getHours()).padStart(2, "0");
    const minutes2 = String(updated_date.getMinutes()).padStart(2, "0");
    const seconds2 = String(updated_date.getSeconds()).padStart(2, "0");
    const past2Hours = `${year}-${month}-${day} ${hours2}:${minutes2}:${seconds2}`;
    var sql = `SELECT user.id as agentId, user.id_user,user.id_department, CONCAT(user.first_name, ' ', user.last_name) AS name , regNumber as agentRegNumber, currentBreakId as breakId, currentBreakName as breakName, currentBreakStartDate as sessionStartDate, currentCallStatus, currentCallAnsTime, lastCallEndTime, loginStartTime,currentSessionId,(select count(id) from user_sessions where session_id = currentSessionId ) as sessionCount,(select SUM(TIME_TO_SEC(duration)) from user_sessions where session_id = currentSessionId ) as sessionDuration FROM user JOIN user_settings ON user.id = user_settings.user_id JOIN user_live_data ON user_live_data.user_id = user.id where is_agent = 1 AND user.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      sql += `AND user.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND user.id_department='${req.token.id}' `;
    }
    if (agentName != undefined) {
      sql += `AND LOWER(CONCAT(user.first_name, ' ', user.last_name)) LIKE "%${agentName}%" `;
    }
    if (department_id != undefined) {
      sql += `and user.id_department like "%${department_id}%" `;
    }
    sql += `order by instr(breakName, 'Available') desc `;
    var [result] = await getConnection.query(sql);
    var lastLgoutTimeSql = `SELECT user_id as id_agent,MAX(startDate) as startDate FROM user_activities WHERE break_name = 'Logout' AND id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      lastLgoutTimeSql += `AND id_department in (${id_department}) `;
    } else if (isDept == 1) {
      lastLgoutTimeSql += `AND id_department='${req.token.id}' `;
    }
    lastLgoutTimeSql += `GROUP BY user_id `;
    var [lastLogoutTime] = await getConnection.query(lastLgoutTimeSql);
    var totalDurationSql = `SELECT SEC_TO_TIME(SUM(TIME_TO_SEC(duration))) as totalDuration,DATE(user_sessions.startDate) as date,user_id as agentId,max(startDate) as sessionStartDate,max(endDate) as sessionEndDate,(SELECT duration FROM user_sessions WHERE  user_id = agentId ORDER BY startDate DESC LIMIT 1 ) as lastSessionDuration FROM user_sessions WHERE  user_sessions.startDate BETWEEN '${today} 00:00:00' AND '${today} 23:59:59' AND id_user = '${id_user}' GROUP BY user_id,DATE(user_sessions.startDate) `;
    var [totalDuration] = await getConnection.query(totalDurationSql);
    var presentDayCallsSql = `SELECT user_id as id_agent, status as callStatus,MAX(date) as date, COUNT(*) as calls FROM cc_outgoing_reports WHERE date BETWEEN '${today} 00:00:00' AND '${today} 23:59:59' AND (status='ANSWERED' OR status!='ANSWERED') AND id_user='${id_user}'`;
    if (isSubAdmin == 1) {
      presentDayCallsSql += `AND id_department in (${id_department}) and id_user = ${id_user} `;
    } else if (isDept == 1) {
      presentDayCallsSql += `AND id_department='${req.token.id}' `;
    }
    presentDayCallsSql += `GROUP BY user_id, status ORDER by MAX(date)`;
    var [presentDayCalls] = await getConnection.query(presentDayCallsSql);
    var lastHourCallsSql = `SELECT user_id as id_agent,status as callStatus,date, COUNT(*) as calls FROM cc_outgoing_reports WHERE date BETWEEN '${pastTime}' AND '${presentTime}' AND (status='ANSWERED' OR status!='ANSWERED') AND id_user='${id_user}'`;
    if (isSubAdmin == 1) {
      lastHourCallsSql += `AND id_department in (${id_department}) and id_user = ${id_user} `;
    } else if (isDept == 1) {
      lastHourCallsSql += `AND id_department='${req.token.id}' `;
    }
    lastHourCallsSql += `GROUP BY user_id, status`;
    var [lastHourCalls] = await getConnection.query(lastHourCallsSql);

    var presentDayCallsSqlIncoming = `SELECT user_id as agents_list,user_status as callStatus,call_start_time as callStartTime, 1 as calls,user_status as agentStatus,connected_user as answeredAgent FROM incoming_reports WHERE call_start_time BETWEEN '${today} 00:00:00' AND '${today} 23:59:59' AND incoming_reports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      presentDayCallsSqlIncoming += `AND incoming_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      presentDayCallsSqlIncoming += `AND incoming_reports.id_department='${req.token.id}' `;
    }
    presentDayCallsSqlIncoming += `ORDER BY call_start_time asc`;
    var [presentDayCallsIncoming] = await getConnection.query(
      presentDayCallsSqlIncoming
    );

    var lastHourCallsSqlIncoming = `SELECT user_id as agents_list,user_status as callStatus,call_start_time as callStartTime, COUNT(*) as calls,user_status as agentStatus,connected_user as answeredAgent FROM incoming_reports  WHERE call_start_time BETWEEN '${pastTime}' AND '${presentTime}' AND incoming_reports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      lastHourCallsSqlIncoming += `AND incoming_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      lastHourCallsSqlIncoming += `AND incoming_reports.id_department ='${req.token.id}' `;
    }
    lastHourCallsSqlIncoming += `GROUP BY user_id`;
    var [lastHourCallsIncoming] = await getConnection.query(
      lastHourCallsSqlIncoming
    );

    var breakCountsQuery = `select count(currentBreakId) as totalBreaks,currentBreakId as id_break from user_live_data WHERE loginStartTime  BETWEEN '${today} 00:00:00' AND '${today} 23:59:59' `;
    breakCountsQuery += `group by currentBreakId`;
    var [breakCounts] = await getConnection.query(breakCountsQuery);
    // campaign last hour call count
    var campaign_lastHourCallsSql = `select user_id as id_agent,callStatus,call_start_time, COUNT(*) as calls FROM cc_campaign_outgoing_reports  WHERE call_start_time BETWEEN '${pastTime}' AND '${presentTime}' AND id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      campaign_lastHourCallsSql += `AND id_department in (${id_department}) `;
    } else if (isDept == 1) {
      campaign_lastHourCallsSql += `AND id_department='${req.token.id}' `;
    }
    campaign_lastHourCallsSql += ` GROUP BY user_id`;
    var [campaign_lastHourCalls] = await getConnection.query(
      campaign_lastHourCallsSql
    );
    // campaign today call count
    var campaign_presentDayCallsSql = `SELECT user_id as id_agent,callStatus,call_start_time, 1 as calls FROM cc_campaign_outgoing_reports WHERE call_start_time BETWEEN '${today} 00:00:00' AND '${today} 23:59:59' AND id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      campaign_presentDayCallsSql += `AND id_department in (${id_department}) `;
    } else if (isDept == 1) {
      campaign_presentDayCallsSql += `AND id_department='${req.token.id}' `;
    }
    campaign_presentDayCallsSql += `ORDER BY call_start_time asc`;
    var [campaign_presentDayCalls] = await getConnection.query(
      campaign_presentDayCallsSql
    );

    var output = [];
    if (result.length != 0) {
      result.map((agent) => {
        var currentTime = Math.floor(Date.now() / 1000);
        var lastCallEndTime = Math.floor(
          Date.now(agent.lastCallEndTime) / 1000
        );
        var currentCallAnsTime = Math.floor(
          Date.now(agent.currentCallAnsTime) / 1000
        );
        var loginStartTime = Math.floor(Date.now(agent.loginStartTime) / 1000);
        var strSessionTime = Math.floor(
          Date.now(agent.sessionStartDate) / 1000
        );
        var idleDuration = currentTime - lastCallEndTime;
        var totalLoginDuration = currentTime - loginStartTime;
        var currentCallDuration = currentTime - currentCallAnsTime;
        var sessionDuration = currentTime - strSessionTime;
        var lastCallStartTime = agent.loginStartTime;
        if (convert_date(agent.lastCallEndTime) == convert_date(new Date())) {
          lastCallStartTime = agent.lastCallEndTime;
        }
        var objSet = {
          agentId: agent.agentId,
          id_department: agent.id_department,
          agentName: agent.name,
          agentUsername: agent.username,
          breakId: agent.breakId,
          breakName: agent.breakName,
          currentCallStatus: agent.currentCallStatus,
          idleDuration: idleDuration,
          currentCallDuration: currentCallDuration,
          currentSessionDuration: sessionDuration,
          sessionStartTime: agent.sessionStartDate,
          loginStartTime: agent.loginStartTime,
          currentCallAnsTime: agent.currentCallAnsTime,
          sessionCount: agent.sessionCount,
          sessionDuration: agent.sessionDuration,
          lastCallStartTime: lastCallStartTime,
        };
        if (totalDuration.length != 0) {
          totalDuration.map((duration) => {
            if (duration.agentId == agent.agentId) {
              var diff = 0;
              if (agent.breakName == "Available") {
                var loginStart = Math.floor(agent.loginStartTime / 1000);
                diff = currentTime - loginStart;
              }
              function timeToSeconds(time) {
                var [hours, minutes, seconds] = time.split(":").map(Number);
                return hours * 3600 + minutes * 60 + seconds;
              }
              var timeString = duration.totalDuration;
              var seconds = timeToSeconds(timeString);
              var sessionTimeString = duration.lastSessionDuration;
              var sessionSeconds = timeToSeconds(sessionTimeString);
              var time = seconds + diff;
              objSet.totalLoginDuration = seconds;
              objSet.totalSessionDuration = sessionSeconds;
              objSet.lastSessionStartDate = duration.sessionStartDate;
              objSet.lastSessionEndDate = duration.sessionEndDate;
            }
          });
        }
        if (lastLogoutTime.length != 0) {
          lastLogoutTime.map((lastlogout) => {
            if (lastlogout.id_agent == agent.agentId) {
              objSet.lastLogoutTime = lastlogout.startDate;
            }
          });
        }
        objSet.calls = 0;
        if (presentDayCalls.length != 0) {
          presentDayCalls.map((daycalls) => {
            if (daycalls.id_agent == agent.agentId) {
              objSet.callStatus = daycalls.callStatus;
              (objSet.calls += daycalls.calls),
                (objSet.OutgoinDate = daycalls.date);
            }
          });
        }
        objSet.lastCalls = 0;
        if (lastHourCalls.length != 0) {
          lastHourCalls.map((lastdaycalls) => {
            if (lastdaycalls.id_agent == agent.agentId) {
              objSet.lastCallStatus = lastdaycalls.callStatus;
              objSet.lastCalls = lastdaycalls.calls;
            }
          });
        }
        if (presentDayCallsIncoming.length != 0) {
          presentDayCallsIncoming.map((incomingCalls) => {
            if (incomingCalls.agents_list !== "") {
              if (
                incomingCalls.agents_list == agent.agentId &&
                incomingCalls.agentStatus != "ANSWERED"
              ) {
                objSet.callStatus = incomingCalls.callStatus;
                objSet.calls += incomingCalls.calls;
              }
            }
            if (
              incomingCalls.agents_list == agent.agentId &&
              incomingCalls.agentStatus == "ANSWERED"
            ) {
              objSet.callStatus = incomingCalls.callStatus;
              objSet.calls += incomingCalls.calls;
            }
          });
        }
        if (lastHourCallsIncoming.length != 0) {
          lastHourCallsIncoming.map((lastincomingCalls) => {
            if (lastincomingCalls.agents_list !== "") {
              if (
                lastincomingCalls.agents_list == agent.agentId &&
                lastincomingCalls.agentStatus != "ANSWERED"
              ) {
                if (objSet.OutgoinDate != undefined) {
                  if (lastincomingCalls.callStartTime > objSet.OutgoinDate) {
                    objSet.lastCallStatus = lastincomingCalls.callStatus;
                  }
                  objSet.lastCalls += lastincomingCalls.calls;
                } else {
                  objSet.lastCallStatus = lastincomingCalls.callStatus;
                  objSet.lastCalls += lastincomingCalls.calls;
                }
              }
            }
            if (
              lastincomingCalls.agents_list == agent.agentId &&
              lastincomingCalls.agentStatus == "ANSWERED"
            ) {
              if (objSet.OutgoinDate != undefined) {
                if (lastincomingCalls.callStartTime > objSet.OutgoinDate) {
                  objSet.lastCallStatus = lastincomingCalls.callStatus;
                }
                objSet.lastCalls += lastincomingCalls.calls;
              } else {
                objSet.lastCallStatus = lastincomingCalls.callStatus;
                objSet.lastCalls += lastincomingCalls.calls;
              }
            }
          });
        }
        if (campaign_presentDayCalls.length != 0) {
          campaign_presentDayCalls.map((daycalls) => {
            if (daycalls.id_agent == agent.agentId) {
              objSet.calls += daycalls.calls;
            }
          });
        }
        if (campaign_lastHourCalls.length != 0) {
          campaign_lastHourCalls.map((daycalls) => {
            if (daycalls.id_agent == agent.agentId) {
              objSet.lastCalls += daycalls.calls;
            }
          });
        }
        output.push(objSet);
      });
    }
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const uniqueDepartments = [
      ...new Set(output.map((agent) => agent.id_department)),
    ];
    var formattedDepartments = `(${uniqueDepartments.join(", ")})`;
    formattedDepartments = formattedDepartments.replace(/,\s*,/g, ",");
    if (formattedDepartments.length != 0) {
      var departmentName = `select id,name from departments where id in ${formattedDepartments}`;
      var [departmentNameResult] = await getConnection.query(departmentName);

      output = output.map((agent) => {
        let departmentName = null;

        if (agent.id_department == 0) {
          departmentName = "Admin"; // Set departmentName as "Admin" if id_department is 0
        } else {
          const department = departmentNameResult.find(
            (dept) => dept.id == agent.id_department
          );
          departmentName = department ? department.name : null;
        }

        return {
          ...agent,
          departmentName: departmentName, // Add departmentName
        };
      });
    }
    console.log(output);
    res.locals.result = output;
    res.locals.total = breakCounts;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_unique_misscall_report(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin
    var id_user = req.token.id_user;
    var agentId = req.query.agentId;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var sourceNumber = req.query.sourceNumber;
    var didNumber = req.query.didnumber;
    var status = req.query.missed_status;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_department = req.token.id_department;
    var department_id = req.query.department_id;
    // var today = new Date();
    // var fourteenDaysAgo = new Date();
    // fourteenDaysAgo.setDate(today.getDate() - 14);
    // var startDate = fromDate ? new Date(`${fromDate}`) : fourteenDaysAgo;
    // var endDate = toDate ? new Date(`${toDate}`) : today;
    var filterBy = req.query.filterBy;
    var fromdatetime = new Date();
    var todatetime = new Date();
    var todaydate = new Date();
    todaydate.setDate(todaydate.getDate());
    var DD = todaydate.getDate();
    var MM = todaydate.getMonth() + 1;
    var YYYY = todaydate.getFullYear();
    MM = MM < 10 ? `0${MM}` : MM;
    DD = DD < 10 ? `0${DD}` : DD;
    var Start = `${YYYY}-${MM}-${DD} 00:00:00`;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    mm = mm < 10 ? `0${mm}` : mm;
    dd = dd < 10 ? `0${dd}` : dd;
    var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (filterBy != undefined) {
      if (filterBy == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      if (filterBy == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (filterBy == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var Start = `${YYYY}-${MM}-${DD} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    let query = {
      id_user: id_user,
      latestCallStartTime: { $gte: Start, $lte: End },
    };
    if (isSubAdmin == 1) {
      if (department_id != undefined) {
        query.id_department = department_id;
      } else {
        id_department = id_department.split(",").map(Number);
        query.id_department = { $in: id_department };
      }
    } else if (isDept == 1) {
      query.id_department = req.token.id;
    }
    if (status != undefined) {
      query.status = status;
    }
    console.log("time1 ------->", new Date());
    var missedData = await uniqueMissedcallModel
      .find(query)
      .sort({ latestCallStartTime: -1 });
    var missedCount = await uniqueMissedcallModel.find(query);
    console.log("time2 ------->", new Date());
    var missedId = [];
    if (missedData.length != 0) {
      missedData.map(async (value) => {
        missedId.push(value.unique_missedcall_id);
      });
      var search = [];
      console.log("time3 ------->", new Date());
      var sql = `SELECT unique_missed_reports.id,unique_missed_reports.id_department,latestCallStartTime as firstCallStartTime,unique_missed_reports.user_id, latestCallStartTime as date, sourceNumber, didNumber, connectedDuration,application,callback_count,callStatus,type,CONCAT(user.first_name, ' ', user.last_name) as lastAgent,departments.name as departmentName FROM unique_missed_reports LEFT JOIN user ON user.id = unique_missed_reports.user_id LEFT JOIN departments ON unique_missed_reports.id_department = departments.id  WHERE unique_missed_reports.id_user='${id_user}' `;
      if (isSubAdmin == 1) {
        if (department_id != undefined) {
          sql += `and unique_missed_reports.id_department = '${department_id}' `;
        } else {
          sql += `and unique_missed_reports.id_department in (${id_department}) `;
        }
      } else if (isDept == 1) {
        sql += `and unique_missed_reports.id_department='${req.token.id}' `;
      }
      if (sourceNumber != undefined) {
        sql += `and sourceNumber like '%${sourceNumber}%' `;
      }
      if (didNumber != undefined) {
        sql += `and didNumber like '%${didNumber}%' `;
      }
      if (agentId != undefined) {
        sql += `AND user_id = '${agentId}' `;
      }
      if (department_id != undefined) {
        sql += `and unique_missed_reports.id_department like '%${department_id}%' `;
      }
      sql += `AND unique_missed_reports.id in(${missedId})`;
      var [result] = await getConnection.query(sql, { bind: search });
      console.log("time4 ------->", new Date());
      if (missedData.length != 0) {
        var map_result = Promise.all(
          result.map(async (value) => {
            missedData.map(async (data) => {
              if (value.id == data.unique_missedcall_id) {
                value.missed_status = data.status;
                value.missed_count = data.missedcall_count;
                value.firstCallStartTime = data.latestCallStartTime;
                value.callUniqueId = data.callUniqueId;
              }
            });
            return value;
          })
        );
        result = await map_result;
      }
      console.log("time5 ------->", new Date());
      if (status != undefined) {
        result = result.filter((obj) => obj.missed_status !== undefined);
      }
      console.log("time6 ------->", new Date());
      var count = result.length;
      if (result.length != 0) {
        result.sort(
          (a, b) =>
            new Date(b.firstCallStartTime) - new Date(a.firstCallStartTime)
        );
        result = result.slice(skip, skip + limit);
      }

      console.log("time7 ------->", new Date());
      const sourceNumbers = result.map((entry) => entry.sourceNumber);
    const contact_query = {
  phone_number: { $in: sourceNumbers },
  id_user: id_user,
};
if(isAdmin == 1){
  contact_query.id_department = 0
}
if(isDept == 1){
  contact_query.id_department = Number(req.token.id)
}
if (isSubAdmin == 1) {
  const departmentArray = req.token.id_department.split(',').map(Number); 
  contact_query.id_department = { $in: departmentArray };
}
const projection = {
  name: 1,
  phone_number: 1,
  _id: 0,
};
const contact_data = await contactsModel.find(contact_query, projection).lean();
      const updatedResult = result.map((item) => {
        const match = contact_data.find((entry) =>
          entry.phone_number.includes(item.sourceNumber)
        );
        if (match) {
          return { ...item, contact_name: match.name };
        }
        return item;
      });
      console.log("time8 ------->", new Date());
      res.locals.result = updatedResult;
      // res.locals.result = result;
      if (
        sourceNumber != undefined ||
        didNumber != undefined ||
        agentId != undefined ||
        department_id != undefined
      ) {
        res.locals.count = result.length;
      } else {
        res.locals.count = count;
      }
    } else {
      res.locals.result = [];
      res.locals.count = 0;
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_unique_misscall_report_csv(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin
    var id_user = req.token.id_user;
    var agentId = req.query.agentId;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var sourceNumber = req.query.sourceNumber;
    var didNumber = req.query.didnumber;
    var status = req.query.missed_status;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_department = req.token.id_department;
    var department_id = req.query.department_id;
    var filterBy = req.query.filterBy;
    var fromdatetime = new Date();
    var todatetime = new Date();
    var todaydate = new Date();
    todaydate.setDate(todaydate.getDate());
    var DD = todaydate.getDate();
    var MM = todaydate.getMonth() + 1;
    var YYYY = todaydate.getFullYear();
    MM = MM < 10 ? `0${MM}` : MM;
    DD = DD < 10 ? `0${DD}` : DD;
    var Start = `${YYYY}-${MM}-${DD} 00:00:00`;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    mm = mm < 10 ? `0${mm}` : mm;
    dd = dd < 10 ? `0${dd}` : dd;
    var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (filterBy != undefined) {
      if (filterBy == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      if (filterBy == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (filterBy == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var Start = `${YYYY}-${MM}-${DD} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    let query = {
      id_user: id_user,
      latestCallStartTime: { $gte: Start, $lte: End },
    };
    if (isSubAdmin == 1) {
      if (department_id != undefined) {
        query.id_department = department_id;
      } else {
        id_department = id_department.split(",").map(Number);
        query.id_department = { $in: id_department };
      }
    } else if (isDept == 1) {
      query.id_department = req.token.id;
    }
    if (status != undefined) {
      query.status = status;
    }
    var missedData = await uniqueMissedcallModel
      .find(query)
      .sort({ latestCallStartTime: -1 });
    var missedCount = await uniqueMissedcallModel.find(query);
    var missedId = [];
    if (missedData.length != 0) {
      missedData.map(async (value) => {
        missedId.push(value.unique_missedcall_id);
      });
      var search = [];
      var sql = `SELECT unique_missed_reports.id,unique_missed_reports.id_department,latestCallStartTime as firstCallStartTime,unique_missed_reports.user_id, latestCallStartTime as date, sourceNumber, didNumber, connectedDuration,application,callback_count,callStatus,type,CONCAT(user.first_name, ' ', user.last_name) as lastAgent,departments.name as departmentName FROM unique_missed_reports LEFT JOIN user ON user.id = unique_missed_reports.user_id LEFT JOIN departments ON unique_missed_reports.id_department = departments.id  WHERE unique_missed_reports.id_user='${id_user}' `;
      if (isSubAdmin == 1) {
        if (department_id != undefined) {
          sql += `and unique_missed_reports.id_department = '${department_id}' `;
        } else {
          sql += `and unique_missed_reports.id_department in (${id_department}) `;
        }
      } else if (isDept == 1) {
        sql += ` and unique_missed_reports.id_department='${req.token.id}' `;
      } else {
        if (department_id != undefined) {
          sql += `and unique_missed_reports.id_department = '${department_id}' `;
        }
      }
      if (sourceNumber != undefined) {
        sql += `and sourceNumber like '%${sourceNumber}%' `;
      }
      if (didNumber != undefined) {
        sql += `and didNumber like '%${didNumber}%' `;
      }
      if (agentId != undefined) {
        sql += `AND user_id = '${agentId}' `;
      }
      sql += `AND unique_missed_reports.id in(${missedId})`;
      var [result] = await getConnection.query(sql, { bind: search });
      if (missedData.length != 0) {
        var map_result = Promise.all(
          result.map(async (value) => {
            missedData.map(async (data) => {
              if (value.id == data.unique_missedcall_id) {
                value.missed_status = data.status;
                value.missed_count = data.missedcall_count;
                value.firstCallStartTime = data.latestCallStartTime;
                value.callUniqueId = data.callUniqueId;
              }
            });
            return value;
          })
        );
        result = await map_result;
      }
    } else {
      var result = [];
    }
    if (status != undefined) {
      result = result.filter((obj) => obj.missed_status !== undefined);
    }
    if (result.length != 0) {
      result.sort(
        (a, b) =>
          new Date(b.firstCallStartTime) - new Date(a.firstCallStartTime)
      );
    }
    const sourceNumbers = result.map((entry) => entry.sourceNumber);
    const contact_query = {
  phone_number: { $in: sourceNumbers },
  id_user: id_user,
};
if(isAdmin == 1){
  contact_query.id_department = 0
}
if(isDept == 1){
  contact_query.id_department = Number(req.token.id)
}
if (isSubAdmin == 1) {
  const departmentArray = req.token.id_department.split(',').map(Number); 
  contact_query.id_department = { $in: departmentArray };
}
const projection = {
  name: 1,
  phone_number: 1,
  _id: 0,
};
const contact_data = await contactsModel.find(contact_query, projection).lean();
    const updatedResult = result.map((item) => {
      const match = contact_data.find((entry) =>
        entry.phone_number.includes(item.sourceNumber)
      );
      if (match) {
        return { ...item, contact_name: match.name };
      }
      return item;
    });
    res.locals.result = updatedResult;
    if (
      sourceNumber != undefined ||
      didNumber != undefined ||
      agentId != undefined ||
      department_id != undefined
    ) {
      res.locals.count = result.length;
    } else {
      res.locals.count = missedCount.length;
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}


async function download_template(req, res, next) {
  try {
    var template_id = req.query.template_id;
    var agentCheck = req.query.agentCheck;
    var statusCheck = req.query.statusCheck;
    var result = await templatefieldModel.find(
      { template_id: new ObjectId(template_id) },
      { field_name: 1, sub: 1, _id: 0 }
    );
    var resultArr = [{ field_name: "phnNo" }];
    resultArr.push({ field_name: "name" })
    if (statusCheck == "false") {
      resultArr.push({ field_name: "status" });
    }
    if (agentCheck == "false") {
      resultArr.push({ field_name: "User Employee ID" });
    }
    result.map((data) => {
      resultArr.push({ field_name: data.field_name });
      if (data._doc.sub != undefined && data._doc.sub.length != 0) {
        data.sub.map((sub) => {
          resultArr.push({ field_name: sub.field_name });
        });
      }
    });
    res.locals.result = resultArr;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function insert_reminder(req, res, next) {
  try {
    var created_type = req.body.created_type;
    var created_id = req.body.created_id;
    var agent_id = req.body.agent_id;
    var template_id = req.body.template_id;
    var updateAgent = req.body.agentUpdateFlag;
    var previous_agent_id = req.body.previous_agent_id;
    var id = req.body.previous_id;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    if (isAdmin == 1) {
      var id_department = 0;
      var id_user = req.token.id_user;
    } else if (isSubAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id_department;
    } else if (isDept == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id_department;
    } else if (isAgent == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id_department;
    }
    if (req.body.id_department != undefined) {
      id_department = req.body.id_department;
    }
    if (isAgent == 1) {
      var agent_id = Number(req.token.id);
    } else {
      var agent_id = agent_id;
    }
    var time_hours = req.body.time.hours;
    var time_am_pm = req.body.time.AMorPM;
    if (time_am_pm == "PM" && time_hours != 12) {
      var hours = time_hours + 12;
    } else if (time_am_pm == "AM" && time_hours == 12) {
      var hours = time_hours - 12;
    } else {
      var hours = time_hours;
    }
    var date = req.body.date + " " + hours + ":" + req.body.time.mins;
    var reminder_date = date;
    var subject = req.body.subject;
    var reminder = req.body.reminder;
    var customer_name = req.body.customer_name;
    if (req.token.phn_number_mask == 1) {
      var ph = await string_decode(req.body.phone_number);
      if (ph) {
        var phone_number = ph;
      } else {
        var phone_number = req.body.phone_number;
      }
    } else {
      var phone_number = req.body.phone_number;
    }
    var latestSql = `SELECT *,DATE_FORMAT(reminder_date, '%Y-%m-%d %H:%i:%s') AS reminderDate FROM cc_reminder WHERE phone_number = '${phone_number}' ORDER BY id DESC LIMIT 1`;
    var [latestRes] = await getConnection.query(latestSql);
    if (latestRes.length != 0) {
      var update = `UPDATE cc_reminder SET isRead = 1 WHERE phone_number = '${phone_number}'`; // update previous reminder as read
      var [updateRes] = await sequelize.query(update);
      if (previous_agent_id != undefined) {
        var obj = id;
        var msg = "deleteReminder";
        var socket = await userSocket(previous_agent_id, msg, obj);
      } else {
        var obj = latestRes[0].id;
        var msg = "deleteReminder";
        var socket = await userSocket(agent_id, msg, obj);
      }
    }

    var user_id = agent_id;
    var data = {
      id_user,
      id_department,
      user_id,
      reminder_date,
      subject,
      reminder,
      phone_number,
      created_type,
      created_id,
      customer_name,
      template_id,
    };
    // if (req.token.phn_number_mask == 1) {
    //     var ph_no = await string_encode(data.phone_number);
    //     if (ph_no) {
    //         data.phone_number = ph_no
    //     }
    // }
    if (latestRes.length != 0) {
      var reminderDate = latestRes[0].reminderDate;
      reminderDate = reminderDate.slice(0, 16);
      const date1 = new Date(reminder_date);
      const date2 = new Date(reminderDate);
      if (date1.getTime() === date2.getTime()) {
        var result = await reminderModel.update(data, {
          where: { id: latestRes[0].id },
        });
        data.id = result[0];
        if (updateAgent == true) {
          var sql = `DELETE FROM cc_reminder WHERE phone_number = '${phone_number}' and id != '${latestRes[0].id}'`; // agent update time delete old reminders, reason for delete = reminder_date column is set as timestamp and defult current date time in live database so reminder_date is updated to current time avoid that issue using delete old reminders.
          var [reminderRes] = await sequelize.query(sql);
        }
      } else {
        if (updateAgent == true) {
          var sql = `DELETE FROM cc_reminder WHERE phone_number = '${phone_number}'`; // agent update time delete old reminders, reason for delete = reminder_date column is set as timestamp and defult current date time in live database so reminder_date is updated to current time avoid that issue using delete old reminders.
          var [reminderRes] = await sequelize.query(sql);
        }
        var result = await reminderModel.create(data);
        data.id = result.dataValues.id;
        data.reminder_date = new Date(reminder_date);
        data.status = 0;
        data.isRead = 0;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var currentDate = `${yyyy}-${mm}-${dd}`;
        console.log(
          "reminder update............................................................."
        );
        var reminderDate = new Date(data.reminder_date);
        var reminder_dd = reminderDate.getDate();
        var reminder_mm = reminderDate.getMonth() + 1;
        var reminder_yyyy = reminderDate.getFullYear();
        var reminder_date = `${reminder_yyyy}-${reminder_mm}-${reminder_dd}`;
        if (currentDate == reminder_date) {
          if (agent_id && agent_id != undefined) {
            var obj = data;
            var msg = "updateReminder";
            var socket = await userSocket(agent_id, msg, obj);
            console.log(obj);
          }
        }
      }
    } else {
      var result = await reminderModel.create(data);
      data.id = result.dataValues.id;
      data.reminder_date = new Date(reminder_date);
      data.status = 0;
      data.isRead = 0;
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var currentDate = `${yyyy}-${mm}-${dd}`;
      console.log(
        "reminder update............................................................."
      );
      var reminderDate = new Date(data.reminder_date);
      var reminder_dd = reminderDate.getDate();
      var reminder_mm = reminderDate.getMonth() + 1;
      var reminder_yyyy = reminderDate.getFullYear();
      var reminder_date = `${reminder_yyyy}-${reminder_mm}-${reminder_dd}`;
      if (currentDate == reminder_date) {
        if (agent_id && agent_id != undefined) {
          var obj = data;
          var msg = "updateReminder";
          var socket = await userSocket(agent_id, msg, obj);
        }
      }
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_reminder(req, res, next) {
  try {
    var id = req.query.id;
    var agent_id = req.body.agent_id;
    if (agent_id == undefined) {
      var agent_id = Number(req.token.id);
    } else {
      var agent_id = agent_id;
    }
    var time_hours = req.body.time.hours;
    var time_am_pm = req.body.time.AMorPM;
    if (time_am_pm == "PM" && time_hours != 12) {
      var hours = time_hours + 12;
    } else if (time_am_pm == "AM" && time_hours == 12) {
      var hours = time_hours - 12;
    } else {
      var hours = time_hours;
    }
    var date = req.body.date + " " + hours + ":" + req.body.time.mins;
    var reminder_date = date;
    var subject = req.body.subject;
    var reminder = req.body.reminder;
    var phone_number = req.body.phone_number;
    var customer_name = req.body.customer_name;
    var user_id = agent_id;
    var data = {
      user_id,
      reminder_date,
      subject,
      reminder,
      phone_number,
      customer_name,
    };
    if (req.token.phn_number_mask == 1) {
      if (data.phone_number != undefined && data.phone_number) {
        var phn_no = await string_decode(data.phone_number);
        if (phn_no) {
          data.phone_number = phn_no;
        }
      }
    }
    var result = await reminderModel.update(data, { where: { id: id } });
    var reminderVlues = await reminderModel.findOne({ where: { id: id } });
    data.id = id;
    data.reminder_date = reminderVlues.dataValues.reminder_date;
    data.status = reminderVlues.dataValues.status;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var currentDate = `${yyyy}-${mm}-${dd}`;
    console.log(
      "reminder update............................................................."
    );
    var reminderDate = new Date(data.reminder_date);
    var reminder_dd = reminderDate.getDate();
    var reminder_mm = reminderDate.getMonth() + 1;
    var reminder_yyyy = reminderDate.getFullYear();
    var reminder_date = `${reminder_yyyy}-${reminder_mm}-${reminder_dd}`;
    if (currentDate == reminder_date) {
      if (agent_id && agent_id != undefined) {
        var obj = data;
        var msg = "updateReminder";
        var socket = await userSocket(agent_id, msg, obj);
        console.log(obj);
      }
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_reminder(req, res, next) {
  try {
    var limits = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limits;
    var subject = req.query.subject;
    var phone_number = req.query.phone_number;
    var agent = req.query.agent;
    var customer = req.query.customerName;
    var department_id = req.query.department_id;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var sql = `SELECT cc_reminder.id,cc_reminder.id_department, cc_reminder.user_id as agent_id, cc_reminder.reminder_date, cc_reminder.subject, cc_reminder.reminder, cc_reminder.status, cc_reminder.customer_name, cc_reminder.phone_number,cc_reminder.isRead,departments.name as department,   CONCAT(user.first_name, ' ', user.last_name) as agentName FROM cc_reminder  `;
    var sqlCount = `SELECT COUNT(cc_reminder.id) as total FROM cc_reminder `;
    if (isAdmin == 1) {
      checking = `AND cc_reminder.id_user = '${id_user}' `;
      checking = `AND cc_reminder.id_user = '${id_user}' `;
    } else if (isSubAdmin == 1) {
      checking = `AND cc_reminder.id_department IN (${id_department}) AND cc_reminder.id_user = '${id_user}' `;
      checking = `AND cc_reminder.id_department IN (${id_department}) AND cc_reminder.id_user = '${id_user}' `;
    } else if (isDept == 1) {
      checking = `AND cc_reminder.id_department = '${req.token.id}' AND cc_reminder.id_user = '${id_user}'`;
      checking = `AND cc_reminder.id_department = '${req.token.id}' AND cc_reminder.id_user = '${id_user}'`;
    }
    sql += `JOIN (SELECT  phone_number, MAX(reminder_date) AS max_reminder_date FROM  cc_reminder WHERE 1 ${checking} GROUP BY cc_reminder.phone_number) AS max_dates ON cc_reminder.phone_number = max_dates.phone_number AND cc_reminder.reminder_date = max_dates.max_reminder_date LEFT JOIN departments ON cc_reminder.id_department = departments.id LEFT JOIN user ON user.id = cc_reminder.user_id LEFT JOIN customers ON customers.id = cc_reminder.id_user WHERE 1 ${checking} and cc_reminder.reminder_date BETWEEN '${Start}' AND '${End}' `;

    sqlCount += `JOIN (SELECT  phone_number, MAX(reminder_date) AS max_reminder_date FROM  cc_reminder WHERE 1 ${checking} GROUP BY cc_reminder.phone_number) AS max_dates ON cc_reminder.phone_number = max_dates.phone_number AND cc_reminder.reminder_date = max_dates.max_reminder_date LEFT JOIN departments ON cc_reminder.id_department = departments.id LEFT JOIN user ON user.id = cc_reminder.user_id LEFT JOIN customers ON customers.id = cc_reminder.id_user WHERE 1 ${checking} and cc_reminder.reminder_date BETWEEN '${Start}' AND '${End}' `;

    if (subject != undefined) {
      sql += `AND subject LIKE '%${subject}%' `;
      sqlCount += `AND subject LIKE '%${subject}%' `;
    }
    if (agent != undefined) {
      sql += `AND user_id = '${agent}' `;
      sqlCount += `AND user_id = '${agent}' `;
    }
    if (phone_number != undefined) {
      sql += `AND cc_reminder.phone_number LIKE '%${phone_number}%' `;
      sqlCount += `AND cc_reminder.phone_number LIKE '%${phone_number}%' `;
    }
    if (customer != undefined) {
      sql += `AND cc_reminder.customer_name LIKE '%${customer}%' `;
      sqlCount += `AND cc_reminder.customer_name LIKE '%${customer}%' `;
    }
    if (department_id != undefined) {
      sql += `AND cc_reminder.id_department LIKE '%${department_id}%' `;
      sqlCount += `AND cc_reminder.id_department LIKE '%${department_id}%' `;
    }
    sql += ` ORDER BY cc_reminder.reminder_date DESC LIMIT ${skip},${limits}`;
    sqlCount += ` ORDER BY cc_reminder.reminder_date DESC`;

    var [reminder] = await getConnection.query(sql);
    var [count] = await getConnection.query(sqlCount);
    res.locals.result = reminder;
    res.locals.count = count[0].total;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_reminder_csv(req, res, next) {
  try {
    var subject = req.query.subject;
    var phone_number = req.query.phone_number;
    var agent = req.query.agent;
    var customer = req.query.customerName;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var sql = `SELECT cc_reminder.id,cc_reminder.id_department, cc_reminder.user_id as agent_id, cc_reminder.reminder_date, cc_reminder.subject, cc_reminder.reminder, cc_reminder.status, cc_reminder.customer_name, cc_reminder.phone_number,cc_reminder.isRead,departments.name as department, CONCAT(user.first_name, ' ', user.last_name) as agentName FROM cc_reminder  `;
    var sqlCount = `SELECT COUNT(cc_reminder.id) as total FROM cc_reminder `;
    if (isAdmin == 1) {
      checking = `AND cc_reminder.id_user = '${id_user}' `;
      checking = `AND cc_reminder.id_user = '${id_user}' `;
    } else if (isSubAdmin == 1) {
      checking = `AND cc_reminder.id_department IN (${id_department}) AND cc_reminder.id_user = '${id_user}' `;
      checking = `AND cc_reminder.id_department IN (${id_department}) AND cc_reminder.id_user = '${id_user}' `;
    } else if (isDept == 1) {
      checking = `AND cc_reminder.id_department = '${req.token.id}' AND cc_reminder.id_user = '${id_user}'`;
      checking = `AND cc_reminder.id_department = '${req.token.id}' AND cc_reminder.id_user = '${id_user}'`;
    }
    sql += `JOIN (SELECT phone_number,MAX(id) AS max_id FROM cc_reminder WHERE 1 ${checking} GROUP BY cc_reminder.phone_number) AS max_ids ON cc_reminder.id = max_ids.max_id LEFT JOIN departments ON cc_reminder.id_department = departments.id LEFT JOIN user ON user.id = cc_reminder.user_id LEFT JOIN customers ON customers.id = cc_reminder.id_user WHERE 1 ${checking} and cc_reminder.reminder_date BETWEEN '${Start}' AND '${End}' `;
    sqlCount += `JOIN (SELECT phone_number,MAX(id) AS max_id FROM cc_reminder WHERE 1 ${checking} GROUP BY cc_reminder.phone_number) AS max_ids ON cc_reminder.id = max_ids.max_id LEFT JOIN departments ON cc_reminder.id_department = departments.id LEFT JOIN user ON user.id = cc_reminder.user_id LEFT JOIN customers ON customers.id = cc_reminder.id_user WHERE 1 ${checking} and cc_reminder.reminder_date BETWEEN '${Start}' AND '${End}' `;

    if (subject != undefined) {
      sql += `and subject like '%${subject}%' `;
      sqlCount += `and subject like '%${subject}%' `;
    }
    if (agent != undefined) {
      sql += `and user_id = '${agent}' `;
      sqlCount += `and user_id = '${agent}' `;
    }
    if (phone_number != undefined) {
      sql += `and cc_reminder.phone_number like '%${phone_number}%' `;
      sqlCount += `and cc_reminder.phone_number like '%${phone_number}%' `;
    }
    if (customer != undefined) {
      sql += `and cc_reminder.customer_name like '%${customer}%' `;
      sqlCount += `and cc_reminder.customer_name like '%${customer}%' `;
    }
    sql += ` order by cc_reminder.id desc `;
    sqlCount += ` order by cc_reminder.id desc `;
    var [reminder] = await getConnection.query(sql);
    var [count] = await getConnection.query(sqlCount);
    res.locals.result = reminder;
    res.locals.count = count[0].total;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_reminder_with_template_id(req, res, next) {
  try {
    var subject = req.query.subject;
    var agent = req.query.agent;
    var template_id = req.query.template_id;
    var customer = req.query.customerName;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var sql = `SELECT cc_reminder.id as id, cc_reminder.id_department, cc_reminder.user_id as agent_id,cc_reminder.reminder_date as reminder_date, cc_reminder.subject, cc_reminder.reminder, cc_reminder.phone_number, cc_reminder.status, cc_reminder.created_type, cc_reminder.campaign_id, cc_reminder.createdAt, departments.name as department, CONCAT(user.first_name, ' ', user.last_name) as agentName, cc_reminder.customer_name FROM cc_reminder LEFT JOIN departments ON cc_reminder.id_department = departments.id LEFT JOIN user ON user.id = cc_reminder.user_id WHERE reminder_date BETWEEN '${Start}' AND '${End}' `;
    var sqlCount = `SELECT COUNT(cc_reminder.id) as total FROM cc_reminder LEFT JOIN departments ON cc_reminder.id_department = departments.id LEFT JOIN user ON user.id = cc_reminder.user_id LEFT JOIN customers ON customers.id = cc_reminder.id_user WHERE reminder_date BETWEEN '${Start}' AND '${End}' `;
    if (isAdmin == 1) {
      sql += `AND cc_reminder.id_user = '${id_user}' `;
      sqlCount += `AND cc_reminder.id_user = '${id_user}' `;
    } else if (isSubAdmin == 1) {
      checking = `AND cc_reminder.id_department IN (${id_department}) AND cc_reminder.id_user = '${id_user}' `;
      checking = `AND cc_reminder.id_department IN (${id_department}) AND cc_reminder.id_user = '${id_user}' `;
    } else if (isDept == 1) {
      checking = `AND cc_reminder.id_department = '${req.token.id}' AND cc_reminder.id_user = '${id_user}'`;
      checking = `AND cc_reminder.id_department = '${req.token.id}' AND cc_reminder.id_user = '${id_user}'`;
    }
    if (subject != undefined) {
      sql += `AND subject LIKE '%${subject}%' `;
      sqlCount += `AND subject LIKE '%${subject}%' `;
    }
    if (template_id != undefined) {
      sql += `AND template_id = '${template_id}' `;
      sqlCount += `AND template_id = '${template_id}' `;
    }
    sql += `ORDER BY cc_reminder.id DESC`;
    sqlCount += `GROUP BY cc_reminder.phone_number ORDER BY cc_reminder.id DESC`;

    var [reminder] = await getConnection.query(sql);
    var [count] = await getConnection.query(sqlCount);
    res.locals.result = reminder;
    res.locals.count = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_all_reminder_by_agent(req, res, next) {
  try {
    var limits = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limits;
    var subject = req.query.subject;
    var phone_number = req.query.phone_number;
    var customer = req.query.customerName;
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    var agent_id = req.token.id;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var sql = `SELECT cc_reminder.id, cc_reminder.reminder_date, cc_reminder.subject, cc_reminder.reminder, cc_reminder.status, cc_reminder.customer_name, cc_reminder.phone_number,cc_reminder.isRead FROM cc_reminder JOIN (SELECT cc_reminder.phone_number, MAX(id) AS max_id FROM cc_reminder WHERE  id_user = '${id_user}' GROUP BY cc_reminder.phone_number) AS max_id ON cc_reminder.phone_number = max_id.phone_number AND cc_reminder.id = max_id.max_id WHERE cc_reminder.user_id = '${agent_id}' AND cc_reminder.id_user = '${id_user}' AND cc_reminder.id_department = '${id_department}' AND cc_reminder.reminder_date BETWEEN '${Start}' and '${End}' `;
    var sqlCount = `SELECT COUNT(cc_reminder.id) as total FROM cc_reminder JOIN (SELECT cc_reminder.phone_number, MAX(id) AS max_id FROM cc_reminder WHERE id_user = '${id_user}' GROUP BY cc_reminder.phone_number) AS max_id ON cc_reminder.phone_number = max_id.phone_number AND cc_reminder.id = max_id.max_id where user_id ='${agent_id}' AND id_user='${id_user}' AND cc_reminder.id_department = '${id_department}' and cc_reminder.reminder_date between '${Start}' and '${End}' `;
    if (subject != undefined) {
      sql += `and subject like '%${subject}%' `;
      sqlCount += `and subject like '%${subject}%' `;
    }
    if (phone_number != undefined) {
      sql += `and cc_reminder.phone_number like '%${phone_number}%' `;
      sqlCount += `and cc_reminder.phone_number like '%${phone_number}%' `;
    }
    if (customer != undefined) {
      sql += `and cc_reminder.customer_name like '%${customer}%' `;
      sqlCount += `and cc_reminder.customer_name like '%${customer}%' `;
    }
    sql += `order by cc_reminder.id desc limit ${skip},${limits}`;
    sqlCount += `order by cc_reminder.id desc `;
    var [reminder] = await getConnection.query(sql);
    var [count] = await getConnection.query(sqlCount);
    if (req.token.phn_number_mask == 1) {
      var map_result = Promise.all(
        reminder.map(async (value) => {
          var pn = await string_encode(value.phone_number);
          if (pn) {
            value.phone_number = pn;
          }
          return value;
        })
      );
      var result = await map_result;
      res.locals.result = result;
    } else {
      res.locals.result = reminder;
    }
    res.locals.count = count[0].total;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_all_reminder_by_agent_csv(req, res, next) {
  try {
    var subject = req.query.subject;
    var phone_number = req.query.phone_number;
    var customer = req.query.customerName;
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    var agent_id = req.token.id;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var sql = `SELECT cc_reminder.id, cc_reminder.reminder_date, cc_reminder.subject, cc_reminder.reminder, cc_reminder.status, cc_reminder.customer_name, cc_reminder.phone_number,cc_reminder.isRead FROM cc_reminder JOIN (SELECT cc_reminder.phone_number, MAX(id) AS max_id FROM cc_reminder WHERE id_user = '${id_user}' GROUP BY cc_reminder.phone_number) AS max_id ON cc_reminder.phone_number = max_id.phone_number AND cc_reminder.id = max_id.max_id WHERE cc_reminder.user_id = '${agent_id}' AND cc_reminder.id_user = '${id_user}' AND cc_reminder.id_department = '${id_department}' AND cc_reminder.reminder_date BETWEEN '${Start}' and '${End}' `;
    var sqlCount = `SELECT COUNT(cc_reminder.id) as total FROM cc_reminder JOIN (SELECT cc_reminder.phone_number, MAX(id) AS max_id FROM cc_reminder WHERE id_user = '${id_user}' GROUP BY cc_reminder.phone_number) AS max_id ON cc_reminder.phone_number = max_id.phone_number AND cc_reminder.id = max_id.max_id where user_id='${agent_id}' AND id_user='${id_user}' AND cc_reminder.id_department = '${id_department}' and cc_reminder.reminder_date between '${Start}' and '${End}' `;
    if (subject != undefined) {
      sql += `and subject like '%${subject}%' `;
      sqlCount += `and subject like '%${subject}%' `;
    }
    if (phone_number != undefined) {
      sql += `and cc_reminder.phone_number like '%${phone_number}%' `;
      sqlCount += `and cc_reminder.phone_number like '%${phone_number}%' `;
    }
    if (customer != undefined) {
      sql += `and cc_reminder.customer_name like '%${customer}%' `;
      sqlCount += `and cc_reminder.customer_name like '%${customer}%' `;
    }
    sql += `GROUP BY cc_reminder.phone_number order by cc_reminder.id desc `;
    sqlCount += `GROUP BY cc_reminder.phone_number order by cc_reminder.id desc `;
    var [reminder] = await getConnection.query(sql);
    var [count] = await getConnection.query(sqlCount);
    if (req.token.phn_number_mask == 1) {
      var map_result = Promise.all(
        reminder.map(async (value) => {
          var pn = await string_encode(value.phone_number);
          if (pn) {
            value.phone_number = pn;
          }
          return value;
        })
      );
      var result = await map_result;
      res.locals.result = result;
    } else {
      res.locals.result = reminder;
    }
    res.locals.count = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_reminder_by_id(req, res, next) {
  try {
    var id = req.query.id;
    var sql = `SELECT id,id_user,id_department,user_id as agent_id,cc_reminder.reminder_date as reminder_date,subject,reminder,phone_number,status,createdAt,updatedAt,campaign_id,customer_name FROM cc_reminder where id = '${id}' `;
    var [result] = await getConnection.query(sql);
    var date = new Date(result[0].reminder_date);
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    var hours = date.getHours();
    var min = date.getMinutes();
    if (hours > 12) {
      hours = hours - 12;
      var Time = { hours: hours, mins: min, isAM: false, AMorPM: "PM" };
    } else if (hours == 12) {
      var Time = { hours: hours, mins: min, isAM: false, AMorPM: "PM" };
    } else if (hours == 0) {
      hours = hours + 12;
      var Time = { hours: hours, mins: min, isAM: false, AMorPM: "AM" };
    } else {
      var Time = { hours: hours, mins: min, isAM: true, AMorPM: "AM" };
    }
    var obj = {
      agent_id: result[0].agent_id,
      date: yyyy + "-" + mm + "-" + dd,
      reminder: result[0].reminder,
      subject: result[0].subject,
      time: Time,
      created_type: result[0].created_type,
      created_id: result[0].campaign_id,
      customer_name: result[0].customer_name,
      id_department: result[0].id_department,
    };
    if (req.token.phn_number_mask == 1) {
      if (result[0].phone_number != undefined && result[0].phone_number) {
        var phn_no = await string_encode(result[0].phone_number);
        if (phn_no) {
          obj.phone_number = phn_no;
        }
      }
    } else {
      obj.phone_number = result[0].phone_number;
    }
    res.locals.result = obj;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_reminder(req, res, next) {
  try {
    var id = req.query.id;
    if (req.token.isAdmin != undefined) {
      var agentId = req.query.agentId;
    } else {
      var agentId = req.token.id;
    }
    var sql = `SELECT phone_number,subject FROM cc_reminder WHERE id = '${id}'`;
    var [reminder] = await getConnection.query(sql);
    var result = await reminderModel.destroy({ where: { id: id } });
    var msg = "deleteReminder";
    var socket = await userSocket(agentId, msg, id);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_all_reminder(req, res, next) {
  try {
    var id = req.query.id;
    var phn = req.query.phone_number;
    if (req.token.isAdmin != undefined) {
      var agentId = req.query.agentId;
    } else {
      var agentId = req.token.id;
    }
    if (phn.length != 0) {
      var deleteSql = `DELETE FROM cc_reminder WHERE phone_number in(${phn})`;
      var [result] = await sequelize.query(deleteSql);
    } else {
      var deleteSql = `DELETE FROM cc_reminder WHERE id = '${id}'`;
      var [result] = await sequelize.query(deleteSql);
    }
    var msg = "deleteReminder";
    var socket = await userSocket(agentId, msg, id);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_reminder_by_agent(req, res, next) {
  try {
    var agent_id = req.token.id;
    var id_user = req.token.id_user;
    var status = 0;
    var dates = new Date();
    var year = dates.getFullYear();
    var month = dates.getMonth() + 1;
    var day = dates.getDate();
    var start_day = `${year}-${month}-${day} 00:00:00`;
    var end_day = `${year}-${month}-${day} 23:59:59`;
    var sql = `SELECT * FROM cc_reminder JOIN (SELECT cc_reminder.phone_number, MAX(id) AS max_id FROM cc_reminder WHERE id_user = '${id_user}' GROUP BY cc_reminder.phone_number) AS max_id ON cc_reminder.phone_number = max_id.phone_number AND cc_reminder.id = max_id.max_id WHERE cc_reminder.user_id = '${agent_id}' AND cc_reminder.id_user = '${id_user}' AND cc_reminder.reminder_date <= '${end_day}' and isRead = 0 order by cc_reminder.id desc`;
    var [result] = await getConnection.query(sql);
    var countsql = `SELECT COUNT(id) as total FROM cc_reminder JOIN (SELECT cc_reminder.phone_number, MAX(id) AS max_id FROM cc_reminder WHERE id_user = '${id_user}' GROUP BY cc_reminder.phone_number) AS max_id ON cc_reminder.phone_number = max_id.phone_number AND cc_reminder.id = max_id.max_id WHERE cc_reminder.user_id = '${agent_id}' AND cc_reminder.id_user = '${id_user}' AND cc_reminder.reminder_date <= '${end_day}' and isRead = 0 order by cc_reminder.id desc`;
    var [count] = await getConnection.query(countsql);
    if (req.token.phn_number_mask == 1) {
      var map_result = Promise.all(
        result.map(async (value) => {
          var pn = await string_encode(value.phone_number);
          if (pn) {
            value.phone_number = pn;
          }
          return value;
        })
      );
      var result = await map_result;
      res.locals.result = result;
      res.locals.total = count[0].total;
    } else {
      res.locals.result = result;
      res.locals.total = count[0].total;
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_reminder_status_by_id(req, res, next) {
  try {
    var id = req.body.id;
    var sql = `UPDATE cc_reminder SET status = 1,isRead = 1 WHERE id in (${id}) `;
    var [result] = await sequelize.query(sql);
    var obj = {};
    var msg = "reminderComplete";
    if (req.token.id && req.token.id != undefined)
      var socket = await userSocket(req.token.id, msg, obj);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function csv_reminder_insert(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var created_type = req.body.created_type;
    var created_id = req.body.created_id;
    var agent_id = req.body.agent_id;
    var reminderData = req.body.reminder_data;
    if (isAdmin == 1) {
      var id_department = 0;
      var id_user = req.token.id_user;
    } else if (isSubAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = req.body.id_department;
    } else if (isDept == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id;
    } else if (isAgent == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id_department;
    }
    if (isAgent == 1) {
      var agent_id = Number(req.token.id);
    } else {
      var agent_id = agent_id;
    }
    var arr = [];
    var phnNo = [];
    var logs = [];
    var user_id = agent_id;
    reminderData.map(async (data) => {
      var time_hours = data.time.hours;
      var time_am_pm = data.time.AMorPM;
      if (time_am_pm == "PM" && time_hours != 12) {
        var hours = time_hours + 12;
      } else if (time_am_pm == "AM" && time_hours == 12) {
        var hours = time_hours - 12;
      } else {
        var hours = time_hours;
      }
      var date = data.date + " " + hours + ":" + data.time.mins;
      var reminder_date = date;
      var subject = data.subject;
      var reminder = data.reminder;
      var phone_number = data.phone_number;
      phnNo.push(phone_number);
      var customer_name = data.customer_name;
      if (data.createdAt != undefined) {
        function formatDate(input) {
          const [date, time] = input.split(" ");
          const [day, month, year] = date.split("-");
          const [hours, minutes] = time.split(":");
          const seconds = "00";
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
        const formattedDate = formatDate(data.createdAt);

        var createdAt = formattedDate;
        var data = {
          id_user,
          id_department,
          user_id,
          reminder_date,
          subject,
          reminder,
          phone_number,
          created_type,
          created_id,
          customer_name,
          createdAt,
        };
      } else {
        var data = {
          id_user,
          id_department,
          user_id,
          reminder_date,
          subject,
          reminder,
          phone_number,
          created_type,
          created_id,
          customer_name,
        };
      }
      arr.push(data);
    });
    var result = await reminderModel.bulkCreate(arr);
    var agent_map = Promise.all(
      result.map(async (value) => {
        value.status = 0;
        value.dataValues.isRead = 0;
        return value.dataValues;
      })
    );
    var outputRes = await agent_map;
    var obj = outputRes;
    var msg = "uploadReminder";
    if (agent_id && agent_id != undefined)
      var socket = await userSocket(agent_id, msg, obj);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_reminder_logs(req, res, next) {
  try {
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var phone_number = req.query.phone_number;
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    var reminderSql = `SELECT * from cc_reminder WHERE phone_number = '${phone_number}' AND id_user = '${id_user}' AND reminder_date != '0000-00-00 00:00:00' `;
    if (isSubAdmin == 1) {
      reminderSql += `AND id_department in (${id_department}) `;
    } else if (isDept == 1) {
      reminderSql += `AND id_department = '${req.token.id}' `;
    } else if (isAgent == 1) {
      reminderSql += `AND id_department = '${id_department}' `;
    }
    reminderSql += `order by id desc`;
    var [reminderRes] = await getConnection.query(reminderSql);
    if (reminderRes.length != 0) {
      var result = {
        customer: {
          customerName: reminderRes[0].customer_name,
          phone_number: reminderRes[0].phone_number,
        },
        logs: reminderRes,
      };
    } else {
      var result = {};
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_reminder_logs_by_agent(req, res, next) {
  try {
    var phone_number = req.query.phone_number;
    var agent_id = req.token.id;
    var reminderSql = `SELECT * from cc_reminder WHERE phone_number = '${phone_number}' and user_id='${agent_id}' order by cc_reminder.id desc`;
    var [reminderRes] = await getConnection.query(reminderSql);
    if (reminderRes.length != 0) {
      var result = {
        customer: {
          customerName: reminderRes[0].customer_name,
          phone_number: reminderRes[0].phone_number,
        },
        logs: reminderRes,
      };
    } else {
      var result = {};
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_read_reminder(req, res, next) {
  try {
    var id = req.body.id;
    if (id.length != 0) {
      var sql = `UPDATE cc_reminder SET isRead=1 WHERE id In(${id}) `;
      var [result] = await sequelize.query(sql);
    } else {
      var result = [];
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function get_agents_by_id_user_bydept(req, res, next) {
  try {
    var id_department = req.query.id_department;
    var id_user = req.token.id_user;
    var type = req.token.type;
    var sql = `select CONCAT(user.first_name, ' ', user.last_name) as name,id,upload_image from user where id_department = ${id_department} and id_user = ${id_user}`;
    var [result] = await getConnection.query(sql);

    if (result.length != 0) {
      var ids = result.map((user) => user.id).join(", ");
      var sqlRole = `select id,user_id, role  from user_role where user_id in (${ids})`;
      var [ResultSqlRole] = await getConnection.query(sqlRole);
    }

    const mergedArray = result.map((user) => {
      const userRoles = ResultSqlRole.filter((role) => role.user_id == user.id);

      const roles = {};

      // Check for 'pbx' role
      roles.pbx = userRoles.some((role) => role.role == "1") ? 1 : 0;

      // Check for 'callcenter' role
      roles.callcenter = userRoles.some((role) => role.role == "2") ? 1 : 0;

      // Check for 'lead' role
      roles.lead = userRoles.some((role) => role.role == "3") ? 1 : 0;

      // Check for 'ticket' role
      roles.ticket = userRoles.some((role) => role.role == "4") ? 1 : 0;

      return {
        ...user,
        role: roles,
      };
    });
    var results = [mergedArray];

    res.locals.result = mergedArray;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function insert_broadcast_event(req, res, next) {
  try {
    var event_name = req.body.event_name;
    var event_date_time = req.body.event_date_time;
    var dtmf_key = req.body.dtmf_key;
    var campaign_id = req.body.campaign_id;

    var data = { event_name, dtmf_key, event_date_time, campaign_id };
    var result = await broadcastEventModel.create(data);
    res.locals.result = result;
    next();
  } catch (err) {
    res.locals.result = "err";
    next();
  }
}
async function get_all_broadcast_event(req, res, next) {
  try {
    var limits = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limits;
    var campaign_id = req.query.campaign_id;
    var dtmf_key = req.query.dtmf_key;
    var sql = "SELECT * FROM broadcast_event WHERE 1 ";
    var sqlCount = "SELECT COUNT(id) as total FROM broadcast_event where 1 ";
    if (campaign_id != undefined) {
      sql += `and campaign_id like '%${campaign_id}%' `;
      sqlCount += `and campaign_id like '%${campaign_id}%' `;
    }
    if (dtmf_key != undefined) {
      sql += `and dtmf_key like '%${dtmf_key}%' `;
      sqlCount += `and dtmf_key like '%${dtmf_key}%' `;
    }
    sql += `order by id desc limit ${skip},${limits}`;
    sqlCount += `order by id desc `;
    var [broadcast_event] = await getConnection.query(sql);
    var [count] = await getConnection.query(sqlCount);
    res.locals.result = broadcast_event;
    res.locals.count = count[0].total;
    next();
  } catch (err) {
    res.locals.result = "err";
    next();
  }
}

async function get_agent(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_department = req.token.id_department;
    var id_department_query = req.query.id_department;
    var sql = `
    SELECT user.id, CONCAT(user.first_name, ' ', user.last_name) AS name ,upload_image
    FROM user 
    JOIN user_role ON user_role.user_id = user.id 
    WHERE user_role.role IN (1, 2) AND user.id_user = ${id_user} `;

    if (id_department_query != undefined) {
      sql += `AND user.id_department IN (${id_department_query}) `;
    } else if (isSubAdmin == 1) {
      sql += `AND user.id_department IN (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND user.id_department = ${req.token.id} `;
    }
    var [result] = await getConnection.query(sql);

    if (result.length != 0) {
      var ids = result.map((user) => user.id).join(", ");
      var sqlRole = `select id,user_id, role  from user_role where user_id in (${ids})`;
      var [ResultSqlRole] = await getConnection.query(sqlRole);
    }

    const mergedArray = result.map((user) => {
      const userRoles = ResultSqlRole.filter((role) => role.user_id == user.id);

      const roles = {};

      // Check for 'pbx' role
      roles.pbx = userRoles.some((role) => role.role == "1") ? 1 : 0;

      // Check for 'callcenter' role
      roles.callcenter = userRoles.some((role) => role.role == "2") ? 1 : 0;

      // Check for 'lead' role
      roles.lead = userRoles.some((role) => role.role == "3") ? 1 : 0;

      // Check for 'ticket' role
      roles.ticket = userRoles.some((role) => role.role == "4") ? 1 : 0;

      return {
        ...user,
        role: roles,
      };
    });
    var results = [mergedArray];

    res.locals.result = results[0];
    next();
  } catch (err) {
    res.locals.result = "err";
    next();
  }
}

async function get_musiconhold(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var sql = `select name,moh_name,id from musiconhold where id_user = ${id_user} `;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    res.locals.result = "err";
    next();
  }
}
async function get_audiofiles(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var sql = `select filename,systemfilename from audiofiles where id_user = ${id_user} `;
    if (isSubAdmin == 1) {
      sql += `where id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `where id_department = '${req.token.id}' `;
    } else if (isAgent == 1) {
      sql += `where id_department = '${id_department}' `;
    }
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    res.locals.result = "err";
    next();
  }
}

async function get_subadmin_dept_by_id(req, res, next) {
  try {
    var type = 2;
    if (type == 2) {
      var sql = `SELECT departments.name AS dept_name, departments.id AS dept_id FROM departments JOIN subadmin_departments ON subadmin_departments.id_dept = departments.id WHERE subadmin_departments.id_subadmin = 4 `;
      var [result] = await getConnection.query(sql);
      res.locals.result = result;
      next();
    }
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function get_hourly_duration_report(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var date = req.query.date;
    var fromdatetime = new Date();
    var todatetime = new Date();
    if (date != undefined) {
      if (date == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      // if (date == "lastweek") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 7)
      // }
      // if (date == "lastmonth") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 31)
      // }
      // var currentdate = fromdatetime.getDate();
      // var currentMnth = fromdatetime.getMonth() + 1;
      // var year = fromdatetime.getFullYear();
      // var fromDate = `${year}-${currentMnth}-${currentdate}`;
      if (date == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (date == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var Todate = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("fromDate :", fromDate);
      console.log("Todate :", Todate);
    } else {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
      var Todate = `${yyyy}-${mm}-${dd} 23:59:59`;
      console.log("fromDate :", fromDate);
      console.log("Todate :", Todate);
    }
    var incomingSql = `SELECT DATE_FORMAT(call_start_time, '%Y-%m-%d %H:00:00') AS hour, COUNT(*) AS total_sum,sum(total_duration) as totalduration,user_status as callStatus FROM incoming_reports WHERE call_start_time between '${fromDate}' AND '${Todate}' and incoming_reports.id_user = '${id_user}' `;
    if (isSubAdmin == 1) {
      incomingSql += `and incoming_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      incomingSql += `and incoming_reports.id_department = '${req.token.id}' `;
    } else if (isAgent == 1) {
      incomingSql += `and incoming_reports.id_department = '${id_department}' `;
    }
    incomingSql += `GROUP BY hour,user_status ORDER BY hour `;
    var [incomingRes] = await getConnection.query(incomingSql);
    var outgoingSql = `SELECT DATE_FORMAT(date, '%Y-%m-%d %H:00:00') AS hour, COUNT(*) AS total_sum,sum(duration) as totalduration, status as callStatus FROM cc_outgoing_reports WHERE date between '${fromDate}' AND '${Todate}' `;
    if (isAdmin == 1) {
      outgoingSql += `and cc_outgoing_reports.id_user = '${id_user}' `;
    } else if (isSubAdmin == 1) {
      outgoingSql += `and cc_outgoing_reports.id_department in (${id_department}) AND cc_outgoing_reports.id_user = '${id_user}' `;
    } else if (isDept == 1) {
      outgoingSql += `and cc_outgoing_reports.id_department = '${req.token.id}' AND id_user = '${id_user}' `;
    } else if (isAgent == 1) {
      outgoingSql += `and cc_outgoing_reports.id_department = '${id_department}' AND id_user = '${id_user}' `;
    }
    outgoingSql += `GROUP BY hour,callStatus ORDER BY hour `;
    var [outgoingRes] = await getConnection.query(outgoingSql);
    var incomingStorage = [];
    var outgoingStorage = [];
    if (incomingRes.length != 0) {
      var map_result = Promise.all(
        incomingRes.map(async (incoming) => {
          var dateSplit = incoming.hour.split(" ");
          if (incomingStorage.length == 0) {
            incomingStorage.push({
              hour: dateSplit[1],
              duration: incoming.totalduration,
              notConnected: 0,
              connected: 0,
            });
            if (incoming.callStatus == "ANSWERED") {
              incomingStorage[0].connected = incoming.total_sum;
            } else if (
              incoming.callStatus != "ANSWERED" ||
              incoming.callStatus == ""
            ) {
              incomingStorage[0].notConnected = incoming.total_sum;
            }
          } else {
            let foundObject = incomingStorage.findIndex(
              (obj) => obj.hour === dateSplit[1]
            );
            if (foundObject != -1) {
              if (incoming.callStatus == "ANSWERED") {
                incomingStorage[foundObject].connected += incoming.total_sum;
              } else if (
                incoming.callStatus != "ANSWERED" ||
                incoming.callStatus == ""
              ) {
                incomingStorage[foundObject].notConnected += incoming.total_sum;
              }
              incomingStorage[foundObject].duration =
                Number(incomingStorage[foundObject].duration) +
                Number(incoming.totalduration);
            } else {
              incomingStorage.push({
                hour: dateSplit[1],
                duration: incoming.totalduration,
                notConnected: 0,
                connected: 0,
                busy: 0,
                cancelled: 0,
              });
              var incominglength = incomingStorage.length - 1;
              if (incoming.callStatus == "ANSWERED") {
                incomingStorage[incominglength].connected = incoming.total_sum;
              } else if (
                incoming.callStatus != "ANSWERED" ||
                incoming.callStatus == ""
              ) {
                incomingStorage[incominglength].notConnected =
                  incoming.total_sum;
              }
            }
          }
        })
      );
      var output = await map_result;
    }
    if (outgoingRes.length != 0) {
      var map_result1 = Promise.all(
        outgoingRes.map(async (outgoing) => {
          var dateSplit = outgoing.hour.split(" ");
          if (outgoingStorage.length == 0) {
            outgoingStorage.push({
              hour: dateSplit[1],
              duration: outgoing.totalduration,
              notConnected: 0,
              connected: 0,
              busy: 0,
              cancelled: 0,
            });
            if (
              outgoing.callStatus == "busy" ||
              outgoing.callStatus == "BUSY"
            ) {
              outgoingStorage[0].busy = outgoing.total_sum;
            } else if (
              outgoing.callStatus == "ANSWERED" ||
              outgoing.callStatus == "ANSWER"
            ) {
              outgoingStorage[0].connected = outgoing.total_sum;
            } else if (
              outgoing.callStatus == "NO ANSWER" ||
              outgoing.callStatus == "NOANSWER" ||
              outgoing.callStatus == ""
            ) {
              outgoingStorage[0].notConnected = outgoing.total_sum;
            } else if (outgoing.callStatus == "CANCEL") {
              outgoingStorage[0].cancelled = outgoing.total_sum;
            }
          } else {
            let foundObject = outgoingStorage.findIndex(
              (obj) => obj.hour === dateSplit[1]
            );
            if (foundObject != -1) {
              if (
                outgoing.callStatus == "busy" ||
                outgoing.callStatus == "BUSY"
              ) {
                outgoingStorage[foundObject].busy += outgoing.total_sum;
              } else if (
                outgoing.callStatus == "ANSWERED" ||
                outgoing.callStatus == "ANSWER"
              ) {
                outgoingStorage[foundObject].connected += outgoing.total_sum;
              } else if (
                outgoing.callStatus == "NO ANSWER" ||
                outgoing.callStatus == "NOANSWER" ||
                outgoing.callStatus == " "
              ) {
                outgoingStorage[foundObject].notConnected += outgoing.total_sum;
              } else if (outgoing.callStatus == "CANCEL") {
                outgoingStorage[foundObject].cancelled += outgoing.total_sum;
              }
              outgoingStorage[foundObject].duration =
                Number(outgoingStorage[foundObject].duration) +
                Number(outgoing.totalduration);
            } else {
              outgoingStorage.push({
                hour: dateSplit[1],
                duration: outgoing.totalduration,
                notConnected: 0,
                connected: 0,
                busy: 0,
                cancelled: 0,
              });
              var outgoinglength = outgoingStorage.length - 1;
              if (
                outgoing.callStatus == "busy" ||
                outgoing.callStatus == "BUSY"
              ) {
                outgoingStorage[outgoinglength].busy = outgoing.total_sum;
              } else if (
                outgoing.callStatus == "ANSWERED" ||
                outgoing.callStatus == "ANSWER"
              ) {
                outgoingStorage[outgoinglength].connected = outgoing.total_sum;
              } else if (
                outgoing.callStatus == "NO ANSWER" ||
                outgoing.callStatus == "NOANSWER" ||
                outgoing.callStatus == ""
              ) {
                outgoingStorage[outgoinglength].notConnected =
                  outgoing.total_sum;
              } else if (outgoing.callStatus == "CANCEL") {
                outgoingStorage[outgoinglength].cancelled = outgoing.total_sum;
              }
            }
          }
        })
      );
      var output1 = await map_result1;
    }
    var data = [];
    incomingStorage.map(async (incoming) => {
      if (outgoingStorage.length != 0) {
        outgoingStorage.map(async (outgoing) => {
          if (incoming.hour == outgoing.hour) {
            data.push({
              hour: incoming.hour,
              duration: Number(incoming.duration) + Number(outgoing.duration),
              connected:
                Number(incoming.connected) + Number(outgoing.connected),
              notConnected:
                Number(incoming.notConnected) + Number(outgoing.notConnected),
              busy: Number(outgoing.busy),
              cancelled: Number(outgoing.cancelled),
            });
          }
        });
      } else {
        data.push({
          hour: incoming.hour,
          duration: Number(incoming.duration),
          connected: Number(incoming.connected),
          notConnected: Number(incoming.notConnected),
          busy: 0,
          cancelled: 0,
        });
      }
    });
    var incoming = incomingStorage.filter(
      (item) => !data.some((cond) => cond.hour === item.hour)
    );
    var outgoing = outgoingStorage.filter(
      (item) => !data.some((cond) => cond.hour === item.hour)
    );
    let joinedArray = data.concat(incoming, outgoing);
    joinedArray.sort((a, b) => {
      if (a.hour < b.hour) return -1;
      if (a.hour > b.hour) return 1;
      return 0;
    });
    var map_result2 = Promise.all(
      joinedArray.map(async (value) => {
        var hour = value.hour.split(":");
        var [hours, minutes, seconds] = value.hour.split(":").map(Number);
        var newHours = (hours + 1) % 24;
        var resultTime = `${newHours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        var endtime = resultTime.split(":");
        value.hour =
          hour[0] + ":" + hour[1] + " - " + endtime[0] + ":" + endtime[1];
        return value;
      })
    );
    var result = await map_result2;

    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_hourly_duration_by_support(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var date = req.query.date;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (date != undefined && date) {
      date = date.split("-");
      var Start = `${yyyy}-${mm}-${dd} ${date[0]}`;
      var End = `${yyyy}-${mm}-${dd} ${date[1]}`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var agentIncomingSql = `SELECT connected_user as answeredAgent,COUNT(*) AS total_sum,sum(duration) as totalduration,user_status as callStatus,uCONCAT(user.first_name, ' ', user.last_name) as agentName,user.id as id_agent FROM incoming_reports JOIN user ON connected_user_id = user.id WHERE call_start_time  between '${Start}' and '${End}' and incoming_reports.id_user = '${id_user}' `;
    if (isSubAdmin == 1) {
      agentIncomingSql += `and incoming_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      agentIncomingSql += `and incoming_reports.id_department = '${req.token.id}' `;
    } else if (isAgent == 1) {
      agentIncomingSql += `and incoming_reports.id_department = '${id_department}' `;
    }
    agentIncomingSql += `GROUP BY connected_user,callStatus `;
    var [agentIncomingRes] = await getConnection.query(agentIncomingSql);
    var agentOutgoingSql = `SELECT agent, COUNT(*) AS total_sum,sum(duration) as totalduration, callStatus,CONCAT(user.first_name, ' ', user.last_name) as agentName,user.id as id_agent  FROM cc_outgoing_reports JOIN user ON cc_outgoing_reports.user_id = user.id WHERE cc_outgoing_reports.date between '${Start}' and '${End}' `;
    if (isAdmin == 1) {
      agentOutgoingSql += `and cc_outgoing_reports.id_user = '${id_user}' `;
    } else if (isSubAdmin == 1) {
      agentOutgoingSql += `and cc_outgoing_reports.id_department in (${id_department}) AND cc_outgoing_reports.id_user = '${id_user}' `;
    } else if (isDept == 1) {
      agentOutgoingSql += `and cc_outgoing_reports.id_department = '${req.token.id}' AND id_user = '${id_user}' `;
    } else if (isAgent == 1) {
      agentOutgoingSql += `and cc_outgoing_reports.id_department = '${id_department}' AND id_user = '${id_user}' `;
    }
    agentOutgoingSql += `GROUP BY agent,callStatus `;
    var [agentOutgoingRes] = await getConnection.query(agentOutgoingSql);
    var incomingCountByAgent = [];
    var outgoingCountByAgent = [];
    agentIncomingRes.map(async (value) => {
      if (incomingCountByAgent.length == 0) {
        incomingCountByAgent.push({
          notConnected: 0,
          connected: 0,
          busy: 0,
          cancelled: 0,
          agentName: "",
          agentId: "",
        });
        if (value.callStatus == "busy" || value.callStatus == "BUSY") {
          incomingCountByAgent[0].busy = value.total_sum;
        } else if (value.callStatus == "ANSWERED") {
          incomingCountByAgent[0].connected = value.total_sum;
        } else if (
          value.callStatus == "NO ANSWER" ||
          value.callStatus == "NOANSWER" ||
          value.callStatus == ""
        ) {
          incomingCountByAgent[0].notConnected = value.total_sum;
        } else if (value.callStatus == "CANCEL") {
          incomingCountByAgent[0].cancelled = value.total_sum;
        }
        incomingCountByAgent[0].agentName = value.agentName;
        incomingCountByAgent[0].agentId = value.id_agent;
      } else {
        let foundObject = incomingCountByAgent.findIndex(
          (obj) => obj.agentId === value.id_agent
        );
        if (foundObject != -1) {
          if (value.callStatus == "busy" || value.callStatus == "BUSY") {
            incomingCountByAgent[foundObject].busy += value.total_sum;
          } else if (value.callStatus == "ANSWERED") {
            incomingCountByAgent[foundObject].connected += value.total_sum;
          } else if (
            value.callStatus == "NO ANSWER" ||
            value.callStatus == "NOANSWER" ||
            value.callStatus == ""
          ) {
            incomingCountByAgent[foundObject].notConnected += value.total_sum;
          } else if (value.callStatus == "CANCEL") {
            incomingCountByAgent[foundObject].cancelled += value.total_sum;
          }
          incomingCountByAgent[foundObject].agentName = value.agentName;
          incomingCountByAgent[foundObject].agentId = value.id_agent;
        } else {
          incomingCountByAgent.push({
            notConnected: 0,
            connected: 0,
            busy: 0,
            cancelled: 0,
            agentName: "",
            agentId: "",
          });
          var valuelength = incomingCountByAgent.length - 1;
          if (value.callStatus == "busy" || value.callStatus == "BUSY") {
            incomingCountByAgent[valuelength].busy = value.total_sum;
          } else if (value.callStatus == "ANSWERED") {
            incomingCountByAgent[valuelength].connected = value.total_sum;
          } else if (
            value.callStatus == "NO ANSWER" ||
            value.callStatus == "NOANSWER" ||
            value.callStatus == ""
          ) {
            incomingCountByAgent[valuelength].notConnected = value.total_sum;
          } else if (value.callStatus == "CANCEL") {
            incomingCountByAgent[valuelength].cancelled = value.total_sum;
          }
          incomingCountByAgent[valuelength].agentName = value.agentName;
          incomingCountByAgent[valuelength].agentId = value.id_agent;
        }
      }
    });
    agentOutgoingRes.map(async (value) => {
      if (outgoingCountByAgent.length == 0) {
        outgoingCountByAgent.push({
          notConnected: 0,
          connected: 0,
          busy: 0,
          cancelled: 0,
          agentName: "",
          agentId: "",
        });
        if (value.callStatus == "busy" || value.callStatus == "BUSY") {
          outgoingCountByAgent[0].busy = value.total_sum;
        } else if (value.callStatus == "ANSWERED") {
          outgoingCountByAgent[0].connected = value.total_sum;
        } else if (
          value.callStatus == "NO ANSWER" ||
          value.callStatus == "NOANSWER" ||
          value.callStatus == ""
        ) {
          outgoingCountByAgent[0].notConnected = value.total_sum;
        } else if (value.callStatus == "CANCEL") {
          outgoingCountByAgent[0].cancelled = value.total_sum;
        }
        outgoingCountByAgent[0].agentName = value.agentName;
        outgoingCountByAgent[0].agentId = value.id_agent;
      } else {
        let foundObject = outgoingCountByAgent.findIndex(
          (obj) => obj.agentId === value.id_agent
        );
        if (foundObject != -1) {
          if (value.callStatus == "busy" || value.callStatus == "BUSY") {
            outgoingCountByAgent[foundObject].busy += value.total_sum;
          } else if (value.callStatus == "ANSWERED") {
            outgoingCountByAgent[foundObject].connected += value.total_sum;
          } else if (
            value.callStatus == "NO ANSWER" ||
            value.callStatus == "NOANSWER" ||
            value.callStatus == ""
          ) {
            outgoingCountByAgent[foundObject].notConnected += value.total_sum;
          } else if (value.callStatus == "CANCEL") {
            outgoingCountByAgent[foundObject].cancelled += value.total_sum;
          }
          outgoingCountByAgent[foundObject].agentName = value.agentName;
          outgoingCountByAgent[foundObject].agentId = value.id_agent;
        } else {
          outgoingCountByAgent.push({
            notConnected: 0,
            connected: 0,
            busy: 0,
            cancelled: 0,
            agentName: "",
            agentId: "",
          });
          var valuelength = outgoingCountByAgent.length - 1;
          if (value.callStatus == "busy" || value.callStatus == "BUSY") {
            outgoingCountByAgent[valuelength].busy = value.total_sum;
          } else if (value.callStatus == "ANSWERED") {
            outgoingCountByAgent[valuelength].connected = value.total_sum;
          } else if (
            value.callStatus == "NO ANSWER" ||
            value.callStatus == "NOANSWER" ||
            value.callStatus == ""
          ) {
            outgoingCountByAgent[valuelength].notConnected = value.total_sum;
          } else if (value.callStatus == "CANCEL") {
            outgoingCountByAgent[valuelength].cancelled = value.total_sum;
          }
          outgoingCountByAgent[valuelength].agentName = value.agentName;
          outgoingCountByAgent[valuelength].agentId = value.id_agent;
        }
      }
    });
    var agentData = [];
    incomingCountByAgent.map(async (incoming) => {
      outgoingCountByAgent.map(async (outgoing) => {
        if (incoming.agentId == outgoing.agentId) {
          agentData.push({
            agentId: incoming.agentId,
            agentName: incoming.agentName,
            busy: Number(incoming.busy) + Number(outgoing.busy),
            cancelled: Number(incoming.cancelled) + Number(outgoing.cancelled),
            connected: Number(incoming.connected) + Number(outgoing.connected),
            notConnected:
              Number(incoming.notConnected) + Number(outgoing.notConnected),
          });
        }
      });
    });
    var agentIncoming = incomingCountByAgent.filter(
      (item) => !agentData.some((cond) => cond.agentId == item.agentId)
    );
    var agentOutgoing = outgoingCountByAgent.filter(
      (item) => !agentData.some((cond) => cond.agentId == item.agentId)
    );
    let agentJoinedArray = agentData.concat(agentIncoming, agentOutgoing);
    var agent_map = Promise.all(
      agentJoinedArray.map(async (value) => {
        value.totalCall =
          Number(value.notConnected) +
          Number(value.connected) +
          Number(value.cancelled) +
          Number(value.busy);
        return value;
      })
    );
    var outputRes = await agent_map;
    res.locals.result = outputRes;
    res.locals.count = outputRes.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function get_dashboard_call_count(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
    var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    var didNumber = req.query.didnumber;
    var id_department = req.query.id_department;
    var sqlCountIncoming = `select user_status as agentStatus,call_status as callStatus,connected_duration as answeredDuration,destination as didNumber from incoming_reports where call_start_time between '${Start}' and '${End}' AND incoming_reports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      sqlCountIncoming += `AND incoming_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sqlCountIncoming += `AND incoming_reports.id_department='${req.token.id}' `;
    }
    var [incomingCount] = await getConnection.query(sqlCountIncoming);
    var incomingConnected = 0;
    var incomingNotConnected = 0;
    var incomingCountRes = incomingCount.length;
    if (incomingCount.length != 0) {
      incomingCount.map(async (incomingData) => {
        if (didNumber != undefined) {
          if (
            incomingData.didNumber == didNumber ||
            incomingData.didNumber == "0" + didNumber ||
            incomingData.didNumber == "91" + didNumber
          ) {
            if (incomingData.answeredDuration != 0) {
              incomingConnected += 1;
            } else if (
              incomingData.agentStatus == "NO ANSWER" ||
              incomingData.agentStatus == "NOANSWER"
            ) {
              incomingNotConnected += 1;
            }
          }
          incomingCountRes = incomingConnected + incomingNotConnected;
        } else {
          if (incomingData.answeredDuration != 0) {
            incomingConnected += 1;
          } else if (
            incomingData.agentStatus == "NO ANSWER" ||
            incomingData.agentStatus == "NOANSWER"
          ) {
            incomingNotConnected += 1;
          }
        }
      });
    }
    var sqlCountOutgoing = `select duration,callerid from cc_outgoing_reports where date between '${Start}' and '${End}' `;
    if (isAdmin == 1) {
      sqlCountOutgoing += `AND cc_outgoing_reports.id_user='${id_user}' `;
    } else if (isSubAdmin == 1) {
      sqlCountOutgoing += `AND cc_outgoing_reports.id_department in (${id_department}) AND cc_outgoing_reports.id_user='${id_user}' `;
    } else if (isDept == 1) {
      sqlCountOutgoing += `AND cc_outgoing_reports.id_department='${req.token.id}' AND cc_outgoing_reports.id_user='${id_user}' `;
    }
    var [outgoingCount] = await getConnection.query(sqlCountOutgoing);
    var outgoingCountRes = outgoingCount.length;
    var outgoingConnected = 0;
    var outgoingNotConnected = 0;
    if (outgoingCount.length != 0) {
      outgoingCount.map(async (outgoingData) => {
        if (didNumber != undefined) {
          if (
            outgoingData.callerid == didNumber ||
            outgoingData.callerid == "0" + didNumber ||
            outgoingData.callerid == "91" + didNumber ||
            outgoingData.callerid == "+" + didNumber
          ) {
            if (outgoingData.duration != 0) {
              outgoingConnected += 1;
            } else {
              outgoingNotConnected += 1;
            }
          }
          outgoingCountRes = outgoingConnected + outgoingNotConnected;
        } else {
          if (outgoingData.duration != 0) {
            outgoingConnected += 1;
          } else {
            outgoingNotConnected += 1;
          }
        }
      });
    }
    if (req.query.id_department != undefined) {
      var id_dept = req.query.id_department;
    } else if (isAdmin == 1) {
      var id_dept = 0;
    } else if (isSubAdmin == 1) {
      var id_dept = req.token.id_department;
    } else if (isDept == 1) {
      var id_dept = req.token.id;
    }

    if (
      process.env.PRODUCTION == "development" ||
      process.env.PRODUCTION == "local"
    ) {
      var livecallFilteredData = [
        {
          type: "report",
          eventTime: "2025-04-24 15:43:02",
          uniqueId: "4083820250424154302000",
          dialedNumber: "919778406951",
          didNumber: "918069255954",
          sourceChannel: "SIP/MtvhyEVb-004653e4",
          customerId: "13",
          deptId: "0",
          userId: "94",
          direction: "outgoing",
          liveKey: "40838",
          callType: "Direct",
          zohoStatus: "0",
          lsqStatus: "0",
          apiOutStart: "0",
          apiOutConnect: "0",
          apiOutDisconnect: "0",
          apiOutCdr: "0",
          didOutSms: "0",
          didOutWhatsapp: "0",
          callProcessId: "",
          event: "start",
          status: 1,
        },
        {
          type: "report",
          eventTime: "2025-04-24 15:45:06",
          uniqueId: "1857420250424154506000",
          dialedNumber: "919778406951",
          didNumber: "918069255954",
          sourceChannel: "SIP/MtvhyEVb-00465655",
          customerId: "13",
          deptId: "0",
          userId: "94",
          direction: "outgoing",
          liveKey: "18574",
          callType: "Direct",
          zohoStatus: "0",
          lsqStatus: "0",
          apiOutStart: "0",
          apiOutConnect: "0",
          apiOutDisconnect: "0",
          apiOutCdr: "0",
          didOutSms: "0",
          didOutWhatsapp: "0",
          callProcessId: "",
          event: "start",
          answeredTime: "2025-04-24 15:45:10",
          currentStatus: 1,
          appId: "94",
          app: "user",
          eventStatus: "dial_answered",
          status: 2,
        },
        {
          type: "report",
          eventTime: "2025-04-24 15:46:48",
          uniqueId: "in3696020250424154648000",
          callerNumber: "919400265768",
          didNumber: "918069256279",
          sourceChannel: "SIP/Bengaluru-00465842",
          customerId: "13",
          deptId: "0",
          app: "user",
          appId: "94",
          direction: "incoming",
          liveKey: "970745",
          zohoStatus: "0",
          lsqStatus: "0",
          apiInStart: "1",
          apiInConnect: "1",
          apiInDisconnect: "1",
          apiInCdr: "1",
          apiInDtmf: "0",
          apiInRoute: "0",
          didInSms: "0",
          didInWhatsapp: "0",
          event: "start",
          status: 1,
          userId: "94",
        },
        {
          type: "report",
          eventTime: "2025-04-24 15:47:38",
          uniqueId: "in5793220250424154738000",
          callerNumber: "919778406951",
          didNumber: "918069256279",
          sourceChannel: "SIP/Bengaluru-0046593b",
          customerId: "13",
          deptId: "0",
          app: "user",
          appId: "94",
          direction: "incoming",
          liveKey: "985999",
          zohoStatus: "0",
          lsqStatus: "0",
          apiInStart: "1",
          apiInConnect: "1",
          apiInDisconnect: "1",
          apiInCdr: "1",
          apiInDtmf: "0",
          apiInRoute: "0",
          didInSms: "0",
          didInWhatsapp: "0",
          event: "start",
          answeredTime: "2025-04-24 15:47:41",
          currentStatus: 1,
          eventStatus: "dial_answered",
          status: 2,
          userId: "94",
        },
      ];
    } else if (
      process.env.PRODUCTION == "developmentLive" ||
      process.env.PRODUCTION == "live"
    ) {
      if (isAdmin == 1) {
        id_department = 0;
      } else if (isSubAdmin == 1) {
        id_department = id_dept.split(",").map(Number);
      } else if (isDept == 1) {
        id_department = [id_dept];
      }
      var livecallFilteredData = await get_live_data(id_user, id_department);
    }

    var live_start = new Date(Start);
    var live_end = new Date(End);

    livecallFilteredData = livecallFilteredData.filter((item) => {
      const eventTime = new Date(item.eventTime.replace(" ", "T"));
      const currentTime = new Date();
      const fifteenMinutesAgo = new Date(currentTime.getTime() - 59 * 60000);

      return eventTime >= fifteenMinutesAgo && eventTime <= currentTime;
    });

    const counts = livecallFilteredData.reduce(
      (acc, item) => {
        if (item.direction === "incoming") acc.incoming++;
        if (item.direction === "outgoing") acc.outgoing++;
        return acc;
      },
      { incoming: 0, outgoing: 0 }
    );

    // campaign outgoing count
    var campaign_count = 0;
    var campaignConnected = 0;
    var campaignNotConnected = 0;
    var campaignCount = `SELECT duration,callerid FROM cc_campaign_outgoing_reports where createdAt between '${Start}' and '${End}' AND cc_campaign_outgoing_reports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      sqlCountOutgoing += `AND cc_campaign_outgoing_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sqlCountOutgoing += `AND cc_campaign_outgoing_reports.id_department='${req.token.id}' `;
    }
    var [campaign_outgoingCount] = await getConnection.query(campaignCount);
    if (campaign_outgoingCount.length != 0) {
      if (process.env.PROJECT != "AKSHAYAGOLD") {
        outgoingCountRes += campaign_outgoingCount.length;
        campaign_outgoingCount.map(async (outgoingData) => {
          if (didNumber != undefined) {
            if (
              outgoingData.callerid == didNumber ||
              outgoingData.callerid == "0" + didNumber ||
              outgoingData.callerid == "91" + didNumber
            ) {
              if (outgoingData.duration != 0) {
                outgoingConnected += 1;
              } else {
                outgoingNotConnected += 1;
              }
            }
            outgoingCountRes = outgoingConnected + outgoingNotConnected;
          } else {
            if (outgoingData.duration != 0) {
              outgoingConnected += 1;
            } else {
              outgoingNotConnected += 1;
            }
          }
        });
      } else {
        campaign_count = campaign_outgoingCount.length;
        var campaignConnected = 0;
        var campaignNotConnected = 0;
        campaign_outgoingCount.map(async (outgoingData) => {
          if (didNumber != undefined) {
            if (
              outgoingData.callerid == didNumber ||
              outgoingData.callerid == "0" + didNumber ||
              outgoingData.callerid == "91" + didNumber
            ) {
              if (outgoingData.duration != 0) {
                campaignConnected += 1;
              } else {
                campaignNotConnected += 1;
              }
            }
          } else {
            if (outgoingData.duration != 0) {
              campaignConnected += 1;
            } else {
              campaignNotConnected += 1;
            }
          }
        });
      }
    }
    var liveIncoming = counts.incoming;
    var liveOutgoing = counts.outgoing;
    var liveCall = liveIncoming + liveOutgoing;
    if (process.env.PROJECT != "AKSHAYAGOLD") {
      var result = {
        incoming_count: incomingCountRes,
        incomingConnected: incomingConnected,
        incomingNotConnected: incomingNotConnected,
        outgoing_count: outgoingCountRes,
        outgoingNotConnected: outgoingNotConnected,
        outgoingConnected: outgoingConnected,
        liveCall: liveCall,
        liveIncoming: liveIncoming,
        liveOutgoing: liveOutgoing,
      };
    } else {
      var result = {
        incoming_count: incomingCountRes,
        incomingConnected: incomingConnected,
        incomingNotConnected: incomingNotConnected,
        outgoing_count: outgoingCountRes,
        outgoingNotConnected: outgoingNotConnected,
        outgoingConnected: outgoingConnected,
        campaign_count: campaign_count,
        campaignNotConnected: campaignNotConnected,
        campaignConnected: campaignConnected,
        liveCall: liveCall,
        liveIncoming: liveIncoming,
        liveOutgoing: liveOutgoing,
      };
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function dashboard_agent_list(req, res, next) {
  try {
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var Sql = `SELECT CONCAT(user.first_name, ' ', user.last_name) as name,currentBreakName,loginStartTime,lastCallEndTime FROM user LEFT JOIN user_live_data ON user.id = user_live_data.user_id WHERE isLogin =1 and id_user = ${id_user}  `;
    if (isSubAdmin == 1) {
      Sql += `and id_department in(${id_department}) `;
    } else if (isDept == 1) {
      Sql += `and id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      Sql += `and id_department = ${id_department} `;
    }
    var [result] = await getConnection.query(Sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function add_roundrobin_allocation(
  type,
  data,
  agent_id,
  callUniqueId,
  eventDate
) {
  try {
    var roundrobinData = { callUniqueId, agent_id, data, type, eventDate };
    var result = await roundrobin_allocation.create(roundrobinData);
  } catch (err) {
    console.log(err);
  }
}
async function get_uniqueId_roundrobin(req, res, next) {
  try {
    var callUniqueId = req.query.callUniqueId;
    var sql = `SELECT roundrobin_allocation.*,CONCAT(user.first_name, ' ', user.last_name) as username,user.id FROM roundrobin_allocation left join user on user.id = roundrobin_allocation.agent_id where callUniqueId like '${callUniqueId}' `;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

// async function get_livecalls_report(req, res, next) {
//   try {
//     var isAdmin = req.token.isAdmin;
//     var isSubAdmin = req.token.isSubAdmin;
//     var isDept = req.token.isDept;
//     var isAgent = req.token.isAgent;
//     var id_department = req.token.id_department;
//     var id_user = req.token.id_user;
//     if (process.env.PRODUCTION == "development") {
//       var today = new Date();
//       var dd = today.getDate();
//       var mm = today.getMonth() + 1;
//       var yyyy = today.getFullYear();
//       var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
//       var End = `${yyyy}-${mm}-${dd} 23:59:59`;

//       if (req.query.id_department != undefined) {
//         var id_dept = req.query.id_department;
//       } else if (isAdmin == 1) {
//         var id_dept = 0;
//       } else if (isSubAdmin == 1) {
//         var id_dept = req.token.id_department;
//       } else if (isDept == 1) {
//         var id_dept = req.token.id;
//       }

//       if (
//         process.env.PRODUCTION == "development" ||
//         process.env.PRODUCTION == "local"
//       ) {
//         var liveCallIncomingCount = [
//           {
//             type: "report",
//             eventTime: "2025-07-02 19:42:00",
//             uniqueId: "4083820250424154302000",
//             dialedNumber: "919778406951",
//             didNumber: "918069255954",
//             sourceChannel: "SIP/MtvhyEVb-004653e4",
//             customerId: "13",
//             deptId: "0",
//             userId: "94",
//             direction: "outgoing",
//             liveKey: "40838",
//             callType: "Direct",
//             zohoStatus: "0",
//             lsqStatus: "0",
//             apiOutStart: "0",
//             apiOutConnect: "0",
//             apiOutDisconnect: "0",
//             apiOutCdr: "0",
//             didOutSms: "0",
//             didOutWhatsapp: "0",
//             callProcessId: "",
//             event: "start",
//             status: 1,
//           },
//           {
//             type: "report",
//             eventTime: "2025-05-06 19:42:00",
//             uniqueId: "1857420250424154506000",
//             dialedNumber: "919778406951",
//             didNumber: "918069255954",
//             sourceChannel: "SIP/MtvhyEVb-00465655",
//             customerId: "13",
//             deptId: "0",
//             userId: "94",
//             direction: "outgoing",
//             liveKey: "18574",
//             callType: "Direct",
//             zohoStatus: "0",
//             lsqStatus: "0",
//             apiOutStart: "0",
//             apiOutConnect: "0",
//             apiOutDisconnect: "0",
//             apiOutCdr: "0",
//             didOutSms: "0",
//             didOutWhatsapp: "0",
//             callProcessId: "",
//             event: "start",
//             answeredTime: "2025-04-24 15:45:10",
//             currentStatus: 1,
//             appId: "94",
//             app: "user",
//             eventStatus: "dial_answered",
//             status: 2,
//           },
//           {
//             type: "report",
//             eventTime: "2025-05-06 19:42:00",
//             uniqueId: "in3696020250424154648000",
//             callerNumber: "919400265768",
//             didNumber: "918069256279",
//             sourceChannel: "SIP/Bengaluru-00465842",
//             customerId: "13",
//             deptId: "0",
//             app: "user",
//             appId: "94",
//             direction: "incoming",
//             liveKey: "970745",
//             zohoStatus: "0",
//             lsqStatus: "0",
//             apiInStart: "1",
//             apiInConnect: "1",
//             apiInDisconnect: "1",
//             apiInCdr: "1",
//             apiInDtmf: "0",
//             apiInRoute: "0",
//             didInSms: "0",
//             didInWhatsapp: "0",
//             event: "start",
//             status: 1,
//             userId: "94",
//           },
//           {
//             type: "report",
//             eventTime: "2025-05-06 19:42:00",
//             uniqueId: "in5793220250424154738000",
//             callerNumber: "919778406951",
//             didNumber: "918069256279",
//             sourceChannel: "SIP/Bengaluru-0046593b",
//             customerId: "13",
//             deptId: "135",
//             app: "user",
//             appId: "94",
//             direction: "incoming",
//             liveKey: "985999",
//             zohoStatus: "0",
//             lsqStatus: "0",
//             apiInStart: "1",
//             apiInConnect: "1",
//             apiInDisconnect: "1",
//             apiInCdr: "1",
//             apiInDtmf: "0",
//             apiInRoute: "0",
//             didInSms: "0",
//             didInWhatsapp: "0",
//             event: "start",
//             answeredTime: "2025-04-24 15:47:41",
//             currentStatus: 1,
//             eventStatus: "dial_answered",
//             status: 2,
//             userId: "94",
//           },
//         ];
//       } else if (
//         process.env.PRODUCTION == "developmentLive" ||
//         process.env.PRODUCTION == "live"
//       ) {
//         if (isAdmin == 1) {
//           id_department = 0;
//         } else if (isSubAdmin == 1) {
//           console.log("id_dept ----->", id_dept);
//           id_department = id_dept.split(",").map(Number);
//         } else if (isDept == 1) {
//           id_department = [id_dept];
//         }
//         var liveCallIncomingCount = await get_live_data(id_user, id_department);
//       }

//       if (isDept == 1) {
//         liveCallIncomingCount = liveCallIncomingCount.filter(
//           (item) => item.deptId == id_department
//         );
//       }

//       if (liveCallIncomingCount.length !== 0) {
//         const currentTime = new Date();
//         const fifteenMinutesAgo = new Date(currentTime.getTime() - 59 * 60000);

//         liveCallIncomingCount = liveCallIncomingCount.filter((item) => {
//           const eventTime = new Date(item.eventTime.replace(" ", "T"));
//           console.log(
//             "eventTime,currentTime,fifteenMinutesAgo=====================================================",
//             eventTime,
//             currentTime,
//             fifteenMinutesAgo
//           );
//           return (
//             (eventTime >= fifteenMinutesAgo && eventTime <= currentTime) ||
//             eventTime > currentTime
//           );
//         });
//       } else {
//         liveCallIncomingCount = [];
//       }

//       console.log(
//         "resultLive1=============================================================================================",
//         liveCallIncomingCount
//       );

//       liveCallIncomingCount.sort((a, b) => {
//         return new Date(b.eventTime) - new Date(a.eventTime);
//       });

//       var updatedData = liveCallIncomingCount.map((item) => {
//         const { eventTime, liveKey, dialedNumber, ...rest } = item;
//         return {
//           ...rest,
//           date: eventTime,
//           CallBargingCode: liveKey,
//           contact_number: dialedNumber, // Rename 'dialedNumber' to 'contact_number'
//         };
//       });

//       var userIds = updatedData
//         .filter((item) => item.userId !== undefined)
//         .map((item) => item.userId);

//       if (userIds.length != 0) {
//         var userIdsList = `(${userIds.map((id) => `'${id}'`).join(",")})`;
//         var userSql = `select id,CONCAT(user.first_name, ' ', user.last_name) AS agentName,user.phn_number as agentNumber from user where id IN  ${userIdsList}`;
//         var [users] = await getConnection.query(userSql);
//       }

//       updatedData.map((item) => {
//         const matchedUser = users.find((user) => user.id == item.userId);
//         if (matchedUser) {
//           item.phn_number = matchedUser.phn_number;
//           item.agentName = matchedUser.agentName;
//         }
//       });

//       const deptIds = updatedData
//         .filter((item) => item.deptId !== undefined)
//         .map((item) => item.deptId);

//       if (deptIds.length != 0) {
//         var deptIdsList = `(${deptIds.map((id) => `'${id}'`).join(",")})`;
//         var userSql = `select id,name from departments where id IN  ${deptIdsList}`;
//         var [departments] = await getConnection.query(userSql);
//       }

//       updatedData.map((item) => {
//         const matchedDept = departments.find((dept) => dept.id == item.deptId);
//         if (matchedDept) {
//           item.departmentName = matchedDept.departmentName;
//         }
//       });
//       var result = updatedData;

//       if (req.token.phone_number_masking == 1) {
//         var map_result = Promise.all(
//           result.map(async (value) => {
//             var con_number = await string_encode(value.contact_number);
//             if (con_number) {
//               value.contact_number = con_number;
//             }
//             return value;
//           })
//         );
//         result = await map_result;
//       }

//       const sourceNumbers = result.map((entry) => entry.contact_number);
//       const contact_data = await contactsModel
//         .find(
//           { phone_number: { $in: sourceNumbers }, id_user: id_user },
//           { name: 1, phone_number: 1, _id: 0 }
//         )
//         .lean();
//       const updatedResult = result.map((item) => {
//         const match = contact_data.find((entry) =>
//           entry.phone_number.includes(item.contact_number)
//         );
//         if (match) {
//           return { ...item, contact_name: match.name };
//         }
//         return item;
//       });

//       res.locals.result = updatedResult;
//       next();
//     }






//     if (
//       process.env.PRODUCTION == "developmentLive" ||
//       process.env.PRODUCTION == "live"
//     ) {
//       if (isAdmin == 1) {
//         id_department = 0;
//       } else if (isSubAdmin == 1) {
//         id_department = id_department.split(",").map(Number);
//       } else if (isDept == 1) {
//         id_department = [id_department];
//       }
//       var result = await get_live_data(id_user, id_department);

//       if (isDept == 1) {
//         result = result.filter((item) => item.deptId == id_department);
//       }

//       console.log(
//         "result==========================================================================================",
//         result
//       );

//       if (result.length !== 0) {
//         const currentTime = new Date();
//         const fifteenMinutesAgo = new Date(currentTime.getTime() - 59 * 60000);

//         result = result.filter((item) => {
//           const eventTime = new Date(item.eventTime.replace(" ", "T"));
//           return (
//             (eventTime >= fifteenMinutesAgo && eventTime <= currentTime) ||
//             eventTime > currentTime
//           );
//         });
//       } else {
//         result = [];
//       }

//       console.log(
//         "result1==========================================================================================",
//         result
//       );
//       const sourceNumbers = result.map((entry) => entry.dialedNumber);
//       const contact_data = await contactsModel
//         .find(
//           { phone_number: { $in: sourceNumbers }, id_user: id_user },
//           { name: 1, phone_number: 1, _id: 0 }
//         )
//         .lean();

//       const updatedResult = result.map((item) => {
//         const match = contact_data.find((entry) =>
//           entry.phone_number.includes(item.dialedNumber)
//         );
//         if (match) {
//           return { ...item, contact_name: match.name };
//         }
//         return item;
//       });

//       res.locals.result = updatedResult;
//       // res.locals.result = result;
//       next();
//     }
//   } catch (err) {
//     console.log(err);
//     res.locals.result = "err";
//     next();
//   }
// }

async function get_livecalls_report(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    let result = []

    if (process.env.PRODUCTION === "development") {
      result = [
        {
          type: "report",
          eventTime: "2025-07-31 18:40:04",
          uniqueId: "in3383820250730124004000",
          callerNumber: "918156890110",
          didNumber: "914847110076",
          sourceChannel: "SIP/gateway-001bd471",
          customerId: "13",
          deptId: "152",
          app: "user",
          appId: "2916",
          direction: "incoming",
          liveKey: "700277",
          zohoStatus: "1",
          lsqStatus: "0",
          apiInStart: "1",
          apiInConnect: "1",
          apiInDisconnect: "1",
          apiInCdr: "1",
          apiInDtmf: "0",
          apiInRoute: "0",
          didInSms: "0",
          didInWhatsapp: "0",
          event: "start",
          answeredTime: "2025-07-30 12:40:07",
          currentStatus: 1,
          eventStatus: "dial_answered",
          status: 2,
          userId: "2916",
          app_target_id: "158|157"
        },
        {
          type: "report",
          eventTime: "2025-07-31 18:41:47",
          uniqueId: "7557320250730124147000",
          dialedNumber: "918156890110",
          didNumber: "914847110076",
          sourceChannel: "SIP/H4MzDTI6-001bd687",
          customerId: "13",
          deptId: "152",
          userId: "2916",
          direction: "outgoing",
          liveKey: "75573",
          callType: "Direct",
          zohoStatus: "1",
          lsqStatus: "0",
          apiOutStart: "1",
          apiOutConnect: "1",
          apiOutDisconnect: "1",
          apiOutCdr: "1",
          didOutSms: "0",
          didOutWhatsapp: "0",
          callProcessId: "",
          event: "start",
          answeredTime: "2025-07-30 12:41:52",
          currentStatus: 1,
          appId: "2916",
          app: "user",
          eventStatus: "dial_answered",
          status: 2,
          app_target_id: "146|145"
        },
      ];
    }
    
    if ( process.env.PRODUCTION == "developmentLive" || process.env.PRODUCTION == "live"
    ) {
      result = await get_live_data(id_user, id_department);
    }

    if (isAdmin == 1) {
      id_department = 0;
    } else if (isSubAdmin == 1) {
      id_department = id_department.split(",").map(Number);
    } else if (isDept == 1) {
      id_department = [id_department];
    }

    if (isDept == 1) {
      result = result.filter((item) => item.deptId == id_department);
    }

    console.log("live_result==========================================================================================",result)

    if (result.length !== 0) {
      const currentTime = new Date();
      const fifteenMinutesAgo = new Date(currentTime.getTime() - 59 * 60000);

      result = result.filter((item) => {
        const eventTime = new Date(item.eventTime.replace(" ", "T"));
        return (
          (eventTime >= fifteenMinutesAgo && eventTime <= currentTime) ||
          eventTime > currentTime
        );
      });
    } else {
      result = [];
    }

    console.log("result_by_Time==========================================================================================",result)

  const [callFlowIds, sourceNumbers] = result.reduce(
  ([ids, numbers], data) => {
    if (data.app_target_id !== undefined) {
      const splitIds = data.app_target_id.split(',').map(Number);
      ids.push(...splitIds);
      numbers.push(data.callerNumber || data.dialedNumber);
    }
    return [ids, numbers];
  },
  [[], []]
);

if(callFlowIds.length != 0){
  const sql = `select id,name from call_flow where id in (${callFlowIds.join(",")})`
  var [callFlowResult] = await getConnection.query(sql)
}

if (callFlowResult != undefined) {
  const callFlowMap = Object.fromEntries(callFlowResult.map(item => [item.id, item.name]));

  const updatedResult = [];

  for (const log of result) {
    let appName = '';

    if (log.app_target_id) {
      const ids = log.app_target_id.split(',').map(Number);
      const names = [];

      for (const id of ids) {
        if (callFlowMap[id]) {
          names.push(callFlowMap[id]);
        }
      }

      appName = names.join(',');
    }

    updatedResult.push({ ...log, appName });
  }

  result = updatedResult;
}

    const contact_data = await contactsModel
      .find(
        {
          phone_number: { $in: sourceNumbers },
          id_user: id_user,
          id_department: id_department,
        },
        { name: 1, phone_number: 1, _id: 0 }
      )
      .lean();

    result = await Promise.all(
      result.map(async (item) => {
        const number = item.callerNumber || item.dialedNumber || '';
        const match = contact_data.find((entry) =>
          entry.phone_number.includes(number)
        );

        // Add contact_name if found
        if (match) {
          item.contact_name = match.name;
        }

        // Mask numbers if needed
        if (req.token.phone_number_masking === 1) {
          if (item.callerNumber) {
            item.callerNumber = await string_encode(item.callerNumber);
          }
          if (item.dialedNumber) {
            item.dialedNumber = await string_encode(item.dialedNumber);
          }
        }

        return item;
      })
    );


    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function get_campaign_count(req, res, next) {
  try {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
    var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var didNumber = req.query.didnumber;
    var id_department = req.query.id_department;
    var campaign_count = 0;
    var campaignConnected = 0;
    var campaignNotConnected = 0;
    var campaignCount = `SELECT duration,callerid FROM cc_campaign_outgoing_reports where createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
    if (isSubAdmin == 1) {
      campaignCount += `and cc_campaign_outgoing_reports.id_department in(${id_department}) `;
    } else if (isDept == 1) {
      campaignCount += `and cc_campaign_outgoing_reports.id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      campaignCount += `and cc_campaign_outgoing_reports.id_department = ${id_department} `;
    }
    var [campaign_outgoingCount] = await getConnection.query(campaignCount);
    campaign_count += campaign_outgoingCount.length;
    if (campaign_outgoingCount.length != 0) {
      campaign_outgoingCount.map(async (outgoingData) => {
        if (didNumber != undefined) {
          if (
            outgoingData.callerid == didNumber ||
            outgoingData.callerid == "0" + didNumber ||
            outgoingData.callerid == "91" + didNumber
          ) {
            if (outgoingData.duration != 0) {
              campaignConnected += 1;
            } else {
              campaignNotConnected += 1;
            }
          }
        } else {
          if (outgoingData.duration != 0) {
            campaignConnected += 1;
          } else {
            campaignNotConnected += 1;
          }
        }
      });
    }
    var result = {
      campaign_count: campaign_count,
      campaignNotConnected: campaignNotConnected,
      campaignConnected: campaignConnected,
    };
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function updateAgentDetails(
  agentId,
  currentCallStatus,
  currentCallAnsTime,
  lastCallEndTime
) {
  var sql = `UPDATE user_live_data SET currentCallStatus = '${currentCallStatus}' `;
  if (currentCallAnsTime != undefined) {
    sql += `,currentCallAnsTime = '${currentCallAnsTime}' `;
  }
  if (lastCallEndTime != undefined) {
    sql += `,lastCallEndTime = '${lastCallEndTime}' `;
  }
  sql += `WHERE user_id = '${agentId}'`;
  var [result] = await sequelize.query(sql);
  return result;
}

async function get_department(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;

    var sql = `SELECT id, name FROM departments WHERE id_user = ${id_user} and status = 1`;
    var [result] = await getConnection.query(sql);

    if (isAdmin == 1) {
      result.unshift({ id: 0, name: "Admin" });
      res.locals.result = result;
    } else if (isSubAdmin == 1) {
      var id_dept_sql = `SELECT id_dept FROM subadmin_departments join departments WHERE subadmin_departments.id_dept = departments.id AND subadmin_departments.id_subadmin = ${req.token.id} and departments.status = 1`;
      var [resultDept] = await getConnection.query(id_dept_sql);
      var admin_dept_sql = `SELECT id_dept FROM subadmin_departments where id_subadmin = ${req.token.id} `;
      var [admin_dept_sql] = await getConnection.query(admin_dept_sql);
      var adminDeptIds = admin_dept_sql.map((dept) => dept.id_dept);
      var allowedDeptIds = resultDept.map((dept) => dept.id_dept);
      var subadmin_department = result.filter((data) =>
        allowedDeptIds.includes(data.id)
      );
      if (adminDeptIds.includes(0)) {
        subadmin_department.unshift({ id: 0, name: "Admin" });
      }
      subadmin_department.unshift({ id: 0, name: "Admin" });
      res.locals.result = subadmin_department;
    } else {
      result.unshift({ id: 0, name: "Admin" });
      res.locals.result = result;
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function send_mail(req, res, next) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your specific email service
      auth: {
        user: process.env.from_mail,
        pass: process.env.mail_password,
      },
    });

    const fromMailData = transporter.options.auth.user;
    const subject = "Test Email";
    const text = "This is a test email";
    const toMailData = process.env.to_mail.split(",");

    const result = await Promise.all(
      toMailData.map(async (toMail) => {
        const sendMailData = await transporter.sendMail({
          from: fromMailData,
          to: toMail,
          subject,
          text,
        });
        return sendMailData;
      })
    );

    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}

async function add_smart_group(req, res, next) {
  let agentsData = [],
    smartGroupId; //byot

  try {
    var data = req.body.smartgroup;
    var id_user = req.token.id_user;
    var name = data.name;
    var email = data.email;
    var show_missedcall_to = data.show_missedcall_to;
    var sticky_call_type = data.features.sticky_call_type;

    const { unique_id } = data;

    if (unique_id) {
      const isDuplicate = await smartGroupModel.findOne({
        where: { unique_id, id_user },
      });
      if (isDuplicate) {
        res.locals.result = "already_in_use";
        return next();
      }
    } else {
      res.locals.result = "unique_id_required";
      return next();
    }

    if (data.features.sticky_day != undefined) {
      var sticky_time_out_day = data.features.sticky_day;
    }
    var sticky_time_out_time = data.features.sticky_time;
    var Password = require("node-php-password");
    var options = {
      cost: 10,
      salt: "qwertyuiopasdfghjklzxc",
    };
    var hashedPassword = Password.hash(
      data.password,
      "PASSWORD_DEFAULT",
      options
    );
    var no_of_agnets = data.agents.length;
    var ringTypeValue = data.ringType.split("_");
    var ring_type = ringTypeValue[0];
    var ring_duration = data.ringDuration;
    var id_department = data.id_department;
    var maximum_duration = data.maximum_duration;
    var music_on_hold = data.features.musicOnHold;
    if (id_department == undefined) {
      var id_department = req.token.id_department;
    }
    if (data.features.callback == true) {
      var callback = 1;
    } else {
      var callback = 0;
    }
    if (data.features.loop == true) {
      var loop = 1;
    } else {
      var loop = 0;
    }
    if (data.features.stickyAgent == true) {
      var stickyAgent = 1;
    } else {
      var stickyAgent = 0;
    }
    if (data.features.stickyBind == true) {
      var stickyBind = 1;
    } else {
      var stickyBind = 0;
    }

    if (data.features.musicOnHold == true) {
      var mohArray = data.moh.split("/");
      var moh_id = mohArray[1];
      var moh = mohArray[0];
      var musicOnHold = 1;
    } else {
      var musicOnHold = 0;
    }
    if (data.features.enable_call_waiting == true) {
      var enable_call_waiting = 1;
    } else {
      var enable_call_waiting = 0;
    }
    if (data.features.enable_redirect_on_busy == true) {
            var enable_redirect_on_busy = 1
    } else {
            var enable_redirect_on_busy = 0
    }
    var redirect_on_busy_smartgroup_id = data.features.redirect_on_busy_smartgroup_id
    var checkingSql = `SELECT emailId, id FROM smart_group WHERE emailId = '${email}'`;
    var [userEmail] = await getConnection.query(checkingSql);
    if (userEmail.length == 0) {
      var checkingSql = `select name,id from smart_group where id_user = '${id_user}' and name = '${name}' `;
      var [smartgroup] = await getConnection.query(checkingSql);
      if (smartgroup.length == 0) {
        var smartGroupData = {
          id_user,
          name,
          moh_id: moh_id,
          emailId: email,
          password: hashedPassword,
          no_of_agents: no_of_agnets,
          call_back_request: callback,
          isLoop: loop,
          enable_sticky_agent: stickyAgent,
          enable_sticky_bind: stickyBind,
          music_on_hold: moh,
          enable_music_on_hold: musicOnHold,
          ring_type,
          ring_duration,
          loop_count: data.features.loop_count,
          maximum_duration: maximum_duration,
          enable_call_waiting,
          id_department,
          sticky_call_type,
          sticky_time_out_day,
          sticky_time_out_time,
          show_missedcall_to: show_missedcall_to,
          unique_id: data.unique_id,
          enable_redirect_on_busy,
          redirect_on_busy_smartgroup_id
        };
        var result = await smartGroupModel.create(smartGroupData);
        smartGroupId = result.id;
        data.agents.map((Data) => {
          var dataValue = Data.value.split("_");
          var agentId = Number(dataValue[0]);
          var insertId = result.id;
          var agent_data = {
            user_id: agentId,
            smart_groupId: insertId,
            order_number: Data.order,
            ring_duration: Data.ring_duration,
            enable_call_waiting: Data.enable_call_waiting,
            call_forward: Data.cf_status,
          };
          var agentResult = smartGroupAgents.create(agent_data);
          agentsData.push(agent_data);
        });

        //insert into byot
        if (req.token.byot) {
          const data = {
            smartGroup: smartGroupData,
            agentsData,
            id: smartGroupId,
          };
          callByotApi(
            "POST",
            "/smart-group",
            data,
            undefined,
            { token: req.headers.token },
            id_user
          );
        }

        res.locals.result = result;
        next();
      } else {
        var result = "existing";
        res.locals.result = result;
        next();
      }
    } else {
      var result = "Email_existing";
      res.locals.result = result;
      next();
    }
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_smart_group(req, res, next) {
  try {
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var name = req.query.name;
    var agent_id = req.query.agent_id;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var department_id = req.query.department_id;

    var sql = `SELECT id,name,ring_type,id_department,createdAt, unique_id FROM smart_group WHERE id_user = ${id_user} `;
    var sqlCount = `SELECT COUNT(*) AS count FROM smart_group WHERE id_user = ${id_user} `;

    // Condition based on user roles
    if (isSubAdmin == 1) {
      sql += `AND id_department IN (${id_department}) `;
      sqlCount += `AND id_department IN (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND id_department = ${req.token.id} `;
      sqlCount += `AND id_department = ${req.token.id} `;
    }

    // Filter by name if provided
    if (name !== undefined) {
      sql += `AND name LIKE "%${name}%" `;
      sqlCount += `AND name LIKE "%${name}%" `;
    }

    // Filter by agent_id if provided
    if (agent_id !== undefined) {
      sql += `AND user_id = '${agent_id}' `;
      sqlCount += `AND user_id = '${agent_id}' `;
    }

    // Filter by department_id if provided
    if (department_id !== undefined) {
      sql += `AND id_department = "${department_id}" `;
      sqlCount += `AND id_department = "${department_id}" `;
    }

    // Adding order and limit/offset for pagination
    sql += `ORDER BY id DESC LIMIT ${skip}, ${limit}`;

    // Execute the main query and the count query
    var [departments] = await getConnection.query(sql);
    var [departmentCount] = await getConnection.query(sqlCount);
    if (departments.length != 0) {
      const uniqueDepartments = [
        ...new Set(departments.map((agent) => agent.id_department)),
      ];
      var formattedDepartments = `(${uniqueDepartments.join(", ")})`;
      formattedDepartments = formattedDepartments.replace(/,\s*,/g, ",");
      if (formattedDepartments.length != 0) {
        var departmentName = `select id,name from departments where id in ${formattedDepartments}`;
        var [departmentNameResult] = await getConnection.query(departmentName);

        departments = departments.map((agent) => {
          let departmentName = null;

          if (agent.id_department == 0) {
            departmentName = "Admin"; // Set departmentName as "Admin" if id_department is 0
          } else {
            const department = departmentNameResult.find(
              (dept) => dept.id == agent.id_department
            );
            departmentName = department ? department.name : null;
          }

          return {
            ...agent,
            departmentName: departmentName, // Add departmentName
          };
        });
      }
    }

    // Set result and total count in response locals
    res.locals.result = departments;
    res.locals.total = departmentCount[0].count;

    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function get_idBy_smart_group(req, res, next) {
  try {
    const id_user = req.token.id_user;
    const id = req.query.id;
    const sql = `SELECT * FROM smart_group WHERE id = '${id}' and id_user = '${id_user}'`;
    let [result] = await getConnection.query(sql);
    const agentsSql = `SELECT smart_group_agents.user_id as id,role,smart_group_agents.user_id,smart_group_agents.smart_groupId,smart_group_agents.order_number,smart_group_agents.ring_duration,smart_group_agents.enable_call_waiting,smart_group_agents.call_forward as cf_status,user.first_name FROM smart_group_agents LEFT JOIN user ON smart_group_agents.user_id = user.id JOIN user_role ON user_role.user_id = smart_group_agents.user_id  WHERE smart_groupId = '${id}' and role in (1,2) ORDER BY order_number`;
    const [agentsRes] = await getConnection.query(agentsSql);
    let smartgroup = {};
    let features = {};

    const mergedArray = agentsRes.map((user) => {
      // Create agent object
      const agent = {
        order: user.order_number,
        value: user.agent_id,
        ring_duration: user.ring_duration,
        enable_call_waiting: user.enable_call_waiting,
        id: user.id,
        cf_status: user.cf_status,
        role: user.role,
      };
      // Merge agent and roles into one object
      return {
        ...agent,
      };
    });

    var results = [mergedArray];

    if (result[0].call_back_request == 1) {
      features.callback = true;
    } else {
      features.callback = false;
    }
    if (result[0].enable_sticky_agent == 1) {
      features.stickyAgent = true;
    } else {
      features.stickyAgent = false;
    }
    if (result[0].enable_sticky_bind == 1) {
      features.stickyBind = true;
    } else {
      features.stickyBind = false;
    }
    if (result[0].isLoop == 1) {
      features.loop = true;
    } else {
      features.loop = false;
    }
    if (result[0].timecondition == 1) {
      features.timeCondition = true;
    } else {
      features.timeCondition = false;
    }
    if (result[0].enable_music_on_hold == 1) {
      features.musicOnHold = true;
    } else {
      features.musicOnHold = false;
    }
    if (result[0].enable_call_waiting == 1) {
      features.enable_call_waiting = true;
    } else {
      features.enable_call_waiting = false;
    }
    if (result[0].enable_redirect_on_busy == 1) {
      features.enable_redirect_on_busy = true
    } else {
      features.enable_redirect_on_busy = false
    }
    features.redirect_on_busy_smartgroup_id = result[0].redirect_on_busy_smartgroup_id;

    function convertDateTime(dateTimeString) {
      const date = new Date(dateTimeString);

      // Get the date parts
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const day = String(date.getDate()).padStart(2, "0");

      // Get the time parts
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      // Format the string as "YYYY-MM-DD HH:MM"
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    const convertedDate = convertDateTime(result[0].sticky_time_out);
    features.moh = result[0].music_on_hold + "/" + result[0].moh_id;
    features.loop_count = result[0].loop_count;
    smartgroup.maximum_duration = result[0].maximum_duration;
    smartgroup.name = result[0].name;
    smartgroup.unique_id = result[0].unique_id;
    smartgroup.email = result[0].emailId;
    smartgroup.no_of_agents = result[0].no_of_agents;
    smartgroup.ringType = result[0].ring_type;
    smartgroup.ringDuration = result[0].ring_duration;
    smartgroup.id_department = result[0].id_department;
    smartgroup.show_missedcall_to = result[0].show_missedcall_to;
    features.sticky_call_type = result[0].sticky_call_type;
    features.sticky_day = result[0].sticky_time_out_day;
    features.sticky_time = result[0].sticky_time_out_time;
    if (result[0].sticky_time_out_day == 0) {
      smartgroup.stickyType = "1";
    } else {
      smartgroup.stickyType = "0";
    }
    smartgroup.agents = results[0];
    smartgroup.features = features;
    res.locals.result = smartgroup;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_smart_group(req, res, next) {
  let dataForByot = { id: req.query.id };

  try {
    const id_user = req.token.id_user;
    const id = req.query.id;
    let data = req.body.smartgroup;
    const name = data.name;
    const email = data.email;
    const sticky_call_type = data.features.sticky_call_type;
    const sticky_time_out_day = data.features.sticky_day;
    const sticky_time_out_time = data.features.sticky_time;
    const no_of_agnets = data.agents.length;
    const ring_type = data.ringType;
    const ring_duration = data.ringDuration;
    const loop_count = data.features.loop_count;
    const maximum_duration = data.maximum_duration;
    const show_missedcall_to = data.show_missedcall_to;
    const id_department = data.id_department;
    const unique_id = data.unique_id;
    const redirect_on_busy_smartgroup_id = data.features.redirect_on_busy_smartgroup_id

    const isDuplicate = await smartGroupModel.findOne({
      where: { unique_id, id_user },
      attributes: ["id", "unique_id"],
    });
    if (isDuplicate && isDuplicate.id != id) {
      res.locals.result = "already_in_use";
      return next();
    }

    if (data.features.callback == true) {
      var callback = 1;
    } else {
      var callback = 0;
    }
    if (data.features.loop == true) {
      var loop = 1;
    } else {
      var loop = 0;
    }
    if (data.features.stickyAgent == true) {
      var stickyAgent = 1;
    } else {
      var stickyAgent = 0;
    }
    if (data.features.stickyBind == true) {
      var stickyBind = 1;
    } else {
      var stickyBind = 0;
    }

    if (data.features.musicOnHold == true) {
      if (data.moh != undefined) {
        var mohArray = data.moh.split("/");
        var moh = mohArray[0];
        var mohId = mohArray[1];
      }
      var musicOnHold = 1;
    } else {
      var musicOnHold = 0;
    }
    if (data.features.enable_call_waiting == true) {
      var enable_call_waiting = 1;
    } else {
      var enable_call_waiting = 0;
    }
    if (data.features.enable_redirect_on_busy == true) {
      var enable_redirect_on_busy = 1
    } else {
      var enable_redirect_on_busy = 0
    }
    const userEmailSql = `SELECT emailId, id FROM smart_group WHERE emailId = '${email}' and id != '${id}'`;
    const [userEmail] = await getConnection.query(userEmailSql);
    if (userEmail.length == 0) {
      const checkingSql = `select name,id from smart_group where id_user = '${id_user}' and name = '${name}' and id != '${id}'`;
      const [department] = await getConnection.query(checkingSql);
      if (department.length == 0) {
        const agentDel = `DELETE FROM smart_group_agents WHERE smart_groupId = ${id}`;
        const agentDelRes = await sequelize.query(agentDel);

        const agentDataArray = data.agents.map((Data) => {
          const dataValue = Data.value.split("_");
          const agentId = dataValue[0];
          return {
            user_id: agentId,
            smart_groupId: id,
            order_number: Data.order,
            ring_duration: Data.ring_duration,
            enable_call_waiting: Data.enable_call_waiting,
            call_forward: Data.cf_status,
          };
        });
        const uniqueData = [];
        const userIds = new Set();
        agentDataArray.map((obj) => {
          if (!userIds.has(obj.user_id)) {
            userIds.add(obj.user_id);
            uniqueData.push(obj);
          }
        });
        smartGroupAgents.bulkCreate(uniqueData);
        dataForByot.agents = uniqueData;

        // var agentDataArray = []
        // data.agents.forEach((Data) => {
        //     const dataValue = Data.value.split("_");
        //     const agentId = dataValue[0];
        //     agentDataArray.push({
        //         user_id: agentId,
        //         smart_groupId: id,
        //         order_number: Data.order,
        //         ring_duration: Data.ring_duration,
        //         enable_call_waiting: Data.enable_call_waiting,
        //         call_forward: Data.cf_status,
        //     });
        // });

        // // const uniqueData = [];
        // // const userIds = new Set();
        // // agentDataArray.map(obj => {
        // //     if (!userIds.has(obj.user_id)) {
        // //       userIds.add(obj.user_id);
        // //       uniqueData.push(obj);
        // //     }
        // //   });

        // smartGroupAgents.bulkCreate(agentDataArray);
        // dataForByot.agents = agentDataArray;

        const sql = `UPDATE smart_group set name='${name}',emailId='${email}',no_of_agents='${no_of_agnets}',call_back_request='${callback}',isLoop='${loop}',enable_sticky_agent='${stickyAgent}',enable_sticky_bind='${stickyBind}',music_on_hold='${moh}',enable_music_on_hold='${musicOnHold}',moh_id = '${mohId}' ,ring_type='${ring_type}',ring_duration='${ring_duration}',loop_count='${loop_count}',maximum_duration='${maximum_duration}',enable_call_waiting='${enable_call_waiting}',sticky_call_type='${sticky_call_type}',sticky_time_out_day='${sticky_time_out_day}',sticky_time_out_time='${sticky_time_out_time}',show_missedcall_to='${show_missedcall_to}',id_department = '${id_department}',unique_id = '${unique_id}',enable_redirect_on_busy='${enable_redirect_on_busy}',redirect_on_busy_smartgroup_id='${redirect_on_busy_smartgroup_id}' where id = ${id}`;
        const result = await sequelize.query(sql);

        dataForByot.smartGroupQuery = {
          id,
          name,
          emailId: email,
          no_of_agents: no_of_agnets,
          call_back_request: callback,
          isLoop: loop,
          enable_sticky_agent: stickyAgent,
          enable_sticky_bind: stickyBind,
          music_on_hold: moh,
          enable_music_on_hold: musicOnHold,
          moh_id: mohId,
          ring_type,
          ring_duration,
          loop_count,
          maximum_duration,
          enable_call_waiting,
          sticky_call_type,
          sticky_time_out_day,
          sticky_time_out_time,
          show_missedcall_to,
          id_department,
          unique_id,
        };
        if (req.token.byot) {
          callByotApi(
            "PUT",
            `/smart-group/${id}/update`,
            dataForByot,
            undefined,
            { token: req.headers.token },
            id_user
          );
        }

        res.locals.result = result;
        next();
      } else {
        const result = "existing";
        res.locals.result = result;
        next();
      }
    } else {
      const result = "Email_existing";
      res.locals.result = result;
      next();
    }
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_smart_group_password(req, res, next) {
  try {
    var data = req.body;
    var pass = data.password;
    var id = data.id;
    var Password = require("node-php-password");
    var options = {
      cost: 10,
      salt: "qwertyuiopasdfghjklzxc",
    };
    var hashedPassword = Password.hash(pass, "PASSWORD_DEFAULT", options);
    var sql = `UPDATE smart_group set password ='${hashedPassword}' where id = '${id}' `;
    var [result] = await sequelize.query(sql);
    var msg = "smartgroupPasswordUpdate";
    var socket = await smartgroupSocket(id, msg, id);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_smart_group(req, res, next) {
  try {
    var id = req.query.id;
    var sql = `DELETE FROM smart_group WHERE id = '${id}'`;
    var [result] = await sequelize.query(sql);
    var agnetsql = `DELETE FROM smart_group_agents WHERE smart_groupId = '${id}'  `;
    var agnetRes = await sequelize.query(agnetsql);
    var didUpdate = `UPDATE did SET dest_id = 0, dest_value = '',dest_type = '' where dest_id = '${id}' and dest_type = 'smartgroup'`;
    var [didUpdateResult] = await sequelize.query(didUpdate);
    var msg = "smartgroupPasswordUpdate";
    var socket = await smartgroupSocket(id, msg, id);
    res.locals.result = result;

    if (req.token.byot) {
      callByotApi(
        "DELETE",
        `/smart-group/${id}/delete`,
        undefined,
        undefined,
        { token: req.headers.token },
        req.token.id_user
      );
    }

    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function smart_group_selectbox(req, res, next) {
  try {
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var id_user = req.token.id_user;
    var sql = `select id,name from smart_group where id_user = '${id_user}' `;
    var [department] = await getConnection.query(sql);
    res.locals.result = department;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function get_all_agent(req, res, next) {
  try {
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var name = req.query.name;
    var email = req.query.email;
    var regNumber = req.query.regNumber;
    var id_user = req.token.id_user;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var sql = `SELECT user.id,CONCAT(user.first_name, ' ', user.last_name) AS name,regNumber,email_id as email,show_callrecording as callrecording,show_campaign_report as campaign_report,enable_crm_edit,phn_number_mask,handover as hand_over FROM user LEFT JOIN user_settings ON user_settings.user_id = user.id where id_user = '${id_user}' `;
    var sqlCount = `SELECT COUNT(id) FROM user LEFT JOIN user_settings ON user_settings.user_id = user.id where id_user = '${id_user}' `;
    if (isSubAdmin == 1) {
      sql += `AND id_department in (${id_department})  `;
      sqlCount += `AND id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND id_department = '${req.token.id}' `;
      sqlCount += `AND id_department = '${req.token.id}' `;
    }
    if (name != undefined) {
      sql += `and name like "%${name}%" `;
      sqlCount += `and name like "%${name}%" `;
    }
    if (email != undefined) {
      sql += `and email like "%${email}%" `;
      sqlCount += `and email like "%${email}%" `;
    }
    if (regNumber != undefined) {
      sql += `and regNumber like "%${regNumber}%" `;
      sqlCount += `and regNumber like "%${regNumber}%" `;
    }
    sql += `order by id desc limit ${skip},${limit}`;
    sqlCount += `GROUP BY id `;
    var [agent] = await getConnection.query(sql);
    var [agentCount] = await getConnection.query(sqlCount);
    res.locals.result = agent;
    res.locals.total = agentCount.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_agent_callrecording(req, res, next) {
  try {
    var id = req.query.id;
    var callrecording = req.body.callrecording;
    var campaign_report = req.body.campaign_report;
    var enable_crm_edit = req.body.enable_crm_edit;
    var phn_number_mask = req.body.phn_number_mask;
    var hand_over = req.body.hand_over;
    var sql = `UPDATE user set show_callrecording='${callrecording}',show_campaign_report = '${campaign_report}',enable_crm_edit = '${enable_crm_edit}',phn_number_mask = '${phn_number_mask}',hand_over = '${hand_over}' where id = ${id}`;
    var [result] = await sequelize.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function add_audiofile(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var data = req.body;
    var id_department = data.id_department;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var hour = today.getHours();
    var min = today.getMinutes();
    var sec = today.getSeconds();
    var date = `${yyyy}-${mm}-${dd} ${hour}:${min}:${sec}`;
    var id_department = 0;
    var id_user = req.token.id_user;
    var browseAudioArray = JSON.parse(data.browsed_audio);
    var browsed_files = req.files.browsed_file;
    var arr = [];
    var browseFileArray = [];
    await Promise.all(
      browsed_files.map(async (browseObj) => {
        try {
          let filename = browseObj.filename;
          let originalname = browseObj.originalname;
          let input = path.join(process.env.file_PATH, "audio", filename);

          let output;
          if (process.env.PRODUCTION === "development") {
            output = path.join(process.env.file_PATH, "audio", filename);
          } else {
            output = path.join(
              process.env.file_PATH,
              "audio",
              "mono" + filename
            );
          }
          await convert_audio_to_mono(input, output);

          browseFileArray.push({ filename, originalname });
        } catch (error) {
          console.error("Unexpected error processing file:", error);
        }
      })
    );

    browseAudioArray.map((browseAudio) => {
      var sys_obj = browseFileArray.find(
        (item) => item.originalname == browseAudio.systemname
      );
      if (process.env.PRODUCTION == "development") {
        var systemname = sys_obj.filename;
      } else {
        var systemname = "mono" + sys_obj.filename;
      }
      arr.push({
        id_user: id_user,
        id_department: id_department,
        date: date,
        filename: browseAudio.filename,
        systemfilename: systemname,
      });
    });

    var result = await audiofileModel.bulkCreate(arr);

    if (req.token.byot) {
      uploadFilesByot(result, req.headers.token, req);
    }

    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function convert_audio_to_mono(inputFile, output) {
  const SoxCommand = require("sox-audio");

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(inputFile)) {
      console.log(`Input file ${inputFile} does not exist.`);
    }

    const command = SoxCommand()
      .input(inputFile)
      .output(output)
      .outputSampleRate(8000)
      .outputChannels(1)
      .outputFileType("wav");

    command.on("prepare", (args) => {
      console.log("Preparing sox command with args " + args.join(" "));
    });

    command.on("start", (commandLine) => {
      console.log("Spawned sox with command " + commandLine);
    });

    command.on("progress", (progress) => {
      console.log("Processing progress: ", progress);
    });

    command.on("error", (err, stdout, stderr) => {
      console.error("Cannot process audio: " + err.message);
      console.error("Sox Command Stdout: ", stdout);
      console.error("Sox Command Stderr: ", stderr);
      resolve(); // still resolve to avoid crashing whole flow
    });

    command.on("end", () => {
      console.log("Sox command succeeded!");
      fs.unlink(inputFile, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted successfully");
        }
      });
      resolve(); // signal success
    });

    command.run();
  });
}

async function update_audiofile(req, res, next) {
  try {
    var data = req.body;
    var id = req.query.id;
    var obj = {};
    obj.filename = data.filename;
    var result = await audiofileModel.update(obj, { where: { id } });
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_all_audiofile(req, res, next) {
  try {
    const { isAdmin, isSubAdmin, isDept, id_user, id_department } = req.token;
    const limit = Number(req.query.count);
    let skip = req.query.page;
    skip = (skip - 1) * limit;
    const { filename, department_id } = req.query;

    let sql = `SELECT audiofiles.id, audiofiles.id_user, audiofiles.id_department,audiofiles.createdAt AS date,audiofiles.filename, audiofiles.systemfilename AS systemname, departments.name AS department FROM audiofiles LEFT JOIN departments ON audiofiles.id_department = departments.id WHERE audiofiles.id_user = '${id_user}' `;
    let sqlCount = `SELECT COUNT(audiofiles.id) AS total FROM audiofiles LEFT JOIN departments ON audiofiles.id_department = departments.id WHERE audiofiles.id_user = '${id_user}' `;
    if (filename) {
      sql += `AND audiofiles.filename LIKE "%${filename}%" `;
      sqlCount += `AND audiofiles.filename LIKE "%${filename}%" `;
    }
    sql += `ORDER BY audiofiles.id DESC LIMIT ${skip},${limit}`;

    const [result] = await getConnection.query(sql);
    const [count] = await getConnection.query(sqlCount);
    const updatedResult = await Promise.all(
      result.map(async (item) => {
        const filePath = path.join(
          process.env.file_PATH,
          "audio",
          item.systemname
        );

        if (item.systemname) {
          if (fs.existsSync(filePath)) {
            try {
              const durationInSeconds = await getAudioDurationInSeconds(
                filePath
              );
              item.duration = formatDuration(durationInSeconds);
            } catch (error) {
              item.duration = 0.0;
            }
          } else {
            item.duration = 0.0;
          }
        } else {
          item.duration = 0.0;
        }

        return item;
      })
    );

    res.locals.result = updatedResult;
    res.locals.total = count[0].total;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = secs.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
async function get_audiofile_by_id(req, res, next) {
  try {
    var id = req.query.id;
    var sql = `SELECT id, id_user,id_department, filename, systemfilename, updatedAt, createdAt FROM audiofiles where id = '${id}' `;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_audiofile(req, res, next) {
  try {
    var id = req.query.id;
    var selectsql = `select id,systemfilename as systemname from audiofiles where id = '${id}'`;
    var [selectRes] = await getConnection.query(selectsql);
    if (selectRes.length != 0) {
      var systemname = selectRes[0].systemname;
      var filePath = `${process.env.file_PATH}` + "/audio/" + systemname;
    }
    var sql = `DELETE FROM audiofiles where id = '${id}' `;
    var [result] = await sequelize.query(sql);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return;
      }
      console.log("File deleted successfully");
    });

    if (req.token.byot) {
      callByotApi(
        "DELETE",
        `/audio/${selectRes[0].systemname}`,
        undefined,
        undefined,
        { token: req.headers.token },
        req.token.id_user
      );
    }

    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function get_agent_by_query(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var id_department = req.query.id_department;
    var sql = `select user.id,CONCAT(user.first_name, ' ', user.last_name) AS name,regNumber FROM user LEFT JOIN user_settings ON user_settings.user_id = user.id where id_department = '${id_department}' AND id_user='${id_user}'`;
    var [user] = await getConnection.query(sql);
    res.locals.result = user;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_agents_for_agent_login(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    var sql = `select user.id,CONCAT(user.first_name, ' ', user.last_name) AS name,regNumber FROM user LEFT JOIN user_settings ON user_settings.user_id = user.id where id_department = '${id_department}' AND id_user='${id_user}'`;
    var [user] = await getConnection.query(sql);
    res.locals.result = user;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function add_agents(req, res, next) {
  try {
    var data = req.body;
    let id_user, id_department, password;

    // Set user and department IDs based on user type
    if (req.token.isAdmin == 1) {
      id_user = req.token.id_user;
    }

    // Set additional user data
    data.id_user = Number(id_user);
    data.id_department = id_department;

    // Hash the password with specific options
    const options = {
      cost: 10,
      salt: "qwertyuiopasdfghjklzxc",
    };
    data.secret = Password.hash(data.password, "PASSWORD_DEFAULT", options);

    // Check for existing user with the same email
    const checkingSql = `SELECT email, id FROM user WHERE email = '${data.email}'`;
    const [user] = await getConnection.query(checkingSql);

    if (user.length > 0) {
      // If email already exists, return "existing"
      res.locals.result = "existing";
      next();
    } else {
      // Handle file upload if provided
      if (req.files && req.files.length > 0) {
        data.upload_image = req.files[0].filename;
      }

      // Create new user and assign permissions
      const result = await agentsModel.create(data);
      res.locals.result = result;
      next();
    }
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function get_agents(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var sql = `SELECT user.id,CONCAT(user.first_name, ' ', user.last_name) AS name,regNumber,email_id as email,show_callrecording as callrecording,show_campaign_report as campaign_report,enable_crm_edit,phn_number_mask,handover as hand_over FROM user LEFT JOIN user_settings ON user_settings.user_id = user.id  where id_user = ${id_user} ORDER BY id DESC`;
    var [result] = await getConnection.query(sql);
    const countQuery = `SELECT COUNT(*) AS count FROM user LEFT JOIN user_settings ON user_settings.user_id = user.id FROM user WHERE id_user = ${id_user}`;
    var [total] = await getConnection.query(countQuery);
    res.locals.result = result;
    total_count = total[0].count;
    res.locals.count = total_count;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_agents_by_id(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var id = req.query.id;
    var sql = `SELECT user.id,CONCAT(user.first_name, ' ', user.last_name) AS name,user_settings.did,regNumber,email_id,show_callrecording as callrecording,show_campaign_report as campaign_report,enable_crm_edit,phn_number_mask,handover as hand_over,allowOutbound,adminPrivilage,show_campaign_report FROM user where id_user = ${id_user} and id = '${id}'`;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_agents(req, res, next) {
  try {
    var data = req.body;
    var id_user = req.token.id_user;
    var id = req.query.id;

    var checkingSql = `select email_id as email,id from user where id_user = '${id_user}' and email_id = '${data.email}' and id != '${id}'`;
    var [agents] = await getConnection.query(checkingSql);
    if (agents.length == 0) {
      var inputFiles = req.files;
      if (inputFiles.length != 0) {
        var dataSql = `select upload_image from user where id = '${id}'`;
        var [data] = await getConnection.query(dataSql);
        const filePath = path.join(
          __dirname,
          "../public/agent",
          data[0].upload_image
        );
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            return;
          }
          console.log("File deleted successfully");
        });
        data.upload_image = inputFiles[0].filename;
      }
      if (data.change_password == 1) {
        var Password = require("node-php-password");
        var options = {
          cost: 10,
          salt: "qwertyuiopasdfghjklzxc",
        };
        var hashedPassword = Password.hash(
          data.password,
          "PASSWORD_DEFAULT",
          options
        );
        data.password = hashedPassword;
        var result = await agentsModel.update(data, { where: { id: id } });
      } else {
        var result = await agentsModel.update(data, { where: { id: id } });
      }
      res.locals.result = result;
      next();
    } else {
      var result = "existing";
      res.locals.result = result;
      next();
    }
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_agents(req, res, next) {
  try {
    var id = req.query.id;
    var sql = `DELETE FROM user WHERE id = '${id}'`;
    var [result] = await sequelize.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function add_callgroup(req, res, next) {
  try {
    const data = req.body;
    let id_user;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    if (isAdmin == 1) {
      id_user = req.token.id_user;
    } else if (isSubAdmin == 1) {
      id_user = req.token.id_user;
    } else if (isDept == 1) {
      id_user = req.token.id_user;
    }
    const options = {
      cost: 10,
      salt: "qwertyuiopasdfghjklzxc",
    };
    data.password = Password.hash(data.password, "PASSWORD_DEFAULT", options);

    // Set additional user data
    data.id_user = Number(id_user);
    // data.id_department = id_department;
    const result = await callgroupModel.create(data);
    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function get_all_callgroup(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var sql = `select * from callgroup where id_user = ${id_user}`;
    var [user] = await getConnection.query(sql);
    var result = user;
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_all_callgroup_by_id(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var id = req.query.id;
    var sql = `select * from callgroup where id_user = ${id_user} and id = ${id}`;
    var [user] = await getConnection.query(sql);
    var result = user;
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_callgroup(req, res, next) {
  try {
    var provider = req.body;
    var insertProvider = await apiProviderModel.create(provider);
    var provider_id = insertProvider._doc._id;
    var providerValues = {
      provider_id: new ObjectId(provider_id),
    };
    var insertProviderHead = await apiProviderHead.create(providerValues);
    var insertProviderBody = await apiProviderBody.create(providerValues);
    res.locals.result = insertProvider;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_callgroup(req, res, next) {
  try {
    const provider_id = req.query.provider_id;
    var idd = [];
    const provider = await apiProviderModel.find({ provider_id: provider_id });
    const sub_provider_id = provider.map((item) => {
      var id = item._doc._id;
      idd.push(id);
    });
    // Fetch the provider values using the provider_id
    const providerValuesHead = await apiProviderHead.find({
      provider_id: { $in: idd },
    });
    const providerValuesBody = await apiProviderBody.find({
      provider_id: { $in: idd },
    });
    res.locals.result = { provider, providerValuesHead, providerValuesBody };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function get_did_selectbox(req, res, next) {
  // to get did list for selectbox by id user
  try {
    const id_user = req.token.id_user;
    const isAdmin = req.token.isAdmin;
    const isSubAdmin = req.token.isSubAdmin;
    const isDept = req.token.isDept;
    const departement_id = req.query.id_department;
    let sql = `SELECT id, did FROM did WHERE id_user = ${id_user} `;
    if (departement_id != undefined) {
      sql += `and id_department = ${departement_id}`;
    } else if (isDept == 1) {
      sql += `and id_department = ${req.token.id}`;
    } else if (isSubAdmin == 1) {
      sql += `and id_department in(${req.token.id_department}) `;
    }
    const [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function subadmin_departments(id_user) {
  try {
    var subadmin_dept = `SELECT id_dept FROM subadmin_departments WHERE id_subadmin = '${id_user}'`;
    var [subadmin_deptRes] = await getConnection.query(subadmin_dept);
    if (subadmin_deptRes.length != 0) {
      var subadmin = [];
      subadmin_deptRes.map(async (data) => {
        subadmin.push(data.id_dept);
      });
      return subadmin;
    } else {
      return [];
    }
  } catch (err) {
    console.log(err);
  }
}

async function add_smartvoice_sms_provider(req, res, next) {
  try {
    var provider = req.body;
    var head = req.body.header;
    var body = req.body.body;
    var message = provider.message;
    var provider_id = provider.provider_id;
    var variables = provider.variables;
    var smsJsonBodyData = provider.smsJsonBodyData;
    delete provider.smsJsonBodyData;
    const { isAdmin, isSubAdmin, isDept } = req.token;
    if (isAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = 0;
    } else if (isSubAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id_department;
    } else if (isDept == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id;
    }
    var { header, body, variables, ...restProvider } = provider;
    var insertProvider = await smsProviderModel.create({
      method: provider.method,
      sms_provider_name: provider.name,
      sms_provider_id: provider_id,
      type: provider.type,
      url: provider.url,
      dynamic: provider.dynamic,
      message: message,
      callflow_enabled: provider.callflow_enabled,
      id_user,
      id_department,
      ...restProvider,
    });
    var provider_idd = insertProvider._doc._id;
    if (variables) {
      var insertVariable = await templateSettingsVariable.create({
        template_id: provider_idd,
        variables: variables,
      });
    }
    if (head !== undefined) {
      var headEntries = head.map((entry) => {
        const { _id, sms_id, ...rest } = entry;
        return {
          sms_provider_id_head: _id,
          sms_table_id: new ObjectId(provider_idd),
          ...rest,
        };
      });

      var insertProviderHead = await smsProviderHead.create(headEntries);
    }
    if (body !== undefined) {
      var bodyEntries = body.map((entry) => {
        const { _id, sms_id, ...rest } = entry;
        return {
          sms_provider_id_body: _id,
          sms_table_id: new ObjectId(provider_idd),
          ...rest,
        };
      });

      var insertProviderBody = await smsProviderBody.create(bodyEntries);
    }
    if (smsJsonBodyData) {
      var obj = {
        smsJsonBodyData: smsJsonBodyData,
        sms_table_id: new ObjectId(provider_idd),
      };
      var bodyEntries = [];
      bodyEntries.push(obj);
      var insertProviderBody = await smsProviderBody.create(obj);
    }
    res.locals.result = {
      result: insertProvider,
      head: insertProviderHead,
      body: insertProviderBody,
    };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_smartvoice_all_sms(req, res, next) {
  try {
    const providers = await smsProviderModelAdmin
      .find()
      .select("_id provider_name");
    res.locals.result = providers;
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
  }
  next();
}
async function get_smartvoice_sms_provider_by_id(req, res, next) {
  try {
    const id = req.query.id;
    const provider = await smsProviderModel.findById(id);
    const providerValuesHead = await smsProviderHead.find({
      sms_table_id: new ObjectId(id),
    });
    const providerValuesBody = await smsProviderBody.find({
      sms_table_id: new ObjectId(id),
    });
    res.locals.result = {
      provider,
      head: providerValuesHead,
      body: providerValuesBody,
    };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_smartvoice_sms_provider_by_id_admin(req, res, next) {
  try {
    const id = req.query.id;
    const provider = await smsProviderModelAdmin.findById(id);
    const providerValuesHead = await smsProviderHeadAdmin.find({
      sms_id: new ObjectId(id),
    });
    const providerValuesBody = await smsProviderBodyAdmin.find({
      sms_id: new ObjectId(id),
    });
    res.locals.result = {
      provider,
      head: providerValuesHead,
      body: providerValuesBody,
    };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_smartvoice_sms_provider_by_provider_id(req, res, next) {
  try {
    const provider_id = req.query.provider_id;
    var idd = [];
    const provider = await smsProviderModel.find({ provider_id: provider_id });
    const sub_provider_id = provider.map((item) => {
      var id = item._doc._id;
      idd.push(id);
    });
    // Fetch the provider values using the provider_id
    const providerValuesHead = await smsProviderHead.find({
      sms_table_id: { $in: idd },
    });
    const providerValuesBody = await smsProviderBody.find({
      sms_table_id: { $in: idd },
    });

    res.locals.result = { provider, providerValuesHead, providerValuesBody };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_smartvoice_sms_provider(req, res, next) {
  try {
    var provider_id = req.query.id;
    var provider = req.body;
    var head = req.body.header;
    var body = req.body.body;
    var message = provider.message;
    var variables = provider.variables;
    var smsJsonBodyData = provider.smsJsonBodyData;
    delete provider.smsJsonBodyData;
    const { isAdmin, isSubAdmin, isDept } = req.token;
    if (isAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = 0;
    } else if (isSubAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id_department;
    } else if (isDept == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id;
    }
    var { header, body, variables, ...restProvider } = provider;
    const updatedProvider = await smsProviderModel.findByIdAndUpdate(
      provider_id,
      {
        method: provider.method,
        sms_provider_name: provider.name,
        type: provider.type,
        url: provider.url,
        dynamic: provider.dynamic,
        message: message,
        sms_provider_id: provider.provider,
        callflow_enabled: provider.callflow_enabled,
        id_user,
        id_department,
        ...restProvider,
      },
      { new: true }
    );
    await templateSettingsVariable.deleteMany({
      template_id: new ObjectId(provider_id),
    });
    if (variables) {
      var insertVariable = await templateSettingsVariable.create({
        template_id: provider_id,
        variables: variables,
      });
    }
    await smsProviderHead.deleteMany({
      sms_table_id: new ObjectId(provider_id),
    });
    await smsProviderBody.deleteMany({
      sms_table_id: new ObjectId(provider_id),
    });
    if (head !== undefined) {
      var headEntries = head.map((entry) => {
        // Create a copy of the entry without the _id field
        const { _id, sms_id, ...rest } = entry;
        return {
          sms_provider_id_head: _id,
          sms_table_id: new ObjectId(provider_id),
          ...rest,
        };
      });

      // Assuming you have a MongoDB collection named 'apiKeys'
      var insertProviderHead = await smsProviderHead.create(headEntries);
    }
    if (body !== undefined) {
      var bodyEntries = body.map((entry) => {
        const { _id, sms_id, ...rest } = entry;
        return {
          sms_provider_id_body: _id,
          sms_table_id: new ObjectId(provider_id),
          ...rest,
        };
      });
      // Assuming you have a MongoDB collection named 'smsProviderBody'
      var insertProviderBody = await smsProviderBody.create(bodyEntries);
    }
    if (smsJsonBodyData) {
      var obj = {
        smsJsonBodyData: smsJsonBodyData,
        sms_table_id: new ObjectId(provider_id),
      };
      var bodyEntries = [];
      bodyEntries.push(obj);
      var insertProviderBody = await smsProviderBody.create(obj);
    }
    res.locals.result = { provider: updatedProvider };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_smartvoice_sms_provider(req, res, next) {
  try {
    const provider_id = req.query.id;
    const deletedProvider = await smsProviderModel.findByIdAndDelete(
      provider_id
    );
    await templateSettingsVariable.deleteMany({
      template_id: new ObjectId(provider_id),
    });
    await smsProviderHead.deleteMany({
      sms_table_id: new ObjectId(provider_id),
    });
    await smsProviderBody.deleteMany({
      sms_table_id: new ObjectId(provider_id),
    });
    res.locals.result = deletedProvider;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function add_smartvoice_whatsapp_provider(req, res, next) {
  try {
    var provider = req.body;
    var head = req.body.header;
    var body = req.body.body;
    var message = provider.message;
    var provider_id = provider.provider_id;
    var variables = provider.variables;
    const { isAdmin, isSubAdmin, isDept } = req.token;
    if (isAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = 0;
    } else if (isSubAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id_department;
    } else if (isDept == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id;
    }
    var whatsappJsonBodyData = provider.whatsappJsonBodyData;
    delete provider.whatsappJsonBodyData;
    var { header, body, variables, ...restProvider } = provider;
    var insertProvider = await whatsappProviderModel.create({
      method: provider.method,
      whatsapp_provider_name: provider.name,
      whatsapp_provider_id: provider_id,
      type: provider.type,
      url: provider.url,
      dynamic: provider.dynamic,
      message: message,
      callflow_enabled: provider.callflow_enabled,
      id_user,
      id_department,
      ...restProvider,
    });
    var provider_idd = insertProvider._doc._id;
    if (variables) {
      var insertVariable = await templateSettingsVariable.create({
        template_id: provider_idd,
        variables: variables,
      });
    }
    if (head !== undefined) {
      var headEntries = head.map((entry) => {
        const { _id, whatsapp_id, ...rest } = entry;
        return {
          whatsapp_provider_id_head: _id,
          whatsapp_table_id: new ObjectId(provider_idd),
          ...rest,
        };
      });

      var insertProviderHead = await whatsappProviderHead.create(headEntries);
    }
    if (body !== undefined) {
      var bodyEntries = body.map((entry) => {
        const { _id, whatsapp_id, ...rest } = entry;
        return {
          whatsapp_provider_id_body: _id,
          whatsapp_table_id: new ObjectId(provider_idd),
          ...rest,
        };
      });

      var insertProviderBody = await whatsappProviderBody.create(bodyEntries);
    }
    if (whatsappJsonBodyData) {
      var obj = {
        whatsappJsonBodyData: whatsappJsonBodyData,
        whatsapp_table_id: new ObjectId(provider_idd),
      };
      var bodyEntries = [];
      bodyEntries.push(obj);
      var insertProviderBody = await whatsappProviderBody.create(obj);
    }
    res.locals.result = {
      result: insertProvider,
      head: insertProviderHead,
      body: insertProviderBody,
    };
    next();
  } catch (err) {
    console.log(err);
    next();
  }
}
async function get_smartvoice_all_whatsapp(req, res, next) {
  try {
    const providers = await whatsappProviderModelAdmin
      .find()
      .select("_id provider_name");
    res.locals.result = providers;
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
  }
  next();
}
async function get_smartvoice_whatsapp_provider_by_id(req, res, next) {
  try {
    const provider_id = req.query.id;
    const provider = await whatsappProviderModel.findById(provider_id);
    const providerValuesHead = await whatsappProviderHead.find({
      whatsapp_table_id: new ObjectId(provider_id),
    });
    const providerValuesBody = await whatsappProviderBody.find({
      whatsapp_table_id: new ObjectId(provider_id),
    });
    res.locals.result = {
      provider,
      head: providerValuesHead,
      body: providerValuesBody,
    };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_smartvoice_whatsapp_provider_by_id_admin(req, res, next) {
  try {
    const provider_id = req.query.id;
    const provider = await whatsappProviderModelAdmin.findById(provider_id);
    const providerValuesHead = await whatsappProviderHeadAdmin.find({
      whatsapp_id: new ObjectId(provider_id),
    });
    const providerValuesBody = await whatsappProviderBodyAdmin.find({
      whatsapp_id: new ObjectId(provider_id),
    });
    res.locals.result = {
      provider,
      head: providerValuesHead,
      body: providerValuesBody,
    };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_smartvoice_whatsapp_provider_by_provider_id(req, res, next) {
  try {
    const provider_id = req.query.provider_id;
    const provider = await whatsappProviderModel.findById(provider_id);
    const sub_provider_id = provider._doc._id;
    const providerValuesHead = await whatsappProviderHead.findOne({
      whatsapp_table_id: sub_provider_id,
    });
    const providerValuesBody = await whatsappProviderBody.findOne({
      whatsapp_table_id: sub_provider_id,
    });
    res.locals.result = { provider, providerValuesHead, providerValuesBody };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_smartvoice_whatsapp_provider(req, res, next) {
  try {
    const provider_id = req.query.id;
    var provider = req.body;
    var head = req.body.header;
    var body = req.body.body;
    var message = provider.message;
    var variables = provider.variables;
    const { isAdmin, isSubAdmin, isDept } = req.token;
    if (isAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = 0;
    } else if (isSubAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id_department;
    } else if (isDept == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id;
    }
    var { header, body, variables, ...restProvider } = provider;
    var whatsappJsonBodyData = provider.whatsappJsonBodyData;
    delete provider.whatsappJsonBodyData;
    const updatedProvider = await whatsappProviderModel.findByIdAndUpdate(
      provider_id,
      {
        method: provider.method,
        whatsapp_provider_name: provider.name,
        type: provider.type,
        url: provider.url,
        dynamic: provider.dynamic,
        message: message,
        whatsapp_provider_id: provider.provider,
        callflow_enabled: provider.callflow_enabled,
        id_user,
        id_department,
        ...restProvider,
      },
      { new: true }
    );
    await templateSettingsVariable.deleteMany({
      template_id: new ObjectId(provider_id),
    });
    if (variables) {
      var insertVariable = await templateSettingsVariable.create({
        template_id: provider_id,
        variables: variables,
      });
    }
    var providerValuesHead = await whatsappProviderHead.deleteMany({
      whatsapp_table_id: provider_id,
    });
    var providerValuesBody = await whatsappProviderBody.deleteMany({
      whatsapp_table_id: provider_id,
    });
    if (head !== undefined) {
      var headEntries = head.map((entry) => {
        const { _id, whatsapp_id, ...rest } = entry;
        return {
          whatsapp_provider_id_head: _id,
          whatsapp_table_id: new ObjectId(provider_id),
          ...rest,
        };
      });

      var insertProviderHead = await whatsappProviderHead.create(headEntries);
    }
    if (body !== undefined) {
      var bodyEntries = body.map((entry) => {
        const { _id, whatsapp_id, ...rest } = entry;
        return {
          whatsapp_provider_id_body: _id,
          whatsapp_table_id: new ObjectId(provider_id),
          ...rest,
        };
      });
      var insertProviderBody = await whatsappProviderBody.create(bodyEntries);
    }
    if (whatsappJsonBodyData) {
      var obj = {
        whatsappJsonBodyData: whatsappJsonBodyData,
        whatsapp_table_id: new ObjectId(provider_id),
      };
      var bodyEntries = [];
      bodyEntries.push(obj);
      var insertProviderBody = await whatsappProviderBody.create(obj);
    }
    res.locals.result = {
      provider: updatedProvider,
      head: insertProviderHead,
      body: insertProviderBody,
    };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_smartvoice_whatsapp_provider(req, res, next) {
  try {
    const provider_id = req.query.id;
    const deletedProvider = await whatsappProviderModel.findByIdAndDelete(
      provider_id
    );
    await templateSettingsVariable.deleteMany({
      template_id: new ObjectId(provider_id),
    });
    await whatsappProviderHead.deleteMany({ whatsapp_table_id: provider_id });
    await whatsappProviderBody.deleteMany({ whatsapp_table_id: provider_id });

    res.locals.result = deletedProvider;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function add_smartvoice_api_provider(req, res, next) {
  try {
    var provider = req.body;
    var head = req.body.header;
    var body = req.body.body;
    var message = provider.message;
    var provider_id = provider.provider_id;
    var apiJsonBodyData = provider.apiJsonBodyData;
    delete provider.apiJsonBodyData;
    const { isAdmin, isSubAdmin, isDept } = req.token;
    if (isAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = 0;
    } else if (isSubAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id_department;
    } else if (isDept == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id;
    }
    var insertProvider = await apiProviderModel.create({
      method: provider.method,
      api_provider_name: provider.name,
      api_provider_id: provider_id,
      type: provider.type,
      url: provider.url,
      dynamic: provider.dynamic,
      message: message,
      callflow_enabled: provider.callflow_enabled,
      id_user,
      id_department,
    });
    var provider_idd = insertProvider._doc._id;
    if (head !== undefined) {
      var headEntries = head.map((entry) => {
        const { _id, api_id, ...rest } = entry;
        return {
          api_provider_id_head: _id,
          api_table_id: new ObjectId(provider_idd),
          ...rest,
        };
      });

      var insertProviderHead = await apiProviderHead.create(headEntries);
    }
    if (body !== undefined) {
      var bodyEntries = body.map((entry) => {
        const { _id, api_id, ...rest } = entry;
        return {
          api_provider_id_body: _id,
          api_table_id: new ObjectId(provider_idd),
          ...rest,
        };
      });

      var insertProviderBody = await apiProviderBody.create(bodyEntries);
    }
    if (apiJsonBodyData) {
      var obj = {
        apiJsonBodyData: apiJsonBodyData,
        sms_table_id: new ObjectId(provider_idd),
      };
      var bodyEntries = [];
      bodyEntries.push(obj);
      var insertProviderBody = await apiProviderBody.create(obj);
    }
    res.locals.result = {
      result: insertProvider,
      head: insertProviderHead,
      body: insertProviderBody,
    };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_smartvoice_all_api(req, res, next) {
  try {
    const providers = await apiProviderModelAdmin
      .find()
      .select("_id provider_name");
    res.locals.result = providers;
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
  }
  next();
}
async function update_smartvoice_api_provider(req, res, next) {
  try {
    const provider_id = req.query.id;
    var provider = req.body;
    var head = req.body.header;
    var body = req.body.body;
    var message = provider.message;
    const { isAdmin, isSubAdmin, isDept } = req.token;
    if (isAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = 0;
    } else if (isSubAdmin == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id_department;
    } else if (isDept == 1) {
      var id_user = req.token.id_user;
      var id_department = req.token.id;
    }
    var apiJsonBodyData = provider.apiJsonBodyData;
    delete provider.apiJsonBodyData;
    const updatedProvider = await apiProviderModel.findByIdAndUpdate(
      provider_id,
      {
        method: provider.method,
        whatsapp_provider_name: provider.name,
        type: provider.type,
        url: provider.url,
        dynamic: provider.dynamic,
        message: message,
        whatsapp_provider_id: provider.provider,
        callflow_enabled: provider.callflow_enabled,
        id_user,
        id_department,
      },
      { new: true }
    );
    var providerValuesHead = await apiProviderHead.deleteMany({
      api_table_id: provider_id,
    });
    var providerValuesBody = await apiProviderBody.deleteMany({
      api_table_id: provider_id,
    });
    if (head !== undefined) {
      var headEntries = head.map((entry) => {
        const { _id, api_id, ...rest } = entry;
        return {
          api_provider_id_head: _id,
          api_table_id: new ObjectId(provider_id),
          ...rest,
        };
      });

      var insertProviderHead = await apiProviderHead.create(headEntries);
    }
    if (body !== undefined) {
      var bodyEntries = body.map((entry) => {
        const { _id, api_id, ...rest } = entry;
        return {
          api_provider_id_body: _id,
          api_table_id: new ObjectId(provider_id),
          ...rest,
        };
      });

      var insertProviderBody = await apiProviderBody.create(bodyEntries);
    }
    if (apiJsonBodyData) {
      var obj = {
        apiJsonBodyData: apiJsonBodyData,
        sms_table_id: new ObjectId(provider_id),
      };
      var bodyEntries = [];
      bodyEntries.push(obj);
      var insertProviderBody = await apiProviderBody.create(obj);
    }
    res.locals.result = {
      provider: updatedProvider,
      head: insertProviderHead,
      body: insertProviderBody,
    };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_smartvoice_api_provider(req, res, next) {
  try {
    const provider_id = req.query.id;
    const deletedProvider = await apiProviderModel.findByIdAndDelete(
      provider_id
    );
    await apiProviderHead.deleteMany({
      api_table_id: new ObjectId(provider_id),
    });
    await apiProviderBody.deleteMany({
      api_table_id: new ObjectId(provider_id),
    });
    res.locals.result = deletedProvider;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_smartvoice_api_provider_by_id(req, res, next) {
  try {
    const provider_id = req.query.id;
    const provider = await apiProviderModel.findById(provider_id);
    const providerValuesHead = await apiProviderHead.find({
      api_table_id: new ObjectId(provider_id),
    });
    const providerValuesBody = await apiProviderBody.find({
      api_table_id: new ObjectId(provider_id),
    });
    res.locals.result = {
      provider,
      head: providerValuesHead,
      body: providerValuesBody,
    };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_smartvoice_api_provider_by_id_admin(req, res, next) {
  try {
    const provider_id = req.query.id;
    const provider = await apiProviderModelAdmin.findById(provider_id);
    const providerValuesHead = await apiProviderHeadAdmin.find({
      api_id: new ObjectId(provider_id),
    });
    const providerValuesBody = await apiProviderBodyAdmin.find({
      api_id: new ObjectId(provider_id),
    });
    res.locals.result = {
      provider,
      head: providerValuesHead,
      body: providerValuesBody,
    };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_smartvoice_api_provider_by_provider_id(req, res, next) {
  try {
    const provider_id = req.query.provider_id;
    var idd = [];
    const provider = await apiProviderModel.find({ provider_id: provider_id });
    const sub_provider_id = provider.map((item) => {
      var id = item._doc._id;
      idd.push(id);
    });
    const providerValuesHead = await apiProviderHead.find({
      provider_id: { $in: idd },
    });
    const providerValuesBody = await apiProviderBody.find({
      provider_id: { $in: idd },
    });
    res.locals.result = { provider, providerValuesHead, providerValuesBody };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function add_ext(req, res, next) {
  var data = req.body;
  var id_user = req.token.id_user;
  data.id_user = Number(id_user);
  const bcrypt = require("bcrypt");
  var password = data.password;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  data.secret = hashedPassword;
  const result = await extModel.create(data);
  res.locals.result = result;
  next();
}
async function update_ext(req, res, next) {
  try {
    var data = req.body;
    var id_user = req.token.id_user;
    var id = req.query.id;
    var checkingSql = `select email,id from ext where id_user = '${id_user}' and email = '${data.email}' and id != '${id}'`;
    var [ext] = await getConnection.query(checkingSql);
    if (ext.length == 0) {
      var inputFiles = req.files;
      if (inputFiles.length != 0) {
        var dataSql = `select upload_image from ext where id = '${id}'`;
        var [data] = await getConnection.query(dataSql);
        const filePath = path.join(
          __dirname,
          "../public/ext",
          data[0].upload_image
        );
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            return;
          }
          console.log("File deleted successfully");
        });
        data.upload_image = inputFiles[0].filename;
      }
      if (data.change_password == 1) {
        var Password = require("node-php-password");
        var options = {
          cost: 10,
          salt: "qwertyuiopasdfghjklzxc",
        };
        var hashedPassword = Password.hash(
          data.password,
          "PASSWORD_DEFAULT",
          options
        );
        data.secret = hashedPassword;
        var result = await extModel.update(data, { where: { id: id } });
      } else {
        var result = await extModel.update(data, { where: { id: id } });
      }
      res.locals.result = result;
      next();
    } else {
      var result = "existing";
      res.locals.result = result;
      next();
    }
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_ext(req, res, next) {
  try {
    const provider_id = req.query.id;
    const deletedProvider = await smsProviderModel.findByIdAndDelete(
      provider_id
    );
    await smsProviderHead.findOneAndDelete({ provider_id: provider_id });
    await smsProviderBody.findOneAndDelete({ provider_id: provider_id });
    res.locals.result = deletedProvider;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_all_ext(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var sql = `select id,name, ext, email, callerid, cf_stat, outbound, callrecord, vm_status, vm_greeting, tickets, sms_number, cf_number, noanswer_file, sms_stat from ext where id_user = ${id_user}`;
    var [user] = await getConnection.query(sql);
    const countQuery = `SELECT COUNT(*) AS count FROM ext WHERE id_user = ${id_user}`;
    var result = user;
    var [total] = await getConnection.query(countQuery);
    total_count = total[0].count;
    res.locals.result = result;
    res.locals.total = total_count;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_ext_by_id(req, res, next) {
  try {
    var id = req.query.id;
    var id_user = req.token.id_user;
    var sql = `select name, ext, email, callerid, cf_stat, outbound, callrecord, vm_status, vm_greeting, tickets, sms_number, cf_number, noanswer_file, sms_stat,reg_ext from ext where id_user = ${id_user} and id = ${id}`;
    var [user] = await getConnection.query(sql);
    var result = user;
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function get_data_as_axios(req, res, next) {
  try {
    const provider_id = req.query.id;
    const type = req.query.type;
    const method = req.query.method;
    const url = req.query.url;
    var phn_number = req.query.phn_number;
    let providerValuesHead, providerValuesBody, provider;
    if (type == 1) {
      provider = await smsProviderModel.findById(provider_id);
      providerValuesHead = await smsProviderHead.find({
        sms_table_id: new ObjectId(provider_id),
      });
      providerValuesBody = await smsProviderBody.find({
        sms_table_id: new ObjectId(provider_id),
      });
    } else if (type == 2) {
      provider = await apiProviderModel.findById(provider_id);
      providerValuesHead = await apiProviderHead.find({
        api_table_id: new ObjectId(provider_id),
      });
      providerValuesBody = await apiProviderBody.find({
        api_table_id: new ObjectId(provider_id),
      });
    } else {
      provider = await whatsappProviderModel.findById(provider_id);
      providerValuesHead = await whatsappProviderHead.find({
        whatsapp_table_id: new ObjectId(provider_id),
      });
      providerValuesBody = await whatsappProviderBody.find({
        whatsapp_table_id: new ObjectId(provider_id),
      });
    }
    if (provider) {
      var msg = provider._doc.message;
      msg = msg.replaceAll("$phno", phn_number);
    }
    providerValuesBody.push({ message: msg });
    const axiosConfig = {
      method: method.toLowerCase(),
      url,
      headers: providerValuesHead,
      body: providerValuesBody,
    };
    const axiosResponse = await axios(axiosConfig);
    res.locals.result = {
      provider,
      head: providerValuesHead,
      body: providerValuesBody,
      axiosResponse: axiosResponse.data,
    };
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function get_all_provider(req, res, next) {
  try {
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    const provider_id = req.query.id;
    const department_id = req.query.department_id;
    let combinedProviderList = [];
    try {
      let providerSmsList, providerApiList, providerWhatsappList;
      if (department_id) {
        providerSmsList = await smsProviderModel
          .find({ id_department: department_id })
          .select("_id sms_provider_name createdAt");
        providerApiList = await apiProviderModel
          .find({ id_department: department_id })
          .select("_id api_provider_name createdAt");
        providerWhatsappList = await whatsappProviderModel
          .find({ id_department: department_id })
          .select("_id whatsapp_provider_name createdAt");
      } else if (isDept == 1) {
        providerSmsList = await smsProviderModel
          .find({ id_department: req.token.id })
          .select("_id sms_provider_name createdAt");
        providerApiList = await apiProviderModel
          .find({ id_department: req.token.id })
          .select("_id api_provider_name createdAt");
        providerWhatsappList = await whatsappProviderModel
          .find({ id_department: req.token.id })
          .select("_id whatsapp_provider_name createdAt");
      } else {
        providerSmsList = await smsProviderModel
          .find()
          .select("_id sms_provider_name createdAt");
        providerApiList = await apiProviderModel
          .find()
          .select("_id api_provider_name createdAt");
        providerWhatsappList = await whatsappProviderModel
          .find()
          .select("_id whatsapp_provider_name createdAt");
      }
      providerSmsList = providerSmsList.map((provider) => {
        const providerObj = provider.toObject();
        providerObj.type = 1;
        return providerObj;
      });
      providerApiList = providerApiList.map((provider) => {
        const providerObj = provider.toObject();
        providerObj.type = 3;
        return providerObj;
      });
      providerWhatsappList = providerWhatsappList.map((provider) => {
        const providerObj = provider.toObject();
        providerObj.type = 2;
        return providerObj;
      });
      combinedProviderList = [
        ...providerSmsList,
        ...providerApiList,
        ...providerWhatsappList,
      ];
    } catch (err) {
      console.error("Error fetching providers", err);
      combinedProviderList = [];
    }
    combinedProviderList.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const total_count = combinedProviderList.length;
    res.locals.result = { combinedProviderList, total_count };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function get_did_numbers(req, res, next) {
  try {
    var isDept = req.token.isDept;
    var isSubAdmin = req.token.isSubAdmin;
    var id_user = req.token.id_user;
    // var sql = `SELECT did.*, did.type AS did_type,departments.name as department,ibl.name AS incoming_blacklist_name,obl.name AS outgoing_blacklist_name FROM did LEFT JOIN cc_blacklist AS ibl ON did.incoming_blacklist_id = ibl.id LEFT JOIN cc_blacklist AS obl ON did.outgoing_blacklist_id = obl.id LEFT JOIN departments  ON departments.id = did.id_department WHERE did.id_user = ${id_user}`;
     var sql = `SELECT did.id,did.id_department,did.id_user,did.did,did.date,did.type AS did_type,did.dest_value,did.dest_id,did.dest_type,did.channels,did.status,did.callrecord,departments.name as department,ibl.name AS incoming_blacklist_name,obl.name AS outgoing_blacklist_name FROM did LEFT JOIN cc_blacklist AS ibl ON did.incoming_blacklist_id = ibl.id LEFT JOIN cc_blacklist AS obl ON did.outgoing_blacklist_id = obl.id LEFT JOIN departments  ON departments.id = did.id_department WHERE did.id_user = ${id_user}`;
    var sqlCount = `SELECT COUNT(*) as count FROM did LEFT JOIN cc_blacklist AS ibl ON did.incoming_blacklist_id = ibl.id LEFT JOIN cc_blacklist AS obl ON did.outgoing_blacklist_id = obl.id WHERE did.id_user = ${id_user} `;
    if (isSubAdmin == 1) {
      sql += ` AND did.id_department IN (${req.token.id_department}) `;
    } else if (isDept == 1) {
      sql += ` AND did.id_department = ${req.token.id} `;
      sqlCount += ` AND did.id_department = ${req.token.id} `;
    }
    var [result] = await getConnection.query(sql);
    var [total] = await getConnection.query(sqlCount);
    res.locals.result = result;
    res.locals.total = result.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function update_did_numbers(req, res, next) {
  try {
    const data = req.body;
    const id = req.query.id;
    var department_id = req.body.department_id;
    var sql = `UPDATE did SET dest_id = '${data.dest_id}', dest_value = '${data.dest_value}', callrecord = '${data.callrecord}',dest_type = '${data.dest_type}',id_department = '${department_id}' `;
    sql += `WHERE id = '${id}'`;
    const [result] = await sequelize.query(sql);

    if (req.token.byot) {
      callByotApi(
        "PUT",
        `/did/${id}`,
        data,
        undefined,
        { token: req.headers.token },
        req.token.id_user
      );
    }

    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function update_did_values(req, res, next) {
  try {
    const { id_user, isAdmin, isSubAdmin, isDept, isAgent, id_department } =
      req.token;
    const { channels, call_record, caller_sms, destination } = req.body;
    const id = req.query.id;
    let sql = `UPDATE did_numbers SET channels = '${channels}', dest_id = '${destination}', callrecord = '${call_record}', sms = '${caller_sms}' WHERE id = ${id} AND id_user = ${id_user} `;
    if (isSubAdmin == 1) {
      sql += ` AND id_department IN (${id_department}) `;
    } else if (isDept == 1) {
      sql += ` AND id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql += ` AND id_department = ${id_department} `;
    }
    const [result] = await sequelize.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function get_did_settings(req, res, next) {
  try {
    var id = req.query.id;
    var sql = `select id,id_department,outgoing_blacklist_id,incoming_blacklist_id,missed_completion_by,missed_consideration,view_missed_report,incoming_template_id,outgoing_template_id from did where id = ${id}`;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_did_template(req, res, next) {
  try {
    var id = req.query.did;
    var type = req.query.type;
    if (type == "incoming") {
      var sql = `select id,incoming_template_id from did where did = ${id}`;
      var [result] = await getConnection.query(sql);
    } else {
      var sql = `select id,outgoing_template_id from did where did = ${id}`;
      var [result] = await getConnection.query(sql);
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_did_settings(req, res, next) {
  try {
    const data = req.body;
    const id = req.query.id;
    var existSql = `SELECT id_department FROM did WHERE id = '${id}'`;
    var [existRes] = await getConnection.query(existSql);
    // Initialize SQL query
    let sql = `UPDATE did SET `;
    let updates = [];
    let values = [];
    // Handle password separately
    if (data.password !== undefined) {
      const bcrypt = require("bcrypt");
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);
      updates.push(`password = '${hashedPassword}'`);
    }
    // Add fields dynamically
    if (data.outgoing_blacklist_id !== undefined) {
      updates.push(`outgoing_blacklist_id = ${data.outgoing_blacklist_id}`);
    }
    if (data.incoming_blacklist_id !== undefined) {
      updates.push(`incoming_blacklist_id = ${data.incoming_blacklist_id}`);
    }
    if (data.missed_completion_by !== undefined) {
      updates.push(`missed_completion_by = ${data.missed_completion_by}`);
    }
    if (data.missed_consideration !== undefined) {
      updates.push(`missed_consideration = ${data.missed_consideration}`);
    }
    if (data.view_missed_report !== undefined) {
      updates.push(`view_missed_report = ${data.view_missed_report}`);
    }
    if (data.incoming_template_id !== undefined) {
      updates.push(`incoming_template_id = '${data.incoming_template_id}'`);
    }
    if (data.outgoing_template_id !== undefined) {
      updates.push(`outgoing_template_id = '${data.outgoing_template_id}'`);
    }

    if (existRes.length != 0) {
      if (existRes[0].id_department != data.department_id) {
        if (data.department_id !== undefined) {
          updates.push(`id_department = ${data.department_id}`);
          updates.push(`dest_value = ""`);
          updates.push(`dest_id =0`);
          updates.push(`dest_type = ""`);
        }
      }
    }
    // Complete the SQL query
    sql += updates.join(", ");
    sql += ` WHERE id = ${id}`;
    // Execute the query
    const [result] = await sequelize.query(sql);
    var didUpdate = await developmentCallEventSqlFun.did_update(id);
    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function get_score_card(req, res, next) {
  try {
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    const id_user = req.token.id_user.toString();
    if (req.query.id_department) {
      var id_department = req.query.id_department;
    } else if (isSubAdmin == 1) {
      var id_department = req.token.id_department;
    } else if (isDept == 1) {
      var id_department = req.token.id;
    }
    // var isSmart = req.token.isSmart;
    var isSmart = req.token.isSmart;
    var date = req.query.date;
    var fromdatetime = new Date();
    var todatetime = new Date();
    if (date != undefined) {
      if (date == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      // if (date == "lastweek") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 7)
      // }
      // if (date == "lastmonth") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 31)
      // }
      // var currentdate = fromdatetime.getDate();
      // var currentMnth = fromdatetime.getMonth() + 1;
      // var year = fromdatetime.getFullYear();
      // var Start = `${year}-${currentMnth}-${currentdate}`;
      if (date == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (date == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var today = new Date();
      var dd = today.getDate().toString().padStart(2, "0");
      var mm = (today.getMonth() + 1).toString().padStart(2, "0");
      var yyyy = today.getFullYear();
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
    }

    if (req.query.worktime) {
      const { start = Start, end = End } = getWorkingTImeBasedStartAndEnd(
        req.query.worktime,
        req.query.date ?? "today"
      );
      Start = start;
      End = end;
    }

    if (isSmart == 1) {
      const matchCondition_uniqueId = {
        event: "start",
        customerId: id_user,
      };
      if (isSubAdmin == 1) {
        matchCondition_uniqueId.deptId = id_department
          .split(",")
          .map((id) => id.trim());
      } else if (isDept == 1) {
        matchCondition_uniqueId.deptId = req.token.id;
      }
      const uniqueIds = await smartGroupReport.distinct(
        "uniqueId",
        matchCondition_uniqueId
      );
      const matchCondition = {
        eventStatus: "dial_answered",
        eventTime: {
          $gte: Start,
          $lte: End,
        },
        smartGroupId: req.token.id.toString(),
        uniqueId: { $in: uniqueIds },
      };
      const answeredResult_smartgroup = await smartGroupReport.aggregate([
        {
          $match: matchCondition, // Filter for "dial_answered"
        },
        {
          $group: {
            _id: "$userId", // Group by userId
            count: { $sum: 1 }, // Count the number of occurrences for each userId
          },
        },
        {
          $sort: { count: -1 }, // Sort by count in descending order
        },
        {
          $project: {
            _id: 0, // Remove _id
            userId: "$_id", // Include userId
            count: 1, // Include the count
          },
        },
      ]);
      const maxCount_ans = Math.max(
        ...answeredResult_smartgroup.map((item) => item.count)
      );
      // Filter the users with the maximum count and select the ones with the highest userId
      const maxCountUsers_ans = answeredResult_smartgroup
        .filter((item) => item.count === maxCount_ans)
        .map((item) => item.userId)
        .sort((a, b) => b - a);
      if (maxCountUsers_ans.length != 0) {
        const user_ids = maxCountUsers_ans.join(",");
        var userSql = `SELECT user.id, CONCAT(user.first_name, ' ', user.last_name) AS name,user_settings.did,user.upload_image FROM user JOIN user_settings ON user.id = user_settings.user_id WHERE user.id IN (${user_ids})`;
        var [answer_smartgroup] = await getConnection.query(userSql);
      }
      var highestCount = Math.max(
        ...answeredResult_smartgroup.map((user) => user.count)
      );
      var usersWithHighestCount = answeredResult_smartgroup.filter(
        (user) => user.count == highestCount
      );
      usersWithHighestCount = usersWithHighestCount.map((item) => {
        const matchingXyz = answer_smartgroup.find((x) => x.id === item.userId);
        if (matchingXyz) {
          // Update data in abc with matching data from xyz
          return { ...item, ...matchingXyz };
        }
        return item;
      });
      const matchCondition_all = {
        event: "start",
        customerId: id_user,
      };
      if (isSubAdmin == 1) {
        matchCondition_all.deptId = id_department
          .split(",")
          .map((id) => id.trim());
      } else if (isDept == 1) {
        matchCondition_all.deptId = req.token.id;
      }
      const uniqueIds_handle = await smartGroupReport.distinct(
        "uniqueId",
        matchCondition_all
      );
      const matchCondition_handle = {
        eventStatus: "start_user_check",
        eventTime: {
          $gte: Start,
          $lte: End,
        },
        smartGroupId: req.token.id.toString(),
        uniqueId: { $in: uniqueIds_handle },
      };
      const dial_smart_data = await smartGroupReport.aggregate([
        {
          $match: matchCondition_handle,
        },
        {
          $sort: {
            // Sort by userId and eventTime
            userId: 1,
            eventTime: 1,
          },
        },
        {
          $group: {
            _id: { uniqueId: "$uniqueId", userId: "$userId" }, // Group by uniqueId and userId
            firstDoc: { $first: "$$ROOT" }, // Take the first document in each group
          },
        },
        {
          $replaceRoot: { newRoot: "$firstDoc" }, // Replace root with first document
        },
        {
          $project: { _id: 0 }, // Exclude _id field
        },
        {
          $group: {
            _id: "$userId", // Group by userId
            count: { $sum: 1 }, // Count the number of documents for each user
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id field
            userId: "$_id", // Rename _id to userId
            count: 1, // Include the count
          },
        },
      ]);
      const maxCount = Math.max(...dial_smart_data.map((item) => item.count));
      // Filter the users with the maximum count and select the ones with the highest userId
      const maxCountUsers = dial_smart_data
        .filter((item) => item.count === maxCount)
        .map((item) => item.userId)
        .sort((a, b) => b - a);

      if (maxCountUsers.length != 0) {
        const user_ids = maxCountUsers.join(",");
        var userSql = `SELECT user.id, CONCAT(user.first_name, ' ', user.last_name) AS name,user_settings.did,user.upload_image FROM user JOIN user_settings ON user.id = user_settings.user_id WHERE user.id IN (${user_ids})`;
        var [handle_smartgroup] = await getConnection.query(userSql);
      }
      var highestCount = Math.max(...dial_smart_data.map((user) => user.count));
      var usersWithHighestCount_handle = dial_smart_data.filter(
        (user) => user.count == highestCount
      );
      usersWithHighestCount_handle = usersWithHighestCount_handle.map(
        (item) => {
          const matchingXyz = handle_smartgroup.find(
            (x) => x.id === item.userId
          );
          if (matchingXyz) {
            // Update data in abc with matching data from xyz
            return { ...item, ...matchingXyz };
          }
          return item;
        }
      );
      res.locals.result = {
        most_answered: usersWithHighestCount,
        most_handle: usersWithHighestCount_handle,
      };
    } else {
      var dialOutgoing = `
     SELECT cc_outgoing_reports.user_id AS userId, 
                   CONCAT(u.first_name, ' ', u.last_name) AS name, user_settings.did,u.upload_image,
                   COUNT(*) AS count
            FROM cc_outgoing_reports
            INNER JOIN user u ON u.id = cc_outgoing_reports.user_id LEFT join user_settings on cc_outgoing_reports.user_id = user_settings.user_id
            WHERE cc_outgoing_reports.id_user = ${id_user} AND date BETWEEN '${Start}' and '${End}'
`;
      if (isSubAdmin == 1) {
        dialOutgoing += `AND cc_outgoing_reports.id_department in (${id_department})  `;
      } else if (isDept == 1) {
        dialOutgoing += `AND cc_outgoing_reports.id_department='${id_department}' `;
      }
      dialOutgoing += ` GROUP BY cc_outgoing_reports.user_id ORDER BY count DESC LIMIT 1`;

      var [dialOutgoingResult] = await getConnection.query(dialOutgoing);

      const most_dial = dialOutgoingResult;
      var answeredSql = `
  SELECT ir.user_id AS user_id, COUNT(*) AS count
  FROM incoming_reports ir
  WHERE ir.id_user = ${id_user} 
    AND ir.user_status = "Answered" 
    AND ir.app != "smartgroup" and call_start_time between '${Start}' and '${End}' `;
      if (isSubAdmin == 1) {
        answeredSql += `AND ir.id_department in (${id_department})  `;
      } else if (isDept == 1) {
        answeredSql += `AND ir.id_department='${id_department}' `;
      }
      answeredSql += `  GROUP BY ir.user_id ORDER BY count DESC;`;
      var [answeredResult] = await getConnection.query(answeredSql);
      // Format the result to match the desired output structure
      const answeredSql_result = answeredResult.map((row) => ({
        count: row.count,
        userId: row.user_id,
      }));
      // console.log("sql==========================================================================", answeredSql)
      // console.log("answeredSql===================================================", answeredResult)
      const matchCondition_uniqueId = {
        event: "start",
        customerId: id_user,
      };

      if (isSubAdmin == 1) {
        matchCondition_uniqueId.deptId = id_department;
      } else if (isDept == 1) {
        matchCondition_uniqueId.deptId = req.token.id;
      }
      const uniqueIds = await smartGroupReport.distinct(
        "uniqueId",
        matchCondition_uniqueId
      );
      const matchCondition = {
        eventStatus: "dial_answered",
        eventTime: {
          $gte: Start,
          $lte: End,
        },
        uniqueId: { $in: uniqueIds },
        isCallFlow: { $exists: false },
      };

      const answeredResult_smartgroup = await smartGroupReport.aggregate([
        {
          $match: matchCondition, // Filter for "dial_answered"
        },
        {
          $group: {
            _id: "$userId", // Group by userId
            count: { $sum: 1 }, // Count the number of occurrences for each userId
          },
        },
        {
          $sort: { count: -1 }, // Sort by count in descending order
        },
        {
          $project: {
            _id: 0, // Remove _id
            userId: "$_id", // Include userId
            count: 1, // Include the count
          },
        },
      ]);
      var answerd_data_total = [];
      answerd_data_total = [
        ...answeredSql_result,
        ...answeredResult_smartgroup,
      ];
      // console.log("answeredSql_result========================================================================", answeredSql_result)
      // console.log("answeredResult_smartgroup========================================================================", answeredResult_smartgroup)
      // console.log("answerd_data_total========================================================================", answerd_data_total)
      const totalCountsByUserId = {};
      answerd_data_total.forEach((item) => {
        if (totalCountsByUserId[item.userId]) {
          totalCountsByUserId[item.userId] += item.count;
        } else {
          totalCountsByUserId[item.userId] = item.count;
        }
      });
      // Step 2: Find the userId(s) with the max count
      let maxCounts = 0;
      let maxUserIds = [];
      for (const userId in totalCountsByUserId) {
        if (totalCountsByUserId[userId] > maxCounts) {
          maxCounts = totalCountsByUserId[userId];
          maxUserIds = [userId]; // reset the array with the current userId
        } else if (totalCountsByUserId[userId] === maxCounts) {
          maxUserIds.push(userId); // add the current userId if it matches the max count
        }
      }
      if (maxUserIds.length != 0) {
        const user_ids = maxUserIds.join(",");
        var userSql = `SELECT user.id, CONCAT(user.first_name, ' ', user.last_name) AS name,user_settings.did,user.upload_image FROM user JOIN user_settings ON user.id = user_settings.user_id WHERE user.id IN (${user_ids})`;
        var [user_result] = await getConnection.query(userSql);
      }
      var highestCount = Math.max(
        ...answerd_data_total.map((user) => user.count)
      );
      var usersWithHighestCount_answer = answerd_data_total.filter(
        (user) => user.count == highestCount
      );

      usersWithHighestCount_answer = usersWithHighestCount_answer.map(
        (item) => {
          const matchingXyz = user_result.find((x) => x.id == item.userId);
          if (matchingXyz) {
            // Update data in abc with matching data from xyz
            return { ...item, ...matchingXyz };
          }
          return item;
        }
      );
      //========================================================================================================================================  HANDLE
      var dialIncoming = `
  SELECT ir.user_id AS userId, COUNT(*) AS count
  FROM incoming_reports ir
  WHERE ir.id_user = ${id_user}  AND ir.user_status = "Answered" 
  AND ir.app != "smartgroup" and call_start_time between '${Start}' and '${End}'
 
`;
      if (isSubAdmin == 1) {
        dialIncoming += `AND ir.id_department in (${id_department})  `;
      } else if (isDept == 1) {
        dialIncoming += `AND ir.id_department='${id_department}' `;
      }
      dialIncoming += ` GROUP BY ir.user_id ORDER BY count DESC`;

      var [dialIncomingResult] = await getConnection.query(dialIncoming);

      const matchCondition_all = {
        event: "start",
        customerId: id_user,
      };
      if (isSubAdmin == 1) {
        matchCondition_all.deptId = id_department
          .split(",")
          .map((id) => id.trim());
      } else if (isDept == 1) {
        matchCondition_all.deptId = req.token.id;
      }
      const uniqueIds_handle = await smartGroupReport.distinct(
        "uniqueId",
        matchCondition_all
      );
      const matchCondition_handle = {
        eventStatus: "start_user_check",
        eventTime: {
          $gte: Start,
          $lte: End,
        },
        uniqueId: { $in: uniqueIds_handle },
      };

      const dial_smart_data = await smartGroupReport.aggregate([
        {
          $match: matchCondition_handle,
        },
        {
          $sort: {
            // Sort by userId and eventTime
            userId: 1,
            eventTime: 1,
          },
        },
        {
          $group: {
            _id: { uniqueId: "$uniqueId", userId: "$userId" }, // Group by uniqueId and userId
            firstDoc: { $first: "$$ROOT" }, // Take the first document in each group
          },
        },
        {
          $replaceRoot: { newRoot: "$firstDoc" }, // Replace root with first document
        },
        {
          $project: { _id: 0 }, // Exclude _id field
        },
        {
          $group: {
            _id: "$userId", // Group by userId
            count: { $sum: 1 }, // Count the number of documents for each user
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id field
            userId: "$_id", // Rename _id to userId
            count: 1, // Include the count
          },
        },
      ]);

      // console.log("dial_smart_data========================================================================", dial_smart_data)
      // console.log("dialIncomingResult========================================================================", dialIncomingResult)
      // console.log("dialOutgoingResult========================================================================", dialOutgoingResult)

      var all_handle_count = [
        ...dial_smart_data,
        ...dialIncomingResult,
        ...dialOutgoingResult,
      ];

      // const maxCount = Math.max(...all_handle_count.map(item => item.count));

      // console.log("all_handle_count========================================================================", all_handle_count,maxCount)

      // // Filter users with the highest count and extract userId
      // const handleusersWithMostCount = all_handle_count
      //     .filter(item => item.count === maxCount)
      //     .map(item => item.userId);

      //     console.log("handleusersWithMostCount========================================================================", handleusersWithMostCount)

      const totalCounts = all_handle_count.reduce((acc, { userId, count }) => {
        acc[userId] = (acc[userId] || 0) + count;
        return acc;
      }, {});

      // Get the highest total count
      var highestTotalCount = Math.max(...Object.values(totalCounts));

      // Find all users with the highest total count
      var highestUsers = Object.entries(totalCounts)
        .filter(([_, count]) => count == highestTotalCount)
        .map(([userId, count]) => ({ userId: Number(userId), count }));

      if (highestUsers.length != 0) {
        const userIds = highestUsers.map((item) => item.userId);
        const user_ids = userIds.join(",");

        var userSql = `SELECT user.id, CONCAT(user.first_name, ' ', user.last_name) AS name,user_settings.did,user.upload_image FROM user JOIN user_settings ON user.id = user_settings.user_id WHERE user.id IN (${user_ids})`;
        var [handle_result] = await getConnection.query(userSql);
      }

      //console.log("handle_result========================================================================",handle_result)

      // var highestCount = Math.max(...all_handle_count.map(user => user.count));
      // var usersWithHighestCount_handle = all_handle_count.filter(user => user.count == highestTotalCount);

      usersWithHighestCount_handle = highestUsers.map((item) => {
        const matchingXyz = handle_result.find((x) => x.id == item.userId);
        //console.log("matchingXyz========================================================================",matchingXyz)

        if (matchingXyz) {
          // Update data in abc with matching data from xyz
          return { ...item, ...matchingXyz };
        }
        return item;
      });

      res.locals.result = [
        {
          most_dial,
          most_answered: usersWithHighestCount_answer,
          most_handle: usersWithHighestCount_handle,
        },
      ];
    }
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}

async function add_customer_plan(req, res, next) {
  try {
    const data = req.body;
    const result = await customerPlanModel.create(data);
    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function get_customer_plan_by_id(req, res, next) {
  try {
    var id = req.query.id;
    var sql = `SELECT * from customer_plan where id = '${id}'`;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_customer_plan_by_customer_id(req, res, next) {
  try {
    var customer_id = req.query.customer_id;
    var sql = `SELECT * from customer_plan where customer_id = '${customer_id}'`;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_customer_plan_by_id(req, res, next) {
  try {
    const { pbx, crm, call_center } = req.body;
    const id = req.query.id;
    const sql = `UPDATE customer_plan SET  pbx = '${pbx}', crm = '${crm}', call_center = '${call_center}' WHERE id = '${id}'`;
    var [result] = await sequelize.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_customer_plan_by_customer_id(req, res, next) {
  try {
    const { pbx, crm, call_center } = req.body;
    const customer_id = req.query.customer_id;
    const sql = `UPDATE customer_plan SET  pbx = '${pbx}', crm = '${crm}', call_center = '${call_center}' WHERE customer_id = '${customer_id}'`;
    var [result] = await sequelize.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_customer_plan_by_id(req, res, next) {
  try {
    const id = req.query.id;
    const sql = `DELETE FROM customer_plan WHERE id = '${id}'`;
    var [result] = await sequelize.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_customer_plan_by_customer_id(req, res, next) {
  try {
    const customer_id = req.query.customer_id;
    const sql = `DELETE FROM customer_plan WHERE customer_id = '${customer_id}'`;
    var [result] = await sequelize.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function dashboard_campaign_count(req, res, next) {
  try {
    var broadcast = [];
    var callcenter = [];
    var broadcastsql = `SELECT total_contacts,id,name,status,work_time_start,work_time_end,schedule_start,schedule_end FROM cc_campaign WHERE schedule_end >= CURDATE() and type = 2 `;
    if (req.token.isAdmin == 1) {
      broadcastsql += `AND cc_campaign.id_user='${req.token.id}' `;
    } else if (req.token.isSubAdmin == 1) {
      broadcastsql += `AND cc_campaign.id_department in (${req.token.id_department}) AND cc_campaign.id_user='${req.token.id_user}' `;
    } else if (req.token.isDept == 1) {
      broadcastsql += `AND cc_campaign.id_department='${req.token.id}' AND cc_campaign.id_user='${req.token.id_user}' `;
    }
    var [broadcastRes] = await getConnection.query(broadcastsql);
    var callcentersql = `SELECT total_contacts,id,name,status FROM cc_campaign WHERE status = 1 and type = 1 `;
    if (req.token.isAdmin == 1) {
      callcentersql += `AND cc_campaign.id_user='${req.token.id}' `;
    } else if (req.token.isSubAdmin == 1) {
      callcentersql += `AND cc_campaign.id_department in (${req.token.id_department}) AND cc_campaign.id_user='${req.token.id_user}' `;
    } else if (req.token.isDept == 1) {
      callcentersql += `AND cc_campaign.id_department='${req.token.id}' AND cc_campaign.id_user='${req.token.id_user}' `;
    }
    var [callcenterRes] = await getConnection.query(callcentersql);
    // var total_contacts = broadcastRes.concat(callcenterRes);
    var sql1 = `SELECT SUM(attempted_contact) as attempted_contact,SUM(retry) as retry,campaign_id FROM cc_campaign_call_summary GROUP BY campaign_id `;
    if (req.token.isAdmin == 1) {
      sql1 += `AND cc_campaign_call_summary.id_user='${req.token.id}' `;
    } else if (req.token.isSubAdmin == 1) {
      sql1 += `AND cc_campaign_call_summary.id_department in (${req.token.id_department}) AND cc_campaign_call_summary.id_user='${req.token.id_user}' `;
    } else if (req.token.isDept == 1) {
      sql1 += `AND cc_campaign_call_summary.id_department='${req.token.id}' AND cc_campaign_call_summary.id_user='${req.token.id_user}' `;
    }
    var [attempted_contact] = await getConnection.query(sql1);
    // var result = []
    function calculatePercentage(partialValue, totalValue) {
      return (partialValue / totalValue) * 100;
    }
    if (broadcastRes.length != 0) {
      broadcastRes.map((value) => {
        var start = new Date(value.schedule_start);
        var sdd = start.getDate();
        var smm = start.getMonth() + 1;
        var syyyy = start.getFullYear();
        var shours = start.getHours();
        var smin = start.getMinutes();
        if (shours > 12) {
          shours = shours - 12;
          var startDate = `${syyyy}-${smm}-${sdd}`;
          var startDateTime = `${shours}:${smin} PM`;
        } else if (shours == 12) {
          var startDate = `${syyyy}-${smm}-${sdd}`;
          var startDateTime = `${shours}:${smin} PM`;
        } else if (shours == 0) {
          shours = shours + 12;
          var startDate = `${syyyy}-${smm}-${sdd} `;
          var startDateTime = `${shours}:${smin} AM`;
        } else {
          var startDate = `${syyyy}-${smm}-${sdd} `;
          var startDateTime = `${shours}:${smin} AM`;
        }
        var end = new Date(value.schedule_end);
        var edd = end.getDate();
        var emm = end.getMonth() + 1;
        var eyyyy = end.getFullYear();
        var ehours = end.getHours();
        var emin = end.getMinutes();
        if (ehours > 12) {
          ehours = ehours - 12;
          var endDate = `${eyyyy}-${emm}-${edd}`;
          var endDateTime = `${ehours}:${emin} PM `;
        } else if (ehours == 12) {
          var endDate = `${eyyyy}-${emm}-${edd}`;
          var endDateTime = `${ehours}:${emin} PM `;
        } else if (ehours == 0) {
          ehours = ehours + 12;
          var endDate = `${eyyyy}-${emm}-${edd}`;
          var endDateTime = `${ehours}:${emin} AM`;
        } else {
          var endDate = `${eyyyy}-${emm}-${edd}`;
          var endDateTime = `${ehours}:${emin} AM`;
        }
        var work_time_start = value.work_time_start;
        var work_time_end = value.work_time_end;
        campaignTime = [
          { work_time_start },
          { work_time_end },
          { startDateTime },
          { endDateTime },
        ];
        var obj = {
          campaign_id: value.id,
          name: value.name,
          status: value.status,
          total_contacts: value.total_contacts,
          end_date: value.schedule_end,
          campaignTime: campaignTime,
          schedule_start: startDate,
          schedule_end: endDate,
        };
        if (attempted_contact.length != 0) {
          attempted_contact.map((data) => {
            if (value.id == data.campaign_id) {
              var attempted_contact =
                Number(data.attempted_contact) - Number(data.retry);
              obj.attempted_contact = attempted_contact;
              if (value.total_contacts != 0) {
                obj.progressBarPer = calculatePercentage(
                  attempted_contact,
                  value.total_contacts
                );
              } else {
                obj.progressBarPer = 0;
              }
            }
          });
        }
        if (obj.attempted_contact == undefined) {
          obj.attempted_contact = 0;
        }
        if (obj.progressBarPer == undefined) {
          obj.progressBarPer = 0;
        }
        broadcast.push(obj);
      });
    }
    if (callcenterRes.length != 0) {
      callcenterRes.map((value) => {
        var obj = {
          campaign_id: value.id,
          name: value.name,
          status: value.status,
          total_contacts: value.total_contacts,
        };
        if (attempted_contact.length != 0) {
          attempted_contact.map((data) => {
            if (value.id == data.campaign_id) {
              var attempted_contact =
                Number(data.attempted_contact) - Number(data.retry);
              obj.attempted_contact = attempted_contact;
              if (value.total_contacts != 0) {
                obj.progressBarPer = calculatePercentage(
                  attempted_contact,
                  value.total_contacts
                );
              } else {
                obj.progressBarPer = 0;
              }
            }
          });
        }
        if (obj.attempted_contact == undefined) {
          obj.attempted_contact = 0;
        }
        if (obj.progressBarPer == undefined) {
          obj.progressBarPer = 0;
        }
        callcenter.push(obj);
      });
    }
    broadcast.sort((a, b) => b.campaign_id - a.campaign_id);
    callcenter.sort((a, b) => b.campaign_id - a.campaign_id);
    res.locals.result = { broadcast, callcenter };
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function dashboard_incoming_weekly_report(req, res, next) {
  try {
    var fromdatetime = new Date();
    var todatetime = new Date();
    fromdatetime.setDate(fromdatetime.getDate() - 7);
    var currentdate = fromdatetime.getDate();
    var currentMnth = fromdatetime.getMonth() + 1;
    var year = fromdatetime.getFullYear();
    var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
    var currentdate = todatetime.getDate();
    var currentMnth = todatetime.getMonth() + 1;
    var year = todatetime.getFullYear();
    var Todate = `${year}-${currentMnth}-${currentdate} 23:59:59`;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    var department_id = req.query.department_id;
    if (req.token.did != undefined) {
      var didNumber = req.token.did;
    } else if (req.token.didString != undefined) {
      var didNumber = req.token.didString;
    } else {
      var didNumber = req.query.didnumber;
    }
    var sqlCountIncoming = `select user_status as agentStatus,user_status as callStatus,connected_duration as answeredDuration,destination as didNumber,DATE_FORMAT(call_start_time,'%d-%m-%y') as date from incoming_reports where call_start_time BETWEEN '${fromDate}' and '${Todate}' `;
    if (isAdmin == 1) {
      sqlCountIncoming += `AND incoming_reports.id_user='${id_user}' `;
    } else if (isSubAdmin == 1) {
      if (department_id != undefined) {
        sqlCountIncoming += `AND incoming_reports.id_user='${id_user}' `;
      } else {
        sqlCountIncoming += `AND incoming_reports.id_department in (${id_department}) AND incoming_reports.id_user='${id_user}' `;
      }
    } else if (isDept == 1) {
      sqlCountIncoming += `AND incoming_reports.id_department='${req.token.id}' AND incoming_reports.id_user='${id_user}' `;
    }
    if (department_id != undefined) {
      sqlCountIncoming += `AND incoming_reports.id_department='${department_id}'`;
    }
    var [incomingCount] = await getConnection.query(sqlCountIncoming);
    var countIncoming = [];
    if (incomingCount.length != 0) {
      incomingCount.map(async (incomingData) => {
        var date = incomingData.date;
        if (countIncoming.length == 0) {
          countIncoming.push({
            date: date,
            totalIncoming: 0,
            answeredIncoming: 0,
            missedIncoming: 0,
          });
          if (didNumber != undefined) {
            if (
              incomingData.didNumber == didNumber ||
              incomingData.didNumber == "0" + didNumber ||
              incomingData.didNumber == "91" + didNumber
            ) {
              if (incomingData.callStatus == "ANSWERED") {
                countIncoming[0].totalIncoming += 1;
                countIncoming[0].answeredIncoming += 1;
              } else if (incomingData.callStatus != "ANSWERED") {
                countIncoming[0].totalIncoming += 1;
                countIncoming[0].missedIncoming += 1;
              }
            }
          } else {
            if (incomingData.callStatus == "ANSWERED") {
              countIncoming[0].totalIncoming += 1;
              countIncoming[0].answeredIncoming += 1;
            } else if (incomingData.callStatus != "ANSWERED") {
              countIncoming[0].totalIncoming += 1;
              countIncoming[0].missedIncoming += 1;
            }
          }
        } else {
          let foundObject = countIncoming.findIndex((obj) => obj.date === date);
          if (foundObject != -1) {
            if (didNumber != undefined) {
              if (
                incomingData.didNumber == didNumber ||
                incomingData.didNumber == "0" + didNumber ||
                incomingData.didNumber == "91" + didNumber
              ) {
                if (incomingData.callStatus == "ANSWERED") {
                  countIncoming[foundObject].totalIncoming += 1;
                  countIncoming[foundObject].answeredIncoming += 1;
                } else if (incomingData.callStatus != "ANSWERED") {
                  countIncoming[foundObject].totalIncoming += 1;
                  countIncoming[foundObject].missedIncoming += 1;
                }
              }
            } else {
              if (incomingData.callStatus == "ANSWERED") {
                countIncoming[foundObject].totalIncoming += 1;
                countIncoming[foundObject].answeredIncoming += 1;
              } else if (incomingData.callStatus != "ANSWERED") {
                countIncoming[foundObject].totalIncoming += 1;
                countIncoming[foundObject].missedIncoming += 1;
              }
            }
          } else {
            countIncoming.push({
              date: date,
              totalIncoming: 0,
              answeredIncoming: 0,
              missedIncoming: 0,
            });
            var incominglength = countIncoming.length - 1;
            if (didNumber != undefined) {
              if (
                incomingData.didNumber == didNumber ||
                incomingData.didNumber == "0" + didNumber ||
                incomingData.didNumber == "91" + didNumber
              ) {
                if (incomingData.callStatus == "ANSWERED") {
                  countIncoming[incominglength].totalIncoming += 1;
                  countIncoming[incominglength].answeredIncoming += 1;
                } else if (incomingData.callStatus != "ANSWERED") {
                  countIncoming[incominglength].totalIncoming += 1;
                  countIncoming[incominglength].missedIncoming += 1;
                }
              }
            } else {
              if (incomingData.callStatus == "ANSWERED") {
                countIncoming[incominglength].totalIncoming += 1;
                countIncoming[incominglength].answeredIncoming += 1;
              } else if (incomingData.callStatus != "ANSWERED") {
                countIncoming[incominglength].totalIncoming += 1;
                countIncoming[incominglength].missedIncoming += 1;
              }
            }
          }
        }
      });
    }
    function formatDate(date) {
      const day = ("0" + date.getDate()).slice(-2);
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear().toString().slice(-2);
      return `${day}-${month}-${year}`;
    }
    let result = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = formatDate(date);
      const existingEntry = countIncoming.find(
        (entry) => entry.date === formattedDate
      );
      if (existingEntry) {
        result.push(existingEntry);
      } else {
        result.push({
          date: formattedDate,
          totalIncoming: 0,
          answeredIncoming: 0,
          missedIncoming: 0,
        });
      }
    }
    var map_result = Promise.all(
      result.map(async (value) => {
        const [day, month, year] = value.date.split("-");
        const dateObj = new Date(`20${year}-${month}-${day}`);

        // Get the day of the week
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const dayOfWeek = daysOfWeek[dateObj.getDay()];
        value.day = dayOfWeek;
        return value;
      })
    );
    var result1 = await map_result;
    res.locals.result = result1;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function dashboard_agent_activity(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;

    const { type: callType = "all-calls" } = req.query;
    
    var mongo_id_user = id_user.toString();
    var worktime = req.query.worktime;
    var department_id = req.query.department_id;
    // const filterBreakType = req.query.filterBreakType
    var date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var time = hours + ":" + minutes + ":" + seconds;
    var today = `${yyyy}-${mm}-${dd}`;
    var presentTime = `${yyyy}-${mm}-${dd} ${time}`;
    var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
    var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    var Start1 = `${yyyy}-${mm}-${dd} 00:00:00`;
    var End1 = `${yyyy}-${mm}-${dd} 23:59:59`;
    var currentDate = `${yyyy}-${mm}-${dd}`;
    if (worktime != undefined) {
      worktime = worktime.split("-").map(time => time === "24:00" ? "23:59" : time);
      var splitStart = Start.split(" ");
      var splitEnd = End.split(" ");
      Start = `${splitStart[0]} ${worktime[0]}:00`;
      End = `${splitEnd[0]} ${worktime[1]}:00`;
    }
    var sql = `SELECT user.id as agentId, user.id_user, CONCAT(user.first_name, ' ', user.last_name) AS name,user_settings.regNumber as agentRegNumber, user_live_data.currentBreakId as breakId, user_live_data.popup_status, user_live_data.isHold, user_live_data.currentBreakName as breakName, user_live_data.currentBreakStartDate as sessionStartDate, user_live_data.currentCallStatus,breaks.break_type,user_live_data.loginStartTime , user.upload_image, roles.role user_role FROM user LEFT JOIN user_live_data ON user.id = user_live_data.user_id LEFT JOIN user_settings ON user.id = user_settings.user_id LEFT JOIN breaks ON breaks.id = user_live_data.currentBreakId LEFT JOIN user_role roles ON roles.user_id = user.id AND roles.role = "1" where 1 `;
    if (isAdmin == 1) {
      sql += `AND user.id_user='${id_user}' `;
    } else if (isSubAdmin == 1) {
      
      if (department_id != undefined) {
        sql += `AND user.id_user='${id_user}' `;
      } else {
        sql += `AND user.id_department in (${id_department}) AND user.id_user = ${id_user} `;
      }
    } else if (isDept == 1) {
      sql += `AND user.id_department='${req.token.id}' AND user.id_user = ${id_user} `;
    }
    if (department_id != undefined) {
      sql += `AND user.id_department='${department_id}' `;
    }
    // if(filterBreakType == "Available"){
    //   sql += `AND user_live_data.currentBreakName = 'Available' `;
    // } 
    sql += `GROUP BY user.id ORDER BY INSTR(breakName, 'Available') DESC `;
    var [result] = await rackServer.query(sql);

    //incoming
    let incomingRes = [];
    if(["incoming", "all-calls"].includes(callType)) {
      
      let incoming = `SELECT user_id as agents_list,total_hold_time ,user_status as callStatus,call_start_time as callStartTime, 1 as calls,call_status,user_id as answeredAgent,connected_duration as total_duration FROM incoming_reports WHERE call_start_time BETWEEN '${Start}' AND '${End}' `;
      if (isAdmin == 1) {
        incoming += `AND incoming_reports.id_user='${id_user}' `;
      } else if (isSubAdmin == 1) {
        if (department_id != undefined) {
          incoming += `AND incoming_reports.id_user='${id_user}' `;
        } else {
          incoming += `AND incoming_reports.id_department in (${id_department}) and id_user = ${id_user} `;
        }
      } else if (isDept == 1) {
        incoming += `AND incoming_reports.id_department='${req.token.id}' and id_user = ${id_user} `;
      }
      if (department_id != undefined) {
        incoming += `AND incoming_reports.id_department='${department_id}' `;
      }
      incoming += `ORDER BY call_start_time asc`;
      const [rows] = await rackServer.query(incoming);
      incomingRes = rows;
    }
    
    //outgoing
    let outgoingRes = [];
    if(["outgoing", "all-calls"].includes(callType)) {

      let outgoing = `SELECT user_id,total_hold_time ,date,duration,status,1 as calls FROM cc_outgoing_reports WHERE date BETWEEN '${Start}' AND '${End}' `;
      if (isAdmin == 1) {
        outgoing += `AND cc_outgoing_reports.id_user='${id_user}' `;
      } else if (isSubAdmin == 1) {
        if (department_id != undefined) {
          outgoing += `AND cc_outgoing_reports.id_user='${id_user}' `;
        } else {
          outgoing += `AND cc_outgoing_reports.id_department in (${id_department}) and id_user = ${id_user} `;
        }
      } else if (isDept == 1) {
        outgoing += `AND cc_outgoing_reports.id_department='${req.token.id}' and id_user = ${id_user} `;
      }
      if (department_id != undefined) {
        outgoing += `AND cc_outgoing_reports.id_department='${department_id}' `;
      }
      outgoing += ` ORDER BY date asc`;
      const [rows] = await rackServer.query(outgoing);
      outgoingRes = rows;
    }

    var userIdsSql = `select user.id from user join user_settings on user_settings.user_id = user.id where is_agent = 1 and id_user = ${id_user} `;
    if (isSubAdmin == 1) {
      userIdsSql += `AND id_department in (${id_department})`;
    } else if (isDept == 1) {
      userIdsSql += `AND id_department='${req.token.id}' `;
    }
    if (department_id != undefined) {
      userIdsSql += `AND id_department='${department_id}' `;
    }
    var [userIds] = await rackServer.query(userIdsSql);
    console.log(userIds.length);
    var totalLoginSql = `SELECT Count(user_id) as total FROM user_live_data LEFT JOIN user ON user.id = user_live_data.user_id WHERE loginStartTime BETWEEN '${Start1}' AND '${End1}' and id_user = ${id_user} `;
    if (isSubAdmin == 1) {
      totalLoginSql += `AND id_department in (${id_department})`;
    } else if (isDept == 1) {
      totalLoginSql += `AND id_department='${req.token.id}' `;
    }
    if (department_id != undefined) {
      totalLoginSql += `AND id_department='${department_id}' `;
    }
    var [totalLoginRes] = await rackServer.query(totalLoginSql);
    var total_today_Login = totalLoginRes[0].total;
    if (userIds.length != 0) {
      userIds = userIds.map((data) => data.id);
      // var userBreaks = `SELECT COUNT(CASE WHEN currentBreakName NOT IN('Logout','')  THEN 1 END) AS activeCount,COUNT(CASE WHEN currentBreakName = 'Available' and (currentCallStatus = 0 OR popup_status != 1) THEN 1 END) AS availableCount,COUNT(CASE WHEN currentCallStatus != 0  THEN 1 END) AS oncallCount,COUNT(CASE WHEN isHold = 1 THEN 1 END) AS onholdcount, COUNT(CASE WHEN currentBreakName NOT IN('Available','Logout','') and popup_status = 0 THEN 1 END) AS breakCount,COUNT(CASE WHEN popup_status = 1 and currentBreakName NOT IN('Available','Logout','') and currentCallStatus = 0 THEN 1 END) AS popupCount FROM user_live_data WHERE user_live_data.user_id IN (${userIds.join(',')}) AND loginStartTime BETWEEN '${Start}' AND '${End}' `;
      // var [userBreaksCount] = await rackServer.query(userBreaks);
      var userBreaks = `SELECT COUNT(CASE WHEN currentBreakName NOT IN('Logout','')  THEN 1 END) AS activeCount FROM user_live_data WHERE user_live_data.user_id IN (${userIds.join(
        ","
      )}) AND loginStartTime BETWEEN '${Start1}' AND '${End1}' `;
      var [userBreaksCount] = await rackServer.query(userBreaks);
      var activeCount = userBreaksCount[0].activeCount;
      var userHoldCountSql = `SELECT user_live_data.user_id as agentId,CAST(user_role.role AS UNSIGNED) AS role  FROM user_live_data LEFT JOIN user_role ON user_role.user_id = user_live_data.user_id WHERE isHold = 1 AND user_live_data.user_id IN (${userIds.join(
        ","
      )}) AND user_role.role IN(2) AND loginStartTime BETWEEN '${Start1}' AND '${End1}'`;
      var [holdRes] = await rackServer.query(userHoldCountSql);
      var userOncallCountSql = `SELECT user_live_data.user_id as agentId,currentCallStartTime,CAST(user_role.role AS UNSIGNED) AS role  FROM user_live_data LEFT JOIN user_role ON user_role.user_id = user_live_data.user_id WHERE currentCallStatus != 0 AND isHold != 1 AND user_live_data.user_id IN (${userIds.join(
        ","
      )}) AND user_role.role IN(1,2) AND loginStartTime BETWEEN '${Start1}' AND '${End1}'`;
      var [oncallRes] = await rackServer.query(userOncallCountSql);
      var userOnPopupCountSql = `SELECT user_live_data.user_id as agentId,lastCallEndTime,CAST(user_role.role AS UNSIGNED) AS role  FROM user_live_data LEFT JOIN user_role ON user_role.user_id = user_live_data.user_id WHERE currentCallStatus = 0 AND popup_status = 1 AND user_live_data.user_id IN (${userIds.join(
        ","
      )}) AND user_role.role IN(2) AND loginStartTime BETWEEN '${Start1}' AND '${End1}'`;
      var [onPopRes] = await rackServer.query(userOnPopupCountSql);
      var userOnavailableCountSql = `SELECT user_live_data.user_id as agentId,CAST(user_role.role AS UNSIGNED) AS role  FROM user_live_data LEFT JOIN user_role ON user_role.user_id = user_live_data.user_id WHERE currentCallStatus = 0 AND popup_status = 0 AND currentBreakName = 'Available' AND user_live_data.user_id IN (${userIds.join(
        ","
      )}) AND user_role.role IN(1,2) AND loginStartTime BETWEEN '${Start1}' AND '${End1}'`;
      var [onAvailableRes] = await rackServer.query(userOnavailableCountSql);
      var onBreakSql = `SELECT user_live_data.user_id as agentId,CAST(user_role.role AS UNSIGNED) AS role  FROM user_live_data LEFT JOIN user_role ON user_role.user_id = user_live_data.user_id WHERE currentCallStatus = 0 AND popup_status = 0 AND currentBreakName NOT IN('Available','Logout','') AND user_live_data.user_id IN (${userIds.join(
        ","
      )}) AND user_role.role IN(1,2) AND loginStartTime BETWEEN '${Start1}' AND '${End1}'`;
      var [onBreakRes] = await rackServer.query(onBreakSql);
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    var startOfDay = `${year}-${month}-${day} 00:00:00`;
    var endOfDay = `${year}-${month}-${day} 23:59:59`;
    const matchCondition = {
      event: "start",
      customerId: mongo_id_user,
      eventTime: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };
 
    if (isSubAdmin == 1) {
      matchCondition.deptId = department_id;
    } else if (isDept == 1) {
      matchCondition.deptId = req.token.id;
    }
    var output = [];
    function calculatePercentage(partialValue, totalValue) {
      return (partialValue / totalValue) * 100;
    }
    var total_calls = Number(incomingRes.length) + Number(outgoingRes.length);

    let userIdsForSessionDuration = result.map(user => user.agentId)
    const [availableDurationData, breakDurationData] = await Promise.all([
      get_total_available_durations(id_user, userIdsForSessionDuration),
      get_total_break_durations(id_user, userIdsForSessionDuration)
    ]);
    
    if (result.length != 0) {
      const promises = result.map(async (agent) => {
        var currentTime = Math.floor(Date.now() / 1000);
        var currentCallAnsTime = Math.floor(
          Date.now(agent.currentCallAnsTime) / 1000
        );
        var currentCallDuration = currentTime - currentCallAnsTime;
        var objSet = {
          agentId: agent.agentId,
          agentName: agent.name,
          breakId: agent.breakId,
          breakName: agent.breakName,
          loginStartTime: agent.loginStartTime,
          upload_image: agent.upload_image,
          break_type: agent.break_type,
        };
        if (agent.break_type == 3) {
          objSet.breakName = objSet.breakName;
        }
        if (agent.popup_status == 1) {
          objSet.breakName = "On Popup";
          var getSql = `SELECT user_id as agentId,lastCallEndTime FROM user_live_data WHERE currentCallStatus = 0 AND popup_status = 1 AND user_live_data.user_id = ${agent.agentId} AND loginStartTime BETWEEN '${Start}' AND '${End}'`;
          var [durationres] = await rackServer.query(getSql);
          console.log(durationres);
          if (durationres.length != 0) {
            objSet.currentOnPopDuration = await get_current_duration(
              durationres[0].lastCallEndTime
            );
          }
        }
        if (agent.currentCallStatus != 0) {
          objSet.breakName = "On Call";
          var getSql = `SELECT user_id as agentId,currentCallStartTime FROM user_live_data WHERE currentCallStatus != 0 AND isHold != 1 AND user_live_data.user_id = ${agent.agentId} AND loginStartTime BETWEEN '${Start}' AND '${End}'`;
          var [durationres] = await rackServer.query(getSql);
          console.log(durationres);
          if (durationres.length != 0) {
            objSet.currentOncallDuration = await get_current_duration(
              durationres[0].currentCallStartTime
            );
            delete objSet.currentOnPopDuration;
          }
        }
        if (agent.isHold == 1) {
          objSet.breakName = "On Hold";
          var getSql = `SELECT user_id as agentId,holded_time FROM user_live_data WHERE isHold = 1 AND user_live_data.user_id = ${agent.agentId} AND loginStartTime BETWEEN '${Start}' AND '${End}'`;
          var [durationres] = await rackServer.query(getSql);
          console.log(durationres);
          if (durationres.length != 0) {
            objSet.currentOnHoldDuration = await get_current_duration(
              durationres[0].holded_time
            );
            delete objSet.currentOnPopDuration;
            delete objSet.currentOncallDuration;
          }
        }
        if (agent.breakName == "Logout") {
          objSet.breakName = agent.breakName;
        }
        if (agent.loginStartTime) {
          var loginStartTime = agent.loginStartTime;
          var date = new Date(loginStartTime);
          if (!isNaN(date.getTime())) {
            var dd = String(date.getDate()).padStart(2, "0");
            var mm = String(date.getMonth() + 1).padStart(2, "0");
            var yyyy = date.getFullYear();
            var loginStartdate = `${yyyy}-${mm}-${dd}`;
            var now = new Date();
            var current_dd = String(now.getDate()).padStart(2, "0");
            var current_mm = String(now.getMonth() + 1).padStart(2, "0");
            var current_yyyy = now.getFullYear();
            var currentDate = `${current_yyyy}-${current_mm}-${current_dd}`;
            if (new Date(loginStartdate) < new Date(currentDate)) {
              objSet.breakName = "Logout";
              delete objSet.loginStartTime;
            }
          } else {
            objSet.breakName = "Logout";
            delete objSet.loginStartTime;
          }
        } else {
          objSet.breakName = "Logout";
          delete objSet.loginStartTime;
        }
        if (agent.break_type == 0) {
          if (agent.breakName != "Available" && agent.breakName != "Logout") {
            objSet.break_type = 1;
          }
        }
        // var rolesql = `SELECT role FROM user_role WHERE user_id = ${agent.agentId}`;
        // var [roleRes] = await rackServer.query(rolesql);
        // const hasRole1 = roleRes.some((item) => item.role.trim() === "1");
        
        if (agent.user_role == 1) {
          objSet.breakName = "Available";
          objSet.role = 1;
          activeCount = activeCount + 1;
          var obj = {
            agentId: agent.agentId,
            role: 1,
          };
          onAvailableRes.push(obj);
        }
        objSet.totalcalls = 0;
        objSet.connectedDuration = 0;
        objSet.answered = 0;
        objSet.incomingCalls = 0;
        objSet.outgoingCalls = 0;
        objSet.connectedCalls = 0;
        objSet.failedCalls = 0;
        objSet.holdDuration = 0;
        if (incomingRes.length != 0) {
          incomingRes.map((incomingCalls) => {
            if (incomingCalls.agents_list !== "") {
              // var agentSplit = incomingCalls.agents_list.split(',')
              if (
                incomingCalls.agents_list == agent.agentId &&
                incomingCalls.callStatus != "ANSWERED"
              ) {
                objSet.totalcalls += incomingCalls.calls;
                objSet.incomingCalls += incomingCalls.calls;
                objSet.notConnected += incomingCalls.calls;
              }
            }
            if (
              incomingCalls.agents_list == agent.agentId &&
              incomingCalls.callStatus == "ANSWERED"
            ) {
              objSet.totalcalls += incomingCalls.calls;
              objSet.incomingCalls += incomingCalls.calls;
              objSet.answered += incomingCalls.calls;
              objSet.connectedCalls += incomingCalls.calls;
              objSet.connectedDuration += incomingCalls.total_duration;
              objSet.holdDuration += incomingCalls.total_hold_time;
            }
          });
        }
        if (outgoingRes.length != 0) {
          outgoingRes.map((outgoing) => {
            if (
              outgoing.user_id == agent.agentId &&
              outgoing.status != "ANSWERED" &&
              outgoing.status != "ANSWER"
            ) {
              objSet.totalcalls += outgoing.calls;
              objSet.outgoingCalls += outgoing.calls;
              objSet.notConnected += outgoing.calls;
            }
            if (
              outgoing.user_id == agent.agentId &&
              (outgoing.status == "ANSWERED" || outgoing.status == "ANSWER") &&
              outgoing.duration != 0
            ) {
              objSet.totalcalls += outgoing.calls;
              objSet.outgoingCalls += outgoing.calls;
              objSet.answered += outgoing.calls;
              objSet.connectedDuration += outgoing.duration;
              objSet.connectedCalls += outgoing.calls;
              objSet.holdDuration += outgoing.total_hold_time;
            }
          });
        }
        objSet.failedCalls = objSet.totalcalls - objSet.connectedCalls;
        objSet.answeredPerc = calculatePercentage(
          objSet.answered,
          objSet.totalcalls
        );
        var ACD = objSet.connectedDuration / objSet.answered;
        ACD = Math.round(ACD);
        objSet.acd = ACD;
        if (isNaN(objSet.answeredPerc)) {
          objSet.answeredPerc = 0;
        }
        if (isNaN(objSet.acd)) {
          objSet.acd = 0;
        }


        // const availableDuration = await get_total_available_duration(
        //   id_user,
        //   agent.agentId
        // );

        // const { currentBreak = 0, break = 0 } = await get_total_break_duration(
        //   id_user,
        //   agent.agentId
        // );

        const breakDuration  = breakDurationData[agent.agentId] || { currentBreak: 0, break: 0 };
        const availableDuration = availableDurationData[agent.agentId] || { available: 0, totalAvailable: 0 };

        
        objSet.availableDuration = Number(availableDuration.available);
        objSet.breakDuration = Number(breakDuration.break);
        objSet.currentBreakDuration = Number(breakDuration.currentBreak);
        var wrkingDuration =
          Number(objSet.breakDuration) + Number(objSet.connectedDuration);
        if (Number(availableDuration.totalAvailable) > Number(wrkingDuration)) {
          objSet.idleDuration =
            Number(availableDuration.totalAvailable) - Number(wrkingDuration);
        } else {
          objSet.idleDuration =
            Number(wrkingDuration) - Number(availableDuration.totalAvailable);
        }
        output.push(objSet);
      });
      await Promise.all(promises);
    }
    var answeredPercentage = 0;
    var totalConnectedCalls = output.reduce(
      (sum, agent) => sum + agent.connectedCalls,
      0
    );
    // var totalFailedCalls = output.reduce((sum, agent) => sum + agent.failedCalls, 0);
    var totalCalls = total_calls;
    var totalFailedCalls = totalCalls - totalConnectedCalls;
    if (totalCalls != 0) {
      answeredPercentage = ((totalConnectedCalls * 100) / totalCalls).toFixed(
        2
      );
    }
    var other_counts = {
      total_login: 0,
      available: [],
      onBreak: [],
      onPopup: [],
      onCall: [],
      onHold: [],
      totalConnectedCalls: totalConnectedCalls,
      totalFailedCalls: totalFailedCalls,
      totalCalls: totalCalls,
      answeredPercentage: answeredPercentage,
    };
    if (userBreaksCount.length != 0) {
      other_counts.total_login = activeCount;
    }
    if (onAvailableRes.length != 0) {
      other_counts.available = onAvailableRes;
    }
    if (onBreakRes.length != 0) {
      other_counts.onBreak = onBreakRes;
    }
    if (onPopRes.length != 0) {
      other_counts.onPopup = onPopRes;
    }
    if (oncallRes.length != 0) {
      other_counts.onCall = oncallRes;
    }
    if (holdRes.length != 0) {
      other_counts.onHold = holdRes;
    }
    //   if(filterBreakType != "all"){
    //   output = output.filter((data)=>data.breakName != "Logout")
    // }
    res.locals.result = output;
    res.locals.other_counts = other_counts;
    res.locals.total_today_Login = total_today_Login;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function get_total_break_durations(id_user, agent_ids) {
  return new Promise(async (resolve, reject) => {
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      const End = `${yyyy}-${mm}-${dd} 23:59:59`;

      const agentIdsIn = agent_ids.join(",");

      const resultMap = {};

      // 1. Get latest startDate, break_type, break_name per agent
      const activitySql = `
        SELECT t.user_id, t.break_type, t.break_name, t.startDate FROM user_activities t
        INNER JOIN (
          SELECT user_id, MAX(startDate) as maxStartDate
          FROM user_activities
          WHERE startDate BETWEEN '${Start}' AND '${End}'
            AND user_id IN (${agentIdsIn})
          GROUP BY user_id
        ) x ON t.user_id = x.user_id AND t.startDate = x.maxStartDate
      `;
      const [activityRes] = await rackServer.query(activitySql);
      const lastActivityMap = {};
      for (const row of activityRes) {
        lastActivityMap[row.user_id] = row;
      }

      // 2. Get break durations from user_sessions (excluding Available)
      const sessionsSql = `
        SELECT user_id, duration, break_name 
        FROM user_sessions 
        WHERE startDate BETWEEN '${Start}' AND '${End}' 
          AND user_id IN (${agentIdsIn})
          AND id_user = '${id_user}'
      `;
      const [sessionRes] = await rackServer.query(sessionsSql);

      const breakSecondsMap = {};
      for (const row of sessionRes) {
        if (row.break_name !== "Available") {
          if (!breakSecondsMap[row.user_id]) breakSecondsMap[row.user_id] = 0;
          const [h, m, s] = row.duration.split(":").map(Number);
          breakSecondsMap[row.user_id] += h * 3600 + m * 60 + s;
        }
      }

      // 3. Build result per agent
      const now = new Date();
      now.setMinutes(now.getMinutes() + 1);
      now.setSeconds(now.getSeconds() + 12);

      for (const agent_id of agent_ids) {
        const obj = {
          currentBreak: 0,
          break: 0,
        };

        obj.break = (breakSecondsMap[agent_id] || 0).toFixed(0);

        const activity = lastActivityMap[agent_id];
        if (activity) {
          const { break_type, break_name, startDate } = activity;
          const start = new Date(startDate);
          let diff = now - start;
          let seconds = (diff / 1000).toFixed(0);

          if (break_type == 3) {
            obj.currentBreak = seconds;
          } else if (break_name !== "Available" && break_name !== "Logout") {
            obj.currentBreak = seconds;
          }
        }

        resultMap[agent_id] = obj;
      }

      resolve(resultMap);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}


async function get_total_available_durations(id_user, agent_ids) {
  return new Promise(async (resolve, reject) => {
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      const End = `${yyyy}-${mm}-${dd} 23:59:59`;

      // Convert ids to comma-separated string for IN clause
      const agentIdsIn = agent_ids.join(",");

      const objMap = {};

      // 1. Get all startDates in one query
      const startDateSql = `
        SELECT user_id, MAX(startDate) as startDate
        FROM user_activities
        WHERE startDate BETWEEN '${Start}' AND '${End}'
          AND user_id IN (${agentIdsIn})
        GROUP BY user_id
      `;
      const [startDateRes] = await rackServer.query(startDateSql);
      const lastStartDates = {};
      for (const row of startDateRes) {
        if (!lastStartDates[row.user_id]) {
          lastStartDates[row.user_id] = row.startDate; // Take first occurrence due to DESC order
        }
      }

      // 2. Get all Available durations
      const availableSql = `
        SELECT user_id, duration 
        FROM user_sessions 
        WHERE break_name = "Available" 
          AND startDate BETWEEN '${Start}' AND '${End}' 
          AND user_id IN (${agentIdsIn})
          AND id_user = '${id_user}'
      `;
      const [availableRes] = await rackServer.query(availableSql);

      const availableMap = {};
      for (const row of availableRes) {
        if (!availableMap[row.user_id]) availableMap[row.user_id] = 0;
        const [h, m, s] = row.duration.split(":").map(Number);
        availableMap[row.user_id] += h * 3600 + m * 60 + s;
      }

      // 3. Get user_live_data in one query
      const liveDataSql = `
        SELECT user_id, last_activity_time, lastCallEndTime, loginStartTime 
        FROM user_live_data 
        WHERE user_id IN (${agentIdsIn})
          AND (last_activity_time BETWEEN '${Start}' AND '${End}' 
               OR loginStartTime BETWEEN '${Start}' AND '${End}')
      `;
      const [liveDataRes] = await rackServer.query(liveDataSql);
      const liveDataMap = {};
      for (const row of liveDataRes) {
        liveDataMap[row.user_id] = row;
      }

      // 4. Build the result map
      for (const agent_id of agent_ids) {
        const obj = {
          available: 0,
          totalAvailable: 0,
        };

        const now = new Date();
        now.setMinutes(now.getMinutes() + 1);
        now.setSeconds(now.getSeconds() + 12);

        // Total Available
        const totalBreakSeconds = availableMap[agent_id] || 0;
        if (lastStartDates[agent_id]) {
          const startDate = new Date(lastStartDates[agent_id]);
          const diff = now - startDate;
          const lastLoginSeconds = diff / 1000;

          obj.totalAvailable = (totalBreakSeconds + lastLoginSeconds).toFixed(0);
        }

        // Available
        if (liveDataMap[agent_id]) {
          const { last_activity_time, lastCallEndTime, loginStartTime } = liveDataMap[agent_id];

          const times = [new Date(last_activity_time), new Date(lastCallEndTime), new Date(loginStartTime)];
          const latestTime = times.reduce((a, b) => (a > b ? a : b));

          const diff = now - latestTime;
          obj.available = (diff / 1000).toFixed(0);
        }

        objMap[agent_id] = obj;
      }

      resolve(objMap);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
// async function dashboard_agent_activity(req, res, next) {
//     try {
//         var isAdmin = req.token.isAdmin;
//         var isSubAdmin = req.token.isSubAdmin;
//         var isDept = req.token.isDept;
//         var id_department = req.token.id_department;
//         var id_user = req.token.id_user;
//         var mongo_id_user = id_user.toString()
//         var worktime = req.query.worktime;
//         var department_id = req.query.department_id
//         var date = new Date();
//         var dd = date.getDate();
//         var mm = date.getMonth() + 1
//         var yyyy = date.getFullYear();
//         var hours = date.getHours();
//         var minutes = date.getMinutes();
//         var seconds = date.getSeconds();
//         var time = hours + ":" + minutes + ":" + seconds;
//         var today = `${yyyy}-${mm}-${dd}`;
//         var presentTime = `${yyyy}-${mm}-${dd} ${time}`;
//         var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
//         var End = `${yyyy}-${mm}-${dd} 23:59:59`;
//         var Start1 = `${yyyy}-${mm}-${dd} 00:00:00`;
//         var End1 = `${yyyy}-${mm}-${dd} 23:59:59`;
//         var currentDate = `${yyyy}-${mm}-${dd}`
//         const dashboardUserData = await dashboardUserViewModel.findOne({ userId: req.token.id }).lean()
//         const call_type = dashboardUserData.callType
//         if (worktime != undefined) {
//             worktime = worktime.split('-');
//             var splitStart = Start.split(' ');
//             var splitEnd = End.split(' ');
//             Start = `${splitStart[0]} ${worktime[0]}:00`;
//             End = `${splitEnd[0]} ${worktime[1]}:00`;
//         }
//         var sql = `SELECT user.id as agentId, user.id_user, CONCAT(user.first_name, ' ', user.last_name) AS name,user_settings.regNumber as agentRegNumber, user_live_data.currentBreakId as breakId, user_live_data.popup_status, user_live_data.isHold, user_live_data.currentBreakName as breakName, user_live_data.currentBreakStartDate as sessionStartDate, user_live_data.currentCallStatus,breaks.break_type,user_live_data.loginStartTime , user.upload_image FROM user LEFT JOIN user_live_data ON user.id = user_live_data.user_id LEFT JOIN user_settings ON user.id = user_settings.user_id LEFT JOIN breaks ON breaks.id = user_live_data.currentBreakId where 1 `;
//         if (isAdmin == 1) {
//             sql += `AND user.id_user='${id_user}' `;
//         } else if (isSubAdmin == 1) {
//             if (department_id != undefined) {
//                 sql += `AND user.id_user='${id_user}' `;
//             } else {
//                 sql += `AND user.id_department in (${id_department}) AND user.id_user = ${id_user} `;
//             }
//         } else if (isDept == 1) {
//             sql += `AND user.id_department='${req.token.id}' AND user.id_user = ${id_user} `;
//         }
//         if (department_id != undefined) {
//             sql += `AND user.id_department='${department_id}' `;
//         }
//         sql += `GROUP BY user.id ORDER BY INSTR(breakName, 'Available') DESC `;
//         var [result] = await rackServer.query(sql);
//         var incoming = `SELECT user_id as agents_list,total_hold_time ,user_status as callStatus,call_start_time as callStartTime, 1 as calls,call_status,user_id as answeredAgent,connected_duration as total_duration FROM incoming_reports WHERE call_start_time BETWEEN '${Start}' AND '${End}' `;
//         if (isAdmin == 1) {
//             incoming += `AND incoming_reports.id_user='${id_user}' `;
//         } else if (isSubAdmin == 1) {
//             if (department_id != undefined) {
//                 incoming += `AND incoming_reports.id_user='${id_user}' `;
//             }
//             else {
//                 incoming += `AND incoming_reports.id_department in (${id_department}) and id_user = ${id_user} `;
//             }
//         } else if (isDept == 1) {
//             incoming += `AND incoming_reports.id_department='${req.token.id}' and id_user = ${id_user} `;
//         }
//         if (department_id != undefined) {
//             incoming += `AND incoming_reports.id_department='${department_id}' `;
//         }
//         incoming += `ORDER BY call_start_time asc`;
//         var [incomingRes] = await rackServer.query(incoming);
//         console.log("incomingRes -------------", incomingRes.length)
//         var outgoing = `SELECT user_id,total_hold_time ,date,duration,status,1 as calls FROM cc_outgoing_reports WHERE date BETWEEN '${Start}' AND '${End}' `;
//         if (isAdmin == 1) {
//             outgoing += `AND cc_outgoing_reports.id_user='${id_user}' `;
//         } else if (isSubAdmin == 1) {
//             if (department_id != undefined) {
//                 outgoing += `AND cc_outgoing_reports.id_user='${id_user}' `;
//             }
//             else {
//                 outgoing += `AND cc_outgoing_reports.id_department in (${id_department}) and id_user = ${id_user} `;
//             }
//         } else if (isDept == 1) {
//             outgoing += `AND cc_outgoing_reports.id_department='${req.token.id}' and id_user = ${id_user} `;
//         }
//         if (department_id != undefined) {
//             outgoing += `AND cc_outgoing_reports.id_department='${department_id}' `;
//         }
//         outgoing += ` ORDER BY date asc`;
//         var [outgoingRes] = await rackServer.query(outgoing);

//         console.log("outgoingRes -------------", outgoingRes.length)
//         var userIdsSql = `select user.id from user join user_settings on user_settings.user_id = user.id where is_agent = 1 and id_user = ${id_user} `;
//         if (isSubAdmin == 1) {
//             userIdsSql += `AND id_department in (${id_department})`;
//         } else if (isDept == 1) {
//             userIdsSql += `AND id_department='${req.token.id}' `;
//         }
//         if (department_id != undefined) {
//             userIdsSql += `AND id_department='${department_id}' `;
//         }
//         var [userIds] = await rackServer.query(userIdsSql);
//         console.log(userIds.length)
//         var totalLoginSql = `SELECT Count(user_id) as total FROM user_live_data LEFT JOIN user ON user.id = user_live_data.user_id WHERE loginStartTime BETWEEN '${Start1}' AND '${End1}' and id_user = ${id_user} `
//         if (isSubAdmin == 1) {
//             totalLoginSql += `AND id_department in (${id_department})`;
//         } else if (isDept == 1) {
//             totalLoginSql += `AND id_department='${req.token.id}' `;
//         }
//         if (department_id != undefined) {
//             totalLoginSql += `AND id_department='${department_id}' `;
//         }
//         var [totalLoginRes] = await rackServer.query(totalLoginSql);
//         var total_today_Login = totalLoginRes[0].total
//         if (userIds.length != 0) {
//             userIds = userIds.map(data => data.id)
//             // var userBreaks = `SELECT COUNT(CASE WHEN currentBreakName NOT IN('Logout','')  THEN 1 END) AS activeCount,COUNT(CASE WHEN currentBreakName = 'Available' and (currentCallStatus = 0 OR popup_status != 1) THEN 1 END) AS availableCount,COUNT(CASE WHEN currentCallStatus != 0  THEN 1 END) AS oncallCount,COUNT(CASE WHEN isHold = 1 THEN 1 END) AS onholdcount, COUNT(CASE WHEN currentBreakName NOT IN('Available','Logout','') and popup_status = 0 THEN 1 END) AS breakCount,COUNT(CASE WHEN popup_status = 1 and currentBreakName NOT IN('Available','Logout','') and currentCallStatus = 0 THEN 1 END) AS popupCount FROM user_live_data WHERE user_live_data.user_id IN (${userIds.join(',')}) AND loginStartTime BETWEEN '${Start}' AND '${End}' `;
//             // var [userBreaksCount] = await rackServer.query(userBreaks);
//             var userBreaks = `SELECT COUNT(CASE WHEN currentBreakName NOT IN('Logout','')  THEN 1 END) AS activeCount FROM user_live_data WHERE user_live_data.user_id IN (${userIds.join(',')}) AND loginStartTime BETWEEN '${Start1}' AND '${End1}' `;
//             var [userBreaksCount] = await rackServer.query(userBreaks);
//             var activeCount = userBreaksCount[0].activeCount
//             var userHoldCountSql = `SELECT user_live_data.user_id as agentId,CAST(user_role.role AS UNSIGNED) AS role  FROM user_live_data LEFT JOIN user_role ON user_role.user_id = user_live_data.user_id WHERE isHold = 1 AND user_live_data.user_id IN (${userIds.join(',')}) AND user_role.role IN(2) AND loginStartTime BETWEEN '${Start1}' AND '${End1}'`;
//             var [holdRes] = await rackServer.query(userHoldCountSql);
//             var userOncallCountSql = `SELECT user_live_data.user_id as agentId,currentCallStartTime,CAST(user_role.role AS UNSIGNED) AS role  FROM user_live_data LEFT JOIN user_role ON user_role.user_id = user_live_data.user_id WHERE currentCallStatus != 0 AND isHold != 1 AND user_live_data.user_id IN (${userIds.join(',')}) AND user_role.role IN(1,2) AND loginStartTime BETWEEN '${Start1}' AND '${End1}'`;
//             var [oncallRes] = await rackServer.query(userOncallCountSql);
//             var userOnPopupCountSql = `SELECT user_live_data.user_id as agentId,lastCallEndTime,CAST(user_role.role AS UNSIGNED) AS role  FROM user_live_data LEFT JOIN user_role ON user_role.user_id = user_live_data.user_id WHERE currentCallStatus = 0 AND popup_status = 1 AND user_live_data.user_id IN (${userIds.join(',')}) AND user_role.role IN(2) AND loginStartTime BETWEEN '${Start1}' AND '${End1}'`;
//             var [onPopRes] = await rackServer.query(userOnPopupCountSql);
//             var userOnavailableCountSql = `SELECT user_live_data.user_id as agentId,CAST(user_role.role AS UNSIGNED) AS role  FROM user_live_data LEFT JOIN user_role ON user_role.user_id = user_live_data.user_id WHERE currentCallStatus = 0 AND popup_status = 0 AND currentBreakName = 'Available' AND user_live_data.user_id IN (${userIds.join(',')}) AND user_role.role IN(1,2) AND loginStartTime BETWEEN '${Start1}' AND '${End1}'`;
//             var [onAvailableRes] = await rackServer.query(userOnavailableCountSql);
//             var onBreakSql = `SELECT user_live_data.user_id as agentId,CAST(user_role.role AS UNSIGNED) AS role  FROM user_live_data LEFT JOIN user_role ON user_role.user_id = user_live_data.user_id WHERE currentCallStatus = 0 AND popup_status = 0 AND currentBreakName NOT IN('Available','Logout','') AND user_live_data.user_id IN (${userIds.join(',')}) AND user_role.role IN(1,2) AND loginStartTime BETWEEN '${Start1}' AND '${End1}'`
//             var [onBreakRes] = await rackServer.query(onBreakSql);
//         }
//         const now = new Date();
//         const year = now.getFullYear();
//         const month = String(now.getMonth() + 1).padStart(2, '0');
//         const day = String(now.getDate()).padStart(2, '0');
//         var startOfDay = `${year}-${month}-${day} 00:00:00`;
//         var endOfDay = `${year}-${month}-${day} 23:59:59`;
//         const matchCondition = {
//             event: "start",
//             customerId: mongo_id_user,
//             eventTime: {
//                 $gte: startOfDay,
//                 $lte: endOfDay
//             },
//         };

//         if (isSubAdmin == 1) {
//             matchCondition.deptId = department_id
//         } else if (isDept == 1) {
//             matchCondition.deptId = req.token.id
//         }
//         var output = [];
//         function calculatePercentage(partialValue, totalValue) {
//             return (partialValue / totalValue) * 100;
//         }
//         if(call_type == 1){
//               var total_calls = Number(incomingRes.length)
//         }else if(call_type == 2){
//               var total_calls = Number(outgoingRes.length);
//         }else{
//               var total_calls = Number(incomingRes.length) + Number(outgoingRes.length);
//         }

//         if (result.length != 0) {
//             const promises = result.map(async agent => {
//                 var currentTime = Math.floor(Date.now() / 1000);
//                 var currentCallAnsTime = Math.floor(Date.now(agent.currentCallAnsTime) / 1000)
//                 var currentCallDuration = currentTime - currentCallAnsTime;
//                 var objSet = {
//                     agentId: agent.agentId,
//                     agentName: agent.name,
//                     breakId: agent.breakId,
//                     breakName: agent.breakName,
//                     loginStartTime: agent.loginStartTime,
//                     upload_image: agent.upload_image,
//                     break_type: agent.break_type
//                 }
//                 if (agent.break_type == 3) {
//                     objSet.breakName = objSet.breakName
//                 }
//                 if (agent.popup_status == 1) {
//                     objSet.breakName = 'On Popup'
//                     var getSql = `SELECT user_id as agentId,lastCallEndTime FROM user_live_data WHERE currentCallStatus = 0 AND popup_status = 1 AND user_live_data.user_id = ${agent.agentId} AND loginStartTime BETWEEN '${Start}' AND '${End}'`;
//                     var [durationres] = await rackServer.query(getSql);
//                     console.log(durationres)
//                     if (durationres.length != 0) {
//                         objSet.currentOnPopDuration = await get_current_duration(durationres[0].lastCallEndTime)
//                     }
//                 }
//                 if (agent.currentCallStatus != 0) {
//                     objSet.breakName = 'On Call'
//                     var getSql = `SELECT user_id as agentId,currentCallStartTime FROM user_live_data WHERE currentCallStatus != 0 AND isHold != 1 AND user_live_data.user_id = ${agent.agentId} AND loginStartTime BETWEEN '${Start}' AND '${End}'`;
//                     var [durationres] = await rackServer.query(getSql);
//                     console.log(durationres)
//                     if (durationres.length != 0) {
//                         objSet.currentOncallDuration = await get_current_duration(durationres[0].currentCallStartTime)
//                         delete objSet.currentOnPopDuration
//                     }
//                 }
//                 if (agent.isHold == 1) {
//                     objSet.breakName = 'On Hold'
//                     var getSql = `SELECT user_id as agentId,holded_time FROM user_live_data WHERE isHold = 1 AND user_live_data.user_id = ${agent.agentId} AND loginStartTime BETWEEN '${Start}' AND '${End}'`;
//                     var [durationres] = await rackServer.query(getSql);
//                     console.log(durationres)
//                     if (durationres.length != 0) {
//                         objSet.currentOnHoldDuration = await get_current_duration(durationres[0].holded_time)
//                         delete objSet.currentOnPopDuration
//                         delete objSet.currentOncallDuration
//                     }
//                 }
//                 if(agent.breakName == 'Logout'){
//                      objSet.breakName = agent.breakName
//                 }
//                 if (agent.loginStartTime) {
//                     var loginStartTime = agent.loginStartTime;
//                     var date = new Date(loginStartTime);
//                     if (!isNaN(date.getTime())) {
//                         var dd = String(date.getDate()).padStart(2, '0');
//                         var mm = String(date.getMonth() + 1).padStart(2, '0');
//                         var yyyy = date.getFullYear();
//                         var loginStartdate = `${yyyy}-${mm}-${dd}`;
//                         var now = new Date();
//                         var current_dd = String(now.getDate()).padStart(2, '0');
//                         var current_mm = String(now.getMonth() + 1).padStart(2, '0');
//                         var current_yyyy = now.getFullYear();
//                         var currentDate = `${current_yyyy}-${current_mm}-${current_dd}`;
//                         if (new Date(loginStartdate) < new Date(currentDate)) {
//                             objSet.breakName = 'Logout'
//                             delete objSet.loginStartTime
//                         }
//                     } else {
//                         objSet.breakName = 'Logout'
//                         delete objSet.loginStartTime
//                     }
//                 } else {
//                     objSet.breakName = 'Logout'
//                     delete objSet.loginStartTime
//                 }
//                 if (agent.break_type == 0) {
//                     if (agent.breakName != 'Available' && agent.breakName != 'Logout') {
//                         objSet.break_type = 1
//                     }
//                 }
//                 var rolesql = `SELECT role FROM user_role WHERE user_id = ${agent.agentId}`;
//                 var [roleRes] = await rackServer.query(rolesql);
//                 const hasRole1 = roleRes.some(item => item.role.trim() === '1');
//                 if (hasRole1) {
//                     objSet.breakName = 'Available'
//                     objSet.role = 1
//                     activeCount = activeCount + 1
//                     var obj = {
//                         agentId : agent.agentId,
//                         role : 1
//                     }
//                     onAvailableRes.push(obj)
//                 }
//                 objSet.totalcalls = 0
//                 objSet.connectedDuration = 0;
//                 objSet.answered = 0;
//                 objSet.incomingCalls = 0;
//                 objSet.outgoingCalls = 0;
//                 objSet.connectedCalls = 0
//                 objSet.failedCalls = 0
//                 objSet.holdDuration = 0

//                  let connectedDurationIncoming = 0
//                  let answeredIncoming = 0
//                  let totalcallsIncoming = 0
//                  let holdDurationIncoming = 0

//                  let connectedDurationOutgoing = 0
//                  let answeredOutgoing = 0
//                  let totalcallsOutgoing = 0
//                  let holdDurationOutgoing = 0

//                 if (incomingRes.length != 0) {
//                     incomingRes.map(incomingCalls => {
//                         if (incomingCalls.agents_list !== '') {
//                             // var agentSplit = incomingCalls.agents_list.split(',')
//                             if (incomingCalls.agents_list == agent.agentId && incomingCalls.callStatus != 'ANSWERED') {
//                                 objSet.totalcalls += incomingCalls.calls
//                                 objSet.incomingCalls += incomingCalls.calls
//                                 objSet.notConnected += incomingCalls.calls

//                                 objSet.totalcallsIncoming += outgoing.calls
//                             }
//                         }
//                         if (incomingCalls.agents_list == agent.agentId && incomingCalls.callStatus == 'ANSWERED') {
//                             objSet.totalcalls += incomingCalls.calls
//                             objSet.incomingCalls += incomingCalls.calls
//                             objSet.answered += incomingCalls.calls
//                             objSet.connectedCalls += incomingCalls.calls
//                             objSet.connectedDuration += incomingCalls.total_duration
//                             objSet.holdDuration += incomingCalls.total_hold_time

//                             connectedDurationIncoming += incomingCalls.total_duration
//                             answeredIncoming += incomingCalls.calls
//                             totalcallsIncoming += incomingCalls.calls
//                             holdDurationIncoming += incomingCalls.total_hold_time
//                         }
//                     })
//                 }
//                 if (outgoingRes.length != 0) {
//                     outgoingRes.map(outgoing => {
//                         if (outgoing.user_id == agent.agentId && (outgoing.status != 'ANSWERED' && outgoing.status != 'ANSWER')) {
//                             objSet.totalcalls += outgoing.calls
//                             objSet.outgoingCalls += outgoing.calls
//                             objSet.notConnected += outgoing.calls

//                             objSet.totalcallsOutgoing += outgoing.calls
//                         }
//                         if (outgoing.user_id == agent.agentId && (outgoing.status == 'ANSWERED' || outgoing.status == 'ANSWER') && outgoing.duration != 0) {
//                             objSet.totalcalls += outgoing.calls
//                             objSet.outgoingCalls += outgoing.calls
//                             objSet.answered += outgoing.calls
//                             objSet.connectedDuration += outgoing.duration
//                             objSet.connectedCalls += outgoing.calls
//                             objSet.holdDuration += outgoing.total_hold_time

//                             connectedDurationOutgoing += outgoing.duration
//                             answeredOutgoing += outgoing.calls
//                             totalcallsOutgoing += outgoing.calls
//                             holdDurationOutgoing += outgoing.total_hold_time
//                         }
//                     })
//                 }

//                   if (call_type == 1) {
//                   var ACD = connectedDurationIncoming / answeredIncoming;
//                   objSet.connectedDuration = connectedDurationIncoming
//                   objSet.answered = answeredIncoming
//                   objSet.connectedCalls = answeredIncoming
//                   objSet.totalcalls = totalcallsIncoming
//                   objSet.holdDuration = holdDurationIncoming
//                 }
//                 else if (call_type == 2) {
//                   var ACD = connectedDurationOutgoing / answeredOutgoing;
//                   objSet.connectedDuration = connectedDurationOutgoing
//                   objSet.answered = answeredOutgoing
//                   objSet.connectedCalls = answeredOutgoing
//                   objSet.totalcalls = totalcallsOutgoing
//                   objSet.holdDuration = holdDurationOutgoing
//                 } else {
//                   var ACD = objSet.connectedDuration / objSet.answered;
//                 }

//                 objSet.failedCalls = objSet.totalcalls - objSet.connectedCalls
//                 objSet.answeredPerc = calculatePercentage(objSet.answered, objSet.totalcalls);

//                 var ACD = objSet.connectedDuration / objSet.answered;
//                 ACD = Math.round(ACD);
//                 objSet.acd = ACD
//                 if (isNaN(objSet.answeredPerc)) {
//                     objSet.answeredPerc = 0
//                 }
//                 if (isNaN(objSet.acd)) {
//                     objSet.acd = 0
//                 }
//                 var availableDuration = await get_total_available_duration(id_user, agent.agentId)
//                 var breakDuration = await get_total_break_duration(id_user, agent.agentId)
//                 objSet.availableDuration = Number(availableDuration.available);
//                 objSet.breakDuration = Number(breakDuration.break);
//                 objSet.currentBreakDuration = Number(breakDuration.currentBreak);
//                 var wrkingDuration = Number(objSet.breakDuration) + Number(objSet.connectedDuration)
//                 if (Number(availableDuration.totalAvailable) > (Number(wrkingDuration))) {
//                     objSet.idleDuration = Number(availableDuration.totalAvailable) - Number(wrkingDuration)
//                 } else {
//                     objSet.idleDuration = Number(wrkingDuration) - Number(availableDuration.totalAvailable)
//                 }
//                 output.push(objSet);
//             })
//             await Promise.all(promises);
//         }
//         var answeredPercentage = 0
//         var totalConnectedCalls = output.reduce((sum, agent) => sum + agent.connectedCalls, 0);
//         // var totalFailedCalls = output.reduce((sum, agent) => sum + agent.failedCalls, 0);
//         var totalCalls = total_calls
//         var totalFailedCalls = totalCalls - totalConnectedCalls
//         if (totalCalls != 0) {
//             answeredPercentage = ((totalConnectedCalls * 100) / totalCalls).toFixed(2);
//         }
//         var other_counts = {
//             "total_login": 0,
//             "available": [],
//             "onBreak": [],
//             "onPopup": [],
//             "onCall": [],
//             "onHold": [],
//             "totalConnectedCalls": totalConnectedCalls,
//             "totalFailedCalls": totalFailedCalls,
//             "totalCalls": totalCalls,
//             "answeredPercentage": answeredPercentage
//         }
//         if (userBreaksCount.length != 0) {
//             other_counts.total_login = activeCount
//         }
//         if (onAvailableRes.length != 0) {
//             other_counts.available = onAvailableRes
//         }
//         if (onBreakRes.length != 0) {
//             other_counts.onBreak = onBreakRes
//         }
//         if (onPopRes.length != 0) {
//             other_counts.onPopup = onPopRes
//         }
//         if (oncallRes.length != 0) {
//             other_counts.onCall = oncallRes
//         }
//         if (holdRes.length != 0) {
//             other_counts.onHold = holdRes
//         }
//         res.locals.result = output;
//         res.locals.other_counts = other_counts
//         res.locals.total_today_Login = total_today_Login
//         next()
//     } catch (err) {
//         console.log(err);
//         res.locals.result = "err";
//         next()
//     }
// }
async function get_total_available_duration(id_user, id_agent) {
  return new Promise(async (resolve, reject) => {
    try {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
      var obj = {
        available: 0,
        totalAvailable: 0,
      };
      var startDate = `SELECT startDate FROM user_activities WHERE startDate BETWEEN '${Start}' AND '${End}' and user_id = '${id_agent}' ORDER BY id DESC LIMIT 1`;
      var [startDateRes] = await rackServer.query(startDate);
      var sql = `SELECT duration,break_name FROM user_sessions WHERE break_name = "Available" AND startDate BETWEEN '${Start}' AND '${End}' and user_id = '${id_agent}' and id_user = '${id_user}' `;
      var [result] = await rackServer.query(sql);
      if (result.length != 0) {
        var timeDataSeconds = result.map((objt) => {
          var hours = parseInt(objt.duration.split(":")[0]);
          var minutes = parseInt(objt.duration.split(":")[1]);
          var seconds = parseInt(objt.duration.split(":")[2]);
          return hours * 3600 + minutes * 60 + seconds;
        });
        var calculatedSeconds = timeDataSeconds.reduce(
          (acc, val) => acc + val,
          0
        );
        if (startDateRes.length != 0) {
          var date1 = new Date(startDateRes[0].startDate);
          var date2 = new Date();
          date2.setMinutes(date2.getMinutes() + 1);
          date2.setSeconds(date2.getSeconds() + 12);
          if (date2 < date1) {
            date2 = date1;
          }
          var diff = date2 - date1;
          var lastLoginseconds = diff / 1000;
          var totalSeconds = calculatedSeconds + lastLoginseconds;
          totalSeconds = totalSeconds.toFixed(0);
          lastLoginseconds = lastLoginseconds.toFixed(0);
          obj.totalAvailable = totalSeconds;
        } else {
          obj.totalAvailable = 0;
        }
      } else {
        if (startDateRes.length != 0) {
          var date1 = new Date(startDateRes[0].startDate);
          var date2 = new Date();
          date2.setMinutes(date2.getMinutes() + 1);
          date2.setSeconds(date2.getSeconds() + 12);
          if (date2 < date1) {
            date2 = date1;
          }
          var diff = date2 - date1;
          var seconds = diff / 1000;
          var sec = seconds.toFixed(0);
          obj.totalAvailable = sec;
        } else {
          obj.totalAvailable = 0;
        }
        // obj.break = 0
      }
      var getSql = `SELECT last_activity_time,lastCallEndTime,loginStartTime FROM user_live_data WHERE user_live_data.user_id = ${id_agent} AND last_activity_time BETWEEN '${Start}' AND '${End}'`;
      var [durationres] = await rackServer.query(getSql);
      if (durationres.length != 0) {
        const { last_activity_time, lastCallEndTime, loginStartTime } =
          durationres[0];

        const activityTime = new Date(last_activity_time);
        const callEndTime = new Date(lastCallEndTime);
        const loginTime = new Date(loginStartTime);

        let latestTime = activityTime;
        let latestLabel = "last_activity_time";

        if (callEndTime > latestTime) {
          latestTime = callEndTime;
          latestLabel = "lastCallEndTime";
        }

        if (loginTime > latestTime) {
          latestTime = loginTime;
          latestLabel = "loginStartTime";
        }
        var date1 = new Date(latestTime);
        var date2 = new Date();
        date2.setMinutes(date2.getMinutes() + 1);
        date2.setSeconds(date2.getSeconds() + 12);
        var diff = date2 - date1;
        var lastLoginseconds = diff / 1000;
        var currentTime = lastLoginseconds.toFixed(0);
        obj.available = Number(currentTime);
      } else {
        var getLoginSql = `SELECT loginStartTime,lastCallEndTime FROM user_live_data WHERE user_live_data.user_id = ${id_agent} AND loginStartTime BETWEEN '${Start}' AND '${End}'`;
        var [loginDurationres] = await rackServer.query(getLoginSql);
        if (loginDurationres.length != 0) {
          const lastActivity = new Date(loginDurationres[0].loginStartTime);
          const lastCallEnd = new Date(loginDurationres[0].lastCallEndTime);
          if (lastActivity > lastCallEnd) {
            var activity_time = lastActivity;
            console.log("last_activity_time is greater");
          } else {
            var activity_time = lastCallEnd;
            console.log("lastCallEndTime is greater");
          }
          var date1 = new Date(activity_time);
          var date2 = new Date();
          date2.setMinutes(date2.getMinutes() + 1);
          date2.setSeconds(date2.getSeconds() + 12);
          var diff = date2 - date1;
          var lastLoginseconds = diff / 1000;
          var currentTime = lastLoginseconds.toFixed(0);
          obj.available = Number(currentTime);
        }
      }
      console.log(obj);
      resolve(obj);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
async function get_total_break_duration(id_user, id_agent) {
  return new Promise(async (resolve, reject) => {
    try {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
      var startDate = `SELECT startDate,break_type,break_name FROM user_activities WHERE startDate BETWEEN '${Start}' AND '${End}' and user_id = '${id_agent}' ORDER BY id DESC LIMIT 1`;
      var [startDateRes] = await rackServer.query(startDate);
      var sql = `SELECT duration,break_name FROM user_sessions WHERE startDate BETWEEN '${Start}' AND '${End}' and user_id = '${id_agent}' and id_user = '${id_user}' `;
      var [result] = await rackServer.query(sql);
      var obj = {
        currentBreak: 0,
        break: 0,
      };
      if (result.length != 0) {
        var breakSeconds = result.map((objt) => {
          if (objt.break_name != "Available") {
            var hours = parseInt(objt.duration.split(":")[0]);
            var minutes = parseInt(objt.duration.split(":")[1]);
            var seconds = parseInt(objt.duration.split(":")[2]);
            return hours * 3600 + minutes * 60 + seconds;
          }
          return 0;
        });
        var totalBreakSeconds = breakSeconds.reduce((acc, val) => acc + val, 0);
        totalBreakSeconds = totalBreakSeconds.toFixed(0);
        obj.break = totalBreakSeconds;
        if (startDateRes.length != 0) {
          if (startDateRes[0].break_type == 3) {
            var date1 = new Date(startDateRes[0].startDate);
            var date2 = new Date();
            date2.setMinutes(date2.getMinutes() + 1);
            date2.setSeconds(date2.getSeconds() + 12);
            if (date2 < date1) {
              date2 = date1;
            }
            var diff = date2 - date1;
            var lastLoginseconds = diff / 1000;
            lastLoginseconds = lastLoginseconds.toFixed(0);
            obj.currentBreak = lastLoginseconds;
          } else if (
            startDateRes[0].break_name != "Available" &&
            startDateRes[0].break_name != "Logout"
          ) {
            var date1 = new Date(startDateRes[0].startDate);
            var date2 = new Date();
            date2.setMinutes(date2.getMinutes() + 1);
            date2.setSeconds(date2.getSeconds() + 12);
            if (date2 < date1) {
              date2 = date1;
            }
            var diff = date2 - date1;
            var lastLoginseconds = diff / 1000;
            lastLoginseconds = lastLoginseconds.toFixed(0);
            obj.currentBreak = lastLoginseconds;
          }
        } else {
          obj.currentBreak = 0;
        }
      } else {
        if (startDateRes.length != 0) {
          if (startDateRes[0].break_type == 3) {
            var date1 = new Date(startDateRes[0].startDate);
            var date2 = new Date();
            date2.setMinutes(date2.getMinutes() + 1);
            date2.setSeconds(date2.getSeconds() + 12);
            if (date2 < date1) {
              date2 = date1;
            }
            var diff = date2 - date1;
            var seconds = diff / 1000;
            var sec = seconds.toFixed(0);
            obj.currentBreak = sec;
          } else if (
            startDateRes[0].break_name != "Available" &&
            startDateRes[0].break_name != "Logout"
          ) {
            var date1 = new Date(startDateRes[0].startDate);
            var date2 = new Date();
            date2.setMinutes(date2.getMinutes() + 1);
            date2.setSeconds(date2.getSeconds() + 12);
            if (date2 < date1) {
              date2 = date1;
            }
            var diff = date2 - date1;
            var lastLoginseconds = diff / 1000;
            lastLoginseconds = lastLoginseconds.toFixed(0);
            obj.currentBreak = lastLoginseconds;
          }
        } else {
          obj.currentBreak = 0;
        }
        obj.break = 0;
      }
      resolve(obj);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
async function get_current_duration(time) {
  return new Promise(async (resolve, reject) => {
    try {
      var date1 = new Date(time);
      var date2 = new Date();
      date2.setMinutes(date2.getMinutes() + 1);
      date2.setSeconds(date2.getSeconds() + 12);
      var diff = date2 - date1;
      var lastLoginseconds = diff / 1000;
      var currentTime = lastLoginseconds.toFixed(0);
      currentTime = Number(currentTime);
      console.log(currentTime);
      resolve(currentTime);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
async function dashboard_call_count(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin;
    var date = req.query.date;

    const { department_id: department = "", worktime } = req.query;

    var fromdatetime = new Date();
    var todatetime = new Date();
    if (date != undefined) {
      if (date == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      // if (date == "lastweek") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 7)
      // }
      // if (date == "lastmonth") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 31)
      // }
      if (date == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (date == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      // var currentdate = fromdatetime.getDate();
      // var currentMnth = fromdatetime.getMonth() + 1;
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var today = new Date();
      var dd = today.getDate().toString().padStart(2, "0");
      var mm = (today.getMonth() + 1).toString().padStart(2, "0");
      var yyyy = today.getFullYear();
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
      const currentDate = new Date();
      var current_dd = currentDate.getDate().toString().padStart(2, "0");
      var current_mm = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      var current_yyyy = currentDate.getFullYear();
      var current_hours = currentDate.getHours();
      var current_min = currentDate.getMinutes();
      var current_sec = currentDate.getSeconds();
      const fifteenMinutesAgo = new Date(
        currentDate.getTime() - 30 * 60 * 1000
      );
      var hours = fifteenMinutesAgo.getHours();
      var min = fifteenMinutesAgo.getMinutes();
      var sec = fifteenMinutesAgo.getSeconds();
      var fifteenStart = `${current_yyyy}-${current_mm}-${current_dd} ${hours}:${min}:${sec}`;
      var fifteenEnd = `${current_yyyy}-${current_mm}-${current_dd} ${current_hours}:${current_min}:${current_sec}`;
      console.log("fifteenStart :", fifteenStart);
      console.log("fifteenEnd :", fifteenEnd);
    }

    if (worktime) {
      const { start = Start, end = End } = getWorkingTImeBasedStartAndEnd(
        worktime,
        req.query.date ?? "today"
      );
      Start = start;
      End = end;
    }

    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    if (req.token.did != undefined) {
      var didNumber = req.token.did;
    } else if (req.token.didString != undefined) {
      var didNumber = req.token.didString;
    } else {
      var didNumber = req.query.didnumber;
    }
    var id_department = req.token.id_department;

    const isDepartmentSearch =
      department &&
      (isAdmin ||
        (isSubAdmin &&
          req.token.id_department.split(",").includes(department)));

    let searchInDepartment;
    if (isDepartmentSearch) {
      searchInDepartment = `${department}`;
    } else if (isAdmin) {
      searchInDepartment = undefined;
    } else if (isDept) {
      searchInDepartment = `${req.token.id}`;
    } else if (isSubAdmin) {
      searchInDepartment = req.token.id_department;
    }

    var sqlCountIncoming = `select user_status as callStatus,connected_duration as answeredDuration,destination as didNumber from incoming_reports where call_start_time between '${Start}' and '${End}' and incoming_reports.id_user=${id_user} `;

    if (searchInDepartment) {
      sqlCountIncoming += `AND incoming_reports.id_department in (${searchInDepartment}) `;
    }

    var [incomingCount] = await rackServer.query(sqlCountIncoming);
    var incomingConnected = 0;
    var incomingNotConnected = 0;
    var incomingCountRes = incomingCount.length;
    if (incomingCount.length != 0) {
      incomingCount.map(async (incomingData) => {
        if (didNumber != undefined) {
          if (
            incomingData.didNumber == didNumber ||
            incomingData.didNumber == "0" + didNumber ||
            incomingData.didNumber == "91" + didNumber
          ) {
            if (incomingData.callStatus == "ANSWERED") {
              incomingConnected += 1;
            } else if (incomingData.callStatus != "ANSWERED") {
              incomingNotConnected += 1;
            }
          }
          incomingCountRes = incomingConnected + incomingNotConnected;
        } else {
          if (incomingData.callStatus == "ANSWERED") {
            incomingConnected += 1;
          } else if (incomingData.callStatus != "ANSWERED") {
            incomingNotConnected += 1;
          }
        }
      });
    }
    var sqlCountOutgoing = `select duration,callerid,status from cc_outgoing_reports where date between '${Start}' and '${End}' and cc_outgoing_reports.id_user = ${id_user} `;

    if (searchInDepartment) {
      sqlCountOutgoing += `AND cc_outgoing_reports.id_department in (${searchInDepartment})`;
    }

    var [outgoingCount] = await rackServer.query(sqlCountOutgoing);
    var outgoingCountRes = outgoingCount.length;
    var outgoingConnected = 0;
    var outgoingNotConnected = 0;
    var outgoingCongestion = 0;
    var outgoingOtherCalls = 0;
    if (outgoingCount.length != 0) {
      outgoingCount.map(async (outgoingData) => {
        if (didNumber != undefined) {
          if (
            outgoingData.callerid == didNumber ||
            outgoingData.callerid == "0" + didNumber ||
            outgoingData.callerid == "91" + didNumber ||
            outgoingData.callerid == "+" + didNumber
          ) {
            if (
              (outgoingData.duration != 0 &&
                outgoingData.status == "ANSWERED") ||
              (outgoingData.status == "ANSWER" && outgoingData.duration != 0)
            ) {
              outgoingConnected += 1;
            } else {
              if (outgoingData.status == "CONGESTION") {
                outgoingCongestion += 1;
              } else {
                outgoingOtherCalls += 1;
              }
              outgoingNotConnected += 1;
            }
          }
          outgoingCountRes = outgoingConnected + outgoingNotConnected;
        } else {
          if (
            (outgoingData.duration != 0 && outgoingData.status == "ANSWERED") ||
            (outgoingData.status == "ANSWER" && outgoingData.duration != 0)
          ) {
            outgoingConnected += 1;
          } else {
            if (outgoingData.status == "CONGESTION") {
              outgoingCongestion += 1;
            } else {
              outgoingOtherCalls += 1;
            }
            outgoingNotConnected += 1;
          }
        }
      });
    }
    if (req.query.id_department != undefined) {
      var id_dept = req.query.id_department;
    } else if (isAdmin == 1) {
      var id_dept = 0;
    } else if (isSubAdmin == 1) {
      var id_dept = req.token.id_department;
    } else if (isDept == 1) {
      var id_dept = req.token.id;
    }
    if (date == undefined) {
      console.log(
        "id_user and _id_department===========================================================================",
        id_user,
        id_dept
      );

      if (
        process.env.PRODUCTION == "development" ||
        process.env.PRODUCTION == "local"
      ) {
        var liveCallIncomingCount = [
          {
            type: "report",
            eventTime: "2025-04-29 10:05:38",
            uniqueId: "4083820250424154302000",
            dialedNumber: "919778406951",
            didNumber: "918069255954",
            sourceChannel: "SIP/MtvhyEVb-004653e4",
            customerId: "13",
            deptId: "0",
            userId: "94",
            direction: "outgoing",
            liveKey: "40838",
            callType: "Direct",
            zohoStatus: "0",
            lsqStatus: "0",
            apiOutStart: "0",
            apiOutConnect: "0",
            apiOutDisconnect: "0",
            apiOutCdr: "0",
            didOutSms: "0",
            didOutWhatsapp: "0",
            callProcessId: "",
            event: "start",
            status: 1,
          },
          {
            type: "report",
            eventTime: "2025-04-29 10:05:38",
            uniqueId: "1857420250424154506000",
            dialedNumber: "919778406951",
            didNumber: "918069255954",
            sourceChannel: "SIP/MtvhyEVb-00465655",
            customerId: "13",
            deptId: "0",
            userId: "94",
            direction: "outgoing",
            liveKey: "18574",
            callType: "Direct",
            zohoStatus: "0",
            lsqStatus: "0",
            apiOutStart: "0",
            apiOutConnect: "0",
            apiOutDisconnect: "0",
            apiOutCdr: "0",
            didOutSms: "0",
            didOutWhatsapp: "0",
            callProcessId: "",
            event: "start",
            answeredTime: "2025-04-24 15:45:10",
            currentStatus: 1,
            appId: "94",
            app: "user",
            eventStatus: "dial_answered",
            status: 2,
          },
          {
            type: "report",
            eventTime: "2025-04-29 10:05:38",
            uniqueId: "in3696020250424154648000",
            callerNumber: "919400265768",
            didNumber: "918069256279",
            sourceChannel: "SIP/Bengaluru-00465842",
            customerId: "13",
            deptId: "0",
            app: "user",
            appId: "94",
            direction: "incoming",
            liveKey: "970745",
            zohoStatus: "0",
            lsqStatus: "0",
            apiInStart: "1",
            apiInConnect: "1",
            apiInDisconnect: "1",
            apiInCdr: "1",
            apiInDtmf: "0",
            apiInRoute: "0",
            didInSms: "0",
            didInWhatsapp: "0",
            event: "start",
            status: 1,
            userId: "94",
          },
          {
            type: "report",
            eventTime: "2025-04-29 10:05:38",
            uniqueId: "in5793220250424154738000",
            callerNumber: "919778406951",
            didNumber: "918069256279",
            sourceChannel: "SIP/Bengaluru-0046593b",
            customerId: "13",
            deptId: "0",
            app: "user",
            appId: "94",
            direction: "incoming",
            liveKey: "985999",
            zohoStatus: "0",
            lsqStatus: "0",
            apiInStart: "1",
            apiInConnect: "1",
            apiInDisconnect: "1",
            apiInCdr: "1",
            apiInDtmf: "0",
            apiInRoute: "0",
            didInSms: "0",
            didInWhatsapp: "0",
            event: "start",
            answeredTime: "2025-04-24 15:47:41",
            currentStatus: 1,
            eventStatus: "dial_answered",
            status: 2,
            userId: "94",
          },
        ];
      } else if (
        process.env.PRODUCTION == "developmentLive" ||
        process.env.PRODUCTION == "live"
      ) {
        const id_department = searchInDepartment?.split(",").map(Number) ?? 0;

        var liveCallIncomingCount = await get_live_data(id_user, id_department);
      }

      var connectedCallsIncoming = 0;
      var ringCallsIncoming = 0;
      var connectedCallsOutgoing = 0;
      var ringCallsOutgoing = 0;

      if (liveCallIncomingCount.length !== 0) {
        const currentTime = new Date();
        const fifteenMinutesAgo = new Date(currentTime.getTime() - 59 * 60000);

        liveCallIncomingCount = liveCallIncomingCount.filter((item) => {
          const eventTime = new Date(item.eventTime.replace(" ", "T"));
          console.log(
            "eventTime,currentTime,fifteenMinutesAgo=====================================================",
            eventTime,
            currentTime,
            fifteenMinutesAgo
          );
          return (
            (eventTime >= fifteenMinutesAgo && eventTime <= currentTime) ||
            eventTime > currentTime
          );
        });
      } else {
        liveCallIncomingCount = [];
      }

      if (isDept == 1) {
        liveCallIncomingCount = liveCallIncomingCount.filter(
          (item) => item.deptId == searchInDepartment
        );
      }

      liveCallIncomingCount.forEach((report) => {
        if (report.direction === "incoming") {
          if ("answeredTime" in report) {
            connectedCallsIncoming++;
          } else {
            ringCallsIncoming++;
          }
        }
      });
      liveCallIncomingCount.forEach((report) => {
        if (report.direction === "outgoing") {
          if ("answeredTime" in report) {
            connectedCallsOutgoing++;
          } else {
            ringCallsOutgoing++;
          }
        }
      });

      console.log(
        "data===========================================================================",
        liveCallIncomingCount
      );

      var live_fifteenStart = new Date(fifteenStart);
      var live_fifteenEnd = new Date(fifteenEnd);

      console.log(
        "date===========================================================================",
        live_fifteenStart,
        live_fifteenEnd
      );

      var outgoingFilteredData = liveCallIncomingCount
        .filter((item) => item.direction === "outgoing")
        .map((item) => ({
          ...item,
          withinRange: true,
        }));

      console.log(
        "outgoingFilteredData===========================================================================",
        outgoingFilteredData
      );

      if (didNumber != undefined) {
        outgoingFilteredData = outgoingFilteredData.filter(
          (item) => item.didNumber == didNumber
        );
      }

      var liveOutgoing = outgoingFilteredData.length;
      console.log("live outgping call in filter......", liveOutgoing);
      var incomingFilteredData = liveCallIncomingCount
        .filter((item) => item.direction === "incoming")
        .map((item) => ({
          ...item,
          withinRange: true,
        }));

      if (didNumber != undefined) {
        incomingFilteredData = incomingFilteredData.filter(
          (item) => item.didNumber == didNumber
        );
      }

      console.log(
        "incomingFilteredData===========================================================================",
        incomingFilteredData
      );

      var liveIncoming = incomingFilteredData.length;

      console.log("live incoming call......", liveIncoming);
    } else {
      if (
        process.env.PRODUCTION == "development" ||
        process.env.PRODUCTION == "local"
      ) {
        var liveCallIncomingCount = [
          {
            type: "report",
            eventTime: "2025-04-24 15:43:02",
            uniqueId: "4083820250424154302000",
            dialedNumber: "919778406951",
            didNumber: "918069255954",
            sourceChannel: "SIP/MtvhyEVb-004653e4",
            customerId: "13",
            deptId: "0",
            userId: "94",
            direction: "outgoing",
            liveKey: "40838",
            callType: "Direct",
            zohoStatus: "0",
            lsqStatus: "0",
            apiOutStart: "0",
            apiOutConnect: "0",
            apiOutDisconnect: "0",
            apiOutCdr: "0",
            didOutSms: "0",
            didOutWhatsapp: "0",
            callProcessId: "",
            event: "start",
            status: 1,
          },
          {
            type: "report",
            eventTime: "2025-04-24 15:45:06",
            uniqueId: "1857420250424154506000",
            dialedNumber: "919778406951",
            didNumber: "918069255954",
            sourceChannel: "SIP/MtvhyEVb-00465655",
            customerId: "13",
            deptId: "0",
            userId: "94",
            direction: "outgoing",
            liveKey: "18574",
            callType: "Direct",
            zohoStatus: "0",
            lsqStatus: "0",
            apiOutStart: "0",
            apiOutConnect: "0",
            apiOutDisconnect: "0",
            apiOutCdr: "0",
            didOutSms: "0",
            didOutWhatsapp: "0",
            callProcessId: "",
            event: "start",
            answeredTime: "2025-04-24 15:45:10",
            currentStatus: 1,
            appId: "94",
            app: "user",
            eventStatus: "dial_answered",
            status: 2,
          },
          {
            type: "report",
            eventTime: "2025-04-24 15:46:48",
            uniqueId: "in3696020250424154648000",
            callerNumber: "919400265768",
            didNumber: "918069256279",
            sourceChannel: "SIP/Bengaluru-00465842",
            customerId: "13",
            deptId: "0",
            app: "user",
            appId: "94",
            direction: "incoming",
            liveKey: "970745",
            zohoStatus: "0",
            lsqStatus: "0",
            apiInStart: "1",
            apiInConnect: "1",
            apiInDisconnect: "1",
            apiInCdr: "1",
            apiInDtmf: "0",
            apiInRoute: "0",
            didInSms: "0",
            didInWhatsapp: "0",
            event: "start",
            status: 1,
            userId: "94",
          },
          {
            type: "report",
            eventTime: "2025-04-24 15:47:38",
            uniqueId: "in5793220250424154738000",
            callerNumber: "919778406951",
            didNumber: "918069256279",
            sourceChannel: "SIP/Bengaluru-0046593b",
            customerId: "13",
            deptId: "0",
            app: "user",
            appId: "94",
            direction: "incoming",
            liveKey: "985999",
            zohoStatus: "0",
            lsqStatus: "0",
            apiInStart: "1",
            apiInConnect: "1",
            apiInDisconnect: "1",
            apiInCdr: "1",
            apiInDtmf: "0",
            apiInRoute: "0",
            didInSms: "0",
            didInWhatsapp: "0",
            event: "start",
            answeredTime: "2025-04-24 15:47:41",
            currentStatus: 1,
            eventStatus: "dial_answered",
            status: 2,
            userId: "94",
          },
        ];
      } else if (
        process.env.PRODUCTION == "developmentLive" ||
        process.env.PRODUCTION == "live"
      ) {
        const id_department = searchInDepartment?.split(",").map(Number) ?? 0;
        var liveCallIncomingCount = await get_live_data(id_user, id_department);
      }

      if (isDept == 1) {
        liveCallIncomingCount = liveCallIncomingCount.filter(
          (item) => item.deptId == searchInDepartment
        );
      }

      var connectedCallsIncoming = 0;
      var ringCallsIncoming = 0;
      var connectedCallsOutgoing = 0;
      var ringCallsOutgoing = 0;

      liveCallIncomingCount.forEach((report) => {
        if (report.direction === "incoming") {
          if ("answeredTime" in report) {
            connectedCallsIncoming++;
          } else {
            ringCallsIncoming++;
          }
        }
      });
      liveCallIncomingCount.forEach((report) => {
        if (report.direction === "outgoing") {
          if ("answeredTime" in report) {
            connectedCallsOutgoing++;
          } else {
            ringCallsOutgoing++;
          }
        }
      });
      var live_start = new Date(Start);
      var live_end = new Date(End);

      var outgoingFilteredData = liveCallIncomingCount
        .filter(
          (item) => item.direction === "outgoing"
          //   new Date(item.eventTime) > live_start &&
          //   new Date(item.eventTime) < live_end
        )
        .map((item) => ({
          ...item,
          withinRange: true, // Since the filter ensures this, you can set it directly
        }));

      if (didNumber != undefined) {
        outgoingFilteredData = outgoingFilteredData.filter(
          (item) => item.didNumber == didNumber
        );
      }

      var liveOutgoing = outgoingFilteredData.length;
      console.log("live outgping call in filter......", liveOutgoing);
      var incomingFilteredData = liveCallIncomingCount
        .filter((item) => item.direction === "incoming")
        .map((item) => ({
          ...item,
          withinRange: true, // Since the filter ensures this, you can set it directly
        }));

      if (didNumber != undefined) {
        incomingFilteredData = incomingFilteredData.filter(
          (item) => item.didNumber == didNumber
        );
      }

      var liveIncoming = incomingFilteredData.length;

      console.log("live incoming call in filter......", liveIncoming);
    }
    var campaign_count = 0;
    var campaignConnected = 0;
    var campaignNotConnected = 0;
    var campaignCount = `SELECT duration,callerid FROM cc_campaign_outgoing_reports where createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user=${id_user} `;

    if (searchInDepartment) {
      campaignCount += `AND cc_campaign_outgoing_reports.id_department in (${searchInDepartment}) `;
    }

    var [campaign_outgoingCount] = await rackServer.query(campaignCount);
    if (campaign_outgoingCount.length != 0) {
      campaign_count = campaign_outgoingCount.length;
      campaign_outgoingCount.map(async (outgoingData) => {
        if (didNumber != undefined) {
          if (
            outgoingData.callerid == didNumber ||
            outgoingData.callerid == "0" + didNumber ||
            outgoingData.callerid == "91" + didNumber
          ) {
            if (outgoingData.duration != 0) {
              campaignConnected += 1;
            } else {
              campaignNotConnected += 1;
            }
          }
        } else {
          if (outgoingData.duration != 0) {
            campaignConnected += 1;
          } else {
            campaignNotConnected += 1;
          }
        }
      });
    }
    var connectedCall = incomingConnected + outgoingConnected;
    var totalCall = incomingCountRes + outgoingCountRes;
    var liveCall = liveIncoming + liveOutgoing;
    var otherCalls = outgoingOtherCalls + incomingNotConnected;
    var missedCall = incomingNotConnected + outgoingNotConnected;
    var result = {
      liveCall: {
        totalLivecalls: liveCall,
        liveIncoming: liveIncoming,
        liveOutgoing: liveOutgoing,
        connectedCallsIncoming: connectedCallsIncoming,
        ringCallsIncoming: ringCallsIncoming,
        connectedCallsOutgoing: connectedCallsOutgoing,
        ringCallsOutgoing: ringCallsOutgoing,
      },
      connectedCall: {
        totalConnectedCalls: connectedCall,
        incomingConnected: incomingConnected,
        outgoingConnected: outgoingConnected,
      },
      failedCalls: {
        totalFailedCalls: missedCall,
        incomingFailedCalls: incomingNotConnected,
        outgoingFailedCalls: outgoingNotConnected,
      },
      campaignCalls: {
        campaignTotalcalls: campaign_count,
        campaignConnected: campaignConnected,
        campaignNotConnected: campaignNotConnected,
      },
      totalCall: {
        totalCalls: totalCall,
        totalIncoming: incomingCountRes,
        totalOutgoing: outgoingCountRes,
      },
    };
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
// async function dashboard_call_count(req, res, next) {
//     try {
//         var isAdmin = req.token.isAdmin;
//         var date = req.query.date;

//         const { department_id: department = "", worktime } = req.query;

//         var fromdatetime = new Date();
//         var todatetime = new Date();
//         if (date != undefined) {
//             if (date == "yesterday") {
//                 todatetime.setDate(todatetime.getDate() - 1)
//                 fromdatetime.setDate(fromdatetime.getDate() - 1)
//             }
//             // if (date == "lastweek") {
//             //     fromdatetime.setDate(fromdatetime.getDate() - 7)
//             // }
//             // if (date == "lastmonth") {
//             //     fromdatetime.setDate(fromdatetime.getDate() - 31)
//             // }
//             if (date == "thisweek") {
//                 let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
//                 fromdatetime = weekStart
//                 todatetime = weekEnd
//                 console.log("Week Start:", weekStart);
//                 console.log("Week End:", weekEnd);
//             }
//             if (date == "thismonth") {
//                 let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
//                 fromdatetime = monthStart
//                 todatetime = monthEnd
//                 console.log("Month Start:", monthStart);
//                 console.log("Month End:", monthEnd);
//             }
//             // var currentdate = fromdatetime.getDate();
//             // var currentMnth = fromdatetime.getMonth() + 1;
//             var currentdate = fromdatetime.getDate().toString().padStart(2, '0');
//             var currentMnth = (fromdatetime.getMonth() + 1).toString().padStart(2, '0');
//             var year = fromdatetime.getFullYear();
//             var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
//             var currentdateEnd = todatetime.getDate().toString().padStart(2, '0');
//             var currentMnthEnd = (todatetime.getMonth() + 1).toString().padStart(2, '0');
//             var yearEnd = todatetime.getFullYear();
//             var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
//             console.log("Start :", Start);
//             console.log("End :", End);
//         } else {
//             var today = new Date();
//             var dd = today.getDate().toString().padStart(2, '0');
//             var mm = (today.getMonth() + 1).toString().padStart(2, '0');
//             var yyyy = today.getFullYear();
//             var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
//             var End = `${yyyy}-${mm}-${dd} 23:59:59`;
//             console.log("Start :", Start);
//             console.log("End :", End);
//             const currentDate = new Date();
//             var current_dd = currentDate.getDate().toString().padStart(2, '0');
//             var current_mm = (currentDate.getMonth() + 1).toString().padStart(2, '0');
//             var current_yyyy = currentDate.getFullYear();
//             var current_hours = currentDate.getHours();
//             var current_min = currentDate.getMinutes();
//             var current_sec = currentDate.getSeconds();
//             const fifteenMinutesAgo = new Date(currentDate.getTime() - 30 * 60 * 1000);
//             var hours = fifteenMinutesAgo.getHours();
//             var min = fifteenMinutesAgo.getMinutes();
//             var sec = fifteenMinutesAgo.getSeconds();
//             var fifteenStart = `${current_yyyy}-${current_mm}-${current_dd} ${hours}:${min}:${sec}`;
//             var fifteenEnd = `${current_yyyy}-${current_mm}-${current_dd} ${current_hours}:${current_min}:${current_sec}`;
//             console.log("fifteenStart :", fifteenStart);
//             console.log("fifteenEnd :", fifteenEnd);
//         }

//         const dashboardUserData = await dashboardUserViewModel.findOne({ userId: req.token.id }).lean()
//         const call_type = dashboardUserData.callType

//         if (worktime) {
//             const { start = Start, end = End } = getWorkingTImeBasedStartAndEnd(worktime, req.query.date ?? "today");
//             Start = start;
//             End = end;
//         }

//         var isAdmin = req.token.isAdmin;
//         var isSubAdmin = req.token.isSubAdmin;
//         var isDept = req.token.isDept;
//         var id_user = req.token.id_user
//         if (req.token.did != undefined) {
//             var didNumber = req.token.did;
//         }
//         else if (req.token.didString != undefined) {
//             var didNumber = req.token.didString
//         }
//         else {
//             var didNumber = req.query.didnumber;
//         }
//         var id_department = req.token.id_department;

//         const isDepartmentSearch = department && (isAdmin || (isSubAdmin && req.token.id_department.split(",").includes(department)));

//         let searchInDepartment;
//         if (isDepartmentSearch) {
//             searchInDepartment = `${department}`;
//         } else if (isAdmin) {
//             searchInDepartment = undefined;
//         } else if (isDept) {
//             searchInDepartment = `${req.token.id}`;
//         } else if (isSubAdmin) {
//             searchInDepartment = req.token.id_department;
//         }

//         var sqlCountIncoming = `select user_status as callStatus,connected_duration as answeredDuration,destination as didNumber from incoming_reports where call_start_time between '${Start}' and '${End}' and incoming_reports.id_user=${id_user} `

//         if (searchInDepartment) {
//             sqlCountIncoming += `AND incoming_reports.id_department in (${searchInDepartment}) `
//         }

//         var [incomingCount] = await rackServer.query(sqlCountIncoming)
//         var incomingConnected = 0;
//         var incomingNotConnected = 0;
//         var incomingCountRes = incomingCount.length;
//         if (incomingCount.length != 0) {
//             incomingCount.map(async (incomingData) => {
//                 if (didNumber != undefined) {
//                     if (incomingData.didNumber == didNumber || incomingData.didNumber == '0' + didNumber || incomingData.didNumber == '91' + didNumber) {
//                         if (incomingData.callStatus == 'ANSWERED') {
//                             incomingConnected += 1;
//                         } else if (incomingData.callStatus != "ANSWERED") {
//                             incomingNotConnected += 1;
//                         }
//                     }
//                     incomingCountRes = incomingConnected + incomingNotConnected;
//                 } else {
//                     if (incomingData.callStatus == 'ANSWERED') {
//                         incomingConnected += 1;
//                     } else if (incomingData.callStatus != "ANSWERED") {
//                         incomingNotConnected += 1;
//                     }
//                 }
//             })
//         }
//         var sqlCountOutgoing = `select duration,callerid,status from cc_outgoing_reports where date between '${Start}' and '${End}' and cc_outgoing_reports.id_user = ${id_user} `

//         if (searchInDepartment) {
//             sqlCountOutgoing += `AND cc_outgoing_reports.id_department in (${searchInDepartment})`
//         }

//         var [outgoingCount] = await rackServer.query(sqlCountOutgoing)
//         var outgoingCountRes = outgoingCount.length
//         var outgoingConnected = 0;
//         var outgoingNotConnected = 0;
//         var outgoingCongestion = 0;
//         var outgoingOtherCalls = 0
//         if (outgoingCount.length != 0) {
//             outgoingCount.map(async (outgoingData) => {
//                 if (didNumber != undefined) {
//                     if (outgoingData.callerid == didNumber || outgoingData.callerid == '0' + didNumber || outgoingData.callerid == '91' + didNumber || outgoingData.callerid == '+' + didNumber) {
//                         if ((outgoingData.duration != 0 && outgoingData.status == "ANSWERED") || (outgoingData.status == "ANSWER" && outgoingData.duration != 0)) {
//                             outgoingConnected += 1;
//                         } else {
//                             if (outgoingData.status == 'CONGESTION') {
//                                 outgoingCongestion += 1
//                             } else {
//                                 outgoingOtherCalls += 1
//                             }
//                             outgoingNotConnected += 1;
//                         }
//                     }
//                     outgoingCountRes = outgoingConnected + outgoingNotConnected;
//                 } else {
//                     if ((outgoingData.duration != 0 && outgoingData.status == "ANSWERED") || (outgoingData.status == "ANSWER" && outgoingData.duration != 0)) {
//                         outgoingConnected += 1;
//                     } else {
//                         if (outgoingData.status == 'CONGESTION') {
//                             outgoingCongestion += 1
//                         } else {
//                             outgoingOtherCalls += 1
//                         }
//                         outgoingNotConnected += 1;
//                     }
//                 }
//             })
//         }
//         if (req.query.id_department != undefined) {
//             var id_dept = req.query.id_department
//         }
//         else if (isAdmin == 1) {
//             var id_dept = 0
//         }
//         else if (isSubAdmin == 1) {
//             var id_dept = req.token.id_department
//         }
//         else if (isDept == 1) {
//             var id_dept = req.token.id
//         }
//         if (date == undefined) {

//             console.log("id_user and _id_department===========================================================================", id_user, id_dept)

//             if (process.env.PRODUCTION == 'development' || process.env.PRODUCTION == 'local') {
//                 var liveCallIncomingCount = [
//                     {
//                         "type": "report",
//                         "eventTime": "2025-06-19 17:47:38",
//                         "uniqueId": "4083820250424154302000",
//                         "dialedNumber": "919778406951",
//                         "didNumber": "918069255954",
//                         "sourceChannel": "SIP/MtvhyEVb-004653e4",
//                         "customerId": "13",
//                         "deptId": "0",
//                         "userId": "94",
//                         "direction": "outgoing",
//                         "liveKey": "40838",
//                         "callType": "Direct",
//                         "zohoStatus": "0",
//                         "lsqStatus": "0",
//                         "apiOutStart": "0",
//                         "apiOutConnect": "0",
//                         "apiOutDisconnect": "0",
//                         "apiOutCdr": "0",
//                         "didOutSms": "0",
//                         "didOutWhatsapp": "0",
//                         "callProcessId": "",
//                         "event": "start",
//                         "status": 1
//                     },
//                     {
//                         "type": "report",
//                         "eventTime": "2025-06-19 17:47:38",
//                         "uniqueId": "1857420250424154506000",
//                         "dialedNumber": "919778406951",
//                         "didNumber": "918069255954",
//                         "sourceChannel": "SIP/MtvhyEVb-00465655",
//                         "customerId": "13",
//                         "deptId": "0",
//                         "userId": "94",
//                         "direction": "outgoing",
//                         "liveKey": "18574",
//                         "callType": "Direct",
//                         "zohoStatus": "0",
//                         "lsqStatus": "0",
//                         "apiOutStart": "0",
//                         "apiOutConnect": "0",
//                         "apiOutDisconnect": "0",
//                         "apiOutCdr": "0",
//                         "didOutSms": "0",
//                         "didOutWhatsapp": "0",
//                         "callProcessId": "",
//                         "event": "start",
//                         "answeredTime": "2025-04-24 15:45:10",
//                         "currentStatus": 1,
//                         "appId": "94",
//                         "app": "user",
//                         "eventStatus": "dial_answered",
//                         "status": 2
//                     },
//                     {
//                         "type": "report",
//                         "eventTime": "2025-06-19 17:47:38",
//                         "uniqueId": "in3696020250424154648000",
//                         "callerNumber": "919400265768",
//                         "didNumber": "918069256279",
//                         "sourceChannel": "SIP/Bengaluru-00465842",
//                         "customerId": "13",
//                         "deptId": "0",
//                         "app": "user",
//                         "appId": "94",
//                         "direction": "incoming",
//                         "liveKey": "970745",
//                         "zohoStatus": "0",
//                         "lsqStatus": "0",
//                         "apiInStart": "1",
//                         "apiInConnect": "1",
//                         "apiInDisconnect": "1",
//                         "apiInCdr": "1",
//                         "apiInDtmf": "0",
//                         "apiInRoute": "0",
//                         "didInSms": "0",
//                         "didInWhatsapp": "0",
//                         "event": "start",
//                         "status": 1,
//                         "userId": "94"
//                     },
//                     {
//                         "type": "report",
//                         "eventTime": "2025-06-19 17:47:38",
//                         "uniqueId": "in5793220250424154738000",
//                         "callerNumber": "919778406951",
//                         "didNumber": "918069256279",
//                         "sourceChannel": "SIP/Bengaluru-0046593b",
//                         "customerId": "13",
//                         "deptId": "0",
//                         "app": "user",
//                         "appId": "94",
//                         "direction": "incoming",
//                         "liveKey": "985999",
//                         "zohoStatus": "0",
//                         "lsqStatus": "0",
//                         "apiInStart": "1",
//                         "apiInConnect": "1",
//                         "apiInDisconnect": "1",
//                         "apiInCdr": "1",
//                         "apiInDtmf": "0",
//                         "apiInRoute": "0",
//                         "didInSms": "0",
//                         "didInWhatsapp": "0",
//                         "event": "start",
//                         "answeredTime": "2025-04-24 15:47:41",
//                         "currentStatus": 1,
//                         "eventStatus": "dial_answered",
//                         "status": 2,
//                         "userId": "94"
//                     }
//                 ]
//             } else if (process.env.PRODUCTION == 'developmentLive' || process.env.PRODUCTION == 'live') {
//                 const id_department = searchInDepartment?.split(",").map(Number) ?? 0

//                 var liveCallIncomingCount = await get_live_data(id_user, id_department)
//             }

//             if(call_type == 1){
//                 liveCallIncomingCount = liveCallIncomingCount.filter(data=>data.direction == "incoming")
//             }else if (call_type == 2){
//                 liveCallIncomingCount = liveCallIncomingCount.filter(data=>data.direction == "outgoing")
//             }

//             var connectedCallsIncoming = 0;
//             var ringCallsIncoming = 0;
//             var connectedCallsOutgoing = 0;
//             var ringCallsOutgoing = 0;

//             if (liveCallIncomingCount.length !== 0) {
//                 const currentTime = new Date();
//                 const fifteenMinutesAgo = new Date(currentTime.getTime() - 59 * 60000);

//                 liveCallIncomingCount = liveCallIncomingCount.filter(item => {
//                     const eventTime = new Date(item.eventTime.replace(" ", "T"));
//                     console.log("eventTime,currentTime,fifteenMinutesAgo=====================================================", eventTime, currentTime, fifteenMinutesAgo)
//                     return (eventTime >= fifteenMinutesAgo && eventTime <= currentTime) || eventTime > currentTime;
//                 });
//             } else {
//                 liveCallIncomingCount = [];
//             }

//             if (isDept == 1) {
//                 liveCallIncomingCount = liveCallIncomingCount.filter((item) => item.deptId == searchInDepartment);
//             }

//             liveCallIncomingCount.forEach(report => {
//                 if (report.direction === "incoming") {
//                     if ('answeredTime' in report) {
//                         connectedCallsIncoming++;
//                     } else {
//                         ringCallsIncoming++;
//                     }
//                 }
//             });
//             liveCallIncomingCount.forEach(report => {
//                 if (report.direction === "outgoing") {
//                     if ('answeredTime' in report) {
//                         connectedCallsOutgoing++;
//                     } else {
//                         ringCallsOutgoing++;
//                     }
//                 }
//             });

//             console.log("data===========================================================================", liveCallIncomingCount)

//             var live_fifteenStart = new Date(fifteenStart);
//             var live_fifteenEnd = new Date(fifteenEnd);

//             console.log("date===========================================================================", live_fifteenStart, live_fifteenEnd)

//             var outgoingFilteredData = liveCallIncomingCount
//                 .filter(item =>
//                     item.direction === "outgoing"
//                 )
//                 .map(item => ({
//                     ...item,
//                     withinRange: true
//                 }));

//             console.log("outgoingFilteredData===========================================================================", outgoingFilteredData)

//             if (didNumber != undefined) {
//                 outgoingFilteredData = outgoingFilteredData.filter(item => item.didNumber == didNumber);
//             }

//             var liveOutgoing = outgoingFilteredData.length
//             console.log("live outgping call in filter......", liveOutgoing)
//             var incomingFilteredData = liveCallIncomingCount
//                 .filter(item =>
//                     item.direction === "incoming"
//                 )
//                 .map(item => ({
//                     ...item,
//                     withinRange: true
//                 }));

//             if (didNumber != undefined) {
//                 incomingFilteredData = incomingFilteredData.filter(item => item.didNumber == didNumber);
//             }

//             console.log("incomingFilteredData===========================================================================", incomingFilteredData)

//             var liveIncoming = incomingFilteredData.length

//             console.log("live incoming call......", liveIncoming)
//         } else {

//             if (process.env.PRODUCTION == 'development' || process.env.PRODUCTION == 'local') {
//                 var liveCallIncomingCount = [
//                     {
//                         "type": "report",
//                         "eventTime": "2025-06-19 17:47:38",
//                         "uniqueId": "4083820250424154302000",
//                         "dialedNumber": "919778406951",
//                         "didNumber": "918069255954",
//                         "sourceChannel": "SIP/MtvhyEVb-004653e4",
//                         "customerId": "13",
//                         "deptId": "0",
//                         "userId": "94",
//                         "direction": "outgoing",
//                         "liveKey": "40838",
//                         "callType": "Direct",
//                         "zohoStatus": "0",
//                         "lsqStatus": "0",
//                         "apiOutStart": "0",
//                         "apiOutConnect": "0",
//                         "apiOutDisconnect": "0",
//                         "apiOutCdr": "0",
//                         "didOutSms": "0",
//                         "didOutWhatsapp": "0",
//                         "callProcessId": "",
//                         "event": "start",
//                         "status": 1
//                     },
//                     {
//                         "type": "report",
//                         "eventTime": "2025-06-19 17:47:38",
//                         "uniqueId": "1857420250424154506000",
//                         "dialedNumber": "919778406951",
//                         "didNumber": "918069255954",
//                         "sourceChannel": "SIP/MtvhyEVb-00465655",
//                         "customerId": "13",
//                         "deptId": "0",
//                         "userId": "94",
//                         "direction": "outgoing",
//                         "liveKey": "18574",
//                         "callType": "Direct",
//                         "zohoStatus": "0",
//                         "lsqStatus": "0",
//                         "apiOutStart": "0",
//                         "apiOutConnect": "0",
//                         "apiOutDisconnect": "0",
//                         "apiOutCdr": "0",
//                         "didOutSms": "0",
//                         "didOutWhatsapp": "0",
//                         "callProcessId": "",
//                         "event": "start",
//                         "answeredTime": "2025-04-24 15:45:10",
//                         "currentStatus": 1,
//                         "appId": "94",
//                         "app": "user",
//                         "eventStatus": "dial_answered",
//                         "status": 2
//                     },
//                     {
//                         "type": "report",
//                         "eventTime": "2025-06-19 17:47:38",
//                         "uniqueId": "in3696020250424154648000",
//                         "callerNumber": "919400265768",
//                         "didNumber": "918069256279",
//                         "sourceChannel": "SIP/Bengaluru-00465842",
//                         "customerId": "13",
//                         "deptId": "0",
//                         "app": "user",
//                         "appId": "94",
//                         "direction": "incoming",
//                         "liveKey": "970745",
//                         "zohoStatus": "0",
//                         "lsqStatus": "0",
//                         "apiInStart": "1",
//                         "apiInConnect": "1",
//                         "apiInDisconnect": "1",
//                         "apiInCdr": "1",
//                         "apiInDtmf": "0",
//                         "apiInRoute": "0",
//                         "didInSms": "0",
//                         "didInWhatsapp": "0",
//                         "event": "start",
//                         "status": 1,
//                         "userId": "94"
//                     },
//                     {
//                         "type": "report",
//                         "eventTime": "2025-06-19 17:47:38",
//                         "uniqueId": "in5793220250424154738000",
//                         "callerNumber": "919778406951",
//                         "didNumber": "918069256279",
//                         "sourceChannel": "SIP/Bengaluru-0046593b",
//                         "customerId": "13",
//                         "deptId": "0",
//                         "app": "user",
//                         "appId": "94",
//                         "direction": "incoming",
//                         "liveKey": "985999",
//                         "zohoStatus": "0",
//                         "lsqStatus": "0",
//                         "apiInStart": "1",
//                         "apiInConnect": "1",
//                         "apiInDisconnect": "1",
//                         "apiInCdr": "1",
//                         "apiInDtmf": "0",
//                         "apiInRoute": "0",
//                         "didInSms": "0",
//                         "didInWhatsapp": "0",
//                         "event": "start",
//                         "answeredTime": "2025-04-24 15:47:41",
//                         "currentStatus": 1,
//                         "eventStatus": "dial_answered",
//                         "status": 2,
//                         "userId": "94"
//                     }
//                 ]

//             } else if (process.env.PRODUCTION == 'developmentLive' || process.env.PRODUCTION == 'live') {

//                 const id_department = searchInDepartment?.split(",").map(Number) ?? 0
//                 var liveCallIncomingCount = await get_live_data(id_user, id_department)
//             }

//             if(call_type == 1){
//                 liveCallIncomingCount = liveCallIncomingCount.filter(data=>data.direction == "incoming")
//             }else if (call_type == 2){
//                 liveCallIncomingCount = liveCallIncomingCount.filter(data=>data.direction == "outgoing")
//             }

//             if (isDept == 1) {
//                 liveCallIncomingCount = liveCallIncomingCount.filter((item) => item.deptId == searchInDepartment);
//             }

//             var connectedCallsIncoming = 0;
//             var ringCallsIncoming = 0;
//             var connectedCallsOutgoing = 0;
//             var ringCallsOutgoing = 0;

//             liveCallIncomingCount.forEach(report => {
//                 if (report.direction === "incoming") {
//                     if ('answeredTime' in report) {
//                         connectedCallsIncoming++;
//                     } else {
//                         ringCallsIncoming++;
//                     }
//                 }
//             });
//             liveCallIncomingCount.forEach(report => {
//                 if (report.direction === "outgoing") {
//                     if ('answeredTime' in report) {
//                         connectedCallsOutgoing++;
//                     } else {
//                         ringCallsOutgoing++;
//                     }
//                 }
//             });
//             var live_start = new Date(Start);
//             var live_end = new Date(End);

//             var outgoingFilteredData = liveCallIncomingCount
//                 .filter(item =>
//                     item.direction === "outgoing"
//                     //   new Date(item.eventTime) > live_start &&
//                     //   new Date(item.eventTime) < live_end
//                 )
//                 .map(item => ({
//                     ...item,
//                     withinRange: true // Since the filter ensures this, you can set it directly
//                 }));

//             if (didNumber != undefined) {
//                 outgoingFilteredData = outgoingFilteredData.filter(item => item.didNumber == didNumber);
//             }

//             var liveOutgoing = outgoingFilteredData.length
//             console.log("live outgping call in filter......", liveOutgoing)
//             var incomingFilteredData = liveCallIncomingCount
//                 .filter(item =>
//                     item.direction === "incoming"
//                 )
//                 .map(item => ({
//                     ...item,
//                     withinRange: true // Since the filter ensures this, you can set it directly
//                 }));

//             if (didNumber != undefined) {
//                 incomingFilteredData = incomingFilteredData.filter(item => item.didNumber == didNumber);
//             }

//             var liveIncoming = incomingFilteredData.length

//             console.log("live incoming call in filter......", liveIncoming)
//         }
//         var campaign_count = 0;
//         var campaignConnected = 0;
//         var campaignNotConnected = 0;
//         var campaignCount = `SELECT duration,callerid FROM cc_campaign_outgoing_reports where createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user=${id_user} `

//         if (searchInDepartment) {
//             campaignCount += `AND cc_campaign_outgoing_reports.id_department in (${searchInDepartment}) `
//         }

//         var [campaign_outgoingCount] = await rackServer.query(campaignCount)
//         if (campaign_outgoingCount.length != 0) {
//             campaign_count = campaign_outgoingCount.length;
//             campaign_outgoingCount.map(async (outgoingData) => {
//                 if (didNumber != undefined) {
//                     if (outgoingData.callerid == didNumber || outgoingData.callerid == '0' + didNumber || outgoingData.callerid == '91' + didNumber) {
//                         if (outgoingData.duration != 0) {
//                             campaignConnected += 1;
//                         } else {
//                             campaignNotConnected += 1;
//                         }
//                     }
//                 } else {
//                     if (outgoingData.duration != 0) {
//                         campaignConnected += 1;
//                     } else {
//                         campaignNotConnected += 1;
//                     }
//                 }
//             })
//         }

//         if(call_type == 1){
//              var totalCall = incomingCountRes
//              var connectedCall = incomingConnected
//              var missedCall = incomingNotConnected
//              outgoingConnected = 0
//              outgoingNotConnected = 0
//              outgoingCountRes = 0
//         }else if(call_type == 2){
//              var totalCall = outgoingCountRes
//              var connectedCall = outgoingConnected
//              var missedCall =  outgoingNotConnected
//              incomingConnected = 0
//              incomingNotConnected = 0
//              incomingCountRes = 0
//         }else{
//              var totalCall = incomingCountRes + outgoingCountRes
//              var connectedCall = incomingConnected + outgoingConnected
//              var missedCall = incomingNotConnected + outgoingNotConnected
//         }
//         var liveCall = liveIncoming + liveOutgoing
//         var otherCalls = outgoingOtherCalls + incomingNotConnected

//         var result = {
//             liveCall: {
//                 totalLivecalls: liveCall,
//                 liveIncoming: liveIncoming,
//                 liveOutgoing: liveOutgoing,
//                 connectedCallsIncoming: connectedCallsIncoming,
//                 ringCallsIncoming: ringCallsIncoming,
//                 connectedCallsOutgoing: connectedCallsOutgoing,
//                 ringCallsOutgoing: ringCallsOutgoing

//             }, connectedCall: {
//                 totalConnectedCalls: connectedCall,
//                 incomingConnected: incomingConnected,
//                 outgoingConnected: outgoingConnected
//             }, failedCalls: {
//                 totalFailedCalls: missedCall,
//                 incomingFailedCalls: incomingNotConnected,
//                 outgoingFailedCalls: outgoingNotConnected
//             }, campaignCalls: {
//                 campaignTotalcalls: campaign_count,
//                 campaignConnected: campaignConnected,
//                 campaignNotConnected: campaignNotConnected
//             }, totalCall: {
//                 totalCalls: totalCall,
//                 totalIncoming: incomingCountRes,
//                 totalOutgoing: outgoingCountRes
//             },
//         }
//         res.locals.result = result;
//         next()
//     } catch (err) {
//         console.log(err);
//         res.locals.result = "err"
//         next()
//     }
// }
async function dashboard_call_report(req, res, next) {
  try {
    var fromdatetime = new Date();
    var todatetime = new Date();
    fromdatetime.setDate(fromdatetime.getDate() - 7);
    var currentdate = fromdatetime.getDate();
    var currentMnth = fromdatetime.getMonth() + 1;
    var year = fromdatetime.getFullYear();
    var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
    var currentdate = todatetime.getDate();
    var currentMnth = todatetime.getMonth() + 1;
    var year = todatetime.getFullYear();
    var Todate = `${year}-${currentMnth}-${currentdate} 23:59:59`;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    if (req.token.did != undefined) {
      var didNumber = req.token.did;
    } else if (req.token.didString != undefined) {
      var didNumber = req.token.didString;
    } else {
      var didNumber = req.query.didnumber;
    }
    var department_id = req.query.department_id;
    var sqlCountOutgoing = `select duration,callerid as didNumber,status,DATE_FORMAT(date,'%d-%m-%y') as date from cc_outgoing_reports where date between '${fromDate}' and '${Todate}' `;
    if (isAdmin == 1) {
      sqlCountOutgoing += `AND cc_outgoing_reports.id_user='${id_user}' `;
    } else if (isSubAdmin == 1) {
      if (department_id != undefined) {
        sqlCountIncoming += `AND cc_outgoing_reports.id_user='${id_user}' `;
      } else {
        sqlCountOutgoing += `AND cc_outgoing_reports.id_department in (${id_department}) AND cc_outgoing_reports.id_user='${id_user}' `;
      }
    } else if (isDept == 1) {
      sqlCountOutgoing += `AND cc_outgoing_reports.id_department='${req.token.id}' AND cc_outgoing_reports.id_user='${id_user}' `;
    }
    if (department_id != undefined) {
      sqlCountOutgoing += `AND cc_outgoing_reports.id_department = '${department_id}'`;
    }
    var [outgoingCount] = await rackServer.query(sqlCountOutgoing);
    var countOutgoing = [];
    if (outgoingCount.length != 0) {
      outgoingCount.map(async (outgoingData) => {
        var date = outgoingData.date;
        if (countOutgoing.length == 0) {
          countOutgoing.push({
            date: date,
            totalOutgoing: 0,
            answeredOutgoing: 0,
            notConnectedOutgoing: 0,
          });
          if (didNumber != undefined) {
            if (
              outgoingData.didNumber == didNumber ||
              outgoingData.didNumber == "0" + didNumber ||
              outgoingData.didNumber == "91" + didNumber
            ) {
              if (
                (outgoingData.duration != 0 &&
                  outgoingData.status == "ANSWERED") ||
                (outgoingData.status == "ANSWER" && outgoingData.duration != 0)
              ) {
                countOutgoing[0].totalOutgoing += 1;
                countOutgoing[0].answeredOutgoing += 1;
              } else {
                countOutgoing[0].totalOutgoing += 1;
                countOutgoing[0].notConnectedOutgoing += 1;
              }
            }
          } else {
            if (
              (outgoingData.duration != 0 &&
                outgoingData.status == "ANSWERED") ||
              (outgoingData.status == "ANSWER" && outgoingData.duration != 0)
            ) {
              countOutgoing[0].totalOutgoing += 1;
              countOutgoing[0].answeredOutgoing += 1;
            } else {
              countOutgoing[0].totalOutgoing += 1;
              countOutgoing[0].notConnectedOutgoing += 1;
            }
          }
        } else {
          let foundObject = countOutgoing.findIndex((obj) => obj.date === date);
          if (foundObject != -1) {
            if (didNumber != undefined) {
              if (
                outgoingData.didNumber == didNumber ||
                outgoingData.didNumber == "0" + didNumber ||
                outgoingData.didNumber == "91" + didNumber
              ) {
                if (
                  (outgoingData.duration != 0 &&
                    outgoingData.status == "ANSWERED") ||
                  (outgoingData.status == "ANSWER" &&
                    outgoingData.duration != 0)
                ) {
                  countOutgoing[foundObject].totalOutgoing += 1;
                  countOutgoing[foundObject].answeredOutgoing += 1;
                } else {
                  countOutgoing[foundObject].totalOutgoing += 1;
                  countOutgoing[foundObject].notConnectedOutgoing += 1;
                }
              }
            } else {
              if (
                (outgoingData.duration != 0 &&
                  outgoingData.status == "ANSWERED") ||
                (outgoingData.status == "ANSWER" && outgoingData.duration != 0)
              ) {
                countOutgoing[foundObject].totalOutgoing += 1;
                countOutgoing[foundObject].answeredOutgoing += 1;
              } else {
                countOutgoing[foundObject].totalOutgoing += 1;
                countOutgoing[foundObject].notConnectedOutgoing += 1;
              }
            }
          } else {
            countOutgoing.push({
              date: date,
              totalOutgoing: 0,
              answeredOutgoing: 0,
              notConnectedOutgoing: 0,
            });
            var incominglength = countOutgoing.length - 1;
            if (didNumber != undefined) {
              if (
                outgoingData.didNumber == didNumber ||
                outgoingData.didNumber == "0" + didNumber ||
                outgoingData.didNumber == "91" + didNumber
              ) {
                if (
                  (outgoingData.duration != 0 &&
                    outgoingData.status == "ANSWERED") ||
                  (outgoingData.status == "ANSWER" &&
                    outgoingData.duration != 0)
                ) {
                  countOutgoing[incominglength].totalOutgoing += 1;
                  countOutgoing[incominglength].answeredOutgoing += 1;
                } else {
                  countOutgoing[incominglength].totalOutgoing += 1;
                  countOutgoing[incominglength].notConnectedOutgoing += 1;
                }
              }
            } else {
              if (
                (outgoingData.duration != 0 &&
                  outgoingData.status == "ANSWERED") ||
                (outgoingData.status == "ANSWER" && outgoingData.duration != 0)
              ) {
                countOutgoing[incominglength].totalOutgoing += 1;
                countOutgoing[incominglength].answeredOutgoing += 1;
              } else {
                countOutgoing[incominglength].totalOutgoing += 1;
                countOutgoing[incominglength].notConnectedOutgoing += 1;
              }
            }
          }
        }
      });
    }
    function formatDate(date) {
      const day = ("0" + date.getDate()).slice(-2);
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear().toString().slice(-2);
      return `${day}-${month}-${year}`;
    }
    let result = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = formatDate(date);
      const existingEntry = countOutgoing.find(
        (entry) => entry.date === formattedDate
      );
      if (existingEntry) {
        result.push(existingEntry);
      } else {
        result.push({
          date: formattedDate,
          totalOutgoing: 0,
          answeredOutgoing: 0,
          notConnectedOutgoing: 0,
        });
      }
    }
    var map_result = Promise.all(
      result.map(async (value) => {
        const [day, month, year] = value.date.split("-");
        const dateObj = new Date(`20${year}-${month}-${day}`);

        // Get the day of the week
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const dayOfWeek = daysOfWeek[dateObj.getDay()];
        value.day = dayOfWeek;
        return value;
      })
    );
    var result1 = await map_result;
    res.locals.result = result1;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function dashboard_outgoing_call_status(req, res, next) {
  try {
    var date = req.query.date;
    var fromdatetime = new Date();
    var todatetime = new Date();
    var worktime = req.query.worktime;
    if (date != undefined) {
      if (date == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      // if (date == "lastweek") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 7)
      // }
      // if (date == "lastmonth") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 31)
      // }
      if (date == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (date == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      if (worktime != undefined) {
        worktime = worktime.split("-").map(time => time === "24:00" ? "23:59" : time);;
        var splitStart = Start.split(" ");
        var splitEnd = End.split(" ");
        Start = `${splitStart[0]} ${worktime[0]}:00`;
        End = `${splitEnd[0]} ${worktime[1]}:00`;
      }
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var today = new Date();
      var dd = today.getDate().toString().padStart(2, "0");
      var mm = (today.getMonth() + 1).toString().padStart(2, "0");
      var yyyy = today.getFullYear();
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
      if (worktime != undefined) {
        worktime = worktime.split("-").map(time => time === "24:00" ? "23:59" : time);;
        var splitStart = Start.split(" ");
        var splitEnd = End.split(" ");
        Start = `${splitStart[0]} ${worktime[0]}:00`;
        End = `${splitEnd[0]} ${worktime[1]}:00`;
      }
      console.log("Start :", Start);
      console.log("End :", End);
    }
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    if (req.token.did != undefined) {
      var didNumber = req.token.did;
    } else if (req.token.didString != undefined) {
      var didNumber = req.token.didString;
    } else {
      var didNumber = req.query.didnumber;
    }
    var id_department = req.token.id_department;
    var sqlCountOutgoing = `select duration,callerid,status,DATE_FORMAT(date,'%d-%m-%y') as date from cc_outgoing_reports where date between '${Start}' and '${End}' `;
    if (isAdmin == 1) {
      sqlCountOutgoing += `AND cc_outgoing_reports.id_user='${id_user}' `;
    } else if (isSubAdmin == 1) {
      sqlCountOutgoing += `AND cc_outgoing_reports.id_department in (${id_department}) AND cc_outgoing_reports.id_user='${id_user}' `;
    } else if (isDept == 1) {
      sqlCountOutgoing += `AND cc_outgoing_reports.id_department='${req.token.id}' AND cc_outgoing_reports.id_user='${id_user}' `;
    }
    var [outgoingCount] = await getConnection.query(sqlCountOutgoing);
    var outgoingCountRes = outgoingCount.length;
    var answered = 0;
    var notAnswered = 0;
    var busy = 0;
    var congestion = 0;
    var channelUnavailable = 0;
    var cancel = 0;
    if (outgoingCount.length != 0) {
      outgoingCount.map(async (outgoingData) => {
        if (didNumber != undefined) {
          if (
            outgoingData.callerid == didNumber ||
            outgoingData.callerid == "0" + didNumber ||
            outgoingData.callerid == "91" + didNumber ||
            outgoingData.callerid == "+" + didNumber
          ) {
            if (
              (outgoingData.duration != 0 &&
                outgoingData.status == "ANSWERED") ||
              (outgoingData.status == "ANSWER" && outgoingData.duration != 0)
            ) {
              answered += 1;
            } else if (
              outgoingData.status == "NO ANSWER" ||
              outgoingData.status == "NOANSWER"
            ) {
              notAnswered += 1;
            } else if (outgoingData.status == "CHANUNAVAIL") {
              channelUnavailable += 1;
            } else if (outgoingData.status == "BUSY") {
              busy += 1;
            } else if (outgoingData.status == "CONGESTION") {
              congestion += 1;
            } else if (outgoingData.status == "CANCEL") {
              cancel += 1;
            }
          }
        } else {
          if (
            (outgoingData.duration != 0 && outgoingData.status == "ANSWERED") ||
            (outgoingData.status == "ANSWER" && outgoingData.duration != 0)
          ) {
            answered += 1;
          } else if (
            outgoingData.status == "NO ANSWER" ||
            outgoingData.status == "NOANSWER"
          ) {
            notAnswered += 1;
          } else if (outgoingData.status == "CHANUNAVAIL") {
            channelUnavailable += 1;
          } else if (outgoingData.status == "BUSY") {
            busy += 1;
          } else if (outgoingData.status == "CONGESTION") {
            congestion += 1;
          } else if (outgoingData.status == "CANCEL") {
            cancel += 1;
          }
        }
      });
    }
    var result = {
      totalcalls: outgoingCountRes,
      answered: answered,
      notAnswered: notAnswered,
      busy: busy,
      congestion: congestion,
      channelUnavailable: channelUnavailable,
      cancel: cancel,
    };
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function dashboard_incoming_call_status(req, res, next) {
  try {
    var date = req.query.date;
    var worktime = req.query.worktime;
    var fromdatetime = new Date();
    var todatetime = new Date();
    if (date != undefined) {
      if (date == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      // if (date == "lastweek") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 7)
      // }
      // if (date == "lastmonth") {
      //     fromdatetime.setDate(fromdatetime.getDate() - 31)
      // }
      if (date == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (date == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      if (worktime != undefined) {
        worktime = worktime.split("-").map(time => time === "24:00" ? "23:59" : time);;
        var splitStart = Start.split(" ");
        var splitEnd = End.split(" ");
        Start = `${splitStart[0]} ${worktime[0]}:00`;
        End = `${splitEnd[0]} ${worktime[1]}:00`;
      }
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var today = new Date();
      var dd = today.getDate().toString().padStart(2, "0");
      var mm = (today.getMonth() + 1).toString().padStart(2, "0");
      var yyyy = today.getFullYear();
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
      if (worktime != undefined) {
        worktime = worktime.split("-").map(time => time === "24:00" ? "23:59" : time);;
        var splitStart = Start.split(" ");
        var splitEnd = End.split(" ");
        Start = `${splitStart[0]} ${worktime[0]}:00`;
        End = `${splitEnd[0]} ${worktime[1]}:00`;
      }
      console.log("Start :", Start);
      console.log("End :", End);
    }
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    if (req.token.did != undefined) {
      var didNumber = req.token.did;
    } else if (req.token.didString != undefined) {
      var didNumber = req.token.didString;
    } else {
      var didNumber = req.query.didnumber;
    }
    var id_department = req.token.id_department;
    var sqlCountIncoming = `select connected_duration,destination,user_status as call_status,DATE_FORMAT(call_start_time,'%d-%m-%y') as date from incoming_reports where call_start_time between '${Start}' and '${End}' `;
    if (isAdmin == 1) {
      sqlCountIncoming += `AND id_user='${id_user}' `;
    } else if (isSubAdmin == 1) {
      sqlCountIncoming += `AND id_department in (${id_department}) AND id_user='${id_user}' `;
    } else if (isDept == 1) {
      sqlCountIncoming += `AND id_department='${req.token.id}' AND id_user='${id_user}' `;
    }
    var [incomingCount] = await getConnection.query(sqlCountIncoming);
    var incomingCountRes = incomingCount.length;
    var answered = 0;
    var notAnswered = 0;
    var totalCount = 0;
    if (incomingCountRes.length != 0) {
      incomingCount.map(async (incomingData) => {
        if (didNumber != undefined) {
          if (
            incomingData.destination == didNumber ||
            incomingData.destination == "0" + didNumber ||
            incomingData.destination == "91" + didNumber ||
            incomingData.destination == "+" + didNumber
          ) {
            if (incomingData.call_status == "ANSWERED") {
              answered += 1;
              totalCount += 1;
            } else if (incomingData.call_status != "ANSWERED") {
              notAnswered += 1;
              totalCount += 1;
            }
          }
        } else {
          if (incomingData.call_status == "ANSWERED") {
            answered += 1;
            totalCount += 1;
          } else if (incomingData.call_status != "ANSWERED") {
            notAnswered += 1;
            totalCount += 1;
          }
        }
      });
    }
    var result = {
      totalcalls: totalCount,
      answered: answered,
      notAnswered: notAnswered,
    };
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function dashboard_Channel_count(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var sql = `SELECT SUM(channels) AS channels FROM did WHERE id_user = '${id_user}' `;
    var [result] = await getConnection.query(sql);
    if (result.length != 0) {
      result[0].channels = Number(result[0].channels);
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function add_breaks_data(req, res, next) {
  try {
    var data = req.body;
    data.id_user = req.token.id_user;
    data.id_department = req.token.id_department;
    if (data.inbound == true) {
      data.allow_incoming = 1;
    } else {
      data.allow_incoming = 0;
    }
    if (data.outbound == true) {
      data.allow_outgoing = 1;
    } else {
      data.allow_outgoing = 0;
    }
    const result = await breaksModel.create(data);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_breaks_data(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isAgent = req.token.isAgent;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    var departement_id = req.query.id_department;
    // const result = await breaksModel.findAll({ where: { break_type : 0 } });
    var sql = `SELECT * from breaks where id_user = ${id_user} and break_type = 3 `;
    if (isAdmin == 1) {
      sql += `and id_department = 0 `;
    }
    if (isSubAdmin == 1) {
      sql += `and id_department = ${departement_id} `;
    } else if (isDept == 1) {
      sql += `and id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql += `and id_department = ${id_department} `;
    }
    sql += `ORDER BY id DESC`;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.error("Error fetching records:", err);
    res.locals.result = "err";
    next();
  }
}
async function get_workactivity_data(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isAgent = req.token.isAgent;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    var departement_id = req.query.id_department;
    var sql = `SELECT id,id_user,id_department,date,name,description,break_type,status,maxDuration,allow_outgoing as outbound,allow_incoming as inbound from breaks where id_user = ${id_user} and break_type = 0 `;
    if (isAdmin == 1) {
      sql += `and id_department = 0 `;
    } else if (isSubAdmin == 1) {
      sql += `and id_department = ${departement_id} `;
    } else if (isDept == 1) {
      sql += `and id_department = ${req.token.id} `;
    } else if (isAgent == 1) {
      sql += `and id_department = ${id_department} `;
    }
    sql += `ORDER BY id DESC`;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.error("Error fetching records:", err);
    res.locals.result = "err";
    next();
  }
}
async function get_breaks_data_by_id(req, res, next) {
  try {
    const id = req.query.id;
    const record = await breaksModel.findOne({ where: { id } });
    res.locals.result = result;
    next();
  } catch (err) {
    console.error("Error fetching record by ID:", err);
    res.locals.result = "err";
    next();
  }
}
async function update_breaks_data(req, res, next) {
  try {
    const id = req.query.id;
    const updateData = req.body;
    const [updatedRows] = await breaksModel.update(updateData, {
      where: { id },
    });
    res.locals.result = updatedRows;
    next();
  } catch (error) {
    console.error("Error updating record:", error);
    res.locals.result = "err";
    next();
  }
}
async function delete_breaks_data(req, res, next) {
  try {
    const id = req.query.id;
    const result = await breaksModel.destroy({ where: { id } });
    res.locals.result = result;
    next();
  } catch (error) {
    console.error("Error deleting record:", error);
    res.locals.result = "err";
    next();
  }
}

function callrecord_byot(recordType) {
  return async (req, res, next) => {
    try {
      const { date, filename } = req.params;
      const { id_user } = req.token || req.params;

      const [year, month, day] = date.split("-");

      const formattedDate = `${day}${month}${year}`;

      const response = await callByotApi(
        "GET",
        "/call/incoming-recordfile",
        undefined,
        { date: formattedDate, filename, recordType, id_user },
        {
          token: req.headers.token,
          responseType: "arraybuffer",
        },
        id_user
      );

      if (response.error) {
        res.locals.result = {
          status: false,
          statusCode: 404,
          message: "File not found!",
        };
        return next();
      }

      res.setHeader("Content-Type", "audio/wav");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", response.length);

      res.end(response, "binary");
    } catch (error) {
      console.log(error);
      res.locals.result = {};
      next();
    }
  };
}

async function dashboard_incoming_and_outgoing_count(req, res, next) {
  try {
    var agent_id = req.token.id;
    var did = req.query.didnumber;
    var fromdatetime = new Date();
    var todatetime = new Date();
    fromdatetime.setDate(fromdatetime.getDate() - 7);
    var currentdate = fromdatetime.getDate();
    var currentMnth = fromdatetime.getMonth() + 1;
    var year = fromdatetime.getFullYear();
    var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
    var currentdate = todatetime.getDate();
    var currentMnth = todatetime.getMonth() + 1;
    var year = todatetime.getFullYear();
    var Todate = `${year}-${currentMnth}-${currentdate} 23:59:59`;
    let sql = `SELECT id,DATE_FORMAT(date,'%d-%m-%y') as date FROM cc_outgoing_reports WHERE user_id = '${agent_id}' and date BETWEEN '${fromDate}' and '${Todate}' `;
    let sql1 = `SELECT id,DATE_FORMAT(call_start_time,'%d-%m-%y') as date FROM incoming_reports WHERE user_id = '${agent_id}' and call_start_time BETWEEN '${fromDate}' and '${Todate}' `;
    if (did != undefined) {
      sql += ` AND callerid = '${did}'`;
      sql1 += ` AND destination = '${did}'`;
    }
    sql += ` ORDER BY date DESC `;
    sql1 += ` ORDER BY call_start_time DESC `;
    const [outgoingCount] = await rackServer.query(sql);
    const [incomingCount] = await rackServer.query(sql1);
    var count = [];
    var countIncoming = [];
    var countOutgoing = [];
    if (incomingCount.length != 0) {
      var obj = {};
      incomingCount.map(async (incomingData) => {
        var date = incomingData.date;
        if (countIncoming.length == 0) {
          countIncoming.push({
            date: date,
            totalIncoming: 0,
          });
          countIncoming[0].totalIncoming += 1;
        } else {
          let foundObject = countIncoming.findIndex((obj) => obj.date === date);
          if (foundObject != -1) {
            countIncoming[foundObject].totalIncoming += 1;
          } else {
            countIncoming.push({
              date: date,
              totalIncoming: 0,
            });
            var incominglength = countIncoming.length - 1;
            countIncoming[incominglength].totalIncoming += 1;
          }
        }
      });
    }
    if (outgoingCount.length != 0) {
      var obj = {};
      outgoingCount.map(async (outgoingData) => {
        var date = outgoingData.date;
        if (countOutgoing.length == 0) {
          countOutgoing.push({
            date: date,
            totalOutgoing: 0,
          });
          countOutgoing[0].totalOutgoing += 1;
        } else {
          let foundObject = countOutgoing.findIndex((obj) => obj.date === date);
          if (foundObject != -1) {
            countOutgoing[foundObject].totalOutgoing += 1;
          } else {
            countOutgoing.push({
              date: date,
              totalOutgoing: 0,
            });
            var incominglength = countOutgoing.length - 1;
            countOutgoing[incominglength].totalOutgoing += 1;
          }
        }
      });
    }
    function formatDate(date) {
      const day = ("0" + date.getDate()).slice(-2);
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear().toString().slice(-2);
      return `${day}-${month}-${year}`;
    }
    const resultOutgoing = [];
    const resultIncoming = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = formatDate(date);
      const existingEntry = countOutgoing.find(
        (entry) => entry.date === formattedDate
      );
      if (existingEntry) {
        resultOutgoing.push(existingEntry);
      } else {
        resultOutgoing.push({ date: formattedDate, totalOutgoing: 0 });
      }
      const existingIncomingEntry = countIncoming.find(
        (entry) => entry.date === formattedDate
      );
      if (existingIncomingEntry) {
        resultIncoming.push(existingIncomingEntry);
      } else {
        resultIncoming.push({ date: formattedDate, totalIncoming: 0 });
      }
    }
    const combinedResult = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = formatDate(date);

      // Find entries for the current date in both incomingArr and outgoingArr
      const incomingEntry = resultIncoming.find(
        (entry) => entry.date === formattedDate
      ) || { totalIncoming: 0 };
      const outgoingEntry = resultOutgoing.find(
        (entry) => entry.date === formattedDate
      ) || { totalOutgoing: 0 };

      // Calculate totalCalls
      const totalIncoming = incomingEntry.totalIncoming || 0;
      const totalOutgoing = outgoingEntry.totalOutgoing || 0;
      const totalCalls = totalIncoming + totalOutgoing;

      // Push the combined result for the date
      combinedResult.push({
        date: formattedDate,
        incomingCount: totalIncoming,
        outgoingCount: totalOutgoing,
        total: totalCalls,
      });
    }

    // const today = new Date();
    // const datesRange = Array.from({ length: 7 }, (_, i) => {
    //     const date = new Date(today);
    //     date.setDate(today.getDate() - i);
    //     return date.toISOString().split('T')[0];
    // }).reverse();
    // const aggregateRecords = (records) => {
    //     return records.reduce((acc, record) => {
    //         if (record.date) {
    //             const date = new Date(record.date).toISOString().split('T')[0];
    //             // const date = new Date(record.date).toLocaleDateString('en-CA');
    //             if (!acc[date]) {
    //                 acc[date] = 0;
    //             }
    //             acc[date]++;
    //         }
    //         return acc;
    //     }, {});
    // };
    // const outgoingCountMap = aggregateRecords(result1);
    // const incomingCountMap = aggregateRecords(result2);

    // const counts = datesRange.map(date => {
    //     const count = outgoingCountMap[date] || 0;
    //     const count1 = incomingCountMap[date] || 0;
    //     return {
    //         date,
    //         outgoingCount:count,
    //         incomingCount:count1,
    //         total: count + count1
    //     };
    // });
    res.locals.result = combinedResult;
    // res.locals.result =  counts
    next();
  } catch (error) {
    console.error("Error retrieving records:", error);
    res.locals.result = "err";
    next();
  }
}
async function agent_status_count_outgoing(req, res, next) {
  try {
    // Fetch data from cc_outgoing_reports
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
    var Todate = `${yyyy}-${mm}-${dd} 23:59:59`;
    const sql = `SELECT * FROM cc_outgoing_reports where user_id = '${req.token.id}' AND date BETWEEN '${fromDate}' and '${Todate}' `;
    const [result] = await getConnection.query(sql);

    // Initialize status counts
    const statusCounts = {
      ANSWERED: 0,
      CHANUNAVAIL: 0,
      NOANSWER: 0,
      CANCEL: 0,
      BUSY: 0,
      CONGESTION: 0,
    };

    // Process result from cc_outgoing_reports
    result.map((item) => {
      // Normalize status for comparison
      const normalizedStatus = item.status.toLowerCase().replace(/[_\s]/g, "");

      // Update statusCounts based on normalized status
      if (normalizedStatus.includes("answered")) {
        statusCounts.ANSWERED++;
      } else if (normalizedStatus.includes("answer")) {
        statusCounts.ANSWERED++;
      } else if (normalizedStatus.includes("chanunavail")) {
        statusCounts.CHANUNAVAIL++;
      } else if (normalizedStatus.includes("noanswer")) {
        statusCounts.NOANSWER++;
      } else if (normalizedStatus.includes("no answer")) {
        statusCounts.NOANSWER++;
      } else if (normalizedStatus.includes("not answered")) {
        statusCounts.NOANSWER++;
      } else if (normalizedStatus.includes("cancel")) {
        statusCounts.CANCEL++;
      } else if (normalizedStatus.includes("busy")) {
        statusCounts.BUSY++;
      } else if (normalizedStatus.includes("congestion")) {
        statusCounts.CONGESTION++;
      }
    });

    // Fetch data from cc_campaign_outgoing_reports
    const sql1 = `SELECT * FROM cc_campaign_outgoing_reports where user_id = '${req.token.id}' AND call_start_time BETWEEN '${fromDate}' and '${Todate}'`;
    const [result1] = await getConnection.query(sql1);

    // Initialize summary object
    const summary = {
      ANSWERED: 0,
      NOANSWER: 0,
      BUSY: 0,
      CANCEL: 0,
      CHANUNAVAIL: 0,
      CONGESTION: 0,
    };

    // Process result from cc_campaign_outgoing_reports
    result1.map((item) => {
      switch (item.callStatus) {
        case "3": // Answered
          summary.ANSWERED++;
          break;
        case "2": // No Answer
          summary.NOANSWER++;
          break;
        case "5": // Busy
          summary.BUSY++;
          break;
        case "6": // Cancel
          summary.CANCEL++;
          break;
        case "7": // Channel Unavailable
          summary.CHANUNAVAIL++;
          break;
        case "8": // Congestion
          summary.CONGESTION++;
          break;
        default:
          // Handle unexpected callStatus values if necessary
          break;
      }
    });

    // Combine the counts from both sources
    const combinedSummary = {
      answered: statusCounts.ANSWERED + summary.ANSWERED,
      noanswer: statusCounts.NOANSWER + summary.NOANSWER,
      busy: statusCounts.BUSY + summary.BUSY,
      cancel: statusCounts.CANCEL + summary.CANCEL,
      chanunavail: statusCounts.CHANUNAVAIL + summary.CHANUNAVAIL,
      congestion: statusCounts.CONGESTION + summary.CONGESTION,
    };

    res.locals.result = combinedSummary;
    next();
  } catch (error) {
    console.error("Error processing agent status counts:", error);
    res.locals.result = "err";
    next();
  }
}
async function agent_dashboard_agent_activity(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
    var End = `${yyyy}-${mm}-${dd} 23:59:59`;

    let agent_id = req.token.id; // Assuming agent_id is coming from the token

    // Query to sum duration (assuming it's a string, we convert it to an integer)
    let sql = `SELECT SUM(CAST(duration AS DECIMAL)) AS totalOutgoingDuration FROM cc_outgoing_reports WHERE user_id = '${agent_id}' and id_user ='${id_user}' AND date BETWEEN '${Start}' and '${End}'`;
    const [result] = await getConnection.query(sql);

    // Query to sum connected_duration (assuming it's a string, we convert it to an integer)
    let sql1 = `SELECT SUM(CAST(connected_duration AS DECIMAL)) AS totalConnectedDuration FROM incoming_reports WHERE user_id = '${agent_id}' and id_user ='${id_user}' AND call_start_time BETWEEN '${Start}' and '${End}'`;
    const [result1] = await getConnection.query(sql1);

    let sql2 = `SELECT SUM(CAST(connected_duration AS DECIMAL)) AS totalCampaignDuration FROM cc_campaign_call_summary WHERE user_id = '${agent_id}' and id_user ='${id_user}' AND createdAt BETWEEN '${Start}' and '${End}'`;
    const [result2] = await getConnection.query(sql2);

    var resultAvailabeTime;

    // Get the summed durations from the results
    const totalOutgoingDuration = result[0].totalOutgoingDuration || 0;
    const totalConnectedDuration = result1[0].totalConnectedDuration || 0;
    const totalCampaignDuration = result2[0].totalCampaignDuration || 0;

    // Calculate the sum of both durations
    const totalDurationCallTime =
      Number(totalOutgoingDuration) +
      Number(totalConnectedDuration) +
      Number(totalCampaignDuration);

    // var sqlAvailabeTime = `SELECT SUM(CAST(duration AS DECIMAL)) AS duration FROM user_sessions WHERE id_agent = '${agent_id}' and break_type = 0`;
    // var [resultAvailabeTime] = await getConnection.query(sqlAvailabeTime);
    var startDate = `SELECT startDate FROM user_activities WHERE startDate BETWEEN '${Start}' AND '${End}' and user_id = '${agent_id}' ORDER BY id DESC LIMIT 1`;
    var [startDateRes] = await getConnection.query(startDate);
    var sqll = `SELECT duration FROM user_sessions WHERE startDate BETWEEN '${Start}' AND '${End}' and user_id = '${agent_id}' and id_user = '${id_user}' `;
    var [totalResult] = await getConnection.query(sqll);
    console.log(
      "totalResult=============================================================================",
      totalResult
    );
    console.log(
      "startDateRes=============================================================================",
      startDateRes
    );
    if (totalResult.length != 0) {
      var timeDataSeconds = totalResult.map((obj) => {
        var hours = parseInt(obj.duration.split(":")[0]);
        var minutes = parseInt(obj.duration.split(":")[1]);
        var seconds = parseInt(obj.duration.split(":")[2]);
        return hours * 3600 + minutes * 60 + seconds;
      });
      var calculatedSeconds = timeDataSeconds.reduce(
        (acc, val) => acc + val,
        0
      );
      if (startDateRes.length != 0) {
        var date1 = new Date(startDateRes[0].startDate);
        var date2 = new Date();
        // if (date2 < date1) {
        //     date2 = date1
        //     console.log("current time1 : ", date2)
        // }
        var diff = date2 - date1;
        var lastLoginseconds = diff / 1000;

        var totalSeconds = calculatedSeconds + lastLoginseconds;
        totalSeconds = totalSeconds.toFixed(0);
        lastLoginseconds = lastLoginseconds.toFixed(0);
        // const epochTimeMs = (totalSeconds + Math.floor(Date.now() / 1000)) * 1000;
        resultAvailabeTime = totalSeconds;
      } else {
        resultAvailabeTime = 0;
      }
    } else {
      if (startDateRes.length != 0) {
        var date1 = new Date(startDateRes[0].startDate);
        // var date1 = new Date("2025-03-26 09:45:54")
        var date2 = new Date();
        // var date2 = new Date("2025-03-26 09:44:54")
        // if (date2 < date1) {
        //     date2 = date1
        //     console.log("current time1 : ", date2)
        // }
        var diff = date2 - date1;
        var seconds = diff / 1000;
        var sec = seconds.toFixed(0);
        // var firstlogin = Math.floor(date1.getTime()/1000.0)
        // var miliseconds = firstlogin * 1000;
        resultAvailabeTime = sec;
      } else {
        resultAvailabeTime = 0;
      }
    }

    var sqlBreakDurations = `SELECT break_name, SUM(CAST(duration AS SIGNED)) AS total_duration ,break_type FROM user_sessions WHERE startDate BETWEEN '${Start}' AND '${End}' and user_id = '${agent_id}' AND NOT (break_name = "Available" AND break_type = 0)  and id_user ='${id_user}' GROUP BY break_name`;
    var [resultBreakDurations] = await getConnection.query(sqlBreakDurations);

    resultBreakDurations = resultBreakDurations.map((row) => ({
      break_name: row.break_name,
      total_duration: parseInt(row.total_duration, 10),
      break_type: row.break_type,
    }));

    if (resultBreakDurations.length != 0) {
      var allResultBreakDurations = resultBreakDurations.reduce(
        (total, current) => total + current.total_duration,
        0
      );
    } else {
      var allResultBreakDurations = 0;
    }
    console.log(
      "resultAvailabeTime=============================================================================",
      resultAvailabeTime
    );

    var totalWorkingDuration = totalDurationCallTime + allResultBreakDurations;
    if (resultAvailabeTime > totalWorkingDuration) {
      var totalIdleTime = resultAvailabeTime - totalWorkingDuration;
    } else {
      var totalIdleTime = totalWorkingDuration - resultAvailabeTime;
    }
    res.locals.result = {
      totalDurationCallTime,
      totalAvailableTime: resultAvailabeTime,
      resultBreakDurations,
      totalIdleTime,
    };
    next();
  } catch (error) {
    console.error("Error updating record:", error);
    res.locals.result = "err";
    next();
  }
}
async function agent_dashboard_call_count(req, res, next) {
  try {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
    var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    var sqlCountIncoming = `select count(id) as count from incoming_reports where call_start_time between '${Start}' and '${End}' and user_id = '${req.token.id}' `;
    var [incomingCount] = await getConnection.query(sqlCountIncoming);

    let callflowCondition = "";
    if (req.token.show_misscall_to_all_agents == 0) {
      // 1. Get smart groups where missed calls should be shown
      const smartGroupQuery = `
        SELECT sg.id
        FROM smart_group sg
        INNER JOIN smart_group_agents sga 
          ON sga.smart_groupId = sg.id
        WHERE sg.show_missedcall_to = 3 
          AND sga.user_id = :userId
      `;

      const [smartGroups] = await getConnection.query(smartGroupQuery, {
        replacements: { userId: req.token.id },
      });

      if (smartGroups.length > 0) {
        // 2. Extract smart group IDs
        const smartGroupIds = smartGroups.map((row) => row.id);

        // 3. Find callflow IDs for those smart groups
        const callFlowQuery = `
          SELECT DISTINCT cf.id AS call_flow_id
          FROM call_flow_call_group cfcg
          INNER JOIN call_flow_module cfm 
            ON cfm.id = cfcg.call_flow_module_id
          INNER JOIN call_flow cf 
            ON cf.id = cfm.call_flow_id
          WHERE cfcg.call_grp_id IN (:groupIds)
        `;

        const callFlowIds = await getConnection.query(callFlowQuery, {
          replacements: { groupIds: smartGroupIds },
          type: getConnection.QueryTypes.SELECT,
        });

        // 4. Prepare destination condition only if we got IDs
        if (callFlowIds.length > 0) {
          const callFlowIdList = callFlowIds.map((item) => item.call_flow_id);
          callflowCondition = `
          OR (
            (appId IN (${callFlowIdList.join(",")}) 
            AND app = "callflow" AND id_user = ${req.token.id_user} AND connected_duration = 0) OR (appId IN (${smartGroupIds}) AND app = "smartgroup" AND connected_duration = 0)
          )
        `;
        }
      }
    }
    
    var sqlCountIncomingMissed = `
      SELECT COUNT(id) AS count
      FROM incoming_reports
      WHERE call_start_time BETWEEN '${Start}' AND '${End}'
        AND (
          user_id = '${req.token.id}'
          ${callflowCondition}
        )
        AND connected_duration = 0
    `;
    
    var [IncomingMissedCount] = await getConnection.query(
      sqlCountIncomingMissed
    );
    var sqlCountOutgoing = `select duration,status from cc_outgoing_reports where date between '${Start}' and '${End}' and user_id = '${req.token.id}'`;
    var [outgoingCount] = await getConnection.query(sqlCountOutgoing);
    var campaignCount = `SELECT duration,callStatus FROM cc_campaign_outgoing_reports where createdAt between '${Start}' and '${End}' and user_id = '${req.token.id}'`;
    var [campaign_outgoingCount] = await getConnection.query(campaignCount);
    var totalOutgoingCount = outgoingCount.length;
    var outgoingConnected = 0;
    if (outgoingCount.length != 0) {
      outgoingCount.map(async (outgoingData) => {
        if (outgoingData.duration != 0 && outgoingData.status == "ANSWER") {
          outgoingConnected += 1;
        }
      });
    }
    if (campaign_outgoingCount.length != 0) {
      totalOutgoingCount += campaign_outgoingCount.length;
      campaign_outgoingCount.map(async (outgoingData) => {
        if (outgoingData.duration != 0 && outgoingData.callStatus == "ANSWER") {
          outgoingConnected += 1;
        }
      });
    }
    var result = {
      totalOutgoing: totalOutgoingCount,
      answeredOutgoing: outgoingConnected,
      totalIncoming: incomingCount[0].count,
      missedCall: IncomingMissedCount[0].count,
    };
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function add_did_grouping(req, res, next) {
  var data = req.body;
  var did_ids = data.did_ids;
  var id_user = req.token.id_user;
  var id_department = req.token.id_department;

  const bcrypt = require("bcrypt");
  const saltRounds = 10;
  var hashedPassword = await bcrypt.hash(data.password, saltRounds);

  var checkingSql = `select did_grouping_name,id from did_grouping where did_grouping_name = '${data.group_name}' and id_user = ${id_user}`;
  var [existingChecking] = await getConnection.query(checkingSql);
  if (existingChecking.length == 0) {
    var result = await didGroupingModel.create({
      did_grouping_name: data.group_name,
      id_user,
      id_department,
      password: hashedPassword,
      createdAt: new Date(),
    });
    var grouping_id = result.id;
    var did = [];
    if (did_ids) {
      var map_result = Promise.all(
        did_ids.map(async (data) => {
          var obj = {
            grouping_id: grouping_id,
            did_id: data,
          };
          did.push(obj);
          return data;
        })
      );
      var output = await map_result;
    }
    const did_group = await didGroupSettingsModel.bulkCreate(did);
    res.locals.result = result;
    next();
  } else {
    var result = "existing";
    res.locals.result = result;
    next();
  }
}
async function update_did_grouping(req, res, next) {
  try {
    var id = req.query.id;
    var data = req.body;
    var did_ids = data.did_ids;
    let datas = {};

    if (data.password != undefined) {
      const bcrypt = require("bcrypt");
      const saltRounds = 10;
      var hashedPassword = await bcrypt.hash(data.password, saltRounds);
      datas.password = hashedPassword;
    }
    var checkingSql = `select did_grouping_name,id from did_grouping where did_grouping_name = '${data.group_name}' and id != '${id}'`;
    var [existingChecking] = await getConnection.query(checkingSql);
    if (existingChecking.length == 0) {
      if (data.group_name != undefined) {
        datas.did_grouping_name = data.group_name;
      }

      // var result = await didGroupingModel.update({did_grouping_name:data.group_name,password:hashedPassword}, { where: { id: id } });
      var result = await didGroupingModel.update(datas, { where: { id: id } });
      var sql1 = `DELETE FROM did_group_setting WHERE grouping_id = '${id}'`;
      var [result1] = await sequelize.query(sql1);
      var did = [];
      if (did_ids) {
        var map_result = Promise.all(
          did_ids.map(async (data) => {
            var obj = {
              grouping_id: id,
              did_id: data,
            };
            did.push(obj);
            return data;
          })
        );
        var output = await map_result;
      }
      const did_group = await didGroupSettingsModel.bulkCreate(did);
      res.locals.result = result;
      next();
    } else {
      var result = "existing";
      res.locals.result = result;
      next();
    }
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_did_grouping(req, res, next) {
  try {
    const id = req.query.id;
    var sql = `DELETE FROM did_grouping WHERE id = '${id}'`;
    var [result] = await sequelize.query(sql);
    var sql1 = `DELETE FROM did_group_setting WHERE grouping_id = '${id}'`;
    var [result1] = await sequelize.query(sql1);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_all_did_grouping(req, res, next) {
  try {
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    var departement_id = req.query.id_department;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var name = req.query.name;
    var sql = `SELECT did_grouping.id,did_grouping.did_grouping_name,did_grouping.id_user,did_grouping.id_department,did_grouping.createdAt, departments.name AS department FROM did_grouping LEFT JOIN departments ON did_grouping.id_department = departments.id WHERE did_grouping.id_user = '${id_user}'`;
    var sqlCount = `select count(id) as count from did_grouping where did_grouping.id_user = '${id_user}' `;

    if (departement_id != undefined) {
      sql += `and id_department = ${departement_id} `;
    } else if (isSubAdmin != undefined) {
      sql += `and id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sql += `and id_department = ${req.token.id} `;
    }
    if (name != undefined) {
      sql += `and did_grouping_name like '%${name}%' `;
      sqlCount += `and did_grouping_name like '%${name}%' `;
    }
    sql += `order by did_grouping.id desc`;
    var [result] = await getConnection.query(sql);
    var [count] = await getConnection.query(sqlCount);
    res.locals.result = result;
    res.locals.total = count[0].count;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_did_grouping_by_id(req, res, next) {
  try {
    var id = req.query.id;
    var sql = `select * from did_grouping where id = ${id}`;
    var [did_grouping] = await getConnection.query(sql);
    if (did_grouping.length != 0) {
      var group_setting_sql = `select * from did_group_setting where grouping_id = ${id}`;
      var [group_setting] = await getConnection.query(group_setting_sql);
      if (group_setting.length != 0) {
        var did = group_setting.map((item) => item.did_id);
      } else {
        var did = [];
      }
      var result = [
        { group_name: did_grouping[0].did_grouping_name, did_ids: did },
      ];
    } else {
      var result = [];
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_all_did_grouping_selectBox(req, res, next) {
  try {
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;
    var departement_id = req.query.id_department;
    var sql = `select * from did_grouping where id_user = ${id_user} `;
    if (departement_id != undefined) {
      sql += `and id_department = ${departement_id}`;
    } else if (isDept == 1) {
      sql += `and id_department = ${req.token.id}`;
    }
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function add_did_group_setting(req, res, next) {
  var data = req.body;
  const did_group = await didGroupSettingsModel.create({
    grouping_id: data.grouping_id,
    did_id: did_id,
  });
  res.locals.result = result;
  next();
}
async function update_did_group_setting(req, res, next) {
  try {
    var data = req.body;
    var id = req.query.id;
    var result = await didGroupSettingsModel.update(
      { grouping_id: data.grouping_id, did_id: did_id },
      { where: { id: id } }
    );
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_did_group_setting(req, res, next) {
  try {
    var id = req.query.id;
    var sql1 = `DELETE FROM did_group_setting WHERE id = '${id}'`;
    var [result1] = await sequelize.query(sql1);
    res.locals.result = result1;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_all_did_group_setting(req, res, next) {
  try {
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var sql = `select * from did_group_setting limit ${skip},${limit}`;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_did_group_setting_by_id(req, res, next) {
  try {
    var id = req.query.id;
    var group_setting_sql = `select * from did_group_setting where id = ${id}`;
    var [group_setting] = await getConnection.query(group_setting_sql);
    res.locals.result = group_setting;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_did_group_setting_by_grouping(req, res, next) {
  try {
    var id = req.query.id;
    var group_setting_sql = `select * from did_group_setting where grouping_id = ${id}`;
    var [group_setting] = await getConnection.query(group_setting_sql);
    res.locals.result = group_setting;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function add_blacklist(req, res, next) {
  var data = req.body;
  var isSubAdmin = req.token.isSubAdmin;
  var isAdmin = req.token.isAdmin;
  var isDept = req.token.isDept;
  if (isSubAdmin == 1) {
    var id_user = req.token.id_user;
    var id_department = req.body.id_department;
  }
  if (isDept == 1) {
    var id_user = req.token.id_user;
    var id_department = req.token.id;
  }
  if (isAdmin == 1) {
    var id_user = req.token.id;
    var id_department = req.token.id_department;
  }
  var sql = `SELECT name FROM cc_blacklist where name = '${data.blacklistName}'`;
  var [existChecking] = await getConnection.query(sql);
  if (existChecking.length == 0) {
    var obj = {
      id_user: id_user,
      id_department: id_department,
      name: data.blacklistName,
    };
    const blacklist = await ccBlacklistModel.create(obj);
    var blacklistId = blacklist.dataValues.id;
    var contactArr = [];
    var phn = [];
    var contacts = data.blacklistContacts;
    if (contacts.length != 0) {
      contacts.map(async (data) => {
        phn.push(data.phoneNo);
        contactArr.push({ phone_no: data.phoneNo, blacklist_id: blacklistId });
      });
    }
    var contactExistChecksql = `SELECT blacklist_id,phone_no FROM cc_blacklist_contacts where phone_no in(${phn}) and blacklist_id = '${blacklistId}'`;
    var [contactExistChecking] = await getConnection.query(
      contactExistChecksql
    );
    if (contactExistChecking.length == 0) {
      const BlacklistContact = await ccBlacklistContactsModel.bulkCreate(
        contactArr
      );
      res.locals.result = blacklist;
    } else {
      var msg = "phn_no existing";
      res.locals.result = msg;
      res.locals.exist = contactExistChecking;
    }
    next();
  } else {
    var msg = "existing";
    res.locals.result = msg;
    next();
  }
}
async function update_blacklist(req, res, next) {
  try {
    var data = req.body;
    var id = req.query.id;
    var sql = `SELECT name FROM cc_blacklist where name = '${data.blacklistName}' and id != '${id}' `;
    var [existChecking] = await getConnection.query(sql);
    if (existChecking.length == 0) {
      const blacklist = await ccBlacklistModel.update(
        { name: data.blacklistName },
        { where: { id: id } }
      );
      var blacklistId = id;
      var contactArr = [];
      var phn = [];
      var contacts = data.blacklistContacts;
      if (contacts.length != 0) {
        contacts.map(async (data) => {
          phn.push(data.phoneNo);
          contactArr.push({
            phone_no: data.phoneNo,
            blacklist_id: blacklistId,
            calltype: data.type,
          });
        });
      }
      var contactExistChecksql = `SELECT blacklist_id,phone_no FROM cc_blacklist_contacts where phone_no in(${phn}) and blacklist_id = '${id}'`;
      var [contactExistChecking] = await getConnection.query(
        contactExistChecksql
      );
      if (contactExistChecking.length == 0) {
        const BlacklistContact = await ccBlacklistContactsModel.bulkCreate(
          contactArr
        );
        var result = { id: id };
        res.locals.result = result;
      } else {
        var msg = "phn_no existing";
        res.locals.result = msg;
        res.locals.exist = contactExistChecking;
      }
      next();
    } else {
      var msg = "existing";
      res.locals.result = msg;
      next();
    }
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_blacklist(req, res, next) {
  try {
    var id = req.query.id;
    // }
    var sql1 = `DELETE FROM cc_blacklist WHERE id = '${id}'`;
    var [result1] = await sequelize.query(sql1);
    var sql2 = `DELETE FROM cc_blacklist_contacts WHERE blacklist_id = '${id}'`;
    var [result2] = await sequelize.query(sql2);
    res.locals.result = result1;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_all_blacklist(req, res, next) {
  try {
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var name = req.query.name;
    var sql = `SELECT cc_blacklist.id,cc_blacklist.name,COUNT(DISTINCT cc_blacklist_contacts.id) AS contacts_count FROM cc_blacklist LEFT JOIN  cc_blacklist_contacts ON cc_blacklist.id = cc_blacklist_contacts.blacklist_id where cc_blacklist.id_user = ${id_user} `;
    var countSql = `SELECT COUNT(DISTINCT cc_blacklist.id) AS total FROM cc_blacklist LEFT JOIN cc_blacklist_contacts ON cc_blacklist.id = cc_blacklist_contacts.blacklist_id where cc_blacklist.id_user = ${id_user} `;
    if (name != undefined) {
      sql += ` and cc_blacklist.name like '%${name}%' `;
      countSql += ` and cc_blacklist.name like '%${name}%' `;
    }
    sql += `GROUP BY cc_blacklist.id order by cc_blacklist.id desc limit ${skip},${limit} `;
    var [result] = await getConnection.query(sql);
    var [count] = await getConnection.query(countSql);
    res.locals.result = result;
    res.locals.total = count[0].total;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_blacklist_by_id(req, res, next) {
  try {
    var id = req.query.id;
    var blacklistSql = `select * from cc_blacklist where id = ${id}`;
    var [blacklist] = await getConnection.query(blacklistSql);
    var blacklistContactsSql = `select * from cc_blacklist_contacts where blacklist_id = ${id}`;
    var [blacklistContacts] = await getConnection.query(blacklistContactsSql);
    var blacklistDidSql = `select * from did_blacklist where blacklist_id = ${id}`;
    var [blacklistDid] = await getConnection.query(blacklistDidSql);
    var didArr = [];
    var contactsArr = [];
    if (blacklist.length != 0) {
      if (blacklistDid.length != 0) {
        blacklistDid.map(async (data) => {
          didArr.push(data.did_id);
        });
      }
      if (blacklistContacts.length != 0) {
        blacklistContacts.map(async (data) => {
          contactsArr.push({ phoneNo: data.phone_no, type: data.calltype });
        });
      }
      var obj = {
        blacklistName: blacklist[0].name,
        blacklistDid: didArr,
        blacklistContacts: contactsArr,
      };
    } else {
      var obj = {};
    }
    res.locals.result = obj;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_blacklist_selectbox(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var sql = `SELECT cc_blacklist.id,cc_blacklist.name FROM cc_blacklist where cc_blacklist.id_user = ${id_user} `;
    sql += `order by cc_blacklist.id desc `;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_blacklist_by_did(req, res, next) {
  try {
    var did = req.query.id;
    var incoming_blacklist_id = req.body.incoming_blacklist_id;
    var outgoing_blacklist_id = req.body.outgoing_blacklist_id;
    if (
      incoming_blacklist_id == undefined &&
      outgoing_blacklist_id == undefined
    ) {
      var didUpdateSql1 = `UPDATE did SET incoming_blacklist_id = '${incoming_blacklist_id}',outgoing_blacklist_id = '${outgoing_blacklist_id}' WHERE id = '${did}'`;
    } else if (outgoing_blacklist_id != undefined) {
      var didUpdateSql1 = `UPDATE did SET outgoing_blacklist_id = '${outgoing_blacklist_id}' WHERE id = '${did}'`;
    } else if (incoming_blacklist_id != undefined) {
      var didUpdateSql1 = `UPDATE did SET incoming_blacklist_id = '${incoming_blacklist_id}' WHERE id = '${did}'`;
    }
    var [didUpdate1] = await sequelize.query(didUpdateSql1);
    res.locals.result = didUpdate1;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_blacklist_contacts(req, res, next) {
  try {
    var id = req.query.id;
    var phone_no = req.query.phone_no;
    var sql2 = `DELETE FROM cc_blacklist_contacts WHERE blacklist_id = '${id}' and phone_no = '${phone_no}'`;
    var [result2] = await sequelize.query(sql2);
    res.locals.result = result2;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_by_blacklist_contacts(req, res, next) {
  try {
    var id = req.query.id;
    var phone_no = req.query.phone_no;
    var blacklistContactsSql = `select * from cc_blacklist_contacts where blacklist_id = ${id} and phone_no = '${phone_no}'`;
    var [blacklistContacts] = await getConnection.query(blacklistContactsSql);
    res.locals.result = blacklistContacts;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function update_blacklist_contact(req, res, next) {
  try {
    var data = req.body;
    var id = req.query.id;
    var sql = `UPDATE cc_blacklist_contacts SET phone_no = '${data.edited_phone_no}' WHERE blacklist_id = '${id}' and phone_no = '${data.phone_no}' `;
    var [result] = await sequelize.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function old_incoming_report(req, res, next) {
  try {
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var agentId = req.query.user_id;
    var status = req.query.status;
    var didNumber = req.query.callerid;
    var sourceNumber = req.query.sourceNumber;
    var fromDuration = req.query.fromDuration;
    var toDuration = req.query.toDuration;
    var fromTime = req.query.fromTime;
    var toTime = req.query.toTime;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var app = req.query.application;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var department_id = req.query.department_id;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var sql = `SELECT callreports.id,callreports.dtmf_sequence as dtmfSeq,callreports.date as callStartTime, callreports.source as sourceNumber, callreports.destination as didNumber, callreports.connected_agent as answeredAgent, callreports.connected_duration as totalDuration, callreports.connected_duration as answeredDuration,callreports.date,callreports.status,`;
    sql += ` callreports.cr_file as callRecordFile, callreports.app as application, callreports.uniqueid as callUniqueId, transfer_reports.tempValue, transfer_reports.destination as transferDestination, transfer_reports.duration as transferDuration, transfer_reports.recordStatus as transferRecordStatus, `;
    sql += `transfer_reports.recordFile as transferRecordFile,transfer_reports.transferType, departments.name as deptName,CONCAT(user.first_name, ' ', user.last_name) as agentName,user_settings.extNumber, CASE WHEN callreports.app = 'user' THEN NULL WHEN callreports.app = 'smartgroup' THEN smart_group.name WHEN callreports.app = 'callflow' THEN call_flow.name END as appName FROM callreports LEFT JOIN transfer_reports ON callreports.uniqueid=transfer_reports.callUniqueId LEFT JOIN departments ON callreports.id_department=departments.id LEFT JOIN user ON user.id = callreports.connected_agent_id LEFT JOIN user_settings ON user_settings.user_id = callreports.connected_agent_id  LEFT JOIN smart_group ON callreports.smart_group_id = smart_group.id LEFT JOIN call_flow ON callreports.smart_group_id = call_flow.id WHERE callreports.date BETWEEN '${Start}' AND '${End}' AND callreports.id_user='${id_user}' `;
    var sqlCount = `SELECT count(callreports.id) as total FROM callreports LEFT JOIN transfer_reports ON callreports.uniqueid=transfer_reports.callUniqueId LEFT JOIN departments ON callreports.id_department=departments.id LEFT JOIN user ON user.id = callreports.connected_agent_id LEFT JOIN user_settings ON user_settings.user_id = callreports.connected_agent_id WHERE callreports.date BETWEEN '${Start}' AND '${End}' AND callreports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      sql += `AND callreports.id_department in (${id_department}) `;
      sqlCount += `AND callreports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND callreports.id_department='${req.token.id}' `;
      sqlCount += `AND callreports.id_department='${req.token.id}' `;
    } else if (isAgent == 1) {
      sql += `AND callreports.id_department='${id_department}' `;
      sqlCount += `AND callreports.id_department='${id_department}' `;
    }
    if (agentId != undefined) {
      sql += `and callreports.connected_agent_id = '${agentId}' `;
      sqlCount += `and callreports.connected_agent_id = '${agentId}' `;
    }
    if (status != undefined) {
      sql += `AND callreports.status = '${status}' `;
      sqlCount += `AND callreports.status = '${status}' `;
    }
    if (didNumber != undefined) {
      sql += `AND callreports.destination like "%${didNumber}%" `;
      sqlCount += `AND callreports.destination like "%${didNumber}%" `;
    }
    if (app != undefined) {
      sql += `AND callreports.app = '${app}' `;
      sqlCount += `AND callreports.app = '${app}' `;
    }
    if (sourceNumber != undefined) {
      sql += `AND (callreports.source like "%${sourceNumber}%" OR callreports.source like "%91${sourceNumber}%" OR callreports.source like "%0${sourceNumber}%") `;
      sqlCount += `AND callreports.source like "%${sourceNumber}%" `;
    }
    if (fromDuration != undefined && toDuration != undefined) {
      function timeToSeconds(timeString) {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
      }
      var fromDur = timeToSeconds(req.query.fromDuration);
      var toDur = timeToSeconds(req.query.toDuration);
      sqlCount += `and callreports.connecetd_duration between ${fromDur} and ${toDur} `;
      sql += `and callreports.connecetd_duration between ${fromDur} and ${toDur} `;
    }
    if (fromTime != undefined && toTime != undefined) {
      sqlCount += `and TIME(callreports.date) between '${fromTime}' and '${toTime}' `;
      sql += `and TIME(callreports.date) between '${fromTime}' and '${toTime}' `;
    }
    if (department_id != undefined) {
      sql += `AND callreports.id_department='${department_id}' `;
      sqlCount += `AND callreports.id_department='${department_id}' `;
    }
    sql += `ORDER BY callreports.date DESC limit ${skip},${limit}`;
    sqlCount += `GROUP BY  callreports.id `;
    var [result] = await getConnection.query(sql);
    var [count] = await getConnection.query(sqlCount);
    if (req.token.phone_number_masking == 1) {
      var map_result = Promise.all(
        result.map(async (value) => {
          var sourceNo = await string_encode(value.sourceNumber);
          if (sourceNo) {
            value.sourceNumber = sourceNo;
          }
          return value;
          // value.sourceNumber = await string_encode(value.sourceNumber);
        })
      );
      var output = await map_result;

      res.locals.result = result;
      res.locals.total = count.length;
      next();
    } else {
      res.locals.result = result;
      res.locals.total = count.length;
      next();
    }
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function old_outgoing_report(req, res, next) {
  try {
    var i = 1;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var agent_id = req.query.user_id;
    var agentFlag = req.query.agentFlag;
    var destination = req.query.destination;
    var department_id = req.query.department_id;
    var callerid = req.query.callerid;
    var status = req.query.status;
    var fromDuration = req.query.fromDuration;
    var toDuration = req.query.toDuration;
    var fromTime = req.query.fromTime;
    var toTime = req.query.toTime;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var search = [];
    var sqlCount = `SELECT count(id) as outgoingcall FROM outgoing_reports  where date between '${Start}' and '${End}' and outgoing_reports.id_user='${id_user}' `;
    var sql = `SELECT outgoing_reports.id,outgoing_reports.date,outgoing_reports.uniqueid, outgoing_reports.destination,outgoing_reports.callerid, outgoing_reports.duration,outgoing_reports.status as callStatus,outgoing_reports.cr_file as callRecord,outgoing_reports.id_department as deptId,departments.name as departmentName,CONCAT(user.first_name, ' ', user.last_name) as agentName,user_settings.extNumber as agent  FROM outgoing_reports `;
    sql += `LEFT JOIN departments ON outgoing_reports.id_department = departments.id LEFT JOIN user on outgoing_reports.user_id = user.id LEFT JOIN user_settings on user_settings.user_id = outgoing_reports.user_id where outgoing_reports.date between '${Start}' and '${End}' and outgoing_reports.id_user='${id_user}' `;
    if (isSubAdmin == 1) {
      sql += `AND outgoing_reports.id_department in (${id_department}) `;
      sqlCount += `AND outgoing_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND outgoing_reports.id_department='${req.token.id}' `;
      sqlCount += `AND outgoing_reports.id_department='${req.token.id}' `;
    } else if (isAgent == 1) {
      sql += `AND outgoing_reports.id_department='${id_department}' `;
      sqlCount += `AND outgoing_reports.id_department='${id_department}' `;
    }
    if (agent_id != undefined) {
      sqlCount += `and outgoing_reports.user_id = '${agent_id}' `;
      sql += `and outgoing_reports.user_id = '${agent_id}' `;
    }
    if (destination != undefined) {
      sqlCount += `and outgoing_reports.destination like '%${destination}%' `;
      sql += `and outgoing_reports.destination like '%${destination}%' `;
    }
    if (department_id != undefined) {
      sqlCount += `and outgoing_reports.id_department like '%${department_id}%' `;
      sql += `and outgoing_reports.id_department like '%${department_id}%' `;
    }
    if (callerid != undefined) {
      sqlCount += `and (outgoing_reports.callerid = '${callerid}' or  outgoing_reports.callerid = '+${callerid}' )`;
      sql += `and (outgoing_reports.callerid = '${callerid}' or outgoing_reports.callerid = '+${callerid}' )`;
    }
    if (status != undefined) {
      if (status == "NO ANSWER") {
        sqlCount += `and (outgoing_reports.status like '%NO ANSWER%' OR outgoing_reports.status LIKE '%NOANSWER%') `;
        sql += `and (outgoing_reports.status like '%NO ANSWER%' OR outgoing_reports.status LIKE '%NOANSWER%') `;
      } else if (status == "ANSWERED") {
        sqlCount += `AND (outgoing_reports.status = '${status}%' OR outgoing_reports.status = 'ANSWER') `;
        sql += `AND (outgoing_reports.status = '${status}' OR outgoing_reports.status = 'ANSWER')`;
      } else {
        sqlCount += `and outgoing_reports.status like '%${status}%' `;
        sql += `and outgoing_reports.status like '%${status}%' `;
      }
    }
    if (fromDuration != undefined && toDuration != undefined) {
      function timeToSeconds(timeString) {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
      }
      var fromDur = timeToSeconds(req.query.fromDuration);
      var toDur = timeToSeconds(req.query.toDuration);
      sqlCount += `and duration between ${fromDur} and ${toDur} `;
      sql += `and duration between ${fromDur} and ${toDur} `;
    }
    if (fromTime != undefined && toTime != undefined) {
      sqlCount += `and TIME(date ) between '${fromTime}' and '${toTime}' `;
      sql += `and TIME(date ) between '${fromTime}' and '${toTime}' `;
    }
    sqlCount += `GROUP BY id `;
    sql += ` order by id desc limit ${skip},${limit} `;
    var [result] = await getConnection.query(sql, { bind: search });
    var [count] = await getConnection.query(sqlCount, { bind: search });
    if (req.token.phone_number_masking == 1) {
      var map_result = Promise.all(
        result.map(async (value) => {
          var dest = await string_encode(value.destination);
          if (dest) {
            value.destination = dest;
          }
          // value.destination = await string_encode(value.destination);
          return value;
        })
      );
      var output = await map_result;
      res.locals.result = output;
    } else {
      res.locals.result = result;
    }
    res.locals.count = count.length;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_old_unique_misscall_report(req, res, next) {
  try {
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    var agentId = req.query.agentId;
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var sourceNumber = req.query.sourceNumber;
    var didNumber = req.query.didnumber;
    var status = req.query.missed_status;
    var department_id = req.query.department_id;
    var id_department = req.token.id_department;
    var type = req.token.type;
    var todaydate = new Date();
    todaydate.setDate(todaydate.getDate() - 14);
    var DD = todaydate.getDate();
    var MM = todaydate.getMonth() + 1;
    var YYYY = todaydate.getFullYear();
    var Start = `${YYYY}-${MM}-${DD} 00:00:00`;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else {
      var Start = `${YYYY}-${MM}-${DD} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    var search = [];
    var sqlCount = `SELECT count(id) as misscall FROM missed_reports WHERE missed_reports.id_user='${id_user}' `;
    var sql = `SELECT id,firstCallStartTime,voice_mail, latestCallStartTime as date, sourceNumber, didNumber,agents_list as lastAgent, connectedDuration, agentStatus,application,callUniqueId,dtmfSeq_name as dtmfSeq,missed_count,callback_count, missed_status,type FROM missed_reports WHERE missed_reports.id_user='${id_user}' `;

    if (isSubAdmin == 1) {
      sql += `and id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `and id_department = ${req.token.id} `;
    }

    if (sourceNumber != undefined) {
      sqlCount += `and sourceNumber like '%${sourceNumber}%' `;
      sql += `and sourceNumber like '%${sourceNumber}%' `;
    }
    if (didNumber != undefined) {
      sqlCount += `and didNumber like '%${didNumber}%' `;
      sql += `and didNumber like '%${didNumber}%' `;
    }
    if (status != undefined) {
      sqlCount += `and missed_status like '%${status}%' `;
      sql += `and missed_status like '%${status}%' `;
    }
    if (agentId != undefined) {
      sql += `AND SUBSTRING_INDEX(agents_list, ',', 1) = '${agentId}' `;
      sqlCount += `AND SUBSTRING_INDEX(agents_list, ',', 1) = '${agentId}' `;
    }
    if (department_id != undefined) {
      sqlCount += `and id_department like '%${department_id}%' `;
      sql += `and id_department like '%${department_id}%' `;
    }
    sqlCount += `AND latestCallStartTime BETWEEN '${Start}' AND '${End}' GROUP BY id `;
    sql += `AND latestCallStartTime BETWEEN '${Start}' AND '${End}' ORDER BY latestCallStartTime desc limit ${skip},${limit} `;
    if (process.env.PROJECT_NAME == "Xylem") {
      var [result] = await getConnection.query(sql, { bind: search });
      var [count] = await getConnection.query(sqlCount, { bind: search });
    } else {
      var [result] = await getConnection.query(sql, { bind: search });
      var [count] = await getConnection.query(sqlCount, { bind: search });
    }
    if (req.token.phone_number_masking == 1) {
      var map_result = Promise.all(
        result.map(async (value) => {
          var source_number = await string_encode(value.sourceNumber);
          if (source_number) {
            value.sourceNumber = source_number;
          }
          // value.sourceNumber = await string_encode(value.sourceNumber);
          return value;
        })
      );
      var output = await map_result;
      res.locals.result = output;
      res.locals.count = count.length;
    } else {
      res.locals.result = result;
      res.locals.count = count.length;
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function add_unique_missedcall_call_log(req, res, next) {
  try {
    const data = req.body;
    const result = await uniqueMissedcallModelLog.create(data);
    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function get_unique_missedcall_call_log(req, res, next) {
  try {
    const result = await uniqueMissedcallModelLog.findAll();
    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function get_all_customer_logs(req, res, next) {
  try {
    var id = req.token.id;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    mm = mm < 10 ? `0${mm}` : mm;
    dd = dd < 10 ? `0${dd}` : dd;
    var yyyy = today.getFullYear();
    var Start = `${yyyy}-${mm}-${dd}`;
    var sql = `SELECT useragent,activate,date,createdAt,ipaddress FROM login_logs WHERE id_user = '${id}' and activate = 1 order by id desc`;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function user_summary(req, res, next) {
  try {
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var agent = req.query.agentId;
    if (agent != undefined) {
      var agentArray = agent.split(",");
    }
    var date = new Date();
    // var dd = date.getDate();
    // var mm = (date.getMonth() + 1).toString().padStart(2, '0');
    var dd = date.getDate().toString().padStart(2, "0");
    var mm = (date.getMonth() + 1).toString().padStart(2, "0");
    var yyyy = date.getFullYear();
    var today = `${yyyy}-${mm}-${dd} `;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var department_id = req.query.department_id;
    var dateRangeFrom = `${yyyy}-${mm}-${dd} `;
    var dateRangeTo = `${yyyy}-${mm}-${dd} `;
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
      dateRangeFrom = fromDate;
      dateRangeTo = toDate;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
      dateRangeFrom = fromDate;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
      dateRangeTo = toDate;
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }
    // var sql = `SELECT agentQuery.id as agentId,CONCAT(agentQuery.first_name, ' ', agentQuery.last_name) AS name,extNumber as regNumber,username,departments.name as departmentName,GROUP_CONCAT(DISTINCT firstLoginsubquery.startDate ORDER BY firstLoginsubquery.startDate asc) as firstLoginTime,GROUP_CONCAT(DISTINCT logoutsubquery.startDate ORDER BY logoutsubquery.startDate asc) AS lastLogoutTime,GROUP_CONCAT(DISTINCT totalDurationsubquery.totalDuration,"_",totalDurationsubquery.date) as totalavailableDuration,GROUP_CONCAT(DISTINCT totalSpecialBreakDuration.duration,"_",totalSpecialBreakDuration.startDate,'_',totalSpecialBreakDuration.id_break) as totalSpecialBreakDuration  FROM user AS agentQuery JOIN user_settings ON user_settings.user_id = agentQuery.id LEFT JOIN user_live_data ON user_live_data.user_id = agentQuery.id `
    // if (agent != undefined) {
    //     sql = `SELECT agentQuery.id as agentId,CONCAT(agentQuery.first_name, ' ', agentQuery.last_name) AS name,extNumber as regNumber,departments.name as departmentName,GROUP_CONCAT(DISTINCT firstLoginsubquery.startDate) as firstLoginTime,GROUP_CONCAT(DISTINCT logoutsubquery.startDate) AS lastLogoutTime,GROUP_CONCAT(DISTINCT totalDurationsubquery.totalDuration,"_",totalDurationsubquery.date) as totalavailableDuration,GROUP_CONCAT(DISTINCT  totalSpecialBreakDuration.duration,"_",totalSpecialBreakDuration.startDate,'_',totalSpecialBreakDuration.id_break) as totalSpecialBreakDuration FROM user AS agentQuery JOIN user_settings ON user_settings.user_id = agentQuery.id LEFT JOIN user_live_data ON user_live_data.user_id = agentQuery.id `
    // }
    var sql = `SELECT agentQuery.id as agentId,CONCAT(agentQuery.first_name, ' ', agentQuery.last_name) AS name,extNumber as regNumber,username,departments.name as departmentName,GROUP_CONCAT(DISTINCT totalDurationsubquery.totalDuration,"_",totalDurationsubquery.date) as totalavailableDuration,GROUP_CONCAT(DISTINCT totalSpecialBreakDuration.duration,"_",totalSpecialBreakDuration.startDate,'_',totalSpecialBreakDuration.id_break) as totalSpecialBreakDuration  FROM user AS agentQuery JOIN user_settings ON user_settings.user_id = agentQuery.id LEFT JOIN user_live_data ON user_live_data.user_id = agentQuery.id `;
    if (agent != undefined) {
      sql = `SELECT agentQuery.id as agentId,CONCAT(agentQuery.first_name, ' ', agentQuery.last_name) AS name,extNumber as regNumber,departments.name as departmentName,GROUP_CONCAT(DISTINCT totalDurationsubquery.totalDuration,"_",totalDurationsubquery.date) as totalavailableDuration,GROUP_CONCAT(DISTINCT  totalSpecialBreakDuration.duration,"_",totalSpecialBreakDuration.startDate,'_',totalSpecialBreakDuration.id_break) as totalSpecialBreakDuration FROM user AS agentQuery JOIN user_settings ON user_settings.user_id = agentQuery.id LEFT JOIN user_live_data ON user_live_data.user_id = agentQuery.id `;
    }

    // var firstLogin = `LEFT JOIN (SELECT MIN(user_activities.startDate) AS startDate,user_id as id_agent FROM user_activities WHERE  user_activities.break_name = 'Available' and user_activities.startDate BETWEEN '${Start}' AND '${End}' AND user_activities.id_user = '${id_user}' GROUP BY user_id,DATE(user_activities.startDate)) AS firstLoginsubquery ON agentQuery.id = firstLoginsubquery.id_agent `
    // if (agent != undefined) {
    //     firstLogin += `and firstLoginsubquery.id_agent in(${agentArray}) `
    // }

    // var lastLogin = `LEFT JOIN (SELECT MAX(user_activities.startDate) AS startDate,user_id as id_agent FROM user_activities WHERE user_activities.break_name = 'Logout' and user_activities.startDate BETWEEN '${Start}' AND '${End}' AND user_activities.id_user = '${id_user}' GROUP BY user_id,DATE(user_activities.startDate) ) AS logoutsubquery ON agentQuery.id = logoutsubquery.id_agent `
    // if (agent != undefined) {
    //     lastLogin += `and logoutsubquery.id_agent in(${agentArray}) `
    // }

    var totalDuration = `LEFT JOIN (SELECT SEC_TO_TIME(SUM(TIME_TO_SEC(duration))) as totalDuration,DATE(user_sessions.startDate) as date,user_id as id_agent FROM user_sessions WHERE user_sessions.id_break='1' AND user_sessions.startDate BETWEEN '${Start}' AND '${End}' AND user_sessions.id_user = '${id_user}' GROUP BY user_id,DATE(user_sessions.startDate))  AS totalDurationsubquery ON agentQuery.id = totalDurationsubquery.id_agent `;
    if (agent != undefined) {
      totalDuration += `and totalDurationsubquery.id_agent in(${agentArray}) `;
    }

    var totalSpecialBreakDuration = `LEFT JOIN (SELECT SUM(time_to_sec(timediff(user_sessions.endDate, user_sessions.startDate))) as duration,user_sessions.startDate as startDate,id_break,user_id as id_agent FROM user_sessions WHERE user_sessions.startDate BETWEEN '${Start}' AND '${End}' AND user_sessions.id_break!='1' AND user_sessions.break_type='0' AND user_sessions.id_user = '${id_user}' GROUP BY user_id,DATE(user_sessions.startDate),id_break ) as totalSpecialBreakDuration ON agentQuery.id = totalSpecialBreakDuration.id_agent `;
    if (agent != undefined) {
      totalSpecialBreakDuration += `and totalSpecialBreakDuration.id_agent in(${agentArray}) `;
    }

    // sql += firstLogin
    // sql += lastLogin
    sql += totalDuration;
    sql += totalSpecialBreakDuration;
    //sql += `left JOIN departments on agentQuery.id_department = departments.id where agentQuery.id_user = '${id_user}' and is_agent = '1' `
    sql += `left JOIN departments on agentQuery.id_department = departments.id where agentQuery.id_user = '${id_user}' `;
    if (isSubAdmin == 1) {
      sql += `  and id_department in(${id_department}) `;
    } else if (isDept == 1) {
      sql += `  and id_department = ${req.token.id} `;
    }
    if (department_id != undefined) {
      sql += `and id_department = ${department_id} `;
    }
    if (agent != undefined) {
      sql += `and agentQuery.id in(${agentArray}) GROUP BY agentId `;
    }
    if (agent == undefined) {
      sql += `GROUP BY agentQuery.id `;
    }
    var [result] = await getConnection.query(sql);
    // var totalBreak = `SELECT SUM(time_to_sec(timediff(user_sessions.endDate, user_sessions.startDate))) as duration,user_sessions.startDate as startDate,id_break,user_id as id_agent FROM user_sessions WHERE user_sessions.startDate BETWEEN '${Start}' AND '${End}' AND user_sessions.id_break NOT IN (1,2) AND user_sessions.break_type='3' AND id_user = '${id_user}' `
    // if (isSubAdmin == 1) {
    //     totalBreak += `AND id_department in(${id_department}) `
    // } else if (isDept == 1) {
    //     totalBreak += `AND id_department = '${req.token.id}' `
    // }
    // totalBreak += `GROUP BY user_id,DATE(user_sessions.startDate),id_break`
    // var [breakDurationUnderscoreSplit] = await getConnection.query(totalBreak);

    var outgoingReportsSql = `SELECT user_id as id_agent, DATE_FORMAT(date, '%Y-%m-%d') AS date, status as callStatus, SUM(duration) as outboundDuration, COUNT(*) as calls,SUM(total_hold_time) as holdDuration FROM cc_outgoing_reports WHERE date BETWEEN '${Start}' AND '${End}' AND id_user='${id_user}' AND ((status = 'ANSWER' OR status = 'ANSWERED') OR (status != 'ANSWER' OR status != 'ANSWERED')) `;
    if (isSubAdmin == 1) {
      outgoingReportsSql += ` AND id_department in(${id_department}) `;
    } else if (isDept == 1) {
      outgoingReportsSql += ` AND id_department='${req.token.id}' `;
    }
    outgoingReportsSql += `GROUP BY user_id, (status = 'ANSWER' OR status = 'ANSWERED'),DATE(date)`;
    var [outgoingReports] = await getConnection.query(outgoingReportsSql);

    var outgoingNoAnswerReportsSql = `SELECT user_id as id_agent, DATE_FORMAT(date, '%Y-%m-%d') AS date, status as callStatus, duration as outboundDuration FROM cc_outgoing_reports WHERE date BETWEEN '${Start}' AND '${End}' AND id_user='${id_user}' AND ((status = 'NOANSWER  ' OR status = ' NO ANSWER ') OR (status != 'BUSY' OR status != 'CANCEL')) `;
    if (isSubAdmin == 1) {
      outgoingNoAnswerReportsSql += ` AND id_department in(${id_department}) `;
    } else if (isDept == 1) {
      outgoingNoAnswerReportsSql += ` AND id_department='${req.token.id}' `;
    }
    // outgoingNoAnswerReportsSql += `GROUP BY DATE(date)`
    var [outgoingNoAnswerReports] = await getConnection.query(
      outgoingNoAnswerReportsSql
    );

    var campaignCount = `SELECT user_id as id_agent,duration,callStatus,callerid,call_start_time,hold_time FROM cc_campaign_outgoing_reports where createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
    if (isSubAdmin == 1) {
      campaignCount += `and cc_campaign_outgoing_reports.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      campaignCount += `and cc_campaign_outgoing_reports.id_department = '${req.token.id}' `;
    }
    var [campaign_outgoingCount] = await getConnection.query(campaignCount);

    // var campaignCountNoAnswer = `SELECT user_id as id_agent,duration,callStatus,callerid,call_start_time,hold_time FROM cc_campaign_outgoing_reports where createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `
    // if (isSubAdmin == 1) {
    //     campaignCountNoAnswer += `and cc_campaign_outgoing_reports.id_department in (${id_department}) `;
    // } else if (isDept == 1) {
    //     campaignCountNoAnswer += `and cc_campaign_outgoing_reports.id_department = '${req.token.id}' `;
    // }
    // var [campaign_outgoingCount_NoAnswer] = await getConnection.query(campaignCountNoAnswer)

    // var campaignSummeryCount = `SELECT id, id_user, id_department, user_id as agent_id, regNumber,createdAt, campaign_id,sum(ACW) as acw,sum(total_duration) as total_duration , call_delay,sum(hold_time) as hold_time FROM cc_campaign_call_summary WHERE createdAt between '${Start}' and '${End}' and cc_campaign_call_summary.id_user = '${id_user}' `
    var campaignSummeryCount = `SELECT id, id_user, id_department, user_id as agent_id, regNumber,createdAt, campaign_id,sum(ACW) as acw,sum(total_duration) as total_duration , call_delay,sum(hold_time) as hold_time FROM cc_campaign_call_summary WHERE createdAt between '${Start}' and '${End}' and cc_campaign_call_summary.id_user = '${id_user}' `;
    if (isSubAdmin == 1) {
      campaignSummeryCount += `and cc_campaign_call_summary.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      campaignSummeryCount += `and cc_campaign_call_summary.id_department = '${req.token.id}' `;
    }
    var [campaignSummeryRes] = await getConnection.query(campaignSummeryCount);

    var outgoingAcwReportSql = `SELECT user_id as id_agent, DATE_FORMAT(date, '%Y-%m-%d') AS date ,status as callStatus,SUM(acw) as totalACW FROM cc_outgoing_reports WHERE date BETWEEN '${Start} ' AND '${End}'  AND id_user ='${id_user}' `;
    if (isSubAdmin == 1) {
      outgoingAcwReportSql += ` AND id_department in(${id_department}) `;
    } else if (isDept == 1) {
      outgoingAcwReportSql += ` AND id_department ='${req.token.id}' `;
    }
    outgoingAcwReportSql += `GROUP BY user_id,DATE(date)`;
    var [outgoingAcwReport] = await getConnection.query(outgoingAcwReportSql);

    var incomingReportsSql = `SELECT GROUP_CONCAT(user.id) as agentId,incoming_reports.user_id as agents_list, DATE_FORMAT(incoming_reports.call_start_time, '%Y-%m-%d') AS date, user_status as agentStatus, SUM(connected_duration) as inboundDuration,COUNT(*) as calls,SUM(total_hold_time) as holdDuration FROM incoming_reports JOIN user ON FIND_IN_SET(user.id,incoming_reports.user_id) > 0 WHERE incoming_reports.call_start_time BETWEEN '${Start} ' AND '${End}' AND incoming_reports.id_user='${id_user}' AND (user_status='ANSWERED' OR user_status!='ANSWERED') and app != 'smartgroup'  `;
    if (isSubAdmin == 1) {
      incomingReportsSql += ` AND incoming_reports.id_department in(${id_department}) `;
    } else if (isDept == 1) {
      incomingReportsSql += ` AND incoming_reports.id_department='${req.token.id}' `;
    }
    incomingReportsSql += `GROUP BY user_id, user_status,DATE(incoming_reports.call_start_time ),incoming_reports.id`;
    var [incomingReports] = await getConnection.query(incomingReportsSql);

    var incomingNoAnswerReportsSql = `SELECT GROUP_CONCAT(user.id) as agentId,incoming_reports.user_id as agents_list, DATE_FORMAT(incoming_reports.call_start_time, '%Y-%m-%d') AS date, user_status as agentStatus, SUM(connected_duration) as inboundDuration,COUNT(*) as calls FROM incoming_reports JOIN user ON FIND_IN_SET(user.id,incoming_reports.user_id) > 0 WHERE incoming_reports.call_start_time BETWEEN '${Start} ' AND '${End}' AND incoming_reports.id_user='${id_user}' AND (user_status='NOANSWER ' OR user_status='BUSY' OR user_status='CANCEL')  `;
    if (isSubAdmin == 1) {
      incomingNoAnswerReportsSql += ` AND incoming_reports.id_department in(${id_department}) `;
    } else if (isDept == 1) {
      incomingNoAnswerReportsSql += ` AND incoming_reports.id_department='${req.token.id}' `;
    }
    incomingNoAnswerReportsSql += `GROUP BY user_id, user_status,DATE(incoming_reports.call_start_time ),incoming_reports.id`;
    var [incomingNoAnswerReports] = await getConnection.query(
      incomingNoAnswerReportsSql
    );

    var incomingMissedReportsSql = `SELECT GROUP_CONCAT(user.id) as agentId,incoming_reports.user_id AS agents_list, DATE_FORMAT(incoming_reports.call_start_time, '%Y-%m-%d') AS date, user_status as agentStatus, SUM(connected_duration) as inboundDuration,COUNT(*) as calls,SUM(total_hold_time) as holdDuration FROM incoming_reports JOIN user ON FIND_IN_SET(user.id,incoming_reports.user_id) > 0 WHERE incoming_reports.call_start_time BETWEEN '${Start} ' AND '${End}' AND incoming_reports.id_user='${id_user}' AND user_status !='ANSWERED' and app != 'smartgroup' `;
    if (isSubAdmin == 1) {
      incomingMissedReportsSql += ` AND incoming_reports.id_department in(${id_department}) `;
    } else if (isDept == 1) {
      incomingMissedReportsSql += ` AND incoming_reports.id_department='${req.token.id}' `;
    }
    incomingMissedReportsSql += `GROUP BY user_id, user_status,DATE(incoming_reports.call_start_time),incoming_reports.id`;
    var [incomingMissedReports] = await getConnection.query(
      incomingMissedReportsSql
    );
    var smartgroupAnsweredCalls = await smartGroupReport.find({
      eventStatus: "dial_answered",
      isCallFlow: { $exists: false },
      event: "start",
      eventTime: { $gte: Start, $lte: End },
    });
    var smartgroupMissedCalls = await smartGroupReport.find({
      event: "start",
      isCallFlow: { $exists: false },
      eventStatus: { $ne: "dial_answered" },
      eventTime: { $gte: Start, $lte: End },
    });
    var incomingEmptyReportsSql = `SELECT GROUP_CONCAT(user.id) as agentId,incoming_reports.user_id as first_tried_agent, DATE_FORMAT(incoming_reports.call_start_time, '%Y-%m-%d') AS date,call_status as agentStatus, SUM(connected_duration) as inboundDuration,COUNT(*) as calls,SUM(total_hold_time) as holdDuration FROM incoming_reports JOIN user ON FIND_IN_SET(user.id,incoming_reports.user_id) > 0 WHERE incoming_reports.call_start_time BETWEEN '${Start} ' AND '${End}' AND incoming_reports.id_user='${id_user}' AND  user_status  ='' `;
    if (isSubAdmin == 1) {
      incomingEmptyReportsSql += ` AND incoming_reports.id_department in(${id_department}) `;
    } else if (isDept == 1) {
      incomingEmptyReportsSql += ` AND incoming_reports.id_department='${req.token.id}' `;
    }
    incomingEmptyReportsSql += `GROUP BY user_id, user_status,DATE(incoming_reports.call_start_time),incoming_reports.id`;
    var [incomingEmptyReports] = await getConnection.query(
      incomingEmptyReportsSql
    );
    console.log(incomingEmptyReports);
    var incomingAcwReportSql = `SELECT user_id as answeredAgent, DATE_FORMAT(incoming_reports.call_start_time , '%Y-%m-%d') AS call_start_time,SUM(acw) as totalACW FROM incoming_reports WHERE incoming_reports.call_start_time BETWEEN '${Start} ' AND '${End}' and call_connected_time != 0 AND id_user ='${id_user}' `;
    if (isSubAdmin == 1) {
      incomingAcwReportSql += ` AND id_department in(${id_department}) `;
    } else if (isDept == 1) {
      incomingAcwReportSql += ` AND id_department ='${req.token.id}' `;
    }
    incomingAcwReportSql += `GROUP BY user_id,DATE(incoming_reports.call_start_time)`;
    var [incomingAcwReport] = await getConnection.query(incomingAcwReportSql);
    console.log(incomingAcwReport);
    var dates = getAllDates(dateRangeFrom, dateRangeTo);
    var output = [];
    if (result.length != 0) {
      result.map((data) => {
        var agentData = {
          agentId: data.agentId,
          agent_name: data.name,
          username: data.username,
          registration_name: data.regNumber,
          departmentName: data.departmentName,
          activity: [],
        };
        if (data.totalavailableDuration != null) {
          var totalavailableDurationCommaSplit =
            data.totalavailableDuration.split(",");
          var totalavailableDurationUnderscoreSplit =
            totalavailableDurationCommaSplit.map((availableDuration) => {
              var re = availableDuration.split("_");
              return { date: re[1], duration: re[0] };
            });
        }
        if (data.totalBreakDuration != null) {
          var totalBreakDurationCommaSplit = data.totalBreakDuration.split(",");
          var totalBreakDurationUnderscoreSplit =
            totalBreakDurationCommaSplit.map((totalBreakDuration) => {
              var re = totalBreakDuration.split("_");
              return { date: re[1], duration: re[0] };
            });
        }
        if (data.totalSpecialBreakDuration != null) {
          var totalSpecialBreakDurationCommaSplit =
            data.totalSpecialBreakDuration.split(",");
          var totalSpecialBreakDurationUnderscoreSplit =
            totalSpecialBreakDurationCommaSplit.map((breakDuration) => {
              var re = breakDuration.split("_");
              return { date: re[1], duration: re[0], id_break: re[2] };
            });
        }
        var totalAvailableDuration = 0;
        if (totalavailableDurationUnderscoreSplit != undefined) {
          totalavailableDurationUnderscoreSplit.map((duration) => {
            totalAvailableDuration = duration.duration;
          });
        }
        var totalBreakDuration = 0;
        var breaksDuration = [];
        var totalSpecialbreakDuration = 0;
        if (totalSpecialBreakDurationUnderscoreSplit != undefined) {
          totalSpecialBreakDurationUnderscoreSplit.map((duration) => {
            totalSpecialbreakDuration += Number(duration.duration);
            breaksDuration.push({
              duration: duration.duration,
              id_break: duration.id_break,
            });
            // }
          });
        }
        var totalOutgoingDuration = 0;
        var answeredOutgoing = 0;
        var totalHoldTime = 0;
        var totalOutgoingCall = 0;
        var total_Talk_Time = 0;
        var totalAcw = 0;
        var noAnsweredOutgoing = 0;
        var channelUnavailableOutgoing = 0;
        var busyOutgoing = 0;
        var cancelOutgoing = 0;
        if (outgoingReports.length != 0) {
          outgoingReports.map((outgoing) => {
            var outdate = convert_date(outgoing.date);
            if (agentData.agentId == outgoing.id_agent) {
              totalOutgoingDuration =
                totalOutgoingDuration + Number(outgoing.outboundDuration);
              if (
                outgoing.callStatus == "ANSWERED" ||
                outgoing.callStatus == "ANSWER"
              ) {
                answeredOutgoing += outgoing.calls;
              }
              totalHoldTime += Number(outgoing.holdDuration);
              totalOutgoingCall += Number(outgoing.calls);
            }
          });
        }
        if (campaign_outgoingCount.length != 0) {
          campaign_outgoingCount.map((outgoing) => {
            var outdate = convert_date(outgoing.call_start_time);
            if (agentData.agentId == outgoing.id_agent) {
              totalOutgoingDuration += Number(outgoing.duration);
              if (outgoing.callStatus == "ANSWER") {
                answeredOutgoing += 1;
              }
              if (
                outgoing.callStatus === "NO ANSWER" ||
                outgoing.callStatus === "NOANSWER"
              ) {
                noAnsweredOutgoing += 1;
              }
              if (
                outgoing.callStatus === "Channel_Limit_Exceed"
              ) {
                channelUnavailableOutgoing += 1;
              }
              if (outgoing.callStatus == "BUSY") {
                busyOutgoing += 1;
              }
              if (outgoing.callStatus == "CANCEL") {
                cancelOutgoing += 1;
              }
              totalHoldTime += Number(outgoing.hold_time);
              totalOutgoingCall += 1;
            }
          });
        }
        if (campaignSummeryRes.length != 0) {
          campaignSummeryRes.map((outgoing) => {
            var outdate = convert_date(outgoing.createdAt);
            if (agentData.agentId == outgoing.agent_id) {
              totalOutgoingDuration += Number(outgoing.total_duration);
              totalHoldTime += Number(outgoing.hold_time);
              var incomingAcw = Math.abs(outgoing.ACW);
              totalAcw += Number(incomingAcw);
            }
          });
        }

        if (outgoingNoAnswerReports.length != 0) {
          outgoingNoAnswerReports.map((outgoing) => {
            var outdate = convert_date(outgoing.call_start_time);
            if (agentData.agentId == outgoing.id_agent) {
              if (
                outgoing.callStatus === "NO ANSWER" ||
                outgoing.callStatus === "NOANSWER"
              ) {
                noAnsweredOutgoing += 1;
              }
              if (
                outgoing.callStatus === "Channel_Limit_Exceed"
              ) {
                channelUnavailableOutgoing += 1;
              }
              if (outgoing.callStatus == "BUSY") {
                busyOutgoing += 1;
              }
              if (outgoing.callStatus == "CANCEL") {
                cancelOutgoing += 1;
              }
            }
          });
        }

        total_Talk_Time += totalOutgoingDuration;
        var totalCalls = 0;
        var totalIncomingCall = 0;
        var answeredIncoming = 0;
        var totalMissedCalls = 0;
        var totalIncomingDuration = 0;
        var totalNoAnswer = 0;
        var totalCancel = 0;
        var totalBusy = 0;

        if (incomingReports.length != 0) {
          incomingReports.map((incoming) => {
            var indate = convert_date(incoming.date);
            if (incoming.agentStatus == "ANSWERED") {
              if (incoming.agents_list == agentData.agentId) {
                answeredIncoming += 1;
                totalIncomingCall += 1;
                totalIncomingDuration += Number(incoming.inboundDuration);
                totalHoldTime += Number(incoming.holdDuration);
              }
            }
            totalCalls = totalIncomingCall;
          });
        }

        if (incomingNoAnswerReports.length != 0) {
          incomingNoAnswerReports.map((incoming) => {
            var indate = convert_date(incoming.date);

            if (incoming.agentStatus == "NOANSWER") {
              if (incoming.agents_list == agentData.agentId) {
                totalNoAnswer += 1;
              }
            }
            if (incoming.agentStatus == "CANCEL") {
              if (incoming.agents_list == agentData.agentId) {
                totalCancel += 1;
              }
            }
            if (incoming.agentStatus == "BUSY") {
              if (incoming.agents_list == agentData.agentId) {
                totalBusy += 1;
              }
            }
          });
        }

        if (smartgroupAnsweredCalls.length != 0) {
          smartgroupAnsweredCalls.map((incoming) => {
            var indate = convert_date(incoming.eventTime);
            if (incoming.userId == agentData.agentId) {
              answeredIncoming += 1;
              totalIncomingCall += 1;
              totalIncomingDuration += Math.floor(
                (new Date(incoming.endTime) - new Date(incoming.answeredTime)) /
                  1000
              ); // in seconds
              console.log(
                "totalIncomingCall====================================================================================",
                totalIncomingCall
              );
            }
            totalCalls = totalIncomingCall;
          });
        }
        if (incomingMissedReports.length != 0) {
          incomingMissedReports.map((incoming) => {
            var indate = convert_date(incoming.date);
            if (
              incoming.agentStatus != "ANSWERED" &&
              incoming.agentStatus != ""
            ) {
              if (incoming.agents_list == agentData.agentId) {
                totalMissedCalls += 1;
                totalIncomingCall += 1;
                totalHoldTime += Number(incoming.holdDuration);
              }
            }
            totalCalls = totalIncomingCall;
          });
        }
        if (smartgroupMissedCalls.length != 0) {
          smartgroupMissedCalls.map((incoming) => {
            if (Number(incoming.smartGroupUserId) == agentData.agentId) {
              totalMissedCalls += 1;
              totalIncomingCall += 1;
            }
            totalCalls = totalIncomingCall;
            // }
          });
        }
        if (incomingEmptyReports.length != 0) {
          incomingEmptyReports.map((incoming) => {
            var indate = convert_date(incoming.date);
            if (incoming.agentStatus == "") {
              if (incoming.agentId == agentData.agentId) {
                totalMissedCalls += 1;
                totalIncomingCall += 1;
                totalHoldTime += Number(incoming.holdDuration);
              }
            }
            if (incoming.agentStatus == "CHANUNAVAIL") {
              if (incoming.agentId == agentData.agentId) {
                totalMissedCalls += 1;
                totalIncomingCall += 1;
                totalHoldTime += Number(incoming.holdDuration);
              }
            }
            totalCalls = totalIncomingCall;
            // }
          });
        }
        if (outgoingAcwReport.length != 0) {
          outgoingAcwReport.map((outgoingAcw) => {
            var outgoingAcwdate = convert_date(outgoingAcw.date);
            if (agentData.agentId == outgoingAcw.id_agent) {
              var outgoingAcw = Math.abs(outgoingAcw.totalACW);
              totalAcw += Number(outgoingAcw);
            }
          });
        }
        if (incomingAcwReport.length != 0) {
          incomingAcwReport.map((incoming) => {
            var incomingdate = convert_date(incoming.call_start_time);
            if (agentData.agentId == incoming.answeredAgent) {
              var incomingAcw = Math.abs(incoming.totalACW);
              totalAcw += Number(incomingAcw);
            }
          });
        }
        var total_Talk_Time = totalIncomingDuration + totalOutgoingDuration;
        if (totalAvailableDuration != 0) {
          var [hours, minutes, seconds] = totalAvailableDuration
            .split(":")
            .map(Number);
          var totalSeconds = hours * 3600 + minutes * 60 + seconds;
          if (totalBreakDuration <= totalSeconds) {
            var wrkingDuration = totalSeconds - totalBreakDuration;
          } else {
            var wrkingDuration = totalBreakDuration - totalSeconds;
          }
          var idle_Time = Math.abs(wrkingDuration - total_Talk_Time);
        }
        var numberOfCallsHandled = answeredOutgoing + answeredIncoming;
        var averageCallHandlingTime = 0;
        if (numberOfCallsHandled != 0) {
          console.log(total_Talk_Time);
          console.log(totalHoldTime);
          console.log(totalAcw);
          var averageCallHandlingTimePlus =
            total_Talk_Time + Number(totalHoldTime) + Number(totalAcw);
          console.log(averageCallHandlingTimePlus);
          console.log(numberOfCallsHandled);
          var averageCallHandlingTimeFix =
            averageCallHandlingTimePlus / numberOfCallsHandled;
          if (isNaN(averageCallHandlingTimeFix)) {
            averageCallHandlingTime = 0;
          } else {
            averageCallHandlingTime = averageCallHandlingTimeFix.toFixed(2);
          }
        }
        if (totalCalls == 0) totalCalls = undefined;
        if (totalIncomingCall == 0) totalIncomingCall = undefined;
        if (answeredIncoming == 0) answeredIncoming = undefined;
        if (totalIncomingDuration == 0) totalIncomingDuration = undefined;
        if (totalOutgoingDuration == 0) totalOutgoingDuration = undefined;
        if (answeredOutgoing == 0) answeredOutgoing = undefined;
        if (totalMissedCalls == 0) totalMissedCalls = undefined;
        if (totalHoldTime == 0) totalHoldTime = undefined;
        if (totalOutgoingCall == 0) totalOutgoingCall = undefined;
        if (totalAcw == 0) totalAcw = undefined;
        if (breaksDuration.length == 0) breaksDuration = undefined;
        var activity = {
          // firstLoginTime: log,
          // lastLogoutTime: lastlogout,
          availableDuration: totalAvailableDuration,
          totalBreakTime: totalBreakDuration,
          breakType: breaksDuration,
          totalSpecialbreakDuration: totalSpecialbreakDuration,
          outgoing: totalOutgoingCall,
          answeredOutgoing: answeredOutgoing,
          outgoingDuration: totalOutgoingDuration,
          totalHoldTime: totalHoldTime,
          totalIncomingCalls: totalIncomingCall,
          totalMissedCalls: totalMissedCalls,
          totalCalls: totalCalls,
          answeredIncoming: answeredIncoming,
          incomingDuration: totalIncomingDuration,
          totalACW: totalAcw,
          idleTime: idle_Time,
          totalTalkTime: total_Talk_Time,
          numberOfCallsHandled: numberOfCallsHandled,
          averageCallHandlingTime: averageCallHandlingTime,
          totalNoAnswerIncoming: totalNoAnswer,
          totalCancelIncoming: totalCancel,
          totalBusyIncoming: totalBusy,
          noAnsweredOutgoing,
          channelUnavailableOutgoing,
          busyOutgoing,
          cancelOutgoing,
        };
        agentData.activity.push(activity);
        //     })
        // }
        output.push(agentData);
      });
      res.locals.result = output;
    } else {
      res.locals.result = [];
    }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function add_live_calls(req, res, next) {
  try {
    var fromDate = req.query.fromDate;
    var toDate = req.query.toDate;

    var liveSql = `select * from livecalls where time between "${fromDate}" and  "${toDate}"`;
    const [liveSqlResult] = await getConnection.query(liveSql);

    if (liveSqlResult.length != 0) {
      var incoming = liveSqlResult.filter((data) => {
        if (data.type == "incoming") {
          return data;
        }
      });
      if (incoming.length != 0) {
        var uniqueIds = incoming.map((liveData) => liveData.uniqueId);

        if (uniqueIds.length != 0) {
          var existingRecords = await incomingCallReportModel.findAll({
            attributes: ["uniqueid"],
            where: { uniqueid: uniqueIds },
          });
          var existingUniqueIds = new Set(
            existingRecords.map((record) => record.uniqueid)
          );
          var newRecords = incoming
            .filter((liveData) => !existingUniqueIds.has(liveData.uniqueId))
            .map((liveData) => ({
              id_department: liveData.id_department,
              id_user: liveData.id_user,
              user_id: liveData.user_id,
              call_start_time: liveData.time,
              call_connected_time: liveData.answeredTime,
              uniqueid: liveData.uniqueId,
              source: liveData.source,
              destination: liveData.destination,
              connected_user_id: liveData.user_id,
              connected_user: liveData.user_id,
              call_status:
                liveData.answeredTime && moment(liveData.answeredTime).isValid()
                  ? "ANSWERED"
                  : "FAILED",
              user_status: liveData.currentStatus,
              app: liveData.app,
              appId: liveData.appId,
              dtmf_sequence: liveData.dtmfNo,
              last_tried_user: liveData.user_id,
            }));

          if (newRecords != undefined) {
            await incomingCallReportModel.bulkCreate(newRecords);
          }
        }
      }

      var outgoing = liveSqlResult.filter((data) => {
        if (data.type == "outgoing") {
          return data;
        }
      });
      if (outgoing.length != 0) {
        var uniqueIdsOut = outgoing.map((liveData) => liveData.uniqueId);

        if (uniqueIdsOut.length != 0) {
          var existingRecordsOut = await cc_outgoingCallReportModel.findAll({
            attributes: ["uniqueid"],
            where: { uniqueid: uniqueIdsOut },
          });

          if (existingRecordsOut != undefined) {
            var existingUniqueIdsOut = new Set(
              existingRecordsOut.map((record) => record.uniqueid)
            );
          }
          if (existingUniqueIdsOut != undefined) {
            var newRecordsOut = outgoing
              .filter(
                (liveData) => !existingUniqueIdsOut.has(liveData.uniqueId)
              )
              .map((liveData) => ({
                id_department: liveData.id_department,
                id_user: liveData.id_user,
                user_id: liveData.user_id,
                date: liveData.time,
                answeredTime: liveData.answeredTime,
                uniqueid: liveData.uniqueId,
                callerid: liveData.source,
                destination: liveData.destination,
                status:
                  liveData.answeredTime &&
                  moment(liveData.answeredTime).isValid()
                    ? "ANSWERED"
                    : "FAILED",
                type: "Outbound",
                app: liveData.app,
              }));
          }
          if (newRecordsOut != undefined) {
            await cc_outgoingCallReportModel.bulkCreate(newRecordsOut);
          }
        }
      }
    }
    var liveSqlDelte = `delete from livecalls where time between "${fromDate}" and  "${toDate}"`;
    const [liveSqlDelteResult] = await sequelize.query(liveSqlDelte);

    res.locals.result = liveSqlDelteResult;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
function getWeekStartEnd(date) {
  let start = new Date(date);
  start.setDate(start.getDate() - start.getDay()); // Set to Sunday
  start.setHours(0, 0, 0, 0);

  let end = new Date(start);
  end.setDate(end.getDate() + 6); // Set to Saturday
  end.setHours(23, 59, 59, 999);

  return { weekStart: start, weekEnd: end };
}
function getMonthStartEnd(date) {
  let start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  let end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { monthStart: start, monthEnd: end };
}
async function get_sms_report(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var used_id = req.query.user_id;
    var phn = req.query.phn;
    const limit = Number(req.query.count) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var filterBy = req.query.filterBy;
    var fromdatetime = new Date();
    var todatetime = new Date();
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    let filter = { id_user: id_user };
    var userId = [];
    if (filterBy != undefined) {
      if (filterBy == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        var month = Number(todatetime.getMonth()) + 1;
        toDate =
          todatetime.getFullYear() +
          "-" +
          month +
          "-" +
          todatetime.getDate() +
          " 23:59:59";
        toDate = new Date(toDate);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
        var month = Number(fromdatetime.getMonth()) + 1;
        fromDate =
          fromdatetime.getFullYear() +
          "-" +
          month +
          "-" +
          fromdatetime.getDate();
      }
      if (filterBy == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromDate = weekStart;
        toDate = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (filterBy == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromDate = monthStart;
        toDate = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      console.log("fromDate :", fromDate);
      console.log("toDate :", toDate);
    } else {
      if (toDate != undefined) {
        toDate = new Date(toDate);
        toDate.setDate(toDate.getDate() + 1);
      } else {
        toDate = new Date();
        toDate.setDate(toDate.getDate() + 1);
      }
      if (fromDate == undefined) {
        var fromDateRange = new Date();
        var month = Number(fromDateRange.getMonth()) + 1;
        fromDate =
          fromDateRange.getFullYear() +
          "-" +
          month +
          "-" +
          fromDateRange.getDate();
      } else {
        fromDate = new Date(fromDate);
      }
    }
    if (isSubAdmin === 1) {
      const id_department = req.token.id_department.split(",").map(Number);
      filter.id_department = { $in: id_department };
    } else if (isDept === 1) {
      filter.id_department = Number(req.token.id);
    }
    if (used_id != undefined) {
      filter.user_id = Number(used_id);
    }
    if (phn != undefined) {
      filter.callerNo = phn;
    }
    filter.time = { $gte: fromDate, $lt: toDate };
    console.log(filter);
    var result = await smsReportModel
      .find(filter)
      .sort({ time: -1 })
      .skip(skip)
      .limit(limit);
    var count = await smsReportModel.count(filter).sort({ time: -1 });
    result.map(async (value) => {
      if (value._doc.user_id) {
        userId.push(value._doc.user_id);
      }
    });
    userId = userId.filter(
      (value, index, self) => self.indexOf(value) === index
    );
    if (userId.length != 0) {
      var sql = `SELECT id,CONCAT(user.first_name, ' ', user.last_name) AS name FROM user WHERE id IN(${userId})`;
      var [userRes] = await getConnection.query(sql);
      var map_result = Promise.all(
        result.map(async (value) => {
          if (value._doc.userOrCaller == 1) {
            userRes.map(async (data) => {
              if (value._doc.user_id == data.id) {
                value._doc.userName = data.name;
              }
            });
          }
          return value;
        })
      );
      result = await map_result;
    }
    res.locals.result = result;
    res.locals.count = count;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next(err);
  }
}
async function insert_default_template(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;

    var data = req.body;
    var id_user = req.token.id_user;
    var departement_id = req.query.id_department;

    if (departement_id != undefined) {
      var id_department = departement_id;
    } else if (isAdmin == 1) {
      var id_department = 0;
    } else if (isDept == 1) {
      var id_department = req.token.id;
    }

    var presentData = await defaultDatafromModel.findOne({
      id_user: id_user,
      id_department: id_department,
    });

    if (presentData == null) {
      var result = await defaultDatafromModel.create({
        id_user: id_user,
        id_department: id_department,
        dataform_id: data.dataform_id,
        default_template_flag: data.default_template_flag,
        save_data_to: Number(data.save_data_to),
      });
    } else {
      var result = await defaultDatafromModel.updateOne(
        { id_user: id_user, id_department: id_department },
        {
          $set: {
            dataform_id: data.dataform_id,
            default_template_flag: data.default_template_flag,
            save_data_to: Number(data.save_data_to),
            id_department: id_department,
          },
        }
      );
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function update_default_template(req, res, next) {
  try {
    var dataform_id = req.query.id;
    var data = req.body;
    if (data.default_template_flag == 1) {
      var result = await defaultDatafromModel.updateOne(
        { dataform_id: dataform_id },
        {
          $set: {
            dataform_id: data.dataform_id,
            default_template_flag: data.default_template_flag,
            save_data_to: data.save_data_to,
          },
        }
      );
    }

    if (data.default_template_flag == 0) {
      var result = await defaultDatafromModel.deleteOne({
        dataform_id: data.dataform_id,
      });
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function get_default_template_flag(req, res, next) {
  try {
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;

    var data = req.body;
    var id_user = req.token.id_user;
    var departement_id = req.query.id_department;

    if (departement_id != undefined) {
      var id_department = departement_id;
    } else if (isAdmin == 1) {
      var id_department = 0;
    } else if (isDept == 1) {
      var id_department = req.token.id;
    }

    var templateId = req.query.templateId;
    var [result] = await defaultDatafromModel.find({
      dataform_id: new ObjectId(templateId),
      id_user: id_user,
      id_department: id_department,
    });
    if (result == undefined) {
      var result = [];
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_default_template_on_callpopup(req, res, next) {
  try {
    // var isAdmin = req.token.isAdmin;
    // var isSubAdmin = req.token.isSubAdmin;
    // var isDept = req.token.isDept;

    // var data = req.body;
    var id_user = req.token.id_user;
    var id_department = req.token.id_department;

    // if(departement_id != undefined){
    //    var id_department = departement_id
    // }else if(isAdmin == 1){
    //     var id_department = 0
    // }else if(isDept == 1){
    //     var id_department = req.token.id
    // }

    // var templateId = req.query.templateId;
    var [result] = await defaultDatafromModel.find({
      id_user: Number(id_user),
      id_department: Number(id_department),
    });
    if (result == undefined) {
      var result = [];
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function getDepartmentSummary(req, res, next) {
  const timezone = "Asia/Kolkata";
  try {
    let { department_id, from, to, filterBy = "day" } = req.query;
    const { id_user, isAdmin, isSubAdmin } = req.token;

    const timeFilterMapping = {
      day: "day",
      yesterday: "day",
      thismonth: "month",
      thisweek: "week",
    };

    if (filterBy === "yesterday") {
      let yesterday = moment().tz(timezone).subtract(1, "days").toDate();
      from = yesterday;
      to = yesterday;
    }

    let startDate = moment(from)
      .tz(timezone)
      .startOf(timeFilterMapping[filterBy])
      .toDate();
    let endDate = moment(to)
      .tz(timezone)
      .endOf(timeFilterMapping[filterBy])
      .toDate();

    const whereCondition = { id_user };

    if (!isAdmin && !isSubAdmin) {
      const status = {
        statusCode: 400,
        message: "No permission",
      };
      res.locals.result = status;
      return next();
    }

    if (department_id) {
      if (isAdmin) {
        whereCondition.id = department_id;
      } else {
        //check department associated with the subadmin
        const isDepartmentCorrect = await SubAdminDepartment.findOne({
          where: { id_subadmin: req.token.id, id_dept: department_id },
        });

        if (!isDepartmentCorrect) {
          const status = {
            statusCode: 400,
            message: "Invalid department id",
          };
          res.locals.result = status;
          return next();
        }

        whereCondition.id = department_id;
      }
    } else if (isSubAdmin) {
      whereCondition.id = req.token.id_department.split(",").map(Number);
    }

    const departments = await Departments.findAll({
      where: whereCondition,
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
      raw: true,
    });

    let departmentIds = departments.map((d) => d.id);
    if (
      (isAdmin || req.token.id_department.split(",").includes("0")) &&
      (!department_id || department_id == 0)
    ) {
      //add 0 (default department) or added department to sub admin
      departmentIds.unshift(0);
    }

    const queryIncoming = `
              SELECT 
              id_department,
              SUM(CASE WHEN user_status = 'ANSWERED' THEN 1 ELSE 0 END) AS answered_calls,
              SUM(CASE WHEN user_status IN ('FAILED', 'BUSY', 'CANCEL', 'NOANSWER', 'CHANUNAVAIL', 'CONGESTION') THEN 1 ELSE 0 END) AS failed_calls,
              COUNT(*) AS total_calls
                  FROM 
                  incoming_reports
                  WHERE id_user = :id_user AND id_department IN(:departmentIds) 
                    AND call_start_time BETWEEN :startDate AND :endDate
                  GROUP BY 
                  id_department;`;

    const queryOutgoing = `
              SELECT 
              id_department,
              SUM(CASE WHEN status = 'ANSWER' THEN 1 ELSE 0 END) AS answered_calls,
              SUM(CASE WHEN status != 'ANSWER' THEN 1 ELSE 0 END) AS failed_calls,
              SUM(CASE WHEN status = 'BUSY' THEN 1 ELSE 0 END) AS busy,
              SUM(CASE WHEN status = 'CANCEL' THEN 1 ELSE 0 END) AS cancelled,
              COUNT(*) AS total_calls
                  FROM 
                  cc_outgoing_reports
                  WHERE id_user = :id_user AND id_department IN(:departmentIds) 
                    AND date BETWEEN :startDate AND :endDate
                  GROUP BY 
                  id_department;`;

    const [incoming, outgoing] = await Promise.all([
      getConnection.query(queryIncoming, {
        replacements: {
          id_user,
          departmentIds,
          startDate,
          endDate,
        },
        type: sequelize.QueryTypes.SELECT,
      }),
      getConnection.query(queryOutgoing, {
        replacements: {
          id_user,
          departmentIds,
          startDate,
          endDate,
        },
        type: sequelize.QueryTypes.SELECT,
      }),
    ]);

    const result = departmentIds.map((d) => {
      const department = departments.find((department) => department.id == d);

      const incomingData = incoming.find((i) => i.id_department == d) || {
        total_calls: 0,
        answered_calls: 0,
        failed_calls: 0,
      };

      const outgoingData = outgoing.find((o) => o.id_department == d) || {
        total_calls: 0,
        answered_calls: 0,
        busy: 0,
        cancelled: 0,
        failed_calls: 0,
      };

      return {
        id: department?.id || 0,
        deptName: department?.name || "Admin",
        totalCalls: incomingData.total_calls + outgoingData.total_calls,
        totalIncomingAnsweredCalls: incomingData.answered_calls * 1,
        totalOutgoingAnsweredCalls: outgoingData.answered_calls * 1,
        totalIncomingFailedCalls: incomingData.failed_calls * 1,
        totalOutgoingFailedCalls: outgoingData.failed_calls * 1,
        busy: outgoingData.busy * 1,
        cancelled: outgoingData.cancelled * 1,
      };
    });

    const status = {
      status: true,
      message: "succesfull response",
      result: result,
    };
    res.status(200).json(status);
  } catch (error) {
    console.log(err);
    const status = {
      status: false,
      statusCode: 500,
      message: "Something went wrong",
    };

    res.locals.result = status;
    next();
  }
}
async function add_contacts(req, res, next) {
  try {
    const data = req.body;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    var departement_id = req.query.id_department;
    if (departement_id != undefined) {
      var id_department = departement_id;
    } else if (isAdmin == 1) {
      var id_department = 0;
    } else if (isDept == 1) {
      var id_department = req.token.id;
    } else {
      var id_department = req.token.id_department;
    }
    data.id_user = Number(id_user);
    data.id_department = Number(id_department);
    data.email = data.email.toLowerCase();
    // var isResult = await contactsModel.find({ phone_number: data.phone_number , id_user : id_user });
    // if (isResult.length == 0) {

    let isResultEmail = [];
    if (data.email != "") { 
      isResultEmail = await contactsModel.find({
        email: data.email.toLowerCase(),
        id_user: id_user,
        id_department
      });
    }
    if (isResultEmail.length == 0) {
      var result = await contactsModel.insertMany(data);
      res.locals.result = result;
    } else {
      res.locals.result = "email existing";
    }
    // }
    // else {

    //     res.locals.result = "existing";
    // }
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function update_contacts(req, res, next) {
  try {
    const id = req.query.id;
    var id_user = req.token.id_user;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var departement_id = req.query.id_department;
    if (departement_id != undefined) {
      var id_department = departement_id;
    } else if (isAdmin == 1) {
      var id_department = 0;
    } else if (isDept == 1) {
      var id_department = req.token.id;
    } else {
      var id_department = req.token.id_department;
    }

    const data = req.body;
    if (data.email) {
      const emailExists = await contactsModel.findOne({
        email: data.email.toLowerCase(),
        id_user: id_user,
        id_department,
        _id: { $ne: id },
      });

      if (emailExists) {
        res.locals.result = "email existing";
        return next();
      }
    }
    data.email = data.email.toLowerCase();
    const result = await contactsModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function delete_contacts(req, res, next) {
  try {
    const id = req.query.id;
    const result = await contactsModel.findByIdAndDelete(id);
    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function get_contacts(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var department_id = req.query.id_department;
    var input_value = req.query.input_value;
    const query = {};
    if (department_id != undefined) {
      var id_department = department_id;
      query.id_department = id_department;
    } else if (isAdmin == 1) {
      var id_department = 0;
      query.id_department = id_department;
    } else if (isDept == 1) {
      var id_department = req.token.id;
      query.id_department = id_department;
    }
    query.id_user = id_user;
    if (req.query.id) {
      query._id = req.query.id;
    }
    if (req.query.phone_number) {
      query.phone_number = req.query.phone_number;
    }
    if (req.query.email) {
      query.email = req.query.email;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.input_value) {
      const input = req.query.input_value;

      query.$or = [
        {
          email: {
            $regex: `^${input}`,
            $options: "i",
          },
        },
        {
          phone_number: {
            $regex: `^${input}`,
            $options: "i",
          },
        },
      ];
    }

    const result = await contactsModel.find(query).sort({ createdAt: -1 });
    res.locals.result = result;
    res.locals.total = result.length;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function get_contacts_by_id(req, res, next) {
  try {
    const query = {};
    query._id = req.query.id;
    const result = await contactsModel.find(query);
    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}
async function contact_phn_number_checking(req, res, next) {
  try {
    var id_user = req.token.id_user;
    var phn_number = req.query.phn_number;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;

    // var result = await contactsModel.find({
    //   phone_number: phn_number,
    //   id_user: id_user,
    // });

const query = {
    phone_number: phn_number,
      id_user: id_user,
};
if(isAdmin == 1){
  query.id_department = 0
}
if(isDept == 1){
  query.id_department = Number(req.token.id)
}
if (isSubAdmin == 1) {
  query.id_department = { $in: req.token.id_department };
}

const projection = {
  name: 1,
  phone_number: 1,
  _id: 0,
};

let result = await contactsModel.find(query, projection).lean();


    if (result.length != 0) {
      result = "existing";
    } else {
      result = "success";
    }
    res.locals.result = result;
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}

async function add_csv_contacts(req, res, next) {
  try {
    var data = req.body.contact_details;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    var departement_id = req.query.id_department;
    if (departement_id != undefined) {
      var id_department = departement_id;
    } else if (isAdmin == 1) {
      var id_department = 0;
    } else if (isDept == 1) {
      var id_department = req.token.id;
    } else {
      var id_department = req.token.id_department;
    }
    const validData = [];
    const ignoredData = [];

    data.forEach((item) => {
      const isValidName = item.name && item.name.trim() !== "";
      //   const isValidEmail = item.email && item.email.trim() !== "";
      const isValidPhone =
        Array.isArray(item.phone_number) && item.phone_number.length > 0;

      if (isValidName && isValidPhone) {
        validData.push(item);
      } else {
        ignoredData.push(item);
      }
    });

    const uniqueData = [];
    const emailExistData = [];
    const phoneExistData = [];
    const invalidPhoneData = [];
    const invalidNameData = [];
    const invalidCategoryData = [];
    const seenEmails = new Set();
    const seenPhoneNumbers = new Set();

    for (const item of validData) {
      const { email, phone_number, name } = item;

      if (!/[a-zA-Z]/.test(name)) {
        invalidNameData.push(item);
        continue;
      }

      const validPhoneNumbers = phone_number.filter((ph) => /^\d+$/.test(ph));
      const hasInvalidPhone = phone_number.length !== validPhoneNumbers.length;

      if (hasInvalidPhone) {
        invalidPhoneData.push(item);
        continue;
      }

      if (validPhoneNumbers.some((ph) => seenPhoneNumbers.has(ph))) {
        phoneExistData.push(item);
        continue;
      }

      //    if (item.category != 'vip' && item.category != 'general') {
      //     invalidCategoryData.push(item);
      //     continue;
      //   }

      if (item.email == "") {
        uniqueData.push(item);
        continue;
      }

      if (seenEmails.has(email)) {
        emailExistData.push(item);
        continue;
      }

      // Add unique entry
      uniqueData.push(item);
      seenEmails.add(email);
      validPhoneNumbers.forEach((ph) => seenPhoneNumbers.add(ph));
    }

    const gmails = uniqueData
      .filter((item) => item.email && item.email.trim() !== "")
      .map((item) => item.email.toLowerCase());

    const allPhoneNumbers = uniqueData.map((item) => item.phone_number).flat();

    var contactEmail = await contactsModel
      .find({ email: { $in: gmails }, id_user: id_user, id_department })
      .lean();

// const query = {
//   email: { $in: gmails },
//   id_user: id_user,
// };

//   query.id_department = Number(req.token.id)

// const projection_email = {
//   name: 1,
//   email: 1,
//   _id: 0,
// };

// const contactEmail = await contactsModel.find(query, projection_email).lean();


    var contactPhnone = await contactsModel
      .find({ phone_number: { $in: allPhoneNumbers }, id_user: id_user, id_department })
      .lean();

//     const contact_query = {
//   phone_number: { $in: allPhoneNumbers },
//   id_user: id_user,
// }; 
//   contact_query.id_department = Number(req.token.id)
// const projection = {
//   name: 1,
//   phone_number: 1,
//   _id: 0,
// };
// const contactPhnone = await contactsModel.find(contact_query, projection).lean();


    const removing_gmails = contactEmail.map((item) =>
      item.email.toLowerCase()
    );
    const removing_PhoneNumbers = contactPhnone
      .map((item) => item.phone_number)
      .flat();

    const last_valid_data = [];
    // const phoneExistData = [];

    uniqueData.forEach((item) => {
      if (
        Array.isArray(item.phone_number) &&
        !item.phone_number.some((num) => removing_PhoneNumbers.includes(num))
      ) {
        last_valid_data.push(item);
      } else {
        phoneExistData.push(item);
      }
    });

    const result = [];

    last_valid_data.forEach((item) => {
      if (!removing_gmails.includes(item.email.toLowerCase())) {
        result.push(item);
      } else {
        emailExistData.push(item);
      }
    });

    let updatedResult = result.map((item) => ({
      ...item,
      id_user: Number(id_user),
      id_department: Number(id_department),
    }));

    const prefix_data = await get_prefix_upload_csv(updatedResult);
    const final_data = prefix_data.validPrefix;
    const invalidPrefix = prefix_data.invalidPrefix;

    var collectionResult = await contactsModel.insertMany(final_data);
    res.locals.result = final_data;
    res.locals.nofield = ignoredData;
    res.locals.phoneExistData = phoneExistData;
    res.locals.emailExistData = emailExistData;
    res.locals.invalidPhoneData = invalidPhoneData;
    res.locals.invalidNameData = invalidNameData;
    res.locals.invalidCategoryData = invalidCategoryData;
    res.locals.invalidPrefixData = invalidPrefix;
    res.locals.successfull_count = final_data.length;
    res.locals.unsuccessfull_count = Number(data.length) - Number(final_data.length);

    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
 
async function get_transport_report(req, res, next) {
  try {
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var sourceNumber = req.query.sourceNumber;
    var fromDuration = req.query.fromDuration;
    var toDuration = req.query.toDuration;
    var fromTime = req.query.fromTime;
    var toTime = req.query.toTime;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var application = req.query.application;
    var filterBy = req.query.filterBy;
    var transfer_call_status = req.query.transfer_call_status;
    var final_application = req.query.transfered_application;
    var initial_application = req.query.initial_application;
    var first_attempted_agent = req.query.first_attempted_agent;
    var transfered_agent = req.query.transfered_agent;
    var fromdatetime = new Date();
    var todatetime = new Date();
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var department_id = req.query.department_id;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (filterBy != undefined) {
      if (filterBy == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      if (filterBy == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (filterBy == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }

    var sqlCount = `SELECT count(id) as cc_transfer_report FROM cc_transfer_report where id_user = ${id_user} and call_start_time between '${Start}' and '${End}' `;
    // var sql =  `SELECT cc_transfer_report.*, departments.name AS departmentName, u1.first_name AS landedAgentName, u2.first_name AS transferedAgentName, u3.first_name AS firstAttemptedAgentName FROM cc_transfer_report LEFT JOIN departments ON departments.id = cc_transfer_report.id_department LEFT JOIN user u1 ON u1.id = cc_transfer_report.landed_agent LEFT JOIN user u2 ON u2.id = cc_transfer_report.transfered_agent LEFT JOIN user u3 ON u3.id = cc_transfer_report.first_attempted_agent WHERE cc_transfer_report.id_user = ${id_user} AND cc_transfer_report.call_start_time BETWEEN '${Start}' AND '${End}' `
    var sql = `SELECT 
    cc_transfer_report.*, 
    departments.name AS departmentName, 
    u1.first_name AS landedAgentName, 
    u2.first_name AS transferedAgentName, 
    u3.first_name AS firstAttemptedAgentName,

    CASE 
        WHEN cc_transfer_report.initial_application = 'user' THEN CONCAT(ua.first_name, ' ', ua.last_name)
        WHEN cc_transfer_report.initial_application = 'smartgroup' THEN sg.name
        WHEN cc_transfer_report.initial_application = 'callflow' THEN cf.name
        ELSE NULL
    END AS initial_application_name,

    CASE 
        WHEN cc_transfer_report.final_application = 'user' THEN CONCAT(fu.first_name, ' ', fu.last_name)
        WHEN cc_transfer_report.final_application = 'smartgroup' THEN fsg.name
        WHEN cc_transfer_report.final_application = 'callflow' THEN fcf.name
        ELSE NULL
    END AS final_application_name

FROM cc_transfer_report

LEFT JOIN departments ON departments.id = cc_transfer_report.id_department
LEFT JOIN user u1 ON u1.id = cc_transfer_report.landed_agent
LEFT JOIN user u2 ON u2.id = cc_transfer_report.transfered_agent
LEFT JOIN user u3 ON u3.id = cc_transfer_report.first_attempted_agent

LEFT JOIN user ua ON ua.id = cc_transfer_report.initial_app_id AND cc_transfer_report.initial_application = 'user'
LEFT JOIN smart_group sg ON sg.id = cc_transfer_report.initial_app_id AND cc_transfer_report.initial_application = 'smartgroup'
LEFT JOIN call_flow cf ON cf.id = cc_transfer_report.initial_app_id AND cc_transfer_report.initial_application = 'callflow'

LEFT JOIN user fu ON fu.id = cc_transfer_report.final_app_id AND cc_transfer_report.final_application = 'user'
LEFT JOIN smart_group fsg ON fsg.id = cc_transfer_report.final_app_id AND cc_transfer_report.final_application = 'smartgroup'
LEFT JOIN call_flow fcf ON fcf.id = cc_transfer_report.final_app_id AND cc_transfer_report.final_application = 'callflow'

WHERE cc_transfer_report.id_user = ${id_user} 
  AND cc_transfer_report.call_start_time BETWEEN '${Start}' AND '${End}' `;

    if (isSubAdmin == 1) {
      sql += `AND cc_transfer_report.id_department in (${id_department}) `;
      sqlCount += `AND cc_transfer_report.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND cc_transfer_report.id_department='${req.token.id}' `;
      sqlCount += `AND cc_transfer_report.id_department='${req.token.id}' `;
    } else if (isAgent == 1) {
      var agent_id = req.token.id;
      sql += `AND cc_transfer_report.id_department='${id_department}' AND (cc_transfer_report.transfered_agent=${agent_id} OR cc_transfer_report.landed_agent=${agent_id}) `;
      sqlCount += `AND cc_transfer_report.id_department='${id_department}' AND (cc_transfer_report.transfered_agent=${agent_id} OR cc_transfer_report.landed_agent=${agent_id}) `;
    }
    if (application != undefined) {
      sql += `AND cc_transfer_report.application = '${application}' `;
      sqlCount += `AND cc_transfer_report.application = '${application}' `;
    }
    if (sourceNumber != undefined) {
      sql += `AND (cc_transfer_report.customer_number like "%${sourceNumber}%") `;
      sqlCount += `AND cc_transfer_report.customer_number like "%${sourceNumber}%" `;
    }
    if (fromDuration != undefined && toDuration != undefined) {
      function timeToSeconds(timeString) {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
      }
      var fromDur = timeToSeconds(req.query.fromDuration);
      var toDur = timeToSeconds(req.query.toDuration);
      sqlCount += `and cc_transfer_report.total_duration between ${fromDur} and ${toDur} `;
      sql += `and cc_transfer_report.total_duration between ${fromDur} and ${toDur} `;
    }
    if (fromTime != undefined && toTime != undefined) {
      sqlCount += `and TIME(cc_transfer_report.call_start_time) between '${fromTime}' and '${toTime}' `;
      sql += `and TIME(cc_transfer_report.call_start_time) between '${fromTime}' and '${toTime}' `;
    }
    if (department_id != undefined) {
      sql += `AND cc_transfer_report.id_department='${department_id}' `;
      sqlCount += `AND cc_transfer_report.id_department='${department_id}' `;
    }
    if (transfer_call_status != undefined) {
      sql += `and cc_transfer_report.transfer_call_status = '${transfer_call_status}' `;
      sqlCount += `and cc_transfer_report.transfer_call_status = '${transfer_call_status}' `;
    }
    if (final_application != undefined) {
      sql += `and cc_transfer_report.final_application = '${final_application}' `;
      sqlCount += `and cc_transfer_report.final_application = '${final_application}' `;
    }
    if (initial_application != undefined) {
      sql += `and cc_transfer_report.initial_application = '${initial_application}' `;
      sqlCount += `and cc_transfer_report.initial_application = '${initial_application}' `;
    }
    if (first_attempted_agent != undefined) {
      sql += `and cc_transfer_report.first_attempted_agent = '${first_attempted_agent}' `;
      sqlCount += `and cc_transfer_report.first_attempted_agent = '${first_attempted_agent}' `;
    }
    if (transfered_agent != undefined) {
      sql += `and cc_transfer_report.transfered_agent = '${transfered_agent}' `;
      sqlCount += `and cc_transfer_report.transfered_agent = '${transfered_agent}' `;
    }
    sqlCount += `GROUP BY id `;
    sql += ` order by id desc limit ${skip},${limit} `;
    var [result] = await rackServer.query(sql);
    var [count] = await rackServer.query(sqlCount);

    var userUniqueArray = [
      ...new Set(
        result
          .filter((log) => log.application === "user")
          .map((log) => log.uniqueId)
      ),
    ];

    var smartUniqueArray = [
      ...new Set(
        result
          .filter((log) => log.application == "smartgroup")
          .map((log) => log.uniqueId)
      ),
    ];
    var userUniqueArray1 = [
      ...new Set(
        result
          .filter((log) => log.application === "user")
          .map((log) => log.parentUniqueId)
      ),
    ];

    var smartUniqueArray1 = [
      ...new Set(
        result
          .filter((log) => log.application == "smartgroup")
          .map((log) => log.parentUniqueId)
      ),
    ];
    userUniqueArray = [ ...userUniqueArray, ...userUniqueArray1];
    smartUniqueArray = [ ...smartUniqueArray, ...smartUniqueArray1];
    var userUniqueArrayData = await userCallReportModel
      .find(
        {
          uniqueId: { $in: userUniqueArray },
          module: { $exists: true, $ne: null },
          eventStatus: { $in: ["dial_end", "dial_answered"] },
          userId: { $exists: true, $ne: null },
        },
        {
          module: 1,
          eventStatus: 1,
          userId: 1,
          uniqueId: 1,
          dialStatus: 1,
        }
      )
      .lean();

    var smartUniqueArrayData = await smartGroupReport
      .find(
        {
          uniqueId: { $in: smartUniqueArray },
          module: { $exists: true, $ne: null },
          eventStatus: { $in: ["dial_end", "dial_answered","user_loggedOut"] },
          userId: { $exists: true, $ne: null },
        },
        {
          module: 1,
          eventStatus: 1,
          userId: 1,
          uniqueId: 1,
          dialStatus: 1,
        }
      )
      .lean();
    userUniqueArrayData = [...userUniqueArrayData, ...smartUniqueArrayData,];

    var uniqueIds = [...new Set(userUniqueArrayData.map((log) => log.userId))];
    var smartuniqueIds = [
      ...new Set(smartUniqueArrayData.map((log) => log.userId)),
    ];

    var allIds = [...uniqueIds, ...smartuniqueIds];

    if (allIds.length != 0) {
      var sql = `SELECT user.id,CONCAT(user.first_name, ' ', user.last_name) AS name from user where id in (${allIds.join(
        ","
      )})`;
      var [userName] = await getConnection.query(sql);
    } else {
      var userName = [];
    }

    // Update dialStatus where eventStatus is "dial_answered"
    userUniqueArrayData = userUniqueArrayData.map((record) => {
      if (record.eventStatus == "dial_answered") {
        return { ...record, dialStatus: "Connected" };
      }else if (record.eventStatus == "user_loggedOut") {
        return { ...record, dialStatus: "User logout" };
      }
      return record;
    });

    const updatedArray = userUniqueArrayData.map((item) => {
      const matchedUser = userName.find((u) => u.id === item.userId);
      return {
        uniqueId: item.uniqueId,
        status: item.dialStatus,
        name: matchedUser ? matchedUser.name : null,
      };
    });

    const groupedData = updatedArray.reduce((acc, curr) => {
      const existing = acc.find((item) => item.uniqueId === curr.uniqueId);
      if (existing) {
        existing.firstAttemptedUser.push(curr);
      } else {
        acc.push({
          uniqueId: curr.uniqueId,
          firstAttemptedUser: [curr],
        });
      }
      return acc;
    }, []);

    if (smartUniqueArray && smartUniqueArray.length > 0) {
      // const parentIds = await smartGroupReport
      //   .find(
      //     {
      //       uniqueId: { $in: smartUniqueArray },
      //       event: "start",
      //     },
      //     {
      //       parentUniqueId: 1,
      //       _id: 0,
      //     }
      //   )
      //   .lean();
      const parentIds = [
        ...new Set(result.map(log => log.parentUniqueId)) // extract and deduplicate
      ].map(id => ({ parentUniqueId: id })); // convert each id back to object


      var parentIdsArray = [
        ...new Set(parentIds.map((log) => log.parentUniqueId)),
      ];

      var smartTransferData = await smartGroupReport
        .find(
          {
            uniqueId: { $in: parentIdsArray },
            module: { $exists: true, $ne: null },
            eventStatus: { $in: ["dial_end", "dial_answered"] },
            userId: { $exists: true, $ne: null },
          },
          {
            module: 1,
            eventStatus: 1,
            userId: 1,
            uniqueId: 1,
            dialStatus: 1,
          }
        )
        .lean();

      var smartTransferDataIds = [
        ...new Set(smartTransferData.map((log) => log.userId)),
      ];

      if (smartTransferDataIds.length != 0) {
        var sql = `SELECT user.id,CONCAT(user.first_name, ' ', user.last_name) AS name from user where id in (${smartTransferDataIds.join(
          ","
        )})`;
        var [userName] = await getConnection.query(sql);
      } else {
        var userName = [];
      }

      // // Update dialStatus where eventStatus is "dial_answered"
      // smartTransferData = smartTransferData.map(record => {
      //     if (record.eventStatus == "dial_answered") {
      //         return { ...record, dialStatus: "dial_answered" };
      //     }
      //     return record;
      // });
      const seen = new Set();

      smartTransferData = smartTransferData.reduce((acc, record) => {
        const key = `${record.uniqueId}-${record.userId}-${record.eventStatus}`;
        if (!seen.has(key)) {
          seen.add(key);
          if (record.eventStatus === "dial_answered") {
            acc.push({ ...record, dialStatus: "Connected" });
          } else {
            acc.push(record);
          }
        }
        return acc;
      }, []);

      const updatedArraySmart = smartTransferData.map((item) => {
        const matchedUser = userName.find((u) => u.id === item.userId);
        return {
          uniqueId: item.uniqueId,
          status: item.dialStatus,
          name: matchedUser ? matchedUser.name : null,
        };
      });

      var groupedDataSmart = updatedArraySmart.reduce((acc, curr) => {
        const existing = acc.find((item) => item.uniqueId === curr.uniqueId);
        if (existing) {
          existing.firstAttemptedUser.push(curr);
        } else {
          acc.push({
            uniqueId: curr.uniqueId,
            firstAttemptedUser: [curr],
          });
        }
        return acc;
      }, []);
    }

    result.forEach((result) => {
      if (groupedDataSmart != undefined) {
        var matchingEvents = groupedData.filter(
          (firstAttemptedUser) =>
            firstAttemptedUser.uniqueId === result.uniqueId
        );
      }
      if (groupedDataSmart != undefined) {
        var matchingEventsSmart = groupedDataSmart.filter(
          (firstAttemptedUser) =>
            firstAttemptedUser.uniqueId === result.parentUniqueId
        );
      }
      if (matchingEvents != undefined && matchingEvents.length > 0) {
        result.transferdAttemptUsers = matchingEvents[0].firstAttemptedUser
          ? matchingEvents[0].firstAttemptedUser
          : [];
      }
      if (matchingEventsSmart != undefined && matchingEventsSmart.length > 0) {
        result.firstAttemptUsers = matchingEventsSmart[0].firstAttemptedUser
          ? matchingEventsSmart[0].firstAttemptedUser
          : [];
      }
    });

    var total = count.length;
    res.locals.result = result;
    res.locals.count = total;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_transport_report_csv(req, res, next) {
  try {
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var isAgent = req.token.isAgent;
    var id_department = req.token.id_department;
    var id_user = req.token.id_user;
    var sourceNumber = req.query.sourceNumber;
    var fromDuration = req.query.fromDuration;
    var toDuration = req.query.toDuration;
    var fromTime = req.query.fromTime;
    var toTime = req.query.toTime;
    var fromDate = req.query.from;
    var toDate = req.query.to;
    var application = req.query.application;
    var filterBy = req.query.filterBy;
    var transfer_call_status = req.query.transfer_call_status;
    var final_application = req.query.transfered_application;
    var initial_application = req.query.initial_application;
    var first_attempted_agent = req.query.first_attempted_agent;
    var transfered_agent = req.query.transfered_agent;
    var fromdatetime = new Date();
    var todatetime = new Date();
    var limit = Number(req.query.count);
    var skip = req.query.page;
    skip = (skip - 1) * limit;
    var department_id = req.query.department_id;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (fromDate != undefined && toDate != undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (fromDate != undefined && toDate == undefined) {
      var Start = `${fromDate} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    } else if (fromDate == undefined && toDate != undefined) {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${toDate} 23:59:59`;
    } else if (filterBy != undefined) {
      if (filterBy == "yesterday") {
        todatetime.setDate(todatetime.getDate() - 1);
        fromdatetime.setDate(fromdatetime.getDate() - 1);
      }
      if (filterBy == "thisweek") {
        let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
        fromdatetime = weekStart;
        todatetime = weekEnd;
        console.log("Week Start:", weekStart);
        console.log("Week End:", weekEnd);
      }
      if (filterBy == "thismonth") {
        let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
        fromdatetime = monthStart;
        todatetime = monthEnd;
        console.log("Month Start:", monthStart);
        console.log("Month End:", monthEnd);
      }
      var currentdate = fromdatetime.getDate().toString().padStart(2, "0");
      var currentMnth = (fromdatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var year = fromdatetime.getFullYear();
      var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
      var currentdateEnd = todatetime.getDate().toString().padStart(2, "0");
      var currentMnthEnd = (todatetime.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      var yearEnd = todatetime.getFullYear();
      var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
      console.log("Start :", Start);
      console.log("End :", End);
    } else {
      var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
      var End = `${yyyy}-${mm}-${dd} 23:59:59`;
    }

    var sqlCount = `SELECT count(id) as cc_transfer_report FROM cc_transfer_report where id_user = ${id_user} and call_start_time between '${Start}' and '${End}' `;
    // var sql =  `SELECT cc_transfer_report.*, departments.name AS departmentName, u1.first_name AS landedAgentName, u2.first_name AS transferedAgentName, u3.first_name AS firstAttemptedAgentName FROM cc_transfer_report LEFT JOIN departments ON departments.id = cc_transfer_report.id_department LEFT JOIN user u1 ON u1.id = cc_transfer_report.landed_agent LEFT JOIN user u2 ON u2.id = cc_transfer_report.transfered_agent LEFT JOIN user u3 ON u3.id = cc_transfer_report.first_attempted_agent WHERE cc_transfer_report.id_user = ${id_user} AND cc_transfer_report.call_start_time BETWEEN '${Start}' AND '${End}' `
    var sql = `SELECT 
    cc_transfer_report.*, 
    departments.name AS departmentName, 
    u1.first_name AS landedAgentName, 
    u2.first_name AS transferedAgentName, 
    u3.first_name AS firstAttemptedAgentName,

    CASE 
        WHEN cc_transfer_report.initial_application = 'user' THEN CONCAT(ua.first_name, ' ', ua.last_name)
        WHEN cc_transfer_report.initial_application = 'smartgroup' THEN sg.name
        WHEN cc_transfer_report.initial_application = 'callflow' THEN cf.name
        ELSE NULL
    END AS initial_application_name,

    CASE 
        WHEN cc_transfer_report.final_application = 'user' THEN CONCAT(fu.first_name, ' ', fu.last_name)
        WHEN cc_transfer_report.final_application = 'smartgroup' THEN fsg.name
        WHEN cc_transfer_report.final_application = 'callflow' THEN fcf.name
        ELSE NULL
    END AS final_application_name

FROM cc_transfer_report

LEFT JOIN departments ON departments.id = cc_transfer_report.id_department
LEFT JOIN user u1 ON u1.id = cc_transfer_report.landed_agent
LEFT JOIN user u2 ON u2.id = cc_transfer_report.transfered_agent
LEFT JOIN user u3 ON u3.id = cc_transfer_report.first_attempted_agent

LEFT JOIN user ua ON ua.id = cc_transfer_report.initial_app_id AND cc_transfer_report.initial_application = 'user'
LEFT JOIN smart_group sg ON sg.id = cc_transfer_report.initial_app_id AND cc_transfer_report.initial_application = 'smartgroup'
LEFT JOIN call_flow cf ON cf.id = cc_transfer_report.initial_app_id AND cc_transfer_report.initial_application = 'callflow'

LEFT JOIN user fu ON fu.id = cc_transfer_report.final_app_id AND cc_transfer_report.final_application = 'user'
LEFT JOIN smart_group fsg ON fsg.id = cc_transfer_report.final_app_id AND cc_transfer_report.final_application = 'smartgroup'
LEFT JOIN call_flow fcf ON fcf.id = cc_transfer_report.final_app_id AND cc_transfer_report.final_application = 'callflow'

WHERE cc_transfer_report.id_user = ${id_user} 
  AND cc_transfer_report.call_start_time BETWEEN '${Start}' AND '${End}' `;

    if (isSubAdmin == 1) {
      sql += `AND cc_transfer_report.id_department in (${id_department}) `;
      sqlCount += `AND cc_transfer_report.id_department in (${id_department}) `;
    } else if (isDept == 1) {
      sql += `AND cc_transfer_report.id_department='${req.token.id}' `;
      sqlCount += `AND cc_transfer_report.id_department='${req.token.id}' `;
    } else if (isAgent == 1) {
      var agent_id = req.token.id;
      sql += `AND cc_transfer_report.id_department='${id_department}' AND (cc_transfer_report.transfered_agent=${agent_id} OR cc_transfer_report.landed_agent=${agent_id}) `;
      sqlCount += `AND cc_transfer_report.id_department='${id_department}' AND (cc_transfer_report.transfered_agent=${agent_id} OR cc_transfer_report.landed_agent=${agent_id}) `;
    }
    if (application != undefined) {
      sql += `AND cc_transfer_report.application = '${application}' `;
      sqlCount += `AND cc_transfer_report.application = '${application}' `;
    }
    if (sourceNumber != undefined) {
      sql += `AND (cc_transfer_report.customer_number like "%${sourceNumber}%") `;
      sqlCount += `AND cc_transfer_report.customer_number like "%${sourceNumber}%" `;
    }
    if (fromDuration != undefined && toDuration != undefined) {
      function timeToSeconds(timeString) {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
      }
      var fromDur = timeToSeconds(req.query.fromDuration);
      var toDur = timeToSeconds(req.query.toDuration);
      sqlCount += `and cc_transfer_report.total_duration between ${fromDur} and ${toDur} `;
      sql += `and cc_transfer_report.total_duration between ${fromDur} and ${toDur} `;
    }
    if (fromTime != undefined && toTime != undefined) {
      sqlCount += `and TIME(cc_transfer_report.call_start_time) between '${fromTime}' and '${toTime}' `;
      sql += `and TIME(cc_transfer_report.call_start_time) between '${fromTime}' and '${toTime}' `;
    }
    if (department_id != undefined) {
      sql += `AND cc_transfer_report.id_department='${department_id}' `;
      sqlCount += `AND cc_transfer_report.id_department='${department_id}' `;
    }
    if (transfer_call_status != undefined) {
      sql += `and cc_transfer_report.transfer_call_status = '${transfer_call_status}' `;
      sqlCount += `and cc_transfer_report.transfer_call_status = '${transfer_call_status}' `;
    }
    if (final_application != undefined) {
      sql += `and cc_transfer_report.final_application = '${final_application}' `;
      sqlCount += `and cc_transfer_report.final_application = '${final_application}' `;
    }
    if (initial_application != undefined) {
      sql += `and cc_transfer_report.initial_application = '${initial_application}' `;
      sqlCount += `and cc_transfer_report.initial_application = '${initial_application}' `;
    }
    if (first_attempted_agent != undefined) {
      sql += `and cc_transfer_report.first_attempted_agent = '${first_attempted_agent}' `;
      sqlCount += `and cc_transfer_report.first_attempted_agent = '${first_attempted_agent}' `;
    }
    if (transfered_agent != undefined) {
      sql += `and cc_transfer_report.transfered_agent = '${transfered_agent}' `;
      sqlCount += `and cc_transfer_report.transfered_agent = '${transfered_agent}' `;
    }
    sqlCount += `GROUP BY id `;
    sql += ` order by id desc `;
    var [result] = await rackServer.query(sql);
    var [count] = await rackServer.query(sqlCount);
    var total = count.length;
    res.locals.result = result;
    res.locals.count = total;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function toggleWorkTimeFilter(req, res) {
  try {
    const { value = 1 } = req.body;
    const { id_user } = req.token;

    await customers.update(
      { working_hours_filter: value },
      { where: { id: id_user } }
    );

    return res.status(200).json({
      status: true,
      result: {},
      message: "Work time filter updated successfully",
    });
  } catch (error) {
    console.error("Toggle work time error:", error);
    return res.status(500).json({
      status: false,
      result: {},
      message: "Something went wrong. Couldn't update work time filter.",
    });
  }
}

async function getWorkTimeFilterStatus(req, res) {
  try {
    const { id_user } = req.token;

    const { working_hours_filter } = await customers.findByPk(id_user, {
      attributes: ["working_hours_filter"],
    });

    return res
      .status(200)
      .json({
        status: true,
        result: { work_time_filter: working_hours_filter },
      });
  } catch (error) {
    console.error("get work time status:", error);
    return res.status(500).json({
      status: false,
      result: {},
      message: "Something went wrong. Couldn't get work time filter.",
    });
  }
}
async function get_livecall_by_uniqueid(req, res, next) {
  try {
    var uniqueId = req.query.uniqueId;
    var sql = `SELECT id,uniqueId,destination as did,barge_code FROM livecalls WHERE uniqueId = '${uniqueId}' `;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}
async function get_livecall(req, res, next) {
  try {
    var sql = `SELECT id,uniqueId,destination as did,barge_code FROM livecalls WHERE id_user = '${req.token.id_user}' `;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function add_phone_to_dnd(req, res, next) {
  try {
    const id_user = req.token.id_user
    let phone_number = req.body.phone_number
    const created_date = formatDateToMySQL(new Date());
    function formatDateToMySQL(created_date) {
    return created_date.toISOString().slice(0, 19).replace('T', ' ');
    }
    var sql = `insert into blacklist (id_user,created_date,phone_number) values ('${id_user}','${created_date}','${phone_number}') `;
    var [result] = await getConnection.query(sql);
    res.locals.result = result;
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

const getAllDids = asyncHandler(async(req, res) => {

  const { depIds } = req.query;
  let { id_user, department } = req.token;

  let departmentIds = [];

  if (typeof department === "number") { 
    departmentIds = [department];
  }else if(depIds) {
    departmentIds = depIds
      .toString()
      .split(",")
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id));
  }else if (typeof department === "string") {
    departmentIds = department
      .split(",")
      .map(id => parseInt(id.trim(), 10))
  }

  const operatorLookUp = {
    1: "bsnl",
    2: "idea",
    3: "vodafone",
    4: "airtel",
    5: "tata",
  }

  const statusLookUp = {
    1: "active",
    2: "demo",
    3: "disabled",
  }

  const sql = `
    SELECT did, operator, status
    FROM did
    WHERE id_user = :id_user AND id_department IN (:departmentIds)
  `;

  const dids = await getConnection.query(sql, {
    replacements: { id_user, departmentIds },
    type: getConnection.QueryTypes.SELECT,
  });

  const data = dids.map((did, i) => {
    return {
      id: i + 1,
      did: did.did,
      operator: operatorLookUp[did.operator],
      status: statusLookUp[did.status],
    }
  });

  return res.status(200).json(new ApiResponse(200, data));
});

async function get_unique_missedcallData(req, res, next) {
  try {
    var ipAddressV6 = requestIp.getClientIp(req);
    //  if (ipAddressV6 == "::ffff:139.167.212.210") {
    console.log("==================== inside api ====================");
    const id_user = 751;

    const now = new Date();

    // Start time = now minus 5 minutes
    let startTime = new Date(now.getTime() - 5 * 60 * 1000);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);

    // End time = start time + 4 min 59 sec
    let endTime = new Date(startTime.getTime() + 4 * 60 * 1000 + 59 * 1000);

    function formatDateToYYYYMMDD_HHMMSS(date) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const HH = String(date.getHours()).padStart(2, "0");
      const MM = String(date.getMinutes()).padStart(2, "0");
      const SS = String(date.getSeconds()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
    }

    startTime = formatDateToYYYYMMDD_HHMMSS(startTime);
    endTime = formatDateToYYYYMMDD_HHMMSS(endTime);

    console.log("Start:", startTime);
    console.log("End:", endTime);

    let query = {
      id_user: Number(id_user),
      latestCallStartTime: {
        $gte: startTime,
        $lte: endTime,
      },
    };
    var missedData = await uniqueMissedcallModel
      .find(query)
      .sort({ latestCallStartTime: -1 });

    var missedId = [];

    if (missedData.length != 0) {
      missedData.map(async (value) => {
        missedId.push(value.unique_missedcall_id);
      });
    }
    if (missedId.length != 0) {
      var sql = `SELECT id_user,id_department,sourceNumber as source,didNumber,missed_status,latestCallStartTime as received_date,callback_count from unique_missed_reports  WHERE id_user='${id_user}'  AND unique_missed_reports.id in(${missedId})`;
      var [result] = await getConnection.query(sql);
    }
    console.log("result_data ====================", result);
    res.locals.result = result || [];
    // } else {
    //   res.locals.result = [];
    // }
    next();
  } catch (err) {
    console.log(err);
    res.locals.result = "err";
    next();
  }
}

async function add_contacts_via_postman(req, res, next) {
  try {
    const data = req.body;
    var isAdmin = req.token.isAdmin;
    var isSubAdmin = req.token.isSubAdmin;
    var isDept = req.token.isDept;
    var id_user = req.token.id_user;
    var departement_id = req.query.id_department;
    if (departement_id != undefined) {
      var id_department = departement_id;
    } else if (isAdmin == 1) {
      var id_department = 0;
    } else if (isDept == 1) {
      var id_department = req.token.id;
    } else {
      var id_department = req.token.id_department;
    }

    const query = {
      phone_number: data.phone_number ,
      id_user: id_user,
    };
    if (isAdmin == 1) {
      query.id_department = 0;
    }
    if (isDept == 1) {
      query.id_department = Number(req.token.id);
    }
    if (isSubAdmin == 1) {
      query.id_department = { $in: req.token.id_department };
    }

    const projection = {
      name: 1,
      phone_number: 1,
      _id: 0,
    };

    let isContact = await contactsModel.find(query, projection).lean();

    if (isContact.length == 0) {
    data.id_user = Number(id_user);
    data.id_department = Number(id_department);
    // data.email = data.email.toLowerCase();

    // let isResultEmail = [];
    // if (data.email != "") {
    //   isResultEmail = await contactsModel.find({
    //     email: data.email.toLowerCase(),
    //     id_user: id_user,
    //     id_department
    //   });
    // }
    // if (isResultEmail.length == 0) {
      var result = await contactsModel.insertMany(data);
      res.locals.result = result;
    // } else {
    //   res.locals.result = "email existing";
    // }
    }else{
        res.locals.result = "existing";
    }
    next();
  } catch (err) {
    console.error(err);
    res.locals.result = "err";
    next();
  }
}

module.exports = {
  get_missedcall_count,
  get_answeredcall_count,
  get_incomingcall_count,
  get_notconnectedcall_count,
  get_outgoingcall_count,
  get_total_count,
  call_report_status,
  get_incomingcall,
  get_incomingcall_csv,
  get_incoming_missedcall,
  get_incoming_missedcall_csv,
  get_outgoingcall,
  get_outgoingcall_csv,
  get_misscall,
  get_misscall_csv,
  get_templates_by_id,
  get_templates,
  get_template_fields,
  piegraph_count,
  get_lead_status,
  get_ticket_status,
  get_customer_status,
  get_status,
  get_break_status_for_admin,
  get_duration_by_agentId,
  get_break_status,
  get_break_time_duration,
  get_did,
  get_all_did,
  update_password_did,
  get_agent_login_report,
  get_agent_login_csv_report,
  get_agent_percentage_call_report,
  get_agent_percentage_call_csv_report,
  get_agents_by_id_user,
  get_agents_selectBox,
  get_agents_and_ext_selectBox,
  update_popup_status,
  popup_status,
  incoming_report,
  missedCall_report,
  outgoing_report,
  get_outgoing_failed_calls,
  get_outgoing_failed_calls_csv,
  incoming_report_csv_report,
  missedCall_report_csv_report,
  outgoing_report_csv_report,
  get_duration,
  agent_activities_for_admin,
  agent_monitoring,
  get_unique_misscall_report,
  get_unique_misscall_report_csv,
  insert_template,
  download_template,
  insert_reminder,
  get_reminder,
  get_reminder_csv,
  get_all_reminder_by_agent,
  get_all_reminder_by_agent_csv,
  get_reminder_by_id,
  update_reminder,
  delete_reminder,
  delete_all_reminder,
  get_reminder_by_agent,
  update_reminder_status_by_id,
  csv_reminder_insert,
  get_reminder_logs,
  get_reminder_logs_by_agent,
  update_read_reminder,
  get_agents_by_id_user_bydept,
  insert_broadcast_event,
  get_all_broadcast_event,
  get_agent,
  get_musiconhold,
  get_audiofiles,
  get_subadmin_dept_by_id,
  get_hourly_duration_report,
  get_hourly_duration_by_support,
  get_dashboard_call_count,
  dashboard_agent_list,
  add_roundrobin_allocation,
  get_uniqueId_roundrobin,
  get_livecalls_report,
  get_campaign_count,
  updateAgentDetails,
  get_department,
  add_smart_group,
  get_smart_group,
  get_idBy_smart_group,
  update_smart_group,
  update_smart_group_password,
  delete_smart_group,
  smart_group_selectbox,
  get_all_agent,
  update_agent_callrecording,
  add_audiofile,
  update_audiofile,
  get_all_audiofile,
  get_audiofile_by_id,
  delete_audiofile,
  get_reminder_with_template_id,
  get_agent_by_query,
  get_agents_for_agent_login,
  add_agents,
  get_agents,
  get_agents_by_id,
  update_agents,
  delete_agents,

  add_ext,
  update_ext,
  delete_ext,
  get_all_ext,
  get_ext_by_id,

  add_callgroup,
  get_all_callgroup,
  get_all_callgroup_by_id,
  update_callgroup,
  delete_callgroup,
  get_did_selectbox,

  add_smartvoice_sms_provider,
  get_smartvoice_all_sms,
  get_smartvoice_sms_provider_by_id,
  get_smartvoice_sms_provider_by_id_admin,
  get_smartvoice_sms_provider_by_provider_id,
  update_smartvoice_sms_provider,
  delete_smartvoice_sms_provider,

  add_smartvoice_whatsapp_provider,
  get_smartvoice_whatsapp_provider_by_id,
  get_smartvoice_whatsapp_provider_by_id_admin,
  get_smartvoice_all_whatsapp,
  get_smartvoice_whatsapp_provider_by_provider_id,
  update_smartvoice_whatsapp_provider,
  delete_smartvoice_whatsapp_provider,

  add_smartvoice_api_provider,
  get_smartvoice_all_api,
  get_smartvoice_api_provider_by_id,
  get_smartvoice_api_provider_by_id_admin,
  get_smartvoice_api_provider_by_provider_id,
  update_smartvoice_api_provider,
  delete_smartvoice_api_provider,

  get_data_as_axios,
  get_all_provider,
  get_did_numbers,
  update_did_numbers,
  update_did_values,
  get_did_settings,
  get_did_template,
  update_did_settings,
  get_score_card,

  add_customer_plan,
  get_customer_plan_by_id,
  get_customer_plan_by_customer_id,
  update_customer_plan_by_id,
  update_customer_plan_by_customer_id,
  delete_customer_plan_by_id,
  delete_customer_plan_by_customer_id,

  dashboard_campaign_count,
  dashboard_incoming_weekly_report,
  dashboard_agent_activity,
  dashboard_call_count,
  dashboard_call_report,
  dashboard_outgoing_call_status,
  dashboard_incoming_call_status,
  dashboard_Channel_count,
  dashboard_incoming_and_outgoing_count,
  agent_status_count_outgoing,
  agent_dashboard_agent_activity,
  agent_dashboard_call_count,

  add_breaks_data,
  get_breaks_data,
  get_workactivity_data,
  get_breaks_data_by_id,
  update_breaks_data,
  delete_breaks_data,

  add_did_grouping,
  update_did_grouping,
  delete_did_grouping,
  get_all_did_grouping,
  get_did_grouping_by_id,
  get_all_did_grouping_selectBox,

  add_did_group_setting,
  update_did_group_setting,
  delete_did_group_setting,
  get_all_did_group_setting,
  get_did_group_setting_by_id,
  get_did_group_setting_by_grouping,

  add_blacklist,
  update_blacklist,
  delete_blacklist,
  get_all_blacklist,
  get_blacklist_by_id,
  get_blacklist_selectbox,
  update_blacklist_by_did,
  delete_blacklist_contacts,
  get_by_blacklist_contacts,
  update_blacklist_contact,

  old_incoming_report,
  old_outgoing_report,
  get_old_unique_misscall_report,

  add_unique_missedcall_call_log,
  get_unique_missedcall_call_log,
  get_all_customer_logs,

  user_summary,
  add_live_calls,
  get_sms_report,
  insert_default_template,
  update_default_template,
  get_default_template_flag,
  get_default_template_on_callpopup,

  getDepartmentSummary,
  callrecord_byot,
  add_contacts,
  update_contacts,
  delete_contacts,
  get_contacts,
  get_contacts_by_id,
  get_transport_report,
  get_transport_report_csv,
  contact_phn_number_checking,
  toggleWorkTimeFilter,
  getWorkTimeFilterStatus,
  add_csv_contacts,
  get_livecall_by_uniqueid,
  get_livecall,
  getAllDids,
  add_phone_to_dnd,
  get_unique_missedcallData,
  add_contacts_via_postman
};
