import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BoxGrid, boxGridStyles, LightBtn, HardBtn, PopUpModel, SearchPopUpModel, FilterDropdown, CardLinkBtn } from '../src';
function Demo() {
 const [open,setOpen]=useState(false), [search,setSearch]=useState(false), [filter,setFilter]=useState('all');
 return <main style={{maxWidth:1000,margin:'60px auto',padding:24,fontFamily:'system-ui',color:'var(--text-primary)'}}>
 <h1>BakingComponents</h1><p>React components extracted from MMU.</p>
 <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:32}}><HardBtn onClick={()=>setOpen(true)}>Open popup</HardBtn><LightBtn onClick={()=>setSearch(true)}>Search popup</LightBtn><LightBtn onClick={()=>{document.documentElement.classList.toggle('dark'); document.body.style.background='var(--page-background)';}}>Toggle theme</LightBtn></div>
 <BoxGrid columns={3}>{['Popups','Buttons','Grids'].map(title=><div key={title} className={boxGridStyles.cell}><h2 className={boxGridStyles.title}>{title}</h2><p className={boxGridStyles.subtitle}>Original MMU styles, reusable React components.</p></div>)}</BoxGrid>
 <div style={{marginTop:32}}><FilterDropdown value={filter} onChange={setFilter} label="Component type" options={[{value:'all',label:'All components'},{value:'buttons',label:'Buttons'}]}/><CardLinkBtn href="https://github.com/primeXraptor/mmu-main">Source repository</CardLinkBtn></div>
 <PopUpModel isOpen={open} onOpenChange={setOpen} label="Example popup"><h2>Reusable popup</h2><p>Supports a close footer, keyboard dismissal and mobile drag gestures.</p></PopUpModel>
 <SearchPopUpModel isOpen={search} onOpenChange={setSearch} label="Search components">{close=><div style={{padding:24}}><input aria-label="Search" placeholder="Search components…"/><LightBtn onClick={close}>Done</LightBtn></div>}</SearchPopUpModel>
 </main>;
}
createRoot(document.getElementById('root')!).render(<Demo/>);
