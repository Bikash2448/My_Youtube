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

export const router= express.Router()

router.get("/",(req,res)=>{
    console.log("get request")
    res.json({
        message:"from router"
    })
})

router.route('/register').post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// Secure route
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/new-accesstoken").post(accessRefreshtoken)
router.route("/password-change").post(verifyJWT,changePassword)
router.route("/current-user").get(verifyJWT,getCurrentuser)
router.route("/update-account").post(verifyJWT,updateAccountdetails)
router.route("/updateAvatar").post(upload.single( 'avatar'),updateAvatar)
router.route("/updateCoverimg").post(verifyJWT,upload.single('coverImage'),updateCoverimg)
router.route("/:username").get(verifyJWT,getUserProfie)
router.route("/watchhistory").get(verifyJWT,getwatchHistory)





