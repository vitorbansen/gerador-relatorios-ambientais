'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportCard } from '@/components/ReportCard';
import { ReportForm } from '@/components/ReportForm';
import { Plus, ArrowLeft, CheckCircle, XCircle, AlertCircle, Copy, X, Search } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  answer: string;
  imageUrl?: string;
}

interface Report {
  id: string;
  title: string;
  status: string;
  content: Question[];
  createdAt: string;
  companyName?: string;
}

interface Company {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');

  const [reports, setReports] = useState<Report[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [token, setToken] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastId, setToastId] = useState(0);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [availableReports, setAvailableReports] = useState<Report[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = toastId;
    setToastId(prev => prev + 1);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

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

  const fetchReportDetails = async (reportId: string) => {
    try {
      setLoadingReport(true);
      const response = await fetch(`/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const reportData = await response.json();
        setEditingReport(reportData);
        setShowForm(true);
      } else {
        showToast('Erro ao carregar relatório para edição', 'error');
      }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      showToast('Erro ao carregar relatório para edição', 'error');
    } finally {
      setLoadingReport(false);
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
        setEditingReport(null);
        showToast('Relatório criado com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      showToast('Erro ao criar relatório', 'error');
    }
  };

  const handleUpdateReport = async (formData: { title: string; content: any; status: string }) => {
    if (!editingReport) return;
    try {
      const response = await fetch(`/api/reports/${editingReport.id}`, {
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
        setEditingReport(null);
        setShowForm(false);
        showToast('Relatório atualizado com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao atualizar relatório:', error);
      showToast('Erro ao atualizar relatório', 'error');
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setReports(reports.filter(r => r.id !== id));
        showToast('Relatório excluído com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      showToast('Erro ao excluir relatório', 'error');
    }
  };

  const handleDuplicateReport = async (reportId: string) => {
    if (!companyId) return;
    
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar relatório');
      }

      const originalReport = await response.json();

      const duplicatedData = {
        companyId,
        title: `${originalReport.title} (Cópia)`,
        content: originalReport.content,
        status: 'rascunho',
      };

      const createResponse = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(duplicatedData),
      });

      if (createResponse.ok) {
        const newReport = await createResponse.json();
        setReports([newReport, ...reports]);
        showToast('Relatório duplicado com sucesso!', 'success');
      } else {
        throw new Error('Erro ao criar cópia');
      }
    } catch (error) {
      console.error('Erro ao duplicar relatório:', error);
      showToast('Erro ao duplicar relatório', 'error');
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
        showToast('Relatório exportado com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      showToast('Erro ao exportar relatório', 'error');
    }
  };

  const handleEditReport = (reportId: string) => {
    fetchReportDetails(reportId);
  };

  const handleNewReport = () => {
    setEditingReport(null);
    setShowForm(true);
  };

  const handleNewReportFromTemplate = async () => {
    setLoadingTemplates(true);
    setShowTemplateModal(true);
    try {
      const response = await fetch('/api/reports/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const allReports = await response.json();
        setAvailableReports(allReports);
      }
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      showToast('Erro ao carregar templates', 'error');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleUseTemplate = async (templateReport: Report) => {
    if (!companyId) return;
    
    try {
      const duplicatedData = {
        companyId,
        title: templateReport.title,
        content: templateReport.content,
        status: 'rascunho',
      };

      const createResponse = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(duplicatedData),
      });

      if (createResponse.ok) {
        const newReport = await createResponse.json();
        setReports([newReport, ...reports]);
        setShowTemplateModal(false);
        showToast('Relatório criado a partir do template!', 'success');
      }
    } catch (error) {
      console.error('Erro ao usar template:', error);
      showToast('Erro ao criar relatório do template', 'error');
    }
  };

  const handleFormSubmit = (formData: { title: string; content: any; status: string }) => {
    if (editingReport) {
      handleUpdateReport(formData);
    } else {
      handleCreateReport(formData);
    }
  };

  // Filtrar relatórios pelo termo de busca
  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-72 max-w-md animate-in slide-in-from-right ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <XCircle size={20} />}
            {toast.type === 'info' && <AlertCircle size={20} />}
            <span className="font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

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
            {loadingReport ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando relatório...</p>
              </div>
            ) : (
              <ReportForm
                reportId={editingReport?.id}
                title={editingReport?.title || ''}
                content={editingReport?.content || []}
                status={editingReport?.status || 'rascunho'}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingReport(null);
                }}
              />
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleNewReport}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <Plus size={20} />
                Novo Relatório
              </button>
              <button
                onClick={handleNewReportFromTemplate}
                className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                <Copy size={20} />
                Usar Template
              </button>
            </div>

            {/* Barra de Filtro */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Filtrar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="mt-2 text-sm text-gray-600">
                  {filteredReports.length} relatório(s) encontrado(s)
                </p>
              )}
            </div>
          </>
        )}

        {!showForm && filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Nenhum relatório encontrado com esse título' : 'Nenhum relatório cadastrado'}
            </p>
          </div>
        ) : !showForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onEdit={handleEditReport}
                onDelete={handleDeleteReport}
                onExport={handleExportReport}
                onDuplicate={handleDuplicateReport}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Templates */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Escolher Template de Relatório</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : availableReports.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Nenhum relatório disponível como template</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableReports.map(report => (
                    <div
                      key={report.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleUseTemplate(report)}
                    >
                      <h3 className="font-bold text-gray-800 mb-2">{report.title}</h3>
                      {report.companyName && (
                        <p className="text-xs text-gray-500 mb-2">
                          Empresa: {report.companyName}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mb-2">
                        {report.content.length} pergunta(s)
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'finalizado'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {report.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                        </span>
                        <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                          Usar este →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}