<script setup>
defineProps({
  id: { type: String, default: "" },
  href: { type: String, default: "" },
  title: { type: String, default: "" },
  sev: { type: String, default: "high" },
  status: { type: String, default: "todo" },
  tags: { type: Array, default: () => [] },
  evidence: { type: String, default: "" }
});
const REPO = "https://github.com/benoit-bremaud/brasse-bouillon/issues/";
</script>

<template>
  <article class="bb-finding" :data-sev="sev">
    <div class="bb-finding__top">
      <a
        v-if="id"
        class="bb-finding__id"
        :href="href || REPO + id.replace('#', '')"
        target="_blank"
        rel="noopener"
        >{{ id }}</a
      >
      <span class="bb-finding__title">{{ title }}</span>
      <StatusBadge :state="status" />
      <SeverityBadge :level="sev" />
    </div>
    <div class="bb-finding__body"><slot /></div>
    <pre v-if="evidence" class="bb-finding__evidence">{{ evidence }}</pre>
    <div class="bb-finding__tags" v-if="tags.length">
      <span class="bb-tag" v-for="t in tags" :key="t">{{ t }}</span>
    </div>
  </article>
</template>
