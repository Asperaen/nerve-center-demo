# 🚀 Quick Start Guide

## Current Status

✅ **The application is RUNNING and ready to use!**

**Access URL**: http://localhost:5173/

## What You Have

A fully functional CEO dashboard mockup with:

- 5 main modules
- 65+ features implemented
- 2 realistic business scenarios
- Interactive charts and visualizations
- Complete mock data

## Quick Navigation

### 1. Dashboard Overview

**URL**: http://localhost:5173/dashboard

Shows executive summary with:

- Top 4 KPIs
- Urgent news alerts
- Priority actions
- Quick links to all modules

### 2. Market Pulse

**URL**: http://localhost:5173/market-pulse

Three tabs:

- **Pulse Check**: External news + Internal KPIs
- **Root Cause Analysis**: AI-powered chat for KPI drill-down
- **Action Tracker**: Manage actions and provide decisions

### 3. Business Assumptions

**URL**: http://localhost:5173/assumptions

Two tabs:

- **Assumptions Management**: Review and approve assumptions
- **Conflict Resolution**: Resolve data conflicts (4 active conflicts!)

### 4. Financial Forecast

**URL**: http://localhost:5173/forecast

- Income statement forecast
- 8 forecast drivers with P&L impact
- Interactive waterfall chart
- Business events with action proposals

### 5. Scenario Simulation

**URL**: http://localhost:5173/scenarios

- Edit forecast drivers
- Compare up to 3 scenarios
- Save and manage scenarios
- Real-time recalculation

## Key Features to Demo

### 🎯 Must-See Interactions

1. **External Pulse Check**

   - Click "Show AI Analysis" on any news item
   - Try the "Add Note" feature
   - Filter by category

2. **KPI Dashboard**

   - Click any KPI card to see full details
   - Notice the sparkline trends
   - Check the modal's 12-month chart

3. **Root Cause Analysis**

   - Click an example prompt to see AI response
   - Explore the waterfall chart
   - Click bar chart elements to drill down

4. **Action Tracker**

   - Click an action title to expand details
   - Try the "Reassign" button
   - Add a CEO decision

5. **Business Assumptions**

   - Approve or reject pending assumptions
   - Click chart icon to see timeline
   - Go to "Conflict Resolution" tab

6. **Scenario Simulation**
   - Click "Edit Drivers"
   - Change a value and click "Recalculate"
   - Try "Compare Scenarios" mode

## Scenario-Specific Demo Flow

### Scenario 1: US Tariff Impact

1. Go to **Market Pulse** → See tariff news at top
2. Check **Business Assumptions** → See volume trend -20%
3. View **Financial Forecast** → See $10M tariff impact in waterfall
4. Check **Action Tracker** → See Vietnam production shift action

### Scenario 2: Rare Earth Supply

1. Go to **Market Pulse** → See rare earth news
2. Check **Business Assumptions** → Conflicts tab → See cost conflict
3. View **Financial Forecast** → See $5M material cost impact
4. Check **Action Tracker** → See alternative supplier action

## Mock Data Highlights

### KPIs (All with 12-month history)

- Net Profit: $156.3M (vs $160M budget, -2.3%)
- Revenue: $2,305M (vs $2,350M budget, -1.9%)
- UPPH: 2.3 (vs 2.6 target, -11.5%)
- Customer Complaints: 47 cases (vs 35 target, +34%)

### News Items

- 10 items across 4 categories
- Mix of risks and opportunities
- High/Medium/Low impact levels
- Recent timestamps (last 2-120 hours)

### Actions

- 15 action items
- Various statuses (pending, in-progress, overdue)
- Multiple owners (VP Operations, VP Sales, CFO, etc.)
- Some with CEO decisions already added

### Assumptions

- 12 business assumptions
- 5 categories
- Mix of approved/pending/rejected
- Historical changes tracked

### Conflicts

- 4 open conflicts
- Different severity levels (Critical to Low)
- 3 conflict types
- Suggested resolutions included

## Tips for Best Experience

### Performance

- Uses Vite for instant updates
- Charts render smoothly with Recharts
- No lag even with large datasets

### Navigation

- Use sidebar for main navigation
- Tabs within pages for sub-sections
- Breadcrumbs show drill-down path

### Interaction Patterns

- Hover for additional info
- Click cards/rows for details
- Modals for focused actions
- Alerts for confirmation

## Common Actions

### Approve an Assumption

1. Go to Business Assumptions
2. Find a "Pending" assumption
3. Click "Approve" button
4. See alert confirmation

### Add CEO Decision to Action

1. Go to Market Pulse → Action Tracker tab
2. Click action title to expand
3. Type decision in text area
4. Click "Submit"
5. See decision added to list

### Compare Scenarios

1. Go to Scenario Simulation
2. Click "Compare Scenarios"
3. Select 2-3 scenarios
4. See chart and table comparison

### Drill Down in Analysis

1. Go to Market Pulse → Root Cause Analysis tab
2. Click example prompt: "Which BU is causing our NP falls behind budget?"
3. Click bar in chart
4. See breadcrumb navigation
5. View detailed breakdown

## Dev Commands

```bash
# If server stops, restart with:
cd /Users/xiaochen_guo/Workstation/Playground/nerve-poc/nerve-dashboard
pnpm dev

# Build for production:
pnpm build

# Check for errors:
pnpm lint
```

## File Locations

```
nerve-dashboard/
├── src/
│   ├── pages/           # 5 main pages
│   ├── components/      # 15+ components
│   ├── data/           # 6 mock data files
│   └── types/          # TypeScript definitions
├── README.md           # Full documentation
├── IMPLEMENTATION_SUMMARY.md  # Detailed feature list
└── QUICK_START.md     # This file
```

## Need Help?

### Check Logs

```bash
cat /tmp/vite-dev.log
```

### Restart Server

```bash
cd /Users/xiaochen_guo/Workstation/Playground/nerve-poc/nerve-dashboard
pnpm dev
```

### Check Port

Server runs on: http://localhost:5173/

---

**Enjoy exploring the CEO Dashboard! 🎉**

Everything is ready for your demo.
