// app/layout.tsx
export const metadata = {
  title: "FemAI Advisor",
  description: "Wellness & Finance Dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
