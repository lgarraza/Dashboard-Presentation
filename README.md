# Dashboard Presentation

![Angular 17](https://img.shields.io/badge/Angular-17-red)
![NgRx](https://img.shields.io/badge/NgRx-17-purple)
![Chart.js](https://img.shields.io/badge/Chart.js-4-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-blue)
![SignalR](https://img.shields.io/badge/Real--time-SignalR-green)

Angular 17 frontend for [Dashboard.API](https://github.com/lgarraza/Dashboard.API) — a live metrics
dashboard with NgRx state management, a container/presenter component architecture, and real-time
updates over SignalR.

## ✨ Key Features

✅ **Live updates** - SignalR pushes new metrics straight into the NgRx store as they're created
✅ **NgRx state management** - Feature-organized store (state/actions/reducer/effects/selectors) using `createActionGroup`
✅ **Container/Presenter architecture** - Smart containers connect to the store; presenters are pure `@Input`/`@Output`
✅ **KPI cards** - Animated value counters, trend indicators, and sparklines for CPU/Memory/API/Network metrics
✅ **Charts** - Area (line) and bar charts via Chart.js, with a fix to stop them replaying their entrance animation on every live update
✅ **Sortable, searchable, paginated metrics table** - Category filtering, relative timestamps, severity coloring
✅ **Responsive design** - 1/2/4-column layouts across mobile/tablet/desktop, built with Tailwind CSS

## 🏗️ Architecture

```
src/app/
├── core/
│   ├── services/         # MetricService (HTTP), SignalrService (WebSocket)
│   └── interceptors/     # HTTP error interceptor
├── store/metrics/         # NgRx: state, actions, reducer, effects, selectors
├── shared/
│   ├── models/           # Metric, FilterState
│   ├── pipes/             # relativeTime
│   └── components/        # KpiCard, LineChart, BarChart, MetricsTable,
│                           # FiltersPanel, Sparkline, LiveBadge, CategoryBadge
└── dashboard/
    ├── containers/         # DashboardContainerComponent (smart, connects to store)
    ├── presenters/         # DashboardPresenterComponent (dumb, @Input/@Output only)
    └── dashboard.module.ts # Lazy-loaded feature module
```

### A note on `latestMetrics` / `metricHistory`

The NgRx store keys `latestMetrics` and `metricHistory` by metric **name** (e.g. `"CPU Usage"`),
not by category. A category groups several differently-named metrics (`System` = CPU + Memory +
Disk...), so keying by category alone can't answer "what's the latest CPU reading" — keying by name
lets the KPI strip track CPU/Memory/API/Network simultaneously and stay live via SignalR, regardless
of which single category the table/chart filter currently has selected.

### Why Chart.js instead of Recharts

An earlier iteration of this project's spec called for Recharts, but Recharts is a React-only
library and can't run inside an Angular app. Chart.js (via `ng2-charts`) covers the same
requirements — responsive containers, tooltips, smooth curves, gradient fills — natively in this stack.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- [Dashboard.API](https://github.com/lgarraza/Dashboard.API) running locally (this app expects it at `https://localhost:7001` in development — see `src/environments/environment.development.ts`)

### Installation

```bash
git clone https://github.com/lgarraza/Dashboard-Presentation.git
cd Dashboard-Presentation
npm install
```

### Run the dev server

```bash
ng serve
```

Navigate to `http://localhost:4200/dashboard`. The app expects `Dashboard.API` to be running and
reachable at the URL configured in `src/environments/environment.development.ts`.

### Build

```bash
ng build
```

Build artifacts are output to `dist/dashboard/`.

### Run unit tests

```bash
ng test
```

Runs via [Karma](https://karma-runner.github.io).

## 📦 Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Angular | 17 | Application framework (NgModule-based, esbuild `application` builder) |
| NgRx | 17 | State management (store, effects, store-devtools) |
| Chart.js / ng2-charts | 4 / 6 | Line and bar chart rendering |
| Tailwind CSS | 3 | Utility-first styling |
| @microsoft/signalr | latest | Real-time hub client |

## 🔗 Related Projects

- [Dashboard.API](https://github.com/lgarraza/Dashboard.API) - ASP.NET Core 8 backend this app talks to (REST + SignalR hub)

## 👤 Author

**Leonardo Garraza**

- **GitHub:** [@lgarraza](https://github.com/lgarraza)
- **Upwork:** [leonardogarraza](https://www.upwork.com/freelancers/leonardogarraza)
- **LinkedIn:** [Leonardo Garraza](https://www.linkedin.com/in/leonardogarraza/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Scaffolded with [Angular CLI](https://github.com/angular/angular-cli) 17.3.17.*
