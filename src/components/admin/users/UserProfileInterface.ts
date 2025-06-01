
export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  wallet_balance: number;
  role: string;
  created_at: string;
}

export interface UserCardData {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  wallet_balance: number;
  created_at: string;
  is_admin: boolean;
}
