const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || "Internal Server Error"

  // handle AppError
  if (err instanceof Error) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: err.error || null,
      data: null
    })
  }

  // fallback
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: null,
    data: null
  })
}

export default errorHandler
