class CoursesController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.currentContent = null;
        this.lastProgress = 0;
        this.currentCourseIndex = 0;
        this.init();
    }

    async init() {
        try {
            const success = await this.model.loadCourses();
            if (success) {
                this.setupEventListeners();
                this.view.renderCoursesList(this.model.courses);
            }
        } catch (error) {
            this.view.showError('Erro ao carregar os cursos.');
        }
    }

    setupEventListeners() {
        // Listener para seleção de curso
        document.addEventListener('click', (e) => {
            const courseCard = e.target.closest('.course-card');
            if (courseCard) {
                e.preventDefault();
                const courseId = courseCard.dataset.courseId;
                console.log('Card do curso clicado:', courseId);
                this.navigateToCourse(courseId);
            }

            // Listener para voltar para lista de cursos
            if (e.target.matches('.breadcrumb-link')) {
                e.preventDefault();
                console.log('Clique no breadcrumb');
                this.showCoursesList();
            }
        });

        // Listener para seleção de conteúdo
        this.view.elements.lessonsList?.addEventListener('click', (e) => {
            const contentItem = e.target.closest('.content-item');
            if (contentItem) {
                if (contentItem.classList.contains('locked')) {
                    this.view.showMessage('Complete o conteúdo anterior para desbloquear este.');
                    return;
                }
                const contentId = contentItem.dataset.contentId;
                this.loadContent(contentId);
            }
        });

        // Listener para completar vídeo
        this.view.elements.videoPlayer?.addEventListener('ended', () => {
            if (this.currentContent) {
                this.completeContent(this.currentContent.id);
            }
        });
    }

    navigateToCourse(courseId) {
        console.log('Navegando para curso:', courseId);
        
        // Salva o índice do curso atual
        this.currentCourseIndex = this.model.courses.findIndex(course => course.id === courseId);
        console.log('Índice do curso atual:', this.currentCourseIndex);
        
        // Carrega o curso
        this.model.setCurrentCourse(courseId);
        
        if (this.model.currentCourse) {
            console.log('Curso carregado:', this.model.currentCourse);
            
            // Mostra a view do curso
            this.view.showCourseContent(this.model.currentCourse);
            
            // Renderiza a lista de aulas
            this.view.renderLessonsList(
                [this.model.currentCourse],
                this.model.currentCourse.id
            );
            
            // Carrega o primeiro conteúdo
            const firstLesson = this.model.currentCourse.lessons[0];
            if (firstLesson?.conteudos?.length > 0) {
                this.loadContent(firstLesson.conteudos[0].id);
            }
        }
    }

    showCoursesList() {
        // Volta para a lista de cursos
        this.view.showCoursesArea();
        
        // Atualiza o carrossel para mostrar o curso atual
        if (this.currentCourseIndex >= 0) {
            this.view.setCurrentSlide(this.currentCourseIndex);
        }
    }

    loadCourse(courseId) {
        this.model.setCurrentCourse(courseId);
        if (this.model.currentCourse) {
            // Renderiza a lista de aulas
            this.view.renderLessonsList(
                [this.model.currentCourse],
                this.model.currentCourse.id
            );
            
            // Carrega o primeiro conteúdo automaticamente
            const firstLesson = this.model.currentCourse.lessons[0];
            if (firstLesson && firstLesson.conteudos && firstLesson.conteudos.length > 0) {
                this.loadContent(firstLesson.conteudos[0].id);
            }
            
            this.updateProgress();
        }
    }

    loadContent(contentId) {
        if (!this.model.currentCourse) return;

        const content = this.findContent(contentId);
        if (content) {
            this.currentContent = content;
            this.view.renderContent(content);

            // Adicionar listeners específicos para cada tipo de conteúdo
            switch(content.tipo) {
                case 'video':
                    this.setupVideoListeners();
                    break;
                case 'texto':
                    this.setupTextoListeners();
                    break;
                case 'quiz':
                    this.setupQuizListeners();
                    break;
            }
        }
    }

    findContent(contentId) {
        return this.model.currentCourse.lessons.reduce((found, lesson) => {
            if (found) return found;
            return lesson.conteudos?.find(c => c.id === contentId);
        }, null);
    }

    completeContent(contentId) {
        console.log('Completando conteúdo:', contentId);
        
        // Atualiza o status no modelo
        this.model.updateContentStatus(contentId, true);
        
        // Atualiza a visualização
        this.view.updateContentStatus(contentId, true);
        
        // Desbloqueia o próximo conteúdo
        this.unlockNextContent(contentId);
        
        // Salva o progresso
        this.saveProgress();
    }

    unlockNextContent(currentContentId) {
        console.log('Tentando desbloquear próximo conteúdo após:', currentContentId);
        
        const currentLesson = this.model.currentCourse.lessons.find(lesson => 
            lesson.conteudos && lesson.conteudos.some(content => content.id === currentContentId)
        );

        if (currentLesson) {
            const currentIndex = currentLesson.conteudos.findIndex(content => 
                content.id === currentContentId
            );

            console.log('Índice atual:', currentIndex, 'Total de conteúdos:', currentLesson.conteudos.length);

            // Se houver um próximo conteúdo na mesma lição
            if (currentIndex >= 0 && currentIndex < currentLesson.conteudos.length - 1) {
                const nextContent = currentLesson.conteudos[currentIndex + 1];
                console.log('Próximo conteúdo:', nextContent);
                this.view.unlockContent(nextContent.id);
            }
        }
    }

    setupVideoListeners() {
        const video = this.view.elements.videoPlayer.querySelector('iframe');
        if (video && video.src.includes('youtube')) {
            // Extrai o ID do vídeo do YouTube da URL
            const videoId = this.extractYoutubeId(video.src);
            
            // Carrega a API do YouTube se ainda não estiver carregada
            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            // Configura o player quando a API estiver pronta
            if (window.YT && window.YT.Player) {
                this.createYouTubePlayer(video, videoId);
            } else {
                window.onYouTubeIframeAPIReady = () => {
                    this.createYouTubePlayer(video, videoId);
                };
            }
        }
    }

    createYouTubePlayer(iframe, videoId) {
        new YT.Player(iframe, {
            videoId: videoId,
            events: {
                'onStateChange': (event) => {
                    if (event.data === YT.PlayerState.ENDED) {
                        console.log('Vídeo terminado, completando conteúdo:', this.currentContent.id);
                        this.completeContent(this.currentContent.id);
                    }
                }
            }
        });
    }

    extractYoutubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    setupTextoListeners() {
        const btnConcluir = document.createElement('button');
        btnConcluir.className = 'btn-concluir';
        btnConcluir.textContent = 'Marcar como Concluído';
        this.view.elements.videoPlayer.querySelector('.texto-container').appendChild(btnConcluir);

        btnConcluir.addEventListener('click', () => {
            this.completeContent(this.currentContent.id);
        });
    }

    setupQuizListeners() {
        const btnVerificar = this.view.elements.videoPlayer.querySelector('.btn-verificar');
        if (btnVerificar) {
            btnVerificar.addEventListener('click', () => {
                const respostas = this.view.getQuizRespostas();
                if (this.verificarRespostas(respostas)) {
                    this.completeContent(this.currentContent.id);
                }
            });
        }
    }

    verificarRespostas(respostas) {
        // Implementar lógica de verificação do quiz
        return true; // Temporário
    }

    saveProgress() {
        // Salva o progresso no localStorage
        localStorage.setItem('courseProgress', JSON.stringify(this.model.getProgress()));
    }

    updateProgress() {
        if (!this.model.currentCourse) return;

        const totalContents = this.getTotalContents();
        const completedContents = this.getCompletedContents();
        
        if (totalContents === 0) return;

        const progress = Math.round((completedContents / totalContents) * 100);
        console.log('Progresso calculado:', progress + '%', 
                    'Completos:', completedContents, 
                    'Total:', totalContents);
        
        this.view.updateProgressBar(progress);
        
        if (progress > this.lastProgress) {
            this.checkAchievements(progress);
        }
        
        this.lastProgress = progress;
    }

    getTotalContents() {
        return this.model.currentCourse.lessons.reduce((total, lesson) => {
            return total + (lesson.conteudos?.length || 0);
        }, 0);
    }

    getCompletedContents() {
        const courseProgress = this.model.progress[this.model.currentCourse.id] || {};
        return Object.values(courseProgress).filter(status => status === true).length;
    }
}

export default CoursesController; 