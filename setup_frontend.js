// setup.js - надо запускать из папки frontend, иначе она всё на папку выше создает
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION & STATE
// ============================================================================
let created = 0;
let skipped = 0;

// ============================================================================
// 1. МАССИВ ДИРЕКТОРИЙ
// ============================================================================
const dirs = [
  'src/environments',
  'src/app/core/models',
  'src/app/core/services',
  'src/app/core/interceptors',
  'src/app/core/guards',
  'src/app/shared/components/header',
  'src/app/shared/components/progress-bar',
  'src/app/exercises/exercise-host',
  'src/app/exercises/feedback-panel',
  'src/app/exercises/multiple-choice',
  'src/app/exercises/match-pairs',
  'src/app/exercises/fill-the-blank',
  'src/app/exercises/true-false',
  'src/app/exercises/order-steps',
  'src/app/exercises/prompt-builder',
  'src/app/features/landing',
  'src/app/features/auth',
  'src/app/features/catalog',
  'src/app/features/course',
  'src/app/features/article',
  'src/app/features/test',
  'src/app/features/test-result',
  'src/app/features/profile',
];

// ============================================================================
// 2. МАССИВ ПУСТЫХ ФАЙЛОВ (content = "")
// ============================================================================
const emptyFiles = [
  'src/main.ts',
  'src/styles.css',
  'src/environments/environment.ts',
  'src/app/app.component.ts',
  'src/app/app.config.ts',
  'src/app/app.routes.ts',
  'src/app/core/models/index.ts',
  'src/app/core/services/api.service.ts',
  'src/app/core/services/auth.service.ts',
  'src/app/core/services/article.service.ts',
  'src/app/core/services/progress.service.ts',
  'src/app/core/services/test-session.service.ts',
  'src/app/core/interceptors/auth.interceptor.ts',
  'src/app/core/guards/auth.guard.ts',
  'src/app/shared/components/header/header.component.ts',
  'src/app/shared/components/progress-bar/progress-bar.component.ts',
  'src/app/exercises/base-exercise.component.ts',
  'src/app/exercises/exercise-host/exercise-host.component.ts',
  'src/app/exercises/feedback-panel/feedback-panel.component.ts',
  'src/app/exercises/multiple-choice/multiple-choice.component.ts',
  'src/app/exercises/match-pairs/match-pairs.component.ts',
  'src/app/exercises/fill-the-blank/fill-the-blank.component.ts',
  'src/app/exercises/true-false/true-false.component.ts',
  'src/app/exercises/order-steps/order-steps.component.ts',
  'src/app/exercises/prompt-builder/prompt-builder.component.ts',
  'src/app/features/landing/landing.component.ts',
  'src/app/features/auth/login.component.ts',
  'src/app/features/auth/register.component.ts',
  'src/app/features/catalog/catalog.component.ts',
  'src/app/features/course/course.component.ts',
  'src/app/features/article/article.component.ts',
  'src/app/features/test/test.component.ts',
  'src/app/features/test-result/test-result.component.ts',
  'src/app/features/profile/profile.component.ts',
];

// ============================================================================
// 3. ФАЙЛЫ С СОДЕРЖИМЫМ { путь: содержимое }
// ============================================================================
const filesWithContent = {
  'src/index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Frontend App</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <app-root></app-root>
</body>
</html>`,

  'package.json': `{
  "name": "frontend",
  "version": "1.0.0",
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/compiler": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/platform-browser-dynamic": "^17.0.0",
    "@angular/router": "^17.0.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^17.0.0",
    "@angular/cli": "^17.0.0",
    "@angular/compiler-cli": "^17.0.0",
    "typescript": "~5.2.0"
  }
}`,

  'angular.json': `{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "frontend": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/frontend",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.json",
            "assets": ["src/favicon.ico", "src/assets"],
            "styles": ["src/styles.css"],
            "scripts": []
          }
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "buildTarget": "frontend:build"
          }
        }
      }
    }
  }
}`,

  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": false,
    "module": "ES2022",
    "moduleResolution": "node",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "./dist/out-tsc",
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}`
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Создаёт файл с проверкой на существование
 * @param {string} filePath - путь относительно корня проекта
 * @param {string} content - содержимое файла
 */
function createFile(filePath, content = '') {
  const fullPath = path.join(process.cwd(), filePath);
  
  // Критично: проверка перед записью
  if (fs.existsSync(fullPath)) {
    console.log(`⏭️ Skipped (exists): ${filePath}`);
    skipped++;
    return;
  }
  
  // Создаём директорию рекурсивно (кроссплатформенно)
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  
  // Записываем файл (пустой или с контентом)
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Created: ${filePath}`);
  created++;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
console.log('🚀 Starting project setup...\n');

// 1. Создаём директории (для явных пустых папок, если потребуются в будущем)
for (const dir of dirs) {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created dir: ${dir}`);
  }
}

// 2. Создаём пустые файлы
for (const file of emptyFiles) {
  createFile(file, '');
}

// 3. Создаём файлы с контентом
for (const [filePath, content] of Object.entries(filesWithContent)) {
  createFile(filePath, content);
}

// 4. Итоговая сводка
console.log('\n' + '='.repeat(50));
console.log('📊 Setup complete!');
console.log(`✅ Created: ${created} files`);
console.log(`⏭️ Skipped: ${skipped} files`);
console.log('='.repeat(50));