import React, { useState } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LightBtn, HardBtn, BoxGrid, boxGridStyles, PopUpModel, SearchPopUpModel, CardLinkBtn, FilterDropdown } from '../src';
afterEach(cleanup);
test('action buttons preserve button behavior and render native links', async () => {
 const click = vi.fn();
 render(<><LightBtn onClick={click}>Save</LightBtn><HardBtn href="/docs">Docs</HardBtn></>);
 await userEvent.click(screen.getByRole('button', { name: 'Save' }));
 expect(click).toHaveBeenCalledOnce();
 expect(screen.getByRole('button').getAttribute('type')).toBe('button');
 expect(screen.getByRole('link').getAttribute('href')).toBe('/docs');
});
test('grid forwards attributes and exposes cell styles', () => {
 render(<BoxGrid columns={2} aria-label="Features"><div className={boxGridStyles.cell}>One</div></BoxGrid>);
 expect(screen.getByLabelText('Features').className).toContain('twoColumns');
 expect(boxGridStyles.cell).toBeTruthy();
});
test('disabled card is not navigable', () => {
 render(<CardLinkBtn href="/private" isDisabled>Private</CardLinkBtn>);
 expect(screen.getByRole('link').getAttribute('aria-disabled')).toBe('true');
 expect(screen.getByRole('link').hasAttribute('href')).toBe(false);
});
test('popup closes through its footer and updates controlled state', async () => {
 function Example() { const [open, setOpen] = useState(true); return <PopUpModel isOpen={open} onOpenChange={setOpen} label="Example">Content</PopUpModel>; }
 render(<Example />);
 expect(screen.getByRole('dialog', { name: 'Example' })).toBeTruthy();
 await userEvent.click(screen.getByRole('button', { name: 'Close' }));
 await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});
test('search popup render callback can close the dialog', async () => {
 function Example() { const [open,setOpen] = useState(true); return <SearchPopUpModel isOpen={open} onOpenChange={setOpen} label="Search">{close => <button onClick={close}>Done</button>}</SearchPopUpModel>; }
 render(<Example />);
 await userEvent.click(screen.getByRole('button', { name: 'Done' }));
 await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});
test('filter selection reports the selected value', async () => {
 const change = vi.fn();
 render(<FilterDropdown value="all" label="Filter" onChange={change} options={[{value:'all',label:'All'},{value:'news',label:'News'}]} />);
 await userEvent.click(screen.getByRole('button', {name:'Filter'}));
 await userEvent.click(screen.getByText('News'));
 expect(change).toHaveBeenCalledWith('news');
});
