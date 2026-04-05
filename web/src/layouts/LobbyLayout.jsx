import React from 'react'
import { Outlet } from 'react-router'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

function LobbyLayout() {
  return (
    <div className='drawer '>
        /*<input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
            <Navbar/>
        </div>
        
        <Sidebar/>*/
        <Outlet/>
    </div>
  )
}

export default LobbyLayout