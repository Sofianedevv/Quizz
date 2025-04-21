<template>
  <button @click="toggleMode" 
    :class="{
      'bg-white/80 text-blue-700 border-blue-200 shadow-md hover:bg-white': quizStore.isDayMode,
      'bg-gray-800 text-pink-400 border-gray-700 hover:bg-gray-700': !quizStore.isDayMode
    }"
    class="fixed top-4 right-4 z-50 px-3 py-2 rounded-full border shadow-md flex items-center transition-all duration-300 backdrop-blur-sm">
    <svg v-if="isDayMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
    {{ isDayMode ? 'Mode Nuit' : 'Mode Jour' }}
  </button>
</template>

<script setup>
import { useQuizStore } from '~/stores/quiz';
import { computed } from 'vue';

const quizStore = useQuizStore();
const isDayMode = computed(() => quizStore.isDayMode);

function toggleMode() {
  quizStore.toggleDayMode();
  localStorage.setItem('isDayMode', quizStore.isDayMode.toString());
}
</script> 