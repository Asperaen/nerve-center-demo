import type { BiweeklyDashboardData, NewsItem } from "../types";
import type { ExternalPulseResponse, ForecastData } from "./types";

/**
 * Forecast Metrics Mock Data - Compal Electronics 2026 Forecast Simulation
 *
 * Based on Compal's public financial data:
 * - 2024 H1 revenue: ~$14B USD (NT$436.8B)
 * - 2024 Q2 gross margin: 5.0%, operating margin: 1.7%
 * - 2025 YTD (Jan-Sep) revenue: ~$18.2B (down 16.8% YoY)
 *
 * 2026 Forecast Assumptions:
 * - AI server demand recovery driving 8% revenue growth target
 * - Gross margin improvement to 5.3% through product mix optimization
 * - Operating margin target of 1.8% from cost efficiency initiatives
 *
 * Unit: Mn USD - consistent with frontend display unit
 */
export const mockForecastMetrics: { metrics: ForecastData } = {
  metrics: {
    revenue: {
      lastYear: 23333, // 2025 actual: 23,333 Mn USD
      target: 25200, // 2026 budget: +8% growth target (AI server demand)
      lastWeek: 24650, // Week 4 forecast
      current: 24820, // Week 5 forecast (improved outlook from AI orders)
    },
    gp: {
      lastYear: 1231, // 2025 actual: 1,231 Mn USD (5.3% margin)
      target: 1336, // 2026 budget: 5.3% of revenue target
      lastWeek: 1295, // Week 4 forecast
      current: 1310, // Week 5 forecast (favorable product mix)
    },
    op: {
      lastYear: 383, // 2025 actual: 383 Mn USD (1.6% margin)
      target: 454, // 2026 budget: 1.8% margin target
      lastWeek: 425, // Week 4 forecast
      current: 436, // Week 5 forecast (cost optimization impact)
    },
    income: {
      lastYear: 72, // 2025 Non-OP income: 72 Mn USD
      target: 65, // 2026 budget: conservative estimate
      lastWeek: 68, // Week 4 forecast
      current: 70, // Week 5 forecast (FX gains)
    },
    np: {
      lastYear: 268, // 2025 actual: 268 Mn USD
      target: 350, // 2026 budget: improved profitability
      lastWeek: 320, // Week 4 forecast
      current: 335, // Week 5 forecast (better margins + non-op)
    },
  },
};

const rawExternalPulseResponse = {
  output: [
    {
      title: "高階ABF載板現結構性缺口　欣興領頭、南電與景碩急追",
      importance_label: "high",
      urgency_label: "short_term",
      opportunity_risk: "risk",
      scoring_confidence: "high",
      suggested_next_steps: [
        "Immediately notify affected customers and sales teams about potential ABF-related lead-time and price pressure impacting server/accelerator projects.",
        "Work with procurement to secure or extend allocations of critical downstream materials and identify qualified alternative substrate or supplier sources.",
        "Prioritise production for highest-value customers and consider short-term repricing or contract discussions to reflect pass-through costs.",
        "Increase monitoring of ABF/T-Glass availability and pricing weekly until capacity expansions materially reduce shortages.",
      ],
      date: "2026-01-29",
      source: "DIGITIMES",
      url: "https://www.digitimes.com.tw/tech/dt/n/shwnws.asp?id=0000745273_F3Q1BP3F8CLQWZ2R8KT0M",
      category: ["Competitors & Industry", "Suppliers & Supply Chain"],
      summary:
        "AI伺服器與CoWoS先進封裝面積放大使高階ABF載板需求倍增，供給出現結構性缺口，欣興領先擴產、南電與景碩加速追趕，短期以台系廠為主且價格與交期承壓。",
      is_first_seen: false,
    },
    {
      title: "Panamanian Court Strikes Down Hong Kong Firm’s Canal Contract",
      importance_label: "high",
      urgency_label: "short_term",
      opportunity_risk: "risk",
      scoring_confidence: "high",
      suggested_next_steps: [
        "Task logistics and freight teams to model Panama Canal rerouting scenarios and estimate transit-time and cost impacts for Asia-Americas lanes.",
        "Contact major carriers and 3PL providers for immediate guidance on port terminal status and contingency routing options.",
        "Increase safety stock or preposition inventory for customers reliant on Panama transits until routing and terminal clarity is restored.",
      ],
      date: "2026-01-30",
      source: "The New York Times - Business",
      url: "https://www.nytimes.com/2026/01/30/business/panama-canal-ck-hutchison.html",
      category: ["Macro & Geopolitics"],
      summary:
        "A Panamanian court nullified a Hong Kong firm’s long-standing rights to operate two Panama Canal ports, disrupting established port contracts, increasing legal and geopolitical risk for foreign investors, and potentially forcing shipping lines to re-evaluate routing and terminal arrangements.",
      is_first_seen: false,
    },
    {
      title: "DRAM、NAND合約價飆漲不煞車　年關將近趨緩現貨買氣",
      importance_label: "high",
      urgency_label: "short_term",
      opportunity_risk: "risk",
      scoring_confidence: "high",
      suggested_next_steps: [
        "Quantify exposure to memory price inflation in customer BOMs and update margin models for impacted product lines.",
        "Coordinate with major customers about memory procurement strategies and potential order timing shifts that could affect Compal demand.",
        "Assess pass-through pricing clauses and consider short-term price adjustments or contractual protections where feasible.",
      ],
      date: "2026-01-29",
      source: "DIGITIMES",
      url: "https://www.digitimes.com.tw/tech/dt/n/shwnws.asp?id=0000745328_DBG4ZXYV1Z4QJ991EVNXR",
      category: ["Competitors & Industry", "Suppliers & Supply Chain"],
      summary:
        "受AI資料中心強勁需求拉動，記憶體合約價大幅上漲（如DDR5漲幅顯著），雖然年關前現貨買氣稍微趨緩，但整體供給仍吃緊並對伺服器與終端產品BOM造成壓力。",
      is_first_seen: false,
    },
    {
      title:
        "PLA Navy warns off foreign jets with jamming missiles near Taiwan: CCTV",
      importance_label: "medium",
      urgency_label: "short_term",
      opportunity_risk: "risk",
      scoring_confidence: "high",
      suggested_next_steps: [
        "Immediately flag logistics teams to monitor Taiwan Strait NOTAMs, maritime advisories and carrier notices for potential impacts to shipping schedules.",
        "Alert regional operations and procurement to assess near-term port and air route disruptions affecting Taiwan-based suppliers.",
        "Reconfirm contingency plans with Taiwan facilities and suppliers (alternate ports, airfreight capacity, worker mobility) for the coming weeks.",
        "Review insurance coverage and security protocols for shipments and personnel in affected waters/airspace.",
      ],
      date: "2026-02-01",
      source: "SCMP - Business",
      url: "https://example.com/industry-news-1",
      category: ["Macro & Geopolitics"],
      summary:
        "Chinese state media released footage of a Type 055 destroyer (Yanan) using electronic jamming near Taiwan to warn off foreign aircraft, highlighting the PLA’s increasing use of electronic warfare as part of deterrence and signalling that raises operational risks in the Taiwan Strait.",
      is_first_seen: true,
    },
    {
      title: "U.S. Trade Deficit Widens Despite Trump’s Tariffs",
      importance_label: "medium",
      urgency_label: "mid_term",
      opportunity_risk: "risk",
      scoring_confidence: "high",
      suggested_next_steps: [
        "Review and stress-test supplier contracts and landed cost models to quantify tariff exposure across key product lines.",
        "Coordinate with procurement to identify alternative sourcing or tariff mitigation measures for high-exposure inputs.",
        "Monitor monthly US trade data and policy announcements for signs that tariff measures will change or be expanded.",
      ],
      date: "2026-01-29",
      source: "The New York Times - Business",
      url: "https://www.nytimes.com/2026/01/29/business/us-trade-deficit-tariffs.html",
      category: ["Macro & Geopolitics"],
      summary:
        "US imports rebounded and the trade deficit widened despite tariff measures, suggesting tariffs have not curtailed import demand and may instead raise costs for manufacturers and consumers while underscoring the complexity of reshaping integrated global supply chains.",
      is_first_seen: false,
    },
    {
      title:
        "美國BEAD計畫政策急轉彎　寬頻部署成本優先衝擊光纖布局 (US BEAD plan policy shift prioritises deployment cost over fibre-first)",
      importance_label: "medium",
      urgency_label: "mid_term",
      opportunity_risk: "mixed",
      scoring_confidence: "high",
      suggested_next_steps: [
        "Quantify potential addressable demand changes for fibre-related components versus fixed-wireless and LEO terminal components in US BEAD projects.",
        "Engage US customers and distributors to understand how this policy will change procurement preferences and timelines.",
        "Adjust product-mix and go-to-market plans for North America to capture increased fixed-wireless/ground-station opportunities or mitigate fibre demand loss.",
      ],
      date: "2026-01-27",
      source: "DIGITIMES - Research",
      url: "https://www.digitimes.com.tw/tech/rpt/rpt_show.asp?v=20260127-34",
      category: ["Macro & Geopolitics"],
      summary:
        "The US BEAD broadband program pivoted from a fibre-first policy to a technology-neutral, cost-priority approach, elevating fixed wireless and LEO satellite options over fibre in some cases and prompting suppliers to reconfigure product mixes and capacity to capture shifting demand.",
      is_first_seen: true,
    },
    {
      title:
        "產銷調查：預估1Q26中企智慧型手機出貨年減8.2% (Survey: 1Q26 Chinese smartphone shipments expected to fall 8.2% YoY)",
      importance_label: "medium",
      urgency_label: "mid_term",
      opportunity_risk: "risk",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Adjust short-term production and inventory plans for smartphone-facing product lines to reflect weaker regional orders.",
        "Prioritise customers and products with more stable demand to avoid excess inventory buildup in Q1.",
        "Engage major regional OEMs for updated forecasts and potential timing of product launches or promotions.",
      ],
      date: "2026-01-28",
      source: "DIGITIMES - Research",
      url: "https://www.digitimes.com.tw/tech/rpt/rpt_show.asp?v=20260128-38",
      category: ["Macro & Geopolitics"],
      summary:
        "DIGITIMES forecasts Chinese smartphone shipments will fall about 8.2% year-on-year in 1Q26 as demand softens and inventories are adjusted, prompting brands to use promotions and delayed launches while upstream suppliers should flex production to avoid excess stock.",
      is_first_seen: true,
    },
    {
      title: "Cloud Giants Develop Custom AI Accelerators",
      importance_label: "medium",
      urgency_label: "mid_term",
      opportunity_risk: "mixed",
      scoring_confidence: "high",
      suggested_next_steps: [
        "Engage cloud/hyperscaler customers to map differing accelerator interfaces and identify potential component opportunities across multiple ASIC platforms.",
        "Prioritise flexible product designs and qualification paths to cater for a multi-vendor accelerator ecosystem.",
        "Monitor design-win announcements from hyperscalers to align capacity and R&D investments with emerging interface standards.",
      ],
      date: "2026-01-29",
      source: "The New York Times",
      url: "https://www.nytimes.com/2026/01/29/technology/cloud-ai-chips-competition.html",
      category: ["Competitors & Industry"],
      summary:
        "Major cloud providers developing custom AI accelerators are gaining commercial traction, promoting diversified hardware architectures，將改變上游封裝、互連與系統整合的需求格局。",
      is_first_seen: false,
    },
    {
      title: "How the A.I. Boom Could Push Up the Price of Your Next PC",
      importance_label: "low",
      urgency_label: "short_term",
      opportunity_risk: "risk",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Quantify exposure to elevated memory costs in consumer PC and smartphone product lines and update pricing models.",
        "Discuss procurement hedging or longer-term contract strategies with customers affected by memory inflation.",
        "Explore alternative BOM configurations or suppliers to mitigate near-term memory cost pass-through.",
      ],
      date: "2026-01-29",
      source: "The New York Times",
      url: "https://www.nytimes.com/2026/01/29/technology/ai-memory-chips-pc-smartphone.html",
      category: ["Competitors & Industry"],
      summary:
        "A.I.業者大量搶購記憶體推高DRAM與NAND價格，可能推升筆電與手機等消費電子的成本，記憶體供給緊張預期將在短期持續。",
      is_first_seen: false,
    },
    {
      title:
        "Pentagon eyes expanded role for South Korea-based US forces to help support regional stability",
      importance_label: "medium",
      urgency_label: "mid_term",
      opportunity_risk: "risk",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Monitor official US and ROK defence policy updates and exercise schedules over the next quarter for changes that could affect regional logistics.",
        "Map critical shipping lanes and supplier routes through the Taiwan Strait and run contingency scenarios for heightened regional military activity.",
        "Engage key customers with exposure in Taiwan/South Korea to confirm inventory buffers and alternative routing options.",
        "Review insurance and force-majeure clauses for Asia production/shipping contracts in light of rising geopolitical tension.",
      ],
      date: "2026-02-01",
      source: "SCMP - Business",
      url: "https://example.com/industry-news-2",
      category: ["Macro & Geopolitics"],
      summary:
        "The Pentagon signalled US forces in South Korea may take on roles beyond deterring North Korea to help counter regional tensions—particularly in strategic regions—requiring adjustments to basing, logistics and planning and complicating Seoul’s diplomatic calculations while raising the risk of heightened regional tensions.",
      is_first_seen: true,
    },
    {
      title: "Major OEM Reports Strong Sales Amid Holiday Bump",
      importance_label: "medium",
      urgency_label: "mid_term",
      opportunity_risk: "opportunity",
      scoring_confidence: "high",
      suggested_next_steps: [
        "Confirm with customer-facing account teams whether incremental demand will translate into near-term order increases or extended supply needs.",
        "Ensure prioritized allocation and readiness for customer-specific connectors and modules during the follow-on production window.",
        "Review capacity plans to accommodate any sustained uplift in customer-driven component demand.",
      ],
      date: "2026-01-30",
      source: "The New York Times",
      url: "https://www.nytimes.com/2026/01/29/technology/major-oem-sales-quarterly-report.html",
      category: ["Customer & End-market"],
      summary:
        "Major OEM posted strong sales driven by new models and strong holiday demand, which lifted the company’s quarterly revenue and profits.",
      is_first_seen: false,
    },
    {
      title: "Trump Picks Kevin Warsh as Next Fed Chair",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "mixed",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Have finance and treasury model scenarios for potential shifts in interest-rate policy and implications for borrowing costs over the next quarter.",
        "Monitor market reactions (yields, FX) and update cash management and hedging posture accordingly.",
        "Communicate with key stakeholders about potential impacts on capital expenditure timing and cost of capital.",
      ],
      date: "2026-01-30",
      source: "The New York Times - Business",
      url: "https://www.nytimes.com/2026/01/30/us/politics/trump-fed-chair-kevin-warsh.html",
      category: ["Macro & Geopolitics"],
      summary:
        "President Trump nominated former Fed governor Kevin Warsh to succeed Jerome Powell, a choice that markets view as potentially changing the Fed’s approach to interest rates and financial stability and has already altered investor expectations about the path of borrowing costs.",
      is_first_seen: false,
    },
    {
      title:
        "Chinese Suppliers Form Backbone of Humanoid Robot Initiative",
      importance_label: "medium",
      urgency_label: "mid_term",
      opportunity_risk: "mixed",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Map robotics-related sourcing opportunities for robot and automation components and confirm qualification requirements for potential design wins.",
        "Assess geopolitical and tariff exposure for supplying components into Chinese supply chains supporting US-based final assembly.",
        "Engage automotive/robotics OEM contacts to understand expected BOM content and timing for Optimus and related programs.",
      ],
      date: "2026-02-01",
      source: "Industry News",
      url: "https://www.scmp.com/tech/tech-trends/article/3341953/chinese-suppliers-robotics-initiative?utm_source=rss_feed",
      category: ["Competitors & Industry", "Customer & End-market"],
      summary:
        "PC maker plans US production of humanoid robot，其供應鏈仍高度依賴中國廠商提供執行器、感測器、電機、PCB與連接器等關鍵零組件，顯示零組件供應重心仍在中國並帶來採購與合規風險。",
      is_first_seen: true,
    },
    {
      title: "Waymo Year-End 2025 Status",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "opportunity",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Prioritise automotive-grade connector and sensor module qualification efforts to align with AV fleet procurement cycles.",
        "Engage Tier-1 automotive suppliers and integrators supporting Waymo deployments to understand BOM and volume timing.",
        "Review supply chain traceability and automotive certifications to ensure readiness for robotaxi scale deployments.",
      ],
      date: "2026-01-28",
      source: "EE Times",
      url: "https://www.eetimes.com/waymo-year-end-2025-status/",
      category: ["Competitors & Industry", "Customer & End-market"],
      summary:
        "Waymo持續在美國robotaxi市場領先並擴大部署與車隊規模，其對安全與感測套件的重視代表自動駕駛商用化將進一步推升車用連接器與傳感器需求。",
      is_first_seen: false,
    },
    {
      title: "AI Chip Leader Driving Silicon Photonics2026年動能加速　光通訊供應鏈備戰",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "opportunity",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Engage optical module and silicon-photonics suppliers to assess potential component demand and qualification timelines.",
        "Evaluate product roadmaps for high-speed optical interconnects and alignment of Compal’s connector/cable offerings to 800G/1.6T interfaces.",
        "Monitor hyperscaler procurement signals and AI ecosystem announcements for concrete adoption timelines.",
      ],
      date: "2026-01-29",
      source: "DIGITIMES",
      url: "https://www.digitimes.com.tw/tech/dt/n/shwnws.asp?id=0000745327_YMX2KLQW3W4TRC6X8CAIO",
      category: ["Suppliers & Supply Chain"],
      summary:
        "AI chip leader new-gen platform driving800G/1.6T互連與矽光子商轉，2026年矽光子成長加速，供應鏈需同步升級矽光子晶片、光模組封裝與熱管理等環節以因應雲端與超大規模資料中心需求。",
      is_first_seen: true,
    },
    {
      title: "Legacy PC Model Soon to Be History Changed the Industry",
      importance_label: "medium",
      urgency_label: "mid_term",
      opportunity_risk: "mixed",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Assess the impact of Model S/X discontinuation on spare-parts and long-tail demand and adjust service part planning accordingly.",
        "Engage PC OEM contacts to understand roadmap timing for robotics/AI initiatives and potential new component requirements.",
        "Reallocate sales and engineering resources to pursue opportunities in PC OEM emerging AI/robotics programs where company can compete.",
      ],
      date: "2026-01-30",
      source: "The New York Times",
      url: "https://www.nytimes.com/2026/01/30/business/ev-model-history.html",
      category: ["Customer & End-market"],
      summary:
        "Major PC OEM will discontinue legacy models and Model X as it pivots toward AI and robotics, a strategic shift that is likely to reshape component demand and supplier roadmaps across the PC supply chain.",
      is_first_seen: true,
    },
    {
      title:
        "高階AI加速器ABF載板規格升級及出貨快速成長　T-Glass供應缺口將待日東紡1Q27新產能填補",
      importance_label: "medium",
      urgency_label: "long_term",
      opportunity_risk: "risk",
      scoring_confidence: "high",
      suggested_next_steps: [
        "Plan inventory buffers for customers using AI-accelerator ABF substrates through 1Q27 and re-prioritise allocations where possible.",
        "Coordinate with customers (OSATs, PCB suppliers) to confirm allocation policies and expected delivery windows for ABF-dependent orders.",
        "Engage alternative material or packaging suppliers to evaluate qualification timelines for substitution of constrained materials.",
      ],
      date: "2026-01-29",
      source: "DIGITIMES Research",
      url: "https://www.digitimes.com.tw/tech/rpt/rpt_show.asp?v=20260130-41",
      category: [
        "Competitors & Industry",
        "Customer & End-market",
        "Suppliers & Supply Chain",
      ],
      summary:
        "AI加速器出貨與封裝規格升級驅動ABF載板快速成長，但T-Glass玻纖布近乎寡占且成為最大瓶頸，日東紡預計在2027年第一季新增產能才可逐步緩解，建議下游客評估備料與替代方案。",
      is_first_seen: false,
    },
    {
      title:
        "產銷調查：預估1Q26中企智慧型手機出貨年減8.2%　中國市場智慧型手機出貨將年減6.5%",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "risk",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Update smartphone product line forecasts and adjust short-term capacity and inventory planning for regional production.",
        "Offer customers flexible production scheduling or temporary cost reductions to help smooth inventory destocking.",
        "Prioritise support for customers launching promotions or delayed new-model introductions to align production with revised demand.",
      ],
      date: "2026-01-28",
      source: "DIGITIMES",
      url: "https://www.digitimes.com.tw/tech/rpt/rpt_show.asp?v=20260128-38",
      category: ["Customer & End-market"],
      summary:
        "DIGITIMES reports regional smartphone shipments reached 187.6 million units in Q4 2025 (QoQ +6.0%, YoY −1.6%) with full-year 2025 shipments of 711.2 million (+2.2%), and forecasts Q1 2026 declines of 8.2% YoY for regional shipments and 6.5% YoY for the regional market after a Q4 seasonal boost.",
      is_first_seen: false,
    },
    {
      title:
        "2026年高階雲端ASIC加速器出貨量將增至723萬顆　Google外賣TPU領跑　市場呈多方並起格局",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "opportunity",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Engage hyperscaler and server OEM contacts to map expected interface and BOM requirements for ASIC accelerator platforms.",
        "Prioritise qualification efforts for interconnects and modules that target hyperscaler accelerators to capture part of the volume growth.",
        "Align capacity planning for connector and cable production to anticipated hyperscaler procurement cycles.",
      ],
      date: "2026-01-29",
      source: "DIGITIMES",
      url: "https://www.digitimes.com.tw/tech/rpt/rpt_show.asp?v=20260130-40",
      category: ["Customer & End-market"],
      summary:
        "DIGITIMES projects high-end cloud ASIC accelerator shipments will rise about 40.9% to 7.234 million units in 2026, led by Google TPUs and a multi-vendor market that will increase demand for datacenter interconnects and related components.",
      is_first_seen: false,
    },
    {
      title: "2025年前10月泰國BEV銷量突破9萬輛創新高　中國車廠掌握逾7成市佔",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "opportunity",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Explore engagement with Chinese OEMs active in Thailand to position Compal as a regional supplier for PC components.",
        "Evaluate capacity and logistics options to serve increased ASEAN BEV production, including local inventory or distribution centers.",
        "Track Thailand OEM programmes and timing to prioritise product qualifications for PC-specific components and high-voltage components.",
      ],
      date: "2026-01-21",
      source: "DIGITIMES",
      url: "https://www.digitimes.com.tw/tech/rpt/rpt_show.asp?v=20260121-22",
      category: ["Customer & End-market"],
      summary:
        "DIGITIMES finds Thailand’s BEV sales reached 97,416 units through October 2025 (19.7% penetration) with Chinese automakers capturing over 70% market share, indicating accelerating PC adoption in Southeast Asia.",
      is_first_seen: false,
    },
    {
      title: "展會觀察：CES 2026 車用半導體順應SDV發展　全面進入軟硬整合階段",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "opportunity",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Coordinate with automotive customers to prioritise SDV-relevant connector and sensor module qualifications.",
        "Accelerate automotive-grade certification and reliability testing for products targeting SDV platforms.",
        "Monitor OEM platform roadmaps to time capacity and R&D investments aligned with their SDV rollouts.",
      ],
      date: "2026-01-22",
      source: "DIGITIMES",
      url: "https://www.digitimes.com.tw/tech/rpt/rpt_show.asp?v=20260122-28",
      category: ["Customer & End-market"],
      summary:
        "DIGITIMES’ CES 2026 coverage finds the automotive industry shifting to software-defined vehicles and deep hardware-software integration, which will raise orders and specification requirements for semiconductors, sensors, connectors and other vehicle components.",
      is_first_seen: false,
    },
    {
      title: "展會觀察：CES 2026 Panther Lake成全場焦點　AI PC平台競爭再加劇",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "opportunity",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Engage PC OEMs and ODMs to understand Panther Lake BOM changes and timing for potential design wins.",
        "Prepare product offerings (connectors, antennas, thermal interfaces) optimized for AI PC platform requirements.",
        "Coordinate with manufacturing to ensure readiness for potential order ramps tied to AI PC launches.",
      ],
      date: "2026-01-26",
      source: "DIGITIMES",
      url: "https://www.digitimes.com.tw/tech/rpt/rpt_show.asp?v=20260126-33",
      category: ["Customer & End-market"],
      summary:
        "DIGITIMES’ CES coverage highlights Intel’s Panther Lake and competing AI PC platforms as central themes that intensify AI PC competition and are likely to boost demand for new modules, antennas, connectors and system integration work.",
      is_first_seen: false,
    },
    {
      title: "HiPEAC 2026: Reclaiming European Digital Sovereignty",
      importance_label: "medium",
      urgency_label: "long_term",
      opportunity_risk: "mixed",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Monitor EU policy announcements and procurement tenders for local cloud and semiconductor programmes that could create regional demand.",
        "Evaluate feasibility of regional partnerships or certifications to improve access to EU customers prioritising digital-sovereignty suppliers.",
        "Track public-private investment initiatives that may provide co-funding or partnership opportunities for local infrastructure projects.",
      ],
      date: "2026-01-30",
      source: "EE Times",
      url: "https://www.eetimes.com/hipeac-2026-reclaiming-european-digital-sovereignty/",
      category: ["Macro & Geopolitics"],
      summary:
        "HiPEAC 2026 stressed Europe’s push for digital sovereignty—calling for investment in local cloud infrastructure, open-source stacks and regional semiconductor capabilities—to reduce reliance on foreign providers and regain control over data and critical infrastructure.",
      is_first_seen: true,
    },
    {
      title: "Semiconductor Traceability Takes Center Stage at NIST Workshop",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "mixed",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Assess current traceability and component-provenance capabilities across manufacturing and logistics; identify gaps relative to NIST-style guidance.",
        "Engage procurement and quality teams to inventory suppliers’ traceability practices and request roadmap/commitments from key suppliers.",
        "Prioritise pilot projects for secure tagging or metadata capture on a representative product line to test practical implementation.",
      ],
      date: "2026-01-30",
      source: "EE Times",
      url: "https://www.eetimes.com/semiconductor-traceability-takes-center-stage-at-nist-workshop/",
      category: [
        "Macro & Geopolitics",
        "Competitors & Industry",
        "Suppliers & Supply Chain",
      ],
      summary:
        "A NIST workshop elevated semiconductor traceability and provenance to a mainstream industry priority, with attendees advocating interoperable standards, secure tagging and cross-industry cooperation to ensure trusted supply chains and meet government and buyer requirements.",
      is_first_seen: false,
    },
    {
      title:
        "Lightmatter and GUC Partner to Produce Co-Packaged Optics (CPO) Solutions for AI Hyperscalers",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "opportunity",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Monitor CPO specification and qualification timelines from Lightmatter/GUC and hyperscaler customers for potential design requirements.",
        "Evaluate optical module and connector roadmaps to determine if Compal should prepare compatibility or qualification efforts for CPO interfaces.",
        "Engage existing hyperscaler customers to understand their CPO procurement timelines and potential component sourcing needs.",
      ],
      date: "2026-01-28",
      source: "EE Times",
      url: "https://www.eetimes.com/lightmatter-and-guc-partner-to-produce-co-packaged-optics-cpo-solutions-for-ai-hyperscalers/",
      category: ["Competitors & Industry", "Suppliers & Supply Chain"],
      summary:
        "Lightmatter與GUC合作商用化3D Co-Packaged Optics (CPO) Passage™解決方案，結合ASIC設計與光子互連以提供給hyperscalers更密集、低延遲的光互連。",
      is_first_seen: false,
    },
    {
      title: "Omron gets to grips with TM S series of high-payload cobots",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "opportunity",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Engage industrial automation customers to explore demand for higher-spec connectors and harnesses compatible with TM S-class cobots.",
        "Review product portfolio to identify opportunities for connector/harness variants targeting higher payload industrial automation.",
        "Coordinate with sales to target integrators and OEMs adopting higher-payload cobots for pilot supply arrangements.",
      ],
      date: "2026-01-30",
      source: "Electronics Weekly",
      url: "https://www.electronicsweekly.com/news/products/emech-enclosures/omron-gets-to-grips-with-tm-s-series-high-payload-cobots-2026-01/",
      category: ["Competitors & Industry"],
      summary:
        "Omron推出負載提升的TM S系列協作機器人並更新TMflow軟體，旨在簡化部署與擴展工業應用，將帶動對高規格連接器與相關零組件的需求增加。",
      is_first_seen: true,
    },
    {
      title: "PC Maker Shifts Production to Humanoid Robots　中國仍成主力供應鏈",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "mixed",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Map regional robotics suppliers mentioned and assess any overlap with Compal’s customer opportunities or supply risks.",
        "Discuss with automotive customers the expected sourcing footprints for robotics and next-gen vehicle components.",
        "Review tariff and compliance implications for supplying components into regionally-sourced BOMs for US final assembly.",
      ],
      date: "2026-01-29",
      source: "DIGITIMES",
      url: "https://www.digitimes.com.tw/tech/dt/n/shwnws.asp?id=0000745340_8QH4GWZ43H9WV310ZOVJ5",
      category: ["Suppliers & Supply Chain"],
      summary:
        "PC maker plans to shift production lines轉向生產Optimus人形機器人，但短中期仍高度倚賴中國供應商供應關鍵零組件與模組，儘管最終組裝欲回流美國，供應鏈仍以中國為主力。",
      is_first_seen: true,
    },
    {
      title:
        "Chinese Suppliers Form Backbone of Humanoid Robot Initiative",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "mixed",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Combine supplier intelligence from multiple sources to update risk maps for robotics components.",
        "Identify potential competitive or partnership opportunities with Chinese component makers serving Optimus supply chains.",
        "Evaluate compliance and logistics risks for continued sourcing from regional suppliers to support US final assembly plans.",
      ],
      date: "2026-01-31",
      source: "Industry News",
      url: "https://www.scmp.com/tech/tech-trends/article/3341953/chinese-suppliers-robotics-initiative?utm_source=rss_feed",
      category: ["Suppliers & Supply Chain"],
      summary: null,
      is_first_seen: true,
    },
    {
      title: "樂金電視生產外包越南　分散地緣風險、強化成本競爭力",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "opportunity",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Assess regional market entry or distributor relationships to support localised component demand for TV assemblies.",
        "Review logistics and tariff implications for supplying components into the region versus existing production locations.",
        "Engage OEM contacts to understand timing and scale of order transfers and potential new qualification requirements.",
      ],
      date: "2026-01-29",
      source: "DIGITIMES",
      url: "https://www.digitimes.com.tw/tech/dt/n/shwnws.asp?id=0000745189_VBQ0LC169MFJTK85VIR2R",
      category: ["Suppliers & Supply Chain"],
      summary:
        "LG將部分電視生產外包給越南廠商（如Alpha Seven）以分散地緣風險並降低成本，此舉可能促進越南在面板、背光與終端組裝等供應鏈環節的在地化發展。",
      is_first_seen: true,
    },
    {
      title: "2026年全球OSAT營收估成長12.8%　AI應用將挹注先進封裝業務營收",
      importance_label: "low",
      urgency_label: "mid_term",
      opportunity_risk: "mixed",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Monitor OSAT capacity signals and lead-time indicators for packaged ICs relevant to key customers.",
        "Engage customers in advanced-packaging segments to understand their OSAT partners and potential demand implications for component sourcing.",
        "Assess whether partnerships with OSATs or packaging suppliers could provide closer alignment with advanced-packaging ramps.",
      ],
      date: "2026-01-21",
      source: "DIGITIMES",
      url: "https://www.digitimes.com.tw/tech/rpt/rpt_show.asp?v=20260122-26",
      category: ["Suppliers & Supply Chain"],
      summary:
        "受AI與先進封裝放量帶動，預估2026年全球OSAT營收年增約12.8%，將進一步推升封裝基板、載板、測試設備與材料需求，同時使良率與交期管理成為供應鏈關鍵。",
      is_first_seen: false,
    },
    {
      title:
        "Regional currency initiatives continue to expand globally",
      importance_label: "low",
      urgency_label: "long_term",
      opportunity_risk: "mixed",
      scoring_confidence: "medium",
      suggested_next_steps: [
        "Monitor announcements from other resource-exporting countries for similar yuan settlement arrangements as a leading indicator of wider adoption.",
        "Assess FX exposure models and treasury procedures for increased yuan-denominated flows in regional transactions.",
        "Engage corporate treasury to evaluate the need for expanded RMB payment rails or hedging strategies if yuan settlement activity increases.",
      ],
      date: "2026-02-01",
      source: "SCMP - Business",
      url: "https://example.com/industry-news-3",
      category: ["Macro & Geopolitics"],
      summary:
        "Zambia will collect taxes and royalties from regional mining firms in yuan and recycle the currency to support trade to fund imports and service loans, a move that eases dollar shortages and quietly advances currency diversification while providing a template for other resource exporters to reduce dollar dependence.",
      is_first_seen: true,
    },
  ],
};

const toPriority = (label?: string): NewsItem["priority"] => {
  if (label === "high" || label === "medium" || label === "low") {
    return label;
  }
  return "medium";
};

const toUrgency = (label?: string): NewsItem["urgency"] => {
  if (label === "short_term" || label === "mid_term" || label === "long_term") {
    return label;
  }
  return "mid_term";
};

const toRiskOrOpportunity = (value?: string): NewsItem["riskOrOpportunity"] => {
  if (value === "risk" || value === "opportunity") {
    return value;
  }
  return undefined;
};

const toCategory = (category?: string[] | string) => {
  if (Array.isArray(category)) {
    return category[0] || "general";
  }
  if (typeof category === "string") {
    return category;
  }
  return "general";
};

const toTimestamp = (date?: string) => {
  if (!date) {
    return new Date();
  }
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const mockExternalPulseItems: NewsItem[] = rawExternalPulseResponse.output.map(
  (item, index) => {
    const reasons = Array.isArray(item.suggested_next_steps)
      ? item.suggested_next_steps
      : [];
    return {
      id: `news-${String(index + 1).padStart(4, "0")}`,
      category: toCategory(item.category),
      title: item.title || "Untitled",
      summary: item.summary ?? "",
      reasoning: reasons.join("\n"),
      riskOrOpportunity: toRiskOrOpportunity(item.opportunity_risk),
      priority: toPriority(item.importance_label),
      urgency: toUrgency(item.urgency_label),
      timestamp: toTimestamp(item.date),
      source: item.source || "Unknown",
      url: item.url,
      reasons,
      importance_label: item.importance_label,
      urgency_label: item.urgency_label,
      is_first_seen: item.is_first_seen,
    };
  }
);

export const mockExternalPulseResponse: ExternalPulseResponse =
  mockExternalPulseItems;

/**
 * Monthly Metrics type for budget data
 */
interface MonthlyMetrics {
  rev: number;
  gp: number;
  op: number;
  np: number;
}

/**
 * Monthly Budget Data - Budget from Ambitious Target-2025 new, LastYear from Historical-2024
 * Values in thousands USD (K USD)
 * Each month contains data for all BUs
 */
export const monthlyBudgetData: Record<
  string,
  Record<string, { budget: MonthlyMetrics; lastYear: MonthlyMetrics }>
> = {
  "01": {
    all: {
      budget: { rev: 1584000, gp: 68141, op: 72, np: 50 },
      lastYear: { rev: 1836174, gp: 70084, op: 12168, np: 8518 },
    },
    pcbg: {
      budget: { rev: 1393491, gp: 63062, op: 3567, np: 2497 },
      lastYear: { rev: 1437913, gp: 56931, op: 8709, np: 6096 },
    },
    sdbg: {
      budget: { rev: 190509, gp: 4585, op: -2992, np: -2095 },
      lastYear: { rev: 398262, gp: 7370, op: -918, np: -642 },
    },
    mbu: {
      budget: { rev: 1354, gp: 268, op: -265, np: -186 },
      lastYear: { rev: 742, gp: 472, op: -61, np: -43 },
    },
    central: {
      budget: { rev: 0, gp: 495, op: -503, np: -352 },
      lastYear: { rev: 0, gp: 5783, op: 4377, np: 3064 },
    },
    aebu1: {
      budget: { rev: 894898, gp: 47181, op: 16929, np: 11850 },
      lastYear: { rev: 736537, gp: 35549, op: 12646, np: 8852 },
    },
    aebu2: {
      budget: { rev: 105002, gp: 2594, op: -2696, np: -1887 },
      lastYear: { rev: 152523, gp: 2280, op: -4440, np: -3108 },
    },
    aep: {
      budget: { rev: 19932, gp: 783, op: -2223, np: -1556 },
      lastYear: { rev: 21722, gp: 2352, op: 1254, np: 878 },
    },
    apbu: {
      budget: { rev: 340465, gp: 8348, op: -5300, np: -3710 },
      lastYear: { rev: 493959, gp: 13978, op: 1248, np: 874 },
    },
    isbg: {
      budget: { rev: 29153, gp: 4194, op: -2815, np: -1970 },
      lastYear: { rev: 30415, gp: 2685, op: -1268, np: -888 },
    },
    pcbgceo: {
      budget: { rev: 4040, gp: -39, op: -224, np: -156 },
      lastYear: { rev: 2434, gp: 196, op: -353, np: -247 },
    },
    rd6: {
      budget: { rev: 0, gp: 0, op: -105, np: -73 },
      lastYear: { rev: 323, gp: -109, op: -378, np: -264 },
    },
    sdbgbu1: {
      budget: { rev: 109929, gp: 1028, op: 124, np: 87 },
      lastYear: { rev: 236320, gp: 1553, op: -149, np: -104 },
    },
    sdbgbu2: {
      budget: { rev: 59498, gp: 2090, op: -975, np: -683 },
      lastYear: { rev: 93312, gp: 3993, op: 1520, np: 1064 },
    },
    sdbgbu3: {
      budget: { rev: 9736, gp: 777, op: -658, np: -461 },
      lastYear: { rev: 12240, gp: 328, op: -1659, np: -1162 },
    },
    sdbgbu5: {
      budget: { rev: 8588, gp: 349, op: -784, np: -549 },
      lastYear: { rev: 7657, gp: 231, op: -375, np: -262 },
    },
    sdbgbu6: {
      budget: { rev: 1403, gp: 73, op: -434, np: -304 },
      lastYear: { rev: 47991, gp: 794, op: -194, np: -136 },
    },
    apbu1_abo: {
      budget: { rev: 94753, gp: 956, op: -2437, np: -1706 },
      lastYear: { rev: 139490, gp: 3070, op: -695, np: -486 },
    },
    apbu1_t88: {
      budget: { rev: 19238, gp: 353, op: -427, np: -299 },
      lastYear: { rev: 15385, gp: 748, op: -261, np: -183 },
    },
    apbu1_t99: {
      budget: { rev: 0, gp: -140, op: -894, np: -626 },
      lastYear: { rev: 0, gp: 0, op: 0, np: 0 },
    },
    apbu2_c38: {
      budget: { rev: 209912, gp: 6329, op: -1580, np: -1106 },
      lastYear: { rev: 331641, gp: 9713, op: 2167, np: 1517 },
    },
    apbu2_t12: {
      budget: { rev: 7875, gp: 560, op: 292, np: 205 },
      lastYear: { rev: 7442, gp: 447, op: 153, np: 107 },
    },
    apbu2_t89: {
      budget: { rev: 8687, gp: 291, op: -254, np: -178 },
      lastYear: { rev: 0, gp: 0, op: -117, np: -82 },
    },
  },
  "02": {
    all: {
      budget: { rev: 1836683, gp: 77983, op: 14431, np: 10102 },
      lastYear: { rev: 1642920, gp: 71408, op: 8606, np: 6024 },
    },
    pcbg: {
      budget: { rev: 1403434, gp: 63596, op: 8427, np: 5899 },
      lastYear: { rev: 1438205, gp: 61616, op: 8161, np: 5713 },
    },
    sdbg: {
      budget: { rev: 433249, gp: 13892, op: 6506, np: 4555 },
      lastYear: { rev: 204715, gp: 4008, op: -3932, np: -2752 },
    },
    mbu: {
      budget: { rev: 988, gp: 313, op: -114, np: -80 },
      lastYear: { rev: 245, gp: 93, op: -492, np: -344 },
    },
    central: {
      budget: { rev: 0, gp: 495, op: -503, np: -352 },
      lastYear: { rev: 0, gp: 5783, op: 4377, np: 3064 },
    },
    aebu1: {
      budget: { rev: 886346, gp: 46678, op: 17724, np: 12407 },
      lastYear: { rev: 868229, gp: 42638, op: 14608, np: 10225 },
    },
    aebu2: {
      budget: { rev: 115275, gp: 3992, op: -1256, np: -880 },
      lastYear: { rev: 117837, gp: 2966, op: -2678, np: -1874 },
    },
    aep: {
      budget: { rev: 16582, gp: 1295, op: -830, np: -581 },
      lastYear: { rev: 21316, gp: 1435, op: -584, np: -409 },
    },
    apbu: {
      budget: { rev: 352243, gp: 8052, op: -4736, np: -3315 },
      lastYear: { rev: 401139, gp: 11749, op: -1443, np: -1010 },
    },
    isbg: {
      budget: { rev: 24038, gp: 3208, op: -2532, np: -1773 },
      lastYear: { rev: 25239, gp: 2849, op: -981, np: -687 },
    },
    pcbgceo: {
      budget: { rev: 8951, gp: 371, op: 168, np: 118 },
      lastYear: { rev: 4442, gp: 118, op: -381, np: -267 },
    },
    rd6: {
      budget: { rev: 0, gp: 0, op: -110, np: -77 },
      lastYear: { rev: 4, gp: -138, op: -379, np: -265 },
    },
    sdbgbu1: {
      budget: { rev: 81197, gp: 1000, op: 135, np: 95 },
      lastYear: { rev: 122719, gp: 663, op: -938, np: -657 },
    },
    sdbgbu2: {
      budget: { rev: 331618, gp: 11343, op: 8369, np: 5858 },
      lastYear: { rev: 38721, gp: 3070, op: 836, np: 585 },
    },
    sdbgbu3: {
      budget: { rev: 9736, gp: 848, op: -698, np: -489 },
      lastYear: { rev: 12190, gp: 327, op: -1712, np: -1198 },
    },
    sdbgbu5: {
      budget: { rev: 8456, gp: 312, op: -766, np: -536 },
      lastYear: { rev: 6599, gp: 185, op: -367, np: -257 },
    },
    sdbgbu6: {
      budget: { rev: 1254, gp: 75, op: -419, np: -293 },
      lastYear: { rev: 24241, gp: -330, op: -1258, np: -881 },
    },
    apbu1_abo: {
      budget: { rev: 116836, gp: 1530, op: -1831, np: -1281 },
      lastYear: { rev: 111553, gp: 3187, op: -732, np: -513 },
    },
    apbu1_t88: {
      budget: { rev: 33139, gp: 195, op: -698, np: -488 },
      lastYear: { rev: 8835, gp: 1006, op: -84, np: -59 },
    },
    apbu1_t99: {
      budget: { rev: 787, gp: -111, op: -841, np: -589 },
      lastYear: { rev: 0, gp: 0, op: 0, np: 0 },
    },
    apbu2_c38: {
      budget: { rev: 188168, gp: 5789, op: -1313, np: -919 },
      lastYear: { rev: 273686, gp: 6847, op: -899, np: -629 },
    },
    apbu2_t12: {
      budget: { rev: 6694, gp: 456, op: 163, np: 114 },
      lastYear: { rev: 7065, gp: 709, op: 456, np: 319 },
    },
    apbu2_t89: {
      budget: { rev: 6620, gp: 192, op: -217, np: -152 },
      lastYear: { rev: 0, gp: 0, op: -184, np: -129 },
    },
  },
  "03": {
    all: {
      budget: { rev: 2041770, gp: 95203, op: 34330, np: 24031 },
      lastYear: { rev: 2276716, gp: 97277, op: 33659, np: 23561 },
    },
    pcbg: {
      budget: { rev: 1714987, gp: 83111, op: 30641, np: 21449 },
      lastYear: { rev: 1899016, gp: 78610, op: 27474, np: 19232 },
    },
    sdbg: {
      budget: { rev: 326783, gp: 11597, op: 4472, np: 3130 },
      lastYear: { rev: 377700, gp: 12885, op: 1808, np: 1266 },
    },
    mbu: {
      budget: { rev: 1627, gp: 508, op: 39, np: 27 },
      lastYear: { rev: 244, gp: 318, op: -296, np: -207 },
    },
    central: {
      budget: { rev: 0, gp: 495, op: -783, np: -548 },
      lastYear: { rev: 0, gp: 5783, op: 4377, np: 3064 },
    },
    aebu1: {
      budget: { rev: 972822, gp: 53812, op: 26904, np: 18832 },
      lastYear: { rev: 1067849, gp: 48837, op: 24448, np: 17113 },
    },
    aebu2: {
      budget: { rev: 232736, gp: 8671, op: 3385, np: 2370 },
      lastYear: { rev: 236251, gp: 6176, op: -449, np: -314 },
    },
    aep: {
      budget: { rev: 20461, gp: 1583, op: 52, np: 37 },
      lastYear: { rev: 20500, gp: 2712, op: 1330, np: 931 },
    },
    apbu: {
      budget: { rev: 453814, gp: 15129, op: 3927, np: 2749 },
      lastYear: { rev: 548391, gp: 15942, op: 2340, np: 1638 },
    },
    isbg: {
      budget: { rev: 27677, gp: 3620, op: -3564, np: -2495 },
      lastYear: { rev: 22875, gp: 4705, op: 367, np: 257 },
    },
    pcbgceo: {
      budget: { rev: 7477, gp: 297, op: 88, np: 62 },
      lastYear: { rev: 3149, gp: 323, op: -234, np: -164 },
    },
    rd6: {
      budget: { rev: 0, gp: 0, op: -151, np: -106 },
      lastYear: { rev: 1, gp: -85, op: -327, np: -229 },
    },
    sdbgbu1: {
      budget: { rev: 90631, gp: 953, op: 68, np: 48 },
      lastYear: { rev: 111173, gp: 2141, op: 867, np: 607 },
    },
    sdbgbu2: {
      budget: { rev: 212925, gp: 8362, op: 5402, np: 3781 },
      lastYear: { rev: 205925, gp: 8150, op: 5347, np: 3743 },
    },
    sdbgbu3: {
      budget: { rev: 11241, gp: 1068, op: -380, np: -266 },
      lastYear: { rev: 15046, gp: 537, op: -4342, np: -3039 },
    },
    sdbgbu5: {
      budget: { rev: 8597, gp: 375, op: -710, np: -497 },
      lastYear: { rev: 6944, gp: 264, op: -290, np: -203 },
    },
    sdbgbu6: {
      budget: { rev: 1762, gp: 332, op: 53, np: 37 },
      lastYear: { rev: 38368, gp: 1476, op: 523, np: 366 },
    },
    apbu1_abo: {
      budget: { rev: 147250, gp: 3963, op: 356, np: 249 },
      lastYear: { rev: 184219, gp: 3809, op: 80, np: 56 },
    },
    apbu1_t88: {
      budget: { rev: 40975, gp: 1038, op: 312, np: 218 },
      lastYear: { rev: 14560, gp: 899, op: -233, np: -163 },
    },
    apbu1_t99: {
      budget: { rev: 5900, gp: 265, op: -408, np: -285 },
      lastYear: { rev: 0, gp: 0, op: -1, np: -1 },
    },
    apbu2_c38: {
      budget: { rev: 240740, gp: 8791, op: 3261, np: 2283 },
      lastYear: { rev: 345062, gp: 10878, op: 2613, np: 1829 },
    },
    apbu2_t12: {
      budget: { rev: 9844, gp: 751, op: 381, np: 267 },
      lastYear: { rev: 4551, gp: 355, op: 101, np: 71 },
    },
    apbu2_t89: {
      budget: { rev: 9105, gp: 320, op: 25, np: 18 },
      lastYear: { rev: 0, gp: 0, op: -220, np: -154 },
    },
  },
  "04": {
    all: {
      budget: { rev: 1972139, gp: 94869, op: 31128, np: 21789 },
      lastYear: { rev: 2232857, gp: 100563, op: 37902, np: 26532 },
    },
    pcbg: {
      budget: { rev: 1732717, gp: 85737, op: 29934, np: 20953 },
      lastYear: { rev: 1736818, gp: 80862, op: 29102, np: 20371 },
    },
    sdbg: {
      budget: { rev: 239422, gp: 8636, op: 2070, np: 1449 },
      lastYear: { rev: 496039, gp: 15199, op: 5705, np: 3993 },
    },
    mbu: {
      budget: { rev: 2168, gp: 579, op: 173, np: 121 },
      lastYear: { rev: 301, gp: 505, op: 7, np: 5 },
    },
    central: {
      budget: { rev: 0, gp: 495, op: -876, np: -614 },
      lastYear: { rev: 0, gp: 4502, op: 3096, np: 2167 },
    },
    aebu1: {
      budget: { rev: 1066416, gp: 62260, op: 30571, np: 21400 },
      lastYear: { rev: 1040882, gp: 54891, op: 29801, np: 20861 },
    },
    aebu2: {
      budget: { rev: 139361, gp: 4926, op: 929, np: 650 },
      lastYear: { rev: 216692, gp: 5112, op: -1444, np: -1011 },
    },
    aep: {
      budget: { rev: 17628, gp: 1147, op: 79, np: 55 },
      lastYear: { rev: 21207, gp: 2203, op: 1002, np: 701 },
    },
    apbu: {
      budget: { rev: 472707, gp: 13189, op: 1694, np: 1186 },
      lastYear: { rev: 423652, gp: 14773, op: 2990, np: 2093 },
    },
    isbg: {
      budget: { rev: 28787, gp: 3920, op: -3264, np: -2285 },
      lastYear: { rev: 31045, gp: 3661, op: -1610, np: -1127 },
    },
    pcbgceo: {
      budget: { rev: 7218, gp: 294, op: 35, np: 24 },
      lastYear: { rev: 3012, gp: 360, op: -373, np: -261 },
    },
    rd6: {
      budget: { rev: 0, gp: 0, op: -110, np: -77 },
      lastYear: { rev: 27, gp: -138, op: -364, np: -255 },
    },
    sdbgbu1: {
      budget: { rev: 99015, gp: 876, op: 15, np: 11 },
      lastYear: { rev: 175032, gp: -3353, op: 75, np: 52 },
    },
    sdbgbu2: {
      budget: { rev: 117917, gp: 6171, op: 3132, np: 2192 },
      lastYear: { rev: 263035, gp: 15287, op: 7230, np: 5061 },
    },
    sdbgbu3: {
      budget: { rev: 10672, gp: 914, op: -556, np: -389 },
      lastYear: { rev: 5517, gp: 210, op: -2087, np: -1461 },
    },
    sdbgbu5: {
      budget: { rev: 8788, gp: 452, op: -650, np: -455 },
      lastYear: { rev: 9463, gp: 397, op: -373, np: -261 },
    },
    sdbgbu6: {
      budget: { rev: 1403, gp: 73, op: -96, np: -67 },
      lastYear: { rev: 42748, gp: 2331, op: 763, np: 534 },
    },
    apbu1_abo: {
      budget: { rev: 142666, gp: 3251, op: -88, np: -62 },
      lastYear: { rev: 118536, gp: 2643, op: -497, np: -348 },
    },
    apbu1_t88: {
      budget: { rev: 35921, gp: 810, op: 126, np: 88 },
      lastYear: { rev: 23556, gp: -209, op: 498, np: 349 },
    },
    apbu1_t99: {
      budget: { rev: 29686, gp: 1109, op: 462, np: 323 },
      lastYear: { rev: 0, gp: 0, op: -162, np: -114 },
    },
    apbu2_c38: {
      budget: { rev: 245917, gp: 6803, op: 1013, np: 709 },
      lastYear: { rev: 272938, gp: 11593, op: 3200, np: 2240 },
    },
    apbu2_t12: {
      budget: { rev: 8630, gp: 763, op: 221, np: 155 },
      lastYear: { rev: 8623, gp: 746, op: 488, np: 341 },
    },
    apbu2_t89: {
      budget: { rev: 9888, gp: 453, op: -40, np: -28 },
      lastYear: { rev: 0, gp: 0, op: -538, np: -376 },
    },
  },
  "05": {
    all: {
      budget: { rev: 2010208, gp: 105259, op: 42549, np: 29785 },
      lastYear: { rev: 2229979, gp: 95728, op: 35093, np: 24565 },
    },
    pcbg: {
      budget: { rev: 1753424, gp: 86021, op: 36855, np: 25798 },
      lastYear: { rev: 1787124, gp: 77159, op: 25687, np: 17981 },
    },
    sdbg: {
      budget: { rev: 256784, gp: 10479, op: 6571, np: 4600 },
      lastYear: { rev: 442855, gp: 14067, op: 5911, np: 4138 },
    },
    mbu: {
      budget: { rev: 2059, gp: 567, op: 168, np: 118 },
      lastYear: { rev: 519, gp: 293, op: -36, np: -25 },
    },
    central: {
      budget: { rev: 0, gp: 8759, op: -1045, np: -732 },
      lastYear: { rev: 0, gp: 4502, op: 3538, np: 2477 },
    },
    aebu1: {
      budget: { rev: 1079227, gp: 54896, op: 29212, np: 20448 },
      lastYear: { rev: 1089389, gp: 48197, op: 21953, np: 15367 },
    },
    aebu2: {
      budget: { rev: 140831, gp: 5276, op: 1497, np: 1048 },
      lastYear: { rev: 170009, gp: 4918, op: -2168, np: -1518 },
    },
    aep: {
      budget: { rev: 17690, gp: 1635, op: 196, np: 137 },
      lastYear: { rev: 20196, gp: 2170, op: 777, np: 544 },
    },
    apbu: {
      budget: { rev: 441709, gp: 13012, op: 2282, np: 1597 },
      lastYear: { rev: 467851, gp: 16182, op: 3909, np: 2737 },
    },
    isbg: {
      budget: { rev: 57999, gp: 10180, op: 3267, np: 2287 },
      lastYear: { rev: 32117, gp: 5167, op: 814, np: 570 },
    },
    pcbgceo: {
      budget: { rev: 15969, gp: 1021, op: 511, np: 358 },
      lastYear: { rev: 7497, gp: 579, op: 571, np: 400 },
    },
    rd6: {
      budget: { rev: 0, gp: 0, op: -109, np: -76 },
      lastYear: { rev: 64, gp: -54, op: -167, np: -117 },
    },
    sdbgbu1: {
      budget: { rev: 96222, gp: 846, op: -14, np: -10 },
      lastYear: { rev: 164157, gp: 2074, op: 1248, np: 873 },
    },
    sdbgbu2: {
      budget: { rev: 107810, gp: 5673, op: 3094, np: 2166 },
      lastYear: { rev: 233215, gp: 10168, op: 5820, np: 4074 },
    },
    sdbgbu3: {
      budget: { rev: 17627, gp: 1654, op: 544, np: 381 },
      lastYear: { rev: 12141, gp: 597, op: -3048, np: -2134 },
    },
    sdbgbu5: {
      budget: { rev: 27315, gp: 1346, op: 521, np: 365 },
      lastYear: { rev: 19232, gp: 681, op: -206, np: -144 },
    },
    sdbgbu6: {
      budget: { rev: 5341, gp: 497, op: 2201, np: 1541 },
      lastYear: { rev: 13865, gp: 320, op: 1999, np: 1400 },
    },
    apbu1_abo: {
      budget: { rev: 127371, gp: 3118, op: -192, np: -134 },
      lastYear: { rev: 134917, gp: 4239, op: 525, np: 367 },
    },
    apbu1_t88: {
      budget: { rev: 32593, gp: 621, op: -94, np: -66 },
      lastYear: { rev: 14131, gp: 795, op: 81, np: 57 },
    },
    apbu1_t99: {
      budget: { rev: 31165, gp: 1058, op: 362, np: 253 },
      lastYear: { rev: 0, gp: 0, op: -162, np: -113 },
    },
    apbu2_c38: {
      budget: { rev: 233197, gp: 7059, op: 1805, np: 1263 },
      lastYear: { rev: 311069, gp: 10340, op: 3449, np: 2414 },
    },
    apbu2_t12: {
      budget: { rev: 7134, gp: 735, op: 329, np: 230 },
      lastYear: { rev: 7734, gp: 808, op: 554, np: 388 },
    },
    apbu2_t89: {
      budget: { rev: 10250, gp: 421, op: 73, np: 51 },
      lastYear: { rev: 0, gp: 0, op: -538, np: -376 },
    },
  },
  "06": {
    all: {
      budget: { rev: 2046110, gp: 108831, op: 35813, np: 25069 },
      lastYear: { rev: 2228133, gp: 98509, op: 34668, np: 24268 },
    },
    pcbg: {
      budget: { rev: 1816209, gp: 88838, op: 35815, np: 25071 },
      lastYear: { rev: 1893979, gp: 81939, op: 26879, np: 18815 },
    },
    sdbg: {
      budget: { rev: 229901, gp: 11233, op: 574, np: 402 },
      lastYear: { rev: 334154, gp: 11693, op: 4294, np: 3006 },
    },
    mbu: {
      budget: { rev: 1936, gp: 569, op: 91, np: 64 },
      lastYear: { rev: 570, gp: 369, op: -14, np: -10 },
    },
    central: {
      budget: { rev: 0, gp: 8759, op: -667, np: -467 },
      lastYear: { rev: 0, gp: 4502, op: 3510, np: 2457 },
    },
    aebu1: {
      budget: { rev: 1110117, gp: 54814, op: 28306, np: 19815 },
      lastYear: { rev: 1148571, gp: 50988, op: 22752, np: 15926 },
    },
    aebu2: {
      budget: { rev: 141866, gp: 5481, op: 1630, np: 1141 },
      lastYear: { rev: 181247, gp: 6193, op: 185, np: 129 },
    },
    aep: {
      budget: { rev: 17892, gp: 1625, op: 134, np: 94 },
      lastYear: { rev: 18694, gp: 1748, op: 148, np: 103 },
    },
    apbu: {
      budget: { rev: 453666, gp: 14298, op: 1970, np: 1379 },
      lastYear: { rev: 507458, gp: 17161, op: 3827, np: 2679 },
    },
    isbg: {
      budget: { rev: 76503, gp: 11682, op: 3429, np: 2400 },
      lastYear: { rev: 31102, gp: 5193, op: -74, np: -52 },
    },
    pcbgceo: {
      budget: { rev: 16166, gp: 939, op: 469, np: 329 },
      lastYear: { rev: 6848, gp: 703, op: 309, np: 216 },
    },
    rd6: {
      budget: { rev: 0, gp: 0, op: -122, np: -85 },
      lastYear: { rev: 60, gp: -47, op: -267, np: -187 },
    },
    sdbgbu1: {
      budget: { rev: 101847, gp: 894, op: 6, np: 4 },
      lastYear: { rev: 143597, gp: 1854, op: 1116, np: 781 },
    },
    sdbgbu2: {
      budget: { rev: 79605, gp: 5045, op: 2345, np: 1642 },
      lastYear: { rev: 155011, gp: 7588, op: 4174, np: 2922 },
    },
    sdbgbu3: {
      budget: { rev: 15741, gp: 1632, op: 407, np: 285 },
      lastYear: { rev: 10227, gp: 638, op: -2509, np: -1756 },
    },
    sdbgbu5: {
      budget: { rev: 22168, gp: 1574, op: -327, np: -229 },
      lastYear: { rev: 12851, gp: 519, op: -225, np: -158 },
    },
    sdbgbu6: {
      budget: { rev: 8010, gp: 1590, op: -1981, np: -1387 },
      lastYear: { rev: 12222, gp: 867, op: 1640, np: 1148 },
    },
    apbu1_abo: {
      budget: { rev: 131810, gp: 3429, op: -160, np: -112 },
      lastYear: { rev: 153028, gp: 4795, op: 735, np: 515 },
    },
    apbu1_t88: {
      budget: { rev: 32593, gp: 673, op: -113, np: -79 },
      lastYear: { rev: 15538, gp: 996, op: 220, np: 154 },
    },
    apbu1_t99: {
      budget: { rev: 35029, gp: 1263, op: 556, np: 389 },
      lastYear: { rev: 0, gp: 0, op: -208, np: -145 },
    },
    apbu2_c38: {
      budget: { rev: 237121, gp: 7674, op: 1285, np: 899 },
      lastYear: { rev: 330716, gp: 10549, op: 3027, np: 2119 },
    },
    apbu2_t12: {
      budget: { rev: 6697, gp: 724, op: 355, np: 248 },
      lastYear: { rev: 8176, gp: 821, op: 593, np: 415 },
    },
    apbu2_t89: {
      budget: { rev: 10416, gp: 535, op: 46, np: 32 },
      lastYear: { rev: 0, gp: 0, op: -540, np: -378 },
    },
  },
  "07": {
    all: {
      budget: { rev: 1863225, gp: 105772, op: 33969, np: 23778 },
      lastYear: { rev: 2115429, gp: 96571, op: 32755, np: 22929 },
    },
    pcbg: {
      budget: { rev: 1632042, gp: 86057, op: 33971, np: 23779 },
      lastYear: { rev: 1813124, gp: 80878, op: 26389, np: 18472 },
    },
    sdbg: {
      budget: { rev: 231183, gp: 10956, op: 575, np: 402 },
      lastYear: { rev: 302305, gp: 10816, op: 2871, np: 2010 },
    },
    mbu: {
      budget: { rev: 2056, gp: 585, op: 129, np: 90 },
      lastYear: { rev: 756, gp: 374, op: -15, np: -10 },
    },
    central: {
      budget: { rev: 0, gp: 8759, op: -707, np: -495 },
      lastYear: { rev: 0, gp: 4502, op: 3510, np: 2457 },
    },
    aebu1: {
      budget: { rev: 973093, gp: 50930, op: 23961, np: 16773 },
      lastYear: { rev: 1047605, gp: 45844, op: 16966, np: 11876 },
    },
    aebu2: {
      budget: { rev: 130653, gp: 5309, op: 1494, np: 1045 },
      lastYear: { rev: 194393, gp: 7013, op: 1448, np: 1014 },
    },
    aep: {
      budget: { rev: 18019, gp: 1631, op: 133, np: 93 },
      lastYear: { rev: 19167, gp: 1892, op: 260, np: 182 },
    },
    apbu: {
      budget: { rev: 411823, gp: 13587, op: 2141, np: 1498 },
      lastYear: { rev: 520614, gp: 19870, op: 6698, np: 4688 },
    },
    isbg: {
      budget: { rev: 82598, gp: 13540, op: 5869, np: 4108 },
      lastYear: { rev: 24127, gp: 5643, op: 791, np: 554 },
    },
    pcbgceo: {
      budget: { rev: 15856, gp: 1060, op: 494, np: 346 },
      lastYear: { rev: 7158, gp: 662, op: 494, np: 346 },
    },
    rd6: {
      budget: { rev: 0, gp: 0, op: -121, np: -85 },
      lastYear: { rev: 60, gp: -47, op: -267, np: -187 },
    },
    sdbgbu1: {
      budget: { rev: 113447, gp: 1189, op: 138, np: 97 },
      lastYear: { rev: 134553, gp: 1686, op: 754, np: 528 },
    },
    sdbgbu2: {
      budget: { rev: 72327, gp: 4610, op: 1830, np: 1281 },
      lastYear: { rev: 136628, gp: 7057, op: 3480, np: 2436 },
    },
    sdbgbu3: {
      budget: { rev: 15426, gp: 1634, op: 359, np: 252 },
      lastYear: { rev: 9044, gp: 698, op: -2278, np: -1594 },
    },
    sdbgbu5: {
      budget: { rev: 20073, gp: 1567, op: -170, np: -119 },
      lastYear: { rev: 9847, gp: 482, op: -222, np: -155 },
    },
    sdbgbu6: {
      budget: { rev: 7441, gp: 1458, op: -1708, np: -1196 },
      lastYear: { rev: 11987, gp: 667, op: 1039, np: 727 },
    },
    apbu1_abo: {
      budget: { rev: 124785, gp: 3398, op: -98, np: -68 },
      lastYear: { rev: 155099, gp: 5405, op: 1339, np: 937 },
    },
    apbu1_t88: {
      budget: { rev: 33139, gp: 665, op: -99, np: -69 },
      lastYear: { rev: 15538, gp: 996, op: 220, np: 154 },
    },
    apbu1_t99: {
      budget: { rev: 27963, gp: 906, op: 162, np: 114 },
      lastYear: { rev: 0, gp: 0, op: -208, np: -145 },
    },
    apbu2_c38: {
      budget: { rev: 209547, gp: 7309, op: 1662, np: 1163 },
      lastYear: { rev: 342259, gp: 12662, op: 5329, np: 3730 },
    },
    apbu2_t12: {
      budget: { rev: 6697, gp: 745, op: 407, np: 285 },
      lastYear: { rev: 7717, gp: 807, op: 557, np: 390 },
    },
    apbu2_t89: {
      budget: { rev: 9692, gp: 565, op: 108, np: 75 },
      lastYear: { rev: 0, gp: 0, op: -540, np: -378 },
    },
  },
  "08": {
    all: {
      budget: { rev: 1902549, gp: 112049, op: 33343, np: 23340 },
      lastYear: { rev: 2267024, gp: 100696, op: 36308, np: 25416 },
    },
    pcbg: {
      budget: { rev: 1721758, gp: 92272, op: 33345, np: 23341 },
      lastYear: { rev: 1970227, gp: 85826, op: 29552, np: 20686 },
    },
    sdbg: {
      budget: { rev: 180791, gp: 10946, op: 575, np: 402 },
      lastYear: { rev: 296796, gp: 10347, op: 3261, np: 2283 },
    },
    mbu: {
      budget: { rev: 2132, gp: 629, op: 174, np: 122 },
      lastYear: { rev: 850, gp: 373, op: -15, np: -10 },
    },
    central: {
      budget: { rev: 0, gp: 8759, op: -751, np: -525 },
      lastYear: { rev: 0, gp: 4150, op: 3510, np: 2457 },
    },
    aebu1: {
      budget: { rev: 1074679, gp: 58162, op: 27149, np: 19005 },
      lastYear: { rev: 1175195, gp: 54119, op: 24070, np: 16849 },
    },
    aebu2: {
      budget: { rev: 123800, gp: 5109, op: 1441, np: 1009 },
      lastYear: { rev: 200116, gp: 6824, op: 1376, np: 963 },
    },
    aep: {
      budget: { rev: 18145, gp: 1637, op: 134, np: 94 },
      lastYear: { rev: 18879, gp: 1917, op: 292, np: 204 },
    },
    apbu: {
      budget: { rev: 409697, gp: 14633, op: 1882, np: 1318 },
      lastYear: { rev: 542538, gp: 17111, op: 4151, np: 2906 },
    },
    isbg: {
      budget: { rev: 79572, gp: 11681, op: 2369, np: 1658 },
      lastYear: { rev: 25817, gp: 5148, op: -81, np: -57 },
    },
    pcbgceo: {
      budget: { rev: 15864, gp: 1050, op: 493, np: 345 },
      lastYear: { rev: 7623, gp: 755, op: 410, np: 287 },
    },
    rd6: {
      budget: { rev: 0, gp: 0, op: -122, np: -85 },
      lastYear: { rev: 60, gp: -47, op: -267, np: -187 },
    },
    sdbgbu1: {
      budget: { rev: 95984, gp: 1020, op: -2, np: -1 },
      lastYear: { rev: 132879, gp: 1518, op: 521, np: 365 },
    },
    sdbgbu2: {
      budget: { rev: 36411, gp: 4359, op: 1896, np: 1327 },
      lastYear: { rev: 132287, gp: 6749, op: 3437, np: 2406 },
    },
    sdbgbu3: {
      budget: { rev: 18055, gp: 1949, op: 679, np: 475 },
      lastYear: { rev: 9185, gp: 668, op: -1876, np: -1313 },
    },
    sdbgbu5: {
      budget: { rev: 20360, gp: 1648, op: -157, np: -110 },
      lastYear: { rev: 10200, gp: 489, op: -181, np: -127 },
    },
    sdbgbu6: {
      budget: { rev: 7511, gp: 1471, op: -1966, np: -1377 },
      lastYear: { rev: 11999, gp: 695, op: 1260, np: 882 },
    },
    apbu1_abo: {
      budget: { rev: 119161, gp: 3507, op: -10, np: -7 },
      lastYear: { rev: 158139, gp: 4161, op: 406, np: 284 },
    },
    apbu1_t88: {
      budget: { rev: 33139, gp: 694, op: -87, np: -61 },
      lastYear: { rev: 15538, gp: 996, op: 220, np: 154 },
    },
    apbu1_t99: {
      budget: { rev: 28518, gp: 979, op: 316, np: 221 },
      lastYear: { rev: 0, gp: 0, op: -206, np: -144 },
    },
    apbu2_c38: {
      budget: { rev: 211569, gp: 8050, op: 1223, np: 856 },
      lastYear: { rev: 361104, gp: 11104, op: 3666, np: 2566 },
    },
    apbu2_t12: {
      budget: { rev: 6697, gp: 724, op: 345, np: 241 },
      lastYear: { rev: 7757, gp: 849, op: 604, np: 423 },
    },
    apbu2_t89: {
      budget: { rev: 10612, gp: 679, op: 96, np: 67 },
      lastYear: { rev: 0, gp: 0, op: -540, np: -378 },
    },
  },
  "09": {
    all: {
      budget: { rev: 2092361, gp: 117044, op: 43591, np: 30513 },
      lastYear: { rev: 2538093, gp: 113403, op: 42980, np: 30086 },
    },
    pcbg: {
      budget: { rev: 1803696, gp: 95518, op: 43593, np: 30515 },
      lastYear: { rev: 2206086, gp: 98971, op: 36817, np: 25772 },
    },
    sdbg: {
      budget: { rev: 288665, gp: 12766, op: 574, np: 402 },
      lastYear: { rev: 332007, gp: 9708, op: 2669, np: 1868 },
    },
    mbu: {
      budget: { rev: 2238, gp: 692, op: 234, np: 164 },
      lastYear: { rev: 997, gp: 473, op: -23, np: -16 },
    },
    central: {
      budget: { rev: 0, gp: 8759, op: -810, np: -567 },
      lastYear: { rev: 0, gp: 4251, op: 3517, np: 2462 },
    },
    aebu1: {
      budget: { rev: 1098158, gp: 55926, op: 27453, np: 19217 },
      lastYear: { rev: 1276037, gp: 63285, op: 29888, np: 20921 },
    },
    aebu2: {
      budget: { rev: 117878, gp: 5100, op: 1522, np: 1065 },
      lastYear: { rev: 227108, gp: 7108, op: 1894, np: 1326 },
    },
    aep: {
      budget: { rev: 18271, gp: 1663, op: 150, np: 105 },
      lastYear: { rev: 19012, gp: 1868, op: 232, np: 162 },
    },
    apbu: {
      budget: { rev: 465152, gp: 18218, op: 6728, np: 4710 },
      lastYear: { rev: 650315, gp: 20508, op: 4904, np: 3433 },
    },
    isbg: {
      budget: { rev: 88137, gp: 13520, op: 7377, np: 5164 },
      lastYear: { rev: 25928, gp: 5879, op: 166, np: 117 },
    },
    pcbgceo: {
      budget: { rev: 16100, gp: 1092, op: 485, np: 340 },
      lastYear: { rev: 7626, gp: 367, op: 0, np: 0 },
    },
    rd6: {
      budget: { rev: 0, gp: 0, op: -121, np: -85 },
      lastYear: { rev: 60, gp: -47, op: -267, np: -187 },
    },
    sdbgbu1: {
      budget: { rev: 171809, gp: 1264, op: 148, np: 103 },
      lastYear: { rev: 191988, gp: 2155, op: 1220, np: 854 },
    },
    sdbgbu2: {
      budget: { rev: 60963, gp: 5212, op: 2595, np: 1817 },
      lastYear: { rev: 112507, gp: 4339, op: 1744, np: 1221 },
    },
    sdbgbu3: {
      budget: { rev: 26529, gp: 2836, op: 1382, np: 968 },
      lastYear: { rev: 7637, gp: 966, op: -1229, np: -860 },
    },
    sdbgbu5: {
      budget: { rev: 25391, gp: 1371, op: 162, np: 113 },
      lastYear: { rev: 8935, gp: 216, op: -430, np: -301 },
    },
    sdbgbu6: {
      budget: { rev: 1793, gp: 519, op: 398, np: 279 },
      lastYear: { rev: 2946, gp: 61, op: -680, np: -476 },
    },
    apbu1_abo: {
      budget: { rev: 183330, gp: 7053, op: 3515, np: 2461 },
      lastYear: { rev: 146066, gp: 4531, op: 497, np: 348 },
    },
    apbu1_t88: {
      budget: { rev: 41433, gp: 730, op: 27, np: 19 },
      lastYear: { rev: 15208, gp: 1099, op: 126, np: 88 },
    },
    apbu1_t99: {
      budget: { rev: 35452, gp: 999, op: 391, np: 274 },
      lastYear: { rev: 0, gp: 0, op: -506, np: -354 },
    },
    apbu2_c38: {
      budget: { rev: 229031, gp: 8812, op: 2382, np: 1667 },
      lastYear: { rev: 496548, gp: 15424, op: 7056, np: 4939 },
    },
    apbu2_t12: {
      budget: { rev: 5316, gp: 600, op: 373, np: 261 },
      lastYear: { rev: 5635, gp: 360, op: 216, np: 151 },
    },
    apbu2_t89: {
      budget: { rev: 12317, gp: 652, op: 515, np: 360 },
      lastYear: { rev: 10337, gp: 812, op: 432, np: 302 },
    },
  },
  "10": {
    all: {
      budget: { rev: 1974460, gp: 110256, op: 31606, np: 22124 },
      lastYear: { rev: 2490531, gp: 109401, op: 41940, np: 29358 },
    },
    pcbg: {
      budget: { rev: 1687490, gp: 90449, op: 37482, np: 26237 },
      lastYear: { rev: 2161519, gp: 98588, op: 40860, np: 28602 },
    },
    sdbg: {
      budget: { rev: 286969, gp: 11048, op: 4600, np: 3220 },
      lastYear: { rev: 329012, gp: 5936, op: -2391, np: -1674 },
    },
    mbu: {
      budget: { rev: 2482, gp: 760, op: 332, np: 232 },
      lastYear: { rev: 1246, gp: 327, op: -120, np: -84 },
    },
    central: {
      budget: { rev: 0, gp: 8759, op: -10476, np: -7333 },
      lastYear: { rev: 0, gp: 4877, op: 3471, np: 2429 },
    },
    aebu1: {
      budget: { rev: 1027987, gp: 58743, op: 28154, np: 19708 },
      lastYear: { rev: 1172469, gp: 60052, op: 29512, np: 20659 },
    },
    aebu2: {
      budget: { rev: 114926, gp: 5859, op: 2979, np: 2085 },
      lastYear: { rev: 235541, gp: 7487, op: 2725, np: 1907 },
    },
    aep: {
      budget: { rev: 16230, gp: 2240, op: 899, np: 630 },
      lastYear: { rev: 15508, gp: 1401, op: -32, np: -22 },
    },
    apbu: {
      budget: { rev: 464124, gp: 14737, op: 3126, np: 2188 },
      lastYear: { rev: 705227, gp: 24164, op: 8730, np: 6111 },
    },
    isbg: {
      budget: { rev: 48268, gp: 7816, op: 1615, np: 1130 },
      lastYear: { rev: 23005, gp: 4089, op: -702, np: -492 },
    },
    pcbgceo: {
      budget: { rev: 15957, gp: 1054, op: 833, np: 583 },
      lastYear: { rev: 9401, gp: 1374, op: 848, np: 594 },
    },
    rd6: {
      budget: { rev: 0, gp: 0, op: -124, np: -87 },
      lastYear: { rev: 368, gp: 22, op: -221, np: -155 },
    },
    sdbgbu1: {
      budget: { rev: 161000, gp: 1088, op: -32, np: -22 },
      lastYear: { rev: 197003, gp: 976, op: -526, np: -368 },
    },
    sdbgbu2: {
      budget: { rev: 70867, gp: 4277, op: 2103, np: 1472 },
      lastYear: { rev: 110835, gp: 4364, op: 1772, np: 1241 },
    },
    sdbgbu3: {
      budget: { rev: 26594, gp: 2835, op: 1406, np: 984 },
      lastYear: { rev: 7854, gp: 858, op: -1483, np: -1038 },
    },
    sdbgbu5: {
      budget: { rev: 24473, gp: 1607, op: 447, np: 313 },
      lastYear: { rev: 10507, gp: -123, op: -706, np: -495 },
    },
    sdbgbu6: {
      budget: { rev: 1553, gp: 481, op: 343, np: 240 },
      lastYear: { rev: 1567, gp: -466, op: -1328, np: -930 },
    },
    apbu1_abo: {
      budget: { rev: 146948, gp: 3573, op: 56, np: 39 },
      lastYear: { rev: 119343, gp: 4318, op: 241, np: 169 },
    },
    apbu1_t88: {
      budget: { rev: 41433, gp: 793, op: 27, np: 19 },
      lastYear: { rev: 12232, gp: 777, op: -484, np: -339 },
    },
    apbu1_t99: {
      budget: { rev: 28518, gp: 1140, op: 566, np: 396 },
      lastYear: { rev: 0, gp: 0, op: -495, np: -346 },
    },
    apbu2_c38: {
      budget: { rev: 228411, gp: 7812, op: 1915, np: 1340 },
      lastYear: { rev: 556473, gp: 17833, op: 8767, np: 6137 },
    },
    apbu2_t12: {
      budget: { rev: 6497, gp: 746, op: 21, np: 15 },
      lastYear: { rev: 6230, gp: 373, op: 232, np: 162 },
    },
    apbu2_t89: {
      budget: { rev: 12317, gp: 674, op: 541, np: 378 },
      lastYear: { rev: 10949, gp: 862, op: 469, np: 328 },
    },
  },
  "11": {
    all: {
      budget: { rev: 1940565, gp: 111899, op: 35342, np: 24740 },
      lastYear: { rev: 2315686, gp: 102739, op: 31422, np: 21995 },
    },
    pcbg: {
      budget: { rev: 1647679, gp: 91558, op: 40633, np: 28443 },
      lastYear: { rev: 2018697, gp: 90349, op: 29162, np: 20414 },
    },
    sdbg: {
      budget: { rev: 292886, gp: 11582, op: 5185, np: 3630 },
      lastYear: { rev: 296989, gp: 7513, op: -1211, np: -848 },
    },
    mbu: {
      budget: { rev: 2406, gp: 699, op: 234, np: 164 },
      lastYear: { rev: 1293, gp: 400, op: -29, np: -20 },
    },
    central: {
      budget: { rev: 0, gp: 8759, op: -10476, np: -7333 },
      lastYear: { rev: 0, gp: 4877, op: 3471, np: 2429 },
    },
    aebu1: {
      budget: { rev: 1004588, gp: 58331, op: 28382, np: 19867 },
      lastYear: { rev: 1148102, gp: 54512, op: 23065, np: 16146 },
    },
    aebu2: {
      budget: { rev: 86519, gp: 4016, op: 2215, np: 1550 },
      lastYear: { rev: 191586, gp: 7209, op: 3090, np: 2163 },
    },
    aep: {
      budget: { rev: 16868, gp: 2171, op: 834, np: 584 },
      lastYear: { rev: 16897, gp: 919, op: -636, np: -446 },
    },
    apbu: {
      budget: { rev: 449847, gp: 14516, op: 2924, np: 2047 },
      lastYear: { rev: 632152, gp: 21732, op: 6772, np: 4740 },
    },
    isbg: {
      budget: { rev: 80559, gp: 12113, op: 6166, np: 4316 },
      lastYear: { rev: 22781, gp: 4848, op: -3309, np: -2316 },
    },
    pcbgceo: {
      budget: { rev: 9297, gp: 411, op: 234, np: 164 },
      lastYear: { rev: 7142, gp: 1176, op: 462, np: 324 },
    },
    rd6: {
      budget: { rev: 0, gp: 0, op: -123, np: -86 },
      lastYear: { rev: 36, gp: -46, op: -281, np: -197 },
    },
    sdbgbu1: {
      budget: { rev: 160963, gp: 1081, op: -52, np: -36 },
      lastYear: { rev: 161786, gp: 1136, op: -589, np: -412 },
    },
    sdbgbu2: {
      budget: { rev: 72712, gp: 4493, op: 2386, np: 1670 },
      lastYear: { rev: 117321, gp: 5219, op: 2457, np: 1720 },
    },
    sdbgbu3: {
      budget: { rev: 23788, gp: 2576, op: 1179, np: 825 },
      lastYear: { rev: 7308, gp: 1177, op: -1519, np: -1063 },
    },
    sdbgbu5: {
      budget: { rev: 21676, gp: 1970, op: 814, np: 570 },
      lastYear: { rev: 7976, gp: 24, op: -508, np: -356 },
    },
    sdbgbu6: {
      budget: { rev: 11341, gp: 763, op: 624, np: 437 },
      lastYear: { rev: 1306, gp: -443, op: -1023, np: -716 },
    },
    apbu1_abo: {
      budget: { rev: 148615, gp: 3763, op: 230, np: 161 },
      lastYear: { rev: 102313, gp: 1921, op: -1574, np: -1102 },
    },
    apbu1_t88: {
      budget: { rev: 41433, gp: 786, op: 22, np: 15 },
      lastYear: { rev: 12966, gp: 744, op: -96, np: -67 },
    },
    apbu1_t99: {
      budget: { rev: 16914, gp: 735, op: 24, np: 16 },
      lastYear: { rev: 0, gp: 0, op: -527, np: -369 },
    },
    apbu2_c38: {
      budget: { rev: 224662, gp: 7723, op: 1502, np: 1051 },
      lastYear: { rev: 502364, gp: 18000, op: 8570, np: 5999 },
    },
    apbu2_t12: {
      budget: { rev: 5906, gp: 683, op: 458, np: 321 },
      lastYear: { rev: 6813, gp: 611, op: 491, np: 343 },
    },
    apbu2_t89: {
      budget: { rev: 12317, gp: 825, op: 689, np: 483 },
      lastYear: { rev: 7697, gp: 455, op: -92, np: -65 },
    },
  },
  "12": {
    all: {
      budget: { rev: 2068579, gp: 123784, op: 46464, np: 32525 },
      lastYear: { rev: 1821845, gp: 80810, op: 4088, np: 2861 },
    },
    pcbg: {
      budget: { rev: 1780061, gp: 103740, op: 51907, np: 36335 },
      lastYear: { rev: 1575747, gp: 68218, op: 5262, np: 3683 },
    },
    sdbg: {
      budget: { rev: 288518, gp: 11284, op: 5033, np: 3523 },
      lastYear: { rev: 246097, gp: 7715, op: -4645, np: -3251 },
    },
    mbu: {
      budget: { rev: 2469, gp: 805, op: 400, np: 280 },
      lastYear: { rev: 878, gp: -835, op: -1212, np: -848 },
    },
    central: {
      budget: { rev: 0, gp: 8759, op: -10476, np: -7333 },
      lastYear: { rev: 0, gp: 4877, op: 3471, np: 2429 },
    },
    aebu1: {
      budget: { rev: 1083329, gp: 63109, op: 32450, np: 22715 },
      lastYear: { rev: 931738, gp: 43176, op: 13417, np: 9392 },
    },
    aebu2: {
      budget: { rev: 101561, gp: 5293, op: 2307, np: 1615 },
      lastYear: { rev: 168343, gp: 6846, op: 541, np: 379 },
    },
    aep: {
      budget: { rev: 16117, gp: 2126, op: 680, np: 476 },
      lastYear: { rev: 11742, gp: -453, op: -2392, np: -1675 },
    },
    apbu: {
      budget: { rev: 469713, gp: 18611, op: 8782, np: 6147 },
      lastYear: { rev: 433847, gp: 11854, op: -5997, np: -4198 },
    },
    isbg: {
      budget: { rev: 95617, gp: 13749, op: 7185, np: 5029 },
      lastYear: { rev: 22669, gp: 3009, op: -3327, np: -2329 },
    },
    pcbgceo: {
      budget: { rev: 13724, gp: 852, op: 616, np: 431 },
      lastYear: { rev: 7118, gp: 3769, op: 3216, np: 2251 },
    },
    rd6: {
      budget: { rev: 0, gp: 0, op: -113, np: -79 },
      lastYear: { rev: 290, gp: 17, op: -196, np: -137 },
    },
    sdbgbu1: {
      budget: { rev: 174650, gp: 1239, op: 148, np: 104 },
      lastYear: { rev: 119765, gp: 4039, op: 2596, np: 1817 },
    },
    sdbgbu2: {
      budget: { rev: 54156, gp: 3559, op: 1445, np: 1011 },
      lastYear: { rev: 106426, gp: 4577, op: 1934, np: 1354 },
    },
    sdbgbu3: {
      budget: { rev: 25493, gp: 2606, op: 1225, np: 857 },
      lastYear: { rev: 9324, gp: 644, op: -6124, np: -4287 },
    },
    sdbgbu5: {
      budget: { rev: 20476, gp: 2235, op: 1106, np: 774 },
      lastYear: { rev: 6099, gp: 78, op: -379, np: -266 },
    },
    sdbgbu6: {
      budget: { rev: 11273, gp: 841, op: 709, np: 496 },
      lastYear: { rev: 3606, gp: -787, op: -1459, np: -1021 },
    },
    apbu1_abo: {
      budget: { rev: 173798, gp: 7639, op: 4246, np: 2972 },
      lastYear: { rev: 131532, gp: 903, op: -3764, np: -2635 },
    },
    apbu1_t88: {
      budget: { rev: 41433, gp: 839, op: 41, np: 29 },
      lastYear: { rev: 12982, gp: 787, op: -420, np: -294 },
    },
    apbu1_t99: {
      budget: { rev: 2557, gp: 10, op: -653, np: -457 },
      lastYear: { rev: 1, gp: 590, op: -2, np: -2 },
    },
    apbu2_c38: {
      budget: { rev: 234711, gp: 8856, op: 4204, np: 2943 },
      lastYear: { rev: 276435, gp: 8926, op: -1637, np: -1146 },
    },
    apbu2_t12: {
      budget: { rev: 5316, gp: 617, op: 433, np: 303 },
      lastYear: { rev: 7152, gp: 432, op: 282, np: 197 },
    },
    apbu2_t89: {
      budget: { rev: 11899, gp: 651, op: 511, np: 357 },
      lastYear: { rev: 5745, gp: 215, op: -455, np: -319 },
    },
  },
};

/**
 * Compal Budget Data based on Excel (values in thousands USD, YTM 2025)
 *
 * Data Sources:
 * - Budget: "Ambitious Target-2025 new" sheet (monthly columns)
 * - Last Year: "Historical-2024" sheet (monthly columns)
 *
 * Hierarchy: BG -> BU -> Sub-BU -> Sub-sub-BU
 *
 * PCBG:
 *   - AEBU1: AEBU1-NB, AEBU1-Docking, AEBU1-Others, AEBU1-Unreconciled
 *   - AEBU2
 *   - APBU:
 *     - APBU1: APBU1-ABO, APBU1-T88, APBU1-T99
 *     - APBU2: APBU2-C38, APBU2-T12, APBU2-T89
 *   - ISBG
 *   - AEP
 *   - RD6
 *   - PCBGCEO
 * SDBG:
 *   - SDBGBU1, SDBGBU2, SDBGBU3, SDBGBU5, SDBGBU6
 * MBU
 * Central (Shared Expense)
 */
export const mockBudgetData: BiweeklyDashboardData = {
  summary: {
    revenue: {
      label: "Revenue",
      actual: 7403516, // Company Total from Data_PnL
      budget: 11501967, // PCBG + SDBG + MBU + Central (9814261+1676698+11008+0)
      lastYear: 7988668,
    },
    gp: {
      label: "GP",
      actual: 257945,
      budget: 538471, // PCBG + SDBG + MBU + Central (470366+56516+3111+8478)
      lastYear: 238612,
    },
    op: {
      label: "OP",
      actual: 81808,
      budget: 162859, // PCBG + SDBG + MBU + Central (145239+15018+461+2141)
      lastYear: 92335,
    },
    np: {
      label: "NP",
      actual: 57266,
      budget: 114001, // OP budget * 0.7
      lastYear: 64635,
    },
  },
  groups: [
    // === PCBG (PC Business Group) ===
    {
      id: "pcbg",
      name: "PCBG",
      revenue: {
        label: "Revenue",
        actual: 6093232,
        budget: 9814261, // From Ambitious Target-2025 new (TM_PCBG)
        lastYear: 6511952,
      },
      grossProfit: {
        label: "GP",
        actual: 227825,
        budget: 470366, // From Ambitious Target-2025 new
        lastYear: 217626,
      },
      operatingProfit: {
        label: "OP",
        actual: 70131,
        budget: 145239, // From Ambitious Target-2025 new
        lastYear: 73445,
      },
      netProfit: {
        label: "NP",
        actual: 49092,
        budget: 101667, // OP budget * 0.7
        lastYear: 51412,
      },
      sbus: [
        // AEBU1
        {
          id: "aebu1",
          name: "AEBU1",
          revenue: {
            label: "Revenue",
            actual: 3909746,
            budget: 5831461, // From Ambitious Target-2025 new
            lastYear: 3713498,
          },
          grossProfit: {
            label: "GP",
            actual: 147477,
            budget: 324178, // From Ambitious Target-2025 new
            lastYear: 136126,
          },
          operatingProfit: {
            label: "OP",
            actual: 82098,
            budget: 150089, // From Ambitious Target-2025 new
            lastYear: 81503,
          },
          netProfit: {
            label: "NP",
            actual: 57469,
            budget: 105063, // OP budget * 0.7
            lastYear: 57052,
          },
        },
        // AEBU2
        {
          id: "aebu2",
          name: "AEBU2",
          revenue: {
            label: "Revenue",
            actual: 639984,
            budget: 959183, // From Ambitious Target-2025 new
            lastYear: 723302,
          },
          grossProfit: {
            label: "GP",
            actual: 20251,
            budget: 35567, // From Ambitious Target-2025 new
            lastYear: 11215,
          },
          operatingProfit: {
            label: "OP",
            actual: 2221,
            budget: 6839, // From Ambitious Target-2025 new
            lastYear: -9011,
          },
          netProfit: {
            label: "NP",
            actual: 1555,
            budget: 4787, // OP budget * 0.7
            lastYear: -6308,
          },
        },
        // APBU (aggregate of APBU1 + APBU2)
        {
          id: "apbu",
          name: "APBU",
          revenue: {
            label: "Revenue",
            actual: 1322149,
            budget: 2678996, // From Ambitious Target-2025 new (TM_APBU)
            lastYear: 1867141,
          },
          grossProfit: {
            label: "GP",
            actual: 35835,
            budget: 75448, // From Ambitious Target-2025 new (TM_APBU)
            lastYear: 49673,
          },
          operatingProfit: {
            label: "OP",
            actual: -9092,
            budget: 4077, // From Ambitious Target-2025 new
            lastYear: 2749,
          },
          netProfit: {
            label: "NP",
            actual: -6364,
            budget: 2854, // OP budget * 0.7
            lastYear: 1924,
          },
          sbus: [
            // APBU1-ABO
            {
              id: "apbu1-abo",
              name: "APBU1-ABO",
              revenue: {
                label: "Revenue",
                actual: 242491,
                budget: 764559, // From Ambitious Target-2025 new
                lastYear: 553798,
              },
              grossProfit: {
                label: "GP",
                actual: 4210,
                budget: 16603, // From Ambitious Target-2025 new
                lastYear: 9249,
              },
              operatingProfit: {
                label: "OP",
                actual: -5818,
                budget: -3366, // From Ambitious Target-2025 new
                lastYear: -1844,
              },
              netProfit: {
                label: "NP",
                actual: -4073,
                budget: -2356, // OP budget * 0.7
                lastYear: -1291,
              },
            },
            // APBU1-T88
            {
              id: "apbu1-t88",
              name: "APBU1-T88",
              revenue: {
                label: "Revenue",
                actual: 89745,
                budget: 217649, // From Ambitious Target-2025 new
                lastYear: 62337,
              },
              grossProfit: {
                label: "GP",
                actual: 298,
                budget: 4008, // From Ambitious Target-2025 new
                lastYear: 2443,
              },
              operatingProfit: {
                label: "OP",
                actual: -1458,
                budget: -923, // From Ambitious Target-2025 new
                lastYear: -80,
              },
              netProfit: {
                label: "NP",
                actual: -1021,
                budget: -646, // OP budget * 0.7
                lastYear: -56,
              },
            },
            // APBU1-T99
            {
              id: "apbu1-t99",
              name: "APBU1-T99",
              revenue: {
                label: "Revenue",
                actual: 10737,
                budget: 143041, // From Ambitious Target-2025 new
                lastYear: 0,
              },
              grossProfit: {
                label: "GP",
                actual: 338,
                budget: 3516, // From Ambitious Target-2025 new
                lastYear: 0,
              },
              operatingProfit: {
                label: "OP",
                actual: -2449,
                budget: -836, // From Ambitious Target-2025 new
                lastYear: -163,
              },
              netProfit: {
                label: "NP",
                actual: -1714,
                budget: -585, // OP budget * 0.7
                lastYear: -114,
              },
            },
            // APBU2-C38
            {
              id: "apbu2-c38",
              name: "APBU2-C38",
              revenue: {
                label: "Revenue",
                actual: 916629,
                budget: 1447228, // From Ambitious Target-2025 new
                lastYear: 1223763,
              },
              grossProfit: {
                label: "GP",
                actual: 27558,
                budget: 45315, // From Ambitious Target-2025 new
                lastYear: 35778,
              },
              operatingProfit: {
                label: "OP",
                actual: -846,
                budget: 7651, // From Ambitious Target-2025 new
                lastYear: 4601,
              },
              netProfit: {
                label: "NP",
                actual: -592,
                budget: 5356, // OP budget * 0.7
                lastYear: 3221,
              },
            },
            // APBU2-T12
            {
              id: "apbu2-t12",
              name: "APBU2-T12",
              revenue: {
                label: "Revenue",
                actual: 24892,
                budget: 48786, // From Ambitious Target-2025 new
                lastYear: 27242,
              },
              grossProfit: {
                label: "GP",
                actual: 1906,
                budget: 3598, // From Ambitious Target-2025 new
                lastYear: 2206,
              },
              operatingProfit: {
                label: "OP",
                actual: 1390,
                budget: 1089, // From Ambitious Target-2025 new
                lastYear: 1198,
              },
              netProfit: {
                label: "NP",
                actual: 973,
                budget: 762, // OP budget * 0.7
                lastYear: 838,
              },
            },
            // APBU2-T89
            {
              id: "apbu2-t89",
              name: "APBU2-T89",
              revenue: {
                label: "Revenue",
                actual: 37656,
                budget: 57733, // From Ambitious Target-2025 new
                lastYear: 0,
              },
              grossProfit: {
                label: "GP",
                actual: 1525,
                budget: 2407, // From Ambitious Target-2025 new
                lastYear: -3,
              },
              operatingProfit: {
                label: "OP",
                actual: 90,
                budget: 461, // From Ambitious Target-2025 new
                lastYear: -963,
              },
              netProfit: {
                label: "NP",
                actual: 63,
                budget: 323, // OP budget * 0.7
                lastYear: -674,
              },
            },
          ],
        },
        // ISBG
        {
          id: "isbg",
          name: "ISBG",
          revenue: {
            label: "Revenue",
            actual: 106288,
            budget: 187926, // From Ambitious Target-2025 new
            lastYear: 109574,
          },
          grossProfit: {
            label: "GP",
            actual: 15877,
            budget: 25975, // From Ambitious Target-2025 new
            lastYear: 11070,
          },
          operatingProfit: {
            label: "OP",
            actual: -2082,
            budget: -12644, // From Ambitious Target-2025 new
            lastYear: -2797,
          },
          netProfit: {
            label: "NP",
            actual: -1457,
            budget: -8851, // OP budget * 0.7
            lastYear: -1958,
          },
        },
        // AEP
        {
          id: "aep",
          name: "AEP",
          revenue: {
            label: "Revenue",
            actual: 87454,
            budget: 110790, // From Ambitious Target-2025 new
            lastYear: 85744,
          },
          grossProfit: {
            label: "GP",
            actual: 7215,
            budget: 7363, // From Ambitious Target-2025 new
            lastYear: 9302,
          },
          operatingProfit: {
            label: "OP",
            actual: -1048,
            budget: -2838, // From Ambitious Target-2025 new
            lastYear: 3660,
          },
          netProfit: {
            label: "NP",
            actual: -733,
            budget: -1987, // OP budget * 0.7
            lastYear: 2562,
          },
        },
        // RD6
        {
          id: "rd6",
          name: "RD6",
          revenue: {
            label: "Revenue",
            actual: 0,
            budget: 0, // From Ambitious Target-2025 new
            lastYear: 655,
          },
          grossProfit: {
            label: "GP",
            actual: 0,
            budget: 0, // From Ambitious Target-2025 new
            lastYear: -340,
          },
          operatingProfit: {
            label: "OP",
            actual: 0,
            budget: -922, // From Ambitious Target-2025 new
            lastYear: -1321,
          },
          netProfit: {
            label: "NP",
            actual: 0,
            budget: -646, // OP budget * 0.7
            lastYear: -925,
          },
        },
        // PCBGCEO
        {
          id: "pcbgceo",
          name: "PCBGCEO",
          revenue: {
            label: "Revenue",
            actual: 27610,
            budget: 45905, // From Ambitious Target-2025 new
            lastYear: 12038,
          },
          grossProfit: {
            label: "GP",
            actual: 1169,
            budget: 1836, // From Ambitious Target-2025 new
            lastYear: 580,
          },
          operatingProfit: {
            label: "OP",
            actual: -1967,
            budget: 639, // From Ambitious Target-2025 new
            lastYear: -1337,
          },
          netProfit: {
            label: "NP",
            actual: -1377,
            budget: 447, // OP budget * 0.7
            lastYear: -936,
          },
        },
      ],
    },
    // === SDBG (Smart Device Business Group) ===
    {
      id: "sdbg",
      name: "SDBG",
      revenue: {
        label: "Revenue",
        actual: 1305543,
        budget: 1676698, // From Ambitious Target-2025 new (TM_SDBG)
        lastYear: 1475184,
      },
      grossProfit: {
        label: "GP",
        actual: 33676,
        budget: 56516, // From Ambitious Target-2025 new
        lastYear: 20774,
      },
      operatingProfit: {
        label: "OP",
        actual: 17255,
        budget: 15018, // From Ambitious Target-2025 new
        lastYear: 3506,
      },
      netProfit: {
        label: "NP",
        actual: 12078,
        budget: 10513, // OP budget * 0.7
        lastYear: 2454,
      },
      sbus: [
        // SDBGBU1
        {
          id: "sdbgbu1",
          name: "SDBGBU1",
          revenue: {
            label: "Revenue",
            actual: 428388,
            budget: 527237, // From Ambitious Target-2025 new
            lastYear: 645244,
          },
          grossProfit: {
            label: "GP",
            actual: -43,
            budget: 5603, // From Ambitious Target-2025 new
            lastYear: -3945,
          },
          operatingProfit: {
            label: "OP",
            actual: 2218,
            budget: 389, // From Ambitious Target-2025 new
            lastYear: 643,
          },
          netProfit: {
            label: "NP",
            actual: 1552,
            budget: 273, // OP budget * 0.7
            lastYear: 450,
          },
        },
        // SDBGBU2
        {
          id: "sdbgbu2",
          name: "SDBGBU2",
          revenue: {
            label: "Revenue",
            actual: 805814,
            budget: 997088, // From Ambitious Target-2025 new
            lastYear: 600993,
          },
          grossProfit: {
            label: "GP",
            actual: 27815,
            budget: 37569, // From Ambitious Target-2025 new
            lastYear: 21009,
          },
          operatingProfit: {
            label: "OP",
            actual: 19269,
            budget: 21070, // From Ambitious Target-2025 new
            lastYear: 14964,
          },
          netProfit: {
            label: "NP",
            actual: 13488,
            budget: 14749, // OP budget * 0.7
            lastYear: 10474,
          },
        },
        // SDBGBU3
        {
          id: "sdbgbu3",
          name: "SDBGBU3",
          revenue: {
            label: "Revenue",
            actual: 39144,
            budget: 67021, // From Ambitious Target-2025 new
            lastYear: 44793,
          },
          grossProfit: {
            label: "GP",
            actual: 4282,
            budget: 6135, // From Ambitious Target-2025 new
            lastYear: 1404,
          },
          operatingProfit: {
            label: "OP",
            actual: -1309,
            budget: -2557, // From Ambitious Target-2025 new
            lastYear: -9900,
          },
          netProfit: {
            label: "NP",
            actual: -916,
            budget: -1790, // OP budget * 0.7
            lastYear: -6930,
          },
        },
        // SDBGBU5
        {
          id: "sdbgbu5",
          name: "SDBGBU5",
          revenue: {
            label: "Revenue",
            actual: 23708,
            budget: 64708, // From Ambitious Target-2025 new
            lastYear: 30624,
          },
          grossProfit: {
            label: "GP",
            actual: 66,
            budget: 2712, // From Ambitious Target-2025 new
            lastYear: 523,
          },
          operatingProfit: {
            label: "OP",
            actual: -3293,
            budget: -3988, // From Ambitious Target-2025 new
            lastYear: -1405,
          },
          netProfit: {
            label: "NP",
            actual: -2305,
            budget: -2792, // OP budget * 0.7
            lastYear: -984,
          },
        },
        // SDBGBU6
        {
          id: "sdbgbu6",
          name: "SDBGBU6",
          revenue: {
            label: "Revenue",
            actual: 8490,
            budget: 9636, // From Ambitious Target-2025 new
            lastYear: 153531,
          },
          grossProfit: {
            label: "GP",
            actual: 1556,
            budget: 1386, // From Ambitious Target-2025 new
            lastYear: 1784,
          },
          operatingProfit: {
            label: "OP",
            actual: 370,
            budget: -356, // From Ambitious Target-2025 new
            lastYear: -796,
          },
          netProfit: {
            label: "NP",
            actual: 259,
            budget: -249, // OP budget * 0.7
            lastYear: -557,
          },
        },
      ],
    },
    // === MBU ===
    {
      id: "mbu",
      name: "MBU",
      revenue: {
        label: "Revenue",
        actual: 4741,
        budget: 11008, // From Ambitious Target-2025 new
        lastYear: 1532,
      },
      grossProfit: {
        label: "GP",
        actual: 1695,
        budget: 3111, // From Ambitious Target-2025 new
        lastYear: 211,
      },
      operatingProfit: {
        label: "OP",
        actual: 453,
        budget: 461, // From Ambitious Target-2025 new
        lastYear: -842,
      },
      netProfit: {
        label: "NP",
        actual: 317,
        budget: 323, // OP budget * 0.7
        lastYear: -590,
      },
    },
    // === Central (Shared Expense) ===
    {
      id: "central",
      name: "Central",
      revenue: {
        label: "Revenue",
        actual: 0,
        budget: 0, // Central has no revenue in Ambitious Target
        lastYear: 0,
      },
      grossProfit: {
        label: "GP",
        actual: -5250,
        budget: 8478, // From Ambitious Target-2025 new
        lastYear: 0,
      },
      operatingProfit: {
        label: "OP",
        actual: -6031,
        budget: 2141, // From Ambitious Target-2025 new
        lastYear: 16226,
      },
      netProfit: {
        label: "NP",
        actual: -4222,
        budget: 1498, // OP budget * 0.7
        lastYear: 11358,
      },
    },
  ],
};
