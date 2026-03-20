import type { Metadata } from 'next';
import ContactUs from '@/src/page-components/ContactUs';

export const metadata: Metadata = {
  title: 'Contact Us | Lurevi',
  description: 'Contact Lurevi support.',
};

export default function Page() {
  return <ContactUs />;
}

