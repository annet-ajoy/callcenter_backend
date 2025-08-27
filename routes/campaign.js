var express = require('express');
var router = express.Router();
const { isAuthenticated } = require('../helper/auth');
const campaignCtrl = require('../controller/campaignCtrl');
const path = require('path');
const { callrecord_byot } = require('../controller/callcenterCtrl');
const Customers = require('../model/customers');

router.post('/add_phonebook', isAuthenticated, campaignCtrl.add_phonebook, function (req, res, next) {
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
    else if (res.locals.result == 'existing on admin') {
        var status = {
            'status': false,
            'message': "name is already existing in admin",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 'already existing in department') {
        var status = {
            'status': false,
            'message': "name is already existing in department",
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
router.post('/update_phonebook', isAuthenticated, campaignCtrl.update_phonebook, function (req, res, next) {
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
router.get('/get_all_phonebook', isAuthenticated, campaignCtrl.get_all_phonebook, function (req, res, next) {
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
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_by_phonebook_id', isAuthenticated, campaignCtrl.get_by_phonebook_id, function (req, res, next) {
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
router.get('/delete_phonebook', isAuthenticated, campaignCtrl.delete_phonebook, function (req, res, next) {
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
router.get('/get_phonebook_selectbox', isAuthenticated, campaignCtrl.get_phonebook_selectbox, function (req, res, next) {
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
router.post('/copy_phonebook', isAuthenticated, campaignCtrl.copy_phonebook, function (req, res, next) {
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
    else if (res.locals.result == 'no contact') {
        var status = {
            'status': true,
            'message': "Phonebook created successfully. No contacts in the copied phonebook.",
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
router.get('/get_phonebook_by_campaignId', isAuthenticated, campaignCtrl.get_phonebook_by_campaignId, function (req, res, next) {
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
router.get('/phonenumber_exist_checking', campaignCtrl.phonenumber_exist_checking, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 'exist') {
        // var status = {
        //     'status': false,
        //     'message': "name is already exist",
        //     result: []
        // }
        // res.status(202).json(status);
        res.send("true");
    }
    else {
        res.send("false");
    }
});
router.post('/insert_phnbook_contacts', isAuthenticated, campaignCtrl.insert_phnbook_contacts, function (req, res, next) {
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
            response:res.locals.response,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 'phonenumber exist') {
        var status = {
            'status': false,
            'message': "Phone number is already exist",
            response:res.locals.response,
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
            collectionId:res.locals.collectionId,
            response:res.locals.response,
            emptydata:res.locals.emptydata
        }
        res.status(200).json(status);
    }
});
router.post('/call_phonebook', isAuthenticated, campaignCtrl.call_phonebook, function (req, res, next) {
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
            response:res.locals.response,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 'phonenumber exist') {
        var status = {
            'status': false,
            'message': "Phone number is already exist",
            response:res.locals.response,
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
            collectionId:res.locals.collectionId,
            response:res.locals.response
        }
        res.status(200).json(status);
    }
});
router.post('/update_phnbook_contacts', isAuthenticated, campaignCtrl.update_phnbook_contacts, function (req, res, next) {
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
    else if (res.locals.result == 'phonenumber exist') {
        var status = {
            'status': false,
            'message': "Phone number is already exist",
            result: []
        }
        res.status(202).json(status);
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
router.get('/get_all_phnbook_contacts', isAuthenticated, campaignCtrl.get_all_phnbook_contacts, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_by_phnbook_contacts_id', isAuthenticated, campaignCtrl.get_by_phnbook_contacts_id, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.post('/delete_phnbook_contacts', isAuthenticated, campaignCtrl.delete_phnbook_contacts, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            notification: res.locals.notification
        }
        res.status(200).json(status);
    }
});
router.get('/get_by_phnbook_by_campaignId', isAuthenticated, campaignCtrl.get_by_phnbook_by_campaignId, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.get('/get_phnbook_contacts_byPhnbookId', isAuthenticated, campaignCtrl.get_phnbook_contacts_byPhnbookId, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_phnbook_contacts_byCollectionId', isAuthenticated, campaignCtrl.get_phnbook_contacts_byCollectionId, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/delete_phnbook_collection', isAuthenticated, campaignCtrl.delete_phnbook_collection, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_phnbook_collection_byPhnbookId', isAuthenticated, campaignCtrl.get_phnbook_collection_byPhnbookId, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
        var status = {
            'status': false,
            'message': "No result Found",
            result: []
        }
        res.status(201).json(status);
    }
    else if (res.locals.result == 'campaginRunning') {
        var status = {
            'status': false,
            'message': "Campaign is running",
            result: res.locals.phnbokkResult,
            contacts: res.locals.contacts,
            total: res.locals.count,
            name: res.locals.name,
            total_contacts:res.locals.total
        }
        res.status(201).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            contacts: res.locals.contacts,
            total: res.locals.count,
            name: res.locals.name,
            total_contacts:res.locals.total
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_phnbook_collection_for_dropdown', isAuthenticated, campaignCtrl.get_all_phnbook_collection_for_dropdown, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            contacts: res.locals.contacts,
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_by_phnbook_collection_id', isAuthenticated, campaignCtrl.get_by_phnbook_collection_id, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.post('/update_phnbook_collection', isAuthenticated, campaignCtrl.update_phnbook_collection, function (req, res, next) {
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
router.get('/get_phnbook_templates_by_phonebookId', isAuthenticated, campaignCtrl.get_phnbook_templates_by_phonebookId, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            contacts: res.locals.contacts,
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_phnbook_templates_by_collectionId', isAuthenticated, campaignCtrl.get_phnbook_templates_by_collectionId, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            contacts: res.locals.contacts,
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.post('/add_campaign', isAuthenticated, campaignCtrl.add_campaign, function (req, res, next) {
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
router.post('/update_campaign', isAuthenticated, campaignCtrl.update_campaign, function (req, res, next) {
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
    else if (res.locals.result == 'no balance') {
        var status = {
            'status': false,
            'message': "recharge",
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
router.get('/get_all_campaign', isAuthenticated, campaignCtrl.get_all_campaign, function (req, res, next) {
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
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_campaign_by_agent', isAuthenticated, campaignCtrl.get_all_campaign_by_agent, function (req, res, next) {
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
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_by_campaign_id', isAuthenticated, campaignCtrl.get_by_campaign_id, function (req, res, next) {
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
router.get('/delete_campaign', isAuthenticated, campaignCtrl.delete_campaign, function (req, res, next) {
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
router.get('/get_campaign_selectbox', isAuthenticated, campaignCtrl.get_campaign_selectbox, function (req, res, next) {
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
router.get('/get_campaign_selectbox_by_agent', isAuthenticated, campaignCtrl.get_campaign_selectbox_by_agent, function (req, res, next) {
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
router.get('/get_campaign_contacts', isAuthenticated, campaignCtrl.get_campaign_contacts, function (req, res, next) {
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
router.get('/get_by_campaign_details', isAuthenticated, campaignCtrl.get_by_campaign_details, function (req, res, next) {
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
router.post('/update_campaign_status', isAuthenticated, campaignCtrl.update_campaign_status, function (req, res, next) {
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
    else if (res.locals.result == 'no balance') {
        var status = {
            'status': false,
            'message': "recharge",
            result: []
        }
        res.status(202).json(status);
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
router.post('/update_agent_status', isAuthenticated, campaignCtrl.update_agent_status, function (req, res, next) {
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
    else if (res.locals.result == 'no balance') {
        var status = {
            'status': false,
            'message': "recharge",
            result: []
        }
        res.status(202).json(status);
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
router.post('/insert_template', isAuthenticated, campaignCtrl.insert_template, function (req, res, next) {
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
router.post('/update_template', isAuthenticated, campaignCtrl.update_template, function (req, res, next) {
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
router.get('/get_all_template', isAuthenticated, campaignCtrl.get_all_template, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_by_template_id', isAuthenticated, campaignCtrl.get_by_template_id, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.get('/delete_template', isAuthenticated, campaignCtrl.delete_template, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result == 'exist') {
        var status = {
            'status': false,
            'message': "data already exist",
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            notification: res.locals.notification
        }
        res.status(200).json(status);
    }
});
router.get('/template_selectbox', isAuthenticated, campaignCtrl.template_selectbox, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.post('/copy_templates', isAuthenticated, campaignCtrl.copy_templates, function (req, res, next) {
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
router.post('/insert_template_field', isAuthenticated, campaignCtrl.insert_template_field, function (req, res, next) {
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
router.post('/update_template_field', isAuthenticated, campaignCtrl.update_template_field, function (req, res, next) {
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
router.get('/get_all_template_field', isAuthenticated, campaignCtrl.get_all_template_field, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            total: res.locals.count,
            sms: res.locals.sms,
            integration : res.locals.integration
        }
        res.status(200).json(status);
    }
});
router.get('/get_by_template_field_id', isAuthenticated, campaignCtrl.get_by_template_field_id, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.get('/delete_template_field', isAuthenticated, campaignCtrl.delete_template_field, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            notification: res.locals.notification
        }
        res.status(200).json(status);
    }
});

router.get('/get_all_did', isAuthenticated, campaignCtrl.get_all_did, function (req, res, next) {
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
router.get('/get_all_demo_did', isAuthenticated, campaignCtrl.get_all_demo_did, function (req, res, next) {
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
            total: res.locals.total
        }
        res.status(200).json(status);
    }
});
router.get('/get_all_ivr', isAuthenticated, campaignCtrl.get_all_ivr, function (req, res, next) {
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
router.get('/get_phnbook_contacts_by_campaignId', isAuthenticated, campaignCtrl.get_phnbook_contacts_by_campaignId, function (req, res, next) {
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
    else if (res.locals.result == 'no balance') {
        var status = {
            'status': false,
            'message': "recharge",
            result: []
        }
        res.status(202).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            data: res.locals.data,
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.post('/insert_contact_status', isAuthenticated, campaignCtrl.insert_contact_status, function (req, res, next) {
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
router.get('/delete_contact_status', isAuthenticated, campaignCtrl.delete_contact_status, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.get('/skip_contact_status', isAuthenticated, campaignCtrl.skip_contact_status, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.get('/update_contact_status', isAuthenticated, campaignCtrl.update_contact_status, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': res.locals.message,
            result: []
        }
        res.status(202).json(status);
    }
    else if (res.locals.result.length == 0) {
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
            result: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.post('/add_campaign_call_summary', isAuthenticated, campaignCtrl.add_campaign_call_summary, function (req, res, next) {
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
router.post('/update_campaign_call_summary', isAuthenticated, campaignCtrl.update_campaign_call_summary, function (req, res, next) {
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
router.get('/get_campaign_call_summary', isAuthenticated, campaignCtrl.get_campaign_call_summary, function (req, res, next) {
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
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_by_campaign_call_summary', isAuthenticated, campaignCtrl.get_by_campaign_call_summary, function (req, res, next) {
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
router.get('/delete_campaign_call_summary', isAuthenticated, campaignCtrl.delete_campaign_call_summary, function (req, res, next) {
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
router.post('/update_counts', isAuthenticated, campaignCtrl.update_counts, function (req, res, next) {
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
router.post('/add_campaign_outgoingcall', isAuthenticated, campaignCtrl.add_campaign_outgoingcall, function (req, res, next) {
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
router.post('/update_campaign_outgoingcall', isAuthenticated, campaignCtrl.update_campaign_outgoingcall, function (req, res, next) {
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
router.get('/get_campaign_outgoingcall', isAuthenticated, campaignCtrl.get_campaign_outgoingcall, function (req, res, next) {
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
router.get('/get_campaign_outgoingcall_csv', isAuthenticated, campaignCtrl.get_campaign_outgoingcall_csv, function (req, res, next) {
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
router.get('/get_by_campaign_outgoingcall', isAuthenticated, campaignCtrl.get_by_campaign_outgoingcall, function (req, res, next) {
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
router.get('/delete_campaign_outgoingcall', isAuthenticated, campaignCtrl.delete_campaign_outgoingcall, function (req, res, next) {
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
router.get('/get_campaign_outgoingcall_by_agent', isAuthenticated, campaignCtrl.get_campaign_outgoingcall_by_agent, function (req, res, next) {
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
router.get('/get_campaign_outgoingcall_csv_by_agent', isAuthenticated, campaignCtrl.get_campaign_outgoingcall_csv_by_agent, function (req, res, next) {
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
router.get('/get_all_campaign_outgoingcall_reports', isAuthenticated, campaignCtrl.get_all_campaign_outgoingcall_reports, function (req, res, next) {
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
router.get('/get_all_campaign_outgoingcall_reports_csv', isAuthenticated, campaignCtrl.get_all_campaign_outgoingcall_reports_csv, function (req, res, next) {
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
router.post('/add_campaign_settings', isAuthenticated, campaignCtrl.add_campaign_settings, function (req, res, next) {
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
router.post('/update_campaign_settings', isAuthenticated, campaignCtrl.update_campaign_settings, function (req, res, next) {
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
router.get('/get_all_campaign_settings', isAuthenticated, campaignCtrl.get_all_campaign_settings, function (req, res, next) {
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
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_by_campaign_settings_id', isAuthenticated, campaignCtrl.get_by_campaign_settings_id, function (req, res, next) {
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
router.get('/delete_campaign_settings', isAuthenticated, campaignCtrl.delete_campaign_settings, function (req, res, next) {
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
router.post('/insert_campaign_settings', isAuthenticated, campaignCtrl.insert_campaign_settings, function (req, res, next) {
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

router.post('/add_livecalls', isAuthenticated,campaignCtrl.add_livecalls, function (req, res, next) {
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
router.get('/get_all_livecalls/:uniqueId', isAuthenticated,campaignCtrl.get_all_livecalls, function (req, res, next) {
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
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_livecalls', isAuthenticated,campaignCtrl.get_livecalls, function (req, res, next) {
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

router.get('/get_campaign_CallSummary_by_campaignId', isAuthenticated, campaignCtrl.get_campaign_CallSummary_by_campaignId, function (req, res, next) {
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
router.get('/get_campaign_summery_by_phoneBookId', isAuthenticated, campaignCtrl.get_campaign_summery_by_phoneBookId, function (req, res, next) {
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
router.get('/get_campaign_summery_by_agentId', isAuthenticated, campaignCtrl.get_campaign_summery_by_agentId, function (req, res, next) {
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
router.get('/get_schedule', isAuthenticated, campaignCtrl.get_schedule, function (req, res, next) {
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
router.post('/get_setInterval', isAuthenticated, campaignCtrl.get_setInterval, function (req, res, next) {
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
router.get('/get_contacts_status', isAuthenticated, campaignCtrl.get_contacts_status, function (req, res, next) {
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
    else if (res.locals.result == 'no balance') {
        var status = {
            'status': false,
            'message': "recharge",
            result: []
        }
        res.status(202).json(status);
    }
    else {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result,
            data: res.locals.data,
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});

router.get('/get_phonebook_selectbox_bydept', isAuthenticated, campaignCtrl.get_phonebook_selectbox_bydept, function (req, res, next) {
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
router.get('/get_campaign_hourly_duration', isAuthenticated, campaignCtrl.get_campaign_hourly_duration, function (req, res, next) {
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
            liveCampaignStatus: res.locals.result,
            supportTeam: res.locals.result1,
            agentCount:res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_campaign_support_data', isAuthenticated, campaignCtrl.get_campaign_support_data, function (req, res, next) {
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
            liveCampaignStatus: res.locals.result,
            supportTeam: res.locals.result1,
            agentCount:res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_campaign_department_status', isAuthenticated, campaignCtrl.get_campaign_department_status, function (req, res, next) {
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
router.get('/get_campaign_support', isAuthenticated, campaignCtrl.get_campaign_support, function (req, res, next) {
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
            agentCount:res.locals.count
        }
        res.status(200).json(status);
    }
});

router.get('/get_all_audiofiles', isAuthenticated, campaignCtrl.get_all_audiofiles, function (req, res, next) {
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
router.get('/get_calls_count',isAuthenticated,campaignCtrl.get_calls_count,function(req, res, next) {
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

router.post('/create_moh', isAuthenticated, campaignCtrl.create_moh, function (req, res, next) {
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
router.post('/update_moh', isAuthenticated, campaignCtrl.update_moh, function (req, res, next) {
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
router.post('/get_setInterval', isAuthenticated, campaignCtrl.get_setInterval, function (req, res, next) {
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
router.get('/get_moh', isAuthenticated, campaignCtrl.get_moh, function (req, res, next) {
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
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.get('/get_moh_by_id', isAuthenticated, campaignCtrl.get_moh_by_id, function (req, res, next) {
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
router.get('/delete_moh', isAuthenticated, campaignCtrl.delete_moh, function (req, res, next) {
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
router.get('/get_moh_selectbox', isAuthenticated, campaignCtrl.get_moh_selectbox, function (req, res, next) {
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
            total: res.locals.count
        }
        res.status(200).json(status);
    }
});
router.post('/whatsapp_integration', isAuthenticated, campaignCtrl.whatsapp_integration, function (req, res, next) {
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
    else if (res.locals.result == false) {
        var status = {
            'status': false,
            'message': "Failed response",
            result: res.locals.result,
        }
        res.status(200).json(status);
    }else if (res.locals.result == 'error') {
        var status = {
            'status': false,
            'message': res.locals.msg,
            result: []
        }
        res.status(202).json(status);
    }else{
        var status = {
            'status': true,
            'message': "Succesfull response",
            result: res.locals.result,
        }
        res.status(200).json(status);
    }
});
router.get('/schedule_list', campaignCtrl.schedule_list, function (req, res, next) {
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
router.get('/duplicatePhnno_remove', campaignCtrl.duplicatePhnno_remove, function (req, res, next) {
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
router.get('/retryCount', campaignCtrl.retryCount, function (req, res, next) {
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
router.post('/create_whatsapp_campaign_integration', campaignCtrl.create_whatsapp_campaign_integration, function (req, res, next) {
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
router.get('/get_whatsapp_campaign_integration', campaignCtrl.get_whatsapp_campaign_integration, function (req, res, next) {
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
})
router.get('/whatsapp_testing', campaignCtrl.whatsapp_testing, function (req, res, next) {
    if (res.locals.result == 'err') {
        res.status(202).json(res.locals.result1);
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
        res.status(200).json(res.locals.result);
    }
});
router.get('/broadcast_wp_integration_testing', campaignCtrl.broadcast_wp_integration_testing, function (req, res, next) {
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
router.get('/get_agent_by_campaignId', campaignCtrl.get_agent_by_campaignId, function (req, res, next) {
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
router.get('/get_campaign_live_agents', campaignCtrl.get_campaign_live_agents, function (req, res, next) {
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
router.post('/create_api_integration', campaignCtrl.create_api_integration, function (req, res, next) {
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
router.get('/remarks_skip', campaignCtrl.remarks_skip, function (req, res, next) {
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

router.get('/shcedule_testing', campaignCtrl.shcedule_testing, function (req, res, next) {
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
router.get('/shcedule_delete', campaignCtrl.shcedule_delete, function (req, res, next) {
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
router.get('/trans_credit',isAuthenticated, campaignCtrl.trans_credit, function (req, res, next) {
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
router.post('/add_campaign_sms', isAuthenticated, campaignCtrl.add_campaign_sms, function (req, res, next) {
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
router.post('/update_campaign_sms', isAuthenticated, campaignCtrl.update_campaign_sms, function (req, res, next) {
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
router.get('/get_campaign_sms_by_id', isAuthenticated, campaignCtrl.get_campaign_sms_by_id, function (req, res, next) {
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
router.get('/delete_campaign_sms', isAuthenticated, campaignCtrl.delete_campaign_sms, function (req, res, next) {
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
router.post('/add_campaign_whatsapp', isAuthenticated, campaignCtrl.add_campaign_whatsapp, function (req, res, next) {
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
router.post('/update_campaign_whatsapp', isAuthenticated, campaignCtrl.update_campaign_whatsapp, function (req, res, next) {
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
router.get('/get_campaign_whatsapp_by_id', isAuthenticated, campaignCtrl.get_campaign_whatsapp_by_id, function (req, res, next) {
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
router.get('/delete_campaign_whatsapp', isAuthenticated, campaignCtrl.delete_campaign_whatsapp, function (req, res, next) {
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
router.post('/add_campaign_api', isAuthenticated, campaignCtrl.add_campaign_api, function (req, res, next) {
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
router.post('/update_campaign_api', isAuthenticated, campaignCtrl.update_campaign_api, function (req, res, next) {
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
router.get('/get_campaign_api_by_id', isAuthenticated, campaignCtrl.get_campaign_api_by_id, function (req, res, next) {
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
router.get('/delete_campaign_api', isAuthenticated, campaignCtrl.delete_campaign_api, function (req, res, next) {
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
router.get('/get_campaign_callrecordings/:filename/:date', isAuthenticated, function (req, res, next) {
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
    const filePath = path.join(`${process.env.CALLRECORDING_PATH}/${id_user}/${date}/campaign`, req.params.filename);
    console.log(filePath)
    res.sendFile(filePath, err => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});
router.get('/campaign_callrecord_byot/:filename/:date', isAuthenticated, callrecord_byot("campaign"), function(req, res, next) {

    //handle error
    const { statusCode = 500, message = "something went wrong", result = [] } = res.locals.result || {};
    
    let status = {
        status: false,
        message: message,
        result
    }
    res.status(statusCode).json(status)
})
router.get('/get_campaign_callrecordings_without_token/:filename/:date/:id_user', async function (req, res, next) {
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
    const filePath = path.join(`${process.env.CALLRECORDING_PATH}/${id_user}/${date}/campaign`, req.params.filename);
    console.log(filePath)
    res.sendFile(filePath, err => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
}, callrecord_byot("campaign"));


module.exports = router;