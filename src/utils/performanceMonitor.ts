import React from 'react';

// Performance monitoring utilities
export const performanceMonitor = {
  // Measure component render time
  measureRender: (componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
      
      // Log slow renders (> 16ms for 60fps)
      if (duration > 16) {
        console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
      }
    };
  },

  // Measure API call performance
  measureApiCall: async (apiName: string, apiCall: () => Promise<any>) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      const duration = end - start;
      console.log(`${apiName} API call: ${duration.toFixed(2)}ms`);
      
      // Log slow API calls (> 1000ms)
      if (duration > 1000) {
        console.warn(`Slow API call detected: ${apiName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      console.error(`${apiName} API call failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  },

  // Measure user interaction response time
  measureInteraction: (interactionName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`${interactionName} interaction: ${duration.toFixed(2)}ms`);
      
      // Log slow interactions (> 100ms)
      if (duration > 100) {
        console.warn(`Slow interaction detected: ${interactionName} took ${duration.toFixed(2)}ms`);
      }
    };
  },

  // Get performance metrics
  getMetrics: () => {
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        // Navigation timing
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        
        // Paint timing
        firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        
        // Total page load time
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      };
    }
    return null;
  },

  // Log performance metrics
  logMetrics: () => {
    const metrics = performanceMonitor.getMetrics();
    if (metrics) {
      console.log('Performance Metrics:', {
        'DOM Content Loaded': `${metrics.domContentLoaded.toFixed(2)}ms`,
        'Load Complete': `${metrics.loadComplete.toFixed(2)}ms`,
        'First Paint': `${metrics.firstPaint.toFixed(2)}ms`,
        'First Contentful Paint': `${metrics.firstContentfulPaint.toFixed(2)}ms`,
        'Total Load Time': `${metrics.totalLoadTime.toFixed(2)}ms`,
      });
    }
  }
};

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const measureRender = performanceMonitor.measureRender(componentName);
  
  // Log metrics on component mount
  React.useEffect(() => {
    performanceMonitor.logMetrics();
  }, []);

  return measureRender;
};

// Higher-order component for performance monitoring
export const withPerformanceMonitor = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    const measureRender = performanceMonitor.measureRender(componentName);
    
    React.useEffect(() => {
      measureRender();
    });

    return <WrappedComponent {...props} />;
  });
};

export default performanceMonitor;
