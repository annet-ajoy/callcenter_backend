var socketId = []
const config = require('../config/config');
const redis = config.redis

  
async function adminSocket(id, msg, data) {
    var userRooms = await redis.get("socketUsers");
    if (userRooms) {
        userRooms = JSON.parse(userRooms);
    } else {
        userRooms = [];
    }

    const adminId = 'admin_' + `${id}`;
    if (userRooms.includes(adminId)) {
        try {
            if (data !== undefined) {
                global.io.to(adminId).emit(msg, data, (ack) => {
                    if (ack) {
                        console.log(`Message "${msg}" emitted successfully to admin : ${adminId}`);
                    } else {
                        console.error(`Emit acknowledgment failed for "${msg}" to admin : ${adminId}`);
                    }
                });
            } else {
                global.io.to(adminId).emit(msg, (ack) => {
                    if (ack) {
                        console.log(`Message "${msg}" emitted successfully to admin : ${adminId}`);
                    } else {
                        console.error(`Emit acknowledgment failed for "${msg}" to admin : ${adminId}`);
                    }
                });
            }
        } catch (error) {
            console.error(`Emit failed for "${msg}" to admin : ${adminId}. Error: ${error.message}`);
        }
        return msg;
    }
}
async function departmentSocket(id, msg, data) { 
    var userRooms = await redis.get("socketUsers");
    if(userRooms){
      if(userRooms){
        userRooms = JSON.parse(userRooms)
      }else{
        userRooms = [];
      }
    }
    const deptId = 'deptId_' + `${id}`;
    if (userRooms.includes(deptId)) {
        try {
            if (data !== undefined) {
                global.io.to(deptId).emit(msg, data, (ack) => {
                    if (ack) {
                        console.log(`Message "${msg}" emitted successfully to department : ${deptId}`);
                    } else {
                        console.error(`Emit acknowledgment failed for "${msg}" to department : ${deptId}`);
                    }
                });
            } else {
                global.io.to(deptId).emit(msg, (ack) => {
                    if (ack) {
                        console.log(`Message "${msg}" emitted successfully to department : ${deptId}`);
                    } else {
                        console.error(`Emit acknowledgment failed for "${msg}" to department : ${deptId}`);
                    }
                });
            }
        } catch (error) {
            console.error(`Emit failed for "${msg}" to department : ${deptId}. Error: ${error.message}`);
        }
        return msg;
    }
}
async function subadminSocket(id, msg, data) { 
    var userRooms = await redis.get("socketUsers");
    if(userRooms){
      if(userRooms){
        userRooms = JSON.parse(userRooms)
      }else{
        userRooms = [];
      }
    }
    const subadminId = 'subAdminId_' + `${id}`;
    if (userRooms.includes(subadminId)) {
        try {
            if (data !== undefined) {
                global.io.to(subadminId).emit(msg, data, (ack) => {
                    if (ack) {
                        console.log(`Message "${msg}" emitted successfully to subadmin : ${subadminId}`);
                    } else {
                        console.error(`Emit acknowledgment failed for "${msg}" to subadmin : ${subadminId}`);
                    }
                });
            } else {
                global.io.to(subadminId).emit(msg, (ack) => {
                    if (ack) {
                        console.log(`Message "${msg}" emitted successfully to subadmin : ${subadminId}`);
                    } else {
                        console.error(`Emit acknowledgment failed for "${msg}" to subadmin : ${subadminId}`);
                    }
                });
            }
        } catch (error) {
            console.error(`Emit failed for "${msg}" to subadmin : ${subadminId}. Error: ${error.message}`);
        }
        return msg;
    }
}
async function userSocket(id, msg, data) { 
    var userRooms = await redis.get("socketUsers");
    if(userRooms){
      if(userRooms){
        userRooms = JSON.parse(userRooms)
      }else{
        userRooms = [];
      }
    }
    
    let userId = id.toString();
    if (userRooms.includes(userId)) {
        console.log(`userRooms in socket page --->: ${userRooms}`);
        try {
            if (data !== undefined) {
                global.io.to(userId).emit(msg, data, (ack) => {
                    if (ack) {
                        console.log(`Message "${msg}" emitted successfully to user: ${userId}`);
                    } else {
                        console.error(`Emit acknowledgment failed for "${msg}" to user: ${userId}`);
                    }
                });
            } else {
                global.io.to(userId).emit(msg, (ack) => {
                    if (ack) {
                        console.log(`Message "${msg}" emitted successfully to user: ${userId}`);
                    } else {
                        console.error(`Emit acknowledgment failed for "${msg}" to user: ${userId}`);
                    }
                });
            }
        } catch (error) {
            console.error(`Emit failed for "${msg}" to user: ${userId}. Error: ${error.message}`);
        }
        return msg;
    }
}
async function didSocket(id, msg, data) { 
    var userRooms = await redis.get("socketUsers");
    if(userRooms){
      if(userRooms){
        userRooms = JSON.parse(userRooms)
      }else{
        userRooms = [];
      }
    }
    const startsWith91 = id.substring(0, 2) === "91";
    if (!startsWith91) {
        id = "91" + id; // Add country code if not already present
    }

    let did = id.toString();
    if (userRooms.includes(did)) {
        try {
            if (data !== undefined) {
                global.io.to(did).emit(msg, data, (ack) => {
                    if (ack) {
                        console.log(`Message "${msg}" emitted successfully to did : ${did}`);
                    } else {
                        console.error(`Emit acknowledgment failed for "${msg}" to did : ${did}`);
                    }
                });
            } else {
                global.io.to(did).emit(msg, (ack) => {
                    if (ack) {
                        console.log(`Message "${msg}" emitted successfully to did : ${did}`);
                    } else {
                        console.error(`Emit acknowledgment failed for "${msg}" to did : ${did}`);
                    }
                });
            }
        } catch (error) {
            console.error(`Emit failed for "${msg}" to did : ${did}. Error: ${error.message}`);
        }
        return msg;
    } 
}
async function smartgroupSocket(id, msg, data) { 
    var userRooms = await redis.get("socketUsers");
    if(userRooms){
      if(userRooms){
        userRooms = JSON.parse(userRooms)
      }else{
        userRooms = [];
      }
    }
    const smartgroupId = 'smartgroupId_' + `${id}`;
    if (userRooms.includes(smartgroupId)) {
        try {
            if (data !== undefined) {
                global.io.to(smartgroupId).emit(msg, data, (ack) => {
                    if (ack) {
                        console.log(`Message "${msg}" emitted successfully to smartgroup : ${smartgroupId}`);
                    } else {
                        console.error(`Emit acknowledgment failed for "${msg}" to smartgroup : ${smartgroupId}`);
                    }
                });
            } else {
                global.io.to(smartgroupId).emit(msg, (ack) => {
                    if (ack) {
                        console.log(`Message "${msg}" emitted successfully to smartgroup : ${smartgroupId}`);
                    } else {
                        console.error(`Emit acknowledgment failed for "${msg}" to smartgroup : ${smartgroupId}`);
                    }
                });
            }
        } catch (error) {
            console.error(`Emit failed for "${msg}" to smartgroup : ${smartgroupId}. Error: ${error.message}`);
        }
        return msg;
    }
}

module.exports = { adminSocket, departmentSocket, subadminSocket, userSocket,didSocket,smartgroupSocket };
