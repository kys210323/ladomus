/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      allowedDevOrigins: [
        'http://15.165.183.80:3000', // 퍼블릭 IP:포트
        // 필요하면 다른 도메인/IP도 추가
      ],
    },
  };
  
  module.exports = nextConfig;
  