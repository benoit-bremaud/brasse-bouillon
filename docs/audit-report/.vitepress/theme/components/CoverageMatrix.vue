<script setup>
defineProps({
  cells: { type: Array, default: () => [] }
});
const MARK = { ok: "✓", warn: "!", bad: "✕" };
</script>

<template>
  <div class="bb-matrix">
    <div
      class="bb-cell"
      :class="`bb-cell--${c.state}`"
      v-for="c in cells"
      :key="c.dim"
    >
      <span class="bb-cell__mark">{{ MARK[c.state] }}</span>
      <div>
        <div class="bb-cell__dim">{{ c.dim }}</div>
        <div class="bb-cell__note">{{ c.note }}</div>
      </div>
    </div>
  </div>
</template>
