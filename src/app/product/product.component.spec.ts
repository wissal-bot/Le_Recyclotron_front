/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductComponent } from './product.component';

// Test d'intégration : vérifie que le composant peut être créé et rendu
// Test unitaire : vérifie l'appel de ngOnInit

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductComponent);
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
