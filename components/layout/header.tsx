"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import { ThemeToggle } from '../theme-toggle';
import { useTheme } from '../theme-provider';

function AdminNav() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        setIsAdmin(data.role === 'ADMIN');
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      });
  }, []);

  if (!isAdmin) return null;

  return (
    <Link 
      href="/admin/manage-access-groups" 
      className="px-4 py-2 text-xl font-meutas font-medium text-foreground hover:text-primary transition-colors"
    >
      Groupes d'accès
    </Link>
  );
}

export function Header() {
  const { theme } = useTheme();
  
  return (
    <header className="flex justify-between items-center px-6 py-4 h-16 border-b border-border bg-background">
      <div className="flex items-center">
        <img 
          src={theme === 'dark' ? "/logo_white.svg" : "/logo_black.png"} 
          alt="Logo" 
          className="h-16 w-auto" 
        />
      </div>
      
      <div className="flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
        <Link href="/" className="font-meutas font-bold text-xl text-foreground hover:text-primary transition-colors">
          SOP Manager
        </Link>
        <SignedIn>
          <AdminNav />
        </SignedIn>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <SignedOut>
          <SignInButton>
            <button className="px-4 py-2 font-meutas font-medium text-foreground hover:text-primary transition-colors">
              Connexion
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-meutas font-semibold rounded-md transition-colors border border-border">
              Inscription
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 border-2 border-border rounded-full',
              },
            }}
          />
        </SignedIn>
      </div>
    </header>
  );
} 