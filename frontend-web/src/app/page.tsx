import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Hero } from '@/components/sections/hero'
import { Satisfaction } from '@/components/sections/satisfaction'
import { Features } from '@/components/sections/features'
import { HowItWorks } from '@/components/sections/how-it-works'
import { Testimonials } from '@/components/sections/testimonials'
import { CTA } from '@/components/sections/cta'
import { ShareButtons } from '@/components/sharing/ShareButtons'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Satisfaction />
      <Features />
      <HowItWorks />
      <Testimonials />
      <div className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ShareButtons url="/" title="Assistência Técnica Pós-Obra" />
        </div>
      </div>
      <CTA />
    </main>
  )
}

