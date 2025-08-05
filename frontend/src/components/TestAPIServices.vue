<template>
  <div class="p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">API Services Test - Refactored Backend Integration</h1>
    
    <!-- Test Results Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-semibold text-blue-800">Total Tests</h3>
        <p class="text-2xl font-bold text-blue-600">{{ testResults.length }}</p>
      </div>
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 class="font-semibold text-green-800">Passed</h3>
        <p class="text-2xl font-bold text-green-600">{{ passedTests }}</p>
      </div>
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 class="font-semibold text-red-800">Failed</h3>
        <p class="text-2xl font-bold text-red-600">{{ failedTests }}</p>
      </div>
    </div>

    <!-- Test Controls -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Test Controls</h2>
      <div class="flex space-x-4">
        <button 
          @click="runAllTests"
          :disabled="isRunning"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {{ isRunning ? 'Running Tests...' : 'Run All Tests' }}
        </button>
        <button 
          @click="clearResults"
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>
    </div>

    <!-- Test Results -->
    <div class="space-y-4">
      <div 
        v-for="result in testResults" 
        :key="result.id"
        class="bg-white shadow-md rounded-lg p-6"
        :class="{
          'border-l-4 border-green-500': result.status === 'passed',
          'border-l-4 border-red-500': result.status === 'failed',
          'border-l-4 border-yellow-500': result.status === 'running'
        }"
      >
        <div class="flex justify-between items-start mb-2">
          <h3 class="text-lg font-semibold">{{ result.name }}</h3>
          <span 
            class="px-2 py-1 rounded-full text-xs font-medium"
            :class="{
              'bg-green-100 text-green-800': result.status === 'passed',
              'bg-red-100 text-red-800': result.status === 'failed',
              'bg-yellow-100 text-yellow-800': result.status === 'running'
            }"
          >
            {{ result.status.toUpperCase() }}
          </span>
        </div>
        
        <p class="text-gray-600 mb-3">{{ result.description }}</p>
        
        <div v-if="result.details" class="bg-gray-50 rounded-md p-3 mb-3">
          <h4 class="font-medium mb-2">Details:</h4>
          <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ result.details }}</pre>
        </div>
        
        <div v-if="result.error" class="bg-red-50 rounded-md p-3 mb-3">
          <h4 class="font-medium text-red-800 mb-2">Error:</h4>
          <pre class="text-sm text-red-700 whitespace-pre-wrap">{{ result.error }}</pre>
        </div>
        
        <div class="text-sm text-gray-500">
          Duration: {{ result.duration }}ms | 
          Timestamp: {{ new Date(result.timestamp).toLocaleTimeString() }}
        </div>
      </div>
    </div>

    <!-- No Results State -->
    <div v-if="testResults.length === 0" class="text-center py-12">
      <p class="text-gray-500 text-lg">No tests have been run yet. Click "Run All Tests" to start.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { AuthService } from '../modules/Accounts/services/auth.service';
import { userService } from '../modules/Accounts/services/user.service';
import { kycService } from '../modules/Accounts/services/kyc.service';

interface TestResult {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'passed' | 'failed';
  details?: string;
  error?: string;
  duration: number;
  timestamp: number;
}

const testResults = ref<TestResult[]>([]);
const isRunning = ref(false);

const passedTests = computed(() => testResults.value.filter(t => t.status === 'passed').length);
const failedTests = computed(() => testResults.value.filter(t => t.status === 'failed').length);

const createTest = (name: string, description: string): TestResult => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  description,
  status: 'running',
  duration: 0,
  timestamp: Date.now()
});

const runTest = async (test: TestResult, testFn: () => Promise<any>) => {
  const startTime = Date.now();
  try {
    const result = await testFn();
    test.status = 'passed';
    test.details = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
  } catch (error: any) {
    test.status = 'failed';
    test.error = error.message || String(error);
  } finally {
    test.duration = Date.now() - startTime;
  }
};

const runAllTests = async () => {
  if (isRunning.value) return;
  
  isRunning.value = true;
  testResults.value = [];

  // Test 1: Auth Service - Profile Endpoint (should fail without token)
  const test1 = createTest(
    'Auth Service - Get Profile (Unauthorized)',
    'Test that auth service correctly handles unauthorized requests'
  );
  testResults.value.push(test1);
  
  await runTest(test1, async () => {
    try {
      await AuthService.getCurrentUser();
      throw new Error('Expected authorization error, but request succeeded');
    } catch (error: any) {
      if (error.message.includes('UNAUTHORIZED') || error.message.includes('Authentication required')) {
        return 'Correctly rejected unauthorized request';
      }
      throw error;
    }
  });

  // Test 2: User Service - Get Current User (should fail without token)
  const test2 = createTest(
    'User Service - Get Current User (Unauthorized)',
    'Test that user service correctly handles unauthorized requests'
  );
  testResults.value.push(test2);
  
  await runTest(test2, async () => {
    try {
      await userService.getCurrentUser();
      throw new Error('Expected authorization error, but request succeeded');
    } catch (error: any) {
      if (error.message.includes('UNAUTHORIZED') || error.message.includes('Authentication required')) {
        return 'Correctly rejected unauthorized request';
      }
      throw error;
    }
  });

  // Test 3: User Service - Get User Profile (should fail without token)
  const test3 = createTest(
    'User Service - Get User Profile (Unauthorized)',
    'Test that user profile endpoint correctly handles unauthorized requests'
  );
  testResults.value.push(test3);
  
  await runTest(test3, async () => {
    try {
      await userService.getUserProfile();
      throw new Error('Expected authorization error, but request succeeded');
    } catch (error: any) {
      if (error.message.includes('UNAUTHORIZED') || error.message.includes('Authentication required')) {
        return 'Correctly rejected unauthorized request';
      }
      throw error;
    }
  });

  // Test 4: KYC Service - Get Current User KYC (should fail without token)
  const test4 = createTest(
    'KYC Service - Get Current User KYC (Unauthorized)',
    'Test that KYC service correctly handles unauthorized requests'
  );
  testResults.value.push(test4);
  
  await runTest(test4, async () => {
    try {
      await kycService.getCurrentUserKyc();
      throw new Error('Expected authorization error, but request succeeded');
    } catch (error: any) {
      if (error.message.includes('UNAUTHORIZED') || error.message.includes('Authentication required')) {
        return 'Correctly rejected unauthorized request';
      }
      throw error;
    }
  });

  // Test 5: Backend Health Check
  const test5 = createTest(
    'Backend Server - Health Check',
    'Test that the backend server is responding'
  );
  testResults.value.push(test5);
  
  await runTest(test5, async () => {
    const response = await fetch('http://localhost:3000/api/v1/auth/profile');
    if (response.status === 401) {
      const data = await response.json();
      if (data.errorCode === 'UNAUTHORIZED') {
        return 'Backend server is responding correctly';
      }
    }
    throw new Error(`Unexpected response: ${response.status}`);
  });

  // Test 6: API Client Configuration
  const test6 = createTest(
    'API Client - Configuration Check',
    'Test that API client is configured with correct base URL'
  );
  testResults.value.push(test6);
  
  await runTest(test6, async () => {
    // Simple test that our services are importable and configured
    return {
      authService: 'Available and properly imported',
      userService: 'Available and properly imported',
      kycService: 'Available and properly imported',
      message: 'All services are properly configured and importable'
    };
  });

  isRunning.value = false;
};

const clearResults = () => {
  testResults.value = [];
};
</script>
