const AppError = require('./../utils/appError');

// DB errors
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDulicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  // console.log(value);
  const message = `Duplicate field value : ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// --------------------------------------------------------------------------------------------------------

// JWT ERRORS

const handleJWTError = () =>
  new AppError('❌ Invalid Token!! Please Login Again', 401);

const handleJWTExpiredError = () =>
  new AppError('⏱ Your Token has expired!! Please Login Again', 401);
// --------------------------------------------------------------------------------------------------------

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }
  // RENDERED WEBSITE
  console.error('Error 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!!',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });

      // Programming or other unknown error : don't leak details to the client
    }
    //   1) Log Error
    console.error('Error 💥', err);

    // 2) Send genric message to client
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  //  Rendered WEBSITE

  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!!',
      msg: err.message
    });

    // Programming or other unknown error : don't leak details to the client
  } else {
    //   1) Log Error
    console.error('Error 💥', err);

    // 2) Send genric message to client
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!!',
      msg: 'Please try again later'
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDulicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);

    sendErrorProd(error, req, res);
  }
};
