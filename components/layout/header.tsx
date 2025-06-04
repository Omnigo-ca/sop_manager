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
      href="/admin/manage-sop-access" 
      className="px-4 py-2 text-sm font-medium text-black hover:text-primary transition-colors"
    >
      Associer les procédures
    </Link>
  );
}

export function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-4 h-16 border-b border-black">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-meutas font-bold text-xl text-black hover:text-primary transition-colors">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto inline-block mr-2" />
          SOP Manager
        </Link>
        <SignedIn>
          <AdminNav />
        </SignedIn>
      </div>
      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton>
            <button className="px-4 py-2 font-meutas font-medium text-black hover:text-primary transition-colors">
              Connexion
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-meutas font-semibold rounded-md transition-colors">
              Inscription
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 border-2 border-black rounded-full',
              },
            }}
          />
        </SignedIn>
      </div>
    </header>
  );
} 