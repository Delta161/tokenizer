<script setup lang="ts">
import { defineProps } from 'vue';

interface FooterLink {
  text: string;
  url: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  icon: string;
  url: string;
  label: string;
}

interface Props {
  logo?: string;
  logoAlt?: string;
  companyName?: string;
  description?: string;
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  copyrightText?: string;
  backgroundColor?: string;
  textColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  logo: '',
  logoAlt: 'Company Logo',
  companyName: 'Tokenizer',
  description: 'Revolutionizing real estate investment through blockchain technology and tokenization.',
  columns: () => [
    {
      title: 'Platform',
      links: [
        { text: 'How it works', url: '#' },
        { text: 'Features', url: '#' },
        { text: 'Security', url: '#' },
        { text: 'Pricing', url: '#' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { text: 'Blog', url: '#' },
        { text: 'Documentation', url: '#' },
        { text: 'FAQ', url: '#' },
        { text: 'API', url: '#' }
      ]
    },
    {
      title: 'Company',
      links: [
        { text: 'About us', url: '#' },
        { text: 'Careers', url: '#' },
        { text: 'Contact', url: '#' },
        { text: 'Press', url: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { text: 'Terms', url: '#' },
        { text: 'Privacy', url: '#' },
        { text: 'Cookies', url: '#' },
        { text: 'Licenses', url: '#' }
      ]
    }
  ],
  socialLinks: () => [
    { icon: '📱', url: '#', label: 'Twitter' },
    { icon: '💼', url: '#', label: 'LinkedIn' },
    { icon: '📷', url: '#', label: 'Instagram' },
    { icon: '📺', url: '#', label: 'YouTube' }
  ],
  copyrightText: `© ${new Date().getFullYear()} Tokenizer. All rights reserved.`,
  backgroundColor: '#1f2937',
  textColor: '#f9fafb'
});
</script>

<template>
  <footer 
    class="footer" 
    :style="{
      backgroundColor: props.backgroundColor,
      color: props.textColor
    }"
  >
    <div class="container">
      <div class="footer-content">
        <div class="company-info">
          <div class="logo-container">
            <img v-if="props.logo" :src="props.logo" :alt="props.logoAlt" class="logo" />
            <h2 v-else class="company-name">{{ props.companyName }}</h2>
          </div>
          <p class="company-description">{{ props.description }}</p>
          <div class="social-links">
            <a 
              v-for="(social, index) in props.socialLinks" 
              :key="index"
              :href="social.url"
              :aria-label="social.label"
              class="social-link"
            >
              {{ social.icon }}
            </a>
          </div>
        </div>
        
        <div class="footer-links-columns">
          <div 
            v-for="(column, index) in props.columns" 
            :key="index"
            class="footer-column"
          >
            <h3 class="column-title">{{ column.title }}</h3>
            <ul class="link-list">
              <li v-for="(link, linkIndex) in column.links" :key="linkIndex">
                <a :href="link.url" class="footer-link">{{ link.text }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright">{{ props.copyrightText }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 4rem 2rem 2rem;
}

.container {
  max-width: var(--container-max-width, 1200px);
  margin: 0 auto;
  width: 100%;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  margin-bottom: 3rem;
}

.company-info {
  max-width: 20rem;
}

.logo {
  height: 2.5rem;
  margin-bottom: 1rem;
}

.company-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.company-description {
  margin-bottom: 1.5rem;
  opacity: 0.8;
  line-height: 1.5;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  transition: background-color 0.3s ease;
  text-decoration: none;
  color: inherit;
  font-size: 1.25rem;
}

.social-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.footer-links-columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.column-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.link-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.link-list li {
  margin-bottom: 0.75rem;
}

.footer-link {
  color: inherit;
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.footer-link:hover {
  opacity: 1;
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.copyright {
  opacity: 0.6;
  font-size: 0.875rem;
}

@media (max-width: 1024px) {
  .footer-links-columns {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 3rem 1rem 1.5rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .company-info {
    max-width: 100%;
  }
  
  .footer-links-columns {
    grid-template-columns: 1fr;
  }
}
</style>