#!/usr/bin/env python3
"""
Extract financial data from Compal Excel file and output JSON for mock data.
"""

import pandas as pd
import json
import sys
from pathlib import Path

EXCEL_PATH = '/Users/Haien_Feng/Downloads/Financials for NC v1.xlsx'
OUTPUT_DIR = Path(__file__).parent / 'extracted_data'

# Exchange rate: NTD to USD (approximate)
NTD_TO_USD = 32.0

# BU ID mapping from Excel names to app IDs
BU_MAPPING = {
    'AEBU1': 'aebu1',
    'AEBU2': 'aebu2',
    'APBU1-ABO': 'apbu1_abo',
    'APBU1-T88': 'apbu1_t88',
    'APBU1-T99': 'apbu1_t99',
    'APBU2-C38': 'apbu2_c38',
    'APBU2-T12': 'apbu2_t12',
    'APBU2-T89': 'apbu2_t89',
    'PCBGCEO': 'pcbgceo',
    'AEP (non-ITS)': 'aep',
    'AEP': 'aep_total',
    'ISBG (excl. US)': 'isbg',
    'MBU': 'mbu',
    'SDBGBU1': 'sdbgbu1',
    'SDBGBU2': 'sdbgbu2',
    'SDBGBU3': 'sdbgbu3',
    'SDBGBU5': 'sdbgbu5',
    'Central': 'central',
}

# BG to BU mapping
BG_BU_MAPPING = {
    'pcbg': ['aebu1', 'aebu2', 'apbu1_abo', 'apbu1_t88', 'apbu1_t99', 'apbu2_c38', 'apbu2_t12', 'apbu2_t89', 'pcbgceo'],
    'sdbg': ['sdbgbu1', 'sdbgbu2', 'sdbgbu3', 'sdbgbu5'],
    'mbu': ['mbu'],
    'isbg': ['isbg'],
    'aep': ['aep'],
    'central': ['central'],
}

# Row indices for key metrics (0-indexed after header)
METRIC_ROWS = {
    'revenue': 4,       # 2. Net Revenue
    'gp': 26,           # 4. Gross profit
    'op_before': 45,    # 6. Operating income before shared exp.
    'op_after': 50,     # 8. Operating income after shared exp.
}

def get_bu_columns(df):
    """Get column indices for each BU from row 1.
    Each BU has 13 columns: 12 months + 1 FY total.
    """
    bu_row = df.iloc[1, 3:]
    bu_cols = {}
    
    i = 0
    while i < len(bu_row):
        val = bu_row.iloc[i]
        if pd.notna(val):
            bu_name = val
            start_col = i + 3
            # Each BU has 13 columns (12 months + FY)
            bu_cols[bu_name] = (start_col, start_col + 11)  # Only 12 months, skip FY
            i += 13  # Skip to next BU
        else:
            i += 1
    
    return bu_cols

def extract_monthly_data(df, bu_cols, metric_row):
    """Extract 12 months of data for each BU."""
    result = {}
    
    for bu_name, (start_col, end_col) in bu_cols.items():
        bu_id = BU_MAPPING.get(bu_name)
        if not bu_id:
            continue
        
        monthly_data = []
        for month_idx in range(12):
            col = start_col + month_idx
            if col <= end_col:
                val = df.iloc[metric_row, col]
                if pd.notna(val) and isinstance(val, (int, float)):
                    # Convert NTD M to USD K (NTD M / 32 * 1000 = USD K)
                    val_usd_k = val / NTD_TO_USD * 1000
                    monthly_data.append(round(val_usd_k, 2))
                else:
                    monthly_data.append(0)
            else:
                monthly_data.append(0)
        
        result[bu_id] = monthly_data
    
    return result

def extract_sheet_data(xl, sheet_name):
    """Extract all financial metrics from a sheet."""
    df = pd.read_excel(xl, sheet_name=sheet_name, header=None)
    bu_cols = get_bu_columns(df)
    
    data = {}
    for metric_name, row_idx in METRIC_ROWS.items():
        data[metric_name] = extract_monthly_data(df, bu_cols, row_idx)
    
    return data

def calculate_bg_totals(bu_data):
    """Calculate BG totals from BU data."""
    bg_data = {}
    
    for bg_id, bu_ids in BG_BU_MAPPING.items():
        monthly_totals = [0] * 12
        for bu_id in bu_ids:
            if bu_id in bu_data:
                for i, val in enumerate(bu_data[bu_id]):
                    monthly_totals[i] += val
        bg_data[bg_id] = [round(v, 2) for v in monthly_totals]
    
    # Calculate 'all' total
    all_totals = [0] * 12
    for bg_id in BG_BU_MAPPING.keys():
        if bg_id in bg_data:
            for i, val in enumerate(bg_data[bg_id]):
                all_totals[i] += val
    bg_data['all'] = [round(v, 2) for v in all_totals]
    
    return bg_data

def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    xl = pd.ExcelFile(EXCEL_PATH)
    
    # Extract data from each sheet
    sheets_to_extract = ['2024A', '2025A', '2025B', '2026B']
    all_data = {}
    
    for sheet in sheets_to_extract:
        print(f"Extracting {sheet}...")
        all_data[sheet] = extract_sheet_data(xl, sheet)
    
    # Calculate BG totals for each sheet/metric
    for sheet in sheets_to_extract:
        for metric in METRIC_ROWS.keys():
            bu_data = all_data[sheet][metric]
            bg_totals = calculate_bg_totals(bu_data)
            all_data[sheet][metric].update(bg_totals)
    
    # Format for monthlyBudgetData structure
    # Structure: { "01": { "bu_id": { budget: {...}, lastYear: {...} } } }
    monthly_budget_data_2025 = {}  # 2025 view: budget=2025B, lastYear=2024A
    monthly_budget_data_2026 = {}  # 2026 view: budget=2026B, lastYear=2025A
    
    months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    
    for month_idx, month_key in enumerate(months):
        monthly_budget_data_2025[month_key] = {}
        monthly_budget_data_2026[month_key] = {}
        
        # Get all BU IDs
        all_bu_ids = set()
        for metric_data in all_data['2025A'].values():
            all_bu_ids.update(metric_data.keys())
        
        for bu_id in all_bu_ids:
            # 2025 view
            budget_2025 = {
                'rev': all_data['2025B']['revenue'].get(bu_id, [0]*12)[month_idx],
                'gp': all_data['2025B']['gp'].get(bu_id, [0]*12)[month_idx],
                'op': all_data['2025B']['op_after'].get(bu_id, [0]*12)[month_idx],
                'np': all_data['2025B']['op_after'].get(bu_id, [0]*12)[month_idx],  # Using OP as NP proxy
            }
            last_year_2024 = {
                'rev': all_data['2024A']['revenue'].get(bu_id, [0]*12)[month_idx],
                'gp': all_data['2024A']['gp'].get(bu_id, [0]*12)[month_idx],
                'op': all_data['2024A']['op_after'].get(bu_id, [0]*12)[month_idx],
                'np': all_data['2024A']['op_after'].get(bu_id, [0]*12)[month_idx],
            }
            monthly_budget_data_2025[month_key][bu_id] = {
                'budget': budget_2025,
                'lastYear': last_year_2024,
            }
            
            # 2026 view
            budget_2026 = {
                'rev': all_data['2026B']['revenue'].get(bu_id, [0]*12)[month_idx],
                'gp': all_data['2026B']['gp'].get(bu_id, [0]*12)[month_idx],
                'op': all_data['2026B']['op_after'].get(bu_id, [0]*12)[month_idx],
                'np': all_data['2026B']['op_after'].get(bu_id, [0]*12)[month_idx],
            }
            last_year_2025 = {
                'rev': all_data['2025A']['revenue'].get(bu_id, [0]*12)[month_idx],
                'gp': all_data['2025A']['gp'].get(bu_id, [0]*12)[month_idx],
                'op': all_data['2025A']['op_after'].get(bu_id, [0]*12)[month_idx],
                'np': all_data['2025A']['op_after'].get(bu_id, [0]*12)[month_idx],
            }
            monthly_budget_data_2026[month_key][bu_id] = {
                'budget': budget_2026,
                'lastYear': last_year_2025,
            }
    
    # Save outputs
    with open(OUTPUT_DIR / 'monthly_budget_data_2025.json', 'w') as f:
        json.dump(monthly_budget_data_2025, f, indent=2)
    
    with open(OUTPUT_DIR / 'monthly_budget_data_2026.json', 'w') as f:
        json.dump(monthly_budget_data_2026, f, indent=2)
    
    # Generate summary for mockBgData.ts
    # Full year totals
    bg_summary = {}
    for bu_id in set().union(*[set(all_data['2025A'][m].keys()) for m in METRIC_ROWS.keys()]):
        fy_2025_actual = {
            'revenue': sum(all_data['2025A']['revenue'].get(bu_id, [0]*12)),
            'gp': sum(all_data['2025A']['gp'].get(bu_id, [0]*12)),
            'op': sum(all_data['2025A']['op_after'].get(bu_id, [0]*12)),
        }
        fy_2025_budget = {
            'revenue': sum(all_data['2025B']['revenue'].get(bu_id, [0]*12)),
            'gp': sum(all_data['2025B']['gp'].get(bu_id, [0]*12)),
            'op': sum(all_data['2025B']['op_after'].get(bu_id, [0]*12)),
        }
        fy_2024_actual = {
            'revenue': sum(all_data['2024A']['revenue'].get(bu_id, [0]*12)),
            'gp': sum(all_data['2024A']['gp'].get(bu_id, [0]*12)),
            'op': sum(all_data['2024A']['op_after'].get(bu_id, [0]*12)),
        }
        ytm_2025_actual = {
            'revenue': sum(all_data['2025A']['revenue'].get(bu_id, [0]*12)[:2]),
            'gp': sum(all_data['2025A']['gp'].get(bu_id, [0]*12)[:2]),
            'op': sum(all_data['2025A']['op_after'].get(bu_id, [0]*12)[:2]),
        }
        ytm_2025_budget = {
            'revenue': sum(all_data['2025B']['revenue'].get(bu_id, [0]*12)[:2]),
            'gp': sum(all_data['2025B']['gp'].get(bu_id, [0]*12)[:2]),
            'op': sum(all_data['2025B']['op_after'].get(bu_id, [0]*12)[:2]),
        }
        ytm_2024_actual = {
            'revenue': sum(all_data['2024A']['revenue'].get(bu_id, [0]*12)[:2]),
            'gp': sum(all_data['2024A']['gp'].get(bu_id, [0]*12)[:2]),
            'op': sum(all_data['2024A']['op_after'].get(bu_id, [0]*12)[:2]),
        }
        
        bg_summary[bu_id] = {
            'fy_2025_actual': {k: round(v, 2) for k, v in fy_2025_actual.items()},
            'fy_2025_budget': {k: round(v, 2) for k, v in fy_2025_budget.items()},
            'fy_2024_actual': {k: round(v, 2) for k, v in fy_2024_actual.items()},
            'ytm_2025_actual': {k: round(v, 2) for k, v in ytm_2025_actual.items()},
            'ytm_2025_budget': {k: round(v, 2) for k, v in ytm_2025_budget.items()},
            'ytm_2024_actual': {k: round(v, 2) for k, v in ytm_2024_actual.items()},
        }
    
    with open(OUTPUT_DIR / 'bg_summary.json', 'w') as f:
        json.dump(bg_summary, f, indent=2)
    
    # Generate performance data for mockBusinessGroupPerformance.ts (in Mn USD)
    perf_data = {}
    for bu_id in bg_summary.keys():
        data = bg_summary[bu_id]
        # Convert K USD to Mn USD (divide by 1000)
        perf_data[bu_id] = {
            'rev': {
                'value': round(data['ytm_2025_actual']['revenue'] / 1000, 1),
                'baseline': round(data['ytm_2025_budget']['revenue'] / 1000, 1),
                'stly': round(data['ytm_2024_actual']['revenue'] / 1000, 1),
            },
            'gp': {
                'value': round(data['ytm_2025_actual']['gp'] / 1000, 1),
                'baseline': round(data['ytm_2025_budget']['gp'] / 1000, 1),
                'stly': round(data['ytm_2024_actual']['gp'] / 1000, 1),
            },
            'op': {
                'value': round(data['ytm_2025_actual']['op'] / 1000, 1),
                'baseline': round(data['ytm_2025_budget']['op'] / 1000, 1),
                'stly': round(data['ytm_2024_actual']['op'] / 1000, 1),
            },
            'np': {
                'value': round(data['ytm_2025_actual']['op'] / 1000, 1),
                'baseline': round(data['ytm_2025_budget']['op'] / 1000, 1),
                'stly': round(data['ytm_2024_actual']['op'] / 1000, 1),
            },
        }
    
    with open(OUTPUT_DIR / 'performance_data.json', 'w') as f:
        json.dump(perf_data, f, indent=2)
    
    print(f"\nData extracted to {OUTPUT_DIR}")
    print(f"Files created:")
    for f in OUTPUT_DIR.iterdir():
        print(f"  - {f.name}")

if __name__ == '__main__':
    main()
