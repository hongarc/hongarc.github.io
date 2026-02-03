/**
 * QR Type Registry with Strategy Pattern
 *
 * To add a new QR type:
 * 1. Create a new file in ./strategies/
 * 2. Implement QRTypeStrategy interface
 * 3. Import and register here (order matters - first match wins)
 */

import { qrTypeRegistry } from './registry';
import { emailStrategy } from './strategies/email';
import { eventStrategy } from './strategies/event';
import { geoStrategy } from './strategies/geo';
import { phoneStrategy } from './strategies/phone';
import { smsStrategy } from './strategies/sms';
import { textStrategy } from './strategies/text';
import { urlStrategy } from './strategies/url';
import { vcardStrategy } from './strategies/vcard';
import { vietqrStrategy } from './strategies/vietqr';
import { wifiStrategy } from './strategies/wifi';

export * from './types';
export * from './registry';
export { VIETNAM_BANKS } from './strategies/vietqr';

// Register strategies in order of specificity
// More specific patterns first, generic patterns last
qrTypeRegistry.register(wifiStrategy);
qrTypeRegistry.register(vcardStrategy);
qrTypeRegistry.register(eventStrategy);
qrTypeRegistry.register(vietqrStrategy);
qrTypeRegistry.register(emailStrategy);
qrTypeRegistry.register(phoneStrategy);
qrTypeRegistry.register(smsStrategy);
qrTypeRegistry.register(geoStrategy);
qrTypeRegistry.register(urlStrategy);
qrTypeRegistry.register(textStrategy); // Fallback - always last
