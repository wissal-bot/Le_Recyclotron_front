import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';

// Test d'intégration : vérifie que le composant peut être créé et rendu
// Test unitaire : vérifie l'appel de ngOnInit

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test d'intégration : création du composant
  it('should create', () => {
    // Vérifie que le composant est bien instancié
    expect(component).toBeTruthy();
  });

  // Test unitaire : ngOnInit ne doit pas lever d'erreur
  it('should call ngOnInit without error', () => {
    // Vérifie que ngOnInit peut être appelé sans erreur
    expect(() => component.ngOnInit()).not.toThrow();
  });
});
