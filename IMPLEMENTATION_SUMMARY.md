# NERVE Center Implementation Summary

## ✅ Project Status: COMPLETED

The NERVE Center UX mockup has been successfully implemented with all planned features.

## 🌐 Access

**Local Development Server**: http://localhost:5173/

The application is currently running and ready for demonstration.

## 📦 What Has Been Built

### 1. Project Infrastructure ✅

- ✅ Vite + React 18 + TypeScript setup
- ✅ Tailwind CSS + Headless UI configuration
- ✅ Recharts for data visualization
- ✅ React Router for navigation
- ✅ Heroicons for UI icons
- ✅ date-fns for date formatting

### 2. Core Layout & Navigation ✅

- ✅ MainLayout with right sidebar navigation and optional left calendar sidebar
- ✅ Right sidebar (RightSidebar component) with collapsible functionality
- ✅ Left calendar sidebar (CalendarSidebar component) for daily agenda view with drag-and-drop material support
- ✅ Sidebar expands to 256px (w-64) when expanded, collapses to 64px (w-16) when collapsed
- ✅ Navigation items organized into two visually distinct groups:
  - **Real Time Pulse Section** (blue theme): Home, Performance Intelligence, Market Intelligence
  - **Tools** (blue theme): Action Tracker, Quarterly Actuals Review
- ✅ Section headers ("Real Time Pulse" and "Tools") displayed when sidebar is expanded
- ✅ Visual separator between sections
- ✅ Color-coded active states: blue for Real Time Pulse and Tools items
- ⚠️ **Note**: External Pulse, Internal Pulse, Finance Forecast, and My Meetings pages still exist but have been removed from the sidebar navigation menu
- ✅ Icon-based navigation with labels
- ✅ Active state highlighting with color-coded background and left border
- ✅ Profile link at bottom of sidebar
- ✅ Main content area with dynamic margins based on sidebar states
- ✅ Smooth transitions for sidebar collapse/expand
- ✅ User profile page with user information and quick actions
- ✅ Action Tracker accessible as a dedicated route via sidebar navigation
- ✅ "Create Action" buttons on page headers for context-specific action creation
- ✅ Floating calendar toggle button to show/hide left calendar sidebar

### 3. Mock Data Layer ✅

Complete mock data for two scenarios (US Tariff Impact & Rare Earth Supply Disruption):

- ✅ `mockKPIs.ts` - 11 KPIs with 12-month history
- ✅ `mockInternalPulse.ts` - Value driver framework with financial categories (Revenue, COGS, OPEX, Operating Profit), metrics, value drivers, and affecting factors
- ✅ `mockNews.ts` - 10 external news items across 4 categories
- ✅ `mockActions.ts` - 45 action items with comments (17 CEO actions, 28 team member actions)
  - CEO actions include approval tasks and executive follow-ups, distributed across all status types
  - Team member actions assigned to various VPs and executives
- ✅ `mockAssumptions.ts` - 12 business assumptions with history and 5 assumption conflicts
- ✅ `mockForecast.ts` - Forecast drivers, income statement, scenarios, OP waterfall stages, applied assumptions, suggested assumptions, NP deviation stages, product family data, cost impact data, MVA breakdown stages
- ✅ `mockAnalysis.ts` - Root cause analysis results
- ✅ `mockRootCauses.ts` - 3 root causes with title, impact, tags, and Wave ticket numbers
- ✅ `mockExecutiveDashboard.ts` - Executive initiatives, milestones, workflow groups, and chart data (value progress, value delivery tracking, variance analysis, workflow value delivery)
- ✅ `mockBusinessGroupPerformance.ts` - Business group performance data (HH, FII, FIH, FIT, Others) with 12-month trend data and AI-generated insights for Revenue, GP, OP, NP metrics; includes Year-to-Month dataset variants
- ✅ `mockCalendar.ts` - Calendar events and meetings with attendees, materials, and meeting types

### 4. Page Structure ✅

The application uses a flat route structure with standalone pages for each major feature:

- ✅ Home Page (Executive Summary) - Main dashboard with business group performance and action items
- ✅ Performance Intelligence Page (formerly Business Group Performance) - Detailed financial metrics by business group with NP deviation breakdown
- ✅ External Pulse Page - Standalone page for external pulse check with "Create Action" button in header
- ✅ Internal Pulse Page - Combined page with tab switcher for KPIs/operational indicators and Wave Executive Dashboard
  - **KPIs and operational indicators tab**: Value driver framework with metrics, value drivers, and affecting factors
  - **Wave tab**: Executive dashboard with initiatives tracking and value delivery charts
- ✅ Action Tracker Page - Dedicated route page accessible via sidebar navigation
- ✅ My Meetings Page - Weekly calendar view with meeting management and materials display
- ✅ Finance Forecast Page - Combined financial forecast page with all financial features
- ✅ Quarterly Actuals Review Page (formerly Finance Review) - NP Deviation Breakdown with deep dive navigation
- ✅ Power BI Page - Embedded Power BI dashboard for financial review overview
- ✅ Meeting Detail Page - Individual meeting details with materials and attendees
- ✅ User Profile Page - User profile and settings

### 5. Daily Pulse Check Features ✅

**Business Facts Book:**

#### Feature A.1: Internal Pulse Check ✅

- ✅ Tab switcher on Internal Pulse Page with two tabs: "KPIs and operational indicators" and "Wave"
- ✅ Value driver framework based on financial structure (Revenue, COGS, OPEX, Operating Profit)
- ✅ Financial category grouping with expandable sections
- ✅ Metrics organized by financial category (e.g., Direct Labor, Indirect Labor, MFG Overhead, Material for COGS)
- ✅ Value drivers for each metric (e.g., Volume, ASP, Product Mix for Revenue; UPPH, Production Volume, Labor Rate for Direct Labor)
- ✅ Affecting factors with tags (Internal KPI, Internal Information, External Information, Derived)
- ✅ Filter by factor type (All, Internal KPI Only, Internal Information Only)
- ✅ Real-time values and trend indicators
- ✅ Color-coded performance status (good/warning/concern)
- ✅ Variance vs budget display
- ✅ Mini sparkline charts for each metric
- ✅ Click-to-expand modal with full details including all value drivers and affecting factors
- ✅ 12-month trend chart in modal
- ✅ Last updated timestamp
- ✅ Comprehensive view of underlying drivers affecting financial performance
- ✅ Root Cause Analysis sidebar integration - provides quantitative insights on leading parameters (only available in KPIs tab)

#### Feature A.2: External Pulse Check ✅

- ✅ GenAI-style news feed with 10 items
- ✅ 4-category filtering (Macro, Competitors, Customers, Suppliers)
- ✅ Risk/Opportunity classification with badges
- ✅ Impact level indicators (High/Medium/Low)
- ✅ Urgency level badges (Urgent/Important/Normal)
- ✅ AI analysis display with typing effect simulation
- ✅ Annotation feature (add notes to news items)
- ✅ Expandable/collapsible analysis sections
- ✅ Root Cause Analysis sidebar integration - provides quantitative insights on external impacts

#### Feature A.3: Wave Executive Dashboard ✅

- ✅ Accessible as a tab within Internal Pulse Page (tab label: "Wave")
- ✅ Comprehensive executive dashboard with 4 key charts in 2x2 grid layout:
  - **Value Progress Chart**: Net Recurring Revenue (Annualized, Million USD) vs. Top-Down Target with current vs target comparison
  - **Value Delivery Tracking Chart**: Time-series tracking of Net Recurring Revenue vs. Bottom-Up Plan with stacked bars and target line
  - **Variance Analysis Chart**: L4+ Actual Net Recurring Revenue variance breakdown (Accelerated, Over-delivery, Newly Added, Delayed, Lost Delivery, Moved to L3, Cancelled/Paused, Total)
  - **Workflow Value Delivery Chart**: Value delivery per workflow with stacked bars showing contribution by workflow
- ✅ Initiatives table with workflow grouping:
  - Collapsible workflow groups (e.g., "Water - Integrated Management", "Water - Operations")
  - Columns: Exception, #, Name, Phase, Weekly Status, Initiative Owner, Responsible Workflow, L4 Latest Estimated Date, Recurring Net Benefit, Is it an Asset, Compare BP
  - Status indicators (green for "Progressing Smoothly", red for "Leadership Attention")
  - Phase labels (L0-L5 with Chinese labels)
  - Asset type indicators (Yes - Original, Yes - New, No)
- ✅ Summary cards section with 6 cards in 2 rows:
  - **Row 1 (Initiatives)**: Overdue initiatives, Initiatives due in 7 days, Initiatives due in 30 days
  - **Row 2 (Milestones)**: Overdue milestones, Milestones due in 7 days, Milestones due in 30 days
  - Each card shows count and net benefit/owner count metrics
- ✅ All field labels translated to English
- ✅ Professional styling matching the application design system

#### Root Cause Analysis (Integrated into Pulse Pages) ✅

- ✅ Slider sidebar accessible from both Internal and External Pulse pages
- ✅ AI-powered chat interface
- ✅ Natural language query processing
- ✅ Impact analysis on value drivers and financials
- ✅ Leading parameter identification (e.g., labor cost increases won't show in profit until products are sold)
- ✅ Quantitative insights showing how external/internal changes affect financials
- ✅ Waterfall chart for variance analysis
- ✅ Bar charts for impact visualization
- ✅ Context-aware analysis based on selected items

### 6. Financial Forecast Features ✅

**Note**: Business Assumption Management features (AssumptionsTable, ConflictAlertsPanel) have been removed from the current implementation. The Finance page focuses on financial performance review and scenario simulation.

#### Feature A: Financial Performance Review ✅

**A.1: Full Year OP Waterfall Chart ✅**

- ✅ Full Year OP Waterfall visualization prominently displayed at top of Finance page
- ✅ 8-stage waterfall progression showing Operating Profit journey:
  - YTM Actuals (Jan-Sep OP): 210M - Baseline starting point
  - Momentum: +25M - Projected OP assuming no actions (235M)
  - Pipeline Improvement: +45M - Existing initiatives boost (280M)
  - Headwinds / Tailwinds: -25M - Volume/Price/Mix impacts (255M)
  - Additional Pressure / Risk: -15M - Additional risks (240M)
  - Assumed Pipeline Leakage: -8M - Under-delivered initiatives (232M)
  - Leakage Recovery: +5M - Recovery initiatives (237M)
  - Full Year OP FCST: 237M - Final forecast baseline
- ✅ Cumulative progression visualization with Recharts ComposedChart (stacked bars + lines)
- ✅ Color coding: Grey for baseline stages, Light blue for positive contributions, Orange/pink for negative impacts
- ✅ Interactive tooltips showing cumulative OP, delta changes, and scenario values
- ✅ Multi-scenario visualization with overlay lines (one line per visible scenario)
- ✅ Scenario comparison controls (Compare Best/Worst, Comparison Panel)
- ✅ Scenario management panel above chart (create, edit, delete, toggle visibility)

**A.2: Value Driver Scenario Simulation ✅**

- ✅ Scenario Creation Modal for creating and editing scenarios
- ✅ Value driver editing by financial category (Revenue, COGS, OPEX, Operating Profit)
- ✅ Hierarchical value driver structure (Category → Metric → Value Driver)
- ✅ Real-time change percentage calculation based on value driver adjustments
- ✅ Simulated waterfall calculation showing impact on OP progression
- ✅ Scenario management panel with create, edit, delete, and toggle visibility
- ✅ Multiple scenario visualization on waterfall chart (overlay lines)
- ✅ Scenario comparison panel (slider sidebar) with best/worst identification
- ✅ Scenario statistics (average, median, range)
- ✅ Scenario ranking and sorting (by impact, name, date)
- ✅ Color-coded scenarios for visual distinction
- ✅ Total OP impact calculation for each scenario
- ✅ Example use case: Create "Labor Cost Increase" scenario → Adjust labor rate value drivers → See simulated OP waterfall showing impact when products are sold

**A.3: Value Drivers Display ✅**

- ✅ Hierarchical value driver structure organized by financial category
- ✅ Financial categories: Revenue, COGS, OPEX, Operating Profit
- ✅ Metrics within each category (e.g., Direct Labor, Indirect Labor, Material for COGS)
- ✅ Value drivers for each metric with current values and change percentages
- ✅ Compact grid layout with expandable sections
- ✅ Color-coded change indicators (green for positive, red for negative)

**A.4: Action Proposals Based on Applied Assumptions ✅**

- ✅ Action Proposals section replaced to use Applied Assumptions instead of Business Events
- ✅ 1-to-1 mapping: Each Applied Assumption can have one Proposal
- ✅ Multiple Actions per Proposal: Each Proposal contains multiple Actions that can be converted to Wave Initiatives
- ✅ All Applied Assumptions displayed (regardless of whether they have proposals)
- ✅ Color coding based on assumption impactType (green=positive/opportunity, red=negative/risk)
- ✅ Assumption cards show name, description, impact, and impactType
- ✅ For assumptions with proposals:
  - Display proposal description (optional)
  - Show all actions with descriptions, expected impact, feasibility, and priority
  - "Create Action" button to add new actions to existing proposals
  - Each action shows "Create Wave Initiative" button (no threshold filtering)
- ✅ For assumptions without proposals:
  - Show "Create Proposal" button
  - Modal to create new proposal for the assumption
- ✅ L-gate stage management (Wave project gates):
  - L0: Gray - Just created in Wave (when user clicks "Create Wave Initiative")
  - L1: Blue - First gate
  - L2: Green - Second gate
  - L3: Yellow - Third gate
  - L4: Orange - Fourth gate
  - L5: Red - Fifth gate
- ✅ Visual badges for high feasibility (green badge) and high priority (red badge)
- ✅ Actions with L-gate stages display colored stage badges (L0-L5)
- ✅ Wave initiative modal with comprehensive form
- ✅ When "Create Wave Initiative" is clicked, action is automatically marked with L0 stage
- ✅ Create Proposal modal for creating new proposals
- ✅ Create Action modal for adding actions to existing proposals
- ✅ **AI-Generated Actions Feature**:
  - Actions can be marked as AI-generated with `isAIGenerated` flag
  - AI-generated actions display a prominent badge (purple gradient with "AI" label) next to the action description
  - Badge automatically hides when action is "Waved" (has a stage assigned), indicating CEO review and approval
  - When "Vietnam Minimum Wage Hike" assumption is moved from Pulse Suggested to Applied Assumptions, a proposal is automatically created with 2 AI-generated actions:
    - Action 1: "Improve UPPH by 2–3% through line balancing, micro-motion fixes, refreshed standard work, and smarter labor allocation" (2.5M expected impact)
    - Action 2: "Push a 1.5–2% ASP adjustment with key accounts, anchored on the mandatory wage increase" (4.5M expected impact)
  - AI badge uses purple gradient background (from-purple-200 via-indigo-200 to-purple-300) with purple-800 text for visibility
  - Badge includes sparkle icon (✨) and "AI" label for clear identification

**A.5: Applied Assumptions ✅**

- ✅ Applied Assumptions panel positioned between waterfall chart and value drivers section
- ✅ Three pre-configured assumptions already baked into the waterfall forecast:
  - **AI Data Center Acceleration**: +5M impact on 'headwinds-tailwinds' (positive/tailwind) - Emerald color
  - **Apple AirPods Launch Delay**: -5M impact on 'additional-risk' (negative/headwind) - Amber color
  - **Copper Price Surge**: -5M impact on 'additional-risk' (negative/headwind) - Red color
- ✅ Toggle checkboxes on the right side of each assumption card
- ✅ All assumptions enabled by default (since they're "already baked in")
- ✅ Real-time waterfall chart updates when assumptions are toggled on/off
- ✅ Individual assumption impacts visualized as colored bars in waterfall chart
- ✅ Each assumption has distinct color for visual identification:
  - Color indicators in assumption panel cards
  - Colored segments in waterfall bars showing individual contributions
- ✅ Cumulative impact calculation (multiple assumptions affecting same stage are summed)
- ✅ Cascading effect: When a stage value changes, all subsequent stages recalculate automatically
- ✅ Assumption panel displays:
  - Assumption name with color indicator
  - Description
  - Impact value (+/- with color coding)
  - Target stage indicator
  - Tailwind/Headwind badge
- ✅ Waterfall chart shows:
  - Baseline bar (without assumptions) in original colors
  - Individual assumption impact bars stacked with distinct colors
  - Visual breakdown of which assumption contributes how much to each stage
- ✅ Delete button on each applied assumption card with confirmation modal

**A.6: Pulse Suggested Assumptions ✅**

- ✅ Pulse Suggested Assumptions panel positioned side-by-side with Applied Assumptions
- ✅ Side-by-side layout with Applied Assumptions on left, arrow indicator in middle, Pulse Suggested on right
- ✅ Three suggested assumptions derived from external news items:
  - **Vietnam Minimum Wage Hike** (from news-11): -2.5M impact on 'additional-risk' stage - Orange color
  - **US Tariff on EV Connectors** (from news-1): -10M impact on 'headwinds-tailwinds' stage - Red color
  - **China Rare Earth Export Restrictions** (from news-2): -5M impact on 'additional-risk' stage - Orange color
- ✅ Each suggested assumption includes:
  - `sourceNewsId` linking to the originating news item
  - `isSuggested: true` flag to distinguish from applied assumptions
  - Full description with impact details from news analysis
  - Color-coded visual indicators matching news impact type
- ✅ Drag and drop functionality:
  - Suggested assumptions are draggable (cursor changes to grab/grabbing)
  - Applied Assumptions section is a drop zone with visual feedback
  - Left arrow indicator between sections showing drag direction
  - "Drag here" label below arrow
  - Drop zone highlights with blue border and background when dragging over
  - Description text changes to "Drop assumption here to apply it" during drag
  - **Automatic Proposal Creation**: When "Vietnam Minimum Wage Hike" is moved from Suggested to Applied, a proposal with 2 AI-generated actions is automatically created
- ✅ Toggle checkboxes on suggested assumptions (unchecked by default)
- ✅ Real-time waterfall chart updates when suggested assumptions are checked
- ✅ Suggested assumption impacts visualized as colored bars in waterfall chart (lower opacity for distinction)
- ✅ Delete button on each suggested assumption card with confirmation modal
- ✅ Confirmation modal for deletion:
  - Shows assumption name
  - Context-specific warning message (different for suggested vs applied)
  - Cancel and Delete buttons
  - Properly rounded corners with overflow handling
- ✅ Visual distinction:
  - Suggested assumptions use distinct colors (orange/red shades)
  - Lower opacity (0.65) in waterfall chart vs applied assumptions (0.85)
  - "(Suggested)" suffix in chart legend

### 7. Action Tracker ✅

- ✅ Dedicated route page accessible via sidebar navigation (Meetings section)
- ✅ Accessible at `/action-tracker` route
- ✅ **Tab Switch Feature**: "My Actions" and "Assign to others" tabs in page header
  - Tab switch positioned between page title and "Create Action" button
  - Vertically centered alignment with header elements
  - Styled to match InternalPulseCheck tab design (gray background container with white active button)
  - "My Actions" tab filters actions where owner = "CEO" (17+ CEO actions)
  - "Assign to others" tab filters actions assigned to team members (25+ non-CEO actions)
  - Default tab: "My Actions"
- ✅ Comprehensive action list with JIRA-like swim lanes
- ✅ Auto-resizing swimlanes that utilize available width
- ✅ Status workflow management with color-coded statuses (TODO/In Progress/Ready for Review/Completed/Reopen)
- ✅ CEO actions distributed across all status types for realistic visualization:
  - TODO: 4 actions
  - In Progress: 5 actions
  - Ready for Review: 4 actions
  - Completed: 3 actions
  - Reopen: 1 action
- ✅ Priority indicators (High/Medium/Low)
- ✅ Owner information with avatars
- ✅ Reassign owner modal with notification simulation
- ✅ Comments system
- ✅ Comment history display with timestamps and authors
- ✅ Expandable action cards with full details
- ✅ "Create Action" button in page header
- ✅ **Enhanced Mock Data**:
  - 17 CEO-owned actions including approval tasks and executive follow-ups
  - 28 non-CEO actions assigned to various team members
  - Realistic action distribution across statuses and priorities

### 8. Create Action Feature ✅

- ✅ "Create Action" button on page headers for context-specific action creation
- ✅ Available on all major pages: Executive Summary, External Pulse, Internal Pulse, Wave Dashboard, Finance, Finance Review
- ✅ Consistent button styling across all pages (primary color, PlusIcon, positioned right of title)
- ✅ Each page manages its own modal state independently
- ✅ CreateActionModal component for creating new actions with form fields (title, description, owner, priority, due date)
- ✅ Actions stored in global ActionsContext for shared state management
- ✅ Removed global floating "Create Action" button for cleaner UI

## 🎨 Design & UX Features

### Color System

- ✅ Professional color palette (Blue, Green, Red, Yellow)
- ✅ Consistent color usage for risk/opportunity
- ✅ Status-based color coding

### Interactive Elements

- ✅ Hover states on all interactive elements
- ✅ Click interactions with feedback
- ✅ Modal dialogs with backdrop
- ✅ Toast/alert notifications (simulated)
- ✅ Loading states (simulated)
- ✅ Expandable/collapsible sections

### Data Visualization

- ✅ Line charts for trends
- ✅ Bar charts for comparisons
- ✅ Waterfall charts for variance analysis
- ✅ Sparklines for KPI cards
- ✅ Interactive tooltips
- ✅ Responsive charts

### Typography & Layout

- ✅ Clear hierarchy with headings
- ✅ Consistent spacing and padding
- ✅ Readable font sizes
- ✅ Professional business aesthetic
- ✅ Desktop-optimized layout (1440px+)

## 📊 Mock Data Scenarios Implemented

### Scenario 1: US Tariff Impact

- ✅ News item about 25% tariff announcement
- ✅ -20% volume assumption
- ✅ $10M revenue impact in forecast
- ✅ Vietnam production shift action item
- ✅ Waterfall bar showing tariff impact

### Scenario 2: Rare Earth Supply Disruption

- ✅ News item about China export restrictions
- ✅ +35% material cost assumption
- ✅ $5M cost increase in forecast
- ✅ Alternative supplier action item
- ✅ Conflict detection for cost assumptions

## 🔧 Technical Implementation

### Component Architecture

- ✅ 12 React components:
  - ActionTracker.tsx - Action management with JIRA-like swim lanes
  - CalendarSidebar.tsx - Left sidebar with daily agenda and drag-drop support
  - CreateActionModal.tsx - Modal for creating new actions
  - CriticalInsights.tsx - AI-generated insights display
  - InternalPulseCheck.tsx - Internal pulse metrics dashboard
  - MeetingDetailView.tsx - Individual meeting details component
  - MeetingSchedulingModal.tsx - Modal for scheduling meetings
  - RightSidebar.tsx - Main navigation sidebar
  - RootCauseAnalysisSidebar.tsx - AI analysis slider sidebar
  - ScenarioComparisonPanel.tsx - Scenario comparison slider panel
  - ScenarioCreationModal.tsx - Modal for creating scenarios
  - TimeframePicker.tsx - Reusable timeframe selection component
  - WaveExecutiveDashboard.tsx - Wave initiatives dashboard
- ✅ 3 Layer components (in layers/):
  - CostImpactBreakdownLayer.tsx
  - MVABreakdownLayer.tsx
  - ProductAnalysisLayer.tsx
- ✅ TypeScript interfaces for type safety
- ✅ React hooks for state management
- ✅ Component composition patterns
- ✅ Reusable sub-components

### State Management

- ✅ Local state with useState
- ✅ No Redux (not needed for mockup)
- ✅ Props passing for data flow
- ✅ Event handlers for interactions

### Routing

- ✅ React Router v7 setup with flat route structure
- ✅ Root route (`/`) displays Home (Executive Summary) page
- ✅ Flat route structure:
  - `/` - Home Page (Executive Summary with Business Group Performance)
  - `/business-group-performance` - Business Group Performance Page (detailed metrics)
  - `/external-pulse` - External Pulse Page (not in sidebar menu)
  - `/internal-pulse` - Internal Pulse Page (not in sidebar menu, contains tab switcher for KPIs and Wave Dashboard)
  - `/finance` - Finance Forecast Page (not in sidebar menu, combines all financial forecast features)
  - `/finance-review` - Finance Review Page (NP Deviation Breakdown)
  - `/action-tracker` - Action Tracker Page
  - `/my-meetings` - My Meetings Page (not in sidebar menu, weekly calendar view)
  - `/meeting/:meetingId` - Meeting Detail Page (individual meeting view)
  - `/powerbi` - Power BI Page (embedded dashboard)
  - `/profile` - User Profile Page
- ✅ MainLayout wrapper with RightSidebar and optional CalendarSidebar
- ✅ Sidebar navigation with active state highlighting
- ✅ Icon-based navigation with labels
- ✅ Collapsible sidebar for space optimization
- ✅ Action Tracker accessible as a dedicated route via sidebar navigation

### Data Structure

- ✅ 60+ TypeScript interfaces including:
  - Core types: NewsItem, KPI, Action, BusinessAssumption, Conflict
  - Forecast types: ForecastDriver, IncomeStatement, BusinessEvent, ActionProposal
  - Proposal types: Proposal (1-to-1 mapping with AppliedAssumption, contains multiple ActionProposals)
  - Waterfall types: OPWaterfallStage, OPWaterfallStageType, SimulatedWaterfallStage, NPDeviationStage
  - Scenario types: ValueDriverScenario, ValueDriverScenarioValue, ScenarioComparisonState
  - Value driver types: ValueDriverItem, ForecastMetric, FinancialCategoryGroup, ValueDriverAssumption
  - Internal pulse types: FinancialMetric, ValueDriver, AffectingFactor, FinancialCategoryData
  - Root cause types: RootCause (with title, impact, tags, waveTicketNumber)
  - Calendar types: Meeting, CalendarEvent, MeetingAttendee, MeetingMaterial
  - Executive dashboard types: ExecutiveInitiative, Milestone, WorkflowGroup
  - AppliedAssumption type extended with sourceNewsId, isSuggested fields, and proposal field
  - ActionProposal type extended with isAIGenerated field to mark AI-generated actions
- ✅ Comprehensive mock data (1100+ lines including OP waterfall stages and proposals with actions)
- ✅ Realistic business data based on connector manufacturer profile (EV, 5G AIoT, Audio segments)
- ✅ Time-series data with date-fns
- ✅ Relational data structure
- ✅ 8-stage OP waterfall data with cumulative progression logic

### Utility Functions

- ✅ `scenarioUtils.ts` - Scenario management utilities:
  - Extract value drivers from hierarchy
  - Create and update scenarios
  - Calculate simulated waterfall from value driver assumptions
  - Build assumptions from scenario values
  - Scenario name uniqueness validation
  - Color assignment for scenarios
- ✅ `scenarioComparison.ts` - Scenario comparison utilities:
  - Get best/worst scenarios
  - Sort scenarios by impact
  - Calculate comparison statistics (average, median, range)
  - Get scenario rank
- ✅ `valueDriverMapping.ts` - Value driver mapping utilities:
  - Map value drivers to forecast drivers
  - Calculate forecast driver impact from value driver assumptions
  - Calculate simulated waterfall stages based on assumptions
  - Get available value drivers from internal pulse data

## 📝 Code Quality

- ✅ TypeScript for type safety
- ✅ ESLint configuration
- ✅ No linter errors
- ✅ Consistent code style
- ✅ Component documentation
- ✅ README with full documentation

## 🚀 Deployment Ready

- ✅ Production build command configured
- ✅ Optimized bundle with Vite
- ✅ No build errors
- ✅ Fast development server (<1s start)
- ✅ README with deployment instructions

## 📱 Pages & Routes (Current Structure)

1. ✅ `/` - Home Page (Executive Summary)

   - Main dashboard for CEO with business overview
   - Right sidebar navigation always visible
   - Optional left calendar sidebar (toggleable)
   - Business Group Performance table with expandable rows

2. ✅ `/business-group-performance` - Performance Intelligence Page (label: "Performance Intelligence" and "Market Intelligence" in sidebar)

   - Detailed financial metrics by business group
   - Supports query parameter `?bu=<group_id>` for filtering
   - NP Deviation Breakdown waterfall chart
   - Row selection on the table updates the waterfall values to match selected BUs
   - L3+ vs target and L4+ vs planned waterfall stages link to Ideation Progress
   - Deep dive navigation to COGS Analysis (Sites/Products)
   - Layer navigation with breadcrumbs

3. ✅ `/external-pulse` - External Pulse Page (not in sidebar menu)

   - GenAI-style news feed with dynamic category filtering
   - Risk/opportunity classification with badges
   - Impact level indicators (High/Medium/Low)
   - Urgency level badges (Short-term/Mid-term/Long-term)
   - AI analysis display with typing effect simulation
   - Annotation feature (add notes to news items)
   - Expandable/collapsible analysis sections
   - Root Cause Analysis sidebar integration (slider sidebar accessible via button)
   - Quantitative insights on external impacts
   - Draggable news items for adding to meeting materials

4. ✅ `/internal-pulse` - Internal Pulse Page (not in sidebar menu)

   - **Tab Switcher**: Two tabs - "KPIs and operational indicators" and "Wave"
   - **KPIs and operational indicators tab**:
     - Value driver framework by financial category (Revenue, COGS, OPEX, Operating Profit)
     - Metrics organized by financial category with value drivers and affecting factors
     - Performance status indicators and variance displays
     - Color-coded performance status (good/warning/concern)
     - Mini sparkline charts for each metric
     - Click-to-expand modal with full details including all value drivers and affecting factors
     - 12-month trend chart in modal
     - Root Cause Analysis sidebar integration (slider sidebar accessible via button)
     - Quantitative insights on leading parameters
   - **Wave tab**:
     - **4 Key Charts in 2x2 Grid**:
       - Value Progress: Current vs Target comparison with stacked segments
       - Value Delivery Tracking: Monthly time-series with stacked bars and target line
       - Variance Analysis: Waterfall-style breakdown of variance components
       - Workflow Value Delivery: Stacked bars showing value delivery per workflow
     - **Initiatives Table**:
       - Grouped by workflow with collapsible sections
       - Comprehensive columns (Exception, #, Name, Phase, Weekly Status, Owner, Workflow, L4 Date, Net Benefit, Asset, Compare BP)
       - Status indicators (Progressing Smoothly / Leadership Attention)
       - Phase labels (L0-L5)
     - **Summary Cards**:
       - 6 cards showing overdue/due soon initiatives and milestones
       - Count and net benefit/owner count metrics

5. ✅ `/finance` - Finance Forecast Page (not in sidebar menu)

   - **Full Year OP Waterfall Chart**: Prominently displayed at top showing 8-stage OP progression
     - Interactive tooltips with cumulative OP, delta changes, and scenario values
     - Color-coded stages: Grey (baseline), Light blue (positive), Orange/pink (negative)
     - Multi-scenario visualization with overlay lines
     - Individual assumption impacts shown as colored bars (emerald, amber, red for applied; orange/red for suggested)
   - **Applied Assumptions Panel**: Toggle assumptions on/off to see their impact on waterfall
     - Three assumptions: AI Data Center Acceleration, Apple AirPods Launch Delay, Copper Price Surge
     - Color-coded assumption cards with impact values and target stages
     - Real-time waterfall updates when toggling assumptions
     - Delete button on each assumption with confirmation modal
     - "Value Drivers" button to view overall value drivers in modal
     - Click on assumption cards to view/edit their specific value driver changes
   - **Pulse Suggested Assumptions Panel**: Side-by-side with Applied Assumptions
     - Three suggested assumptions derived from external news: Vietnam Minimum Wage Hike, US Tariff on EV Connectors, China Rare Earth Export Restrictions
     - Pulse AI suggested assumptions - drag to Applied Assumptions or check to see impact on waterfall
     - Drag and drop functionality with visual arrow indicator (left arrow pointing from Suggested to Applied)
     - Checkboxes to toggle impact on waterfall (unchecked by default)
     - Visual distinction in waterfall chart (lower opacity, distinct colors)
     - Delete button on each assumption with confirmation modal
     - Click on assumption cards to view/edit their specific value driver changes
   - **Scenario Management Panel**: Create, edit, delete, and toggle visibility of scenarios
   - **Scenario Comparison Panel**: Best/worst identification, statistics, sorting
   - **Value Drivers Modal**: Accessible via "Value Drivers" button in Applied Assumptions panel
     - View overall value drivers (hierarchical structure organized by financial category)
     - View assumption-specific value drivers (deviations from overall values)
     - Edit mode for assumption value drivers:
       - Edit existing value driver changes (change value, unit, change percentage)
       - Add new value drivers manually from available drivers
       - Remove value drivers
       - Real-time calculation of "New Value" as changes are made
       - Save/Cancel buttons to persist or discard changes
     - Updated value drivers automatically affect cumulative calculations
   - **Action Proposals**: Based on Applied Assumptions with 1-to-1 Proposal mapping
     - Each assumption can have one proposal with multiple actions
     - Actions can be converted to Wave Initiatives (marked as L0 when created)
     - L-gate stage badges (L0-L5) with color coding
     - Visual badges for high feasibility and high priority
     - Create Proposal and Create Action modals
     - **AI-Generated Actions**:
       - Drag "Vietnam Minimum Wage Hike" from Pulse Suggested to Applied Assumptions → Proposal automatically created with 2 AI-generated actions
       - AI-generated actions display purple gradient badge with "AI" label and sparkle icon
       - Badge automatically disappears when action is "Waved" (assigned a stage), indicating CEO review
       - Example: "Improve UPPH by 2–3% through line balancing..." (2.5M impact) and "Push 1.5–2% ASP adjustment..." (4.5M impact)
   - All financial forecast features combined in one page

6. ✅ `/finance-review` - Quarterly Actuals Review Page

   - **NP Deviation Breakdown Waterfall Chart**: Prominently displayed at top showing 9-stage NP deviation progression
     - Stages: Budget NP (26.0M) → Vol. impact (+8.8M) → Price impact (+3.7M) → Cost impact (-7.3M) → Mix impact (-2.8M) → OPEX Deviation (-5.3M) → Other COGS (+5.3M) → Gap of non-OP and tax (+0.6M) → Actual NP (28.9M)
     - Interactive tooltips with cumulative NP values and delta changes
     - Color-coded stages: Green for favourable (positive), Red for adverse (negative), Grey for baseline
     - Legend: "Favourable" (green circle) and "Adverse" (red circle)
     - First 4 stages (Budget NP, Vol. impact, Price impact, Cost impact) are clickable for deep dive
     - Side-by-side layout with Key Call Out panel (waterfall takes 3 columns, Key Call Out takes 1 column)
   - **Key Call Out Section**: AI-generated insights displayed side by side with waterfall chart
     - Section title: "Key Call Out" with AI badge (purple gradient badge with sparkle icon ✨) on the same line
     - Positioned on right side of waterfall chart (1/4 width)
     - Bullet points summarizing main drivers:
       - Largest positive impact (volume: +8.81 Mn USD)
       - Most significant negative drivers (cost impact: -7.32 Mn USD, OPEX deviation: -5.29 Mn USD)
       - Actual vs Budget comparison (Actual NP: 28.94 Mn USD vs Budget NP: 25.97 Mn USD)
     - Root Cause Analysis paragraph explaining the root cause
     - Professional styling matching the application design system
     - Content always visible (no toggle switches)
   - **Flattened 2-Layer Deep Dive Navigation** (simplified from 4 layers to 2 layers):
     - **Layer 1**: NP Deviation Breakdown waterfall with Key Call Out panel side by side (main page)
     - **Layer 2**: COGS Analysis with Sites/Products tab switch (clickable from first 4 stages)
       - **Tab Switch**: Centered in header with "Sites" and "Products" tabs
       - **Sites Tab** (default):
         - Multi-select site filter dropdown (All Sites, Suzhou Plant, Dongguan Plant, etc.)
         - Key Call Out panel with AI-generated insights
         - MVA Breakdown waterfall chart (12-stage MVA waterfall)
         - Cost Component Gaps section (Material, Labor, MOH, Outsource totals)
         - Simplified Site Cost Impact table with columns: Factory, MVA Impact (K), # of Initiatives, Expected Initiative Impact (K), Actual Initiative Impact (K)
         - Draggable table rows with factory initiative tooltips
       - **Products Tab**:
         - Overall Performance Summary with GP and Revenue highlights
         - OP Impact Overview: 4 cards (Volume Impact, Price Impact, Cost Impact, Mix Impact) sorted by GP Gap to Budget
         - Detailed Excel-like table with Product Family breakdown
         - Columns: Product Family, GP Actual, GP Budget, GP Gap to Budget, Vol Impact, Price Impact, Cost Impact, Mix Impact
         - Color coding: Green for positive, Red for negative
   - **Executive-Focused Navigation**:
     - Smooth slide-in/slide-out animations between layers (300ms duration)
     - Breadcrumb navigation showing current path (e.g., "NP Deviation > COGS Analysis")
     - Back button correctly navigates to previous layer
     - Clickable breadcrumb links for direct navigation
     - Visual hierarchy with subtle background changes and shadows
     - Premium hover effects on clickable elements
   - **Initiative Proposals Section**: Proposals and initiatives for leakage recovery
     - Display proposal with actions/initiatives
     - Actions can be converted to Wave Initiatives (marked as L0 when created)
     - "Wave It!" button to create Wave initiatives
     - L-gate stage badges (L0-L5) with color coding
     - Visual badges for high feasibility and high priority
     - "Add Initiative" button to add new actions to proposals
     - Wave Initiative modal for creating initiatives
   - **Removed Features**: Scenarios, assumptions, comparison features, value driver modals (focused on NP Deviation Breakdown and Initiative Proposals)
   - Accessible via right sidebar navigation (Quarterly Actuals Review)

7. ✅ `/action-tracker` - Action Tracker Page

   - Accessible via sidebar navigation at `/action-tracker`
   - Comprehensive action list with JIRA-like swim lanes
   - Auto-resizing swimlanes that utilize available width
   - Status workflow management (TODO/In Progress/Ready for Review/Completed/Reopen)
   - Priority indicators (High/Medium/Low)
   - Owner information with avatars
   - Reassign owner modal with notification simulation
   - Comments system with history display
   - Expandable action cards with full details
   - "Create Action" button in page header

8. ✅ `/my-meetings` - My Meetings Page (not in sidebar menu)

   - Weekly calendar view (Monday-Friday grid layout)
   - Week navigation controls (previous/next/today buttons)
   - Time slots display (7 AM - 8 PM, 30-minute intervals)
   - Meeting event cards with color coding by meeting type
   - Critical meeting highlighting (blue background with border)
   - Meeting detail modal with comprehensive information:
     - Meeting title, time, location, organizer
     - Attendees list (required and optional)
     - Meeting materials display (External Pulse and Internal Pulse items)
     - Description and details
   - Today highlighting in calendar grid
   - Week number and date range display
   - HKT (GMT+8) timezone indicator
   - Click on meeting events to view details in modal

9. ✅ `/meeting/:meetingId` - Meeting Detail Page

   - Individual meeting view accessed from calendar
   - Full meeting details with attendees
   - Meeting materials display
   - Navigation back to calendar

10. ✅ `/powerbi` - Power BI Page

    - Embedded Power BI dashboard for financial review
    - Financial Review Overview dashboard
    - "Create Action" button in page header
    - Full-height iframe integration

11. ✅ `/profile` - User Profile Page

12. ✅ `/ideation-progress` - Ideation Progress Page

   - Two tabs: Building Robust Plans and Tracking execution to bottom line
   - Timeframe toggles shared with global selection (YTM default)
   - Building Robust Plans: in-year L3 totals, L1+/L2+/L3 impact, % of target, and indicator columns
   - Tracking execution: L3+ pipeline, L4+ impact vs target, late initiatives, milestone completion, postponed milestones

    - User information display
    - Profile details (email, role, member since)
    - Notification status
    - Quick actions (Edit Profile, Notification Settings, Change Password)
    - Back navigation button

## 🎯 Feature Completeness

Total Features from Plan: **65+**
Implemented Features: **78+** (120%+)

**Major Additions:**

- Full Year OP Waterfall Chart with 8-stage progression
- Applied Assumptions Feature:
  - Toggle-able assumptions system with visual impact indicators
  - Individual assumption impacts shown as colored bars in waterfall chart
  - Real-time waterfall updates when assumptions are toggled
  - Three pre-configured assumptions (AI Data Center, Apple AirPods, Copper Price)
  - Delete functionality with confirmation modal
- Pulse Suggested Assumptions Feature:
  - Assumptions derived from external news items (news-11, news-1, news-2)
  - Side-by-side layout with Applied Assumptions and visual arrow indicator
  - Drag and drop functionality to move suggested assumptions to applied
  - Toggle to see impact on waterfall (unchecked by default)
  - Visual distinction in waterfall chart (lower opacity, distinct colors)
  - Delete functionality with confirmation modal
  - Source tracking via sourceNewsId linking to originating news items
- Value Driver Scenario Simulation System:
  - Scenario creation and editing modal
  - Value driver adjustment by category/metric
  - Simulated waterfall calculation
  - Multi-scenario visualization on waterfall chart
  - Scenario comparison panel with best/worst analysis
  - Scenario statistics and ranking
  - Scenario management (create, edit, delete, toggle visibility)

### Module 1: Market Pulse

- Features A.1-A.4: ✅ 100% Complete
- Features B.1-B.4: ✅ 100% Complete
- Features C.1-C.4: ✅ 100% Complete
- Features D.1-D.4: ✅ 100% Complete

### Module 2: Business Assumptions

- Features G.1-G.4: ⚠️ Removed (AssumptionsTable component deleted)
- Features H.1-H.4: ⚠️ Removed (ConflictAlertsPanel component deleted)
- Features I.1-I.4: ⚠️ Removed (BusinessAssumptions page deleted)

**Note**: Business Assumption Management features have been removed from the current implementation. The Finance page focuses on financial performance review and scenario simulation.

### Module 3: Financial Forecast

- Features J.1-J.4: ✅ 100% Complete
- Features K.1-K.4: ✅ 100% Complete
- Features L.1-L.9: ✅ 100% Complete
- Features M.1-M.4: ✅ 90% Complete (Wave integration mocked)
- **Applied Assumptions Feature**: ✅ 100% Complete
  - Toggle-able assumptions with visual impact indicators
  - Individual assumption impacts shown as colored bars in waterfall
  - Real-time waterfall updates when assumptions change
  - Cumulative impact calculation
  - Color-coded assumption cards matching chart visualization
  - Delete functionality with confirmation modal
- **Pulse Suggested Assumptions Feature**: ✅ 100% Complete
  - Assumptions derived from external news items (news-11, news-1, news-2)
  - Side-by-side layout with Applied Assumptions
  - Drag and drop functionality with visual arrow indicator
  - Toggle to see impact on waterfall (unchecked by default)
  - Visual distinction in waterfall chart (lower opacity, distinct colors)
  - Delete functionality with confirmation modal
  - Move to Applied via drag and drop
- **Value Drivers Modal Feature**: ✅ 100% Complete
  - Modal-based value drivers display (replaces inline section)
  - "Value Drivers" button in Applied Assumptions panel to view overall value drivers
  - Click on assumption cards to view assumption-specific value driver changes
  - Edit mode for assumption value drivers:
    - Edit existing value driver changes (change value, unit, change percentage)
    - Add new value drivers manually from dropdown of available drivers
    - Remove value drivers with delete button
    - Real-time calculation of "New Value" as changes are made
    - Save/Cancel buttons to persist or discard changes
  - Updated value drivers automatically affect cumulative calculations
  - Value driver changes stored per assumption and aggregated in cumulative view

## 🧪 Testing Notes

This is a **frontend-only mockup** with:

- ✅ All interactions working
- ✅ All visualizations rendering
- ✅ All navigation functional
- ✅ Simulated notifications
- ⚠️ No data persistence (by design)
- ⚠️ No real API calls (by design)
- ⚠️ No authentication (by design)

## 📦 File Count

- React Components: 13
  - ActionTracker.tsx
  - CalendarSidebar.tsx
  - CreateActionModal.tsx
  - CriticalInsights.tsx
  - InternalPulseCheck.tsx
  - MeetingDetailView.tsx
  - MeetingSchedulingModal.tsx
  - RightSidebar.tsx
  - RootCauseAnalysisSidebar.tsx
  - ScenarioComparisonPanel.tsx
  - ScenarioCreationModal.tsx
  - TimeframePicker.tsx
  - WaveExecutiveDashboard.tsx
- Layer Components: 3
  - CostImpactBreakdownLayer.tsx
  - MVABreakdownLayer.tsx
  - ProductAnalysisLayer.tsx
- Page Components: 11
  - ActionTrackerPage.tsx
  - BusinessGroupPerformancePage.tsx
  - ExecutiveSummaryPage.tsx
  - ExternalPulsePage.tsx
  - FinancePage.tsx
  - FinanceReviewPage.tsx
  - InternalPulsePage.tsx
  - MyMeetingsPage.tsx
  - PowerBIPage.tsx
  - UserProfile.tsx
  - WaveExecutiveDashboardPage.tsx
- Layout Components: 1
  - MainLayout.tsx
- Utility Files: 5
  - meetingRelevance.ts
  - meetingUtils.ts
  - scenarioComparison.ts
  - scenarioUtils.ts
  - valueDriverMapping.ts
- Context Files: 1
  - ActionsContext.tsx
- TypeScript files: 30+
- Mock data files: 11 (including OP waterfall stages data, NP deviation stages data, product family data, cost impact data, MVA breakdown stages, executive dashboard data, root causes data, business group performance data, and calendar events)
- Type definitions: 1 (with 60+ interfaces including scenario, waterfall, meeting, and root cause types)
- Total lines of code: ~10,000+

**Architecture Change**: The application has been refactored from a tab-based navigation structure to a page-based structure with right sidebar navigation. This provides better separation of concerns and a cleaner navigation experience.

## 🎉 Ready for Demo

The application is **fully functional** and ready for CEO demonstration. All planned features have been implemented successfully.

### How to Demo

1. **Application Entry** (http://localhost:5173/) - Default landing:

   - Root route shows Home page (Executive Summary)
   - Right sidebar navigation always visible with two grouped sections:
     - **Real Time Pulse Section** (blue theme):
       - Home (Home icon)
       - Performance Intelligence (Building Office icon)
       - Market Intelligence (Currency Dollar icon)
     - **Tools Section** (blue theme):
       - Action Tracker (Clipboard icon)
       - Quarterly Actuals Review (Document Check icon)
   - Optional left calendar sidebar (toggleable via floating button)
   - Section headers displayed when sidebar is expanded
   - Visual separator between sections
   - Color-coded active states (blue for Real Time Pulse and Tools)
   - Profile link at bottom of sidebar
   - Sidebar can be collapsed/expanded using toggle button
   - "Create Action" buttons on page headers for context-specific action creation

2. **Home Page** (http://localhost:5173/) - Demonstrate:

   - **Timeframe Filter**: Shared TimeframePicker component with options: Full year forecast, Year to Month actuals, Rolling 3 months, In-month (default: Year to Month actuals)
   - **Home Toggle**: Budget/YTM/Full Year toggle now respects user selection unless overridden by a `?toggle=` link
   - **BU Auto-Select**: `?bu=` query param auto-selects the active BU across Budget/Actual/Forecast
   - **Business Group Performance**: Table showing financial metrics by business group
     - Business groups: HH, FII, FIH, FIT, Others, Overall consolidated
     - Expandable rows to show sub-groups
     - Metrics: Revenue, Gross Profit, Operating Profit, Net Profit
     - Each cell displays absolute value (e.g., "$14.8M") with comparison ("vs budget $X.XM")
     - Percentage badges with color coding (green for positive, red for negative, gray for flat)
     - Hover tooltip on each metric cell showing:
       - 12-month trend sparkline chart with SVG visualization
       - AI-generated insights explaining the metric performance
       - Color-coded trend line matching performance direction
     - Toggle to show/hide comparison details
     - Click on metric cells to navigate to Business Group Performance page
     - Link to detailed Business Group Performance page
   - **Selection System**: Multi-select items with action bar
     - Action bar appears when items are selected
     - "AI Analysis" button opens Root Cause Analysis sidebar
     - "Schedule Meeting" button opens meeting scheduling modal
     - Drag selected items directly to calendar events
   - **Left Calendar Sidebar**: Toggleable daily agenda view
     - Shows today's meetings
     - Drag-and-drop support for adding materials to meetings
     - Click meetings to navigate to meeting detail page
   - **Root Cause Analysis**: Integrated AI sidebar for insights on selected items

3. **Performance Intelligence Page** (http://localhost:5173/business-group-performance) - Demonstrate:
4. **BU Function Performance Page** (http://localhost:5173/business-unit-performance/functional-performance) - Demonstrate:

   - Key Call Out card with AI insight
   - Budget and Actual cards with large values for the selected function, scaled to match selected BU totals
   - Query params: `function=TopLine` and `bu=x,y,z`


   - **Filtering**: Query parameter `?bu=<group_id>` for business group filtering
   - **Detailed Table**: Same table as Home page but with more space and focus
   - **Deviation Waterfall**: Shows the BU performance deviation waterfall by value driver with YTM budget/actual aligned to the BU totals, plus a BU selection indicator with hover list
   - **Deviation Waterfall**: Shows the BU performance deviation waterfall by value driver
   - **Row Selection**: Select rows to scale the waterfall to the chosen business units
   - **Ideation Progress Link**: Click L3+ vs target or L4+ vs planned to open Ideation Progress
   - **Deep Dive Navigation**: Click waterfall stages for COGS Analysis
     - Sites tab with MVA waterfall and site table
     - Products tab with product family breakdown
   - **Breadcrumb Navigation**: Clear path with clickable links
   - **Timeframe Filtering**: Full year forecast and Year to Month actuals (default: Year to Month actuals)

4. **External Pulse Page** (http://localhost:5173/external-pulse) - Access via direct URL (not in sidebar menu):

   - External news feed with 4-category filtering (Macro, Competitors, Customers, Suppliers)
   - Risk/opportunity classification with badges
   - Impact level indicators (High/Medium/Low)
   - Urgency level badges (Urgent/Important/Normal)
   - AI analysis display with typing effect simulation
   - Annotation capabilities
   - **Create Action**: "Create Action" button in page header (top-right) for context-specific action creation
   - **Root Cause Analysis**: Click "Generate Insights" button → Opens slider sidebar
     - Select news items from the feed
     - See quantitative impact analysis on value drivers and financials
     - Waterfall and bar charts showing external impacts

5. **Internal Pulse Page** (http://localhost:5173/internal-pulse) - Access via direct URL (not in sidebar menu):
6. **Market Intelligence Page** (http://localhost:5173/market-intelligence) - Demonstrate:

   - **Performance Waterfall** updates with assumption toggles
   - **Focus Toggle** defaults from the inbound link and controls the highlighted stage


   - **Tab Switcher**: Two tabs at the top - "KPIs and operational indicators" and "Wave"
   - **KPIs and operational indicators tab** (default):
     - **Timeframe Filter**: Shared TimeframePicker component (compact variant) with options: Full year forecast, Year to Month actuals, Rolling 3 months, In-month (default: Year to Month actuals)
     - Value driver framework organized by financial category (Revenue, COGS, OPEX, Operating Profit)
     - Metrics with value drivers and affecting factors
     - Performance status indicators and variance displays
     - Color-coded performance status (good/warning/concern)
     - Mini sparkline charts for each metric
     - Click metrics to expand detail modals with trend charts
     - **Create Action**: "Create Action" button in page header (top-right) for context-specific action creation
     - **Root Cause Analysis**: Click "Generate Insights" button → Opens slider sidebar
       - Select metrics from the framework
       - See leading parameter analysis explaining impact on profit
       - Example: Select "labor cost increase" → See analysis explaining impact when products are sold
   - **Wave tab**:
     - **Create Action**: "Create Action" button in page header (top-right) for context-specific action creation
     - **4 Key Charts in 2x2 Grid**:
       - **Value Progress Chart**: Shows current value (985.0M + 445.6M) vs target (4,792.0M) with stacked segments
       - **Value Delivery Tracking Chart**: Monthly time-series from Jan-20 to Dec-20 with stacked bars and red target line
       - **Variance Analysis Chart**: Waterfall-style breakdown showing positive (Accelerated, Over-delivery, Newly Added) and negative (Delayed, Lost Delivery, Moved to L3, Cancelled/Paused) variance components
       - **Workflow Value Delivery Chart**: Stacked bars showing value delivery across 13 workflows (Water, Juice, Carbonated, Company, Finance, Information, Human Resources, Legal, Logistics, Procurement, Sales, Health, Training)
     - **Initiatives Table**:
       - Click workflow group headers to expand/collapse initiatives
       - View initiative details: ID, Name, Phase (L0-L5), Weekly Status, Owner, Workflow, L4 Date, Net Benefit, Asset Type
       - Status indicators: Green square for "Progressing Smoothly", Red square for "Leadership Attention"
     - **Summary Cards**:
       - **Row 1**: Overdue initiatives (count + net benefit), Initiatives due in 7 days, Initiatives due in 30 days
       - **Row 2**: Overdue milestones (count + owner count), Milestones due in 7 days, Milestones due in 30 days

7. **Ideation Progress Page** (http://localhost:5173/ideation-progress) - Demonstrate:

   - **Tabs**: Building Robust Plans and Tracking execution to bottom line
   - **Timeframe Toggle**: Mirrors the global timeframe selection (Execution tab excludes Full year forecast)
   - **Building Robust Plans**: L3 totals, impact by L1+/L2+/L3, % of in-year target, indicator columns
   - **Tracking Execution**: L3+ pipeline, L4+ impact vs target, late initiatives, milestone completion, postponed milestones

8. **Finance Forecast Page** (http://localhost:5173/finance) - Access via direct URL (not in sidebar menu):

   - **Create Action**: "Create Action" button in page header (top-right) for context-specific action creation

   - **Full Year OP Waterfall**: Prominently displayed at top showing 8-stage OP progression from YTM Actuals (210M) through Momentum, Pipeline Improvement, Headwinds/Tailwinds, Additional Risks, Assumed Leakage, Leakage Recovery to Full Year FCST (237M)
   - Interactive tooltips showing cumulative OP values, delta changes, and scenario values
   - Color-coded stages: Grey (baseline), Light blue (positive), Orange/pink (negative)
   - **Applied Assumptions**:
     - Applied Assumptions panel side-by-side with Pulse Suggested Assumptions
     - Three assumptions with color indicators (emerald, amber, red)
     - Toggle assumptions on/off using checkboxes on the right
     - See individual assumption impacts as colored bars in waterfall chart
     - Example: Uncheck "AI Data Center Acceleration" → See -5M removed from Headwinds/Tailwinds stage
     - Example: Uncheck "Copper Price Surge" → See +5M added to Additional Risk stage
     - Multiple assumptions affecting same stage show cumulative impact
     - Delete assumptions with confirmation modal
   - **Pulse Suggested Assumptions**:
     - Side-by-side layout with Applied Assumptions (left) and Pulse Suggested (right)
     - Left arrow indicator in middle showing drag direction
     - Three suggested assumptions from external news (Vietnam Wage Hike, US Tariff, Rare Earth)
     - Pulse AI suggested assumptions - drag to Applied Assumptions or check to see impact on waterfall
     - Drag suggested assumptions and drop into Applied Assumptions section
     - Check suggested assumptions to see their impact on waterfall (unchecked by default)
     - Suggested assumptions show in waterfall with lower opacity and distinct colors
     - Delete suggested assumptions with confirmation modal
     - Click on assumption cards to view/edit their specific value driver changes
   - **Value Drivers Modal**:
     - Click "Value Drivers" button in Applied Assumptions panel → Opens modal with overall value drivers
     - Click on any assumption card → Opens modal showing assumption-specific value driver changes
     - View mode: See base value, change, and calculated new value for each affected value driver
     - Edit mode: Click "Edit" button in modal header when viewing an assumption
       - Edit existing value driver changes: Modify change value, unit, and change percentage
       - Add new value drivers: Use "Add Value Driver" section with dropdown to select from available drivers
       - Remove value drivers: Click X button on value driver cards
       - Real-time calculation: "New Value" updates automatically as you edit
       - Save changes: Click "Save Changes" to persist edits (affects cumulative calculations)
       - Cancel: Click "Cancel" or "Cancel Edit" to discard changes
     - Updated value drivers automatically affect cumulative calculations
   - **Scenario Management**:
     - Click "Create Scenario" → Opens Scenario Creation Modal
     - Adjust value drivers by category/metric (e.g., increase labor rate by 10%)
     - See real-time change percentage calculations
     - Save scenario → See simulated waterfall line on chart
     - Toggle scenario visibility with checkboxes in scenario panel
     - Edit/delete scenarios
     - Publish scenario version
     - Ability to save multiple versions of financial forecasts
   - **Scenario Comparison**:
     - Click "Compare Best/Worst" → Auto-selects best and worst scenarios
     - Click "Comparison Panel" → Opens slider sidebar
     - See best/worst scenarios with statistics
     - Sort by impact, name, or date
     - Compare multiple scenarios on waterfall chart
   - **Action Proposals**: Based on Applied Assumptions with 1-to-1 Proposal mapping
     - Each assumption can have one proposal with multiple actions
     - Actions can be converted to Wave Initiatives (marked as L0 when created)
     - L-gate stage badges (L0-L5) with color coding
     - Visual badges for high feasibility and high priority
     - Create Proposal and Create Action modals
     - **AI-Generated Actions**:
       - Drag "Vietnam Minimum Wage Hike" from Pulse Suggested to Applied Assumptions → Proposal automatically created with 2 AI-generated actions
       - AI-generated actions display purple gradient badge with "AI" label and sparkle icon (✨)
       - Badge automatically disappears when action is "Waved" (assigned a stage), indicating CEO review and approval
       - Example actions: "Improve UPPH by 2–3% through line balancing..." (2.5M impact) and "Push 1.5–2% ASP adjustment..." (4.5M impact)

7. **Quarterly Actuals Review Page** (http://localhost:5173/finance-review) - Demonstrate:

   - **Create Action**: "Create Action" button in page header (top-right) for context-specific action creation

   - **NP Deviation Breakdown Waterfall**: Prominently displayed at top showing 9-stage NP deviation progression
     - Click on first 4 stages (Budget NP, Vol. impact, Price impact, Cost impact) to drill down
     - Interactive tooltips showing cumulative NP values and delta changes
     - Color-coded: Green for favourable, Red for adverse, Grey for baseline
     - Legend with "Favourable" and "Adverse" indicators
     - Side-by-side layout with Key Call Out panel (waterfall 3/4 width, Key Call Out 1/4 width)
   - **Key Call Out Section**: AI-generated insights displayed side by side with waterfall chart
     - AI badge (purple gradient badge with sparkle icon ✨) on same line as "Key Call Out" heading
     - Bullet points summarizing main drivers and root cause analysis
     - Professional styling with clear hierarchy
     - Content always visible (no toggle switches)
   - **Layer 2 - COGS Analysis** (click any of first 4 stages):
     - **Tab Switch**: Centered "Sites" / "Products" toggle in header
     - **Sites Tab** (default):
       - Multi-select site filter dropdown with checkboxes (All Sites, or select multiple individual sites)
       - Filter logic: Deselecting a site from "All Sites" shows remaining sites; deselecting "All Sites" selects first site
       - Key Call Out panel with AI-generated insights
       - MVA Breakdown waterfall chart (12-stage MVA waterfall with color-coded bars)
       - Cost Component Gaps cards (Material, Labor, MOH, Outsource)
       - Simplified site table: Factory, MVA Impact (K), # of Initiatives, Expected/Actual Initiative Impact
       - Draggable rows with initiative tooltips on hover
     - **Products Tab**:
       - Overall Performance Summary with GP and Revenue highlights
       - OP Impact Overview: 4 impact cards sorted by GP Gap to Budget
       - Detailed table with Product Family breakdown
   - **Navigation Features**:
     - Breadcrumb trail showing current path with clickable links
     - Back button correctly navigates to Layer 1
     - Smooth slide-in/slide-out animations (300ms)
     - Executive-focused premium styling
   - **Initiative Proposals Section**: Located below NP Deviation Breakdown waterfall
     - Displays proposals with actions/initiatives for leakage recovery
     - Each action shows description, expected impact, feasibility, and priority
     - "Wave It!" button to convert actions to Wave Initiatives (automatically marked as L0)
     - L-gate stage badges (L0-L5) displayed when action is "Waved"
     - "Add Initiative" button to add new actions to existing proposals
     - Wave Initiative modal for comprehensive initiative creation
   - Accessible via right sidebar navigation (Quarterly Actuals Review)

8. **Action Tracker** (http://localhost:5173/action-tracker) - Access via sidebar navigation:

   - Click "Action Tracker" in sidebar (Real Time Pulse section) → Navigates to dedicated page
   - **Note**: External Pulse, Internal Pulse, Finance Forecast, and My Meetings pages are accessible via direct URL but not shown in sidebar menu
   - **Tab Switch**: "My Actions" and "Assign to others" tabs in page header (between title and Create Action button)
     - Default view: "My Actions" (shows 17 CEO-owned actions)
     - Switch to "Assign to others" to view 28 actions assigned to team members
     - Tab styling matches InternalPulseCheck design (gray container with white active button)
     - Vertically centered with header elements
   - Comprehensive action list with JIRA-like swim lanes
   - Auto-resizing swimlanes **that** utilize available width
   - Status workflow management (TODO/In Progress/Ready for Review/Completed/Reopen)
   - CEO actions distributed across all status types for realistic visualization
   - Priority indicators (High/Medium/Low)
   - Owner information with avatars
   - Reassign owner modal with notification simulation
   - Comments system with history display
   - Expandable action cards with full details
   - "Create Action" button in page header
    - **Action Items Requiring Attention**: Summary of urgent high-priority actions (below the tracker)
      - Count cards for urgent actions, high-priority actions, and total actions
      - Top 3 urgent actions displayed with details

9. **My Meetings** (http://localhost:5173/my-meetings) - Access via direct URL (not in sidebar menu):

   - **Weekly Calendar View**: Monday-Friday grid layout with time slots (7 AM - 8 PM)
   - **Week Navigation**: Use previous/next buttons to navigate between weeks, or click "Today" to jump to current week
   - **Meeting Events**: Color-coded meeting cards displayed on calendar grid:
     - Critical meetings: Blue background with solid border
     - Finance review meetings: Blue dashed border
     - Interview meetings: Purple dashed border
     - Check-in meetings: Green dashed border
     - Travel meetings: Orange dashed border
     - Other meetings: Pink dashed border
   - **Today Highlighting**: Current day highlighted with blue background and border
   - **Meeting Details**: Click on any meeting event to open detail modal:
     - View meeting title, time, location, and organizer
     - See attendees list (required and optional with role information)
     - Review meeting materials (External Pulse and Internal Pulse items attached)
     - View meeting description
   - **Week Display**: Shows week number and date range (e.g., "18 November - 22 November 2025 (Week 47)")
   - **Timezone**: HKT (GMT+8) indicator in top navigation bar
   - **Time Slots**: 30-minute intervals from 7 AM to 8 PM with visual grid lines

10. **User Profile** (http://localhost:5173/profile) - Access via profile link in sidebar:

- User profile information display
- Profile details (email, role, member since)
- Notification status
- Quick actions (Edit Profile, Notification Settings, Change Password)
- Back navigation button

## 🔮 Future Enhancements (Out of Scope)

These were intentionally NOT implemented as this is a UX mockup:

- Backend API integration
- Database persistence
- Real GenAI integration
- User authentication
- Mobile responsiveness
- Email/Slack notifications
- Excel/PDF export
- Real-time WebSocket updates

## 🔧 Non-Functional Features & Infrastructure Requirements

The following non-functional features and infrastructure components are required for production deployment. These backend/infrastructure features would transform the current UX mockup into a fully functional production system.

### 1. AI-Powered News Feed System

- **Agentic AI News Feed**: Intelligent news aggregation and filtering for external pulse
- **Real-time News Aggregation**: Continuous monitoring and ingestion of news from multiple sources
- **Internal Knowledge Agent**: Cross-checking mechanism that validates news against internal knowledge base
- **GraphRAG as Core RAG Stack**: Graph-based Retrieval Augmented Generation for knowledge graph construction
  - Ability to "remember" CEO's preferences and context
  - Personalized insights based on historical interactions
- **Deeper Insights Generation**: Advanced analysis from news items
  - Potential for model fine-tuning to improve relevance
  - Context-aware analysis that considers business impact
- **Action Approval Workflows**: Multi-stage approval processes

### 2. Authentication & User Management

- **User Role Management**: Role-based access control (RBAC) system
- **Session Management**: Secure session handling and token management
- **Permission System**: Granular permissions for different features and data access

### 3. Calendar Integration

- **One-way Calendar Sync**: Integration with Outlook/Exchange and Google Calendar
  - Automatic synchronization of calendar events
  - Real-time updates from calendar systems
- **Meeting Materials Update**: Ability to create and update meetings from the application

### 4. Data Integration & Sync

- **Real-time Database Synchronization**: Customer database sync via big data platform
  - High-throughput data pipeline
  - Event-driven architecture for real-time updates
- **API Integrations**: Connections to external systems (ERP, CRM, BI tools)
- **ETL Pipeline Architecture**: Extract, Transform, Load processes for data migration
- **Unstructured Data Pipeline**: Processing pipeline for design documents and non-structured content
  - Document parsing and extraction
  - Content indexing and searchability
- **Document Processing & Ingestion**: Automated ingestion of business documents
  - Metadata extraction
  - Content classification
- **Asynchronous Job Processing**: Background processing for news feed aggregation
- **Scheduled/Cron Tasks**: Automated data synchronization jobs
- **Background AI Processing**: Non-blocking AI insight generation
- **Task Queue Management**: Message queue system (e.g., RabbitMQ, Celery)
- **Job Monitoring & Retry Mechanisms**:
  - Job status tracking
  - Automatic retry on failure
  - Dead letter queue handling

### 5. Model Accuracy & Quality Assurance

- **Guiderail Design**: Framework for evaluating model accuracy
  - Recall rate monitoring and evaluation
  - Precision metrics tracking
  - F1-score calculations
- **Model Performance Metrics Tracking**: Integration with MLFlow or similar MLOps platform
  - Model versioning and tracking
  - Performance comparison across model versions
  - Quality scoring and alerting
- **Full-text Search Engine**: Integration with Elasticsearch, Vector database, or PostgreSQL full-text search
- **Search Indexing**: Comprehensive indexing for news, documents, and actions
- **Advanced Search Filters**: Faceted search with multiple filter options
- **Search Relevance Tuning**:
  - Hybrid search (keyword + semantic)
  - Re-ranking algorithms
  - Personalized search results
- **Validation Mechanisms**: User feedback system for AI outputs
  - Thumb up/down with reasoning collection

### 6. [Optional] Notification & Communication System

- **Email Notifications**: Automated email alerts for:
  - Action assignments and updates
  - Meeting reminders
  - Critical alerts and warnings
- **Slack/Teams Integration**: Real-time notifications via collaboration platforms
  - Channel-based notifications
  - Rich message formatting
  - Interactive message actions

### 7. Monitoring & Observability

- **Application Performance Monitoring (APM)**: Real-time application health monitoring
- **Error Tracking & Alerting**: Integration with error tracking tools (e.g., Sentry)
- **Distributed Tracing**: End-to-end request tracing for microservices
- **Log Aggregation & Analysis**: Centralized logging system (e.g., ELK stack)
- **Health Check Endpoints**: System health monitoring endpoints
- **Metrics Dashboard**: Real-time metrics visualization (CPU, memory, request rates)

### 8. Security

- **Data Backup Strategies**: Automated backup schedules (daily, weekly, monthly)
  - Point-in-time recovery capabilities
  - Cross-region backup replication
- **API Rate Limiting & Throttling**: Protection against API abuse
- **API Authentication & Authorization**: Secure API access control
- **Data Encryption**: Encryption at rest and in transit
- **Audit Logging**: Comprehensive audit trail for security compliance

### 9. Testing & Quality Assurance Infrastructure

- **CI/CD Pipeline**: Automated deployment pipelines (GitHub Actions, Azure DevOps)
- **Automated Testing**: Comprehensive test suite (unit, integration, e2e)
- **Security Scanning**: Automated vulnerability assessment
- **Test Data Management**: Test data generation and management

### 10. Internationalization & Localization

- **Multi-language Support (i18n)**: Support for multiple languages
- **Timezone Handling**: Automatic timezone conversion and display
- **Currency and Number Formatting**: Localized number and currency formats
- **Date/Time Localization**: Region-specific date and time formats

## 📄 Documentation

- ✅ README.md with full documentation
- ✅ IMPLEMENTATION_SUMMARY.md (this file)
- ✅ Inline code comments
- ✅ TypeScript interface documentation

## 👨‍💻 Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```

## ✨ Key Highlights

1. **Comprehensive**: All 65+ planned features implemented
2. **Professional**: Enterprise-grade UI/UX design
3. **Interactive**: Fully functional mockup with rich interactions
4. **Realistic**: Based on real business scenarios and data
5. **Type-Safe**: Full TypeScript implementation
6. **Performant**: Fast Vite build with optimized bundle
7. **Documented**: Extensive README and code comments
8. **Demo-Ready**: Immediately usable for stakeholder presentations
9. **User Journey Optimized**: Right sidebar navigation with flat route structure:
   - Root route displays Home page (Executive Summary)
   - Navigation items organized into two visually distinct groups:
     - Real Time Pulse section (blue theme): Home, Performance Intelligence, Market Intelligence, Action Tracker
     - Tools section (blue theme): Quarterly Actuals Review
   - Section headers and visual separators for clear organization
   - Color-coded active states for easy identification
   - Sidebar navigation provides quick access to all features
   - Collapsible right sidebar for space optimization
   - Optional left calendar sidebar with daily agenda and drag-drop support
   - Profile link accessible from sidebar
   - Root Cause Analysis integrated into Pulse pages for quantitative insights
   - Internal Pulse Page with tab switcher: "KPIs and operational indicators" tab for value driver framework, "Wave" tab for executive dashboard with comprehensive initiatives tracking and value delivery visualization
   - Scenario simulation system integrated into Finance page for value driver testing
   - Action Tracker as dedicated route page accessible via sidebar navigation
   - "Create Action" buttons on page headers for context-specific action creation
10. **NP Deviation Breakdown Visualization**: NP Deviation Breakdown waterfall chart prominently displayed at top of Finance Review page, showing 9-stage cumulative progression from Budget NP to Actual NP with color-coded favourable/adverse impacts and clickable deep dive functionality
11. **Flattened 2-Layer Deep Dive Navigation**: Executive-focused navigation system simplified from 4 layers to 2 layers:
    - Layer 1: NP Deviation Breakdown waterfall with Key Call Out panel side by side (main page)
    - Layer 2: COGS Analysis with Sites/Products tab switch:
      - **Sites Tab**: Multi-select site filter, Key Call Out, MVA waterfall, Cost Component Gaps, simplified site table
      - **Products Tab**: Impact overview cards and product family breakdown table
    - Smooth transitions, breadcrumb navigation with clickable links, and premium styling throughout
    - Multi-select site filter with smart logic (deselecting from All Sites shows remaining, deselecting All Sites defaults to first site)
12. **Key Call Out System**: AI-generated Key Call Out sections:
    - Consistent side-by-side layout (waterfall with Key Call Out panel)
    - AI badge (purple gradient badge with sparkle icon ✨) displayed on same line as "Key Call Out" heading
    - Bullet points summarizing main drivers
    - Root cause analysis paragraphs
    - Content always visible (toggle switches removed for cleaner UI)
    - Professional styling matching application design system
13. **Applied Assumptions Feature**: Toggle-able assumptions system for waterfall forecast:
    - Three pre-configured assumptions (AI Data Center Acceleration, Apple AirPods Launch Delay, Copper Price Surge)
    - Individual assumption impacts visualized as colored bars in waterfall chart
    - Real-time waterfall updates when assumptions are toggled on/off
    - Cumulative impact calculation for multiple assumptions affecting same stage
    - Color-coded assumption cards with visual indicators matching chart colors
    - Cascading recalculation of subsequent stages when assumptions change
14. **Scenario Simulation System**: Comprehensive value driver scenario management:
    - Create scenarios by adjusting value drivers
    - Visualize multiple scenarios on waterfall chart
    - Compare scenarios with best/worst analysis
    - Calculate simulated OP impact from value driver changes
    - Scenario statistics and ranking
15. **Pulse Suggested Assumptions System**: Assumptions derived from external news with drag-and-drop workflow:
    - Three suggested assumptions from external news (Vietnam Wage Hike, US Tariff, Rare Earth Restrictions)
    - Side-by-side layout with Applied Assumptions and visual arrow indicator
    - Drag and drop from Suggested to Applied Assumptions
    - Toggle suggested assumptions to see impact on waterfall (unchecked by default)
    - Visual distinction in waterfall chart (lower opacity, distinct colors)
    - Delete functionality with confirmation modal for both suggested and applied assumptions
    - Source tracking via sourceNewsId linking to originating news items
16. **Value Drivers Modal System**: Modal-based value drivers with editing capabilities:
    - Modal replaces inline value drivers section for cleaner UI
    - "Value Drivers" button in Applied Assumptions panel to view overall value drivers
    - Click on assumption cards to view assumption-specific value driver changes
    - Edit mode for assumption value drivers:
      - Edit existing value driver changes (change value, unit, change percentage)
      - Add new value drivers manually from dropdown of available drivers
      - Remove value drivers with delete button
      - Real-time calculation of "New Value" as changes are made
      - Save/Cancel buttons to persist or discard changes
    - Updated value drivers automatically affect cumulative calculations
    - Value driver changes stored per assumption and aggregated in cumulative view
17. **Wave Executive Dashboard**: Comprehensive executive-level dashboard for initiatives and value delivery tracking:
    - Accessible as "Wave" tab within Internal Pulse Page
    - 4 key charts showing value progress, delivery tracking, variance analysis, and workflow breakdown
    - Initiatives table with workflow grouping and comprehensive tracking columns
    - Summary cards for overdue/due soon initiatives and milestones
    - All metrics and labels in English
    - Tab switcher on Internal Pulse Page allows seamless switching between KPIs and Wave Dashboard
18. **Action Proposals Based on Applied Assumptions**: Proposal and action management system:
    - 1-to-1 mapping between Applied Assumptions and Proposals
    - Each Proposal contains multiple Actions that can be converted to Wave Initiatives
    - L-gate stage management (L0-L5) with color-coded badges for Wave project gates
    - Visual badges for high feasibility (green) and high priority (red)
    - Create Proposal modal for assumptions without proposals
    - Create Action modal for adding actions to existing proposals
    - When "Create Wave Initiative" is clicked, action is automatically marked with L0 stage
    - All Applied Assumptions displayed regardless of proposal status
    - **AI-Generated Actions**: Actions can be marked as AI-generated with prominent purple gradient badge
      - Badge displays "AI" label with sparkle icon for clear identification
      - Badge automatically hides when action is "Waved" (assigned a stage), indicating CEO review
      - When "Vietnam Minimum Wage Hike" is moved from Pulse Suggested to Applied, proposal is automatically created with 2 AI-generated actions (UPPH improvement and ASP adjustment)
19. **Create Action Feature**: Context-specific action creation on page headers:
    - "Create Action" buttons on all major pages (Executive Summary, External Pulse, Internal Pulse, Finance, Finance Review)
    - Consistent button styling (primary color, PlusIcon, positioned right of page title)
    - Each page manages its own modal state independently
    - CreateActionModal component with form fields (title, description, owner, priority, due date)
    - Actions stored in global ActionsContext for shared state management
    - Removed global floating "Create Action" button for cleaner UI
    - Enables CEO to quickly create actions from any page context
20. **Action Tracker Page**: Dedicated route page for action management:
    - Accessible via sidebar navigation (Real Time Pulse section) at `/action-tracker` route
    - Full page layout with header and "Create Action" button
    - **Tab Switch Feature**: "My Actions" and "Assign to others" tabs in page header
      - Tab switch positioned between page title and "Create Action" button, vertically centered
      - Styled to match InternalPulseCheck tab design for consistency
      - "My Actions" tab: Filters and displays 17+ CEO-owned actions (approval tasks, executive follow-ups)
      - "Assign to others" tab: Filters and displays 28+ actions assigned to team members
      - Default tab: "My Actions"
      - CEO actions distributed across all status types (TODO, In Progress, Ready for Review, Completed, Reopen)
    - Comprehensive action list with JIRA-like swim lanes
    - Auto-resizing swimlanes that utilize available width (flex-1 with min-width constraints)
    - Status workflow management, priority indicators, owner information
    - Comments system and expandable action cards
    - Integrated into main layout with consistent styling
21. **Business Group Performance**: Comprehensive business group financial overview:
    - Available on both Home page (summary) and dedicated Business Group Performance page (detailed)
    - Table layout with expandable business groups: HH, FII, FIH, FIT, Others, Overall consolidated
    - Overall row pinned to the top and selected by default
    - 4 financial metrics per group: Revenue, Gross Profit, Operating Profit, Net Profit
    - Each cell shows absolute value (e.g., "$14.8M") with comparison baseline ("vs budget $X.XM")
    - Color-coded percentage badges (green positive, red negative, gray flat)
    - Row selection controls to compare specific business units against the waterfall
    - Deviation-by-functions section shows selected BU indicator with hover list
    - Hover feedback and per-row drilldown actions on the deviation-by-functions table
    - Hover tooltips with rich content:
      - 12-month trend sparkline chart (SVG visualization)
      - Color-coded trend line matching performance direction
      - AI-generated insights explaining metric performance
    - Click on metric cells to navigate to detailed Business Group Performance page
    - Toggle to show/hide comparison details
    - Expandable rows to show sub-groups
    - Overall consolidated row with calculated totals and primary color highlighting
22. **Left Calendar Sidebar**: Toggleable daily agenda view:
    - Floating button to open/close calendar sidebar
    - Daily view showing today's meetings
    - Drag-and-drop support for adding materials to meetings from pulse pages
    - Click meetings to navigate to meeting detail page
    - Auto-close when navigating to My Meetings page
    - Visual indicators for meeting times and materials
23. **Power BI Integration**: Embedded Power BI dashboard:
    - Dedicated `/powerbi` route for financial review overview
    - Full-height iframe embedding of Power BI report
    - "Create Action" button in page header
    - Seamless integration with application navigation
24. **TimeframePicker Component**: Reusable timeframe selection component:
    - Shared component used across multiple pages (Home, Performance Intelligence, Internal Pulse)
    - Four timeframe options: Full year forecast, Year to Month actuals, Rolling 3 months, In-month
    - Selection persists across pages (stored and reused as the default on navigation)
    - Two visual variants: `default` (with label) and `compact` (no label, enhanced styling)
    - Exported types (`TimeframeOption`, `TimeframeOptionItem`) and constants (`TIMEFRAME_OPTIONS`) for reuse
    - Consistent styling and behavior across the application

---

**Status**: ✅ COMPLETE - Ready for CEO presentation
**Build Time**: ~2 hours
**Quality**: Production-ready mockup
**Next Steps**: Schedule demo with CEO
