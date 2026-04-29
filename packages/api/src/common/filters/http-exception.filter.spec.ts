import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';

import { HttpExceptionFilter } from './http-exception.filter';

type ResponseMock = {
  status: jest.Mock;
  json: jest.Mock;
};

type RequestMock = {
  url: string;
  method: string;
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

describe('HttpExceptionFilter', () => {
  const request: RequestMock = { url: '/test/path', method: 'GET' };
  let response: ResponseMock;
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    filter = new HttpExceptionFilter();
  });

  test('happy path: extracts message from a plain string HttpException response', () => {
    const host = createHttpHost(request, response);
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    const payload = (response.json.mock.calls as unknown[][])[0][0] as Record<
      string,
      unknown
    >;
    expect(payload).toEqual(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
        path: '/test/path',
      }),
    );
    expect(payload).toHaveProperty('timestamp');
  });

  test('happy path: extracts message from object response with string `message`', () => {
    const host = createHttpHost(request, response);
    const exception = new HttpException(
      { message: 'Validation failed' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Validation failed' }),
    );
  });

  test('happy path: extracts first element when message is an array (validation errors)', () => {
    const host = createHttpHost(request, response);
    const exception = new HttpException(
      { message: ['First error', 'Second error'] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'First error' }),
    );
  });

  test('sad path: falls back to "Internal Server Error" when message cannot be extracted', () => {
    const host = createHttpHost(request, response);
    const exception = new HttpException(
      { custom: 'no-message-field' },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Internal Server Error' }),
    );
  });

  test('preserves additional structured fields from custom exceptions (Issue #798 — Codex P1)', () => {
    const host = createHttpHost(request, response);
    const exception = new UnprocessableEntityException({
      message: 'Product is not a beer.',
      errorCode: 'NOT_A_BEER',
      barcode: '5449000000996',
      productName: 'Coca-Cola Original',
    });

    filter.catch(exception, host);

    const payload = (response.json.mock.calls as unknown[][])[0][0] as Record<
      string,
      unknown
    >;
    expect(payload).toEqual(
      expect.objectContaining({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Product is not a beer.',
        errorCode: 'NOT_A_BEER',
        barcode: '5449000000996',
        productName: 'Coca-Cola Original',
        path: '/test/path',
      }),
    );
  });

  test('edge case: ignores reserved keys (statusCode, error, timestamp, path) when present in exception payload', () => {
    const host = createHttpHost(request, response);
    const exception = new HttpException(
      {
        message: 'spoofed',
        statusCode: 999,
        error: 'spoofed',
        timestamp: 'spoofed',
        path: 'spoofed',
        legitimateExtra: 'kept',
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    const payload = (response.json.mock.calls as unknown[][])[0][0] as Record<
      string,
      unknown
    >;
    // Spoofed reserved fields must NOT override the canonical envelope
    expect(payload.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(payload.path).toBe('/test/path');
    expect(payload.timestamp).not.toBe('spoofed');
    // The non-reserved extra is preserved
    expect(payload.legitimateExtra).toBe('kept');
  });
});
