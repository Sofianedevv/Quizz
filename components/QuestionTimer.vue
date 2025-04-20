<template>
  <div class="flex items-center">
    <div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div class="text-lg font-medium" :class="{'text-red-500': timeLeft <= 5}">
      {{ timeLeft }}s
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  duration: {
    type: Number,
    default: 30
  },
  paused: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['timeout']);

const timeLeft = ref(props.duration);
let timerInterval = null;

function startTimer() {
  timeLeft.value = props.duration;
  clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    if (!props.paused) {
      timeLeft.value--;
      
      if (timeLeft.value <= 0) {
        clearInterval(timerInterval);
        emit('timeout');
      }
    }
  }, 1000);
}

// Surveiller les changements de l'état de pause
watch(() => props.paused, (newValue) => {
  // Si le timer est repris après une pause, on ne fait rien
  // Le timer continuera au prochain intervalle
});

onMounted(() => {
  startTimer();
});

onBeforeUnmount(() => {
  clearInterval(timerInterval);
});
</script> 