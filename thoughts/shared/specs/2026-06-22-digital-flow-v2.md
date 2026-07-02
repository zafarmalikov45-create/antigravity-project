# Digital Flow — Premium Agency Website v2.0

## Executive Summary
Digital Flow — это AI-автоматизационное агентство премиум-класса. Сайт является главным инструментом привлечения клиентов (CEO, Product Manager, разработчики), создавая мгновенное ощущение доверия, экспертизы и технологического превосходства. Главная метафора: агентство — это «нейронная сеть», соединяющая бизнес-процессы клиента с AI.

## Problem Statement
Обычные AI-агентства выглядят как стартапы с шаблонными landing page. Digital Flow должен выглядеть как McKinsey для AI — дорогой, эксклюзивный, технически глубокий. Посетитель должен почувствовать «вау» уже в первые 3 секунды.

## Success Criteria
- Посетитель остаётся >2 минут (scroll depth >70%)
- Конверсия в заявку: >3%
- Ощущение бренда: «Это лучшее AI-агентство, что я видел»
- Lighthouse Performance: >85 desktop

## User Personas
1. **CEO/Founder** — хочет видеть результаты, кейсы, доверие. Не читает — смотрит.
2. **Product Manager** — ищет конкретные услуги, понимает процесс, оценивает методологию.
3. **Developer/CTO** — проверяет техническую глубину, смотрит на детали реализации.

## User Journey
1. **Загрузка** → Минималистичный skeleton loader с фирменным spinner
2. **Hero** → Интерактивная 3D-сеть узлов заполняет экран. Заголовок «Digital Flow» появляется с 3D-трансформацией. Мышь притягивает частицы.
3. **Scroll → Section 2** → Сеть узлов трансформируется, текст улетает в глубину — плавный переход к секции услуг
4. **Services** → 4 карточки с glassmorphism, появляются при скролле
5. **Process** → 3 шага анимируются последовательно при скролле (GSAP ScrollTrigger)
6. **Contact** → Элегантная форма с glassmorphism, валидация

## Functional Requirements

### Must Have (P0)
- **Hero 3D Node Network**: Three.js сцена — светящиеся узлы соединены линиями, реагируют на движение мыши (притяжение/отталкивание). Узлы пульсируют, линии мерцают.
- **3D-заголовок в hero**: «Digital Flow» с эффектом depth — буквы появляются из «глубины» экрана при загрузке.
- **Scroll-triggered анимации**: GSAP ScrollTrigger на всех секциях — fade-in-up, stagger-cards, pinned sections.
- **Premium typography**: Outfit (заголовки, 800 weight) + светлые тона, много whitespace.
- **Glassmorphism cards**: Все карточки с backdrop-filter, subtle borders.
- **Process section**: 3 шага с иконками, анимируются при скролле последовательно.
- **Contact form**: Валидация, loading state, success state.
- **Mobile**: Полная отзывчивость, на мобильном — упрощённая 2D версия hero.

### Should Have (P1)
- **Animated counters**: Цифры (4.8M+ runs, 12ms latency) анимируются при появлении в viewport.
- **Marquee**: Горизонтальная бегущая строка с технологиями/интеграциями.
- **Hover-эффекты**: 3D perspective tilt на карточках (CSS transform).

### Nice to Have (P2)
- **Cursor custom**: Кастомный курсор с glow-эффектом.
- **Page transitions**: Fade при переходах (если будет multi-page).

## Technical Architecture

### Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + кастомные CSS animations
- **3D**: Three.js (r184) — сцена с BufferGeometry для частиц
- **Animations**: GSAP 3.15 + ScrollTrigger plugin
- **Icons**: Lucide React
- **Fonts**: Outfit (300–800) + JetBrains Mono

### 3D Hero Architecture
```
Three.js Scene:
├── PerspectiveCamera (z: 5)
├── 150 узлов (Points с BufferGeometry)
│   ├── Позиции: random в [-3, 3] box
│   ├── Цвет: indigo gradient (#6366f1 → #8b5cf6)
│   └── Мышь: притяжение к курсору (lerp)
├── 200 линий соединений (LineSegments)
│   └── Генерация: если dist(A,B) < threshold → соединить
└── AmbientLight + PointLight (violet glow)
```

### Component Structure
```
src/
├── app/
│   ├── layout.tsx          ← metadata, fonts
│   ├── page.tsx            ← главная сборка
│   └── globals.css         ← design tokens, animations
├── components/
│   ├── ui/
│   │   ├── Navbar.tsx      ← fixed, glass-panel, scroll-aware
│   │   └── SkeletonLoader.tsx
│   ├── canvas/
│   │   └── NodeNetwork.tsx ← Three.js particle node network
│   └── sections/
│       ├── HeroSection.tsx    ← + GSAP text entrance
│       ├── ServicesSection.tsx
│       ├── ProcessSection.tsx ← NEW: 3 steps + scroll animation
│       ├── StatsSection.tsx   ← NEW: animated counters + marquee
│       ├── ContactSection.tsx
│       └── Footer.tsx
```

### Design Tokens
```css
Цветовая палитра (светлая тема):
- Background: #fcfbfe (почти белый с фиолетовым оттенком)
- Primary: #6366f1 (indigo-500)
- Secondary: #8b5cf6 (violet-500)
- Text: #0f0f15 (почти чёрный)
- Text muted: #6b7280

Glassmorphism:
- .glass-panel: bg white/45, blur(16px)
- .glass-panel-heavy: bg white/70, blur(24px)
- .glass-card: bg white/35, hover lift

Typography:
- Hero title: Outfit 800, 5xl → 8xl
- Section title: Outfit 700, 4xl → 6xl
- Body: Outfit 400, lg, line-height 1.7
- Code/mono: JetBrains Mono
```

## Content Plan (автогенерация)

### Hero
- **Headline**: "We build AI that works while you sleep"
- **Sub**: "Digital Flow engineers autonomous pipelines that replace manual workflows — from data to decisions, at production scale."
- **CTA**: "See Our Work" + "Start a Project"

### Services (4 карточки)
1. **Pipeline Engineering** — Проектируем и внедряем AI-пайплайны
2. **LLM Integration** — Подключаем GPT-4o, Claude, Gemini в продукты
3. **Automation Architecture** — Заменяем ручные процессы автоматическими агентами
4. **Observability** — Мониторинг, самовосстановление, SLA-гарантии

### Process (3 шага)
1. **Audit** — Анализируем текущие процессы, находим точки автоматизации
2. **Build** — Строим пайплайн, тестируем на реальных данных
3. **Deploy & Monitor** — Запускаем в prod, настраиваем алерты и fallbacks

### Stats
- 4.8M+ автоматизированных задач/день
- 12ms средняя задержка пайплайна
- 99.98% SLA
- 40+ успешных интеграций

## Non-Functional Requirements
- **Performance**: LCP < 2.5s, Three.js 60fps на M-серии и Intel Iris Xe
- **Responsiveness**: 320px → 2560px, mobile-first
- **Accessibility**: WCAG AA (контраст, aria-labels, keyboard nav)
- **SEO**: Open Graph, структурированные заголовки

## Out of Scope
- Многостраничность (только одна страница)
- Backend / CMS
- Аутентификация
- Тёмная тема (MVP)

## Implementation Notes
1. **NodeNetwork.tsx** заменяет текущий **GlassBlob.tsx** — более впечатляющий и соответствует бренду «сеть автоматизации»
2. **GSAP ScrollTrigger** необходимо инициализировать через `gsap.registerPlugin(ScrollTrigger)` в client-компоненте
3. Three.js узлы: использовать `Points` + `PointsMaterial` для частиц, `LineSegments` для соединений
4. Линии перегенерировать только при значительном движении мыши (debounce 100ms) для производительности
5. На мобильных (< 768px) — скрыть Three.js, показать CSS анимацию градиента

## Appendix: Research Findings
- Framer/Webflow стиль достигается через: scroll-triggered clip-path reveals, large whitespace, oversized typography
- Interactive node networks используются: Stripe radar, Linear homepage, Anthropic website
- Для premium agency feel: много воздуха, мало текста, большие числа/метрики, минималистичные иконки
