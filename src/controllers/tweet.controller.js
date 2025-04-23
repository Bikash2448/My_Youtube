import { Tweets } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";




export const createTweet = asyncHandler(async(req,res)=>{
    const userId = req.params.userid
    const {content} = req.body
    console.log("user id",userId)

    if(!userId && !content){
        throw new ApiError(400,"userId or content not defined")
    }
    const newTweet = await Tweets.create({
        content,
        owner:userId
    })
    return res.status(201).json(
        new ApiResponse(201, newTweet, "Tweet created successfully")
    );
})


export const updateTweet = asyncHandler(async(req,res)=>{
    const tweetId = req.params.tweetid
    const {content} = req.body

    if(!tweetId && !content){
        throw new ApiError(400,"userId or content not defined")
    }

    const updateTweet = await Tweets.findByIdAndUpdate(
                                                        tweetId,
                                                        {content},
                                                        {new:true}
                                                    )
    if (!updateTweet) {
        throw new ApiError(404, "Tweet not found");
    }

    return res.status(200).json(
        new ApiResponse(200, updateTweet, "Tweet updated successfully")
    );
})


export const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.params.userid
    if (!userId) {
        throw new ApiError(400, "User ID not provided");
    }

    const userTweets = await Tweets.find({ owner: userId })
                                   .sort({ createdAt: -1 }); // latest first

    return res.status(200).json(
        new ApiResponse(200, userTweets, "Fetched user tweets")
    );
})


export const deleteTweet = asyncHandler(async(req,res)=>{
    const tweetId = req.params.tweetid
    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }

    const deleted = await Tweets.findByIdAndDelete(tweetId);

    if (!deleted) {
        throw new ApiError(404, "Tweet not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deleted, "Tweet deleted successfully")
    );
})






