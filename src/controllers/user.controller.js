import { asyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/User.model.js"
import jwt from "jsonwebtoken"
import uploadOnCloudinary from "../utils/Cloudinary.js";
import path from 'path'
import {ApiResponse} from '../utils/ApiResponse.js'
import mongoose from "mongoose";


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
    const absolutPath = path.resolve(coverImageLocalPath);
    const coverImage = await uploadOnCloudinary(absolutPath)

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
    // console.log(username,email,password)
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
    // console.log("ji",accesstoken)
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


export const changePassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

    // console.log("password",oldPassword,newPassword)
    // const userr = req.user
    // console.log(user,"request to change password")
    
    const user = await User.findById(req.user._id).select("+password");
    if(!user){
        throw new ApiError(401, "Unauthorize request")
    }

    const validUser = await user.isPasswordCorrect(oldPassword)
    
    if(!validUser){
        throw new ApiError(401, "Wrong old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200, {newPassword}, "Password changed successfully"))
})

export const getCurrentuser = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user?._id)
    return res
    .status(200)
    .json(new ApiResponse(200,user.fullName,"Current user fetch"))
})


export const updateAccountdetails = asyncHandler(async(req,res)=>{
    const {fullName, email} = req.body
    console.log(fullName,email)

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user  = req.user
    if(!user){
        throw new ApiError(400,"user not exist")
    }
    const updateuser = await User.findByIdAndUpdate(user._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new:true})


    return res
    .status(200)
    .json(new ApiResponse(200, updateuser, "Account details updated successfully"))
})

export const updateAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    // console.log(avatarLocalPath)
    if(!avatarLocalPath){
        return new ApiError(400,"avatar file missing")
    }
    const urlavatar = await uploadOnCloudinary(avatarLocalPath)
    if (!urlavatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }
    await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:urlavatar.url
            }
        },
        {new:true}).select('--password')

    return res
    .status(200)
    .json(new ApiResponse(200,{},"avatar update successfully"))


})

export const updateCoverimg = asyncHandler(async(req,res)=>{
    const coverimgLocalPath = req.file?.path
    console.log(coverimgLocalPath)
    if(!coverimgLocalPath){
        return new ApiError(400,"avatar file missing")
    }
    const urlcover = await uploadOnCloudinary(coverimgLocalPath)
    if (!urlcover.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Delete old cover image from Cloudinary
    if (user.coverImage) {
        try {
            const publicId = user.coverImage.split("/").pop().split(".")[0]; // Extract public ID from URL
            await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted old cover image: ${publicId}`);
        } catch (error) {
            console.error("Error deleting old cover image:", error.message);
        }
    }

    await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage:urlcover.url
            }
        },
        {new:true}).select('--password')

    return res
    .status(200)
    .json(new ApiResponse(200,{},"coverImage update successfully"))


})


export const getUserProfie = asyncHandler(async(req,res)=>{
    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(400,"user name not defined")
    }
    const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subScribercount:{
                    $size:"$subscribers"
                },
                channelsubcount:{
                    $size:"$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subScribercount: 1,
                channelsubcount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )



})


export const getwatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                   $project:{
                                    fullName:1,
                                    username:1,
                                    avatar:1
                                   } 
                                }
                            ]
                        }
                    },{
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res.status(200).json(
        new ApiResponse(200,user[0].watchHistory,"Watch history fetch successfully")
    )
})
