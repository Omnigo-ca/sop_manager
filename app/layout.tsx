import type { Metadata } from 'next'
import './globals.css'
import '../public/fonts/Meutas.css'
import { ClerkProviderWithSync } from '@/components/auth/ClerkProviderWithSync'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/layout/header'

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
        <body className="min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            storageKey="sop-manager-theme"
          >
            <Header />
            <main className="container mx-auto px-6 py-8">
              {children}
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProviderWithSync>
  )
}
