import { createContext } from 'react';

// Dev/mock helper for ExitPollReveal manual advance. The page-level medium-card
// reveal in BigScreenView handles the regular draw flow, so `advanceTick` only
// nudges the exit poll overlay through its centered phase.
export type RevealControl = { advanceTick: number };
export const RevealControlContext = createContext<RevealControl | null>(null);
