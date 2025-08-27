const fs = require("fs");
const crypto = require("crypto");
const { ApiError } = require("./ApiError.js");

const CallTaskContactsModel = require("../../model/callTaskContactsModel.js");
const User = require("../../model/commonUserModel.js");
const AutoxRoles = require("../../model/autoxUserRoles.js");

const cryptoEncode = (text) => {
  try {
    if (typeof text !== "string" || !text.trim()) {
      throw new ApiError("Invalid input: text must be a non-empty string.");
    }

    // Algorithm and keys
    const algorithm = "aes-256-cbc";
    const initVector = process.env.cry_inv; // Initialization vector
    const securityKey = process.env.cry_inv; // Secret key

    // Validate environment variables
    if (!initVector || !securityKey) {
      throw new ApiError("Missing environment variables: CRY_INV or CRY_SEC.");
    }

    // Create key and IV
    const key = Buffer.from(securityKey, "hex");
    const iv = Buffer.from(initVector, "hex");

    // Create cipher
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    // Encrypt the text
    let encryptedData = cipher.update(text, "utf-8", "hex");
    encryptedData += cipher.final("hex");

    return encryptedData;
  } catch (error) {
    console.error("Encryption failed:", error.message);
    return null;
  }
};

const cryptoDecode = (text) => {
  try {
    const algorithm = "aes-128-cbc";
    const initVector = process.env.cry_inv;
    const Securitykey = process.env.cry_sec;

    let key = new Buffer.from(Securitykey, "hex");
    let iv = new Buffer.from(initVector, "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decryptedData = decipher.update(text, "hex", "utf-8");

    decryptedData += decipher.final("utf8");
    return decryptedData;
  } catch (error) {
    console.error("Decryption failed:", error.message);
    return null;
  }
};

const cryptoDecodeAutoxToken = (text) => {
  try {
    const algorithm = "aes-128-cbc";
    const initVector = process.env.CRY_INV_AUTOX;
    const Securitykey = process.env.CRY_SEC_AUTOX;

    // Input validation
    if (!initVector || !Securitykey || !text) {
        console.log("CRY_INV_AUTOX OR CRY_SEC_AUTOX missing")
        return false;
    }
    
    let key = new Buffer.from(Securitykey, "hex");
    let iv = new Buffer.from(initVector, "hex");
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decryptedData = decipher.update(text, "hex", "utf-8");

    decryptedData += decipher.final("utf8");
    return decryptedData;
  } catch (error) {
    console.error("Decryption failed:", error.message);
    return null;
  }
};

const removeUnusedMulterImageFilesOnError = (req) => {
  try {
    const multerFile = req.file;
    const multerFiles = req.files;

    if (multerFile) {
      removeLocalFile(multerFile.path);
    }

    if (Array.isArray(multerFiles)) {
      // Case: multiple files with same field name
      multerFiles.forEach(file => removeLocalFile(file.path));
    } else if (typeof multerFiles === "object" && multerFiles !== null) {
      // Case: files uploaded with different field names
      Object.values(multerFiles).forEach(fileArray => {
        fileArray.forEach(file => removeLocalFile(file.path));
      });
    }
  } catch (error) {
    console.error("Error removing uploaded files:", error);
  }
};

const removeLocalFile = (localPath) => {
  if(!localPath) return;
  
  fs.unlink(localPath, (err) => {
    if (err) console.log("Error while removing local files: ", err);
    else {
      console.log("Removed local: ", localPath);
    }
  });
};

const removeLocalFolder = (localPath) => {
  try {
    fs.rmSync(localPath, { recursive: true, force: true });
    console.log("Removed local folder:", localPath);
  } catch (err) {
    console.error("Error while removing local files:", err);
  }
};

const toSnakeCase = (str) => {
  return str
    .replace(/\s+/g, '_')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase(); 
};

const validateFormData = (schema, data) => {
  let errors = [];

  schema.forEach((field) => {
    const fieldName = field.feildname;

    if (field.mandatory && field.active && !(fieldName in data)) {
      errors.push(`${fieldName} is a mandatory field`);
    }
  });

  return errors;
}

const getCustomerIdFromPhoneNumber = async (idUser, phoneNumber) => {
  try {
    const contact = await CallTaskContactsModel.findOne(
      { id_user: idUser, phone_number: phoneNumber },
      { _id: 1 }
    ).sort({ createdAt: -1 });

    return contact?._id
  } catch (error) {
    return false
  }
}

const getAssignedAgentInfo = async (id_user, calltaskContactIds) => {
  try {
    if (!Array.isArray(calltaskContactIds)) {
      return [];
    }

    const uniqueContactIds = [...new Set(calltaskContactIds)];

    const calltaskContact = await CallTaskContactsModel.find({ _id: { $in: uniqueContactIds } }, "user_id");
    const uniqueUsersId = [...new Set(calltaskContact.filter(c => c.user_id).map(c => c.user_id))];

    const usersinfo = await User.findAll({ 
      where: { id: uniqueUsersId }, 
      attributes: ["id", "first_name", "last_name", "designation", "upload_image"]
    });

    const uniqueAutoXRoleIds = [...new Set(usersinfo.map(u => u.designation).filter(Boolean))];
    const autoxRoles = await AutoxRoles.find({ _id: { $in: uniqueAutoXRoleIds } }, "name");

    return calltaskContact.map(contact => {
      const agent = usersinfo.find(u => u.id === contact.user_id);
      const role = autoxRoles.find(r => r._id.toString() === agent?.designation?.toString());
      
      return {
        id: agent?.id,
        name: `${agent?.first_name || ""} ${agent?.last_name || ""}`,
        role: role?.name ?? "",
        image: agent?.upload_image ?? "",
        customeId: contact?._id.toHexString()
      };
    });
    
  } catch (error) {
    console.error("Error in getAssignedAgentInfo:", error.message);
    return [];
  }
};


module.exports = {
  cryptoEncode,
  cryptoDecode,
  cryptoDecodeAutoxToken,
  removeUnusedMulterImageFilesOnError,
  removeLocalFile,
  removeLocalFolder,
  toSnakeCase,
  validateFormData,
  getCustomerIdFromPhoneNumber,
  getAssignedAgentInfo
};
