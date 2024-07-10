import { fetchData } from "@/utils/fetchData";
import { useRouter } from "next/router";
import { useEffect } from "react";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          await fetchData("GET", "/isLoggedIn");
        } catch (err) {
          router.replace("http://locahost:3000/u/login");
        }
      };

      checkAuth();
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
