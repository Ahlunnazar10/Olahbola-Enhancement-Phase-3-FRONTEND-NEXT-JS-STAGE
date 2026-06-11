import { NavigationBar } from "@/components/layouts/NavigationBar";
import { Footer } from "@/components/layouts/Footer";
import { LastPathTracker } from "@/components/LastPathTracker";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavigationBar />
      <main className="pt-[84px]">
        {children}
        <LastPathTracker />
      </main>
      <Footer />
    </>
  );
}
