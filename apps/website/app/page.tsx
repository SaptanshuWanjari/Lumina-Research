// import { redirect } from "next/navigation";
import NavBar from "./Components/Navigation/Navbar";
import Hero from "./Components/Home/Hero";
import Features from "./Components/Home/Features";
import FAQ from "./Components/Home/FAQ";
import Footer from "./Components/Common/Footer";

export default function Home() {
  return (
    <div className="bg-[##f5f7fa]">
      <NavBar />
      <Hero />
      <section className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Features />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 text-center">
        <FAQ />
      </section>

      <Footer />
    </div>
  );
}
