import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupsPlaceholder } from './groups-placeholder';

describe('GroupsPlaceholder', () => {
  let component: GroupsPlaceholder;
  let fixture: ComponentFixture<GroupsPlaceholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsPlaceholder],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsPlaceholder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
