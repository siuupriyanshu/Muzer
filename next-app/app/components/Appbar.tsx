"use client"

import { signIn, signOut, useSession } from "next-auth/react"

const Appbar = () => {
    const session = useSession();
  return (
    <div className="flex justify-between">
   <div>
      Muzi
    </div>
    <div>
        {session.data?.user && <button className="m-2 p-2 bg-fuchsia-600" onClick={() => signOut()}>Logout</button> }
       {!session.data?.user &&  <button className="m-2 p-2 bg-fuchsia-600" onClick={() => signIn()}>Sign In</button>}
    </div>
    </div>
    
  )
}

export default Appbar
