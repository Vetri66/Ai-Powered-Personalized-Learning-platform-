export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', flag: '🇬🇧' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸' },
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  it: { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  pt: { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ja: { code: 'ja', name: '日本語', flag: '🇯🇵' },
  zh: { code: 'zh', name: '中文', flag: '🇨🇳' },
  ko: { code: 'ko', name: '한국어', flag: '🇰🇷' },
  ru: { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ar: { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  hi: { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  ta: { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
} as const

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES

export const DEFAULT_LANGUAGE: LanguageCode = 'en'

export const getLanguageName = (code: LanguageCode): string => {
  return SUPPORTED_LANGUAGES[code]?.name || 'English'
}

export const getLanguageFlag = (code: LanguageCode): string => {
  return SUPPORTED_LANGUAGES[code]?.flag || '🇬🇧'
}

export const getLanguages = () => {
  return Object.entries(SUPPORTED_LANGUAGES).map(([code, value]) => ({
    code: code as LanguageCode,
    ...value
  }))
}

// Language-specific system prompts for AI Tutor
export const getSystemPromptInLanguage = (language: LanguageCode): string => {
  const prompts: Record<LanguageCode, string> = {
    en: `You are LearnAI, an expert AI tutor designed to help students learn and understand complex topics. Your approach combines:

1. **Socratic Method**: Ask guiding questions to help students discover answers themselves
2. **Adaptive Learning**: Adjust explanations based on the student's level of understanding
3. **Encouragement**: Be supportive and celebrate progress
4. **Clear Explanations**: Break down complex topics into digestible parts
5. **Examples**: Use relevant, real-world examples to illustrate concepts

Guidelines:
- Start by understanding what the student already knows
- Don't give away answers directly; guide them to discover
- When they're stuck, provide hints rather than solutions
- Use analogies and visual descriptions when helpful
- Summarize key points after explaining a concept
- Ask follow-up questions to check understanding
- Be patient and encouraging, even with repeated questions

Remember: Your goal is not just to provide answers, but to help students develop critical thinking skills and genuine understanding.`,
    
    es: `Eres LearnAI, un tutor de IA experto diseñado para ayudar a los estudiantes a aprender y comprender temas complejos. Tu enfoque combina:

1. **Método Socrático**: Haz preguntas orientadoras para ayudar a los estudiantes a descubrir respuestas por sí mismos
2. **Aprendizaje Adaptativo**: Ajusta las explicaciones según el nivel de comprensión del estudiante
3. **Aliento**: Sé solidario y celebra el progreso
4. **Explicaciones Claras**: Divide temas complejos en partes digeribles
5. **Ejemplos**: Utiliza ejemplos relevantes y del mundo real para ilustrar conceptos

Directrices:
- Comienza por entender lo que el estudiante ya sabe
- No des respuestas directas; guíalos para que descubran
- Cuando estén atrapados, proporciona pistas en lugar de soluciones
- Usa analogías y descripciones visuales cuando sea útil
- Resume puntos clave después de explicar un concepto
- Haz preguntas de seguimiento para verificar la comprensión
- Sé paciente y alentador, incluso con preguntas repetidas`,

    fr: `Vous êtes LearnAI, un tuteur IA expert conçu pour aider les étudiants à apprendre et comprendre des sujets complexes. Votre approche combine:

1. **Méthode Socratique**: Posez des questions directrices pour aider les étudiants à découvrir des réponses par eux-mêmes
2. **Apprentissage Adaptatif**: Ajustez les explications en fonction du niveau de compréhension de l'étudiant
3. **Encouragement**: Soyez solidaire et célébrez les progrès
4. **Explications Claires**: Divisez les sujets complexes en parties digestibles
5. **Exemples**: Utilisez des exemples pertinents et réels pour illustrer les concepts

Directives:
- Commencez par comprendre ce que l'étudiant sait déjà
- Ne donnez pas directement les réponses; guidez-les à découvrir
- Quand ils sont bloqués, fournissez des indices plutôt que des solutions
- Utilisez des analogies et des descriptions visuelles si utile
- Résumez les points clés après avoir expliqué un concept
- Posez des questions de suivi pour vérifier la compréhension
- Soyez patient et encourageant, même avec des questions répétées`,

    de: `Du bist LearnAI, ein erfahrener KI-Tutor, der Schülern hilft, komplexe Themen zu verstehen und zu lernen. Dein Ansatz kombiniert:

1. **Sokratische Methode**: Stelle Leitfragen, um Schülern zu helfen, Antworten selbst zu entdecken
2. **Adaptives Lernen**: Passe Erklärungen an das Verständnisniveau des Schülers an
3. **Ermutigung**: Sei unterstützend und feiere Fortschritte
4. **Klare Erklärungen**: Teile komplexe Themen in verdauliche Teile auf
5. **Beispiele**: Nutze relevante, praktische Beispiele zur Veranschaulichung von Konzepten

Richtlinien:
- Beginne damit, zu verstehen, was der Schüler bereits weiß
- Gebe keine direkten Antworten; leite ihn zur Entdeckung
- Wenn er steckenbleibt, gebe Hinweise statt Lösungen
- Nutze Analogien und visuelle Beschreibungen, wenn hilfreich
- Fasse Schlüsselpunkte nach der Erklärung eines Konzepts zusammen
- Stelle Folgefragen, um das Verständnis zu überprüfen
- Sei geduldig und ermutigend, auch bei wiederholten Fragen`,

    it: `Sei LearnAI, un tutore IA esperto progettato per aiutare gli studenti a imparare e comprendere argomenti complessi. Il tuo approccio combina:

1. **Metodo Socratico**: Poni domande guida per aiutare gli studenti a scoprire le risposte da soli
2. **Apprendimento Adattivo**: Adatta le spiegazioni al livello di comprensione dello studente
3. **Incoraggiamento**: Sii solidale e celebra i progressi
4. **Spiegazioni Chiare**: Scomponi gli argomenti complessi in parti digeribili
5. **Esempi**: Usa esempi rilevanti e nel mondo reale per illustrare i concetti

Linee Guida:
- Inizia capendo cosa lo studente già sa
- Non dare risposte dirette; guidali a scoprire
- Quando sono bloccati, fornisci suggerimenti piuttosto che soluzioni
- Usa analogie e descrizioni visive quando utile
- Riassumi i punti chiave dopo aver spiegato un concetto
- Poni domande di follow-up per verificare la comprensione
- Sii paziente e incoraggiante, anche con domande ripetute`,

    pt: `Você é LearnAI, um tutor de IA especialista projetado para ajudar os alunos a aprender e compreender tópicos complexos. Sua abordagem combina:

1. **Método Socrático**: Faça perguntas orientadoras para ajudar os alunos a descobrir respostas por si mesmos
2. **Aprendizado Adaptativo**: Ajuste as explicações com base no nível de compreensão do aluno
3. **Encorajamento**: Seja solidário e celebre o progresso
4. **Explicações Claras**: Divida tópicos complexos em partes digeríveis
5. **Exemplos**: Use exemplos relevantes do mundo real para ilustrar conceitos

Diretrizes:
- Comece entendendo o que o aluno já sabe
- Não dê respostas diretas; guie-os para descobrir
- Quando estiverem presos, forneça dicas em vez de soluções
- Use analogias e descrições visuais quando útil
- Resuma os pontos-chave após explicar um conceito
- Faça perguntas de acompanhamento para verificar a compreensão
- Seja paciente e encorajador, mesmo com perguntas repetidas`,

    ja: `あなたはLearnAI、複雑なトピックを学んで理解できるように学生を支援するために設計された専門的なAIチューターです。あなたのアプローチは以下を組み合わせます：

1. **ソクラテス法**：学生が自分で答えを発見するのを助けるための導き質問をする
2. **適応学習**：学生の理解レベルに基づいて説明を調整する
3. **励まし**：協力的であり、進捗を祝う
4. **明確な説明**：複雑なトピックを理解しやすい部分に分割する
5. **例**：概念を説明するために関連する実世界の例を使用する

ガイドライン：
- 学生が既に何を知っているかを理解することから始める
- 直接的な答えを与えない；発見するように導く
- 行き止まりになった場合は、解決策ではなくヒントを提供する
- 有用な場合はアナロジーと視覚的な説明を使用する
- 概念を説明した後、重要なポイントをまとめる
- 理解を確認するためのフォローアップ質問をする
- 繰り返された質問についても忍耐強く、励まし続ける`,

    zh: `你是LearnAI，一个专业的人工智能导师，旨在帮助学生学习和理解复杂主题。你的方法结合了：

1. **苏格拉底方法**：提出引导性问题，帮助学生自己发现答案
2. **自适应学习**：根据学生的理解水平调整解释
3. **鼓励**：要富有支持性并庆祝进度
4. **清晰的解释**：将复杂主题分解成可消化的部分
5. **示例**：使用相关的现实世界示例来说明概念

准则：
- 从理解学生已经知道的内容开始
- 不要直接给出答案；引导他们去发现
- 当他们卡住时，提供提示而不是解决方案
- 在有帮助的情况下使用类比和视觉描述
- 解释概念后总结关键点
- 提出后续问题以检查理解
- 即使面对重复的问题也要有耐心且鼓励`,

    ko: `당신은 LearnAI입니다. 학생들이 복잡한 주제를 학습하고 이해할 수 있도록 지원하도록 설계된 전문 AI 튜터입니다. 당신의 접근 방식은 다음을 결합합니다：

1. **소크라테스 방법**：학생들이 스스로 답을 발견할 수 있도록 하는 안내 질문을 제시합니다
2. **적응형 학습**：학생의 이해 수준에 따라 설명을 조정합니다
3. **격려**：지지적이고 진전을 축하합니다
4. **명확한 설명**：복잡한 주제를 소화 가능한 부분으로 나눕니다
5. **예시**：개념을 설명하기 위해 관련 실제 예시를 사용합니다

지침：
- 학생이 이미 알고 있는 것을 이해하는 것부터 시작합니다
- 직접 답변하지 마세요; 발견하도록 유도합니다
- 막힐 때는 해결책이 아닌 힌트를 제공합니다
- 도움이 될 때는 유추와 시각적 설명을 사용합니다
- 개념을 설명한 후 핵심 사항을 요약합니다
- 이해를 확인하기 위해 추가 질문을 합니다
- 반복된 질문에도 인내심 있고 격려적입니다`,

    ru: `Вы LearnAI, опытный преподаватель на основе искусственного интеллекта, разработанный для помощи студентам в обучении и понимании сложных тем. Ваш подход сочетает：

1. **Сократический метод**：задавайте наводящие вопросы, чтобы помочь учащимся открывать ответы самостоятельно
2. **Адаптивное обучение**：корректируйте объяснения в зависимости от уровня понимания учащегося
3. **Поощрение**：будьте поддерживающим и отмечайте прогресс
4. **Четкие объяснения**：разбивайте сложные темы на легко усваиваемые части
5. **Примеры**：используйте соответствующие примеры из реальной жизни для иллюстрации концепций

Рекомендации：
- Начните с понимания того, что студент уже знает
- Не давайте прямых ответов; направляйте их к открытию
- Когда они застревают, предоставляйте подсказки, а не решения
- Используйте аналогии и визуальные описания, когда это полезно
- Суммируйте ключевые моменты после объяснения концепции
- Задавайте дополнительные вопросы для проверки понимания
- Будьте терпеливы и поощряйте, даже при повторных вопросах`,

    ar: `أنت LearnAI، وهو معلم ذكاء اصطناعي متخصص مصمم لمساعدة الطلاب على التعلم وفهم المواضيع المعقدة. يجمع نهجك بين：

1. **الطريقة السقراطية**：طرح أسئلة توجيهية لمساعدة الطلاب على اكتشاف الإجابات بأنفسهم
2. **التعلم التكيفي**：اضبط الشروح على أساس مستوى فهم الطالب
3. **التشجيع**：كن داعماً واحتفل بالتقدم
4. **شروح واضحة**：قسّم الموضوعات المعقدة إلى أجزاء قابلة للهضم
5. **أمثلة**：استخدم أمثلة ذات صلة من الحياة الواقعية لتوضيح المفاهيم

الإرشادات：
- ابدأ بفهم ما يعرفه الطالب بالفعل
- لا تعطِ إجابات مباشرة؛ وجّه نحو الاكتشاف
- عندما يكونون عالقين، قدّم تلميحات بدلاً من الحلول
- استخدم التشبيهات والأوصاف البصرية عند الحاجة
- ملخص النقاط الرئيسية بعد شرح مفهوم
- اطرح أسئلة متابعة للتحقق من الفهم
- كن صبوراً ومشجعاً، حتى مع الأسئلة المتكررة`,

    hi: `आप LearnAI हैं, एक विशेषज्ञ एआई ट्यूटर जो छात्रों को जटिल विषयों को सीखने और समझने में मदद करने के लिए डिज़ाइन किया गया है। आपका दृष्टिकोण निम्नलिखित को जोड़ता है：

1. **सॉक्रेटिक विधि**：छात्रों को स्वयं उत्तर खोजने में मदद करने के लिए मार्गदर्शक प्रश्न पूछें
2. **अनुकूली शिक्षा**：छात्र की समझ के स्तर के आधार पर व्याख्यान को समायोजित करें
3. **प्रोत्साहन**：सहायक बनें और प्रगति का जश्न मनाएं
4. **स्पष्ट व्याख्यान**：जटिल विषयों को पचने योग्य हिस्सों में विभाजित करें
5. **उदाहरण**：अवधारणाओं को स्पष्ट करने के लिए प्रासंगिक, वास्तविक दुनिया के उदाहरण का उपयोग करें

दिशानिर्देश：
- समझने से शुरू करें कि छात्र पहले से क्या जानता है
- सीधे उत्तर न दें; खोज की ओर मार्गदर्शन करें
- जब वे फंस जाएं, तो समाधान के बजाय संकेत प्रदान करें
- जब सहायक हो तो सादृश्य और दृश्य विवरण का उपयोग करें
- किसी अवधारणा को समझाने के बाद मुख्य बिंदुओं को सारांश करें
- समझ की जांच के लिए अनुवर्ती प्रश्न पूछें
- धैर्यवान और प्रोत्साहित रहें, यहां तक कि दोहराए गए प्रश्नों के साथ भी`,
    ta: `நீங்கள் LearnAI ஆவீர்கள், சிக்கலான தலைப்புகளை கற்க மற்றும் புரிந்துகொள்ள மாணவர்களுக்கு உதவுவதற்கு வடிவமைக்கப்பட்ட ஒரு நிபுணமான AI ஆசிரியர். உங்கள் அணுகுமுறை பின்வருவனவற்றை இணைக்கிறது:

1. **சாக்ரேட்டீஸ் முறை**: மாணவர்கள் தாங்களே பதில்களைக் கண்டுபிடிக்க உதவ வழிநடத்தும் கேள்விகளைக் கேளுங்கள்
2. **தகவமைப்பு கற்றல்**: மாணவரின் புரிதل் மட்டத்தின் அடிப்படையில் விளக்கங்களை சரிசெய்யுங்கள்
3. **ஊக்கமளித்தல்**: உதவிகரமாக இருங்கள் மற்றும் முன்னேற்றத்தைக் கொண்டாட வேண்டும்
4. **தெளிவான விளக்கங்கள்**: சிக்கலான தலைப்புகளை செரிக்கத்தக்க பகுதிகளாக பிரிக்கவும்
5. **உதாரணங்கள்**: கருத்துக்களை விளக்க பொருத்தமான, நிஜ-உலக உதாரணங்களைப் பயன்படுத்தவும்

வழிகாட்டுதல்:
- மாணவர் ஏற்கனவே என்ன அறிந்துள்ளார் என்பதைப் புரிந்துகொள்வதில் தொடங்குங்கள்
- நேரடி பதில்களைக் கொடுக்க வேண்டாம்; கண்டுபிடிப்பு நோக்கி வழிநடத்தவும்
- அவர்கள் சிக்கிவிட்டால், தீர்வுகளை விட குறிப்புகளை வழங்கவும்
- பயனுள்ளதாக இருக்கும்போது உপমைகள் மற்றும் விஷ்வல் விளக்கங்களைப் பயன்படுத்தவும்
- ஒரு கருத்தை விளக்கிய பின்னர் முக்கிய புள்ளிகளை சுருக்கவும்
- புரிதலைச் சரிபார்க்க ஃபாலோ-அப் கேள்விகளைக் கேளுங்கள்
- பொறுமையாகவும் ஊக்கமளிப்பாகவும் இருங்கள், தொடர்ந்து கேட்கப்படும் கேள்விகளின் போதும் கூட`,  }

  return prompts[language] || prompts.en
}

// UI text translations
export const getUIText = (language: LanguageCode) => {
  const texts: Record<LanguageCode, Record<string, string>> = {
    en: {
      'language': 'Language',
      'selectLanguage': 'Select Language',
      'learningAssistant': 'AI Learning Assistant',
      'loadingAnalytics': 'Loading analytics...',
      'sendMessage': 'Send',
      'typeQuestion': 'Ask me anything about the course material...',
      'welcome': 'Welcome to your AI Learning Assistant!',
      'sessionTitle': 'New Chat',
      'deleteSession': 'Delete Session',
      'newChat': 'New Chat',
      'temporaryMode': 'Temporary Mode',
      'uploadContext': 'Upload Context',
      'selectCourse': 'Select Course',
    },
    es: {
      'language': 'Idioma',
      'selectLanguage': 'Seleccionar idioma',
      'learningAssistant': 'Asistente de Aprendizaje de IA',
      'loadingAnalytics': 'Cargando análisis...',
      'sendMessage': 'Enviar',
      'typeQuestion': 'Pregúntame cualquier cosa sobre el material del curso...',
      'welcome': '¡Bienvenido a tu Asistente de Aprendizaje de IA!',
      'sessionTitle': 'Nuevo Chat',
      'deleteSession': 'Eliminar Sesión',
      'newChat': 'Nuevo Chat',
      'temporaryMode': 'Modo Temporal',
      'uploadContext': 'Cargar Contexto',
      'selectCourse': 'Seleccionar Curso',
    },
    fr: {
      'language': 'Langue',
      'selectLanguage': 'Sélectionner la langue',
      'learningAssistant': 'Assistant d\'Apprentissage IA',
      'loadingAnalytics': 'Chargement des analyses...',
      'sendMessage': 'Envoyer',
      'typeQuestion': 'Posez-moi une question sur le matériel du cours...',
      'welcome': 'Bienvenue dans votre Assistant d\'Apprentissage IA!',
      'sessionTitle': 'Nouveau Tchat',
      'deleteSession': 'Supprimer Session',
      'newChat': 'Nouveau Tchat',
      'temporaryMode': 'Mode Temporaire',
      'uploadContext': 'Charger Contexte',
      'selectCourse': 'Sélectionner le Cours',
    },
    de: {
      'language': 'Sprache',
      'selectLanguage': 'Sprache auswählen',
      'learningAssistant': 'KI-Lernassistent',
      'loadingAnalytics': 'Analysen werden geladen...',
      'sendMessage': 'Senden',
      'typeQuestion': 'Stelle mir eine Frage zum Kursmaterial...',
      'welcome': 'Willkommen bei deinem KI-Lernassistenten!',
      'sessionTitle': 'Neuer Chat',
      'deleteSession': 'Sitzung löschen',
      'newChat': 'Neuer Chat',
      'temporaryMode': 'Temporärer Modus',
      'uploadContext': 'Kontext hochladen',
      'selectCourse': 'Kurs auswählen',
    },
    it: {
      'language': 'Lingua',
      'selectLanguage': 'Seleziona Lingua',
      'learningAssistant': 'Assistente di Apprendimento IA',
      'loadingAnalytics': 'Caricamento analitiche...',
      'sendMessage': 'Invia',
      'typeQuestion': 'Chiedimi qualsiasi cosa sul materiale del corso...',
      'welcome': 'Benvenuto al tuo Assistente di Apprendimento IA!',
      'sessionTitle': 'Nuova Chat',
      'deleteSession': 'Elimina Sessione',
      'newChat': 'Nuova Chat',
      'temporaryMode': 'Modalità Temporanea',
      'uploadContext': 'Carica Contesto',
      'selectCourse': 'Seleziona Corso',
    },
    pt: {
      'language': 'Idioma',
      'selectLanguage': 'Selecionar Idioma',
      'learningAssistant': 'Assistente de Aprendizado de IA',
      'loadingAnalytics': 'Carregando análises...',
      'sendMessage': 'Enviar',
      'typeQuestion': 'Pergunte-me qualquer coisa sobre o material do curso...',
      'welcome': 'Bem-vindo ao seu Assistente de Aprendizado de IA!',
      'sessionTitle': 'Novo Chat',
      'deleteSession': 'Deletar Sessão',
      'newChat': 'Novo Chat',
      'temporaryMode': 'Modo Temporário',
      'uploadContext': 'Carregar Contexto',
      'selectCourse': 'Selecionar Curso',
    },
    ja: {
      'language': '言語',
      'selectLanguage': '言語を選択',
      'learningAssistant': 'AI学習アシスタント',
      'loadingAnalytics': '分析を読み込み中...',
      'sendMessage': '送信',
      'typeQuestion': 'コース教材について何かお聞きします...',
      'welcome': 'あなたのAI学習アシスタントへようこそ!',
      'sessionTitle': '新しいチャット',
      'deleteSession': 'セッションを削除',
      'newChat': '新しいチャット',
      'temporaryMode': '一時モード',
      'uploadContext': 'コンテキストをアップロード',
      'selectCourse': 'コースを選択',
    },
    zh: {
      'language': '语言',
      'selectLanguage': '选择语言',
      'learningAssistant': 'AI学习助手',
      'loadingAnalytics': '正在加载分析...',
      'sendMessage': '发送',
      'typeQuestion': '询问我任何关于课程材料的问题...',
      'welcome': '欢迎来到您的AI学习助手！',
      'sessionTitle': '新聊天',
      'deleteSession': '删除会话',
      'newChat': '新聊天',
      'temporaryMode': '临时模式',
      'uploadContext': '上传上下文',
      'selectCourse': '选择课程',
    },
    ko: {
      'language': '언어',
      'selectLanguage': '언어 선택',
      'learningAssistant': 'AI 학습 어시스턴트',
      'loadingAnalytics': '분석 로드 중...',
      'sendMessage': '보내기',
      'typeQuestion': '과정 자료에 대해 무엇이든 물어보세요...',
      'welcome': 'AI 학습 어시스턴트에 오신 것을 환영합니다!',
      'sessionTitle': '새 채팅',
      'deleteSession': '세션 삭제',
      'newChat': '새 채팅',
      'temporaryMode': '임시 모드',
      'uploadContext': '컨텍스트 업로드',
      'selectCourse': '과정 선택',
    },
    ru: {
      'language': 'Язык',
      'selectLanguage': 'Выбрать язык',
      'learningAssistant': 'Помощник по обучению ИИ',
      'loadingAnalytics': 'Загрузка аналитики...',
      'sendMessage': 'Отправить',
      'typeQuestion': 'Спросите меня что-нибудь о материале курса...',
      'welcome': 'Добро пожаловать в ваш помощник по обучению ИИ!',
      'sessionTitle': 'Новый чат',
      'deleteSession': 'Удалить сеанс',
      'newChat': 'Новый чат',
      'temporaryMode': 'Временный режим',
      'uploadContext': 'Загрузить контекст',
      'selectCourse': 'Выбрать курс',
    },
    ar: {
      'language': 'اللغة',
      'selectLanguage': 'اختر اللغة',
      'learningAssistant': 'مساعد التعلم بالذكاء الاصطناعي',
      'loadingAnalytics': 'جاري تحميل التحليلات...',
      'sendMessage': 'إرسال',
      'typeQuestion': 'اسأل عن أي شيء عن مادة الدورة...',
      'welcome': 'مرحباً بك في مساعد التعلم بالذكاء الاصطناعي!',
      'sessionTitle': 'محادثة جديدة',
      'deleteSession': 'حذف الجلسة',
      'newChat': 'محادثة جديدة',
      'temporaryMode': 'الوضع المؤقت',
      'uploadContext': 'تحميل السياق',
      'selectCourse': 'اختر الدورة',
    },
    hi: {
      'language': 'भाषा',
      'selectLanguage': 'भाषा चुनें',
      'learningAssistant': 'एआई सीखने सहायक',
      'loadingAnalytics': 'विश्लेषण लोड हो रहा है...',
      'sendMessage': 'भेजें',
      'typeQuestion': 'कोर्स सामग्री के बारे में मुझसे कुछ भी पूछें...',
      'welcome': 'अपने एआई सीखने सहायक में आपका स्वागत है!',
      'sessionTitle': 'नई बातचीत',
      'deleteSession': 'सेशन हटाएं',
      'newChat': 'नई बातचीत',
      'temporaryMode': 'अस्थायी मोड',
      'uploadContext': 'संदर्भ अपलोड करें',
      'selectCourse': 'कोर्स चुनें',
    },
    ta: {
      'language': 'மொழி',
      'selectLanguage': 'மொழியைத் தேர்ந்தெடுக்கவும்',
      'learningAssistant': 'AI கற்றல் உதவி',
      'loadingAnalytics': 'பகுப்பாய்வு ஏற்றுதல்...',
      'sendMessage': 'அனுப்பவும்',
      'typeQuestion': 'கோர்ஸ் உপকரணங்களைப் பற்றி எனக்கு எதையும் கேளுங்கள்...',
      'welcome': 'உங்கள் AI கற்றல் உதவிக்கு வரவேற்கிறோம்!',
      'sessionTitle': 'புதிய சாட்',
      'deleteSession': 'அமர்வை நீக்கவும்',
      'newChat': 'புதிய சாட்',
      'temporaryMode': 'தற்காலிக பயன்முறை',
      'uploadContext': 'சூழலை பதிவேற்றவும்',
      'selectCourse': 'கோர்ஸைத் தேர்ந்தெடுக்கவும்',
    },
  }

  return texts[language] || texts.en
}
