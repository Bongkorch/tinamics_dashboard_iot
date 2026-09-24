export const th = {
  nav: { dashboard: 'แดชบอร์ด', plants: 'โรงงาน', temperature: 'อุณหภูมิ', tempShort: 'อุณหภูมิ', devices: 'อุปกรณ์', alerts: 'Alarm', notifications: 'แจ้งเตือน', settings: 'ตั้งค่า', home: 'หน้าหลัก' },
  common: { viewAll: 'ดูทั้งหมด', updated: 'อัปเดต', live: 'เรียลไทม์', normal: 'ปกติ', warning: 'ผิดปกติ', offline: 'ออฟไลน์', critical: 'วิกฤต', info: 'ข้อมูล', acknowledged: 'รับทราบแล้ว', needsAttention: 'ต้องตรวจสอบ', language: 'ภาษา', theme: 'ธีม', light: 'สว่าง', dark: 'มืด', english: 'EN', thai: 'TH', save: 'บันทึกการเปลี่ยนแปลง', exportCsv: 'ส่งออก CSV' },
  header: { energyOperations: 'การจัดการพลังงาน', smartMonitoring: 'ระบบติดตามอัจฉริยะ', notifications: 'แจ้งเตือน', settings: 'ตั้งค่า', workspace: 'พื้นที่ทำงานตัวอย่าง' },
  sidebar: { prototype: 'Frontend Prototype', prototypeDesc: 'ใช้ข้อมูลจำลองเท่านั้น พร้อมเชื่อมต่อ API ภายหลัง', console: 'MVP Console' },
  dashboard: {
    title: 'แดชบอร์ด', desc: 'ภาพรวมระบบพลังงานแบบเรียลไทม์', selectedPlant: 'โรงงานที่เลือก', installedCapacity: 'กำลังติดตั้ง', changePlant: 'เปลี่ยนโรงงาน →',
    currentPower: 'กำลังไฟปัจจุบัน', currentPowerHelp: 'กำลังผลิตโซลาร์แบบเรียลไทม์', todayEnergy: 'พลังงานวันนี้', todayEnergyHelp: '+8.2% เทียบกับเมื่อวาน', selfConsumption: 'ใช้พลังงานเอง', selfConsumptionHelp: 'สัดส่วนโซลาร์ที่ใช้ภายในพื้นที่', battery: 'แบตเตอรี่', batteryHelp: 'พลังงานคงเหลือ 76 kWh',
    energyFlow: 'การไหลของพลังงาน', solar: 'โซลาร์', factoryLoad: 'โหลดโรงงาน', gridExport: 'ส่งเข้ากริด', charging: 'กำลังชาร์จ', exportingNow: 'กำลังส่งไฟเข้ากริด', powerToday: 'กำลังไฟวันนี้', chartDesc: 'เปรียบเทียบการผลิตโซลาร์กับโหลดภายใน', load: 'โหลด', deviceHealth: 'สถานะอุปกรณ์', connectedDevices: 'เชื่อมต่อ 4 อุปกรณ์', recentAlerts: 'Alarm ล่าสุด', alertsDesc: 'รายการที่อาจต้องตรวจสอบ'
  },
  plants: { phase: 'เฟส', loading: 'กำลังโหลด…', empty: 'ยังไม่มีข้อมูลของมิเตอร์นี้', inRange: 'อยู่ในเกณฑ์', outOfRange: 'เกินเกณฑ์', voltage: 'แรงดัน', current: 'กระแส', activePower: 'กำลังจริง', reactivePower: 'กำลังรีแอกทีฟ', apparentPower: 'กำลังปรากฏ', powerFactor: 'ตัวประกอบกำลัง', updatedMinAgo: 'อัปเดตเมื่อ {n} นาทีที่แล้ว', lineToLine: 'แรงดันระหว่างเฟส', totals: 'ค่ารวม', totalActivePower: 'กำลังจริงรวม', totalReactivePower: 'กำลังรีแอกทีฟรวม', totalApparentPower: 'กำลังปรากฏรวม', totalPf: 'ตัวประกอบกำลังรวม', environment: 'สภาพแวดล้อมและคุณภาพไฟฟ้า', cabinetTemp: 'อุณหภูมิตู้', cabinetHumidity: 'ความชื้นตู้', neutralCurrent: 'กระแสนิวทรัล', frequency: 'ความถี่', voltageUnbalance: 'ไม่สมดุลแรงดัน', currentUnbalance: 'ไม่สมดุลกระแส' },
  temperature: {
    title: 'อุณหภูมิ', desc: 'ค่าความชื้นและอุณหภูมิแบบเรียลไทม์จากห้องที่เชื่อมต่อ', room: 'ห้อง', temperature: 'อุณหภูมิ', humidity: 'ความชื้น', pm25: 'PM2.5', sensorId: 'รหัสเซนเซอร์', empty: 'ยังไม่พบข้อมูลห้อง ตรวจสอบว่า Node-RED ส่งข้อมูลเข้า Firestore แล้ว',
    csv: { plantId: 'รหัสโรงงาน', room: 'ห้อง', status: 'สถานะ', temperature: 'อุณหภูมิ (°C)', humidity: 'ความชื้น (%)', pm25: 'PM2.5 (µg/m³)', sensorId: 'รหัสเซนเซอร์', updatedAt: 'อัปเดตล่าสุด', recordedAt: 'บันทึกเมื่อ' },
    export: {
      scope: 'ขอบเขตการส่งออก', current: 'ปัจจุบัน', history: 'ประวัติ', from: 'จาก', to: 'ถึง', rangeInvalid: 'เลือกช่วงวันที่ที่ถูกต้อง ไม่เกิน 90 วัน',
      preview: 'ตัวอย่างการส่งออก', close: 'ปิด', dragHandle: 'ลากลงเพื่อปิด', loading: 'กำลังโหลด…', failed: 'ส่งออกไม่สำเร็จ กรุณาลองอีกครั้ง', noRows: 'ไม่มีข้อมูลในช่วงนี้',
      rowsNote: 'แสดง {shown} แถวแรกจากทั้งหมด {total} แถว ไฟล์เต็มมีข้อมูลทุกแถว',
      share: 'แชร์', download: 'ดาวน์โหลด', copy: 'คัดลอก', copied: 'คัดลอกแล้ว', shareTitle: 'ส่งออกข้อมูลอุณหภูมิ'
    }
  },
  devices: { title: 'อุปกรณ์', desc: 'สถานะและค่าการทำงานสำคัญของอุปกรณ์', device: 'อุปกรณ์', model: 'รุ่น', status: 'สถานะ', primaryValue: 'ค่าหลัก', updated: 'อัปเดต' },
  alerts: { title: 'Alarm', desc: 'เหตุการณ์การทำงานและสถานะระบบตามระดับความสำคัญ' },
  notifications: { title: 'แจ้งเตือน', desc: 'ข่าวสาร ข้อความระบบ และกิจกรรมจากพื้นที่ทำงานด้านพลังงาน', unread: 'ยังไม่ได้อ่าน', markAll: 'ทำเครื่องหมายว่าอ่านทั้งหมด', system: 'ระบบ', maintenance: 'การบำรุงรักษา', report: 'รายงาน', n1Title: 'สรุปพลังงานประจำวันพร้อมแล้ว', n1Body: 'Bangkok Smart Factory ผลิตพลังงานได้ 742.8 kWh วันนี้', n2Title: 'ควรตรวจสอบการสื่อสารของมิเตอร์', n2Body: 'METER-01 รายงานการเชื่อมต่อไม่เสถียรเป็นเวลา 2 นาที', n3Title: 'รายงานประสิทธิภาพรายเดือนพร้อมแล้ว', n3Body: 'สรุปประสิทธิภาพโรงงานประจำเดือนสิงหาคมพร้อมให้ตรวจสอบแล้ว' },
  settings: { title: 'ตั้งค่า', desc: 'จัดการการแสดงผลและค่าพื้นที่ทำงานของ Prototype', appearance: 'รูปแบบการแสดงผล', appearanceDesc: 'เลือกรูปแบบหน้าตาของระบบบนเบราว์เซอร์นี้', language: 'ภาษา', languageDesc: 'เลือกภาษาที่ใช้ในส่วนต่าง ๆ ของระบบ', workspace: 'พื้นที่ทำงาน', workspaceDesc: 'ข้อมูลพื้นที่ทำงานของ Prototype', workspaceName: 'ชื่อพื้นที่ทำงาน', mode: 'โหมดข้อมูล', mockData: 'ข้อมูลจำลองเท่านั้น', note: 'ระบบจะจดจำธีมและภาษาที่เลือกไว้ในเบราว์เซอร์นี้' },
  time: { justNow: 'เมื่อสักครู่', minAgo: 'นาทีที่แล้ว' }
} as const;
