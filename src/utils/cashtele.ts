
// Cashtele API integration utilities
export interface CashteleConfig {
  consumerKey: string;
  consumerSecret: string;
  baseUrl: string;
}

export interface CashtelePaymentRequest {
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc: string;
  callbackUrl?: string;
}

export interface CashtelePaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  checkoutRequestId?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface CashteleStatusResponse {
  success: boolean;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount?: number;
  transactionId?: string;
  mpesaReceiptNumber?: string;
  message?: string;
}

// This will be implemented via edge function for security
export const initiateCashtelePayment = async (paymentData: CashtelePaymentRequest): Promise<CashtelePaymentResponse> => {
  const response = await fetch('/api/cashtele/initiate-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    throw new Error('Failed to initiate Cashtele payment');
  }

  return response.json();
};

export const checkCashtelePaymentStatus = async (transactionId: string): Promise<CashteleStatusResponse> => {
  const response = await fetch(`/api/cashtele/payment-status/${transactionId}`);
  
  if (!response.ok) {
    throw new Error('Failed to check payment status');
  }

  return response.json();
};

export const formatCurrency = (amount: number): string => {
  return `KES ${amount.toLocaleString()}`;
};

// Validate phone number for M-Pesa format
export const validatePhoneNumber = (phone: string): boolean => {
  const kenyanPhoneRegex = /^(?:254|\+254|0)?([17]\d{8})$/;
  return kenyanPhoneRegex.test(phone);
};

// Format phone number to 254 format
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  } else if (cleaned.length === 9) {
    return '254' + cleaned;
  }
  
  return phone;
};
