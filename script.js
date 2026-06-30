const API_BASE = window.location.origin;
const DEBUG_REGISTER_STORE = true;
const OFFLINE_FALLBACK = true;
const USER_STATE_PREFIX = "cybershieldState:";

const appState = {
    currentUser: null,
    currentPassword: null,
    completion: 70,
    gamification: {
        xp: 0,
        level: 1,
        streak: 0,
        lastLogin: null,
        lastRewardClaim: null,
        achievements: {
            firstLesson: false,
            streak: false,
            quizMaster: false,
            certificate: false,
        },
        rewardAmount: 50,
    },
    quiz: {
        level: null,
        questions: [],
        answers: {},
        currentIndex: 0,
        startedAt: null,
        remainingSeconds: 600,
        timerId: null,
        savedKey: null,
        sessionId: null,
    },
    training: {
        completedLevels: {
            Beginner: false,
            Intermediate: false,
            Advanced: false,
        },
    },
};

const elements = {
    sections: {
        home: document.getElementById("homePage"),
        register: document.getElementById("registerPage"),
        login: document.getElementById("loginPage"),
        dashboard: document.getElementById("dashboardPage"),
        training: document.getElementById("trainingPage"),
        trainingComplete: document.getElementById("trainingCompletePage"),
        quiz: document.getElementById("quizPage"),
        quizSessionPage: document.getElementById("quizSessionPage"),
        quizReviewPage: document.getElementById("quizReviewPage"),
        result: document.getElementById("resultPage"),
        progress: document.getElementById("progressPage"),
        certificate: document.getElementById("certificatePage"),
        admin: document.getElementById("adminPage"),
    },
    nav: {
        home: document.getElementById("homeNavBtn"),
        login: document.getElementById("loginNavBtn"),
        register: document.getElementById("registerNavBtn"),
        logout: document.getElementById("logoutBtn"),
    },
    heroActions: {
        login: document.getElementById("ctaLoginBtn"),
        register: document.getElementById("ctaRegisterBtn"),
    },
    forms: {
        register: document.getElementById("registerForm"),
        login: document.getElementById("loginForm"),
    },
    status: {
        register: document.getElementById("registerStatus"),
        login: document.getElementById("loginStatus"),
        quiz: document.getElementById("quizStatus"),
    },
    quiz: {
        beginner: document.getElementById("quizLevelBeginner"),
        intermediate: document.getElementById("quizLevelIntermediate"),
        advanced: document.getElementById("quizLevelAdvanced"),
        levelStatus: document.getElementById("quizLevelStatus"),
        sessionBack: document.getElementById("quizSessionBackBtn"),
        timer: document.getElementById("quizTimer"),
        counter: document.getElementById("quizCounter"),
        progressFill: document.getElementById("quizProgressFill"),
        imageWrapper: document.getElementById("quizQuestionImageWrapper"),
        image: document.getElementById("quizQuestionImage"),
        text: document.getElementById("quizQuestionText"),
        optionsContainer: document.getElementById("quizOptionsContainer"),
        prevBtn: document.getElementById("quizPrevBtn"),
        nextBtn: document.getElementById("quizNextBtn"),
        reviewBtn: document.getElementById("quizReviewBtn"),
        submitBtn: document.getElementById("quizSubmitBtn"),
        saveStatus: document.getElementById("quizSaveStatus"),
        reviewBackBtn: document.getElementById("quizReviewBackBtn"),
        reviewList: document.getElementById("quizReviewList"),
        editBtn: document.getElementById("quizEditBtn"),
        confirmSubmitBtn: document.getElementById("quizConfirmSubmitBtn"),
        resultScore: document.getElementById("resultScore"),
        resultPercentage: document.getElementById("resultPercentage"),
        resultCorrect: document.getElementById("resultCorrect"),
        resultWrong: document.getElementById("resultWrong"),
        resultTime: document.getElementById("resultTime"),
        resultStatus: document.getElementById("resultStatus"),
        resultBadge: document.getElementById("resultBadge"),
        resultUnlock: document.getElementById("resultUnlock"),
        resultDetails: document.getElementById("resultDetails"),
        retakeBtn: document.getElementById("quizRetakeBtn"),
        continueBtn: document.getElementById("quizContinueBtn"),
    },
    actions: {
        trainingCard: document.getElementById("trainingCard"),
        quizCard: document.getElementById("quizCard"),
        progressCard: document.getElementById("progressCard"),
        certificateCard: document.getElementById("certificateCard"),
        trainingBack: document.getElementById("trainingBackBtn"),
        quizBack: document.getElementById("quizBackBtn"),
        resultBack: document.getElementById("resultBackBtn"),
        progressBack: document.getElementById("progressBackBtn"),
        certificateBack: document.getElementById("certificateBackBtn"),
        adminCard: document.getElementById("adminCard"),
        adminBack: document.getElementById("adminBackBtn"),
        trainingCompleteContinue: document.getElementById("trainingCompleteContinueBtn"),
        trainingCompleteDashboard: document.getElementById("trainingCompleteDashboardBtn"),
        acceptCookies: document.getElementById("acceptCookies"),
        declineCookies: document.getElementById("declineCookies"),
    },
    admin: {
        loadUsers: document.getElementById("adminLoadUsers"),
        loadLessons: document.getElementById("adminLoadLessons"),
        loadVideos: document.getElementById("adminLoadVideos"),
        loadQuizzes: document.getElementById("adminLoadQuizzes"),
        loadCertificates: document.getElementById("adminLoadCertificates"),
        loadAnalytics: document.getElementById("adminLoadAnalytics"),
        exportUsers: document.getElementById("adminExportUsers"),
        loadNotifications: document.getElementById("adminLoadNotifications"),
        refreshLeaderboard: document.getElementById("adminRefreshLeaderboard"),
        userTable: document.getElementById("adminUserTable"),
        analyticsSummary: document.getElementById("adminAnalyticsSummary"),
        lessonForm: document.getElementById("adminLessonForm"),
        videoForm: document.getElementById("adminVideoForm"),
        quizForm: document.getElementById("adminQuizForm"),
        certificateForm: document.getElementById("adminCertificateForm"),
        notificationForm: document.getElementById("adminNotificationForm"),
        statusMessage: document.getElementById("adminStatusMessage"),
    },
    content: {
        welcomeText: document.getElementById("welcomeText"),
        dashboardSubtitle: document.getElementById("dashboardSubtitle"),
        completionValue: document.getElementById("completionValue"),
        progressFill: document.getElementById("progressFill"),
        progressText: document.getElementById("progressText"),
        certificateName: document.getElementById("certificateName"),
        resultSummary: document.getElementById("resultSummary"),
        xpValue: document.getElementById("xpValue"),
        userLevel: document.getElementById("userLevel"),
        streakValue: document.getElementById("streakValue"),
        dailyRewardValue: document.getElementById("dailyRewardValue"),
        achievementFirstLesson: document.getElementById("achievementFirstLesson"),
        achievementStreak: document.getElementById("achievementStreak"),
        achievementQuizMaster: document.getElementById("achievementQuizMaster"),
        achievementCertificate: document.getElementById("achievementCertificate"),
    },
    cookieBanner: document.getElementById("cookieBanner"),
    offlineBanner: document.getElementById("offlineBanner"),
    cookieConsent: document.getElementById("cookieConsent"),
    cookieAnalytics: document.getElementById("cookieAnalytics"),
    cookiePersonalization: document.getElementById("cookiePersonalization"),
    cookieAccept: document.getElementById("cookieAccept"),
    cookieReject: document.getElementById("cookieReject"),
    cookieCustomize: document.getElementById("cookieCustomize"),
    rememberMe: document.getElementById("rememberMe"),
};

function init() {
    elements.nav.home.addEventListener("click", () => navigateTo("home"));
    elements.nav.login.addEventListener("click", () => navigateTo("login"));
    elements.nav.register.addEventListener("click", () => navigateTo("register"));
    elements.nav.logout.addEventListener("click", handleLogout);

    elements.heroActions.login.addEventListener("click", () => navigateTo("login"));
    elements.heroActions.register.addEventListener("click", () => navigateTo("register"));

    elements.forms.register.addEventListener("submit", handleRegisterSubmit);
    elements.forms.login.addEventListener("submit", handleLoginSubmit);

    elements.actions.trainingCard.addEventListener("click", () => navigateTo("training"));
    elements.actions.quizCard.addEventListener("click", openQuizLevelSelection);
    elements.actions.progressCard.addEventListener("click", () => navigateTo("progress"));
    elements.actions.certificateCard.addEventListener("click", () => navigateTo("certificate"));
    elements.actions.adminCard.addEventListener("click", () => navigateTo("admin"));

    elements.admin.loadUsers.addEventListener("click", adminLoadUsers);
    elements.admin.loadLessons.addEventListener("click", adminLoadLessons);
    elements.admin.loadVideos.addEventListener("click", adminLoadVideos);
    elements.admin.loadQuizzes.addEventListener("click", adminLoadQuizzes);
    elements.admin.loadCertificates.addEventListener("click", adminLoadCertificates);
    elements.admin.loadAnalytics.addEventListener("click", adminLoadAnalytics);
    elements.admin.exportUsers.addEventListener("click", adminExportUsers);
    elements.admin.loadNotifications.addEventListener("click", adminLoadNotifications);
    elements.admin.refreshLeaderboard.addEventListener("click", adminRefreshLeaderboard);
    elements.admin.lessonForm.addEventListener("submit", handleAdminLessonSubmit);
    elements.admin.videoForm.addEventListener("submit", handleAdminVideoSubmit);
    elements.admin.quizForm.addEventListener("submit", handleAdminQuizSubmit);
    elements.admin.certificateForm.addEventListener("submit", handleAdminCertificateSubmit);
    elements.admin.notificationForm.addEventListener("submit", handleAdminNotificationSubmit);

    elements.actions.trainingBack.addEventListener("click", () => navigateTo("dashboard"));
    elements.actions.quizBack.addEventListener("click", () => navigateTo("dashboard"));
    elements.actions.resultBack.addEventListener("click", () => navigateTo("dashboard"));
    elements.actions.progressBack.addEventListener("click", () => navigateTo("dashboard"));
    elements.actions.certificateBack.addEventListener("click", () => navigateTo("dashboard"));
    elements.actions.adminBack.addEventListener("click", () => navigateTo("dashboard"));
    elements.actions.trainingCompleteContinue.addEventListener("click", startQuizFromCompletedTraining);
    elements.actions.trainingCompleteDashboard.addEventListener("click", () => navigateTo("dashboard"));

    elements.quiz.beginner.addEventListener("click", () => selectQuizLevel("Beginner"));
    elements.quiz.intermediate.addEventListener("click", () => selectQuizLevel("Intermediate"));
    elements.quiz.advanced.addEventListener("click", () => selectQuizLevel("Advanced"));
    elements.quiz.sessionBack.addEventListener("click", () => navigateTo("quiz"));
    elements.quiz.prevBtn.addEventListener("click", handleQuizPrevious);
    elements.quiz.nextBtn.addEventListener("click", handleQuizNext);
    elements.quiz.reviewBtn.addEventListener("click", openQuizReview);
    elements.quiz.submitBtn.addEventListener("click", submitQuiz);
    elements.quiz.reviewBackBtn.addEventListener("click", () => navigateTo("quizSessionPage"));
    elements.quiz.editBtn.addEventListener("click", () => navigateTo("quizSessionPage"));
    elements.quiz.confirmSubmitBtn.addEventListener("click", submitQuiz);
    elements.quiz.resultBackBtn.addEventListener("click", () => navigateTo("dashboard"));
    elements.quiz.retakeBtn.addEventListener("click", retakeQuiz);
    elements.quiz.continueBtn.addEventListener("click", continueToNextLevel);

    elements.actions.acceptCookies.addEventListener("click", acceptCookiePreferences);
    elements.actions.declineCookies.addEventListener("click", rejectCookiePreferences);
    elements.cookieAccept.addEventListener("click", acceptCookiePreferences);
    elements.cookieReject.addEventListener("click", rejectCookiePreferences);
    elements.cookieCustomize.addEventListener("click", showCookieModal);
    elements.content.claimRewardBtn.addEventListener("click", claimDailyReward);
    elements.actions.adminCard.addEventListener("click", () => navigateTo("admin"));

    document.querySelectorAll(".password-toggle").forEach((button) => {
        button.addEventListener("click", handlePasswordToggle);
    });
    document.getElementById("regPassword").addEventListener("input", updatePasswordStrength);

    document.querySelectorAll(".trainingCompleteBtn").forEach((button) => {
        button.addEventListener("click", () => {
            const level = button.dataset.level;
            markTrainingComplete(level);
        });
    });

    renderProgress();
    navigateTo("home");
    loadCookiePreferences();
    loadRememberedEmail();
}

function loadUserState(email) {
    const raw = localStorage.getItem(`${USER_STATE_PREFIX}${email}`);
    if (!raw) {
        return { ...appState.gamification };
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error("Failed to parse user state", error);
        return { ...appState.gamification };
    }
}

function saveUserState(email, state) {
    localStorage.setItem(`${USER_STATE_PREFIX}${email}`, JSON.stringify(state));
}

function loadUserQuizState(email) {
    const raw = localStorage.getItem(`cybershieldQuizState:${email}`);
    if (!raw) {
        return {
            quizPass: { Beginner: false, Intermediate: false, Advanced: false },
            trainingCompletedLevels: { Beginner: false, Intermediate: false, Advanced: false },
        };
    }
    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error("Failed to parse quiz state", error);
        return {
            quizPass: { Beginner: false, Intermediate: false, Advanced: false },
            trainingCompletedLevels: { Beginner: false, Intermediate: false, Advanced: false },
        };
    }
}

function saveUserQuizState(email, state) {
    localStorage.setItem(`cybershieldQuizState:${email}`, JSON.stringify(state));
}

function shuffleArray(array) {
    const cloned = [...array];
    for (let i = cloned.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned;
}

function updateQuizLevelCards() {
    const { quizPass } = appState.quizState || { quizPass: { Beginner: false, Intermediate: false, Advanced: false } };
    const beginnerUnlocked = true;
    const intermediateUnlocked = quizPass.Beginner;
    const advancedUnlocked = quizPass.Intermediate;

    elements.quiz.beginner.classList.toggle("level-locked", !beginnerUnlocked);
    elements.quiz.beginner.classList.toggle("level-unlocked", beginnerUnlocked);
    elements.quiz.beginner.querySelector(".quiz-level-status").textContent = beginnerUnlocked ? "Unlocked" : "Locked";

    elements.quiz.intermediate.classList.toggle("level-locked", !intermediateUnlocked);
    elements.quiz.intermediate.classList.toggle("level-unlocked", intermediateUnlocked);
    elements.quiz.intermediate.querySelector(".quiz-level-status").textContent = intermediateUnlocked ? "Unlocked" : "Locked";

    elements.quiz.advanced.classList.toggle("level-locked", !advancedUnlocked);
    elements.quiz.advanced.classList.toggle("level-unlocked", advancedUnlocked);
    elements.quiz.advanced.querySelector(".quiz-level-status").textContent = advancedUnlocked ? "Unlocked" : "Locked";
}

function openQuizLevelSelection() {
    if (!appState.currentUser) {
        return showMessage(elements.status.quiz, "Please log in to access the quiz.", "error");
    }
    updateQuizLevelCards();
    elements.status.quiz.textContent = "";
    navigateTo("quiz");
}

function selectQuizLevel(level) {
    const { quizPass } = appState.quizState || { quizPass: { Beginner: false, Intermediate: false, Advanced: false } };
    if (level === "Intermediate" && !quizPass.Beginner) {
        return showMessage(elements.status.quiz, "Complete the previous level with at least 70% to unlock this level.", "error");
    }
    if (level === "Advanced" && !quizPass.Intermediate) {
        return showMessage(elements.status.quiz, "Complete the previous level with at least 70% to unlock this level.", "error");
    }
    startQuizSession(level);
}

function startQuizFromCompletedTraining() {
    openQuizLevelSelection();
}

function markTrainingComplete(level) {
    if (!appState.currentUser) {
        return showMessage(elements.status.quiz, "Please log in to mark training complete.", "error");
    }
    appState.quizState.trainingCompletedLevels[level] = true;
    saveUserQuizState(appState.currentUser.email, appState.quizState);
    document.getElementById(`trainingStatus${level}`).textContent = "Completed";
    navigateTo("trainingComplete");
}

function startQuizSession(level) {
    appState.quiz.level = level;
    appState.quiz.answers = {};
    appState.quiz.currentIndex = 0;
    appState.quiz.remainingSeconds = 600;
    appState.quiz.startedAt = Date.now();
    appState.quiz.sessionId = `${appState.currentUser.email}:${level}`;
    loadQuizSession(level);
}

function loadQuizSession(level) {
    const sessionKey = `cybershieldQuizSession:${appState.currentUser.email}:${level}`;
    const raw = localStorage.getItem(sessionKey);
    if (raw) {
        try {
            const saved = JSON.parse(raw);
            if (saved.level === level && saved.questions?.length) {
                appState.quiz.questions = saved.questions;
                appState.quiz.answers = saved.answers || {};
                appState.quiz.currentIndex = saved.currentIndex || 0;
                appState.quiz.remainingSeconds = saved.remainingSeconds || 600;
                appState.quiz.startedAt = saved.startedAt || Date.now();
                startQuizTimer();
                renderQuizQuestion();
                navigateTo("quizSessionPage");
                return;
            }
        } catch (error) {
            console.error("Failed to load saved quiz session", error);
        }
    }
    fetchQuizQuestions(level);
}

async function fetchQuizQuestions(level) {
    try {
        const response = await fetch(`${API_BASE}/quiz/questions?level=${encodeURIComponent(level)}&count=10`);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Unable to load quiz questions.");
        }
        const data = await response.json();
        if (!data.questions || !data.questions.length) {
            throw new Error("No quiz questions available for this level.");
        }
        appState.quiz.questions = data.questions.map((question) => {
            const rawOptions = Array.isArray(question.options) ? question.options : [];
            const options = shuffleArray(rawOptions).map((optionText) => ({
                text: optionText,
                value: optionText,
            }));
            return {
                id: question.id,
                lesson_id: question.lesson_id,
                question: question.question,
                options,
                answer: question.answer,
                difficulty: question.difficulty,
                question_type: question.question_type,
                image_url: question.image_url,
                explanation: question.explanation,
                cybersecurity_tip: question.cybersecurity_tip,
                related_training: question.related_training,
            };
        });
        appState.quiz.questions = shuffleArray(appState.quiz.questions);
        appState.quiz.answers = {};
        appState.quiz.currentIndex = 0;
        appState.quiz.remainingSeconds = 600;
        appState.quiz.startedAt = Date.now();
        startQuizTimer();
        saveQuizProgress();
        renderQuizQuestion();
        navigateTo("quizSessionPage");
    } catch (error) {
        showMessage(elements.status.quiz, error.message, "error");
    }
}

function startQuizTimer() {
    if (appState.quiz.timerId) {
        clearInterval(appState.quiz.timerId);
    }
    updateQuizTimerDisplay();
    appState.quiz.timerId = setInterval(() => {
        appState.quiz.remainingSeconds -= 1;
        if (appState.quiz.remainingSeconds <= 0) {
            clearInterval(appState.quiz.timerId);
            appState.quiz.remainingSeconds = 0;
            updateQuizTimerDisplay();
            submitQuiz(true);
            return;
        }
        updateQuizTimerDisplay();
        saveQuizProgress();
    }, 1000);
}

function updateQuizTimerDisplay() {
    const minutes = String(Math.floor(appState.quiz.remainingSeconds / 60)).padStart(2, "0");
    const seconds = String(appState.quiz.remainingSeconds % 60).padStart(2, "0");
    elements.quiz.timer.textContent = `${minutes}:${seconds}`;
}

function saveQuizProgress() {
    if (!appState.currentUser || !appState.quiz.level) return;
    const sessionKey = `cybershieldQuizSession:${appState.currentUser.email}:${appState.quiz.level}`;
    const sessionData = {
        level: appState.quiz.level,
        questions: appState.quiz.questions,
        answers: appState.quiz.answers,
        currentIndex: appState.quiz.currentIndex,
        remainingSeconds: appState.quiz.remainingSeconds,
        startedAt: appState.quiz.startedAt,
        savedAt: Date.now(),
    };
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    elements.quiz.saveStatus.textContent = "Quiz progress saved automatically.";
}

function renderQuizQuestion() {
    const question = appState.quiz.questions[appState.quiz.currentIndex];
    if (!question) return;
    const selectedValue = appState.quiz.answers[question.id] || "";
    elements.quiz.counter.textContent = `${appState.quiz.currentIndex + 1} / ${appState.quiz.questions.length}`;
    elements.quiz.progressFill.style.width = `${((appState.quiz.currentIndex + 1) / appState.quiz.questions.length) * 100}%`;
    elements.quiz.text.textContent = question.question;
    if (question.image_url) {
        elements.quiz.image.src = question.image_url;
        elements.quiz.imageWrapper.classList.remove("hidden");
    } else {
        elements.quiz.imageWrapper.classList.add("hidden");
    }
    renderQuizOptions(question, selectedValue);
    elements.quiz.prevBtn.disabled = appState.quiz.currentIndex === 0;
    elements.quiz.nextBtn.disabled = appState.quiz.currentIndex === appState.quiz.questions.length - 1;
    elements.quiz.saveStatus.textContent = "";
}

function renderQuizOptions(question, selectedValue) {
    elements.quiz.optionsContainer.innerHTML = "";
    question.options.forEach((option, index) => {
        const label = document.createElement("label");
        label.className = "option";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "quizOption";
        input.value = option.value;
        input.checked = option.value === selectedValue;
        input.addEventListener("change", () => handleAnswerSelection(question.id, option.value));
        label.appendChild(input);
        label.appendChild(document.createTextNode(option.text));
        elements.quiz.optionsContainer.appendChild(label);
    });
}

function handleAnswerSelection(questionId, value) {
    appState.quiz.answers[questionId] = value;
    saveQuizProgress();
}

function handleQuizPrevious() {
    if (appState.quiz.currentIndex > 0) {
        appState.quiz.currentIndex -= 1;
        renderQuizQuestion();
        saveQuizProgress();
    }
}

function handleQuizNext() {
    if (appState.quiz.currentIndex < appState.quiz.questions.length - 1) {
        appState.quiz.currentIndex += 1;
        renderQuizQuestion();
        saveQuizProgress();
    }
}

function openQuizReview() {
    buildReviewList();
    navigateTo("quizReviewPage");
}

function buildReviewList() {
    elements.quiz.reviewList.innerHTML = "";
    appState.quiz.questions.forEach((question, index) => {
        const card = document.createElement("div");
        card.className = "review-item";
        const selected = appState.quiz.answers[question.id] || "Not answered";
        card.innerHTML = `
            <h4>Question ${index + 1}</h4>
            <p>${question.question}</p>
            <p><strong>Your answer:</strong> ${selected}</p>
        `;
        elements.quiz.reviewList.appendChild(card);
    });
}

function submitQuiz(isAuto = false) {
    if (!appState.quiz.questions.length) {
        return showMessage(elements.status.quiz, "No quiz is currently loaded.", "error");
    }
    if (!isAuto && !Object.keys(appState.quiz.answers).length) {
        return showMessage(elements.status.quiz, "Please answer at least one question before submitting.", "error");
    }
    if (appState.quiz.timerId) {
        clearInterval(appState.quiz.timerId);
        appState.quiz.timerId = null;
    }
    const results = computeQuizResults();
    renderResultPage(results);
    saveQuizProgress();
    navigateTo("result");
}

function computeQuizResults() {
    const { questions, answers, startedAt } = appState.quiz;
    const total = questions.length;
    let correctCount = 0;
    const details = questions.map((question) => {
        const selected = answers[question.id] || "Not answered";
        const isCorrect = String(selected).trim().toLowerCase() === String(question.answer).trim().toLowerCase();
        if (isCorrect) correctCount += 1;
        return {
            question: question.question,
            selected,
            correct: question.answer,
            explanation: question.explanation || "Review the training resources for more detail.",
            cybersecurity_tip: question.cybersecurity_tip || "Stay vigilant when reviewing suspicious communications.",
            related_training: question.related_training || "Refer back to the training library for this topic.",
            isCorrect,
        };
    });
    const score = correctCount;
    const percentage = total ? Math.round((correctCount / total) * 100) : 0;
    const pass = percentage >= 70;
    const durationSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    const minutes = String(Math.floor(durationSeconds / 60)).padStart(2, "0");
    const seconds = String(durationSeconds % 60).padStart(2, "0");
    return { total, score, percentage, pass, details, timeTaken: `${minutes}:${seconds}` };
}

function renderResultPage(results) {
    elements.quiz.resultScore.textContent = `${results.score} / ${results.total}`;
    elements.quiz.resultPercentage.textContent = `${results.percentage}%`;
    elements.quiz.resultCorrect.textContent = `${results.score}`;
    elements.quiz.resultWrong.textContent = `${results.total - results.score}`;
    elements.quiz.resultTime.textContent = results.timeTaken;
    elements.quiz.resultStatus.textContent = results.pass ? "Pass" : "Fail";
    elements.quiz.resultBadge.textContent = results.pass ? "Badge earned: CyberShield Achiever" : "Badge earned: Keep learning";

    const nextLevel = appState.quiz.level === "Beginner" ? "Intermediate" : appState.quiz.level === "Intermediate" ? "Advanced" : null;
    if (results.pass) {
        if (nextLevel) {
            appState.quizState.quizPass[appState.quiz.level] = true;
            appState.quizState.quizPass[nextLevel] = true;
            saveUserQuizState(appState.currentUser.email, appState.quizState);
            elements.quiz.resultUnlock.textContent = `Next level unlocked: ${nextLevel}`;
            elements.quiz.continueBtn.classList.remove("hidden");
            elements.quiz.retakeBtn.classList.add("hidden");
        } else {
            appState.quizState.quizPass[appState.quiz.level] = true;
            saveUserQuizState(appState.currentUser.email, appState.quizState);
            elements.quiz.resultUnlock.textContent = "All levels completed. Great job!";
            elements.quiz.continueBtn.classList.add("hidden");
            elements.quiz.retakeBtn.classList.add("hidden");
        }
    } else {
        elements.quiz.resultUnlock.textContent = "Complete 70% to unlock the next level.";
        elements.quiz.continueBtn.classList.add("hidden");
        elements.quiz.retakeBtn.classList.remove("hidden");
    }

    updateQuizLevelCards();
    elements.quiz.resultDetails.innerHTML = "";
    results.details.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "review-item";
        card.innerHTML = `
            <h4>Question ${index + 1}</h4>
            <p>${item.question}</p>
            <p><strong>Your answer:</strong> ${item.selected}</p>
            <p><strong>Correct answer:</strong> ${item.correct}</p>
            <p><strong>Explanation:</strong> ${item.explanation}</p>
            <p><strong>Cybersecurity tip:</strong> ${item.cybersecurity_tip}</p>
            <p><strong>Related training:</strong> ${item.related_training}</p>
        `;
        card.style.marginBottom = "16px";
        elements.quiz.resultDetails.appendChild(card);
    });
}

function continueToNextLevel() {
    const nextLevel = appState.quiz.level === "Beginner" ? "Intermediate" : appState.quiz.level === "Intermediate" ? "Advanced" : null;
    if (!nextLevel) return;
    selectQuizLevel(nextLevel);
}


function startQuizTimer() {
    if (appState.quiz.timerId) {
        clearInterval(appState.quiz.timerId);
    }
    updateQuizTimerDisplay();
    appState.quiz.timerId = setInterval(() => {
        appState.quiz.remainingSeconds -= 1;
        if (appState.quiz.remainingSeconds <= 0) {
            clearInterval(appState.quiz.timerId);
            appState.quiz.timerId = null;
            appState.quiz.remainingSeconds = 0;
            updateQuizTimerDisplay();
            submitQuiz(true);
            return;
        }
        updateQuizTimerDisplay();
        saveQuizProgress();
    }, 1000);
}

function updateQuizTimerDisplay() {
    const minutes = String(Math.floor(appState.quiz.remainingSeconds / 60)).padStart(2, "0");
    const seconds = String(appState.quiz.remainingSeconds % 60).padStart(2, "0");
    elements.quiz.timer.textContent = `${minutes}:${seconds}`;
}

function saveQuizProgress() {
    if (!appState.currentUser || !appState.quiz.level) return;
    const sessionKey = `cybershieldQuizSession:${appState.currentUser.email}:${appState.quiz.level}`;
    const sessionData = {
        level: appState.quiz.level,
        questions: appState.quiz.questions,
        answers: appState.quiz.answers,
        currentIndex: appState.quiz.currentIndex,
        remainingSeconds: appState.quiz.remainingSeconds,
        startedAt: appState.quiz.startedAt,
        savedAt: Date.now(),
    };
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    if (elements.quiz.saveStatus) {
        elements.quiz.saveStatus.textContent = "Quiz progress saved automatically.";
    }
}

function renderQuizQuestion() {
    const question = appState.quiz.questions[appState.quiz.currentIndex];
    if (!question) return;
    const selectedValue = appState.quiz.answers[question.id] || "";
    elements.quiz.counter.textContent = `${appState.quiz.currentIndex + 1} / ${appState.quiz.questions.length}`;
    elements.quiz.progressFill.style.width = `${((appState.quiz.currentIndex + 1) / appState.quiz.questions.length) * 100}%`;
    elements.quiz.text.textContent = question.question;
    if (question.image_url) {
        elements.quiz.image.src = question.image_url;
        elements.quiz.imageWrapper.classList.remove("hidden");
    } else {
        elements.quiz.imageWrapper.classList.add("hidden");
    }
    renderQuizOptions(question, selectedValue);
    elements.quiz.prevBtn.disabled = appState.quiz.currentIndex === 0;
    elements.quiz.nextBtn.disabled = appState.quiz.currentIndex === appState.quiz.questions.length - 1;
    if (elements.quiz.saveStatus) {
        elements.quiz.saveStatus.textContent = "";
    }
}

function renderQuizOptions(question, selectedValue) {
    elements.quiz.optionsContainer.innerHTML = "";
    question.options.forEach((option) => {
        const label = document.createElement("label");
        label.className = "option";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "quizOption";
        input.value = option.value;
        input.checked = option.value === selectedValue;
        input.addEventListener("change", () => handleAnswerSelection(question.id, option.value));
        label.appendChild(input);
        label.appendChild(document.createTextNode(option.text));
        elements.quiz.optionsContainer.appendChild(label);
    });
}

function handleAnswerSelection(questionId, value) {
    appState.quiz.answers[questionId] = value;
    saveQuizProgress();
}

function handleQuizPrevious() {
    if (appState.quiz.currentIndex > 0) {
        appState.quiz.currentIndex -= 1;
        renderQuizQuestion();
        saveQuizProgress();
    }
}

function handleQuizNext() {
    if (appState.quiz.currentIndex < appState.quiz.questions.length - 1) {
        appState.quiz.currentIndex += 1;
        renderQuizQuestion();
        saveQuizProgress();
    }
}

function openQuizReview() {
    buildReviewList();
    navigateTo("quizReviewPage");
}

function buildReviewList() {
    elements.quiz.reviewList.innerHTML = "";
    appState.quiz.questions.forEach((question, index) => {
        const card = document.createElement("div");
        card.className = "review-item";
        const selected = appState.quiz.answers[question.id] || "Not answered";
        card.innerHTML = `
            <h4>Question ${index + 1}</h4>
            <p>${question.question}</p>
            <p><strong>Your answer:</strong> ${selected}</p>
        `;
        elements.quiz.reviewList.appendChild(card);
    });
}

function submitQuiz(isAuto = false) {
    if (!appState.quiz.questions.length) {
        return showMessage(elements.status.quiz, "No quiz is currently loaded.", "error");
    }
    if (!isAuto && Object.keys(appState.quiz.answers).length === 0) {
        return showMessage(elements.status.quiz, "Please answer at least one question before submitting.", "error");
    }
    if (appState.quiz.timerId) {
        clearInterval(appState.quiz.timerId);
        appState.quiz.timerId = null;
    }
    const results = computeQuizResults();
    renderResultPage(results);
    saveQuizProgress();
    navigateTo("result");
}

function computeQuizResults() {
    const { questions, answers, startedAt } = appState.quiz;
    const total = questions.length;
    let correctCount = 0;
    const details = questions.map((question) => {
        const selected = answers[question.id] || "Not answered";
        const isCorrect = String(selected).trim().toLowerCase() === String(question.answer).trim().toLowerCase();
        if (isCorrect) correctCount += 1;
        return {
            question: question.question,
            selected,
            correct: question.answer,
            explanation: question.explanation || "Review the training resources for more detail.",
            cybersecurity_tip: question.cybersecurity_tip || "Stay vigilant when reviewing suspicious communications.",
            related_training: question.related_training || "Refer back to the training library for this topic.",
            isCorrect,
        };
    });
    const score = correctCount;
    const percentage = total ? Math.round((correctCount / total) * 100) : 0;
    const pass = percentage >= 70;
    const durationSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    const minutes = String(Math.floor(durationSeconds / 60)).padStart(2, "0");
    const seconds = String(durationSeconds % 60).padStart(2, "0");
    return { total, score, percentage, pass, details, timeTaken: `${minutes}:${seconds}` };
}

function renderResultPage(results) {
    elements.quiz.resultScore.textContent = `${results.score} / ${results.total}`;
    elements.quiz.resultPercentage.textContent = `${results.percentage}%`;
    elements.quiz.resultCorrect.textContent = `${results.score}`;
    elements.quiz.resultWrong.textContent = `${results.total - results.score}`;
    elements.quiz.resultTime.textContent = results.timeTaken;
    elements.quiz.resultStatus.textContent = results.pass ? "Pass" : "Fail";
    elements.quiz.resultBadge.textContent = results.pass ? "Badge earned: CyberShield Achiever" : "Badge earned: Keep learning";

    const nextLevel = appState.quiz.level === "Beginner" ? "Intermediate" : appState.quiz.level === "Intermediate" ? "Advanced" : null;
    if (results.pass) {
        appState.quizState.quizPass[appState.quiz.level] = true;
        saveUserQuizState(appState.currentUser.email, appState.quizState);
        if (nextLevel) {
            elements.quiz.resultUnlock.textContent = `Next level unlocked: ${nextLevel}`;
            elements.quiz.continueBtn.classList.remove("hidden");
            elements.quiz.retakeBtn.classList.add("hidden");
        } else {
            elements.quiz.resultUnlock.textContent = "All levels completed. Great job!";
            elements.quiz.continueBtn.classList.add("hidden");
            elements.quiz.retakeBtn.classList.add("hidden");
        }
    } else {
        elements.quiz.resultUnlock.textContent = "Complete 70% to unlock the next level.";
        elements.quiz.continueBtn.classList.add("hidden");
        elements.quiz.retakeBtn.classList.remove("hidden");
    }

    updateQuizLevelCards();
    elements.quiz.resultDetails.innerHTML = "";
    results.details.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "review-item";
        card.innerHTML = `
            <h4>Question ${index + 1}</h4>
            <p>${item.question}</p>
            <p><strong>Your answer:</strong> ${item.selected}</p>
            <p><strong>Correct answer:</strong> ${item.correct}</p>
            <p><strong>Explanation:</strong> ${item.explanation}</p>
            <p><strong>Cybersecurity tip:</strong> ${item.cybersecurity_tip}</p>
            <p><strong>Related training:</strong> ${item.related_training}</p>
        `;
        elements.quiz.resultDetails.appendChild(card);
    });
}

function continueToNextLevel() {
    const nextLevel = appState.quiz.level === "Beginner" ? "Intermediate" : appState.quiz.level === "Intermediate" ? "Advanced" : null;
    if (!nextLevel) return;
    selectQuizLevel(nextLevel);
}

function retakeQuiz() {
    const level = appState.quiz.level;
    if (!level) return;
    const sessionKey = `cybershieldQuizSession:${appState.currentUser.email}:${level}`;
    localStorage.removeItem(sessionKey);
    startQuizSession(level);
}

function updateGamificationDisplay() {
    const state = appState.gamification;
    elements.content.xpValue.textContent = state.xp;
    elements.content.userLevel.textContent = state.level;
    elements.content.streakValue.textContent = `${state.streak} days`;
    elements.content.dailyRewardValue.textContent = `+${state.rewardAmount} XP`;
    elements.content.achievementFirstLesson.classList.toggle("achievement-earned", state.achievements.firstLesson);
    elements.content.achievementStreak.classList.toggle("achievement-earned", state.achievements.streak);
    elements.content.achievementQuizMaster.classList.toggle("achievement-earned", state.achievements.quizMaster);
    elements.content.achievementCertificate.classList.toggle("achievement-earned", state.achievements.certificate);
}

function setGamificationState(updates) {
    appState.gamification = { ...appState.gamification, ...updates };
    appState.gamification.level = calculateLevel(appState.gamification.xp);
    updateGamificationDisplay();
}

function calculateLevel(xp) {
    return Math.max(1, Math.floor(Math.sqrt(xp / 80)) + 1);
}

function applyDailyLoginReward() {
    const state = appState.gamification;
    const today = new Date().toISOString().slice(0, 10);
    if (state.lastLogin !== today) {
        const nextStreak = state.lastLogin === getYesterdayDate() ? state.streak + 1 : 1;
        state.streak = nextStreak;
        state.lastLogin = today;
        if (nextStreak >= 3) {
            state.achievements.streak = true;
        }
        state.lastRewardClaim = null;
        saveUserState(appState.currentUser.email, state);
    }
    setGamificationState(state);
}

function getYesterdayDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().slice(0, 10);
}

function claimDailyReward() {
    if (!appState.currentUser) return;
    const state = appState.gamification;
    const today = new Date().toISOString().slice(0, 10);
    if (state.lastRewardClaim === today) {
        showMessage(elements.status.login, "Daily reward already claimed.", "info");
        return;
    }

    state.xp += state.rewardAmount;
    state.lastRewardClaim = today;
    saveUserState(appState.currentUser.email, state);
    setGamificationState(state);
    showMessage(elements.status.login, "Daily reward claimed!", "success");
}

function updateAchievements(category) {
    const state = appState.gamification;
    if (category === "firstLesson") {
        state.achievements.firstLesson = true;
        state.xp += 30;
    }
    if (category === "quizMaster") {
        state.achievements.quizMaster = true;
        state.xp += 40;
    }
    if (category === "certificate") {
        state.achievements.certificate = true;
        state.xp += 60;
    }
    saveUserState(appState.currentUser.email, state);
    setGamificationState(state);
}

function showConfetti() {
    const overlay = document.getElementById("confettiOverlay");
    overlay.classList.remove("hidden");
    overlay.innerHTML = "";

    const colors = ["#ff4d4d", "#ffd700", "#1e88e5", "#43a047", "#9c27b0"];
    for (let i = 0; i < 30; i += 1) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        piece.style.background = colors[i % colors.length];
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        piece.style.animationDelay = `${Math.random() * 0.5}s`;
        piece.style.width = `${8 + Math.random() * 8}px`;
        piece.style.height = `${16 + Math.random() * 14}px`;
        overlay.appendChild(piece);
    }

    setTimeout(() => {
        overlay.classList.add("hidden");
        overlay.innerHTML = "";
    }, 2000);
}

function checkAdminVisibility() {
    const isAdmin = appState.currentUser?.email?.includes("admin") || appState.currentUser?.role === "Admin";
    elements.actions.adminCard.classList.toggle("hidden", !isAdmin);
}

function setAdminAuth(email, password) {
    if (!email || !password) {
        appState.currentPassword = null;
        return;
    }
    appState.currentPassword = password;
}

function getAdminCredentials() {
    if (!appState.currentUser || !appState.currentPassword) {
        throw new Error("Admin credentials not available. Please log in again as admin.");
    }
    return { email: appState.currentUser.email, password: appState.currentPassword };
}

function adminRequest(path, method = "GET", payload = {}) {
    const creds = getAdminCredentials();
    let url = `${API_BASE}${path}`;
    const options = {
        method,
        headers: { "Content-Type": "application/json" },
    };

    if (method === "GET") {
        const params = new URLSearchParams({ email: creds.email, password: creds.password });
        url += `?${params.toString()}`;
    } else {
        options.body = JSON.stringify({ email: creds.email, password: creds.password, ...payload });
    }

    return fetch(url, options).then(async (res) => {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (!res.ok) {
            const errorMessage = data.message || `Admin request failed: ${res.status}`;
            throw new Error(errorMessage);
        }
        return data;
    });
}

function setAdminStatus(message, type = "info") {
    if (!elements.admin?.statusMessage) return;
    elements.admin.statusMessage.textContent = message;
    elements.admin.statusMessage.className = type === "error" ? "status-error" : "status-message";
}

function populateAdminUserTable(users) {
    const tbody = elements.admin.userTable.querySelector("tbody");
    tbody.innerHTML = "";
    users.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.created_at}</td>
            <td><button class="secondary-btn admin-reset-btn" data-user-id="${user.id}">Reset</button></td>
        `;
        tbody.appendChild(row);
    });
    tbody.querySelectorAll(".admin-reset-btn").forEach((button) => {
        button.addEventListener("click", async (event) => {
            const userId = event.currentTarget.dataset.userId;
            try {
                await adminRequest(`/admin/users/${userId}/reset`, "POST", {});
                setAdminStatus(`Progress reset for user ${userId}.`, "success");
            } catch (error) {
                setAdminStatus(error.message, "error");
            }
        });
    });
}

function renderAdminAnalytics(analytics) {
    if (!elements.admin?.analyticsSummary) return;
    elements.admin.analyticsSummary.innerHTML = `
        <div><strong>Total users:</strong> ${analytics.total_users}</div>
        <div><strong>Active users:</strong> ${analytics.active_users}</div>
        <div><strong>Average XP:</strong> ${analytics.average_xp}</div>
    `;
}

async function adminLoadUsers() {
    try {
        const data = await adminRequest("/admin/users");
        populateAdminUserTable(data.users || []);
        setAdminStatus("User list loaded.", "success");
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

async function adminLoadLessons() {
    try {
        const data = await adminRequest("/admin/lessons");
        setAdminStatus(`Loaded ${data.lessons?.length || 0} lessons.`, "success");
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

async function adminLoadVideos() {
    try {
        const data = await adminRequest("/admin/videos");
        setAdminStatus(`Loaded ${data.videos?.length || 0} videos.`, "success");
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

async function adminLoadQuizzes() {
    try {
        const data = await adminRequest("/admin/quizzes");
        setAdminStatus(`Loaded ${data.quizzes?.length || 0} quiz questions.`, "success");
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

async function adminLoadCertificates() {
    try {
        const data = await adminRequest("/admin/certificates");
        setAdminStatus(`Loaded ${data.certificates?.length || 0} certificates.`, "success");
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

async function adminLoadAnalytics() {
    try {
        const data = await adminRequest("/admin/analytics");
        renderAdminAnalytics(data);
        setAdminStatus("Analytics refreshed.", "success");
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

async function adminExportUsers() {
    try {
        const creds = getAdminCredentials();
        const params = new URLSearchParams({ email: creds.email, password: creds.password });
        const url = `${API_BASE}/admin/export/users?${params.toString()}`;
        window.location.href = url;
        setAdminStatus("User export started.", "success");
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

async function adminLoadNotifications() {
    try {
        const data = await adminRequest("/admin/notifications");
        setAdminStatus(`Loaded ${data.notifications?.length || 0} notifications.`, "success");
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

async function adminRefreshLeaderboard() {
    try {
        const data = await adminRequest("/admin/leaderboard");
        const rows = (data.leaderboard || []).map((row, index) => `${index + 1}. ${row.name} (${row.email}) — ${row.xp} XP`).join(" \n");
        const message = rows ? `Leaderboard:\n${rows}` : "No leaderboard entries available.";
        setAdminStatus(message, "success");
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

async function handleAdminLessonSubmit(event) {
    event.preventDefault();
    const form = elements.admin.lessonForm;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
        await adminRequest("/admin/lessons", "POST", payload);
        setAdminStatus("Lesson created.", "success");
        form.reset();
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

async function handleAdminVideoSubmit(event) {
    event.preventDefault();
    const form = elements.admin.videoForm;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
        await adminRequest("/admin/videos", "POST", payload);
        setAdminStatus("Video created.", "success");
        form.reset();
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

async function handleAdminQuizSubmit(event) {
    event.preventDefault();
    const form = elements.admin.quizForm;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
        payload.options = JSON.parse(payload.options);
    } catch (error) {
        return setAdminStatus("Options must be valid JSON array.", "error");
    }

    try {
        await adminRequest("/admin/quizzes", "POST", payload);
        setAdminStatus("Quiz question created.", "success");
        form.reset();
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

async function handleAdminCertificateSubmit(event) {
    event.preventDefault();
    const form = elements.admin.certificateForm;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
        await adminRequest("/admin/certificates", "POST", payload);
        setAdminStatus("Certificate created.", "success");
        form.reset();
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

async function handleAdminNotificationSubmit(event) {
    event.preventDefault();
    const form = elements.admin.notificationForm;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
        await adminRequest("/admin/notifications", "POST", payload);
        setAdminStatus("Notification queued.", "success");
        form.reset();
    } catch (error) {
        setAdminStatus(error.message, "error");
    }
}

function maybeTriggerConfettiForSection(sectionKey) {
    if (sectionKey === "result" || sectionKey === "certificate") {
        showConfetti();
    }
}

function navigateTo(sectionKey) {
    Object.values(elements.sections).forEach((section) => section.classList.add("hidden"));
    elements.sections[sectionKey].classList.remove("hidden");
    updateNavVisibility();
    maybeTriggerConfettiForSection(sectionKey);
}

function updateNavVisibility() {
    const isAuthenticated = Boolean(appState.currentUser);
    elements.nav.login.classList.toggle("hidden", isAuthenticated);
    elements.nav.register.classList.toggle("hidden", isAuthenticated);
    elements.nav.logout.classList.toggle("hidden", !isAuthenticated);
}

function handleLogout() {
    appState.currentUser = null;
    setAdminAuth(null, null);
    navigateTo("home");
    clearForm(elements.forms.login);
    clearForm(elements.forms.register);
    resetStatus(elements.status.login);
    resetStatus(elements.status.register);
}

function clearForm(form) {
    form.reset();
}

function showMessage(element, message, type = "info") {
    element.textContent = message;
    element.className = `status-message ${type === "error" ? "status-error" : "status-success"}`;
}

function resetStatus(element) {
    element.textContent = "";
    element.className = "status-message";
}

function showCookieBanner() {
    elements.cookieBanner.classList.remove("hidden");
}

function hideCookieBanner() {
    elements.cookieBanner.classList.add("hidden");
}

function showOfflineBanner() {
    elements.offlineBanner.classList.remove("hidden");
    setTimeout(() => {
        hideOfflineBanner();
    }, 7000);
}

function hideOfflineBanner() {
    elements.offlineBanner.classList.add("hidden");
}

function loadCookiePreferences() {
    const prefs = localStorage.getItem("cookiePreferences");
    if (!prefs) {
        showCookieBanner();
        return;
    }

    let settings;
    try {
        settings = JSON.parse(prefs);
    } catch (error) {
        console.error("Unable to parse cookie preferences", error);
        showCookieBanner();
        return;
    }

    elements.cookieAnalytics.checked = Boolean(settings.analytics);
    elements.cookiePersonalization.checked = Boolean(settings.personalization);
    if (!settings.accepted) {
        showCookieBanner();
    } else {
        hideCookieBanner();
        hideCookieModal();
    }
}

function showCookieModal() {
    elements.cookieConsent.classList.remove("hidden");
    hideCookieBanner();
}

function hideCookieModal() {
    elements.cookieConsent.classList.add("hidden");
}

function saveCookiePreferences({ accepted, analytics, personalization }) {
    localStorage.setItem(
        "cookiePreferences",
        JSON.stringify({ accepted, analytics, personalization, updatedAt: new Date().toISOString() })
    );
    hideCookieModal();
    hideCookieBanner();
}

function acceptCookiePreferences() {
    saveCookiePreferences({
        accepted: true,
        analytics: elements.cookieAnalytics.checked,
        personalization: elements.cookiePersonalization.checked,
    });
}

function rejectCookiePreferences() {
    saveCookiePreferences({
        accepted: false,
        analytics: false,
        personalization: false,
    });
}

function handlePasswordToggle(event) {
    const targetId = event.currentTarget.dataset.target;
    const targetInput = document.getElementById(targetId);
    if (!targetInput) return;
    const isPassword = targetInput.type === "password";
    targetInput.type = isPassword ? "text" : "password";
    event.currentTarget.textContent = isPassword ? "Hide" : "Show";
}

function updatePasswordStrength(event) {
    const value = event.target.value;
    const strengthLabel = document.querySelector("#passwordStrength span");
    if (!strengthLabel) return;

    let strength = "Very weak";
    if (value.length >= 12 && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value)) {
        strength = "Strong";
    } else if (value.length >= 10 && /[A-Z]/.test(value) && /[0-9]/.test(value)) {
        strength = "Good";
    } else if (value.length >= 8) {
        strength = "Fair";
    }

    strengthLabel.textContent = `Strength: ${strength}`;
}

function loadRememberedEmail() {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
        document.getElementById("loginEmail").value = rememberedEmail;
        elements.rememberMe.checked = true;
    }
}

function setRememberedEmail(email, remember) {
    if (remember) {
        localStorage.setItem("rememberedEmail", email);
    } else {
        localStorage.removeItem("rememberedEmail");
    }
}

function getStoredUsers() {
    try {
        const stored = localStorage.getItem("cybershieldUsers");
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to parse stored users", error);
        return [];
    }
}

function saveStoredUser(user) {
    const users = getStoredUsers();
    const existing = users.find((item) => item.email === user.email);
    if (existing) {
        return false;
    }
    users.push(user);
    localStorage.setItem("cybershieldUsers", JSON.stringify(users));
    return true;
}

function findStoredUser(email, password) {
    const users = getStoredUsers();
    return users.find((item) => item.email === email && item.password === password);
}

function renderProgress() {
    elements.content.completionValue.textContent = `${appState.completion}%`;
    elements.content.progressFill.style.width = `${appState.completion}%`;
    elements.content.progressText.textContent = `${appState.completion}% completed`;
}

async function handleRegisterSubmit(event) {
    event.preventDefault();
    resetStatus(elements.status.register);

    const formData = new FormData(elements.forms.register);
    const password = formData.get("password")?.toString() || "";
    const confirmPassword = formData.get("confirmPassword")?.toString() || "";
    const payload = {
        name: formData.get("name")?.toString().trim() || "",
        email: formData.get("email")?.toString().trim().toLowerCase() || "",
        password,
        role: formData.get("role")?.toString() || "Technical",
    };

    if (!payload.name || !payload.email || !payload.password || !confirmPassword) {
        return showMessage(elements.status.register, "Please complete all fields before registering.", "error");
    }

    if (payload.password !== confirmPassword) {
        return showMessage(elements.status.register, "Passwords do not match. Please check and try again.", "error");
    }

    console.log("register payload", payload);

    if (!payload.name || !payload.email || !payload.password) {
        return showMessage(elements.status.register, "Please complete all fields before registering.", "error");
    }

    showMessage(elements.status.register, "Registering...");

    if (DEBUG_REGISTER_STORE) {
        localStorage.setItem("debugRegisterPayload", JSON.stringify(payload));
        console.log("Saved debug register payload", payload);
    }

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error("Failed to parse JSON response", parseError, text);
            throw new Error("Invalid response from backend");
        }

        if (!response.ok) {
            console.error("Register failed", response.status, data);
            return showMessage(elements.status.register, data.message || "Registration failed.", "error");
        }

        const user = data.user || { name: payload.name, email: payload.email, role: payload.role };
        setAdminAuth(payload.email, payload.password);
        handleAuthSuccess(user, data.message || "Registration completed successfully.");
        clearForm(elements.forms.register);
    } catch (error) {
        console.error(error);
        if (OFFLINE_FALLBACK) {
            const saved = saveStoredUser(payload);
            if (!saved) {
                return showMessage(elements.status.register, "Email already registered locally.", "error");
            }
            setAdminAuth(payload.email, payload.password);
            showOfflineBanner();
            handleAuthSuccess(payload, "Registered offline. Backend unavailable.");
            clearForm(elements.forms.register);
            return;
        }
        showMessage(elements.status.register, "Unable to connect to backend. Ensure the server is running.", "error");
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    resetStatus(elements.status.login);

    const formData = new FormData(elements.forms.login);
    const payload = {
        email: formData.get("email").trim().toLowerCase(),
        password: formData.get("password"),
    };

    if (!payload.email || !payload.password) {
        return showMessage(elements.status.login, "Please enter both email and password.", "error");
    }

    showMessage(elements.status.login, "Logging in...");

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await response.json();

        if (!response.ok) {
            return showMessage(elements.status.login, data.message || "Login failed.", "error");
        }

        setAdminAuth(payload.email, payload.password);
        handleAuthSuccess(data.user, data.message || "Login successful.");
        setRememberedEmail(payload.email, elements.rememberMe.checked);
    } catch (error) {
        console.error(error);
        if (OFFLINE_FALLBACK) {
            const user = findStoredUser(payload.email, payload.password);
            if (user) {
                setAdminAuth(payload.email, payload.password);
                showOfflineBanner();
                handleAuthSuccess(user, "Logged in offline. Backend unavailable.");
                setRememberedEmail(payload.email, elements.rememberMe.checked);
                return;
            }
            return showMessage(elements.status.login, "Offline login failed. No matching local account.", "error");
        }
        showMessage(elements.status.login, "Unable to connect to backend. Ensure the server is running.", "error");
    }
}

function handleAuthSuccess(user, message) {
    appState.currentUser = user;
    appState.gamification = loadUserState(user.email);
    appState.quizState = loadUserQuizState(user.email);
    updateQuizLevelCards();
    applyDailyLoginReward();
    checkAdminVisibility();
    elements.content.welcomeText.textContent = `Hi ${user.name}, welcome to CyberShield`;
    elements.content.certificateName.textContent = user.name;
    showMessage(elements.status.login, message, "success");
    showMessage(elements.status.register, message, "success");
    updateNavVisibility();
    navigateTo("dashboard");
}

function handleQuizSubmit(event) {
    event.preventDefault();
    resetStatus(elements.status.quiz);

    const answer = new FormData(elements.forms.quiz).get("q1");
    if (!answer) {
        return showMessage(elements.status.quiz, "Please choose an option before submitting.", "error");
    }

    const correct = answer === "Fake Email Attack";
    const title = correct ? "Correct!" : "Review your answer.";
    const summary = correct
        ? "Phishing is a fraudulent email or message pretending to be from a trusted source."
        : "The best answer is: Fake Email Attack. Phishing uses deceptive emails or messages.";

    if (correct) {
        const state = appState.gamification;
        state.xp += 25;
        updateAchievements("quizMaster");
        saveUserState(appState.currentUser.email, state);
    }

    elements.content.resultSummary.textContent = `${title} ${summary}`;
    navigateTo("result");
}

document.addEventListener("DOMContentLoaded", init);
