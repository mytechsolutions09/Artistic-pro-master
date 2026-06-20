import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const ContactUs = dynamic(() => import('@/src/page-components/ContactUs'));

export const metadata: Metadata = {
  title: 'Contact Us - Customer Support & Inquiries | Lurevi',
  description: 'Get in touch with the Lurevi support team for questions about orders, shipping, custom digital art commissions, or refunds. We are here to help you 24/7.',
  alternates: { canonical: 'https://lurevi.in/contact-us' },
};

// Statically generated (ISR) so the page is pre-rendered.
export const revalidate = 86400;

export default function Page() {
  return <ContactUs />;
}

