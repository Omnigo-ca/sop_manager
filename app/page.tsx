"use client"

import { useUser } from '@clerk/nextjs'
import { SOPManager } from "@/components/sop-manager/sop-manager"
import { FileText, Users, CheckSquare, Shield } from 'lucide-react'

export default function SopManagerPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return <div>Chargement...</div>;
  
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-4">
        <div className="max-w-3xl w-full text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-meutas font-bold text-foreground">Bienvenue sur SOP Manager</h1>
            <p className="text-xl font-meutas text-muted-foreground">
              La plateforme de gestion des procédures opérationnelles standardisées d'Omnigo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-card border border-border rounded-lg">
              <FileText size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-meutas font-semibold mb-2 text-card-foreground">Gestion des procédures</h3>
              <p className="text-center font-meutas text-muted-foreground">Créez, organisez et partagez vos procédures opérationnelles</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card border border-border rounded-lg">
              <Users size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-meutas font-semibold mb-2 text-card-foreground">Groupes d'accès</h3>
              <p className="text-center font-meutas text-muted-foreground">Contrôlez précisément qui a accès à vos procédures</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card border border-border rounded-lg">
              <CheckSquare size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-meutas font-semibold mb-2 text-card-foreground">Étapes illustrées</h3>
              <p className="text-center font-meutas text-muted-foreground">Créez des procédures visuelles et faciles à suivre</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card border border-border rounded-lg">
              <Shield size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-meutas font-semibold mb-2 text-card-foreground">Sécurité</h3>
              <p className="text-center font-meutas text-muted-foreground">Vos données sont protégées et sécurisées</p>
            </div>
          </div>
          

        </div>
      </div>
    );
  }

  return (
    <SOPManager />
  )
}
