import React from 'react';
import { PaymentMethods } from './PaymentMethods';

interface PricingProps {
  onSelectPlan?: (planTitle: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  return <PaymentMethods onSelectPaymentMethod={onSelectPlan} />;
};
