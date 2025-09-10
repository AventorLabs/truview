import React, { useState } from 'react';
import { Upload, File, Image, FileText, Sparkles, Lock, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface UploadFormProps {
  onUploadSuccess: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    productName: '',
    glbFile: null as File | null,
    usdzFile: null as File | null,
    thumbnail: null as File | null,
    notes: '',
    status: 'Pending',
    accessCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateShareLinkId = () => {
    return 'ar-' + Math.random().toString(36).substring(2, 8);
  };

  const generateAccessCode = () => {
    // Generate a 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const uploadFile = async (file: File, bucket: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.glbFile || !formData.thumbnail) {
      toast.error('Please select required files');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload files to Supabase storage
      const glbUrl = await uploadFile(formData.glbFile, 'ar-models');
      const thumbnailUrl = await uploadFile(formData.thumbnail, 'ar-thumbnails');
      let usdzUrl = null;
      
      if (formData.usdzFile) {
        usdzUrl = await uploadFile(formData.usdzFile, 'ar-models');
      }

      const shareLinkId = generateShareLinkId();
      
      // Generate access code if not provided
      const accessCode = formData.accessCode.trim() || generateAccessCode();

      // Insert project into database
      const { error } = await supabase
        .from('ar_projects')
        .insert({
          product_name: formData.productName,
          glb_url: glbUrl,
          usdz_url: usdzUrl,
          thumbnail_url: thumbnailUrl,
          notes: formData.notes,
          share_link_id: shareLinkId,
          status: formData.status,
          access_code: accessCode
        });

      if (error) {
        throw error;
      }

      // Generate and copy preview link
      const previewLink = `${window.location.origin}/ar-client-preview?id=${shareLinkId}`;
      await navigator.clipboard.writeText(previewLink);
      
      toast.success(`Preview link generated! Access code: ${accessCode}`);
      
      // Reset form
      setFormData({
        productName: '',
        glbFile: null,
        usdzFile: null,
        thumbnail: null,
        notes: '',
        status: 'Pending',
        accessCode: ''
      });
      
      onUploadSuccess();
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Create AR Experience</h2>
          <p className="text-slate-600 mt-1">Upload 3D models and generate shareable preview links</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Product Name
          </label>
          <input
            type="text"
            value={formData.productName}
            onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-400"
            required
            placeholder="Enter product name"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FileUpload
            label="GLB File"
            description="For Android + Web AR"
            accept=".glb"
            file={formData.glbFile}
            onChange={(file) => handleFileChange('glbFile', file)}
            icon={<File className="h-5 w-5" />}
            required
          />

          <FileUpload
            label="USDZ File"
            description="For iOS devices (optional)"
            accept=".usdz"
            file={formData.usdzFile}
            onChange={(file) => handleFileChange('usdzFile', file)}
            icon={<File className="h-5 w-5" />}
          />
        </div>

        <FileUpload
          label="Thumbnail Image"
          description="Preview image for the product"
          accept=".jpg,.png,.jpeg"
          file={formData.thumbnail}
          onChange={(file) => handleFileChange('thumbnail', file)}
          icon={<Image className="h-5 w-5" />}
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            <Lock className="h-4 w-4 inline mr-2" />
            Access Code
          </label>
          <input
            type="text"
            value={formData.accessCode}
            onChange={(e) => setFormData(prev => ({ ...prev, accessCode: e.target.value.toUpperCase() }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-400"
            placeholder="Leave empty to auto-generate"
            maxLength={8}
          />
          <p className="text-xs text-slate-500 mt-1">
            If left empty, a 6-character code will be generated automatically
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            <FileText className="h-4 w-4 inline mr-2" />
            Internal Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-400 resize-none"
            placeholder="Add internal notes about this AR experience..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-slate-900"
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Needs Revision">Needs Revision</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Creating Experience...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>Generate AR Preview Link</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

interface FileUploadProps {
  label: string;
  description: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  icon: React.ReactNode;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, description, accept, file, onChange, icon, required }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onChange(selectedFile);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        <span className="flex items-center space-x-2">
          {icon}
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </span>
      </label>
      <p className="text-xs text-slate-500">{description}</p>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          required={required}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className={`w-full px-4 py-6 rounded-xl border-2 border-dashed transition-all duration-200 text-center ${
          file 
            ? 'border-indigo-300 bg-indigo-50/50' 
            : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30'
        }`}>
          {file ? (
            <div className="space-y-2">
              <div className="p-2 bg-indigo-100 rounded-lg w-fit mx-auto">
                <File className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-sm text-slate-700 font-medium">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-2 bg-slate-100 rounded-lg w-fit mx-auto">
                <Upload className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400">Supported formats: {accept}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadForm;