import User from "../models/user.model.js"

async function generateTokens(userId) {
    console.log('check the user id ==>', userId)
    try {
        const user = await User.findById(userId)
         if (!user) {
            throw new AppError("User not found", 404)
        }

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        console.log('check token ==>', accessToken, ' ', refreshToken)
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        console.log('user check ==>', user)

        return { accessToken, refreshToken }
    } catch (error) {
    throw new AppError(error.message || "Token creation failed", 500)
    }


}
export default generateTokens