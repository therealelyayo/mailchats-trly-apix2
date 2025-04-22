import React from 'react';
import FlutterMicrointeractions from '@/components/FlutterMicrointeractions';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';

export default function MicrointeractionsDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flutter-button-outlined py-1 flex items-center gap-1">
                <ChevronLeft size={18} />
                Back to Home
              </Link>
            </div>
            <div>
              <h1 className="text-xl font-medium text-flutter-primary">Flutter Microinteractions Demo</h1>
            </div>
            <div>
              {/* Empty div for alignment */}
              <div className="w-[110px]"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden flutter-animate-slide-up">
          <div className="p-6 bg-flutter-primary text-white">
            <h1 className="text-3xl font-light">Flutter-Inspired Microinteractions</h1>
            <p className="mt-2 opacity-90">
              Experience the fluid and responsive interface elements inspired by Flutter's Material Design system.
            </p>
          </div>
          
          <FlutterMicrointeractions />
          
          <div className="bg-gray-50 p-6 border-t">
            <h3 className="text-xl font-medium mb-4">About Flutter Microinteractions</h3>
            <p className="mb-4">
              Flutter is Google's UI toolkit for building beautiful, natively compiled applications for mobile, web, and desktop from a single codebase. 
              One of Flutter's strengths is its smooth animations and microinteractions that enhance the user experience.
            </p>
            <p>
              The microinteractions showcased above are inspired by Flutter's Material Design implementation, featuring responsive feedback, 
              subtle animations, and a cohesive design language that makes interfaces feel more intuitive and engaging.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}