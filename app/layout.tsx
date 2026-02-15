import './globals.css' // 이 줄이 있어야 디자인이 입혀집니다!

export const metadata = {
  title: 'Hogwarts House Cup',
  description: 'Magic Study Record',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50">{children}</body>
    </html>
  )
}
