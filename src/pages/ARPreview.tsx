import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Smartphone, Tablet, Monitor, QrCode as QrCodeIcon, CheckCircle, Edit3 } from 'lucide-react';
import SmartQRCode from '../components/SmartQRCode';
import ModelViewer from '../components/ModelViewer';
import FeedbackForm from '../components/FeedbackForm';

const ARPreview: React.FC = () => {
  const { id } = useParams();
  const [deviceType, setDeviceType] = useState<'mobile_ios' | 'mobile_android' | 'desktop'>('desktop');
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad/.test(userAgent)) {
      setDeviceType('mobile_ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('mobile_android');
    } else {
      setDeviceType('desktop');
    }

    // Mock project data - in real app, fetch from API using id
    setProject({
      id: parseInt(id || '1'),
      productName: 'Modern Chair Design',
      glbUrl: 'https://example.com/models/chair.glb',
      usdzUrl: 'https://example.com/models/chair.usdz',
      thumbnail: 'https://images.pexels.com/photos/586752/pexels-photo-586752.jpeg?auto=compress&cs=tinysrgb&w=400'
    });
  }, [id]);

  if (!project) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const currentUrl = window.location.href;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Preview Your Custom Model
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Tap below to view this design in your own space using Augmented Reality.
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <img
              src={project.thumbnail}
              alt={project.productName}
              className="w-full h-64 object-cover rounded-xl"
            />
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.productName}</h2>
            </div>
          </div>

          <div className="space-y-6">
            {deviceType === 'mobile_ios' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <Tablet className="h-5 w-5" />
                  <span className="font-medium">iOS Device Detected</span>
                </div>
                <p className="text-gray-600">Tap the button below to view in AR (iPhone/iPad)</p>
                <a
                  href={project.usdzUrl}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Smartphone className="h-5 w-5" />
                  <span>View in Your Space (iOS)</span>
                </a>
              </div>
            )}

            {deviceType === 'mobile_android' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Smartphone className="h-5 w-5" />
                  <span className="font-medium">Android Device Detected</span>
                </div>
                <p className="text-gray-600">Tap the button below to view in AR (Android)</p>
                <a
                  href={`intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(project.glbUrl)}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Smartphone className="h-5 w-5" />
                  <span>View in Your Space (Android)</span>
                </a>
              </div>
            )}

            {deviceType === 'desktop' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-purple-600 mb-4">
                    <Monitor className="h-5 w-5" />
                    <span className="font-medium">Desktop View</span>
                  </div>
                  <ModelViewer fileUrl={project.glbUrl} />
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
                    <QrCodeIcon className="h-5 w-5" />
                    <span className="font-medium">Scan to view on mobile</span>
                  </div>
                  <SmartQRCode 
                    projectId={project.id.toString()} 
                    glbUrl={project.glbUrl} 
                    productName={project.productName} 
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Scan this QR code on your phone to open in AR
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <FeedbackForm projectId={project.id} />
      </div>
    </div>
  );
};

export default ARPreview;