import React from "react";
import { Link } from "react-router-dom";
import SlidingCompanies from "../../../components/HeroSliding"; 
import { aboutImages } from "../../../data/AllData"; // Path apne folder ke mutabiq check kar lein

export default function About() {
  return (
    <div className="min-h-screen bg-white text-stone-800">
      {/* 1. Hero Section with Background Image */}
      <section className="relative py-24 sm:py-32 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src={aboutImages.heroBg}
            alt="Hero Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-5 text-center sm:px-8 text-white">
          <span className="inline-block rounded-full bg-amber-500/20 border border-amber-400/30 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase backdrop-blur-md text-amber-300">
            About Market Hub
          </span>
          <h1 className="mt-4 text-white">Empowering Digital Insights & Innovation</h1>
          <p className="mx-auto mt-4 max-w-2xl text-stone-200 opacity-95">
            Humara maqsad aapko sabse behtareen tech trends, brand breakdowns, aur digital marketing ki duniya ki sateek jankari dena hai.
          </p>
        </div>
      </section>

      {/* 2. Sliding Companies Component */}
      <SlidingCompanies />

      {/* 3. Main Content & Featured Banner Image Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2>Our Story & Vision</h2>
              <p className="mt-4 text-stone-600">
                Humne is platform ki shuruat isliye ki thi taaki readers ko complex tech news aur brand analytics aasan bhasha me mil sakein. Humare articles aur deep-dive guides aapko digital landscape ko samajhne me madad karte hain.
              </p>
              <p className="mt-3 text-stone-600">
                Chahe baat JioPhone ki ho, naye AI tools ki, ya top CEOs ki biographies ki—hum har ek cheez ko bariki se analyze karke aap tak pahunchate hain.
              </p>
              <div className="mt-8">
                <Link
                  to="/articles"
                  className="btn-gradient inline-block rounded-full px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95"
                >
                  Explore Articles
                </Link>
              </div>
            </div>

            <div>
              <div className="overflow-hidden rounded-2xl shadow-xl border border-stone-200">
                <img
                  src={aboutImages.storyBanner}
                  alt="About Us Banner"
                  className="h-full w-full object-cover transform hover:scale-105 transition duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}