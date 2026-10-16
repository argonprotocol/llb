<template>
  <div ChartOpaque class="opacity-70"></div>
</template>

<style lang="scss" scoped>
[ChartOpaque] {
  background: var(--sam-background);
  &:before {
    content: '';
    display: block;
    position: absolute;
    bottom: 1px;
    left: 0;
    width: 100%;
    height: 50%;
    background: var(--sam-surface);
  }
  &:after {
    content: '';
    display: block;
    position: absolute;
    bottom: calc(25% + 1px);
    left: 0px;
    width: 100%;
    height: 25%;
    background: linear-gradient(to bottom, var(--sam-background), rgba(var(--sam-background-rgb), 0));
    z-index: 1;
  }
}
</style>