import express from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";
import {getAllVideos, 
        publishVideo,
        getVideoById,
        updateVideo,
        deleteVideo
                    } from "../controllers/video.controller.js";


export const videoRouter = express.Router();

videoRouter.use(verifyJWT);

// GET all videos with optional query, pagination, sorting
videoRouter.route("/getallvideo").get(getAllVideos);
videoRouter.route("/uploadvideo").post(
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    publishVideo
  );



videoRouter.route("/:videoId").get(getVideoById)
videoRouter.patch(
  "/:videoId",
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  updateVideo
);

videoRouter.delete("/:videoId",deleteVideo);


