<template>
  <div class="simple-score-image p-8 rounded-xl" :style="containerStyle">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold mb-2" :style="textStyle">{{ quizTitle }}</h2>
      <div class="text-5xl font-bold mb-2" :style="scoreStyle">
        {{ score }} / {{ totalQuestions }}
      </div>
      <p class="text-lg" :style="messageStyle">
        {{ scoreMessage }}
      </p>
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div :style="dateStyle">
        {{ formattedDate }}
      </div>
      <div :style="textStyle">Quiz Master</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  quizTitle: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  isDayMode: { type: Boolean, default: false }
});

const scorePercentage = computed(() => (props.score / props.totalQuestions) * 100);

const scoreMessage = computed(() => {
  return scorePercentage.value >= 80 
    ? 'Excellent travail !' 
    : scorePercentage.value >= 60 
      ? 'Bon travail !' 
      : 'Continuez à vous entraîner !';
});

const formattedDate = computed(() => {
  return new Date().toLocaleDateString();
});

const containerStyle = computed(() => ({
  backgroundColor: props.isDayMode ? '#ffffff' : '#1f2937',
  color: props.isDayMode ? '#1f2937' : '#ffffff',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  width: '600px',
  maxWidth: '100%'
}));

const textStyle = computed(() => ({
  color: props.isDayMode ? '#1f2937' : '#ffffff'
}));

const scoreStyle = computed(() => ({
  color: props.isDayMode ? '#3B82F6' : '#EC4899'
}));

const messageStyle = computed(() => ({
  color: props.isDayMode ? '#4B5563' : '#D1D5DB'
}));

const dateStyle = computed(() => ({
  color: props.isDayMode ? '#6B7280' : '#9CA3AF',
  fontSize: '0.875rem'
}));
</script> 