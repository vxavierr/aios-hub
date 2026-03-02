import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Building2, Car, Shield, BarChart3, Users, Globe, Calendar, MapPin, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Demonstracao() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    company_name: '',
    role: '',
    company_size: '',
    target_audience: '', // 'company' or 'supplier'
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.target_audience) {
      setError('Por favor, selecione seu perfil (Empresa ou Fornecedor).');
      setIsSubmitting(false);
      return;
    }

    try {
      await base44.functions.invoke('submitLeadRequest', formData);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center p-8 shadow-xl border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Solicitação Recebida!</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Obrigado pelo interesse na TransferOnline. Nossa equipe comercial entrará em contato em breve para apresentar nossas soluções de Gestão de Eventos e Transporte Corporativo.
          </p>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-12"
            onClick={() => window.location.href = '/'}
          >
            Voltar para a Página Inicial
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-lg">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68effdb75fcac474f3f66b8f/57204d3c2_logo-icone.jpg" 
                alt="TransferOnline Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="font-bold text-xl text-white tracking-tight drop-shadow-md">TransferOnline</span>
          </div>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 border border-white/20 hover:border-white/40 hidden sm:inline-flex rounded-full px-6"
            onClick={() => window.location.href = '/'}
          >
            Acessar Sistema
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 to-blue-900 text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-800/50 rounded-full px-4 py-1.5 mb-6 border border-blue-700/50 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm font-medium text-blue-100">Nova Funcionalidade: Gestão de Eventos</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            A Revolução na Gestão de <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Transporte & Eventos</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Unificamos transporte corporativo, logística de eventos e gestão de frota em uma única plataforma inteligente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-500 text-white text-lg px-8 h-14 rounded-full shadow-lg shadow-blue-900/20 font-bold transition-all hover:scale-105"
              onClick={() => document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' })}
            >
              Agendar Demo Gratuita
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-transparent border-slate-600 text-white hover:bg-white/10 text-lg px-8 h-14 rounded-full font-semibold"
              onClick={() => window.location.href = '#features'}
            >
              Conhecer Recursos
            </Button>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Um Ecossistema Completo</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Soluções integradas para cada aspecto da sua operação logística.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Gestão de Eventos */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Gestão de Eventos</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Coordene a logística de transporte de grandes eventos com facilidade. Listas de passageiros, check-in por QR Code e monitoramento em tempo real.
              </p>
              <ul className="space-y-3">
                {[
                  "Check-in digital com QR Code",
                  "Agrupamento inteligente de passageiros",
                  "Links de receptivo compartilháveis",
                  "Dashboard operacional ao vivo"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Transporte Corporativo */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Corporativo</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Controle total sobre as viagens dos colaboradores. Aprovações multinível, centros de custo e conformidade com políticas de viagem.
              </p>
              <ul className="space-y-3">
                {[
                  "Fluxos de aprovação personalizáveis",
                  "Gestão de centro de custo",
                  "Relatórios de Despesas",
                  "Self-booking para colaboradores"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Gestão de Frota e Fornecedores */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Car className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Frota e Fornecedores</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Ferramentas poderosas para fornecedores de transporte gerenciarem motoristas, veículos, faturamento e parceiros.
              </p>
              <ul className="space-y-3">
                {[
                  "Gestão de motoristas e documentos",
                  "Gestão de parceiros",
                  "Rastreamento GPS em tempo real",
                  "Faturamento automatizado"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Segurança Total", desc: "Monitoramento 24/7." },
              { icon: Zap, title: "Automação", desc: "Reduza o trabalho manual com processos de dispatch inteligentes." },
              { icon: Globe, title: "Cobertura Global", desc: "Conecte-se a uma rede de parceiros em diversas localidades." },
              { icon: Users, title: "App Dedicado", desc: "Aplicativos intuitivos para passageiros, motoristas e gestores." }
            ].map((feature, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700 ring-1 ring-slate-200">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="form-section" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden shadow-2xl border-0 rounded-3xl">
              <div className="grid lg:grid-cols-5">
                <div className="lg:col-span-2 bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold mb-6">Agende sua Demonstração</h3>
                    <p className="text-slate-300 mb-8 leading-relaxed">
                      Descubra como a TransferOnline pode transformar a logística da sua empresa. Preencha o formulário e nossa equipe entrará em contato.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</div>
                        <p>Análise personalizada do seu cenário</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">2</div>
                        <p>Tour completo pela plataforma</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">3</div>
                        <p>Proposta comercial sob medida</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 relative z-10">
                    <p className="text-xs text-slate-500">TransferOnline &copy; 2024</p>
                  </div>
                </div>
                
                <div className="lg:col-span-3 p-10 bg-white">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-slate-800">Qual o seu objetivo principal?</Label>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => handleSelectChange('target_audience', 'company')}
                          className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                            formData.target_audience === 'company' 
                              ? 'border-blue-600 bg-blue-50/50' 
                              : 'border-slate-100 hover:border-blue-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <Building2 className={`w-5 h-5 ${formData.target_audience === 'company' ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className={`font-bold ${formData.target_audience === 'company' ? 'text-blue-700' : 'text-slate-700'}`}>Empresa</span>
                          </div>
                          <p className="text-xs text-slate-500">Gestão de viagens e eventos corporativos</p>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleSelectChange('target_audience', 'supplier')}
                          className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                            formData.target_audience === 'supplier' 
                              ? 'border-emerald-600 bg-emerald-50/50' 
                              : 'border-slate-100 hover:border-emerald-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <Car className={`w-5 h-5 ${formData.target_audience === 'supplier' ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span className={`font-bold ${formData.target_audience === 'supplier' ? 'text-emerald-700' : 'text-slate-700'}`}>Fornecedor</span>
                          </div>
                          <p className="text-xs text-slate-500">Gestão de clientes, viagens e motoristas</p>
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nome Completo</Label>
                        <Input id="full_name" placeholder="Seu nome" required value={formData.full_name} onChange={handleInputChange} className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail Corporativo</Label>
                        <Input id="email" type="email" placeholder="nome@empresa.com" required value={formData.email} onChange={handleInputChange} className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone_number">Telefone / WhatsApp</Label>
                        <Input id="phone_number" placeholder="(00) 00000-0000" required value={formData.phone_number} onChange={handleInputChange} className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company_name">Empresa</Label>
                        <Input id="company_name" placeholder="Nome da sua empresa" required value={formData.company_name} onChange={handleInputChange} className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="role">Cargo</Label>
                        <Input id="role" placeholder="Ex: Gestor de Eventos" value={formData.role} onChange={handleInputChange} className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company_size">Tamanho da Empresa</Label>
                        <Select onValueChange={(val) => handleSelectChange('company_size', val)} value={formData.company_size}>
                          <SelectTrigger id="company_size" className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 funcionários</SelectItem>
                            <SelectItem value="11-50">11-50 funcionários</SelectItem>
                            <SelectItem value="51-200">51-200 funcionários</SelectItem>
                            <SelectItem value="201-500">201-500 funcionários</SelectItem>
                            <SelectItem value="500+">500+ funcionários</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem (Opcional)</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Quais são seus maiores desafios hoje com transporte ou eventos?" 
                        className="min-h-[100px] bg-slate-50 border-slate-200 focus:bg-white transition-colors resize-none"
                        value={formData.message}
                        onChange={handleInputChange}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg h-12 rounded-xl shadow-lg shadow-blue-500/25 font-bold transition-all hover:scale-[1.01]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Processando..."
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Agendar Demonstração <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
        <div className="container mx-auto px-4">
          <p className="mb-4 font-medium text-slate-300">TransferOnline - Tecnologia em Mobilidade Corporativa</p>
          <div className="flex justify-center gap-6 text-sm mb-6">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>
          <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} TransferOnline. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}