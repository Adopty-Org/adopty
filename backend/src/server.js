import express from "express"
import path from "path"
import http from "http";
import { clerkMiddleware } from '@clerk/express'

import { ENV } from "./config/env.js"
import { connectDB } from "./config/db.js"
import { serve } from "inngest/express"
import cors from "cors"

import { functions, ingest} from "./config/inngest.js";
import { initSocket } from "./midleware/socket.midleware.js";  // Import de la fonction d'initialisation de Socket.io dans le middleware dédié

import webRoutes from "./routes/web.route.js"
import animalRoutes from "./routes/animal.route.js"
import especeRoutes from "./routes/espece.route.js"
import raceRoutes from "./routes/race.route.js"
import refugeRoutes from "./routes/refuge.route.js"
import roleRoutes from "./routes/role.route.js"
import utilisateurRoutes from "./routes/utilisateur.route.js"
import vaccinRoutes from "./routes/vaccin.route.js"


import annonceRoutes from "./routes/annonce.route.js"
import avis_servicesRoutes from "./routes/avis_service.route.js"
import avisRoutes from "./routes/avis.route.js"
import commandeRoutes from "./routes/commande.route.js"
import disponibiliteRoutes from "./routes/disponibilite.route.js"
import ligne_commandeRoutes from "./routes/ligne_commande.route.js"
import ligne_panierRoutes from "./routes/ligne_panier.route.js"
import ligne_wishlistRoutes from "./routes/ligne_wishlist.route.js"
import livraisonRoutes from "./routes/livraison.route.js"
import paiement_commandeRoutes from "./routes/paiement_commande.route.js"
import paiement_serviceRoutes from "./routes/paiement_service.route.js"
import panierRoutes from "./routes/panier.route.js"
import profil_prestataireRoutes from "./routes/profil_prestataire.route.js"

import reservationRoutes from "./routes/reservation.route.js"
import sous_commandeRoutes from "./routes/sous_commande.route.js"
import specificationRoutes from "./routes/specification.route.js"
import statutRoutes from "./routes/statut.route.js"
import type_serviceRoutes from "./routes/type_service.route.js"
import wishlistRoutes from "./routes/wishlist.route.js"

import signalementRoutes from "./routes/signalement.route.js"
import conversationRoutes from "./routes/conversation.route.js"
import conversation_participantRoutes from "./routes/conversation_participant.route.js"
import messageRoutes from "./routes/message.route.js"

// Au début, avec les autres imports
import stripeRoutes from './routes/stripe.route.js';



const app = express()



const __dirname = path.resolve()





// Pour le webhook, il faut que bodyParser ne touche pas à la route /webhook
// Donc assure-toi que app.use(express.json()) est APRÈS la route webhook
// Ou configure comme ça :

// D'abord les routes qui ont besoin du body brut
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));



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


// Puis les routes
app.use('/api/stripe', stripeRoutes);

app.use("/api/inngest", serve({ client: ingest, functions }));

app.use("/api/web", webRoutes)
app.use("/api/animaux", animalRoutes)
app.use("/api/especes", especeRoutes)
app.use("/api/races", raceRoutes)
app.use("/api/vaccins", vaccinRoutes)
app.use("/api/refuges", refugeRoutes)
app.use("/api/roles", roleRoutes)
app.use("/api/utilisateurs", utilisateurRoutes)

app.use("/api/annonces", annonceRoutes)
app.use("/api/avis_services", avis_servicesRoutes)
app.use("/api/aviss", avisRoutes)
app.use("/api/commandes", commandeRoutes)
app.use("/api/disponibilites", disponibiliteRoutes)
app.use("/api/ligne_commandes", ligne_commandeRoutes)
app.use("/api/ligne_paniers", ligne_panierRoutes)
app.use("/api/ligne_wishlists", ligne_wishlistRoutes)
app.use("/api/livraisons", livraisonRoutes)
app.use("/api/paiement_commandes", paiement_commandeRoutes)
app.use("/api/paiement_services", paiement_serviceRoutes)
app.use("/api/paniers", panierRoutes)
app.use("/api/profil_prestataires", profil_prestataireRoutes)

app.use("/api/reservations", reservationRoutes)
app.use("/api/sous_commandes", sous_commandeRoutes)
app.use("/api/specifications", specificationRoutes)
app.use("/api/statuts", statutRoutes)
app.use("/api/type_services", type_serviceRoutes)
app.use("/api/wishlists", wishlistRoutes)

app.use("/api/signalements", signalementRoutes)
app.use("/api/conversations", conversationRoutes)
app.use("/api/conversation_participants", conversation_participantRoutes)
app.use("/api/messages", messageRoutes)

app.get("/api/calling", (req,res)=>{
    res.status(200).json({message: "oui ca fonctionne"})
})



if(ENV.NODE_ENV == "production"){
    app.use(express.static(path.join(__dirname, "../web/dist")))
    app.get("/{*any}", (req,res) => {
        res.sendFile(path.join(__dirname, "../web", "dist", "index.html"))
    })
}

const server = http.createServer(app);

// init websocket
//initSocket(server);
initSocket(server, { origin: ENV.CLIENT_URL });

server.listen(ENV.PORT, () => {
    console.log(ENV.NODE_ENV + ENV.PORT + " Le serveur roule ma boule !");
    connectDB();
});

/*
app.listen(ENV.PORT, () => {
    console.log(ENV.NODE_ENV+ENV.PORT+"Le serveur roule ma boule !")
    connectDB();
});*/
