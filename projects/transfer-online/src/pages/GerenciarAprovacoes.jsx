import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Car,
  Eye,
  AlertCircle,
  Phone,
  Mail,
  Briefcase,
  DollarSign,
  Link as LinkIcon,
  Copy,
  UserPlus,
  Send,
  Edit,
  Trash2,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GerenciarAprovacoes() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(null); // 'driver' or 'vehicle'
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState('approve'); // 'approve' or 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailToUpdate, setEmailToUpdate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // States for Invitation management
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [showInvitationDetails, setShowInvitationDetails] = useState(false);
  const [showInvitationRejectDialog, setShowInvitationRejectDialog] = useState(false);
  const [showInvitationEditDialog, setShowInvitationEditDialog] = useState(false);
  const [invitationRejectionReason, setInvitationRejectionReason] = useState('');
  const [invitationEditData, setInvitationEditData] = useState({});

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
        setIsCheckingAuth(false);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };

    checkAuth();
  }, []);

  const { data: drivers = [], isLoading: loadingDrivers } = useQuery({
    queryKey: ['allDrivers'],
    queryFn: () => base44.entities.Driver.list('-created_date'),
    enabled: !isCheckingAuth,
    initialData: []
  });

  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery({
    queryKey: ['allSupplierVehicles'],
    queryFn: () => base44.entities.SupplierVehicleType.list('-created_date'),
    enabled: !isCheckingAuth,
    initialData: []
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list(),
    enabled: !isCheckingAuth,
    initialData: []
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    enabled: !isCheckingAuth,
    initialData: []
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ['employeeInvitations'],
    queryFn: () => base44.entities.EmployeeInvitation.list(),
    enabled: !isCheckingAuth,
    initialData: []
  });

  const approveDriverMutation = useMutation({
    mutationFn: ({ id, notes }) => base44.entities.Driver.update(id, {
      approval_status: 'approved',
      active: true,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      admin_notes: notes
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDrivers'] });
      setSuccess('Motorista aprovado com sucesso!');
      handleCloseDialogs();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao aprovar motorista');
    }
  });

  const rejectDriverMutation = useMutation({
    mutationFn: ({ id, notes }) => base44.entities.Driver.update(id, {
      approval_status: 'rejected',
      active: false,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      admin_notes: notes
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDrivers'] });
      setSuccess('Motorista rejeitado.');
      handleCloseDialogs();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao rejeitar motorista');
    }
  });

  const approveVehicleMutation = useMutation({
    mutationFn: ({ id, notes }) => base44.entities.SupplierVehicleType.update(id, {
      approval_status: 'approved',
      active: true,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      admin_notes: notes
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSupplierVehicles'] });
      setSuccess('Veículo aprovado com sucesso!');
      handleCloseDialogs();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao aprovar veículo');
    }
  });

  const rejectVehicleMutation = useMutation({
    mutationFn: ({ id, notes }) => base44.entities.SupplierVehicleType.update(id, {
      approval_status: 'rejected',
      active: false,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      admin_notes: notes
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSupplierVehicles'] });
      setSuccess('Veículo rejeitado.');
      handleCloseDialogs();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao rejeitar veículo');
    }
  });

  const updateEmailMutation = useMutation({
    mutationFn: ({ driverId, email }) => base44.functions.invoke('adminUpdateDriverEmail', { driverId, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDrivers'] });
      setSuccess('Email atualizado e convite enviado!');
      setShowEmailDialog(false);
      setSelectedItem(null);
      setEmailToUpdate('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao atualizar email');
    }
  });

  const handleCloseDialogs = () => {
    setShowDetailsDialog(false);
    setShowApprovalDialog(false);
    setSelectedItem(null);
    setItemType(null);
    setAdminNotes('');
    setError('');
  };

  const handleOpenApprovalDialog = (item, type, action) => {
    setSelectedItem(item);
    setItemType(type);
    setApprovalAction(action);
    setAdminNotes('');
    setError('');
    setShowApprovalDialog(true);
  };

  const handleOpenEmailDialog = (driver) => {
    setSelectedItem(driver);
    setItemType('driver');
    setEmailToUpdate(driver.email || '');
    setError('');
    setShowEmailDialog(true);
  };

  const handleViewDetails = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setShowDetailsDialog(true);
  };

  const generateAndCopyLink = async (driverId) => {
    try {
      const promise = base44.functions.invoke('generateDriverTermsLink', { driverId });
      
      toast.promise(promise, {
        loading: 'Gerando link...',
        success: (response) => {
          if (response.data?.link) {
            navigator.clipboard.writeText(response.data.link);
            return 'Link copiado para a área de transferência!';
          }
          throw new Error('Link não gerado');
        },
        error: 'Erro ao gerar link'
      });
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar link');
    }
  };

  const handleSubmitApproval = () => {
    if (approvalAction === 'reject' && !adminNotes.trim()) {
      setError('Por favor, informe o motivo da rejeição');
      return;
    }

    if (itemType === 'driver') {
      if (approvalAction === 'approve') {
        approveDriverMutation.mutate({ id: selectedItem.id, notes: adminNotes });
      } else {
        rejectDriverMutation.mutate({ id: selectedItem.id, notes: adminNotes });
      }
    } else if (itemType === 'vehicle') {
      if (approvalAction === 'approve') {
        approveVehicleMutation.mutate({ id: selectedItem.id, notes: adminNotes });
      } else {
        rejectVehicleMutation.mutate({ id: selectedItem.id, notes: adminNotes });
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price || 0);
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'N/A';
  };

  const pendingDrivers = drivers.filter(d => d.approval_status === 'pending');
  const pendingVehicles = vehicles.filter(v => v.approval_status === 'pending');
  const pendingInvitations = invitations.filter(i => i.status === 'pendente');

  const approvedDrivers = drivers.filter(d => d.approval_status === 'approved');
  const approvedVehicles = vehicles.filter(v => v.approval_status === 'approved');
  const approvedInvitations = invitations.filter(i => ['aprovado', 'convite_enviado'].includes(i.status));

  const rejectedDrivers = drivers.filter(d => d.approval_status === 'rejected');
  const rejectedVehicles = vehicles.filter(v => v.approval_status === 'rejected');
  const rejectedInvitations = invitations.filter(i => ['rejeitado', 'cancelado'].includes(i.status));

  const sendInviteMutation = useMutation({
    mutationFn: (id) => base44.functions.invoke('resendEmployeeInvitation', { 
      invitationId: id,
      origin: window.location.origin 
    }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['employeeInvitations'] });
      const data = response?.data || {};
      if (data.whatsappSent) setSuccess('Convite enviado via WhatsApp com sucesso!');
      else if (data.emailSent) setSuccess('Convite enviado via E-mail com sucesso!');
      else if (data.warning) {
        setError(`Atenção: ${data.warning}. Copie o link: ${data.inviteLink}`);
        setTimeout(() => setError(''), 15000);
        return;
      } else setSuccess('Convite processado com sucesso!');
      setTimeout(() => setSuccess(''), 4000);
    },
    onError: (error) => setError(error.message || 'Erro ao enviar convite')
  });

  const updateInvitationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmployeeInvitation.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employeeInvitations'] });
      if (variables.data.status === 'aprovado') {
        setSuccess('Solicitação aprovada! Enviando e-mail...');
        sendInviteMutation.mutate(variables.id);
      } else {
        setSuccess('Solicitação atualizada!');
        setTimeout(() => setSuccess(''), 3000);
      }
      setShowInvitationDetails(false);
      setShowInvitationRejectDialog(false);
      setShowInvitationEditDialog(false);
    },
    onError: (error) => setError(error.message)
  });

  const deleteInvitationMutation = useMutation({
    mutationFn: (id) => base44.entities.EmployeeInvitation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeInvitations'] });
      setSuccess('Solicitação excluída!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => setError(error.message)
  });

  const getRequesterInfo = (invitation) => {
    if (invitation.requester_type === 'supplier') {
      const supplier = suppliers.find(s => s.id === invitation.supplier_id);
      return { type: 'Fornecedor', name: supplier?.name || 'N/A', icon: Building2, color: 'text-green-600' };
    } else {
      const client = clients.find(c => c.id === invitation.client_id);
      return { type: 'Cliente Corp.', name: client?.name || 'N/A', icon: Building2, color: 'text-blue-600' };
    }
  };

  const getRoleLabel = (invitation) => {
    const labels = {
      manager: 'Gerente', dispatcher: 'Despachante', driver: 'Motorista',
      admin_client: 'Admin', requester: 'Solicitante', passenger: 'Passageiro', approver: 'Aprovador'
    };
    return labels[invitation.desired_role] || invitation.desired_role;
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gerenciar Aprovações
          </h1>
          <p className="text-gray-600">Aprove ou rejeite motoristas e veículos cadastrados pelos fornecedores</p>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && !showApprovalDialog && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Aguardando Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingDrivers.length + pendingVehicles.length + pendingInvitations.length}</div>
              <p className="text-xs opacity-90 mt-1">
                {pendingDrivers.length} motoristas, {pendingVehicles.length} veículos, {pendingInvitations.length} convites
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Aprovados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{approvedDrivers.length + approvedVehicles.length + approvedInvitations.length}</div>
              <p className="text-xs opacity-90 mt-1">
                {approvedDrivers.length} motoristas, {approvedVehicles.length} veículos, {approvedInvitations.length} convites
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Rejeitados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{rejectedDrivers.length + rejectedVehicles.length + rejectedInvitations.length}</div>
              <p className="text-xs opacity-90 mt-1">
                {rejectedDrivers.length} motoristas, {rejectedVehicles.length} veículos, {rejectedInvitations.length} convites
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 gap-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pendentes ({pendingDrivers.length + pendingVehicles.length + pendingInvitations.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Aprovados ({approvedDrivers.length + approvedVehicles.length + approvedInvitations.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejeitados ({rejectedDrivers.length + rejectedVehicles.length + rejectedInvitations.length})
            </TabsTrigger>
          </TabsList>

          {/* Pendentes */}
          <TabsContent value="pending" className="space-y-6">
            {/* Convites Pendentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Convites de Funcionários Pendentes ({pendingInvitations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingInvitations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">Nenhum convite pendente</div>
                ) : (
                  <div className="rounded-lg border bg-white overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Solicitante</TableHead>
                          <TableHead className="font-semibold">Funcionário</TableHead>
                          <TableHead className="font-semibold">Função</TableHead>
                          <TableHead className="font-semibold">Data</TableHead>
                          <TableHead className="font-semibold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingInvitations.map((inv) => {
                          const requesterInfo = getRequesterInfo(inv);
                          const Icon = requesterInfo.icon;
                          return (
                            <TableRow key={inv.id} className="hover:bg-gray-50">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Icon className={`w-4 h-4 ${requesterInfo.color}`} />
                                  <div>
                                    <div className="font-medium text-gray-900">{requesterInfo.name}</div>
                                    <div className="text-xs text-gray-500">{requesterInfo.type}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{inv.full_name}</div>
                                  <div className="text-xs text-gray-500">{inv.email}</div>
                                </div>
                              </TableCell>
                              <TableCell><span className="text-sm">{getRoleLabel(inv)}</span></TableCell>
                              <TableCell>
                                <span className="text-sm text-gray-600">
                                  {format(new Date(inv.created_date), 'dd/MM/yyyy', { locale: ptBR })}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => { setSelectedInvitation(inv); setShowInvitationDetails(true); }}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-green-600" onClick={() => {
                                    updateInvitationMutation.mutate({ id: inv.id, data: { status: 'aprovado', reviewed_by: user.id, reviewed_at: new Date().toISOString() } });
                                  }}>
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { setSelectedInvitation(inv); setShowInvitationRejectDialog(true); }}>
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Motoristas Pendentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Motoristas Pendentes ({pendingDrivers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDrivers ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                  </div>
                ) : pendingDrivers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Nenhum motorista aguardando aprovação
                  </div>
                ) : (
                  <div className="rounded-lg border bg-white overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Motorista</TableHead>
                          <TableHead className="font-semibold">Fornecedor</TableHead>
                          <TableHead className="font-semibold">Contato</TableHead>
                          <TableHead className="font-semibold">Veículo</TableHead>
                          <TableHead className="font-semibold">Cadastrado em</TableHead>
                          <TableHead className="font-semibold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingDrivers.map((driver) => (
                          <TableRow key={driver.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="font-medium text-gray-900">{driver.name}</div>
                              {driver.license_number && (
                                <div className="text-sm text-gray-500">CNH: {driver.license_number}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{getSupplierName(driver.supplier_id)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm space-y-1">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  {driver.phone_number}
                                </div>
                                {driver.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    {driver.email}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{driver.vehicle_model}</div>
                                <div className="text-gray-500">{driver.vehicle_plate}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {format(new Date(driver.created_date), "dd/MM/yyyy", { locale: ptBR })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(driver, 'driver')}
                                  title="Ver detalhes"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenApprovalDialog(driver, 'driver', 'approve')}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Aprovar"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenApprovalDialog(driver, 'driver', 'reject')}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Rejeitar"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Veículos Pendentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Veículos Pendentes ({pendingVehicles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingVehicles ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                  </div>
                ) : pendingVehicles.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Nenhum veículo aguardando aprovação
                  </div>
                ) : (
                  <div className="rounded-lg border bg-white overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Veículo</TableHead>
                          <TableHead className="font-semibold">Fornecedor</TableHead>
                          <TableHead className="font-semibold">Capacidade</TableHead>
                          <TableHead className="font-semibold">Preço/km</TableHead>
                          <TableHead className="font-semibold">Cadastrado em</TableHead>
                          <TableHead className="font-semibold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingVehicles.map((vehicle) => (
                          <TableRow key={vehicle.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="font-medium text-gray-900">{vehicle.name}</div>
                              {vehicle.description && (
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {vehicle.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{getSupplierName(vehicle.supplier_id)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span>{vehicle.max_passengers}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4 text-gray-400" />
                                  <span>{vehicle.max_luggage}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-semibold text-green-600">
                                  {formatPrice(vehicle.base_price_per_km)}/km
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {format(new Date(vehicle.created_date), "dd/MM/yyyy", { locale: ptBR })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(vehicle, 'vehicle')}
                                  title="Ver detalhes"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenApprovalDialog(vehicle, 'vehicle', 'approve')}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Aprovar"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenApprovalDialog(vehicle, 'vehicle', 'reject')}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Rejeitar"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aprovados */}
          <TabsContent value="approved" className="space-y-6">
            {/* Convites Aprovados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Convites Aprovados ({approvedInvitations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {approvedInvitations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">Nenhum convite aprovado</div>
                ) : (
                  <div className="rounded-lg border bg-white overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-green-50/50">
                          <TableHead className="font-semibold">Solicitante</TableHead>
                          <TableHead className="font-semibold">Funcionário</TableHead>
                          <TableHead className="font-semibold">Função</TableHead>
                          <TableHead className="font-semibold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approvedInvitations.map((inv) => {
                          const requesterInfo = getRequesterInfo(inv);
                          return (
                            <TableRow key={inv.id} className="hover:bg-gray-50">
                              <TableCell>{requesterInfo.name}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{inv.full_name}</div>
                                  <div className="text-xs text-gray-500">{inv.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>{getRoleLabel(inv)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => { setSelectedInvitation(inv); setShowInvitationDetails(true); }}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => sendInviteMutation.mutate(inv.id)} title="Reenviar">
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Motoristas Aprovados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Motoristas Aprovados ({approvedDrivers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {approvedDrivers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Nenhum motorista aprovado
                  </div>
                ) : (
                  <div className="rounded-lg border bg-white overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-green-50/50">
                          <TableHead className="font-semibold">Motorista</TableHead>
                          <TableHead className="font-semibold">Fornecedor</TableHead>
                          <TableHead className="font-semibold">Contato</TableHead>
                          <TableHead className="font-semibold">Veículo</TableHead>
                          <TableHead className="font-semibold">Aprovado em</TableHead>
                          <TableHead className="font-semibold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approvedDrivers.map((driver) => (
                          <TableRow key={driver.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="font-medium text-gray-900">{driver.name}</div>
                              {driver.license_number && (
                                <div className="text-sm text-gray-500">CNH: {driver.license_number}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{getSupplierName(driver.supplier_id)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm space-y-1">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  {driver.phone_number}
                                </div>
                                {driver.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    {driver.email}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{driver.vehicle_model}</div>
                                <div className="text-gray-500">{driver.vehicle_plate}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {driver.approved_at ? format(new Date(driver.approved_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(driver, 'driver')}
                                  title="Ver detalhes"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEmailDialog(driver)}
                                  title="Gerenciar Email de Acesso"
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => generateAndCopyLink(driver.id)}
                                  title="Copiar link de aceite dos termos"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Veículos Aprovados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Veículos Aprovados ({approvedVehicles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {approvedVehicles.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Nenhum veículo aprovado
                  </div>
                ) : (
                  <div className="rounded-lg border bg-white overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-green-50/50">
                          <TableHead className="font-semibold">Veículo</TableHead>
                          <TableHead className="font-semibold">Fornecedor</TableHead>
                          <TableHead className="font-semibold">Capacidade</TableHead>
                          <TableHead className="font-semibold">Preço/km</TableHead>
                          <TableHead className="font-semibold">Aprovado em</TableHead>
                          <TableHead className="font-semibold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approvedVehicles.map((vehicle) => (
                          <TableRow key={vehicle.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="font-medium text-gray-900">{vehicle.name}</div>
                              {vehicle.description && (
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {vehicle.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{getSupplierName(vehicle.supplier_id)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span>{vehicle.max_passengers}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4 text-gray-400" />
                                  <span>{vehicle.max_luggage}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-semibold text-green-600">
                                  {formatPrice(vehicle.base_price_per_km)}/km
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {vehicle.approved_at ? format(new Date(vehicle.approved_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(vehicle, 'vehicle')}
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rejeitados */}
          <TabsContent value="rejected" className="space-y-6">
            {/* Convites Rejeitados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Convites Rejeitados ({rejectedInvitations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rejectedInvitations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">Nenhum convite rejeitado</div>
                ) : (
                  <div className="rounded-lg border bg-white overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-red-50/50">
                          <TableHead className="font-semibold">Solicitante</TableHead>
                          <TableHead className="font-semibold">Funcionário</TableHead>
                          <TableHead className="font-semibold">Função</TableHead>
                          <TableHead className="font-semibold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rejectedInvitations.map((inv) => {
                          const requesterInfo = getRequesterInfo(inv);
                          return (
                            <TableRow key={inv.id} className="hover:bg-gray-50">
                              <TableCell>{requesterInfo.name}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{inv.full_name}</div>
                                  <div className="text-xs text-gray-500">{inv.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>{getRoleLabel(inv)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedInvitation(inv); setShowInvitationDetails(true); }}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Motoristas Rejeitados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Motoristas Rejeitados ({rejectedDrivers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rejectedDrivers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Nenhum motorista rejeitado
                  </div>
                ) : (
                  <div className="rounded-lg border bg-white overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-red-50/50">
                          <TableHead className="font-semibold">Motorista</TableHead>
                          <TableHead className="font-semibold">Fornecedor</TableHead>
                          <TableHead className="font-semibold">Contato</TableHead>
                          <TableHead className="font-semibold">Veículo</TableHead>
                          <TableHead className="font-semibold">Rejeitado em</TableHead>
                          <TableHead className="font-semibold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rejectedDrivers.map((driver) => (
                          <TableRow key={driver.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="font-medium text-gray-900">{driver.name}</div>
                              {driver.license_number && (
                                <div className="text-sm text-gray-500">CNH: {driver.license_number}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{getSupplierName(driver.supplier_id)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm space-y-1">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  {driver.phone_number}
                                </div>
                                {driver.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    {driver.email}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{driver.vehicle_model}</div>
                                <div className="text-gray-500">{driver.vehicle_plate}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {driver.approved_at ? format(new Date(driver.approved_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(driver, 'driver')}
                                  title="Ver detalhes"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEmailDialog(driver)}
                                  title="Gerenciar Email de Acesso"
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => generateAndCopyLink(driver.id)}
                                  title="Copiar link de aceite dos termos"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Veículos Rejeitados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Veículos Rejeitados ({rejectedVehicles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rejectedVehicles.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Nenhum veículo rejeitado
                  </div>
                ) : (
                  <div className="rounded-lg border bg-white overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-red-50/50">
                          <TableHead className="font-semibold">Veículo</TableHead>
                          <TableHead className="font-semibold">Fornecedor</TableHead>
                          <TableHead className="font-semibold">Capacidade</TableHead>
                          <TableHead className="font-semibold">Preço/km</TableHead>
                          <TableHead className="font-semibold">Rejeitado em</TableHead>
                          <TableHead className="font-semibold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rejectedVehicles.map((vehicle) => (
                          <TableRow key={vehicle.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="font-medium text-gray-900">{vehicle.name}</div>
                              {vehicle.description && (
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {vehicle.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{getSupplierName(vehicle.supplier_id)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span>{vehicle.max_passengers}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4 text-gray-400" />
                                  <span>{vehicle.max_luggage}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-semibold text-green-600">
                                  {formatPrice(vehicle.base_price_per_km)}/km
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {vehicle.approved_at ? format(new Date(vehicle.approved_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(vehicle, 'vehicle')}
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Detalhes */}
        {selectedItem && (
          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {itemType === 'driver' ? 'Detalhes do Motorista' : 'Detalhes do Veículo'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {itemType === 'driver' ? (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Informações Pessoais</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Nome:</strong> {selectedItem.name}</div>
                        <div><strong>Telefone:</strong> {selectedItem.phone_number}</div>
                        {selectedItem.email && <div><strong>Email:</strong> {selectedItem.email}</div>}
                        {selectedItem.document_id && <div><strong>CPF/CNH:</strong> {selectedItem.document_id}</div>}
                        {selectedItem.license_number && <div><strong>CNH:</strong> {selectedItem.license_number}</div>}
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Veículo</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Modelo:</strong> {selectedItem.vehicle_model}</div>
                        <div><strong>Placa:</strong> {selectedItem.vehicle_plate}</div>
                        {selectedItem.vehicle_color && <div><strong>Cor:</strong> {selectedItem.vehicle_color}</div>}
                        {selectedItem.vehicle_year && <div><strong>Ano:</strong> {selectedItem.vehicle_year}</div>}
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Idiomas</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.languages?.map(lang => (
                          <Badge key={lang} variant="outline">
                            {lang === 'pt' ? '🇧🇷 Português' : lang === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Informações Básicas</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Nome:</strong> {selectedItem.name}</div>
                        {selectedItem.description && <div><strong>Descrição:</strong> {selectedItem.description}</div>}
                        <div><strong>Passageiros:</strong> {selectedItem.max_passengers}</div>
                        <div><strong>Malas:</strong> {selectedItem.max_luggage}</div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Tarifas</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Preço/km:</strong> {formatPrice(selectedItem.base_price_per_km)}</div>
                        {selectedItem.min_price_one_way && (
                          <div><strong>Mín. Só Ida:</strong> {formatPrice(selectedItem.min_price_one_way)}</div>
                        )}
                        {selectedItem.min_price_round_trip && (
                          <div><strong>Mín. Ida/Volta:</strong> {formatPrice(selectedItem.min_price_round_trip)}</div>
                        )}
                        {selectedItem.operational_radius_km > 0 && (
                          <div><strong>Raio de Atuação:</strong> {selectedItem.operational_radius_km} km</div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Fornecedor</h3>
                  <div className="text-sm">
                    {getSupplierName(selectedItem.supplier_id)}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setShowDetailsDialog(false)} variant="outline">
                  Fechar
                </Button>
                {selectedItem.approval_status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        setShowDetailsDialog(false);
                        handleOpenApprovalDialog(selectedItem, itemType, 'reject');
                      }}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDetailsDialog(false);
                        handleOpenApprovalDialog(selectedItem, itemType, 'approve');
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog de Edição de Email */}
        {selectedItem && (
          <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Gerenciar Email do Motorista</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium">{selectedItem.name}</p>
                    <p className="text-sm text-gray-600">Ao salvar, o sistema atualizará o cadastro e enviará um convite para o usuário (caso ainda não exista).</p>
                </div>
                <div className="space-y-2">
                  <Label>Email de Login</Label>
                  <Input 
                    type="email" 
                    value={emailToUpdate} 
                    onChange={(e) => setEmailToUpdate(e.target.value)}
                    placeholder="exemplo@email.com"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancelar</Button>
                <Button 
                    onClick={() => updateEmailMutation.mutate({ driverId: selectedItem.id, email: emailToUpdate })}
                    disabled={updateEmailMutation.isPending || !emailToUpdate}
                >
                    {updateEmailMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        "Salvar e Convidar"
                    )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Dialogs de Convites */}
        {selectedInvitation && (
          <Dialog open={showInvitationDetails} onOpenChange={setShowInvitationDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Detalhes do Convite</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold">Solicitante</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {(() => {
                      const info = getRequesterInfo(selectedInvitation);
                      const Icon = info.icon;
                      return <><Icon className={`w-4 h-4 ${info.color}`} /> <span>{info.name} ({info.type})</span></>;
                    })()}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold">Funcionário</h3>
                  <div>Nome: {selectedInvitation.full_name}</div>
                  <div>Email: {selectedInvitation.email}</div>
                  <div>Telefone: {selectedInvitation.phone_number}</div>
                  <div>Função: {getRoleLabel(selectedInvitation)}</div>
                </div>
                {selectedInvitation.rejection_reason && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Motivo: {selectedInvitation.rejection_reason}</AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInvitationDetails(false)}>Fechar</Button>
                {selectedInvitation.status === 'pendente' && (
                  <>
                    <Button variant="destructive" onClick={() => { setShowInvitationDetails(false); setShowInvitationRejectDialog(true); }}>Rejeitar</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => updateInvitationMutation.mutate({ id: selectedInvitation.id, data: { status: 'aprovado', reviewed_by: user.id, reviewed_at: new Date().toISOString() } })}>Aprovar</Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={showInvitationRejectDialog} onOpenChange={setShowInvitationRejectDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Rejeitar Convite</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Label>Motivo</Label>
              <Textarea value={invitationRejectionReason} onChange={e => setInvitationRejectionReason(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInvitationRejectDialog(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={() => {
                if (!invitationRejectionReason.trim()) return alert('Informe o motivo');
                updateInvitationMutation.mutate({ id: selectedInvitation.id, data: { status: 'rejeitado', rejection_reason: invitationRejectionReason, reviewed_by: user.id, reviewed_at: new Date().toISOString() } });
              }}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Aprovação/Rejeição */}
        {selectedItem && (
          <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {approvalAction === 'approve' ? 'Aprovar' : 'Rejeitar'}{' '}
                  {itemType === 'driver' ? 'Motorista' : 'Veículo'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">
                    {itemType === 'driver' ? 'Motorista:' : 'Veículo:'}
                  </div>
                  <div className="font-bold text-lg">{selectedItem.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Fornecedor: {getSupplierName(selectedItem.supplier_id)}
                  </div>
                </div>

                {approvalAction === 'reject' && (
                  <div className="space-y-2">
                    <Label htmlFor="admin_notes">Motivo da Rejeição *</Label>
                    <Textarea
                      id="admin_notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Ex: Documentação incompleta, veículo não atende aos requisitos..."
                      className="h-24"
                    />
                  </div>
                )}

                {approvalAction === 'approve' && (
                  <div className="space-y-2">
                    <Label htmlFor="admin_notes">Observações (opcional)</Label>
                    <Textarea
                      id="admin_notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Observações sobre a aprovação..."
                      className="h-20"
                    />
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Alert className={approvalAction === 'approve' ? 'bg-green-50 border-green-200' : ''}>
                  <AlertCircle className={`h-4 w-4 ${approvalAction === 'approve' ? 'text-green-600' : ''}`} />
                  <AlertDescription className={approvalAction === 'approve' ? 'text-green-800' : ''}>
                    {approvalAction === 'approve'
                      ? `Ao aprovar, este ${itemType === 'driver' ? 'motorista' : 'veículo'} ficará ativo e disponível para viagens.`
                      : `Ao rejeitar, o fornecedor será notificado do motivo e poderá fazer correções.`
                    }
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter>
                <Button onClick={handleCloseDialogs} variant="outline">
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitApproval}
                  disabled={
                    approveDriverMutation.isLoading ||
                    rejectDriverMutation.isLoading ||
                    approveVehicleMutation.isLoading ||
                    rejectVehicleMutation.isLoading
                  }
                  className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                  variant={approvalAction === 'reject' ? 'destructive' : 'default'}
                >
                  {(approveDriverMutation.isLoading ||
                    rejectDriverMutation.isLoading ||
                    approveVehicleMutation.isLoading ||
                    rejectVehicleMutation.isLoading) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : approvalAction === 'approve' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar Aprovação
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Confirmar Rejeição
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}