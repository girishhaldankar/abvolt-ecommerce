/* ══════════════════════════════════════════════════════════════════
   QUBI Extensions System  —  FIXED
   Fixes applied:
     1. DOMContentLoaded -> window load  (script loads after event fires)
     2. rebuildToolbox() uses workspace.updateToolbox() directly — no
        private Blockly internals (toolboxDef_ removed entirely)
     3. Toolbox XML captured cleanly via workspace.options.languageTree
        in QUBI.js right after Blockly.inject(), stored as a string on
        window._QUBI_TOOLBOX_XML
     4. _extInit() runs via 'load' event (or immediately if already loaded)
   ══════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════
   EXTENSION REGISTRY
   ══════════════════════════════════════════════════════════════════ */
const QUBI_EXTENSIONS = [
  {
    id: 'motor_driver',
    name: 'Motor Driver',
    subtitle: 'MX1508 dual motor control via PWM',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>',
    colour: '#E53935',
    description: 'Drive two DC motors independently using the MX1508 dual motor driver. Speed (0-255) and direction are controlled with 4 PWM pins - no separate enable pins needed. Blocks cover forward, backward, stop, tank turn, and coasting.',
    boards: ['MX1508'],
    blocks: [
      { type: 'motor_run',   label: 'Run motor' },
      { type: 'motor_stop',  label: 'Stop motor' },
      { type: 'motor_turn',  label: 'Tank turn' },
      { type: 'motor_coast', label: 'Coast (both off)' },
    ],
    installed: false,
  },
  {
    id: 'sensor_ext',
    name: 'Sensor Extension',
    subtitle: 'DHT22 - Soil - Gas - IR - Ultrasonic',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    colour: '#00897B',
    description: 'Read a wide range of sensors from the QUBI extension board: temperature and humidity (DHT22), soil moisture, MQ gas sensor, IR obstacle detection, and HC-SR04 ultrasonic distance. All include automatic pin and library setup.',
    boards: ['QUBI Sensor Hat'],
    blocks: [
      { type: 'dht_temp',        label: 'DHT22 temperature' },
      { type: 'dht_humid',       label: 'DHT22 humidity' },
      { type: 'ds18b20_temp',    label: 'DS18B20 temperature' },
      { type: 'soil_moisture',   label: 'Soil moisture %' },
      { type: 'gas_level',       label: 'Gas/smoke level' },
      { type: 'sound_level',     label: 'Sound level' },
      { type: 'sound_detected',  label: 'Sound detected' },
      { type: 'ir_obstacle',     label: 'IR obstacle detected' },
      { type: 'ultrasonic_cm',   label: 'Ultrasonic distance cm' },
      { type: 'sharp_ir_cm',     label: 'Sharp IR distance cm' },
      { type: 'pir_motion',      label: 'PIR motion detected' },
      { type: 'flame_detected',  label: 'Flame detected' },
      { type: 'flame_intensity', label: 'Flame intensity' },
      { type: 'rain_level',      label: 'Rain level' },
      { type: 'touch_sensor',    label: 'Touch sensor' },
      { type: 'hall_sensor',     label: 'Hall/magnet detected' },
      { type: 'tilt_sensor',     label: 'Tilt detected' },
      { type: 'vibration_sensor',label: 'Vibration detected' },
      { type: 'ldr_analog',      label: 'Light level (LDR)' },
      { type: 'potentiometer',   label: 'Potentiometer' },
      { type: 'line_sensor',     label: 'Line sensor' },
      { type: 'encoder_count',   label: 'Encoder count' },
      { type: 'encoder_reset',   label: 'Reset encoder' },
      { type: 'joystick_axis',   label: 'Joystick axis' },
      { type: 'color_read',      label: 'TCS3200 color' },
      { type: 'relay_set',       label: 'Relay ON/OFF' },
    ],
    installed: false,
  },
  {
    id: 'servo_ext',
    name: 'Servo Controller',
    subtitle: 'Up to 4 servo motors via PWM',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/><path d="M12 12l4-4"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    colour: '#7B1FA2',
    description: 'Precisely position up to 4 servo motors (0-180 degrees). Set angle, sweep between positions, or detach the servo to save power. Uses ESP32 hardware PWM via the ESP32Servo library.',
    boards: ['QUBI Servo Header'],
    blocks: [
      { type: 'servo_angle',  label: 'Set servo angle' },
      { type: 'servo_sweep',  label: 'Sweep servo' },
      { type: 'servo_detach', label: 'Detach servo' },
    ],
    installed: false,
  },
  {
    id: 'oled_ext',
    name: 'OLED Display',
    subtitle: 'SSD1306 128x64 I2C display',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M6 20h12M9 16v4M15 16v4"/></svg>',
    colour: '#0277BD',
    description: 'Draw text, lines and rectangles on a 128x64 OLED display over I2C. Uses the Adafruit SSD1306 library. Connect to the QUBI I2C extension port (SDA/SCL).',
    boards: ['SSD1306 OLED'],
    blocks: [
      { type: 'oled_init',  label: 'Initialize OLED' },
      { type: 'oled_print', label: 'Print text' },
      { type: 'oled_clear', label: 'Clear display' },
      { type: 'oled_line',  label: 'Draw line' },
      { type: 'oled_rect',  label: 'Draw rectangle' },
    ],
    installed: false,
  },
  {
    id: 'i2c_sensors',
    name: 'I2C Sensors',
    subtitle: 'BMP280 · AHT10 · APDS9960 · ADS1115 · PCF8591 · BH1750 · INA219 · MAX30102 · DS3231',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>',
    colour: '#1565C0',
    description: 'I2C sensors that connect via SDA/SCL pins: BMP280 pressure & altitude, AHT10 temperature & humidity, APDS9960 gesture & colour, ADS1115 16-bit ADC, PCF8591 DAC/ADC, BH1750 light (lux), INA219 current & voltage, MAX30102 heart rate & SpO2, and DS3231 real-time clock.',
    boards: ['I2C header (SDA/SCL)'],
    blocks: [
      { type: 'bmp280_temp',      label: 'BMP280 temperature' },
      { type: 'bmp280_pressure',  label: 'BMP280 pressure (hPa)' },
      { type: 'bmp280_altitude',  label: 'BMP280 altitude (m)' },
      { type: 'aht10_temp',       label: 'AHT10 temperature' },
      { type: 'aht10_humid',      label: 'AHT10 humidity' },
      { type: 'apds_gesture',     label: 'APDS9960 gesture' },
      { type: 'apds_colour_r',    label: 'APDS9960 red' },
      { type: 'apds_colour_g',    label: 'APDS9960 green' },
      { type: 'apds_colour_b',    label: 'APDS9960 blue' },
      { type: 'ads1115_read',     label: 'ADS1115 read channel' },
      { type: 'bh1750_lux',       label: 'BH1750 light (lux)' },
      { type: 'ina219_voltage',   label: 'INA219 voltage (V)' },
      { type: 'ina219_current',   label: 'INA219 current (mA)' },
      { type: 'ina219_power',     label: 'INA219 power (mW)' },
      { type: 'max30102_hr',      label: 'MAX30102 heart rate' },
      { type: 'max30102_spo2',    label: 'MAX30102 SpO2 (%)' },
      { type: 'ds3231_hour',      label: 'DS3231 hour' },
      { type: 'ds3231_minute',    label: 'DS3231 minute' },
      { type: 'ds3231_second',    label: 'DS3231 second' },
      { type: 'ds3231_day',       label: 'DS3231 day' },
      { type: 'ds3231_month',     label: 'DS3231 month' },
      { type: 'ds3231_year',      label: 'DS3231 year' },
      { type: 'ds3231_temp',      label: 'DS3231 temperature' },
      { type: 'ds3231_set_time',  label: 'DS3231 set time' },
    ],
    installed: false,
  },
  {
    id: 'uart_sensors',
    name: 'UART / Serial Sensors',
    subtitle: 'GPS · Fingerprint · RFID · LD2410 · PM2.5 · Laser Distance',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 6l4-4 4 4"/><path d="M12 2v10.5"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 18h.01M10 18h.01"/></svg>',
    colour: '#6A1B9A',
    description: 'UART/Serial sensors using TX/RX pins: GPS (TinyGPS++), fingerprint scanner (R307/R503), RFID reader (RDM6300 125kHz), LD2410 mmWave presence sensor, PMS5003 PM2.5 air quality, and TF-Luna laser distance meter. Each block lets you pick the Serial port and pins.',
    boards: ['Any ESP32 UART header'],
    blocks: [
      { type: 'gps_init',       label: 'GPS init' },
      { type: 'gps_update',     label: 'GPS update (call in loop)' },
      { type: 'gps_lat',        label: 'GPS latitude' },
      { type: 'gps_lng',        label: 'GPS longitude' },
      { type: 'gps_alt',        label: 'GPS altitude (m)' },
      { type: 'gps_speed',      label: 'GPS speed (km/h)' },
      { type: 'gps_sats',       label: 'GPS satellites' },
      { type: 'gps_valid',      label: 'GPS location valid?' },
      { type: 'fp_init',        label: 'Fingerprint init' },
      { type: 'fp_enroll',      label: 'Enroll fingerprint' },
      { type: 'fp_match',       label: 'Fingerprint match ID' },
      { type: 'fp_delete',      label: 'Delete fingerprint ID' },
      { type: 'rfid_init',      label: 'RFID init (RDM6300)' },
      { type: 'rfid_available', label: 'RFID card present?' },
      { type: 'rfid_read',      label: 'RFID read card ID' },
      { type: 'ld2410_init',    label: 'LD2410 init' },
      { type: 'ld2410_present', label: 'LD2410 presence detected?' },
      { type: 'ld2410_dist',    label: 'LD2410 distance (cm)' },
      { type: 'pms_init',       label: 'PMS5003 init' },
      { type: 'pms_pm25',       label: 'PM2.5 reading (µg/m³)' },
      { type: 'pms_pm10',       label: 'PM10 reading (µg/m³)' },
    ],
    installed: false,
  },
];

/* ══════════════════════════════════════════════════════════════════
   PERSISTED STATE
   ══════════════════════════════════════════════════════════════════ */
function loadInstalledExtensions() {
  try {
    var saved = JSON.parse(localStorage.getItem('qubi_extensions') || '[]');
    saved.forEach(function(id) {
      var ext = QUBI_EXTENSIONS.find(function(e) { return e.id === id; });
      if (ext) ext.installed = true;
    });
  } catch(e) {}
}

function saveInstalledExtensions() {
  var ids = QUBI_EXTENSIONS.filter(function(e) { return e.installed; }).map(function(e) { return e.id; });
  localStorage.setItem('qubi_extensions', JSON.stringify(ids));
}

/* ══════════════════════════════════════════════════════════════════
   BLOCK DEFINITIONS
   ══════════════════════════════════════════════════════════════════ */

/* -------------------------------------------------------------------
   MOTOR DRIVER  -  MX1508
   Pins are hardwired to the QUBI board layout:
     Motor 1: IN1 = GPIO 12, IN2 = GPIO 15
     Motor 2: IN3 = GPIO 14, IN4 = GPIO 25
   Forward:  PWM on IN1, 0 on IN2
   Backward: 0 on IN1, PWM on IN2
   Stop/Coast: 0 on both
------------------------------------------------------------------- */
var MOTOR_COLOUR = '#E53935';

// Fixed pin assignments — hardwired to QUBI board
const _motorSetup = () => {     //MX1508 Motor Driver
    includeStatements['motor'] = '// MX1508 Dual Motor Driver';
    globalVariables['motor'] =
      '#define MX_A1 12\n#define MX_B1 15\n' +
      '#define MX_A2 14\n#define MX_B2 25';
    setupStatements['motor'] =
      '  ledcAttach(MX_A1, 1000, 8); ledcAttach(MX_B1, 1000, 8);\n' +
      '  ledcAttach(MX_A2, 1000, 8); ledcAttach(MX_B2, 1000, 8);\n';
  }

const _mxWrite = (in1, in2, dir, spdExpr) => {
  var s = 'constrain(' + spdExpr + ', 0, 255)';
  if (dir === 'FWD') return '  ledcWrite(' + in1 + ', ' + s + '); ledcWrite(' + in2 + ', 0);\n';
  if (dir === 'BWD') return '  ledcWrite(' + in1 + ', 0); ledcWrite(' + in2 + ', ' + s + ');\n';
  return '  ledcWrite(' + in1 + ', 0); ledcWrite(' + in2 + ', 0);\n';
}

/* ── Run motor ── */
Blockly.Blocks['motor_run'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Run motor')
      .appendField(new Blockly.FieldDropdown([['1','1'],['2','2'],['3','3'],['4','4']]), 'MOTOR')
      .appendField(new Blockly.FieldDropdown([['Forward','FWD'],['Backward','BWD']]), 'DIR')
      .appendField('speed');
    this.appendValueInput('SPEED').setCheck('Number');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(MOTOR_COLOUR);
    this.setTooltip('Run a motor forward or backward at a given speed (0-255).');
  }
};
arduinoGenerator.forBlock['motor_run'] = function(b) {
  _motorSetup();
  var motor = b.getFieldValue('MOTOR');
  var dir   = b.getFieldValue('DIR');
  var spd   = arduinoGenerator.valueToCode(b, 'SPEED', arduinoGenerator.ORDER_ATOMIC) || '200';
  var in1 = motor === '1' ? 'MX_A1' : 'MX_A2';
  var in2 = motor === '2' ? 'MX_B2' : 'MX_B1';
  return _mxWrite(in1, in2, dir, spd);
};

/* ── Stop motor ── */
Blockly.Blocks['motor_stop'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Stop motor')
      .appendField(new Blockly.FieldDropdown([['1','1'],['2','2'],['Both','BOTH']]), 'MOTOR');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(MOTOR_COLOUR);
    this.setTooltip('Cut power and let the motor(s) coast to a stop.');
  }
};
arduinoGenerator.forBlock['motor_stop'] = function(b) {
  _motorSetup();
  var motor = b.getFieldValue('MOTOR');
  var code = '';
  if (motor === '1' || motor === 'BOTH') code += '  ledcWrite(MX_A1, 0); ledcWrite(MX_B1, 0);\n';
  if (motor === '2' || motor === 'BOTH') code += '  ledcWrite(MX_A2, 0); ledcWrite(MX_B2, 0);\n';
  return code;
};

/* ── Tank turn ── */
Blockly.Blocks['motor_turn'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Tank turn')
      .appendField(new Blockly.FieldDropdown([['Left','LEFT'],['Right','RIGHT']]), 'DIR')
      .appendField('speed');
    this.appendValueInput('SPEED').setCheck('Number');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(MOTOR_COLOUR);
    this.setTooltip('Spin in place: Motor 1 and 2 run opposite directions.');
  }
};
arduinoGenerator.forBlock['motor_turn'] = function(b) {
  _motorSetup();
  var dir = b.getFieldValue('DIR');
  var spd = arduinoGenerator.valueToCode(b, 'SPEED', arduinoGenerator.ORDER_ATOMIC) || '180';
  var s = 'constrain(' + spd + ', 0, 255)';
  if (dir === 'LEFT') {
    // Left:  A backward, B forward
    return '  ledcWrite(MX_A1, 0); ledcWrite(MX_B1, ' + s + ');\n' +
           '  ledcWrite(MX_A2, ' + s + '); ledcWrite(MX_B2, 0);\n';
  } else {
    // Right: A forward, B backward
    return '  ledcWrite(MX_A1, ' + s + '); ledcWrite(MX_B1, 0);\n' +
           '  ledcWrite(MX_A2, 0); ledcWrite(MX_B2, ' + s + ');\n';
  }
};

/* ── Coast both ── */
Blockly.Blocks['motor_coast'] = {
  init: function() {
    this.appendDummyInput().appendField('Coast — both motors off');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(MOTOR_COLOUR);
    this.setTooltip('Set all four MX1508 pins to 0. Both motors glide freely.');
  }
};
arduinoGenerator.forBlock['motor_coast'] = function(b) {
  _motorSetup();
  return '  ledcWrite(MX_A1, 0); ledcWrite(MX_B1, 0);\n' +
         '  ledcWrite(MX_A2, 0); ledcWrite(MX_B2, 0);\n';
};

/* -------------------------------------------------------------------
   SENSOR EXTENSION
   All sensors are 3-pin (VCC, GND, SIG) or 4-pin (VCC, GND, TRIG, ECHO).
   The signal/data pin is selected directly on each block by the user.
   No global #defines — pin numbers are inlined into the generated code.

   3-pin sensors:
     DHT22      — VCC, GND, DATA   → user picks DATA pin
     Soil moist — VCC, GND, AO     → user picks analog pin
     MQ gas     — VCC, GND, AO     → user picks analog pin (uses AO for 0-100%)
     IR obstacle— VCC, GND, OUT    → user picks digital pin

   4-pin sensors:
     HC-SR04    — VCC, GND, TRIG, ECHO → user picks TRIG + ECHO pins
------------------------------------------------------------------- */
var SENSOR_COLOUR = '#00897B';

/* ESP32 GPIO pins available for selection (excludes flash/SPI reserved) */
var GPIO_PINS = [
  ['GPIO 2',  '2'],  ['GPIO 4',  '4'],  ['GPIO 5',  '5'],
  ['GPIO 12', '12'], ['GPIO 13', '13'], ['GPIO 14', '14'],
  ['GPIO 15', '15'], ['GPIO 16', '16'], ['GPIO 17', '17'],
  ['GPIO 18', '18'], ['GPIO 19', '19'], ['GPIO 21', '21'],
  ['GPIO 22', '22'], ['GPIO 23', '23'], ['GPIO 25', '25'],
  ['GPIO 26', '26'], ['GPIO 27', '27'], ['GPIO 32', '32'],
  ['GPIO 33', '33'], ['GPIO 34', '34'], ['GPIO 35', '35'],
  ['GPIO 36', '36'], ['GPIO 39', '39']
];

/* ── DHT22 — 3 pins: VCC, GND, DATA ── */
Blockly.Blocks['dht_temp'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('DHT22 temperature (C)  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, DATA. Read temperature in Celsius from DHT22.');
  }
};
arduinoGenerator.forBlock['dht_temp'] = function(b) {
  var pin = b.getFieldValue('PIN');
  var key = 'dht_' + pin;
  if (window.includeStatements) window.includeStatements['dht'] = '#include <DHT.h>';
  if (window.globalVariables && !window.globalVariables[key]) {
    window.globalVariables[key] = 'DHT dht_' + pin + '(' + pin + ', DHT22);';
  }
  if (window.setupStatements && !window.setupStatements[key]) {
    window.setupStatements[key] = '  dht_' + pin + '.begin();\n';
  }
  return ['dht_' + pin + '.readTemperature()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['dht_humid'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('DHT22 humidity (%)  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, DATA. Read relative humidity (0-100%) from DHT22.');
  }
};
arduinoGenerator.forBlock['dht_humid'] = function(b) {
  var pin = b.getFieldValue('PIN');
  var key = 'dht_' + pin;
  if (window.includeStatements) window.includeStatements['dht'] = '#include <DHT.h>';
  if (window.globalVariables && !window.globalVariables[key]) {
    window.globalVariables[key] = 'DHT dht_' + pin + '(' + pin + ', DHT22);';
  }
  if (window.setupStatements && !window.setupStatements[key]) {
    window.setupStatements[key] = '  dht_' + pin + '.begin();\n';
  }
  return ['dht_' + pin + '.readHumidity()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ── Soil Moisture — 3 pins: VCC, GND, AO ── */
Blockly.Blocks['soil_moisture'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Soil moisture (%)  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, AO. Returns 0 (dry) to 100 (wet). Connect AO to an ADC-capable pin.');
  }
};
arduinoGenerator.forBlock['soil_moisture'] = function(b) {
  var pin = b.getFieldValue('PIN');
  // map(raw, wet_val, dry_val, 0, 100) — ESP32 ADC 0-4095, wet=low raw
  return ['map(analogRead(' + pin + '), 4095, 0, 0, 100)', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ── MQ Gas Sensor — 4 pins: VCC, GND, AO, DO (we read AO) ── */
Blockly.Blocks['gas_level'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Gas / smoke level (0-100)  AO pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('4-pin: VCC, GND, AO, DO. Reads the analog output (AO) for 0-100% gas concentration. Connect AO to an ADC pin.');
  }
};
arduinoGenerator.forBlock['gas_level'] = function(b) {
  var pin = b.getFieldValue('PIN');
  return ['map(analogRead(' + pin + '), 0, 4095, 0, 100)', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ── IR Obstacle — 3 pins: VCC, GND, OUT ── */
Blockly.Blocks['ir_obstacle'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('IR obstacle detected  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Boolean');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, OUT. Returns true when an obstacle is detected (OUT goes LOW).');
  }
};
arduinoGenerator.forBlock['ir_obstacle'] = function(b) {
  var pin = b.getFieldValue('PIN');
  if (window.setupStatements) {
    window.setupStatements['ir_' + pin] = '  pinMode(' + pin + ', INPUT);\n';
  }
  return ['(digitalRead(' + pin + ') == LOW)', arduinoGenerator.ORDER_EQUALITY];
};

/* ── HC-SR04 Ultrasonic — 4 pins: VCC, GND, TRIG, ECHO ── */
Blockly.Blocks['ultrasonic_cm'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Ultrasonic distance (cm)  TRIG')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'TRIG')
      .appendField('ECHO')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'ECHO');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('4-pin: VCC, GND, TRIG, ECHO. Returns distance in centimetres. Max range ~400 cm.');
  }
};
arduinoGenerator.forBlock['ultrasonic_cm'] = function(b) {
  var trig = b.getFieldValue('TRIG');
  var echo = b.getFieldValue('ECHO');
  var fnKey = 'us_fn_' + trig + '_' + echo;
  if (window.setupStatements && !window.setupStatements['us_' + trig + '_' + echo]) {
    window.setupStatements['us_' + trig + '_' + echo] =
      '  pinMode(' + trig + ', OUTPUT);\n  pinMode(' + echo + ', INPUT);\n';
  }
  // Store helper function in _extraFunctions so it's emitted as a proper C function
  if (arduinoGenerator._extraFunctions && !arduinoGenerator._extraFunctions[fnKey]) {
    arduinoGenerator._extraFunctions[fnKey] =
      'float readUS_' + trig + '_' + echo + '() {\n' +
      '  digitalWrite(' + trig + ', LOW); delayMicroseconds(2);\n' +
      '  digitalWrite(' + trig + ', HIGH); delayMicroseconds(10);\n' +
      '  digitalWrite(' + trig + ', LOW);\n' +
      '  long dur = pulseIn(' + echo + ', HIGH, 30000);\n' +
      '  return dur == 0 ? -1.0 : dur * 0.0343 / 2.0;\n' +
      '}\n';
  }
  return ['readUS_' + trig + '_' + echo + '()', arduinoGenerator.ORDER_FUNCTION_CALL];
};



/* ── DS18B20 Waterproof Temperature — 3 pins: VCC, GND, DATA (needs 4.7k pullup) ── */
Blockly.Blocks['ds18b20_temp'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('DS18B20 temperature (C)  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, DATA (4.7k pullup to VCC). Waterproof digital temperature sensor. Great for liquids.');
  }
};
arduinoGenerator.forBlock['ds18b20_temp'] = function(b) {
  var pin = b.getFieldValue('PIN');
  var key = 'ds18_' + pin;
  if (window.includeStatements) {
    window.includeStatements['onewire'] = '#include <OneWire.h>';
    window.includeStatements['ds18b20'] = '#include <DallasTemperature.h>';
  }
  if (window.globalVariables && !window.globalVariables[key]) {
    window.globalVariables[key] =
      'OneWire _ow' + pin + '(' + pin + ');\nDallasTemperature _ds' + pin + '(&_ow' + pin + ');';
    window.setupStatements[key] = '  _ds' + pin + '.begin();\n';
  }
  return ['(_ds' + pin + '.requestTemperatures(), _ds' + pin + '.getTempCByIndex(0))', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ── Sound/Noise Sensor — 3 pins: VCC, GND, AO ── */
Blockly.Blocks['sound_level'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Sound level (0-100)  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, AO. Microphone / sound sensor analog output. 0 = silent, 100 = loud.');
  }
};
arduinoGenerator.forBlock['sound_level'] = function(b) {
  var pin = b.getFieldValue('PIN');
  return ['map(analogRead(' + pin + '), 0, 4095, 0, 100)', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ── Sound Digital Detect — 3 pins: VCC, GND, DO ── */
Blockly.Blocks['sound_detected'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Sound detected  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Boolean');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, DO. Returns true when sound exceeds the onboard threshold (DO goes LOW).');
  }
};
arduinoGenerator.forBlock['sound_detected'] = function(b) {
  var pin = b.getFieldValue('PIN');
  if (window.setupStatements) window.setupStatements['snd_' + pin] = '  pinMode(' + pin + ', INPUT);\n';
  return ['(digitalRead(' + pin + ') == LOW)', arduinoGenerator.ORDER_EQUALITY];
};

/* ── PIR Motion Sensor — 3 pins: VCC, GND, OUT ── */
Blockly.Blocks['pir_motion'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('PIR motion detected  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Boolean');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, OUT. Returns true when motion is detected (OUT goes HIGH).');
  }
};
arduinoGenerator.forBlock['pir_motion'] = function(b) {
  var pin = b.getFieldValue('PIN');
  if (window.setupStatements) window.setupStatements['pir_' + pin] = '  pinMode(' + pin + ', INPUT);\n';
  return ['(digitalRead(' + pin + ') == HIGH)', arduinoGenerator.ORDER_EQUALITY];
};

/* ── Flame Sensor — 3 pins: VCC, GND, DO (digital detect) ── */
Blockly.Blocks['flame_detected'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Flame detected  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Boolean');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, DO. Returns true when a flame is detected (DO goes LOW).');
  }
};
arduinoGenerator.forBlock['flame_detected'] = function(b) {
  var pin = b.getFieldValue('PIN');
  if (window.setupStatements) window.setupStatements['fl_' + pin] = '  pinMode(' + pin + ', INPUT);\n';
  return ['(digitalRead(' + pin + ') == LOW)', arduinoGenerator.ORDER_EQUALITY];
};

/* ── Flame Analog Intensity — 3 pins: VCC, GND, AO ── */
Blockly.Blocks['flame_intensity'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Flame intensity (0-100)  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, AO. Analog flame intensity — 0 = no flame, 100 = strong flame detected.');
  }
};
arduinoGenerator.forBlock['flame_intensity'] = function(b) {
  var pin = b.getFieldValue('PIN');
  // Flame sensor: higher raw = less light/flame, so invert
  return ['map(analogRead(' + pin + '), 4095, 0, 0, 100)', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ── Rain / Water Sensor — 3 pins: VCC, GND, AO ── */
Blockly.Blocks['rain_level'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Rain level (0-100)  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, AO. Returns 0 (dry) to 100 (fully wet). Good for rain/water detection.');
  }
};
arduinoGenerator.forBlock['rain_level'] = function(b) {
  var pin = b.getFieldValue('PIN');
  return ['map(analogRead(' + pin + '), 4095, 0, 0, 100)', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ── Touch Sensor (TTP223) — 3 pins: VCC, GND, OUT ── */
Blockly.Blocks['touch_sensor'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Touch sensor pressed  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Boolean');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, OUT. Returns true when the capacitive pad is touched (OUT goes HIGH).');
  }
};
arduinoGenerator.forBlock['touch_sensor'] = function(b) {
  var pin = b.getFieldValue('PIN');
  if (window.setupStatements) window.setupStatements['tp_' + pin] = '  pinMode(' + pin + ', INPUT);\n';
  return ['(digitalRead(' + pin + ') == HIGH)', arduinoGenerator.ORDER_EQUALITY];
};

/* ── Reed Switch / Hall Effect — 3 pins: VCC, GND, OUT ── */
Blockly.Blocks['hall_sensor'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Hall / magnet detected  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Boolean');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, OUT. Returns true when a magnet is near the Hall effect or reed switch sensor (OUT goes LOW).');
  }
};
arduinoGenerator.forBlock['hall_sensor'] = function(b) {
  var pin = b.getFieldValue('PIN');
  if (window.setupStatements) window.setupStatements['hl_' + pin] = '  pinMode(' + pin + ', INPUT_PULLUP);\n';
  return ['(digitalRead(' + pin + ') == LOW)', arduinoGenerator.ORDER_EQUALITY];
};

/* ── Tilt Switch — 3 pins: VCC, GND, OUT ── */
Blockly.Blocks['tilt_sensor'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Tilt detected  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Boolean');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, OUT. Returns true when the module is tilted (ball switch opens, OUT goes LOW).');
  }
};
arduinoGenerator.forBlock['tilt_sensor'] = function(b) {
  var pin = b.getFieldValue('PIN');
  if (window.setupStatements) window.setupStatements['tlt_' + pin] = '  pinMode(' + pin + ', INPUT_PULLUP);\n';
  return ['(digitalRead(' + pin + ') == LOW)', arduinoGenerator.ORDER_EQUALITY];
};

/* ── Vibration Sensor — 3 pins: VCC, GND, DO ── */
Blockly.Blocks['vibration_sensor'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Vibration detected  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Boolean');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, DO. Returns true when vibration or shock is detected (DO goes LOW).');
  }
};
arduinoGenerator.forBlock['vibration_sensor'] = function(b) {
  var pin = b.getFieldValue('PIN');
  if (window.setupStatements) window.setupStatements['vib_' + pin] = '  pinMode(' + pin + ', INPUT);\n';
  return ['(digitalRead(' + pin + ') == LOW)', arduinoGenerator.ORDER_EQUALITY];
};

/* ── Photoresistor / LDR (external) — 3 pins: VCC, GND, AO ── */
Blockly.Blocks['ldr_analog'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Light level (0-100)  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, AO. Analog light level from an LDR module. 0 = dark, 100 = bright.');
  }
};
arduinoGenerator.forBlock['ldr_analog'] = function(b) {
  var pin = b.getFieldValue('PIN');
  return ['map(analogRead(' + pin + '), 0, 4095, 0, 100)', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ── Potentiometer — 3 pins: VCC, GND, WIPER ── */
Blockly.Blocks['potentiometer'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Potentiometer (0-100)  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, WIPER. Reads the rotary or slider position as 0 (min) to 100 (max).');
  }
};
arduinoGenerator.forBlock['potentiometer'] = function(b) {
  var pin = b.getFieldValue('PIN');
  return ['map(analogRead(' + pin + '), 0, 4095, 0, 100)', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ── Sharp GP2Y IR Distance — 3 pins: VCC, GND, VOUT ── */
Blockly.Blocks['sharp_ir_cm'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Sharp IR distance (cm)  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, VOUT. Analog IR distance sensor (GP2Y0A21). Range ~10-80 cm. Output is non-linear.');
  }
};
arduinoGenerator.forBlock['sharp_ir_cm'] = function(b) {
  var pin = b.getFieldValue('PIN');
  // Approximate formula for GP2Y0A21 with 3.3V ADC: distance = 4800/(raw*3.3/4095*1000 - 20)
  return ['(4800.0 / (analogRead(' + pin + ') * 3.3 / 4095.0 * 1000.0 - 20.0))', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ── Color Sensor TCS3200 — 4 pins: VCC, GND, S2, S3 (+S0,S1 hardwired to VCC for 100% scaling) ── */
Blockly.Blocks['color_read'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('TCS3200 color  S2')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'S2')
      .appendField('S3')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'S3')
      .appendField('OUT')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'OUT')
      .appendField(new Blockly.FieldDropdown([['Red','RED'],['Green','GREEN'],['Blue','BLUE'],['Clear','CLEAR']]), 'CH');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('4-pin: VCC, GND, S2, S3 (+OUT). TCS3200 color sensor. Returns pulse frequency for selected color channel (0=none, higher=more of that color).');
  }
};
arduinoGenerator.forBlock['color_read'] = function(b) {
  var s2 = b.getFieldValue('S2'), s3 = b.getFieldValue('S3'), out = b.getFieldValue('OUT');
  var ch = b.getFieldValue('CH');
  var key = 'tcs_' + s2 + '_' + s3 + '_' + out;
  if (window.setupStatements && !window.setupStatements[key]) {
    window.setupStatements[key] =
      '  pinMode(' + s2 + ', OUTPUT); pinMode(' + s3 + ', OUTPUT); pinMode(' + out + ', INPUT);\n';
  }
  var s2v = {RED:'LOW', GREEN:'HIGH', BLUE:'LOW',  CLEAR:'HIGH'}[ch];
  var s3v = {RED:'LOW', GREEN:'HIGH', BLUE:'HIGH', CLEAR:'LOW'}[ch];
  var fnKey = 'tcs_fn_' + s2 + '_' + s3 + '_' + out;
  if (window.globalVariables && !window.globalVariables[fnKey]) {
    window.globalVariables[fnKey] =
      'long readTCS_' + s2 + '_' + s3 + '_' + out + '(bool s2v, bool s3v) {\n' +
      '  digitalWrite(' + s2 + ', s2v); digitalWrite(' + s3 + ', s3v);\n' +
      '  return pulseIn(' + out + ', LOW, 100000);\n' +
      '}\n';
  }
  return ['readTCS_' + s2 + '_' + s3 + '_' + out + '(' + s2v + ', ' + s3v + ')', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ── Line Follower (TCRT5000) — 3 pins: VCC, GND, DO ── */
Blockly.Blocks['line_sensor'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Line sensor  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN')
      .appendField(new Blockly.FieldDropdown([['on line','LINE'],['off line','NOLINE']]), 'STATE');
    this.setOutput(true, 'Boolean');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, DO. TCRT5000 IR reflective sensor. Returns true when the selected line state is detected (DO LOW = dark/line).');
  }
};
arduinoGenerator.forBlock['line_sensor'] = function(b) {
  var pin = b.getFieldValue('PIN');
  var state = b.getFieldValue('STATE');
  if (window.setupStatements) window.setupStatements['ln_' + pin] = '  pinMode(' + pin + ', INPUT);\n';
  var cmp = state === 'LINE' ? '== LOW' : '== HIGH';
  return ['(digitalRead(' + pin + ') ' + cmp + ')', arduinoGenerator.ORDER_EQUALITY];
};

/* ── Encoder (Rotary / Speed) — 3 pins: VCC, GND, SIG ── */
Blockly.Blocks['encoder_count'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Encoder count  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, SIG. Hall or optical encoder pulse counter. Returns cumulative pulse count since reset.');
  }
};
arduinoGenerator.forBlock['encoder_count'] = function(b) {
  var pin = b.getFieldValue('PIN');
  var key = 'enc_' + pin;
  if (window.globalVariables && !window.globalVariables[key]) {
    window.globalVariables[key] = 'volatile long _enc' + pin + ' = 0;' +
      '\nvoid IRAM_ATTR _encISR' + pin + '() { _enc' + pin + '++; }';
    window.setupStatements[key] =
      '  pinMode(' + pin + ', INPUT_PULLUP);\n' +
      '  attachInterrupt(digitalPinToInterrupt(' + pin + '), _encISR' + pin + ', RISING);\n';
  }
  return ['_enc' + pin, arduinoGenerator.ORDER_ATOMIC];
};
Blockly.Blocks['encoder_reset'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Reset encoder  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('Reset the encoder pulse counter to zero for the given pin.');
  }
};
arduinoGenerator.forBlock['encoder_reset'] = function(b) {
  var pin = b.getFieldValue('PIN');
  return '  _enc' + pin + ' = 0;\n';
};

/* ── Joystick Module — 4 pins: VCC, GND, VRx, VRy (+ button optional) ── */
Blockly.Blocks['joystick_axis'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Joystick')
      .appendField(new Blockly.FieldDropdown([['X axis','X'],['Y axis','Y']]), 'AXIS')
      .appendField('pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setOutput(true, 'Number');
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('4-pin: VCC, GND, VRx, VRy. Reads joystick axis as -100 to +100. Centre ≈ 0.');
  }
};
arduinoGenerator.forBlock['joystick_axis'] = function(b) {
  var pin = b.getFieldValue('PIN');
  // map 0-4095 to -100 to 100
  return ['map(analogRead(' + pin + '), 0, 4095, -100, 100)', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ── Relay Module — 3 pins: VCC, GND, IN ── */
Blockly.Blocks['relay_set'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Relay  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN')
      .appendField(new Blockly.FieldDropdown([['ON','ON'],['OFF','OFF']]), 'STATE');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(SENSOR_COLOUR);
    this.setTooltip('3-pin: VCC, GND, IN. Turn a relay ON (IN=LOW, active-low module) or OFF (IN=HIGH).');
  }
};
arduinoGenerator.forBlock['relay_set'] = function(b) {
  var pin = b.getFieldValue('PIN');
  var state = b.getFieldValue('STATE');
  if (window.setupStatements) window.setupStatements['rly_' + pin] = '  pinMode(' + pin + ', OUTPUT);\n';
  // Most relay modules are active-LOW
  var val = state === 'ON' ? 'LOW' : 'HIGH';
  return '  digitalWrite(' + pin + ', ' + val + ');\n';
};




/* -------------------------------------------------------------------
   SERVO CONTROLLER
   User picks the signal pin for each servo on the block.
   3-pin: VCC, GND, SIG
------------------------------------------------------------------- */
var SERVO_COLOUR = '#7B1FA2';

function _servoSetup(pin) {
  if (window.includeStatements) {
    window.includeStatements['servo'] = '#include <ESP32Servo.h>';
    var key = 'servo_' + pin;
    if (!window.globalVariables[key]) {
      window.globalVariables[key]  = 'Servo _sv' + pin + ';';
      window.setupStatements[key]  = '  _sv' + pin + '.attach(' + pin + ');\n';
    }
  }
}

Blockly.Blocks['servo_angle'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Set servo  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN')
      .appendField('to');
    this.appendValueInput('ANGLE').setCheck('Number');
    this.appendDummyInput().appendField('degrees');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(SERVO_COLOUR);
    this.setTooltip('3-pin: VCC, GND, SIG. Move a servo to a specific angle (0-180 degrees).');
  }
};
arduinoGenerator.forBlock['servo_angle'] = function(b) {
  var pin   = b.getFieldValue('PIN');
  var angle = arduinoGenerator.valueToCode(b, 'ANGLE', arduinoGenerator.ORDER_ATOMIC) || '90';
  _servoSetup(pin);
  return '  _sv' + pin + '.write(constrain(' + angle + ', 0, 180));\n';
};

Blockly.Blocks['servo_sweep'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Sweep servo  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN')
      .appendField('from')
      .appendField(new Blockly.FieldNumber(0, 0, 180), 'FROM')
      .appendField('to')
      .appendField(new Blockly.FieldNumber(180, 0, 180), 'TO')
      .appendField('delay')
      .appendField(new Blockly.FieldNumber(15, 1, 1000), 'DLY')
      .appendField('ms');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(SERVO_COLOUR);
    this.setTooltip('3-pin: VCC, GND, SIG. Slowly sweep a servo between two angles.');
  }
};
arduinoGenerator.forBlock['servo_sweep'] = function(b) {
  var pin  = b.getFieldValue('PIN');
  var from = b.getFieldValue('FROM');
  var to   = b.getFieldValue('TO');
  var dly  = b.getFieldValue('DLY');
  _servoSetup(pin);
  var dir = parseInt(from) <= parseInt(to) ? '++' : '--';
  return '  for(int _a=' + from + '; _a!=' + to + '; _a' + dir + ') { _sv' + pin + '.write(_a); delay(' + dly + '); }\n' +
         '  _sv' + pin + '.write(' + to + ');\n';
};

Blockly.Blocks['servo_detach'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Detach servo  pin')
      .appendField(new Blockly.FieldDropdown(GPIO_PINS), 'PIN');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(SERVO_COLOUR);
    this.setTooltip('3-pin: VCC, GND, SIG. Release a servo to save power (stops PWM).');
  }
};
arduinoGenerator.forBlock['servo_detach'] = function(b) {
  var pin = b.getFieldValue('PIN');
  _servoSetup(pin);
  return '  _sv' + pin + '.detach();\n';
};

/* -------------------------------------------------------------------
   OLED DISPLAY  -  SSD1306 128x64 via I2C
   4-pin: VCC, GND, SDA, SCL  (I2C — pins fixed by ESP32 hardware)
   Default ESP32 I2C: SDA=21, SCL=22
------------------------------------------------------------------- */
var OLED_COLOUR = '#0277BD';

function _oledSetup() {
  if (window.includeStatements) {
    window.includeStatements['oled'] =
      '#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>';
    if (!window.globalVariables['oled']) {
      window.globalVariables['oled'] =
        '#define OLED_W 128\n#define OLED_H 64\nAdafruit_SSD1306 _oled(OLED_W, OLED_H, &Wire, -1);';
      window.setupStatements['oled'] =
        '  Wire.begin();\n  if(!_oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { Serial.println("OLED not found"); }\n  _oled.clearDisplay(); _oled.display();\n';
    }
  }
}

Blockly.Blocks['oled_init'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Initialize OLED')
      .appendField(new Blockly.FieldDropdown([['128x64','128x64'],['128x32','128x32']]), 'SIZE')
      .appendField('address')
      .appendField(new Blockly.FieldDropdown([['0x3C','0x3C'],['0x3D','0x3D']]), 'ADDR');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(OLED_COLOUR);
    this.setTooltip('4-pin: VCC, GND, SDA (GPIO21), SCL (GPIO22). Init the SSD1306 OLED. Put in On Start.');
  }
};
arduinoGenerator.forBlock['oled_init'] = function(b) {
  var size = b.getFieldValue('SIZE');
  var addr = b.getFieldValue('ADDR');
  var h = size === '128x32' ? '32' : '64';
  if (window.includeStatements) {
    window.includeStatements['oled'] =
      '#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>';
    window.globalVariables['oled'] =
      '#define OLED_W 128\n#define OLED_H ' + h + '\nAdafruit_SSD1306 _oled(OLED_W, OLED_H, &Wire, -1);';
    window.setupStatements['oled'] =
      '  Wire.begin();\n  if(!_oled.begin(SSD1306_SWITCHCAPVCC, ' + addr + ')) { Serial.println("OLED not found"); }\n  _oled.clearDisplay(); _oled.display();\n';
  }
  return '';
};

Blockly.Blocks['oled_print'] = {
  init: function() {
    this.appendValueInput('TEXT').setCheck(['String','Number']).appendField('OLED print');
    this.appendDummyInput()
      .appendField('x').appendField(new Blockly.FieldNumber(0, 0, 127), 'X')
      .appendField('y').appendField(new Blockly.FieldNumber(0, 0, 63), 'Y')
      .appendField('size').appendField(new Blockly.FieldNumber(1, 1, 4), 'SZ');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(OLED_COLOUR);
    this.setTooltip('Print text or a number on the OLED at a given position and text size.');
  }
};
arduinoGenerator.forBlock['oled_print'] = function(b) {
  _oledSetup();
  var text = arduinoGenerator.valueToCode(b, 'TEXT', arduinoGenerator.ORDER_ATOMIC) || '"Hello"';
  var x = b.getFieldValue('X'), y = b.getFieldValue('Y'), sz = b.getFieldValue('SZ');
  return '  _oled.setTextSize(' + sz + '); _oled.setTextColor(SSD1306_WHITE);\n' +
         '  _oled.setCursor(' + x + ', ' + y + '); _oled.print(' + text + '); _oled.display();\n';
};

Blockly.Blocks['oled_clear'] = {
  init: function() {
    this.appendDummyInput().appendField('Clear OLED');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(OLED_COLOUR);
    this.setTooltip('Wipe the OLED screen.');
  }
};
arduinoGenerator.forBlock['oled_clear'] = function(b) {
  _oledSetup();
  return '  _oled.clearDisplay(); _oled.display();\n';
};

Blockly.Blocks['oled_line'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('OLED line  x1').appendField(new Blockly.FieldNumber(0,0,127), 'X1')
      .appendField('y1').appendField(new Blockly.FieldNumber(0,0,63), 'Y1')
      .appendField('x2').appendField(new Blockly.FieldNumber(64,0,127),'X2')
      .appendField('y2').appendField(new Blockly.FieldNumber(32,0,63), 'Y2');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(OLED_COLOUR);
    this.setTooltip('Draw a white line between two points on the OLED.');
  }
};
arduinoGenerator.forBlock['oled_line'] = function(b) {
  _oledSetup();
  return '  _oled.drawLine(' +
    b.getFieldValue('X1') + ', ' + b.getFieldValue('Y1') + ', ' +
    b.getFieldValue('X2') + ', ' + b.getFieldValue('Y2') +
    ', SSD1306_WHITE); _oled.display();\n';
};

Blockly.Blocks['oled_rect'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('OLED rect  x').appendField(new Blockly.FieldNumber(10,0,127),'X')
      .appendField('y').appendField(new Blockly.FieldNumber(10,0,63),'Y')
      .appendField('w').appendField(new Blockly.FieldNumber(60,1,127),'W')
      .appendField('h').appendField(new Blockly.FieldNumber(30,1,63),'H')
      .appendField(new Blockly.FieldDropdown([['outline','OUTLINE'],['filled','FILLED']]), 'STYLE');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(OLED_COLOUR);
    this.setTooltip('Draw an outlined or filled rectangle on the OLED.');
  }
};
arduinoGenerator.forBlock['oled_rect'] = function(b) {
  _oledSetup();
  var x = b.getFieldValue('X'), y = b.getFieldValue('Y');
  var w = b.getFieldValue('W'), h = b.getFieldValue('H');
  var fn = b.getFieldValue('STYLE') === 'FILLED' ? 'fillRect' : 'drawRect';
  return '  _oled.' + fn + '(' + x + ', ' + y + ', ' + w + ', ' + h + ', SSD1306_WHITE); _oled.display();\n';
};


/* ══════════════════════════════════════════════════════════════════
   TOOLBOX REBUILD
   Builds a fresh toolbox config object from the base category list
   plus any installed extension categories, then calls updateToolbox().
   This approach avoids XML string manipulation entirely — no sentinel
   comments, no regex, no serialization roundtrips.
   ══════════════════════════════════════════════════════════════════ */

// Base toolbox category definitions — kept as a JS object so we never
// need to parse or re-serialize XML strings.
var BASE_TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    { kind:'category', name:'Control',   colour:'#7d73ff', contents:[{kind:'block',type:'start'},{kind:'block',type:'forever'},{kind:'block',type:'delay'}] },
    { kind:'category', name:'Display',   colour:'#03A9F4', contents:[{kind:'block',type:'show_leds'},{kind:'block',type:'show_icon'},{kind:'block',type:'show_arrow'},{kind:'block',type:'show_animation'},{kind:'block',type:'show_number'},{kind:'block',type:'show_string'},{kind:'block',type:'set_pixel'},{kind:'block',type:'display_brightness'},{kind:'block',type:'clear_screen'}] },
    { kind:'category', name:'Inputs',    colour:'#dd34ff', contents:[{kind:'block',type:'button_pressed'},{kind:'block',type:'on_button'},{kind:'block',type:'buttons_ab'},{kind:'block',type:'logo_touched'},{kind:'block',type:'on_logo'},{kind:'block',type:'ldr_level'},{kind:'block',type:'ldr_dark'},{kind:'block',type:'mpu_axis'},{kind:'block',type:'mpu_gesture'},{kind:'block',type:'lidar_mm'},{kind:'block',type:'lidar_closer'}] },
    { kind:'category', name:'RGB LEDs', colour:'#ffbf00', contents:[{kind:'block',type:'rgb_colour'},{kind:'block',type:'rgb_set'},{kind:'block',type:'rgb_brightness'},{kind:'block',type:'rgb_rainbow'},{kind:'block',type:'rgb_traffic'},{kind:'block',type:'rgb_off'}] },
    { kind:'category', name:'Music',     colour:'#FF6F00', contents:[{kind:'block',type:'buzzer_note'},{kind:'block',type:'buzzer_melody'},{kind:'block',type:'buzzer_tone'},{kind:'block',type:'buzzer_set'},{kind:'block',type:'buzzer_stop'}] },
    { kind:'category', name:'Pins',      colour:'#9C27B0', contents:[{kind:'block',type:'led_blink'},{kind:'block',type:'digital_write'},{kind:'block',type:'digital_read'},{kind:'block',type:'analog_read'},{kind:'block',type:'analog_write'}] },
    { kind:'category', name:'Wi-Fi',     colour:'#2196F3', contents:[{kind:'block',type:'wifi_connect'},{kind:'block',type:'wifi_connected'},{kind:'block',type:'wifi_ip'},{kind:'block',type:'http_get'},{kind:'block',type:'http_post'},{kind:'block',type:'thingspeak'}] },
    { kind:'category', name:'Bluetooth', colour:'#3F51B5', contents:[{kind:'block',type:'bt_begin'},{kind:'block',type:'bt_available'},{kind:'block',type:'bt_read'},{kind:'block',type:'bt_send'},{kind:'block',type:'bt_on_receive'}] },
    { kind:'category', name:'Loops',     colour:'#ff9800', contents:[{kind:'block',type:'repeat_do'},{kind:'block',type:'while_do'},{kind:'block',type:'for_do'},{kind:'block',type:'break'},{kind:'block',type:'continue'}] },
    { kind:'category', name:'ESP-NOW',   colour:'#00BCD4', contents:[{kind:'block',type:'espnow_init'},{kind:'block',type:'espnow_set_role'},{kind:'block',type:'espnow_add_peer'},{kind:'block',type:'espnow_send_text'},{kind:'block',type:'espnow_send_number'},{kind:'block',type:'espnow_on_receive'},{kind:'block',type:'espnow_received_text'},{kind:'block',type:'espnow_received_number'},{kind:'block',type:'espnow_mac_address'}] },
    { kind:'category', name:'Logic',     colour:'#00e00b', contents:[{kind:'block',type:'controls_if'},{kind:'block',type:'logic_compare'},{kind:'block',type:'logic_operation'},{kind:'block',type:'logic_not'},{kind:'block',type:'logic_boolean'}] },
    { kind:'category', name:'Math',      colour:'#e91e63', contents:[{kind:'block',type:'math_number'},{kind:'block',type:'math_arithmetic'},{kind:'block',type:'math_random'},{kind:'block',type:'math_map'},{kind:'block',type:'math_constrain'},{kind:'block',type:'math_abs'}] },
    { kind:'category', name:'Variables', colour:'#000000', custom:'VARIABLE', contents:[] },
    { kind:'category', name:'Serial',    colour:'#ff261f', contents:[{kind:'block',type:'serial_begin'},{kind:'block',type:'serial_print'},{kind:'block',type:'serial_println'},{kind:'block',type:'serial_read'},{kind:'block',type:'serial_available'}] },
    { kind:'sep' },
    { kind:'category', name:'Advanced',  colour:'#555566', contents:[
      { kind:'category', name:'Functions',     colour:'#6e3aff', contents:[{kind:'block',type:'func_define'},{kind:'block',type:'func_call'},{kind:'block',type:'func_define_return'},{kind:'block',type:'func_call_return'},{kind:'block',type:'func_return'}] },
      { kind:'category', name:'Arrays',        colour:'#00897B', contents:[{kind:'block',type:'array_create'},{kind:'block',type:'array_get'},{kind:'block',type:'array_set'},{kind:'block',type:'array_length'},{kind:'block',type:'array_fill'}] },
      { kind:'category', name:'Text',          colour:'#F06292', contents:[{kind:'block',type:'text_create'},{kind:'block',type:'text_length'},{kind:'block',type:'text_join'},{kind:'block',type:'text_char_at'},{kind:'block',type:'text_contains'},{kind:'block',type:'text_to_number'},{kind:'block',type:'text_number_to'}] },
      { kind:'category', name:'Math Advanced', colour:'#AD1457', contents:[{kind:'block',type:'math_trig'},{kind:'block',type:'math_sqrt'},{kind:'block',type:'math_pow'},{kind:'block',type:'math_floor_ceil'},{kind:'block',type:'math_modulo'},{kind:'block',type:'math_pi'}] },
      { kind:'category', name:'Time',          colour:'#546E7A', contents:[{kind:'block',type:'time_millis'},{kind:'block',type:'time_micros'},{kind:'block',type:'time_elapsed'},{kind:'block',type:'time_every'}] },
      { kind:'category', name:'Game',          colour:'#E65100', contents:[{kind:'block',type:'game_score'},{kind:'block',type:'game_add_score'},{kind:'block',type:'game_lives'},{kind:'block',type:'game_lose_life'},{kind:'block',type:'game_is_over'},{kind:'block',type:'game_show_score'},{kind:'block',type:'game_show_lives'},{kind:'block',type:'game_countdown'}] },
      { kind:'category', name:'Timers',        colour:'#37474F', contents:[{kind:'block',type:'timer_start'},{kind:'block',type:'timer_read'},{kind:'block',type:'timer_reset'},{kind:'block',type:'timer_expired'}] },
    ]},
  ]
};

function buildExtCategoryXML(ext) {
  // Used only for display purposes in the detail panel — not for toolbox injection
  return { kind:'category', name:ext.name, colour:ext.colour,
    contents: ext.blocks.map(function(b) { return { kind:'block', type:b.type }; }) };
}

function rebuildToolbox() {
  if (typeof workspace === 'undefined') return;

  // Deep-clone base toolbox so we never mutate it
  var toolboxDef = JSON.parse(JSON.stringify(BASE_TOOLBOX));

  // Append each installed extension as a new top-level category
  QUBI_EXTENSIONS.forEach(function(ext) {
    if (!ext.installed) return;
    toolboxDef.contents.push({
      kind: 'category',
      name: ext.name,
      colour: ext.colour,
      contents: ext.blocks.map(function(b) { return { kind:'block', type:b.type }; })
    });
  });

  try {
    workspace.updateToolbox(toolboxDef);
  } catch(err) {
    console.warn('QUBI Extensions: toolbox update failed -', err.message);
  }
}

/* ══════════════════════════════════════════════════════════════════
   BADGE
   ══════════════════════════════════════════════════════════════════ */
function updateExtBadge() {
  var count = QUBI_EXTENSIONS.filter(function(e) { return e.installed; }).length;
  var badge = document.getElementById('extBadge');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

/* ══════════════════════════════════════════════════════════════════
   MODAL UI
   ══════════════════════════════════════════════════════════════════ */
function openExtensionsModal() {
  var modal = document.getElementById('extensionsModal');
  if (!modal) return;
  modal.style.display = 'flex';
  renderExtCardList();
  renderExtDetail(null);
}

function closeExtensionsModal() {
  var modal = document.getElementById('extensionsModal');
  if (modal) modal.style.display = 'none';
}

function renderExtCardList() {
  var list = document.getElementById('extCardList');
  if (!list) return;
  list.innerHTML = '';

  QUBI_EXTENSIONS.forEach(function(ext) {
    var card = document.createElement('div');
    card.className = 'ext-card' + (ext.installed ? ' ext-card-installed' : '');
    card.dataset.id = ext.id;
    card.innerHTML =
      '<div class="ext-card-icon" style="color:' + ext.colour + '">' + ext.icon + '</div>' +
      '<div class="ext-card-info">' +
        '<span class="ext-card-name">' + ext.name + '</span>' +
        '<span class="ext-card-sub">' + ext.subtitle + '</span>' +
      '</div>' +
      (ext.installed
        ? '<span class="ext-pill installed">Added</span>'
        : '<span class="ext-pill">Add</span>');

    card.addEventListener('click', function() {
      document.querySelectorAll('.ext-card').forEach(function(c) { c.classList.remove('ext-card-active'); });
      card.classList.add('ext-card-active');
      renderExtDetail(ext);
    });
    list.appendChild(card);
  });
}

function renderExtDetail(ext) {
  var panel = document.getElementById('extDetail');
  if (!panel) return;

  if (!ext) {
    panel.innerHTML =
      '<div class="ext-detail-placeholder">' +
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.3">' +
          '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>' +
        '</svg>' +
        '<p>Select an extension to see details</p>' +
      '</div>';
    return;
  }

  var blockPills = ext.blocks.map(function(bl) {
    return '<span class="ext-block-pill" style="border-color:' + ext.colour + ';color:' + ext.colour + '">' + bl.label + '</span>';
  }).join('');

  var boardPills = ext.boards.map(function(brd) {
    return '<span class="ext-board-pill">' + brd + '</span>';
  }).join('');

  var actionBtn = ext.installed
    ? '<button class="ext-remove-btn" onclick="toggleExtension(\'' + ext.id + '\')">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
          '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>' +
        '</svg> Remove Extension</button>'
    : '<button class="ext-add-btn" style="background:' + ext.colour + '" onclick="toggleExtension(\'' + ext.id + '\')">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
          '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' +
        '</svg> Add to QUBI</button>';

  panel.innerHTML =
    '<div class="ext-detail-body">' +
      '<div class="ext-detail-head">' +
        '<div class="ext-detail-icon" style="background:' + ext.colour + '22;color:' + ext.colour + '">' + ext.icon + '</div>' +
        '<div>' +
          '<div class="ext-detail-name">' + ext.name + '</div>' +
          '<div class="ext-detail-sub">' + ext.subtitle + '</div>' +
        '</div>' +
      '</div>' +
      '<p class="ext-detail-desc">' + ext.description + '</p>' +
      '<div class="ext-detail-section">' +
        '<div class="ext-detail-section-label">Compatible boards</div>' +
        '<div class="ext-board-pills">' + boardPills + '</div>' +
      '</div>' +
      '<div class="ext-detail-section">' +
        '<div class="ext-detail-section-label">Blocks included</div>' +
        '<div class="ext-block-pills">' + blockPills + '</div>' +
      '</div>' +
      '<div class="ext-detail-actions">' + actionBtn + '</div>' +
    '</div>';
}

window.toggleExtension = function(id) {
  var ext = QUBI_EXTENSIONS.find(function(e) { return e.id === id; });
  if (!ext) return;

  ext.installed = !ext.installed;
  saveInstalledExtensions();
  rebuildToolbox();
  updateExtBadge();
  renderExtCardList();
  renderExtDetail(ext);

  // Re-select the toggled card
  setTimeout(function() {
    var card = document.querySelector('.ext-card[data-id="' + id + '"]');
    if (card) card.classList.add('ext-card-active');
  }, 10);

  showExtToast(ext.installed
    ? '+ ' + ext.name + ' added  —  find it at the bottom of the toolbox'
    : ext.name + ' removed');
};

function showExtToast(msg) {
  var toast = document.getElementById('extToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'extToast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('ext-toast-show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function() { toast.classList.remove('ext-toast-show'); }, 2800);
}

function _extInit() {
  // Wire up modal open / close
  var btn   = document.getElementById('extensionsBtn');
  var close = document.getElementById('extensionsClose');
  var modal = document.getElementById('extensionsModal');

  if (btn)   btn.addEventListener('click', openExtensionsModal);
  if (close) close.addEventListener('click', closeExtensionsModal);
  if (modal) modal.addEventListener('click', function(e) {
    if (e.target === modal) closeExtensionsModal();
  });

  // Restore previously installed extensions
  loadInstalledExtensions();

  // If any extensions were saved, rebuild the toolbox after Blockly settles
  if (QUBI_EXTENSIONS.some(function(e) { return e.installed; })) {
    setTimeout(rebuildToolbox, 500);
  }

  updateExtBadge();
}

// If page is already fully loaded (readyState complete), run right now.
// Otherwise wait for the 'load' event — never use DOMContentLoaded here.
if (document.readyState === 'complete') {
  _extInit();
} else {
  window.addEventListener('load', _extInit);
}
/* ══════════════════════════════════════════════════════════════════
   I2C SENSORS EXTENSION
   All sensors use SDA (GPIO21) / SCL (GPIO22) on ESP32 by default.
   Wire.begin() is injected once and shared by all I2C blocks.
   ══════════════════════════════════════════════════════════════════ */

var I2C_COLOUR = '#1565C0';

function _i2cBegin() {
  if (window.includeStatements)
    window.includeStatements['wire'] = '#include <Wire.h>';
  if (window.setupStatements && !window.setupStatements['wire_begin'])
    window.setupStatements['wire_begin'] = '  Wire.begin();\n';
}

/* ─── BMP280 — Pressure, Temperature, Altitude ─── */
function _bmp280() {
  _i2cBegin();
  if (window.includeStatements)
    window.includeStatements['bmp280'] = '#include <Adafruit_BMP280.h>';
  if (window.globalVariables && !window.globalVariables['bmp280'])
    window.globalVariables['bmp280'] = 'Adafruit_BMP280 _bmp;';
  if (window.setupStatements && !window.setupStatements['bmp280'])
    window.setupStatements['bmp280'] = '  if (!_bmp.begin(0x76)) { Serial.println("BMP280 not found"); }\n';
}

Blockly.Blocks['bmp280_temp'] = {
  init: function() {
    this.appendDummyInput().appendField('BMP280 temperature (C)');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read temperature in Celsius from BMP280. Library: Adafruit BMP280.');
  }
};
arduinoGenerator.forBlock['bmp280_temp'] = function() {
  _bmp280();
  return ['_bmp.readTemperature()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['bmp280_pressure'] = {
  init: function() {
    this.appendDummyInput().appendField('BMP280 pressure (hPa)');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read atmospheric pressure in hPa from BMP280.');
  }
};
arduinoGenerator.forBlock['bmp280_pressure'] = function() {
  _bmp280();
  return ['(_bmp.readPressure() / 100.0)', arduinoGenerator.ORDER_MULTIPLICATIVE];
};

Blockly.Blocks['bmp280_altitude'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('BMP280 altitude (m) sea-level hPa')
      .appendField(new Blockly.FieldNumber(1013.25, 900, 1100), 'SEA');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Estimated altitude above sea level. Set local sea-level pressure for accuracy.');
  }
};
arduinoGenerator.forBlock['bmp280_altitude'] = function(b) {
  _bmp280();
  var sea = b.getFieldValue('SEA');
  return ['_bmp.readAltitude(' + sea + ')', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ─── AHT10 — Temperature & Humidity ─── */
function _aht10() {
  _i2cBegin();
  if (window.includeStatements)
    window.includeStatements['aht10'] = '#include <AHTxx.h>';
  if (window.globalVariables && !window.globalVariables['aht10'])
    window.globalVariables['aht10'] = 'AHTxx _aht(AHTXX_ADDRESS_X38, AHT1x_SENSOR);';
  if (window.setupStatements && !window.setupStatements['aht10'])
    window.setupStatements['aht10'] = '  _aht.begin();\n';
}

Blockly.Blocks['aht10_temp'] = {
  init: function() {
    this.appendDummyInput().appendField('AHT10 temperature (C)');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read temperature from AHT10. Library: AHTxx by enjoyneering.');
  }
};
arduinoGenerator.forBlock['aht10_temp'] = function() {
  _aht10();
  return ['_aht.readTemperature()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['aht10_humid'] = {
  init: function() {
    this.appendDummyInput().appendField('AHT10 humidity (%)');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read relative humidity from AHT10.');
  }
};
arduinoGenerator.forBlock['aht10_humid'] = function() {
  _aht10();
  return ['_aht.readHumidity()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ─── APDS9960 — Gesture & Colour ─── */
function _apds() {
  _i2cBegin();
  if (window.includeStatements)
    window.includeStatements['apds'] = '#include <Adafruit_APDS9960.h>';
  if (window.globalVariables && !window.globalVariables['apds'])
    window.globalVariables['apds'] = 'Adafruit_APDS9960 _apds;';
  if (window.setupStatements && !window.setupStatements['apds'])
    window.setupStatements['apds'] =
      '  if (!_apds.begin()) { Serial.println("APDS9960 not found"); }\n' +
      '  _apds.enableGesture(true);\n' +
      '  _apds.enableColor(true);\n';
}

Blockly.Blocks['apds_gesture'] = {
  init: function() {
    this.appendDummyInput().appendField('APDS9960 gesture');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Returns gesture code: 1=UP 2=DOWN 3=LEFT 4=RIGHT 0=NONE. Library: Adafruit APDS9960.');
  }
};
arduinoGenerator.forBlock['apds_gesture'] = function() {
  _apds();
  return ['_apds.readGesture()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['apds_colour_r'] = {
  init: function() {
    this.appendDummyInput().appendField('APDS9960 red value');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read the red channel from the APDS9960 colour sensor (0-65535).');
  }
};
arduinoGenerator.forBlock['apds_colour_r'] = function() {
  _apds();
  if (window.globalVariables && !window.globalVariables['apds_rgba'])
    window.globalVariables['apds_rgba'] = 'uint16_t _apdsR=0,_apdsG=0,_apdsB=0,_apdsC=0;';
  if (arduinoGenerator._extraFunctions && !arduinoGenerator._extraFunctions['apds_read'])
    arduinoGenerator._extraFunctions['apds_read'] =
      'void _apdsRead() { if(_apds.colorDataReady()) _apds.getColorData(&_apdsR,&_apdsG,&_apdsB,&_apdsC); }\n';
  return ['(_apdsRead(), _apdsR)', arduinoGenerator.ORDER_COMMA];
};

Blockly.Blocks['apds_colour_g'] = {
  init: function() {
    this.appendDummyInput().appendField('APDS9960 green value');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read the green channel from the APDS9960 colour sensor (0-65535).');
  }
};
arduinoGenerator.forBlock['apds_colour_g'] = function() {
  _apds();
  if (window.globalVariables && !window.globalVariables['apds_rgba'])
    window.globalVariables['apds_rgba'] = 'uint16_t _apdsR=0,_apdsG=0,_apdsB=0,_apdsC=0;';
  if (arduinoGenerator._extraFunctions && !arduinoGenerator._extraFunctions['apds_read'])
    arduinoGenerator._extraFunctions['apds_read'] =
      'void _apdsRead() { if(_apds.colorDataReady()) _apds.getColorData(&_apdsR,&_apdsG,&_apdsB,&_apdsC); }\n';
  return ['(_apdsRead(), _apdsG)', arduinoGenerator.ORDER_COMMA];
};

Blockly.Blocks['apds_colour_b'] = {
  init: function() {
    this.appendDummyInput().appendField('APDS9960 blue value');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read the blue channel from the APDS9960 colour sensor (0-65535).');
  }
};
arduinoGenerator.forBlock['apds_colour_b'] = function() {
  _apds();
  if (window.globalVariables && !window.globalVariables['apds_rgba'])
    window.globalVariables['apds_rgba'] = 'uint16_t _apdsR=0,_apdsG=0,_apdsB=0,_apdsC=0;';
  if (arduinoGenerator._extraFunctions && !arduinoGenerator._extraFunctions['apds_read'])
    arduinoGenerator._extraFunctions['apds_read'] =
      'void _apdsRead() { if(_apds.colorDataReady()) _apds.getColorData(&_apdsR,&_apdsG,&_apdsB,&_apdsC); }\n';
  return ['(_apdsRead(), _apdsB)', arduinoGenerator.ORDER_COMMA];
};

/* ─── ADS1115 — 16-bit 4-channel ADC ─── */
function _ads1115() {
  _i2cBegin();
  if (window.includeStatements)
    window.includeStatements['ads1115'] = '#include <Adafruit_ADS1X15.h>';
  if (window.globalVariables && !window.globalVariables['ads1115'])
    window.globalVariables['ads1115'] = 'Adafruit_ADS1115 _ads;';
  if (window.setupStatements && !window.setupStatements['ads1115'])
    window.setupStatements['ads1115'] = '  _ads.begin();\n';
}

Blockly.Blocks['ads1115_read'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('ADS1115 read channel')
      .appendField(new Blockly.FieldDropdown([['A0','0'],['A1','1'],['A2','2'],['A3','3']]), 'CH')
      .appendField('as')
      .appendField(new Blockly.FieldDropdown([['raw (int16)','raw'],['voltage (V)','volt']]), 'MODE');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read a 16-bit ADC value or voltage from ADS1115. Library: Adafruit ADS1X15.');
  }
};
arduinoGenerator.forBlock['ads1115_read'] = function(b) {
  _ads1115();
  var ch   = b.getFieldValue('CH');
  var mode = b.getFieldValue('MODE');
  if (mode === 'volt')
    return ['(_ads.readADC_SingleEnded(' + ch + ') * _ads.computeVolts(1))', arduinoGenerator.ORDER_MULTIPLICATIVE];
  return ['_ads.readADC_SingleEnded(' + ch + ')', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ─── BH1750 — Ambient Light (lux) ─── */
function _bh1750() {
  _i2cBegin();
  if (window.includeStatements)
    window.includeStatements['bh1750'] = '#include <BH1750.h>';
  if (window.globalVariables && !window.globalVariables['bh1750'])
    window.globalVariables['bh1750'] = 'BH1750 _bh1750;';
  if (window.setupStatements && !window.setupStatements['bh1750'])
    window.setupStatements['bh1750'] = '  _bh1750.begin();\n';
}

Blockly.Blocks['bh1750_lux'] = {
  init: function() {
    this.appendDummyInput().appendField('BH1750 light (lux)');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read ambient light in lux from BH1750. Library: BH1750 by claws.');
  }
};
arduinoGenerator.forBlock['bh1750_lux'] = function() {
  _bh1750();
  return ['_bh1750.readLightLevel()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ─── INA219 — Current & Voltage ─── */
function _ina219() {
  _i2cBegin();
  if (window.includeStatements)
    window.includeStatements['ina219'] = '#include <Adafruit_INA219.h>';
  if (window.globalVariables && !window.globalVariables['ina219'])
    window.globalVariables['ina219'] = 'Adafruit_INA219 _ina219;';
  if (window.setupStatements && !window.setupStatements['ina219'])
    window.setupStatements['ina219'] = '  _ina219.begin();\n';
}

Blockly.Blocks['ina219_voltage'] = {
  init: function() {
    this.appendDummyInput().appendField('INA219 bus voltage (V)');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read bus voltage in Volts from INA219. Library: Adafruit INA219.');
  }
};
arduinoGenerator.forBlock['ina219_voltage'] = function() {
  _ina219();
  return ['_ina219.getBusVoltage_V()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['ina219_current'] = {
  init: function() {
    this.appendDummyInput().appendField('INA219 current (mA)');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read current in milliamps from INA219.');
  }
};
arduinoGenerator.forBlock['ina219_current'] = function() {
  _ina219();
  return ['_ina219.getCurrent_mA()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['ina219_power'] = {
  init: function() {
    this.appendDummyInput().appendField('INA219 power (mW)');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read power in milliwatts from INA219.');
  }
};
arduinoGenerator.forBlock['ina219_power'] = function() {
  _ina219();
  return ['_ina219.getPower_mW()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ─── MAX30102 — Heart Rate & SpO2 ─── */
function _max30102() {
  _i2cBegin();
  if (window.includeStatements)
    window.includeStatements['max30102'] = '#include <MAX3010x.h>';
  if (window.globalVariables && !window.globalVariables['max30102'])
    window.globalVariables['max30102'] = 'MAX30105 _max30102;\nfloat _hr=0; float _spo2=0; bool _hrValid=false;';
  if (window.setupStatements && !window.setupStatements['max30102'])
    window.setupStatements['max30102'] =
      '  _max30102.begin(Wire, I2C_SPEED_FAST);\n' +
      '  _max30102.setup();\n' +
      '  _max30102.setPulseAmplitudeRed(0x0A);\n' +
      '  _max30102.setPulseAmplitudeIR(0x0A);\n';
}

Blockly.Blocks['max30102_hr'] = {
  init: function() {
    this.appendDummyInput().appendField('MAX30102 heart rate (BPM)');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read heart rate in BPM from MAX30102. Place finger on sensor. Library: SparkFun MAX3010x.');
  }
};
arduinoGenerator.forBlock['max30102_hr'] = function() {
  _max30102();
  return ['_hr', arduinoGenerator.ORDER_ATOMIC];
};

Blockly.Blocks['max30102_spo2'] = {
  init: function() {
    this.appendDummyInput().appendField('MAX30102 SpO2 (%)');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read blood oxygen saturation (SpO2) from MAX30102.');
  }
};
arduinoGenerator.forBlock['max30102_spo2'] = function() {
  _max30102();
  return ['_spo2', arduinoGenerator.ORDER_ATOMIC];
};

/* ─── DS3231 — Real-Time Clock ─── */
function _ds3231() {
  _i2cBegin();
  if (window.includeStatements)
    window.includeStatements['ds3231'] = '#include <RTClib.h>';
  if (window.globalVariables && !window.globalVariables['ds3231'])
    window.globalVariables['ds3231'] = 'RTC_DS3231 _rtc;\nDateTime _now;';
  if (window.setupStatements && !window.setupStatements['ds3231'])
    window.setupStatements['ds3231'] =
      '  if (!_rtc.begin()) { Serial.println("DS3231 not found"); }\n' +
      '  if (_rtc.lostPower()) _rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));\n';
  if (arduinoGenerator._extraFunctions && !arduinoGenerator._extraFunctions['rtc_read'])
    arduinoGenerator._extraFunctions['rtc_read'] =
      'void _rtcRead() { _now = _rtc.now(); }\n';
}

var _DS_FIELDS = [
  ['hour','_now.hour()'],['minute','_now.minute()'],['second','_now.second()'],
  ['day','_now.day()'],['month','_now.month()'],['year','_now.year()']
];
_DS_FIELDS.forEach(function(f) {
  var field = f[0], expr = f[1];
  Blockly.Blocks['ds3231_' + field] = {
    init: function() {
      this.appendDummyInput().appendField('DS3231 ' + field);
      this.setOutput(true, 'Number');
      this.setColour(I2C_COLOUR);
      this.setTooltip('I2C (SDA/SCL). Get current ' + field + ' from DS3231 RTC. Library: RTClib by Adafruit.');
    }
  };
  arduinoGenerator.forBlock['ds3231_' + field] = function() {
    _ds3231();
    return ['(_rtcRead(), ' + expr + ')', arduinoGenerator.ORDER_COMMA];
  };
});

Blockly.Blocks['ds3231_temp'] = {
  init: function() {
    this.appendDummyInput().appendField('DS3231 temperature (C)');
    this.setOutput(true, 'Number');
    this.setColour(I2C_COLOUR);
    this.setTooltip('I2C (SDA/SCL). Read the onboard temperature sensor of the DS3231 (±3°C accuracy).');
  }
};
arduinoGenerator.forBlock['ds3231_temp'] = function() {
  _ds3231();
  return ['_rtc.getTemperature()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['ds3231_set_time'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('DS3231 set time  Y')
      .appendField(new Blockly.FieldNumber(2024, 2000, 2099), 'Y')
      .appendField('M')
      .appendField(new Blockly.FieldNumber(1, 1, 12), 'MO')
      .appendField('D')
      .appendField(new Blockly.FieldNumber(1, 1, 31), 'D')
      .appendField('h')
      .appendField(new Blockly.FieldNumber(0, 0, 23), 'H')
      .appendField('m')
      .appendField(new Blockly.FieldNumber(0, 0, 59), 'MI')
      .appendField('s')
      .appendField(new Blockly.FieldNumber(0, 0, 59), 'S');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(I2C_COLOUR);
    this.setTooltip('Set the DS3231 RTC to a specific date and time.');
  }
};
arduinoGenerator.forBlock['ds3231_set_time'] = function(b) {
  _ds3231();
  return '  _rtc.adjust(DateTime(' +
    b.getFieldValue('Y') + ',' + b.getFieldValue('MO') + ',' + b.getFieldValue('D') + ',' +
    b.getFieldValue('H') + ',' + b.getFieldValue('MI') + ',' + b.getFieldValue('S') + '));\n';
};


/* ══════════════════════════════════════════════════════════════════
   UART / SERIAL SENSORS EXTENSION
   User picks Serial port (Serial1 or Serial2) and TX/RX pins.
   ══════════════════════════════════════════════════════════════════ */

var UART_COLOUR = '#6A1B9A';

var UART_PORTS = [['Serial1','1'],['Serial2','2']];
var UART_PINS  = [
  ['GPIO 1 (TX0)','1'],  ['GPIO 3 (RX0)','3'],
  ['GPIO 9','9'],         ['GPIO 10','10'],
  ['GPIO 16','16'],       ['GPIO 17','17'],
  ['GPIO 4','4'],         ['GPIO 5','5'],
  ['GPIO 12','12'],       ['GPIO 13','13'],
  ['GPIO 14','14'],       ['GPIO 15','15'],
  ['GPIO 25','25'],       ['GPIO 26','26'],
  ['GPIO 27','27'],       ['GPIO 32','32'],
  ['GPIO 33','33']
];

/* ─── GPS (TinyGPS++ over UART) ─── */
function _gpsSetup(port, rx, tx, baud) {
  if (window.includeStatements) {
    window.includeStatements['tgps'] = '#include <TinyGPSPlus.h>';
    window.includeStatements['hwser'] = '#include <HardwareSerial.h>';
  }
  var key = 'gps_' + port;
  if (window.globalVariables && !window.globalVariables[key]) {
    window.globalVariables[key] =
      'TinyGPSPlus _gps;\n' +
      'HardwareSerial _gpsSerial(' + port + ');';
  }
  if (window.setupStatements && !window.setupStatements[key])
    window.setupStatements[key] =
      '  _gpsSerial.begin(' + baud + ', SERIAL_8N1, ' + rx + ', ' + tx + ');\n';
}

Blockly.Blocks['gps_init'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('GPS init  port')
      .appendField(new Blockly.FieldDropdown(UART_PORTS), 'PORT')
      .appendField('RX')
      .appendField(new Blockly.FieldDropdown(UART_PINS), 'RX')
      .appendField('TX')
      .appendField(new Blockly.FieldDropdown(UART_PINS), 'TX')
      .appendField('baud')
      .appendField(new Blockly.FieldDropdown([['9600','9600'],['4800','4800'],['38400','38400'],['115200','115200']]), 'BAUD');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(UART_COLOUR);
    this.setTooltip('UART. Initialise GPS module using TinyGPS++. Library: TinyGPSPlus.');
  }
};
arduinoGenerator.forBlock['gps_init'] = function(b) {
  _gpsSetup(b.getFieldValue('PORT'), b.getFieldValue('RX'), b.getFieldValue('TX'), b.getFieldValue('BAUD'));
  return '';
};

Blockly.Blocks['gps_update'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('GPS update  port')
      .appendField(new Blockly.FieldDropdown(UART_PORTS), 'PORT');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(UART_COLOUR);
    this.setTooltip('Call this in your Forever loop to feed GPS data into TinyGPS++.');
  }
};
arduinoGenerator.forBlock['gps_update'] = function(b) {
  var p = b.getFieldValue('PORT');
  return '  while (_gpsSerial.available()) _gps.encode(_gpsSerial.read());\n';
};

Blockly.Blocks['gps_valid'] = {
  init: function() {
    this.appendDummyInput().appendField('GPS location valid?');
    this.setOutput(true, 'Boolean');
    this.setColour(UART_COLOUR);
    this.setTooltip('True when the GPS has a valid fix and location data is reliable.');
  }
};
arduinoGenerator.forBlock['gps_valid'] = function() {
  return ['_gps.location.isValid()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['gps_lat'] = {
  init: function() {
    this.appendDummyInput().appendField('GPS latitude');
    this.setOutput(true, 'Number');
    this.setColour(UART_COLOUR);
    this.setTooltip('Current latitude in decimal degrees (e.g. 51.5074).');
  }
};
arduinoGenerator.forBlock['gps_lat'] = function() {
  return ['_gps.location.lat()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['gps_lng'] = {
  init: function() {
    this.appendDummyInput().appendField('GPS longitude');
    this.setOutput(true, 'Number');
    this.setColour(UART_COLOUR);
    this.setTooltip('Current longitude in decimal degrees (e.g. -0.1278).');
  }
};
arduinoGenerator.forBlock['gps_lng'] = function() {
  return ['_gps.location.lng()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['gps_alt'] = {
  init: function() {
    this.appendDummyInput().appendField('GPS altitude (m)');
    this.setOutput(true, 'Number');
    this.setColour(UART_COLOUR);
    this.setTooltip('Current altitude above sea level in metres.');
  }
};
arduinoGenerator.forBlock['gps_alt'] = function() {
  return ['_gps.altitude.meters()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['gps_speed'] = {
  init: function() {
    this.appendDummyInput().appendField('GPS speed (km/h)');
    this.setOutput(true, 'Number');
    this.setColour(UART_COLOUR);
    this.setTooltip('Current ground speed in km/h.');
  }
};
arduinoGenerator.forBlock['gps_speed'] = function() {
  return ['_gps.speed.kmph()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['gps_sats'] = {
  init: function() {
    this.appendDummyInput().appendField('GPS satellites');
    this.setOutput(true, 'Number');
    this.setColour(UART_COLOUR);
    this.setTooltip('Number of satellites currently in use.');
  }
};
arduinoGenerator.forBlock['gps_sats'] = function() {
  return ['_gps.satellites.value()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ─── Fingerprint Scanner (R307/R503 over UART) ─── */
function _fpSetup(port, rx, tx) {
  if (window.includeStatements)
    window.includeStatements['fp'] = '#include <Adafruit_Fingerprint.h>';
  var key = 'fp_' + port;
  if (window.globalVariables && !window.globalVariables[key]) {
    window.globalVariables[key] =
      'HardwareSerial _fpSerial(' + port + ');\n' +
      'Adafruit_Fingerprint _finger(&_fpSerial);';
  }
  if (window.setupStatements && !window.setupStatements[key])
    window.setupStatements[key] =
      '  _fpSerial.begin(57600, SERIAL_8N1, ' + rx + ', ' + tx + ');\n' +
      '  _finger.begin(57600);\n';
}

Blockly.Blocks['fp_init'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Fingerprint init  port')
      .appendField(new Blockly.FieldDropdown(UART_PORTS), 'PORT')
      .appendField('RX')
      .appendField(new Blockly.FieldDropdown(UART_PINS), 'RX')
      .appendField('TX')
      .appendField(new Blockly.FieldDropdown(UART_PINS), 'TX');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(UART_COLOUR);
    this.setTooltip('UART. Initialise fingerprint scanner (R307/R503). Library: Adafruit Fingerprint.');
  }
};
arduinoGenerator.forBlock['fp_init'] = function(b) {
  _fpSetup(b.getFieldValue('PORT'), b.getFieldValue('RX'), b.getFieldValue('TX'));
  return '';
};

Blockly.Blocks['fp_match'] = {
  init: function() {
    this.appendDummyInput().appendField('Fingerprint match ID');
    this.setOutput(true, 'Number');
    this.setColour(UART_COLOUR);
    this.setTooltip('Scan finger and return matched ID (1-127), or -1 if no match / error.');
  }
};
arduinoGenerator.forBlock['fp_match'] = function() {
  if (arduinoGenerator._extraFunctions && !arduinoGenerator._extraFunctions['fp_match_fn'])
    arduinoGenerator._extraFunctions['fp_match_fn'] =
      'int _fpMatch() {\n' +
      '  if (_finger.getImage() != FINGERPRINT_OK) return -1;\n' +
      '  if (_finger.image2Tz() != FINGERPRINT_OK) return -1;\n' +
      '  if (_finger.fingerSearch() != FINGERPRINT_OK) return -1;\n' +
      '  return _finger.fingerID;\n' +
      '}\n';
  return ['_fpMatch()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['fp_enroll'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Enroll fingerprint as ID')
      .appendField(new Blockly.FieldNumber(1, 1, 127), 'ID');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(UART_COLOUR);
    this.setTooltip('Scan finger twice and save it with the given ID (1-127).');
  }
};
arduinoGenerator.forBlock['fp_enroll'] = function(b) {
  var id = b.getFieldValue('ID');
  if (arduinoGenerator._extraFunctions && !arduinoGenerator._extraFunctions['fp_enroll_fn'])
    arduinoGenerator._extraFunctions['fp_enroll_fn'] =
      'bool _fpEnroll(uint8_t id) {\n' +
      '  if (_finger.getImage() != FINGERPRINT_OK) return false;\n' +
      '  if (_finger.image2Tz(1) != FINGERPRINT_OK) return false;\n' +
      '  delay(200);\n' +
      '  if (_finger.getImage() != FINGERPRINT_OK) return false;\n' +
      '  if (_finger.image2Tz(2) != FINGERPRINT_OK) return false;\n' +
      '  if (_finger.createModel() != FINGERPRINT_OK) return false;\n' +
      '  return _finger.storeModel(id) == FINGERPRINT_OK;\n' +
      '}\n';
  return '  _fpEnroll(' + id + ');\n';
};

Blockly.Blocks['fp_delete'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Delete fingerprint ID')
      .appendField(new Blockly.FieldNumber(1, 1, 127), 'ID');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(UART_COLOUR);
    this.setTooltip('Delete a stored fingerprint by its ID.');
  }
};
arduinoGenerator.forBlock['fp_delete'] = function(b) {
  return '  _finger.deleteModel(' + b.getFieldValue('ID') + ');\n';
};

/* ─── RDM6300 RFID 125kHz (UART) ─── */
function _rfidSetup(port, rx, tx) {
  if (window.includeStatements)
    window.includeStatements['hwser'] = '#include <HardwareSerial.h>';
  var key = 'rfid_' + port;
  if (window.globalVariables && !window.globalVariables[key]) {
    window.globalVariables[key] =
      'HardwareSerial _rfidSerial(' + port + ');\n' +
      'String _rfidTag = "";\n' +
      'bool _rfidAvail = false;';
  }
  if (window.setupStatements && !window.setupStatements[key])
    window.setupStatements[key] =
      '  _rfidSerial.begin(9600, SERIAL_8N1, ' + rx + ', ' + tx + ');\n';
  if (arduinoGenerator._extraFunctions && !arduinoGenerator._extraFunctions['rfid_poll_' + port])
    arduinoGenerator._extraFunctions['rfid_poll_' + port] =
      'void _rfidPoll() {\n' +
      '  _rfidAvail = false;\n' +
      '  if (_rfidSerial.available() >= 14) {\n' +
      '    if (_rfidSerial.read() == 0x02) {\n' +
      '      _rfidTag = "";\n' +
      '      for (int i=0;i<10;i++) _rfidTag += (char)_rfidSerial.read();\n' +
      '      _rfidSerial.read(); _rfidSerial.read(); _rfidSerial.read();\n' +
      '      _rfidAvail = true;\n' +
      '    }\n' +
      '  }\n' +
      '}\n';
}

Blockly.Blocks['rfid_init'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('RFID init (RDM6300)  port')
      .appendField(new Blockly.FieldDropdown(UART_PORTS), 'PORT')
      .appendField('RX')
      .appendField(new Blockly.FieldDropdown(UART_PINS), 'RX')
      .appendField('TX')
      .appendField(new Blockly.FieldDropdown(UART_PINS), 'TX');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(UART_COLOUR);
    this.setTooltip('UART. Initialise RDM6300 125kHz RFID reader (9600 baud).');
  }
};
arduinoGenerator.forBlock['rfid_init'] = function(b) {
  _rfidSetup(b.getFieldValue('PORT'), b.getFieldValue('RX'), b.getFieldValue('TX'));
  return '';
};

Blockly.Blocks['rfid_available'] = {
  init: function() {
    this.appendDummyInput().appendField('RFID card present?');
    this.setOutput(true, 'Boolean');
    this.setColour(UART_COLOUR);
    this.setTooltip('Call in Forever loop. Returns true when an RFID card has just been read.');
  }
};
arduinoGenerator.forBlock['rfid_available'] = function() {
  return ['(_rfidPoll(), _rfidAvail)', arduinoGenerator.ORDER_COMMA];
};

Blockly.Blocks['rfid_read'] = {
  init: function() {
    this.appendDummyInput().appendField('RFID card ID (text)');
    this.setOutput(true, null);
    this.setColour(UART_COLOUR);
    this.setTooltip('Returns the last scanned RFID card ID as a 10-character hex string.');
  }
};
arduinoGenerator.forBlock['rfid_read'] = function() {
  return ['_rfidTag', arduinoGenerator.ORDER_ATOMIC];
};

/* ─── LD2410 mmWave Presence Sensor (UART) ─── */
function _ld2410Setup(port, rx, tx) {
  if (window.includeStatements)
    window.includeStatements['hwser'] = '#include <HardwareSerial.h>';
  var key = 'ld2410_' + port;
  if (window.globalVariables && !window.globalVariables[key]) {
    window.globalVariables[key] =
      'HardwareSerial _ld2410Serial(' + port + ');\n' +
      'bool _ld2410Present = false;\n' +
      'int _ld2410Dist = 0;';
  }
  if (window.setupStatements && !window.setupStatements[key])
    window.setupStatements[key] =
      '  _ld2410Serial.begin(256000, SERIAL_8N1, ' + rx + ', ' + tx + ');\n';
  if (arduinoGenerator._extraFunctions && !arduinoGenerator._extraFunctions['ld2410_poll'])
    arduinoGenerator._extraFunctions['ld2410_poll'] =
      'void _ld2410Poll() {\n' +
      '  if (_ld2410Serial.available() >= 12) {\n' +
      '    uint8_t buf[12];\n' +
      '    _ld2410Serial.readBytes(buf, 12);\n' +
      '    if (buf[0]==0xF4&&buf[1]==0xF3&&buf[2]==0xF2&&buf[3]==0xF1) {\n' +
      '      _ld2410Present = (buf[8] != 0);\n' +
      '      _ld2410Dist = buf[9] | (buf[10] << 8);\n' +
      '    }\n' +
      '  }\n' +
      '}\n';
}

Blockly.Blocks['ld2410_init'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('LD2410 init  port')
      .appendField(new Blockly.FieldDropdown(UART_PORTS), 'PORT')
      .appendField('RX')
      .appendField(new Blockly.FieldDropdown(UART_PINS), 'RX')
      .appendField('TX')
      .appendField(new Blockly.FieldDropdown(UART_PINS), 'TX');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(UART_COLOUR);
    this.setTooltip('UART. Initialise LD2410 24GHz mmWave presence sensor (256000 baud).');
  }
};
arduinoGenerator.forBlock['ld2410_init'] = function(b) {
  _ld2410Setup(b.getFieldValue('PORT'), b.getFieldValue('RX'), b.getFieldValue('TX'));
  return '';
};

Blockly.Blocks['ld2410_present'] = {
  init: function() {
    this.appendDummyInput().appendField('LD2410 presence detected?');
    this.setOutput(true, 'Boolean');
    this.setColour(UART_COLOUR);
    this.setTooltip('Returns true if the LD2410 detects a person. Call LD2410 init first.');
  }
};
arduinoGenerator.forBlock['ld2410_present'] = function() {
  return ['(_ld2410Poll(), _ld2410Present)', arduinoGenerator.ORDER_COMMA];
};

Blockly.Blocks['ld2410_dist'] = {
  init: function() {
    this.appendDummyInput().appendField('LD2410 distance (cm)');
    this.setOutput(true, 'Number');
    this.setColour(UART_COLOUR);
    this.setTooltip('Distance to detected person in centimetres from LD2410.');
  }
};
arduinoGenerator.forBlock['ld2410_dist'] = function() {
  return ['(_ld2410Poll(), _ld2410Dist)', arduinoGenerator.ORDER_COMMA];
};

/* ─── PMS5003 Air Quality Sensor (UART) ─── */
function _pmsSetup(port, rx, tx) {
  if (window.includeStatements)
    window.includeStatements['hwser'] = '#include <HardwareSerial.h>';
  var key = 'pms_' + port;
  if (window.globalVariables && !window.globalVariables[key]) {
    window.globalVariables[key] =
      'HardwareSerial _pmsSerial(' + port + ');\n' +
      'uint16_t _pmsPM1=0, _pmsPM25=0, _pmsPM10=0;';
  }
  if (window.setupStatements && !window.setupStatements[key])
    window.setupStatements[key] =
      '  _pmsSerial.begin(9600, SERIAL_8N1, ' + rx + ', ' + tx + ');\n';
  if (arduinoGenerator._extraFunctions && !arduinoGenerator._extraFunctions['pms_read'])
    arduinoGenerator._extraFunctions['pms_read'] =
      'void _pmsRead() {\n' +
      '  if (_pmsSerial.available() < 32) return;\n' +
      '  uint8_t buf[32]; _pmsSerial.readBytes(buf, 32);\n' +
      '  if (buf[0]==0x42 && buf[1]==0x4D) {\n' +
      '    _pmsPM1  = (buf[10]<<8)|buf[11];\n' +
      '    _pmsPM25 = (buf[12]<<8)|buf[13];\n' +
      '    _pmsPM10 = (buf[14]<<8)|buf[15];\n' +
      '  }\n' +
      '}\n';
}

Blockly.Blocks['pms_init'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('PMS5003 init  port')
      .appendField(new Blockly.FieldDropdown(UART_PORTS), 'PORT')
      .appendField('RX')
      .appendField(new Blockly.FieldDropdown(UART_PINS), 'RX')
      .appendField('TX')
      .appendField(new Blockly.FieldDropdown(UART_PINS), 'TX');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour(UART_COLOUR);
    this.setTooltip('UART. Initialise PMS5003 particulate matter air quality sensor (9600 baud).');
  }
};
arduinoGenerator.forBlock['pms_init'] = function(b) {
  _pmsSetup(b.getFieldValue('PORT'), b.getFieldValue('RX'), b.getFieldValue('TX'));
  return '';
};

Blockly.Blocks['pms_pm25'] = {
  init: function() {
    this.appendDummyInput().appendField('PM2.5 reading (µg/m³)');
    this.setOutput(true, 'Number');
    this.setColour(UART_COLOUR);
    this.setTooltip('Read PM2.5 particulate concentration in µg/m³ from PMS5003. Call PMS5003 init first.');
  }
};
arduinoGenerator.forBlock['pms_pm25'] = function() {
  return ['(_pmsRead(), _pmsPM25)', arduinoGenerator.ORDER_COMMA];
};

Blockly.Blocks['pms_pm10'] = {
  init: function() {
    this.appendDummyInput().appendField('PM10 reading (µg/m³)');
    this.setOutput(true, 'Number');
    this.setColour(UART_COLOUR);
    this.setTooltip('Read PM10 particulate concentration in µg/m³ from PMS5003.');
  }
};
arduinoGenerator.forBlock['pms_pm10'] = function() {
  return ['(_pmsRead(), _pmsPM10)', arduinoGenerator.ORDER_COMMA];
};