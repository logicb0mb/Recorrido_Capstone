class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // so that we send only operational errors to client and not programming errors as they will not have this set to true
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
