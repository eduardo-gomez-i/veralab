import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/index.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Pedidos",
  description: "Gestión de pedidos de prótesis",
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
