export function errorHandler(err, req, res, next) {
  console.error('❌ Server Error:', err);

  // Fabric-specific errors
  if (err.message.includes('Endorsement')) {
    return res.status(400).json({
      error: 'Blockchain endorsement failed',
      details: err.message,
      type: 'ENDORSEMENT_ERROR'
    });
  }

  if (err.message.includes('Connection')) {
    return res.status(503).json({
      error: 'Blockchain network unavailable',
      details: 'Unable to connect to Hyperledger Fabric network',
      type: 'NETWORK_ERROR'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid authentication token',
      type: 'AUTH_ERROR'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Invalid input data',
      details: err.message,
      type: 'VALIDATION_ERROR'
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    type: 'SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
}