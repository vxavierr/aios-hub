import React from 'react';
import { Button } from '@/components/ui/button';
import { Car, AlertCircle, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function DriverDataSection({ 
  serviceRequest, 
  formData, 
  passengersDetails, 
  onManageDriver 
}) {
  
  const handleCopyTripSummary = () => {
    try {
      // Formatar data e hora
      let dateTimeStr = `${formData.date}T${formData.time}`;
      // Fallback simples se a data não for válida diretamente
      if (!formData.date || !formData.time) dateTimeStr = new Date().toISOString(); 
      
      let dataFormatada = formData.date;
      try {
        if (formData.date && formData.time) {
           dataFormatada = format(new Date(formData.date + 'T' + formData.time), 'dd/MM/yyyy');
        } else if (formData.date) {
           const [y, m, d] = formData.date.split('-');
           dataFormatada = `${d}/${m}/${y}`;
        }
      } catch (e) {
        console.warn('Erro ao formatar data para copia:', e);
      }

      let summary = `📋 *Resumo da Viagem*\n\n`;
      summary += `📅 Data: ${dataFormatada} às ${formData.time}\n`;
      summary += `📍 Origem: ${formData.origin}\n`;
      
      if (formData.planned_stops && formData.planned_stops.length > 0) {
        formData.planned_stops.forEach((stop, index) => {
          let stopInfo = `➡️ Parada ${index + 1}: ${stop.address}`;
          if (stop.notes) stopInfo += ` (${stop.notes})`;
          summary += `${stopInfo}\n`;
        });
      }
      
      summary += `🏁 Destino: ${formData.destination || 'A definir'}\n`;
      
      // Passageiros
      let passengersText = formData.passenger_name || '';
      if (passengersDetails && passengersDetails.length > 0) {
         const extraNames = passengersDetails.map(p => p.name).filter(Boolean).join(', ');
         if (passengersText && extraNames) passengersText += `, ${extraNames}`;
         else if (extraNames) passengersText = extraNames;
      }
      summary += `👥 Passageiro(s): ${passengersText} (${formData.passengers} pax)\n\n`;
      
      summary += `🚘 *Motorista e Veículo*\n`;
      summary += `👤 Motorista: ${serviceRequest.driver_name || 'A definir'} ${serviceRequest.driver_phone || ''}\n`;
      summary += `🚙 Veículo: ${serviceRequest.vehicle_model || 'A definir'} - ${serviceRequest.vehicle_plate || ''}`;

      navigator.clipboard.writeText(summary);
      toast.success('Resumo da viagem copiado para a área de transferência!');
    } catch (err) {
      console.error('Erro ao copiar resumo:', err);
      toast.error('Erro ao copiar resumo da viagem.');
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-blue-900 flex items-center gap-2">
            <Car className="w-5 h-5" />
            Motorista e Veículo
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyTripSummary}
            className="h-7 px-2 text-blue-700 hover:bg-blue-100 hover:text-blue-900 ml-2"
            title="Copiar Resumo da Viagem"
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs">Copiar Resumo</span>
          </Button>
        </div>
        {serviceRequest.chosen_supplier_id && ['confirmada', 'em_andamento', 'concluida'].includes(serviceRequest.status) ? (
          <Button 
            type="button"
            size="sm" 
            variant="outline" 
            onClick={onManageDriver}
            className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Car className="w-4 h-4 mr-2" />
            Gerenciar
          </Button>
        ) : serviceRequest.chosen_supplier_id ? (
          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" />
            Aceite a viagem p/ designar motorista
          </span>
        ) : null}
      </div>
      {serviceRequest.driver_name ? (
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700 block text-xs">Motorista:</span>
            <span className="font-medium text-gray-900">{serviceRequest.driver_name}</span>
            <div className="text-gray-500 text-xs">{serviceRequest.driver_phone}</div>
          </div>
          <div>
            <span className="text-blue-700 block text-xs">Veículo:</span>
            <span className="font-medium text-gray-900">{serviceRequest.vehicle_model}</span>
            <div className="text-gray-500 text-xs">{serviceRequest.vehicle_plate}</div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-blue-800 italic flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Nenhum motorista atribuído.
        </div>
      )}
    </div>
  );
}