class CoursesModel {
    constructor() {
        this.courses = [];
        this.currentCourse = null;
        this.currentLesson = null;
        this.loadProgress();
    }

    async loadCourses() {
        try {
            const response = await fetch('data/courses.json');
            if (!response.ok) {
                throw new Error(`Falha ao carregar cursos: ${response.status}`);
            }

            const data = await response.json();
            this.courses = data.courses;
            return true;
        } catch (error) {
            console.error('Erro ao carregar cursos:', error);
            return false;
        }
    }

    getCourseById(courseId) {
        return this.courses.find(course => course.id === courseId);
    }

    getLessonById(courseId, lessonId) {
        const course = this.getCourseById(courseId);
        if (!course) return null;
        return course.lessons.find(lesson => lesson.id === lessonId);
    }

    setCurrentCourse(courseId) {
        this.currentCourse = this.getCourseById(courseId);
        this.currentLesson = this.currentCourse?.lessons[0] || null;
    }

    setCurrentLesson(lessonId) {
        if (!this.currentCourse) return false;
        this.currentLesson = this.getLessonById(this.currentCourse.id, lessonId);
        return true;
    }

    getNextLesson() {
        if (!this.currentCourse || !this.currentLesson) return null;
        const currentIndex = this.currentCourse.lessons.findIndex(
            lesson => lesson.id === this.currentLesson.id
        );
        return this.currentCourse.lessons[currentIndex + 1] || null;
    }

    getPreviousLesson() {
        if (!this.currentCourse || !this.currentLesson) return null;
        const currentIndex = this.currentCourse.lessons.findIndex(
            lesson => lesson.id === this.currentLesson.id
        );
        return this.currentCourse.lessons[currentIndex - 1] || null;
    }

    getUserProgress(courseId) {
        // Implementar lógica de progresso do usuário
        return {
            completedLessons: [],
            progress: 0,
            lastLesson: null
        };
    }

    loadProgress() {
        const savedProgress = localStorage.getItem('courseProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.progress = progress;
        } else {
            this.progress = {};
        }
    }

    updateContentStatus(contentId, completed) {
        if (!this.progress[this.currentCourse.id]) {
            this.progress[this.currentCourse.id] = {};
        }
        this.progress[this.currentCourse.id][contentId] = completed;
    }

    getProgress() {
        return this.progress;
    }

    isContentCompleted(contentId) {
        return this.progress[this.currentCourse?.id]?.[contentId] || false;
    }
}

export default CoursesModel; 