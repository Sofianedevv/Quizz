<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
    <div class="container mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Créer un nouveau quiz</h1>
      
      <div class="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg p-8">
        <form @submit.prevent="submitQuiz">
          <!-- Informations générales du quiz -->
          <div class="mb-8">
            <h2 class="text-2xl font-semibold mb-4 text-pink-400">Informations générales</h2>
            
            <div class="mb-4">
              <label for="title" class="block text-gray-300 mb-2">Titre du quiz</label>
              <input 
                type="text" 
                id="title" 
                v-model="quizData.title" 
                class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
            </div>
            
            <div class="mb-4">
              <label for="description" class="block text-gray-300 mb-2">Description</label>
              <textarea 
                id="description" 
                v-model="quizData.description" 
                class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                rows="3"
                required
              ></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="category" class="block text-gray-300 mb-2">Catégorie</label>
                <select 
                  id="category" 
                  v-model="quizData.categoryId" 
                  class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                >
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              
              <div>
                <label for="difficulty" class="block text-gray-300 mb-2">Difficulté</label>
                <select 
                  id="difficulty" 
                  v-model="quizData.difficulty" 
                  class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                >
                  <option v-for="difficulty in difficulties" :key="difficulty" :value="difficulty">
                    {{ difficulty }}
                  </option>
                </select>
              </div>
            </div>
            
            <!-- Ajout du champ pour l'image -->
            <div class="mb-4">
              <label class="block text-gray-300 mb-2">Image du quiz</label>
              
              <div class="flex items-center space-x-4">
                <!-- Aperçu de l'image -->
                <div 
                  class="w-32 h-32 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center"
                  :class="{'border-2 border-dashed border-gray-500': !imagePreview}"
                >
                  <img 
                    v-if="imagePreview" 
                    :src="imagePreview" 
                    alt="Aperçu de l'image" 
                    class="w-full h-full object-cover"
                  >
                  <span v-else class="text-gray-400 text-sm text-center px-2">
                    Aucune image sélectionnée
                  </span>
                </div>
                
                <div class="flex-1">
                  <!-- Option 1: Sélectionner une image prédéfinie -->
                  <div class="mb-2">
                    <label class="text-sm text-gray-300 mb-1 block">Choisir une image prédéfinie</label>
                    <select 
                      v-model="selectedPredefinedImage" 
                      class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      @change="selectPredefinedImage"
                    >
                      <option value="">-- Sélectionner une image --</option>
                      <option v-for="(url, key) in predefinedImages" :key="key" :value="key">
                        {{ key.charAt(0).toUpperCase() + key.slice(1) }}
                      </option>
                    </select>
                  </div>
                  
                  <!-- Option 2: Télécharger une image -->
                  <div>
                    <label class="text-sm text-gray-300 mb-1 block">Ou télécharger votre propre image</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      @change="handleImageUpload" 
                      class="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Questions du quiz -->
          <div class="mb-8">
            <h2 class="text-2xl font-semibold mb-4 text-pink-400">Questions</h2>
            
            <div v-for="(question, index) in quizData.questions" :key="index" class="mb-6 p-4 bg-gray-700 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-medium">Question {{ index + 1 }}</h3>
                <button 
                  type="button" 
                  @click="removeQuestion(index)" 
                  class="text-red-400 hover:text-red-600"
                >
                  Supprimer
                </button>
              </div>
              
              <div class="mb-4">
                <label :for="`question-${index}`" class="block text-gray-300 mb-2">Texte de la question</label>
                <input 
                  :id="`question-${index}`" 
                  v-model="question.text" 
                  class="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                >
              </div>
              
              <!-- Ajout de l'image pour la question -->
              <div class="mb-4">
                <label class="block text-gray-300 mb-2">Image de la question (optionnelle)</label>
                
                <div class="flex items-center space-x-4">
                  <!-- Aperçu de l'image -->
                  <div 
                    class="w-32 h-32 bg-gray-600 rounded-lg overflow-hidden flex items-center justify-center"
                    :class="{'border-2 border-dashed border-gray-500': !question.image}"
                  >
                    <img 
                      v-if="question.image" 
                      :src="question.image" 
                      alt="Aperçu de l'image" 
                      class="w-full h-full object-cover"
                    >
                    <span v-else class="text-gray-400 text-sm text-center px-2">
                      Aucune image
                    </span>
                  </div>
                  
                  <div class="flex-1">
                    <!-- Option 1: Sélectionner une image prédéfinie -->
                    <div class="mb-2">
                      <label class="text-sm text-gray-300 mb-1 block">Choisir une image prédéfinie</label>
                      <select 
                        v-model="question.selectedPredefinedImage" 
                        class="w-full bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        @change="selectQuestionPredefinedImage(question)"
                      >
                        <option value="">-- Sélectionner une image --</option>
                        <option v-for="(url, key) in predefinedImages" :key="key" :value="key">
                          {{ key.charAt(0).toUpperCase() + key.slice(1) }}
                        </option>
                      </select>
                    </div>
                    
                    <!-- Option 2: Télécharger une image -->
                    <div>
                      <label class="text-sm text-gray-300 mb-1 block">Ou télécharger une image</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        @change="(e) => handleQuestionImageUpload(e, question)" 
                        class="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"
                      >
                    </div>
                    
                    <!-- Bouton pour supprimer l'image -->
                    <button 
                      v-if="question.image" 
                      type="button" 
                      @click="removeQuestionImage(question)" 
                      class="mt-2 text-sm text-red-400 hover:text-red-600"
                    >
                      Supprimer l'image
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="mb-4">
                <label class="block text-gray-300 mb-2">Options</label>
                <div v-for="(option, optIndex) in question.options" :key="optIndex" class="flex items-center mb-2">
                  <input 
                    type="radio" 
                    :id="`question-${index}-option-${optIndex}`" 
                    :name="`question-${index}-correct`" 
                    :value="optIndex" 
                    v-model="question.correctAnswer" 
                    class="mr-2"
                    required
                  >
                  <input 
                    :id="`question-${index}-option-${optIndex}`" 
                    v-model="question.options[optIndex]" 
                    class="flex-1 bg-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Option de réponse"
                    required
                  >
                  <button 
                    type="button" 
                    @click="removeOption(question, optIndex)" 
                    class="ml-2 text-red-400 hover:text-red-600"
                    :disabled="question.options.length <= 2"
                  >
                    ×
                  </button>
                </div>
                
                <button 
                  type="button" 
                  @click="addOption(question)" 
                  class="mt-2 text-sm text-pink-400 hover:text-pink-600"
                  :disabled="question.options.length >= 6"
                >
                  + Ajouter une option
                </button>
              </div>
            </div>
            
            <button 
              type="button" 
              @click="addQuestion" 
              class="w-full py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
            >
              + Ajouter une question
            </button>
          </div>
          
          <div class="flex justify-between">
            <button 
              type="button" 
              @click="$router.push('/')" 
              class="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Annuler
            </button>
            
            <button 
              type="submit" 
              class="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition"
              :disabled="quizData.questions.length === 0"
            >
              Créer le quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useQuizStore } from '~/stores/quiz';
import { useRouter } from 'vue-router';

const router = useRouter();
const quizStore = useQuizStore();

// Images prédéfinies
const predefinedImages = {
  culture: '/images/cg.png',
  science: '/images/science.png',
  histoire: '/images/histoire.png',
  astronomie: '/images/astro.png',
  sport: '/images/sport.png',
  musique: '/images/musique.png',
  cinema: '/images/cinema.png',
  geographie: '/images/geographie.png',
  programmation: '/images/informatique.png',
  gastronomie: '/images/gastronomie.png',
  default: '/images/quiz-default.jpg'
};

// Données du formulaire
const quizData = reactive({
  title: '',
  description: '',
  categoryId: 1,
  difficulty: 'Facile',
  questions: [],
  image: ''
});

// État pour la gestion des images
const imagePreview = ref('');
const selectedPredefinedImage = ref('');
const uploadedImage = ref(null);

// Récupérer les catégories et difficultés
const categories = computed(() => quizStore.categories);
const difficulties = ['Facile', 'Moyen', 'Difficile', 'Expert'];

// Ajouter une question
function addQuestion() {
  quizData.questions.push({
    text: '',
    options: ['', ''],
    correctAnswer: 0,
    image: '', // Ajout du champ image
    selectedPredefinedImage: '' // Pour suivre l'image prédéfinie sélectionnée
  });
}

// Supprimer une question
function removeQuestion(index) {
  quizData.questions.splice(index, 1);
}

// Ajouter une option à une question
function addOption(question) {
  if (question.options.length < 6) {
    question.options.push('');
  }
}

// Supprimer une option d'une question
function removeOption(question, index) {
  if (question.options.length > 2) {
    question.options.splice(index, 1);
    
    // Ajuster la réponse correcte si nécessaire
    if (question.correctAnswer === index) {
      question.correctAnswer = 0;
    } else if (question.correctAnswer > index) {
      question.correctAnswer--;
    }
  }
}

// Sélectionner une image prédéfinie pour le quiz
function selectPredefinedImage() {
  if (selectedPredefinedImage.value) {
    quizData.image = predefinedImages[selectedPredefinedImage.value];
    imagePreview.value = predefinedImages[selectedPredefinedImage.value];
    uploadedImage.value = null;
  }
}

// Sélectionner une image prédéfinie pour une question
function selectQuestionPredefinedImage(question) {
  if (question.selectedPredefinedImage) {
    question.image = predefinedImages[question.selectedPredefinedImage];
  }
}

// Gérer le téléchargement d'image pour le quiz
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Vérifier le type et la taille du fichier
  if (!file.type.match('image.*')) {
    alert('Veuillez sélectionner une image');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB max
    alert('L\'image est trop volumineuse. Taille maximale: 5MB');
    return;
  }
  
  // Créer un aperçu de l'image et la redimensionner
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Redimensionner l'image si elle est trop grande
      const maxWidth = 800;
      const maxHeight = 600;
      
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Créer un canvas pour redimensionner l'image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir en base64 avec une qualité réduite
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      imagePreview.value = dataUrl;
      quizData.image = dataUrl; // Stocker l'image redimensionnée en base64
      selectedPredefinedImage.value = ''; // Réinitialiser la sélection d'image prédéfinie
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Gérer le téléchargement d'image pour une question
function handleQuestionImageUpload(event, question) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Vérifier le type et la taille du fichier
  if (!file.type.match('image.*')) {
    alert('Veuillez sélectionner une image');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB max
    alert('L\'image est trop volumineuse. Taille maximale: 5MB');
    return;
  }
  
  // Créer un aperçu de l'image et la redimensionner
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Redimensionner l'image si elle est trop grande
      const maxWidth = 800;
      const maxHeight = 600;
      
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Créer un canvas pour redimensionner l'image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir en base64 avec une qualité réduite
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      question.image = dataUrl; // Stocker l'image redimensionnée en base64
      question.selectedPredefinedImage = ''; // Réinitialiser la sélection d'image prédéfinie
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Supprimer l'image d'une question
function removeQuestionImage(question) {
  question.image = '';
  question.selectedPredefinedImage = '';
}

// Soumettre le formulaire
async function submitQuiz() {
  if (quizData.questions.length === 0) {
    alert('Veuillez ajouter au moins une question');
    return;
  }
  
  // Si aucune image n'est sélectionnée pour le quiz, utiliser une image par défaut
  if (!quizData.image) {
    quizData.image = predefinedImages.default;
  }
  
  // Nettoyer les données des questions avant de soumettre
  quizData.questions.forEach(question => {
    // Supprimer la propriété selectedPredefinedImage qui n'est pas nécessaire pour le stockage
    if (question.selectedPredefinedImage) {
      delete question.selectedPredefinedImage;
    }
  });
  
  console.log('Création du quiz:', quizData.title);
  console.log('Nombre de questions:', quizData.questions.length);
  
  try {
    // Créer le quiz
    const quizId = quizStore.addQuiz(quizData);
    console.log('Quiz créé avec ID:', quizId);
    
    // Forcer un rechargement des données
    quizStore.loadFromLocalStorage();
    
    // Afficher un message de confirmation
    alert('Quiz créé avec succès!');
    
    // Rediriger vers la page d'accueil
    router.push('/');
  } catch (error) {
    console.error('Erreur lors de la création du quiz:', error);
    alert('Une erreur est survenue lors de la création du quiz.');
  }
}
</script> 