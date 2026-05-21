<script setup>
defineProps({
  items: { type: Array, default: () => [] }
});
</script>

<template>
  <div class="bb-stats">
    <div class="bb-stat" v-for="s in items" :key="s.label" :style="{ '--col': s.color || 'var(--bb-copper)' }">
      <div class="bb-stat__num">{{ s.num }}</div>
      <div class="bb-stat__label">{{ s.label }}</div>
    </div>
  </div>
</template>
