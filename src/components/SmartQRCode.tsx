import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Tablet } from 'lucide-react';

interface SmartQRCodeProps {
  projectId: string;
  glbUrl: string;
  productName: string;
  label?: string;
  size?: number;
}

const SmartQRCode: React.FC<SmartQRCodeProps> = ({ 
  projectId, 
  glbUrl, 
  productName, 
  label = "Scan to launch AR on mobile",
  size = 200 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseUrl = window.location.origin;

  // Generate smart URL with access token if needed
  const generateSmartUrl = () => {
    // Check if there's a stored access code for this project
    const storedAccess = localStorage.getItem(`ar_access_${projectId}`);
    let url = `${baseUrl}/ar-client-preview?id=${projectId}`;
    
    // If there's a stored access code, include it as a token in the URL
    if (storedAccess) {
      const accessToken = btoa(storedAccess); // Base64 encode the access code
      url += `&access=${accessToken}`;
    }
    
    return url;
  };

  useEffect(() => {
    if (canvasRef.current) {
      const qrUrl = generateSmartUrl();
      
      QRCode.toCanvas(canvasRef.current, qrUrl, {
        width: size,
        margin: 2,
        color: {
          dark: '#374151',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
    }
  }, [projectId, glbUrl, productName, size]);

  return (
    <div className="space-y-4">
      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-200">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center space-y-3">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Smartphone className="h-4 w-4 text-green-600" />
            <span>Android: Scene Viewer</span>
          </div>
          <div className="flex items-center space-x-1">
            <Tablet className="h-4 w-4 text-blue-600" />
            <span>iOS: Native AR</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 max-w-sm mx-auto">
          <p className="text-xs text-gray-600 leading-relaxed">
            Point your phone's camera at this code to automatically open the AR experience 
            with seamless access - no need to re-enter codes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartQRCode;