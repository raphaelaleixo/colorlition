import '@mui/material/styles';
import '@mui/material/Button';

declare module '@mui/material/styles' {
  interface Palette {
    claim: Palette['primary'];
    rule: {
      hair: string;
      strong: string;
      ink: string;
    };
  }
  interface PaletteOptions {
    claim?: PaletteOptions['primary'];
    rule?: {
      hair: string;
      strong: string;
      ink: string;
    };
  }
}

// Allow <Button color="claim" /> usage.
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    claim: true;
  }
}
