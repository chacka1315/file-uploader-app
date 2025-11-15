export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'Not_Found_Error';
    this.statusCode = 404;
  }
}

export class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'Bad_Request_Error';
    this.statusCode = 400;
  }
}
