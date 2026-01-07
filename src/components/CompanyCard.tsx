'use client';

import { useState } from 'react';
import { Trash2, FileText, Edit2, MoreVertical, Building2 } from 'lucide-react';

interface Company {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
}

interface CompanyCardProps {
  company: Company;
  onView: (id: string) => void;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

export function CompanyCard({ company, onView, onEdit, onDelete }: CompanyCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-visible">
      {/* Header */}
      <div className="p-5 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1.5 ">
                {company.nomeFantasia}
              </h3>
              <p className="text-sm text-gray-600 mb-1 ">
                {company.razaoSocial}
              </p>
              <p className="text-xs text-gray-500">
                CNPJ: {company.cnpj}
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="relative hidden sm:flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onView(company.id)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              Relatórios
            </button>

            <button
              onClick={() => setShowActions(!showActions)}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />

                <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      onEdit(company);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                    Editar
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    onClick={() => {
                      onDelete(company.id);
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
      </div>

      {/* Mobile Actions */}
      <div className="p-4 sm:hidden grid grid-cols-2 gap-2">
        <button
          onClick={() => onView(company.id)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-600 rounded-lg text-sm col-span-2"
        >
          <FileText className="w-4 h-4" />
          Relatórios
        </button>

        <button
          onClick={() => onEdit(company)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg text-sm"
        >
          <Edit2 className="w-4 h-4" />
          Editar
        </button>

        <button
          onClick={() => onDelete(company.id)}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Excluir
        </button>
      </div>
    </div>
  );
}