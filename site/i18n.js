/* Language support for the site shell: English, French, German, Italian.
   window.HEC_I18N = { lang, t(key, ...args), setLang(code), apply(), switcher() }
   The choice is remembered in localStorage ('hec_lang'). Course pages are served per language by the backend. */
(function () {
  var LANGS = [['en', 'EN', 'English'], ['fr', 'FR', 'Français'], ['de', 'DE', 'Deutsch'], ['it', 'IT', 'Italiano']];
  var D = {
    en: {
      signout: 'Sign out', theme: 'Toggle light / dark theme', language: 'Language',
      gate_h1: 'Your first year at HEC, one account.',
      gate_p: 'Notes, step-by-step exercises, flashcards and timed past papers for all seven courses. Create an account or log in to continue.',
      f_courses: 'courses', f_sections: 'sections', f_cards: 'accounting flashcards', f_papers: 'past papers',
      welcome_back: 'Welcome back', create_your_account: 'Create your account', account: 'Account',
      login: 'Log in', signup: 'Sign up', email: 'Email', password: 'Password', first_name: 'First name', repeat_password: 'Repeat password',
      hint_pw: 'At least 8 characters.', create_account: 'Create account', new_here: 'New here?', create_an_account: 'Create an account',
      already: 'Already registered?', setup: 'The backend is not connected yet. Fill in site/config.js with your Supabase project URL and anon key.',
      hub_h1: 'HEC Lausanne, first year',
      hub_p: 'All seven course summaries in one place. Each one has notes, step-by-step exercises and a progress tracker; most add flashcards, mini tests and timed past papers.',
      hello_back: 'Welcome back, {0}', hello: 'Welcome, {0}',
      unlock: 'Unlock the courses', pay_h2: 'One payment opens all seven courses',
      pay_p: 'Pay once with TWINT or card. Your courses open as soon as the payment goes through, on every device you log in from.',
      one_time: 'one-time, no subscription', pay_btn: 'Pay with TWINT',
      payment: 'Payment', confirming_h2: 'Confirming your payment…', confirming_p: 'This usually takes a few seconds. The courses unlock on their own.',
      courses: 'Courses', gridnote: 'Progress bars show the sections you marked “Got it” on this device.',
      open: 'Open →', locked: 'Unlocks after payment',
      e_invalid: 'Email or password is incorrect.', e_exists: 'An account with this email already exists. Log in instead.',
      e_confirm: 'Confirm your email first: open the link we sent you, then log in.', e_rate: 'Too many attempts. Wait a minute and try again.',
      e_weak: 'Choose a stronger password.', e_net: 'Cannot reach the server. Check your connection and try again.', e_generic: 'Something went wrong. Try again.',
      no_backend: 'The backend is not connected yet.', v_email: 'Enter a valid email address.', v_pass: 'Enter your password.', v_name: 'Enter your first name.',
      v_len: 'Choose a password with at least 8 characters.', v_match: 'The two passwords do not match.',
      confirm_sent: 'Almost done: we sent a confirmation link to {0}. Open it, then log in here.',
      pay_fail: 'Could not start the payment. Try again in a moment.', pay_wait: 'We have not received the payment yet. If you paid, wait a minute and reload this page. Nothing is charged twice.',
      pay_cancel: 'The payment was cancelled. You have not been charged.', load_fail: 'Could not load the sign-in service. Check your connection and reload.',
      /* course pages */
      c_opening: 'Opening your course…', c_back: 'Back to all courses', c_invalid: 'This course link is not valid.', c_noauth: 'Could not load the sign-in service. Reload the page.',
      c_missing: 'This course has not been uploaded yet.', c_fail: 'Could not open the course. Try again in a moment.', c_net: 'Could not open the course. Check your connection and try again.',
      c_fallback: 'This course is not available in {0} yet. Showing the English version.',
      /* course catalogue */
      'n:statistics': 'Statistics I', 'n:mathematics': 'Mathematics I', 'n:economics': 'Economics I', 'n:financial-accounting': 'Financial Accounting',
      'n:computer-models': 'Computer Models I', 'n:management-ethics': 'Management and Ethics', 'n:mathematics-two': 'Mathematics II',
      'b:statistics': 'Describing data, probability, random variables, estimation and tests, with a worked calculation for every formula.',
      'b:mathematics': 'Financial mathematics, functions, derivatives and integrals, rebuilt one small step at a time.',
      'b:economics': 'Consumer and producer theory, market equilibrium and taxes, with a figure wherever a picture helps.',
      'b:financial-accounting': '38 chapters in 6 parts, 56 exercises with solutions, 157 flashcards and three mock exams.',
      'b:computer-models': 'Excel calculation models, relational databases, SQL, normalization, UML and data warehouses.',
      'b:management-ethics': 'Ethics and society, CSR and innovation, strategy, and the functions of the organization.',
      'b:mathematics-two': 'Matrices, linear systems, quadratic forms, eigenvalues, input-output, Taylor, free and constrained extrema, with 39 exercises and three past papers.',
      'n:statistics-two': 'Statistics II',
      'n:programming': 'Programming',
      'b:statistics-two': 'Simple and multiple regression, R², t and F tests, then causal analysis: randomisation, difference-in-differences and event studies, with 26 step-by-step exercises and the May 2024 mock exam.',
      'b:programming': 'Python from the first line to NumPy, pandas, matplotlib and database access, with 31 trace-the-code exercises and the June 2015 and June 2016 exam papers.',
      'n:organisational-behavior': 'Organizational Behavior',
      'b:organisational-behavior': 'People, groups and leadership: ten lessons with the studies and numbers the exam asks about, 33 case exercises, flashcards, a mini test and the 2019, 2020 and 2021 papers.',
      'n:economics-two': 'Economics II',
      'b:economics-two': 'Markets, growth and the open economy: 14 topics, 37 step-by-step exercises, flashcards, a mini test and three practice papers.',
      'n:droit-entreprise': "Business Law",
      'b:droit-entreprise': "The Swiss legal order and the law of obligations: 12 topics, 32 worked cases, flashcards, a mini test and three practice papers.",
      'Notes': 'Notes', 'Exercises': 'Exercises', 'Flashcards': 'Flashcards', 'Mini test': 'Mini test', 'Past papers': 'Past papers', 'Exams': 'Exams',
      'Study tools': 'Study tools', 'SQL blueprints': 'SQL blueprints', 'SQL lab': 'SQL lab'
    },
    fr: {
      signout: 'Se déconnecter', theme: 'Basculer entre thème clair et sombre', language: 'Langue',
      gate_h1: 'Ta première année à HEC, un seul compte.',
      gate_p: 'Notes, exercices pas à pas, flashcards et anciens examens chronométrés pour les sept cours. Crée un compte ou connecte-toi pour continuer.',
      f_courses: 'cours', f_sections: 'sections', f_cards: 'flashcards de comptabilité', f_papers: 'anciens examens',
      welcome_back: 'Bon retour', create_your_account: 'Crée ton compte', account: 'Compte',
      login: 'Se connecter', signup: "S'inscrire", email: 'E-mail', password: 'Mot de passe', first_name: 'Prénom', repeat_password: 'Répète le mot de passe',
      hint_pw: 'Au moins 8 caractères.', create_account: 'Créer le compte', new_here: 'Nouveau ici ?', create_an_account: 'Créer un compte',
      already: 'Déjà inscrit·e ?', setup: "Le serveur n'est pas encore connecté. Renseigne site/config.js avec l'URL du projet Supabase et la clé anon.",
      hub_h1: 'HEC Lausanne, première année',
      hub_p: 'Tous les résumés de cours au même endroit. Chacun contient des notes, des exercices pas à pas et un suivi de progression ; la plupart ajoutent des flashcards, des mini-tests et des anciens examens chronométrés.',
      hello_back: 'Bon retour, {0}', hello: 'Bienvenue, {0}',
      unlock: 'Débloquer les cours', pay_h2: 'Un seul paiement ouvre les sept cours',
      pay_p: 'Paie une fois par TWINT ou par carte. Tes cours s’ouvrent dès que le paiement est validé, sur tous les appareils où tu te connectes.',
      one_time: 'paiement unique, sans abonnement', pay_btn: 'Payer avec TWINT',
      payment: 'Paiement', confirming_h2: 'Confirmation du paiement…', confirming_p: 'Cela prend en général quelques secondes. Les cours se débloquent tout seuls.',
      courses: 'Cours', gridnote: 'Les barres de progression montrent les sections marquées « Compris » sur cet appareil.',
      open: 'Ouvrir →', locked: 'Se débloque après le paiement',
      e_invalid: 'E-mail ou mot de passe incorrect.', e_exists: 'Un compte existe déjà avec cet e-mail. Connecte-toi plutôt.',
      e_confirm: "Confirme d'abord ton e-mail : ouvre le lien que nous t'avons envoyé, puis connecte-toi.", e_rate: 'Trop de tentatives. Attends une minute et réessaie.',
      e_weak: 'Choisis un mot de passe plus solide.', e_net: 'Impossible de joindre le serveur. Vérifie ta connexion et réessaie.', e_generic: "Une erreur s'est produite. Réessaie.",
      no_backend: "Le serveur n'est pas encore connecté.", v_email: 'Saisis une adresse e-mail valide.', v_pass: 'Saisis ton mot de passe.', v_name: 'Saisis ton prénom.',
      v_len: 'Choisis un mot de passe d’au moins 8 caractères.', v_match: 'Les deux mots de passe ne correspondent pas.',
      confirm_sent: 'Presque fini : nous avons envoyé un lien de confirmation à {0}. Ouvre-le, puis connecte-toi ici.',
      pay_fail: 'Impossible de lancer le paiement. Réessaie dans un instant.', pay_wait: "Nous n'avons pas encore reçu le paiement. Si tu as payé, attends une minute et recharge la page. Rien n'est débité deux fois.",
      pay_cancel: "Le paiement a été annulé. Tu n'as pas été débité·e.", load_fail: 'Impossible de charger le service de connexion. Vérifie ta connexion et recharge.',
      c_opening: 'Ouverture de ton cours…', c_back: 'Retour à tous les cours', c_invalid: "Ce lien de cours n'est pas valide.", c_noauth: 'Impossible de charger le service de connexion. Recharge la page.',
      c_missing: "Ce cours n'a pas encore été mis en ligne.", c_fail: "Impossible d'ouvrir le cours. Réessaie dans un instant.", c_net: "Impossible d'ouvrir le cours. Vérifie ta connexion et réessaie.",
      c_fallback: "Ce cours n'est pas encore disponible en {0}. La version anglaise est affichée.",
      'n:statistics': 'Statistique I', 'n:mathematics': 'Mathématiques I', 'n:economics': 'Économie I', 'n:financial-accounting': 'Comptabilité financière',
      'n:computer-models': 'Modèles informatiques I', 'n:management-ethics': 'Management et éthique', 'n:mathematics-two': 'Mathématiques II',
      'b:statistics': 'Description des données, probabilités, variables aléatoires, estimation et tests, avec un calcul détaillé pour chaque formule.',
      'b:mathematics': 'Mathématiques financières, fonctions, dérivées et intégrales, reconstruites petit pas par petit pas.',
      'b:economics': 'Théorie du consommateur et du producteur, équilibre de marché et impôts, avec une figure partout où une image aide.',
      'b:financial-accounting': '38 chapitres en 6 parties, 56 exercices corrigés, 157 flashcards et trois examens blancs.',
      'b:computer-models': 'Modèles de calcul Excel, bases de données relationnelles, SQL, normalisation, UML et entrepôts de données.',
      'b:management-ethics': "Éthique et société, RSE et innovation, stratégie et fonctions de l'organisation.",
      'b:mathematics-two': 'Matrices, systèmes linéaires, formes quadratiques, valeurs propres, input-output, Taylor, extrema libres et liés, avec 39 exercices et trois anciens examens.',
      'n:statistics-two': 'Statistique II',
      'n:programming': 'Programmation',
      'b:statistics-two': 'Régression simple et multiple, tests t et F, puis analyse causale : randomisation, différences de différences et études d’événements, avec 26 exercices pas à pas et l’examen blanc de mai 2024.',
      'b:programming': 'Python de la première ligne à NumPy, pandas, matplotlib et l’accès aux bases de données, avec 31 exercices de lecture de code et les examens de juin 2015 et juin 2016.',
      'n:organisational-behavior': 'Comportement organisationnel',
      'b:organisational-behavior': 'Personnes, groupes et leadership : dix leçons avec les études et les chiffres que l’examen demande, 33 exercices sur cas, des fiches, un mini-test et les examens de 2019, 2020 et 2021.',
      'n:economics-two': 'Économie II',
      'b:economics-two': 'Marchés, croissance et économie ouverte : 14 thèmes, 37 exercices pas à pas, des fiches, un mini-test et trois examens blancs.',
      'n:droit-entreprise': "Droit de l’entreprise",
      'b:droit-entreprise': "L’ordre juridique suisse et le droit des obligations : 12 thèmes, 32 cas pratiques, des fiches, un mini-test et trois examens blancs.",
      'Notes': 'Notes', 'Exercises': 'Exercices', 'Flashcards': 'Flashcards', 'Mini test': 'Mini-test', 'Past papers': 'Anciens examens', 'Exams': 'Examens',
      'Study tools': "Outils d'étude", 'SQL blueprints': 'Modèles SQL', 'SQL lab': 'Labo SQL'
    },
    de: {
      signout: 'Abmelden', theme: 'Zwischen hellem und dunklem Design wechseln', language: 'Sprache',
      gate_h1: 'Dein erstes Jahr an der HEC, ein Konto.',
      gate_p: 'Notizen, Übungen Schritt für Schritt, Lernkarten und Prüfungen unter Zeitdruck für alle sieben Kurse. Erstelle ein Konto oder melde dich an, um fortzufahren.',
      f_courses: 'Kurse', f_sections: 'Abschnitte', f_cards: 'Lernkarten Rechnungswesen', f_papers: 'alte Prüfungen',
      welcome_back: 'Willkommen zurück', create_your_account: 'Erstelle dein Konto', account: 'Konto',
      login: 'Anmelden', signup: 'Registrieren', email: 'E-Mail', password: 'Passwort', first_name: 'Vorname', repeat_password: 'Passwort wiederholen',
      hint_pw: 'Mindestens 8 Zeichen.', create_account: 'Konto erstellen', new_here: 'Neu hier?', create_an_account: 'Konto erstellen',
      already: 'Schon registriert?', setup: 'Das Backend ist noch nicht verbunden. Trage in site/config.js die Supabase-Projekt-URL und den Anon-Key ein.',
      hub_h1: 'HEC Lausanne, erstes Jahr',
      hub_p: 'Alle Kurszusammenfassungen an einem Ort. Jede enthält Notizen, Übungen Schritt für Schritt und einen Fortschrittstracker; die meisten bieten zusätzlich Lernkarten, Mini-Tests und alte Prüfungen unter Zeitdruck.',
      hello_back: 'Willkommen zurück, {0}', hello: 'Willkommen, {0}',
      unlock: 'Kurse freischalten', pay_h2: 'Eine Zahlung öffnet alle sieben Kurse',
      pay_p: 'Einmal mit TWINT oder Karte bezahlen. Deine Kurse öffnen sich, sobald die Zahlung durch ist, auf jedem Gerät, auf dem du dich anmeldest.',
      one_time: 'einmalig, kein Abo', pay_btn: 'Mit TWINT bezahlen',
      payment: 'Zahlung', confirming_h2: 'Zahlung wird bestätigt…', confirming_p: 'Das dauert normalerweise nur wenige Sekunden. Die Kurse werden automatisch freigeschaltet.',
      courses: 'Kurse', gridnote: 'Die Fortschrittsbalken zeigen die Abschnitte, die du auf diesem Gerät als „Verstanden“ markiert hast.',
      open: 'Öffnen →', locked: 'Wird nach der Zahlung freigeschaltet',
      e_invalid: 'E-Mail oder Passwort ist falsch.', e_exists: 'Mit dieser E-Mail existiert bereits ein Konto. Melde dich stattdessen an.',
      e_confirm: 'Bestätige zuerst deine E-Mail: Öffne den Link, den wir dir geschickt haben, und melde dich dann an.', e_rate: 'Zu viele Versuche. Warte eine Minute und versuche es erneut.',
      e_weak: 'Wähle ein stärkeres Passwort.', e_net: 'Der Server ist nicht erreichbar. Prüfe deine Verbindung und versuche es erneut.', e_generic: 'Etwas ist schiefgelaufen. Versuche es erneut.',
      no_backend: 'Das Backend ist noch nicht verbunden.', v_email: 'Gib eine gültige E-Mail-Adresse ein.', v_pass: 'Gib dein Passwort ein.', v_name: 'Gib deinen Vornamen ein.',
      v_len: 'Wähle ein Passwort mit mindestens 8 Zeichen.', v_match: 'Die beiden Passwörter stimmen nicht überein.',
      confirm_sent: 'Fast geschafft: Wir haben einen Bestätigungslink an {0} geschickt. Öffne ihn und melde dich dann hier an.',
      pay_fail: 'Die Zahlung konnte nicht gestartet werden. Versuche es gleich noch einmal.', pay_wait: 'Wir haben die Zahlung noch nicht erhalten. Falls du bezahlt hast, warte eine Minute und lade die Seite neu. Es wird nichts doppelt abgebucht.',
      pay_cancel: 'Die Zahlung wurde abgebrochen. Dir wurde nichts belastet.', load_fail: 'Der Anmeldedienst konnte nicht geladen werden. Prüfe deine Verbindung und lade neu.',
      c_opening: 'Dein Kurs wird geöffnet…', c_back: 'Zurück zu allen Kursen', c_invalid: 'Dieser Kurslink ist ungültig.', c_noauth: 'Der Anmeldedienst konnte nicht geladen werden. Lade die Seite neu.',
      c_missing: 'Dieser Kurs wurde noch nicht hochgeladen.', c_fail: 'Der Kurs konnte nicht geöffnet werden. Versuche es gleich noch einmal.', c_net: 'Der Kurs konnte nicht geöffnet werden. Prüfe deine Verbindung und versuche es erneut.',
      c_fallback: 'Dieser Kurs ist noch nicht auf {0} verfügbar. Die englische Version wird angezeigt.',
      'n:statistics': 'Statistik I', 'n:mathematics': 'Mathematik I', 'n:economics': 'Volkswirtschaft I', 'n:financial-accounting': 'Finanzbuchhaltung',
      'n:computer-models': 'Informatikmodelle I', 'n:management-ethics': 'Management und Ethik', 'n:mathematics-two': 'Mathematik II',
      'b:statistics': 'Daten beschreiben, Wahrscheinlichkeit, Zufallsvariablen, Schätzen und Testen, mit einer durchgerechneten Aufgabe zu jeder Formel.',
      'b:mathematics': 'Finanzmathematik, Funktionen, Ableitungen und Integrale, Schritt für Schritt neu aufgebaut.',
      'b:economics': 'Konsumenten- und Produzententheorie, Marktgleichgewicht und Steuern, mit einer Grafik, wo ein Bild hilft.',
      'b:financial-accounting': '38 Kapitel in 6 Teilen, 56 Übungen mit Lösungen, 157 Lernkarten und drei Probeprüfungen.',
      'b:computer-models': 'Excel-Berechnungsmodelle, relationale Datenbanken, SQL, Normalisierung, UML und Data Warehouses.',
      'b:management-ethics': 'Ethik und Gesellschaft, CSR und Innovation, Strategie und die Funktionen der Organisation.',
      'b:mathematics-two': 'Matrizen, lineare Gleichungssysteme, quadratische Formen, Eigenwerte, Input-Output, Taylor, freie und gebundene Extrema, mit 39 Übungen und drei alten Prüfungen.',
      'n:statistics-two': 'Statistik II',
      'n:programming': 'Programmierung',
      'b:statistics-two': 'Simple and multiple regression, R², t and F tests, then causal analysis: randomisation, difference-in-differences and event studies, with 26 step-by-step exercises and the May 2024 mock exam.',
      'b:programming': 'Python from the first line to NumPy, pandas, matplotlib and database access, with 31 trace-the-code exercises and the June 2015 and June 2016 exam papers.',
      'n:organisational-behavior': 'Organisationsverhalten',
      'b:organisational-behavior': 'People, groups and leadership: ten lessons with the studies and numbers the exam asks about, 33 case exercises, flashcards, a mini test and the 2019, 2020 and 2021 papers.',
      'n:economics-two': 'Volkswirtschaftslehre II',
      'b:economics-two': 'Markets, growth and the open economy: 14 topics, 37 step-by-step exercises, flashcards, a mini test and three practice papers.',
      'n:droit-entreprise': "Wirtschaftsrecht",
      'b:droit-entreprise': "The Swiss legal order and the law of obligations: 12 topics, 32 worked cases, flashcards, a mini test and three practice papers.",
      'Notes': 'Notizen', 'Exercises': 'Übungen', 'Flashcards': 'Lernkarten', 'Mini test': 'Mini-Test', 'Past papers': 'Alte Prüfungen', 'Exams': 'Prüfungen',
      'Study tools': 'Lernwerkzeuge', 'SQL blueprints': 'SQL-Vorlagen', 'SQL lab': 'SQL-Labor'
    },
    it: {
      signout: 'Esci', theme: 'Passa dal tema chiaro a quello scuro', language: 'Lingua',
      gate_h1: 'Il tuo primo anno a HEC, un solo account.',
      gate_p: 'Appunti, esercizi passo dopo passo, flashcard e vecchi esami cronometrati per tutti e sette i corsi. Crea un account o accedi per continuare.',
      f_courses: 'corsi', f_sections: 'sezioni', f_cards: 'flashcard di contabilità', f_papers: 'vecchi esami',
      welcome_back: 'Bentornato', create_your_account: 'Crea il tuo account', account: 'Account',
      login: 'Accedi', signup: 'Registrati', email: 'E-mail', password: 'Password', first_name: 'Nome', repeat_password: 'Ripeti la password',
      hint_pw: 'Almeno 8 caratteri.', create_account: 'Crea account', new_here: 'Sei nuovo?', create_an_account: 'Crea un account',
      already: 'Già registrato?', setup: "Il backend non è ancora collegato. Inserisci in site/config.js l'URL del progetto Supabase e la chiave anon.",
      hub_h1: 'HEC Losanna, primo anno',
      hub_p: 'Tutti i riassunti dei corsi in un unico posto. Ognuno ha appunti, esercizi passo dopo passo e un tracker dei progressi; la maggior parte aggiunge flashcard, mini test e vecchi esami cronometrati.',
      hello_back: 'Bentornato, {0}', hello: 'Benvenuto, {0}',
      unlock: 'Sblocca i corsi', pay_h2: 'Un solo pagamento apre tutti e sette i corsi',
      pay_p: 'Paga una volta con TWINT o carta. I corsi si aprono appena il pagamento è andato a buon fine, su ogni dispositivo da cui accedi.',
      one_time: 'una tantum, nessun abbonamento', pay_btn: 'Paga con TWINT',
      payment: 'Pagamento', confirming_h2: 'Conferma del pagamento…', confirming_p: 'Di solito bastano pochi secondi. I corsi si sbloccano da soli.',
      courses: 'Corsi', gridnote: 'Le barre di progresso mostrano le sezioni che hai segnato come «Capito» su questo dispositivo.',
      open: 'Apri →', locked: 'Si sblocca dopo il pagamento',
      e_invalid: 'E-mail o password errata.', e_exists: 'Esiste già un account con questa e-mail. Accedi invece.',
      e_confirm: "Conferma prima la tua e-mail: apri il link che ti abbiamo inviato, poi accedi.", e_rate: 'Troppi tentativi. Aspetta un minuto e riprova.',
      e_weak: 'Scegli una password più robusta.', e_net: 'Impossibile raggiungere il server. Controlla la connessione e riprova.', e_generic: 'Qualcosa è andato storto. Riprova.',
      no_backend: 'Il backend non è ancora collegato.', v_email: 'Inserisci un indirizzo e-mail valido.', v_pass: 'Inserisci la tua password.', v_name: 'Inserisci il tuo nome.',
      v_len: 'Scegli una password di almeno 8 caratteri.', v_match: 'Le due password non coincidono.',
      confirm_sent: 'Quasi fatto: abbiamo inviato un link di conferma a {0}. Aprilo, poi accedi qui.',
      pay_fail: 'Impossibile avviare il pagamento. Riprova tra un attimo.', pay_wait: 'Non abbiamo ancora ricevuto il pagamento. Se hai pagato, aspetta un minuto e ricarica la pagina. Non verrà addebitato nulla due volte.',
      pay_cancel: 'Il pagamento è stato annullato. Non ti è stato addebitato nulla.', load_fail: 'Impossibile caricare il servizio di accesso. Controlla la connessione e ricarica.',
      c_opening: 'Apertura del corso…', c_back: 'Torna a tutti i corsi', c_invalid: 'Questo link del corso non è valido.', c_noauth: 'Impossibile caricare il servizio di accesso. Ricarica la pagina.',
      c_missing: 'Questo corso non è ancora stato caricato.', c_fail: 'Impossibile aprire il corso. Riprova tra un attimo.', c_net: 'Impossibile aprire il corso. Controlla la connessione e riprova.',
      c_fallback: 'Questo corso non è ancora disponibile in {0}. Viene mostrata la versione inglese.',
      'n:statistics': 'Statistica I', 'n:mathematics': 'Matematica I', 'n:economics': 'Economia I', 'n:financial-accounting': 'Contabilità finanziaria',
      'n:computer-models': 'Modelli informatici I', 'n:management-ethics': 'Management ed etica', 'n:mathematics-two': 'Matematica II',
      'b:statistics': 'Descrizione dei dati, probabilità, variabili casuali, stima e test, con un calcolo svolto per ogni formula.',
      'b:mathematics': 'Matematica finanziaria, funzioni, derivate e integrali, ricostruiti un piccolo passo alla volta.',
      'b:economics': 'Teoria del consumatore e del produttore, equilibrio di mercato e imposte, con una figura dove un’immagine aiuta.',
      'b:financial-accounting': '38 capitoli in 6 parti, 56 esercizi con soluzioni, 157 flashcard e tre esami di prova.',
      'b:computer-models': 'Modelli di calcolo in Excel, database relazionali, SQL, normalizzazione, UML e data warehouse.',
      'b:management-ethics': "Etica e società, CSR e innovazione, strategia e funzioni dell'organizzazione.",
      'b:mathematics-two': 'Matrici, sistemi lineari, forme quadratiche, autovalori, input-output, Taylor, estremi liberi e vincolati, con 39 esercizi e tre vecchi esami.',
      'n:statistics-two': 'Statistica II',
      'n:programming': 'Programmazione',
      'b:statistics-two': 'Simple and multiple regression, R², t and F tests, then causal analysis: randomisation, difference-in-differences and event studies, with 26 step-by-step exercises and the May 2024 mock exam.',
      'b:programming': 'Python from the first line to NumPy, pandas, matplotlib and database access, with 31 trace-the-code exercises and the June 2015 and June 2016 exam papers.',
      'n:organisational-behavior': 'Comportamento organizzativo',
      'b:organisational-behavior': 'People, groups and leadership: ten lessons with the studies and numbers the exam asks about, 33 case exercises, flashcards, a mini test and the 2019, 2020 and 2021 papers.',
      'n:economics-two': 'Economia II',
      'b:economics-two': 'Markets, growth and the open economy: 14 topics, 37 step-by-step exercises, flashcards, a mini test and three practice papers.',
      'n:droit-entreprise': "Diritto d’impresa",
      'b:droit-entreprise': "The Swiss legal order and the law of obligations: 12 topics, 32 worked cases, flashcards, a mini test and three practice papers.",
      'Notes': 'Appunti', 'Exercises': 'Esercizi', 'Flashcards': 'Flashcard', 'Mini test': 'Mini test', 'Past papers': 'Vecchi esami', 'Exams': 'Esami',
      'Study tools': 'Strumenti di studio', 'SQL blueprints': 'Modelli SQL', 'SQL lab': 'Laboratorio SQL'
    }
  };

  function stored() { try { return localStorage.getItem('hec_lang'); } catch (e) { return null; } }
  function pick() {
    var s = stored();
    if (s && D[s]) return s;
    var n = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').slice(0, 2).toLowerCase();
    return D[n] ? n : 'en';
  }
  var lang = pick();
  function t(key) {
    var s = (D[lang] && D[lang][key]) || D.en[key] || key;
    for (var i = 1; i < arguments.length; i++) s = s.split('{' + (i - 1) + '}').join(arguments[i]);
    return s;
  }
  function apply(root) {
    root = root || document;
    document.documentElement.lang = lang;
    root.querySelectorAll('[data-i18n]').forEach(function (e) { e.textContent = t(e.getAttribute('data-i18n')); });
    root.querySelectorAll('[data-i18n-label]').forEach(function (e) { e.setAttribute('aria-label', t(e.getAttribute('data-i18n-label'))); });
    root.querySelectorAll('.hec-lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
  }
  function setLang(code, noReload) {
    if (!D[code]) return;
    lang = code;
    try { localStorage.setItem('hec_lang', code); } catch (e) { }
    apply();
    if (window.HEC_ON_LANG) window.HEC_ON_LANG(code);
  }
  function switcher() {
    var d = document.createElement('div');
    d.className = 'hec-lang'; d.setAttribute('role', 'group'); d.setAttribute('aria-label', t('language'));
    LANGS.forEach(function (l) {
      var b = document.createElement('button'); b.type = 'button'; b.dataset.lang = l[0]; b.textContent = l[1]; b.title = l[2];
      b.setAttribute('aria-pressed', String(l[0] === lang));
      b.addEventListener('click', function () { setLang(l[0]); });
      d.appendChild(b);
    });
    return d;
  }
  function name(code) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i][0] === code) return LANGS[i][2]; return code; }
  window.HEC_I18N = { get lang() { return lang; }, t: t, setLang: setLang, apply: apply, switcher: switcher, name: name, langs: LANGS };
})();
