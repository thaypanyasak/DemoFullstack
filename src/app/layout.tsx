import type { Metadata } from "next";
import { Noto_Sans_Lao } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const notoSansLao = Noto_Sans_Lao({
  subsets: ["lao"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ເວັບສັ່ງອາຫານ | ຮ້ານອາຫານ ແສນສະບາຍ",
  description: "ສະແກນ QR Code ເພື່ອສັ່ງອາຫານໄດ້ທັນທີ ໂດຍບໍ່ຕ້ອງລໍຖ້າພະນັກງານ",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="lo"
      className={cn("h-full antialiased", notoSansLao.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
