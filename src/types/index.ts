export interface Project {
  id: string;
  title: string;       // اسم المشروع البرمجي
  description: string; // مميزات المشروع والتقنيات
  tag: string;         // تصنيف المشروع (متجر، منصة، إلخ)
  image: string;       // رابط الصورة المصغرة للمشروع
  demoUrl: string;     // رابط المعاينة الحية للمشروع
  createdAt?: any;     // تاريخ ووقت إضافة المشروع (Firestore Timestamp أو تاريخ)
}

export interface Order {
  id?: string;
  name: string;        // اسم العميل بالكامل
  phone: string;       // رقم الواتساب الخاص بالعميل
  details: string;     // تفاصيل المشروع المطلوبة
  timestamp?: any;     // وقت إرسال الطلب بدقة (Firestore Timestamp أو تاريخ)
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  features: string[];
  technologies: string[];
  badge: string;
}
