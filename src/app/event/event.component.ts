import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="event-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./event.component.css'],
})
export class EventComponent {
  // This component serves as the main container for the event feature
  // All event functionality is delegated to child components
}
