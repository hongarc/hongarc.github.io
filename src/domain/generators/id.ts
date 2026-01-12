export type IdType = 'uuidv4' | 'uuidv7' | 'cuid' | 'mongodb';

// Pure function: generate secure random bytes as hex
export const randomHex = (length: number): string => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
};

// Generate UUID v4 (random)
export const generateUuidV4 = (): string => {
  return crypto.randomUUID();
};

// Generate UUID v7 (time-based + random)
export const generateUuidV7 = (): string => {
  const now = Date.now();
  const timestamp = now.toString(16).padStart(12, '0');

  // Random bytes for the rest
  const random = randomHex(10);

  // Construct UUID v7
  // Format: tttttttt-tttt-7xxx-yxxx-xxxxxxxxxxxx
  // t = timestamp, 7 = version, y = variant (8, 9, a, or b), x = random
  const uuid = [
    timestamp.slice(0, 8),
    timestamp.slice(8, 12),
    `7${random.slice(0, 3)}`,
    ((Number.parseInt(random.slice(3, 4), 16) & 0x3) | 0x8).toString(16) + random.slice(4, 7),
    random.slice(7, 19).padEnd(12, '0'),
  ].join('-');

  return uuid;
};

// Generate CUID (Collision-resistant Unique Identifier)
export const generateCuid = (): string => {
  const timestamp = Date.now().toString(36);
  const counter = Math.floor(Math.random() * 1_679_616)
    .toString(36)
    .padStart(4, '0');
  const fingerprint = randomHex(4);
  const random = randomHex(8);

  // CUID format: c + timestamp + counter + fingerprint + random
  return `c${timestamp}${counter}${fingerprint.slice(0, 4)}${random.slice(0, 8)}`;
};

// Generate MongoDB ObjectID (24 hex characters)
export const generateMongoId = (): string => {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, '0');
  const machineId = randomHex(3);
  const processId = randomHex(2);
  const counter = randomHex(3);

  return timestamp + machineId + processId + counter;
};

// ID generator based on type
export const generateId = (type: IdType): string => {
  switch (type) {
    case 'uuidv4': {
      return generateUuidV4();
    }
    case 'uuidv7': {
      return generateUuidV7();
    }
    case 'cuid': {
      return generateCuid();
    }
    case 'mongodb': {
      return generateMongoId();
    }
  }
};
