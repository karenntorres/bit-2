"use strict"

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const studentCardsContainer = document.getElementById('student-cards');
    const searchInput = document.getElementById('search');
    const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
    const sortLinks = document.querySelectorAll('.dropdown-content a[data-sort]');

    // --- ELEMENTOS DEL MODAL ---
    const modal = document.getElementById('student-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalButton = document.querySelector('.close-button');

    let allStudents = []; // Almacenará a todos los estudiantes válidos

    // --- CARGA Y FILTRADO INICIAL DE DATOS ---
    fetch('file.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la red: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // CAMBIO: Re-introducimos el filtro para ignorar estudiantes sin 'usernameGithub'.
            allStudents = data.filter(student => student.usernameGithub && student.usernameGithub.trim() !== '');
            displayStudents(allStudents);
        })
        .catch(error => {
            console.error('Error fatal al cargar o procesar file.json:', error);
            studentCardsContainer.innerHTML = `<p style="color: red;">No se pudieron cargar los datos de los estudiantes. Revisa la consola para más detalles.</p>`;
        });

    // --- FUNCIÓN PARA MOSTRAR ESTUDIANTES ---
    function displayStudents(students) {
        studentCardsContainer.innerHTML = '';
        if (students.length === 0) {
            studentCardsContainer.innerHTML = `<p>No se encontraron estudiantes con los criterios seleccionados.</p>`;
            return;
        }

        students.forEach(student => {
            const card = document.createElement('div');
            card.classList.add('student-card');
            card.dataset.code = student.code;

            const average = calculateAverage(student.projects);
            
            // La URL de la imagen ahora siempre será válida porque ya hemos filtrado.
            const imageUrl = `https://github.com/${student.usernameGithub}.png`;

            card.innerHTML = `
                <img src="${imageUrl}" alt="Foto de ${student.student}" class="student-photo" onerror="this.onerror=null;this.src='default-avatar.png';">
                <h2 class="student-name">${student.student}</h2>
                <div class="student-info">
                    <p><strong>Promedio:</strong> ${average.toFixed(2)}</p>
                </div>
            `;
            studentCardsContainer.appendChild(card);
        });
    }

    // --- LÓGICA DE BÚSQUEDA (Sin cambios) ---
    searchInput.addEventListener('keyup', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredStudents = allStudents.filter(student =>
            student.student.toLowerCase().includes(searchTerm)
        );
        displayStudents(filteredStudents);
    });

    // --- LÓGICA DE FILTROS POR INTENSIDAD (Sin cambios) ---
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.dataset.filter;
            if (filterValue === 'all') {
                displayStudents(allStudents);
            } else {
                const filteredStudents = allStudents.filter(student =>
                    student.intensity.includes(filterValue)
                );
                displayStudents(filteredStudents);
            }
        });
    });

    // --- LÓGICA DE ORDENAMIENTO (RANKING) (Sin cambios) ---
    sortLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sortOrder = link.dataset.sort;
            const sortedStudents = [...allStudents].sort((a, b) => {
                const avgA = calculateAverage(a.projects);
                const avgB = calculateAverage(b.projects);
                return sortOrder === 'asc' ? avgA - avgB : avgB - avgA;
            });
            displayStudents(sortedStudents);
        });
    });

    // --- LÓGICA PARA LA VENTANA MODAL ---
    studentCardsContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.student-card');
        if (card) {
            const studentCode = card.dataset.code;
            const studentData = allStudents.find(s => s.code === studentCode);
            if (studentData) {
                openModal(studentData);
            }
        }
    });

    function openModal(student) {
        const average = calculateAverage(student.projects);
        const imageUrl = `https://github.com/${student.usernameGithub}.png`;

        // Como ya hemos filtrado, el botón de GitHub siempre se mostrará para los estudiantes visibles.
        const githubButtonHtml = `<a href="https://github.com/${student.usernameGithub}" target="_blank" class="github-btn" style="display:block; text-align:center; margin-top:1rem;">Ver Perfil en GitHub</a>`;
        
        modalBody.innerHTML = `
            <img src="${imageUrl}" alt="Foto de ${student.student}" class="student-photo" onerror="this.onerror=null;this.src='default-avatar.png';">
            <h2 class="student-name">${student.student}</h2>
            <hr>
            <h3>Información General</h3>
            <p><strong>Código:</strong> ${student.code}</p>
            <p><strong>Intensidad Horaria:</strong> ${student.intensity}</p>
            <p><strong>Promedio Final:</strong> ${average.toFixed(2)}</p>
            ${githubButtonHtml}
        `;
        modal.style.display = 'block';
    }

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // --- FUNCIÓN UTILITARIA (Sin cambios) ---
    function calculateAverage(projects) {
        let totalScore = 0;
        let scoreCount = 0;
        projects.forEach(project => {
            if (project.score) {
                project.score.forEach(s => {
                    totalScore += s;
                    scoreCount++;
                });
            }
        });
        return scoreCount > 0 ? totalScore / scoreCount : 0;
    }
});