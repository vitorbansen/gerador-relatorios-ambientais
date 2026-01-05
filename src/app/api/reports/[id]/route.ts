import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserIdFromToken(request: Request) {
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromToken(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: { company: true, user: true }
  });

  if (!report || report.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(report);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromToken(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, content, status } = await request.json();
  const report = await prisma.report.update({
    where: { id: params.id },
    data: { 
      title, 
      content: typeof content === 'string' ? content : JSON.stringify(content), 
      status 
    },
  });

  return NextResponse.json(report);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const userId = await getUserIdFromToken(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.report.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
