export type UPBarcodeFormat =
  | 'auto'
  | 'CODE128'
  | 'CODE128A'
  | 'CODE128B'
  | 'CODE128C'
  | 'EAN13'
  | 'EAN8'
  | 'EAN5'
  | 'EAN2'
  | 'UPC'
  | 'UPCA'
  | 'UPCE'
  | 'CODE39'
  | 'ITF'
  | 'ITF14'
  | 'MSI'
  | 'MSI10'
  | 'MSI11'
  | 'MSI1010'
  | 'MSI1110'
  | 'pharmacode'
  | 'codabar';

export type UPBarcodeEncoding = {
  binary: string;
  format: Exclude<UPBarcodeFormat, 'auto'>;
  text: string;
};

const FORMAT_ORDER: Exclude<UPBarcodeFormat, 'auto'>[] = [
  'CODE128',
  'EAN13',
  'EAN8',
  'EAN5',
  'EAN2',
  'UPCA',
  'UPCE',
  'CODE39',
  'ITF',
  'ITF14',
  'MSI',
  'MSI10',
  'MSI11',
  'MSI1010',
  'MSI1110',
  'pharmacode',
  'codabar',
];

export function encodeBarcode(value: string | number, format: UPBarcodeFormat = 'auto'): UPBarcodeEncoding {
  const text = String(value);
  if (!text) throw new Error('Barcode value cannot be empty');
  if (format === 'auto') {
    for (const candidate of FORMAT_ORDER) {
      try {
        return encodeBarcode(text, candidate);
      } catch {
      }
    }
    throw new Error(`No compatible barcode format for value: ${text}`);
  }

  switch (format) {
    case 'CODE128':
    case 'CODE128A':
    case 'CODE128B':
    case 'CODE128C':
      return encodeCode128(text, format);
    case 'EAN13':
      return encodeEAN13(text);
    case 'EAN8':
      return encodeEAN8(text);
    case 'EAN5':
    case 'EAN2':
      return encodeEAN52(text, format);
    case 'UPC':
    case 'UPCA':
      return encodeUPCA(text, format);
    case 'UPCE':
      return encodeUPCE(text);
    case 'CODE39':
      return encodeCode39(text);
    case 'ITF':
      return encodeITF(text, false);
    case 'ITF14':
      return encodeITF(text, true);
    case 'MSI':
    case 'MSI10':
    case 'MSI11':
    case 'MSI1010':
    case 'MSI1110':
      return encodeMSI(text, format);
    case 'pharmacode':
      return encodePharmacode(text);
    case 'codabar':
      return encodeCodabar(text);
    default:
      throw new Error(`Unsupported barcode format: ${format}`);
  }
}

const CODE128_PATTERNS = [
  '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
  '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
  '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
  '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
  '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
  '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
  '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
  '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
  '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
  '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
  '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
  '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
  '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
  '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
  '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
  '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
  '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
  '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
  '11011110110', '11110110110', '10101111000', '10100011110', '10001011110',
  '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
  '10111101110', '11101011110', '11110101110', '11010000100', '11010010000',
  '11010011100', '1100011101011',
] as const;

function encodeCode128(
  value: string,
  format: 'CODE128' | 'CODE128A' | 'CODE128B' | 'CODE128C',
): UPBarcodeEncoding {
  const set = format === 'CODE128A'
    ? 'A'
    : format === 'CODE128C'
      ? 'C'
      : format === 'CODE128B'
        ? 'B'
        : /^\d+$/.test(value) && value.length % 2 === 0
          ? 'C'
          : 'B';

  if (set === 'A' && !/^[\x00-\x5f]+$/.test(value)) {
    throw new Error('CODE128A supports ASCII 0 through 95');
  }
  if (set === 'B' && !/^[\x20-\x7f]+$/.test(value)) {
    throw new Error('CODE128B supports ASCII 32 through 127');
  }
  if (set === 'C' && !/^(?:\d{2})+$/.test(value)) {
    throw new Error('CODE128C requires an even number of digits');
  }

  const start = set === 'A' ? 103 : set === 'B' ? 104 : 105;
  const dataCodes = set === 'C'
    ? value.match(/.{2}/g)?.map(Number) ?? []
    : Array.from(value, (character) => {
        const code = character.charCodeAt(0);
        return set === 'A' ? (code < 32 ? code + 64 : code - 32) : code - 32;
      });
  const checksum = dataCodes.reduce(
    (sum, code, index) => sum + code * (index + 1),
    start,
  ) % 103;
  const binary = [start, ...dataCodes, checksum, 106]
    .map((code) => CODE128_PATTERNS[code])
    .join('');
  return { binary, format, text: value };
}

const CODE39_PATTERNS: Record<string, string> = {
  '0': '101000111011101', '1': '111010001010111', '2': '101110001010111',
  '3': '111011100010101', '4': '101000111010111', '5': '111010001110101',
  '6': '101110001110101', '7': '101000101110111', '8': '111010001011101',
  '9': '101110001011101', A: '111010100010111', B: '101110100010111',
  C: '111011101000101', D: '101011100010111', E: '111010111000101',
  F: '101110111000101', G: '101010001110111', H: '111010100011101',
  I: '101110100011101', J: '101011100011101', K: '111010101000111',
  L: '101110101000111', M: '111011101010001', N: '101011101000111',
  O: '111010111010001', P: '101110111010001', Q: '101010111000111',
  R: '111010101110001', S: '101110101110001', T: '101011101110001',
  U: '111000101010111', V: '100011101010111', W: '111000111010101',
  X: '100010111010111', Y: '111000101110101', Z: '100011101110101',
  '-': '100010101110111', '.': '111000101011101', ' ': '100011101011101',
  '*': '100010111011101', '$': '100010001000101', '/': '100010001010001',
  '+': '100010100010001', '%': '101000100010001',
};

function encodeCode39(value: string): UPBarcodeEncoding {
  const text = value.toUpperCase();
  if (!/^[0-9A-Z\-.$/+% ]+$/.test(text)) {
    throw new Error(`Invalid character in CODE39: ${value}`);
  }
  const payload = Array.from(text, (character) => CODE39_PATTERNS[character]).join('0');
  return {
    binary: `${CODE39_PATTERNS['*']}0${payload}0${CODE39_PATTERNS['*']}`,
    format: 'CODE39',
    text,
  };
}

const EAN_BINARIES = {
  L: ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'],
  G: ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'],
  R: ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'],
  O: ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'],
  E: ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'],
} as const;
const EAN13_STRUCTURE = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'] as const;
const EAN2_STRUCTURE = ['LL', 'LG', 'GL', 'GG'] as const;
const EAN5_STRUCTURE = ['GGLLL', 'GLGLL', 'GLLGL', 'GLLLG', 'LGGLL', 'LLGGL', 'LLLGG', 'LGLGL', 'LGLLG', 'LLGLG'] as const;

function encodeEanDigits(value: string, structure: string, separator = '') {
  return Array.from(value, (digit, index) => {
    const encoded = EAN_BINARIES[structure[index] as keyof typeof EAN_BINARIES][Number(digit)];
    return index < value.length - 1 ? `${encoded}${separator}` : encoded;
  }).join('');
}

function ean13Check(value: string) {
  const sum = Array.from(value.slice(0, 12), Number)
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}

function ean8Check(value: string) {
  const sum = Array.from(value.slice(0, 7), Number)
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10;
}

function upcaCheck(value: string) {
  const sum = Array.from(value.slice(0, 11), Number)
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10;
}

function encodeEAN13(value: string): UPBarcodeEncoding {
  if (!/^\d{12,13}$/.test(value)) throw new Error('EAN13 must be 12 or 13 digits');
  const normalized = value.length === 12 ? `${value}${ean13Check(value)}` : value;
  if (Number(normalized[12]) !== ean13Check(normalized)) {
    throw new Error('Invalid EAN13 check digit');
  }
  const binary =
    `101${encodeEanDigits(normalized.slice(1, 7), EAN13_STRUCTURE[Number(normalized[0])])}` +
    `01010${encodeEanDigits(normalized.slice(7), 'RRRRRR')}101`;
  return { binary, format: 'EAN13', text: normalized };
}

function encodeEAN8(value: string): UPBarcodeEncoding {
  if (!/^\d{7,8}$/.test(value)) throw new Error('EAN8 must be 7 or 8 digits');
  const normalized = value.length === 7 ? `${value}${ean8Check(value)}` : value;
  if (Number(normalized[7]) !== ean8Check(normalized)) {
    throw new Error('Invalid EAN8 check digit');
  }
  const binary =
    `101${encodeEanDigits(normalized.slice(0, 4), 'LLLL')}` +
    `01010${encodeEanDigits(normalized.slice(4), 'RRRR')}101`;
  return { binary, format: 'EAN8', text: normalized };
}

function encodeEAN52(value: string, format: 'EAN5' | 'EAN2'): UPBarcodeEncoding {
  const expected = format === 'EAN5' ? 5 : 2;
  if (!new RegExp(`^\\d{${expected}}$`).test(value)) {
    throw new Error(`${format} must be ${expected} digits`);
  }
  const structure = format === 'EAN5'
    ? EAN5_STRUCTURE[
        Array.from(value, Number).reduce(
          (sum, digit, index) => sum + digit * (index % 2 === 0 ? 3 : 9),
          0,
        ) % 10
      ]
    : EAN2_STRUCTURE[Number(value) % 4];
  return {
    binary: `1011${encodeEanDigits(value, structure, '01')}`,
    format,
    text: value,
  };
}

function encodeUPCA(value: string, format: 'UPC' | 'UPCA' = 'UPCA'): UPBarcodeEncoding {
  if (!/^\d{11,12}$/.test(value)) throw new Error('UPC-A must be 11 or 12 digits');
  const normalized = value.length === 11 ? `${value}${upcaCheck(value)}` : value;
  if (Number(normalized[11]) !== upcaCheck(normalized)) {
    throw new Error('Invalid UPC-A check digit');
  }
  const binary =
    `101${encodeEanDigits(normalized.slice(0, 6), 'LLLLLL')}` +
    `01010${encodeEanDigits(normalized.slice(6), 'RRRRRR')}101`;
  return { binary, format, text: normalized };
}

const UPCE_EXPANSIONS = [
  'XX00000XXX', 'XX10000XXX', 'XX20000XXX', 'XXX00000XX', 'XXXX00000X',
  'XXXXX00005', 'XXXXX00006', 'XXXXX00007', 'XXXXX00008', 'XXXXX00009',
] as const;
const UPCE_PARITIES = [
  ['EEEOOO', 'OOOEEE'], ['EEOEOO', 'OOEOEE'], ['EEOOEO', 'OOEEOE'],
  ['EEOOOE', 'OOEEEO'], ['EOEEOO', 'OEOOEE'], ['EOOEEO', 'OEEOOE'],
  ['EOOOEE', 'OEEEOO'], ['EOEOEO', 'OEOEOE'], ['EOEOOE', 'OEOEEO'],
  ['EOOEOE', 'OEEOEO'],
] as const;

function expandUPCE(middle: string, system: '0' | '1') {
  const expansion = UPCE_EXPANSIONS[Number(middle[5])];
  let digitIndex = 0;
  const body = Array.from(expansion, (character) =>
    character === 'X' ? middle[digitIndex++] : character,
  ).join('');
  const prefix = `${system}${body}`;
  return `${prefix}${upcaCheck(prefix)}`;
}

function encodeUPCE(value: string): UPBarcodeEncoding {
  let middle: string;
  let system: '0' | '1';
  let upca: string;
  if (/^\d{6}$/.test(value)) {
    middle = value;
    system = '0';
    upca = expandUPCE(middle, system);
  } else if (/^[01]\d{7}$/.test(value)) {
    system = value[0] as '0' | '1';
    middle = value.slice(1, 7);
    upca = expandUPCE(middle, system);
    if (upca[11] !== value[7]) throw new Error('Invalid UPC-E check digit');
  } else {
    throw new Error('UPC-E must be 6 or 8 digits');
  }
  const check = Number(upca[11]);
  const structure = UPCE_PARITIES[check][Number(system)];
  return {
    binary: `101${encodeEanDigits(middle, structure)}010101`,
    format: 'UPCE',
    text: `${system}${middle}${check}`,
  };
}

const ITF_PATTERNS = ['00110', '10001', '01001', '11000', '00101', '10100', '01100', '00011', '10010', '01010'] as const;

function itf14Check(value: string) {
  const sum = Array.from(value.slice(0, 13), Number)
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10;
}

function encodeITF(value: string, fixed14: boolean): UPBarcodeEncoding {
  let normalized = value;
  if (fixed14) {
    if (!/^\d{13,14}$/.test(value)) throw new Error('ITF14 must be 13 or 14 digits');
    normalized = value.length === 13 ? `${value}${itf14Check(value)}` : value;
    if (Number(normalized[13]) !== itf14Check(normalized)) {
      throw new Error('Invalid ITF14 check digit');
    }
  } else if (!/^(?:\d{2})+$/.test(value)) {
    throw new Error('ITF must contain an even number of digits');
  }

  let binary = '1010';
  for (let index = 0; index < normalized.length; index += 2) {
    const first = ITF_PATTERNS[Number(normalized[index])];
    const second = ITF_PATTERNS[Number(normalized[index + 1])];
    for (let unit = 0; unit < 5; unit += 1) {
      binary += first[unit] === '1' ? '111' : '1';
      binary += second[unit] === '1' ? '000' : '0';
    }
  }
  binary += '11101';
  return { binary, format: fixed14 ? 'ITF14' : 'ITF', text: normalized };
}

function msiMod10(value: string) {
  const sum = Array.from(value, Number).reduce((total, digit, index) => {
    if ((index + value.length) % 2 === 0) return total + digit;
    const doubled = digit * 2;
    return total + (doubled % 10) + Math.floor(doubled / 10);
  }, 0);
  return (10 - (sum % 10)) % 10;
}

function msiMod11(value: string) {
  const weights = [2, 3, 4, 5, 6, 7];
  const sum = Array.from(value, Number).reduce(
    (total, _digit, index) =>
      total + Number(value[value.length - 1 - index]) * weights[index % weights.length],
    0,
  );
  return (11 - (sum % 11)) % 11;
}

function encodeMSI(
  value: string,
  format: 'MSI' | 'MSI10' | 'MSI11' | 'MSI1010' | 'MSI1110',
): UPBarcodeEncoding {
  if (!/^\d+$/.test(value)) throw new Error(`${format} must contain only digits`);
  let normalized = value;
  if (format === 'MSI10') normalized += msiMod10(normalized);
  else if (format === 'MSI11') normalized += msiMod11(normalized);
  else if (format === 'MSI1010') {
    normalized += msiMod10(normalized);
    normalized += msiMod10(normalized);
  } else if (format === 'MSI1110') {
    normalized += msiMod11(normalized);
    normalized += msiMod10(normalized);
  }

  const payload = Array.from(normalized, (digit) =>
    Array.from(Number(digit).toString(2).padStart(4, '0'), (bit) =>
      bit === '0' ? '100' : '110',
    ).join(''),
  ).join('');
  return { binary: `110${payload}1001`, format, text: normalized };
}

function encodePharmacode(value: string): UPBarcodeEncoding {
  if (!/^\d+$/.test(value) || Number(value) < 3 || Number(value) > 131070) {
    throw new Error('pharmacode must be between 3 and 131070');
  }
  let number = Number(value);
  let binary = '';
  while (number !== 0) {
    if (number % 2 === 0) {
      binary = `11100${binary}`;
      number = (number - 2) / 2;
    } else {
      binary = `100${binary}`;
      number = (number - 1) / 2;
    }
  }
  return { binary: binary.slice(0, -2), format: 'pharmacode', text: value };
}

const CODABAR_PATTERNS: Record<string, string> = {
  '0': '101010011', '1': '101011001', '2': '101001011', '3': '110010101',
  '4': '101101001', '5': '110101001', '6': '100101011', '7': '100101101',
  '8': '100110101', '9': '110100101', '-': '101001101', '$': '101100101',
  ':': '1101011011', '/': '1101101011', '.': '1101101101', '+': '1011011011',
  A: '1011001001', B: '1001001011', C: '1010010011', D: '1010011001',
};

function encodeCodabar(value: string): UPBarcodeEncoding {
  const upper = value.toUpperCase();
  const normalized = /^[0-9\-$:.+/]+$/.test(upper) ? `A${upper}A` : upper;
  if (!/^[A-D][0-9\-$:.+/]+[A-D]$/.test(normalized)) {
    throw new Error('codabar requires A-D start/end characters and a valid payload');
  }
  return {
    binary: Array.from(normalized, (character) => CODABAR_PATTERNS[character]).join('0'),
    format: 'codabar',
    text: normalized.slice(1, -1),
  };
}
