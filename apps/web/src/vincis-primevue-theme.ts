/**
 * Vincis Design System — PrimeVue Theme
 * ──────────────────────────────────────────────────────────────────
 * Tema construído sobre o Preset "Aura" do PrimeVue v4 (Styled Mode).
 * Sobrescreve apenas os design tokens necessários; todos os demais
 * comportamentos (acessibilidade, eventos, slots) permanecem intactos.
 *
 * COMO USAR
 * ──────────
 * // main.js
 * import { createApp } from 'vue'
 * import PrimeVue from 'primevue/config'
 * import VincisTheme from './vincis-primevue-theme.js'
 *
 * createApp(App)
 *   .use(PrimeVue, { theme: { preset: VincisTheme, options: { darkModeSelector: '.dark' } } })
 *   .mount('#app')
 *
 * DEPENDÊNCIAS
 * ──────────────
 * npm install primevue @primevue/themes
 *
 * Fonte base (coloque no <head> ou no seu CSS global):
 * 
 * 
 */

import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

// ─────────────────────────────────────────────────────────────────
// TOKENS PRIMITIVOS — Paleta Vincis
// ─────────────────────────────────────────────────────────────────
const color = {
  // Primária — Ouro Acadêmico
  primary:              '#735c00',
  primaryContainer:     '#d4af37',
  primaryFixedDim:      '#e9c349',
  primaryFixed:         '#ffe088',
  onPrimary:            '#ffffff',
  onPrimaryContainer:   '#554300',
  onPrimaryFixed:       '#241a00',
  inversePrimary:       '#e9c349',

  // Secundária — Cinza Sábio
  secondary:            '#5f5e5c',
  secondaryContainer:   '#e5e2de',
  onSecondary:          '#ffffff',
  onSecondaryContainer: '#656461',

  // Terciária
  tertiary:             '#595f67',
  tertiaryContainer:    '#aeb3bc',
  onTertiary:           '#ffffff',
  onTertiaryContainer:  '#40454d',

  // Superfícies (escuro = mais elevado / mais destaque)
  background:                '#fdf9f6',
  surface:                   '#fdf9f6',
  surfaceBright:             '#fdf9f6',
  surfaceDim:                '#ddd9d6',
  surfaceVariant:            '#e5e2df',
  surfaceContainerLowest:    '#ffffff',
  surfaceContainerLow:       '#f7f3f0',
  surfaceContainer:          '#f1edea',
  surfaceContainerHigh:      '#ebe7e4',
  surfaceContainerHighest:   '#e5e2df',
  inverseSurface:            '#31302f',
  inverseOnSurface:          '#f4f0ed',

  // On-surface
  onSurface:            '#1c1b1a',
  onSurfaceVariant:     '#4d4635',
  onBackground:         '#1c1b1a',

  // Outline
  outline:              '#7f7663',
  outlineVariant:       '#d0c5af',

  // Semânticas
  error:                '#ba1a1a',
  errorContainer:       '#ffdad6',
  onError:              '#ffffff',
  onErrorContainer:     '#93000a',

  success:              '#2e7d32',
  successContainer:     '#c8e6c9',
  onSuccess:            '#ffffff',

  warning:              '#e65100',
  warningContainer:     '#ffe0b2',
  onWarning:            '#ffffff',
}

// ─────────────────────────────────────────────────────────────────
// PRESET VINCIS
// ─────────────────────────────────────────────────────────────────
const VincisTheme = definePreset(Aura, {
  // ── Tokens semânticos globais do PrimeVue ───────────────────────
  semantic: {
    // Fontes
    fontFamily: "'Manrope', sans-serif",

    // Raios de borda
    borderRadius: {
      none: '0',
      xs:   '0.125rem',
      sm:   '0.25rem',   // DEFAULT
      md:   '0.375rem',
      lg:   '0.5rem',
      xl:   '0.75rem',
      '2xl':'1rem',
      full: '9999px',
    },

    // Paleta de cores primária (usada por todos os componentes)
    primary: {
      50:  color.primaryFixed,      // #ffe088
      100: color.primaryFixed,
      200: color.primaryFixedDim,   // #e9c349
      300: color.primaryFixedDim,
      400: color.primaryContainer,  // #d4af37
      500: color.primaryContainer,
      600: color.primary,           // #735c00
      700: color.primary,
      800: color.onPrimaryContainer,// #554300
      900: color.onPrimaryFixed,    // #241a00
      950: color.onPrimaryFixed,
    },

    // Surface tokens mapeados para o sistema de camadas Vincis
    colorScheme: {
      light: {
        primary: {
          color:          color.primary,
          contrastColor:  color.onPrimary,
          hoverColor:     color.onPrimaryContainer,
          activeColor:    color.onPrimaryFixed,
        },
        highlight: {
          background:     color.primaryContainer,
          focusBackground:color.primaryContainer,
          color:          color.onPrimaryContainer,
          focusColor:     color.onPrimaryContainer,
        },
        surface: {
          0:   color.surfaceContainerLowest,
          50:  color.surfaceContainerLow,
          100: color.surfaceContainer,
          200: color.surfaceContainerHigh,
          300: color.surfaceContainerHighest,
          400: color.surfaceVariant,
          500: color.outline,
          600: color.onSurfaceVariant,
          700: color.onSurface,
          800: color.inverseSurface,
          900: '#1a1917',
          950: '#0e0e0d',
        },
        mask: {
          background: 'rgba(28,27,26,0.45)',
          color:      color.inverseOnSurface,
        },
        formField: {
          background:          color.surfaceContainerLow,
          disabledBackground:  color.surfaceContainerHigh,
          filledBackground:    color.surfaceContainerLow,
          filledFocusBackground: color.surfaceContainerLowest,
          borderColor:         color.outlineVariant,
          hoverBorderColor:    color.outline,
          focusBorderColor:    color.primary,
          invalidBorderColor:  color.error,
          color:               color.onSurface,
          disabledColor:       color.outline,
          placeholderColor:    color.outline,
          invalidPlaceholderColor: color.error,
          floatLabelColor:     color.outline,
          floatLabelFocusColor:color.primary,
          floatLabelActiveColor:color.onSurfaceVariant,
          floatLabelInvalidColor: color.error,
          iconColor:           color.outline,
          shadow:              '0 0 0 2px rgba(115,92,0,0.14)',
        },
        text: {
          color:        color.onSurface,
          hoverColor:   color.primary,
          mutedColor:   color.secondary,
          hoverMutedColor: color.onSurface,
        },
        content: {
          background:       color.surfaceContainerLowest,
          hoverBackground:  color.surfaceContainer,
          borderColor:      `${color.outlineVariant}33`,  // /20
          color:            color.onSurface,
          hoverColor:       color.onSurface,
        },
        overlay: {
          select: {
            background:   color.surfaceContainerLowest,
            borderColor:  `${color.outlineVariant}26`,
            color:        color.onSurface,
          },
          popover: {
            background:   color.surfaceContainerLowest,
            borderColor:  `${color.outlineVariant}26`,
            color:        color.onSurface,
          },
          modal: {
            background:   color.surfaceContainerLowest,
            borderColor:  `${color.outlineVariant}26`,
            color:        color.onSurface,
          },
        },
        list: {
          option: {
            focusBackground:    color.surfaceContainer,
            selectedBackground: color.primaryContainer,
            selectedFocusBackground: `${color.primaryContainer}cc`,
            color:              color.onSurface,
            focusColor:         color.onSurface,
            selectedColor:      color.onPrimaryContainer,
            selectedFocusColor: color.onPrimaryContainer,
            icon: {
              color:      color.outline,
              focusColor: color.onSurface,
            },
          },
          optionGroup: {
            background: 'transparent',
            color:      color.secondary,
          },
        },
        navigation: {
          item: {
            focusBackground:    color.surfaceContainer,
            activeBackground:   color.primaryContainer,
            color:              color.secondary,
            focusColor:         color.onSurface,
            activeColor:        color.onPrimaryContainer,
            icon: {
              color:       color.secondary,
              focusColor:  color.onSurface,
              activeColor: color.onPrimaryContainer,
            },
          },
          submenuLabel: {
            background: 'transparent',
            color:      color.secondary,
          },
          submenuIcon: {
            color:      color.outline,
            focusColor: color.onSurface,
            activeColor:color.onPrimaryContainer,
          },
        },
      },

      // ── Dark mode (herda a lógica do Aura) ─────────────────────
      dark: {
        primary: {
          color:          color.primaryFixedDim,
          contrastColor:  color.onPrimaryFixed,
          hoverColor:     color.primaryFixed,
          activeColor:    color.onPrimaryFixed,
        },
        highlight: {
          background:     `${color.primaryContainer}29`,
          focusBackground:`${color.primaryContainer}40`,
          color:          color.primaryFixedDim,
          focusColor:     color.primaryFixed,
        },
        surface: {
          0:   '#18171a',
          50:  '#1f1e20',
          100: '#252426',
          200: '#2c2b2d',
          300: '#333134',
          400: '#3a383b',
          500: '#7f7663',
          600: '#a39c88',
          700: '#d0c5af',
          800: '#e5e2df',
          900: '#f1edea',
          950: color.surfaceContainerLowest,
        },
        mask: {
          background: 'rgba(0,0,0,0.60)',
          color:      color.inverseSurface,
        },
        formField: {
          background:          '#252426',
          disabledBackground:  '#2c2b2d',
          borderColor:         '#4a4840',
          hoverBorderColor:    '#7f7663',
          focusBorderColor:    color.primaryFixedDim,
          invalidBorderColor:  color.error,
          color:               '#f1edea',
          disabledColor:       '#7f7663',
          placeholderColor:    '#7f7663',
          shadow:              `0 0 0 2px ${color.primaryFixedDim}29`,
        },
        content: {
          background:       '#1f1e20',
          hoverBackground:  '#2c2b2d',
          borderColor:      '#3a383b',
          color:            '#f1edea',
          hoverColor:       '#ffffff',
        },
      },
    },
  },

  // ── Estilos por componente ──────────────────────────────────────
  components: {

    // ── Button ───────────────────────────────────────────────────
    button: {
      root: {
        borderRadius: '0.5rem',
        fontWeight:   '700',
        fontFamily:   "'Manrope', sans-serif",
        fontSize:     '0.875rem',
        paddingX:     '1.25rem',
        paddingY:     '0.625rem',
        gap:          '0.5rem',
        transitionDuration: '150ms',
        sm: {
          fontSize:  '0.75rem',
          paddingX:  '0.875rem',
          paddingY:  '0.5rem',
        },
        lg: {
          fontSize:  '1rem',
          paddingX:  '1.5rem',
          paddingY:  '0.75rem',
        },
      },
      colorScheme: {
        light: {
          root: {
            // Variante primary (padrão)
            primary: {
              background:       color.primary,
              hoverBackground:  color.onPrimaryContainer,
              activeBackground: color.onPrimaryFixed,
              borderColor:      'transparent',
              hoverBorderColor: 'transparent',
              activeBorderColor:'transparent',
              color:            color.onPrimary,
              hoverColor:       color.onPrimary,
              activeColor:      color.onPrimary,
              shadow:           '0 1px 3px rgba(115,92,0,0.25)',
            },
            // Variante secondary
            secondary: {
              background:       color.surfaceContainerHighest,
              hoverBackground:  color.surfaceContainerHigh,
              activeBackground: color.surfaceVariant,
              borderColor:      `${color.outlineVariant}66`,
              hoverBorderColor: `${color.outlineVariant}66`,
              activeBorderColor:`${color.outlineVariant}66`,
              color:            color.onSurface,
              hoverColor:       color.onSurface,
              activeColor:      color.onSurface,
            },
            // Variante success
            success: {
              background:       color.success,
              hoverBackground:  '#1b5e20',
              activeBackground: '#145214',
              borderColor:      'transparent',
              color:            color.onSuccess,
              hoverColor:       color.onSuccess,
              activeColor:      color.onSuccess,
            },
            // Variante danger
            danger: {
              background:       color.error,
              hoverBackground:  '#8b0000',
              activeBackground: '#6e0000',
              borderColor:      'transparent',
              color:            color.onError,
              hoverColor:       color.onError,
              activeColor:      color.onError,
            },
            // Variante warning
            warn: {
              background:       color.warning,
              hoverBackground:  '#bf360c',
              activeBackground: '#8f2100',
              borderColor:      'transparent',
              color:            color.onWarning,
              hoverColor:       color.onWarning,
              activeColor:      color.onWarning,
            },
            // Variante contrast (superfície escura → botão claro)
            contrast: {
              background:       color.inverseSurface,
              hoverBackground:  '#444342',
              activeBackground: '#5a5957',
              borderColor:      'transparent',
              color:            color.inverseOnSurface,
              hoverColor:       color.inverseOnSurface,
              activeColor:      color.inverseOnSurface,
            },
          },
          // Outlined
          outlined: {
            primary: {
              borderColor:      color.primary,
              hoverBackground:  `${color.primary}0d`,
              activeBackground: `${color.primary}1a`,
              color:            color.primary,
            },
            secondary: {
              borderColor:      `${color.outlineVariant}66`,
              hoverBackground:  color.surfaceContainer,
              activeBackground: color.surfaceContainerHigh,
              color:            color.onSurface,
            },
            success: {
              borderColor:      color.success,
              hoverBackground:  `${color.success}0d`,
              activeBackground: `${color.success}1a`,
              color:            color.success,
            },
            danger: {
              borderColor:      color.error,
              hoverBackground:  `${color.error}0d`,
              activeBackground: `${color.error}1a`,
              color:            color.error,
            },
            warn: {
              borderColor:      color.warning,
              hoverBackground:  `${color.warning}0d`,
              activeBackground: `${color.warning}1a`,
              color:            color.warning,
            },
          },
          // Text (ghost)
          text: {
            primary: {
              hoverBackground:  `${color.primary}0d`,
              activeBackground: `${color.primary}1a`,
              color:            color.primary,
              hoverColor:       color.primary,
              activeColor:      color.primary,
            },
            secondary: {
              hoverBackground:  color.surfaceContainer,
              activeBackground: color.surfaceContainerHigh,
              color:            color.secondary,
              hoverColor:       color.onSurface,
              activeColor:      color.onSurface,
            },
            danger: {
              hoverBackground:  `${color.error}0d`,
              activeBackground: `${color.error}1a`,
              color:            color.error,
              hoverColor:       color.error,
              activeColor:      color.error,
            },
          },
          // Link
          link: {
            color:       color.primary,
            hoverColor:  color.onPrimaryContainer,
            activeColor: color.onPrimaryFixed,
          },
        },
      },
    },

    // ── InputText / Textarea ──────────────────────────────────────
    inputtext: {
      root: {
        background:     color.surfaceContainerLow,
        disabledBackground: color.surfaceContainerHigh,
        filledBackground:   color.surfaceContainerLow,
        borderColor:    `${color.outlineVariant}66`,
        hoverBorderColor: color.outline,
        focusBorderColor: color.primary,
        invalidBorderColor: color.error,
        color:          color.onSurface,
        disabledColor:  color.outline,
        placeholderColor: color.outline,
        shadow:         '0 0 0 2px rgba(115,92,0,0)',
        focusShadow:    '0 0 0 2px rgba(115,92,0,0.18)',
        borderRadius:   '0.5rem',
        paddingX:       '1rem',
        paddingY:       '0.625rem',
        fontSize:       '0.875rem',
        fontFamily:     "'Manrope', sans-serif",
        sm: { fontSize: '0.75rem', paddingX: '0.75rem', paddingY: '0.5rem' },
        lg: { fontSize: '1rem',    paddingX: '1.25rem',  paddingY: '0.75rem' },
      },
    },

    // ── Textarea ─────────────────────────────────────────────────
    textarea: {
      root: {
        background:     color.surfaceContainerLow,
        borderColor:    `${color.outlineVariant}66`,
        hoverBorderColor: color.outline,
        focusBorderColor: color.primary,
        invalidBorderColor: color.error,
        color:          color.onSurface,
        placeholderColor: color.outline,
        borderRadius:   '0.5rem',
        paddingX:       '1rem',
        paddingY:       '0.625rem',
        fontSize:       '0.875rem',
        fontFamily:     "'Manrope', sans-serif",
        shadow:         '0 0 0 2px rgba(115,92,0,0)',
        focusShadow:    '0 0 0 2px rgba(115,92,0,0.18)',
      },
    },

    // ── Select / Dropdown ─────────────────────────────────────────
    select: {
      root: {
        background:       color.surfaceContainerLow,
        disabledBackground: color.surfaceContainerHigh,
        borderColor:      `${color.outlineVariant}66`,
        hoverBorderColor: color.outline,
        focusBorderColor: color.primary,
        invalidBorderColor: color.error,
        color:            color.onSurface,
        disabledColor:    color.outline,
        placeholderColor: color.outline,
        borderRadius:     '0.5rem',
        paddingX:         '1rem',
        paddingY:         '0.625rem',
        fontSize:         '0.875rem',
        shadow:           '0 0 0 2px rgba(115,92,0,0)',
        focusShadow:      '0 0 0 2px rgba(115,92,0,0.18)',
      },
      dropdown: {
        color: color.outline,
      },
      overlay: {
        background:   color.surfaceContainerLowest,
        borderColor:  `${color.outlineVariant}26`,
        borderRadius: '0.75rem',
        shadow:       '0 8px 32px rgba(28,27,26,0.12)',
      },
      option: {
        focusBackground:    color.surfaceContainer,
        selectedBackground: color.primaryContainer,
        color:              color.onSurface,
        selectedColor:      color.onPrimaryContainer,
        focusColor:         color.onSurface,
        selectedFocusBackground: `${color.primaryContainer}cc`,
        selectedFocusColor: color.onPrimaryContainer,
        padding:            '0.625rem 1rem',
        borderRadius:       '0.375rem',
      },
      optionGroup: {
        background: 'transparent',
        color:      color.secondary,
        fontWeight: '700',
        fontSize:   '0.6875rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      },
    },

    // ── Checkbox ──────────────────────────────────────────────────
    checkbox: {
      root: {
        borderRadius:     '0.25rem',
        width:            '1.25rem',
        height:           '1.25rem',
        background:       color.surfaceContainerLowest,
        checkedBackground: color.primary,
        checkedHoverBackground: color.onPrimaryContainer,
        disabledBackground: color.surfaceContainerHigh,
        filledBackground: color.surfaceContainerLow,
        borderColor:      color.outlineVariant,
        hoverBorderColor: color.primary,
        focusBorderColor: color.primary,
        checkedBorderColor: color.primary,
        checkedHoverBorderColor: color.onPrimaryContainer,
        checkedFocusBorderColor: color.primary,
        checkedDisabledBorderColor: color.outline,
        invalidBorderColor: color.error,
        shadow:           '0 0 0 2px rgba(115,92,0,0.18)',
        icon: {
          size:              '0.875rem',
          color:             color.onPrimary,
          checkedColor:      color.onPrimary,
          checkedHoverColor: color.onPrimary,
          disabledColor:     color.outline,
        },
      },
    },

    // ── Radio Button ──────────────────────────────────────────────
    radiobutton: {
      root: {
        width:  '1.25rem',
        height: '1.25rem',
        background:         color.surfaceContainerLowest,
        checkedBackground:  color.primary,
        checkedHoverBackground: color.onPrimaryContainer,
        disabledBackground: color.surfaceContainerHigh,
        borderColor:        color.outlineVariant,
        hoverBorderColor:   color.primary,
        focusBorderColor:   color.primary,
        checkedBorderColor: color.primary,
        checkedHoverBorderColor: color.onPrimaryContainer,
        invalidBorderColor: color.error,
        shadow:             '0 0 0 2px rgba(115,92,0,0.18)',
      },
      icon: {
        size:  '0.5rem',
        background: color.onPrimary,
        checkedBackground: color.onPrimary,
      },
    },

    // ── ToggleSwitch ──────────────────────────────────────────────
    toggleswitch: {
      root: {
        width:  '2.5rem',
        height: '1.25rem',
        borderRadius: '9999px',
        background:           `${color.outlineVariant}66`,
        hoverBackground:      `${color.outline}40`,
        checkedBackground:    color.primary,
        checkedHoverBackground: color.onPrimaryContainer,
        disabledBackground:   color.surfaceContainerHigh,
        invalidBorderColor:   color.error,
        shadow:               '0 0 0 2px rgba(115,92,0,0.18)',
        focusShadow:          '0 0 0 3px rgba(115,92,0,0.20)',
      },
      handle: {
        size:          '1rem',
        background:    color.surfaceContainerLowest,
        checkedBackground: color.onPrimary,
        disabledBackground: color.outline,
        borderRadius:  '9999px',
        shadow:        '0 1px 3px rgba(28,27,26,0.25)',
      },
    },

    // ── InputSwitch (alias) ───────────────────────────────────────
    inputswitch: {
      root: {
        checkedBackground: color.primary,
        hoverCheckedBackground: color.onPrimaryContainer,
      },
      handle: {
        checkedBackground: color.onPrimary,
      },
    },

    // ── Card ──────────────────────────────────────────────────────
    card: {
      root: {
        background:   color.surfaceContainerLowest,
        borderRadius: '0.75rem',
        color:        color.onSurface,
        shadow:       '0 1px 4px rgba(28,27,26,0.06), 0 2px 8px rgba(28,27,26,0.04)',
      },
      body: {
        padding: '1.5rem',
        gap:     '0.75rem',
      },
      caption: {
        gap: '0.5rem',
      },
      title: {
        fontSize:   '1.125rem',
        fontWeight: '700',
        fontFamily: "'Newsreader', serif",
        color:      color.onSurface,
      },
      subtitle: {
        fontSize: '0.75rem',
        color:    color.secondary,
      },
    },

    // ── Panel ─────────────────────────────────────────────────────
    panel: {
      root: {
        background:   color.surfaceContainerLowest,
        borderColor:  `${color.outlineVariant}26`,
        borderRadius: '0.75rem',
        color:        color.onSurface,
      },
      header: {
        background:  'transparent',
        borderColor: `${color.outlineVariant}1a`,
        padding:     '1rem 1.5rem',
        borderRadius:'0.75rem 0.75rem 0 0',
      },
      title: {
        fontFamily: "'Newsreader', serif",
        fontWeight: '700',
        fontSize:   '1.125rem',
        color:      color.onSurface,
      },
      content: {
        padding: '1.5rem',
      },
      footer: {
        padding:     '0.75rem 1.5rem',
        borderColor: `${color.outlineVariant}1a`,
      },
    },

    // ── Dialog / Modal ────────────────────────────────────────────
    dialog: {
      root: {
        background:   color.surfaceContainerLowest,
        borderColor:  `${color.outlineVariant}26`,
        borderRadius: '1rem',
        color:        color.onSurface,
        shadow:       '0 24px 64px rgba(28,27,26,0.20)',
      },
      header: {
        padding:     '1.5rem 1.5rem 0.5rem',
        borderRadius:'1rem 1rem 0 0',
      },
      title: {
        fontFamily: "'Newsreader', serif",
        fontWeight: '700',
        fontSize:   '1.25rem',
        color:      color.onSurface,
      },
      content: {
        padding: '1rem 1.5rem',
      },
      footer: {
        padding:    '0.75rem 1.5rem 1.5rem',
        gap:        '0.75rem',
      },
    },

    // ── Toast / Message ───────────────────────────────────────────
    toast: {
      root: {
        width: '22rem',
        gap:   '0.5rem',
      },
      message: {
        borderRadius: '0.75rem',
        border:       '1px solid',
        shadow:       '0 4px 20px rgba(28,27,26,0.12)',
        blur:         '0',
        padding:      '0.75rem 1rem',
        gap:          '0.75rem',
      },
      messageIcon: {
        size: '1.25rem',
      },
      messageText: {
        gap: '0.125rem',
      },
      summary: {
        fontWeight: '700',
        fontSize:   '0.875rem',
        color:      color.onSurface,
      },
      detail: {
        fontSize:   '0.75rem',
        color:      color.secondary,
      },
      colorScheme: {
        light: {
          info: {
            background:  color.surfaceContainerLowest,
            borderColor: `${color.primary}33`,
            color:       color.onSurface,
            detailColor: color.secondary,
            iconBackground: color.primaryFixed,
            iconColor:   color.primary,
          },
          success: {
            background:  color.surfaceContainerLowest,
            borderColor: `${color.success}33`,
            color:       color.onSurface,
            detailColor: color.secondary,
            iconBackground: color.successContainer,
            iconColor:   color.success,
          },
          warn: {
            background:  color.surfaceContainerLowest,
            borderColor: `${color.warning}33`,
            color:       color.onSurface,
            detailColor: color.secondary,
            iconBackground: color.warningContainer,
            iconColor:   color.warning,
          },
          error: {
            background:  color.surfaceContainerLowest,
            borderColor: `${color.error}33`,
            color:       color.onSurface,
            detailColor: color.secondary,
            iconBackground: color.errorContainer,
            iconColor:   color.error,
          },
          secondary: {
            background:  color.surfaceContainer,
            borderColor: `${color.outlineVariant}33`,
            color:       color.onSurface,
            detailColor: color.secondary,
            iconBackground: color.surfaceContainerHigh,
            iconColor:   color.secondary,
          },
        },
      },
    },

    // ── Message (inline) ─────────────────────────────────────────
    message: {
      root: {
        borderRadius: '0.5rem',
        padding:      '0.75rem 1rem',
        gap:          '0.5rem',
        border:       '1px solid',
      },
      colorScheme: {
        light: {
          info: {
            background:  `${color.primaryFixed}4d`,
            borderColor: `${color.primary}33`,
            color:       color.primary,
            iconColor:   color.primary,
          },
          success: {
            background:  `${color.successContainer}80`,
            borderColor: `${color.success}33`,
            color:       color.success,
            iconColor:   color.success,
          },
          warn: {
            background:  `${color.warningContainer}80`,
            borderColor: `${color.warning}33`,
            color:       color.warning,
            iconColor:   color.warning,
          },
          error: {
            background:  `${color.errorContainer}80`,
            borderColor: `${color.error}33`,
            color:       color.error,
            iconColor:   color.error,
          },
        },
      },
    },

    // ── Tag / Badge ───────────────────────────────────────────────
    tag: {
      root: {
        borderRadius: '0.625rem',
        paddingX:     '0.5rem',
        paddingY:     '0.125rem',
        fontSize:     '0.6875rem',
        fontWeight:   '700',
        gap:          '0.25rem',
      },
      colorScheme: {
        light: {
          primary: {
            background: color.primaryContainer,
            color:      color.onPrimaryContainer,
          },
          secondary: {
            background: color.secondaryContainer,
            color:      color.onSecondaryContainer,
          },
          success: {
            background: color.successContainer,
            color:      color.success,
          },
          warn: {
            background: color.warningContainer,
            color:      color.warning,
          },
          danger: {
            background: color.errorContainer,
            color:      color.onErrorContainer,
          },
          contrast: {
            background: color.surfaceContainerHigh,
            color:      color.onSurface,
          },
        },
      },
    },

    // ── Badge (dot/número) ────────────────────────────────────────
    badge: {
      root: {
        borderRadius: '9999px',
        fontSize:     '0.625rem',
        fontWeight:   '700',
        minWidth:     '1.25rem',
        height:       '1.25rem',
      },
      colorScheme: {
        light: {
          primary: {
            background: color.primary,
            color:      color.onPrimary,
          },
          secondary: {
            background: color.secondaryContainer,
            color:      color.onSecondaryContainer,
          },
          success: {
            background: color.success,
            color:      color.onSuccess,
          },
          warn: {
            background: color.warning,
            color:      color.onWarning,
          },
          danger: {
            background: color.error,
            color:      color.onError,
          },
          contrast: {
            background: color.inverseSurface,
            color:      color.inverseOnSurface,
          },
        },
      },
    },

    // ── ProgressBar ───────────────────────────────────────────────
    progressbar: {
      root: {
        background:   color.surfaceVariant,
        borderRadius: '9999px',
        height:       '0.375rem',
      },
      value: {
        background: color.primary,
        borderRadius: '9999px',
      },
      label: {
        color:      color.onPrimary,
        fontSize:   '0.6875rem',
        fontWeight: '700',
      },
    },

    // ── Slider ────────────────────────────────────────────────────
    slider: {
      root: {
        transitionDuration: '150ms',
      },
      track: {
        background: color.surfaceVariant,
        borderRadius: '9999px',
        height: '0.375rem',
      },
      range: {
        background: color.primary,
      },
      handle: {
        width:              '1.25rem',
        height:             '1.25rem',
        borderRadius:       '9999px',
        background:         color.surfaceContainerLowest,
        hoverBackground:    color.surfaceContainerLowest,
        content: {
          width:            '0.5rem',
          height:           '0.5rem',
          borderRadius:     '9999px',
          background:       color.primary,
          hoverBackground:  color.onPrimaryContainer,
          shadow:           `0 0 0 2px ${color.primary}`,
        },
        shadow: '0 2px 6px rgba(28,27,26,0.15)',
        focusShadow: `0 0 0 3px rgba(115,92,0,0.20)`,
      },
    },

    // ── DataTable ─────────────────────────────────────────────────
    datatable: {
      root: {
        transitionDuration: '150ms',
      },
      header: {
        background:   color.surfaceContainerLow,
        borderColor:  `${color.outlineVariant}26`,
        borderWidth:  '0 0 1px 0',
        padding:      '0.75rem 1rem',
        color:        color.onSurface,
      },
      headerCell: {
        background:        color.surfaceContainerLow,
        hoverBackground:   color.surfaceContainer,
        selectedBackground: color.primaryContainer,
        borderColor:       `${color.outlineVariant}26`,
        color:             color.onSurface,
        hoverColor:        color.onSurface,
        selectedColor:     color.onPrimaryContainer,
        focusBackground:   color.surfaceContainer,
        focusColor:        color.onSurface,
        gap:               '0.5rem',
        padding:           '0.625rem 1rem',
        fontWeight:        '700',
        fontSize:          '0.6875rem',
        letterSpacing:     '0.08em',
        textTransform:     'uppercase',
        sortIconColor:     color.outline,
        hoverSortIconColor:color.primary,
        selectedSortIconColor: color.onPrimaryContainer,
      },
      bodyCell: {
        borderColor:       `${color.outlineVariant}1a`,
        padding:           '0.75rem 1rem',
        focousRingWidth:   '0',
        selectedBackground: `${color.primaryContainer}40`,
        selectedColor:     color.onSurface,
      },
      row: {
        background:          color.surfaceContainerLowest,
        hoverBackground:     color.surfaceContainerLow,
        selectedBackground:  `${color.primaryContainer}40`,
        color:               color.onSurface,
        hoverColor:          color.onSurface,
        selectedColor:       color.onSurface,
        stripedBackground:   color.surfaceContainerLow,
      },
      footer: {
        background:  color.surfaceContainerLow,
        borderColor: `${color.outlineVariant}26`,
        padding:     '0.75rem 1rem',
        color:       color.secondary,
      },
      paginator: {
        bottom: {
          borderColor: `${color.outlineVariant}26`,
          borderWidth: '1px 0 0 0',
        },
      },
    },

    // ── Paginator ─────────────────────────────────────────────────
    paginator: {
      root: {
        background:   'transparent',
        borderColor:  'transparent',
        padding:      '0.5rem 1rem',
        gap:          '0.25rem',
        borderRadius: '0',
        color:        color.secondary,
      },
      navButton: {
        background:       'transparent',
        hoverBackground:  color.surfaceContainer,
        selectedBackground: color.primaryContainer,
        borderColor:      'transparent',
        color:            color.secondary,
        hoverColor:       color.onSurface,
        selectedColor:    color.onPrimaryContainer,
        width:            '2rem',
        height:           '2rem',
        borderRadius:     '0.375rem',
        focusShadow:      `0 0 0 2px rgba(115,92,0,0.18)`,
      },
      currentPageReport: {
        color: color.secondary,
      },
    },

    // ── Menu / TieredMenu / Menubar ───────────────────────────────
    menu: {
      root: {
        background:   color.surfaceContainerLowest,
        borderColor:  `${color.outlineVariant}26`,
        borderRadius: '0.75rem',
        shadow:       '0 8px 32px rgba(28,27,26,0.10)',
        color:        color.onSurface,
        padding:      '0.375rem',
        gap:          '0',
        transitionDuration: '150ms',
      },
      list: {
        padding: '0',
        gap:     '0',
      },
      item: {
        focusBackground:  color.surfaceContainer,
        activeBackground: color.primaryContainer,
        color:            color.onSurface,
        focusColor:       color.onSurface,
        activeColor:      color.onPrimaryContainer,
        padding:          '0.5rem 0.75rem',
        borderRadius:     '0.5rem',
        gap:              '0.625rem',
      },
      itemIcon: {
        color:       color.outline,
        focusColor:  color.onSurface,
        activeColor: color.onPrimaryContainer,
      },
      itemLabel: {
        fontSize:   '0.875rem',
        fontWeight: '500',
      },
      separator: {
        borderColor: `${color.outlineVariant}26`,
        margin:      '0.25rem 0',
      },
      submenuLabel: {
        background:   'transparent',
        color:        color.secondary,
        fontWeight:   '700',
        fontSize:     '0.6875rem',
        letterSpacing:'0.10em',
        textTransform:'uppercase',
        padding:      '0.5rem 0.75rem 0.25rem',
      },
      submenuIcon: {
        color:       color.outline,
        focusColor:  color.onSurface,
        activeColor: color.onPrimaryContainer,
      },
    },

    // ── Tabs ──────────────────────────────────────────────────────
    tabs: {
      root: {
        transitionDuration: '150ms',
      },
    },
    tablist: {
      root: {
        borderColor:      `${color.outlineVariant}33`,
        background:       'transparent',
      },
      activeBar: {
        background:   color.primary,
        height:       '2px',
        borderRadius: '9999px',
      },
    },
    tab: {
      root: {
        color:             color.secondary,
        hoverColor:        color.onSurface,
        activeColor:       color.primary,
        background:        'transparent',
        hoverBackground:   color.surfaceContainer,
        activeBackground:  'transparent',
        borderColor:       'transparent',
        hoverBorderColor:  'transparent',
        activeBorderColor: color.primary,
        padding:           '0.75rem 1rem',
        fontWeight:        '600',
        fontSize:          '0.875rem',
        fontFamily:        "'Manrope', sans-serif",
        margin:            '0 0 -1px 0',
        gap:               '0.5rem',
        borderRadius:      '0.375rem 0.375rem 0 0',
        focusShadow:       `0 0 0 2px rgba(115,92,0,0.18)`,
      },
    },
    tabpanels: {
      root: {
        background: 'transparent',
        color:      color.onSurface,
        padding:    '1rem 0',
      },
    },

    // ── Accordion ────────────────────────────────────────────────
    accordion: {
      root: {
        transitionDuration: '150ms',
      },
      header: {
        color:             color.onSurface,
        hoverColor:        color.primary,
        activeColor:       color.primary,
        background:        color.surfaceContainerLowest,
        hoverBackground:   color.surfaceContainerLow,
        activeBackground:  color.surfaceContainerLowest,
        borderColor:       `${color.outlineVariant}26`,
        hoverBorderColor:  `${color.outlineVariant}26`,
        activeBorderColor: `${color.outlineVariant}26`,
        borderWidth:       '0 0 1px 0',
        firstBorderWidth:  '1px 0 1px 0',
        borderRadius:      '0.5rem 0.5rem 0 0',
        padding:           '1rem 1.25rem',
        gap:               '0.5rem',
        fontWeight:        '600',
        fontFamily:        "'Newsreader', serif",
        fontSize:          '1.0625rem',
        toggleIcon: {
          color:       color.outline,
          hoverColor:  color.primary,
          activeColor: color.primary,
        },
        focusShadow: `0 0 0 2px rgba(115,92,0,0.18)`,
      },
      content: {
        background:  color.surfaceContainerLowest,
        borderColor: `${color.outlineVariant}26`,
        borderWidth: '0 0 1px 0',
        color:       color.onSurface,
        padding:     '0.75rem 1.25rem 1.25rem',
      },
    },

    // ── Chip ─────────────────────────────────────────────────────
    chip: {
      root: {
        borderRadius: '9999px',
        paddingX:     '0.75rem',
        paddingY:     '0.25rem',
        gap:          '0.375rem',
        transitionDuration: '150ms',
        background:   color.surfaceContainerHigh,
        color:        color.onSurface,
        fontWeight:   '600',
        fontSize:     '0.75rem',
      },
      image: {
        width:  '1.5rem',
        height: '1.5rem',
      },
      removeIcon: {
        size:  '0.75rem',
        color: color.secondary,
        hoverColor: color.error,
        focusColor: color.error,
      },
    },

    // ── InputChips / AutoComplete ─────────────────────────────────
    inputchips: {
      root: {
        background:     color.surfaceContainerLow,
        borderColor:    `${color.outlineVariant}66`,
        hoverBorderColor: color.outline,
        focusBorderColor: color.primary,
        borderRadius:   '0.5rem',
        padding:        '0.375rem 0.75rem',
        gap:            '0.375rem',
        focusShadow:    '0 0 0 2px rgba(115,92,0,0.18)',
      },
      chip: {
        borderRadius:  '9999px',
        paddingX:      '0.625rem',
        paddingY:      '0.125rem',
        background:    color.primaryContainer,
        color:         color.onPrimaryContainer,
        fontWeight:    '700',
        fontSize:      '0.75rem',
      },
    },

    // ── Skeleton ─────────────────────────────────────────────────
    skeleton: {
      root: {
        background:   color.surfaceContainerHigh,
        borderRadius: '0.5rem',
      },
      animation: {
        background: `linear-gradient(90deg, transparent, ${color.surfaceContainerLowest}60, transparent)`,
      },
    },

    // ── ProgressSpinner ───────────────────────────────────────────
    progressspinner: {
      colorScheme: {
        light: {
          root: {
            color: color.primary,
          },
        },
        dark: {
          root: {
            color: color.primaryFixedDim,
          },
        },
      },
    },

    // ── Avatar ────────────────────────────────────────────────────
    avatar: {
      root: {
        width:        '2.5rem',
        height:       '2.5rem',
        fontSize:     '1rem',
        background:   color.primaryContainer,
        color:        color.onPrimaryContainer,
        borderRadius: '9999px',
        fontFamily:   "'Newsreader', serif",
        fontWeight:   '700',
      },
      group: {
        offset: '-0.75rem',
        border: `2px solid ${color.surfaceContainerLowest}`,
      },
    },

    // ── Divider ───────────────────────────────────────────────────
    divider: {
      root: {
        borderColor: `${color.outlineVariant}33`,
        borderWidth: '1px',
      },
      content: {
        background: color.background,
        color:      color.secondary,
        fontSize:   '0.6875rem',
        fontWeight: '700',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      },
    },

    // ── Breadcrumb ────────────────────────────────────────────────
    breadcrumb: {
      root: {
        background:   color.surfaceContainerLow,
        borderColor:  `${color.outlineVariant}26`,
        borderRadius: '0.5rem',
        padding:      '0.5rem 1rem',
        gap:          '0',
      },
      item: {
        color:        color.secondary,
        hoverColor:   color.primary,
        activeColor:  color.onSurface,
        fontWeight:   '500',
        fontSize:     '0.875rem',
        gap:          '0.5rem',
        iconColor:    color.outline,
        hoverIconColor:color.primary,
        focusShadow:  '0 0 0 2px rgba(115,92,0,0.18)',
      },
      separator: {
        color: color.outline,
      },
    },

    // ── FloatLabel ────────────────────────────────────────────────
    floatlabel: {
      root: {
        color:              color.outline,
        focusColor:         color.primary,
        activeColor:        color.onSurfaceVariant,
        invalidColor:       color.error,
        transitionDuration: '150ms',
      },
    },

    // ── Tooltip ───────────────────────────────────────────────────
    tooltip: {
      root: {
        background:   color.inverseSurface,
        color:        color.inverseOnSurface,
        borderRadius: '0.375rem',
        shadow:       '0 4px 16px rgba(28,27,26,0.16)',
        padding:      '0.375rem 0.75rem',
        maxWidth:     '14rem',
        fontSize:     '0.75rem',
        fontWeight:   '500',
      },
      arrow: {
        size: '4px',
      },
    },

    // ── OverlayPanel / Popover ────────────────────────────────────
    overlaypanel: {
      root: {
        background:   color.surfaceContainerLowest,
        borderColor:  `${color.outlineVariant}26`,
        borderRadius: '0.75rem',
        color:        color.onSurface,
        shadow:       '0 8px 32px rgba(28,27,26,0.12)',
        padding:      '1rem',
      },
    },

    // ── ConfirmDialog / ConfirmPopup ──────────────────────────────
    confirmdialog: {
      icon: {
        size:   '2rem',
        color:  color.warning,
      },
      content: {
        gap: '1rem',
      },
    },
    confirmpopup: {
      root: {
        background:   color.surfaceContainerLowest,
        borderColor:  `${color.outlineVariant}26`,
        borderRadius: '0.75rem',
        color:        color.onSurface,
        shadow:       '0 8px 32px rgba(28,27,26,0.12)',
        padding:      '1rem',
      },
      icon: {
        size:  '1.5rem',
        color: color.warning,
      },
    },

    // ── FileUpload ────────────────────────────────────────────────
    fileupload: {
      root: {
        background:   color.surfaceContainerLowest,
        borderColor:  `${color.outlineVariant}33`,
        borderRadius: '0.75rem',
        color:        color.onSurface,
      },
      header: {
        background:  color.surfaceContainerLow,
        borderColor: `${color.outlineVariant}26`,
        padding:     '1rem 1.25rem',
        borderRadius:'0.75rem 0.75rem 0 0',
        gap:         '0.75rem',
      },
      content: {
        borderColor: `${color.outlineVariant}26`,
        padding:     '1.25rem',
        highlightBorder: `1px dashed ${color.primary}`,
      },
      file: {
        borderColor: `${color.outlineVariant}26`,
        borderRadius:'0.5rem',
        gap:         '0.75rem',
        padding:     '0.75rem',
      },
      fileIcon: {
        size:  '1.25rem',
        color: color.secondary,
      },
      fileName: {
        fontSize:   '0.875rem',
        fontWeight: '500',
        color:      color.onSurface,
      },
      fileSize: {
        fontSize:  '0.75rem',
        fontWeight:'600',
        color:     color.secondary,
      },
      progressbar: {
        height: '0.25rem',
      },
    },

    // ── InputNumber ───────────────────────────────────────────────
    inputnumber: {
      root: {
        transitionDuration: '150ms',
      },
      button: {
        width:      '2.5rem',
        border:     'none',
        hoverBorder:'none',
        background: 'transparent',
        hoverBackground: color.surfaceContainerLow,
        activeBackground: color.surfaceContainer,
        color:      color.secondary,
        hoverColor: color.primary,
        activeColor:color.primary,
        borderRadius: '0.375rem',
      },
    },

    // ── Calendar / DatePicker ─────────────────────────────────────
    datepicker: {
      root: {
        transitionDuration: '150ms',
      },
      panel: {
        background:   color.surfaceContainerLowest,
        borderColor:  `${color.outlineVariant}26`,
        borderRadius: '0.75rem',
        color:        color.onSurface,
        shadow:       '0 8px 32px rgba(28,27,26,0.10)',
        padding:      '1rem',
      },
      header: {
        background:   'transparent',
        borderColor:  `${color.outlineVariant}1a`,
        padding:      '0 0 0.75rem',
        color:        color.onSurface,
      },
      title: {
        gap:        '0.375rem',
        fontFamily: "'Newsreader', serif",
        fontWeight: '700',
      },
      selectMonth: {
        hoverBackground: color.surfaceContainer,
        color:           color.onSurface,
        hoverColor:      color.primary,
        padding:         '0.25rem 0.5rem',
        borderRadius:    '0.375rem',
        fontFamily:      "'Newsreader', serif",
        fontWeight:      '700',
      },
      selectYear: {
        hoverBackground: color.surfaceContainer,
        color:           color.onSurface,
        hoverColor:      color.primary,
        padding:         '0.25rem 0.5rem',
        borderRadius:    '0.375rem',
        fontFamily:      "'Newsreader', serif",
        fontWeight:      '700',
      },
      day: {
        padding: '0.1875rem',
      },
      dayCell: {
        borderRadius:     '0.375rem',
        width:            '2rem',
        height:           '2rem',
        color:            color.onSurface,
        hoverBackground:  color.surfaceContainer,
        hoverColor:       color.onSurface,
        selectedBackground: color.primary,
        selectedColor:    color.onPrimary,
        todayBackground:  `${color.primaryContainer}4d`,
        todayColor:       color.onPrimaryContainer,
        rangeBackground:  `${color.primaryContainer}33`,
        rangeColor:       color.onSurface,
        disabledColor:    color.outline,
        focusShadow:      '0 0 0 2px rgba(115,92,0,0.18)',
      },
      weekDay: {
        color:      color.secondary,
        fontSize:   '0.75rem',
        fontWeight: '700',
      },
      monthView: {
        month: {
          hoverBackground:   color.surfaceContainer,
          selectedBackground:color.primary,
          color:             color.onSurface,
          selectedColor:     color.onPrimary,
          hoverColor:        color.onSurface,
          padding:           '0.375rem 0.5rem',
          borderRadius:      '0.375rem',
        },
      },
      yearView: {
        year: {
          hoverBackground:   color.surfaceContainer,
          selectedBackground:color.primary,
          color:             color.onSurface,
          selectedColor:     color.onPrimary,
          hoverColor:        color.onSurface,
          padding:           '0.375rem 0.5rem',
          borderRadius:      '0.375rem',
        },
      },
      timePicker: {
        padding: '0.5rem 0',
        borderColor: `${color.outlineVariant}1a`,
        gap:     '0.5rem',
        button: {
          hoverBackground: color.surfaceContainer,
          color:           color.secondary,
          hoverColor:      color.primary,
          width:           '1.75rem',
          height:          '1.75rem',
          borderRadius:    '0.375rem',
        },
        time: {
          fontSize:   '1.125rem',
          fontFamily: "'Newsreader', serif",
          fontWeight: '700',
          color:      color.onSurface,
        },
        separator: {
          fontSize:  '1.125rem',
          color:     color.outline,
        },
      },
    },

    // ── Knob ─────────────────────────────────────────────────────
    knob: {
      root: {
        shadow: `0 0 0 2px rgba(115,92,0,0.18)`,
      },
      range: {
        background: color.surfaceVariant,
        fill:       color.primary,
      },
      handle: {
        background: color.primary,
        hoverBackground: color.onPrimaryContainer,
      },
      value: {
        color: color.onSurface,
      },
      text: {
        color: color.secondary,
        fontSize: '0.875rem',
      },
    },

    // ── Rating ────────────────────────────────────────────────────
    rating: {
      icon: {
        size:         '1.25rem',
        color:        color.surfaceVariant,
        hoverColor:   color.primaryContainer,
        activeColor:  color.primaryContainer,
        focusShadow:  '0 0 0 2px rgba(115,92,0,0.18)',
      },
    },

    // ── Inplace ───────────────────────────────────────────────────
    inplace: {
      display: {
        hoverBackground: color.surfaceContainer,
        color:           color.onSurface,
        hoverColor:      color.primary,
        borderRadius:    '0.375rem',
        padding:         '0.25rem 0.5rem',
        focusShadow:     '0 0 0 2px rgba(115,92,0,0.18)',
      },
    },

    // ── Splitter ──────────────────────────────────────────────────
    splitter: {
      root: {
        borderColor: `${color.outlineVariant}26`,
      },
      gutter: {
        size:  '0.5rem',
        background: color.surfaceContainerLow,
      },
      gutterHandle: {
        size:       '1.5rem',
        background: color.outlineVariant,
        borderRadius:'9999px',
      },
    },

    // ── Sidebar / Drawer ──────────────────────────────────────────
    drawer: {
      root: {
        background:   color.surfaceContainerLow,
        borderColor:  `${color.outlineVariant}26`,
        color:        color.onSurface,
        shadow:       '0 8px 32px rgba(28,27,26,0.14)',
      },
      header: {
        padding: '1.25rem 1.5rem',
      },
      title: {
        fontFamily: "'Newsreader', serif",
        fontWeight: '700',
        fontSize:   '1.125rem',
        color:      color.onSurface,
      },
      content: {
        padding: '0 1.5rem 1.5rem',
      },
      footer: {
        padding: '1rem 1.5rem',
      },
    },

    // ── Toolbar ───────────────────────────────────────────────────
    toolbar: {
      root: {
        background:   color.surfaceContainerLow,
        borderColor:  `${color.outlineVariant}26`,
        borderRadius: '0.5rem',
        gap:          '0.5rem',
        padding:      '0.625rem 1rem',
      },
    },

    // ── ScrollPanel ───────────────────────────────────────────────
    scrollpanel: {
      bar: {
        size:             '6px',
        borderRadius:     '9999px',
        focusShadow:      '0 0 0 2px rgba(115,92,0,0.18)',
        transitionDuration:'150ms',
        background:       color.outlineVariant,
      },
    },

    // ── TreeSelect ────────────────────────────────────────────────
    treeselect: {
      root: {
        background:     color.surfaceContainerLow,
        borderColor:    `${color.outlineVariant}66`,
        hoverBorderColor: color.outline,
        focusBorderColor: color.primary,
        borderRadius:   '0.5rem',
        paddingX:       '1rem',
        paddingY:       '0.625rem',
        color:          color.onSurface,
        placeholderColor: color.outline,
        focusShadow:    '0 0 0 2px rgba(115,92,0,0.18)',
      },
      overlay: {
        background:   color.surfaceContainerLowest,
        borderColor:  `${color.outlineVariant}26`,
        borderRadius: '0.75rem',
        shadow:       '0 8px 32px rgba(28,27,26,0.10)',
      },
    },

    // ── Tree ─────────────────────────────────────────────────────
    tree: {
      root: {
        background:  color.surfaceContainerLowest,
        borderColor: `${color.outlineVariant}26`,
        color:       color.onSurface,
        padding:     '0.5rem',
        gap:         '0',
        transitionDuration: '150ms',
        indentation:  '1rem',
      },
      node: {
        focusBackground:    color.surfaceContainer,
        selectedBackground: color.primaryContainer,
        color:              color.onSurface,
        focusColor:         color.onSurface,
        selectedColor:      color.onPrimaryContainer,
        hoverBackground:    color.surfaceContainerLow,
        hoverColor:         color.onSurface,
        borderRadius:       '0.375rem',
        padding:            '0.375rem 0.625rem',
        gap:                '0.375rem',
        toggleIcon: {
          color:       color.outline,
          hoverColor:  color.primary,
          selectedColor: color.onPrimaryContainer,
        },
        icon: {
          color:       color.outline,
          selectedColor: color.onPrimaryContainer,
        },
      },
    },

    // ── MeterGroup ────────────────────────────────────────────────
    metergroup: {
      root: {
        gap: '0.625rem',
      },
      metercontainer: {
        background:   color.surfaceVariant,
        borderRadius: '9999px',
        height:       '0.375rem',
      },
      meter: {
        borderRadius: '9999px',
      },
      label: {
        gap:       '0.375rem',
        fontSize:  '0.75rem',
        fontWeight:'500',
        color:     color.secondary,
      },
      labelIcon: {
        size: '0.875rem',
      },
      labelMarker: {
        size:        '0.5rem',
        borderRadius:'9999px',
      },
    },

    // ── MultiSelect ───────────────────────────────────────────────
    multiselect: {
      root: {
        background:     color.surfaceContainerLow,
        borderColor:    `${color.outlineVariant}66`,
        hoverBorderColor: color.outline,
        focusBorderColor: color.primary,
        borderRadius:   '0.5rem',
        paddingX:       '1rem',
        paddingY:       '0.625rem',
        color:          color.onSurface,
        placeholderColor: color.outline,
        focusShadow:    '0 0 0 2px rgba(115,92,0,0.18)',
      },
      overlay: {
        background:   color.surfaceContainerLowest,
        borderColor:  `${color.outlineVariant}26`,
        borderRadius: '0.75rem',
        shadow:       '0 8px 32px rgba(28,27,26,0.10)',
      },
      option: {
        focusBackground:    color.surfaceContainer,
        selectedBackground: color.primaryContainer,
        color:              color.onSurface,
        selectedColor:      color.onPrimaryContainer,
        padding:            '0.625rem 1rem',
        borderRadius:       '0.375rem',
      },
      chip: {
        borderRadius: '9999px',
        background:   color.primaryContainer,
        color:        color.onPrimaryContainer,
        fontWeight:   '700',
        fontSize:     '0.75rem',
        paddingX:     '0.5rem',
        paddingY:     '0.125rem',
      },
      header: {
        padding:     '0.5rem 0.75rem',
        borderColor: `${color.outlineVariant}26`,
        background:  color.surfaceContainerLow,
        borderRadius:'0.75rem 0.75rem 0 0',
        color:       color.onSurface,
      },
    },

    // ── Listbox ───────────────────────────────────────────────────
    listbox: {
      root: {
        background:   color.surfaceContainerLowest,
        borderColor:  `${color.outlineVariant}33`,
        borderRadius: '0.5rem',
        color:        color.onSurface,
        shadow:       '0 1px 4px rgba(28,27,26,0.06)',
      },
      header: {
        padding:     '0.5rem 0.75rem',
        borderColor: `${color.outlineVariant}26`,
        background:  color.surfaceContainerLow,
        borderRadius:'0.5rem 0.5rem 0 0',
        color:       color.onSurface,
      },
      option: {
        focusBackground:    color.surfaceContainer,
        selectedBackground: color.primaryContainer,
        color:              color.onSurface,
        selectedColor:      color.onPrimaryContainer,
        padding:            '0.625rem 0.875rem',
        borderRadius:       '0.375rem',
      },
      optionGroup: {
        background:    'transparent',
        color:         color.secondary,
        fontWeight:    '700',
        fontSize:      '0.6875rem',
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        padding:       '0.5rem 0.875rem 0.25rem',
      },
    },

    // ── Galleria / Carousel ───────────────────────────────────────
    galleria: {
      root: {
        borderColor: `${color.outlineVariant}26`,
        borderRadius:'0.75rem',
      },
      navButton: {
        background:       'rgba(28,27,26,0.50)',
        hoverBackground:  'rgba(28,27,26,0.70)',
        color:            color.inverseOnSurface,
        hoverColor:       '#ffffff',
        width:            '2.5rem',
        height:           '2.5rem',
        borderRadius:     '50%',
        gap:              '0',
        shadow:           '0 2px 8px rgba(28,27,26,0.20)',
      },
      navIcon: {
        size: '1.25rem',
      },
      thumbnailsContent: {
        background: color.inverseSurface,
        padding:    '0.75rem 0.5rem',
      },
      thumbnailItem: {
        borderRadius:      '0.375rem',
        selectedBorderColor: color.primaryContainer,
        focusShadow:       '0 0 0 2px rgba(115,92,0,0.18)',
      },
      caption: {
        background: 'rgba(28,27,26,0.60)',
        color:      color.inverseOnSurface,
        padding:    '1rem 1.5rem',
      },
    },

    // ── Steps ─────────────────────────────────────────────────────
    steps: {
      root: {
        transitionDuration: '150ms',
      },
      separator: {
        background:    color.surfaceVariant,
        activeBackground: color.primary,
      },
      item: {
        color:         color.secondary,
        focusColor:    color.primary,
        activeColor:   color.primary,
        number: {
          background:         color.surfaceContainerHigh,
          hoverBackground:    color.surfaceContainer,
          activeBackground:   color.primary,
          borderColor:        'transparent',
          hoverBorderColor:   'transparent',
          activeBorderColor:  'transparent',
          color:              color.onSurface,
          activeColor:        color.onPrimary,
          size:               '2rem',
          fontSize:           '0.875rem',
          fontWeight:         '700',
          borderRadius:       '9999px',
          shadow:             'none',
          activeShadow:       `0 0 0 3px ${color.primaryContainer}`,
        },
        title: {
          color:       color.secondary,
          activeColor: color.primary,
          fontWeight:  '600',
          fontSize:    '0.875rem',
        },
      },
    },

    // ── Stepper ───────────────────────────────────────────────────
    stepper: {
      separator: {
        background:        color.surfaceVariant,
        activeBackground:  color.primary,
        size:              '1px',
        transitionDuration:'300ms',
      },
      step: {
        number: {
          background:        color.surfaceContainerHigh,
          activeBackground:  color.primary,
          color:             color.onSurface,
          activeColor:       color.onPrimary,
          borderRadius:      '9999px',
          focusShadow:       '0 0 0 2px rgba(115,92,0,0.18)',
        },
        title: {
          color:       color.secondary,
          activeColor: color.primary,
        },
      },
    },

    // ── Contextmenu ───────────────────────────────────────────────
    contextmenu: {
      root: {
        background:   color.surfaceContainerLowest,
        borderColor:  `${color.outlineVariant}26`,
        borderRadius: '0.75rem',
        shadow:       '0 8px 32px rgba(28,27,26,0.14)',
        color:        color.onSurface,
        padding:      '0.375rem',
      },
      item: {
        focusBackground:  color.surfaceContainer,
        activeBackground: color.primaryContainer,
        color:            color.onSurface,
        focusColor:       color.onSurface,
        activeColor:      color.onPrimaryContainer,
        padding:          '0.5rem 0.75rem',
        borderRadius:     '0.5rem',
        gap:              '0.5rem',
      },
      separator: {
        borderColor: `${color.outlineVariant}26`,
        margin:      '0.25rem 0',
      },
    },

    // ── PickList / OrderList ──────────────────────────────────────
    picklist: {
      root: {
        gap: '1rem',
      },
      header: {
        background:   color.surfaceContainerLow,
        borderColor:  `${color.outlineVariant}26`,
        padding:      '0.75rem 1rem',
        borderRadius: '0.5rem 0.5rem 0 0',
        color:        color.onSurface,
        fontWeight:   '700',
        fontFamily:   "'Manrope', sans-serif",
        fontSize:     '0.875rem',
      },
      list: {
        borderColor:  `${color.outlineVariant}26`,
        background:   color.surfaceContainerLowest,
        padding:      '0.375rem',
        gap:          '0',
        borderRadius: '0 0 0.5rem 0.5rem',
      },
      item: {
        focusBackground:    color.surfaceContainer,
        selectedBackground: color.primaryContainer,
        color:              color.onSurface,
        focusColor:         color.onSurface,
        selectedColor:      color.onPrimaryContainer,
        padding:            '0.625rem 0.875rem',
        borderRadius:       '0.375rem',
        gap:                '0.625rem',
      },
    },

  }, // end components

  // ── Estilos Globais da Aplicação ────────────────────────────────
  css: `
    :root {
      --primary: ${color.primary};
      --primary-container: ${color.primaryContainer};
      --background: ${color.background};
      --surface-container-lowest: ${color.surfaceContainerLowest};
      --surface-container-low: ${color.surfaceContainerLow};
      --surface-container: ${color.surfaceContainer};
      --surface-container-high: ${color.surfaceContainerHigh};
      --surface-container-highest: ${color.surfaceContainerHighest};
      --secondary: ${color.secondary};
      --on-surface: ${color.onSurface};
      --on-surface-variant: ${color.onSurfaceVariant};
      --outline-variant: ${color.outlineVariant};
      --outline: ${color.outline};
      --success: ${color.success};
      --surface-border: rgba(208, 197, 175, 0.2);
    }

    .font-serif { font-family: 'Newsreader', serif; }
    .font-body, .font-label { font-family: 'Manrope', sans-serif; }

    .text-primary { color: var(--primary); }
    .text-secondary { color: var(--secondary); }
    .bg-primary { background: var(--primary); }
    .bg-primary-container { background: var(--primary-container); }
    .bg-surface-container-lowest { background: var(--surface-container-lowest); }
    .bg-surface-container-low { background: var(--surface-container-low); }
    .bg-surface-container { background: var(--surface-container); }
    .bg-surface-container-high { background: var(--surface-container-high); }
    .bg-surface-container-highest { background: var(--surface-container-highest); }

    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .sm\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .sm\\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }

    .mb-1 { margin-bottom: 0.25rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-10 { margin-bottom: 2.5rem; }
    .mt-3 { margin-top: 0.75rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-6 { margin-top: 1.5rem; }

    .p-3 { padding: 0.75rem; }
    .p-6 { padding: 1.5rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }

    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-base { font-size: 1rem; }
    .text-3xl { font-size: 1.875rem; }
    .text-4xl { font-size: 2.25rem; }
    .text-5xl { font-size: 3rem; }
    .text-xl { font-size: 1.25rem; }

    .font-bold { font-weight: 700; }
    .font-extrabold { font-weight: 800; }
    .italic { font-style: italic; }

    .leading-tight { line-height: 1.25; }
    .leading-relaxed { line-height: 1.625; }

    .max-w-xl { max-width: 36rem; }
    .w-fit { width: fit-content; }

    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }

    .border { border-width: 1px; }
    .border-t { border-top-width: 1px; }

    .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }

    .flex { display: flex; }
    .flex-wrap { flex-wrap: wrap; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-2 { gap: 0.5rem; }

    @media (min-width: 640px) {
      .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .sm\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .sm\\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    }

    @media (min-width: 768px) {
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (min-width: 1024px) {
      .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
  `
}) // end definePreset

export default VincisTheme

