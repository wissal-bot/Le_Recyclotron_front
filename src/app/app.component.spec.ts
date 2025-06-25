import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';

// Mock components pour isoler AppComponent
@Component({
  selector: 'app-header',
  standalone: true,
  template: '<div>Mock Header</div>',
})
class MockHeaderComponent {}

@Component({
  selector: 'app-footer',
  standalone: true,
  template: '<div>Mock Footer</div>',
})
class MockFooterComponent {}

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        AppComponent,
        MockHeaderComponent,
        MockFooterComponent,
      ],
    }).compileComponents();
  });

  // Test d'intégration : vérifie que le composant racine est créé
  it('should create the app', () => {
    // Vérifie que l'instance du composant racine existe
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Test d'intégration : vérifie la présence du router-outlet
  it('should have a router outlet', () => {
    // Vérifie que le template contient bien un <router-outlet>
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  // Test unitaire : vérifie la valeur du titre
  it('should have title "Le Recyclotron"', () => {
    // Vérifie que la propriété title est bien initialisée
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toBe('Le Recyclotron');
  });
});
