import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verificar autenticação
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    let targetClientId = user.client_id;

    // Se for admin ou super admin, permite definir o client_id via body
    // Verifica role admin OU email específico do super admin (adicionando variações para garantir)
    const isSuperAdmin = [
      'fernandotransferonline@gmail.com',
      'fernando@transferonline.com.br',
      'contato@transferonline.com.br'
    ].includes(user.email);

    const isAdmin = user.role === 'admin' || isSuperAdmin;

    if (isAdmin) {
        try {
            const body = await req.json();
            if (body.client_id) {
                targetClientId = body.client_id;
            }
        } catch (e) {
            console.warn('Erro ao ler body ou body vazio:', e);
        }
    }

    // Verificar se temos um client_id alvo válido
    if (!targetClientId) {
      return Response.json({ 
        error: 'Client ID não identificado (usuário sem empresa e nenhum ID fornecido)' 
      }, { status: 403 });
    }

    // Buscar usuários do mesmo cliente usando service role
    // Aumentando o limite para garantir que traga todos (padrão pode ser 50)
    const clientUsers = await base44.asServiceRole.entities.User.filter({ 
      client_id: targetClientId 
    }, { limit: 1000 }); // Aumentado limite para 1000

    // Filtrar apenas usuários ativos
    // Removida a restrição de id !== user.id para permitir selecionar a si mesmo se necessário
    const availablePassengers = clientUsers.filter(u => 
      u.active !== false && 
      !u.is_driver 
    );

    // Ordenar por nome para facilitar
    availablePassengers.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

    return Response.json({
      success: true,
      users: availablePassengers,
      count: availablePassengers.length,
      target_client_id: targetClientId // Para debug
    });

  } catch (error) {
    console.error('[listClientUsers] Erro:', error);
    return Response.json({ 
      error: error.message || 'Erro ao buscar usuários' 
    }, { status: 500 });
  }
});