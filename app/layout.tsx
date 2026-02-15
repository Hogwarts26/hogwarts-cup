import "./globals.css";
import BgmPlayer from "@/components/BgmPlayer"; // 🔊/🔇 이모지 버전
import LogoutButton from "@/components/LogoutButton";

export const metadata = { title: "Hogwarts Study Cup" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap');
          @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
          body { 
            font-family: 'Cinzel', 'Pretendard', sans-serif;
            background-color: #0f172a; /* 호그와트 분위기 어두운 배경 */
            color: white;
          }
          .font-magic { font-family: 'Cinzel', serif; }
        `}</style>
      </head>
      <body>
        {/* 상단 공통 UI: BGM과 로그아웃 */}
        <nav className="fixed top-6 left-0 w-full px-8 flex justify-between items-center z-[100] pointer-events-none">
          <div className="pointer-events-auto">
            <BgmPlayer />
          </div>
          <div className="pointer-events-auto">
            <LogoutButton />
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
