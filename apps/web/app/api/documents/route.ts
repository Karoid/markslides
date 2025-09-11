import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/documents - Get all documents
export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create new document
export async function POST(request: NextRequest) {
  try {
    const { title, content, slideConfig } = await request.json();

    const document = await prisma.document.create({
      data: {
        title: title || 'Untitled',
        content: content || '',
        slideConfig: slideConfig || {},
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Failed to create document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
