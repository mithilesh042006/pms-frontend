import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, paperworksAPI } from '../../services/api';
import { toast } from 'sonner';

const PaperAssignment = () => {
  const [papers, setPapers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [papersResponse, usersResponse] = await Promise.all([
        paperworksAPI.getPaperworks(),
        adminAPI.getUsers()
      ]);

      setPapers(papersResponse.data.results || []);
      // Filter only researchers
      const researchers = (usersResponse.data.results || []).filter(
        user => user.role === 'RESEARCHER' && user.status === 'ACTIVE'
      );
      setUsers(researchers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const [deadline, setDeadline] = useState('');

  const handleAssign = async () => {
    if (!selectedPaper || !selectedUser) {
      toast.error('Please select both a paper and a researcher');
      return;
    }

    try {
      setAssigning(true);
      await adminAPI.assignPaperwork({
        title: selectedPaper.title,
        researcher_id: selectedUser,
        deadline: deadline || null
      });
      toast.success('Paper assigned successfully');
      
      // Update local state
      setPapers(papers.map(paper => 
        paper.id === selectedPaper.id 
          ? { ...paper, assigned_to: selectedUser } 
          : paper
      ));
      
      // Reset selection
      setSelectedPaper(null);
      setSelectedUser('');
      setDeadline('');
    } catch (error) {
      console.error('Error assigning paper:', error);
      toast.error('Failed to assign paper');
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenAssignModal = (paper) => {
    setSelectedPaper(paper);
    // If paper is already assigned, pre-select that user
    if (paper.assigned_to) {
      setSelectedUser(paper.assigned_to);
    } else {
      setSelectedUser('');
    }
    // Reset deadline field
    setDeadline('');
  };

  const closeModal = () => {
    setSelectedPaper(null);
    setSelectedUser('');
    setDeadline('');
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'DRAFT': 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const filteredPapers = papers
    .filter(paper => {
      // Filter by status
      if (statusFilter !== 'all' && paper.status !== statusFilter) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          paper.title.toLowerCase().includes(searchLower) ||
          paper.author_name.toLowerCase().includes(searchLower) ||
          (paper.assigned_to_name && paper.assigned_to_name.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Paper Assignment</h1>
          <p className="text-gray-500 mt-1">Assign research papers to researchers</p>
        </div>
        <div className="flex space-x-4">
          <Link to="/admin" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md">
            Back to Dashboard
          </Link>
          <button 
            onClick={fetchData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/3">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Papers
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                placeholder="Search by title, author, or assignee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="w-full md:w-1/4">
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPapers.length > 0 ? (
                filteredPapers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{paper.title}</div>
                      <div className="text-xs text-gray-500">ID: {paper.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{paper.author_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(paper.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {paper.assigned_to_name ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {paper.assigned_to_name}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleOpenAssignModal(paper)}
                        className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors mr-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                        </svg>
                        {paper.assigned_to ? 'Reassign' : 'Assign'}
                      </button>
                      <Link to={`/admin/papers/${paper.id}`} className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No papers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Assign Paper</h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={closeModal}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Paper Title:</p>
                <p className="font-medium">{selectedPaper.title}</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="assignUser" className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Researcher
                </label>
                <select
                  id="assignUser"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a researcher</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Set Deadline (Optional)
                </label>
                <input
                  type="datetime-local"
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                  onClick={handleAssign}
                  disabled={assigning}
                >
                  {assigning && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {assigning ? 'Assigning...' : 'Assign Paper'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperAssignment;