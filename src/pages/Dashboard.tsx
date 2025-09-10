import React, { useState, useEffect } from 'react';
import { Layers, TrendingUp, Users, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UploadForm from '../components/UploadForm';
import ProjectsTable from '../components/ProjectsTable';

interface DashboardStats {
  totalProjects: number;
  activeViews: number;
  clientFeedback: number;
  pendingReview: number;
}

const Dashboard: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeViews: 0,
    clientFeedback: 0,
    pendingReview: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [refreshTrigger]);

  const fetchDashboardStats = async () => {
    try {
      // Get total projects
      const { data: projects, error: projectsError } = await supabase
        .from('ar_projects')
        .select('id, status');

      if (projectsError) throw projectsError;

      // Get total feedback
      const { data: feedback, error: feedbackError } = await supabase
        .from('client_feedback')
        .select('id');

      if (feedbackError) throw feedbackError;

      // Calculate stats
      const totalProjects = projects?.length || 0;
      const pendingReview = projects?.filter(p => p.status === 'Pending').length || 0;
      const clientFeedback = feedback?.length || 0;
      
      // For active views, we'll estimate based on projects created in the last 30 days
      // In a real app, you'd track actual view analytics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentProjects, error: recentError } = await supabase
        .from('ar_projects')
        .select('id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (recentError) throw recentError;

      // Estimate active views as recent projects * average views per project
      const activeViews = (recentProjects?.length || 0) * 4; // Estimate 4 views per recent project

      setStats({
        totalProjects,
        activeViews,
        clientFeedback,
        pendingReview
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const statsData = [
    {
      name: 'Total Projects',
      value: loading ? '...' : stats.totalProjects.toString(),
      change: '+2.5%',
      changeType: 'positive',
      icon: Layers,
    },
    {
      name: 'Active Views',
      value: loading ? '...' : stats.activeViews.toString(),
      change: '+12.3%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Client Feedback',
      value: loading ? '...' : stats.clientFeedback.toString(),
      change: '+4.1%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Pending Review',
      value: loading ? '...' : stats.pendingReview.toString(),
      change: stats.pendingReview > 0 ? '+1.2%' : '0%',
      changeType: stats.pendingReview > 0 ? 'neutral' : 'positive',
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          TrueView Dashboard
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Create immersive AR experiences and collaborate with clients through interactive 3D previews
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((item) => (
          <div key={item.name} className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{item.name}</p>
                <p className="text-3xl font-bold text-slate-900">{item.value}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <item.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                item.changeType === 'positive' ? 'text-emerald-600' : 
                item.changeType === 'negative' ? 'text-red-600' : 'text-slate-600'
              }`}>
                {item.change}
              </span>
              <span className="text-sm text-slate-500 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-12">
        <UploadForm onUploadSuccess={handleUploadSuccess} />
        <ProjectsTable refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default Dashboard;