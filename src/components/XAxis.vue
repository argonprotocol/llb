<template>
  <div class="chart-axis relative h-8 border-t border-slate-300 text-xs text-slate-500">
    <div class="desktop:hidden"><span v-for="tick in ticks" :key="tick.label" class="absolute top-1 -translate-x-1/2" :style="{ left: `clamp(1.25rem, ${tick.x}px, calc(100% - 1.25rem))` }">{{ tick.label }}</span></div>
    <ul class="desktop-years"><li v-for="year in years" :key="year.label" :style="{ left: year.x + 'px', width: year.width + 'px' }"><span>{{ year.label }}</span></li></ul>
  </div>
</template>
<script setup lang="ts">
defineProps<{ ticks: { label: string; x: number }[]; years: { label: string; x: number; width: number }[] }>();
</script>
<style scoped>
.desktop-years { display: none; }
@screen desktop {
  .chart-axis { height: 33px; color: #94a3b8; font-size: 14px; line-height: 20px; user-select: none; }
  .desktop-years { display: block; position: relative; height: 28px; margin-bottom: 4px; text-align: center; white-space: nowrap; }
  .desktop-years li { position: absolute; top: 2px; height: 24px; border-left: 1px solid #cbd5e1; }
  .desktop-years li span { position: absolute; top: 4px; left: 50%; transform: translateX(-50%); }
  .desktop-years li:first-child { border-left: 0; }
}
</style>
