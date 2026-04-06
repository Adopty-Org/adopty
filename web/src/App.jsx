import React from 'react'
import {  SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/clerk-react'
import { Navigate, Route, Routes }from "react-router"
import LoginPage from './pages/auth/LoginPage'
import LobbyPage from './pages/LobbyPage'
import ShopPage from './pages/ShopPage'
import ServicesPage from './pages/ServicesPage'
import RefugesNAnimals from './pages/RefugesNAnimalsPage'
import ConserningPage from './pages/ConserningPage'
import LobbyLayout from './layouts/LobbyLayout'
import LoadingLayout from './components/Loadingpage'
import SignUpPage from './pages/auth/step0'



function App() {

  const { isSignedIn,isLoaded } = useAuth()

  if(!isLoaded) return <LoadingLayout/>;

  return (
    <Routes>
      <Route path="/login" element={ isSignedIn ? <Navigate to = {"/lobby"}/> : <LoginPage/> }/>
      {/* on l'a fait sortir car le navbar et le sidebar se metais a travers de notre chemin */}
      <Route path="/sign-up" element={<SignUpPage/>}/>
      {/* pas de isSignedIn car debile */}
      <Route path="/" element={<LobbyLayout/>}>
        <Route index element={<Navigate to={"lobby"}/>}/>
        <Route path="lobby" element={<LobbyPage/>}/>
        <Route path="shop"element={<ShopPage/>}/>
        <Route path="services"element={<ServicesPage/>}/>
        <Route path="refanimal"element={<RefugesNAnimals/>}/>
        <Route path="conserning"element={<ConserningPage/>}/>
        

      </Route>
    </Routes>
  )
}

export default App
