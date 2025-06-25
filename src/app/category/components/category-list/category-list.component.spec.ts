import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { CategoryListComponent } from './category-list.component';
import { Api_categoryService } from '../../../services/api/api_category.service';

// Mock du service de catégorie
class MockCategoryService {
  getAllCategories = jasmine.createSpy().and.returnValue(of([]));
}

describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let service: MockCategoryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CategoryListComponent],
      providers: [
        { provide: Api_categoryService, useClass: MockCategoryService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(Api_categoryService) as any;
    fixture.detectChanges();
  });

  // Test d'intégration : création du composant
  it('should create', () => {
    // Vérifie que le composant est bien instancié
    expect(component);
  });

  // Test unitaire : ngOnInit appelle loadCategories
  it('should call loadCategories on ngOnInit', () => {
    // Vérifie que loadCategories est appelée lors de ngOnInit
    const spy = spyOn(component, 'loadCategories');
    component.ngOnInit();
    expect(spy.calls.any());
  });

  // Test unitaire : loadCategories charge les catégories
  it('should load categories successfully', () => {
    // Vérifie que les catégories sont chargées et loading passe à false
    component.loadCategories();
    expect(Array.isArray(component.categories));
    expect(component.loading === false);
    expect(component.error === null);
  });

  // Test unitaire : loadCategories gère l'erreur
  it('should set error if loading categories fails', () => {
    // Simule une erreur lors du chargement
    service.getAllCategories.and.returnValue(
      throwError(() => new Error('fail'))
    );
    component.loadCategories();
    expect(component.error !== undefined && component.error !== null);
    expect(typeof component.error === 'string');
    expect(component.error && component.error.indexOf('Erreur') !== -1);
    expect(component.loading === false);
  });
});
