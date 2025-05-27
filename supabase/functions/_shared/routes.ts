
// Shared routing configuration for edge functions
export const routes = {
  mpesa: {
    stkPush: '/api/mpesa-stk-push',
    paymentStatus: '/api/mpesa/payment-status',
    webhook: '/api/mpesa/webhook'
  },
  pesapal: {
    initiatePayment: '/api/pesapal/initiate-payment',
    paymentStatus: '/api/pesapal/payment-status',
    webhook: '/api/pesapal-webhook'
  }
};
