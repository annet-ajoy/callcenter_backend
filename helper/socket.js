
// function adminSocket(id,msg,data) {
//     var adminId = 'admin_' +`${id}`;
//     if(data != undefined){
//         global.io.to(adminId).emit(msg,data);
//     }else{
//         global.io.to(adminId).emit(msg);
//     }
//     return msg
// }
var socketId = ['admin_3']
function adminSocket(id, msg, data, retries = 3, delay = 4000) {
    const adminId = 'admin_' + `${id}`;
    if (socketId.includes(adminId)){
        const emitMessage = () => {
            return new Promise((resolve, reject) => {
                try {
                    if (data !== undefined) {
                        global.io.to(adminId).emit(msg, data, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    } else {
                        global.io.to(adminId).emit(msg, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    }
                } catch (error) {
                    reject(error); // Emit failed
                }
            });
        };
    
        const retryEmit = async (attempts) => {
            try {
                await emitMessage();
                console.log(`Message "${msg}" emitted successfully to admin : ${adminId}`);
            } catch (error) {
                if (attempts > 0) {
                    console.warn(
                        `Emit failed for "${msg}" to admin : ${adminId}. Retrying... Attempts left: ${attempts}`
                    );
                    setTimeout(() => retryEmit(attempts - 1), delay);
                } else {
                    console.error(
                        `Emit failed for "${msg}" to admin : ${adminId}. No attempts left. Error: ${error.message}`
                    );
                }
            }
        };
    
        retryEmit(retries);
        return msg;
    }else{
        const emitMessage = () => {
            return new Promise((resolve, reject) => {
                try {
                    if (data !== undefined) {
                        global.io.to(adminId).emit(msg, data, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    } else {
                        global.io.to(adminId).emit(msg, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    }
                } catch (error) {
                    reject(error); // Emit failed
                }
            });
        };
    
        const retryEmit = async (attempts) => {
            try {
                await emitMessage();
                console.log(`Message "${msg}" emitted successfully to admin : ${adminId}`);
            } catch (error) {
                if (attempts > 0) {
                    console.warn(
                        `Emit failed for "${msg}" to admin : ${adminId}. Retrying... Attempts left: ${attempts}`
                    );
                    setTimeout(() => retryEmit(attempts - 1), delay);
                } else {
                    console.error(
                        `Emit failed for "${msg}" to admin : ${adminId}. No attempts left. Error: ${error.message}`
                    );
                }
            }
        };
    
        retryEmit(retries);
        return msg;
    }
    
}

// function departmentSocket(id,msg,data) {
//     var deptId = 'deptId_' +`${id}`;
//     if(data != undefined){
//         global.io.to(deptId).emit(msg,data);
//     }else{
//         global.io.to(deptId).emit(msg);
//     }
//     return msg
// }
function departmentSocket(id, msg, data, retries = 3, delay = 4000) { // Default 3 retries and 4 seconds delay
    const deptId = 'deptId_' + `${id}`;
    if (socketId.includes(deptId)) {
        const emitMessage = () => {
            return new Promise((resolve, reject) => {
                try {
                    if (data !== undefined) {
                        global.io.to(deptId).emit(msg, data, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    } else {
                        global.io.to(deptId).emit(msg, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    }
                } catch (error) {
                    reject(error); // Emit failed
                }
            });
        };

        const retryEmit = async (attempts) => {
            try {
                await emitMessage();
                console.log(`Message "${msg}" emitted successfully to department : ${deptId}`);
            } catch (error) {
                if (attempts > 0) {
                    console.warn(
                        `Emit failed for "${msg}" to department : ${deptId}. Retrying... Attempts left: ${attempts}`
                    );
                    setTimeout(() => retryEmit(attempts - 1), delay);
                } else {
                    console.error(
                        `Emit failed for "${msg}" to department : ${deptId}. No attempts left. Error: ${error.message}`
                    );
                }
            }
        };

        retryEmit(retries);
        return msg;
    } else {
        const emitMessage = () => {
            return new Promise((resolve, reject) => {
                try {
                    if (data !== undefined) {
                        global.io.to(deptId).emit(msg, data, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    } else {
                        global.io.to(deptId).emit(msg, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    }
                } catch (error) {
                    reject(error); // Emit failed
                }
            });
        };

        const retryEmit = async (attempts) => {
            try {
                await emitMessage();
                console.log(`Message "${msg}" emitted successfully to department : ${deptId}`);
            } catch (error) {
                if (attempts > 0) {
                    console.warn(
                        `Emit failed for "${msg}" to department : ${deptId}. Retrying... Attempts left: ${attempts}`
                    );
                    setTimeout(() => retryEmit(attempts - 1), delay);
                } else {
                    console.error(
                        `Emit failed for "${msg}" to department : ${deptId}. No attempts left. Error: ${error.message}`
                    );
                }
            }
        };

        retryEmit(retries);
        return msg;
    }
}

// function subadminSocket(id,msg,data) {
//     var subadminId = 'subAdminId_' +`${id}`;
//     if(data != undefined){
//         global.io.to(subadminId).emit(msg,data);
//     }else{
//         global.io.to(subadminId).emit(msg);
//     }
//     return msg
// }

function subadminSocket(id, msg, data, retries = 3, delay = 4000) { // Default 3 retries and 4 seconds delay
    const subadminId = 'subAdminId_' + `${id}`;
    if (socketId.includes(subadminId)) {
        const emitMessage = () => {
            return new Promise((resolve, reject) => {
                try {
                    if (data !== undefined) {
                        global.io.to(subadminId).emit(msg, data, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    } else {
                        global.io.to(subadminId).emit(msg, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    }
                } catch (error) {
                    reject(error); // Emit failed
                }
            });
        };

        const retryEmit = async (attempts) => {
            try {
                await emitMessage();
                console.log(`Message "${msg}" emitted successfully to subadmin : ${subadminId}`);
            } catch (error) {
                if (attempts > 0) {
                    console.warn(
                        `Emit failed for "${msg}" to subadmin : ${subadminId}. Retrying... Attempts left: ${attempts}`
                    );
                    setTimeout(() => retryEmit(attempts - 1), delay);
                } else {
                    console.error(
                        `Emit failed for "${msg}" to subadmin : ${subadminId}. No attempts left. Error: ${error.message}`
                    );
                }
            }
        };

        retryEmit(retries);
        return msg;
    } else {
        const emitMessage = () => {
            return new Promise((resolve, reject) => {
                try {
                    if (data !== undefined) {
                        global.io.to(subadminId).emit(msg, data, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    } else {
                        global.io.to(subadminId).emit(msg, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    }
                } catch (error) {
                    reject(error); // Emit failed
                }
            });
        };

        const retryEmit = async (attempts) => {
            try {
                await emitMessage();
                console.log(`Message "${msg}" emitted successfully to subadmin : ${subadminId}`);
            } catch (error) {
                if (attempts > 0) {
                    console.warn(
                        `Emit failed for "${msg}" to subadmin : ${subadminId}. Retrying... Attempts left: ${attempts}`
                    );
                    setTimeout(() => retryEmit(attempts - 1), delay);
                } else {
                    console.error(
                        `Emit failed for "${msg}" to subadmin : ${subadminId}. No attempts left. Error: ${error.message}`
                    );
                }
            }
        };

        retryEmit(retries);
        return msg;
    }
}

// function userSocket(id,msg,data) {
//     let userId = id.toString();
//     if(data != undefined){
//         global.io.to(userId).emit(msg,data);
//     }else{
//         global.io.to(userId).emit(msg);
//     }
//     return msg
// }
function userSocket(id, msg, data, retries = 3, delay = 4000) { // Default 3 retries and 4 seconds delay
    let userId = id.toString();
    if (socketId.includes(userId)) {
        const emitMessage = () => {
            return new Promise((resolve, reject) => {
                try {
                    if (data !== undefined) {
                        global.io.to(userId).emit(msg, data, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    } else {
                        global.io.to(userId).emit(msg, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    }
                } catch (error) {
                    reject(error); // Emit failed
                }
            });
        };

        const retryEmit = async (attempts) => {
            try {
                await emitMessage();
                console.log(`Message "${msg}" emitted successfully to user : ${userId}`);
            } catch (error) {
                if (attempts > 0) {
                    console.warn(
                        `Emit failed for "${msg}" to user : ${userId}. Retrying... Attempts left: ${attempts}`
                    );
                    setTimeout(() => retryEmit(attempts - 1), delay);
                } else {
                    console.error(
                        `Emit failed for "${msg}" to user : ${userId}. No attempts left. Error: ${error.message}`
                    );
                }
            }
        };

        retryEmit(retries);
        return msg;
    } else {
        const emitMessage = () => {
            return new Promise((resolve, reject) => {
                try {
                    if (data !== undefined) {
                        global.io.to(userId).emit(msg, data, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    } else {
                        global.io.to(userId).emit(msg, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    }
                } catch (error) {
                    reject(error); // Emit failed
                }
            });
        };

        const retryEmit = async (attempts) => {
            try {
                await emitMessage();
                console.log(`Message "${msg}" emitted successfully to user : ${userId}`);
            } catch (error) {
                if (attempts > 0) {
                    console.warn(
                        `Emit failed for "${msg}" to user : ${userId}. Retrying... Attempts left: ${attempts}`
                    );
                    setTimeout(() => retryEmit(attempts - 1), delay);
                } else {
                    console.error(
                        `Emit failed for "${msg}" to user : ${userId}. No attempts left. Error: ${error.message}`
                    );
                }
            }
        };

        retryEmit(retries);
        return msg;
    }
}


// function didSocket(id,msg,data) {
//     const startsWith91 = id.substring(0, 2) === "91";
//     if(startsWith91 == true){
//         id = id;
//     }else{
//         id = "91" + id;
//     }
//     let did = id.toString();
//     if(data != undefined){
//         global.io.to(did).emit(msg,data);
//     }else{
//         global.io.to(did).emit(msg);
//     }
//     return msg
// }
function didSocket(id, msg, data, retries = 3, delay = 4000) { // Default 3 retries and 4 seconds delay
    const startsWith91 = id.substring(0, 2) === "91";
    if (!startsWith91) {
        id = "91" + id; // Add country code if not already present
    }

    let did = id.toString();
    if (socketId.includes(did)) {
        const emitMessage = () => {
            return new Promise((resolve, reject) => {
                try {
                    if (data !== undefined) {
                        global.io.to(did).emit(msg, data, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    } else {
                        global.io.to(did).emit(msg, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    }
                } catch (error) {
                    reject(error); // Emit failed
                }
            });
        };

        const retryEmit = async (attempts) => {
            try {
                await emitMessage();
                console.log(`Message "${msg}" emitted successfully to did : ${did}`);
            } catch (error) {
                if (attempts > 0) {
                    console.warn(
                        `Emit failed for "${msg}" to did : ${did}. Retrying... Attempts left: ${attempts}`
                    );
                    setTimeout(() => retryEmit(attempts - 1), delay);
                } else {
                    console.error(
                        `Emit failed for "${msg}" to did : ${did}. No attempts left. Error: ${error.message}`
                    );
                }
            }
        };

        retryEmit(retries);
        return msg;
    } else {
        const emitMessage = () => {
            return new Promise((resolve, reject) => {
                try {
                    if (data !== undefined) {
                        global.io.to(did).emit(msg, data, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    } else {
                        global.io.to(did).emit(msg, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    }
                } catch (error) {
                    reject(error); // Emit failed
                }
            });
        };

        const retryEmit = async (attempts) => {
            try {
                await emitMessage();
                console.log(`Message "${msg}" emitted successfully to did : ${did}`);
            } catch (error) {
                if (attempts > 0) {
                    console.warn(
                        `Emit failed for "${msg}" to did : ${did}. Retrying... Attempts left: ${attempts}`
                    );
                    setTimeout(() => retryEmit(attempts - 1), delay);
                } else {
                    console.error(
                        `Emit failed for "${msg}" to did : ${did}. No attempts left. Error: ${error.message}`
                    );
                }
            }
        };

        retryEmit(retries);
        return msg;
    }
}

function smartgroupSocket(id, msg, data, retries = 3, delay = 4000) { // Default 3 retries and 4 seconds delay
    const smartgroupId = 'smartgroupId_' + `${id}`;
    if (socketId.includes(smartgroupId)) {
        const emitMessage = () => {
            return new Promise((resolve, reject) => {
                try {
                    if (data !== undefined) {
                        global.io.to(smartgroupId).emit(msg, data, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    } else {
                        global.io.to(smartgroupId).emit(msg, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    }
                } catch (error) {
                    reject(error); // Emit failed
                }
            });
        };

        const retryEmit = async (attempts) => {
            try {
                await emitMessage();
                console.log(`Message "${msg}" emitted successfully to user : ${smartgroupId}`);
            } catch (error) {
                if (attempts > 0) {
                    console.warn(
                        `Emit failed for "${msg}" to user : ${smartgroupId}. Retrying... Attempts left: ${attempts}`
                    );
                    setTimeout(() => retryEmit(attempts - 1), delay);
                } else {
                    console.error(
                        `Emit failed for "${msg}" to user : ${smartgroupId}. No attempts left. Error: ${error.message}`
                    );
                }
            }
        };

        retryEmit(retries);
        return msg;
    } else {
        const emitMessage = () => {
            return new Promise((resolve, reject) => {
                try {
                    if (data !== undefined) {
                        global.io.to(smartgroupId).emit(msg, data, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    } else {
                        global.io.to(smartgroupId).emit(msg, (ack) => {
                            if (ack) resolve(); // Success
                            else reject(new Error('Emit acknowledgment failed'));
                        });
                    }
                } catch (error) {
                    reject(error); // Emit failed
                }
            });
        };

        const retryEmit = async (attempts) => {
            try {
                await emitMessage();
                console.log(`Message "${msg}" emitted successfully to user : ${smartgroupId}`);
            } catch (error) {
                if (attempts > 0) {
                    console.warn(
                        `Emit failed for "${msg}" to user : ${smartgroupId}. Retrying... Attempts left: ${attempts}`
                    );
                    setTimeout(() => retryEmit(attempts - 1), delay);
                } else {
                    console.error(
                        `Emit failed for "${msg}" to user : ${smartgroupId}. No attempts left. Error: ${error.message}`
                    );
                }
            }
        };

        retryEmit(retries);
        return msg;
    }
}

module.exports = { adminSocket, departmentSocket, subadminSocket, userSocket,didSocket,smartgroupSocket };
