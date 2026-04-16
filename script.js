console.log('script.js cargado');

// Si necesitas usar Firebase más adelante, puedes activar esta sección
// y servir la página desde un servidor local en lugar de abrirla con file://
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
// import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// const firebaseConfig = {
//   apiKey: "AIzaSyDm8B0ul5FGivl2WdJBL8Y3Q6gQk8Kldf4",
//   authDomain: "grupo-de-oracion-ef60f.firebaseapp.com",
//   projectId: "grupo-de-oracion-ef60f",
//   storageBucket: "grupo-de-oracion-ef60f.firebasestorage.app",
//   messagingSenderId: "720773815146",
//   appId: "1:720773815146:web:39847783918b34a4bae313"
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

const mapeo = {
    '🌅': { nombre: 'Días enteros', cat: '🌅' },
    '💒': { nombre: 'Misas', cat: '💒' },
    '⛪️': { nombre: 'Misas', cat: '⛪️' }, // Variante
    '☀': { nombre: 'Laudes', cat: '☀' },
    '☀️': { nombre: 'Laudes', cat: '☀️' },
    '⛅': { nombre: 'Vísperas', cat: '⛅' },
    '⛅️': { nombre: 'Vísperas', cat: '⛅️' },
    '🌕': { nombre: 'Completas', cat: '🌕' },
    '🌕️': { nombre: 'Completas', cat: '🌕️' },
    '👼🏼': { nombre: 'Ángelus', cat: '👼🏼' },
    '👼🏻': { nombre: 'Ángelus', cat: '👼🏻' }, // Variante
    '🕯️': { nombre: 'Horas Adoración', cat: '🕯️', unidad: 'h' },
    '🙏🏻': { nombre: 'Horas Oración', cat: '🙏🏻', unidad: 'h' },
    '🌹': { nombre: 'Misterios Rosario', cat: '🌹' },
    '📿': { nombre: 'Rosario entero', cat: '📿' },
    '✨': { nombre: 'Letanías', cat: '✨' },
    '✝️': { nombre: 'Coronilla', cat: '✝️' },
    '🎸': { nombre: 'Oración cantando', cat: '🎸', unidad: 'h' },
    '🔥': { nombre: 'Comunión espiritual', cat: '🔥' },
    '💻': { nombre: 'Trabajo', cat: '💻', unidad: 'h' },
    '📖': { nombre: 'Estudio', cat: '📖', unidad: 'h' },
    '🧹': { nombre: 'Tareas casa', cat: '🧹', unidad: 'h' },
    '🚴🏼‍♂': { nombre: 'Deporte', cat: '🚴🏼‍♂', unidad: 'h' },
    '🦺': { nombre: 'Voluntariado', cat: '🦺', unidad: 'h' },
    '🤐': { nombre: 'Sacrificios', cat: '🤐' },
    '🚭': { nombre: 'Pitis no fumados', cat: '🚭' }
};

function insertEmoji(emoji) {
    const textarea = document.getElementById('inputData');
    textarea.value += emoji + '\n';
    textarea.focus(); // Para que el usuario pueda seguir escribiendo
}

function limpiarTexto() {
    document.getElementById('inputData').value = '';
}

async function procesarDatos() {
    const texto = document.getElementById('inputData').value;
    const lineas = texto.split('\n');
    let totales = {};

    lineas.forEach(linea => {
        if (!linea.trim()) return;

        // Encontrar el emoji en la línea
        for (let emoji in mapeo) {
            if (linea.includes(emoji)) {
                // Extraer número si existe (ej: 6h)
                const numMatch = linea.match(/(\d+)\s*h/);
                const valor = numMatch ? parseInt(numMatch[1]) : 1;

                if (!totales[emoji]) {
                    totales[emoji] = { ...mapeo[emoji], cantidad: 0 };
                }
                totales[emoji].cantidad += valor;
                break; // Asumir solo un emoji por línea
            }
        }
    });

    // Calcular totales por categoría
    let categoryTotals = {};
    for (let key in totales) {
        const cat = totales[key].cat;
        if (!categoryTotals[cat]) {
            categoryTotals[cat] = {
                cantidad: 0,
                nombre: mapeo[cat]?.nombre || totales[key].nombre || cat,
                unidad: mapeo[cat]?.unidad || totales[key].unidad || ''
            };
        }
        categoryTotals[cat].cantidad += totales[key].cantidad;
    }

    // Guardar en localStorage si está disponible
    const registro = {
        fecha: new Date().toISOString(),
        texto: texto,
        totales: totales,
        categoryTotals: categoryTotals
    };
    try {
        let historial = JSON.parse(localStorage.getItem('historialDiario') || '[]');
        historial.push(registro);
        localStorage.setItem('historialDiario', JSON.stringify(historial));
    } catch (error) {
        console.warn('No se pudo guardar el historial en localStorage:', error);
    }

    // Guardar en Firestore
    // Si quieres usar Firestore desde un servidor, activa el bloque de Firebase arriba.
    // Por ahora solo mostramos los resultados localmente.
    mostrarResultados(totales, categoryTotals);
}

function mostrarHistorial() {
    window.open('history.html', '_blank');
}

function limpiarHistorial() {
    localStorage.removeItem('historialDiario');
    document.getElementById('output').innerHTML = '<p>Historial borrado.</p>';
}

function mostrarResultados(totales, categoryTotals) {
    let html = '<h3>Resultados</h3>';
    if (Object.keys(totales).length === 0) {
        html += '<p>No se encontraron actividades válidas en el texto.</p>';
        document.getElementById('output').innerHTML = html;
        return;
    }

    html += '<h4>Totales por Actividad</h4>';
    html += '<table><tr><th>Actividad</th><th>Total</th></tr>';
    for (let key in totales) {
        const item = totales[key];
        html += `<tr><td>${key} ${item.nombre}</td><td><strong>${item.cantidad}${item.unidad || ''}</strong></td></tr>`;
    }
    html += '</table>';

    html += '<h4>Totales por Categoría</h4>';
    html += '<table><tr><th>Categoría</th><th>Total</th></tr>';
    for (let cat in categoryTotals) {
        const item = categoryTotals[cat];
        html += `<tr><td>${cat} ${item.nombre}</td><td><strong>${item.cantidad}${item.unidad || ''}</strong></td></tr>`;
    }
    html += '</table>';

    document.getElementById('output').innerHTML = html;
}

function insertEmojiFromSelect(emoji) {
    if (!emoji) return;
    insertEmoji(emoji);
    const select = document.getElementById('emojiSelect');
    if (select) select.selectedIndex = 0;
}

window.insertEmoji = insertEmoji;
window.limpiarTexto = limpiarTexto;
window.procesarDatos = procesarDatos;
window.insertEmojiFromSelect = insertEmojiFromSelect;
window.mostrarHistorial = mostrarHistorial;
window.limpiarHistorial = limpiarHistorial;