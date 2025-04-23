import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { app } from './app.js'
import connectDB from './db/index.js'
import express from "express"
import { userRouter } from './routes/user.router.js'
import { videoRouter } from './routes/video.router.js'
import { commentRouter } from './routes/comment.routes.js'
import { tweetRouter } from './routes/tweet.router.js'
import { likeRouter } from './routes/like.route.js'


dotenv.config({path:'./.env'})
app.use(cookieParser())

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use('/api/user',userRouter)
app.use("/api/videos", videoRouter);
app.use("/api/comment",commentRouter);
app.use("/api/tweets",tweetRouter)
app.use("/api/likes",likeRouter)





connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(` Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})





































// connect mongodb
// ;(async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URL}/${MY_TUBE}`)
//         app.on("Error",(e)=>{
//             console.log("Error failed to connect DB from server",e)
//             throw e
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log("Server is running on port",process.env.PORT)
//         })
//     }
//     catch(e){
//         console.log("Error",e)
//     }
// })()