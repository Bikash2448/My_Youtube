import { asyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import User from "../models/User.model.js"

const generateAccessAndRefreshToken = async(userid)=>{
    try {
        const user = User.findOne(userid)
        const accesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()
        user.refreshToken = refreshtoken
        await user.save({ validateBeforeSave: false })
        return accesstoken,refreshtoken;
    } catch (error) {
        new ApiError(500,"Something went wrong in server side",error)
    }
}

export const registerUser = asyncHandler(async(req,res)=>{
    const {fullName, email, username, password }=req.body

    if([fullName, email, username, password].some((filed)=>filed?.trim()=="")){
        throw new ApiError(400,"All fields are required")
    }
    const existingUser = await User.findOne({$or:[{username},{email}]})

    if(existingUser){
        throw new ApiError(409,"Username or Email already exists")
    }

    const avatarLocalPath = req.files?.avatar[0].path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    } 

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
    
})


export const loginUser = asyncHandler(async(req,res)=>{

    const {username,email,password} = req.body
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({$or:[{username},{email}]})
    if(!user){
        throw ApiError(400,"Enter vaild username or emailId")
    }

    const checkValidPassword = await user.isPasswordCorrect(password)
    if(!checkValidPassword){
        throw new ApiError(401,"Enter vaild password")
    }

    const {accessToken,refreshToken} = generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )


})





