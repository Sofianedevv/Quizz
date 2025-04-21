<template>
  <div :class="{
    'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800': quizStore.isDayMode, 
    'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white': !quizStore.isDayMode
  }" class="min-h-screen">
    <div class="container mx-auto px-4 py-12">
      <!-- En-tête du quiz -->
      <div v-if="currentQuiz" class="mb-8">
        <h1 class="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r"
          :class="{'from-blue-500 to-indigo-600': quizStore.isDayMode, 'from-pink-500 to-purple-500': !quizStore.isDayMode}">
          {{ currentQuiz.title }}
        </h1>
        <p class="text-center" :class="{'text-gray-600': quizStore.isDayMode, 'text-gray-300': !quizStore.isDayMode}">
          {{ currentQuiz.description }}
        </p>
        
        <!-- Progression du quiz -->
        <div class="w-full bg-gray-300 rounded-full h-2.5 mb-4 max-w-md mx-auto">
          <div :class="{'bg-blue-600': quizStore.isDayMode, 'bg-pink-600': !quizStore.isDayMode}" 
            class="h-2.5 rounded-full" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
        
        <div class="text-center text-gray-400 mb-8">
          Question {{ currentQuestionIndex + 1 }} sur {{ currentQuiz.questions.length }}
        </div>
        
        <!-- Indicateur de mode fantôme -->
        <div v-if="quizStore.ghostMode" class="mt-2 text-center">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            :class="{'bg-blue-100 text-blue-800': quizStore.isDayMode, 'bg-purple-900 text-purple-200': !quizStore.isDayMode}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Mode Compétition
          </span>
        </div>
      </div>
      
      <!-- Contenu principal -->
      <div v-if="currentQuiz && !isQuizFinished" class="max-w-3xl mx-auto">
        <!-- Question actuelle -->
        <div :class="[
          quizStore.isDayMode ? 'bg-white border border-blue-100' : 'bg-gray-800', 
          'rounded-xl shadow-lg p-8 mb-8'
        ]">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-pink-400">Question {{ currentQuestionIndex + 1 }}</h2>
            <QuestionTimer 
              :duration="timerDuration" 
              @timeout="handleTimeout" 
              :key="currentQuestionIndex"
              :paused="showFeedback"
            />
          </div>
          
          <p class="text-xl mb-4">{{ currentQuestion.text }}</p>
          
          <!-- Affichage de l'image de la question si elle existe -->
          <div v-if="currentQuestion.image" class="mb-6">
            <img 
              :src="currentQuestion.image" 
              alt="Image de la question" 
              class="max-w-full h-auto max-h-80 mx-auto rounded-lg"
            />
          </div>
          
          <!-- Indicateur de performance du fantôme -->
          <div v-if="quizStore.ghostMode && ghostAnswer" class="mt-4 p-3 rounded-lg"
            :class="{
              'bg-green-100 text-green-800': ghostAnswer.correct && quizStore.isDayMode,
              'bg-red-100 text-red-800': !ghostAnswer.correct && quizStore.isDayMode,
              'bg-green-900 text-green-200': ghostAnswer.correct && !quizStore.isDayMode,
              'bg-red-900 text-red-200': !ghostAnswer.correct && !quizStore.isDayMode
            }">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>
                Votre meilleur score: 
                <span class="font-bold">{{ ghostAnswer.correct ? 'Correct' : 'Incorrect' }}</span> 
                en {{ ghostAnswer.timeSpent }} secondes
              </span>
            </div>
          </div>
          
          <!-- Options de réponse -->
          <div class="space-y-4">
            <div 
              v-for="(option, index) in currentQuestion.options" 
              :key="index"
              class="p-4 rounded-lg cursor-pointer transition-colors"
              :class="{
                'bg-gray-700 hover:bg-gray-600': selectedOption === null && !showFeedback,
                'bg-gray-600': selectedOption === index && !showFeedback,
                'bg-gray-700 hover:bg-gray-600': selectedOption !== index && !showFeedback,
                'bg-green-600': showFeedback && index === currentQuestion.correctAnswer,
                'bg-red-600': showFeedback && selectedOption === index && index !== currentQuestion.correctAnswer
              }"
              @click="!showFeedback && selectOption(index)"
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
            <div></div>
            <button 
              @click="validateAndNext" 
              :disabled="selectedOption === null"
              class="px-6 py-3 rounded-lg text-white font-medium transition-colors"
              :class="{
                'bg-blue-600 hover:bg-blue-700': quizStore.isDayMode && selectedOption !== null,
                'bg-pink-600 hover:bg-pink-700': !quizStore.isDayMode && selectedOption !== null,
                'bg-gray-400 cursor-not-allowed': selectedOption === null
              }"
            >
              Valider
            </button>
          </div>
        </div>
      </div>
      
      <!-- Résultats du quiz -->
      <div v-else-if="isQuizFinished" :class="[quizStore.isDayMode ? 'bg-white' : 'bg-gray-800', 'rounded-xl p-6 shadow-lg']">
        <h2 class="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
          Quiz terminé !
        </h2>
        
        <div class="text-center mb-8">
          <div class="text-5xl font-bold mb-2">{{ score }} / {{ currentQuiz.questions.length }}</div>
          <p class="text-gray-300">
            {{ scorePercentage >= 80 ? 'Excellent travail !' : scorePercentage >= 60 ? 'Bon travail !' : 'Continuez à vous entraîner !' }}
          </p>
        </div>
        
        <!-- Comparaison avec le meilleur score précédent -->
        <div v-if="previousBestScore" class="mt-8 p-4 rounded-lg"
          :class="{'bg-blue-50': quizStore.isDayMode, 'bg-gray-700': !quizStore.isDayMode}">
          <h3 class="text-xl font-semibold mb-2">Comparaison avec votre meilleur score</h3>
          
          <div class="flex justify-between items-center">
            <div>
              <p class="font-medium">Meilleur score précédent: {{ previousBestScore.score }} / {{ currentQuiz.questions.length }}</p>
              <p :class="{'text-gray-600': quizStore.isDayMode, 'text-gray-400': !quizStore.isDayMode}">
                {{ formatDate(previousBestScore.date) }}
              </p>
            </div>
            
            <div class="text-right">
              <p class="font-medium">Score actuel: {{ quizStore.score }} / {{ currentQuiz.questions.length }}</p>
              <p :class="{'text-gray-600': quizStore.isDayMode, 'text-gray-400': !quizStore.isDayMode}">
                {{ isNewRecord ? 'Nouveau record!' : 'Pas de nouveau record' }}
              </p>
            </div>
          </div>
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
        
        <!-- Section de partage des résultats -->
        <div class="mt-8">
          <h3 class="text-xl font-semibold mb-4 text-pink-400">Partager vos résultats</h3>
          
          <div class="flex flex-wrap gap-4 mb-6">
            <!-- Boutons de partage sur les réseaux sociaux -->
            <button 
              @click="shareOnTwitter" 
              class="flex items-center px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </button>
            
            <button 
              @click="shareOnFacebook" 
              class="flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            
            <button 
              @click="shareOnWhatsApp" 
              class="flex items-center px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
            
            <button 
              @click="copyShareLink" 
              class="flex items-center px-4 py-2 rounded-lg"
              :class="{
                'bg-gray-200 text-gray-800 hover:bg-gray-300': quizStore.isDayMode,
                'bg-gray-700 text-white hover:bg-gray-600': !quizStore.isDayMode
              }"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copier le lien
            </button>
            
            <button 
              @click="downloadImage" 
              class="flex items-center px-4 py-2 rounded-lg"
              :class="{
                'bg-purple-100 text-purple-800 hover:bg-purple-200': quizStore.isDayMode,
                'bg-purple-900 text-purple-200 hover:bg-purple-800': !quizStore.isDayMode
              }"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger l'image
            </button>
          </div>
          
          <!-- Version basique pour la génération d'image -->
          <div id="simple-score-container" class="mt-4 flex justify-center">
            <BasicScoreImage 
              :quiz-title="currentQuiz.title"
              :score="quizStore.score"
              :total-questions="currentQuiz.questions.length"
              :is-day-mode="quizStore.isDayMode"
            />
          </div>
          
          <!-- Aperçu de l'image générée -->
          <div v-if="shareImageUrl" class="mt-4 flex justify-center">
            <img :src="shareImageUrl" alt="Score partageable" class="max-w-full h-auto rounded-lg shadow-lg" />
          </div>
          
          <!-- Bouton de téléchargement alternatif -->
          <div v-if="shareImageUrl" class="mt-4 text-center">
            <p class="text-sm text-gray-400 mb-2">Si le téléchargement automatique ne fonctionne pas :</p>
            <a 
              :href="shareImageUrl" 
              download="quiz-master-score.png"
              class="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger manuellement
            </a>
          </div>
          
          <!-- Message de confirmation pour le lien copié -->
          <div v-if="showCopyConfirmation" class="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center">
            Lien copié dans le presse-papiers !
          </div>
        </div>
        
        <!-- Solution alternative si la génération d'image échoue -->
        <div v-if="generationError" class="mt-6 p-4 bg-red-100 text-red-800 rounded-lg">
          <p class="mb-2">La génération d'image a échoué. Vous pouvez partager votre score directement :</p>
          
          <div class="p-4 bg-white rounded-lg shadow-md">
            <p class="font-bold">{{ currentQuiz.title }}</p>
            <p class="text-2xl font-bold text-blue-600">{{ quizStore.score }} / {{ currentQuiz.questions.length }}</p>
            <p>{{ scorePercentage >= 80 ? 'Excellent travail !' : scorePercentage >= 60 ? 'Bon travail !' : 'Continuez à vous entraîner !' }}</p>
          </div>
          
          <button 
            @click="copyScoreText" 
            class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Copier ce texte
          </button>
        </div>
        
        <div class="flex justify-center mt-6 space-x-4">
          <button 
            @click="saveScoreManually" 
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Sauvegarder mon score
          </button>
          
          <button 
            @click="goToHome" 
            class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Retour à l'accueil
          </button>
          
          <!-- Bouton pour rejouer en mode compétition -->
          <button 
            v-if="quizStore.currentUser && !quizStore.ghostMode && previousBestScore"
            @click="restartWithGhost" 
            class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition shadow-md flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Rejouer en mode compétition
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
import type { UserScore, AnswerDetail } from '~/types';
import SimpleScoreImage from '~/components/SimpleScoreImage.vue';
import html2canvas from 'html2canvas';
import BasicScoreImage from '~/components/BasicScoreImage.vue';

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();

// Paramètres du quiz
const timerDuration = ref(30); // secondes
const selectedOption = ref(null);
const showFeedback = ref(false);

// Variables pour le mode fantôme
const startTime = ref(Date.now());
const ghostAnswer = computed(() => {
  if (!quizStore.ghostMode || quizStore.ghostScores.length === 0) return null;
  return quizStore.ghostScores[currentQuestionIndex.value] || null;
});

// Références et états pour le partage
const scoreShareImage = ref(null);
const shareImageUrl = ref(null);
const showCopyConfirmation = ref(false);
const generationError = ref(false);

// Charger le quiz
onMounted(() => {
  const quizId = parseInt(route.params.id);
  quizStore.loadFromLocalStorage();
  quizStore.startQuiz(quizId);
  startTime.value = Date.now();
});

// Données du quiz
const currentQuiz = computed(() => quizStore.currentQuiz);
const currentQuestion = computed(() => quizStore.getCurrentQuestion);
const currentQuestionIndex = computed(() => quizStore.currentQuestionIndex);
const isQuizFinished = computed(() => quizStore.isQuizFinished);
const userAnswers = computed(() => quizStore.userAnswers);
const score = computed(() => {
  return quizStore.score;
});
const scorePercentage = computed(() => (score.value / currentQuiz.value?.questions.length) * 100);
const progressPercentage = computed(() => ((currentQuestionIndex.value + 1) / currentQuiz.value?.questions.length) * 100);

// Récupérer le meilleur score précédent
const previousBestScore = computed(() => {
  if (!quizStore.currentUser || !currentQuiz.value) return null;
  
  const quizScores = quizStore.currentUser.scores.filter(score => 
    score.quizId === currentQuiz.value.id
  );
  
  if (quizScores.length === 0) return null;
  
  return quizScores.reduce((best, current) => 
    current.score > best.score ? current : best
  , quizScores[0]);
});

// Vérifier si c'est un nouveau record
const isNewRecord = computed(() => {
  if (!previousBestScore.value) return true;
  return quizStore.score > previousBestScore.value.score;
});

// Réinitialiser la sélection à chaque nouvelle question
watch(currentQuestionIndex, () => {
  selectedOption.value = null;
  showFeedback.value = false;
  startTime.value = Date.now();
});

// Sélectionner une option
function selectOption(index: number) {
  if (!showFeedback.value) {
    selectedOption.value = index;
  }
}

// Fonction combinée pour valider et passer à la question suivante
function validateAndNext() {
  if (selectedOption.value === null) return;
  
  // Calculer le temps passé sur cette question
  const timeSpent = Math.floor((Date.now() - startTime.value) / 1000);
  
  // Vérifier si la réponse est correcte
  const isCorrect = selectedOption.value === currentQuestion.value.correctAnswer;
  
  // Mettre à jour le score
  if (isCorrect) {
    quizStore.score++;
  }
  
  // Enregistrer les détails de la réponse pour le mode fantôme
  quizStore.saveAnswerDetail(
    currentQuestionIndex.value,
    timeSpent,
    isCorrect
  );
  
  // Montrer brièvement le feedback
  showFeedback.value = true;
  
  // Passer à la question suivante après un court délai
  setTimeout(() => {
    selectedOption.value = null;
    showFeedback.value = false;
    quizStore.currentQuestionIndex++;
    
    // Réinitialiser le chronomètre pour la nouvelle question
    startTime.value = Date.now();
    
    // Si le quiz est terminé, sauvegarder le score
    if (quizStore.isQuizFinished && quizStore.currentUser && currentQuiz.value) {
      quizStore.saveScore({
        quizId: currentQuiz.value.id,
        score: quizStore.score,
        date: new Date().toISOString()
      });
      
      // Désactiver le mode fantôme à la fin du quiz
      if (quizStore.ghostMode) {
        quizStore.deactivateGhostMode();
      }
    }
  }, 1000); // Délai de 1 seconde pour voir le feedback
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

// Ajouter cette fonction dans la partie script
function saveScoreManually() {
  if (!quizStore.currentUser || !quizStore.currentQuiz) return;
  
  // Enregistrer le score manuellement
  quizStore.saveScore({
    quizId: quizStore.currentQuiz.id,
    score: quizStore.score,
    date: new Date().toISOString()
  });
  
  // Afficher les informations de débogage
  quizStore.debugScores();
  
  // Afficher un message de confirmation
  alert(`Score sauvegardé: ${quizStore.score}/${quizStore.currentQuiz.questions.length}`);
}

// Formater une date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Redémarrer en mode fantôme
function restartWithGhost() {
  if (!currentQuiz.value) return;
  
  const success = quizStore.activateGhostMode(currentQuiz.value.id);
  if (success) {
    restartQuiz();
  } else {
    alert("Impossible d'activer le mode compétition. Vous devez d'abord terminer ce quiz au moins une fois.");
  }
}

// Gérer l'image générée
function handleImageGenerated(imageData) {
  shareImageUrl.value = imageData;
}

// Partager sur Twitter
function shareOnTwitter() {
  const text = `J'ai obtenu ${score.value}/${currentQuiz.value.questions.length} au quiz "${currentQuiz.value.title}" sur Quiz Master!`;
  const url = window.location.href;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank');
}

// Partager sur Facebook
function shareOnFacebook() {
  const url = window.location.href;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank');
}

// Partager sur WhatsApp
function shareOnWhatsApp() {
  const text = `J'ai obtenu ${score.value}/${currentQuiz.value.questions.length} au quiz "${currentQuiz.value.title}" sur Quiz Master! Essaie de battre mon score: ${window.location.href}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
}

// Copier le lien de partage
function copyShareLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    showCopyConfirmation.value = true;
    setTimeout(() => {
      showCopyConfirmation.value = false;
    }, 3000);
  });
}

// Fonction pour copier le texte du score
function copyScoreText() {
  const text = `J'ai obtenu ${quizStore.score}/${currentQuiz.value.questions.length} au quiz "${currentQuiz.value.title}" sur Quiz Master!`;
  navigator.clipboard.writeText(text).then(() => {
    alert("Texte copié dans le presse-papiers!");
  });
}

// Télécharger l'image avec gestion d'erreur améliorée
async function downloadImage() {
  try {
    console.log("Début du téléchargement de l'image");
    generationError.value = false;
    
    // Utiliser la version simple pour générer l'image
    const imageData = await generateSimpleImage();
    
    if (imageData) {
      console.log("Image générée avec succès");
      shareImageUrl.value = imageData;
      triggerDownload(imageData);
    } else {
      console.error("Échec de la génération de l'image");
      generationError.value = true;
      alert("Erreur: Impossible de générer l'image. Utilisez l'option de copie de texte à la place.");
    }
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image:", error);
    generationError.value = true;
    alert("Une erreur est survenue lors du téléchargement de l'image. Utilisez l'option de copie de texte à la place.");
  }
}

// Déclencher le téléchargement de l'image
function triggerDownload(imageData) {
  try {
    console.log("Déclenchement du téléchargement");
    
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `quiz-master-score-${currentQuiz.value.id}.png`;
    
    // Ajouter le lien au document
    document.body.appendChild(link);
    
    // Simuler un clic
    console.log("Simulation du clic sur le lien de téléchargement");
    link.click();
    
    // Nettoyer
    setTimeout(() => {
      document.body.removeChild(link);
      console.log("Lien de téléchargement supprimé");
    }, 100);
  } catch (error) {
    console.error("Erreur lors du déclenchement du téléchargement:", error);
    alert("Une erreur est survenue lors du téléchargement");
  }
}

// Fonction pour générer une image simple
async function generateSimpleImage() {
  try {
    console.log("Début de la génération de l'image simple");
    const container = document.getElementById('simple-score-container');
    
    if (!container) {
      console.error("Conteneur d'image non trouvé");
      return null;
    }
    
    console.log("Conteneur trouvé, dimensions:", container.offsetWidth, "x", container.offsetHeight);
    
    // Assurez-vous que le conteneur est visible
    const originalDisplay = container.style.display;
    container.style.display = 'block';
    
    // Attendre un peu pour s'assurer que le DOM est stable
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Options simplifiées pour html2canvas
    const options = {
      scale: 2,
      logging: true,
      useCORS: true,
      allowTaint: true,
      backgroundColor: quizStore.isDayMode ? '#ffffff' : '#1f2937'
    };
    
    console.log("Appel de html2canvas avec options:", options);
    const canvas = await html2canvas(container, options);
    
    console.log("Canvas généré, dimensions:", canvas.width, "x", canvas.height);
    const imageData = canvas.toDataURL('image/png');
    
    // Restaurer l'affichage original
    container.style.display = originalDisplay;
    
    console.log("Image générée avec succès");
    shareImageUrl.value = imageData;
    return imageData;
  } catch (error) {
    console.error('Erreur détaillée lors de la génération de l\'image:', error);
    return null;
  }
}

// Régénérer l'image quand le score change
watch(() => quizStore.score, () => {
  if (scoreShareImage.value && isQuizFinished.value) {
    console.log("Score modifié, régénération de l'image");
    setTimeout(() => {
      scoreShareImage.value.generateImage();
    }, 200);
  }
});
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