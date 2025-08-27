const nodemailer = require("nodemailer");
const axios = require("axios");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: options.fromEmail,
        pass: options.appPassword,
      },
    });

    const mail = {
      from: options.fromEmail,
      to: options.email,
      subject: options.subject,
      text: options.text || "",
      html: options.html || "",
      attachments: options?.attachments
    };

    const info = await transporter.sendMail(mail);
    console.log("Email sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email: ", error.message);
    return false;
  }
};

const sendSms = async (options) => {
  try {
    const message =
      "You have received a call from +917093789151 to DID Number 914847136814. The Call Time is 2025:02:03 16:02:39 and Status is Connected. Thank You - VOXBAY PBX";
    // const encodedMessage = encodeURIComponent(message);

    options.mobile_number = options.mobile_number?.startsWith("91")
    ? options.mobile_number
    : `91${options.mobile_number}`;
    
    const url = `http://text.voxbaysolutions.com/sendsms.jsp?user=${process.env.SMS_USER}&password=${process.env.SMS_PASSWORD}&senderid=VOXBAY&mobiles=${options.mobile_number}&sms=${message}&accusage=1&tempid=1207164196970483613`;

    const response = await axios.get(url);

    console.log("SMS sent successfully");

    return true;
  } catch (error) {
    console.error("Error sending sms: ", error.message);
    return false;
  }
};

module.exports = { sendEmail, sendSms };
