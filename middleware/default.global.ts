export default defineNuxtRouteMiddleware((to, from) => {
  // Ne redirigez que si la route n'existe pas ET n'est pas déjà la page d'accueil
  if (to.matched.length === 0 && to.path !== '/') {
    return navigateTo('/')
  }
}) 