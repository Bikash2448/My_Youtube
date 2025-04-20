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
    verifyJWT,
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    upload.any(),
    publishVideo
  );

  // videoRouter.post(
  //   "/uploadvideo",
  //   (req, res, next) => {
  //     console.log("🛬 Request reached router!");
  //     next();
  //     console.log("what next")
  //   },
  //   upload.fields([
  //     { name: 'videoFile', maxCount: 1 },
  //     { name: 'thumbnail', maxCount: 1 },
  //   ]),
  //   (req, res, next) => {
  //     console.log("🧳 Multer processed files:", req.files);
  //     next();
  //   },
  //   publishVideo
  // );


videoRouter.route("/:videoId").get(getVideoById)
videoRouter.patch(
  "/:videoId",
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  updateVideo
);
// videoRouter.get("/:videoId", getVideoById);
videoRouter.delete("/:videoId",deleteVideo);


