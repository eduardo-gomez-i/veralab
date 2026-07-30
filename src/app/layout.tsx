import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/index.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Pedidos",
  description: "Gestión de pedidos de prótesis",
  manifest: "/manifest.webmanifest",
  applicationName: "VeraLAB",
  appleWebApp: {
    capable: true,
    title: "VeraLAB",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The app runs inside a locked-down browser shell; pinch-zoom would only
  // let users drag the fixed header / tab bar out of place.
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <OrderProvider>
            {children}
            <Toaster />
          </OrderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
