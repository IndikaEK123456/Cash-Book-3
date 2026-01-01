
import { PaymentMethod } from './types';

export const COLORS = {
  CASH_IN: 'text-blue-600',
  CASH_OUT: 'text-red-600',
  CARD: 'text-yellow-500',
  PAYPAL: 'text-purple-600',
  BG_BLUE: 'bg-blue-50',
  BG_RED: 'bg-red-50',
  BG_YELLOW: 'bg-yellow-50',
  BG_PURPLE: 'bg-purple-50',
  BORDER_BLUE: 'border-blue-200',
  BORDER_RED: 'border-red-200',
  BORDER_YELLOW: 'border-yellow-200',
  BORDER_PURPLE: 'border-purple-200',
};

export const getMethodColor = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.CASH: return COLORS.CASH_IN;
    case PaymentMethod.CARD: return COLORS.CARD;
    case PaymentMethod.PAYPAL: return COLORS.PAYPAL;
    default: return 'text-slate-900';
  }
};

export const getMethodBg = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.CASH: return COLORS.BG_BLUE;
    case PaymentMethod.CARD: return COLORS.BG_YELLOW;
    case PaymentMethod.PAYPAL: return COLORS.BG_PURPLE;
    default: return 'bg-white';
  }
};
