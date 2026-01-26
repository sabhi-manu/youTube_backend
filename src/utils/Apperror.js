class AppError extends Error{
    constructor( message = "Something went wrong",
    statusCode = 500,error=null){
        super(message)
        this.statusCode = statusCode,
        this.error = error,
        this.success = false,
        this.data = null
    }
}
export default AppError