'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

// Composant pour la synchronisation automatique des utilisateurs
export function UserSync() {
  const { userId, isLoaded } = useAuth();
  const { isSignedIn } = useUser();

  useEffect(() => {
    // Synchronise l'utilisateur lors de la connexion
    if (isLoaded && userId && isSignedIn) {
      const syncUser = async () => {
        try {
          const response = await fetch('/api/auth/sync-current-user', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            console.error('Erreur lors de la synchronisation automatique');
          }
        } catch (error) {
          console.error('Erreur lors de la synchronisation automatique:', error);
        }
      };
      
      syncUser();
    }
  }, [userId, isLoaded, isSignedIn]);

  return null;
} 