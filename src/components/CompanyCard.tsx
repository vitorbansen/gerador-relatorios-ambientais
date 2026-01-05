'use client';

import { Trash2, FileText, Edit2 } from 'lucide-react';

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
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">{company.nomeFantasia}</h3>
        <p className="text-sm text-gray-600 mt-1">{company.razaoSocial}</p>
        <p className="text-sm text-gray-500 mt-2">CNPJ: {company.cnpj}</p>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => onView(company.id)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          <FileText size={16} />
          Relatórios
        </button>
        <button
          onClick={() => onEdit(company)}
          className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm"
        >
          <Edit2 size={16} />
          Editar
        </button>
        <button
          onClick={() => onDelete(company.id)}
          className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
        >
          <Trash2 size={16} />
          Excluir
        </button>
      </div>
    </div>
  );
}
