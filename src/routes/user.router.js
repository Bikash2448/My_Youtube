import express from 'express'
import { upload } from '../middlewares/multer.js'
import {registerUser,
        loginUser,
        logoutUser,
        accessRefreshtoken,
        changePassword,
        getCurrentuser,
        updateAccountdetails,
        updateAvatar,
        updateCoverimg,
        getwatchHistory,
        getUserProfie} from '../controllers/user.controller.js'

import {verifyJWT} from '../middlewares/auth.js'

export const userRouter= express.Router()

userRouter.get("/",(req,res)=>{
    console.log("get request")
    res.json({
        message:"from router"
    })
})

userRouter.route('/register').post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
    ]),
    registerUser
)

userRouter.route("/login").post(loginUser)

// Secure route
userRouter.route("/logout").post(verifyJWT, logoutUser)
userRouter.route("/new-accesstoken").post(accessRefreshtoken)
userRouter.route("/password-change").post(verifyJWT,changePassword)
userRouter.route("/current-user").get(verifyJWT,getCurrentuser)
userRouter.route("/update-account").post(verifyJWT,updateAccountdetails)
userRouter.route("/updateAvatar").post(upload.single( 'avatar'),updateAvatar)
userRouter.route("/updateCoverimg").post(verifyJWT,upload.single('coverImage'),updateCoverimg)
userRouter.route("/:username").get(verifyJWT,getUserProfie)
userRouter.route("/watchhistory").get(verifyJWT,getwatchHistory)





