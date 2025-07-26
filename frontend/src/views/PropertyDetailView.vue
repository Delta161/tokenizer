<template>
  <div class="property-detail-view">
    <!-- This content will be rendered in the header slot of PropertiesLayout -->
    <template #header>
      <div class="property-header flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Property Name</h1>
          <p class="text-gray-600">123 Main Street, City, State</p>
        </div>
        <div class="flex space-x-4">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Contact Agent
          </button>
          <button class="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">
            Save Property
          </button>
        </div>
      </div>
    </template>
    
    <!-- This content will be rendered in the main slot of PropertiesLayout -->
    <div class="property-content">
      <div class="bg-gray-200 h-96 w-full rounded-lg mb-6"></div>
      
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Property Details</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="detail-item">
            <span class="font-medium">Price:</span> $750,000
          </div>
          <div class="detail-item">
            <span class="font-medium">Bedrooms:</span> 4
          </div>
          <div class="detail-item">
            <span class="font-medium">Bathrooms:</span> 3
          </div>
          <div class="detail-item">
            <span class="font-medium">Square Feet:</span> 2,500
          </div>
          <div class="detail-item">
            <span class="font-medium">Year Built:</span> 2018
          </div>
          <div class="detail-item">
            <span class="font-medium">Property Type:</span> Single Family
          </div>
        </div>
      </div>
      
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">Description</h2>
        <p class="text-gray-700">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus.
        </p>
      </div>
      
      <div>
        <h2 class="text-2xl font-bold mb-4">Features</h2>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <li class="flex items-center"><span class="mr-2">✓</span> Feature 1</li>
          <li class="flex items-center"><span class="mr-2">✓</span> Feature 2</li>
          <li class="flex items-center"><span class="mr-2">✓</span> Feature 3</li>
          <li class="flex items-center"><span class="mr-2">✓</span> Feature 4</li>
          <li class="flex items-center"><span class="mr-2">✓</span> Feature 5</li>
          <li class="flex items-center"><span class="mr-2">✓</span> Feature 6</li>
        </ul>
      </div>
    </div>
    
    <!-- This content will be rendered in the sidebar slot of PropertiesLayout -->
    <template #sidebar>
      <div class="property-sidebar">
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 class="text-xl font-bold mb-4">Contact Agent</h3>
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-gray-300 rounded-full mr-3"></div>
            <div>
              <p class="font-medium">John Doe</p>
              <p class="text-gray-600 text-sm">Real Estate Agent</p>
            </div>
          </div>
          <div class="mb-4">
            <p class="text-gray-700"><span class="font-medium">Phone:</span> (123) 456-7890</p>
            <p class="text-gray-700"><span class="font-medium">Email:</span> john@example.com</p>
          </div>
          <button class="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Send Message
          </button>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4">
          <h3 class="text-xl font-bold mb-4">Similar Properties</h3>
          <div class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex">
              <div class="w-20 h-20 bg-gray-200 rounded-md mr-3"></div>
              <div>
                <p class="font-medium">Similar Property {{ i }}</p>
                <p class="text-gray-600 text-sm">${{ 600000 + (i * 50000) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// Component logic will go here
</script>

<style scoped>
.property-content {
  max-width: 100%;
}

.detail-item {
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}
</style>