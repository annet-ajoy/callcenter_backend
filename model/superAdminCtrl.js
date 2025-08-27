var smsProviderModel = require('../model/smsProviderModelAdmin')
var smsProviderHead = require('../model/smsProviderHeadAdmin')
var smsProviderBody = require('../model/smsProviderBodyAdmin')
var whatsappProviderModel = require('../model/whatsappProviderModelAdmin')
var whatsappProviderHead = require('../model/whatsappProviderHeadAdmin')
var whatsappProviderBody = require('../model/whatsappProviderBodyAdmin')
var apiProviderModel = require('../model/apiProviderModelAdmin')
var apiProviderHead = require('../model/apiProviderHeadAdmin')
var apiProviderBody = require('../model/apiProviderBodyAdmin')
const ObjectId = require('mongoose').Types.ObjectId;


async function get_all_provider(req, res, next) {
    try {
        const provider_id = req.query.id;
        try {
            // Fetch and modify SMS provider list
            let providerSmsList = await smsProviderModel.find().select('_id provider_name createdAt');
            providerSmsList = providerSmsList.map(provider => {
                const providerObj = provider.toObject();
                providerObj.type = 1;
                return providerObj;
            });
        
            // Fetch and modify API provider list
            let providerApiList = await apiProviderModel.find().select('_id provider_name createdAt');
            providerApiList = providerApiList.map(provider => {
                const providerObj = provider.toObject();
                providerObj.type = 3;
                return providerObj;
            });
        
            // Fetch and modify WhatsApp provider list
            let providerWhatsappList = await whatsappProviderModel.find().select('_id provider_name createdAt');
            providerWhatsappList = providerWhatsappList.map(provider => {
                const providerObj = provider.toObject();
                providerObj.type = 2;
                return providerObj;
            });
        
            // Combine all results into one list
            var combinedProviderList = [
                ...providerSmsList,
                ...providerApiList,
                ...providerWhatsappList
            ];
        
        } catch (err) {
            console.error('Error fetching providers', err);
        }
       
     combinedProviderList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
     var total_count = combinedProviderList.length
     

        res.locals.result = { combinedProviderList, total_count };
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}


async function add_sms_provider(req, res, next) {
    try {
        var provider = req.body;
        var head = req.body.header; // Array of key-value objects
        var body = req.body.body; // Array of key-value objects
        
        // Create the provider
        var insertProvider = await smsProviderModel.create({
            method: provider.method,
            provider_name: provider.name,
            type: provider.type,
            url: provider.url,
            dynamic: provider.dynamic
        });

        var  provider_id = insertProvider._doc._id;

        if (head !== undefined) {
            var headEntries = head.map(entry => ({
            sms_id:  new ObjectId(provider_id),
            ...entry  
            }));
          
            // Assuming you have a MongoDB collection named 'apiKeys'
            var insertProviderHead = await smsProviderHead.create(headEntries)
          }

          if (head !== undefined) {
            var bodyEntries = body.map(entry => ({
            sms_id:  new ObjectId(provider_id),
            ...entry  
            }));
          
            // Assuming you have a MongoDB collection named 'apiKeys'
            var insertProviderBody = await smsProviderBody.create(bodyEntries)
          }
          
        
        res.locals.result = {result:insertProvider,head:insertProviderHead,body:insertProviderBody};
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function get_sms_provider(req, res, next) {
    try {
        const provider_id = req.query.id;

        // Fetch the provider by ID
        const provider = await smsProviderModel.findById(provider_id);
        // Fetch the provider values using the provider_id
        const providerValuesHead = await smsProviderHead.find({ sms_id: new ObjectId(provider_id) }).select('-_id');
        const providerValuesBody = await smsProviderBody.find({ sms_id: new ObjectId(provider_id) }).select('-_id');
        res.locals.result = { provider,head:providerValuesHead,body:providerValuesBody };
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function update_sms_provider(req, res, next) {
    try {
        var provider_id = req.query.id;
        var provider = req.body;
        var head = req.body.header; // Array of key-value objects
        var body = req.body.body; // Array of key-value objects

        const updatedProvider = await smsProviderModel.findByIdAndUpdate(provider_id, {
            method: provider.method,
            provider_name: provider.name,
            type: provider.type,
            url: provider.url,
            dynamic: provider.dynamic
        }, { new: true })
       

        await smsProviderHead.deleteMany({ sms_id: new ObjectId(provider_id) });
        await smsProviderBody.deleteMany({ sms_id: new ObjectId(provider_id) });

        if (head !== undefined) {
            var headEntries = head.map(entry => ({
              sms_id: new ObjectId(provider_id),  
              ...entry     
            }));
          
            // Assuming you have a MongoDB collection named 'apiKeys'
            var insertProviderHead = await smsProviderHead.create(headEntries)
          }

          if (body !== undefined) {
            var bodyEntries = body.map(entry => ({
              sms_id: new ObjectId(provider_id),  
              ...entry   
            }));
          
            // Assuming you have a MongoDB collection named 'apiKeys'
            var insertProviderBody = await smsProviderBody.create(bodyEntries)
          }

        res.locals.result = { provider: updatedProvider};
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function delete_sms_provider(req, res, next) {
    try {
        const provider_id = req.query.id;

        // Delete the provider by ID
        const deletedProvider = await smsProviderModel.findByIdAndDelete(provider_id);

        // Delete the provider values using the provider_id
        await smsProviderHead.deleteMany({ sms_id: new ObjectId(provider_id) });
        await smsProviderBody.deleteMany({ sms_id: new ObjectId(provider_id) });

        res.locals.result = deletedProvider;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}



async function add_whatsapp_provider(req, res, next) {
    try {
        var provider = req.body;
        var head = req.body.header; // Array of key-value objects
        var body = req.body.body; // Array of key-value objects
        
        // Create the provider
        var insertProvider = await whatsappProviderModel.create({
            method: provider.method,
            provider_name: provider.name,
            type: provider.type,
            url: provider.url,
            dynamic: provider.dynamic,
        });

        var  provider_id = insertProvider._doc._id;

        if (head !== undefined) {
            var headEntries = head.map(entry => ({
            whatsapp_id:  new ObjectId(provider_id),
            ...entry  
            }));
          
            // Assuming you have a MongoDB collection named 'apiKeys'
            var insertProviderHead = await whatsappProviderHead.create(headEntries)
          }

          if (head !== undefined) {
            var bodyEntries = body.map(entry => ({
            whatsapp_id:  new ObjectId(provider_id),
            ...entry  
            }));
          
            // Assuming you have a MongoDB collection named 'apiKeys'
            var insertProviderBody = await whatsappProviderBody.create(bodyEntries)
          }
          
        
        res.locals.result = {result:insertProvider,head:insertProviderHead,body:insertProviderBody};
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function get_whatsapp_provider(req, res, next) {
    try {
        const provider_id = req.query.id;

        // Fetch the provider by ID
        const provider = await whatsappProviderModel.findById(provider_id);
        // Fetch the provider values using the provider_id
        const providerValuesHead = await whatsappProviderHead.find({ whatsapp_id: new ObjectId(provider_id) }).select('-_id');
        const providerValuesBody = await whatsappProviderBody.find({ whatsapp_id: new ObjectId(provider_id)  }).select('-_id');

        res.locals.result = { provider,head:providerValuesHead,body:providerValuesBody };
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function update_whatsapp_provider(req, res, next) {
    try {
        const provider_id = req.query.id;
        var provider = req.body;
        var head = req.body.header; // Array of key-value objects
        var body = req.body.body; // Array of key-value objects

        const updatedProvider = await whatsappProviderModel.findByIdAndUpdate(provider_id, {
            method: provider.method,
            provider_name: provider.name,
            type: provider.type,
            url: provider.url,
            dynamic: provider.dynamic
        }, { new: true })
       

        var providerValuesHead = await whatsappProviderHead.deleteMany({ whatsapp_id: provider_id });
        var providerValuesBody = await whatsappProviderBody.deleteMany({ whatsapp_id: provider_id });

        if (head !== undefined) {
            var headEntries = head.map(entry => ({
              whatsapp_id: new ObjectId(provider_id) ,  // Add any additional fields you want to include
              ...entry     // Spread operator to include all fields from entry
            }));
          
            // Assuming you have a MongoDB collection named 'apiKeys'
            var insertProviderHead = await whatsappProviderHead.create(headEntries)
          }

          if (body !== undefined) {
            var bodyEntries = body.map(entry => ({
              whatsapp_id: new ObjectId(provider_id),  // Add any additional fields you want to include
              ...entry     // Spread operator to include all fields from entry
            }));
          
            // Assuming you have a MongoDB collection named 'apiKeys'
            var insertProviderBody = await whatsappProviderBody.create(bodyEntries)
          }

        res.locals.result = { provider: updatedProvider, head: insertProviderHead,body:insertProviderBody };
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function delete_whatsapp_provider(req, res, next) {
    try {
        const provider_id = req.query.id;

        // Delete the provider by ID
        const deletedProvider = await whatsappProviderModel.findByIdAndDelete(provider_id);

        // Delete the provider values using the provider_id
        await whatsappProviderHead.deleteMany({ whatsapp_id: new ObjectId(provider_id) });
        await whatsappProviderBody.deleteMany({ whatsapp_id: new ObjectId(provider_id) });

        res.locals.result = deletedProvider;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}


async function add_api_provider(req, res, next) {
    try {
        var provider = req.body;
        var head = req.body.header; // Array of key-value objects
        var body = req.body.body; // Array of key-value objects
        
        // Create the provider
        var insertProvider = await apiProviderModel.create({
            method: provider.method,
            provider_name: provider.name,
            type: provider.type,
            url: provider.url,
            dynamic: provider.dynamic,
        });

        var  provider_id = insertProvider._doc._id;

        if (head !== undefined) {
            var headEntries = head.map(entry => ({
            api_id:  new ObjectId(provider_id),
            ...entry  
            }));
          
            // Assuming you have a MongoDB collection named 'apiKeys'
            var insertProviderHead = await apiProviderHead.create(headEntries)
          }

          if (head !== undefined) {
            var bodyEntries = body.map(entry => ({
            api_id:  new ObjectId(provider_id),
            ...entry  
            }));
          
            // Assuming you have a MongoDB collection named 'apiKeys'
            var insertProviderBody = await apiProviderBody.create(bodyEntries)
          }
          
        
        res.locals.result = {result:insertProvider,head:insertProviderHead,body:insertProviderBody};
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function get_api_provider(req, res, next) {
    try {
        const provider_id = req.query.id;

        // Fetch the provider by ID
        const provider = await apiProviderModel.findById(provider_id);
        // Fetch the provider values using the provider_id
        const providerValuesHead = await apiProviderHead.find({ api_id: new ObjectId(provider_id) }).select('-_id');
        const providerValuesBody = await apiProviderBody.find({ api_id: new ObjectId(provider_id)  }).select('-_id');

        res.locals.result = { provider,head:providerValuesHead,body:providerValuesBody };
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function update_api_provider(req, res, next) {
    try {
        const provider_id = req.query.id;
        var provider = req.body;
        var head = req.body.header; // Array of key-value objects
        var body = req.body.body; // Array of key-value objects

        const updatedProvider = await apiProviderModel.findByIdAndUpdate(provider_id, {
            method: provider.method,
            provider_name: provider.name,
            type: provider.type,
            url: provider.url,
            dynamic: provider.dynamic
        }, { new: true })
       

        var providerValuesHead = await apiProviderHead.deleteMany({ api_id: provider_id });
        var providerValuesBody = await apiProviderBody.deleteMany({ api_id: provider_id });

        if (head !== undefined) {
            var headEntries = head.map(entry => ({
              api_id: new ObjectId(provider_id),  // Add any additional fields you want to include
              ...entry     // Spread operator to include all fields from entry
            }));
          
            // Assuming you have a MongoDB collection named 'apiKeys'
            var insertProviderHead = await apiProviderHead.create(headEntries)
          }

          if (body !== undefined) {
            var bodyEntries = body.map(entry => ({
              api_id: new ObjectId(provider_id),  // Add any additional fields you want to include
              ...entry     // Spread operator to include all fields from entry
            }));
          
            // Assuming you have a MongoDB collection named 'apiKeys'
            var insertProviderBody = await apiProviderBody.create(bodyEntries)
          }

        res.locals.result = { provider: updatedProvider, head: insertProviderHead,body:insertProviderBody };
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}
async function delete_api_provider(req, res, next) {
    try {
        const provider_id = req.query.id;

        // Delete the provider by ID
        const deletedProvider = await apiProviderModel.findByIdAndDelete(provider_id);

        // Delete the provider values using the provider_id
        await apiProviderHead.deleteMany({ api_id: new ObjectId(provider_id) });
        await apiProviderBody.deleteMany({ api_id: new ObjectId(provider_id) });

        res.locals.result = deletedProvider;
        next();
    } catch (err) {
        console.log(err);
        res.locals.result = "err";
        next();
    }
}


module.exports = {
    add_sms_provider,
    get_sms_provider,
    update_sms_provider,
    delete_sms_provider,
    add_whatsapp_provider,
    get_whatsapp_provider,
    update_whatsapp_provider,
    delete_whatsapp_provider,
    add_api_provider,
    get_api_provider,
    update_api_provider,
    delete_api_provider,
    get_all_provider

}