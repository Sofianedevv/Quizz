<template>
  <div :class="[
    'rounded-xl overflow-hidden transition-transform hover:scale-105 relative',
    quizStore.isDayMode ? 'bg-white border border-gray-100 shadow-sm hover:shadow-xl' : 'bg-gray-800 shadow-lg'
  ]" @click="$emit('start')">
    <div class="h-48 overflow-hidden relative">
      <!-- Image principale avec fallback -->
      <img 
        :src="getLocalImage()"
        :alt="quiz.title" 
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      
      <!-- Overlay pour améliorer la lisibilité du texte sur l'image -->
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
      
      <!-- Badge de difficulté - déplacé en haut à gauche -->
      <div class="absolute top-3 left-3">
        <span class="px-2 py-1 text-xs rounded-full font-bold shadow-sm" 
          :class="{
            'bg-green-100 text-green-800 border border-green-200': quiz.difficulty === 'Facile' && quizStore.isDayMode,
            'bg-yellow-100 text-yellow-800 border border-yellow-200': quiz.difficulty === 'Moyen' && quizStore.isDayMode,
            'bg-orange-100 text-orange-800 border border-orange-200': quiz.difficulty === 'Difficile' && quizStore.isDayMode,
            'bg-red-100 text-red-800 border border-red-200': quiz.difficulty === 'Expert' && quizStore.isDayMode,
            'bg-green-500 text-green-100': quiz.difficulty === 'Facile' && !quizStore.isDayMode,
            'bg-yellow-500 text-yellow-100': quiz.difficulty === 'Moyen' && !quizStore.isDayMode,
            'bg-orange-500 text-orange-100': quiz.difficulty === 'Difficile' && !quizStore.isDayMode,
            'bg-red-500 text-red-100': quiz.difficulty === 'Expert' && !quizStore.isDayMode
          }">
          {{ quiz.difficulty }}
        </span>
      </div>
      
      <!-- Bouton de favoris - reste en haut à droite -->
      <FavoriteButton :quiz-id="quiz.id" />
    </div>
    
    <div class="p-6">
      <div class="flex items-center mb-4">
        <div :class="{'bg-purple-600': quizStore.isDayMode, 'bg-pink-500': !quizStore.isDayMode}" class="rounded-full p-2 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold" :class="{'text-gray-800': quizStore.isDayMode, 'text-white': !quizStore.isDayMode}">
          {{ quiz.title }}
        </h3>
      </div>
      
      <p :class="{'text-gray-600': quizStore.isDayMode, 'text-gray-300': !quizStore.isDayMode}" class="mb-4">
        {{ quiz.description }}
      </p>
      
      <div class="flex justify-between items-center">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" :class="{'text-purple-600': quizStore.isDayMode, 'text-pink-400': !quizStore.isDayMode}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm" :class="{'text-gray-500': quizStore.isDayMode, 'text-gray-400': !quizStore.isDayMode}">{{ quiz.questions.length }} questions</span>
        </div>
        
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span class="text-sm text-gray-400">{{ getCategoryName(quiz.categoryId) }}</span>
        </div>
      </div>
      
      <div class="mt-4 flex justify-between items-center">
        <button 
          @click.stop="$emit('start')" 
          class="px-4 py-2 rounded-lg text-white font-medium transition-colors"
          :class="{'bg-blue-600 hover:bg-blue-700': quizStore.isDayMode, 'bg-pink-600 hover:bg-pink-700': !quizStore.isDayMode}"
        >
          Commencer
        </button>
        
        <!-- Bouton mode compétition -->
        <button 
          v-if="hasPreviousScore"
          @click.stop="$emit('ghost-mode')" 
          class="px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center"
          :class="{
            'bg-indigo-100 text-indigo-800 hover:bg-indigo-200': quizStore.isDayMode, 
            'bg-purple-900 text-purple-200 hover:bg-purple-800': !quizStore.isDayMode
          }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Compétition
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuizStore } from '~/stores/quiz';
import FavoriteButton from '~/components/FavoriteButton.vue';

const props = defineProps({
  quiz: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['start', 'ghost-mode']);

const quizStore = useQuizStore();

// Images en ligne comme fallback
const onlineImages = {
  culture: 'https://cdn.pixabay.com/photo/2016/01/19/01/42/library-1147815_1280.jpg',
  science: 'https://cdn.pixabay.com/photo/2018/07/15/10/44/dna-3539309_1280.jpg',
  histoire: 'https://cdn.pixabay.com/photo/2020/04/11/08/26/colosseum-5029013_1280.jpg',
  astronomie: 'https://cdn.pixabay.com/photo/2011/12/14/12/21/orion-nebula-11107_1280.jpg',
  sport: 'https://cdn.pixabay.com/photo/2016/11/29/03/53/athletes-1867185_1280.jpg',
  musique: 'https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_1280.jpg',
  cinema: 'https://cdn.pixabay.com/photo/2016/11/15/07/09/photo-manipulation-1825450_1280.jpg',
  geographie: 'https://cdn.pixabay.com/photo/2016/10/20/18/35/earth-1756274_1280.jpg',
  programmation: 'https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg',
  gastronomie: 'https://cdn.pixabay.com/photo/2017/06/01/18/46/cook-2364221_1280.jpg',
  art: 'https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2696947_1280.jpg',
  litterature: 'https://cdn.pixabay.com/photo/2016/03/26/22/21/books-1281581_1280.jpg',
  technologie: 'https://cdn.pixabay.com/photo/2017/12/12/12/44/bitcoin-3014614_1280.jpg',
  mythologie: 'https://cdn.pixabay.com/photo/2017/08/01/08/29/people-2563491_1280.jpg',
  animaux: 'https://cdn.pixabay.com/photo/2014/10/23/18/56/tiger-500118_1280.jpg',
  jeuxvideo: 'https://cdn.pixabay.com/photo/2021/09/07/07/11/game-console-6603120_1280.jpg',
  default: 'https://cdn.pixabay.com/photo/2016/11/18/14/05/brick-wall-1834784_1280.jpg'
};

// Correspondance entre les titres de quiz et les noms de fichiers locaux
const localImageMap = {
  'Quiz de Culture Générale': '/images/culture-generale.jpg',
  'Quiz de Sciences': '/images/sciences.jpg',
  'Quiz d\'Histoire': '/images/histoire.jpg',
  'Quiz d\'Astronomie': '/images/astronomie.jpg',
  'Quiz de Sport': '/images/sport.jpg',
  'Quiz de Musique': '/images/musique.jpg',
  'Quiz de Cinéma': '/images/cinema.jpg',
  'Quiz de Géographie': '/images/geographie.jpg',
  'Programmation Informatique': '/images/programmation.jpg',
  'Gastronomie Mondiale': '/images/gastronomie.jpg',
  'Littérature Classique': '/images/litterature.jpg',
  'Art Moderne': '/images/art.jpg',
  'Géographie Mondiale': '/images/geographie-mondiale.jpg',
  'Technologie et Innovations': '/images/technologie.jpg',
  'Histoire Antique': '/images/histoire-antique.jpg',
  'Cinéma et Films Cultes': '/images/cinema-culte.jpg',
  'Jeux Vidéo': '/images/jeux-video.jpg',
  'Cuisine du Monde': '/images/cuisine.jpg',
  'Animaux Extraordinaires': '/images/animaux.jpg',
  'Mythologie Grecque': '/images/mythologie.jpg'
};

// Fonction pour obtenir le nom de la catégorie
function getCategoryName(categoryId) {
  const category = quizStore.categories.find(cat => cat.id === categoryId);
  return category ? category.name : 'Catégorie inconnue';
}

// Fonction pour obtenir l'image locale
function getLocalImage() {
  console.log('Image du quiz:', props.quiz.image);
  
  // Vérifier si l'image est une URL de données (base64)
  if (props.quiz.image && (props.quiz.image.startsWith('data:image') || props.quiz.image.startsWith('blob:'))) {
    console.log('Utilisation de l\'image téléchargée');
    return props.quiz.image; // Utiliser directement l'image téléchargée
  }
  
  // Essayer d'abord de trouver une correspondance exacte par titre
  if (localImageMap[props.quiz.title]) {
    return localImageMap[props.quiz.title];
  }
  
  // Si l'image est une URL complète (http/https), l'utiliser directement
  if (props.quiz.image && (props.quiz.image.startsWith('http://') || props.quiz.image.startsWith('https://'))) {
    return props.quiz.image;
  }
  
  // Sinon, essayer de générer un chemin basé sur le titre
  const title = props.quiz.title.toLowerCase().replace(/\s+/g, '-');
  return `/images/${title}.jpg`;
}

// Fonction de fallback en cas d'erreur de chargement d'image
function handleImageError(event) {
  console.log('Image locale non trouvée, utilisation du fallback:', event.target.src);
  event.target.src = getOnlineImage();
}

// Fonction pour obtenir l'image en ligne de secours
function getOnlineImage() {
  const title = props.quiz.title.toLowerCase();
  const categoryId = props.quiz.categoryId;
  
  if (title.includes('culture')) return onlineImages.culture;
  if (title.includes('science')) return onlineImages.science;
  if (title.includes('histoire')) return onlineImages.histoire;
  if (title.includes('astronomie')) return onlineImages.astronomie;
  if (title.includes('sport')) return onlineImages.sport;
  if (title.includes('musique')) return onlineImages.musique;
  if (title.includes('cinéma') || title.includes('cinema')) return onlineImages.cinema;
  if (title.includes('géographie') || title.includes('geographie')) return onlineImages.geographie;
  if (title.includes('programmation')) return onlineImages.programmation;
  if (title.includes('gastronomie') || title.includes('cuisine')) return onlineImages.gastronomie;
  if (title.includes('art')) return onlineImages.art;
  if (title.includes('littérature') || title.includes('litterature')) return onlineImages.litterature;
  if (title.includes('technologie') || title.includes('innovation')) return onlineImages.technologie;
  if (title.includes('mythologie')) return onlineImages.mythologie;
  if (title.includes('animaux')) return onlineImages.animaux;
  if (title.includes('jeux') || title.includes('vidéo')) return onlineImages.jeuxvideo;
  
  // Fallback basé sur la catégorie
  switch (categoryId) {
    case 1: return onlineImages.culture;
    case 2: return onlineImages.science;
    case 3: return onlineImages.sport;
    case 4: return onlineImages.musique;
    case 5: return onlineImages.cinema;
    case 6: return onlineImages.technologie;
    case 7: return onlineImages.geographie;
    case 8: return onlineImages.histoire;
    case 9: return onlineImages.art;
    case 10: return onlineImages.litterature;
    default: return onlineImages.default;
  }
}

// Vérifier si l'utilisateur a déjà joué à ce quiz
const hasPreviousScore = computed(() => {
  if (!quizStore.currentUser) return false;
  
  return quizStore.currentUser.scores.some(score => 
    score.quizId === props.quiz.id
  );
});
</script>

<style scoped>
/* Animation au survol */
.quiz-card {
  transition: all 0.3s ease;
}

.quiz-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}
</style> 