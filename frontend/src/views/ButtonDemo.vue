<script setup lang="ts">
import Button from '@/components/Button.vue';
import ButtonGroup from '@/components/ButtonGroup.vue';
</script>

<template>
  <div class="button-demo">
    <h1>Button Component Demo</h1>
    
    <section class="demo-section">
      <h2>Button Variants</h2>
      <div class="buttons-container">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="success">Success</Button>
      </div>
    </section>
    
    <section class="demo-section">
      <h2>Button Sizes</h2>
      <div class="buttons-container">
        <Button size="sm">Small</Button>
        <Button>Medium (Default)</Button>
        <Button size="lg">Large</Button>
      </div>
    </section>
    
    <section class="demo-section">
      <h2>Disabled State</h2>
      <div class="buttons-container">
        <Button disabled>Disabled Primary</Button>
        <Button variant="secondary" disabled>Disabled Secondary</Button>
        <Button variant="outline" disabled>Disabled Outline</Button>
      </div>
    </section>
    
    <section class="demo-section">
      <h2>Full Width</h2>
      <div class="full-width-container">
        <Button fullWidth>Full Width Button</Button>
      </div>
    </section>
    
    <section class="demo-section">
      <h2>Button Groups</h2>
      <h3>Horizontal Group</h3>
      <ButtonGroup>
        <Button>Left</Button>
        <Button>Middle</Button>
        <Button>Right</Button>
      </ButtonGroup>
      
      <h3>Vertical Group</h3>
      <ButtonGroup vertical>
        <Button>Top</Button>
        <Button>Middle</Button>
        <Button>Bottom</Button>
      </ButtonGroup>
      
      <h3>Different Gap Sizes</h3>
      <div class="gap-examples">
        <div>
          <p>Small Gap</p>
          <ButtonGroup gap="sm">
            <Button>One</Button>
            <Button>Two</Button>
            <Button>Three</Button>
          </ButtonGroup>
        </div>
        
        <div>
          <p>Medium Gap (Default)</p>
          <ButtonGroup>
            <Button>One</Button>
            <Button>Two</Button>
            <Button>Three</Button>
          </ButtonGroup>
        </div>
        
        <div>
          <p>Large Gap</p>
          <ButtonGroup gap="lg">
            <Button>One</Button>
            <Button>Two</Button>
            <Button>Three</Button>
          </ButtonGroup>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.button-demo {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--container-padding);
}

h1 {
  margin-bottom: 2rem;
  text-align: center;
}

.demo-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background-color: var(--color-surface);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
}

h2 {
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

h3 {
  margin: 2rem 0 1rem;
  color: var(--color-text);
}

.buttons-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.full-width-container {
  width: 100%;
}

.gap-examples {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.gap-examples p {
  margin-bottom: 0.5rem;
  color: var(--color-text-light);
}

@media (max-width: 768px) {
  .buttons-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .gap-examples {
    gap: 3rem;
  }
}
</style>