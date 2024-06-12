import { useRouter } from "next/router";
import { useEffect } from "react";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        console.log("ehrekjdsakf");
        try {
          await fetch("/isLoggedIn", { credentials: "include" });
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
