import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import VideoPlayer from './VideoPlayer';
import { Lock, CheckCircle } from 'lucide-react';
import CTBQuestions from './CTBQuestions';

interface CourseContentProps {
  sections: {
    id: string;
    title: string;
    duration: string;
    videoUrl: string;
  }[];
}

const CourseContent: React.FC<CourseContentProps> = ({ sections }) => {
  const { data: session } = useSession();
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    // Carregar progresso salvo
    const savedProgress = localStorage.getItem('courseProgress');
    if (savedProgress) {
      setCompletedSections(JSON.parse(savedProgress));
    }
  }, []);

  const handleSectionComplete = (sectionId: string) => {
    const newCompletedSections = [...completedSections, sectionId];
    setCompletedSections(newCompletedSections);
    localStorage.setItem('courseProgress', JSON.stringify(newCompletedSections));
  };

  const isSectionLocked = (index: number) => {
    if (!session) return true;
    if (index === 0) return false;
    return !completedSections.includes(sections[index - 1].id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      <div className="md:col-span-1 space-y-4">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">Conteúdo do Curso</h3>
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`p-4 rounded-lg border ${
              currentSection === index
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-gray-700 bg-gray-800/50'
            } cursor-pointer transition-all hover:border-cyan-400`}
            onClick={() => !isSectionLocked(index) && setCurrentSection(index)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">{section.title}</h4>
                <p className="text-sm text-gray-400">{section.duration}</p>
              </div>
              {isSectionLocked(index) ? (
                <Lock className="w-5 h-5 text-gray-400" />
              ) : completedSections.includes(section.id) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="md:col-span-2">
        <VideoPlayer
          videoUrl={sections[currentSection].videoUrl}
          isLocked={isSectionLocked(currentSection)}
          onComplete={() => handleSectionComplete(sections[currentSection].id)}
        />
      </div>

      <CTBQuestions />
    </div>
  );
};

export default CourseContent; 