import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-2 sm:space-y-0">
          <p className="text-sm text-black font-meutas">
            © 2025 Omnigo. Tous droits réservés.
          </p>
          <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/politique-confidentialite" 
              className="text-sm text-black font-meutas transition-colors bg-primary px-2 py-1 rounded"
            >
              Politique de confidentialité
            </Link>
            <Link 
              href="/conditions-utilisation" 
              className="text-sm text-black font-meutas transition-colors bg-primary px-2 py-1 rounded"
            >
              Conditions d'utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 