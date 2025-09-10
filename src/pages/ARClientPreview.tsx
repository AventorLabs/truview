import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Smartphone, Tablet, Monitor, QrCode as QrCodeIcon, CheckCircle, Edit3, MessageSquare, Send, Eye, Maximize2, AlertTriangle, Lock, Key, Sparkles } from 'lucide-react';
import ModelViewer from '../components/ModelViewer';
import SmartQRCode from '../components/SmartQRCode';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import toast from 'react-hot-toast';

type ARProject = Database['public']['Tables']['ar_projects']['Row'];

const ARClientPreview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [project, setProject] = useState<ARProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'Approved' | 'Needs Revision' | ''>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Access code protection states
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [enteredAccessCode, setEnteredAccessCode] = useState('');
  const [accessCodeError, setAccessCodeError] = useState('');
  const [isAccessGranted, setIsAccessGranted] = useState(false);

  const shareLinkId = searchParams.get('id');
  const accessToken = searchParams.get('access'); // Check for access token in URL
  const baseUrl = window.location.origin;

  useEffect(() => {
    // Detect device type and platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    setDeviceType(isMobile ? 'mobile' : 'desktop');
    
    if (/iphone|ipad/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('other');
    }

    if (shareLinkId) {
      loadProjectData();
    } else {
      setError('No project ID provided');
      setLoading(false);
    }
  }, [shareLinkId, accessToken]);

  const loadProjectData = async () => {
    try {
      const { data, error } = await supabase
        .from('ar_projects')
        .select('*')
        .eq('share_link_id', shareLinkId)
        .single();

      if (error) {
        throw error;
      }

      setProject(data);
      
      // Check if access code is required
      if (data.access_code) {
        // Check if access token is provided and valid
        if (accessToken && accessToken === btoa(data.access_code)) {
          // Valid access token, grant access immediately
          setIsAccessGranted(true);
          setShowAccessForm(false);
        } else {
          // Check localStorage for previously entered access code
          const storedAccess = localStorage.getItem(`ar_access_${shareLinkId}`);
          if (storedAccess === data.access_code) {
            setIsAccessGranted(true);
            setShowAccessForm(false);
          } else {
            setShowAccessForm(true);
          }
        }
      } else {
        setIsAccessGranted(true);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Project not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project || !project.access_code) return;
    
    if (enteredAccessCode.toUpperCase() === project.access_code.toUpperCase()) {
      setIsAccessGranted(true);
      setShowAccessForm(false);
      setAccessCodeError('');
      
      // Store access code in localStorage for this project
      localStorage.setItem(`ar_access_${shareLinkId}`, project.access_code);
      
      toast.success('Access granted!');
    } else {
      setAccessCodeError('Invalid access code. Please try again.');
      setEnteredAccessCode('');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackType || !project) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('client_feedback')
        .insert({
          ar_project_id: project.share_link_id,
          feedback_type: feedbackType,
          comment: comment || null
        });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast.success('Thanks! We received your feedback.');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center px-4">
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="p-4 bg-red-50 rounded-full w-fit mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Project Not Found</h1>
          <p className="text-slate-600">{error || 'The requested AR experience could not be found.'}</p>
        </div>
      </div>
    );
  }

  // Show access code form if required and not yet granted
  if (showAccessForm && !isAccessGranted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center px-4">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl w-fit mx-auto mb-4 sm:mb-6">
                <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">Access Required</h1>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">This AR experience is protected. Please enter the access code to continue.</p>
            </div>

            <form onSubmit={handleAccessCodeSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  <Key className="h-4 w-4 inline mr-2" />
                  Access Code
                </label>
                <input
                  type="text"
                  value={enteredAccessCode}
                  onChange={(e) => {
                    setEnteredAccessCode(e.target.value.toUpperCase());
                    setAccessCodeError('');
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-center font-mono text-lg tracking-wider text-slate-900"
                  placeholder="Enter code"
                  maxLength={8}
                  required
                />
                {accessCodeError && (
                  <p className="text-red-600 text-sm mt-2 text-center">{accessCodeError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Access AR Experience
              </button>
            </form>

            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs text-slate-500">
                Don't have the access code? Contact the project owner.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentUrl = `${baseUrl}/ar-client-preview?id=${shareLinkId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-8 sm:space-y-10 lg:space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 sm:space-y-6 px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            {project.product_name}
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Experience this custom design in your space using Augmented Reality technology.
          </p>
          {project.access_code && (
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 sm:px-4 py-2 rounded-full text-sm font-semibold ring-1 ring-emerald-200">
              <Lock className="h-4 w-4" />
              <span>Secure Access Granted</span>
            </div>
          )}
        </div>

        {/* Product Display and AR Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-4 sm:p-6 lg:p-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Product Image */}
            <div className="space-y-4 sm:space-y-6">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={project.thumbnail_url}
                  alt={project.product_name}
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </div>

            {/* AR Controls */}
            <div className="space-y-4 sm:space-y-6 flex flex-col justify-center">
              {/* iOS Mobile AR Button */}
              {deviceType === 'mobile' && platform === 'ios' && project.usdz_url && (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-blue-600 mb-4">
                    <Tablet className="h-5 w-5" />
                    <span className="font-semibold">iOS Device Detected</span>
                  </div>
                  <a
                    href={project.usdz_url}
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 sm:px-8 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>View in AR (iOS)</span>
                  </a>
                  <p className="text-sm text-slate-600 px-2">Tap to open in your device's native AR viewer</p>
                </div>
              )}

              {/* Android Mobile AR Button */}
              {deviceType === 'mobile' && platform === 'android' && (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-emerald-600 mb-4">
                    <Smartphone className="h-5 w-5" />
                    <span className="font-semibold">Android Device Detected</span>
                  </div>
                  <a
                    href={`intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(project.glb_url)}&mode=ar_only&title=${encodeURIComponent(project.product_name)}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`}
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 sm:px-8 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>View in AR (Android)</span>
                  </a>
                  <p className="text-sm text-slate-600 px-2">Tap to open in your device's AR viewer</p>
                </div>
              )}

              {/* Desktop View with QR Code */}
              {deviceType === 'desktop' && (
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-indigo-600 mb-4">
                    <Monitor className="h-5 w-5" />
                    <span className="font-semibold">Desktop View</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 px-2">
                    Use the QR code below to view in AR on your mobile device
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3D Model Preview Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">3D Model Preview</h3>
            </div>
            <p className="text-slate-600 px-2">Interact with the model below - rotate, zoom, and explore every detail.</p>
          </div>

          {/* Conditional Model Viewer */}
          {project.glb_url ? (
            <>
              <ModelViewer
                fileUrl={project.glb_url}
                controls="orbit"
                exposure={1.0}
                environment={true}
                ar={false}
                height={deviceType === 'mobile' ? 350 : 450}
              />

              <div className="mt-4 sm:mt-6 text-center">
                <div className="inline-flex items-center space-x-2 bg-slate-50 rounded-xl px-3 sm:px-4 py-2 ring-1 ring-slate-200">
                  <Maximize2 className="h-4 w-4 text-slate-600" />
                  <span className="text-xs sm:text-sm text-slate-600">Drag to rotate • Scroll to zoom • Click controls to reset</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 sm:h-96 bg-amber-50 border-2 border-amber-200 rounded-xl mx-2">
              <div className="text-center space-y-4 px-4">
                <div className="p-4 bg-amber-100 rounded-full w-fit mx-auto">
                  <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-semibold text-amber-900">Model Unavailable</p>
                  <p className="text-sm sm:text-base text-amber-700">Please contact support to reload the 3D model.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QR Code Section (Desktop Only) */}
        {deviceType === 'desktop' && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl">
                  <QrCodeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Scan for Mobile AR</h3>
              </div>
              <p className="text-slate-600 px-2">Use your phone's camera to place this item in your environment.</p>
              {project.access_code && (
                <p className="text-sm text-emerald-600 mt-2 font-medium">
                  ✓ Access code automatically included in QR code
                </p>
              )}
            </div>

            <SmartQRCode
              projectId={shareLinkId!}
              glbUrl={project.glb_url}
              productName={project.product_name}
              label="Scan to launch AR on mobile"
              size={220}
            />
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-slate-200 mx-4"></div>

        {/* Feedback Form */}
        {isSubmitted ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 sm:p-8 text-center mx-2">
            <div className="p-3 sm:p-4 bg-emerald-100 rounded-full w-fit mx-auto mb-4 sm:mb-6">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">Thank You!</h3>
            <p className="text-slate-600 leading-relaxed">Your feedback has been received and will be reviewed by our design team.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Submit Your Feedback</h3>
                <p className="text-slate-600 mt-1 text-sm sm:text-base">Let us know what you think about this design</p>
              </div>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Your Decision *
                </label>
                <div className="grid gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setFeedbackType('Approved')}
                    className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                      feedbackType === 'Approved'
                        ? 'border-emerald-500 bg-emerald-50 shadow-md ring-1 ring-emerald-200'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className={`h-5 w-5 sm:h-6 sm:w-6 ${feedbackType === 'Approved' ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-semibold text-slate-900 text-sm sm:text-base">✅ Approve Design</div>
                        <div className="text-xs sm:text-sm text-slate-600">Design looks perfect!</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackType('Needs Revision')}
                    className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                      feedbackType === 'Needs Revision'
                        ? 'border-amber-500 bg-amber-50 shadow-md ring-1 ring-amber-200'
                        : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Edit3 className={`h-5 w-5 sm:h-6 sm:w-6 ${feedbackType === 'Needs Revision' ? 'text-amber-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-semibold text-slate-900 text-sm sm:text-base">✏️ Request Changes</div>
                        <div className="text-xs sm:text-sm text-slate-600">Needs some adjustments</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Additional Comments (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white resize-none text-slate-900 placeholder-slate-400"
                  placeholder="Share any specific feedback, suggestions, or requirements..."
                />
              </div>

              <button
                type="submit"
                disabled={!feedbackType || isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
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
        )}
      </div>
    </div>
  );
};

export default ARClientPreview;