// src/app/api/reports/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserIdFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

/* =========================
   GET REPORT BY ID
========================= */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: { company: true, user: true }
  });

  if (!report || report.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Parse o content de string JSON para array
  const parsedReport = {
    ...report,
    content: JSON.parse(report.content)
  };

  return NextResponse.json(parsedReport);
}

/* =========================
   UPDATE REPORT
========================= */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { title, content, status } = await request.json();

  // Verifica se o relatório pertence ao usuário
  const existingReport = await prisma.report.findUnique({
    where: { id }
  });

  if (!existingReport || existingReport.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const report = await prisma.report.update({
    where: { id },
    data: { 
      title, 
      content: typeof content === 'string' ? content : JSON.stringify(content), 
      status 
    },
  });

  return NextResponse.json(report);
}

/* =========================
   DELETE REPORT
========================= */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Verifica se o relatório pertence ao usuário
  const existingReport = await prisma.report.findUnique({
    where: { id }
  });

  if (!existingReport || existingReport.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.report.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}