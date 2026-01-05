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

export async function GET(request: Request) {
  const userId = await getUserIdFromToken(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  if (!companyId) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });

  const reports = await prisma.report.findMany({
    where: { companyId, userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromToken(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { companyId, title, content, status } = await request.json();
  const report = await prisma.report.create({
    data: {
      userId,
      companyId,
      title,
      content: JSON.stringify(content || []),
      status: status || 'rascunho',
    },
  });
  return NextResponse.json(report);
}
