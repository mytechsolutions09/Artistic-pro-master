import type { Metadata } from 'next';
import ContactUs from '@/src/page-components/ContactUs';

export const metadata: Metadata = {
  title: 'Contact Us | Lurevi',
  description: 'Contact Lurevi support.',
  alternates: { canonical: 'https://lurevi.in/contact-us' },
};

export default function Page() {
  return <ContactUs />;
}

