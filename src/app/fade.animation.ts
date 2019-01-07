import { trigger, animate, transition, style, query, group } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition('* => *', [
    query(':leave',
      [
        style({ opacity: 1, zIndex: 999 }),
        animate('1s', style({ opacity: 0 }))
      ], 
      { optional: true }
    )
  ])
]);