import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { ClickOutsideDirective } from './click-outside.directive';

describe('ClickOutsideDirective', () => {
  let directive: ClickOutsideDirective;
  let elementRef: ElementRef;

  beforeEach(() => {
    elementRef = { nativeElement: document.createElement('div') } as ElementRef;
    directive = new ClickOutsideDirective(elementRef);
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  it('should emit clickOutside when clicking outside', () => {
    spyOn(directive.clickOutside, 'emit');
    directive.onClick(document.createElement('span'));
    expect(directive.clickOutside.emit).toHaveBeenCalled();
  });

  it('should not emit clickOutside when clicking inside', () => {
    spyOn(directive.clickOutside, 'emit');
    directive.onClick(elementRef.nativeElement);
    expect(directive.clickOutside.emit).not.toHaveBeenCalled();
  });
});
