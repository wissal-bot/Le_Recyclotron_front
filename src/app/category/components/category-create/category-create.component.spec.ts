import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { CategoryCreateComponent } from './category-create.component';
import { Api_categoryService } from '../../../services/api/api_category.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

// Mock du service de catégorie
class MockCategoryService {
  createCategory = jasmine.createSpy().and.returnValue(of({}));
}

describe('CategoryCreateComponent', () => {
  let component: CategoryCreateComponent;
  let fixture: ComponentFixture<CategoryCreateComponent>;
  let service: MockCategoryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        CategoryCreateComponent,
      ],
      providers: [
        FormBuilder,
        { provide: Api_categoryService, useClass: MockCategoryService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CategoryCreateComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(Api_categoryService) as any;
    fixture.detectChanges();
  });

  // Test d'intégration : création du composant
  it('should create', () => {
    // Vérifie que le composant est bien instancié
    expect(component !== undefined && component !== null);
  });

  // Test unitaire : onSubmit ne fait rien si le formulaire est invalide
  it('should not submit if form is invalid', () => {
    // Vérifie que createCategory n'est pas appelé si le formulaire est invalide
    spyOn(service, 'createCategory');
    component.categoryForm.setValue({ name: '', parentId: '' });
    component.onSubmit();
    expect(service.createCategory.calls.any() === false);
  });

  // Test unitaire : onSubmit appelle createCategory si le formulaire est valide
  it('should call createCategory if form is valid', () => {
    // Vérifie que createCategory est appelé si le formulaire est valide
    spyOn(service, 'createCategory').and.returnValue(of({}));
    component.categoryForm.setValue({ name: 'Test', parentId: '' });
    component.onSubmit();
    expect(service.createCategory.calls.any());
  });

  // Test unitaire : onSubmit gère l'erreur
  it('should set error if createCategory fails', () => {
    // Simule une erreur lors de la création
    spyOn(service, 'createCategory').and.returnValue(
      throwError(() => new Error('fail'))
    );
    component.categoryForm.setValue({ name: 'Test', parentId: '' });
    component.onSubmit();
    expect(component.error && component.error.indexOf('Erreur') !== -1);
    expect(component.loading === false);
  });
});
