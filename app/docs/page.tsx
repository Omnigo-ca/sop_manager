'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function ApiDocs() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 font-meutas">Documentation API</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-meutas">API REST</CardTitle>
            <CardDescription>
              Documentation complète de l'API REST pour la gestion des SOPs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Accédez aux endpoints pour créer, lire, mettre à jour et supprimer les procédures opérationnelles.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button asChild>
                <a href="/api/docs" target="_blank" rel="noopener noreferrer">
                  JSON Specs
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Button asChild variant="outline">
                  <a href="/api/docs/swagger-ui" target="_blank" rel="noopener noreferrer">
                    Interface Interactive
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-meutas">Authentification</CardTitle>
            <CardDescription>
              Guide d'authentification et autorisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Informations sur l'utilisation de Clerk pour l'authentification et la gestion des permissions.
            </p>
            <Button variant="outline" disabled>
              Bientôt disponible
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-meutas">Webhooks</CardTitle>
            <CardDescription>
              Configuration et utilisation des webhooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Documentation pour configurer les webhooks et recevoir les notifications d'événements.
            </p>
            <Button variant="outline" disabled>
              Bientôt disponible
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-meutas">Démarrage rapide</CardTitle>
            <CardDescription>
              Guide pour commencer à utiliser l'API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-meutas font-semibold mb-2">1. Authentification</h3>
              <p className="text-sm text-muted-foreground">
                Obtenez vos clés d'API via votre profil utilisateur.
              </p>
            </div>
            <div>
              <h3 className="font-meutas font-semibold mb-2">2. Première requête</h3>
              <p className="text-sm text-muted-foreground">
                Testez votre configuration en récupérant la liste des SOPs.
              </p>
            </div>
            <div>
              <h3 className="font-meutas font-semibold mb-2">3. Intégration</h3>
              <p className="text-sm text-muted-foreground">
                Intégrez l'API dans votre application selon vos besoins.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 