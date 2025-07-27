import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PropertyCardSection from '../../sections/property/ProjectCard.section.vue';
import type { Project } from '../../types/Project';

describe('PropertyCardSection', () => {
  it('renders project title', () => {
    const mockProject: Project = {
      id: '1',
      projectTitle: 'Test Project',
      location: 'Test Location',
      description: 'Test description',
      tokenSymbol: 'TEST',
      totalTokens: 1000,
      pricePerToken: 100,
      expectedYield: 10,
      price: 150000,
      tokenPrice: 100,
      minInvestment: 1000,
      irr: 12.5,
      apr: 8.5,
      valueGrowth: 15.2,
      tokensAvailable: 500,
      imageUrls: ['test.jpg'],
      tag: 'Commercial',
      tags: ['Commercial', 'High Yield'],
      visitsThisWeek: 25,
      totalVisitors: 150,
      isFavorite: false,
      country: 'USA'
    };

    const wrapper = mount(PropertyCardSection, {
      props: {
        property: mockProject
      }
    });
    expect(wrapper.text()).toContain('Test Project');
  });
});