import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

interface PaymentOption {
  id: string;
  title: string;
  description: string;
  type: 'subscription' | 'donation';
  amount?: number;
  period?: 'monthly' | 'yearly';
  features?: string[];
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  paymentStep: 'choose' | 'details' | 'confirmation' = 'choose';
  selectedOption: PaymentOption | null = null;
  customAmount: number = 0;
  isCustomDonation: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  success: boolean = false;

  subscriptionOptions: PaymentOption[] = [
    {
      id: 'basic',
      title: 'Adhésion Standard',
      type: 'subscription',
      description: 'Soutenez notre association et participez à nos ateliers',
      amount: 5,
      period: 'monthly',
      features: [
        'Accès aux ateliers mensuels',
        'Newsletter exclusive',
        'Remises sur la boutique',
      ],
    },
    {
      id: 'premium',
      title: 'Adhésion Premium',
      type: 'subscription',
      description: 'Tous les avantages standard + des services exclusifs',
      amount: 10,
      period: 'monthly',
      features: [
        'Tous les avantages Standard',
        'Accès prioritaire aux événements',
        'Ateliers exclusifs',
        'Consultation personnalisée',
      ],
    },
    {
      id: 'yearly',
      title: 'Adhésion Annuelle',
      type: 'subscription',
      description: 'Tous les avantages premium avec tarif annuel avantageux',
      amount: 100,
      period: 'yearly',
      features: [
        'Tous les avantages Premium',
        'Deux mois gratuits',
        'Badge donateur exclusif',
        'Participation au comité consultatif',
      ],
    },
  ];

  donationOptions: PaymentOption[] = [
    {
      id: 'small',
      title: 'Petite Donation',
      type: 'donation',
      description: 'Chaque euro compte pour soutenir nos actions',
      amount: 5,
    },
    {
      id: 'medium',
      title: 'Donation Moyenne',
      type: 'donation',
      description: 'Aidez-nous à financer un atelier communautaire',
      amount: 20,
    },
    {
      id: 'large',
      title: 'Grande Donation',
      type: 'donation',
      description: 'Contribuez significativement à notre mission',
      amount: 50,
    },
    {
      id: 'custom',
      title: 'Montant Personnalisé',
      type: 'donation',
      description: 'Choisissez le montant qui vous convient',
    },
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.paymentForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryDate: [
        '',
        [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)],
      ],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    });
  }

  ngOnInit() {}

  selectOption(option: PaymentOption): void {
    this.selectedOption = option;
    this.isCustomDonation = option.id === 'custom';

    if (!this.isCustomDonation) {
      this.nextStep();
    }
  }

  setCustomAmount(amount: number): void {
    this.customAmount = amount;
    if (this.selectedOption && this.selectedOption.id === 'custom') {
      this.selectedOption = {
        ...this.selectedOption,
        amount: amount,
      };
      this.nextStep();
    }
  }

  nextStep(): void {
    if (this.paymentStep === 'choose') {
      this.paymentStep = 'details';
    } else if (this.paymentStep === 'details' && this.paymentForm.valid) {
      this.processPayment();
    }
  }

  previousStep(): void {
    if (this.paymentStep === 'details') {
      this.paymentStep = 'choose';
      this.selectedOption = null;
    }
  }

  processPayment(): void {
    this.loading = true;
    this.error = null;

    // Simulation du traitement du paiement
    setTimeout(() => {
      this.loading = false;

      // Simulation de succès (dans un vrai scénario, nous appellerions une API de paiement)
      const success = Math.random() > 0.2; // 80% de chances de succès pour la démo

      if (success) {
        this.success = true;
        this.paymentStep = 'confirmation';
      } else {
        this.error =
          'Une erreur est survenue lors du traitement du paiement. Veuillez réessayer.';
      }
    }, 2000); // Simuler un délai de traitement
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  returnToHome(): void {
    this.router.navigate(['/']);
  }

  getTotal(): number {
    return this.selectedOption?.amount || 0;
  }
}
