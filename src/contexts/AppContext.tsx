import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppState,
  initialAppState,
  Patient,
  Provider,
  Service,
  Appointment,
  Payment,
  Invoice,
} from '@/types/app-state';

interface AppContextType {
  state: AppState;
  
  // Patient methods
  getPatient: (id: string) => Patient | undefined;
  upsertPatient: (patient: Patient) => void;
  
  // Provider methods
  getProvider: (id: string) => Provider | undefined;
  upsertProvider: (provider: Provider) => void;
  
  // Service methods
  getService: (id: string) => Service | undefined;
  upsertService: (service: Service) => void;
  
  // Appointment methods
  getAppointment: (id: string) => Appointment | undefined;
  upsertAppointment: (appointment: Appointment) => void;
  deleteAppointment: (id: string) => void;
  
  // Payment methods
  getPayment: (id: string) => Payment | undefined;
  upsertPayment: (payment: Payment) => void;
  
  // Invoice methods
  getInvoice: (id: string) => Invoice | undefined;
  upsertInvoice: (invoice: Invoice) => void;
  
  // Utility methods
  clearState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'gooddoc_app_state';

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    // Hydrate from localStorage on init
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load app state from localStorage:', error);
    }
    return initialAppState;
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to persist app state to localStorage:', error);
    }
  }, [state]);

  // Patient methods
  const getPatient = useCallback((id: string) => state.patients[id], [state.patients]);
  
  const upsertPatient = useCallback((patient: Patient) => {
    setState((prev) => ({
      ...prev,
      patients: {
        ...prev.patients,
        [patient.id]: patient,
      },
    }));
  }, []);

  // Provider methods
  const getProvider = useCallback((id: string) => state.providers[id], [state.providers]);
  
  const upsertProvider = useCallback((provider: Provider) => {
    setState((prev) => ({
      ...prev,
      providers: {
        ...prev.providers,
        [provider.id]: provider,
      },
    }));
  }, []);

  // Service methods
  const getService = useCallback((id: string) => state.services[id], [state.services]);
  
  const upsertService = useCallback((service: Service) => {
    setState((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [service.id]: service,
      },
    }));
  }, []);

  // Appointment methods
  const getAppointment = useCallback((id: string) => state.appointments[id], [state.appointments]);
  
  const upsertAppointment = useCallback((appointment: Appointment) => {
    setState((prev) => ({
      ...prev,
      appointments: {
        ...prev.appointments,
        [appointment.id]: appointment,
      },
    }));
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setState((prev) => {
      const { [id]: removed, ...rest } = prev.appointments;
      return {
        ...prev,
        appointments: rest,
      };
    });
  }, []);

  // Payment methods
  const getPayment = useCallback((id: string) => state.payments[id], [state.payments]);
  
  const upsertPayment = useCallback((payment: Payment) => {
    setState((prev) => ({
      ...prev,
      payments: {
        ...prev.payments,
        [payment.id]: payment,
      },
    }));
  }, []);

  // Invoice methods
  const getInvoice = useCallback((id: string) => state.invoices[id], [state.invoices]);
  
  const upsertInvoice = useCallback((invoice: Invoice) => {
    setState((prev) => ({
      ...prev,
      invoices: {
        ...prev.invoices,
        [invoice.id]: invoice,
      },
    }));
  }, []);

  // Utility methods
  const clearState = useCallback(() => {
    setState(initialAppState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        getPatient,
        upsertPatient,
        getProvider,
        upsertProvider,
        getService,
        upsertService,
        getAppointment,
        upsertAppointment,
        deleteAppointment,
        getPayment,
        upsertPayment,
        getInvoice,
        upsertInvoice,
        clearState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}
