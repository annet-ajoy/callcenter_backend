const sequelize = require('../database').getConnection;


async function rate_calculation(data) {
    try {
      var did = data.did;
      var type = data.destinationType;
      var id_user = data.id_user;
      var totalCallDuration = data.totalCallDuration;
      var secndLegDuration = data.secndLegDuration
      var contact_number = data.contact_number;
      var digit_6 = contact_number.toString().substring(0, 6);
      var digit_5 = contact_number.toString().substring(0, 5);
      var digit_4 = contact_number.toString().substring(0, 4);
      var digit_3 = contact_number.toString().substring(0, 3);
      var digit_2 = contact_number.toString().substring(0, 2);
      // if(data.callType != 'Internal' && data.callType != 'Transfer'){
      //   var did_digit_6 = did.toString().substring(0, 6);
      //   var did_digit_5 = did.toString().substring(0, 5);
      //   var did_digit_4 = did.toString().substring(0, 4);
      //   var did_digit_3 = did.toString().substring(0, 3);
      //   var did_digit_2 = did.toString().substring(0, 2);
      // }else{
      //   return 0
      // }
      console.log(did)
      console.log(contact_number)
      console.log(type)
      if (type == 'pstn') {
        var didSql = `SELECT pricing_plan,id_pay_per_calls_plans,fwd_call_ratecard_id,telecom_provider.byot FROM did left join telecom_provider on telecom_provider.id = did.fwd_provider where did = '${did}'`;
        var [didRes] = await sequelize.query(didSql);
        console.log("did result in billing pstn -------------->",didRes)
        if (did.length != 0) {
          if(didRes[0].pricing_plan == 0 && didRes[0].id_pay_per_calls_plans == 2){
            return 0
          }else{
            if (didRes[0].byot == 0) {
              if (didRes[0].pricing_plan == 1) {
                var ratecard_id = didRes[0].fwd_call_ratecard_id;
                var sql = `SELECT incoming_call_cost,incoming_pulse FROM pay_per_calls_plans WHERE id = '${didRes[0].id_pay_per_calls_plans}'`
                var [incomingCallCost] = await sequelize.query(sql);
                if (incomingCallCost.length != 0) {
                  var rateCalculation = await incoming_rate_calculation(totalCallDuration, incomingCallCost[0].incoming_call_cost, incomingCallCost[0].incoming_pulse)
                } else {
                  var rateCalculation = 0
                }
                var rate = await calculate_rate(ratecard_id, totalCallDuration, id_user, digit_2, digit_3, digit_4, digit_5, digit_6)
                rate = rate + rateCalculation;
                return rate
              } else {
                if (digit_2 == "91") {
                  ratecard_id = 0
                  return 0
                } else {
                  ratecard_id = didRes[0].fwd_call_ratecard_id;
                  var rate = await calculate_rate(ratecard_id, totalCallDuration, id_user, digit_2, digit_3, digit_4, digit_5, digit_6)
                  return rate
                }
              }
            } else {
              return 0
            }
          }
        }
      } else if (type == 'sip') {
        var didSql = `SELECT pricing_plan,id_pay_per_calls_plans,id_pay_per_channel_plans,outgoing_call_ratecard_id,telecom_provider.byot FROM did left join telecom_provider on telecom_provider.id = did.outgoing_provider where did like '${did}'`;
        var [didRes] = await sequelize.query(didSql);
        console.log(didRes)
        if (did.length != 0) {
          var customerSql = `SELECT free_minutes FROM customers WHERE id = '${id_user}'`;
          var [customerRes] = await sequelize.query(customerSql);
          console.log(customerRes)
          if (customerRes.length != 0) {
            if (didRes[0].byot == 0) {
              if (didRes[0].pricing_plan == 1) {
                var ratecard_id = didRes[0].outgoing_call_ratecard_id
              } else {
                if (digit_2 == "91") {
                  ratecard_id = 0
                  return 0
                } else {
                  ratecard_id = didRes[0].outgoing_call_ratecard_id
                }
              }
              if (customerRes[0].free_minutes == 0) {
                var rate = await calculate_rate(ratecard_id, totalCallDuration, id_user, digit_2, digit_3, digit_4, digit_5, digit_6)
                return rate
              } else {
                var rate = await calculate_rate_for_demo( totalCallDuration, id_user)
                return rate
              }
            } else {
              return 0
            }

          }
        }
      } else if (type == 'incoming') {
        var didSql = `SELECT pricing_plan,id_pay_per_calls_plans,id_pay_per_channel_plans,outgoing_call_ratecard_id FROM did where did like '${did}'`;
        var [didRes] = await sequelize.query(didSql);
        if (didRes[0].pricing_plan == 1) {
          // var ratecard_id = didRes[0].id_pay_per_calls_plans
          var sql = `SELECT incoming_call_cost,incoming_pulse FROM pay_per_calls_plans WHERE id = '${didRes[0].id_pay_per_calls_plans}'`
          var [incomingCallCost] = await sequelize.query(sql);
          if (incomingCallCost.length != 0) {
            var rateCalculation = await incoming_rate_calculation(totalCallDuration, incomingCallCost[0].incoming_call_cost, incomingCallCost[0].incoming_pulse)
            return rateCalculation
          } else {
            return 0
          }
        } else {
          return 0
        }
      } else if (type == "clickToCallDestination") {
        var didSql = `SELECT pricing_plan,id_pay_per_calls_plans,id_pay_per_channel_plans,outgoing_call_ratecard_id,telecom_provider.byot FROM did left join telecom_provider on telecom_provider.id = did.fwd_provider where did like '${did}'`;
        var [didRes] = await sequelize.query(didSql);
        if (did.length != 0) {
          var customerSql = `SELECT free_minutes FROM customers WHERE id = '${id_user}'`;
          var [customerRes] = await sequelize.query(customerSql);
          if (customerRes.length != 0) {
            if (didRes[0].byot == 0) {
              if (didRes[0].pricing_plan == 1) {
                var ratecard_id = didRes[0].outgoing_call_ratecard_id
              } else {
                if (digit_2 == "91") {
                  ratecard_id = 0
                  return 0
                } else {
                  ratecard_id = didRes[0].outgoing_call_ratecard_id
                }
              }
              if (customerRes[0].free_minutes == 0) {
                var frstleg = await calculate_rate(ratecard_id, totalCallDuration, id_user, digit_2, digit_3, digit_4, digit_5, digit_6)
                if (secndLegDuration != 0) {
                  var secndLegRate = await calculate_rate(ratecard_id, secndLegDuration, id_user, digit_2, digit_3, digit_4, digit_5, digit_6)
                  let totalCost = Number(frstleg) + Number(secndLegRate)
                  return totalCost
                } else {
                  return frstleg
                }
              }else{
                  var rate = await calculate_rate_for_demo( totalCallDuration, id_user)
                  return rate
              }
            } else {
              return 0
            }
          }
        }
      } else if(type == 'clickToCallSource'){
        var didSql = `SELECT pricing_plan,id_pay_per_calls_plans,id_pay_per_channel_plans,outgoing_call_ratecard_id,telecom_provider.byot FROM did left join telecom_provider on telecom_provider.id = did.fwd_provider where did like '${did}'`;
        var [didRes] = await sequelize.query(didSql);
        if (did.length != 0) {
          var customerSql = `SELECT free_minutes FROM customers WHERE id = '${id_user}'`;
          var [customerRes] = await sequelize.query(customerSql);
          if (customerRes.length != 0) {
            if (didRes[0].byot == 0) {
              if (didRes[0].pricing_plan == 1) {
                var ratecard_id = didRes[0].outgoing_call_ratecard_id
              } else {
                if (digit_2 == "91") {
                  ratecard_id = 0
                  return 0
                } else {
                  ratecard_id = didRes[0].outgoing_call_ratecard_id
                }
              }
              if (customerRes[0].free_minutes == 0) {
                var frstleg = await calculate_rate(ratecard_id, totalCallDuration, id_user, digit_2, digit_3, digit_4, digit_5, digit_6)
                return frstleg
            }else{
                  var rate = await calculate_rate_for_demo( totalCallDuration, id_user)
                  return rate
              }
            } else {
              return 0
            }
          }
        }
      }
    }
    catch (err) {
      console.log(err);
    }
}
async function calculate_rate(ratecard_id,totalCallDuration,id_user,digit_2,digit_3,digit_4,digit_5,digit_6) {
  try {
    console.log("ratecard_id  ---->",ratecard_id)
    var RateSql = `SELECT prefix,sellrate,pulse FROM rates WHERE rates.id_ratecard = ${ratecard_id}`;
    var [customerRate] = await sequelize.query(RateSql);
    console.log("customerRate  ---->",customerRate)
    if (customerRate.length != 0) {
      var creditValueData = customerRate.find(item => item.prefix == digit_6);
      if (!creditValueData)
        var creditValueData = customerRate.find(item => item.prefix == digit_5);
      if (!creditValueData)
        var creditValueData = customerRate.find(item => item.prefix == digit_4);
      if (!creditValueData)
        var creditValueData = customerRate.find(item => item.prefix == digit_3);
      if (!creditValueData)
        var creditValueData = customerRate.find(item => item.prefix == digit_2);
      var trans_1creditsecSql = `select balance as trans_credit,credit_limit as trans_creditLimit from customers where id = ${id_user}`;
      var [trans_1creditsecRes] = await sequelize.query(trans_1creditsecSql);
      console.log("creditValueData  ---->",creditValueData)
      console.log("totalCallDuration  ---->",totalCallDuration)
      if (trans_1creditsecRes.length != 0) {
        if (!creditValueData) {
          var pulse = 0;
        } else {
          var pulse = creditValueData.pulse;
        }
        var trans1secValue = Number(totalCallDuration) / Number(pulse);

        console.log("totalCallDuration / pulse  ---->",trans1secValue)
        function customRound(number) {
          const decimalPart = number % 1;
          const integerPart = Math.floor(number);
          if (decimalPart >= 0.0 && decimalPart != 0 && decimalPart <= 0.5) {
            return integerPart + 1;
          } else if (decimalPart >= 0.6 && decimalPart <= 0.9) {
            return integerPart + 1;
          } else {
            return Math.round(number);
          }
        }
        var trans1secValueRes = customRound(trans1secValue);
        if (trans1secValueRes == 0) {
          trans1secValueRes = 1
        }
        console.log("trans1secValueRes  ---->",trans1secValueRes)
        trans1secValueRes = trans1secValueRes * creditValueData.sellrate
        if (trans1secValueRes > trans_1creditsecRes[0].trans_credit) {
          if (trans1secValueRes < trans_1creditsecRes[0].trans_creditLimit) {
            var transValue = trans_1creditsecRes[0].trans_creditLimit - trans1secValueRes;
            var customerSql = `update customers set credit_limit = '${transValue}' where id = ${id_user}`;
            var [customerRes] = await sequelize.query(customerSql);
            return trans1secValueRes
          } else {
            if (trans_1creditsecRes[0].trans_creditLimit > 0) {
              var transValue = trans_1creditsecRes[0].trans_creditLimit - trans1secValueRes;
              var customerSql = `update customers set credit_limit = '${transValue}' where id = ${id_user}`;
              var [customerRes] = await sequelize.query(customerSql);
              return trans1secValueRes
            } else {
              var trans1secValueRes = 0;
              return trans1secValueRes
            }
          }
        } else {
          var transValue = trans_1creditsecRes[0].trans_credit - trans1secValueRes;
          var customerSql = `update customers set balance = '${transValue}' where id = ${id_user}`;
          var [customerRes] = await sequelize.query(customerSql);
          return trans1secValueRes
        }
      } else {
        var trans1secValueRes = 0;
        return trans1secValueRes
      }
    }else{
      return 0
    }
  }
  catch (err) {
    console.log(err);
  }
}
async function calculate_rate_for_demo(totalCallDuration,id_user) {
  try {
      var trans_1creditsecSql = `select free_minutes from customers where id = ${id_user}`;
      var [trans_1creditsecRes] = await sequelize.query(trans_1creditsecSql);
      console.log("totalCallDuration  ---->",totalCallDuration)
      if (trans_1creditsecRes.length != 0) {
        var trans1secValue = Number(totalCallDuration) / 60;
        console.log("totalCallDuration with min ---->",trans1secValue)
        function customRound(number) {
          const decimalPart = number % 1;
          const integerPart = Math.floor(number);
          if (decimalPart >= 0.0 && decimalPart != 0 && decimalPart <= 0.5) {
            return integerPart + 1;
          } else if (decimalPart >= 0.6 && decimalPart <= 0.9) {
            return integerPart + 1;
          } else {
            return Math.round(number);
          }
        }
        var trans1secValueRes = customRound(trans1secValue);
        if (trans1secValueRes == 0) {
          trans1secValueRes = 1
        }
        console.log("total min after round ---->",trans1secValueRes)
        var transValue = trans_1creditsecRes[0].free_minutes - trans1secValueRes;
        var customerSql = `update customers set free_minutes = '${transValue}' where id = ${id_user}`;
        var [customerRes] = await sequelize.query(customerSql);
        return trans1secValueRes
      
    }else{
      return 0
    }
  }
  catch (err) {
    console.log(err);
  }
}
async function incoming_rate_calculation(totalCallDuration,incoming_call_cost,incoming_pulse) {
  try {
    var pulse = incoming_pulse
    console.log("pulse  ---->", pulse)
    var trans1secValue = Number(totalCallDuration) / Number(pulse);

    console.log("totalCallDuration / pulse  ---->", trans1secValue)
    function customRound(number) {
      const decimalPart = number % 1;
      const integerPart = Math.floor(number);
      if (decimalPart >= 0.0 && decimalPart != 0 && decimalPart <= 0.5) {
        return integerPart + 1;
      } else if (decimalPart >= 0.6 && decimalPart <= 0.9) {
        return integerPart + 1;
      } else {
        return Math.round(number);
      }
    }
    var trans1secValueRes = customRound(trans1secValue);
    if (trans1secValueRes == 0) {
      trans1secValueRes = 1
    }
    console.log("trans1secValueRes  ---->", trans1secValueRes)
    trans1secValueRes = trans1secValueRes * incoming_call_cost;
    return trans1secValueRes
  }
  catch (err) {
    console.log(err);
  }
}
module.exports = { rate_calculation };
