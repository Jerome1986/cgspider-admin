import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginPrettier from 'eslint-plugin-prettier'

export default defineConfigWithVueTs(
  {
    files: ['**/*.{ts,tsx,vue}'],
    plugins: {
      prettier: pluginPrettier
    },
    rules: {
      // prettier 风格
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          semi: false,
          printWidth: 100,
          trailingComma: 'none',
          endOfLine: 'auto'
        }
      ],
      'vue/multi-word-component-names': ['warn', { ignores: ['index'] }],
      'vue/no-setup-props-destructure': 'off',
      'no-undef': 'error'
    }
  },
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended
)
