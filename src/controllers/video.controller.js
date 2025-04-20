import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import uploadOnCloudinary from "../utils/Cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { video} from "../models/Video.model.js";
import Ffmpeg from "fluent-ffmpeg";   // for calculate video time duration
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"

import ffprobe from "ffprobe-static";

// Set paths for ffmpeg and ffprobe
Ffmpeg.setFfmpegPath(ffmpegInstaller.path);
Ffmpeg.setFfprobePath(ffprobe.path); 

cloudinary.config()
// Helper function to get duration
const getVideoDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    Ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const durationInSeconds = metadata.format.duration;
      resolve(durationInSeconds);
    });
  });
};
const extractPublicId = (url) => {
  if (!url) return null;

  // Split the URL by "/" to isolate each part
  const parts = url.split('/');

  // Example: Get the last part (e.g., "myvideo.mp4")
  const fileNameWithExt = parts.pop();

  // Remove file extension (.mp4, .jpg, etc.)
  const fileName = fileNameWithExt.split('.')[0];

  // Find everything after "upload" in the URL
  const uploadIndex = parts.indexOf("upload");
  const publicIdPath = parts.slice(uploadIndex + 1).join('/');

  // Final public ID format: path/filename
  return `${publicIdPath}/${fileName}`;
};


export const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const searchQuery = {}
    if(query){
        searchQuery.title = {$regex:query,$options:"i"};   // match any title that contains the query string" using a regular expression (regex).The "i" option makes the search case-insensitive (so cat, Cat, CAT will all match).
    }
    if(userId){
        searchQuery.owner = userId
    }

    let sortQuery = {createdAt:-1}
    if(sortBy && sortType){
        const sortField = sortBy;
        const sortOrder = sortType ==="asc"?1:-1;       //Ternary operator: if true, use 1 (ascending); if false, use -1 (descending).
        sortQuery = {[sortField]:sortOrder};
    }

    const videos = await video.find(searchQuery)
                                .sort(sortQuery)
                                .skip((page - 1) * limit)
                                .limit(Number(limit))
                                .populate("owner", "username avatar");



    const totalCount = await video.countDocuments(searchQuery)

    return res.status(200).json(
        new ApiResponse(200, {
          videos,
          totalCount,
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / limit)
        }, "Videos fetched successfully")
      );
      
})

export const publishVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    console.log("files --> ",req.files)
    // TODO: get video, upload to cloudinary, create video
    if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
    }
    const file = req.files.videoFile[0];
    console.log(file.path);

    const videoPath = req.files?.videoFile[0]?.path;
    const thumbnailPath = req.files?.thumbnail[0]?.path;
    console.log(videoPath)

    if (!videoPath || !thumbnailPath) {
    throw new ApiError(400, "Video or thumbnail file not found");
    }

    // Get video duration
    const duration = await getVideoDuration(videoPath);

    // Upload to Cloudinary
    const uploadedVideo = await uploadOnCloudinary(videoPath);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailPath);

    if (!uploadedVideo?.url || !uploadedThumbnail?.url) {
    throw new ApiError(500, "Failed to upload video or thumbnail");
    }

    // Create video document
    const newVideo = await video.create({
    title,
    description,
    duration,
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
    owner: req.user._id, 
    });
    
    return res.status(201).json(
    new ApiResponse(201, newVideo, "Video published successfully")
    );
})

export const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
      throw new ApiError(404,"video id can not find")
    }
    const foundVideo = await video.findById(videoId).populate("owner", "username avatar fullName");
    if (!foundVideo) {
      throw new ApiError(404, "Video not found");
    }
    return res.status(200).json(
      new ApiResponse(200, foundVideo, "Video fetched successfully")
    );
})

export const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const videoDoc = await video.findById(videoId);

  if (!videoDoc) {
    throw new ApiError(404, "Video not found");
  }

  // Optional: you could extract & update video duration here using ffmpeg
  const duration = await getVideoDuration(req.files.videoFile[0].path);

  // 📤 Upload new thumbnail (if provided)
  if (req.files?.thumbnail?.[0]) {
    const thumbUrl = await uploadOnCloudinary(req.files.thumbnail[0].path);
    videoDoc.thumbnail = thumbUrl.url;
    
  }

  // 📤 Upload new video file (if provided)
  if (req.files?.videoFile?.[0]) {
    const videoUrl = await uploadOnCloudinary(req.files.videoFile[0].path);
    videoDoc.videoFile = videoUrl.url;
  }

  // 📝 Update text fields
  if (title) videoDoc.title = title;
  if (description) videoDoc.description = description;
  if(duration) videoDoc.duration=duration

  await videoDoc.save();

  return res.status(200).json(
    new ApiResponse(200, videoDoc, "Video updated successfully")
  );
});

export const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) {
      throw new ApiError(400, "Video ID is required");
    }
  
    const videoDoc = await video.findById(videoId);
  
    if (!videoDoc) {
      throw new ApiError(404, "Video not found");
    }
  
    // Optional: delete video file and thumbnail from Cloudinary
    // This assumes your Cloudinary URLs include public_id or you store it separately
    const videoPublicId = extractPublicId(videoDoc.videoFile);
    const thumbnailPublicId = extractPublicId(videoDoc.thumbnail);
    
  console.log("innnnnnnnnnn")
    if (videoPublicId) {
      await cloudinary.uploader.destroy(videoPublicId, { resource_type: "video" });
    }
    
  
    if (thumbnailPublicId) {
      await cloudinary.uploader.destroy(thumbnailPublicId, { resource_type: "image" });
    }
  
    await videoDoc.deleteOne();
  
    return res.status(200).json(
      new ApiResponse(200, null, "Video deleted successfully")
    );
})

// const togglePublishStatus = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
// })

