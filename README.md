# Проект: Приложение для создание полигонов

### _Ссылка:_ https://kochetkov1.github.io/polygon-creator/
___
## Установка
- npm i
- npm start
- npm run build (Продакшен-сборка)

## Описание
### Основные функции:
1. Создание полигона:
- Добавление точек кликами (3–15 точек)
- Визуализация точек и линий полигона
- Валидация количества точек (цветовая индикация)
2. Построение пути:
- Выбор стартовой и конечной точек
- Автоматическое соединение точек по часовой стрелке/против
- Анимация отрисовки пути
3. Сохранение состояния:
- Автосохранение в localStorage
- Восстановление при перезагрузке страницы
- Очистка данных (кнопка Clear)

### Технологии:
- Web Components API (кастомные элементы, Shadow DOM)
- SVG для отрисовки графики
- Webpack (сборка, оптимизация, обработка CSS)
- LocalStorage (сохранение состояния)
- Современный JavaScript (ES6+)

### Особенности:
- Изолированные стили через Shadow DOM
- Темная тема с CSS-переменными
- Адаптивный интерфейс
- Интерактивные элементы с анимациями
- Поддержка современных браузеров

### Структура:
- Рабочая область (канвас) + панель управления
- Интуитивные кнопки с иконками
- Информационная панель с текущим путём
