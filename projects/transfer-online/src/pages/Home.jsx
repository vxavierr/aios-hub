import React, { Suspense } from 'react';
import MetaTags from '@/components/seo/MetaTags';
import NovaReserva from './NovaReserva';

const HomeLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
  </div>
);

export default function Home() {
  return (
    <>
      <MetaTags 
        title="TransferOnline - Transporte Executivo" 
        description="Agende seu transfer executivo com segurança e conforto." 
      />
      <Suspense fallback={<HomeLoader />}>
        <NovaReserva />
      </Suspense>
    </>
  );
}