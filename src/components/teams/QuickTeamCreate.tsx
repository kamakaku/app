import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createTeam } from '../../lib/firebase';

interface QuickTeamCreateProps {
  onClose: () => void;
  onCreated: (teamId: string) => void;
}

export default function QuickTeamCreate({ onClose, onCreated }: QuickTeamCreateProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const team = await createTeam({
        name: name.trim(),
        description: ''
      });
      onCreated(team.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Create New Team</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
            Team Name
          </label>
          <input
            id="teamName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
            disabled={loading}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>
  );
}