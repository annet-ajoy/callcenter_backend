
const axios = require('axios');
async function adminSocket(id, msg, data) {
    const adminId = 'admin_' + `${id}`;
    try {
        if (data !== undefined) {
            global.io.to(adminId).emit(msg, data, async (ack) => {
                if (ack) {
                    console.log(`Message "${msg}" emitted successfully to admin : ${adminId}`);
                } else {
                    console.error(`Emit acknowledgment failed for "${msg}" to admin : ${adminId}`);
                    await reportEmitFailure({ role: "admin", msg, data, id: adminId });
                }
            });
        } else {
            global.io.to(adminId).emit(msg, async (ack) => {
                if (ack) {
                    console.log(`Message "${msg}" emitted successfully to admin : ${adminId}`);
                } else {
                    console.error(`Emit acknowledgment failed for "${msg}" to admin : ${adminId}`);
                    await reportEmitFailure({ role: "admin", event: msg, data, id: adminId });
                }
            });
        }
    } catch (error) {
        console.error(`Emit failed for "${msg}" to admin : ${adminId}. Error: ${error.message}`);
        await reportEmitFailure({ role: "admin", event: msg, data, error: error.message, id: adminId });
    }
    return msg;
}
async function departmentSocket(id, msg, data) { 
    const deptId = 'deptId_' + `${id}`;
    try {
        if (data !== undefined) {
            global.io.to(deptId).emit(msg, data, async (ack) => {
                if (ack) {
                    console.log(`Message "${msg}" emitted successfully to department : ${deptId}`);
                } else {
                    console.error(`Emit acknowledgment failed for "${msg}" to department : ${deptId}`);
                    await reportEmitFailure({ role: "subAdmin", event: msg, data, id: deptId });
                }
            });
        } else {
            global.io.to(deptId).emit(msg, async (ack) => {
                if (ack) {
                    console.log(`Message "${msg}" emitted successfully to department : ${deptId}`);
                } else {
                    console.error(`Emit acknowledgment failed for "${msg}" to department : ${deptId}`);
                    await reportEmitFailure({ role: "subAdmin", event: msg, data, id: deptId });
                }
            });
        }
    } catch (error) {
        console.error(`Emit failed for "${msg}" to department : ${deptId}. Error: ${error.message}`);
        await reportEmitFailure({ role: "department", event: msg, data, error: error.message, id: deptId });
    }
    return msg;
}
async function subadminSocket(id, msg, data) { 
    const subadminId = 'subAdminId_' + `${id}`;
    try {
        if (data !== undefined) {
            global.io.to(subadminId).emit(msg, data, async (ack) => {
                if (ack) {
                    console.log(`Message "${msg}" emitted successfully to subadmin : ${subadminId}`);
                } else {
                    console.error(`Emit acknowledgment failed for "${msg}" to subadmin : ${subadminId}`);
                    await reportEmitFailure({ role: "subAdmin", event: msg, data, id: subadminId });
                }
            });
        } else {
            global.io.to(subadminId).emit(msg, async (ack) => {
                if (ack) {
                    console.log(`Message "${msg}" emitted successfully to subadmin : ${subadminId}`);
                } else {
                    console.error(`Emit acknowledgment failed for "${msg}" to subadmin : ${subadminId}`);
                    await reportEmitFailure({ role: "subAdmin", event: msg, data, id: subadminId });
                }
            });
        }
    } catch (error) {
        console.error(`Emit failed for "${msg}" to subadmin : ${subadminId}. Error: ${error.message}`);
        await reportEmitFailure({ role: "subAdmin", event: msg, data, error: error.message, id: subadminId });
    }
    return msg;
}
async function userSocket(id, msg, data) { 
    let userId = id.toString();
    try {
        if (data !== undefined) {
            global.io.to(userId).emit(msg, data, async (ack) => {
                if (ack) {
                    console.log(`Message "${msg}" emitted successfully to user : ${userId}`);
                } else {
                    console.error(`Emit acknowledgment failed for "${msg}" to user : ${userId}`);
                    await reportEmitFailure({ role: "user", event: msg, data, id: userId });
                }
            });
        } else {
            global.io.to(userId).emit(msg, async (ack) => {
                if (ack) {
                    console.log(`Message "${msg}" emitted successfully to user : ${userId}`);
                } else {
                    console.error(`Emit acknowledgment failed for "${msg}" to user : ${userId}`);
                    await reportEmitFailure({ role: "user", event: msg, data, id: userId });
                }
            });
        }
    } catch (error) {
        console.error(`Emit failed for "${msg}" to user : ${userId}. Error: ${error.message}`);
        await reportEmitFailure({ role: "user", event: msg, data, error: error.message, id: userId });
    }
    return msg;
}
async function didSocket(id, msg, data) { 
    const startsWith91 = id.substring(0, 2) === "91";
    if (!startsWith91) {
        id = "91" + id; // Add country code if not already present
    }

    let did = id.toString();
    try {
        if (data !== undefined) {
            global.io.to(did).emit(msg, data, async (ack) => {
                if (ack) {
                    console.log(`Message "${msg}" emitted successfully to did : ${did}`);
                } else {
                    console.error(`Emit acknowledgment failed for "${msg}" to did : ${did}`);
                    await reportEmitFailure({ role: "did", event: msg, data, id: did });
                }
            });
        } else {
            global.io.to(did).emit(msg, async (ack) => {
                if (ack) {
                    console.log(`Message "${msg}" emitted successfully to did : ${did}`);
                } else {
                    console.error(`Emit acknowledgment failed for "${msg}" to did : ${did}`);
                    await reportEmitFailure({ role: "did", event: msg, data, id: did });
                }
            });
        }
    } catch (error) {
        console.error(`Emit failed for "${msg}" to did : ${did}. Error: ${error.message}`);
        await reportEmitFailure({ role: "did", event: msg, data, error: error.message, id: did });
    }
    return msg;
}
async function smartgroupSocket(id, msg, data) { 
    const smartgroupId = 'smartgroupId_' + `${id}`;
    try {
        if (data !== undefined) {
            global.io.to(smartgroupId).emit(msg, data, async (ack) => {
                if (ack) {
                    console.log(`Message "${msg}" emitted successfully to smartgroup : ${smartgroupId}`);
                } else {
                    console.error(`Emit acknowledgment failed for "${msg}" to smartgroup : ${smartgroupId}`);
                    await reportEmitFailure({ role: "smartgroup", event: msg, data, id: smartgroupId });
                }
            });
        } else {
            global.io.to(smartgroupId).emit(msg, async (ack) => {
                if (ack) {
                    console.log(`Message "${msg}" emitted successfully to smartgroup : ${smartgroupId}`);
                } else {
                    console.error(`Emit acknowledgment failed for "${msg}" to smartgroup : ${smartgroupId}`);
                    await reportEmitFailure({ role: "smartgroup", event: msg, data, id: smartgroupId });
                }
            });
        }
    } catch (error) {
        console.error(`Emit failed for "${msg}" to smartgroup : ${smartgroupId}. Error: ${error.message}`);
        await reportEmitFailure({ role: "smartgroup", event: msg, data, error: error.message, id: smartgroupId });
    }
    return msg;
}

async function reportEmitFailure(payload) {
    const url = process.env.FRONT_END_URL || "http://localhost:8011";

    try {
        const response = await axios.post(`${url}/api/call_pop_up_init`, payload);
        console.log(`✅ reportEmitFailure: Reported failure successfully for msg "${payload.event}"`);
        console.log(`Response:`, response.data);
    } catch (error) {
        console.error(`❌ reportEmitFailure: Failed to report failure for msg "${payload.event}"`);
        console.error(`Error: ${error.message}`);
        if (error.response) {
            console.error(`Response Status: ${error.response.status}`);
            console.error(`Response Data:`, error.response.data);
        }
    }
}

module.exports = { adminSocket, departmentSocket, subadminSocket, userSocket,didSocket,smartgroupSocket };
