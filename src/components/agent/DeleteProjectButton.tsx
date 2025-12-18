'use client';

import { deleteProject } from '@/app/[locale]/agent/project-manager/actions';

interface DeleteProjectButtonProps {
  projectId: string;
}

export default function DeleteProjectButton({ projectId }: DeleteProjectButtonProps) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      const formData = new FormData();
      await deleteProject(projectId, formData);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
    >
      Delete Project
    </button>
  );
}
