import React from 'react';
import { Construction, Lightbulb, Star, ArrowRight } from 'lucide-react';

interface PlaceholderSettingsProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  comingSoon?: boolean;
}

const PlaceholderSettings: React.FC<PlaceholderSettingsProps> = ({
  title,
  description,
  icon,
  features,
  comingSoon = true
}) => {
  return (
    <div className="space-y-6">

      {/* Features Preview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <Lightbulb className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-800">Planned Features</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <Star className="w-4 h-4 text-pink-500" />
              </div>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Development Status */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl border border-pink-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
              <Construction className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">In Development</h4>
            <p className="text-gray-600 mb-4">
              This feature is currently under development. We're working hard to bring you 
              comprehensive {title.toLowerCase()} management capabilities.
            </p>
            <div className="flex items-center space-x-2 text-pink-600">
              <span className="text-sm font-medium">Stay tuned for updates</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Have Suggestions?</h4>
        <p className="text-gray-600 mb-4">
          We'd love to hear your thoughts on what features would be most valuable for {title.toLowerCase()}.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Share your feature ideas..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors">
            Send Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderSettings;
