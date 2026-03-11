#!/usr/bin/env python3
"""
Update src/data/mockBgData.ts with extracted financial data.
Only updates financial metrics, preserves other fields.
"""

import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
EXTRACTED_DATA_DIR = SCRIPT_DIR / 'extracted_data'
MOCK_BG_DATA_PATH = SCRIPT_DIR.parent / 'src' / 'data' / 'mockBgData.ts'

# BU name to ID mapping
BU_NAME_TO_ID = {
    'AEBU1': 'aebu1',
    'AEBU2': 'aebu2',
    'APBU1-ABO': 'apbu1_abo',
    'APBU1-T88': 'apbu1_t88',
    'APBU1-T99': 'apbu1_t99',
    'APBU2-C38': 'apbu2_c38',
    'APBU2-T12': 'apbu2_t12',
    'APBU2-T89': 'apbu2_t89',
    'PCBGCEO': 'pcbgceo',
    'AEP': 'aep',
    'ISBG': 'isbg',
    'MBU': 'mbu',
    'SDBGBU1': 'sdbgbu1',
    'SDBGBU2': 'sdbgbu2',
    'SDBGBU3': 'sdbgbu3',
    'SDBGBU5': 'sdbgbu5',
    'Central': 'central',
    'RD6': 'rd6',
}

# Reverse mapping
BU_ID_TO_NAME = {v: k for k, v in BU_NAME_TO_ID.items()}

def format_number(val):
    """Format number for TypeScript."""
    if val == 0:
        return '0'
    return f'{val:.1f}'.rstrip('0').rstrip('.')

def update_bu_metrics(content, bu_name, data):
    """Update financial metrics for a specific BU in the content."""
    # Find the BU block by name
    pattern = rf'name:\s*"{bu_name}",'
    match = re.search(pattern, content)
    if not match:
        print(f"Warning: BU {bu_name} not found in file")
        return content
    
    start_pos = match.start()
    
    # Find the end of this BU block (next "name:" or closing brace pattern)
    # Look for the next BU or end of array
    next_bu_match = re.search(r'name:\s*"[^"]+"', content[match.end():])
    if next_bu_match:
        end_pos = match.end() + next_bu_match.start()
    else:
        end_pos = len(content)
    
    bu_block = content[start_pos:end_pos]
    
    # Define metrics to update
    metrics = {
        'revenue': data['ytm_2025_actual']['revenue'],
        'grossProfit': data['ytm_2025_actual']['gp'],
        'operatingProfit': data['ytm_2025_actual']['op'],
        'netProfit': data['ytm_2025_actual']['op'] * 0.7,  # Approximate NP
        'ytmRevenueActual': data['ytm_2025_actual']['revenue'],
        'ytmGrossProfitActual': data['ytm_2025_actual']['gp'],
        'ytmOperatingProfitActual': data['ytm_2025_actual']['op'],
        'ytmNetProfitActual': data['ytm_2025_actual']['op'] * 0.7,
        'revenueBudget': data['fy_2025_budget']['revenue'],
        'grossProfitBudget': data['fy_2025_budget']['gp'],
        'operatingProfitBudget': data['fy_2025_budget']['op'],
        'netProfitBudget': data['fy_2025_budget']['op'] * 0.7,
        'ytmRevenueBudget': data['ytm_2025_budget']['revenue'],
        'ytmGrossProfitBudget': data['ytm_2025_budget']['gp'],
        'ytmOperatingProfitBudget': data['ytm_2025_budget']['op'],
        'ytmNetProfitBudget': data['ytm_2025_budget']['op'] * 0.7,
        'lastYearRevenue': data['fy_2024_actual']['revenue'],
        'lastYearGrossProfit': data['fy_2024_actual']['gp'],
        'lastYearOperatingProfit': data['fy_2024_actual']['op'],
        'lastYearNetProfit': data['fy_2024_actual']['op'] * 0.7,
        'ytmLastYearRevenue': data['ytm_2024_actual']['revenue'],
        'ytmLastYearGrossProfit': data['ytm_2024_actual']['gp'],
        'ytmLastYearOperatingProfit': data['ytm_2024_actual']['op'],
        'ytmLastYearNetProfit': data['ytm_2024_actual']['op'] * 0.7,
        'forecastRevenue': data['fy_2025_actual']['revenue'],  # Use actual as forecast
        'forecastGrossProfit': data['fy_2025_actual']['gp'],
        'forecastOperatingProfit': data['fy_2025_actual']['op'],
        'forecastNetProfit': data['fy_2025_actual']['op'] * 0.7,
    }
    
    # Update each metric within this BU block only
    new_bu_block = bu_block
    for metric_name, value in metrics.items():
        pattern = rf'({metric_name}:\s*)[\d\-\.]+(\s*,)'
        replacement = rf'\g<1>{format_number(value)}\2'
        new_bu_block = re.sub(pattern, replacement, new_bu_block, count=1)
    
    # Replace the block in content
    content = content[:start_pos] + new_bu_block + content[end_pos:]
    
    return content

def main():
    # Read extracted data
    with open(EXTRACTED_DATA_DIR / 'bg_summary.json') as f:
        bg_summary = json.load(f)
    
    # Read current mockBgData.ts
    with open(MOCK_BG_DATA_PATH, 'r') as f:
        content = f.read()
    
    # Update each BU
    updated_count = 0
    for bu_id, data in bg_summary.items():
        # Find the BU name in the file (it uses the display name, not ID)
        bu_name = BU_ID_TO_NAME.get(bu_id)
        if not bu_name:
            # Try uppercase version
            bu_name = bu_id.upper()
        
        if bu_name in ['PCBG', 'SDBG', 'ALL', 'AEP_TOTAL']:
            continue  # Skip aggregate BGs
        
        # Check if this BU exists in the file
        if f'name: "{bu_name}"' in content or f"name: '{bu_name}'" in content:
            content = update_bu_metrics(content, bu_name, data)
            updated_count += 1
            print(f"Updated {bu_name}")
    
    # Write updated file
    with open(MOCK_BG_DATA_PATH, 'w') as f:
        f.write(content)
    
    print(f"\nUpdated {updated_count} BUs in {MOCK_BG_DATA_PATH}")

if __name__ == '__main__':
    main()
