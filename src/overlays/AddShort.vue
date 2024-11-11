<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog class="relative z-[2000]" @close="isOpen = false">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <DialogTitle as="h3" class="text-lg font-semibold text-gray-900">Add New Price Drop</DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">Choose a date and price for the Argon to drop below its target. The simulation will then react to the drop using the Argon protocol, which allows your vaulted bitcoin to cover the short.</p>
                  <div class="flex flex-col gap-2 mt-2">
                    <div>
                      <DatePicker v-model="date" timezone="UTC" :min-date="minDate" :max-date="maxDate" :disabled-dates="disabledDates" is-required>
                        <template #default="{ togglePopover }">
                          <label for="drop" class="mb-1 block text-sm/6 font-medium text-gray-900">Date of Drop</label>
                          <div class="relative rounded-md shadow-sm">
                            <div @click="togglePopover" :class="date ? 'text-gray-900' : 'text-gray-400'" class="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6">
                              {{ date ? dayjs.utc(date).format('MMMM D, YYYY') : 'Select Date' }}
                            </div>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              <CalendarIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                          </div>
                        </template>
                      </DatePicker>
                    </div>

                    <div>
                      <label for="price" class="mb-1 block text-sm/6 font-medium text-gray-900">Lowest Price</label>
                      <div class="relative rounded-md shadow-sm">
                        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span class="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input type="text" v-model="lowestPrice" name="price" id="price" class="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6" placeholder="0.001" />
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <span class="text-gray-500 sm:text-sm" id="price-currency">USD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-7 sm:flex sm:flex-row-reverse">
                <button type="button" class="inline-flex w-full justify-center rounded-md bg-fuchsia-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-fuchsia-500 sm:ml-3 sm:w-auto" @click="insert">Insert</button>
                <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto" @click="isOpen = false" ref="cancelButtonRef">Cancel</button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import * as Vue from 'vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import { DatePicker } from '@angelblanco/v-calendar';
import emitter from '../emitters/basic';
import { CalendarIcon } from '@heroicons/vue/24/outline';

dayjs.extend(utc);

const isOpen = Vue.ref(false);
const date = Vue.ref();
const lowestPrice = Vue.ref(0.001);

const minDate = Vue.ref();
const maxDate = Vue.ref();
const disabledDates = Vue.ref([]);

function insert() {
  if (!date.value || !lowestPrice.value) return;
  emitter.emit('addShort', { 
    date: dayjs.utc(date.value), 
    lowestPrice: Number(lowestPrice.value),
  });
  isOpen.value = false;
}

emitter.on('openAddShort', ({ sliderDates, shorts }) => {
  isOpen.value = true;
  minDate.value = sliderDates[0];
  maxDate.value = sliderDates[sliderDates.length - 1];
  disabledDates.value = shorts.map((s) => {
    return s.date === 'EXIT' ? maxDate.value : s.date.toDate();
  });
});

</script>