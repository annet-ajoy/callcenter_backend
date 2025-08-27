var templateSms = require("../model/templateSmsModel");
var templateWhatsapp = require("../model/templateWhatsappModel");
var templateApi = require("../model/templateApiModel");
var smsProviderModel = require("../model/smsIntegrationModel");
var smsProviderHead = require("../model/smsIntegrationHead");
var smsProviderBody = require("../model/smsIntegrationBody");
var whatsappProviderModel = require("../model/whatsappIntegrationModel");
var whatsappProviderHead = require("../model/whatsappIntegrationHead");
var whatsappProviderBody = require("../model/whatsappIntegrationBody");
var apiProviderModel = require("../model/ApiIntegrationModel");
var apiProviderHead = require("../model/apiIntegrationHead");
var apiProviderBody = require("../model/ApiIntegrationBody");
var agentModel = require("../model/customModel");
var leadModel = require("../model/leadModel");
var ticketsModel = require("../model/ticketsModel");
var callflowSubSms = require("../model/callFlowSmsSub");
var callflowSubWhatsapp = require("../model/callFlowWhatsappSub");
var callTemplateApiModelSub = require("../model/callFlowTemplateApiSub");
var emailProviderModel = require('../model/emailProviderModel')

const templateFeildsModel = require("../model/templatefieldModel");

const fs = require("fs");
var FormData = require("form-data");
const querystring = require("querystring");
var qs = require("qs");
let ObjectId = require("mongodb").ObjectId;
var axios = require("axios");
const integration = {};

integration.smsAxiosCall = async (
  data,
  phnNo,
  template_id,
  isHandover,
  statusId,
  userNo
) => {
  try {
    if (isHandover == 0) {
      const smsData = await templateSms.find({
        templateId: template_id,
        isHandover: false,
      });
      var smsTemplateId;
      let templateObject;
      if (smsData && smsData.length > 0 && smsData[0].smsTemplateData) {
        if (Array.isArray(smsData[0].smsTemplateData)) {
          templateObject = smsData[0]._doc.smsTemplateData.find(
            (item) => item.statusId == statusId
          );
          if (templateObject) {
            smsTemplateId = templateObject.smsTemplateId;
            var smsTemplateData = templateObject.variables;
            smsTemplateData = smsTemplateData.map((key) =>
              key === "ticketNo" ? "uniqNo" : key
            );
            smsTemplateData = smsTemplateData.map((key) =>
              key === "leadNo" ? "uniqNo" : key
            );
            var smsTemplateJsonData = templateObject.jsonVariables;
            if (templateObject.paramsVariables.length != 0) {
              var smsTemplateParamsData =
                templateObject.paramsVariables[0].variable;
              smsTemplateParamsData = [smsTemplateParamsData];
            } else {
              var smsTemplateParamsData = [];
            }

            if (
              smsData[0]._doc.smsToUser == 1 &&
              smsData[0]._doc.smsToCustomer == 1
            ) {
              smsTemplateData = smsTemplateData.map((item) => {
                if (item == "phnNo") {
                  return `${data[item]},${userNo}`;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
              smsTemplateJsonData = smsTemplateJsonData.map((item) => {
                if (item == "phnNo") {
                  return `${data[item]},${userNo}`;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
              smsTemplateParamsData = smsTemplateParamsData.map((item) => {
                if (item == "phnNo") {
                  return `${data[item]},${userNo}`;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
            } else if (smsData[0]._doc.smsToCustomer == 1) {
              smsTemplateData = smsTemplateData.map((item) =>
                data[item] ? data[item] : item
              );
              smsTemplateJsonData = smsTemplateJsonData.map((item) =>
                data[item] ? data[item] : item
              );
              smsTemplateParamsData = smsTemplateParamsData.map((item) =>
                data[item] ? data[item] : item
              );
            } else if (smsData[0]._doc.smsToUser == 1) {
              smsTemplateData = smsTemplateData.map((item) => {
                if (item === "phnNo") {
                  return userNo;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
              smsTemplateJsonData = smsTemplateJsonData.map((item) => {
                if (item === "phnNo") {
                  return userNo;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
              smsTemplateParamsData = smsTemplateParamsData.map((item) => {
                if (item === "phnNo") {
                  return userNo;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
            }
          } else {
            var err = "This statusId does not have an sms template.";
            console.error("This statusId does not have an sms template.");
            return err;
          }
        }
      } else {
        var err = "error :  no sms template found";
        console.log("error :  no sms template found");
        return err;
      }
    } else {
      const smsData = await templateSms.find({
        templateId: template_id,
        isHandover: true,
      });
      var smsTemplateId;
      let templateObject;
      if (smsData && smsData.length > 0) {
        templateObject = smsData[0]._doc;
        if (templateObject) {
          smsTemplateId = templateObject.smsTemplateId;
          var smsTemplateData = templateObject.variables;
          smsTemplateData = smsTemplateData.map((key) =>
            key === "ticketNo" ? "uniqNo" : key
          );
          smsTemplateData = smsTemplateData.map((key) =>
            key === "leadNo" ? "uniqNo" : key
          );
          var smsTemplateJsonData = templateObject.jsonVariables;
          var smsTemplateParamsData =
            templateObject.paramsVariables[0].variable;
          smsTemplateParamsData = [smsTemplateParamsData];
          // smsTemplateData = smsTemplateData.map(item => data[item] ? data[item] : item);
          // smsTemplateJsonData = smsTemplateJsonData.map(item => data[item] ? data[item] : item);
          // smsTemplateParamsData = smsTemplateParamsData.map(item => data[item] ? data[item] : item);
          if (
            smsData[0]._doc.smsToUser == 1 &&
            smsData[0]._doc.smsToCustomer == 1
          ) {
            smsTemplateData = smsTemplateData.map((item) => {
              if (item == "phnNo") {
                return `${data[item]},${userNo}`;
              } else {
                return data[item] ? data[item] : item;
              }
            });
            smsTemplateJsonData = smsTemplateJsonData.map((item) => {
              if (item == "phnNo") {
                return `${data[item]},${userNo}`;
              } else {
                return data[item] ? data[item] : item;
              }
            });
            smsTemplateParamsData = smsTemplateParamsData.map((item) => {
              if (item == "phnNo") {
                return `${data[item]},${userNo}`;
              } else {
                return data[item] ? data[item] : item;
              }
            });
          } else if (smsData[0]._doc.smsToCustomer == 1) {
            smsTemplateData = smsTemplateData.map((item) =>
              data[item] ? data[item] : item
            );
            smsTemplateJsonData = smsTemplateJsonData.map((item) =>
              data[item] ? data[item] : item
            );
            smsTemplateParamsData = smsTemplateParamsData.map((item) =>
              data[item] ? data[item] : item
            );
          } else if (smsData[0]._doc.smsToUser == 1) {
            smsTemplateData = smsTemplateData.map((item) => {
              if (item === "phnNo") {
                return userNo;
              } else {
                return data[item] ? data[item] : item;
              }
            });
            smsTemplateJsonData = smsTemplateJsonData.map((item) => {
              if (item === "phnNo") {
                return userNo;
              } else {
                return data[item] ? data[item] : item;
              }
            });
            smsTemplateParamsData = smsTemplateParamsData.map((item) => {
              if (item === "phnNo") {
                return userNo;
              } else {
                return data[item] ? data[item] : item;
              }
            });
          }
        } else {
          var err = "This statusId does not have an sms template.";
          console.error("This statusId does not have an sms template.");
          return err;
        }
      } else {
        var err = "error :  no sms template found";
        console.log("error :  no sms template found");
        return err;
      }
    }

    // const smsTemplateId = "687dfd090c62d4c96ef843e4"
    // const smsTemplateData = []
    // const smsTemplateParamsData = []
    let smsMessage;
    var providerValuesHeadSms = [];
    var providerValuesBodySms = [];
    if (smsTemplateId) {
      var providersms = await smsProviderModel.findById(smsTemplateId);
      if (providersms) {
        providerValuesHeadSms = await smsProviderHead.find({
          sms_table_id: new ObjectId(smsTemplateId),
        });
        providerValuesBodySms = await smsProviderBody.find({
          sms_table_id: new ObjectId(smsTemplateId),
        });
        if (providersms._doc && providersms._doc.message) {
          smsMessage = providersms._doc.message.message;
        } else {
          var err = "Message field is undefined in providersms._doc";
          console.error("Message field is undefined in providersms._doc");
          return err;
        }
      } else {
        var err = "No providersms found with the given ID";
        console.error("No providersms found with the given ID");
        return err;
      }
    } else {
      var err = "smsTemplateId is undefined or falsy";
      console.error("smsTemplateId is undefined or falsy");
      return err;
    }
    var stringSms = "";
    if (smsMessage != undefined) {
      // smsMessage = smsMessage.replace(/\$phno/g, phnNo);
      smsMessage = smsMessage.replace(/\n/g, "\\n");
      function replaceVariables(template, replacements) {
        // const regex = /\$[a-zA-Z_][a-zA-Z0-9_]*/g;
        // const variables = Array.from(new Set(template.match(regex)));
        // let resultsms = template;
        // replacements.forEach((variable, index) => {
        //   // if (index < replacements.length) {
        //   //   const replacement = replacements[index];
        //     resultsms = resultsms.replace('$', variable);
        //   // }
        // });
        let resultsms = template;
        replacements.map((variable, index) => {
          resultsms = resultsms.replace("$variable$", variable);
        });

        return resultsms;
      }

      var stringSms = replaceVariables(smsMessage, smsTemplateData);
    }
    // providerValuesBodySms.push({ message: stringSms })
    if (providersms._doc.type != "JSON") {
      var providerValuesBodySms = providerValuesBodySms.reduce((acc, item) => {
        if (item.name && item.value) {
          acc[item.name] = item.value;
        }
        // else if (item.message) {
        //   acc['sms'] = item.message;
        // }
        return acc;
      }, {});
    }
    var providerValuesHeadSms = providerValuesHeadSms.reduce((acc, item) => {
      if (item.name && item.value) {
        acc[item.name] = item.value;
      }
      // else if (item.message) {
      //   acc['sms'] = item.message;
      // }
      return acc;
    }, {});
    if (
      providerValuesBodySms != undefined &&
      Object.keys(providerValuesBodySms).length != 0
    ) {
      var url = providersms._doc.url;
      const axiosConfigSms = {
        method: providersms._doc.method.toLowerCase(),
        url: providersms._doc.url,
      };
      if (providerValuesHeadSms) {
        axiosConfigSms.headers = providerValuesHeadSms;
      }
      if (providersms._doc.type == "JSON") {
        var data = {};
        if (providerValuesBodySms != undefined) {
          // providerValuesBodySms.mobiles = phnNo
          // axiosConfigSms.data = providerValuesBodySms;
          var str = providerValuesBodySms[0].smsJsonBodyData;
          str = str.replace("$message", stringSms);
          function replaceVariables(template, replacements) {
            let resultSms = template;
            replacements.map((variable, index) => {
              resultSms = resultSms.replace("$variable$", variable);
            });
            return resultSms;
          }
          str = replaceVariables(str, smsTemplateJsonData);
          const value = JSON.parse(str);
          axiosConfigSms.data = value;
        } else {
          axiosConfigSms.data = {};
        }
      } else if (providersms._doc.type == "www-form-urlencode") {
        if (providerValuesBodySms != undefined) {
          var data = {};
          var bodyParams_key = Object.keys(providerValuesBodySms);
          bodyParams_key.map((input_value) => {
            var value = providerValuesBodySms[input_value];
            if (value == "$message") {
              data[input_value] = stringSms;
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultSms = template;
                  replacements.map((variable, index) => {
                    resultSms = resultSms.replace("$variable$", variable);
                  });
                  return resultSms;
                }
                str = replaceVariables(value, smsTemplateParamsData);
                data[input_value] = str;
              } else {
                data[input_value] = value;
              }
            }
          });
          data = qs.stringify(data);
          var header = { "Content-Type": "application/x-www-form-urlencoded" };
          axiosConfigSms.data = data;
          axiosConfigSms.headers = header;
        } else {
          axiosConfigSms.data = {};
        }
      } else if (providersms._doc.type == "form-data") {
        var input = new FormData();
        if (providerValuesBodySms != undefined) {
          // providerValuesBodySms.mobiles = phnNo
          // for (const key in providerValuesBodySms) {
          //   input.append(key, providerValuesBodySms[key]);
          // }
          var bodyParams_key = Object.keys(providerValuesBodySms);
          bodyParams_key.map((input_value) => {
            var value = providerValuesBodySms[input_value];
            if (value == "$message") {
              input.append(input_value, stringSms);
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultSms = template;
                  replacements.map((variable, index) => {
                    resultSms = resultSms.replace("$variable$", variable);
                  });
                  return resultSms;
                }
                str = replaceVariables(value, smsTemplateParamsData);
                input.append(input_value, str);
              } else if (Array.isArray(value)) {
                value.forEach((filePath) => {
                  input.append(input_value, fs.createReadStream(filePath));
                });
              } else {
                input.append(input_value, value);
              }
            }
          });
          axiosConfigSms.data = input;
        } else {
          axiosConfigSms.data = {};
        }
      } else {
        if (providerValuesBodySms != undefined) {
          url += "?";
          var api_data_keys = Object.keys(providerValuesBodySms);
          api_data_keys.map(async (input_value) => {
            var value = providerValuesBodySms[input_value];
            if (value == "$message") {
              url += input_value + "=" + stringSms + "&";
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultSms = template;
                  replacements.map((variable, index) => {
                    resultSms = resultSms.replace("$variable$", variable);
                  });
                  return resultSms;
                }
                str = replaceVariables(value, smsTemplateParamsData);
                url += input_value + "=" + str + "&";
              } else {
                url +=
                  input_value + "=" + providerValuesBodySms[input_value] + "&";
              }
            }
          });
          axiosConfigSms.url = url;
        }
      }
      console.log(axiosConfigSms);
      const axiosResponseSms = await axios(axiosConfigSms);
      console.log(axiosResponseSms.data);
      return axiosResponseSms.data;
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};
integration.whatsappAxiosCall = async (
  data,
  phnNo,
  template_id,
  isHandover,
  statusId,
  userNo
) => {
  try {
    if (isHandover == 0) {
      const whatsappData = await templateWhatsapp.find({
        templateId: template_id,
        isHandover: false,
      });
      if (
        whatsappData &&
        whatsappData.length > 0 &&
        whatsappData[0].whatsappTemplateData
      ) {
        if (Array.isArray(whatsappData[0].whatsappTemplateData)) {
          const templateObject = whatsappData[0]._doc.whatsappTemplateData.find(
            (template) => template.statusId == statusId
          );
          if (templateObject) {
            var whatsappTemplateId = templateObject.whatsappTemplateId;
            var whatsappTemplateData = templateObject.variables;
            whatsappTemplateData = whatsappTemplateData.map((key) =>
              key === "ticketNo" ? "uniqNo" : key
            );
            whatsappTemplateData = whatsappTemplateData.map((key) =>
              key === "leadNo" ? "uniqNo" : key
            );
            var whatsappTemplateJsonData = templateObject.jsonVariables;
            if (templateObject.paramsVariables.length != 0) {
              var whatsappTemplateParamsData =
                templateObject.paramsVariables[0].variable;
              whatsappTemplateParamsData = [whatsappTemplateParamsData];
            } else {
              var whatsappTemplateParamsData = [];
            }
            // whatsappTemplateData = whatsappTemplateData.map(item => data[item] ? data[item] : item);
            // whatsappTemplateJsonData = whatsappTemplateJsonData.map(item => data[item] ? data[item] : item);
            // whatsappTemplateParamsData = whatsappTemplateParamsData.map(item => data[item] ? data[item] : item);
            if (
              whatsappData[0]._doc.smsToUser == 1 &&
              whatsappData[0]._doc.smsToCustomer == 1
            ) {
              whatsappTemplateData = whatsappTemplateData.map((item) => {
                if (item == "phnNo") {
                  return `${data[item]},${userNo}`;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
              whatsappTemplateJsonData = whatsappTemplateJsonData.map(
                (item) => {
                  if (item == "phnNo") {
                    return `${data[item]},${userNo}`;
                  } else {
                    return data[item] ? data[item] : item;
                  }
                }
              );
              whatsappTemplateParamsData = whatsappTemplateParamsData.map(
                (item) => {
                  if (item == "phnNo") {
                    return `${data[item]},${userNo}`;
                  } else {
                    return data[item] ? data[item] : item;
                  }
                }
              );
            } else if (whatsappData[0]._doc.smsToCustomer == 1) {
              whatsappTemplateData = whatsappTemplateData.map((item) =>
                data[item] ? data[item] : item
              );
              whatsappTemplateJsonData = whatsappTemplateJsonData.map((item) =>
                data[item] ? data[item] : item
              );
              whatsappTemplateParamsData = whatsappTemplateParamsData.map(
                (item) => (data[item] ? data[item] : item)
              );
            } else if (whatsappData[0]._doc.smsToUser == 1) {
              whatsappTemplateData = whatsappTemplateData.map((item) => {
                if (item === "phnNo") {
                  return userNo;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
              whatsappTemplateJsonData = whatsappTemplateJsonData.map(
                (item) => {
                  if (item === "phnNo") {
                    return userNo;
                  } else {
                    return data[item] ? data[item] : item;
                  }
                }
              );
              whatsappTemplateParamsData = whatsappTemplateParamsData.map(
                (item) => {
                  if (item === "phnNo") {
                    return userNo;
                  } else {
                    return data[item] ? data[item] : item;
                  }
                }
              );
            }
          } else {
            var err = "This statusId does not have an whatsapp template.";
            console.error("This statusId does not have an whatsapp template.");
            return err;
          }
        }
      } else {
        var err = "error :  no whatsapp template found";
        console.log("error :  no whatsapp template found");
        return err;
      }
    } else {
      const whatsappData = await templateWhatsapp.find({
        templateId: template_id,
        isHandover: true,
      });
      let templateObject;
      if (whatsappData && whatsappData.length > 0) {
        templateObject = whatsappData[0]._doc;
        if (templateObject) {
          var whatsappTemplateId = templateObject.whatsappTemplateId;
          var whatsappTemplateData = templateObject.variables;
          var whatsappTemplateJsonData = templateObject.jsonVariables;
          if (templateObject.paramsVariables.length != 0) {
            var whatsappTemplateParamsData =
              templateObject.paramsVariables[0].variable;
            whatsappTemplateParamsData = [whatsappTemplateParamsData];
          } else {
            var whatsappTemplateParamsData = [];
          }
          // whatsappTemplateData = whatsappTemplateData.map(item => data[item] ? data[item] : item);
          // whatsappTemplateJsonData = whatsappTemplateJsonData.map(item => data[item] ? data[item] : item);
          // whatsappTemplateParamsData = whatsappTemplateParamsData.map(item => data[item] ? data[item] : item);
          if (
            whatsappData[0]._doc.smsToUser == 1 &&
            whatsappData[0]._doc.smsToCustomer == 1
          ) {
            whatsappTemplateData = whatsappTemplateData.map((item) => {
              if (item == "phnNo") {
                return `${data[item]},${userNo}`;
              } else {
                return data[item] ? data[item] : item;
              }
            });
            whatsappTemplateJsonData = whatsappTemplateJsonData.map((item) => {
              if (item == "phnNo") {
                return `${data[item]},${userNo}`;
              } else {
                return data[item] ? data[item] : item;
              }
            });
            whatsappTemplateParamsData = whatsappTemplateParamsData.map(
              (item) => {
                if (item == "phnNo") {
                  return `${data[item]},${userNo}`;
                } else {
                  return data[item] ? data[item] : item;
                }
              }
            );
          } else if (whatsappData[0]._doc.smsToCustomer == 1) {
            whatsappTemplateData = whatsappTemplateData.map((item) =>
              data[item] ? data[item] : item
            );
            whatsappTemplateJsonData = whatsappTemplateJsonData.map((item) =>
              data[item] ? data[item] : item
            );
            whatsappTemplateParamsData = whatsappTemplateParamsData.map(
              (item) => (data[item] ? data[item] : item)
            );
          } else if (whatsappData[0]._doc.smsToUser == 1) {
            whatsappTemplateData = whatsappTemplateData.map((item) => {
              if (item === "phnNo") {
                return userNo;
              } else {
                return data[item] ? data[item] : item;
              }
            });
            whatsappTemplateJsonData = whatsappTemplateJsonData.map((item) => {
              if (item === "phnNo") {
                return userNo;
              } else {
                return data[item] ? data[item] : item;
              }
            });
            whatsappTemplateParamsData = whatsappTemplateParamsData.map(
              (item) => {
                if (item === "phnNo") {
                  return userNo;
                } else {
                  return data[item] ? data[item] : item;
                }
              }
            );
          }
        }
      } else {
        var err = "error :  no sms template found";
        console.log("error :  no sms template found");
        return err;
      }
    }
    let whatsappMessage;
    var providerValuesHeadWhatsapp = [];
    var providerValuesBodyWhatsapp = [];
    if (whatsappTemplateId) {
      var providerwhatsapp = await whatsappProviderModel.findById(
        whatsappTemplateId
      );
      if (providerwhatsapp) {
        providerValuesHeadWhatsapp = await whatsappProviderHead
          .find({ whatsapp_table_id: new ObjectId(whatsappTemplateId) })
          .select("name value");
        providerValuesBodyWhatsapp = await whatsappProviderBody
          .find({ whatsapp_table_id: new ObjectId(whatsappTemplateId) })
          .select("name value whatsappJsonBodyData");
        if (providerwhatsapp._doc && providerwhatsapp._doc.message) {
          whatsappMessage = providerwhatsapp._doc.message.message;
        } else {
          var err = "Message field is undefined in providerwhatsapp._doc";
          console.error("Message field is undefined in providerwhatsapp._doc");
          return err;
        }
      } else {
        var err = "No providerwhatsapp found with the given ID";
        console.error("No providerwhatsapp found with the given ID");
        return err;
      }
    } else {
      var err = "whatsappTemplateId is undefined or falsy";
      console.error("whatsappTemplateId is undefined or falsy");
      return err;
    }
    var stringWhatsapp = "";
    if (whatsappMessage != undefined) {
      // whatsappMessage = whatsappMessage.replace(/\$phno/g, phnNo);
      whatsappMessage = whatsappMessage.replace(/\n/g, "\\n");
      function replaceVariables(template, replacements) {
        // const regex = /\$[a-zA-Z_][a-zA-Z0-9_]*/g;

        // const variables = Array.from(new Set(template.match(regex)));
        // let resultwhatsapp = template;
        // variables.forEach((variable, index) => {
        //   if (index < replacements.length) {
        //     const replacement = replacements[index];
        //     resultwhatsapp = resultwhatsapp.replace(variable, replacement);
        //   }
        // });
        let resultwhatsapp = template;
        replacements.map((variable, index) => {
          resultwhatsapp = resultwhatsapp.replace("$variable$", variable);
        });
        return resultwhatsapp;
      }
      var stringWhatsapp = replaceVariables(
        whatsappMessage,
        whatsappTemplateData
      );
    }
    if (providerwhatsapp._doc.type != "JSON") {
      var providerValuesBodyWhatsapp = providerValuesBodyWhatsapp.reduce(
        (acc, item) => {
          if (item.name && item.value) {
            acc[item.name] = item.value;
          }
          // else if (item.message) {
          //   acc['sms'] = item.message;
          // }
          return acc;
        },
        {}
      );
    }
    var providerValuesHeadWhatsapp = providerValuesHeadWhatsapp.reduce(
      (acc, item) => {
        if (item.name && item.value) {
          acc[item.name] = item.value;
        }
        // else if (item.message) {
        //   acc['sms'] = item.message;
        // }
        return acc;
      },
      {}
    );
    if (
      providerValuesBodyWhatsapp != undefined &&
      Object.keys(providerValuesBodyWhatsapp).length != 0
    ) {
      var url = providerwhatsapp._doc.url;
      const axiosConfigWhatsapp = {
        method: providerwhatsapp._doc.method.toLowerCase(),
        url: providerwhatsapp._doc.url,
      };
      if (providerValuesHeadWhatsapp) {
        axiosConfigWhatsapp.headers = providerValuesHeadWhatsapp;
      }
      if (providerwhatsapp._doc.type == "JSON") {
        var data = {};
        if (providerValuesBodyWhatsapp != undefined) {
          var str = providerValuesBodyWhatsapp[0].whatsappJsonBodyData;
          // str = str.replace('$message', '"$message"');
          str = str.replace("$message", stringWhatsapp);
          function replaceVariables(template, replacements) {
            let resultwhatsapp = template;
            replacements.map((variable, index) => {
              resultwhatsapp = resultwhatsapp.replace("$variable$", variable);
            });
            return resultwhatsapp;
          }
          str = replaceVariables(str, whatsappTemplateJsonData);
          const value = JSON.parse(str);
          axiosConfigWhatsapp.data = value;
        } else {
          axiosConfigSms.data = {};
        }
      } else if (providerwhatsapp._doc.type == "www-form-urlencode") {
        if (providerValuesBodyWhatsapp != undefined) {
          var data = {};
          var bodyParams_key = Object.keys(providerValuesBodyWhatsapp);
          bodyParams_key.map((input_value) => {
            var value = bodyParams[input_value];
            if (value == "$message") {
              data[input_value] = stringWhatsapp;
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultwhatsapp = template;
                  replacements.map((variable, index) => {
                    resultwhatsapp = resultwhatsapp.replace(
                      "$variable$",
                      variable
                    );
                  });
                  return resultwhatsapp;
                }
                str = replaceVariables(value, whatsappTemplateParamsData);
                data[input_value] = str;
              } else {
                data[input_value] = value;
              }
            }
          });
          data = qs.stringify(data);
          var header = { "Content-Type": "application/x-www-form-urlencoded" };
          axiosConfigWhatsapp.data = data;
          axiosConfigWhatsapp.headers = header;
        } else {
          axiosConfigSms.data = {};
        }
      } else if (providerwhatsapp._doc.type == "form-data") {
        var input = new FormData();
        if (providerValuesBodyWhatsapp != undefined) {
          // for (const key in providerValuesBodyWhatsapp) {
          //   input.append(key, providerValuesBodyWhatsapp[key]);
          // }
          var bodyParams_key = Object.keys(providerValuesBodyWhatsapp);
          bodyParams_key.map((input_value) => {
            var value = bodyParams[input_value];
            if (value == "$message") {
              input.append(input_value, stringWhatsapp);
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultwhatsapp = template;
                  replacements.map((variable, index) => {
                    resultwhatsapp = resultwhatsapp.replace(
                      "$variable$",
                      variable
                    );
                  });
                  return resultwhatsapp;
                }
                str = replaceVariables(value, whatsappTemplateParamsData);
                input.append(input_value, str);
              } else {
                input.append(input_value, value);
              }
            }
          });
          axiosConfigWhatsapp.data = input;
        } else {
          axiosConfigSms.data = {};
        }
      } else {
        if (providerValuesBodyWhatsapp != undefined) {
          url += "?";
          var api_data_keys = Object.keys(providerValuesBodyWhatsapp);
          api_data_keys.map(async (input_value) => {
            var value = providerValuesBodyWhatsapp[input_value];
            if (value == "$message") {
              url += input_value + "=" + stringWhatsapp + "&";
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultwhatsapp = template;
                  replacements.map((variable, index) => {
                    resultwhatsapp = resultwhatsapp.replace(
                      "$variable$",
                      variable
                    );
                  });
                  return resultwhatsapp;
                }
                str = replaceVariables(value, whatsappTemplateParamsData);
                url += input_value + "=" + str + "&";
              } else {
                url +=
                  input_value +
                  "=" +
                  providerValuesBodyWhatsapp[input_value] +
                  "&";
              }
            }
          });
          axiosConfigWhatsapp.url = url;
        }
      }
      console.log(axiosConfigWhatsapp);
      const axiosResponseWhatsapp = await axios(axiosConfigWhatsapp);
      console.log(axiosResponseWhatsapp.data);
      return axiosResponseWhatsapp.data;
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};
integration.apiAxiosCall = async (
  data,
  phnNo,
  template_id,
  isHandover,
  statusId,
  userNo
) => {
  try {
    if (isHandover == 0) {
      const apiData = await templateApi.find({
        templateId: template_id,
        isHandover: false,
      });
      if (apiData && apiData.length > 0 && apiData[0].apiTemplateData) {
        if (Array.isArray(apiData[0].apiTemplateData)) {
          const templateObject = apiData[0]._doc.apiTemplateData.find(
            (template) => template.statusId == statusId
          );
          if (templateObject) {
            var apiTemplateId = templateObject.apiTemplateId;
            var apiTemplateData = templateObject.variables;
            var apiTemplateJsonData = templateObject.jsonVariables;
            var apiTemplateParamsData =
              templateObject.paramsVariables[0].variable;
            apiTemplateParamsData = [apiTemplateParamsData];
            if (
              apiData[0]._doc.smsToUser == 1 &&
              apiData[0]._doc.smsToCustomer == 1
            ) {
              apiTemplateData = apiTemplateData.map((item) => {
                if (item == "phnNo") {
                  return `${data[item]},${userNo}`;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
              apiTemplateJsonData = apiTemplateJsonData.map((item) => {
                if (item == "phnNo") {
                  return `${data[item]},${userNo}`;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
              apiTemplateParamsData = apiTemplateParamsData.map((item) => {
                if (item == "phnNo") {
                  return `${data[item]},${userNo}`;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
            } else if (apiData[0]._doc.smsToCustomer == 1) {
              apiTemplateData = apiTemplateData.map((item) =>
                data[item] ? data[item] : item
              );
              apiTemplateJsonData = apiTemplateJsonData.map((item) =>
                data[item] ? data[item] : item
              );
              apiTemplateParamsData = apiTemplateParamsData.map((item) =>
                data[item] ? data[item] : item
              );
            } else if (apiData[0]._doc.smsToUser == 1) {
              apiTemplateData = apiTemplateData.map((item) => {
                if (item === "phnNo") {
                  return userNo;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
              apiTemplateJsonData = apiTemplateJsonData.map((item) => {
                if (item === "phnNo") {
                  return userNo;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
              apiTemplateParamsData = apiTemplateParamsData.map((item) => {
                if (item === "phnNo") {
                  return userNo;
                } else {
                  return data[item] ? data[item] : item;
                }
              });
            }
          }
        }
      } else {
        var err = "error :  no api template found";
        console.log("error :  no api template found");
        return err;
      }
    } else {
      const apiData = await templateApi.find({
        templateId: template_id,
        isHandover: true,
      });
      if (apiData && apiData.length > 0) {
        const templateObject = apiData[0]._doc;
        if (templateObject) {
          var apiTemplateId = templateObject.apiTemplateId;
          var apiTemplateData = templateObject.variables;
          var apiTemplateJsonData = templateObject.jsonVariables;
          var apiTemplateParamsData =
            templateObject.paramsVariables[0].variable;
          apiTemplateParamsData = [apiTemplateParamsData];
          // apiTemplateData = apiTemplateData.map(item => data[item] ? data[item] : item);
          // apiTemplateJsonData = apiTemplateJsonData.map(item => data[item] ? data[item] : item);
          // apiTemplateParamsData = apiTemplateParamsData.map(item => data[item] ? data[item] : item);
          if (
            apiData[0]._doc.smsToUser == 1 &&
            apiData[0]._doc.smsToCustomer == 1
          ) {
            apiTemplateData = apiTemplateData.map((item) => {
              if (item == "phnNo") {
                return `${data[item]},${userNo}`;
              } else {
                return data[item] ? data[item] : item;
              }
            });
            apiTemplateJsonData = apiTemplateJsonData.map((item) => {
              if (item == "phnNo") {
                return `${data[item]},${userNo}`;
              } else {
                return data[item] ? data[item] : item;
              }
            });
            apiTemplateParamsData = apiTemplateParamsData.map((item) => {
              if (item == "phnNo") {
                return `${data[item]},${userNo}`;
              } else {
                return data[item] ? data[item] : item;
              }
            });
          } else if (apiData[0]._doc.smsToCustomer == 1) {
            apiTemplateData = apiTemplateData.map((item) =>
              data[item] ? data[item] : item
            );
            apiTemplateJsonData = apiTemplateJsonData.map((item) =>
              data[item] ? data[item] : item
            );
            apiTemplateParamsData = apiTemplateParamsData.map((item) =>
              data[item] ? data[item] : item
            );
          } else if (apiData[0]._doc.smsToUser == 1) {
            apiTemplateData = apiTemplateData.map((item) => {
              if (item === "phnNo") {
                return userNo;
              } else {
                return data[item] ? data[item] : item;
              }
            });
            apiTemplateJsonData = apiTemplateJsonData.map((item) => {
              if (item === "phnNo") {
                return userNo;
              } else {
                return data[item] ? data[item] : item;
              }
            });
            apiTemplateParamsData = apiTemplateParamsData.map((item) => {
              if (item === "phnNo") {
                return userNo;
              } else {
                return data[item] ? data[item] : item;
              }
            });
          }
        }
      } else {
        var err = "error :  no sms template found";
        console.log("error :  no sms template found");
        return err;
      }
    }
    let apiMessage;
    var providerValuesHeadApi = [];
    var providerValuesBodyApi = [];
    if (apiTemplateId) {
      var providerapi = await apiProviderModel.findById(apiTemplateId);
      if (providerapi) {
        providerValuesHeadApi = await apiProviderHead.find({
          api_table_id: new ObjectId(apiTemplateId),
        });
        providerValuesBodyApi = await apiProviderBody.find({
          api_table_id: new ObjectId(apiTemplateId),
        });
        if (providerapi._doc && providerapi._doc.message) {
          apiMessage = providerapi._doc.message.message;
        } else {
          var err = "Message field is undefined in providerapi._doc";
          console.error("Message field is undefined in providerapi._doc");
          return err;
        }
      } else {
        var err = "No providerapi found with the given ID";
        console.error("No providerapi found with the given ID");
        return err;
      }
    }
    var stringApi = "";
    if (apiMessage != undefined) {
      smsMessage = smsMessage.replace(/\n/g, "\\n");
      function replaceVariables(template, replacements) {
        // const regex = /\$[a-zA-Z_][a-zA-Z0-9_]*/g;
        // const variables = Array.from(new Set(template.match(regex)));
        // let resultapi = template;
        // variables.forEach((variable, index) => {
        //   if (index < replacements.length) {
        //     const replacement = replacements[index];
        //     resultapi = resultapi.replace(variable, replacement);
        //   }
        // });
        let resultapi = template;
        replacements.map((variable, index) => {
          resultapi = resultapi.replace("$variable$", variable);
        });

        return resultapi;
      }

      var stringApi = replaceVariables(apiMessage, apiTemplateData);
    }
    // providerValuesBodyApi.push({ message: stringApi })
    if (providerapi._doc.type != "JSON") {
      var providerValuesBodyApi = providerValuesBodyApi.reduce((acc, item) => {
        if (item.name && item.value) {
          acc[item.name] = item.value;
        }
        // else if (item.message) {
        //   acc['sms'] = item.message;
        // }
        return acc;
      }, {});
    }

    var providerValuesHeadApi = providerValuesHeadApi.reduce((acc, item) => {
      if (item.name && item.value) {
        acc[item.name] = item.value;
      }
      // else if (item.message) {
      //   acc['sms'] = item.message;
      // }
      return acc;
    }, {});
    if (
      providerValuesBodyApi != undefined &&
      Object.keys(providerValuesBodyApi).length != 0
    ) {
      var url = providerapi._doc.url;
      const axiosConfigApi = {
        method: providerapi._doc.method.toLowerCase(),
        url: providerapi._doc.url,
      };
      if (providerValuesHeadApi) {
        axiosConfigApi.headers = providerValuesHeadApi;
      }
      if (providerapi._doc.type == "JSON") {
        var data = {};
        if (providerValuesBodyApi != undefined) {
          // providerValuesBodyApi.mobiles = phnNo
          // axiosConfigApi.data = providerValuesBodyApi;
          var str = providerValuesBodyApi[0].apiJsonBodyData;
          str = str.replace("$message", stringApi);
          function replaceVariables(template, replacements) {
            let resultSms = template;
            replacements.map((variable, index) => {
              resultSms = resultSms.replace("$variable$", variable);
            });
            return resultSms;
          }
          str = replaceVariables(str, apiTemplateJsonData);
          const value = JSON.parse(str);
          axiosConfigApi.data = value;
        } else {
          axiosConfigApi.data = {};
        }
      } else if (providerapi._doc.type == "www-form-urlencode") {
        if (providerValuesBodyApi != undefined) {
          var data = {};
          // providerValuesBodyApi.mobiles = phnNo
          var bodyParams_key = Object.keys(providerValuesBodyApi);
          bodyParams_key.map((input_value) => {
            var value = bodyParams[input_value];
            if (value == "$message") {
              data[input_value] = stringApi;
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultApi = template;
                  replacements.map((variable, index) => {
                    resultApi = resultApi.replace("$variable$", variable);
                  });
                  return resultApi;
                }
                str = replaceVariables(value, apiTemplateParamsData);
                data[input_value] = str;
              } else {
                data[input_value] = value;
              }
            }
          });
          data = qs.stringify(data);
          var header = { "Content-Type": "application/x-www-form-urlencoded" };
          axiosConfigApi.data = data;
          axiosConfigApi.headers = header;
        } else {
          axiosConfigApi.data = {};
        }
      } else if (providerapi._doc.type == "form-data") {
        var input = new FormData();
        if (providerValuesBodyApi != undefined) {
          // providerValuesBodyApi.mobiles = phnNo
          // for (const key in providerValuesBodyApi) {
          //   input.append(key, providerValuesBodyApi[key]);
          // }
          var bodyParams_key = Object.keys(providerValuesBodyApi);
          bodyParams_key.map((input_value) => {
            var value = bodyParams[input_value];
            if (value == "$message") {
              input.append(input_value, stringApi);
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultApi = template;
                  replacements.map((variable, index) => {
                    resultApi = resultApi.replace("$variable$", variable);
                  });
                  return resultApi;
                }
                str = replaceVariables(value, apiTemplateParamsData);
                input.append(input_value, str);
              } else {
                input.append(input_value, value);
              }
            }
          });
          axiosConfigApi.data = input;
        } else {
          axiosConfigApi.data = {};
        }
      } else {
        if (providerValuesBodyApi != undefined) {
          url += "?";
          var api_data_keys = Object.keys(providerValuesBodyApi);
          api_data_keys.map(async (input_value) => {
            var value = providerValuesBodyApi[input_value];
            if (value == "$message") {
              url += input_value + "=" + stringApi + "&";
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultApi = template;
                  replacements.map((variable, index) => {
                    resultApi = resultApi.replace("$variable$", variable);
                  });
                  return resultApi;
                }
                str = replaceVariables(value, apiTemplateParamsData);
                url += input_value + "=" + str + "&";
              } else {
                url +=
                  input_value + "=" + providerValuesBodyApi[input_value] + "&";
              }
            }
          });
          axiosConfigApi.url = url;
        }
      }
      console.log(axiosConfigApi);
      const axiosResponseApi = await axios(axiosConfigApi);
      console.log(axiosResponseApi.data);
      return axiosResponseApi.data;
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};
integration.findTemplateData = async (
  uniqNo,
  phnNo,
  template_id,
  type,
  statusId
) => {
  try {
    if (type == 1) {
      var agentData = await agentModel.find({
        uniqNo: uniqNo,
        id_template: template_id,
        status_id: Number(statusId),
      });
      if (agentData.length != 0) return agentData[0]._doc;
    } else if (type == 2) {
      var agentData = await leadModel.find({
        uniqNo: uniqNo,
        id_template: template_id,
        status_id: Number(statusId),
      });
      if (agentData.length != 0) return agentData[0]._doc;
    } else if (type == 3) {
      var agentData = await ticketsModel.find({
        uniqNo: uniqNo,
        id_template: template_id,
        status_id: Number(statusId),
      });
      if (agentData.length != 0) return agentData[0]._doc;
    } else {
      return [];
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};
integration.broadcastSmsAxiosIntegration = async (
  data,
  logDataJson,
  selectRes
) => {
  try {
    var smsTemplateId = data.provider;
    let smsMessage;
    var providerValuesHeadSms = [];
    var providerValuesBodySms = [];
    if (smsTemplateId) {
      var providersms = await smsProviderModel.findById(smsTemplateId);
      if (providersms) {
        providerValuesHeadSms = await smsProviderHead.find({
          sms_table_id: new ObjectId(smsTemplateId),
        });
        providerValuesBodySms = await smsProviderBody.find({
          sms_table_id: new ObjectId(smsTemplateId),
        });
        if (providersms._doc && providersms._doc.message) {
          smsMessage = providersms._doc.message.message;
        } else {
          var err = "Message field is undefined in providersms._doc";
          console.error("Message field is undefined in providersms._doc");
          return err;
        }
      } else {
        var err = "No providersms found with the given ID";
        console.error("No providersms found with the given ID");
        return err;
      }
    } else {
      var err = "smsTemplateId is undefined or falsy";
      console.error("smsTemplateId is undefined or falsy");
      return err;
    }
    var smsTemplateData = data.message;
    var smsTemplateJsonData = data.json;
    if (data.params.length != 0) {
      var smsTemplateParamsData = data.params[0].variable;
      smsTemplateParamsData = [smsTemplateParamsData];
    } else {
      var smsTemplateParamsData = [];
    }
    var stringSms = "";
    if (smsTemplateData.length != 0) {
      smsTemplateData = smsTemplateData.map((value, index) => {
        if (value == "$callStatus") {
          value = logDataJson.callStatus;
        } else if (value == "$totalCallDuration") {
          value = logDataJson.totalCallDuration;
        } else if (value == "$cr_file") {
          value = logDataJson.cr_file;
        } else if (value == "$didNumber") {
          value = selectRes[0].didNumber;
        } else if (value == "$call_start_time") {
          value = selectRes[0].call_start_time;
        } else if (value == "$contact_number") {
          value = selectRes[0].contact_number;
        }
        return value;
      });
    }
    if (smsTemplateJsonData.length != 0) {
      smsTemplateJsonData = smsTemplateJsonData.map((value, index) => {
        if (value == "$callStatus") {
          value = logDataJson.callStatus;
        } else if (value == "$totalCallDuration") {
          value = logDataJson.totalCallDuration;
        } else if (value == "$cr_file") {
          value = logDataJson.cr_file;
        } else if (value == "$didNumber") {
          value = selectRes[0].didNumber;
        } else if (value == "$call_start_time") {
          value = selectRes[0].call_start_time;
        } else if (value == "$contact_number") {
          value = selectRes[0].contact_number;
        }
        return value;
      });
    }
    if (smsTemplateParamsData.length != 0) {
      smsTemplateParamsData = smsTemplateParamsData.map((value, index) => {
        if (value == "$callStatus") {
          value = logDataJson.callStatus;
        } else if (value == "$totalCallDuration") {
          value = logDataJson.totalCallDuration;
        } else if (value == "$cr_file") {
          value = logDataJson.cr_file;
        } else if (value == "$didNumber") {
          value = selectRes[0].didNumber;
        } else if (value == "$call_start_time") {
          value = selectRes[0].call_start_time;
        } else if (value == "$contact_number") {
          value = selectRes[0].contact_number;
        }
        return value;
      });
    }
    if (smsMessage != undefined) {
      smsMessage = smsMessage.replace(/\n/g, "\\n");
      function replaceVariables(template, replacements) {
        let resultsms = template;
        replacements.map((variable, index) => {
          resultsms = resultsms.replace("$variable$", variable);
        });
        return resultsms;
      }
      var stringSms = replaceVariables(smsMessage, smsTemplateData);
    }
    if (providersms._doc.type != "JSON") {
      var providerValuesBodySms = providerValuesBodySms.reduce((acc, item) => {
        if (item.name && item.value) {
          acc[item.name] = item.value;
        }
        return acc;
      }, {});
    }
    var providerValuesHeadSms = providerValuesHeadSms.reduce((acc, item) => {
      if (item.name && item.value) {
        acc[item.name] = item.value;
      }
      return acc;
    }, {});
    if (
      providerValuesBodySms != undefined &&
      Object.keys(providerValuesBodySms).length != 0
    ) {
      var url = providersms._doc.url;
      const axiosConfigSms = {
        method: providersms._doc.method.toLowerCase(),
        url: providersms._doc.url,
      };
      if (providerValuesHeadSms) {
        axiosConfigSms.headers = providerValuesHeadSms;
      }
      if (providersms._doc.type == "JSON") {
        var data = {};
        if (providerValuesBodySms != undefined) {
          var str = providerValuesBodySms[0].smsJsonBodyData;
          str = str.replace("$message", stringSms);
          function replaceVariables(template, replacements) {
            let resultSms = template;
            replacements.map((variable, index) => {
              resultSms = resultSms.replace("$variable$", variable);
            });
            return resultSms;
          }
          str = replaceVariables(str, smsTemplateJsonData);
          const value = JSON.parse(str);
          axiosConfigSms.data = value;
        } else {
          axiosConfigSms.data = {};
        }
      } else if (providersms._doc.type == "www-form-urlencode") {
        if (providerValuesBodySms != undefined) {
          var data = {};
          var bodyParams_key = Object.keys(providerValuesBodySms);
          bodyParams_key.map((input_value) => {
            var value = bodyParams[input_value];
            if (value == "$message") {
              data[input_value] = stringSms;
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultSms = template;
                  replacements.map((variable, index) => {
                    resultSms = resultSms.replace("$variable$", variable);
                  });
                  return resultSms;
                }
                str = replaceVariables(value, smsTemplateParamsData);
                data[input_value] = str;
              } else {
                data[input_value] = value;
              }
            }
          });
          data = qs.stringify(data);
          var header = { "Content-Type": "application/x-www-form-urlencoded" };
          axiosConfigSms.data = data;
          axiosConfigSms.headers = header;
        } else {
          axiosConfigSms.data = {};
        }
      } else if (providersms._doc.type == "form-data") {
        var input = new FormData();
        if (providerValuesBodySms != undefined) {
          // providerValuesBodySms.mobiles = phnNo
          // for (const key in providerValuesBodySms) {
          //   input.append(key, providerValuesBodySms[key]);
          // }
          var bodyParams_key = Object.keys(providerValuesBodySms);
          bodyParams_key.map((input_value) => {
            var value = bodyParams[input_value];
            if (value == "$message") {
              input.append(input_value, stringSms);
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultSms = template;
                  replacements.map((variable, index) => {
                    resultSms = resultSms.replace("$variable$", variable);
                  });
                  return resultSms;
                }
                str = replaceVariables(value, smsTemplateParamsData);
                input.append(input_value, str);
              } else {
                input.append(input_value, value);
              }
            }
          });
          axiosConfigSms.data = input;
        } else {
          axiosConfigSms.data = {};
        }
      } else {
        if (providerValuesBodySms != undefined) {
          url += "?";
          var api_data_keys = Object.keys(providerValuesBodySms);
          api_data_keys.map(async (input_value) => {
            var value = providerValuesBodySms[input_value];
            if (value == "$message") {
              url += input_value + "=" + stringSms + "&";
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultSms = template;
                  replacements.map((variable, index) => {
                    resultSms = resultSms.replace("$variable$", variable);
                  });
                  return resultSms;
                }
                str = replaceVariables(value, smsTemplateParamsData);
                url += input_value + "=" + str + "&";
              } else {
                url +=
                  input_value + "=" + providerValuesBodySms[input_value] + "&";
              }
            }
          });
          axiosConfigSms.url = url;
        }
      }
      console.log(axiosConfigSms);
      const axiosResponseSms = await axios(axiosConfigSms);
      console.log(axiosResponseSms.data);
      return axiosResponseSms.data;
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};
integration.broadcastWhatsappIntegration = async (
  data,
  logDataJson,
  selectRes
) => {
  try {
    var whatsappTemplateId = data.provider;
    let whatsappMessage;
    var providerValuesHeadWhatsapp = [];
    var providerValuesBodyWhatsapp = [];
    if (whatsappTemplateId) {
      var providerwhatsapp = await whatsappProviderModel.findById(
        whatsappTemplateId
      );
      if (providerwhatsapp) {
        providerValuesHeadWhatsapp = await whatsappProviderHead
          .find({ whatsapp_table_id: new ObjectId(whatsappTemplateId) })
          .select("name value");
        providerValuesBodyWhatsapp = await whatsappProviderBody
          .find({ whatsapp_table_id: new ObjectId(whatsappTemplateId) })
          .select("name value whatsappJsonBodyData");
        if (providerwhatsapp._doc && providerwhatsapp._doc.message) {
          whatsappMessage = providerwhatsapp._doc.message.message;
        } else {
          var err = "Message field is undefined in providerwhatsapp._doc";
          console.error("Message field is undefined in providerwhatsapp._doc");
          return err;
        }
      } else {
        var err = "No providerwhatsapp found with the given ID";
        console.error("No providerwhatsapp found with the given ID");
        return err;
      }
    } else {
      var err = "whatsappTemplateId is undefined or falsy";
      console.error("whatsappTemplateId is undefined or falsy");
      return err;
    }
    var whatsappTemplateData = data.message;
    var whatsappTemplateJsonData = data.json;
    if (data.params.length != 0) {
      var whatsappTemplateParamsData = data.params[0].variable;
      whatsappTemplateParamsData = [whatsappTemplateParamsData];
    } else {
      var whatsappTemplateParamsData = [];
    }
    var stringWhatsapp = "";
    if (whatsappTemplateData.length != 0) {
      whatsappTemplateData = whatsappTemplateData.map((value, index) => {
        if (value == "$callStatus") {
          value = logDataJson.callStatus;
        } else if (value == "$totalCallDuration") {
          value = logDataJson.totalCallDuration;
        } else if (value == "$cr_file") {
          value = logDataJson.cr_file;
        } else if (value == "$didNumber") {
          value = selectRes[0].didNumber;
        } else if (value == "$call_start_time") {
          value = selectRes[0].call_start_time;
        } else if (value == "$contact_number") {
          value = selectRes[0].contact_number;
        }
        return value;
      });
    }
    if (whatsappTemplateJsonData.length != 0) {
      whatsappTemplateJsonData = whatsappTemplateJsonData.map(
        (value, index) => {
          if (value == "$callStatus") {
            value = logDataJson.callStatus;
          } else if (value == "$totalCallDuration") {
            value = logDataJson.totalCallDuration;
          } else if (value == "$cr_file") {
            value = logDataJson.cr_file;
          } else if (value == "$didNumber") {
            value = selectRes[0].didNumber;
          } else if (value == "$call_start_time") {
            value = selectRes[0].call_start_time;
          } else if (value == "$contact_number") {
            value = selectRes[0].contact_number;
          }
          return value;
        }
      );
    }
    if (whatsappTemplateParamsData.length != 0) {
      whatsappTemplateParamsData = whatsappTemplateParamsData.map(
        (value, index) => {
          if (value == "$callStatus") {
            value = logDataJson.callStatus;
          } else if (value == "$totalCallDuration") {
            value = logDataJson.totalCallDuration;
          } else if (value == "$cr_file") {
            value = logDataJson.cr_file;
          } else if (value == "$didNumber") {
            value = selectRes[0].didNumber;
          } else if (value == "$call_start_time") {
            value = selectRes[0].call_start_time;
          } else if (value == "$contact_number") {
            value = selectRes[0].contact_number;
          }
          return value;
        }
      );
    }
    if (whatsappMessage != undefined) {
      whatsappMessage = whatsappMessage.replace(/\n/g, "\\n");
      function replaceVariables(template, replacements) {
        let resultwhatsapp = template;
        replacements.map((variable, index) => {
          resultwhatsapp = resultwhatsapp.replace("$variable$", variable);
        });
        return resultwhatsapp;
      }
      var stringWhatsapp = replaceVariables(
        whatsappMessage,
        whatsappTemplateData
      );
    }
    if (providerwhatsapp._doc.type != "JSON") {
      var providerValuesBodyWhatsapp = providerValuesBodyWhatsapp.reduce(
        (acc, item) => {
          if (item.name && item.value) {
            acc[item.name] = item.value;
          }
          return acc;
        },
        {}
      );
    }
    var providerValuesHeadWhatsapp = providerValuesHeadWhatsapp.reduce(
      (acc, item) => {
        if (item.name && item.value) {
          acc[item.name] = item.value;
        }
        return acc;
      },
      {}
    );
    if (
      providerValuesBodyWhatsapp != undefined &&
      Object.keys(providerValuesBodyWhatsapp).length != 0
    ) {
      var url = providerwhatsapp._doc.url;
      const axiosConfigWhatsapp = {
        method: providerwhatsapp._doc.method.toLowerCase(),
        url: providerwhatsapp._doc.url,
      };
      if (providerValuesHeadWhatsapp) {
        axiosConfigWhatsapp.headers = providerValuesHeadWhatsapp;
      }
      if (providerwhatsapp._doc.type == "JSON") {
        var data = {};
        if (providerValuesBodyWhatsapp != undefined) {
          var str = providerValuesBodyWhatsapp[0].whatsappJsonBodyData;
          // str = str.replace('$message', '"$message"');
          str = str.replace("$message", stringWhatsapp);
          function replaceVariables(template, replacements) {
            let resultwhatsapp = template;
            replacements.map((variable, index) => {
              resultwhatsapp = resultwhatsapp.replace("$variable$", variable);
            });
            return resultwhatsapp;
          }
          str = replaceVariables(str, whatsappTemplateJsonData);
          const value = JSON.parse(str);
          axiosConfigWhatsapp.data = value;
        } else {
          axiosConfigSms.data = {};
        }
      } else if (providerwhatsapp._doc.type == "www-form-urlencode") {
        if (providerValuesBodyWhatsapp != undefined) {
          var data = {};
          var bodyParams_key = Object.keys(providerValuesBodyWhatsapp);
          bodyParams_key.map((input_value) => {
            var value = bodyParams[input_value];
            if (value == "$message") {
              data[input_value] = stringWhatsapp;
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultwhatsapp = template;
                  replacements.map((variable, index) => {
                    resultwhatsapp = resultwhatsapp.replace(
                      "$variable$",
                      variable
                    );
                  });
                  return resultwhatsapp;
                }
                str = replaceVariables(value, whatsappTemplateParamsData);
                data[input_value] = str;
              } else {
                data[input_value] = value;
              }
            }
          });
          data = qs.stringify(data);
          var header = { "Content-Type": "application/x-www-form-urlencoded" };
          axiosConfigWhatsapp.data = data;
          axiosConfigWhatsapp.headers = header;
        } else {
          axiosConfigSms.data = {};
        }
      } else if (providerwhatsapp._doc.type == "form-data") {
        var input = new FormData();
        if (providerValuesBodyWhatsapp != undefined) {
          // for (const key in providerValuesBodyWhatsapp) {
          //   input.append(key, providerValuesBodyWhatsapp[key]);
          // }
          var bodyParams_key = Object.keys(providerValuesBodyWhatsapp);
          bodyParams_key.map((input_value) => {
            var value = bodyParams[input_value];
            if (value == "$message") {
              input.append(input_value, stringWhatsapp);
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultwhatsapp = template;
                  replacements.map((variable, index) => {
                    resultwhatsapp = resultwhatsapp.replace(
                      "$variable$",
                      variable
                    );
                  });
                  return resultwhatsapp;
                }
                str = replaceVariables(value, whatsappTemplateParamsData);
                input.append(input_value, str);
              } else {
                input.append(input_value, value);
              }
            }
          });
          axiosConfigWhatsapp.data = input;
        } else {
          axiosConfigSms.data = {};
        }
      } else {
        if (providerValuesBodyWhatsapp != undefined) {
          url += "?";
          var api_data_keys = Object.keys(providerValuesBodyWhatsapp);
          api_data_keys.map(async (input_value) => {
            var value = providerValuesBodyWhatsapp[input_value];
            if (value == "$message") {
              url += input_value + "=" + stringWhatsapp + "&";
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultwhatsapp = template;
                  replacements.map((variable, index) => {
                    resultwhatsapp = resultwhatsapp.replace(
                      "$variable$",
                      variable
                    );
                  });
                  return resultwhatsapp;
                }
                str = replaceVariables(value, whatsappTemplateParamsData);
                url += input_value + "=" + str + "&";
              } else {
                url +=
                  input_value +
                  "=" +
                  providerValuesBodyWhatsapp[input_value] +
                  "&";
              }
            }
          });
          axiosConfigWhatsapp.url = url;
        }
      }
      console.log(axiosConfigWhatsapp);
      const axiosResponseWhatsapp = await axios(axiosConfigWhatsapp);
      console.log(axiosResponseWhatsapp.data);
      return axiosResponseWhatsapp.data;
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};
integration.broadcastApiAxiosIntegration = async (
  data,
  logDataJson,
  selectRes
) => {
  try {
    var apiTemplateId = data.provider;
    let apiMessage;
    var providerValuesHeadApi = [];
    var providerValuesBodyApi = [];
    if (apiTemplateId) {
      var providerapi = await apiProviderModel.findById(smsTemplateId);
      if (providerapi) {
        providerValuesHeadApi = await apiProviderHead.find({
          api_table_id: new ObjectId(smsTemplateId),
        });
        providerValuesBodyApi = await apiProviderBody.find({
          api_table_id: new ObjectId(smsTemplateId),
        });
        if (providerapi._doc && providerapi._doc.message) {
          apiMessage = providerapi._doc.message.message;
        } else {
          var err = "Message field is undefined in providerapi._doc";
          console.error("Message field is undefined in providerapi._doc");
          return err;
        }
      } else {
        var err = "No providerapi found with the given ID";
        console.error("No providerapi found with the given ID");
        return err;
      }
    } else {
      var err = "apiTemplateId is undefined or falsy";
      console.error("apiTemplateId is undefined or falsy");
      return err;
    }
    var apiTemplateData = data.message;
    var apiTemplateJsonData = data.json;
    if (data.params.length != 0) {
      var apiTemplateParamsData = data.params[0].variable;
      apiTemplateParamsData = [apiTemplateParamsData];
    } else {
      var apiTemplateParamsData = [];
    }
    if (apiTemplateData.length != 0) {
      apiTemplateData = apiTemplateData.map((value, index) => {
        if (value == "$callStatus") {
          value = logDataJson.callStatus;
        } else if (value == "$totalCallDuration") {
          value = logDataJson.totalCallDuration;
        } else if (value == "$cr_file") {
          value = logDataJson.cr_file;
        } else if (value == "$didNumber") {
          value = selectRes[0].didNumber;
        } else if (value == "$call_start_time") {
          value = selectRes[0].call_start_time;
        } else if (value == "$contact_number") {
          value = selectRes[0].contact_number;
        }
        return value;
      });
    }
    if (apiTemplateJsonData.length != 0) {
      apiTemplateJsonData = apiTemplateJsonData.map((value, index) => {
        if (value == "$callStatus") {
          value = logDataJson.callStatus;
        } else if (value == "$totalCallDuration") {
          value = logDataJson.totalCallDuration;
        } else if (value == "$cr_file") {
          value = logDataJson.cr_file;
        } else if (value == "$didNumber") {
          value = selectRes[0].didNumber;
        } else if (value == "$call_start_time") {
          value = selectRes[0].call_start_time;
        } else if (value == "$contact_number") {
          value = selectRes[0].contact_number;
        }
        return value;
      });
    }
    if (apiTemplateParamsData.length != 0) {
      apiTemplateParamsData = apiTemplateParamsData.map((value, index) => {
        if (value == "$callStatus") {
          value = logDataJson.callStatus;
        } else if (value == "$totalCallDuration") {
          value = logDataJson.totalCallDuration;
        } else if (value == "$cr_file") {
          value = logDataJson.cr_file;
        } else if (value == "$didNumber") {
          value = selectRes[0].didNumber;
        } else if (value == "$call_start_time") {
          value = selectRes[0].call_start_time;
        } else if (value == "$contact_number") {
          value = selectRes[0].contact_number;
        }
        return value;
      });
    }
    var stringApi = "";
    if (apiMessage != undefined) {
      smsMessage = smsMessage.replace(/\n/g, "\\n");
      function replaceVariables(template, replacements) {
        // const regex = /\$[a-zA-Z_][a-zA-Z0-9_]*/g;
        // const variables = Array.from(new Set(template.match(regex)));
        // let resultapi = template;
        // variables.forEach((variable, index) => {
        //   if (index < replacements.length) {
        //     const replacement = replacements[index];
        //     resultapi = resultapi.replace(variable, replacement);
        //   }
        // });
        let resultapi = template;
        replacements.map((variable, index) => {
          resultapi = resultapi.replace("$variable$", variable);
        });

        return resultapi;
      }
      var stringApi = replaceVariables(apiMessage, apiTemplateData);
    }
    // providerValuesBodyApi.push({ message: stringApi })
    if (providerapi._doc.type != "JSON") {
      var providerValuesBodyApi = providerValuesBodyApi.reduce((acc, item) => {
        if (item.name && item.value) {
          acc[item.name] = item.value;
        }
        // else if (item.message) {
        //   acc['sms'] = item.message;
        // }
        return acc;
      }, {});
    }

    var providerValuesHeadApi = providerValuesHeadApi.reduce((acc, item) => {
      if (item.name && item.value) {
        acc[item.name] = item.value;
      }
      // else if (item.message) {
      //   acc['sms'] = item.message;
      // }
      return acc;
    }, {});
    if (
      providerValuesBodyApi != undefined &&
      Object.keys(providerValuesBodyApi).length != 0
    ) {
      var url = providerapi._doc.url;
      const axiosConfigApi = {
        method: providerapi._doc.method.toLowerCase(),
        url: providerapi._doc.url,
      };
      if (providerValuesHeadApi) {
        axiosConfigApi.headers = providerValuesHeadApi;
      }
      if (providerapi._doc.type == "JSON") {
        var data = {};
        if (providerValuesBodyApi != undefined) {
          // providerValuesBodyApi.mobiles = phnNo
          // axiosConfigApi.data = providerValuesBodyApi;
          var str = providerValuesBodyApi[0].apiJsonBodyData;
          str = str.replace("$message", stringApi);
          function replaceVariables(template, replacements) {
            let resultSms = template;
            replacements.map((variable, index) => {
              resultSms = resultSms.replace("$variable$", variable);
            });
            return resultSms;
          }
          str = replaceVariables(str, apiTemplateJsonData);
          const value = JSON.parse(str);
          axiosConfigApi.data = value;
        } else {
          axiosConfigApi.data = {};
        }
      } else if (providerapi._doc.type == "www-form-urlencode") {
        if (providerValuesBodyApi != undefined) {
          var data = {};
          // providerValuesBodyApi.mobiles = phnNo
          var bodyParams_key = Object.keys(providerValuesBodyApi);
          bodyParams_key.map((input_value) => {
            var value = bodyParams[input_value];
            if (value == "$message") {
              data[input_value] = stringApi;
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultApi = template;
                  replacements.map((variable, index) => {
                    resultApi = resultApi.replace("$variable$", variable);
                  });
                  return resultApi;
                }
                str = replaceVariables(value, apiTemplateParamsData);
                data[input_value] = str;
              } else {
                data[input_value] = value;
              }
            }
          });
          data = qs.stringify(data);
          var header = { "Content-Type": "application/x-www-form-urlencoded" };
          axiosConfigApi.data = data;
          axiosConfigApi.headers = header;
        } else {
          axiosConfigApi.data = {};
        }
      } else if (providerapi._doc.type == "form-data") {
        var input = new FormData();
        if (providerValuesBodyApi != undefined) {
          // providerValuesBodyApi.mobiles = phnNo
          // for (const key in providerValuesBodyApi) {
          //   input.append(key, providerValuesBodyApi[key]);
          // }
          var bodyParams_key = Object.keys(providerValuesBodyApi);
          bodyParams_key.map((input_value) => {
            var value = bodyParams[input_value];
            if (value == "$message") {
              input.append(input_value, stringApi);
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultApi = template;
                  replacements.map((variable, index) => {
                    resultApi = resultApi.replace("$variable$", variable);
                  });
                  return resultApi;
                }
                str = replaceVariables(value, apiTemplateParamsData);
                input.append(input_value, str);
              } else {
                input.append(input_value, value);
              }
            }
          });
          axiosConfigApi.data = input;
        } else {
          axiosConfigApi.data = {};
        }
      } else {
        if (providerValuesBodyApi != undefined) {
          url += "?";
          var api_data_keys = Object.keys(providerValuesBodyApi);
          api_data_keys.map(async (input_value) => {
            var value = providerValuesBodyApi[input_value];
            if (value == "$message") {
              url += input_value + "=" + stringApi + "&";
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let resultApi = template;
                  replacements.map((variable, index) => {
                    resultApi = resultApi.replace("$variable$", variable);
                  });
                  return resultApi;
                }
                str = replaceVariables(value, apiTemplateParamsData);
                url += input_value + "=" + str + "&";
              } else {
                url +=
                  input_value + "=" + providerValuesBodyApi[input_value] + "&";
              }
            }
          });
          axiosConfigApi.url = url;
        }
      }
      console.log(axiosConfigApi);
      const axiosResponseApi = await axios(axiosConfigApi);
      console.log(axiosResponseApi.data);
      return axiosResponseApi.data;
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};
integration.callflowSmsAxiosCall = async (smsId) => {
  try {
    var callflowSmsSubResult = await callflowSubSms.find({ sms_id: smsId });
    if (callflowSmsSubResult.length != 0) {
      var templateId = callflowSmsSubResult[0]._doc.template_id;
      var smsMsgVariables = callflowSmsSubResult[0]._doc.selected_values;
      var smsJsonVariables = callflowSmsSubResult[0]._doc.json_variables;
      var smsParamsVariables = callflowSmsSubResult[0]._doc.params_variable;
      // if (smsMsgVariables) {
      //   smsMsgVariables = smsMsgVariables.map(item => data[item] ? data[item] : item);
      // }
      smsJsonVariables = smsJsonVariables.map((item) => {
        if (item == "$phNo") {
          return `${phn_no}`;
        } else {
          return data[item] ? data[item] : item;
        }
      });
      smsParamsVariables = smsParamsVariables.map((item) => {
        var key = Object.keys(item);
        if (item[key] == "$phNo") {
          item[key] = phn_no;
          return item;
        } else {
          return data[item] ? data[item] : item;
        }
      });
      var providerDataSms = await smsProviderModel.find({ _id: templateId });
      let smsMessage;
      if (providerDataSms.length != 0) {
        var providerValuesHeadSms = await smsProviderHead.find({
          sms_table_id: new ObjectId(templateId),
        });
        providerValuesHeadSms = providerValuesHeadSms.reduce((acc, item) => {
          if (item.name && item.value) {
            acc[item.name] = item.value;
          }
          return acc;
        }, {});
        var providerValuesBodySms = await smsProviderBody.find({
          sms_table_id: new ObjectId(templateId),
        });
        if (providerValuesBodySms.length != 0) {
          if (providerDataSms._doc.type != "JSON") {
            var providerValuesBodySms = providerValuesBodySms.reduce(
              (acc, item) => {
                if (item.name && item.value) {
                  acc[item.name] = item.value;
                }
                return acc;
              },
              {}
            );
          }
          // }
          // if (providerDataSms._doc && providerDataSms._doc.message) {
          //   smsMessage = providerDataSms._doc.message.message;
          //   if (smsMessage != undefined) {
          //     smsMessage = smsMessage.replace(/\n/g, '\\n');
          //     function replaceVariables(template, replacements) {
          //       let resultsms = template;
          //       replacements.map((variable, index) => {
          //         resultsms = resultsms.replace('$variable$', variable);
          //       });
          //       return resultsms;
          //     }
          //     var stringSms = replaceVariables(smsMessage, smsMsgVariables);
          //   }

          if (
            providerValuesBodySms != undefined &&
            Object.keys(providerValuesBodySms).length != 0
          ) {
            var url = providerDataSms._doc.url;
            const axiosConfigSms = {
              method: providerDataSms._doc.method.toLowerCase(),
              url: providerDataSms._doc.url,
            };
            if (providerValuesHeadSms) {
              axiosConfigSms.headers = providerValuesHeadSms;
            }
            if (providerDataSms._doc.type == "JSON") {
              var data = {};
              if (providerValuesBodySms != undefined) {
                var str = providerValuesBodySms[0].smsJsonBodyData;
                function replaceVariables(template, replacements) {
                  let resultSms = template;
                  replacements.map((variable, index) => {
                    resultSms = resultSms.replace("$variable$", variable);
                  });
                  return resultSms;
                }
                str = replaceVariables(str, smsTemplateJsonData);
                const value = JSON.parse(str);
                axiosConfigSms.data = value;
              } else {
                axiosConfigSms.data = {};
              }
            } else if (providerDataSms._doc.type == "www-form-urlencode") {
              if (providerValuesBodySms != undefined) {
                var data = {};
                var bodyParams_key = Object.keys(providerValuesBodySms);
                bodyParams_key.map((input_value) => {
                  var value = bodyParams[input_value];
                  if (value == "$message") {
                    function replaceVariables(template, replacements) {
                      let resultSms = template;
                      replacements.map((variable, index) => {
                        resultSms = resultSms.replace("$variable$", variable);
                      });
                      return resultSms;
                    }
                    str = replaceVariables(value, smsParamsVariables);
                    data[input_value] = str;
                  } else {
                    data[input_value] = value;
                  }
                });
                data = qs.stringify(data);
                var header = {
                  "Content-Type": "application/x-www-form-urlencoded",
                };
                axiosConfigSms.data = data;
                axiosConfigSms.headers = header;
              } else {
                axiosConfigSms.data = {};
              }
            } else if (providerDataSms._doc.type == "form-data") {
              var input = new FormData();
              if (providerValuesBodySms != undefined) {
                var bodyParams_key = Object.keys(providerValuesBodySms);
                bodyParams_key.map((input_value) => {
                  var value = bodyParams[input_value];
                  if (value == "$variable$") {
                    function replaceVariables(template, replacements) {
                      let resultSms = template;
                      replacements.map((variable, index) => {
                        resultSms = resultSms.replace("$variable$", variable);
                      });
                      return resultSms;
                    }
                    str = replaceVariables(value, smsParamsVariables);
                    input.append(input_value, str);
                  } else {
                    input.append(input_value, value);
                  }
                });
                axiosConfigSms.data = input;
              } else {
                axiosConfigSms.data = {};
              }
            } else {
              if (providerValuesBodySms != undefined) {
                url += "?";
                var api_data_keys = Object.keys(providerValuesBodySms);
                api_data_keys.map(async (input_value) => {
                  var value = providerValuesBodySms[input_value];
                  if (value == "$variable$") {
                    function replaceVariables(template, replacements) {
                      let resultSms = template;
                      replacements.map((variable, index) => {
                        var key = Object.keys(variable);
                        resultSms = resultSms.replace(
                          "$variable$",
                          variable[key]
                        );
                      });
                      return resultSms;
                    }
                    str = replaceVariables(value, smsParamsVariables);
                    url += input_value + "=" + str + "&";
                  } else {
                    url +=
                      input_value +
                      "=" +
                      providerValuesBodySms[input_value] +
                      "&";
                  }
                });
                axiosConfigSms.url = url;
              }
            }
            console.log(axiosConfigSms);
            return axiosConfigSms;
          }
        } else {
          var err = "Message field is undefined in providerDataSms._doc";
          console.error("Message field is undefined in providerDataSms._doc");
          return err;
        }
      } else {
        var err = "No providerDataSms found with the given ID";
        console.error("No providerDataSms found with the given ID");
        return err;
      }
    } else {
      var err = "smsTemplateId is undefined or falsy";
      console.error("smsTemplateId is undefined or falsy");
      return err;
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};
integration.callflowWhatsappAxiosCall = async (whatsappId) => {
  try {
    var callflowWhatsappSubResult = await callflowSubWhatsapp.find({
      whatsapp_id: whatsappId,
    });
    if (callflowWhatsappSubResult.length != 0) {
      var templateId = callflowWhatsappSubResult[0]._doc.template_id;
      var whatsappMsgVariables =
        callflowWhatsappSubResult[0]._doc.selected_values;
      var whatsappJsonVariables =
        callflowWhatsappSubResult[0]._doc.json_variables;
      var whatsappParamsVariables =
        callflowWhatsappSubResult[0]._doc.params_variable;
      // if (whatsappMsgVariables) {
      //   whatsappMsgVariables = whatsappMsgVariables.map(item => data[item] ? data[item] : item);
      // }
      whatsappJsonVariables = whatsappJsonVariables.map((item) => {
        if (item == "$phNo") {
          return `${phn_no}`;
        } else {
          return data[item] ? data[item] : item;
        }
      });
      whatsappParamsVariables = whatsappParamsVariables.map((item) => {
        var key = Object.keys(item);
        if (item[key] == "$phNo") {
          item[key] = phn_no;
          return item;
        } else {
          return data[item] ? data[item] : item;
        }
      });
      var providerDataWhatsapp = await whatsappProviderModel.find({
        _id: templateId,
      });
      if (providerDataWhatsapp.length != 0) {
        var providerValuesHeadWhatsapp = await whatsappProviderHead.find({
          sms_table_id: new ObjectId(templateId),
        });
        providerValuesHeadWhatsapp = providerValuesHeadWhatsapp.reduce(
          (acc, item) => {
            if (item.name && item.value) {
              acc[item.name] = item.value;
            }
            return acc;
          },
          {}
        );
        var providerValuesBodyWhatsapp = await whatsappProviderBody.find({
          sms_table_id: new ObjectId(templateId),
        });
        if (providerValuesBodyApi.length) {
          smsMessage = providerDataWhatsapp._doc.message.message;
          if (providerDataWhatsapp._doc.type != "JSON") {
            var providerValuesBodySms = providerValuesBodySms.reduce(
              (acc, item) => {
                if (item.name && item.value) {
                  acc[item.name] = item.value;
                }
                return acc;
              },
              {}
            );
          }
          if (
            providerValuesBodyWhatsapp != undefined &&
            Object.keys(providerValuesBodyWhatsapp).length != 0
          ) {
            var url = providerDataWhatsapp._doc.url;
            const axiosConfigWhatsapp = {
              method: providerDataWhatsapp._doc.method.toLowerCase(),
              url: providerDataWhatsapp._doc.url,
            };
            if (providerValuesHeadWhatsapp) {
              axiosConfigWhatsapp.headers = providerValuesHeadWhatsapp;
            }
            if (providerDataWhatsapp._doc.type == "JSON") {
              var data = {};
              if (providerValuesBodyWhatsapp != undefined) {
                var str = providerValuesBodyWhatsapp[0].smsJsonBodyData;
                str = str.replace("$message", stringSms);
                function replaceVariables(template, replacements) {
                  let resultSms = template;
                  replacements.map((variable, index) => {
                    resultSms = resultSms.replace("$variable$", variable);
                  });
                  return resultSms;
                }
                str = replaceVariables(str, smsTemplateJsonData);
                const value = JSON.parse(str);
                axiosConfigWhatsapp.data = value;
              } else {
                axiosConfigWhatsapp.data = {};
              }
            } else if (providerDataWhatsapp._doc.type == "www-form-urlencode") {
              if (providerValuesBodyWhatsapp != undefined) {
                var data = {};
                var bodyParams_key = Object.keys(providerValuesBodyWhatsapp);
                bodyParams_key.map((input_value) => {
                  var value = bodyParams[input_value];
                  if (value == "$message") {
                    data[input_value] = stringSms;
                  } else {
                    if (value == "$variable$") {
                      function replaceVariables(template, replacements) {
                        let resultSms = template;
                        replacements.map((variable, index) => {
                          resultSms = resultSms.replace("$variable$", variable);
                        });
                        return resultSms;
                      }
                      str = replaceVariables(value, smsTemplateParamsData);
                      data[input_value] = str;
                    } else {
                      data[input_value] = value;
                    }
                  }
                });
                data = qs.stringify(data);
                var header = {
                  "Content-Type": "application/x-www-form-urlencoded",
                };
                axiosConfigWhatsapp.data = data;
                axiosConfigWhatsapp.headers = header;
              } else {
                axiosConfigWhatsapp.data = {};
              }
            } else if (providerDataWhatsapp._doc.type == "form-data") {
              var input = new FormData();
              if (providerValuesBodyWhatsapp != undefined) {
                var bodyParams_key = Object.keys(providerValuesBodyWhatsapp);
                bodyParams_key.map((input_value) => {
                  var value = bodyParams[input_value];
                  if (value == "$message") {
                    input.append(input_value, stringSms);
                  } else {
                    if (value == "$variable$") {
                      function replaceVariables(template, replacements) {
                        let resultSms = template;
                        replacements.map((variable, index) => {
                          resultSms = resultSms.replace("$variable$", variable);
                        });
                        return resultSms;
                      }
                      str = replaceVariables(value, smsTemplateParamsData);
                      input.append(input_value, str);
                    } else {
                      input.append(input_value, value);
                    }
                  }
                });
                axiosConfigWhatsapp.data = input;
              } else {
                axiosConfigWhatsapp.data = {};
              }
            } else {
              if (providerValuesBodyWhatsapp != undefined) {
                url += "?";
                var api_data_keys = Object.keys(providerValuesBodyWhatsapp);
                api_data_keys.map(async (input_value) => {
                  var value = providerValuesBodyWhatsapp[input_value];
                  if (value == "$message") {
                    url += input_value + "=" + stringSms + "&";
                  } else {
                    if (value == "$variable$") {
                      function replaceVariables(template, replacements) {
                        let resultSms = template;
                        replacements.map((variable, index) => {
                          resultSms = resultSms.replace("$variable$", variable);
                        });
                        return resultSms;
                      }
                      str = replaceVariables(value, smsTemplateParamsData);
                      url += input_value + "=" + str + "&";
                    } else {
                      url +=
                        input_value +
                        "=" +
                        providerValuesBodyWhatsapp[input_value] +
                        "&";
                    }
                  }
                });
                axiosConfigWhatsapp.url = url;
              }
            }
            console.log(axiosConfigWhatsapp);
            return axiosConfigWhatsapp;
          }
        } else {
          var err = "Message field is undefined in providerDataWhatsapp._doc";
          console.error(
            "Message field is undefined in providerDataWhatsapp._doc"
          );
          return err;
        }
      } else {
        var err = "No providerDataWhatsapp found with the given ID";
        console.error("No providerDataWhatsapp found with the given ID");
        return err;
      }
    } else {
      var err = "smsTemplateId is undefined or falsy";
      console.error("smsTemplateId is undefined or falsy");
      return err;
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};
integration.callflowApiAxiosCall = async (apiId, phn_no) => {
  try {
    var callflowApiSubResult = await callTemplateApiModelSub.find({
      api_id: apiId,
    });
    if (callflowApiSubResult.length != 0) {
      var templateId = callflowApiSubResult[0]._doc.template_id;
      var apiMsgVariables = callflowApiSubResult[0]._doc.selected_values;
      var apiJsonVariables = callflowApiSubResult[0]._doc.json_variables;
      var apiParamsVariables = callflowApiSubResult[0]._doc.params_variable;
      // if (apiMsgVariables) {
      //   apiMsgVariables = apiMsgVariables.map(item => data[item] ? data[item] : item);
      // }
      apiJsonVariables = apiJsonVariables.map((item) => {
        if (item == "$phNo") {
          return `${phn_no}`;
        } else {
          // return data[item] ? data[item] : item;
          return item;
        }
      });
      apiParamsVariables = apiParamsVariables.map((item) => {
        var key = Object.keys(item);
        if (item[key] == "$phNo") {
          item[key] = phn_no;
          return item;
        } else {
          // return data[item] ? data[item] : item;
          return item;
        }
      });
      var providerDataApi = await apiProviderModel.find({ _id: templateId });
      if (providerDataApi.length != 0) {
        var providerValuesHeadApi = await apiProviderHead.find({
          api_table_id: new ObjectId(templateId),
        });
        providerValuesHeadApi = providerValuesHeadApi.reduce((acc, item) => {
          if (item.name && item.value) {
            acc[item.name] = item.value;
          }
          return acc;
        }, {});
        var providerValuesBodyApi = await apiProviderBody.find({
          api_table_id: new ObjectId(templateId),
        });
        if (providerValuesBodyApi.length) {
          if (providerDataApi[0]._doc.type != "JSON") {
            var providerValuesBodyApi = providerValuesBodyApi.reduce(
              (acc, item) => {
                if (item.name && item.value) {
                  acc[item.name] = item.value;
                }
                return acc;
              },
              {}
            );
          }
          if (
            providerValuesBodyApi != undefined &&
            Object.keys(providerValuesBodyApi).length != 0
          ) {
            var url = providerDataApi[0]._doc.url;
            const axiosConfigSms = {
              method: providerDataApi[0]._doc.method.toLowerCase(),
              url: providerDataApi[0]._doc.url,
            };
            if (providerValuesHeadApi) {
              axiosConfigSms.headers = providerValuesHeadApi;
            }
            if (providerDataApi[0]._doc.type == "JSON") {
              var data = {};
              if (providerValuesBodyApi != undefined) {
                var str = providerValuesBodyApi[0].apiJsonBodyData;
                function replaceVariables(template, replacements) {
                  let resultSms = template;
                  replacements.map((variable, index) => {
                    resultSms = resultSms.replace("$variable$", variable);
                  });
                  return resultSms;
                }
                str = replaceVariables(str, apiJsonVariables);
                const value = JSON.parse(str);
                axiosConfigSms.data = value;
              } else {
                axiosConfigSms.data = {};
              }
            } else if (providerDataApi[0]._doc.type == "www-form-urlencode") {
              if (providerValuesBodyApi != undefined) {
                var data = {};
                var bodyParams_key = Object.keys(providerValuesBodyApi);
                bodyParams_key.map((input_value) => {
                  var value = bodyParams[input_value];
                  if (value == "$variable$") {
                    function replaceVariables(template, replacements) {
                      let resultSms = template;
                      replacements.map((variable, index) => {
                        resultSms = resultSms.replace("$variable$", variable);
                      });
                      return resultSms;
                    }
                    str = replaceVariables(value, apiParamsVariables);
                    data[input_value] = str;
                  } else {
                    data[input_value] = value;
                  }
                });

                data = qs.stringify(data);
                var header = {
                  "Content-Type": "application/x-www-form-urlencoded",
                };
                axiosConfigSms.data = data;
                axiosConfigSms.headers = header;
              } else {
                axiosConfigSms.data = {};
              }
            } else if (providerDataApi[0]._doc.type == "form-data") {
              var input = new FormData();
              if (providerValuesBodyApi != undefined) {
                var bodyParams_key = Object.keys(providerValuesBodyApi);
                bodyParams_key.map((input_value) => {
                  var value = bodyParams[input_value];
                  if (value == "$variable$") {
                    function replaceVariables(template, replacements) {
                      let resultSms = template;
                      replacements.map((variable, index) => {
                        resultSms = resultSms.replace("$variable$", variable);
                      });
                      return resultSms;
                    }
                    str = replaceVariables(value, apiParamsVariables);
                    input.append(input_value, str);
                  } else {
                    input.append(input_value, value);
                  }
                });
                axiosConfigSms.data = input;
              } else {
                axiosConfigSms.data = {};
              }
            } else {
              if (providerValuesBodyApi != undefined) {
                url += "?";
                var api_data_keys = Object.keys(providerValuesBodyApi);
                api_data_keys.map(async (input_value) => {
                  var value = providerValuesBodyApi[input_value];
                  if (value == "$variable$") {
                    function replaceVariables(template, replacements) {
                      let resultSms = template;
                      replacements.map((variable, index) => {
                        var key = Object.keys(variable);
                        // variable[key] = phn_no
                        resultSms = resultSms.replace(
                          "$variable$",
                          variable[key]
                        );
                      });
                      return resultSms;
                    }
                    str = replaceVariables(value, apiParamsVariables);
                    url += input_value + "=" + str + "&";
                  } else {
                    url +=
                      input_value +
                      "=" +
                      providerValuesBodyApi[input_value] +
                      "&";
                  }
                });
                axiosConfigSms.url = url;
              }
            }
            console.log(axiosConfigSms);
            return axiosConfigSms;
          }
        } else {
          var err = "Message field is undefined in providerDataApi._doc";
          console.error("Message field is undefined in providerDataApi._doc");
          return err;
        }
      } else {
        var err = "No providerDataApi found with the given ID";
        console.error("No providerDataApi found with the given ID");
        return err;
      }
    } else {
      var err = "smsTemplateId is undefined or falsy";
      console.error("smsTemplateId is undefined or falsy");
      return err;
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};
integration.callFlowAxios = async (axiosConfigApi) => {
  try {
    console.log(axiosConfigApi);
    const axiosResponseApi = await axios(axiosConfigApi);
    console.log(axiosResponseApi.data);
    return axiosResponseApi.data;
  } catch (err) {
    console.log(err);
    return err;
  }
};

integration.sendCrmIntegration = async (data, template_id, selectedTemplateId, template_type) => {
  try {

let templateEmail,emailProviderHead,emailProviderBody
       
    const templateFeilds = await templateFeildsModel.find({
      template_id: template_id,
    });

    const modelMap = {
      1: templateSms,
      2: templateWhatsapp,
      3: templateApi,
      4: templateEmail,
    };
    const providerModelMap = {
      1: smsProviderModel,
      2: whatsappProviderModel,
      3: apiProviderModel,
      4: emailProviderModel,
    };
    const providerHeadMap = {
      1: smsProviderHead,
      2: whatsappProviderHead,
      3: apiProviderHead,
      4: emailProviderHead,
    };
    const providerBodyMap = {
      1: smsProviderBody,
      2: whatsappProviderBody,
      3: apiProviderBody,
      4: emailProviderBody,
    };

    const tableIdMap = {
      1: "sms_table_id",
      2: "whatsapp_table_id",
      3: "api_table_id",
      4: "email_table_id",
    };

    const templateDataKeyMap = {
      1: "smsTemplateData",
      2: "whatsappTemplateData",
      3: "apiTemplateData",
      4: "emailTemplateData",
    };

    const bodyDataKeyMap = {
      1: "smsJsonBodyData",
      2: "whatsappJsonBodyData",
      3: "apiJsonBodyData",
      4: "emailJsonBodyData",
    };

    const model = modelMap[template_type];
    const providerModel = providerModelMap[template_type];
    const providerHeadModel = providerHeadMap[template_type];
    const providerBodyModel = providerBodyMap[template_type];
    const tableId = tableIdMap[template_type];
    const templateDataKey = templateDataKeyMap[template_type];
    const JsonBodyData = bodyDataKeyMap[template_type];

    const templateData = await model.find({ templateId: template_id });

    // const smsData = await templateSms.find({ templateId: template_id });
    const templateFeildsArray = templateFeilds.map((data) => data.field_name);

    if (templateData && templateData.length > 0 ) {
   
      let jsonVariable = templateData?.[0]?.[templateDataKey]?.[0]?.jsonVariables || [];
      if(template_type == 3){
       jsonVariable = templateData?.[0]?.variables || []
      }
      const paramsVariable = templateData?.[0]?.[templateDataKey]?.[0]?.paramsVariables  || [];
      const messageVariable = templateData?.[0]?.[templateDataKey]?.[0]?.variables  || [];


      var providerValuesHead = [];
      var providerValuesBody = [];
      let url
      let axiosConfig = {};
      let Message

      if (selectedTemplateId) {
        var provider = await providerModel.findById(selectedTemplateId);
        if (provider) {
          providerValuesHead = await providerHeadModel.find({
            [tableId]: new ObjectId(selectedTemplateId),
          });
          providerValuesBody = await providerBodyModel.find({
            [tableId]: new ObjectId(selectedTemplateId),
          });


          if (providerValuesHead) {
          const resultHeader = providerValuesHead.reduce((acc, obj) => {
            acc[obj.name ] = obj.value;
            return acc;
          }, {});

            url = provider._doc.url
            axiosConfig.headers = resultHeader;
            axiosConfig.method = provider._doc.method.toLowerCase()
          }

            Message = provider?._doc?.message?.message?provider._doc.message.message:''
        } else {
          var err = "No providersms found with the given ID";
          console.error("No providersms found with the given ID");
          return err;
        }
      } else {
        var err = "smsTemplateId is undefined or falsy";
        console.error("smsTemplateId is undefined or falsy");
        return err;
      }

      var replacements = {
        $name: data.name,
        $phNo: data.phnNo,
        $email: data.email,
        $date: data.date,
        $status: data.status,
        $leadNo: data.lead_id?.toString(),
        $customerNo: data.customer_id?.toString(),
        $ticketNo: data.ticket_id?.toString(),
      };
      templateFeildsArray.forEach((field) => {
        replacements[`$${field}`] = data[field];
      });

      var string = "";

       axiosConfig.url = replaceTemplateVariables(url, replacements);

        let index = 0;
        Message = Message.replace(/\$variable\$/g, () => '$' + messageVariable[index++] || '');

        function replaceTemplateVariables(Message, replacements) {
            let result = Message;

            Object.keys(replacements).forEach((key) => {
              const value = replacements[key];
              if (value !== undefined && value !== null) {
                result = result.replaceAll(key, value);
              }
            });

            return result;
          }

         string = replaceTemplateVariables(Message, replacements);

      let type = provider._doc.type
      let varableCount = 0;

      if (type == "JSON") {
        let jsonData;

        if (providerValuesBody != undefined) {
          var str = providerValuesBody?.[0]?.[JsonBodyData] || "";
          str = str.replace("$message", string);
          function replaceVariables(template, replacements) {
            let resultSms = template;
            replacements.map((variable, index) => {
              variable = `$${variable}`;
              resultSms = resultSms.replace("$variable$", variable);
            });
            return resultSms;
          }
          str = replaceVariables(str, jsonVariable);
          jsonData = JSON.parse(str);
        }

        const replacePlaceholders = (obj, replacements) => {
          return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => {
              const trimmedValue = value.trim();
              return [key, replacements[trimmedValue] || value];
            })
          );
        };

        var data = replacePlaceholders(jsonData, replacements);
        axiosConfig.data = data;
      } else if (type == "www-form-urlencode") {
        var providerValuesBody = providerValuesBody.reduce((acc, item) => {
          if (item.name && item.value) {
            acc[item.name] = item.value;
          }
          return acc;
        }, {});

        if (providerValuesBody != undefined) {
          var data = {};
          var bodyParams_key = Object.keys(providerValuesBody);
          bodyParams_key.map((input_value) => {
            var value = providerValuesBody[input_value];

            if (value == "$message") {
              data[input_value] = string;
            } else {
              if (value == "$variable$") {
                function replaceVariables(template, replacements) {
                  let result = template;
                  result = result.replace(
                    "$variable$",
                    `$${replacements[varableCount].variable}`
                  );
                  varableCount++;
                  return result;
                }
                str = replaceVariables(value, paramsVariable);
                data[input_value] = str;
              } else {
                data[input_value] = value;
              }
            }
          });

          const replacePlaceholders = (obj, replacements) => {
            return Object.fromEntries(
              Object.entries(obj).map(([key, value]) => {
                const trimmedValue = value.trim();
                return [key, replacements[trimmedValue] || value];
              })
            );
          };

          data = replacePlaceholders(data, replacements);
          data = qs.stringify(data);
          var header = {
            "Content-Type": "application/x-www-form-urlencoded",
          };
          axiosConfig.data = data;
          axiosConfig.headers = header;
        } else {
          axiosConfig.data = {};
        }
      } else if (type === "form-data") {
        providerValuesBody = providerValuesBody.reduce((acc, item) => {
          if (item.name && item.value) {
            acc[item.name] = item.value;
          }
          return acc;
        }, {});

        const input = new FormData();
        let data = {};

        if (providerValuesBody !== undefined) {
          const bodyParamKeys = Object.keys(providerValuesBody);
                function replaceVariables(template, replacements) {
                  let result = template;
                  result = result.replace(
                    "$variable$",
                    `$${replacements[varableCount].variable}`
                  );
                  varableCount++;
                  return result;
                }

          const replacePlaceholders = (obj, replacements) => {
            return Object.fromEntries(
              Object.entries(obj).map(([key, value]) => {
                if (typeof value === "string") {
                  const trimmedValue = value.trim();
                  return [key, replacements[trimmedValue] || value];
                }
                return [key, value];
              })
            );
          };

          bodyParamKeys.forEach((key) => {
            const value = providerValuesBody[key];

            if (value === "$message") {
              input.append(key, string);
              data[key] = string;
            } else if (value === "$variable$") {
              const replacedValue = replaceVariables(value, paramsVariable);
              input.append(key, replacedValue);
              data[key] = replacedValue;
            } else if (Array.isArray(value)) {
              value.forEach((filePath) => {
                input.append(key, fs.createReadStream(filePath));
              });
              data[key] = value;
            } else {
              input.append(key, value);
              data[key] = value;
            }
          });

          data = replacePlaceholders(data, replacements);
          Object.entries(data).forEach(([key, value]) => {
            input.append(key, value);
          });

          axiosConfig.data = input;
        } else {
          axiosConfig.data = {};
        }
      } else {
        providerValuesBody = providerValuesBody.reduce((acc, item) => {
          if (item.name && item.value) {
            acc[item.name] = item.value;
          }
          return acc;
        }, {});

        if (providerValuesBody != undefined) {
          url += "?";
          var api_data_keys = Object.keys(providerValuesBody);
          api_data_keys.map(async (input_value) => {
            var value = providerValuesBody[input_value];
            if (value == "$message") {
              url += input_value + "=" + string + "&";
            } else {
              if (value === "$variable$") {
                function replaceVariables(template, replacements) {
                  let result = template;
                  result = result.replace(
                    "$variable$",
                    `$${replacements[varableCount].variable}`
                  );
                  varableCount++;
                  return result;
                }
                str = replaceVariables(value, paramsVariable);
                url += input_value + "=" + str + "&";
              } else {
                url +=
                  input_value + "=" + providerValuesBody[input_value] + "&";
              }
            }
          });

          function replaceTemplateVariables(template, replacements) {
            let result = template;

            Object.keys(replacements).forEach((key) => {
              const value = replacements[key];
              if (value !== undefined && value !== null) {
                result = result.replaceAll(key, value);
              }
            });

            return result;
          }
          axiosConfig.url = replaceTemplateVariables(url, replacements);
        }
      }


        console.log(axiosConfig);
        const axiosResponseSms = await axios(axiosConfig);
        console.log(axiosResponseSms.data);
        return axiosResponseSms.data;

    } else {
      var err = "error :  no sms template found";
      console.log("error :  no sms template found");
      return err;
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = integration;
