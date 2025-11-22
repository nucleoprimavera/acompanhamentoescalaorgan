// -----------------------------------------
// Firebase Config (COLE O SEU AQUI)
// -----------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyAeyMRXjtms6g6yadXUAFSsCm1jurx-Cvw",
    authDomain: "escaladata-753ae.firebaseapp.com",
    databaseURL: "https://escaladata-753ae-default-rtdb.firebaseio.com",
    projectId: "escaladata-753ae",
    storageBucket: "escaladata-753ae.firebasestorage.app",
    messagingSenderId: "185170724202",
    appId: "1:185170724202:web:6ebb33922ec5b196371113"
};

// -----------------------------------------
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
// -----------------------------------------

(function () {
    const CAPACITY = 13;

    const DEFAULT_SHIFTS = [
        { id: 'shift-1', label: 'Escala 22-Jan-2026 à 22-mar-2026' },
        { id: 'shift-2', label: 'Escala 22-mar-2026 à 22-mai-2026' },
        { id: 'shift-3', label: 'Escala 22-mai-2026 à 22-jul-2026' },
        { id: 'shift-4', label: 'Escala 22-Jul-2026 à 22-set-2026' },
        { id: 'shift-5', label: 'Escala 22-set-2026 à 22-nov-2026' },
        { id: 'shift-6', label: 'Escala 22-nov-2026 à 22-jan-2027' }
    ];

    let state = {
        capacity: CAPACITY,
        shifts: {}
    };

    DEFAULT_SHIFTS.forEach(s => {
        state.shifts[s.id] = { id: s.id, label: s.label, participants: [] };
    });

    const $form = document.getElementById('registrationForm');
    const $name = document.getElementById('name');
    const $shift = document.getElementById('shift');
    const $msg = document.getElementById('formMessage');
    const $grid = document.getElementById('shiftsGrid');

    const $modal = document.getElementById('participantsModal');
    const $modalTitle = document.getElementById('modalTitle');
    const $participantsList = document.getElementById('participantsList');

    // ------------------------
    // Load data from Firebase
    // ------------------------
    function subscribeRealtime() {
        db.ref("escala").on("value", snapshot => {
            const val = snapshot.val();

            if (val) {
                state = val;
            } else {
                // first time → push default data
                db.ref("escala").set(state);
            }
            Object.values(state.shifts).forEach(s => {
                if (!s.participants) s.participants = [];
            });
            renderGrid();
        });
    }

    function saveToFirebase() {
        return db.ref("escala").set(state);
    }

    // ------------------------
    // Rendering
    // ------------------------

    function renderGrid() {
        $grid.innerHTML = "";
        Object.values(state.shifts).forEach(s => {
            const count = (s.participants || []).length;
            const card = document.createElement("div");
            card.className = "shift-card";
            card.innerHTML = `
        <h3>${s.label}</h3>
        <div class="shift-meta">
          <span class="badge">Capacidade ${count}/${state.capacity}</span>
          <span>${count >= state.capacity ? "Vagas preenchidas" : "Há vagas"}</span>
        </div>
        <div class="shift-actions">
          <button class="btn" data-view="${s.id}">Ver participantes</button>
        </div>
      `;
            $grid.appendChild(card);
        });
    }

    function openModal(id) {
        const s = state.shifts[id];
        if (!s) return;

        $modalTitle.textContent = `${s.label} — Participantes (${s.participants.length}/${state.capacity})`;
        $participantsList.innerHTML = "";

        if (s.participants.length === 0) {
            const li = document.createElement("li");
            li.textContent = "Nenhum participante ainda";
            li.className = "empty";
            $participantsList.appendChild(li);
        } else {
            s.participants.forEach(p => {
                const li = document.createElement("li");
                li.textContent = p.name;
                $participantsList.appendChild(li);
            });
        }

        $modal.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
        $modal.setAttribute("aria-hidden", "true");
    }

    function showMessage(t, type) {
        $msg.textContent = t;
        $msg.className = "form-message " + (type || "");
    }

    // ------------------------
    // Events
    // ------------------------
    $grid.addEventListener("click", e => {
        const btn = e.target.closest("button[data-view]");
        if (btn) {
            openModal(btn.getAttribute("data-view"));
        }
    });

    $modal.addEventListener("click", e => {
        if (e.target.hasAttribute("data-close")) closeModal();
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeModal();
    });

    // Start realtime sync
    subscribeRealtime();
})();

