import express, {Express,Request,Response} from "express";
import {tokenRouter} from "./Routes/token.routes";
const PORT =  5000;

const app:Express = express();
app.use("/",tokenRouter)
const start = async () =>{
    try {
        app.listen(PORT, () => console.log(`server started on ${PORT} port`) )
    }catch (e) {
        console.log(e)
    }
}
start()