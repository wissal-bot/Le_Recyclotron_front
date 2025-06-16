import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, CreateUser } from '../../../interfaces/user.interface';
import { Payment } from '../../../interfaces/payment.interface';
import { Registration } from '../../../interfaces/registration.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api_userService {
  private readonly API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  createUser(createUser: CreateUser, roles: number[]): Observable<User> {
    return this.http
      .post<any>(`${this.API_URL}/users`, { createUser, roles })
      .pipe(
        map((response: any) => {
          // Si l'API renvoie les données directement ou dans un champ data
          const createdUser = response.data || response;
          return this.mapToUserModel(createdUser);
        }),
        catchError((error) => {
          console.error(`Erreur lors de la création de l'utilisateur:`, error);
          return throwError(
            () => new Error(`Erreur lors de la création de l'utilisateur`)
          );
        })
      );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<any>(`${this.API_URL}/users`).pipe(
      map((response: any) => {
        // Vérifier si la réponse est un tableau
        if (Array.isArray(response)) {
          return response.map((user: any) => this.mapToUserModel(user));
        } else if (response && response.data && Array.isArray(response.data)) {
          // Si l'API renvoie { data: [...] }
          return response.data.map((user: any) => this.mapToUserModel(user));
        }
        console.error('Format de réponse API inattendu:', response);
        return [];
      }),
      catchError((error) => {
        console.error(
          'Erreur lors de la récupération des utilisateurs:',
          error
        );
        return throwError(
          () => new Error('Erreur lors de la récupération des utilisateurs')
        );
      })
    );
  }

  // Helper pour mapper les données reçues au modèle User
  private mapToUserModel(userData: any): User {
    // Vérifier si userData est défini
    if (!userData) {
      console.error('Données utilisateur non définies');
      return this.createEmptyUser();
    }

    // Log pour déboguer la structure des données reçues
    console.log('Structure de données utilisateur reçue:', userData);

    try {
      // Mapper en fonction de la structure des données reçues
      const user: User = {
        id: userData.id?.toString() || '',
        first_name: userData.first_name || userData.firstName || '',
        last_name: userData.last_name || userData.lastName || '',
        email: userData.email || '',
        roles: [],
      };

      // Traiter les rôles avec une validation plus robuste
      if (Array.isArray(userData.roles)) {
        user.roles = userData.roles.map((role: any) => {
          // S'assurer que l'ID est un nombre
          const roleId =
            typeof role.id === 'number'
              ? role.id
              : typeof role.id === 'string'
              ? parseInt(role.id) || 0
              : 0;

          return {
            id: roleId,
            name: role.name || role.roleName || 'Rôle inconnu',
          };
        });
      } else {
        console.warn("Aucun rôle trouvé pour l'utilisateur:", userData.id);
      }

      return user;
    } catch (error) {
      console.error('Erreur lors du mapping des données utilisateur:', error);
      return this.createEmptyUser();
    }
  }

  // Créer un utilisateur vide en cas d'erreur
  private createEmptyUser(): User {
    return {
      id: '',
      first_name: '',
      last_name: '',
      email: '',
      roles: [],
    };
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<any>(`${this.API_URL}/users/${id}`).pipe(
      map((response: any) => {
        // Si l'API renvoie les données directement ou dans un champ data
        const userData = response.data || response;
        return this.mapToUserModel(userData);
      }),
      catchError((error) => {
        console.error(
          `Erreur lors de la récupération de l'utilisateur ${id}:`,
          error
        );
        return throwError(
          () =>
            new Error(`Erreur lors de la récupération de l'utilisateur ${id}`)
        );
      })
    );
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http.put<any>(`${this.API_URL}/users/${id}`, userData).pipe(
      map((response: any) => {
        // Si l'API renvoie les données directement ou dans un champ data
        const updatedUser = response.data || response;
        return this.mapToUserModel(updatedUser);
      }),
      catchError((error) => {
        console.error(
          `Erreur lors de la mise à jour de l'utilisateur ${id}:`,
          error
        );
        return throwError(
          () =>
            new Error(`Erreur lors de la mise à jour de l'utilisateur ${id}`)
        );
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${id}`);
  }

  addUserRoles(userId: string, roles: number[]): Observable<User> {
    console.log(`Envoi des rôles à l'API pour l'utilisateur ${userId}:`, roles);
    return this.http
      .post<any>(`${this.API_URL}/users/${userId}/roles`, {
        roles,
      })
      .pipe(
        map((response: any) => {
          console.log(`Réponse de l'API pour l'ajout de rôles:`, response);
          // Si l'API renvoie les données directement ou dans un champ data
          const userData = response.data || response;
          return this.mapToUserModel(userData);
        }),
        catchError((error) => {
          console.error(
            `Erreur lors de l'ajout des rôles pour l'utilisateur ${userId}:`,
            error
          );
          return throwError(
            () =>
              new Error(
                `Erreur lors de l'ajout des rôles pour l'utilisateur ${userId}`
              )
          );
        })
      );
  }

  // Méthode spécifique pour supprimer un rôle d'un utilisateur
  removeRoleFromUser(userId: string, roleId: string): Observable<void> {
    console.log(
      `Suppression du rôle ${roleId} pour l'utilisateur ${userId} via removeRoleFromUser`
    );
    return this.http
      .delete<void>(`${this.API_URL}/users/${userId}/roles/${roleId}`)
      .pipe(
        catchError((error) => {
          console.error(
            `Erreur lors de la suppression du rôle ${roleId} pour l'utilisateur ${userId}:`,
            error
          );
          return throwError(
            () => new Error(`Erreur lors de la suppression du rôle ${roleId}`)
          );
        })
      );
  }

  getUserPayments(id: string): Observable<Payment[]> {
    console.log(`Appel API pour les paiements de l'utilisateur ${id}`);
    return this.http.get<any>(`${this.API_URL}/users/${id}/payments`).pipe(
      map((response: any) => {
        console.log('Réponse API brute des paiements:', response);

        // Gestion des différentes structures de réponse possibles
        let payments: any[] = [];

        if (Array.isArray(response)) {
          payments = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          payments = response.data;
        } else if (
          response &&
          response.payments &&
          Array.isArray(response.payments)
        ) {
          payments = response.payments;
        } else if (response && typeof response === 'object') {
          // Essayer de récupérer n'importe quelle propriété qui contient un tableau
          const possibleArrays = Object.values(response).filter((val) =>
            Array.isArray(val)
          );
          if (possibleArrays.length > 0) {
            // Prendre le premier tableau trouvé
            payments = possibleArrays[0] as any[];
            console.log(
              "Utilisation d'un tableau trouvé dans la réponse:",
              payments
            );
          } else {
            console.warn(
              'Aucun tableau trouvé dans la réponse pour les paiements'
            );
          }
        } else {
          console.warn(
            'Format de réponse API inattendu pour les paiements:',
            response
          );
        }

        // Si les paiements sont vides, tenter une approche différente
        if (payments.length === 0 && response && !Array.isArray(response)) {
          // Si la réponse est un objet unique, l'envelopper dans un tableau
          if (response.id || response.amount || response.status) {
            payments = [response];
            console.log("Traitement d'un paiement unique:", payments);
          }
        }

        console.log(`Paiements traités (${payments.length}):`, payments);
        return payments;
      }),
      catchError((error) => {
        console.error(
          `Erreur lors de la récupération des paiements pour l'utilisateur ${id}:`,
          error
        );
        return throwError(
          () => new Error(`Erreur lors de la récupération des paiements`)
        );
      })
    );
  }

  getUserRegistrations(id: string): Observable<Registration[]> {
    console.log(`Appel API pour les inscriptions de l'utilisateur ${id}`);
    return this.http.get<any>(`${this.API_URL}/users/${id}/registrations`).pipe(
      map((response: any) => {
        console.log('Réponse API brute des inscriptions:', response);

        // Gestion des différentes structures de réponse possibles
        let registrations: any[] = [];

        if (Array.isArray(response)) {
          registrations = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          registrations = response.data;
        } else if (
          response &&
          response.registrations &&
          Array.isArray(response.registrations)
        ) {
          registrations = response.registrations;
        } else if (response && typeof response === 'object') {
          // Essayer de récupérer n'importe quelle propriété qui contient un tableau
          const possibleArrays = Object.values(response).filter((val) =>
            Array.isArray(val)
          );
          if (possibleArrays.length > 0) {
            // Prendre le premier tableau trouvé
            registrations = possibleArrays[0] as any[];
            console.log(
              "Utilisation d'un tableau trouvé dans la réponse:",
              registrations
            );
          } else {
            console.warn(
              'Aucun tableau trouvé dans la réponse pour les inscriptions'
            );
          }
        } else {
          console.warn(
            'Format de réponse API inattendu pour les inscriptions:',
            response
          );
        }

        // Si les inscriptions sont vides, tenter une approche différente
        if (
          registrations.length === 0 &&
          response &&
          !Array.isArray(response)
        ) {
          // Si la réponse est un objet unique, l'envelopper dans un tableau
          if (response.id || response.seats || response.eventId) {
            registrations = [response];
            console.log("Traitement d'une inscription unique:", registrations);
          }
        }

        console.log(
          `Inscriptions traitées (${registrations.length}):`,
          registrations
        );
        return registrations;
      }),
      catchError((error) => {
        console.error(
          `Erreur lors de la récupération des inscriptions pour l'utilisateur ${id}:`,
          error
        );
        return throwError(
          () => new Error(`Erreur lors de la récupération des inscriptions`)
        );
      })
    );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/users/forgot-password`, {
      email,
    });
  }

  resetPassword(data: {
    email: string;
    tempCode: string;
    newPassword: string;
  }): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/users/reset-password`, data);
  }
}
