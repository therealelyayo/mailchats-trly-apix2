import { Link } from "wouter";
import { 
  ArrowRight, 
  Mail, 
  Check, 
  X,
  HelpCircle,
  BarChart,
  Users,
  FileText,
  Zap,
  Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Mail className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold">MailChats Trly APIX2</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-primary">Home</Link>
              <Link href="/features" className="text-gray-600 hover:text-primary">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-primary font-medium">Pricing</Link>
              <Link href="/about" className="text-gray-600 hover:text-primary">About</Link>
            </div>
            <div>
              <Link href="/auth">
                <Button variant="outline" className="mr-2">Login</Button>
              </Link>
              <Link href="/auth">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Transparent, Simple Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the plan that's right for your business. All plans include core features to help you connect with your audience and grow your business.
          </p>
          <div className="flex justify-center space-x-4 mb-12">
            <Button variant="outline" className="rounded-full">Monthly Billing</Button>
            <Button className="rounded-full">
              Annual Billing
              <span className="bg-green-100 text-green-800 text-xs rounded-full px-2 py-0.5 ml-2">Save 20%</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Tables */}
      <section className="py-12 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">Free</h3>
                  <p className="text-sm text-gray-500 mt-1">Get started with email marketing</p>
                </div>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                  <Mail className="h-4 w-4 text-gray-600" />
                </span>
              </div>
              
              <div className="mt-6 mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Free forever, no credit card required
                </p>
              </div>

              <Link href="/auth">
                <Button variant="outline" className="w-full mb-8">Start for Free</Button>
              </Link>
              
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-4">Features</h4>
              <ul className="space-y-4">
                <FeatureItem included>Up to 500 emails/month</FeatureItem>
                <FeatureItem included>Up to 1,000 contacts</FeatureItem>
                <FeatureItem included>Basic templates</FeatureItem>
                <FeatureItem included>Basic analytics</FeatureItem>
                <FeatureItem included>Email support</FeatureItem>
                <FeatureItem>Custom domain</FeatureItem>
                <FeatureItem>Advanced segmentation</FeatureItem>
                <FeatureItem>Automated workflows</FeatureItem>
                <FeatureItem>A/B testing</FeatureItem>
                <FeatureItem>API access</FeatureItem>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-primary relative transform md:scale-105 md:-translate-y-1">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-medium">
                MOST POPULAR
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">Pro</h3>
                  <p className="text-sm text-gray-500 mt-1">For growing businesses</p>
                </div>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </span>
              </div>
              
              <div className="mt-6 mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  $39/month billed annually
                </p>
              </div>

              <Link href="/auth">
                <Button className="w-full mb-8">Get Started</Button>
              </Link>
              
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-4">Everything in Free, plus:</h4>
              <ul className="space-y-4">
                <FeatureItem included>Up to 50,000 emails/month</FeatureItem>
                <FeatureItem included>Up to 25,000 contacts</FeatureItem>
                <FeatureItem included>Advanced templates</FeatureItem>
                <FeatureItem included>Detailed analytics</FeatureItem>
                <FeatureItem included>Priority email support</FeatureItem>
                <FeatureItem included>Custom domain</FeatureItem>
                <FeatureItem included>Basic segmentation</FeatureItem>
                <FeatureItem included>3 automated workflows</FeatureItem>
                <FeatureItem included>A/B testing</FeatureItem>
                <FeatureItem>API access</FeatureItem>
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">Enterprise</h3>
                  <p className="text-sm text-gray-500 mt-1">For large organizations</p>
                </div>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                  <Users className="h-4 w-4 text-gray-600" />
                </span>
              </div>
              
              <div className="mt-6 mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">$199</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  $159/month billed annually
                </p>
              </div>

              <Link href="/auth">
                <Button variant="outline" className="w-full mb-8">Contact Sales</Button>
              </Link>
              
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-4">Everything in Pro, plus:</h4>
              <ul className="space-y-4">
                <FeatureItem included>Unlimited emails</FeatureItem>
                <FeatureItem included>Unlimited contacts</FeatureItem>
                <FeatureItem included>Custom templates</FeatureItem>
                <FeatureItem included>Advanced analytics & reporting</FeatureItem>
                <FeatureItem included>24/7 priority support</FeatureItem>
                <FeatureItem included>Multiple custom domains</FeatureItem>
                <FeatureItem included>Advanced segmentation</FeatureItem>
                <FeatureItem included>Unlimited automated workflows</FeatureItem>
                <FeatureItem included>Advanced A/B testing</FeatureItem>
                <FeatureItem included>Full API access</FeatureItem>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Compare All Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See exactly what's included in each plan to find the right one for your business.
            </p>
          </div>

          <div className="max-w-6xl mx-auto overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left"></th>
                  <th className="p-4 text-center">Free</th>
                  <th className="p-4 text-center bg-primary/5 border-x border-primary/10">Pro</th>
                  <th className="p-4 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <FeatureRow 
                  name="Email Sending Limits" 
                  tooltip="Maximum number of emails you can send per month"
                  free="500 emails/month"
                  pro="50,000 emails/month"
                  enterprise="Unlimited"
                />
                <FeatureRow 
                  name="Contact Storage" 
                  tooltip="Maximum number of contacts you can store"
                  free="1,000 contacts"
                  pro="25,000 contacts"
                  enterprise="Unlimited"
                />
                <FeatureRow 
                  name="Email Templates" 
                  tooltip="Pre-designed email templates to help you get started"
                  free="10 basic templates"
                  pro="100+ advanced templates"
                  enterprise="Custom templates + design services"
                />
                <FeatureRow 
                  name="Analytics" 
                  tooltip="Track and analyze your email performance"
                  free="Basic metrics"
                  pro="Detailed reports"
                  enterprise="Advanced analytics + custom dashboards"
                />
                <FeatureRow 
                  name="Segmentation" 
                  tooltip="Target specific groups within your audience"
                  free="Basic tags"
                  pro="Advanced segments"
                  enterprise="AI-powered segmentation"
                />
                <FeatureRow 
                  name="Automation" 
                  tooltip="Set up automated email sequences"
                  free="None"
                  pro="3 workflows"
                  enterprise="Unlimited workflows"
                />
                <FeatureRow 
                  name="A/B Testing" 
                  tooltip="Test different versions of your emails"
                  free="None"
                  pro="Subject line testing"
                  enterprise="Full content testing"
                />
                <FeatureRow 
                  name="API Access" 
                  tooltip="Integrate with other tools and services"
                  free="None"
                  pro="Limited access"
                  enterprise="Full access + webhooks"
                />
                <FeatureRow 
                  name="Support" 
                  tooltip="Get help when you need it"
                  free="Email support"
                  pro="Priority email support"
                  enterprise="24/7 phone & email support"
                />
                <FeatureRow 
                  name="Custom Domain" 
                  tooltip="Send emails from your own domain"
                  free="No"
                  pro="1 domain"
                  enterprise="Multiple domains"
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Still have questions? We're here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">Can I upgrade or downgrade my plan anytime?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade your plan at any time. The new charges will be prorated based on the time remaining in your billing cycle. You can also downgrade your plan, which will take effect at the end of your current billing cycle.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">Do you offer a free trial of paid plans?</h3>
              <p className="text-gray-600">
                Yes, we offer a 14-day free trial of our Pro plan, no credit card required. You can test all the features to see if it's right for your needs before committing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">What happens if I exceed my email limit?</h3>
              <p className="text-gray-600">
                If you reach your monthly email sending limit, you won't be able to send more emails until your next billing cycle begins. You can upgrade your plan at any time to increase your limit.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">Do you offer any discounts?</h3>
              <p className="text-gray-600">
                Yes, we offer a 20% discount when you choose annual billing instead of monthly. We also offer special discounts for nonprofits and educational institutions. Contact our sales team for more information.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">How does billing work?</h3>
              <p className="text-gray-600">
                We bill on a monthly or annual basis, depending on your preference. For monthly plans, you'll be charged on the same date each month. For annual plans, you'll be charged once per year.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold mb-2">Is there a long-term contract?</h3>
              <p className="text-gray-600">
                No, there's no long-term contract. You can cancel your paid subscription at any time, and your plan will remain active until the end of your current billing cycle.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to grow your email marketing?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Start for free, no credit card required. Upgrade when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="px-8">
                Start for Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Mail className="h-6 w-6 text-primary mr-2" />
                <span className="text-xl font-bold">MailChats Trly APIX2</span>
              </div>
              <p className="text-gray-400 mb-4">
                Powerful email marketing made simple for everyone.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-white">Testimonials</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-white">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Community</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} MailChats Trly APIX2. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper components

interface FeatureItemProps {
  children: React.ReactNode;
  included?: boolean;
}

function FeatureItem({ children, included = false }: FeatureItemProps) {
  return (
    <li className="flex items-start">
      {included ? (
        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
      ) : (
        <X className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
      )}
      <span className={included ? "text-gray-700" : "text-gray-400"}>{children}</span>
    </li>
  );
}

interface FeatureRowProps {
  name: string;
  tooltip: string;
  free: string;
  pro: string;
  enterprise: string;
}

function FeatureRow({ name, tooltip, free, pro, enterprise }: FeatureRowProps) {
  return (
    <tr className="border-b">
      <td className="p-4 font-medium">
        <div className="flex items-center">
          {name}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-60">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </td>
      <td className="p-4 text-center">{free}</td>
      <td className="p-4 text-center bg-primary/5 border-x border-primary/10 font-medium">{pro}</td>
      <td className="p-4 text-center">{enterprise}</td>
    </tr>
  );
}