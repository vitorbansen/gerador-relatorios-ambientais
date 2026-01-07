'use client';

import { useState } from 'react';
import {
  Trash2,
  Edit2,
  Download,
  Copy,
  MoreVertical,
  FileText,
  Calendar
} from 'lucide-react';

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export function ReportCard({
  report,
  onEdit,
  onDelete,
  onExport,
  onDuplicate,
}: ReportCardProps) {
  const [openExport, setOpenExport] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const statusConfig =
    report.status === 'finalizado'
      ? {
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Finalizado',
        }
      : {
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Rascunho',
        };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-visible">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1 line-clamp-2">
                {report.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(report.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => {
                setShowActions(!showActions);
                setOpenExport(false);
              }}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => {
                    setShowActions(false);
                    setOpenExport(false);
                  }}
                />

                <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      onEdit(report.id);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                    Editar
                  </button>

                  <button
                    onClick={() => {
                      onDuplicate(report.id);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                    Duplicar
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setOpenExport(!openExport)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <Download className="w-4 h-4 text-gray-400" />
                      Exportar
                    </button>

                    {openExport && (
                      <div className="absolute left-full top-0 ml-1 w-32 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-30">
                        <button
                          onClick={() => {
                            onExport(report.id, 'pdf');
                            setOpenExport(false);
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => {
                            onExport(report.id, 'docx');
                            setOpenExport(false);
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          Word
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    onClick={() => {
                      onDelete(report.id);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${statusConfig.color}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
          {statusConfig.label}
        </span>
      </div>

      {/* Mobile Actions */}
      <div className="p-4 sm:hidden grid grid-cols-2 gap-2">
        <button
          onClick={() => onEdit(report.id)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg text-sm"
        >
          <Edit2 className="w-4 h-4" />
          Editar
        </button>

        <button
          onClick={() => onDuplicate(report.id)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg text-sm"
        >
          <Copy className="w-4 h-4" />
          Duplicar
        </button>

        <button
          onClick={() => onDelete(report.id)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm col-span-2"
        >
          <Trash2 className="w-4 h-4" />
          Excluir
        </button>
      </div>
    </div>
  );
}
