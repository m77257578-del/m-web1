export type PaymentModeType = 'manual' | 'kashier';
export type KashierEnvironmentMode = 'test' | 'live';
export type KashierCurrency = 'EGP' | 'SAR' | 'USD';

export interface PaymentGatewaySettings {
  manualPaymentEnabled: boolean;
  kashierEnabled: boolean;
  kashierMerchantId: string;
  kashierPublicKey: string;
  kashierSecretKey: string;
  kashierMode: KashierEnvironmentMode;
  kashierCurrency: KashierCurrency;
  kashierWebhookUrl: string;
}

export const DEFAULT_PAYMENT_GATEWAY_SETTINGS: PaymentGatewaySettings = {
  manualPaymentEnabled: true,
  kashierEnabled: false,
  kashierMerchantId: 'MID-28491-805',
  kashierPublicKey: 'pk_test_kashier_mweb_gateway',
  kashierSecretKey: '',
  kashierMode: 'test',
  kashierCurrency: 'EGP',
  kashierWebhookUrl: 'https://mweb.dev/api/kashier/webhook',
};

export function normalizePaymentGatewaySettings(
  input?: Partial<PaymentGatewaySettings> | null
): PaymentGatewaySettings {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_PAYMENT_GATEWAY_SETTINGS };
  }

  return {
    manualPaymentEnabled:
      typeof input.manualPaymentEnabled === 'boolean'
        ? input.manualPaymentEnabled
        : DEFAULT_PAYMENT_GATEWAY_SETTINGS.manualPaymentEnabled,
    kashierEnabled:
      typeof input.kashierEnabled === 'boolean'
        ? input.kashierEnabled
        : DEFAULT_PAYMENT_GATEWAY_SETTINGS.kashierEnabled,
    kashierMerchantId:
      typeof input.kashierMerchantId === 'string' && input.kashierMerchantId.trim()
        ? input.kashierMerchantId.trim()
        : DEFAULT_PAYMENT_GATEWAY_SETTINGS.kashierMerchantId,
    kashierPublicKey:
      typeof input.kashierPublicKey === 'string' && input.kashierPublicKey.trim()
        ? input.kashierPublicKey.trim()
        : DEFAULT_PAYMENT_GATEWAY_SETTINGS.kashierPublicKey,
    kashierSecretKey:
      typeof input.kashierSecretKey === 'string'
        ? input.kashierSecretKey.trim()
        : DEFAULT_PAYMENT_GATEWAY_SETTINGS.kashierSecretKey,
    kashierMode:
      input.kashierMode === 'live' || input.kashierMode === 'test'
        ? input.kashierMode
        : DEFAULT_PAYMENT_GATEWAY_SETTINGS.kashierMode,
    kashierCurrency:
      input.kashierCurrency === 'EGP' ||
      input.kashierCurrency === 'SAR' ||
      input.kashierCurrency === 'USD'
        ? input.kashierCurrency
        : DEFAULT_PAYMENT_GATEWAY_SETTINGS.kashierCurrency,
    kashierWebhookUrl:
      typeof input.kashierWebhookUrl === 'string' && input.kashierWebhookUrl.trim()
        ? input.kashierWebhookUrl.trim()
        : DEFAULT_PAYMENT_GATEWAY_SETTINGS.kashierWebhookUrl,
  };
}

export function canProceedWithPaymentMode(
  mode: PaymentModeType,
  settings: Partial<PaymentGatewaySettings>
): { allowed: boolean; reasonAr: string; reasonEn: string } {
  const normalized = normalizePaymentGatewaySettings(settings);

  if (mode === 'manual') {
    if (normalized.manualPaymentEnabled) {
      return {
        allowed: true,
        reasonAr: 'الدفع اليدوي المباشر مفعل ومتاح للتحويل الفوري.',
        reasonEn: 'Direct manual payment is active and available for instant transfer.',
      };
    }
    return {
      allowed: false,
      reasonAr: 'الدفع اليدوي متوقف مؤقتاً من قِبل الإدارة.',
      reasonEn: 'Manual payment is temporarily disabled by administration.',
    };
  }

  // mode === 'kashier'
  if (!normalized.kashierEnabled) {
    return {
      allowed: false,
      reasonAr: 'الدفع الإلكتروني عبر بوابة كاشير (Kashier) مقفل حالياً ويتم تفعيله من لوحة تحكم الأدمن.',
      reasonEn: 'Electronic payment via Kashier Gateway is currently locked and controlled by the Admin Panel.',
    };
  }

  return {
    allowed: true,
    reasonAr: 'بوابة كاشير للدفع الإلكتروني مفعلة وجاهزة للدفع الفوري بالبطاقات والمحافظ.',
    reasonEn: 'Kashier Electronic Payment Gateway is active and ready for instant card & wallet checkout.',
  };
}

export interface KashierCheckoutRequest {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  description?: string;
  currency?: KashierCurrency;
}

export interface KashierCheckoutSession {
  orderId: string;
  merchantId: string;
  amountFormatted: string;
  currency: KashierCurrency;
  mode: KashierEnvironmentMode;
  checkoutUrl: string;
  supportedMethods: string[];
}

export function buildKashierCheckoutSession(
  request: KashierCheckoutRequest,
  settings: Partial<PaymentGatewaySettings>
): KashierCheckoutSession {
  const normalized = normalizePaymentGatewaySettings(settings);
  const safeAmount = Number.isFinite(request.amount) && request.amount > 0 ? request.amount : 100;
  const amountFormatted = safeAmount.toFixed(2);
  const currency = request.currency || normalized.kashierCurrency;
  const cleanOrderId = (request.orderId || `MWEB-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '');

  const params = new URLSearchParams({
    merchantId: normalized.kashierMerchantId,
    orderId: cleanOrderId,
    amount: amountFormatted,
    currency,
    mode: normalized.kashierMode,
    customerName: request.customerName.trim() || 'Client',
    customerPhone: request.customerPhone.trim() || '',
    display: 'ar',
    allowedMethods: 'card,wallet,bank_installments',
  });

  return {
    orderId: cleanOrderId,
    merchantId: normalized.kashierMerchantId,
    amountFormatted,
    currency,
    mode: normalized.kashierMode,
    checkoutUrl: `https://checkout.kashier.io/?${params.toString()}`,
    supportedMethods: ['Visa', 'MasterCard', 'Meeza (ميزة)', 'Vodafone Cash', 'InstaPay / Wallets', 'ValU'],
  };
}
