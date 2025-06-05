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
        appearance={{
          elements: {
            formButtonPrimary: 'bg-primary hover:bg-primary/90',
            card: 'shadow-md'
          }
        }}
        afterSignUpUrl="/dashboard"
        formFields={[
          {
            name: 'firstName',
            label: 'Prénom',
            type: 'text',
            required: true,
          },
          {
            name: 'lastName',
            label: 'Nom',
            type: 'text',
            required: true,
          }
        ]}
      />
    </div>
  )
} 