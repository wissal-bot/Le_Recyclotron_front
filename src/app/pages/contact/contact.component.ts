import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

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
