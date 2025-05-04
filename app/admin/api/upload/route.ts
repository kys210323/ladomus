import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    // 1) formData로 모든 'file' 필드 가져오기
    const formData = await req.formData();
    const allFiles = formData.getAll("file") as File[];
    if (!allFiles || allFiles.length === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 업로드 결과 URL 리스트
    const uploadedUrls: string[] = [];

    // 2) /public/uploads 폴더 생성(없으면)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 3) 각 파일 반복 처리
    for (const file of allFiles) {
      const originalName = file.name; // 예: "myphoto.png"
      const ext = path.extname(originalName).toLowerCase();

      // 새 파일 확장자 & 버퍼
      let newExt = ".jpg";
      const buffer = Buffer.from(await file.arrayBuffer());
      let optimizedBuffer: Buffer;

      if (ext === ".png" || ext === ".webp" || ext === ".gif") {
        // 투명 유지: png() 변환
        newExt = ".png";
        optimizedBuffer = await sharp(buffer)
          .resize({
            width: 1280,
            withoutEnlargement: true, // 원본보다 작으면 확대X
          })
          .png({ quality: 80 })
          .toBuffer();
      } else {
        // 그 외 → jpeg 변환
        newExt = ".jpg";
        optimizedBuffer = await sharp(buffer)
          .resize({
            width: 1280,
            withoutEnlargement: true, // 원본보다 작으면 확대X
          })
          .jpeg({ quality: 80 })
          .toBuffer();
      }

      // 최종 파일명
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}${newExt}`;
      const savePath = path.join(uploadDir, fileName);

      fs.writeFileSync(savePath, optimizedBuffer);

      // 접근할 URL
      const fileUrl = "/uploads/" + fileName;
      uploadedUrls.push(fileUrl);
    }

    // 4) 업로드된 이미지 URL 배열 반환
    return NextResponse.json({ urls: uploadedUrls });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
