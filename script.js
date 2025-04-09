// Variáveis globais
let questoes = [];
let indiceQuestaoAtual = 0;
let pontuacao = 0;
let respostaSelecionada = null;
const TOTAL_QUESTOES = 30;
const PORCENTAGEM_APROVACAO = 70;
const TEMPO_LIMITE = 60 * 60; // 60 minutos em segundos
let mostrarRespostasImediatas = true;
let userResults = [];
let timerQuestao;
const TEMPO_POR_QUESTAO = 30; // 30 segundos por questão
let modoDesafio = false;
let timerIntervalo;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado');
    
    // Inicializar menu mobile primeiro
    setupMobileMenu();
    
    // Identificar página atual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log('Página atual:', currentPage);
    
    // Configurações específicas para cada página
    switch(currentPage) {
        case 'quiz.html':
            setupQuiz();
            break;
        case 'placas.html':
            initializePlacas();
            break;
        case 'index.html':
            initializeCarousel();
            break;
        case 'flashcards.html':
            // Inicialização dos flashcards
            break;
    }
});

function setupMobileMenu() {
    const menuHamburguer = document.querySelector('.menu-hamburguer');
    const menuPrincipal = document.querySelector('.menu-principal');
    
    if (!menuHamburguer || !menuPrincipal) {
        console.log('Elementos do menu não encontrados');
        return;
    }

    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    // Toggle menu ao clicar no hambúrguer
    menuHamburguer.addEventListener('click', (e) => {
        e.stopPropagation(); // Impedir propagação do clique
        toggleMenu();
    });

    // Fechar menu ao clicar no overlay
    overlay.addEventListener('click', toggleMenu);

    // Fechar menu ao clicar em links
    menuPrincipal.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    function toggleMenu() {
        menuHamburguer.classList.toggle('ativo');
        menuPrincipal.classList.toggle('ativo');
        overlay.classList.toggle('ativo');
        document.body.style.overflow = menuPrincipal.classList.contains('ativo') ? 'hidden' : '';
    }
}

function setupNavigation() {
    // Configurar links de navegação
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href) {
                window.location.href = href;
            }
        });
    });

    // Configurar botões que levam ao quiz
    const quizButtons = document.querySelectorAll('.btn-quiz-start');
    quizButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = 'quiz.html';
        });
    });
}

// Nova função para configurar o quiz
function setupQuiz() {
    console.log('Configurando quiz...');
    const modoCard = document.getElementById('modo-selecao');
    const quizCard = document.getElementById('quiz');
    const modoOpcoes = document.querySelectorAll('.modo-opcao');
    const feedbackOpcoes = document.querySelectorAll('.feedback-opcao');
    const btnIniciar = document.getElementById('iniciar-simulado');
    let modoSelecionado = false;
    let feedbackSelecionado = false;

    if (!modoCard || !quizCard || !btnIniciar) {
        console.error('Elementos do quiz não encontrados');
        return;
    }

    btnIniciar.disabled = true;

    // Evento para seleção do modo
    modoOpcoes.forEach(opcao => {
        if (!opcao.classList.contains('feedback-opcao')) {
            opcao.addEventListener('click', () => {
                modoOpcoes.forEach(op => {
                    if (!op.classList.contains('feedback-opcao')) {
                        op.classList.remove('selecionado');
                    }
                });
                opcao.classList.add('selecionado');
                modoDesafio = opcao.dataset.modo === 'desafio';
                modoSelecionado = true;
                btnIniciar.disabled = !(modoSelecionado && feedbackSelecionado);
            });
        }
    });

    // Evento para seleção do tipo de feedback
    feedbackOpcoes.forEach(opcao => {
        opcao.addEventListener('click', () => {
            feedbackOpcoes.forEach(op => op.classList.remove('selecionado'));
            opcao.classList.add('selecionado');
            mostrarRespostasImediatas = opcao.dataset.feedback === 'imediato';
            feedbackSelecionado = true;
            btnIniciar.disabled = !(modoSelecionado && feedbackSelecionado);
        });
    });

    // Evento para iniciar o simulado
    btnIniciar.addEventListener('click', async () => {
        try {
            console.log('Iniciando simulado...');
            modoCard.style.display = 'none';
            quizCard.classList.remove('escondido');

            const questoesCarregadas = await carregarQuestoes();
            if (questoesCarregadas) {
                // Iniciar áudio apenas no modo desafio
                if (modoDesafio) {
                    const suspenseMusic = document.getElementById('suspenseMusic');
                    if (suspenseMusic) {
                        suspenseMusic.volume = 0.5;
                        suspenseMusic.play().catch(err => {
                            console.error('Erro ao tocar áudio:', err);
                        });
                    }
                }
                
                // Garantir que o quiz esteja visível antes de rolar
                setTimeout(() => {
                    const quizCard = document.getElementById('quiz');
                    const header = document.querySelector('.site-header');
                    if (quizCard && header) {
                        const headerHeight = header.offsetHeight;
                        const offset = headerHeight + 10;
                        
                        window.scrollTo({
                            top: quizCard.offsetTop - offset,
                            behavior: 'smooth'
                        });
                    }
                }, 100);

                inicializarQuiz();
            } else {
                console.error('Erro ao carregar questões');
                alert('Erro ao carregar as questões. Por favor, tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao iniciar simulado:', error);
            alert('Ocorreu um erro ao iniciar o simulado. Por favor, tente novamente.');
        }
    });
}

function inicializarQuiz() {
    console.log('Inicializando quiz...');
    
    // Configurar eventos do quiz
    const confirmarBtn = document.getElementById('confirmar');
    if (confirmarBtn) {
        confirmarBtn.addEventListener('click', verificarResposta);
    }

    const proximaBtn = document.getElementById('proxima');
    if (proximaBtn) {
        proximaBtn.addEventListener('click', proximaQuestao);
    }

    // Configurar seleção de alternativas
    document.addEventListener('click', (e) => {
        const alternativa = e.target.closest('.alternativa');
        if (alternativa && !alternativa.classList.contains('disabled')) {
            selecionarAlternativa(alternativa);
        }
    });

    // Iniciar o timer apropriado apenas uma vez
    if (modoDesafio) {
        iniciarTimerQuestao();
    } else {
        iniciarTempo();
    }

    // Exibir primeira questão
    exibirQuestao();
}

function selecionarQuestoesProporcionais(todasQuestoes, totalQuestoes) {
    // Definir as proporções por tema
    const proporcoes = {
        'Legislação de Trânsito': 0.40,
        'Direção Defensiva': 0.35,
        'Primeiros Socorros': 0.09,
        'Meio Ambiente': 0.09,
        'Mecânica': 0.07
    };

    // Calcular quantidade de questões por tema
    const questoesPorTema = {};
    Object.keys(proporcoes).forEach(tema => {
        questoesPorTema[tema] = Math.round(totalQuestoes * proporcoes[tema]);
    });

    // Separar questões por tema
    const questoesPorCategoria = {};
    todasQuestoes.forEach(questao => {
        if (!questoesPorCategoria[questao.tema]) {
            questoesPorCategoria[questao.tema] = [];
        }
        questoesPorCategoria[questao.tema].push(questao);
    });

    // Selecionar questões aleatórias respeitando as proporções
    let questoesSelecionadas = [];
    Object.keys(questoesPorTema).forEach(tema => {
        const quantidadeNecessaria = questoesPorTema[tema];
        const questoesDisponiveis = questoesPorCategoria[tema] || [];
        
        // Embaralhar questões disponíveis
        const questoesEmbaralhadas = questoesDisponiveis.sort(() => Math.random() - 0.5);
        
        // Selecionar a quantidade necessária
        const selecionadas = questoesEmbaralhadas.slice(0, quantidadeNecessaria);
        questoesSelecionadas = questoesSelecionadas.concat(selecionadas);
    });

    // Embaralhar a ordem final das questões
    return questoesSelecionadas.sort(() => Math.random() - 0.5);
}

// Modificar a função carregarQuestoes para usar a nova distribuição
async function carregarQuestoes() {
    try {
        const response = await fetch('transito.json');
        if (!response.ok) throw new Error('Erro ao carregar questões');
        
        const todasQuestoes = await response.json();
        questoes = selecionarQuestoesProporcionais(todasQuestoes, TOTAL_QUESTOES);
        
        console.log('Distribuição das questões:');
        const distribuicao = questoes.reduce((acc, q) => {
            acc[q.tema] = (acc[q.tema] || 0) + 1;
            return acc;
        }, {});
        console.log(distribuicao);
        
        return true;
    } catch (error) {
        console.error('Erro:', error);
        return false;
    }
}

function exibirQuestao() {
    console.log('Tentando exibir questão:', indiceQuestaoAtual);
    
    // Limpar timer anterior se existir
    if (timerQuestao) {
        clearTimeout(timerQuestao);
    }

    // Verificar se a questão atual é válida
    if (indiceQuestaoAtual >= questoes.length) {
        console.error('Questão atual não encontrada');
        return;
    }

    const questaoAtual = questoes[indiceQuestaoAtual];
    console.log('Questão atual:', questaoAtual);
    
    if (!questaoAtual) {
        console.error('Questão atual não encontrada');
        return;
    }

    const perguntaElement = document.getElementById('pergunta');
    const alternativasContainer = document.getElementById('alternativas');
    const dificuldadeElement = document.querySelector('.dificuldade');

    console.log('Elementos encontrados:', {
        pergunta: perguntaElement,
        alternativas: alternativasContainer,
        dificuldade: dificuldadeElement
    });

    // Limpar seleção anterior
    respostaSelecionada = null;
    const confirmarBtn = document.getElementById('confirmar');
    if (confirmarBtn) {
        confirmarBtn.disabled = true;
    }

    // Exibir pergunta e dificuldade
    if (perguntaElement) {
        perguntaElement.innerHTML = `
            <div style="color: rgba(0, 247, 255, 0.4); font-family: monospace; font-size: 0.7em; margin-bottom: 8px;">
                [${questaoAtual.id}] - ${questaoAtual.tema}
            </div>
            ${questaoAtual.pergunta}
        `;
        console.log('Pergunta definida:', questaoAtual.pergunta);
    }
    
    if (dificuldadeElement) {
        dificuldadeElement.textContent = questaoAtual.dificuldade.toUpperCase();
        dificuldadeElement.className = `dificuldade ${questaoAtual.dificuldade}`;
        console.log('Dificuldade definida:', questaoAtual.dificuldade);
    }

    // Limpar e criar alternativas
    if (alternativasContainer) {
        alternativasContainer.innerHTML = '';
        Object.entries(questaoAtual.alternativas).forEach(([letra, texto]) => {
            const alternativa = document.createElement('div');
            alternativa.className = 'alternativa';
            alternativa.dataset.alternativa = letra;
            alternativa.innerHTML = `
                <span class="letra">${letra.toUpperCase()})</span>
                <span class="texto">${texto}</span>
            `;
            alternativasContainer.appendChild(alternativa);
        });
        console.log('Alternativas criadas');
    }

    // Esconder feedback
    const feedback = document.getElementById('feedback');
    const respostaFeedback = document.getElementById('resposta-feedback');
    if (feedback) feedback.classList.add('escondido');
    if (respostaFeedback) respostaFeedback.classList.add('escondido');

    // Atualizar progresso
    atualizarProgresso();

    // Atualizar exibição do tempo baseado no modo
    const tempoElement = document.getElementById('tempo');
    if (tempoElement) {
        tempoElement.style.display = 'block';
        // Remover classes de alerta anteriores
        tempoElement.classList.remove('alerta');
    }

    // Iniciar timer apenas no modo desafio e apenas para nova questão
    if (modoDesafio) {
        iniciarTimerQuestao();
    }
}

function selecionarAlternativa(alternativa) {
    // Remover seleção anterior
    document.querySelectorAll('.alternativa').forEach(alt => {
        alt.classList.remove('selecionada');
    });

    // Adicionar seleção à alternativa clicada
    alternativa.classList.add('selecionada');
    
    // Habilitar botão de confirmar
    const confirmarBtn = document.getElementById('confirmar');
    if (confirmarBtn) {
        confirmarBtn.disabled = false;
    }

    // Atualizar resposta selecionada
    respostaSelecionada = alternativa.dataset.alternativa;
}

function verificarResposta() {
    if (modoDesafio && timerQuestao) {
        clearTimeout(timerQuestao);
    }

    if (!respostaSelecionada) return;

    const questaoAtual = questoes[indiceQuestaoAtual];
    if (!questaoAtual) {
        console.error('Questão atual não encontrada');
        return;
    }

    const alternativas = document.querySelectorAll('.alternativa');
    const feedback = document.getElementById('feedback');
    const respostaFeedback = document.getElementById('resposta-feedback');
    const explicacao = document.getElementById('explicacao');
    const proximaBtn = document.getElementById('proxima');
    
    const estaCorreta = respostaSelecionada === questaoAtual.resposta_correta;

    // Atualizar estatísticas
    if (estaCorreta) {
        pontuacao++;
    }

    // Salvar resposta do usuário
    let respostas = JSON.parse(sessionStorage.getItem('respostas')) || [];
    respostas.push({
        questao: questaoAtual,
        respostaUsuario: respostaSelecionada,
        correta: estaCorreta
    });
    sessionStorage.setItem('respostas', JSON.stringify(respostas));

    // Mostrar feedback
    feedback.classList.remove('escondido');
    respostaFeedback.classList.remove('escondido');
    
    if (estaCorreta) {
        respostaFeedback.innerHTML = `
            <div class="feedback-icon correto">✓</div>
            <p class="feedback-texto">Resposta correta!</p>
        `;
    } else {
        respostaFeedback.innerHTML = `
            <div class="feedback-icon incorreto">✗</div>
            <p class="feedback-texto">Resposta incorreta</p>
        `;
    }

    explicacao.textContent = questaoAtual.explicacao;

    // Desabilitar interação com alternativas
    alternativas.forEach(alt => {
        alt.classList.add('disabled');
    });

    // Desabilitar botão confirmar e habilitar próxima
    document.getElementById('confirmar').disabled = true;
    if (proximaBtn) proximaBtn.disabled = false;

    // Se não estiver no modo imediato, esconder feedback
    if (!mostrarRespostasImediatas) {
        respostaFeedback.classList.add('escondido');
        explicacao.textContent = '';
    }

    // Salvar questão e resposta
    let questoesRespondidas = JSON.parse(sessionStorage.getItem('questoesRespondidas')) || [];
    let respostasUsuario = JSON.parse(sessionStorage.getItem('respostasUsuario')) || [];
    
    questoesRespondidas.push(questoes[indiceQuestaoAtual]);
    respostasUsuario.push(respostaSelecionada);
    
    sessionStorage.setItem('questoesRespondidas', JSON.stringify(questoesRespondidas));
    sessionStorage.setItem('respostasUsuario', JSON.stringify(respostasUsuario));
}

function proximaQuestao() {
    if (modoDesafio && timerQuestao) {
        clearTimeout(timerQuestao);
    }

    if (respostaSelecionada === null) {
        alert('Por favor, selecione uma resposta antes de continuar.');
        return;
    }

    indiceQuestaoAtual++;
    if (indiceQuestaoAtual >= TOTAL_QUESTOES) {
        finalizarQuiz();
        return;
    }

    // Limpar seleção e feedback
    respostaSelecionada = null;
    const alternativas = document.querySelectorAll('.alternativa');
    alternativas.forEach(alt => alt.classList.remove('selecionada', 'disabled'));
    
    const feedback = document.getElementById('feedback');
    const respostaFeedback = document.getElementById('resposta-feedback');
    if (feedback) feedback.classList.add('escondido');
    if (respostaFeedback) respostaFeedback.classList.add('escondido');

    // Habilitar botão confirmar
    const confirmarBtn = document.getElementById('confirmar');
    if (confirmarBtn) confirmarBtn.disabled = true;

    // Carregar próxima questão
    exibirQuestao();

    // Rolar suavemente para o topo do quiz
    const quizCard = document.getElementById('quiz');
    const header = document.querySelector('.site-header');
    if (quizCard && header) {
        // Calcular a posição considerando a altura do header
        const headerHeight = header.offsetHeight;
        const offset = headerHeight + 10; // 10px de margem adicional
        
        window.scrollTo({
            top: quizCard.offsetTop - offset,
            behavior: 'smooth'
        });
    }
}

function atualizarProgresso() {
    const progressoElement = document.getElementById('progresso');
    if (progressoElement) {
        progressoElement.textContent = `Questão ${indiceQuestaoAtual + 1} de ${TOTAL_QUESTOES}`;
    }
}

function iniciarTempo() {
    // Limpar timer anterior se existir
    if (timerIntervalo) {
        clearInterval(timerIntervalo);
    }
    
    let tempoRestante = TEMPO_LIMITE;
    const tempoElement = document.getElementById('tempo');

    function atualizarTempo() {
        const minutos = Math.floor(tempoRestante / 60);
        const segundos = tempoRestante % 60;
        if (tempoElement) {
            tempoElement.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }

        if (tempoRestante === 0) {
            clearInterval(timerIntervalo);
            finalizarQuiz();
        } else {
            tempoRestante--;
        }
    }

    timerIntervalo = setInterval(atualizarTempo, 1000);
    atualizarTempo();
}

function finalizarQuiz() {
    // Limpar todos os timers
    if (timerQuestao) {
        clearTimeout(timerQuestao);
    }
    if (timerIntervalo) {
        clearInterval(timerIntervalo);
    }

    // Parar música no modo desafio
    if (modoDesafio) {
        const suspenseMusic = document.getElementById('suspenseMusic');
        if (suspenseMusic) {
            suspenseMusic.pause();
            suspenseMusic.currentTime = 0;
        }
    }

    const porcentagem = (pontuacao / TOTAL_QUESTOES) * 100;
    
    // Salvar todas as questões
    sessionStorage.setItem('todasQuestoes', JSON.stringify(questoes));
    
    // Salvar resultado no ranking antes de redirecionar
    salvarResultado(porcentagem);
    
    // Redirecionar para a página de resultados
    window.location.href = `resultado.html?pontuacao=${pontuacao}&total=${TOTAL_QUESTOES}&porcentagem=${porcentagem}`;
}

function verificarFimDoQuiz() {
    if (indiceQuestaoAtual >= TOTAL_QUESTOES) {
        finalizarQuiz();
        return true;
    }
    return false;
}

function salvarResultado(porcentagem) {
    try {
        // Obter usuário atual
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            console.log('Usuário não está logado');
            return;
        }

        // Obter resultados existentes
        let results = JSON.parse(localStorage.getItem('quizResults')) || [];
        
        // Criar novo resultado
        const novoResultado = {
            userId: currentUser.id,
            userName: currentUser.name,
            score: Math.round(porcentagem), // Arredondar para evitar decimais
            date: new Date().toISOString(),
            questoes: TOTAL_QUESTOES,
            acertos: pontuacao,
            modo: modoDesafio ? 'Desafio' : 'Padrão'
        };

        // Adicionar novo resultado
        results.push(novoResultado);
        
        // Ordenar resultados por pontuação (do maior para o menor)
        results.sort((a, b) => b.score - a.score);
        
        // Manter apenas os top 100 resultados
        if (results.length > 100) {
            results = results.slice(0, 100);
        }
        
        // Salvar no localStorage
        localStorage.setItem('quizResults', JSON.stringify(results));
        console.log('Resultado salvo com sucesso:', novoResultado);
    } catch (error) {
        console.error('Erro ao salvar resultado:', error);
    }
}

function initializeCarousel() {
    let slideIndex = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    function showSlides(n) {
        slideIndex = n;
        if (slideIndex >= slides.length) slideIndex = 0;
        if (slideIndex < 0) slideIndex = slides.length - 1;

        slides.forEach(slide => slide.style.display = 'none');
        dots.forEach(dot => dot.classList.remove('active'));

        slides[slideIndex].style.display = 'block';
        dots[slideIndex].classList.add('active');
    }

    // Navegação do carrossel
    document.querySelector('.prev')?.addEventListener('click', () => showSlides(slideIndex - 1));
    document.querySelector('.next')?.addEventListener('click', () => showSlides(slideIndex + 1));
    
    // Dots do carrossel
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlides(index));
    });

    // Auto-play do carrossel
    setInterval(() => showSlides(slideIndex + 1), 5000);

    // Mostrar primeiro slide
    showSlides(0);
}

function verificarImagens() {
    const imagens = document.querySelectorAll('img');
    imagens.forEach(img => {
        const testImage = new Image();
        testImage.src = img.src;
        testImage.onerror = () => {
            console.error(`Erro ao carregar imagem: ${img.src}`);
            console.error(`Caminho absoluto: ${new URL(img.src, window.location.href)}`);
        };
        testImage.onload = () => {
            console.log(`Imagem carregada com sucesso: ${img.src}`);
        };
    });
}

document.addEventListener('DOMContentLoaded', verificarImagens);

function iniciarTimerQuestao() {
    // Limpar timer anterior se existir
    if (timerQuestao) {
        clearTimeout(timerQuestao);
    }
    
    let tempoRestante = TEMPO_POR_QUESTAO;
    const tempoElement = document.getElementById('tempo');
    
    function atualizarTimer() {
        if (tempoElement) {
            tempoElement.textContent = `${tempoRestante}s`;
            
            // Adicionar classe de alerta quando o tempo estiver acabando
            if (tempoRestante <= 5) {
                tempoElement.classList.add('alerta');
            }
        }
        
        if (tempoRestante <= 0) {
            clearTimeout(timerQuestao);
            registrarRespostaTimeOut();
        } else {
            tempoRestante--;
            timerQuestao = setTimeout(atualizarTimer, 1000);
        }
    }

    // Remover classe de alerta ao iniciar novo timer
    if (tempoElement) {
        tempoElement.classList.remove('alerta');
    }

    atualizarTimer();
}

function registrarRespostaTimeOut() {
    // Registrar como resposta errada
    const questaoAtual = questoes[indiceQuestaoAtual];
    
    // Salvar resposta do usuário como timeout
    let respostas = JSON.parse(sessionStorage.getItem('respostas')) || [];
    respostas.push({
        questao: questaoAtual,
        respostaUsuario: 'timeout',
        correta: false
    });
    sessionStorage.setItem('respostas', JSON.stringify(respostas));

    // Passar para próxima questão
    indiceQuestaoAtual++;
    if (indiceQuestaoAtual >= TOTAL_QUESTOES) {
        finalizarQuiz();
    } else {
        exibirQuestao();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Botão do Quiz/Simulado
    document.querySelector('.btn-quiz-start').addEventListener('click', function() {
        window.location.href = 'quiz.html';
    });

    // Botão de Placas
    const btnPlacas = document.querySelector('.card:nth-child(2) .btn-estudar');
    btnPlacas.addEventListener('click', function() {
        window.location.href = 'placas.html';
    });

    // Botão de Flashcards
    const btnFlashcards = document.querySelector('.card:nth-child(3) .btn-estudar');
    btnFlashcards.addEventListener('click', function() {
        window.location.href = 'flashcards.html';
    });
});
  