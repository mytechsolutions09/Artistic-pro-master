import React from 'react';
import { useAppearance } from '../../contexts/AppearanceContext';

interface AuthIllustrationProps {
  className?: string;
}

const AuthIllustration: React.FC<AuthIllustrationProps> = ({ className = '' }) => {
  const { settings, loading } = useAppearance();

  // Show loading state while settings are being loaded
  if (loading) {
    return (
      <div className={`w-full h-full relative overflow-hidden ${className}`}>
        <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (settings.leftSideImageType === 'custom' && settings.leftSideImage) {
    return (
      <div className={`w-full h-full relative overflow-hidden ${className}`}>
        <img
          src={settings.leftSideImage}
          alt="Authentication illustration"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // No fallback - show loading state instead
  return (
    <div className={`w-full h-full relative overflow-hidden ${className}`}>
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    </div>
  );
};

export default AuthIllustration;
