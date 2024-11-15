<template>
  <div class="Tour Component z-[2000]" :style="stepVars">
    <div StepBackgroundCircle v-if="tourStep === 4">
      <div StepBorderCircle></div>
      <MoreInfoMenu ref="moreInfoMenuRef" class="MoreInfoMenu" />
    </div>
    <div StepWrapper v-else>
      <div StepBackground></div>    
      <div StepBorder></div>
    </div>
  </div>
  <TourStepOne @nextStep="nextStep(2)" :pos="tourPos" v-if="tourStep === 1" />
  <TourStepTwo @previousStep="previousStep(1)" @nextStep="nextStep(3)" :pos="tourPos" v-if="tourStep === 2" />
  <TourStepThree @previousStep="previousStep(2)" @nextStep="nextStep(4)" :pos="tourPos" v-if="tourStep === 3" />
  <TourStepFour @previousStep="previousStep(3)" @nextStep="nextStep(5)" :pos="tourPos" v-if="tourStep === 4" />
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import { storeToRefs } from 'pinia';
import { useBasicStore } from '../store';
import TourStepOne from '../overlays/TourStepOne.vue';
import TourStepTwo from '../overlays/TourStepTwo.vue';
import TourStepThree from '../overlays/TourStepThree.vue';
import TourStepFour from '../overlays/TourStepFour.vue';
import MoreInfoMenu from '../components/MoreInfoMenu.vue';

const basicStore = useBasicStore();
const { tourStep, finishedWelcomeOverlay } = storeToRefs(basicStore);

const stepVars = Vue.ref({});
const tourPos = Vue.ref({});
const moreInfoMenuRef = Vue.ref<typeof MoreInfoMenu | null>(null);

function updateStepVars() {
  let rect = { left: 0, top: 0, right: 0, bottom: 0 };

  if (tourStep.value === 1) {
    rect = basicStore.getPositionCheck('nibSliders');
    rect.bottom = window.innerHeight;
  } else if (tourStep.value === 2) {
    rect = basicStore.getPositionCheck('configSection');
  } else if (tourStep.value === 3) {
    rect = basicStore.getPositionCheck('scoreboard');
    rect.top = 0;
  } else if (tourStep.value === 4) {
    rect = basicStore.getPositionCheck('informationIcon');
  }

  if (tourStep.value === 4) {
    rect.left = rect.left - 10;
    rect.right = rect.right + 10;
    rect.bottom = rect.bottom + 10;
    rect.top = rect.top - 10;
  } else {
    rect.left = rect.left - 25;
    rect.right = rect.right + 25;
    rect.bottom = Math.min(rect.bottom + 25, window.innerHeight);
    rect.top = Math.max(rect.top - 25, 0);
  }

  tourPos.value = rect;

  stepVars.value = {
    '--leftPos': `${rect.left}px`,
    '--topPos': `${rect.top}px`,
    '--rightPos': `${rect.right}px`,
    '--bottomPos': `${rect.bottom}px`,
  };
}

const previousStep = (previousStep: number) => {
  tourStep.value = previousStep;
  updateStepVars();
};

const nextStep = (nextStep: number) => {
  if (nextStep === 5) {
    tourStep.value = 0;
    finishedWelcomeOverlay.value = true;
    return;
  }
  tourStep.value = nextStep;
  updateStepVars();
};

let interval: any = null;;

Vue.onMounted(() => {
  updateStepVars();
  interval = setInterval(updateStepVars, 100);
});

Vue.onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
});
</script>

<style lang="scss">
.Tour.Component {
  .MoreInfoMenu {
    position: absolute;
    top: calc(var(--topPos) + 10px);
    left: calc(var(--leftPos) + 5px);
    z-index: 2001;
  }

  [StepWrapper] {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    filter: drop-shadow(2px 2px 2px rgba(50, 50, 0, 0.6));
    pointer-events: none;
  }

  [StepBackground] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    pointer-events: all;
    clip-path: polygon(
      0 0, 
      100% 0, 
      100% 100%, 
      0 100%, 
      0 var(--topPos), /* Top of cutout */
      var(--leftPos) var(--topPos), /* Left side of cutout */
      var(--leftPos) var(--bottomPos), /* Bottom of cutout */
      var(--rightPos) var(--bottomPos), /* Right side of cutout */
      var(--rightPos) var(--topPos), /* Back to top of cutout */
      0 var(--topPos)
    );
  }

  [StepBorder] {
    position: absolute;
    top: var(--topPos);
    left: var(--leftPos);
    width: calc(var(--rightPos) - var(--leftPos));
    bottom: calc(100% - var(--bottomPos));
    border: 1px solid rgba(0, 0, 0, 0.5);
    border-bottom: none;
    z-index: 2000;
    pointer-events: none;
  }

  [StepBackgroundCircle] {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    pointer-events: all;
  }

  [StepBorderCircle] {
    position: absolute;
    top: var(--topPos);
    left: var(--leftPos);
    width: calc(var(--rightPos) - var(--leftPos));
    height: calc(var(--bottomPos) - var(--topPos));
    border: 1px solid rgba(0, 0, 0, 0.5);
    border-radius: 100%;
    z-index: 2000;
    background: #E6EAF3;
    pointer-events: none;
  }
}
</style>