import type { Metadata } from 'next'
import './globals.css'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { ClerkProviderWithSync } from '@/components/auth/ClerkProviderWithSync'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProviderWithSync
      appearance={{
        layout: {
          socialButtonsVariant: 'iconButton',
        },
      }}
      afterSignInUrl="/"
      afterSignUpUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en">
        <body>
          <header className="flex justify-between items-center p-4 h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-semibold text-lg">SOP Manager</Link>
            </div>
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton />
                <SignUpButton />
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProviderWithSync>
  )
}
