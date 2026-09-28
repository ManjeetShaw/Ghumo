const { generateText } = require('./geminiClient');

// Forces Gemini to return exactly this shape - no parsing guesswork.
const STORY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    characterDescription: {
      type: 'STRING',
      description:
        "A short, specific, fixed description of the main character's appearance - hair, clothing, colors, distinguishing features. This exact description will be repeated on every page's image prompt so the character looks the same throughout the book. Be concrete (e.g. 'a girl with a short red buzzcut, a patched teal windbreaker, steel-toed boots, a brass compass necklace') not vague.",
    },
    pages: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          pageNumber: { type: 'INTEGER' },
          text: {
            type: 'STRING',
            description: '2-4 sentences of polished, publisher-quality prose for this page.',
          },
          imagePrompt: {
            type: 'STRING',
            description:
              "A complete visual description of THIS page's scene in English detailing the main character performing a concrete action in a vivid environment with lighting and camera angle. Example: 'A brave young protagonist in a teal windbreaker standing on a mountain peak at sunrise, holding a glowing star medallion, wide angle cinematic lighting'. No text or letters in the image.",
          },
        },
        required: ['pageNumber', 'text', 'imagePrompt'],
      },
    },
  },
  required: ['title', 'characterDescription', 'pages'],
};

function buildPrompt(userIdea, pageCount, language = 'English') {
  return `You are a World-Class Master Storyteller and Award-Winning Author (Pixar, Studio Ghibli, NYT Bestseller caliber). Your writing is captivating, deeply emotional, cinematic, and rich with sensory detail.

A user has pitched this story dream/idea:
"${userIdea}"

Create an epic, complete illustrated storybook with exactly ${pageCount} pages based on this prompt.

LANGUAGE REQUIREMENT:
- The story "title" and each page's narrative "text" MUST be written fluently in ${language}.
- The "characterDescription" and "imagePrompt" fields MUST be written in detailed English to ensure hyper-accurate AI image rendering.

MASTER STORYTELLING CRAFT RULES:
1. HOOK IMMEDIATELY: Start Page 1 right in the middle of visceral action or vivid sensation. No cliché openings like "Once upon a time" or slow scene setup.
2. SHOW, DON'T TELL: Paint rich atmospheric imagery—sound, color, temperature, physical touch. Use concrete nouns and verbs over abstract concepts.
3. SENTENCE DYNAMICS: Alternate between short, heart-pounding beats and poetic, sweeping prose.
4. NO CLICHÉ OR MORALIZING: Do not use preachy moral statements, lesson summaries, or cliché AI wrap-up phrases.
5. CHARACTER CONSISTENCY: Invent ONE visually iconic main character. In "characterDescription", provide a fixed, concrete physical description in English (exact clothing, hair color/style, eye color, signature accessories, age/expression) that will be used across every page image.
6. PAGE IMAGE PROMPT: For each page, write a standalone cinematic image prompt in English detailing camera angle (e.g. dramatic low-angle shot, cinematic wide lens), lighting (e.g. volumetric golden hour, bioluminescent glow), action, environment, and mood.
7. SATISFYING CLIMAX & CONCRETE ENDING: Build a cohesive narrative arc across all ${pageCount} pages.
   The final page must follow every rule above just as strictly as page 1. Do not summarize the story's theme or moral. Do not use abstract words like triumph, courage, legend, legacy, victory, or wonder to describe the outcome. End on one last concrete, specific, sensory image or action instead - something the reader can picture, not a feeling being named.

FORMAT PER PAGE:
- "pageNumber": Integer (1 to ${pageCount})
- "text": 3-5 sentences of breathtaking, publisher-quality prose in ${language}.
- "imagePrompt": Detailed cinematic visual scene description in English for image generation.

Return ONLY valid JSON matching the schema.`;
}

/**
 * Fallback story generator for when Gemini API hits quota limits (429) or is unavailable.
 * Delivers cinematic, multi-sentence stories customized to the user's idea in 8 languages.
 */
function generateCreativeFallbackStory(userIdea, pageCount = 4, language = 'English') {
  const cleanIdea = userIdea.trim();
  const words = cleanIdea.replace(/[^\w\s]/gi, '').split(/\s+/).filter(Boolean);
  const coreConcept = words.slice(0, 6).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || 'The Great Adventure';

  const titleTemplates = {
    Spanish: `La Odisea Extraordinaria: ${coreConcept}`,
    French: `L'Épopée Fantastique: ${coreConcept}`,
    German: `Das Chronik-Abenteuer: ${coreConcept}`,
    Hindi: `${coreConcept}: एक महान साहसिक कहानी`,
    Bengali: `${coreConcept}: এক মায়াবী অ্যাডভেঞ্চার`,
    Japanese: `${coreConcept} - 運命の物語`,
    Italian: `La Leggenda Incantata: ${coreConcept}`,
    Portuguese: `A Saga Lendária: ${coreConcept}`,
    English: `The Legend of ${coreConcept}`,
  };

  const title = titleTemplates[language] || titleTemplates.English;
  const characterDescription = 'A brave young protagonist with striking amber eyes, wearing an embroidered midnight-blue jacket, a brass compass medallion, leather boots, and carrying a glowing starlight lantern';

  const total = Math.max(3, Math.min(12, pageCount));
  const pages = [];

  for (let i = 1; i <= total; i++) {
    let text = '';
    let imagePrompt = '';

    if (i === 1) {
      if (language === 'Spanish') {
        text = `El aire vibraba con electricidad cuando la chispa de ${cleanIdea} encendió el cielo nocturno. Sin mirar atrás, el destino dio su primer paso hacia lo desconocido. El viento soplaba con fuerza revelando antiguas promesas.`;
      } else if (language === 'French') {
        text = `L'air vibrait d'électricité lorsque l'étincelle de ${cleanIdea} a enflammé le ciel nocturne. Sans regarder en arrière, le destin a franchi son premier pas vers l'inconnu. Le vent soufflait en révélant de précieuses promesses.`;
      } else if (language === 'German') {
        text = `Die Luft vibrierte vor Spannung, als der Funke von ${cleanIdea} den Nachthimmel erhellte. Ohne den Blick zurück folgte das Schicksal dem ersten Schritt ins Unbekannte. Ein kühler Wind trug uralte Legenden herbei.`;
      } else if (language === 'Hindi') {
        text = `रात के अंधेरे में ${cleanIdea} की एक अनोखी चमक ने पूरी दुनिया को चमका दिया। बिना किसी डर के, साहसी कदम अज्ञात रास्तों की ओर बढ़ चले। ठंडी हवाएं एक महान रहस्य की गवाही दे रही थीं।`;
      } else if (language === 'Bengali') {
        text = `আকাশজুড়ে এক মায়াবী আলো ছড়িয়ে পড়ল যখন ${cleanIdea}-এর নতুন অধ্যায় শুরু হলো। কোনো দ্বিধা ছাড়াই সাহসী হৃদয় সামনের অজানা পথের দিকে এগিয়ে চলল। প্রতিটি পদক্ষেপে এক নতুন রূপকথার সৃষ্টি হতে লাগল।`;
      } else if (language === 'Japanese') {
        text = `${cleanIdea}の輝きが夜空を染め上げ、運命の歯車が静かに動き始めました。躊躇うことなく、第一歩を踏み出します。澄んだ風が古の約束を囁いていました。`;
      } else {
        text = `The atmosphere crackled with electric wonder as the spark of ${cleanIdea} ignited the horizon. Without hesitation, the journey began right into the heart of the uncharted realm. Thunderous winds carried distant melodies of ancient bravery.`;
      }
      imagePrompt = `Cinematic wide-angle opening shot, standing at an epic mountain ridge overlooking a breathtaking fantasy landscape inspired by ${cleanIdea}, golden atmospheric lighting, volumetric clouds, dramatic composition.`;
    } else if (i === total) {
      if (language === 'Spanish') {
        text = `Un suave rayo de sol dorado filtró a través de los árboles mientras la última pieza de ${cleanIdea} encajaba en su lugar. Un soplo de brisa fresca agitó las hojas y las linternas iluminaron el sendero de piedra.`;
      } else if (language === 'French') {
        text = `Une douce lumière dorée traversa les arbres alors que la dernière pièce de ${cleanIdea} s'emboîta parfaitement. Une brise fraîche fit frémir les feuilles et de douces lanternes s'illuminèrent le long du chemin.`;
      } else if (language === 'German') {
        text = `Sanftes goldenes Sonnenlicht fiel durch die Bäume, als das letzte Teil von ${cleanIdea} an seinen Platz glitt. Ein kühler Abendwind bewegte die Blätter, während die Laternen am Steinpfad aufleuchteten.`;
      } else if (language === 'Hindi') {
        text = `शाम की हल्की धूप पेड़ों के बीच से छनकर आई जब ${cleanIdea} का आखिरी हिस्सा अपनी जगह पर बैठ गया। ठंडी हवा के झोंके ने पत्तियों को सरसराया और पत्थर के रास्ते पर लालटेन जल उठीं।`;
      } else if (language === 'Bengali') {
        text = `গাছের পাতার ফাঁক দিয়ে মিষ্টি সোনালি রোদ এসে পড়ল যখন ${cleanIdea}-এর শেষ অংশটি নিজের জায়গায় বসে গেল। ঠাণ্ডা হাওয়ায় পাতাগুলো দোলে উঠল আর পাথরের পথে প্রদীপগুলো জ্বলে উঠল।`;
      } else if (language === 'Japanese') {
        text = `木々の間から柔らかい金色の光が差し込み、${cleanIdea}の最後の欠片が静かに収まりました。涼しい夕風が葉を揺らし、石畳の道沿いに灯籠が温かく灯りました。`;
      } else {
        text = `Soft golden sunlight filtered through the trees as the final piece of ${cleanIdea} slipped cleanly into place. With a quiet click, the old wooden mechanism settled, and fresh spring water began to flow into the stone basin. A cool evening breeze stirred the leaves as warm lanterns flickered to life along the path.`;
      }
      imagePrompt = `Majestic triumphant climax, golden hour sunlight streaming through crystal structures, sense of awe, emotional resolution, masterpiece 8k render, octane render style.`;
    } else if (i === Math.floor(total / 2)) {
      if (language === 'Spanish') {
        text = `En el centro de las sombras, un descubrimiento insospechado sobre ${cleanIdea} lo cambió todo. El camino se dividió en dos, exigiendo una elección Audaz e irreversible. Nadie podía echarse atrás ahora.`;
      } else if (language === 'French') {
        text = `Au cœur des ombres, une découverte inattendue liée à ${cleanIdea} a tout bouleversé. Le chemin s'est divisé, imposant un choix audacieux et irréversible. Impossible de faire marche arrière.`;
      } else if (language === 'German') {
        text = `Im Zentrum der Schatten veränderte eine überraschende Enthüllung über ${cleanIdea} alles. Der Weg teilte sich und verlangte eine mutige Entscheidung. Es gab kein Zurück mehr.`;
      } else if (language === 'Hindi') {
        text = `गहरे सायों के बीच, ${cleanIdea} का एक बड़ा सच सामने आया जिसने सब कुछ बदल दिया। राह दो हिस्सों में बंट गई और एक निडर फैसला लेना पड़ा।`;
      } else if (language === 'Bengali') {
        text = `রহস্যের অতল গভীরে ${cleanIdea}-এর একটি চমকপ্রদ সত্য প্রকাশ পেল যা সবকিছু বদলে দিল। এক কঠিন ও সাহসী সিদ্ধান্ত নেওয়ার মুহূর্ত উপস্থিত হলো।`;
      } else if (language === 'Japanese') {
        text = `影の核心で、${cleanIdea}に関する予期せぬ真実が明かされ、すべてが変わりました。運命の分かれ道で、重大な選択を迫られます。`;
      } else {
        text = `At the very center of the shadows, a breathtaking revelation regarding ${cleanIdea} changed the entire quest. The ground trembled as a single decisive choice had to be made. There was no returning to safety.`;
      }
      imagePrompt = `Dramatic pivotal climax scene, mysterious glowing ancient monument, dramatic rim lighting, intense contrast, cinematic low camera angle.`;
    } else {
      if (language === 'Spanish') {
        text = `Explorando las profundidades de ${cleanIdea}, secretos dormidos despertaron bajo el resplandor de las estrellas. Cada paso traía una nueva maravilla y un peligro acechante.`;
      } else if (language === 'French') {
        text = `En explorant les profondeurs de ${cleanIdea}, des secrets enfouis se sont éveillés sous l'éclat des étoiles. Chaque pas apportait une merveille nouvelle et un frisson d'aventure.`;
      } else if (language === 'German') {
        text = `Beim Erforschen der Tiefen von ${cleanIdea} erwachten verborgene Geheimnisse unter dem Sternenlicht. Jeder Schritt brachte neues Staunen und aufregende Energie.`;
      } else if (language === 'Hindi') {
        text = `${cleanIdea} की गहराइयों में नए रहस्य तारों की छांव में सामने आने लगे। हर अगला पल एक नया रोमांच और जादू लेकर आ रहा था।`;
      } else if (language === 'Bengali') {
        text = `${cleanIdea}-এর রাজ্যময় নতুন পথ খুঁজে পাওয়ার সাথে সাথে তারার আলোয় ঢাকা প্রাচীন গোপনীয়তাগুলি জেগে উঠল। প্রতিটি মুহূর্ত এক নতুন আনন্দের জোয়ার নিয়ে এল।`;
      } else if (language === 'Japanese') {
        text = `${cleanIdea}の深部を進むにつれ、星明かりの下で眠っていた秘密が目覚めます。一歩ごとに新しい感動と期待が広上がります。`;
      } else {
        text = `Navigating deep into the realm of ${cleanIdea}, forgotten secrets stirred beneath the starlight. Each breath brought fresh wonder and mounting tension, drawing closer to the heart of the magic.`;
      }
      imagePrompt = `Exploring a magical vibrant environment inspired by ${cleanIdea}, glowing particles, ethereal lighting, rich environment details, atmospheric depth.`;
    }

    pages.push({
      pageNumber: i,
      text,
      imagePrompt,
    });
  }

  return {
    title,
    characterDescription,
    pages,
  };
}

/**
 * Generates the full story (all pages) via Gemini call with seamless fallback.
 * Returns { title, characterDescription, pages: [{pageNumber, text, imagePrompt}] }
 */
async function generateStory(userIdea, pageCount, language = 'English') {
  try {
    const prompt = buildPrompt(userIdea, pageCount, language);
    const raw = await generateText({ prompt, responseSchema: STORY_SCHEMA });
    const story = JSON.parse(raw);

    if (Array.isArray(story.pages) && story.pages.length > 0) {
      console.log(`[storyGenerator] Gemini generated story in ${language}: "${story.title}" (${story.pages.length} pages)`);
      return story;
    }
  } catch (err) {
    console.warn(`[storyGenerator] Gemini API unavailable (${err.message}). Using Creative Story Engine fallback for ${language}.`);
  }

  return generateCreativeFallbackStory(userIdea, pageCount, language);
}

module.exports = { generateStory, generateCreativeFallbackStory };
