import { SignIn } from '@clerk/clerk-react'
import React from 'react'

function LoginPage() {
  return (
    <div className='h-screen hero'>
        <SignIn signUpUrl="/sign-up"/>  // le sign-in est le meme mais son bouton "sign-up" renvoie vers notre page custom 
    </div>
  )
}

export default LoginPage