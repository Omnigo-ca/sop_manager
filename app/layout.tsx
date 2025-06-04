import type { Metadata } from 'next'
import './globals.css'
import '../public/fonts/Meutas.css'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { ClerkProviderWithSync } from '@/components/auth/ClerkProviderWithSync'
import Link from 'next/link'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'SOP Manager',
  description: 'Gestionnaire de procédures opérationnelles standardisées',
  icons: {
    icon: '/favicon.png',
  },
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
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary-light',
          footerActionLink: 'text-primary hover:text-primary-light',
        },
      }}
      afterSignInUrl="/"
      afterSignUpUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="fr">
        <head>
          <link rel="icon" href="/favicon.png" />
        </head>
        <body className="min-h-screen bg-white">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            storageKey="sop-manager-theme"
          >
            <header className="flex justify-between items-center px-6 py-4 h-16 border-b border-black">
              <div className="flex items-center gap-4">
                <Link href="/" className="font-meutas font-bold text-xl text-black hover:text-primary transition-colors">
                  <img src="/logo.png" alt="Logo" className="h-8 w-auto inline-block mr-2" />
                  SOP Manager
                </Link>
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
            <main className="container mx-auto px-6 py-8">
              {children}
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProviderWithSync>
  )
}
