import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, AlertCircle, Clock, User, TrendingUp, Users, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type ClientFeedback = Database['public']['Tables']['client_feedback']['Row'] & {
  ar_projects?: {
    product_name: string;
    thumbnail_url: string;
  };
};

const ClientFeedback: React.FC = () => {
  const [feedbackData, setFeedbackData] = useState<ClientFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseRate, setResponseRate] = useState(0);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      // First get all feedback
      const { data: feedbackList, error: feedbackError } = await supabase
        .from('client_feedback')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (feedbackError) {
        throw feedbackError;
      }

      // Then get project details for each feedback
      const feedbackWithProjects = await Promise.all(
        (feedbackList || []).map(async (feedback) => {
          const { data: project } = await supabase
            .from('ar_projects')
            .select('product_name, thumbnail_url')
            .eq('share_link_id', feedback.ar_project_id)
            .maybeSingle();

          return {
            ...feedback,
            ar_projects: project
          };
        })
      );

      setFeedbackData(feedbackWithProjects);

      // Calculate accurate response rate
      await calculateResponseRate(feedbackList || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateResponseRate = async (feedbackList: ClientFeedback[]) => {
    try {
      // Get total number of AR projects
      const { data: allProjects, error: projectsError } = await supabase
        .from('ar_projects')
        .select('id');

      if (projectsError) {
        throw projectsError;
      }

      const totalProjects = allProjects?.length || 0;

      if (totalProjects === 0) {
        setResponseRate(0);
        return;
      }

      // Get unique project IDs that have received feedback
      const projectsWithFeedback = new Set(
        feedbackList.map(feedback => feedback.ar_project_id)
      );

      const projectsWithFeedbackCount = projectsWithFeedback.size;

      // Calculate response rate as percentage
      const rate = Math.round((projectsWithFeedbackCount / totalProjects) * 100);
      setResponseRate(rate);
    } catch (error) {
      console.error('Error calculating response rate:', error);
      setResponseRate(0);
    }
  };

  const getStatusIcon = (feedbackType: string) => {
    switch (feedbackType) {
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'Needs Revision':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusText = (feedbackType: string) => {
    switch (feedbackType) {
      case 'approved':
        return 'Approved';
      case 'revision':
        return 'Needs Revision';
      default:
        return 'Pending Review';
    }
  };

  const getStatusColor = (feedbackType: string) => {
    switch (feedbackType) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      case 'revision':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusCounts = {
    approved: feedbackData.filter(f => f.feedback_type === 'approved').length,
    pending: 0, // We don't track pending in feedback table
    revision: feedbackData.filter(f => f.feedback_type === 'revision').length
  };

  const stats = [
    {
      name: 'Total Feedback',
      value: loading ? '...' : feedbackData.length.toString(),
      icon: MessageSquare,
      color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      iconColor: 'bg-blue-500'
    },
    {
      name: 'Approved',
      value: loading ? '...' : statusCounts.approved.toString(),
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      iconColor: 'bg-emerald-500'
    },
    {
      name: 'Need Revision',
      value: loading ? '...' : statusCounts.revision.toString(),
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      iconColor: 'bg-amber-500'
    },
    {
      name: 'Response Rate',
      value: loading ? '...' : `${responseRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
      iconColor: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Client Feedback Hub
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Monitor client responses, track project approvals, and manage design iterations in real-time.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-3 ${stat.iconColor} rounded-xl`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Cards */}
      <div className="space-y-6">
        {feedbackData.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-12">
              <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-6">
                <MessageSquare className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No feedback yet</h3>
              <p className="text-slate-500">Client responses will appear here once they start reviewing your AR experiences.</p>
            </div>
          </div>
        ) : (
          feedbackData.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={feedback.ar_projects?.thumbnail_url || 'https://images.pexels.com/photos/586752/pexels-photo-586752.jpeg?auto=compress&cs=tinysrgb&w=100'}
                    alt={feedback.ar_projects?.product_name || 'Product'}
                    className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{feedback.ar_projects?.product_name || 'Unknown Product'}</h3>
                    <div className="flex items-center space-x-2 text-slate-600 mt-1">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Anonymous Client</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-3">
                  <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(feedback.feedback_type)}`}>
                    {getStatusIcon(feedback.feedback_type)}
                    <span>{getStatusText(feedback.feedback_type)}</span>
                  </span>
                  <span className="text-sm text-slate-500">{formatDate(feedback.submitted_at)}</span>
                </div>
              </div>

              {feedback.comment && (
                <div className="bg-slate-50/80 rounded-xl p-6 border border-slate-200/60">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm ring-1 ring-slate-200">
                      <FileText className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">Client Comments</h4>
                      <p className="text-slate-700 leading-relaxed">{feedback.comment}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                {feedback.feedback_type === 'revision' && (
                  <button className="px-6 py-2.5 bg-amber-600 text-white hover:bg-amber-700 rounded-xl transition-colors duration-150 font-semibold">
                    Start Revision
                  </button>
                )}
                {feedback.feedback_type === 'approved' && (
                  <button className="px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-colors duration-150 font-semibold">
                    Proceed to Production
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientFeedback;