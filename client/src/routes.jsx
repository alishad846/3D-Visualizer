export const routes = {
  dashboard: '/',
  login: '/login',
  register: '/register',
  projectView: (id) => `/project/${id}`,
  addProduct: '/product/add',
  editProduct: (id) => `/product/edit/${id}`,
  viewer: (id) => `/view/${id}`
};