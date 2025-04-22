// Template recommendation service
// This service analyzes email templates and provides smart recommendations

// Define template categories
export enum TemplateCategory {
  Promotional = 'promotional',
  Newsletter = 'newsletter',
  Transactional = 'transactional',
  Announcement = 'announcement',
  Welcome = 'welcome',
}

// Define template components that can be suggested
export interface TemplateComponent {
  id: string;
  name: string;
  description: string;
  htmlSnippet: string;
  category: TemplateCategory[];
}

// Define template recommendations
export interface TemplateRecommendation {
  id: string;
  type: 'improvement' | 'warning' | 'suggestion';
  title: string;
  description: string;
  fixAction?: string;
  component?: TemplateComponent;
}

// Define suggested template
export interface SuggestedTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnailUrl?: string;
  htmlContent: string;
  similarityScore: number;
}

/**
 * Collection of sample template components that can be suggested
 */
export const templateComponents: TemplateComponent[] = [
  {
    id: 'social-media-bar',
    name: 'Social Media Bar',
    description: 'Add social media links to increase engagement',
    category: [TemplateCategory.Newsletter, TemplateCategory.Promotional, TemplateCategory.Announcement],
    htmlSnippet: `
<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-top: 20px;">
  <tr>
    <td style="text-align: center; padding: 12px;">
      <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Follow us on social media</p>
      <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://via.placeholder.com/30/3b5998/FFFFFF?text=f" alt="Facebook" style="border-radius: 50%;"></a>
      <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://via.placeholder.com/30/1DA1F2/FFFFFF?text=t" alt="Twitter" style="border-radius: 50%;"></a>
      <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://via.placeholder.com/30/C13584/FFFFFF?text=i" alt="Instagram" style="border-radius: 50%;"></a>
      <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://via.placeholder.com/30/0077B5/FFFFFF?text=in" alt="LinkedIn" style="border-radius: 50%;"></a>
    </td>
  </tr>
</table>
    `
  },
  {
    id: 'unsubscribe-footer',
    name: 'Unsubscribe Footer',
    description: 'Add an unsubscribe link to comply with regulations',
    category: [TemplateCategory.Newsletter, TemplateCategory.Promotional, TemplateCategory.Announcement],
    htmlSnippet: `
<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-top: 20px; border-top: 1px solid #eee;">
  <tr>
    <td style="text-align: center; padding: 12px; font-size: 12px; color: #999;">
      <p>You're receiving this email because you signed up for our newsletter.</p>
      <p>If you don't want to receive these emails in the future, you can <a href="#" style="color: #666; text-decoration: underline;">unsubscribe here</a>.</p>
      <p>© 2025 Your Company. All rights reserved.</p>
    </td>
  </tr>
</table>
    `
  },
  {
    id: 'call-to-action-button',
    name: 'Call to Action Button',
    description: 'Add a prominent call to action button',
    category: [TemplateCategory.Promotional, TemplateCategory.Announcement, TemplateCategory.Welcome],
    htmlSnippet: `
<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 20px 0;">
  <tr>
    <td style="text-align: center; padding: 12px;">
      <a href="#" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 16px;">
        Take Action Now
      </a>
    </td>
  </tr>
</table>
    `
  },
  {
    id: 'responsive-meta-tag',
    name: 'Responsive Meta Tag',
    description: 'Meta tag for responsive design',
    category: [
      TemplateCategory.Newsletter, 
      TemplateCategory.Promotional, 
      TemplateCategory.Transactional, 
      TemplateCategory.Announcement, 
      TemplateCategory.Welcome
    ],
    htmlSnippet: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
  },
  {
    id: 'mail-merge-greeting',
    name: 'Personalized Greeting',
    description: 'Add a personalized greeting with mail merge variables',
    category: [
      TemplateCategory.Newsletter, 
      TemplateCategory.Promotional, 
      TemplateCategory.Transactional, 
      TemplateCategory.Welcome
    ],
    htmlSnippet: `
<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 20px;">
  <tr>
    <td style="padding: 12px;">
      <h2 style="margin: 0; font-size: 20px; color: #333;">Hello {{emailname}},</h2>
    </td>
  </tr>
</table>
    `
  },
  {
    id: 'image-alt-example',
    name: 'Image with Alt Text',
    description: 'Example of an image with proper alt text',
    category: [
      TemplateCategory.Newsletter, 
      TemplateCategory.Promotional, 
      TemplateCategory.Announcement
    ],
    htmlSnippet: `
<img src="https://via.placeholder.com/600x300" alt="Descriptive alt text for accessibility" style="width: 100%; max-width: 600px; height: auto; display: block; margin: 0 auto;">
    `
  }
];

/**
 * Collection of sample email templates
 */
export const sampleTemplates = [
  {
    id: 'newsletter-basic',
    name: 'Basic Newsletter',
    description: 'A simple newsletter template with a clean design',
    category: TemplateCategory.Newsletter,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly Newsletter</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
      <h1>Monthly Newsletter</h1>
      <p>Special Edition for {{emailname}}@{{domain}}</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 5px 5px; border: 1px solid #e0e0e0; border-top: none;">
      <h2>Hello {{emailname}},</h2>
      
      <p>Thank you for subscribing to our monthly newsletter! We're excited to share the latest updates and news with you.</p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #6366F1; padding: 15px; margin: 20px 0;">
        <p><strong>Account Information:</strong><br>
        Email: {{email}}<br>
        Member Since: January 2023<br>
        Current Time: {{time}}</p>
      </div>
      
      <h3>What's New This Month</h3>
      
      <p>We've been working hard to bring you new features and improvements:</p>
      
      <ul>
        <li>Enhanced user dashboard with personalized recommendations</li>
        <li>New mobile app available for download</li>
        <li>Expanded product catalog with exclusive items</li>
      </ul>
      
      <p>We'd love to hear your feedback on these new features. Just reply to this email to share your thoughts!</p>
      
      <div style="text-align: center; margin: 25px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Explore New Features
        </a>
      </div>
      
      <h3>Special Offer Just for You</h3>
      
      <p>As a valued subscriber, we're offering you a special 20% discount on your next purchase. Use code <strong>NEWSLETTER20</strong> at checkout.</p>
      
      <p>Thank you for being part of our community!</p>
      
      <p>Best regards,<br>
      The Team</p>
    </div>
    
    <div style="text-align: center; font-size: 12px; color: #666; margin-top: 20px;">
      <p>© 2025 Our Company. All rights reserved.</p>
      <p>You're receiving this email because you subscribed to our newsletter.<br>
      To unsubscribe, <a href="#" style="color: #666;">click here</a>.</p>
      <p>123 Business Street, City, Country</p>
      
      <div style="margin-top: 15px;">
        <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://via.placeholder.com/30/3b5998/FFFFFF?text=f" alt="Facebook" style="border-radius: 50%;"></a>
        <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://via.placeholder.com/30/1DA1F2/FFFFFF?text=t" alt="Twitter" style="border-radius: 50%;"></a>
        <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://via.placeholder.com/30/C13584/FFFFFF?text=i" alt="Instagram" style="border-radius: 50%;"></a>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'promotional-sale',
    name: 'Promotional Sale',
    description: 'Template for promoting sales and special offers',
    category: TemplateCategory.Promotional,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Special Sale Promotion</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; padding: 20px;">
      <h1 style="color: #E53E3E; margin: 0; font-size: 32px;">FLASH SALE</h1>
      <p style="font-size: 18px; margin: 10px 0 0 0;">Just for you, {{emailname}}!</p>
    </div>
    
    <div style="background-color: #FED7D7; padding: 20px; text-align: center; border-radius: 5px;">
      <h2 style="margin: 0; font-size: 24px;">50% OFF</h2>
      <p style="font-size: 18px; margin: 10px 0 0 0;">Limited Time Offer</p>
      <p style="font-size: 14px; margin: 5px 0 0 0;">Ends {{time}}</p>
    </div>
    
    <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 5px; border: 1px solid #eee;">
      <h2 style="color: #333; border-bottom: 2px solid #E53E3E; padding-bottom: 10px;">Dear {{emailname}},</h2>
      
      <p>We're excited to offer you an exclusive discount on all our products, just for being a valued customer!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <img src="https://via.placeholder.com/500x300/FED7D7/E53E3E?text=SPECIAL+OFFER" alt="Special offer promotional image" style="max-width: 100%; height: auto;">
      </div>
      
      <h3>Why Shop Now?</h3>
      
      <ul>
        <li>Get 50% off everything site-wide</li>
        <li>Free shipping on all orders</li>
        <li>New arrivals just added to inventory</li>
        <li>Limited time offer - this weekend only!</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="display: inline-block; background-color: #E53E3E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 18px;">
          SHOP NOW
        </a>
        <p style="font-size: 14px; color: #666; margin-top: 10px;">Use code: <strong>FLASH50</strong> at checkout</p>
      </div>
      
      <p>Don't miss out on these amazing deals!</p>
      
      <p>Regards,<br>The Sales Team</p>
    </div>
    
    <div style="text-align: center; font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
      <p>© 2025 Our Company. All rights reserved.</p>
      <p>You're receiving this email because you signed up for promotional emails.<br>
      <a href="#" style="color: #666;">Unsubscribe</a> | <a href="#" style="color: #666;">View in browser</a></p>
      
      <div style="margin-top: 15px;">
        <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://via.placeholder.com/30/3b5998/FFFFFF?text=f" alt="Facebook" style="border-radius: 50%;"></a>
        <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://via.placeholder.com/30/1DA1F2/FFFFFF?text=t" alt="Twitter" style="border-radius: 50%;"></a>
        <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://via.placeholder.com/30/C13584/FFFFFF?text=i" alt="Instagram" style="border-radius: 50%;"></a>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    description: 'A warm welcome email for new subscribers or customers',
    category: TemplateCategory.Welcome,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Community</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0;">
      <h1 style="margin: 0; font-size: 28px;">Welcome to Our Community!</h1>
      <p style="margin-top: 10px; font-size: 16px;">We're thrilled to have you join us, {{emailname}}!</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 5px 5px; border: 1px solid #e0e0e0; border-top: none;">
      <h2 style="color: #10B981;">Hi {{emailname}},</h2>
      
      <p>Thank you for joining our community! We're excited to have you on board and can't wait to share all the amazing features and benefits with you.</p>
      
      <div style="background-color: #f0fdf4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0;">
        <p><strong>Your Account Information:</strong><br>
        Email: {{email}}<br>
        Registration Date: {{time}}</p>
      </div>
      
      <h3 style="color: #10B981;">Getting Started</h3>
      
      <p>Here are a few steps to help you get started:</p>
      
      <ol>
        <li><strong>Complete your profile</strong> - Add a profile picture and tell us more about yourself</li>
        <li><strong>Explore our features</strong> - Discover all the tools and resources available to you</li>
        <li><strong>Connect with others</strong> - Join discussions and meet like-minded people</li>
        <li><strong>Check out our resources</strong> - Browse our knowledge base and tutorials</li>
      </ol>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Complete Your Profile
        </a>
      </div>
      
      <h3 style="color: #10B981;">We're Here to Help</h3>
      
      <p>If you have any questions or need assistance, feel free to reply to this email or contact our support team. We're always happy to help!</p>
      
      <p>Warm regards,<br>
      The Community Team</p>
    </div>
    
    <div style="text-align: center; font-size: 12px; color: #666; margin-top: 20px;">
      <p>© 2025 Our Company. All rights reserved.</p>
      <p>You're receiving this email because you recently signed up for our service.<br>
      If you didn't create this account, please <a href="#" style="color: #10B981;">let us know</a>.</p>
      
      <div style="margin-top: 15px;">
        <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://via.placeholder.com/30/3b5998/FFFFFF?text=f" alt="Facebook" style="border-radius: 50%;"></a>
        <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://via.placeholder.com/30/1DA1F2/FFFFFF?text=t" alt="Twitter" style="border-radius: 50%;"></a>
        <a href="#" style="display: inline-block; margin: 0 5px;"><img src="https://via.placeholder.com/30/C13584/FFFFFF?text=i" alt="Instagram" style="border-radius: 50%;"></a>
      </div>
    </div>
  </div>
</body>
</html>`
  }
];

/**
 * Analyzes an HTML template and provides specific recommendations
 */
export function analyzeTemplate(html: string): TemplateRecommendation[] {
  if (!html) {
    return [];
  }

  const recommendations: TemplateRecommendation[] = [];
  const lowercaseHtml = html.toLowerCase();
  
  // Check for missing alt text in images
  if (/<img[^>]+src="[^"]+"(?![^>]*alt=)[^>]*>/i.test(html)) {
    recommendations.push({
      id: 'alt-text',
      type: 'warning',
      title: 'Missing alt text on images',
      description: 'Some images in your email are missing alt text. This can affect accessibility and may cause issues with some email clients.',
      fixAction: 'Add alt attributes',
      component: templateComponents.find(c => c.id === 'image-alt-example')
    });
  }
  
  // Check for responsive design
  if (!/<meta[^>]+viewport[^>]+>/i.test(html) && !html.includes('media query')) {
    recommendations.push({
      id: 'responsive',
      type: 'improvement',
      title: 'Enhance responsive design',
      description: 'Your email template might not display well on mobile devices. Consider adding responsive design elements.',
      fixAction: 'Add responsive meta tag',
      component: templateComponents.find(c => c.id === 'responsive-meta-tag')
    });
  }
  
  // Check for mail merge variables
  if (!/{{\w+}}/.test(html) && !/{(\w+)}/.test(html)) {
    recommendations.push({
      id: 'mail-merge',
      type: 'suggestion',
      title: 'Add personalization with mail merge',
      description: 'Use mail merge variables like {{emailname}} to personalize your emails for better engagement.',
      fixAction: 'Add personalized greeting',
      component: templateComponents.find(c => c.id === 'mail-merge-greeting')
    });
  }
  
  // Check for unsubscribe link
  const hasUnsubscribe = lowercaseHtml.includes('unsubscribe') || 
                        lowercaseHtml.includes('opt out') || 
                        lowercaseHtml.includes('opt-out');
  if (!hasUnsubscribe) {
    recommendations.push({
      id: 'unsubscribe',
      type: 'warning',
      title: 'Missing unsubscribe link',
      description: 'Your email should include an unsubscribe link to comply with anti-spam regulations like CAN-SPAM and GDPR.',
      fixAction: 'Add unsubscribe footer',
      component: templateComponents.find(c => c.id === 'unsubscribe-footer')
    });
  }
  
  // Check for social media links
  const hasSocialLinks = lowercaseHtml.includes('facebook') || 
                        lowercaseHtml.includes('twitter') || 
                        lowercaseHtml.includes('instagram') || 
                        lowercaseHtml.includes('linkedin');
  if (!hasSocialLinks) {
    recommendations.push({
      id: 'social-links',
      type: 'suggestion',
      title: 'Add social media links',
      description: 'Consider adding social media links to increase engagement and reach.',
      fixAction: 'Add social media bar',
      component: templateComponents.find(c => c.id === 'social-media-bar')
    });
  }
  
  // Check for call to action
  const hasCallToAction = lowercaseHtml.includes('click here') || 
                         lowercaseHtml.includes('sign up') || 
                         lowercaseHtml.includes('buy now') || 
                         lowercaseHtml.includes('learn more') ||
                         lowercaseHtml.includes('get started');
  if (!hasCallToAction) {
    recommendations.push({
      id: 'call-to-action',
      type: 'suggestion',
      title: 'Add clear call to action',
      description: 'Your email may benefit from a clearer call to action to guide recipients on what to do next.',
      fixAction: 'Add call to action button',
      component: templateComponents.find(c => c.id === 'call-to-action-button')
    });
  }
  
  return recommendations;
}

/**
 * Get suggested template based on content analysis
 * This function analyzes the current HTML and finds similar templates
 */
export function getSuggestedTemplates(html: string): SuggestedTemplate[] {
  if (!html || !html.trim()) {
    // If no HTML provided, return all sample templates with a neutral score
    return sampleTemplates.map(template => ({
      ...template,
      similarityScore: 0.5
    }));
  }
  
  const lowercaseHtml = html.toLowerCase();
  
  // Determine template category
  let categoryScore = {
    [TemplateCategory.Newsletter]: 0,
    [TemplateCategory.Promotional]: 0,
    [TemplateCategory.Transactional]: 0,
    [TemplateCategory.Announcement]: 0,
    [TemplateCategory.Welcome]: 0,
  };
  
  // Check for newsletter indicators
  if (
    lowercaseHtml.includes('newsletter') || 
    lowercaseHtml.includes('update') || 
    lowercaseHtml.includes('monthly') || 
    lowercaseHtml.includes('weekly')
  ) {
    categoryScore[TemplateCategory.Newsletter] += 0.5;
  }
  
  // Check for promotional indicators
  if (
    lowercaseHtml.includes('sale') || 
    lowercaseHtml.includes('discount') || 
    lowercaseHtml.includes('offer') || 
    lowercaseHtml.includes('limited time') ||
    lowercaseHtml.includes('special') ||
    lowercaseHtml.includes('promotion')
  ) {
    categoryScore[TemplateCategory.Promotional] += 0.5;
  }
  
  // Check for transactional indicators
  if (
    lowercaseHtml.includes('order') || 
    lowercaseHtml.includes('transaction') || 
    lowercaseHtml.includes('receipt') || 
    lowercaseHtml.includes('invoice') ||
    lowercaseHtml.includes('payment') ||
    lowercaseHtml.includes('shipping')
  ) {
    categoryScore[TemplateCategory.Transactional] += 0.5;
  }
  
  // Check for announcement indicators
  if (
    lowercaseHtml.includes('announcement') || 
    lowercaseHtml.includes('introducing') || 
    lowercaseHtml.includes('new feature') || 
    lowercaseHtml.includes('launching') ||
    lowercaseHtml.includes('release')
  ) {
    categoryScore[TemplateCategory.Announcement] += 0.5;
  }
  
  // Check for welcome indicators
  if (
    lowercaseHtml.includes('welcome') || 
    lowercaseHtml.includes('onboarding') || 
    lowercaseHtml.includes('getting started') || 
    lowercaseHtml.includes('thank you for joining') ||
    lowercaseHtml.includes('new account')
  ) {
    categoryScore[TemplateCategory.Welcome] += 0.5;
  }
  
  // Calculate design similarity metrics
  const hasImages = (html.match(/<img/g) || []).length;
  const hasTables = (html.match(/<table/g) || []).length;
  const hasColors = (html.match(/#[0-9a-f]{3,6}|rgb\(/g) || []).length;
  const hasButtons = (html.match(/<button|<a[^>]+class="[^"]*button|style="[^"]*background/g) || []).length;
  
  // Calculate similarity scores
  return sampleTemplates.map(template => {
    let score = categoryScore[template.category] || 0;
    
    // Add content-based similarity metrics
    const templateLower = template.htmlContent.toLowerCase();
    
    // Check for structural similarities
    const templateHasImages = (template.htmlContent.match(/<img/g) || []).length;
    const templateHasTables = (template.htmlContent.match(/<table/g) || []).length;
    const templateHasColors = (template.htmlContent.match(/#[0-9a-f]{3,6}|rgb\(/g) || []).length;
    const templateHasButtons = (template.htmlContent.match(/<button|<a[^>]+class="[^"]*button|style="[^"]*background/g) || []).length;
    
    // Calculate structure similarity (0-0.3 score)
    let structureSimilarity = 0;
    if (Math.abs(hasImages - templateHasImages) < 3) structureSimilarity += 0.075;
    if (Math.abs(hasTables - templateHasTables) < 3) structureSimilarity += 0.075;
    if (Math.abs(hasColors - templateHasColors) < 5) structureSimilarity += 0.075;
    if (Math.abs(hasButtons - templateHasButtons) < 2) structureSimilarity += 0.075;
    
    // Add structure similarity to score
    score += structureSimilarity;
    
    // Calculate content similarity (0-0.2 score)
    let contentSimilarity = 0;
    const importantPhrases = ['header', 'footer', 'section', 'content', 'main', 'title', 'body'];
    for (const phrase of importantPhrases) {
      if (lowercaseHtml.includes(phrase) && templateLower.includes(phrase)) {
        contentSimilarity += 0.03;
      }
    }
    
    // Add content similarity to score
    score += contentSimilarity;
    
    // Ensure score is between 0 and 1
    score = Math.min(Math.max(score, 0), 1);
    
    return {
      ...template,
      similarityScore: score
    };
  })
  .sort((a, b) => b.similarityScore - a.similarityScore);  // Sort by similarity score
}

/**
 * Apply a template component to an HTML template
 */
export function applyTemplateComponent(html: string, componentId: string): string {
  if (!html || !componentId) return html;
  
  const component = templateComponents.find(c => c.id === componentId);
  if (!component) return html;
  
  // Special handling for different components
  switch (componentId) {
    case 'responsive-meta-tag':
      // Add meta tag if it doesn't exist
      if (!/<meta[^>]+viewport[^>]+>/i.test(html)) {
        return html.replace(/<head[^>]*>/, match => `${match}\n  ${component.htmlSnippet}`);
      }
      return html;
      
    case 'unsubscribe-footer':
      // Add to the end of the body if no footer exists
      if (!html.includes('unsubscribe')) {
        return html.replace(/<\/body>/, `  ${component.htmlSnippet}\n</body>`);
      }
      return html;
      
    case 'social-media-bar':
      // Add before the body closing tag if no social media links exist
      if (!html.toLowerCase().includes('facebook') && 
          !html.toLowerCase().includes('twitter') && 
          !html.toLowerCase().includes('instagram')) {
        return html.replace(/<\/body>/, `  ${component.htmlSnippet}\n</body>`);
      }
      return html;
      
    case 'call-to-action-button':
      // Add before a relevant closing tag if no CTA exists
      if (!html.toLowerCase().includes('button') && 
          !html.toLowerCase().includes('class="button"')) {
        // Look for a good insertion point
        if (html.includes('</article>')) {
          return html.replace('</article>', `${component.htmlSnippet}\n</article>`);
        }
        if (html.includes('</section>')) {
          return html.replace('</section>', `${component.htmlSnippet}\n</section>`);
        }
        if (html.includes('</div>')) {
          // Find a suitable div, not just the first one
          const divMatches = html.match(/<div[^>]+>[^<]{10,}/g);
          if (divMatches && divMatches.length > 0) {
            const targetDiv = divMatches[0];
            return html.replace(targetDiv, `${targetDiv}\n${component.htmlSnippet}`);
          }
        }
        // Otherwise, add before body closing tag
        return html.replace(/<\/body>/, `  ${component.htmlSnippet}\n</body>`);
      }
      return html;
      
    case 'mail-merge-greeting':
      // Add after a body or div opening tag if no personalized greeting exists
      if (!html.includes('{{emailname}}') && !html.includes('{emailname}')) {
        if (html.includes('<body')) {
          return html.replace(/<body[^>]*>/, match => `${match}\n${component.htmlSnippet}`);
        }
        if (html.includes('<div')) {
          const divMatches = html.match(/<div[^>]+>/);
          if (divMatches && divMatches.length > 0) {
            const targetDiv = divMatches[0];
            return html.replace(targetDiv, `${targetDiv}\n${component.htmlSnippet}`);
          }
        }
      }
      return html;
      
    case 'image-alt-example':
      // Replace the first image without alt text
      const imgWithoutAlt = html.match(/<img[^>]+src="[^"]+"(?![^>]*alt=)[^>]*>/i);
      if (imgWithoutAlt && imgWithoutAlt.length > 0) {
        return html.replace(imgWithoutAlt[0], component.htmlSnippet);
      }
      return html;
      
    default:
      // Generic insertion at the end of body
      return html.replace(/<\/body>/, `  ${component.htmlSnippet}\n</body>`);
  }
}