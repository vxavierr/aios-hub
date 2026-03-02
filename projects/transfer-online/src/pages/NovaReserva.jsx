import React, { useState, useCallback, useMemo, useEffect, useRef, useTransition } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, ArrowRight, CheckCircle, AlertCircle, Loader2, Menu, User, LogOut, Package, Lock, Plane as PlaneIcon, LogIn, Phone, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Suspense } from 'react';
import MetaTags from '@/components/seo/MetaTags';

// Lazy load
const VehicleSelection = React.lazy(() => import('../components/booking/VehicleSelection'));
const BookingForm = React.lazy(() => import('../components/booking/BookingForm'));
const LocationAutocomplete = React.lazy(() => import('../components/booking/LocationAutocomplete'));
const FlightStatusChecker = React.lazy(() => import('../components/flight/FlightStatusChecker'));
const PhoneInputWithCountry = React.lazy(() => import('../components/ui/PhoneInputWithCountry'));
const WhatsAppButton = React.lazy(() => import('../components/WhatsAppButton'));

const ComponentLoader = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
  </div>
);


const BOOKING_STATE_KEY = 'transferonline_booking_state';

export default function NovaReserva({ isEmbedded }) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState('one_way');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [bookingNumber, setBookingNumber] = useState(null);
  const [user, setUser] = useState(null);
  const [driverLanguage, setDriverLanguage] = useState('pt');
  const [isInitializing, setIsInitializing] = useState(true);
  const hasRestoredStateRef = useRef(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [returnUrl, setReturnUrl] = useState(null);

  // States for location types (to detect airports from frequent locations)
  const [originLocationType, setOriginLocationType] = useState(null);
  const [destinationLocationType, setDestinationLocationType] = useState(null);

  // NOVO: Estado para sucesso de cotação
  const [quoteRequested, setQuoteRequested] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState(null);
  const [bookingLeadId, setBookingLeadId] = useState(null);

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    time: '',
    return_date: '',
    return_time: '',
    hours: 5,
    origin_flight_number: '',
    destination_flight_number: '',
    return_origin_flight_number: '',
    return_destination_flight_number: '',
    phone: '',
    email: '',
    additional_stops: []
  });

  const [isCustomHours, setIsCustomHours] = useState(false);

  const [distanceData, setDistanceData] = useState(null);
  const [distanceError, setDistanceError] = useState('');
  const [leadTimeError, setLeadTimeError] = useState('');
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  const [vehiclesWithPrices, setVehiclesWithPrices] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isCalculatingPrices, setIsCalculatingPrices] = useState(false);

  // Fetch public config (including pricing visibility)
  const { data: publicConfig, isLoading: isLoadingPublicConfig } = useQuery({
    queryKey: ['publicConfig'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getPublicConfig');
      return response.data || {};
    },
    staleTime: 300000,
  });

  const canViewPricesWithoutLogin = publicConfig?.publicPricing?.enabled || false;

  // Fetch seasonal theme
  const { data: seasonalThemeData } = useQuery({
    queryKey: ['seasonalTheme'],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('getActiveSeasonalTheme');
        return response.data?.theme;
      } catch (e) {
        console.warn('Failed to fetch theme', e);
        return null;
      }
    },
    staleTime: 60 * 60 * 1000 // 1 hour
  });

  // Fetch airport keywords from AppConfig
  const { data: airportKeywordsConfig } = useQuery({
    queryKey: ['airportKeywords'],
    queryFn: async () => {
      const configs = await base44.entities.AppConfig.filter({ config_key: 'airport_keywords' });
      return configs.length > 0 ? configs[0].config_value : null;
    },
    staleTime: 300000, // 5 minutes
  });

  // Apply theme styles
  const themeStyle = useMemo(() => {
    if (!seasonalThemeData) return {};
    const { theme_data } = seasonalThemeData;
    if (!theme_data) return {};

    return {
      '--primary-color': theme_data.primary_color,
      '--secondary-color': theme_data.secondary_color,
      backgroundImage: theme_data.background_image_url ? `url(${theme_data.background_image_url})` : undefined,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
    };
  }, [seasonalThemeData]);

  const bgClass = isEmbedded
    ? "w-full bg-white"
    : (seasonalThemeData?.theme_data?.background_image_url 
      ? "min-h-screen p-3 md:p-4 pb-24 relative" 
      : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-3 md:p-4 pb-24");

  const { data: vehicleTypes = [], isLoading: isLoadingVehicleTypes, isError: isVehicleError, error: vehicleError, refetch: refetchVehicleTypes } = useQuery({
    queryKey: ['vehicleTypes'],
    queryFn: async () => {
      try {
        // Prefer filter for active vehicles directly
        const vehicles = await base44.entities.VehicleType.filter({ active: true });
        return Array.isArray(vehicles) ? vehicles.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) : [];
      } catch (error) {
        console.error("Error fetching vehicle types:", error);
        // Fallback to list if filter fails
        try {
          const allVehicles = await base44.entities.VehicleType.list();
          return Array.isArray(allVehicles) 
            ? allVehicles.filter(v => v.active !== false).sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            : [];
        } catch (retryError) {
          console.error("Retry failed:", retryError);
          throw error;
        }
      }
    },
    staleTime: 60000,
    retry: 2,
  });

  const minDate = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const minDateBasedOnLeadTime = useMemo(() => {
    if (vehicleTypes.length === 0) return minDate;

    const minDateTime = new Date();
    const minLeadTimeHours = Math.min(
      ...vehicleTypes.map(v => v.min_booking_lead_time_hours || 24)
    );

    minDateTime.setHours(minDateTime.getHours() + minLeadTimeHours);

    return format(minDateTime, 'yyyy-MM-dd');
  }, [vehicleTypes, minDate]);

  const clearBookingState = useCallback(() => {
    localStorage.removeItem(BOOKING_STATE_KEY);
  }, []);

  const saveBookingState = useCallback((requestingQuote) => {
    const state = {
      step,
      serviceType,
      formData,
      distanceData,
      selectedVehicleId: selectedVehicle?.id,
      driverLanguage,
      isCustomHours,
      timestamp: Date.now(),
      requestingQuote: requestingQuote || false
    };
    localStorage.setItem(BOOKING_STATE_KEY, JSON.stringify(state));
  }, [step, serviceType, formData, distanceData, selectedVehicle, driverLanguage, isCustomHours]);

  useEffect(() => {
    if (isInitializing || step === 0 || paymentCompleted || quoteRequested) {
      return;
    }

    const debounceTimer = setTimeout(() => {
      saveBookingState(false);
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [step, serviceType, formData, distanceData, selectedVehicle, driverLanguage, isInitializing, saveBookingState, isCustomHours, paymentCompleted, quoteRequested]);

  const calculatePricesForAllVehicles = useCallback(async (authenticatedUser, customFormData, customDistanceData, customServiceType, customDriverLanguage) => {
    // Allow calculation if user is authenticated OR if public pricing is enabled
    if (!authenticatedUser && !canViewPricesWithoutLogin) {
      return null;
    }

    setIsCalculatingPrices(true);

    const dataToUse = customFormData || formData;
    const distanceToUse = customDistanceData || distanceData;
    const serviceToUse = customServiceType || serviceType;
    const languageToUse = customDriverLanguage || driverLanguage;

    const priceCalculationPromises = vehicleTypes.map(async (vehicle) => {
      try {
        const priceResponse = await base44.functions.invoke('calculateTransferPrice', {
          service_type: serviceToUse,
          vehicle_type_id: vehicle.id,
          origin: dataToUse.origin,
          destination: dataToUse.destination,
          date: dataToUse.date,
          time: dataToUse.time,
          return_date: serviceToUse === 'round_trip' ? dataToUse.return_date : null,
          return_time: serviceToUse === 'round_trip' ? dataToUse.return_time : null,
          hours: serviceToUse === 'hourly' ? dataToUse.hours : null,
          driver_language: languageToUse
        });

        if (priceResponse.data && priceResponse.data.pricing) {
          return {
            ...vehicle,
            calculated_price: priceResponse.data.pricing.total_price,
            calculation_details: priceResponse.data.pricing.calculation_details
          };
        }
      } catch (error) {
        console.error(`Erro ao calcular preço para ${vehicle.name}:`, error);

        let errorDetails = 'Erro desconhecido';
        if (error.response?.data) {
          if (typeof error.response.data === 'object' && error.response.data.error) {
            errorDetails = error.response.data.error;
          } else if (typeof error.response.data === 'string') {
            errorDetails = error.response.data; // Sometimes generic 500s are strings
          } else {
            errorDetails = JSON.stringify(error.response.data);
          }
        } else if (error.message) {
          errorDetails = error.message;
        }

        return {
          ...vehicle,
          calculated_price: null,
          error_details: errorDetails
        };
      }

      return {
        ...vehicle,
        calculated_price: null
      };
    });

    const vehiclePrices = await Promise.all(priceCalculationPromises);

    vehiclePrices.sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return (a.calculated_price || 0) - (b.calculated_price || 0);
    });

    setVehiclesWithPrices(vehiclePrices);
    setIsCalculatingPrices(false);
    return vehiclePrices;
  }, [vehicleTypes, formData, distanceData, serviceType, driverLanguage]);

  // Função auxiliar para verificar se um endereço é aeroporto
  const isAirport = useCallback((address) => {
    if (!address) return false;
    const lowerAddress = address.toLowerCase();
    
    let keywords = [
      'aeroporto',
      'airport',
      'gru',
      'guarulhos',
      'cgh',
      'congonhas',
      'vcp',
      'viracopos',
      'galeão',
      'gig',
      'santos dumont',
      'sdu',
      'confins',
      'cnf'
    ];

    if (airportKeywordsConfig) {
      keywords = airportKeywordsConfig.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
    }

    return keywords.some(keyword => lowerAddress.includes(keyword));
  }, [airportKeywordsConfig]);

  const handleNewBooking = useCallback(() => {
    setStep(1);
    setServiceType('one_way');
    setFormData({
      origin: '',
      destination: '',
      date: '',
      time: '',
      return_date: '',
      return_time: '',
      hours: 5,
      origin_flight_number: '',
      destination_flight_number: '',
      return_origin_flight_number: '',
      return_destination_flight_number: '',
      phone: '',
      additional_stops: []
    });
    setIsCustomHours(false);
    setDistanceData(null);
    setVehiclesWithPrices([]);
    setSelectedVehicle(null);
    setPaymentCompleted(false);
    setBookingNumber(null);
    setQuoteRequested(false);
    setQuoteNumber(null);
    setDriverLanguage('pt');
    clearBookingState();
  }, [clearBookingState]);

  const handleRequestQuote = useCallback(async (vehicle, language) => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        throw new Error('Usuário não autenticado.');
      }

      const customerPhone = currentUser.phone_number || '';
      const notes = 'Cotação solicitada devido a viagem fora do raio de atuação.';

      const quotePayload = {
        service_type: serviceType,
        vehicle_type_id: vehicle.id,
        vehicle_type_name: vehicle.name,
        driver_language: language,
        origin: formData.origin,
        destination: formData.destination || formData.origin,
        date: formData.date,
        time: formData.time,
        return_date: serviceType === 'round_trip' ? formData.return_date : null,
        return_time: serviceType === 'round_trip' ? formData.return_time : null,
        hours: serviceType === 'hourly' ? formData.hours : null,
        distance_km: vehicle.calculation_details?.supplier_total_distance_km || distanceData?.distance_km || 0,
        duration_minutes: distanceData?.duration_minutes || 0,
        passengers: 1,
        customer_name: currentUser.full_name,
        customer_email: currentUser.email,
        customer_phone: customerPhone,
        notes: notes,
        reason: 'Fora do raio de atuação'
      };
      
      const response = await base44.functions.invoke('submitQuoteRequest', quotePayload);

      if (response.data.success) {
        setQuoteNumber(response.data.quote_request.quote_number);
        setQuoteRequested(true);
        clearBookingState();
      } else {
        throw new Error(response.data.message || 'Erro desconhecido ao solicitar cotação.');
      }
    } catch (error) {
      console.error('[NovaReserva] Erro ao solicitar cotação:', error);
      
      if (error.response?.status === 401) {
        const stateToSave = {
          step: 2,
          serviceType,
          formData,
          distanceData,
          selectedVehicleId: vehicle.id,
          driverLanguage: language,
          isCustomHours,
          timestamp: Date.now(),
          requestingQuote: true
        };
        localStorage.setItem(BOOKING_STATE_KEY, JSON.stringify(stateToSave));
        
        // Use absolute path to prevent recursive URLs if pathname is already dirty
        const targetUrl = window.location.origin + '/NovaReserva?from_booking=true';
        base44.auth.redirectToLogin(targetUrl);
      } else {
        alert('Erro ao solicitar cotação. Verifique o console para mais detalhes ou tente novamente.');
      }
    }
  }, [serviceType, formData, distanceData, isCustomHours, clearBookingState]);

  const handleDriverLanguageChange = useCallback(async (newLanguage) => {
    setDriverLanguage(newLanguage);
    
    if ((user || canViewPricesWithoutLogin) && (distanceData || serviceType === 'hourly')) {
      await calculatePricesForAllVehicles(user, formData, distanceData, serviceType, newLanguage);
    }
  }, [user, canViewPricesWithoutLogin, distanceData, formData, serviceType, calculatePricesForAllVehicles]);

  const loadBookingState = useCallback(async (currentUser) => {
    try {
      const savedState = localStorage.getItem(BOOKING_STATE_KEY);
      if (!savedState) {
        return false;
      }

      const state = JSON.parse(savedState);
      
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - state.timestamp > oneHour) {
        clearBookingState();
        return false;
      }

      // Ensure new flight number fields are initialized if not present in saved state
      const restoredFormData = {
        ...state.formData,
        origin_flight_number: state.formData.origin_flight_number || '',
        destination_flight_number: state.formData.destination_flight_number || '',
        return_origin_flight_number: state.formData.return_origin_flight_number || '',
        return_destination_flight_number: state.formData.return_destination_flight_number || '',
        phone: state.formData.phone || '',
        additional_stops: state.formData.additional_stops || []
      };
      
      setServiceType(state.serviceType);
      setFormData(restoredFormData);
      setDistanceData(state.distanceData);
      setDriverLanguage(state.driverLanguage);
      
      if (state.serviceType === 'hourly') {
        if (typeof state.isCustomHours !== 'undefined') {
          setIsCustomHours(state.isCustomHours);
        } else {
          setIsCustomHours(![5, 10].includes(state.formData.hours));
        }
      } else {
        setIsCustomHours(false);
      }

      const hasStep1Data = (state.distanceData || state.serviceType === 'hourly');
      
      if (!hasStep1Data) {
        setStep(1);
        return true;
      }

      let calculatedVehicles = [];
      
      if (currentUser) {
        calculatedVehicles = await calculatePricesForAllVehicles(
          currentUser,
          restoredFormData,
          state.distanceData,
          state.serviceType,
          state.driverLanguage
        );
      } else {
        // If public pricing is enabled, we should calculate prices even without user
        if (canViewPricesWithoutLogin) {
          console.log('[NovaReserva] Public pricing enabled, calculating prices for guest...');
          calculatedVehicles = await calculatePricesForAllVehicles(
            null, // No user
            restoredFormData,
            state.distanceData,
            state.serviceType,
            state.driverLanguage
          );
        } else {
          calculatedVehicles = vehicleTypes.map(v => ({
            ...v,
            calculated_price: null,
            calculation_details: null
          }));
          calculatedVehicles.sort((a, b) => a.display_order - b.display_order);
          setVehiclesWithPrices(calculatedVehicles);
        }
      }

      if (state.requestingQuote && currentUser && calculatedVehicles && calculatedVehicles.length > 0) {
        const vehicleForQuote = calculatedVehicles.find(v => v.id === state.selectedVehicleId);
        if (vehicleForQuote) {
          clearBookingState();
          await handleRequestQuote(vehicleForQuote, state.driverLanguage);
          return true;
        }
      }

      if (state.selectedVehicleId && calculatedVehicles && calculatedVehicles.length > 0) {
        const vehicle = calculatedVehicles.find(v => v.id === state.selectedVehicleId);
        if (vehicle) {
          setSelectedVehicle(vehicle);
          
          // CORREÇÃO: Verificar se o veículo está fora do raio de atuação
          // Se estiver fora do raio, sempre voltar para o passo 2 (seleção de veículos)
          // para exibir a opção de solicitar cotação, mesmo que o usuário esteja logado
          if (vehicle.calculation_details?.outside_operational_radius) {
            setStep(2);
            return true;
          }

          // Se o usuário está logado E o veículo está DENTRO do raio de atuação,
          // pode ir para o passo 3 (formulário de reserva)
          if (currentUser) {
            setStep(3);
            return true;
          }
        }
      }

      setStep(2);
      return true;

    } catch (error) {
      console.error('[NovaReserva] Erro ao carregar estado:', error);
      clearBookingState();
      return false;
    }
  }, [clearBookingState, calculatePricesForAllVehicles, vehicleTypes, handleRequestQuote]);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInitializing) {
        console.warn('[NovaReserva] Force finishing initialization due to timeout');
        setIsInitializing(false);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [isInitializing]);

  useEffect(() => {
    let isMounted = true;

    if (hasRestoredStateRef.current) {
      return;
    }

    // Wait for critical data, but don't block forever if empty
    if (isLoadingVehicleTypes || isLoadingPublicConfig) {
      return;
    }

    const initializeApp = async () => {
      console.log('[NovaReserva] Initializing app (rev). Public Pricing:', canViewPricesWithoutLogin);
      // Only set initializing true if it's not already (to avoid re-renders)
      // setIsInitializing(true); // Already true by default

      try {
        console.log('[NovaReserva] Starting initialization...');
        let currentUser = null;
        try {
          // Add timeout to auth check
          const authPromise = base44.auth.me();
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 5000));
          currentUser = await Promise.race([authPromise, timeoutPromise]);
          
          if (isMounted) setUser(currentUser);
        } catch (authError) {
          console.warn('[NovaReserva] Auth check failed or timed out:', authError);
          if (isMounted) setUser(null);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const fromBooking = urlParams.get('from_booking');
        const fromGuestSuccess = urlParams.get('from_guest_success');
        
        // Check for passed params from iframe redirect
        const paramOrigin = urlParams.get('origin');
        const urlReturnUrl = urlParams.get('returnUrl');
        
        if (isMounted && urlReturnUrl) {
          setReturnUrl(urlReturnUrl);
        }
        
        if (paramOrigin) {
           const paramFormData = {
             origin: urlParams.get('origin') || '',
             destination: urlParams.get('destination') || '',
             date: urlParams.get('date') || '',
             time: urlParams.get('time') || '',
             return_date: urlParams.get('return_date') || '',
             return_time: urlParams.get('return_time') || '',
             hours: urlParams.get('hours') ? parseInt(urlParams.get('hours')) : 5,
             origin_flight_number: urlParams.get('origin_flight_number') || '',
             destination_flight_number: urlParams.get('destination_flight_number') || '',
             return_origin_flight_number: urlParams.get('return_origin_flight_number') || '',
             return_destination_flight_number: urlParams.get('return_destination_flight_number') || '',
             phone: urlParams.get('phone') || '',
             email: urlParams.get('email') || ''
           };
           const paramServiceType = urlParams.get('service_type') || 'one_way';
           
           if (isMounted) {
             setFormData(prev => ({ ...prev, ...paramFormData }));
             setServiceType(paramServiceType);
             if (paramServiceType === 'hourly') {
                setIsCustomHours(![5, 10].includes(paramFormData.hours));
             }
           }
        }

        const updateUrl = () => {
          if (urlReturnUrl) {
            const newUrl = new URL(window.location.href);
            newUrl.search = `?returnUrl=${encodeURIComponent(urlReturnUrl)}`;
            window.history.replaceState({}, '', newUrl.toString());
          } else {
            window.history.replaceState({}, '', window.location.pathname);
          }
        };

        if (fromGuestSuccess === 'true') {
          // Clear local storage state after successful guest booking
          clearBookingState();
          updateUrl();
          if (isMounted) {
             setFormData(prev => ({
                ...prev,
                origin: '',
                destination: '',
                date: '',
                time: '',
                return_date: '',
                return_time: '',
                phone: '',
                email: '',
                additional_stops: []
             }));
             setIsInitializing(false);
          }
          return;
        }

        if (fromBooking === 'true' && !paramOrigin) {
          updateUrl();
          await loadBookingState(currentUser);
        } else {
          // Clear URL params if we processed them
          if (paramOrigin) {
             updateUrl();
          }
          
          if (serviceType === 'hourly' && !localStorage.getItem(BOOKING_STATE_KEY) && !paramOrigin) {
            if (isMounted) {
              setFormData(prev => ({ ...prev, hours: 5 }));
              setIsCustomHours(false);
            }
          }
        }

        hasRestoredStateRef.current = true;

      } catch (error) {
        console.error('[NovaReserva] Error during initialization:', error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
          console.log('[NovaReserva] Initialization finished.');
        }
      }
    };

    initializeApp();
    
    return () => { isMounted = false; };
  }, [isLoadingVehicleTypes, isLoadingPublicConfig, vehicleTypes, loadBookingState, serviceType]);

  useEffect(() => {
    if (serviceType === 'hourly') {
      setFormData(prev => ({ ...prev, hours: 5 }));
      setIsCustomHours(false);
    } else {
      setIsCustomHours(false);
    }
  }, [serviceType]);

  const validateStep1 = useCallback(() => {
    setDistanceError('');
    setLeadTimeError('');

    if (!user && (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))) {
      setDistanceError('Por favor, informe um e-mail válido (obrigatório para visitantes).');
      return false;
    }

    if (!formData.phone || formData.phone.trim().length < 10) {
      setDistanceError('Por favor, informe seu telefone com DDD (obrigatório para prosseguir)');
      return false;
    }

    if (serviceType !== 'hourly' && (!formData.origin || !formData.destination)) {
      setDistanceError('Por favor, preencha origem e destino');
      return false;
    }
    
    if (serviceType === 'hourly' && !formData.origin) {
      setDistanceError('Por favor, preencha o ponto de partida');
      return false;
    }

    if (!formData.date || !formData.time) {
      setDistanceError('Por favor, preencha data e horário');
      return false;
    }

    if (serviceType === 'round_trip') {
      if (!formData.return_date || !formData.return_time) {
        setDistanceError('Por favor, preencha data e horário do retorno');
        return false;
      }
    }

    if (serviceType === 'hourly') {
      const hours = formData.hours;
      if (hours === '' || hours === null || hours === undefined || parseFloat(hours) < 5) {
        setDistanceError('Por favor, informe a quantidade de horas (mínimo 5 horas)');
        return false;
      }
      if (!formData.additional_stops || formData.additional_stops.length === 0) {
        setDistanceError('Para viagens por hora, adicione pelo menos uma parada entre origem e destino final.');
        return false;
      }
      if (!formData.destination) {
        setDistanceError('Por favor, preencha o destino final');
        return false;
      }
    }

    const now = new Date();
    const bookingDateTime = new Date(`${formData.date}T${formData.time}`);
    
    if (isNaN(bookingDateTime.getTime())) {
      setDistanceError('Data ou hora inválida.');
      return false;
    }

    if (bookingDateTime.getTime() < now.getTime()) {
      setDistanceError('A data e hora da reserva não podem ser no passado.');
      return false;
    }

    return true;
  }, [formData, serviceType]);

  const handleCalculateAndContinue = async () => {
    if (!validateStep1()) {
      return;
    }

    setDistanceError('');
    setIsCalculatingDistance(true);

    // Check if running in iframe and redirect to standalone IMMEDIATELY (to preserve user gesture)
    // We skip saving the lead here; it will be saved when the user clicks 'Next' on the standalone page.
    const isIframe = window.self !== window.top;
    if (isIframe) {
      const params = new URLSearchParams();
      params.set('origin', formData.origin);
      params.set('destination', formData.destination);
      params.set('date', formData.date);
      params.set('time', formData.time);
      params.set('service_type', serviceType);
      params.set('phone', formData.phone);
      params.set('email', formData.email);
      
      if (formData.return_date) params.set('return_date', formData.return_date);
      if (formData.return_time) params.set('return_time', formData.return_time);
      if (formData.hours) params.set('hours', formData.hours);
      if (formData.origin_flight_number) params.set('origin_flight_number', formData.origin_flight_number);
      if (formData.destination_flight_number) params.set('destination_flight_number', formData.destination_flight_number);
      if (formData.return_origin_flight_number) params.set('return_origin_flight_number', formData.return_origin_flight_number);
      if (formData.return_destination_flight_number) params.set('return_destination_flight_number', formData.return_destination_flight_number);
      
      // Pass return URL (default to main site if not present)
      const currentUrlParams = new URLSearchParams(window.location.search);
      const returnUrl = currentUrlParams.get('returnUrl') || 'https://www.transferonline.com.br';
      params.set('returnUrl', returnUrl);

      const standaloneUrl = `${window.location.origin}/NovaReserva?${params.toString()}`;
      
      try {
        window.top.location.href = standaloneUrl;
      } catch (e) {
        window.open(standaloneUrl, '_top');
      }
      return;
    }

    // Salvar lead de cotação antes de continuar (apenas se não for redirect)
    try {
      const leadResult = await base44.functions.invoke('saveBookingLead', {
        phone: formData.phone,
        email: formData.email,
        service_type: serviceType,
        origin: formData.origin,
        destination: formData.destination || formData.origin,
        date: formData.date,
        time: formData.time,
        hours: serviceType === 'hourly' ? formData.hours : null,
        driver_language: driverLanguage,
        origin_flight_number: formData.origin_flight_number,
        destination_flight_number: formData.destination_flight_number,
        return_origin_flight_number: formData.return_origin_flight_number,
        return_destination_flight_number: formData.return_destination_flight_number
      });
      console.log('[NovaReserva] Lead salvo:', leadResult);
      if (leadResult?.data?.success && leadResult?.data?.lead_id) {
        setBookingLeadId(leadResult.data.lead_id);
      }
    } catch (leadError) {
      console.error('[NovaReserva] Erro ao salvar lead:', leadError);
    }

    let calculatedDistance = null;

    if (serviceType !== 'hourly') {
      try {
        if (!formData.origin || !formData.destination) {
          throw new Error('Origem e destino são obrigatórios');
        }

        const distanceResponse = await base44.functions.invoke('calculateDistance', {
          origin: formData.origin,
          destination: formData.destination
        });

        if (distanceResponse.data && distanceResponse.data.distance_km) {
          calculatedDistance = distanceResponse.data;
        } else {
          throw new Error('Resposta inválida da API de cálculo de distância');
        }
      } catch (error) {
        console.error('[NovaReserva] Erro ao calcular distância:', error);
        
        let errorMessage = 'Não foi possível calcular a rota entre origem e destino.';
        
        if (error.response?.status === 404) {
          errorMessage = 'Rota não encontrada. Verifique se os endereços estão corretos e tente novamente.';
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        if (errorMessage === 'Network Error') {
          errorMessage = 'Erro de conexão. Por favor, tente novamente.';
        }

        setDistanceError(errorMessage);
        setIsCalculatingDistance(false);
        return;
      }
    } else {
      calculatedDistance = null;
    }

    setDistanceData(calculatedDistance);
    setIsCalculatingDistance(false);

    const vehiclesWithoutPrices = vehicleTypes.map(v => ({
      ...v,
      calculated_price: null,
      calculation_details: null
    }));
    
    vehiclesWithoutPrices.sort((a, b) => a.display_order - b.display_order);
    setVehiclesWithPrices(vehiclesWithoutPrices);

    setStep(2);
    
    if (user || canViewPricesWithoutLogin) {
      await calculatePricesForAllVehicles(user, formData, calculatedDistance, serviceType, driverLanguage);
    }
  };

  const handleVehicleSelect = async (vehicle, language) => {
    setLeadTimeError('');

    // Guest checkout flow enabled - allow proceeding without login if public pricing is active
    if (!user && canViewPricesWithoutLogin && vehicle !== null) {
        // Proceed to step 3 (Guest Booking Form)
        // Don't redirect to login here
    }

    if (vehicle === null) {
      const stateToSave = {
        step: 2,
        serviceType,
        formData,
        distanceData,
        selectedVehicleId: null,
        driverLanguage: language || driverLanguage,
        isCustomHours,
        timestamp: Date.now()
      };
      localStorage.setItem(BOOKING_STATE_KEY, JSON.stringify(stateToSave));
      
      const currentUrl = window.location.pathname + '?from_booking=true';
      base44.auth.redirectToLogin(currentUrl);
      return;
    }

    const now = new Date();
    const bookingDateTime = new Date(`${formData.date}T${formData.time}`);
    
    if (isNaN(bookingDateTime.getTime())) {
      setLeadTimeError('Data ou hora da reserva inválida. Por favor, revise.');
      return;
    }

    const diffMs = bookingDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    const vehicleLeadTime = vehicle.min_booking_lead_time_hours || 0;
    
    if (diffHours < vehicleLeadTime) {
      setLeadTimeError(`Este veículo requer um mínimo de ${vehicleLeadTime} horas de antecedência. Por favor, volte e selecione uma data/hora posterior ou escolha outro veículo.`);
      return;
    }

    let currentUser = user;
    if (!currentUser) {
      try {
        currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        // Stay as guest
      }
    }

    try {
      setDriverLanguage(language);

      let currentVehiclesWithPrices = vehiclesWithPrices;
      if (!currentVehiclesWithPrices[0]?.calculated_price || driverLanguage !== language) {
        currentVehiclesWithPrices = await calculatePricesForAllVehicles(currentUser, null, null, null, language);
      }

      const selectedVehicleWithPrice = currentVehiclesWithPrices.find(v => v.id === vehicle.id);
      const finalSelectedVehicle = selectedVehicleWithPrice || vehicle;
      setSelectedVehicle(finalSelectedVehicle);

      // Update lead with vehicle selection
      if (bookingLeadId) {
        base44.functions.invoke('updateBookingLead', {
          lead_id: bookingLeadId,
          vehicle_type_id: finalSelectedVehicle.id,
          vehicle_type_name: finalSelectedVehicle.name,
          calculated_price: finalSelectedVehicle.calculated_price,
          distance_km: distanceData?.distance_km,
          duration_minutes: distanceData?.duration_minutes,
          status: 'booking_started'
        }).catch(err => console.error('[NovaReserva] Erro ao atualizar lead:', err));
      }

      if (currentUser || canViewPricesWithoutLogin) {
        setStep(3);
        saveBookingState(false);
      } else {
         throw new Error('Login required');
      }
    } catch (error) {
      if (error.message === 'Login required' || error.response?.status === 401) {
        setDriverLanguage(language);

        const stateToSave = {
          step: 2,
          serviceType,
          formData,
          distanceData,
          selectedVehicleId: vehicle?.id,
          driverLanguage: language,
          isCustomHours,
          timestamp: Date.now() 
        };
        localStorage.setItem(BOOKING_STATE_KEY, JSON.stringify(stateToSave));

        // Use absolute path to prevent recursive URLs
        const targetUrl = window.location.origin + '/NovaReserva?from_booking=true';
        base44.auth.redirectToLogin(targetUrl);
      } else {
        console.error("Erro ao selecionar veículo:", error);
        toast.error("Ocorreu um erro ao processar sua seleção. Por favor, tente novamente.");
      }
    }
  };

  const handlePaymentCompleted = useCallback((bookingId) => {
    setBookingNumber(bookingId);
    setPaymentCompleted(true);
    clearBookingState();
  }, [clearBookingState]);

  useEffect(() => {
    if (paymentCompleted) {
      const timer = setTimeout(handleNewBooking, 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentCompleted, handleNewBooking]);

  useEffect(() => {
    if (quoteRequested) {
      const timer = setTimeout(handleNewBooking, 5000);
      return () => clearTimeout(timer);
    }
  }, [quoteRequested, handleNewBooking]);

  const getSelectedHoursOption = useMemo(() => {
    if (isCustomHours) {
      return 'custom';
    }
    if (formData.hours === 5 || formData.hours === 10) {
      return String(formData.hours);
    }
    return 'custom';
  }, [formData.hours, isCustomHours]);

  const isAdmin = user?.role === 'admin';

  const userMenuItems = user ? [
    {
      title: 'Minhas Viagens',
      url: createPageUrl('MinhasViagens'),
      icon: Package,
    },
    ...(user.event_access_active ? [{
      title: 'Meus Eventos',
      url: createPageUrl('GerenciarEventos'),
      icon: Calendar,
    }] : []),
    {
      title: 'Meus Dados',
      url: createPageUrl('MeusDados'),
      icon: User,
    }
  ] : [];

  const originIsAirport = useMemo(() => originLocationType === 'airport' || isAirport(formData.origin), [formData.origin, originLocationType, isAirport]);
  const destinationIsAirport = useMemo(() => destinationLocationType === 'airport' || isAirport(formData.destination), [formData.destination, destinationLocationType, isAirport]);
  const returnOriginIsAirport = useMemo(() => serviceType === 'round_trip' && (destinationLocationType === 'airport' || isAirport(formData.destination)), [serviceType, formData.destination, destinationLocationType, isAirport]); 
  const returnDestinationIsAirport = useMemo(() => serviceType === 'round_trip' && (originLocationType === 'airport' || isAirport(formData.origin)), [serviceType, formData.origin, originLocationType, isAirport]);


  if (isVehicleError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
        <div className="text-center max-w-md bg-white p-6 rounded-xl shadow-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar veículos</h2>
          <p className="text-gray-600 mb-6">
            Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.
            <br />
            <span className="text-xs text-red-400 mt-2 block">{vehicleError?.message || 'Erro desconhecido'}</span>
          </p>
          <Button onClick={() => refetchVehicleTypes()} className="bg-blue-600 hover:bg-blue-700 w-full">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (quoteRequested) {
    return (
      <div className="flex items-center justify-center p-4 min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Cotação Solicitada!
          </h2>
          <p className="text-gray-600 text-base mb-2">
            Sua solicitação foi enviada com sucesso.
          </p>
          {quoteNumber && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-orange-700 mb-1">Número da Cotação:</p>
              <p className="text-2xl font-bold text-orange-600">
                {quoteNumber}
              </p>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-blue-900">
              <strong>📧 Próximos Passos:</strong>
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
              <li>Você receberá um e-mail de confirmação</li>
              <li>Nossa equipe analisará sua solicitação</li>
              <li>Enviaremos a cotação em breve via e-mail e WhatsApp</li>
            </ul>
          </div>
          <Button
            onClick={handleNewBooking}
            className="bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 text-white w-full py-5 text-base font-bold rounded-xl shadow-lg"
          >
            Fazer Nova Reserva
          </Button>
        </div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="flex items-center justify-center p-4 min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Pagamento Confirmado!
          </h2>
          <p className="text-gray-600 text-base mb-6">
            Sua reserva foi confirmada.
            {bookingNumber && (
              <>
                <br />
                <span className="font-bold text-xl text-green-600 block mt-2">
                  #{bookingNumber}
                </span>
              </>
            )}
          </p>
          {returnUrl ? (
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = returnUrl}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white w-full py-5 text-base font-bold rounded-xl shadow-lg"
              >
                Voltar para o Site
              </Button>
              <Button
                onClick={handleNewBooking}
                variant="outline"
                className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Fazer Nova Reserva
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleNewBooking}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white w-full py-5 text-base font-bold rounded-xl shadow-lg"
            >
              Fazer Nova Reserva
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={bgClass} style={themeStyle}>
      {!isEmbedded && <MetaTags 
        title="Nova Reserva | TransferOnline" 
        description="Agende seu transfer executivo com segurança e conforto." 
      />}
      {/* Overlay for background image readability */}
      {seasonalThemeData?.theme_data?.background_image_url && (
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: seasonalThemeData.theme_data.background_overlay_color || 'rgba(255,255,255,0.9)' }}></div>
      )}

      <div className="max-w-2xl mx-auto relative z-10">
        
        {/* Seasonal Welcome Banner */}
        {!isEmbedded && seasonalThemeData?.theme_data?.welcome_title && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-4 mb-4 border-l-4 text-center" style={{ borderLeftColor: seasonalThemeData.theme_data.primary_color }}>
             <h2 className="text-xl font-bold" style={{ color: seasonalThemeData.theme_data.primary_color }}>
               {seasonalThemeData.theme_data.decoration_icon === 'snowflake' && '❄️ '}
               {seasonalThemeData.theme_data.decoration_icon === 'tree' && '🎄 '}
               {seasonalThemeData.theme_data.decoration_icon === 'star' && '✨ '}
               {seasonalThemeData.theme_data.decoration_icon === 'gift' && '🎁 '}
               {seasonalThemeData.theme_data.welcome_title}
             </h2>
             {seasonalThemeData.theme_data.welcome_message && (
               <p className="text-gray-600 text-sm mt-1">{seasonalThemeData.theme_data.welcome_message}</p>
             )}
          </div>
        )}

        {/* Header com Nome do Usuário e Menu / Botão de Login */}
        {!isEmbedded && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex items-center justify-between">
            {user ? (
              /* Usuário logado - mostra nome e menu */
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Olá,</p>
                    <p className="font-bold text-gray-900">{user.full_name}</p>
                  </div>
                  <Suspense fallback={null}>
                    <WhatsAppButton variant="sidebar" showText={false} className="text-green-600 p-2" />
                  </Suspense>
                </div>

                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] p-0">
                    <div className="flex flex-col h-full">
                      <div className="p-6 border-b bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-blue-100">Olá,</p>
                            <p className="font-bold text-lg">
                              {user ? user.full_name : 'Visitante'}
                            </p>
                            {user?.email && (
                              <p className="text-xs text-blue-100 truncate">{user.email}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4">
                        <nav className="space-y-2">
                          {userMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.title}
                                to={item.url}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Icon className="w-5 h-5" />
                                <span>{item.title}</span>
                              </Link>
                            );
                          })}
                        </nav>
                      </div>

                      <div className="border-t p-4">
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            base44.auth.logout();
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair
                        </button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              /* Usuário não logado - mostra botão de login proeminente */
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Minha Conta</p>
                    <p className="text-xs text-gray-500">Entrar ou Cadastrar</p>
                  </div>
                  <Suspense fallback={null}>
                    <WhatsAppButton variant="sidebar" showText={false} className="text-green-600 bg-green-50 p-2 rounded-full" pulsing={true} iconSize="w-6 h-6" />
                  </Suspense>
                </div>

                <Button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 h-auto rounded-lg shadow-md font-semibold"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
        )}

        {step === 1 && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-5">
              <Tabs value={serviceType} onValueChange={setServiceType} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-3 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger value="one_way" className="text-xs md:text-sm font-semibold rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">
                    Só Ida
                  </TabsTrigger>
                  <TabsTrigger value="round_trip" className="text-xs md:text-sm font-semibold rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">
                    Ida e Volta
                  </TabsTrigger>
                  <TabsTrigger value="hourly" className="text-xs md:text-sm font-semibold rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">
                    Por Hora
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="one_way" className="space-y-3 mt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="origin" className="text-xs font-bold text-gray-900">
                      De onde você sai? <span className="text-red-500">*</span>
                    </Label>
                    <Suspense fallback={<ComponentLoader />}>
                      <LocationAutocomplete
                        id="origin"
                        required
                        value={formData.origin}
                        onChange={(value) => startTransition(() => setFormData({...formData, origin: value}))}
                        onLocationSelect={(loc) => startTransition(() => setOriginLocationType(loc?.type || null))}
                        placeholder="Digite o endereço de origem"
                        className="text-sm h-10 rounded-lg bg-gray-50"
                      />
                    </Suspense>
                  </div>

                  {originIsAirport && (
                    <div className="space-y-1.5 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <Label htmlFor="origin_flight_number" className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                        <PlaneIcon className="w-3.5 h-3.5 text-blue-600" />
                        Número do Voo / Companhia
                      </Label>
                      <Input
                        id="origin_flight_number"
                        value={formData.origin_flight_number}
                        onChange={(e) => setFormData({...formData, origin_flight_number: e.target.value})}
                        placeholder="Ex: LA 3000, GOL 1234"
                        className="text-sm h-10 rounded-lg bg-white"
                      />
                      <p className="text-xs text-blue-700">
                        ℹ️ Para rastreamento de chegada do passageiro
                      </p>
                      {user?.client_id && (
                        <Suspense fallback={<ComponentLoader />}>
                          <FlightStatusChecker 
                            flightNumber={formData.origin_flight_number} 
                            date={formData.date}
                            expectedOrigin={formData.origin}
                            checkType="arrival"
                            className="mt-2"
                          />
                        </Suspense>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="destination" className="text-xs font-bold text-gray-900">
                      Para onde você vai? <span className="text-red-500">*</span>
                    </Label>
                    <Suspense fallback={<ComponentLoader />}>
                      <LocationAutocomplete
                        id="destination"
                        required
                        value={formData.destination}
                        onChange={(value) => startTransition(() => setFormData({...formData, destination: value}))}
                        onLocationSelect={(loc) => startTransition(() => setDestinationLocationType(loc?.type || null))}
                        placeholder="Digite o endereço de destino"
                        className="text-sm h-10 rounded-lg bg-gray-50"
                      />
                    </Suspense>
                  </div>

                  {destinationIsAirport && (
                    <div className="space-y-1.5 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <Label htmlFor="destination_flight_number" className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                        <PlaneIcon className="w-3.5 h-3.5 text-blue-600" />
                        Número do Voo / Companhia
                      </Label>
                      <Input
                        id="destination_flight_number"
                        value={formData.destination_flight_number}
                        onChange={(e) => setFormData({...formData, destination_flight_number: e.target.value})}
                        placeholder="Ex: LA 3000, GOL 1234"
                        className="text-sm h-10 rounded-lg bg-white"
                      />
                      <p className="text-xs text-blue-700">
                        ℹ️ Para rastreamento de partida do passageiro
                      </p>
                      {user?.client_id && (
                        <Suspense fallback={<ComponentLoader />}>
                          <FlightStatusChecker 
                            flightNumber={formData.destination_flight_number} 
                            date={formData.date}
                            expectedDestination={formData.destination}
                            checkType="departure"
                            className="mt-2"
                          />
                        </Suspense>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Data <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      min={minDateBasedOnLeadTime}
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full text-xs md:text-sm h-9 md:h-10 rounded-lg bg-gray-50 border-0 [&::-webkit-date-and-time-value]:text-xs md:[&::-webkit-date-and-time-value]:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="time" className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Horário <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full text-xs md:text-sm h-9 md:h-10 rounded-lg bg-gray-50 border-0 [&::-webkit-date-and-time-value]:text-xs md:[&::-webkit-date-and-time-value]:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-gray-900">
                      E-mail <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="seu@email.com"
                      className="text-sm h-10 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div className="space-y-1.5 bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                    <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      WhatsApp / Telefone <span className="text-red-500">*</span>
                    </Label>
                    <Suspense fallback={<ComponentLoader />}>
                      <PhoneInputWithCountry
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={(value) => setFormData({...formData, phone: value})}
                        placeholder="(00) 00000-0000"
                        className=""
                      />
                    </Suspense>
                    <p className="text-xs text-blue-700">
                      📱 Inclua o código do País
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="round_trip" className="space-y-3 mt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="origin-rt" className="text-xs font-bold text-gray-900">
                      De onde você sai? <span className="text-red-500">*</span>
                    </Label>
                    <Suspense fallback={<ComponentLoader />}>
                      <LocationAutocomplete
                        id="origin-rt"
                        required
                        value={formData.origin}
                        onChange={(value) => startTransition(() => setFormData({...formData, origin: value}))}
                        onLocationSelect={(loc) => startTransition(() => setOriginLocationType(loc?.type || null))}
                        placeholder="Digite o endereço de origem"
                        className="text-sm h-10 rounded-lg bg-gray-50"
                      />
                    </Suspense>
                  </div>

                  {originIsAirport && (
                    <div className="space-y-1.5 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <Label htmlFor="origin_flight_number_rt" className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                        <PlaneIcon className="w-3.5 h-3.5 text-blue-600" />
                        Número do Voo / Companhia (Ida)
                      </Label>
                      <Input
                        id="origin_flight_number_rt"
                        value={formData.origin_flight_number}
                        onChange={(e) => setFormData({...formData, origin_flight_number: e.target.value})}
                        placeholder="Ex: LA 3000, GOL 1234"
                        className="text-sm h-10 rounded-lg bg-white"
                      />
                      {user?.client_id && (
                        <Suspense fallback={<ComponentLoader />}>
                          <FlightStatusChecker 
                            flightNumber={formData.origin_flight_number} 
                            date={formData.date}
                            expectedOrigin={formData.origin}
                            checkType="arrival"
                            className="mt-2"
                          />
                        </Suspense>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="destination-rt" className="text-xs font-bold text-gray-900">
                      Para onde você vai? <span className="text-red-500">*</span>
                    </Label>
                    <Suspense fallback={<ComponentLoader />}>
                      <LocationAutocomplete
                        id="destination-rt"
                        required
                        value={formData.destination}
                        onChange={(value) => startTransition(() => setFormData({...formData, destination: value}))}
                        onLocationSelect={(loc) => startTransition(() => setDestinationLocationType(loc?.type || null))}
                        placeholder="Digite o endereço de destino"
                        className="text-sm h-10 rounded-lg bg-gray-50"
                      />
                    </Suspense>
                  </div>

                  {destinationIsAirport && (
                    <div className="space-y-1.5 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <Label htmlFor="destination_flight_number_rt" className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                        <PlaneIcon className="w-3.5 h-3.5 text-blue-600" />
                        Número do Voo / Companhia (Ida)
                      </Label>
                      <Input
                        id="destination_flight_number_rt"
                        value={formData.destination_flight_number}
                        onChange={(e) => setFormData({...formData, destination_flight_number: e.target.value})}
                        placeholder="Ex: LA 3000, GOL 1234"
                        className="text-sm h-10 rounded-lg bg-white"
                      />
                      {user?.client_id && (
                        <Suspense fallback={<ComponentLoader />}>
                          <FlightStatusChecker 
                            flightNumber={formData.destination_flight_number} 
                            date={formData.date}
                            expectedDestination={formData.destination}
                            checkType="departure"
                            className="mt-2"
                          />
                        </Suspense>
                      )}
                    </div>
                  )}

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200/50">
                    <h3 className="font-bold text-xs mb-2 text-blue-900">Ida</h3>
                    <div className="space-y-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="date-rt" className="flex items-center gap-1 text-xs font-bold text-gray-900">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          Data <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="date-rt"
                          type="date"
                          required
                          min={formData.date || minDateBasedOnLeadTime}
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full text-xs md:text-sm h-8 md:h-9 rounded-lg bg-white border-0 [&::-webkit-date-and-time-value]:text-xs md:[&::-webkit-date-and-time-value]:text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="time-rt" className="flex items-center gap-1 text-xs font-bold text-gray-900">
                          <Clock className="w-3 h-3 text-blue-600" />
                          Horário <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="time-rt"
                          type="time"
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                          className="w-full text-xs md:text-sm h-8 md:h-9 rounded-lg bg-white border-0 [&::-webkit-date-and-time-value]:text-xs md:[&::-webkit-date-and-time-value]:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg border border-green-200/50">
                    <h3 className="font-bold text-xs mb-2 text-green-900">Volta</h3>
                    <div className="space-y-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="return-date" className="flex items-center gap-1 text-xs font-bold text-gray-900">
                          <Calendar className="w-3 h-3 text-green-600" />
                          Data <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="return-date"
                          type="date"
                          required
                          min={formData.date || minDateBasedOnLeadTime}
                          value={formData.return_date}
                          onChange={(e) => setFormData({...formData, return_date: e.target.value})}
                          className="w-full text-xs md:text-sm h-8 md:h-9 rounded-lg bg-white border-0 [&::-webkit-date-and-time-value]:text-xs md:[&::-webkit-date-and-time-value]:text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="return-time" className="flex items-center gap-1 text-xs font-bold text-green-900">
                          <Clock className="w-3 h-3 text-green-600" />
                          Horário <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="return-time"
                          type="time"
                          required
                          value={formData.return_time}
                          onChange={(e) => setFormData({...formData, return_time: e.target.value})}
                          className="w-full text-xs md:text-sm h-8 md:h-9 rounded-lg bg-white border-0 [&::-webkit-date-and-time-value]:text-xs md:[&::-webkit-date-and-time-value]:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {returnOriginIsAirport && (
                    <div className="space-y-1.5 bg-green-50 border border-green-200 rounded-lg p-3">
                      <Label htmlFor="return_origin_flight_number" className="flex items-center gap-1.5 text-xs font-bold text-green-900">
                        <PlaneIcon className="w-3.5 h-3.5 text-green-600" />
                        Número do Voo / Companhia (Volta - Origem) *
                      </Label>
                      <Input
                        id="return_origin_flight_number"
                        value={formData.return_origin_flight_number}
                        onChange={(e) => setFormData({...formData, return_origin_flight_number: e.target.value})}
                        placeholder="Ex: LA 3001, GOL 1235"
                        className="text-sm h-10 rounded-lg bg-white"
                      />
                      {user?.client_id && (
                        <Suspense fallback={<ComponentLoader />}>
                          <FlightStatusChecker 
                            flightNumber={formData.return_origin_flight_number} 
                            date={formData.return_date}
                            expectedOrigin={formData.destination} // Retorno origem = destino da ida
                            checkType="arrival"
                            className="mt-2"
                          />
                        </Suspense>
                      )}
                    </div>
                  )}

                  {returnDestinationIsAirport && (
                   <div className="space-y-1.5 bg-green-50 border border-green-200 rounded-lg p-3">
                     <Label htmlFor="return_destination_flight_number" className="flex items-center gap-1.5 text-xs font-bold text-green-900">
                       <PlaneIcon className="w-3.5 h-3.5 text-green-600" />
                       Número do Voo / Companhia (Volta - Destino) *
                     </Label>
                     <Input
                       id="return_destination_flight_number"
                       value={formData.return_destination_flight_number}
                       onChange={(e) => setFormData({...formData, return_destination_flight_number: e.target.value})}
                       placeholder="Ex: LA 3001, GOL 1235"
                       className="text-sm h-10 rounded-lg bg-white"
                     />
                     {user?.client_id && (
                       <Suspense fallback={<ComponentLoader />}>
                         <FlightStatusChecker 
                           flightNumber={formData.return_destination_flight_number} 
                           date={formData.return_date}
                           expectedDestination={formData.origin} // Retorno destino = origem da ida
                           checkType="departure"
                           className="mt-2"
                         />
                       </Suspense>
                     )}
                   </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="email-rt" className="text-xs font-bold text-gray-900">
                      E-mail <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email-rt"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="seu@email.com"
                      className="text-sm h-10 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div className="space-y-1.5 bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                    <Label htmlFor="phone-rt" className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      WhatsApp / Telefone <span className="text-red-500">*</span>
                    </Label>
                    <Suspense fallback={<ComponentLoader />}>
                      <PhoneInputWithCountry
                        id="phone-rt"
                        required
                        value={formData.phone}
                        onChange={(value) => setFormData({...formData, phone: value})}
                        placeholder="(00) 00000-0000"
                        className=""
                      />
                    </Suspense>
                    <p className="text-xs text-blue-700">
                      📱 Inclua o código do País
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="hourly" className="space-y-3 mt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="hours-select" className="text-xs font-bold text-gray-900">
                      Pacote de Horas <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={getSelectedHoursOption}
                      onValueChange={(value) => {
                        if (value === 'custom') {
                          setIsCustomHours(true);
                          setFormData(prev => ({ ...prev, hours: '' }));
                        } else {
                          setIsCustomHours(false);
                          setFormData(prev => ({ ...prev, hours: parseInt(value) }));
                        }
                      }}
                    >
                      <SelectTrigger id="hours-select" className="w-full text-sm h-10 rounded-lg bg-gray-50 border-0">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Horas</SelectItem>
                        <SelectItem value="10">10 Horas</SelectItem>
                        <SelectItem value="custom">Outras (mín. 5h)</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {isCustomHours && (
                      <Input
                        id="hours"
                        type="number"
                        min="5"
                        required
                        value={formData.hours}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({ 
                            ...prev, 
                            hours: value === '' ? '' : parseInt(value) || ''
                          }));
                        }}
                        placeholder="Quantidade de horas (mín. 5)"
                        className="text-sm h-10 rounded-lg bg-gray-50 border-0"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="origin-hourly" className="text-xs font-bold text-gray-900">
                      Ponto de Partida <span className="text-red-500">*</span>
                    </Label>
                    <Suspense fallback={<ComponentLoader />}>
                      <LocationAutocomplete
                        id="origin-hourly"
                        required
                        value={formData.origin}
                        onChange={(value) => startTransition(() => setFormData({...formData, origin: value}))}
                        onLocationSelect={(loc) => startTransition(() => setOriginLocationType(loc?.type || null))}
                        placeholder="Digite o endereço inicial"
                        className="text-sm h-10 rounded-lg bg-gray-50"
                      />
                    </Suspense>
                  </div>

                  {originIsAirport && (
                    <div className="space-y-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <Label htmlFor="origin_flight_number_hourly" className="flex items-center gap-2 text-sm font-bold text-blue-900">
                          <PlaneIcon className="w-4 h-4 text-blue-600" />
                          Número do Voo / Companhia (Origem) *
                        </Label>
                        <Suspense fallback={<ComponentLoader />}>
                          <FlightStatusChecker 
                            flightNumber={formData.origin_flight_number} 
                            date={formData.date}
                            expectedOrigin={formData.origin}
                            checkType="arrival"
                          />
                        </Suspense>
                      </div>
                      <Input
                        id="origin_flight_number_hourly"
                        value={formData.origin_flight_number}
                        onChange={(e) => setFormData({...formData, origin_flight_number: e.target.value})}
                        placeholder="Ex: LA 3000, GOL 1234"
                        className="bg-white"
                      />
                      <p className="text-xs text-blue-700">
                        ℹ️ Para rastreamento de chegada do passageiro
                      </p>
                    </div>
                  )}

                  {/* Paradas Adicionais (Obrigatório pelo menos 1) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-gray-900">
                        Paradas Adicionais (Obrigatório pelo menos 1) <span className="text-red-500">*</span>
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({
                          ...formData,
                          additional_stops: [...(formData.additional_stops || []), '']
                        })}
                        className="text-xs h-7 border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar Parada
                      </Button>
                    </div>

                    {(!formData.additional_stops || formData.additional_stops.length === 0) && (
                      <Alert className="bg-orange-50 border-orange-200 py-2">
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                          <AlertDescription className="text-orange-800 text-xs leading-snug">
                            Para viagens por hora, adicione pelo menos uma parada entre origem e destino final.
                          </AlertDescription>
                        </div>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      {formData.additional_stops?.map((stop, index) => (
                        <div key={index} className="flex gap-2">
                          <Suspense fallback={<ComponentLoader />}>
                            <LocationAutocomplete
                              value={stop}
                              onChange={(value) => {
                                startTransition(() => {
                                  const newStops = [...formData.additional_stops];
                                  newStops[index] = value;
                                  setFormData({ ...formData, additional_stops: newStops });
                                });
                              }}
                              placeholder={`Endereço da parada ${index + 1}`}
                              className="text-sm h-10 rounded-lg bg-gray-50 flex-1"
                            />
                          </Suspense>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newStops = formData.additional_stops.filter((_, i) => i !== index);
                              setFormData({ ...formData, additional_stops: newStops });
                            }}
                            className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="destination-hourly" className="text-xs font-bold text-gray-900">
                      Destino Final <span className="text-red-500">*</span>
                    </Label>
                    <Suspense fallback={<ComponentLoader />}>
                      <LocationAutocomplete
                        id="destination-hourly"
                        required
                        value={formData.destination}
                        onChange={(value) => startTransition(() => setFormData({...formData, destination: value}))}
                        placeholder="Digite o endereço de destino final"
                        className="text-sm h-10 rounded-lg bg-gray-50"
                      />
                    </Suspense>
                  </div>

                  {destinationIsAirport && (
                    <div className="space-y-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <Label htmlFor="destination_flight_number_hourly" className="flex items-center gap-2 text-sm font-bold text-blue-900">
                          <PlaneIcon className="w-4 h-4 text-blue-600" />
                          Número do Voo / Companhia (Destino Final) *
                        </Label>
                        <Suspense fallback={<ComponentLoader />}>
                          <FlightStatusChecker 
                            flightNumber={formData.destination_flight_number} 
                            date={formData.date}
                            expectedDestination={formData.destination}
                            checkType="departure"
                          />
                        </Suspense>
                      </div>
                      <Input
                        id="destination_flight_number_hourly"
                        value={formData.destination_flight_number}
                        onChange={(e) => setFormData({...formData, destination_flight_number: e.target.value})}
                        placeholder="Ex: LA 3000, GOL 1234"
                        className="bg-white"
                      />
                      <p className="text-xs text-blue-700">
                        ℹ️ Para rastreamento de partida do passageiro
                      </p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="date-hourly" className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Data <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date-hourly"
                      type="date"
                      required
                      min={minDateBasedOnLeadTime}
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full text-xs md:text-sm h-9 md:h-10 rounded-lg bg-gray-50 border-0 [&::-webkit-date-and-time-value]:text-xs md:[&::-webkit-date-and-time-value]:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="time-hourly" className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Horário <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="time-hourly"
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full text-xs md:text-sm h-9 md:h-10 rounded-lg bg-gray-50 border-0 [&::-webkit-date-and-time-value]:text-xs md:[&::-webkit-date-and-time-value]:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email-hourly" className="text-xs font-bold text-gray-900">
                      E-mail <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email-hourly"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="seu@email.com"
                      className="text-sm h-10 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div className="space-y-1.5 bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                    <Label htmlFor="phone-hourly" className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      WhatsApp / Telefone <span className="text-red-500">*</span>
                    </Label>
                    <Suspense fallback={<ComponentLoader />}>
                      <PhoneInputWithCountry
                        id="phone-hourly"
                        required
                        value={formData.phone}
                        onChange={(value) => setFormData({...formData, phone: value})}
                        placeholder="(00) 00000-0000"
                        className=""
                      />
                    </Suspense>
                    <p className="text-xs text-blue-700">
                      📱 Inclua o código do País
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {distanceError && (
                <Alert variant="destructive" className="mt-3 rounded-lg border-2 py-2.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <AlertDescription className="text-xs font-medium">{distanceError}</AlertDescription>
                </Alert>
              )}

              <div className="mt-6">
                <Button
                  onClick={handleCalculateAndContinue}
                  disabled={isCalculatingDistance}
                  className="w-full h-12 text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-md"
                >
                  {isCalculatingDistance ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {serviceType !== 'hourly' ? 'Calculando...' : 'Processando...'}
                    </>
                  ) : (
                    <>
                      Ver Veículos
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              className="text-xs h-8 px-3"
            >
              ← Voltar
            </Button>

            {leadTimeError && (
              <Alert variant="destructive" className="rounded-lg border-2 py-2.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs font-medium">{leadTimeError}</AlertDescription>
              </Alert>
            )}

            <Suspense fallback={<ComponentLoader />}>
              <VehicleSelection
                vehicles={vehiclesWithPrices}
                selectedVehicleId={selectedVehicle?.id}
                onSelectVehicle={handleVehicleSelect}
                onDriverLanguageChange={handleDriverLanguageChange}
                onRequestQuote={handleRequestQuote}
                isCalculating={isCalculatingPrices}
                isLoggedIn={!!user}
                showPrices={!!user || canViewPricesWithoutLogin}
                selectedDriverLanguage={driverLanguage}
                bookingDateTime={formData.date && formData.time ? new Date(`${formData.date}T${formData.time}`) : null}
              />
            </Suspense>
          </div>
        )}

        {step === 3 && selectedVehicle && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => {
                setStep(2);
                if (bookingLeadId) {
                  base44.functions.invoke('updateBookingLead', {
                    lead_id: bookingLeadId,
                    status: 'viewed_prices'
                  }).catch(err => console.error('[NovaReserva] Erro ao atualizar status do lead ao voltar:', err));
                }
              }}
              className="text-xs h-8 px-3"
            >
              ← Voltar
            </Button>

            <Suspense fallback={<ComponentLoader />}>
              <BookingForm
                serviceType={serviceType}
                tripDetails={formData}
                distanceData={distanceData}
                selectedVehicle={selectedVehicle}
                driverLanguage={driverLanguage}
                onPaymentCompleted={handlePaymentCompleted}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}