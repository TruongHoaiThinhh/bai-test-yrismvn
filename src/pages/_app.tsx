import "@/styles/globals.css";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components";
import nextI18NextConfig from "../../next-i18next.config.js";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <AuthProvider>
      <Header />
      <Component {...pageProps} />
    </AuthProvider>
  );
};

export default appWithTranslation(App, nextI18NextConfig);