const axios = require("axios");
const Customer = require("../model/customers");
const { callCenterPopupLog } = require('../logger');

const callByotApi = async (method, endpoint, data = undefined, params = {}, headers = {}, CustomerId) => {
    const startTime = new Date();
    console.log(`*************Calling BYOT API: ${method} ${endpoint} at ${startTime.toISOString()}******************`);
    if (endpoint.endsWith("update-livedata")) {
        console.log();
        console.log("------UPDATE LIVEDATA ENDPOINT DETECTED------");
        console.log();
    }
    
    try {
        const { byot, hybrid_api_ip } = (await Customer.findByPk(CustomerId, { attributes: ["id", "hybrid_api_ip", "byot"] })) || {};

        if(!byot || !hybrid_api_ip) {
            console.log("BYOT not enabled or missing IP");
            return;
        }
        
        const response = await axios({
            method,
            url: hybrid_api_ip + endpoint,
            data,
            params,
            responseType: headers.responseType || 'json', 
            headers: {
                "Content-Type": headers["Content-Type"] || "application/json",
                ...headers, 
            },
        });

        if (endpoint.endsWith("update-livedata")) {
            console.log();
            console.log(response.data);
            console.log();
            callCenterPopupLog("update popup status res")
            callCenterPopupLog(response.data)
        }

        return response.data;
       
    } catch (error) {
        console.error("API Error:", error.message);
        return { 
            error: error.response?.data || error.message 
        };
    }
};

module.exports = callByotApi;
