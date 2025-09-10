import React, { useEffect, useRef } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// Extend the JSX namespace to include model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        'disable-zoom'?: boolean;
        'disable-pan'?: boolean;
        ar?: boolean;
        'ar-modes'?: string;
        'ar-scale'?: string;
        'camera-orbit'?: string;
        'field-of-view'?: string;
        'min-camera-orbit'?: string;
        'max-camera-orbit'?: string;
        'min-field-of-view'?: string;
        'max-field-of-view'?: string;
        'interaction-prompt'?: string;
        'interaction-prompt-threshold'?: number;
        'loading'?: string;
        'reveal'?: string;
        'with-credentials'?: boolean;
        'environment-image'?: string;
        'skybox-image'?: string;
        'exposure'?: number;
        'shadow-intensity'?: number;
        'shadow-softness'?: number;
        'tone-mapping'?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

interface ModelViewerProps {
  fileUrl: string;
  controls?: 'orbit' | 'none';
  exposure?: number;
  environment?: boolean;
  ar?: boolean;
  height?: number;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ 
  fileUrl, 
  controls = 'orbit',
  exposure = 1.0,
  environment = true,
  ar = false,
  height = 400 
}) => {
  const modelViewerRef = useRef<HTMLElement>(null);
  const loadingOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    const loadingOverlay = loadingOverlayRef.current;

    if (!modelViewer || !loadingOverlay) return;

    const handleLoad = () => {
      // Hide loading overlay when model is loaded
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
      }, 300);
    };

    const handleError = () => {
      // Show error state in loading overlay
      if (loadingOverlay) {
        loadingOverlay.innerHTML = `
          <div class="text-center space-y-3">
            <div class="p-4 bg-red-100 rounded-full w-fit mx-auto">
              <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-red-900">Failed to load model</p>
              <p class="text-xs text-red-700">Please check the file URL</p>
            </div>
          </div>
        `;
      }
    };

    const handleProgress = (event: any) => {
      // Update loading progress if available
      const progress = event.detail?.totalProgress;
      if (progress !== undefined && loadingOverlay) {
        const progressBar = loadingOverlay.querySelector('.progress-bar');
        if (progressBar) {
          (progressBar as HTMLElement).style.width = `${progress * 100}%`;
        }
      }
    };

    // Add event listeners
    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);
    modelViewer.addEventListener('progress', handleProgress);

    // Cleanup
    return () => {
      modelViewer.removeEventListener('load', handleLoad);
      modelViewer.removeEventListener('error', handleError);
      modelViewer.removeEventListener('progress', handleProgress);
    };
  }, [fileUrl]);

  const resetCamera = () => {
    const modelViewer = modelViewerRef.current as any;
    if (modelViewer) {
      modelViewer.resetTurntableRotation();
      modelViewer.jumpCameraToGoal();
    }
  };

  const zoomIn = () => {
    const modelViewer = modelViewerRef.current as any;
    if (modelViewer) {
      const currentOrbit = modelViewer.getCameraOrbit();
      modelViewer.cameraOrbit = `${currentOrbit.theta}rad ${currentOrbit.phi}rad ${Math.max(currentOrbit.radius * 0.8, 0.5)}m`;
    }
  };

  const zoomOut = () => {
    const modelViewer = modelViewerRef.current as any;
    if (modelViewer) {
      const currentOrbit = modelViewer.getCameraOrbit();
      modelViewer.cameraOrbit = `${currentOrbit.theta}rad ${currentOrbit.phi}rad ${Math.min(currentOrbit.radius * 1.2, 10)}m`;
    }
  };

  return (
    <div className="relative">
      <div 
        className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 overflow-hidden shadow-inner"
        style={{ height: `${height}px` }}
      >
        <model-viewer
          ref={modelViewerRef}
          src={fileUrl}
          alt="3D Model"
          camera-controls={controls === 'orbit'}
          auto-rotate={false}
          ar={ar}
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="fixed"
          interaction-prompt="auto"
          interaction-prompt-threshold={2000}
          loading="eager"
          reveal="auto"
          exposure={exposure}
          shadow-intensity={1}
          shadow-softness={0.5}
          tone-mapping="neutral"
          environment-image={environment ? "neutral" : undefined}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent'
          }}
        />

        {/* Controls Overlay */}
        {controls === 'orbit' && (
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button 
              onClick={resetCamera}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors duration-200"
              title="Reset camera"
            >
              <RotateCcw className="h-4 w-4 text-gray-600" />
            </button>
            <button 
              onClick={zoomIn}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors duration-200"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4 text-gray-600" />
            </button>
            <button 
              onClick={zoomOut}
              className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md hover:bg-white transition-colors duration-200"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        )}

        {/* Model Info */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
          <p className="text-xs text-gray-600">
            GLB • {exposure}x exposure • {environment ? 'Environment lighting' : 'Basic lighting'}
          </p>
        </div>

        {/* Loading Indicator */}
        <div 
          ref={loadingOverlayRef}
          className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm pointer-events-none transition-opacity duration-300"
        >
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Loading 3D model...</p>
            <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="progress-bar h-full bg-purple-600 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-2 bg-gray-50 rounded-lg px-4 py-2">
          <Maximize2 className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-600">
            {controls === 'orbit' ? 'Drag to rotate • Scroll to zoom • Click controls to reset' : 'Static 3D view'}
          </span>
        </div>
      </div>

      {/* Model Details */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          Model: {fileUrl.split('/').pop()?.split('.')[0] || 'Unknown'}
        </p>
      </div>
    </div>
  );
};

export default ModelViewer;