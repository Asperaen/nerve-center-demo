# CEO Dashboard - UX Mockup

A comprehensive CEO dashboard mockup built with React, TypeScript, Tailwind CSS, and Recharts. This frontend-only application demonstrates an end-to-end solution for CEOs to manage business insights, forecasts, and strategic decisions.

## 🚀 Tech Stack

- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + Headless UI
- **Charts**: Recharts
- **Routing**: React Router v6
- **Icons**: Heroicons
- **Date Handling**: date-fns

## 📋 Features

### 1. Dashboard Overview

- Executive summary with key metrics
- Quick links to all modules
- Recent alerts and priority actions

### 2. Market Pulse

#### A. External Pulse Check

- GenAI-powered news analysis across 4 categories:
  - Macro & Geopolitics
  - Competitors & Industry
  - Customers & End Market
  - Suppliers & Supply Chain
- Risk/opportunity classification
- Impact level and urgency indicators
- Annotation capabilities for team collaboration

#### B. Internal Pulse Check

- Real-time KPI dashboard with 11 predefined metrics:
  - Net Profit, Operating Profit, Gross Profit
  - Revenue, Working Capital
  - Cost of Poor Quality, Customer Complaints
  - UPPH, OEE, Inventory Turnover Rate
  - R&D Cost %, Procurement Cost Down
- Interactive charts and drill-down modals
- Performance status indicators

#### C. Root Cause Analysis

- AI-powered chat interface
- Drill-down analysis by BU, product, customer
- Waterfall charts for variance analysis
- Interactive data visualizations

#### D. Action Tracker

- Comprehensive action management
- Owner reassignment with notifications
- CEO decision input and guidance
- Status tracking and filtering

### 3. Business Assumptions

- Assumption management across 5 categories:
  - Revenue Trend
  - Volume Trend
  - Labor Rate
  - FX Rate
  - Material Price
- Approval workflow
- Version history and timeline visualization
- Conflict detection and resolution system

### 4. Financial Forecast

- Driver-based forecast compilation
- Income statement with breakdown (momentum + pipeline - risk + opportunity)
- Interactive waterfall charts
- Key business events analysis
- Actionable insights and recommendations

### 5. Scenario Simulation

- What-if scenario modeling
- Editable forecast drivers
- Real-time recalculation
- Scenario comparison (up to 3 scenarios)
- Save and manage multiple scenarios

## 🎯 Mock Data Scenarios

The application includes two primary scenarios:

**Scenario 1: US Tariff Impact**

- 25% tariff on Chinese-made EV connectors
- 20% volume drop, $10M revenue risk
- Production shift recommendation to Vietnam

**Scenario 2: Rare Earth Supply Disruption**

- China export restrictions on rare earth materials
- 35% material cost increase, $5M cost impact
- Alternative supplier qualification needed

## 🛠️ Getting Started

### Prerequisites

- Node.js 22+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Development Server

The application will be available at `http://localhost:5173` (or the next available port).

## 📁 Project Structure

```
src/
├── components/        # Reusable React components
│   ├── ExternalPulseCheck.tsx
│   ├── InternalPulseCheck.tsx
│   ├── RootCauseAnalysis.tsx
│   ├── ActionTracker.tsx
│   ├── AssumptionsTable.tsx
│   └── ConflictAlertsPanel.tsx
├── pages/            # Page components
│   ├── DashboardOverview.tsx
│   ├── MarketPulse.tsx
│   ├── BusinessAssumptions.tsx
│   ├── FinancialForecast.tsx
│   └── ScenarioSimulation.tsx
├── layouts/          # Layout components
│   └── MainLayout.tsx
├── data/             # Mock data
│   ├── mockKPIs.ts
│   ├── mockNews.ts
│   ├── mockActions.ts
│   ├── mockAssumptions.ts
│   ├── mockForecast.ts
│   └── mockAnalysis.ts
├── types/            # TypeScript type definitions
│   └── index.ts
└── App.tsx           # Main application component
```

## 🎨 Design System

### Colors

- **Primary**: Blue (#2563eb)
- **Risk**: Red (#dc2626)
- **Opportunity**: Green (#16a34a)
- **Warning**: Yellow (#ca8a04)

### Typography

- Font Family: Inter, system-ui, sans-serif
- Headings: Bold, various sizes
- Body: Regular, 14px-16px

## 🚧 Frontend-Only Implementation

This is a **frontend-only mockup** with no backend API or database. All data is mocked and interactions are simulated:

- Data changes are stored in React state (not persisted)
- No real API calls
- Notifications and actions show alerts/toasts
- All GenAI analysis is pre-generated mock data

## 🏢 Business Context

The mockup is designed for a global precision interconnect solutions provider:

- **Industry**: Precision connectors for EV, 5G AIoT, Audio
- **Revenue**: $2.3B+ annually
- **Key Customers**: Tesla, Apple, Nvidia, Amazon, BYD
- **Core Technologies**: Copper to optical, wired to wireless, components to modules

## 📊 Key Performance Indicators

The dashboard tracks 11 critical KPIs:

1. Net Profit
2. Operating Profit
3. Gross Profit
4. Revenue
5. Working Capital
6. Cost of Poor Quality (COPQ)
7. Open Customer Complaint Cases
8. UPPH (Units Per Person Hour)
9. OEE (Overall Equipment Effectiveness)
10. Inventory Turnover Rate
11. R&D Cost as % of Revenue
12. Procurement Cost Down

## 🔄 Future Enhancements (Not Implemented)

If this were to become a production application:

- Backend API integration
- Real database with persistence
- Actual GenAI integration (GPT-4, Claude, etc.)
- User authentication and authorization
- Real-time data updates via WebSocket
- Email/Slack notifications
- Mobile responsive design
- Wave system integration
- Export to Excel/PDF functionality

## 📝 License

This is a demonstration project for UX mockup purposes.

## 👥 Author

Created for CEO dashboard mockup demonstration.
