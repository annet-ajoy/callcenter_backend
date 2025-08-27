var createError = require('http-errors');
var express = require('express');
var app = express();

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
app.use(cors());
require('dotenv').config()
const { createServer } = require("http");
const socketIo = require("socket.io");
const server = createServer(app);
app.io= socketIo(server, { cors: { origin: "*" } });
const mongoose = require('mongoose');

var ami = require('./helper/callEvents');

const { isAuthenticated} = require( './helper/auth' );
var campaignCtrl = require('./controller/campaignCtrl')
var scheduleRestart = "restart"
var campaignShedule = campaignCtrl.get_schedule(scheduleRestart) 
var apiShedule = campaignCtrl.api_schedule()
var didRes = ami.didSettings() 
const io = require('socket.io')(server);

const { errorHandler } = require("./Middleware/autox/errorHandler.middleware.js");

var indexRouter = require('./routes/index')(app.io);
var campaignRouter = require('./routes/campaign');
var testRouter = require('./routes/test')


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/campaign',campaignRouter);
app.use('/test',testRouter);

// app.use('/zoho',zohoRouter)
const multer = require('multer');

const storageForZoho = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/zoho');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storageForZoho }).any();
app.get('/click_to_call',isAuthenticated, ami.click_to_call, function (req, res, next) {
        var status = {
            'status': true,
            'message': "succesfull response",
            result: res.locals.result
        }
        res.status(200).json(status);
});
app.get('/callHold',isAuthenticated, ami.callHold, function (req, res, next) {
    var status = {
        'status': true,
        'message': "succesfull response",
        result: res.locals.result
    }
    res.status(200).json(status);
});
app.get('/unHold',isAuthenticated, ami.unHold, function (req, res, next) {
    var status = {
        'status': true,
        'message': "succesfull response",
        result: res.locals.result
    }
    res.status(200).json(status);
});
app.get('/hangupCall',isAuthenticated, ami.hangupCall, function (req, res, next) {
    var status = {
        'status': true,
        'message': "succesfull response",
        result: res.locals.result
    }
    res.status(200).json(status);
});


app.get('/campaign/agent_login',isAuthenticated, ami.campaign_login_click_to_call,campaignCtrl.agent_login, function (req, res, next){})

app.post('/campaign/campaign_click_to_call',isAuthenticated, ami.campaign_click_to_call,campaignCtrl.campaign_click_to_call, function (req, res, next){})

app.get('/campaign/campaign_agent_logout',isAuthenticated,campaignCtrl.agent_logout, ami.campaign_agent_logout, function (req, res, next){})

// app.get('/campaign/broadcast_campaign_click_to_call',isAuthenticated, ami.broadcast_campaign_click_to_call, function (req, res, next){})

app.get('/campaign/agent_call_hangup',isAuthenticated, ami.agent_call_hangup, function (req, res, next){})

app.post('/campaign/broadcast_campaign_click_to_call',isAuthenticated,(req, res, next) => ami.campaign_broadcast_click_to_call( req.body.phone_number,req.body.contactStatusId,req.body.campaignId,req.body.phoneBookId,req.body.callerId,req.body.uniqueId,req.body.id_user,req.body.appId,req.body.whatsapp_integration,req.body.didProvider,  req, res, next));


const dbConfig = require('./config/config');

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.set("strictQuery", false);
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true

}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

app.use(errorHandler);


module.exports = app;
