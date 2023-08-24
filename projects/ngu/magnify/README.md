# Magnify

Magnify directive helps to magnify the image on mouse hover. Currently it is only work if **z** is pressed and hover on image.

To implement this directive, you need to add **magnify** attribute to the image tag.

```ts
import { Magnify } from '@ngu/magnify';

@NgModule({
  Imports: [
    Magnify
  ]
})
export class AppModule {}
```

Or You can use it on standalone component.
```ts
import { Magnify } from '@ngu/magnify';

@Component({
  standalone: true,
  imports: [
    Magnify
  ],
  selector: 'app',
  ...
})
```

```html
<img src="image.jpg" magnify />

<!-- You can make the inline false (Default: true) -->
<img src="image.jpg" magnify [inline]="false" [scale]="3" />

<!-- You can specify different image too -->
<img src="thumnail.jpg" magnify="original.jpg" />
```
