<script setup>
defineProps({
  kicker: { type: String, default: "Audit qualité & sécurité" },
  verdict: { type: String, default: "" },
  emphasis: { type: String, default: "" },
  sub: { type: String, default: "" },
  meta: { type: Array, default: () => [] }
});
</script>

<template>
  <section class="bb-hero">
    <p class="bb-hero__kicker">{{ kicker }}</p>
    <h1 class="bb-hero__verdict">
      {{ verdict }} <em v-if="emphasis">{{ emphasis }}</em>
    </h1>
    <p class="bb-hero__sub">{{ sub }}</p>
    <div class="bb-hero__meta">
      <span v-for="m in meta" :key="m.label">
        {{ m.label }} <b>{{ m.value }}</b>
      </span>
    </div>
  </section>
</template>
