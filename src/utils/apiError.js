class apiError extends Error {
  constructor(
    stausCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.stausCode = stausCode;
    this.message = message;
    this.succes = false;
    this.errors = errors;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default apiError;
