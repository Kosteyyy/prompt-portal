import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="bar"><div class="bar__fill"
      [style.width.%]="max ? (value / max) * 100 : 0"></div></div>
  `,
})
export class ProgressBarComponent {
  @Input() value = 0;
  @Input() max = 1;
}