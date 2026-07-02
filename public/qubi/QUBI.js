/* QUBI Block IDE */

const $ = id => document.getElementById(id);

/* ---------------- CONFIGURATION ---------------- */
const SERVER_URL = 'http://localhost:3000';

/* ---------------- QUBI BOARD PIN MAP ----------------
   Maps the silkscreen labels printed on the QUBI board (P0-P20)
   to the underlying ESP32 GPIO numbers used in generated Arduino code.
   Dropdown labels show "P#"; the field VALUE is always the GPIO number,
   so all existing forBlock generator code keeps working unchanged.
------------------------------------------------------- */
const QUBI_PIN_MAP = {
  P0:  { gpio: '39', note: 'SENSOR VN (input only)' },
  P1:  { gpio: '36', note: 'SENSOR VP (input only)' },
  P2:  { gpio: '2',  note: '' },
  P3:  { gpio: '23', note: 'LED Matrix CLK' },
  P4:  { gpio: '12', note: '' },
  P5:  { gpio: '14', note: '' },
  P6:  { gpio: '15', note: '' },
  P7:  { gpio: '25', note: '' },
  P8:  { gpio: '26', note: '' },
  P9:  { gpio: '27', note: '' },
  P10: { gpio: '32', note: '' },
  P11: { gpio: '33', note: '' },
  P12: { gpio: '35', note: 'input only' },
  P13: { gpio: '18', note: 'LED Matrix DIN' },
  P14: { gpio: '19', note: 'LED Matrix LOAD' },
  P15: { gpio: '21', note: 'SDA' },
  P16: { gpio: '22', note: 'SCL' },
  P19: { gpio: '16', note: 'Button A' },
  P20: { gpio: '17', note: 'Button B' },
};

// Pins that are input-only on the ESP32 (cannot be set OUTPUT / used with PWM)
const QUBI_INPUT_ONLY = ['P0', 'P1', 'P12'];

// Pins with ADC (analogRead) capability
const QUBI_ADC_PINS = ['P0', 'P1', 'P2', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'P12'];

/**
 * Build [label, value] pairs for a Blockly FieldDropdown using QUBI board
 * pin labels (e.g. "P4") as the visible label and the ESP32 GPIO number
 * as the underlying value.
 * @param {string[]} [include] - optional list of board pin labels to include (in order).
 *                                If omitted, all pins in QUBI_PIN_MAP are used.
 * @param {string[]} [exclude] - optional list of board pin labels to exclude.
 */
function qubiPinOptions(include, exclude) {
  const keys = include || Object.keys(QUBI_PIN_MAP);
  const ex = new Set(exclude || []);
  return keys
    .filter(k => QUBI_PIN_MAP[k] && !ex.has(k))
    .map(k => {
      const { gpio, note } = QUBI_PIN_MAP[k];
      const label = note ? `${k} (${note})` : k;
      return [label, gpio];
    });
}

/* ---------------- WORKSPACE HISTORY & LOADING ---------------- */
let workspaceHistory = [];
let historyIndex = -1;
const MAX_HISTORY = 50;
let isRestoring = false;

// Unified workspace loader to prevent duplicate event firing and visual bugs
function setWorkspaceFromDom(xmlDom) {
  isRestoring = true;
  workspace.clear();
  Blockly.Xml.domToWorkspace(xmlDom, workspace);
  isRestoring = false;
  updateCode();
  
  // Hook into Board Preview if it exists
  if (window.qubiResetSimState) window.qubiResetSimState();
  if (window.qubiRebuildSimBlocks) window.qubiRebuildSimBlocks();
}

function saveToHistory() {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const xmlText = Blockly.Xml.domToPrettyText(xml);

  workspaceHistory = workspaceHistory.slice(0, historyIndex + 1);
  workspaceHistory.push(xmlText);
  historyIndex++;

  if (workspaceHistory.length > MAX_HISTORY) {
    workspaceHistory.shift();
    historyIndex--;
  }
  updateUndoRedoButtons();
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    const xml = Blockly.utils.xml.textToDom(workspaceHistory[historyIndex]);
    setWorkspaceFromDom(xml);
    updateUndoRedoButtons();
  }
}

function redo() {
  if (historyIndex < workspaceHistory.length - 1) {
    historyIndex++;
    const xml = Blockly.utils.xml.textToDom(workspaceHistory[historyIndex]);
    setWorkspaceFromDom(xml);
    updateUndoRedoButtons();
  }
}

function updateUndoRedoButtons() {
  const undoBtn = $('undoBtn');
  const redoBtn = $('redoBtn');
  if (undoBtn) undoBtn.disabled = historyIndex <= 0;
  if (redoBtn) redoBtn.disabled = historyIndex >= workspaceHistory.length - 1;
}

/* ---------------- AUTO-SAVE ---------------- */
function autoSave() {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const xmlText = Blockly.Xml.domToPrettyText(xml);
  localStorage.setItem('workspace_autosave', xmlText);
  localStorage.setItem('autosave_timestamp', Date.now());
}
setInterval(autoSave, 30000);

/* ---------------- DARK MODE ---------------- */
const toggle = $("darkModeToggle");
if (toggle) {
  toggle.checked = false;
  toggle.addEventListener("change", () => {
    document.body.classList.toggle("dark", toggle.checked);
  });
}



/* ---------------- BLOCKLY INIT ---------------- */
const categoryTheme = Blockly.Theme.defineTheme('categoryTheme', {
  blockStyles: { logic_blocks: { colourPrimary: "#00e00b" } }
});

const workspace = Blockly.inject("blocklyDiv", {
  toolbox: `<xml>
    <category name="Control" colour="#7d73ff">
      <block type="start"></block>
      <block type="forever"></block>
      <block type="delay"></block>
    </category>

    <category name="Display" colour="#03A9F4">
      <block type="show_leds"></block>
      <block type="show_icon"></block>
      <block type="show_arrow"></block>
      <block type="show_animation"></block>
      <block type="show_number"></block>
      <block type="show_string"></block>
      <block type="set_pixel"></block>
      <block type="display_brightness"></block>
      <block type="clear_screen"></block>
    </category>

    <category name="Inputs" colour="#dd34ff">
      <block type="button_pressed"></block>
      <block type="on_button"></block>
      <block type="buttons_ab"></block>
      <block type="logo_touched"></block>
      <block type="on_logo"></block>
      <block type="ldr_level"></block>
      <block type="ldr_dark"></block>
      <block type="mpu_axis"></block>
      <block type="mpu_gesture"></block>
      <block type="lidar_mm"></block>
      <block type="lidar_closer"></block>
    </category>

    <category name="RGB LEDs" colour="#ffbf00">
      <block type="rgb_colour"></block>
      <block type="rgb_set"></block>
      <block type="rgb_brightness"></block>
      <block type="rgb_rainbow"></block>
      <block type="rgb_traffic"></block>
      <block type="rgb_off"></block>
    </category>

    <category name="Music" colour="#FF6F00">
      <block type="buzzer_note"></block>
      <block type="buzzer_melody"></block>
      <block type="buzzer_tone"></block>
      <block type="buzzer_set"></block>
      <block type="buzzer_stop"></block>
    </category>

    <category name="Pins" colour="#9C27B0">
      <block type="led_blink"></block>
      <block type="digital_write"></block>
      <block type="digital_read"></block>
      <block type="analog_read"></block>
      <block type="analog_write"></block>
    </category>

    <category name="Wi-Fi" colour="#2196F3">
      <block type="wifi_connect"></block>
      <block type="wifi_connected"></block>
      <block type="wifi_ip"></block>
      <block type="http_get"></block>
      <block type="http_post"></block>
      <block type="thingspeak"></block>
    </category>

    <category name="Bluetooth" colour="#3F51B5">
      <block type="bt_begin"></block>
      <block type="bt_available"></block>
      <block type="bt_read"></block>
      <block type="bt_send"></block>
      <block type="bt_on_receive"></block>
    </category>

    <category name="Loops" colour="#ff9800">
      <block type="repeat_do"></block>
      <block type="while_do"></block>
      <block type="for_do"></block>
      <block type="break"></block>
      <block type="continue"></block>
    </category>

    
    <category name="ESP-NOW" colour="#00BCD4">
      <block type="espnow_init"></block>
      <block type="espnow_set_role"></block>
      <block type="espnow_add_peer"></block>
      <block type="espnow_send_text"></block>
      <block type="espnow_send_number"></block>
      <block type="espnow_on_receive"></block>
      <block type="espnow_received_text"></block>
      <block type="espnow_received_number"></block>
      <block type="espnow_mac_address"></block>
    </category>

    <category name="Logic" colour="#00e00b">
      <block type="controls_if"></block>
      <block type="logic_compare"></block>
      <block type="logic_operation"></block>
      <block type="logic_not"></block>
      <block type="logic_boolean"></block>
    </category>

    <category name="Math" colour="#e91e63">
      <block type="math_number"></block>
      <block type="math_arithmetic"></block>
      <block type="math_random"></block>
      <block type="math_map"></block>
      <block type="math_constrain"></block>
      <block type="math_abs"></block>
    </category>

    <category name="Variables" colour="#000000" custom="VARIABLE">
    </category>

    <category name="Serial" colour="#ff261f">
      <block type="serial_begin"></block>
      <block type="serial_print"></block>
      <block type="serial_println"></block>
      <block type="serial_read"></block>
      <block type="serial_available"></block>
    </category>

    <sep></sep>

    <category name="Advanced" colour="#555566">

      <category name="Functions" colour="#6e3aff">
        <block type="func_define"></block>
        <block type="func_call"></block>
        <block type="func_define_return"></block>
        <block type="func_call_return"></block>
        <block type="func_return"></block>
      </category>

      <category name="Arrays" colour="#00897B">
        <block type="array_create"></block>
        <block type="array_get"></block>
        <block type="array_set"></block>
        <block type="array_length"></block>
        <block type="array_fill"></block>
      </category>

      <category name="Text" colour="#F06292">
        <block type="text_create"></block>
        <block type="text_length"></block>
        <block type="text_join"></block>
        <block type="text_char_at"></block>
        <block type="text_contains"></block>
        <block type="text_to_number"></block>
        <block type="text_number_to"></block>
      </category>

      <category name="Math Advanced" colour="#AD1457">
        <block type="math_trig"></block>
        <block type="math_sqrt"></block>
        <block type="math_pow"></block>
        <block type="math_floor_ceil"></block>
        <block type="math_modulo"></block>
        <block type="math_pi"></block>
      </category>

      <category name="Time" colour="#546E7A">
        <block type="time_millis"></block>
        <block type="time_micros"></block>
        <block type="time_elapsed"></block>
        <block type="time_every"></block>
      </category>

      <category name="Game" colour="#E65100">
        <block type="game_score"></block>
        <block type="game_add_score"></block>
        <block type="game_lives"></block>
        <block type="game_lose_life"></block>
        <block type="game_is_over"></block>
        <block type="game_show_score"></block>
        <block type="game_show_lives"></block>
        <block type="game_countdown"></block>
      </category>

      <category name="Timers" colour="#37474F">
        <block type="timer_start"></block>
        <block type="timer_read"></block>
        <block type="timer_reset"></block>
        <block type="timer_expired"></block>
      </category>

    </category>

  </xml>`,
  theme: categoryTheme,
  renderer: 'zelos',
  zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
  trashcan: true
});

// Register Search Toolbox Category
workspace.registerToolboxCategoryCallback('SEARCH', () => []);

// Extensions system uses BASE_TOOLBOX JS object (in QUBI_extensions.js) — no XML capture needed here.

let changeTimer;
workspace.addChangeListener((event) => {
  if (isRestoring || event.isUiEvent) return; // FIXED: Use isUiEvent instead of deprecated Blockly.Events.UI
  updateCode();
  clearTimeout(changeTimer);
  changeTimer = setTimeout(() => saveToHistory(), 500);
});

/* ---------------- GENERATOR ---------------- */
const arduinoGenerator = new Blockly.Generator('Arduino');
arduinoGenerator.INDENT = '  ';
// Setup standard order constants
arduinoGenerator.ORDER_ATOMIC = 0;
arduinoGenerator.ORDER_UNARY_POSTFIX = 1;
arduinoGenerator.ORDER_UNARY_PREFIX = 2;
arduinoGenerator.ORDER_MULTIPLICATIVE = 3;
arduinoGenerator.ORDER_ADDITIVE = 4;
arduinoGenerator.ORDER_SHIFT = 5;
arduinoGenerator.ORDER_RELATIONAL = 6;
arduinoGenerator.ORDER_EQUALITY = 7;
arduinoGenerator.ORDER_BITWISE_AND = 8;
arduinoGenerator.ORDER_BITWISE_XOR = 9;
arduinoGenerator.ORDER_BITWISE_OR = 10;
arduinoGenerator.ORDER_LOGICAL_AND = 11;
arduinoGenerator.ORDER_LOGICAL_OR = 12;
arduinoGenerator.ORDER_CONDITIONAL = 13;
arduinoGenerator.ORDER_ASSIGNMENT = 14;
arduinoGenerator.ORDER_NONE = 99;
arduinoGenerator.ORDER_MULTIPLICATION = arduinoGenerator.ORDER_MULTIPLICATIVE;
arduinoGenerator.ORDER_DIVISION = arduinoGenerator.ORDER_MULTIPLICATIVE;
arduinoGenerator.ORDER_ADDITION = arduinoGenerator.ORDER_ADDITIVE;
arduinoGenerator.ORDER_SUBTRACTION = arduinoGenerator.ORDER_ADDITIVE;
arduinoGenerator.ORDER_FUNCTION_CALL = arduinoGenerator.ORDER_UNARY_POSTFIX;

arduinoGenerator.scrub_ = function (block, code, opt_thisOnly) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  let nextCode = '';
  if (nextBlock && !opt_thisOnly) {
    nextCode = arduinoGenerator.blockToCode(nextBlock);
  }
  return code + nextCode;
};

let setupStatements = {};
let includeStatements = {};
let globalVariables = {};

// Expose on window so QUBI_extensions.js can write into them
window.setupStatements    = setupStatements;
window.includeStatements  = includeStatements;
window.globalVariables    = globalVariables;

/* ── Variable name helper: sanitise into valid C identifier ── */
function varName(name) {
  return name.replace(/[\s\-]/g, '_').replace(/[^a-zA-Z0-9_]/g, '').replace(/^([0-9])/, '_$1') || '_var';
}

/* ── variables_get : read a variable ── */
arduinoGenerator.forBlock['variables_get'] = function (block) {
  const name = varName(block.getField('VAR').getText());
  return [name, arduinoGenerator.ORDER_ATOMIC];
};

/* ── variables_set : assign a variable ── */
arduinoGenerator.forBlock['variables_set'] = function (block) {
  const name = varName(block.getField('VAR').getText());
  const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
  return `  ${name} = ${value};\n`;
};

/* ── math_change : "change variable by" ── */
arduinoGenerator.forBlock['math_change'] = function (block) {
  const name = varName(block.getField('VAR').getText());
  const delta = arduinoGenerator.valueToCode(block, 'DELTA', arduinoGenerator.ORDER_ADDITION) || '1';
  return `  ${name} += ${delta};\n`;
};

/* BLOCK DEFINITIONS & GENERATORS */

const _LC  = () => {   // MAX7219 LED matrix
  includeStatements['lc']  = '#include <MaxLedControl.h>';
  globalVariables['lc']    = 'LedControl lc = LedControl(18, 23, 19, 1);';
  setupStatements['lc']    = '  lc.shutdown(0, false);\n  lc.setIntensity(0, 8);\n  lc.clearDisplay(0);\n';
};
const _NP  = () => {   // WS2812B NeoPixel
  includeStatements['np']  = '#include <Adafruit_NeoPixel.h>';
  globalVariables['np']    = '#define WS_PIN 4\nAdafruit_NeoPixel pixels(2, WS_PIN, NEO_GRB + NEO_KHZ800);';
  setupStatements['np']    = '  pixels.begin();\n  pixels.clear();\n  pixels.show();\n';
};
const _BZ  = () => {   // Buzzer on GPIO5
  setupStatements['bz']    = '  ledcAttach(5, 2000, 8);\n';
};
const _MPU = () => {   // MPU6050
  includeStatements['mpu'] = '#include <Wire.h>\n#include <MPU6050.h>';
  globalVariables['mpu']   = 'MPU6050 mpu;';
  setupStatements['mpu']   = '  Wire.begin();\n  mpu.initialize();\n';
};
const _VL  = () => {   // VL53L0X LiDAR
  includeStatements['vl']  = '#include <Wire.h>\n#include <VL53L0X.h>';
  globalVariables['vl']    = 'VL53L0X lox;';
  setupStatements['vl']    = '  Wire.begin();\n  lox.init();\n  lox.setTimeout(500);\n';
};

/* ═══════════════════════════════════════════════════════════════════
   CONTROL
   ═══════════════════════════════════════════════════════════════════ */

Blockly.Blocks['start'] = {
  init() {
    this.appendStatementInput('BODY').setCheck(null).appendField('On start');
    this.setColour('#7d73ff');
    this.setTooltip('Runs once when QUBI powers on.');
  }
};
arduinoGenerator.forBlock['start'] = b => arduinoGenerator.statementToCode(b, 'BODY');

Blockly.Blocks['forever'] = {
  init() {
    this.appendStatementInput('BODY').setCheck(null).appendField('Forever');
    this.setColour('#7d73ff');
    this.setTooltip('Loops forever.');
  }
};
arduinoGenerator.forBlock['forever'] = b => arduinoGenerator.statementToCode(b, 'BODY');

Blockly.Blocks['delay'] = {
  init() {
    this.appendDummyInput()
      .appendField('Pause')
      .appendField(new Blockly.FieldNumber(1000, 0), 'MS')
      .appendField('ms');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#7d73ff');
    this.setTooltip('Wait before running the next block.');
  }
};
arduinoGenerator.forBlock['delay'] = b => `  delay(${b.getFieldValue('MS')});\n`;


/* ═══════════════════════════════════════════════════════════════════
   DISPLAY  —  5×5 red LED matrix (MAX7219)
   ═══════════════════════════════════════════════════════════════════ */

/* ── Draw custom pattern with checkboxes ── */
Blockly.Blocks['show_leds'] = {
  init() {
    this.appendDummyInput().appendField('Show LEDs');
    for (let r = 0; r < 5; r++) {
      const row = this.appendDummyInput().setAlign(Blockly.ALIGN_CENTRE);
      for (let c = 0; c < 5; c++) row.appendField(new Blockly.FieldCheckbox('FALSE'), `L${r}${c}`);
    }
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#03A9F4');
    this.setTooltip('Light up specific LEDs on the 5×5 grid.');
  }
};
arduinoGenerator.forBlock['show_leds'] = function (b) {
  _LC();
  let code = '';
  for (let r = 0; r < 5; r++) {
    let byte_ = 0;
    for (let c = 0; c < 5; c++) if (b.getFieldValue(`L${r}${c}`) === 'TRUE') byte_ |= (1 << (6 - c));
    code += `  lc.setRow(0, ${r}, 0x${byte_.toString(16).padStart(2,'0').toUpperCase()});\n`;
  }
  // clear unused MAX7219 rows to prevent ghost pixels
  for (let r = 5; r < 8; r++) code += `  lc.setRow(0, ${r}, 0x00);\n`;
  return code;
};

/* ── Predefined icons ── */
Blockly.Blocks['show_icon'] = {
  init() {
    this.appendDummyInput()
      .appendField('Show icon')
      .appendField(new Blockly.FieldDropdown([
        ['Heart','HEART'],       ['Happy 😊','HAPPY'],   ['Sad 😞','SAD'],
        ['Angry 😠','ANGRY'],    ['Surprised 😮','SURP'],['Confused 😕','CONF'],
        ['Star ★','STAR'],       ['Check ✓','CHECK'],    ['Cross ✗','CROSS'],
        ['Square','SQUARE'],     ['Diamond','DIAMOND'],  ['Target','TARGET'],
        ['Music ♪','MUSIC'],     ['Lock 🔒','LOCK'],     ['Skull','SKULL'],
        ['WiFi','WIFI'],    ['Bluetooth','BT'],
      ]), 'ICON');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#03A9F4');
    this.setTooltip('Display a built-in icon on the LED grid.');
  }
};
arduinoGenerator.forBlock['show_icon'] = function (b) {
  _LC();
  const icon = b.getFieldValue('ICON');
  // 8 bytes — rows 0-4 used on the 5×5 grid; rows 5-7 always 0x00
  const MAP = {
    HEART:    '0x28,0x7C,0x7C,0x38,0x10,0x00,0x00,0x00',
    HAPPY:    '0x28,0x00,0x44,0x38,0x00,0x00,0x00,0x00',
    SAD:      '0x28,0x00,0x38,0x44,0x00,0x00,0x00,0x00',
    ANGRY:    '0x44,0x28,0x00,0x38,0x44,0x00,0x00,0x00',
    SURP:     '0x28,0x00,0x10,0x28,0x10,0x00,0x00,0x00',
    CONF:     '0x28,0x00,0x0C,0x30,0x40,0x00,0x00,0x00',
    STAR:     '0x10,0x7C,0x38,0x54,0x10,0x00,0x00,0x00',
    CHECK:    '0x04,0x08,0x50,0x20,0x00,0x00,0x00,0x00',
    CROSS:    '0x44,0x28,0x10,0x28,0x44,0x00,0x00,0x00',
    SQUARE:   '0x7C,0x44,0x44,0x44,0x7C,0x00,0x00,0x00',
    DIAMOND:  '0x10,0x28,0x44,0x28,0x10,0x00,0x00,0x00',
    TARGET:   '0x38,0x54,0x7C,0x54,0x38,0x00,0x00,0x00',
    MUSIC:    '0x3C,0x24,0x24,0x6C,0x6C,0x00,0x00,0x00',
    LOCK:     '0x38,0x28,0x7C,0x54,0x7C,0x00,0x00,0x00',
    SKULL:    '0x38,0x54,0x7C,0x38,0x38,0x00,0x00,0x00',
    WIFI:     '0x7C,0x00,0x38,0x00,0x10,0x00,0x00,0x00',
    BT:       '0x18,0x54,0x38,0x54,0x18,0x00,0x00,0x00',
  };
  if (!globalVariables[`icon_${icon}`]) {
    globalVariables[`icon_${icon}`] =
      `byte ICO_${icon}[8] = {${MAP[icon]}};\n` +
      `void showIcon_${icon}() { for(int i=0;i<8;i++) lc.setRow(0,i,ICO_${icon}[i]); }`;
  }
  return `  showIcon_${icon}();\n`;
};

/* ── Arrow ── */
Blockly.Blocks['show_arrow'] = {
  init() {
    this.appendDummyInput()
      .appendField('Show arrow')
      .appendField(new Blockly.FieldDropdown([
        ['↑ North','N'], ['↓ South','S'], ['→ East','E'], ['← West','W'],
        ['↗ NE','NE'],   ['↘ SE','SE'],   ['↖ NW','NW'], ['↙ SW','SW'],
      ]), 'DIR');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#03A9F4');
    this.setTooltip('Show a directional arrow on the LED grid.');
  }
};
arduinoGenerator.forBlock['show_arrow'] = function (b) {
  _LC();
  const dir = b.getFieldValue('DIR');
  const MAP = {
    N:  '0x10,0x38,0x54,0x10,0x10,0x00,0x00,0x00',
    S:  '0x10,0x10,0x54,0x38,0x10,0x00,0x00,0x00',
    E:  '0x10,0x08,0x7C,0x08,0x10,0x00,0x00,0x00',
    W:  '0x10,0x20,0x7C,0x20,0x10,0x00,0x00,0x00',
    NE: '0x1C,0x0C,0x14,0x20,0x40,0x00,0x00,0x00',
    SE: '0x40,0x20,0x14,0x0C,0x1C,0x00,0x00,0x00',
    NW: '0x70,0x60,0x50,0x08,0x04,0x00,0x00,0x00',
    SW: '0x04,0x08,0x50,0x60,0x70,0x00,0x00,0x00',
  };
  if (!globalVariables[`arrow_${dir}`]) {
    globalVariables[`arrow_${dir}`] =
      `byte ARR_${dir}[8] = {${MAP[dir]}};\n` +
      `void showArrow_${dir}() { for(int i=0;i<8;i++) lc.setRow(0,i,ARR_${dir}[i]); }`;
  }
  return `  showArrow_${dir}();\n`;
};

/* ── Show a single digit 0-9 ── */
Blockly.Blocks['show_number'] = {
  init() {
    this.appendValueInput('NUM').setCheck('Number').appendField('Show number');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#03A9F4');
    this.setTooltip('Show a single digit (0–9) on the LED grid.');
  }
};
arduinoGenerator.forBlock['show_number'] = function (b) {
  _LC();
  const num = arduinoGenerator.valueToCode(b, 'NUM', arduinoGenerator.ORDER_ATOMIC) || '0';
  if (!globalVariables['digit_fn']) {
    globalVariables['digit_fn'] = `
byte DIGITS[10][8] = {
  {0x70,0x88,0x88,0x88,0x70,0x00,0x00,0x00}, // 0
  {0x20,0x60,0x20,0x20,0x70,0x00,0x00,0x00}, // 1
  {0x70,0x08,0x70,0x80,0xF8,0x00,0x00,0x00}, // 2
  {0x70,0x08,0x70,0x08,0x70,0x00,0x00,0x00}, // 3
  {0x88,0x88,0xF8,0x08,0x08,0x00,0x00,0x00}, // 4
  {0xF8,0x80,0xF0,0x08,0xF0,0x00,0x00,0x00}, // 5
  {0x70,0x80,0xF0,0x88,0x70,0x00,0x00,0x00}, // 6
  {0xF8,0x08,0x10,0x20,0x20,0x00,0x00,0x00}, // 7
  {0x70,0x88,0x70,0x88,0x70,0x00,0x00,0x00}, // 8
  {0x70,0x88,0x78,0x08,0x70,0x00,0x00,0x00}  // 9
};
void showDigit(int d) {
  lc.clearDisplay(0);
  if (d >= 0 && d <= 9) for (int r = 0; r < 8; r++) lc.setRow(0, r, DIGITS[d][r] >> 1);
}`;
  }
  return `  showDigit(${num});\n`;
};

/* ── Scroll text A-Z ── */
Blockly.Blocks['show_string'] = {
  init() {
    this.appendDummyInput()
      .appendField('Scroll text')
      .appendField(new Blockly.FieldTextInput('HELLO'), 'TEXT');
    this.appendDummyInput()
      .appendField('speed (ms/char)')
      .appendField(new Blockly.FieldNumber(150, 10, 2000), 'SPD');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#03A9F4');
    this.setTooltip('Scroll text across the LED grid one character at a time.');
  }
};
arduinoGenerator.forBlock['show_string'] = function (b) {
  _LC();
  const text = b.getFieldValue('TEXT').toUpperCase();
  const spd  = b.getFieldValue('SPD');
  if (!globalVariables['font_fn']) {
    globalVariables['font_fn'] = `
byte FONT5[26][5] = {
  {0x70,0x88,0xF8,0x88,0x88},{0xF0,0x88,0xF0,0x88,0xF0},
  {0x70,0x88,0x80,0x88,0x70},{0xF0,0x88,0x88,0x88,0xF0},
  {0xF8,0x80,0xF0,0x80,0xF8},{0xF8,0x80,0xF0,0x80,0x80},
  {0x70,0x80,0xB8,0x88,0x70},{0x88,0x88,0xF8,0x88,0x88},
  {0xF8,0x20,0x20,0x20,0xF8},{0x08,0x08,0x08,0x88,0x70},
  {0x88,0x90,0xE0,0x90,0x88},{0x80,0x80,0x80,0x80,0xF8},
  {0x88,0xD8,0xA8,0x88,0x88},{0x88,0xC8,0xA8,0x98,0x88},
  {0x70,0x88,0x88,0x88,0x70},{0xF0,0x88,0xF0,0x80,0x80},
  {0x70,0x88,0x88,0x98,0x78},{0xF0,0x88,0xF0,0x90,0x88},
  {0x78,0x80,0x70,0x08,0xF0},{0xF8,0x20,0x20,0x20,0x20},
  {0x88,0x88,0x88,0x88,0x70},{0x88,0x88,0x88,0x50,0x20},
  {0x88,0x88,0xA8,0xD8,0x88},{0x88,0x50,0x20,0x50,0x88},
  {0x88,0x88,0x70,0x20,0x20},{0xF8,0x10,0x20,0x40,0xF8}
};
void showChar(char c) {
  if (c < 'A' || c > 'Z') { lc.clearDisplay(0); return; }
  lc.clearDisplay(0);
  for (int r = 0; r < 5; r++) lc.setRow(0, r, FONT5[c-'A'][r] >> 1);
}
void scrollText(const char* s, int d) {
  for (int i = 0; s[i]; i++) { showChar(s[i]); delay(d); }
  lc.clearDisplay(0);
}`;
  }
  return `  scrollText("${text}", ${spd});\n`;
};

/* ── Set a single pixel ── */
Blockly.Blocks['set_pixel'] = {
  init() {
    this.appendDummyInput()
      .appendField('Set pixel  row')
      .appendField(new Blockly.FieldNumber(0, 1, 5), 'ROW')
      .appendField('col')
      .appendField(new Blockly.FieldNumber(0, 1, 5), 'COL')
      .appendField(new Blockly.FieldDropdown([['ON','true'],['OFF','false']]), 'ST');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#03A9F4');
    this.setTooltip('Turn a single LED on or off. Row 0 = top, Col 0 = left.');
  }
};
arduinoGenerator.forBlock['set_pixel'] = function (b) {
  _LC();
  const row = b.getFieldValue('ROW');
  const col = parseInt(b.getFieldValue('COL'));
  const st  = b.getFieldValue('ST');
  // Grid col 0 = bit6 of the row byte (shifted >>1 from full byte)
  return `  lc.setLed(0, ${row-1}, ${col}, ${st});\n`;
};

/* ── Brightness control ── */
Blockly.Blocks['display_brightness'] = {
  init() {
    this.appendDummyInput()
      .appendField('Set display brightness')
      .appendField(new Blockly.FieldNumber(8, 0, 15), 'LVL');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#03A9F4');
    this.setTooltip('0 = dimmest, 15 = brightest.');
  }
};
arduinoGenerator.forBlock['display_brightness'] = function (b) {
  _LC();
  return `  lc.setIntensity(0, ${b.getFieldValue('LVL')});\n`;
};

/* ── Clear screen ── */
Blockly.Blocks['clear_screen'] = {
  init() {
    this.appendDummyInput().appendField('Clear screen');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#03A9F4');
    this.setTooltip('Turn off every LED on the grid.');
  }
};
arduinoGenerator.forBlock['clear_screen'] = function () {
  _LC();
  return `  lc.clearDisplay(0);\n`;
};

/* ── Animation presets ── */
Blockly.Blocks['show_animation'] = {
  init() {
    this.appendDummyInput()
      .appendField('Play animation')
      .appendField(new Blockly.FieldDropdown([
        ['Heartbeat','HEART'],
        ['Loading spinner','LOAD'],
        ['Arrow scroll left','ARR_L'],
        ['Arrow scroll right','ARR_R'],
        ['Dot sweep','DOT'],
        ['Expanding square','EXPAND'],
        ['Countdown 3-2-1','COUNT'],
      ]), 'ANIM');
    this.appendDummyInput()
      .appendField('frame delay (ms)')
      .appendField(new Blockly.FieldNumber(120, 30, 2000), 'SPD');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#03A9F4');
    this.setTooltip('Run a built-in animation on the LED grid.');
  }
};
arduinoGenerator.forBlock['show_animation'] = function (b) {
  _LC();
  const anim = b.getFieldValue('ANIM');
  const spd  = b.getFieldValue('SPD');
  const DEFS = {
    HEART:  `byte anim_HEART[][8]={{0x28,0x7C,0x7C,0x38,0x10,0x00,0x00,0x00},{0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00},{0x28,0x7C,0x7C,0x38,0x10,0x00,0x00,0x00},{0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00}};`,
    LOAD:   `byte anim_LOAD[][8]={{0x10,0x00,0x00,0x00,0x00,0x00,0x00,0x00},{0x38,0x10,0x00,0x00,0x00,0x00,0x00,0x00},{0x7C,0x38,0x10,0x00,0x00,0x00,0x00,0x00},{0x38,0x7C,0x38,0x10,0x00,0x00,0x00,0x00},{0x10,0x38,0x7C,0x38,0x10,0x00,0x00,0x00},{0x00,0x10,0x38,0x7C,0x38,0x00,0x00,0x00},{0x00,0x00,0x10,0x38,0x7C,0x00,0x00,0x00},{0x00,0x00,0x00,0x10,0x38,0x00,0x00,0x00}};`,
    ARR_L:  `byte anim_ARR_L[][8]={{0x10,0x20,0x7C,0x20,0x10,0x00,0x00,0x00},{0x20,0x40,0x78,0x40,0x20,0x00,0x00,0x00},{0x40,0x00,0x74,0x00,0x40,0x00,0x00,0x00},{0x00,0x04,0x6C,0x04,0x00,0x00,0x00,0x00}};`,
    ARR_R:  `byte anim_ARR_R[][8]={{0x10,0x08,0x7C,0x08,0x10,0x00,0x00,0x00},{0x08,0x04,0x3C,0x04,0x08,0x00,0x00,0x00},{0x04,0x00,0x5C,0x00,0x04,0x00,0x00,0x00},{0x00,0x40,0x6C,0x40,0x00,0x00,0x00,0x00}};`,
    DOT:    `byte anim_DOT[][8]={{0x40,0,0,0,0,0,0,0},{0x20,0,0,0,0,0,0,0},{0x10,0,0,0,0,0,0,0},{0x08,0,0,0,0,0,0,0},{0x04,0,0,0,0,0,0,0},{0,0x40,0,0,0,0,0,0},{0,0x20,0,0,0,0,0,0},{0,0x10,0,0,0,0,0,0},{0,0x08,0,0,0,0,0,0},{0,0x04,0,0,0,0,0,0},{0,0,0x40,0,0,0,0,0},{0,0,0x20,0,0,0,0,0},{0,0,0x10,0,0,0,0,0},{0,0,0x08,0,0,0,0,0},{0,0,0x04,0,0,0,0,0},{0,0,0,0x40,0,0,0,0},{0,0,0,0x20,0,0,0,0},{0,0,0,0x10,0,0,0,0},{0,0,0,0x08,0,0,0,0},{0,0,0,0x04,0,0,0,0},{0,0,0,0,0x40,0,0,0},{0,0,0,0,0x20,0,0,0},{0,0,0,0,0x10,0,0,0},{0,0,0,0,0x08,0,0,0},{0,0,0,0,0x04,0,0,0}};`,
    EXPAND: `byte anim_EXPAND[][8]={{0x00,0x00,0x10,0x00,0x00,0x00,0x00,0x00},{0x00,0x38,0x28,0x38,0x00,0x00,0x00,0x00},{0x00,0x7C,0x44,0x44,0x7C,0x00,0x00,0x00},{0x7C,0x44,0x44,0x44,0x44,0x7C,0x00,0x00}};`,
    COUNT:  `byte anim_COUNT[][8]={{0xF8,0x08,0x70,0x08,0xF0,0x00,0x00,0x00},{0x88,0x88,0xF8,0x08,0x08,0x00,0x00,0x00},{0x20,0x60,0x20,0x20,0x70,0x00,0x00,0x00}};`,
  };
  if (!globalVariables[`anim_${anim}`]) {
    globalVariables[`anim_${anim}`] = `
${DEFS[anim]}
void playAnim_${anim}(int ms) {
  int fr = sizeof(anim_${anim}) / sizeof(anim_${anim}[0]);
  for (int f = 0; f < fr; f++) {
    for (int r = 0; r < 8; r++) lc.setRow(0, r, anim_${anim}[f][r]);
    delay(ms);
  }
}`;
  }
  return `  playAnim_${anim}(${spd});\n`;
};

/* ═══════════════════════════════════════════════════════════════════
   INPUTS
   ═══════════════════════════════════════════════════════════════════ */

/* ── Buttons A (GPIO16) / B (GPIO17) ── */
Blockly.Blocks['button_pressed'] = {
  init() {
    this.appendDummyInput()
      .appendField('Button')
      .appendField(new Blockly.FieldDropdown([['A','16'],['B','17']]), 'PIN')
      .appendField('pressed?');
    this.setOutput(true, 'Boolean');
    this.setColour('#dd34ff');
    this.setTooltip('True while the button is held down.');
  }
};
arduinoGenerator.forBlock['button_pressed'] = function (b) {
  const pin = b.getFieldValue('PIN');
  setupStatements[`btn${pin}`] = `  pinMode(${pin}, INPUT_PULLUP);\n`;
  return [`(!digitalRead(${pin}))`, arduinoGenerator.ORDER_ATOMIC];
};

/* Edge-triggered: run once per press, not every loop tick */
Blockly.Blocks['on_button'] = {
  init() {
    this.appendStatementInput('DO')
      .appendField('On button')
      .appendField(new Blockly.FieldDropdown([['A','16'],['B','17']]), 'PIN')
      .appendField('pressed');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#dd34ff');
    this.setTooltip('Runs once each time the button is pressed (not held).');
  }
};
arduinoGenerator.forBlock['on_button'] = function (b) {
  const pin  = b.getFieldValue('PIN');
  const body = arduinoGenerator.statementToCode(b, 'DO');
  setupStatements[`btn${pin}`] = `  pinMode(${pin}, INPUT_PULLUP);\n`;
  if (!globalVariables[`btnPrev${pin}`]) globalVariables[`btnPrev${pin}`] = `bool _bPrev${pin} = false;`;
  return (
    `  { bool _bNow${pin} = !digitalRead(${pin});\n` +
    `    if (_bNow${pin} && !_bPrev${pin}) {\n${body}    }\n` +
    `    _bPrev${pin} = _bNow${pin}; }\n`
  );
};

/* Both buttons at once */
Blockly.Blocks['buttons_ab'] = {
  init() {
    this.appendDummyInput().appendField('Buttons A + B both pressed?');
    this.setOutput(true, 'Boolean');
    this.setColour('#dd34ff');
    this.setTooltip('True when both A and B are held at the same time.');
  }
};
arduinoGenerator.forBlock['buttons_ab'] = function () {
  setupStatements['btn16'] = `  pinMode(16, INPUT_PULLUP);\n`;
  setupStatements['btn17'] = `  pinMode(17, INPUT_PULLUP);\n`;
  return ['(!digitalRead(16) && !digitalRead(17))', arduinoGenerator.ORDER_LOGICAL_AND];
};

/* ── Touch logo (GPIO13, capacitive) ── */
Blockly.Blocks['logo_touched'] = {
  init() {
    this.appendDummyInput().appendField('Logo touched?');
    this.setOutput(true, 'Boolean');
    this.setColour('#dd34ff');
    this.setTooltip('True while the touch logo pad is being touched.');
  }
};
arduinoGenerator.forBlock['logo_touched'] = function () {
  if (!globalVariables['logo_def']) globalVariables['logo_def'] = '#define LOGO_PIN 13\n#define LOGO_THRESH 600';
  return ['(touchRead(LOGO_PIN) < LOGO_THRESH)', arduinoGenerator.ORDER_RELATIONAL];
};

/* Edge-triggered logo touch */
Blockly.Blocks['on_logo'] = {
  init() {
    this.appendStatementInput('DO').appendField('On logo touch');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#dd34ff');
    this.setTooltip('Runs once each time the logo is touched (not held).');
  }
};
arduinoGenerator.forBlock['on_logo'] = function (b) {
  const body = arduinoGenerator.statementToCode(b, 'DO');
  if (!globalVariables['logo_def'])   globalVariables['logo_def']   = '#define LOGO_PIN 13\n#define LOGO_THRESH 600';
  if (!globalVariables['logo_state']) globalVariables['logo_state'] = 'bool _logoPrev = false;';
  return (
    `  { bool _logoNow = (touchRead(LOGO_PIN) < LOGO_THRESH);\n` +
    `    if (_logoNow && !_logoPrev) {\n${body}    }\n` +
    `    _logoPrev = _logoNow; }\n`
  );
};

/* ── LDR (GPIO34) ── */
Blockly.Blocks['ldr_level'] = {
  init() {
    this.appendDummyInput().appendField('Light level (0–4095)');
    this.setOutput(true, 'Number');
    this.setColour('#dd34ff');
    this.setTooltip('Read the light sensor. 0 = dark, 4095 = very bright.');
  }
};
arduinoGenerator.forBlock['ldr_level'] = () => ['analogRead(34)', arduinoGenerator.ORDER_ATOMIC];

Blockly.Blocks['ldr_dark'] = {
  init() {
    this.appendDummyInput()
      .appendField('Is dark?  threshold')
      .appendField(new Blockly.FieldNumber(2000, 0, 4095), 'T');
    this.setOutput(true, 'Boolean');
    this.setColour('#dd34ff');
    this.setTooltip('True when the light level is below the threshold (room is dark).');
  }
};
arduinoGenerator.forBlock['ldr_dark'] = b => [`(analogRead(34) < ${b.getFieldValue('T')})`, arduinoGenerator.ORDER_RELATIONAL];

/* ── MPU6050 ── */
Blockly.Blocks['mpu_axis'] = {
  init() {
    this.appendDummyInput()
      .appendField('MPU6050')
      .appendField(new Blockly.FieldDropdown([
        ['Accel X','AX'],['Accel Y','AY'],['Accel Z','AZ'],
        ['Gyro X','GX'], ['Gyro Y','GY'], ['Gyro Z','GZ'],
      ]), 'AXIS');
    this.setOutput(true, 'Number');
    this.setColour('#dd34ff');
    this.setTooltip('Read a raw accelerometer or gyroscope value from the MPU6050.');
  }
};
arduinoGenerator.forBlock['mpu_axis'] = function (b) {
  _MPU();
  const MAP = {
    AX:'mpu.getAccelerationX()', AY:'mpu.getAccelerationY()', AZ:'mpu.getAccelerationZ()',
    GX:'mpu.getRotationX()',     GY:'mpu.getRotationY()',     GZ:'mpu.getRotationZ()',
  };
  return [MAP[b.getFieldValue('AXIS')], arduinoGenerator.ORDER_ATOMIC];
};

Blockly.Blocks['mpu_gesture'] = {
  init() {
    this.appendDummyInput()
      .appendField('Gesture:')
      .appendField(new Blockly.FieldDropdown([
        ['Shake','SHAKE'],
        ['Tilt left','TILT_L'], ['Tilt right','TILT_R'],
        ['Tilt forward','TILT_F'], ['Tilt back','TILT_B'],
        ['Face up','FACE_U'], ['Face down','FACE_D'],
        ['Free fall','FALL'],
      ]), 'G');
    this.setOutput(true, 'Boolean');
    this.setColour('#dd34ff');
    this.setTooltip('Detect a physical gesture using the accelerometer.');
  }
};
arduinoGenerator.forBlock['mpu_gesture'] = function (b) {
  _MPU();
  const g = b.getFieldValue('G');
  const HELPERS = {
    SHAKE:  `bool qubi_shake() { int16_t ax=mpu.getAccelerationX(),ay=mpu.getAccelerationY(),az=mpu.getAccelerationZ(); return sqrt((float)ax*ax+(float)ay*ay+(float)az*az)/16384.0>2.0; }`,
    TILT_L: `bool qubi_tiltL() { int16_t ay=mpu.getAccelerationY(),az=mpu.getAccelerationZ(); return ay<-8000&&abs(az)<8000; }`,
    TILT_R: `bool qubi_tiltR() { int16_t ay=mpu.getAccelerationY(),az=mpu.getAccelerationZ(); return ay>8000&&abs(az)<8000; }`,
    TILT_F: `bool qubi_tiltF() { int16_t ax=mpu.getAccelerationX(),az=mpu.getAccelerationZ(); return ax>8000&&abs(az)<8000; }`,
    TILT_B: `bool qubi_tiltB() { int16_t ax=mpu.getAccelerationX(),az=mpu.getAccelerationZ(); return ax<-8000&&abs(az)<8000; }`,
    FACE_U: `bool qubi_faceU() { return mpu.getAccelerationZ()>14000; }`,
    FACE_D: `bool qubi_faceD() { return mpu.getAccelerationZ()<-14000; }`,
    FALL:   `bool qubi_fall()  { int16_t ax=mpu.getAccelerationX(),ay=mpu.getAccelerationY(),az=mpu.getAccelerationZ(); return sqrt((float)ax*ax+(float)ay*ay+(float)az*az)/16384.0<0.3; }`,
  };
  const CALLS = {
    SHAKE:'qubi_shake()', TILT_L:'qubi_tiltL()', TILT_R:'qubi_tiltR()',
    TILT_F:'qubi_tiltF()', TILT_B:'qubi_tiltB()',
    FACE_U:'qubi_faceU()', FACE_D:'qubi_faceD()', FALL:'qubi_fall()',
  };
  if (!globalVariables[`gest_${g}`]) globalVariables[`gest_${g}`] = HELPERS[g];
  return [CALLS[g], arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ── LiDAR VL53L0X ── */
Blockly.Blocks['lidar_mm'] = {
  init() {
    this.appendDummyInput().appendField('Distance (mm)');
    this.setOutput(true, 'Number');
    this.setColour('#dd34ff');
    this.setTooltip('Read distance from the VL53L0X LiDAR sensor in millimetres.');
  }
};
arduinoGenerator.forBlock['lidar_mm'] = function () {
  _VL();
  return ['lox.readRangeSingleMillimeters()', arduinoGenerator.ORDER_ATOMIC];
};

Blockly.Blocks['lidar_closer'] = {
  init() {
    this.appendDummyInput()
      .appendField('Object closer than')
      .appendField(new Blockly.FieldNumber(200, 10, 2000), 'MM')
      .appendField('mm?');
    this.setOutput(true, 'Boolean');
    this.setColour('#dd34ff');
    this.setTooltip('True when an object is detected within the set distance.');
  }
};
arduinoGenerator.forBlock['lidar_closer'] = function (b) {
  _VL();
  return [`(lox.readRangeSingleMillimeters() < ${b.getFieldValue('MM')})`, arduinoGenerator.ORDER_RELATIONAL];
};

/* ═══════════════════════════════════════════════════════════════════
   RGB LEDs  —  2× WS2812B on GPIO4 (index 0 and 1)
   ═══════════════════════════════════════════════════════════════════ */

/* Named colour picker — easiest block for beginners */
Blockly.Blocks['rgb_colour'] = {
  init() {
    this.appendDummyInput()
      .appendField('Set RGB')
      .appendField(new Blockly.FieldDropdown([['LED 1','0'],['LED 2','1'],['Both','B']]), 'LED')
      .appendField('to')
      .appendField(new Blockly.FieldDropdown([
        ['Red','255,0,0'],      ['Green','0,255,0'],    ['Blue','0,0,255'],
        ['White','255,255,255'],['Yellow','255,255,0'], ['Cyan','0,255,255'],
        ['Magenta','255,0,255'],['Orange','255,128,0'], ['Purple','128,0,255'],
        ['Pink','255,20,147'],  ['Off','0,0,0'],
      ]), 'COL');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#ffbf00');
    this.setTooltip('Set one or both RGB LEDs to a named colour.');
  }
};
arduinoGenerator.forBlock['rgb_colour'] = function (b) {
  _NP();
  const led = b.getFieldValue('LED');
  const col = b.getFieldValue('COL');
  if (led === 'B') return `  pixels.fill(pixels.Color(${col}));\n  pixels.show();\n`;
  return `  pixels.setPixelColor(${led}, pixels.Color(${col}));\n  pixels.show();\n`;
};

/* Custom R G B ── */
Blockly.Blocks['rgb_set'] = {
  init() {
    this.appendDummyInput()
      .appendField('Set RGB')
      .appendField(new Blockly.FieldDropdown([['LED 1','0'],['LED 2','1'],['Both','B']]), 'LED')
      .appendField('R').appendField(new Blockly.FieldNumber(0, 0, 255), 'R')
      .appendField('G').appendField(new Blockly.FieldNumber(0, 0, 255), 'G')
      .appendField('B').appendField(new Blockly.FieldNumber(0, 0, 255), 'B');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#ffbf00');
    this.setTooltip('Set precise R, G, B values (0–255) for one or both LEDs.');
  }
};
arduinoGenerator.forBlock['rgb_set'] = function (b) {
  _NP();
  const led = b.getFieldValue('LED');
  const r = b.getFieldValue('R'), g = b.getFieldValue('G'), bv = b.getFieldValue('B');
  if (led === 'B') return `  pixels.fill(pixels.Color(${r},${g},${bv}));\n  pixels.show();\n`;
  return `  pixels.setPixelColor(${led}, pixels.Color(${r},${g},${bv}));\n  pixels.show();\n`;
};

/* Brightness */
Blockly.Blocks['rgb_brightness'] = {
  init() {
    this.appendDummyInput()
      .appendField('RGB brightness')
      .appendField(new Blockly.FieldNumber(50, 0, 255), 'BR');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#ffbf00');
    this.setTooltip('Set global brightness for both RGB LEDs (0 = off, 255 = max).');
  }
};
arduinoGenerator.forBlock['rgb_brightness'] = function (b) {
  _NP();
  return `  pixels.setBrightness(${b.getFieldValue('BR')});\n  pixels.show();\n`;
};

/* Rainbow cycle */
Blockly.Blocks['rgb_rainbow'] = {
  init() {
    this.appendDummyInput()
      .appendField('RGB rainbow  speed (ms)')
      .appendField(new Blockly.FieldNumber(10, 1, 500), 'SPD');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#ffbf00');
    this.setTooltip('Cycle both RGB LEDs through rainbow colours continuously.');
  }
};
arduinoGenerator.forBlock['rgb_rainbow'] = function (b) {
  _NP();
  const spd = b.getFieldValue('SPD');
  if (!globalVariables['wheel']) {
    globalVariables['wheel'] = `
uint32_t colorWheel(byte p) {
  p = 255 - p;
  if (p < 85)  return pixels.Color(255-p*3, 0, p*3);
  if (p < 170) { p -= 85; return pixels.Color(0, p*3, 255-p*3); }
  p -= 170; return pixels.Color(p*3, 255-p*3, 0);
}`;
  }
  return (
    `  for (int _w = 0; _w < 256; _w++) {\n` +
    `    pixels.setPixelColor(0, colorWheel(_w));\n` +
    `    pixels.setPixelColor(1, colorWheel((_w + 128) % 256));\n` +
    `    pixels.show();\n` +
    `    delay(${spd});\n` +
    `  }\n`
  );
};

/* Traffic light demo — uses both the RGB LEDs and the LED grid */
Blockly.Blocks['rgb_traffic'] = {
  init() {
    this.appendDummyInput()
      .appendField('Traffic light  LED')
      .appendField(new Blockly.FieldDropdown([['1','0'],['2','1']]), 'LED')
      .appendField('phase delay (ms)')
      .appendField(new Blockly.FieldNumber(1000, 100, 10000), 'D');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#ffbf00');
    this.setTooltip('Cycle Red → Yellow → Green on an RGB LED and show "S/Y/G" on the LED grid.');
  }
};
arduinoGenerator.forBlock['rgb_traffic'] = function (b) {
  _LC(); _NP();
  const led = b.getFieldValue('LED');
  const d   = b.getFieldValue('D');
  if (!globalVariables['traffic_fn']) {
    globalVariables['traffic_fn'] = `
// Traffic light letter helpers (5×5 grid, rows)
const byte TL_S[5] = {0x70,0x40,0x30,0x08,0x70}; // S
const byte TL_Y[5] = {0x88,0x50,0x20,0x20,0x20}; // Y
const byte TL_G[5] = {0x38,0x40,0x58,0x48,0x38}; // G
void showTLChar(const byte* ch) {
  lc.clearDisplay(0);
  for (int r = 0; r < 5; r++) lc.setRow(0, r, ch[r] >> 1);
}`;
  }
  return (
    `  pixels.setPixelColor(${led}, pixels.Color(255,0,0)); pixels.show(); showTLChar(TL_S); delay(${d});\n` +
    `  pixels.setPixelColor(${led}, pixels.Color(255,200,0)); pixels.show(); showTLChar(TL_Y); delay(${d});\n` +
    `  pixels.setPixelColor(${led}, pixels.Color(0,255,0)); pixels.show(); showTLChar(TL_G); delay(${d});\n`
  );
};

/* Turn off */
Blockly.Blocks['rgb_off'] = {
  init() {
    this.appendDummyInput()
      .appendField('Turn off RGB')
      .appendField(new Blockly.FieldDropdown([['LED 1','0'],['LED 2','1'],['Both','B']]), 'LED');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#ffbf00');
    this.setTooltip('Turn off one or both RGB LEDs.');
  }
};
arduinoGenerator.forBlock['rgb_off'] = function (b) {
  _NP();
  const led = b.getFieldValue('LED');
  if (led === 'B') return `  pixels.clear();\n  pixels.show();\n`;
  return `  pixels.setPixelColor(${led}, pixels.Color(0,0,0));\n  pixels.show();\n`;
};

/* ═══════════════════════════════════════════════════════════════════
   BUZZER  —  GPIO5
   ═══════════════════════════════════════════════════════════════════ */

/* Simple on/off */
Blockly.Blocks['buzzer_set'] = {
  init() {
    this.appendDummyInput()
      .appendField('Buzzer')
      .appendField(new Blockly.FieldDropdown([['ON','ON'],['OFF','OFF']]), 'ST');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#FF6F00');
    this.setTooltip('Turn the buzzer on or off at 2 kHz.');
  }
};
arduinoGenerator.forBlock['buzzer_set'] = function (b) {
  _BZ();
  return b.getFieldValue('ST') === 'ON'
    ? `  ledcWriteTone(5, 2000);\n`
    : `  ledcWriteTone(5, 0);\n`;
};

/* Custom frequency + duration */
Blockly.Blocks['buzzer_tone'] = {
  init() {
    this.appendDummyInput()
      .appendField('Play tone')
      .appendField(new Blockly.FieldNumber(1000, 20, 20000), 'HZ')
      .appendField('Hz for')
      .appendField(new Blockly.FieldNumber(200, 0), 'MS')
      .appendField('ms');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#FF6F00');
    this.setTooltip('Play a tone at a precise frequency for a set duration.');
  }
};
arduinoGenerator.forBlock['buzzer_tone'] = function (b) {
  _BZ();
  return `  ledcWriteTone(5, ${b.getFieldValue('HZ')});\n  delay(${b.getFieldValue('MS')});\n  ledcWriteTone(5, 0);\n`;
};

/* Musical note */
Blockly.Blocks['buzzer_note'] = {
  init() {
    this.appendDummyInput()
      .appendField('Play note')
      .appendField(new Blockly.FieldDropdown([
        ['C4','262'],['D4','294'],['E4','330'],['F4','349'],['G4','392'],
        ['A4','440'],['B4','494'],['C5','523'],['D5','587'],['E5','659'],
        ['F5','698'],['G5','784'],['A5','880'],['B5','988'],['C6','1047'],
        ['Rest','0'],
      ]), 'NOTE')
      .appendField(new Blockly.FieldDropdown([
        ['⅛ beat','125'],['¼ beat','250'],['½ beat','500'],
        ['1 beat','1000'],['2 beats','2000'],
      ]), 'DUR');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#FF6F00');
    this.setTooltip('Play a musical note for a beat-based duration.');
  }
};
arduinoGenerator.forBlock['buzzer_note'] = function (b) {
  _BZ();
  const hz  = b.getFieldValue('NOTE');
  const dur = b.getFieldValue('DUR');
  if (hz === '0') return `  ledcWriteTone(5, 0);\n  delay(${dur});\n`;
  return `  ledcWriteTone(5, ${hz});\n  delay(${dur});\n  ledcWriteTone(5, 0);\n  delay(10);\n`;
};

/* Built-in melodies */
Blockly.Blocks['buzzer_melody'] = {
  init() {
    this.appendDummyInput()
      .appendField('Play melody')
      .appendField(new Blockly.FieldDropdown([
        ['Power up','PUP'],
        ['Game over','GOVER'],
        ['Ba dum tss','BDT'],
        ['Beep','BEEP'],
        ['Twinkle Twinkle','TWINK'],
        ['Happy Birthday','BDAY'],
        ['Imperial March','IMP'],
      ]), 'M');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#FF6F00');
    this.setTooltip('Play a built-in melody on the buzzer.');
  }
};
arduinoGenerator.forBlock['buzzer_melody'] = function (b) {
  _BZ();
  const m = b.getFieldValue('M');
  const DEFS = {
    PUP:   `int mf_PUP[]={330,392,494,659,784,1047};           int md_PUP[]={80,80,80,80,80,300};`,
    GOVER: `int mf_GOVER[]={494,466,440,415,392,0,262};        int md_GOVER[]={150,150,150,150,300,100,600};`,
    BDT:   `int mf_BDT[]={220,294,330,0,330};                  int md_BDT[]={200,200,200,50,400};`,
    BEEP:  `int mf_BEEP[]={1000,0,1000,0};                     int md_BEEP[]={100,50,100,50};`,
    TWINK: `int mf_TWINK[]={262,262,392,392,440,440,392,0,349,349,330,330,294,294,262}; int md_TWINK[]={300,300,300,300,300,300,600,100,300,300,300,300,300,300,600};`,
    BDAY:  `int mf_BDAY[]={262,262,294,262,349,330,0,262,262,294,262,392,349};          int md_BDAY[]={200,200,400,400,400,800,200,200,200,400,400,400,800};`,
    IMP:   `int mf_IMP[]={440,440,440,349,523,440,349,523,440,0,659,659,659,698,523,415,349,523,440}; int md_IMP[]={500,500,500,350,150,500,350,150,1000,325,500,500,500,350,150,500,350,150,1000};`,
  };
  if (!globalVariables[`mel_${m}`]) {
    globalVariables[`mel_${m}`] = `
${DEFS[m]}
void playMel_${m}() {
  int _n = sizeof(mf_${m}) / sizeof(mf_${m}[0]);
  for (int _i = 0; _i < _n; _i++) {
    ledcWriteTone(5, mf_${m}[_i]);
    delay(md_${m}[_i]);
    ledcWriteTone(5, 0);
    delay(10);
  }
}`;
  }
  return `  playMel_${m}();\n`;
};

/* Stop */
Blockly.Blocks['buzzer_stop'] = {
  init() {
    this.appendDummyInput().appendField('Stop buzzer');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#FF6F00');
    this.setTooltip('Immediately stop any sound from the buzzer.');
  }
};
arduinoGenerator.forBlock['buzzer_stop'] = function () { _BZ(); return `  ledcWriteTone(5, 0);\n`; };

/* ═══════════════════════════════════════════════════════════════════
   WI-FI
   ═══════════════════════════════════════════════════════════════════ */

Blockly.Blocks['wifi_connect'] = {
  init() {
    this.appendDummyInput()
      .appendField('Connect Wi-Fi  SSID')
      .appendField(new Blockly.FieldTextInput('MyWiFi'), 'SSID')
      .appendField('Password')
      .appendField(new Blockly.FieldTextInput('password'), 'PASS');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#2196F3');
    this.setTooltip('Connect to Wi-Fi. Times out after 10 s if the network is unreachable.');
  }
};
arduinoGenerator.forBlock['wifi_connect'] = function (b) {
  const ssid = b.getFieldValue('SSID');
  const pass = b.getFieldValue('PASS');
  includeStatements['wifi'] = '#include <WiFi.h>';
  setupStatements['wifi'] =
    `  WiFi.begin("${ssid}", "${pass}");\n` +
    `  { int _r=0; while(WiFi.status()!=WL_CONNECTED && _r<20){delay(500);_r++;} }\n` +
    `  if(WiFi.status()==WL_CONNECTED){\n` +
    `    Serial.print("WiFi OK: "); Serial.println(WiFi.localIP());\n` +
    `  } else { Serial.println("WiFi failed"); }\n`;
  return '';
};

Blockly.Blocks['wifi_connected'] = {
  init() {
    this.appendDummyInput().appendField('Wi-Fi connected?');
    this.setOutput(true, 'Boolean');
    this.setColour('#2196F3');
    this.setTooltip('True when connected to Wi-Fi.');
  }
};
arduinoGenerator.forBlock['wifi_connected'] = function () {
  includeStatements['wifi'] = '#include <WiFi.h>';
  return ['(WiFi.status() == WL_CONNECTED)', arduinoGenerator.ORDER_EQUALITY];
};

Blockly.Blocks['wifi_ip'] = {
  init() {
    this.appendDummyInput().appendField('Wi-Fi IP address');
    this.setOutput(true, 'String');
    this.setColour('#2196F3');
    this.setTooltip("Returns the board's local IP address as a String.");
  }
};
arduinoGenerator.forBlock['wifi_ip'] = function () {
  includeStatements['wifi'] = '#include <WiFi.h>';
  return ['WiFi.localIP().toString()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['http_get'] = {
  init() {
    this.appendValueInput('URL').appendField('HTTP GET');
    this.setOutput(true, 'String');
    this.setColour('#2196F3');
    this.setTooltip('Fetch a URL and return the response as text. Requires Wi-Fi.');
  }
};
arduinoGenerator.forBlock['http_get'] = function (b) {
  const url = arduinoGenerator.valueToCode(b, 'URL', arduinoGenerator.ORDER_ATOMIC) || '""';
  includeStatements['wifi'] = '#include <WiFi.h>';
  includeStatements['http'] = '#include <HTTPClient.h>';
  if (!globalVariables['http_get_fn']) {
    globalVariables['http_get_fn'] = `
String qubiGet(String url) {
  HTTPClient _h; _h.begin(url);
  int _c = _h.GET();
  String _r = (_c > 0) ? _h.getString() : "";
  _h.end(); return _r;
}`;
  }
  return [`qubiGet(${url})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['http_post'] = {
  init() {
    this.appendValueInput('URL').appendField('HTTP POST  url');
    this.appendValueInput('BODY').appendField('body (JSON)');
    this.setOutput(true, 'Number');
    this.setColour('#2196F3');
    this.setTooltip('POST JSON data to a URL. Returns the HTTP status code. Requires Wi-Fi.');
  }
};
arduinoGenerator.forBlock['http_post'] = function (b) {
  const url  = arduinoGenerator.valueToCode(b, 'URL',  arduinoGenerator.ORDER_ATOMIC) || '""';
  const body = arduinoGenerator.valueToCode(b, 'BODY', arduinoGenerator.ORDER_ATOMIC) || '""';
  includeStatements['wifi'] = '#include <WiFi.h>';
  includeStatements['http'] = '#include <HTTPClient.h>';
  if (!globalVariables['http_post_fn']) {
    globalVariables['http_post_fn'] = `
int qubiPost(String url, String body) {
  HTTPClient _h; _h.begin(url);
  _h.addHeader("Content-Type","application/json");
  int _c = _h.POST(body); _h.end(); return _c;
}`;
  }
  return [`qubiPost(${url}, ${body})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['thingspeak'] = {
  init() {
    this.appendDummyInput()
      .appendField('Send to ThingSpeak  key')
      .appendField(new Blockly.FieldTextInput('YOUR_API_KEY'), 'KEY');
    this.appendValueInput('F1').setCheck('Number').appendField('field 1');
    this.appendValueInput('F2').setCheck('Number').appendField('field 2 (opt)');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#2196F3');
    this.setTooltip('Send up to 2 sensor readings to ThingSpeak. Requires Wi-Fi.');
  }
};
arduinoGenerator.forBlock['thingspeak'] = function (b) {
  const key = b.getFieldValue('KEY');
  const f1  = arduinoGenerator.valueToCode(b, 'F1', arduinoGenerator.ORDER_ATOMIC) || '0';
  const f2  = arduinoGenerator.valueToCode(b, 'F2', arduinoGenerator.ORDER_ATOMIC) || '0';
  includeStatements['wifi'] = '#include <WiFi.h>';
  includeStatements['http'] = '#include <HTTPClient.h>';
  if (!globalVariables['http_get_fn']) {
    globalVariables['http_get_fn'] = `
String qubiGet(String url) {
  HTTPClient _h; _h.begin(url);
  int _c = _h.GET();
  String _r = (_c > 0) ? _h.getString() : "";
  _h.end(); return _r;
}`;
  }
  return `  qubiGet("http://api.thingspeak.com/update?api_key=${key}&field1="+String(${f1})+"&field2="+String(${f2}));\n`;
};


/* ═══════════════════════════════════════════════════════════════════
   BLUETOOTH 
   ═══════════════════════════════════════════════════════════════════ */

Blockly.Blocks['bt_begin'] = {
  init() {
    this.appendDummyInput()
      .appendField('Start Bluetooth  name')
      .appendField(new Blockly.FieldTextInput('QUBI_BT'), 'NAME');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#3F51B5');
    this.setTooltip('Start Classic Bluetooth with the given device name.');
  }
};
arduinoGenerator.forBlock['bt_begin'] = function (b) {
  const name = b.getFieldValue('NAME');
  includeStatements['bt'] = '#include "BluetoothSerial.h"';
  globalVariables['bt']   = 'BluetoothSerial SerialBT;';
  setupStatements['bt']   = `  SerialBT.begin("${name}");\n`;
  return '';
};

Blockly.Blocks['bt_available'] = {
  init() {
    this.appendDummyInput().appendField('Bluetooth data available?');
    this.setOutput(true, 'Boolean');
    this.setColour('#3F51B5');
    this.setTooltip('True when Bluetooth data is waiting to be read.');
  }
};
arduinoGenerator.forBlock['bt_available'] = () => ['(SerialBT.available() > 0)', arduinoGenerator.ORDER_RELATIONAL];

Blockly.Blocks['bt_read'] = {
  init() {
    this.appendDummyInput().appendField('Bluetooth read line');
    this.setOutput(true, 'String');
    this.setColour('#3F51B5');
    this.setTooltip('Read a line of text from Bluetooth (up to newline). Check available? first.');
  }
};
arduinoGenerator.forBlock['bt_read'] = () => ["SerialBT.readStringUntil('\\n')", arduinoGenerator.ORDER_FUNCTION_CALL];

Blockly.Blocks['bt_send'] = {
  init() {
    this.appendValueInput('TEXT')
      .appendField('Bluetooth send')
      .appendField(new Blockly.FieldDropdown([['text','print'],['text + newline','println']]), 'MODE');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#3F51B5');
    this.setTooltip("Send text over Bluetooth. Use 'text + newline' so receivers can detect message end.");
  }
};
arduinoGenerator.forBlock['bt_send'] = function (b) {
  const text = arduinoGenerator.valueToCode(b, 'TEXT', arduinoGenerator.ORDER_ATOMIC) || '""';
  return `  SerialBT.${b.getFieldValue('MODE')}(${text});\n`;
};

/* Run code when a specific message arrives */
Blockly.Blocks['bt_on_receive'] = {
  init() {
    this.appendDummyInput()
      .appendField('On Bluetooth receive')
      .appendField(new Blockly.FieldTextInput('hello'), 'MSG');
    this.appendStatementInput('DO').appendField('do');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#3F51B5');
    this.setTooltip('Run the blocks inside when a specific Bluetooth message is received.');
  }
};
arduinoGenerator.forBlock['bt_on_receive'] = function (b) {
  const msg  = b.getFieldValue('MSG');
  const body = arduinoGenerator.statementToCode(b, 'DO');
  if (!globalVariables['bt_buf']) globalVariables['bt_buf'] = 'String _btBuf = "";';
  return (
    `  if (SerialBT.available() > 0) {\n` +
    `    _btBuf = SerialBT.readStringUntil('\\n');\n` +
    `    _btBuf.trim();\n` +
    `    if (_btBuf == "${msg}") {\n${body}    }\n` +
    `  }\n`
  );
};


/* ═══════════════════════════════════════════════════════════════════
   ESP-NOW  —  peer-to-peer wireless between QUBI boards (no router)
   ═══════════════════════════════════════════════════════════════════ */

const _ESPNOW = () => {
  includeStatements['espnow_wifi'] = '#include <WiFi.h>';
  includeStatements['espnow']      = '#include <esp_now.h>';
  includeStatements['espnow_wifi2'] = '#include <esp_wifi.h>';
  globalVariables['espnow_buf']    = [
    'String _enRecvText = "";',
    'float  _enRecvNum  = 0;',
    'bool   _enRecvFlag = false;',
    'typedef struct { char kind; char sval[64]; float nval; } _ENPkt;',
    '_ENPkt _enPkt;',
    '// Callback signature differs between ESP32 Arduino core 2.x (mac address)',
    '// and core 3.x (esp_now_recv_info_t*) — this works with either.',
    '#ifdef ESP_ARDUINO_VERSION_MAJOR',
    '#if ESP_ARDUINO_VERSION >= ESP_ARDUINO_VERSION_VAL(3, 0, 0)',
    'void _enRecvCb(const esp_now_recv_info_t *info, const uint8_t *data, int len) {',
    '#else',
    'void _enRecvCb(const uint8_t *mac, const uint8_t *data, int len) {',
    '#endif',
    '#else',
    'void _enRecvCb(const uint8_t *mac, const uint8_t *data, int len) {',
    '#endif',
    '  memcpy(&_enPkt, data, sizeof(_enPkt));',
    "  if (_enPkt.kind == 't') _enRecvText = String(_enPkt.sval);",
    '  else                     _enRecvNum  = _enPkt.nval;',
    '  _enRecvFlag = true;',
    '}',
  ].join('\n');
  setupStatements['espnow'] = [
    '  WiFi.mode(WIFI_STA);',
    '  WiFi.disconnect();',
    '  esp_wifi_set_channel(1, WIFI_SECOND_CHAN_NONE);  // fixed channel so all QUBI boards match',
    '  if (esp_now_init() != ESP_OK) { Serial.println("ESP-NOW init failed"); return; }',
    '  esp_now_register_recv_cb(_enRecvCb);',
  ].join('\n') + '\n';
};

function _enPeerVars(mac) {
  const safe = mac.replace(/:/g, '');
  const parts = mac.split(':').map(h => '0x' + (h || '00')).join(', ');
  const arr  = '_enPeer_'  + safe;
  const info = '_enInfo_'  + safe;
  if (!globalVariables[arr]) {
    globalVariables[arr] = [
      `uint8_t ${arr}[] = {${parts}};`,
      `esp_now_peer_info_t ${info};`,
    ].join('\n');
  }
  return { arr, info };
}

/* ── Init ── */
Blockly.Blocks['espnow_init'] = {
  init() {
    this.appendDummyInput().appendField('Start ESP-NOW');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#00BCD4');
    this.setTooltip('Initialise ESP-NOW. Place in On Start before any send/receive blocks.');
  }
};
arduinoGenerator.forBlock['espnow_init'] = function () { _ESPNOW(); return ''; };

/* ── Role ── */
Blockly.Blocks['espnow_set_role'] = {
  init() {
    this.appendDummyInput()
      .appendField('ESP-NOW role')
      .appendField(new Blockly.FieldDropdown([['Sender','SEND'],['Receiver','RECV'],['Both','BOTH']]), 'ROLE');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#00BCD4');
    this.setTooltip('Set whether this board sends, receives, or does both. Place in On Start after Start ESP-NOW.');
  }
};
arduinoGenerator.forBlock['espnow_set_role'] = function (b) {
  _ESPNOW();
  const r = b.getFieldValue('ROLE');
  if (r === 'RECV') return '  // Role: Receiver\n';
  if (r === 'SEND') return '  // Role: Sender\n';
  return '  // Role: Both\n';
};

/* ── Add peer ── */
Blockly.Blocks['espnow_add_peer'] = {
  init() {
    this.appendDummyInput()
      .appendField('Add ESP-NOW peer  MAC')
      .appendField(new Blockly.FieldTextInput('AA:BB:CC:DD:EE:FF'), 'MAC');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#00BCD4');
    this.setTooltip('Register a receiver board by its MAC address. Use the MAC Address block on the receiver to find its address.');
  }
};
arduinoGenerator.forBlock['espnow_add_peer'] = function (b) {
  _ESPNOW();
  const { arr, info } = _enPeerVars(b.getFieldValue('MAC'));
  return [
    `  memset(&${info}, 0, sizeof(${info}));`,
    `  memcpy(${info}.peer_addr, ${arr}, 6);`,
    `  ${info}.channel = 1; ${info}.encrypt = false;`,
    `  if (esp_now_add_peer(&${info}) != ESP_OK) { Serial.println("ESP-NOW: failed to add peer ${b.getFieldValue('MAC')}"); }`,
  ].join('\n') + '\n';
};

/* ── Send text ── */
Blockly.Blocks['espnow_send_text'] = {
  init() {
    this.appendValueInput('TEXT').setCheck('String').appendField('ESP-NOW send text');
    this.appendDummyInput().appendField('to MAC').appendField(new Blockly.FieldTextInput('AA:BB:CC:DD:EE:FF'), 'MAC');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#00BCD4');
    this.setTooltip('Send a text string to a peer board. The peer must be added with Add ESP-NOW peer first.');
  }
};
arduinoGenerator.forBlock['espnow_send_text'] = function (b) {
  _ESPNOW();
  const text = arduinoGenerator.valueToCode(b, 'TEXT', arduinoGenerator.ORDER_ATOMIC) || '""';
  const { arr } = _enPeerVars(b.getFieldValue('MAC'));
  return [
    '  { _ENPkt _p; _p.kind = \'t\';',
    `    String _s = String(${text}); _s.toCharArray(_p.sval, 64);`,
    `    esp_err_t _r = esp_now_send(${arr}, (uint8_t*)&_p, sizeof(_p));`,
    `    if (_r != ESP_OK) Serial.printf("ESP-NOW send failed (err %d) to ${b.getFieldValue('MAC')}\\n", _r); }`,
  ].join('\n') + '\n';
};

/* ── Send number ── */
Blockly.Blocks['espnow_send_number'] = {
  init() {
    this.appendValueInput('NUM').setCheck('Number').appendField('ESP-NOW send number');
    this.appendDummyInput().appendField('to MAC').appendField(new Blockly.FieldTextInput('AA:BB:CC:DD:EE:FF'), 'MAC');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#00BCD4');
    this.setTooltip('Send a number to a peer board. Use ESP-NOW received number on the receiver to read it.');
  }
};
arduinoGenerator.forBlock['espnow_send_number'] = function (b) {
  _ESPNOW();
  const num = arduinoGenerator.valueToCode(b, 'NUM', arduinoGenerator.ORDER_ATOMIC) || '0';
  const { arr } = _enPeerVars(b.getFieldValue('MAC'));
  return [
    '  { _ENPkt _p; _p.kind = \'n\';',
    `    _p.nval = (float)(${num});`,
    `    esp_err_t _r = esp_now_send(${arr}, (uint8_t*)&_p, sizeof(_p));`,
    `    if (_r != ESP_OK) Serial.printf("ESP-NOW send failed (err %d) to ${b.getFieldValue('MAC')}\\n", _r); }`,
  ].join('\n') + '\n';
};

/* ── On receive ── */
Blockly.Blocks['espnow_on_receive'] = {
  init() {
    this.appendStatementInput('DO').appendField('When ESP-NOW message received');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#00BCD4');
    this.setTooltip('Runs when a new ESP-NOW message arrives. Place inside Forever.');
  }
};
arduinoGenerator.forBlock['espnow_on_receive'] = function (b) {
  _ESPNOW();
  const body = arduinoGenerator.statementToCode(b, 'DO');
  return `  if (_enRecvFlag) {\n    _enRecvFlag = false;\n${body}  }\n`;
};

/* ── Received text ── */
Blockly.Blocks['espnow_received_text'] = {
  init() {
    this.appendDummyInput().appendField('ESP-NOW received text');
    this.setOutput(true, 'String');
    this.setColour('#00BCD4');
    this.setTooltip('The last text string received over ESP-NOW.');
  }
};
arduinoGenerator.forBlock['espnow_received_text'] = function () {
  _ESPNOW(); return ['_enRecvText', arduinoGenerator.ORDER_ATOMIC];
};

/* ── Received number ── */
Blockly.Blocks['espnow_received_number'] = {
  init() {
    this.appendDummyInput().appendField('ESP-NOW received number');
    this.setOutput(true, 'Number');
    this.setColour('#00BCD4');
    this.setTooltip('The last number received over ESP-NOW.');
  }
};
arduinoGenerator.forBlock['espnow_received_number'] = function () {
  _ESPNOW(); return ['_enRecvNum', arduinoGenerator.ORDER_ATOMIC];
};

/* ── MAC address ── */
Blockly.Blocks['espnow_mac_address'] = {
  init() {
    this.appendDummyInput().appendField('This board\'s MAC address');
    this.setOutput(true, 'String');
    this.setColour('#00BCD4');
    this.setTooltip('Returns this board\'s MAC address as a string. Serial print this to find the address to use in Add ESP-NOW peer.');
  }
};
arduinoGenerator.forBlock['espnow_mac_address'] = function () {
  includeStatements['espnow_wifi'] = '#include <WiFi.h>';
  // Only add the WiFi.mode call here if ESP-NOW hasn't already set it up —
  // avoids a duplicate WiFi.mode(WIFI_STA) line when both blocks are used together.
  if (!setupStatements['espnow']) {
    setupStatements['mac_wifi'] = '  WiFi.mode(WIFI_STA);\n  delay(100);\n';
  }
  if (!globalVariables['mac_fn']) {
    globalVariables['mac_fn'] = [
      'String qubiMac() {',
      '  if (WiFi.getMode() == WIFI_MODE_NULL) { WiFi.mode(WIFI_STA); delay(100); }',
      '  // The buffer-overload WiFi.macAddress(uint8_t*) can read all zeros on some',
      "  // core versions before the radio is fully up — the String-returning",
      '  // overload reads from the same driver state more reliably.',
      '  String _mac = WiFi.macAddress();',
      '  int _tries = 0;',
      '  while (_mac == "00:00:00:00:00:00" && _tries < 20) {',
      '    delay(10); _mac = WiFi.macAddress(); _tries++;',
      '  }',
      '  return _mac;',
      '}',
    ].join('\n');
  }
  return ['qubiMac()', arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ═══════════════════════════════════════════════════════════════════
   LOOPS
   ═══════════════════════════════════════════════════════════════════ */

Blockly.Blocks['repeat_do'] = {
  init() {
    this.appendValueInput('TIMES').setCheck('Number').appendField('Repeat');
    this.appendStatementInput('DO').appendField('times');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#ff9800');
  }
};
arduinoGenerator.forBlock['repeat_do'] = function (b) {
  const n = arduinoGenerator.valueToCode(b, 'TIMES', arduinoGenerator.ORDER_ATOMIC) || '0';
  return `  for (int _i = 0; _i < ${n}; _i++) {\n${arduinoGenerator.statementToCode(b,'DO')}  }\n`;
};

Blockly.Blocks['while_do'] = {
  init() {
    this.appendValueInput('COND').setCheck('Boolean').appendField('While');
    this.appendStatementInput('DO').appendField('do');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#ff9800');
  }
};
arduinoGenerator.forBlock['while_do'] = function (b) {
  const c = arduinoGenerator.valueToCode(b, 'COND', arduinoGenerator.ORDER_NONE) || 'false';
  return `  while (${c}) {\n${arduinoGenerator.statementToCode(b,'DO')}  }\n`;
};

Blockly.Blocks['for_do'] = {
  init() {
    this.appendDummyInput().appendField('For').appendField(new Blockly.FieldVariable('i'), 'VAR').appendField('from');
    this.appendValueInput('FROM').setCheck('Number');
    this.appendValueInput('TO').setCheck('Number').appendField('to');
    this.appendStatementInput('DO').appendField('do');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#ff9800');
  }
};
arduinoGenerator.forBlock['for_do'] = function (b) {
  const v    = b.getFieldValue('VAR');
  const name = workspace.getVariableById ? (workspace.getVariableById(v)?.name || v) : v;
  const from = arduinoGenerator.valueToCode(b, 'FROM', arduinoGenerator.ORDER_ATOMIC) || '0';
  const to   = arduinoGenerator.valueToCode(b, 'TO',   arduinoGenerator.ORDER_ATOMIC) || '0';
  return `  for (int ${name} = ${from}; ${name} <= ${to}; ${name}++) {\n${arduinoGenerator.statementToCode(b,'DO')}  }\n`;
};

Blockly.Blocks['break']    = { init() { this.appendDummyInput().appendField('Break');    this.setPreviousStatement(true); this.setColour('#ff9800'); } };
Blockly.Blocks['continue'] = { init() { this.appendDummyInput().appendField('Continue'); this.setPreviousStatement(true); this.setColour('#ff9800'); } };
arduinoGenerator.forBlock['break']    = () => `  break;\n`;
arduinoGenerator.forBlock['continue'] = () => `  continue;\n`;


/* ═══════════════════════════════════════════════════════════════════
   LOGIC
   ═══════════════════════════════════════════════════════════════════ */

arduinoGenerator.forBlock['controls_if'] = function (b) {
  let code = '', n = 0;
  do {
    const cond   = arduinoGenerator.valueToCode(b, 'IF'+n, arduinoGenerator.ORDER_NONE) || 'false';
    const branch = arduinoGenerator.statementToCode(b, 'DO'+n);
    code += n === 0 ? `  if (${cond}) {\n${branch}  }` : ` else if (${cond}) {\n${branch}  }`;
    n++;
  } while (b.getInput('IF'+n));
  if (b.getInput('ELSE')) code += ` else {\n${arduinoGenerator.statementToCode(b,'ELSE')}  }`;
  return code + '\n';
};

Blockly.Blocks['logic_compare'] = {
  init() {
    this.appendValueInput('A');
    this.appendDummyInput().appendField(new Blockly.FieldDropdown([
      ['=','EQ'],['≠','NEQ'],['<','LT'],['≤','LTE'],['>','GT'],['≥','GTE']
    ]), 'OP');
    this.appendValueInput('B');
    this.setInputsInline(true); this.setOutput(true, 'Boolean'); this.setColour('#00e00b');
  }
};
arduinoGenerator.forBlock['logic_compare'] = function (b) {
  const OPS = {EQ:'==',NEQ:'!=',LT:'<',LTE:'<=',GT:'>',GTE:'>='};
  const ord = arduinoGenerator.ORDER_RELATIONAL;
  return [`${arduinoGenerator.valueToCode(b,'A',ord)||'0'} ${OPS[b.getFieldValue('OP')]} ${arduinoGenerator.valueToCode(b,'B',ord)||'0'}`, ord];
};

Blockly.Blocks['logic_operation'] = {
  init() {
    this.appendValueInput('A').setCheck('Boolean');
    this.appendDummyInput().appendField(new Blockly.FieldDropdown([['and','AND'],['or','OR']]), 'OP');
    this.appendValueInput('B').setCheck('Boolean');
    this.setInputsInline(true); this.setOutput(true, 'Boolean'); this.setColour('#00e00b');
  }
};
arduinoGenerator.forBlock['logic_operation'] = function (b) {
  const op  = b.getFieldValue('OP');
  const ord = op === 'AND' ? arduinoGenerator.ORDER_LOGICAL_AND : arduinoGenerator.ORDER_LOGICAL_OR;
  return [`${arduinoGenerator.valueToCode(b,'A',ord)||'false'} ${op==='AND'?'&&':'||'} ${arduinoGenerator.valueToCode(b,'B',ord)||'false'}`, ord];
};

Blockly.Blocks['logic_boolean'] = {
  init() {
    this.appendDummyInput().appendField(new Blockly.FieldDropdown([['true','TRUE'],['false','FALSE']]), 'BOOL');
    this.setOutput(true, 'Boolean'); this.setColour('#00e00b');
  }
};
arduinoGenerator.forBlock['logic_boolean'] = b => [b.getFieldValue('BOOL').toLowerCase(), arduinoGenerator.ORDER_ATOMIC];

Blockly.Blocks['logic_not'] = {
  init() {
    this.appendValueInput('VAL').setCheck('Boolean').appendField('not');
    this.setOutput(true, 'Boolean'); this.setColour('#00e00b');
    this.setTooltip('Inverts a true/false value.');
  }
};
arduinoGenerator.forBlock['logic_not'] = function (b) {
  const v = arduinoGenerator.valueToCode(b, 'VAL', arduinoGenerator.ORDER_LOGICAL_NOT) || 'false';
  return [`!${v}`, arduinoGenerator.ORDER_LOGICAL_NOT];
};


/* ═══════════════════════════════════════════════════════════════════
   MATH
   ═══════════════════════════════════════════════════════════════════ */

Blockly.Blocks['math_number'] = {
  init() { this.appendDummyInput().appendField(new Blockly.FieldNumber(0), 'NUM'); this.setOutput(true, 'Number'); this.setColour('#e91e63'); }
};
arduinoGenerator.forBlock['math_number'] = b => [String(b.getFieldValue('NUM')), arduinoGenerator.ORDER_ATOMIC];

Blockly.Blocks['math_arithmetic'] = {
  init() {
    this.appendValueInput('A').setCheck('Number');
    this.appendDummyInput().appendField(new Blockly.FieldDropdown([['+','ADD'],['-','SUB'],['×','MUL'],['÷','DIV'],['^ (power)','POW']]), 'OP');
    this.appendValueInput('B').setCheck('Number');
    this.setInputsInline(true); this.setOutput(true, 'Number'); this.setColour('#e91e63');
  }
};
arduinoGenerator.forBlock['math_arithmetic'] = function (b) {
  const OPS = {ADD:[' + ',arduinoGenerator.ORDER_ADDITION],SUB:[' - ',arduinoGenerator.ORDER_SUBTRACTION],MUL:[' * ',arduinoGenerator.ORDER_MULTIPLICATION],DIV:[' / ',arduinoGenerator.ORDER_DIVISION],POW:[null,arduinoGenerator.ORDER_NONE]};
  const [op, ord] = OPS[b.getFieldValue('OP')];
  const a = arduinoGenerator.valueToCode(b,'A',ord)||'0', bv = arduinoGenerator.valueToCode(b,'B',ord)||'0';
  return op ? [`${a}${op}${bv}`, ord] : [`pow(${a}, ${bv})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['math_random'] = {
  init() {
    this.appendValueInput('FROM').setCheck('Number').appendField('Random from');
    this.appendValueInput('TO').setCheck('Number').appendField('to');
    this.setInputsInline(true); this.setOutput(true, 'Number'); this.setColour('#e91e63');
    this.setTooltip('Returns a random integer between the two values (inclusive).');
  }
};
arduinoGenerator.forBlock['math_random'] = function (b) {
  const from = arduinoGenerator.valueToCode(b,'FROM',arduinoGenerator.ORDER_ATOMIC)||'0';
  const to   = arduinoGenerator.valueToCode(b,'TO',  arduinoGenerator.ORDER_ATOMIC)||'10';
  return [`random(${from}, (${to}) + 1)`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['math_map'] = {
  init() {
    this.appendValueInput('VAL').setCheck('Number').appendField('Map');
    this.appendValueInput('FL').setCheck('Number').appendField('from');
    this.appendValueInput('FH').setCheck('Number').appendField('–');
    this.appendValueInput('TL').setCheck('Number').appendField('to');
    this.appendValueInput('TH').setCheck('Number').appendField('–');
    this.setInputsInline(true); this.setOutput(true, 'Number'); this.setColour('#e91e63');
    this.setTooltip('Re-map a value from one range to another (Arduino map()).');
  }
};
arduinoGenerator.forBlock['math_map'] = function (b) {
  const get = k => arduinoGenerator.valueToCode(b, k, arduinoGenerator.ORDER_ATOMIC) || '0';
  return [`map(${get('VAL')}, ${get('FL')}, ${get('FH')}, ${get('TL')}, ${get('TH')})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['math_constrain'] = {
  init() {
    this.appendValueInput('VAL').setCheck('Number').appendField('Constrain');
    this.appendValueInput('LO').setCheck('Number').appendField('between');
    this.appendValueInput('HI').setCheck('Number').appendField('and');
    this.setInputsInline(true); this.setOutput(true, 'Number'); this.setColour('#e91e63');
    this.setTooltip('Clamp a value so it stays between a minimum and maximum.');
  }
};
arduinoGenerator.forBlock['math_constrain'] = function (b) {
  const get = k => arduinoGenerator.valueToCode(b, k, arduinoGenerator.ORDER_ATOMIC) || '0';
  return [`constrain(${get('VAL')}, ${get('LO')}, ${get('HI')})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['math_abs'] = {
  init() {
    this.appendValueInput('NUM').setCheck('Number').appendField('Absolute value of');
    this.setOutput(true, 'Number'); this.setColour('#e91e63');
    this.setTooltip('Returns the positive value of a number.');
  }
};
arduinoGenerator.forBlock['math_abs'] = function (b) {
  const n = arduinoGenerator.valueToCode(b, 'NUM', arduinoGenerator.ORDER_ATOMIC) || '0';
  return [`abs(${n})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};


/* ═══════════════════════════════════════════════════════════════════
   SERIAL (USB debug output)
   ═══════════════════════════════════════════════════════════════════ */

Blockly.Blocks['serial_begin'] = {
  init() {
    this.appendDummyInput()
      .appendField('Serial begin')
      .appendField(new Blockly.FieldDropdown([['115200','115200'],['921600','921600'],['57600','57600'],['38400','38400'],['19200','19200'],['9600','9600']]), 'BAUD');
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#ff261f');
    this.setTooltip('Start USB serial communication at the chosen baud rate.');
  }
};
arduinoGenerator.forBlock['serial_begin'] = function (b) {
  setupStatements['serial'] = `  Serial.begin(${b.getFieldValue('BAUD')});\n  delay(100);\n`;
  return '';
};

Blockly.Blocks['serial_print'] = {
  init() { this.appendValueInput('TEXT').appendField('Serial print'); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#ff261f'); this.setTooltip('Print a value to the Serial Monitor (no newline).'); }
};
arduinoGenerator.forBlock['serial_print'] = b => `  Serial.print(${arduinoGenerator.valueToCode(b,'TEXT',arduinoGenerator.ORDER_ATOMIC)||'""'});\n`;

Blockly.Blocks['serial_println'] = {
  init() { this.appendValueInput('TEXT').appendField('Serial println'); this.setPreviousStatement(true); this.setNextStatement(true); this.setColour('#ff261f'); this.setTooltip('Print a value + newline to the Serial Monitor.'); }
};
arduinoGenerator.forBlock['serial_println'] = b => `  Serial.println(${arduinoGenerator.valueToCode(b,'TEXT',arduinoGenerator.ORDER_ATOMIC)||'""'});\n`;

Blockly.Blocks['serial_read'] = {
  init() { this.appendDummyInput().appendField('Serial read byte'); this.setOutput(true, 'Number'); this.setColour('#ff261f'); }
};
arduinoGenerator.forBlock['serial_read'] = () => ['Serial.read()', arduinoGenerator.ORDER_ATOMIC];

Blockly.Blocks['serial_available'] = {
  init() { this.appendDummyInput().appendField('Serial data available?'); this.setOutput(true, 'Boolean'); this.setColour('#ff261f'); }
};
arduinoGenerator.forBlock['serial_available'] = () => ['(Serial.available() > 0)', arduinoGenerator.ORDER_RELATIONAL];

/* ---------------- PIN BLOCKS ---------------- */
Blockly.Blocks["digital_write"] = {
  init: function () {
    this.appendDummyInput().appendField("Digital Write Pin").appendField(new Blockly.FieldDropdown(
      qubiPinOptions(['P2','P3','P4','P5','P6','P7','P8','P9','P10','P11','P13','P14','P15','P16','P19','P20'])
    ), "PIN").appendField("to").appendField(new Blockly.FieldDropdown([["HIGH", "HIGH"], ["LOW", "LOW"]]), "STATE");
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#9C27B0");
  }
};
arduinoGenerator.forBlock["digital_write"] = function (block) {
  setupStatements[`pin_${block.getFieldValue("PIN")}`] = `  pinMode(${block.getFieldValue("PIN")}, OUTPUT);\n`;
  return `  digitalWrite(${block.getFieldValue("PIN")}, ${block.getFieldValue("STATE")});\n`;
};

Blockly.Blocks["digital_read"] = {
  init: function () {
    this.appendDummyInput().appendField("Digital Read Pin").appendField(new Blockly.FieldDropdown(
      qubiPinOptions(['P0','P1','P2','P3','P4','P5','P6','P7','P8','P9','P10','P11','P12','P13','P14','P15','P16','P19','P20'])
    ), "PIN");
    this.setOutput(true, "Boolean"); this.setColour("#9C27B0");
  }
};
arduinoGenerator.forBlock["digital_read"] = function (block) {
  setupStatements[`pin_read_${block.getFieldValue("PIN")}`] = `  pinMode(${block.getFieldValue("PIN")}, INPUT);\n`;
  return [`digitalRead(${block.getFieldValue("PIN")})`, arduinoGenerator.ORDER_ATOMIC];
};

Blockly.Blocks["analog_read"] = {
  init: function () {
    this.appendDummyInput().appendField("Analog Read Pin").appendField(new Blockly.FieldDropdown(
      qubiPinOptions(QUBI_ADC_PINS)
    ), "PIN");
    this.setOutput(true, "Number"); this.setColour("#9C27B0");
  }
};
arduinoGenerator.forBlock["analog_read"] = (block) => [`analogRead(${block.getFieldValue("PIN")})`, arduinoGenerator.ORDER_ATOMIC];

Blockly.Blocks["analog_write"] = {
  init: function () {
    this.appendDummyInput().appendField("Analog/PWM Write Pin").appendField(new Blockly.FieldDropdown(
      qubiPinOptions(['P2','P3','P4','P5','P6','P7','P8','P9','P10','P11','P13','P14','P15','P16','P19','P20'])
    ), "PIN").appendField("value").appendField(new Blockly.FieldNumber(128, 0, 255), "VALUE");
    this.setPreviousStatement(true); this.setNextStatement(true); this.setColour("#9C27B0");
  }
};
arduinoGenerator.forBlock["analog_write"] = function (block) {
  setupStatements[`pwm_${block.getFieldValue("PIN")}`] = `  ledcAttach(${block.getFieldValue("PIN")}, 5000, 8);\n`;
  return `  ledcWrite(${block.getFieldValue("PIN")}, ${block.getFieldValue("VALUE")});\n`;
};

/* ---- LED (on-board GPIO2 blue LED) ---- */
Blockly.Blocks['led_blink'] = {
  init() {
    this.appendDummyInput()
      .appendField('Blink LED  pin')
      .appendField(new Blockly.FieldDropdown(
        qubiPinOptions(['P2','P3','P4','P5','P6','P7','P8','P9','P10','P11','P13','P14','P15','P16','P19','P20'])
      ), 'PIN')
      .appendField('on')
      .appendField(new Blockly.FieldNumber(500, 1), 'ON_MS')
      .appendField('ms  off')
      .appendField(new Blockly.FieldNumber(500, 1), 'OFF_MS')
      .appendField('ms');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#9C27B0');
    this.setTooltip('Blink the LED once: on for the set time then off. Put inside Forever to keep blinking.');
  }
};
arduinoGenerator.forBlock['led_blink'] = function (b) {
  const pin   = b.getFieldValue('PIN');
  const onMs  = b.getFieldValue('ON_MS');
  const offMs = b.getFieldValue('OFF_MS');
  setupStatements[`led_${pin}`] = `  pinMode(${pin}, OUTPUT);\n`;
  return `  digitalWrite(${pin}, HIGH);\n  delay(${onMs});\n  digitalWrite(${pin}, LOW);\n  delay(${offMs});\n`;
};

Blockly.Blocks['led_set'] = {
  init() {
    this.appendDummyInput()
      .appendField('Set LED  pin')
      .appendField(new Blockly.FieldDropdown(
        qubiPinOptions(['P2','P3','P4','P5','P6','P7','P8','P9','P10','P11','P13','P14','P15','P16','P19','P20'])
      ), 'PIN')
      .appendField(new Blockly.FieldDropdown([['ON','HIGH'],['OFF','LOW']]), 'ST');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#9C27B0');
    this.setTooltip('Turn an LED on or off. Use with Pause blocks for custom timing.');
  }
};
arduinoGenerator.forBlock['led_set'] = function (b) {
  const pin = b.getFieldValue('PIN');
  setupStatements[`led_${pin}`] = `  pinMode(${pin}, OUTPUT);\n`;
  return `  digitalWrite(${pin}, ${b.getFieldValue('ST')});\n`;
};


/* ══════════════════════════════════════════════════════════════════
   ADVANCED BLOCKS — Functions, Arrays, Text, Math+, Time, Game, Timers
   ══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────── FUNCTIONS ─────────────────────────── */

// Track defined function names for call dropdowns
let _definedFunctions = [];
let _definedReturnFunctions = [];

Blockly.Blocks['func_define'] = {
  init() {
    this.appendDummyInput()
      .appendField('Function')
      .appendField(new Blockly.FieldTextInput('myFunction'), 'NAME');
    this.appendStatementInput('BODY').setCheck(null).appendField('do');
    this.setColour('#6e3aff');
    this.setTooltip('Define a reusable function with no return value.');
    this.setHelpUrl('');
  }
};
arduinoGenerator.forBlock['func_define'] = function(b) {
  const name = b.getFieldValue('NAME').replace(/\s+/g,'_');
  const body = arduinoGenerator.statementToCode(b, 'BODY');
  // register as a top-level function — output via finish
  arduinoGenerator._extraFunctions = arduinoGenerator._extraFunctions || {};
  arduinoGenerator._extraFunctions[name] = `void ${name}() {\n${body}}\n`;
  return '';
};

Blockly.Blocks['func_call'] = {
  init() {
    this.appendDummyInput()
      .appendField('Call function')
      .appendField(new Blockly.FieldTextInput('myFunction'), 'NAME');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#6e3aff');
    this.setTooltip('Call a function that was defined above.');
  }
};
arduinoGenerator.forBlock['func_call'] = function(b) {
  const name = b.getFieldValue('NAME').replace(/\s+/g,'_');
  return `  ${name}();\n`;
};

Blockly.Blocks['func_define_return'] = {
  init() {
    this.appendDummyInput()
      .appendField('Function')
      .appendField(new Blockly.FieldTextInput('getValue'), 'NAME')
      .appendField('returns');
    this.appendStatementInput('BODY').setCheck(null).appendField('do');
    this.setColour('#6e3aff');
    this.setTooltip('Define a function that returns a number.');
  }
};
arduinoGenerator.forBlock['func_define_return'] = function(b) {
  const name = b.getFieldValue('NAME').replace(/\s+/g,'_');
  const body = arduinoGenerator.statementToCode(b, 'BODY');
  arduinoGenerator._extraFunctions = arduinoGenerator._extraFunctions || {};
  arduinoGenerator._extraFunctions[name+'_ret'] = `float ${name}() {\n${body}  return 0;\n}\n`;
  return '';
};

Blockly.Blocks['func_call_return'] = {
  init() {
    this.appendDummyInput()
      .appendField('Call')
      .appendField(new Blockly.FieldTextInput('getValue'), 'NAME')
      .appendField('()');
    this.setOutput(true, 'Number');
    this.setColour('#6e3aff');
    this.setTooltip('Call a function that returns a value.');
  }
};
arduinoGenerator.forBlock['func_call_return'] = function(b) {
  const name = b.getFieldValue('NAME').replace(/\s+/g,'_');
  return [`${name}()`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['func_return'] = {
  init() {
    this.appendValueInput('VALUE').setCheck(null).appendField('return');
    this.setPreviousStatement(true);
    this.setColour('#6e3aff');
    this.setTooltip('Return a value from a function.');
  }
};
arduinoGenerator.forBlock['func_return'] = function(b) {
  const val = arduinoGenerator.valueToCode(b, 'VALUE', arduinoGenerator.ORDER_NONE) || '0';
  return `  return ${val};\n`;
};

/* ─────────────────────────── ARRAYS ─────────────────────────── */

Blockly.Blocks['array_create'] = {
  init() {
    this.appendDummyInput()
      .appendField('Create array')
      .appendField(new Blockly.FieldTextInput('myArray'), 'NAME')
      .appendField('size')
      .appendField(new Blockly.FieldNumber(10, 1, 256), 'SIZE');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#00897B');
    this.setTooltip('Declare a float array of fixed size.');
  }
};
arduinoGenerator.forBlock['array_create'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  const size = b.getFieldValue('SIZE');
  globalVariables[`arr_${name}`] = `float ${name}[${size}] = {0};`;
  return '';
};

Blockly.Blocks['array_get'] = {
  init() {
    this.appendValueInput('INDEX').setCheck('Number').appendField('array').appendField(new Blockly.FieldTextInput('myArray'), 'NAME').appendField('get item');
    this.setOutput(true, 'Number');
    this.setColour('#00897B');
    this.setTooltip('Get a value from an array by index.');
  }
};
arduinoGenerator.forBlock['array_get'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  const idx = arduinoGenerator.valueToCode(b, 'INDEX', arduinoGenerator.ORDER_NONE) || '0';
  return [`${name}[(int)(${idx})]`, arduinoGenerator.ORDER_ATOMIC];
};

Blockly.Blocks['array_set'] = {
  init() {
    this.appendValueInput('INDEX').setCheck('Number').appendField('array').appendField(new Blockly.FieldTextInput('myArray'), 'NAME').appendField('set item');
    this.appendValueInput('VALUE').setCheck('Number').appendField('to');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#00897B');
    this.setTooltip('Set a value in an array at an index.');
  }
};
arduinoGenerator.forBlock['array_set'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  const idx = arduinoGenerator.valueToCode(b, 'INDEX', arduinoGenerator.ORDER_NONE) || '0';
  const val = arduinoGenerator.valueToCode(b, 'VALUE', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
  return `  ${name}[(int)(${idx})] = ${val};\n`;
};

Blockly.Blocks['array_length'] = {
  init() {
    this.appendDummyInput().appendField('length of array').appendField(new Blockly.FieldTextInput('myArray'), 'NAME');
    this.setOutput(true, 'Number');
    this.setColour('#00897B');
    this.setTooltip('Get the number of elements in the array.');
  }
};
arduinoGenerator.forBlock['array_length'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  return [`(sizeof(${name})/sizeof(${name}[0]))`, arduinoGenerator.ORDER_ATOMIC];
};

Blockly.Blocks['array_fill'] = {
  init() {
    this.appendValueInput('VALUE').setCheck('Number').appendField('fill array').appendField(new Blockly.FieldTextInput('myArray'), 'NAME').appendField('with');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#00897B');
    this.setTooltip('Fill every element of an array with a value.');
  }
};
arduinoGenerator.forBlock['array_fill'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  const val = arduinoGenerator.valueToCode(b, 'VALUE', arduinoGenerator.ORDER_NONE) || '0';
  return `  for(int _i=0;_i<(int)(sizeof(${name})/sizeof(${name}[0]));_i++) ${name}[_i]=${val};\n`;
};

/* ─────────────────────────── TEXT ─────────────────────────── */

Blockly.Blocks['text_create'] = {
  init() {
    this.appendDummyInput()
      .appendField('Text variable')
      .appendField(new Blockly.FieldTextInput('myText'), 'NAME')
      .appendField('=')
      .appendField(new Blockly.FieldTextInput('hello'), 'VALUE');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#F06292');
    this.setTooltip('Create a String variable with an initial value.');
  }
};
arduinoGenerator.forBlock['text_create'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  const val = b.getFieldValue('VALUE');
  globalVariables[`str_${name}`] = `String ${name} = "${val}";`;
  return '';
};

Blockly.Blocks['text_length'] = {
  init() {
    this.appendDummyInput().appendField('length of').appendField(new Blockly.FieldTextInput('myText'), 'NAME');
    this.setOutput(true, 'Number');
    this.setColour('#F06292');
    this.setTooltip('Get the number of characters in a String.');
  }
};
arduinoGenerator.forBlock['text_length'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  return [`${name}.length()`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['text_join'] = {
  init() {
    this.appendDummyInput().appendField('join').appendField(new Blockly.FieldTextInput('myText'), 'NAME').appendField('+=');
    this.appendValueInput('EXTRA').setCheck(null).appendField('');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#F06292');
    this.setTooltip('Append text or a number to a String variable.');
  }
};
arduinoGenerator.forBlock['text_join'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  const extra = arduinoGenerator.valueToCode(b, 'EXTRA', arduinoGenerator.ORDER_NONE) || '""';
  return `  ${name} += String(${extra});\n`;
};

Blockly.Blocks['text_char_at'] = {
  init() {
    this.appendValueInput('INDEX').setCheck('Number').appendField('char at').appendField(new Blockly.FieldTextInput('myText'), 'NAME').appendField('index');
    this.setOutput(true, 'Number');
    this.setColour('#F06292');
    this.setTooltip('Get the character (as int) at a position in a String.');
  }
};
arduinoGenerator.forBlock['text_char_at'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  const idx = arduinoGenerator.valueToCode(b, 'INDEX', arduinoGenerator.ORDER_NONE) || '0';
  return [`${name}.charAt((int)(${idx}))`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['text_contains'] = {
  init() {
    this.appendDummyInput()
      .appendField('text').appendField(new Blockly.FieldTextInput('myText'), 'NAME')
      .appendField('contains').appendField(new Blockly.FieldTextInput('word'), 'SEARCH');
    this.setOutput(true, 'Boolean');
    this.setColour('#F06292');
    this.setTooltip('Returns true if the string contains the search text.');
  }
};
arduinoGenerator.forBlock['text_contains'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  const search = b.getFieldValue('SEARCH');
  return [`(${name}.indexOf("${search}") >= 0)`, arduinoGenerator.ORDER_RELATIONAL];
};

Blockly.Blocks['text_to_number'] = {
  init() {
    this.appendDummyInput().appendField('text').appendField(new Blockly.FieldTextInput('myText'), 'NAME').appendField('as number');
    this.setOutput(true, 'Number');
    this.setColour('#F06292');
    this.setTooltip('Convert a String to a float number.');
  }
};
arduinoGenerator.forBlock['text_to_number'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  return [`${name}.toFloat()`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['text_number_to'] = {
  init() {
    this.appendValueInput('NUM').setCheck('Number').appendField('number');
    this.appendDummyInput().appendField('as text');
    this.setOutput(true, null);
    this.setColour('#F06292');
    this.setTooltip('Convert a number to a String.');
  }
};
arduinoGenerator.forBlock['text_number_to'] = function(b) {
  const num = arduinoGenerator.valueToCode(b, 'NUM', arduinoGenerator.ORDER_NONE) || '0';
  return [`String(${num})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

/* ─────────────────────────── MATH ADVANCED ─────────────────────────── */

Blockly.Blocks['math_trig'] = {
  init() {
    this.appendValueInput('ANGLE').setCheck('Number')
      .appendField(new Blockly.FieldDropdown([['sin','sin'],['cos','cos'],['tan','tan'],['asin','asin'],['acos','acos'],['atan','atan']]), 'OP')
      .appendField('(');
    this.appendDummyInput().appendField(')');
    this.setOutput(true, 'Number');
    this.setColour('#AD1457');
    this.setTooltip('Trigonometric functions. Angle in radians.');
    this.setInputsInline(true);
  }
};
arduinoGenerator.forBlock['math_trig'] = function(b) {
  const op = b.getFieldValue('OP');
  const angle = arduinoGenerator.valueToCode(b, 'ANGLE', arduinoGenerator.ORDER_NONE) || '0';
  return [`${op}(${angle})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['math_sqrt'] = {
  init() {
    this.appendValueInput('NUM').setCheck('Number').appendField('√ sqrt(');
    this.appendDummyInput().appendField(')');
    this.setOutput(true, 'Number');
    this.setColour('#AD1457');
    this.setInputsInline(true);
    this.setTooltip('Square root of a number.');
  }
};
arduinoGenerator.forBlock['math_sqrt'] = function(b) {
  const num = arduinoGenerator.valueToCode(b, 'NUM', arduinoGenerator.ORDER_NONE) || '0';
  return [`sqrt(${num})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['math_pow'] = {
  init() {
    this.appendValueInput('BASE').setCheck('Number').appendField('pow(');
    this.appendValueInput('EXP').setCheck('Number').appendField(',');
    this.appendDummyInput().appendField(')');
    this.setOutput(true, 'Number');
    this.setColour('#AD1457');
    this.setInputsInline(true);
    this.setTooltip('Raise base to the power of exp.');
  }
};
arduinoGenerator.forBlock['math_pow'] = function(b) {
  const base = arduinoGenerator.valueToCode(b, 'BASE', arduinoGenerator.ORDER_NONE) || '0';
  const exp = arduinoGenerator.valueToCode(b, 'EXP', arduinoGenerator.ORDER_NONE) || '2';
  return [`pow(${base}, ${exp})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['math_floor_ceil'] = {
  init() {
    this.appendValueInput('NUM').setCheck('Number')
      .appendField(new Blockly.FieldDropdown([['floor','floor'],['ceil','ceil'],['round','round']]), 'OP')
      .appendField('(');
    this.appendDummyInput().appendField(')');
    this.setOutput(true, 'Number');
    this.setColour('#AD1457');
    this.setInputsInline(true);
    this.setTooltip('Round a number down, up, or to nearest integer.');
  }
};
arduinoGenerator.forBlock['math_floor_ceil'] = function(b) {
  const op = b.getFieldValue('OP');
  const num = arduinoGenerator.valueToCode(b, 'NUM', arduinoGenerator.ORDER_NONE) || '0';
  return [`${op}(${num})`, arduinoGenerator.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['math_modulo'] = {
  init() {
    this.appendValueInput('A').setCheck('Number').appendField('');
    this.appendValueInput('B').setCheck('Number').appendField('mod');
    this.setOutput(true, 'Number');
    this.setColour('#AD1457');
    this.setInputsInline(true);
    this.setTooltip('Remainder of A divided by B.');
  }
};
arduinoGenerator.forBlock['math_modulo'] = function(b) {
  const a = arduinoGenerator.valueToCode(b, 'A', arduinoGenerator.ORDER_NONE) || '0';
  const bv = arduinoGenerator.valueToCode(b, 'B', arduinoGenerator.ORDER_NONE) || '1';
  return [`((int)(${a}) % (int)(${bv}))`, arduinoGenerator.ORDER_MULTIPLICATIVE];
};

Blockly.Blocks['math_pi'] = {
  init() {
    this.appendDummyInput().appendField('π');
    this.setOutput(true, 'Number');
    this.setColour('#AD1457');
    this.setTooltip('The value of Pi (3.14159…)');
  }
};
arduinoGenerator.forBlock['math_pi'] = () => ['3.14159265358979', arduinoGenerator.ORDER_ATOMIC];

/* ─────────────────────────── TIME ─────────────────────────── */

Blockly.Blocks['time_millis'] = {
  init() {
    this.appendDummyInput().appendField('milliseconds since start');
    this.setOutput(true, 'Number');
    this.setColour('#546E7A');
    this.setTooltip('Returns ms elapsed since the board started.');
  }
};
arduinoGenerator.forBlock['time_millis'] = () => ['millis()', arduinoGenerator.ORDER_FUNCTION_CALL];

Blockly.Blocks['time_micros'] = {
  init() {
    this.appendDummyInput().appendField('microseconds since start');
    this.setOutput(true, 'Number');
    this.setColour('#546E7A');
    this.setTooltip('Returns µs elapsed since the board started.');
  }
};
arduinoGenerator.forBlock['time_micros'] = () => ['micros()', arduinoGenerator.ORDER_FUNCTION_CALL];

Blockly.Blocks['time_elapsed'] = {
  init() {
    this.appendDummyInput()
      .appendField('ms elapsed since')
      .appendField(new Blockly.FieldTextInput('startTime'), 'VAR');
    this.setOutput(true, 'Number');
    this.setColour('#546E7A');
    this.setTooltip('Milliseconds since a saved timestamp variable.');
  }
};
arduinoGenerator.forBlock['time_elapsed'] = function(b) {
  const v = varName(b.getFieldValue('VAR'));
  return [`(millis() - ${v})`, arduinoGenerator.ORDER_ADDITIVE];
};

Blockly.Blocks['time_every'] = {
  init() {
    this.appendValueInput('MS').setCheck('Number').appendField('every');
    this.appendDummyInput().appendField('ms');
    this.appendStatementInput('BODY').setCheck(null).appendField('do');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#546E7A');
    this.setTooltip('Run code at a set interval without using delay().');
  }
};
arduinoGenerator.forBlock['time_every'] = function(b) {
  const ms = arduinoGenerator.valueToCode(b, 'MS', arduinoGenerator.ORDER_NONE) || '1000';
  const body = arduinoGenerator.statementToCode(b, 'BODY');
  // unique static timer per block using block id
  const id = b.id.replace(/[^a-zA-Z0-9]/g,'').substring(0,8);
  globalVariables[`_tmr_${id}`] = `unsigned long _tmr_${id} = 0;`;
  return `  if(millis() - _tmr_${id} >= ${ms}) { _tmr_${id} = millis();\n${body}  }\n`;
};

/* ─────────────────────────── GAME ─────────────────────────── */

// Global game state
globalVariables['__game__'] = `int _gameScore = 0;\nint _gameLives = 3;\nbool _gameOver = false;`;

Blockly.Blocks['game_score'] = {
  init() {
    this.appendDummyInput().appendField('score');
    this.setOutput(true, 'Number');
    this.setColour('#E65100');
    this.setTooltip('Current game score.');
  }
};
arduinoGenerator.forBlock['game_score'] = () => {
  globalVariables['__game__'] = `int _gameScore = 0;\nint _gameLives = 3;\nbool _gameOver = false;`;
  return ['_gameScore', arduinoGenerator.ORDER_ATOMIC];
};

Blockly.Blocks['game_add_score'] = {
  init() {
    this.appendValueInput('POINTS').setCheck('Number').appendField('add');
    this.appendDummyInput().appendField('to score');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#E65100');
    this.setTooltip('Add points to the game score.');
    this.setInputsInline(true);
  }
};
arduinoGenerator.forBlock['game_add_score'] = function(b) {
  globalVariables['__game__'] = `int _gameScore = 0;\nint _gameLives = 3;\nbool _gameOver = false;`;
  const pts = arduinoGenerator.valueToCode(b, 'POINTS', arduinoGenerator.ORDER_NONE) || '1';
  return `  _gameScore += ${pts};\n`;
};

Blockly.Blocks['game_lives'] = {
  init() {
    this.appendDummyInput().appendField('lives remaining');
    this.setOutput(true, 'Number');
    this.setColour('#E65100');
    this.setTooltip('Current number of lives.');
  }
};
arduinoGenerator.forBlock['game_lives'] = () => {
  globalVariables['__game__'] = `int _gameScore = 0;\nint _gameLives = 3;\nbool _gameOver = false;`;
  return ['_gameLives', arduinoGenerator.ORDER_ATOMIC];
};

Blockly.Blocks['game_lose_life'] = {
  init() {
    this.appendDummyInput().appendField('lose a life');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#E65100');
    this.setTooltip('Subtract one life. Sets game over if lives reach 0.');
  }
};
arduinoGenerator.forBlock['game_lose_life'] = () => {
  globalVariables['__game__'] = `int _gameScore = 0;\nint _gameLives = 3;\nbool _gameOver = false;`;
  return `  if(_gameLives > 0) _gameLives--;\n  if(_gameLives <= 0) _gameOver = true;\n`;
};

Blockly.Blocks['game_is_over'] = {
  init() {
    this.appendDummyInput().appendField('game is over');
    this.setOutput(true, 'Boolean');
    this.setColour('#E65100');
    this.setTooltip('True when all lives are gone.');
  }
};
arduinoGenerator.forBlock['game_is_over'] = () => {
  globalVariables['__game__'] = `int _gameScore = 0;\nint _gameLives = 3;\nbool _gameOver = false;`;
  return ['_gameOver', arduinoGenerator.ORDER_ATOMIC];
};

Blockly.Blocks['game_show_score'] = {
  init() {
    this.appendDummyInput().appendField('show score on display');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#E65100');
    this.setTooltip('Display the current score on the LED matrix.');
  }
};
arduinoGenerator.forBlock['game_show_score'] = function() {
  _LC();
  globalVariables['__game__'] = `int _gameScore = 0;\nint _gameLives = 3;\nbool _gameOver = false;`;
  includeStatements['lc'] = '#include <MaxLedControl.h>';
  return `  lc.clearDisplay(0);\n  int _sc = _gameScore;\n  int _col = 4;\n  do { lc.setDigit(0, _col--, _sc % 10, false); _sc /= 10; } while(_sc > 0 && _col >= 0);\n`;
};

Blockly.Blocks['game_show_lives'] = {
  init() {
    this.appendDummyInput().appendField('show lives on display');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#E65100');
    this.setTooltip('Show remaining lives as heart icons on the LED matrix.');
  }
};
arduinoGenerator.forBlock['game_show_lives'] = function() {
  _LC();
  globalVariables['__game__'] = `int _gameScore = 0;\nint _gameLives = 3;\nbool _gameOver = false;`;
  return `  lc.clearDisplay(0);\n  for(int _l=0;_l<_gameLives&&_l<5;_l++) lc.setRow(0, _l, 0x28);\n`;
};

Blockly.Blocks['game_countdown'] = {
  init() {
    this.appendValueInput('SECS').setCheck('Number').appendField('countdown');
    this.appendDummyInput().appendField('seconds on display');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#E65100');
    this.setInputsInline(true);
    this.setTooltip('Count down from N seconds, showing each second on the display.');
  }
};
arduinoGenerator.forBlock['game_countdown'] = function(b) {
  _LC();
  const secs = arduinoGenerator.valueToCode(b, 'SECS', arduinoGenerator.ORDER_NONE) || '5';
  return `  for(int _cd=${secs};_cd>=0;_cd--) { lc.clearDisplay(0); lc.setDigit(0,4,_cd%10,false); if(_cd>9) lc.setDigit(0,3,_cd/10,false); delay(1000); }\n`;
};

/* ─────────────────────────── TIMERS ─────────────────────────── */

Blockly.Blocks['timer_start'] = {
  init() {
    this.appendDummyInput()
      .appendField('start timer')
      .appendField(new Blockly.FieldTextInput('timer1'), 'NAME');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#37474F');
    this.setTooltip('Record the current time in a named timer variable.');
  }
};
arduinoGenerator.forBlock['timer_start'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  globalVariables[`_tmrv_${name}`] = `unsigned long ${name} = 0;`;
  return `  ${name} = millis();\n`;
};

Blockly.Blocks['timer_read'] = {
  init() {
    this.appendDummyInput()
      .appendField('timer')
      .appendField(new Blockly.FieldTextInput('timer1'), 'NAME')
      .appendField('elapsed (ms)');
    this.setOutput(true, 'Number');
    this.setColour('#37474F');
    this.setTooltip('Milliseconds since the timer was started.');
  }
};
arduinoGenerator.forBlock['timer_read'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  return [`(millis() - ${name})`, arduinoGenerator.ORDER_ADDITIVE];
};

Blockly.Blocks['timer_reset'] = {
  init() {
    this.appendDummyInput()
      .appendField('reset timer')
      .appendField(new Blockly.FieldTextInput('timer1'), 'NAME');
    this.setPreviousStatement(true); this.setNextStatement(true);
    this.setColour('#37474F');
    this.setTooltip('Restart the timer from zero.');
  }
};
arduinoGenerator.forBlock['timer_reset'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  return `  ${name} = millis();\n`;
};

Blockly.Blocks['timer_expired'] = {
  init() {
    this.appendValueInput('DURATION').setCheck('Number').appendField('timer').appendField(new Blockly.FieldTextInput('timer1'), 'NAME').appendField('expired after');
    this.appendDummyInput().appendField('ms');
    this.setOutput(true, 'Boolean');
    this.setColour('#37474F');
    this.setInputsInline(true);
    this.setTooltip('True if the timer has been running longer than the duration.');
  }
};
arduinoGenerator.forBlock['timer_expired'] = function(b) {
  const name = varName(b.getFieldValue('NAME'));
  const dur = arduinoGenerator.valueToCode(b, 'DURATION', arduinoGenerator.ORDER_NONE) || '1000';
  return [`(millis() - ${name} >= ${dur})`, arduinoGenerator.ORDER_RELATIONAL];
};


/* ==================== CODE GENERATION ==================== */

// All GPIOs that are wired to an onboard peripheral or broken out on the
// QUBI board header (per QUBI_PIN_MAP), plus onboard-only peripheral pins
// that aren't part of the general header (RGB LEDs on GPIO4, buzzer on GPIO5).
// At boot, every one of these is driven LOW (or set to a safe INPUT for
// input-only pins) so nothing — LED matrix segments, RGB LEDs, buzzer,
// motor driver outputs, etc. — powers up in a random/floating state before
// the user's own blocks configure only the pins they actually use.
const QUBI_ONBOARD_ONLY_PINS = ['4', '5']; // RGB LEDs (WS_PIN), Buzzer
const QUBI_ALL_PERIPHERAL_PINS = (() => {
  const out = [...QUBI_ONBOARD_ONLY_PINS];
  Object.values(QUBI_PIN_MAP).forEach(({ gpio }) => { if (!out.includes(gpio)) out.push(gpio); });
  return out;
})();

function buildPowerSafeInit() {
  const inputOnlyGpio = QUBI_INPUT_ONLY.map(p => QUBI_PIN_MAP[p].gpio);
  const lines = ['  // --- Power-safe init: hold every peripheral pin LOW/idle at boot ---',
                  '  // so nothing lights up, spins, or buzzes until your blocks say so.'];
  QUBI_ALL_PERIPHERAL_PINS.forEach(gpio => {
    if (inputOnlyGpio.includes(gpio)) {
      lines.push(`  pinMode(${gpio}, INPUT);`);
    } else {
      lines.push(`  pinMode(${gpio}, OUTPUT); digitalWrite(${gpio}, LOW);`);
    }
  });
  lines.push('');
  return lines.join('\n') + '\n';
}

function generateArduinoCode() {
  setupStatements = {}; includeStatements = {}; globalVariables = {};
  arduinoGenerator._extraFunctions = {};
  // Re-expose on window after reset so extensions write into the fresh objects
  window.setupStatements   = setupStatements;
  window.includeStatements = includeStatements;
  window.globalVariables   = globalVariables;
  let setupCode = "", loopCode = "";

  // Generate top-level blocks (func_define blocks run and populate _extraFunctions)
  workspace.getTopBlocks(true).forEach(block => {
    if (block.type === "start") setupCode += arduinoGenerator.blockToCode(block);
    else if (block.type === "forever") loopCode += arduinoGenerator.blockToCode(block);
    else if (block.type === "func_define" || block.type === "func_define_return") {
      arduinoGenerator.blockToCode(block); // populates _extraFunctions
    }
  });

  // Declare all user-defined variables globally
  const wsVars = workspace.getVariableMap().getAllVariables();
  if (wsVars && wsVars.length) {
    globalVariables['__uservars__'] = wsVars.map(v => `float ${varName(v.name)} = 0;`).join('\n');
  }

  const includes = Object.values(includeStatements).join('\n');
  const globals = Object.values(globalVariables).join('\n');
  const pinSetupCode = Object.values(setupStatements).join("");
  const extraFuncs = Object.values(arduinoGenerator._extraFunctions || {}).join('\n');

  let code = '';
  if (includes) code += includes + '\n\n';
  if (globals) code += globals + '\n\n';
  if (extraFuncs) code += extraFuncs + '\n';
  code += 'void setup() {\n' + buildPowerSafeInit() + pinSetupCode + setupCode + '}\n\n';
  code += 'void loop() {\n' + loopCode + '}\n';

  return code;
}

function updateCode() {
  const output = $("generatedCode");
  if (!output) return;
  output.textContent = generateArduinoCode();

  if (typeof Prism !== 'undefined') {
    Prism.highlightElement(output);
  }

  const blockCount = workspace.getAllBlocks().length;
  const countEl = $('blockCount');
  if (countEl) countEl.textContent = `${blockCount} block${blockCount !== 1 ? "s" : ""}`;
}

setTimeout(() => { updateCode(); saveToHistory(); }, 200);

/* ---------------- KEYBOARD SHORTCUTS ---------------- */
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); const xmlText = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(workspace)); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([xmlText], { type: 'text/xml' })); a.download = 'workspace.xml'; a.click(); URL.revokeObjectURL(a.href); showToast('Workspace exported as XML', 'success', 2500); }
  if (e.ctrlKey && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
  if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
  if (e.key === 'Delete' && e.ctrlKey && confirm("Clear all blocks? This cannot be undone!")) {
    workspace.clear(); updateCode(); saveToHistory();
  }
});


/* ── Board preview fade helper ──
   Dims and pointer-blocks the board preview when any modal is open.
   Called by every modal open/close.                                    */
function _bpFade(modalOpen) {
  const panel = document.getElementById('bpPanel');
  const tab   = document.getElementById('bpToggleTab');
  if (!panel) return;
  if (modalOpen) {
    panel.style.opacity = '0';
    panel.style.pointerEvents = 'none';
    panel.style.transition = 'opacity 0.2s ease';
    if (tab) { tab.style.opacity = '0'; tab.style.pointerEvents = 'none'; }
  } else {
    panel.style.opacity = '1';
    panel.style.pointerEvents = '';
    if (tab) { tab.style.opacity = '1'; tab.style.pointerEvents = ''; }
  }
}

/* ---------------- SERVER & UPLOAD FUNCTIONS ---------------- */
async function checkServer() {
  try { return (await fetch(`${SERVER_URL}/api/health`)).ok; } catch { return false; }
}

async function getArduinoPorts() {
  const response = await fetch(`${SERVER_URL}/api/ports`);
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.ports;
}

/* ══════════════════════════════════════════════════════════════════
   QUBI PROGRESS PANEL
   Shared animated progress drawer used by both Compile and Upload.
   ══════════════════════════════════════════════════════════════════ */

(function () {
  /* Inject the panel HTML once */
  const PANEL_HTML = `
    <div id="qpb-inner">
      <div id="qpb-topbar">
        <div id="qpb-title-row">
          <span id="qpb-icon"></span>
          <span id="qpb-title">Working…</span>
        </div>
        <button id="qpb-close" title="Dismiss">✕</button>
      </div>
      <div id="qpb-track">
        <div id="qpb-fill"></div>
      </div>
      <ol id="qpb-steps"></ol>
      <div id="qpb-output" style="display:none"></div>
    </div>`;

  function ensurePanel() {
    if (document.getElementById('qubiProgressPanel')) return;
    const el = document.createElement('div');
    el.id = 'qubiProgressPanel';
    el.innerHTML = PANEL_HTML;
    document.body.appendChild(el);
    document.getElementById('qpb-close')?.addEventListener('click', () => hideProgressPanel());
  }

  /* ── Public API ── */
  window.showProgressPanel = function (title, iconSvg) {
    ensurePanel();
    const panel = document.getElementById('qubiProgressPanel');
    panel.className = 'qpb-running';
    document.getElementById('qpb-title').textContent = title;
    document.getElementById('qpb-icon').innerHTML = iconSvg || '';
    document.getElementById('qpb-steps').innerHTML = '';
    document.getElementById('qpb-output').style.display = 'none';
    document.getElementById('qpb-output').textContent = '';
    setProgressFill(0, '');
    panel.classList.add('qpb-visible');
  };

  window.hideProgressPanel = function () {
    const panel = document.getElementById('qubiProgressPanel');
    if (panel) panel.classList.remove('qpb-visible');
  };

  window.setProgressFill = function (pct, state) {
    const fill = document.getElementById('qpb-fill');
    if (!fill) return;
    fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
    fill.className = 'qpb-fill-' + (state || 'running');
  };

  window.addProgressStep = function (label, state) {
    /* state: 'pending' | 'active' | 'done' | 'error' | 'warn' */
    const ol = document.getElementById('qpb-steps');
    if (!ol) return null;
    const li = document.createElement('li');
    li.className = 'qpb-step qpb-step-' + (state || 'pending');
    li.innerHTML =
      '<span class="qpb-step-dot"></span>' +
      '<span class="qpb-step-label">' + label + '</span>' +
      '<span class="qpb-step-badge"></span>';
    ol.appendChild(li);
    return li;
  };

  window.setStepState = function (li, state, badge) {
    if (!li) return;
    li.className = 'qpb-step qpb-step-' + state;
    if (badge !== undefined) li.querySelector('.qpb-step-badge').textContent = badge;
  };

  window.finishProgressPanel = function (success, headline, detail, outputText) {
    const panel = document.getElementById('qubiProgressPanel');
    if (!panel) return;
    panel.className = 'qpb-visible ' + (success ? 'qpb-success' : 'qpb-error');
    document.getElementById('qpb-title').textContent = headline;
    setProgressFill(100, success ? 'success' : 'error');
    if (detail) {
      const badge = document.createElement('li');
      badge.className = 'qpb-step qpb-step-' + (success ? 'done' : 'error');
      badge.innerHTML =
        '<span class="qpb-step-dot"></span>' +
        '<span class="qpb-step-label qpb-detail-label">' + detail + '</span>';
      document.getElementById('qpb-steps')?.appendChild(badge);
    }
    if (outputText) {
      const out = document.getElementById('qpb-output');
      out.textContent = outputText;
      out.style.display = 'block';
    }
    if (success) setTimeout(() => hideProgressPanel(), 4000);
  };
})();

/* ══════════════════════════════════════════════════════════════════
   UPLOAD TO ARDUINO — with live progress panel
   ══════════════════════════════════════════════════════════════════ */
async function uploadToArduino() {
  const uploadBtn = $('uploadToArduinoBtn');
  if (!uploadBtn) return;

  const origHTML  = uploadBtn.innerHTML;
  const setUBtn   = (label, spin) => {
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = (spin
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="animation:spin .9s linear infinite"><path d="M21 12a9 9 0 11-6.22-8.56"/></svg>'
      : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>') +
      ' ' + label;
  };

  showProgressPanel('Uploading to QUBI…',
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>');

  const sServer = addProgressStep('Connecting to upload server', 'active');
  setProgressFill(5, 'running');

  try {
    setUBtn('Checking…', true);
    setStatus('Uploading…', 'uploading');

    const serverOk = await checkServer();
    if (!serverOk) {
      setStepState(sServer, 'error', 'Offline');
      finishProgressPanel(false, 'Upload server not running',
        'Start the QUBI server with npm start, then try again.');
      uploadBtn.disabled = false; uploadBtn.innerHTML = origHTML;
      showServerSetupModal();
      return;
    }
    setStepState(sServer, 'done', 'OK');
    setProgressFill(15, 'running');

    const sPorts = addProgressStep('Scanning for QUBI board', 'active');
    setUBtn('Finding boards…', true);
    const ports = await getArduinoPorts();

    if (ports.length === 0) {
      setStepState(sPorts, 'error', 'None found');
      finishProgressPanel(false, 'No board found',
        'Connect your QUBI board via USB and try again.');
      uploadBtn.disabled = false; uploadBtn.innerHTML = origHTML;
      return;
    }
    setStepState(sPorts, 'done', ports.length + ' found');
    setProgressFill(25, 'running');

    /* Port selection — hide progress briefly, show selection modal */
    const selectedPort = await showBoardSelectionModal(ports);
    if (!selectedPort) {
      hideProgressPanel();
      uploadBtn.disabled = false; uploadBtn.innerHTML = origHTML;
      return;
    }
    addProgressStep('Port: ' + (selectedPort.path || selectedPort.Name), 'done');
    setProgressFill(35, 'running');

    /* Compile phase */
    const sCompile = addProgressStep('Compiling sketch for QUBI', 'active');
    setUBtn('Compiling…', true);
    setProgressFill(45, 'running');

    /* Animated fill during long compile */
    let fillPct = 45;
    const compileTimer = setInterval(() => {
      if (fillPct < 75) { fillPct += 1; setProgressFill(fillPct, 'running'); }
    }, 400);

    const response = await fetch(`${SERVER_URL}/api/quick-upload`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: $('generatedCode').textContent,
        port: selectedPort.path,
        board: 'esp32:esp32:esp32'
      })
    });
    clearInterval(compileTimer);

    const result = await response.json();

    setStepState(sCompile, 'done', 'OK');
    setProgressFill(80, 'running');

    /* Upload phase — quick-upload does compile + flash in one request */
    const sUpload = addProgressStep('Flashing board via ' + (selectedPort.path || ''), 'active');
    setUBtn('Uploading…', true);
    setStepState(sUpload, 'done', 'OK');

    /* Size info */
    const sizeMatch = result.output?.match(/Sketch uses ([\d,]+) bytes.*?Maximum is ([\d,]+)/s);
    const sizeInfo = sizeMatch
      ? `Flash: ${sizeMatch[1]} / ${sizeMatch[2]} bytes`
      : 'Upload complete';

    finishProgressPanel(true, 'Upload successful! Board is running.', sizeInfo);
    setStatus('Uploaded', 'success');
    uploadBtn.innerHTML = origHTML; uploadBtn.disabled = false;

  } catch (error) {
    finishProgressPanel(false, 'Upload failed', error.message);
    uploadBtn.disabled = false; uploadBtn.innerHTML = origHTML;
    setStatus('Error', 'error');
    if (error.message?.includes('fetch') || error.message?.includes('Server')) showServerSetupModal();
  }
}

/* ══════════════════════════════════════════════════════════════════
   COMPILE ONLY — with live progress panel
   ══════════════════════════════════════════════════════════════════ */
async function compileCode() {
  const btn = $('compileBtn');
  if (!btn) return;

  const origHTML = btn.innerHTML;
  const setCBtn = (label, spin, cls) => {
    btn.disabled = spin;
    btn.className = 'compile-btn' + (cls ? ' ' + cls : '');
    btn.innerHTML = (spin
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="animation:spin .9s linear infinite"><path d="M21 12a9 9 0 11-6.22-8.56"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>') +
      ' ' + label;
  };

  showProgressPanel('Compiling sketch…',
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>');

  const sServer = addProgressStep('Connecting to build server', 'active');
  setProgressFill(8, 'running');

  try {
    setCBtn('Checking…', true);
    setStatus('Compiling…', 'busy');

    const serverOk = await checkServer();
    if (!serverOk) {
      setStepState(sServer, 'error', 'Offline');
      finishProgressPanel(false, 'Build server not running',
        'Start the QUBI server with npm start, then try again.');
      setCBtn('Compile', false);
      setStatus('Ready', 'ready');
      showServerSetupModal();
      return;
    }
    setStepState(sServer, 'done', 'OK');
    setProgressFill(18, 'running');

    const code = $('generatedCode')?.textContent || '';
    if (!code.trim() || code.includes('Your Arduino code will appear')) {
      setStepState(sServer, 'warn', 'Skip');
      finishProgressPanel(false, 'No code to compile',
        'Add some blocks to the workspace first.');
      setCBtn('Compile', false);
      setStatus('Ready', 'ready');
      return;
    }

    const sVerify = addProgressStep('Checking code for errors', 'active');
    setProgressFill(28, 'running');
    setCBtn('Compiling…', true);

    /* Animated fill during compile */
    let pct = 28;
    const timer = setInterval(() => {
      if (pct < 88) { pct += 1.5; setProgressFill(pct, 'running'); }
    }, 300);

    const response = await fetch(`${SERVER_URL}/api/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, board: 'esp32:esp32:esp32' })
    });
    clearInterval(timer);

    const result = await response.json();

    if (result.success) {
      setStepState(sVerify, 'done', '0 errors');
      const sizeMatch = result.output?.match(/Sketch uses ([\d,]+) bytes.*?Maximum is ([\d,]+)/s);
      const sizeInfo = sizeMatch
        ? `Flash: ${sizeMatch[1]} / ${sizeMatch[2]} bytes used`
        : 'Compiled successfully';
      finishProgressPanel(true, 'Compiled successfully — ready to upload', sizeInfo);
      setCBtn('Compile ✓', false, 'compile-ok');
      setStatus('Compiled OK', 'success');
      setTimeout(() => setCBtn('Compile', false), 4500);
    } else {
      const errCount = result.errorCount || 0;
      setStepState(sVerify, 'error', errCount + ' error' + (errCount !== 1 ? 's' : ''));
      const raw = result.details || result.error || 'Unknown error';
      const cleaned = raw
        .replace(/[A-Z]?:?[\/][^\s:]+[\/]sketch[\/]/gi, '')
        .replace(/\/tmp\/[^ :]+\//g, '');
      finishProgressPanel(false, 'Compile failed',
        errCount + ' error' + (errCount !== 1 ? 's' : '') + ' found — see output below',
        cleaned);
      setCBtn('Compile ✗', false, 'compile-err');
      setStatus('Compile errors', 'error');
      setTimeout(() => setCBtn('Compile', false), 5000);
    }
  } catch (err) {
    finishProgressPanel(false, 'Compile error', err.message);
    setCBtn('Compile', false);
    setStatus('Error', 'error');
    if (err.message?.includes('fetch')) showServerSetupModal();
  }
}


function createModal(className = '') {
  const modal = document.createElement('div');
  modal.className = `modal-overlay ${className}`;
  return modal;
}

function showServerSetupModal() {
  _bpFade(true);
  const modal = createModal();
  modal.innerHTML = `
    <div class="modal-content">
      <h2 class="modal-header">Upload Server Not Running</h2>
      <div class="error-box"><p style="margin: 0 0 10px 0; line-height: 1.7; font-size: 15px;">The QUBI upload server is not running on <strong>http://localhost:3000</strong></p></div>
      <div style="margin: 25px 0;">
        <h3 style="color: var(--accent); font-size: 18px; margin-bottom: 15px;">Quick Fix:</h3>
        <div class="code-block"><p style="margin: 0 0 10px 0; color: #aaa; font-size: 14px;"><strong>Step 1:</strong> Open the provided USB Drive</p><p style="margin: 0 0 10px 0; color: #aaa; font-size: 14px;"><strong>Step 2:</strong> Open the command prompt/terminal/</p><pre>To open the command prompt, click on the search bar in the folder and type 'cmd'</pre></div>
        <div class="code-block"><p style="margin: 0 0 10px 0; color: #aaa; font-size: 14px;"><strong>Step 3:</strong> Start the server</p><pre>npm start</pre></div>
        <div class="success-box"><p style="margin: 0; line-height: 1.6; font-size: 14px;">Once you see "QUBI Upload Server Running!", refresh this page and try uploading again.</p></div>
      </div>
      <button class="modal-button">Got It!</button>
    </div>`;
  document.body.appendChild(modal);
  const close = () => { document.body.removeChild(modal); _bpFade(false); };
  modal.querySelector('.modal-button').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

function showBoardSelectionModal(ports) {
  return new Promise((resolve) => {
    const modal = createModal();
    const portsList = ports.map((p, idx) => `
      <div class="port-item" data-index="${idx}">
        <div class="port-name">${p.path || p.Name || 'Unknown Port'}</div>
        <div class="port-manufacturer">${p.manufacturer || 'Unknown'}</div>
        <div class="port-serial">${p.serialNumber || 'No S/N'}</div>
      </div>`).join('');

    modal.innerHTML = `
      <div class="modal-content">
        <h2 class="modal-header">Select port of QUBI</h2>
        <p style="color: #aaa; margin-bottom: 20px;">Choose the board you want to upload to:</p>
        <div>${portsList}</div><button class="modal-button" style="background: #666;">Cancel</button>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelectorAll('.port-item').forEach(item => {
      item.addEventListener('click', () => { document.body.removeChild(modal); resolve(ports[parseInt(item.getAttribute('data-index'))]); });
    });
    modal.querySelector('.modal-button').addEventListener('click', () => { document.body.removeChild(modal); resolve(null); });
  });
}

function showSuccessModal() {
  const modal = createModal();
  modal.innerHTML = `
    <div class="modal-content" style="text-align: center;">
      <div class="success-icon">&#10003;</div><h2 class="modal-header">Upload Successful!</h2>
      <p style="line-height: 1.6; color: #aaa;">Your code has been uploaded to the QUBI board and is now running.</p><button class="modal-button">Awesome!</button>
    </div>`;
  document.body.appendChild(modal);
  const close = () => document.body.removeChild(modal);
  modal.querySelector('.modal-button').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  setTimeout(close, 3000);
}

/* ==================== SERIAL MONITOR ==================== */
let serialMonitor = {
  isOpen: false, port: null, reader: null, buffer: [], maxLines: 1000,
  baudRate: 115200, autoScroll: true, modal: null, hideBootMessages: false, showTimestamp: false, lineCount: 0,
  pipeAbort: null, pipePromise: null
};

function openSerialMonitor() {
  if (!('serial' in navigator)) return alert('Web Serial API is not supported in this browser.\nPlease use Chrome, Edge, or Opera.');

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'serialMonitorModal';
  modal.innerHTML = `
    <div class="serial-monitor-modal">
      <div class="serial-monitor-header">
        <div class="serial-monitor-title"><h3>Serial Monitor</h3><span id="serialStatus" class="serial-status">DISCONNECTED</span></div>
        <div class="serial-monitor-controls">
          <select id="serialBaudRate" class="serial-baud-select">
            <option value="9600">9600</option><option value="19200">19200</option><option value="38400">38400</option><option value="57600">57600</option><option value="921600">921600</option><option value="115200" selected>115200</option>
          </select>
          <button id="serialConnect" class="serial-btn serial-btn-connect">Connect</button>
          <button id="serialClear" class="serial-btn serial-btn-clear">Clear</button>
          <button id="closeSerialMonitor" class="serial-btn serial-btn-close">Close</button>
        </div>
      </div>
      <div id="serialOutput" class="serial-output"></div>
      <div class="serial-input-area">
        <input type="text" id="serialInput" class="serial-input" placeholder="Type message and press Enter..." />
        <button id="serialSend" class="serial-btn serial-btn-send">Send</button>
        <label class="serial-autoscroll-label" title="Automatically scroll to bottom"><input type="checkbox" id="serialAutoScroll" checked>Auto-scroll</label>
        <label class="serial-autoscroll-label" title="Hide boot garbage characters"><input type="checkbox" id="serialHideBoot">Hide Boot</label>
        <label class="serial-autoscroll-label" title="Show timestamps"><input type="checkbox" id="serialShowTime">Timestamp</label>
      </div>
    </div>`;
  document.body.appendChild(modal);
  serialMonitor.modal = modal;
  serialMonitor.lineCount = 0;
  setupSerialMonitorListeners();
}

function setupSerialMonitorListeners() {
  ['Connect', 'Clear', 'Send'].forEach(id => {
    const el = document.getElementById('serial' + id);
    if (el) el.addEventListener('click', id === 'Connect' ? toggleSerialConnection : id === 'Clear' ? clearSerialOutput : sendSerialData);
  });
  document.getElementById('closeSerialMonitor')?.addEventListener('click', closeSerialMonitor);
  document.getElementById('serialInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendSerialData(); });
  document.getElementById('serialAutoScroll')?.addEventListener('change', (e) => { serialMonitor.autoScroll = e.target.checked; });
  document.getElementById('serialHideBoot')?.addEventListener('change', (e) => { serialMonitor.hideBootMessages = e.target.checked; });
  document.getElementById('serialShowTime')?.addEventListener('change', (e) => { serialMonitor.showTimestamp = e.target.checked; });
  document.getElementById('serialBaudRate')?.addEventListener('change', (e) => { serialMonitor.baudRate = parseInt(e.target.value); });
}

async function toggleSerialConnection() { serialMonitor.port ? await disconnectSerial() : await connectSerial(); }

async function connectSerial() {
  const connectBtn = document.getElementById('serialConnect');
  try {
    if (connectBtn) connectBtn.disabled = true;
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: serialMonitor.baudRate });
    serialMonitor.port = port;
    serialMonitor.isOpen = true;

    const status = document.getElementById('serialStatus');
    if (status) { status.textContent = 'CONNECTED'; status.classList.add('connected'); }
    if (connectBtn) { connectBtn.textContent = 'Disconnect'; connectBtn.className = 'serial-btn serial-btn-disconnect'; connectBtn.disabled = false; }
    appendSerialOutput('=== Connected to Serial Port ===\n', '#00ff00');
    
    readSerialData().catch(err => {
      console.error('Serial read error:', err);
      if (serialMonitor.isOpen) appendSerialOutput(`\nConnection lost: ${err.message}\n`, '#ff3333');
    });
  } catch (error) {
    serialMonitor.isOpen = false; serialMonitor.port = null;
    if (connectBtn) connectBtn.disabled = false;
    const messages = { 'NotFoundError': 'No serial port selected\n', 'NotSupportedError': 'Web Serial API not supported.\n', 'NetworkError': 'Failed to open port. Is it in use?\n' };
    appendSerialOutput(messages[error.name] || `Connection failed: ${error.message}\n`, '#ff3333');
  }
}

async function disconnectSerial() {
  const connectBtn = document.getElementById('serialConnect');
  try {
    if (connectBtn) connectBtn.disabled = true;
    serialMonitor.isOpen = false;

    if (serialMonitor.reader) {
      try { await serialMonitor.reader.cancel(); } catch (e) {}
      try { serialMonitor.reader.releaseLock(); } catch (e) {}
      serialMonitor.reader = null;
    }

    // Abort the readable→textDecoder pipe so port.readable actually unlocks.
    // Cancelling the decoder's reader alone does NOT stop pipeTo() — without
    // this, port.readable stays locked forever and port.close() silently
    // fails or hangs, which is why Disconnect looked like it worked but
    // never actually released the OS-level port.
    if (serialMonitor.pipeAbort) {
      try { serialMonitor.pipeAbort.abort(); } catch (e) {}
    }
    if (serialMonitor.pipePromise) {
      try { await serialMonitor.pipePromise; } catch (e) {}
    }
    serialMonitor.pipeAbort = null;
    serialMonitor.pipePromise = null;

    if (serialMonitor.port) {
      try { await serialMonitor.port.close(); } catch (e) {}
      serialMonitor.port = null;
    }

    const status = document.getElementById('serialStatus');
    if (status) { status.textContent = 'DISCONNECTED'; status.classList.remove('connected'); }
    if (connectBtn) { connectBtn.textContent = 'Connect'; connectBtn.className = 'serial-btn serial-btn-connect'; connectBtn.disabled = false; }
    appendSerialOutput('=== Disconnected from Serial Port ===\n', '#ffaa00');
  } catch (error) {
    appendSerialOutput(`Disconnect error: ${error.message}\n`, '#ff3333');
    if (connectBtn) connectBtn.disabled = false;
  }
}

async function readSerialData() {
  if (!serialMonitor.port || !serialMonitor.port.readable) return;
  let reader;
  try {
    const textDecoder = new TextDecoderStream();
    const abortController = new AbortController();
    serialMonitor.pipeAbort = abortController;
    // Keep a handle to the pipe promise so disconnectSerial() can wait for the
    // pipe to actually unlock port.readable before calling port.close().
    serialMonitor.pipePromise = serialMonitor.port.readable
      .pipeTo(textDecoder.writable, { signal: abortController.signal })
      .catch(() => {}); // AbortError is expected on disconnect — swallow it

    reader = textDecoder.readable.getReader();
    serialMonitor.reader = reader;

    // FIXED: Added buffer to properly handle chunked serial strings
    let streamBuffer = '';

    while (serialMonitor.isOpen && serialMonitor.port) {
      try {
        const { value, done } = await reader.read();
        if (done) break;

        if (value && serialMonitor.isOpen) {
          streamBuffer += value;
          const lines = streamBuffer.split('\n');
          streamBuffer = lines.pop(); // keep the last incomplete chunk in the buffer

          lines.forEach(line => {
            requestAnimationFrame(() => appendSerialOutput(line + '\n', '#00ff00'));
          });
        }
      } catch (readError) {
        if (readError.name === 'NetworkError' || readError.name === 'AbortError' || readError.message.includes('canceled')) break;
        console.error('Read loop error:', readError);
        break;
      }
    }
  } catch (error) {
    appendSerialOutput(`\n? Read error: ${error.message}\n`, '#ff3333');
  } finally {
    if (reader) { try { await reader.cancel(); reader.releaseLock(); } catch (e) {} }
  }
}

async function sendSerialData() {
  const input = document.getElementById('serialInput');
  const message = input?.value.trim();
  if (!message) return;

  if (!serialMonitor.port || !serialMonitor.isOpen) return appendSerialOutput('Not connected to serial port\n', '#ff3333');
  try {
    const encoder = new TextEncoder();
    const writer = serialMonitor.port.writable.getWriter();
    await writer.write(encoder.encode(message + '\n'));
    writer.releaseLock();
    appendSerialOutput(`> ${message}\n`, '#00aaff');
    input.value = ''; input.focus();
  } catch (error) {
    appendSerialOutput(`Send error: ${error.message}\n`, '#ff3333');
  }
}

function appendSerialOutput(text, color = '#00ff00') {
  const output = document.getElementById('serialOutput');
  if (!output) return;
  if (serialMonitor.hideBootMessages && /[ \x00-\x08\x0B-\x0C\x0E-\x1F]/.test(text)) return;

  const line = document.createElement('div');
  line.style.color = color; line.style.margin = '0'; line.style.padding = '0';

  if (serialMonitor.showTimestamp && color === '#00ff00') {
    const now = new Date();
    const ts = `[${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}.${now.getMilliseconds().toString().padStart(3,'0')}] `;
    const tsSpan = document.createElement('span');
    tsSpan.style.color = '#888'; tsSpan.textContent = ts;
    line.appendChild(tsSpan);
    line.appendChild(document.createTextNode(text));
  } else {
    line.textContent = text;
  }
  
  output.appendChild(line);
  serialMonitor.buffer.push(text);
  if (serialMonitor.buffer.length > serialMonitor.maxLines) {
    serialMonitor.buffer.shift();
    if (output.firstChild) output.removeChild(output.firstChild);
  }
  if (serialMonitor.autoScroll) output.scrollTop = output.scrollHeight;
}

function clearSerialOutput() {
  const output = document.getElementById('serialOutput');
  if (output) { output.innerHTML = ''; serialMonitor.buffer = []; appendSerialOutput('=== Output Cleared ===\n', '#ffaa00'); }
}

async function closeSerialMonitor() {
  if (serialMonitor.port) await disconnectSerial();
  if (serialMonitor.modal && serialMonitor.modal.parentNode) { document.body.removeChild(serialMonitor.modal); serialMonitor.modal = null; }
}

/* ---------------- UI CONTROLS ---------------- */
$("copyCodeBtn")?.addEventListener("click", () => {
  navigator.clipboard.writeText($("generatedCode").textContent).then(() => {
    const btn = $("copyCodeBtn"); const orig = btn.textContent;
    btn.textContent = "Copied!"; setTimeout(() => btn.textContent = orig, 1500);
  });
});

$("downloadBtn")?.addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([$("generatedCode").textContent], { type: "text/plain" }));
  const rawName = document.getElementById('projectNameDisplay')?.textContent?.trim() || 'QUBI_code';
  a.download = `${rawName.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_') || 'QUBI_code'}.ino`;
  a.click(); URL.revokeObjectURL(a.href);
});

$("clearBtn")?.addEventListener("click", () => {
  if (confirm("Clear all blocks? This cannot be undone!")) { workspace.clear(); updateCode(); saveToHistory(); }
});

$("undoBtn")?.addEventListener("click", undo);
$("redoBtn")?.addEventListener("click", redo);
$("compileBtn")?.addEventListener("click", compileCode);
$("uploadToArduinoBtn")?.addEventListener("click", uploadToArduino);

// Inject compile result panel into DOM
(function() {
  const panel = document.createElement('div');
  panel.id = 'compileResultPanel';
  document.body.appendChild(panel);
})();
$("serialMonitorBtn")?.addEventListener("click", openSerialMonitor);

/* ---------------- RESIZABLE GUTTER ---------------- */
let resizing = false;
$("gutter")?.addEventListener("mousedown", () => resizing = true);
window.addEventListener("mouseup", () => resizing = false);
window.addEventListener("mousemove", (e) => {
  if (!resizing) return;
  const panel = document.getElementById("codePanel");
  if (panel && panel.classList.contains("visible")) {
    panel.style.flex = `0 0 ${Math.max(200, Math.min(800, window.innerWidth - e.clientX - 5))}px`;
    Blockly.svgResize(workspace);
  }
});

/* ══════════════════════════════════════════
   TOAST NOTIFICATIONS
   ══════════════════════════════════════════ */
(function () { document.body.appendChild(Object.assign(document.createElement('div'), { id: 'toast-container' })); })();
const TOAST_ICONS = { success: '✓', error: '✕', info: 'i', warning: '!' };

function showToast(message, type = 'info', duration = 3500) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${TOAST_ICONS[type] || '?'}</span><span class="toast-msg">${message}</span>`;
  document.getElementById('toast-container').appendChild(toast);
  const remove = () => { toast.classList.add('toast-out'); toast.addEventListener('animationend', () => toast.remove(), { once: true }); };
  setTimeout(remove, duration); toast.addEventListener('click', remove);
}

function setStatus(label, type = 'ready') {
  const lbl = document.getElementById('statusLabel'), dot = document.getElementById('statusChip')?.querySelector('.status-dot');
  if (lbl) lbl.textContent = label;
  if (dot) dot.style.background = { ready: '#22c55e', busy: '#f97316', error: '#ef4444', success: '#22c55e', uploading: '#4a5ef7' }[type] || '#22c55e';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('uploadToArduinoBtn')?.addEventListener('click', () => setStatus('Uploading…', 'uploading'));
  document.getElementById('copyCodeBtn')?.addEventListener('click', () => showToast('Code copied to clipboard', 'success', 2500));
  document.getElementById('downloadBtn')?.addEventListener('click', () => showToast('Downloading .ino file…', 'info', 2500));
  document.getElementById('clearBtn')?.addEventListener('click', () => setTimeout(() => { if (document.getElementById('blockCount')?.textContent === '0 blocks') showToast('Workspace cleared', 'warning', 2500); }, 100));
});
window.addEventListener('load', () => setTimeout(() => setStatus('Ready', 'ready'), 300));

/* ══════════════════════════════════════════
   QUBI BOARD PREVIEW SIMULATOR 
   ══════════════════════════════════════════ */
(function () {
  'use strict';

  const ICONS = {
    HEART:    [[0,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]],
    HAPPY:    [[0,1,0,1,0],[0,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0],[0,0,0,0,0]],
    SAD:      [[0,1,0,1,0],[0,0,0,0,0],[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,0]],
    ANGRY:    [[1,0,0,0,1],[0,1,0,1,0],[0,0,0,0,0],[0,1,1,1,0],[1,0,0,0,1]],
    SURP:     [[0,1,0,1,0],[0,0,0,0,0],[0,0,1,0,0],[0,1,0,1,0],[0,0,1,0,0]],
    CONF:     [[0,1,0,1,0],[0,0,0,0,0],[0,0,0,1,1],[0,0,1,0,0],[1,1,0,0,0]],
    STAR:     [[0,0,1,0,0],[1,1,1,1,1],[0,1,1,1,0],[1,0,1,0,1],[0,0,1,0,0]],
    CHECK:    [[0,0,0,0,1],[0,0,0,1,0],[1,0,1,0,0],[0,1,0,0,0],[0,0,0,0,0]],
    CROSS:    [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
    SQUARE:   [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
    DIAMOND:  [[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
    TARGET:   [[0,1,1,1,0],[0,1,0,1,0],[0,1,1,1,0],[0,1,0,1,0],[0,0,1,1,1]],
    MUSIC:    [[0,1,1,1,1],[0,1,0,0,1],[0,1,0,0,1],[1,1,0,1,1],[1,1,0,1,1]],
    LOCK:     [[0,1,1,1,0],[0,1,0,1,0],[1,1,1,1,1],[1,0,0,0,1],[1,1,1,1,1]],
    SKULL:    [[0,1,1,1,0],[1,0,1,0,1],[1,1,1,1,1],[0,1,1,1,0],[0,1,1,1,0]],
    WIFI:     [[1,1,1,1,1],[0,0,0,0,0],[0,1,1,1,0],[0,0,0,0,0],[0,0,1,0,0]],
    BT:       [[0,0,1,1,0],[1,0,1,0,1],[0,1,1,1,0],[1,0,1,0,1],[0,0,1,1,0]],
  };

  /* ── Arrow pixel maps — decoded from show_arrow MAP hex bytes ── */
  const ARROWS = {
    N:  [[0,0,1,0,0],[0,1,1,1,0],[1,0,1,0,1],[0,0,1,0,0],[0,0,1,0,0]],
    S:  [[0,0,1,0,0],[0,0,1,0,0],[1,0,1,0,1],[0,1,1,1,0],[0,0,1,0,0]],
    W:  [[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1],[0,1,0,0,0],[0,0,1,0,0]],
    E:  [[0,0,1,0,0],[0,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,1,0,0]],
    NW: [[1,1,1,0,0],[1,1,0,0,0],[1,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1]],
    SW: [[0,0,0,0,1],[0,0,0,1,0],[1,0,1,0,0],[1,1,0,0,0],[1,1,1,0,0]],
    NE: [[0,0,1,1,1],[0,0,0,1,1],[0,0,1,0,1],[0,1,0,0,0],[1,0,0,0,0]],
    SE: [[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,1],[0,0,0,1,1],[0,0,1,1,1]],
  };

  /* ── Digit pixel maps 0-9 (decoded from DIGITS[] hex in show_number) ── */
  const DIGITS = [
    [[0,1,1,1,0],[0,1,0,0,1],[0,1,0,0,1],[0,1,0,0,1],[0,1,1,1,0]], // 0
    [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]], // 1
    [[0,1,1,1,0],[0,0,0,0,1],[0,1,1,1,0],[0,1,0,0,0],[0,1,1,1,1]], // 2
    [[0,1,1,1,0],[0,0,0,0,1],[0,1,1,1,0],[0,0,0,0,1],[0,1,1,1,0]], // 3
    [[0,1,0,0,1],[0,1,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1]], // 4
    [[0,1,1,1,1],[0,1,0,0,0],[0,1,1,1,1],[0,0,0,0,1],[0,1,1,1,1]], // 5
    [[0,1,1,1,0],[0,1,0,0,0],[0,1,1,1,1],[0,1,0,0,1],[0,1,1,1,0]], // 6
    [[0,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,0,1,0,0]], // 7
    [[0,1,1,1,0],[0,1,0,0,1],[0,1,1,1,0],[0,1,0,0,1],[0,1,1,1,0]], // 8
    [[0,1,1,1,0],[0,1,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,1,1,1,0]], // 9
  ];

  /* ── Simple 5×5 font A-Z for show_string preview ── */
  const FONT5 = {
    A:[[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    B:[[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0]],
    C:[[0,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,0]],
    D:[[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
    E:[[1,1,1,1,1],[1,0,0,0,0],[1,1,1,0,0],[1,0,0,0,0],[1,1,1,1,1]],
    F:[[1,1,1,1,1],[1,0,0,0,0],[1,1,1,0,0],[1,0,0,0,0],[1,0,0,0,0]],
    G:[[0,1,1,1,0],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[0,1,1,1,0]],
    H:[[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    I:[[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
    J:[[0,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0]],
    K:[[1,0,0,0,1],[1,0,0,1,0],[1,1,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
    L:[[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
    M:[[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
    N:[[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1]],
    O:[[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    P:[[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
    Q:[[0,1,1,1,0],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,1,0],[0,1,1,0,1]],
    R:[[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,1,0],[1,0,0,0,1]],
    S:[[0,1,1,1,1],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
    T:[[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    U:[[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    V:[[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
    W:[[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
    X:[[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
    Y:[[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    Z:[[1,1,1,1,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]],
  };

  /* ── Animation preview frames (one representative frame per animation) ── */
  const ANIM_FRAMES = {
    HEART:  [[0,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]],
    LOAD:   [[0,0,0,1,0],[0,0,1,1,1],[0,0,0,1,0],[0,0,0,0,0],[0,0,0,0,0]],
    ARR_L:  [[0,0,0,1,0],[0,0,1,0,0],[0,1,1,1,1],[0,0,1,0,0],[0,0,0,1,0]],
    ARR_R:  [[0,0,0,1,0],[0,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0]],
    DOT:    [[1,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
    EXPAND: [[0,0,0,0,0],[0,0,1,1,1],[0,0,1,0,1],[0,0,1,1,1],[0,0,0,0,0]],
    COUNT:  [[0,1,1,1,0],[0,0,0,0,1],[0,0,1,1,0],[0,0,0,0,1],[0,1,1,1,0]],
  };

  const state = {
    ledMatrix: Array.from({ length: 5 }, () => Array(5).fill(false)),
    rgb: [{ r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0 }],
    buzzer: false, buzzerFreq: 0, pinStates: {},
    isOpen: true, playing: true, simStep: 0, simBlocks: [], simTimer: null, loopStart: 0,
  };

  const STEP_MS = 600;

  /* ════════════════════════════════════
     SVG BOARD
     ════════════════════════════════════ */
  function buildBoardSVG() {
    const W = 680, H = 520;
    // Matrix centred horizontally, rows 0-4 top-to-bottom
    const mX = W/2, mY = 230, mGX = 62, mGY = 44;

    const matrixLEDs = Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 5 }, (_, c) =>
        `<rect id="svgLed_${r}_${c}" 
          x="${mX + c * mGX - 135}" y="${mY + r * mGY - 40}" 
          width="32" height="20" rx="5" 
          fill="#2a2a2a" stroke="#3a3a3a" stroke-width="1.5"/>
         <text x="${mX + c * mGX - 120}" y="${mY + r * mGY - 45}" 
         text-anchor="middle" font-size="10" fill="#ffffff" font-family="monospace" pointer-events="none" font-weight="bold"
         id="svgLedLbl_${r}_${c}">L${r+1}${c+1}</text>`
      ).join('')
    ).join('');

    const pinLabels = ['GND','5V','3V3','0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','SDA','SCL','TX','RX','A','B','GND'];
    const pinW = (W - 36) / pinLabels.length;
    const edgePins = pinLabels.map((lbl, i) =>
      `<rect x="${18 + i * pinW + 2}" y="${H - 90}" width="${pinW - 4}" height="72" rx="4" fill="#b3b1ad" stroke="#44433f" stroke-width="1"/>
       <text x="${18 + i * pinW + pinW / 2}" y="${H - 92}" text-anchor="middle" font-size="${lbl.length > 3 ? 6.5 : 10}" fill="#fff" font-family="monospace" font-weight="bold">${lbl}</text>`
    ).join('');

    return `<svg id="boardSvg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${W}" height="${H}" rx="18" fill="#0d0d0d" stroke="#1a1a1a" stroke-width="2"/>
      ${Array.from({length:13},(_,i)=>`<line x1="0" y1="${i*44}" x2="${W}" y2="${i*44}" stroke="#161616" stroke-width="0.5"/>`).join('')}
      ${Array.from({length:16},(_,i)=>`<line x1="${i*46}" y1="0" x2="${i*46}" y2="${H-60}" stroke="#161616" stroke-width="0.5"/>`).join('')}

      <!-- BUZZER -->
      <rect x="28" y="30" width="70" height="70" rx="6" fill="#1a1a1a" stroke="#c8a020" stroke-width="1.5"/>
      <circle id="svgBuzzer" cx="64" cy="64" r="30" fill="#2a2a2a" stroke="#3a3a3a" stroke-width="2"/>
      <circle cx="64" cy="64" r="16" fill="#1a1a1a" stroke="#444" stroke-width="1.5"/>
      <text x="64" y="22" text-anchor="middle" font-size="14" fill="#c8c8c8" font-family="sans-serif" font-weight="bold">BUZZER</text>

      <!-- QUBI logo -->
      <text x="${W / 2}" y="50" text-anchor="middle" font-size="46" fill="#ffffff" font-family="sans-serif" font-weight="600" letter-spacing="2">QUBI</text>

      <!-- Lightning bolt logo -->
      <circle cx="${W/2}" cy="110" r="26" fill="#ffffff" stroke="#ffffff" stroke-width="10"/>
      <circle cx="${W/2}" cy="110" r="22" fill="#000000"/>
      <polygon points="358,62 318,122 338,122 328,162 358,112 338,112 351,75" fill="#000000"></polygon>
      <polygon points="360,60 320,120 340,120 330,160 360,110 340,110 353,82" fill="#ffffff"></polygon>


      <!-- POWER LED (always red - indicates board is powered) -->
      <text x="${W-45}" y="45" text-anchor="middle" font-size="12" fill="#c8c8c8" font-family="sans-serif">POWER ON</text>
      <rect id="svgPowerLed" x="${W-54}" y="50" width="32" height="20" rx="5" fill="#ff0000" stroke="#ffffff" stroke-width="1.5" style="filter:drop-shadow(0 0 5px rgba(34,197,94,0.8))"/>

      <!-- ONBOARD LED (GPIO2) -->
      <text x="100" y="198" text-anchor="middle" font-size="14" fill="#c8c8c8" font-family="sans-serif">BLINK</text>
      <rect id="svgOnboardLed" x="84" y="202" width="32" height="20" rx="5" fill="#ffffff" stroke="#333" stroke-width="1.5" style="filter: none;"></rect>
      
      <!-- LIDAR -->
      <rect x="${W-158}" y="30" width="75" height="50" rx="5" fill="#1a1a1a" stroke="#c8a020" stroke-width="1.5"/>
      <rect x="${W-152}" y="36" width="62" height="36" rx="3" fill="#2a2a2a" stroke="#444" stroke-width="1"/>
      <text x="${W-120}" y="92" text-anchor="middle" font-size="14" fill="#fff" font-family="monospace">LIDAR</text>

      <!-- LDR -->
      <text x="${W-120}" y="200" text-anchor="middle" font-size="14" fill="#c8c8c8" font-family="sans-serif">LDR</text>
      <rect x="${W-148}" y="150" width="56" height="32" rx="5" fill="#800000" stroke="#4a3a80" stroke-width="1.5"/>
      <rect x="${W-142}" y="156" width="44" height="20" rx="3" fill="#ffffff"/>

      <!-- RGB 1 -->
      <text x="220" y="105" text-anchor="middle" font-size="14" fill="#c8c8c8" font-family="sans-serif" font-weight="600">RGB1</text>
      <rect x="190" y="110" width="60" height="60" rx="6" fill="#ffffff" stroke="#333" stroke-width="1.5"/>
      <circle id="svgRgb0" cx="220" cy="140" r="22" fill="#2a2a2a" stroke="#444" stroke-width="2"/>

      <!-- RGB 2 -->
      <text x="470" y="105" text-anchor="middle" font-size="14" fill="#c8c8c8" font-family="sans-serif" font-weight="600">RGB2</text>
      <rect x="440" y="110" width="60" height="60" rx="6" fill="#ffffff" stroke="#333" stroke-width="1.5"/>
      <circle id="svgRgb1" cx="470" cy="140" r="22" fill="#2a2a2a" stroke="#444" stroke-width="2"/>

      <!-- 5x5 LED MATRIX label -->
      ${matrixLEDs}

      <!-- BUTTON A (GPIO16) -->
      <text x="40" y="300" text-anchor="middle" font-size="28" fill="#c8c8c8" font-family="sans-serif" font-weight="bold">A</text>
      <rect id="svgBtnA" x="69" y="258" width="64" height="64" rx="5" fill="#b3b3b3" stroke="#444" stroke-width="2"/>
      <circle cx="100" cy="290" r="16" fill="#222" stroke="#333" stroke-width="1.5" pointer-events="none"/>

      <!-- BUTTON B (GPIO17) -->
      <text x="645" y="300" text-anchor="middle" font-size="28" fill="#c8c8c8" font-family="sans-serif" font-weight="bold">B</text>
      <rect id="svgBtnB" x="555" y="258" width="64" height="64" rx="5" fill="#b3b3b3" stroke="#444" stroke-width="2"/>
      <circle cx="588" cy="290" r="16" fill="#222" stroke="#333" stroke-width="1.5" pointer-events="none"/>
      
      <text x="55" y="400" text-anchor="middle" font-size="24" fill="#c8c8c8" font-family="sans-serif" font-weight="bold">STEM</text>

      ${edgePins}
    </svg>`;
  }

  /* ════════════════════════════════════
     STATE
     ════════════════════════════════════ */
  function resetSimState() {
    state.ledMatrix = Array.from({ length: 5 }, () => Array(5).fill(false));
    state.rgb = [{ r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0 }];
    state.buzzer = false; state.buzzerFreq = 0;
  }
  window.qubiResetSimState = resetSimState;

  /* ════════════════════════════════════
     PANEL BUILD
     ════════════════════════════════════ */
  function buildPanel() {
    const tab = document.createElement('button'); tab.id = 'bpToggleTab'; tab.textContent = 'BOARD'; document.body.appendChild(tab);
    const panel = document.createElement('div'); panel.id = 'bpPanel';
    panel.innerHTML = `
      <div class="bp-titlebar">
        <div class="bp-title">
          <div class="bp-title-dot" id="bpTitleDot"></div>
          <span>Simulator</span>
        </div>
        <div class="bp-controls">
          <button class="bp-ctrl-btn" id="bpResetBtn" title="Reset simulation">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
            </svg>
          </button>
          <button class="bp-ctrl-btn bp-ctrl-primary" id="bpPlayPauseBtn" title="Pause simulation">
            <svg id="bpPlayIcon" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style="display:none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <svg id="bpPauseIcon" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          </button>
        </div>
      </div>

      <div class="bp-body">
        <div id="boardSvgWrap">${buildBoardSVG()}</div>

        <div class="bp-card bp-sim-card" id="bpSimCard">
          <div class="bp-sim-header">
            <div class="bp-card-title">Running</div>
            <div class="bp-step-counter" id="bpStepCounter">step 0 / 0</div>
          </div>
          <div class="bp-sim-label" id="bpSimLabel">— Add blocks to simulate —</div>
          <div class="bp-sim-bar-wrap"><div class="bp-sim-bar" id="bpSimBar"></div></div>
        </div>

        <div class="bp-card">
          <div class="bp-card-title">RGB LEDs · GPIO 4</div>
          <div class="bp-rgb-rows">
            ${[0,1].map(i=>`
            <div class="bp-rgb-row">
              <div class="bp-rgb-orb" id="bpRgb${i}"></div>
              <div class="bp-rgb-info">
                <div class="bp-rgb-label">RGB ${i+1}</div>
                <div class="bp-rgb-val" id="bpRgbVal${i}">off</div>
              </div>
            </div>`).join('')}
          </div>
        </div>

        <div class="bp-card">
          <div class="bp-card-title">Buzzer · GPIO 5</div>
          <div class="bp-buzzer-row">
            <div class="bp-buzzer-icon" id="bpBuzzerIcon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </div>
            <div>
              <div class="bp-buzzer-text" id="bpBuzzerText">OFF</div>
              <div class="bp-buzzer-freq" id="bpBuzzerFreq">&nbsp;</div>
            </div>
          </div>
        </div>
      </div>
      <div class="bp-footer">
        <span class="bp-footer-dot"></span>
        Simulator — no hardware needed
      </div>`;
    document.body.appendChild(panel);

    const editor = document.getElementById('editorArea');

    // Sync DOM to initial open state so panel is visible on load
    panel.classList.toggle('bp-hidden', !state.isOpen);
    tab.classList.toggle('bp-closed', !state.isOpen);
    if (editor) editor.classList.toggle('bp-shifted', state.isOpen);

    tab.addEventListener('click', () => {
      state.isOpen = !state.isOpen;
      panel.classList.toggle('bp-hidden', !state.isOpen); tab.classList.toggle('bp-closed', !state.isOpen);
      if (editor) editor.classList.toggle('bp-shifted', state.isOpen);
      setTimeout(() => { if (typeof Blockly !== 'undefined' && typeof workspace !== 'undefined') Blockly.svgResize(workspace); }, 300);
    });

    document.getElementById('bpPlayPauseBtn').addEventListener('click', () => {
      state.playing = !state.playing; updatePlayPauseUI();
      if (state.playing) { scheduleStep(); startAnimLoop(); } else stopAnimLoop();
    });

    document.getElementById('bpResetBtn').addEventListener('click', () => {
      state.simStep = 0; clearTimeout(state.simTimer); resetSimState(); rebuildSimBlocks(); applyStep();
      if (state.playing) scheduleStep();
    });
  }

  function updatePlayPauseUI() {
    const play = document.getElementById('bpPlayIcon'), pause = document.getElementById('bpPauseIcon');
    const btn = document.getElementById('bpPlayPauseBtn'), dot = document.getElementById('bpTitleDot');
    if (!play || !pause || !btn) return;
    play.style.display = state.playing ? 'none' : ''; pause.style.display = state.playing ? '' : 'none';
    btn.title = state.playing ? 'Pause simulation' : 'Resume simulation';
    state.playing ? btn.classList.add('bp-ctrl-primary') : btn.classList.remove('bp-ctrl-primary');
    if (dot) state.playing ? dot.classList.remove('bp-dot-paused') : dot.classList.add('bp-dot-paused');
  }

  /* ════════════════════════════════════
     BLOCK CHAIN HELPER
     ════════════════════════════════════ */
  function flattenChain(block) {
    const out = []; let cur = block;
    while (cur) { out.push(cur); cur = cur.nextConnection && cur.nextConnection.targetBlock(); }
    return out;
  }

  /* ════════════════════════════════════
     REBUILD SIM BLOCKS
     ════════════════════════════════════ */
  function rebuildSimBlocks() {
    if (typeof workspace === 'undefined') { state.simBlocks = []; state.loopStart = 0; return; }
    const all          = workspace.getAllBlocks(false);
    const startBlock   = all.find(b => b.type === 'start');
    const foreverBlock = all.find(b => b.type === 'forever');
    const setupBlocks  = [], loopBlocks = [];

    // FIXED: input name is 'BODY' not 'SETUP'/'LOOP'
    if (startBlock)   { const f = startBlock.getInput('BODY')?.connection?.targetBlock();   if (f) setupBlocks.push(...flattenChain(f)); }
    if (foreverBlock) { const f = foreverBlock.getInput('BODY')?.connection?.targetBlock(); if (f) loopBlocks.push(...flattenChain(f)); }

    if (!setupBlocks.length && !loopBlocks.length) {
      state.simBlocks = all.filter(b => b.type !== 'start' && b.type !== 'forever');
      state.loopStart = 0;
      if (state.simStep >= state.simBlocks.length) state.simStep = 0;
      return;
    }
    state.simBlocks = [...setupBlocks, ...loopBlocks];
    state.loopStart = setupBlocks.length;
    if (state.simStep >= state.simBlocks.length) state.simStep = 0;
  }
  window.qubiRebuildSimBlocks = rebuildSimBlocks;

  /* ════════════════════════════════════
     APPLY BLOCK TO STATE
     ════════════════════════════════════ */
  function applyBlockToState(block) {
    if (!block) return;
    switch (block.type) {

      /* ── Display ── */
      case 'show_leds':
        // FIXED: field names are L${r}${c} not LED_${r}_${c}
        state.ledMatrix = Array.from({length:5}, () => Array(5).fill(false));
        for (let r = 0; r < 5; r++)
          for (let c = 0; c < 5; c++)
            state.ledMatrix[r][c] = block.getFieldValue(`L${r}${c}`) === 'TRUE';
        break;

      case 'show_icon': {
        // Field: ICON → key matches ICONS map
        const pat = ICONS[block.getFieldValue('ICON')];
        if (pat) {
          state.ledMatrix = Array.from({length:5}, () => Array(5).fill(false));
          for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) state.ledMatrix[r][c] = !!pat[r][c];
        }
        break;
      }

      case 'show_arrow': {
        // FIXED: Field is DIR not DIRECTION; keys N/S/E/W/NE/SE/NW/SW
        const pat = ARROWS[block.getFieldValue('DIR')];
        if (pat) {
          state.ledMatrix = Array.from({length:5}, () => Array(5).fill(false));
          for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) state.ledMatrix[r][c] = !!pat[r][c];
        }
        break;
      }

      case 'show_number': {
        // Input name: NUM (value block). Try to read literal digit.
        const numBlock = block.getInput('NUM')?.connection?.targetBlock();
        const digit = numBlock ? Math.max(0, Math.min(9, parseInt(numBlock.getFieldValue('NUM')) || 0)) : 0;
        const pat = DIGITS[digit];
        state.ledMatrix = Array.from({length:5}, () => Array(5).fill(false));
        if (pat) for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) state.ledMatrix[r][c] = !!pat[r][c];
        break;
      }

      case 'show_string': {
        // Field: TEXT — show first character
        const text = (block.getFieldValue('TEXT') || 'H').toUpperCase();
        const pat = FONT5[text[0]];
        state.ledMatrix = Array.from({length:5}, () => Array(5).fill(false));
        if (pat) for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) state.ledMatrix[r][c] = !!pat[r][c];
        break;
      }

      case 'show_animation': {
        // Field: ANIM — show representative frame
        const pat = ANIM_FRAMES[block.getFieldValue('ANIM')];
        state.ledMatrix = Array.from({length:5}, () => Array(5).fill(false));
        if (pat) for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) state.ledMatrix[r][c] = !!pat[r][c];
        break;
      }

      case 'set_pixel': {
        // Fields: ROW, COL, ST ('true'/'false')
        const r = parseInt(block.getFieldValue('ROW')) || 0;
        const c = parseInt(block.getFieldValue('COL')) || 0;
        if (r >= 1 && r < 6 && c >= 1 && c < 6)
          state.ledMatrix[r-1][c-1] = block.getFieldValue('ST') === 'true';
        break;
      }

      case 'display_brightness':
        // Field: LVL — no visual change in sim needed
        break;

      case 'clear_screen':
        state.ledMatrix = Array.from({length:5}, () => Array(5).fill(false));
        break;

      /* ── RGB LEDs ── */
      case 'rgb_colour': {
        // FIXED: Fields are LED ('0','1','B') and COL ('255,0,0' etc.)
        const led  = block.getFieldValue('LED');
        const parts = (block.getFieldValue('COL') || '0,0,0').split(',').map(Number);
        const col  = { r: parts[0]||0, g: parts[1]||0, b: parts[2]||0 };
        if (led === 'B') { state.rgb[0] = {...col}; state.rgb[1] = {...col}; }
        else { const idx = parseInt(led); if (idx === 0 || idx === 1) state.rgb[idx] = col; }
        break;
      }

      case 'rgb_set': {
        // FIXED: Fields are LED ('0','1','B'), R, G, B — not LED_NUM/RED/GREEN/BLUE
        const led = block.getFieldValue('LED');
        const col = { r: parseInt(block.getFieldValue('R'))||0, g: parseInt(block.getFieldValue('G'))||0, b: parseInt(block.getFieldValue('B'))||0 };
        if (led === 'B') { state.rgb[0] = {...col}; state.rgb[1] = {...col}; }
        else { const idx = parseInt(led); if (idx === 0 || idx === 1) state.rgb[idx] = col; }
        break;
      }

      case 'rgb_brightness':
        // Field: BR — global brightness, no per-channel sim change
        break;

      case 'rgb_rainbow':
        // FIXED: No LED field — always affects both LEDs. Preview via animLoop.
        state.rgb[0] = { r: 255, g: 0, b: 128 };
        state.rgb[1] = { r: 0, g: 200, b: 255 };
        break;

      case 'rgb_traffic': {
        // FIXED: Field is LED ('0','1') not LED_INDEX/LED_NUM
        const idx = parseInt(block.getFieldValue('LED'));
        if (idx === 0 || idx === 1) state.rgb[idx] = { r: 255, g: 0, b: 0 };
        break;
      }

      case 'rgb_off': {
        // FIXED: Field is LED ('0','1','B')
        const led = block.getFieldValue('LED');
        const off = { r:0, g:0, b:0 };
        if (led === 'B') { state.rgb[0] = {...off}; state.rgb[1] = {...off}; }
        else { const idx = parseInt(led); if (idx === 0 || idx === 1) state.rgb[idx] = off; }
        break;
      }

      /* ── Buzzer ── */
      case 'buzzer_set':
        // FIXED: Field is ST ('ON'/'OFF') not STATE
        state.buzzer = block.getFieldValue('ST') === 'ON';
        state.buzzerFreq = state.buzzer ? 2000 : 0;
        break;

      case 'buzzer_tone':
        // FIXED: Field is HZ not FREQ
        state.buzzer = true;
        state.buzzerFreq = parseInt(block.getFieldValue('HZ')) || 1000;
        break;

      case 'buzzer_note': {
        // Field: NOTE (Hz as string), DUR
        const hz = parseInt(block.getFieldValue('NOTE')) || 0;
        state.buzzer = hz > 0; state.buzzerFreq = hz;
        break;
      }

      case 'buzzer_melody':
        // Field: M (melody name) — just show buzzer as active
        state.buzzer = true; state.buzzerFreq = 440;
        break;

      case 'buzzer_stop':
        state.buzzer = false; state.buzzerFreq = 0;
        break;

      /* ── GPIO Pins ── */
      case 'digital_write': {
        const pin = block.getFieldValue('PIN');
        // FIXED: Field is STATE ('HIGH'/'LOW') — same as original, this one was correct
        if (pin) state.pinStates[pin] = { mode:'output', value: block.getFieldValue('STATE') === 'HIGH' ? 1 : 0 };
        break;
      }
      case 'analog_write': {
        const pin = block.getFieldValue('PIN');
        if (pin) state.pinStates[pin] = { mode:'pwm', value: Math.round((parseInt(block.getFieldValue('VALUE'))||0)/255*100) };
        break;
      }
      case 'digital_read': {
        const pin = block.getFieldValue('PIN');
        if (pin && !state.pinStates[pin]) state.pinStates[pin] = { mode:'input', value:0 };
        break;
      }
      case 'analog_read': {
        const pin = block.getFieldValue('PIN');
        if (pin && !state.pinStates[pin]) state.pinStates[pin] = { mode:'input', value:0 };
        break;
      }
      case 'led_blink':
      case 'led_set': {
        const pin = block.getFieldValue('PIN');
        const on  = block.type === 'led_blink' || block.getFieldValue('ST') === 'HIGH';
        if (pin === '2') state.ledPin2 = on;
        state.pinStates[pin] = { mode: 'output', value: on ? 1 : 0 };
        break;
      }

      /* ── Control flow ── */
      case 'controls_if': {
        let ran = false;
        for (let i = 0; i <= (block.elseifCount_ || 0); i++) {
          if (evalCondition(block.getInput('IF'+i)?.connection?.targetBlock())) {
            const first = block.getInput('DO'+i)?.connection?.targetBlock();
            if (first) flattenChain(first).forEach(b => applyBlockToState(b));
            ran = true; break;
          }
        }
        if (!ran && (block.elseCount_ || 0)) {
          const first = block.getInput('ELSE')?.connection?.targetBlock();
          if (first) flattenChain(first).forEach(b => applyBlockToState(b));
        }
        break;
      }

      case 'repeat_do': {
        const timesBlock = block.getInput('TIMES')?.connection?.targetBlock();
        const n = Math.min(timesBlock ? (parseInt(timesBlock.getFieldValue('NUM')) || 1) : 1, 5);
        const first = block.getInput('DO')?.connection?.targetBlock();
        if (first) for (let i = 0; i < n; i++) flattenChain(first).forEach(b => applyBlockToState(b));
        break;
      }

      case 'while_do': {
        // Just run body once for preview
        const first = block.getInput('DO')?.connection?.targetBlock();
        if (first) flattenChain(first).forEach(b => applyBlockToState(b));
        break;
      }

      // FIXED: on_button uses 'DO' input, not 'BODY'
      case 'on_button': {
        const first = block.getInput('DO')?.connection?.targetBlock();
        if (first) flattenChain(first).forEach(b => applyBlockToState(b));
        break;
      }

      // FIXED: on_logo uses 'DO' input
      case 'on_logo': {
        const first = block.getInput('DO')?.connection?.targetBlock();
        if (first) flattenChain(first).forEach(b => applyBlockToState(b));
        break;
      }

      // FIXED: bt_on_receive uses 'DO' input
      case 'bt_on_receive': {
        const first = block.getInput('DO')?.connection?.targetBlock();
        if (first) flattenChain(first).forEach(b => applyBlockToState(b));
        break;
      }

      case 'espnow_on_receive': {
        const first = block.getInput('DO')?.connection?.targetBlock();
        if (first) flattenChain(first).forEach(b => applyBlockToState(b));
        break;
      }
      case 'espnow_init': case 'espnow_set_role': case 'espnow_add_peer':
      case 'espnow_send_text': case 'espnow_send_number': break;

      default: break;
    }
  }

  /* ════════════════════════════════════
     CONDITION EVALUATOR
     ════════════════════════════════════ */
  function evalCondition(block) {
    if (!block) return false;
    switch (block.type) {
      // FIXED: was 'button_read' → correct type is 'button_pressed'
      case 'button_pressed':
        return !!(state.pinStates[block.getFieldValue('PIN')]?.value);
      // FIXED: buttons_ab — checks both pins
      case 'buttons_ab':
        return !!(state.pinStates['16']?.value) && !!(state.pinStates['17']?.value);
      // FIXED: was 'logo_read' → correct type is 'logo_touched'
      case 'logo_touched':
        return !!(state.pinStates['13']?.value);
      case 'ldr_dark':
        return false; // sensor not simulated; default not dark
      case 'lidar_closer':
        return false; // sensor not simulated
      case 'mpu_gesture':
        return false; // sensor not simulated
      case 'wifi_connected':
        return false;
      case 'bt_available':
        return false;
      case 'serial_available':
        return false;
      case 'logic_boolean':
        return block.getFieldValue('BOOL') === 'TRUE';
      case 'logic_operation':
        return block.getFieldValue('OP') === 'AND'
          ? evalCondition(block.getInput('A')?.connection?.targetBlock()) && evalCondition(block.getInput('B')?.connection?.targetBlock())
          : evalCondition(block.getInput('A')?.connection?.targetBlock()) || evalCondition(block.getInput('B')?.connection?.targetBlock());
      case 'logic_not':
        return !evalCondition(block.getInput('VAL')?.connection?.targetBlock());
      case 'logic_compare': {
        const a  = evalNumeric(block.getInput('A')?.connection?.targetBlock());
        const b  = evalNumeric(block.getInput('B')?.connection?.targetBlock());
        const op = block.getFieldValue('OP');
        return op==='EQ'?a===b : op==='NEQ'?a!==b : op==='LT'?a<b : op==='LTE'?a<=b : op==='GT'?a>b : op==='GTE'?a>=b : false;
      }
      default: return false;
    }
  }

  function evalNumeric(block) {
    if (!block) return 0;
    switch (block.type) {
      case 'math_number': return parseFloat(block.getFieldValue('NUM')) || 0;
      case 'ldr_level':   return 2048;
      case 'lidar_mm':    return 500;
      case 'mpu_axis':    return 0;
      case 'digital_read':
      case 'analog_read': return (state.pinStates[block.getFieldValue('PIN')] || {}).value || 0;
      case 'button_pressed': return (state.pinStates[block.getFieldValue('PIN')]?.value) ? 1 : 0;
      default: return 0;
    }
  }

  /* ════════════════════════════════════
     SIM STEP LABELS
     ════════════════════════════════════ */
  const SIM_LABELS = {
    show_leds:'Showing LED pattern', show_icon:'Showing icon', show_arrow:'Showing arrow',
    show_number:'Showing number', show_string:'Scrolling text', show_animation:'Playing animation',
    set_pixel:'Setting pixel', display_brightness:'Setting brightness', clear_screen:'Clearing screen',
    rgb_colour:'Setting RGB colour', rgb_set:'Setting RGB values', rgb_brightness:'Setting RGB brightness',
    rgb_rainbow:'Rainbow cycling', rgb_traffic:'Traffic light', rgb_off:'RGB off',
    buzzer_set:'Buzzer toggled', buzzer_tone:'Playing tone', buzzer_note:'Playing note',
    buzzer_melody:'Playing melody', buzzer_stop:'Buzzer stopped',
    digital_write:'Writing pin', analog_write:'PWM output', digital_read:'Reading pin', analog_read:'Reading analogue', led_blink: 'Blinking LED', 
    delay:'Waiting (delay)', controls_if:'Checking condition',
    repeat_do:'Repeating', while_do:'While loop', for_do:'For loop',
    on_button:'Button event', on_logo:'Logo touch event', bt_on_receive:'BT receive',
    wifi_connect:'Connecting Wi-Fi', bt_begin:'Starting Bluetooth', serial_begin:'Serial init',
    thingspeak:'Sending to ThingSpeak', http_get:'HTTP GET', http_post:'HTTP POST',
    espnow_init:'Starting ESP-NOW', espnow_set_role:'Setting ESP-NOW role', espnow_add_peer:'Adding peer',
    espnow_send_text:'Sending text (ESP-NOW)', espnow_send_number:'Sending number (ESP-NOW)',
    espnow_on_receive:'ESP-NOW message received',
  };

  let _applyingStep = false;

  function applyStep() {
    if (!state.simBlocks.length) { updateSimIndicator(null, 0, 0); renderAll(); return; }
    const block = state.simBlocks[state.simStep];
    applyBlockToState(block);
    // Highlight current block safely without triggering workspace change events
    try {
      if (typeof workspace !== 'undefined' && block) {
        _applyingStep = true;
        workspace.getAllBlocks(false).forEach(b => {
          if (b.setHighlighted) b.setHighlighted(false);
        });
        if (block.setHighlighted) block.setHighlighted(true);
        _applyingStep = false;
      }
    } catch(e) { _applyingStep = false; }
    updateSimIndicator(block, state.simStep, state.simBlocks.length);
    renderAll();
  }

  function updateSimIndicator(block, step, total) {
    const label   = document.getElementById('bpSimLabel');
    const bar     = document.getElementById('bpSimBar');
    const counter = document.getElementById('bpStepCounter');
    const isLoop  = total > 0 && step >= state.loopStart && state.loopStart < total;
    const phase   = !total ? '' : (isLoop ? '🔁 loop' : '▶ setup');
    if (label)   label.textContent = block ? (SIM_LABELS[block.type] || block.type.replace(/_/g,' ')) : '— Add blocks to simulate —';
    if (bar)     bar.style.width   = total ? `${((step + 1) / total) * 100}%` : '0%';
    if (counter) counter.textContent = total ? `${phase}  ${step + 1} / ${total}` : '';
  }

  function scheduleStep() {
    clearTimeout(state.simTimer);
    if (!state.playing) return;
    const ms = STEP_MS;
    state.simTimer = setTimeout(() => {
      if (!state.playing) return;
      const total = state.simBlocks.length;
      if (total === 0) { scheduleStep(); return; }
      state.simStep = (state.simStep + 1 >= total) ? state.loopStart : state.simStep + 1;
      applyStep(); scheduleStep();
    }, ms);
  }

  /* ════════════════════════════════════
     RENDER
     ════════════════════════════════════ */
  function renderLEDs() {
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      const on   = state.ledMatrix[r][c];
      const rect = document.getElementById(`svgLed_${r}_${c}`);
      const lbl  = document.getElementById(`svgLedLbl_${r}_${c}`);
      if (rect) {
        rect.setAttribute('fill', on ? '#ff2222' : '#2a2a2a');
        rect.setAttribute('stroke', on ? '#ff2222' : '#3a3a3a');
        rect.style.filter = on ? 'drop-shadow(0 0 6px rgba(220,220,220,0.9))' : 'none';
      }
      if (lbl) lbl.setAttribute('fill', on ? '#111' : '#444');
    }
  }

  function renderRGB() {
    state.rgb.forEach((c, i) => {
      const col    = `rgb(${c.r},${c.g},${c.b})`;
      const glow   = c.r + c.g + c.b > 0;
      const orb    = document.getElementById(`bpRgb${i}`);
      const val    = document.getElementById(`bpRgbVal${i}`);
      const svgOrb = document.getElementById(`svgRgb${i}`);
      const hex    = glow ? '#' + [c.r,c.g,c.b].map(v=>v.toString(16).padStart(2,'0')).join('') : null;
      if (orb)    { orb.style.background = glow ? col : '#1a1a1a'; orb.style.boxShadow = glow ? `0 0 10px 3px rgba(${c.r},${c.g},${c.b},.6)` : 'none'; }
      if (val)    val.textContent = glow ? hex : 'off';
      if (svgOrb) { svgOrb.setAttribute('fill', glow ? col : '#2a2a2a'); svgOrb.style.filter = glow ? `drop-shadow(0 0 8px rgba(${c.r},${c.g},${c.b},0.9))` : 'none'; }
    });
  }

  function renderBuzzer() {
    const icon   = document.getElementById('bpBuzzerIcon');
    const text   = document.getElementById('bpBuzzerText');
    const freq   = document.getElementById('bpBuzzerFreq');
    const svgBzr = document.getElementById('svgBuzzer');
    if (icon)   icon.classList.toggle('on', state.buzzer);
    if (text)   text.textContent = state.buzzer ? 'ON' : 'OFF';
    if (freq)   freq.textContent = state.buzzer ? (state.buzzerFreq ? `${state.buzzerFreq} Hz` : 'buzzing') : '\u00a0';
    if (svgBzr) { svgBzr.setAttribute('fill', state.buzzer ? '#3a2010' : '#2a2a2a'); svgBzr.style.filter = state.buzzer ? 'drop-shadow(0 0 10px rgba(249,115,22,0.8))' : 'none'; }
  }

  function renderOnboardLed() {
    const led = document.getElementById('svgOnboardLed');
    const on  = state.ledPin2;
    if (led) {
      led.setAttribute('fill', on ? '#ff0000' : '#1a1a2e');
      led.setAttribute('stroke', on ? '#ffb7b7' : '#333');
      led.style.filter = on ? 'drop-shadow(0 0 6px rgba(255, 0, 0, 0.95))' : 'none';
    }
  }
  
  function updatePinsUI() {
    const grid = document.getElementById('bpPinGrid'); if (!grid) return;
    const pins = Object.keys(state.pinStates);
    if (!pins.length) { grid.innerHTML = '<div style="font-size:11px;color:var(--text-3);">No pin activity yet.</div>'; return; }
    grid.innerHTML = pins.map(pin => {
      const { mode, value } = state.pinStates[pin];
      const isPWM = mode === 'pwm';
      const pct   = isPWM ? value : (value ? 100 : 0);
      const type  = isPWM ? 'pwm' : (mode === 'input' ? 'in' : 'out');
      const disp  = isPWM ? `${value}%` : (value ? 'HIGH' : 'LOW');
      return `<div class="bp-pin-row"><span class="bp-pin-num">IO${pin}</span><span class="bp-pin-type ${type}">${type.toUpperCase()}</span><div class="bp-pin-bar-wrap"><div class="bp-pin-bar" style="width:${pct}%"></div></div><span class="bp-pin-val">${disp}</span></div>`;
    }).join('');
  }

  function renderAll() { renderLEDs(); renderRGB(); renderBuzzer(); renderOnboardLed(); }

  /* ════════════════════════════════════
     RAINBOW ANIMATION LOOP
     ════════════════════════════════════ */
  let hue = 0, _animRafId = null;

  function animLoop() {
    if (typeof workspace !== 'undefined' && state.playing) {
      const blocks = workspace.getAllBlocks(false);
      if (blocks.some(b => b.type === 'led_blink')) {
        state.ledPin2 = !state.ledPin2;
        renderOnboardLed();
      }
      if (blocks.some(b => b.type === 'rgb_rainbow')) {
        hue = (hue + 2) % 360;
        const [r, g, b] = hslToRgb(hue / 360, 1, .5);
        state.rgb[0] = { r, g, b };
        state.rgb[1] = { r: b, g: r, b: g }; // offset hue for LED2
        renderAll();
      }
    }
    if (state.playing) _animRafId = requestAnimationFrame(animLoop);
  }
  function startAnimLoop() { if (!_animRafId) _animRafId = requestAnimationFrame(animLoop); }
  function stopAnimLoop()  { if (_animRafId) { cancelAnimationFrame(_animRafId); _animRafId = null; } }
  function hslToRgb(h, s, l) {
    const f = (p, q, t) => { if (t<0)t+=1; if (t>1)t-=1; if (t<1/6)return p+(q-p)*6*t; if (t<.5)return q; if (t<2/3)return p+(q-p)*(2/3-t)*6; return p; };
    if (s === 0) return [l,l,l].map(v => Math.round(v*255));
    const q = l<.5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
    return [f(p,q,h+1/3), f(p,q,h), f(p,q,h-1/3)].map(v => Math.round(v*255));
  }

  /* ════════════════════════════════════
     WORKSPACE LISTENER
     ════════════════════════════════════ */
  function attachListener() {
    if (typeof workspace === 'undefined') { setTimeout(attachListener, 200); return; }
    workspace.addChangeListener(e => {
      // Ignore UI events (drag, scroll, click) and events we ourselves fire during highlighting
      if (e.isUiEvent || _applyingStep || isRestoring) return;
      const isStructural = ['create','delete','change','move','finished_loading'].includes(e.type);
      if (!isStructural) return; // only react to meaningful block changes
      rebuildSimBlocks();
      resetSimState();
      state.simStep = 0;
      applyStep();
      if (state.playing) { clearTimeout(state.simTimer); scheduleStep(); }
    });
    rebuildSimBlocks(); applyStep(); scheduleStep(); startAnimLoop();
  }

  function boot() { buildPanel(); attachListener(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();



/* ══════════════════════════════════════════
   ZOOM CONTROLS & MODE TOGGLE
   ══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('zoomInBtn')?.addEventListener('click', () => workspace.zoomCenter(1));
  document.getElementById('zoomOutBtn')?.addEventListener('click', () => workspace.zoomCenter(-1));
  document.getElementById('fitBtn')?.addEventListener('click', () => { workspace.scrollCenter(); workspace.setScale(1); Blockly.svgResize(workspace); });

  const blocksBtn = document.getElementById('blocksModeBtn'), codeBtn = document.getElementById('codeModeBtn'), panel = document.getElementById('codePanel'), gut = document.getElementById('gutter');
  function setMode(mode) {
    if (mode === 'blocks') { blocksBtn.classList.add('active'); codeBtn.classList.remove('active'); panel.classList.remove('visible'); gut.classList.remove('visible'); }
    else { codeBtn.classList.add('active'); blocksBtn.classList.remove('active'); panel.classList.add('visible'); gut.classList.add('visible'); }
    setTimeout(() => Blockly.svgResize(workspace), 10);
  }
  blocksBtn?.addEventListener('click', () => setMode('blocks')); codeBtn?.addEventListener('click', () => setMode('code')); setMode('blocks');
});

/* ══════════════════════════════════════════
   MINIMAP
   ══════════════════════════════════════════ */
(function () {
  const MINIMAP_W = 160, MINIMAP_H = 110;
  let minimapCanvas, minimapCtx, rafPending = false;

  function initMinimap() {
    minimapCanvas = document.getElementById('minimapCanvas'); if (!minimapCanvas) return;
    minimapCanvas.width = MINIMAP_W * (window.devicePixelRatio || 1); minimapCanvas.height = MINIMAP_H * (window.devicePixelRatio || 1);
    minimapCanvas.style.width = MINIMAP_W + 'px'; minimapCanvas.style.height = MINIMAP_H + 'px';
    minimapCtx = minimapCanvas.getContext('2d'); minimapCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    minimapCanvas.addEventListener('click', () => { workspace.scrollCenter(); Blockly.svgResize(workspace); });
    workspace.addChangeListener(scheduleMinimap); scheduleMinimap();
  }

  function scheduleMinimap() { if (rafPending) return; rafPending = true; requestAnimationFrame(() => { rafPending = false; drawMinimap(); }); }

  function drawMinimap() {
    if (!minimapCtx) return;
    const isDark = document.body.classList.contains('dark'), blocks = workspace.getAllBlocks(false);
    minimapCtx.clearRect(0, 0, MINIMAP_W, MINIMAP_H); minimapCtx.fillStyle = isDark ? '#080a0e' : '#e8eaed'; minimapCtx.fillRect(0, 0, MINIMAP_W, MINIMAP_H);
    if (!blocks.length) { minimapCtx.fillStyle = isDark ? '#2d3650' : '#c8cdd8'; minimapCtx.font = '10px Inter, sans-serif'; minimapCtx.textAlign = 'center'; minimapCtx.fillText('No blocks yet', MINIMAP_W / 2, MINIMAP_H / 2); return; }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    blocks.forEach(b => { const pos = b.getRelativeToSurfaceXY(), size = b.getHeightWidth ? b.getHeightWidth() : { height: 40, width: 100 }; minX = Math.min(minX, pos.x); minY = Math.min(minY, pos.y); maxX = Math.max(maxX, pos.x + size.width); maxY = Math.max(maxY, pos.y + size.height); });

    const scale = Math.min(MINIMAP_W / (maxX - minX + 32), MINIMAP_H / (maxY - minY + 32), 1), offsetX = (MINIMAP_W - (maxX - minX + 32) * scale) / 2 - (minX - 16) * scale, offsetY = (MINIMAP_H - (maxY - minY + 32) * scale) / 2 - (minY - 16) * scale;

    blocks.forEach(b => {
      const pos = b.getRelativeToSurfaceXY(), size = b.getHeightWidth ? b.getHeightWidth() : { height: 24, width: 80 };
      minimapCtx.fillStyle = b.getColour() || '#4a5ef7'; minimapCtx.globalAlpha = 0.75; minimapCtx.beginPath();
      minimapCtx.roundRect(pos.x * scale + offsetX, pos.y * scale + offsetY, Math.max(size.width * scale, 4), Math.max(size.height * scale, 3), 1.5); minimapCtx.fill();
    });
    minimapCtx.globalAlpha = 1;

    const metrics = workspace.getMetrics(), wsScale = workspace.scale;
    minimapCtx.strokeStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(74,94,247,0.7)'; minimapCtx.lineWidth = 1.2;
    minimapCtx.strokeRect((metrics.viewLeft / wsScale) * scale + offsetX, (metrics.viewTop / wsScale) * scale + offsetY, (metrics.viewWidth / wsScale) * scale, (metrics.viewHeight / wsScale) * scale);
  }

  document.getElementById('darkModeToggle')?.addEventListener('change', scheduleMinimap);
  window.addEventListener('load', () => setTimeout(initMinimap, 600));
})();

/* ══════════════════════════════════════════
   SPLASH / WELCOME SCREEN & PROJECT NAME
   ══════════════════════════════════════════ */
function closeSplash() {
  const modal = document.getElementById('splashModal');
  if (modal) { modal.style.opacity = '0'; modal.style.transition = 'opacity 0.2s ease'; setTimeout(() => { modal.style.display = 'none'; modal.style.opacity = ''; }, 200); }
  _bpFade(false);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('splashScratchBtn')?.addEventListener('click', () => {
    closeSplash();
    // Mark seen for this session only — will show again on next new window
    sessionStorage.setItem('qubi_splash_seen', '1');
  });
  document.getElementById('splashExamplesBtn')?.addEventListener('click', () => {
    closeSplash();
    sessionStorage.setItem('qubi_splash_seen', '1');
    // Note: examples modal opened by the examples IIFE listener below
  });

  // Editable Project Name logic
  const label = document.querySelector('.project-label');
  if (label) {
    label.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span id="projectNameDisplay" contenteditable="false" spellcheck="false" title="Click to rename project">QUBI Project</span>`;
    const nameEl = document.getElementById('projectNameDisplay');
    nameEl.addEventListener('click', () => {
      nameEl.contentEditable = 'true'; nameEl.classList.add('editing');
      const range = document.createRange(), sel = window.getSelection(); range.selectNodeContents(nameEl); sel.removeAllRanges(); sel.addRange(range);
    });
    const commit = () => { nameEl.contentEditable = 'false'; nameEl.classList.remove('editing'); nameEl.textContent = nameEl.textContent.trim() || 'QUBI Project'; };
    nameEl.addEventListener('blur', commit); nameEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); } });
  }
});

window.addEventListener('load', () => {
  // Show splash on every NEW window/tab open, but NOT on page refresh.
  //
  // How it works:
  //   - sessionStorage is cleared when the tab/window is closed, so
  //     'qubi_splash_seen' is always absent at the start of a new session.
  //   - On a refresh, the browser preserves sessionStorage, so the flag
  //     is still present and the splash stays hidden.
  //   - We also use the Navigation Timing API as a secondary check:
  //     navigate type = 0 (new window), reload type = 1 (refresh).
  //     This handles edge cases like hard-refresh (Ctrl+Shift+R) correctly.
  //
  const isRefresh = (() => {
    // Modern Navigation API (Chrome 82+, Firefox 98+)
    if (window.performance?.getEntriesByType) {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) return nav.type === 'reload';
    }
    // Fallback: legacy performance.navigation
    if (performance?.navigation) {
      return performance.navigation.type === 1; // 1 = TYPE_RELOAD
    }
    return false; // assume new window if API unavailable
  })();

  const alreadySeen = sessionStorage.getItem('qubi_splash_seen') === '1';

  if (!isRefresh && !alreadySeen) {
    setTimeout(() => {
      const m = document.getElementById('splashModal');
      if (m) m.style.display = 'flex';
    }, 400);
  }
});

/* ══════════════════════════════════════════
   KEYBOARD SHORTCUT HELP OVERLAY
   ══════════════════════════════════════════ */
(function () {
  const SHORTCUTS = [{ desc: 'Undo', keys: [['Ctrl', 'Z']] }, { desc: 'Clear workspace', keys: [['Ctrl', 'Delete']] }, { desc: 'Zoom in', keys: [['Ctrl', '=']] }, { desc: 'Zoom out', keys: [['Ctrl', '-']] }, { desc: 'Fit to screen', keys: [['Ctrl', '0']] }, { desc: 'Show keyboard shortcuts', keys: [['?']] }];
  function openShortcuts() {
    const existing = document.getElementById('shortcutsOverlay'); if (existing) { document.body.removeChild(existing); return; }
    const overlay = document.createElement('div'); overlay.id = 'shortcutsOverlay'; overlay.className = 'modal-overlay';
    overlay.innerHTML = `<div class="shortcuts-modal-content"><div class="shortcuts-header"><h2>Keyboard Shortcuts</h2><button class="modal-close-btn" id="closeShortcutsBtn" style="border:none;background:transparent;cursor:pointer;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div><div class="shortcuts-list">${SHORTCUTS.map(s => `<div class="shortcut-row"><span class="shortcut-desc">${s.desc}</span><div style="display:flex;gap:8px;align-items:center;">${s.keys.map(combo => `<span class="shortcut-keys">${combo.map(k => `<span class="kbd">${k}</span>`).join('<span class="kbd-sep">+</span>')}</span>`).join('<span class="kbd-sep"> / </span>')}</div></div>`).join('')}</div></div>`;
    document.body.appendChild(overlay);
    const close = () => { if (overlay.parentNode) document.body.removeChild(overlay); };
    document.getElementById('closeShortcutsBtn').addEventListener('click', close); overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  }
  document.addEventListener('DOMContentLoaded', () => {
    const navRight = document.querySelector('.nav-right');
    if (navRight) { const btn = document.createElement('button'); btn.className = 'shortcut-help-btn'; btn.title = 'Keyboard shortcuts (?)'; btn.textContent = '?'; btn.addEventListener('click', openShortcuts); navRight.insertBefore(btn, navRight.firstChild); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.contentEditable !== 'true') openShortcuts();
    if (e.key === '/' && !e.ctrlKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.contentEditable !== 'true') { e.preventDefault(); document.getElementById('qubiSearchInput')?.focus(); }
  });
})();

/* ══════════════════════════════════════════
   SERVER STATUS POLLING
   ══════════════════════════════════════════ */
(function () {
  let lastKnownState = null;
  async function pollServer() {
    let isOnline = false;
    try {
      const controller = new AbortController(), timeoutId = setTimeout(() => controller.abort(), 2000);
      try {
        const res = await fetch(`${SERVER_URL}/api/health`, { signal: controller.signal });
        isOnline = res.ok;
      } finally { clearTimeout(timeoutId); }
    } catch { isOnline = false; }
    const state = isOnline ? 'online' : 'offline';
    if (lastKnownState !== state) {
      lastKnownState = state;
      setStatus(isOnline ? 'Server ready' : 'Server offline', isOnline ? 'ready' : 'error');
    }
  }
  window.addEventListener('load', () => setTimeout(() => { pollServer(); setInterval(pollServer, 5000); }, 1500));
})();

/* ──────────────────────────────────────────────────────────────────
   FEATURE 1 — AUTOSAVE RESTORE BANNER
   ────────────────────────────────────────────────────────────────── */
(function () {
  function formatAge(ts) {
    if (!ts) return '';
    const diff = Date.now() - parseInt(ts, 10), min = Math.floor(diff / 60000), hr = Math.floor(diff / 3600000), day = Math.floor(diff / 86400000);
    return day >= 1 ? `${day}d ago` : hr >= 1 ? `${hr}h ago` : min >= 1 ? `${min}m ago` : 'just now';
  }
  function dismiss() { const el = document.getElementById('qubiRestoreBanner'); if (el) { el.style.transform = 'translate(-50%, -110%)'; setTimeout(() => el.remove(), 400); } }

  window.addEventListener('load', () => {
    setTimeout(() => {
      const savedXml = localStorage.getItem('workspace_autosave'), savedTs = localStorage.getItem('autosave_timestamp');
      if (!savedXml) return;
      if (workspace.getAllBlocks().length > 0) { const c = workspace.getAllBlocks().length; showToast(`Restored last session (${c} block${c !== 1 ? 's' : ''}) ${formatAge(savedTs)}`, 'info', 4500); }
      else {
        let blockCount = 0; try { blockCount = new DOMParser().parseFromString(savedXml, 'text/xml').querySelectorAll('block').length; } catch (_) {}
        const banner = document.createElement('div'); banner.id = 'qubiRestoreBanner';
        banner.innerHTML = `<div class="qrb-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg></div><div class="qrb-text"><span class="qrb-title">Session found${savedTs ? ` &bull; <em>${formatAge(savedTs)}</em>` : ''}</span><span class="qrb-sub">${blockCount > 0 ? `${blockCount} block${blockCount !== 1 ? 's' : ''}` : 'Saved workspace'} &mdash; restore your last session?</span></div><div class="qrb-actions"><button class="qrb-btn qrb-restore" id="qrbRestoreBtn">Restore</button><button class="qrb-btn qrb-discard" id="qrbDiscardBtn">Start fresh</button></div><button class="qrb-close" id="qrbCloseBtn">&#10005;</button>`;
        document.body.appendChild(banner);
        requestAnimationFrame(() => requestAnimationFrame(() => banner.style.transform = 'translate(-50%, 0)'));
        document.getElementById('qrbRestoreBtn').addEventListener('click', () => { 
          // FIXED: Used the central setWorkspace function to prevent history bugs
          setWorkspaceFromDom(Blockly.utils.xml.textToDom(savedXml));
          showToast('Session restored!', 'success', 2500); 
          dismiss(); 
        });
        document.getElementById('qrbDiscardBtn').addEventListener('click', () => { localStorage.removeItem('workspace_autosave'); localStorage.removeItem('autosave_timestamp'); sessionStorage.removeItem('qubi_splash_seen'); dismiss(); showToast('Starting fresh', 'info', 2000); });
        document.getElementById('qrbCloseBtn').addEventListener('click', dismiss);
      }
    }, 700);
  });
})();

/* ──────────────────────────────────────────────────────────────────
   FEATURE 2 — ONBOARDING CHECKLIST
   ────────────────────────────────────────────────────────────────── */
(function () {
  if (localStorage.getItem('qubi_onboarding_done') === '1') return;
  const STEPS = [
    { id: 'hasStart', label: 'Add an <b>On start</b> block', check: () => workspace.getTopBlocks().some(b => b.type === 'start') },
    { id: 'hasForever', label: 'Add a <b>Forever</b> loop block', check: () => workspace.getTopBlocks().some(b => b.type === 'forever') },
    { id: 'hasDisplay', label: 'Add a <b>Display</b> block', check: () => workspace.getAllBlocks().some(b => ['show_leds', 'show_icon', 'show_number', 'show_string', 'clear_screen', 'show_animation'].includes(b.type)) },
    { id: 'hasOutput', label: 'Add an <b>Output</b> (RGB / Buzzer)', check: () => workspace.getAllBlocks().some(b => ['rgb_set', 'rgb_traffic', 'rgb_rainbow', 'rgb_clear', 'buzzer_set', 'buzzer_tone'].includes(b.type)) },
    { id: 'hasCode', label: 'Open the <b>Code</b> panel', check: () => document.getElementById('codePanel')?.classList.contains('visible') },
  ];
  let state = {}; try { state = JSON.parse(localStorage.getItem('qubi_onboarding_state') || '{}'); } catch (_) { }
  const allDone = () => STEPS.every(s => state[s.id]), countDone = () => STEPS.filter(s => state[s.id]).length;

  function updateWidget() {
    const w = document.getElementById('qubiOnboarding'); if (!w) return;
    let anyNew = false;
    STEPS.forEach(s => {
      if (!state[s.id] && s.check()) {
        state[s.id] = true; anyNew = true;
        const item = document.getElementById('qob_' + s.id);
        if (item) { item.classList.add('done'); item.querySelector('.qob-tick').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>'; }
      }
    });
    if (!anyNew) return;
    localStorage.setItem('qubi_onboarding_state', JSON.stringify(state));
    if (allDone()) localStorage.setItem('qubi_onboarding_done', '1');
    document.getElementById('qobProgressFill').style.width = Math.round((countDone() / STEPS.length) * 100) + '%';
    document.getElementById('qobCount').textContent = countDone() + '/' + STEPS.length;
    if (allDone()) setTimeout(() => { showToast('🎉 All set! Happy coding!', 'success', 4000); w.style.transition = 'opacity 0.4s ease, transform 0.4s ease'; w.style.opacity = '0'; w.style.transform = 'translateY(12px)'; setTimeout(() => w.remove(), 450); }, 700);
  }

  window.addEventListener('load', () => setTimeout(() => {
    if (allDone()) return;
    const w = document.createElement('div'); w.id = 'qubiOnboarding';
    w.innerHTML = `<div class="qob-header"><div class="qob-title-row"><span class="qob-emoji">🚀</span><span class="qob-title">Getting started</span><span class="qob-count" id="qobCount">${countDone()}/${STEPS.length}</span><button class="qob-collapse-btn" id="qobCollapseBtn" title="Minimize"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg></button></div><div class="qob-progress-bar"><div class="qob-progress-fill" id="qobProgressFill" style="width:${Math.round((countDone() / STEPS.length) * 100)}%"></div></div></div><ul class="qob-list" id="qobList">${STEPS.map(s => `<li class="qob-item${state[s.id] ? ' done' : ''}" id="qob_${s.id}"><span class="qob-tick">${state[s.id] ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/></svg>'}</span><span class="qob-label">${s.label}</span></li>`).join('')}</ul><div class="qob-footer" id="qobFooter"><button class="qob-dismiss" id="qobDismissBtn">Skip tutorial</button></div>`;
    document.body.appendChild(w);
    let collapsed = false;
    document.getElementById('qobCollapseBtn').addEventListener('click', () => { collapsed = !collapsed; document.getElementById('qobList').style.maxHeight = collapsed ? '0' : ''; document.getElementById('qobList').style.overflow = collapsed ? 'hidden' : ''; document.getElementById('qobFooter').style.display = collapsed ? 'none' : ''; document.querySelector('#qobCollapseBtn polyline')?.setAttribute('points', collapsed ? '6 9 12 15 18 9' : '18 15 12 9 6 15'); });
    document.getElementById('qobDismissBtn').addEventListener('click', () => { localStorage.setItem('qubi_onboarding_done', '1'); w.style.opacity = '0'; w.style.transform = 'translateY(12px)'; setTimeout(() => w.remove(), 350); });
    setInterval(updateWidget, 1000);
  }, 1200));
})();

/* ──────────────────────────────────────────────────────────────────
   FEATURE 3 — ERROR FEEDBACK PANEL
   ────────────────────────────────────────────────────────────────── */
(function () {
  const PATTERNS = [
    { re: /error: '(\w+)' was not declared/i, fmt: m => `❌ Unknown name: <b>${m[1]}</b> — check spelling or declare the variable` },
    { re: /error: expected ['`]([^'`]+)/i, fmt: m => `❌ Syntax error near <b>${m[1]}</b> — something missing or misplaced` },
    { re: /error: (\w+) does not name a type/i, fmt: m => `❌ Unknown type: <b>${m[1]}</b> — a library may be missing` },
    { re: /error: no matching function/i, fmt: () => `❌ Wrong arguments — function called with wrong values` },
    { re: /error: cannot convert/i, fmt: () => `❌ Type mismatch — incompatible block types connected` },
    { re: /Sketch uses (\d+) bytes.*Maximum is (\d+)/i, fmt: m => `⚠️ Sketch too large: <b>${m[1]}</b>b (max <b>${m[2]}</b>b)` },
    { re: /warning: unused variable '([^']+)'/i, fmt: m => `⚠️ Unused variable: <b>${m[1]}</b>` },
    { re: /error: ld returned 1/i, fmt: () => `❌ Linker error — required function or library missing` },
  ];

  window.qubiShowErrorPanel = function(title, raw) {
    document.getElementById('qubiErrorPanel')?.remove();
    const out = [];
    raw.split('\n').forEach(line => {
      for (const { re, fmt } of PATTERNS) { const m = line.match(re); if (m) { out.push({ html: fmt(m), warn: /warning/i.test(line) }); return; } }
      if (/error:/i.test(line) && line.trim()) out.push({ html: '❌ ' + line.trim(), warn: false });
    });
    
    const p = document.createElement('div'); p.id = 'qubiErrorPanel';
    p.innerHTML = `<div class="qep-header"><div class="qep-title-row"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span class="qep-title">${title}</span><span class="qep-badge">${out.length || 1} issue${out.length !== 1 ? 's' : ''}</span></div><button class="qep-close" id="qepClose">&#10005;</button></div><div class="qep-body">${out.length ? out.map(e => `<div class="qep-error-row${e.warn ? ' qep-warn' : ''}"><span class="qep-msg">${e.html}</span></div>`).join('') : `<div class="qep-error-row"><span class="qep-msg">❌ ${raw.trim() || 'Unknown error'}</span></div>`}</div><div class="qep-footer"><button class="qep-copy-btn" id="qepCopy">Copy error</button><button class="qep-dismiss-btn" id="qepDismiss">Dismiss</button></div>`;
    document.body.appendChild(p);
    requestAnimationFrame(() => requestAnimationFrame(() => { p.style.opacity = '1'; p.style.transform = 'translateX(-50%) translateY(0) scale(1)'; }));
    
    const close = () => { p.style.opacity = '0'; p.style.transform = 'translateX(-50%) translateY(12px) scale(0.97)'; setTimeout(() => p.remove(), 300); };
    document.getElementById('qepClose').addEventListener('click', close); document.getElementById('qepDismiss').addEventListener('click', close);
    document.getElementById('qepCopy').addEventListener('click', () => navigator.clipboard.writeText(raw).then(() => { const b = document.getElementById('qepCopy'); if (b) { b.textContent = 'Copied!'; setTimeout(() => b.textContent = 'Copy error', 1500); } }));
    setTimeout(close, 30000);
  };

  const _alert = window.alert;
  window.alert = function (msg) {
    if (typeof msg === 'string') {
      if (msg.startsWith('Upload failed:')) { window.qubiShowErrorPanel('Upload / Compile Error', msg.replace(/^Upload failed:\s*/i, '')); setStatus('Error', 'error'); return; }
      if (msg.includes('QUBI was not found')) { window.qubiShowErrorPanel('Board Not Found', 'QUBI board not detected.\n\n• Check USB connection\n• Use a data cable (not charge-only)\n• Install the driver'); return; }
    }
    _alert.call(window, msg);
  };
})();

/* ══════════════════════════════════════════════════════════════════
   EXAMPLES MODAL
   ══════════════════════════════════════════════════════════════════ */
(function () {
  const EXAMPLES = [
    { id:'blink_led', title:'Blink LED', desc:'Flash the onboard LED on and off every second.', icon:'💡', cat:'beginner', accent:'#22c55e', xml:`<xml xmlns="https://developers.google.com/blockly/xml"><block type="start" x="40" y="40"><statement name="BODY"><block type="serial_begin"><field name="BAUD">9600</field><next><block type="digital_write"><field name="PIN">2</field><field name="STATE">HIGH</field><next><block type="delay"><field name="MS">500</field><next><block type="digital_write"><field name="PIN">2</field><field name="STATE">LOW</field><next><block type="delay"><field name="MS">500</field></block></next></block></next></block></next></block></next></block></statement></block></xml>` },
    { id:'hello_world', title:'Hello World', desc:'Show a scrolling message on the LED display.', icon:'👋', cat:'beginner', accent:'#22c55e', xml:`<xml xmlns="https://developers.google.com/blockly/xml"><block type="start" x="40" y="40"><statement name="BODY"><block type="show_string"><field name="TEXT">Hello!</field></block></statement></block><block type="forever" x="40" y="180"><statement name="BODY"><block type="show_string"><field name="TEXT">QUBI</field><next><block type="delay"><field name="MS">2000</field></block></next></block></statement></block></xml>` },
    { id:'heart_icon', title:'Show Heart', desc:'Display a heart icon on the 5×5 LED matrix.', icon:'❤️', cat:'display', accent:'#03a9f4', xml:`<xml xmlns="https://developers.google.com/blockly/xml"><block type="start" x="40" y="40"><statement name="BODY"><block type="show_icon"><field name="ICON">HEART</field></block></statement></block></xml>` },
    { id:'brightness_cycle', title:'Brightness Fade', desc:'Cycle the display brightness up and down smoothly.', icon:'🔆', cat:'display', accent:'#03a9f4', xml:`<xml xmlns="https://developers.google.com/blockly/xml"><block type="start" x="40" y="40"><statement name="BODY"><block type="show_icon"><field name="ICON">STAR</field></block></statement></block><block type="forever" x="40" y="180"><statement name="BODY"><block type="display_brightness"><field name="LEVEL">15</field><next><block type="delay"><field name="MS">500</field><next><block type="display_brightness"><field name="LEVEL">1</field><next><block type="delay"><field name="MS">500</field></block></next></block></next></block></next></block></statement></block></xml>` },
    { id:'rgb_rainbow', title:'Rainbow LEDs', desc:'Cycle through rainbow colours on the RGB LEDs.', icon:'🌈', cat:'display', accent:'#ffbf00', xml:`<xml xmlns="https://developers.google.com/blockly/xml"><block type="forever" x="40" y="40"><statement name="BODY"><block type="rgb_rainbow"><field name="SPEED">20</field><next><block type="delay"><field name="MS">50</field></block></next></block></statement></block></xml>` },
    { id:'traffic_light', title:'Traffic Light', desc:'Simulate a traffic light sequence with the RGB LEDs.', icon:'🚦', cat:'display', accent:'#ffbf00', xml:`<xml xmlns="https://developers.google.com/blockly/xml"><block type="forever" x="40" y="40"><statement name="BODY"><block type="rgb_traffic"><field name="COLOUR">RED</field><next><block type="delay"><field name="MS">3000</field><next><block type="rgb_traffic"><field name="COLOUR">YELLOW</field><next><block type="delay"><field name="MS">1000</field><next><block type="rgb_traffic"><field name="COLOUR">GREEN</field><next><block type="delay"><field name="MS">3000</field></block></next></block></next></block></next></block></next></block></statement></block></xml>` },
    { id:'light_sensor', title:'Light Sensor', desc:'Read the LDR and show a sun or moon icon based on brightness.', icon:'🌤️', cat:'sensors', accent:'#dd34ff', xml:`<xml xmlns="https://developers.google.com/blockly/xml"><block type="forever" x="40" y="40"><statement name="BODY"><block type="controls_if"><value name="IF0"><block type="ldr_dark"></block></value><statement name="DO0"><block type="show_icon"><field name="ICON">STAR</field></block></statement><statement name="ELSE"><block type="show_icon"><field name="ICON">SQUARE</field></block></statement></block></statement></block></xml>` },
    { id:'distance_sensor', title:'Distance Alert', desc:'Use the LiDAR to detect nearby objects and flash an alert.', icon:'📡', cat:'sensors', accent:'#dd34ff', xml:`<xml xmlns="https://developers.google.com/blockly/xml"><block type="forever" x="40" y="40"><statement name="BODY"><block type="controls_if"><value name="IF0"><block type="logic_compare"><field name="OP">LT</field><value name="A"><block type="lidar_mm"></block></value><value name="B"><block type="math_number"><field name="NUM">200</field></block></value></block></value><statement name="DO0"><block type="show_icon"><field name="ICON">CROSS</field><next><block type="delay"><field name="MS">300</field><next><block type="clear_screen"><next><block type="delay"><field name="MS">300</field></block></next></block></next></block></next></block></statement></block></statement></block></xml>` },
    { id:'shake_detect', title:'Shake Detector', desc:'Detect shaking with the accelerometer and play a sound.', icon:'📳', cat:'sensors', accent:'#dd34ff', xml:`<xml xmlns="https://developers.google.com/blockly/xml"><block type="forever" x="40" y="40"><statement name="BODY"><block type="controls_if"><value name="IF0"><block type="mpu_gesture"><field name="GESTURE">SHAKE</field></block></value><statement name="DO0"><block type="buzzer_tone"><field name="FREQ">880</field><field name="DUR">200</field><next><block type="show_icon"><field name="ICON">SURP</field></block></next></block></statement></block></statement></block></xml>` },
    { id:'melody', title:'Play Melody', desc:'Play a short musical melody on the buzzer.', icon:'🎵', cat:'music', accent:'#f97316', xml:`<xml xmlns="https://developers.google.com/blockly/xml"><block type="start" x="40" y="40"><statement name="BODY"><block type="buzzer_tone"><field name="FREQ">262</field><field name="DUR">300</field><next><block type="buzzer_tone"><field name="FREQ">294</field><field name="DUR">300</field><next><block type="buzzer_tone"><field name="FREQ">330</field><field name="DUR">300</field><next><block type="buzzer_tone"><field name="FREQ">349</field><field name="DUR">300</field><next><block type="buzzer_tone"><field name="FREQ">392</field><field name="DUR">600</field></block></next></block></next></block></next></block></next></block></statement></block></xml>` },
    { id:'espnow_send', title:'ESP-NOW Send', desc:'Send a message wirelessly to another QUBI board using ESP-NOW.', icon:'📶', cat:'wireless', accent:'#4a5ef7', xml:`<xml xmlns="https://developers.google.com/blockly/xml"><block type="start" x="40" y="40"><statement name="BODY"><block type="espnow_init"><next><block type="espnow_set_role"><field name="ROLE">SENDER</field></block></next></block></statement></block><block type="forever" x="40" y="200"><statement name="BODY"><block type="espnow_send_text"><field name="TEXT">Hello!</field><next><block type="delay"><field name="MS">1000</field></block></next></block></statement></block></xml>` },
    { id:'serial_log', title:'Serial Logger', desc:'Read sensor data and send it over Serial for monitoring.', icon:'🖥️', cat:'beginner', accent:'#22c55e', xml:`<xml xmlns="https://developers.google.com/blockly/xml"><block type="start" x="40" y="40"><statement name="BODY"><block type="serial_begin"><field name="BAUD">9600</field></block></statement></block><block type="forever" x="40" y="160"><statement name="BODY"><block type="serial_print"><value name="TEXT"><block type="lidar_mm"></block></value><next><block type="delay"><field name="MS">500</field></block></next></block></statement></block></xml>` },
  ];
  let activeFilter = 'all';
  function renderExamples(q) {
    const grid = document.getElementById('examplesGrid'); if (!grid) return;
    const query = (q||'').toLowerCase().trim();
    const filtered = EXAMPLES.filter(ex => (activeFilter==='all'||ex.cat===activeFilter) && (!query||ex.title.toLowerCase().includes(query)||ex.desc.toLowerCase().includes(query)));
    if (!filtered.length) { grid.innerHTML=`<div class="qex-empty">No examples match your search.</div>`; return; }
    grid.innerHTML = filtered.map(ex=>`<div class="qex-card" data-id="${ex.id}" style="--card-accent:${ex.accent}"><div class="qex-card-icon">${ex.icon}</div><div class="qex-card-title">${ex.title}</div><div class="qex-card-desc">${ex.desc}</div><div class="qex-card-footer"><span class="qex-badge ${ex.cat}">${ex.cat}</span><button class="qex-card-open-btn">Open <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button></div></div>`).join('');
    grid.querySelectorAll('.qex-card').forEach(c=>c.addEventListener('click',()=>loadExample(c.dataset.id)));
  }
  function loadExample(id) {
    const ex=EXAMPLES.find(e=>e.id===id); if(!ex) return;
    try { const dom=Blockly.utils.xml.textToDom(ex.xml); setWorkspaceFromDom(dom); saveToHistory(); closeExamples(); if(window.showToast)showToast(`Loaded: ${ex.title}`,'success'); }
    catch(err){ console.error(err); if(window.showToast)showToast('Could not load example','error'); }
  }
  function openExamples(){ document.getElementById('examplesModal').style.display='flex'; renderExamples(document.getElementById('examplesSearch')?.value||''); _bpFade(true); }
  function closeExamples(){ document.getElementById('examplesModal').style.display='none'; _bpFade(false); }
  window.addEventListener('load',()=>{
    document.getElementById('examplesBtn')?.addEventListener('click',openExamples);
    document.getElementById('examplesClose')?.addEventListener('click',closeExamples);
    document.getElementById('examplesModal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeExamples();});
    document.getElementById('examplesSearch')?.addEventListener('input',e=>renderExamples(e.target.value));
    document.getElementById('examplesTabs')?.addEventListener('click',e=>{
      const btn=e.target.closest('.qmf-tab'); if(!btn) return;
      document.querySelectorAll('#examplesTabs .qmf-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); activeFilter=btn.dataset.cat;
      renderExamples(document.getElementById('examplesSearch')?.value||'');
    });
    document.getElementById('splashExamplesBtn')?.addEventListener('click',()=>{document.getElementById('splashModal').style.display='none';openExamples();});
  });
})();

/* ══════════════════════════════════════════════════════════════════
   PROJECTS MODAL
   ══════════════════════════════════════════════════════════════════ */
(function () {
  const KEY='qubi_saved_projects';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return [];}};
  const save=p=>localStorage.setItem(KEY,JSON.stringify(p));
  const fmtDate=ts=>new Date(ts).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
  const fmtTime=ts=>new Date(ts).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
  const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  function render(q){
    const list=document.getElementById('projectsList'); if(!list) return;
    const query=(q||'').toLowerCase().trim();
    const projects=load().filter(p=>!query||p.name.toLowerCase().includes(query)||(p.desc||'').toLowerCase().includes(query)).sort((a,b)=>b.savedAt-a.savedAt);
    if(!projects.length){list.innerHTML=`<div class="qpj-empty"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg><div class="qpj-empty-title">${query?'No projects match':'No saved projects yet'}</div><div class="qpj-empty-sub">${query?'Try a different search.':'Click "Save Current" to save your workspace.'}</div></div>`;return;}
    list.innerHTML=projects.map(p=>`<div class="qpj-row" data-id="${p.id}"><div class="qpj-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg></div><div class="qpj-info"><div class="qpj-name">${esc(p.name)}</div><div class="qpj-meta">${p.desc?esc(p.desc)+' · ':''}Saved ${fmtDate(p.savedAt)} at ${fmtTime(p.savedAt)}</div></div><div class="qpj-actions"><button class="qpj-btn" data-action="rename" title="Rename"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="qpj-btn danger" data-action="delete" title="Delete"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button><button class="qpj-load-btn" data-action="load">Open</button></div></div>`).join('');
    list.querySelectorAll('.qpj-row').forEach(row=>{
      const id=row.dataset.id;
      row.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();const a=btn.dataset.action;if(a==='load')loadProj(id);else if(a==='delete')delProj(id,q);else if(a==='rename')renameProj(id,q);}));
    });
  }
  function loadProj(id){const p=load().find(x=>x.id===id);if(!p)return;try{setWorkspaceFromDom(Blockly.utils.xml.textToDom(p.xml));saveToHistory();closeProjects();if(window.showToast)showToast(`Opened: ${p.name}`,'success');}catch(e){console.error(e);}}
  function delProj(id,q){const projects=load();const p=projects.find(x=>x.id===id);if(!p)return;if(!confirm(`Delete "${p.name}"?`))return;save(projects.filter(x=>x.id!==id));render(q);if(window.showToast)showToast('Project deleted','info');}
  function renameProj(id,q){const projects=load();const p=projects.find(x=>x.id===id);if(!p)return;const n=prompt('Rename:',p.name);if(!n||!n.trim())return;p.name=n.trim();save(projects);render(q);}
  function saveProj(name,desc){if(!name.trim())return;const xml=Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(workspace));const projects=load();const now=Date.now();projects.push({id:'proj_'+now,name:name.trim(),desc:(desc||'').trim(),xml,savedAt:now});save(projects);if(window.showToast)showToast(`Saved: "${name.trim()}"`,'success');render('');}
  function openProjects(){document.getElementById('projectsModal').style.display='flex';render(document.getElementById('projectsSearch')?.value||''); _bpFade(true);}
  function closeProjects(){document.getElementById('projectsModal').style.display='none'; _bpFade(false);}
  function openSaveDialog(){document.getElementById('saveProjectDialog').style.display='flex'; _bpFade(true);const n=document.getElementById('saveProjectName');n.value='';document.getElementById('saveProjectDesc').value='';setTimeout(()=>n.focus(),80);}
  function closeSaveDialog(){document.getElementById('saveProjectDialog').style.display='none'; _bpFade(false);}
  window.addEventListener('load',()=>{
    document.getElementById('projectsBtn')?.addEventListener('click',openProjects);
    document.getElementById('projectsClose')?.addEventListener('click',closeProjects);
    document.getElementById('projectsModal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeProjects();});
    document.getElementById('projectsSearch')?.addEventListener('input',e=>render(e.target.value));
    document.getElementById('saveProjectBtn')?.addEventListener('click',()=>{closeProjects();openSaveDialog();});
    document.getElementById('saveDialogClose')?.addEventListener('click',closeSaveDialog);
    document.getElementById('saveDialogCancelBtn')?.addEventListener('click',closeSaveDialog);
    document.getElementById('saveProjectDialog')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeSaveDialog();});
    document.getElementById('saveDialogConfirmBtn')?.addEventListener('click',()=>{const n=document.getElementById('saveProjectName').value.trim();if(!n){document.getElementById('saveProjectName').focus();return;}saveProj(n,document.getElementById('saveProjectDesc').value);closeSaveDialog();openProjects();});
    document.getElementById('saveProjectName')?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('saveDialogConfirmBtn').click();if(e.key==='Escape')closeSaveDialog();});
  });
})();
/* ══════════════════════════════════════════════════════════════════
   ADVANCED TOOLBOX — dropdown header styling fix
   ══════════════════════════════════════════════════════════════════ */
(function() {
  // After Blockly renders, style the Advanced parent category to look like a header
  function styleAdvancedCategory() {
    const cats = document.querySelectorAll('.blocklyTreeRow');
    cats.forEach(row => {
      const label = row.querySelector('.blocklyTreeLabel');
      if (label && label.textContent.trim() === 'Advanced') {
        row.style.cssText += `
          background: linear-gradient(90deg, #3a3a5c, #2a2a45) !important;
          border-top: 1px solid #555 !important;
          margin-top: 4px !important;
        `;
        label.style.cssText += `
          color: #a0a8d0 !important;
          font-weight: 700 !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          letter-spacing: 1.2px !important;
        `;
      }
    });
  }
  window.addEventListener('load', () => setTimeout(styleAdvancedCategory, 1000));
})();

/* ══════════════════════════════════════════════════════════════════
   CODE ERROR CHECKER — live static analysis of generated Arduino code
   ══════════════════════════════════════════════════════════════════ */
(function() {

  // ── Rules: each returns {level, msg} or null ──
  const RULES = [
    // Empty loop
    code => /void loop\(\)\s*\{\s*\}/.test(code)
      ? { level:'warn', msg:'Your <b>loop()</b> is empty — nothing will run repeatedly.' } : null,

    // Serial.print without Serial.begin
    code => /Serial\.(print|println|read|available)/.test(code) && !/Serial\.begin/.test(code)
      ? { level:'error', msg:'<b>Serial.print</b> used but <b>Serial.begin()</b> is missing from setup.' } : null,

    // WiFi functions without wifi_connect
    code => /(http_get|http_post|WiFiClient|HTTPClient)/.test(code) && !/WiFi\.begin/.test(code)
      ? { level:'error', msg:'HTTP/WiFi blocks used but <b>WiFi.begin()</b> (Connect to Wi-Fi) is missing.' } : null,

    // ESP-NOW without espnow_init
    code => /esp_now_/.test(code) && !/esp_now_init/.test(code)
      ? { level:'error', msg:'ESP-NOW blocks used but <b>ESP-NOW Init</b> block is missing.' } : null,

    // Infinite delay in setup (very long delay blocking everything)
    code => { const m = code.match(/void setup\(\)[^}]*delay\((\d+)\)/); return m && parseInt(m[1]) > 10000 ? { level:'warn', msg:`Long <b>delay(${m[1]})</b> in setup — the board will appear frozen for ${(parseInt(m[1])/1000).toFixed(1)}s on start.` } : null; },

    // Undeclared array access (array_get/set without array_create)
    code => {
      const uses = [...code.matchAll(/(\w+)\[\(int\)/g)].map(m => m[1]);
      const decls = [...code.matchAll(/float\s+(\w+)\[/g)].map(m => m[1]);
      const missing = uses.filter(u => !decls.includes(u) && u !== 'sizeof');
      return missing.length ? { level:'error', msg:`Array <b>${missing[0]}</b> used but never created — add an <b>Array create</b> block.` } : null;
    },

    // Nested delay — delay inside a conditional (may cause missed events)
    code => /if\s*\([^)]+\)\s*\{[^}]*delay\s*\(/.test(code)
      ? { level:'info', msg:'<b>Pause/delay</b> inside an <b>if</b> block may cause missed button presses or sensor readings.' } : null,

    // Function called but not defined
    code => {
      const calls = [...code.matchAll(/^\s{2}(\w+)\(\);/gm)].map(m=>m[1])
        .filter(n => !['setup','loop'].includes(n));
      const defs = [...code.matchAll(/^(?:void|float|int)\s+(\w+)\s*\(/gm)].map(m=>m[1]);
      const missing = calls.filter(c => !defs.includes(c) && !/^(delay|millis|micros|Serial|Wire|WiFi|pixels|lc|mpu|lox|esp_now|ledcAttach|pinMode|digitalWrite|digitalRead|analogRead|analogWrite|sin|cos|tan|sqrt|pow|floor|ceil|round|abs|map|constrain|random|tone|noTone|String)/.test(c));
      return missing.length ? { level:'warn', msg:`Function <b>${missing[0]}()</b> is called but not defined — add a <b>Function define</b> block.` } : null;
    },

    // No setup and no forever — completely empty
    code => /void setup\(\)\s*\{\s*\}/.test(code) && /void loop\(\)\s*\{\s*\}/.test(code)
      ? { level:'info', msg:'Workspace is empty — add an <b>On start</b> or <b>Forever</b> block to get started.' } : null,

    // PWM/tone on non-PWM pins (ESP32 all pins are PWM-capable, just a general note)
    code => /ledcAttach\(5,/.test(code) && code.split('ledcAttach(5,').length > 2
      ? { level:'warn', msg:'Buzzer is initialised more than once — you only need one <b>Buzzer</b> block in setup.' } : null,

    // Very large array
    code => { const m = code.match(/float\s+\w+\[(\d+)\]/); return m && parseInt(m[1]) > 100 ? { level:'warn', msg:`Array of size <b>${m[1]}</b> — large arrays can exhaust QUBI's stack memory.` } : null; },
  ];

  let _lastIssues = [];
  let _panelVisible = false;

  function analyseCode(code) {
    const issues = [];
    for (const rule of RULES) {
      try {
        const result = rule(code);
        if (result) issues.push(result);
      } catch(e) { /* skip broken rules */ }
    }
    return issues;
  }

  function renderPanel(issues) {
    let panel = document.getElementById('qubiLintPanel');
    const btn = document.getElementById('qubiLintBtn');

    if (!issues.length) {
      if (panel) panel.style.display = 'none';
      if (btn) { btn.classList.remove('lint-has-errors','lint-has-warnings'); btn.title='No issues found'; }
      _panelVisible = false;
      return;
    }

    // Update button badge
    const errors = issues.filter(i=>i.level==='error').length;
    const warns  = issues.filter(i=>i.level==='warn').length;
    if (btn) {
      btn.classList.toggle('lint-has-errors', errors > 0);
      btn.classList.toggle('lint-has-warnings', !errors && warns > 0);
      btn.title = `${errors} error${errors!==1?'s':''}, ${warns} warning${warns!==1?'s':''}`;
      // Update badge count
      const badge = btn.querySelector('.lint-badge');
      if (badge) badge.textContent = issues.length;
    }

    if (!_panelVisible) return;

    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'qubiLintPanel';
      document.body.appendChild(panel);
    }

    const iconMap = { error:'🔴', warn:'🟡', info:'🔵' };
    panel.innerHTML = `
      <div class="qlp-header">
        <div class="qlp-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Code Issues
          <span class="qlp-count">${issues.length}</span>
        </div>
        <button class="qlp-close" id="qlpClose">✕</button>
      </div>
      <div class="qlp-body">
        ${issues.map(i=>`
          <div class="qlp-row qlp-${i.level}">
            <span class="qlp-icon">${iconMap[i.level]||'⚪'}</span>
            <span class="qlp-msg">${i.msg}</span>
          </div>`).join('')}
      </div>
      <div class="qlp-footer">
        <span class="qlp-hint">Fix issues before uploading for best results</span>
        <button class="qlp-dismiss" id="qlpDismiss">Close</button>
      </div>`;

    panel.style.display = 'flex';
    document.getElementById('qlpClose')?.addEventListener('click', () => { _panelVisible=false; panel.style.display='none'; });
    document.getElementById('qlpDismiss')?.addEventListener('click', () => { _panelVisible=false; panel.style.display='none'; });
  }

  // Hook into updateCode
  function runLint() {
    const code = document.getElementById('generatedCode')?.textContent || '';
    const issues = analyseCode(code);
    _lastIssues = issues;
    renderPanel(issues);
  }

  // Patch updateCode to run lint after each update
  const origUpdate = updateCode;
  window.updateCode = function() {
    origUpdate();
    setTimeout(runLint, 50);
  };

  // Create the lint button in the bottom bar
  window.addEventListener('load', () => {
    const bottomLeft = document.querySelector('.bottom-left');
    if (!bottomLeft) return;

    const btn = document.createElement('button');
    btn.id = 'qubiLintBtn';
    btn.className = 'lint-btn';
    btn.title = 'Check code for issues';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      Check
      <span class="lint-badge">0</span>`;

    btn.addEventListener('click', () => {
      _panelVisible = !_panelVisible;
      if (_panelVisible) {
        renderPanel(_lastIssues);
      } else {
        const p = document.getElementById('qubiLintPanel');
        if (p) p.style.display = 'none';
      }
    });

    bottomLeft.appendChild(btn);
    // Run initial lint
    setTimeout(runLint, 800);
  });

})();