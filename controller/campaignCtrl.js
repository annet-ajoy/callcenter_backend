const { rackServer, getConnection, db: sequelize, db3: sequelize2 } = require("../database");
var phonebookModel = require('../model/phonebookModel');
var phonebook_contactsModel = require('../model/phonebook_contacts');
var phonebook_collectionModel = require('../model/phonebookcollections');
var phonebook_templatesModel = require('../model/phonebookTemplates');
var schedule_collectionModel = require('../model/scheduleCollection');
var templateModel = require('../model/templateModel');
var templatefieldModel = require('../model/templatefieldModel');
var campaignModel = require('../model/campaignModel');
var agentCampaignModel = require('../model/agentCampaignModel');
var phonebookCampaignModel = require('../model/phonebookCampaignModel');
var dndphonebookModel = require('../model/campaignDndPhnbookModel');
var contactStatusModel = require('../model/contactStatusModel');
var campaignCallSummaryModel = require('../model/campaign_CallSummaryModel');
var campaignOutgoingModel = require('../model/campaignOutgoingMode');
var campaignSettingsModel = require('../model/campaignSettings');
var livecallsModel = require('../model/ccLivecallsModel');
var agentModel = require('../model/customModel');
var leadModel = require('../model/leadModel');
var ticketsModel = require('../model/ticketsModel');
const campaign = require('../model/campaignModel');
const mohFileModel = require('../model/mohFileModel');
const jwtModel = require('../model/whatsappCampaignIntegrationModel');
const apiIntegrationModel = require('../model/campaignApiIntegrationModel');
const phonebookContactsModel = require('../model/phonebook_contacts');
var smsModel = require('../model/smsModel');
var campaginSmsModel = require('../model/camapignsmsModel');
var campaginWhatsappModel = require('../model/camapignWhatsappModel');
var campaginApiIntegrationModel = require('../model/camapignApiIntegrationModel');
var broadcastSmsModel = require('../model/broadcastSmsIntegrationModel')
var broadcastWhatsappModel = require('../model/broadcastWhatsappIntegrationModel')
var broadcastApiModel = require('../model/broadcastApiIntegrationModel')
var templateSms = require('../model/templateSmsModel')
var templateWhatsapp = require('../model/templateWhatsappModel')
var templateApi = require('../model/templateApiModel')
const { DATE } = require('sequelize');
let ObjectId = require('mongodb').ObjectId;
const schedule = require('node-schedule');
var ami = require('../helper/callEvents');
var axios = require('axios');
const { response } = require('express');
const { string_encode, string_decode, encrypteAes128, decryptAes128 } = require('../helper/auth');
if (process.env.PRODUCTION == 'developmentLive' || process.env.PRODUCTION == 'development') {
    var { adminSocket, userSocket } = require('../helper/developmentSocket');
} else {
    var { adminSocket, userSocket } = require('../helper/liveSocket');
}
const { broadcastLogMessage, callcenterLogMessage, logMessage } = require('../logger');
const { broadcastSmsAxiosIntegration, broadcastWhatsappIntegration, broadcastApiAxiosIntegration } = require('../integration/integration');
const fs = require('fs');
var path = require('path');
const { TLSSocket } = require('tls');
const CircularJSON = require('circular-json');
const integration = require('../integration/integration');
const callByotApi = require('../helper/callByotApi');
const getDateRangeForReportingPeriod = require('../utils/getDateRangeForReportingPeriod');
var scheduledJobsArray = [];
var scheduled_Jobs = {}


async function add_phonebook(req, res, next) {
    try {
        const phonebook = req.body;
        const id_user = req.token.id_user;
        const id_department = req.token.id_department;
        const isAdmin = req.token.isAdmin;
        const isSubAdmin = req.token.isSubAdmin;
        const isDept = req.token.isDept;
        if (isAdmin === 1) {
            phonebook.id_user = id_user;
            phonebook.id_department = 0;
        } else if (isSubAdmin === 1) {
            phonebook.id_user = id_user;
            phonebook.id_department = req.token.id_department;
        }
        else if (isDept === 1) {
            phonebook.id_user = id_user;
            phonebook.id_department = req.token.id;
        }
        phonebook.phonebook_duplicate_check = phonebook.phonebook_duplicate_check ? 1 : 0;
        phonebook.pbname = phonebook.name;
        phonebook.createdAt = new Date();
        const existingRecord = await phonebookModel.findOne({
            pbname: { $regex: new RegExp(`^${phonebook.name}$`, 'i') },
            id_user: phonebook.id_user
        });
        if (existingRecord) {
            if (existingRecord.id_department === 0) {
                res.locals.result = "existing on admin";
            } else if (existingRecord.id_department === 7) {
                res.locals.result = "already existing in department";
            } else {
                res.locals.result = "exist";
            }
        } else {
            const addPhonebook = await phonebookModel.create(phonebook);
            res.locals.result = addPhonebook;
        }
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function update_phonebook(req, res, next) {
    try {
        var phonebook = req.body;
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        phonebook.phonebook_duplicate_check = phonebook.phonebook_duplicate_check ? 1 : 0;
        phonebook.pbname = phonebook.name;
        const id = req.query.id;
        const existingRecord = await phonebookModel.findOne({
            pbname: phonebook.name,
            id_user: phonebook.id_user,
            _id: { $ne: id }
        });
        if (existingRecord) {
            res.locals.result = "exist";
            next();
            return;
        }
        const result = await phonebookModel.updateOne(
            { _id: id },
            { $set: phonebook }
        );
        res.locals.result = result;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function get_all_phonebook(req, res, next) {
    try {
        const limit = Number(req.query.count) || 10; // Default limit if not provided
        const page = Number(req.query.page) || 1; // Default page if not provided
        const skip = (page - 1) * limit;
        const id_user = req.token.id_user;
        const name = req.query.name;
        var id_department = req.token.id_department;
        const isSubAdmin = req.token.isSubAdmin;
        const isDept = req.token.isDept;
        var department_id = req.query.department_id;
        let query = { id_user };
        if (isSubAdmin === 1) {
            id_department = id_department.split(',').map(Number);
            query.id_department = { $in: id_department };
        } else if (isDept === 1) {
            query.id_department = req.token.id;
        }
        if (name) {
            query.pbname = new RegExp(name, 'i');
        }
        if (department_id !== undefined) {
            query.id_department = department_id;
        }
        const result = await phonebookModel
            .find(query)
            .populate('id_department', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 })
            .lean()
            .exec();
        var map_result = Promise.all(
            result.map(async (data) => {
                data.id = data._id;
                delete data._id;
                var id_dept = data.id_department;
                var dept = `SELECT name FROM departments WHERE id = '${id_dept}'`
                var [deptRes] = await getConnection.query(dept);
                if (deptRes.length != 0) {
                    data.department = deptRes[0].name;
                } else {
                    data.department = '';
                }
                return data;
            })
        )
        var output = await map_result;
        const count = await phonebookModel.countDocuments(query).exec();
        res.locals.result = output;
        res.locals.count = count;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function get_by_phonebook_id(req, res, next) {
    try {
        const id = req.query.id;
        if (!id) {
            res.status(400).json({ message: 'ID is required' });
            return;
        }
        const result = await phonebookModel.findById(id);
        if (!result) {
            res.status(404).json({ message: 'Phonebook record not found' });
            return;
        }
        result.id = result._id;
        delete result._id;
        res.locals.result = result;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function delete_phonebook(req, res, next) {
    try {
        const id = req.query.id
        const phonebook = await phonebookModel.findById(id).exec();
        const collectionId = await phonebook_collectionModel.findOne({ phonebook_id: id }).exec();
        if (collectionId) {
            const scheduleId = await schedule_collectionModel.findOne({ collectionId: collectionId._id }).exec();
            if (scheduleId) {
                const schedule_no = scheduleId.scheduleNo;
                const campaignNameWithoutSpaces = `${schedule_no}`;
                const jobsWithSameName = scheduledJobsArray.filter(job => job.name == campaignNameWithoutSpaces);
                jobsWithSameName.forEach(job => {
                    job.cancel();
                    const index = scheduledJobsArray.indexOf(job);
                    if (index !== -1) {
                        scheduledJobsArray.splice(index, 1);
                    }
                });
            }
        }
        await phonebookModel.deleteOne({ _id: id }).exec();
        await phonebook_collectionModel.deleteMany({ phonebook_id: id }).exec();
        await phonebook_contactsModel.deleteMany({ phonebook_id: id }).exec();
        await phonebook_templatesModel.deleteMany({ phonebook_id: id }).exec()
        const campaignIds = await phonebookCampaignModel.findAll({
            where: { phonebook_id: id },
            attributes: ['campaign_id']
        });
        if (campaignIds.length > 0) {
            const campaignIdList = campaignIds.map(data => data.campaign_id);
            var updateSql1 = `UPDATE cc_campaign SET total_contacts = total_contacts - '${phonebook.contact_count}' WHERE id In (${campaignIdList})`;
            var [update1] = await sequelize.query(updateSql1);
        }
        await contactStatusModel.deleteMany({ phonebook_id: id }).exec();
        await phonebookCampaignModel.destroy({
            where: { phonebook_id: id }
        });
        res.locals.result = { message: 'Phonebook deleted successfully' };
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function get_phonebook_selectbox(req, res, next) {
    try {
        const id_user = req.token.id_user;
        const id_department = req.token.id_department;
        const isSubAdmin = req.token.isSubAdmin;
        const isDept = req.token.isDept;
        var department_id = req.query.id_department;
        let query = {};

        query = {
            id_user: id_user
        };
        if (department_id != undefined) {
            Number(department_id)
            query = {
                id_user: id_user,
                id_department: department_id
            };
        }
        else if (isSubAdmin == 1) {
            var id_dept = id_department.split(',').map(Number);
            query = {
                id_user: id_user,
                id_department: { $in: id_dept }
            };
        }
        else if (isDept == 1) {
            query = {
                id_user: id_user,
                id_department: req.token.id
            };
        }
        const result = await phonebookModel.find(query).select('_id pbname').lean();

        res.locals.result = result.map(item => ({
            id: item._id,
            name: item.pbname
        }));
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function copy_phonebook(req, res, next) {
    try {
        var phonbook = req.body;
        var phonebookId = req.query.phonebookId;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var isContacts = phonbook.contacts;
        var createdAtDate = new Date();
        phonbook.pbname = phonbook.name;
        phonbook.createdAt = createdAtDate;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1
        var yyyy = today.getFullYear();
        var hours = today.getHours();
        var min = today.getMinutes();
        if (isAdmin == 1) {
            var id_user = req.token.id_user;;
            var id_department = 0;
        } else if (isSubAdmin == 1) {
            var id_user = req.token.id_user;;
            var id_department = req.body.id_dept;
        } else if (isDept == 1) {
            var id_user = req.token.id_user;;
            var id_department = req.token.id;;
        }
        phonbook.id_user = id_user;
        phonbook.id_department = id_department;
        if (phonbook.phonebook_duplicate_check == true) {
            phonbook.phonebook_duplicate_check = 1;
        } else {
            phonbook.phonebook_duplicate_check = 0;
        }
        const mongoResults = await phonebookModel.find({
            pbname: phonbook.name,
            id_user: id_user,
            id_department: id_department
        })
        if (mongoResults.length != 0) {
            res.locals.result = "exist";
            next()
            return
        } else {
            var addPhonebook = await phonebookModel.create(phonbook);
            var currentPhnbookId = addPhonebook._doc._id;
        }
        if (isContacts == 1) {
            var collection = await phonebook_collectionModel.find({ $and: [{ phonebook_id: phonebookId }] });
            if (collection.length != 0) {
                var collectionMapping = Promise.all(
                    collection.map(async (collectionData) => {
                        try {
                            var collectionId = collectionData._doc._id;
                            var template = await phonebook_templatesModel.find({ $and: [{ collectionId: new ObjectId(collectionId) }, { phonebook_id: phonebookId }] });
                            if (template.length != 0) {
                                var template_id = template[0]._doc._id;
                                collectionData._doc.template = [template[0]._doc]
                            }
                            var contact = await phonebook_contactsModel.find({ $and: [{ collectionId: new ObjectId(collectionId) }, { phonebook_id: phonebookId }, { template_id: new ObjectId(template_id) }] });
                            if (contact.length != 0) {
                                collectionData._doc.contacts = contact
                            }
                            var schedule_no = await schedule_collectionModel.find({ $and: [{ collectionId: new ObjectId(collectionId) }] });
                            if (schedule_no.length != 0) {
                                collectionData._doc.schedule_no = schedule_no[0]._doc.scheduleNo
                            }
                            return collectionData._doc;
                        } catch (error) {
                            console.error(error);
                        }
                    })
                )
                var collectionRes = await collectionMapping;
                if (collectionRes.length != 0) {
                    var copyData = collectionRes;
                    var contactArr = [];
                    var resultMapping = collectionRes.map(async (data) => {
                        return new Promise(async (resolve) => {
                            var collectionObj = {}
                            for (const key in data) {
                                if (Object.hasOwnProperty.call(data, key)) {
                                    collectionObj[key] = data[key];
                                }
                            }
                            delete collectionObj.contacts
                            delete collectionObj.template
                            delete collectionObj._id
                            delete collectionObj.__v
                            collectionObj.phonebook_id = currentPhnbookId;
                            delete collectionObj.createdAt;
                            collectionObj.createdAt = createdAtDate;
                            var insertCollection = await phonebook_collectionModel.create(collectionObj);
                            if (data.api_check == 1) {
                                var response_name = data.response_name;
                                var phone_field_name = data.phone_field_name;
                                var name_field = data.name_field;
                                var method = data.method;
                                var api_url = data.api_url;
                                var frequency = data.frequency;
                                var key = 'MKDK73JKSA69G2Y3'
                                function formatTime(time) {
                                    let formattedHours = time.hours;
                                    let formattedminutes = time.mins;
                                    if (time.AMorPM === 'PM' && time.hours !== 12) {
                                        formattedHours += 12;
                                    } else if (time.AMorPM === 'AM' && time.hours == 12) {
                                        formattedHours += 12;
                                    }
                                    const formattedTime = `${formattedHours}:${formattedminutes}:0`;
                                    return formattedTime
                                }
                                var startTime = formatTime(data.startTime);
                                var endTime = formatTime(data.endTime);
                                var start_date = data.startDate + ' ' + startTime;
                                var end_date = data.endDate + ' ' + endTime
                                var startDate = new Date(start_date);
                                var endDate = new Date(end_date);
                                var uniqueName = `${data.schedule_no}`;
                                if (startDate >= today) {
                                    var startScheduleTime = startTime.split(':');
                                    var startScheduleDate = data.startDate.split('-')
                                    if (frequency == 'Hourly') {
                                        if (today <= endDate) {
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                            var i = Number(startScheduleTime[0]) + 1;
                                            if (i > 24) {
                                                i = i - 24;
                                                startScheduleDate[2] = Number(startScheduleDate[2]) + 1;
                                                if (Number(startScheduleDate[2]) > totalDaysInMonth) {
                                                    startScheduleDate[2] = Number(startScheduleDate[2]) - totalDaysInMonth;
                                                    startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                                    var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                    var scheduled_Time = new Date(scheduledTime);
                                                    if (scheduled_Time <= endDate) {
                                                        runScheduledTasks(formattedTime)
                                                    }
                                                } else {
                                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                                    var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                    var scheduled_Time = new Date(scheduledTime);
                                                    if (scheduled_Time <= endDate) {
                                                        runScheduledTasks(formattedTime)
                                                    }
                                                }
                                            } else {
                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                var scheduled_Time = new Date(scheduledTime);
                                                if (scheduled_Time <= endDate) {
                                                    runScheduledTasks(formattedTime)
                                                }
                                            }
                                            function incrementEveryHour() {
                                                if (today <= endDate) {
                                                    i += 1;
                                                    if (i > 24) {
                                                        i = i - 24;
                                                        startScheduleDate[2] = Number(startScheduleDate[2]) + 1;
                                                        if (Number(startScheduleDate[2]) > totalDaysInMonth) {
                                                            startScheduleDate[2] = Number(startScheduleDate[2]) - totalDaysInMonth;
                                                            startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                            var scheduled_Time = new Date(scheduledTime);
                                                            if (scheduled_Time <= endDate) {
                                                                runScheduledTasks(formattedTime)
                                                            }
                                                        } else {
                                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                            var scheduled_Time = new Date(scheduledTime);
                                                            if (scheduled_Time <= endDate) {
                                                                runScheduledTasks(formattedTime)
                                                            }
                                                        }
                                                    } else {
                                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                        var scheduled_Time = new Date(scheduledTime);
                                                        if (scheduled_Time <= endDate) {
                                                            runScheduledTasks(formattedTime)
                                                        }
                                                    }
                                                    setTimeout(incrementEveryHour, 3600000);
                                                }
                                            }
                                            incrementEveryHour();
                                        }
                                    } else if (frequency == 'Daily') {
                                        if (today <= endDate) {
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                            var i = Number(startScheduleDate[2]) + 1;
                                            if (totalDaysInMonth < i) {
                                                i = i - totalDaysInMonth;
                                                startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                                if (Number(startScheduleDate[1]) > 12) {
                                                    startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                    var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                    var scheduled_Time = new Date(scheduledTime);
                                                    if (scheduled_Time <= endDate) {
                                                        runScheduledTasks(formattedTime)
                                                    }
                                                } else {
                                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                    var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                    var scheduled_Time = new Date(scheduledTime);
                                                    if (scheduled_Time <= endDate) {
                                                        runScheduledTasks(formattedTime)
                                                    }
                                                }
                                            } else {
                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                var scheduled_Time = new Date(scheduledTime);
                                                if (scheduled_Time <= endDate) {
                                                    runScheduledTasks(formattedTime)
                                                }
                                            }
                                            function incrementEveryHour() {
                                                if (today < endDate) {
                                                    i += 1;
                                                    if (totalDaysInMonth < i) {
                                                        i = i - totalDaysInMonth;
                                                        startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                                        if (Number(startScheduleDate[1]) > 12) {
                                                            startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                                            startScheduleDate[0] = Number(startScheduleDate[0]) + 1;
                                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                            var scheduled_Time = new Date(scheduledTime);
                                                            if (scheduled_Time <= endDate) {
                                                                runScheduledTasks(formattedTime)
                                                            }
                                                        } else {
                                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                            var scheduled_Time = new Date(scheduledTime);
                                                            if (scheduled_Time <= endDate) {
                                                                runScheduledTasks(formattedTime)
                                                            }
                                                        }
                                                    } else {
                                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                        // var scheduledTime = `${yyyy}-${mm}-${i}`
                                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                        var scheduled_Time = new Date(scheduledTime);
                                                        if (scheduled_Time <= endDate) {
                                                            runScheduledTasks(formattedTime)
                                                        }
                                                    }
                                                    setTimeout(incrementEveryHour, 86400000);
                                                }
                                            }
                                            incrementEveryHour();
                                        }
                                    } else if (frequency == 'Weekly') {
                                        if (today <= endDate) {
                                            if (startDate > today) {
                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                                runScheduledTasks(formattedTime)
                                            }
                                            var i = Number(startScheduleDate[2]) + 7;
                                            if (totalDaysInMonth < i) {
                                                i = i - totalDaysInMonth;
                                                startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                                if (Number(startScheduleDate[1]) > 12) {
                                                    startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                                    startScheduleDate[0] = Number(startScheduleDate[0]) + 1;
                                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                    var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                    var scheduled_Time = new Date(scheduledTime);
                                                    if (scheduled_Time <= endDate) {
                                                        runScheduledTasks(formattedTime)
                                                    }
                                                } else {
                                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                    var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                    var scheduled_Time = new Date(scheduledTime);
                                                    if (scheduled_Time <= endDate) {
                                                        runScheduledTasks(formattedTime)
                                                    }
                                                }
                                                function incrementEveryWeek() {
                                                    if (today < endDate) {
                                                        i += 7;
                                                        if (totalDaysInMonth < i) {
                                                            i = i - totalDaysInMonth;
                                                            startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                                            if (Number(startScheduleDate[1]) > 12) {
                                                                startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                                                startScheduleDate[0] = Number(startScheduleDate[0]) + 1;
                                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                                var scheduled_Time = new Date(scheduledTime);
                                                                if (scheduled_Time <= endDate) {
                                                                    runScheduledTasks(formattedTime)
                                                                }
                                                            } else {
                                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                                var scheduled_Time = new Date(scheduledTime);
                                                                if (scheduled_Time <= endDate) {
                                                                    runScheduledTasks(formattedTime)
                                                                }
                                                            }
                                                        } else {
                                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                            var scheduled_Time = new Date(scheduledTime);
                                                            if (scheduled_Time <= endDate) {
                                                                runScheduledTasks(formattedTime)
                                                            }
                                                        }
                                                        // Schedule the function to run again in one hour (3600000 milliseconds)
                                                        setTimeout(incrementEveryWeek, 604800000);
                                                    }
                                                }
                                                incrementEveryWeek();
                                            } else {
                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                var scheduled_Time = new Date(scheduledTime);
                                                if (scheduled_Time <= endDate) {
                                                    runScheduledTasks(formattedTime)
                                                }
                                                function incrementEveryWeek() {
                                                    if (today < endDate) {
                                                        i += 7;
                                                        if (totalDaysInMonth < i) {
                                                            i = i - totalDaysInMonth;
                                                            startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                                            if (Number(startScheduleDate[1]) > 12) {
                                                                startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                                                startScheduleDate[0] = Number(startScheduleDate[0]) + 1;
                                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                                var scheduled_Time = new Date(scheduledTime);
                                                                if (scheduled_Time <= endDate) {
                                                                    runScheduledTasks(formattedTime)
                                                                }
                                                            } else {
                                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                                var scheduled_Time = new Date(scheduledTime);
                                                                if (scheduled_Time <= endDate) {
                                                                    runScheduledTasks(formattedTime)
                                                                }
                                                            }
                                                        } else {
                                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                            var scheduled_Time = new Date(scheduledTime);
                                                            if (scheduled_Time <= endDate) {
                                                                runScheduledTasks(formattedTime)
                                                            }
                                                        }
                                                        setTimeout(incrementEveryWeek, 604800000);
                                                    }
                                                }
                                                incrementEveryWeek();
                                            }
                                        }
                                    }
                                } else {
                                    var startScheduleTime = startTime.split(':');
                                    var startScheduleDate = data.startDate.split('-')
                                    if (frequency == 'Hourly') {
                                        if (today <= endDate) {
                                            var i = Number(hours) + 1;
                                            if (i > 24) {
                                                i = i - 24;
                                                dd = Number(dd) + 1;
                                                if (Number(dd) > totalDaysInMonth) {
                                                    dd = Number(dd) - totalDaysInMonth;
                                                    mm = Number(mm) + 1
                                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                                                    runScheduledTasks(formattedTime)
                                                } else {
                                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                                                    runScheduledTasks(formattedTime)
                                                }
                                            } else {
                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                                                runScheduledTasks(formattedTime)
                                            }
                                            function incrementEveryHour() {
                                                if (today <= endDate) {
                                                    i += 1;
                                                    if (i > 24) {
                                                        i = i - 24;
                                                        dd = Number(dd) + 1;
                                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                                                        runScheduledTasks(formattedTime)
                                                    } else {
                                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                                                        var scheduledTime = `${yyyy}-${mm}-${dd} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                        var scheduled_Time = new Date(scheduledTime);
                                                        if (scheduled_Time <= endDate) {
                                                            runScheduledTasks(formattedTime)
                                                        }
                                                    }
                                                    setTimeout(incrementEveryHour, 3600000);
                                                }
                                            }
                                            incrementEveryHour();
                                        }
                                    } else if (frequency == 'Daily') {
                                        if (today <= endDate) {
                                            var i = Number(dd) + 1;
                                            if (totalDaysInMonth < i) {
                                                i = i - totalDaysInMonth;
                                                mm = Number(mm) + 1
                                                if (Number(mm) > 12) {
                                                    mm = Number(mm) - 12;
                                                    yyyy = Number(yyyy) + 1;
                                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                    var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                    var scheduled_Time = new Date(scheduledTime);
                                                    if (scheduled_Time <= endDate) {
                                                        runScheduledTasks(formattedTime)
                                                    }
                                                } else {
                                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                    var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                    var scheduled_Time = new Date(scheduledTime);
                                                    if (scheduled_Time <= endDate) {
                                                        runScheduledTasks(formattedTime)
                                                    }
                                                }
                                            } else {
                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                var scheduled_Time = new Date(scheduledTime);
                                                if (scheduled_Time <= endDate) {
                                                    runScheduledTasks(formattedTime)
                                                }
                                            }
                                            function incrementEveryHour() {
                                                if (today < endDate) {
                                                    i += 1;
                                                    if (totalDaysInMonth < i) {
                                                        i = i - totalDaysInMonth;
                                                        mm = Number(mm) + 1
                                                        if (Number(mm) > 12) {
                                                            mm = Number(mm) - 12;
                                                            yyyy = Number(yyyy) + 1;
                                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                            var scheduled_Time = new Date(scheduledTime);
                                                            if (scheduled_Time <= endDate) {
                                                                runScheduledTasks(formattedTime)
                                                            }
                                                        } else {
                                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                            var scheduled_Time = new Date(scheduledTime);
                                                            if (scheduled_Time <= endDate) {
                                                                runScheduledTasks(formattedTime)
                                                            }
                                                        }
                                                    } else {
                                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                        var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                        var scheduled_Time = new Date(scheduledTime);
                                                        if (scheduled_Time <= endDate) {
                                                            runScheduledTasks(formattedTime)
                                                        }
                                                    }
                                                    setTimeout(incrementEveryHour, 86400000);
                                                }
                                            }
                                            incrementEveryHour();
                                        }
                                    } else if (frequency == 'Weekly') {
                                        if (today <= endDate) {
                                            var i = Number(startScheduleDate[2]) + 7;
                                            if (totalDaysInMonth < i) {
                                                i = i - totalDaysInMonth;
                                                mm = Number(mm) + 1
                                                if (Number(mm) > 12) {
                                                    mm = Number(mm) - 12;
                                                    yyyy = Number(yyyy) + 1;
                                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                    var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                    var scheduled_Time = new Date(scheduledTime);
                                                    if (scheduled_Time <= endDate) {
                                                        runScheduledTasks(formattedTime)
                                                    }
                                                } else {
                                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                    var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                    var scheduled_Time = new Date(scheduledTime);
                                                    if (scheduled_Time <= endDate) {
                                                        runScheduledTasks(formattedTime)
                                                    }
                                                }
                                                function incrementEveryWeek() {
                                                    if (today < endDate) {
                                                        i += 7;
                                                        if (totalDaysInMonth < i) {
                                                            i = i - totalDaysInMonth;
                                                            mm = Number(mm) + 1
                                                            if (Number(mm) > 12) {
                                                                mm = Number(mm) - 12;
                                                                yyyy = Number(yyyy) + 1;
                                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                                var scheduled_Time = new Date(scheduledTime);
                                                                if (scheduled_Time <= endDate) {
                                                                    runScheduledTasks(formattedTime)
                                                                }
                                                            } else {
                                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                                var scheduled_Time = new Date(scheduledTime);
                                                                if (scheduled_Time <= endDate) {
                                                                    runScheduledTasks(formattedTime)
                                                                }
                                                            }
                                                        } else {
                                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                            var scheduled_Time = new Date(scheduledTime);
                                                            if (scheduled_Time <= endDate) {
                                                                runScheduledTasks(formattedTime)
                                                            }
                                                        }
                                                        // Schedule the function to run again in one hour (3600000 milliseconds)
                                                        setTimeout(incrementEveryWeek, 604800000);
                                                    }
                                                }
                                                incrementEveryWeek();
                                            } else {
                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                var scheduled_Time = new Date(scheduledTime);
                                                if (scheduled_Time <= endDate) {
                                                    runScheduledTasks(formattedTime)
                                                }
                                                function incrementEveryWeek() {
                                                    if (today < endDate) {
                                                        i += 7;
                                                        if (totalDaysInMonth < i) {
                                                            i = i - totalDaysInMonth;
                                                            mm = Number(mm) + 1
                                                            if (Number(mm) > 12) {
                                                                mm = Number(mm) - 12;
                                                                yyyy = Number(yyyy) + 1;
                                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                                var scheduled_Time = new Date(scheduledTime);
                                                                if (scheduled_Time <= endDate) {
                                                                    runScheduledTasks(formattedTime)
                                                                }
                                                            } else {
                                                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                                var scheduled_Time = new Date(scheduledTime);
                                                                if (scheduled_Time <= endDate) {
                                                                    runScheduledTasks(formattedTime)
                                                                }
                                                            }
                                                        } else {
                                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                                            var scheduled_Time = new Date(scheduledTime);
                                                            if (scheduled_Time <= endDate) {
                                                                runScheduledTasks(formattedTime)
                                                            }
                                                        }
                                                        // Schedule the function to run again in one hour (3600000 milliseconds)
                                                        setTimeout(incrementEveryWeek, 604800000);
                                                    }
                                                }
                                                incrementEveryWeek();
                                            }
                                        }
                                    }
                                }
                                function runScheduledTasks(formattedTime) {
                                    console.log(formattedTime)
                                    var schedule_job = schedule.scheduleJob(uniqueName, formattedTime, async () => {
                                        await phonebookApiurlSchedule(method, api_url, response_name, currentPhnbookId, phone_field_name, id_user, id_department, phonebook_id, name_field, collectionId, createdAtDate, duplicate_check, key)
                                        console.log('Inner Schedule  every frequency.......................', new Date());
                                    });
                                    scheduledJobsArray.push(schedule_job);
                                }
                                const endschedule = schedule.scheduleJob(uniqueName, endDate, async () => {
                                    var my_job = schedule.scheduledJobs[uniqueName];
                                    if (my_job != undefined)
                                        my_job.cancel();
                                    console.log('end shcedule.......................', new Date());
                                });
                            }
                            data.collectionId = insertCollection._id;
                            if (data.template.length != 0) {
                                data.template.map(async (temp) => {
                                    var templateObj = {}
                                    for (const key in temp) {
                                        if (Object.hasOwnProperty.call(temp, key)) {
                                            templateObj[key] = temp[key];
                                        }
                                    }
                                    delete templateObj._id
                                    delete templateObj.__v
                                    delete templateObj.createdAt;
                                    templateObj.createdAt = createdAtDate;
                                    templateObj.phonebook_id = currentPhnbookId;
                                    templateObj.collectionId = data.collectionId;
                                    var insertTemplates = await phonebook_templatesModel.create(templateObj);
                                    data.new_template_id = insertTemplates._id;
                                    if (data.contacts != undefined) {
                                        if (phonbook.phonebook_duplicate_check == 1) {
                                            function removeDuplicates(data) {
                                                const phoneNumbers = new Set();
                                                const filteredData = data.filter(entry => {
                                                    entry = entry._doc
                                                    const phoneNumber = entry['phone_number'];
                                                    if (!phoneNumbers.has(phoneNumber)) {
                                                        phoneNumbers.add(phoneNumber);
                                                        return true;
                                                    }
                                                    return false;
                                                });
                                                return filteredData;
                                            }
                                            var contacts = removeDuplicates(data.contacts);
                                            contacts = contacts.filter(item => item._doc.phone_number !== '');
                                            contacts.map(async (contact) => {
                                                contact = contact._doc
                                                var contactObj = {}
                                                for (const key in contact) {
                                                    if (Object.hasOwnProperty.call(contact, key)) {
                                                        contactObj[key] = contact[key];
                                                    }
                                                }
                                                var existChecking = contactArr.filter(item => item.phone_number === contact.phone_number);
                                                if (existChecking.length != 0) {
                                                    resolve(contactArr);
                                                } else {
                                                    delete contactObj._id
                                                    delete contactObj.__v
                                                    delete contactObj.createdAt;
                                                    contactObj.createdAt = createdAtDate;
                                                    contactObj.phonebook_id = currentPhnbookId;
                                                    contactObj.collectionId = data.collectionId;
                                                    contactObj.template_id = data.new_template_id;
                                                    contactArr.push(contactObj)
                                                    resolve(contactArr);
                                                }
                                            })
                                            // var updatecountSql = `UPDATE  phonebook  SET  contact_count ='${contacts.length}' WHERE id = '${currentPhnbookId}'`;
                                            // var [updateCount] = await getConnection.query(updatecountSql);
                                        } else {
                                            data.contacts.map(async (contact) => {
                                                var contactObj = {}
                                                contact = contact._doc
                                                for (const key in contact) {
                                                    if (Object.hasOwnProperty.call(contact, key)) {
                                                        contactObj[key] = contact[key];
                                                    }
                                                }
                                                delete contactObj._id
                                                delete contactObj.__v
                                                delete contactObj.createdAt;
                                                contactObj.createdAt = createdAtDate;
                                                contactObj.phonebook_id = currentPhnbookId;
                                                contactObj.collectionId = data.collectionId;
                                                contactObj.template_id = data.new_template_id;
                                                contactArr.push(contactObj)
                                                resolve(contactArr);
                                            })
                                        }
                                    } else {
                                        resolve(contactArr);
                                    }
                                })
                            } else {
                                resolve(contactArr);
                            }
                        })
                    })
                    Promise.all(resultMapping.flat())
                        .then(async (results) => {
                            var output = results[0]
                            const result = await phonebookModel.updateOne(
                                { _id: currentPhnbookId },
                                { $set: { contact_count: output.length } }
                            );
                            var insertManyresult = await phonebook_contactsModel.insertMany(output);
                            res.locals.result = "successfully copy";
                            next()
                        })
                        .catch(error => {
                            console.error(error);
                            res.locals.result = "err";
                            next()
                        });
                } else {
                    res.locals.result = "no contact";
                    next()
                }
            } else {
                res.locals.result = "no contact";
                next()
            }
        } else {
            var result = await phonebook_collectionModel.aggregate([
                {
                    $lookup:
                    {
                        from: "phonebook_templates",
                        localField: "_id",
                        foreignField: "collectionId",
                        as: "template"
                    }
                },
                {
                    $match: {
                        'phonebook_id': phonebookId,
                    },
                },
                // {
                //     $limit: 30000,
                // }
            ]);
            if (result.length != 0) {
                var copyData = result;
                var contactArr = [];
                var map_result = Promise.all(
                    result.map(async (data) => {
                        var collectionObj = {}
                        for (const key in data) {
                            if (Object.hasOwnProperty.call(data, key)) {
                                collectionObj[key] = data[key];
                            }
                        }
                        delete collectionObj.contacts
                        delete collectionObj.template
                        delete collectionObj._id
                        delete collectionObj.__v
                        collectionObj.phonebook_id = currentPhnbookId;
                        delete collectionObj.createdAt;
                        collectionObj.createdAt = createdAtDate;
                        var insertCollection = await phonebook_collectionModel.create(collectionObj);
                        data.collectionId = insertCollection._id;
                        data.template.map(async (temp) => {
                            var templateObj = {}
                            for (const key in temp) {
                                if (Object.hasOwnProperty.call(temp, key)) {
                                    templateObj[key] = temp[key];
                                }
                            }
                            delete templateObj._id
                            delete templateObj.__v
                            delete templateObj.createdAt;
                            templateObj.createdAt = createdAtDate;
                            templateObj.phonebook_id = currentPhnbookId;
                            templateObj.collectionId = data.collectionId;
                            var insertTemplates = await phonebook_templatesModel.create(templateObj);
                        })
                        return data
                    })
                )
                var result = await map_result;
                res.locals.result = "successfully copy";
                next()
            } else {
                res.locals.result = "no contact";
                next()
            }
        }
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_phonebook_by_campaignId(req, res, next) {
    try {
        var campaignId = req.query.campaignId;
        var sql = `SELECT phonebook_id FROM cc_campaign_phonebook WHERE campaign_id = '${campaignId}'`;
        var [result] = await getConnection.query(sql);
        const phonebookIds = result.map(row => row.phonebook_id);
        const mongoResults = await collection.find({ phonebook_id: { $in: phonebookIds } })
        const transformedResults = mongoResults.map(doc => ({
            id: doc._id,
            name: doc.pbname,
            ...doc
        }));
        res.locals.result = transformedResults;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
function IP6to4(ip6) {
    function parseIp6(ip6str) {
        const str = ip6str.toString();
        // Initialize
        const ar = new Array();
        for (var i = 0; i < 8; i++) ar[i] = 0;
        // Check for trivial IPs
        if (str == '::') return ar;
        // Parse
        const sar = str.split(':');
        let slen = sar.length;
        if (slen > 8) slen = 8;
        let j = 0;
        i = 0
        for (i = 0; i < slen; i++) {
            // This is a "::", switch to end-run mode
            if (i && sar[i] == '') {
                j = 9 - slen + i;
                continue;
            }
            ar[j] = parseInt(`0x0${sar[i]}`);
            j++;
        }
        return ar;
    }
    var ip6parsed = parseIp6(ip6);
    const ip4 = `${ip6parsed[6] >> 8}.${ip6parsed[6] & 0xff}.${ip6parsed[7] >> 8}.${ip6parsed[7] & 0xff}`;
    return ip4;
}

async function phonenumber_exist_checking(req, res, next) {
    try {
        var ipAddressV6 = requestIp.getClientIp(req);
        console.log("given ip =====", ipAddressV6)
        if (ipAddressV6 == "::ffff:192.168.2.10") {
            var phonebook_id = req.query.phonebook_id;
            var phone_number = req.query.phone_number;
            var filter = [{ phone_number: phone_number }, { phonebook_id: phonebook_id }];
            var existChecking = await phonebook_contactsModel.find({ $and: filter })
            if (existChecking.length != 0) {
                res.locals.result = "exist";
            } else {
                res.locals.result = "no existing data";
            }
        }
        else {
            res.locals.result = "blocked IP"
        }
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}

async function insert_phnbook_contacts(req, res, next) {
    try {
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        if (isAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = 0;
        } else if (isSubAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = req.body.id_department;
        } else if (isDept == 1) {
            var id_user = req.token.id_user;
            var id_department = req.token.id;
        }
        var contacts = req.body.contacts;
        var collectionId = req.body.collectionId;
        var name = req.body.contactListName;
        var phonebook_id = req.body.phonebookId;
        var duplicate_check = req.body.duplicateCheck;
        var api_check = req.body.apiCheck;
        delete contacts.createdAt;
        var currentDate = new Date();
        var decreasedTime = currentDate.getTime();
        var createdAtDate = new Date(decreasedTime);
        var filter = [{ name: name }, { phonebook_id: phonebook_id }];
        var response = {
            template: " ",
            contacts: " "
        }
        if (collectionId == undefined) {
            var existChecking = await phonebook_collectionModel.find({ $and: filter })
            if (existChecking.length != 0) {
                res.locals.result = "exist";
                response.template = "already exist";
                res.locals.response = response;
                next()
                return
            } else {
                var collection = {
                    name: req.body.contactListName,
                    id_user: id_user,
                    id_department: id_department,
                    phonebook_id: phonebook_id,
                    api_check: req.body.apiCheck
                }
                delete collection.createdAt;
                collection.createdAt = createdAtDate;
                var insertCollection = await phonebook_collectionModel.create(collection);
                response.template = "success"
                collectionId = insertCollection._id;
                var templates = req.body.template;
                templates.id_user = id_user;
                templates.id_department = id_department;
                templates.phonebook_id = req.body.phonebookId;
                templates.collectionId = collectionId;
                delete templates.createdAt;
                templates.createdAt = createdAtDate;
                var insertTemplates = await phonebook_templatesModel.create(templates);
                var template_id = insertTemplates._id;
            }
        } else {
            var templates = req.body.template;
            templates.id_user = id_user;
            templates.id_department = id_department;
            templates.phonebook_id = req.body.phonebookId;
            templates.collectionId = collectionId;
            if (api_check == 1) {
                var collection = {
                    api_check: req.body.apiCheck,
                    method: data.method,
                    api_url: req.body.apiData.api_url,
                    frequency: req.body.apiData.frequency,
                    startDate: req.body.apiData.startDate,
                    startTime: req.body.apiData.startTime,
                    endDate: req.body.apiData.endDate,
                    endTime: req.body.apiData.endTime,
                }
                var update = await phonebook_collectionModel.updateOne({ _id: new ObjectId(collectionId) }, { $set: collection });
            }
            delete templates.createdAt;
            templates.createdAt = createdAtDate;
            var result = await phonebook_templatesModel.find({ collectionId: new ObjectId(collectionId) })
            var update = await phonebook_templatesModel.updateOne({ collectionId: new ObjectId(collectionId) }, { $set: templates });
            var template_id = result[0]._doc._id;
            response.template = "success"
        }
        collectionId = new ObjectId(collectionId);
        var filterdata = contacts.filter(item => item.phone_number == '' || item.phone_number == undefined);
        if (duplicate_check == 1) {
            function removeDuplicates(data) {
                const phoneNumbers = new Set();
                const filteredData = data.filter(entry => {
                    const phoneNumber = entry['phone_number'];
                    if (!phoneNumbers.has(phoneNumber)) {
                        phoneNumbers.add(phoneNumber);
                        return true;
                    }
                    return false;
                });
                return filteredData;
            }
            contacts = removeDuplicates(contacts);
            contacts = contacts.filter(item => item.phone_number !== '');
            var uploaded_phnNumbers = Promise.all(
                contacts.map(async (data) => {
                    return data.phone_number;
                })
            )
            var phnNumber = await uploaded_phnNumbers;
            var existChecking = await phonebook_contactsModel.find({ $and: [{ phone_number: { $in: phnNumber } }, { id_user: id_user }, { id_department: id_department }, { phonebook_id: phonebook_id }] })
            if (existChecking.length != 0) {
                var existing_phnNumber = Promise.all(
                    contacts.map(async (phn) => {
                        var index = existChecking.findIndex(item =>
                            item._doc.phone_number === phn.phone_number);
                        if (index == -1) {
                            return phn;
                        }
                    })
                )
                var phnNumber_output = await existing_phnNumber;
                const filteredArray = phnNumber_output.filter(obj => obj !== undefined && obj !== null);
                var map_result = Promise.all(
                    filteredArray.map(async (data) => {
                        data.id_user = id_user;
                        data.id_department = id_department;
                        data.template_id = template_id;
                        data.phonebook_id = req.body.phonebookId;
                        data.collectionId = collectionId;
                        data.createdAt = createdAtDate;
                        return data;
                    })
                )
                var output = await map_result;
            } else {
                var map_result = Promise.all(
                    contacts.map(async (data) => {
                        data.id_user = id_user;
                        data.id_department = id_department;
                        data.template_id = template_id;
                        data.phonebook_id = req.body.phonebookId;
                        data.collectionId = collectionId;
                        data.createdAt = createdAtDate;
                        return data;
                    })
                )
                var output = await map_result;
            }
        } else {
            // contacts = contacts.filter(item => item.phone_number !== '');
            contacts = contacts.filter(item => item.phone_number !== '' && item.phone_number !== undefined);
            var map_result = Promise.all(
                contacts.map(async (data) => {
                    data.id_user = id_user;
                    data.id_department = id_department;
                    data.template_id = template_id;
                    data.phonebook_id = req.body.phonebookId;
                    data.collectionId = collectionId;
                    data.createdAt = createdAtDate;
                    return data;
                })
            )
            var output = await map_result;
        }
        // var sql = `SELECT contact_count FROM phonebook WHERE id = '${phonebook_id}'`;
        // var [count] = await getConnection.query(sql);
        const count = await phonebookModel.findOne({ _id: phonebook_id }).select('contact_count');
        if (output != undefined) {
            var totalcount = Number(count._doc.contact_count) + output.length;
        } else {
            var totalcount = Number(count._doc.contact_count)
        }
        // var updateSql = `UPDATE phonebook SET contact_count = contact_count+ '${output.length}' WHERE id = '${phonebook_id}'`;
        // var [update] = await sequelize.query(updateSql);
        if(count != undefined){
            if(count._doc.contact_count >= 0){
                await phonebookModel.updateOne(
                    { _id: phonebook_id },
                    { $inc: { contact_count: output.length } }
                );
            }
        }
        var campaign = `SELECT campaign_id FROM cc_campaign_phonebook WHERE phonebook_id = '${phonebook_id}'`;
        var [campaignRes] = await getConnection.query(campaign);
        if (campaignRes.length != 0) {
            var campaign_id = []
            campaignRes.map((data) => {
                campaign_id.push(data.campaign_id);
            });
            var updateSql1 = `UPDATE cc_campaign SET total_contacts = total_contacts + '${output.length}' WHERE id In (${campaign_id})`;
            var [update1] = await sequelize.query(updateSql1)
        }
        if (output.length != 0) {
            var insertManyresult = await phonebook_contactsModel.insertMany(output);
            res.locals.result = insertManyresult;
            response.contacts = "success"
        } else {
            res.locals.result = "phonenumber exist";
            response.contacts = "already exist"
        }
        res.locals.collectionId = collectionId;
        res.locals.response = response;
        res.locals.emptydata = filterdata;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function update_phnbook_contacts(req, res, next) {
    try {
        var _id = req.query.id;
        var data = req.body;
        var duplicate_check = req.query.duplicateCheck;
        if (duplicate_check == 1) {
            var existChecking = await phonebook_contactsModel.find({ $and: [{ phone_number: req.body.phone_number }, { id_user: id_user }, { id_department: id_department }, { phonebook_id: phonebook_id }, { _id: { $ne: new ObjectId(_id) } }] })
            if (existChecking.length != 0) {
                res.locals.result = "phonenumber exist";
            } else {
                var result = await phonebook_contactsModel.updateOne({ _id: new ObjectId(_id) }, { $set: data });
                res.locals.result = result;
            }
        } else {
            var result = await phonebook_contactsModel.updateOne({ _id: new ObjectId(_id) }, { $set: data });
            res.locals.result = result;
        }
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_all_phnbook_contacts(req, res, next) {
    try {
        var order = { createdAt: -1 }
        var limit = req.query.count;
        if (limit != undefined) limit = Number(limit);
        var skip = req.query.page;
        if (skip != undefined)
            skip = (skip - 1) * limit;
        var result = await phonebook_contactsModel.find().limit(limit).sort(order).skip(skip);
        var count = await phonebook_contactsModel.count();
        res.locals.result = result;
        res.locals.count = count;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_by_phnbook_contacts_id(req, res, next) {
    try {
        var _id = req.query.id;
        var result = await phonebook_contactsModel.find({ _id: new ObjectId(_id) }, { __v: 0, createdAt: 0, updatedAt: 0, id_user: 0, id_department: 0, phonebook_id: 0 });
        var phonebookTemplates = await phonebook_templatesModel.find({ _id: new ObjectId(result[0]._doc.template_id) }, { __v: 0, createdAt: 0, updatedAt: 0, id_user: 0, id_department: 0, phonebook_id: 0 })
        if (phonebookTemplates.length > 0) {
            var template_keys = Object.keys(phonebookTemplates[0].toJSON());
            template_keys.map(value => {
                if (result[0]._doc[value] != undefined) {
                    phonebookTemplates[0]._doc[value] = result[0]._doc[value]
                }
            })
        }
        res.locals.result = phonebookTemplates;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function delete_phnbook_contacts(req, res, next) {
    try {
        var _id = req.body.id;
        var phonebookId = req.body.phonebookId;
        const count = await phonebookModel.findOne({ _id: phonebookId }).select('contact_count');
        if(count != undefined){
            if(count._doc.contact_count > 0){
                const update = await phonebookModel.updateOne(
                    { _id: new ObjectId(phonebookId) },
                    { $inc: { contact_count: -_id.length } }
                );
            }
        }
        var campaign = `SELECT campaign_id FROM cc_campaign_phonebook WHERE phonebook_id = '${phonebookId}'`;
        var [campaignRes] = await getConnection.query(campaign);
        if (campaignRes.length != 0) {
            var campaign_id = []
            campaignRes.map((data) => {
                campaign_id.push(data.campaign_id);
            });
            var updateSql1 = `UPDATE cc_campaign SET total_contacts = total_contacts - '${_id.length}' WHERE id In (${campaign_id})`;
            var [update1] = await sequelize.query(updateSql1);
        }
        const result = await phonebook_contactsModel.deleteMany({ _id: { $in: _id } });
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_phnbook_contacts_byPhnbookId(req, res, next) {
    try {
        var order = { createdAt: -1 }
        var limit = req.query.count;
        if (limit != undefined) limit = Number(limit);
        var skip = req.query.page;
        if (skip != undefined)
            skip = (skip - 1) * limit;
        var phnbookId = req.query.phonebookId;
        const result = await phonebook_contactsModel.find({ phonebook_id: phnbookId }, { __v: 0, createdAt: 0, updatedAt: 0, id_user: 0, id_department: 0 }).sort(order).limit(limit).skip(skip);
        var count = await phonebook_contactsModel.count({ phonebook_id: phnbookId }).sort(order);
        res.locals.result = result;
        res.locals.count = count;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_phnbook_contacts_byCollectionId(req, res, next) {
    try {
        var order = { createdAt: -1 }
        var limit = req.query.count;
        if (limit != undefined) limit = Number(limit);
        var skip = req.query.page;
        if (skip != undefined)
            skip = (skip - 1) * limit
        var collectionId = req.query.collectionId;
        var filter = [{ collectionId: new ObjectId(collectionId) }];
        var name = req.query.name;
        if (name != undefined && name) {
            const isNumber = /^\d+$/.test(name);
            if (isNumber == true) {
                filter.push({ phone_number: { $regex: `.*${name}.*`, $options: 'i' } })
            } else {
                filter.push({ name: { $regex: `.*${name}.*`, $options: 'i' } })
            }
        }
        var result = await phonebook_contactsModel.find({ $and: filter }, { __v: 0, createdAt: 0, updatedAt: 0, id_user: 0, id_department: 0, template_id: 0 }).sort(order)
        var count = await phonebook_contactsModel.count({ $and: filter });
        res.locals.result = result;
        res.locals.count = count;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_by_phnbook_by_campaignId(req, res, next) {
    try {
        var campaignId = req.query.campaignId;
        var sql = `SELECT phonebook_id FROM cc_campaign_phonebook WHERE campaign_id = '${campaignId}'`;
        var [phonebook] = await getConnection.query(sql);
        res.locals.result = phonebook;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function delete_phnbook_collection(req, res, next) {
    try {
        var _id = req.query.id;
        var phonebookId = req.query.phonebookId;
        var deletedRes = await phonebook_contactsModel.count({ collectionId: new ObjectId(_id) })
        const update = await phonebookModel.updateOne(
            { _id: new ObjectId(phonebookId) },
            { $inc: { contact_count: -deletedRes } }
        );
        var campaign = `SELECT campaign_id FROM cc_campaign_phonebook WHERE phonebook_id = '${phonebookId}'`;
        var [campaignRes] = await getConnection.query(campaign);
        if (campaignRes.length != 0) {
            var campaign_id = []
            campaignRes.map((data) => {
                campaign_id.push(data.campaign_id);
            });
            var updateSql1 = `UPDATE cc_campaign SET total_contacts = total_contacts - '${deletedRes}' WHERE id In (${campaign_id})`;
            var [update1] = await sequelize.query(updateSql1);
        }
        const result = await phonebook_collectionModel.deleteOne({ _id: new ObjectId(_id) });
        const result1 = await phonebook_contactsModel.deleteMany({ collectionId: new ObjectId(_id) });
        const result2 = await phonebook_templatesModel.deleteMany({ collectionId: new ObjectId(_id) });
        const scheduleId = await schedule_collectionModel.findOne({ collectionId: new ObjectId(_id) });
        if (scheduleId != null) {
            var campaignNameWithoutSpaces = `${scheduleId._doc.scheduleNo}`;
            var my_job = schedule.scheduledJobs[campaignNameWithoutSpaces];
            if (my_job != undefined)
                my_job.cancel();
        }
        const result3 = await schedule_collectionModel.deleteOne({ collectionId: new ObjectId(_id) });
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_phnbook_collection_byPhnbookId(req, res, next) {
    try {
        var order = { createdAt: -1 }
        var limit = req.query.count;
        if (limit != undefined) limit = Number(limit);
        var skip = req.query.page;
        if (skip != undefined)
            skip = (skip - 1) * limit;
        var phnbookId = req.query.phonebookId;
        var collectionId = req.query.collectionId;
        var campaignCheckingSql = `SELECT phonebook_id,campaign_id,status FROM cc_campaign_phonebook JOIN cc_campaign ON cc_campaign_phonebook.campaign_id = cc_campaign.id WHERE status = 1 AND phonebook_id = '${phnbookId}'`
        var [campaignChecking] = await getConnection.query(campaignCheckingSql);
        if (campaignChecking.length == 0) {
            var phnbookRes = await phonebookModel.find({ _id: new ObjectId(phnbookId) }, { pbname: 1, contact_count: 1 })
            var result = await phonebook_collectionModel.find({ phonebook_id: phnbookId });
            if (result.length != 0) {
                if (collectionId != undefined && collectionId) {
                    collectionId = collectionId;
                } else {
                    collectionId = result[0]._id;
                }
                var contacts = await phonebook_contactsModel.find({ collectionId: new ObjectId(collectionId) }, { __v: 0, createdAt: 0, updatedAt: 0, id_user: 0, id_department: 0, template_id: 0 }).sort(order);
                var count = await phonebook_contactsModel.count({ collectionId: new ObjectId(collectionId) }).sort(order);
                if (result[0]._doc.api_check == 1) {
                    if (req.token.phone_number_masking == 1) {
                        var map_result = Promise.all(
                            contacts.map(async (value) => {
                                if (value._doc.phone_number) {
                                    var ph_num = await string_encode(value._doc.phone_number);
                                    if (ph_num) {
                                        value._doc.phone_number = ph_num;
                                    }
                                }
                                return value
                            })
                        )
                        var output = await map_result;
                        res.locals.contacts = output;
                    } else {
                        res.locals.contacts = contacts;
                    }
                } else {
                    res.locals.contacts = contacts;
                }
            }
            res.locals.result = result;
            res.locals.count = count;
            if (phnbookRes.length != 0) {
                res.locals.name = phnbookRes[0].pbname;
                res.locals.total = phnbookRes[0].contact_count;
            }
            next()
        } else {
            // var phnbookSql = `SELECT pbname,contact_count FROM phonebook WHERE id = '${phnbookId}'`;
            // var [phnbookRes] = await getConnection.query(phnbookSql);
            var phnbookRes = await phonebookModel.find({ _id: new ObjectId(phnbookId) }, { pbname: 1, contact_count: 1 })
            var result = await phonebook_collectionModel.find({ phonebook_id: phnbookId });
            if (result.length != 0) {
                if (collectionId != undefined && collectionId) {
                    collectionId = collectionId;
                } else {
                    collectionId = result[0]._id;
                }
                var contacts = await phonebook_contactsModel.find({ collectionId: new ObjectId(collectionId) }, { __v: 0, createdAt: 0, updatedAt: 0, id_user: 0, id_department: 0, template_id: 0 }).sort(order);
                var count = await phonebook_contactsModel.count({ collectionId: new ObjectId(collectionId) }).sort(order);
                if (result[0]._doc.api_check == 1) {
                    if (req.token.phone_number_masking == 1) {
                        var map_result = Promise.all(
                            contacts.map(async (value) => {
                                if (value._doc.phone_number) {
                                    var ph_num = await string_encode(value._doc.phone_number);
                                    if (ph_num) {
                                        value._doc.phone_number = ph_num;
                                    }
                                }
                                return value
                            })
                        )
                        var output = await map_result;
                        res.locals.contacts = output;
                    } else {
                        res.locals.contacts = contacts;
                    }
                } else {
                    res.locals.contacts = contacts;
                }
            }
            res.locals.result = 'campaginRunning';
            res.locals.phnbokkResult = result;
            res.locals.count = count;
            if (phnbookRes.length != 0) {
                res.locals.name = phnbookRes[0].pbname;
                res.locals.total = phnbookRes[0].contact_count;
            }
            next()
        }
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_all_phnbook_collection_for_dropdown(req, res, next) {
    try {
        var phnbookId = req.query.phonebookId;
        var result = await phonebook_collectionModel.find({ phonebook_id: phnbookId }, { __v: 0, createdAt: 0, updatedAt: 0, id_user: 0, id_department: 0 });
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_by_phnbook_collection_id(req, res, next) {
    try {
        var _id = req.query.id;
        var resObj = {}
        var result = await phonebook_collectionModel.find({ _id: new ObjectId(_id) })
        var templateResult = await phonebook_templatesModel.find({ collectionId: new ObjectId(_id) })
        if (templateResult.length != 0) {
            if (templateResult[0]._doc.templateData != undefined) {
                resObj.templateData = templateResult[0]._doc.templateData
            }
        }
        resObj.name = result[0]._doc.name;
        resObj.apiCheck = result[0]._doc.api_check;
        if (result[0]._doc.api_check == 1) {
            var api_data = {
                api_url: result[0]._doc.api_url,
                method: result[0]._doc.method,
                startDate: result[0]._doc.startDate,
                startTime: result[0]._doc.startTime,
                endDate: result[0]._doc.endDate,
                endTime: result[0]._doc.endTime,
                frequency: result[0]._doc.frequency,
                response_name: result[0]._doc.response_name,
                phone_field_name: result[0]._doc.phone_field_name,
                name_field: result[0]._doc.name_field,
            }
            resObj.apiData = api_data;
            res.locals.result = resObj
        } else {
            res.locals.result = resObj
            // res.locals.result = {"name":result[0]._doc.name,"apiCheck":result[0]._doc.api_check};
        }
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function update_phnbook_collection(req, res, next) {
    try {
        var _id = req.query.id;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
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
        var data = {};
        data.id_user = id_user;
        data.id_department = id_department;
        var phonebook_id = req.query.phonebookId
        data.name = req.body.name;
        data.api_check = req.body.apiCheck;
        if (req.body.apiData != undefined) {
            data.api_url = req.body.apiData.api_url;
            data.method = req.body.apiData.method;
            data.startDate = req.body.apiData.startDate;
            data.startTime = req.body.apiData.startTime;
            data.endDate = req.body.apiData.endDate;
            data.endTime = req.body.apiData.endTime;
            data.frequency = req.body.apiData.frequency;
            data.response_name = req.body.apiData.response_name;
            data.phone_field_name = req.body.apiData.phone_field_name;
            data.name_field = req.body.apiData.name_field;
        }
        var result = await phonebook_collectionModel.updateOne({ _id: new ObjectId(_id) }, { $set: data });
        var api_check = req.body.apiCheck
        var duplicate_check = req.query.duplicateCheck;
        var collectionId = req.query.id;
        var updateTemplate = req.body.templateData;
        var insertTemplates = await phonebook_templatesModel.findOneAndUpdate({ collectionId: new ObjectId(_id) }, { $set: { templateData: updateTemplate } });
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1
        var yyyy = today.getFullYear();
        var hours = today.getHours();
        var min = today.getMinutes();
        var sec = today.getSeconds();
        var currentDate = new Date();
        var decreasedTime = currentDate.getTime();
        var createdAtDate = new Date(decreasedTime);
        if (api_check == 1) {
            var scheduleId = await schedule_collectionModel.findOne({ collectionId: new ObjectId(_id) });
            if (scheduleId == null) {
                var order = { scheduleNo: -1 }
                var lastSchedule = await schedule_collectionModel.find().limit(1).sort(order);
                if (lastSchedule.length == 0) {
                    var obj = {
                        scheduleNo: '1_p',
                        collectionId: _id
                    }
                    var scheduleInsert = await schedule_collectionModel.create(obj);
                    var schedule_no = scheduleInsert._doc.scheduleNo
                    console.log("created schedule Id.....", schedule_no)
                } else {
                    if (lastSchedule.length != 0) {
                        var scheduleIdSplit = lastSchedule[0]._doc.scheduleNo.split('_');
                        var scheduleNo = Number(scheduleIdSplit[0]) + 1;
                        var obj = {
                            scheduleNo: scheduleNo + '_p',
                            collectionId: _id
                        }
                        var scheduleInsert = await schedule_collectionModel.create(obj);
                        var schedule_no = scheduleInsert._doc.scheduleNo
                        console.log("created schedule Id.....", schedule_no)
                    }
                }
            } else {
                var schedule_no = scheduleId._doc.scheduleNo
                var campaignNameWithoutSpaces = `${schedule_no}`;
                // var my_job = schedule.scheduledJobs[campaignNameWithoutSpaces];
                // var cancel_job = schedule.scheduledJobs[campaignNameWithoutSpaces]; 
                // console.log("before cancel ",schedule.scheduledJobs)
                // if(my_job != undefined){
                //     my_job.cancel();
                //     console.log("cancel already scheduled.................",schedule_no)
                //     console.log("after cancel",schedule.scheduledJobs)
                //     if (Object.keys(schedule.scheduledJobs).length === 0) {
                //         console.log("No scheduled jobs after cancellation");
                //     } else {
                //         console.log("Scheduled jobs still exist after cancellation",schedule.scheduledJobs);
                //     }
                // }
                const jobsWithSameName = scheduledJobsArray.filter(job => job.name === campaignNameWithoutSpaces);
                jobsWithSameName.forEach(job => {
                    job.cancel();
                    // Optionally remove the job reference from the array
                    const index = scheduledJobsArray.indexOf(job);
                    if (index !== -1) {
                        scheduledJobsArray.splice(index, 1);
                    }
                });
            }
            var response_name = req.body.apiData.response_name;
            var phone_field_name = req.body.apiData.phone_field_name;
            var name_field = req.body.apiData.name_field;
            var method = req.body.apiData.method;
            var api_url = req.body.apiData.api_url;
            var frequency = req.body.apiData.frequency;
            var key = 'MKDK73JKSA69G2Y3'
            function formatTime(time) {
                let formattedHours = time.hours;
                let formattedminutes = time.mins;
                if (time.AMorPM === 'PM' && time.hours !== 12) {
                    formattedHours += 12;
                } else if (time.AMorPM === 'AM' && time.hours == 12) {
                    formattedHours += 12;
                }
                const formattedTime = `${formattedHours}:${formattedminutes}:0`;
                return formattedTime
            }
            var startTime = formatTime(req.body.apiData.startTime);
            var endTime = formatTime(req.body.apiData.endTime);
            var start_date = req.body.apiData.startDate + ' ' + startTime;
            var end_date = req.body.apiData.endDate + ' ' + endTime
            var startDate = new Date(start_date);
            var endDate = new Date(end_date);
            var uniqueName = `${schedule_no}`;
            var currentMonth = startDate.getMonth();
            const nextMonth = new Date(currentDate);
            nextMonth.setMonth(currentMonth + 1, 1);
            nextMonth.setDate(nextMonth.getDate() - 1);
            var totalDaysInMonth = nextMonth.getDate();
            if (startDate >= today) {
                var startScheduleTime = startTime.split(':');
                var startScheduleDate = req.body.apiData.startDate.split('-')
                if (frequency == 'Hourly') {
                    if (today <= endDate) {
                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                        var scheduled_Time = new Date(scheduledTime);
                        if (scheduled_Time <= endDate) {
                            runScheduledTasks(formattedTime)
                        }
                        var i = Number(startScheduleTime[0]) + 1;
                        if (i > 24) {
                            i = i - 24;
                            startScheduleDate[2] = Number(startScheduleDate[2]) + 1;
                            if (Number(startScheduleDate[2]) > totalDaysInMonth) {
                                startScheduleDate[2] = Number(startScheduleDate[2]) - totalDaysInMonth;
                                startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            } else {
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            }
                        } else {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                            var scheduled_Time = new Date(scheduledTime);
                            if (scheduled_Time <= endDate) {
                                runScheduledTasks(formattedTime)
                            }
                        }
                        function incrementEveryHour() {
                            if (today <= endDate) {
                                i += 1;
                                if (i > 24) {
                                    i = i - 24;
                                    startScheduleDate[2] = Number(startScheduleDate[2]) + 1;
                                    if (Number(startScheduleDate[2]) > totalDaysInMonth) {
                                        startScheduleDate[2] = Number(startScheduleDate[2]) - totalDaysInMonth;
                                        startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                } else {
                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                    var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                    var scheduled_Time = new Date(scheduledTime);
                                    if (scheduled_Time <= endDate) {
                                        runScheduledTasks(formattedTime)
                                    }
                                }
                                setTimeout(incrementEveryHour, 3600000);
                            }
                        }
                        incrementEveryHour();
                    }
                } else if (frequency == 'Daily') {
                    if (today <= endDate) {
                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                        var scheduled_Time = new Date(scheduledTime);
                        if (scheduled_Time <= endDate) {
                            runScheduledTasks(formattedTime)
                        }
                        var i = Number(startScheduleDate[2]) + 1;
                        if (totalDaysInMonth < i) {
                            i = i - totalDaysInMonth;
                            startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                            if (Number(startScheduleDate[1]) > 12) {
                                startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            } else {
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            }
                        } else {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                            var scheduled_Time = new Date(scheduledTime);
                            if (scheduled_Time <= endDate) {
                                runScheduledTasks(formattedTime)
                            }
                        }
                        function incrementEveryHour() {
                            if (today < endDate) {
                                i += 1;
                                if (totalDaysInMonth < i) {
                                    i = i - totalDaysInMonth;
                                    startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                    if (Number(startScheduleDate[1]) > 12) {
                                        startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                        startScheduleDate[0] = Number(startScheduleDate[0]) + 1;
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                } else {
                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                    // var scheduledTime = `${yyyy}-${mm}-${i}`
                                    var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                    var scheduled_Time = new Date(scheduledTime);
                                    if (scheduled_Time <= endDate) {
                                        runScheduledTasks(formattedTime)
                                    }
                                }
                                setTimeout(incrementEveryHour, 86400000);
                            }
                        }
                        incrementEveryHour();
                    }
                } else if (frequency == 'Weekly') {
                    if (today <= endDate) {
                        if (startDate > today) {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                            runScheduledTasks(formattedTime)
                        }
                        var i = Number(startScheduleDate[2]) + 7;
                        if (totalDaysInMonth < i) {
                            i = i - totalDaysInMonth;
                            startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                            if (Number(startScheduleDate[1]) > 12) {
                                startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                startScheduleDate[0] = Number(startScheduleDate[0]) + 1;
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            } else {
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            }
                            function incrementEveryWeek() {
                                if (today < endDate) {
                                    i += 7;
                                    if (totalDaysInMonth < i) {
                                        i = i - totalDaysInMonth;
                                        startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                        if (Number(startScheduleDate[1]) > 12) {
                                            startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                            startScheduleDate[0] = Number(startScheduleDate[0]) + 1;
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        } else {
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                    // Schedule the function to run again in one hour (3600000 milliseconds)
                                    setTimeout(incrementEveryWeek, 604800000);
                                }
                            }
                            incrementEveryWeek();
                        } else {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                            var scheduled_Time = new Date(scheduledTime);
                            if (scheduled_Time <= endDate) {
                                runScheduledTasks(formattedTime)
                            }
                            function incrementEveryWeek() {
                                if (today < endDate) {
                                    i += 7;
                                    if (totalDaysInMonth < i) {
                                        i = i - totalDaysInMonth;
                                        startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                        if (Number(startScheduleDate[1]) > 12) {
                                            startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                            startScheduleDate[0] = Number(startScheduleDate[0]) + 1;
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        } else {
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                    setTimeout(incrementEveryWeek, 604800000);
                                }
                            }
                            incrementEveryWeek();
                        }
                    }
                }
            } else {
                var startScheduleTime = startTime.split(':');
                var startScheduleDate = req.body.apiData.startDate.split('-')
                if (frequency == 'Hourly') {
                    if (today <= endDate) {
                        // if (min < startScheduleTime[1]) {
                        //     var sheduleFoemated = `${startScheduleTime[2]} ${startScheduleTime[1]} ${hours} ${dd} ${mm} *`;
                        //     runScheduledTasks(sheduleFoemated)
                        // }
                        var i = Number(hours) + 1;
                        if (i > 24) {
                            i = i - 24;
                            dd = Number(dd) + 1;
                            if (Number(dd) > totalDaysInMonth) {
                                dd = Number(dd) - totalDaysInMonth;
                                mm = Number(mm) + 1
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                                runScheduledTasks(formattedTime)
                            } else {
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                                runScheduledTasks(formattedTime)
                            }
                        } else {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                            runScheduledTasks(formattedTime)
                        }
                        function incrementEveryHour() {
                            if (today <= endDate) {
                                i += 1;
                                if (i > 24) {
                                    i = i - 24;
                                    dd = Number(dd) + 1;
                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                                    runScheduledTasks(formattedTime)
                                } else {
                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                                    var scheduledTime = `${yyyy}-${mm}-${dd} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                    var scheduled_Time = new Date(scheduledTime);
                                    if (scheduled_Time <= endDate) {
                                        runScheduledTasks(formattedTime)
                                    }
                                }
                                setTimeout(incrementEveryHour, 3600000);
                            }
                        }
                        incrementEveryHour();
                    }
                } else if (frequency == 'Daily') {
                    if (today <= endDate) {
                        // if (Number(startScheduleTime[0]) > hours) {
                        //     var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${dd} ${mm} ${yyyy}`;
                        //     runScheduledTasks(formattedTime)
                        // }
                        var i = Number(dd) + 1;
                        if (totalDaysInMonth < i) {
                            i = i - totalDaysInMonth;
                            mm = Number(mm) + 1
                            if (Number(mm) > 12) {
                                mm = Number(mm) - 12;
                                yyyy = Number(yyyy) + 1;
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            } else {
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            }
                        } else {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                            var scheduled_Time = new Date(scheduledTime);
                            if (scheduled_Time <= endDate) {
                                runScheduledTasks(formattedTime)
                            }
                        }
                        function incrementEveryHour() {
                            if (today < endDate) {
                                i += 1;
                                if (totalDaysInMonth < i) {
                                    i = i - totalDaysInMonth;
                                    mm = Number(mm) + 1
                                    if (Number(mm) > 12) {
                                        mm = Number(mm) - 12;
                                        yyyy = Number(yyyy) + 1;
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                        var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                        var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                } else {
                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                    var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                    var scheduled_Time = new Date(scheduledTime);
                                    if (scheduled_Time <= endDate) {
                                        runScheduledTasks(formattedTime)
                                    }
                                }
                                setTimeout(incrementEveryHour, 86400000);
                            }
                        }
                        incrementEveryHour();
                    }
                } else if (frequency == 'Weekly') {
                    if (today <= endDate) {
                        // if (startDate > today) {
                        //     var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${startScheduleDate[2]} * *`;
                        //     runScheduledTasks(formattedTime)
                        // }
                        var i = Number(startScheduleDate[2]) + 7;
                        if (totalDaysInMonth < i) {
                            i = i - totalDaysInMonth;
                            mm = Number(mm) + 1
                            if (Number(mm) > 12) {
                                mm = Number(mm) - 12;
                                yyyy = Number(yyyy) + 1;
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            } else {
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            }
                            function incrementEveryWeek() {
                                if (today < endDate) {
                                    i += 7;
                                    if (totalDaysInMonth < i) {
                                        i = i - totalDaysInMonth;
                                        mm = Number(mm) + 1
                                        if (Number(mm) > 12) {
                                            mm = Number(mm) - 12;
                                            yyyy = Number(yyyy) + 1;
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        } else {
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                        var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                    // Schedule the function to run again in one hour (3600000 milliseconds)
                                    setTimeout(incrementEveryWeek, 604800000);
                                }
                            }
                            incrementEveryWeek();
                        } else {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                            var scheduled_Time = new Date(scheduledTime);
                            if (scheduled_Time <= endDate) {
                                runScheduledTasks(formattedTime)
                            }
                            function incrementEveryWeek() {
                                if (today < endDate) {
                                    i += 7;
                                    if (totalDaysInMonth < i) {
                                        i = i - totalDaysInMonth;
                                        mm = Number(mm) + 1
                                        if (Number(mm) > 12) {
                                            mm = Number(mm) - 12;
                                            yyyy = Number(yyyy) + 1;
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        } else {
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                        var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                    // Schedule the function to run again in one hour (3600000 milliseconds)
                                    setTimeout(incrementEveryWeek, 604800000);
                                }
                            }
                            incrementEveryWeek();
                        }
                    }
                }
            }
            function runScheduledTasks(formattedTime) {
                console.log(formattedTime)
                var schedule_job = schedule.scheduleJob(uniqueName, formattedTime, async () => {
                    await phonebookApiurlSchedule(method, api_url, response_name, _id, phone_field_name, id_user, id_department, phonebook_id, name_field, collectionId, createdAtDate, duplicate_check, key)
                    console.log('Inner Schedule  every frequency.......................', new Date());
                });
                scheduledJobsArray.push(schedule_job);
            }
            const endschedule = schedule.scheduleJob(uniqueName, endDate, async () => {
                // var my_job = schedule.scheduledJobs[uniqueName];
                // if (my_job != undefined)
                //     my_job.cancel();
                const jobsWithSameName = scheduledJobsArray.filter(job => job.name === campaignNameWithoutSpaces);
                jobsWithSameName.forEach(job => {
                    job.cancel();
                    // Optionally remove the job reference from the array
                    const index = scheduledJobsArray.indexOf(job);
                    if (index !== -1) {
                        scheduledJobsArray.splice(index, 1);
                    }
                });
                console.log('end shcedule.......................', new Date());
            });
            res.locals.result = "template added successfully";
        }
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function phonebookApiurlSchedule(method, api_url, response_name, _id, phone_field_name, id_user, id_department, phonebook_id, name_field, collectionId, createdAtDate, duplicate_check, key) {
    const axiosConfig = {
        method: method,
        url: api_url
    };
    axios(axiosConfig).then(async function (response) {
        console.log("axios successfull response........................", new Date())
        var responseData = response.data[response_name]
        if (responseData != undefined && responseData != null && responseData) {
            var templateInsert = Object.keys(responseData[0]);
            var phonebookTemplateData = {}
            templateInsert.map(key => {
                phonebookTemplateData[key] = '';
            });
            var insertTemplates = await phonebook_templatesModel.findOneAndUpdate({ collectionId: new ObjectId(_id) }, { $set: phonebookTemplateData });
            var template_id = insertTemplates._id;
            if (duplicate_check == 1) {
                function removeDuplicates(data) {
                    const phoneNumbers = new Set();
                    const filteredData = data.filter(entry => {
                        const phoneNumber = entry[phone_field_name];
                        if (!phoneNumbers.has(phoneNumber)) {
                            phoneNumbers.add(phoneNumber);
                            return true;
                        }
                        return false;
                    });
                    return filteredData;
                }
                responseData = removeDuplicates(responseData);
                responseData = responseData.filter(item => item[phone_field_name] !== '');
                var phnNumber = [];
                var phnNo = Promise.all(
                    responseData.map(async (data) => {
                        var phnNo = data[phone_field_name];
                        if (phnNo != null && phnNo != undefined && phnNo) {
                            var phone_number = await encrypteAes128(phnNo, key);
                            if (phone_number)
                                phnNumber.push(phone_number)
                        }
                    })
                )
                var phn_no = await phnNo;
                var existChecking = await phonebook_contactsModel.find({ $and: [{ phone_number: { $in: phnNumber } }, { id_user: id_user }, { id_department: id_department }, { phonebook_id: phonebook_id }] })
                if (existChecking.length != 0) {
                    var existing_phnNumber = Promise.all(
                        responseData.map(async (phn) => {
                            var phnNo = phn[phone_field_name];
                            phn.name = phn[name_field]
                            if (phnNo != null && phnNo != undefined && phnNo) {
                                var phone_number = await encrypteAes128(phnNo, key);
                                if (phone_number)
                                    phn.phone_number = phone_number;
                            }
                            if (phn.email != null || phn.email != undefined || phn.email) {
                                var emailRes = await decryptAes128(phn.email, key);
                                if (emailRes)
                                    phn.email = emailRes
                            }
                            var index = existChecking.findIndex(item =>
                                item._doc.phone_number === phone_number);
                            if (index == -1) {
                                return phn;
                            }

                        })
                    )
                    var phnNumber_output = await existing_phnNumber;
                    const filteredArray = phnNumber_output.filter(obj => obj !== undefined && obj !== null);
                    var map_result = Promise.all(
                        filteredArray.map(async (data) => {
                            data.id_user = id_user;
                            data.id_department = id_department;
                            data.template_id = template_id;
                            data.phonebook_id = phonebook_id
                            data.collectionId = collectionId;
                            data.createdAt = createdAtDate;
                            return data;
                        })
                    )
                    var output = await map_result;
                } else {
                    var map_result = Promise.all(
                        responseData.map(async (data) => {
                            data.id_user = id_user;
                            data.id_department = id_department;
                            data.template_id = template_id;
                            data.phonebook_id = phonebook_id
                            data.collectionId = collectionId;
                            data.createdAt = createdAtDate;
                            var phn = data[phone_field_name]
                            if (phn != null && phn != undefined && phn) {
                                var phone_number = await encrypteAes128(phn, key);
                                if (phone_number)
                                    data.phone_number = phone_number;
                            }
                            if (data.email != null && data.email != undefined && data.email) {
                                var emailRes = await decryptAes128(data.email, key);
                                if (emailRes)
                                    data.email = emailRes
                            }
                            data.name = data[name_field]
                            return data;
                        })
                    )
                    var output = await map_result;
                }
            } else {
                responseData = responseData.filter(item => item[phone_field_name] !== '');
                var map_result = Promise.all(
                    responseData.map(async (data) => {
                        data.id_user = id_user;
                        data.id_department = id_department;
                        data.template_id = template_id;
                        data.phonebook_id = phonebook_id
                        data.collectionId = collectionId;
                        data.createdAt = createdAtDate;
                        var phn = data[phone_field_name]
                        if (phn != null && phn != undefined && phn) {
                            var phone_number = await encrypteAes128(phn, key);
                            if (phone_number)
                                data.phone_number = phone_number;
                        }
                        if (data.email != null && data.email != undefined && data.email) {
                            var emailRes = await decryptAes128(data.email, key);
                            if (emailRes)
                                data.email = emailRes
                        }
                        data.name = data[name_field]
                        return data;
                    })
                )
                var output = await map_result;
            }
            output = output.filter(obj => obj[phone_field_name] !== null);
            if (output.length != 0) {
                var insertManyresult = await phonebook_contactsModel.insertMany(output);
                const result = await phonebookModel.updateOne({ _id: phonebook_id }, { $inc: { contact_count: output.length } });
                // var updateSql = `UPDATE phonebook SET contact_count = contact_count + '${output.length}' WHERE id = '${phonebook_id}'`;
                // var [update] = await sequelize.query(updateSql);
                var campaign = `SELECT campaign_id FROM cc_campaign_phonebook WHERE phonebook_id = '${phonebook_id}'`;
                var [campaignRes] = await getConnection.query(campaign);
                if (campaignRes.length != 0) {
                    var campaign_id = []
                    campaignRes.map((data) => {
                        campaign_id.push(data.campaign_id);
                    });
                    var updateSql1 = `UPDATE cc_campaign SET total_contacts = total_contacts + '${output.length}' WHERE id In (${campaign_id})`;
                    var [update1] = await sequelize.query(updateSql1)
                }
            }
        }
    }).catch(function (error) {
        console.log(error);
    });
}
// api_schedule function for app.js (api url schedule)
async function api_schedule() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1
    var yyyy = today.getFullYear();
    var Start = `${yyyy}-${mm}-${dd}`;
    var hours = today.getHours();
    var min = today.getMinutes();
    var sec = today.getSeconds();
    var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`;
    var todayTime = `${hours}:${min}:${sec}`
    var currentDate = new Date();
    var decreasedTime = currentDate.getTime();
    var createdAtDate = new Date(decreasedTime);
    var result = await phonebook_collectionModel.find({ $and: [{ startDate: { $lte: Start } }] });
    result.map(async (data) => {
        var id_user = data.id_user;
        var id_department = data.id_department;
        var phonebook_id = data.phonebook_id;
        var duplicate = `SELECT phonebook_duplicate_check FROM phonebook WHERE id = '${phonebook_id}'`;
        var [duplicateRes] = await getConnection.query(duplicate);
        if (duplicateRes.length != 0) {
            var duplicate_check = duplicateRes[0].phonebook_duplicate_check
        } else {
            var duplicate_check = 0
        }
        var collectionId = data._id;
        var method = data.method;
        var api_url = data.api_url;
        var frequency = data.frequency;
        var response_name = data.response_name;
        var phone_field_name = data.phone_field_name;
        var name_field = data.name_field;
        var scheduleId = await schedule_collectionModel.findOne({ collectionId: new ObjectId(collectionId) });
        if (scheduleId != null) {
            var schedule_no = scheduleId._doc.scheduleNo
        }
        var key = 'MKDK73JKSA69G2Y3'
        function formatTime(time) {
            let formattedHours = time.hours;
            let formattedminutes = time.mins;
            if (time.AMorPM === 'PM' && time.hours !== 12) {
                formattedHours += 12;
            } else if (time.AMorPM === 'AM' && time.hours == 12) {
                formattedHours += 12;
            }
            const formattedTime = `${formattedHours}:${formattedminutes}:0`;
            return formattedTime
        }
        var startTime = formatTime(data.startTime);
        var endTime = formatTime(data.endTime);
        var start_date = data.startDate + ' ' + startTime;
        var end_date = data.endDate + ' ' + endTime
        var startDate = new Date(start_date);
        var endDate = new Date(end_date);
        const currentMonth = startDate.getMonth();
        const nextMonth = new Date(currentDate);
        nextMonth.setMonth(currentMonth + 1, 1);
        nextMonth.setDate(nextMonth.getDate() - 1);
        var totalDaysInMonth = nextMonth.getDate();
        if (endDate >= today) {
            var uniqueName = `${schedule_no}`;
            if (startDate >= today) {
                var startScheduleTime = startTime.split(':');
                var startScheduleDate = data.startDate.split('-')
                if (frequency == 'Hourly') {
                    if (today <= endDate) {
                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                        var scheduled_Time = new Date(scheduledTime);
                        if (scheduled_Time <= endDate) {
                            runScheduledTasks(formattedTime)
                        }
                        var i = Number(startScheduleTime[0]) + 1;
                        if (i > 24) {
                            i = i - 24;
                            startScheduleDate[2] = Number(startScheduleDate[2]) + 1;
                            if (Number(startScheduleDate[2]) > totalDaysInMonth) {
                                startScheduleDate[2] = Number(startScheduleDate[2]) - totalDaysInMonth;
                                startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            } else {
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            }
                        } else {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                            var scheduled_Time = new Date(scheduledTime);
                            if (scheduled_Time <= endDate) {
                                runScheduledTasks(formattedTime)
                            }
                        }
                        function incrementEveryHour() {
                            if (today <= endDate) {
                                i += 1;
                                if (i > 24) {
                                    i = i - 24;
                                    startScheduleDate[2] = Number(startScheduleDate[2]) + 1;
                                    if (Number(startScheduleDate[2]) > totalDaysInMonth) {
                                        startScheduleDate[2] = Number(startScheduleDate[2]) - totalDaysInMonth;
                                        startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                } else {
                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                                    var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                    var scheduled_Time = new Date(scheduledTime);
                                    if (scheduled_Time <= endDate) {
                                        runScheduledTasks(formattedTime)
                                    }
                                }
                                setTimeout(incrementEveryHour, 3600000);
                            }
                        }
                        incrementEveryHour();
                    }
                } else if (frequency == 'Daily') {
                    if (today <= endDate) {
                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${startScheduleDate[2]} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                        var scheduled_Time = new Date(scheduledTime);
                        if (scheduled_Time <= endDate) {
                            runScheduledTasks(formattedTime)
                        }
                        var i = Number(startScheduleDate[2]) + 1;
                        if (totalDaysInMonth < i) {
                            i = i - totalDaysInMonth;
                            startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                            if (Number(startScheduleDate[1]) > 12) {
                                startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            } else {
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            }
                        } else {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                            var scheduled_Time = new Date(scheduledTime);
                            if (scheduled_Time <= endDate) {
                                runScheduledTasks(formattedTime)
                            }
                        }
                        function incrementEveryHour() {
                            if (today < endDate) {
                                i += 1;
                                if (totalDaysInMonth < i) {
                                    i = i - totalDaysInMonth;
                                    startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                    if (Number(startScheduleDate[1]) > 12) {
                                        startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                        startScheduleDate[0] = Number(startScheduleDate[0]) + 1;
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                } else {
                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                    // var scheduledTime = `${yyyy}-${mm}-${i}`
                                    var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                    var scheduled_Time = new Date(scheduledTime);
                                    if (scheduled_Time <= endDate) {
                                        runScheduledTasks(formattedTime)
                                    }
                                }
                                setTimeout(incrementEveryHour, 86400000);
                            }
                        }
                        incrementEveryHour();
                    }
                } else if (frequency == 'Weekly') {
                    if (today <= endDate) {
                        if (startDate > today) {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${startScheduleDate[2]} ${startScheduleDate[1]} *`;
                            runScheduledTasks(formattedTime)
                        }
                        var i = Number(startScheduleDate[2]) + 7;
                        if (totalDaysInMonth < i) {
                            i = i - totalDaysInMonth;
                            startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                            if (Number(startScheduleDate[1]) > 12) {
                                startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                startScheduleDate[0] = Number(startScheduleDate[0]) + 1;
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            } else {
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            }
                            function incrementEveryWeek() {
                                if (today < endDate) {
                                    i += 7;
                                    if (totalDaysInMonth < i) {
                                        i = i - totalDaysInMonth;
                                        startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                        if (Number(startScheduleDate[1]) > 12) {
                                            startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                            startScheduleDate[0] = Number(startScheduleDate[0]) + 1;
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        } else {
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                    // Schedule the function to run again in one hour (3600000 milliseconds)
                                    setTimeout(incrementEveryWeek, 604800000);
                                }
                            }
                            incrementEveryWeek();
                        } else {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                            var scheduled_Time = new Date(scheduledTime);
                            if (scheduled_Time <= endDate) {
                                runScheduledTasks(formattedTime)
                            }
                            function incrementEveryWeek() {
                                if (today < endDate) {
                                    i += 7;
                                    if (totalDaysInMonth < i) {
                                        i = i - totalDaysInMonth;
                                        startScheduleDate[1] = Number(startScheduleDate[1]) + 1
                                        if (Number(startScheduleDate[1]) > 12) {
                                            startScheduleDate[1] = Number(startScheduleDate[1]) - 12;
                                            startScheduleDate[0] = Number(startScheduleDate[0]) + 1;
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        } else {
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                            var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${startScheduleDate[1]} *`;
                                        var scheduledTime = `${startScheduleDate[0]}-${startScheduleDate[1]}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                    setTimeout(incrementEveryWeek, 604800000);
                                }
                            }
                            incrementEveryWeek();
                        }
                    }
                }
            } else {
                var startScheduleTime = startTime.split(':');
                var startScheduleDate = data.startDate.split('-')
                if (frequency == 'Hourly') {
                    if (today <= endDate) {
                        // if (min < startScheduleTime[1]) {
                        //     var sheduleFoemated = `${startScheduleTime[2]} ${startScheduleTime[1]} ${hours} ${dd} ${mm} *`;
                        //     runScheduledTasks(sheduleFoemated)
                        // }
                        var i = Number(hours) + 1;
                        if (i > 24) {
                            i = i - 24;
                            dd = Number(dd) + 1;
                            if (Number(dd) > totalDaysInMonth) {
                                dd = Number(dd) - totalDaysInMonth;
                                mm = Number(mm) + 1
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                                runScheduledTasks(formattedTime)
                            } else {
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                                runScheduledTasks(formattedTime)
                            }
                        } else {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                            runScheduledTasks(formattedTime)
                        }
                        function incrementEveryHour() {
                            if (today <= endDate) {
                                i += 1;
                                if (i > 24) {
                                    i = i - 24;
                                    dd = Number(dd) + 1;
                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                                    runScheduledTasks(formattedTime)
                                } else {
                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${i} ${dd} ${mm} *`;
                                    var scheduledTime = `${yyyy}-${mm}-${dd} ${i}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                    var scheduled_Time = new Date(scheduledTime);
                                    if (scheduled_Time <= endDate) {
                                        runScheduledTasks(formattedTime)
                                    }
                                }
                                setTimeout(incrementEveryHour, 3600000);
                            }
                        }
                        incrementEveryHour();
                    }
                } else if (frequency == 'Daily') {
                    if (today <= endDate) {
                        // if (Number(startScheduleTime[0]) > hours) {
                        //     var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${dd} ${mm} ${yyyy}`;
                        //     runScheduledTasks(formattedTime)
                        // }
                        var i = Number(dd) + 1;
                        if (totalDaysInMonth < i) {
                            i = i - totalDaysInMonth;
                            mm = Number(mm) + 1
                            if (Number(mm) > 12) {
                                mm = Number(mm) - 12;
                                yyyy = Number(yyyy) + 1;
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            } else {
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            }
                        } else {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                            var scheduled_Time = new Date(scheduledTime);
                            if (scheduled_Time <= endDate) {
                                runScheduledTasks(formattedTime)
                            }
                        }
                        function incrementEveryHour() {
                            if (today < endDate) {
                                i += 1;
                                if (totalDaysInMonth < i) {
                                    i = i - totalDaysInMonth;
                                    mm = Number(mm) + 1
                                    if (Number(mm) > 12) {
                                        mm = Number(mm) - 12;
                                        yyyy = Number(yyyy) + 1;
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                        var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                        var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                } else {
                                    var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                    var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                    var scheduled_Time = new Date(scheduledTime);
                                    if (scheduled_Time <= endDate) {
                                        runScheduledTasks(formattedTime)
                                    }
                                }
                                setTimeout(incrementEveryHour, 86400000);
                            }
                        }
                        incrementEveryHour();
                    }
                } else if (frequency == 'Weekly') {
                    if (today <= endDate) {
                        // if (startDate > today) {
                        //     var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${startScheduleDate[2]} * *`;
                        //     runScheduledTasks(formattedTime)
                        // }
                        var i = Number(startScheduleDate[2]) + 7;
                        if (totalDaysInMonth < i) {
                            i = i - totalDaysInMonth;
                            mm = Number(mm) + 1
                            if (Number(mm) > 12) {
                                mm = Number(mm) - 12;
                                yyyy = Number(yyyy) + 1;
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            } else {
                                var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                var scheduled_Time = new Date(scheduledTime);
                                if (scheduled_Time <= endDate) {
                                    runScheduledTasks(formattedTime)
                                }
                            }
                            function incrementEveryWeek() {
                                if (today < endDate) {
                                    i += 7;
                                    if (totalDaysInMonth < i) {
                                        i = i - totalDaysInMonth;
                                        mm = Number(mm) + 1
                                        if (Number(mm) > 12) {
                                            mm = Number(mm) - 12;
                                            yyyy = Number(yyyy) + 1;
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        } else {
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                        var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                    // Schedule the function to run again in one hour (3600000 milliseconds)
                                    setTimeout(incrementEveryWeek, 604800000);
                                }
                            }
                            incrementEveryWeek();
                        } else {
                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                            var scheduled_Time = new Date(scheduledTime);
                            if (scheduled_Time <= endDate) {
                                runScheduledTasks(formattedTime)
                            }
                            function incrementEveryWeek() {
                                if (today < endDate) {
                                    i += 7;
                                    if (totalDaysInMonth < i) {
                                        i = i - totalDaysInMonth;
                                        mm = Number(mm) + 1
                                        if (Number(mm) > 12) {
                                            mm = Number(mm) - 12;
                                            yyyy = Number(yyyy) + 1;
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        } else {
                                            var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                            var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                            var scheduled_Time = new Date(scheduledTime);
                                            if (scheduled_Time <= endDate) {
                                                runScheduledTasks(formattedTime)
                                            }
                                        }
                                    } else {
                                        var formattedTime = `${startScheduleTime[2]} ${startScheduleTime[1]} ${startScheduleTime[0]} ${i} ${mm} *`;
                                        var scheduledTime = `${yyyy}-${mm}-${i} ${startScheduleTime[0]}:${startScheduleTime[1]}:${startScheduleTime[2]}`
                                        var scheduled_Time = new Date(scheduledTime);
                                        if (scheduled_Time <= endDate) {
                                            runScheduledTasks(formattedTime)
                                        }
                                    }
                                    // Schedule the function to run again in one hour (3600000 milliseconds)
                                    setTimeout(incrementEveryWeek, 604800000);
                                }
                            }
                            incrementEveryWeek();
                        }
                    }
                }
            }
            function runScheduledTasks(formattedTime) {
                console.log(formattedTime)
                const innerJob = schedule.scheduleJob(uniqueName, formattedTime, async () => {
                    var innerschedule = await phonebookApiurlSchedule(method, api_url, response_name, collectionId, phone_field_name, id_user, id_department, phonebook_id, name_field, collectionId, createdAtDate, duplicate_check, key)
                    console.log('Inner Schedule  every frequency.......................', new Date());
                });
            }
            const endschedule = schedule.scheduleJob(uniqueName, endDate, async () => {
                // var my_job = schedule.scheduledJobs[uniqueName];
                // if (my_job != undefined)
                //     my_job.cancel();
                const jobsWithSameName = scheduledJobsArray.filter(job => job.name === campaignNameWithoutSpaces);
                jobsWithSameName.forEach(job => {
                    job.cancel();
                    // Optionally remove the job reference from the array
                    const index = scheduledJobsArray.indexOf(job);
                    if (index !== -1) {
                        scheduledJobsArray.splice(index, 1);
                    }
                });
                console.log('end shcedule.......................', new Date());
            });
        }
    })
}
async function call_phonebook(req, res, next) {
    try {
        var currentDate = new Date();
        var decreasedTime = currentDate.getTime();
        var createdAtDate = new Date(decreasedTime);
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        if (isAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = 0;
        } else if (isSubAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = req.body.id_department;
        } else if (isDept == 1) {
            var id_user = req.token.id_user;
            var id_department = req.token.id;
        }
        var phonebook_id = req.body.phonebook_id;
        var collectionId = req.body.collectionId;
        var method = req.body.method;
        var api_url = req.body.api_url;
        var response_name = req.body.response_name;
        var phone_field_name = req.body.phone_field_name;
        var name_field = req.body.name_field;
        var duplicate_check = req.body.duplicateCheck;
        var key = 'MKDK73JKSA69G2Y3'
        const axiosConfig = {
            method: method,
            url: api_url
        };
        axios(axiosConfig).then(async function (response) {
            console.log("successfull response..............................")
            var responseData = response.data[response_name]
            if (responseData != undefined && responseData != null && responseData) {
                var templateInsert = Object.keys(responseData[0]);
                var phonebookTemplateData = {}
                templateInsert.map(key => {
                    phonebookTemplateData[key] = '';
                });
                var insertTemplates = await phonebook_templatesModel.findOneAndUpdate({ collectionId: new ObjectId(collectionId) }, { $set: phonebookTemplateData });
                var template_id = insertTemplates._id;
                if (duplicate_check == 1) {
                    function removeDuplicates(data) {
                        const phoneNumbers = new Set();
                        const filteredData = data.filter(entry => {
                            const phoneNumber = entry[phone_field_name];
                            if (!phoneNumbers.has(phoneNumber)) {
                                phoneNumbers.add(phoneNumber);
                                return true;
                            }
                            return false;
                        });
                        return filteredData;
                    }
                    responseData = removeDuplicates(responseData);
                    responseData = responseData.filter(item => item[phone_field_name] !== null && item[phone_field_name] !== '');
                    var phnNumber = [];
                    var phnNo = Promise.all(
                        responseData.map(async (data) => {
                            var phnNo = data[phone_field_name];
                            if (phnNo != null || phnNo != undefined || phnNo) {
                                var phone_number = await encrypteAes128(phnNo, key);
                                if (phone_number)
                                    phnNumber.push(phone_number)
                            }
                        })
                    )
                    var phn_no = await phnNo;
                    var existChecking = await phonebook_contactsModel.find({ $and: [{ phone_number: { $in: phnNumber } }, { id_user: id_user }, { id_department: id_department }, { phonebook_id: phonebook_id }] })
                    if (existChecking.length != 0) {
                        var existing_phnNumber = Promise.all(
                            responseData.map(async (phn) => {
                                var phnNo = phn[phone_field_name];
                                phn.name = phn[name_field]
                                if (phnNo != null && phnNo != undefined && phnNo) {
                                    var phone_number = await encrypteAes128(phnNo, key);
                                    if (phone_number)
                                        phn.phone_number = phone_number;
                                }
                                if (phn.email != null || phn.email != undefined || phn.email) {
                                    var emailRes = await decryptAes128(phn.email, key);
                                    if (emailRes)
                                        phn.email = emailRes
                                }
                                var index = existChecking.findIndex(item =>
                                    item._doc.phone_number === phone_number);
                                if (index == -1) {
                                    return phn;
                                }

                            })
                        )
                        var phnNumber_output = await existing_phnNumber;
                        const filteredArray = phnNumber_output.filter(obj => obj !== undefined && obj !== null);
                        var map_result = Promise.all(
                            filteredArray.map(async (data) => {
                                data.id_user = id_user;
                                data.id_department = id_department;
                                data.template_id = template_id;
                                data.phonebook_id = phonebook_id
                                data.collectionId = collectionId;
                                data.createdAt = createdAtDate;
                                return data;
                            })
                        )
                        var output = await map_result;
                    } else {
                        var map_result = Promise.all(
                            responseData.map(async (data) => {
                                data.id_user = id_user;
                                data.id_department = id_department;
                                data.template_id = template_id;
                                data.phonebook_id = phonebook_id
                                data.collectionId = collectionId;
                                data.createdAt = createdAtDate;
                                var phn = data[phone_field_name]
                                if (phn != null || phn != undefined || phn) {
                                    var phone_number = await encrypteAes128(phn, key);
                                    if (phone_number)
                                        data.phone_number = phone_number;
                                }
                                if (data.email != null || data.email != undefined || data.email) {
                                    var emailRes = await decryptAes128(data.email, key);
                                    if (emailRes)
                                        data.email = emailRes
                                }
                                data.name = data[name_field]
                                return data;
                            })
                        )
                        var output = await map_result;
                    }
                } else {
                    responseData = responseData.filter(item => item[phone_field_name] !== '');
                    var map_result = Promise.all(
                        responseData.map(async (data) => {
                            data.id_user = id_user;
                            data.id_department = id_department;
                            data.template_id = template_id;
                            data.phonebook_id = phonebook_id
                            data.collectionId = collectionId;
                            data.createdAt = createdAtDate;
                            var phn = data[phone_field_name]
                            if (phn != null || phn != undefined || phn) {
                                var phone_number = await encrypteAes128(phn, key);
                                if (phone_number) {
                                    data.phone_number = phone_number;
                                }
                                // else{
                                //     data.phone_number = data[phone_field_name];
                                // }
                            }
                            if (data.email != null || data.email != undefined || data.email) {
                                var emailRes = await decryptAes128(data.email, key);
                                if (emailRes)
                                    data.email = emailRes
                            }
                            data.name = data[name_field]
                            return data;
                        })
                    )
                    var output = await map_result;
                }
                console.log("insert array ---------------->", output);
                output = output.filter(obj => obj[phone_field_name] !== null);
                if (output.length != 0) {
                    var insertManyresult = await phonebook_contactsModel.insertMany(output);
                    console.log(output.length)
                    const result = await phonebookModel.updateOne({ _id: phonebook_id }, { $inc: { contact_count: output.length } });
                    var updateSql = `UPDATE phonebook SET contact_count = contact_count + '${output.length}' WHERE id = '${phonebook_id}'`;
                    var [update] = await sequelize.query(updateSql);
                    var campaign = `SELECT campaign_id FROM cc_campaign_phonebook WHERE phonebook_id = '${phonebook_id}'`;
                    var [campaignRes] = await getConnection.query(campaign);
                    if (campaignRes.length != 0) {
                        var campaign_id = []
                        campaignRes.map((data) => {
                            campaign_id.push(data.campaign_id);
                        });
                        var updateSql1 = `UPDATE cc_campaign SET total_contacts = total_contacts + '${output.length}' WHERE id In (${campaign_id})`;
                        var [update1] = await sequelize.query(updateSql1)
                    }
                    res.locals.result = "success";
                    next()
                } else {
                    res.locals.result = "phonenumber exist";
                    next()
                }
            } else {
                res.locals.result = "err";
                next()
            }
        }).catch(function (error) {
            console.log(error);
            res.locals.result = 'err';
            next()
        });
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function get_phnbook_templates_by_phonebookId(req, res, next) {
    try {
        var phnbookId = req.query.phonebookId;
        var result = await phonebook_templatesModel.find({ phonebook_id: phnbookId });
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_phnbook_templates_by_collectionId(req, res, next) {
    try {
        var collectionId = req.query.collectionId;
        var result = await phonebook_templatesModel.find({ collectionId: new ObjectId(collectionId) });
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function add_campaign(req, res, next) {
    try {
        var data = req.body;
        var campaign = {
            type: data.type,
            name: data.name,
            description: data.description,
            application_file: data.application_file,
            application: data.application,
            audio: data.audio,
            route: data.route,
            frequency: data.frequency,
            retry: data.retry,
            retry_options: data.retry_options,
            call_duration: data.call_duration,
            running_days: data.running_days,
            gobal_duplicate_check: data.gobal_duplicate_check,
            dail_type: data.dail_type,
            force_call_recording: data.force_call_recording,
            campaign_callerid: data.campaign_callerid,
            template: data.template
        }
        if (data.audiofile != undefined) {
            campaign.moh = data.audiofile;
        }
        if (data.caller_id != undefined) {
            var callerId = data.caller_id.split("_");
            campaign.caller_id = callerId[0];
            campaign.caller_id_number = callerId[1];
        }
        if (data.did != undefined) {
            var callerId = data.did.split("_");
            campaign.caller_id = callerId[0];
            campaign.caller_id_number = callerId[1];
        }
        if (data.retry_call_sec != undefined) {
            campaign.retry_call_sec = data.retry_call_sec;
        }
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        if (isAdmin == 1) {
            campaign.id_user = id_user;
        } else if (isSubAdmin == 1) {
            campaign.id_user = id_user;
            campaign.id_department = req.body.id_dept;
        } else if (isDept == 1) {
            campaign.id_user = id_user;
            campaign.id_department = req.token.id;
        }
        if (data.campaignTime != undefined) {
            if (data.campaignTime[0]) {
                campaign.work_time_start = data.campaignTime[0].hours + ":" + data.campaignTime[0].mins + " " + data.campaignTime[0].AMorPM;
            }
            if (data.campaignTime[1]) {
                campaign.work_time_end = data.campaignTime[1].hours + ":" + data.campaignTime[1].mins + " " + data.campaignTime[1].AMorPM;
            }
            if (data.campaignTime[2]) {
                if (data.campaignTime[2].AMorPM == 'PM' && data.campaignTime[2].hours != 12) {
                    var hours = data.campaignTime[2].hours + 12;
                } else if (data.campaignTime[2].AMorPM == 'AM' && data.campaignTime[2].hours == 12) {
                    var hours = data.campaignTime[2].hours - 12;
                } else {
                    var hours = data.campaignTime[2].hours;
                }
                campaign.schedule_start = data.schedule_start + " " + hours + ":" + data.campaignTime[2].mins;
            }
            if (data.campaignTime[3]) {
                if (data.campaignTime[3].AMorPM == 'PM' && data.campaignTime[3].hours != 12) {
                    var hours = data.campaignTime[3].hours + 12;
                } else if (data.campaignTime[3].AMorPM == 'AM' && data.campaignTime[3].hours == 12) {
                    var hours = data.campaignTime[3].hours - 12;
                } else {
                    var hours = data.campaignTime[3].hours;
                }
                campaign.schedule_end = data.schedule_end + " " + hours + ":" + data.campaignTime[3].mins;
            }
        }
        var existCheckingSql = `SELECT * FROM cc_campaign WHERE name = '${campaign.name}' AND id_user = '${campaign.id_user}' `
        // if (isSubAdmin == 1) {
        //     existCheckingSql += `AND id_department in(${req.body.id_dept}) `
        // } else if(isDept == 1) {
        //     existCheckingSql += `AND id_department = '${campaign.id_department}' `
        // }
        var [existChecking] = await getConnection.query(existCheckingSql);
        if (existChecking.length != 0) {
            res.locals.result = "exist";
            next()
            return
        } else {
            var addcampaign = await campaignModel.create(campaign);
            var campaignId = addcampaign.id;
            if (data.agents != undefined && data.agents.length != 0) {
                var agent = []
                var agent_id = []
                data.agents.map((data) => {
                    var array = data.split("_");
                    agent.push({ "value": array[0] });
                    agent_id.push(array[0])
                });
                var agentsql = `SELECT user.id,user_settings.did FROM user JOIN user_settings ON user.id = user_settings.user_id WHERE user.id in(${agent_id}) `;
                var [agentResult] = await getConnection.query(agentsql);
                var arrayOfObjectsAgent = data.agents.map((value) => ({ value }))
                var agent_map_result = agent.map(async (ele) => {
                    return new Promise(async (resolve) => {
                        ele.user_id = ele.value;
                        ele.id_campaign = addcampaign.id;
                        ele.dail_type = campaign.dail_type;
                        agentResult.map(async (agentData) => {
                            if (ele.value == agentData.id) {
                                ele.caller_id = agentData.did;
                            }
                        })
                        resolve(ele);
                    })
                })
                var agentOutput = await agent_map_result;
                Promise.all(agent_map_result.flat())
                    .then(async (results) => {
                        var addAgentCampaign = await agentCampaignModel.bulkCreate(results);
                    })
                    .catch(error => {
                        console.error(error);
                        res.locals.result = "err";
                        next()
                    });
            }
            if (data.phonebook_id != undefined) {
                var phnbook = []
                data.phonebook_id.map((data) => {
                    var array = data.split("_");
                    phnbook.push({ "value": array[0] });
                });
                var arrayOfObjectsPhonebook = data.phonebook_id.map((value) => ({ value }))
                var map_result = Promise.all(
                    phnbook.map(async (ele) => {
                        ele.phonebook_id = ele.value;
                        ele.campaign_id = addcampaign.id;
                        return ele;
                    })
                )
                var output = await map_result;
                var addPhonebookCampaign = await phonebookCampaignModel.bulkCreate(output);
                var phnbookId = []
                data.phonebook_id.map((data) => {
                    var array = data.split("_");
                    phnbookId.push(array[0]);
                });
                var count = await phonebook_contactsModel.count({ phonebook_id: { $in: phnbookId } });
                var updateSql = `UPDATE cc_campaign SET total_contacts = '${count}' WHERE id = '${addcampaign.id}'`
                var [updateRes] = await sequelize.query(updateSql);
            }
            if (data.callcenterSettings != undefined) {
                var settings = {
                    campaign_id: campaignId,
                    id_department: id_department,
                    hang_up_on_submit: data.callcenterSettings.hang_up_on_submit,
                    phn_number_mask: data.callcenterSettings.phn_number_mask,
                    remarks_skip: data.callcenterSettings.remarks_skip,
                    retry_skip: data.callcenterSettings.retry_skip
                }
                var campaignSetting = await campaignSettingsModel.create(settings);
            }
            // var settings = {
            //     campaign_id:campaignId,
            //     id_department:id_department,
            //     api_integration : data.api_integration,
            // }
            // var campaignSetting = await campaignSettingsModel.create(settings);
            if (data.broadcastSettings != undefined) {
                var integration = await broadcastIntegration(campaignId, data.broadcastSettings)
            }
            var campaignShedule = get_schedule(req.headers.token)
            res.locals.result = addcampaign;
        }
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function update_campaign(req, res, next) {
    try {
        var id = req.query.id;
        var data = req.body;
        var campaign = {
            type: data.type,
            name: data.name,
            description: data.description,
            application_file: data.application_file,
            application: data.application,
            audio: data.audio,
            route: data.route,
            frequency: data.frequency,
            retry: data.retry,
            retry_options: data.retry_options,
            call_duration: data.call_duration,
            running_days: data.running_days,
            gobal_duplicate_check: data.gobal_duplicate_check,
            force_call_recording: data.force_call_recording,
            campaign_callerid: data.campaign_callerid,
            template: data.template
        }
        if (data.audiofile != undefined) {
            campaign.moh = data.audiofile;
        }
        if (data.campaign_callerid == 0) {
            campaign.caller_id = 0;
            campaign.caller_id_number = null;
        }
        if (data.caller_id != undefined) {
            var callerId = data.caller_id.split("_");
            campaign.caller_id = callerId[0];
            campaign.caller_id_number = callerId[1];
        }
        if (data.did != undefined) {
            var callerId = data.did.split("_");
            campaign.caller_id = callerId[0];
            campaign.caller_id_number = callerId[1];
        }
        if (data.dail_type != undefined) {
            campaign.dail_type = data.dail_type
        }
        if (data.retry_options == 20) {
            if (data.retry_call_sec != undefined) {
                campaign.retry_call_sec = data.retry_call_sec;
            }
        } else {
            campaign.retry_call_sec = 0
        }
        var id_user = req.token.id_user;
        var user_id = req.token.user_id;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        if (isAdmin == 1) {
            campaign.id_user = id_user;
        } else if (isSubAdmin == 1) {
            campaign.id_user = id_user;
            campaign.id_department = req.body.id_dept;
        } else if (isDept == 1) {
            campaign.id_user = user_id;
            campaign.id_department = req.token.id;
        }
        if (data.campaignTime != undefined) {
            if (data.campaignTime[0]) {
                campaign.work_time_start = data.campaignTime[0].hours + ":" + data.campaignTime[0].mins + " " + data.campaignTime[0].AMorPM;
            }
            if (data.campaignTime[1]) {
                campaign.work_time_end = data.campaignTime[1].hours + ":" + data.campaignTime[1].mins + " " + data.campaignTime[1].AMorPM;
            }
            if (data.campaignTime[2]) {
                if (data.campaignTime[2].AMorPM == 'PM' && data.campaignTime[2].hours != 12) {
                    var hours = data.campaignTime[2].hours + 12;
                } else if (data.campaignTime[2].AMorPM == 'AM' && data.campaignTime[2].hours == 12) {
                    var hours = data.campaignTime[2].hours - 12;
                } else {
                    var hours = data.campaignTime[2].hours;
                }
                campaign.schedule_start = data.schedule_start + " " + hours + ":" + data.campaignTime[2].mins;
            }
            if (data.campaignTime[3]) {
                if (data.campaignTime[3].AMorPM == 'PM' && data.campaignTime[3].hours != 12) {
                    var hours = data.campaignTime[3].hours + 12;
                } else if (data.campaignTime[3].AMorPM == 'AM' && data.campaignTime[3].hours == 12) {
                    var hours = data.campaignTime[3].hours - 12;
                } else {
                    var hours = data.campaignTime[3].hours;
                }
                campaign.schedule_end = data.schedule_end + " " + hours + ":" + data.campaignTime[3].mins;
            }
        }
        var existCheckingSql = `SELECT * FROM cc_campaign WHERE name = '${campaign.name}' AND id_user = '${campaign.id_user}' AND id != '${id}'`
        var [existChecking] = await getConnection.query(existCheckingSql);
        if (existChecking.length != 0) {
            res.locals.result = "exist";
            next()
            return
        } else {
            // if (data.dnd_phonebook != undefined) {
            //     var dndPhonebookArr = []
            //     data.dnd_phonebook.map((data) => {
            //         var dndPhonebook = data.split("_");
            //         dndPhonebookArr.push({ "value": dndPhonebook[0] });
            //     })
            //     var dndCampaign = await dndphonebookModel.destroy({ where: { campaign_id: id } });
            //     var dnd_map_result = Promise.all(
            //         dndPhonebookArr.map(async (ele) => {
            //             ele.dnd_id = ele.value;
            //             ele.campaign_id = id;
            //             return ele;
            //         })
            //     )
            //     var dndOutput = await dnd_map_result;
            //     var addDndCampaign = await dndphonebookModel.bulkCreate(dndOutput);
            // }
            if (data.agents != undefined && data.agents.length != 0) {
                var agent = []
                var agent_id = []
                data.agents.map((data) => {
                    var array = data.split("_");
                    agent.push({ "value": array[0] });
                    agent_id.push(array[0])
                });
                var agentsql = `SELECT user.id,user_settings.did FROM user JOIN user_settings ON user.id = user_settings.user_id WHERE user.id in(${agent_id}) `;
                var [agentResult] = await getConnection.query(agentsql);
                var agentCampaign = await agentCampaignModel.destroy({ where: { id_campaign: id } });
                var agent_map_result = Promise.all(
                    agent.map(async (ele) => {
                        ele.user_id = ele.value;
                        ele.id_campaign = id;
                        ele.dail_type = data.dial_type;
                        agentResult.map(async (agentData) => {
                            if (ele.value == agentData.id) {
                                ele.caller_id = agentData.did;
                            }
                        })
                        return ele;
                    })
                )
                var agentOutput = await agent_map_result;
                var addAgentCampaign = await agentCampaignModel.bulkCreate(agentOutput);
            }
            if (data.phonebook_id != undefined) {
                var phnbook = [];
                data.phonebook_id.map((data) => {
                    var array = data.split("_");
                    phnbook.push({ "value": array[0] });
                })
                var phonebookCampaign = await phonebookCampaignModel.destroy({ where: { campaign_id: id } });
                var arrayOfObjectsPhonebook = data.phonebook_id.map((value) => ({ value }))
                var map_result = Promise.all(
                    phnbook.map(async (data) => {
                        data.phonebook_id = data.value;
                        data.campaign_id = id;
                        return data;
                    })
                )
                var output = await map_result;
                var addPhonebookCampaign = await phonebookCampaignModel.bulkCreate(output);
                var phnbookId = []
                data.phonebook_id.map((data) => {
                    var array = data.split("_");
                    phnbookId.push(array[0]);
                });
                var count = await phonebook_contactsModel.count({ phonebook_id: { $in: phnbookId } });
                campaign.total_contacts = count;
            }
            if (data.callcenterSettings != undefined) {
                var settings = {
                    hang_up_on_submit: data.callcenterSettings.hang_up_on_submit,
                    phn_number_mask: data.callcenterSettings.phn_number_mask,
                    remarks_skip: data.callcenterSettings.remarks_skip,
                    retry_skip: data.callcenterSettings.retry_skip
                }
                var campaignSetting = await campaignSettingsModel.update(settings, { where: { campaign_id: id } });
            }
            var settings = {
                api_integration: data.api_integration,
            }
            var campaignSetting = await campaignSettingsModel.update(settings, { where: { campaign_id: id } });
            if (data.api_integration == 0) {
                const result1 = await broadcastApiModel.deleteMany({ campaignId: id });
                const result2 = await broadcastApiModel.deleteMany({ campaignId: id });
                const result = await broadcastSmsModel.deleteMany({ campaignId: id });
            }
            if (data.broadcastSettings != undefined) {
                var integration = await broadcastIntegration(id, data.broadcastSettings)
            }
            if (data.replay != 1) {
                var result = await campaignModel.update(campaign, { where: { id: id } });
                // campaign.update = 1
                campaign.id = id;
                campaign.replay = data.replay;
                broadcastLogMessage("update campaign......." + new Date() + ",campaignId : " + id)
                broadcastLogMessage(campaign)
                if (req.body.status == 0) {
                    broadcastLogMessage("update not started campaign......." + id)
                    broadcastLogMessage("update not started campaign......." + new Date())
                    var campaignShedule = get_schedule(req.headers.token,campaign);
                }
                res.locals.result = result;
            } else {
                var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                var [transRes] = await getConnection.query(transSql);
                if (transRes.length != 0) {
                    //    var transCredit = Math.abs(transRes[0].trans_credit);
                    var transCredit = transRes[0].trans_credit;
                    if (transCredit <= 0) {
                        res.locals.result = "no balance";
                    } else {
                        var result = campaign;
                        campaign.id = id;
                        campaign.replay = data.replay;
                        if (data.replay == 1) {
                            broadcastLogMessage("campaign play......." + id)
                            broadcastLogMessage("campaign play time......." + new Date())
                            var campaignShedule = get_schedule(req.headers.token,campaign);
                        }
                        res.locals.result = result;
                    }
                }
            }
        }
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_all_campaign(req, res, next) {
    try {
        var limit = Number(req.query.count);
        var skip = req.query.page;
        skip = (skip - 1) * limit;
        var id_user = req.token.id_user;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var id_department = req.token.id_department;
        var name = req.query.name;
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var department_id = req.query.department_id
        var campaign = `select cc_campaign.id,cc_campaign.id_department,IF(schedule_start != 0, schedule_start, cc_campaign.createdAt) as date,cc_campaign.name,dail_type,caller_id_number,cc_campaign.status,type,cc_campaign.work_time_start,cc_campaign.work_time_end,cc_campaign.schedule_start,cc_campaign.schedule_end,GROUP_CONCAT(DISTINCT cc_campaign_phonebook.phonebook_id) phonebookId,total_contacts,departments.name as department from cc_campaign LEFT JOIN cc_campaign_phonebook ON cc_campaign.id = cc_campaign_phonebook.campaign_id LEFT JOIN departments ON cc_campaign.id_department = departments.id where cc_campaign.id_user = '${id_user}' `;
        var sqlCount = `select count(cc_campaign.id) as total from cc_campaign LEFT JOIN cc_campaign_phonebook ON cc_campaign.id = cc_campaign_phonebook.campaign_id LEFT JOIN departments ON cc_campaign.id_department = departments.id where cc_campaign.id_user = '${id_user}' `;
        if (isSubAdmin == 1) {
            campaign += `and cc_campaign.id_department in (${id_department}) `;
            sqlCount += `and cc_campaign.id_department in (${id_department}) `;
        } else if (isDept == 1) {
            campaign += `and cc_campaign.id_department = '${req.token.id}' `;
            sqlCount += `and cc_campaign.id_department = '${req.token.id}' `;
        }
        if (fromDate != undefined && toDate != undefined) {
            var Start = `${fromDate} 00:00:00`;
            var End = `${toDate} 23:59:59`;
            campaign += `and cc_campaign.createdAt between '${Start}' and '${End}' `;
            sqlCount += `and  cc_campaign.createdAt between '${Start}' and '${End}' `;
        }
        if (name != undefined) {
            campaign += `and cc_campaign.name like '%${name}%' `;
            sqlCount += `and cc_campaign.name like '%${name}%' `;
        }
        if (department_id != undefined) {
            campaign += `AND cc_campaign.id_department LIKE "%${department_id}%" `;
            sqlCount += `AND cc_campaign.id_department LIKE "%${department_id}%" `;
        }
        campaign += `GROUP BY cc_campaign.id order by cc_campaign.id desc limit ${skip},${limit}`;
        sqlCount += `GROUP BY cc_campaign.id order by cc_campaign.id desc`;
        var [campaignRes] = await rackServer.query(campaign);
        var [count] = await rackServer.query(sqlCount);
        let query = { id_user };

        if (isSubAdmin === 1) {
            query.id_department = { $in: id_department.split(',').map(Number) };
        } else if (isDept === 1) {
            query.id_department = req.token.id;
        }
        const phnBkSql = await phonebookModel.find(query);
        var map_result = Promise.all(
            campaignRes.map(async (data) => {
                if (data.type == 2) {
                    data.broadcast = {}
                    var start = new Date(data.schedule_start);
                    var sdd = start.getDate();
                    var smm = start.getMonth() + 1;
                    var syyyy = start.getFullYear();
                    var shours = start.getHours();
                    var smin = start.getMinutes();
                    if (shours > 12) {
                        shours = shours - 12
                        var startDate = `${syyyy}-${smm}-${sdd}`;
                        var startDateTime = `${shours}:${smin} PM`;
                    } else if (shours == 12) {
                        var startDate = `${syyyy}-${smm}-${sdd}`;
                        var startDateTime = `${shours}:${smin} PM`;
                    } else if (shours == 0) {
                        shours = shours + 12
                        var startDate = `${syyyy}-${smm}-${sdd} `;
                        var startDateTime = `${shours}:${smin} AM`;
                    } else {
                        var startDate = `${syyyy}-${smm}-${sdd} `;
                        var startDateTime = `${shours}:${smin} AM`;
                    }
                    data.schedule_start = startDate
                    var end = new Date(data.schedule_end);
                    var edd = end.getDate();
                    var emm = end.getMonth() + 1;
                    var eyyyy = end.getFullYear();
                    var ehours = end.getHours();
                    var emin = end.getMinutes();
                    if (ehours > 12) {
                        ehours = ehours - 12
                        var endDate = `${eyyyy}-${emm}-${edd}`;
                        var endDateTime = `${ehours}:${emin} PM `;
                    } else if (ehours == 12) {
                        var endDate = `${eyyyy}-${emm}-${edd}`;
                        var endDateTime = `${ehours}:${emin} PM `;
                    } else if (ehours == 0) {
                        ehours = ehours + 12
                        var endDate = `${eyyyy}-${emm}-${edd}`;
                        var endDateTime = `${ehours}:${emin} AM`;
                    } else {
                        var endDate = `${eyyyy}-${emm}-${edd}`;
                        var endDateTime = `${ehours}:${emin} AM`;
                    }
                    data.schedule_end = endDate;
                    var work_time_start = data.work_time_start;
                    var work_time_end = data.work_time_end;
                    data.broadcast.campaignTime = [{ work_time_start }, { work_time_end }, { startDateTime }, { endDateTime }]
                    data.broadcast.schedule_end = data.schedule_end
                    delete data.work_time_end
                    delete data.work_time_start
                    delete data.schedule_start
                    delete data.schedule_end
                } else {
                    delete data.work_time_end
                    delete data.work_time_start
                    delete data.schedule_start
                    delete data.schedule_end
                }
                var phonebook_name = ''
                if (phnBkSql.length !== 0) {
                    if(data.phonebookId && data.phonebookId != undefined){
                        const phnbook_Id = data.phonebookId.split(',');
                        if (phnbook_Id.length !== 0) {
                            phnBkSql.map((phnbook) => {
                                const idString = phnbook._id.toString();
                                phnbook_Id.map((phnbookRes) => {
                                    if (phnbookRes === idString) {
                                        phonebook_name += phonebook_name ? `,${phnbook.pbname}` : phnbook.pbname; // Append names with commas
                                    }
                                });
                            });
                        }
                        data.phonebook = phonebook_name; // Assign the final concatenated names to data.phonebook
                    }
                }
                return data;
            })
        )
        var output = await map_result;
        res.locals.result = output;
        res.locals.count = count.length;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_all_campaign_by_agent(req, res, next) {
    try {
        var limit = Number(req.query.count);
        var skip = req.query.page;
        skip = (skip - 1) * limit;
        var id_user = req.token.id_user;
        var type = req.token.type;
        var name = req.query.name;
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var campaign = `select cc_campaign.id,IF(schedule_start != 0, schedule_start, cc_campaign.createdAt) as date,name,dail_type,caller_id_number,status,type,total_contacts from cc_campaign JOIN cc_user_campaign ON cc_campaign.id = cc_user_campaign.id_campaign where cc_user_campaign.user_id = '${req.token.id}' `;
        var sqlCount = `select count(cc_campaign.id) as total from cc_campaign JOIN cc_user_campaign ON cc_campaign.id = cc_user_campaign.id_campaign where cc_user_campaign.user_id = '${req.token.id}'  `;
        if (type == undefined) {
            campaign += `and cc_campaign.id_user = '${id_user}' `;
            sqlCount += `and cc_campaign.id_user = '${id_user}' `;
        }
        if (name != undefined) {
            campaign += `and name like '%${name}%' `;
            sqlCount += `and name like '%${name}%' `;
        }
        if (fromDate != undefined && toDate != undefined) {
            var Start = `${fromDate} 00:00:00`;
            var End = `${toDate} 23:59:59`;
            campaign += `and cc_campaign.createdAt BETWEEN '${Start}' AND '${End}' `;
            sqlCount += `and cc_campaign.createdAt BETWEEN '${Start}' AND '${End}' `;
        }
        campaign += `GROUP by cc_campaign.id order by cc_campaign.id desc limit ${skip},${limit}`;
        sqlCount += `GROUP by cc_campaign.id order by cc_campaign.id desc`;
        var [campaignRes] = await rackServer.query(campaign);
        var [count] = await rackServer.query(sqlCount);
        res.locals.result = campaignRes;
        res.locals.count = count.length;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_by_campaign_id(req, res, next) {
    try {
        var id = req.query.id;
        var sql = `select * from cc_campaign where id = '${id}'`;
        var [result] = await getConnection.query(sql);
        var settingsSql = `select * from campaign_settings where campaign_id = '${id}'`
        var [settingsRes] = await getConnection.query(settingsSql);
        var settings = {}
        var campaign = {
            application: result[0].application,
            application_file: result[0].application_file,
            audio: result[0].audio,
            audio_file: result[0].audio_file,
            call_duration: result[0].call_duration,
            campaign_callerid: result[0].campaign_callerid,
            dail_type: result[0].dail_type,
            description: result[0].description,
            createdAt: result[0].createdAt,
            force_call_recording: result[0].force_call_recording,
            frequency: result[0].frequency,
            gobal_duplicate_check: result[0].gobal_duplicate_check,
            id: result[0].id,
            id_department: result[0].id_department,
            id_user: result[0].id_user,
            name: result[0].name,
            retry: result[0].retry,
            retry_options: result[0].retry_options,
            route: result[0].route,
            running_days: result[0].running_days,
            status: result[0].status,
            template: result[0].template,
            total_contacts: result[0].total_contacts,
            type: result[0].type,
            updatedAt: result[0].updatedAt,
            audiofile: result[0].moh,
        }
        if (result[0].caller_id && result[0].caller_id_number != null) {
            var callerId = result[0].caller_id + "_" + result[0].caller_id_number;
            campaign.caller_id = callerId;
        }
        if (result[0].retry_options == 20) {
            campaign.retry_call_sec = result[0].retry_call_sec
        }
        if (result[0].type == 2) {
            var start = new Date(result[0].schedule_start);
            var sdd = start.getDate();
            var smm = start.getMonth() + 1;
            var syyyy = start.getFullYear();
            var shours = start.getHours();
            var smin = start.getMinutes();
            if (shours > 12) {
                shours = shours - 12
                var startDate = `${syyyy}-${smm}-${sdd}`;
                var startDateTime = `${shours}:${smin} PM`;
            } else if (shours == 12) {
                var startDate = `${syyyy}-${smm}-${sdd}`;
                var startDateTime = `${shours}:${smin} PM`;
            } else if (shours == 0) {
                shours = shours + 12
                var startDate = `${syyyy}-${smm}-${sdd} `;
                var startDateTime = `${shours}:${smin} AM`;
            } else {
                var startDate = `${syyyy}-${smm}-${sdd} `;
                var startDateTime = `${shours}:${smin} AM`;
            }
            campaign.schedule_start = startDate
            var end = new Date(result[0].schedule_end);
            var edd = end.getDate();
            var emm = end.getMonth() + 1;
            var eyyyy = end.getFullYear();
            var ehours = end.getHours();
            var emin = end.getMinutes();
            if (ehours > 12) {
                ehours = ehours - 12
                var endDate = `${eyyyy}-${emm}-${edd}`;
                var endDateTime = `${ehours}:${emin} PM `;
            } else if (ehours == 12) {
                var endDate = `${eyyyy}-${emm}-${edd}`;
                var endDateTime = `${ehours}:${emin} PM `;
            } else if (ehours == 0) {
                ehours = ehours + 12
                var endDate = `${eyyyy}-${emm}-${edd}`;
                var endDateTime = `${ehours}:${emin} AM`;
            } else {
                var endDate = `${eyyyy}-${emm}-${edd}`;
                var endDateTime = `${ehours}:${emin} AM`;
            }
            campaign.schedule_end = endDate;
            var work_time_start = result[0].work_time_start;
            var work_time_end = result[0].work_time_end;
            campaign.campaignTime = [{ work_time_start }, { work_time_end }, { startDateTime }, { endDateTime }]
        }
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        let query = { id_user: req.token.id_user };
        if (isAdmin === 1) {
            query.id_department = 0;
        } else if (isSubAdmin === 1) {
            var id_department = req.token.id_department.split(',').map(Number);
            query.id_department = { $in: id_department };
        } else if (isDept === 1) {
            query.id_department = req.token.id;
        }
        if (req.query.id_department != undefined) {
            query.id_department = req.query.id_department
        }
        var phnBook = await phonebookModel.find(query)
        var agentCampaignSql = `SELECT user_id as id_agent,CONCAT(user.first_name, ' ', user.last_name) AS name FROM cc_user_campaign LEFT JOIN user ON cc_user_campaign.user_id = user.id WHERE id_campaign = '${id}'`
        var [agentCampaign] = await getConnection.query(agentCampaignSql);
        var campaignAgent = [];
        agentCampaign.map(async (data) => {
            var agent = data.id_agent + "_" + data.name;
            campaignAgent.push(agent)
        })
        var phonebookCampaignSql = `SELECT phonebook_id FROM cc_campaign_phonebook WHERE campaign_id ='${id}'`
        var [phonebookCampaign] = await getConnection.query(phonebookCampaignSql);

        var campaignPhonebook = [];
        phonebookCampaign.map(async (data) => {
            if (phnBook.length != 0) {
                phnBook.map(async (phnbook) => {
                    var phnbkId = phnbook._id.toString();
                    if (data.phonebook_id == phnbkId) {
                        var phnbook = phnbook.name;
                        var phnbook = data.phonebook_id + "_" + phnbook;
                        campaignPhonebook.push(phnbook)
                    }
                })
            }

        })
        // campaign.dnd_phonebook = campaignDnd;
        campaign.agents = campaignAgent;
        campaign.phonebook_id = campaignPhonebook;
        if (campaign.type == 1) {
            if (settingsRes.length != 0) {
                settings.hang_up_on_submit = settingsRes[0].hang_up_on_submit,
                    settings.phn_number_mask = settingsRes[0].phn_number_mask,
                    settings.remarks_skip = settingsRes[0].remarks_skip,
                    settings.retry_skip = settingsRes[0].retry_skip
            }
            campaign.callcenterSettings = settings;
        }
        if (campaign.type == 2) {
            if (settingsRes.length != 0) {
                campaign.api_integration = settingsRes[0].api_integration
            }
            var settings = await get_broadcast_integration(id)
            campaign.broadcastSettings = settings;
        }
        res.locals.result = campaign;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function delete_campaign(req, res, next) {
    try {
        var id = req.query.id;
        var campaignSql = `SELECT * FROM cc_campaign WHERE id ='${id}' `;
        var [campaign] = await getConnection.query(campaignSql);
        var agentSql = `SELECT user_id as id_agent FROM cc_user_campaign WHERE id_campaign = '${id}' and currentStatus In(1,2) `;
        var [agentRes] = await getConnection.query(agentSql);
        if (agentRes.length != 0) {
            var agent = [];
            agentRes.map(async data => {
                agent.push(data.id_agent)
                var agentId = Number(data.id_agent)
                var msg = 'deleteCampaign'
                var socket = await userSocket(agentId, msg, id);
            });
            var obj = {}
            var msg = 'adminCampaignLiveReport'
            var socket = await adminSocket(req.token.id_user, msg, obj);
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
            var campaignSummary = `UPDATE cc_campaign_call_summary SET agent_on_live = CASE WHEN (agent_on_live > 0) THEN agent_on_live - 1 ELSE 0 END WHERE  campaign_id = '${id}' and user_id IN (${agent}) AND DATE(createdAt) = '${date}'`;
            var [campaignSummaryRes] = await sequelize.query(campaignSummary);
        }
        var phonebookCampaign = await phonebookCampaignModel.destroy({ where: { campaign_id: id } });
        var dndCampaign = await dndphonebookModel.destroy({ where: { campaign_id: id } });
        var agentCampaign = await agentCampaignModel.destroy({ where: { id_campaign: id } });
        var Campaignsummary = await campaignCallSummaryModel.destroy({ where: { campaign_id: id } });
        var campaignSetting = await campaignSettingsModel.destroy({ where: { campaign_id: id } });
        var campaignwhatsapp = await jwtModel.deleteMany({ campaign_id: id });
        const camapignSms = await broadcastSmsModel.deleteMany({ campaignId: id });
        const camapignWhatsapp = await broadcastWhatsappModel.deleteMany({ campaignId: id });
        const camapignApi = await broadcastApiModel.deleteMany({ campaignId: id });
        // axios.get(process.env.CURRENTIP + 'deleteCampaign', {
        //     params: {
        //         campaignId: id
        //     }
        // }
        // ).then(async function (response) {

        // }).catch(function (error) {
        //     console.log(error);
        // });
        var phonebook = await campaignModel.destroy({ where: { id: id } });
        if (campaign[0].type == 2) {
            var campaignShedule = get_schedule(req.headers.token,campaign[0]);
        }
        res.locals.result = phonebook;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_campaign_selectbox(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var campaign = `select id,name from cc_campaign where id_user = '${id_user}' `;
        if (isSubAdmin == 1) {
            campaign += `AND id_department in (${id_department})`;
        } else if (isDept == 1) {
            campaign += `AND id_department = '${req.token.id}'`;
        }
        var [campaignRes] = await getConnection.query(campaign);
        res.locals.result = campaignRes;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_campaign_selectbox_by_agent(req, res, next) {
    try {
        var agent_id = req.token.id;
        var campaign = `SELECT cc_campaign.id,cc_campaign.name FROM cc_user_campaign JOIN cc_campaign ON cc_user_campaign.id_campaign = cc_campaign.id WHERE user_id = '${agent_id}'`;
        var [campaignRes] = await getConnection.query(campaign);
        res.locals.result = campaignRes;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_campaign_contacts(req, res, next) {
    try {
        var id = req.query.id;
        var campaignSql = `select * from cc_campaign where id = '${id}'`;
        var [campaignRes] = await getConnection.query(campaignSql);
        var phonebook = `select phonebook_id from cc_campaign_phonebook where campaign_id = '${id}'`;
        var [phonebookRes] = await getConnection.query(phonebook);
        if (phonebookRes.length != 0) {
            var phonebookId = [];
            phonebookRes.map(async (data) => {
                phonebookId.push(data.phonebook_id)
            })
            var totalContacts = await phonebook_contactsModel.count({ phonebook_id: { $in: phonebookId } })
        } else {
            var totalContacts = 0;
        }
        var agentsql = `select count(id) as agentCount from cc_user_campaign where id_campaign = '${id}'`;
        var [agentRes] = await getConnection.query(agentsql);
        const currentDate = new Date();
        var current_dd = currentDate.getDate();
        var current_mm = currentDate.getMonth() + 1
        var current_yyyy = currentDate.getFullYear();
        var current_hours = currentDate.getHours();
        var current_min = currentDate.getMinutes();
        var current_sec = currentDate.getSeconds();
        const fifteenMinutesAgo = new Date(currentDate.getTime() - 15 * 60 * 1000);
        var hours = fifteenMinutesAgo.getHours();
        var min = fifteenMinutesAgo.getMinutes();
        var sec = fifteenMinutesAgo.getSeconds();
        var Start = `${current_yyyy}-${current_mm}-${current_dd} ${hours}:${min}:${sec}`;
        var End = `${current_yyyy}-${current_mm}-${current_dd} ${current_hours}:${current_min}:${current_sec}`;
        var liveCallCountSql = `SELECT count(id) as total FROM cc_livecalls WHERE id_campaign = ${id} and is_live = 0 and createdAt BETWEEN '${Start}' AND '${End}' order by id desc `;
        var [livecallRes] = await sequelize.query(liveCallCountSql);
        if (livecallRes.length != 0) {
            var live_calls = livecallRes[0].total;
        }else{
            var live_calls = 0
        }
        var campaignSummaryCount = `SELECT SUM(agent_on_live) as agent_on_live,SUM(ACW) as ACW,SUM(call_delay) as call_delay,SUM(connected_duration) as total_duration,SUM(connected_count) as connected_count,SUM(notconnected_count) as notconnected_count,SUM(attempted_contact) as attempted_contact,sum(busy) as busy,sum(cancel) as cancel,sum(retry) as retry,sum(hold_time) as hold_time FROM cc_campaign_call_summary WHERE campaign_id = '${id}' GROUP BY campaign_id`;
        var [campaignSummaryRes] = await getConnection.query(campaignSummaryCount);
        if (campaignSummaryRes.length != 0) {
            function calculatePercentage(partialValue, totalValue) {
                return (partialValue / totalValue) * 100;
            }
            function roundToOneDecimal(value) {
                const rounded = Math.round(value * 10) / 10;
                return rounded % 1 === 0 ? Math.floor(rounded) : rounded;
            }
            var attempted_contact = Number(campaignSummaryRes[0].attempted_contact);
            var connected_count = Number(campaignSummaryRes[0].connected_count);
            var notconnected_count = Number(campaignSummaryRes[0].notconnected_count);
            var cancel = Number(campaignSummaryRes[0].cancel);
            var busy = Number(campaignSummaryRes[0].busy);
            var total_notconnected_count = notconnected_count + cancel + busy
            var retry = Number(campaignSummaryRes[0].retry);
            var acw = Math.abs(Number(campaignSummaryRes[0].ACW));
            var hold_time = Math.abs(Number(campaignSummaryRes[0].hold_time));
            var call_delay = Math.abs(Number(campaignSummaryRes[0].call_delay));
            var total_duration = Number(campaignSummaryRes[0].total_duration);

            var ansPercent = calculatePercentage(connected_count, attempted_contact);
            var ansPercentValue = roundToOneDecimal(ansPercent);
            var notAnsPercent = calculatePercentage(total_notconnected_count, attempted_contact);
            var notAnsPercentValue = roundToOneDecimal(notAnsPercent);
            var contactAttemptsForGraph = attempted_contact - retry;
            var progressBarPer = calculatePercentage(contactAttemptsForGraph, totalContacts);

            var averageACW = parseFloat(acw) / parseFloat(connected_count);
            averageACW = averageACW.toFixed(2);
            var ACD = parseFloat(total_duration) / parseFloat(connected_count);
            ACD = ACD.toFixed(2);
            var averageHoldTime = parseFloat(hold_time) / parseFloat(connected_count);
            averageHoldTime = averageHoldTime.toFixed(2)
            var averageCallDelay = parseFloat(call_delay) / parseFloat(attempted_contact);
            averageCallDelay = averageCallDelay.toFixed(2)
            var callHandlingTime = total_duration + acw + hold_time;
            var averageCallHandlingTime = parseFloat(callHandlingTime) / parseFloat(attempted_contact);
            averageCallHandlingTime = averageCallHandlingTime.toFixed(2)

            var campaign = {
                name: campaignRes[0].name,
                status: campaignRes[0].status,
                totalContacts: totalContacts,
                liveCalls: live_calls,
                contactAttempts: attempted_contact,
                contactAttemptsForGraph: contactAttemptsForGraph,
                ansCalls: connected_count,
                ansPercent: ansPercentValue,
                notAnsCalls: total_notconnected_count,
                notAnsPercent: notAnsPercentValue,
                totalDuration: total_duration,
                ACWTime: acw,
                holdTime: hold_time,
                callDelay: call_delay,
                callHandlingTime: callHandlingTime,
                ACD: Number(ACD),
                averageACW: Number(averageACW),
                averageHoldTime: Number(averageHoldTime),
                averageCallDelay: Number(averageCallDelay),
                averageCallHandlingTime: Number(averageCallHandlingTime),
                retry_count: retry,
                agentCount: agentRes[0].agentCount,
                agentsOnLiveCount: campaignSummaryRes[0].agent_on_live
            }
            var progressBar = {
                progressBar: progressBarPer
            }
            var broadcast = campaignRes[0]
            var campaignDetails = {
                application: campaignRes[0].application,
                application_file: campaignRes[0].application_file,
                audio: campaignRes[0].audio,
                audio_file: campaignRes[0].audio_file,
                call_duration: campaignRes[0].call_duration,
                campaign_callerid: campaignRes[0].campaign_callerid,
                description: campaignRes[0].description,
                createdAt: campaignRes[0].createdAt,
                force_call_recording: campaignRes[0].force_call_recording,
                frequency: campaignRes[0].frequency,
                gobal_duplicate_check: campaignRes[0].gobal_duplicate_check,
                id: campaignRes[0].id,
                id_department: campaignRes[0].id_department,
                id_user: campaignRes[0].id_user,
                name: campaignRes[0].name,
                retry: campaignRes[0].retry,
                retry_options: campaignRes[0].retry_options,
                route: campaignRes[0].route,
                running_days: campaignRes[0].running_days,
                status: campaignRes[0].status,
                template: campaignRes[0].template,
                total_contacts: campaignRes[0].total_contacts,
                type: campaignRes[0].type,
                updatedAt: campaignRes[0].updatedAt,
                audiofile: campaignRes[0].moh,
            }
            if (campaignRes[0].caller_id && campaignRes[0].caller_id_number != null) {
                var callerId = campaignRes[0].caller_id + "_" + campaignRes[0].caller_id_number;
                campaignDetails.caller_id = callerId;
            }
            if (campaignRes[0].retry_options == 20) {
                campaignDetails.retry_call_sec = campaignRes[0].retry_call_sec
            }
            if (campaignRes[0].type == 2) {
                var start = new Date(campaignRes[0].schedule_start);
                var sdd = start.getDate();
                var smm = start.getMonth() + 1;
                var syyyy = start.getFullYear();
                var shours = start.getHours();
                var smin = start.getMinutes();
                if (shours > 12) {
                    shours = shours - 12
                    var startDate = `${syyyy}-${smm}-${sdd}`;
                    var startDateTime = `${shours}:${smin} PM`;
                } else if (shours == 12) {
                    var startDate = `${syyyy}-${smm}-${sdd}`;
                    var startDateTime = `${shours}:${smin} PM`;
                } else if (shours == 0) {
                    shours = shours + 12
                    var startDate = `${syyyy}-${smm}-${sdd} `;
                    var startDateTime = `${shours}:${smin} AM`;
                } else {
                    var startDate = `${syyyy}-${smm}-${sdd} `;
                    var startDateTime = `${shours}:${smin} AM`;
                }
                campaignDetails.schedule_start = startDate
                var end = new Date(campaignRes[0].schedule_end);
                var edd = end.getDate();
                var emm = end.getMonth() + 1;
                var eyyyy = end.getFullYear();
                var ehours = end.getHours();
                var emin = end.getMinutes();
                if (ehours > 12) {
                    ehours = ehours - 12
                    var endDate = `${eyyyy}-${emm}-${edd}`;
                    var endDateTime = `${ehours}:${emin} PM `;
                } else if (ehours == 12) {
                    var endDate = `${eyyyy}-${emm}-${edd}`;
                    var endDateTime = `${ehours}:${emin} PM `;
                } else if (ehours == 0) {
                    ehours = ehours + 12
                    var endDate = `${eyyyy}-${emm}-${edd}`;
                    var endDateTime = `${ehours}:${emin} AM`;
                } else {
                    var endDate = `${eyyyy}-${emm}-${edd}`;
                    var endDateTime = `${ehours}:${emin} AM`;
                }
                campaignDetails.schedule_end = endDate;
                var work_time_start = campaignRes[0].work_time_start;
                var work_time_end = campaignRes[0].work_time_end;
                campaignDetails.campaignTime = [{ work_time_start }, { work_time_end }, { startDateTime }, { endDateTime }]
            }
            var result = [];
            result.push(campaign);
            result.push(progressBar);
            result.push(campaignDetails);
        } else {
            var campaign = {
                name: campaignRes[0].name,
                status: campaignRes[0].status,
                totalContacts: totalContacts,
                liveCalls: 0,
                contactAttempts: 0,
                ansCalls: 0,
                ansPercent: 0,
                notAnsCalls: 0,
                notAnsPercent: 0,
                totalDuration: 0,
                ACWTime: 0,
                holdTime: 0,
                callDelay: 0,
                callHandlingTime: 0,
                ACD: 0,
                averageACW: 0,
                averageHoldTime: 0,
                averageCallDelay: 0,
                averageCallHandlingTime: 0,
                retry_count: 0,
                agentCount: 0,
                agentsOnLiveCount: 0
            }
            var progressBar = {
                progressBar: 0
            }
            var result = [];
            result.push(campaign);
            result.push(progressBar);
        }
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_by_campaign_details(req, res, next) {
    try {
        var id = req.query.id;
        var sql = `SELECT cc_campaign.id as campaign_id,cc_campaign.id_user,cc_campaign.id_department,type,name,description,total_contacts,caller_id,caller_id_number,audio_file,application_file,application,audio,route,frequency,retry,retry_options,call_duration,running_days,work_time_start,work_time_end,schedule_start,schedule_end,gobal_duplicate_check,dail_type,force_call_recording,cc_campaign.createdAt as date,`
        sql += `campaign_callerid,template,status,view_call_summary,hang_up_on_submit,retry_skip,remarks_skip,phn_number_mask,api_integration,whatsapp_integration from cc_campaign LEFT JOIN campaign_settings ON cc_campaign.id = campaign_settings.campaign_id where cc_campaign.id = '${id}' `;
        var [result] = await getConnection.query(sql);
        if (result.length != 0) {
            if (result[0].api_integration == null) {
                result[0].api_integration = 0
            }
            if (result[0].phn_number_mask == null) {
                result[0].phn_number_mask = 0
            }
        }
        var phnbook = `SELECT phonebook_id FROM cc_campaign_phonebook WHERE campaign_id = '${id}'`;
        var [phonebookRes] = await getConnection.query(phnbook);
        if (phonebookRes.length != 0) {
            var phonebookId = [];
            phonebookRes.map(async (data) => {
                phonebookId.push(data.phonebook_id)
            })
            var totalContacts = await phonebook_contactsModel.count({ phonebook_id: { $in: phonebookId } })
        } else {
            var totalContacts = 0;
        }
        if (result.length != 0) {
            if (result[0].template != undefined && result[0].template) {
                var save_data_to = await templateModel.find({ _id: new ObjectId(result[0].template) })
                result[0].save_data_to = save_data_to[0].save_data_to;
            }
        }
        var agnetSql = `SELECT caller_id,currentStatus FROM cc_user_campaign WHERE user_id = '${req.token.id}' and id_campaign = '${id}'`;
        var [agentRes] = await getConnection.query(agnetSql);
        var count = `SELECT sum(cancel) as cancel,sum(attempted_contact) as attempted_contact,sum(connected_count) as connected_count,sum(notconnected_count) as notconnected_count,sum(busy) as busy,sum(retry) as retry FROM cc_campaign_call_summary  where campaign_id = '${id}'  GROUP BY campaign_id`;
        var [count_result] = await getConnection.query(count)
        if (agentRes.length != 0) {
            result[0].agentStatus = agentRes[0].currentStatus;
        }
        if (result[0].caller_id_number == null) {
            if (agentRes.length != 0) {
                result[0].caller_id_number = agentRes[0].caller_id;
            }
        }
        if (result[0].caller_id_number != undefined) {
            var didSql = `SELECT fwd_provider FROM did WHERE did = '${result[0].caller_id_number}'`;
            var [didRes] = await getConnection.query(didSql)
            if (didRes.length != 0) {
                result[0].fwd_provider = didRes[0].fwd_provider;
            }
        }
        var phnbookArray = [];
        phonebookRes.map(async (data) => {
            phnbookArray.push(data.phonebook_id);
        })
        function calculatePercentage(partialValue, totalValue) {
            return (partialValue / totalValue) * 100;
        }
        var template = await phonebook_templatesModel.find({ phonebook_id: { $in: phonebookId } })
        var templateArray = []
        if (template.length != 0) {
            template.map(async (templateData) => {
                delete templateData._doc.__v
                delete templateData._doc._id
                delete templateData._doc.id_user
                delete templateData._doc.id_department
                delete templateData._doc.createdAt
                delete templateData._doc.collectionId
                if (templateArray.length == 0) {
                    templateArray.push({ phonebookId: templateData._doc.phonebook_id, fields: templateData._doc });
                } else {
                    let foundObject = templateArray.findIndex(obj => obj.fields.phonebook_id == templateData._doc.phonebook_id);
                    if (foundObject != -1) {
                        templateArray[foundObject].fields = { ...templateArray[foundObject].fields, ...templateData._doc };
                    } else {
                        templateArray.push({ phonebookId: templateData._doc.phonebook_id, fields: templateData._doc });
                    }
                }
            })
        }
        result[0].templateData = templateArray
        var whatsapp_campaign_integration = await jwtModel.find({ campaign_id: id })
        if (whatsapp_campaign_integration.length != 0) {
            result[0].template_id = whatsapp_campaign_integration[0]._doc.template_id;
            result[0].url = whatsapp_campaign_integration[0]._doc.url;
            result[0].imageParams = whatsapp_campaign_integration[0]._doc.imageParams;
            result[0].token = whatsapp_campaign_integration[0]._doc.token;
            result[0].method = whatsapp_campaign_integration[0]._doc.method;
            result[0].jwt_token_url = whatsapp_campaign_integration[0]._doc.jwt_token_url
            result[0].jwt_response = whatsapp_campaign_integration[0]._doc.jwt_response
            result[0].jwt_method = whatsapp_campaign_integration[0]._doc.jwt_method
            result[0].jwtData = whatsapp_campaign_integration[0]._doc.jwtData
        }
        if (count_result.length != 0) {
            var contactAttemptsForGraph = Number(count_result[0].attempted_contact) - Number(count_result[0].retry);
            var progressBarPer = calculatePercentage(contactAttemptsForGraph, totalContacts);
            var remaining_calls = totalContacts - contactAttemptsForGraph
            result[0].connected_calls = Number(count_result[0].connected_count);
            result[0].not_connected_calls = Number(count_result[0].notconnected_count);
            result[0].busy = Number(count_result[0].busy);
            result[0].cancel = count_result[0].cancel;
            result[0].progressBar = progressBarPer;
            result[0].remaining_calls = remaining_calls;
            result[0].attempted_contact = Number(count_result[0].attempted_contact);
            result[0].retry_count = Number(count_result[0].retry);
            result[0].contactAttemptsForGraph = contactAttemptsForGraph
        } else {
            result[0].connected_calls = 0;
            result[0].not_connected_calls = 0;
            result[0].busy = 0;
            result[0].cancel = 0;
            result[0].progressBar = 0;
            result[0].remaining_calls = 0;
            result[0].attempted_contact = 0;
            result[0].retry_count = 0;
            result[0].contactAttemptsForGraph = 0;
        }
        result[0].phonebook = phnbookArray;
        result[0].totalContacts = totalContacts;
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function update_campaign_status(req, res, next) {
    try {
        var id = req.query.id;
        var status = req.body.status;
        var type = req.query.type;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        if (isAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = 0;
        } else if (isSubAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = req.query.id_department;
        } else if (isDept == 1) {
            var id_user = req.token.id_user;
            var id_department = req.token.id;
        }
        if (type == 1) {
            id_user = id_user;
            if (status == 2) {
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1;
                var yyyy = today.getFullYear();
                var hours = today.getHours();
                var min = today.getMinutes();
                var sec = today.getSeconds();
                var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`;
                var loginUpdate = `UPDATE cc_user_campaign SET currentStatus = '0',logoutTime = '${todayDate}' WHERE id_campaign IN(${id}) `;
                var [loginUpdateRes] = await sequelize.query(loginUpdate);
                var agentsql = `SELECT user_id as id_agent,agentChannel FROM cc_user_campaign WHERE id_campaign = '${id}' `;
                var [agentRes] = await getConnection.query(agentsql);
                var campaignNameWithoutSpaces = `${id}`;
                var innerScheduleCampaignNameWithoutSpaces = `${id}` + '_s';
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
                var obj = {
                    campaign_id: id,
                    status: status
                }
                if (agentRes != undefined) {
                    agentRes.map(async data => {
                        var agent = Number(data.id_agent)
                        var msg = 'updateCampaignStatus'
                        var socket = await userSocket(agent, msg, obj);
                        //   io.to(agent).emit('updateCampaignStatus', { obj });
                        console.log(agent)
                    });
                }
                var msg = 'campaignLiveReportAgent'
                var socket = await adminSocket(id_user, msg, obj);
                var sql = `UPDATE cc_campaign SET status='${status}' where id = '${id}' `;
                var [result] = await sequelize.query(sql);
                broadcastLogMessage("campaign status updated to pause......." + id)
                broadcastLogMessage("campaign status updated time......." + new Date())
                res.locals.result = result;
                next()
            }
            if (status == 1) {
                var existCheckingSql = `SELECT * FROM cc_campaign_call_summary WHERE campaign_id = '${id}' `;
                var [existChecking] = await getConnection.query(existCheckingSql);
                var uniquePhoneBookIds = [];
                var uniqueAgentIds = [];
                existChecking.map(data => {
                    uniquePhoneBookIds.push(data.phonebook_id);
                    uniqueAgentIds.push(data.agent_id);
                });
                var existPhoneBookId = [...new Set(uniquePhoneBookIds)];
                var existAgentId = [...new Set(uniqueAgentIds)];
                var agentsql = `SELECT user_id as id_agent FROM cc_user_campaign WHERE id_campaign = '${id}' `;
                var [agentRes] = await getConnection.query(agentsql);
                var agent_id = [];
                agentRes.map(agentId => {
                    agent_id.push(agentId.id_agent)
                });
                var phonbooksql = `SELECT phonebook_id FROM cc_campaign_phonebook where campaign_id = '${id}' `;
                var [phonebookRes] = await getConnection.query(phonbooksql);
                var phnbook_Id = [];
                phonebookRes.map(phonebok => {
                    phnbook_Id.push(phonebok.phonebook_id);
                });
                function areArraysEqual(arr1, arr2) {
                    if (arr1.length !== arr2.length) {
                        return false;
                    }
                    const sortedArr1 = arr1.slice().sort();
                    const sortedArr2 = arr2.slice().sort();
                    return sortedArr1.every((element, index) => element === sortedArr2[index]);
                }
                var phonebookChecking = areArraysEqual(existPhoneBookId, phnbook_Id);
                var agentChecking = areArraysEqual(existAgentId, agent_id);
                if (existChecking.length == 0) {
                    var data = [];
                    agentRes.map((agent) => {
                        phonebookRes.map((phnbook) => {
                            data.push({
                                id_user: id_user,
                                id_department: id_department,
                                agent_id: agent.id_agent,
                                phonebook_id: phnbook.phonebook_id,
                                campaign_id: id
                            });
                        });
                    });
                    var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(data);
                } else if (phonebookChecking == false && agentChecking == false) {
                    var data = [];
                    agent_id.map((agent) => {
                        phnbook_Id.map((phnbook) => {
                            data.push({
                                id_user: id_user,
                                id_department: id_department,
                                agent_id: agent,
                                phonebook_id: phnbook,
                                campaign_id: id
                            });
                        });
                    });
                    var filteredData = data.filter(item => {
                        return !(existAgentId.includes(item.agent_id) && existPhoneBookId.includes(item.phonebook_id));
                    });
                    var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(filteredData);
                    // }
                } else if (phonebookChecking == false && agentChecking == true) {
                    var data = [];
                    agent_id.map((agent) => {
                        phnbook_Id.map((phnbook) => {
                            data.push({
                                id_user: id_user,
                                id_department: id_department,
                                agent_id: agent,
                                phonebook_id: phnbook,
                                campaign_id: id
                            });
                        });
                    });
                    var filteredData = data.filter(item => {
                        return !(existAgentId.includes(item.agent_id) && existPhoneBookId.includes(item.phonebook_id));
                    });
                    var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(filteredData);
                    // }
                } else if (phonebookChecking == true && agentChecking == false) {
                    var data = [];
                    agent_id.map((agent) => {
                        phnbook_Id.map((phnbook) => {
                            data.push({
                                id_user: id_user,
                                id_department: id_department,
                                agent_id: agent,
                                phonebook_id: phnbook,
                                campaign_id: id
                            });
                        });
                    });
                    var filteredData = data.filter(item => {
                        return !(existAgentId.includes(item.agent_id) && existPhoneBookId.includes(item.phonebook_id));
                    });
                    var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(filteredData);
                }
                var obj = {
                    campaign_id: id,
                    status: status
                }
                if (agentRes != undefined) {
                    agentRes.map(async data => {
                        var agent = Number(data.id_agent)
                        var msg = 'updateCampaignStatus'
                        var socket = await userSocket(agent, msg, obj);
                        console.log(agent)
                    });
                }
                var msg = 'campaignLiveReportAgent'
                var socket = await adminSocket(id_user, msg, obj);
                var sql = `UPDATE cc_campaign SET status='${status}' where id = '${id}' `;
                var [result] = await sequelize.query(sql);
                broadcastLogMessage("campaign status updated to running......." + id)
                broadcastLogMessage("campaign status updated time......." + new Date())
                res.locals.result = result;
                next()
            }
        } else {
            id_user = id_user;
            var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
            var [transRes] = await getConnection.query(transSql);
            if (transRes.length != 0) {
                if (status == 2) {
                    var today = new Date();
                    var dd = today.getDate();
                    var mm = today.getMonth() + 1;
                    var yyyy = today.getFullYear();
                    var hours = today.getHours();
                    var min = today.getMinutes();
                    var sec = today.getSeconds();
                    var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`;
                    var loginUpdate = `UPDATE cc_user_campaign SET currentStatus = '0',logoutTime = '${todayDate}' WHERE id_campaign IN(${id}) `;
                    var [loginUpdateRes] = await sequelize.query(loginUpdate);
                    var agentsql = `SELECT user_id as id_agent,agentChannel FROM cc_user_campaign WHERE id_campaign = '${id}' `;
                    var [agentRes] = await getConnection.query(agentsql);
                    var campaignNameWithoutSpaces = `${id}`;
                    var innerScheduleCampaignNameWithoutSpaces = `${id}` + '_s';
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
                    var obj = {
                        campaign_id: id,
                        status: status
                    }
                    if (agentRes != undefined) {
                        agentRes.map(async data => {
                            var agent = Number(data.id_agent)
                            var msg = 'updateCampaignStatus'
                            var socket = await userSocket(agent, msg, obj);
                            //   io.to(agent).emit('updateCampaignStatus', { obj });
                            console.log(agent)
                        });
                    }
                    var msg = 'campaignLiveReportAgent'
                    var socket = await adminSocket(id_user, msg, obj);
                    var sql = `UPDATE cc_campaign SET status='${status}' where id = '${id}' `;
                    var [result] = await sequelize.query(sql);
                    broadcastLogMessage("campaign status updated to pause......." + id)
                    broadcastLogMessage("campaign status updated time......." + new Date())
                    res.locals.result = result;
                    next()
                }
                if (status == 1) {
                    // var transCredit = Math.abs(transRes[0].trans_credit);
                    var transCredit = transRes[0].trans_credit;
                    if (transCredit <= 0) {
                        res.locals.result = "no balance";
                        next()
                    } else {
                        var existCheckingSql = `SELECT * FROM cc_campaign_call_summary WHERE campaign_id = '${id}' `;
                        var [existChecking] = await getConnection.query(existCheckingSql);
                        var uniquePhoneBookIds = [];
                        var uniqueAgentIds = [];
                        existChecking.map(data => {
                            uniquePhoneBookIds.push(data.phonebook_id);
                            uniqueAgentIds.push(data.agent_id);
                        });
                        var existPhoneBookId = [...new Set(uniquePhoneBookIds)];
                        var existAgentId = [...new Set(uniqueAgentIds)];
                        var agentsql = `SELECT user_id as id_agent FROM cc_user_campaign WHERE id_campaign = '${id}' `;
                        var [agentRes] = await getConnection.query(agentsql);
                        var agent_id = [];
                        agentRes.map(agentId => {
                            agent_id.push(agentId.id_agent)
                        });
                        var phonbooksql = `SELECT phonebook_id FROM cc_campaign_phonebook where campaign_id = '${id}' `;
                        var [phonebookRes] = await getConnection.query(phonbooksql);
                        var phnbook_Id = [];
                        phonebookRes.map(phonebok => {
                            phnbook_Id.push(phonebok.phonebook_id);
                        });
                        function areArraysEqual(arr1, arr2) {
                            if (arr1.length !== arr2.length) {
                                return false;
                            }
                            const sortedArr1 = arr1.slice().sort();
                            const sortedArr2 = arr2.slice().sort();
                            return sortedArr1.every((element, index) => element === sortedArr2[index]);
                        }
                        var phonebookChecking = areArraysEqual(existPhoneBookId, phnbook_Id);
                        var agentChecking = areArraysEqual(existAgentId, agent_id);
                        if (existChecking.length == 0) {
                            var data = [];
                            agentRes.map((agent) => {
                                phonebookRes.map((phnbook) => {
                                    data.push({
                                        id_user: id_user,
                                        id_department: id_department,
                                        agent_id: agent.id_agent,
                                        phonebook_id: phnbook.phonebook_id,
                                        campaign_id: id
                                    });
                                });
                            });
                            var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(data);
                        } else if (phonebookChecking == false && agentChecking == false) {
                            var data = [];
                            agent_id.map((agent) => {
                                phnbook_Id.map((phnbook) => {
                                    data.push({
                                        id_user: id_user,
                                        id_department: id_department,
                                        agent_id: agent,
                                        phonebook_id: phnbook,
                                        campaign_id: id
                                    });
                                });
                            });
                            var filteredData = data.filter(item => {
                                return !(existAgentId.includes(item.agent_id) && existPhoneBookId.includes(item.phonebook_id));
                            });
                            var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(filteredData);
                            // }
                        } else if (phonebookChecking == false && agentChecking == true) {
                            var data = [];
                            agent_id.map((agent) => {
                                phnbook_Id.map((phnbook) => {
                                    data.push({
                                        id_user: id_user,
                                        id_department: id_department,
                                        agent_id: agent,
                                        phonebook_id: phnbook,
                                        campaign_id: id
                                    });
                                });
                            });
                            var filteredData = data.filter(item => {
                                return !(existAgentId.includes(item.agent_id) && existPhoneBookId.includes(item.phonebook_id));
                            });
                            var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(filteredData);
                            // }
                        } else if (phonebookChecking == true && agentChecking == false) {
                            var data = [];
                            agent_id.map((agent) => {
                                phnbook_Id.map((phnbook) => {
                                    data.push({
                                        id_user: id_user,
                                        id_department: id_department,
                                        agent_id: agent,
                                        phonebook_id: phnbook,
                                        campaign_id: id
                                    });
                                });
                            });
                            var filteredData = data.filter(item => {
                                return !(existAgentId.includes(item.agent_id) && existPhoneBookId.includes(item.phonebook_id));
                            });
                            var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(filteredData);
                        }
                        var obj = {
                            campaign_id: id,
                            status: status
                        }
                        if (agentRes != undefined) {
                            agentRes.map(async data => {
                                var agent = Number(data.id_agent)
                                var msg = 'updateCampaignStatus'
                                var socket = await userSocket(agent, msg, obj);
                                console.log(agent)
                            });
                        }
                        var msg = 'campaignLiveReportAgent'
                        var socket = await adminSocket(id_user, msg, obj);
                        var sql = `UPDATE cc_campaign SET status='${status}' where id = '${id}' `;
                        var [result] = await sequelize.query(sql);
                        broadcastLogMessage("campaign status updated to running......." + id)
                        broadcastLogMessage("campaign status updated time......." + new Date())
                        res.locals.result = result;
                        next()
                    }
                }
            }
        }
        
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function broadcastIntegration(campaignId, broadcastSettings) {
    try {
        if (broadcastSettings.sms) {
            var exist = await broadcastSmsModel.find({ campaignId: campaignId });
            if (exist.length != 0) {
                const result = await broadcastSmsModel.deleteMany({ campaignId: campaignId });
                var map_result = Promise.all(
                    broadcastSettings.sms.map(async (data) => {
                        data.campaignId = campaignId;
                        return data;
                    })
                )
                var output = await map_result;
                var insertion = await broadcastSmsModel.insertMany(output);
            } else {
                var map_result = Promise.all(
                    broadcastSettings.sms.map(async (data) => {
                        data.campaignId = campaignId;
                        return data;
                    })
                )
                var output = await map_result;
                var insertion = await broadcastSmsModel.insertMany(output);
            }
        }
        if (broadcastSettings.whatsapp) {
            var exist = await broadcastWhatsappModel.find({ campaignId: campaignId });
            if (exist.length != 0) {
                const result = await broadcastWhatsappModel.deleteMany({ campaignId: campaignId });
                var map_result = Promise.all(
                    broadcastSettings.whatsapp.map(async (data) => {
                        data.campaignId = campaignId;
                        return data;
                    })
                )
                var output = await map_result;
                var insertion = await broadcastWhatsappModel.insertMany(output);
            } else {
                var map_result = Promise.all(
                    broadcastSettings.whatsapp.map(async (data) => {
                        data.campaignId = campaignId;
                        return data;
                    })
                )
                var output = await map_result;
                var insertion = await broadcastWhatsappModel.insertMany(output);
            }
        }
        if (broadcastSettings.api) {
            var exist = await broadcastApiModel.find({ campaignId: campaignId });
            if (exist.length != 0) {
                const result = await broadcastApiModel.deleteMany({ campaignId: campaignId });
                var map_result = Promise.all(
                    broadcastSettings.api.map(async (data) => {
                        data.campaignId = campaignId;
                        return data;
                    })
                )
                var output = await map_result;
                var insertion = await broadcastApiModel.insertMany(output);
            } else {
                var map_result = Promise.all(
                    broadcastSettings.api.map(async (data) => {
                        data.campaignId = campaignId;
                        return data;
                    })
                )
                var output = await map_result;
                var insertion = await broadcastApiModel.insertMany(output);
            }
        }
        return insertion
    } catch (err) {
        console.log(err);
        return err;
        next()
    }
}
async function get_broadcast_integration(campaignId) {
    try {
        var sms = []
        var whatsapp = []
        var api = []
        var exist = await broadcastSmsModel.find({ campaignId: campaignId });
        if (exist.length != 0) {
            exist.map(async (data) => {
                if (data._doc.calltype == 'answer') {
                    sms.push(data._doc)
                }
                if (data._doc.calltype == 'noanswer') {
                    sms.push(data._doc)
                }
            })
        }
        var exist = await broadcastWhatsappModel.find({ campaignId: campaignId });
        if (exist.length != 0) {
            exist.map(async (data) => {
                if (data._doc.calltype == 'answer') {
                    whatsapp.push(data._doc)
                }
                if (data._doc.calltype == 'noanswer') {
                    whatsapp.push(data._doc)
                }
            })
        }
        var exist = await broadcastApiModel.find({ campaignId: campaignId });
        if (exist.length != 0) {
            exist.map(async (data) => {
                if (data._doc.calltype == 'answer') {
                    api.push(data._doc)
                }
                if (data._doc.calltype == 'noanswer') {
                    api.push(data._doc)
                }
            })
        }
        var broadcastSettings = { sms, whatsapp, api }
        return broadcastSettings
    } catch (err) {
        console.log(err);
        return err;
        next()
    }
}

async function agent_login(req, res, next) {
    try {
        var id_agent = req.token.id;
        var id_campaign = req.query.id_campaign;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var hours = today.getHours();
        var min = today.getMinutes();
        var sec = today.getSeconds();
        var date = `${yyyy}-${mm}-${dd}`;
        var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`
        var phonebookId = req.query.phonebookId;
        var data = []
        var phonebook = phonebookId.split(',');
        var phonebookStr = phonebook.map(pb => `'${pb}'`).join(',');
         let callerId
        var callerIdSql = `SELECT cc_campaign.id,caller_id,did FROM cc_campaign join did on did.id = cc_campaign.caller_id WHERE cc_campaign.id = ${id_campaign}`;
        var [callerIdRes] = await getConnection.query(callerIdSql);
        if (callerIdRes.length == 0) {
            var userDidSql = `SELECT us.user_id,us.did,us.did_type,d.did as didNumber FROM user_settings us LEFT JOIN did d ON us.did_type = 2 AND us.did = d.id WHERE us.user_id = ${id_agent}`
            var [userDidRes] = await getConnection.query(userDidSql);
            if (userDidRes.length != 0) {
                if (userDidRes[0].didNumber != null) {
                    callerId = userDidRes[0].didNumber
                } else {
                    callerId = userDidRes[0].did
                }
            }
        } else {
            callerId = callerIdRes[0].did
        }
        var digit_2 = callerId.toString().substring(0, 2);
        var didSql = `SELECT pricing_plan,id_pay_per_calls_plans,id_pay_per_channel_plans,outgoing_call_ratecard_id FROM did where did like '${callerId}'`;
        var [didRes] = await sequelize.query(didSql);
        if (didRes[0].pricing_plan != 1 && didRes[0].id_pay_per_channel_plans != 1) {
            var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${req.token.id_user}`;
            var [transRes] = await getConnection.query(transSql);
            if (transRes.length != 0) {
                var transCredit = Math.abs(transRes[0].trans_credit);
                if (transCredit <= 0) {
                    res.locals.result = "no balance";
                    next()
                } else {
                    var breakSql = `SELECT id_break FROM user_activities WHERE user_id = '${id_agent}' ORDER BY startDate DESC LIMIT 1`;
                    var [breakRes] = await getConnection.query(breakSql);
                    if (breakRes[0].id_break == 1) {
                        var existingChecking = `SELECT phonebook_id,campaign_id,user_id as agent_id,createdAt FROM cc_campaign_call_summary WHERE user_id = '${id_agent}' AND campaign_id = '${id_campaign}' AND phonebook_id IN(${phonebookStr}) AND DATE(createdAt) = '${date}' `;
                        var [existingCheckingRes] = await getConnection.query(existingChecking);
                        if (existingCheckingRes.length != 0) {
                            var existPhnbk = [];
                            existingCheckingRes.map((phnbook) => {
                                existPhnbk.push(phnbook.phonebook_id);
                            })
                            function areArraysEqual(arr1, arr2) {
                                if (arr1.length !== arr2.length) {
                                    return false;
                                }
                                const sortedArr1 = arr1.slice().sort();
                                const sortedArr2 = arr2.slice().sort();
                                return sortedArr1.every((element, index) => element === sortedArr2[index]);
                            }
                            var phonebookChecking = areArraysEqual(existPhnbk, phonebook);
                            if (phonebookChecking == false) {
                                var newPhnbk = phonebook.filter(number => !existPhnbk.includes(number));
                                newPhnbk.map((phnbook) => {
                                    data.push({
                                        id_user: req.token.id_user,
                                        id_department: req.token.id_department,
                                        user_id: id_agent,
                                        phonebook_id: phnbook,
                                        campaign_id: id_campaign
                                    });
                                });
                            }
                        } else {
                            phonebook.map((phnbook) => {
                                data.push({
                                    id_user: req.token.id_user,
                                    id_department: req.token.id_department,
                                    user_id: id_agent,
                                    phonebook_id: phnbook,
                                    campaign_id: id_campaign
                                });
                            });
                        }
                        var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(data);
                        res.locals.result = addcampaignSummary;
                        next()
                    } else {
                        var result = "currently break"
                        res.locals.result = result;
                        req.agentLoginData = result;
                        next()
                    }
                }
            }
        } else {
            if (digit_2 != "91") {
                var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${req.token.id_user}`;
                var [transRes] = await getConnection.query(transSql);
                if (transRes.length != 0) {
                    var transCredit = Math.abs(transRes[0].trans_credit);
                    if (transCredit <= 0) {
                        res.locals.result = "no balance";
                        next()
                    } else {
                        var breakSql = `SELECT id_break FROM user_activities WHERE user_id = '${id_agent}' ORDER BY startDate DESC LIMIT 1`;
                        var [breakRes] = await getConnection.query(breakSql);
                        if (breakRes[0].id_break == 1) {
                            var existingChecking = `SELECT phonebook_id,campaign_id,user_id as agent_id,createdAt FROM cc_campaign_call_summary WHERE user_id = '${id_agent}' AND campaign_id = '${id_campaign}' AND phonebook_id IN(${phonebookStr}) AND DATE(createdAt) = '${date}' `;
                            var [existingCheckingRes] = await getConnection.query(existingChecking);
                            if (existingCheckingRes.length != 0) {
                                var existPhnbk = [];
                                existingCheckingRes.map((phnbook) => {
                                    existPhnbk.push(phnbook.phonebook_id);
                                })
                                function areArraysEqual(arr1, arr2) {
                                    if (arr1.length !== arr2.length) {
                                        return false;
                                    }
                                    const sortedArr1 = arr1.slice().sort();
                                    const sortedArr2 = arr2.slice().sort();
                                    return sortedArr1.every((element, index) => element === sortedArr2[index]);
                                }
                                var phonebookChecking = areArraysEqual(existPhnbk, phonebook);
                                if (phonebookChecking == false) {
                                    var newPhnbk = phonebook.filter(number => !existPhnbk.includes(number));
                                    newPhnbk.map((phnbook) => {
                                        data.push({
                                            id_user: req.token.id_user,
                                            id_department: req.token.id_department,
                                            user_id: id_agent,
                                            phonebook_id: phnbook,
                                            campaign_id: id_campaign
                                        });
                                    });
                                }
                            } else {
                                phonebook.map((phnbook) => {
                                    data.push({
                                        id_user: req.token.id_user,
                                        id_department: req.token.id_department,
                                        user_id: id_agent,
                                        phonebook_id: phnbook,
                                        campaign_id: id_campaign
                                    });
                                });
                            }
                            var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(data);
                            res.locals.result = addcampaignSummary;
                            next()
                        } else {
                            var result = "currently break"
                            res.locals.result = result;
                            req.agentLoginData = result;
                            next()
                        }
                    }
                }
            } else {
                var breakSql = `SELECT id_break FROM user_activities WHERE user_id = '${id_agent}' ORDER BY startDate DESC LIMIT 1`;
                var [breakRes] = await getConnection.query(breakSql);
                if (breakRes[0].id_break == 1) {
                    var existingChecking = `SELECT phonebook_id,campaign_id,user_id as agent_id,createdAt FROM cc_campaign_call_summary WHERE user_id = '${id_agent}' AND campaign_id = '${id_campaign}' AND phonebook_id IN(${phonebookStr}) AND DATE(createdAt) = '${date}' `;
                    var [existingCheckingRes] = await getConnection.query(existingChecking);
                    if (existingCheckingRes.length != 0) {
                        var existPhnbk = [];
                        existingCheckingRes.map((phnbook) => {
                            existPhnbk.push(phnbook.phonebook_id);
                        })
                        function areArraysEqual(arr1, arr2) {
                            if (arr1.length !== arr2.length) {
                                return false;
                            }
                            const sortedArr1 = arr1.slice().sort();
                            const sortedArr2 = arr2.slice().sort();
                            return sortedArr1.every((element, index) => element === sortedArr2[index]);
                        }
                        var phonebookChecking = areArraysEqual(existPhnbk, phonebook);
                        if (phonebookChecking == false) {
                            var newPhnbk = phonebook.filter(number => !existPhnbk.includes(number));
                            newPhnbk.map((phnbook) => {
                                data.push({
                                    id_user: req.token.id_user,
                                    id_department: req.token.id_department,
                                    user_id: id_agent,
                                    phonebook_id: phnbook,
                                    campaign_id: id_campaign
                                });
                            });
                        }
                    } else {
                        phonebook.map((phnbook) => {
                            data.push({
                                id_user: req.token.id_user,
                                id_department: req.token.id_department,
                                user_id: id_agent,
                                phonebook_id: phnbook,
                                campaign_id: id_campaign
                            });
                        });
                    }
                    var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(data);
                    res.locals.result = addcampaignSummary;
                    next()
                } else {
                    var result = "currently break"
                    res.locals.result = result;
                    req.agentLoginData = result;
                    next()
                }
            }
        }
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function agent_logout(req, res, next) {
    try {
        console.log("----- agent logout function -----")
        var id_agent = req.token.id;
        var id_campaign = req.query.id_campaign;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var hours = today.getHours();
        var min = today.getMinutes();
        var sec = today.getSeconds();
        var todayDate = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`
        var loginUpdate = `UPDATE cc_user_campaign SET currentStatus = '0',logoutTime = '${todayDate}' WHERE user_id = '${id_agent}' and id_campaign = '${id_campaign}'`;
        var [loginUpdateRes] = await sequelize.query(loginUpdate);
        console.log("loginUpdate --->",loginUpdate)
        console.log(loginUpdateRes)
        res.locals.result = loginUpdateRes;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function update_agent_status(req, res, next) {
    try {
        var agentId = req.query.agentId;
        var campaignId = req.query.campaignId;
        var status = req.body.status;
        var id_user = req.token.id_user;
        let caller
        var callerIdSql = `SELECT cc_campaign.id,caller_id,did FROM cc_campaign join did on did.id = cc_campaign.caller_id WHERE cc_campaign.id = ${campaignId}`;
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
            var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
            var [transRes] = await getConnection.query(transSql);
            if (transRes.length != 0) {
                if (status == 1) {
                    var transCredit = Math.abs(transRes[0].trans_credit);
                    if (transCredit <= 0) {
                        res.locals.result = "no balance";
                        next()
                    } else {
                        var sql = `UPDATE cc_user_campaign SET currentStatus = '${status}' where user_id = '${agentId}' and id_campaign = '${campaignId}' `;
                        var [result] = await sequelize.query(sql);
                        var obj = {
                            agentId: agentId,
                            campaignId: campaignId,
                            status: "available",
                            event: "available"
                        }
                        var msg = 'campaignLiveReportAgent'
                        var socket = await adminSocket(req.token.id_user, msg, obj);
                        res.locals.result = result;
                        next()
                    }
                }
                if (status == 2) {
                    var sql = `UPDATE cc_user_campaign SET currentStatus = '${status}' where user_id = '${agentId}' and id_campaign = '${campaignId}' `;
                    var [result] = await sequelize.query(sql);
                    var obj = {
                        agentId: agentId,
                        campaignId: campaignId,
                        status: "paused",
                        event: "paused"
                    }
                    var msg = 'campaignLiveReportAgent'
                    var socket = await adminSocket(req.token.id_user, msg, obj);
                    res.locals.result = result;
                    next()
                }
            }
        } else {
            if (digit_2 != "91") {
                var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                var [transRes] = await getConnection.query(transSql);
                if (transRes.length != 0) {
                    if (status == 1) {
                        var transCredit = Math.abs(transRes[0].trans_credit);
                        if (transCredit <= 0) {
                            res.locals.result = "no balance";
                            next()
                        } else {
                            var sql = `UPDATE cc_user_campaign SET currentStatus = '${status}' where user_id = '${agentId}' and id_campaign = '${campaignId}' `;
                            var [result] = await sequelize.query(sql);
                            var obj = {
                                agentId: agentId,
                                campaignId: campaignId,
                                status: "available",
                                event: "available"
                            }
                            var msg = 'campaignLiveReportAgent'
                            var socket = await adminSocket(req.token.id_user, msg, obj);
                            res.locals.result = result;
                            next()
                        }
                    }
                    if (status == 2) {
                        var sql = `UPDATE cc_user_campaign SET currentStatus = '${status}' where user_id = '${agentId}' and id_campaign = '${campaignId}' `;
                        var [result] = await sequelize.query(sql);
                        var obj = {
                            agentId: agentId,
                            campaignId: campaignId,
                            status: "paused",
                            event: "paused"
                        }
                        var msg = 'campaignLiveReportAgent'
                        var socket = await adminSocket(req.token.id_user, msg, obj);
                        res.locals.result = result;
                        next()
                    }
                }
            } else {
                if (status == 1) {
                    var sql = `UPDATE cc_user_campaign SET currentStatus = '${status}' where user_id = '${agentId}' and id_campaign = '${campaignId}' `;
                    var [result] = await sequelize.query(sql);
                    var obj = {
                        agentId: agentId,
                        campaignId: campaignId,
                        status: "available",
                        event: "available"
                    }
                    var msg = 'campaignLiveReportAgent'
                    var socket = await adminSocket(req.token.id_user, msg, obj);
                    res.locals.result = result;
                    next()
                }
                if (status == 2) {
                    var sql = `UPDATE cc_user_campaign SET currentStatus = '${status}' where user_id = '${agentId}' and id_campaign = '${campaignId}' `;
                    var [result] = await sequelize.query(sql);
                    var obj = {
                        agentId: agentId,
                        campaignId: campaignId,
                        status: "paused",
                        event: "paused"
                    }
                    var msg = 'campaignLiveReportAgent'
                    var socket = await adminSocket(req.token.id_user, msg, obj);
                    res.locals.result = result;
                    next()
                }
            }
        }

    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function insert_template(req, res, next) {
    try {
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var templates = req.body.templates;
        if (isAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = 0;
        } else if (isSubAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = templates.id_department;
        } else if (isDept == 1) {
            var id_user = req.token.id_user;
            var id_department = req.token.id;
        }

        templates.id_user = id_user;
        templates.id_department = id_department;
        var currentDate = new Date();
        var decreasedTime = currentDate.getTime();
        var createdAtDate = new Date(decreasedTime);
        templates.createdAt = createdAtDate;
        delete templates.id_dept
        var filter = [{ name: templates.name }, { id_department: id_department }, { id_user: id_user }];
        var existChecking = await templateModel.find({ $and: filter })
        if (existChecking.length != 0) {
            res.locals.result = "exist";
            next()
            return
        } else {
            var insertTemplates = await templateModel.create(templates);
            res.locals.result = insertTemplates;
        }
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function update_template(req, res, next) {
    try {
        var _id = req.query.id;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        if (isAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = 0;
        } else if (isSubAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = req.query.id_department;
        } else if (isDept == 1) {
            var id_user = req.token.id_user;
            var id_department = req.token.id;
        }
        var data = req.body.templates;
        data.id_user = id_user;
        data.id_department = id_department;
        delete data.id_dept
        var filter = [{ name: data.name }, { id_department: id_department }, { id_user: id_user }, { _id: { $ne: new ObjectId(_id) } }];
        var existChecking = await templateModel.find({ $and: filter })
        if (existChecking.length != 0) {
            res.locals.result = "exist";
            next()
            return
        } else {
            var insertTemplates = await templateModel.updateOne({ _id: new ObjectId(_id) }, { $set: data });
            if (data.save_data_to != data.previous_save_data_to) {
                var deleteTemplateSms = await templateSms.deleteMany({ templateId: _id });
                var deleteTemplateWp = await templateWhatsapp.deleteMany({ templateId: _id });
                var deleteTemplateApi = await templateApi.deleteMany({ templateId: _id });
            }
            res.locals.result = insertTemplates;
        }
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_all_template(req, res, next) {
    try {
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var department_id = req.query.department_id
        const id_user = req.token.id_user;
        let filter = [{ id_user }];

        if (isSubAdmin === 1) {
            const id_department = req.token.id_department.split(',').map(Number);
            filter.push({ id_department: { $in: id_department } });
        } else if (isDept === 1) {
            const id_department = req.token.id;
            filter.push({ id_department });
        }

        var order = { createdAt: -1 }
        var limit = req.query.count;
        if (limit != undefined) limit = Number(limit);
        var skip = req.query.page;
        if (skip != undefined)
            skip = (skip - 1) * limit;
        var name = req.query.name;
        if (name != undefined) {
            filter.push({ name: { $regex: `.*${name}.*`, $options: 'i' } })
        }
        if (department_id != undefined) {
            filter.push({ id_department: department_id });
        }

        const result = await templateModel.find({ $and: filter }).limit(limit).sort(order).skip(skip);
        var map_result = Promise.all(
            result.map(async (data) => {
                var id_dept = data.id_department;
                var dept = `SELECT name FROM departments WHERE id = '${id_dept}'`
                var [deptRes] = await getConnection.query(dept);
                if (deptRes.length != 0) {
                    data._doc.department = deptRes[0].name;
                } else {
                    data._doc.department = '';
                }
                return data;
            })
        )
        var output = await map_result;
        var count = await templateModel.count({ $and: filter }).sort(order);
        res.locals.result = output;
        res.locals.count = count;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_by_template_id(req, res, next) {
    try {
        var _id = req.query.id;
        var result = await templateModel.find({ _id: new ObjectId(_id) }, { __v: 0, createdAt: 0, updatedAt: 0, id_user: 0 });
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function delete_template(req, res, next) {
    try {
        var _id = req.query.id;
        var type = req.query.type;
        if (type == 1) {
            var get_value = await agentModel.find({ id_template: _id });
        }
        if (type == 2) {
            var get_value = await leadModel.find({ id_template: _id });
        }
        if (type == 3) {
            var get_value = await ticketsModel.find({ id_template: _id });
        }
        if (get_value.length == 0) {
            var result = await templateModel.deleteOne({ _id: new ObjectId(_id) });
            var result1 = await templatefieldModel.deleteMany({ template_id: new ObjectId(_id) });
            res.locals.result = result;
        } else {
            res.locals.result = "exist";
        }
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function template_selectbox(req, res, next) {
    try {
        var type = req.token.type;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var isAgent = req.token.isAgent;
        const id_user = req.token.id_user;
        var department_id = req.query.id_department
        let filter = [{ id_user }];

        if (department_id != undefined) {
            filter.push({ id_department: department_id });
        }
        else if (isSubAdmin === 1) {
            const id_department = req.token.id_department.split(',').map(Number);
            filter.push({ id_department: { $in: id_department } });
        } else if (isDept === 1) {
            const id_department = req.token.id;
            filter.push({ id_department });
        }
        else if (isAgent === 1) {
            const id_department = req.token.id_department;
            filter.push({ id_department });
        }

        var result = await templateModel.find({ $and: filter }, { id_user: 0, id_department: 0, description: 0, included_staffs: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function copy_templates(req, res, next) {
    try {
        var id = req.query.templateId;
        var templateData = req.body;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        if (isAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = 0;
        } else if (isSubAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = req.body.id_dept;
        } else if (isDept == 1) {
            var id_user = req.token.id_user;
            var id_department = req.token.id;
        }
        var template = await templateModel.find({ _id: new ObjectId(id) });
        var currentDate = new Date();
        var decreasedTime = currentDate.getTime();
        var createdAtDate = new Date(decreasedTime);
        templateData.id_user = id_user;
        templateData.id_department = id_department;
        templateData.createdAt = createdAtDate;
        var filter = [{ name: templateData.name }, { id_department: template[0]._doc.id_department }, { id_user: template[0]._doc.id_user }];
        var existChecking = await templateModel.find({ $and: filter })
        if (existChecking.length != 0) {
            res.locals.result = "exist";
            next()
            return
        } else {
            var insertTemplates = await templateModel.create(templateData);
            var template_id = insertTemplates._doc._id
            console.log("new template id......", template_id)
            var templateFields = await templatefieldModel.find({ template_id: new ObjectId(id) });
            if (templateFields.length != 0) {
                var map_result = Promise.all(
                    templateFields.map(async (data) => {
                        delete data._doc.createdAt;
                        delete data._doc._id;
                        delete data._doc.__v;
                        delete data._doc.template_id;
                        delete data._doc.id_user;
                        delete data._doc.id_department;
                        data._doc.createdAt = createdAtDate;
                        data._doc.template_id = template_id;
                        data._doc.id_user = id_user;
                        data._doc.id_department = id_department;
                        return data._doc;
                    })
                )
                var output = await map_result;
                var insertTemplateFields = await templatefieldModel.insertMany(output);
            }
            if (templateData.template_settings == 1) {
                var getSms = await templateSms.find({ templateId: id });
                console.log("getSms......", getSms)
                if (getSms.length != 0) {
                    var map_result = Promise.all(
                        getSms.map(async (data) => {
                            delete data._doc.createdAt;
                            delete data._doc._id;
                            delete data._doc.__v;
                            delete data._doc.templateId;
                            data._doc.templateId = template_id;
                            return data._doc;
                        })
                    )
                    var copySms = await map_result;
                    var insertTemplateSms = await templateSms.insertMany(copySms);
                    console.log("insertTemplateSms......", insertTemplateSms)
                }
                var getWhatsapp = await templateWhatsapp.find({ templateId: id });
                console.log("getWhatsapp......", getWhatsapp)
                if (getWhatsapp.length != 0) {
                    var map_result = Promise.all(
                        getWhatsapp.map(async (data) => {
                            delete data._doc.createdAt;
                            delete data._doc._id;
                            delete data._doc.__v;
                            delete data._doc.templateId;
                            data._doc.templateId = template_id.toString();
                            return data._doc;
                        })
                    )
                    var copyWhatsapp = await map_result;
                    var insertTemplateWhatsapp = await templateWhatsapp.insertMany(copyWhatsapp);
                    console.log("insertTemplateWhatsapp......", insertTemplateWhatsapp)
                }
                var getApi = await templateApi.find({ templateId: id });
                console.log("getApi......", getApi)
                if (getApi.length != 0) {
                    var map_result = Promise.all(
                        getApi.map(async (data) => {
                            delete data._doc.createdAt;
                            delete data._doc._id;
                            delete data._doc.__v;
                            delete data._doc.templateId;
                            data._doc.templateId = template_id;
                            return data._doc;
                        })
                    )
                    var copyApi = await map_result;
                    var insertTemplateApi = await templateApi.insertMany(copyApi);
                    console.log("insertTemplateApi......", insertTemplateApi)
                }
            }
            res.locals.result = insertTemplates;
            next()
        }
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function insert_template_field(req, res, next) {
    try {
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
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
        var templates = req.body.templatesField;
        var templateId = templates.template_id;
        var data = await inser_value(id_user, id_department, templateId, templates);
        var insertTemplates = await templatefieldModel.insertMany(data);
        res.locals.result = insertTemplates;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function update_template_field(req, res, next) {
    try {
        var _id = req.query.id;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        if (isAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = 0
        } else if (isSubAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = req.token.id_department;
        } else if (isDept == 1) {
            var id_user = req.token.id_user;
            var id_department = req.token.id;
        }
        var data = req.body.templatesField;
        data.id_user = id_user;
        data.id_department = id_department;
        var result = await templatefieldModel.deleteMany({ template_id: new ObjectId(_id) });
        var data = await inser_value(id_user, id_department, _id, data);
        var result = await templatefieldModel.insertMany(data);
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function inser_value(id_user, id_department, templateId, templates) {
    return new Promise(async function (resolve, reject) {
        try {
            var map_result = Promise.all(
                templates.fields.map(async (data, index) => {
                    data.id_user = id_user;
                    data.id_department = id_department;
                    data.template_id = new ObjectId(templateId);
                    data.field_name = data.feildname;
                    if (data.fieldvalues != undefined) {
                        data.field_values = data.fieldvalues;
                        delete data.fieldvalues;
                    }
                    data.field_type = data.type;
                    data.field_order = index + 1;
                    delete data.active;
                    delete data.edit;
                    delete data.feildname;
                    delete data.type;
                    if (data.sub != undefined) {
                        data.sub.map(async (subData, subIndex) => {
                            subData.field_name = subData.feildname;
                            subData.field_type = subData.type;
                            subData.field_order = subIndex + 1;
                            if (subData.fieldvalues != undefined) {
                                subData.field_values = subData.fieldvalues;
                                delete subData.fieldvalues;
                            }
                            delete subData.active;
                            delete subData.edit;
                            delete subData.feildname;
                            delete subData.type;
                            return subData;
                        })
                    }
                    return data;
                })
            )
            var output = await map_result;
            resolve(output);
        } catch (err) {
            console.log(err);
            resolve({ result: [] })
        }
    });
}
async function get_all_template_field(req, res, next) {
    try {
        var order = { createdAt: -1 }
        var limit = req.query.count;
        if (limit != undefined) limit = Number(limit);
        var skip = req.query.page;
        if (skip != undefined)
            skip = (skip - 1) * limit;
        var id_template = req.query.template_id;



        if (id_template != undefined && id_template != '0') {
            if (process.env.PROJECT_NAME == 'innovation') {
                var sql = `SELECT * FROM template_fields WHERE id_template = ${id_template}`
                var [result] = await getConnection.query(sql);
                res.locals.result = result;
            } else {
                var result = await templatefieldModel.find({ template_id: new ObjectId(id_template) })
                var sms = await smsModel.find({ template_id: new ObjectId(id_template) }, { sending_type: 1, _id: 1 })

                var [resultSms] = await templateSms.find({ templateId: id_template, isHandover: false })
                if (resultSms == undefined) {
                    var resultSms = []
                }

                var [resultWhatsapp] = await templateWhatsapp.find({ templateId: id_template, isHandover: false })
                if (resultWhatsapp == undefined) {
                    var resultWhatsapp = []
                }
                var [resultApi] = await templateApi.find({ templateId: id_template })
                if (resultApi == undefined) {
                    var resultApi = []
                }

                var integration = {
                    sms: resultSms,
                    whatsapp: resultWhatsapp,
                    api: resultApi
                }
                res.locals.result = result;
                res.locals.integration = integration
            }
        }
        var count = await templatefieldModel.count({ template_id: new ObjectId(id_template) }).sort(order);
        res.locals.count = count;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_by_template_field_id(req, res, next) {
    try {
        var _id = req.query.id;
        var result = await templatefieldModel.find({ template_id: new ObjectId(_id) }, { __v: 0, createdAt: 0, updatedAt: 0, id_user: 0, id_department: 0 });
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function delete_template_field(req, res, next) {
    try {
        var _id = req.query.id;
        var result = await templatefieldModel.deleteOne({ _id: new ObjectId(_id) });
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function get_all_did(req, res, next) {
    try {
        var id_user = req.token.id_user
        var id_department = req.token.id_department;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var departement_id = req.query.id_department;
        var sql = `select id,did from did where id_user = '${id_user}' `;
        if (isSubAdmin == 1) {
            if (departement_id != undefined) {
                sql += `and id_department = ${id_department}`;
            } else {
                sql += `and id_department in(${id_department}) `;
            }
        } else if (isDept == 1) {
            sql += `and id_department = '${req.token.id}' `;
        }
        var [result] = await getConnection.query(sql);
        res.locals.result = result;
        next()
    }
    catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_all_demo_did(req, res, next) {
    try {
        var sql = `SELECT did.*, did.type AS did_type,departments.name as department,ibl.name AS incoming_blacklist_name,obl.name AS outgoing_blacklist_name FROM did LEFT JOIN cc_blacklist AS ibl ON did.incoming_blacklist_id = ibl.id LEFT JOIN cc_blacklist AS obl ON did.outgoing_blacklist_id = obl.id LEFT JOIN departments  ON departments.id = did.id_department WHERE did.truecaller_spam = 1 `;
        var sqlCount = `SELECT COUNT(*) as count FROM did LEFT JOIN cc_blacklist AS ibl ON did.incoming_blacklist_id = ibl.id LEFT JOIN cc_blacklist AS obl ON did.outgoing_blacklist_id = obl.id WHERE did.truecaller_spam = 1`;
        var [result] = await getConnection.query(sql);
        var [total] = await getConnection.query(sqlCount);
        res.locals.result = result;
        res.locals.total = total[0].count;
        next()
    }
    catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_all_ivr(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var sql = `select id,name,id_user, id_dep as id_department,description from ivr where id_user = '${id_user}' `;
        if (isSubAdmin == 1) {
            sql += `where id_dep in(${id_department}) `;
        } else if (isDept == 1) {
            sql += `where id_dep = '${req.token.id}' `;
        }
        var [result] = await getConnection.query(sql);
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function get_phnbook_contacts_by_campaignId(req, res, next) {
    try {
        var agnet_id = req.token.id;
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        if (id_department != undefined) {
            id_department = id_department;
        } else {
            id_department = 0;
        }
        var limit = req.query.count;
        if (limit != undefined) limit = Number(limit);
        var skip = req.query.page;
        if (skip != undefined)
            skip = (skip - 1) * limit;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var date = `${yyyy}-${mm}-${dd}`
        var campaignId = req.query.campaignId;
        campaignId = Number(campaignId);
        var phnbookId = req.query.phnbookId;
        var gobal_duplicate_check = req.query.gobal_duplicate_check;
        var dnd_check = req.query.dnd_check;
        phnbookId = phnbookId.split(',');
        let callerId
        var callerIdSql = `SELECT cc_campaign.id,caller_id,did FROM cc_campaign join did on did.id = cc_campaign.caller_id WHERE cc_campaign.id = ${campaignId}`;
        var [callerIdRes] = await getConnection.query(callerIdSql);
        if (callerIdRes.length == 0) {
            var userDidSql = `SELECT us.user_id,us.did,us.did_type,d.did as didNumber FROM user_settings us LEFT JOIN did d ON us.did_type = 2 AND us.did = d.id WHERE us.user_id = ${agnet_id}`
            var [userDidRes] = await getConnection.query(userDidSql);
            if (userDidRes.length != 0) {
                if (userDidRes[0].didNumber != null) {
                    callerId = userDidRes[0].didNumber
                } else {
                    callerId = userDidRes[0].did
                }
            }
        } else {
            callerId = callerIdRes[0].did
        }
        var digit_2 = callerId.toString().substring(0, 2);
        var didSql = `SELECT pricing_plan,id_pay_per_calls_plans,id_pay_per_channel_plans,outgoing_call_ratecard_id FROM did where did like '${callerId}'`;
        var [didRes] = await sequelize.query(didSql);
        if (didRes[0].pricing_plan != 1 && didRes[0].id_pay_per_channel_plans != 1) {
            var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
            var [transRes] = await getConnection.query(transSql);
            console.log("transRes -------->", transRes)
            if (transRes.length != 0) {
                var transCredit = Math.abs(transRes[0].trans_credit);
                console.log("transCredit ----->", transCredit)
                if (transCredit <= 0) {
                    res.locals.result = "no balance";
                    next()
                } else {
                    var result = await phonebook_contactsModel.aggregate([
                        {
                            $lookup: {
                                from: 'contacts_statuses',
                                let: { contactId: '$_id' }, // Variables to use in the pipeline
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$contactId', '$$contactId'] },
                                            'phonebook_id': { $in: phnbookId }, 'campaignId': campaignId
                                        },
                                    },
                                ],
                                as: 'c_status'
                            }
                        },
                        {
                            $match: {
                                'phonebook_id': { $in: phnbookId },
                                // 'createdAt': { $gte: today, $lt: tomorrow },
                                'c_status': { $eq: [] }  // Check if status array is empty
                            },
                        },
                        {
                            $limit: limit,
                        }
                    ]);
                    if (result.length != 0) {
                        var obj = {
                            id_user: id_user,
                            id_department: id_department,
                            phonebook_id: result[0].phonebook_id,
                            campaignId: campaignId,
                            contactId: result[0]._id,
                            status: 0,
                            retryCount: 1,
                            attempt: 1,
                            phone_number: result[0].phone_number
                        }
                        var insertContacts = await contactStatusModel.create(obj);
                        if (gobal_duplicate_check == 1) {                                  // for gobal_duplicate_checking
                            var checkingSql = await contactStatusModel.find({ $and: [{ phone_number: result[0].phone_number }, { id_user: id_user }, { id_department: id_department }, { campaignId: campaignId }, { contactId: { $ne: ObjectId(result[0]._id) } }] });
                            if (checkingSql.length != 0) {
                                var update = await contactStatusModel.updateOne({ _id: new ObjectId(insertContacts._id) }, { $set: { duplicate: 1 } })
                                var campaignSummarySql = `UPDATE cc_campaign_call_summary SET duplicate = duplicate + 1 WHERE campaign_id = '${campaignId}' AND phonebook_id = '${result[0].phonebook_id}' AND user_id = '${agnet_id}' AND DATE(createdAt) = '${date}'`;
                                var campaignSummary = await sequelize.query(campaignSummarySql);
                                var result = await get_phnbook_contacts_by_campaignId_duplicate(req, res, next)
                            } else {
                                if (result.length != 0) {
                                    result[0].contactStatusId = insertContacts._id;
                                    var phnNo = result[0].phone_number;
                                    var limitRes = req.query.settings
                                    var leadRes = await leadModel.find({ phnNo: phnNo }).limit(limitRes);
                                    var leadCount = await leadModel.count({ phnNo: phnNo }).limit(limitRes);
                                    var customRes = await agentModel.find({ phnNo: phnNo }).limit(limitRes);
                                    var customCount = await agentModel.count({ phnNo: phnNo }).limit(limitRes);
                                    var ticketRes = await ticketsModel.find({ phnNo: phnNo }).limit(limitRes);
                                    var ticketCount = await ticketsModel.count({ phnNo: phnNo }).limit(limitRes);
                                    if (req.token.phn_number_mask == 1) {

                                        var phn_num = await string_encode(result[0].phone_number);
                                        if (phn_num) {
                                            var phn = phn_num;
                                        } else {
                                            var phn = result[0].phone_number;
                                        }
                                        result[0].phone_number = phn;
                                        res.locals.result = result;
                                    } else {
                                        res.locals.result = result;
                                    }
                                    res.locals.data = { leads: leadRes, customers: customRes, tickets: ticketRes };
                                    res.locals.count = { leads: leadCount, customers: customCount, tickets: ticketCount };
                                    next()
                                } else {
                                    res.locals.result = [];
                                    res.locals.data = { leads: [], customers: [], tickets: [] };
                                    res.locals.count = { leads: [], customers: [], tickets: [] };
                                    next()
                                }
                            }
                        } else {
                            if (result.length != 0) {
                                result[0].contactStatusId = insertContacts._id;
                                var phnNo = result[0].phone_number;
                                var limitRes = req.query.settings;
                                var leadRes = await leadModel.find({ phnNo: phnNo }).limit(limitRes);
                                var leadCount = await leadModel.count({ phnNo: phnNo }).limit(limitRes);
                                var customRes = await agentModel.find({ phnNo: phnNo }).limit(limitRes);
                                var customCount = await agentModel.count({ phnNo: phnNo }).limit(limitRes);
                                var ticketRes = await ticketsModel.find({ phnNo: phnNo }).limit(limitRes);
                                var ticketCount = await ticketsModel.count({ phnNo: phnNo }).limit(limitRes);
                                if (req.token.phn_number_mask == 1) {
                                    var pn = await string_encode(result[0].phone_number);
                                    if (pn) {
                                        var phn = pn;
                                    } else {
                                        var phn = result[0].phone_number;
                                    }
                                    result[0].phone_number = phn;
                                    res.locals.result = result;
                                } else {
                                    res.locals.result = result;
                                }
                                res.locals.data = { leads: leadRes, customers: customRes, tickets: ticketRes };
                                res.locals.count = { leads: leadCount, customers: customCount, tickets: ticketCount };
                                next()
                            } else {
                                res.locals.result = [];
                                res.locals.data = { leads: [], customers: [], tickets: [] };
                                res.locals.count = { leads: [], customers: [], tickets: [] };
                                next()
                            }
                        }
                    } else {
                        res.locals.result = [];
                        res.locals.data = { leads: [], customers: [], tickets: [] };
                        res.locals.count = { leads: [], customers: [], tickets: [] };
                        next()
                    }
                }
            }
        } else {
            if (digit_2 != "91") {
                var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                var [transRes] = await getConnection.query(transSql);
                console.log("transRes -------->", transRes)
                if (transRes.length != 0) {
                    var transCredit = Math.abs(transRes[0].trans_credit);
                    console.log("transCredit ----->", transCredit)
                    if (transCredit <= 0) {
                        res.locals.result = "no balance";
                        next()
                    } else {
                        var result = await phonebook_contactsModel.aggregate([
                            {
                                $lookup: {
                                    from: 'contacts_statuses',
                                    let: { contactId: '$_id' }, // Variables to use in the pipeline
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: { $eq: ['$contactId', '$$contactId'] },
                                                'phonebook_id': { $in: phnbookId }, 'campaignId': campaignId
                                            },
                                        },
                                    ],
                                    as: 'c_status'
                                }
                            },
                            {
                                $match: {
                                    'phonebook_id': { $in: phnbookId },
                                    // 'createdAt': { $gte: today, $lt: tomorrow },
                                    'c_status': { $eq: [] }  // Check if status array is empty
                                },
                            },
                            {
                                $limit: limit,
                            }
                        ]);
                        if (result.length != 0) {
                            var obj = {
                                id_user: id_user,
                                id_department: id_department,
                                phonebook_id: result[0].phonebook_id,
                                campaignId: campaignId,
                                contactId: result[0]._id,
                                status: 0,
                                retryCount: 1,
                                attempt: 1,
                                phone_number: result[0].phone_number
                            }
                            var insertContacts = await contactStatusModel.create(obj);
                            if (gobal_duplicate_check == 1) {                                  // for gobal_duplicate_checking
                                var checkingSql = await contactStatusModel.find({ $and: [{ phone_number: result[0].phone_number }, { id_user: id_user }, { id_department: id_department }, { campaignId: campaignId }, { contactId: { $ne: ObjectId(result[0]._id) } }] });
                                if (checkingSql.length != 0) {
                                    var update = await contactStatusModel.updateOne({ _id: new ObjectId(insertContacts._id) }, { $set: { duplicate: 1 } })
                                    var campaignSummarySql = `UPDATE cc_campaign_call_summary SET duplicate = duplicate + 1 WHERE campaign_id = '${campaignId}' AND phonebook_id = '${result[0].phonebook_id}' AND user_id = '${agnet_id}' AND DATE(createdAt) = '${date}'`;
                                    var campaignSummary = await sequelize.query(campaignSummarySql);
                                    var result = await get_phnbook_contacts_by_campaignId_duplicate(req, res, next)
                                } else {
                                    if (result.length != 0) {
                                        result[0].contactStatusId = insertContacts._id;
                                        var phnNo = result[0].phone_number;
                                        var limitRes = req.query.settings
                                        var leadRes = await leadModel.find({ phnNo: phnNo }).limit(limitRes);
                                        var leadCount = await leadModel.count({ phnNo: phnNo }).limit(limitRes);
                                        var customRes = await agentModel.find({ phnNo: phnNo }).limit(limitRes);
                                        var customCount = await agentModel.count({ phnNo: phnNo }).limit(limitRes);
                                        var ticketRes = await ticketsModel.find({ phnNo: phnNo }).limit(limitRes);
                                        var ticketCount = await ticketsModel.count({ phnNo: phnNo }).limit(limitRes);
                                        if (req.token.phn_number_mask == 1) {

                                            var phn_num = await string_encode(result[0].phone_number);
                                            if (phn_num) {
                                                var phn = phn_num;
                                            } else {
                                                var phn = result[0].phone_number;
                                            }
                                            result[0].phone_number = phn;
                                            res.locals.result = result;
                                        } else {
                                            res.locals.result = result;
                                        }
                                        res.locals.data = { leads: leadRes, customers: customRes, tickets: ticketRes };
                                        res.locals.count = { leads: leadCount, customers: customCount, tickets: ticketCount };
                                        next()
                                    } else {
                                        res.locals.result = [];
                                        res.locals.data = { leads: [], customers: [], tickets: [] };
                                        res.locals.count = { leads: [], customers: [], tickets: [] };
                                        next()
                                    }
                                }
                            } else {
                                if (result.length != 0) {
                                    result[0].contactStatusId = insertContacts._id;
                                    var phnNo = result[0].phone_number;
                                    var limitRes = req.query.settings;
                                    var leadRes = await leadModel.find({ phnNo: phnNo }).limit(limitRes);
                                    var leadCount = await leadModel.count({ phnNo: phnNo }).limit(limitRes);
                                    var customRes = await agentModel.find({ phnNo: phnNo }).limit(limitRes);
                                    var customCount = await agentModel.count({ phnNo: phnNo }).limit(limitRes);
                                    var ticketRes = await ticketsModel.find({ phnNo: phnNo }).limit(limitRes);
                                    var ticketCount = await ticketsModel.count({ phnNo: phnNo }).limit(limitRes);
                                    if (req.token.phn_number_mask == 1) {
                                        var pn = await string_encode(result[0].phone_number);
                                        if (pn) {
                                            var phn = pn;
                                        } else {
                                            var phn = result[0].phone_number;
                                        }
                                        result[0].phone_number = phn;
                                        res.locals.result = result;
                                    } else {
                                        res.locals.result = result;
                                    }
                                    res.locals.data = { leads: leadRes, customers: customRes, tickets: ticketRes };
                                    res.locals.count = { leads: leadCount, customers: customCount, tickets: ticketCount };
                                    next()
                                } else {
                                    res.locals.result = [];
                                    res.locals.data = { leads: [], customers: [], tickets: [] };
                                    res.locals.count = { leads: [], customers: [], tickets: [] };
                                    next()
                                }
                            }
                        } else {
                            res.locals.result = [];
                            res.locals.data = { leads: [], customers: [], tickets: [] };
                            res.locals.count = { leads: [], customers: [], tickets: [] };
                            next()
                        }
                    }
                }
            } else {
                var result = await phonebook_contactsModel.aggregate([
                    {
                        $lookup: {
                            from: 'contacts_statuses',
                            let: { contactId: '$_id' }, // Variables to use in the pipeline
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ['$contactId', '$$contactId'] },
                                        'phonebook_id': { $in: phnbookId }, 'campaignId': campaignId
                                    },
                                },
                            ],
                            as: 'c_status'
                        }
                    },
                    {
                        $match: {
                            'phonebook_id': { $in: phnbookId },
                            // 'createdAt': { $gte: today, $lt: tomorrow },
                            'c_status': { $eq: [] }  // Check if status array is empty
                        },
                    },
                    {
                        $limit: limit,
                    }
                ]);
                if (result.length != 0) {
                    var obj = {
                        id_user: id_user,
                        id_department: id_department,
                        phonebook_id: result[0].phonebook_id,
                        campaignId: campaignId,
                        contactId: result[0]._id,
                        status: 0,
                        retryCount: 1,
                        attempt: 1,
                        phone_number: result[0].phone_number
                    }
                    var insertContacts = await contactStatusModel.create(obj);
                    if (gobal_duplicate_check == 1) {                                  // for gobal_duplicate_checking
                        var checkingSql = await contactStatusModel.find({ $and: [{ phone_number: result[0].phone_number }, { id_user: id_user }, { id_department: id_department }, { campaignId: campaignId }, { contactId: { $ne: ObjectId(result[0]._id) } }] });
                        if (checkingSql.length != 0) {
                            var update = await contactStatusModel.updateOne({ _id: new ObjectId(insertContacts._id) }, { $set: { duplicate: 1 } })
                            var campaignSummarySql = `UPDATE cc_campaign_call_summary SET duplicate = duplicate + 1 WHERE campaign_id = '${campaignId}' AND phonebook_id = '${result[0].phonebook_id}' AND user_id = '${agnet_id}' AND DATE(createdAt) = '${date}'`;
                            var campaignSummary = await sequelize.query(campaignSummarySql);
                            var result = await get_phnbook_contacts_by_campaignId_duplicate(req, res, next)
                        } else {
                            if (result.length != 0) {
                                result[0].contactStatusId = insertContacts._id;
                                var phnNo = result[0].phone_number;
                                var limitRes = req.query.settings
                                var leadRes = await leadModel.find({ phnNo: phnNo }).limit(limitRes);
                                var leadCount = await leadModel.count({ phnNo: phnNo }).limit(limitRes);
                                var customRes = await agentModel.find({ phnNo: phnNo }).limit(limitRes);
                                var customCount = await agentModel.count({ phnNo: phnNo }).limit(limitRes);
                                var ticketRes = await ticketsModel.find({ phnNo: phnNo }).limit(limitRes);
                                var ticketCount = await ticketsModel.count({ phnNo: phnNo }).limit(limitRes);
                                if (req.token.phn_number_mask == 1) {

                                    var phn_num = await string_encode(result[0].phone_number);
                                    if (phn_num) {
                                        var phn = phn_num;
                                    } else {
                                        var phn = result[0].phone_number;
                                    }
                                    result[0].phone_number = phn;
                                    res.locals.result = result;
                                } else {
                                    res.locals.result = result;
                                }
                                res.locals.data = { leads: leadRes, customers: customRes, tickets: ticketRes };
                                res.locals.count = { leads: leadCount, customers: customCount, tickets: ticketCount };
                                next()
                            } else {
                                res.locals.result = [];
                                res.locals.data = { leads: [], customers: [], tickets: [] };
                                res.locals.count = { leads: [], customers: [], tickets: [] };
                                next()
                            }
                        }
                    } else {
                        if (result.length != 0) {
                            result[0].contactStatusId = insertContacts._id;
                            var phnNo = result[0].phone_number;
                            var limitRes = req.query.settings;
                            var leadRes = await leadModel.find({ phnNo: phnNo }).limit(limitRes);
                            var leadCount = await leadModel.count({ phnNo: phnNo }).limit(limitRes);
                            var customRes = await agentModel.find({ phnNo: phnNo }).limit(limitRes);
                            var customCount = await agentModel.count({ phnNo: phnNo }).limit(limitRes);
                            var ticketRes = await ticketsModel.find({ phnNo: phnNo }).limit(limitRes);
                            var ticketCount = await ticketsModel.count({ phnNo: phnNo }).limit(limitRes);
                            if (req.token.phn_number_mask == 1) {
                                var pn = await string_encode(result[0].phone_number);
                                if (pn) {
                                    var phn = pn;
                                } else {
                                    var phn = result[0].phone_number;
                                }
                                result[0].phone_number = phn;
                                res.locals.result = result;
                            } else {
                                res.locals.result = result;
                            }
                            res.locals.data = { leads: leadRes, customers: customRes, tickets: ticketRes };
                            res.locals.count = { leads: leadCount, customers: customCount, tickets: ticketCount };
                            next()
                        } else {
                            res.locals.result = [];
                            res.locals.data = { leads: [], customers: [], tickets: [] };
                            res.locals.count = { leads: [], customers: [], tickets: [] };
                            next()
                        }
                    }
                } else {
                    res.locals.result = [];
                    res.locals.data = { leads: [], customers: [], tickets: [] };
                    res.locals.count = { leads: [], customers: [], tickets: [] };
                    next()
                }
            }
        }

    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_phnbook_contacts_by_campaignId_duplicate(req, res, next) {
    try {
        var agnet_id = req.token.id;
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        if (id_department != undefined) {
            id_department = id_department;
        } else {
            id_department = 0;
        }
        var campaignId = req.query.campaignId;
        campaignId = Number(campaignId);
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var date = `${yyyy}-${mm}-${dd}`
        var phnbook_Id = req.query.phnbookId;
        var gobal_duplicate_check = req.query.gobal_duplicate_check;
        var dnd_check = req.query.dnd_check;
        phnbook_Id = phnbook_Id.split(',');
        var phnbookId = phnbook_Id.map((element) => parseInt(element));
        var result = await phonebook_contactsModel.aggregate([
            {
                $lookup: {
                    from: 'contacts_statuses',
                    let: { contactId: '$_id' }, // Variables to use in the pipeline
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$contactId', '$$contactId'] },
                                'phonebook_id': { $in: phnbookId }, 'campaignId': campaignId
                            },
                        },
                    ],
                    as: 'c_status'
                }
            },
            {
                $match: {
                    'phonebook_id': { $in: phnbookId },
                    // 'createdAt': { $gte: today, $lt: tomorrow },
                    'c_status': { $eq: [] }  // Check if status array is empty
                },
            },
            {
                $limit: 1,
            }
        ]);
        if (result.length != 0) {
            var obj = {
                id_user: id_user,
                id_department: id_department,
                phonebook_id: result[0].phonebook_id,
                campaignId: campaignId,
                contactId: result[0]._id,
                status: 0,
                retryCount: 1,
                attempt: 1,
                phone_number: result[0].phone_number
            }
            var insertContacts = await contactStatusModel.create(obj);
            result[0].contactStatusId = insertContacts._id;
            if (gobal_duplicate_check == 1) {
                var checkingSql = await contactStatusModel.find({ $and: [{ phone_number: result[0].phone_number }, { id_user: id_user }, { id_department: id_department }, { campaignId: campaignId }, { contactId: { $ne: ObjectId(result[0]._id) } }] });
                if (checkingSql.length != 0) {
                    var update = await contactStatusModel.updateOne({ _id: new ObjectId(insertContacts._id) }, { $set: { duplicate: 1 } })
                    var campaignSummarySql = `UPDATE cc_campaign_call_summary SET duplicate = duplicate + 1 WHERE campaign_id = '${campaignId}' AND phonebook_id = '${result[0].phonebook_id}' AND user_id = '${agnet_id}' AND DATE(createdAt) = '${date}'`;
                    var campaignSummary = await sequelize.query(campaignSummarySql);
                    var result = await get_phnbook_contacts_by_campaignId_duplicate(req, res, next)
                } else {
                    if (result.length != 0) {
                        result[0].contactStatusId = insertContacts._id;
                        var phnNo = result[0].phone_number;
                        var limitRes = req.query.settings;
                        var leadRes = await leadModel.find({ phnNo: phnNo }).limit(limitRes);
                        var leadCount = await leadModel.count({ phnNo: phnNo }).limit(limitRes);
                        var customRes = await agentModel.find({ phnNo: phnNo }).limit(limitRes);
                        var customCount = await agentModel.count({ phnNo: phnNo }).limit(limitRes);
                        var ticketRes = await ticketsModel.find({ phnNo: phnNo }).limit(limitRes);
                        var ticketCount = await ticketsModel.count({ phnNo: phnNo }).limit(limitRes);
                        if (req.token.phn_number_mask == 1) {
                            var phoneNum = await string_encode(result[0].phone_number);
                            if (phoneNum) {
                                var phn = phoneNum;
                            } else {
                                var phn = result[0].phone_number;
                            }
                            result[0].phone_number = phn;
                            res.locals.result = result;
                        } else {
                            res.locals.result = result;
                        }
                        res.locals.data = { leads: leadRes, customers: customRes, tickets: ticketRes };
                        res.locals.count = { leads: leadCount, customers: customCount, tickets: ticketCount };
                        next()
                    } else {
                        res.locals.result = [];
                        res.locals.data = { leads: [], customers: [], tickets: [] };
                        res.locals.count = { leads: [], customers: [], tickets: [] };
                        next()
                    }
                }
            } else {
                if (result.length != 0) {
                    result[0].contactStatusId = insertContacts._id;
                    var phnNo = result[0].phone_number;
                    var limitRes = req.query.settings;
                    var leadRes = await leadModel.find({ phnNo: phnNo }).limit(limitRes);
                    var leadCount = await leadModel.count({ phnNo: phnNo }).limit(limitRes);
                    var customRes = await agentModel.find({ phnNo: phnNo }).limit(limitRes);
                    var customCount = await agentModel.count({ phnNo: phnNo }).limit(limitRes);
                    var ticketRes = await ticketsModel.find({ phnNo: phnNo }).limit(limitRes);
                    var ticketCount = await ticketsModel.count({ phnNo: phnNo }).limit(limitRes);
                    if (req.token.phn_number_mask == 1) {
                        var phNumb = await string_encode(result[0].phone_number);
                        if (phNumb) {
                            var phn = phNumb;
                        } else {
                            var phn = result[0].phone_number;

                        }
                        result[0].phone_number = phn;
                        res.locals.result = result;
                    } else {
                        res.locals.result = result;
                    }
                    res.locals.data = { leads: leadRes, customers: customRes, tickets: ticketRes };
                    res.locals.count = { leads: leadCount, customers: customCount, tickets: ticketCount };
                    next()
                } else {
                    res.locals.result = [];
                    res.locals.data = { leads: [], customers: [], tickets: [] };
                    res.locals.count = { leads: [], customers: [], tickets: [] };
                    next()
                }
            }
        } else {
            res.locals.result = [];
            res.locals.data = { leads: [], customers: [], tickets: [] };
            res.locals.count = { leads: [], customers: [], tickets: [] };
            next()
        }
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function insert_contact_status(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        if (id_department != undefined) {
            id_department = id_department;
        } else {
            id_department = 0;
        }
        var contacts = req.body;
        contacts.id_user = id_user;
        contacts.id_department = id_department;
        var currentDate = new Date();
        var decreasedTime = currentDate.getTime();
        var createdAtDate = new Date(decreasedTime);
        contacts.createdAt = createdAtDate;
        var insertContacts = await contactStatusModel.create(contacts);
        res.locals.result = insertContacts;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function delete_contact_status(req, res, next) {
    try {
        var contactId = req.query.contactId;
        var campaignId = req.query.campaignId;
        var result = await contactStatusModel.deleteMany({ _id: new ObjectId(contactId) }, { campaignId: campaignId });
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function skip_contact_status(req, res, next) {
    try {
        var _id = req.query.id
        var campaignId = req.query.campaignId;
        var phonebookId = req.query.phonebook_id;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var date = `${yyyy}-${mm}-${dd}`
        var update = await contactStatusModel.updateOne({ _id: new ObjectId(_id) }, { $set: { status: 4 }, $inc: { retryCount: 1, attempt: 1 } });
        var campaignSummary = `UPDATE cc_campaign_call_summary SET skip = skip + 1 WHERE campaign_id = '${campaignId}' and user_id = '${req.token.id}' and phonebook_id = '${phonebookId}' `
        var [campaignSummaryRes] = await sequelize.query(campaignSummary);
        res.locals.result = update;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function update_contact_status(req, res, next) {
    try {
        var _id = req.query.id
        var update = await contactStatusModel.updateOne({ _id: new ObjectId(_id) }, { $set: { status: 1 } });
        res.locals.result = update;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function add_campaign_call_summary(req, res, next) {
    try {
        var campaign = req.body;
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var id_agent = req.token.id;
        if (id_department != undefined) {
            campaign.id_department = id_department;
        } else {
            campaign.id_department = 0;
        }
        campaign.id_user = id_user;
        campaign.agent_id = id_agent;
        var addcampaign = await campaignCallSummaryModel.create(campaign);
        res.locals.result = addcampaign;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function update_campaign_call_summary(campaign, id, campaignId, phonebookId) {
    try {
        var id_agent = req.token.id;
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        if (id_department != undefined) {
            campaign.id_department = id_department;
        } else {
            campaign.id_department = 0;
        }
        campaign.id_user = id_user;
        campaign.agent_id = id_agent;
        campaign.campaign_id = campaignId;
        campaign.phonebook_id = phonebookId;
        var result = await campaignCallSummaryModel.update(campaign, { where: { id: id, campaign_id: campaignId, agent_id: id_agent, phonebook_id: phonebookId } });
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_campaign_call_summary(req, res, next) {
    try {
        var limit = Number(req.query.count);
        var skip = req.query.page;
        skip = (skip - 1) * limit;
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        if (id_department == undefined) {
            id_department = 0;
        }
        var filter = req.query.filter;
        var phonebookId = req.query.phonebookId;
        var agentId = req.query.agentId;
        var campaignId = req.query.campaignId;
        var filterBy = req.query.filterby;
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1
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
        }
        else {
            var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
            var End = `${yyyy}-${mm}-${dd} 23:59:59`;
        }
        if (filter == 'agent') {
            var campaign = `select cc_campaign_call_summary.id, cc_campaign_call_summary.id_user,cc_campaign_call_summary.id_department,cc_campaign_call_summary.phonebook_id,cc_campaign_call_summary.user_id as agent_id,regNumber,cc_campaign_call_summary.campaign_id,SUM(connected_count) as connected_count,SUM(notconnected_count) as notconnected_count,SUM(busy) as busy,SUM(live_calls) as live_calls,SUM(agent_on_live) as agent_on_live,SUM(ACW) as ACW,SUM(connected_duration) as connected_duration,SUM(total_duration) as total_duration,SUM(call_delay) as call_delay,cc_campaign_call_summary.createdAt as date,`
            campaign += `phonebook.pbname as phonebook_name,cc_campaign.name as campaignName from cc_campaign_call_summary JOIN phonebook ON cc_campaign_call_summary.phonebook_id = phonebook.id JOIN cc_campaign ON cc_campaign_call_summary.campaign_id = cc_campaign.id  where cc_campaign_call_summary.id_user = '${id_user}' and cc_campaign_call_summary.id_department = '${id_department}' and cc_campaign_call_summary.createdAt between '${Start}' and '${End}' `
            if (phonebookId != undefined) {
                campaign += `and cc_campaign_call_summary.phonebook_id like '%${phonebookId}%' `;
            }
            if (agentId != undefined) {
                campaign += `and cc_campaign_call_summary.user_id like '%${agentId}%' `;
            }
            if (campaignId != undefined) {
                campaign += `and cc_campaign_call_summary.campaign_id like '%${campaignId}%' `;
            }
            if (filterBy == 'campaign') {
                campaign += `GROUP BY cc_campaign_call_summary.campaign_id,cc_campaign_call_summary.user_id `;
            } else if (filterBy == 'phonebook') {
                campaign += `GROUP BY cc_campaign_call_summary.user_id,cc_campaign_call_summary.phonebook_id `;
            } else {
                campaign += `GROUP BY cc_campaign_call_summary.user_id `;
            }
        }
        if (filter == 'phonebook') {
            var campaign = `select cc_campaign_call_summary.id, cc_campaign_call_summary.id_user,cc_campaign_call_summary.id_department,cc_campaign_call_summary.phonebook_id,cc_campaign_call_summary.user_id as agent_id,regNumber,cc_campaign_call_summary.campaign_id,SUM(connected_count) as connected_count,SUM(notconnected_count) as notconnected_count,SUM(busy) as busy,SUM(live_calls) as live_calls,SUM(agent_on_live) as agent_on_live,SUM(ACW) as ACW,SUM(connected_duration) as connected_duration,SUM(total_duration) as total_duration,SUM(call_delay) as call_delay,cc_campaign_call_summary.createdAt as date,`
            campaign += `phonebook.pbname as phonebook_name,cc_campaign.name as campaignName from cc_campaign_call_summary JOIN phonebook ON cc_campaign_call_summary.phonebook_id = phonebook.id JOIN cc_campaign ON cc_campaign_call_summary.campaign_id = cc_campaign.id  where cc_campaign_call_summary.id_user = '${id_user}' and cc_campaign_call_summary.id_department = '${id_department}' and cc_campaign_call_summary.createdAt between '${Start}' and '${End}' `
            if (phonebookId != undefined) {
                campaign += `and cc_campaign_call_summary.phonebook_id like '%${phonebookId}%' `;
            }
            if (agentId != undefined) {
                campaign += `and cc_campaign_call_summary.user_id like '%${agentId}%' `;
            }
            if (campaignId != undefined) {
                campaign += `and cc_campaign_call_summary.campaign_id like '%${campaignId}%' `;
            }
            if (filterBy == 'agent') {
                campaign += `GROUP BY cc_campaign_call_summary.phonebook_id,cc_campaign_call_summary.user_id `;
            }
            else if (filterBy == 'campaign') {
                campaign += `GROUP BY cc_campaign_call_summary.phonebook_id,cc_campaign_call_summary.campaign_id`;
            }
            else {
                campaign += `GROUP BY cc_campaign_call_summary.phonebook_id `;
            }
        }
        if (filter == 'campaign') {
            var campaign = `select cc_campaign_call_summary.id, cc_campaign_call_summary.id_user,cc_campaign_call_summary.id_department,cc_campaign_call_summary.phonebook_id,cc_campaign_call_summary.user_id as agent_id,regNumber,cc_campaign_call_summary.campaign_id,SUM(connected_count) as connected_count,SUM(notconnected_count) as notconnected_count,SUM(busy) as busy,SUM(live_calls) as live_calls,SUM(agent_on_live) as agent_on_live,SUM(ACW) as ACW,SUM(connected_duration) as connected_duration,SUM(total_duration) as total_duration,SUM(call_delay) as call_delay,cc_campaign_call_summary.createdAt as date,`
            campaign += `phonebook.pbname as phonebook_name,cc_campaign.name as campaignName from cc_campaign_call_summary JOIN phonebook ON cc_campaign_call_summary.phonebook_id = phonebook.id JOIN cc_campaign ON cc_campaign_call_summary.campaign_id = cc_campaign.id  where cc_campaign_call_summary.id_user = '${id_user}' and cc_campaign_call_summary.id_department = '${id_department}' and cc_campaign_call_summary.createdAt between '${Start}' and '${End}' `;
            if (phonebookId != undefined) {
                campaign += `and cc_campaign_call_summary.phonebook_id like '%${phonebookId}%' `;
            }
            if (agentId != undefined) {
                campaign += `and cc_campaign_call_summary.user_id like '%${agentId}%' `;
            }
            if (campaignId != undefined) {
                campaign += `and cc_campaign_call_summary.campaign_id like '%${campaignId}%' `;
            }
            if (filterBy == 'agent') {
                campaign += `GROUP BY cc_campaign_call_summary.campaign_id,cc_campaign_call_summary.user_id `;
            } else if (filterBy == 'phonebook') {
                campaign += `GROUP BY cc_campaign_call_summary.campaign_id,cc_campaign_call_summary.phonebook_id `;
            } else {
                campaign += `GROUP BY cc_campaign_call_summary.campaign_id `;
            }
        }
        campaign += `order by cc_campaign_call_summary.id desc `;
        var [campaignRes] = await getConnection.query(campaign);
        res.locals.result = campaignRes;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_by_campaign_call_summary(req, res, next) {
    try {
        var id = req.query.id;
        var campaign = await campaignCallSummaryModel.findOne({ where: { id: id } });
        res.locals.result = campaign;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function delete_campaign_call_summary(req, res, next) {
    try {
        var id = req.query.id;
        var campaign = await campaignCallSummaryModel.destroy({ where: { id: id } });
        res.locals.result = campaign;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function update_counts(req, res, next) {
    try {
        var campaignId = req.body.campaignId;
        var agent_id = req.body.agent_id;
        var phonebookId = req.body.phonebookId;
        var name = req.body.name;
        var value = Number(req.body.value);
        if (name != undefined && value != undefined) {
            var count = `SELECT ${name} as name FROM cc_campaign_call_summary WHERE campaign_id = '${campaignId}' AND user_id = '${agent_id}' AND phonebook_id = '${phonebookId}'`;
            var [countRes] = await getConnection.query(count);
            var updatedCount = countRes[0].name + value;
            var updateSql = `UPDATE cc_campaign_call_summary SET ${name}  = '${updatedCount}' WHERE campaign_id = '${campaignId}' AND user_id = '${agent_id}' AND phonebook_id = '${phonebookId}'`
            var [updateRes] = await sequelize.query(updateSql);
            res.locals.result = updateRes;
        }
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function add_campaign_outgoingcall(req, res, next) {
    try {
        var outgoingcall = req.body;
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var id_agent = req.token.id;
        if (id_department != undefined) {
            outgoingcall.id_department = id_department;
        } else {
            outgoingcall.id_department = 0;
        }
        outgoingcall.id_user = id_user;
        outgoingcall.id_agent = id_agent;
        var addoutgoing = await campaignOutgoingModel.create(outgoingcall);
        res.locals.result = addoutgoing;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function update_campaign_outgoingcall(req, res, next) {
    try {
        var outgoingcall = req.body;
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var id_agent = req.token.id;
        if (id_department != undefined) {
            outgoingcall.id_department = id_department;
        } else {
            outgoingcall.id_department = 0;
        }
        outgoingcall.id_user = id_user;
        outgoingcall.id_agent = id_agent;
        var id = req.query.id;
        var addoutgoing = await campaignOutgoingModel.update(outgoingcall, { where: { id: id } });
        res.locals.result = addoutgoing;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_campaign_outgoingcall(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var limit = Number(req.query.count);
        var skip = req.query.page;
        skip = (skip - 1) * limit;
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var campaignId = req.query.campaignId;
        var callerid = req.query.callerid;
        var destination = req.query.destination;
        var fromDuration = req.query.fromDuration;
        var toDuration = req.query.toDuration;
        var fromTime = req.query.fromTime;
        var toTime = req.query.toTime;
        var id_agent = req.query.agentId;
        var status = req.query.status;
        var filterBy = req.query.filterBy;
        var fromdatetime = new Date();
        var todatetime = new Date();
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1
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
        }else if(filterBy != undefined){
            if (filterBy == "yesterday") {
                todatetime.setDate(todatetime.getDate() - 1)
                fromdatetime.setDate(fromdatetime.getDate() - 1)
            }
            if (filterBy == "thisweek") {
                let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
                fromdatetime = weekStart
                todatetime = weekEnd
                console.log("Week Start:", weekStart);
                console.log("Week End:", weekEnd);          
            }
            if (filterBy == "thismonth") {
                let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
                fromdatetime = monthStart
                todatetime = monthEnd
                console.log("Month Start:", monthStart);
                console.log("Month End:", monthEnd);
            }
            var currentdate = fromdatetime.getDate().toString().padStart(2, '0');
            var currentMnth = (fromdatetime.getMonth() + 1).toString().padStart(2, '0');
            var year = fromdatetime.getFullYear();
            var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
            var currentdateEnd = todatetime.getDate().toString().padStart(2, '0');
            var currentMnthEnd = (todatetime.getMonth() + 1).toString().padStart(2, '0');
            var yearEnd = todatetime.getFullYear();
            var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
            console.log("Start :", Start);
            console.log("End :", End);
        } else {
            var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
            var End = `${yyyy}-${mm}-${dd} 23:59:59`;
        }
        var sqlCount = `SELECT count(cc_campaign_outgoing_reports.id) as outgoingcall FROM cc_campaign_outgoing_reports LEFT JOIN user ON user.id = cc_campaign_outgoing_reports.user_id left join campaign_settings on campaign_settings.campaign_id = cc_campaign_outgoing_reports.id_campaign LEFT JOIN cc_campaign on cc_campaign.id = cc_campaign_outgoing_reports.id_campaign where cc_campaign_outgoing_reports.createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        var sql = `SELECT cc_campaign_outgoing_reports.id,cc_campaign_outgoing_reports.id_user,cc_campaign_outgoing_reports.id_department,cc_campaign_outgoing_reports.user_id,cc_campaign_outgoing_reports.id_campaign,cc_campaign_outgoing_reports.id_contact,cc_campaign_outgoing_reports.answeredTime,cc_campaign_outgoing_reports.call_start_time,cc_campaign_outgoing_reports.call_endtime,cc_campaign_outgoing_reports.uniqueid,cc_campaign_outgoing_reports.user,cc_campaign_outgoing_reports.destination,cc_campaign_outgoing_reports.callerid,cc_campaign_outgoing_reports.duration,cc_campaign_outgoing_reports.cost,cc_campaign_outgoing_reports.callStatus,cc_campaign_outgoing_reports.cr_status,cc_campaign_outgoing_reports.cr_file,cc_campaign_outgoing_reports.dialType,cc_campaign_outgoing_reports.retryStatus,cc_campaign_outgoing_reports.route,cc_campaign_outgoing_reports.type,cc_campaign_outgoing_reports.acw_time,cc_campaign_outgoing_reports.hold_time,cc_campaign_outgoing_reports.call_delay,cc_campaign_outgoing_reports.delay_time,cc_campaign_outgoing_reports.hangup_by,cc_campaign_outgoing_reports.dtmfSeq,cc_campaign_outgoing_reports.acw,cc_campaign_outgoing_reports.reminder,cc_campaign_outgoing_reports.retry_count,cc_campaign_outgoing_reports.total_duration,cc_campaign_outgoing_reports.createdAt,CONCAT(user.first_name, ' ', user.last_name) AS agent,cc_campaign.name as campaignName,campaign_settings.phn_number_mask FROM cc_campaign_outgoing_reports LEFT JOIN user ON user.id = cc_campaign_outgoing_reports.user_id left join campaign_settings on campaign_settings.campaign_id = cc_campaign_outgoing_reports.id_campaign LEFT JOIN cc_campaign on cc_campaign.id = cc_campaign_outgoing_reports.id_campaign where cc_campaign_outgoing_reports.createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        if (isSubAdmin == 1) {
            sql += `and cc_campaign_outgoing_reports.id_department in(${id_department}) `;
            sqlCount += `and cc_campaign_outgoing_reports.id_department in(${id_department}) `;
        } else if (isDept == 1) {
            sql += `and cc_campaign_outgoing_reports.id_department = '${req.token.id}' `;
            sqlCount += `and cc_campaign_outgoing_reports.id_department = '${req.token.id}' `;
        }
        if (id_agent != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.user_id = '${id_agent}' `;
            sql += `and cc_campaign_outgoing_reports.user_id = '${id_agent}' `;
        }
        if (campaignId != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.id_campaign = '${campaignId}' `;
            sql += `and cc_campaign_outgoing_reports.id_campaign = '${campaignId}' `;
        }
        if (callerid != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.callerid like '%${callerid}%' `;
            sql += `and cc_campaign_outgoing_reports.callerid like '%${callerid}%' `;
        }
        if (destination != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.destination like '%${destination}%' `;
            sql += `and cc_campaign_outgoing_reports.destination like '%${destination}%' `;
        }
        if (status != undefined) {
            if (status == "NO ANSWER") {
                sqlCount += `and (cc_campaign_outgoing_reports.callStatus = 'NO ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'NOANSWER') `;
                sql += `and (cc_campaign_outgoing_reports.callStatus = 'NO ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'NOANSWER') `;
            } else if (status == "ANSWERED") {
                sqlCount += `and (cc_campaign_outgoing_reports.callStatus = 'ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'ANSWERED')  `;
                sql += `and (cc_campaign_outgoing_reports.callStatus = 'ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'ANSWERED') `;
            } else {
                sqlCount += `and cc_campaign_outgoing_reports.callStatus like '%${status}%' `;
                sql += `and cc_campaign_outgoing_reports.callStatus like '%${status}%' `;
            }
        }
        if (fromDuration != undefined && toDuration != undefined) {
            function timeToSeconds(timeString) {
                const [hours, minutes, seconds] = timeString.split(':').map(Number);
                return hours * 3600 + minutes * 60 + seconds;
            }
            var fromDur = timeToSeconds(req.query.fromDuration);
            var toDur = timeToSeconds(req.query.toDuration);
            sqlCount += `and cc_campaign_outgoing_reports.duration between ${fromDur} and ${toDur} `;
            sql += `and cc_campaign_outgoing_reports.duration between ${fromDur} and ${toDur} `;
        }
        if (fromTime != undefined && toTime != undefined) {
            sqlCount += `and TIME(cc_campaign_outgoing_reports.call_start_time) between '${fromTime}' and '${toTime}' `;
            sql += `and TIME(cc_campaign_outgoing_reports.call_start_time) between '${fromTime}' and '${toTime}' `;
        }
        sqlCount += ` order by cc_campaign_outgoing_reports.id desc `;
        sql += ` order by cc_campaign_outgoing_reports.id desc limit ${skip},${limit} `;
        console.log("sql......................", sql)
        var [result] = await rackServer.query(sql);
        var [count] = await rackServer.query(sqlCount);
        if (req.token.phone_number_masking == 1) {
            var map_result = Promise.all(
                result.map(async (value) => {
                    var Dest = await string_encode(value.destination);
                    if (Dest) {
                        value.destination = Dest;
                    }
                    return value
                })
            )
            var output = await map_result;
            res.locals.result = output;
        } else {
            res.locals.result = result;
        }
        res.locals.count = count[0].outgoingcall;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_campaign_outgoingcall_csv(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var campaignId = req.query.campaignId;
        var callerid = req.query.callerid;
        var destination = req.query.destination;
        var fromDuration = req.query.fromDuration;
        var toDuration = req.query.toDuration;
        var fromTime = req.query.fromTime;
        var toTime = req.query.Time;
        var id_agent = req.query.agentId;
        var status = req.query.status;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1
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
        }
        else {
            var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
            var End = `${yyyy}-${mm}-${dd} 23:59:59`;
        }
        var sqlCount = `SELECT count(cc_campaign_outgoing_reports.id) as outgoingcall FROM cc_campaign_outgoing_reports LEFT JOIN cc_campaign on cc_campaign.id = cc_campaign_outgoing_reports.id_campaign where cc_campaign_outgoing_reports.createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        var sql = `SELECT *,cc_campaign.name as campaignName FROM cc_campaign_outgoing_reports LEFT JOIN cc_campaign on cc_campaign.id = cc_campaign_outgoing_reports.id_campaign  where cc_campaign_outgoing_reports.createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        if (isSubAdmin == 1) {
            sql += `and id_department in(${id_department}) `;
            sqlCount += `and id_department in(${id_department}) `;
        } else if (isDept == 1) {
            sql += `and id_department = '${req.token.id}' `;
            sqlCount += `and id_department = '${req.token.id}' `;
        }
        if (id_agent != undefined) {
            sqlCount += `and id_agent = '${id_agent}' `;
            sql += `and id_agent = '${id_agent}' `;
        }
        if (campaignId != undefined) {
            sqlCount += `and id_campaign = '${campaignId}' `;
            sql += `and id_campaign = '${campaignId}' `;
        }
        if (callerid != undefined) {
            sqlCount += `and callerid like '%${callerid}%' `;
            sql += `and callerid like '%${callerid}%' `;
        }
        if (destination != undefined) {
            sqlCount += `and destination like '%${destination}%' `;
            sql += `and destination like '%${destination}%' `;
        }
        if (status != undefined) {
            if (status == "NO ANSWER") {
                sqlCount += `and (callStatus = 'NO ANSWER' OR callStatus = 'NOANSWER') `;
                sql += `and (callStatus = 'NO ANSWER' OR callStatus = 'NOANSWER') `;
            } else if (status == "ANSWERED") {
                sqlCount += `and (callStatus = 'ANSWER' OR callStatus = 'ANSWERED')  `;
                sql += `and (callStatus = 'ANSWER' OR callStatus = 'ANSWERED') `;
            } else {
                sqlCount += `and callStatus like '%${status}%' `;
                sql += `and callStatus like '%${status}%' `;
            }
        }
        if (fromDuration != undefined && toDuration != undefined) {
            function timeToSeconds(timeString) {
                const [hours, minutes, seconds] = timeString.split(':').map(Number);
                return hours * 3600 + minutes * 60 + seconds;
            }
            var fromDur = timeToSeconds(req.query.fromDuration);
            var toDur = timeToSeconds(req.query.toDuration);
            sqlCount += `and duration between '${fromDur}' and '${toDur}' `;
            sql += `and duration between '${fromDur}' and '${toDur}' `;
        }
        if (fromTime != undefined && toTime != undefined) {
            sqlCount += `and TIME(call_start_time) between '${fromTime}' and '${toTime}' `;
            sql += `and TIME(call_start_time) between '${fromTime}' and '${toTime}' `;
        }
        sqlCount += `order by cc_campaign_outgoing_reports.id desc `;
        sql += ` order by cc_campaign_outgoing_reports.id desc `;
        var [result] = await rackServer.query(sql);
        var [count] = await rackServer.query(sqlCount);
        if(result.length != 0){
            var map_result = Promise.all(
                result.map(async (value) => {
                    if (value.callStatus == 'ANSWER') {
                        var fromdateDateTime = value.call_start_time
                        var cntdate = fromdateDateTime.getDate().toString().padStart(2, '0');
                        var currentMnth = (fromdateDateTime.getMonth() + 1).toString().padStart(2, '0');
                        var year = fromdateDateTime.getFullYear();
                        var date = `${year}-${currentMnth}-${cntdate}`
                        value.cr_file = `${process.env.NODE_PATH}` + `campaign/get_campaign_callrecordings_without_token/` + `${value.cr_file}.wav/` + `${date}/`  + `${id_user}`
                    } else{
                        value.cr_file = ''
                    }
                    return value
                })
            )
            result = await map_result;
        }
        res.locals.result = result;
        res.locals.count = count[0].outgoingcall;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_by_campaign_outgoingcall(req, res, next) {
    try {
        var id = req.query.id;
        var campaign = await campaignOutgoingModel.findOne({ where: { id: id } });;
        res.locals.result = campaign;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function delete_campaign_outgoingcall(req, res, next) {
    try {
        var id = req.query.id;
        var campaign = await campaignOutgoingModel.destroy({ where: { id: id } });
        res.locals.result = campaign;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_campaign_outgoingcall_by_agent(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var isAgent = req.token.isAgent;
        var agentId = req.token.id
        var limit = Number(req.query.count);
        var skip = req.query.page;
        skip = (skip - 1) * limit;
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var campaignId = req.query.campaignId;
        var callerid = req.query.callerid;
        var destination = req.query.destination;
        var fromDuration = req.query.fromDuration;
        var toDuration = req.query.toDuration;
        var fromTime = req.query.fromTime;
        var toTime = req.query.toTime;
        var status = req.query.status;
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
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
        if(req.token.reporting_period) {
            const { startOfPeriod, endOfPeriod } = (await getDateRangeForReportingPeriod(agentId, Start, End)) || {};
            if(startOfPeriod) {
                Start = startOfPeriod;
            }
            if(endOfPeriod) {
                End = endOfPeriod;
            }
        }
        
        var sqlCount = `SELECT count(cc_campaign_outgoing_reports.id) as outgoingcall FROM cc_campaign_outgoing_reports left join cc_campaign on cc_campaign.id = cc_campaign_outgoing_reports.id_campaign where user_id ='${agentId}' and cc_campaign_outgoing_reports.createdAt between '${Start}' and '${End}'`;
        var sql = `SELECT cc_campaign_outgoing_reports.*,campaign_settings.phn_number_mask,cc_campaign.name as campaignName FROM cc_campaign_outgoing_reports left join campaign_settings on campaign_settings.campaign_id = cc_campaign_outgoing_reports.id_campaign left join cc_campaign on cc_campaign.id = cc_campaign_outgoing_reports.id_campaign where cc_campaign_outgoing_reports.user_id ='${agentId}' and cc_campaign_outgoing_reports.createdAt between '${Start}' and '${End}' `;
        if (isAgent == undefined) {
            sql += `and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
            sqlCount += `and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        }
        if (campaignId != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.id_campaign = '${campaignId}' `;
            sql += `and cc_campaign_outgoing_reports.id_campaign = '${campaignId}' `;
        }
        if (callerid != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.callerid like '%${callerid}%' `;
            sql += `and cc_campaign_outgoing_reports.callerid like '%${callerid}%' `;
        }
        if (destination != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.destination like '%${destination}%' `;
            sql += `and cc_campaign_outgoing_reports.destination like '%${destination}%' `;
        }
        if (status != undefined) {
            if (status == "NO ANSWER") {
                sqlCount += `and (cc_campaign_outgoing_reports.callStatus = 'NO ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'NOANSWER') `;
                sql += `and (cc_campaign_outgoing_reports.callStatus = 'NO ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'NOANSWER') `;
            } else if (status == "ANSWERED") {
                sqlCount += `and (cc_campaign_outgoing_reports.callStatus = 'ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'ANSWERED')  `;
                sql += `and (cc_campaign_outgoing_reports.callStatus = 'ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'ANSWERED') `;
            } else {
                sqlCount += `and cc_campaign_outgoing_reports.callStatus like '%${status}%' `;
                sql += `and cc_campaign_outgoing_reports.callStatus like '%${status}%' `;
            }
        }
        if (fromDuration != undefined && toDuration != undefined) {
            function timeToSeconds(timeString) {
                const [hours, minutes, seconds] = timeString.split(':').map(Number);
                return hours * 3600 + minutes * 60 + seconds;
            }
            var fromDur = timeToSeconds(req.query.fromDuration);
            var toDur = timeToSeconds(req.query.toDuration);
            sqlCount += `and cc_campaign_outgoing_reports.duration between ${fromDur} and ${toDur} `;
            sql += `and cc_campaign_outgoing_reports.duration between ${fromDur} and ${toDur} `;
        }
        if (fromTime != undefined && toTime != undefined) {
            sqlCount += `and TIME(cc_campaign_outgoing_reports.call_start_time) between '${fromTime}' and '${toTime}' `;
            sql += `and TIME(cc_campaign_outgoing_reports.call_start_time) between '${fromTime}' and '${toTime}' `;
        }
        sqlCount += `order by cc_campaign_outgoing_reports.id desc `;
        sql += ` order by cc_campaign_outgoing_reports.id desc limit ${skip},${limit} `;
        console.log("sql......................", sql)
        var [result] = await getConnection.query(sql);
        var [count] = await getConnection.query(sqlCount);
        if (result.length != 0) {
            var map_result = Promise.all(
                result.map(async (value) => {
                    if (value.phn_number_mask == 1) {
                        value.destination = ""
                    }
                    return value
                })
            )
            result = await map_result;
        }
        if (req.token.phn_number_mask == 1) {
            var map_result = Promise.all(
                result.map(async (value) => {
                    var Dest = await string_encode(value.destination);
                    if (Dest) {
                        value.destination = Dest;
                    }
                    return value
                })
            )
            var output = await map_result;
            res.locals.result = output;
        } else {
            res.locals.result = result;
        }
        res.locals.count = count[0].outgoingcall;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_campaign_outgoingcall_csv_by_agent(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var isAgent = req.token.isAgent;
        var agentId = req.token.id;
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var campaignId = req.query.campaignId;
        var callerid = req.query.callerid;
        var destination = req.query.destination;
        var fromDuration = req.query.fromDuration;
        var toDuration = req.query.toDuration;
        var fromTime = req.query.fromTime;
        var toTime = req.query.toTime;
        var status = req.query.status;
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
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
        if(req.token.reporting_period) {
            const { startOfPeriod, endOfPeriod } = (await getDateRangeForReportingPeriod(agentId, Start, End)) || {};
            if(startOfPeriod) {
                Start = startOfPeriod;
            }
            if(endOfPeriod) {
                End = endOfPeriod;
            }
        }
        
        var sqlCount = `SELECT count(cc_campaign_outgoing_reports.id) as outgoingcall FROM cc_campaign_outgoing_reports LEFT JOIN campaign_settings ON campaign_settings.campaign_id = cc_campaign_outgoing_reports.id_campaign left join cc_campaign on cc_campaign.id = cc_campaign_outgoing_reports.id_campaign where user_id ='${agentId}' and cc_campaign_outgoing_reports.createdAt between '${Start}' and '${End}'`;
        var sql = `SELECT *,campaign_settings.phn_number_mask,cc_campaign.name as campaignName FROM cc_campaign_outgoing_reports LEFT JOIN campaign_settings ON campaign_settings.campaign_id = cc_campaign_outgoing_reports.id_campaign left join cc_campaign on cc_campaign.id = cc_campaign_outgoing_reports.id_campaign where user_id ='${agentId}' and cc_campaign_outgoing_reports.createdAt between '${Start}' and '${End}' `;
        if (isAgent == undefined) {
            sql += `and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
            sqlCount += `and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        }
        if (campaignId != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.id_campaign = '${campaignId}' `;
            sql += `and cc_campaign_outgoing_reports.id_campaign = '${campaignId}' `;
        }
        if (callerid != undefined) {
            sqlCount += `and callerid like '%${callerid}%' `;
            sql += `and callerid like '%${callerid}%' `;
        }
        if (destination != undefined) {
            sqlCount += `and destination like '%${destination}%' `;
            sql += `and destination like '%${destination}%' `;
        }
        if (status != undefined) {
            if (status == "NO ANSWER") {
                sqlCount += `and (callStatus = 'NO ANSWER' OR callStatus = 'NOANSWER') `;
                sql += `and (callStatus = 'NO ANSWER' OR callStatus = 'NOANSWER') `;
            } else if (status == "ANSWERED") {
                sqlCount += `and (callStatus = 'ANSWER' OR callStatus = 'ANSWERED')  `;
                sql += `and (callStatus = 'ANSWER' OR callStatus = 'ANSWERED') `;
            } else {
                sqlCount += `and callStatus like '%${status}%' `;
                sql += `and callStatus like '%${status}%' `;
            }
        }
        if (fromDuration != undefined && toDuration != undefined) {
            function timeToSeconds(timeString) {
                const [hours, minutes, seconds] = timeString.split(':').map(Number);
                return hours * 3600 + minutes * 60 + seconds;
            }
            var fromDur = timeToSeconds(req.query.fromDuration);
            var toDur = timeToSeconds(req.query.toDuration);
            sqlCount += `and duration between ${fromDur} and ${toDur} `;
            sql += `and duration between ${fromDur} and ${toDur} `;
        }
        if (fromTime != undefined && toTime != undefined) {
            sqlCount += `and TIME(call_start_time) between '${fromTime}' and '${toTime}' `;
            sql += `and TIME(call_start_time) between '${fromTime}' and '${toTime}' `;
        }
        sqlCount += `order by cc_campaign_outgoing_reports.id desc `;
        sql += ` order by cc_campaign_outgoing_reports.id desc `;
        var [result] = await getConnection.query(sql);
        var [count] = await getConnection.query(sqlCount);
        if(result.length != 0){
            var map_result = Promise.all(
                result.map(async (value) => {
                    if (value.callStatus == 'ANSWER') {
                        var fromdateDateTime = value.call_start_time
                        var cntdate = fromdateDateTime.getDate().toString().padStart(2, '0');
                        var currentMnth = (fromdateDateTime.getMonth() + 1).toString().padStart(2, '0');
                        var year = fromdateDateTime.getFullYear();
                        var date = `${year}-${currentMnth}-${cntdate}`
                        value.cr_file = `${process.env.NODE_PATH}` + `campaign/get_campaign_callrecordings_without_token/` + `${value.cr_file}.wav/` + `${date}/` + `${id_user}`
                    } else {
                        value.cr_file = ''
                    }
                    return value
                })
            )
            result = await map_result;
        }
        if (result.length != 0) {
            var map_result = Promise.all(
                result.map(async (value) => {
                    if (value.phn_number_mask == 1) {
                        value.destination = ""
                    }
                    return value
                })
            )
            result = await map_result;
        }
        if (req.token.phn_number_mask == 1) {
            var map_result = Promise.all(
                result.map(async (value) => {
                    var Dest = await string_encode(value.destination);
                    if (Dest) {
                        value.destination = Dest;
                    }
                    return value
                })
            )
            var output = await map_result;
            res.locals.result = output;
        } else {
            res.locals.result = result;
        }
        res.locals.count = count[0].outgoingcall;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_all_campaign_outgoingcall_reports(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var isAgent = req.token.isAgent;
        var limit = Number(req.query.count);
        var skip = req.query.page;
        skip = (skip - 1) * limit;
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var campaignId = req.query.campaignId;
        var callerid = req.query.callerid;
        var destination = req.query.destination;
        var fromDuration = req.query.fromDuration;
        var toDuration = req.query.toDuration;
        var id_agent = req.query.agentId;
        var fromTime = req.query.fromTime;
        var toTime = req.query.toTime;
        var status = req.query.status;
        var filterBy = req.query.filterBy;
        var fromdatetime = new Date();
        var todatetime = new Date();
        var department_id = req.query.department_id;
        var today = new Date();
        var dd = today.getDate().toString().padStart(2, '0'); 
        var mm = (today.getMonth() + 1).toString().padStart(2, '0');
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
        }else if(filterBy != undefined){
            if (filterBy == "yesterday") {
                todatetime.setDate(todatetime.getDate() - 1)
                fromdatetime.setDate(fromdatetime.getDate() - 1)
            }
            if (filterBy == "thisweek") {
                let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
                fromdatetime = weekStart
                todatetime = weekEnd
                console.log("Week Start:", weekStart);
                console.log("Week End:", weekEnd);          
            }
            if (filterBy == "thismonth") {
                let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
                fromdatetime = monthStart
                todatetime = monthEnd
                console.log("Month Start:", monthStart);
                console.log("Month End:", monthEnd);
            }
            var currentdate = fromdatetime.getDate().toString().padStart(2, '0');
            var currentMnth = (fromdatetime.getMonth() + 1).toString().padStart(2, '0');
            var year = fromdatetime.getFullYear();
            var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
            var currentdateEnd = todatetime.getDate().toString().padStart(2, '0');
            var currentMnthEnd = (todatetime.getMonth() + 1).toString().padStart(2, '0');
            var yearEnd = todatetime.getFullYear();
            var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
            console.log("Start :", Start);
            console.log("End :", End);
        } else {
            var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
            var End = `${yyyy}-${mm}-${dd} 23:59:59`;
        }
        var sqlCount = `SELECT count(cc_campaign_outgoing_reports.id) as outgoingcall FROM cc_campaign_outgoing_reports LEFT JOIN user ON user.id = cc_campaign_outgoing_reports.user_id left join cc_campaign on cc_campaign.id = cc_campaign_outgoing_reports.id_campaign where cc_campaign_outgoing_reports.createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        var sql = `SELECT cc_campaign_outgoing_reports.id,cc_campaign_outgoing_reports.id_user,cc_campaign_outgoing_reports.id_department,cc_campaign_outgoing_reports.user_id,cc_campaign_outgoing_reports.id_campaign,cc_campaign_outgoing_reports.id_contact,cc_campaign_outgoing_reports.answeredTime,cc_campaign_outgoing_reports.call_start_time,cc_campaign_outgoing_reports.call_endtime,cc_campaign_outgoing_reports.uniqueid,cc_campaign_outgoing_reports.destination,cc_campaign_outgoing_reports.callerid,cc_campaign_outgoing_reports.duration,cc_campaign_outgoing_reports.cost,cc_campaign_outgoing_reports.callStatus,cc_campaign_outgoing_reports.cr_status,cc_campaign_outgoing_reports.cr_file,cc_campaign_outgoing_reports.dialType,cc_campaign_outgoing_reports.retryStatus,cc_campaign_outgoing_reports.route,cc_campaign_outgoing_reports.type,cc_campaign_outgoing_reports.acw_time,cc_campaign_outgoing_reports.hold_time,cc_campaign_outgoing_reports.call_delay,cc_campaign_outgoing_reports.delay_time,cc_campaign_outgoing_reports.hangup_by,cc_campaign_outgoing_reports.dtmfSeq,cc_campaign_outgoing_reports.acw,cc_campaign_outgoing_reports.reminder,cc_campaign_outgoing_reports.retry_count,cc_campaign_outgoing_reports.total_duration,cc_campaign_outgoing_reports.createdAt,CONCAT(user.first_name, ' ', user.last_name) AS user,campaign_settings.phn_number_mask,cc_campaign.name as campaignName FROM cc_campaign_outgoing_reports LEFT JOIN user ON user.id = cc_campaign_outgoing_reports.user_id left join campaign_settings on campaign_settings.campaign_id = cc_campaign_outgoing_reports.id_campaign left join cc_campaign on cc_campaign.id = cc_campaign_outgoing_reports.id_campaign where cc_campaign_outgoing_reports.createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        if (isSubAdmin == 1) {
            if(department_id == undefined){
                sql += `and cc_campaign_outgoing_reports.id_department in(${id_department}) `;
                sqlCount += `and cc_campaign_outgoing_reports.id_department in(${id_department}) `;
            }
        } else if (isDept == 1) {
            sql += `and cc_campaign_outgoing_reports.id_department = '${req.token.id}' `;
            sqlCount += `and cc_campaign_outgoing_reports.id_department = '${req.token.id}' `;
        } 
        if(department_id != undefined){
            sql += `and cc_campaign_outgoing_reports.id_department = '${department_id}' `;
            sqlCount += `and cc_campaign_outgoing_reports.id_department = '${department_id}' `;
        }
        if (campaignId != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.id_campaign = '${campaignId}' `;
            sql += `and cc_campaign_outgoing_reports.id_campaign = '${campaignId}' `;
        }
        if (callerid != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.callerid like '%${callerid}%' `;
            sql += `and cc_campaign_outgoing_reports.callerid like '%${callerid}%' `;
        }
        if (destination != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.destination like '%${destination}%' `;
            sql += `and cc_campaign_outgoing_reports.destination like '%${destination}%' `;
        }
        if (id_agent != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.user_id = '${id_agent}' `;
            sql += `and cc_campaign_outgoing_reports.user_id = '${id_agent}' `;
        }
        if (status != undefined) {
            if (status == "NO ANSWER") {
                sqlCount += `and (cc_campaign_outgoing_reports.callStatus = 'NO ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'NOANSWER') `;
                sql += `and (cc_campaign_outgoing_reports.callStatus = 'NO ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'NOANSWER') `;
            } else if (status == "ANSWERED") {
                sqlCount += `and (cc_campaign_outgoing_reports.callStatus = 'ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'ANSWERED')  `;
                sql += `and (cc_campaign_outgoing_reports.callStatus = 'ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'ANSWERED') `;
            } else {
                sqlCount += `and cc_campaign_outgoing_reports.callStatus like '%${status}%' `;
                sql += `and cc_campaign_outgoing_reports.callStatus like '%${status}%' `;
            }
        }
        if (fromDuration != undefined && toDuration != undefined) {
            function timeToSeconds(timeString) {
                const [hours, minutes, seconds] = timeString.split(':').map(Number);
                return hours * 3600 + minutes * 60 + seconds;
            }
            var fromDur = timeToSeconds(req.query.fromDuration);
            var toDur = timeToSeconds(req.query.toDuration);
            sqlCount += `and cc_campaign_outgoing_reports.duration between ${fromDur} and ${toDur} `;
            sql += `and cc_campaign_outgoing_reports.duration between ${fromDur} and ${toDur} `;
        }
        if (fromTime != undefined && toTime != undefined) {
            sqlCount += `and TIME(cc_campaign_outgoing_reports.call_start_time) between '${fromTime}' and '${toTime}' `;
            sql += `and TIME(cc_campaign_outgoing_reports.call_start_time) between '${fromTime}' and '${toTime}' `;
        }
        sqlCount += `order by cc_campaign_outgoing_reports.id desc `;
        sql += ` order by cc_campaign_outgoing_reports.id desc limit ${skip},${limit}`;
        var [result] = await rackServer.query(sql);
        var [count] = await rackServer.query(sqlCount);
        if (req.token.phone_number_masking == 1) {
            var map_result = Promise.all(
                result.map(async (value) => {
                    var Dest = await string_encode(value.destination);
                    if (Dest) {
                        value.destination = Dest;
                    }
                    return value
                })
            )
            var output = await map_result;
            res.locals.result = output;
        } else {
            res.locals.result = result;
        }
        res.locals.count = count[0].outgoingcall;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_all_campaign_outgoingcall_reports_csv(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var isAgent = req.token.isAgent;
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var campaignId = req.query.campaignId;
        var callerid = req.query.callerid;
        var destination = req.query.destination;
        var fromDuration = req.query.fromDuration;
        var toDuration = req.query.toDuration;
        var id_agent = req.query.agentId;
        var fromTime = req.query.fromTime;
        var toTime = req.query.toTime;
        var status = req.query.status;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1
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
        var sqlCount = `SELECT count(cc_campaign_outgoing_reports.id) as outgoingcall FROM cc_campaign_outgoing_reports left join cc_campaign on cc_campaign.id = cc_campaign_outgoing_reports.id_campaign where cc_campaign_outgoing_reports.createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        var sql = `SELECT cc_campaign_outgoing_reports.id,cc_campaign_outgoing_reports.id_user,cc_campaign_outgoing_reports.id_department,cc_campaign_outgoing_reports.user_id,cc_campaign_outgoing_reports.id_campaign,cc_campaign_outgoing_reports.id_contact,cc_campaign_outgoing_reports.answeredTime,cc_campaign_outgoing_reports.call_start_time,cc_campaign_outgoing_reports.call_endtime,cc_campaign_outgoing_reports.uniqueid,cc_campaign_outgoing_reports.user,cc_campaign_outgoing_reports.destination,cc_campaign_outgoing_reports.callerid,cc_campaign_outgoing_reports.duration,cc_campaign_outgoing_reports.cost,cc_campaign_outgoing_reports.callStatus,cc_campaign_outgoing_reports.cr_status,cc_campaign_outgoing_reports.cr_file,cc_campaign_outgoing_reports.dialType,cc_campaign_outgoing_reports.retryStatus,cc_campaign_outgoing_reports.route,cc_campaign_outgoing_reports.type,cc_campaign_outgoing_reports.acw_time,cc_campaign_outgoing_reports.hold_time,cc_campaign_outgoing_reports.call_delay,cc_campaign_outgoing_reports.delay_time,cc_campaign_outgoing_reports.hangup_by,cc_campaign_outgoing_reports.dtmfSeq,cc_campaign_outgoing_reports.acw,cc_campaign_outgoing_reports.reminder,cc_campaign_outgoing_reports.retry_count,cc_campaign_outgoing_reports.total_duration,cc_campaign_outgoing_reports.createdAt,CONCAT(user.first_name, ' ', user.last_name) AS agent,cc_campaign.name as campaignName FROM cc_campaign_outgoing_reports LEFT JOIN user ON user.id = cc_campaign_outgoing_reports.user_id left join cc_campaign on cc_campaign.id = cc_campaign_outgoing_reports.id_campaign where cc_campaign_outgoing_reports.createdAt between '${Start}' and '${End}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        if (isSubAdmin == 1) {
            sql += `and cc_campaign_outgoing_reports.id_department in(${id_department}) `;
            sqlCount += `and cc_campaign_outgoing_reports.id_department in(${id_department}) `;
        } else if (isDept == 1) {
            sql += `and cc_campaign_outgoing_reports.id_department = '${req.token.id}' `;
            sqlCount += `and cc_campaign_outgoing_reports.id_department = '${req.token.id}' `;
        } else if (isAgent == 1) {
            sql += `and cc_campaign_outgoing_reports.id_department = '${id_department}' `;
            sqlCount += `and cc_campaign_outgoing_reports.id_department = '${id_department}' `;
        }
        if (campaignId != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.id_campaign = '${campaignId}' `;
            sql += `and cc_campaign_outgoing_reports.id_campaign = '${campaignId}' `;
        }
        if (callerid != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.callerid like '%${callerid}%' `;
            sql += `and cc_campaign_outgoing_reports.callerid like '%${callerid}%' `;
        }
        if (destination != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.destination like '%${destination}%' `;
            sql += `and cc_campaign_outgoing_reports.destination like '%${destination}%' `;
        }
        if (id_agent != undefined) {
            sqlCount += `and cc_campaign_outgoing_reports.user_id = '${id_agent}' `;
            sql += `and cc_campaign_outgoing_reports.user_id = '${id_agent}' `;
        }
        if (status != undefined) {
            if (status == "NO ANSWER") {
                sqlCount += `and (cc_campaign_outgoing_reports.callStatus = 'NO ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'NOANSWER') `;
                sql += `and (cc_campaign_outgoing_reports.callStatus = 'NO ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'NOANSWER') `;
            } else if (status == "ANSWERED") {
                sqlCount += `and (cc_campaign_outgoing_reports.callStatus = 'ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'ANSWERED')  `;
                sql += `and (cc_campaign_outgoing_reports.callStatus = 'ANSWER' OR cc_campaign_outgoing_reports.callStatus = 'ANSWERED') `;
            } else {
                sqlCount += `and cc_campaign_outgoing_reports.callStatus like '%${status}%' `;
                sql += `and cc_campaign_outgoing_reports.callStatus like '%${status}%' `;
            }
        }
        if (fromDuration != undefined && toDuration != undefined) {
            function timeToSeconds(timeString) {
                const [hours, minutes, seconds] = timeString.split(':').map(Number);
                return hours * 3600 + minutes * 60 + seconds;
            }
            var fromDur = timeToSeconds(req.query.fromDuration);
            var toDur = timeToSeconds(req.query.toDuration);
            sqlCount += `and cc_campaign_outgoing_reports.duration between ${fromDur} and ${toDur} `;
            sql += `and cc_campaign_outgoing_reports.duration between ${fromDur} and ${toDur} `;
        }
        if (fromTime != undefined && toTime != undefined) {
            sqlCount += `and TIME(cc_campaign_outgoing_reports.call_start_time) between '${fromTime}' and '${toTime}' `;
            sql += `and TIME(cc_campaign_outgoing_reports.call_start_time) between '${fromTime}' and '${toTime}' `;
        }
        sqlCount += `order by cc_campaign_outgoing_reports.id desc `;
        sql += ` order by cc_campaign_outgoing_reports.id desc `;
        var [result] = await rackServer.query(sql);
        var [count] = await rackServer.query(sqlCount);
        if(result.length != 0){
            var map_result = Promise.all(
                result.map(async (value) => {
                    if (value.callStatus == 'ANSWER') {
                        var fromdateDateTime = value.call_start_time
                        var cntdate = fromdateDateTime.getDate().toString().padStart(2, '0');
                        var currentMnth = (fromdateDateTime.getMonth() + 1).toString().padStart(2, '0');
                        var year = fromdateDateTime.getFullYear();
                        var date = `${year}-${currentMnth}-${cntdate}`
                        value.cr_file = `${process.env.NODE_PATH}` + `campaign/get_campaign_callrecordings_without_token/` + `${value.cr_file}.wav/` + `${date}/`  + `${id_user}`
                    } else{
                        value.cr_file = ''
                    }
                    return value
                })
            )
            result = await map_result;
        }
        if (req.token.phone_number_masking == 1) {
            var map_result = Promise.all(
                result.map(async (value) => {
                    var Dest = await string_encode(value.destination);
                    if (Dest) {
                        value.destination = Dest;
                    }
                    return value
                })
            )
            var output = await map_result;
            res.locals.result = output;
        } else {
            res.locals.result = result;
        }
        res.locals.count = count[0].outgoingcall;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function add_campaign_settings(req, res, next) {
    try {
        var campaign = req.body;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        if (isAdmin == 1) {
            var id_department = 0;
        } else if (isSubAdmin == 1) {
            var id_department = req.token.id_department;
        } else if (isDept == 1) {
            var id_department = req.token.id;
        }
        campaign.id_department = id_department
        var addcampaign = await campaignSettingsModel.create(campaign);
        res.locals.result = addcampaign;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function update_campaign_settings(req, res, next) {
    try {
        var campaign = req.body;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        if (isAdmin == 1) {
            var id_department = 0;
        } else if (isSubAdmin == 1) {
            var id_department = req.token.id_department;
        } else if (isDept == 1) {
            var id_department = req.token.id;
        }
        var id = req.query.id;
        campaign.id_department = id_department;
        var campaign_id = req.body.campaign_id;
        if (id != undefined) {
            var result = await campaignSettingsModel.update(campaign, { where: { id: id } });
        } else {
            var result = await campaignSettingsModel.update(campaign, { where: { campaign_id: campaign_id } });
        }
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_all_campaign_settings(req, res, next) {
    try {
        var limit = Number(req.query.count);
        var skip = req.query.page;
        skip = (skip - 1) * limit;
        var name = req.query.name;
        var sql = `SELECT campaign_settings.id as id,campaign_id,cc_campaign.name as name,view_call_summary,hang_up_on_submit,campaign_settings.retry_skip as retry_skip,campaign_settings.phn_number_mask as phn_number_mask,campaign_settings.createdAt as createdAt,campaign_settings.updatedAt as updatedAt,whatsapp_integration as whatsapp_integration,departments.name as department FROM campaign_settings JOIN cc_campaign ON campaign_settings.campaign_id = cc_campaign.id LEFT JOIN departments ON campaign_settings.id_department = departments.id `;
        var sqlCount = `select count(campaign_settings.id) as total FROM campaign_settings JOIN cc_campaign ON campaign_settings.campaign_id = cc_campaign.id LEFT JOIN departments ON campaign_settings.id_department = departments.id `;
        if (name != undefined) {
            sql += `and cc_campaign.name like '%${name}%' `;
            sqlCount += `and cc_campaign.name like '%${name}%'`;
        }
        sql += `order by campaign_settings.id desc limit ${skip},${limit}`;
        sqlCount += `order by campaign_settings.id desc`;
        var [result] = await getConnection.query(sql);
        var [count] = await getConnection.query(sqlCount);
        res.locals.result = result;
        res.locals.count = count[0].total;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_by_campaign_settings_id(req, res, next) {
    try {
        var id = req.query.id;
        var campaign_id = req.query.campaign_id;
        var sql = `select * from campaign_settings where `;
        if (campaign_id != undefined) {
            sql += `campaign_id = '${campaign_id}'`
        } else {
            sql += `id = '${id}'`
        }
        var [result] = await getConnection.query(sql);
        var obj = {}
        if (result.length != 0) {
            if (result[0].whatsapp_integration == 1) {
                var jwtValue = await jwtModel.find({ campaign_id: campaign_id })
                if (jwtValue.length != 0) {
                    obj.whatsappData = [jwtValue[0]._doc]
                } else {
                    obj.whatsappData = []
                }
            } else {
                obj.whatsappData = []
            }
            if (result[0].api_integration == 1) {
                var apiValue = await apiIntegrationModel.find({ campaign_id: campaign_id })
                if (apiValue.length != 0) {
                    var apiData = [];
                    var map_result = Promise.all(
                        apiValue.map(async (value) => {
                            if (value._doc.structure != undefined) {
                                var objectKey = Object.keys(value._doc.structure);
                                if (value._doc.bodyParams == undefined) {
                                    value._doc.bodyParams = {}
                                    value._doc.bodyParams[objectKey] = 'JSON'
                                } else {
                                    value._doc.bodyParams[objectKey] = 'JSON'
                                }
                            }
                            apiData.push(value._doc)
                            return value
                        })
                    )
                    var output = await map_result;
                    obj.apiIntegrationData = apiData
                } else {
                    obj.apiIntegrationData = []
                }
            } else {
                obj.apiIntegrationData = []
            }
            obj.result = result[0]
            res.locals.result = obj;
        } else {
            res.locals.result = result
        }

        next()
    }
    catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function delete_campaign_settings(req, res, next) {
    try {
        var id = req.query.id;
        var campaign_settings = await campaignSettingsModel.destroy({ where: { id: id } });
        res.locals.result = campaign_settings;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function insert_campaign_settings(req, res, next) {
    try {
        var type = req.token.type;
        var campaign = req.body.result;
        var jwtData = req.body.jwtData;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        if (isAdmin == 1) {
            var id_department = 0;
        } else if (isSubAdmin == 1) {
            var id_department = req.token.id_department;
        } else if (isDept == 1) {
            var id_department = req.token.id;
        }
        campaign.id_department = id_department
        var campaign_id = campaign.campaign_id;
        var sql = `select * from campaign_settings where campaign_id = '${campaign_id}'`;
        var [result] = await getConnection.query(sql);
        if (result.length == 0) {
            var addcampaign = await campaignSettingsModel.create(campaign);
        } else {
            var addcampaign = await campaignSettingsModel.update(campaign, { where: { campaign_id: campaign_id } });
        }
        res.locals.result = addcampaign;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function campaign_click_to_call(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var id_agent = req.token.id;
        var agent = req.token.regNumber;
        var livecalls = req.body;
        livecalls.contact_status_id = livecalls.id_contact;
        livecalls.id_user = id_user;
        livecalls.id_department = id_department;
        livecalls.user_id = id_agent;
        livecalls.user = agent;
        var currentDate = new Date(req.body.dateTime)
        var startDate = new Date(req.body.dateTime);
        var endDate = new Date(currentDate);
        var diff = endDate - startDate;
        var secondsWithDecimal = diff / 1000
        var Seconds = Math.floor(secondsWithDecimal);
        livecalls.call_delay = Seconds;
        livecalls.delay_time = req.body.dateTime;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var date = `${yyyy}-${mm}-${dd}`
        if (req.token.phn_number_mask == 1) {
            var contact_num = await string_decode(livecalls.contact_number);
            if (contact_num) {
                livecalls.contact_number = contact_num;
            }
        }
        var campaignSummary = `UPDATE cc_campaign_call_summary SET live_calls = live_calls + 1,attempted_contact = attempted_contact + 1,call_delay = call_delay + ${Seconds}  WHERE user_id = '${id_agent}' and campaign_id = '${livecalls.id_campaign}' and phonebook_id = '${livecalls.phonebook_id}' AND DATE(createdAt) = '${date}' and id_user = '${id_user}' and id_department = '${id_department}' `;
        var [campaignSummaryRes] = await sequelize.query(campaignSummary);
        var addcampaign = await livecallsModel.create(livecalls);
        console.log("live call inserted time..............", today)
        res.locals.result = addcampaign;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function add_livecalls(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var id_agent = req.token.id;
        var agent = req.token.regNumber;
        var livecalls = req.body;
        livecalls.id_user = id_user;
        livecalls.id_department = id_department;
        livecalls.user_id = id_agent;
        livecalls.user = agent;
        var addcampaign = await livecallsModel.create(livecalls);
        res.locals.result = addcampaign;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_all_livecalls(req, res, next) {
    try {
        var uniqueId = req.params.uniqueId;
        var dateTime = req.body.date;
        var sql = `SELECT * FROM cc_livecalls WHERE uniqueId = ${uniqueId} and is_live = 0 order by id desc `;
        var sqlCount = `select count(id) as total FROM cc_livecalls WHERE uniqueId = ${uniqueId} and is_live = 0 order by id desc`;
        var [result] = await getConnection.query(sql);
        var [count] = await getConnection.query(sqlCount);
        const startDate = new Date(result[0].date);
        const endDate = new Date(dateTime);
        var diff = startDate - endDate;
        var msec = diff;
        var hh = Math.floor(msec / 1000 / 60 / 60);
        msec -= hh * 1000 * 60 * 60;
        var mm = Math.floor(msec / 1000 / 60);
        msec -= mm * 1000 * 60;
        var ss = Math.floor(msec / 1000);
        var Seconds = diff / 1000
        var duration = hh + ":" + mm + ":" + ss;
        var outgoingcall = {
            id_user: result[0].id_user,
            id_department: result[0].id_department,
            id_agent: result[0].id_agent,
            id_campaign: result[0].id_campaign,
            id_contact: result[0].id_contact,
            uniqueid: result[0].uniqueid,
            agent: result[0].agent,
            duration: Seconds,
            callStatus: result[0].status,
            acw: duration
        }
        var addcampaign = await campaignOutgoingModel.create(outgoingcall);
        res.locals.result = result;
        res.locals.count = count[0].total;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_livecalls(req, res, next) {
    try {
        var campaign_id = req.query.campaign_id;
        const currentDate = new Date();
        var current_dd = currentDate.getDate();
        var current_mm = currentDate.getMonth() + 1
        var current_yyyy = currentDate.getFullYear();
        var current_hours = currentDate.getHours();
        var current_min = currentDate.getMinutes();
        var current_sec = currentDate.getSeconds();
        const fifteenMinutesAgo = new Date(currentDate.getTime() - 15 * 60 * 1000);
        var hours = fifteenMinutesAgo.getHours();
        var min = fifteenMinutesAgo.getMinutes();
        var sec = fifteenMinutesAgo.getSeconds();
        var Start = `${current_yyyy}-${current_mm}-${current_dd} ${hours}:${min}:${sec}`;
        var End = `${current_yyyy}-${current_mm}-${current_dd} ${current_hours}:${current_min}:${current_sec}`;
        var sql = `SELECT cc_livecalls.id,cc_livecalls.id_user,cc_livecalls.id_department,cc_livecalls.user_id,cc_livecalls.user,cc_livecalls.id_campaign,cc_livecalls.answeredTime,cc_livecalls.didNumber,cc_livecalls.contact_number,cc_livecalls.sourceChannel,cc_livecalls.destinationChannel,cc_livecalls.livekey,cc_livecalls.status,cc_livecalls.template,cc_livecalls.templateModule,cc_livecalls.viewed_status,cc_livecalls.callDirection,cc_livecalls.calltype,cc_livecalls.uniqueId,cc_livecalls.call_start_time,cc_livecalls.call_end_time,cc_livecalls.acw_time,cc_livecalls.acw,cc_livecalls.is_data_submited,cc_livecalls.contact_status_id,cc_livecalls.duration,cc_livecalls.total_duration,cc_livecalls.call_delay,cc_livecalls.delay_time,cc_livecalls.is_live,cc_livecalls.retry_count,cc_livecalls.route,cc_livecalls.createdAt,cc_livecalls.updatedAt,departments.name AS departmentName,CONCAT(user.first_name, ' ', user.last_name) AS user,campaign_settings.phn_number_mask FROM cc_livecalls LEFT JOIN user ON user.id = cc_livecalls.user_id LEFT JOIN departments ON departments.id = cc_livecalls.id_department LEFT JOIN campaign_settings ON campaign_settings.campaign_id = cc_livecalls.id_campaign WHERE id_campaign = ${campaign_id} and is_live = 0 and cc_livecalls.createdAt BETWEEN '${Start}' AND '${End}' order by cc_livecalls.id desc `;
        var [result] = await getConnection.query(sql);
        if (req.token.phone_number_masking == 1) {
            var map_result = Promise.all(
                result.map(async (value) => {
                    var con_number = await string_encode(value.contact_number);
                    if (con_number) {
                        value.contact_number = con_number;
                    }
                    return value
                })
            )
            var output = await map_result;
            res.locals.result = output;
        } else {
            res.locals.result = result;
        }
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function trigger_agent_logout_by_living_the_page(req, res, next) {
    try {
        var id = req.query.contact_statusId;
        var agentId = req.query.agentId;
        var result = await contactStatusModel.deleteOne({ _id: new ObjectId(id) });
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function get_campaign_CallSummary_by_campaignId(req, res, next) {
    try {
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var agentId = req.query.agentId;
        var phonebookId = req.query.phonebookId;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1
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
        var campaign_id = req.query.campaign_id;
        var sql = `SELECT campaign_id,sum(agent_on_live) as agent_on_live,sum(cancel) as cancel,sum(attempted_contact) as attempted_contact,cc_campaign_call_summary.createdAt,sum(connected_count) as connected_count,sum(notconnected_count) as notconnected_count,sum(busy) as busy,sum(live_calls) as live_calls,sum(ACW) as ACW,sum(connected_duration) as connected_duration,sum(total_duration) as total_duration,sum(call_delay) as call_delay,sum(skip) as skipped_count,sum(congestion) as congestion_count,sum(duplicate) as duplicate,sum(cc_campaign_call_summary.retry) as retry,sum(cc_campaign_call_summary.channel_unavailable) as channel_unavailable,cc_campaign.name as campaignName FROM cc_campaign_call_summary JOIN cc_campaign ON cc_campaign_call_summary.campaign_id = cc_campaign.id where campaign_id = '${campaign_id}' AND cc_campaign_call_summary.createdAt BETWEEN '${Start}' AND '${End}' `;
        if (agentId != undefined) {
            sql += `and cc_campaign_call_summary.user_id = '${agentId}' `
        }
        if (phonebookId != undefined) {
            sql += `and phonebook_id = '${phonebookId}' `
        }
        sql += `GROUP BY campaign_id`
        var [result] = await getConnection.query(sql)
        res.locals.result = result
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_campaign_summery_by_phoneBookId(req, res, next) {
    try {
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var agentId = req.query.agentId;
        var phonebookId = req.query.phonebookId;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1
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
        }
        else {
            var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
            var End = `${yyyy}-${mm}-${dd} 23:59:59`;
        }
        var campaign_id = req.query.campaign_id
        var sql = `SELECT phonebook_id,sum(cancel) as cancel,sum(attempted_contact) as attempted_contact,cc_campaign_call_summary.createdAt,sum(connected_count) as connected_count,sum(notconnected_count) as notconnected_count,sum(busy) as busy,sum(live_calls) as live_calls,sum(ACW) as ACW,sum(connected_duration) as connected_duration,sum(total_duration) as total_duration,sum(call_delay) as call_delay,sum(congestion) as congestion_count,sum(cc_campaign_call_summary.retry) as retry,sum(cc_campaign_call_summary.channel_unavailable) as channel_unavailable,sum(duplicate) as duplicate FROM cc_campaign_call_summary where campaign_id = '${campaign_id}' AND cc_campaign_call_summary.createdAt BETWEEN '${Start}' AND '${End}' `;
        if (agentId != undefined) {
            sql += `and cc_campaign_call_summary.user_id = '${agentId}' `
        }
        if (phonebookId != undefined) {
            sql += `and phonebook_id = '${phonebookId}' `
        }
        sql += `GROUP BY phonebook_id`
        var [result] = await getConnection.query(sql)
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        let query = { id_user: req.token.id_user };
        if (isAdmin === 1) {
            query.id_department = 0;
        } else if (isSubAdmin === 1) {
            var id_department = req.token.id_department.split(',').map(Number);
            query.id_department = { $in: id_department };
        } else if (isDept === 1) {
            query.id_department = req.token.id;
        }
        var phnBook = await phonebookModel.find(query)
        if (result.length != 0) {
            var map_result = Promise.all(
                result.map(async (data) => {
                    if (phnBook.length != 0) {
                        phnBook.map(async (phnbook) => {
                            var phnbkId = phnbook._id.toString();
                            if (data.phonebook_id == phnbkId) {
                                data.phonebook_name = phnbook.pbname
                            }
                        })
                    }
                    return data
                })
            )
            var output = await map_result;
        } else {
            var output = []
        }
        res.locals.result = output
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_campaign_summery_by_agentId(req, res, next) {
    try {
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var agentId = req.query.agentId;
        var phonebookId = req.query.phonebookId;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1
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
        }
        else {
            var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
            var End = `${yyyy}-${mm}-${dd} 23:59:59`;
        }
        var campaign_id = req.query.campaign_id
        var sql = `SELECT cc_campaign_call_summary.user_id as agent_id,CONCAT(user.first_name, ' ', user.last_name) AS agentName,agent_on_live,sum(cancel) as cancel,sum(attempted_contact) as attempted_contact,cc_campaign_call_summary.createdAt,sum(connected_count) as connected_count,sum(notconnected_count) as notconnected_count,sum(busy) as busy,sum(live_calls) as live_calls,sum(cc_campaign_call_summary.ACW) as ACW,sum(connected_duration) as connected_duration,sum(total_duration) as total_duration,sum(call_delay) as call_delay,sum(duplicate) as duplicate,sum(congestion) as congestion_count,sum(cc_campaign_call_summary.retry) as retry,sum(cc_campaign_call_summary.channel_unavailable) as channel_unavailable,user_settings.regNumber as regNumber FROM cc_campaign_call_summary LEFT JOIN user_settings ON cc_campaign_call_summary.user_id = user_settings.user_id LEFT JOIN user on user.id = cc_campaign_call_summary.user_id where campaign_id = '${campaign_id}' AND cc_campaign_call_summary.createdAt BETWEEN '${Start}' AND '${End}' `;
        if (agentId != undefined) {
            sql += `and cc_campaign_call_summary.user_id = '${agentId}' `
        }
        if (phonebookId != undefined) {
            sql += `and cc_campaign_call_summary.phonebook_id = '${phonebookId}' `
        }
        sql += `GROUP BY cc_campaign_call_summary.user_id`
        var [result] = await getConnection.query(sql)
        res.locals.result = result
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function get_schedule(campaignResult,token) {
    try {
        var current_time = new Date();
        var dd = current_time.getDate();
        var mm = current_time.getMonth() + 1;
        var yyyy = current_time.getFullYear();
        var hours = current_time.getHours();
        var min = current_time.getMinutes();
        var sec = current_time.getSeconds();
        var todayDate = `${yyyy}-${mm}-${dd}`;
        var todayDateTime = `${yyyy}-${mm}-${dd} ${hours}:${min}:${sec}`;
        var currentTime = `${hours}:${min}`;
        var currentTimeWithsec = `${hours}:${min}:${sec}`;
        var dayOfWeek = current_time.toLocaleString('en-US', { weekday: 'long' });
        var campaignResult = campaignResult;
        if (campaignResult != undefined) {
            if (campaignResult.replay != undefined) {
                var replay = campaignResult.replay;
            } else {
                var replay = 0;
            }
            if (campaignResult.update != undefined) {
                var update = campaignResult.update;
            } else {
                var update = 0;
            }
        } else {
            var replay = 0;
            var update = 0;
        }
        if (campaignResult != undefined && campaignResult != "restart") {
            var updated_campaignSql = `UPDATE cc_campaign SET is_scheduled = 0 WHERE id = '${campaignResult.id}' `;
            var [campaignRes] = await sequelize.query(updated_campaignSql);
            var campaignNameWithoutSpaces = `${campaignResult.id}`;
            var innerScheduleCampaignNameWithoutSpaces = `${campaignResult.id}` + '_s';
            var runningUnique = campaignNameWithoutSpaces + '_running'
            var pauseUnique = campaignNameWithoutSpaces + '_pause'
            var my_job = schedule.scheduledJobs[campaignNameWithoutSpaces];
            if (my_job != undefined)
                my_job.cancel();
            var innserSchedule_job = schedule.scheduledJobs[innerScheduleCampaignNameWithoutSpaces];
            if (innserSchedule_job != undefined)
                innserSchedule_job.cancel();
            var scheduledJob = scheduled_Jobs[campaignResult.id];
            if (scheduledJob) {
                clearInterval(scheduledJob.intervalId);
                delete scheduled_Jobs[campaignResult.id];
            }
            var running = schedule.scheduledJobs[runningUnique];
            if (running != undefined)
                running.cancel();
            var pause = schedule.scheduledJobs[pauseUnique];
            if (pause != undefined)
                pause.cancel();
        }
        if (campaignResult == "restart") {    //checking for server restart
            broadcastLogMessage("server restart......")
            broadcastLogMessage("server restart time......." + new Date())
            var campaignSql = `SELECT cc_campaign.id, cc_campaign.id_user, cc_campaign.id_department, type, name, description, total_contacts, caller_id, caller_id_number, audio_file, application_file, application, audio, route, frequency, retry, retry_options, call_duration, running_days, work_time_start, work_time_end, schedule_start, schedule_end, phonebook_duplicate_check, gobal_duplicate_check, dail_type, force_call_recording, force_caller_id, campaign_callerid, template, status, moh, retry_call_sec, is_scheduled, cc_campaign.createdAt, cc_campaign.updatedAt,cc_campaign_phonebook.id as cc_campaign_phonebook_id,GROUP_CONCAT(cc_campaign_phonebook.phonebook_id) as phonebook,campaign_settings.api_integration as campaign_whatsapp_integration FROM cc_campaign`
            campaignSql += ` JOIN cc_campaign_phonebook ON cc_campaign.id = cc_campaign_phonebook.campaign_id LEFT JOIN campaign_settings ON cc_campaign.id = campaign_settings.campaign_id WHERE date(schedule_end) >= '${todayDate}' and type= 2 GROUP BY cc_campaign.id`;
            var [campaign] = await getConnection.query(campaignSql);
        } else if (replay == 1) {          // replay campaign play checking
            var getSql = `SELECT cc_campaign.id, cc_campaign.id_user, cc_campaign.id_department, type, name, description, total_contacts, caller_id, caller_id_number, audio_file, application_file, application, audio, route, frequency, retry, retry_options, call_duration, running_days, work_time_start, work_time_end, schedule_start, schedule_end, phonebook_duplicate_check, gobal_duplicate_check, dail_type, force_call_recording, force_caller_id, campaign_callerid, template, status, moh, retry_call_sec, is_scheduled, cc_campaign.createdAt, cc_campaign.updatedAt,cc_campaign_phonebook.id as cc_campaign_phonebook_id,GROUP_CONCAT(cc_campaign_phonebook.phonebook_id) as phonebook,campaign_settings.api_integration as campaign_whatsapp_integration FROM cc_campaign`
            getSql += ` JOIN cc_campaign_phonebook ON cc_campaign.id = cc_campaign_phonebook.campaign_id LEFT JOIN campaign_settings ON cc_campaign.id = campaign_settings.campaign_id WHERE cc_campaign.id = '${campaignResult.id}' and type= 2 GROUP BY cc_campaign.id`;
            var [campaign] = await getConnection.query(getSql);
            var current_date_time = new Date()
            if (campaign[0].schedule_start <= current_date_time) {
                campaign[0].schedule_start = new Date(campaignResult.schedule_start);
            }
        } else if (update == 1) {        // campaign update checking
            var campaignSql = `SELECT cc_campaign.id, cc_campaign.id_user, cc_campaign.id_department, type, name, description, total_contacts, caller_id, caller_id_number, audio_file, application_file, application, audio, route, frequency, retry, retry_options, call_duration, running_days, work_time_start, work_time_end, schedule_start, schedule_end, phonebook_duplicate_check, gobal_duplicate_check, dail_type, force_call_recording, force_caller_id, campaign_callerid, template, status, moh, retry_call_sec, is_scheduled, cc_campaign.createdAt, cc_campaign.updatedAt,cc_campaign_phonebook.id as cc_campaign_phonebook_id,GROUP_CONCAT(cc_campaign_phonebook.phonebook_id) as phonebook,campaign_settings.api_integration as campaign_whatsapp_integration FROM cc_campaign`
            campaignSql += ` JOIN cc_campaign_phonebook ON cc_campaign.id = cc_campaign_phonebook.campaign_id LEFT JOIN campaign_settings ON cc_campaign.id = campaign_settings.campaign_id WHERE cc_campaign.id = '${campaignResult.id}' and type= 2`;
            var [campaign] = await getConnection.query(campaignSql);
        } else {
            var campaignSql = `SELECT cc_campaign.id, cc_campaign.id_user, cc_campaign.id_department, type, name, description, total_contacts, caller_id, caller_id_number, audio_file, application_file, application, audio, route, frequency, retry, retry_options, call_duration, running_days, work_time_start, work_time_end, schedule_start, schedule_end, phonebook_duplicate_check, gobal_duplicate_check, dail_type, force_call_recording, force_caller_id, campaign_callerid, template, status, moh, retry_call_sec, is_scheduled, cc_campaign.createdAt, cc_campaign.updatedAt,cc_campaign_phonebook.id as cc_campaign_phonebook_id,GROUP_CONCAT(cc_campaign_phonebook.phonebook_id) as phonebook,campaign_settings.api_integration as campaign_whatsapp_integration FROM cc_campaign`
            campaignSql += ` JOIN cc_campaign_phonebook ON cc_campaign.id = cc_campaign_phonebook.campaign_id LEFT JOIN campaign_settings ON cc_campaign.id = campaign_settings.campaign_id WHERE date(schedule_start) >= '${todayDate}' and date(schedule_end) >= '${todayDate}' and type= 2 and is_scheduled = 0  GROUP BY cc_campaign.id`;
            var [campaign] = await getConnection.query(campaignSql);
        }
        if (campaign.length != 0) {
            var map_result = Promise.all(
                campaign.map(async (data) => {
                    var campaignId = data.id;
                    var id_user = data.id_user;
                    var id_department = data.id_department;
                    if(data.caller_id_number){
                         var caller_id = data.caller_id_number;
                    }else{
                         var caller_id = 0;
                    }
                    var appId = data.application_file;
                    var phnbookId = data.phonebook.split(",");
                    var campaignName = data.name;
                    var retryCount = data.retry;
                    var frequency = data.frequency;
                    var route = data.route;
                    var call_duration = data.call_duration;
                    var failedCallSec = data.retry_call_sec;
                    var uniqueName = `${data.id}`;
                    var start_schedule_date = data.schedule_start;
                    var end_schedule_date = data.schedule_end;
                    var workingStartTime = data.work_time_start.split(" ")
                    const [working_starthours, working_startminutes, period] = data.work_time_start.split(/:| /);
                    let formattedHours = parseInt(working_starthours, 10);
                    let formattedminutes = parseInt(working_startminutes);
                    if (period == 'PM' && formattedHours !== 12) {
                        formattedHours += 12;
                        var updatedwork_time_start = `${formattedHours}:${formattedminutes}`;
                    } else {
                        var updatedwork_time_start = workingStartTime[0]
                    }
                    var campaginWorkingStartTime = updatedwork_time_start + ':00';
                    var workingEndTime = data.work_time_end.split(" ")
                    const [working_endhours, working_endminutes, endperiod] = data.work_time_end.split(/:| /);
                    let formattedEndHours = parseInt(working_endhours, 10);
                    let formattedEndMinutes = parseInt(working_endminutes);
                    if (endperiod == 'PM' && formattedEndHours !== 12) {
                        formattedEndHours += 12;
                        var workingTimeEnd = `${formattedEndHours}:${formattedEndMinutes}`;
                    } else {
                        var workingTimeEnd = workingEndTime[0]
                    }
                    var campaginWorkingEndTime = workingTimeEnd + ':00';
                    var byotSql = `SELECT byot FROM customers WHERE id = ${id_user}`;
                    var [byotRes] = await getConnection.query(byotSql);
                    var byot = byotRes[0].byot
                    var callRecordSql = `SELECT outgoing_provider,id_user,fwd_provider,pricing_plan,id_pay_per_channel_plans FROM did WHERE did = '${caller_id}'`;
                    var [outgoing_provider] = await getConnection.query(callRecordSql);
                    if (outgoing_provider.length != 0) {
                        var didProvider = outgoing_provider[0].outgoing_provider
                        var fwd_provider = outgoing_provider[0].fwd_provider
                    } else {
                        var didProvider = 0;
                        var fwd_provider = 0;
                    }
                    if (new Date() < start_schedule_date) {           //schedule for campaign running
                        var rununiqueName = uniqueName + '_running'
                        const statusRunning = schedule.scheduleJob(rununiqueName, data.schedule_start, async () => {
                            if (outgoing_provider.length != 0) {
                                if (outgoing_provider[0].pricing_plan != 1 && outgoing_provider[0].id_pay_per_channel_plans != 1) {
                                    var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                                    var [transRes] = await getConnection.query(transSql);
                                    if (transRes.length != 0) {
                                        broadcastLogMessage("trans_creditLimit in campaign status(running) schedule................." + transRes[0].trans_creditLimit)
                                        var transCredit = transRes[0].trans_credit;
                                        broadcastLogMessage("transCredit in campaign status(running) schedule................." + transCredit)
                                        if (transCredit <= 0) {
                                            console.log("No balance.................");
                                            broadcastLogMessage("No balance.................")
                                        } else {
                                            console.log("campaign running...............", new Date())
                                            broadcastLogMessage("campaign running...............," + "campaignId :" + campaignId + "," + new Date())
                                            var campaignSql = `UPDATE cc_campaign SET status = 1 WHERE id = '${campaignId}' `;
                                            var [campaignRes] = await sequelize.query(campaignSql);
                                        }
                                    }
                                } else {
                                    console.log("campaign running...............", new Date())
                                    broadcastLogMessage("campaign running...............," + "campaignId :" + campaignId + "," + new Date())
                                    var campaignSql = `UPDATE cc_campaign SET status = 1 WHERE id = '${campaignId}' `;
                                    var [campaignRes] = await sequelize.query(campaignSql);
                                }
                            } else {
                                console.log("campaign running...............", new Date())
                                broadcastLogMessage("campaign running...............," + "campaignId :" + campaignId + "," + new Date())
                                var campaignSql = `UPDATE cc_campaign SET status = 1 WHERE id = '${campaignId}' `;
                                var [campaignRes] = await sequelize.query(campaignSql);
                            }
                        })
                    }
                    if (new Date() < end_schedule_date) {              //schedule for campaign expired
                        var pauseuniqueName = uniqueName + '_pause'      // campaign expired
                        const status = schedule.scheduleJob(pauseuniqueName, data.schedule_end, async () => {
                            console.log("campaign Expired...............", new Date())
                            broadcastLogMessage("campaign Expired...............," + "campaignId :" + campaignId +","+ new Date())
                            var campaignSql = `UPDATE cc_campaign SET status = 4 WHERE id = '${campaignId}' `;
                            var [campaignRes] = await sequelize.query(campaignSql);
                            var campaignNameWithoutSpaces = `${data.id}`;
                            var innerScheduleCampaignNameWithoutSpaces = `${data.id}` + '_s';
                            var my_job = schedule.scheduledJobs[campaignNameWithoutSpaces];
                            if (my_job != undefined)
                                my_job.cancel();
                            var innserSchedule_job = schedule.scheduledJobs[innerScheduleCampaignNameWithoutSpaces];
                            if (innserSchedule_job != undefined)
                                innserSchedule_job.cancel();
                            var scheduledJob = scheduled_Jobs[data.id];
                            if (scheduledJob) {
                                clearInterval(scheduledJob.intervalId);
                                delete scheduled_Jobs[data.id];
                            }
                        })
                    }
                    
                    if (campaignResult != "restart") {   //  normal campaign schedule
                        broadcastLogMessage("campaign(inside get_schedule function)......." + new Date() + ",campaignId : " + data.id)
                        broadcastLogMessage(data)
                        var msg = 'updateBroadcastCampaign'
                        var socket = await adminSocket(id_user, msg, campaignId);
                        var schedule_start_date = new Date(start_schedule_date);
                        var start_dd = schedule_start_date.getDate();
                        var start_mm = schedule_start_date.getMonth() + 1;
                        var start_hours = schedule_start_date.getHours();
                        var start_min = schedule_start_date.getMinutes();
                        var start_sec = schedule_start_date.getSeconds();
                        if (replay == 1) {          // campaign play time(formatted time)
                            var updated_start_sec = sec + 10
                            if (updated_start_sec > 60) {
                                updated_start_sec = updated_start_sec - 60;
                                start_min = start_min + 1;
                            }
                            var formattedTime = `${updated_start_sec} ${start_min} ${start_hours} ${start_dd} ${start_mm} *`;
                        } else {
                            var formattedTime = `${start_sec} ${start_min} ${start_hours} ${start_dd} ${start_mm} *`;
                        }
                        var campaignName = data.name;
                        var status = data.status;
                        var campaignSql = `UPDATE cc_campaign SET is_scheduled = 1 WHERE id = '${campaignId}' `;
                        var [campaignRes] = await sequelize.query(campaignSql);
                        var dayArr = []
                        var runningDays = data.running_days.split(",")
                        runningDays.map(async (days) => {
                            let day = days;
                            let dayWithoutSpace = day.replace(/\s/g, '');
                            if (dayWithoutSpace == "Sunday") {
                                dayArr.push(0)
                            } else if (dayWithoutSpace == "Monday") {
                                dayArr.push(1)
                            } else if (dayWithoutSpace == "Tuesday") {
                                dayArr.push(2)
                            } else if (dayWithoutSpace == "Wednesday") {
                                dayArr.push(3)
                            } else if (dayWithoutSpace == "Thursday") {
                                dayArr.push(4)
                            } else if (dayWithoutSpace == "Friday") {
                                dayArr.push(5)
                            } else if (dayWithoutSpace == "Saturday") {
                                dayArr.push(6)
                            }
                        })
                        console.log(formattedTime)
                        console.log(todayDateTime)
                        broadcastLogMessage("campaign formattedTime..............." + formattedTime + ",campaignId :" + campaignId + ",Current time..........." + new Date())
                        var job = schedule.scheduleJob(uniqueName, formattedTime, async () => {     // outer schedule, schedule for campaign start time
                            broadcastLogMessage("campaign schedule time................." + new Date())
                            broadcastLogMessage("campaign schedule ................." + formattedTime)
                            broadcastLogMessage("campaign schedule id................." + campaignId)
                            var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                            var [transRes] = await getConnection.query(transSql);
                            if (transRes.length != 0) {
                                broadcastLogMessage("trans_creditLimit in campaign schedule start................." + transRes[0].trans_creditLimit)
                                var transCredit = transRes[0].trans_credit;
                                broadcastLogMessage("transCredit in campaign schedule start................." + transCredit)
                                if (transCredit <= 0) {
                                    console.log("No balance.................");
                                    broadcastLogMessage("No balance.................")
                                } else {
                                    if (new Date() >= end_schedule_date) {     // end date checking and cancel schedule
                                        var ScheduleUniqueName = uniqueName
                                        var innerScheduleUniqueName = uniqueName + '_s'
                                        var schedule_job = schedule.scheduledJobs[ScheduleUniqueName];
                                        if (schedule_job != undefined)
                                            schedule_job.cancel();
                                        console.log('Scheduled job canceled.....');
                                        var innserSchedule_job = schedule.scheduledJobs[innerScheduleUniqueName];
                                        if (innserSchedule_job != undefined)
                                            innserSchedule_job.cancel();
                                        console.log('Inner Scheduled job canceled.');
                                        var scheduledJob = scheduled_Jobs[campaignId];
                                        if (scheduledJob) {
                                            clearInterval(scheduledJob.intervalId);
                                            delete scheduled_Jobs[campaignId];
                                        }
                                    } else {
                                        var campaignGetSql = `select status from cc_campaign WHERE id = '${campaignId}' `;
                                        var [campaignGetRes] = await sequelize.query(campaignGetSql);
                                        if(campaignGetRes[0].status != 1){
                                            console.log("campaign running...............", new Date())
                                            broadcastLogMessage("campaign running...............," + "campaignId :" + campaignId + "," + new Date())
                                            var campaignSql = `UPDATE cc_campaign SET status = 1 WHERE id = '${campaignId}' `;
                                            var [campaignRes] = await sequelize.query(campaignSql);
                                            broadcastLogMessage("status update query ----->"+campaignSql + "," + "campaignId :" + campaignId + "," + new Date())
                                        }
                                        var currentTime = new Date();
                                        var currenthours = currentTime.getHours();
                                        var currentmin = currentTime.getMinutes();
                                        var currentsec = currentTime.getSeconds();
                                        var currentCampaignTimeWithsec = `${currenthours}:${currentmin}:${currentsec}`;
                                        var currentDate = new Date();
                                        var startTime = new Date(currentDate.toDateString() + ' ' + campaginWorkingStartTime);
                                        var endTime = new Date(currentDate.toDateString() + ' ' + campaginWorkingEndTime);
                                        var currentTimeDate = new Date(currentDate.toDateString() + ' ' + currentCampaignTimeWithsec)
                                        if (currentTimeDate.getTime() === startTime.getTime() || startTime.getTime() < currentTimeDate.getTime()) {   // campaign working time checking, current time or future time
                                            const rule = new schedule.RecurrenceRule();
                                            rule.dayOfWeek = dayArr;
                                            rule.hour = currentTimeDate.getHours();
                                            rule.minute = currentTimeDate.getMinutes();
                                            var rule_second = currentTimeDate.getSeconds() + 10;      // add 10 sec, current time schedule not working so 10 sec extra added
                                            if (rule_second > 60) {
                                                rule_second = updated_start_sec - 60;
                                                rule.minute = rule.minute + 1;
                                            }
                                            rule.second = rule_second;
                                            var innerScheduleUniqueName = uniqueName + '_s'
                                            broadcastLogMessage("campaign inner schedule role...............")
                                            broadcastLogMessage(rule)
                                            broadcastLogMessage("campaign end_schedule_date...............," + end_schedule_date)
                                            var scheduleInnerJob = schedule.scheduleJob(innerScheduleUniqueName, { rule, end_schedule_date }, async () => {    // inner schedule, end_schedule_date is schedule end time
                                                broadcastLogMessage("inner schedule campaign time................." + new Date())
                                                broadcastLogMessage("inner schedule campaign id................." + campaignId)
                                                var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                                                var [transRes] = await getConnection.query(transSql);
                                                if (transRes.length != 0) {
                                                    broadcastLogMessage("trans_creditLimit in campaign inner schedule................." + transRes[0].trans_creditLimit)
                                                    var transCredit = transRes[0].trans_credit;
                                                    broadcastLogMessage("transCredit in campaign inner schedule................." + transCredit)
                                                    if (transCredit <= 0) {
                                                        console.log("No balance.................");
                                                        broadcastLogMessage("No balance.................")
                                                    } else {
                                                        var result = await phonebook_contactsModel.aggregate([
                                                            {
                                                                $lookup: {
                                                                    from: 'contacts_statuses',
                                                                    let: { contactId: '$_id' }, // Variables to use in the pipeline
                                                                    pipeline: [
                                                                        {
                                                                            $match: {
                                                                                $expr: { $eq: ['$contactId', '$$contactId'] },
                                                                                'phonebook_id': { $in: phnbookId }, 'campaignId': campaignId
                                                                            },
                                                                        },
                                                                    ],
                                                                    as: 'c_status'
                                                                }
                                                            },
                                                            {
                                                                $match: {
                                                                    'phonebook_id': { $in: phnbookId },
                                                                    'c_status': { $eq: [] }  // Check if status array is empty
                                                                },
                                                            },
                                                        ]);
                                                        broadcastLogMessage("contact count in schedule : " + result.length)
                                                        if (result.length != 0) {
                                                            if (new Date() >= end_schedule_date) {     // checking end time inside schedule
                                                                var ScheduleUniqueName = uniqueName
                                                                var innerScheduleUniqueName = uniqueName + '_s'
                                                                var schedule_job = schedule.scheduledJobs[ScheduleUniqueName];
                                                                if (schedule_job != undefined)
                                                                    schedule_job.cancel();
                                                                console.log('Scheduled job canceled.....');
                                                                var innserSchedule_job = schedule.scheduledJobs[innerScheduleUniqueName];
                                                                if (innserSchedule_job != undefined)
                                                                    innserSchedule_job.cancel();
                                                                console.log('Inner Scheduled job canceled.');
                                                                var scheduledJob = scheduled_Jobs[campaignId];
                                                                if (scheduledJob) {
                                                                    clearInterval(scheduledJob.intervalId);
                                                                    delete scheduled_Jobs[campaignId];
                                                                }
                                                            } else {
                                                                broadcastLogMessage('Scheduled campaign...............................................' + new Date());
                                                                console.log('Scheduled campaign...............................................', new Date());
                                                                broadcastLogMessage('campaign name : ' + campaignName + ",campaignId : " + campaignId);
                                                                console.log('campaign name : ', campaignName + ",campaignId : ", campaignId);
                                                                var summary_date = new Date();
                                                                var dd = summary_date.getDate();
                                                                var mm = summary_date.getMonth() + 1;
                                                                var yyyy = summary_date.getFullYear();
                                                                var dateCheking = `${yyyy}-${mm}-${dd}`;
                                                                var phonebookStr = phnbookId.map(pb => `'${pb}'`).join(',');
                                                                var existCheckingSql = `SELECT * FROM cc_campaign_call_summary WHERE campaign_id = '${campaignId}' and phonebook_id IN(${phonebookStr}) AND DATE(createdAt) = '${dateCheking}'`;
                                                                var [existChecking] = await getConnection.query(existCheckingSql);
                                                                broadcastLogMessage("existing checking in cc_campaign_call_summary : " + existChecking.length + ",campaignId : " + campaignId)
                                                                if (existChecking.length == 0) {
                                                                    var summarydata = [];
                                                                    phnbookId.map((phnbook) => {
                                                                        summarydata.push({
                                                                            id_user: id_user,
                                                                            id_department: id_department,
                                                                            phonebook_id: phnbook,
                                                                            campaign_id: campaignId
                                                                        })
                                                                    })
                                                                    var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(summarydata);
                                                                    broadcastLogMessage("insert cc_campaign_call_summary table,campaignId : " + campaignId)
                                                                    broadcastLogMessage(addcampaignSummary)
                                                                } else {
                                                                    var summarydata = [];
                                                                    existingPhnbook = []
                                                                    existChecking.map((exist) => {
                                                                        existingPhnbook.push(exist.phonebook_id)
                                                                    })
                                                                    const remainingphbBookData = phnbookId.filter(phn => !existingPhnbook.includes(phn));
                                                                    if (remainingphbBookData.length != 0) {
                                                                        remainingphbBookData.map((phnbook) => {
                                                                            summarydata.push({
                                                                                id_user: id_user,
                                                                                id_department: id_department,
                                                                                phonebook_id: phnbook,
                                                                                campaign_id: campaignId
                                                                            })
                                                                        })
                                                                    }
                                                                    if (summarydata.length != 0) {
                                                                        var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(summarydata);
                                                                        broadcastLogMessage("insert cc_campaign_call_summary table,campaignId : " + campaignId)
                                                                        broadcastLogMessage(addcampaignSummary)
                                                                    }
                                                                }
                                                                var wpSql = `SELECT api_integration  FROM  campaign_settings  WHERE campaign_id = '${campaignId}'`;
                                                                var [wpres] = await getConnection.query(wpSql);
                                                                broadcastLogMessage("wpSql..." + wpSql)
                                                                broadcastLogMessage("wpres length..." + wpres.length)
                                                                console.log("wpres...", wpres)
                                                                var whatsapp_integration = 0
                                                                if (wpres.length != 0) {
                                                                    whatsapp_integration = wpres[0].api_integration;
                                                                    if (whatsapp_integration == null) {
                                                                        whatsapp_integration = 0
                                                                    }
                                                                } else {
                                                                    whatsapp_integration = 0
                                                                }
                                                                var transSql = `SELECT balance as trans_credit FROM customers WHERE id = ${id_user}`;
                                                                var [transRes] = await getConnection.query(transSql);
                                                                if (transRes.length != 0) {
                                                                    var trans_credit = transRes[0].trans_credit
                                                                    if (trans_credit <= 10) {
                                                                        frequency = 1
                                                                    } else if (trans_credit < 20) {
                                                                        frequency = 2
                                                                    }
                                                                }
                                                                broadcastLogMessage("frequency................." + frequency)
                                                                var phonebookdata = result.slice(0, frequency);
                                                                phonebookdata.map(async (phnData) => {
                                                                    var obj = {
                                                                        id_user: id_user,
                                                                        id_department: id_department,
                                                                        phonebook_id: phnData.phonebook_id,
                                                                        campaignId: campaignId,
                                                                        contactId: phnData._id,
                                                                        status: 0,
                                                                        retryCount: 1,
                                                                        attempt: 1
                                                                    }
                                                                    var insertContacts = await contactStatusModel.create(obj);
                                                                    var phnNumber = phnData.phone_number;
                                                                    var phnbook_Id = phnData.phonebook_id;
                                                                    var contactStatusId = insertContacts.id;
                                                                    // broadcastLogMessage("phnNumber =" + phnNumber)
                                                                    function generateRandomSixDigitNumber() {
                                                                        return Math.floor(100000 + Math.random() * 900000);
                                                                    }
                                                                    var uniqueID = generateRandomSixDigitNumber();
                                                                    var livecalls = {
                                                                        id_user: id_user,
                                                                        id_department: id_department,
                                                                        id_campaign: campaignId,
                                                                        didNumber: caller_id,
                                                                        contact_number: phnNumber,
                                                                        callDirection: 2,
                                                                        calltype: 1,
                                                                        is_data_submited: 1,
                                                                        uniqueId: uniqueID,
                                                                        contact_status_id: insertContacts.id
                                                                    }
                                                                    var addlivecalls = await livecallsModel.create(livecalls);
                                                                    var campaignSummary = `UPDATE cc_campaign_call_summary SET live_calls = live_calls + 1,attempted_contact = attempted_contact + 1 WHERE campaign_id = '${campaignId}' and phonebook_id = '${phnbook_Id}' and id_user = '${id_user}' and id_department = '${id_department}' AND DATE(createdAt) = '${dateCheking}'`;
                                                                    var [campaignSummaryRes] = await sequelize.query(campaignSummary);
                                                                    console.log("whatsapp_integration...", whatsapp_integration)
                                                                    broadcastLogMessage("whatsapp_integration..." + whatsapp_integration + ",campaignId : " + campaignId)
                                                                    var broadcast = ami.campaign_broadcast_click_to_call(phnNumber, contactStatusId, campaignId, phnbook_Id, caller_id, uniqueID, id_user, appId, whatsapp_integration, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                    broadcastLogMessage("send to campaign_broadcast_click_to_call ----> phnNumber:"+phnNumber+', contactStatusId:'+contactStatusId+', campaignId:'+campaignId+', phnbook_Id:'+phnbook_Id+', caller_id:'+caller_id+', uniqueID:'+uniqueID+', id_user:'+id_user+', appId:'+appId+', whatsapp_integration:'+whatsapp_integration+', didProvider:'+didProvider+ ', call_duration:' + call_duration + ', fwd_provider:' + fwd_provider + ', token:' + token + ', byot:' + byot+', route:' + route)
                                                                    if (process.env.PRODUCTION == 'development') {
                                                                        var logDataJson = {}
                                                                        logDataJson.apiSettingIsEnabled = whatsapp_integration
                                                                        var callStatus = 'ANSWER'
                                                                        var selectRes = [{ "contact_number": phnNumber }]
                                                                        // var apiIntegration = ami.api_integration(callStatus, logDataJson, campaignId, selectRes);
                                                                    }
                                                                    broadcastLogMessage("first try................" + phnNumber + ",campaignId : " + campaignId)
                                                                    logMessage("first try................" + phnNumber + ",campaignId : " + campaignId)
                                                                    logMessage("passing data to campaign_broadcast_click_to_call function : " + phnNumber + ',' + contactStatusId + ',' + campaignId + ',' + phnbook_Id + ',' + caller_id + ',' + uniqueID + ',' + id_user + ',' + appId + ',' + whatsapp_integration + ',' + didProvider  + ',' + call_duration + ',' + fwd_provider + ',' + token + ',' + byot+',' + route)
                                                                });
                                                                result.splice(0, frequency);
                                                                logMessage("passing contact to setinterval function after 1st try contact removed : " + result.length + ' campaignId,' + campaignId)
                                                                var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                                                                var [transRes] = await getConnection.query(transSql);
                                                                if (transRes.length != 0) {
                                                                    broadcastLogMessage("trans_creditLimit,before contact pass to setintervel or retry................." + transRes[0].trans_creditLimit)
                                                                    var transCredit = transRes[0].trans_credit;
                                                                    broadcastLogMessage("transCredit,before contact pass to setintervel or retry................." + transCredit)
                                                                    if (transCredit <= 0) {
                                                                        console.log("No balance.................");
                                                                        broadcastLogMessage("No balance.................")
                                                                        var campaignSql = `UPDATE cc_campaign SET status = 2 WHERE id = '${campaignId}' `;
                                                                        var [campaignRes] = await sequelize.query(campaignSql);
                                                                        var msg = 'campaignPausedRecharge'
                                                                        var socket = await adminSocket(id_user, msg, campaignId);
                                                                    } else {
                                                                        if (result.length != 0) {
                                                                            var updatedRetryCount = 0;
                                                                            var retry = "no retry";
                                                                            var contacts = await get_setInterval(result, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                        } else {
                                                                            var retry = "retry";
                                                                            var updatedRetryCount = 1;
                                                                            var retrycontacts = await get_retry(result, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        } else {
                                                            var retry = "retry";
                                                            var updatedRetryCount = 1;
                                                            var retrycontacts = await get_retry(result, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                                                        }
                                                    }
                                                }
                                            });
                                        } else {
                                            var innerScheduleUniqueName = uniqueName + '_s'
                                            const rule = new schedule.RecurrenceRule();
                                            rule.dayOfWeek = dayArr;
                                            rule.hour = startTime.getHours();
                                            rule.minute = startTime.getMinutes();
                                            rule.second = startTime.getSeconds();
                                            broadcastLogMessage("campaign inner schedule role...............")
                                            broadcastLogMessage(rule)
                                            broadcastLogMessage("campaign end_schedule_date...............," + end_schedule_date)
                                            var InnerScheduleJob = schedule.scheduleJob(innerScheduleUniqueName, { rule, end_schedule_date }, async () => {
                                                broadcastLogMessage("inner schedule campaign time................." + new Date())
                                                broadcastLogMessage("inner schedule campaign id................." + campaignId)
                                                var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                                                var [transRes] = await getConnection.query(transSql);
                                                if (transRes.length != 0) {
                                                    broadcastLogMessage("trans_creditLimit in campaign inner schedule................." + transRes[0].trans_creditLimit)
                                                    var transCredit = transRes[0].trans_credit;
                                                    broadcastLogMessage("transCredit in campaign inner schedule................." + transCredit)
                                                    if (transCredit <= 0) {
                                                        console.log("No balance.................");
                                                        broadcastLogMessage("No balance.................")
                                                    } else {
                                                        var result = await phonebook_contactsModel.aggregate([
                                                            {
                                                                $lookup: {
                                                                    from: 'contacts_statuses',
                                                                    let: { contactId: '$_id' }, // Variables to use in the pipeline
                                                                    pipeline: [
                                                                        {
                                                                            $match: {
                                                                                $expr: { $eq: ['$contactId', '$$contactId'] },
                                                                                'phonebook_id': { $in: phnbookId }, 'campaignId': campaignId
                                                                            },
                                                                        },
                                                                    ],
                                                                    as: 'c_status'
                                                                }
                                                            },
                                                            {
                                                                $match: {
                                                                    'phonebook_id': { $in: phnbookId },
                                                                    'c_status': { $eq: [] }  // Check if status array is empty
                                                                },
                                                            },
                                                        ]);
                                                        broadcastLogMessage("contact count in schedule : " + result.length)
                                                        if (result.length != 0) {
                                                            if (new Date() >= end_schedule_date) {    // checking end time inside schedule
                                                                var innerScheduleUniqueName = uniqueName + '_s'
                                                                var schedule_job = schedule.scheduledJobs[ScheduleUniqueName];
                                                                if (schedule_job != undefined)
                                                                    schedule_job.cancel();
                                                                console.log('Scheduled job canceled.....');
                                                                var innserSchedule_job = schedule.scheduledJobs[innerScheduleUniqueName];
                                                                if (innserSchedule_job != undefined)
                                                                    innserSchedule_job.cancel();
                                                                console.log('Inner Scheduled job canceled.');
                                                                var scheduledJob = scheduled_Jobs[campaignId];
                                                                if (scheduledJob) {
                                                                    clearInterval(scheduledJob.intervalId);
                                                                    delete scheduled_Jobs[campaignId];
                                                                }
                                                            } else {
                                                                console.log("......................... innerSchedule.....")
                                                                console.log(status)
                                                                broadcastLogMessage('Scheduled campaign...............................................' + new Date());
                                                                console.log('Scheduled campaign...............................................', new Date());
                                                                broadcastLogMessage('campaign name : ' + campaignName + ",campaignId : " + campaignId);
                                                                console.log('campaign name : ' + campaignName + ",campaignId : ", campaignId);
                                                                var summary_date = new Date();
                                                                var dd = summary_date.getDate();
                                                                var mm = summary_date.getMonth() + 1;
                                                                var yyyy = summary_date.getFullYear();
                                                                var dateCheking = `${yyyy}-${mm}-${dd}`;
                                                                var phonebookStr = phnbookId.map(pb => `'${pb}'`).join(',');
                                                                var existCheckingSql = `SELECT * FROM cc_campaign_call_summary WHERE campaign_id = '${campaignId}' and phonebook_id IN(${phonebookStr}) AND DATE(createdAt) = '${dateCheking}'`;
                                                                var [existChecking] = await getConnection.query(existCheckingSql);
                                                                broadcastLogMessage("existing checking in cc_campaign_call_summary : " + existChecking.length + ",campaignId : " + campaignId)
                                                                if (existChecking.length == 0) {
                                                                    var summarydata = [];
                                                                    phnbookId.map((phnbook) => {
                                                                        summarydata.push({
                                                                            id_user: id_user,
                                                                            id_department: id_department,
                                                                            phonebook_id: phnbook,
                                                                            campaign_id: campaignId
                                                                        })
                                                                    })
                                                                    var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(summarydata);
                                                                    broadcastLogMessage("insert cc_campaign_call_summary table,campaignId : " + campaignId)
                                                                    broadcastLogMessage(addcampaignSummary)
                                                                } else {
                                                                    var summarydata = [];
                                                                    existingPhnbook = []
                                                                    existChecking.map((exist) => {
                                                                        existingPhnbook.push(exist.phonebook_id)
                                                                    })
                                                                    const remainingphbBookData = phnbookId.filter(phn => !existingPhnbook.includes(phn));
                                                                    if (remainingphbBookData.length != 0) {
                                                                        remainingphbBookData.map((phnbook) => {
                                                                            summarydata.push({
                                                                                id_user: id_user,
                                                                                id_department: id_department,
                                                                                phonebook_id: phnbook,
                                                                                campaign_id: campaignId
                                                                            })
                                                                        })
                                                                    }
                                                                    if (summarydata.length != 0) {
                                                                        var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(summarydata);
                                                                        broadcastLogMessage("insert cc_campaign_call_summary table,campaignId : " + campaignId)
                                                                        broadcastLogMessage(addcampaignSummary)
                                                                    }
                                                                }
                                                                var wpSql = `SELECT api_integration  FROM  campaign_settings  WHERE campaign_id = '${campaignId}'`;
                                                                var [wpres] = await getConnection.query(wpSql);
                                                                var whatsapp_integration = 0
                                                                if (wpres.length != 0) {
                                                                    whatsapp_integration = wpres[0].api_integration;
                                                                    if (whatsapp_integration == null) {
                                                                        whatsapp_integration = 0
                                                                    }
                                                                } else {
                                                                    whatsapp_integration = 0
                                                                }
                                                                broadcastLogMessage("wpSql..." + wpSql)
                                                                broadcastLogMessage("wpres length..." + wpres.length)
                                                                var transSql = `SELECT balance as trans_credit FROM customers WHERE id = ${id_user}`;
                                                                var [transRes] = await getConnection.query(transSql);
                                                                if (transRes.length != 0) {
                                                                    var trans_credit = transRes[0].trans_credit
                                                                    if (trans_credit <= 10) {
                                                                        frequency = 1
                                                                    } else if (trans_credit < 20) {
                                                                        frequency = 2
                                                                    }
                                                                }
                                                                var phonebookdata = result.slice(0, frequency);
                                                                broadcastLogMessage("frequency................." + frequency)
                                                                phonebookdata.map(async (phnData) => {
                                                                    var obj = {
                                                                        id_user: id_user,
                                                                        id_department: id_department,
                                                                        phonebook_id: phnData.phonebook_id,
                                                                        campaignId: campaignId,
                                                                        contactId: phnData._id,
                                                                        status: 0,
                                                                        retryCount: 1,
                                                                        attempt: 1
                                                                    }
                                                                    var insertContacts = await contactStatusModel.create(obj);
                                                                    var phnNumber = phnData.phone_number;
                                                                    var phnbook_Id = phnData.phonebook_id;
                                                                    var contactStatusId = insertContacts.id;
                                                                    // broadcastLogMessage("phnNumber =" + phnNumber)
                                                                    function generateRandomSixDigitNumber() {
                                                                        return Math.floor(100000 + Math.random() * 900000);
                                                                    }
                                                                    var uniqueID = generateRandomSixDigitNumber();
                                                                    var livecalls = {
                                                                        id_user: id_user,
                                                                        id_department: id_department,
                                                                        id_campaign: campaignId,
                                                                        didNumber: caller_id,
                                                                        contact_number: phnNumber,
                                                                        callDirection: 2,
                                                                        calltype: 1,
                                                                        is_data_submited: 1,
                                                                        uniqueId: uniqueID,
                                                                        contact_status_id: insertContacts.id
                                                                    }
                                                                    var addlivecalls = await livecallsModel.create(livecalls);
                                                                    var campaignSummary = `UPDATE cc_campaign_call_summary SET live_calls = live_calls + 1,attempted_contact = attempted_contact + 1 WHERE campaign_id = '${campaignId}' and phonebook_id = '${phnbook_Id}' and id_user = '${id_user}' and id_department = '${id_department}' AND DATE(createdAt) = '${dateCheking}'`;
                                                                    var [campaignSummaryRes] = await sequelize.query(campaignSummary);
                                                                    console.log("whatsapp_integration...", whatsapp_integration)
                                                                    broadcastLogMessage("whatsapp_integration..." + whatsapp_integration + ",campaignId : " + campaignId)
                                                                    var broadcast = ami.campaign_broadcast_click_to_call(phnNumber, contactStatusId, campaignId, phnbook_Id, caller_id, uniqueID, id_user, appId, whatsapp_integration, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                    broadcastLogMessage("send to campaign_broadcast_click_to_call : "+phnNumber+','+contactStatusId+','+campaignId+','+phnbook_Id+','+caller_id+','+uniqueID+','+id_user+','+appId+','+whatsapp_integration+','+didProvider+ ',' + call_duration + ',' + fwd_provider + ',' + token + ',' + byot+',' + route)
                                                                    if (process.env.PRODUCTION == 'development') {
                                                                        var logDataJson = {}
                                                                        logDataJson.apiSettingIsEnabled = whatsapp_integration
                                                                        var callStatus = 'ANSWER'
                                                                        var selectRes = [{ "contact_number": phnNumber }]
                                                                        // var apiIntegration = ami.api_integration(callStatus, logDataJson, campaignId, selectRes);
                                                                    }
                                                                    broadcastLogMessage("first try................" + phnNumber + ",campaignId : " + campaignId)
                                                                    logMessage("first try................" + phnNumber + ",campaignId : " + campaignId)
                                                                    logMessage("passing data to campaign_broadcast_click_to_call function : " + phnNumber + ',' + contactStatusId + ',' + campaignId + ',' + phnbook_Id + ',' + caller_id + ',' + uniqueID + ',' + id_user + ',' + appId + ',' + whatsapp_integration + ',' + didProvider  + ',' + call_duration + ',' + fwd_provider)
                                                                });
                                                                result.splice(0, frequency);
                                                                logMessage("passing contact to setinterval function after 1st try contact removed : " + result.length + ' campaignId,' + campaignId)
                                                                var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                                                                var [transRes] = await getConnection.query(transSql);
                                                                if (transRes.length != 0) {
                                                                    broadcastLogMessage("trans_creditLimit,before contact pass to setintervel or retry................." + transRes[0].trans_creditLimit)
                                                                    var transCredit = transRes[0].trans_credit;
                                                                    broadcastLogMessage("transCredit,before contact pass to setintervel or retry................." + transCredit)
                                                                    if (transCredit <= 0) {
                                                                        console.log("No balance.................");
                                                                        broadcastLogMessage("No balance.................")
                                                                        var campaignSql = `UPDATE cc_campaign SET status = 2 WHERE id = '${campaignId}' `;
                                                                        var [campaignRes] = await sequelize.query(campaignSql);
                                                                        var msg = 'campaignPausedRecharge'
                                                                        var socket = await adminSocket(id_user, msg, campaignId);
                                                                    } else {
                                                                        if (result.length != 0) {
                                                                            var updatedRetryCount = 0;
                                                                            var retry = "no retry";
                                                                            var contacts = await get_setInterval(result, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                        } else {        // result is empty: retry start
                                                                            var retry = "retry";
                                                                            var updatedRetryCount = 1;
                                                                            var retrycontacts = await get_retry(result, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        } else {        // result is empty: retry start
                                                            var retry = "retry";
                                                            var updatedRetryCount = 1;
                                                            var retrycontacts = await get_retry(result, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                        });
                    } else {   // server restart 
                        if (data.status == 0 || data.status == 1) {
                            broadcastLogMessage("campaign restart(inside get_schedule function)......." + new Date() + ",campaignId : " + data.id)
                            broadcastLogMessage(data)
                            broadcastLogMessage("server restart running campaign id......." + campaignId)
                            var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                            var [transRes] = await getConnection.query(transSql);
                            if (transRes.length != 0) {
                                broadcastLogMessage("trans_creditLimit server restart time(campaign running)................." + transRes[0].trans_creditLimit)
                                var transCredit = transRes[0].trans_credit;
                                broadcastLogMessage("transCredit server restart time(campaign running)................." + transCredit)
                                if (transCredit <= 0) {
                                    console.log("No balance.................");
                                    broadcastLogMessage("No balance.................")
                                    var campaignSql = `UPDATE cc_campaign SET status = 2 WHERE id = '${campaignId}' `;
                                    var [campaignRes] = await sequelize.query(campaignSql);
                                    var msg = 'campaignPausedRecharge'
                                    var socket = await adminSocket(id_user, msg, campaignId);
                                } else {
                                    var msg = 'updateBroadcastCampaign'
                                    var socket = await adminSocket(id_user, msg, campaignId);
                                    var start = new Date();
                                    if (start_schedule_date < start) {    // start time checking start date is previous time so formattedTime is current time
                                        var start_dd = start.getDate();
                                        var start_mm = start.getMonth() + 1;
                                        var start_hours = start.getHours();
                                        var start_min = start.getMinutes();
                                        start_min = start_min + 1
                                        var formattedTime = `0 ${start_min} ${start_hours} ${start_dd} ${start_mm} *`;
                                    } else {
                                        var startTime = new Date(start_schedule_date);
                                        var start_dd = startTime.getDate();
                                        var start_mm = startTime.getMonth() + 1;
                                        var start_hours = startTime.getHours();
                                        var start_min = startTime.getMinutes();
                                        var formattedTime = `0 ${start_min} ${start_hours} ${start_dd} ${start_mm} *`;
                                    }
                                    console.log("in restart scheduled time............", formattedTime)
                                    var campaignName = data.name;
                                    var status = data.status;
                                    var campaignSql = `UPDATE cc_campaign SET is_scheduled = 1 WHERE id = '${campaignId}' `;
                                    var [campaignRes] = await sequelize.query(campaignSql);
                                    var dayArr = []
                                    var runningDays = data.running_days.split(",")
                                    runningDays.map(async (days) => {
                                        let day = days;
                                        let dayWithoutSpace = day.replace(/\s/g, '');
                                        if (dayWithoutSpace == "Sunday") {
                                            dayArr.push(0)
                                        } else if (dayWithoutSpace == "Monday") {
                                            dayArr.push(1)
                                        } else if (dayWithoutSpace == "Tuesday") {
                                            dayArr.push(2)
                                        } else if (dayWithoutSpace == "Wednesday") {
                                            dayArr.push(3)
                                        } else if (dayWithoutSpace == "Thursday") {
                                            dayArr.push(4)
                                        } else if (dayWithoutSpace == "Friday") {
                                            dayArr.push(5)
                                        } else if (dayWithoutSpace == "Saturday") {
                                            dayArr.push(6)
                                        }
                                    })
                                    broadcastLogMessage("campaign formattedTime..............." + formattedTime + ",campaignId :" + campaignId + ",Current time..........." + new Date())
                                    var job = schedule.scheduleJob(uniqueName, formattedTime, async () => {
                                        broadcastLogMessage("campaign schedule (restart)................." + formattedTime)
                                        broadcastLogMessage("campaign schedule id (restart)................." + campaignId)
                                        var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                                        var [transRes] = await getConnection.query(transSql);
                                        if (transRes.length != 0) {
                                            broadcastLogMessage("trans_creditLimit server restart time campaign reschedule................." + transRes[0].trans_creditLimit)
                                            var transCredit = transRes[0].trans_credit;
                                            broadcastLogMessage("transCredit server restart time campaign reschedule................." + transCredit)
                                            if (transCredit <= 0) {
                                                console.log("No balance.................");
                                                broadcastLogMessage("No balance.................")
                                            } else {
                                                if (new Date() >= end_schedule_date) {      // end date checking and cancel schedule
                                                    // job.cancel();
                                                    var ScheduleUniqueName = uniqueName
                                                    var innerScheduleUniqueName = uniqueName + '_s'
                                                    var schedule_job = schedule.scheduledJobs[ScheduleUniqueName];
                                                    if (schedule_job != undefined)
                                                        schedule_job.cancel();
                                                    var innserSchedule_job = schedule.scheduledJobs[innerScheduleUniqueName];
                                                    if (innserSchedule_job != undefined)
                                                        innserSchedule_job.cancel();
                                                    console.log('Scheduled job canceled.');
                                                    var scheduledJob = scheduled_Jobs[campaignId];
                                                    if (scheduledJob) {
                                                        clearInterval(scheduledJob.intervalId);
                                                        delete scheduled_Jobs[campaignId];
                                                    }
                                                } else {
                                                    var campaignGetSql = `select status from cc_campaign WHERE id = '${campaignId}' `;
                                                    var [campaignGetRes] = await sequelize.query(campaignGetSql);
                                                    if (campaignGetRes[0].status != 1) {
                                                        console.log("campaign running...............", new Date())
                                                        broadcastLogMessage("campaign running...............," + "campaignId :" + campaignId + "," + new Date())
                                                        var campaignSql = `UPDATE cc_campaign SET status = 1 WHERE id = '${campaignId}' `;
                                                        var [campaignRes] = await sequelize.query(campaignSql);
                                                    }
                                                    var currentTime = new Date();
                                                    var currenthours = currentTime.getHours();
                                                    var currentmin = currentTime.getMinutes();
                                                    var currentsec = currentTime.getSeconds();
                                                    var currentCampaignTimeWithsec = `${currenthours}:${currentmin}:${currentsec}`;
                                                    var currentDate = new Date();
                                                    var startTime = new Date(currentDate.toDateString() + ' ' + campaginWorkingStartTime);
                                                    var endTime = new Date(currentDate.toDateString() + ' ' + campaginWorkingEndTime);
                                                    var currentTimeDate = new Date(currentDate.toDateString() + ' ' + currentCampaignTimeWithsec)
                                                    if (currentTimeDate.getTime() === startTime.getTime() || startTime.getTime() < currentTimeDate.getTime()) { // campaign working time checking, current time or future time
                                                        if (currentTimeDate >= startTime && currentTimeDate <= endTime) {
                                                            const rule = new schedule.RecurrenceRule();
                                                            rule.dayOfWeek = dayArr;
                                                            rule.hour = currentTimeDate.getHours();
                                                            rule.minute = currentTimeDate.getMinutes();
                                                            var rule_second = currentTimeDate.getSeconds() + 10;      // add 10 sec, current time schedule not working so 10 sec extra added
                                                            if (rule_second > 60) {
                                                                rule_second = rule_second - 60;
                                                                rule.minute = rule.minute + 1;
                                                            }
                                                            rule.second = rule_second;
                                                            var innerScheduleUniqueName = uniqueName + '_s'
                                                            broadcastLogMessage("campaign inner schedule role...............")
                                                            broadcastLogMessage(rule)
                                                            broadcastLogMessage("campaign end_schedule_date...............," + end_schedule_date)
                                                            var scheduleInnerJob = schedule.scheduleJob(innerScheduleUniqueName, { rule, end_schedule_date }, async () => {    // inner schedule, end_schedule_date is schedule end time
                                                                broadcastLogMessage("inner schedule campaign time (restart)................." + new Date())
                                                                broadcastLogMessage("inner schedule campaign id (restart)................." + campaignId)
                                                                var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                                                                var [transRes] = await getConnection.query(transSql);
                                                                if (transRes.length != 0) {
                                                                    broadcastLogMessage("trans_creditLimit server restart time campaign reschedule (innerschedule)................." + transRes[0].trans_creditLimit)
                                                                    var transCredit = transRes[0].trans_credit;
                                                                    broadcastLogMessage("transCredit server restart time campaign reschedule (innerschedule)................." + transCredit)
                                                                    if (transCredit <= 0) {
                                                                        console.log("No balance.................");
                                                                        broadcastLogMessage("No balance.................")
                                                                        var campaignSql = `UPDATE cc_campaign SET status = 2 WHERE id = '${campaignId}' `;
                                                                        var [campaignRes] = await sequelize.query(campaignSql);
                                                                        var msg = 'campaignPausedRecharge'
                                                                        var socket = await adminSocket(id_user, msg, campaignId);
                                                                    } else {
                                                                        var result = await phonebook_contactsModel.aggregate([
                                                                            {
                                                                                $lookup: {
                                                                                    from: 'contacts_statuses',
                                                                                    let: { contactId: '$_id' }, // Variables to use in the pipeline
                                                                                    pipeline: [
                                                                                        {
                                                                                            $match: {
                                                                                                $expr: { $eq: ['$contactId', '$$contactId'] },
                                                                                                'phonebook_id': { $in: phnbookId }, 'campaignId': campaignId
                                                                                            },
                                                                                        },
                                                                                    ],
                                                                                    as: 'c_status'
                                                                                }
                                                                            },
                                                                            {
                                                                                $match: {
                                                                                    'phonebook_id': { $in: phnbookId },
                                                                                    'c_status': { $eq: [] }  // Check if status array is empty
                                                                                },
                                                                            },
                                                                        ]);
                                                                        broadcastLogMessage("contact count in restart  : " + result.length)
                                                                        if (result.length != 0) {
                                                                            if (new Date() >= end_schedule_date) {     // end date checking and cancel schedule
                                                                                var ScheduleUniqueName = uniqueName
                                                                                var innerScheduleUniqueName = uniqueName + '_s'
                                                                                var schedule_job = schedule.scheduledJobs[ScheduleUniqueName];
                                                                                if (schedule_job != undefined)
                                                                                    schedule_job.cancel();
                                                                                console.log('Scheduled job canceled.....');
                                                                                var innserSchedule_job = schedule.scheduledJobs[innerScheduleUniqueName];
                                                                                if (innserSchedule_job != undefined)
                                                                                    innserSchedule_job.cancel();
                                                                                console.log('Inner Scheduled job canceled.');
                                                                                var scheduledJob = scheduled_Jobs[campaignId];
                                                                                if (scheduledJob) {
                                                                                    clearInterval(scheduledJob.intervalId);
                                                                                    delete scheduled_Jobs[campaignId];
                                                                                }
                                                                            } else {
                                                                                broadcastLogMessage('Scheduled campaign (restart)...............................................' + new Date());
                                                                                console.log('Scheduled campaign (restart)...............................................', new Date());
                                                                                broadcastLogMessage('campaign name (restart) : ' + campaignName + ",campaignId : " + campaignId);
                                                                                console.log('campaign name (restart) : ' + campaignName + ",campaignId : ", campaignId);
                                                                                var summary_date = new Date();
                                                                                var dd = summary_date.getDate();
                                                                                var mm = summary_date.getMonth() + 1;
                                                                                var yyyy = summary_date.getFullYear();
                                                                                var dateCheking = `${yyyy}-${mm}-${dd}`;
                                                                                var phonebookStr = phnbookId.map(pb => `'${pb}'`).join(',');
                                                                                var existCheckingSql = `SELECT * FROM cc_campaign_call_summary WHERE campaign_id = '${campaignId}' and phonebook_id IN(${phonebookStr}) AND DATE(createdAt) = '${dateCheking}'`;
                                                                                var [existChecking] = await getConnection.query(existCheckingSql);
                                                                                broadcastLogMessage("existing checking in cc_campaign_call_summary (restart) : " + existChecking.length + ",campaignId : " + campaignId)
                                                                                if (existChecking.length == 0) {
                                                                                    var summarydata = [];
                                                                                    phnbookId.map((phnbook) => {
                                                                                        summarydata.push({
                                                                                            id_user: id_user,
                                                                                            id_department: id_department,
                                                                                            phonebook_id: phnbook,
                                                                                            campaign_id: campaignId
                                                                                        })
                                                                                    })
                                                                                    var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(summarydata);
                                                                                    broadcastLogMessage("insert cc_campaign_call_summary table (restart),campaignId : " + campaignId)
                                                                                    broadcastLogMessage(addcampaignSummary)
                                                                                } else {
                                                                                    var summarydata = [];
                                                                                    existingPhnbook = []
                                                                                    existChecking.map((exist) => {
                                                                                        existingPhnbook.push(exist.phonebook_id)
                                                                                    })
                                                                                    const remainingphbBookData = phnbookId.filter(phn => !existingPhnbook.includes(phn));
                                                                                    if (remainingphbBookData.length != 0) {
                                                                                        remainingphbBookData.map((phnbook) => {
                                                                                            summarydata.push({
                                                                                                id_user: id_user,
                                                                                                id_department: id_department,
                                                                                                phonebook_id: phnbook,
                                                                                                campaign_id: campaignId
                                                                                            })
                                                                                        })
                                                                                    }
                                                                                    if (summarydata.length != 0) {
                                                                                        var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(summarydata);
                                                                                        broadcastLogMessage("insert cc_campaign_call_summary table (restart),campaignId : " + campaignId)
                                                                                        broadcastLogMessage(addcampaignSummary)
                                                                                    }
                                                                                }
                                                                                var wpSql = `SELECT api_integration  FROM  campaign_settings  WHERE campaign_id = '${campaignId}'`;
                                                                                var [wpres] = await getConnection.query(wpSql);
                                                                                var whatsapp_integration = 0
                                                                                if (wpres.length != 0) {
                                                                                    whatsapp_integration = wpres[0].api_integration;
                                                                                    if (whatsapp_integration == null) {
                                                                                        whatsapp_integration = 0
                                                                                    }
                                                                                } else {
                                                                                    whatsapp_integration = 0
                                                                                }
                                                                                broadcastLogMessage("wpSql (restart)..." + wpSql)
                                                                                broadcastLogMessage("wpres length (restart)..." + wpres.length)
                                                                                var transSql = `SELECT balance as trans_credit FROM customers WHERE id = ${id_user}`;
                                                                                var [transRes] = await getConnection.query(transSql);
                                                                                if (transRes.length != 0) {
                                                                                    var trans_credit = transRes[0].trans_credit
                                                                                    if (trans_credit <= 10) {
                                                                                        frequency = 1
                                                                                    } else if (trans_credit < 20) {
                                                                                        frequency = 2
                                                                                    }
                                                                                }
                                                                                var phonebookdata = result.slice(0, frequency);
                                                                                broadcastLogMessage("frequency................." + frequency)
                                                                                phonebookdata.map(async (phnData) => {
                                                                                    var obj = {
                                                                                        id_user: id_user,
                                                                                        id_department: id_department,
                                                                                        phonebook_id: phnData.phonebook_id,
                                                                                        campaignId: campaignId,
                                                                                        contactId: phnData._id,
                                                                                        status: 0,
                                                                                        retryCount: 1,
                                                                                        attempt: 1
                                                                                    }
                                                                                    var insertContacts = await contactStatusModel.create(obj);
                                                                                    var phnNumber = phnData.phone_number;
                                                                                    var phnbook_Id = phnData.phonebook_id;
                                                                                    var contactStatusId = insertContacts.id;
                                                                                    // broadcastLogMessage("phnNumber =" + phnNumber)
                                                                                    function generateRandomSixDigitNumber() {
                                                                                        return Math.floor(100000 + Math.random() * 900000);
                                                                                    }
                                                                                    var uniqueID = generateRandomSixDigitNumber();
                                                                                    var livecalls = {
                                                                                        id_user: id_user,
                                                                                        id_department: id_department,
                                                                                        id_campaign: campaignId,
                                                                                        didNumber: caller_id,
                                                                                        contact_number: phnNumber,
                                                                                        callDirection: 2,
                                                                                        calltype: 1,
                                                                                        is_data_submited: 1,
                                                                                        uniqueId: uniqueID,
                                                                                        contact_status_id: insertContacts.id
                                                                                    }
                                                                                    var addlivecalls = await livecallsModel.create(livecalls);
                                                                                    var campaignSummary = `UPDATE cc_campaign_call_summary SET live_calls = live_calls + 1,attempted_contact = attempted_contact + 1 WHERE campaign_id = '${campaignId}' and phonebook_id = '${phnbook_Id}' and id_user = '${id_user}' and id_department = '${id_department}' AND DATE(createdAt) = '${dateCheking}'`;
                                                                                    var [campaignSummaryRes] = await sequelize.query(campaignSummary);
                                                                                    console.log("whatsapp_integration...", whatsapp_integration)
                                                                                    broadcastLogMessage("whatsapp_integration..." + whatsapp_integration + ",campaignId : " + campaignId)
                                                                                    var broadcast = ami.campaign_broadcast_click_to_call(phnNumber, contactStatusId, campaignId, phnbook_Id, caller_id, uniqueID, id_user, appId, whatsapp_integration, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                                    broadcastLogMessage("send to campaign_broadcast_click_to_call : "+phnNumber+','+contactStatusId+','+campaignId+','+phnbook_Id+','+caller_id+','+uniqueID+','+id_user+','+appId+','+whatsapp_integration+','+didProvider+ ',' + call_duration + ',' + fwd_provider + ',' + token + ',' + byot+',' + route)
                                                                                    if (process.env.PRODUCTION == 'development') {
                                                                                        var logDataJson = {}
                                                                                        logDataJson.apiSettingIsEnabled = whatsapp_integration
                                                                                        var callStatus = 'ANSWER'
                                                                                        var selectRes = [{ "contact_number": phnNumber }]
                                                                                        // var apiIntegration = ami.api_integration(callStatus, logDataJson, campaignId, selectRes);
                                                                                    }
                                                                                    broadcastLogMessage("first try (restart)................" + phnNumber + ",campaignId : " + campaignId)
                                                                                    logMessage("first try (restart)................" + phnNumber + ",campaignId : " + campaignId)
                                                                                    logMessage("passing data to campaign_broadcast_click_to_call function (restart) : " + phnNumber + ',' + contactStatusId + ',' + campaignId + ',' + phnbook_Id + ',' + caller_id + ',' + uniqueID + ',' + id_user + ',' + appId + ',' + whatsapp_integration + ',' + didProvider  + ',' + call_duration + ',' + fwd_provider)
                                                                                });
                                                                                result.splice(0, frequency);
                                                                                logMessage("passing contact to setinterval function after 1st try contact removed (restart) : " + result.length + ' campaignId,' + campaignId)
                                                                                var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                                                                                var [transRes] = await getConnection.query(transSql);
                                                                                if (transRes.length != 0) {
                                                                                    broadcastLogMessage("trans_creditLimit server restart time before campaign contact passing to setintervel or retry................." + transRes[0].trans_creditLimit)
                                                                                    var transCredit = transRes[0].trans_credit;
                                                                                    broadcastLogMessage("transCredit server restart time before campaign contact passing to setintervel or retry................." + transCredit)
                                                                                    if (transCredit <= 0) {
                                                                                        console.log("No balance.................");
                                                                                        broadcastLogMessage("No balance.................")
                                                                                        var campaignSql = `UPDATE cc_campaign SET status = 2 WHERE id = '${campaignId}' `;
                                                                                        var [campaignRes] = await sequelize.query(campaignSql);
                                                                                        var msg = 'campaignPausedRecharge'
                                                                                        var socket = await adminSocket(id_user, msg, campaignId);
                                                                                    } else {
                                                                                        if (result.length != 0) {
                                                                                            var updatedRetryCount = 0;
                                                                                            var retry = "no retry";
                                                                                            var contacts = await get_setInterval(result, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                                        } else {
                                                                                            var retry = "retry";
                                                                                            var updatedRetryCount = 1;
                                                                                            var retrycontacts = await get_retry(result, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        } else {
                                                                            var retry = "retry";
                                                                            var updatedRetryCount = 1;
                                                                            var retrycontacts = await get_retry(result, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                        } else {
                                                            var innerScheduleUniqueName = uniqueName + '_s'
                                                            const rule = new schedule.RecurrenceRule();
                                                            rule.dayOfWeek = dayArr;
                                                            rule.hour = startTime.getHours();
                                                            rule.minute = startTime.getMinutes();
                                                            rule.second = startTime.getSeconds();
                                                            broadcastLogMessage("campaign inner schedule role...............")
                                                            broadcastLogMessage(rule)
                                                            broadcastLogMessage("campaign end_schedule_date...............," + end_schedule_date)
                                                            var InnerScheduleJob = schedule.scheduleJob(innerScheduleUniqueName, { rule, end_schedule_date }, async () => {
                                                                broadcastLogMessage("inner schedule campaign time (restart)................." + new Date())
                                                                broadcastLogMessage("inner schedule campaign id (restart)................." + campaignId)
                                                                var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                                                                var [transRes] = await getConnection.query(transSql);
                                                                if (transRes.length != 0) {
                                                                    broadcastLogMessage("trans_creditLimit server restart time campaign reschedule (innerschedule)................." + transRes[0].trans_creditLimit)
                                                                    var transCredit = transRes[0].trans_credit;
                                                                    broadcastLogMessage("transCredit server restart time campaign reschedule (innerschedule)................." + transCredit)
                                                                    if (transCredit <= 0) {
                                                                        console.log("No balance.................");
                                                                        broadcastLogMessage("No balance.................")
                                                                    } else {
                                                                        var result = await phonebook_contactsModel.aggregate([
                                                                            {
                                                                                $lookup: {
                                                                                    from: 'contacts_statuses',
                                                                                    let: { contactId: '$_id' }, // Variables to use in the pipeline
                                                                                    pipeline: [
                                                                                        {
                                                                                            $match: {
                                                                                                $expr: { $eq: ['$contactId', '$$contactId'] },
                                                                                                'phonebook_id': { $in: phnbookId }, 'campaignId': campaignId
                                                                                            },
                                                                                        },
                                                                                    ],
                                                                                    as: 'c_status'
                                                                                }
                                                                            },
                                                                            {
                                                                                $match: {
                                                                                    'phonebook_id': { $in: phnbookId },
                                                                                    'c_status': { $eq: [] }  // Check if status array is empty
                                                                                },
                                                                            },
                                                                        ]);
                                                                        broadcastLogMessage("contact count in restart  : " + result.length)
                                                                        if (result.length != 0) {
                                                                            if (new Date() >= end_schedule_date) {
                                                                                var ScheduleUniqueName = uniqueName
                                                                                var innerScheduleUniqueName = uniqueName + '_s'
                                                                                var schedule_job = schedule.scheduledJobs[ScheduleUniqueName];
                                                                                if (schedule_job != undefined)
                                                                                    schedule_job.cancel();
                                                                                console.log('Scheduled job canceled.....');
                                                                                var innserSchedule_job = schedule.scheduledJobs[innerScheduleUniqueName];
                                                                                if (innserSchedule_job != undefined)
                                                                                    innserSchedule_job.cancel();
                                                                                console.log('Inner Scheduled job canceled.');
                                                                                var scheduledJob = scheduled_Jobs[campaignId];
                                                                                if (scheduledJob) {
                                                                                    clearInterval(scheduledJob.intervalId);
                                                                                    delete scheduled_Jobs[campaignId];
                                                                                }
                                                                            } else {
                                                                                console.log("......................... innerSchedule.....")
                                                                                console.log(status)
                                                                                broadcastLogMessage('Scheduled campaign (restart)...............................................' + new Date());
                                                                                console.log('Scheduled campaign (restart)...............................................', new Date());
                                                                                broadcastLogMessage('campaign name (restart) : ' + campaignName + ",campaignId : " + campaignId);
                                                                                console.log('campaign name (restart) : ' + campaignName + ",campaignId : ", campaignId);
                                                                                var summary_date = new Date();
                                                                                var dd = summary_date.getDate();
                                                                                var mm = summary_date.getMonth() + 1;
                                                                                var yyyy = summary_date.getFullYear();
                                                                                var dateCheking = `${yyyy}-${mm}-${dd}`;
                                                                                var phonebookStr = phnbookId.map(pb => `'${pb}'`).join(',');
                                                                                var existCheckingSql = `SELECT * FROM cc_campaign_call_summary WHERE campaign_id = '${campaignId}' and phonebook_id IN(${phonebookStr}) AND DATE(createdAt) = '${dateCheking}'`;
                                                                                var [existChecking] = await getConnection.query(existCheckingSql);
                                                                                broadcastLogMessage("existing checking in cc_campaign_call_summary : " + existChecking.length + ",campaignId : " + campaignId)
                                                                                if (existChecking.length == 0) {
                                                                                    var summarydata = [];
                                                                                    phnbookId.map((phnbook) => {
                                                                                        summarydata.push({
                                                                                            id_user: id_user,
                                                                                            id_department: id_department,
                                                                                            phonebook_id: phnbook,
                                                                                            campaign_id: campaignId
                                                                                        })
                                                                                    })
                                                                                    var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(summarydata);
                                                                                    broadcastLogMessage("insert cc_campaign_call_summary table (restart),campaignId : " + campaignId)
                                                                                    broadcastLogMessage(addcampaignSummary)
                                                                                } else {
                                                                                    var summarydata = [];
                                                                                    existingPhnbook = []
                                                                                    existChecking.map((exist) => {
                                                                                        existingPhnbook.push(exist.phonebook_id)
                                                                                    })
                                                                                    const remainingphbBookData = phnbookId.filter(phn => !existingPhnbook.includes(phn));
                                                                                    if (remainingphbBookData.length != 0) {
                                                                                        remainingphbBookData.map((phnbook) => {
                                                                                            summarydata.push({
                                                                                                id_user: id_user,
                                                                                                id_department: id_department,
                                                                                                phonebook_id: phnbook,
                                                                                                campaign_id: campaignId
                                                                                            })
                                                                                        })
                                                                                    }
                                                                                    if (summarydata.length != 0) {
                                                                                        var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(summarydata);
                                                                                        broadcastLogMessage("insert cc_campaign_call_summary table (restart),campaignId : " + campaignId)
                                                                                        broadcastLogMessage(addcampaignSummary)
                                                                                    }
                                                                                }
                                                                                var wpSql = `SELECT api_integration  FROM  campaign_settings  WHERE campaign_id = '${campaignId}'`;
                                                                                var [wpres] = await getConnection.query(wpSql);
                                                                                var whatsapp_integration = 0
                                                                                if (wpres.length != 0) {
                                                                                    whatsapp_integration = wpres[0].api_integration;
                                                                                    if (whatsapp_integration == null) {
                                                                                        whatsapp_integration = 0
                                                                                    }
                                                                                } else {
                                                                                    whatsapp_integration = 0
                                                                                }
                                                                                broadcastLogMessage("wpSql (restart)..." + wpSql)
                                                                                broadcastLogMessage("wpres length (restart)..." + wpres.length)
                                                                                var transSql = `SELECT balance as trans_credit FROM customers WHERE id = ${id_user}`;
                                                                                var [transRes] = await getConnection.query(transSql);
                                                                                if (transRes.length != 0) {
                                                                                    var trans_credit = transRes[0].trans_credit
                                                                                    if (trans_credit <= 10) {
                                                                                        frequency = 1
                                                                                    } else if (trans_credit < 20) {
                                                                                        frequency = 2
                                                                                    }
                                                                                }
                                                                                var phonebookdata = result.slice(0, frequency);
                                                                                broadcastLogMessage("frequency................." + frequency)
                                                                                phonebookdata.map(async (phnData) => {
                                                                                    var obj = {
                                                                                        id_user: id_user,
                                                                                        id_department: id_department,
                                                                                        phonebook_id: phnData.phonebook_id,
                                                                                        campaignId: campaignId,
                                                                                        contactId: phnData._id,
                                                                                        status: 0,
                                                                                        retryCount: 1,
                                                                                        attempt: 1
                                                                                    }
                                                                                    var insertContacts = await contactStatusModel.create(obj);
                                                                                    var phnNumber = phnData.phone_number;
                                                                                    var phnbook_Id = phnData.phonebook_id;
                                                                                    var contactStatusId = insertContacts.id;
                                                                                    function generateRandomSixDigitNumber() {
                                                                                        return Math.floor(100000 + Math.random() * 900000);
                                                                                    }
                                                                                    var uniqueID = generateRandomSixDigitNumber();
                                                                                    var livecalls = {
                                                                                        id_user: id_user,
                                                                                        id_department: id_department,
                                                                                        id_campaign: campaignId,
                                                                                        didNumber: caller_id,
                                                                                        contact_number: phnNumber,
                                                                                        callDirection: 2,
                                                                                        calltype: 1,
                                                                                        is_data_submited: 1,
                                                                                        uniqueId: uniqueID,
                                                                                        contact_status_id: insertContacts.id
                                                                                    }
                                                                                    var addlivecalls = await livecallsModel.create(livecalls);
                                                                                    var campaignSummary = `UPDATE cc_campaign_call_summary SET live_calls = live_calls + 1,attempted_contact = attempted_contact + 1 WHERE campaign_id = '${campaignId}' and phonebook_id = '${phnbook_Id}' and id_user = '${id_user}' and id_department = '${id_department}' AND DATE(createdAt) = '${dateCheking}'`;
                                                                                    var [campaignSummaryRes] = await sequelize.query(campaignSummary);
                                                                                    console.log("whatsapp_integration...", whatsapp_integration)
                                                                                    broadcastLogMessage("whatsapp_integration..." + whatsapp_integration + ",campaignId : " + campaignId)
                                                                                    var broadcast = ami.campaign_broadcast_click_to_call(phnNumber, contactStatusId, campaignId, phnbook_Id, caller_id, uniqueID, id_user, appId, whatsapp_integration, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                                    broadcastLogMessage("send to campaign_broadcast_click_to_call : "+phnNumber+','+contactStatusId+','+campaignId+','+phnbook_Id+','+caller_id+','+uniqueID+','+id_user+','+appId+','+whatsapp_integration+','+didProvider+ ',' + call_duration + ',' + fwd_provider + ',' + token + ',' + byot+',' + route)
                                                                                    if (process.env.PRODUCTION == 'development') {
                                                                                        var logDataJson = {}
                                                                                        logDataJson.apiSettingIsEnabled = whatsapp_integration
                                                                                        var callStatus = 'ANSWER'
                                                                                        var selectRes = [{ "contact_number": phnNumber }]
                                                                                        // var apiIntegration = ami.api_integration(callStatus, logDataJson, campaignId, selectRes);
                                                                                    }
                                                                                    broadcastLogMessage("first try (restart)................" + phnNumber + ",campaignId : " + campaignId)
                                                                                    logMessage("first try (restart)................" + phnNumber + ",campaignId : " + campaignId)
                                                                                    logMessage("passing data to campaign_broadcast_click_to_call function (restart) : " + phnNumber + ',' + contactStatusId + ',' + campaignId + ',' + phnbook_Id + ',' + caller_id + ',' + uniqueID + ',' + id_user + ',' + appId + ',' + whatsapp_integration + ',' + didProvider  + ',' + call_duration + ',' + fwd_provider)
                                                                                });
                                                                                result.splice(0, frequency);
                                                                                logMessage("passing contact to setinterval function after 1st try contact removed (restart) : " + result.length + ' campaignId,' + campaignId)
                                                                                var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
                                                                                var [transRes] = await getConnection.query(transSql);
                                                                                if (transRes.length != 0) {
                                                                                    broadcastLogMessage("trans_creditLimit,before contact pass to setintervel or retry(server restart) ................." + transRes[0].trans_creditLimit)
                                                                                    var transCredit = transRes[0].trans_credit;
                                                                                    broadcastLogMessage("transCredit,before contact pass to setintervel or retry(server restart)................." + transCredit)
                                                                                    if (transCredit <= 0) {
                                                                                        console.log("No balance.................");
                                                                                        broadcastLogMessage("No balance.................")
                                                                                        var campaignSql = `UPDATE cc_campaign SET status = 2 WHERE id = '${campaignId}' `;
                                                                                        var [campaignRes] = await sequelize.query(campaignSql);
                                                                                        var msg = 'campaignPausedRecharge'
                                                                                        var socket = await adminSocket(id_user, msg, campaignId);
                                                                                    } else {
                                                                                        if (result.length != 0) {
                                                                                            var updatedRetryCount = 0;
                                                                                            var retry = "no retry";
                                                                                            var contacts = await get_setInterval(result, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                                        } else {
                                                                                            var retry = "retry";
                                                                                            var updatedRetryCount = 1;
                                                                                            var retrycontacts = await get_retry(result, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        } else {
                                                                            var retry = "retry";
                                                                            var updatedRetryCount = 1;
                                                                            var retrycontacts = await get_retry(result, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                                                                        }
                                                                    }
                                                                }

                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }
                    return data;
                })
            )
            var output = await map_result;
        }
    } catch (err) {
        console.log(err);
    }
}
async function get_setInterval(array, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route) {
    broadcastLogMessage("inside setinterval function......." + new Date() + ",campaignId : " + campaignId)
    return new Promise(async (resolve, reject) => {
        var wpIntegration = whatsapp_integration;
        const dateArray = array;
        broadcastLogMessage("set interval array length" + array.length + ",campaignId : " + campaignId, "retry or noretry :" + retry)
        let currentIndex = 0;
        async function processNextSetOfDates() {
            broadcastLogMessage("in process next data set(setinterval function)......." + new Date() + ",campaignId : " + campaignId)
            var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${id_user}`;
            var [transRes] = await getConnection.query(transSql);
            if (transRes.length != 0) {
                broadcastLogMessage("trans_creditLimit in setintervel function(every 30 sec contact load)................." + transRes[0].trans_creditLimit)
                var transCredit = transRes[0].trans_credit;
                broadcastLogMessage("transCredit in setintervel function(every 30 sec contact load)................." + transCredit)
                if (transCredit <= 0) {
                    console.log("No balance.................");
                    broadcastLogMessage("No balance.................")
                    var campaignSql = `UPDATE cc_campaign SET status = 2 WHERE id = '${campaignId}' `;
                    var [campaignRes] = await sequelize.query(campaignSql);
                    var msg = 'campaignPausedRecharge'
                    var socket = await adminSocket(id_user, msg, campaignId);
                } else {
                    var currentTime = new Date();
                    var currenthours = currentTime.getHours();
                    var currentmin = currentTime.getMinutes();
                    var currentsec = currentTime.getSeconds();
                    var dd = currentTime.getDate();
                    var mm = currentTime.getMonth() + 1;
                    var yyyy = currentTime.getFullYear();
                    var currentCampaignTimeWithsec = `${currenthours}:${currentmin}:${currentsec}`;
                    var dateCheking = `${yyyy}-${mm}-${dd}`;
                    var currentDate = new Date();
                    var startTime = new Date(currentDate.toDateString() + ' ' + campaginWorkingStartTime);
                    var endTime = new Date(currentDate.toDateString() + ' ' + campaginWorkingEndTime);
                    var currentTimeDate = new Date(currentDate.toDateString() + ' ' + currentCampaignTimeWithsec);
                    var campaginEndTime = new Date(end_schedule_date);
                    broadcastLogMessage("campagin startTime (call working time) (inside setinterval function)..........." + startTime + ",campaignId : " + campaignId)
                    broadcastLogMessage("campagin endTime (call working end time) (inside setinterval function)..........." + endTime + ",campaignId : " + campaignId)
                    broadcastLogMessage("currentTimeDate (inside setinterval function)..........." + currentTimeDate + ",campaignId : " + campaignId)
                    broadcastLogMessage("campaginEndTime (inside setinterval function)..........." + campaginEndTime + ",campaignId : " + campaignId)
                    if (currentDate <= campaginEndTime) {
                        if (currentTimeDate >= startTime && currentTimeDate <= endTime) {
                            var phonebookStr = phnbookId.map(pb => `'${pb}'`).join(',');
                            var existCheckingSql = `SELECT * FROM cc_campaign_call_summary WHERE campaign_id = '${campaignId}' and phonebook_id IN(${phonebookStr}) AND DATE(createdAt) = '${dateCheking}'`;
                            var [existChecking] = await getConnection.query(existCheckingSql);
                            broadcastLogMessage("existing checking in cc_campaign_call_summary inside setinterval function : " + existChecking.length + ",campaignId : " + campaignId)
                            if (existChecking.length == 0) {
                                var summarydata = [];
                                phnbookId.map((phnbook) => {
                                    summarydata.push({
                                        id_user: id_user,
                                        id_department: id_department,
                                        phonebook_id: phnbook,
                                        campaign_id: campaignId
                                    })
                                })
                                var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(summarydata);
                                broadcastLogMessage("insert cc_campaign_call_summary table (in setinterval function),campaignId : " + campaignId)
                                broadcastLogMessage(addcampaignSummary)
                            } else {
                                var summarydata = [];
                                existingPhnbook = []
                                existChecking.map((exist) => {
                                    existingPhnbook.push(exist.phonebook_id)
                                })
                                const remainingphbBookData = phnbookId.filter(phn => !existingPhnbook.includes(phn));
                                if (remainingphbBookData.length != 0) {
                                    remainingphbBookData.map((phnbook) => {
                                        summarydata.push({
                                            id_user: id_user,
                                            id_department: id_department,
                                            phonebook_id: phnbook,
                                            campaign_id: campaignId
                                        })
                                    })
                                }
                                if (summarydata.length != 0) {
                                    var addcampaignSummary = await campaignCallSummaryModel.bulkCreate(summarydata);
                                    broadcastLogMessage("insert cc_campaign_call_summary table (in setinterval function),campaignId : " + campaignId)
                                    broadcastLogMessage(addcampaignSummary)
                                }
                            }
                            const currentDate = new Date();
                            var current_dd = currentDate.getDate();
                            var current_mm = currentDate.getMonth() + 1
                            var current_yyyy = currentDate.getFullYear();
                            var current_hours = currentDate.getHours();
                            var current_min = currentDate.getMinutes();
                            var current_sec = currentDate.getSeconds();
                            const fifteenMinutesAgo = new Date(currentDate.getTime() - 15 * 60 * 1000);
                            var hours = fifteenMinutesAgo.getHours();
                            var min = fifteenMinutesAgo.getMinutes();
                            var sec = fifteenMinutesAgo.getSeconds();
                            var Start = `${current_yyyy}-${current_mm}-${current_dd} ${hours}:${min}:${sec}`;
                            var End = `${current_yyyy}-${current_mm}-${current_dd} ${current_hours}:${current_min}:${current_sec}`;
                            var sql = `SELECT count(id) as count FROM cc_livecalls WHERE is_live = 0 AND id_user ='${id_user}' and id_campaign = '${campaignId}' and createdAt BETWEEN '${Start}' AND '${End}'`;
                            var [count] = await getConnection.query(sql);
                            if (count.length != 0) {
                                if (process.env.PRODUCTION == 'development') {
                                    var liveCount = 0;
                                } else {
                                    var liveCount = count[0].count;
                                }
                                broadcastLogMessage("live call count................." + count[0].count + ",campaignId : " + campaignId)
                                if (liveCount < frequency) {
                                    var transSql = `SELECT balance as trans_credit FROM customers WHERE id = ${id_user}`;
                                    var [transRes] = await getConnection.query(transSql);
                                    if (transRes.length != 0) {
                                        var trans_credit = transRes[0].trans_credit
                                        if (trans_credit <= 10) {
                                            frequency = 1
                                        } else if (trans_credit < 20) {
                                            frequency = 2
                                        }
                                    }
                                    broadcastLogMessage("frequency................." + frequency + ",campaignId : " + campaignId)
                                    var totalCount = frequency - Number(count[0].count);
                                    broadcastLogMessage("totalCount................." + totalCount + ",campaignId : " + campaignId)
                                    if (process.env.PRODUCTION == 'development') {
                                        var batchSize = 5;
                                    } else {
                                        var batchSize = totalCount;
                                    }
                                    broadcastLogMessage("batchSize................." + batchSize + ",campaignId : " + campaignId)
                                    broadcastLogMessage("currentIndex................." + currentIndex + ",campaignId : " + campaignId)
                                    const endIndex = currentIndex + batchSize;
                                    broadcastLogMessage("endIndex................." + endIndex + ",campaignId : " + campaignId)
                                    if (currentIndex <= dateArray.length) {
                                        let datesToProcess = dateArray.slice(currentIndex, endIndex);
                                        currentIndex = endIndex;
                                        var livecallDatasql = `SELECT id,contact_number,status FROM cc_livecalls WHERE is_live = 0 AND id_user ='${id_user}' and id_campaign = '${campaignId}' and status = 2 and createdAt BETWEEN '${Start}' AND '${End}'`;
                                        var [livecallDataRes] = await sequelize.query(livecallDatasql);
                                        if(livecallDataRes.length != 0){
                                            console.log("livecall answered ----------->",livecallDataRes.length)
                                            var contactNumbersSet = new Set(livecallDataRes.map(item => item.contact_number));
                                            var filteredDatesToProcess = datesToProcess.filter(item => !contactNumbersSet.has(item.phone_number));
                                            console.log("filteredDatesToProcess ----------->",filteredDatesToProcess)
                                            datesToProcess = filteredDatesToProcess
                                            console.log("datesToProcess ----------->",datesToProcess)
                                        }
                                        datesToProcess.map(async (data) => {
                                            if (retry != "retry") {  // retry
                                                var obj = {
                                                    id_user: id_user,
                                                    id_department: id_department,
                                                    phonebook_id: data.phonebook_id,
                                                    campaignId: campaignId,
                                                    contactId: data._id,
                                                    status: 0,
                                                    retryCount: 1,
                                                    attempt: 1
                                                }
                                                var insertContacts = await contactStatusModel.create(obj);
                                                var contactStatusId = insertContacts.id;
                                                function generateRandomSixDigitNumber() {
                                                    return Math.floor(100000 + Math.random() * 900000);
                                                }
                                                var uniqueID = generateRandomSixDigitNumber();
                                                var phnNumber = data.phone_number;
                                                var phnbook_Id = data.phonebook_id;
                                                var livecalls = {
                                                    id_user: id_user,
                                                    id_department: id_department,
                                                    id_campaign: campaignId,
                                                    didNumber: caller_id,
                                                    contact_number: phnNumber,
                                                    callDirection: 2,
                                                    calltype: 1,
                                                    is_data_submited: 1,
                                                    uniqueId: uniqueID,
                                                    contact_status_id: contactStatusId
                                                }
                                                var addlivecalls = await livecallsModel.create(livecalls);
                                                var campaignSummary = `UPDATE cc_campaign_call_summary SET live_calls = live_calls + 1,attempted_contact = attempted_contact + 1 WHERE campaign_id = '${campaignId}' and phonebook_id = '${phnbook_Id}' and id_user = '${id_user}' and id_department = '${id_department}' AND DATE(createdAt) = '${dateCheking}'`;
                                                var [campaignSummaryRes] = await sequelize.query(campaignSummary);
                                                console.log("whatsapp_integration...", wpIntegration)
                                                broadcastLogMessage("whatsapp_integration..." + wpIntegration + ",campaignId : " + campaignId)
                                                var broadcast = ami.campaign_broadcast_click_to_call(phnNumber, contactStatusId, campaignId, phnbook_Id, caller_id, uniqueID, id_user, appId, wpIntegration, didProvider,call_duration,fwd_provider,token,byot,route)
                                                broadcastLogMessage("send to campaign_broadcast_click_to_call : "+phnNumber+','+contactStatusId+','+campaignId+','+phnbook_Id+','+caller_id+','+uniqueID+','+id_user+','+appId+','+whatsapp_integration+','+didProvider+ ',' + call_duration + ',' + fwd_provider + ',' + token + ',' + byot+',' + route)
                                                if (process.env.PRODUCTION == 'development') {
                                                    var logDataJson = {}
                                                    logDataJson.apiSettingIsEnabled = wpIntegration
                                                    var callStatus = 'ANSWER'
                                                    var selectRes = [{ "contact_number": phnNumber }]
                                                }
                                                broadcastLogMessage("second try................" + phnNumber + ",campaignId : " + campaignId)
                                                logMessage("second try................" + phnNumber + ",campaignId : " + campaignId)
                                                logMessage("passing data to campaign_broadcast_click_to_call function : " + phnNumber + ',' + contactStatusId + ',' + campaignId + ',' + phnbook_Id + ',' + caller_id + ',' + uniqueID + ',' + id_user + ',' + appId + ',' + whatsapp_integration + ',' + didProvider  + ',' + call_duration + ',' + fwd_provider)
                                            } else {
                                                var contactStatusId = data.c_status._id.toString();
                                                function generateRandomSixDigitNumber() {
                                                    return Math.floor(100000 + Math.random() * 900000);
                                                }
                                                var uniqueID = generateRandomSixDigitNumber();
                                                var phnNumber = data.phone_number;
                                                var phnbook_Id = data.phonebook_id;
                                                var livecalls = {
                                                    id_user: id_user,
                                                    id_department: id_department,
                                                    id_campaign: campaignId,
                                                    didNumber: caller_id,
                                                    contact_number: data.phone_number,
                                                    callDirection: 2,
                                                    calltype: 1,
                                                    is_data_submited: 1,
                                                    uniqueId: uniqueID,
                                                    contact_status_id: contactStatusId,
                                                    retry_count: updatedRetryCount
                                                }
                                                var addlivecalls = await livecallsModel.create(livecalls);
                                                var update = await contactStatusModel.updateOne({ _id: new ObjectId(contactStatusId) }, { $inc: { attempt: 1 } });
                                                var campaignSummary = `UPDATE cc_campaign_call_summary SET live_calls = live_calls + 1,attempted_contact = attempted_contact + 1 WHERE campaign_id = '${campaignId}' and phonebook_id = '${phnbook_Id}' and id_user = '${id_user}' and id_department = '${id_department}' AND DATE(createdAt) = '${dateCheking}'`;
                                                var [campaignSummaryRes] = await sequelize.query(campaignSummary);
                                                var whatsapp_integration = 0
                                                console.log("whatsapp_integration...", whatsapp_integration)
                                                broadcastLogMessage("whatsapp_integration..." + whatsapp_integration + ",campaignId : " + campaignId)
                                                var broadcast = ami.campaign_broadcast_click_to_call(phnNumber, contactStatusId, campaignId, phnbook_Id, caller_id, uniqueID, id_user, appId, whatsapp_integration, didProvider,call_duration,fwd_provider,token,byot,route)
                                                broadcastLogMessage("send to campaign_broadcast_click_to_call : "+phnNumber+','+contactStatusId+','+campaignId+','+phnbook_Id+','+caller_id+','+uniqueID+','+id_user+','+appId+','+whatsapp_integration+','+didProvider+ ',' + call_duration + ',' + fwd_provider + ',' + token + ',' + byot+',' + route)
                                                broadcastLogMessage("retry phone number................" + phnNumber + ",campaignId : " + campaignId)
                                                logMessage("retry phone number................" + phnNumber + ",campaignId : " + campaignId)
                                                logMessage("passing data to campaign_broadcast_click_to_call function : " + phnNumber + ',' + contactStatusId + ',' + campaignId + ',' + phnbook_Id + ',' + caller_id + ',' + uniqueID + ',' + id_user + ',' + appId + ',' + whatsapp_integration + ',' + didProvider + ',' + call_duration + ',' + fwd_provider + ',' + token + ',' + byot+',' + route)
                                            }
                                        });
                                        broadcastLogMessage(`Processing dates: `);
                                        broadcastLogMessage(datesToProcess);
                                    } else {
                                        clearInterval(intervalId);
                                        broadcastLogMessage(updatedRetryCount);
                                        console.log(updatedRetryCount)
                                        updatedRetryCount = updatedRetryCount + 1
                                        broadcastLogMessage(retryCount);
                                        console.log(retryCount)
                                        if (updatedRetryCount <= retryCount) { // retry count checking :  updatedRetryCount means retry incremented count
                                            broadcastLogMessage(updatedRetryCount);
                                            console.log(updatedRetryCount)
                                            broadcastLogMessage("retry start.............." + campaignId);
                                            console.log("retry start..............");
                                            var retryFuction = await get_retry(array, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                                        }
                                        resolve(updatedRetryCount);
                                        broadcastLogMessage("All dates have been processed............");
                                        // resolve("Processing completed"); // Resolve the promise when all dates are processed
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        const intervalId = setInterval(processNextSetOfDates, 30000);
        scheduled_Jobs[campaignId] = { intervalId }
    });
}
async function get_retry(array, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route) {
    broadcastLogMessage("inside retry function.............." + campaignId);
    return new Promise(async (resolve, reject) => {
        if (failedCallSec != 0) {
            var result1 = await phonebook_contactsModel.aggregate([
                {
                    $lookup:
                    {
                        from: "contacts_statuses",
                        localField: "_id",
                        foreignField: "contactId",
                        as: "c_status"
                    }
                },
                { "$unwind": "$c_status" },
                {
                    "$match": {
                        "$and": [
                            { "c_status.campaignId": campaignId },
                            { "c_status.attempt": updatedRetryCount },
                            { 'c_status.phonebook_id': { $in: phnbookId } },
                            { 'c_status.connectedDuration': { $lte: failedCallSec } }
                        ]
                    }
                }
            ]);
        } else {
            var result1 = await phonebook_contactsModel.aggregate([
                {
                    $lookup:
                    {
                        from: "contacts_statuses",
                        localField: "_id",
                        foreignField: "contactId",
                        as: "c_status"
                    }
                },
                { "$unwind": "$c_status" },
                {
                    "$match": {
                        "$and": [
                            { "c_status.campaignId": campaignId },
                            { "c_status.attempt": updatedRetryCount },
                            { 'c_status.phonebook_id': { $in: phnbookId } },
                            { 'c_status.status': { $nin: [3, 9] } }
                        ]
                    }
                }
            ]);
        }
        var contactStatus = await contactStatusModel.find({ campaignId: campaignId })
        broadcastLogMessage("retry count.............." + updatedRetryCount + ",campaignId : " + campaignId);
        if (result1.length != 0) {
            broadcastLogMessage(`Retry....................................` + ",campaignId : " + campaignId)
            broadcastLogMessage(`Retry contact data length........................` + result1.length + ",campaignId : " + campaignId)
            console.log(`Retry....................................`)
            var retry = "retry";
            if (updatedRetryCount <= retryCount) {
                var contacts1 = await get_setInterval(result1, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
                resolve(contacts1);
            }
        }
        else {
            var retry = "retry";
            updatedRetryCount = updatedRetryCount + 1;
            if (updatedRetryCount <= (retryCount + 1)) {
                var retrycontacts = await get_retry(array, id_user, id_department, campaignId, phnbookId, caller_id, appId, whatsapp_integration, frequency, updatedRetryCount, retryCount, retry, failedCallSec, campaginWorkingStartTime, campaginWorkingEndTime, start_schedule_date, end_schedule_date, didProvider,call_duration,fwd_provider,token,byot,route)
            }
        }
    });
}

async function did_unlimited_checking(route,campaignId) {
    broadcastLogMessage("inside balance_ckeck function.............." );
    if (route == 1) {
        let caller
        var callerIdSql = `SELECT cc_campaign.id,caller_id,did FROM cc_campaign join did on did.id = cc_campaign.caller_id WHERE cc_campaign.id = ${req.body.id_campaign}`;
        var [callerIdRes] = await sequelize.query(callerIdSql);
        if (callerIdRes.length != 0) {
            caller = callerIdRes[0].did
        }
        var digit_2 = caller.toString().substring(0, 2);
        var didSql = `SELECT pricing_plan,id_pay_per_calls_plans,id_pay_per_channel_plans,outgoing_call_ratecard_id FROM did where did like '${caller}'`;
        var [didRes] = await sequelize.query(didSql);
        if (didRes.length != 0) {
            if (didRes[0].pricing_plan != 1 && didRes[0].id_pay_per_channel_plans != 1) {

            } else {
                if (digit_2 != "91") {

                }
            }
        }
    } else {
        return false
    }
    
    
}
async function get_contacts_status(req, res, next) {
    try {
        var agnet_id = req.token.id;
        var campaignId = req.query.campaignId;
        campaignId = Number(campaignId);
        var phnbook_Id = req.query.phnbookId;
        var retry_count = req.query.retryCount;
        retry_count = Number(retry_count);
        var skip_enable = req.query.retry_skip;
        phnbook_Id = phnbook_Id.split(',');
        var result = []
        let callerId
        var callerIdSql = `SELECT cc_campaign.id,caller_id,did FROM cc_campaign join did on did.id = cc_campaign.caller_id WHERE cc_campaign.id = ${campaignId}`;
        var [callerIdRes] = await getConnection.query(callerIdSql);
        if (callerIdRes.length == 0) {
            var userDidSql = `SELECT us.user_id,us.did,us.did_type,d.did as didNumber FROM user_settings us LEFT JOIN did d ON us.did_type = 2 AND us.did = d.id WHERE us.user_id = ${agnet_id}`
            var [userDidRes] = await getConnection.query(userDidSql);
            if (userDidRes.length != 0) {
                if (userDidRes[0].didNumber != null) {
                    callerId = userDidRes[0].didNumber
                } else {
                    callerId = userDidRes[0].did
                }
            }
        } else {
            callerId = callerIdRes[0].did
        }
        var digit_2 = callerId.toString().substring(0, 2);
        var didSql = `SELECT pricing_plan,id_pay_per_calls_plans,id_pay_per_channel_plans,outgoing_call_ratecard_id FROM did where did like '${callerId}'`;
        var [didRes] = await sequelize.query(didSql);
        if (didRes[0].pricing_plan != 1 && didRes[0].id_pay_per_channel_plans != 1) {
            var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${req.token.id_user}`;
            var [transRes] = await getConnection.query(transSql);
            if (transRes.length != 0) {
                var transCredit = Math.abs(transRes[0].trans_credit);
                if (transCredit <= 0) {
                    res.locals.result = "no balance";
                } else {
                    const currentDate = new Date();
                    var current_dd = currentDate.getDate();
                    var current_mm = currentDate.getMonth() + 1
                    var current_yyyy = currentDate.getFullYear();
                    var current_hours = currentDate.getHours();
                    var current_min = currentDate.getMinutes();
                    var current_sec = currentDate.getSeconds();
                    const fifteenMinutesAgo = new Date(currentDate.getTime() - 15 * 60 * 1000);
                    var hours = fifteenMinutesAgo.getHours();
                    var min = fifteenMinutesAgo.getMinutes();
                    var sec = fifteenMinutesAgo.getSeconds();
                    var Start = `${current_yyyy}-${current_mm}-${current_dd} ${hours}:${min}:${sec}`;
                    var End = `${current_yyyy}-${current_mm}-${current_dd} ${current_hours}:${current_min}:${current_sec}`;
                    console.log("campaignId ------->", campaignId)
                    console.log("phnbook_Id ------->", phnbook_Id)
                    console.log("retry_count ------->", retry_count)
                    console.log("skip_enable ------->", skip_enable)
                    if (skip_enable == 1) {
                        var contactData = await contactStatusModel.find({ attempt: retry_count, campaignId: campaignId, duplicate: { $ne: 1 }, phonebook_id: { $in: phnbook_Id }, status: { $nin: [3] } }).sort({ _id: -1 }).limit(1);
                    } else {
                        var contactData = await contactStatusModel.find({ attempt: retry_count, campaignId: campaignId, duplicate: { $ne: 1 }, phonebook_id: { $in: phnbook_Id }, status: { $nin: [3, 4] } }).sort({ _id: -1 }).limit(1);
                    }
                    console.log("contactData ------->", contactData)
                    var livecallDatasql = `SELECT id,contact_number,status FROM cc_livecalls WHERE is_live = 0 AND id_user ='${req.token.id_user}' and id_campaign = '${campaignId}' and status = 2 and createdAt BETWEEN '${Start}' AND '${End}'`;
                    var [livecallDataRes] = await sequelize.query(livecallDatasql);
                    if (livecallDataRes.length != 0) {
                        console.log("livecall answered ----------->", livecallDataRes.length)
                        var contactNumbersSet = new Set(livecallDataRes.map(item => item.contact_number));
                        var filteredDatesToProcess = contactData.filter(item => !contactNumbersSet.has(item.phone_number));
                        console.log("filteredDatesToProcess ----------->", filteredDatesToProcess)
                        contactData = filteredDatesToProcess
                        console.log("contactData ----------->", contactData)
                    }
                    if (contactData.length != 0) {
                        const objectId = contactData[0]._doc.contactId;
                        const objectIdString = objectId.toString();
                        var phonebook_contacts = await phonebook_contactsModel.findById(objectIdString).exec()
                        if (phonebook_contacts != null) {
                            var c_status = { c_status: contactData[0]._doc }
                            var contact = phonebook_contacts._doc;
                            var resultObj = Object.assign({}, contact, c_status);
                            console.log("resultObj ------->", resultObj)
                            result.push(resultObj)
                        } else {
                            var contactDelete = await contactStatusModel.deleteOne({ _id: contactData[0]._doc._id })
                        }
                    }
                    if (result.length != 0) {
                        var update = await contactStatusModel.updateOne({ _id: new ObjectId(result[0].c_status._id) }, { $inc: { retryCount: 1, attempt: 1 } });
                        result[0].contactStatusId = result[0].c_status._id;
                        var phnNo = result[0].phone_number;
                        var limitRes = req.query.settings;
                        console.log("data loading start time", new Date())
                        var leadRes = await leadModel.find({ phnNo: phnNo }).limit(limitRes);
                        var leadCount = await leadModel.count({ phnNo: phnNo }).limit(limitRes);
                        var customRes = await agentModel.find({ phnNo: phnNo }).limit(limitRes);
                        var customCount = await agentModel.count({ phnNo: phnNo }).limit(limitRes);
                        var ticketRes = await ticketsModel.find({ phnNo: phnNo }).limit(limitRes);
                        var ticketCount = await ticketsModel.count({ phnNo: phnNo }).limit(limitRes);
                        console.log("data loading end time", new Date())
                        if (req.token.phn_number_mask == 1) {
                            var phone_Num1 = await string_encode(result[0].phone_number);
                            if (phone_Num1) {
                                var phn = phone_Num1;
                            } else {
                                var phn = result[0].phone_number;
                            }
                            // var phn = await string_encode(result[0].phone_number);
                            result[0].phone_number = phn;
                            res.locals.result = result;
                        } else {
                            res.locals.result = result;
                        }
                        res.locals.data = { leads: leadRes, customers: customRes, tickets: ticketRes };
                        res.locals.count = { leads: leadCount, customers: customCount, tickets: ticketCount };
                    } else {
                        res.locals.result = [];
                        res.locals.data = { leads: [], customers: [], tickets: [] };
                        res.locals.count = { leads: [], customers: [], tickets: [] };
                    }
                }
            }
        } else {
            if (digit_2 != "91") {
                var transSql = `SELECT balance as trans_credit,credit_limit as trans_creditLimit FROM customers WHERE id = ${req.token.id_user}`;
                var [transRes] = await getConnection.query(transSql);
                if (transRes.length != 0) {
                    var transCredit = Math.abs(transRes[0].trans_credit);
                    if (transCredit <= 0) {
                        res.locals.result = "no balance";
                    } else {
                        const currentDate = new Date();
                        var current_dd = currentDate.getDate();
                        var current_mm = currentDate.getMonth() + 1
                        var current_yyyy = currentDate.getFullYear();
                        var current_hours = currentDate.getHours();
                        var current_min = currentDate.getMinutes();
                        var current_sec = currentDate.getSeconds();
                        const fifteenMinutesAgo = new Date(currentDate.getTime() - 15 * 60 * 1000);
                        var hours = fifteenMinutesAgo.getHours();
                        var min = fifteenMinutesAgo.getMinutes();
                        var sec = fifteenMinutesAgo.getSeconds();
                        var Start = `${current_yyyy}-${current_mm}-${current_dd} ${hours}:${min}:${sec}`;
                        var End = `${current_yyyy}-${current_mm}-${current_dd} ${current_hours}:${current_min}:${current_sec}`;
                        console.log("campaignId ------->", campaignId)
                        console.log("phnbook_Id ------->", phnbook_Id)
                        console.log("retry_count ------->", retry_count)
                        console.log("skip_enable ------->", skip_enable)
                        if (skip_enable == 1) {
                            var contactData = await contactStatusModel.find({ attempt: retry_count, campaignId: campaignId, duplicate: { $ne: 1 }, phonebook_id: { $in: phnbook_Id }, status: { $nin: [3] } }).sort({ _id: -1 }).limit(1);
                        } else {
                            var contactData = await contactStatusModel.find({ attempt: retry_count, campaignId: campaignId, duplicate: { $ne: 1 }, phonebook_id: { $in: phnbook_Id }, status: { $nin: [3, 4] } }).sort({ _id: -1 }).limit(1);
                        }
                        console.log("contactData ------->", contactData)
                        var livecallDatasql = `SELECT id,contact_number,status FROM cc_livecalls WHERE is_live = 0 AND id_user ='${req.token.id_user}' and id_campaign = '${campaignId}' and status = 2 and createdAt BETWEEN '${Start}' AND '${End}'`;
                        var [livecallDataRes] = await sequelize.query(livecallDatasql);
                        if (livecallDataRes.length != 0) {
                            console.log("livecall answered ----------->", livecallDataRes.length)
                            var contactNumbersSet = new Set(livecallDataRes.map(item => item.contact_number));
                            var filteredDatesToProcess = contactData.filter(item => !contactNumbersSet.has(item.phone_number));
                            console.log("filteredDatesToProcess ----------->", filteredDatesToProcess)
                            contactData = filteredDatesToProcess
                            console.log("contactData ----------->", contactData)
                        }
                        if (contactData.length != 0) {
                            const objectId = contactData[0]._doc.contactId;
                            const objectIdString = objectId.toString();
                            var phonebook_contacts = await phonebook_contactsModel.findById(objectIdString).exec()
                            if (phonebook_contacts != null) {
                                var c_status = { c_status: contactData[0]._doc }
                                var contact = phonebook_contacts._doc;
                                var resultObj = Object.assign({}, contact, c_status);
                                console.log("resultObj ------->", resultObj)
                                result.push(resultObj)
                            } else {
                                var contactDelete = await contactStatusModel.deleteOne({ _id: contactData[0]._doc._id })
                            }
                        }
                        if (result.length != 0) {
                            var update = await contactStatusModel.updateOne({ _id: new ObjectId(result[0].c_status._id) }, { $inc: { retryCount: 1, attempt: 1 } });
                            result[0].contactStatusId = result[0].c_status._id;
                            var phnNo = result[0].phone_number;
                            var limitRes = req.query.settings;
                            console.log("data loading start time", new Date())
                            var leadRes = await leadModel.find({ phnNo: phnNo }).limit(limitRes);
                            var leadCount = await leadModel.count({ phnNo: phnNo }).limit(limitRes);
                            var customRes = await agentModel.find({ phnNo: phnNo }).limit(limitRes);
                            var customCount = await agentModel.count({ phnNo: phnNo }).limit(limitRes);
                            var ticketRes = await ticketsModel.find({ phnNo: phnNo }).limit(limitRes);
                            var ticketCount = await ticketsModel.count({ phnNo: phnNo }).limit(limitRes);
                            console.log("data loading end time", new Date())
                            if (req.token.phn_number_mask == 1) {
                                var phone_Num1 = await string_encode(result[0].phone_number);
                                if (phone_Num1) {
                                    var phn = phone_Num1;
                                } else {
                                    var phn = result[0].phone_number;
                                }
                                // var phn = await string_encode(result[0].phone_number);
                                result[0].phone_number = phn;
                                res.locals.result = result;
                            } else {
                                res.locals.result = result;
                            }
                            res.locals.data = { leads: leadRes, customers: customRes, tickets: ticketRes };
                            res.locals.count = { leads: leadCount, customers: customCount, tickets: ticketCount };
                        } else {
                            res.locals.result = [];
                            res.locals.data = { leads: [], customers: [], tickets: [] };
                            res.locals.count = { leads: [], customers: [], tickets: [] };
                        }
                    }
                }
            } else {
                const currentDate = new Date();
                var current_dd = currentDate.getDate();
                var current_mm = currentDate.getMonth() + 1
                var current_yyyy = currentDate.getFullYear();
                var current_hours = currentDate.getHours();
                var current_min = currentDate.getMinutes();
                var current_sec = currentDate.getSeconds();
                const fifteenMinutesAgo = new Date(currentDate.getTime() - 15 * 60 * 1000);
                var hours = fifteenMinutesAgo.getHours();
                var min = fifteenMinutesAgo.getMinutes();
                var sec = fifteenMinutesAgo.getSeconds();
                var Start = `${current_yyyy}-${current_mm}-${current_dd} ${hours}:${min}:${sec}`;
                var End = `${current_yyyy}-${current_mm}-${current_dd} ${current_hours}:${current_min}:${current_sec}`;
                console.log("campaignId ------->", campaignId)
                console.log("phnbook_Id ------->", phnbook_Id)
                console.log("retry_count ------->", retry_count)
                console.log("skip_enable ------->", skip_enable)
                if (skip_enable == 1) {
                    var contactData = await contactStatusModel.find({ attempt: retry_count, campaignId: campaignId, duplicate: { $ne: 1 }, phonebook_id: { $in: phnbook_Id }, status: { $nin: [3] } }).sort({ _id: -1 }).limit(1);
                } else {
                    var contactData = await contactStatusModel.find({ attempt: retry_count, campaignId: campaignId, duplicate: { $ne: 1 }, phonebook_id: { $in: phnbook_Id }, status: { $nin: [3, 4] } }).sort({ _id: -1 }).limit(1);
                }
                console.log("contactData ------->", contactData)
                var livecallDatasql = `SELECT id,contact_number,status FROM cc_livecalls WHERE is_live = 0 AND id_user ='${req.token.id_user}' and id_campaign = '${campaignId}' and status = 2 and createdAt BETWEEN '${Start}' AND '${End}'`;
                var [livecallDataRes] = await sequelize.query(livecallDatasql);
                if (livecallDataRes.length != 0) {
                    console.log("livecall answered ----------->", livecallDataRes.length)
                    var contactNumbersSet = new Set(livecallDataRes.map(item => item.contact_number));
                    var filteredDatesToProcess = contactData.filter(item => !contactNumbersSet.has(item.phone_number));
                    console.log("filteredDatesToProcess ----------->", filteredDatesToProcess)
                    contactData = filteredDatesToProcess
                    console.log("contactData ----------->", contactData)
                }
                if (contactData.length != 0) {
                    const objectId = contactData[0]._doc.contactId;
                    const objectIdString = objectId.toString();
                    var phonebook_contacts = await phonebook_contactsModel.findById(objectIdString).exec()
                    if (phonebook_contacts != null) {
                        var c_status = { c_status: contactData[0]._doc }
                        var contact = phonebook_contacts._doc;
                        var resultObj = Object.assign({}, contact, c_status);
                        console.log("resultObj ------->", resultObj)
                        result.push(resultObj)
                    } else {
                        var contactDelete = await contactStatusModel.deleteOne({ _id: contactData[0]._doc._id })
                    }
                }
                if (result.length != 0) {
                    var update = await contactStatusModel.updateOne({ _id: new ObjectId(result[0].c_status._id) }, { $inc: { retryCount: 1, attempt: 1 } });
                    result[0].contactStatusId = result[0].c_status._id;
                    var phnNo = result[0].phone_number;
                    var limitRes = req.query.settings;
                    console.log("data loading start time", new Date())
                    var leadRes = await leadModel.find({ phnNo: phnNo }).limit(limitRes);
                    var leadCount = await leadModel.count({ phnNo: phnNo }).limit(limitRes);
                    var customRes = await agentModel.find({ phnNo: phnNo }).limit(limitRes);
                    var customCount = await agentModel.count({ phnNo: phnNo }).limit(limitRes);
                    var ticketRes = await ticketsModel.find({ phnNo: phnNo }).limit(limitRes);
                    var ticketCount = await ticketsModel.count({ phnNo: phnNo }).limit(limitRes);
                    console.log("data loading end time", new Date())
                    if (req.token.phn_number_mask == 1) {
                        var phone_Num1 = await string_encode(result[0].phone_number);
                        if (phone_Num1) {
                            var phn = phone_Num1;
                        } else {
                            var phn = result[0].phone_number;
                        }
                        // var phn = await string_encode(result[0].phone_number);
                        result[0].phone_number = phn;
                        res.locals.result = result;
                    } else {
                        res.locals.result = result;
                    }
                    res.locals.data = { leads: leadRes, customers: customRes, tickets: ticketRes };
                    res.locals.count = { leads: leadCount, customers: customCount, tickets: ticketCount };
                } else {
                    res.locals.result = [];
                    res.locals.data = { leads: [], customers: [], tickets: [] };
                    res.locals.count = { leads: [], customers: [], tickets: [] };
                }
            }
        }
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_contacts_status_duplicate(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        if (id_department != undefined) {
            id_department = id_department;
        } else {
            id_department = 0;
        }
        var campaignId = req.query.campaignId;
        campaignId = Number(campaignId);
        var phnbook_Id = req.query.phnbookId;
        var retry_count = req.query.retryCount;
        retry_count = Number(retry_count);
        var skip_enable = req.query.retry_skip;
        var gobal_duplicate_check = req.query.gobal_duplicate_check;
        phnbook_Id = phnbook_Id.split(',');
        var phnbookId = phnbook_Id.map((element) => parseInt(element));
        if (skip_enable == 1) {
            var result = await phonebook_contactsModel.aggregate([
                {
                    $lookup:
                    {
                        from: "contacts_statuses",
                        localField: "_id",
                        foreignField: "contactId",
                        as: "c_status"
                    }
                },
                { "$unwind": "$c_status" },
                {
                    "$match": {
                        "$and": [
                            { "c_status.campaignId": campaignId },
                            // { "c_status.retryCount": retry_count },
                            { "c_status.attempt": retry_count },
                            { 'c_status.phonebook_id': { $in: phnbookId } },
                            { 'c_status.status': { $ne: 3 } }
                        ]
                    }
                },
                {
                    $limit: 1,
                }
            ]);
        } else {
            var result = await phonebook_contactsModel.aggregate([
                {
                    $lookup:
                    {
                        from: "contacts_statuses",
                        localField: "_id",
                        foreignField: "contactId",
                        as: "c_status"
                    }
                },
                { "$unwind": "$c_status" },
                {
                    "$match": {
                        "$and": [
                            { "c_status.campaignId": campaignId },
                            // { "c_status.retryCount": retry_count },
                            { "c_status.attempt": retry_count },
                            { 'c_status.phonebook_id': { $in: phnbookId } },
                            { 'c_status.status': { $ne: 3 } }
                        ]
                    }
                },
                {
                    $limit: 1,
                }
            ]);
        }
        if (result.length != 0) {
            var update = await contactStatusModel.updateOne({ _id: new ObjectId(result[0].c_status._id) }, { $inc: { retryCount: 1, attempt: 1 } });
            if (gobal_duplicate_check == 1) {
                var checkingSql = await contactStatusModel.find({ $and: [{ phone_number: result[0].phone_number }, { id_user: id_user }, { id_department: id_department }, { contactId: { $ne: ObjectId(result[0]._id) } }] });
                if (checkingSql.length != 0) {
                    // var update = await contactStatusModel.updateOne({ _id: new ObjectId(checkingSql[0]._doc._id) }, {$inc: { retryCount: 1 } });
                    var result = await get_contacts_status_duplicate(req, res, next)
                } else {
                    if (result.length != 0) {
                        result[0].contactStatusId = result[0].c_status._id;
                        var phnNo = result[0].phone_number;
                        var leadRes = await leadModel.find({ phnNo: phnNo });
                        var leadCount = await leadModel.count({ phnNo: phnNo });
                        var customRes = await agentModel.find({ phnNo: phnNo });
                        var customCount = await agentModel.count({ phnNo: phnNo })
                        var ticketRes = await ticketsModel.find({ phnNo: phnNo });
                        var ticketCount = await ticketsModel.count({ phnNo: phnNo });
                        res.locals.result = result;
                        res.locals.data = { leads: leadRes, customers: customRes, tickets: ticketRes };
                        res.locals.count = { leads: leadCount, customers: customCount, tickets: ticketCount };
                    } else {
                        res.locals.result = [];
                        res.locals.data = { leads: [], customers: [], tickets: [] };
                        res.locals.count = { leads: [], customers: [], tickets: [] };
                    }
                }
            } else {
                if (result.length != 0) {
                    result[0].contactStatusId = result[0].c_status._id;
                    var phnNo = result[0].phone_number;
                    var leadRes = await leadModel.find({ phnNo: phnNo });
                    var leadCount = await leadModel.count({ phnNo: phnNo });
                    var customRes = await agentModel.find({ phnNo: phnNo });
                    var customCount = await agentModel.count({ phnNo: phnNo })
                    var ticketRes = await ticketsModel.find({ phnNo: phnNo });
                    var ticketCount = await ticketsModel.count({ phnNo: phnNo });
                    res.locals.result = result;
                    res.locals.data = { leads: leadRes, customers: customRes, tickets: ticketRes };
                    res.locals.count = { leads: leadCount, customers: customCount, tickets: ticketCount };
                } else {
                    res.locals.result = [];
                    res.locals.data = { leads: [], customers: [], tickets: [] };
                    res.locals.count = { leads: [], customers: [], tickets: [] };
                }
            }
            var update = await contactStatusModel.updateOne({ _id: new ObjectId(result[0].c_status._id) }, { $inc: { retryCount: 1, attempt: 1 } });
        } else {
            res.locals.result = [];
            res.locals.data = { leads: [], customers: [], tickets: [] };
            res.locals.count = { leads: [], customers: [], tickets: [] };
        }
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function get_phonebook_selectbox_bydept(req, res, next) {
    try {
        const id_department = req.query.id_department;
        const id_user = req.token.id_user;
        const isAdmin = req.token.isAdmin;
        const isSubAdmin = req.token.isSubAdmin;
        const isDept = req.token.isDept;

        const query = { id_user: id_user };

        if (isAdmin == 1 || isSubAdmin == 1) {
            query.id_department = { $in: id_department.split(',').map(id => parseInt(id)) };
        }
        if (isDept == 1) {
            query.id_department = req.token.id
        }

        const result = await phonebookModel.find(query, { id: 1, pbname: 1 });

        const mappedResult = result.map(phonebook => ({
            id: phonebook._id,
            name: phonebook.pbname
        }));

        res.locals.result = mappedResult;
        next();
        res.locals.result = result
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}

async function get_campaign_hourly_duration(req, res, next) {
    try {
        var id_department = req.token.id_department;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var isAgent = req.token.isAgent;
        var id_user = req.token.id_user;
        var id = req.query.id;
        var date = req.query.date;
        var fromdatetime = new Date();
        var todatetime = new Date();
        if(date != undefined){
            if (date == "yesterday") {
                todatetime.setDate(todatetime.getDate() - 1)
                fromdatetime.setDate(fromdatetime.getDate() - 1)
            }
            if (date == "thisweek") {
                let { weekStart, weekEnd } = getWeekStartEnd(todatetime);
                fromdatetime = weekStart
                todatetime = weekEnd
                console.log("Week Start:", weekStart);
                console.log("Week End:", weekEnd);          
            }
            if (date == "thismonth") {
                let { monthStart, monthEnd } = getMonthStartEnd(todatetime);
                fromdatetime = monthStart
                todatetime = monthEnd
                console.log("Month Start:", monthStart);
                console.log("Month End:", monthEnd);
            }
            var currentdate = fromdatetime.getDate().toString().padStart(2, '0');
            var currentMnth = (fromdatetime.getMonth() + 1).toString().padStart(2, '0');
            var year = fromdatetime.getFullYear();
            var Start = `${year}-${currentMnth}-${currentdate} 00:00:00`;
            var currentdateEnd = todatetime.getDate().toString().padStart(2, '0');
            var currentMnthEnd = (todatetime.getMonth() + 1).toString().padStart(2, '0');
            var yearEnd = todatetime.getFullYear();
            var End = `${yearEnd}-${currentMnthEnd}-${currentdateEnd} 23:59:59`;
            console.log("Start :", Start);
            console.log("End :", End);
        }else {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            var fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
            var Todate = `${yyyy}-${mm}-${dd} 23:59:59`;
        }
        var incomingSql = `SELECT DATE_FORMAT(call_start_time, '%Y-%m-%d %H:00:00') AS hour, COUNT(*) AS total_sum,sum(duration) as totalduration,callStatus FROM cc_campaign_outgoing_reports WHERE call_start_time BETWEEN '${fromDate}' AND '${Todate}' and id_campaign = '${id}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        if (isSubAdmin == 1) {
            incomingSql += `and cc_campaign_outgoing_reports.id_department in(${id_department}) `;
        } else if (isDept == 1) {
            incomingSql += `and cc_campaign_outgoing_reports.id_department = '${req.token.id}' `;
        } else if (isAgent == 1) {
            incomingSql += `and cc_campaign_outgoing_reports.id_department = '${id_department}' `;
        }
        incomingSql += `GROUP BY hour,callStatus ORDER BY hour `;
        var [incomingRes] = await getConnection.query(incomingSql);
        var incomingStorage = [];
        var map_result = Promise.all(
            incomingRes.map(async (incoming) => {
                var dateSplit = incoming.hour.split(' ');
                if (incomingStorage.length == 0) {
                    incomingStorage.push({
                        hour: dateSplit[1],
                        duration: incoming.totalduration,
                        notConnected: 0,
                        connected: 0,
                        busy: 0,
                        cancelled: 0
                    });
                    if (incoming.callStatus == "busy" || incoming.callStatus == "BUSY") {
                        incomingStorage[0].busy = incoming.total_sum
                    }
                    else if (incoming.callStatus == "ANSWERED" || incoming.callStatus == "ANSWER") {
                        incomingStorage[0].connected = incoming.total_sum
                    }
                    else if (incoming.callStatus == "NO ANSWER" || incoming.callStatus == "NOANSWER" || incoming.callStatus == "") {
                        incomingStorage[0].notConnected = incoming.total_sum
                    }
                    else if (incoming.callStatus == "CANCEL") {
                        incomingStorage[0].cancelled = incoming.total_sum
                    }
                } else {
                    let foundObject = incomingStorage.findIndex(obj => obj.hour === dateSplit[1]);
                    if (foundObject != -1) {
                        if (incoming.callStatus == "busy" || incoming.callStatus == "BUSY") {
                            incomingStorage[foundObject].busy += incoming.total_sum
                        } else if (incoming.callStatus == "ANSWERED" || incoming.callStatus == "ANSWER") {
                            incomingStorage[foundObject].connected += incoming.total_sum
                        }
                        else if (incoming.callStatus == "NO ANSWER" || incoming.callStatus == "NOANSWER" || incoming.callStatus == "") {
                            incomingStorage[foundObject].notConnected += incoming.total_sum
                        }
                        else if (incoming.callStatus == "CANCEL") {
                            incomingStorage[foundObject].cancelled += incoming.total_sum
                        }
                        incomingStorage[foundObject].duration = Number(incomingStorage[foundObject].duration) + Number(incoming.totalduration);
                    } else {
                        incomingStorage.push({
                            hour: dateSplit[1],
                            duration: incoming.totalduration,
                            notConnected: 0,
                            connected: 0,
                            busy: 0,
                            cancelled: 0
                        });
                        var incominglength = incomingStorage.length - 1
                        if (incoming.callStatus == "busy" || incoming.callStatus == "BUSY") {
                            incomingStorage[incominglength].busy = incoming.total_sum
                        } else if (incoming.callStatus == "ANSWERED" || incoming.callStatus == "ANSWER") {
                            incomingStorage[incominglength].connected = incoming.total_sum
                        }
                        else if (incoming.callStatus == "NO ANSWER" || incoming.callStatus == "NOANSWER" || incoming.callStatus == "") {
                            incomingStorage[incominglength].notConnected = incoming.total_sum
                        }
                        else if (incoming.callStatus == "CANCEL") {
                            incomingStorage[incominglength].cancelled = incoming.total_sum
                        }
                    }
                }
            })
        )
        var output = await map_result;
        var map_result2 = Promise.all(
            incomingStorage.map(async (value) => {
                var hour = value.hour.split(':');
                var [hours, minutes, seconds] = value.hour.split(':').map(Number);
                var newHours = (hours + 1) % 24;
                var resultTime = `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                // var time  = hour[1].split(':');
                // var originalTime = new Date(value.hour); 
                // originalTime.setHours(originalTime.getHours() + 1);
                // var newTime = originalTime.toTimeString().split(" ")[0];
                var endtime = resultTime.split(':');
                value.hour = hour[0] + ':' + hour[1] + ' - ' + endtime[0] + ':' + endtime[1];
                return value
            })
        )
        var result = await map_result2;
        result.sort((a, b) => {
            const hourA = a.hour.split(' - ')[0];
            const hourB = b.hour.split(' - ')[0];
            return hourA.localeCompare(hourB, undefined, { numeric: true });
        });
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}
async function get_campaign_support_data(req, res, next) {
    try {
        var id_department = req.token.id_department;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var isAgent = req.token.isAgent;
        var id_user = req.token.id_user;
        var id = req.query.id;
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1
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
        }
        else {
            var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
            var End = `${yyyy}-${mm}-${dd} 23:59:59`;
        }
        var agentTotalCountSql = `SELECT  id_agent,COUNT(*) AS total_sum,sum(duration) as totalduration,callStatus,CONCAT(user.first_name, ' ', user.last_name) as agentName FROM cc_campaign_outgoing_reports LEFT JOIN user ON cc_campaign_outgoing_reports.user_id = user.id WHERE call_start_time  between '${Start}' and '${End}' and id_campaign = '${id}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        if (isSubAdmin == 1) {
            agentTotalCountSql += `and cc_campaign_outgoing_reports.id_department in(${id_department}) `;
        } else if (isDept == 1) {
            agentTotalCountSql += `and cc_campaign_outgoing_reports.id_department = '${req.token.id}' `;
        } else if (isAgent == 1) {
            agentTotalCountSql += `and cc_campaign_outgoing_reports.id_department = '${id_department}' `;
        }
        agentTotalCountSql += `GROUP BY id_agent,callStatus `;
        var [agentTotalCountRes] = await getConnection.query(agentTotalCountSql);
        var countByAgent = []
        agentTotalCountRes.map(async (value) => {
            if (countByAgent.length == 0) {
                countByAgent.push({
                    notConnected: 0,
                    connected: 0,
                    busy: 0,
                    cancelled: 0,
                    agentName: '',
                    agentId: ''
                });
                if (value.callStatus == "busy" || value.callStatus == "BUSY") {
                    countByAgent[0].busy = value.total_sum
                }
                else if (value.callStatus == "ANSWERED" || value.callStatus == "ANSWER") {
                    countByAgent[0].connected = value.total_sum
                }
                else if (value.callStatus == "NO ANSWER" || value.callStatus == "NOANSWER" || value.callStatus == "") {
                    countByAgent[0].notConnected = value.total_sum
                }
                else if (value.callStatus == "CANCEL") {
                    countByAgent[0].cancelled = value.total_sum
                }
                countByAgent[0].agentName = value.agentName
                countByAgent[0].agentId = value.id_agent
            } else {
                let foundObject = countByAgent.findIndex(obj => obj.agentId === value.id_agent);
                if (foundObject != -1) {
                    if (value.callStatus == "busy" || value.callStatus == "BUSY") {
                        countByAgent[foundObject].busy += value.total_sum
                    } else if (value.callStatus == "ANSWERED" || value.callStatus == "ANSWER") {
                        countByAgent[foundObject].connected += value.total_sum
                    }
                    else if (value.callStatus == "NO ANSWER" || value.callStatus == "NOANSWER" || value.callStatus == "") {
                        countByAgent[foundObject].notConnected += value.total_sum
                    }
                    else if (value.callStatus == "CANCEL") {
                        countByAgent[foundObject].cancelled += value.total_sum
                    }
                    countByAgent[foundObject].agentName = value.agentName
                    countByAgent[foundObject].agentId = value.id_agent
                } else {
                    countByAgent.push({
                        notConnected: 0,
                        connected: 0,
                        busy: 0,
                        cancelled: 0,
                        agentName: '',
                        agentId: ''
                    });
                    var valuelength = countByAgent.length - 1
                    if (value.callStatus == "busy" || value.callStatus == "BUSY") {
                        countByAgent[valuelength].busy = value.total_sum
                    } else if (value.callStatus == "ANSWERED" || value.callStatus == "ANSWER") {
                        countByAgent[valuelength].connected = value.total_sum
                    }
                    else if (value.callStatus == "NO ANSWER" || value.callStatus == "NOANSWER" || value.callStatus == "") {
                        countByAgent[valuelength].notConnected = value.total_sum
                    }
                    else if (value.callStatus == "CANCEL") {
                        countByAgent[valuelength].cancelled = value.total_sum
                    }
                    countByAgent[valuelength].agentName = value.agentName
                    countByAgent[valuelength].agentId = value.id_agent
                }
            }
        })
        var agent_map = Promise.all(
            countByAgent.map(async (value) => {
                value.totalCall = Number(value.notConnected) + Number(value.connected) + Number(value.cancelled) + Number(value.busy)
                return value
            })
        )
        var outputRes = await agent_map;
        res.locals.result1 = outputRes;
        res.locals.count = outputRes.length;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}
async function get_campaign_department_status(req, res, next) {
    try {
        var id_department = req.token.id_department;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var isAgent = req.token.isAgent;
        var id_user = req.token.id_user;
        var id = req.query.id;
        var date = req.query.date;
        var fromdatetime = new Date();
        var todatetime = new Date();
        if (date != undefined) {
            if (date == "yesterday") {
                todatetime.setDate(todatetime.getDate() - 1)
                fromdatetime.setDate(fromdatetime.getDate() - 1)
            }
            if (date == "lastweek") {
                fromdatetime.setDate(fromdatetime.getDate() - 7)
            }
            if (date == "lastmonth") {
                fromdatetime.setDate(fromdatetime.getDate() - 31)
            }
            var currentdate = fromdatetime.getDate();
            var currentMnth = fromdatetime.getMonth() + 1;
            var year = fromdatetime.getFullYear();
            var fromDate = `${year}-${currentMnth}-${currentdate} 00:00:00`;
            var currentdate = todatetime.getDate();
            var currentMnth = todatetime.getMonth() + 1;
            var year = todatetime.getFullYear();
            var Todate = `${year}-${currentMnth}-${currentdate} 23:59:59`;
        } else {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            var fromDate = `${yyyy}-${mm}-${dd} 00:00:00`;
            var Todate = `${yyyy}-${mm}-${dd} 23:59:59`;
        }
        var totalCountSql = `SELECT  COUNT(*) AS total_sum,sum(duration) as totalduration,callStatus FROM cc_campaign_outgoing_reports WHERE call_start_time  between '${fromDate}' and '${Todate}' and id_campaign = '${id}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        if (isSubAdmin == 1) {
            totalCountSql += `and cc_campaign_outgoing_reports.id_department in(${id_department}) `;
        } else if (isDept == 1) {
            totalCountSql += `and cc_campaign_outgoing_reports.id_department = '${req.token.id}' `;
        } else if (isAgent == 1) {
            totalCountSql += `and cc_campaign_outgoing_reports.id_department = '${id_department}' `;
        }
        totalCountSql += `GROUP BY callStatus `;
        var [totalCountRes] = await getConnection.query(totalCountSql);
        var obj = {
            connectedCall: 0,
            connectedDuration: 0,
            notConnected: 0,
            busy: 0,
            cancel: 0
        }
        totalCountRes.map(async (value) => {
            if (value.callStatus == "busy" || value.callStatus == "BUSY") {
                obj.busy = value.total_sum;
            } else if (value.callStatus == "ANSWERED" || value.callStatus == "ANSWER") {
                obj.connectedCall = value.total_sum;
                obj.connectedDuration = value.totalduration;
            }
            else if (value.callStatus == "NO ANSWER" || value.callStatus == "NOANSWER" || value.callStatus == "") {
                obj.notConnected = value.total_sum;
            }
            else if (value.callStatus == "CANCEL") {
                obj.cancel = value.total_sum;
            }
        });
        res.locals.result = [obj];
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}
async function get_campaign_support(req, res, next) {
    try {
        var id_department = req.token.id_department;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var isAgent = req.token.isAgent;
        var id_user = req.token.id_user;
        var id = req.query.id;
        var date = req.query.date;
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1
        var yyyy = today.getFullYear();
        if (date != undefined && date) {
            date = date.split('-');
            var Start = `${yyyy}-${mm}-${dd} ${date[0]}`;
            var End = `${yyyy}-${mm}-${dd} ${date[1]}`;
        } else {
            var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
            var End = `${yyyy}-${mm}-${dd} 23:59:59`;
        }
        var agentTotalCountSql = `SELECT  id_agent,COUNT(*) AS total_sum,sum(duration) as totalduration,callStatus,CONCAT(user.first_name, ' ', user.last_name) as agentName FROM cc_campaign_outgoing_reports LEFT JOIN user ON cc_campaign_outgoing_reports.user_id = user.id WHERE call_start_time between '${Start}' and '${End}' and id_campaign = '${id}' and cc_campaign_outgoing_reports.id_user = '${id_user}' `;
        if (isSubAdmin == 1) {
            agentTotalCountSql += `and cc_campaign_outgoing_reports.id_department in(${id_department}) `;
        } else if (isDept == 1) {
            agentTotalCountSql += `and cc_campaign_outgoing_reports.id_department = '${req.token.id}' `;
        } else if (isAgent == 1) {
            agentTotalCountSql += `and cc_campaign_outgoing_reports.id_department = '${id_department}' `;
        }
        agentTotalCountSql += `GROUP BY id_agent,callStatus `;
        var [agentTotalCountRes] = await getConnection.query(agentTotalCountSql);
        var countByAgent = []
        agentTotalCountRes.map(async (value) => {
            if (countByAgent.length == 0) {
                countByAgent.push({
                    notConnected: 0,
                    connected: 0,
                    busy: 0,
                    cancelled: 0,
                    agentName: '',
                    agentId: ''
                });
                if (value.callStatus == "busy" || value.callStatus == "BUSY") {
                    countByAgent[0].busy = value.total_sum
                }
                else if (value.callStatus == "ANSWERED") {
                    countByAgent[0].connected = value.total_sum
                }
                else if (value.callStatus == "NO ANSWER" || value.callStatus == "NOANSWER" || value.callStatus == "") {
                    countByAgent[0].notConnected = value.total_sum
                }
                else if (value.callStatus == "CANCEL") {
                    countByAgent[0].cancelled = value.total_sum
                }
                countByAgent[0].agentName = value.agentName
                countByAgent[0].agentId = value.id_agent
            } else {
                let foundObject = countByAgent.findIndex(obj => obj.agentId === value.id_agent);
                if (foundObject != -1) {
                    if (value.callStatus == "busy" || value.callStatus == "BUSY") {
                        countByAgent[foundObject].busy += value.total_sum
                    } else if (value.callStatus == "ANSWERED") {
                        countByAgent[foundObject].connected += value.total_sum
                    }
                    else if (value.callStatus == "NO ANSWER" || value.callStatus == "NOANSWER" || value.callStatus == "") {
                        countByAgent[foundObject].notConnected += value.total_sum
                    }
                    else if (value.callStatus == "CANCEL") {
                        countByAgent[foundObject].cancelled += value.total_sum
                    }
                    countByAgent[foundObject].agentName = value.agentName
                    countByAgent[foundObject].agentId = value.id_agent
                } else {
                    countByAgent.push({
                        notConnected: 0,
                        connected: 0,
                        busy: 0,
                        cancelled: 0,
                        agentName: '',
                        agentId: ''
                    });
                    var valuelength = countByAgent.length - 1
                    if (value.callStatus == "busy" || value.callStatus == "BUSY") {
                        countByAgent[valuelength].busy = value.total_sum
                    } else if (value.callStatus == "ANSWERED") {
                        countByAgent[valuelength].connected = value.total_sum
                    }
                    else if (value.callStatus == "NO ANSWER" || value.callStatus == "NOANSWER" || value.callStatus == "") {
                        countByAgent[valuelength].notConnected = value.total_sum
                    }
                    else if (value.callStatus == "CANCEL") {
                        countByAgent[valuelength].cancelled = value.total_sum
                    }
                    countByAgent[valuelength].agentName = value.agentName
                    countByAgent[valuelength].agentId = value.id_agent
                }
            }
        })
        var agent_map = Promise.all(
            countByAgent.map(async (value) => {
                value.totalCall = Number(value.notConnected) + Number(value.connected) + Number(value.cancelled) + Number(value.busy)
                return value
            })
        )
        var outputRes = await agent_map;
        res.locals.result = outputRes;
        res.locals.count = outputRes.length;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}

async function get_all_audiofiles(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var id_department = req.token.id_department;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var isAgent = req.token.isAgent;
        var department_id = req.query.id_department
        var audiofile = `SELECT * FROM audiofiles where id_user = '${id_user}' `;
        var [audiofileRes] = await getConnection.query(audiofile);
        res.locals.result = audiofileRes;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_calls_count(req, res, next) {
    try {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1
        var yyyy = today.getFullYear();
        var Start = `${yyyy}-${mm}-${dd} 00:00:00`;
        var End = `${yyyy}-${mm}-${dd} 23:59:59`;
        var id_department = req.token.id_department;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var isAgent = req.token.isAgent;
        var id_user = req.token.id_user;
        var sqlCountLivecallOutgoing = `select COUNT(id) as livecallOutgoingCount  from livecalls_outgoing  where date between '${Start}' and '${End}' and livecalls_outgoing.id_user = '${id_user}' `
        if (isSubAdmin == 1) {
            sqlCountLivecallOutgoing += `and livecalls_outgoing.id_department in(${id_department}) `;
        } else if (isDept == 1) {
            sqlCountLivecallOutgoing += `and livecalls_outgoing.id_department = '${req.token.id}' `;
        } else if (isAgent == 1) {
            sqlCountLivecallOutgoing += `and livecalls_outgoing.id_department = '${id_department}' `;
        }
        var [liveCallOutgoingCount] = await getConnection.query(sqlCountLivecallOutgoing)
        var sqlCountLivecallIncoming = `select COUNT(id) as livecallIncomingCount from livecalls_incoming where date between '${Start}' and '${End}' and livecalls_incoming.id_user = '${id_user}' `
        if (isSubAdmin == 1) {
            sqlCountLivecallIncoming += `and livecalls_incoming.id_department in(${id_department}) `;
        } else if (isDept == 1) {
            sqlCountLivecallIncoming += `and livecalls_incoming.id_department = '${req.token.id}' `;
        } else if (isAgent == 1) {
            sqlCountLivecallIncoming += `and livecalls_incoming.id_department = '${id_department}' `;
        }
        var [liveCallIncomingCount] = await getConnection.query(sqlCountLivecallIncoming)
        // campaign outgoing count
        var campaignCount = `SELECT count(id) as campaignCount FROM cc_livecalls where createdAt between '${Start}' and '${End}' and is_live = 0 and id_user = '${id_user}' `
        if (isSubAdmin == 1) {
            campaignCount += `and id_department in(${id_department}) `;
        } else if (isDept == 1) {
            campaignCount += `and id_department = '${req.token.id}' `;
        } else if (isAgent == 1) {
            campaignCount += `and id_department = '${id_department}' `;
        }
        var [campaign_outgoingCount] = await getConnection.query(campaignCount)
        var liveIncoming = liveCallIncomingCount[0].livecallIncomingCount
        var liveOutgoing = liveCallOutgoingCount[0].livecallOutgoingCount;
        var campaignCallCount = campaign_outgoingCount[0].campaignCount;
        var totalOutgoingCall = liveOutgoing + campaignCallCount
        var result = { incoming_count: liveIncoming, outgoing_count: totalOutgoingCall }
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}

async function create_moh(req, res, next) {
    try {
        var data = req.body.moh;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var id_user = req.token.id_user;
        var id_department = 0;
        function getNextFolderName() {
            const timestamp = Date.now();
            return `folder_${timestamp}`;
        }
        const uniqueFolderName = getNextFolderName();
        const folderPath = `${process.env.file_PATH}/moh/${uniqueFolderName}`;
        var directory = path.join(__dirname, folderPath);
        var directory_path = JSON.stringify(directory)
        var sql = `INSERT INTO musiconhold(name,directory,mode,sort,id_user,id_department,moh_name,createdAt) VALUES ('${uniqueFolderName}','${folderPath}','files','alpha','${id_user}','${id_department}','${req.body.name}',NOW())`;
        var [sqlRes] = await sequelize.query(sql);
        console.log(sql)
        var mohId = sqlRes;
        fs.mkdir(folderPath, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to create folder' });
            }
        });
        async function copyAudioFile(sourceDirectory, destinationDirectory, fileName, index, mohId) {
            const sourceFilePath = path.join(sourceDirectory, fileName);
            const newFileName = String.fromCharCode(97 + index) + '.wav'; // Using ASCII values for a, b, c, ...
            const destinationFilePath = path.join(destinationDirectory, newFileName);
            try {
                const audioData = fs.readFileSync(sourceDirectory);
                fs.writeFileSync(destinationFilePath, audioData);
                console.log(`File '${fileName}' copied successfully.`);
            } catch (err) {
                console.error(`Error copying file '${fileName}':`, err);
                var delsql = `DELETE FROM musiconhold WHERE id = '${mohId}'`;
                var [delsqlRes] = await sequelize.query(delsql);
                console.error(`Delete res :`, delsqlRes);
                res.locals.result = "err";
                next()
            }
        }
        var mohFileArr = []
        data.map(async (data, index) => {
            var obj = { moh_id: mohId, file_name: data }
            mohFileArr.push(obj)
            const destinationDirectory = folderPath;
            const audioFilePath = `${process.env.file_PATH}/audio/${data}`
            copyAudioFile(audioFilePath, destinationDirectory, data, index, mohId);
        })
        var mohfileCreate = await mohFileModel.bulkCreate(mohFileArr)
        res.locals.result = "succes";
        
        if(req.token.byot) {
            //add moh to byot
            let dataForByot = {
                name: req.body.name,
                audioFiles: req.body.moh,
                destFolder: uniqueFolderName,
                id_user,
                id_department,
                musicOnHoldId: sqlRes,
                mohFilesData: mohfileCreate
            }
            callByotApi("POST", "/moh", dataForByot, undefined, { token: req.headers.token }, id_user);
        }
        
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function update_moh(req, res, next) {
    try {
        var id = req.query.id;
        var data = req.body.moh;
        var sql = `SELECT * FROM musiconhold WHERE id = '${id}'`;
        var [Res] = await getConnection.query(sql);
        var deleteMohfile = `DELETE FROM moh_files WHERE moh_id = '${id}'`;
        var [deleteMohfileRes] = await sequelize.query(deleteMohfile);
        var deletefolderPath = `${process.env.file_PATH}` + '/moh/' + `${Res[0].name}`;
        if (fs.existsSync(deletefolderPath)) {
            fs.rmdirSync(deletefolderPath, { recursive: true });
            console.log(`Folder '${deletefolderPath}' deleted successfully.`);
        } else {
            console.log(`Folder '${deletefolderPath}' does not exist.`);
        }
        function getNextFolderName() {
            const timestamp = Date.now();
            return `folder_${timestamp}`;
        }
        const uniqueFolderName = getNextFolderName();
        const folderPath = `${process.env.file_PATH}/moh/${uniqueFolderName}`;
        var sql = `UPDATE musiconhold SET name='${uniqueFolderName}',directory='${folderPath}',moh_name ='${req.body.name}'  WHERE id = '${id}'`;
        var [updateRes] = await sequelize.query(sql);
        var smartgroupSql = `UPDATE smart_group SET music_on_hold = '${uniqueFolderName}' WHERE music_on_hold = '${Res[0].name}'`;
        var [smartgroupRes] = await sequelize.query(smartgroupSql);
        var camapignSql = `UPDATE cc_campaign SET moh = '${req.body.name}' WHERE moh = '${Res[0].moh_name}'`;
        var [smartgroupRes] = await sequelize.query(camapignSql);
        fs.mkdir(folderPath, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to create folder' });
            }
        });
        async function copyAudioFile(sourceDirectory, destinationDirectory, fileName, index) {
            const sourceFilePath = path.join(sourceDirectory, fileName);
            console.log(fileName)
            const newFileName = String.fromCharCode(97 + index) + '.wav'; // Using ASCII values for a, b, c, ...

            const destinationFilePath = path.join(destinationDirectory, newFileName);
            try {
                const audioData = fs.readFileSync(sourceDirectory);
                console.log(audioData)
                fs.writeFileSync(destinationFilePath, audioData);
                console.log(`File '${fileName}' copied successfully.`);
            } catch (err) {
                console.error(`Error copying file '${fileName}':`, err);
            }
        }
        var mohFileArr = []
        data.map(async (data, index) => {
            var obj = { moh_id: id, file_name: data }
            mohFileArr.push(obj)
            const destinationDirectory = folderPath;
            // const audioFilePath = path.join(__dirname, '../../../media_upload', 'audio', data);
            const audioFilePath = `${process.env.file_PATH}/audio/${data}`
            copyAudioFile(audioFilePath, destinationDirectory, data, index);
        })
        var mohfileCreate = await mohFileModel.bulkCreate(mohFileArr)
        res.locals.result = "succes";
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_moh(req, res, next) {
    try {
        var limit = Number(req.query.count);
        var skip = req.query.page;
        skip = (skip - 1) * limit;
        var name = req.query.name;
        var fromDate = req.query.from;
        var toDate = req.query.to;
        var id_department = req.token.id_department;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var id_user = req.token.id_user;
        var isAgent = req.token.isAgent
        var department_id = req.query.id_department
        var sql = `select musiconhold.id,moh_name as name,musiconhold.id_department,musiconhold.name as folderName,departments.name as departmentName,musiconhold.createdAt from musiconhold LEFT JOIN departments ON departments.id = musiconhold.id_department  where musiconhold.id_user = '${id_user}' `
        var sqlCount = `select COUNT(musiconhold.id) as total from musiconhold LEFT JOIN departments ON departments.id = musiconhold.id_department where musiconhold.id_user = '${id_user}' `
        if (name != undefined) {
            sql += `and musiconhold.moh_name like '%${name}%' `;
            sqlCount += `and musiconhold.moh_name like '%${name}%' `;
        }

        sql += ` order by id desc limit ${skip},${limit}`;
        sqlCount += ` order by musiconhold.id desc`;


        var [result] = await getConnection.query(sql);
        var map_result = Promise.all(
            result.map(async (data) => {
                var folderPath = `${process.env.file_PATH}` + '/moh/' + data.folderName
                fs.readdir(folderPath, (err, files) => {
                    if (err) {
                        return console.error('Unable to scan directory: ' + err);
                    }
                    data.moh = files
                });
                return data;
            })
        )
        var output = await map_result;


        var [count] = await getConnection.query(sqlCount);
        res.locals.result = output;
        res.locals.count = count[0].total;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}
async function get_moh_by_id(req, res, next) {
    try {
        var id = req.query.id;
        var moh = []
        var sql = `SELECT * FROM musiconhold WHERE id = '${id}'`;
        var [Res] = await getConnection.query(sql);
        var sql1 = `SELECT file_name FROM moh_files WHERE moh_id = '${id}' ORDER BY id ASC`;
        var [fileRes] = await getConnection.query(sql1);
        fileRes.map(async (data) => {
            moh.push(data.file_name)
        })
        const obj = { name: Res[0].moh_name, moh: moh, id_department: Res[0].id_department };
        res.locals.result = obj;
        next();
    }
    catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function delete_moh(req, res, next) {
    try {
        var id = req.query.id;
        var sql = `SELECT * FROM musiconhold WHERE id = '${id}'`;
        var [Res] = await getConnection.query(sql);
        var folderPath = `${process.env.file_PATH}` + '/moh/' + `${Res[0].name}`;
        if (fs.existsSync(folderPath)) {
            fs.rmdirSync(folderPath, { recursive: true });
            console.log(`Folder '${folderPath}' deleted successfully.`);
        } else {
            console.log(`Folder '${folderPath}' does not exist.`);
        }
        var deleteSql = `DELETE FROM musiconhold WHERE id = '${id}'`;
        var [deleteRes] = await sequelize.query(deleteSql);
        var deletemohfileSql = `DELETE FROM moh_files WHERE moh_id = '${id}'`;
        var [deletemohfileRes] = await sequelize.query(deletemohfileSql);

        if(req.token.byot) {
            const folderName  = Res[0]?.directory?.split("/")?.at(-1)
            callByotApi("DELETE", `/moh/${folderName}`, undefined, undefined, { token: req.headers.token }, req.token.id_user)
        }
        
        res.locals.result = deleteRes;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_moh_selectbox(req, res, next) {
    try {
        var id_department = req.token.id_department;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var isAgent = req.token.isAgent;
        var id_user = req.token.id_user;
        var sql = `select id,moh_name,name from musiconhold where id_user = '${id_user}' `;
        if (isSubAdmin == 1) {
            sql += `and id_department in(${id_department}) `;
        } else if (isDept == 1) {
            sql += `and id_department = '${req.token.id}' `;
        } else if (isAgent == 1) {
            sql += `and id_department = '${id_department}' `;
        }
        var [result] = await getConnection.query(sql);
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}

async function whatsapp_integration(req, res, next) {
    try {
        var data = req.body;
        var phnNo = data.destination;
        var isHandover = 0;
        if (data.integration.smsMode == 1) {
            var sms = await smsAxiosCall(phnNo, data.template_id, isHandover, data.statusId)
        }
        if (data.integration.whatsappMode == 1) {
            var whatsapp = await whatsappAxiosCall(phnNo, template_id, isHandover, statusId)
        }
        if (data.integration.apiMode == 1) {
            var api = await apiAxiosCall(phnNo, template_id, isHandover, statusId)
        }
        var result = { sms, whatsapp, api }
        res.locals.result = result;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}
async function whatsapp_integration_axios(axiosConfig, responseName) {
    try {
        const qs = require('qs');
        let data = qs.stringify({
            'grant_type': 'password',
            'client_id': 'ipmessaging-client',
            'username': 'manoramapd',
            'password': 'Sinch@7356838111'
        });
        axiosConfig.data = data;
        const response = await axios(axiosConfig);
        if (responseName != undefined) {
            var responseData = response.data[responseName];
            if (responseData != undefined) {
                return responseData
            } else {
                return false
            }
        } else {
            return response.data
        }
    } catch (error) {
        console.error(error);
        return false
    }
}

async function schedule_list(req, res, next) {
    try {
        var shceduleJob = schedule.scheduledJobs
        console.log('Count of Scheduled jobs...............................................', schedule.scheduledJobs);
        const jsonString = CircularJSON.stringify(shceduleJob, null, 2);
        logMessage('Count of Scheduled jobs................... ');
        logMessage(jsonString);
        res.locals.result = "succes"
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}
async function duplicatePhnno_remove(req, res, next) {
    try {
        var phonebook_id = req.query.phonebook_id;
        var phonebook = await phonebookContactsModel.find({ phonebook_id: phonebook_id });
        var uniquePhonebook = [];
        var seenPhoneNumbers = new Set();
        phonebook.forEach((contact) => {
            if (!seenPhoneNumbers.has(contact.phone_number)) {
                seenPhoneNumbers.add(contact.phone_number);
                uniquePhonebook.push(contact);
            }
        });
        console.log("Unique Phonebook:", uniquePhonebook);
        // Delete all contacts with duplicate phone numbers
        phonebook.forEach(async (contact) => {
            if (seenPhoneNumbers.has(contact.phone_number)) {
                seenPhoneNumbers.delete(contact.phone_number); // Remove the phone number from the set to handle subsequent occurrences
            } else {
                // Delete the document with duplicate phone number from MongoDB
                await phonebookContactsModel.deleteOne({ _id: contact._id });
                const update = await phonebookModel.updateOne(
                    { _id: new ObjectId(phonebook_id) },
                    { $inc: { contact_count: -1 } }
                );
            }
        });

        console.log("Duplicates Deleted.");
        res.locals.result = uniquePhonebook
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}
async function retryCount(req, res, next) {
    try {
        var campaignId = req.query.campaignId;
        var update = await contactStatusModel.updateMany({ campaignId: campaignId }, { $inc: { attempt: -1 } });
        res.locals.result = update
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}

async function create_whatsapp_campaign_integration(req, res, next) {
    try {
        var data = req.body;
        data.campaign_id = Number(data.campaign_id)
        var collectionId = req.query.collectionId;
        if (collectionId != undefined) {
            var add = await jwtModel.updateOne({ _id: new ObjectId(collectionId) }, { $set: data });
        } else {
            var add = await jwtModel.create(data);
        }
        res.locals.result = add
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}
async function get_whatsapp_campaign_integration(req, res, next) {
    try {
        var provider_id = req.query.id;
        var add = await jwtModel.find({ provider_id: provider_id });
        res.locals.result = add
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}
async function whatsapp_testing(req, res, next) {
    try {
        var campaignId = req.query.campaignId;
        var add = await jwtModel.find({ campaign_id: campaignId });
        var method = add[0]._doc.method;
        var url = add[0]._doc.url;
        var token = add[0]._doc.token;
        var dataStructure = add[0]._doc.dataStructure
        var bodyParams = add[0]._doc.bodyParams;
        var jwt_response = add[0]._doc.jwt_response;
        var jwt_method = add[0]._doc.jwt_method;
        var jwt_token_url = add[0]._doc.jwt_token_url;
        var jwtData = add[0]._doc.jwtData;
        if (bodyParams != undefined) {
            const objectValues = Object.keys(bodyParams);
            objectValues.map(async (DataValue) => {
                var replaceData = '$' + DataValue
                dataStructure = dataStructure.replace(replaceData, bodyParams[DataValue]);
            })
        }
        dataStructure = dataStructure.replace('"[', '[');
        dataStructure = dataStructure.replace(']"', ']');
        dataStructure = dataStructure.replace('"{', '{');
        dataStructure = dataStructure.replace('}"', '}');
        var parsedObject = JSON.parse(dataStructure);
        const jwtaxiosConfig = {
            method: jwt_method,
            url: jwt_token_url,
            data: jwtData,
        };
        var jwtRes = await whatsapp_integration_axios(jwtaxiosConfig, jwt_response)
        var headers = {
            "Authorization": "Bearer " + jwtRes,
            "Content-Type": "application/json"
        }
        const axiosConfig = {
            method: method,
            url: url,
            data: parsedObject,
            headers: headers
        };
        const response = await axios(axiosConfig);
        console.log(response.data);
        res.locals.result = response.data
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        res.locals.result1 = err.response.data
        next()
    }
}
async function create_api_integration(req, res, next) {
    try {
        var data = req.body.data;
        data.campaign_id = Number(data.campaign_id)
        var collectionId = req.query.collectionId;
        if (collectionId != undefined) {
            collectionId = collectionId.split(',');
            var deleteData = await apiIntegrationModel.deleteMany({ _id: { $in: collectionId.map(id => ObjectId(id)) } });
            var add = await apiIntegrationModel.insertMany(data);
        } else {
            var add = await apiIntegrationModel.insertMany(data);
        }
        res.locals.result = add;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}

async function broadcast_wp_integration_testing(req, res, next) {
    try {
        var callStatus = req.query.callStatus;
        var whatsappSettingIsEnabled = 1;
        var logDataJson = { "callStatus": "ANSWER", "totalCallDuration": 30, "cr_file": "bdjhbjhb_hsahb ds" }
        var campaignId = req.query.campaignId;
        var selectRes = [{ "didNumber": 123455555, "call_start_time": '6576273', "contact_number": "919072903510" }]
        if (callStatus == "ANSWER") {
            if (whatsappSettingIsEnabled == 1) {
                const sms = await broadcastSmsModel.find({ campaignId: campaignId });
                const whatsapp = await broadcastWhatsappModel.find({ campaignId: campaignId });
                const api = await broadcastApiModel.find({ campaignId: campaignId });
                if (sms.length != 0) {
                    var smsData = await broadcastSmsAxiosIntegration(sms[0]._doc, logDataJson, selectRes)
                }
                if (whatsapp.length != 0) {
                    var whatsappData = await broadcastWhatsappIntegration(whatsapp[0]._doc, logDataJson, selectRes)
                }
                if (api.length != 0) {
                    var apiData = await broadcastApiAxiosIntegration(api[0]._doc, logDataJson, selectRes)
                }
            }
        } else if (callStatus == "NOANSWER") {
            if (whatsappSettingIsEnabled == 1) {

            }
        }
        res.locals.result = response;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}

async function get_agent_by_campaignId(req, res, next) {
    try {
        var campaignId = req.query.campaignId;
        var sql = `select user_id as id_agent,CONCAT(user.first_name, ' ', user.last_name) AS agentName from cc_user_campaign JOIN user on user_id = user.id where id_campaign = '${campaignId}'`;
        var [result] = await getConnection.query(sql);
        res.locals.result = result;
        next()
    }
    catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function get_campaign_live_agents(req, res, next) {
    try {
        var campaignId = req.query.campaignId
        var agentId = req.query.id;
        var sql = `SELECT user.id as id,CONCAT(user.first_name, ' ', user.last_name) as name,currentBreakStartDate,currentBreakId,currentBreakName,currentCallStatus,currentCallAnsTime,lastCallEndTime,cc_user_campaign.currentStatus as campaignCurrentStatus FROM user JOIN user_live_data ON user.id = user_live_data.user_id join cc_user_campaign on cc_user_campaign.user_id = user.id WHERE user.id in(${agentId}) and id_campaign = '${campaignId}'`;
        var [result] = await getConnection.query(sql);
        var currentDate = new Date();
        var available_agents = [];
        var agents_on_break = [];
        var logout_agents = [];
        var breakArray = []
        if (result.length != 0) {
            result.map(async (data) => {
                breakArray.push(data.currentBreakId)
            })
            var breakSql = `SELECT id,break_type FROM breaks WHERE id in(${breakArray}) `;
            var [breakRes] = await getConnection.query(breakSql);
            result.map(async (data) => {
                var currentDate = new Date();
                if (data.campaignCurrentStatus == 1) {
                    var obj = {
                        id: data.id,
                        name: data.name,
                        breakStartDate: data.currentBreakStartDate,
                        breakId: data.currentBreakId,
                        currentCallAnsTime: data.currentCallAnsTime,
                        lastCallEndTime: data.lastCallEndTime,
                        campaignId: campaignId
                    }
                    if (data.currentCallStatus == 1 || data.currentCallStatus == 2 || data.currentCallStatus == 3 || data.currentCallStatus == 4) {
                        obj.status = "on_call"
                        var differenceInMilliseconds = Math.abs(currentDate - data.currentCallAnsTime);
                        var differenceInSeconds = differenceInMilliseconds / 1000;
                        console.log("The difference between the two dates is:", differenceInSeconds, "seconds");
                        obj.duration = differenceInSeconds
                    } else {
                        obj.status = "available"
                        var differenceInMilliseconds = Math.abs(currentDate - data.lastCallEndTime);
                        var differenceInSeconds = differenceInMilliseconds / 1000;
                        console.log("The difference between the two dates is:", differenceInSeconds, "seconds");
                        obj.duration = differenceInSeconds
                    }
                    available_agents.push(obj)
                } else {
                    if (data.campaignCurrentStatus == 0) {
                        var obj = {
                            id: data.id,
                            name: data.name,
                            breakStartDate: data.currentBreakStartDate,
                            breakId: data.currentBreakId,
                            currentCallAnsTime: data.currentCallAnsTime,
                            lastCallEndTime: data.lastCallEndTime,
                            status: data.currentBreakName,
                            campaignId: campaignId
                        }
                        logout_agents.push(obj)
                    }
                }
            })
        }
        var result = { available_agents, logout_agents }
        res.locals.result = result;
        next()
    }
    catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function remarks_skip(req, res, next) {
    try {
        var agentId = req.query.agentId;
        var campaignId = req.query.campaignId;
        var uniqueId = req.query.uniqueId;
        var obj = {
            agentId: agentId,
            status: "end",
            event: "end",
            is_data_submited: 1,
            campaignId: campaignId
        }
        var msg = 'campaignLiveReportAgent'
        var socket = await adminSocket(req.token.id_user, msg, obj);
        res.locals.result = campaignId;
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function shcedule_testing(req, res, next) {
    try {
        var uniqueName = '1';
        var secondScheduleUniqueName = "2";
        var time = req.query.time;
        var timeConvert = time.split(":")
        var array = req.body.array;
        var formattedTime = `0 ${timeConvert[1]} ${timeConvert[0]} * * *`;
        var job = schedule.scheduleJob(uniqueName, formattedTime, async () => {
            console.log("schedule successfull", formattedTime)
            async function processNextSetOfDates() {
                var phonebookdata = array.slice(0, 2);
                logMessage("frequency based ................" + 2)
                logMessage(phonebookdata)
                console.log(phonebookdata)
            }
            var intervalId = setInterval(processNextSetOfDates, 30000);
            scheduled_Jobs[uniqueName] = { job, intervalId };
        });

        res.locals.result = "success";
        next()
    }
    catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function shcedule_delete(req, res, next) {
    try {
        var uniqueName = '1';
        scheduleCancel(uniqueName)
        res.locals.result = "success";
        next()
    }
    catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}
async function scheduleCancel(name) {
    var scheduledJob = scheduled_Jobs[name];
    console.log(`Stopping schedule for uniqueName '${name}'.`);
    clearInterval(scheduledJob.intervalId);
    scheduledJob.job.cancel();
    delete scheduledJobs[name];
    console.log("cancel successfully......")
}

async function trans_credit(req, res, next) {
    try {
        var id_user = req.token.id_user;
        var totalCallDuration = req.query.totalCallDuration;
        var contact_number = req.query.contact_number;
        var digit_6 = contact_number.toString().substring(0, 6);
        var digit_5 = contact_number.toString().substring(0, 5);
        var digit_4 = contact_number.toString().substring(0, 4);
        var digit_3 = contact_number.toString().substring(0, 3);
        var digit_2 = contact_number.toString().substring(0, 2);
        var customerRateSql = `SELECT prefix,sellrate,pulse FROM customer_rate JOIN rates ON customer_rate.rate_id = rates.id WHERE customer_rate.customer_id = ${id_user}`;
        var [customerRate] = await getConnection.query(customerRateSql);
        if (customerRate.length != 0) {
            var creditValueData = customerRate.find(item => item.prefix == digit_6);
            if (!creditValueData)
                var creditValueData = customerRate.find(item => item.prefix == digit_5);
            if (!creditValueData)
                var creditValueData = customerRate.find(item => item.prefix == digit_4);
            if (!creditValueData)
                var creditValueData = customerRate.find(item => item.prefix == digit_3);
            if (!creditValueData)
                var creditValueData = customerRate.find(item => item.prefix == digit_2);
        }
        var trans_1creditsecSql = `select balance as trans_credit,credit_limit as trans_creditLimit from customers where id = ${id_user}`;
        var [trans_1creditsecRes] = await getConnection.query(trans_1creditsecSql);
        if (trans_1creditsecRes.length != 0) {
            if (!creditValueData) {
                var pulse = 0;
            } else {
                var pulse = creditValueData.pulse;
            }
            var trans1secValue = totalCallDuration / pulse;
            function customRound(number) {
                const decimalPart = number % 1;
                const integerPart = Math.floor(number);
                if (decimalPart >= 0.0 && decimalPart != 0 && decimalPart <= 0.5) {
                    return integerPart + 1;
                } else if (decimalPart >= 0.6 && decimalPart <= 0.9) {
                    return integerPart + 1;
                } else {
                    return Math.round(number);
                }
            }
            var trans1secValueRes = customRound(trans1secValue);
            if (trans1secValueRes == 0) {
                trans1secValueRes = 1
            }
            trans1secValueRes = trans1secValueRes * creditValueData.sellrate
            if (trans1secValueRes > trans_1creditsecRes[0].trans_credit) {
                if (trans1secValueRes < trans_1creditsecRes[0].trans_creditLimit) {
                    var transValue = trans_1creditsecRes[0].trans_creditLimit - trans1secValueRes;
                    var customerSql = `update customers set credit_limit = '${transValue}' where id = ${id_user}`;
                    var [customerRes] = await sequelize.query(customerSql);
                } else {
                    if (trans_1creditsecRes[0].trans_creditLimit > 0) {
                        var transValue = trans_1creditsecRes[0].trans_creditLimit - trans1secValueRes;
                        var customerSql = `update customers set credit_limit = '${transValue}' where id = ${id_user}`;
                        var [customerRes] = await sequelize.query(customerSql);
                    }
                }
            } else {
                var transValue = trans_1creditsecRes[0].trans_credit - trans1secValueRes;
                var customerSql = `update customers set balance = '${transValue}' where id = ${id_user}`;
                var [customerRes] = await sequelize.query(customerSql);
            }
        } else {
            var trans1secValueRes = 0;
        }
        res.locals.result = "success";
        next()
    }
    catch (err) {
        console.log(err);
        res.locals.result = "err";
        next()
    }
}

async function add_campaign_sms(req, res, next) {
    try {
        var sms = req.body;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
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
        sms.id_user = id_user;
        sms.id_department = id_department;
        var insertSms = await campaginSmsModel.create(sms);
        res.locals.result = insertSms;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function update_campaign_sms(req, res, next) {
    try {
        var id = req.query.id;
        var sms = req.body;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
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
        sms.id_user = id_user;
        sms.id_department = id_department;
        var result = await campaginSmsModel.deleteOne({ _id: new ObjectId(id) });
        var insertSms = await campaginSmsModel.create(sms);
        res.locals.result = insertSms;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function get_campaign_sms_by_id(req, res, next) {
    try {
        const id = req.query.id;
        const result = await campaginSmsModel.find({ _id: new ObjectId(id) });
        res.locals.result = result;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function delete_campaign_sms(req, res, next) {
    try {
        const id = req.query.id;
        var result = await campaginSmsModel.deleteOne({ _id: new ObjectId(id) });
        res.locals.result = result;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}

async function add_campaign_whatsapp(req, res, next) {
    try {
        var Whatsapp = req.body;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
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
        Whatsapp.id_user = id_user;
        Whatsapp.id_department = id_department;
        var insertwhatsapp = await campaginWhatsappModel.create(Whatsapp);
        res.locals.result = insertwhatsapp;
        next();
    } catch (err) {
        console.log(err);
        next();
    }
}
async function update_campaign_whatsapp(req, res, next) {
    try {
        var id = req.query.id;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var Whatsapp = req.body;
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
        Whatsapp.id_user = id_user;
        Whatsapp.id_department = id_department;
        var result = await campaginWhatsappModel.deleteOne({ _id: new ObjectId(id) });
        var insertwhatsapp = await campaginWhatsappModel.create(Whatsapp);
        res.locals.result = insertwhatsapp;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function get_campaign_whatsapp_by_id(req, res, next) {
    try {
        const id = req.query.id;
        const result = await campaginWhatsappModel.find({ _id: new ObjectId(id) });
        res.locals.result = result;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function delete_campaign_whatsapp(req, res, next) {
    try {
        const id = req.query.id;
        var result = await campaginWhatsappModel.deleteOne({ _id: new ObjectId(id) });
        res.locals.result = result;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}

async function add_campaign_api(req, res, next) {
    try {
        var api = req.body;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
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
        api.id_user = id_user;
        api.id_department = id_department;
        var insertapi = await campaginApiIntegrationModel.create(api);
        res.locals.result = insertapi;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function update_campaign_api(req, res, next) {
    try {
        var api = req.body;
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var id = req.query.id;
        if (isAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = 0;
        } else if (isSubAdmin == 1) {
            var id_user = req.token.id_user;
            var id_department = req.token.id_department;
        } else if (isDept == 1) {
            var id_user = req.token.id_user;
            var id_department = req.token.id_department;
        }
        api.id_user = id_user;
        api.id_department = id_department;
        var result = await campaginApiIntegrationModel.deleteOne({ _id: new ObjectId(id) });
        var insertapi = await campaginApiIntegrationModel.create(api);
        res.locals.result = insertapi;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function get_campaign_api_by_id(req, res, next) {
    try {
        const id = req.query.id;
        const result = await campaginApiIntegrationModel.find({ _id: new ObjectId(id) });
        res.locals.result = result;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function delete_campaign_api(req, res, next) {
    try {
        const id = req.query.id;
        var result = await campaginApiIntegrationModel.deleteOne({ _id: new ObjectId(id) });
        res.locals.result = result;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}


module.exports = {
    add_phonebook,
    update_phonebook,
    get_all_phonebook,
    get_by_phonebook_id,
    delete_phonebook,
    get_phonebook_selectbox,
    copy_phonebook,
    get_phonebook_by_campaignId,
    phonenumber_exist_checking,
    insert_phnbook_contacts,
    api_schedule,
    call_phonebook,
    update_phnbook_contacts,
    get_all_phnbook_contacts,
    get_by_phnbook_contacts_id,
    delete_phnbook_contacts,
    get_by_phnbook_by_campaignId,
    get_phnbook_contacts_byPhnbookId,
    get_phnbook_contacts_byCollectionId,
    delete_phnbook_collection,
    get_phnbook_collection_byPhnbookId,
    get_all_phnbook_collection_for_dropdown,
    get_by_phnbook_collection_id,
    update_phnbook_collection,
    get_phnbook_templates_by_phonebookId,
    get_phnbook_templates_by_collectionId,
    add_campaign,
    update_campaign,
    get_all_campaign,
    get_all_campaign_by_agent,
    get_by_campaign_id,
    delete_campaign,
    get_campaign_selectbox,
    get_campaign_selectbox_by_agent,
    get_campaign_contacts,
    get_by_campaign_details,
    update_campaign_status,
    agent_login,
    agent_logout,
    update_agent_status,
    insert_template,
    update_template,
    get_all_template,
    get_by_template_id,
    delete_template,
    insert_template_field,
    update_template_field,
    get_all_template_field,
    get_by_template_field_id,
    delete_template_field,
    template_selectbox,
    copy_templates,
    get_all_did,
    get_all_demo_did,
    get_all_ivr,
    get_phnbook_contacts_by_campaignId,
    get_phnbook_contacts_by_campaignId_duplicate,
    insert_contact_status,
    delete_contact_status,
    skip_contact_status,
    update_contact_status,
    add_campaign_call_summary,
    update_campaign_call_summary,
    get_campaign_call_summary,
    get_by_campaign_call_summary,
    delete_campaign_call_summary,
    update_counts,
    add_campaign_outgoingcall,
    update_campaign_outgoingcall,
    get_campaign_outgoingcall,
    get_campaign_outgoingcall_csv,
    get_by_campaign_outgoingcall,
    delete_campaign_outgoingcall,
    get_campaign_outgoingcall_by_agent,
    get_campaign_outgoingcall_csv_by_agent,
    get_all_campaign_outgoingcall_reports,
    get_all_campaign_outgoingcall_reports_csv,
    add_campaign_settings,
    update_campaign_settings,
    get_all_campaign_settings,
    get_by_campaign_settings_id,
    delete_campaign_settings,
    insert_campaign_settings,
    campaign_click_to_call,
    add_livecalls,
    get_all_livecalls,
    get_livecalls,
    trigger_agent_logout_by_living_the_page,
    get_campaign_CallSummary_by_campaignId,
    get_campaign_summery_by_phoneBookId,
    get_campaign_summery_by_agentId,
    get_schedule,
    get_setInterval,
    get_contacts_status,
    get_phonebook_selectbox_bydept,
    get_campaign_hourly_duration,
    get_campaign_support_data,
    get_campaign_department_status,
    get_campaign_support,
    get_all_audiofiles,
    get_calls_count,
    create_moh,
    update_moh,
    get_moh,
    get_moh_by_id,
    delete_moh,
    get_moh_selectbox,
    whatsapp_integration,
    schedule_list,
    duplicatePhnno_remove,
    retryCount,
    create_whatsapp_campaign_integration,
    get_whatsapp_campaign_integration,
    whatsapp_testing,
    create_api_integration,
    broadcast_wp_integration_testing,
    get_agent_by_campaignId,
    get_campaign_live_agents,
    remarks_skip,
    shcedule_testing,
    shcedule_delete,
    trans_credit,
    add_campaign_sms,
    get_campaign_sms_by_id,
    update_campaign_sms,
    delete_campaign_sms,
    add_campaign_whatsapp,
    get_campaign_whatsapp_by_id,
    update_campaign_whatsapp,
    delete_campaign_whatsapp,
    add_campaign_api,
    get_campaign_api_by_id,
    update_campaign_api,
    delete_campaign_api,
    broadcastIntegration,
}
