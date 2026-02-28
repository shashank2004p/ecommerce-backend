/**
 * Standard API response helpers.
 * Format: { success, message, data }
 */
export function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
}

export function error(res, message = 'Something went wrong', statusCode = 500, data = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: data ?? null,
  });
}
