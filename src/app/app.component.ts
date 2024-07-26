import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: ` <a href="/page-one" target="_blank">Page One</a>
    <br />
    <a href="/page-two" target="_blank">Page Two</a>
    <router-outlet />`,
})
export class AppComponent {
  title = 'angular-broadcasting';
}
