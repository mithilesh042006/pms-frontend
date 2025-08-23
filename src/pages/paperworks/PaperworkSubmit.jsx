import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { paperworksAPI } from '../../services/api';
import { toast } from 'sonner';

const PaperworkSubmit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paperwork, setPaperwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    comments: '',
    file: null
  });

  useEffect(() => {
    const fetchPaperwork = async () => {
      try {
        setLoading(true);
        const response = await paperworksAPI.getPaperworkById(id);
        setPaperwork(response.data);
        
        // Check if user is authorized to submit for this paperwork
        if (response.data.researcher_id !== user.id && user.role !== 'ADMIN') {
          toast.error('You are not authorized to submit for this paperwork');
          navigate(-1);
        }
      } catch (error) {
        console.error('Error fetching paperwork:', error);
        toast.error('Failed to load paperwork details');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchPaperwork();
  }, [id, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setSubmitting(true);
      
      // For demo purposes, we'll create a mock file URL
      // In a real application, you would upload the file to a storage service first
      // and then use the returned URL
      const mockFileUrl = `http://example.com/uploads/${formData.file.name}`;
      
      // Create version data according to API structure
      const versionData = {
        file_url: mockFileUrl,
        comments: formData.comments
      };
      
      await paperworksAPI.submitVersion(id, versionData);
      
      toast.success('Version submitted successfully');
      navigate(`/papers/${id}`);
    } catch (error) {
      console.error('Error submitting version:', error);
      toast.error(error.response?.data?.message || 'Failed to submit version');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Submit New Version</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Paper Details</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p><span className="font-medium">Title:</span> {paperwork.title}</p>
              <p className="mt-2"><span className="font-medium">Current Status:</span> {paperwork.status}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Paper (PDF only)
              </label>
              <input
                type="file"
                id="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                required
              />
              {formData.file && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected file: {formData.file.name} ({Math.round(formData.file.size / 1024)} KB)
                </p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                Comments
              </label>
              <textarea
                id="comments"
                name="comments"
                rows="4"
                value={formData.comments}
                onChange={handleInputChange}
                placeholder="Describe the changes in this version..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Version'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaperworkSubmit;