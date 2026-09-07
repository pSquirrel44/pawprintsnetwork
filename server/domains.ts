const landingDomains = new Set([
  'pawprintsnetwork.com',
  'www.pawprintsnetwork.com',
  'instameow.app',
  'www.instameow.app',
  'instawoof.app',
  'www.instawoof.app',
]);

export function isLandingDomain(hostname: string): boolean {
  return landingDomains.has(hostname.trim().toLowerCase());
}
