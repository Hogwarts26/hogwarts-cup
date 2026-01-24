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
      <body>{children}</body>
    </html>
  )
}
