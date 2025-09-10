import React, { useState, useEffect } from 'react';
import { Eye, Copy, ExternalLink, Clock, CheckCircle, AlertCircle, Lock, Trash2, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import toast from 'react-hot-toast';

type ARProject = Database['public']['Tables']['ar_projects']['Row'];

interface ProjectsTableProps {
  refreshTrigger: number;
}

interface DeleteConfirmationProps {
  isOpen: boolean;
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  projectName,
  onConfirm,
  onCancel,
  isDeleting
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 p-6 sm:p-8 max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="p-4 bg-red-50 rounded-full w-fit mx-auto">
            <Trash2 className="h-8 w-8 text-red-600" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Project</h3>
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold">"{projectName}"</span>? 
              This action cannot be undone and will permanently remove all associated files and data.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-colors duration-150 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-semibold transition-colors duration-150 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectsTable: React.FC<ProjectsTableProps> = ({ refreshTrigger }) => {
  const [projects, setProjects] = useState<ARProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    project: ARProject | null;
  }>({ isOpen: false, project: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [refreshTrigger]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('ar_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const deleteFileFromStorage = async (url: string, bucket: string) => {
    try {
      // Extract filename from URL - handle both old and new URL formats
      const urlParts = url.split('/');
      let filename = urlParts[urlParts.length - 1];
      
      // Remove any query parameters
      filename = filename.split('?')[0];
      
      console.log(`Attempting to delete file: ${filename} from bucket: ${bucket}`);
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filename]);

      if (error) {
        console.warn(`Failed to delete file ${filename} from ${bucket}:`, error);
      } else {
        console.log(`Successfully deleted file: ${filename}`);
      }
    } catch (error) {
      console.warn('Error deleting file from storage:', error);
    }
  };

  const handleDeleteProject = async (project: ARProject) => {
    setIsDeleting(true);
    
    try {
      console.log('=== STARTING PROJECT DELETION ===');
      console.log('Project to delete:', {
        id: project.id,
        share_link_id: project.share_link_id,
        product_name: project.product_name
      });

      // Step 1: Verify project exists before deletion
      const { data: existingProject, error: checkError } = await supabase
        .from('ar_projects')
        .select('id, share_link_id, product_name')
        .eq('id', project.id)
        .maybeSingle();

      if (checkError) {
        console.error('Project verification failed:', checkError);
        throw new Error(`Project verification failed: ${checkError.message}`);
      }

      if (!existingProject) {
        console.log('Project not found - may have been already deleted');
        toast.success('Project has already been deleted');
        setProjects(prev => prev.filter(p => p.id !== project.id));
        setDeleteConfirmation({ isOpen: false, project: null });
        await fetchProjects();
        return;
      }

      console.log('Project verified exists:', existingProject);

      // Step 2: Delete related feedback first (using share_link_id as the foreign key)
      console.log('Deleting related feedback...');
      const { data: deletedFeedback, error: feedbackError } = await supabase
        .from('client_feedback')
        .delete()
        .eq('ar_project_id', project.share_link_id)
        .select();

      if (feedbackError) {
        console.error('Error deleting related feedback:', feedbackError);
        throw new Error(`Failed to delete related feedback: ${feedbackError.message}`);
      }

      console.log('Deleted feedback records:', deletedFeedback?.length || 0);

      // Step 3: Delete the project from database with explicit verification
      console.log('Deleting project from database...');
      const { data: deletedProject, error: projectError } = await supabase
        .from('ar_projects')
        .delete()
        .eq('id', project.id)
        .select();

      if (projectError) {
        console.error('Database deletion error:', projectError);
        throw new Error(`Failed to delete project from database: ${projectError.message}`);
      }

      if (!deletedProject || deletedProject.length === 0) {
        console.error('No project was deleted - project may not exist or deletion failed');
        throw new Error('Project deletion failed - no rows affected');
      }

      console.log('Successfully deleted project from database:', deletedProject);

      // Step 4: Verify deletion by checking if project still exists
      const { data: verifyDeleted, error: verifyError } = await supabase
        .from('ar_projects')
        .select('id')
        .eq('id', project.id)
        .maybeSingle();

      if (verifyError) {
        console.error('Deletion verification failed:', verifyError);
        throw new Error('Project deletion could not be verified');
      }

      if (verifyDeleted) {
        console.error('Project still exists after deletion attempt');
        throw new Error('Project deletion failed - project still exists');
      }

      console.log('Deletion verified - project no longer exists in database');

      // Step 5: Delete associated files from storage (do this after database deletion)
      console.log('Deleting associated files...');
      const deletePromises = [];
      
      if (project.glb_url) {
        deletePromises.push(deleteFileFromStorage(project.glb_url, 'ar-models'));
      }
      if (project.usdz_url) {
        deletePromises.push(deleteFileFromStorage(project.usdz_url, 'ar-models'));
      }
      if (project.thumbnail_url) {
        deletePromises.push(deleteFileFromStorage(project.thumbnail_url, 'ar-thumbnails'));
      }

      // Wait for all file deletions to complete (but don't fail if they don't work)
      const fileResults = await Promise.allSettled(deletePromises);
      console.log('File deletion results:', fileResults);

      // Step 6: Update local state immediately
      setProjects(prev => prev.filter(p => p.id !== project.id));
      
      // Step 7: Refresh the data from the server to ensure consistency
      await fetchProjects();
      
      toast.success('Project deleted successfully');
      setDeleteConfirmation({ isOpen: false, project: null });

      console.log('=== PROJECT DELETION COMPLETED SUCCESSFULLY ===');
    } catch (error) {
      console.error('=== PROJECT DELETION FAILED ===');
      console.error('Error details:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to delete project: ${errorMessage}`);
      
      // Refresh the projects list to ensure UI is in sync with database
      await fetchProjects();
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'Needs Revision':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      case 'Needs Revision':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
    }
  };

  const copyLink = async (shareLinkId: string) => {
    const link = `${window.location.origin}/ar-client-preview?id=${shareLinkId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const copyAccessCode = async (accessCode: string) => {
    try {
      await navigator.clipboard.writeText(accessCode);
      toast.success('Access code copied!');
    } catch (error) {
      toast.error('Failed to copy access code');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">AR Projects</h2>
            <p className="text-slate-600 mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''} created
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-4">
              <Eye className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-500">Upload your first AR experience to get started!</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Access Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={project.thumbnail_url}
                            alt={project.product_name}
                            className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {project.product_name}
                            </div>
                            {project.notes && (
                              <div className="text-xs text-slate-500 mt-1 max-w-xs truncate">
                                {project.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(project.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          <span>{project.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {project.access_code ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-1.5">
                              <Lock className="h-3 w-3 text-slate-500" />
                              <span className="text-sm font-mono text-slate-700">{project.access_code}</span>
                            </div>
                            <button
                              onClick={() => copyAccessCode(project.access_code!)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-150"
                              title="Copy access code"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No code</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => window.open(`/ar-client-preview?id=${project.share_link_id}`, '_blank')}
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-150"
                            title="Preview AR"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => copyLink(project.share_link_id)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="Copy Link"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => window.open(`/ar-client-preview?id=${project.share_link_id}`, '_blank')}
                            className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                            title="Open Link"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmation({ isOpen: true, project })}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete Project"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        projectName={deleteConfirmation.project?.product_name || ''}
        onConfirm={() => deleteConfirmation.project && handleDeleteProject(deleteConfirmation.project)}
        onCancel={() => setDeleteConfirmation({ isOpen: false, project: null })}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ProjectsTable;