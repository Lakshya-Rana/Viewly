import app from "../src/app..js";
import dotenv from "dotenv"
import { connectDB } from "./database/database.js";

dotenv.config({
    path: "./.env"
})

const port=process.env.PORT; 

connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`App listening on port http://localhost:${port}`)
    })
})
.catch(()=>{
    console.error("mongoDB connection error",error)
    process.exit(1)
})
