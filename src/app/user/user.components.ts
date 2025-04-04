import { Component } from '@angular/core';

@Component({
  selector: 'app-user',
  templateUrl: 'user.components.html',
  styleUrls: ['user.components.css']
})
export class UserComponent {
  footerLinks = [
    { text: "Acceuil", section: "top" },
    { text: "Contact", section: "top" },
    { text: "Politique et confidentialité", section: "bottom" },
    { text: "CGU", section: "bottom" }
  ];

  profileSections = [
    { title: "Mes évènements", isExpanded: false },
    { title: "Mes dons et mon adhésion", isExpanded: false },
    { title: "Mes informations personnels", isExpanded: false }
  ];

  socialMedia = [
    {
      name: "Instagram",
      src: "/3721672-instagram-108066-1.png",
      alt: "Element instagram"
    },
    {
      name: "Facebook",
      src: "/facebook-icon-icons-com-53612-1.png",
      alt: "Facebook icon icons"
    },
    {
      name: "LinkedIn",
      src: "/linkedin-socialnetwork-17441-1.png",
      alt: "Linkedin"
    },
    {
      name: "Twitter",
      src: "/twitter-x-new-logo-square-x-icon-256075-1.png",
      alt: "Twitter x new logo"
    }
  ];

  toggleAccordion(index: number): void {
    this.profileSections[index].isExpanded = !this.profileSections[index].isExpanded;
  }}