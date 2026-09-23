export const en = {
  nav: { dashboard: 'Dashboard', plants: 'Plants', temperature: 'Temperature', devices: 'Devices', alerts: 'Alerts', notifications: 'Notifications', settings: 'Settings', home: 'Home' },
  common: { viewAll: 'View all', updated: 'Updated', live: 'Live', normal: 'Normal', warning: 'Warning', offline: 'Offline', critical: 'Critical', info: 'Info', acknowledged: 'Acknowledged', needsAttention: 'Needs attention', language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark', english: 'EN', thai: 'TH', save: 'Save changes', exportCsv: 'Export CSV' },
  header: { energyOperations: 'Energy Operations', smartMonitoring: 'Smart monitoring', notifications: 'Notifications', settings: 'Settings', workspace: 'Demo workspace' },
  sidebar: { prototype: 'Frontend prototype', prototypeDesc: 'Mock data only. Ready for API integration later.', console: 'MVP Console' },
  dashboard: {
    title: 'Dashboard', desc: 'Live overview of your energy system', selectedPlant: 'Selected Plant', installedCapacity: 'installed capacity', changePlant: 'Change plant →',
    currentPower: 'Current Power', currentPowerHelp: 'Live solar output', todayEnergy: "Today's Energy", todayEnergyHelp: '+8.2% vs yesterday', selfConsumption: 'Self Consumption', selfConsumptionHelp: 'Solar used on site', battery: 'Battery', batteryHelp: '76 kWh available',
    energyFlow: 'Live Energy Flow', solar: 'Solar', factoryLoad: 'Factory Load', gridExport: 'Grid Export', charging: 'Charging', exportingNow: 'Exporting now', powerToday: 'Power Today', chartDesc: 'Solar generation versus site load', load: 'Load', deviceHealth: 'Device Health', connectedDevices: '4 connected devices', recentAlerts: 'Recent Alerts', alertsDesc: 'Items that may need attention'
  },
  plants: { title: 'Plants', desc: 'Monitor all connected sites from one place', currentPower: 'Current Power', today: 'Today', selfConsumption: 'Self Consumption', battery: 'Battery' },
  temperature: {
    title: 'Temperature', desc: 'Live humidity and temperature readings from connected rooms', room: 'Room', temperature: 'Temperature', humidity: 'Humidity', pm25: 'PM2.5', sensorId: 'Sensor ID', empty: 'No rooms found yet. Check that Node-RED is publishing to Firestore.',
    csv: { plantId: 'Plant ID', room: 'Room', status: 'Status', temperature: 'Temperature (°C)', humidity: 'Humidity (%)', pm25: 'PM2.5 (µg/m³)', sensorId: 'Sensor ID', updatedAt: 'Updated At' }
  },
  devices: { title: 'Devices', desc: 'Essential device health and operating values', device: 'Device', model: 'Model', status: 'Status', primaryValue: 'Primary Value', updated: 'Updated' },
  alerts: { title: 'Alerts', desc: 'Prioritized operational events and system notices' },
  notifications: { title: 'Notifications', desc: 'Updates, system messages, and activity from your energy workspace', unread: 'Unread', markAll: 'Mark all as read', system: 'System', maintenance: 'Maintenance', report: 'Report', n1Title: 'Daily energy summary is ready', n1Body: 'Bangkok Smart Factory generated 742.8 kWh today.', n2Title: 'Meter communication requires review', n2Body: 'METER-01 has reported an unstable connection for 2 minutes.', n3Title: 'Monthly performance report available', n3Body: 'Your August plant performance summary is ready to review.' },
  settings: { title: 'Settings', desc: 'Manage display and workspace preferences for this prototype', appearance: 'Appearance', appearanceDesc: 'Choose how the interface looks on this browser.', language: 'Language', languageDesc: 'Choose the language used across the interface.', workspace: 'Workspace', workspaceDesc: 'Prototype workspace information.', workspaceName: 'Workspace name', mode: 'Data mode', mockData: 'Mock data only', note: 'Theme and language preferences are saved in this browser.' },
  time: { justNow: 'just now', minAgo: 'min ago' }
} as const;
