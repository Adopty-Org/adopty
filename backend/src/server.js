import express from "express"
import path from "path"
import { clerkMiddleware } from '@clerk/express'

import { ENV } from "./config/env.js"
import { connectDB } from "./config/db.js"
import { serve } from "inngest/express"
import cors from "cors"

import { functions, ingest} from "./config/inngest.js";

import { webRoutes } from "./routes/web.route.js"
import { animalRoutes } from "./routes/animal.route.js"
import { especeRoutes } from "./routes/espece.route.js"
import { raceRoutes } from "./routes/race.route.js"
import { refugeRoutes } from "./routes/refuge.route.js"
import { roleRoutes } from "./routes/role.route.js"
import { utilisateurRoutes } from "./routes/utilisateur.route.js"
import { vaccinRoutes } from "./routes/vaccin.route.js"


const app = express()



const __dirname = path.resolve()

app.use(express.json());// 3 heures de soucis.... 
app.use(clerkMiddleware())

// credentials : true permet d'autoriser les cookies et les en-tetes d'authentification dans les requetes cross-origin. cela est necessaire pour que le client puisse envoyer les cookies de session ou les jetons d'authentification avec les requetes vers l'api.sans ca le client ne pourra pas s'authentifier et acceder aux ressources proteges de l'api
app.use(cors({origin : ENV.CLIENT_URL, credentials : true}))// cors() est un midleware qui perment de generer une erreur cors si le client n'est pas autorise a acceder a l'api. il prend en parametre un objet de configuration qui contien la propriete origine qui est l'url du client autorise a acceder a l'api
// https://localhost:5173 en dev et https://adopty.onrender.com/ en prod

//app.use("/api/inngest", serve({client:ingest, functions:functions}))//  serve() est une fonction qui permet de créer une route pour les fonctions Inngest. Elle prend en paramètre l'instance Inngest et un tableau de fonctions. Elle crée une route /api/ingest qui écoute les événements et exécute les fonctions correspondantes.

/*app.use("/api/inngest", (req, res) => {
  console.log("🔥 INNGEST HIT");
  res.status(200).json({ ok: true });
});*/

app.use("/api/inngest", serve({ client: ingest, functions }));

app.use("/api/web", webRoutes)
app.use("/api/animaux", animalRoutes)
app.use("/api/especes", especeRoutes)
app.use("/api/races", raceRoutes)
app.use("/api/vaccins", vaccinRoutes)
app.use("/api/refuges", refugeRoutes)
app.use("/api/roles", roleRoutes)
app.use("/api/utilisateurs", utilisateurRoutes)

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
