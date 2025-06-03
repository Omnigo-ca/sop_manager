"use client"

import { useUser } from '@clerk/nextjs'
import { SOPManager } from "@/components/sop-manager/sop-manager"

export default function SopManagerPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return <div>Chargement...</div>;
  if (!isSignedIn) return <div className="flex justify-center items-center h-[60vh]">Veuillez vous connecter pour accéder à l'application.</div>;

  return (
    <SOPManager />
  )
}
