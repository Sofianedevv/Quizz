<template>
  <button @click.stop="toggleFavorite" class="favorite-button">
    <svg xmlns="http://www.w3.org/2000/svg" 
      :class="[
        'h-6 w-6 transition-colors duration-300',
        isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-400 hover:text-yellow-400'
      ]" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      :fill="isFavorite ? 'currentColor' : 'none'">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  </button>
</template>

<script setup>
import { useQuizStore } from '~/stores/quiz';
import { computed } from 'vue';

const props = defineProps({
  quizId: {
    type: Number,
    required: true
  }
});

const quizStore = useQuizStore();
const isFavorite = computed(() => quizStore.isQuizFavorite(props.quizId));

function toggleFavorite(event) {
  event.preventDefault();
  event.stopPropagation();
  quizStore.toggleFavorite(props.quizId);
}
</script>

<style scoped>
.favorite-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 6px;
  transition: all 0.2s ease;
}

.favorite-button:hover {
  transform: scale(1.1);
}

.favorite-button:active {
  transform: scale(0.95);
}
</style> 