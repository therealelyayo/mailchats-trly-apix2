import { 
  ArrowRight, 
  Mail, 
  BarChart3, 
  Calendar, 
  Users, 
  CheckCircle, 
  Globe 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LiveChat from "@/components/LiveChat";
import Logo from "@/components/Logo";
import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Add LiveChat for website visitors */}
      <LiveChat 
        pageData={{
          page: "landing",
          product: "MailChats Trly APIX2",
          version: "2.0"
        }}
      />
      
      {/* Navigation Bar */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Logo size="small" className="flex-shrink-0" />
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary">Testimonials</a>
              <a href="#faq" className="text-gray-600 hover:text-primary">FAQ</a>
              <Link href="/microinteractions" className="text-black hover:text-gray-800 font-medium">Flutter Demo</Link>
              <Link href="/html-editor" className="text-black hover:text-gray-800 font-medium">HTML Editor</Link>
            </div>
            <div>
              <Link href="/auth">
                <Button variant="outline" className="mr-2">Login</Button>
              </Link>
              <Link href="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Powerful Email Marketing Made <span className="text-primary">Simple</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Reach your audience, grow your business, and drive results with our intuitive email marketing platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="px-8">
                    Start for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/microinteractions">
                  <Button size="lg" variant="outline">
                    View Flutter Demo
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>No credit card required</span>
                <CheckCircle className="h-4 w-4 text-green-500 mx-2 ml-6" />
                <span>Free plan available</span>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <img 
                  src="https://placehold.co/600x400/4a6cf7/white?text=MailChats+Trly+APIX2+Dashboard" 
                  alt="MailChats Trly APIX2 Dashboard" 
                  className="rounded-lg w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features for Your Email Marketing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              MailChats Trly APIX2 provides all the tools you need to create, send, and analyze your email campaigns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Mail className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Smart Email Campaigns</h3>
              <p className="text-gray-600">
                Create and send beautiful email campaigns that engage your audience and drive conversions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Detailed Analytics</h3>
              <p className="text-gray-600">
                Track opens, clicks, and conversions to understand what works and optimize your campaigns.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Scheduled Sending</h3>
              <p className="text-gray-600">
                Schedule your emails to be sent at the perfect time to maximize engagement.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Audience Segmentation</h3>
              <p className="text-gray-600">
                Target the right audience with segmentation based on behavior, demographics, and more.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Globe className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Global Deliverability</h3>
              <p className="text-gray-600">
                Send emails that actually reach inboxes with our high-deliverability infrastructure.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-primary/5 p-6 rounded-lg shadow-sm border border-primary/10 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <Mail className="h-12 w-12 text-primary" />
                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">Popular</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Template Builder</h3>
              <p className="text-gray-600">
                Create beautiful emails with our drag-and-drop editor, no coding required.
              </p>
              <Link href="/html-editor">
                <Button variant="link" className="mt-4 p-0">
                  Try HTML Editor <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo size="medium" className="mb-4" />
              <p className="text-gray-400 mb-4">
                The most powerful email marketing platform for businesses of all sizes.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Legal</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; 2025 MailChats Trly APIX2. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}