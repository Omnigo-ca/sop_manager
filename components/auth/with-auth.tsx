"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

/**
 * Composant d'ordre supérieur (HOC) qui assure la synchronisation de l'utilisateur
 * avec la base de données et protège les pages qui nécessitent une authentification
 * 
 * @param Component Le composant à envelopper
 * @returns Un composant avec authentification et synchronisation
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    const { isSignedIn, isLoaded, user } = useUser();
    const router = useRouter();
    const [isSynced, setIsSynced] = useState(false);

    useEffect(() => {
      // Si l'utilisateur est connecté, synchroniser ses données avec la base de données
      if (isLoaded && isSignedIn && user) {
        // Appel à l'API pour synchroniser l'utilisateur
        fetch('/api/auth/sync-current-user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
          .then((res) => {
            if (res.ok) {
              setIsSynced(true);
            } else {
              console.error('Erreur lors de la synchronisation de l\'utilisateur');
            }
          })
          .catch((error) => {
            console.error('Erreur:', error);
          });
      }
    }, [isLoaded, isSignedIn, user]);

    // Afficher un écran de chargement pendant le chargement de l'authentification
    if (!isLoaded) {
      return <div className="flex justify-center items-center h-screen">Chargement...</div>;
    }

    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    if (!isSignedIn) {
      router.push('/sign-in');
      return <div className="flex justify-center items-center h-screen">Redirection...</div>;
    }

    // Afficher un écran de chargement pendant la synchronisation
    if (!isSynced) {
      return <div className="flex justify-center items-center h-screen">Synchronisation...</div>;
    }

    // Rendre le composant avec les props une fois l'utilisateur authentifié et synchronisé
    return <Component {...props} />;
  };
} 