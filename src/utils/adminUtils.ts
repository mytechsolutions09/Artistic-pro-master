// Admin utility functions
export const ADMIN_EMAILS = [
  'arpitkanotra@ymail.com'
];

export const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const getAdminEmails = (): string[] => {
  return ADMIN_EMAILS;
};
