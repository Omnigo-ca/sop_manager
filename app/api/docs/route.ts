import { NextResponse } from 'next/server';
import specs from '@/lib/swagger';

export async function GET() {
  // En production, on peut limiter l'accès aux specs JSON aussi si souhaité
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Documentation not available in production' }, { status: 404 });
  }
  
  return NextResponse.json(specs);
} 