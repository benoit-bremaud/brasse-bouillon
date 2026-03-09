import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

import { AllExceptionsFilter } from './all-exceptions.filter';

type ResponseMock = {
  status: jest.Mock;
  json: jest.Mock;
};

type RequestMock = {
  url: string;
};

const createHttpHost = (
  request: RequestMock,
  response: ResponseMock,
): ArgumentsHost =>
  ({
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  }) as unknown as ArgumentsHost;

describe('AllExceptionsFilter', () => {
  const request: RequestMock = { url: '/test/path' };
  let response: ResponseMock;
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    filter = new AllExceptionsFilter();
  });

  test('happy path: returns HttpException message for client errors', () => {
    const host = createHttpHost(request, response);
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        path: '/test/path',
      }),
    );
  });

  test('sad path: falls back to generic message for unknown non-error exceptions', () => {
    const host = createHttpHost(request, response);

    filter.catch({ unexpected: true }, host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });

  test('edge case: handles HttpException array message by returning first string', () => {
    const host = createHttpHost(request, response);
    const exception = new HttpException(
      { message: ['First validation message', 'Second message'] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'First validation message',
      }),
    );
  });
});
