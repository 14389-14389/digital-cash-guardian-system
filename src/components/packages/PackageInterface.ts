
export interface InvestmentPackage {
  id: string;
  name: string;
  type: 'starter' | 'growth' | 'premium' | 'elite';
  price: number;
  daily_earning: number;
  duration_days: number;
  features: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
