import type { ParsedQRBase, QRTypeStrategy } from '../types';

interface ParsedGeo extends ParsedQRBase {
  type: 'geo';
  latitude: number;
  longitude: number;
  query: string | null;
}

export const geoStrategy: QRTypeStrategy<ParsedGeo> = {
  type: 'geo',
  label: 'Location',
  badge: { bg: 'bg-ctp-peach/20', text: 'text-ctp-peach' },

  canParse: (content) => content.toLowerCase().startsWith('geo:'),

  parse: (content) => {
    const geoData = content.slice(4);
    const geoParts = geoData.split('?');
    const coords = geoParts[0] ?? '';
    const query = geoParts[1];
    const coordParts = coords.split(',');
    const lat = Number(coordParts[0]);
    const lng = Number(coordParts[1]);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }

    return {
      type: 'geo',
      latitude: lat,
      longitude: lng,
      query: query?.startsWith('q=') ? decodeURIComponent(query.slice(2)) : null,
      raw: content,
    };
  },

  render: (parsed) => {
    const mapsUrl = `https://www.google.com/maps?q=${String(parsed.latitude)},${String(parsed.longitude)}`;

    return {
      rows: [
        { label: 'Latitude', value: String(parsed.latitude), copyable: true },
        { label: 'Longitude', value: String(parsed.longitude), copyable: true },
        ...(parsed.query ? [{ label: 'Place', value: parsed.query }] : []),
      ],
      action: {
        label: 'Open in Google Maps',
        href: mapsUrl,
        external: true,
        color: 'ctp-peach',
      },
    };
  },
};
