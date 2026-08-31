import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  StepState,
  PageId,
  Vessel,
  LocationPoint,
  Iceberg,
  EnvironmentalState,
  CandidateRoute,
  TimelineEvent,
  AppState
} from '../types';
import {
  VESSELS,
  ORIGIN_LOCATION,
  SUGGESTED_DESTINATIONS,
  INITIAL_ICEBERGS,
  SHIFTED_IB042,
  INITIAL_ENVIRONMENT,
  INITIAL_TIMELINE
} from '../data/mockData';
import { generateCandidateRoutes } from '../engine/routingEngine';

interface StateContextType extends AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  selectVessel: (vessel: Vessel) => void;
  confirmVessel: () => void;
  selectDestination: (dest: LocationPoint) => void;
  confirmDestination: () => void;
  finishEnvironmentalAnalysis: () => void;
  selectInitialRoute: (routeId: 'a' | 'b' | 'c') => void;
  startVoyage: () => void;
  navigatePage: (page: PageId) => void;
  triggerIcebergTrajectoryEvent: () => void;
  reassessRoute: () => void;
  acceptReroute: () => void;
  resetDemo: () => void;
  setDemoModeActive: (active: boolean) => void;
  updateVesselProgress: (percent: number) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentStep, setCurrentStep] = useState<StepState>('VESSEL_SELECTION');
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(VESSELS[0]);
  const [origin] = useState<LocationPoint>(ORIGIN_LOCATION);
  const [destination, setDestination] = useState<LocationPoint | null>(SUGGESTED_DESTINATIONS[0]);

  const [environment, setEnvironment] = useState<EnvironmentalState>(INITIAL_ENVIRONMENT);
  const [icebergs, setIcebergs] = useState<Iceberg[]>(INITIAL_ICEBERGS);
  
  const [candidateRoutes, setCandidateRoutes] = useState<CandidateRoute[]>([]);
  const [activeRouteId, setActiveRouteId] = useState<'a' | 'b' | 'c'>('a');
  const [vesselProgressPercent, setVesselProgressPercent] = useState<number>(18);

  const [icebergEventTriggered, setIcebergEventTriggered] = useState<boolean>(false);
  const [alertActive, setAlertActive] = useState<boolean>(false);
  const [rerouteCalculated, setRerouteCalculated] = useState<boolean>(false);
  const [rerouteAccepted, setRerouteAccepted] = useState<boolean>(false);

  const [timeline, setTimeline] = useState<TimelineEvent[]>(INITIAL_TIMELINE);
  const [simulationTimeMinutes, setSimulationTimeMinutes] = useState<number>(142);
  const [demoModeActive, setDemoModeActive] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Live Micro-Fluctuation of Iceberg Drift Speeds (Dynamic Antarctic Currents & Wind Dynamics)
  useEffect(() => {
    const driftInterval = setInterval(() => {
      setIcebergs((prevIcebergs) =>
        prevIcebergs.map((ib) => {
          const baseSpeed =
            ib.id === 'IB-042'
              ? icebergEventTriggered
                ? 0.62
                : 0.54
              : ib.id === 'IB-019'
              ? 0.41
              : 0.29;
          
          // Realistic dynamic current turbulence fluctuation (+/- 0.05 m/s)
          const fluctuation = (Math.random() - 0.5) * 0.10;
          const dynamicSpeed = Math.max(0.15, Math.min(0.95, Number((baseSpeed + fluctuation).toFixed(2))));
          
          return {
            ...ib,
            driftSpeed: dynamicSpeed
          };
        })
      );
    }, 2000);

    return () => clearInterval(driftInterval);
  }, [icebergEventTriggered]);

  useEffect(() => {
    if (selectedVessel && destination) {
      const routes = generateCandidateRoutes(
        selectedVessel,
        origin,
        destination,
        icebergs,
        environment
      );
      setCandidateRoutes(routes);
    }
  }, [selectedVessel, destination, icebergs, environment, origin]);

  useEffect(() => {
    if (currentStep !== 'VOYAGE_ACTIVE') return;

    const interval = setInterval(() => {
      setSimulationTimeMinutes((prev) => prev + 1);
      setVesselProgressPercent((prev) => (prev >= 98 ? 15 : prev + 0.12));
    }, 2000);

    return () => clearInterval(interval);
  }, [currentStep]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSelectVessel = (vessel: Vessel) => {
    setSelectedVessel(vessel);
  };

  const handleConfirmVessel = () => {
    setCurrentStep('DESTINATION_SELECTION');
  };

  const handleSelectDestination = (dest: LocationPoint) => {
    setDestination(dest);
  };

  const handleConfirmDestination = () => {
    setCurrentStep('ENVIRONMENTAL_ANALYSIS');
  };

  const handleFinishEnvironmentalAnalysis = () => {
    setCurrentStep('ROUTE_GENERATION');
  };

  const handleSelectInitialRoute = (routeId: 'a' | 'b' | 'c') => {
    setActiveRouteId(routeId);
    setCurrentStep('ROUTE_CONFIRMATION');
  };

  const handleStartVoyage = () => {
    setCurrentStep('VOYAGE_ACTIVE');
    setActivePage('dashboard');

    setTimeline((prev) => [
      ...prev,
      {
        id: `t-${Date.now()}`,
        time: '09:00 UTC',
        title: 'Voyage Active — Route A',
        description: `${selectedVessel?.name || 'Vessel'} departed origin on Route A towards ${destination?.name}. Navigation status NORMAL.`,
        type: 'info'
      }
    ]);
  };

  const handleNavigatePage = (page: PageId) => {
    setActivePage(page);
  };

  const handleTriggerIcebergTrajectoryEvent = () => {
    if (icebergEventTriggered) return;

    setIcebergEventTriggered(true);
    setAlertActive(true);

    setIcebergs((prev) =>
      prev.map((ib) => (ib.id === 'IB-042' ? { ...SHIFTED_IB042, driftSpeed: 0.62 } : ib))
    );

    setTimeline((prev) => [
      ...prev,
      {
        id: `t-sar-${Date.now()}`,
        time: '10:30 UTC',
        title: 'NEW SAR OBSERVATION RECEIVED',
        description: 'Sentinel-1B pass detected IB-042 trajectory shift toward NW corridor (Dynamic speed 0.62 m/s).',
        type: 'warning'
      },
      {
        id: `t-alert-${Date.now()}`,
        time: '10:31 UTC',
        title: '⚠ ROUTE A RISK INCREASED (HIGH)',
        description: 'Submerged hazard clearance reduced to <1.5 km. Risk engine flagged Route A status as AVOID.',
        type: 'alert'
      }
    ]);
  };

  const handleReassessRoute = () => {
    setRerouteCalculated(true);

    setTimeline((prev) => [
      ...prev,
      {
        id: `t-reassess-${Date.now()}`,
        time: '10:32 UTC',
        title: 'Instant Risk Reassessment Executed',
        description: 'A* multi-criteria grid recalculation complete. Route B identified as optimal bypass route.',
        type: 'info'
      }
    ]);
  };

  const handleAcceptReroute = () => {
    setActiveRouteId('b');
    setRerouteAccepted(true);
    setAlertActive(false);

    setTimeline((prev) => [
      ...prev,
      {
        id: `t-accept-${Date.now()}`,
        time: '10:34 UTC',
        title: 'Operator Accepted Reroute — Route B Active',
        description: 'INSV POLARIS course altered to Route B (North-West Arc). Estimated hazard clearance restored to >28 km.',
        type: 'success'
      }
    ]);
  };

  const handleResetDemo = () => {
    setCurrentStep('VESSEL_SELECTION');
    setActivePage('dashboard');
    setSelectedVessel(VESSELS[0]);
    setDestination(SUGGESTED_DESTINATIONS[0]);
    setEnvironment(INITIAL_ENVIRONMENT);
    setIcebergs(INITIAL_ICEBERGS);
    setActiveRouteId('a');
    setVesselProgressPercent(18);
    setIcebergEventTriggered(false);
    setAlertActive(false);
    setRerouteCalculated(false);
    setRerouteAccepted(false);
    setTimeline(INITIAL_TIMELINE);
    setSimulationTimeMinutes(142);
  };

  return (
    <StateContext.Provider
      value={{
        theme,
        toggleTheme: handleToggleTheme,
        currentStep,
        activePage,
        selectedVessel,
        origin,
        destination,
        environment,
        icebergs,
        candidateRoutes,
        activeRouteId,
        vesselProgressPercent,
        icebergEventTriggered,
        alertActive,
        rerouteCalculated,
        rerouteAccepted,
        timeline,
        simulationTimeMinutes,
        demoModeActive,
        selectVessel: handleSelectVessel,
        confirmVessel: handleConfirmVessel,
        selectDestination: handleSelectDestination,
        confirmDestination: handleConfirmDestination,
        finishEnvironmentalAnalysis: handleFinishEnvironmentalAnalysis,
        selectInitialRoute: handleSelectInitialRoute,
        startVoyage: handleStartVoyage,
        navigatePage: handleNavigatePage,
        triggerIcebergTrajectoryEvent: handleTriggerIcebergTrajectoryEvent,
        reassessRoute: handleReassessRoute,
        acceptReroute: handleAcceptReroute,
        resetDemo: handleResetDemo,
        setDemoModeActive,
        updateVesselProgress: setVesselProgressPercent
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};
