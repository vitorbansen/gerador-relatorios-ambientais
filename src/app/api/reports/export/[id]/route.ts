import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

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

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'pdf';

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: { company: true, user: true },
  });

  if (!report || report.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const content = JSON.parse(report.content);

  if (format === 'pdf') {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Relatório de Inspeção', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Título: ${report.title}`, 20, 40);
    doc.text(`Empresa: ${report.company.nomeFantasia}`, 20, 50);
    doc.text(`Razão Social: ${report.company.razaoSocial}`, 20, 60);
    doc.text(`CNPJ: ${report.company.cnpj}`, 20, 70);
    doc.text(`Responsável: ${report.user.name || report.user.email}`, 20, 80);
    doc.text(`Data: ${new Date(report.createdAt).toLocaleDateString('pt-BR')}`, 20, 90);
    
    doc.line(20, 95, 190, 95);
    
    let y = 105;
    content.forEach((item: any, index: number) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${item.text}`, 20, y);
      y += 7;
      
      doc.setFont('helvetica', 'normal');
      const splitAnswer = doc.splitTextToSize(item.answer, 170);
      doc.text(splitAnswer, 20, y);
      y += (splitAnswer.length * 7) + 10;
    });

    const pdfOutput = doc.output('arraybuffer');
    return new NextResponse(pdfOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio_${report.id}.pdf"`,
      },
    });
  } else {
    // DOCX Export
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Relatório de Inspeção",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: `Título: `, bold: true }),
              new TextRun(report.title),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Empresa: `, bold: true }),
              new TextRun(report.company.nomeFantasia),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Razão Social: `, bold: true }),
              new TextRun(report.company.razaoSocial),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `CNPJ: `, bold: true }),
              new TextRun(report.company.cnpj),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Responsável: `, bold: true }),
              new TextRun(report.user.name || report.user.email),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Data: `, bold: true }),
              new TextRun(new Date(report.createdAt).toLocaleDateString('pt-BR')),
            ],
          }),
          new Paragraph({ text: "" }),
          ...content.flatMap((item: any, index: number) => [
            new Paragraph({
              children: [
                new TextRun({ text: `${index + 1}. ${item.text}`, bold: true }),
              ],
            }),
            new Paragraph({
              text: item.answer,
            }),
            new Paragraph({ text: "" }),
          ]),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="relatorio_${report.id}.docx"`,
      },
    });
  }
}
