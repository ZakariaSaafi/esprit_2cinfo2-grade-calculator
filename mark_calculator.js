// Fonction pour extraire les données des modules depuis le HTML
function extractModuleData() {
    const notesTable = document.querySelector('#ContentPlaceHolder1_GridView1');
    const rattrapageTable = document.querySelector('#ContentPlaceHolder1_GridView2');

    const moduleNotes = [];
    const CR_M = {
        "Administration & sécurité des SE (Unix)": 3,
        "Analyse et Décision financière": 1.5,
        "Application coté client Angular": 3,
        "BD NoSql": 2,
        "Communication, Culture et Citoyenneté A2_PR": 2,
        "Environnment de l'entreprise": 1.5,
        "Génie logiciel & atelier GL": 3,
        "IP essentials": 2,
        "Java scripts coté serveur": 3,
        "Outil collaboratif GIT": 1,
        "Switched Network": 2,
        "Techniques d'estimation pour l'ingénieur": 3,
        "Théorie des langages": 3,
        "Projet Web avancé": 5,
        "Certification CCNA": 1
    };

    if (notesTable) {
        const rows = notesTable.querySelectorAll('tbody > tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const designation = cells[0].innerText.trim();
                const noteCC = parseFloat(cells[2].innerText.trim().replace(',', '.')) || 0;
                const noteTP = parseFloat(cells[3].innerText.trim().replace(',', '.')) || 0;
                const noteExam = parseFloat(cells[4].innerText.trim().replace(',', '.')) || 0;
                const noteRattrapage = 0; // Placeholder, updated later

                moduleNotes.push({
                    designation,
                    noteCC,
                    noteTP,
                    noteExam,
                    noteRattrapage
                });
            }
        });
    }

    if (rattrapageTable) {
        const rows = rattrapageTable.querySelectorAll('tbody > tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const designation = cells[0].innerText.trim();
                const noteRattrapage = parseFloat(cells[1].innerText.trim().replace(',', '.')) || 0;
                moduleNotes.forEach(module => {
                    if (module.designation === designation) {
                        module.noteRattrapage = noteRattrapage;
                    }
                });
            }
        });
    }

    return { moduleNotes, CR_M };
}

// Fonction pour calculer la moyenne et afficher les résultats
function displayResults() {
    const { moduleNotes, CR_M } = extractModuleData();

    // Filtrer les modules valides
    const validModules = moduleNotes.filter(module => {
        return !(module.noteExam === 0 && module.noteRattrapage === 0);
    });

    console.log("Modules valides:", validModules);

    // Calcul de la moyenne pour chaque module
    const moduleAverages = validModules.map(module => {
        const noteCC = module.noteCC;
        const noteTP = module.noteTP;
        const noteExam = module.noteExam;
        const noteRattrapage = module.noteRattrapage;

        // Calcul des notes selon les nouvelles règles
        const weightedNoteCC = (noteCC && noteTP && (noteExam || noteRattrapage)) ? noteCC * 0.2 :
                               (noteCC && (noteExam || noteRattrapage) && !noteTP) ? noteCC * 0.4 : 0;
        const weightedNoteTP = (noteTP && noteCC && (noteExam || noteRattrapage)) ? noteTP * 0.2 :
                               (noteTP && !(noteCC) && (noteExam || noteRattrapage)) ? noteTP * 0.4 : 0;
        
        let weightedNoteExam;
        if (noteExam !== 0 && noteExam != null) {
            weightedNoteExam = (noteCC && noteTP) ? noteExam * 0.6 :
                               ((noteCC && !noteTP) || (!noteCC && noteTP)) ? noteExam * 0.8 :
                               noteExam * 1;
        } else {   
            weightedNoteExam = (noteCC && noteTP) ? noteRattrapage * 0.6 :
                               ((noteCC && !noteTP) || (!noteCC && noteTP)) ? noteRattrapage * 0.8 :
                               noteRattrapage * 1;
        }

        console.log(`Module: ${module.designation}`);
        console.log(`Weighted Note CC: ${weightedNoteCC}`);
        console.log(`Weighted Note TP: ${weightedNoteTP}`);
        console.log(`Weighted Note Exam: ${weightedNoteExam}`);

        // Remplacement par la note de rattrapage si l'examen est à 0
        const finalNoteExam = weightedNoteExam;
        console.log(`Final Note Exam (with Rattrapage if Exam is 0): ${finalNoteExam}`);

        // Calcul de la moyenne
        const average = (weightedNoteCC + weightedNoteTP + weightedNoteExam) * (CR_M[module.designation] || 1);

        console.log(`Calculated Average: ${average}`);

        return {
            designation: module.designation,
            average: average.toFixed(2),
            cr_m: CR_M[module.designation] || 1,
            averageTimesCR_M: (average).toFixed(2)
        };
    });

    console.log("Module Averages:", moduleAverages);

    // Calcul du total des coefficients CR-M
    const totalCR_M = validModules.reduce((sum, module) => sum + (CR_M[module.designation] || 1), 0);
    console.log(`Total des CR-M: ${totalCR_M}`);

    // Calcul de la somme des Moyenne * CR-M
    const sumOfAveragesTimesCR_M = moduleAverages.reduce((sum, module) => sum + parseFloat(module.averageTimesCR_M), 0);
    console.log(`Somme des Moyenne * CR-M: ${sumOfAveragesTimesCR_M}`);

    // Calcul de la moyenne pondérée globale
    const weightedAverage = (sumOfAveragesTimesCR_M / totalCR_M).toFixed(2);
    console.log(`Moyenne pondérée globale: ${weightedAverage}`);

   // Effacer la console
    console.clear();   

    // Afficher le tableau des notes des modules
    console.table(moduleNotes.map(module => ({
        'Nom Module': module.designation,
        'Note CC': module.noteCC,
        'Note TP': module.noteTP,
        'Note Examen': module.noteExam,
        'Note Rattrapage': module.noteRattrapage
    })));

    // Afficher le tableau des coefficients CR-M
    console.table(Object.entries(CR_M).map(([module, coefficient]) => ({
        'Nom Module': module,
        'CR-M': coefficient
    })));

    // Afficher le tableau des moyennes calculées
    console.table(moduleAverages.map(module => ({
        'Nom Module': module.designation,
        'Moyenne': module.average / module.cr_m,
        'CR-M': module.cr_m,
        'Moyenne * CR-M': module.averageTimesCR_M
    })));

    // Afficher le total des CR-M et la somme des Moyenne * CR-M
    console.log(`Total des CR-M: ${totalCR_M}`);
    console.log(`Somme des Moyenne * CR-M: ${sumOfAveragesTimesCR_M}`);

    // Afficher la moyenne pondérée globale
    console.log(`Moyenne pondérée globale: ${weightedAverage}`);

    // Message final
    console.log("\nThis script was made with love ❤️. Hope you get all good marks!\n©Zakaria Saafi");
}

// Exécuter la fonction pour afficher les résultats
displayResults();
