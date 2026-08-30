import React from 'react';
import { useAppState } from '../../context/StateContext';
import type { StepState } from '../../types';
import { Check } from 'lucide-react';

export const DemoStepper: React.FC = () => {
  const { currentStep } = useAppState();

  const steps: { id: StepState; label: string }[] = [
    { id: 'VESSEL_SELECTION', label: '1. Select Vessel' },
    { id: 'DESTINATION_SELECTION', label: '2. Select Destination' },
    { id: 'ENVIRONMENTAL_ANALYSIS', label: '3. Scan Environment' },
    { id: 'ROUTE_GENERATION', label: '4. Candidate Routes' },
    { id: 'ROUTE_CONFIRMATION', label: '5. Confirm & Launch' },
    { id: 'VOYAGE_ACTIVE', label: 'Voyage Active' }
  ];

  const getStepIndex = (step: StepState) => {
    return steps.findIndex((s) => s.id === step);
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="demo-stepper-bar">
      <div className="stepper-track">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.id} className={`step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="step-circle">{isDone ? <Check size={12} /> : idx + 1}</div>
              <span className="step-label">{step.label}</span>
              {idx < steps.length - 1 && <div className="step-line" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
