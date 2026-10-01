/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BookPresentation } from './components/BookPresentation';
import { WhyThisBook } from './components/WhyThisBook';
import { BookPreview } from './components/BookPreview';
import { TargetAudience } from './components/TargetAudience';
import { OrderSection } from './components/OrderSection';
import { FAQ } from './components/FAQ';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === '/admin' || p.startsWith('/admin/') || h === '#admin' || h === '#/admin') {
        return '/admin';
      }
    }
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === '/admin' || p.startsWith('/admin/') || h === '#admin' || h === '#/admin') {
        setCurrentPath('/admin');
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on /admin route, display the Hidden Admin Dashboard
  if (currentPath === '/admin') {
    return <AdminDashboard onBackToSite={() => navigateTo('/')} />;
  }

  const scrollToOrder = () => {
    const el = document.getElementById('order-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToDetails = () => {
    const el = document.getElementById('content');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EE] text-[#2C2117] font-sans-tn selection:bg-[#7C2529]/20 selection:text-[#581619]">
      {/* Navigation bar following strict 3-zone contract */}
      <Navbar onOrderClick={scrollToOrder} />

      <main className="flex-grow">
        {/* 1. Hero Section */}
        <Hero 
          onOrderClick={scrollToOrder} 
          onExploreClick={scrollToDetails} 
        />

        {/* 2. Book Presentation ("شنوة تلقى في الكتاب؟") */}
        <BookPresentation />

        {/* 3. Why This Book? ("علاش الكتاب هذا؟") */}
        <WhyThisBook />

        {/* 4. Book Preview ("شوف الكتاب من الداخل") */}
        <BookPreview onOrderClick={scrollToOrder} />

        {/* 5. Who is it for? ("الكتاب هذا لي شكون؟") */}
        <TargetAudience />

        {/* 6. Order Section ("اطلب كتابك توّا") */}
        <OrderSection />

        {/* 7. FAQ ("أسئلة تتعاود برشة") */}
        <FAQ />

        {/* 8. Final Call to Action */}
        <FinalCTA onOrderClick={scrollToOrder} />
      </main>

      {/* 9. Footer */}
      <Footer onAdminClick={() => navigateTo('/admin')} />
    </div>
  );
}
