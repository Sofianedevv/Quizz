<template>
  <div class="basic-score-image" style="padding: 20px; border-radius: 10px; width: 400px; font-family: Arial, sans-serif;"
    :style="{ backgroundColor: isDayMode ? '#ffffff' : '#1f2937', color: isDayMode ? '#1f2937' : '#ffffff' }">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 10px;">{{ quizTitle }}</h2>
      <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px;">
        <span :style="{ color: isDayMode ? '#3B82F6' : '#EC4899' }">{{ score }}</span>
        <span> / </span>
        <span>{{ totalQuestions }}</span>
      </div>
      <p style="font-size: 16px;" :style="{ color: isDayMode ? '#4B5563' : '#D1D5DB' }">
        {{ scoreMessage }}
      </p>
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div :style="{ color: isDayMode ? '#6B7280' : '#9CA3AF', fontSize: '14px' }">
        {{ new Date().toLocaleDateString() }}
      </div>
      <div>Quiz Master</div>
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
</script> 