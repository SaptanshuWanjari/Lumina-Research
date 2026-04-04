import BottomCTA from "./Components/Home/BottomCTA";
import FAQ from "./Components/Home/FAQ";
import Features from "./Components/Home/Features";
import Footer from "./Components/Home/Footer";
import Hero from "./Components/Home/Hero";
import NavBar from "./Components/Navigation/NavBar";

export default function Home() {
  return (
    <div className='bg-[##f5f7fa]'>
      <NavBar />
      <Hero />
      <section className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Features />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 text-center">
        <FAQ />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12 text-center">
        <BottomCTA />
      </section>

      <Footer />
    </div>
  );
}
