import { NavigationBar } from "@/components/layouts/NavigationBar";
import { Footer } from "@/components/layouts/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavigationBar />
      <main className="pt-[84px]">{children}</main>
      <Footer />
    </>
  );
}
