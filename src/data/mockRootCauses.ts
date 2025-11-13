import type { RootCause } from '../types';

export const mockRootCauses: RootCause[] = [
  {
    id: 'rc-1',
    title: 'Indirect Labor Cost Increase Due to Minimum Wage Hike',
    impact: -2.5,
    tags: ['IDL', 'Labor'],
    waveTicketNumber: 'nc-101',
  },
  {
    id: 'rc-2',
    title: 'Material Cost Surge from Rare Earth Supply Disruption',
    impact: -5.0,
    tags: ['COGS', 'Material'],
    waveTicketNumber: 'nc-102',
  },
  {
    id: 'rc-3',
    title: 'Volume Decline from US Tariff Impact on EV Connectors',
    impact: -10.0,
    tags: ['Revenue', 'Volume'],
    waveTicketNumber: 'nc-103',
  },
];
