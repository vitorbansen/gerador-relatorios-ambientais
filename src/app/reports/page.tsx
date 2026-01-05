
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import { useRouter } from 'next/navigation';
import { ReportCard } from '@/components/ReportCard';
import { ReportForm } from '@/components/ReportForm';
import { Plus, ArrowLeft } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface Company {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');

  const [reports, setReports] = useState<Report[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | undefined>(undefined);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken || !companyId) {
      router.push('/companies');
      return;
    }
    setToken(storedToken);
    fetchCompanyAndReports(storedToken, companyId);
  }, [router, companyId]);

  const fetchCompanyAndReports = async (authToken: string, cId: string) => {
    try {
      const [companyRes, reportsRes] = await Promise.all([
        fetch(`/api/companies/${cId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch(`/api/reports?companyId=${cId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      if (companyRes.ok) {
        const companyData = await companyRes.json();
        setCompany(companyData);
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (formData: { title: string; content: any; status: string }) => {
    if (!companyId) return;
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId,
          title: formData.title,
          content: formData.content,
          status: formData.status,
        }),
      });
      if (response.ok) {
        const newReport = await response.json();
        setReports([newReport, ...reports]);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
    }
  };

  const handleUpdateReport = async (formData: { title: string; content: any; status: string }) => {
    if (!editingReportId) return;
    try {
      const response = await fetch(`/api/reports/${editingReportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedReport = await response.json();
        setReports(reports.map(r => r.id === updatedReport.id ? updatedReport : r));
        setEditingReportId(undefined);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar relatório:', error);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) return;
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setReports(reports.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
    }
  };

  const handleExportReport = async (id: string, format: 'pdf' | 'docx') => {
    try {
      const response = await fetch(`/api/reports/export/${id}?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio.${format === 'pdf' ? 'pdf' : 'docx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    }
  };

  const handleEditReport = (reportId: string) => {
    setEditingReportId(reportId);
    setShowForm(true);
  };

  const handleFormSubmit = (formData: { title: string; content: any; status: string }) => {
    if (editingReportId) {
      handleUpdateReport(formData);
    } else {
      handleCreateReport(formData);
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
          <div>
            <button
              onClick={() => router.push('/companies')}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-2"
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Relatórios - {company?.nomeFantasia}
            </h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {showForm ? (
          <div className="mb-8">
            <ReportForm
              reportId={editingReportId}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingReportId(undefined);
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 mb-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <Plus size={20} />
            Novo Relatório
          </button>
        )}

        {reports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">Nenhum relatório cadastrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onEdit={handleEditReport}
                onDelete={handleDeleteReport}
                onExport={handleExportReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
