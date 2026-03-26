import React from 'react'
import {  SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'


function App() {
  return (
    <div>
      <header>
        <button className="btn btn-primary">Test</button>
          <SignInButton mode='modal'/>
          <SignUpButton mode='modal'/>
        
        
          <UserButton />
        
      </header>
    </div>
  )
}

export default App
