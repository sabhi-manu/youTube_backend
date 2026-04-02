import rateLimit from "express-rate-limit";

// "express-rate-limit returns a middleware function that internally calls next()

const loginRateLimit = rateLimit({
     windowMs: 1 * 60 * 1000, // 1 minute
    max: 7, // limit each IP
    message: {
        success: false,
        message: "Too many login attempts. Try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
})

export default loginRateLimit