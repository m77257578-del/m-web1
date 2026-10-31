import { addRating } from '../services/ratings';

export function seedDummyRating() {
  if (typeof window !== 'undefined' && localStorage.getItem('mweb_rating_seeded')) return;
  
  addRating({
    rating: 5,
    comment: 'تجربة ممتازة وتعامل احترافي جداً! المنصة سريعة جداً وسهلة الاستخدام.',
    userName: 'أحمد محمود',
  });

  addRating({
    rating: 5,
    comment: 'أفضل شركة تعاملت معها في تطوير البرمجيات. دقة في المواعيد وجودة عالمية.',
    userName: 'سارة خالد',
  });

  addRating({
    rating: 4,
    comment: 'شغل عالي وخدمة عملاء متجاوبة جداً. شكراً جزيلاً لفريق العمل.',
    userName: 'ياسين علي',
  });
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('mweb_rating_seeded', 'true');
  }
}
seedDummyRating();
