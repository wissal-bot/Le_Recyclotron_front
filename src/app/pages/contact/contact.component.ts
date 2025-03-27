import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  onSubmit() {
    // TODO: Implement contact form submission
    console.log('Formulaire soumis:', this.contactForm);
  }
}
