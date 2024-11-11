<template>
  <div class="X-AXIS COMPONENT text-sm text-slate-400 border-t border-slate-300 mx-1 select-none">
    <ul Dates class="flex flex-row justify-around pt-0.5 text-center whitespace-nowrap h-7 mb-1">
      <li v-if="unitType === 'year'" class="border-slate-300" :style="`min-width: ${unitWidth * 1.2}%`">&nbsp; 2010 &nbsp;</li>
      <li v-for="length in lengths" :key="length" class="border-l border-slate-300" :style="`width: ${lengthWidth}%`">{{ length }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const emit = defineEmits(['phaseenter', 'phaseleave']);

type IUnitType = 'year' | 'decade';

const endingYear = Number('2024') + 1
const years = Array.from({ length: endingYear - 2011 }, (_, index) => 2011 + index);

let unitType: IUnitType = 'year';
let units = 3 + (years.length * 4)

let lengths = [...years];

const unitWidth = 100 / units
const lengthWidth = unitType === 'year' ? unitWidth * 4 : unitWidth;
</script>

<style lang="scss">
.X-AXIS.COMPONENT {
  li::selection      { 
    color: rgb(148 163 184);
    background: white;
  }
  ul[Dates] li:first-child {
    border-left: none;
  }

  [SegmentBg] {
    cursor: pointer;
    &:hover {
      box-shadow: 1px 1px 0 0 rgba(16, 20, 24, 0.7);
    }
  }

  [SegmentBg][isLoading="true"] {
    cursor: default;
    &:hover {
      box-shadow: none;
    }
  }
}
</style>