'use client';

import Navbar from '../components/Navbar';
import GarageLayout from '../components/garage/GarageLayout';

export default function GaragePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <GarageLayout />
    </div>
  );
}




