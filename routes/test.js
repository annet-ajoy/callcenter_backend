var express = require('express');
var router = express.Router();
const testCtrl = require('../controller/testCtrl');
const fs = require('fs');
const path = require('path');
const { isAuthenticated } = require( '../helper/auth' );

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${process.env.file_PATH}/audio`);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    },
});
const upload = multer({ storage: storage }).fields([
    { name: 'browsed_file', maxCount: 50 },
    { name: 'timeout_tries_browsed_file', maxCount: 50 },
    { name: 'timeout_browsed_file', maxCount: 50 },
    { name: 'invalid_browsed_file', maxCount: 50 },
])

router.get('/check',testCtrl.check, function (req, res, next) {
    var status = {
        'status': true,
        'message': "succesfull response",
        result: res.locals.result,
    }
    res.status(200).json(status);
});
router.get('/api_integration_testing/:filename', function (req, res, next) {
    // if (res.locals.result == 'err') {
    //     var status = {
    //         'status': false,
    //         'message': "Something went wrong",
    //         result: []
    //     }
    //     res.status(202).json(status);
    // }
    // else if (res.locals.result.length == 0) {
    //     var status = {
    //         'status': false,
    //         'message': "No result Found",
    //         result: [],
    //     }
    //     res.status(201).json(status);
    // }
    // else {
    //     var status = {
    //         'status': true,
    //         'message': "succesfull response",
    //         results: res.locals.result
    //     }
    //     res.status(200).json(status);
    // }
    const filePath = path.join(`D:\\Projects\\media_upload/audio/`, req.params.filename);
    res.sendFile(filePath, err => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
    
});
const loadMime = async () => {
    const mime = await import('mime');
    return mime.default;
};
router.get('/api_integration_testing_url',async function (req, res, next) {
    // if (res.locals.result == 'err') {
    //     var status = {
    //         'status': false,
    //         'message': "Something went wrong",
    //         result: []
    //     }
    //     res.status(202).json(status);
    // }
    // else if (res.locals.result.length == 0) {
    //     var status = {
    //         'status': false,
    //         'message': "No result Found",
    //         result: [],
    //     }
    //     res.status(201).json(status);
    // }
    // else {
    //     var status = {
    //         'status': true,
    //         'message': "succesfull response",
    //         results: res.locals.result
    //     }
    //     res.status(200).json(status);
    // }
   
    const mime = await loadMime(); // Load mime dynamically
    fs.readdir(`${process.env.file_PATH}/audio/`, (err, files) => {
        if (err) {
            res.status(500).send('Unable to scan directory: ' + err);
            return;
        }
        const audioFiles = files.filter(file => {
            const mimeType = mime.getType(file);
            return mimeType && mimeType.startsWith('audio');
        });
        console.log('Audio files found:', audioFiles); // Debugging line
        res.json(audioFiles);
    });
});
router.get('/broadcastIntegrationApi', testCtrl.broadcastIntegrationApi, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
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
            results: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.post('/development_call_event', testCtrl.development_call_event, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
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
            results: res.locals.result
        }
        res.status(200).json(status);
    }
});
router.post('/development_call_event_multiple', testCtrl.development_call_event_multiple, function (req, res, next) {
    if (res.locals.result == 'err') {
        var status = {
            'status': false,
            'message': "Something went wrong",
            result: []
        }
        res.status(202).json(status);
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
            results: res.locals.result
        }
        res.status(200).json(status);
    }
});

module.exports = router;