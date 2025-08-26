var crypto = require('crypto');
var CryptoJS = require("crypto-js");
const sequelize = require( '../database' ).db;
const  helpers = {};
const defer = require("promise-defer");
var jwt_sign = require('jsonwebtoken');
const Login_model = require('../model/login_model');
const developerTokenModel = require("../model/developerTokenModel")

helpers.isAuthenticated = async(req,res,next) =>{
    try{
        var token = req["headers"].token
        if(token != undefined && token != ""){
                var tokenStringData = crypto_decode(token);
                var tokenData = JSON.parse(tokenStringData);
                if(tokenData.isAdmin == '1'){
                    req.token = tokenData;
                    next();
                }else if(tokenData.isDid == 1){
                    var tokenStringData = crypto_decode(token);
                    var tokenData = JSON.parse(tokenStringData);
                    req.token = tokenData;
                    next();
                }
                else if(tokenData.isSmart == 1){
                    var tokenStringData = crypto_decode(token);
                    var tokenData = JSON.parse(tokenStringData);
                    req.token = tokenData;
                    next();
                }
                 else{
                    var sql =`select * from login_logs where token = '${token}'`;
                    var [result] =await sequelize.query(sql);
                    if(result.length != 0){
                        req.token = tokenData;
                        next();
                    }
                    else{
                        var status = {
                            'status' : false,
                            'message' :"Unauthorized token",
                            result: []
                            } 
                            res.status(240).json(status);
                    }
                }
        }else{
            var status = {
                'status' : false,
                'message' :"Unauthorized token",
                result: []
                } 
                res.status(240).json(status);
        }
       
    }catch(err){
        console.log(err);
        var status = {
            'status' : false,
            'message' :"Unauthorized token",
            result: []
            }
        res.status(240).json(status);
    }

}
helpers.authenticated = async(req,res,next) =>{
    try{
        var token = req["headers"].token
        if(token != undefined && token != ""){
                var tokenStringData = crypto_decode(token);
                var tokenData = JSON.parse(tokenStringData);
                req.token = tokenData;
                next();
        }else{
            var status = {
                'status' : false,
                'message' :"Unauthorized token",
                result: []
                } 
                res.status(240).json(status);
        }
       
    }catch(err){
        console.log(err);
        var status = {
            'status' : false,
            'message' :"Unauthorized token",
            result: []
            }
        res.status(240).json(status);
    }

}
function crypto_decode(text)
{
    const algorithm = "aes-128-cbc"; 
    const initVector = process.env.cry_inv;
    const Securitykey =process.env.cry_sec;
    key=new Buffer.from(Securitykey,'hex')
    iv=new Buffer.from(initVector,'hex')
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decryptedData = decipher.update(text, "hex", "utf-8");

    decryptedData += decipher.final("utf8");
    return decryptedData;
}
helpers.crypto_decode = crypto_decode;

function crypto_decode_autox(text) {
    try {
        const algorithm = "aes-128-cbc";
        const initVector = process.env.CRY_INV_AUTOX;
        const Securitykey = process.env.CRY_SEC_AUTOX;

        // Input validation
        if (!initVector || !Securitykey || !text) {
            console.log("CRY_INV_AUTOX OR CRY_SEC_AUTOX missing")
            return false;
        }

        const key = Buffer.from(Securitykey, 'hex');
        const iv = Buffer.from(initVector, 'hex');

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decryptedData = decipher.update(text, "hex", "utf-8");
        decryptedData += decipher.final("utf8");

        return decryptedData;
    } catch (error) {
        console.error("Decryption failed:", error);
        return false;
    }
};
helpers.crypto_encode = async(text) =>{
    return new Promise(async function(resolve, reject) {
        const algorithm = "aes-128-cbc"; 
        const initVector = process.env.cry_inv;
        const Securitykey =process.env.cry_sec;
        key=new Buffer.from(Securitykey,'hex')
        iv=new Buffer.from(initVector,'hex')
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encryptedData = cipher.update(text, "utf-8", "hex");
        encryptedData += cipher.final("hex");
        resolve(encryptedData);
    })

}
helpers.crypto_encode_autox = async (text) => {
    try {
        const algorithm = "aes-128-cbc";

        const initVector = process.env.CRY_INV_AUTOX;
        const Securitykey = process.env.CRY_SEC_AUTOX;
        
        if (!initVector || !Securitykey || !text) {
            console.log("Initialization vector, security key, and text must be provided.");
            return false;
        }

        const key = Buffer.from(Securitykey, 'hex');
        const iv = Buffer.from(initVector, 'hex');

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encryptedData = cipher.update(text, "utf-8", "hex");
        encryptedData += cipher.final("hex");

        return encryptedData;
    } catch (error) {
        console.error("Encryption failed:", error);
        return false // Re-throw the error to be handled by the caller
    }
};

helpers.verifyTokenAutox = async(req, res, next) => {
    const token = req.headers.token
    const tokenStringData = crypto_decode_autox(token);

    if(!tokenStringData) {
        const status = {
            status : false,
            message :"Unauthorized token",
            result: []
        } 
        return res.status(401).json(status);
    }

    const tokenData = JSON.parse(tokenStringData)
    
    const tokenFromDb = await developerTokenModel.findOne({ id_user: tokenData.id_user,id_department: tokenData.id_department  }, "token");
    if(token !== tokenFromDb?.token) {
      const status = {
        status : false,
        message :"Expired token",
        result: []
      } 
      return res.status(401).json(status);
    }

    req.token = tokenData;
    next();
}

// helpers.string_decode = async(text) =>{
//     const algorithm = "aes-128-cbc"; 
//     const initVector = process.env.cry_inv;
//     const Securitykey =process.env.cry_sec;
//     key=new Buffer.from(Securitykey,'hex')
//     iv=new Buffer.from(initVector,'hex')
//     const decipher = crypto.createDecipheriv(algorithm, key, iv);
 
//     let decryptedData = decipher.update(text, "hex", "utf-8");

//     decryptedData += decipher.final("utf8");
//     return decryptedData;
// }
helpers.string_decode = async(originalString) =>{
    return new Promise(async function(resolve, reject) {
    try {
        let secretKey = process.env.cry_pass;
        let iv =process.env.cry_iv;
        secretKey = Buffer.from(secretKey).slice(0, 32);
        iv = Buffer.from(iv, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
        let decryptedString = decipher.update(originalString, 'hex', 'utf-8');
        decryptedString += decipher.final('utf-8');
        resolve(decryptedString);
    } catch (error) {
        console.log(error)
        resolve(false); 
    }
})
}
helpers.string_encode = async(originalString) =>{
    return new Promise(async function(resolve, reject) {
        try {
        let secretKey = process.env.cry_pass;
        let iv =process.env.cry_iv;
        secretKey = Buffer.from(secretKey).slice(0, 32);
        iv = Buffer.from(iv, 'hex');

        const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
        let encryptedString = cipher.update(originalString, 'utf-8', 'hex');
        encryptedString += cipher.final('hex');
        resolve(encryptedString);
    } catch (error) {
        console.log(error)
        resolve(false); 
    }
})
}
helpers.encrypteAes128 = async(text,key) =>{
    return new Promise(async function(resolve, reject) {
        try {
            var ciphertext = text;
            var secretKey = key;
            var decrypted = CryptoJS.AES.decrypt(
            {
                ciphertext: CryptoJS.enc.Base64.parse(ciphertext),
            },
            CryptoJS.enc.Utf8.parse(secretKey),
            {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7,
            }
            );
            var decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
            // console.log("Decrypted Text:", decryptedText);
            resolve(decryptedText);
        } catch (error) {
            console.log(error)
            resolve(false); 
        }
    })
}
helpers.decryptAes128 =  async (text,key) =>{
    try {
        const outputEncoding = 'ascii';
        const decipher = crypto.createDecipheriv('aes-128-cbc', key, Buffer.alloc(16, 0));
        let decryptedBuffer = decipher.update(text, 'base64');
        decryptedBuffer = Buffer.concat([decryptedBuffer, decipher.final()]);
        return decryptedBuffer.toString(outputEncoding);
    } catch (error) {
        console.log(error)
        return false
    }
    
}
helpers.token_authenticated = async(req,res,next) =>{
    try {
        var token = req["headers"].token
        if (token != undefined && token != "") {
            var sql = `select * from login_logs where token = '${token}'`;
            var [result] = await sequelize.query(sql);
            if (result.length != 0) {
                res.locals.result = result
                next();
            }
            else {
                res.locals.result = 'Unauthorized'
                next();
            }
        } else {
            res.locals.result = 'Unauthorized'
            next();
        }
    } catch (err) {
        console.log(err);
        res.locals.result = 'Unauthorized'
        next();
    }
}

helpers.authenticate_checking=async(req,res,next)=>{
    var deferred = defer();
        try{
            var token = req["headers"].token;
            if(token != null,token != undefined){
            var otp_code = process.env.otp_code;
            var validate_token =jwt_sign.verify(token,otp_code);
                if(validate_token.length != 0 ){
                            var result={
                                token : token,
                                id:validate_token.id,
                                role:validate_token.role,
                                new_portal:validate_token.new_portal
                            }
                            validate_token.department_id != undefined ? result.department_id = validate_token.department_id : "";
                            validate_token.agent_id != undefined ? result.agent_id = validate_token.agent_id : "";
                            if (result.length != 0) {
                               return result
                            }
                }
                else{
                    return 0
                }
            }
            else{
                return 0
            }
        }catch(err){
            return 0
        } 
}

// helpers.authenticate_checking=async(req,res,next)=>{
//     var deferred = defer();
//         try{
//             var token = req["headers"].token;
//             if(token != null,token != undefined){
//             var otp_code = process.env.otp_code;
//             var validate_token =jwt_sign.verify(token,otp_code);
//             var token_checking = await Login_model.check_token_auth(token);
//             if(validate_token.role == 1)
//                 var logindata = await Login_model.check_token_valid(validate_token.id,validate_token.expiry,'customers','password');
//                 if(validate_token.role == 2 && validate_token.department_id != undefined)
//                 var logindata = await Login_model.check_token_valid(validate_token.id,validate_token.expiry,'callgroup','password');
//                 if(validate_token.role == 3 && validate_token.agent_id != undefined){
//                     console.log("validate_token.new_portal---------->",validate_token.new_portal)
//                     if(validate_token.new_portal == 1){
//                         var logindata = await Login_model.check_token_valid(validate_token.agent_id,validate_token.expiry,'user','password');
//                     }else{
//                         var logindata = await Login_model.check_token_valid(validate_token.agent_id,validate_token.expiry,'ext','secret');
//                     }
//                 }
//                 if(logindata.length != 0 && token_checking.length != 0){
//                     if(logindata[0].id == token_checking[0].user_id){
//                             var result={
//                                 token : token,
//                                 id:validate_token.id,
//                                 role:validate_token.role,
//                                 new_portal:validate_token.new_portal
//                             }
//                             validate_token.department_id != undefined ? result.department_id = validate_token.department_id : "";
//                             validate_token.agent_id != undefined ? result.agent_id = validate_token.agent_id : "";
//                             if (result.length != 0) {
//                                return result
//                             }
//                     }
//                     else{
//                         return 0
//                     }
//                 }
//                 else{
//                     return 0
//                 }
//             }
//             else{
//                 return 0
//             }
//         }catch(err){
//             return 0
//         } 
// }


module.exports = helpers;

