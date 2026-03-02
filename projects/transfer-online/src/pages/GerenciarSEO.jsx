import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function GerenciarSEO() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: metaTags = [], isLoading } = useQuery({
    queryKey: ['meta-tags'],
    queryFn: async () => {
      const items = await base44.entities.MetaTag.list();
      return items.sort((a, b) => a.page_path.localeCompare(b.page_path));
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        return base44.entities.MetaTag.update(data.id, data);
      } else {
        return base44.entities.MetaTag.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meta-tags']);
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success('Configuração SEO salva com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MetaTag.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['meta-tags']);
      toast.success('Configuração removida com sucesso!');
    }
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover esta configuração?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const filteredItems = metaTags.filter(item => 
    item.page_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar SEO (Meta Tags)</h1>
          <p className="text-gray-500">Configure títulos, descrições e palavras-chave para otimização nos buscadores.</p>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por caminho ou título..."
              className="pl-10 max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Caminho (Path)</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Nenhuma configuração encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.page_path}</TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="max-w-md truncate text-gray-500">
                    {item.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MetaTagDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        initialData={editingItem}
        onSave={saveMutation.mutate}
        isSaving={saveMutation.isPending}
      />
    </div>
  );
}

function MetaTagDialog({ open, onOpenChange, initialData, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    page_path: '/',
    title: '',
    description: '',
    keywords: '',
    og_image: '',
    no_index: false
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        page_path: '/',
        title: '',
        description: '',
        keywords: '',
        og_image: '',
        no_index: false
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar SEO' : 'Nova Configuração SEO'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="path">Caminho da Página (ex: /)</Label>
              <Input
                id="path"
                value={formData.page_path}
                onChange={(e) => setFormData({...formData, page_path: e.target.value})}
                placeholder="/minha-pagina"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Meta Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Título da Página"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Meta Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição breve para aparecer no Google..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Palavras-chave (separadas por vírgula)</Label>
            <Input
              id="keywords"
              value={formData.keywords || ''}
              onChange={(e) => setFormData({...formData, keywords: e.target.value})}
              placeholder="transfer, executivo, viagem..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="og_image">Imagem de Compartilhamento (URL)</Label>
            <Input
              id="og_image"
              value={formData.og_image || ''}
              onChange={(e) => setFormData({...formData, og_image: e.target.value})}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="no_index"
              checked={formData.no_index}
              onCheckedChange={(checked) => setFormData({...formData, no_index: checked})}
            />
            <Label htmlFor="no_index">Bloquear indexação (noindex)</Label>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}