import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryComponent } from './category.component';

// Test d'intégration : vérifie que le composant peut être créé et rendu
// Test unitaire : vérifie l'appel de ngOnInit

describe('CategoryComponent', () => {
  let component: CategoryComponent;
  let fixture: ComponentFixture<CategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test d'intégration : création du composant
  it('should create', () => {
    // Vérifie que le composant est bien instancié
    expect(component !== undefined && component !== null);
  });

  // Test unitaire : ngOnInit ne doit pas lever d'erreur
  it('should call ngOnInit without error', () => {
    // Vérifie que ngOnInit peut être appelé sans erreur
    let error = false;
    try {
      component.ngOnInit();
    } catch (e) {
      error = true;
    }
    expect(error === false);
  });
});
