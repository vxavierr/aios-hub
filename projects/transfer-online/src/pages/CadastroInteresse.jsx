import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Building2, 
  Users, 
  TrendingUp, 
  Shield,
  Clock,
  DollarSign,
  BarChart3,
  Truck,
  Calendar
} from 'lucide-react';

export default function CadastroInteresse() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone_number: '',
    company_size: '',
    monthly_trips_estimate: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const urlParams = new URLSearchParams(window.location.search);
      
      return await base44.entities.LeadRequest.create({
        ...data,
        module_interest: selectedModule,
        status: 'novo',
        utm_source: urlParams.get('utm_source') || null,
        utm_campaign: urlParams.get('utm_campaign') || null
      });
    },
    onSuccess: () => {
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-2 border-green-500 shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cadastro Recebido com Sucesso! 🎉
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Nossa equipe irá analisar seu interesse e entrar em contato em breve.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Você receberá um email de confirmação no endereço fornecido.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Fazer Nova Solicitação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 mt-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Transforme a Gestão de Transportes da Sua Empresa
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha a solução ideal para suas necessidades e comece seu teste gratuito
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Módulo 2 - Cliente Corporativo */}
            <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-2xl cursor-pointer group">
              <CardHeader className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-1">Para Empresas</CardTitle>
                    <p className="text-blue-100 text-sm">Módulo de Gestão Corporativa</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Controle Total de Transportes</p>
                      <p className="text-sm text-gray-600">Gerencie todas as viagens da sua empresa</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Gestão de Funcionários</p>
                      <p className="text-sm text-gray-600">Cadastre usuários e defina permissões</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Analytics Avançado</p>
                      <p className="text-sm text-gray-600">Relatórios completos de gastos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Centros de Custo</p>
                      <p className="text-sm text-gray-600">Rateio inteligente de despesas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Aprovações Personalizadas</p>
                      <p className="text-sm text-gray-600">Fluxos de aprovação configuráveis</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedModule('module2')}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                >
                  Solicitar Teste Gratuito
                </Button>
              </CardContent>
            </Card>

            {/* Módulo 3 - Fornecedor */}
            <Card className="border-2 hover:border-green-500 transition-all hover:shadow-2xl cursor-pointer group">
              <CardHeader className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <Truck className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-1">Para Fornecedores</CardTitle>
                    <p className="text-green-100 text-sm">Módulo de Gestão Completa</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Gestão de Clientes</p>
                      <p className="text-sm text-gray-600">Cadastre e gerencie seus clientes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Agenda Inteligente</p>
                      <p className="text-sm text-gray-600">Organize viagens e motoristas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Gestão de Motoristas</p>
                      <p className="text-sm text-gray-600">Controle frota e profissionais</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Precificação Personalizada</p>
                      <p className="text-sm text-gray-600">Configure preços por cliente</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">Rastreamento em Tempo Real</p>
                      <p className="text-sm text-gray-600">Acompanhe viagens ao vivo</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedModule('module3')}
                  className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                >
                  Solicitar Teste Gratuito
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Teste gratuito por 30 dias • Sem cartão de crédito • Cancele quando quiser</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-2xl border-2">
          <CardHeader className={`${selectedModule === 'module2' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white p-8`}>
            <CardTitle className="text-3xl">
              {selectedModule === 'module2' ? '🏢 Cadastro - Módulo Corporativo' : '🚚 Cadastro - Módulo Fornecedor'}
            </CardTitle>
            <p className="text-white/90 mt-2">
              Preencha os dados abaixo para iniciar seu teste gratuito
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Erro ao enviar cadastro. Tente novamente.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nome da Empresa *</Label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="Ex: Empresa LTDA"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nome do Responsável *</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => handleChange('contact_name', e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Corporativo *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@empresa.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Telefone *</Label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => handleChange('phone_number', e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tamanho da Empresa *</Label>
                  <Select
                    value={formData.company_size}
                    onValueChange={(value) => handleChange('company_size', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 funcionários</SelectItem>
                      <SelectItem value="11-50">11-50 funcionários</SelectItem>
                      <SelectItem value="51-200">51-200 funcionários</SelectItem>
                      <SelectItem value="201-500">201-500 funcionários</SelectItem>
                      <SelectItem value="500+">Mais de 500 funcionários</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estimativa de Viagens/Mês *</Label>
                  <Select
                    value={formData.monthly_trips_estimate}
                    onValueChange={(value) => handleChange('monthly_trips_estimate', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-10">0-10 viagens</SelectItem>
                      <SelectItem value="11-50">11-50 viagens</SelectItem>
                      <SelectItem value="51-100">51-100 viagens</SelectItem>
                      <SelectItem value="100+">Mais de 100 viagens</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mensagem (opcional)</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Conte-nos mais sobre suas necessidades..."
                  rows={4}
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-semibold mb-2">✅ O que acontece depois?</p>
                <ul className="space-y-1 ml-4">
                  <li>• Nossa equipe analisará seu cadastro em até 24h</li>
                  <li>• Você receberá um email com instruções de acesso</li>
                  <li>• Teste gratuito por 30 dias, sem compromisso</li>
                  <li>• Suporte completo durante o período de teste</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedModule(null)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className={`flex-1 ${selectedModule === 'module2' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {submitMutation.isPending ? 'Enviando...' : 'Solicitar Teste Gratuito'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}