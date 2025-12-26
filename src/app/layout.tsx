import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ascent - Pattaya Real Estate | Property for Sale & Rent in Thailand",
  description: "Find your dream property in Pattaya, Jomtien & Thailand. Browse condos, houses, land & investment properties. Expert agents, best prices, virtual tours. Start your property search today!",
  metadataBase: new URL('https://estateascent.com'),
  keywords: ['Pattaya property', 'Pattaya real estate', 'Jomtien condo', 'Thailand property for sale', 'Pattaya condo for rent', 'property investment Thailand', 'expat property Pattaya'],
  authors: [{ name: 'Ascent' }],
  openGraph: {
    title: 'Ascent - Pattaya Real Estate',
    description: 'Find your dream property in Pattaya & Thailand. Condos, houses, land & investment properties.',
    url: 'https://estateascent.com',
    siteName: 'Ascent',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ascent - Pattaya Real Estate',
    description: 'Find your dream property in Pattaya & Thailand',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
