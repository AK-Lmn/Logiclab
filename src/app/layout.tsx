import type { Metadata, Viewport } from "next";
import { Instrument_Sans, DM_Mono } from "next/font/google";
import colors from '../../tokens/colors.json';
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://loglab.vercel.app"),
  title: "LogicLab: Python, step by step",
  description: "Write Python, run it in your browser, and explore its execution one line at a time.",
  openGraph: {
    type: "website",
    siteName: "LogicLab",
    title: "LogicLab: Python, step by step",
    description: "See your Python code think. Write Python, run it in your browser, and explore its execution one line at a time.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LogicLab: Python, step by step",
    description: "See your Python code think. Explore Python execution one line at a time.",
  },
};

export const viewport: Viewport = {
  themeColor: colors.primitive.bg.$value,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${dmMono.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
