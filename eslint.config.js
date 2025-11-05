import config from '@escral/lint'
import { includeIgnoreFile } from '@eslint/compat'
import { fileURLToPath } from 'node:url'
const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

// @todo Move to @escral/lint

export default [
    includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
    ...await config(),
    {
        rules: {
            'vue/prefer-import-from-vue': 'off',
        },
    },
]
