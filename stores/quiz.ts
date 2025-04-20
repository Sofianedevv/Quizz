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
    ],
    users: [] as User[],
    currentUser: null as User | null,
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
    }
  },
  
  actions: {
    // Charger les données depuis localStorage
    loadFromLocalStorage() {
      const storedQuizzes = localStorage.getItem('quizzes');
      const storedUsers = localStorage.getItem('users');
      const storedCurrentUser = localStorage.getItem('currentUser');
      
      if (storedQuizzes) {
        this.quizzes = JSON.parse(storedQuizzes);
      } else {
        this.initializeQuizzes();
      }
      
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      }
      
      if (storedCurrentUser) {
        this.currentUser = JSON.parse(storedCurrentUser);
      }
    },
    
    // Sauvegarder les données dans localStorage
    saveToLocalStorage() {
      // Pour les quizzes, vérifier si les images sont en base64 et les tronquer pour le log
      const quizzesForLog = this.quizzes.map(quiz => {
        const quizCopy = { ...quiz };
        if (quizCopy.image && quizCopy.image.startsWith('data:image')) {
          quizCopy.image = quizCopy.image.substring(0, 50) + '... [tronqué]';
        }
        return quizCopy;
      });
      
      console.log('Sauvegarde des quizzes:', quizzesForLog);
      
      localStorage.setItem('quizzes', JSON.stringify(this.quizzes));
      localStorage.setItem('users', JSON.stringify(this.users));
      if (this.currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
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
      this.userAnswers.push(optionIndex);
      
      const currentQuestion = this.getCurrentQuestion;
      if (currentQuestion && optionIndex === currentQuestion.correctAnswer) {
        this.score++;
      }
      
      this.currentQuestionIndex++;
      
      // Si le quiz est terminé et qu'un utilisateur est connecté, enregistrer le score
      if (this.isQuizFinished && this.currentUser && this.currentQuiz) {
        this.saveScore({
          quizId: this.currentQuiz.id,
          score: this.score,
          maxScore: this.currentQuiz.questions.length,
          date: new Date().toISOString()
        });
      }
    },
    
    // Enregistrer un score pour l'utilisateur actuel
    saveScore(scoreData: { quizId: number; score: number; maxScore: number; date: string }) {
      if (!this.currentUser) return;
      
      const userIndex = this.users.findIndex(u => u.id === this.currentUser!.id);
      if (userIndex === -1) return;
      
      if (!this.users[userIndex].scores) {
        this.users[userIndex].scores = [];
      }
      
      this.users[userIndex].scores.push(scoreData);
      this.saveToLocalStorage();
    },
    
    // Authentification
    login(email: string, password: string) {
      const user = this.users.find(u => u.email === email && u.password === password);
      if (user) {
        // Créer un nouvel objet sans le mot de passe
        const { password: _, ...userWithoutPassword } = user;
        this.currentUser = userWithoutPassword as User;
        this.saveToLocalStorage();
        return true;
      }
      return false;
    },
    
    logout() {
      this.currentUser = null;
      localStorage.removeItem('currentUser');
    },
    
    register(userData: { username: string; email: string; password: string }) {
      // Vérifier si l'email existe déjà
      if (this.users.some(u => u.email === userData.email)) {
        return false;
      }
      
      // Créer un nouvel utilisateur
      const newUser = {
        id: Date.now(),
        username: userData.username,
        email: userData.email,
        password: userData.password,
        scores: []
      };
      
      this.users.push(newUser);
      
      // Créer une version sans mot de passe pour currentUser
      const { password: _, ...userWithoutPassword } = newUser;
      this.currentUser = userWithoutPassword as User;
      
      this.saveToLocalStorage();
      return true;
    },
    
    // Ajouter un nouveau quiz
    addQuiz(quizData: Omit<Quiz, 'id'>) {
      const newQuiz = {
        id: Date.now(),
        ...quizData,
        questions: quizData.questions.map((q, index) => ({
          ...q,
          id: Date.now() + index
        })),
        image: quizData.image || getImageForCategory(quizData.categoryId)
      };
      
      this.quizzes.push(newQuiz);
      this.saveToLocalStorage();
      return newQuiz.id;
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
        }
      ];
      this.saveToLocalStorage();
    }
  }
}); 