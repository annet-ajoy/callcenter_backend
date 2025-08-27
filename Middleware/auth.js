const helper = {}
var crypto = require("crypto")

helper.isAuthenticate = async (req, res, next) => {
  try {
    var token = req["headers"].token
    if (token != undefined && token != "") {
      try {
        const tokenStringData = crypto_decode(token)
        const tokenData = JSON.parse(tokenStringData)
        req.token = tokenData
        next()
      } catch (err) {
        console.log(err)
        var status = {
          status: false,
          message: "Unauthorized token",
          result: [],
        }
        res.status(207).json(status)
      }
    } else {
      var status = {
        status: false,
        message: "Unauthorized token",
        result: [],
      }
      res.status(207).json(status)
    }
  } catch (err) {
    console.log(err)
    var status = {
      status: false,
      message: "unauthorised token",
      result: [],
    }
    res.status(207).json(status)
  }
}
function crypto_decode(text) {
  const algorithm = "aes-128-cbc"
  const initVector = process.env.cry_inv
  const Securitykey = process.env.cry_sec
  key = new Buffer.from(Securitykey, "hex")
  iv = new Buffer.from(initVector, "hex")
  const decipher = crypto.createDecipheriv(algorithm, key, iv)

  let decryptedData = decipher.update(text, "hex", "utf-8")

  decryptedData += decipher.final("utf8")

  console.log("Decrypted message: " + decryptedData)
  return decryptedData
}
helper.crypto_encode = async (text) => {
  return new Promise(async function (resolve, reject) {
    const algorithm = "aes-128-cbc"
    const initVector = process.env.cry_inv
    const Securitykey = process.env.cry_sec
    key = new Buffer.from(Securitykey, "hex")
    iv = new Buffer.from(initVector, "hex")
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encryptedData = cipher.update(text, "utf-8", "hex")

    encryptedData += cipher.final("hex")

    console.log("Encrypted message: " + encryptedData)
    resolve(encryptedData)
  })
}
helper.crypto_decode = async (text) => {
  return new Promise(async function (resolve, reject) {
    const algorithm = "aes-128-cbc"
    const initVector = process.env.cry_inv
    const Securitykey = process.env.cry_sec
    key = new Buffer.from(Securitykey, "hex")
    iv = new Buffer.from(initVector, "hex")
    const decipher = crypto.createDecipheriv(algorithm, key, iv)

    let decryptedData = decipher.update(text, "hex", "utf-8")

    decryptedData += decipher.final("utf8")

    console.log("Decrypted message: " + decryptedData)
    resolve(decryptedData)
  })
}
module.exports = helper
