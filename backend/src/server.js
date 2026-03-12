import express from "express"
import path from "path"
import { clerkMiddleware } from '@clerk/express'

import { ENV } from "./config/env.js"
import { connectDB } from "./config/db.js"


const app = express()



const __dirname = path.resolve()

app.use(clerkMiddleware())

app.get("/api/calling", (req,res)=>{
    res.status(200).json({message: "oui ca fonctionne"})
})

if(ENV.NODE_ENV == "production"){
    app.use(express.static(path.join(__dirname, "../web/dist")))
    app.get("/{*any}", (req,res) => {
        res.sendFile(path.join(__dirname, "../web", "dist", "index.html"))
    })
}

app.listen(ENV.PORT, () => {
    console.log("le serveur roule ma boule")
    connectDB()
})