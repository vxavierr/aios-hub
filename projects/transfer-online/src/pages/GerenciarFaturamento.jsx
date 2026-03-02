import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Loader2,
  Receipt,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Eye,
  Plus,
  Trash2,
  Edit,
  ParkingCircle,
  Timer,
  Filter,
  X,
  Users,
  Building2,
  Calendar,
  Mail, // Added Mail icon
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GerenciarFaturamento() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [supplier, setSupplier] = useState(null);

  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState(null);
  const [approvedExpenses, setApprovedExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    type: 'estacionamento',
    value: '',
    quantity_minutes: '',
    description: ''
  });
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isApprovingReview, setIsApprovingReview] = useState(false);

  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    period_start: '',
    period_end: '',
    external_reviewer_email: ''
  });
  const [sendOption, setSendOption] = useState(''); // 'email' or 'download'
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState(null);
  const [showInvoiceDetailsDialog, setShowInvoiceDetailsDialog] = useState(false);
  const [showCompleteInvoiceDialog, setShowCompleteInvoiceDialog] = useState(false);
  const [completingInvoice, setCompletingInvoice] = useState(null);
  const [invoiceCompleteData, setInvoiceCompleteData] = useState({
    due_date: '',
    receipt_number: '',
    payment_method_description: '',
    bank_account_details: '',
    nf_number: ''
  });

  // Estados de Filtros
  const [filters, setFilters] = useState({
    client_id: 'all',
    user_id: 'all',
    billing_responsible_user_id: 'all',
    cost_center_code: 'all',
    billing_method: 'all',
    date_start: '',
    date_end: ''
  });
  const [groupBy, setGroupBy] = useState('none');

  // Estados para Invoices
  const [invoiceFilters, setInvoiceFilters] = useState({
    start: '',
    end: '',
    finance_status: 'all'
  });
  const [expandedGroups, setExpandedGroups] = useState({}); // Controle de expansão dos grupos
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    is_full_payment: false
  });

  const [showEditBookingDialog, setShowEditBookingDialog] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editPriceValue, setEditPriceValue] = useState('');

  const queryClient = useQueryClient();

  // Resetar expansão quando o agrupamento ou filtros mudarem
  useEffect(() => {
    if (groupBy === 'none') {
      setExpandedGroups({ 'Todas as Viagens': true });
    } else {
      setExpandedGroups({}); // Padrão recolhido para agrupamentos
    }
  }, [groupBy, filters]);

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        const isAdmin = currentUser.role === 'admin';
        const isSupplier = currentUser.supplier_id && !isAdmin;

        if (!isSupplier) {
          alert('Acesso restrito a fornecedores.');
          window.location.href = '/';
          return;
        }

        setUser(currentUser);
        const suppliers = await base44.entities.Supplier.list();
        const supplierData = suppliers.find(p => p.id === currentUser.supplier_id);

        if (!supplierData) {
          alert('Dados do fornecedor não encontrados.');
          window.location.href = '/';
          return;
        }

        setSupplier(supplierData);
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        base44.auth.redirectToLogin();
      }
    };

    checkAuth();
  }, []);

  const { data: requestsAwaitingReview = [] } = useQuery({
    queryKey: ['requestsAwaitingReview', user?.supplier_id],
    queryFn: async () => {
      if (!user?.supplier_id) return [];
      return await base44.entities.ServiceRequest.filter({
        chosen_supplier_id: user.supplier_id,
        status: 'aguardando_revisao_fornecedor'
      });
    },
    enabled: !!user?.supplier_id,
    refetchInterval: 30000,
    initialData: []
  });

  const { data: billableRequests = [] } = useQuery({
    queryKey: ['billableRequests', user?.supplier_id],
    queryFn: async () => {
      if (!user?.supplier_id) return [];
      
      // 1. Buscar ServiceRequests (Corporativo Plataforma)
      const requests = await base44.entities.ServiceRequest.filter({
        chosen_supplier_id: user.supplier_id,
        supplier_billing_status: 'pendente_faturamento',
        status: 'concluida'
      });

      // 2. Buscar SupplierOwnBookings (Clientes Próprios)
      let ownBookings = [];
      try {
        ownBookings = await base44.entities.SupplierOwnBooking.filter({
          supplier_id: user.supplier_id,
          status: 'concluida',
          payment_status: 'pendente'
        });
      } catch (e) {
        console.warn('Erro ao buscar viagens próprias faturáveis:', e);
      }

      // Normalizar dados para interface unificada
      const normalizedRequests = requests.map(r => ({ ...r, type: 'ServiceRequest', origin_type: 'corporate' }));
      const normalizedOwnBookings = ownBookings.map(b => ({
        ...b,
        type: 'SupplierOwnBooking',
        origin_type: 'own',
        request_number: b.booking_number,
        chosen_supplier_cost: b.price || 0,
        total_additional_expenses_approved: 0,
        user_id: null,
        billing_responsible_name: b.passenger_name
      }));

      return [...normalizedRequests, ...normalizedOwnBookings];
    },
    enabled: !!user?.supplier_id,
    refetchInterval: 30000,
    initialData: []
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients', user?.supplier_id],
    queryFn: async () => {
      const platformClients = await base44.entities.Client.list();
      
      let ownClients = [];
      if (user?.supplier_id) {
        try {
          ownClients = await base44.entities.SupplierOwnClient.filter({
            supplier_id: user.supplier_id
          });
        } catch (e) {
          console.error('Erro ao buscar clientes próprios:', e);
        }
      }

      // Unificar listas
      return [
        ...platformClients.map(c => ({ ...c, type: 'corporate', origin: 'Plataforma' })),
        ...ownClients.map(c => ({ ...c, type: 'own', origin: 'Próprio' }))
      ];
    },
    initialData: []
  });

  const { data: users = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      try {
        console.log('🔍 [users] Chamando função backend listAllUsers...');
        const response = await base44.functions.invoke('listAllUsers');
        const allUsers = response.data.users || [];
        console.log('✅ [users] Usuários carregados:', allUsers.length);
        console.log('✅ [users] Primeiros 3 usuários:', allUsers.slice(0, 3).map(u => ({
          id: u.id,
          full_name: u.full_name,
          email: u.email
        })));
        return allUsers;
      } catch (error) {
        console.error('❌ [users] Erro ao carregar usuários:', error);
        return [];
      }
    },
    initialData: []
  });

  const { data: allSupplierServiceRequests = [] } = useQuery({
    queryKey: ['allSupplierServiceRequests', supplier?.id],
    queryFn: async () => {
      if (!supplier?.id) return [];
      const requests = await base44.entities.ServiceRequest.filter({
        chosen_supplier_id: supplier.id,
      });
      return requests;
    },
    enabled: !!supplier,
    initialData: []
  });

  const { data: allSupplierOwnBookings = [] } = useQuery({
    queryKey: ['allSupplierOwnBookings', supplier?.id],
    queryFn: async () => {
      if (!supplier?.id) return [];
      return await base44.entities.SupplierOwnBooking.filter({
        supplier_id: supplier.id,
      });
    },
    enabled: !!supplier,
    initialData: []
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['supplierInvoices', user?.supplier_id],
    queryFn: async () => {
      if (!user?.supplier_id) return [];
      return await base44.entities.SupplierInvoice.filter({
        supplier_id: user.supplier_id
      }, '-created_date');
    },
    enabled: !!user?.supplier_id,
    refetchInterval: 30000,
    initialData: []
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('createSupplierInvoice', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billableRequests'] });
      queryClient.invalidateQueries({ queryKey: ['supplierInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['allSupplierServiceRequests'] });
      setSuccess('Fatura criada e enviada para revisão!');
      setShowInvoiceDialog(false);
      setSelectedRequests([]);
      setInvoiceData({ period_start: '', period_end: '', external_reviewer_email: '' });
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao criar fatura');
    }
  });

  const approveReviewMutation = useMutation({
    mutationFn: async ({ requestId, approvedExpenses, reviewNotes }) => {
      const response = await base44.functions.invoke('approveServiceRequestExpenses', {
        serviceRequestId: requestId,
        approvedExpenses,
        reviewNotes
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestsAwaitingReview'] });
      queryClient.invalidateQueries({ queryKey: ['billableRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allSupplierServiceRequests'] });
      setSuccess('Revisão aprovada! A viagem está pronta para faturamento.');
      setShowReviewDialog(false);
      setReviewingRequest(null);
      setApprovedExpenses([]);
      setReviewNotes('');
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (error) => {
      setReviewError(error.message || 'Erro ao aprovar revisão');
    }
  });

  const approveInvoiceMutation = useMutation({
    mutationFn: async (invoice) => {
      await base44.entities.SupplierInvoice.update(invoice.id, {
        status: 'aprovada_externamente',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      });
      return invoice;
    },
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ['supplierInvoices'] });
      setSuccess('Fatura aprovada! Agora preencha os dados de cobrança.');
      setTimeout(() => setSuccess(''), 3000);
      // Abrir dialog para completar dados da fatura
      handleOpenCompleteInvoice(invoice);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao aprovar fatura');
    }
  });

  const completeInvoiceMutation = useMutation({
    mutationFn: async ({ invoiceId, data }) => {
      await base44.entities.SupplierInvoice.update(invoiceId, {
        ...data,
        status: 'faturado_aguardando_pgto'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierInvoices'] });
      setSuccess('Dados de cobrança salvos! Fatura pronta para envio ao cliente.');
      setShowCompleteInvoiceDialog(false);
      setCompletingInvoice(null);
      setInvoiceCompleteData({
        due_date: '',
        receipt_number: '',
        payment_method_description: '',
        bank_account_details: '',
        nf_number: ''
      });
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao salvar dados de cobrança');
    }
  });

  const registerPaymentMutation = useMutation({
    mutationFn: async ({ invoiceId, data }) => {
      const updateData = {
        paid_amount: (paymentInvoice.paid_amount || 0) + parseFloat(data.amount),
        payment_date: new Date(data.date).toISOString(),
        payment_notes: data.notes ? `${paymentInvoice.payment_notes || ''}\n[${format(new Date(), 'dd/MM/yyyy')}] ${data.notes}` : paymentInvoice.payment_notes,
        finance_status: data.is_full_payment ? 'paid_full' : 'paid_partial',
      };

      // Se for pagamento total, atualiza status geral também
      if (data.is_full_payment) {
        updateData.status = 'paga';
      }

      await base44.entities.SupplierInvoice.update(invoiceId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierInvoices'] });
      setSuccess('Pagamento registrado com sucesso!');
      setShowPaymentDialog(false);
      setPaymentInvoice(null);
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao registrar pagamento');
    }
  });

  const updateBookingPriceMutation = useMutation({
    mutationFn: async ({ id, price }) => {
      await base44.entities.SupplierOwnBooking.update(id, {
        price: parseFloat(price)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billableRequests'] });
      setSuccess('Valor da viagem atualizado com sucesso!');
      setShowEditBookingDialog(false);
      setEditingBooking(null);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao atualizar valor');
    }
  });

  // Filtrar faturas
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (invoiceFilters.finance_status !== 'all' && inv.finance_status !== invoiceFilters.finance_status) return false;
      if (!inv.finance_status && invoiceFilters.finance_status === 'pending') {
         // Se não tiver status financeiro definido (legado), considera pendente se status geral não for paga
         if (inv.status === 'paga') return false;
      }
      
      if (invoiceFilters.start && new Date(inv.created_date) < new Date(invoiceFilters.start)) return false;
      if (invoiceFilters.end && new Date(inv.created_date) > new Date(invoiceFilters.end + 'T23:59:59')) return false;
      
      return true;
    });
  }, [invoices, invoiceFilters]);

  const invoiceTotals = useMemo(() => {
    return filteredInvoices.reduce((acc, inv) => {
      const total = inv.total_amount || 0;
      const paid = inv.paid_amount || 0;
      const pending = total - paid;
      
      return {
        total: acc.total + total,
        paid: acc.paid + paid,
        pending: acc.pending + (pending > 0 ? pending : 0)
      };
    }, { total: 0, paid: 0, pending: 0 });
  }, [filteredInvoices]);

  // Filtrar viagens
  const filteredRequests = useMemo(() => {
    return billableRequests.filter(request => {
      if (filters.client_id !== 'all' && request.client_id !== filters.client_id) return false;
      if (filters.user_id !== 'all' && request.user_id !== filters.user_id) return false;

      // Filtro de responsável financeiro (por user_id ou email)
      if (filters.billing_responsible_user_id !== 'all') {
        const matchesUserId = request.billing_responsible_user_id === filters.billing_responsible_user_id;
        const matchesEmail = request.billing_responsible_email === filters.billing_responsible_user_id;
        if (!matchesUserId && !matchesEmail) return false;
      }

      if (filters.billing_method !== 'all' && request.billing_method !== filters.billing_method) return false;

      // Filtro de centro de custo
      if (filters.cost_center_code !== 'all') {
        const hasCostCenter = request.cost_allocation?.some(alloc =>
          alloc.cost_center_code === filters.cost_center_code
        );
        if (!hasCostCenter) return false;
      }

      if (filters.date_start && new Date(request.date) < new Date(filters.date_start)) return false;
      if (filters.date_end && new Date(request.date) > new Date(filters.date_end)) return false;

      return true;
    });
  }, [billableRequests, filters]);

  // Agrupar viagens
  const groupedRequests = useMemo(() => {
    if (groupBy === 'none') {
      return { 'Todas as Viagens': filteredRequests };
    }

    const groups = {};

    filteredRequests.forEach(request => {
      let groupKey = '';

      if (groupBy === 'client') {
        const client = clients.find(c => c.id === request.client_id);
        groupKey = client?.name || 'Cliente Desconhecido';
      } else if (groupBy === 'billing_responsible') {
        const responsible = users.find(u => u.id === request.billing_responsible_user_id);
        groupKey = responsible?.full_name || request.billing_responsible_name || 'Não Informado';
      } else if (groupBy === 'month') {
        groupKey = format(new Date(request.date), 'MMMM/yyyy', { locale: ptBR });
      } else if (groupBy === 'cost_center') {
        if (request.cost_allocation && request.cost_allocation.length > 0) {
          // A single request might belong to multiple cost centers if grouped by cost_center,
          // so we add it to each relevant group.
          request.cost_allocation.forEach(alloc => {
            const ccKey = `${alloc.cost_center_code} - ${alloc.cost_center_name || 'Nome não disponível'}`;
            if (!groups[ccKey]) {
              groups[ccKey] = [];
            }
            groups[ccKey].push(request);
          });
          return; // Skip default grouping if handled by cost_allocation iteration
        } else {
          groupKey = 'Sem Centro de Custo';
        }
      } else if (groupBy === 'billing_method') {
        const methodLabels = {
          'invoiced': 'Faturado',
          'credit_card': 'Cartão de Crédito',
          'purchase_order': 'Ordem de Compra'
        };
        groupKey = methodLabels[request.billing_method] || 'Método Não Informado';
      }

      // Only add to group if not already added by cost_center iteration
      if (groupBy !== 'cost_center' || !groups[groupKey]?.includes(request)) {
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(request);
      }
    });

    return groups;
  }, [filteredRequests, groupBy, clients, users]);

  const handleOpenReview = (request) => {
    setReviewingRequest(request);
    const initialApprovedExpenses = request.driver_reported_additional_expenses
      ? request.driver_reported_additional_expenses.map(exp => ({ ...exp, value: parseFloat(exp.value) || 0 }))
      : [];
    setApprovedExpenses(initialApprovedExpenses);
    setReviewNotes('');
    setReviewError('');
    setShowReviewDialog(true);
  };

  const handleAddExpenseInReview = () => {
    setReviewError('');
    const value = parseFloat(newExpense.value);

    if (newExpense.type === 'hora_espera') {
      const quantityMinutes = parseInt(newExpense.quantity_minutes);
      if (isNaN(quantityMinutes) || quantityMinutes <= 0) {
        setReviewError('Informe a quantidade de minutos de espera');
        return;
      }
      if (isNaN(value) || value <= 0) {
        setReviewError('Informe o valor da hora de espera');
        return;
      }
      setApprovedExpenses([...approvedExpenses, { ...newExpense, value, quantity_minutes: quantityMinutes }]);
    } else {
      if (isNaN(value) || value <= 0) {
        setReviewError('Informe o valor da despesa');
        return;
      }
      if (newExpense.type === 'outros' && !newExpense.description.trim()) {
        setReviewError('Informe a descrição da despesa');
        return;
      }
      setApprovedExpenses([...approvedExpenses, { ...newExpense, value }]);
    }

    setNewExpense({ type: 'estacionamento', value: '', quantity_minutes: '', description: '' });
  };

  const handleRemoveExpenseInReview = (index) => {
    setApprovedExpenses(approvedExpenses.filter((_, i) => i !== index));
  };

  const handleEditExpenseValue = (index, newValue) => {
    const updated = [...approvedExpenses];
    updated[index] = { ...updated[index], value: parseFloat(newValue) || 0 };
    setApprovedExpenses(updated);
  };

  const calculateApprovedExpensesTotal = () => {
    return approvedExpenses.reduce((total, expense) => {
      return total + (parseFloat(expense.value) || 0);
    }, 0);
  };

  const handleApproveReview = async () => {
    setReviewError('');

    if (approvedExpenses.some(e => isNaN(parseFloat(e.value)) || parseFloat(e.value) <= 0)) {
      setReviewError('Todas as despesas devem ter um valor definido maior que zero.');
      return;
    }

    setIsApprovingReview(true);
    try {
      await approveReviewMutation.mutateAsync({
        requestId: reviewingRequest.id,
        approvedExpenses,
        reviewNotes: reviewNotes.trim() || null
      });
    } finally {
      setIsApprovingReview(false);
    }
  };

  const handleCreateInvoice = () => {
    if (selectedRequests.length === 0) {
      setError('Selecione pelo menos uma viagem para criar a fatura.');
      return;
    }
    setError('');
    setSendOption('');
    setPreviewPdfUrl(null);
    setShowInvoiceDialog(true);
  };

  const handlePreviewPDF = async () => {
    setError('');

    if (!invoiceData.period_start || !invoiceData.period_end) {
      setError('Preencha o período de início e fim da fatura para visualizar a prévia.');
      return;
    }

    if (new Date(invoiceData.period_start) > new Date(invoiceData.period_end)) {
      setError('A data de início não pode ser depois da data de fim.');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const groupingTypeMap = {
        'none': 'none',
        'client': 'client',
        'billing_responsible': 'billing_responsible',
        'month': 'month',
        'cost_center': 'cost_center',
        'billing_method': 'billing_method'
      };

      const response = await base44.functions.invoke('generateSupplierInvoicePDF', {
        serviceRequestIds: selectedRequests,
        groupingType: groupingTypeMap[groupBy] || 'none',
        recipientEmail: null,
        sendEmail: false,
        period_start: invoiceData.period_start,
        period_end: invoiceData.period_end
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPreviewPdfUrl(url);
      setShowPreviewDialog(true);
    } catch (error) {
      console.error('Erro ao gerar prévia:', error);
      setError(error.message || 'Erro ao gerar prévia do relatório');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGeneratePDF = async () => {
    setError('');

    if (!invoiceData.period_start || !invoiceData.period_end) {
      setError('Preencha o período de início e fim da fatura.');
      return;
    }

    if (new Date(invoiceData.period_start) > new Date(invoiceData.period_end)) {
      setError('A data de início não pode ser depois da data de fim.');
      return;
    }

    if (sendOption === 'email') {
      if (!invoiceData.external_reviewer_email || !/\S+@\S+\.\S+/.test(invoiceData.external_reviewer_email)) {
        setError('Informe um e-mail válido para enviar o relatório.');
        return;
      }
    }

    setIsGeneratingPDF(true);

    try {
      // 1. Criar a Fatura (SupplierInvoice) e atualizar status das viagens
      // Isso remove as viagens da lista de pendentes
      console.log('Criando fatura...');
      // Se for download (sem email externo), usa o email do fornecedor/usuário atual como "revisor" interno
      const reviewerEmail = sendOption === 'email' ? invoiceData.external_reviewer_email : (user?.email || 'interno@sistema.com');
      
      const invoiceResult = await createInvoiceMutation.mutateAsync({
        supplier_id: supplier.id,
        service_request_ids: selectedRequests,
        period_start: invoiceData.period_start,
        period_end: invoiceData.period_end,
        external_reviewer_email: reviewerEmail
      });

      if (!invoiceResult || !invoiceResult.invoice) {
        throw new Error("Falha ao registrar a fatura no sistema.");
      }
      
      console.log('Fatura criada:', invoiceResult.invoice.id);

      // 2. Gerar o PDF
      console.log('Gerando PDF...');
      const groupingTypeMap = {
        'none': 'none',
        'client': 'client',
        'billing_responsible': 'billing_responsible',
        'month': 'month',
        'cost_center': 'cost_center',
        'billing_method': 'billing_method'
      };

      const response = await base44.functions.invoke('generateSupplierInvoicePDF', {
        serviceRequestIds: selectedRequests,
        groupingType: groupingTypeMap[groupBy] || 'none',
        recipientEmail: sendOption === 'email' ? invoiceData.external_reviewer_email : null,
        sendEmail: sendOption === 'email',
        period_start: invoiceData.period_start,
        period_end: invoiceData.period_end,
        invoiceNumber: invoiceResult.invoice.invoice_number // Passar o número gerado
      });

      if (sendOption === 'email') {
        // Email foi enviado
        if (response.data.success) {
          // Salvar URL do PDF na fatura se disponível
          if (response.data.pdfUrl) {
            try {
              await base44.entities.SupplierInvoice.update(invoiceResult.invoice.id, {
                invoice_document_url: response.data.pdfUrl
              });
            } catch (err) {
              console.error('Erro ao salvar URL do PDF na fatura (email):', err);
            }
          }

          setSuccess(`✅ Fatura #${invoiceResult.invoice.invoice_number} gerada e enviada para ${invoiceData.external_reviewer_email}!`);
          setShowInvoiceDialog(false);
          setSelectedRequests([]);
          setInvoiceData({ period_start: '', period_end: '', external_reviewer_email: '' });
          setSendOption('');
          setTimeout(() => setSuccess(''), 5000);
        } else {
          throw new Error(response.data.error || 'Erro ao enviar relatório');
        }
      } else {
        // Download do PDF
        const blob = new Blob([response.data], { type: 'application/pdf' });

        // Upload silencioso para persistir a URL na fatura
        try {
          const file = new File([blob], `Fatura_${invoiceResult.invoice.invoice_number}.pdf`, { type: 'application/pdf' });
          const uploadRes = await base44.integrations.Core.UploadFile({ file });

          if (uploadRes && uploadRes.file_url) {
            await base44.entities.SupplierInvoice.update(invoiceResult.invoice.id, {
              invoice_document_url: uploadRes.file_url
            });
          }
        } catch (err) {
          console.error('Erro ao fazer upload/salvar PDF da fatura (download):', err);
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Fatura_${invoiceResult.invoice.invoice_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        setSuccess(`✅ Fatura #${invoiceResult.invoice.invoice_number} gerada com sucesso! Download iniciado.`);
        setShowInvoiceDialog(false);
        setSelectedRequests([]);
        setInvoiceData({ period_start: '', period_end: '', external_reviewer_email: '' });
        setSendOption('');
        setTimeout(() => setSuccess(''), 5000);
      }
      
      // Atualizar listas para remover os itens faturados
      queryClient.invalidateQueries({ queryKey: ['billableRequests'] });
      queryClient.invalidateQueries({ queryKey: ['supplierInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['allSupplierServiceRequests'] });

    } catch (error) {
      console.error('Erro ao processar fatura/PDF:', error);
      setError(error.message || 'Erro ao processar fatura e relatório');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSubmitInvoice = async () => {
    setError('');

    if (!invoiceData.period_start || !invoiceData.period_end) {
      setError('Preencha o período de início e fim da fatura.');
      return;
    }

    if (new Date(invoiceData.period_start) > new Date(invoiceData.period_end)) {
      setError('A data de início não pode ser depois da data de fim.');
      return;
    }

    if (!invoiceData.external_reviewer_email || !/\S+@\S+\.\S+/.test(invoiceData.external_reviewer_email)) {
      setError('Informe um e-mail válido para o revisor externo.');
      return;
    }

    createInvoiceMutation.mutate({
      supplier_id: supplier.id,
      service_request_ids: selectedRequests,
      period_start: invoiceData.period_start,
      period_end: invoiceData.period_end,
      external_reviewer_email: invoiceData.external_reviewer_email
    });
  };

  const handleToggleRequest = (requestId) => {
    setSelectedRequests(prev => {
      if (prev.includes(requestId)) {
        return prev.filter(id => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };

  const handleToggleGroup = (groupRequests) => {
    const groupRequestIds = groupRequests.map(r => r.id);
    const allSelected = groupRequestIds.every(id => selectedRequests.includes(id));

    if (allSelected) {
      setSelectedRequests(prev => prev.filter(id => !groupRequestIds.includes(id)));
    } else {
      setSelectedRequests(prev => [...new Set([...prev, ...groupRequestIds])]);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      client_id: 'all',
      user_id: 'all',
      billing_responsible_user_id: 'all',
      cost_center_code: 'all',
      billing_method: 'all',
      date_start: '',
      date_end: ''
    });
    setGroupBy('none');
  };

  const handleViewInvoiceDetails = (invoice) => {
    setSelectedInvoiceForDetails(invoice);
    setShowInvoiceDetailsDialog(true);
  };

  const handleOpenCompleteInvoice = (invoice) => {
    setCompletingInvoice(invoice);
    setInvoiceCompleteData({
      due_date: invoice.due_date || '',
      receipt_number: invoice.receipt_number || '',
      payment_method_description: invoice.payment_method_description || '',
      bank_account_details: invoice.bank_account_details || '',
      nf_number: invoice.nf_number || ''
    });
    setShowCompleteInvoiceDialog(true);
  };

  const handleSaveCompleteInvoice = () => {
    setError('');

    if (!invoiceCompleteData.due_date) {
      setError('Preencha a data de vencimento');
      return;
    }

    if (!invoiceCompleteData.payment_method_description) {
      setError('Preencha a forma de recebimento');
      return;
    }

    completeInvoiceMutation.mutate({
      invoiceId: completingInvoice.id,
      data: invoiceCompleteData
    });
  };

  const handleOpenPaymentDialog = (invoice) => {
    setPaymentInvoice(invoice);
    const remaining = (invoice.total_amount || 0) - (invoice.paid_amount || 0);
    setPaymentFormData({
      amount: remaining > 0 ? remaining.toFixed(2) : '0.00',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      is_full_payment: true
    });
    setShowPaymentDialog(true);
  };

  const handleRegisterPayment = () => {
    if (!paymentFormData.amount || parseFloat(paymentFormData.amount) <= 0) {
      alert('Informe um valor válido');
      return;
    }
    registerPaymentMutation.mutate({
      invoiceId: paymentInvoice.id,
      data: paymentFormData
    });
  };

  const handleViewInvoicePDF = async (invoice) => {
    if (invoice.invoice_document_url) {
      window.open(invoice.invoice_document_url, '_blank');
    } else {
      // Regenerar PDF sob demanda
      setIsGeneratingPDF(true);
      try {
        const allIds = [
          ...(invoice.related_service_requests_ids || []),
          ...(invoice.related_supplier_own_booking_ids || [])
        ];

        if (allIds.length === 0) {
          alert('Esta fatura não possui viagens vinculadas.');
          return;
        }

        const response = await base44.functions.invoke('generateSupplierInvoicePDF', {
          serviceRequestIds: allIds,
          groupingType: 'none', // Padrão para regeneração
          recipientEmail: null,
          sendEmail: false,
          period_start: invoice.period_start,
          period_end: invoice.period_end,
          invoiceNumber: invoice.invoice_number
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (error) {
        console.error('Erro ao visualizar PDF:', error);
        alert('Erro ao gerar visualização do relatório: ' + error.message);
      } finally {
        setIsGeneratingPDF(false);
      }
    }
  };

  const handleOpenEditBooking = (booking) => {
    setEditingBooking(booking);
    setEditPriceValue(booking.chosen_supplier_cost || 0);
    setShowEditBookingDialog(true);
  };

  const handleSaveEditBooking = () => {
    if (parseFloat(editPriceValue) < 0 || isNaN(parseFloat(editPriceValue))) {
      alert('Informe um valor válido');
      return;
    }
    updateBookingPriceMutation.mutate({
      id: editingBooking.id,
      price: editPriceValue
    });
  };

  const getFinanceStatusBadge = (status) => {
    const map = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      paid_partial: { label: 'Parcial', className: 'bg-blue-100 text-blue-800' },
      paid_full: { label: 'Pago', className: 'bg-green-100 text-green-800' }
    };
    const config = map[status] || map.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getInvoiceStatusBadge = (status) => {
    const configs = {
      rascunho: { label: 'Rascunho', className: 'bg-gray-100 text-gray-800 border-gray-300' },
      aguardando_aprovacao_externa: { label: 'Aguardando Aprovação', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      aprovada_externamente: { label: 'Aprovada', className: 'bg-green-100 text-green-800 border-green-300' },
      rejeitada: { label: 'Rejeitada', className: 'bg-red-100 text-red-800 border-red-300' },
      faturado_aguardando_pgto: { label: 'Faturada - Aguardando Pagamento', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      paga: { label: 'Paga', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
      disputada: { label: 'Disputada', className: 'bg-orange-100 text-orange-800 border-orange-300' }
    };
    const config = configs[status] || configs.rascunho;
    return <Badge className={`${config.className} border`}>{config.label}</Badge>;
  };

  const getExpenseTypeLabel = (type) => {
    const labels = {
      estacionamento: 'Estacionamento',
      pedagio: 'Pedágio',
      hora_espera: 'Hora Parada/Espera',
      outros: 'Outros'
    };
    return labels[type] || type;
  };

  const getExpenseIcon = (type) => {
    const icons = {
      estacionamento: ParkingCircle,
      pedagio: DollarSign,
      hora_espera: Timer,
      outros: FileText
    };
    return icons[type] || DollarSign;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Coletar responsáveis financeiros únicos das viagens faturáveis
  const availableFinancialResponsibles = useMemo(() => {
    const responsibles = [];
    const seenUserIds = new Set();
    const seenEmails = new Set();

    billableRequests.forEach(request => {
      // Se tem user_id de responsável financeiro
      if (request.billing_responsible_user_id) {
        if (!seenUserIds.has(request.billing_responsible_user_id)) {
          const user = users.find(u => u.id === request.billing_responsible_user_id);
          if (user) {
            responsibles.push({
              type: 'user',
              id: request.billing_responsible_user_id,
              label: user.full_name,
              email: user.email
            });
            seenUserIds.add(request.billing_responsible_user_id);
          }
        }
      }
      // Se foi digitado manualmente (email) e não está associado a um user_id que já foi adicionado
      else if (request.billing_responsible_email && !seenEmails.has(request.billing_responsible_email)) {
        responsibles.push({
          type: 'email',
          id: request.billing_responsible_email,
          label: request.billing_responsible_name || request.billing_responsible_email,
          email: request.billing_responsible_email
        });
        seenEmails.add(request.billing_responsible_email);
      }
    });

    return responsibles.sort((a, b) => a.label.localeCompare(b.label));
  }, [billableRequests, users]);

  // Coletar solicitantes únicos das viagens faturáveis
  const availableSolicitors = useMemo(() => {
    console.log('🔍 [availableSolicitors] Processando solicitantes...');
    console.log('🔍 [availableSolicitors] Total de billableRequests:', billableRequests.length);
    console.log('🔍 [availableSolicitors] Total de users:', users.length);

    const solicitors = [];
    const seenUserIds = new Set();

    billableRequests.forEach((request, index) => {
      if (request.user_id) {
        if (!seenUserIds.has(request.user_id)) {
          const user = users.find(u => u.id === request.user_id);
          console.log(`🔍 [availableSolicitors] Request ${index} (${request.request_number}):`, {
            user_id: request.user_id,
            user_found: !!user,
            user_name: user?.full_name
          });

          if (user) {
            solicitors.push({
              id: user.id,
              label: user.full_name,
              email: user.email
            });
            seenUserIds.add(request.user_id);
          } else {
            console.warn(`⚠️ [availableSolicitors] User não encontrado para user_id: ${request.user_id}`);
          }
        }
      } else {
        console.warn(`⚠️ [availableSolicitors] Request ${request.request_number} sem user_id`);
      }
    });

    console.log('✅ [availableSolicitors] Total de solicitantes únicos encontrados:', solicitors.length);
    console.log('✅ [availableSolicitors] Solicitantes:', solicitors.map(s => s.label));

    return solicitors.sort((a, b) => a.label.localeCompare(b.label));
  }, [billableRequests, users]);

  // Coletar centros de custo únicos das viagens faturáveis
  const availableCostCenters = useMemo(() => {
    const costCentersMap = new Map();

    billableRequests.forEach(request => {
      if (request.cost_allocation && request.cost_allocation.length > 0) {
        request.cost_allocation.forEach(alloc => {
          const key = alloc.cost_center_code;
          if (!costCentersMap.has(key)) {
            costCentersMap.set(key, {
              code: alloc.cost_center_code,
              name: alloc.cost_center_name
            });
          }
        });
      }
    });

    return Array.from(costCentersMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code)
    );
  }, [billableRequests]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.client_id !== 'all') count++;
    if (filters.user_id !== 'all') count++;
    if (filters.billing_responsible_user_id !== 'all') count++;
    if (filters.cost_center_code !== 'all') count++;
    if (filters.billing_method !== 'all') count++;
    if (filters.date_start || filters.date_end) count++;
    return count;
  }, [filters]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Gerenciar Faturamento</h1>
          </div>
          <p className="text-gray-600">{supplier?.name} - Gerencie suas faturas e cobranças</p>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && !showInvoiceDialog && !showReviewDialog && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="billable" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
            <TabsTrigger value="review" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Revisão ({requestsAwaitingReview.length})
            </TabsTrigger>
            <TabsTrigger value="billable" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Faturáveis ({billableRequests.length})
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Faturas ({invoices.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-orange-600" />
                  Viagens Aguardando Revisão de Valores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requestsAwaitingReview.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Nenhuma viagem aguardando revisão</p>
                    <p className="text-sm">Todas as viagens finalizadas já foram revisadas.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requestsAwaitingReview.map((request) => (
                      <Card key={request.id} className="border-2 border-orange-300 bg-orange-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="font-mono font-bold text-orange-700 text-lg">
                                  {request.request_number}
                                </span>
                                <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Aguardando Revisão
                                </Badge>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-gray-600 mb-1">Passageiro:</div>
                                  <div className="font-semibold">{request.passenger_name}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600 mb-1">Data:</div>
                                  <div className="font-semibold">
                                    {format(new Date(request.date), "dd/MM/yyyy", { locale: ptBR })} às {request.time}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-600 mb-1">Rota:</div>
                                  <div className="font-semibold text-xs">
                                    {request.origin} → {request.destination}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-gray-600 mb-1">Valor Original:</div>
                                  <div className="font-bold text-green-600 text-lg">
                                    {formatPrice(request.chosen_supplier_cost)}
                                  </div>
                                </div>
                              </div>

                              {request.driver_reported_additional_expenses && request.driver_reported_additional_expenses.length > 0 && (
                                <div className="mt-3 bg-white border border-orange-200 rounded-lg p-3">
                                  <div className="text-xs font-semibold text-orange-900 mb-2">
                                    📋 Despesas Reportadas pelo Motorista:
                                  </div>
                                  <div className="space-y-1">
                                    {request.driver_reported_additional_expenses.map((expense, idx) => (
                                      <div key={idx} className="text-sm flex items-center justify-between">
                                        <span className="text-gray-700">
                                          • {getExpenseTypeLabel(expense.type)}
                                          {expense.description && `: ${expense.description}`}
                                          {expense.type === 'hora_espera' && ` (${expense.quantity_minutes} min)`}
                                        </span>
                                        {expense.value && (
                                          <span className="font-semibold text-orange-700">
                                            {formatPrice(expense.value)}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <Button
                              onClick={() => handleOpenReview(request)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Revisar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billable">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Viagens Prontas para Faturamento</CardTitle>
                  {selectedRequests.length > 0 && (
                    <Button
                      onClick={handleCreateInvoice}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Gerar Relatório ({selectedRequests.length})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros */}
                <Accordion type="single" collapsible className="mb-6">
                  <AccordionItem value="filters" className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <span className="font-semibold">Filtros e Agrupamentos</span>
                        {activeFiltersCount > 0 && (
                          <Badge className="bg-blue-600 text-white">{activeFiltersCount}</Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              Cliente
                            </Label>
                            <Select value={filters.client_id} onValueChange={(value) => setFilters({...filters, client_id: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos os Clientes</SelectItem>
                                {clients.filter(c => billableRequests.some(r => r.client_id === c.id)).map(client => (
                                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Solicitante
                            </Label>
                            <Select value={filters.user_id} onValueChange={(value) => setFilters({...filters, user_id: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos os Solicitantes</SelectItem>
                                {availableSolicitors.map((solicitor) => (
                                  <SelectItem key={solicitor.id} value={solicitor.id}>
                                    {solicitor.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Responsável Financeiro
                            </Label>
                            <Select
                              value={filters.billing_responsible_user_id}
                              onValueChange={(value) => setFilters({...filters, billing_responsible_user_id: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos os Responsáveis</SelectItem>
                                {availableFinancialResponsibles.map((resp) => (
                                  <SelectItem key={resp.id} value={resp.id}>
                                    {resp.label}
                                    {resp.email && resp.type === 'email' && (
                                      <span className="text-xs text-gray-500 ml-1">({resp.email})</span>
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Centro de Custo</Label>
                            <Select value={filters.cost_center_code} onValueChange={(value) => setFilters({...filters, cost_center_code: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                               </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos os Centros de Custo</SelectItem>
                                {availableCostCenters.map((cc) => (
                                  <SelectItem key={cc.code} value={cc.code}>
                                    <span className="font-mono text-sm">{cc.code}</span>
                                    {' - '}
                                    {cc.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Método de Faturamento</Label>
                            <Select value={filters.billing_method} onValueChange={(value) => setFilters({...filters, billing_method: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos os Métodos</SelectItem>
                                <SelectItem value="invoiced">Faturado</SelectItem>
                                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                <SelectItem value="purchase_order">Ordem de Compra</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Período da Viagem
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                type="date"
                                value={filters.date_start}
                                onChange={(e) => setFilters({...filters, date_start: e.target.value})}
                                placeholder="De"
                              />
                              <Input
                                type="date"
                                value={filters.date_end}
                                onChange={(e) => setFilters({...filters, date_end: e.target.value})}
                                placeholder="Até"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                          <Label className="font-semibold">Agrupar Viagens Por:</Label>
                          <Select value={groupBy} onValueChange={setGroupBy}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sem Agrupamento (Lista Simples)</SelectItem>
                              <SelectItem value="client">Cliente</SelectItem>
                              <SelectItem value="billing_responsible">Responsável Financeiro</SelectItem>
                              <SelectItem value="cost_center">Centro de Custo</SelectItem>
                              <SelectItem value="billing_method">Método de Faturamento</SelectItem>
                              <SelectItem value="month">Mês da Viagem</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleClearFilters} variant="outline" size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Limpar Filtros
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Viagens Filtradas */}
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Nenhuma viagem encontrada</p>
                    <p className="text-sm">Ajuste os filtros para ver outras viagens.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedRequests).map(([groupName, groupRequests]) => {
                      const groupTotal = groupRequests.reduce((sum, r) => sum + (r.chosen_supplier_cost + (r.total_additional_expenses_approved || 0)), 0);
                      const allGroupSelected = groupRequests.every(r => selectedRequests.includes(r.id));

                      const isExpanded = expandedGroups[groupName];

                      return (
                        <div key={groupName} className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 transition-all">
                          {groupBy !== 'none' ? (
                            <div 
                              className="flex items-center justify-between mb-2 pb-2 border-b border-blue-300 cursor-pointer hover:bg-blue-100/50 rounded px-2 -mx-2"
                              onClick={() => toggleGroup(groupName)}
                            >
                              <div className="flex items-center gap-3">
                                <div onClick={(e) => e.stopPropagation()}>
                                  <Checkbox
                                    checked={allGroupSelected}
                                    onCheckedChange={() => handleToggleGroup(groupRequests)}
                                    className="w-5 h-5"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  {isExpanded ? <ChevronDown className="w-5 h-5 text-blue-700" /> : <ChevronRight className="w-5 h-5 text-blue-700" />}
                                  <div>
                                    <h3 className="text-lg font-bold text-blue-900">{groupName}</h3>
                                    <p className="text-sm text-blue-700">
                                      {groupRequests.length} viagem{groupRequests.length !== 1 ? 'ns' : ''}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-blue-700">Total do Grupo</p>
                                <p className="text-2xl font-bold text-blue-900">{formatPrice(groupTotal)}</p>
                              </div>
                            </div>
                          ) : null}

                          {isExpanded && (
                            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                              {groupRequests.map((request) => {
                              const requestClient = clients.find(c => c.id === request.client_id);
                              const requestUser = users.find(u => u.id === request.user_id);
                              const financialResponsibleUser = users.find(u => u.id === request.billing_responsible_user_id);

                              return (
                                <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      checked={selectedRequests.includes(request.id)}
                                      onCheckedChange={() => handleToggleRequest(request.id)}
                                      className="mt-1"
                                    />

                                    <div className="flex-1 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-mono font-bold text-blue-600 text-lg">{request.request_number}</div>
                                          <div className="text-xs text-gray-500">{format(new Date(request.date), "dd/MM/yyyy", { locale: ptBR })} às {request.time}</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="flex items-center justify-end gap-2">
                                            <div className="text-xs text-gray-500">Valor</div>
                                            {request.type === 'SupplierOwnBooking' && (
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-gray-400 hover:text-blue-600 -mr-2"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleOpenEditBooking(request);
                                                }}
                                                title="Editar Valor"
                                              >
                                                <Edit className="w-3 h-3" />
                                              </Button>
                                            )}
                                          </div>
                                          <div className="font-bold text-green-600 text-xl">
                                            {formatPrice(request.chosen_supplier_cost + (request.total_additional_expenses_approved || 0))}
                                          </div>
                                          {(request.total_additional_expenses_approved || 0) > 0 && (
                                            <div className="text-xs text-gray-600 mt-1">
                                              (Base: {formatPrice(request.chosen_supplier_cost)} + Despesas: {formatPrice(request.total_additional_expenses_approved)})
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs text-gray-500 mb-1">Rota:</div>
                                        <div className="text-sm font-medium">{request.origin} → {request.destination}</div>
                                      </div>

                                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                          <div className="text-xs text-blue-700 font-semibold mb-1">Cliente:</div>
                                          <div className="font-medium text-gray-900">{requestClient?.name || 'N/A'}</div>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded-lg">
                                          <div className="text-xs text-purple-700 font-semibold mb-1">Solicitante:</div>
                                          <div className="font-medium text-gray-900">{requestUser?.full_name || 'N/A'}</div>
                                          {requestUser?.email && (
                                            <div className="text-xs text-gray-500">{requestUser.email}</div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                                        <div className="bg-green-50 p-3 rounded-lg">
                                          <div className="text-xs text-green-700 font-semibold mb-1">
                                            Responsável Financeiro:
                                          </div>
                                          <div className="font-medium text-gray-900">
                                            {request.billing_method === 'invoiced' && (
                                              <>
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mr-2">
                                                  Faturado
                                                </span>
                                                {financialResponsibleUser?.full_name || request.billing_responsible_name || 'N/A'}
                                              </>
                                            )}
                                            {request.billing_method === 'credit_card' && (
                                              <>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mr-2">
                                                  Cartão
                                                </span>
                                                {request.billing_responsible_email || 'N/A'}
                                              </>
                                            )}
                                            {request.billing_method === 'purchase_order' && (
                                              <>
                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded mr-2">
                                                  OC
                                                </span>
                                                {request.purchase_order_number || 'N/A'}
                                              </>
                                            )}
                                            {!request.billing_method && 'N/A'}
                                          </div>
                                          {request.billing_method === 'credit_card' && request.billing_responsible_email && (
                                            <div className="text-xs text-gray-600 mt-1">
                                              📧 {request.billing_responsible_email}
                                            </div>
                                          )}
                                        </div>

                                        <div className="bg-orange-50 p-3 rounded-lg">
                                          <div className="text-xs text-orange-700 font-semibold mb-1">Centro(s) de Custo:</div>
                                          {request.cost_allocation && request.cost_allocation.length > 0 ? (
                                            <div className="space-y-1">
                                              {request.cost_allocation.map((alloc, idx) => (
                                                <div key={idx} className="text-xs">
                                                  <span className="font-mono font-semibold text-orange-700">
                                                    {alloc.cost_center_code}
                                                  </span>
                                                  {' - '}
                                                  <span className="text-gray-700">{alloc.cost_center_name}</span>
                                                  {alloc.allocation_type === 'percentage' && (
                                                    <span className="text-orange-600 ml-1">({alloc.allocation_value}%)</span>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="text-gray-500">Não informado</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {selectedRequests.length > 0 && (
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 sticky bottom-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-blue-900 text-lg">
                            Total Selecionado ({selectedRequests.length} viagens):
                          </span>
                          <span className="text-3xl font-bold text-blue-700">
                            {formatPrice(
                              filteredRequests
                                .filter(r => selectedRequests.includes(r.id))
                                .reduce((sum, r) => sum + (r.chosen_supplier_cost + (r.total_additional_expenses_approved || 0)), 0)
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            {/* Dashboard de Recebíveis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-blue-900">Total Faturado</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{formatPrice(invoiceTotals.total)}</p>
                  <p className="text-xs text-blue-600 mt-1">No período selecionado</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-green-900">Total Recebido</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{formatPrice(invoiceTotals.paid)}</p>
                  <p className="text-xs text-green-600 mt-1">Pagamentos confirmados</p>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Timer className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-sm font-medium text-yellow-900">A Receber</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-700">{formatPrice(invoiceTotals.pending)}</p>
                  <p className="text-xs text-yellow-600 mt-1">Pendente de pagamento</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Histórico de Faturas</CardTitle>
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2 border rounded-md p-1 bg-white">
                      <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                      <Input 
                        type="date" 
                        className="border-0 h-8 w-32 text-xs" 
                        value={invoiceFilters.start}
                        onChange={(e) => setInvoiceFilters({...invoiceFilters, start: e.target.value})}
                      />
                      <span className="text-gray-400">-</span>
                      <Input 
                        type="date" 
                        className="border-0 h-8 w-32 text-xs" 
                        value={invoiceFilters.end}
                        onChange={(e) => setInvoiceFilters({...invoiceFilters, end: e.target.value})}
                      />
                    </div>
                    <Select 
                      value={invoiceFilters.finance_status} 
                      onValueChange={(v) => setInvoiceFilters({...invoiceFilters, finance_status: v})}
                    >
                      <SelectTrigger className="w-[180px] h-10">
                        <SelectValue placeholder="Status Financeiro" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid_partial">Parcialmente Pago</SelectItem>
                        <SelectItem value="paid_full">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                    {(invoiceFilters.start || invoiceFilters.end || invoiceFilters.finance_status !== 'all') && (
                      <Button variant="ghost" size="sm" onClick={() => setInvoiceFilters({ start: '', end: '', finance_status: 'all' })}>
                        Limpar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>Nenhuma fatura encontrada para os filtros selecionados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInvoices.map((invoice) => (
                      <Card key={invoice.id} className="border-l-4 border-l-blue-600">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                            <div className="flex-1 w-full">
                              <div className="flex items-center justify-between md:justify-start gap-3 mb-2">
                                <span className="font-mono font-bold text-blue-600 text-lg">
                                  {invoice.invoice_number}
                                </span>
                                <div className="flex gap-2">
                                  {getInvoiceStatusBadge(invoice.status)}
                                  {getFinanceStatusBadge(invoice.finance_status || 'pending')}
                                </div>
                              </div>
                              {(() => {
                                let clientName = null;
                                let isParticular = false;

                                // 1. Tenta pegar pelo ID do cliente direto na fatura
                                if (invoice.client_id) {
                                  clientName = clients.find(c => c.id === invoice.client_id)?.name;
                                }

                                // 2. Se não achou, tenta pelas ServiceRequests (Corporativo Plataforma)
                                if (!clientName && invoice.related_service_requests_ids?.length > 0) {
                                  const firstReqId = invoice.related_service_requests_ids[0];
                                  const req = allSupplierServiceRequests.find(r => r.id === firstReqId);
                                  if (req && req.client_id) {
                                    clientName = clients.find(c => c.id === req.client_id)?.name;
                                  }
                                }

                                // 3. Se não achou, tenta pelas SupplierOwnBookings (Clientes Próprios ou Particulares)
                                if (!clientName && invoice.related_supplier_own_booking_ids?.length > 0) {
                                  const firstBookingId = invoice.related_supplier_own_booking_ids[0];
                                  const booking = allSupplierOwnBookings.find(b => b.id === firstBookingId);
                                  
                                  if (booking) {
                                    if (booking.client_id) {
                                      // Cliente Próprio Cadastrado
                                      clientName = clients.find(c => c.id === booking.client_id)?.name;
                                    } 
                                    
                                    // Se ainda não tem nome (Particular sem cadastro de cliente), usa o nome do passageiro/cliente da booking
                                    if (!clientName) {
                                       clientName = booking.passenger_name || 'Cliente Particular';
                                       isParticular = true;
                                    }
                                  }
                                }

                                if (clientName) {
                                  return (
                                    <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                                      {isParticular ? <Users className="w-4 h-4 text-gray-500" /> : <Building2 className="w-4 h-4 text-gray-500" />}
                                      <span className="truncate">{clientName}</span>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600 block">Emissão:</span>
                                  <span className="font-medium">
                                    {format(new Date(invoice.created_date), "dd/MM/yyyy", { locale: ptBR })}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600 block">Vencimento:</span>
                                  <span className="font-medium">
                                    {invoice.due_date ? format(new Date(invoice.due_date), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600 block">Valor Total:</span>
                                  <span className="font-bold text-blue-700">
                                    {formatPrice(invoice.total_amount)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600 block">Recebido:</span>
                                  <span className={`font-bold ${(invoice.paid_amount || 0) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {formatPrice(invoice.paid_amount || 0)}
                                  </span>
                                </div>
                              </div>
                              {invoice.paid_amount > 0 && invoice.paid_amount < invoice.total_amount && (
                                <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${Math.min((invoice.paid_amount / invoice.total_amount) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                              <Button
                                onClick={() => handleViewInvoiceDetails(invoice)}
                                variant="outline"
                                size="sm"
                                className="flex-1 md:flex-none"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Detalhes
                              </Button>
                              
                              {invoice.finance_status !== 'paid_full' && invoice.status !== 'rascunho' && invoice.status !== 'rejeitada' && (
                                <Button
                                  onClick={() => handleOpenPaymentDialog(invoice)}
                                  className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none"
                                  size="sm"
                                >
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  Receber
                                </Button>
                              )}

                              {invoice.status === 'aguardando_aprovacao_externa' && (
                                <Button
                                  onClick={() => approveInvoiceMutation.mutate(invoice)}
                                  disabled={approveInvoiceMutation.isPending}
                                  className="bg-blue-600 hover:bg-blue-700 flex-1 md:flex-none"
                                  size="sm"
                                >
                                  {approveInvoiceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                  Aprovar
                                </Button>
                              )}
                              
                              {invoice.status === 'aprovada_externamente' && (
                                <Button
                                  onClick={() => handleOpenCompleteInvoice(invoice)}
                                  className="bg-indigo-600 hover:bg-indigo-700 flex-1 md:flex-none"
                                  size="sm"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Dados
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Revisão */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Edit className="w-6 h-6 text-orange-600" />
                Revisão de Valores - {reviewingRequest?.request_number}
              </DialogTitle>
            </DialogHeader>

            {reviewingRequest && (
              <div className="space-y-6 py-4">
                {reviewError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{reviewError}</AlertDescription>
                  </Alert>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">📋 Resumo da Viagem</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-blue-700">Passageiro:</span>
                        <span className="font-semibold ml-2">{reviewingRequest.passenger_name}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Data:</span>
                        <span className="font-semibold ml-2">
                          {format(new Date(reviewingRequest.date), "dd/MM/yyyy", { locale: ptBR })} às {reviewingRequest.time}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700">Rota:</span>
                        <div className="font-medium text-xs mt-1">{reviewingRequest.origin} → {reviewingRequest.destination}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3">💰 Valor Original</h3>
                    <div className="text-4xl font-bold text-green-700">
                      {formatPrice(reviewingRequest.chosen_supplier_cost)}
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      Valor negociado inicialmente
                    </p>
                  </div>
                </div>

                {reviewingRequest.driver_reported_additional_expenses && reviewingRequest.driver_reported_additional_expenses.length > 0 && (
                  <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Despesas Reportadas pelo Motorista
                    </h3>
                    <div className="space-y-2">
                      {reviewingRequest.driver_reported_additional_expenses.map((expense, idx) => {
                        const ExpenseIcon = getExpenseIcon(expense.type);
                        return (
                          <div key={idx} className="bg-white border border-purple-200 rounded p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ExpenseIcon className="w-4 h-4 text-purple-600" />
                                <span className="font-medium">{getExpenseTypeLabel(expense.type)}</span>
                                {expense.description && (
                                  <span className="text-sm text-gray-600">- {expense.description}</span>
                                )}
                                {expense.type === 'hora_espera' && (
                                  <Badge variant="outline" className="text-xs">
                                    {expense.quantity_minutes} min
                                  </Badge>
                                )}
                              </div>
                              {expense.value && (
                                <span className="font-bold text-purple-700">
                                  {formatPrice(expense.value)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-2 border-blue-300 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Despesas Aprovadas para Faturamento
                  </h3>

                  {approvedExpenses.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {approvedExpenses.map((expense, idx) => {
                        const ExpenseIcon = getExpenseIcon(expense.type);
                        return (
                          <div key={idx} className="bg-blue-50 border border-blue-200 rounded p-3">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2 flex-1">
                                <ExpenseIcon className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-sm">{getExpenseTypeLabel(expense.type)}</span>
                                {expense.description && (
                                  <span className="text-sm text-gray-600">- {expense.description}</span>
                                )}
                                {expense.type === 'hora_espera' && expense.quantity_minutes && (
                                  <Badge variant="outline" className="text-xs">
                                    {expense.quantity_minutes} min
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={expense.value}
                                  onChange={(e) => handleEditExpenseValue(idx, e.target.value)}
                                  className="w-32 text-right"
                                  placeholder="0.00"
                                />
                                <Button
                                  onClick={() => handleRemoveExpenseInReview(idx)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Alert className="mb-4 bg-gray-50">
                      <AlertCircle className="h-4 w-4 text-gray-500" />
                      <AlertDescription className="text-gray-600 text-sm">
                        Nenhuma despesa adicional aprovada. Adicione novas despesas abaixo, se houver.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Adicionar/Ajustar Despesa
                    </h4>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de Despesa</Label>
                        <select
                          value={newExpense.type}
                          onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value, value: '', quantity_minutes: '', description: '' })}
                          className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                        >
                          <option value="estacionamento">Estacionamento</option>
                          <option value="pedagio">Pedágio</option>
                          <option value="hora_espera">Hora Parada/Espera</option>
                          <option value="outros">Outros</option>
                        </select>
                      </div>

                      {newExpense.type === 'hora_espera' && (
                        <div className="space-y-2">
                          <Label>Quantidade de Minutos</Label>
                          <Input
                            type="number"
                            min="1"
                            value={newExpense.quantity_minutes}
                            onChange={(e) => setNewExpense({ ...newExpense, quantity_minutes: e.target.value })}
                            placeholder="30"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newExpense.value}
                          onChange={(e) => setNewExpense({ ...newExpense, value: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>

                      {newExpense.type === 'outros' && (
                        <div className="space-y-2">
                          <Label>Descrição</Label>
                          <Input
                            value={newExpense.description}
                            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                            placeholder="Descreva a despesa"
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleAddExpenseInReview}
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Despesa
                    </Button>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 mt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-800">Valor Original da Viagem:</span>
                        <span className="font-semibold text-green-900">
                          {formatPrice(reviewingRequest.chosen_supplier_cost)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-green-800">Total de Despesas Adicionais:</span>
                        <span className="font-semibold text-green-900">
                          + {formatPrice(calculateApprovedExpensesTotal())}
                        </span>
                      </div>
                      <div className="border-t-2 border-green-300 pt-3 flex justify-between items-center">
                        <span className="font-bold text-green-900 text-lg">Valor Final para Faturamento:</span>
                        <span className="text-3xl font-bold text-green-700">
                          {formatPrice(reviewingRequest.chosen_supplier_cost + calculateApprovedExpensesTotal())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações da Revisão (Opcional)</Label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Adicione observações sobre os ajustes realizados..."
                    className="h-20"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewDialog(false);
                  setReviewingRequest(null);
                  setApprovedExpenses([]);
                  setNewExpense({ type: 'estacionamento', value: '', quantity_minutes: '', description: '' });
                  setReviewNotes('');
                  setReviewError('');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleApproveReview}
                disabled={isApprovingReview}
                className="bg-green-600 hover:bg-green-700"
              >
                {isApprovingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Aprovando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar e Liberar para Faturamento
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Criar Fatura - ATUALIZADO */}
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Receipt className="w-6 h-6 text-blue-600" />
                Gerar Relatório de Faturamento
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Resumo das viagens selecionadas */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📊 Resumo</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Viagens Selecionadas:</span>
                    <span className="font-bold text-blue-900">{selectedRequests.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Valor Total:</span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatPrice(
                        filteredRequests
                          .filter(r => selectedRequests.includes(r.id))
                          .reduce((sum, r) => sum + (r.chosen_supplier_cost + (r.total_additional_expenses_approved || 0)), 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Agrupamento:</span>
                    <span className="font-semibold text-blue-900">
                      {groupBy === 'none' ? 'Sem Agrupamento' :
                       groupBy === 'client' ? 'Por Cliente' :
                       groupBy === 'billing_responsible' ? 'Por Responsável Financeiro' :
                       groupBy === 'cost_center' ? 'Por Centro de Custo' : // Updated here
                       groupBy === 'billing_method' ? 'Por Método de Faturamento' : // Updated here
                       groupBy === 'month' ? 'Por Mês' : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Período da Fatura */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period_start">Data de Início *</Label>
                  <Input
                    id="period_start"
                    type="date"
                    value={invoiceData.period_start}
                    onChange={(e) => setInvoiceData({ ...invoiceData, period_start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_end">Data de Fim *</Label>
                  <Input
                    id="period_end"
                    type="date"
                    value={invoiceData.period_end}
                    onChange={(e) => setInvoiceData({ ...invoiceData, period_end: e.target.value })}
                  />
                </div>
              </div>

              {/* Escolha de Envio */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Como deseja enviar o relatório?</Label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSendOption('email')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      sendOption === 'email'
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        sendOption === 'email' ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                        <Mail className={`w-6 h-6 ${sendOption === 'email' ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <span className={`font-semibold ${sendOption === 'email' ? 'text-blue-900' : 'text-gray-700'}`}>
                        Enviar por E-mail
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        Envio automático para o destinatário
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendOption('download')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      sendOption === 'download'
                        ? 'border-green-600 bg-green-50 shadow-md'
                        : 'border-gray-300 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        sendOption === 'download' ? 'bg-green-600' : 'bg-gray-300'
                      }`}>
                        <FileText className={`w-6 h-6 ${sendOption === 'download' ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <span className={`font-semibold ${sendOption === 'download' ? 'text-green-900' : 'text-gray-700'}`}>
                        Gerar PDF
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        Download para envio posterior
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Campo de email condicional */}
              {sendOption === 'email' && (
                <div className="space-y-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Label htmlFor="external_reviewer_email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    E-mail do Destinatário *
                  </Label>
                  <Input
                    id="external_reviewer_email"
                    type="email"
                    value={invoiceData.external_reviewer_email}
                    onChange={(e) => setInvoiceData({ ...invoiceData, external_reviewer_email: e.target.value })}
                    placeholder="financeiro@empresa.com"
                    className="bg-white"
                  />
                  <p className="text-xs text-blue-700">
                    📧 O relatório será enviado automaticamente para este e-mail
                  </p>
                </div>
              )}

              {sendOption === 'download' && (
                <Alert className="bg-green-50 border-green-300">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    📥 O PDF será gerado e baixado automaticamente para seu dispositivo
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowInvoiceDialog(false);
                  setSendOption('');
                  setPreviewPdfUrl(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePreviewPDF}
                disabled={isGeneratingPDF}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar Prévia
                  </>
                )}
              </Button>
              <Button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF || !sendOption}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    {sendOption === 'email' ? (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Gerar e Enviar por E-mail
                      </>
                    ) : sendOption === 'download' ? (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Gerar e Baixar PDF
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Gerar Relatório
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Prévia do PDF */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Eye className="w-6 h-6 text-purple-600" />
                Prévia do Relatório
              </DialogTitle>
            </DialogHeader>

            <div className="w-full h-[75vh] border-2 border-gray-300 rounded-lg overflow-hidden">
              {previewPdfUrl ? (
                <iframe
                  src={previewPdfUrl}
                  className="w-full h-full"
                  title="Prévia do Relatório"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreviewDialog(false);
                  if (previewPdfUrl) {
                    window.URL.revokeObjectURL(previewPdfUrl);
                    setPreviewPdfUrl(null);
                  }
                }}
              >
                Fechar Prévia
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Completar Dados da Fatura */}
        {/* Dialog de Registrar Pagamento */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-green-600" />
                Registrar Recebimento
              </DialogTitle>
            </DialogHeader>
            
            {paymentInvoice && (
              <div className="space-y-4 py-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Total da Fatura:</span>
                    <span className="font-semibold">{formatPrice(paymentInvoice.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Já Recebido:</span>
                    <span className="text-green-600 font-semibold">{formatPrice(paymentInvoice.paid_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="font-bold">Restante:</span>
                    <span className="font-bold text-blue-600">
                      {formatPrice((paymentInvoice.total_amount || 0) - (paymentInvoice.paid_amount || 0))}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Valor do Pagamento (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentFormData.amount}
                    onChange={(e) => setPaymentFormData({...paymentFormData, amount: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data do Recebimento</Label>
                  <Input
                    type="date"
                    value={paymentFormData.date}
                    onChange={(e) => setPaymentFormData({...paymentFormData, date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={paymentFormData.notes}
                    onChange={(e) => setPaymentFormData({...paymentFormData, notes: e.target.value})}
                    placeholder="Ex: TED recebido do cliente..."
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="full_payment" 
                    checked={paymentFormData.is_full_payment}
                    onCheckedChange={(checked) => setPaymentFormData({...paymentFormData, is_full_payment: checked})}
                  />
                  <Label htmlFor="full_payment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Marcar como quitação total
                  </Label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancelar</Button>
              <Button 
                onClick={handleRegisterPayment} 
                className="bg-green-600 hover:bg-green-700"
                disabled={registerPaymentMutation.isPending}
              >
                {registerPaymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Confirmar Recebimento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showCompleteInvoiceDialog} onOpenChange={setShowCompleteInvoiceDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Receipt className="w-6 h-6 text-blue-600" />
                Completar Dados de Cobrança - {completingInvoice?.invoice_number}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Preencha os dados necessários para o cliente efetuar o pagamento desta fatura.
                </AlertDescription>
              </Alert>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-semibold">Valor Total da Fatura:</span>
                  <span className="text-3xl font-bold text-green-700">
                    {formatPrice(completingInvoice?.total_amount || 0)}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Data de Vencimento *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={invoiceCompleteData.due_date}
                    onChange={(e) => setInvoiceCompleteData({ ...invoiceCompleteData, due_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt_number">Número da Nota/Recibo</Label>
                  <Input
                    id="receipt_number"
                    value={invoiceCompleteData.receipt_number}
                    onChange={(e) => setInvoiceCompleteData({ ...invoiceCompleteData, receipt_number: e.target.value })}
                    placeholder="Ex: NF-12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nf_number">Número da NF Emitida</Label>
                  <Input
                    id="nf_number"
                    value={invoiceCompleteData.nf_number}
                    onChange={(e) => setInvoiceCompleteData({ ...invoiceCompleteData, nf_number: e.target.value })}
                    placeholder="Ex: 001234"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method">Forma de Recebimento *</Label>
                  <Select
                    value={invoiceCompleteData.payment_method_description}
                    onValueChange={(value) => setInvoiceCompleteData({ ...invoiceCompleteData, payment_method_description: value })}
                  >
                    <SelectTrigger id="payment_method">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="TED">TED</SelectItem>
                      <SelectItem value="DOC">DOC</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="Crédito em Conta">Crédito em Conta</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_account_details">Detalhes da Conta/Chave PIX para Recebimento</Label>
                <Textarea
                  id="bank_account_details"
                  value={invoiceCompleteData.bank_account_details}
                  onChange={(e) => setInvoiceCompleteData({ ...invoiceCompleteData, bank_account_details: e.target.value })}
                  placeholder="Ex: Banco Itaú - Ag: 1234 - Conta: 12345-6 ou Chave PIX: cnpj@empresa.com.br"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompleteInvoiceDialog(false);
                  setCompletingInvoice(null);
                  setInvoiceCompleteData({
                    due_date: '',
                    receipt_number: '',
                    payment_method_description: '',
                    bank_account_details: '',
                    nf_number: ''
                  });
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveCompleteInvoice}
                disabled={completeInvoiceMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {completeInvoiceMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Salvar e Finalizar Fatura
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Detalhes da Fatura */}
        <Dialog open={showInvoiceDetailsDialog} onOpenChange={setShowInvoiceDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Fatura</DialogTitle>
            </DialogHeader>

            {selectedInvoiceForDetails && (
              <div className="space-y-4 py-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Número da Fatura</p>
                      <p className="font-mono font-bold text-lg text-blue-600">
                        {selectedInvoiceForDetails.invoice_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      {getInvoiceStatusBadge(selectedInvoiceForDetails.status)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Período</p>
                      <p className="font-medium">
                        {format(new Date(selectedInvoiceForDetails.period_start), "dd/MM/yyyy", { locale: ptBR })} - {format(new Date(selectedInvoiceForDetails.period_end), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor Total</p>
                      <p className="font-bold text-2xl text-green-600">
                        {formatPrice(selectedInvoiceForDetails.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">Solicitações Incluídas ({(selectedInvoiceForDetails.related_service_requests_ids?.length || 0) + (selectedInvoiceForDetails.related_supplier_own_booking_ids?.length || 0)})</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewInvoicePDF(selectedInvoiceForDetails)}
                      disabled={isGeneratingPDF}
                    >
                      {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                      Visualizar Relatório PDF
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Nº Solicitação</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Rota</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoiceForDetails.related_service_requests_ids && selectedInvoiceForDetails.related_service_requests_ids.length > 0 ? (
                          selectedInvoiceForDetails.related_service_requests_ids.map((srId) => {
                            const sr = allSupplierServiceRequests.find(s => s.id === srId);
                            if (!sr) return <TableRow key={srId}><TableCell colSpan={4} className="text-gray-500">Solicitação não encontrada</TableCell></TableRow>;
                            return (
                              <TableRow key={sr.id}>
                                <TableCell>
                                  <span className="font-mono text-sm">{sr.request_number}</span>
                                </TableCell>
                                <TableCell>
                                  {format(new Date(sr.date), "dd/MM/yyyy", { locale: ptBR })}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {sr.origin} → {sr.destination}
                                </TableCell>
                                <TableCell className="font-semibold text-green-600">
                                  {formatPrice(sr.chosen_supplier_cost + (sr.total_additional_expenses_approved || 0))}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-4">Nenhuma solicitação encontrada para esta fatura.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInvoiceDetailsDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Editar Valor da Viagem */}
        <Dialog open={showEditBookingDialog} onOpenChange={setShowEditBookingDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Editar Valor da Viagem</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Novo Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editPriceValue}
                  onChange={(e) => setEditPriceValue(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditBookingDialog(false)}>Cancelar</Button>
              <Button 
                onClick={handleSaveEditBooking} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={updateBookingPriceMutation.isPending}
              >
                {updateBookingPriceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}