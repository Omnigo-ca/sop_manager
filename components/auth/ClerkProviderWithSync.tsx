'use client';

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import type { PropsWithChildren } from 'react';
import { UserSync } from './UserSync';

// Wrapper personnalisé du ClerkProvider avec synchronisation automatique
export function ClerkProviderWithSync({ children, ...props }: PropsWithChildren<React.ComponentProps<typeof ClerkProvider>>) {
  return (
    <ClerkProvider {...props}>
      <UserSync />
      {children}
    </ClerkProvider>
  );
} 