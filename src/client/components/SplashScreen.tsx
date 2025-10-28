import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [stage, setStage] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timers = [
      // Stage 0: Initial logo appear
      setTimeout(() => setStage(1), 200),
      // Stage 1: Title appear
      setTimeout(() => setStage(2), 400),
      // Stage 2: Subtitle appear
      setTimeout(() => setStage(3), 600),
      // Stage 3: Floating leaves animation
      setTimeout(() => setStage(4), 800),
      // Stage 4: Start fade out
      setTimeout(() => setFadeOut(true), 1200),
      // Stage 5: Complete
      setTimeout(() => onComplete(), 1500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(() => onComplete(), 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 transition-opacity duration-500 cursor-pointer ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleSkip}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {['🍃', '🍂', '🍁', '🌿', '🌸'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="text-center z-10 px-8">
        {/* Logo */}
        <div className={`transition-all duration-1000 ${stage >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <div className="relative mb-8">
            <div className="text-8xl md:text-9xl animate-pulse-slow">🍃</div>
            <div className="absolute inset-0 text-8xl md:text-9xl animate-spin-slow opacity-30">🌿</div>
          </div>
        </div>

        {/* Title */}
        <div className={`transition-all duration-1000 delay-300 ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-wide">
            Ebb & Flow
          </h1>
        </div>

        {/* Subtitle */}
        <div className={`transition-all duration-1000 delay-500 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-light">
            Zen Leaf Collection Game
          </p>
        </div>

        {/* Floating leaves animation */}
        <div className={`transition-all duration-1000 delay-700 ${stage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-center space-x-4 mb-8">
            {['🍁', '🍂', '🍃', '🌿', '🌸'].map((leaf, i) => (
              <div
                key={i}
                className="text-3xl animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s',
                }}
              >
                {leaf}
              </div>
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        <div className={`transition-all duration-1000 delay-1000 ${stage >= 4 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>

        {/* Skip indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-white/70 text-sm animate-pulse">
            Click anywhere to skip
          </p>
        </div>
      </div>


    </div>
  );
};