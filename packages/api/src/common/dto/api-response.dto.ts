/**
 * Generic API Response DTO
 *
 * Standardizes all API responses across the application
 * @template T The data payload type
 */
export class ApiResponseDto<T> {
  /**
   * Indicates if the request was successful
   */
  success: boolean;

  /**
   * HTTP status code
   */
  statusCode: number;

  /**
   * Human-readable message describing the response
   */
  message: string;

  /**
   * The actual payload data
   * Can be null for delete operations
   */
  data: T | null;

  /**
   * ISO 8601 timestamp when the response was generated
   */
  timestamp: string;

  /**
   * Constructor to build a response
   */
  constructor(
    success: boolean,
    statusCode: number,
    message: string,
    data: T | null = null,
  ) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}
