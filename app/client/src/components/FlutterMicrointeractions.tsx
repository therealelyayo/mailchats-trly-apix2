import React, { useState, useEffect } from 'react';
import { Activity, Send, Zap, Check, Bell, Menu, X, Loader2, Plus, Trash } from 'lucide-react';

export default function FlutterMicrointeractions() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [checkboxStates, setCheckboxStates] = useState({
    option1: false,
    option2: false,
    option3: false,
  });
  const [items, setItems] = useState([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
  ]);
  const [newItemText, setNewItemText] = useState('');

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const addNotification = () => {
    setNotificationCount(prev => prev + 1);
  };

  const clearNotifications = () => {
    setNotificationCount(0);
  };

  const handleCheckboxChange = (key: keyof typeof checkboxStates) => {
    setCheckboxStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const addItem = () => {
    if (newItemText.trim()) {
      const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
      setItems([...items, { id: newId, text: newItemText.trim() }]);
      setNewItemText('');
    }
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  useEffect(() => {
    // Initialize staggered animations on mount
    const cards = document.querySelectorAll('.flutter-demo-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('flutter-animate-slide-up');
      }, index * 100);
    });
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-light mb-6 text-center">Flutter Microinteractions</h2>
      
      {/* Navigation tabs with indicators */}
      <div className="flex flex-wrap justify-center mb-8 border-b">
        {['buttons', 'inputs', 'animations', 'lists'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 relative capitalize transition-all duration-300 ${
              activeTab === tab 
                ? 'text-flutter-primary font-medium' 
                : 'text-gray-500 hover:text-flutter-primary/80'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-flutter-primary flutter-animate-scale" />
            )}
          </button>
        ))}
      </div>

      {/* Buttons section */}
      {activeTab === 'buttons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flutter-demo-card bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-4">Primary Buttons</h3>
            <div className="space-y-4">
              <button className="flutter-button w-full flex items-center justify-center gap-2">
                <Activity size={18} />
                Animated Button
              </button>
              
              <button 
                className="flutter-button w-full flex items-center justify-center gap-2"
                onClick={simulateLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {isLoading ? 'Loading...' : 'Send Message'}
              </button>
              
              <button className="flutter-button-outlined w-full flex items-center justify-center gap-2">
                <Zap size={18} />
                Outlined Button
              </button>
            </div>
          </div>
          
          <div className="flutter-demo-card bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-4">Interactive Elements</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative">
                    <Bell size={24} className="text-flutter-primary" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-flutter-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flutter-animate-scale">
                        {notificationCount}
                      </span>
                    )}
                  </span>
                  <span>Notifications</span>
                </div>
                <div className="space-x-2">
                  <button 
                    className="flutter-button-outlined py-1 px-3"
                    onClick={addNotification}
                  >
                    Add
                  </button>
                  <button 
                    className="flutter-button py-1 px-3"
                    onClick={clearNotifications}
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div>
                <div className="relative">
                  <button 
                    className="flutter-button w-full flex items-center justify-center gap-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    {isMenuOpen ? 'Close Menu' : 'Open Menu'}
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg overflow-hidden z-10 flutter-animate-slide-down">
                      {['Profile', 'Settings', 'Logout'].map((item, index) => (
                        <button 
                          key={item} 
                          className="block w-full text-left p-3 hover:bg-flutter-primary/10 transition-colors"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <button className="flutter-fab mx-auto flex">
                  <Plus size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inputs section */}
      {activeTab === 'inputs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flutter-demo-card bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-4">Text Inputs</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Username</label>
                <input
                  type="text"
                  className="flutter-input w-full"
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="flutter-input w-full"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Message</label>
                <textarea
                  className="flutter-input w-full min-h-[100px]"
                  placeholder="Type your message..."
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="flutter-demo-card bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-4">Selection Controls</h3>
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Checkboxes</h4>
                
                {Object.entries(checkboxStates).map(([key, checked]) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={key}
                      checked={checked}
                      onChange={() => handleCheckboxChange(key as keyof typeof checkboxStates)}
                      className="flutter-checkbox"
                    />
                    <label htmlFor={key} className="select-none">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mt-6">
                <h4 className="font-medium">Chips</h4>
                <div className="flex flex-wrap gap-2">
                  {['Flutter', 'React', 'TypeScript', 'Tailwind CSS'].map((tag) => (
                    <span key={tag} className="flutter-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations section */}
      {activeTab === 'animations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flutter-demo-card bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <h3 className="text-xl font-medium mb-4">Slide Animations</h3>
            <div className="space-y-4 w-full">
              <button 
                className="flutter-button w-full"
                onClick={(e) => {
                  const target = e.currentTarget;
                  target.classList.remove('flutter-animate-slide-up');
                  void target.offsetWidth; // Force reflow
                  target.classList.add('flutter-animate-slide-up');
                }}
              >
                Slide Up
              </button>
              
              <button 
                className="flutter-button w-full"
                onClick={(e) => {
                  const target = e.currentTarget;
                  target.classList.remove('flutter-animate-slide-down');
                  void target.offsetWidth; // Force reflow
                  target.classList.add('flutter-animate-slide-down');
                }}
              >
                Slide Down
              </button>
              
              <div className="flex gap-2">
                <button 
                  className="flutter-button flex-1"
                  onClick={(e) => {
                    const target = e.currentTarget;
                    target.classList.remove('flutter-animate-slide-left');
                    void target.offsetWidth; // Force reflow
                    target.classList.add('flutter-animate-slide-left');
                  }}
                >
                  Left
                </button>
                
                <button 
                  className="flutter-button flex-1"
                  onClick={(e) => {
                    const target = e.currentTarget;
                    target.classList.remove('flutter-animate-slide-right');
                    void target.offsetWidth; // Force reflow
                    target.classList.add('flutter-animate-slide-right');
                  }}
                >
                  Right
                </button>
              </div>
            </div>
          </div>
          
          <div className="flutter-demo-card bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <h3 className="text-xl font-medium mb-4">Scale & Fade</h3>
            <div className="space-y-4 w-full">
              <button 
                className="flutter-button w-full"
                onClick={(e) => {
                  const target = e.currentTarget;
                  target.classList.remove('flutter-animate-scale');
                  void target.offsetWidth; // Force reflow
                  target.classList.add('flutter-animate-scale');
                }}
              >
                Scale Animation
              </button>
              
              <button 
                className="flutter-button w-full"
                onClick={(e) => {
                  const target = e.currentTarget;
                  target.classList.remove('flutter-animate-fade');
                  void target.offsetWidth; // Force reflow
                  target.classList.add('flutter-animate-fade');
                }}
              >
                Fade Animation
              </button>
            </div>
            
            <div className="mt-6 w-full">
              <h4 className="font-medium mb-2 text-center">Loading State</h4>
              <div className="flex justify-center">
                <div className="flutter-loading"></div>
              </div>
            </div>
          </div>
          
          <div className="flutter-demo-card bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <h3 className="text-xl font-medium mb-4">Continuous Animations</h3>
            <div className="space-y-8 w-full">
              <div className="text-center">
                <div className="flutter-animate-bounce inline-block mb-2">
                  <span className="w-10 h-10 bg-flutter-primary rounded-full flex items-center justify-center text-white">
                    <Zap size={20} />
                  </span>
                </div>
                <p className="text-sm text-gray-500">Bounce Animation</p>
              </div>
              
              <div className="bg-flutter-primary/10 p-4 rounded-md border border-flutter-primary/20">
                <p className="text-center text-sm font-medium">
                  Flutter uses the Dart programming language and has a reactive framework that makes building UI with animations easier.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lists section */}
      {activeTab === 'lists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flutter-demo-card bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-4">Interactive List</h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  className="flutter-input flex-1"
                  placeholder="Add new item..."
                />
                <button 
                  className="flutter-button px-3"
                  onClick={addItem}
                >
                  <Plus size={18} />
                </button>
              </div>
              
              <div className="space-y-2">
                {items.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md flutter-animate-slide-right"
                  >
                    <span>{item.text}</span>
                    <button 
                      className="text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                ))}
                
                {items.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No items yet. Add some!
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flutter-demo-card bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-medium mb-4">Progress Tracking</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Project Progress</span>
                  <span className="text-sm font-medium">
                    {Math.round((Object.values(checkboxStates).filter(Boolean).length / Object.values(checkboxStates).length) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-flutter-primary transition-all duration-500 ease-out"
                    style={{ 
                      width: `${(Object.values(checkboxStates).filter(Boolean).length / Object.values(checkboxStates).length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-flutter-primary/5 p-4 rounded-lg border border-flutter-primary/10">
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Check size={18} className="text-flutter-success-dark" />
                  Flutter Design Benefits
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-flutter-primary mt-1">•</span>
                    <span>Consistent design system across platforms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-flutter-primary mt-1">•</span>
                    <span>Responsive and fluid microinteractions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-flutter-primary mt-1">•</span>
                    <span>Material Design inspired components</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-flutter-primary mt-1">•</span>
                    <span>Enhanced user experience through animation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}