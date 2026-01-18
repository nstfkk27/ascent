import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComparisonBar from "@/components/ComparisonBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ComparisonBar />
      <WhatsAppButton phoneNumber="66646799050" />
    </NextIntlClientProvider>
  );
}
