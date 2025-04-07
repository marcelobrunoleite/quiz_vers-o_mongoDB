import FlashcardsModel from './components/Flashcards/FlashcardsModel.js';
import FlashcardsView from './components/Flashcards/FlashcardsView.js';
import FlashcardsController from './components/Flashcards/FlashcardsController.js';
import CoursesModel from './components/Courses/CoursesModel.js';
import CoursesView from './components/Courses/CoursesView.js';
import CoursesController from './components/Courses/CoursesController.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicialização do componente de Cursos
    if (document.querySelector('.courses-container')) {
        const model = new CoursesModel();
        const view = new CoursesView();
        const controller = new CoursesController(model, view);
    }

    // Mantém a inicialização dos outros componentes
    if (document.querySelector('.flashcards-container')) {
        const flashcardsModel = new FlashcardsModel();
        const flashcardsView = new FlashcardsView();
        window.flashcards = new FlashcardsController(flashcardsModel, flashcardsView);
    }
}); 