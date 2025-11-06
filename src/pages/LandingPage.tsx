import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import pulseCover from '../assets/pulse_cover.jpg';
import reviewCover from '../assets/review_cover.jpg';

export default function LandingPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      {/* Header */}
      <div className='absolute top-0 left-0 right-0 z-10 pt-24'>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='text-center'>
            <h1 className='text-5xl font-bold text-white mb-3 tracking-tight'>
              Nerve Center
            </h1>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className='flex items-center justify-center min-h-screen px-8 py-12'>
        <div className='w-full max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Pulse Card */}
            <Link
              to='/daily-pulse-check/external'
              className='group relative h-[500px] rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 hover:scale-[1.02]'>
              {/* Background Image */}
              <div
                className='absolute inset-0 bg-cover bg-center'
                style={{
                  backgroundImage: `url(${pulseCover})`,
                }}>
                {/* Dark Overlay */}
                <div className='absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 group-hover:from-black/60 group-hover:via-black/40 group-hover:to-black/60 transition-all duration-500'></div>
              </div>

              {/* Content */}
              <div className='relative h-full flex flex-col justify-between p-10'>
                <div>
                  <div className='inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6'>
                    <span className='text-white text-sm font-semibold uppercase tracking-wider'>
                      Business Facts Book
                    </span>
                  </div>
                  <h2 className='text-5xl font-bold text-white mb-4 tracking-tight'>
                    Pulse
                  </h2>
                  <p className='text-gray-200 text-lg leading-relaxed max-w-md'>
                    Monitor external market dynamics and internal performance
                    metrics with real-time insights and quantitative analysis.
                  </p>
                </div>

                {/* CTA */}
                <div className='flex items-center text-white font-semibold text-lg group-hover:text-primary-300 transition-colors'>
                  <span>Enter Pulse</span>
                  <ArrowRightIcon className='w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300' />
                </div>
              </div>

              {/* Border glow on hover */}
              <div className='absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-500 pointer-events-none'></div>
            </Link>

            {/* Review Card */}
            <Link
              to='/weekly-forecast/forecast'
              className='group relative h-[500px] rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 hover:scale-[1.02]'>
              {/* Background Image */}
              <div
                className='absolute inset-0 bg-cover bg-center'
                style={{
                  backgroundImage: `url(${reviewCover})`,
                }}>
                {/* Dark Overlay */}
                <div className='absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 group-hover:from-black/60 group-hover:via-black/40 group-hover:to-black/60 transition-all duration-500'></div>
              </div>

              {/* Content */}
              <div className='relative h-full flex flex-col justify-between p-10'>
                <div>
                  <div className='inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6'>
                    <span className='text-white text-sm font-semibold uppercase tracking-wider'>
                      Financial Forecast
                    </span>
                  </div>
                  <h2 className='text-5xl font-bold text-white mb-4 tracking-tight'>
                    Review
                  </h2>
                  <p className='text-gray-200 text-lg leading-relaxed max-w-md'>
                    Manage business assumptions, review financial forecasts, and
                    track actions with driver-based analysis and scenario
                    simulation.
                  </p>
                </div>

                {/* CTA */}
                <div className='flex items-center text-white font-semibold text-lg group-hover:text-primary-300 transition-colors'>
                  <span>Enter Review</span>
                  <ArrowRightIcon className='w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300' />
                </div>
              </div>

              {/* Border glow on hover */}
              <div className='absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-500 pointer-events-none'></div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
