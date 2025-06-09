import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Api_authService } from '../../services/api/api_auth.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styles: []
})
export class EventDetailsComponent implements OnInit {
  event: any;
  isPastEvent: boolean = false;
  isLoggedIn: boolean = false;
  hasClientRole: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private authService: Api_authService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.hasClientRole = this.authService.hasRole('CLIENT');

    this.route.paramMap.subscribe(params => {
      const eventId = Number(params.get('id'));
      this.loadEventDetails(eventId);
    });
  }

  loadEventDetails(id: number): void {
    this.eventService.getEventById(id).subscribe(event => {
      this.event = event;
      // Check if the event date is in the past
      this.isPastEvent = new Date(event.date) < new Date();
    });
  }
}
