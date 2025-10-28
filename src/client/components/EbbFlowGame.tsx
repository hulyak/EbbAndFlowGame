import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameSession, GameDifficulty, CommunityGarden } from '../../shared/types/api';

interface EbbFlowGameProps {
  gameSession: GameSession | null;
  onCollectLeaf: (leafId: string) => void;
  onStartGame: (difficulty: GameDifficulty) => void;
  onShowLeaderboard?: () => void;
  gameLoading: boolean;
  communityGarden?: CommunityGarden | null;
}

const LEAF_EMOJIS = {
  maple: '🍁',
  oak: '🍂',
  birch: '🍃',
  willow: '🌿',
  cherry: '🌸'
};

const LEAF_COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  red: '#ef4444',
  brown: '#a3a3a3'
};

export const EbbFlowGame = ({ gameSession, onCollectLeaf, onStartGame, onShowLeaderboard, gameLoading, communityGarden }: EbbFlowGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty>('easy');
  const [clickFeedbacks, setClickFeedbacks] = useState<Array<{
    id: string;
    x: number;
    y: number;
    isTarget: boolean;
    timestamp: number;
  }>>([]);
  const [scorePopups, setScorePopups] = useState<Array<{
    id: string;
    x: number;
    y: number;
    points: number;
    timestamp: number;
  }>>([]);

  // Show click feedback
  const showClickFeedback = useCallback((x: number, y: number, isTarget: boolean) => {
    const feedback = {
      id: `feedback-${Date.now()}-${Math.random()}`,
      x,
      y,
      isTarget,
      timestamp: Date.now(),
    };

    setClickFeedbacks(prev => [...prev, feedback]);

    // Add score popup
    const scorePopup = {
      id: `score-${Date.now()}-${Math.random()}`,
      x,
      y,
      points: isTarget ? 100 : 10,
      timestamp: Date.now(),
    };

    setScorePopups(prev => [...prev, scorePopup]);

    // Remove feedback after animation (very fast cleanup)
    setTimeout(() => {
      setClickFeedbacks(prev => prev.filter(f => f.id !== feedback.id));
      setScorePopups(prev => prev.filter(s => s.id !== scorePopup.id));
    }, 400); // Very fast cleanup for minimal interference
  }, []);

  // Animation loop for leaf movement
  const animate = useCallback(() => {
    if (!gameSession || gameSession.status !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update leaf physics with natural movement (modify in place for smooth animation)
    gameSession.leaves.forEach(leaf => {
      // Skip collected leaves completely - don't modify them at all
      if (leaf.isCollected) return;

      // Update position based on velocity
      leaf.x += leaf.vx;
      leaf.y += leaf.vy;

      // Update rotation
      leaf.rotation += leaf.rotationSpeed;

      // Mark leaves as collected if they go off screen (they "escape")
      if (leaf.x < -15 || leaf.x > 115 || leaf.y < -15 || leaf.y > 115) {
        leaf.isCollected = true; // Remove from play
        return;
      }

      // Very gentle bouncing off edges with direction change - use full screen area
      if (leaf.x <= 2 || leaf.x >= 98) {
        leaf.vx = -leaf.vx * 0.6; // Softer bounce
        leaf.x = Math.max(2, Math.min(98, leaf.x));
        // Add some gentle random vertical movement when bouncing horizontally
        leaf.vy += (Math.random() - 0.5) * 0.1;
      }

      if (leaf.y <= 2 || leaf.y >= 98) {
        leaf.vy = -leaf.vy * 0.6; // Softer bounce
        leaf.y = Math.max(2, Math.min(98, leaf.y));
        // Add some gentle random horizontal movement when bouncing vertically
        leaf.vx += (Math.random() - 0.5) * 0.1;
      }

      // NO GRAVITY - let leaves float naturally in all directions

      // Very light air resistance to prevent infinite speed
      leaf.vx *= 0.995;
      leaf.vy *= 0.995;

      // Add very gentle random wind-like forces for organic movement
      leaf.vx += (Math.random() - 0.5) * 0.02; // Much smaller random forces
      leaf.vy += (Math.random() - 0.5) * 0.02;

      // Limit maximum speed to keep it very slow and relaxing
      const maxSpeed = 0.5; // Much slower max speed
      const speed = Math.sqrt(leaf.vx * leaf.vx + leaf.vy * leaf.vy);
      if (speed > maxSpeed) {
        const factor = maxSpeed / speed;
        leaf.vx *= factor;
        leaf.vy *= factor;
      }

      // Ensure minimum movement so leaves don't get stuck
      const minSpeed = 0.05; // Lower minimum speed
      if (speed < minSpeed && speed > 0) {
        const factor = minSpeed / speed;
        leaf.vx *= factor;
        leaf.vy *= factor;
      }
    });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw flowing background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#e0f2fe');
    gradient.addColorStop(0.5, '#bae6fd');
    gradient.addColorStop(1, '#7dd3fc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw leaves
    gameSession.leaves.forEach(leaf => {
      if (leaf.isCollected) return;

      const x = (leaf.x / 100) * canvas.width;
      const y = (leaf.y / 100) * canvas.height;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(leaf.rotation);
      ctx.scale(leaf.size, leaf.size);

      // Draw leaf shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.font = '48px serif';
      ctx.textAlign = 'center';
      ctx.fillText(LEAF_EMOJIS[leaf.type], 3, 3);

      // Draw clickable area indicator
      if (leaf.isTarget) {
        // Bright golden ring for target leaves
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Subtle gray ring for regular leaves
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw leaf with distinct styling for target vs regular
      if (leaf.isTarget) {
        // TARGET LEAVES - Very obvious golden glowing effect
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Strong pulsing glow animation
        const pulseIntensity = Math.sin(Date.now() * 0.008) * 0.5 + 0.8;
        ctx.shadowBlur = 35 * pulseIntensity;

        // Draw golden border ring
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.stroke();

        // Make target leaves smaller but still distinct
        ctx.font = '35px serif';
        ctx.fillStyle = '#fbbf24'; // Golden color for target leaves
        ctx.fillText(LEAF_EMOJIS[leaf.type], 0, 0);

        // Add sparkle effect
        ctx.fillStyle = '#fff';
        ctx.font = '12px serif';
        const sparkleOffset = Math.sin(Date.now() * 0.01) * 10;
        ctx.fillText('✨', sparkleOffset, -sparkleOffset);
      } else {
        // REGULAR LEAVES - Smaller and muted
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;

        ctx.font = '25px serif';
        ctx.fillStyle = LEAF_COLORS[leaf.color];
        ctx.globalAlpha = 0.7; // Make regular leaves more transparent
        ctx.fillText(LEAF_EMOJIS[leaf.type], 0, 0);
        ctx.globalAlpha = 1.0; // Reset alpha
      }

      ctx.restore();
    });

    // Draw click feedback animations (smaller and faster)
    const now = Date.now();
    clickFeedbacks.forEach(feedback => {
      const age = now - feedback.timestamp;
      const progress = age / 600; // Faster 0.6 second animation

      if (progress < 1) {
        const x = (feedback.x / 100) * canvas.width;
        const y = (feedback.y / 100) * canvas.height;

        ctx.save();
        ctx.translate(x, y);

        // Smaller expanding circle effect
        const radius = progress * 25; // Smaller radius
        const opacity = (1 - progress) * 0.6; // More transparent

        ctx.strokeStyle = feedback.isTarget ? `rgba(251, 191, 36, ${opacity})` : `rgba(34, 197, 94, ${opacity})`;
        ctx.lineWidth = 2; // Thinner line
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }
    });

    // Draw very subtle score popups (minimal and transparent)
    scorePopups.forEach(popup => {
      const age = now - popup.timestamp;
      const progress = age / 400; // Very fast 0.4 second animation

      if (progress < 1 && popup.points > 50) { // Only show for target leaves
        const x = (popup.x / 100) * canvas.width;
        const y = (popup.y / 100) * canvas.height - (progress * 15); // Minimal upward movement

        ctx.save();
        ctx.translate(x, y);

        const opacity = (1 - progress) * 0.3; // Very transparent
        const scale = 1 + progress * 0.1; // Minimal growth

        ctx.scale(scale, scale);
        ctx.fillStyle = `rgba(251, 191, 36, ${opacity})`;
        ctx.font = '12px sans-serif'; // Very small font
        ctx.textAlign = 'center';
        ctx.fillText(`+${popup.points}`, 0, 0);

        ctx.restore();
      }
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [gameSession, clickFeedbacks, scorePopups]);

  // Start animation when game starts
  useEffect(() => {
    if (gameSession?.status === 'playing') {
      animate();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameSession?.status, animate]);

  // Handle canvas click/touch
  const handleCanvasInteraction = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!gameSession || gameSession.status !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in event) {
      // Touch event
      if (event.touches.length === 0) return;
      const touch = event.touches[0];
      if (!touch) return;
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      // Mouse event
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    // Check if click/touch is on a leaf
    const clickedLeaf = gameSession.leaves.find(leaf => {
      if (leaf.isCollected) return false;

      const distance = Math.sqrt(
        Math.pow(leaf.x - x, 2) + Math.pow(leaf.y - y, 2)
      );
      return distance < 8; // Adjusted hit area for smaller leaves
    });

    // Debug logging for click detection
    if (process.env.NODE_ENV === 'development') {
      console.log(`Click at (${x.toFixed(1)}, ${y.toFixed(1)})`);
      if (clickedLeaf) {
        console.log(`Hit leaf ${clickedLeaf.id} at (${clickedLeaf.x.toFixed(1)}, ${clickedLeaf.y.toFixed(1)}) - Target: ${clickedLeaf.isTarget}`);
      } else {
        console.log('No leaf hit');
      }
    }

    if (clickedLeaf) {
      // Immediately mark leaf as collected for instant feedback
      clickedLeaf.isCollected = true;

      // Add visual feedback at click position
      showClickFeedback(x, y, clickedLeaf.isTarget);

      // Add haptic feedback on mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(clickedLeaf.isTarget ? [50, 30, 50] : [30]);
      }

      // Add audio feedback (simple beep using Web Audio API)
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(clickedLeaf.isTarget ? 800 : 400, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (e) {
        // Audio feedback failed, continue silently
      }

      onCollectLeaf(clickedLeaf.id);
    }
  }, [gameSession, onCollectLeaf, showClickFeedback]);

  // Game not started - show difficulty selection
  if (!gameSession) {
    return (
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-100 to-blue-100 p-2 sm:p-4 overflow-hidden" style={{ height: '100vh', width: '100vw' }}>
        {/* Floating background leaves */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-xl sm:text-2xl opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {['🍃', '🍂', '🍁', '🌿', '🌸'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl max-w-sm sm:max-w-md w-full text-center relative z-10 border border-white/20 max-h-[95vh] overflow-y-auto">
          {/* Animated logo */}
          <div className="relative mb-3 sm:mb-4">
            <div className="text-4xl sm:text-6xl mb-1 animate-bounce">🍃</div>
            <div className="absolute inset-0 text-4xl sm:text-6xl animate-pulse opacity-30">🌿</div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
            Ebb & Flow
          </h1>
          <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
            Collect only the <span className="text-yellow-600 font-bold">GOLDEN GLOWING</span> leaves with sparkles ✨ - avoid gray ones!
          </p>

          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">Choose Your Challenge</h3>
            <div className="space-y-2">
              {(['easy', 'medium', 'hard'] as GameDifficulty[]).map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`w-full p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 ${selectedDifficulty === difficulty
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-25'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold capitalize text-sm sm:text-base">{difficulty}</div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {difficulty === 'easy' && '10 target • 25 total • 30s • 3 lives'}
                        {difficulty === 'medium' && '15 target • 35 total • 30s • 3 lives'}
                        {difficulty === 'hard' && '20 target • 45 total • 30s • 3 lives'}
                      </div>
                    </div>
                    <div className="text-lg sm:text-xl">
                      {difficulty === 'easy' && '🌱'}
                      {difficulty === 'medium' && '🌿'}
                      {difficulty === 'hard' && '🌳'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onStartGame(selectedDifficulty)}
            disabled={gameLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-4 rounded-lg font-semibold text-base hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {gameLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">Starting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>Start Game</span>
                <span className="text-lg">🎮</span>
              </div>
            )}
          </button>

          {/* Community Garden Preview */}
          {communityGarden && (
            <div className="mt-3 sm:mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
              <div className="text-center">
                <h3 className="font-semibold text-emerald-800 mb-1 flex items-center justify-center text-sm">
                  <span className="mr-1">🌱</span>
                  Community Garden
                </h3>
                <div className="flex justify-center space-x-3 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-emerald-600">{communityGarden.totalLeavesCollected.toLocaleString()}</div>
                    <div className="text-emerald-600">Total Leaves</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-teal-600">{communityGarden.activeGoals.length}</div>
                    <div className="text-teal-600">Active Goals</div>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-1">
                  Contribute to community goals! 🌿
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game in progress
  if (gameSession.status === 'playing') {
    return (
      <div className="flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 overflow-hidden m-0 p-0" style={{ height: '100vh', width: '100vw' }}>
        {/* Compact Game HUD */}
        <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20 flex-shrink-0">
          <div className="flex justify-between items-center mx-auto px-2 py-1">
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <div className="text-base font-bold text-emerald-600">{gameSession.score}</div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-teal-600">
                  {gameSession.collectedLeaves}/{gameSession.targetLeaves}
                </div>
                <div className="text-xs text-gray-500">Leaves</div>
              </div>
              <div className="text-center">
                <div className={`text-base font-bold transition-colors ${gameSession.timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-orange-500'
                  }`}>
                  {gameSession.timeRemaining}s
                </div>
                <div className="text-xs text-gray-500">Time</div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {Array.from({ length: gameSession.lives }).map((_, i) => (
                <span key={i} className="text-red-500 text-sm animate-pulse">❤️</span>
              ))}
            </div>
          </div>

          {/* Compact Progress bar */}
          <div className="px-2 pb-1">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-400 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(gameSession.collectedLeaves / gameSession.targetLeaves) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="relative w-full h-full flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onClick={gameSession.status === 'playing' ? handleCanvasInteraction : undefined}
              onTouchStart={gameSession.status === 'playing' ? handleCanvasInteraction : undefined}
              onTouchEnd={(e) => e.preventDefault()}
              onTouchMove={(e) => e.preventDefault()}
              className={`border-2 border-white/30 rounded-lg shadow-2xl touch-none bg-gradient-to-br from-sky-100 to-emerald-100 ${gameSession.status === 'playing' ? 'cursor-pointer' : 'cursor-default'
                }`}
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
                aspectRatio: '4/3'
              }}
            />

            {/* Compact Game Over Overlay */}
            {gameSession.status !== 'playing' && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="bg-white/95 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">
                    {gameSession.status === 'completed' ? '🎉' : '💀'}
                  </div>
                  <div className="text-base font-bold text-gray-800">
                    {gameSession.status === 'completed' ? 'Complete!' : 'Game Over!'}
                  </div>
                  <div className="text-xs text-gray-600">
                    Score: {gameSession.score}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compact Game Instructions */}
        <div className="bg-white/90 backdrop-blur-sm border-t border-white/20 py-1 px-2 flex-shrink-0">
          <div className="mx-auto text-center">
            <div className="flex justify-center space-x-4 text-xs text-gray-600">
              <span>🎯 Collect <span className="text-yellow-600 font-semibold">GOLDEN</span> leaves ✨</span>
              <span>✨ = 100pts</span>
              <span>💔 = -1 life</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game completed or failed
  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-100 to-blue-100 p-2 sm:p-4 overflow-hidden" style={{ height: '100vh', width: '100vw' }}>
      {/* Celebration particles */}
      {gameSession.status === 'completed' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-lg sm:text-xl animate-bounce opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            >
              {['🎉', '✨', '🌟', '🎊', '💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl max-w-sm sm:max-w-md w-full text-center relative z-10 border border-white/20 max-h-[95vh] overflow-y-auto">
        {/* Result icon with animation */}
        <div className="relative mb-3 sm:mb-4">
          <div className={`text-4xl sm:text-6xl mb-2 ${gameSession.status === 'completed' ? 'animate-bounce' : 'animate-pulse'}`}>
            {gameSession.status === 'completed' ? '🎉' : '😔'}
          </div>
          {gameSession.status === 'completed' && (
            <div className="absolute inset-0 text-4xl sm:text-6xl animate-ping opacity-30">✨</div>
          )}
        </div>

        <h2 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${gameSession.status === 'completed'
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'
          : 'text-red-600'
          }`}>
          {gameSession.status === 'completed' ? 'Fantastic!' : 'Game Over!'}
        </h2>

        {/* Stats with better visual hierarchy */}
        <div className="space-y-3 mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1">{gameSession.score}</div>
            <div className="text-xs sm:text-sm text-gray-600">Final Score</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-teal-50 rounded-lg p-2">
              <div className="text-lg sm:text-xl font-bold text-teal-600">
                {gameSession.collectedLeaves}/{gameSession.targetLeaves}
              </div>
              <div className="text-xs text-gray-600">Leaves Collected</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="text-lg sm:text-xl font-bold text-blue-600">Level {gameSession.level}</div>
              <div className="text-xs text-gray-600 capitalize">{gameSession.difficulty}</div>
            </div>
          </div>

          {/* Game completion message */}
          <div className="text-xs sm:text-sm text-gray-600 italic">
            {gameSession.status === 'completed'
              ? "Great job! Ready for another challenge? 🌿"
              : "Don't give up! Try again to improve your score! 💪"
            }
          </div>
        </div>

        <div className="space-y-3">
          {/* Difficulty Selection */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800 text-center">Choose Your Next Challenge</h3>
            <div className="space-y-1.5">
              {(['easy', 'medium', 'hard'] as GameDifficulty[]).map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => onStartGame(difficulty)}
                  className={`w-full p-2 rounded-lg border-2 transition-all duration-200 ${difficulty === gameSession.difficulty
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-25'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold capitalize text-sm">{difficulty}</div>
                      <div className="text-xs text-gray-500">
                        {difficulty === 'easy' && '10 target • 25 total • 30s • 3 lives'}
                        {difficulty === 'medium' && '15 target • 35 total • 30s • 3 lives'}
                        {difficulty === 'hard' && '20 target • 45 total • 30s • 3 lives'}
                      </div>
                    </div>
                    <div className="text-lg">
                      {difficulty === 'easy' && '🌱'}
                      {difficulty === 'medium' && '🌿'}
                      {difficulty === 'hard' && '🌳'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {onShowLeaderboard && (
            <button
              onClick={onShowLeaderboard}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 border border-gray-200"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm">View Leaderboard</span>
                <span className="text-base">🏆</span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};