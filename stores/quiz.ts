import { defineStore } from 'pinia';
import type { Quiz, Question, User, UserScore } from '~/types';
import { getImageForCategory, getImageForQuizTitle } from '~/services/imageService';

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    quizzes: [] as Quiz[],
    currentQuiz: null as Quiz | null,
    currentQuestionIndex: 0,
    userAnswers: [] as number[],
    score: 0,
    categories: [
      { id: 1, name: 'Culture Générale', icon: 'book' },
      { id: 2, name: 'Sciences', icon: 'flask' },
      { id: 3, name: 'Sport', icon: 'football' },
      { id: 4, name: 'Musique', icon: 'music' },
      { id: 5, name: 'Cinéma', icon: 'film' },
      { id: 6, name: 'Technologie', icon: 'computer' },
      { id: 7, name: 'Géographie', icon: 'globe' },
      { id: 8, name: 'Histoire', icon: 'scroll' },
      { id: 9, name: 'Art', icon: 'palette' },
      { id: 10, name: 'Littérature', icon: 'book-open' },
    ],
    users: [] as User[],
    currentUser: null as User | null,
    isDayMode: false, // Par défaut, le mode nuit est activé
    favorites: [] as number[], // Tableau des IDs de quiz favoris
    ghostMode: false, // Indique si le mode fantôme est activé
    ghostScores: [] as { questionIndex: number, timeSpent: number, correct: boolean }[], // Scores du fantôme
  }),
  
  getters: {
    getCurrentQuestion: (state) => {
      if (!state.currentQuiz) return null;
      return state.currentQuiz.questions[state.currentQuestionIndex];
    },
    isQuizFinished: (state) => {
      if (!state.currentQuiz) return false;
      return state.currentQuestionIndex >= state.currentQuiz.questions.length;
    },
    getQuizzesByCategory: (state) => (categoryId: number) => {
      return state.quizzes.filter(quiz => quiz.categoryId === categoryId);
    },
    getLeaderboard: (state) => {
      // Calculer le classement à partir des scores des utilisateurs
      const leaderboard = state.users.map(user => {
        const totalScore = user.scores.reduce((sum, score) => sum + score.score, 0);
        const completedQuizzes = user.scores.length;
        
        return {
          id: user.id,
          username: user.username,
          totalScore,
          completedQuizzes
        };
      });
      
      // Trier par score total décroissant
      return leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    },
    getFavoriteQuizzes: (state) => {
      return state.quizzes.filter(quiz => state.favorites.includes(quiz.id));
    },
    isQuizFavorite: (state) => (quizId: number) => {
      return state.favorites.includes(quizId);
    }
  },
  
  actions: {
    // Charger les données depuis localStorage
    loadFromLocalStorage() {
      const storedQuizzes = localStorage.getItem('quizzes');
      const storedUsers = localStorage.getItem('users');
      const storedCurrentUser = localStorage.getItem('currentUser');
      const storedIsDayMode = localStorage.getItem('isDayMode');
      
      // Charger la préférence de mode
      if (storedIsDayMode !== null) {
        this.isDayMode = storedIsDayMode === 'true';
      }
      
      // Vérifier si les quizzes stockés sont à jour
      const shouldReinitialize = !storedQuizzes || JSON.parse(storedQuizzes).length < 28;
      
      if (shouldReinitialize) {
        console.log('Réinitialisation des quiz pour inclure les nouveaux quiz');
        this.initializeQuizzes();
      } else {
        this.quizzes = JSON.parse(storedQuizzes);
      }
      
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      } else {
        this.initializeUsers();
      }
      
      if (storedCurrentUser) {
        this.currentUser = JSON.parse(storedCurrentUser);
      }
      
      // Vérifier et corriger les données utilisateur
      this.verifyUserData();
      
      // Charger les favoris
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        this.favorites = JSON.parse(storedFavorites);
      }
    },
    
    // Sauvegarder les données dans localStorage
    saveToLocalStorage() {
      try {
        // Pour les quizzes, vérifier si les images sont en base64 et les tronquer pour le log
        const quizzesForLog = this.quizzes.map(quiz => {
          const quizCopy = { ...quiz };
          if (quizCopy.image && quizCopy.image.startsWith('data:image')) {
            quizCopy.image = quizCopy.image.substring(0, 50) + '... [tronqué]';
          }
          return quizCopy;
        });
        
        console.log('Sauvegarde des quizzes:', quizzesForLog.length);
        
        // Sauvegarder les données dans localStorage
        localStorage.setItem('quizzes', JSON.stringify(this.quizzes));
        localStorage.setItem('users', JSON.stringify(this.users));
        
        if (this.currentUser) {
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
        
        localStorage.setItem('isDayMode', this.isDayMode.toString());
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        
        console.log('Données sauvegardées avec succès dans localStorage');
        
        // Vérifier la taille des données stockées
        const quizzesSize = new Blob([JSON.stringify(this.quizzes)]).size;
        console.log(`Taille des données quiz: ${(quizzesSize / 1024 / 1024).toFixed(2)} MB`);
        
        // Vérifier si on approche de la limite de localStorage (généralement 5-10 MB)
        if (quizzesSize > 4 * 1024 * 1024) {
          console.warn('Attention: Les données stockées approchent de la limite de localStorage');
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde dans localStorage:', error);
        
        // Si l'erreur est liée à la taille des données (quota exceeded)
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          alert('Erreur: La limite de stockage a été atteinte. Certaines données n\'ont pas pu être sauvegardées.');
        }
      }
    },
    
    startQuiz(quizId: number) {
      const quiz = this.quizzes.find(q => q.id === quizId);
      if (quiz) {
        this.currentQuiz = quiz;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
      }
    },
    
    answerQuestion(optionIndex: number) {
      console.log(`Réponse à la question ${this.currentQuestionIndex + 1}: option ${optionIndex}`);
      
      // Enregistrer la réponse de l'utilisateur
      this.userAnswers.push(optionIndex);
      
      // Vérifier si la réponse est correcte
      const currentQuestion = this.getCurrentQuestion;
      if (currentQuestion && optionIndex === currentQuestion.correctAnswer) {
        this.score++;
        console.log(`Réponse correcte! Score actuel: ${this.score}`);
      } else {
        console.log(`Réponse incorrecte. Score actuel: ${this.score}`);
      }
      
      // Passer à la question suivante
      this.currentQuestionIndex++;
      
      // Si le quiz est terminé, enregistrer le score
      if (this.isQuizFinished && this.currentQuiz) {
        console.log(`Quiz terminé! Score final: ${this.score}/${this.currentQuiz.questions.length}`);
        
        // Enregistrer le score si un utilisateur est connecté
        if (this.currentUser) {
          console.log(`Enregistrement du score pour l'utilisateur ${this.currentUser.username}`);
          
          // Créer un objet de score
          const scoreData = {
            quizId: this.currentQuiz.id,
            score: this.score,
            date: new Date().toISOString()
          };
          
          // Appeler la méthode saveScore
          this.saveScore(scoreData);
        } else {
          console.log("Aucun utilisateur connecté, le score ne sera pas enregistré");
        }
      }
    },
    
    // Enregistrer un score pour l'utilisateur actuel
    saveScore(scoreData: UserScore) {
      if (!this.currentUser) return;
      
      // Ajouter le score
      this.currentUser.scores.push(scoreData);
      
      // Sauvegarder dans localStorage
      this.saveToLocalStorage();
      
      console.log(`Score sauvegardé: ${scoreData.score} pour le quiz ${scoreData.quizId}`);
    },
    
    // Authentification
    login(username: string, password: string): boolean {
      // Vérifier si l'utilisateur existe
      const user = this.users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
      );
      
      if (user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log('Connexion réussie pour:', username);
        return true;
      }
      
      console.log('Échec de connexion pour:', username);
      return false;
    },
    
    logout() {
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      console.log('Déconnexion réussie');
    },
    
    register(username: string, password: string): boolean {
      // Vérifier si le nom d'utilisateur existe déjà
      const userExists = this.users.some(u => 
        u.username.toLowerCase() === username.toLowerCase()
      );
      
      if (userExists) {
        console.log('Nom d\'utilisateur déjà pris:', username);
        return false;
      }
      
      // Créer un nouvel utilisateur
      const newUser: User = {
        id: this.users.length + 1,
        username,
        password,
        scores: [],
        createdAt: new Date().toISOString()
      };
      
      this.users.push(newUser);
      this.currentUser = newUser;
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('users', JSON.stringify(this.users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      console.log('Inscription réussie pour:', username);
      return true;
    },
    
    // Ajouter un nouveau quiz
    addQuiz(quizData: any): number {
      // Générer un nouvel ID pour le quiz
      const newId = this.quizzes.length > 0 
        ? Math.max(...this.quizzes.map(q => q.id)) + 1 
        : 1;
      
      // Ajouter des IDs aux questions
      const questions = quizData.questions.map((q: any, index: number) => ({
        ...q,
        id: index + 1
      }));
      
      // Créer le nouveau quiz
      const newQuiz: Quiz = {
        id: newId,
        title: quizData.title,
        description: quizData.description,
        categoryId: quizData.categoryId,
        difficulty: quizData.difficulty,
        questions: questions,
        image: quizData.image
      };
      
      // Ajouter le quiz à la liste
      this.quizzes.push(newQuiz);
      
      // Sauvegarder dans localStorage
      this.saveToLocalStorage();
      
      console.log('Quiz ajouté avec succès:', newQuiz.title);
      console.log('Nombre total de quiz:', this.quizzes.length);
      
      return newId;
    },
    
    // Ajouter des quiz de démonstration
    initializeQuizzes() {
      this.quizzes = [
        {
          id: 1,
          title: 'Quiz de Culture Générale',
          description: 'Testez vos connaissances en culture générale',
          categoryId: 1,
          difficulty: 'Facile',
          questions: [
            {
              id: 1,
              text: 'Quelle est la capitale de la France?',
              options: ['Londres', 'Berlin', 'Paris', 'Madrid'],
              correctAnswer: 2
            },
            {
              id: 2,
              text: 'Qui a peint la Joconde?',
              options: ['Van Gogh', 'Picasso', 'Michel-Ange', 'Léonard de Vinci'],
              correctAnswer: 3
            },
            {
              id: 3,
              text: 'Quel est le plus grand océan du monde?',
              options: ['Atlantique', 'Indien', 'Arctique', 'Pacifique'],
              correctAnswer: 3
            }
          ],
          image: getImageForQuizTitle('Quiz de Culture Générale')
        },
      
        
        // Nouveaux quiz
        {
          id: 3,
          title: 'Histoire Mondiale',
          description: 'Explorez les grands événements qui ont façonné notre monde',
          categoryId: 1,
          difficulty: 'Difficile',
          questions: [
            {
              id: 1,
              text: 'En quelle année a débuté la Première Guerre mondiale?',
              options: ['1905', '1914', '1918', '1939'],
              correctAnswer: 1
            },
            {
              id: 2,
              text: 'Qui était le premier empereur de la Chine?',
              options: ['Qin Shi Huang', 'Mao Zedong', 'Sun Yat-sen', 'Confucius'],
              correctAnswer: 0
            },
            {
              id: 3,
              text: 'Quel traité a mis fin à la Première Guerre mondiale?',
              options: ['Traité de Versailles', 'Traité de Paris', 'Traité de Rome', 'Traité de Westphalie'],
              correctAnswer: 0
            },
            {
              id: 4,
              text: 'Qui a découvert l\'Amérique en 1492?',
              options: ['Marco Polo', 'Vasco de Gama', 'Christophe Colomb', 'Ferdinand Magellan'],
              correctAnswer: 2
            },
            {
              id: 5,
              text: 'Quelle ancienne civilisation a construit les pyramides de Gizeh?',
              options: ['Les Romains', 'Les Grecs', 'Les Égyptiens', 'Les Mayas'],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Histoire Mondiale')
        },
        {
          id: 4,
          title: 'Astronomie Avancée',
          description: 'Découvrez les mystères de l\'univers',
          categoryId: 2,
          difficulty: 'Expert',
          questions: [
            {
              id: 1,
              text: 'Quelle est la galaxie la plus proche de la Voie lactée?',
              options: ['Andromède', 'Triangulum', 'Centaurus A', 'Sombrero'],
              correctAnswer: 0
            },
            {
              id: 2,
              text: 'Qu\'est-ce qu\'un trou noir?',
              options: [
                'Une étoile morte', 
                'Une région de l\'espace où la gravité est si forte que rien ne peut s\'en échapper', 
                'Un espace vide dans l\'univers', 
                'Une planète sans lumière'
              ],
              correctAnswer: 1
            },
            
            {
              id: 3,
              text: 'Quelle est la plus grande planète du système solaire?',
              options: ['Terre', 'Mars', 'Jupiter', 'Saturne'],
              correctAnswer: 2
            },
            {
              id: 4,
              text: 'Qu\'est-ce que la théorie du Big Bang explique?',
              options: [
                'La formation des étoiles', 
                'L\'origine de l\'univers', 
                'La disparition des dinosaures', 
                'Le mouvement des planètes'
              ],
              correctAnswer: 1
            },
            {
              id: 5,
              text: 'Combien de temps met la lumière du Soleil pour atteindre la Terre?',
              options: ['8 minutes', '8 heures', '8 secondes', '8 jours'],
              correctAnswer: 0
            }
          ],
          image: getImageForQuizTitle('Astronomie Avancée')
        },
        {
          id: 5,
          title: 'Sport et Jeux Olympiques',
          description: 'Testez vos connaissances sur le monde du sport',
          categoryId: 3,
          difficulty: 'Moyen',
          questions: [
            {
              id: 1,
              text: 'Dans quel pays ont eu lieu les premiers Jeux Olympiques modernes?',
              options: ['France', 'Grèce', 'États-Unis', 'Royaume-Uni'],
              correctAnswer: 1
            },
            {
              id: 2,
              text: 'Combien de joueurs composent une équipe de football sur le terrain?',
              options: ['9', '10', '11', '12'],
              correctAnswer: 2
            },
            {
              id: 3,
              text: 'Quel pays a remporté le plus de Coupes du Monde de football?',
              options: ['Allemagne', 'Argentine', 'Brésil', 'Italie'],
              correctAnswer: 2
            },
            {
              id: 4,
              text: 'Dans quel sport utilise-t-on un volant?',
              options: ['Tennis', 'Badminton', 'Squash', 'Ping-pong'],
              correctAnswer: 1
            }
          ],
          image: getImageForQuizTitle('Sport et Jeux Olympiques')
        },
        {
          id: 6,
          title: 'Musique Pop',
          description: 'Connaissez-vous bien la musique populaire?',
          categoryId: 4,
          difficulty: 'Facile',
          questions: [
            {
              id: 1,
              text: 'Quel groupe britannique a sorti l\'album "Abbey Road"?',
              options: ['The Rolling Stones', 'The Beatles', 'Queen', 'Pink Floyd'],
              correctAnswer: 1
            },
            {
              id: 2,
              text: 'Qui est connu comme le "Roi de la Pop"?',
              options: ['Elvis Presley', 'Michael Jackson', 'Prince', 'David Bowie'],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'Quel instrument Jimi Hendrix jouait-il principalement?',
              options: ['Batterie', 'Piano', 'Guitare', 'Saxophone'],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Musique Pop')
        },
        {
          id: 7,
          title: 'Cinéma et Films Cultes',
          description: 'Pour les amateurs du 7ème art',
          categoryId: 1,
          difficulty: 'Moyen',
          questions: [
            {
              id: 1,
              text: 'Qui a réalisé le film "Pulp Fiction"?',
              options: ['Martin Scorsese', 'Steven Spielberg', 'Quentin Tarantino', 'Christopher Nolan'],
              correctAnswer: 2
            },
            {
              id: 2,
              text: 'Quel acteur a joué le rôle de Jack Dawson dans "Titanic"?',
              options: ['Brad Pitt', 'Leonardo DiCaprio', 'Tom Cruise', 'Johnny Depp'],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'Quel film a remporté l\'Oscar du meilleur film en 2020?',
              options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
              correctAnswer: 2
            },
            {
              id: 4,
              text: 'Dans la saga Star Wars, qui est le père de Luke Skywalker?',
              options: ['Obi-Wan Kenobi', 'Yoda', 'Dark Vador', 'L\'Empereur'],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Cinéma et Films Cultes')
        },
        {
          id: 8,
          title: 'Géographie Mondiale',
          description: 'Voyagez à travers le monde avec ce quiz',
          categoryId: 1,
          difficulty: 'Difficile',
          questions: [
            {
              id: 1,
              text: 'Quel est le plus grand désert du monde?',
              options: ['Sahara', 'Gobi', 'Antarctique', 'Kalahari'],
              correctAnswer: 2
            },
            {
              id: 2,
              text: 'Quel pays compte le plus grand nombre d\'îles au monde?',
              options: ['Indonésie', 'Philippines', 'Japon', 'Suède'],
              correctAnswer: 3
            },
            {
              id: 3,
              text: 'Quelle est la plus haute montagne d\'Afrique?',
              options: ['Mont Kenya', 'Kilimandjaro', 'Mont Blanc', 'Pic Margherita'],
              correctAnswer: 1
            },
            {
              id: 4,
              text: 'Quel est le plus long fleuve du monde?',
              options: ['Amazone', 'Nil', 'Mississippi', 'Yangtsé'],
              correctAnswer: 1
            },
            {
              id: 5,
              text: 'Dans quel pays se trouve le Machu Picchu?',
              options: ['Mexique', 'Brésil', 'Pérou', 'Colombie'],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Géographie Mondiale')
        },
        {
          id: 9,
          title: 'Programmation Informatique',
          description: 'Pour les passionnés de code',
          categoryId: 2,
          difficulty: 'Expert',
          questions: [
            {
              id: 1,
              text: 'Quel langage de programmation a été créé par Brendan Eich?',
              options: ['Java', 'Python', 'JavaScript', 'C++'],
              correctAnswer: 2
            },
            {
              id: 2,
              text: 'Qu\'est-ce qu\'un algorithme?',
              options: [
                'Un type de virus informatique', 
                'Une suite d\'instructions pour résoudre un problème', 
                'Un langage de programmation', 
                'Un composant matériel'
              ],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'Que signifie l\'acronyme HTML?',
              options: [
                'Hyper Text Markup Language', 
                'High Tech Modern Language', 
                'Hyper Transfer Markup Language', 
                'Home Tool Markup Language'
              ],
              correctAnswer: 0
            },
            {
              id: 4,
              text: 'Qu\'est-ce qu\'une API?',
              options: [
                'Application Programming Interface', 
                'Advanced Programming Interface', 
                'Automated Programming Installation', 
                'Application Process Integration'
              ],
              correctAnswer: 0
            },
            {
              id: 5,
              text: 'Quel est le principal avantage de la programmation orientée objet?',
              options: [
                'Exécution plus rapide', 
                'Moins de lignes de code', 
                'Réutilisation du code et modularité', 
                'Compatibilité avec tous les systèmes d\'exploitation'
              ],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Programmation Informatique')
        },
        {
          id: 10,
          title: 'Gastronomie Mondiale',
          description: 'Un voyage culinaire autour du monde',
          categoryId: 1,
          difficulty: 'Facile',
          questions: [
            {
              id: 1,
              text: 'De quel pays est originaire la pizza?',
              options: ['France', 'Espagne', 'Italie', 'Grèce'],
              correctAnswer: 2
            },
            {
              id: 2,
              text: 'Quel est l\'ingrédient principal du guacamole?',
              options: ['Tomate', 'Avocat', 'Oignon', 'Citron vert'],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'Quel pays est réputé pour ses sushis?',
              options: ['Chine', 'Corée', 'Thaïlande', 'Japon'],
              correctAnswer: 3
            },
            {
              id: 4,
              text: 'Quel fromage est traditionnellement utilisé dans une quiche lorraine?',
              options: ['Gruyère', 'Camembert', 'Roquefort', 'Brie'],
              correctAnswer: 0
            }
          ],
          image: getImageForQuizTitle('Gastronomie Mondiale')
        },
        {
          id: 11,
          title: 'Littérature Classique',
          description: 'Testez vos connaissances sur les grands classiques de la littérature mondiale',
          categoryId: 10,
          difficulty: 'Difficile',
          questions: [
            {
              id: 1,
              text: 'Qui a écrit "Les Misérables"?',
              options: ['Victor Hugo', 'Émile Zola', 'Gustave Flaubert', 'Alexandre Dumas'],
              correctAnswer: 0
            },
            {
              id: 2,
              text: 'Quel est le prénom du personnage principal de "L\'Étranger" d\'Albert Camus?',
              options: ['Jean', 'Meursault', 'Raymond', 'Albert'],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'Dans quelle ville se déroule principalement "Crime et Châtiment" de Dostoïevski?',
              options: ['Moscou', 'Kiev', 'Saint-Pétersbourg', 'Odessa'],
              correctAnswer: 2
            },
            {
              id: 4,
              text: 'Qui est l\'auteur de "Orgueil et Préjugés"?',
              options: ['Jane Austen', 'Charlotte Brontë', 'Emily Brontë', 'Virginia Woolf'],
              correctAnswer: 0
            },
            {
              id: 5,
              text: 'Quel roman de Marcel Proust commence par "Longtemps, je me suis couché de bonne heure"?',
              options: ['Du côté de chez Swann', 'À l\'ombre des jeunes filles en fleurs', 'Le Temps retrouvé', 'Sodome et Gomorrhe'],
              correctAnswer: 0
            }
          ],
          image: getImageForQuizTitle('Littérature Classique')
        },
        {
          id: 12,
          title: 'Art Moderne',
          description: 'Découvrez les mouvements et artistes qui ont révolutionné l\'art au 20e siècle',
          categoryId: 9,
          difficulty: 'Moyen',
          questions: [
            {
              id: 1,
              text: 'Qui a peint "Les Demoiselles d\'Avignon"?',
              options: ['Pablo Picasso', 'Salvador Dalí', 'Henri Matisse', 'Claude Monet'],
              correctAnswer: 0
            },
            {
              id: 2,
              text: 'Quel mouvement artistique a été fondé par André Breton?',
              options: ['Cubisme', 'Surréalisme', 'Dadaïsme', 'Expressionnisme'],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'Qui a créé la célèbre sculpture "Fontaine" (un urinoir signé)?',
              options: ['Constantin Brâncuși', 'Marcel Duchamp', 'Alberto Giacometti', 'Auguste Rodin'],
              correctAnswer: 1
            },
            {
              id: 4,
              text: 'Quel artiste est connu pour ses "drippings" (peintures par éclaboussures)?',
              options: ['Mark Rothko', 'Jackson Pollock', 'Willem de Kooning', 'Andy Warhol'],
              correctAnswer: 1
            },
            {
              id: 5,
              text: 'Quel mouvement artistique est caractérisé par des formes géométriques et des couleurs primaires?',
              options: ['Art nouveau', 'Pop Art', 'De Stijl', 'Fauvisme'],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Art Moderne')
        },
        {
          id: 13,
          title: 'Géographie Mondiale',
          description: 'Parcourez le monde à travers ce quiz sur les pays, capitales et merveilles naturelles',
          categoryId: 7,
          difficulty: 'Moyen',
          questions: [
            {
              id: 1,
              text: 'Quelle est la capitale de l\'Australie?',
              options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
              correctAnswer: 2
            },
            {
              id: 2,
              text: 'Quel est le plus long fleuve du monde?',
              options: ['Amazone', 'Nil', 'Mississippi', 'Yangtsé'],
              correctAnswer: 0
            },
            {
              id: 3,
              text: 'Dans quel pays se trouve le Machu Picchu?',
              options: ['Mexique', 'Pérou', 'Bolivie', 'Colombie'],
              correctAnswer: 1
            },
            {
              id: 4,
              text: 'Quel est le plus petit pays du monde?',
              options: ['Monaco', 'Nauru', 'Vatican', 'Liechtenstein'],
              correctAnswer: 2
            },
            {
              id: 5,
              text: 'Quelle chaîne de montagnes sépare l\'Europe de l\'Asie?',
              options: ['Les Alpes', 'Les Carpates', 'L\'Oural', 'Le Caucase'],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Géographie Mondiale')
        },
        {
          id: 14,
          title: 'Technologie et Innovations',
          description: 'Explorez l\'univers des innovations technologiques qui ont changé notre monde',
          categoryId: 6,
          difficulty: 'Difficile',
          questions: [
            {
              id: 1,
              text: 'En quelle année a été créé le World Wide Web par Tim Berners-Lee?',
              options: ['1985', '1989', '1993', '1997'],
              correctAnswer: 1
            },
            {
              id: 2,
              text: 'Quelle entreprise a développé le premier smartphone iPhone?',
              options: ['Microsoft', 'Google', 'Apple', 'Samsung'],
              correctAnswer: 2
            },
            {
              id: 3,
              text: 'Qui est considéré comme le père de l\'intelligence artificielle?',
              options: ['Alan Turing', 'John McCarthy', 'Marvin Minsky', 'Claude Shannon'],
              correctAnswer: 1
            },
            {
              id: 4,
              text: 'Quelle technologie est à la base des cryptomonnaies comme le Bitcoin?',
              options: ['Cloud computing', 'Blockchain', 'Machine learning', 'Quantum computing'],
              correctAnswer: 1
            },
            {
              id: 5,
              text: 'Quel langage de programmation a été créé par Guido van Rossum en 1991?',
              options: ['Java', 'C++', 'Python', 'Ruby'],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Technologie et Innovations')
        },
        {
          id: 15,
          title: 'Cinéma Hollywoodien',
          description: 'Plongez dans l\'univers du cinéma américain et ses plus grands succès',
          categoryId: 5,
          difficulty: 'Facile',
          questions: [
            {
              id: 1,
              text: 'Quel film a remporté l\'Oscar du meilleur film en 2020?',
              options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
              correctAnswer: 2
            },
            {
              id: 2,
              text: 'Qui a réalisé le film "Inception"?',
              options: ['Steven Spielberg', 'Christopher Nolan', 'James Cameron', 'Quentin Tarantino'],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'Quel acteur incarne Iron Man dans l\'univers cinématographique Marvel?',
              options: ['Chris Evans', 'Chris Hemsworth', 'Mark Ruffalo', 'Robert Downey Jr.'],
              correctAnswer: 3
            },
            {
              id: 4,
              text: 'Quel film détient le record du plus gros succès au box-office mondial?',
              options: ['Avatar', 'Avengers: Endgame', 'Titanic', 'Star Wars: Le Réveil de la Force'],
              correctAnswer: 1
            },
            {
              id: 5,
              text: 'Qui a joué le rôle principal dans "Forrest Gump"?',
              options: ['Tom Hanks', 'Brad Pitt', 'Leonardo DiCaprio', 'Johnny Depp'],
              correctAnswer: 0
            }
          ],
          image: getImageForQuizTitle('Cinéma Hollywoodien')
        },
        {
          id: 16,
          title: 'Histoire Antique',
          description: 'Voyagez dans le temps à la découverte des grandes civilisations de l\'Antiquité',
          categoryId: 8,
          difficulty: 'Expert',
          questions: [
            {
              id: 1,
              text: 'En quelle année avant J.C. Alexandre le Grand est-il mort?',
              options: ['356', '333', '323', '301'],
              correctAnswer: 2
            },
            {
              id: 2,
              text: 'Quelle civilisation a construit les pyramides de Gizeh?',
              options: ['Sumérienne', 'Égyptienne', 'Babylonienne', 'Perse'],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'Qui était le premier empereur romain?',
              options: ['Jules César', 'Auguste', 'Néron', 'Constantin'],
              correctAnswer: 1
            },
            {
              id: 4,
              text: 'Quelle bataille a mis fin à la Deuxième Guerre punique?',
              options: ['Cannes', 'Zama', 'Trasimène', 'Actium'],
              correctAnswer: 1
            },
            {
              id: 5,
              text: 'Quel philosophe grec a été le maître d\'Alexandre le Grand?',
              options: ['Socrate', 'Platon', 'Aristote', 'Épicure'],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Histoire Antique')
        },
        {
          id: 17,
          title: 'Jeux Vidéo',
          description: 'Testez vos connaissances sur l\'univers des jeux vidéo et leur histoire',
          categoryId: 6,
          difficulty: 'Moyen',
          questions: [
            {
              id: 1,
              text: 'Quelle entreprise a créé la console PlayStation?',
              options: ['Nintendo', 'Microsoft', 'Sony', 'Sega'],
              correctAnswer: 2
            },
            {
              id: 2,
              text: 'Quel est le personnage principal de la série "The Legend of Zelda"?',
              options: ['Zelda', 'Link', 'Ganon', 'Mario'],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'En quelle année est sorti le premier jeu "Minecraft"?',
              options: ['2007', '2009', '2011', '2013'],
              correctAnswer: 1
            },
            {
              id: 4,
              text: 'Quel jeu détient le record du jeu vidéo le plus vendu de tous les temps?',
              options: ['Minecraft', 'Tetris', 'Grand Theft Auto V', 'Wii Sports'],
              correctAnswer: 0
            },
            {
              id: 5,
              text: 'Quelle est la mascotte de Nintendo?',
              options: ['Sonic', 'Mario', 'Pikachu', 'Donkey Kong'],
              correctAnswer: 1
            }
          ],
          image: getImageForQuizTitle('Jeux Vidéo')
        },
        {
          id: 18,
          title: 'Cuisine du Monde',
          description: 'Partez à la découverte des saveurs et traditions culinaires des quatre coins du monde',
          categoryId: 1,
          difficulty: 'Facile',
          questions: [
            {
              id: 1,
              text: 'De quel pays est originaire le sushi?',
              options: ['Chine', 'Corée', 'Japon', 'Thaïlande'],
              correctAnswer: 2
            },
            {
              id: 2,
              text: 'Quel est l\'ingrédient principal de la paella espagnole traditionnelle?',
              options: ['Poulet', 'Fruits de mer', 'Riz', 'Chorizo'],
              correctAnswer: 2
            },
            {
              id: 3,
              text: 'De quel pays est originaire le couscous?',
              options: ['Maroc', 'Liban', 'Égypte', 'Turquie'],
              correctAnswer: 0
            },
            {
              id: 4,
              text: 'Quel fromage est traditionnellement utilisé pour préparer une fondue savoyarde?',
              options: ['Camembert', 'Roquefort', 'Beaufort', 'Brie'],
              correctAnswer: 2
            },
            {
              id: 5,
              text: 'Quel est le plat national de l\'Italie?',
              options: ['Pizza', 'Lasagnes', 'Risotto', 'Aucun plat officiel'],
              correctAnswer: 3
            }
          ],
          image: getImageForQuizTitle('Cuisine du Monde')
        },
        {
          id: 19,
          title: 'Animaux Extraordinaires',
          description: 'Découvrez les créatures les plus fascinantes et étonnantes du règne animal',
          categoryId: 2,
          difficulty: 'Facile',
          questions: [
            {
              id: 1,
              text: 'Quel animal peut survivre dans l\'espace?',
              options: ['Cafard', 'Tardigrade', 'Méduse', 'Rat-taupe nu'],
              correctAnswer: 1
            },
            {
              id: 2,
              text: 'Quel est l\'animal terrestre le plus rapide du monde?',
              options: ['Guépard', 'Antilope', 'Lévrier', 'Lion'],
              correctAnswer: 0
            },
            {
              id: 3,
              text: 'Quel animal peut régénérer ses membres?',
              options: ['Lézard', 'Étoile de mer', 'Salamandre', 'Toutes ces réponses'],
              correctAnswer: 3
            },
            {
              id: 4,
              text: 'Quel animal peut vivre le plus longtemps?',
              options: ['Tortue géante', 'Baleine boréale', 'Éléphant', 'Perroquet'],
              correctAnswer: 1
            },
            {
              id: 5,
              text: 'Quel animal possède le venin le plus puissant?',
              options: ['Cobra royal', 'Méduse-boîte', 'Mamba noir', 'Araignée banane'],
              correctAnswer: 1
            }
          ],
          image: getImageForQuizTitle('Animaux Extraordinaires')
        },
        {
          id: 20,
          title: 'Mythologie Grecque',
          description: 'Plongez dans l\'univers fascinant des dieux, héros et créatures de la mythologie grecque',
          categoryId: 8,
          difficulty: 'Moyen',
          questions: [
            {
              id: 1,
              text: 'Qui est le roi des dieux dans la mythologie grecque?',
              options: ['Apollon', 'Hadès', 'Zeus', 'Poséidon'],
              correctAnswer: 2
            },
            {
              id: 2,
              text: 'Quel héros a tué le Minotaure?',
              options: ['Persée', 'Thésée', 'Héraclès', 'Jason'],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'Qui est la déesse de la sagesse?',
              options: ['Héra', 'Aphrodite', 'Artémis', 'Athéna'],
              correctAnswer: 3
            },
            {
              id: 4,
              text: 'Quel est le nom du chien à trois têtes gardien des Enfers?',
              options: ['Cerbère', 'Chimère', 'Hydre', 'Scylla'],
              correctAnswer: 0
            },
            {
              id: 5,
              text: 'Qui a été condamné à pousser éternellement un rocher en haut d\'une colline?',
              options: ['Prométhée', 'Sisyphe', 'Tantale', 'Ixion'],
              correctAnswer: 1
            }
          ],
          image: getImageForQuizTitle('Mythologie Grecque')
        },
        {
          id: 21,
          title: 'Cinéma et Films Cultes',
          description: 'Testez vos connaissances sur les grands classiques du 7ème art',
          categoryId: 5,
          difficulty: 'Moyen',
          questions: [
            {
              id: 1,
              text: 'Qui a réalisé le film "Pulp Fiction"?',
              options: ['Martin Scorsese', 'Quentin Tarantino', 'Steven Spielberg', 'Christopher Nolan'],
              correctAnswer: 1
            },
            {
              id: 2,
              text: 'Quel acteur incarne Tony Stark / Iron Man dans l\'univers cinématographique Marvel?',
              options: ['Chris Evans', 'Chris Hemsworth', 'Robert Downey Jr.', 'Mark Ruffalo'],
              correctAnswer: 2
            },
            {
              id: 3,
              text: 'Quel film a remporté l\'Oscar du meilleur film en 2020?',
              options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
              correctAnswer: 2
            },
            {
              id: 4,
              text: 'Dans "Star Wars", quelle est la célèbre réplique de Dark Vador à Luke Skywalker?',
              options: ['Luke, je suis ton père', 'Non, je suis ton père', 'Rejoins-moi, mon fils', 'Tu ne connais pas le pouvoir du côté obscur'],
              correctAnswer: 1
            },
            {
              id: 5,
              text: 'Quel est le film le plus rentable de tous les temps (sans ajustement pour l\'inflation)?',
              options: ['Avatar', 'Titanic', 'Avengers: Endgame', 'Star Wars: Le Réveil de la Force'],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Cinéma et Films Cultes')
        },
        {
          id: 22,
          title: 'Capitales du Monde',
          description: 'Parcourez le globe et testez vos connaissances sur les capitales des pays',
          categoryId: 7,
          difficulty: 'Moyen',
          questions: [
            {
              id: 1,
              text: 'Quelle est la capitale de la Nouvelle-Zélande?',
              options: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton'],
              correctAnswer: 1
            },
            {
              id: 2,
              text: 'Quelle est la capitale du Canada?',
              options: ['Toronto', 'Montréal', 'Vancouver', 'Ottawa'],
              correctAnswer: 3
            },
            {
              id: 3,
              text: 'Quelle est la capitale du Brésil?',
              options: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'],
              correctAnswer: 2
            },
            {
              id: 4,
              text: 'Quelle est la capitale de la Suisse?',
              options: ['Zurich', 'Genève', 'Berne', 'Bâle'],
              correctAnswer: 2
            },
            {
              id: 5,
              text: 'Quelle est la capitale du Maroc?',
              options: ['Casablanca', 'Rabat', 'Marrakech', 'Fès'],
              correctAnswer: 1
            }
          ],
          image: getImageForQuizTitle('Géographie Mondiale')
        },
        {
          id: 23,
          title: 'Musique Contemporaine',
          description: 'Découvrez l\'univers de la musique moderne et ses artistes emblématiques',
          categoryId: 4,
          difficulty: 'Facile',
          questions: [
            {
              id: 1,
              text: 'Quel artiste a sorti l\'album "Thriller", l\'album le plus vendu de tous les temps?',
              options: ['Prince', 'Michael Jackson', 'Madonna', 'Elvis Presley'],
              correctAnswer: 1
            },
            {
              id: 2,
              text: 'Quel groupe britannique a sorti l\'album "Abbey Road"?',
              options: ['The Rolling Stones', 'The Beatles', 'Queen', 'Pink Floyd'],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'Qui est considéré comme le "King of Rock and Roll"?',
              options: ['Elvis Presley', 'Chuck Berry', 'Little Richard', 'Jerry Lee Lewis'],
              correctAnswer: 0
            },
            {
              id: 4,
              text: 'Quel instrument Yo-Yo Ma joue-t-il?',
              options: ['Violon', 'Piano', 'Violoncelle', 'Flûte'],
              correctAnswer: 2
            },
            {
              id: 5,
              text: 'Quel groupe a sorti la chanson "Bohemian Rhapsody"?',
              options: ['Led Zeppelin', 'The Who', 'Queen', 'AC/DC'],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Musique')
        },
        {
          id: 24,
          title: 'Astronomie et Espace',
          description: 'Explorez les mystères de l\'univers et les découvertes astronomiques',
          categoryId: 2,
          difficulty: 'Difficile',
          questions: [
            {
              id: 1,
              text: 'Quelle est la plus grande planète du système solaire?',
              options: ['Saturne', 'Jupiter', 'Neptune', 'Uranus'],
              correctAnswer: 1
            },
            {
              id: 2,
              text: 'Qu\'est-ce qu\'un trou noir?',
              options: ['Une étoile morte', 'Une région de l\'espace avec une gravité si intense que rien ne peut s\'en échapper', 'Un type de galaxie', 'Une planète sans lumière'],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'Quelle est la galaxie la plus proche de la Voie lactée?',
              options: ['Andromède', 'Triangle', 'Naine du Grand Chien', 'Sombrero'],
              correctAnswer: 2
            },
            {
              id: 4,
              text: 'Qui a formulé la théorie de la relativité?',
              options: ['Isaac Newton', 'Albert Einstein', 'Stephen Hawking', 'Galileo Galilei'],
              correctAnswer: 1
            },
            {
              id: 5,
              text: 'Quelle est la composition principale du Soleil?',
              options: ['Oxygène et carbone', 'Fer et nickel', 'Hydrogène et hélium', 'Azote et oxygène'],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Astronomie')
        },
        {
          id: 25,
          title: 'Intelligence Artificielle',
          description: 'Découvrez les concepts fondamentaux et les avancées de l\'IA',
          categoryId: 6,
          difficulty: 'Difficile',
          questions: [
            {
              id: 1,
              text: 'Qu\'est-ce que le "deep learning"?',
              options: ['Un type de programmation', 'Une sous-catégorie de l\'apprentissage automatique utilisant des réseaux de neurones', 'Un langage de programmation pour l\'IA', 'Un système d\'exploitation spécialisé'],
              correctAnswer: 1
            },
            {
              id: 2,
              text: 'Qui est considéré comme le père de l\'intelligence artificielle?',
              options: ['Alan Turing', 'John McCarthy', 'Marvin Minsky', 'Claude Shannon'],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'Qu\'est-ce que le test de Turing?',
              options: ['Un test de QI pour les ordinateurs', 'Un test pour mesurer la puissance de calcul', 'Un test pour déterminer si une machine peut imiter l\'intelligence humaine', 'Un test de sécurité informatique'],
              correctAnswer: 2
            },
            {
              id: 4,
              text: 'Quel modèle d\'IA a battu le champion du monde de Go en 2016?',
              options: ['Watson', 'AlphaGo', 'Deep Blue', 'GPT-3'],
              correctAnswer: 1
            },
            {
              id: 5,
              text: 'Qu\'est-ce que le "NLP" dans le contexte de l\'IA?',
              options: ['Natural Language Processing', 'Neural Learning Protocol', 'Network Logic Programming', 'New Learning Paradigm'],
              correctAnswer: 0
            }
          ],
          image: getImageForQuizTitle('Technologie')
        },
        {
          id: 26,
          title: 'Art Contemporain',
          description: 'Explorez les mouvements artistiques et les artistes qui définissent notre époque',
          categoryId: 9,
          difficulty: 'Moyen',
          questions: [
            {
              id: 1,
              text: 'Qui a créé l\'œuvre "Campbell\'s Soup Cans"?',
              options: ['Andy Warhol', 'Roy Lichtenstein', 'Jackson Pollock', 'Mark Rothko'],
              correctAnswer: 0
            },
            {
              id: 2,
              text: 'Quel artiste est connu pour ses installations de points colorés?',
              options: ['Damien Hirst', 'Yayoi Kusama', 'Jeff Koons', 'Banksy'],
              correctAnswer: 1
            },
            {
              id: 3,
              text: 'Qui est l\'artiste de rue anonyme connu pour ses graffitis au pochoir?',
              options: ['Jean-Michel Basquiat', 'Keith Haring', 'Banksy', 'Shepard Fairey'],
              correctAnswer: 2
            },
            {
              id: 4,
              text: 'Quelle œuvre d\'art consiste en un requin conservé dans du formaldéhyde?',
              options: ['La Joconde', 'The Physical Impossibility of Death in the Mind of Someone Living', 'Fountain', 'Les Nymphéas'],
              correctAnswer: 1
            },
            {
              id: 5,
              text: 'Quel mouvement artistique est caractérisé par l\'utilisation d\'objets du quotidien?',
              options: ['Impressionnisme', 'Cubisme', 'Pop Art', 'Surréalisme'],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Art')
        },
        {
          id: 27,
          title: 'Sports Olympiques',
          description: 'Testez vos connaissances sur les Jeux Olympiques et leurs disciplines',
          categoryId: 3,
          difficulty: 'Moyen',
          questions: [
            {
              id: 1,
              text: 'Dans quelle ville se sont déroulés les premiers Jeux Olympiques modernes en 1896?',
              options: ['Paris', 'Athènes', 'Londres', 'Rome'],
              correctAnswer: 1
            },
            {
              id: 2,
              text: 'Combien d\'anneaux composent le symbole olympique?',
              options: ['3', '4', '5', '6'],
              correctAnswer: 2
            },
            {
              id: 3,
              text: 'Quel sport a été ajouté aux Jeux Olympiques de Tokyo 2020?',
              options: ['Skateboard', 'Cricket', 'Squash', 'Polo'],
              correctAnswer: 0
            },
            {
              id: 4,
              text: 'Qui détient le record du plus grand nombre de médailles d\'or olympiques?',
              options: ['Usain Bolt', 'Michael Phelps', 'Larisa Latynina', 'Carl Lewis'],
              correctAnswer: 1
            },
            {
              id: 5,
              text: 'Quelle ville accueillera les Jeux Olympiques d\'été de 2024?',
              options: ['Tokyo', 'Los Angeles', 'Paris', 'Londres'],
              correctAnswer: 2
            }
          ],
          image: getImageForQuizTitle('Sport')
        },
        {
          id: 28,
          title: 'Philosophie et Penseurs',
          description: 'Explorez les grandes idées et les philosophes qui ont façonné notre pensée',
          categoryId: 1,
          difficulty: 'Difficile',
          questions: [
            {
              id: 1,
              text: 'Qui a écrit "Le Prince"?',
              options: ['Thomas Hobbes', 'Jean-Jacques Rousseau', 'Nicolas Machiavel', 'John Locke'],
              correctAnswer: 2
            },
            {
              id: 2,
              text: 'Quelle philosophie est associée à Jean-Paul Sartre?',
              options: ['Existentialisme', 'Empirisme', 'Rationalisme', 'Stoïcisme'],
              correctAnswer: 0
            },
            {
              id: 3,
              text: 'Qui a dit "Je pense, donc je suis"?',
              options: ['Platon', 'René Descartes', 'Aristote', 'Friedrich Nietzsche'],
              correctAnswer: 1
            },
            {
              id: 4,
              text: 'Quelle est la principale préoccupation de l\'éthique?',
              options: ['La beauté', 'La vérité', 'Le bien et le mal', 'L\'existence'],
              correctAnswer: 2
            },
            {
              id: 5,
              text: 'Qui est l\'auteur de "Ainsi parlait Zarathoustra"?',
              options: ['Søren Kierkegaard', 'Friedrich Nietzsche', 'Immanuel Kant', 'Georg Wilhelm Friedrich Hegel'],
              correctAnswer: 1
            }
          ],
          image: getImageForQuizTitle('Culture')
        }
      ];
      this.saveToLocalStorage();
    },
    initializeUsers() {
      // Vérifier si des utilisateurs existent déjà
      if (this.users.length === 0) {
        // Ajouter un utilisateur par défaut pour les tests
        this.users.push({
          id: 1,
          username: 'demo',
          password: 'password',
          scores: [],
          createdAt: new Date().toISOString()
        });
        
        // Sauvegarder dans le localStorage
        localStorage.setItem('users', JSON.stringify(this.users));
        console.log('Utilisateur de démonstration créé: demo / password');
      }
    },
    // Ajouter cette méthode pour déboguer les scores
    debugScores() {
      console.log('===== DÉBOGAGE DES SCORES =====');
      console.log('Utilisateur actuel:', this.currentUser);
      
      if (this.currentUser) {
        console.log('Scores de l\'utilisateur:', this.currentUser.scores);
        
        // Trouver l'utilisateur dans le tableau des utilisateurs
        const userInArray = this.users.find(u => u.id === this.currentUser!.id);
        console.log('Utilisateur dans le tableau:', userInArray);
        
        if (userInArray) {
          console.log('Scores dans le tableau:', userInArray.scores);
        }
      }
      
      console.log('Tous les utilisateurs:', this.users);
      console.log('===== FIN DU DÉBOGAGE =====');
    },
    // Ajouter cette méthode pour vérifier la structure des données utilisateur
    verifyUserData() {
      console.log("=== VÉRIFICATION DES DONNÉES UTILISATEUR ===");
      
      // Vérifier l'utilisateur actuel
      if (this.currentUser) {
        console.log("Utilisateur actuel:", this.currentUser);
        
        // Vérifier si l'utilisateur a un tableau de scores
        if (!this.currentUser.scores) {
          console.error("L'utilisateur actuel n'a pas de tableau de scores!");
          this.currentUser.scores = [];
          console.log("Tableau de scores créé");
        }
        
        // Vérifier si l'utilisateur existe dans le tableau des utilisateurs
        const userInArray = this.users.find(u => u.id === this.currentUser!.id);
        
        if (!userInArray) {
          console.error("L'utilisateur actuel n'existe pas dans le tableau des utilisateurs!");
          this.users.push(this.currentUser);
          console.log("Utilisateur ajouté au tableau des utilisateurs");
        }
      } else {
        console.log("Aucun utilisateur connecté");
      }
      
      // Vérifier tous les utilisateurs
      console.log("Nombre d'utilisateurs:", this.users.length);
      
      this.users.forEach((user, index) => {
        console.log(`Utilisateur ${index + 1}:`, user);
        
        // Vérifier si l'utilisateur a un tableau de scores
        if (!user.scores) {
          console.error(`L'utilisateur ${user.username} n'a pas de tableau de scores!`);
          user.scores = [];
          console.log("Tableau de scores créé");
        }
      });
      
      console.log("=== FIN DE LA VÉRIFICATION ===");
      
      // Sauvegarder les données corrigées
      this.saveToLocalStorage();
    },
    toggleDayMode() {
      this.isDayMode = !this.isDayMode;
      
      // Ajouter ou supprimer la classe day-mode sur l'élément HTML
      if (this.isDayMode) {
        document.documentElement.classList.add('day-mode');
      } else {
        document.documentElement.classList.remove('day-mode');
      }
      
      localStorage.setItem('isDayMode', this.isDayMode.toString());
    },
    addToFavorites(quizId: number) {
      if (!this.favorites.includes(quizId)) {
        this.favorites.push(quizId);
        this.saveToLocalStorage();
      }
    },
    removeFromFavorites(quizId: number) {
      const index = this.favorites.indexOf(quizId);
      if (index !== -1) {
        this.favorites.splice(index, 1);
        this.saveToLocalStorage();
      }
    },
    toggleFavorite(quizId: number) {
      if (this.favorites.includes(quizId)) {
        this.removeFromFavorites(quizId);
      } else {
        this.addToFavorites(quizId);
      }
    },
    // Activer le mode fantôme pour un quiz spécifique
    activateGhostMode(quizId: number) {
      // Vérifier si l'utilisateur est connecté
      if (!this.currentUser) {
        console.warn("L'utilisateur doit être connecté pour utiliser le mode fantôme");
        return false;
      }
      
      // Vérifier si l'utilisateur a déjà joué à ce quiz
      const previousScore = this.currentUser.scores.find(score => score.quizId === quizId);
      if (!previousScore) {
        console.warn("Aucun score précédent trouvé pour ce quiz");
        return false;
      }
      
      // Récupérer les détails du meilleur score précédent
      const bestScore = this.getBestScoreDetails(quizId);
      if (!bestScore || !bestScore.details) {
        console.warn("Aucun détail de score précédent trouvé");
        return false;
      }
      
      // Activer le mode fantôme
      this.ghostMode = true;
      this.ghostScores = bestScore.details;
      
      console.log("Mode fantôme activé avec", this.ghostScores.length, "réponses");
      return true;
    },
    
    // Désactiver le mode fantôme
    deactivateGhostMode() {
      this.ghostMode = false;
      this.ghostScores = [];
    },
    
    // Enregistrer les détails d'une réponse
    saveAnswerDetail(questionIndex: number, timeSpent: number, correct: boolean) {
      if (!this.currentUser || !this.currentQuiz) return;
      
      // Si c'est la première réponse, initialiser le tableau de détails
      if (!this.currentUser.scoreDetails) {
        this.currentUser.scoreDetails = {};
      }
      
      // Si c'est le premier score pour ce quiz, initialiser le tableau
      if (!this.currentUser.scoreDetails[this.currentQuiz.id]) {
        this.currentUser.scoreDetails[this.currentQuiz.id] = [];
      }
      
      // Ajouter les détails de la réponse
      this.currentUser.scoreDetails[this.currentQuiz.id].push({
        questionIndex,
        timeSpent,
        correct
      });
      
      // Sauvegarder dans localStorage
      this.saveToLocalStorage();
    },
    
    // Obtenir les détails du meilleur score pour un quiz
    getBestScoreDetails(quizId: number) {
      if (!this.currentUser) return null;
      
      // Trouver tous les scores pour ce quiz
      const quizScores = this.currentUser.scores.filter(score => score.quizId === quizId);
      if (quizScores.length === 0) return null;
      
      // Trouver le meilleur score
      const bestScore = quizScores.reduce((best, current) => 
        current.score > best.score ? current : best
      , quizScores[0]);
      
      // Récupérer les détails de ce score
      if (!this.currentUser.scoreDetails || !this.currentUser.scoreDetails[quizId]) {
        return { score: bestScore.score, details: null };
      }
      
      return { 
        score: bestScore.score, 
        details: this.currentUser.scoreDetails[quizId]
      };
    }
  }
}); 