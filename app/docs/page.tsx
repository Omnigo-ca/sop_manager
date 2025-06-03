'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import '../api/docs/swagger.css';

export default function ApiDocs() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Documentation API</h1>
      {isClient ? (
        <SwaggerUI url="/api/docs" />
      ) : (
        <div className="flex justify-center items-center h-64">
          <p>Chargement de la documentation...</p>
        </div>
      )}
    </div>
  );
} 