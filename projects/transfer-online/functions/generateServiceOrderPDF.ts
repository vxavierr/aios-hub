import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';
import jspdfAutotable from 'npm:jspdf-autotable@3.8.2';

const autoTable = jspdfAutotable.default || jspdfAutotable;

// Shim for jsPDF in Deno environment
if (typeof window === 'undefined') {
  const mockWindow = {
    document: {
      createElementNS: () => ({}),
      createElement: () => ({ style: {}, getContext: () => ({}) }),
      head: { appendChild: () => {} },
      body: { appendChild: () => {} },
    },
    location: {
      href: 'http://localhost',
      protocol: 'http:',
      host: 'localhost',
    },
    navigator: { userAgent: 'Deno' },
    URL: { createObjectURL: () => {} },
    Image: class { constructor() { this.src = ''; this.width = 0; this.height = 0; } },
  };
  globalThis.window = mockWindow;
  globalThis.document = mockWindow.document;
  globalThis.jsPDF = jsPDF;
  globalThis.window.jsPDF = jsPDF;
} else if (!globalThis.window.location) {
  // Ensure location exists if window exists but location is missing
  globalThis.window.location = {
    href: 'http://localhost',
    protocol: 'http:',
    host: 'localhost',
  };
}

const translations = {
  pt: {
    title: "ORDEM DE SERVIÇO",
    request_number: "Nº Solicitação",
    status: "Status",
    stop: "Parada",
    date: "Data",
    time: "Horário",
    origin: "Origem",
    destination: "Destino",
    passengers: "Passageiros",
    passenger_name: "Passageiro Principal",
    passenger_phone: "Telefone Passageiro",
    driver_info: "DADOS DO MOTORISTA E VEÍCULO",
    driver_name: "Motorista",
    driver_phone: "Telefone Motorista",
    vehicle_model: "Veículo",
    vehicle_color: "Cor",
    vehicle_plate: "Placa",
    notes: "Observações",
    service_type: "Tipo de Serviço",
    generated_at: "Gerado em",
    company_info: "TransferOnline - Soluções em Transporte Corporativo",
    one_way: "Só Ida",
    round_trip: "Ida e Volta",
    hourly: "Por Hora",
    distance: "Distância Estimada",
    supplier_info: "DADOS DO FORNECEDOR",
    supplier_name: "Fornecedor",
    supplier_phone: "Telefone Fornecedor",
    additional_passengers: "Passageiros Adicionais",
    document: "Documento",
    name: "Nome"
  },
  en: {
    title: "SERVICE ORDER",
    request_number: "Request #",
    status: "Status",
    stop: "Stop",
    date: "Date",
    time: "Time",
    origin: "Origin",
    destination: "Destination",
    passengers: "Passengers",
    passenger_name: "Lead Passenger",
    passenger_phone: "Passenger Phone",
    driver_info: "DRIVER AND VEHICLE INFO",
    driver_name: "Driver",
    driver_phone: "Driver Phone",
    vehicle_model: "Vehicle",
    vehicle_color: "Color",
    vehicle_plate: "License Plate",
    notes: "Notes",
    service_type: "Service Type",
    generated_at: "Generated at",
    company_info: "TransferOnline - Corporate Transport Solutions",
    one_way: "One Way",
    round_trip: "Round Trip",
    hourly: "Hourly",
    distance: "Est. Distance",
    additional_passengers: "Additional Passengers",
    document: "Document",
    name: "Name",
    supplier_info: "SUPPLIER DETAILS",
    supplier_name: "Supplier",
    supplier_phone: "Supplier Phone"
  },
  es: {
    title: "ORDEN DE SERVICIO",
    request_number: "Nº Solicitud",
    status: "Estado",
    stop: "Parada",
    date: "Fecha",
    time: "Hora",
    origin: "Origen",
    destination: "Destino",
    passengers: "Pasajeros",
    passenger_name: "Pasajero Principal",
    passenger_phone: "Teléfono Pasajero",
    driver_info: "DATOS DEL CONDUCTOR Y VEHÍCULO",
    driver_name: "Conductor",
    driver_phone: "Teléfono Conductor",
    vehicle_model: "Vehículo",
    vehicle_color: "Color",
    vehicle_plate: "Matrícula",
    notes: "Observaciones",
    service_type: "Tipo de Servicio",
    generated_at: "Generado en",
    company_info: "TransferOnline - Soluciones de Transporte Corporativo",
    one_way: "Solo Ida",
    round_trip: "Ida y Vuelta",
    hourly: "Por Horas",
    distance: "Distancia Est.",
    additional_passengers: "Pasajeros Adicionales",
    document: "Documento",
    name: "Nombre",
    supplier_info: "DATOS DEL PROVEEDOR",
    supplier_name: "Proveedor",
    supplier_phone: "Teléfono Proveedor"
  }
};

async function fetchImageAsBase64(url) {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < buffer.length; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  } catch (e) {
    console.error('Error fetching image:', e);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { requestId, requestType, language = 'pt' } = await req.json();

    if (!requestId) {
      return Response.json({ error: 'ID da solicitação é obrigatório' }, { status: 400 });
    }

    let request;
    if (requestType === 'own') {
      request = await base44.asServiceRole.entities.SupplierOwnBooking.get(requestId);
    } else {
      request = await base44.asServiceRole.entities.ServiceRequest.get(requestId);
    }
    
    if (!request) {
      return Response.json({ error: 'Solicitação não encontrada' }, { status: 404 });
    }

    let supplier = null;
    if (request.chosen_supplier_id) {
      try {
        supplier = await base44.asServiceRole.entities.Supplier.get(request.chosen_supplier_id);
      } catch (e) {
        console.error('Erro ao buscar fornecedor:', e);
      }
    }

    const t = translations[language] || translations.pt;
    
    // Initialize PDF
    const doc = new jsPDF();
    
    // === HEADER ===
    doc.setFillColor(37, 99, 235); // Blue color
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(t.title, 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`#${request.request_number || request.id.slice(0, 8).toUpperCase()}`, 105, 30, { align: 'center' });

    let yPos = 50;

    // === TRIP INFO ===
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(t.service_type.toUpperCase(), 14, yPos);
    yPos += 6;

    // Table for trip details
    const serviceTypeLabel = request.service_type === 'one_way' ? t.one_way : 
                             request.service_type === 'round_trip' ? t.round_trip : t.hourly;

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: [
        [t.date, request.date ? new Date(request.date).toLocaleDateString('pt-BR') : '-'],
        [t.time, request.time || '-'],
        [t.service_type, serviceTypeLabel],
        [t.passengers, request.passengers || 1],
      ],
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 1.5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });

    yPos = doc.lastAutoTable.finalY + 8;

    // === ROUTE ===
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("ROTA / ROUTE", 14, yPos);
    yPos += 6;

    const routeBody = [
      [t.origin, request.origin || '-']
    ];

    // Combinar paradas planejadas e adicionais
    const allStops = [
      ...(request.planned_stops || []),
      ...(request.additional_stops || [])
    ];

    if (allStops.length > 0) {
      allStops.forEach((stop, index) => {
        const mainInfo = stop.address || stop.notes || '-';
        const extraInfo = (stop.address && stop.notes) ? ` (${stop.notes})` : '';
        routeBody.push([`${t.stop} ${index + 1}`, mainInfo + extraInfo]);
      });
    }

    routeBody.push([t.destination, request.destination || '-']);

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: routeBody,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
      columnStyles: { 
        0: { fontStyle: 'bold', cellWidth: 50, textColor: [37, 99, 235] },
        1: { cellWidth: 'auto' }
      }
    });

    yPos = doc.lastAutoTable.finalY + 8;

    // === PASSENGER INFO ===
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(t.passengers.toUpperCase(), 14, yPos);
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: [
        [t.passenger_name, request.passenger_name || '-'],
        [t.passenger_phone, request.passenger_phone || '-'],
      ],
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 1.5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });

    yPos = doc.lastAutoTable.finalY + 8;

    // === ADDITIONAL PASSENGERS ===
    if (request.passengers_details && Array.isArray(request.passengers_details) && request.passengers_details.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(t.additional_passengers.toUpperCase(), 14, yPos);
      yPos += 6;

      const passengersBody = request.passengers_details.map(p => [
        p.name || '-',
        p.document_number ? `${p.document_type || 'DOC'}: ${p.document_number}` : '-'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [[t.name, t.document]],
        body: passengersBody,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 1.5 },
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' }
      });

      yPos = doc.lastAutoTable.finalY + 8;
    }

    // === SUPPLIER INFO ===
    if (supplier) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(t.supplier_info || "DADOS DO FORNECEDOR", 14, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        head: [],
        body: [
          [t.supplier_name || "Fornecedor", supplier.name || '-'],
          [t.supplier_phone || "Telefone", supplier.phone_number || '-'],
        ],
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 1.5 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
      });

      yPos = doc.lastAutoTable.finalY + 8;
    }

    // === DRIVER INFO (Highlighted) ===
    
    // Preparar dados do motorista: inicia com o que está na request (fallback)
    let driverData = {
      name: request.driver_name || '',
      phone: request.driver_phone || '',
      photo_url: request.driver_photo_url || '',
      vehicle_model: request.vehicle_model || '',
      vehicle_color: request.vehicle_color || '',
      vehicle_plate: request.vehicle_plate || ''
    };

    // Se tiver ID, busca dados atualizados diretamente das entidades Driver e DriverVehicle
    if (request.driver_id) {
      try {
        const driverEntity = await base44.asServiceRole.entities.Driver.get(request.driver_id);
        if (driverEntity) {
          // Prioriza dados da entidade Driver (mais recentes)
          if (driverEntity.name) driverData.name = driverEntity.name;
          if (driverEntity.phone_number) driverData.phone = driverEntity.phone_number;
          if (driverEntity.photo_url) driverData.photo_url = driverEntity.photo_url;
          
          // Busca veículos ativos do motorista
          const vehicles = await base44.asServiceRole.entities.DriverVehicle.filter({ driver_id: request.driver_id, active: true });
          
          if (vehicles && vehicles.length > 0) {
            // Tenta encontrar o veículo padrão, senão pega o primeiro da lista
            const currentVehicle = vehicles.find(v => v.is_default) || vehicles[0];
            
            // Prioriza os dados do veículo atualizado do motorista
            if (currentVehicle) {
              driverData.vehicle_model = currentVehicle.vehicle_model;
              driverData.vehicle_color = currentVehicle.vehicle_color;
              driverData.vehicle_plate = currentVehicle.vehicle_plate;
            }
          }
        }
      } catch (e) {
        console.error('Erro ao buscar dados complementares do motorista:', e);
      }
    }

    // Exibir bloco se houver Nome OU Foto OU Placa
    if (driverData.name || driverData.photo_url || driverData.vehicle_plate) {
      
      const pageHeight = doc.internal.pageSize.height;
      if (yPos + 60 > pageHeight - 20) { 
        doc.addPage();
        yPos = 30; 
      }

      // Background box
      doc.setFillColor(240, 240, 240);
      doc.rect(10, yPos - 5, 190, 45, 'F'); 

      // Title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235); 
      doc.text(t.driver_info, 14, yPos);
      
      // Reset color to black for details
      doc.setTextColor(0, 0, 0);
      yPos += 8;

      const textStartY = yPos; // Guardar posição Y inicial para o texto

      // Driver Details Table (Escrever texto PRIMEIRO)
      doc.setFontSize(9);
      
      // Nome
      doc.setFont('helvetica', 'bold');
      doc.text(`${t.driver_name}:`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(driverData.name || '-', 60, yPos);
      yPos += 6;

      // Telefone
      doc.setFont('helvetica', 'bold');
      doc.text(`${t.driver_phone}:`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(driverData.phone || '-', 60, yPos);
      yPos += 6;

      // Veículo
      doc.setFont('helvetica', 'bold');
      doc.text(`${t.vehicle_model}:`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${driverData.vehicle_model || '-'}${driverData.vehicle_color ? ` (${driverData.vehicle_color})` : ''}`, 60, yPos);
      yPos += 6;

      // Placa
      doc.setFont('helvetica', 'bold');
      doc.text(`${t.vehicle_plate}:`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11); 
      doc.text(driverData.vehicle_plate?.toUpperCase() || '-', 60, yPos);
      doc.setFontSize(9);

      // Driver Photo (Desenhar DEPOIS do texto, usando posição Y salva)
      if (driverData.photo_url) {
        const base64Img = await fetchImageAsBase64(driverData.photo_url);
        if (base64Img) {
          try {
            const ext = driverData.photo_url.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG';
            const imgSize = 30;
            const xImg = 150;
            const yImg = textStartY; // Usar a posição inicial salva

            // Fallback simplificado para evitar problemas de renderização do texto
            // Se o clip context estiver causando problemas, a imagem simples funcionará
            try {
              if (doc.context2d) {
                doc.context2d.save();
                doc.context2d.beginPath();
                doc.context2d.arc(xImg + imgSize / 2, yImg + imgSize / 2, imgSize / 2, 0, 2 * Math.PI, false);
                doc.context2d.clip();
                doc.addImage(base64Img, ext, xImg, yImg, imgSize, imgSize);
                doc.context2d.restore();
                // Borda
                doc.setDrawColor(37, 99, 235);
                doc.setLineWidth(0.5);
                doc.circle(xImg + imgSize / 2, yImg + imgSize / 2, imgSize / 2, 'S');
              } else {
                throw new Error("No context2d");
              }
            } catch (clipError) {
              // Fallback para imagem quadrada se o recorte falhar
              doc.addImage(base64Img, ext, xImg, yImg, imgSize, imgSize);
            }
          } catch (e) {
            console.error("Error adding image to PDF", e);
          }
        }
      }

      yPos += 10;
    }

    // === NOTES ===
    if (request.notes) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(t.notes.toUpperCase(), 14, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(request.notes, 180);
      doc.text(splitNotes, 14, yPos);
      yPos += splitNotes.length * 5 + 10;
    }

    // === FOOTER ===
    // Rodapé removido conforme solicitado


    // Output
    const pdfBase64 = doc.output('datauristring').split(',')[1];

    return Response.json({ success: true, pdfBase64 });

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});