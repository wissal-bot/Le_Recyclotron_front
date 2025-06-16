import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api_authService } from '../services/api/api_auth.service';
import { Api_userService } from '../services/api/api_user.service';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { User, UpdateUser } from '../../interfaces/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: any = null;
  loading: boolean = true;
  loadingRegistrations: boolean = false;
  loadingPayments: boolean = false;
  error: string | null = null;
  registrationsError: string | null = null;
  paymentsError: string | null = null;
  successMessage: string | null = null;

  // Propriétés pour l'édition du profil
  isEditMode: boolean = false;
  editableUser: UpdateUser = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
  };
  savingProfile: boolean = false;
  editError: string | null = null;

  // Indicateurs de rôle
  isClient: boolean = false;

  // Permissions dans l'interface
  canEditProfile: boolean = false;
  canDeleteProfile: boolean = false;
  canViewRegistrations: boolean = false;
  canViewPayments: boolean = false;

  // Gestion des souscriptions pour la destruction propre du composant
  private subscriptions: Subscription[] = [];

  // Onglets
  activeTab: 'details' | 'registrations' | 'payments' = 'details';

  // Données pour les onglets
  registrations: any[] = [];
  payments: any[] = [];
  constructor(
    private authService: Api_authService,
    private userService: Api_userService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Fetch user data directly from API
    this.fetchUserData();
  }

  ngOnDestroy(): void {
    // Désabonnement de tous les observables pour éviter les fuites mémoire
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  /**
   * Change l'onglet actif et charge les données si nécessaire
   */
  setActiveTab(tab: 'details' | 'registrations' | 'payments'): void {
    // Vérifier les permissions avant de changer d'onglet
    if (tab === 'registrations' && !this.canViewRegistrations) {
      console.warn("Tentative d'accès à l'onglet inscriptions sans permission");
      return;
    }

    if (tab === 'payments' && !this.canViewPayments) {
      console.warn("Tentative d'accès à l'onglet paiements sans permission");
      return;
    }

    this.activeTab = tab;

    // Si l'utilisateur n'est pas chargé, essayer de le recharger
    if (!this.user) {
      console.warn(
        "Tentative de changer d'onglet sans utilisateur chargé, tentative de rechargement"
      );
      this.fetchUserData();
      return;
    }

    // Charger les données selon l'onglet
    if (tab === 'registrations' && this.canViewRegistrations) {
      // Toujours recharger les données pour s'assurer qu'elles sont à jour
      this.fetchUserRegistrations();
    } else if (tab === 'payments' && this.canViewPayments) {
      // Toujours recharger les données pour s'assurer qu'elles sont à jour
      this.fetchUserPayments();
    }
  }
  /**
   * Récupère les données de l'utilisateur
   */ fetchUserData(): void {
    this.loading = true;
    this.error = null;

    const sub = this.authService
      .getCurrentUser()
      .pipe(
        timeout(10000), // Timeout après 10 secondes
        catchError((error) => {
          console.error('Timeout or error fetching user data:', error);
          this.error =
            'Impossible de récupérer les informations utilisateur. Le serveur est peut-être indisponible.';
          this.loading = false;
          throw error;
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('Données utilisateur reçues:', response);

          // Properly handle the response structure
          if (response && response.data) {
            this.user = response.data;
          } else {
            this.user = response;
          }

          // Essayer de récupérer l'ID utilisateur de différentes manières possibles
          let userId = this.getUserId();
          if (!userId) {
            // Si on ne trouve pas d'ID de manière standard, essayer d'autres propriétés
            if (response && typeof response === 'object') {
              const possibleIdFields = [
                'id',
                'userId',
                '_id',
                'user_id',
                'ID',
                'Id',
              ];
              for (const field of possibleIdFields) {
                if (response[field]) {
                  this.user.id = response[field];
                  userId = String(response[field]);
                  console.log(
                    `ID utilisateur trouvé dans le champ ${field}:`,
                    userId
                  );
                  break;
                }
              }
            }
          }
          console.log('Utilisateur après traitement:', this.user);
          console.log('ID utilisateur:', userId);

          // Vérifier les rôles de l'utilisateur et définir ses permissions
          this.checkRolesAndPermissions();

          this.loading = false;

          // Si l'utilisateur est chargé, on peut précharger les inscriptions et paiements
          // pour éviter les problèmes de chargement lors du changement d'onglet
          if (userId) {
            // Ne charger les inscriptions et paiements que pour les clients
            if (this.isClient) {
              this.fetchUserRegistrations();
              this.fetchUserPayments();
            } else {
              console.log(
                'Utilisateur non client, pas de chargement des inscriptions et paiements'
              );
            }
          } else {
            console.error(
              'Impossible de trouver un ID utilisateur valide - historiques non chargés'
            );
            this.registrationsError = 'ID utilisateur non disponible';
            this.paymentsError = 'ID utilisateur non disponible';
          }

          // Détection du rôle client et gestion des permissions
          this.checkRolesAndPermissions();
        },
        error: (error) => {
          console.error('Error fetching user data:', error);
          this.error = 'Impossible de récupérer les informations utilisateur.';
          this.loading = false;
        },
      });

    this.subscriptions.push(sub);
  }
  /**
   * Récupère l'historique des inscriptions de l'utilisateur
   */ fetchUserRegistrations(): void {
    if (!this.user) {
      console.warn(
        'Tentative de récupérer les inscriptions sans utilisateur chargé'
      );
      this.registrationsError = 'Utilisateur non chargé';
      return;
    }

    const userId = this.getUserId();
    if (!userId) {
      this.registrationsError = "Impossible de récupérer l'ID utilisateur";
      console.error('ID utilisateur introuvable:', this.user);
      return;
    }

    console.log(`Récupération des inscriptions pour l'utilisateur ${userId}`);
    this.loadingRegistrations = true;
    this.registrationsError = null;

    const sub = this.userService
      .getUserRegistrations(userId)
      .pipe(
        timeout(10000), // Timeout après 10 secondes
        catchError((error) => {
          console.error(
            'Timeout ou erreur lors de la récupération des inscriptions:',
            error
          );
          this.registrationsError =
            "Impossible de récupérer l'historique des inscriptions. Le serveur est peut-être indisponible.";
          this.loadingRegistrations = false;
          throw error;
        })
      )
      .subscribe({
        next: (data: any[]) => {
          console.log(`${data.length} inscriptions reçues:`, data);

          // Vérifier si les données ont une structure attendue
          this.registrations = data.map((registration) => {
            // Vérifier et fournir des valeurs par défaut si nécessaire
            return {
              ...registration,
              // S'assurer que les champs clés existent
              id:
                registration.id ||
                registration._id ||
                registration.registrationId ||
                0,
              active:
                registration.active !== undefined ? registration.active : true,
              seats: registration.seats || 1,
              createdAt:
                registration.createdAt ||
                registration.created_at ||
                new Date().toISOString(),
              event: registration.event || {
                id: registration.eventId || 0,
                name: 'Événement sans nom',
              },
            };
          });

          console.log('Inscriptions après traitement:', this.registrations);
          this.loadingRegistrations = false;
        },
        error: (error: any) => {
          console.error('Error fetching user registrations:', error);
          this.registrationsError =
            "Impossible de récupérer l'historique des inscriptions.";
          this.registrations = []; // Réinitialiser en cas d'erreur
          this.loadingRegistrations = false;
        },
      });

    this.subscriptions.push(sub);
  }
  /**
   * Récupère l'historique des paiements de l'utilisateur
   */
  fetchUserPayments(): void {
    if (!this.user) {
      console.warn(
        'Tentative de récupérer les paiements sans utilisateur chargé'
      );
      this.paymentsError = 'Utilisateur non chargé';
      return;
    }

    const userId = this.getUserId();
    if (!userId) {
      this.paymentsError = "Impossible de récupérer l'ID utilisateur";
      console.error('ID utilisateur introuvable:', this.user);
      return;
    }
    console.log(`Récupération des paiements pour l'utilisateur ${userId}`);
    this.loadingPayments = true;
    this.paymentsError = null;

    const sub = this.userService
      .getUserPayments(userId)
      .pipe(
        timeout(10000), // Timeout après 10 secondes
        catchError((error) => {
          console.error(
            'Timeout ou erreur lors de la récupération des paiements:',
            error
          );
          this.paymentsError =
            "Impossible de récupérer l'historique des paiements. Le serveur est peut-être indisponible.";
          this.loadingPayments = false;
          throw error;
        })
      )
      .subscribe({
        next: (data: any[]) => {
          console.log(`${data.length} paiements reçus:`, data);

          // Vérifier si les données ont une structure attendue
          this.payments = data.map((payment) => {
            // Vérifier et fournir des valeurs par défaut si nécessaire
            return {
              ...payment,
              // S'assurer que les champs clés existent
              id: payment.id || payment._id || payment.paymentId || 0,
              amount: payment.amount || 0,
              status: payment.status || 'unknown',
              type: payment.type || 0,
              createdAt:
                payment.createdAt ||
                payment.created_at ||
                new Date().toISOString(),
              id_stripe_payment:
                payment.id_stripe_payment ||
                payment.stripe_payment_id ||
                payment.transactionId ||
                'N/A',
            };
          });

          console.log('Paiements après traitement:', this.payments);
          this.loadingPayments = false;
        },
        error: (error: any) => {
          console.error('Error fetching user payments:', error);
          this.paymentsError =
            "Impossible de récupérer l'historique des paiements.";
          this.payments = []; // Réinitialiser en cas d'erreur
          this.loadingPayments = false;
        },
      });

    this.subscriptions.push(sub);
  }

  /**
   * Retourne un libellé pour le type de paiement
   */
  getPaymentTypeLabel(type: number): string {
    switch (type) {
      case 1:
        return 'Abonnement';
      case 2:
        return 'Don';
      default:
        return 'Autre';
    }
  }

  /**
   * Se déconnecte de l'application
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  /**
   * Récupère l'ID utilisateur de manière fiable en tenant compte de différentes structures
   */
  private getUserId(): string | null {
    if (!this.user) {
      return null;
    }

    // Vérifier les différentes façons dont l'ID peut être stocké
    if (typeof this.user.id !== 'undefined') {
      return String(this.user.id);
    } else if (typeof this.user.userId !== 'undefined') {
      return String(this.user.userId);
    } else if (typeof this.user._id !== 'undefined') {
      return String(this.user._id);
    } else if (typeof this.user.user_id !== 'undefined') {
      return String(this.user.user_id);
    }

    console.error("Aucun ID trouvé dans l'objet utilisateur:", this.user);
    return null;
  }

  /**
   * Vérifie les rôles de l'utilisateur et détermine ses permissions
   */
  private checkRolesAndPermissions(): void {
    if (!this.user || !this.user.roles) {
      console.warn(
        'Impossible de vérifier les rôles: utilisateur ou rôles non définis'
      );
      return;
    }

    // Vérifier si l'utilisateur est un client
    this.isClient = this.user.roles.some(
      (role: any) => role.name.toLowerCase() === 'client'
    );

    // Définir les permissions selon le rôle
    if (this.isClient) {
      this.canEditProfile = true;
      this.canDeleteProfile = true;
      this.canViewRegistrations = true;
      this.canViewPayments = true;
    } else {
      this.canEditProfile = false;
      this.canDeleteProfile = false;
      this.canViewRegistrations = false;
      this.canViewPayments = false;
    }

    console.log(
      `Rôles et permissions définis - Client: ${this.isClient}, ` +
        `Edition: ${this.canEditProfile}, Suppression: ${this.canDeleteProfile}, ` +
        `Inscriptions: ${this.canViewRegistrations}, Paiements: ${this.canViewPayments}`
    );

    // Si l'utilisateur n'est pas autorisé à voir l'onglet actif, revenir à l'onglet détails
    if (
      (this.activeTab === 'registrations' && !this.canViewRegistrations) ||
      (this.activeTab === 'payments' && !this.canViewPayments)
    ) {
      console.log(
        'Redirection vers onglet détails car pas de permission pour',
        this.activeTab
      );
      this.activeTab = 'details';
    }
  }

  /**
   * Méthode de débogage pour analyser les structures de données inconnues
   * @param data Structure à analyser
   * @returns Description de la structure
   */
  private debugDataStructure(data: any): string {
    if (!data) return 'null ou undefined';

    if (Array.isArray(data)) {
      if (data.length === 0) return 'Tableau vide';

      // Analyser le premier élément pour comprendre la structure
      const firstItem = data[0];
      const keys = Object.keys(firstItem);
      return `Tableau de ${data.length} éléments. Exemple de clés: ${keys.join(
        ', '
      )}`;
    }

    if (typeof data === 'object') {
      const keys = Object.keys(data);
      let result = `Objet avec les clés: ${keys.join(', ')}`;

      // Vérifier s'il y a des tableaux dans l'objet
      const arrayProps = keys.filter((k) => Array.isArray(data[k]));
      if (arrayProps.length > 0) {
        result += `. Contient des tableaux dans: ${arrayProps.join(', ')}`;
      }

      return result;
    }

    return `Valeur simple de type ${typeof data}: ${data}`;
  }
  /**
   * Naviguer vers l'écran de modification du profil
   */
  editProfile(): void {
    if (!this.canEditProfile) {
      console.warn("Tentative d'édition du profil sans permission");
      return;
    }

    // Réinitialiser les messages d'erreur et de succès
    this.editError = null;
    this.successMessage = null;

    // Activer le mode édition et préremplir le formulaire avec les données utilisateur
    this.isEditMode = true;
    this.editableUser = {
      first_name: this.user.first_name || '',
      last_name: this.user.last_name || '',
      email: this.user.email || '',
      password: '', // Ne pas préremplir le mot de passe
      phone: this.user.phone || '',
    };

    console.log('Mode édition activé avec données:', this.editableUser);
  }
  /**
   * Enregistre les modifications du profil
   */
  saveProfile(): void {
    if (!this.canEditProfile || !this.isEditMode) {
      console.warn(
        "Tentative d'enregistrement sans permission ou hors mode édition"
      );
      return;
    }

    // Validation basique des données
    if (
      !this.editableUser.first_name?.trim() ||
      !this.editableUser.last_name?.trim() ||
      !this.editableUser.email?.trim()
    ) {
      this.editError =
        'Veuillez remplir tous les champs obligatoires (prénom, nom, email)';
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editableUser.email!)) {
      this.editError = "L'adresse email n'est pas valide";
      return;
    }

    // Si le mot de passe est vide, le supprimer pour ne pas le mettre à jour
    if (
      !this.editableUser.password ||
      this.editableUser.password.trim() === ''
    ) {
      delete this.editableUser.password;
    } else if (this.editableUser.password.length < 6) {
      this.editError = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    // Récupérer l'ID utilisateur
    const userId = this.getUserId();
    if (!userId) {
      this.editError = "Impossible de récupérer l'ID utilisateur";
      return;
    }

    // Afficher l'indicateur de chargement
    this.savingProfile = true;
    this.editError = null;
    this.successMessage = null;

    console.log(
      'Tentative de mise à jour du profil avec données:',
      this.editableUser
    );

    // Préparer un objet de mise à jour propre pour éviter d'envoyer des données non définies
    const updateData: UpdateUser = {
      first_name: this.editableUser.first_name,
      last_name: this.editableUser.last_name,
      email: this.editableUser.email,
    };

    if (this.editableUser.phone) {
      updateData.phone = this.editableUser.phone;
    }

    if (this.editableUser.password) {
      updateData.password = this.editableUser.password;
    }

    // Appel à l'API pour mettre à jour l'utilisateur
    const sub = this.userService.updateUser(userId, updateData).subscribe({
      next: (updatedUser) => {
        console.log('Profil mis à jour avec succès:', updatedUser);
        this.user = { ...updatedUser }; // Créer une nouvelle référence pour s'assurer que les changements sont détectés
        this.savingProfile = false;
        this.isEditMode = false;
        this.successMessage = 'Votre profil a été mis à jour avec succès';

        // Afficher le message de succès pendant quelques secondes
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);

        // Si l'email a été modifié, une nouvelle connexion pourrait être nécessaire
        if (this.editableUser.email !== updatedUser.email) {
          this.successMessage +=
            '. Vous devrez peut-être vous reconnecter avec votre nouvel email.';
        }

        // Si un nouveau token est disponible dans la réponse (si inclus dans la structure étendue)
        const anyUser = updatedUser as any;
        if (anyUser && anyUser.token) {
          localStorage.setItem('token', anyUser.token);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        this.savingProfile = false;
        this.editError =
          error.error?.message ||
          'Impossible de mettre à jour le profil. Veuillez réessayer.';
      },
    });

    this.subscriptions.push(sub);
  }
  /**
   * Annule l'édition du profil et revient au mode affichage
   */
  cancelEdit(): void {
    this.isEditMode = false;
    this.editError = null;
    this.successMessage = null;
    // Réinitialiser les données éditables
    this.editableUser = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
    };
    console.log('Edition du profil annulée');
  }

  /**
   * Demander confirmation et supprimer le profil
   */
  deleteProfile(): void {
    if (!this.canDeleteProfile) {
      console.warn('Tentative de suppression du profil sans permission');
      return;
    }

    if (
      !confirm(
        'Êtes-vous sûr de vouloir supprimer votre profil ? Cette action est irréversible.'
      )
    ) {
      return;
    }

    const userId = this.getUserId();
    if (!userId) {
      this.error = "Impossible de récupérer l'ID utilisateur";
      return;
    }

    // Appel à l'API pour supprimer le compte
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        console.log('Profil supprimé avec succès');
        this.authService.logout(); // Déconnexion après suppression
        this.router.navigate(['/']); // Redirection vers la page d'accueil
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du profil:', error);
        this.error = 'Impossible de supprimer le profil. Veuillez réessayer.';
      },
    });
  }
}
