const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.code === 11000) {
    error.message = 'An account with that email or username already exists.';
    return res.status(400).json({ success: false, message: error.message });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }), // Hide stack trace in prod[cite: 10]
  });
};

module.exports = errorHandler;