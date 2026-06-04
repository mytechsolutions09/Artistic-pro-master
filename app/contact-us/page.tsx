import type { Metadata } from 'next';
import ContactUs from '@/src/page-components/ContactUs';

export const metadata: Metadata = {
  title: 'Contact Us | Lurevi',
  description: 'Contact Lurevi support.',
  alternates: { canonical: 'https://lurevi.in/contact-us' },
};

// Statically generated (ISR) so the page is pre-rendered.
export const revalidate = 86400;

export default function Page() {
  return <ContactUs />;
}

