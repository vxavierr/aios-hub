import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from "@/components/ui/switch";
import { Badge } from '@/components/ui/badge';
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
} from "@/components/ui/table";
import GenericTable from '@/components/ui/GenericTable';
import StatusBadge from '@/components/ui/StatusBadge';
import PhoneInputWithCountry from '@/components/ui/PhoneInputWithCountry';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Car,
  Loader2,
  AlertCircle,
  Check,
  IdCard,
  Globe,
  CheckCircle,
  Star,
  Send,
  MessageCircle,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { parseISO, isBefore, differenceInDays } from 'date-fns';

export default function MeusMotoristas() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);

  // NOVO: Estados para gerenciar veículos do motorista
  const [driverVehicles, setDriverVehicles] = useState([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleFormData, setVehicleFormData] = useState({
    vehicle_model: '',
    vehicle_plate: '',
    vehicle_color: '',
    vehicle_year: '',
    registration_expiry: '',
    registration_document_url: '',
    is_default: false
  });

  const [vehicleRegistrationFile, setVehicleRegistrationFile] = useState(null);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    photo_url: '',
    document_id: '',
    license_number: '',
    license_expiry: '',
    license_document_url: '',
    points_on_license: 0,
    cnh_status: 'active',
    languages: ['pt'],
    notes: '',
    active: true
  });

  const [driverPhotoFile, setDriverPhotoFile] = useState(null);
  const [cnhDocumentFile, setCnhDocumentFile] = useState(null);

  const [inviteFormData, setInviteFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    notes: ''
  });

  const queryClient = useQueryClient();

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

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['supplierDrivers', user?.supplier_id],
    queryFn: () => base44.entities.Driver.filter({ supplier_id: user.supplier_id }),
    enabled: !!user?.supplier_id,
    initialData: []
  });

  const { data: allDriverVehicles = [] } = useQuery({
    queryKey: ['allDriverVehicles', drivers],
    queryFn: async () => {
      if (drivers.length === 0) return [];
      const driverIds = drivers.map(d => d.id);
      const allVehicles = await Promise.all(
        driverIds.map(driverId =>
          base44.entities.DriverVehicle.filter({ driver_id: driverId })
        )
      );
      return allVehicles.flat();
    },
    enabled: drivers.length > 0,
    initialData: []
  });

  const { data: allInvitations = [] } = useQuery({
    queryKey: ['driverInvitations', supplier?.id],
    queryFn: () => base44.entities.EmployeeInvitation.filter({ 
      supplier_id: supplier.id,
      role_type: 'supplier_employee_role',
      desired_role: 'driver'
    }),
    enabled: !!supplier?.id,
    initialData: []
  });

  const pendingInvitations = allInvitations.filter(i => i.status === 'pendente');
  const approvedInvitations = allInvitations.filter(i => ['aprovado', 'convite_enviado'].includes(i.status));

  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId) => {
      await base44.functions.invoke('resendEmployeeInvitation', { 
        invitationId,
        origin: window.location.origin 
      });
    },
    onSuccess: (response) => {
      const data = response?.data || {};
      if (data.whatsappSent) {
          setSuccess('Convite reenviado via WhatsApp!');
      } else if (data.emailSent) {
          setSuccess('Convite reenviado via E-mail!');
      } else {
          setSuccess('Convite reenviado com sucesso!');
      }
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (error) => {
      const link = error.response?.data?.inviteLink;
      if (link) {
          // Se falhou mas gerou link, mostra sucesso parcial ou erro com link
          setError(`Falha no envio. Copie o link: ${link}`);
      } else {
          setError(error.message || 'Erro ao reenviar convite');
      }
    }
  });
  const otherInvitations = allInvitations.filter(i => !['pendente', 'aprovado', 'convite_enviado', 'concluido'].includes(i.status));

  const createDriverMutation = useMutation({
    mutationFn: async (data) => {
      const driver = await base44.entities.Driver.create({ 
        name: data.name,
        phone_number: data.phone_number,
        email: data.email,
        photo_url: data.photo_url,
        document_id: data.document_id,
        license_number: data.license_number,
        license_expiry: data.license_expiry,
        license_document_url: data.license_document_url,
        points_on_license: parseInt(data.points_on_license) || 0,
        cnh_status: data.cnh_status,
        last_points_update_date: new Date().toISOString(),
        languages: data.languages,
        notes: data.notes,
        supplier_id: user.supplier_id,
        approval_status: 'approved',
        active: data.active
      });
      return driver;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierDrivers'] });
      queryClient.invalidateQueries({ queryKey: ['allDriverVehicles'] });
      setSuccess('Motorista cadastrado com sucesso!');
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao cadastrar motorista');
    }
  });

  const updateDriverMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.entities.Driver.update(id, {
        name: data.name,
        phone_number: data.phone_number,
        email: data.email,
        photo_url: data.photo_url,
        document_id: data.document_id,
        license_number: data.license_number,
        license_expiry: data.license_expiry,
        license_document_url: data.license_document_url,
        points_on_license: parseInt(data.points_on_license) || 0,
        cnh_status: data.cnh_status,
        // Só atualiza a data se a pontuação mudou, ou sempre? Melhor sempre que editar para garantir
        last_points_update_date: new Date().toISOString(),
        languages: data.languages,
        notes: data.notes,
        active: data.active
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierDrivers'] });
      setSuccess('Motorista atualizado com sucesso!');
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao atualizar motorista');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Driver.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierDrivers'] });
      queryClient.invalidateQueries({ queryKey: ['allDriverVehicles'] });
      setSuccess('Motorista removido com sucesso!');
      setShowDeleteDialog(false);
      setDriverToDelete(null);
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (error) => {
      setError(error.message || 'Erro ao remover motorista');
      setShowDeleteDialog(false);
      setDriverToDelete(null);
    }
  });

  // NOVO: Mutations para veículos
  const createVehicleMutation = useMutation({
    mutationFn: async (vehicleData) => {
      // Se for marcado como padrão, desmarcar todos os outros veículos deste motorista
      if (vehicleData.is_default) {
        const existingVehicles = await base44.entities.DriverVehicle.filter({ 
          driver_id: editingDriver.id 
        });
        
        for (const vehicle of existingVehicles) {
          if (vehicle.is_default) {
            await base44.entities.DriverVehicle.update(vehicle.id, { is_default: false });
          }
        }
      }
      
      return await base44.entities.DriverVehicle.create({
        driver_id: editingDriver.id,
        vehicle_model: vehicleData.vehicle_model,
        vehicle_plate: vehicleData.vehicle_plate,
        vehicle_color: vehicleData.vehicle_color,
        vehicle_year: vehicleData.vehicle_year ? String(vehicleData.vehicle_year) : '',
        registration_expiry: vehicleData.registration_expiry,
        registration_document_url: vehicleData.registration_document_url,
        is_default: vehicleData.is_default || false,
        active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDriverVehicles'] });
      loadDriverVehicles(editingDriver.id);
      setSuccess('Veículo adicionado com sucesso!');
      setShowAddVehicle(false);
      setVehicleFormData({ vehicle_model: '', vehicle_plate: '', vehicle_color: '', vehicle_year: '', is_default: false });
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setFormError(error.message || 'Erro ao adicionar veículo');
    }
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // Se for marcado como padrão, desmarcar todos os outros veículos
      if (data.is_default) {
        const existingVehicles = await base44.entities.DriverVehicle.filter({ 
          driver_id: editingDriver.id 
        });
        
        for (const vehicle of existingVehicles) {
          if (vehicle.id !== id && vehicle.is_default) {
            await base44.entities.DriverVehicle.update(vehicle.id, { is_default: false });
          }
        }
      }
      
      return await base44.entities.DriverVehicle.update(id, {
        vehicle_model: data.vehicle_model,
        vehicle_plate: data.vehicle_plate,
        vehicle_color: data.vehicle_color,
        vehicle_year: data.vehicle_year ? String(data.vehicle_year) : '',
        registration_expiry: data.registration_expiry,
        registration_document_url: data.registration_document_url,
        is_default: data.is_default
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDriverVehicles'] });
      loadDriverVehicles(editingDriver.id);
      setSuccess('Veículo atualizado com sucesso!');
      setEditingVehicle(null);
      setShowAddVehicle(false);
      setVehicleFormData({ vehicle_model: '', vehicle_plate: '', vehicle_color: '', vehicle_year: '', is_default: false });
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setFormError(error.message || 'Erro ao atualizar veículo');
    }
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id) => base44.entities.DriverVehicle.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDriverVehicles'] });
      loadDriverVehicles(editingDriver.id);
      setSuccess('Veículo removido com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      setFormError(error.message || 'Erro ao remover veículo');
    }
  });

  const createInvitationMutation = useMutation({
    mutationFn: (invitationData) => base44.entities.EmployeeInvitation.create(invitationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverInvitations'] });
      setSuccess('Solicitação de convite enviada ao administrador! Assim que aprovado, você poderá complementar os dados do motorista (CNH, veículos, etc).');
      setShowInviteDialog(false);
      setInviteFormData({
        full_name: '',
        email: '',
        phone_number: '',
        notes: ''
      });
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (error) => {
      setFormError(error.message || 'Erro ao enviar solicitação');
    }
  });

  const loadDriverVehicles = async (driverId) => {
    const vehicles = await base44.entities.DriverVehicle.filter({ driver_id: driverId });
    setDriverVehicles(vehicles);
  };

  const handleOpenDialog = async (driver = null) => {
    setFormError('');
    setSuccess('');
    setError('');
    
    if (driver) {
      setEditingDriver(driver);
      await loadDriverVehicles(driver.id);
      
      setFormData({
        name: driver.name || '',
        phone_number: driver.phone_number || '',
        email: driver.email || '',
        photo_url: driver.photo_url || '',
        document_id: driver.document_id || '',
        license_number: driver.license_number || '',
        license_expiry: driver.license_expiry || '',
        license_document_url: driver.license_document_url || '',
        points_on_license: driver.points_on_license || 0,
        cnh_status: driver.cnh_status || 'active',
        languages: driver.languages || ['pt'],
        notes: driver.notes || '',
        active: driver.active
      });
    } else {
      setEditingDriver(null);
      setDriverVehicles([]);
      setFormData({
        name: '',
        phone_number: '',
        email: '',
        photo_url: '',
        document_id: '',
        license_number: '',
        license_expiry: '',
        license_document_url: '',
        points_on_license: 0,
        cnh_status: 'active',
        languages: ['pt'],
        notes: '',
        active: true
      });
    }
    setDriverPhotoFile(null);
    setCnhDocumentFile(null);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingDriver(null);
    setFormError('');
    setDriverVehicles([]);
    setShowAddVehicle(false);
    setEditingVehicle(null);
    setVehicleFormData({ vehicle_model: '', vehicle_plate: '', vehicle_color: '', vehicle_year: '', is_default: false });
  };

  const handleLanguageToggle = (lang) => {
    const currentLanguages = formData.languages || [];
    if (currentLanguages.includes(lang)) {
      setFormData({
        ...formData,
        languages: currentLanguages.filter(l => l !== lang)
      });
    } else {
      setFormData({
        ...formData,
        languages: [...currentLanguages, lang]
      });
    }
  };

  const handleVehicleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVehicleRegistrationFile(file);
    setIsProcessingDoc(true);
    setFormError('');

    try {
      // 1. Upload
      const url = await handleFileUpload(file);
      if (!url) throw new Error("Falha no upload");

      // 2. Processar com IA
      const verifyRes = await base44.functions.invoke('verifyDocumentWithAI', {
        file_url: url,
        document_type: 'crlv'
      });

      if (verifyRes?.data) {
        const { isValid, message, expiryDate, extractedData } = verifyRes.data;
        
        if (!isValid && !extractedData?.is_legible) {
           setFormError("Atenção: Documento pode estar ilegível ou inválido. Verifique os dados preenchidos.");
        }

        // 3. Preencher formulário
        setVehicleFormData(prev => ({
          ...prev,
          registration_document_url: url, // Já salva a URL
          registration_expiry: expiryDate || prev.registration_expiry,
          vehicle_plate: extractedData?.license_plate || prev.vehicle_plate,
          vehicle_model: extractedData?.vehicle_model || prev.vehicle_model,
          vehicle_year: extractedData?.vehicle_year ? String(extractedData.vehicle_year) : prev.vehicle_year,
          vehicle_color: extractedData?.vehicle_color || prev.vehicle_color
        }));

        setSuccess('Dados do veículo extraídos do documento!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error("Erro ao processar documento:", error);
      setFormError("Erro ao processar o documento automaticamente. Por favor, preencha os dados manualmente.");
    } finally {
      setIsProcessingDoc(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return null;
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      return response.file_url;
    } catch (error) {
      console.error("Upload failed", error);
      throw new Error("Falha no upload de arquivo: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.phone_number) {
      setFormError('Preencha os campos obrigatórios: Nome e Telefone');
      return;
    }

    if (formData.languages.length === 0) {
      setFormError('Selecione pelo menos um idioma');
      return;
    }

    let finalFormData = { ...formData };

    try {
      if (driverPhotoFile) {
        const url = await handleFileUpload(driverPhotoFile);
        if (url) finalFormData.photo_url = url;
      }
      if (cnhDocumentFile) {
        const url = await handleFileUpload(cnhDocumentFile);
        if (url) {
          finalFormData.license_document_url = url;
          // AI Verification for CNH
          try {
            const verifyRes = await base44.functions.invoke('verifyDocumentWithAI', {
              file_url: url,
              document_type: 'cnh'
            });
            if (verifyRes?.data) {
              const { isValid, message, expiryDate, extractedData } = verifyRes.data;
              if (!isValid && !extractedData.is_legible) {
                 setFormError("Erro na CNH: " + message);
                 return; // Stop submission
              }
              if (expiryDate) {
                 finalFormData.license_expiry = expiryDate; // Auto-fill expiry from AI
              }
              if (extractedData.cnh_number) {
                 finalFormData.license_number = extractedData.cnh_number;
              }
            }
          } catch (e) {
            console.warn("AI verification failed", e);
          }
        }
      }

      if (editingDriver) {
        updateDriverMutation.mutate({ id: editingDriver.id, data: finalFormData });
      } else {
        createDriverMutation.mutate(finalFormData);
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  // NOVO: Handlers para veículos
  const handleOpenVehicleForm = (vehicle = null) => {
    setFormError('');
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleFormData({
        vehicle_model: vehicle.vehicle_model || '',
        vehicle_plate: vehicle.vehicle_plate || '',
        vehicle_color: vehicle.vehicle_color || '',
        vehicle_year: vehicle.vehicle_year || '',
        registration_expiry: vehicle.registration_expiry || '',
        registration_document_url: vehicle.registration_document_url || '',
        is_default: vehicle.is_default || false
      });
    } else {
      setEditingVehicle(null);
      setVehicleFormData({
        vehicle_model: '',
        vehicle_plate: '',
        vehicle_color: '',
        vehicle_year: '',
        registration_expiry: '',
        registration_document_url: '',
        is_default: driverVehicles.length === 0 // Primeiro veículo é padrão
      });
    }
    setVehicleRegistrationFile(null);
    setShowAddVehicle(true);
  };

  const handleCancelVehicleForm = () => {
    setShowAddVehicle(false);
    setEditingVehicle(null);
    setVehicleFormData({ vehicle_model: '', vehicle_plate: '', vehicle_color: '', vehicle_year: '', registration_expiry: '', registration_document_url: '', is_default: false });
    setVehicleRegistrationFile(null);
    setFormError('');
  };

  const handleSaveVehicle = async () => {
    setFormError('');

    if (!vehicleFormData.vehicle_model.trim() || !vehicleFormData.vehicle_plate.trim()) {
      setFormError('Preencha Modelo e Placa do veículo');
      return;
    }

    let finalVehicleData = { ...vehicleFormData };

    try {
      // Se tiver arquivo novo selecionado mas ainda não tiver URL (caso o upload automático tenha falhado ou não terminado)
      if (vehicleRegistrationFile && !finalVehicleData.registration_document_url) {
        const url = await handleFileUpload(vehicleRegistrationFile);
        if (url) finalVehicleData.registration_document_url = url;
      }

      if (editingVehicle) {
        updateVehicleMutation.mutate({ 
          id: editingVehicle.id, 
          data: finalVehicleData 
        });
      } else {
        createVehicleMutation.mutate(finalVehicleData);
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDeleteVehicle = (vehicle) => {
    if (confirm(`Deseja remover o veículo ${vehicle.vehicle_model} (${vehicle.vehicle_plate})?`)) {
      deleteVehicleMutation.mutate(vehicle.id);
    }
  };

  const handleSetDefaultVehicle = async (vehicle) => {
    try {
      // Desmarcar todos como padrão
      for (const v of driverVehicles) {
        if (v.is_default && v.id !== vehicle.id) {
          await base44.entities.DriverVehicle.update(v.id, { is_default: false });
        }
      }
      
      // Marcar este como padrão
      await base44.entities.DriverVehicle.update(vehicle.id, { is_default: true });
      
      queryClient.invalidateQueries({ queryKey: ['allDriverVehicles'] });
      loadDriverVehicles(editingDriver.id);
      setSuccess('Veículo padrão atualizado!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setFormError('Erro ao definir veículo padrão');
    }
  };

  const handleDeleteClick = (driver) => {
    setDriverToDelete(driver);
    setShowDeleteDialog(true);
  };

  const confirmDeleteDriver = () => {
    if (driverToDelete) {
      deleteMutation.mutate(driverToDelete.id);
    }
  };

  const handleInviteSubmit = async () => {
    setFormError('');
    
    if (!inviteFormData.full_name || !inviteFormData.email || !inviteFormData.phone_number) {
      setFormError('Preencha todos os campos obrigatórios');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteFormData.email)) {
      setFormError('E-mail inválido');
      return;
    }

    createInvitationMutation.mutate({
      requester_type: 'supplier',
      supplier_id: supplier.id,
      requested_by_user_id: user.id,
      full_name: inviteFormData.full_name,
      email: inviteFormData.email,
      phone_number: inviteFormData.phone_number,
      role_type: 'supplier_employee_role',
      desired_role: 'driver',
      notes: inviteFormData.notes,
      status: 'pendente'
    });
  };

  const getDriverDefaultVehicle = (driverId) => {
    const vehicles = allDriverVehicles.filter(v => v.driver_id === driverId);
    return vehicles.find(v => v.is_default) || vehicles[0] || null;
  };

  // Definição das colunas para a tabela
  const columns = [
    {
      header: 'Motorista',
      accessor: 'name',
      render: (driver) => (
        <div>
          <div className="font-medium text-gray-900">{driver.name}</div>
          {driver.license_number && (
            <div className="text-sm text-gray-500">CNH: {driver.license_number}</div>
          )}
          <div className="flex gap-2 mt-1">
            {driver.points_on_license > 0 && (
              <Badge variant="outline" className={`text-xs ${driver.points_on_license >= 20 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700'}`}>
                {driver.points_on_license} pts
              </Badge>
            )}
            {driver.cnh_status && driver.cnh_status !== 'active' && (
              <Badge variant="destructive" className="text-xs">
                {driver.cnh_status === 'suspended' ? 'Suspensa' : 
                 driver.cnh_status === 'revoked' ? 'Cassada' : 'Pend. Renovação'}
              </Badge>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Contato',
      accessor: 'phone_number',
      render: (driver) => (
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
      )
    },
    {
      header: 'Veículos',
      render: (driver) => {
        const vehicles = allDriverVehicles.filter(v => v.driver_id === driver.id);
        return vehicles.length > 0 ? (
          <div className="space-y-1">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="text-sm flex items-center gap-2">
                {vehicle.is_default && (
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                )}
                <div>
                  <div className="font-medium">{vehicle.vehicle_model}</div>
                  <div className="text-gray-500">{vehicle.vehicle_plate}</div>
                </div>
              </div>
            ))}
            <Badge variant="outline" className="text-xs bg-blue-50 border-blue-300 text-blue-700">
              {vehicles.length} {vehicles.length === 1 ? 'veículo' : 'veículos'}
            </Badge>
          </div>
        ) : (
          <Badge variant="outline" className="text-xs bg-amber-50 border-amber-300 text-amber-700">
            Sem veículo
          </Badge>
        );
      }
    },
    {
      header: 'Idiomas',
      render: (driver) => (
        <div className="flex flex-wrap gap-1">
          {driver.languages.map(lang => (
            <Badge key={lang} variant="outline" className="text-xs">
              {lang === 'pt' ? '🇧🇷 PT' : lang === 'en' ? '🇺🇸 EN' : '🇪🇸 ES'}
            </Badge>
          ))}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'active',
      render: (driver) => {
        // Verificar validade CNH
        let expiryAlert = null;
        if (driver.license_expiry && driver.active) {
          const today = new Date();
          const expiryDate = parseISO(driver.license_expiry);
          const daysToExpiry = differenceInDays(expiryDate, today);
          
          if (isBefore(expiryDate, today)) {
            expiryAlert = (
              <div className="flex items-center text-red-600 text-xs font-bold mt-1 animate-pulse">
                <AlertCircle className="w-3 h-3 mr-1" />
                CNH Vencida
              </div>
            );
          } else if (daysToExpiry <= 30) {
            expiryAlert = (
              <div className="flex items-center text-amber-600 text-xs font-bold mt-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Vence em {daysToExpiry} dias
              </div>
            );
          }
        }

        return (
          <div className="flex flex-col items-start">
            <StatusBadge status={driver.active} type="user_status" />
            {expiryAlert}
          </div>
        );
      }
    },
    {
      header: 'Ações',
      render: (driver) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDialog(driver)}
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(driver)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Meus Motoristas</h1>
            <p className="text-gray-600">{supplier?.name} - Gerencie sua equipe de motoristas</p>
          </div>
          <Button
            onClick={() => setShowInviteDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Motorista
          </Button>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && !showDialog && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Info e botão para solicitar convite */}
        {pendingInvitations.length > 0 && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-300">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Você tem <strong>{pendingInvitations.length}</strong> solicitação(ões) de convite de motorista pendente(s) aguardando aprovação do administrador.
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de Convites Aprovados/Em Andamento */}
        {approvedInvitations.length > 0 && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-900 text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Solicitações Aprovadas / Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-800 mb-4">
                Os motoristas abaixo foram aprovados pelo administrador e devem aceitar o convite enviado por e-mail para aparecerem na lista principal.
              </div>
              <div className="rounded-lg border border-green-200 bg-white overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-100/50">
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Aprovação</TableHead>
                      <TableHead>Ações</TableHead>
                      </TableRow>
                      </TableHeader>
                      <TableBody>
                      {approvedInvitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">{invitation.full_name}</TableCell>
                        <TableCell>{invitation.email}</TableCell>
                        <TableCell>{invitation.phone_number}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            {invitation.status === 'aprovado' ? 'Aprovado pelo Admin' : 
                             invitation.status === 'convite_enviado' ? 'Convite Enviado' : invitation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invitation.reviewed_at ? new Date(invitation.reviewed_at).toLocaleDateString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const inviteLink = `${window.location.origin}/AceitarConvite?id=${invitation.id}`;
                                const waMessage = `Olá ${invitation.full_name}, segue o link para aceitar o convite e acessar o sistema: ${inviteLink}`;
                                const phone = invitation.phone_number.replace(/\D/g, '');
                                const waUrl = `https://wa.me/${phone.startsWith('55') || phone.length < 10 ? phone : '55' + phone}?text=${encodeURIComponent(waMessage)}`;
                                window.open(waUrl, '_blank');
                              }}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              title="Enviar via WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const inviteLink = `${window.location.origin}/AceitarConvite?id=${invitation.id}`;
                                navigator.clipboard.writeText(inviteLink);
                                setSuccess('Link copiado!');
                                setTimeout(() => setSuccess(''), 3000);
                              }}
                              title="Copiar Link"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resendInvitationMutation.mutate(invitation.id)}
                              disabled={resendInvitationMutation.isPending}
                              title="Reenviar por Email"
                            >
                              {resendInvitationMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      ))}
                      </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Motoristas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Carregando motoristas...</p>
              </div>
            ) : drivers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Nenhum motorista cadastrado</p>
                <p className="text-sm">Comece cadastrando seu primeiro motorista</p>
                <Button
                  onClick={() => handleOpenDialog()}
                  className="mt-6 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Motorista
                </Button>
              </div>
            ) : (
              <GenericTable
                columns={columns}
                data={drivers}
                emptyMessage="Nenhum motorista cadastrado"
              />
            )}
          </CardContent>
        </Card>

        {/* Dialog de Solicitação de Convite */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-600" />
                Solicitar Acesso para Novo Motorista
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Preencha os dados básicos do motorista. O administrador receberá sua solicitação e criará o acesso ao sistema. Após aprovado, você poderá complementar os dados (CNH, veículos, etc) aqui em "Meus Motoristas".
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="invite_full_name">Nome Completo do Motorista *</Label>
                <Input
                  id="invite_full_name"
                  value={inviteFormData.full_name}
                  onChange={(e) => setInviteFormData({ ...inviteFormData, full_name: e.target.value })}
                  placeholder="Ex: Carlos Silva"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite_email">E-mail *</Label>
                <Input
                  id="invite_email"
                  type="email"
                  value={inviteFormData.email}
                  onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                  placeholder="carlos@exemplo.com"
                />
                <p className="text-xs text-gray-500">
                  O motorista usará este e-mail para acessar o aplicativo e ver suas viagens
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite_phone">Telefone *</Label>
                <PhoneInputWithCountry
                  id="invite_phone"
                  value={inviteFormData.phone_number}
                  onChange={(value) => setInviteFormData({ ...inviteFormData, phone_number: value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite_notes">Observações (Opcional)</Label>
                <Textarea
                  id="invite_notes"
                  value={inviteFormData.notes}
                  onChange={(e) => setInviteFormData({ ...inviteFormData, notes: e.target.value })}
                  placeholder="Informações adicionais sobre este motorista..."
                  rows={3}
                />
              </div>

              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setShowInviteDialog(false)} variant="outline">
                Cancelar
              </Button>
              <Button
                onClick={handleInviteSubmit}
                disabled={createInvitationMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createInvitationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Solicitar Acesso
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Cadastro/Edição */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingDriver ? `Editar Motorista - ${editingDriver.name}` : 'Novo Motorista'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                {/* ID do Motorista - Somente na Edição */}
                {editingDriver && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <Label htmlFor="driver_id" className="text-sm font-semibold text-amber-900">
                      ID do Motorista (somente leitura)
                    </Label>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        id="driver_id"
                        value={editingDriver.id}
                        readOnly
                        className="font-mono text-sm bg-white"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(editingDriver.id);
                          alert('ID copiado para a área de transferência!');
                        }}
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Dados Pessoais */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold text-blue-900">Dados Pessoais</h3>

                  {/* Foto do Motorista */}
                  <div className="flex items-start gap-4 mb-4 border-b border-blue-200 pb-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                      {driverPhotoFile ? (
                        <img src={URL.createObjectURL(driverPhotoFile)} alt="Preview" className="w-full h-full object-cover" />
                      ) : formData.photo_url ? (
                        <img src={formData.photo_url} alt="Foto Motorista" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="photo" className="text-sm font-medium">Foto do Motorista</Label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setDriverPhotoFile(e.target.files[0])}
                        className="bg-white"
                      />
                      <p className="text-xs text-blue-700">Recomendado: Foto de rosto clara e profissional.</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Nome do motorista"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Telefone *</Label>
                      <PhoneInputWithCountry
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(value) => setFormData({...formData, phone_number: value})}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="document_id">CPF/CNH</Label>
                      <Input
                        id="document_id"
                        value={formData.document_id}
                        onChange={(e) => setFormData({...formData, document_id: e.target.value})}
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license_number">Número da CNH</Label>
                      <Input
                        id="license_number"
                        value={formData.license_number}
                        onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                        placeholder="00000000000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license_expiry">Validade da CNH</Label>
                      <Input
                        id="license_expiry"
                        type="date"
                        value={formData.license_expiry}
                        onChange={(e) => setFormData({...formData, license_expiry: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="points_on_license">Pontuação na CNH</Label>
                      <Input
                        id="points_on_license"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.points_on_license}
                        onChange={(e) => setFormData({...formData, points_on_license: e.target.value})}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnh_status">Status da CNH</Label>
                      <select
                        id="cnh_status"
                        value={formData.cnh_status}
                        onChange={(e) => setFormData({...formData, cnh_status: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="active">Ativa</option>
                        <option value="suspended">Suspensa</option>
                        <option value="revoked">Cassada</option>
                        <option value="pending_renewal">Renovação Pendente</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="cnh_document">Foto/PDF da CNH</Label>
                      <div className="flex gap-2">
                        <Input
                          id="cnh_document"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setCnhDocumentFile(e.target.files[0])}
                          className="bg-white"
                        />
                        {formData.license_document_url && (
                          <Button type="button" variant="outline" onClick={() => window.open(formData.license_document_url, '_blank')}>
                            <IdCard className="w-4 h-4 mr-2" />
                            Ver Atual
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Idiomas */}
                <div className="bg-purple-50 p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold text-purple-900">Idiomas *</h3>
                  
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes('pt')}
                        onChange={() => handleLanguageToggle('pt')}
                        className="w-4 h-4"
                      />
                      <span>🇧🇷 Português</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes('en')}
                        onChange={() => handleLanguageToggle('en')}
                        className="w-4 h-4"
                      />
                      <span>🇺🇸 English</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes('es')}
                        onChange={() => handleLanguageToggle('es')}
                        className="w-4 h-4"
                      />
                      <span>🇪🇸 Español</span>
                    </label>
                  </div>
                </div>

                {/* NOVO: Seção de Gerenciamento de Veículos - Apenas na Edição */}
                {editingDriver && (
                  <div className="bg-green-50 p-4 rounded-lg space-y-4 border-2 border-green-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-green-700" />
                        <h3 className="font-semibold text-green-900 text-lg">
                          Veículos do Motorista
                        </h3>
                        <Badge variant="outline" className="bg-white border-green-300 text-green-700">
                          {driverVehicles.length} {driverVehicles.length === 1 ? 'veículo' : 'veículos'}
                        </Badge>
                      </div>
                      {!showAddVehicle && (
                        <Button
                          type="button"
                          onClick={() => handleOpenVehicleForm()}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Veículo
                        </Button>
                      )}
                    </div>

                    {/* Lista de Veículos */}
                    {driverVehicles.length > 0 && (
                      <div className="space-y-2">
                        {driverVehicles.map((vehicle) => (
                          <div key={vehicle.id} className="bg-white border border-green-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {vehicle.is_default && (
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  )}
                                  <span className="font-semibold text-gray-900">{vehicle.vehicle_model}</span>
                                  {vehicle.is_default && (
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                      Padrão
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 space-y-0.5">
                                  <div>🚗 Placa: <span className="font-mono font-semibold">{vehicle.vehicle_plate}</span></div>
                                  {vehicle.vehicle_color && (
                                    <div>🎨 Cor: {vehicle.vehicle_color}</div>
                                  )}
                                  {vehicle.vehicle_year && (
                                    <div>📅 Ano: {vehicle.vehicle_year}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {!vehicle.is_default && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetDefaultVehicle(vehicle)}
                                    className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                                    title="Definir como padrão"
                                  >
                                    <Star className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenVehicleForm(vehicle)}
                                  title="Editar veículo"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteVehicle(vehicle)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Remover veículo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulário de Adicionar/Editar Veículo */}
                    {showAddVehicle && (
                      <div className="bg-white border-2 border-dashed border-green-400 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">
                            {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
                          </h4>
                          <Button
                            type="button"
                            onClick={handleCancelVehicleForm}
                            variant="ghost"
                            size="sm"
                          >
                            Cancelar
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {/* Área de Upload em Destaque */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <Label className="text-blue-900 font-semibold mb-2 block">1º Passo: Upload do Documento (CRLV)</Label>
                            <div className="flex gap-2 items-center">
                              <div className="relative flex-1">
                                <Input
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={handleVehicleDocumentUpload}
                                  disabled={isProcessingDoc}
                                  className="bg-white border-blue-200"
                                />
                                {isProcessingDoc && (
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center bg-white pl-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 mr-2" />
                                    <span className="text-xs text-blue-600 font-medium">Lendo documento...</span>
                                  </div>
                                )}
                              </div>
                              {vehicleFormData.registration_document_url && (
                                <Button type="button" variant="outline" onClick={() => window.open(vehicleFormData.registration_document_url, '_blank')} className="bg-white hover:bg-gray-50">
                                  <Car className="w-4 h-4 mr-2" />
                                  Ver Doc
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                              <span className="bg-blue-200 text-blue-800 rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px] font-bold">i</span>
                              Envie o documento primeiro para preencher os dados abaixo automaticamente.
                            </p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Modelo do Veículo *</Label>
                              <Input
                                value={vehicleFormData.vehicle_model}
                                onChange={(e) => setVehicleFormData({...vehicleFormData, vehicle_model: e.target.value})}
                                placeholder="Ex: Toyota Corolla 2023"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Placa *</Label>
                              <Input
                                value={vehicleFormData.vehicle_plate}
                                onChange={(e) => setVehicleFormData({...vehicleFormData, vehicle_plate: e.target.value.toUpperCase()})}
                                placeholder="ABC-1234"
                                className="uppercase font-mono"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Cor</Label>
                              <Input
                                value={vehicleFormData.vehicle_color}
                                onChange={(e) => setVehicleFormData({...vehicleFormData, vehicle_color: e.target.value})}
                                placeholder="Ex: Prata"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Ano</Label>
                              <Input
                                value={vehicleFormData.vehicle_year}
                                onChange={(e) => setVehicleFormData({...vehicleFormData, vehicle_year: e.target.value})}
                                placeholder="2023"
                              />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <Label>Validade do Licenciamento (CRLV)</Label>
                              <Input
                                type="date"
                                value={vehicleFormData.registration_expiry}
                                onChange={(e) => setVehicleFormData({...vehicleFormData, registration_expiry: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                          <input
                            type="checkbox"
                            id="is_default"
                            checked={vehicleFormData.is_default}
                            onChange={(e) => setVehicleFormData({...vehicleFormData, is_default: e.target.checked})}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="is_default" className="cursor-pointer text-sm font-medium text-yellow-900 flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-600" />
                            Definir como veículo padrão
                          </Label>
                        </div>

                        <Button
                          type="button"
                          onClick={handleSaveVehicle}
                          disabled={createVehicleMutation.isLoading || updateVehicleMutation.isLoading}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {(createVehicleMutation.isLoading || updateVehicleMutation.isLoading) ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              {editingVehicle ? 'Atualizar Veículo' : 'Adicionar Veículo'}
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {driverVehicles.length === 0 && !showAddVehicle && (
                      <Alert className="bg-amber-50 border-amber-300">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 text-sm">
                          Este motorista ainda não possui veículos cadastrados. Clique em "Adicionar Veículo" para cadastrar.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Status do Motorista */}
                <div className="bg-red-50 p-4 rounded-lg space-y-4 border-2 border-red-300">
                  <h3 className="font-semibold text-red-900">Status do Motorista</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="active-status" className="text-sm font-medium leading-none cursor-pointer">
                      Ativo
                    </Label>
                    <Switch
                      id="active-status"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                    />
                  </div>
                  <p className="text-xs text-red-700">
                    Desative para impedir que o motorista receba novas viagens ou seja escalado. Motoristas inativos não aparecem nas listas de atribuição.
                  </p>
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Observações sobre o motorista..."
                    className="h-20"
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createDriverMutation.isLoading || updateDriverMutation.isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {(createDriverMutation.isLoading || updateDriverMutation.isLoading) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {editingDriver ? 'Salvar Alterações' : 'Cadastrar Motorista'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Você tem certeza que deseja remover o motorista{' '}
                <span className="font-semibold">{driverToDelete?.name}</span>?
                Essa ação não pode ser desfeita.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteDriver}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removendo...
                  </>
                ) : (
                  'Remover'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}