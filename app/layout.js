export const metadata = {
  title: 'MUJobSphere',
  description: 'Job Board Application',
}

export default function RootLayout({ children }) {
  return (
    <html >
      <body >{children}</body>
    </html>
  );
}