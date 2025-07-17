import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PropertyCard from '../PropertyCard.vue';

describe('PropertyCard', () => {
  it('renders property name', () => {
    const wrapper = mount(PropertyCard, {
      props: {
        property: {
          id: 1,
          name: 'Test Property',
          description: 'Test desc',
          price: 1.5,
          image: 'test.jpg'
        }
      }
    });
    expect(wrapper.text()).toContain('Test Property');
  });
});