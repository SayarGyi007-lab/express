import express from "express";
import routes from "./routes/test.js";
import cors from 'cors';
import cookieParser from "cookie-parser";
import registeration from "./routes/auth.js";

const app = express();

app.use(
    cors({
        origin: process.env.ORIGIN,
        credentials: true
    })
)


app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb",extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/test",routes)
app.use("/api/v1",registeration)

export {app};
