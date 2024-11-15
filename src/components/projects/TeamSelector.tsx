import { useState } from 'react';
import { X, Search, Building2, Check, Loader2, Plus } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { Team } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { updateProject } from '../../lib/projects';
import QuickTeamCreate from '../teams/QuickTeamCreate';

interface TeamSelectorProps {
  projectId: string;
  onClose: () => void;
  onTeamSelected: () => void;
}

export default function TeamSelector({ projectId, onClose, onTeamSelected }: TeamSelectorProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showTeamCreate, setShowTeamCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: teams = [], loading: teamsLoading } = useFirestore<Team>('teams', {
    where: [['members', 'array-contains', user?.uid]],
    orderBy: [['name', 'asc']]
  });

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (loading || !selectedTeamId) return;

    setLoading(true);
    setError('');

    try {
      await updateProject(projectId, { teamId: selectedTeamId });
      onTeamSelected();
    } catch (err) {
      console.error('Error adding team:', err);
      setError(err instanceof Error ? err.message : 'Failed to add team');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamCreated = (teamId: string) => {
    setSelectedTeamId(teamId);
    setShowTeamCreate(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Team to Project</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={loading}
            />
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg h-[300px] overflow-y-auto mb-4">
          {teamsLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Building2 className="w-8 h-8 mb-2" />
              <p className="text-sm">No teams found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTeams.map(team => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`w-full flex items-center p-4 hover:bg-gray-50 ${
                    selectedTeamId === team.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-medium text-gray-900">{team.name}</h4>
                    {team.description && (
                      <p className="text-xs text-gray-500">{team.description}</p>
                    )}
                  </div>
                  {selectedTeamId === team.id && (
                    <Check className="w-4 h-4 text-blue-600 ml-2" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowTeamCreate(true)}
          className="w-full mb-4 flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Team
        </button>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedTeamId}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <span>{loading ? 'Adding...' : 'Add Team'}</span>
          </button>
        </div>

        {showTeamCreate && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
            <QuickTeamCreate
              onClose={() => setShowTeamCreate(false)}
              onCreated={handleTeamCreated}
            />
          </div>
        )}
      </div>
    </div>
  );
}