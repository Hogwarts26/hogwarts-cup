"use client";
import Link from 'next/link';

export default function LobbyPage() {
  const menus = [
    { id: 'study', name: 'Great Hall', sub: '학습 기록', img: '/study.gif', href: '/study' },
    { id: 'dragon', name: 'Dragon Cave', sub: '용 키우기', img: '/dragoncave.gif', href: '/dragon' },
    { id: 'ranking', name: 'House Cup', sub: '기숙사 순위', img: '/game.gif', href: '/ranking' },
    { id: 'timer', name: 'Class Timer', sub: '교시제 타이머', img: '/timer.gif', href: '/timer' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[url('https://raw.githubusercontent.com/Hogwarts26/hogwarts-cup/main/bg.png')] bg-cover bg-fixed bg-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" /> {/* 배경 살짝 어둡게 */}
      
      <div className="relative z-10 w-full max-w-6xl">
        <h1 className="text-5xl md:text-7xl font-magic text-center mb-16 text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
          SELECT YOUR PATH
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {menus.map((menu) => (
            <Link key={menu.id} href={menu.href} className="group">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md transition-all duration-500 hover:border-yellow-500/50 hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                {/* GIF 이미지 영역 */}
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <img 
                    src={menu.img} 
                    alt={menu.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                
                {/* 텍스트 영역 */}
                <div className="p-6 text-center bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
                  <h2 className="font-magic text-2xl text-white mb-1">{menu.name}</h2>
                  <p className="text-yellow-500/70 text-sm font-bold tracking-widest">{menu.sub}</p>
                </div>

                {/* 호버 시 나타나는 빛 효과 */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-tr from-yellow-500/10 to-transparent" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
