// setup.js
const fs = require('fs');
const path = require('path');

// 1. Массив директорий
const dirs = [
  'server',
  'server/src',
  'server/src/config',
  'server/src/db',
  'server/src/db/repositories',
  'server/src/middleware',
  'server/src/routes',
  'server/src/data'
];

// 2. Массив пустых файлов (literally empty string)
const emptyFiles = [
  'server/src/index.js',
  'server/src/app.js',
  'server/src/config/index.js',
  'server/src/db/index.js',
  'server/src/db/jsonStore.js',
  'server/src/db/repositories/userRepo.js',
  'server/src/db/repositories/articleRepo.js',
  'server/src/db/repositories/testRepo.js',
  'server/src/db/repositories/progressRepo.js',
  'server/src/db/repositories/attemptRepo.js',
  'server/src/middleware/auth.js',
  'server/src/middleware/error.js',
  'server/src/routes/auth.js',
  'server/src/routes/articles.js',
  'server/src/routes/tests.js',
  'server/src/routes/progress.js'
];

// 3. Объект { путь: содержимое } для файлов с данными
// Примечание: все data/*.json инициализируются как '[]' для сохранения валидности JSON
const filesWithContent = {
  'server/package.json': JSON.stringify({
    name: 'server',
    version: '1.0.0',
    main: 'src/index.js',
    scripts: {
      "start": "node src/index.js",
      "dev": "node --watch src/index.js"
    },
    dependencies: {}
  }, null, 2),
  'server/.env.example': 'PORT=3000\nNODE_ENV=development\n',
  'server/src/data/users.json': '[]',
  'server/src/data/courses.json': '[]',
  'server/src/data/articles.json': '[]',
  'server/src/data/tests.json': '[]',
  'server/src/data/progress.json': '[]',
  'server/src/data/attempts.json': '[]'
};

let createdCount = 0;
let skippedCount = 0;

console.log('🚀 Начинаю инициализацию структуры проекта...\n');

// Создание директорий (recursive: true обеспечивает кроссплатформенную безопасность)
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Функция для безопасного создания файла
function createFile(filePath, content) {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`⏭️ Skipped (exists): ${filePath}`);
    skippedCount++;
  } else {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Created: ${filePath}`);
    createdCount++;
  }
}

// Создание пустых файлов
emptyFiles.forEach(file => createFile(file, ''));

// Создание файлов с содержимым
for (const [file, content] of Object.entries(filesWithContent)) {
  createFile(file, content);
}

// 5. Итоговая сводка
console.log('\n📊 Итоговая сводка:');
console.log(`✅ Создано файлов: ${createdCount}`);
console.log(`⏭️ Пропущено файлов: ${skippedCount}`);
console.log('🎉 Инициализация завершена.');