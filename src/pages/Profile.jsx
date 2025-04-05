import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Card from '@/components/common/Card';
import { User } from 'lucide-react';

function Profile() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Use a fallback name if user.name is not available
  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName[0]?.toUpperCase() || 'U';

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const stats = [
    { label: 'Total Trades', value: '156' },
    { label: 'Success Rate', value: '94%' },
    { label: 'Portfolio Value', value: '$124,500' },
    { label: 'Monthly Return', value: '+12.4%' },
  ];

  const activities = [
    { type: 'Trade', asset: 'Bitcoin', amount: '+$2,340', time: '2 hours ago' },
    { type: 'Deposit', asset: 'USD', amount: '+$5,000', time: '1 day ago' },
    { type: 'Trade', asset: 'Ethereum', amount: '-$1,200', time: '2 days ago' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 max-w-7xl mx-auto">
      <div className="glass-effect p-8 rounded-2xl mb-8 animate-fade-in">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 animate-pulse-slow flex items-center justify-center text-2xl font-bold">
              {userInitial}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-green-500 border-4 border-[#1a1a2e]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {userName}
            </h1>
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Premium Member</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="glass-effect p-6 hover-card animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h3 className={isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm>{stat.label}</h3>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass-effect animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex space-x-4 mb-6">
              {['overview', 'security', 'preferences'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab
                      ? isDarkMode 
                          ? 'bg-white text-purple-700' 
                          : 'bg-white text-purple-700'
                      : isDarkMode
                          ? 'hover:bg-white/80 text-gray-400'
                          : 'hover:bg-white/80 text-gray-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-medium mb-2">Account Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm>Email</p>
                        <p>{user?.email || 'example@email.com'}</p>
                      </div>
                      <div>
                        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm>Member Since</p>
                        <p>March 2024</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="font-medium mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {activities.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
                              <span className="text-sm">{activity.type[0]}</span>
                            </div>
                            <div>
                              <p className="font-medium">{activity.type}</p>
                              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{activity.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{activity.amount}</p>
                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{activity.asset}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <Card className="glass-effect sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {['Deposit Funds', 'Withdraw', 'API Keys', 'Support'].map((action) => (
                <button
                  key={action}
                  className="w-full p-4 text-left rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between text-black"
                >
                  <span>{action}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile; 