'use client';

import { useState } from 'react';
import { Trash2, Edit2, Download, Copy } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Report {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface ReportCardProps {
  report: Report;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string, format: 'pdf' | 'docx') => void;
  onDuplicate: (id: string) => void;
}

export function ReportCard({
  report,
  onEdit,
  onDelete,
  onExport,
  onDuplicate,
}: ReportCardProps) {
  const [openExport, setOpenExport] = useState(false);

  const statusColor =
    report.status === 'finalizado'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 break-words">
          {report.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Criado em: {formatDate(report.createdAt)}
        </p>
        <div className="mt-3">
          <span
            className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusColor}`}
          >
            {report.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
          </span>
        </div>
      </div>

      {/* MOBILE */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <button
          onClick={() => onEdit(report.id)}
          className="flex items-center justify-center gap-1.5 px-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
        >
          <Edit2 size={14} />
          Editar
        </button>

        <button
          onClick={() => onDuplicate(report.id)}
          className="flex items-center justify-center gap-1.5 px-2 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs"
        >
          <Copy size={14} />
          Copiar
        </button>

        <div className="relative">
          <button
            onClick={() => setOpenExport((prev) => !prev)}
            className="flex items-center justify-center gap-1.5 px-2 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs w-full"
          >
            <Download size={14} />
            Exportar
          </button>

          {openExport && (
            <div className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20">
              <button
                onClick={() => {
                  onExport(report.id, 'pdf');
                  setOpenExport(false);
                }}
                className="block w-full text-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
              >
                PDF
              </button>
              <button
                onClick={() => {
                  onExport(report.id, 'docx');
                  setOpenExport(false);
                }}
                className="block w-full text-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 border-t"
              >
                Word
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => onDelete(report.id)}
          className="flex items-center justify-center gap-1.5 px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
        >
          <Trash2 size={14} />
          Excluir
        </button>
      </div>

      {/* TABLET / DESKTOP */}
      <div className="hidden sm:flex gap-2 flex-wrap justify-center">
        <button
          onClick={() => onEdit(report.id)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          <Edit2 size={16} />
          <span className="hidden md:inline">Editar</span>
        </button>

        <button
          onClick={() => onDuplicate(report.id)}
          className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
        >
          <Copy size={16} />
          <span className="hidden md:inline">Copiar</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setOpenExport((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
          >
            <Download size={16} />
            <span className="hidden md:inline">Exportar</span>
          </button>

          {openExport && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
              <button
                onClick={() => {
                  onExport(report.id, 'pdf');
                  setOpenExport(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                PDF
              </button>
              <button
                onClick={() => {
                  onExport(report.id, 'docx');
                  setOpenExport(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
              >
                Word
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => onDelete(report.id)}
          className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
        >
          <Trash2 size={16} />
          <span className="hidden md:inline">Excluir</span>
        </button>
      </div>
    </div>
  );
}
