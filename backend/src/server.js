import express from "express"


const app = express()

app.get("/api/calling", (req,res)=>{
    res.status(200).json({message: "oui ca fonctionne"})
})

app.listen(3000, () => {
    console.log("le serveur roule ma boule")
})