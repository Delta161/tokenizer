<template>
  <div class="client-info">
    <div v-if="loading" class="loading">
      Loading client information...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="client" class="info-container">
      <h3 class="company-name">{{ client.companyName }}</h3>
      
      <div class="status-badge" :class="statusColor">
        {{ formattedStatus }}
      </div>
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Contact Email</div>
          <div class="info-value">{{ client.contactEmail }}</div>
        </div>
        
        <div class="info-item" v-if="client.contactPhone">
          <div class="info-label">Contact Phone</div>
          <div class="info-value">{{ client.contactPhone }}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Country</div>
          <div class="info-value">{{ client.country }}</div>
        </div>
        
        <div class="info-item" v-if="client.legalEntityNumber">
          <div class="info-label">Legal Entity Number</div>
          <div class="info-value">{{ client.legalEntityNumber }}</div>
        </div>
        
        <div class="info-item" v-if="client.walletAddress">
          <div class="info-label">Wallet Address</div>
          <div class="info-value">{{ client.walletAddress }}</div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-data">
      No client information available
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import type { Client } from '../types/Client'
import { formatClientStatus, getStatusColor } from '../utils/clientUtils'

const props = defineProps({
  client: {
    type: Object as PropType<Client | null>,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const formattedStatus = computed(() => {
  return props.client ? formatClientStatus(props.client.status) : ''
})

const statusColor = computed(() => {
  return props.client ? getStatusColor(props.client.status) : ''
})
</script>

<style scoped>
.client-info {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
}

.company-name {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 15px;
}

.text-warning {
  background-color: #fff3cd;
  color: #856404;
}

.text-success {
  background-color: #d4edda;
  color: #155724;
}

.text-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.text-secondary {
  background-color: #e2e3e5;
  color: #383d41;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  margin-bottom: 10px;
}

.info-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 4px;
}

.info-value {
  font-weight: 500;
}

.loading, .error, .no-data {
  padding: 15px;
  border-radius: 4px;
  text-align: center;
}

.loading {
  background-color: #f8f9fa;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}

.no-data {
  background-color: #f8f9fa;
  color: #6c757d;
}
</style>