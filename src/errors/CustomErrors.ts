export class NotFoundError extends Error {
  public name = 'Not_Found_Error';
  public statusCode = 404;
  constructor(message: string) {
    super(message);
  }
}

export class BadRequestError extends Error {
  public name = 'Bad_Request_Error';
  public statusCode = 400;
  constructor(message: string) {
    super(message);
  }
}
