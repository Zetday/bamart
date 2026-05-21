import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const oldImageUrl = formData.get('oldImageUrl') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // convert file → buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // buat nama file baru
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const filePath = path.join(process.cwd(), 'public', 'items', fileName);

  // simpan file baru
  await writeFile(filePath, buffer);

  /* -------------------------------------------
      HAPUS GAMBAR LAMA (JIKA ADA)
  -------------------------------------------- */

  if (oldImageUrl) {
    // oldImageUrl = "/items/xxxx.png"
    const fileNameFromOld = oldImageUrl.replace('/items/', '');
    const oldPath = path.join(
      process.cwd(),
      'public',
      'items',
      fileNameFromOld
    );

    // cek apakah file benar-benar ada
    if (fs.existsSync(oldPath)) {
      await unlink(oldPath).catch(() => {});
    }
  }

  // return URL untuk disimpan di database
  return NextResponse.json({
    url: `/items/${fileName}`,
  });
}
