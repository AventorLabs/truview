import React from 'react';
import { MessageSquare, CheckCircle, AlertCircle, Clock, User } from 'lucide-react';

const ClientFeedboard: React.FC = () => {
  // Mock feedback data
  const feedbackData = [
    {
      id: 1,
      productName: 'Modern Chair Design',
      clientName: 'Sarah Johnson',
      status: 'approved',
      comments: 'Absolutely love the design! The proportions are perfect and it fits beautifully in my living room. Ready to proceed with the order.',
      submittedAt: '2024-01-15T14:30:00Z',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: 2,
      productName: 'Coffee Table Pro',
      clientName: 'Mike Chen',
      status: 'pending',
      comments: 'Still reviewing the design. Need a few more days to make the final decision.',
      submittedAt: '2024-01-14T09:15:00Z',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: 3,
      productName: 'Desk Lamp Elite',
      clientName: 'Emma Rodriguez',
      status: 'revision',
      comments: 'The design is great overall, but could you please make the base slightly wider for better stability? Also, can we explore a warmer light temperature?',
      submittedAt: '2024-01-13T16:45:00Z',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: 4,
      productName: 'Bookshelf Modern',
      clientName: 'David Kim',
      status: 'approved',
      comments: 'Perfect! Exactly what I was looking for. The wood finish looks amazing in my office space.',
      submittedAt: '2024-01-12T11:20:00Z',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'revision':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'revision':
        return 'Needs Revision';
      default:
        return 'Pending Review';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'revision':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
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
    approved: feedbackData.filter(f => f.status === 'approved').length,
    pending: feedbackData.filter(f => f.status === 'pending').length,
    revision: feedbackData.filter(f => f.status === 'revision').length
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Client Feedback Board
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Track client responses and manage project approvals in real-time.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-900">{statusCounts.approved}</div>
          <div className="text-green-700 font-medium">Approved Designs</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
          <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-orange-900">{statusCounts.revision}</div>
          <div className="text-orange-700 font-medium">Need Revision</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900">{statusCounts.pending}</div>
          <div className="text-blue-700 font-medium">Pending Review</div>
        </div>
      </div>

      {/* Feedback Cards */}
      <div className="space-y-6">
        {feedbackData.map((feedback) => (
          <div key={feedback.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={feedback.avatar}
                  alt={feedback.clientName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{feedback.productName}</h3>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{feedback.clientName}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(feedback.status)}`}>
                  {getStatusIcon(feedback.status)}
                  <span>{getStatusText(feedback.status)}</span>
                </span>
                <span className="text-sm text-gray-500">{formatDate(feedback.submittedAt)}</span>
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <MessageSquare className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed">{feedback.comments}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              {feedback.status === 'pending' && (
                <>
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-150">
                    Follow Up
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors duration-150">
                    Send Reminder
                  </button>
                </>
              )}
              {feedback.status === 'revision' && (
                <button className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg transition-colors duration-150">
                  Start Revision
                </button>
              )}
              {feedback.status === 'approved' && (
                <button className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors duration-150">
                  Proceed to Production
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientFeedboard;