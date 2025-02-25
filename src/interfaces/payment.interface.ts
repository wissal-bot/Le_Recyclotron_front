export interface SubscriptionBody {
  paymentMethodId: string;
}

export interface DonationBody {
  amount: number;
  paymentMethodId: string;
}

export interface PaymentMethodBody {
  paymentMethodId: string;
  isDefault: boolean;
}

// Added interfaces to match route responses
export interface SubscriptionResponse {
  subscriptionId: any;
}

export interface PaymentResponse {
  message: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: string;
  type: 'subscription' | 'donation';
  createdAt: Date;
}

export interface WebhookData {
  [key: string]: any;
}

export interface WebhookResponse {
  received: boolean;
  message: string;
}
