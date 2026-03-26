import React from 'react'
import { Outlet } from 'react-router'

function LobbyLayout() {
  return (
    <div>
        <div>LobbyLayout</div>
        <Outlet/>
    </div>
  )
}

export default LobbyLayout