import { Component } from '@angular/core';

@Component({
  selector: 'app-user-events',
  templateUrl: 'user-events.components.html',
  styleUrls: ['user-events.components.css']
})
export class UserEventsComponent {
  eventCards = [
    { id: 1, imagePrefix: '' },
    { id: 2, imagePrefix: '-1' },
    { id: 3, imagePrefix: '-2' }
  ];

  footerLinks = [
    { text: 'Acceuil', className: 'w-[170px]' },
    { text: 'Contact', className: 'w-[170px]' },
    { text: 'Politique et confidentialité', className: 'w-[346px]' },
    { text: 'CGU', className: 'w-[117px]' }
  ];

  socialIcons = [
    {
      src: '/3721672-instagram-108066-1.png',
      alt: 'Element instagram',
      className: 'w-[63px] h-[63px] top-[5px] left-0'
    },
    {
      src: '/facebook-icon-icons-com-53612-1.png',
      alt: 'Facebook icon icons',
      className: 'w-[53px] h-[53px] top-2.5 left-[74px]'
    },
    {
      src: '/linkedin-socialnetwork-17441-1.png',
      alt: 'Linkedin',
      className: 'w-[59px] h-[59px] top-[7px] left-0'
    },
    {
      src: '/twitter-x-new-logo-square-x-icon-256075-1.png',
      alt: 'Twitter x new logo',
      className: 'w-[102px] h-[73px] top-0 left-[46px]'
    }
  ];

  onLogout() {
    // Implement logout logic here
    console.log('Logout clicked');
  }

  onDetailsClick(eventId: number) {
    // Implement details click logic here
    console.log('Details clicked for event:', eventId);
  }
}