'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyCard } from '@/components/CompanyCard';
import { CompanyForm } from '@/components/CompanyForm';
import { Plus, LogOut } from 'lucide-react';

interface Company {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(undefined);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
      return;
    }
    setToken(storedToken);
    fetchCompanies(storedToken);
  }, [router]);

  const fetchCompanies = async (authToken: string) => {
    try {
      const response = await fetch('/api/companies', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (formData: Company) => {
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newCompany = await response.json();
        setCompanies([newCompany, ...companies]);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
    }
  };

  const handleUpdateCompany = async (formData: Company) => {
    if (!editingCompany?.id) return;
    try {
      const response = await fetch(`/api/companies/${editingCompany.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedCompany = await response.json();
        setCompanies(companies.map(c => c.id === updatedCompany.id ? updatedCompany : c));
        setEditingCompany(undefined);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setCompanies(companies.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleViewReports = (companyId: string) => {
    router.push(`/reports?companyId=${companyId}`);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleFormSubmit = (formData: Company) => {
    if (editingCompany) {
      handleUpdateCompany(formData);
    } else {
      handleCreateCompany(formData);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Empresas</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {showForm ? (
          <div className="mb-8">
            <CompanyForm
              company={editingCompany}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingCompany(undefined);
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 mb-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <Plus size={20} />
            Nova Empresa
          </button>
        )}

        {companies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">Nenhuma empresa cadastrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map(company => (
              <CompanyCard
                key={company.id}
                company={company}
                onView={handleViewReports}
                onEdit={handleEditCompany}
                onDelete={handleDeleteCompany}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
