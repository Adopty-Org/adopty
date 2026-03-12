import express from "express"
import path from "path"
import { ENV } from "./config/env.js"


const app = express()

const __dirname = path.resolve()

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
})