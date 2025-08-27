class ApiResponse {
    constructor(statusCode, data, message = "Success") {
      this.statusCode = statusCode;
      this.result = data;
      this.message = message;
      this.status = statusCode < 400;
    }
  }
  
  module.exports = ApiResponse;
  