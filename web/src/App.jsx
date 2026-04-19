import React from 'react'
import {  SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/clerk-react'
import { Navigate, Route, Routes }from "react-router"
import LoginPage from './pages/auth/LoginPage'
import LobbyPage from './pages/LobbyPage'
import ShopPage from './pages/shop/ShopPage'
import ServicesPage from './pages/services/ServicesPage'
import RefugesNAnimals from './pages/refugesAnimals/RefugesNAnimalsPage'
import ConserningPage from './pages/conserning/ConserningPage'
import LobbyLayout from './layouts/LobbyLayout'
import LoadingLayout from './components/Loadingpage'
import SignUpPage from './pages/auth/step0'
import TestChat from './pages/messagerie/goofy'
import Signalement from './pages/signalement/Signalement'
import Encyclopedie from './pages/encyclopedie/enciclopedie'
import Profil from './pages/profil/profil'
import UserProfile from './pages/profil/userProfile'

import { useEffect } from "react";
import { setAuthTokenGetter } from "./lib/axios.js";
import ConversationsList from './pages/messagerie/conversations.jsx'



function App() {

  const { isSignedIn,isLoaded,getToken } = useAuth()

  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, []);

  if(!isLoaded) return <LoadingLayout/>;

  return (
    <Routes>
      <Route path="/login" element={ isSignedIn ? <Navigate to = {"/lobby"}/> : <LoginPage/> }/>
      {/* on l'a fait sortir car le navbar et le sidebar se metais a travers de notre chemin */}
      {/*<Route path="/sign-up" element={<SignUpPage/>}/>*/}
      <Route path="/testChat" element={<TestChat/>}/>
      <Route path="/testConversation" element={<ConversationsList/>}/>
      {/* pas de isSignedIn car debile */}
      <Route path="/" element={<LobbyLayout/>}>
        <Route index element={<Navigate to={"lobby"}/>}/>
        <Route path="lobby" element={<LobbyPage/>}/>
        <Route path="shop"element={<ShopPage/>}/>
        <Route path="services"element={<ServicesPage/>}/>
        <Route path="refanimal"element={<RefugesNAnimals/>}/>
        <Route path="conserning"element={<ConserningPage/>}/>
        <Route path="signalement"element={<Signalement/>}/>
        <Route path="encyclopedie"element={<Encyclopedie/>}/>
        <Route path="profil" element={<UserProfile/>}/>
        <Route path="profil/:id" element={<UserProfile/>}/>
        <Route path="profil_animal/:id"element={<Profil/>}/>
        

      </Route>
    </Routes>
  )
}

export default App
