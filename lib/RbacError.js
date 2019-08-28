class RbacError extends Error {
  constructor(...args) {
    super(...args);

    Error.captureStackTrace(this, this.constructor);

    this.message = args[0] || 'Internal Rbac Error';
    this.name = 'RbacError';
  }
}

module.exports = RbacError;