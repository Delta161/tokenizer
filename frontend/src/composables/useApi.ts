import { ref } from 'vue';

export function useApi() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, body?: unknown): Promise<T> {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`/api${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!response.ok) throw new Error('API error');
      return await response.json();
    } catch (err) {
      error.value = (err as Error).message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return { request, loading, error };
}