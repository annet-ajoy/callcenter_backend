const moment = require("moment-timezone");

/**
 * Returns the start and end of a given period (day, week, month) in IST, converted to UTC.
 * @param {string} date - The date in "YYYY-MM-DD" format.
 * @param {string} type - The type of period: "day", "week", or "month".
 * @returns {Object} - An object containing the start and end of the period in UTC.
 */
function getRangeInIST(date, type = "day") {
  try {
    const timezone = "Asia/Kolkata"; // IST time zone

    const momentDate = moment(date, "YYYY-MM-DD", true);

    // If not strict format, check for ISO and convert
    if (momentDate.isValid()) {
      // Already in YYYY-MM-DD
      date = momentDate.format("YYYY-MM-DD");
    } else if (moment(date).isValid()) {
      // Accept ISO format, convert to YYYY-MM-DD
      date = moment(date).format("YYYY-MM-DD");
    } else {
      return date
    }

    // Validate type
    const validTypes = ["day", "week", "month"];
    if (!validTypes.includes(type)) {
      throw new Error(
        `Invalid type. Valid types are: ${validTypes.join(", ")}.`
      );
    }

    // Calculate start and end of the period in IST, then convert to UTC
    const startOfPeriod = moment.tz(date, timezone).startOf(type).toDate();
    const endOfPeriod = moment.tz(date, timezone).endOf(type).toDate();

    return { startOfPeriod, endOfPeriod };
  } catch (error) {
    return date
  }
}

module.exports = getRangeInIST;