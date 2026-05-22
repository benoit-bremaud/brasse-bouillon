<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] }
});

function color(v) {
  if (v >= 90) return "var(--sev-ok)";
  if (v >= 50) return "var(--sev-medium)";
  return "var(--sev-critical)";
}
</script>

<template>
  <div class="bb-gauges">
    <div class="bb-gauge" v-for="g in items" :key="g.label">
      <div class="bb-gauge__ring" :style="{ '--val': g.value, '--col': color(g.value) }">
        <span class="bb-gauge__num">{{ g.value }}</span>
      </div>
      <div class="bb-gauge__label">{{ g.label }}</div>
    </div>
  </div>
</template>
