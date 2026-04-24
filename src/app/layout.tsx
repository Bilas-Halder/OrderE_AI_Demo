import './globals.css';
import { GlobalProvider } from '@/context/GlobalContext';
import { ChatWidget } from '@/components/ChatWidget';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen flex flex-col">
        <GlobalProvider>
          <nav className="p-4 bg-gray-900 border-b border-gray-800 flex gap-6 px-8">
            <Link href="/" className="hover:text-blue-400 font-bold">App</Link>
            <Link href="/foods" className="hover:text-blue-400">Foods</Link>
            <Link href="/buy" className="hover:text-blue-400">Buy</Link>
            <Link href="/orders" className="hover:text-blue-400">Orders</Link>
            <Link href="/dashboard" className="hover:text-blue-400 ml-auto">AI Dashboard</Link>
          </nav>
          <main className="flex-1 p-8">
            {children}
          </main>
          <ChatWidget />
        </GlobalProvider>
      </body>
    </html>
  );
}