import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-politique',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="auth-container">
      <div class="auth-card">
        <h2>Lorem Ipsum</h2>
        <div class="text-content">
          <p>Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l'imprimerie depuis les années 1</p>
        </div>
      </div>
    </section>
  `
})
export class PolitiqueComponent {}