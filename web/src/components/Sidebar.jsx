import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { Link, useLocation } from 'react-router'
import { NAVIGATION } from './Navbar'
import { PawPrintIcon } from 'lucide-react';



function Sidebar() {
    const location = useLocation();
    const { user } = useUser();

    console.log("user est la :   ", user)

    const isActive = location.pathname === "/profil";

  return (
    
        <div className="drawer-side is-drawer-close:overflow-visible transition-all duration-300">
            <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
            
            <div className='flex min-h-full flex-col items-start bg-base-200 transform transition-transform duration-300 is-drawer-open:translate-x-0 is-drawer-close:-translate-x-full  justify-between'>

                <div>
                    {/* l'icon */}
                    <div className='p-4 w-full transition-all duration-300'>
                        <div className='flex items-center gap-3'>
                            <div className='size-10 bg-primary rounded-xl flex items-center justify-center shrink-0 is-drawer-close:hidden transition-all duration-300'>
                                <PawPrintIcon className='size-6 text-primary-content is-drawer-close:hidden'/>

                            </div>
                            <span className='text-xl font-bold is-drawer-close:hidden'>
                                Adopty
                            </span>
                        </div>
                    </div>
                    
                    {/* le tiroir */}
                    <ul className="menu bg-base-200 min-h-full w-64 p-4 is-drawer-close:hidden transition-all duration-300">
                    {/* Sidebar content here */}
                    {NAVIGATION.map(item => {
                        const isActive = location.pathname === item.path;
        
                        return (
                            <li key={item.path}>
                                <Link to={item.path} className={`is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? "bg-primary text-primary-content " : ""} ${item.path === '/signalement'
                        ? 'text-white bg-[#ba1a1a] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1px hover:translate-y-1px hover:shadow-none ml-2'
                        : isActive
                        ? 'text-primary bg-surface-container border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'text-primary/70 hover:text-primary hover:bg-surface-container'
                    }`}>
                                    {item.icon}
                                    <span className='is-drawer-close:hidden'>{item.name}</span>
                                </Link>
                            </li>
                        )
                    })}
                    </ul>
                </div>

                {/* l'avatar */}
                <Link to="/profil">
                    <div className={` p-4 w-full is-drawer-close:hidden transition-all duration-300 rounded-2xl ${isActive ? "bg-primary text-primary-content " : ""}`}>
                        <div className='flex items-center gap-3'>
                            <div className='avatar  shrink-0'>
                                <img src={user?.imageUrl} alt={user?.name} className='size-10 rounded-full' />
                            </div>
                            <div className='flex-1 min-w-0 is-drawer-close:hidden'>
                                <p className='text-sm font-semibold truncate'>
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className='text-xs truncate opacity-60 transition-all duration-300'>
                                    {user?.emailAddresses[0]?.emailAddress}
                                </p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    
  )
}

export default Sidebar