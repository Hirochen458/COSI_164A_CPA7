const httpStatus = require("http-status-codes");//error handling
exports.logErrors = (error,req, res,next) => {
  console.error(error.stack);
  next(error);//pass to next middleware
};
//404
exports.pageNotFoundError = (req, res) => {
  let errorCode = httpStatus.NOT_FOUND;
  res.status(errorCode);//set the HTTP status for the response
  res.render("error",{layout: false});
};
//500
exports.internalServerError = (error, req, res, next) => {
  let errorCode = httpStatus.INTERNAL_SERVER_ERROR;
  console.log(`ERROR occurred: ${error.stack}`);
  res.status(errorCode);//set the HTTP status for the response
  res.send(`${errorCode} | Sorry, our application is taking a nap!`);
  //sends the HTTP response. The body parameter can be a String or a Buffer object or an object or an Array.
};
