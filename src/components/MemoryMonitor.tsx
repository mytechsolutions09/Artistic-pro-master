import React, { useState, useEffect } from 'react';
import { MemoryMonitor, getMemoryStats, formatBytes } from '../utils/memoryUtils';

interface MemoryMonitorProps {
  showDetails?: boolean;
  threshold?: number;
}

export const MemoryMonitorComponent: React.FC<MemoryMonitorProps> = ({ 
  showDetails = false, 
  threshold = 80 
}) => {
  const [stats, setStats] = useState(getMemoryStats());
  const [isHigh, setIsHigh] = useState(false);

  useEffect(() => {
    const monitor = MemoryMonitor.getInstance();
    
    const updateStats = () => {
      const currentStats = getMemoryStats();
      setStats(currentStats);
      setIsHigh(currentStats ? currentStats.usagePercentage > threshold : false);
    };

    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000);
    updateStats(); // Initial update

    // Start monitoring with callback
    monitor.startMonitoring(threshold, (highStats) => {
      console.warn('High memory usage detected:', highStats);
      setIsHigh(true);
    });

    return () => {
      clearInterval(interval);
      monitor.stopMonitoring();
    };
  }, [threshold]);

  if (!stats) {
    return null; // Memory API not available
  }

  const getStatusColor = () => {
    if (stats.usagePercentage > 90) return 'text-red-600';
    if (stats.usagePercentage > 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (stats.usagePercentage > 90) return '🔴';
    if (stats.usagePercentage > 75) return '🟡';
    return '🟢';
  };

  return (
    <div className={`fixed bottom-4 right-4 p-3 bg-white rounded-lg shadow-lg border ${isHigh ? 'border-red-300' : 'border-gray-200'} z-50`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getStatusIcon()}</span>
        <div>
          <div className={`font-medium ${getStatusColor()}`}>
            {stats.usagePercentage}%
          </div>
          {showDetails && (
            <div className="text-xs text-gray-500">
              {formatBytes(stats.usedJSHeapSize)} / {formatBytes(stats.jsHeapSizeLimit)}
            </div>
          )}
        </div>
      </div>
      
      {isHigh && (
        <div className="mt-2 text-xs text-red-600">
          High memory usage detected
        </div>
      )}
    </div>
  );
};

export default MemoryMonitorComponent;
