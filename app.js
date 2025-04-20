// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicação iniciada');
    
    // Inicializar carrossel
    const carrossel = document.querySelector('.carrossel-container');
    if (carrossel) {
        let currentSlide = 0;
        const slides = carrossel.querySelectorAll('.carrossel-slide');
        const dots = carrossel.querySelector('.carrossel-dots');
        
        // Criar dots
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.addEventListener('click', () => goToSlide(index));
            dots.appendChild(dot);
        });
        
        // Funções do carrossel
        function goToSlide(n) {
            slides[currentSlide].style.display = 'none';
            dots.children[currentSlide].classList.remove('active');
            
            currentSlide = (n + slides.length) % slides.length;
            
            slides[currentSlide].style.display = 'block';
            dots.children[currentSlide].classList.add('active');
        }
        
        // Inicializar primeiro slide
        goToSlide(0);
        
        // Botões de navegação
        document.querySelector('.prev').addEventListener('click', () => goToSlide(currentSlide - 1));
        document.querySelector('.next').addEventListener('click', () => goToSlide(currentSlide + 1));
    }
    
    // Inicializar botões de ação
    const btnQuizStart = document.querySelector('.btn-quiz-start');
    if (btnQuizStart) {
        btnQuizStart.addEventListener('click', () => {
            window.location.href = 'quiz.html';
        });
    }
}); 