import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    const { input } = body;

    if (!input || input.trim().length < 3) {
      return Response.json({ predictions: [] });
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      return Response.json(
        { error: 'Google Maps API Key não configurada' },
        { status: 500 }
      );
    }

    // Chamar Google Places Autocomplete API
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.append('input', input);
    url.searchParams.append('key', apiKey);
    url.searchParams.append('language', 'pt-BR');
    url.searchParams.append('components', 'country:br'); // Restringir ao Brasil

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Erro na API do Google Places:', data);
      return Response.json(
        { error: 'Erro ao buscar endereços', details: data },
        { status: 400 }
      );
    }

    // Formatar as previsões para um formato mais simples
    const predictions = (data.predictions || []).map(pred => ({
      place_id: pred.place_id,
      description: pred.description,
      structured_formatting: pred.structured_formatting
    }));

    return Response.json({ predictions });

  } catch (error) {
    console.error('Erro ao buscar autocomplete:', error);
    return Response.json(
      { error: error.message || 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
});