import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import PrivacyNotice from "@/components/PrivacyNotice";
import GoogleAnalytics from "@/components/GoogleAnalytics";



export const metadata = {
  title: "Meet Me in the Middle - Find Perfect Meeting Spots",
  description: "Calculate the optimal midpoint between two locations and discover nearby venues with fair travel time for both.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <GoogleAnalytics />
        {children}
        <PrivacyNotice />
        <Footer />
      </body>
    </html>
  );
}