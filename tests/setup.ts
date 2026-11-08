import cssEscape from "css.escape";
import { vi } from 'vitest';
Object.defineProperty(window, 'matchMedia', { value: vi.fn(() => ({ matches: true, addEventListener() {}, removeEventListener() {} })) });

Object.defineProperty(globalThis, "CSS", { value: { escape: cssEscape }, configurable: true });
