/**
 * Debug Cleanup Utility
 * Clears debug information, console logs, and development tools after user login
 */

export class DebugCleanup {
  /**
   * Clear all debug-related localStorage items
   */
  static clearDebugStorage(): void {
    const debugKeys = [
      'debugMode',
      'debugLogs',
      'testData',
      'developmentMode',
      'adminDebug',
      'memoryDebug',
      'storageDebug',
      'performanceDebug',
      'consoleDebug'
    ];

    debugKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear any debug-related session storage
    const sessionDebugKeys = [
      'debugSession',
      'testSession',
      'adminSession'
    ];

    sessionDebugKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });
  }

  /**
   * Clear console logs and disable debug logging
   */
  static clearConsole(): void {
    // Clear console
    if (typeof console !== 'undefined') {
      console.clear();
    }

    // Disable debug console methods in production
    if (import.meta.env.PROD) {
      // Override console methods to prevent debug output in production
      console.log = () => {};
      console.debug = () => {};
      console.info = () => {};
      console.warn = () => {};
      // Keep console.error for actual errors
    }
  }

  /**
   * Remove debug components from DOM
   */
  static removeDebugComponents(): void {
    // Remove memory monitor if present
    const memoryMonitor = document.querySelector('[data-debug="memory-monitor"]');
    if (memoryMonitor) {
      memoryMonitor.remove();
    }

    // Remove storage test components
    const storageTests = document.querySelectorAll('[data-debug="storage-test"]');
    storageTests.forEach(element => element.remove());

    // Remove any debug panels
    const debugPanels = document.querySelectorAll('[data-debug="panel"]');
    debugPanels.forEach(element => element.remove());

    // Remove debug overlays
    const debugOverlays = document.querySelectorAll('[data-debug="overlay"]');
    debugOverlays.forEach(element => element.remove());
  }

  /**
   * Stop debug monitoring and timers
   */
  static stopDebugMonitoring(): void {
    // Stop memory monitoring
    try {
      const { MemoryMonitor } = require('../utils/memoryUtils');
      const monitor = MemoryMonitor.getInstance();
      monitor.stopMonitoring();
    } catch (error) {
      // Memory monitor not available, ignore
    }

    // Clear any debug intervals
    const debugIntervals = window.__debugIntervals || [];
    debugIntervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    window.__debugIntervals = [];

    // Clear any debug timeouts
    const debugTimeouts = window.__debugTimeouts || [];
    debugTimeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    window.__debugTimeouts = [];
  }

  /**
   * Remove debug CSS classes and styles
   */
  static removeDebugStyles(): void {
    // Remove debug CSS classes
    const debugElements = document.querySelectorAll('[class*="debug-"]');
    debugElements.forEach(element => {
      const classList = Array.from(element.classList);
      const debugClasses = classList.filter(cls => cls.startsWith('debug-'));
      debugClasses.forEach(cls => element.classList.remove(cls));
    });

    // Remove debug data attributes
    const debugDataElements = document.querySelectorAll('[data-debug]');
    debugDataElements.forEach(element => {
      element.removeAttribute('data-debug');
    });
  }

  /**
   * Clear all debug information
   */
  static clearAll(): void {
    try {
      this.clearDebugStorage();
      this.clearConsole();
      this.removeDebugComponents();
      this.stopDebugMonitoring();
      this.removeDebugStyles();
      
      console.log('✅ Debug cleanup completed successfully');
    } catch (error) {
      console.error('❌ Error during debug cleanup:', error);
    }
  }

  /**
   * Check if debug mode is enabled
   */
  static isDebugMode(): boolean {
    return (
      localStorage.getItem('debugMode') === 'true' ||
      localStorage.getItem('developmentMode') === 'true' ||
      import.meta.env.DEV ||
      window.location.hostname === 'localhost' ||
      window.location.hostname.includes('dev')
    );
  }

  /**
   * Enable debug mode (for development)
   */
  static enableDebugMode(): void {
    if (import.meta.env.DEV) {
      localStorage.setItem('debugMode', 'true');
      console.log('🐛 Debug mode enabled');
    }
  }

  /**
   * Disable debug mode
   */
  static disableDebugMode(): void {
    localStorage.removeItem('debugMode');
    localStorage.removeItem('developmentMode');
    console.log('🚫 Debug mode disabled');
  }
}

// Export convenience functions
export const clearDebugOnLogin = () => DebugCleanup.clearAll();
export const isDebugEnabled = () => DebugCleanup.isDebugMode();
export const enableDebug = () => DebugCleanup.enableDebugMode();
export const disableDebug = () => DebugCleanup.disableDebugMode();
