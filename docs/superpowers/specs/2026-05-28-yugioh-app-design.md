# YGODEX — Diseño de la aplicación Yu-Gi-Oh

**Fecha:** 2026-05-28  
**Estado:** Aprobado  
**Proyecto:** `C:\proyectos\yugioh\`

---

## 1. Visión general

SPA React completa que combina una base de datos de cartas Yu-Gi-Oh (Carta-Dex) con un Deck Builder integrado. Consume la API pública de YGOPRODeck. La interfaz es completamente en español; los datos de las cartas (nombre, descripción, stats) permanecen en inglés tal como los entrega la API.

La app está diseñada con **progressive disclosure**: limpia e intuitiva para jugadores nuevos, con toda la potencia accesible para veteranos sin abrumar.

---

## 2. Identidad visual

### Paleta principal
| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#08040f` | Fondo OLED principal |
| `--surface` | `#100820` | Cards, paneles |
| `--surface-2` | `#180c30` | Hover states, zonas elevadas |
| `--primary` | `#8060ff` | Acento morado |
| `--primary-2` | `#60a0ff` | Acento azul |
| `--white` | `#c0d8ff` | Texto principal |
| `--text` | `#d0c8f0` | Texto secundario |
| `--muted` | `#5a4a8a` | Labels, placeholders |
| `--border` | `rgba(128,96,255,0.15)` | Bordes de cards |

Gradiente de marca: `linear-gradient(90deg, #8060ff, #60a0ff, #c0d8ff)` — inspirado en la paleta "Duel Energy" del anime (morado Magia Oscura → azul dragón).

### Logo
Blue-Eyes White Dragon (thumbnail del API, 32×44px) + texto **YGODEX** en gradiente de marca + subtítulo "CARD DATABASE" en `--muted`. El glow de la imagen usa `box-shadow: 0 0 10px #8060ff55`.

### Colores por tipo de carta
| Tipo | BG | Color texto |
|---|---|---|
| Monstruo | `#2a1800` | `#f97316` |
| Magia | `#002a14` | `#4ade80` |
| Trampa | `#2a0016` | `#f472b6` |
| Fusión | `#1a0038` | `#c084fc` |
| Sincronía | `#1a1a1a` | `#e2e8f0` |
| XYZ | `#e8e0cc` | `#080806` |
| Link | `#001a3a` | `#60a5fa` |
| Ritual | `#001a2a` | `#38bdf8` |

### Degradé reactivo en vista detalle
El panel de detalle de cada carta tiene un `radial-gradient` tenue en la esquina superior izquierda (donde está la imagen) que se desvanece hacia el centro. El color base proviene del atributo de la carta:

| Atributo | Color |
|---|---|
| LIGHT | `#60a0ff` |
| DARK | `#8040cc` |
| FIRE | `#ef4444` |
| WATER | `#06b6d4` |
| EARTH | `#84cc16` |
| WIND | `#34d399` |
| DIVINE | `#ffd700` |

El color de los stats (ATK/DEF) y el botón "Agregar al mazo" también adoptan el color del atributo.

### Light / Dark mode
Toggle en el header. Implementado añadiendo/removiendo la clase `dark` en `<html>`. El estado persiste en localStorage. Tailwind `dark:` prefixes en todos los componentes.

---

## 3. Arquitectura de la experiencia (UX)

### Patrón: Progressive Disclosure
- **Principiante:** Ve búsqueda por nombre + filtros de tipo (Monstruo/Magia/Trampa). Cards con imagen, nombre y tipo. Deck Builder con barras de progreso claras.
- **Veterano:** Despliega el panel "+ Filtros avanzados" (1 clic) para acceder a raza, atributo, arquetipo, nivel, rango de ATK/DEF y formato (TCG/OCG/Goat). Panel "Análisis" colapsable en el Deck Builder con curva de niveles y precio total.

### Chip flotante en el header
Muestra `N / 40` del mazo activo. Al hacer clic navega a `/decks/:id` del mazo activo. Siempre visible en todas las rutas.

### Deck Builder — layout responsivo
- **Desktop:** Split view — buscador de cartas (izquierda 1.4fr) + zonas del mazo (derecha 1fr).
- **Mobile:** Tabs "Buscar" / "Mi Mazo" — mismo contenido, vista alternada.

---

## 4. Rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Home` | Hero con búsqueda rápida, stats globales, accesos a Carta-Dex y Mazos |
| `/cards` | `Cards` | Grid de cartas con filtros |
| `/cards/:id` | `CardDetail` | Detalle completo de carta |
| `/decks` | `Decks` | Galería de mazos guardados en localStorage |
| `/decks/:id` | `DeckBuilder` | Constructor de mazo — split view |

Todas las rutas usan `createBrowserRouter` (React Router v7). `vercel.json` con rewrite SPA para evitar 404 en navegación directa.

---

## 5. Features

### Carta-Dex (`/cards`)
- Búsqueda fuzzy por nombre — letra a letra, sin debounce visible
- **Filtros básicos (siempre visibles):** Tipo (Monstruo / Magia / Trampa)
- **Filtros avanzados (colapsables):** Atributo, Raza, Arquetipo, Nivel/Rango, ATK min/max, DEF min/max, Formato (TCG/OCG/Goat)
- Combinación de filtros con intersección
- Paginación de 20 en 20 con "Cargar más"
- Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
- Badge de banlist en cada card: 🚫 Prohibida / ⚠ Limitada / ½ Semi-limitada

### Vista detalle (`/cards/:id`)
- Imagen HD (`images/cards_cropped/` para la vista principal, fallback a `images/cards/`)
- Nombre, tipo, atributo, raza, nivel/rango
- Stats ATK / DEF con color del atributo
- Descripción completa (efecto o flavor text)
- Banlist badge TCG con estado actual
- Precio USD (TCGPlayer avg desde la API)
- Botón "Agregar al mazo activo" → añade al Main, Extra o Side según el tipo de carta
- Navegación prev/next sin volver al listado

### Deck Builder (`/decks/:id`)
- **Main Deck** — 40 a 60 cartas, validación en tiempo real
- **Extra Deck** — 0 a 15 cartas (Fusión, Sincronía, XYZ, Link)
- **Side Deck** — 0 a 15 cartas
- Validación: máx 3 copias de una carta (1 si está limitada, 0 si está prohibida)
- Barra de progreso por zona con color propio
- Grid de miniaturas de cartas en cada zona
- Panel "Análisis" colapsable:
  - Distribución Monstruo/Magia/Trampa (barra segmentada + leyenda)
  - Curva de niveles (barras verticales)
  - Precio total del mazo en USD
- Exportar mazo en formato `.ydk` (compatible con EDOPRO / YGOPRODeck)
- Guardar / cargar múltiples mazos en localStorage

### Persistencia (localStorage)
- Clave `ygodex-decks` — array de mazos via Zustand + persist middleware
- Clave `ygodex-active-deck` — ID del mazo activo para el chip del header
- Clave `ygodex-theme` — preferencia light/dark

---

## 6. API

**Base URL:** `https://db.ygoprodeck.com/api/v7/cardinfo.php`  
**Rate limit:** 20 req/seg — no requiere key  
**Idioma:** inglés (único disponible para nombre y descripción)

### Endpoints usados
```
GET /cardinfo.php?fname={nombre}                    # búsqueda fuzzy
GET /cardinfo.php?id={id}                           # carta individual
GET /cardinfo.php?type={tipo}                       # filtro por tipo
GET /cardinfo.php?attribute={attr}                  # filtro por atributo
GET /cardinfo.php?race={raza}                       # filtro por raza
GET /cardinfo.php?archetype={arq}                   # filtro por arquetipo
GET /cardinfo.php?level={n}                         # filtro por nivel
GET /cardinfo.php?banlist_info=yes                  # incluir info de banlist
GET /cardinfo.php?misc=yes                          # incluir viewings, fecha...
GET /cardinfo.php?num=20&offset={n}                # paginación
```

Parámetros combinables con `&`. `TanStack Query` con `staleTime: Infinity` para cachear respuestas.

---

## 7. Stack técnico

| Librería | Versión | Uso |
|---|---|---|
| React | 19 | UI |
| Vite | 8 | Build tool |
| TypeScript | 5 | Tipado |
| TailwindCSS | 3 | Estilos + dark mode |
| TanStack Query | 5 | Fetching + cache |
| Zustand | 5 | Estado de mazos + persist |
| React Router | 7 | `createBrowserRouter` |
| Framer Motion | 12 | Animaciones de cards y paneles |

---

## 8. Estructura de carpetas

```
yugioh/
├── src/
│   ├── api/
│   │   └── cards.ts          # getCards, getCard, getCardsByType, etc.
│   ├── components/
│   │   ├── layout/           # Navbar, Layout, ChipDeck, ThemeToggle
│   │   ├── cards/            # CardGrid, CardMini, CardDetail, TypeBadge, BanBadge
│   │   └── deck/             # DeckZone, DeckMiniGrid, DeckStats, LevelCurve
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Cards.tsx
│   │   ├── CardDetail.tsx
│   │   ├── Decks.tsx
│   │   └── DeckBuilder.tsx
│   ├── store/
│   │   ├── deckStore.ts      # Zustand + persist — mazos y mazo activo
│   │   └── themeStore.ts     # light/dark preference
│   ├── hooks/
│   │   ├── useCardSearch.ts
│   │   ├── useCardDetail.ts
│   │   └── useDeckBuilder.ts
│   ├── types/
│   │   └── ygo.ts            # YGOCard, Deck, DeckZone, BanlistStatus, CardAttribute
│   ├── constants/
│   │   ├── typeColors.ts     # TYPE_COLORS, ATTRIBUTE_COLORS
│   │   ├── cardTypes.ts      # ALL_TYPES, EXTRA_DECK_TYPES
│   │   └── deckRules.ts      # MIN_MAIN, MAX_MAIN, MAX_EXTRA, MAX_COPIES, etc.
│   └── utils/
│       ├── deckValidator.ts  # validateDeck, canAddCard
│       ├── ydkExporter.ts    # exportToYdk(deck): string
│       └── priceCalc.ts      # calcDeckPrice(deck): number
│
├── backend/                  # Carpeta lista — backend inactivo por ahora
│   ├── routes/               # /api/decks, /api/users (futuro)
│   ├── models/               # Deck, User — Prisma o Mongoose (por decidir)
│   ├── controllers/          # deckController, authController
│   ├── middleware/           # auth, validate
│   └── README.md             # Instrucciones para activar el backend
│
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── vercel.json               # rewrite SPA
└── tsconfig.json
```

---

## 9. Futuro (post-deploy)

1. **Backend activo** — activar carpeta `backend/`, conectar DB (Prisma + PostgreSQL o MongoDB)
2. **Autenticación** — login con Google o email para persistir mazos en la nube
3. **Compartir mazos** — URL única por mazo
4. **Traducción al español** — endpoint propio que mapea card ID → nombre y descripción en español, construido progresivamente con las cartas más populares primero
5. **Precio en tiempo real** — webhook o cron para actualizar precios sin llamar al API en cada render

---

## 10. Limitaciones conocidas

- La API de YGOPRODeck no entrega datos en español — los nombres y descripciones de cartas estarán en inglés hasta que se implemente el backend propio
- Rate limit de 20 req/seg — el caché de TanStack Query (`staleTime: Infinity`) mitiga esto en sesión, pero la primera carga por tipo puede ser lenta
- localStorage tiene límite ~5MB — suficiente para docenas de mazos pero no ilimitado
