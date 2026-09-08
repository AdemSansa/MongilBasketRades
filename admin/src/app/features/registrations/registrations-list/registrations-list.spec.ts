import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationsList } from './registrations-list';

describe('RegistrationsList', () => {
  let component: RegistrationsList;
  let fixture: ComponentFixture<RegistrationsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationsList],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
