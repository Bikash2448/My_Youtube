import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { video } from "../models/Video.model.js";
import { Likes } from "../models/like.model.js";
import { comments } from "../models/comment.model.js";
import { Tweets } from "../models/tweet.model.js";


export const toggleVideoLike = asyncHandler(async(req,res)=>{
    console.log("video params",req.params.videolike)
    const videoId = req.params.videolike
    // console.log(videoId)
    if(!videoId){
        throw new ApiError(400,"Invalid or missing video ID")
    }
    const fetchVideo = await video.findById(videoId)
    if(!fetchVideo){
        throw new ApiError(404,"Video can not found")
    }
    const userId = req.user?._id
    if(!userId){
        throw new ApiError(400,"User not valid")
    }
    const existingLike = await Likes.findOne({
        video:videoId,
        likedBy:userId
    })
    if(existingLike){
        await existingLike.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, false,{}, "Like removed successfully")
        );
    }else{
        await Likes.create({
            video: videoId,
            likedBy: userId
        });
        return res.status(200).json(
            new ApiResponse(200, true,{}, "Video liked successfully")
        );
    }   
})

export const toggleCommentLike = asyncHandler(async(req,res)=>{
    const commentId = req.params.commentlike
    if(!commentId|| !mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid or missing comment ID")
    }
    const fetchcomments = await comments.findById(commentId)
    if(!fetchcomments){
        throw new ApiError(404,"comments can not found")
    }
    const userId = req.user?._id
    if(!userId){
        throw new ApiError(400,"User not valid")
    }
    const existingLike = await Likes.findOne({
        comment:commentId,
        likedBy:userId
    })
    if(existingLike){
        await existingLike.deleteOne();
        return res.status(200).json(
            new ApiResponse(200,false, {}, "Like removed successfully")
        );
    }else{
        await Likes.create({
            comment: commentId,
            likedBy: userId
        });
        return res.status(200).json(
            new ApiResponse(200, true, {}, "Comment liked successfully")
        );
    }   
})


export const toggleTweetLike = asyncHandler(async(req,res)=>{
    const tweetId = req.params.tweetlike
    if(!tweetId|| !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid or missing tweet ID")
    }
    const fetchtweet = await Tweets.findById(tweetId)
    if(!fetchtweet){
        throw new ApiError(404,"tweet can not found")
    }
    const userId = req.user?._id
    if(!userId){
        throw new ApiError(400,"User not valid")
    }
    const existingLike = await Likes.findOne({
        tweet:tweetId,
        likedBy:userId
    })
    if(existingLike){
        await existingLike.deleteOne();
        return res.status(200).json(
            new ApiResponse(200,false, {}, "Like removed successfully")
        );
    }else{
        await Likes.create({
            tweet: tweetId,
            likedBy: userId
        });
        return res.status(200).json(
            new ApiResponse(200, true,{}, "tweet liked successfully")
        );
    }   
})

export const getLikedVideos = asyncHandler(async(req,res)=>{
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized: User not logged in");
    }

    // Find all likes for videos by this user
    const likedVideos = await Likes.find({ likedBy: userId, video: { $ne: null } })
        .populate("video") // populate full video details
        .sort({ createdAt: -1 }); // show most recent likes first

    // console.log(likedVideos)
    const videos = likedVideos
        .map(like => like.video)
        .filter(video => video); // filter out any nulls (just in case)

    // console.log(videos)
    return res.status(200).json(
        new ApiResponse(200,video, videos, "Liked videos fetched successfully")
    );
})


