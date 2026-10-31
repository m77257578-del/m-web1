import {
  syncCatalogDocToFirestore,
  deleteCatalogDocFromFirestore,
  subscribeToCatalogCollection,
} from './firebase';
import { syncSectionToDataJson } from './dataJsonService';

export interface PaymentMethodItem {
  id: string;
  categoryId: 'instapay-wallets' | 'bank-transfers' | 'cards-global';
  categoryTitleAr: string;
  categoryTitleEn: string;
  nameAr: string;
  nameEn: string;
  detailsAr: string;
  detailsEn: string;
  copyVal: string;
  noteAr: string;
  noteEn: string;
  enabled: boolean;
}

export const DEFAULT_PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: 'instapay',
    categoryId: 'instapay-wallets',
    categoryTitleAr: 'انستا باي والمحافظ الإلكترونية (InstaPay & E-Wallets)',
    categoryTitleEn: 'InstaPay & E-Wallets',
    nameAr: 'InstaPay (انستا باي)',
    nameEn: 'InstaPay',
    detailsAr: 'IPA: webrex@instapay / رقم الجوال: 01000000000',
    detailsEn: 'IPA: webrex@instapay / Mobile: 01000000000',
    copyVal: 'webrex@instapay',
    noteAr: 'تحويل لحظي متاح 24/7 من أي تطبيق بنكي مصري',
    noteEn: 'Instant 24/7 transfer from any Egyptian bank app',
    enabled: true,
  },
  {
    id: 'vodafone-cash',
    categoryId: 'instapay-wallets',
    categoryTitleAr: 'انستا باي والمحافظ الإلكترونية (InstaPay & E-Wallets)',
    categoryTitleEn: 'InstaPay & E-Wallets',
    nameAr: 'فودافون كاش / المحافظ الرقمية',
    nameEn: 'Vodafone Cash & Digital Wallets',
    detailsAr: 'رقم المحفظة: 01000000000',
    detailsEn: 'Wallet Number: 01000000000',
    copyVal: '01000000000',
    noteAr: 'أكواد شحن مباشر أو تحويل محفظة إلى محفظة',
    noteEn: 'Direct mobile wallet transfer',
    enabled: true,
  },
  {
    id: 'stc-pay',
    categoryId: 'instapay-wallets',
    categoryTitleAr: 'انستا باي والمحافظ الإلكترونية (InstaPay & E-Wallets)',
    categoryTitleEn: 'InstaPay & E-Wallets',
    nameAr: 'STC Pay / Urpay (السعودية)',
    nameEn: 'STC Pay / Urpay (KSA)',
    detailsAr: 'رقم الجوال المعتمد: 0500000000',
    detailsEn: 'Authorized Mobile: 0500000000',
    copyVal: '0500000000',
    noteAr: 'تحويل فوري مالي داخل المملكة العربية السعودية',
    noteEn: 'Instant transfer inside Kingdom of Saudi Arabia',
    enabled: true,
  },
  {
    id: 'alrajhi',
    categoryId: 'bank-transfers',
    categoryTitleAr: 'التحويلات البنكية المباشرة (Bank Wire / IBAN)',
    categoryTitleEn: 'Direct Bank Wire Transfers (IBAN)',
    nameAr: 'مصرف الراجحي (السعودية)',
    nameEn: 'Al Rajhi Bank (KSA)',
    detailsAr: 'IBAN: SA0080000000000000000000',
    detailsEn: 'IBAN: SA0080000000000000000000',
    copyVal: 'SA0080000000000000000000',
    noteAr: 'الاسم: شركة إم ويب للحلول البرمجية',
    noteEn: 'Account Name: M Web Software Solutions Company',
    enabled: true,
  },
  {
    id: 'nbe',
    categoryId: 'bank-transfers',
    categoryTitleAr: 'التحويلات البنكية المباشرة (Bank Wire / IBAN)',
    categoryTitleEn: 'Direct Bank Wire Transfers (IBAN)',
    nameAr: 'البنك الأهلي المصري (NBE)',
    nameEn: 'National Bank of Egypt (NBE)',
    detailsAr: 'IBAN: EG00000000000000000000000000',
    detailsEn: 'IBAN: EG00000000000000000000000000',
    copyVal: 'EG00000000000000000000000000',
    noteAr: 'حساب رسمي معتمد بالجنيه المصري والدولار',
    noteEn: 'Official verified account in EGP & USD',
    enabled: true,
  },
  {
    id: 'dib',
    categoryId: 'bank-transfers',
    categoryTitleAr: 'التحويلات البنكية المباشرة (Bank Wire / IBAN)',
    categoryTitleEn: 'Direct Bank Wire Transfers (IBAN)',
    nameAr: 'بنك دبي الإسلامي (الإمارات)',
    nameEn: 'Dubai Islamic Bank (UAE)',
    detailsAr: 'IBAN: AE000000000000000000000',
    detailsEn: 'IBAN: AE000000000000000000000',
    copyVal: 'AE000000000000000000000',
    noteAr: 'للعملاء والشركات في دولة الإمارات والخليج',
    noteEn: 'For clients and companies in UAE & Gulf region',
    enabled: true,
  },
  {
    id: 'visa-mastercard',
    categoryId: 'cards-global',
    categoryTitleAr: 'البطاقات الائتمانية والدفع الدولي (Visa / MasterCard / PayPal)',
    categoryTitleEn: 'Credit Cards & International Payment (Visa / MasterCard / PayPal)',
    nameAr: 'فيزا وماستركارد ومدى (Visa / MasterCard / Mada)',
    nameEn: 'Visa, MasterCard & Mada',
    detailsAr: 'بوابة دفع إلكترونية آمنة ومباشرة',
    detailsEn: 'Secure online payment gateway',
    copyVal: 'https://mweb.dev/pay',
    noteAr: 'دعم جميع العملات المحلية والدولية تلقائياً',
    noteEn: 'Automatic support for all international currencies',
    enabled: true,
  },
  {
    id: 'paypal',
    categoryId: 'cards-global',
    categoryTitleAr: 'البطاقات الائتمانية والدفع الدولي (Visa / MasterCard / PayPal)',
    categoryTitleEn: 'Credit Cards & International Payment (Visa / MasterCard / PayPal)',
    nameAr: 'بايبال (PayPal)',
    nameEn: 'PayPal',
    detailsAr: 'الحساب: pay@mweb.dev',
    detailsEn: 'Account: pay@mweb.dev',
    copyVal: 'pay@mweb.dev',
    noteAr: 'مثالي للعملاء من أوروبا، أمريكا وكافة دول العالم',
    noteEn: 'Ideal for international payments worldwide',
    enabled: true,
  },
  {
    id: 'tabby-tamara',
    categoryId: 'cards-global',
    categoryTitleAr: 'البطاقات الائتمانية والدفع الدولي (Visa / MasterCard / PayPal)',
    categoryTitleEn: 'Credit Cards & International Payment (Visa / MasterCard / PayPal)',
    nameAr: 'الدفع الميسر والتقسيط (50% / 50%)',
    nameEn: 'Flexible Milestones (50% / 50%)',
    detailsAr: 'نظام الدفع على دفعتين: 50% عند البدء و 50% عند التسليم',
    detailsEn: 'Two milestone payments: 50% deposit and 50% upon delivery',
    copyVal: '50/50 Payment Plan',
    noteAr: 'ضمان كامل لمعاينة واختبار كود مشروعك قبل السداد النهائي',
    noteEn: 'Full inspection guarantee before final settlement',
    enabled: true,
  },
];

const STORAGE_KEY = 'mweb_payment_methods';
const EVENT_NAME = 'mweb_payment_methods_changed';
const COLLECTION_NAME = 'payment_methods';

subscribeToCatalogCollection<PaymentMethodItem>(COLLECTION_NAME, (cloudMethods) => {
  if (cloudMethods && cloudMethods.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudMethods));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: cloudMethods }));
    } catch (e) {
      console.warn('Could not sync cloud payment methods locally:', e);
    }
  }
});

export function getPaymentMethods(): PaymentMethodItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse payment methods:', e);
  }
  return DEFAULT_PAYMENT_METHODS;
}

export function savePaymentMethods(methods: PaymentMethodItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: methods }));
    methods.forEach((m) => {
      syncCatalogDocToFirestore(COLLECTION_NAME, m.id, m).catch(() => {});
    });
    syncSectionToDataJson('paymentMethods', methods).catch(() => {});
  } catch (e) {
    console.error('Failed to save payment methods:', e);
  }
}

export function addPaymentMethod(item: Omit<PaymentMethodItem, 'id'>): PaymentMethodItem {
  const list = getPaymentMethods();
  const newItem: PaymentMethodItem = {
    ...item,
    id: `pm-${Date.now()}`,
  };
  list.push(newItem);
  savePaymentMethods(list);
  return newItem;
}

export function updatePaymentMethod(id: string, updates: Partial<PaymentMethodItem>): void {
  const list = getPaymentMethods();
  const index = list.findIndex((p) => p.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...updates };
    savePaymentMethods(list);
  }
}

export function deletePaymentMethod(id: string): void {
  const list = getPaymentMethods().filter((p) => p.id !== id);
  savePaymentMethods(list);
  deleteCatalogDocFromFirestore(COLLECTION_NAME, id).catch(() => {});
}

export function resetPaymentMethods(): PaymentMethodItem[] {
  try {
    savePaymentMethods(DEFAULT_PAYMENT_METHODS);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_PAYMENT_METHODS;
}
