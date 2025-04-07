import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Lock } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  isLocked?: boolean;
  onComplete?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, isLocked = false, onComplete }) => {
  const { data: session } = useSession();
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verifica se o usuário tem acesso ao conteúdo
    const checkAccess = () => {
      if (!isLocked || session?.user) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [isLocked, session]);

  const handleVideoError = (e: any) => {
    console.error('Erro no carregamento do vídeo:', e);
    setError('Ocorreu um erro ao carregar o vídeo. Por favor, tente novamente.');
  };

  const handleVideoEnded = () => {
    if (onComplete) {
      onComplete();
    }
  };

  if (!hasAccess) {
    return (
      <div className="relative w-full h-[400px] bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Lock className="w-12 h-12 mx-auto mb-4" />
          <p>Este conteúdo está bloqueado.</p>
          <p>Faça login para ter acesso.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-[400px] bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <video
        className="w-full h-full object-cover"
        controls
        onError={handleVideoError}
        onEnded={handleVideoEnded}
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Seu navegador não suporta o elemento de vídeo.
      </video>
    </div>
  );
};

export default VideoPlayer; 