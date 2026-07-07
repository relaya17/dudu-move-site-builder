import { createTheme } from '@mui/material/styles';

// טופס הערכת המחיר (MovingEstimateForm) בנוי עם רכיבי MUI, בזמן שכל שאר האתר
// בנוי עם Tailwind/shadcn. בלי theme משלנו, MUI מרנדר בגופן וצבע ברירת המחדל
// שלו (Roboto, כחול #1976d2) שלא תואמים לשאר האתר (Open Sans, כחול Tailwind).
// ה-theme הזה רק מיישר גופן/צבע כדי שהטופס יראה חלק מאותו אתר - בלי לשנות
// מבנה, פריסה או עיצוב בפועל של רכיבי ה-MUI עצמם.
export const muiTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: '"Open Sans", sans-serif',
  },
  palette: {
    primary: {
      main: '#2563eb', // Tailwind blue-600 - אותו כחול שמשמש בכל שאר האתר
    },
  },
});
