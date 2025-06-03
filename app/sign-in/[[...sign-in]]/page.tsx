"use client";

import { SignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react';
import { UserSync } from '@/components/auth/UserSync';

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <UserSync />
      <SignIn
        signUpUrl="/sign-up"
        routing="path"
        path="/sign-in"
      />
    </div>
  )
} 