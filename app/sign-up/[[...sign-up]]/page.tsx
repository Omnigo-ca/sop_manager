"use client";

import { SignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { UserSync } from '@/components/auth/UserSync';

export default function SignUpPage() {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen">
      <UserSync />
      <SignUp 
        signInUrl="/sign-in"
        routing="path"
        path="/sign-up"
      />
    </div>
  )
} 