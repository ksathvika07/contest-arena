import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Play, Square, Zap, RefreshCw, Radio } from 'lucide-react';

interface LiveSimulatorControlProps {
  contestId?: string;
  onSimulationEvent?: () => void;
}

export const LiveSimulatorControl: React.FC<LiveSimulatorControlProps> = ({
  contestId,
  onSimulationEvent,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [eventCount, setEventCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  const checkStatus = async () => {
    try {
      const res = await api.getSimulationStatus();
      if (res.success) {
        setIsRunning(res.isRunning);
        setEventCount(res.totalSimulatedEvents);
      }
    } catch (err) {}
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerSingle = async () => {
    setIsLoading(true);
    setStatusMsg('');
    try {
      const res = await api.simulateScore(contestId);
      if (res.success) {
        setStatusMsg(
          `Simulated score for ${res.simulation.name}: ${res.simulation.score} pts (Rank #${res.simulation.newRank})`
        );
        setEventCount((prev) => prev + 1);
        if (onSimulationEvent) onSimulationEvent();
      }
    } catch (err: any) {
      setStatusMsg('Simulation failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleContinuous = async () => {
    setIsLoading(true);
    setStatusMsg('');
    try {
      if (isRunning) {
        const res = await api.stopSimulation();
        if (res.success) {
          setIsRunning(false);
          setStatusMsg('Live simulator stopped.');
        }
      } else {
        const res = await api.startSimulation(contestId, 3);
        if (res.success) {
          setIsRunning(true);
          setStatusMsg('Live simulator running (1 score every 3 seconds).');
        }
      }
    } catch (err: any) {
      setStatusMsg('Failed to toggle simulator: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-arena-aubergine/70 via-arena-card to-arena-surface border border-arena-peach/30 shadow-card-elevated">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title & Badge */}
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isRunning
                ? 'bg-emerald-500 text-arena-midnight animate-pulse'
                : 'bg-arena-berry text-arena-peach'
            }`}
          >
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Live Score Stream Simulator
              </h4>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400 text-arena-midnight shadow-sm">
                DEMO MODE
              </span>
            </div>
            <p className="text-[11px] text-gray-300">
              Generates genuine Redis Sorted Set & Pub/Sub score updates via Socket.IO
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Single Event Trigger */}
          <button
            onClick={handleTriggerSingle}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-arena-aubergine hover:bg-arena-berry text-arena-peach hover:text-white border border-arena-peach/30 text-xs font-bold transition-all disabled:opacity-50"
            title="Simulate a single score submission right now"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Simulate 1 Score</span>
          </button>

          {/* Continuous Loop Toggle */}
          <button
            onClick={handleToggleContinuous}
            disabled={isLoading}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              isRunning
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                : 'bg-gradient-to-r from-arena-peach to-arena-rose text-arena-midnight hover:shadow-glow-peach'
            }`}
          >
            {isRunning ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Auto Stream (3s)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Status Message & Counter */}
      {(statusMsg || isRunning) && (
        <div className="mt-3 pt-2.5 border-t border-arena-border flex items-center justify-between text-[11px]">
          <span className="text-arena-blush truncate">
            {statusMsg || 'Continuous simulated exam scores streaming into Redis...'}
          </span>
          <span className="text-gray-400 font-mono shrink-0 ml-2">
            Simulated events: <strong className="text-arena-peach">{eventCount}</strong>
          </span>
        </div>
      )}
    </div>
  );
};
