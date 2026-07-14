const TARGET_WIDTH = 300;
const TARGET_HEIGHT = 384;

// ครอบตัดกึ่งกลางให้ได้สัดส่วน 300:384 (รูปถ่าย 1 นิ้ว) แล้วย่อขนาดให้พอดี
// ใช้ createImageBitmap แทน new Image() เพราะมันปรับตาม EXIF orientation ให้อัตโนมัติ
export async function resizeToPhotoSize(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);

  const targetRatio = TARGET_WIDTH / TARGET_HEIGHT;
  const srcRatio = bitmap.width / bitmap.height;

  let sx = 0, sy = 0, sw = bitmap.width, sh = bitmap.height;
  if (srcRatio > targetRatio) {
    sw = bitmap.height * targetRatio;
    sx = (bitmap.width - sw) / 2;
  } else {
    sh = bitmap.width / targetRatio;
    sy = (bitmap.height - sh) / 2;
  }

  const canvas = document.createElement('canvas');
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('แปลงรูปไม่สำเร็จ'))), 'image/jpeg', 0.9)
  );

  const name = file.name.replace(/\.\w+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}
