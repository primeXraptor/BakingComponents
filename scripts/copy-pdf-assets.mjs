import {cp,mkdir} from 'node:fs/promises';
await mkdir('dist/pdf-assets',{recursive:true});
await cp('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','dist/pdf-assets/pdf.worker.min.mjs');
for(const folder of ['cmaps','standard_fonts','wasm']) await cp(`node_modules/pdfjs-dist/${folder}`,`dist/pdf-assets/${folder}`,{recursive:true});

await cp('node_modules/pdfjs-dist/LICENSE','dist/pdf-assets/LICENSE.pdfjs');
