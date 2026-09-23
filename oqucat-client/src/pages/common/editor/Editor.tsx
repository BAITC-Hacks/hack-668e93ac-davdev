import { Editor } from '@monaco-editor/react'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { useColorScheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useThemeColors } from '@/utils/useThemeColors'

const LANGUAGE_OPTIONS = [
  {
    id: 'javascript',
    extension: 'js',
    label: 'common:editor.languages.javascript',
  },
  {
    id: 'typescript',
    extension: 'ts',
    label: 'common:editor.languages.typescript',
  },
  {
    id: 'python',
    extension: 'py',
    label: 'common:editor.languages.python',
  },
  {
    id: 'json',
    extension: 'json',
    label: 'common:editor.languages.json',
  },
  {
    id: 'html',
    extension: 'html',
    label: 'common:editor.languages.html',
  },
  {
    id: 'css',
    extension: 'css',
    label: 'common:editor.languages.css',
  },
] as const

type EditorLanguage = (typeof LANGUAGE_OPTIONS)[number]['id']

const SAMPLE_CODE: Record<EditorLanguage, string> = {
  javascript: `const greet = (name) => {
  return \`Hello, \${name}!\`
}

console.log(greet('world'))`,
  typescript: `interface User {
  name: string
  isOnline: boolean
}

const user: User = {
  name: 'Vasya',
  isOnline: true,
}`,
  python: `def greet(name: str) -> str:
    return f"Hello, {name}!"


print(greet("world"))`,
  json: `{
  "name": "OquCat",
  "features": ["auth", "chat", "editor"],
  "active": true
}`,
  html: `<main class="greeting">
  <h1>Hello, world!</h1>
  <p>Welcome to the editor.</p>
</main>`,
  css: `.greeting {
  display: grid;
  place-items: center;
  min-height: 100vh;
  color: #3f51b5;
}`,
}

const EditorPage = () => {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const { mode, systemMode } = useColorScheme()
  const [language, setLanguage] = useState<EditorLanguage>('javascript')
  const [codeByLanguage, setCodeByLanguage] =
    useState<Record<EditorLanguage, string>>(SAMPLE_CODE)

  const resolvedMode = mode === 'system' ? systemMode : mode
  const editorTheme = resolvedMode === 'dark' ? 'vs-dark' : 'light'
  const selectedOption =
    LANGUAGE_OPTIONS.find((option) => option.id === language) ??
    LANGUAGE_OPTIONS[0]

  const handleLanguageChange = (event: SelectChangeEvent<EditorLanguage>) => {
    setLanguage(event.target.value)
  }

  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) {
      return
    }

    setCodeByLanguage((current) => ({
      ...current,
      [language]: value,
    }))
  }

  return (
    <Paper
      elevation={8}
      sx={{
        width: 1,
        maxWidth: 1100,
        overflow: 'hidden',
        border: `1px solid ${colors.divider}`,
        borderRadius: 3,
        backgroundColor: colors.paper,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          minHeight: 52,
          px: 2,
          py: 1,
          borderBottom: `1px solid ${colors.divider}`,
          backgroundColor: colors.background,
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
        }}
      >
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center' }}>
          <Stack direction="row" aria-hidden="true" sx={{ gap: 0.75 }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
              <Box
                key={color}
                sx={{
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  backgroundColor: color,
                }}
              />
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {`${selectedOption.id}.${selectedOption.extension}`}
          </Typography>
        </Stack>

        <FormControl size="small" sx={{ minWidth: { xs: 1, sm: 180 } }}>
          <InputLabel id="editor-language-label">
            {t('common:editor.language')}
          </InputLabel>
          <Select<EditorLanguage>
            labelId="editor-language-label"
            value={language}
            label={t('common:editor.language')}
            onChange={handleLanguageChange}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {t(option.label)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Editor
        height="min(70vh, 760px)"
        language={language}
        theme={editorTheme}
        value={codeByLanguage[language]}
        onChange={handleCodeChange}
        options={{
          automaticLayout: true,
          fontLigatures: true,
          minimap: { enabled: false },
          padding: { top: 16 },
          scrollBeyondLastLine: true,
          roundedSelection: false,
          tabSize: 2,
        }}
      />
    </Paper>
  )
}

export default EditorPage
