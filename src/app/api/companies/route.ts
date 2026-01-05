import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = getUserFromToken(request);

  if (!user) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    where: { userId: user.userId }
  });

  return NextResponse.json(companies);
}

export async function POST(request: NextRequest) {
  const user = getUserFromToken(request);

  if (!user) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const data = await request.json();

  const company = await prisma.company.create({
    data: {
      ...data,
      userId: user.userId
    }
  });

  return NextResponse.json(company);
}
