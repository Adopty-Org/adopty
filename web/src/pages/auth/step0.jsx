import { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import { useQuery } from "@tanstack/react-query";
import { utilisateurApi } from "../../lib/api";

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [signUpData, setSignUpData] = useState(null);

  const { data:utilisateursData, isLoading } = useQuery({
    queryKey: ["utilisateurs"],
    queryFn: utilisateurApi.getAll
  });

  console.log("etat :   " , isLoading)
  console.log("utilisateurs :   " , utilisateursData)

  return (
    <div className="h-screen flex items-center justify-center bg-base-200 overflow-hidden">

      <div className="relative w-full max-w-md h-100 " >
        
          {/* Step1 */}
          <div
            className={`absolute w-full transition-all duration-500 ${
              step === 1 ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
            }`}
            aria-hidden={step !== 1}
            inert={step !== 1}
          >
            <Step1
              next={(data) => {
                setSignUpData(data);
                setStep(2);
              }}
            />
          </div>

          {/* Step2 */}
          <div
            className={`absolute w-full transition-all duration-500 ${
              step === 2 ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            }`}
            aria-hidden={step !== 2}
            inert={step !== 2}
          >
            <Step2 signUp={signUpData} />
          </div>

        </div>
      
    </div>
    
  );
}