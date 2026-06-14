'use client';

import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

const STEPS = [
  { label: 'Intake', desc: 'Understanding symptoms' },
  { label: 'Hypothesis', desc: 'Identifying causes' },
  { label: 'Elimination', desc: 'Narrowing down' },
  { label: 'Inspection', desc: 'Checking components' },
  { label: 'Diagnosis', desc: 'Root cause found' },
  { label: 'Resolution', desc: 'Fix & guidance' },
];

interface DiagnosticProgressProps {
  currentStep: number;
}

export function DiagnosticProgress({ currentStep }: DiagnosticProgressProps) {
  return (
    <div className="px-4 py-3 border-b border-border-subtle bg-bg-secondary/50">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {STEPS.map((step, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={i} className="flex items-center gap-1 shrink-0">
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-300',
                  isCompleted && 'text-success',
                  isCurrent && 'bg-brand-500/10 text-brand-400',
                  !isCompleted && !isCurrent && 'text-text-muted'
                )}
              >
                {isCompleted ? (
                  <CheckCircle size={12} />
                ) : (
                  <span
                    className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border',
                      isCurrent ? 'border-brand-500 text-brand-400 bg-brand-500/10' : 'border-border-default'
                    )}
                  >
                    {stepNum}
                  </span>
                )}
                <span className="text-xs font-medium hidden sm:block">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-4 h-px',
                    isCompleted ? 'bg-success/40' : 'bg-border-subtle'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
