'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

// Import SwaggerUI dynamiquement pour éviter les problèmes SSR
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function SwaggerUIPage() {
  const [specs, setSpecs] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier l'environnement côté client
  useEffect(() => {
    // Bloquer l'accès en production
    if (process.env.NODE_ENV === 'production') {
      notFound();
      return;
    }

    // Charger les spécifications Swagger
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => {
        setSpecs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur lors du chargement des specs Swagger:', err);
        setLoading(false);
      });
  }, []);

  // Retourner 404 en production
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement de la documentation API...</div>
      </div>
    );
  }

  if (!specs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Erreur lors du chargement de la documentation</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SwaggerUI spec={specs} />
    </div>
  );
} 