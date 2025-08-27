var sequelize = require('../database').db;
var getConnection = require('../database').getConnection;
var sequelize2 = require('../database').db3;
let ObjectId = require('mongodb').ObjectId;
var moment = require('moment');
var axios = require('axios');
const { Op, Sequelize, json } = require('sequelize');
const { string_encode, string_decode, encrypteAes128, decryptAes128 } = require('../helper/auth');
const roundrobin_allocation = require('../model/roundrobinAllocation');
const Password = require("node-php-password");
const fs = require('fs');
var path = require('path');
var smsProviderModel = require('../model/smsIntegrationModel')
var smsProviderHead = require('../model/smsIntegrationHead')
var smsProviderBody = require('../model/smsIntegrationBody')
var whatsappProviderModel = require('../model/whatsappIntegrationModel')
var whatsappProviderHead = require('../model/whatsappIntegrationHead')
var whatsappProviderBody = require('../model/whatsappIntegrationBody')
var apiProviderModel = require('../model/ApiIntegrationModel')
var apiProviderHead = require('../model/apiIntegrationHead')
var apiProviderBody = require('../model/ApiIntegrationBody')

var smsProviderModelAdmin = require('../model/smsProviderModelAdmin')
var smsProviderHeadAdmin = require('../model/smsProviderHeadAdmin')
var smsProviderBodyAdmin = require('../model/smsProviderBodyAdmin')
var whatsappProviderModelAdmin = require('../model/whatsappProviderModelAdmin')
var whatsappProviderHeadAdmin = require('../model/whatsappProviderHeadAdmin')
var whatsappProviderBodyAdmin = require('../model/whatsappProviderBodyAdmin')
var apiProviderModelAdmin = require('../model/apiProviderModelAdmin')
var apiProviderHeadAdmin = require('../model/apiProviderHeadAdmin')
var apiProviderBodyAdmin = require('../model/apiProviderBodyAdmin')

var templateSettingsVariable = require('../model/templateSettingsVariableModel')
var templateSms = require('../model/templateSmsModel')
var templateWhatsapp = require('../model/templateWhatsappModel')
var templateApi = require('../model/templateApiModel');

var didSmsModel = require('../model/didSmsModel')
var didWhatsappModel = require('../model/didWhatsappModel')

const { query } = require('express');
// var customerPlanModel = require('../model/customerPlanModel')
// var templateSms = require('../model/templateSmsModel')
// var templateWhatsapp = require('../model/templateWhatsappModel')
// var templateApi = require('../model/templateApiModel')
// var smsModel = require('../model/smsModel');
// var breaksModel = require('../model/breaksModel')


async function add_smartvoice_sms_provider(req, res, next) {
    try {
        var provider = req.body;
        var head = req.body.header;
        var body = req.body.body;
        var message = provider.message
        var provider_id = provider.provider_id
        var variables = provider.variables;
        var smsJsonBodyData = provider.smsJsonBodyData
        delete provider.smsJsonBodyData
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

        var insertProvider = await smsProviderModel.findOne({
            sms_provider_name: restProvider.name,
            id_user
          });
          
     if(insertProvider == null){
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
            ...restProvider
        });
        var provider_idd = insertProvider._doc._id;
        if (variables) {
            var insertVariable = await templateSettingsVariable.create({
                template_id: provider_idd,
                variables: variables
            });
        }
        if (head !== undefined) {
            var headEntries = head.map(entry => {
                const { _id, sms_id, ...rest } = entry;
                return {
                    sms_provider_id_head: _id,
                    sms_table_id: new ObjectId(provider_idd),
                    ...rest
                };
            });

            var insertProviderHead = await smsProviderHead.create(headEntries);
        }
        if (body !== undefined) {
            var bodyEntries = body.map(entry => {
                const { _id, sms_id, ...rest } = entry;
                return {
                    sms_provider_id_body: _id,
                    sms_table_id: new ObjectId(provider_idd),
                    ...rest
                };
            });

            var insertProviderBody = await smsProviderBody.create(bodyEntries);
        }
        if (smsJsonBodyData) {
            var obj = {
                "smsJsonBodyData": smsJsonBodyData,
                "sms_table_id": new ObjectId(provider_idd)
            }
            var bodyEntries = []
            bodyEntries.push(obj)
            var insertProviderBody = await smsProviderBody.create(obj);
        }
        res.locals.result = { result: insertProvider, head: insertProviderHead, body: insertProviderBody };
        next();
    }
    else{
        res.locals.result = "name already exist";
        next();
    }
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
    
}
async function get_smartvoice_all_sms(req, res, next) {
    try {
        const { id_user, isSubAdmin, isDept, id_department } = req.token;
        const { departmentId } = req.query;

        let query = { id_user }; 

        if (departmentId !== undefined) {
            query = { id_department: departmentId }; 
        } else if (isSubAdmin === 1) {
            query = { id_department: { $in: id_department } }; 
        } else if (isDept === 1) {
            query = { id_department: req.token.id }; 
        }

        const providers = await smsProviderModelAdmin.find(query).select("_id provider_name");
        res.locals.result = providers;
    } catch (error) {
        console.error("Error fetching providers:", error);
        res.locals.result = "err";
    }
    next();
}
async function get_smartvoice_sms_provider_by_id(req, res, next) {
    try {
        const id = req.query.id;

        const provider = await smsProviderModel.find({_id:id});
        const providerValuesHead = await smsProviderHead.find({ sms_table_id: new ObjectId(id) });
        const providerValuesBody = await smsProviderBody.find({ sms_table_id: new ObjectId(id),customType:2 });
        if(provider.length != 0){
            if(provider[0]._doc.type == 'JSON'){
                const json = await smsProviderBody.find({sms_table_id:provider[0]._doc._id});
                console.log(json)
                res.locals.result = { provider:provider[0],head:providerValuesHead,body:json}
                next()
            }else{
                const dataValues = await smsProviderBody.find({ sms_table_id: provider[0]._doc._id },{name:1,value:1,customType:1,fieldName:1});
                res.locals.result = { provider:provider[0],head:providerValuesHead,body:dataValues };
                next()
            }
        }
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
        const providerValuesHead = await smsProviderHeadAdmin.find({ sms_id: new ObjectId(id) });
        const providerValuesBody = await smsProviderBodyAdmin.find({ sms_id: new ObjectId(id) });
        res.locals.result = { provider,head:providerValuesHead,body:providerValuesBody };
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

        var idd = []
        const provider = await smsProviderModel.find({provider_id:provider_id});
        const sub_provider_id = provider.map(item=>{
            var id=item._doc._id
            idd.push(id)
        })
        // Fetch the provider values using the provider_id
        const providerValuesHead = await smsProviderHead.find({ sms_table_id: { $in: idd } });
        const providerValuesBody = await smsProviderBody.find({ sms_table_id: { $in: idd } });

        res.locals.result = { provider, providerValuesHead ,providerValuesBody};
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
        var message = provider.message
        var variables = provider.variables
        var smsJsonBodyData = provider.smsJsonBodyData
        delete provider.smsJsonBodyData
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

        var insertProvider = await smsProviderModel.findOne({
            sms_provider_name: restProvider.name,
            id_user: 3,
            _id: { $ne: provider_id } 
          });

          if(insertProvider == null){
          
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
                ...restProvider
            },
            { new: true }
        );
        await templateSettingsVariable.deleteMany({ template_id: new ObjectId(provider_id) });
        if (variables) {
            var insertVariable = await templateSettingsVariable.create({
                template_id: provider_id,
                variables: variables
            });
        }
        await smsProviderHead.deleteMany({ sms_table_id: new ObjectId(provider_id) });
        await smsProviderBody.deleteMany({ sms_table_id: new ObjectId(provider_id) });
        if (head !== undefined) {
            var headEntries = head.map(entry => {
                // Create a copy of the entry without the _id field
                const { _id, sms_id, ...rest } = entry;
                return {
                    sms_provider_id_head: _id,
                    sms_table_id: new ObjectId(provider_id),
                    ...rest
                };
            });

            // Assuming you have a MongoDB collection named 'apiKeys'
            var insertProviderHead = await smsProviderHead.create(headEntries);
        }
        if (body !== undefined) {
            var bodyEntries = body.map(entry => {
                const { _id, sms_id, ...rest } = entry;
                return {
                    sms_provider_id_body: _id,
                    sms_table_id: new ObjectId(provider_id),
                    ...rest
                };
            });
            // Assuming you have a MongoDB collection named 'smsProviderBody'
            var insertProviderBody = await smsProviderBody.create(bodyEntries);
        }
        if (smsJsonBodyData) {
            var obj = {
                "smsJsonBodyData": smsJsonBodyData,
                "sms_table_id": new ObjectId(provider_id)
            }
            var bodyEntries = []
            bodyEntries.push(obj)
            var insertProviderBody = await smsProviderBody.create(obj);
        }
        res.locals.result = { provider: updatedProvider };
        next();
    }
    else{
        res.locals.result = "name already exist";
        next();
    }
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function delete_smartvoice_sms_provider(req, res, next) {
    try {
        const provider_id = req.query.id;
        const deletedProvider = await smsProviderModel.findByIdAndDelete(provider_id);

        await templateSettingsVariable.deleteMany({ template_id: new ObjectId(provider_id) });
        await smsProviderHead.deleteMany({ sms_table_id: new ObjectId(provider_id) });
        await smsProviderBody.deleteMany({ sms_table_id: new ObjectId(provider_id) });

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
        var message = provider.message
        var provider_id = provider.provider_id
        var variables = provider.variables
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
        var whatsappJsonBodyData = provider.whatsappJsonBodyData
        delete provider.whatsappJsonBodyData
        var { header, body, variables, ...restProvider } = provider;

        var insertProvider = await whatsappProviderModel.findOne({
            whatsapp_provider_name: restProvider.name,
            id_user
          });
        if(insertProvider == null){
            var msg = message.message
            msg = msg.replaceAll('<br>', '\n');
            message.message = msg.replace(/<(.|\n)*?>/g, '');
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
            ...restProvider
        });
        var provider_idd = insertProvider._doc._id;
        if (variables) {
            var insertVariable = await templateSettingsVariable.create({
                template_id: provider_idd,
                variables: variables
            });
        }
        if (head !== undefined) {
            var headEntries = head.map(entry => {
                const { _id, whatsapp_id, ...rest } = entry;
                return {
                    whatsapp_provider_id_head: _id,
                    whatsapp_table_id: new ObjectId(provider_idd),
                    ...rest
                };
            });

            var insertProviderHead = await whatsappProviderHead.create(headEntries);
        }
        if (body !== undefined) {
            var bodyEntries = body.map(entry => {
                const { _id, whatsapp_id, ...rest } = entry;
                return {
                    whatsapp_provider_id_body: _id,
                    whatsapp_table_id: new ObjectId(provider_idd),
                    ...rest
                };
            });

            var insertProviderBody = await whatsappProviderBody.create(bodyEntries);
        }
        if (whatsappJsonBodyData) {
            var obj = {
                "whatsappJsonBodyData": whatsappJsonBodyData,
                "whatsapp_table_id": new ObjectId(provider_idd)
            }
            var bodyEntries = []
            bodyEntries.push(obj)
            var insertProviderBody = await whatsappProviderBody.create(obj);
        }
        res.locals.result = { result: insertProvider, head: insertProviderHead, body: insertProviderBody };
        next();
    }
        else{
            res.locals.result = "name already exist";
            next();
        }
    } catch (err) {
        console.log(err);
        next();
    }
}
async function get_smartvoice_all_whatsapp(req, res, next) {
    try {
        const { id_user, isSubAdmin, isDept, id_department } = req.token;
        const { departmentId } = req.query;

        let query = { id_user }; 

        if (departmentId !== undefined) {
            query = { id_department: departmentId }; 
        } else if (isSubAdmin === 1) {
            query = { id_department: { $in: id_department } }; 
        } else if (isDept === 1) {
            query = { id_department: req.token.id }; 
        }

        const providers = await whatsappProviderModelAdmin.find(query).select("_id provider_name");
        res.locals.result = providers;
    } catch (error) {
        console.error("Error fetching providers:", error);
        res.locals.result = "err";
    }
    next();
}
async function get_smartvoice_whatsapp_provider_by_id(req, res, next) {
    try {
        const provider_id = req.query.id;

        const provider = await whatsappProviderModel.findById(provider_id);

        const providerValuesHead = await whatsappProviderHead.find({ whatsapp_table_id: new ObjectId(provider_id) });
        const providerValuesBody = await whatsappProviderBody.find({ whatsapp_table_id: new ObjectId(provider_id)  });

        res.locals.result = { provider,head:providerValuesHead,body:providerValuesBody };
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
 
        const providerValuesHead = await whatsappProviderHeadAdmin.find({ whatsapp_id: new ObjectId(provider_id) });
        const providerValuesBody = await whatsappProviderBodyAdmin.find({ whatsapp_id: new ObjectId(provider_id)  });

        res.locals.result = { provider,head:providerValuesHead,body:providerValuesBody };
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
        const sub_provider_id = provider._doc._id
        const providerValuesHead = await whatsappProviderHead.findOne({ whatsapp_table_id: sub_provider_id });
        const providerValuesBody = await whatsappProviderBody.findOne({ whatsapp_table_id: sub_provider_id });

        res.locals.result = { provider, providerValuesHead ,providerValuesBody};
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
        var message = provider.message
        var variables = provider.variables
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
        var whatsappJsonBodyData = provider.whatsappJsonBodyData
        delete provider.whatsappJsonBodyData
        var insertProvider = await whatsappProviderModel.findOne({
            whatsapp_provider_name: restProvider.name,
            id_user: 3,
            _id: { $ne: provider_id } 
          });

          if(insertProvider == null){
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
                ...restProvider
            },
            { new: true }
        );
        await templateSettingsVariable.deleteMany({ template_id: new ObjectId(provider_id) });
        if (variables) {
            var insertVariable = await templateSettingsVariable.create({
                template_id: provider_id,
                variables: variables
            });
        }
        var providerValuesHead = await whatsappProviderHead.deleteMany({ whatsapp_table_id: provider_id });
        var providerValuesBody = await whatsappProviderBody.deleteMany({ whatsapp_table_id: provider_id });
        if (head !== undefined) {
            var headEntries = head.map(entry => {
                const { _id, whatsapp_id, ...rest } = entry;
                return {
                    whatsapp_provider_id_head: _id,
                    whatsapp_table_id: new ObjectId(provider_id),
                    ...rest
                };
            });

            var insertProviderHead = await whatsappProviderHead.create(headEntries);
        }
        if (body !== undefined) {
            var bodyEntries = body.map(entry => {
                const { _id, whatsapp_id, ...rest } = entry;
                return {
                    whatsapp_provider_id_body: _id,
                    whatsapp_table_id: new ObjectId(provider_id),
                    ...rest
                };
            });
            var insertProviderBody = await whatsappProviderBody.create(bodyEntries);
        }
        if (whatsappJsonBodyData) {
            var obj = {
                "whatsappJsonBodyData": whatsappJsonBodyData,
                "whatsapp_table_id": new ObjectId(provider_id)
            }
            var bodyEntries = []
            bodyEntries.push(obj)
            var insertProviderBody = await whatsappProviderBody.create(obj);
        }
        res.locals.result = { provider: updatedProvider, head: insertProviderHead, body: insertProviderBody };
        next();
    }
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function delete_smartvoice_whatsapp_provider(req, res, next) {
    try {
        const provider_id = req.query.id;

        const deletedProvider = await whatsappProviderModel.findByIdAndDelete(provider_id);
        await templateSettingsVariable.deleteMany({ template_id: new ObjectId(provider_id) });
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
        var message = provider.message
        var provider_id = provider.provider_id
        var apiJsonBodyData = provider.apiJsonBodyData
        delete provider.apiJsonBodyData
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
        var insertProvider = await apiProviderModel.findOne({
            api_provider_name: provider.name,
            id_user
          });
        if(insertProvider == null){
        var insertProvider = await apiProviderModel.create({
            method: provider.method,
            api_provider_name: provider.name,
            api_provider_id: provider_id,
            provider_id:provider_id,
            type: provider.type,
            url: provider.url,
            dynamic: provider.dynamic,
            message: message,
            callflow_enabled: provider.callflow_enabled,
            id_user,
            id_department
        });
        var provider_idd = insertProvider._doc._id;
        if (head !== undefined) {
            var headEntries = head.map(entry => {

                const { _id, api_id, ...rest } = entry;
                return {
                    api_provider_id_head: _id,
                    api_table_id: new ObjectId(provider_idd),
                    ...rest
                };
            });

            var insertProviderHead = await apiProviderHead.create(headEntries);
        }
        if (body !== undefined) {
            var bodyEntries = body.map(entry => {
                const { _id, api_id, ...rest } = entry;
                return {
                    api_provider_id_body: _id,
                    api_table_id: new ObjectId(provider_idd),
                    ...rest
                };
            });

            var insertProviderBody = await apiProviderBody.create(bodyEntries);
        }
        if (apiJsonBodyData) {
            var obj = {
                "apiJsonBodyData": apiJsonBodyData,
                "api_table_id": new ObjectId(provider_idd)
            }
            var bodyEntries = []
            bodyEntries.push(obj)
            var insertProviderBody = await apiProviderBody.create(obj);
        }
        res.locals.result = { result: insertProvider, head: insertProviderHead, body: insertProviderBody };
        next();
    }
    else{
        res.locals.result = "name already exist";
        next();
    }
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function get_smartvoice_all_api(req, res, next) {
    try {
        const { id_user, isSubAdmin, isDept, id_department } = req.token;
        const { departmentId } = req.query;

        let query = { id_user }; 

        if (departmentId !== undefined) {
            query = { id_department: departmentId }; 
        } else if (isSubAdmin === 1) {
            query = { id_department: { $in: id_department } }; 
        } else if (isDept === 1) {
            query = { id_department: req.token.id }; 
        }

        const providers = await apiProviderModelAdmin.find(query).select("_id provider_name");
        res.locals.result = providers;
    } catch (error) {
        console.error("Error fetching providers:", error);
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
        var message = provider.message
        var id_provider = provider.provider
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
        var apiJsonBodyData = provider.apiJsonBodyData
        delete provider.apiJsonBodyData
        var insertProvider = await apiProviderModel.findOne({
            api_provider_name: restProvider.name,
            id_user: 3,
            _id: { $ne: provider_id } 
          });

          if(insertProvider == null){

        const updatedProvider = await apiProviderModel.findByIdAndUpdate(
            provider_id,
            {
                method: provider.method,
                api_provider_name: provider.name,
                api_provider_id: id_provider,
                type: provider.type,
                url: provider.url,
                dynamic: provider.dynamic,
                message: message,
                callflow_enabled: provider.callflow_enabled,
                id_user,
                id_department
            },
            { new: true }
        );
        var providerValuesHead = await apiProviderHead.deleteMany({ api_table_id: provider_id });
        var providerValuesBody = await apiProviderBody.deleteMany({ api_table_id: provider_id });
        if (head !== undefined) {
            var headEntries = head.map(entry => {
                const { _id, api_id, ...rest } = entry;
                return {
                    api_provider_id_head: _id,
                    api_table_id: new ObjectId(provider_id),
                    ...rest
                };
            });

            var insertProviderHead = await apiProviderHead.create(headEntries);
        }
        if (body !== undefined) {
            var bodyEntries = body.map(entry => {
                const { _id, api_id, ...rest } = entry;
                return {
                    api_provider_id_body: _id,
                    api_table_id: new ObjectId(provider_id),
                    ...rest
                };
            });

            var insertProviderBody = await apiProviderBody.create(bodyEntries);
        }
        if (apiJsonBodyData) {
            var obj = {
                "apiJsonBodyData": apiJsonBodyData,
                "api_table_id": new ObjectId(provider_id)
            }
            var bodyEntries = []
            bodyEntries.push(obj)
            var insertProviderBody = await apiProviderBody.create(obj);
        }
        res.locals.result = { provider: updatedProvider, head: insertProviderHead, body: insertProviderBody };
        next();
    }
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function delete_smartvoice_api_provider(req, res, next) {
    try {
        const provider_id = req.query.id;
        const deletedProvider = await apiProviderModel.findByIdAndDelete(provider_id);

        await apiProviderHead.deleteMany({ api_table_id: new ObjectId(provider_id) });
        await apiProviderBody.deleteMany({ api_table_id: new ObjectId(provider_id) });

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
        const providerValuesHead = await apiProviderHead.find({ api_table_id: new ObjectId(provider_id) });
        const providerValuesBody = await apiProviderBody.find({ api_table_id: new ObjectId(provider_id)  });

        res.locals.result = { provider,head:providerValuesHead,body:providerValuesBody };
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
        const providerValuesHead = await apiProviderHeadAdmin.find({ api_id: new ObjectId(provider_id) });
        const providerValuesBody = await apiProviderBodyAdmin.find({ api_id: new ObjectId(provider_id)  });

        res.locals.result = { provider,head:providerValuesHead,body:providerValuesBody };
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
        var idd = []
        const provider = await apiProviderModel.find({provider_id:provider_id});
        const sub_provider_id = provider.map(item=>{
            var id=item._doc._id
            idd.push(id)
        })

        const providerValuesHead = await apiProviderHead.find({ provider_id: { $in: idd } });
        const providerValuesBody = await apiProviderBody.find({ provider_id: { $in: idd } });
        res.locals.result = { provider, providerValuesHead ,providerValuesBody};
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
        const type = req.query.type

        const method = req.query.method
        const url = req.query.url
        var phn_number = req.query.phn_number

        let providerValuesHead, providerValuesBody ,provider;

        if (type == 1) {
            provider = await smsProviderModel.findById(provider_id);
            providerValuesHead = await smsProviderHead.find({ sms_table_id: new ObjectId(provider_id) });
            providerValuesBody = await smsProviderBody.find({ sms_table_id: new ObjectId(provider_id) });
        } else if(type == 2){
            provider = await apiProviderModel.findById(provider_id);
            providerValuesHead = await apiProviderHead.find({ api_table_id: new ObjectId(provider_id) });
            providerValuesBody = await apiProviderBody.find({ api_table_id: new ObjectId(provider_id) });
        }
        else{
            provider = await whatsappProviderModel.findById(provider_id);
            providerValuesHead = await whatsappProviderHead.find({ whatsapp_table_id: new ObjectId(provider_id) });
            providerValuesBody = await whatsappProviderBody.find({ whatsapp_table_id: new ObjectId(provider_id) });
        }

        if (provider){
        var msg = provider._doc.message;
         msg = msg.replaceAll("$phno", phn_number);
        }

        providerValuesBody.push({message:msg})
        const axiosConfig = {
            method: method.toLowerCase(),
            url,
            headers:providerValuesHead,
            body:providerValuesBody
        };

        const axiosResponse = await axios(axiosConfig);
        
        res.locals.result = {
            provider,
            head: providerValuesHead,
            body: providerValuesBody,
            axiosResponse: axiosResponse.data
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
        var isAdmin = req.token.isAdmin;
        var isSubAdmin = req.token.isSubAdmin;
        var isDept = req.token.isDept;
        var isAgent = req.token.isAgent;
        const provider_id = req.query.id;
        var id_department = req.token.id_department
        if(isSubAdmin == 1){
        var id_department = id_department.split(',').map(Number);
        }
        const department_id = req.query.department_id;
        var skip = req.query.count
        var limit = Number(req.query.page)
        var id_user = req.token.id_user
        let combinedProviderList = [];

        try {
            let providerSmsList, providerApiList, providerWhatsappList;

            if (department_id) {
                providerSmsList = await smsProviderModel
                    .find({ id_department: department_id,id_user:id_user })
                    .select('_id sms_provider_name createdAt');
                providerApiList = await apiProviderModel
                    .find({ id_department: department_id ,id_user:id_user})
                    .select('_id api_provider_name createdAt');
                providerWhatsappList = await whatsappProviderModel
                    .find({ id_department: department_id,id_user:id_user })
                    .select('_id whatsapp_provider_name createdAt');
            }
            else if (isAdmin == 1){
                providerSmsList = await smsProviderModel
                .find({ id_user : id_user })
                .select('_id sms_provider_name createdAt');
            providerApiList = await apiProviderModel
                .find({ id_user : id_user })
                .select('_id api_provider_name createdAt');
            providerWhatsappList = await whatsappProviderModel
                .find({ id_user : id_user })
                .select('_id whatsapp_provider_name createdAt');
            }
            else if (isSubAdmin == 1){
                providerSmsList = await smsProviderModel
                .find({id_department: { $in: id_department },
                    id_user: id_user })
                .select('_id sms_provider_name createdAt');
            providerApiList = await apiProviderModel
                .find({ id_department: { $in: id_department },
                    id_user: id_user })
                .select('_id api_provider_name createdAt');
            providerWhatsappList = await whatsappProviderModel
                .find({ id_department: { $in: id_department },
                    id_user: id_user })
                .select('_id whatsapp_provider_name createdAt');
            }
            else if (isDept == 1){
                providerSmsList = await smsProviderModel
                .find({ id_department: req.token.id })
                .select('_id sms_provider_name createdAt');
            providerApiList = await apiProviderModel
                .find({ id_department: req.token.id })
                .select('_id api_provider_name createdAt');
            providerWhatsappList = await whatsappProviderModel
                .find({ id_department: req.token.id })
                .select('_id whatsapp_provider_name createdAt');
            }
            else {
                providerSmsList = await smsProviderModel.find().select('_id sms_provider_name createdAt');
                providerApiList = await apiProviderModel.find().select('_id api_provider_name createdAt');
                providerWhatsappList = await whatsappProviderModel.find().select('_id whatsapp_provider_name createdAt');
            }

            providerSmsList = providerSmsList.map(provider => {
                const providerObj = provider.toObject();
                providerObj.type = 1; 
                return providerObj;
            });

            providerApiList = providerApiList.map(provider => {
                const providerObj = provider.toObject();
                providerObj.type = 3;
                return providerObj;
            });

            providerWhatsappList = providerWhatsappList.map(provider => {
                const providerObj = provider.toObject();
                providerObj.type = 2; 
                return providerObj;
            });

            combinedProviderList = [
                ...providerSmsList,
                ...providerApiList,
                ...providerWhatsappList
            ];
            

        } catch (err) {
            console.error('Error fetching providers', err);
            combinedProviderList = [];
        }

        combinedProviderList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const total_count = combinedProviderList.length;
        skip = (skip * limit) - 1
        limit = (limit-1) * req.query.count
        var subset = combinedProviderList.slice(limit, skip+1)
        res.locals.result = { combinedProviderList:subset, total_count };
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function get_sms_template_id_from_smart_voice(req, res, next) {
    try {
        const { isSubAdmin, isAgent, isDept, id_user,isAdmin } = req.token;
        var id_department = req.token.id_department
        if(isSubAdmin == 1){
        var id_department = id_department.split(',').map(Number);
        }
        var department_id =  Number(req.query.id_department)
        let providers;

          // If user is a SubAdmin, fetch providers by id_user and department_id from query
          if (isAdmin == 1) {
            if(department_id != undefined){
            providers = await smsProviderModel.find({
                id_user: id_user,id_department:department_id
            }).select("_id sms_provider_name");
        }
        else{
            providers = await smsProviderModel.find({
                id_user: id_user,
            }).select("_id sms_provider_name department_id");
        }
        }
        

        // If user is a SubAdmin, fetch providers by id_user and department_id from query
        if (isSubAdmin == 1) {
            providers = await smsProviderModel.find(
                {id_department: { $in: id_department },
                id_user: id_user }
            ).select("_id sms_provider_name");
        }

        // If user is a Dept, fetch providers by id_user and id from the token
        if (isDept == 1) {
            providers = await smsProviderModel.find({
                id_user: id_user,
                id_department: req.token.id
            }).select("_id sms_provider_name");
        }

        // Store the result in res.locals
        res.locals.result = providers || [];
        next();
    } catch (err) {
        console.error(err);
        // If there's an error, set res.locals.result to "err"
        res.locals.result = "err";
        next();
    }
}
async function get_sms_message_by_template_id(req, res, next) {
    try {
        var id = req.query.id
        const message = await smsProviderModel.find({_id:id},{message:1,_id:1,type:1});
        const variables = await templateWhatsapp.find({template_id:id}).select("variables");
        if(message.length != 0){
            if(message[0]._doc.type == 'JSON'){
                const json = await smsProviderBody.find({sms_table_id:message[0]._doc._id},{smsJsonBodyData:1});
                console.log(json)
                res.locals.result = {message,variables,json}
                next()
            }else{
                const dataValues = await smsProviderBody.find({ sms_table_id: message[0]._doc._id,customType:2 },{name:1,value:1,customType:1});
                // var dataValues = data.reduce((acc, item) => {
                //     if (item.name && item.value) {
                //         acc[item.name] = item.value;
                //     }
                //     return acc;
                // }, {});
                res.locals.result = {message,variables,dataValues}
                next()
            }
        }
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}
async function get_whatsapp_template_id_from_smart_voice(req, res, next) {
    try {
        const { isSubAdmin, isAgent, isDept, id_user,isAdmin } = req.token;
        var id_department = req.token.id_department
        if(isSubAdmin == 1){
        var id_department = id_department.split(',').map(Number);
        }
        var department_id =  Number(req.query.id_department)
        let providers;

        if (isAdmin == 1) {
            if(department_id != undefined){
            providers = await whatsappProviderModel.find({
                id_user: id_user,id_department:department_id
            }).select("_id whatsapp_provider_name");
        }
        else{
            providers = await whatsappProviderModel.find({
                id_user: id_user,
            }).select("_id whatsapp_provider_name department_id");
        }
        }

        // If user is a SubAdmin, fetch providers by id_user and department_id from query
        if (isSubAdmin == 1) {
            providers = await whatsappProviderModel.find(
                {id_department: { $in: id_department },
                id_user: id_user }
            ).select("_id whatsapp_provider_name");
        }

        // If user is a Dept, fetch providers by id_user and id from the token
        if (isDept == 1) {
            providers = await whatsappProviderModel.find({
                id_user: id_user,
                id_department: req.token.id
            }).select("_id whatsapp_provider_name");
        }

        // Store the result in res.locals
        res.locals.result = providers || [];
        next();
    } catch (err) {
        console.error(err);
        // If there's an error, set res.locals.result to "err"
        res.locals.result = "err";
        next();
    }
}
async function get_whatsapp_message_by_template_id(req, res, next) {
    try {
        var id = req.query.id
        const message = await whatsappProviderModel.find({_id:id},{message:1,_id:1,type:1});
        const variables = await templateSettingsVariable.find({template_id:id}).select("variables");
        if(message.length != 0){
            if(message[0]._doc.type == 'JSON'){
                const json = await whatsappProviderBody.find({whatsapp_table_id:message[0]._doc._id},{whatsappJsonBodyData:1});
                console.log(json)
                res.locals.result = {message,variables,json}
                next()
            }else{
                const dataValues = await whatsappProviderBody.find({ whatsapp_table_id: message[0]._doc._id,customType:2 },{name:1,value:1,customType:1});
                // var dataValues = data.reduce((acc, item) => {
                //     if (item.name && item.value) {
                //         acc[item.name] = item.value;
                //     }
                //     return acc;
                // }, {});
                res.locals.result = {message,variables,dataValues}
                next()
            }
        }
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}
async function get_api_template_id_from_smart_voice(req, res, next) {
    try {
        const { isSubAdmin, isAgent, isDept, id_user,isAdmin } = req.token;
        var department_id =  Number(req.query.id_department)
        if(isSubAdmin == 1){
            var id_department = id_department.split(',').map(Number);
            }
        let providers;

        if (isAdmin == 1) {
            if(department_id != undefined){
            providers = await apiProviderModel.find({
                id_user: id_user,id_department:department_id
            }).select("_id api_provider_name");
        }
        else{
            providers = await apiProviderModel.find({
                id_user: id_user,
            }).select("_id api_provider_name department_id");
        }
        }

        // If user is a SubAdmin, fetch providers by id_user and department_id from query
        if (isSubAdmin == 1) {
            providers = await apiProviderModel.find(
                {id_department: { $in: id_department },
                id_user: id_user }
            ).select("_id api_provider_name");
        }

        // If user is a Dept, fetch providers by id_user and id from the token
        if (isDept == 1) {
            providers = await apiProviderModel.find({
                id_user: id_user,
                id_department: req.token.id
            }).select("_id api_provider_name");
        }

        // Store the result in res.locals
        res.locals.result = providers || [];
        next();
    } catch (err) {
        console.error(err);
        // If there's an error, set res.locals.result to "err"
        res.locals.result = "err";
        next();
    }
}
async function get_api_message_by_template_id(req, res, next) {
    try {
        var id = req.query.id
        const message = await apiProviderModel.find({_id:id});
        const variables = await templateSettingsVariable.find({template_id:id}).select("variables");
        if(message.length != 0){
            if(message[0]._doc.type == 'JSON'){
                const json = await apiProviderBody.find({api_table_id:message[0]._doc._id},{apiJsonBodyData:1});
                res.locals.result = {message,variables,json}
            }else{
                const dataValues = await apiProviderBody.find({ api_table_id: message[0]._doc._id,customType:2 },{name:1,value:1,customType:1});
                res.locals.result = {message,variables,dataValues}
            }
        }
        next()
    } catch (err) {
        console.log(err);
        res.locals.result = "err"
        next()
    }
}
async function add_template_sms(req, res, next) {
    try {
        var data = req.body;
        var insertProviderHead = await templateSms.create(data.result); 
        res.locals.result = insertProviderHead
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function update_template_sms_by_id(req, res, next) {
    try {
        var id = req.query.id;
        var data = req.body;
        await templateSms.findByIdAndDelete(id);
        data.result._id = id;
        var newTemplate = await templateSms.create(data.result);

        res.locals.result = newTemplate;
        next();
    } catch (err) {
        console.error(err);
        res.locals.result = "err";
        next();
    }
}
async function get_template_sms_for_status(req, res, next) {
    try {
        const templateId = req.query.id;
        const template = await templateSms.findOne({ templateId: templateId, isHandover: false });
        res.locals.result = template;
        next();
    } catch (err) {
        console.error(err);
        res.locals.result = "err";
        next(err);
    }
}
async function get_template_sms_for_handover(req, res, next) {
    try {
        const templateId = req.query.id;
        const template = await templateSms.findOne({ templateId: templateId, isHandover: true });
        res.locals.result = template;
        next();
    } catch (err) {
        console.error(err);
        res.locals.result = "err";
        next(err);
    }
}
async function delete_template_sms_by_id(req, res, next) {
    try {
        var id = req.query.id;
        var deletedTemplate = await templateSms.findByIdAndDelete(id);
        res.locals.result = deletedTemplate;
        next();
    } catch (err) {
        console.error(err);
        res.locals.result = "err";
        next();
    }
}
async function add_template_whatsapp(req, res, next) {
    try {
        var data = req.body;
        var insertProviderHead = await templateWhatsapp.create(data.result); 
        res.locals.result = insertProviderHead
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function update_template_whatsapp_by_id(req, res, next) {
    try {
        var id = req.query.id;
        var data = req.body;
        await templateWhatsapp.findByIdAndDelete(id);
        data.result._id = id;
        var newTemplate = await templateWhatsapp.create(data.result);

        res.locals.result = newTemplate;
        next();
    } catch (err) {
        console.error(err);
        res.locals.result = "err";
        next();
    }
}
async function get_template_whatsapp_for_status(req, res, next) {
    try {
        const templateId = req.query.id; 
        const template = await templateWhatsapp.findOne({ templateId: templateId ,isHandover: false }); 
        res.locals.result = template;
        next();
    } catch (err) {
        console.error(err);
        res.locals.result = "err";
        next();
    }
}
async function get_template_whatsapp_for_handover(req, res, next) {
    try {
        const templateId = req.query.id; 
        const template = await templateWhatsapp.findOne({ templateId: templateId ,isHandover: true }); 
        res.locals.result = template;
        next();
    } catch (err) {
        console.error(err);
        res.locals.result = "err";
        next();
    }
}
async function delete_template_whatsapp_by_id(req, res, next) {
    try {
        var id = req.query.id;
        var deletedTemplate = await templateWhatsapp.findByIdAndDelete(id);
        res.locals.result = deletedTemplate;
        next();
    } catch (err) {
        console.error(err);
        res.locals.result = "err";
        next();
    }
}
async function add_template_api(req, res, next) {
    try {
        var data = req.body;
        var insertProviderHead = await templateApi.create(data.result); 
        res.locals.result = insertProviderHead
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function update_template_api_by_id(req, res, next) {
    try {
        var id = req.query.id;
        var data = req.body;
        await templateApi.findByIdAndDelete(id);
        data.result._id = id;
        var newTemplate = await templateApi.create(data.result);

        res.locals.result = newTemplate;
        next();
    } catch (err) {
        console.error(err);
        res.locals.result = "err";
        next();
    }
}
async function get_template_api_by_id(req, res, next) {
    try {
        const templateId = req.query.id; 
        const template = await templateApi.findOne({ templateId: templateId}); 
        res.locals.result = template;
        next();
    } catch (err) {
        console.error(err);
        res.locals.result = "err";
        next();
    }
}
async function delete_template_api_by_id(req, res, next) {
    try {
        var id = req.query.id;
        var deletedTemplate = await templateApi.findByIdAndDelete(id);
        res.locals.result = deletedTemplate;
        next();
    } catch (err) {
        console.error(err);
        res.locals.result = "err";
        next();
    }
}

async function add_did_sms(req, res, next) {
    try {
        var data = req.body;
        var datas = data.didData
        var did_id = data.didId
        if(datas.length != 0){
        var updatedArray = datas.map(item => ({ ...item, did_id: did_id }));
        var result = await didSmsModel.insertMany(updatedArray); 
        }
        if (did_id !== undefined && did_id !== null) {
        var did = `update did set did_in_sms = 1 where id = ${did_id} `
        var [didResult] = await getConnection.query(did);
        }
        res.locals.result = result
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function get_did_sms_with_message(req, res, next) {
    try {
        const result = await didSmsModel.aggregate([
            {
                $lookup: {
                    from: "sms_integrations", // The collection to join with
                    localField: "integration_template_id", // Field from didSmsModel
                    foreignField: "_id", // Field from smsIntegrationModel
                    as: "integration_details" // Output array field
                }
            },
            {
                $unwind: {
                    path: "$integration_details",
                    preserveNullAndEmptyArrays: true // Ensure it's a left join
                }
            },
            {
                $project: {
                    _id: 1,
                    did_id: 1,
                    did_sms: 1,
                    integration_template_id: 1,
                    sms_repeat_count: 1,
                    repeat_interval: 1,
                    call_type: 1,
                    sending_type: 1,
                    send_to: 1,
                    send_to_phn_number: 1,
                    sending_parameters: 1,
                    message: "$integration_details.message" // Fetch the message field
                }
            }
        ]);

        function categorizeData(data) {
            return data.map(item => {
                if (item.call_type === 0 && item.sending_type === 0) {
                    item.category = "caller_answered";
                } else if (item.call_type === 0 && item.sending_type === 1) {
                    item.category = "caller_not_answered";
                } else if (item.call_type === 1 && item.sending_type === 0) {
                    item.category = "user_answered";
                } else if (item.call_type === 1 && item.sending_type === 1) {
                    item.category = "user_not_answered";
                }
                return item;
            });
        }
        if(result.length != 0){
        var categorizedData = categorizeData(result);
        }

        function groupDataByCategory(data) {
            return data.reduce((acc, item) => {
                if (!acc[item.category]) {
                    acc[item.category] = [];
                }
                acc[item.category].push(item);
                return acc;
            }, {});
        }
        if(categorizedData.length != 0){
        var groupedData = groupDataByCategory(categorizedData);
        }
        res.locals.result = groupedData;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function update_did_sms(req, res, next) {
    try {
        var id = req.query.id; 
        var updateData = req.body; 
        var result = await didSmsModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true } 
        );
        res.locals.result = result 
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function did_sms_disable(req, res, next) {
    try {
        var id = req.query.id; 
        var did = `update did set did_in_sms = 0 where id = ${id} `
        var [didResult] = await getConnection.query(did);
        res.locals.result = didResult 
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function add_did_whatsapp(req, res, next) {
    try {
        var data = req.body;
        var datas = data.didData
        var did_id = data.didId
        if(datas.length != 0){
        var updatedArray = datas.map(item => ({ ...item, did_id: did_id }));
        var result = await didWhatsappModel.insertMany(updatedArray); 
        }
        if (did_id !== undefined && did_id !== null) {
        var did = `update did set did_in_whatsapp = 1 where id = ${did_id} `
        var [didResult] = await getConnection.query(did);
        }
        res.locals.result = result
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function get_did_whatsapp_with_message(req, res, next) {
    try {
        const result = await didWhatsappModel.aggregate([
            {
                $lookup: {
                    from: "whatsapp_integrations", // The collection to join with
                    localField: "integration_template_id", // Field from didSmsModel
                    foreignField: "_id", // Field from smsIntegrationModel
                    as: "integration_details" // Output array field
                }
            },
            {
                $unwind: {
                    path: "$integration_details",
                    preserveNullAndEmptyArrays: true // Ensure it's a left join
                }
            },
            {
                $project: {
                    _id: 1,
                    did_id: 1,
                    did_sms: 1,
                    integration_template_id: 1,
                    sms_repeat_count: 1,
                    repeat_interval: 1,
                    call_type: 1,
                    sending_type: 1,
                    send_to: 1,
                    send_to_phn_number: 1,
                    sending_parameters: 1,
                    message: "$integration_details.message" // Fetch the message field
                }
            }
        ]);

        function categorizeData(data) {
            return data.map(item => {
                if (item.call_type === 0 && item.sending_type === 0) {
                    item.category = "caller_answered";
                } else if (item.call_type === 0 && item.sending_type === 1) {
                    item.category = "caller_not_answered";
                } else if (item.call_type === 1 && item.sending_type === 0) {
                    item.category = "user_answered";
                } else if (item.call_type === 1 && item.sending_type === 1) {
                    item.category = "user_not_answered";
                }
                return item;
            });
        }
        if(result.length != 0){
        var categorizedData = categorizeData(result);
        }

        function groupDataByCategory(data) {
            return data.reduce((acc, item) => {
                if (!acc[item.category]) {
                    acc[item.category] = [];
                }
                acc[item.category].push(item);
                return acc;
            }, {});
        }
        if(categorizedData.length != 0){
        var groupedData = groupDataByCategory(categorizedData);
        }
        res.locals.result = groupedData;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function update_did_whatsapp(req, res, next) {
    try {
        var id = req.query.id; 
        var updateData = req.body; 
        var result = await didWhatsappModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true } 
        );
        res.locals.result = result 
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function did_whatsapp_disable(req, res, next) {
    try {
        var id = req.query.id; 
        var did = `update did set did_in_whatsapp = 0 where id = ${id} `
        var [didResult] = await getConnection.query(did);
        res.locals.result = didResult 
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}

module.exports = {
    //callcenter
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
//ivr
    get_sms_template_id_from_smart_voice,
    get_sms_message_by_template_id,
    get_whatsapp_template_id_from_smart_voice,
    get_whatsapp_message_by_template_id,
    get_api_template_id_from_smart_voice,
    get_api_message_by_template_id,
//smart voice
    add_template_sms,
    get_template_sms_for_status,
    get_template_sms_for_handover,
    update_template_sms_by_id,
    delete_template_sms_by_id,

    add_template_whatsapp,
    get_template_whatsapp_for_status,
    get_template_whatsapp_for_handover,
    update_template_whatsapp_by_id,
    delete_template_whatsapp_by_id,

    add_template_api,
    get_template_api_by_id,
    update_template_api_by_id,
    delete_template_api_by_id,

    add_did_sms,
    get_did_sms_with_message,
    update_did_sms,
    did_sms_disable,

    add_did_whatsapp,
    get_did_whatsapp_with_message,
    update_did_whatsapp,
    did_whatsapp_disable
}