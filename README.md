# BakingComponents

Reusable React components extracted from `primeXraptor/mmu-main` at commit `0c5864da8c52045163a8a427d8c0cf803a1c8391`.

## Develop

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci --cache /tmp/baking-npm-cache
npm run dev
npm run typecheck
npm test
npm run build
```

The development server serves an interactive component gallery. The build creates an ES module library, TypeScript declarations and `dist/baking-components.css`. React and React DOM are peer dependencies (18 or 19).

## Use

Build the library and install its directory into a React app (`npm install /path/to/BakingComponents`). Import the CSS once at your app entry:

```tsx
import { useState } from 'react';
import { LightBtn, PopUpModel, BoxGrid, boxGridStyles } from 'baking-components';
import 'baking-components/styles.css';

export function Example() {
  const [open, setOpen] = useState(false);
  return <>
    <LightBtn onClick={() => setOpen(true)}>Open</LightBtn>
    <BoxGrid columns={2}>
      <div className={boxGridStyles.cell}>First cell</div>
      <div className={boxGridStyles.cell}>Second cell</div>
    </BoxGrid>
    <PopUpModel isOpen={open} onOpenChange={setOpen} label="Details">
      <h2>Details</h2>
      <p>Your content here.</p>
    </PopUpModel>
  </>;
}
```

## Components

| Export | Purpose |
| --- | --- |
| `LightBtn`, `HardBtn` | Soft/solid action buttons; passing `href` renders a native anchor |
| `BoxGrid`, `boxGridStyles` | Responsive 1–6 column grid with exported cell, icon, title and subtitle classes |
| `PopUpModel` | Controlled accessible dialog, mobile sheet gestures and close footer |
| `SearchPopUpModel` | Controlled search dialog; children may be a function receiving `close` |
| `CardLinkBtn` | Outlined link with optional logo and disabled state |
| `RightArrowBtnBlrbg` | Decorative arrow for a parent link |
| `FilterDropdown` | Animated typed option selector |

The original file names and component APIs are retained except that link props use standard anchor attributes and string URLs rather than Next.js routing props. Use your router's composition APIs for client-side navigation. Popup components require an accessible `label` or `labelledBy`.

Styles use CSS modules and do not require Tailwind. Global theme defaults are included in the CSS export; customize the variables from `src/theme.css` in your application stylesheet. Add `dark` to the `<html>` element for dark mode. Use `boxGridStyles` for grid content; column counts collapse responsively as in the source.

Site-specific news/event/authentication components, media players and components dependent on application providers are outside this extraction. The original `mmu-main` checkout remains unchanged.

## Attribution

Source: https://github.com/primeXraptor/mmu-main

The source project's proprietary terms are preserved in [NOTICE.md](NOTICE.md). The original README credits initial design to Dhanika (Valet.xyz), and subsequent development and design to Senuth Dayawansa (BreadCrumb Labs). No new open-source license is granted. The package is marked private to prevent accidental npm publication.
