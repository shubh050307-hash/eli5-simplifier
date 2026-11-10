function errorHandler(error, req, res, next) {
  const status = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const message = status >= 500 && !error.code
    ? 'Something went wrong on the server. Please try again.'
    : error.message;

  if (status >= 500) console.error('Request failed:', error.message);
  res.status(status).json({ success: false, error: message });
}

module.exports = errorHandler;
