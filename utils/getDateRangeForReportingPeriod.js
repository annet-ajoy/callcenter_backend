const moment = require("moment-timezone");
const UserSettings = require("../model/userSettingsModel");
const getRangeInIST = require("./convertDateToISTRange");

/*
 * The admin sets a reporting period for users. 
 * Users can only view data from the past days within the specified reporting period.
 */

async function getDateRangeForReportingPeriod(userId, startDate, endDate) {
  try {
    const timezone = "Asia/Kolkata"; // IST time zone

    const user = await UserSettings.findOne({
      where: { user_id: userId },
      attributes: ["id", "reporting_period", "reporting_period_days"],
    });

    if (!user) {
      return false;
    }

    startDate = startDate?.split(" ")[0] || startDate;
    const { startOfPeriod: providedStartDate } = getRangeInIST(startDate,"day");

    // Calculate default startOfPeriod
    let startOfPeriod = moment()
      .tz(timezone)
      .subtract((user.reporting_period_days || 30) - 1, "days")
      .startOf("day")
      .toDate();

    startOfPeriod =
      providedStartDate > startOfPeriod ? providedStartDate : startOfPeriod;

    return {
      startOfPeriod: moment(startOfPeriod)
        .tz(timezone)
        .format("YYYY-MM-DD HH:mm:ss"),
      endOfPeriod: endDate,
    };
  } catch (error) {
    console.error("Error in getDateRangeForReportingPeriod:", error);
    return false;
  }
}

module.exports = getDateRangeForReportingPeriod;
