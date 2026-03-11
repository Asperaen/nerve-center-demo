#!/usr/bin/env python3
"""
Update src/api/mockData.ts with extracted financial data.
"""

import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
EXTRACTED_DATA_DIR = SCRIPT_DIR / 'extracted_data'
MOCK_DATA_PATH = SCRIPT_DIR.parent / 'src' / 'api' / 'mockData.ts'

def format_number(val):
    """Format number for TypeScript."""
    if val == 0:
        return '0'
    return f'{val:.2f}'.rstrip('0').rstrip('.')

def generate_monthly_budget_data():
    """Generate TypeScript code for monthlyBudgetData."""
    with open(EXTRACTED_DATA_DIR / 'monthly_budget_data_2025.json') as f:
        data_2025 = json.load(f)
    
    lines = []
    lines.append('export const monthlyBudgetData: Record<')
    lines.append('  string,')
    lines.append('  Record<string, { budget: MonthlyMetrics; lastYear: MonthlyMetrics }>')
    lines.append('> = {')
    
    months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    
    for month in months:
        lines.append(f'  "{month}": {{')
        month_data = data_2025.get(month, {})
        
        bu_items = []
        for bu_id, bu_data in sorted(month_data.items()):
            budget = bu_data['budget']
            last_year = bu_data['lastYear']
            bu_items.append(f'''    {bu_id}: {{
      budget: {{ rev: {format_number(budget['rev'])}, gp: {format_number(budget['gp'])}, op: {format_number(budget['op'])}, np: {format_number(budget['np'])} }},
      lastYear: {{ rev: {format_number(last_year['rev'])}, gp: {format_number(last_year['gp'])}, op: {format_number(last_year['op'])}, np: {format_number(last_year['np'])} }},
    }}''')
        
        lines.append(',\n'.join(bu_items))
        lines.append('  },')
    
    lines.append('};')
    
    return '\n'.join(lines)

def main():
    # Read current mockData.ts
    with open(MOCK_DATA_PATH, 'r') as f:
        content = f.read()
    
    # Generate new monthlyBudgetData
    new_monthly_data = generate_monthly_budget_data()
    
    # Find and replace monthlyBudgetData section
    # Pattern to match from "export const monthlyBudgetData" to the next "export const" or end
    pattern = r'(/\*\*[\s\S]*?\*/\s*)?export const monthlyBudgetData[\s\S]*?^};'
    
    # Replace with new data
    replacement = '''/**
 * Monthly Budget Data - Real data from Compal Excel
 * Budget from 2025B, LastYear from 2024A
 * Values in thousands USD (K USD)
 */
''' + new_monthly_data
    
    new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    
    # Write updated file
    with open(MOCK_DATA_PATH, 'w') as f:
        f.write(new_content)
    
    print(f"Updated {MOCK_DATA_PATH}")

if __name__ == '__main__':
    main()
