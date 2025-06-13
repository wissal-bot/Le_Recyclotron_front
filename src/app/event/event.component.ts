import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Api_eventService } from '../services/api/api_event.service';
import { Event } from '../../interfaces/event.interface';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
})
export class EventComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  error: string | null = null;
  currentDate = new Date();
  selectedYear: number;
  selectedMonth: number;
  calendar: any[][] = [];
  weekdays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  months = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];
  upcomingEvents: Event[] = []; // New array for filtered upcoming events

  constructor(private eventService: Api_eventService) {
    this.selectedYear = this.currentDate.getFullYear();
    this.selectedMonth = this.currentDate.getMonth();
  }

  ngOnInit(): void {
    this.loadEvents();
    this.generateCalendar();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = null;

    this.eventService.getAllEvents().subscribe({
      next: (events: any) => {
        this.events = events.data;
        this.loading = false;
        this.generateCalendar();
        this.filterUpcomingEvents();
      },
      error: () => {
        this.error = 'Erreur lors du chargement des événements.';
        this.loading = false;
      }
    });
  }

  // Filter events for "Événements à venir" section
  filterUpcomingEvents(): void {
    const now = new Date();

    // Only include events from the current month that haven't passed yet
    this.upcomingEvents = this.events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate >= now && // Event is in the future
        eventDate.getMonth() === this.selectedMonth && // Event is in the current selected month
        eventDate.getFullYear() === this.selectedYear // Event is in the current selected year
      );
    });

    // Sort events by date (closest first)
    this.upcomingEvents.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }

  // Navigate to previous month
  previousMonth(): void {
    if (this.selectedMonth === 0) {
      this.selectedMonth = 11;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.loadEvents();
    this.filterUpcomingEvents(); // Update filtered events after changing month
  }

  // Navigate to next month
  nextMonth(): void {
    if (this.selectedMonth === 11) {
      this.selectedMonth = 0;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.loadEvents();
    this.filterUpcomingEvents(); // Update filtered events after changing month
  }

  // Generate calendar grid for the selected month
  generateCalendar(): void {
    this.calendar = [];
    const firstDay = new Date(this.selectedYear, this.selectedMonth, 1);
    const lastDay = new Date(this.selectedYear, this.selectedMonth + 1, 0);

    // Create weekday headers
    let startingDayOfWeek = firstDay.getDay();
    let monthLength = lastDay.getDate();

    // Calculate the number of weeks needed
    const numWeeks = Math.ceil((startingDayOfWeek + monthLength) / 7);

    let day = 1;
    for (let i = 0; i < numWeeks; i++) {
      const week: any[] = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startingDayOfWeek) || day > monthLength) {
          week.push(null);
        } else {
          const currentDate = new Date(
            this.selectedYear,
            this.selectedMonth,
            day
          );
          const eventsForDay = this.events.filter((event) => {
            const eventDate = new Date(event.date);
            return (
              eventDate.getDate() === day &&
              eventDate.getMonth() === this.selectedMonth &&
              eventDate.getFullYear() === this.selectedYear
            );
          });

          week.push({
            day: day,
            isToday: this.isToday(currentDate),
            events: eventsForDay,
          });
          day++;
        }
      }
      this.calendar.push(week);
    }
  }
  // Format date for display
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(date).toLocaleDateString('fr-FR', options);
  }

  // Check if a date is today
  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  // Format date for display
  formatEventTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
