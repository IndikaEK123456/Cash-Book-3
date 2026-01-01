
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  PAYPAL = 'PAY PAL'
}

export enum DeviceType {
  LAPTOP = 'LAPTOP',
  ANDROID = 'ANDROID',
  IPHONE = 'IPHONE'
}

export enum UserRole {
  ADMIN = 'ADMIN', // Can edit and push to cloud
  VIEWER = 'VIEWER' // Read-only, pulls from cloud
}

export interface OutPartyEntry {
  id: string;
  index: number;
  method: PaymentMethod;
  amount: number;
}

export interface MainEntry {
  id: string;
  roomNo: string;
  description: string;
  method: PaymentMethod;
  cashIn: number;
  cashOut: number;
}

export interface DailyRecord {
  date: string;
  outPartyEntries: OutPartyEntry[];
  mainEntries: MainEntry[];
  openingBalance: number;
  lastUpdated?: number;
}

export interface HistoryRecord extends DailyRecord {
  finalBalance: number;
  totalIn: number;
  totalOut: number;
}

export interface AppState {
  activeDay: DailyRecord;
  history: HistoryRecord[];
  role: UserRole;
}

export interface CurrencyRates {
  usdToLkr: number;
  eurToLkr: number;
  lastUpdated: string;
}
