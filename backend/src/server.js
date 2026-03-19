import express from "express"
import path from "path"
import { clerkMiddleware } from '@clerk/express'

import { ENV } from "./config/env.js"
import { connectDB } from "./config/db.js"
import { serve } from "inngest/express"


const app = express()



const __dirname = path.resolve()

app.use(clerkMiddleware())

app.use("/api/ingest", serve({client:ingest, functions:functions}))//  serve() est une fonction qui permet de créer une route pour les fonctions Inngest. Elle prend en paramètre l'instance Inngest et un tableau de fonctions. Elle crée une route /api/ingest qui écoute les événements et exécute les fonctions correspondantes.

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
    console.log(ENV.NODE_ENV+ENV.PORT+"Le serveur roule ma boule !")
    connectDB();
});
