import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guardian Gate Guard',
  description: 'Verify vehicle passes by scanning QR codes or entering plate numbers',
  manifest: '/manifest.json',
  themeColor: '#22c55e',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gate Guard',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function GateGuardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
