CLAUDE.md — 01-Shazam

1. Назначение проекта

"01-Shazam" — приложение для распознавания музыки и работы с медиа.

Проект создаётся как полноценная production-oriented система с разделением ответственности между frontend, backend и AI/media-сервисом.

Главная архитектура:

React Frontend
      │
      │ HTTP / REST API
      ▼
Laravel Backend
      │
      ├── Authentication
      ├── Authorization / Permissions
      ├── Users
      ├── Downloads
      ├── History
      ├── API orchestration
      └── Database
      │
      │ HTTP
      ▼
FastAPI AI / Media Service
      │
      ├── Recognition
      ├── YouTube
      ├── TikTok
      ├── Audio processing
      └── AI integrations

Laravel является главным API Gateway / Gatekeeper между frontend и внутренними сервисами.

Frontend не должен напрямую получать секретные API keys или обращаться к AI-сервисам там, где это может нарушить безопасность архитектуры.

---

2. Структура проекта

01-Shazam/
├── frontend/       # React + Vite
├── backend/        # Laravel API
├── ai/             # FastAPI service
├── CLAUDE.md       # эта инструкция
└── README.md       # общая документация проекта

Перед изменением архитектуры обязательно изучить:

CLAUDE.md
README.md

Если существует дополнительная документация внутри конкретной директории — также изучить её перед изменениями.

---

3. Главный принцип работы

Не изменять код вслепую.

Перед реализацией задачи:

1. Понять существующую архитектуру.
2. Найти связанные файлы.
3. Проверить существующие routes/controllers/services/models/components.
4. Проверить README и документацию.
5. Определить, в каком слое должна находиться новая логика.
6. Только после этого изменять код.

Не создавать новую архитектуру, если существующая архитектура уже решает задачу.

Если предлагается архитектурное изменение — сначала объяснить:

- зачем оно нужно;
- какую проблему решает;
- какие файлы затронет;
- какие есть альтернативы;
- какие будут последствия.

---

4. Правила архитектуры

Frontend

Frontend отвечает за:

- UI;
- UX;
- состояние интерфейса;
- авторизацию на клиенте;
- отправку HTTP-запросов;
- отображение результатов API.

Frontend НЕ должен:

- хранить секретные API keys;
- напрямую обращаться к LLM API;
- напрямую обращаться к внутренним FastAPI-сервисам без архитектурной необходимости;
- содержать бизнес-логику, которая должна находиться на backend.

Использовать Axios для HTTP-запросов.

Основной API:

http://localhost:8000/api

---

5. Laravel Backend

Laravel является основным backend API.

Laravel отвечает за:

- authentication;
- authorization;
- users;
- permissions;
- rate limiting;
- business logic;
- database;
- downloads;
- history;
- orchestration;
- взаимодействие с FastAPI;
- безопасность API.

Текущая база данных разработки:

SQLite

В дальнейшем production database может быть PostgreSQL.

Не переносить проект на PostgreSQL только ради эксперимента без необходимости.

---

6. Authentication

Используется Laravel Sanctum.

Frontend отправляет Bearer token:

Authorization: Bearer TOKEN

Не менять Sanctum на JWT без отдельного архитектурного решения.

Если задача требует изменения authentication architecture — сначала объяснить преимущества, недостатки и последствия.

---

7. FastAPI

FastAPI находится:

ai/

Основной файл:

ai/main.py

FastAPI отвечает за AI/media-related задачи.

Примеры:

- music recognition;
- получение media;
- YouTube;
- TikTok;
- audio processing;
- интеграции с AI;
- адаптеры источников.

FastAPI не должен становиться вторым Laravel.

Laravel остаётся главным API Gateway для frontend.

---

8. Source adapters

Для внешних источников использовать отдельные adapters.

Например:

YouTubeAdapter
TikTokAdapter

Не смешивать код YouTube и TikTok в одном огромном endpoint.

Предпочтительная архитектура:

FastAPI
  │
  ├── sources/
  │     ├── youtube/
  │     ├── tiktok/
  │     └── ...
  │
  ├── services/
  ├── adapters/
  └── main.py

При добавлении нового источника стараться использовать тот же паттерн.

---

9. API

Текущие Laravel API должны сохранять понятную структуру.

Пример:

/api/register
/api/login
/api/logout
/api/health
/api/downloads
/api/downloads/{download}/file
/api/shazam/recognize

Перед добавлением нового endpoint:

1. проверить, нет ли уже существующего;
2. определить HTTP method;
3. определить authentication requirement;
4. определить validation;
5. определить response format;
6. определить ошибки;
7. определить ownership/permissions.

---

10. Database

Не изменять database schema вручную напрямую, если изменение должно быть постоянным.

Использовать Laravel migrations.

Пример:

php artisan make:migration create_example_table

После изменения migration проверить:

php artisan migrate

Не удалять существующие migrations без серьёзной причины.

Если migration уже использовалась в общей истории проекта, предпочтительно создавать новую migration для изменения schema.

---

11. Downloads

Downloads являются отдельной domain area.

Таблица:

downloads

Backend отвечает за:

- создание записи;
- пользователя-владельца;
- metadata;
- состояние загрузки;
- доступ к файлу;
- историю загрузок.

Проверять ownership:

user -> download

Пользователь не должен иметь возможность получить чужой файл только изменив ID в URL.

---

12. Security

Безопасность является частью архитектуры, а не дополнительной функцией.

Никогда не помещать в frontend:

API keys
LLM keys
database credentials
private tokens
server credentials

Не добавлять секреты в Git.

Проверять:

.env
.env.*

Если появляется новый secret/config:

1. добавить его в ".env";
2. добавить пример в ".env.example";
3. не коммитить реальное значение.

---

13. Validation

Входные данные от пользователя считать недоверенными.

Laravel:

- Form Request;
- validation;
- authorization.

FastAPI:

- Pydantic models;
- validation;
- explicit response models.

Не доверять данным только потому, что запрос пришёл от frontend.

---

14. Error handling

API должен возвращать предсказуемые ошибки.

Не отдавать пользователю:

stack trace
database credentials
internal paths
API keys
private service information

В development допустимы подробные логи.

В production наружу отдаётся безопасное сообщение.

---

15. Logging

Логи должны помогать диагностировать систему.

Предпочтительно логировать:

request
user id
operation
service
duration
status
error

Не логировать:

password
tokens
API keys
cookies
secret values

---

16. Local development

Laravel:

cd backend
php artisan serve --host=127.0.0.1 --port=8000

FastAPI запускается внутри Ubuntu environment.

Пример:

cd ai
uvicorn main:app --reload --host=127.0.0.1 --port=8001

Laravel:

127.0.0.1:8000

FastAPI:

127.0.0.1:8001

---

17. Ubuntu / Termux

Разработка выполняется на Android через Termux.

Ubuntu используется для запуска Linux-oriented окружения и FastAPI.

Не предполагать, что команда запускается из домашней директории.

Перед командами учитывать текущую директорию.

Проверять:

pwd

если расположение неизвестно.

Проект находится:

/data/data/com.termux/files/home/MyProjects/01-Shazam

---

18. Claude Code

Claude Code должен работать как инженер проекта, а не как генератор случайного кода.

Перед крупной задачей:

1. Исследовать repository.
2. Найти связанные файлы.
3. Понять зависимости.
4. Сформировать план.
5. Реализовать.
6. Проверить.
7. Объяснить изменения.

Не переписывать весь проект без необходимости.

Не удалять рабочий код ради упрощения.

Не менять несколько архитектурных слоёв одновременно без причины.

---

19. Работа с документацией

Документация проекта является источником архитектурного контекста.

Перед реализацией задачи учитывать:

CLAUDE.md
README.md
локальную документацию
комментарии в коде
существующие migrations
routes
services
tests

После существенного архитектурного изменения обновлять документацию.

Особенно документировать:

- новые сервисы;
- новые API;
- новые environment variables;
- новые зависимости;
- архитектурные решения;
- deployment;
- database changes.

---

20. README

README должен постепенно становиться основной картой проекта.

В README желательно иметь:

Project overview
Architecture
Directory structure
Requirements
Installation
Local development
API
Environment variables
Database
FastAPI
Frontend
Deployment
Troubleshooting
Architecture decisions

Не писать в README ложную информацию.

Если что-то не проверено — помечать как TODO или проверить перед записью.

---

21. Dependencies

Перед добавлением зависимости проверить:

1. нужна ли она действительно;
2. нет ли уже существующего решения;
3. влияет ли она на bundle/runtime;
4. является ли она production dependency или development dependency.

Для npm:

Production:

npm install package

Development:

npm install -D package

Не устанавливать пакет в production dependencies, если он нужен только для разработки.

---

22. Code style

Предпочитать:

- маленькие функции;
- понятные имена;
- single responsibility;
- явные зависимости;
- минимальную связанность;
- повторное использование компонентов;
- отсутствие дублирования.

Не создавать чрезмерную абстракцию заранее.

Но и не складывать всю бизнес-логику в один Controller или React component.

---

23. React

Компоненты должны отвечать за UI.

Не превращать:

Home.jsx

в огромный файл со всей бизнес-логикой приложения.

При росте логики выделять:

components/
services/
hooks/
context/
utils/

Axios API logic держать в соответствующем service layer.

---

24. Laravel Controllers

Controller должен быть относительно тонким.

Не помещать всю бизнес-логику непосредственно в Controller.

При усложнении:

Controller
    ↓
Service
    ↓
Repository / Model / External API

Не создавать Service/Repository просто ради паттерна.

Абстракция должна решать реальную проблему.

---

25. FastAPI architecture

Не превращать:

main.py

в огромный файл.

При росте проекта разделять:

routers/
services/
adapters/
models/
schemas/
core/

Пример:

ai/
├── main.py
├── routers/
├── services/
├── adapters/
├── schemas/
├── models/
└── core/

---

26. Testing

После изменения функциональности проверять минимум:

syntax
application startup
endpoint
database
authentication
authorization

Если для функциональности существуют tests — запускать их.

Не заявлять, что задача завершена, если код не был проверен.

---

27. Git

Не выполнять destructive Git commands без явного разрешения пользователя.

Особенно осторожно с:

git reset --hard
git clean -fd
git checkout .
git restore .

Перед значимым изменением желательно проверить:

git status

После завершения логического этапа напоминать о необходимости meaningful commit.

Примеры:

feat: add download history
fix: protect download ownership
refactor: extract media adapters
docs: update architecture

Не создавать commit ради каждой мелкой строки.

---

28. Архитектурные решения

Если есть несколько вариантов реализации, Claude должен показать их кратко.

Например:

Вариант A
Плюсы:
Минусы:

Вариант B
Плюсы:
Минусы:

Рекомендация по архитектурным причинам:
...

Не принимать крупные архитектурные решения молча.

Особенно это касается:

- authentication;
- database;
- queues;
- Redis;
- Docker;
- microservices;
- caching;
- AI providers;
- storage;
- deployment;
- security.

---

29. Production mindset

Проект сейчас может быть учебным/portfolio проектом, но архитектуру необходимо постепенно строить с пониманием production.

Учитывать:

security
observability
scalability
fault tolerance
performance
data consistency
deployment
backup
recovery
rate limiting
caching
queues

Но не внедрять сложные технологии только ради того, чтобы они присутствовали.

Например:

Redis
Kafka
Kubernetes
microservices
event sourcing
CQRS

не должны появляться без конкретной проблемы, которую они решают.

---

30. AI integrations

AI API keys должны находиться только на backend/server side.

Frontend:

React
   ↓
Laravel
   ↓
FastAPI
   ↓
AI Provider

Не:

React
   ↓
AI Provider

если это раскрывает секретный ключ.

При добавлении AI provider использовать abstraction, чтобы в будущем можно было заменить provider.

---

31. Privacy

Пользовательские данные должны обрабатываться минимально необходимым способом.

Не отправлять во внешний AI сервис данные, которые не нужны для конкретной операции.

Если используется внешний AI:

Laravel → FastAPI → AI Provider

перед отправкой определить:

- какие данные нужны;
- какие можно удалить;
- какие можно агрегировать;
- какие являются чувствительными.

---

32. Что делать, если задача сформулирована неясно

Не угадывать архитектуру.

Если задача имеет несколько принципиально разных трактовок — задать уточняющий вопрос.

Если можно безопасно сделать разумное предположение — сделать его и явно сообщить:

Я предполагаю X, потому что Y.

---

33. Что запрещено

Не делать без причины:

массовый rewrite проекта
смену framework
смену database
смену authentication
удаление существующей функциональности
удаление migrations
удаление routes
удаление dependencies
изменение .env

Не скрывать ошибки.

Если что-то не работает — сообщить:

Что ожидалось
Что произошло
Где ошибка
Что проверено
Что предлагается сделать

---

34. Приоритеты

При конфликте требований приоритет:

1. Security
2. Data integrity
3. Existing architecture
4. Correctness
5. Maintainability
6. Performance
7. Developer convenience

---

35. Стиль ответов Claude Code

Ответы должны быть конкретными.

После выполнения задачи сообщать:

Что изменено
Какие файлы изменены
Почему
Как проверить
Есть ли проблемы
Следующий логический шаг

Не писать длинные общие рассуждения, если задача простая.

Для архитектурных задач объяснять reasoning достаточно подробно.

---

36. Главный принцип

Не писать код ради количества кода.

Каждое изменение должно отвечать на вопрос:

«Какую проблему системы это решает?»

Если проблема не определена — сначала определить проблему.

Цель проекта:

Не просто работающий код,
а понятная, безопасная и масштабируемая система.