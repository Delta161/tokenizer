<template>
  <div class="p-4 bg-white shadow rounded-lg">
    <h2 class="text-lg font-semibold mb-4">Component Examples</h2>
    <nav class="space-y-2">
      <router-link 
        to="/examples/user-role-badge" 
        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        active-class="bg-blue-50 text-blue-700 font-medium"
      >
        UserRoleBadge Example
      </router-link>
      <!-- Add more example links here as needed -->
    </nav>
  </div>
</template>