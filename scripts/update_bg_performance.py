#!/usr/bin/env python3
"""
Update src/data/mockBusinessGroupPerformance.ts with extracted financial data.
Values in Mn USD (K USD / 1000).
"""

import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
EXTRACTED_DATA_DIR = SCRIPT_DIR / 'extracted_data'
BG_PERF_PATH = SCRIPT_DIR.parent / 'src' / 'data' / 'mockBusinessGroupPerformance.ts'

# BG IDs that should be updated
BG_IDS = ['pcbg', 'sdbg', 'mbu', 'isbg', 'aep', 'central']

def format_number(val):
    """Format number for TypeScript (Mn USD, so divide by 1000)."""
    mn_val = val / 1000  # Convert K USD to Mn USD
    if mn_val == 0:
        return '0'
    return f'{mn_val:.0f}'

def update_metric_block(block, metric_name, value, baseline, stly):
    """Update a single metric block (rev, gp, op, np)."""
    # Find the metric block
    pattern = rf'({metric_name}:\s*\{{)'
    match = re.search(pattern, block)
    if not match:
        return block
    
    start = match.start()
    # Find the closing brace
    depth = 0
    end = start
    for i, c in enumerate(block[match.end():]):
        if c == '{':
            depth += 1
        elif c == '}':
            if depth == 0:
                end = match.end() + i + 1
                break
            depth -= 1
    
    metric_block = block[start:end]
    
    # Update values
    new_metric_block = re.sub(r'(value:\s*)[\d\-\.]+', rf'\g<1>{value}', metric_block, count=1)
    new_metric_block = re.sub(r'(baseline:\s*)[\d\-\.]+', rf'\g<1>{baseline}', new_metric_block, count=1)
    new_metric_block = re.sub(r'(stly:\s*)[\d\-\.]+', rf'\g<1>{stly}', new_metric_block, count=1)
    
    return block[:start] + new_metric_block + block[end:]

def update_bg_metrics(content, bg_id, data):
    """Update financial metrics for a specific BG in mockBusinessGroupData."""
    # Find the BG block
    pattern = rf'id:\s*"{bg_id}",\s*\n\s*name:\s*"[^"]+",'
    match = re.search(pattern, content)
    if not match:
        print(f"Warning: BG {bg_id} not found in mockBusinessGroupData")
        return content
    
    start_pos = match.start()
    
    # Find the end of this BG block (look for },\n  // or },\n  { or },\n];)
    rest = content[match.end():]
    # Find the closing brace of this object - count braces
    depth = 1  # We're inside the object
    end_offset = 0
    for i, c in enumerate(rest):
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                end_offset = i + 1
                break
    
    end_pos = match.end() + end_offset
    bg_block = content[start_pos:end_pos]
    
    # Values in Mn USD
    value_rev = round(data['fy_2025_actual']['revenue'] / 1000)
    baseline_rev = round(data['fy_2025_budget']['revenue'] / 1000)
    stly_rev = round(data['fy_2024_actual']['revenue'] / 1000)
    
    value_gp = round(data['fy_2025_actual']['gp'] / 1000)
    baseline_gp = round(data['fy_2025_budget']['gp'] / 1000)
    stly_gp = round(data['fy_2024_actual']['gp'] / 1000)
    
    value_op = round(data['fy_2025_actual']['op'] / 1000)
    baseline_op = round(data['fy_2025_budget']['op'] / 1000)
    stly_op = round(data['fy_2024_actual']['op'] / 1000)
    
    # NP approximation (70% of OP)
    value_np = round(value_op * 0.7)
    baseline_np = round(baseline_op * 0.7)
    stly_np = round(stly_op * 0.7)
    
    # Update each metric block
    new_bg_block = bg_block
    new_bg_block = update_metric_block(new_bg_block, 'rev', value_rev, baseline_rev, stly_rev)
    new_bg_block = update_metric_block(new_bg_block, 'gp', value_gp, baseline_gp, stly_gp)
    new_bg_block = update_metric_block(new_bg_block, 'op', value_op, baseline_op, stly_op)
    new_bg_block = update_metric_block(new_bg_block, 'np', value_np, baseline_np, stly_np)
    
    # Replace the block in content
    content = content[:start_pos] + new_bg_block + content[end_pos:]
    
    return content

def main():
    # Read extracted data
    with open(EXTRACTED_DATA_DIR / 'bg_summary.json') as f:
        bg_summary = json.load(f)
    
    # Read current file
    with open(BG_PERF_PATH, 'r') as f:
        content = f.read()
    
    # Update each BG in mockBusinessGroupData
    updated_count = 0
    for bg_id in BG_IDS:
        if bg_id in bg_summary:
            content = update_bg_metrics(content, bg_id, bg_summary[bg_id])
            updated_count += 1
            print(f"Updated {bg_id}")
        else:
            print(f"Warning: No data for {bg_id}")
    
    # Write updated file
    with open(BG_PERF_PATH, 'w') as f:
        f.write(content)
    
    print(f"\nUpdated {updated_count} BGs in {BG_PERF_PATH}")

if __name__ == '__main__':
    main()
