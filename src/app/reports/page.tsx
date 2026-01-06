'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportCard } from '@/components/ReportCard';
import { ReportForm } from '@/components/ReportForm';
import { Plus, ArrowLeft, CheckCircle, XCircle, AlertCircle, Copy, X } from 'lucide-react';

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
          <div className="flex gap-3 mb-8">
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
        )}

        {!showForm && reports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">Nenhum relatório cadastrado</p>
          </div>
        ) : !showForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative px-6 sm:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    Escolher Template
                  </h2>
                  <p className="text-sm text-gray-600">
                    Selecione um relatório existente como base
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-shrink-0 p-2 rounded-full hover:bg-white/80 transition-all duration-200 group"
                >
                  <X size={24} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
              {loadingTemplates ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
                    <div className="absolute inset-0 rounded-full bg-purple-100/20 animate-pulse"></div>
                  </div>
                  <p className="mt-6 text-gray-500 font-medium">Carregando templates...</p>
                </div>
              ) : availableReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Copy size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium mb-2">Nenhum template disponível</p>
                  <p className="text-gray-400 text-sm text-center max-w-md">
                    Crie alguns relatórios primeiro para usá-los como templates
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {availableReports.map(report => (
                    <div
                      key={report.id}
                      onClick={() => handleUseTemplate(report)}
                      className="group relative bg-white rounded-xl border-2 border-gray-100 p-5 hover:border-purple-200 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300" />
                      
                      <div className="relative">
                        {/* Header with status badge */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight line-clamp-2 flex-1 group-hover:text-purple-600 transition-colors">
                            {report.title}
                          </h3>
                          <span
                            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              report.status === 'finalizado'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {report.status === 'finalizado' ? '✓ Finalizado' : '◐ Rascunho'}
                          </span>
                        </div>

                        {/* Company name */}
                        {report.companyName && (
                          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            <span className="font-medium truncate">{report.companyName}</span>
                          </div>
                        )}

                        {/* Questions count */}
                        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                            <span className="font-bold text-purple-600">{report.content.length}</span>
                          </div>
                          <span className="font-medium">
                            {report.content.length === 1 ? 'pergunta' : 'perguntas'}
                          </span>
                        </div>

                        {/* Action button */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-sm font-medium text-gray-400 group-hover:text-purple-600 transition-colors">
                            Clique para usar
                          </span>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 group-hover:bg-purple-600 transition-all duration-300">
                            <svg 
                              className="w-4 h-4 text-purple-600 group-hover:text-white transition-colors group-hover:translate-x-0.5" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-gray-100 bg-white">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                <span className="font-medium">
                  {availableReports.length > 0 && `${availableReports.length} template${availableReports.length !== 1 ? 's' : ''} disponív${availableReports.length !== 1 ? 'eis' : ''}`}
                </span>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}