import React, { useState } from 'react';
import { StateProvider, useAppState } from './context/StateContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DemoStepper } from './components/common/DemoStepper';
import { DemoControlModal } from './components/common/DemoControlModal';

// Setup Flow Components
import { VesselSelection } from './components/setup/VesselSelection';
import { DestinationSelection } from './components/setup/DestinationSelection';
import { EnvironmentalAnalysis } from './components/setup/EnvironmentalAnalysis';
import { RouteGeneration } from './components/setup/RouteGeneration';
import { RouteConfirmation } from './components/setup/RouteConfirmation';

// Persistent Page Views
import { DashboardPage } from './components/pages/DashboardPage';
import { SeaIcePage } from './components/pages/SeaIcePage';
import { IcebergPage } from './components/pages/IcebergPage';
import { RoutePage } from './components/pages/RoutePage';
import { AlertsPage } from './components/pages/AlertsPage';

// React Error Boundary to prevent blank white screens
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('POLARNAV Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#060911', color: '#f43f5e', fontFamily: 'sans-serif', height: '100vh' }}>
          <h2>POLARNAV Runtime Exception Detected</h2>
          <p style={{ color: '#94a3b8', marginTop: 10 }}>{this.state.error?.toString()}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 20, padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Reload PolarNav Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainAppContent: React.FC = () => {
  const { currentStep, activePage } = useAppState();
  const [demoControlOpen, setDemoControlOpen] = useState(false);

  const renderContent = () => {
    // If voyage is active, show persistent navigation pages
    if (currentStep === 'VOYAGE_ACTIVE') {
      switch (activePage) {
        case 'dashboard':
          return <DashboardPage />;
        case 'sea_ice':
          return <SeaIcePage />;
        case 'icebergs':
          return <IcebergPage />;
        case 'routes':
          return <RoutePage />;
        case 'alerts':
          return <AlertsPage />;
        default:
          return <DashboardPage />;
      }
    }

    // Otherwise show setup flow step
    switch (currentStep) {
      case 'VESSEL_SELECTION':
        return <VesselSelection />;
      case 'DESTINATION_SELECTION':
        return <DestinationSelection />;
      case 'ENVIRONMENTAL_ANALYSIS':
        return <EnvironmentalAnalysis />;
      case 'ROUTE_GENERATION':
        return <RouteGeneration />;
      case 'ROUTE_CONFIRMATION':
        return <RouteConfirmation />;
      default:
        return <VesselSelection />;
    }
  };

  return (
    <div className="app-root">
      <Header onOpenDemoControl={() => setDemoControlOpen(true)} />

      <div className="app-body">
        {currentStep === 'VOYAGE_ACTIVE' && <Sidebar />}

        <main className="main-viewport">
          <DemoStepper />
          <div className="page-content-area">{renderContent()}</div>
        </main>
      </div>

      {demoControlOpen && <DemoControlModal onClose={() => setDemoControlOpen(false)} />}
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <StateProvider>
        <MainAppContent />
      </StateProvider>
    </ErrorBoundary>
  );
}

export default App;
