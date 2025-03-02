import express from 'express'
import { upload } from '../middlewares/multer'
import {registerUser} from '../controllers/userController'

export const router= express.Router()

console.log("User Router file")

router.route('/register').post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
    ]),
    registerUser
)