import { useSignUp } from "@clerk/clerk-react";
import { useState } from "react";
//
// regarde les commentaires de ./Step1 pour mieux comprendre
//

export default function Step2({ signUp }) {
  const { setActive } = useSignUp();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  if (!signUp) {
    return (
          <div className="h-screen flex items-center justify-center">
            <div className="alert alert-error shadow-lg">
              <span>Erreur: signup perdu</span>
            </div>
          </div>
      );
  }

  const handleSubmit = async () => {
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: result.createdSessionId });

      alert("Compte créé !");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className=" flex items-center justify-center bg-base-200">
      <div
        className="card w-full max-w-md shadow-xl bg-base-100"
        
      >
        <div className="card-body space-y-4">
          {/* Title */}
          <h2 className="text-2xl font-bold text-center">
            Vérification
          </h2>

          <p className="text-center text-sm opacity-70">
            Entre le code reçu par email pour continuer
          </p>

          {/* Code */}
          <input
            type="text"
            placeholder="Code de vérification"
            className="input input-bordered w-full"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          {/* Name */}
          <input
            type="text"
            placeholder="Ton nom"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Button */}
          <button
            onClick={handleSubmit}
            className="btn btn-primary w-full"
          >
            Terminer
          </button>
        </div>
      </div>
    </div>
  );
}