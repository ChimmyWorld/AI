/**
 * Performance Monitoring Utilities for Bullseye Mobile App
 * 
 * This module provides tools to measure and track application performance:
 * 1. Component render timing
 * 2. Network request monitoring
 * 3. Memory usage tracking
 * 4. Frame rate monitoring
 */

import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const PERF_STORAGE_KEY = 'performanceMetrics';
const MAX_PERF_LOGS = 100;

// Track performance logs in memory for quick access
let memoryPerfLogs = [];

/**
 * Initialize the performance monitoring system
 */
export const initializePerformanceMonitor = () => {
  // Load existing logs from storage
  loadPerformanceLogs();
  
  // Monitor frame rate
  if (__DEV__) {
    startFrameRateMonitoring();
  }
  
  console.log('[Performance] Performance monitoring initialized');
};

/**
 * Load performance logs from AsyncStorage
 */
const loadPerformanceLogs = async () => {
  try {
    const logs = await AsyncStorage.getItem(PERF_STORAGE_KEY);
    if (logs) {
      memoryPerfLogs = JSON.parse(logs);
    }
  } catch (error) {
    console.error('Failed to load performance logs:', error);
  }
};

/**
 * Save performance logs to AsyncStorage
 */
const savePerformanceLogs = async () => {
  try {
    // Keep the log size manageable
    if (memoryPerfLogs.length > MAX_PERF_LOGS) {
      memoryPerfLogs = memoryPerfLogs.slice(0, MAX_PERF_LOGS);
    }
    
    await AsyncStorage.setItem(PERF_STORAGE_KEY, JSON.stringify(memoryPerfLogs));
  } catch (error) {
    console.error('Failed to save performance logs:', error);
  }
};

/**
 * Record a performance metric
 * @param {string} name - Name of the operation
 * @param {number} duration - Duration in milliseconds
 * @param {string} category - Category of performance metric
 * @param {Object} metadata - Additional metadata
 */
export const recordPerformanceMetric = (name, duration, category = 'general', metadata = {}) => {
  const timestamp = new Date().toISOString();
  const metric = {
    name,
    duration,
    category,
    timestamp,
    ...metadata
  };
  
  // Add to in-memory logs
  memoryPerfLogs.unshift(metric);
  
  // Save to storage (debounced)
  savePerformanceLogsDebounced();
  
  // Log in development
  if (__DEV__) {
    const formattedDuration = duration.toFixed(2);
    console.log(`[Performance] ${category}: ${name} took ${formattedDuration}ms`);
  }
  
  return metric;
};

// Debounce storage operations to avoid excessive writes
let saveTimeout = null;
const savePerformanceLogsDebounced = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    savePerformanceLogs();
    saveTimeout = null;
  }, 1000);
};

/**
 * Measure the execution time of a function
 * @param {Function} fn - Function to measure
 * @param {string} name - Name of the operation
 * @param {string} category - Category of performance metric
 * @param {Object} metadata - Additional metadata
 * @returns {any} - The return value of the function
 */
export const measurePerformance = (fn, name, category = 'function', metadata = {}) => {
  if (typeof fn !== 'function') {
    console.error(`[Performance] Cannot measure ${name}: not a function`);
    return undefined;
  }
  
  const startTime = performance.now();
  try {
    const result = fn();
    const endTime = performance.now();
    recordPerformanceMetric(name, endTime - startTime, category, metadata);
    return result;
  } catch (error) {
    const endTime = performance.now();
    recordPerformanceMetric(
      name, 
      endTime - startTime, 
      'error', 
      { 
        ...metadata,
        error: error.message,
        stack: error.stack
      }
    );
    throw error;
  }
};

/**
 * Higher-order function to measure component render performance
 * @param {Function} renderFn - Component render function
 * @param {string} componentName - Name of the component
 * @returns {Function} - Wrapped render function
 */
export const measureRender = (renderFn, componentName) => {
  return function measuredRender(...args) {
    const startTime = performance.now();
    try {
      const result = renderFn.apply(this, args);
      
      // Defer measurement to next frame to ensure accurate timing
      InteractionManager.runAfterInteractions(() => {
        const endTime = performance.now();
        recordPerformanceMetric(
          `${componentName}.render`,
          endTime - startTime,
          'render',
          { componentName }
        );
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      recordPerformanceMetric(
        `${componentName}.render`,
        endTime - startTime,
        'render-error',
        { 
          componentName,
          error: error.message,
          stack: error.stack
        }
      );
      throw error;
    }
  };
};

/**
 * Start monitoring frame rate
 * Only runs in development mode
 */
let frameRateMonitorId = null;
export const startFrameRateMonitoring = () => {
  if (frameRateMonitorId) {
    return; // Already monitoring
  }
  
  let lastFrameTime = performance.now();
  let frameCount = 0;
  const frameRates = [];
  
  const measureFrameRate = () => {
    const now = performance.now();
    const elapsed = now - lastFrameTime;
    frameCount++;
    
    // Calculate frame rate every second
    if (elapsed >= 1000) {
      const fps = Math.round((frameCount * 1000) / elapsed);
      frameRates.push(fps);
      
      // Keep a reasonable history
      if (frameRates.length > 10) {
        frameRates.shift();
      }
      
      // Calculate average
      const avgFps = Math.round(
        frameRates.reduce((sum, rate) => sum + rate, 0) / frameRates.length
      );
      
      // Log and record if FPS is low
      if (avgFps < 45) {
        console.log(`[Performance] Low frame rate detected: ${avgFps} FPS`);
        recordPerformanceMetric('frame-rate', avgFps, 'fps', {
          threshold: 'low',
          history: [...frameRates]
        });
      } else if (frameRates.length % 5 === 0) {
        // Record every 5 measurements for normal rates
        recordPerformanceMetric('frame-rate', avgFps, 'fps', {
          threshold: 'normal',
          history: [...frameRates]
        });
      }
      
      // Reset counters
      frameCount = 0;
      lastFrameTime = now;
    }
    
    // Continue monitoring
    frameRateMonitorId = requestAnimationFrame(measureFrameRate);
  };
  
  frameRateMonitorId = requestAnimationFrame(measureFrameRate);
};

/**
 * Stop frame rate monitoring
 */
export const stopFrameRateMonitoring = () => {
  if (frameRateMonitorId) {
    cancelAnimationFrame(frameRateMonitorId);
    frameRateMonitorId = null;
  }
};

/**
 * Get all recorded performance metrics
 * @returns {Array} - Array of performance metrics
 */
export const getPerformanceMetrics = () => {
  return [...memoryPerfLogs];
};

/**
 * Clear all performance metrics
 */
export const clearPerformanceMetrics = async () => {
  memoryPerfLogs = [];
  try {
    await AsyncStorage.removeItem(PERF_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear performance metrics:', error);
  }
};

/**
 * Wrap a React component with performance monitoring
 * @param {Component} Component - React component to wrap
 * @param {string} componentName - Name for the component
 * @returns {Component} - Wrapped component with performance monitoring
 */
export const withPerformanceMonitoring = (Component, componentName) => {
  const displayName = componentName || Component.displayName || Component.name || 'Unknown';
  
  // Return a new component that wraps the provided component
  const PerformanceMonitoredComponent = (props) => {
    const startTime = performance.now();
    
    // Measure render time
    const result = <Component {...props} />;
    
    // Measure total render time in the next frame
    InteractionManager.runAfterInteractions(() => {
      const endTime = performance.now();
      recordPerformanceMetric(
        `${displayName}.mount`, 
        endTime - startTime, 
        'component-mount',
        { componentName: displayName }
      );
    });
    
    return result;
  };
  
  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  return PerformanceMonitoredComponent;
};

export default {
  initializePerformanceMonitor,
  recordPerformanceMetric,
  measurePerformance,
  measureRender,
  getPerformanceMetrics,
  clearPerformanceMetrics,
  withPerformanceMonitoring
};
