class CoursesView {
    constructor() {
        this.initializeElements();
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 3000; // 3 segundos
    }

    initializeElements() {
        // Primeiro, vamos garantir que o container principal existe
        const container = document.querySelector('.courses-container');
        if (!container) {
            console.error('Container principal não encontrado');
            return;
        }

        // Criar a estrutura se ela não existir
        if (!document.querySelector('.courses-area')) {
            container.innerHTML = `
                <div class="courses-area">
                    <div class="courses-list"></div>
                </div>
                <div class="course-view" style="display: none;">
                    <div class="course-content">
                        <div class="course-header">
                            <div class="breadcrumb">
                                <a href="#cursos" class="breadcrumb-link">Cursos</a>
                            </div>
                            <h1 class="course-title"></h1>
                        </div>
                        <div class="course-layout">
                            <div class="lessons-list"></div>
                            <div class="content-area">
                                <div class="video-player"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Inicializar elementos após garantir que existem
        this.elements = {
            coursesArea: document.querySelector('.courses-area'),
            courseView: document.querySelector('.course-view'),
            coursesList: document.querySelector('.courses-list'),
            courseContent: document.querySelector('.course-content'),
            lessonsList: document.querySelector('.lessons-list'),
            contentArea: document.querySelector('.content-area'),
            videoPlayer: document.querySelector('.video-player'),
            courseTitle: document.querySelector('.course-title'),
            breadcrumb: document.querySelector('.breadcrumb'),
            pdfViewer: document.querySelector('.pdf-viewer'),
            nextButton: document.querySelector('.next-content'),
            prevButton: document.querySelector('.prev-content')
        };

        console.log('Elementos inicializados:', this.elements);
    }

    renderCoursesList(courses) {
        if (!this.elements.coursesList) return;
        
        const carouselWrapper = document.createElement('div');
        carouselWrapper.className = 'courses-carousel-wrapper';

        carouselWrapper.innerHTML = `
            <div class="courses-carousel">
                ${courses.map((course, index) => `
                    <div class="course-card" data-course-id="${course.id}">
                        <img src="${course.thumbnail}" alt="${course.title}">
                        <div class="course-info">
                            <h3>${course.title}</h3>
                            <p>${course.description}</p>
                            <div class="course-meta">
                                <span>${course.duration}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="carousel-btn prev-btn">❮</button>
            <button class="carousel-btn next-btn">❯</button>
            <div class="carousel-dots">
                ${courses.map((_, i) => `
                    <span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
                `).join('')}
            </div>
        `;

        this.elements.coursesList.innerHTML = '';
        this.elements.coursesList.appendChild(carouselWrapper);
        
        this.totalSlides = courses.length;
        this.setupCarousel();
    }

    setupCarousel() {
        // Event listeners para navegação
        document.querySelector('.prev-btn')?.addEventListener('click', () => {
            this.stopAutoPlay();
            this.navigateCarousel('prev');
            this.startAutoPlay();
        });
        
        document.querySelector('.next-btn')?.addEventListener('click', () => {
            this.stopAutoPlay();
            this.navigateCarousel('next');
            this.startAutoPlay();
        });

        // Event listeners para os dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.stopAutoPlay();
                this.currentSlide = index;
                this.updateCarousel();
                this.startAutoPlay();
            });
        });

        // Inicializa o carrossel
        this.updateCarousel();
        this.startAutoPlay();
    }

    updateCarousel() {
        const cards = document.querySelectorAll('.course-card');
        const dots = document.querySelectorAll('.dot');
        
        cards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next');
            
            if (index === this.currentSlide) {
                card.classList.add('active');
            } else if (index === this.getPrevIndex()) {
                card.classList.add('prev');
            } else if (index === this.getNextIndex()) {
                card.classList.add('next');
            }
        });
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
        
        console.log('Carrossel atualizado para o slide:', this.currentSlide);
    }

    getPrevIndex() {
        return (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    }

    getNextIndex() {
        return (this.currentSlide + 1) % this.totalSlides;
    }

    navigateCarousel(direction) {
        if (direction === 'next') {
            this.currentSlide = this.getNextIndex();
        } else {
            this.currentSlide = this.getPrevIndex();
        }
        this.updateCarousel();
    }

    startAutoPlay() {
        if (this.autoPlayInterval) return;
        
        this.autoPlayInterval = setInterval(() => {
            this.navigateCarousel('next');
        }, this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    renderLessonsList(lessons, currentLessonId) {
        if (!this.elements.lessonsList) return;

        this.elements.lessonsList.innerHTML = `
            <div class="lessons-header">
                <h3>Conteúdo do Curso</h3>
            </div>
            <div class="lessons-items">
                ${lessons[0].lessons.map(lesson => `
                    <div class="lesson-item ${lesson.id === currentLessonId ? 'active' : ''}" 
                         data-lesson-id="${lesson.id}">
                        <div class="lesson-info">
                            <h4>${lesson.title}</h4>
                            <span class="duration">${lesson.duration}</span>
                        </div>
                        ${lesson.conteudos ? `
                            <div class="lesson-contents">
                                ${lesson.conteudos.map((conteudo, index) => `
                                    <div class="content-item ${index === 0 ? '' : 'locked'}"
                                         data-content-id="${conteudo.id}">
                                        <span class="content-icon ${conteudo.tipo}"></span>
                                        <span class="content-title">${conteudo.titulo}</span>
                                        ${index === 0 ? '' : '<span class="lock-icon">🔒</span>'}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderContent(content) {
        if (!this.elements.videoPlayer) return;
        
        switch(content.tipo) {
            case 'video':
                // Extrai o ID do vídeo da URL
                const videoId = this.extractYoutubeId(content.content);
                this.elements.videoPlayer.innerHTML = `
                    <div class="video-container">
                        <iframe 
                            id="youtube-player"
                            src="https://www.youtube.com/embed/${videoId}?enablejsapi=1"
                            width="100%"
                            height="100%"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                        ></iframe>
                    </div>
                    <div class="video-controls">
                        <h2>${content.titulo}</h2>
                    </div>
                `;
                break;
            case 'texto':
                this.elements.videoPlayer.innerHTML = `
                    <div class="texto-container">
                        <h2>${content.titulo}</h2>
                        <div class="texto-content">
                            ${content.conteudo}
                        </div>
                    </div>
                `;
                break;
            case 'quiz':
                this.elements.videoPlayer.innerHTML = `
                    <div class="quiz-container">
                        <h2>${content.titulo}</h2>
                        ${content.questoes.map(questao => `
                            <div class="questao">
                                <p class="questao-texto">${questao.pergunta}</p>
                                <div class="alternativas">
                                    ${questao.alternativas.map((alt, index) => `
                                        <label class="alternativa">
                                            <input type="radio" name="questao" value="${index}">
                                            <span>${alt}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                        <button class="btn-verificar">Verificar Resposta</button>
                    </div>
                `;
                break;
        }
    }

    extractYoutubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    renderPDF(lesson) {
        if (!this.elements.pdfViewer) return;

        this.elements.pdfViewer.innerHTML = `
            <iframe src="${lesson.content}" type="application/pdf">
                Este navegador não suporta visualização de PDF.
            </iframe>
        `;
    }

    updateNavigationButtons(hasPrev, hasNext) {
        if (this.elements.prevButton) {
            this.elements.prevButton.disabled = !hasPrev;
        }
        if (this.elements.nextButton) {
            this.elements.nextButton.disabled = !hasNext;
        }
    }

    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        this.elements.courseContent.appendChild(errorElement);
    }

    updateContentStatus(contentId, completed) {
        const contentItem = document.querySelector(`[data-content-id="${contentId}"]`);
        if (contentItem) {
            // Remove classe locked e ícone de cadeado
            contentItem.classList.remove('locked');
            const lockIcon = contentItem.querySelector('.lock-icon');
            if (lockIcon) lockIcon.remove();

            // Adiciona classe completed e ícone de check
            contentItem.classList.add('completed');
            if (!contentItem.querySelector('.check-icon')) {
                contentItem.appendChild(this.createCheckIcon());
            }
        }
    }

    unlockContent(contentId) {
        const contentItem = document.querySelector(`[data-content-id="${contentId}"]`);
        if (contentItem) {
            contentItem.classList.remove('locked');
            const lockIcon = contentItem.querySelector('.lock-icon');
            if (lockIcon) {
                lockIcon.remove();
            }
            console.log('Conteúdo desbloqueado:', contentId);
        }
    }

    createCheckIcon() {
        const checkIcon = document.createElement('span');
        checkIcon.className = 'check-icon';
        checkIcon.textContent = '✓';
        return checkIcon;
    }

    showCourseContent(course) {
        console.log('Tentando mostrar curso:', course);
        
        if (!this.elements.coursesArea || !this.elements.courseView) {
            console.error('Elementos necessários não encontrados');
            return;
        }

        // Esconde a área de listagem de cursos
        this.elements.coursesArea.style.display = 'none';
        
        // Mostra a área do curso
        this.elements.courseView.style.display = 'block';
        
        // Atualiza o título do curso
        if (this.elements.courseTitle) {
            this.elements.courseTitle.textContent = course.title;
        }
        
        // Atualiza o breadcrumb
        if (this.elements.breadcrumb) {
            this.elements.breadcrumb.innerHTML = `
                <a href="#cursos" class="breadcrumb-link">Cursos</a> > 
                <span>${course.title}</span>
            `;
        }
    }

    showCoursesArea() {
        console.log('Tentando voltar para lista de cursos');
        
        if (!this.elements.coursesArea || !this.elements.courseView) {
            console.error('Elementos necessários não encontrados');
            return;
        }

        // Mostra a área de listagem de cursos
        this.elements.coursesArea.style.display = 'block';
        
        // Esconde a área do curso
        this.elements.courseView.style.display = 'none';
    }

    setCurrentSlide(index) {
        console.log('Definindo slide atual:', index);
        this.currentSlide = index;
        this.updateCarousel();
    }
}

export default CoursesView; 