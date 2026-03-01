import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import PrivacyNotice from "@/components/PrivacyNotice";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Kodchasan } from 'next/font/google';

const kodchasan = Kodchasan({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
})

export const metadata = {
  title: "Meet Me in the Middle - Find Perfect Meeting Spots",
  description: "Calculate the optimal midpoint between two locations and discover nearby venues with fair travel time for both.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8bc34a" />

        {/* iOS PWA support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MeetMiddle" />
        <link rel="apple-touch-icon" href="/icon-192.webp" />
      </head>
      <body className={kodchasan.className}>
        <GoogleAnalytics />
        {children}
        <PrivacyNotice />
        <Footer />
      </body>
    </html>
  );
}