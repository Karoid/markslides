import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/documents/[id] - Get document by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const document = await prisma.document.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Failed to fetch document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[id] - Update document
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { name, content, slideConfig } = await request.json();

    const document = await prisma.document.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        content,
        slideConfig,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Failed to update document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete document
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // 문서 존재 확인
        const document = await prisma.document.findUnique({
            where: { id },
        });

        if (!document) {
            return NextResponse.json(
                { success: false, message: 'Document not found' },
                { status: 404 }
            );
        }

        // 문서 삭제 (연관된 이미지는 CASCADE로 자동 삭제)
        await prisma.document.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Document deleted successfully',
        });
    } catch (error) {
        console.error('Failed to delete document:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete document' },
            { status: 500 }
        );
    }
}