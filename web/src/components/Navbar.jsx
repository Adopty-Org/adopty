import { UserButton } from '@clerk/clerk-react'
import { HomeIcon, InfoIcon, MapPinHouseIcon, PanelLeftIcon, PawPrintIcon, ShoppingBagIcon } from 'lucide-react'
import React from 'react'
import { Link, useLocation } from 'react-router'

export const NAVIGATION = [
  {name: "Lobby", path: "/lobby", icon: <HomeIcon className="size-5"/> },
  {name: "Shop", path: "/shop", icon: <ShoppingBagIcon className="size-5"/> },
  {name: "Services", path: "/services", icon: <PawPrintIcon className="size-5"/> },
  {name: "Refuges & Animals", path: "/refanimal", icon: <MapPinHouseIcon className="size-5"/> },
  {name: "Conserning us", path: "/conserning", icon: <InfoIcon className="size-5"/> },
]

function Navbar() {

  const location = useLocation()
  console.log(location);
  return (
    <div>{/* Navbar */}
        <div className="navbar bg-base-300 w-full">
        <div className="flex-none lg:hidden">
            <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-square btn-ghost">
            <PanelLeftIcon className='size-7'/>
            </label>
        </div>
        <div className="mx-2 flex-1 px-2"><h1> {NAVIGATION.find((item) => item.path === location.pathname)?.name || "Lobby"}</h1></div>
        <div className="hidden flex-none lg:block">
          
            <ul className="menu menu-horizontal">
            {/* Navbar menu content here */}
            {/* Sidebar content here */}
                {NAVIGATION.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <li key={item.path}>
                            <Link to={item.path} className={`is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? "bg-primary text-primary-content" : ""}`}>
                                {item.icon}
                                <span className='is-drawer-close:hidden'>{item.name}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
        <div><UserButton/></div>
        </div>
        {/* Page content here */}
        Content zcSDSDAQEFWGRETHGRFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF<UserButton/>
      </div>
  )
}

export default Navbar