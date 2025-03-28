import { asyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/User.model.js"
import jwt from "jsonwebtoken"
import uploadOnCloudinary from "../utils/Cloudinary.js";
import path from 'path'
import {ApiResponse} from '../utils/ApiResponse.js'


const options = {
    httpOnly: false,
    secure: false
}

const generateAccessAndRefreshToken = async(userid)=>{
    try {
        
        const user = await User.findById(userid)
       
        const accesstoken = user.generateAccessToken()
        
        const refreshtoken = user.generateRefreshToken()
        user.refreshToken = refreshtoken
        await user.save({ validateBeforeSave: false })
        // console.log("AC Re",accesstoken,"................",refreshtoken)
        return {accesstoken,refreshtoken};
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

    // console.log(req.files)
    // console.log(req.files.avatar[0].path)
    const avatarLocalPath = req.files?.avatar[0].path
    console.log(avatarLocalPath)

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    } 

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const absolutePath = path.resolve(avatarLocalPath);
    const avatar = await uploadOnCloudinary(absolutePath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Error in upload cloudinary")
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
    console.log(username,email,password)
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({$or:[{username},{email}]})
    if(!user){
        throw new ApiError(400,"Enter vaild username or emailId")
    }
    
    const checkValidPassword = await user.isPasswordCorrect(password)
    if(!checkValidPassword){
        throw new ApiError(401,"Enter vaild password")
    }

    console.log("code here")
    const {accesstoken,refreshtoken} = await generateAccessAndRefreshToken(user._id)
    console.log("ji",accesstoken)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    

    return res
    .status(200)
    .cookie("accessToken", accesstoken, options)
    .cookie("refreshToken", refreshtoken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accesstoken, refreshtoken
            },
            "User logged In Successfully"
        )
    )
})

export const logoutUser = asyncHandler(async(req,res)=>{
    const user = req.user
    await User.findByIdAndUpdate(user._id,{
        $unset:{refreshToken:undefined},
    },{
        new:true
    })
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
})


export const accessRefreshtoken = asyncHandler(async(req,res)=>{

    try {
        const incomingrefreshtoken = req.cookies?.refreshToken || req.body.refreshToken
        if(!incomingrefreshtoken){
            throw new ApiError(401, "unauthorized request")
        }
        const verifyRefreshToken = jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(verifyRefreshToken?._id)
    
        console.log("Stored refresh token:", user.refreshToken);
        console.log("Incoming refresh token:", incomingrefreshtoken);
        console.log("Are tokens equal?", incomingrefreshtoken === user.refreshToken);

        // if(incomingrefreshtoken!==user.refreshToken){
        //     throw new ApiError(401, "Refresh token is expired or used")
        // }
        if (!user || !user.refreshToken) {
            throw new ApiError(401, "Invalid refresh token or user not found");
        }
        if (incomingrefreshtoken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

    
        const {accesstoken,refreshtoken} = await generateAccessAndRefreshToken(user._id)
        user.refreshToken = refreshtoken;
        await user.save({ validateBeforeSave: false });
    
        return res
            .status(200)
            .cookie("accessToken", accesstoken, options)
            .cookie("refreshToken", refreshtoken, options)
            .json(
                new ApiResponse(
                    200, 
                    {accesstoken, refreshToken: refreshtoken},
                    "Access token refreshed"
                )
            )
    
    } catch (error) {
        res.json({fail:"not success"})
        console.log("not generate token something error",error)
    }
})

