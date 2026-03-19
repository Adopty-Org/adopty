/*import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import * as utiliDB from "../database/utilisateur.db.js"

export const ingest = new Inngest({ id : "AnyBuy"})

const syncUser = ingest.createFunction(
    { id : "sync-user"},
    {event : "clerk/user.created"},
    async ({ event }) => {
        await connectDB();
        //const { id, email_adresses, first_name, last_name, image_url } = event.data;
        const { id, email_addresses, first_name, last_name, image_url } = event.data;


        const newUser = {
            clerkId : id,
            stripeCustomerId : null,
            Nom : first_name || "",
            Prenom : last_name || "",
            Addresse : null,
            AddresseEmail : email_addresses?.[0]?.email_address,
            Wilaya : null,
            MotDePasse : null,
            CreePar : null,
            ModifieePar : null,
            
            Photo : image_url || "",
            
        }
        await utiliDB.createUtilisateur(newUser)
        //await User.create(newUser);
    }
)

const deleteUserFromDB = ingest.createFunction(
    { id : "delete-user-from-db"},
    { event : "clerk/user.deleted"},
    async ({ event }) => {
        await connectDB();
        
        const { id } = event.data;
        let utilisateur = await utiliDB.getUtilisateurByClerkId(id);
        if (!utilisateur) return;
        await utiliDB.deleteUtilisateur(utilisateur.Id);
        
    }
)


export const functions = [syncUser, deleteUserFromDB]*/

import { Inngest } from "inngest";

export const ingest = new Inngest({ id: "test" });

const testFunction = ingest.createFunction(
  { id: "test-function" },
  { event: "test/event" },
  async () => {
    console.log("✅ Test function executed");
  }
);

export const functions = [testFunction];