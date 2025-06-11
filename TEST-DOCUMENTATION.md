# Le Recyclotron Front - Tests Documentation

## Overview

This document provides information about the Angular unit tests in the Le Recyclotron frontend project, including test setup, common patterns, and troubleshooting tips.

## Test Structure

Tests in this project follow the standard Angular testing pattern:

- Each component has a `.spec.ts` file alongside its implementation
- Services have their own `.spec.ts` files
- Tests are written using Jasmine and Karma

## Common Test Setup Patterns

### Component Tests

For standalone components, the basic test setup involves:

```typescript
TestBed.configureTestingModule({
  imports: [
    RouterTestingModule, // For components that use the Router
    ReactiveFormsModule, // For components that use Angular Forms
    HttpClientTestingModule, // For components that depend on services that use HttpClient
    ComponentUnderTest, // The standalone component being tested
  ],
  providers: [
    // Mock services and dependencies
    { provide: ServiceName, useValue: mockService },
  ],
}).compileComponents();
```

### Service Tests

For services, the basic test setup involves:

```typescript
TestBed.configureTestingModule({
  imports: [
    HttpClientTestingModule, // If the service makes HTTP requests
  ],
  providers: [ServiceUnderTest],
}).compileComponents();
```

## Mocking Dependencies

### Mock Services

```typescript
let mockService = jasmine.createSpyObj("ServiceName", ["methodName1", "methodName2"], { propertyName: propertyValue });
```

For Observable properties, use `BehaviorSubject` to allow updating values during tests:

```typescript
let valueSubject = new BehaviorSubject<boolean>(false);
let mockService = jasmine.createSpyObj("ServiceName", ["methodName1", "methodName2"], { valueStream$: valueSubject.asObservable() });
```

### Mock Components

```typescript
@Component({
  selector: "app-component-name",
  standalone: true,
  template: "<div>Mock Component</div>",
})
class MockComponent {}
```

## Common Test Patterns

### Testing Component Creation

```typescript
it("should create", () => {
  expect(component).toBeTruthy();
});
```

### Testing UI Element Presence

```typescript
it("should display specific element", () => {
  const compiled = fixture.nativeElement as HTMLElement;
  expect(compiled.querySelector(".selector")).toBeTruthy();
});
```

### Testing Form Validation

```typescript
it("should validate form input", () => {
  component.form.controls["field"].setValue("value");
  expect(component.form.valid).toBeTruthy();
});
```

### Testing Service Calls

```typescript
it("should call service method", () => {
  mockService.method.and.returnValue(of({}));
  component.triggerServiceCall();
  expect(mockService.method).toHaveBeenCalled();
});
```

## Recent Fixes

### Moving to Standalone Components

Tests have been updated to use imports instead of declarations:

```typescript
// Old approach
TestBed.configureTestingModule({
  declarations: [ComponentName],
  providers: [...]
})

// New approach
TestBed.configureTestingModule({
  imports: [ComponentName],
  providers: [...]
})
```

### HttpClient Dependencies

Added HttpClientTestingModule to tests that depend on services using HttpClient:

```typescript
TestBed.configureTestingModule({
  imports: [HttpClientTestingModule, ...],
  ...
})
```

### Observable Mocking

For components that subscribe to observables in services:

```typescript
let isLoggedInSubject = new BehaviorSubject<boolean>(false);
let authServiceMock = jasmine.createSpyObj("Api_authService", ["isLoggedIn", "getUserFromToken"], { isLoggedIn$: isLoggedInSubject.asObservable() });

// Later in test
isLoggedInSubject.next(true); // Update observable value
```

### RouterTestingModule

For components that use Router, ActivatedRoute, etc.:

```typescript
TestBed.configureTestingModule({
  imports: [RouterTestingModule, ...],
  ...
})
```

## Running Tests

To run all tests:

```bash
npm test
```

To run tests once with ChromeHeadless:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

To run a specific test file:

```bash
npm test -- --include=src/app/component-name/component-name.component.spec.ts
```

## Troubleshooting Common Issues

### Missing HttpClient Provider

Error: `NullInjectorError: No provider for HttpClient!`

Fix: Add HttpClientTestingModule to the imports of your TestBed configuration.

### Missing Router or ActivatedRoute

Error: `NullInjectorError: No provider for ActivatedRoute!`

Fix: Add RouterTestingModule to the imports of your TestBed configuration.

### Method Not a Function

Error: `TypeError: service.method is not a function`

Fix: Make sure your mock service properly implements all required methods.

### Cannot Read Properties of Undefined

Error: `TypeError: Cannot read properties of undefined (reading 'setValue')`

Fix: Ensure form controls are properly initialized before accessing them.

### Handling Observables in Tests

For components that subscribe to observables in their initialization, make sure your mock observables emit values before component initialization or create a way to trigger emissions during the test.
