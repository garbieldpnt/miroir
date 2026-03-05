const STORAGE_KEY = 'stValentin_Miroirs';

document.addEventListener('DOMContentLoaded', loadSavedMirrors);

function updateClock() {
    const now = new Date();
    checkNewDayReset(now);

    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secDeg = (seconds / 60) * 360;
    const minDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
    const hourDeg = (hours / 12) * 360 + (minutes / 60) * 30;

    document.getElementById('sec-hand').style.transform = `rotate(${secDeg}deg)`;
    document.getElementById('min-hand').style.transform = `rotate(${minDeg}deg)`;
    document.getElementById('hour-hand').style.transform = `rotate(${hourDeg}deg)`;
}

setInterval(updateClock, 1000);

function checkMirrorTime() {
    const now = new Date();
    const hh = now.getHours();
    const mm = now.getMinutes();
    
    // --- MODE TRICHE (Décommente pour tester) ---
    // const hh = 16; const mm = 16; 
    
    let isMirror = false;
    let targetH = hh, targetM = mm;

    for (let i = 0; i <= 5; i++) {
        let checkM = mm - i;
        let checkH = hh;
        
        if (checkM < 0) continue; 

        if (checkH === checkM) {
            isMirror = true;
            targetH = checkH;
            targetM = checkM;
            break;
        }
    }

    if (isMirror) {
        // Si c'est une heure miroir et qu'on ne l'a pas encore : on l'affiche et on sauvegarde.
        // Si on l'a déjà, on ne fait rien (pas de message d'erreur).
        if (!isAlreadyCaptured(targetH, targetM)) {
            freezeHand(targetH, targetM);
            saveMirror(targetH, targetM);
        }
    }
    // Si ce n'est pas une heure miroir, il ne se passe rien (plus de message "ce n'est pas le moment").
}

function freezeHand(h, m) {
    const container = document.getElementById('frozen-hands');
    const frozenHand = document.createElement('div');
    frozenHand.className = 'frozen-hand';
    
    // Calcul de l'angle pour l'aiguille des HEURES (sur un cadran de 12h)
    // On ajoute le petit décalage naturel causé par les minutes
    const angle = ((h % 12) / 12) * 360 + (m / 60) * 30;
    
    frozenHand.style.transform = `rotate(${angle}deg)`;
    frozenHand.dataset.time = `${h}:${m}`;
    
    container.appendChild(frozenHand);
}

// --- GESTION DE LA SAUVEGARDE ---

function getTodayDateString() {
    return new Date().toLocaleDateString('fr-FR');
}

function loadSavedMirrors() {
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const today = getTodayDateString();

    if (savedData && savedData.date === today) {
        savedData.mirrors.forEach(item => {
            freezeHand(item.h, item.m);
        });
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

function saveMirror(h, m) {
    let savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const today = getTodayDateString();

    if (!savedData || savedData.date !== today) {
        savedData = { date: today, mirrors: [] };
    }

    savedData.mirrors.push({ h: h, m: m });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
}

function isAlreadyCaptured(h, m) {
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const today = getTodayDateString();

    if (savedData && savedData.date === today) {
        return savedData.mirrors.some(item => item.h === h && item.m === m);
    }
    return false;
}

let lastCheckedDate = getTodayDateString();

function checkNewDayReset(now) {
    const currentDate = now.toLocaleDateString('fr-FR');
    if (currentDate !== lastCheckedDate) {
        localStorage.removeItem(STORAGE_KEY);
        document.getElementById('frozen-hands').innerHTML = '';
        lastCheckedDate = currentDate;
    }
}
