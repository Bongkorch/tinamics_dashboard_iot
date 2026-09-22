export type PlantStatus = 'normal' | 'warning' | 'offline';
export type DeviceStatus = 'normal' | 'warning' | 'offline';
export type AlarmSeverity = 'critical' | 'warning' | 'info';

export interface Plant {
  id: string;
  name: string;
  location: string;
  status: PlantStatus;
  capacityKw: number;
  currentPowerKw: number;
  todayEnergyKwh: number;
  selfConsumptionPct: number;
  batterySocPct: number;
  updatedAt: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'Inverter' | 'Battery' | 'Smart Meter';
  model: string;
  status: DeviceStatus;
  primaryValue: string;
  secondaryValue: string;
  updatedAt: string;
}

export interface Alarm {
  id: string;
  severity: AlarmSeverity;
  title: string;
  device: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface PowerPoint {
  time: string;
  solar: number;
  load: number;
  grid: number;
}

export interface RoomReading {
  plantId: string;
  roomId: string;
  temp: number;
  humi: number;
  pm25: number | null;
  sensorId: string | null;
  status: PlantStatus;
  updatedAt: string;
}
