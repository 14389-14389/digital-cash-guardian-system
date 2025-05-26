
// Pesapal integration utilities
export interface PesapalConfig {
  consumerKey: string;
  consumerSecret: string;
  baseUrl: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: {
    email_address: string;
    phone_number: string;
    country_code: string;
    first_name: string;
    last_name: string;
  };
}

export interface PaymentResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: {
    error_type: string;
    code: string;
    message: string;
    description: string;
  };
}

// This will be implemented via edge function due to CORS and security
export const initiatePesapalPayment = async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
  const response = await fetch('/api/pesapal/initiate-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    throw new Error('Failed to initiate payment');
  }

  return response.json();
};

export const checkPaymentStatus = async (orderTrackingId: string): Promise<any> => {
  const response = await fetch(`/api/pesapal/payment-status/${orderTrackingId}`);
  
  if (!response.ok) {
    throw new Error('Failed to check payment status');
  }

  return response.json();
};

export const formatCurrency = (amount: number): string => {
  return `KES ${amount.toLocaleString()}`;
};
