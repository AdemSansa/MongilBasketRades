import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardShell } from './dashboard-shell';

describe('DashboardShell', () => {
  let component: DashboardShell;
  let fixture: ComponentFixture<DashboardShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardShell],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
