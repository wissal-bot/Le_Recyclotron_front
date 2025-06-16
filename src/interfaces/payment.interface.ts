export interface SubscriptionBody {
  customerId: string;
  priceId: string;
  userId: number;
}

export interface DonationBody {
  amount: number; // amount > 0
  paymentMethodId: string;
  userId: number;
}

export interface PaymentMethodBody {
  customerId: string;
  paymentMethodId: string;
}

export interface Payment {
  id: number;
  userId: number;
  id_stripe_payment: string;
  amount: number;
  type: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
}
