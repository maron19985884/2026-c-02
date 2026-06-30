import type { AppProps } from "next/app";
import { CartProvider } from "../context/CartContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <div style={{ fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
        <Component {...pageProps} />
      </div>
    </CartProvider>
  );
}
