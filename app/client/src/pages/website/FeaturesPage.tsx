import { Link } from "wouter";
import { 
  ArrowRight, 
  Mail, 
  LineChart, 
  Users, 
  FileText, 
  Code, 
  Globe, 
  Bell,
  Zap,
  Lock,
  BarChart,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Feature list item component with checkmark
const FeatureListItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start">
    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <span className="text-sm text-gray-700">{children}</span>
  </li>
);

// Feature card component for main features section
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function FeaturesPage() {
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
              <Link href="/features" className="text-gray-600 hover:text-primary font-medium">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-primary">Pricing</Link>
            </div>
            <div>
              <Link href="/app">
                <Button variant="outline" className="mr-2">Login</Button>
              </Link>
              <Link href="/login">
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
            Powerful Features for Your Email Marketing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Everything you need to create, send, and optimize your email campaigns. Designed for marketers, not engineers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/app">
              <Button size="lg" className="px-8">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="px-8">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<FileText className="h-10 w-10 text-primary" />}
              title="Interactive Email Editor"
              description="Create beautiful emails with our intuitive drag-and-drop editor. No coding required. Choose from hundreds of templates or build your own."
            />
            
            <FeatureCard 
              icon={<LineChart className="h-10 w-10 text-primary" />}
              title="Advanced Analytics"
              description="Track opens, clicks, bounces, and conversions. Get detailed reports to understand what works and optimize your campaigns."
            />
            
            <FeatureCard 
              icon={<Users className="h-10 w-10 text-primary" />}
              title="Audience Segmentation"
              description="Target the right people with advanced segmentation. Create segments based on behavior, demographics, and custom fields."
            />
            
            <FeatureCard 
              icon={<Calendar className="h-10 w-10 text-primary" />}
              title="Email Automation"
              description="Set up automated email sequences triggered by time or user actions. Save time and increase engagement with personalized automation."
            />
            
            <FeatureCard 
              icon={<Globe className="h-10 w-10 text-primary" />}
              title="Global Deliverability"
              description="Ensure your emails reach the inbox, not the spam folder. Our global infrastructure ensures high deliverability rates worldwide."
            />
            
            <FeatureCard 
              icon={<Bell className="h-10 w-10 text-primary" />}
              title="A/B Testing"
              description="Test different subject lines, content, and send times. Use data to optimize your emails and increase engagement rates."
            />

            <FeatureCard 
              icon={<Code className="h-10 w-10 text-primary" />}
              title="API Integration"
              description="Connect your existing tools with our powerful API. Integrate with your CRM, e-commerce platform, or custom applications."
            />
            
            <FeatureCard 
              icon={<Lock className="h-10 w-10 text-primary" />}
              title="Security & Compliance"
              description="Stay compliant with GDPR, CAN-SPAM, and other regulations. Our platform includes built-in compliance features to keep you protected."
            />
            
            <FeatureCard 
              icon={<Zap className="h-10 w-10 text-primary" />}
              title="Smart Recommendations"
              description="Get AI-powered recommendations to improve your emails. Our system analyzes performance and suggests improvements."
            />
          </div>
        </div>
      </section>

      {/* Detailed Feature Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for Modern Marketers</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines power and simplicity to help you achieve better results with your email marketing.
            </p>
          </div>

          <div className="space-y-24">
            {/* Feature Detail 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl font-bold mb-4">Smart Template Builder</h3>
                <p className="text-gray-600 mb-6">
                  Our intuitive drag-and-drop editor makes it easy to create beautiful, responsive emails that look great on any device. Choose from hundreds of pre-designed templates or build your own from scratch.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Responsive design for all devices</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Easy-to-use drag-and-drop interface</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Hundreds of pre-designed templates</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Save and reuse your designs</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                  <img 
                    src="https://placehold.co/600x400/4a6cf7/white?text=Template+Builder" 
                    alt="Email Template Builder" 
                    className="rounded-lg w-full"
                  />
                </div>
              </div>
            </div>

            {/* Feature Detail 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                  <img 
                    src="https://placehold.co/600x400/4a6cf7/white?text=Analytics+Dashboard" 
                    alt="Analytics Dashboard" 
                    className="rounded-lg w-full"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Detailed Analytics & Reporting</h3>
                <p className="text-gray-600 mb-6">
                  Gain valuable insights into your email campaigns with our comprehensive analytics dashboard. Track opens, clicks, bounces, and more to optimize your future campaigns.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Real-time performance tracking</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Geographic and device reporting</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Click maps and engagement metrics</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Custom report generation</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature Detail 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl font-bold mb-4">Powerful Automation Workflows</h3>
                <p className="text-gray-600 mb-6">
                  Save time and increase engagement with automated email sequences. Set up triggers based on time, user behavior, or other custom events.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Welcome and onboarding sequences</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Behavior-triggered emails</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Personalized drip campaigns</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                      <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Visual workflow builder</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                  <img 
                    src="https://placehold.co/600x400/4a6cf7/white?text=Automation+Workflows" 
                    alt="Automation Workflows" 
                    className="rounded-lg w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Feature List Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Complete Feature List</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for successful email campaigns in one powerful platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Email Creation & Management */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-primary">Email Creation & Design</h3>
              <ul className="space-y-3">
                <FeatureListItem>Interactive visual email editor with drag-and-drop functionality</FeatureListItem>
                <FeatureListItem>Responsive design templates optimized for all devices</FeatureListItem>
                <FeatureListItem>Smart Template Recommendation Engine for design improvements</FeatureListItem>
                <FeatureListItem>Real-time preview across devices (mobile, tablet, desktop)</FeatureListItem>
                <FeatureListItem>HTML code editor for advanced customizations</FeatureListItem>
                <FeatureListItem>Customizable email templates for various industries</FeatureListItem>
                <FeatureListItem>Dynamic content blocks that adapt to recipient data</FeatureListItem>
                <FeatureListItem>Brand asset management and template library</FeatureListItem>
                <FeatureListItem>Email design best practices guidelines</FeatureListItem>
              </ul>
            </div>

            {/* Personalization & Mail Merge */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-primary">Personalization & Mail Merge</h3>
              <ul className="space-y-3">
                <FeatureListItem>Advanced mail merge with both single and double-brace format support</FeatureListItem>
                <FeatureListItem>Dynamic personalization fields (name, email, domain, etc.)</FeatureListItem>
                <FeatureListItem>Personalized subject lines to improve open rates</FeatureListItem>
                <FeatureListItem>Custom content blocks based on recipient attributes</FeatureListItem>
                <FeatureListItem>Automatic email content adaptation to recipient history</FeatureListItem>
                <FeatureListItem>Dynamic image content based on recipient data</FeatureListItem>
                <FeatureListItem>Personalized recommendations in email content</FeatureListItem>
                <FeatureListItem>Merge tag validation to prevent sending errors</FeatureListItem>
                <FeatureListItem>Fallback content for missing personalization data</FeatureListItem>
              </ul>
            </div>

            {/* Delivery & Infrastructure */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-primary">Delivery & Infrastructure</h3>
              <ul className="space-y-3">
                <FeatureListItem>Multiple sending methods (API and SMTP)</FeatureListItem>
                <FeatureListItem>Automatic SMTP server rotation for improved deliverability</FeatureListItem>
                <FeatureListItem>Credentials file upload for multiple SMTP servers</FeatureListItem>
                <FeatureListItem>Intelligent failover to alternate SMTP servers</FeatureListItem>
                <FeatureListItem>Adjustable sending speed controls</FeatureListItem>
                <FeatureListItem>Email throttling to prevent triggering spam filters</FeatureListItem>
                <FeatureListItem>SPF, DKIM, and DMARC authentication support</FeatureListItem>
                <FeatureListItem>Real-time delivery monitoring</FeatureListItem>
                <FeatureListItem>Automatic bounce handling and management</FeatureListItem>
              </ul>
            </div>

            {/* Tracking & Analytics */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-primary">Tracking & Analytics</h3>
              <ul className="space-y-3">
                <FeatureListItem>Real-time open and click tracking</FeatureListItem>
                <FeatureListItem>Comprehensive campaign reports and analytics</FeatureListItem>
                <FeatureListItem>Geographical tracking of email engagement</FeatureListItem>
                <FeatureListItem>Device and email client tracking</FeatureListItem>
                <FeatureListItem>Link click heatmaps to visualize engagement</FeatureListItem>
                <FeatureListItem>A/B testing with statistical analysis</FeatureListItem>
                <FeatureListItem>Conversion tracking and attribution</FeatureListItem>
                <FeatureListItem>Custom tracking pixel integration</FeatureListItem>
                <FeatureListItem>Engagement scoring for recipients</FeatureListItem>
              </ul>
            </div>

            {/* Campaign Management */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-primary">Campaign Management</h3>
              <ul className="space-y-3">
                <FeatureListItem>Scheduled sending with timezone optimization</FeatureListItem>
                <FeatureListItem>Campaign series and multi-stage campaigns</FeatureListItem>
                <FeatureListItem>Custom sending calendars and scheduling</FeatureListItem>
                <FeatureListItem>Follow-up campaign automation</FeatureListItem>
                <FeatureListItem>Campaign performance comparison tools</FeatureListItem>
                <FeatureListItem>Send time optimization based on recipient data</FeatureListItem>
                <FeatureListItem>Campaign templates and reusable workflows</FeatureListItem>
                <FeatureListItem>Campaign approvals and team collaboration</FeatureListItem>
                <FeatureListItem>Campaign categories and organization tools</FeatureListItem>
              </ul>
            </div>

            {/* Security & Compliance */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-primary">Security & Compliance</h3>
              <ul className="space-y-3">
                <FeatureListItem>Secure authentication with license key verification</FeatureListItem>
                <FeatureListItem>Email verification with one-time codes</FeatureListItem>
                <FeatureListItem>GDPR and CAN-SPAM compliance tools</FeatureListItem>
                <FeatureListItem>Unsubscribe link management and compliance</FeatureListItem>
                <FeatureListItem>Double opt-in support and verification</FeatureListItem>
                <FeatureListItem>Email list hygiene and automatic cleanup</FeatureListItem>
                <FeatureListItem>Data encryption and secure storage</FeatureListItem>
                <FeatureListItem>Role-based access controls</FeatureListItem>
                <FeatureListItem>Audit logs for compliance tracking</FeatureListItem>
              </ul>
            </div>

            {/* Integration & Extensibility */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-primary">Integration & Extensibility</h3>
              <ul className="space-y-3">
                <FeatureListItem>API integration with CRMs and marketing platforms</FeatureListItem>
                <FeatureListItem>Webhook support for event-driven integrations</FeatureListItem>
                <FeatureListItem>E-commerce platform integrations</FeatureListItem>
                <FeatureListItem>Custom data source connections</FeatureListItem>
                <FeatureListItem>Third-party analytics tool integration</FeatureListItem>
                <FeatureListItem>CSV/Excel import and export capabilities</FeatureListItem>
                <FeatureListItem>Developer-friendly APIs and documentation</FeatureListItem>
                <FeatureListItem>Zapier and integration platform connections</FeatureListItem>
                <FeatureListItem>Custom workflow automation</FeatureListItem>
              </ul>
            </div>

            {/* Recipient Management */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-primary">Recipient Management</h3>
              <ul className="space-y-3">
                <FeatureListItem>Powerful list segmentation and targeting</FeatureListItem>
                <FeatureListItem>Custom fields and recipient attributes</FeatureListItem>
                <FeatureListItem>Automated list cleaning and maintenance</FeatureListItem>
                <FeatureListItem>Duplicate detection and management</FeatureListItem>
                <FeatureListItem>Behavioral segmentation based on engagement</FeatureListItem>
                <FeatureListItem>Dynamic list updates based on user actions</FeatureListItem>
                <FeatureListItem>Suppression list management</FeatureListItem>
                <FeatureListItem>Segment overlap analysis</FeatureListItem>
                <FeatureListItem>Recipient profile management</FeatureListItem>
              </ul>
            </div>

            {/* AI & Optimization */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-primary">AI & Optimization</h3>
              <ul className="space-y-3">
                <FeatureListItem>AI-powered subject line suggestions</FeatureListItem>
                <FeatureListItem>Smart content recommendations</FeatureListItem>
                <FeatureListItem>Email template analysis and improvements</FeatureListItem>
                <FeatureListItem>Send time optimization algorithms</FeatureListItem>
                <FeatureListItem>Predictive analytics for campaign performance</FeatureListItem>
                <FeatureListItem>Automated A/B test analysis</FeatureListItem>
                <FeatureListItem>Spam score checking and improvement suggestions</FeatureListItem>
                <FeatureListItem>Content readability analysis</FeatureListItem>
                <FeatureListItem>Engagement prediction tools</FeatureListItem>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that use MailChats Trly APIX2 to connect with their audience.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/app">
              <Button size="lg" variant="secondary" className="px-8">
                Start for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white/10">
                View Pricing
              </Button>
            </Link>
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
                <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link href="/features" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link href="/app" className="text-gray-400 hover:text-white">Login</Link></li>
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