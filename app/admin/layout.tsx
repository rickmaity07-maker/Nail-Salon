import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  style: ['normal', 'italic'],
  variable: '--font-playfair'
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-jakarta'
});

export const metadata: Metadata = {
  title: "Aura Nail Studio | Premium Nail Care",
  description: "Editorial nail care and treatments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Added scroll-smooth here for elegant anchor transitions
    <html lang="en" className="scroll-smooth">
      <body className={`${jakarta.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}