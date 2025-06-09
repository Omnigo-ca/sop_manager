import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server';

// Applique le middleware Clerk pour la gestion de l'authentification
export default clerkMiddleware((auth, req: NextRequest) => {
  // Bloquer l'accès à toute la documentation Swagger en production
  if (process.env.NODE_ENV === 'production') {
    if (req.nextUrl.pathname.startsWith('/api/docs')) {
      return NextResponse.json({ error: 'Documentation not available in production' }, { status: 404 });
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 