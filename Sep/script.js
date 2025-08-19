(function () {
    "use strict";

    /** DOM references */
    const recipeCard = document.querySelector('.recipe-card');
    const ingredientsPanel = document.getElementById('ingredients');
    const stepsPanel = document.getElementById('steps');
    const toggleIngredientsBtn = document.getElementById('toggleIngredients');
    const toggleStepsBtn = document.getElementById('toggleSteps');
    const startBtn = document.getElementById('startBtn');
    const nextBtn = document.getElementById('nextBtn');
    const resetBtn = document.getElementById('resetBtn');
    const progressBar = document.getElementById('progressBar');
    const timerDisplay = document.getElementById('timerDisplay');

    /** State */
    let currentStepIndex = -1;
    let countdownIntervalId = null;
    const steps = Array.from(stepsPanel.querySelectorAll('.step'));
    const totalSteps = steps.length;
    const prepMinutes = Number(recipeCard?.getAttribute('data-prep-minutes') || 0);
    let remainingSeconds = prepMinutes * 60;

    /** Helpers */
    function formatSeconds(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateProgress() {
        const completed = Math.max(0, currentStepIndex);
        const percent = Math.min(100, Math.round((completed / totalSteps) * 100));
        progressBar.style.width = `${percent}%`;
        progressBar.setAttribute('aria-valuenow', String(percent));
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', '100');
    }

    function clearActiveStates() {
        steps.forEach((li) => li.classList.remove('active', 'done'));
    }

    function setStepActive(index) {
        clearActiveStates();
        steps.forEach((li, i) => {
            if (i < index) li.classList.add('done');
        });
        if (index >= 0 && index < totalSteps) {
            steps[index].classList.add('active');
            steps[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        updateProgress();
    }

    function startTimer() {
        if (!prepMinutes) return; // Optional bonus
        remainingSeconds = prepMinutes * 60;
        timerDisplay.textContent = formatSeconds(remainingSeconds);
        if (countdownIntervalId) clearInterval(countdownIntervalId);
        countdownIntervalId = setInterval(() => {
            remainingSeconds -= 1;
            if (remainingSeconds <= 0) {
                remainingSeconds = 0;
                clearInterval(countdownIntervalId);
                countdownIntervalId = null;
                timerDisplay.textContent = '00:00';
                timerDisplay.classList.add('time-up');
                // Optional: animate to full if not done
            } else {
                timerDisplay.textContent = formatSeconds(remainingSeconds);
            }
        }, 1000);
    }

    function stopTimer() {
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
    }

    function onStart() {
        startBtn.disabled = true;
        nextBtn.disabled = false;
        resetBtn.disabled = false;

        currentStepIndex = 0;
        setStepActive(currentStepIndex);
        startTimer();
    }

    function onNext() {
        if (currentStepIndex < 0) return;
        // Mark current as done and move forward
        steps[currentStepIndex].classList.remove('active');
        steps[currentStepIndex].classList.add('done');
        currentStepIndex += 1;

        if (currentStepIndex >= totalSteps) {
            updateProgress();
            nextBtn.disabled = true;
            startBtn.disabled = true;
            steps[totalSteps - 1].classList.add('done');
            // Optional celebratory effect
            progressBar.style.transition = 'width 350ms ease, box-shadow 300ms ease';
            progressBar.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.7)';
            setTimeout(() => (progressBar.style.boxShadow = 'none'), 800);
            return;
        }

        setStepActive(currentStepIndex);
    }

    function onReset() {
        startBtn.disabled = false;
        nextBtn.disabled = true;
        resetBtn.disabled = true;
        currentStepIndex = -1;
        stopTimer();
        timerDisplay.textContent = formatSeconds(prepMinutes * 60);
        timerDisplay.classList.remove('time-up');
        clearActiveStates();
        updateProgress();
    }

    function togglePanel(panelEl, buttonEl) {
        const isCollapsed = panelEl.classList.toggle('collapsed');
        const expanded = !isCollapsed;
        buttonEl.setAttribute('aria-expanded', String(expanded));
        panelEl.setAttribute('aria-hidden', String(!expanded));
        buttonEl.textContent = expanded
            ? (panelEl.id === 'ingredients' ? 'Hide Ingredients' : 'Hide Steps')
            : (panelEl.id === 'ingredients' ? 'Show Ingredients' : 'Show Steps');
    }

    /** Event bindings */
    toggleIngredientsBtn?.addEventListener('click', () => togglePanel(ingredientsPanel, toggleIngredientsBtn));
    toggleStepsBtn?.addEventListener('click', () => togglePanel(stepsPanel, toggleStepsBtn));
    startBtn?.addEventListener('click', onStart);
    nextBtn?.addEventListener('click', onNext);
    resetBtn?.addEventListener('click', onReset);

    /** Init */
    // Ensure initial timer text
    timerDisplay.textContent = formatSeconds(prepMinutes * 60);
    updateProgress();
})();


