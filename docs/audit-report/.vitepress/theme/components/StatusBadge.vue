<script setup>
defineProps({
  state: { type: String, default: "todo" } // todo | doing | done
});
const TEXT = { todo: "À faire", doing: "En cours", done: "Fait" };
const MARK = { todo: "○", doing: "◐", done: "✓" };
</script>

<template>
  <span class="bb-status" :class="`bb-status--${state}`" :title="TEXT[state]">
    <span class="bb-status__mark">{{ MARK[state] }}</span>{{ TEXT[state] }}
  </span>
</template>
