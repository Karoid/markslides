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
    const { name, content, slideConfig, folderId } = await request.json();

    const document = await prisma.document.create({
      data: {
        name: name || 'Untitled Document',
        content: content || '',
        slideConfig: slideConfig || {},
        folderId: folderId || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: document.id,
        type: 'document',
        name: document.name,
        content: document.content,
        slideConfig: document.slideConfig,
        folderId: document.folderId,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        lastOpenedAt: document.lastOpenedAt,
      },
    });
  } catch (error) {
    console.error('Failed to create document:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create document' },
      { status: 500 }
    );
  }
}
