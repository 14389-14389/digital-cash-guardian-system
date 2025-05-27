
// M-Pesa STK Push utilities
export interface MpesaSTKRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface MpesaSTKResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface MpesaCallbackData {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: Array<{
      Name: string;
      Value: string | number;
    }>;
  };
}

export const initiateMpesaSTK = async (paymentData: MpesaSTKRequest): Promise<MpesaSTKResponse> => {
  const response = await fetch('/api/mpesa/stk-push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    throw new Error('Failed to initiate M-Pesa payment');
  }

  return response.json();
};

export const checkMpesaPaymentStatus = async (checkoutRequestId: string): Promise<any> => {
  const response = await fetch(`/api/mpesa/payment-status/${checkoutRequestId}`);
  
  if (!response.ok) {
    throw new Error('Failed to check payment status');
  }

  return response.json();
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  }
  
  // If it starts with +254, remove the +
  if (cleaned.startsWith('254')) {
    return cleaned;
  }
  
  // If it's just the number without country code, add 254
  if (cleaned.length === 9) {
    return '254' + cleaned;
  }
  
  return cleaned;
};
