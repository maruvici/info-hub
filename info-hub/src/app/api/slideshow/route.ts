import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  // Path to your images folder inside 'public'
  const imagesDirectory = path.join(process.cwd(), 'public/landing-page-slideshow');
  
  try {
    const fileNames = fs.readdirSync(imagesDirectory);
    
    // Filter for common image extensions
    const images = fileNames.filter(file => 
      /\.(jpg|jpeg|png|webp|avif)$/i.test(file)
    ).map(file => `/landing-page-slideshow/${file}`);

    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json([]);
  }
}