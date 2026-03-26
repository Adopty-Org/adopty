import React from 'react'
import { LoaderIcon } from "lucide-react"

function LoadingLayout() {
  return (
    <div className=' flex  justify-items-center justify-self-center items-center h-screen'><LoaderIcon className='size-12 animate-spin'/></div>
  )
}

export default LoadingLayout