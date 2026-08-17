export type UPQrCorrectLevel = 0 | 1 | 2 | 3;

export type UPQrMatrix = {
  modules: boolean[][];
  size: number;
};

export type UPQrEncodeOptions = {
  correctLevel?: UPQrCorrectLevel | number;
};

type QRModule = boolean | null | undefined;

const QRErrorCorrectLevel = [1, 0, 3, 2] as const;
const QRMaskPattern = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7,
} as const;

function getUTF8Bytes(input: string): number[] {
  const bytes: number[] = [];
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return bytes;
}

function normalizeCorrectLevel(level: UPQrCorrectLevel | number | undefined): UPQrCorrectLevel {
  if (level === 0 || level === 1 || level === 2 || level === 3) return level;
  return 3;
}

const QRMath = {
  EXP_TABLE: Array.from({ length: 256 }, () => 0),
  LOG_TABLE: Array.from({ length: 256 }, () => 0),
  glog(number: number) {
    if (number < 1) {
      throw new Error(`glog(${number})`);
    }
    return QRMath.LOG_TABLE[number];
  },
  gexp(number: number) {
    let value = number;
    while (value < 0) value += 255;
    while (value >= 256) value -= 255;
    return QRMath.EXP_TABLE[value];
  },
};

for (let index = 0; index < 8; index += 1) {
  QRMath.EXP_TABLE[index] = 1 << index;
}
for (let index = 8; index < 256; index += 1) {
  QRMath.EXP_TABLE[index] =
    QRMath.EXP_TABLE[index - 4] ^
    QRMath.EXP_TABLE[index - 5] ^
    QRMath.EXP_TABLE[index - 6] ^
    QRMath.EXP_TABLE[index - 8];
}
for (let index = 0; index < 255; index += 1) {
  QRMath.LOG_TABLE[QRMath.EXP_TABLE[index]] = index;
}

class QRPolynomial {
  private readonly coefficients: number[];

  constructor(input: number[], shift: number) {
    let offset = 0;
    while (offset < input.length && input[offset] === 0) offset += 1;
    this.coefficients = Array.from({ length: input.length - offset + shift }, () => 0);
    for (let index = 0; index < input.length - offset; index += 1) {
      this.coefficients[index] = input[index + offset];
    }
  }

  get(index: number) {
    return this.coefficients[index] ?? 0;
  }

  getLength() {
    return this.coefficients.length;
  }

  multiply(other: QRPolynomial) {
    const result = Array.from({ length: this.getLength() + other.getLength() - 1 }, () => 0);
    for (let index = 0; index < this.getLength(); index += 1) {
      for (let otherIndex = 0; otherIndex < other.getLength(); otherIndex += 1) {
        result[index + otherIndex] ^=
          QRMath.gexp(QRMath.glog(this.get(index)) + QRMath.glog(other.get(otherIndex)));
      }
    }
    return new QRPolynomial(result, 0);
  }

  mod(other: QRPolynomial): QRPolynomial {
    const totalLength = this.getLength();
    const otherLength = other.getLength();
    if (totalLength - otherLength < 0) {
      return this;
    }
    const result = Array.from({ length: totalLength }, (_, index) => this.get(index));
    while (result.length >= otherLength) {
      const ratio = QRMath.glog(result[0] ?? 0) - QRMath.glog(other.get(0));
      for (let index = 0; index < other.getLength(); index += 1) {
        result[index] ^= QRMath.gexp(QRMath.glog(other.get(index)) + ratio);
      }
      while (result[0] === 0) result.shift();
    }
    return new QRPolynomial(result, 0);
  }
}

const QRUtil = {
  PATTERN_POSITION_TABLE: [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170],
  ],
  G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | 1,
  G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | 1,
  G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),
  getBCHTypeInfo(data: number) {
    let value = data << 10;
    while (QRUtil.getBCHDigit(value) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
      value ^= QRUtil.G15 << (QRUtil.getBCHDigit(value) - QRUtil.getBCHDigit(QRUtil.G15));
    }
    return ((data << 10) | value) ^ QRUtil.G15_MASK;
  },
  getBCHTypeNumber(data: number) {
    let value = data << 12;
    while (QRUtil.getBCHDigit(value) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
      value ^= QRUtil.G18 << (QRUtil.getBCHDigit(value) - QRUtil.getBCHDigit(QRUtil.G18));
    }
    return (data << 12) | value;
  },
  getBCHDigit(data: number) {
    let digit = 0;
    let value = data;
    while (value !== 0) {
      digit += 1;
      value >>>= 1;
    }
    return digit;
  },
  getPatternPosition(typeNumber: number) {
    return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1] ?? [];
  },
  getMask(maskPattern: number, row: number, col: number) {
    switch (maskPattern) {
      case QRMaskPattern.PATTERN000:
        return (row + col) % 2 === 0;
      case QRMaskPattern.PATTERN001:
        return row % 2 === 0;
      case QRMaskPattern.PATTERN010:
        return col % 3 === 0;
      case QRMaskPattern.PATTERN011:
        return (row + col) % 3 === 0;
      case QRMaskPattern.PATTERN100:
        return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
      case QRMaskPattern.PATTERN101:
        return ((row * col) % 2) + ((row * col) % 3) === 0;
      case QRMaskPattern.PATTERN110:
        return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
      case QRMaskPattern.PATTERN111:
        return (((row * col) % 3) + ((row + col) % 2)) % 2 === 0;
      default:
        throw new Error(`bad maskPattern:${maskPattern}`);
    }
  },
  getErrorCorrectPolynomial(errorCorrectLength: number) {
    let polynomial = new QRPolynomial([1], 0);
    for (let index = 0; index < errorCorrectLength; index += 1) {
      polynomial = polynomial.multiply(new QRPolynomial([1, QRMath.gexp(index)], 0));
    }
    return polynomial;
  },
  getLostPoint(qrCode: QRCodeAlg) {
    const moduleCount = qrCode.getModuleCount();
    let lostPoint = 0;
    let darkCount = 0;
    for (let row = 0; row < moduleCount; row += 1) {
      let sameCount = 0;
      let head = qrCode.modules[row][0];
      for (let col = 0; col < moduleCount; col += 1) {
        const current = qrCode.modules[row][col];
        if (col < moduleCount - 6) {
          if (
            current &&
            !qrCode.modules[row][col + 1] &&
            qrCode.modules[row][col + 2] &&
            qrCode.modules[row][col + 3] &&
            qrCode.modules[row][col + 4] &&
            !qrCode.modules[row][col + 5] &&
            qrCode.modules[row][col + 6]
          ) {
            if (col < moduleCount - 10) {
              if (
                qrCode.modules[row][col + 7] &&
                qrCode.modules[row][col + 8] &&
                qrCode.modules[row][col + 9] &&
                qrCode.modules[row][col + 10]
              ) {
                lostPoint += 40;
              }
            } else if (col > 3) {
              if (
                qrCode.modules[row][col - 1] &&
                qrCode.modules[row][col - 2] &&
                qrCode.modules[row][col - 3] &&
                qrCode.modules[row][col - 4]
              ) {
                lostPoint += 40;
              }
            }
          }
        }
        if (row < moduleCount - 1 && col < moduleCount - 1) {
          let count = 0;
          if (current) count += 1;
          if (qrCode.modules[row + 1][col]) count += 1;
          if (qrCode.modules[row][col + 1]) count += 1;
          if (qrCode.modules[row + 1][col + 1]) count += 1;
          if (count === 0 || count === 4) {
            lostPoint += 3;
          }
        }
        if (Boolean(head) !== Boolean(current)) {
          sameCount += 1;
        } else {
          head = current;
          if (sameCount >= 5) {
            lostPoint += 3 + sameCount - 5;
          }
          sameCount = 1;
        }
        if (current) {
          darkCount += 1;
        }
      }
    }
    for (let col = 0; col < moduleCount; col += 1) {
      let sameCount = 0;
      let head = qrCode.modules[0][col];
      for (let row = 0; row < moduleCount; row += 1) {
        const current = qrCode.modules[row][col];
        if (row < moduleCount - 6) {
          if (
            current &&
            !qrCode.modules[row + 1][col] &&
            qrCode.modules[row + 2][col] &&
            qrCode.modules[row + 3][col] &&
            qrCode.modules[row + 4][col] &&
            !qrCode.modules[row + 5][col] &&
            qrCode.modules[row + 6][col]
          ) {
            if (row < moduleCount - 10) {
              if (
                qrCode.modules[row + 7][col] &&
                qrCode.modules[row + 8][col] &&
                qrCode.modules[row + 9][col] &&
                qrCode.modules[row + 10][col]
              ) {
                lostPoint += 40;
              }
            } else if (row > 3) {
              if (
                qrCode.modules[row - 1][col] &&
                qrCode.modules[row - 2][col] &&
                qrCode.modules[row - 3][col] &&
                qrCode.modules[row - 4][col]
              ) {
                lostPoint += 40;
              }
            }
          }
        }
        if (Boolean(head) !== Boolean(current)) {
          sameCount += 1;
        } else {
          head = current;
          if (sameCount >= 5) {
            lostPoint += 3 + sameCount - 5;
          }
          sameCount = 1;
        }
      }
    }
    const ratio = Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;
    return lostPoint + ratio * 10;
  },
};

const RS_BLOCK_TABLE: number[][] = [
  [1, 26, 19],
  [1, 26, 16],
  [1, 26, 13],
  [1, 26, 9],
  [1, 44, 34],
  [1, 44, 28],
  [1, 44, 22],
  [1, 44, 16],
  [1, 70, 55],
  [1, 70, 44],
  [2, 35, 17],
  [2, 35, 13],
  [1, 100, 80],
  [2, 50, 32],
  [2, 50, 24],
  [4, 25, 9],
  [1, 134, 108],
  [2, 67, 43],
  [2, 33, 15, 2, 34, 16],
  [2, 33, 11, 2, 34, 12],
  [2, 86, 68],
  [4, 43, 27],
  [4, 43, 19],
  [4, 43, 15],
  [2, 98, 78],
  [4, 49, 31],
  [2, 32, 14, 4, 33, 15],
  [4, 39, 13, 1, 40, 14],
  [2, 121, 97],
  [2, 60, 38, 2, 61, 39],
  [4, 40, 18, 2, 41, 19],
  [4, 40, 14, 2, 41, 15],
  [2, 146, 116],
  [3, 58, 36, 2, 59, 37],
  [4, 36, 16, 4, 37, 17],
  [4, 36, 12, 4, 37, 13],
  [2, 86, 68, 2, 87, 69],
  [4, 69, 43, 1, 70, 44],
  [6, 43, 19, 2, 44, 20],
  [6, 43, 15, 2, 44, 16],
  [4, 101, 81],
  [1, 80, 50, 4, 81, 51],
  [4, 50, 22, 4, 51, 23],
  [3, 36, 12, 8, 37, 13],
  [2, 116, 92, 2, 117, 93],
  [6, 58, 36, 2, 59, 37],
  [4, 46, 20, 6, 47, 21],
  [7, 42, 14, 4, 43, 15],
  [4, 133, 107],
  [8, 59, 37, 1, 60, 38],
  [8, 44, 20, 4, 45, 21],
  [12, 33, 11, 4, 34, 12],
  [3, 145, 115, 1, 146, 116],
  [4, 64, 40, 5, 65, 41],
  [11, 36, 16, 5, 37, 17],
  [11, 36, 12, 5, 37, 13],
  [5, 109, 87, 1, 110, 88],
  [5, 65, 41, 5, 66, 42],
  [5, 54, 24, 7, 55, 25],
  [11, 36, 12],
  [5, 122, 98, 1, 123, 99],
  [7, 73, 45, 3, 74, 46],
  [15, 43, 19, 2, 44, 20],
  [3, 45, 15, 13, 46, 16],
  [1, 135, 107, 5, 136, 108],
  [10, 74, 46, 1, 75, 47],
  [1, 50, 22, 15, 51, 23],
  [2, 42, 14, 17, 43, 15],
  [5, 150, 120, 1, 151, 121],
  [9, 69, 43, 4, 70, 44],
  [17, 50, 22, 1, 51, 23],
  [2, 42, 14, 19, 43, 15],
  [3, 141, 113, 4, 142, 114],
  [3, 70, 44, 11, 71, 45],
  [17, 47, 21, 4, 48, 22],
  [9, 39, 13, 16, 40, 14],
  [3, 135, 107, 5, 136, 108],
  [3, 67, 41, 13, 68, 42],
  [15, 54, 24, 5, 55, 25],
  [15, 43, 15, 10, 44, 16],
  [4, 144, 116, 4, 145, 117],
  [17, 68, 42],
  [17, 50, 22, 6, 51, 23],
  [19, 46, 16, 6, 47, 17],
  [2, 139, 111, 7, 140, 112],
  [17, 74, 46],
  [7, 54, 24, 16, 55, 25],
  [34, 37, 13],
  [4, 151, 121, 5, 152, 122],
  [4, 75, 47, 14, 76, 48],
  [11, 54, 24, 14, 55, 25],
  [16, 45, 15, 14, 46, 16],
  [6, 147, 117, 4, 148, 118],
  [6, 73, 45, 14, 74, 46],
  [11, 54, 24, 16, 55, 25],
  [30, 46, 16, 2, 47, 17],
  [8, 132, 106, 4, 133, 107],
  [8, 75, 47, 13, 76, 48],
  [7, 54, 24, 22, 55, 25],
  [22, 45, 15, 13, 46, 16],
  [10, 142, 114, 2, 143, 115],
  [19, 74, 46, 4, 75, 47],
  [28, 50, 22, 6, 51, 23],
  [33, 46, 16, 4, 47, 17],
  [8, 152, 122, 4, 153, 123],
  [22, 73, 45, 3, 74, 46],
  [8, 53, 23, 26, 54, 24],
  [12, 45, 15, 28, 46, 16],
  [3, 147, 117, 10, 148, 118],
  [3, 73, 45, 23, 74, 46],
  [4, 54, 24, 31, 55, 25],
  [11, 45, 15, 31, 46, 16],
  [7, 146, 116, 7, 147, 117],
  [21, 73, 45, 7, 74, 46],
  [1, 53, 23, 37, 54, 24],
  [19, 45, 15, 26, 46, 16],
  [5, 145, 115, 10, 146, 116],
  [19, 75, 47, 10, 76, 48],
  [15, 54, 24, 25, 55, 25],
  [23, 45, 15, 25, 46, 16],
  [13, 145, 115, 3, 146, 116],
  [2, 74, 46, 29, 75, 47],
  [42, 54, 24, 1, 55, 25],
  [23, 45, 15, 28, 46, 16],
  [17, 145, 115],
  [10, 74, 46, 23, 75, 47],
  [10, 54, 24, 35, 55, 25],
  [19, 45, 15, 35, 46, 16],
  [17, 145, 115, 1, 146, 116],
  [14, 74, 46, 21, 75, 47],
  [29, 54, 24, 19, 55, 25],
  [11, 45, 15, 46, 46, 16],
  [13, 145, 115, 6, 146, 116],
  [14, 74, 46, 23, 75, 47],
  [44, 54, 24, 7, 55, 25],
  [59, 46, 16, 1, 47, 17],
  [12, 151, 121, 7, 152, 122],
  [12, 75, 47, 26, 76, 48],
  [39, 54, 24, 14, 55, 25],
  [22, 45, 15, 41, 46, 16],
  [6, 151, 121, 14, 152, 122],
  [6, 75, 47, 34, 76, 48],
  [46, 54, 24, 10, 55, 25],
  [2, 45, 15, 64, 46, 16],
  [17, 152, 122, 4, 153, 123],
  [29, 74, 46, 14, 75, 47],
  [49, 54, 24, 10, 55, 25],
  [24, 45, 15, 46, 46, 16],
  [4, 152, 122, 18, 153, 123],
  [13, 74, 46, 32, 75, 47],
  [48, 54, 24, 14, 55, 25],
  [42, 45, 15, 32, 46, 16],
  [20, 147, 117, 4, 148, 118],
  [40, 75, 47, 7, 76, 48],
  [43, 54, 24, 22, 55, 25],
  [10, 45, 15, 67, 46, 16],
  [19, 148, 118, 6, 149, 119],
  [18, 75, 47, 31, 76, 48],
  [34, 54, 24, 34, 55, 25],
  [20, 45, 15, 61, 46, 16],
];

class QRBitBuffer {
  buffer: number[] = [];
  length = 0;

  get(index: number) {
    const bufferIndex = Math.floor(index / 8);
    return ((this.buffer[bufferIndex] ?? 0) >>> (7 - (index % 8))) & 1;
  }

  put(number: number, length: number) {
    for (let index = 0; index < length; index += 1) {
      this.putBit(((number >>> (length - index - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean) {
    const bufferIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufferIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufferIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length += 1;
  }
}

class QRCodeAlg {
  static PAD0 = 0xec;
  static PAD1 = 0x11;

  typeNumber = -1;
  errorCorrectLevel: UPQrCorrectLevel;
  modules: QRModule[][] = [];
  moduleCount = 0;
  dataCache: number[] = [];
  rsBlock: number[] = [];
  totalDataCount = -1;
  data: string;
  utf8bytes: number[];

  constructor(data: string, errorCorrectLevel: UPQrCorrectLevel) {
    this.errorCorrectLevel = errorCorrectLevel;
    this.data = data;
    this.utf8bytes = getUTF8Bytes(data);
    this.make();
  }

  getModuleCount() {
    return this.moduleCount;
  }

  make() {
    this.getRightType();
    this.dataCache = this.createData();
    this.createQrcode();
  }

  makeImpl(maskPattern: number) {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = Array.from({ length: this.moduleCount }, () =>
      Array.from({ length: this.moduleCount }, () => undefined),
    );
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(true, maskPattern);
    if (this.typeNumber >= 7) {
      this.setupTypeNumber(true);
    }
    this.mapData(this.dataCache, maskPattern);
  }

  setupPositionProbePattern(row: number, col: number) {
    for (let rowOffset = -1; rowOffset <= 7; rowOffset += 1) {
      if (row + rowOffset <= -1 || this.moduleCount <= row + rowOffset) continue;
      for (let colOffset = -1; colOffset <= 7; colOffset += 1) {
        if (col + colOffset <= -1 || this.moduleCount <= col + colOffset) continue;
        this.modules[row + rowOffset][col + colOffset] =
          (0 <= rowOffset && rowOffset <= 6 && (colOffset === 0 || colOffset === 6)) ||
          (0 <= colOffset && colOffset <= 6 && (rowOffset === 0 || rowOffset === 6)) ||
          (2 <= rowOffset && rowOffset <= 4 && 2 <= colOffset && colOffset <= 4);
      }
    }
  }

  createQrcode() {
    let minLostPoint = 0;
    let pattern = 0;
    let bestModules: QRModule[][] = [];
    for (let index = 0; index < 8; index += 1) {
      this.makeImpl(index);
      const lostPoint = QRUtil.getLostPoint(this);
      if (index === 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = index;
        bestModules = this.modules.map((row) => row.slice());
      }
    }
    this.modules = bestModules;
    this.setupTypeInfo(false, pattern);
    if (this.typeNumber >= 7) {
      this.setupTypeNumber(false);
    }
  }

  setupTimingPattern() {
    for (let row = 8; row < this.moduleCount - 8; row += 1) {
      if (this.modules[row][6] != null) continue;
      this.modules[row][6] = row % 2 === 0;
      if (this.modules[6][row] != null) continue;
      this.modules[6][row] = row % 2 === 0;
    }
  }

  setupPositionAdjustPattern() {
    const positions = QRUtil.getPatternPosition(this.typeNumber);
    for (let index = 0; index < positions.length; index += 1) {
      for (let otherIndex = 0; otherIndex < positions.length; otherIndex += 1) {
        const row = positions[index];
        const col = positions[otherIndex];
        if (this.modules[row][col] != null) continue;
        for (let rowOffset = -2; rowOffset <= 2; rowOffset += 1) {
          for (let colOffset = -2; colOffset <= 2; colOffset += 1) {
            this.modules[row + rowOffset][col + colOffset] =
              rowOffset === -2 ||
              rowOffset === 2 ||
              colOffset === -2 ||
              colOffset === 2 ||
              (rowOffset === 0 && colOffset === 0);
          }
        }
      }
    }
  }

  setupTypeNumber(test: boolean) {
    const bits = QRUtil.getBCHTypeNumber(this.typeNumber);
    for (let index = 0; index < 18; index += 1) {
      const mod = !test && ((bits >> index) & 1) === 1;
      this.modules[Math.floor(index / 3)][(index % 3) + this.moduleCount - 8 - 3] = mod;
      this.modules[(index % 3) + this.moduleCount - 8 - 3][Math.floor(index / 3)] = mod;
    }
  }

  setupTypeInfo(test: boolean, maskPattern: number) {
    const data = (QRErrorCorrectLevel[this.errorCorrectLevel] << 3) | maskPattern;
    const bits = QRUtil.getBCHTypeInfo(data);
    for (let index = 0; index < 15; index += 1) {
      const mod = !test && ((bits >> index) & 1) === 1;
      if (index < 6) {
        this.modules[index][8] = mod;
      } else if (index < 8) {
        this.modules[index + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + index][8] = mod;
      }
      if (index < 8) {
        this.modules[8][this.moduleCount - index - 1] = mod;
      } else if (index < 9) {
        this.modules[8][15 - index] = mod;
      } else {
        this.modules[8][15 - index - 1] = mod;
      }
    }
    this.modules[this.moduleCount - 8][8] = !test;
  }

  createData() {
    const buffer = new QRBitBuffer();
    const lengthBits = this.typeNumber > 9 ? 16 : 8;
    buffer.put(4, 4);
    buffer.put(this.utf8bytes.length, lengthBits);
    for (let index = 0; index < this.utf8bytes.length; index += 1) {
      buffer.put(this.utf8bytes[index], 8);
    }
    if (buffer.length + 4 <= this.totalDataCount * 8) {
      buffer.put(0, 4);
    }
    while (buffer.length % 8 !== 0) {
      buffer.putBit(false);
    }
    while (buffer.length < this.totalDataCount * 8) {
      buffer.put(QRCodeAlg.PAD0, 8);
      if (buffer.length >= this.totalDataCount * 8) break;
      buffer.put(QRCodeAlg.PAD1, 8);
    }
    return this.createBytes(buffer);
  }

  createBytes(buffer: QRBitBuffer) {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;
    const length = this.rsBlock.length / 3;
    const rsBlocks: Array<[number, number]> = [];
    for (let index = 0; index < length; index += 1) {
      const count = this.rsBlock[index * 3];
      const totalCount = this.rsBlock[index * 3 + 1];
      const dataCount = this.rsBlock[index * 3 + 2];
      for (let countIndex = 0; countIndex < count; countIndex += 1) {
        rsBlocks.push([dataCount, totalCount]);
      }
    }
    const dcdata: number[][] = Array.from({ length: rsBlocks.length }, () => []);
    const ecdata: number[][] = Array.from({ length: rsBlocks.length }, () => []);
    for (let row = 0; row < rsBlocks.length; row += 1) {
      const dcCount = rsBlocks[row][0];
      const ecCount = rsBlocks[row][1] - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[row] = Array.from({ length: dcCount }, (_, index) => 0xff & (buffer.buffer[index + offset] ?? 0));
      offset += dcCount;
      const rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
      const rawPoly = new QRPolynomial(dcdata[row], rsPoly.getLength() - 1);
      const modPoly = rawPoly.mod(rsPoly);
      ecdata[row] = Array.from({ length: rsPoly.getLength() - 1 }, (_, index) => {
        const modIndex = index + modPoly.getLength() - (rsPoly.getLength() - 1);
        return modIndex >= 0 ? modPoly.get(modIndex) : 0;
      });
    }
    const data = Array.from({ length: this.totalDataCount }, () => 0);
    let dataIndex = 0;
    for (let index = 0; index < maxDcCount; index += 1) {
      for (let row = 0; row < rsBlocks.length; row += 1) {
        if (index < dcdata[row].length) {
          data[dataIndex] = dcdata[row][index];
          dataIndex += 1;
        }
      }
    }
    for (let index = 0; index < maxEcCount; index += 1) {
      for (let row = 0; row < rsBlocks.length; row += 1) {
        if (index < ecdata[row].length) {
          data[dataIndex] = ecdata[row][index];
          dataIndex += 1;
        }
      }
    }
    return data;
  }

  mapData(data: number[], maskPattern: number) {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      let currentCol = col;
      if (currentCol === 6) currentCol -= 1;
      while (true) {
        for (let colOffset = 0; colOffset < 2; colOffset += 1) {
          if (this.modules[row][currentCol - colOffset] == null) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
            }
            if (QRUtil.getMask(maskPattern, row, currentCol - colOffset)) {
              dark = !dark;
            }
            this.modules[row][currentCol - colOffset] = dark;
            bitIndex -= 1;
            if (bitIndex === -1) {
              byteIndex += 1;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  getRightType() {
    for (let typeNumber = 1; typeNumber < 41; typeNumber += 1) {
      const rsBlock = RS_BLOCK_TABLE[(typeNumber - 1) * 4 + this.errorCorrectLevel];
      if (rsBlock === undefined) {
        throw new Error(`bad rs block @ typeNumber:${typeNumber}/errorCorrectLevel:${this.errorCorrectLevel}`);
      }
      const length = rsBlock.length / 3;
      let totalDataCount = 0;
      for (let index = 0; index < length; index += 1) {
        const count = rsBlock[index * 3];
        const dataCount = rsBlock[index * 3 + 2];
        totalDataCount += dataCount * count;
      }
      const lengthBytes = typeNumber > 9 ? 2 : 1;
      if (this.utf8bytes.length + lengthBytes < totalDataCount || typeNumber === 40) {
        this.typeNumber = typeNumber;
        this.rsBlock = rsBlock;
        this.totalDataCount = totalDataCount;
        break;
      }
    }
  }
}

export function encodeQrMatrix(value: string, options: UPQrEncodeOptions = {}): UPQrMatrix {
  const text = String(value);
  if (!text) throw new Error('QR value cannot be empty');
  const level = normalizeCorrectLevel(options.correctLevel);
  const qrCode = new QRCodeAlg(text, level);
  const size = qrCode.getModuleCount();
  const modules = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => Boolean(qrCode.modules[row][col])),
  );
  return { modules, size };
}
