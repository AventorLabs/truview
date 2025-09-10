import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Eye, MessageSquare, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import toast from 'react-hot-toast';

type ARProject = Database['public']['Tables']['ar_projects']['Row'];

const BrowseProducts: React.FC = () => {
  const [products, setProducts] = useState<ARProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('ar_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openARPreview = (shareLinkId: string) => {
    const previewUrl = `/ar-client-preview?id=${shareLinkId}`;
    window.open(previewUrl, '_blank');
  };

  const steps = [
    {
      number: 1,
      title: 'Select Product',
      description: 'Choose any AR-enabled product from our collection',
      icon: <Eye className="h-6 w-6" />
    },
    {
      number: 2,
      title: 'Open on Mobile',
      description: 'Scan QR code or open link directly on your device',
      icon: <Smartphone className="h-6 w-6" />
    },
    {
      number: 3,
      title: 'Experience AR',
      description: 'Place and interact with 3D models in your space',
      icon: <Sparkles className="h-6 w-6" />
    },
    {
      number: 4,
      title: 'Share Feedback',
      description: 'Approve designs or request changes instantly',
      icon: <MessageSquare className="h-6 w-6" />
    }
  ];

  const compatibility = [
    {
      platform: 'iPhone & iPad',
      requirement: 'iOS 12+',
      description: 'Native AR support with USDZ files',
      icon: <Tablet className="h-8 w-8 text-blue-600" />,
      color: 'bg-blue-50 ring-1 ring-blue-200'
    },
    {
      platform: 'Android Phones',
      requirement: 'ARCore Support',
      description: 'Native AR viewer integration',
      icon: <Smartphone className="h-8 w-8 text-emerald-600" />,
      color: 'bg-emerald-50 ring-1 ring-emerald-200'
    },
    {
      platform: 'Desktop',
      requirement: 'Any Browser',
      description: '3D preview with QR code for mobile AR',
      icon: <Monitor className="h-8 w-8 text-purple-600" />,
      color: 'bg-purple-50 ring-1 ring-purple-200'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          AR Product Gallery
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Experience our latest designs in augmented reality. See how they look and feel in your own space before making decisions.
        </p>
      </div>

      {/* Products Grid */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Available Experiences</h2>
          <p className="text-slate-600">
            {loading ? 'Loading experiences...' : `${products.length} AR experience${products.length !== 1 ? 's' : ''} ready to explore`}
          </p>
        </div>

        {loading ? (
          <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-12">
              <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-6">
                <Eye className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No experiences available</h3>
              <p className="text-slate-500">Check back soon for new AR products to explore!</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="relative overflow-hidden">
                  <img
                    src={product.thumbnail_url}
                    alt={product.product_name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.status === 'Approved' 
                        ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
                        : product.status === 'Needs Revision'
                        ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                        : 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{product.product_name}</h3>
                  <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                    {product.notes || 'Experience this design in augmented reality and see how it fits in your space.'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-6">
                    <span>Added {new Date(product.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                    <div className="flex items-center space-x-2">
                      {product.glb_url && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-medium">GLB</span>
                      )}
                      {product.usdz_url && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">USDZ</span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => openARPreview(product.share_link_id)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl group"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View in Your Space</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-12">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="text-center space-y-4">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl w-fit mx-auto text-white shadow-lg">
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-slate-200 to-transparent transform -translate-y-1/2" />
                )}
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold text-indigo-600">Step {step.number}</div>
                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device Compatibility */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-12">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Device Compatibility</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {compatibility.map((device) => (
            <div key={device.platform} className={`p-8 rounded-2xl ${device.color} transition-all duration-200 hover:shadow-lg`}>
              <div className="flex items-center space-x-4 mb-6">
                {device.icon}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{device.platform}</h3>
                  <p className="text-sm font-semibold text-slate-600">{device.requirement}</p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">{device.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowseProducts;