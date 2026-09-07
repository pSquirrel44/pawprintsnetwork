import assert from 'node:assert/strict';
import test from 'node:test';
import { isLandingDomain } from '../server/domains';

test('serves the landing page on the network and brand domains', () => {
  assert.equal(isLandingDomain('pawprintsnetwork.com'), true);
  assert.equal(isLandingDomain('WWW.PAWPRINTSNETWORK.COM'), true);
  assert.equal(isLandingDomain('instameow.app'), true);
  assert.equal(isLandingDomain('www.instawoof.app'), true);
});

test('keeps provider and unknown hostnames on the application route', () => {
  assert.equal(isLandingDomain('pawprints-ryn4.onrender.com'), false);
  assert.equal(isLandingDomain('attacker.example'), false);
});
