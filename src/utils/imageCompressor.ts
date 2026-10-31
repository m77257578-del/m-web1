/**
 * Client-side image compression and Firestore payload sanitization utilities.
 * Ensures photos uploaded from mobile phones (which are often 3MB-8MB raw)
 * are compressed to compact JPEG/WebP Data URLs (~60KB-150KB) so they never
 * exceed Cloud Firestore's 1MB per-document limit or localStorage's 5MB limit.
 */

/**
 * Recursively strips `undefined` properties from objects and converts `undefined`
 * array elements to `null` so Firebase `setDoc` never throws:
 * `Unsupported field value: undefined`.
 */
export function sanitizeForFirestore<T>(input: T): T {
  if (input === undefined) {
    return null as unknown as T;
  }
  if (input === null || typeof input !== 'object') {
    return input;
  }
  if (input instanceof Date) {
    return input.toISOString() as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map((item) =>
      item === undefined ? null : sanitizeForFirestore(item)
    ) as unknown as T;
  }
  const output: Record<string, any> = {};
  for (const [key, value] of Object.entries(input as Record<string, any>)) {
    if (value !== undefined) {
      output[key] = sanitizeForFirestore(value);
    }
  }
  return output as T;
}

/**
 * Normalizes any arbitrary ID into a valid Firestore document ID
 * matching `^[a-zA-Z0-9_-]{1,120}$`.
 */
export function toSafeFirestoreId(rawId: string, fallbackPrefix = 'item'): string {
  const cleaned = String(rawId || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
  return cleaned || `${fallbackPrefix}-${Date.now()}`;
}

/**
 * Compresses an image File or raw Data URL in the browser using an offscreen Canvas
 * so mobile camera photos sync smoothly to Cloud Firestore across phones.
 */
export async function compressImageFileToDataUrl(
  file: File,
  maxDimension = 1200,
  quality = 0.76
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Invalid file result'));
        return;
      }
      // If not an image or already very small (< 90KB), return directly
      if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || result.length < 90_000) {
        resolve(result);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width || 800;
          let height = img.naturalHeight || img.height || 600;

          if (width > maxDimension || height > maxDimension) {
            if (width >= height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          let compressed = canvas.toDataURL('image/jpeg', quality);
          // If still large (> 350KB), compress once more at smaller dimension
          if (compressed.length > 350_000) {
            const scale = 0.7;
            canvas.width = Math.max(400, Math.round(width * scale));
            canvas.height = Math.max(300, Math.round(height * scale));
            const ctx2 = canvas.getContext('2d');
            if (ctx2) {
              ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
              compressed = canvas.toDataURL('image/jpeg', 0.68);
            }
          }
          resolve(compressed);
        } catch {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}
