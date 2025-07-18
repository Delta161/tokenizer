<script setup>
import { ref, onMounted } from 'vue';
import { useFeatureFlags } from '../utils/featureFlags';

// Use the feature flags composable
const { 
  isLoading, 
  error, 
  fetchFeatureFlags, 
  isFeatureEnabled,
  isDarkModeEnabled,
  isNewDashboardEnabled,
  isAdvancedAnalyticsEnabled,
  isBetaFeaturesEnabled
} = useFeatureFlags();

// Fetch flags when component is mounted
onMounted(() => {
  fetchFeatureFlags();
});

// Toggle state for demo purposes
const showAllFlags = ref(false);
</script>

<template>
  <div class="feature-flag-demo" :class="{ 'dark-mode': isDarkModeEnabled }">
    <h2>Feature Flags Demo</h2>
    
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Loading feature flags...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchFeatureFlags">Retry</button>
    </div>
    
    <div v-else class="content">
      <!-- Feature flag status indicators -->
      <div class="feature-flags-status">
        <h3>Active Features</h3>
        <ul class="feature-list">
          <li :class="{ enabled: isDarkModeEnabled }">
            <span class="feature-name">Dark Mode</span>
            <span class="feature-status">{{ isDarkModeEnabled ? 'Enabled' : 'Disabled' }}</span>
          </li>
          <li :class="{ enabled: isNewDashboardEnabled }">
            <span class="feature-name">New Dashboard</span>
            <span class="feature-status">{{ isNewDashboardEnabled ? 'Enabled' : 'Disabled' }}</span>
          </li>
          <li :class="{ enabled: isAdvancedAnalyticsEnabled }">
            <span class="feature-name">Advanced Analytics</span>
            <span class="feature-status">{{ isAdvancedAnalyticsEnabled ? 'Enabled' : 'Disabled' }}</span>
          </li>
          <li :class="{ enabled: isBetaFeaturesEnabled }">
            <span class="feature-name">Beta Features</span>
            <span class="feature-status">{{ isBetaFeaturesEnabled ? 'Enabled' : 'Disabled' }}</span>
          </li>
          <li :class="{ enabled: isFeatureEnabled('NEW_EXAMPLE_FEATURE') }">
            <span class="feature-name">New Example Feature</span>
            <span class="feature-status">{{ isFeatureEnabled('NEW_EXAMPLE_FEATURE') ? 'Enabled' : 'Disabled' }}</span>
          </li>
        </ul>
        
        <button @click="showAllFlags = !showAllFlags" class="toggle-button">
          {{ showAllFlags ? 'Hide All Flags' : 'Show All Flags' }}
        </button>
        
        <div v-if="showAllFlags" class="all-flags">
          <h4>All Feature Flags</h4>
          <table>
            <thead>
              <tr>
                <th>Flag Key</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(enabled, key) in featureFlags" :key="key" :class="{ enabled }">
                <td>{{ key }}</td>
                <td>{{ enabled ? 'Enabled' : 'Disabled' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Conditional UI based on feature flags -->
      <div class="feature-demos">
        <h3>Feature Demonstrations</h3>
        
        <!-- Dark Mode Demo -->
        <div class="feature-demo-card">
          <h4>Dark Mode</h4>
          <div class="demo-content" :class="{ 'dark-theme': isDarkModeEnabled }">
            <p>This card demonstrates the dark mode feature flag.</p>
            <p v-if="isDarkModeEnabled">Dark mode is currently <strong>enabled</strong>.</p>
            <p v-else>Dark mode is currently <strong>disabled</strong>.</p>
          </div>
        </div>
        
        <!-- New Dashboard Demo -->
        <div class="feature-demo-card">
          <h4>Dashboard</h4>
          <div class="demo-content">
            <div v-if="isNewDashboardEnabled" class="new-dashboard">
              <p>You are viewing the <strong>new dashboard design</strong>!</p>
              <div class="dashboard-preview new">
                <div class="widget"></div>
                <div class="widget"></div>
                <div class="widget small"></div>
                <div class="widget small"></div>
              </div>
            </div>
            <div v-else class="old-dashboard">
              <p>You are viewing the <strong>classic dashboard design</strong>.</p>
              <div class="dashboard-preview old">
                <div class="widget"></div>
                <div class="widget"></div>
                <div class="widget"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Advanced Analytics Demo -->
        <div class="feature-demo-card">
          <h4>Analytics</h4>
          <div class="demo-content">
            <div v-if="isAdvancedAnalyticsEnabled" class="advanced-analytics">
              <p>You have access to <strong>advanced analytics</strong>!</p>
              <div class="analytics-preview advanced">
                <div class="chart"></div>
                <div class="metrics">
                  <div class="metric"></div>
                  <div class="metric"></div>
                  <div class="metric"></div>
                </div>
              </div>
            </div>
            <div v-else class="basic-analytics">
              <p>You have access to <strong>basic analytics</strong>.</p>
              <div class="analytics-preview basic">
                <div class="chart"></div>
                <div class="metrics">
                  <div class="metric"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feature-flag-demo {
  padding: 20px;
  border-radius: 8px;
  background-color: #f8f9fa;
  max-width: 900px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.feature-flag-demo.dark-mode {
  background-color: #2c3e50;
  color: #ecf0f1;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  padding: 20px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  margin-bottom: 20px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.feature-flags-status {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dark-mode .feature-flags-status {
  background-color: #34495e;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.dark-mode .feature-list li {
  border-bottom-color: #4a6278;
}

.feature-list li:last-child {
  border-bottom: none;
}

.feature-list li.enabled {
  background-color: #e8f4fd;
}

.dark-mode .feature-list li.enabled {
  background-color: #2980b9;
}

.feature-status {
  font-weight: bold;
}

.enabled .feature-status {
  color: #2ecc71;
}

.dark-mode .enabled .feature-status {
  color: #7bed9f;
}

.toggle-button {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-button:hover {
  background-color: #2980b9;
}

.all-flags {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.dark-mode th, .dark-mode td {
  border-bottom-color: #4a6278;
}

tr.enabled {
  background-color: #e8f4fd;
}

.dark-mode tr.enabled {
  background-color: #2980b9;
}

.feature-demos {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-demo-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dark-mode .feature-demo-card {
  background-color: #34495e;
}

.feature-demo-card h4 {
  margin: 0;
  padding: 15px 20px;
  background-color: #f1f1f1;
  border-bottom: 1px solid #eee;
}

.dark-mode .feature-demo-card h4 {
  background-color: #2c3e50;
  border-bottom-color: #4a6278;
}

.demo-content {
  padding: 20px;
}

.demo-content.dark-theme {
  background-color: #2c3e50;
  color: #ecf0f1;
}

/* Dashboard demo styles */
.dashboard-preview {
  height: 150px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
}

.dark-mode .dashboard-preview {
  background-color: #2c3e50;
}

.dashboard-preview.new {
  background-color: #e8f4fd;
}

.dark-mode .dashboard-preview.new {
  background-color: #3498db;
}

.widget {
  background-color: white;
  border-radius: 4px;
  flex: 1 1 calc(50% - 10px);
  min-width: 100px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark-mode .widget {
  background-color: #34495e;
}

.widget.small {
  flex: 1 1 calc(25% - 10px);
}

/* Analytics demo styles */
.analytics-preview {
  height: 200px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 15px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.dark-mode .analytics-preview {
  background-color: #2c3e50;
}

.analytics-preview.advanced {
  background-color: #e8f4fd;
}

.dark-mode .analytics-preview.advanced {
  background-color: #3498db;
}

.chart {
  height: 100px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark-mode .chart {
  background-color: #34495e;
}

.metrics {
  display: flex;
  gap: 10px;
  flex: 1;
}

.metric {
  flex: 1;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark-mode .metric {
  background-color: #34495e;
}
</style>