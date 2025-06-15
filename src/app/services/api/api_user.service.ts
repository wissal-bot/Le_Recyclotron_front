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
    return this.http.get<Payment[]>(`${this.API_URL}/users/${id}/payments`);
  }

  getUserRegistrations(id: string): Observable<Registration[]> {
    return this.http.get<Registration[]>(
      `${this.API_URL}/users/${id}/registrations`
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
