# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

## Prisma (Producción)

1. Configura `DATABASE_URL` en el entorno del servidor (archivo `.env` local al servidor o variables de entorno). No subas `.env` a Git.
2. Define también las variables del usuario admin que sembrará Prisma:

```bash
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_NAME=Administrador del Sistema
SEED_ADMIN_PASSWORD=coloca_aqui_una_contrasena_segura_y_larga
SEED_ADMIN_PASSWORD_MIN_LENGTH=12
```

Recomendación: usa una contraseña de al menos 16 caracteres, aleatoria y única para producción.
3. Instala dependencias:

```bash
npm ci
```

4. Genera el cliente de Prisma:

```bash
npm run prisma:generate
```

5. Aplica migraciones en producción:

```bash
npm run prisma:migrate:deploy
```

6. Ejecuta el seeder base:

```bash
npm run prisma:seed
```

Notas:
- En producción usa `prisma migrate deploy` (no `migrate dev`).
- El seeder actual crea o actualiza solo el usuario admin.
- El seeder actual es idempotente (usa `upsert`), así que puede ejecutarse más de una vez sin duplicar el admin.

### Reiniciar la base para producción

Usa este flujo solo si realmente quieres empezar desde cero:

1. Respaldar la base actual.
2. Detener la aplicación.
3. Vaciar completamente la base o recrearla.
4. Ejecutar:

```bash
npm ci
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
```

5. Iniciar la aplicación nuevamente.

### Si la base ya existe y Prisma marca P3005

Si ves que la base no está vacía y Prisma pide baseline, primero marca la migración inicial como aplicada:

```bash
npx prisma migrate resolve --applied 20260331120000_init
```

Después aplica pendientes:

```bash
npm run prisma:migrate:deploy
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  extends: [
    // other configs...
    // Enable lint rules for React
    reactX.configs['recommended-typescript'],
    // Enable lint rules for React DOM
    reactDom.configs.recommended,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
