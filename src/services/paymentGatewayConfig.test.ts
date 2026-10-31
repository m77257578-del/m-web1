import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PAYMENT_GATEWAY_SETTINGS,
  normalizePaymentGatewaySettings,
  canProceedWithPaymentMode,
  buildKashierCheckoutSession,
} from './paymentGatewayConfig';

test('default payment settings have Manual enabled and Kashier Electronic locked', () => {
  const defaults = normalizePaymentGatewaySettings(undefined);
  assert.equal(defaults.manualPaymentEnabled, true);
  assert.equal(defaults.kashierEnabled, false);
  assert.equal(defaults.kashierMode, 'test');
  assert.equal(defaults.kashierCurrency, 'EGP');
});

test('canProceedWithPaymentMode enforces locked Kashier state until Admin enables it', () => {
  const defaultState = DEFAULT_PAYMENT_GATEWAY_SETTINGS;

  const manualCheck = canProceedWithPaymentMode('manual', defaultState);
  assert.equal(manualCheck.allowed, true);

  const kashierLockedCheck = canProceedWithPaymentMode('kashier', defaultState);
  assert.equal(kashierLockedCheck.allowed, false);
  assert.match(kashierLockedCheck.reasonAr, /كاشير/);

  const kashierUnlockedCheck = canProceedWithPaymentMode('kashier', {
    ...defaultState,
    kashierEnabled: true,
  });
  assert.equal(kashierUnlockedCheck.allowed, true);
});

test('buildKashierCheckoutSession formats amount, merchantId, and checkout URL accurately', () => {
  const session = buildKashierCheckoutSession(
    {
      orderId: 'ORD-9001',
      amount: 1450,
      customerName: 'أحمد محمد',
      customerPhone: '01012345678',
    },
    {
      kashierEnabled: true,
      kashierMerchantId: 'MID-99999-111',
      kashierMode: 'live',
      kashierCurrency: 'EGP',
    }
  );

  assert.equal(session.orderId, 'ORD-9001');
  assert.equal(session.merchantId, 'MID-99999-111');
  assert.equal(session.amountFormatted, '1450.00');
  assert.equal(session.currency, 'EGP');
  assert.equal(session.mode, 'live');
  assert.ok(session.checkoutUrl.startsWith('https://checkout.kashier.io/?'));
  assert.ok(session.checkoutUrl.includes('merchantId=MID-99999-111'));
  assert.ok(session.checkoutUrl.includes('amount=1450.00'));
});
