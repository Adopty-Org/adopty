import React from 'react'
import { Outlet } from 'react-router'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'

function LobbyLayout() {
  return (
    <div className='drawer bg-[#fbfbe2]'>
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle bg-[#fbfbe2]" />
        <div className="drawer-content flex flex-col">
            <Navbar/>
            <Outlet/>
            <Footer/>
        </div>
        
        <Sidebar/>
        
        
    </div>
  )
}

export default LobbyLayout