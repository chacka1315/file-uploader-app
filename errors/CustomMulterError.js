class CustomMulterError {
  #messages = {
    LIMIT_PART_COUNT: 'Too many parts in the request.',
    LIMIT_FILE_SIZE: 'One or more uploaded file is too large.',
    LIMIT_FILE_COUNT: 'Too many files sent in the one request',
    LIMIT_FIELD_KEY: 'The field name is too long.',
    LIMIT_FIELD_VALUE: 'Field value too long',
    LIMIT_FIELD_COUNT: 'Too many form fields were sent.',
    LIMIT_UNEXPECTED_FILE: 'Unexpected file field detected.',
    MISSING_FIELD_NAME: 'Field name missing',
  };

  constructor(errCode) {
    this.msg =
      this.#messages[errCode] ||
      'Unknown error occurred during file upload, try later.';
    this.statusCode = 422;
  }
}

export default CustomMulterError;
