const fs = require('fs');
const path = require('path');
const  logMessage = {};

const logsDirectory = path.join(__dirname, 'logs');

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory);
}

const logFileName = path.join(logsDirectory, 'Broadcast_campaign.log');
const logStream = fs.createWriteStream(logFileName, { flags: 'a' });
logMessage.broadcastLogMessage = (dataArray) => {
    const formattedMessage = `${new Date().toISOString()} \n`;
    var data =  JSON.stringify(dataArray, null, 2);
    // Log to file
    logStream.write(data + '\n');
};

const logFileName1 = path.join(logsDirectory, 'callcenter_campaign.log');
const logStream1 = fs.createWriteStream(logFileName1, { flags: 'a' });
logMessage.callcenterLogMessage = (dataArray) => {
    const formattedMessage = `${new Date().toISOString()} \n`;
    var data =  JSON.stringify(dataArray, null, 2);
    // Log to file
    logStream1.write(data + '\n');
};

const logFileName2 = path.join(logsDirectory, 'campaign.log');
const logStream2 = fs.createWriteStream(logFileName2, { flags: 'a' });
logMessage.logMessage = (dataArray) => {
    const formattedMessage = `${new Date().toISOString()} \n`;
    var data =  JSON.stringify(dataArray, null, 2);
    // Log to file
    logStream2.write(data + '\n');
};

const logFileName3 = path.join(logsDirectory, 'callevent.log');
const logStream3 = fs.createWriteStream(logFileName3, { flags: 'a' });
logMessage.calleventlog = (dataArray) => {
    const formattedMessage = `${new Date().toISOString()} \n`;
    var data =  JSON.stringify(dataArray, null, 2);
    // Log to file
    logStream3.write(data + '\n');
};

const logFileName4 = path.join(logsDirectory, 'clickTocall.log');
const logStream4 = fs.createWriteStream(logFileName4, { flags: 'a' });
logMessage.clickTocallLog = (dataArray) => {
    const formattedMessage = `${new Date().toISOString()} \n`;
    var data =  JSON.stringify(dataArray, null, 2);
    // Log to file
    logStream4.write(data + '\n');
};
const logFileName5 = path.join(logsDirectory, 'callCenterPopup.log');
const logStream5 = fs.createWriteStream(logFileName5, { flags: 'a' });
logMessage.callCenterPopupLog = (dataArray) => {
    const formattedMessage = `${new Date().toISOString()} \n`;
    var data =  JSON.stringify(dataArray, null, 2);
    // Log to file
    logStream5.write(data + '\n');
};

module.exports =logMessage ;