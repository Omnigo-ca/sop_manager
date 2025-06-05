"use client"

import { useUser } from '@clerk/nextjs'
import { SOPManager } from "@/components/sop-manager/sop-manager"
import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { FileText, Users, CheckSquare, Shield } from 'lucide-react'

export default function SopManagerPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return <div>Chargement...</div>;
  
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-4">
        <div className="max-w-3xl w-full text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-meutas font-bold text-black">Bienvenue sur SOP Manager</h1>
            <p className="text-xl font-meutas text-gray-600">
              La plateforme de gestion des procédures opérationnelles standardisées d'Omnigo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-white border border-black rounded-lg">
              <FileText size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-meutas font-semibold mb-2">Gestion des procédures</h3>
              <p className="text-center font-meutas">Créez, organisez et partagez vos procédures opérationnelles</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white border border-black rounded-lg">
              <Users size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-meutas font-semibold mb-2">Groupes d'accès</h3>
              <p className="text-center font-meutas">Contrôlez précisément qui a accès à vos procédures</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white border border-black rounded-lg">
              <CheckSquare size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-meutas font-semibold mb-2">Étapes illustrées</h3>
              <p className="text-center font-meutas">Créez des procédures visuelles et faciles à suivre</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white border border-black rounded-lg">
              <Shield size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-meutas font-semibold mb-2">Sécurité</h3>
              <p className="text-center font-meutas">Vos données sont protégées et sécurisées</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <SignInButton>
              <Button variant="outline" size="lg" className="font-meutas text-lg px-8 hover:text-primary hover:border-primary hover:bg-black transition-colors">
                Connexion
              </Button>
            </SignInButton>
            
            <SignUpButton>
              <Button size="lg" className="font-meutas text-lg px-8 bg-primary hover:bg-black hover:text-primary border border-black transition-colors">
                Inscription
              </Button>
            </SignUpButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SOPManager />
  )
}
