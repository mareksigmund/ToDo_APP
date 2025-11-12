# 📝 ToDo App

Repozytorium zawiera dwa główne projekty:

- **ToDo.Api** – backend (ASP.NET Core 8 Web API + PostgreSQL, EF Core, testy xUnit)
- **ToDo.Front** – frontend (aplikacja kliencka komunikująca się z API)

```text
.
├── ToDo.Api/ # Backend (.NET 8 + PostgreSQL + EF Core)
| ├── ToDo.Api.Tests/ # Testy jednostkowe backendu (xUnit)
├── ToDo.Front/ # Frontend (Angular 20, standalone components, zoneless change detection)
└── docker-compose.yml
```

---

## Backend – ToDo.Api

Backend został zbudowany z użyciem:

- **.NET 8** (ASP.NET Core Web API)
- **Entity Framework Core 8**
- **PostgreSQL 16** (Docker)
- **Npgsql.EntityFrameworkCore.PostgreSQL**
- **Swagger / OpenAPI** (włączony w trybie Development)
- **xUnit** + **Microsoft.EntityFrameworkCore.InMemory** (testy jednostkowe)
- Profile uruchomieniowe zdefiniowane w `Properties/launchSettings.json`

### Wymagane narzędzia

- [.NET SDK 8.0](https://dotnet.microsoft.com/)
- [Docker Desktop](https://www.docker.com/) lub inne środowisko obsługujące Docker
- (opcjonalnie) narzędzie `dotnet-ef`, jeśli chcesz ręcznie zarządzać migracjami:

```bash
  dotnet tool install --global dotnet-ef
```

---

## Struktura repozytorium

```text

ToDo.Api/
├── Controllers/
│   └── TodosController.cs         # Kontroler API dla operacji na zadaniach
├── Models/
│   └── ToDoItem.cs                # Model encji ToDo
├── Data/
│   └── AppDbContext.cs            # Konfiguracja EF Core i DbSet<ToDoItem>
├── Dtos/
│   ├── CreateToDoItemDto.cs       # DTO do tworzenia zadania
│   ├── EditToDoItemDto.cs         # DTO do edycji zadania
│   └── ToDoItemDto.cs             # DTO zwracany przez API
├── Program.cs                     # Rejestracja usług, EF Core, CORS, Swagger
├── appsettings.json               # Konfiguracja, w tym connection string
└── docker-compose.yml             # (w katalogu głównym repo) konfiguracja PostgreSQL

ToDo.Api.Tests/
└── Controllers/
    └── TodosControllerTests.cs    # Testy jednostkowe kontrolera TodosController

```

## Baza danych – PostgreSQL (Docker)

W katalogu głównym repozytorium (tam, gdzie znajduje się docker-compose.yml) uruchom:

```bash
docker compose up -d
```

Domyślna konfiguracja kontenera PostgreSQL (W razie potrzeby można edytować w pliku .yml):

|           Zmienna | Wartość |
| ----------------: | :------ |
|     POSTGRES_USER | todo    |
| POSTGRES_PASSWORD | todo    |
|       POSTGRES_DB | todo    |
|              Port | 5432    |

Connection string używany przez API w razie potrzeby można nadpisać w pliku `appsettings.json`

## Migracje bazy danych

### Opcja 1 – .NET CLI (dotnet-ef)

1. **Przejdź do katalogu projektu API:**

```bash
cd ToDo.Api
```

2. **Zastosuj migracje:**

```bash
dotnet ef database update
```

_Jeśli migracje nie istnieją (np. przy świeżym projekcie), należy je utworzyć:_

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Opcja 2 – Visual Studio (Package Manager Console)

1. **Otwórz Package Manager Console.**

2. **Ustaw ToDo.Api jako domyślny projekt.**

3. **Wykonaj:**

```bash
Update-Database
```

_W razie potrzeby utworzenia migracji:_

```bash
Add-Migration InitialCreate
Update-Database
```

## Uruchomienie API

### Opcja 1 – .NET CLI

1. **W katalogu ToDo.Api:**

```bash
dotnet run
```

_Domyślnie użyty zostanie profil z launchSettings.json w razie potrzeby można zmodyfikować porty._

### Opcja 2 – Visual Studio

1. Otwórz solution.

2. Ustaw ToDo.Api jako projekt startowy.

3. Uruchom (F5 / Run). Przeglądarka otworzy się automatycznie na /swagger.

Domyślny adres: [http://localhost:5000]

## Kluczowe endpointy

| Metoda | Endpoint                 | Opis                                        |
| ------ | ------------------------ | ------------------------------------------- |
| GET    | `/api/todos`             | Pobiera listę wszystkich zadań              |
| GET    | `/api/todos/{id}`        | Pobiera pojedyncze zadanie po ID            |
| POST   | `/api/todos`             | Tworzy nowe zadanie                         |
| PUT    | `/api/todos/{id}`        | Aktualizuje tytuł/opis istniejącego zadania |
| PUT    | `/api/todos/{id}/toggle` | Przełącza status ukończenia (`IsCompleted`) |
| DELETE | `/api/todos/{id}`        | Usuwa zadanie                               |

## Testy jednostkowe – ToDo.Api.Tests

Testy są oparte na xUnit oraz EF Core InMemory. Sprawdzają kluczowe zachowania kontrolera `TodosController` (przykładowe testy):

- `Create_ShouldReturnCreated_AndPersistTodo`

  - oczekuje zwrócenia `CreatedAtActionResult` z poprawnym `ToDoItemDto`
  - oczekuje zapisania nowego zadania w bazie (InMemory)

- `ToggleStatus_ShouldFlipIsCompleted_WhenTodoExists`

  - pierwsze wywołanie `ToggleStatus` ustawia `IsCompleted = true`
  - drugie wywołanie ustawia `IsCompleted = false`

- `GetById_ShouldReturnNotFound_WhenTodoDoesNotExist`
  - zapytanie o nieistniejące ID zwraca `404 NotFound`

Jak uruchomić testy

**W katalogu głównym repozytorium (lub w katalogu testów) uruchom:**

```bash
dotnet test
```

### Frontend – ToDo.Front

#### Wersje i środowisko

| Komponent   | Wersja  |
| ----------- | ------- |
| Angular CLI | 20.3.9  |
| Node.js     | 22.14.0 |
| npm         | 10.9.2  |

- **Angular 20** (standalone, zoneless)
- **Angular Router** – routing aplikacji
- **HttpClient + RxJS** – komunikacja z API, obsługa strumieni danych
- **ChangeDetectorRef** – ręczne odświeżanie widoków w trybie zoneless
- Komponenty jednozadaniowe: `TodoList`, `TodoCreate`, `TodoEdit`, `TodoDetails`

#### Struktura projektu

```text
src/
├─ app/
│  ├─ components/
│  │  ├─ todo-list/
│  │  ├─ todo-create/
│  │  ├─ todo-details/
│  │  └─ todo-edit/
│  ├─ models/
|  |    └─ todo.model/
│  └─ services/
|  |    └─ todo-service/
├─ app.routes.ts
├─ app.config.ts
├─ app.ts
└─ main.ts
```

#### Główne funkcjonalności

- Lista zadań – pobieranie z API (`/api/todos`)
- Dodawanie zadania – walidacja, automatyczne odświeżenie listy
- Edycja zadania – trasa `/todos/:id/edit`, edycja i zapis
- Usuwanie zadania – bez przeładowania strony
- Obsługa błędów i stanów ładowania
- Komunikacja z backendem .NET przez REST API

Aplikacja działa domyślnie pod adresem: [http://localhost:4200]

#### Jak uruchomić frontend

**W katalogu `ToDo.Front`:**

```bash
npm install
npm start
# lub:
ng serve
```

##### Konfiguracja proxy — `proxy.conf.json` (w razie potrzeby można edytować)

```json
{
  "/api": {
    "target": "https://localhost:5000",
    "secure": false,
    "changeOrigin": true
  }
}
```

- Żądania wysłane na `http://localhost:4200/api/*` są przekierowywane do `https://localhost:5000/api/*`
- `"secure": false` — ignoruje błędy certyfikatu SSL
- `"changeOrigin": true` — zmienia nagłówek `Host` na adres backendu

_Backend (`ToDo.Api`) musi być uruchomiony pod adresem `https://localhost:5000` (domyślne ustawienie w `Properties/launchSettings.json`)._

#### Testy jednostkowe (frontend)

Testy frontendowe przygotowano w oparciu o Jasmine + Karma, z wykorzystaniem modelu zoneless (Angular 20) i `provideZonelessChangeDetection`.

Zakres testów:

| Komponent   | Plik                 | Zakres                                      |
| ----------- | -------------------- | ------------------------------------------- |
| App         | app.spec.ts          | Inicjalizacja aplikacji i `<router-outlet>` |
| TodoList    | todo-list.spec.ts    | Pobieranie, usuwanie, toggle, nawigacja     |
| TodoCreate  | todo-create.spec.ts  | Walidacja, wysyłanie danych, obsługa błędów |
| TodoEdit    | todo-edit.spec.ts    | Edycja zadania, obsługa API                 |
| TodoDetails | todo-details.spec.ts | Reakcja na route.paramMap, błędy, nawigacja |

Jak uruchomić testy:

```bash
ng test
```

## Szybki start

1. **Uruchom bazę danych (PostgreSQL w Dockerze):**

```bash
  docker compose up -d
```

2. **Utwórz migracje**

```bash
Add-Migration InitialCreate
Update-Database
```

3. **Uruchom backend (API)**

```bash
dotnet run

```

4. **Uruchom frontend (Angular):**

```bash
cd ToDo.Front
npm install
npm start
```
