var express = require('express');
var router = express.Router();
const { isAuthenticated,verifyTokenAutox } = require( '../helper/auth' );
const callcenterCtrl = require('../controller/callcenterCtrl');
const { exec } = require('child_process');
const multer = require('multer');
var fs = require('fs');
const path = require('path');
const Customers = require('../model/customers');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${process.env.file_PATH}/audio`);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        if(process.env.PRODUCTION == 'development'){
            cb(null, 'mono'+file.fieldname + '-' + uniqueSuffix + extension);
        }else{
            cb(null, file.fieldname + '-' + uniqueSuffix + extension);
        }
    },
});


const storageForAgents = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/agent');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage }).fields([
    { name: 'browsed_file', maxCount: 50 }
])

const upload_image = multer({ storage: storageForAgents }).any();

router.get('/get_missedcall_count', isAuthenticated, callcenterCtrl.get_missedcall_count, function (req, res, next) {
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
            missedcall: res.locals.result,
        }
        res.status(200).json(status);
    }
});
router.get('/get_answeredcall_count', isAuthenticated, callcenterCtrl.get_answeredcall_count, function (req, res, next) {
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
            answeredCall: res.locals.result,
        }
        res.status(200).json(status);
    }
});
router.get('/get_incomingcall_count', isAuthenticated, callcenterCtrl.get_incomingcall_count, function (req, res, next) {
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
            incomingcall: res.locals.result,
            duration: res.locals.duration,
            answeredCall:res.locals.answeredCall
        }
        res.status(200).json(status);
    }
});
router.get('/get_notconnectedcall_count', isAuthenticated, callcenterCtrl.get_notconnectedcall_count, function (req, res, next) {
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
            notconnectCall: res.locals.result,
        }
        res.status(200).json(status);
    }
});
router.get('/get_outgoingcall_count', isAuthenticated, callcenterCtrl.get_outgoingcall_count, function (req, res, next) {
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
            outgoingcall: res.locals.result,
            duration: res.locals.duration
        }
        res.status(200).json(status);
    }
});
router.get('/get_total_count', isAuthenticated, callcenterCtrl.get_total_count, function (req, res, next) {
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
            totalCount: res.locals.result,
            totalDuration: res.locals.duration
        }
        res.status(200).json(status);
    }
});

router.get('/call_report_status', isAuthenticated, callcenterCtrl.call_report_status, function (req, res, next) {
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

router.get('/get_incomingcall', isAuthenticated, callcenterCtrl.get_incomingcall, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_incomingcall_csv', isAuthenticated, callcenterCtrl.get_incomingcall_csv, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_incoming_missedcall', isAuthenticated, callcenterCtrl.get_incoming_missedcall, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_incoming_missedcall_csv', isAuthenticated, callcenterCtrl.get_incoming_missedcall_csv, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_outgoingcall', isAuthenticated, callcenterCtrl.get_outgoingcall, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_outgoingcall_csv', isAuthenticated, callcenterCtrl.get_outgoingcall_csv, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_misscall', isAuthenticated, callcenterCtrl.get_misscall, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_misscall_csv', isAuthenticated, callcenterCtrl.get_misscall_csv, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_templates_by_id', isAuthenticated, callcenterCtrl.get_templates_by_id, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0 && res.locals.default_dataform_id == undefined ) {
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
            total: res.locals.count,
            default_dataform_id:res.locals.default_dataform_id
        }
        res.status(200).json(status);
    } 
});
router.get('/get_templates', isAuthenticated, callcenterCtrl.get_templates, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_template_fields', isAuthenticated, callcenterCtrl.get_template_fields, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0 && res.locals.default_dataform_id == undefined && res.locals.isCallTaskRequired.length == 0 ) {
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
            sms:res.locals.sms,
            integration : res.locals.integration,
            default_callTask_id : res.locals.default_dataform_id,
            isCallTaskRequired: res.locals.isCallTaskRequired
        }
        res.status(200).json(status);
    }
});

router.get('/piegraph_count', isAuthenticated, callcenterCtrl.piegraph_count, function (req, res, next) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});

router.get('/get_lead_status', isAuthenticated, callcenterCtrl.get_lead_status, function (req, res, next) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.get('/get_ticket_status', isAuthenticated, callcenterCtrl.get_ticket_status, function (req, res, next) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.get('/get_customer_status', isAuthenticated, callcenterCtrl.get_customer_status, function (req, res, next) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.get('/get_status', isAuthenticated, callcenterCtrl.get_status, function (req, res, next) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});

// router.get('/add_break_time', isAuthenticated, callcenterCtrl.add_break_time, ami.call_pouse, function (req, res, next) {
router.get('/add_break_time', isAuthenticated, callcenterCtrl.add_break_time, function (req, res, next) {
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
        // if(res.locals.result == 0)
        // ami.unpouse_sip(req.token.regNumber,false)
        // else ami.unpouse_sip(req.token.regNumber,true)
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.get('/get_duration_by_agentId', isAuthenticated, callcenterCtrl.get_duration_by_agentId, function (req, res, next) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.get('/get_break_status', isAuthenticated, callcenterCtrl.get_break_status, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_break_status_for_admin', isAuthenticated, callcenterCtrl.get_break_status_for_admin, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.get('/get_break_time_duration', isAuthenticated, callcenterCtrl.get_break_time_duration, function (req, res, next) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.get('/get_did', isAuthenticated, callcenterCtrl.get_did, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_did', isAuthenticated, callcenterCtrl.get_all_did, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/update_password_did', isAuthenticated, callcenterCtrl.update_password_did, function (req, res, next) {
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

router.get('/get_agent_login_report', isAuthenticated, callcenterCtrl.get_agent_login_report, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_agent_login_csv_report', isAuthenticated, callcenterCtrl.get_agent_login_csv_report, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_agent_percentage_call_report', isAuthenticated, callcenterCtrl.get_agent_percentage_call_report, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_agent_percentage_call_csv_report', isAuthenticated, callcenterCtrl.get_agent_percentage_call_csv_report, function (req, res, next) {
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
            total: res.locals.count,
            totalCalls: res.locals.total
        }
        res.status(200).json(status);
    }
});
router.get('/get_agents_by_id_user', isAuthenticated, callcenterCtrl.get_agents_by_id_user, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_agents_selectBox', isAuthenticated, callcenterCtrl.get_agents_selectBox, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_agents_and_ext_selectBox', isAuthenticated, callcenterCtrl.get_agents_and_ext_selectBox, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/update_popup_status',isAuthenticated, callcenterCtrl.update_popup_status, function (req, res, next) {
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
        // if (res.locals.breaks == 'Available') {
        //     ami.unpouse_sip(res.locals.regNumber, false)
        // } else {
        //     ami.unpouse_sip(res.locals.regNumber, true)
        // }
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/popup_status', callcenterCtrl.popup_status, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/incoming_report',isAuthenticated, callcenterCtrl.incoming_report, function (req, res, next) {
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
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});
router.get('/missedCall_report', isAuthenticated, callcenterCtrl.missedCall_report, function (req, res, next) {
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
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});
router.get('/outgoing_report', isAuthenticated, callcenterCtrl.outgoing_report, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_outgoing_failed_calls', isAuthenticated, callcenterCtrl.get_outgoing_failed_calls, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_outgoing_failed_calls_csv', isAuthenticated, callcenterCtrl.get_outgoing_failed_calls_csv, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/incoming_report_csv_report', isAuthenticated, callcenterCtrl.incoming_report_csv_report, function (req, res, next) {
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
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});
router.get('/missedCall_report_csv_report', isAuthenticated, callcenterCtrl.missedCall_report_csv_report, function (req, res, next) {
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
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});
router.get('/outgoing_report_csv_report', isAuthenticated, callcenterCtrl.outgoing_report_csv_report, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_duration', isAuthenticated, callcenterCtrl.get_duration, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.get('/agent_activities_for_admin', isAuthenticated, callcenterCtrl.agent_activities_for_admin, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/user_summary', isAuthenticated, callcenterCtrl.user_summary, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/agent_monitoring', isAuthenticated, callcenterCtrl.agent_monitoring, function (req, res, next) {
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
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});
router.get('/get_unique_misscall_report', isAuthenticated, callcenterCtrl.get_unique_misscall_report, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_unique_misscall_report_csv', isAuthenticated, callcenterCtrl.get_unique_misscall_report_csv, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.post('/insert_template', isAuthenticated, callcenterCtrl.insert_template, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 'exist') {
        var status = {
            'status': false,
            'message': "name is already exist",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 'not matched fields') {
        var status = {
            'status': false,
            'message': "fields are not matched",
            result: []
        }
        res.status(202).json(status);
    }
    // else if (res.locals.result == 'another crm') {
    //     var status = {
    //         'status': false,
    //         'message': "This user is not in this CRM",
    //         result: []
    //     }
    //     res.status(202).json(status);
    // }
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
            collectionId:res.locals.collectionId
        }
        res.status(200).json(status);
    }
});
router.get('/download_template', isAuthenticated, callcenterCtrl.download_template, function (req, res, next) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});

router.get('/pouse_call', isAuthenticated, function (req, res, next) {
    // ami.unpouse_sip(req.token.regNumber, true)

    var status = {
        'status': true,
        'message': "succesfull response",
        result: "success"
    }
    res.status(200).json(status);
});
router.post('/convert', async (req, res) => {
    var filename = req.body.filename;
    const gsmFilePath = "/home/callcenter/customers/content/incomingrecordings/" + filename;
    const wavFileName = filename.replace('.gsm', '.wav');
    const wavFilePath = "/home/voxbay/agent_portal/next/public/" + wavFileName
    var response = new Promise((resolve, reject) => {
        const command = `sox ${gsmFilePath} ${wavFilePath}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error converting .gsm to .wav: ${error.message}`);
                reject(error);
            } else {
                // res.download(wavFilePath, 'output.wav', (err) => {
                //     if (err) {
                //       console.error('Error downloading converted file:', err);
                //     }
                //   });

                console.log(`Conversion complete. Output file: ${wavFilePath}`);
                resolve(wavFilePath);
            }
        });
    });
    var output = await response;
    //   const fs = require('fs');
    //     const path = require('path');
    //     const filePath = path.join(output, wavFileName);
    //     const fileStream = fs.createReadStream(output);
    //     res.setHeader('Content-Type', 'audio/wav');
    //     res.setHeader('Content-Disposition', 'attachment; filename='+wavFileName);
    //     fileStream.pipe(res);
    var status = {
        'status': true,
        'message': "succesfull response",
        output: output,
        result: "http://192.168.40.225:8083/callrecordings/" + wavFileName,
        filename: wavFileName
    }
    res.status(200).json(status);
});

router.post('/insert_reminder', isAuthenticated, callcenterCtrl.insert_reminder, function (req, res, next) {
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
router.get('/get_reminder', isAuthenticated, callcenterCtrl.get_reminder, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result found",
            result: []
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_reminder_with_template_id', isAuthenticated, callcenterCtrl.get_reminder_with_template_id, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result found",
            result: []
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_reminder_csv', isAuthenticated, callcenterCtrl.get_reminder_csv, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result found",
            result: []
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_reminder_by_agent', isAuthenticated, callcenterCtrl.get_all_reminder_by_agent, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result found",
            result: []
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_reminder_by_agent_csv', isAuthenticated, callcenterCtrl.get_all_reminder_by_agent_csv, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result found",
            result: []
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_reminder_by_id', isAuthenticated, callcenterCtrl.get_reminder_by_id, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result found",
            result: []
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
router.post('/update_reminder', isAuthenticated, callcenterCtrl.update_reminder, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result Found",
            result: []
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
router.get('/delete_reminder', isAuthenticated, callcenterCtrl.delete_reminder, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result Found",
            result: []
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
router.get('/delete_all_reminder', isAuthenticated, callcenterCtrl.delete_all_reminder, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result Found",
            result: []
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
router.get('/get_reminder_by_agent', isAuthenticated, callcenterCtrl.get_reminder_by_agent, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result Found",
            result: []
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});
router.post('/update_reminder_status_by_id', isAuthenticated, callcenterCtrl.update_reminder_status_by_id, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result Found",
            result: []
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
router.post('/csv_reminder_insert', isAuthenticated, callcenterCtrl.csv_reminder_insert, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result Found",
            result: []
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
router.get('/get_reminder_logs', isAuthenticated, callcenterCtrl.get_reminder_logs, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result Found",
            result: []
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
router.get('/get_reminder_logs_by_agent', isAuthenticated, callcenterCtrl.get_reminder_logs_by_agent, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result Found",
            result: []
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
router.post('/update_read_reminder', isAuthenticated, callcenterCtrl.update_read_reminder, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result Found",
            result: []
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

router.post('/insert_broadcast_event', isAuthenticated, callcenterCtrl.insert_broadcast_event, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result Found",
            result: []
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
router.get('/get_all_broadcast_event', isAuthenticated, callcenterCtrl.get_all_broadcast_event, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result found",
            result: []
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_agents_by_id_user_bydept', isAuthenticated, callcenterCtrl.get_agents_by_id_user_bydept, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.get('/get_agent', isAuthenticated, callcenterCtrl.get_agent, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result found",
            result: []
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

router.get('/get_musiconhold', isAuthenticated, callcenterCtrl.get_musiconhold, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result found",
            result: []
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

router.get('/get_audiofiles', isAuthenticated, callcenterCtrl.get_audiofiles, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 0) {
        var status = {
            'status': false,
            'message': "No result found",
            result: []
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

router.get('/get_subadmin_dept_by_id',isAuthenticated,callcenterCtrl.get_subadmin_dept_by_id,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result }
             res.status(200).json(status);
     }
});
router.get('/get_hourly_duration_report',isAuthenticated,callcenterCtrl.get_hourly_duration_report,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",liveCampaignStatus: res.locals.result,supportTeam: res.locals.result1,agentCount:res.locals.count  }
             res.status(200).json(status);
     }
});
router.get('/get_hourly_duration_by_support',isAuthenticated,callcenterCtrl.get_hourly_duration_by_support,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result,agentCount:res.locals.count  }
             res.status(200).json(status);
     }
});

router.get('/get_dashboard_call_count',isAuthenticated,callcenterCtrl.get_dashboard_call_count,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result ,liveCall:res.locals.liveCall}
             res.status(200).json(status);
     }
});
router.get('/dashboard_agent_list',isAuthenticated,callcenterCtrl.dashboard_agent_list,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result }
             res.status(200).json(status);
     }
});
router.get('/get_livecalls_report',isAuthenticated,callcenterCtrl.get_livecalls_report,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result }
             res.status(200).json(status);
     }
});
router.get('/get_campaign_count',isAuthenticated,callcenterCtrl.get_campaign_count,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result }
             res.status(200).json(status);
     }
});

router.get('/get_uniqueId_roundrobin',isAuthenticated,callcenterCtrl.get_uniqueId_roundrobin,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result : res.locals.result }
             res.status(200).json(status);
     }
});
router.get('/get_department', isAuthenticated, callcenterCtrl.get_department, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.post('/add_smart_group',isAuthenticated,callcenterCtrl.add_smart_group,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result === "unique_id_required") {
        var status = {'status' : false,'message' :"unique_id_required",result: [] }
        res.status(202).json(status);
     }
     else if(res.locals.result === "already_in_use") {
        var status = {'status' : false,'message' :"already_in_use",result: [] }
        res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else if(res.locals.result == 'Email_existing' ){
         var status = {'status' : false,'message' :"Email id is already existing",result: []}
            res.status(201).json(status);
     }
     else if(res.locals.result == 'existing' ){
        var status = {'status' : false,'message' :"Name is already exist",result: []}
           res.status(201).json(status);
    }else if (res.locals.result == "byot_error") {
        var status = {
            'status': false,
            'message': "Failed to create smartgroup (byot error)",
            result: [],
        }
        res.status(201).json(status);
    }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result }
             res.status(200).json(status);
     }
});
router.get('/get_smart_group',isAuthenticated,callcenterCtrl.get_smart_group,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result,total: res.locals.total }
             res.status(200).json(status);
     }
});
router.get('/get_idBy_smart_group',isAuthenticated,callcenterCtrl.get_idBy_smart_group,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",smartgroup : res.locals.result }
             res.status(200).json(status);
     }
});
router.post('/update_smart_group',isAuthenticated,callcenterCtrl.update_smart_group,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result === "already_in_use") {
        var status = {'status' : false,'message' :"already_in_use",result: [] }
        res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else if(res.locals.result == 'Email_existing' ){
        var status = {'status' : false,'message' :"Email id is already existing",result: []}
           res.status(201).json(status);
    }
     else if(res.locals.result == 'existing' ){
        var status = {'status' : false,'message' :"Name is already exist",result: []}
           res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result }
             res.status(200).json(status);
     }
});
router.post('/update_smart_group_password',isAuthenticated,callcenterCtrl.update_smart_group_password,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else if(res.locals.result == 'existing' ){
        var status = {'status' : false,'message' :"Name is already exist",result: []}
           res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result }
             res.status(200).json(status);
     }
});
router.get('/delete_smart_group',isAuthenticated,callcenterCtrl.delete_smart_group,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result }
             res.status(200).json(status);
     }
});
router.get('/smart_group_selectbox',isAuthenticated,callcenterCtrl.smart_group_selectbox,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result,total: res.locals.total }
             res.status(200).json(status);
     }
});

router.get('/get_all_agent',isAuthenticated,callcenterCtrl.get_all_agent,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result,total: res.locals.total }
             res.status(200).json(status);
     }
});
router.post('/update_agent_callrecording',isAuthenticated,callcenterCtrl.update_agent_callrecording,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result,total: res.locals.total }
             res.status(200).json(status);
     }
});

router.post('/add_audiofile',isAuthenticated, upload ,callcenterCtrl.add_audiofile,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result,total: res.locals.total }
             res.status(200).json(status);
     }
});
router.post('/update_audiofile',isAuthenticated,callcenterCtrl.update_audiofile,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result,total: res.locals.total }
             res.status(200).json(status);
     }
});
router.get('/get_all_audiofile',isAuthenticated,callcenterCtrl.get_all_audiofile,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result,total: res.locals.total }
             res.status(200).json(status);
     }
});
router.get('/get_audiofile_by_id',isAuthenticated,callcenterCtrl.get_audiofile_by_id,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result,total: res.locals.total }
             res.status(200).json(status);
     }
});
router.get('/delete_audiofile',isAuthenticated,callcenterCtrl.delete_audiofile,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result,total: res.locals.total }
             res.status(200).json(status);
     }
});
router.get('/get_agent_by_query',isAuthenticated,callcenterCtrl.get_agent_by_query,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result,total: res.locals.total }
             res.status(200).json(status);
     }
});
router.get('/get_agents_for_agent_login',isAuthenticated,callcenterCtrl.get_agents_for_agent_login,function(req, res, next) {
    if(res.locals.result == 'err' )
     {
         var status = {'status' : false,'message' :"Something went wrong",result: [] }
             res.status(202).json(status);
     }
     else if(res.locals.result.length == 0){
         var status = {'status' : true,'message' :"No result Found",result: [] }
             res.status(201).json(status);
     }
     else{
         var status = {'status' : true,'message' :"succesfull response",result: res.locals.result,total: res.locals.total }
             res.status(200).json(status);
     }
});
router.post('/add_agents', isAuthenticated,upload_image, callcenterCtrl.add_agents, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Email id is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_agents', isAuthenticated, callcenterCtrl.get_agents, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_agents_by_id', isAuthenticated, callcenterCtrl.get_agents_by_id, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/update_agents', isAuthenticated,upload_image,callcenterCtrl.update_agents, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/delete_agents', isAuthenticated, callcenterCtrl.delete_agents, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.post('/add_smartvoice_sms_provider', isAuthenticated, callcenterCtrl.add_smartvoice_sms_provider, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Email id is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_smartvoice_all_sms', isAuthenticated, callcenterCtrl.get_smartvoice_all_sms, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Email id is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_smartvoice_sms_provider_by_id_admin', isAuthenticated, callcenterCtrl.get_smartvoice_sms_provider_by_id_admin, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Email id is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_smartvoice_sms_provider_by_id', isAuthenticated, callcenterCtrl.get_smartvoice_sms_provider_by_id, function (req, res, next) {
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
router.post('/update_smartvoice_sms_provider', isAuthenticated, callcenterCtrl.update_smartvoice_sms_provider, function (req, res, next) {
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
router.get('/delete_smartvoice_sms_provider', isAuthenticated, callcenterCtrl.delete_smartvoice_sms_provider, function (req, res, next) {
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



router.post('/add_smartvoice_whatsapp_provider', isAuthenticated, callcenterCtrl.add_smartvoice_whatsapp_provider, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Email id is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_smartvoice_all_whatsapp', isAuthenticated, callcenterCtrl.get_smartvoice_all_whatsapp, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Email id is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_smartvoice_whatsapp_provider_by_id_admin', isAuthenticated, callcenterCtrl.get_smartvoice_whatsapp_provider_by_id_admin, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Email id is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_smartvoice_whatsapp_provider_by_id', isAuthenticated, callcenterCtrl.get_smartvoice_whatsapp_provider_by_id, function (req, res, next) {
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
router.post('/update_smartvoice_whatsapp_provider', isAuthenticated, callcenterCtrl.update_smartvoice_whatsapp_provider, function (req, res, next) {
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
router.get('/delete_smartvoice_whatsapp_provider', isAuthenticated, callcenterCtrl.delete_smartvoice_whatsapp_provider, function (req, res, next) {
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



router.post('/add_smartvoice_api_provider',isAuthenticated, callcenterCtrl.add_smartvoice_api_provider, function (req, res, next) {
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
router.get('/get_smartvoice_all_api', isAuthenticated, callcenterCtrl.get_smartvoice_all_api, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Email id is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_smartvoice_api_provider_by_id_admin', isAuthenticated, callcenterCtrl.get_smartvoice_api_provider_by_id_admin, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Email id is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_smartvoice_api_provider_by_id', isAuthenticated, callcenterCtrl.get_smartvoice_api_provider_by_id, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Email id is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/update_smartvoice_api_provider', isAuthenticated, callcenterCtrl.update_smartvoice_api_provider, function (req, res, next) {
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
router.get('/delete_smartvoice_api_provider', isAuthenticated, callcenterCtrl.delete_smartvoice_api_provider, function (req, res, next) {
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


router.post('/add_callgroup', isAuthenticated, callcenterCtrl.add_callgroup, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Email id is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/update_callgroup', isAuthenticated,callcenterCtrl.update_callgroup, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_callgroup', isAuthenticated, callcenterCtrl.get_all_callgroup, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_callgroup_by_id', isAuthenticated, callcenterCtrl.get_all_callgroup_by_id, function (req, res, next) {
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
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});
router.get('/delete_callgroup', isAuthenticated, callcenterCtrl.delete_callgroup, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_did_selectbox', isAuthenticated, callcenterCtrl.get_did_selectbox, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
 
router.post('/add_ext', isAuthenticated, callcenterCtrl.add_ext, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Email id is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/update_ext', isAuthenticated,callcenterCtrl.update_ext, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/delete_ext', isAuthenticated, callcenterCtrl.delete_ext, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_ext', isAuthenticated, callcenterCtrl.get_all_ext, function (req, res, next) {
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
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});
router.get('/get_ext_by_id', isAuthenticated, callcenterCtrl.get_ext_by_id, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.get('/get_all_provider',isAuthenticated, callcenterCtrl.get_all_provider, function (req, res, next) {
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
router.get('/get_data_as_axios',isAuthenticated, callcenterCtrl.get_data_as_axios, function (req, res, next) {
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

router.get('/get_did_numbers',isAuthenticated, callcenterCtrl.get_did_numbers, function (req, res, next) {
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
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});

router.post('/update_did_numbers',isAuthenticated, callcenterCtrl.update_did_numbers, function (req, res, next) {
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
router.post('/update_did_values',isAuthenticated, callcenterCtrl.update_did_values, function (req, res, next) {
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

router.post('/add_customer_plan',isAuthenticated, callcenterCtrl.add_customer_plan, function (req, res, next) {
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

router.get('/get_customer_plan_by_id',isAuthenticated, callcenterCtrl.get_customer_plan_by_id, function (req, res, next) {
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

router.get('/get_customer_plan_by_customer_id',isAuthenticated, callcenterCtrl.get_customer_plan_by_customer_id, function (req, res, next) {
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

router.post('/update_customer_plan_by_id',isAuthenticated, callcenterCtrl.update_customer_plan_by_id, function (req, res, next) {
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

router.post('/update_customer_plan_by_customer_id',isAuthenticated, callcenterCtrl.update_customer_plan_by_customer_id, function (req, res, next) {
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

router.get('/delete_customer_plan_by_id',isAuthenticated, callcenterCtrl.delete_customer_plan_by_id, function (req, res, next) {
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

router.get('/delete_customer_plan_by_customer_id',isAuthenticated, callcenterCtrl.delete_customer_plan_by_customer_id, function (req, res, next) {
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

router.get('/dashboard_campaign_count',isAuthenticated, callcenterCtrl.dashboard_campaign_count, function (req, res, next) {
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
router.get('/dashboard_incoming_weekly_report',isAuthenticated, callcenterCtrl.dashboard_incoming_weekly_report, function (req, res, next) {
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
router.get('/dashboard_agent_activity',isAuthenticated, callcenterCtrl.dashboard_agent_activity, function (req, res, next) {
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
            other_counts: res.locals.other_counts,
            total_today_Login: res.locals.total_today_Login
        }
        res.status(200).json(status);
    }
});
router.get('/dashboard_call_count',isAuthenticated, callcenterCtrl.dashboard_call_count, function (req, res, next) {
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
router.get('/dashboard_call_report',isAuthenticated, callcenterCtrl.dashboard_call_report, function (req, res, next) {
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
router.get('/dashboard_outgoing_call_status',isAuthenticated, callcenterCtrl.dashboard_outgoing_call_status, function (req, res, next) {
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
router.get('/dashboard_incoming_call_status',isAuthenticated, callcenterCtrl.dashboard_incoming_call_status, function (req, res, next) {
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
router.get('/dashboard_Channel_count',isAuthenticated, callcenterCtrl.dashboard_Channel_count, function (req, res, next) {
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

router.post('/add_breaks_data',isAuthenticated, callcenterCtrl.add_breaks_data, function (req, res, next) {
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
router.get('/get_breaks_data',isAuthenticated, callcenterCtrl.get_breaks_data, function (req, res, next) {
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
router.get('/get_workactivity_data',isAuthenticated, callcenterCtrl.get_workactivity_data, function (req, res, next) {
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
router.get('/get_breaks_data_by_id',isAuthenticated, callcenterCtrl.get_breaks_data_by_id, function (req, res, next) {
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
router.post('/update_breaks_data',isAuthenticated, callcenterCtrl.update_breaks_data, function (req, res, next) {
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
router.get('/delete_breaks_data',isAuthenticated, callcenterCtrl.delete_breaks_data, function (req, res, next) {
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
router.get('/get_audiofile_path/:filename',isAuthenticated, function (req, res, next) {
    const filePath = path.join(`${process.env.AUDIOFILE_PATH}/audio/`, req.params.filename);
    console.log("filePath ------>",filePath)
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }
    res.sendFile(filePath, err => {
        if (err) {
            console.error("Error sending file:", err);
            if (!res.headersSent) {
                res.status(500).send('Error sending file');
            }
        }
    });
    // res.sendFile(filePath, err => {
    //     if (err) {
    //         res.status(404).send('File not found');
    //     }
    // });
});
router.get('/get_incoming_callrecordings/:filename/:date', isAuthenticated, function (req, res, next) {
    if (req.token.isAdmin == 1) {
        var id_user = req.token.id;
    } else {
        var id_user = req.token.id_user;
    }
    const formatDate = () => {
        const date = req.params.date;
        const day = date.split('-')[2];
        const month = date.split('-')[1];
        const year = date.split('-')[0];
        return `${day}${month}${year}`;

    };
    var date = formatDate()
    console.log(date);
    const filePath = path.join(`${process.env.CALLRECORDING_PATH}/${id_user}/${date}/incoming`, req.params.filename);
    console.log(filePath)
    res.sendFile(filePath, err => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});
router.get('/incoming_callrecord_byot/:filename/:date', isAuthenticated, callcenterCtrl.callrecord_byot("incoming"), function(req, res, next) {
    
    //handle error
    const { statusCode = 500, message = "something went wrong", result = [] } = res.locals.result || {};
    
    let status = {
        status: false,
        message: message,
        result
    }
    res.status(statusCode).json(status)
})
router.get('/outgoing_callrecord_byot/:filename/:date', isAuthenticated, callcenterCtrl.callrecord_byot("outgoing"), function(req, res, next) {

    //handle error
    const { statusCode = 500, message = "something went wrong", result = [] } = res.locals.result || {};
    
    let status = {
        status: false,
        message: message,
        result
    }
    res.status(statusCode).json(status)
})
router.get('/get_outgoing_callrecordings/:filename/:date', isAuthenticated, function (req, res, next) {
    if (req.token.isAdmin == 1) {
        var id_user = req.token.id;
    } else {
        var id_user = req.token.id_user;
    }
    const formatDate = () => {
        const date = req.params.date;
        const day = date.split('-')[2];
        const month = date.split('-')[1];
        const year = date.split('-')[0];

        return `${day}${month}${year}`;
    };
    var date = formatDate()
    console.log(date);
    const filePath = path.join(`${process.env.CALLRECORDING_PATH}/${id_user}/${date}/outgoing`, req.params.filename);
    console.log(filePath)
    res.sendFile(filePath, err => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});
router.get('/get_incoming_callrecordings_without_token/:filename/:date/:id_user', async function (req, res, next) {
    var id_user = req.params.id_user;

    const { byot } = await Customers.findByPk(id_user, { attributes: ["id", "byot"] });
    if(byot) return next();
    
    const formatDate = () => {
        const date = req.params.date;
        const day = date.split('-')[2];
        const month = date.split('-')[1];
        const year = date.split('-')[0];
        return `${day}${month}${year}`;

    };
    var date = formatDate()
    console.log(date);
    const filePath = path.join(`${process.env.CALLRECORDING_PATH}/${id_user}/${date}/incoming`, req.params.filename);
    console.log(filePath)
    res.sendFile(filePath, err => {
        if (err) {
            if (!res.headersSent) { // Ensure headers are not already sent
                res.status(err.code === 'ENOENT' ? 404 : 500).send('File not found');
            } else {
                console.error("Headers already sent, cannot modify response.");
            }
        }
    });
}, callcenterCtrl.callrecord_byot("incoming"));

router.get('/get_outgoing_callrecordings_without_token/:filename/:date/:id_user', async function (req, res, next) {
    var id_user = req.params.id_user;

    
    const { byot } = await Customers.findByPk(id_user, { attributes: ["id", "byot"] });
    if(byot) return next();
    
    const formatDate = () => {
        const date = req.params.date;
        const day = date.split('-')[2];
        const month = date.split('-')[1];
        const year = date.split('-')[0];

        return `${day}${month}${year}`;
    };
    var date = formatDate()
    console.log(date);
    const filePath = path.join(`${process.env.CALLRECORDING_PATH}/${id_user}/${date}/outgoing`, req.params.filename);
    console.log(filePath)
    res.sendFile(filePath, err => {
        if (err) {
            if (!res.headersSent) { // Ensure headers are not already sent
                res.status(err.code === 'ENOENT' ? 404 : 500).send('File not found');
            } else {
                console.error("Headers already sent, cannot modify response.");
            }
        }
    });
}, callcenterCtrl.callrecord_byot("outgoing"));

router.get('/get_mohfile_path/:foldername/:filename', isAuthenticated, function (req, res, next) {
    const filePath = path.join(`${process.env.AUDIOFILE_PATH}/moh/`, req.params.foldername, req.params.filename);
    console.log(filePath)
    res.sendFile(filePath, err => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});
router.get('/get_voicemail/:filename/:date',isAuthenticated, function (req, res, next) {
    if (req.token.isAdmin == 1) {
        var id_user = req.token.id;
    } else {
        var id_user = req.token.id_user;
    }
    const formatDate = () => {
        const date = req.params.date;
        const day = date.split('-')[2];
        const month = date.split('-')[1];
        const year = date.split('-')[0];

        return `${day}${month}${year}`;
    };
    var date = formatDate()
    console.log(date);
    const filePath = path.join(`${process.env.CALLRECORDING_PATH}/${id_user}/${date}/voicemail`, req.params.filename);
    console.log(filePath)
    res.sendFile(filePath, err => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});
router.get('/dashboard_incoming_and_outgoing_count',isAuthenticated, callcenterCtrl.dashboard_incoming_and_outgoing_count, function (req, res, next) {
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
router.get('/agent_status_count_outgoing',isAuthenticated, callcenterCtrl.agent_status_count_outgoing, function (req, res, next) {
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
router.get('/agent_dashboard_agent_activity',isAuthenticated, callcenterCtrl.agent_dashboard_agent_activity, function (req, res, next) {
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
router.get('/agent_dashboard_call_count',isAuthenticated, callcenterCtrl.agent_dashboard_call_count, function (req, res, next) {
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

router.post('/add_did_grouping', isAuthenticated, callcenterCtrl.add_did_grouping, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/update_did_grouping', isAuthenticated,callcenterCtrl.update_did_grouping, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/delete_did_grouping', isAuthenticated, callcenterCtrl.delete_did_grouping, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_did_grouping', isAuthenticated, callcenterCtrl.get_all_did_grouping, function (req, res, next) {
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
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});
router.get('/get_did_grouping_by_id', isAuthenticated, callcenterCtrl.get_did_grouping_by_id, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_did_grouping_selectBox', isAuthenticated, callcenterCtrl.get_all_did_grouping_selectBox, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.post('/add_did_group_setting', isAuthenticated, callcenterCtrl.add_did_group_setting, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Email id is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/update_did_group_setting', isAuthenticated,callcenterCtrl.update_did_group_setting, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/delete_did_group_setting', isAuthenticated, callcenterCtrl.delete_did_group_setting, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_did_group_setting', isAuthenticated, callcenterCtrl.get_all_did_group_setting, function (req, res, next) {
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
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});
router.get('/get_did_group_setting_by_id', isAuthenticated, callcenterCtrl.get_did_group_setting_by_id, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_did_group_setting_by_grouping', isAuthenticated, callcenterCtrl.get_did_group_setting_by_grouping, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.post('/add_blacklist', isAuthenticated, callcenterCtrl.add_blacklist, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }else if (res.locals.result == "phn_no existing") {
        var status = {
            'status': false,
            'message': "Phone number is already existing",
            result:  res.locals.exist,
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/update_blacklist', isAuthenticated,callcenterCtrl.update_blacklist, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }else if (res.locals.result == "phn_no existing") {
        var status = {
            'status': false,
            'message': "Phone number is already existing",
            result:  res.locals.exist,
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/delete_blacklist', isAuthenticated, callcenterCtrl.delete_blacklist, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_blacklist', isAuthenticated, callcenterCtrl.get_all_blacklist, function (req, res, next) {
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
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});
router.get('/get_blacklist_by_id', isAuthenticated, callcenterCtrl.get_blacklist_by_id, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_blacklist_selectbox', isAuthenticated, callcenterCtrl.get_blacklist_selectbox, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/update_blacklist_by_did', isAuthenticated,callcenterCtrl.update_blacklist_by_did, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/delete_blacklist_contacts', isAuthenticated,callcenterCtrl.delete_blacklist_contacts, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_by_blacklist_contacts', isAuthenticated,callcenterCtrl.get_by_blacklist_contacts, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/update_blacklist_contact', isAuthenticated,callcenterCtrl.update_blacklist_contact, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.get('/old_incoming_report',isAuthenticated, callcenterCtrl.old_incoming_report, function (req, res, next) {
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
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});
router.get('/old_outgoing_report', isAuthenticated, callcenterCtrl.old_outgoing_report, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_old_unique_misscall_report', isAuthenticated, callcenterCtrl.get_old_unique_misscall_report, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.get('/get_did_settings', isAuthenticated, callcenterCtrl.get_did_settings, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_did_template', isAuthenticated, callcenterCtrl.get_did_template, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/update_did_settings', isAuthenticated, callcenterCtrl.update_did_settings, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_score_card', isAuthenticated, callcenterCtrl.get_score_card, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.post('/add_unique_missedcall_call_log', isAuthenticated, callcenterCtrl.add_unique_missedcall_call_log, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_unique_missedcall_call_log', isAuthenticated, callcenterCtrl.get_unique_missedcall_call_log, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_customer_logs', isAuthenticated, callcenterCtrl.get_all_customer_logs, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/add_live_calls', isAuthenticated, callcenterCtrl.add_live_calls, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_sms_report', isAuthenticated, callcenterCtrl.get_sms_report, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/insert_default_template', isAuthenticated, callcenterCtrl.insert_default_template, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.post('/update_default_template', isAuthenticated, callcenterCtrl.update_default_template, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_default_template_flag', isAuthenticated, callcenterCtrl.get_default_template_flag, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_default_template_on_callpopup', isAuthenticated, callcenterCtrl.get_default_template_on_callpopup, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/department_summary', isAuthenticated, callcenterCtrl.getDepartmentSummary, function(req, res, next) {
    //handle errors
    let status = {
        status: false,
        message: res.locals.result.message || "something went wrong"
    }
    res.status(res.locals.result?.statusCode || 500).json(status);
})
router.post('/add_contacts', isAuthenticated, callcenterCtrl.add_contacts, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "contact is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else if (res.locals.result == "email existing") {
        var status = {
            'status': false,
            'message': "contact email already existing",
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
router.post('/add_contacts_via_postman', verifyTokenAutox, callcenterCtrl.add_contacts_via_postman, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "contact is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else if (res.locals.result == "email existing") {
        var status = {
            'status': false,
            'message': "contact email already existing",
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
router.post('/update_contacts', isAuthenticated, callcenterCtrl.update_contacts, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else if (res.locals.result == "email existing") {
        var status = {
            'status': false,
            'message': "contact email already existing",
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
router.get('/delete_contacts', isAuthenticated, callcenterCtrl.delete_contacts, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
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
router.get('/get_contacts', isAuthenticated, callcenterCtrl.get_contacts, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            total: res.locals.total,
        }
        res.status(200).json(status);
    }
});
router.get('/get_contacts_by_id', isAuthenticated, callcenterCtrl.get_contacts_by_id, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
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
router.get('/contact_phn_number_checking', isAuthenticated, callcenterCtrl.contact_phn_number_checking, function (req, res, next) {
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
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
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
// router.post('/add_csv_contacts', isAuthenticated, callcenterCtrl.add_csv_contacts, function (req, res, next) {
//     if (res.locals.result == 'err') {
//         var status = {
//             'status': false,
//             'message': "Something went wrong",
//             result: []
//         }
//         res.status(202).json(status);
//     }
//     else if (res.locals.result.length == 0 && res.locals.nofield.length == 0 && res.locals.phoneExistData.length == 0 && res.locals.emailExistData.length == 0 && res.locals.invalidPhoneData.length == 0 && res.locals.invalidNameData.length == 0 && res.locals.invalidCategoryData.length == 0 && res.locals.invalidPrefixData.length == 0) {
//         var status = {
//             'status': false,
//             'message': "No result Found",
//             result: [],
//         }
//         res.status(201).json(status);
//     }
//     else if (res.locals.result == "existing") {
//         var status = {
//             'status': false,
//             'message': "Name is already existing",
//             result: [],
//         }
//         res.status(201).json(status);
//     }
//     else if (res.locals.result == "email existing") {
//         var status = {
//             'status': false,
//             'message': "contact email already existing",
//             result: [],
//         }
//         res.status(201).json(status);
//     }
//     else {
//         var status = {
//             'status': true,
//             'message': "succesfull response",
//             result: res.locals.result,
//             nofield: res.locals.nofield,
//             phoneExistData: res.locals.phoneExistData,
//             emailExistData: res.locals.emailExistData,
//             successfull_count: res.locals.successfull_count,
//             unsuccessfull_count: res.locals.unsuccessfull_count,
//             invalidPhoneData: res.locals.invalidPhoneData,
//             invalidNameData: res.locals.invalidNameData,
//             invalidCategoryData: res.locals.invalidCategoryData,
//             invalidPrefixData: res.locals.invalidPrefixData
//         }
//         res.status(200).json(status);
//     }
// });

router.post('/add_csv_contacts', isAuthenticated, callcenterCtrl.add_csv_contacts, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0 && res.locals.nofield.length == 0 && res.locals.phoneExistData.length == 0 && res.locals.emailExistData.length == 0 && res.locals.invalidPhoneData.length == 0 && res.locals.invalidNameData.length == 0 && res.locals.invalidCategoryData.length == 0 && res.locals.invalidPrefixData.length == 0) {
        var status = {
            'status': false,
            'message': "No result Found",
            result: [],
        }
        res.status(201).json(status);
    }
    else if (res.locals.result == "existing") {
        var status = {
            'status': false,
            'message': "Name is already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else if (res.locals.result == "email existing") {
        var status = {
            'status': false,
            'message': "contact email already existing",
            result: [],
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            nofield: res.locals.nofield,
            phoneExistData: res.locals.phoneExistData,
            emailExistData: res.locals.emailExistData,
            successfull_count: res.locals.successfull_count,
            unsuccessfull_count: res.locals.unsuccessfull_count,
            invalidPhoneData: res.locals.invalidPhoneData,
            invalidNameData: res.locals.invalidNameData,
            invalidCategoryData: res.locals.invalidCategoryData,
            invalidPrefixData: res.locals.invalidPrefixData
        }
        res.status(200).json(status);
    }
});
router.get('/get_transport_report', isAuthenticated, callcenterCtrl.get_transport_report, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_transport_report_csv', isAuthenticated, callcenterCtrl.get_transport_report_csv, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.post('/add_phone_to_dnd', isAuthenticated, callcenterCtrl.add_phone_to_dnd, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.get('/get_livecall_by_uniqueid', verifyTokenAutox, callcenterCtrl.get_livecall_by_uniqueid, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});
router.get('/get_livecall', verifyTokenAutox, callcenterCtrl.get_livecall, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

router.get('/get-all-did', verifyTokenAutox, callcenterCtrl.getAllDids);
router.patch('/worktime-filter', isAuthenticated, callcenterCtrl.toggleWorkTimeFilter);
router.get('/worktime-filter', isAuthenticated, callcenterCtrl.getWorkTimeFilterStatus);

router.get('/get_unique_missedcallData', callcenterCtrl.get_unique_missedcallData, function (req, res, next) {
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
            total: res.locals.count,
        }
        res.status(200).json(status);
    }
});

module.exports = router;