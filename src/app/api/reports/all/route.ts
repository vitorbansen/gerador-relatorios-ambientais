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

  try {
    // Busca todos os relatórios do usuário de todas as empresas
    const reports = await prisma.report.findMany({
      where: { userId },
      include: {
        company: {
          select: {
            nomeFantasia: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Formata os reports para incluir o nome da empresa e parsear o content
    const formattedReports = reports.map(report => ({
      id: report.id,
      title: report.title,
      status: report.status,
      content: typeof report.content === 'string' ? JSON.parse(report.content) : report.content,
      createdAt: report.createdAt,
      companyName: report.company.nomeFantasia,
    }));

    return NextResponse.json(formattedReports);
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}