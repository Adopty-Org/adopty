import { useSignUp } from "@clerk/clerk-react";
import { useState } from "react";

//
// je dois comprendre comment ca marche avant d'y toucher -pour badis-
// 

export default function Step1({ next }) {
  // les inits
  // c'est l'element de clerk- le hook si on veux- qui se charge d'envoyer les informations a clerk (il fait la creation du compte etc..)
  const { signUp } = useSignUp();

  // c'est juste de etats qu'on fait pour avoir les infos (il's n'existes pas avant mais on les a crees) -toujours a faire avec le truc et son setteur-
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // c'est la fonction qui gere la vrai creation de l'utilisateur
  const handleSubmit = async () => {
  try {
    console.log("CLICK");

    await signUp.create({
      emailAddress: email,
      password,
    });

    console.log("USER CREATED");

    await signUp.prepareEmailAddressVerification({
      strategy: "email_code",
    });

    console.log("CODE SENT");

     next(signUp);
  } catch (err) {
    console.log("ERROR:", err);
  }
};

// c'est l'affichage de notre formulaire-seulement l'etape 1-
  return (
    <div className=" flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md shadow-xl bg-base-100 " >
        
        <div className="card-body space-y-4">
          {/* Title */}
          <h2 className="text-2xl font-bold text-center">
            Créer un compte
          </h2>

          <p className="text-center text-sm opacity-70">
            Commence ton inscription
          </p>

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Mot de passe"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/*<Captcha />*/}
          <div id="clerk-captcha"/>
          {/* Button */}
          <button
            onClick={handleSubmit}
            className="btn btn-primary w-full"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}