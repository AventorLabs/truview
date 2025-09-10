import React, { useState } from 'react';
import { CheckCircle, Edit3, MessageSquare, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ClientFeedbackFormProps {
  projectId: string;
}

const ClientFeedbackForm: React.FC<ClientFeedbackFormProps> = ({ projectId }) => {
  const [feedback, setFeedback] = useState<'approved' | 'revision' | null>(null);
  const [comment, setComment] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('ar_feedback')
        .insert({
          project_id: projectId,
          client_name: clientName || null,
          client_email: clientEmail || null,
          feedback_type: feedback,
          comments: comment || null
        });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
        <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600">Your feedback has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Send Your Feedback</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFeedback('approved')}
            className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              feedback === 'approved'
                ? 'border-green-500 bg-green-50 shadow-md'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className={`h-6 w-6 ${feedback === 'approved' ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <div className="font-semibold text-gray-900">✅ Approve Design</div>
                <div className="text-sm text-gray-600">Design looks perfect!</div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setFeedback('revision')}
            className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              feedback === 'revision'
                ? 'border-orange-500 bg-orange-50 shadow-md'
                : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Edit3 className={`h-6 w-6 ${feedback === 'revision' ? 'text-orange-600' : 'text-gray-400'}`} />
              <div>
                <div className="font-semibold text-gray-900">✏️ Request Changes</div>
                <div className="text-sm text-gray-600">Needs some adjustments</div>
              </div>
            </div>
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Optional Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/80 resize-none"
            placeholder="Share any specific feedback or suggestions..."
          />
        </div>

        <button
          type="submit"
          disabled={!feedback || isSubmitting}
          className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Submit Feedback</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ClientFeedbackForm;