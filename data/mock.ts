import type { Alarm, Device, Plant, PowerPoint } from '@/types/domain';

export const plant: Plant = {
  id: 'plant-bkk-01',
  name: 'Bangkok Smart Factory',
  location: 'Bangkok, Thailand',
  status: 'normal',
  capacityKw: 180,
  currentPowerKw: 125.4,
  todayEnergyKwh: 742.8,
  selfConsumptionPct: 82,
  batterySocPct: 76,
  updatedAt: 'Just now',
};

export const plants: Plant[] = [
  plant,
  {
    id: 'plant-aya-02',
    name: 'Ayutthaya Warehouse',
    location: 'Ayutthaya, Thailand',
    status: 'warning',
    capacityKw: 95,
    currentPowerKw: 61.2,
    todayEnergyKwh: 381.6,
    selfConsumptionPct: 74,
    batterySocPct: 64,
    updatedAt: '2 min ago',
  },
  {
    id: 'plant-cbi-03',
    name: 'Chonburi Office',
    location: 'Chonburi, Thailand',
    status: 'normal',
    capacityKw: 42,
    currentPowerKw: 28.7,
    todayEnergyKwh: 162.3,
    selfConsumptionPct: 91,
    batterySocPct: 88,
    updatedAt: '1 min ago',
  },
];

export const devices: Device[] = [
  { id: 'inv-01', name: 'INV-01', type: 'Inverter', model: 'Smart Inverter 100K', status: 'normal', primaryValue: '82.4 kW', secondaryValue: '98.2% efficiency', updatedAt: '10 sec ago' },
  { id: 'inv-02', name: 'INV-02', type: 'Inverter', model: 'Smart Inverter 60K', status: 'normal', primaryValue: '43.0 kW', secondaryValue: '97.9% efficiency', updatedAt: '12 sec ago' },
  { id: 'bat-01', name: 'ESS-01', type: 'Battery', model: 'Battery Rack 100 kWh', status: 'normal', primaryValue: '76% SOC', secondaryValue: 'Charging 18.2 kW', updatedAt: '8 sec ago' },
  { id: 'meter-01', name: 'METER-01', type: 'Smart Meter', model: 'Three Phase Meter', status: 'warning', primaryValue: '14.8 kW import', secondaryValue: 'Communication unstable', updatedAt: '2 min ago' },
];

export const alarms: Alarm[] = [
  { id: 'alm-1', severity: 'warning', title: 'Communication unstable', device: 'METER-01', message: 'Data update interval is higher than expected.', timestamp: '2 min ago', acknowledged: false },
  { id: 'alm-2', severity: 'info', title: 'Battery charge target reached', device: 'ESS-01', message: 'Battery reached the configured daytime target.', timestamp: '38 min ago', acknowledged: true },
  { id: 'alm-3', severity: 'critical', title: 'Historical inverter fault', device: 'INV-02', message: 'DC over-voltage event cleared automatically.', timestamp: 'Yesterday 16:42', acknowledged: true },
];

export const powerSeries: PowerPoint[] = [
  { time: '06:00', solar: 8, load: 34, grid: 26 },
  { time: '08:00', solar: 42, load: 48, grid: 6 },
  { time: '10:00', solar: 88, load: 61, grid: -27 },
  { time: '12:00', solar: 132, load: 85, grid: -47 },
  { time: '14:00', solar: 125, load: 92, grid: -33 },
  { time: '16:00', solar: 84, load: 79, grid: -5 },
  { time: '18:00', solar: 22, load: 73, grid: 51 },
];
