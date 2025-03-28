import express from 'express'
import { upload } from '../middlewares/multer.js'
import {registerUser,loginUser,logoutUser,accessRefreshtoken} from '../controllers/user.controller.js'
import {verifyJWT} from '../middlewares/auth.js'

export const router= express.Router()

console.log("User Router file")
router.route('/').post((req,res)=>{
    console.log("router")
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


router.route("/logout").post(verifyJWT, logoutUser)
router.route("/new-accesstoken").post(accessRefreshtoken)


