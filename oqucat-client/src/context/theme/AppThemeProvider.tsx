import { lightGreen, pink } from '@mui/material/colors'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const font = 'Play, sans-serif'

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: lightGreen,
        secondary: pink,
      },
    },

    dark: {
      palette: {
        primary: lightGreen,
        secondary: pink,
      },
    },
  },

  typography: {
    fontFamily: font,
    fontSize: 16,
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '1rem',
    },
    button: {
      fontSize: '1rem',
    },
    subtitle2: {
      fontSize: '1rem',
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: font,
          fontSize: '1rem',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          fontFamily: font,
        },
      },
    },

    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: font,
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: font,
          fontSize: '1rem',
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: font,
          fontSize: '1rem',
        },
      },
    },

    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontFamily: font,
          fontSize: '1rem',
        },
      },
    },
  },
})

export const AppThemeProvider = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <ThemeProvider theme={theme} defaultMode="system" noSsr>
    {children}
  </ThemeProvider>
)
