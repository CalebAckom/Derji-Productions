import React, { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui';
import { PortfolioItem } from '@/types';
import { post, put, uploadFile } from '@/utils/api';

interface PortfolioFormProps {
  item?: PortfolioItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PortfolioForm({ item, onSuccess, onCancel }: PortfolioFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'photography' as 'photography' | 'videography' | 'sound',
    clientName: '',
    projectDate: '',
    featured: false,
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || '',
        category: item.category,
        clientName: item.clientName || '',
        projectDate: item.projectDate ? new Date(item.projectDate).toISOString().split('T')[0] : '',
        featured: item.featured,
        tags: item.tags || []
      });
    }
  }, [item]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Create or update portfolio item
      const portfolioData = {
        ...formData,
        projectDate: formData.projectDate ? new Date(formData.projectDate) : null
      };

      let portfolioItem: PortfolioItem;
      if (item) {
        portfolioItem = await put(`/portfolio/${item.id}`, portfolioData);
      } else {
        portfolioItem = await post('/portfolio', portfolioData);
      }

      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          try {
            await uploadFile(`/portfolio/${portfolioItem.id}/media`, file, (progress) => {
              setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
            });
          } catch (uploadError) {
            console.error(`Failed to upload ${file.name}:`, uploadError);
          }
        }
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save portfolio item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Title *
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Portfolio item title"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="photography">Photography</option>
            <option value="videography">Videography</option>
            <option value="sound">Sound</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe this portfolio item..."
          rows={4}
          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Client Name
          </label>
          <Input
            type="text"
            value={formData.clientName}
            onChange={(e) => handleInputChange('clientName', e.target.value)}
            placeholder="Client or project name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Project Date
          </label>
          <Input
            type="date"
            value={formData.projectDate}
            onChange={(e) => handleInputChange('projectDate', e.target.value)}
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Tags
        </label>
        <div className="flex space-x-2 mb-2">
          <Input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" variant="outline" onClick={handleAddTag}>
            Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Featured */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => handleInputChange('featured', e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
        />
        <label htmlFor="featured" className="ml-2 text-sm text-secondary-700">
          Feature this item on the homepage
        </label>
      </div>

      {/* File Upload */}
      {!item && (
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Media Files
          </label>
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {files.length > 0 && (
            <div className="mt-2 space-y-2">
              {files.map((file) => (
                <div key={file.name} className="flex items-center justify-between text-sm">
                  <span>{file.name}</span>
                  {uploadProgress[file.name] !== undefined && (
                    <div className="w-32 bg-secondary-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-secondary-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : item ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}