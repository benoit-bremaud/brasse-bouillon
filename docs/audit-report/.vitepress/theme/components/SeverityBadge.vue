<script setup>
defineProps({
  level: { type: String, default: "high" },
  label: { type: String, default: "" }
});
const TEXT = {
  critical: "Critique",
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
  ok: "Conforme"
};
</script>

<template>
  <span class="bb-sev" :class="`bb-sev--${level}`">{{ label || TEXT[level] }}</span>
</template>
