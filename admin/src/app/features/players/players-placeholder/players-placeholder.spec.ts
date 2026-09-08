import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayersPlaceholder } from './players-placeholder';

describe('PlayersPlaceholder', () => {
  let component: PlayersPlaceholder;
  let fixture: ComponentFixture<PlayersPlaceholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayersPlaceholder],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayersPlaceholder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
