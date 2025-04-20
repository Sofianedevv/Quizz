<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
    <div class="container mx-auto px-4 py-12">
      <!-- En-tête du quiz -->
      <div v-if="currentQuiz" class="mb-8">
        <h1 class="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
          {{ currentQuiz.title }}
        </h1>
        <p class="text-center text-gray-300 mb-4">{{ currentQuiz.description }}</p>
        
        <!-- Progression du quiz -->
        <div class="w-full bg-gray-700 rounded-full h-2.5 mb-4 max-w-md mx-auto">
          <div class="bg-pink-600 h-2.5 rounded-full" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
        
        <div class="text-center text-gray-400 mb-8">
          Question {{ currentQuestionIndex + 1 }} sur {{ currentQuiz.questions.length }}
        </div>
      </div>
      
      <!-- Contenu principal -->
      <div v-if="currentQuiz && !isQuizFinished" class="max-w-3xl mx-auto">
        <!-- Question actuelle -->
        <div class="bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-pink-400">Question {{ currentQuestionIndex + 1 }}</h2>
            <QuestionTimer 
              :duration="timerDuration" 
              @timeout="handleTimeout" 
              :key="currentQuestionIndex"
              :paused="showFeedback"
            />
          </div>
          
          <p class="text-xl mb-8">{{ currentQuestion.text }}</p>
          
          <!-- Options de réponse -->
          <div class="space-y-4">
            <div 
              v-for="(option, index) in currentQuestion.options" 
              :key="index"
              class="p-4 rounded-lg cursor-pointer transition-colors"
              :class="{
                'bg-gray-700 hover:bg-gray-600': selectedOption === null,
                'bg-gray-600': selectedOption === index && !showFeedback,
                'bg-green-600': showFeedback && index === currentQuestion.correctAnswer,
                'bg-red-600': showFeedback && selectedOption === index && index !== currentQuestion.correctAnswer
              }"
              @click="selectOption(index)"
            >
              <div class="flex items-center">
                <div class="w-6 h-6 rounded-full flex items-center justify-center mr-3"
                  :class="{
                    'bg-gray-500': selectedOption !== index,
                    'bg-pink-500': selectedOption === index && !showFeedback,
                    'bg-green-500': showFeedback && index === currentQuestion.correctAnswer,
                    'bg-red-500': showFeedback && selectedOption === index && index !== currentQuestion.correctAnswer
                  }"
                >
                  <span v-if="selectedOption === index && !showFeedback" class="text-white">✓</span>
                  <span v-if="showFeedback && index === currentQuestion.correctAnswer" class="text-white">✓</span>
                  <span v-if="showFeedback && selectedOption === index && index !== currentQuestion.correctAnswer" class="text-white">✗</span>
                </div>
                <span>{{ option }}</span>
              </div>
            </div>
          </div>
          
          <!-- Bouton de validation -->
          <div class="mt-8 flex justify-between">
            <button 
              v-if="!showFeedback"
              @click="validateAnswer" 
              class="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
              :disabled="selectedOption === null"
              :class="{ 'opacity-50 cursor-not-allowed': selectedOption === null }"
            >
              Valider ma réponse
            </button>
            
            <button 
              v-else
              @click="nextQuestion" 
              class="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              Question suivante
            </button>
          </div>
        </div>
      </div>
      
      <!-- Résultats du quiz -->
      <div v-else-if="isQuizFinished" class="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 class="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
          Quiz terminé !
        </h2>
        
        <div class="text-center mb-8">
          <div class="text-5xl font-bold mb-2">{{ score }} / {{ currentQuiz.questions.length }}</div>
          <p class="text-gray-300">
            {{ scorePercentage >= 80 ? 'Excellent travail !' : scorePercentage >= 60 ? 'Bon travail !' : 'Continuez à vous entraîner !' }}
          </p>
        </div>
        
        <div class="mb-8">
          <h3 class="text-xl font-semibold mb-4 text-pink-400">Récapitulatif des réponses</h3>
          
          <div v-for="(question, index) in currentQuiz.questions" :key="index" class="mb-6 p-4 bg-gray-700 rounded-lg">
            <div class="flex items-start mb-2">
              <div class="w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1"
                :class="{
                  'bg-green-500': userAnswers[index] === question.correctAnswer,
                  'bg-red-500': userAnswers[index] !== question.correctAnswer
                }"
              >
                <span v-if="userAnswers[index] === question.correctAnswer" class="text-white">✓</span>
                <span v-else class="text-white">✗</span>
              </div>
              <div>
                <p class="font-medium">{{ question.text }}</p>
                <p class="text-sm text-gray-400 mt-1">
                  Votre réponse: <span :class="{ 'text-green-400': userAnswers[index] === question.correctAnswer, 'text-red-400': userAnswers[index] !== question.correctAnswer }">
                    {{ question.options[userAnswers[index]] }}
                  </span>
                </p>
                <p v-if="userAnswers[index] !== question.correctAnswer" class="text-sm text-green-400 mt-1">
                  Réponse correcte: {{ question.options[question.correctAnswer] }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-center space-x-4">
          <button 
            @click="restartQuiz" 
            class="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            Recommencer
          </button>
          <button 
            @click="goToHome" 
            class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuizStore } from '~/stores/quiz';
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import QuestionTimer from '~/components/QuestionTimer.vue';

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();

// Paramètres du quiz
const timerDuration = ref(30); // secondes
const selectedOption = ref(null);
const showFeedback = ref(false);

// Charger le quiz
onMounted(() => {
  const quizId = parseInt(route.params.id);
  quizStore.loadFromLocalStorage();
  quizStore.startQuiz(quizId);
});

// Données du quiz
const currentQuiz = computed(() => quizStore.currentQuiz);
const currentQuestion = computed(() => quizStore.getCurrentQuestion);
const currentQuestionIndex = computed(() => quizStore.currentQuestionIndex);
const isQuizFinished = computed(() => quizStore.isQuizFinished);
const userAnswers = computed(() => quizStore.userAnswers);
const score = computed(() => quizStore.score);
const scorePercentage = computed(() => (score.value / currentQuiz.value?.questions.length) * 100);
const progressPercentage = computed(() => ((currentQuestionIndex.value + 1) / currentQuiz.value?.questions.length) * 100);

// Réinitialiser la sélection à chaque nouvelle question
watch(currentQuestionIndex, () => {
  selectedOption.value = null;
  showFeedback.value = false;
});

// Sélectionner une option
function selectOption(index) {
  if (!showFeedback.value) {
    selectedOption.value = index;
  }
}

// Valider la réponse
function validateAnswer() {
  if (selectedOption.value !== null) {
    showFeedback.value = true;
  }
}

// Passer à la question suivante
function nextQuestion() {
  quizStore.answerQuestion(selectedOption.value);
  selectedOption.value = null;
  showFeedback.value = false;
}

// Gérer le timeout du timer
function handleTimeout() {
  if (!showFeedback.value) {
    showFeedback.value = true;
    // Si aucune option n'est sélectionnée, on sélectionne une option aléatoire
    if (selectedOption.value === null && currentQuestion.value) {
      selectedOption.value = Math.floor(Math.random() * currentQuestion.value.options.length);
    }
  }
}

// Recommencer le quiz
function restartQuiz() {
  quizStore.startQuiz(currentQuiz.value.id);
}

// Retourner à l'accueil
function goToHome() {
  router.push('/');
}
</script>

<style scoped>
/* Animation pour les confettis */
@keyframes confettiFall {
  0% {
    transform: translateY(-100%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.confetti {
  position: absolute;
  animation: confettiFall linear infinite;
  border-radius: 2px;
}

/* Animation pour les boutons d'options */
button:hover {
  transform: translateY(-2px);
}

button:active {
  transform: translateY(0);
}

/* Effet de flou pour les éléments backdrop */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
</style> 