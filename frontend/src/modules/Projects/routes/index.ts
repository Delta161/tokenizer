import type { RouteRecordRaw } from 'vue-router'
import ProjectList from '../components/ProjectList.vue'
import ProjectDetail from '../components/ProjectDetail.vue'
import ProjectForm from '../components/ProjectForm.vue'

/**
 * Unified Project Routes
 * Defines all routes related to projects
 */
const projectRoutes: RouteRecordRaw[] = [
  {
    path: '/projects',
    name: 'projects',
    component: ProjectList,
    meta: {
      requiresAuth: true,
      title: 'Projects'
    }
  },
  {
    path: '/projects/create',
    name: 'project-create',
    component: ProjectForm,
    meta: {
      requiresAuth: true,
      title: 'Create Project'
    }
  },
  {
    path: '/projects/:id',
    name: 'project-detail',
    component: ProjectDetail,
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Project Details'
    }
  },
  {
    path: '/projects/:id/edit',
    name: 'project-edit',
    component: ProjectForm,
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Edit Project'
    }
  }
]

export default projectRoutes