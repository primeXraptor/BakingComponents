import {readFile,writeFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import ts from 'typescript';
const root=path.resolve('src/styled-dashboard/source');
const hash=text=>createHash('sha256').update(text).digest('hex');
function visualAttributes(text,file) {const ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),values=[];function walk(node){if(ts.isJsxAttribute(node) && ['className','style'].includes(node.name.getText(ast)))values.push(node.getText(ast));ts.forEachChild(node,walk);}walk(ast);return values.join('\n');}
async function files(dir){const result=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await files(p));else result.push(p);}return result;}
const manifestPath='src/styled-dashboard/source-provenance.json';
if(process.argv[2]==='--record') {
 const original=path.resolve(process.argv[3] || '/workspace/mmu-main/src'), entries=[];
 for(const file of await files(root)) {
 const relative=path.relative(root,file).replaceAll(path.sep,'/');
 if(!['.tsx','.css'].includes(path.extname(file)))continue;
 let text;
 if(relative.endsWith('/KunchanadaManager.tsx') || relative.endsWith('/DashboardMessagesManager.tsx')) {
 text=await readFile(path.join(original,'components/admin/AdminManagers.tsx'),'utf8');
 text=relative.endsWith('/KunchanadaManager.tsx') ? text.slice(text.indexOf('function contestantCategoryLabel'),text.indexOf('function AlbumForm')) : text.slice(text.indexOf('export function MessagesManager'));
 }else {try{text=await readFile(path.join(original,relative),'utf8');}catch{continue;}}
 const kind=file.endsWith('.css') ? 'css' : 'jsx-visual-attributes';
 const fingerprint=hash(kind==='css' ? text : visualAttributes(text,file));
 entries.push({file:relative,kind,sha256:fingerprint});
 }
 await writeFile(manifestPath,JSON.stringify({repository:'primeXraptor/mmu-main',commit:'123804276c7ccc47a8afe1e94448a33dce0d3523',description:'Original CSS bytes and JSX class/style attributes. Branding props and runtime adapters are deliberate changes.',entries},null,2)+'\n');
}
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
for(const entry of manifest.entries){const file=path.join(root,entry.file),text=await readFile(file,'utf8'),actual=hash(entry.kind==='css' ? text : visualAttributes(text,file));if(actual!==entry.sha256)throw new Error(`Source visual parity failed: ${entry.file}`);}
console.log(`Source parity passed: ${manifest.entries.length} original CSS / JSX visual-attribute fingerprints match ${manifest.commit}.`);
