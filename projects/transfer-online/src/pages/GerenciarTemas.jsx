import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Palette, Plus, Trash2, Edit2, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';

const CHRISTMAS_PRESET = {
  name: "Natal 2025",
  start_date: "2025-12-01",
  end_date: "2025-12-31",
  is_active: true,
  theme_data: {
    primary_color: "#ef4444", // red-500
    secondary_color: "#15803d", // green-700
    background_overlay_color: "rgba(255, 255, 255, 0.9)",
    background_image_url: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=2000&auto=format&fit=crop", // Christmas background
    welcome_title: "Boas Festas! 🎄",
    welcome_message: "Viaje com segurança neste Natal.",
    decoration_icon: "snowflake",
    card_background_color: "#ffffff"
  }
};

const NEW_YEAR_PRESET = {
  name: "Ano Novo 2026",
  start_date: "2025-12-26",
  end_date: "2026-01-05",
  is_active: true,
  theme_data: {
    primary_color: "#eab308", // yellow-500
    secondary_color: "#1e3a8a", // blue-900
    background_overlay_color: "rgba(255, 255, 255, 0.9)",
    background_image_url: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=2000&auto=format&fit=crop", // Fireworks
    welcome_title: "Feliz Ano Novo! ✨",
    welcome_message: "Comece 2026 viajando com estilo.",
    decoration_icon: "star",
    card_background_color: "#ffffff"
  }
};

export default function GerenciarTemas() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_active: true,
    theme_data: {
      primary_color: '#2563eb',
      secondary_color: '#1e40af',
      background_image_url: '',
      welcome_title: '',
      welcome_message: '',
      decoration_icon: 'none'
    }
  });

  const { data: themes, isLoading } = useQuery({
    queryKey: ['seasonalConfigs'],
    queryFn: () => base44.entities.SeasonalConfig.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SeasonalConfig.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seasonalConfigs']);
      setIsDialogOpen(false);
      toast.success('Tema criado com sucesso!');
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SeasonalConfig.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seasonalConfigs']);
      setIsDialogOpen(false);
      toast.success('Tema atualizado com sucesso!');
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SeasonalConfig.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['seasonalConfigs']);
      toast.success('Tema excluído com sucesso!');
    }
  });

  const resetForm = () => {
    setEditingTheme(null);
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      is_active: true,
      theme_data: {
        primary_color: '#2563eb',
        secondary_color: '#1e40af',
        background_image_url: '',
        welcome_title: '',
        welcome_message: '',
        decoration_icon: 'none'
      }
    });
  };

  const handleEdit = (theme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      start_date: theme.start_date,
      end_date: theme.end_date,
      is_active: theme.is_active,
      theme_data: theme.theme_data || {}
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTheme) {
      updateMutation.mutate({ id: editingTheme.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const loadPreset = (preset) => {
    setFormData({
      ...formData,
      ...preset
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Palette className="w-8 h-8 text-blue-600" />
            Temas Sazonais
          </h1>
          <p className="text-gray-500">Personalize a aparência do app para datas comemorativas.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Tema
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTheme ? 'Editar Tema' : 'Novo Tema Sazonal'}</DialogTitle>
            </DialogHeader>
            
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => loadPreset(CHRISTMAS_PRESET)} className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                <Sparkles className="w-3 h-3 mr-2" />
                Aplicar Sugestão de Natal
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadPreset(NEW_YEAR_PRESET)} className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
                <Sparkles className="w-3 h-3 mr-2" />
                Aplicar Sugestão de Ano Novo
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Tema</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required 
                    placeholder="Ex: Natal 2025"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch 
                    checked={formData.is_active}
                    onCheckedChange={checked => setFormData({...formData, is_active: checked})}
                  />
                  <Label>Tema Ativo</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input 
                    type="date"
                    value={formData.start_date} 
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Término</Label>
                  <Input 
                    type="date"
                    value={formData.end_date} 
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-4">Aparência</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Cor Primária (Botões, Destaques)</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={formData.theme_data.primary_color}
                        onChange={e => setFormData({...formData, theme_data: {...formData.theme_data, primary_color: e.target.value}})}
                        className="w-12 p-1 h-10"
                      />
                      <Input 
                        value={formData.theme_data.primary_color}
                        onChange={e => setFormData({...formData, theme_data: {...formData.theme_data, primary_color: e.target.value}})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={formData.theme_data.secondary_color}
                        onChange={e => setFormData({...formData, theme_data: {...formData.theme_data, secondary_color: e.target.value}})}
                        className="w-12 p-1 h-10"
                      />
                      <Input 
                        value={formData.theme_data.secondary_color}
                        onChange={e => setFormData({...formData, theme_data: {...formData.theme_data, secondary_color: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label>URL da Imagem de Fundo</Label>
                  <Input 
                    value={formData.theme_data.background_image_url} 
                    onChange={e => setFormData({...formData, theme_data: {...formData.theme_data, background_image_url: e.target.value}})}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Título de Boas-vindas</Label>
                    <Input 
                      value={formData.theme_data.welcome_title} 
                      onChange={e => setFormData({...formData, theme_data: {...formData.theme_data, welcome_title: e.target.value}})}
                      placeholder="Ex: Feliz Natal!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mensagem</Label>
                    <Input 
                      value={formData.theme_data.welcome_message} 
                      onChange={e => setFormData({...formData, theme_data: {...formData.theme_data, welcome_message: e.target.value}})}
                      placeholder="Ex: Aproveite as festas..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ícone Decorativo</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.theme_data.decoration_icon}
                    onChange={e => setFormData({...formData, theme_data: {...formData.theme_data, decoration_icon: e.target.value}})}
                  >
                    <option value="none">Nenhum</option>
                    <option value="snowflake">Floco de Neve ❄️</option>
                    <option value="tree">Árvore de Natal 🎄</option>
                    <option value="star">Estrela ⭐</option>
                    <option value="gift">Presente 🎁</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Tema</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Temas Configurados</CardTitle>
            <CardDescription>Gerencie os temas ativos e agendados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {themes?.map((theme) => (
                  <TableRow key={theme.id}>
                    <TableCell className="font-medium">{theme.name}</TableCell>
                    <TableCell>{new Date(theme.start_date).toLocaleDateString()} - {new Date(theme.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {theme.is_active ? 
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge> : 
                        <Badge variant="secondary">Inativo</Badge>
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: theme.theme_data?.primary_color }}></div>
                        <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: theme.theme_data?.secondary_color }}></div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(theme)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => deleteMutation.mutate(theme.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!themes || themes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum tema configurado. Clique em "Novo Tema" para começar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}