// pages/_app.tsx
import { AppProps } from 'next/app';
import '../styles/globals.css'; // Import your global CSS styles here

function MyApp({ Component, pageProps }: AppProps) {
  // You can add global context providers or layout components here

  return (
    <>
      {/* Common layout elements (e.g., header, footer) */}
      {/* You can place them here or in individual pages */}
      <header>
        <nav>
          {/* Navigation links */}
        </nav>
      </header>

      {/* Render the page component */}
      <Component {...pageProps} />

      {/* Footer */}
      <footer>
        {/* Footer content */}
      </footer>
    </>
  );
}

export default MyApp;
