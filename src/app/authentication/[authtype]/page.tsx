import ClientAuthPage from '@/components/core/authentication/ClientAuthPage';

interface AuthPageProps {
  params: {
    authtype: string;
  };
}

export default function AuthPage({ params }: AuthPageProps) {
  return <ClientAuthPage authtype={params.authtype} />;
}
