import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepairerComponent } from './repairer.component';

describe('RepairerComponent', () => {
  let component: RepairerComponent;
  let fixture: ComponentFixture<RepairerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RepairerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(RepairerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
