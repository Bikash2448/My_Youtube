import dotenv from 'dotenv'
import { app } from './app.js'
import connectDB from './db/index.js'


dotenv.config({path:'./.env'})






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