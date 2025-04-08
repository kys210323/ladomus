// my_site/app/admin/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

// 1) 파일 업로드 라이브러리로 formidable이나 busboy 같은 걸 쓸 수 있지만,
//    Next.js 13의 app router는 아직 파일 폼 처리가 편리하지 않습니다.
//    간단히 multipart/form-data를 수동 파싱하거나, "no parsing" 후 Node.js 방식으로 처리해야 합니다.

//    여기서는 "이미 서버에 파일이 있다고 가정"하는 간단 예시를 보여드릴게요.
//    실제로는 formdata를 받아서 /public/videos 폴더에 저장하는 코드가 필요합니다.
//
//    (참고: 만약 직접 구현이 복잡하면, "pages router"에 "formidable"을 쓰는 방법이 더 쉬울 수 있습니다.)

export async function POST(req: NextRequest) {
  try {
    // (A) 원래라면 여기서 req.formData() 등의 방식으로 받은 파일을 /public/videos에 저장
    //     예: '/public/videos/video1234.mp4'
    // 지금은 예시로 "이미 /public/videos/video1220.mp4가 올라와 있다고 가정"하겠습니다.

    const uploadedFileName = 'video1220.mp4'; 
    const uploadDir = path.join(process.cwd(), 'public', 'videos');
    const uploadedFilePath = path.join(uploadDir, uploadedFileName);

    // (B) 최적화 후 덮어쓸 건지, 새 파일로 만들 건지 결정
    // 만약 "덮어쓰기"를 원하면, 출력 경로를 똑같이 해주면 됩니다.
    // 여기서는 "덮어쓰기" 예시:
    const outputPath = uploadedFilePath;

    // (C) FFmpeg 명령어 예시 - mpeg4로 인코딩
    //     화질 옵션은 생략(기본)
    const ffmpegCmd = `ffmpeg -y -i "${uploadedFilePath}" -c:v mpeg4 "${outputPath}"`;

    console.log('[UPLOAD API] Running:', ffmpegCmd);

    // (D) 실제 FFmpeg 실행
    await new Promise<void>((resolve, reject) => {
      exec(ffmpegCmd, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg error:', error);
          return reject(error);
        }
        console.log('FFmpeg stdout:', stdout);
        console.log('FFmpeg stderr:', stderr);
        resolve();
      });
    });

    // (E) 작업 끝나면 응답
    return NextResponse.json({
      success: true,
      message: 'File re-encoded and overwritten successfully.',
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
