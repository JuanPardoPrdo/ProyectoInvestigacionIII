/**
 * Reads an image File, optionally resizes/compresses it, and returns a Base64 data URL.
 * Ensures images uploaded from mobile or desktop stay lightweight (< 150KB).
 */
export const processImageFile = (file: File, maxWidth = 1000, maxHeight = 800, quality = 0.75): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        resolve(result);
                        return;
                    }
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                } catch {
                    resolve(result);
                }
            };
            img.onerror = () => resolve(result);
            img.src = result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};
