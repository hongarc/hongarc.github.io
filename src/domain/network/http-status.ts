export interface HttpStatus {
  readonly code: number;
  readonly name: string;
  readonly description: string;
}

export const HTTP_STATUSES: readonly HttpStatus[] = [
  {
    code: 100,
    name: 'Continue',
    description: 'The initial part of the request was received and the client should continue.',
  },
  {
    code: 101,
    name: 'Switching Protocols',
    description: 'The server is switching to the protocol requested by the client.',
  },
  {
    code: 102,
    name: 'Processing',
    description: 'The server has accepted the request but has not finished processing it yet.',
  },
  {
    code: 103,
    name: 'Early Hints',
    description:
      'The server sends preliminary headers so the client can start preloading resources.',
  },
  { code: 200, name: 'OK', description: 'The request succeeded.' },
  {
    code: 201,
    name: 'Created',
    description: 'The request succeeded and a new resource was created.',
  },
  {
    code: 202,
    name: 'Accepted',
    description: 'The request was accepted for processing, but processing is not complete.',
  },
  {
    code: 203,
    name: 'Non-Authoritative Information',
    description: 'The response was modified by a transforming proxy from the origin 200 response.',
  },
  {
    code: 204,
    name: 'No Content',
    description: 'The request succeeded and there is no content to send in the response.',
  },
  {
    code: 205,
    name: 'Reset Content',
    description: 'The request succeeded and the client should reset the document view.',
  },
  {
    code: 206,
    name: 'Partial Content',
    description: 'The server is delivering only part of the resource because of a range request.',
  },
  {
    code: 207,
    name: 'Multi-Status',
    description: 'The response body contains separate status codes for multiple operations.',
  },
  {
    code: 208,
    name: 'Already Reported',
    description: 'The members of a binding were already listed in an earlier part of the response.',
  },
  {
    code: 226,
    name: 'IM Used',
    description: 'The server fulfilled the request using instance manipulations on the resource.',
  },
  {
    code: 300,
    name: 'Multiple Choices',
    description: 'The request has more than one possible response and the client must choose one.',
  },
  {
    code: 301,
    name: 'Moved Permanently',
    description: 'The resource has permanently moved to the URL given in the Location header.',
  },
  {
    code: 302,
    name: 'Found',
    description: 'The resource is temporarily available at a different URL.',
  },
  {
    code: 303,
    name: 'See Other',
    description: 'The client should retrieve the response from another URL using a GET request.',
  },
  {
    code: 304,
    name: 'Not Modified',
    description: 'The cached version of the resource is still valid and can be reused.',
  },
  {
    code: 305,
    name: 'Use Proxy',
    description: 'The requested resource must be accessed through the proxy given in the response.',
  },
  {
    code: 307,
    name: 'Temporary Redirect',
    description:
      'The resource is temporarily at another URL and the request method must not change.',
  },
  {
    code: 308,
    name: 'Permanent Redirect',
    description:
      'The resource has permanently moved to another URL and the request method must not change.',
  },
  {
    code: 400,
    name: 'Bad Request',
    description: 'The server cannot process the request because it is malformed or invalid.',
  },
  {
    code: 401,
    name: 'Unauthorized',
    description: 'The request lacks valid authentication credentials for the resource.',
  },
  {
    code: 402,
    name: 'Payment Required',
    description: 'Reserved for future use, sometimes used to signal that payment is needed.',
  },
  {
    code: 403,
    name: 'Forbidden',
    description: 'The server understood the request but refuses to authorize it.',
  },
  {
    code: 404,
    name: 'Not Found',
    description: 'The server cannot find the requested resource.',
  },
  {
    code: 405,
    name: 'Method Not Allowed',
    description: 'The request method is known but is not supported by the target resource.',
  },
  {
    code: 406,
    name: 'Not Acceptable',
    description: 'The server cannot produce a response matching the formats the client accepts.',
  },
  {
    code: 407,
    name: 'Proxy Authentication Required',
    description: 'The client must first authenticate with the proxy.',
  },
  {
    code: 408,
    name: 'Request Timeout',
    description: 'The server timed out waiting for the client to finish sending the request.',
  },
  {
    code: 409,
    name: 'Conflict',
    description: 'The request conflicts with the current state of the target resource.',
  },
  {
    code: 410,
    name: 'Gone',
    description: 'The resource is no longer available and no forwarding address is known.',
  },
  {
    code: 411,
    name: 'Length Required',
    description: 'The server requires the request to include a Content-Length header.',
  },
  {
    code: 412,
    name: 'Precondition Failed',
    description: 'A condition in the request headers evaluated to false on the server.',
  },
  {
    code: 413,
    name: 'Content Too Large',
    description: 'The request body is larger than the server is willing or able to process.',
  },
  {
    code: 414,
    name: 'URI Too Long',
    description: 'The request URI is longer than the server is willing to interpret.',
  },
  {
    code: 415,
    name: 'Unsupported Media Type',
    description: 'The request body is in a format the server does not support.',
  },
  {
    code: 416,
    name: 'Range Not Satisfiable',
    description: 'The byte range in the request cannot be served for the resource.',
  },
  {
    code: 417,
    name: 'Expectation Failed',
    description: 'The server cannot meet the requirements of the Expect request header.',
  },
  {
    code: 418,
    name: "I'm a teapot",
    description: 'The server refuses to brew coffee because it is, permanently, a teapot.',
  },
  {
    code: 421,
    name: 'Misdirected Request',
    description: 'The request was sent to a server that is not able to produce a response.',
  },
  {
    code: 422,
    name: 'Unprocessable Content',
    description:
      'The request is well-formed but contains semantic errors the server cannot process.',
  },
  {
    code: 423,
    name: 'Locked',
    description: 'The resource being accessed is locked.',
  },
  {
    code: 424,
    name: 'Failed Dependency',
    description: 'The request failed because it depended on another request that failed.',
  },
  {
    code: 425,
    name: 'Too Early',
    description: 'The server is unwilling to risk processing a request that might be replayed.',
  },
  {
    code: 426,
    name: 'Upgrade Required',
    description: 'The client must switch to a different protocol to continue the request.',
  },
  {
    code: 428,
    name: 'Precondition Required',
    description: 'The server requires the request to be conditional.',
  },
  {
    code: 429,
    name: 'Too Many Requests',
    description: 'The client exceeded the rate limit by sending too many requests in a given time.',
  },
  {
    code: 431,
    name: 'Request Header Fields Too Large',
    description: 'The server refuses the request because its header fields are too large.',
  },
  {
    code: 451,
    name: 'Unavailable For Legal Reasons',
    description: 'The resource cannot be provided because of a legal demand.',
  },
  {
    code: 500,
    name: 'Internal Server Error',
    description:
      'The server encountered an unexpected condition that prevented it from responding.',
  },
  {
    code: 501,
    name: 'Not Implemented',
    description: 'The server does not support the functionality required to fulfil the request.',
  },
  {
    code: 502,
    name: 'Bad Gateway',
    description: 'The server acting as a gateway received an invalid response from upstream.',
  },
  {
    code: 503,
    name: 'Service Unavailable',
    description:
      'The server is temporarily unable to handle the request, for example when overloaded.',
  },
  {
    code: 504,
    name: 'Gateway Timeout',
    description: 'The server acting as a gateway did not get a timely response from upstream.',
  },
  {
    code: 505,
    name: 'HTTP Version Not Supported',
    description: 'The server does not support the HTTP version used in the request.',
  },
  {
    code: 506,
    name: 'Variant Also Negotiates',
    description: 'The server has a configuration error in transparent content negotiation.',
  },
  {
    code: 507,
    name: 'Insufficient Storage',
    description: 'The server cannot store the representation needed to complete the request.',
  },
  {
    code: 508,
    name: 'Loop Detected',
    description: 'The server terminated the request because it detected an infinite loop.',
  },
  {
    code: 510,
    name: 'Not Extended',
    description: 'The request needs further extensions for the server to fulfil it.',
  },
  {
    code: 511,
    name: 'Network Authentication Required',
    description: 'The client must authenticate to gain network access.',
  },
];

const CODE_PATTERN = /^\d{3}$/;
const CLASS_PATTERN = /^(\d)(?:xx)?$/i;

export const lookupStatus = (query: string): readonly HttpStatus[] => {
  const trimmed = query.trim();

  if (trimmed === '') {
    return HTTP_STATUSES;
  }

  if (CODE_PATTERN.test(trimmed)) {
    const code = Number(trimmed);
    return HTTP_STATUSES.filter((status) => status.code === code);
  }

  const classMatch = CLASS_PATTERN.exec(trimmed);
  if (classMatch) {
    const hundreds = Number(classMatch[1]);
    return HTTP_STATUSES.filter((status) => Math.floor(status.code / 100) === hundreds);
  }

  const needle = trimmed.toLowerCase();
  return HTTP_STATUSES.filter(
    (status) =>
      status.name.toLowerCase().includes(needle) ||
      status.description.toLowerCase().includes(needle)
  );
};

export const formatStatusLine = (status: HttpStatus): string =>
  `${String(status.code)} ${status.name} — ${status.description}`;
