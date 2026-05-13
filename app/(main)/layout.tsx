import { NavigationBar } from '@/components/layouts/NavigationBar';
import { Footer } from '@/components/layouts/Footer';
import ThemeToggle from '@/components/theme-toggle/ThemeToggle';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavigationBar />
      <main className="pt-[84px] relative">
        {children}
        <ThemeToggle />
      </main>
      <Footer />
    </>
  );
}
