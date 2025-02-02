import { fetchData } from '@/app/services/fetchData';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const WithAuthComponent = (props: P) => {
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          await fetchData('GET', '/isLoggedIn');
        } catch (error) {
          console.error(error);
          router.replace('/u/login');
        }
      };

      checkAuth();
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `WithAuth(${
    WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'
  })`;

  return WithAuthComponent;
};

export default withAuth;
