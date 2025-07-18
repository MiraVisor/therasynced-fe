// Force dynamic rendering for all authentication pages
export const dynamic = 'force-dynamic';

export default function AuthenticationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
