import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">WORLD Strategy</h1>
          <p className="text-sm text-gray-600">Treasury Dashboard</p>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Component {...pageProps} />
      </main>
      <footer className="bg-white shadow mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-600">
          <p>WORLD Strategy v1.0 | Experimental Treasury Protocol | Not Financial Advice</p>
        </div>
      </footer>
    </div>
  );
}
