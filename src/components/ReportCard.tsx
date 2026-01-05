'use client';

import { useState, useEffect, useRef } from 'react';
import { Trash2, Edit2, Download } from 'lucide-react';
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
}

export function ReportCard({
  report,
  onEdit,
  onDelete,
  onExport,
}: ReportCardProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const statusColor =
    report.status === 'finalizado'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">{report.title}</h3>

        <p className="text-sm text-gray-500 mt-2">
          Criado em: {formatDate(report.createdAt)}
        </p>

        <div className="mt-3">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
          >
            {report.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
          </span>
        </div>
      </div>

      <div className="flex gap-2 justify-end flex-wrap">
        {/* Editar */}
        <button
          onClick={() => onEdit(report.id)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          <Edit2 size={16} />
          Editar
        </button>

        {/* Exportar */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen(prev => !prev)}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
          >
            <Download size={16} />
            Exportar
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
              <button
                onClick={() => {
                  onExport(report.id, 'pdf');
                  setOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                PDF
              </button>

              <button
                onClick={() => {
                  onExport(report.id, 'docx');
                  setOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-300"
              >
                Word
              </button>
            </div>
          )}
        </div>

        {/* Excluir */}
        <button
          onClick={() => onDelete(report.id)}
          className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
        >
          <Trash2 size={16} />
          Excluir
        </button>
      </div>
    </div>
  );
}
