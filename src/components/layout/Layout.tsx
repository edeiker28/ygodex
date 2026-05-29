import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg dark:bg-bg text-text-main font-body">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
