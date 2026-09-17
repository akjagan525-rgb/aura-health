const MAX_QUERY_LENGTH = 1500;
const MAX_AI_TEXT_LENGTH = 1600;
const MAX_AI_LIST_ITEM_LENGTH = 360;
const ALLOWED_LANGUAGES = new Set(['English', 'Tamil']);
const MIN_HUMAN_INTERACTION_MS = 400;
const CONTEXT_VALUES = {
  duration: new Set(['today', 'few_days', 'more_than_week', 'unsure']),
  change: new Set(['same', 'better', 'worse', 'unsure']),
  impact: new Set(['none', 'some', 'major', 'unsure'])
};

const GENERAL_SOURCES = [
  { organization: 'NHS', title: 'Health A to Z', url: 'https://www.nhs.uk/conditions/' },
  { organization: 'WHO', title: 'Health topics', url: 'https://www.who.int/health-topics' }
];

const TOPIC_SOURCES = [
  {
    pattern: /fever|temperature|high temp|காய்ச்சல்|வெப்பநிலை/i,
    sources: [
      { organization: 'NHS', title: 'Fever in adults', url: 'https://www.nhs.uk/conditions/fever-in-adults/' },
      { organization: 'WHO', title: 'Health topics', url: 'https://www.who.int/health-topics' }
    ]
  },
  {
    pattern: /headache|migraine|head pain|தலைவலி|ஒற்றைத்தலை/i,
    sources: [
      { organization: 'NHS', title: 'Headaches', url: 'https://www.nhs.uk/conditions/headaches/' },
      { organization: 'WHO', title: 'Health topics', url: 'https://www.who.int/health-topics' }
    ]
  },
  {
    pattern: /bloat|bloating|indigestion|acid reflux|heartburn|stomach|tummy|digestion|வயிறு|உப்புச|நெஞ்செரிச்சல்|செரிமான/i,
    sources: [
      { organization: 'NHS', title: 'Bloating', url: 'https://www.nhs.uk/symptoms/bloating/' },
      { organization: 'NHS', title: 'Heartburn and acid reflux', url: 'https://www.nhs.uk/conditions/heartburn-and-acid-reflux/' }
    ]
  },
  {
    pattern: /kidney|stone|urin|bladder|flank pain|சிறுநீரகம்|சிறுநீர்|கல்/i,
    sources: [
      { organization: 'NHS', title: 'Kidney stones', url: 'https://www.nhs.uk/conditions/kidney-stones/' },
      { organization: 'NHS', title: 'Urinary tract infections', url: 'https://www.nhs.uk/conditions/urinary-tract-infections-utis/' }
    ]
  },
  {
    pattern: /knee|joint|back pain|neck pain|spine|arthritis|muscle|cramp|மூட்டு|முதுகு|கழுத்து|தசை/i,
    sources: [
      { organization: 'NHS', title: 'Back pain', url: 'https://www.nhs.uk/conditions/back-pain/' },
      { organization: 'NHS', title: 'Joint pain', url: 'https://www.nhs.uk/conditions/joint-pain/' }
    ]
  },
  {
    pattern: /pressure|hypertension|bp|இரத்த அழுத்தம்|பிரஷர்/i,
    sources: [
      { organization: 'NHS', title: 'High blood pressure (hypertension)', url: 'https://www.nhs.uk/conditions/high-blood-pressure-hypertension/' },
      { organization: 'WHO', title: 'Hypertension fact sheet', url: 'https://www.who.int/news-room/fact-sheets/detail/hypertension' }
    ]
  },
  {
    pattern: /diabetes|sugar|glucose|சர்க்கரை|நீரிழிவு/i,
    sources: [
      { organization: 'NHS', title: 'Type 2 diabetes', url: 'https://www.nhs.uk/conditions/type-2-diabetes/' },
      { organization: 'WHO', title: 'Diabetes fact sheet', url: 'https://www.who.int/news-room/fact-sheets/detail/diabetes' }
    ]
  },
  {
    pattern: /skin|rash|itch|acne|eczema|தோல்|அரிப்பு|பரு/i,
    sources: [
      { organization: 'NHS', title: 'Itchy skin', url: 'https://www.nhs.uk/conditions/itchy-skin/' },
      { organization: 'NHS', title: 'Acne', url: 'https://www.nhs.uk/conditions/acne/' }
    ]
  },
  {
    pattern: /nausea|vomit|food poison|வாந்தி|குமட்டல்/i,
    sources: [
      { organization: 'NHS', title: 'Feeling sick (nausea)', url: 'https://www.nhs.uk/conditions/feeling-sick-nausea/' },
      { organization: 'NHS', title: 'Food poisoning', url: 'https://www.nhs.uk/conditions/food-poisoning/' }
    ]
  },
  {
    pattern: /dizzy|vertigo|lightheaded|மயக்கம்|தலைசுற்றல்/i,
    sources: [
      { organization: 'NHS', title: 'Dizziness', url: 'https://www.nhs.uk/conditions/dizziness/' },
      { organization: 'NHS', title: 'Vertigo', url: 'https://www.nhs.uk/conditions/vertigo/' }
    ]
  },
  {
    pattern: /medicine|paracetamol|tablet|pill|dose|drug|மருந்து|மாத்திரை/i,
    sources: [
      { organization: 'NHS', title: 'Medicines A to Z', url: 'https://www.nhs.uk/medicines/' },
      { organization: 'WHO', title: 'Rational use of medicines', url: 'https://www.who.int/health-topics/medicines' }
    ]
  },
  {
    pattern: /tired|fatigue|sleep|insomnia|exhaust|சோர்வு|தூக்கம்|களைப்பு/i,
    sources: [
      { organization: 'NHS', title: 'Tiredness and fatigue', url: 'https://www.nhs.uk/symptoms/tiredness-and-fatigue/' },
      { organization: 'WHO', title: 'Health topics', url: 'https://www.who.int/health-topics' }
    ]
  },
  {
    pattern: /cough|cold|throat|flu|சளி|இருமல்|தொண்டை/i,
    sources: [
      { organization: 'NHS', title: 'Cough', url: 'https://www.nhs.uk/conditions/cough/' },
      { organization: 'NHS', title: 'Common cold', url: 'https://www.nhs.uk/conditions/common-cold/' }
    ]
  },
  {
    pattern: /stress|anxiety|nervous|worry|மன அழுத்தம்|கவலை|பயம்/i,
    sources: [
      { organization: 'NHS', title: 'Stress and anxiety', url: 'https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/' },
      { organization: 'WHO', title: 'Mental health', url: 'https://www.who.int/health-topics/mental-health' }
    ]
  },
  {
    pattern: /chest|heart|breath|stroke|faint|seizure|bleed|allerg|chest pain|நெஞ்சு|மூச்சு|பக்கவாத|மயக்க|வலிப்பு|ரத்தப்போக்கு|ஒவ்வாமை/i,
    sources: [
      { organization: 'NHS', title: 'Chest pain', url: 'https://www.nhs.uk/conditions/chest-pain/' },
      { organization: 'NHS', title: 'Heart attack', url: 'https://www.nhs.uk/conditions/heart-attack/' }
    ]
  }
];

const EMERGENCY_PATTERNS = [
  /(?:chest pain|chest pressure|chest tightness|pain.*(?:arm|jaw|neck))/i,
  /(?:trouble breathing|difficulty breathing|can't breathe|cannot breathe|severe shortness of breath|gasping)/i,
  /(?:face droop|slurred speech|one.?sided weakness|sudden confusion)/i,
  /(?:passed out|fainted|unconscious|seizure)/i,
  /(?:severe bleeding|bleeding won't stop|vomiting blood|coughing blood|black tarry stool)/i,
  /(?:suicid(?:e|al)|self.?harm|kill myself)/i,
  /(?:severe allergic reaction|swelling.*(?:throat|tongue)|anaphylaxis)/i,
  /(?:நெஞ்சு.*வலி|நெஞ்சு.*இறுக்கம்|மூச்சு.*திணற|மூச்சு.*முடிய|பக்கவாத|வாய்.*கோண|பேச்சு.*குழற|மயக்க|வலிப்பு|ரத்தப்போக்கு|தற்கொலை|சுய.*தீங்கு|தொண்டை.*வீக்க)/i
];

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    },
    body: JSON.stringify(body)
  };
}

function requestLooksHuman(request) {
  const startedAt = Number(request.startedAt);
  if (!Number.isFinite(startedAt)) return true;
  const elapsed = Date.now() - startedAt;
  return elapsed >= MIN_HUMAN_INTERACTION_MS;
}

function getOptionalContext(value) {
  if (!value || typeof value !== 'object') return {};
  const context = {};
  for (const key of Object.keys(CONTEXT_VALUES)) {
    if (CONTEXT_VALUES[key].has(value[key])) context[key] = value[key];
  }
  return context;
}

function contextForPrompt(context) {
  const labels = {
    duration: { today: 'started today', few_days: 'started a few days ago', more_than_week: 'has lasted more than a week', unsure: 'duration is not known' },
    change: { same: 'is about the same', better: 'is improving', worse: 'is getting worse', unsure: 'change is not known' },
    impact: { none: 'is not affecting normal activities', some: 'is affecting some normal activities', major: 'is stopping normal activities', unsure: 'impact is not known' }
  };
  return Object.entries(context)
    .map(([key, value]) => labels[key]?.[value] || '')
    .filter(Boolean)
    .join('; ') || 'No optional context was selected.';
}

function safeText(value, maxLength = MAX_AI_TEXT_LENGTH) {
  return typeof value === 'string'
    ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
    : '';
}

function safeList(value, fallback) {
  const items = Array.isArray(value)
    ? value.map(item => safeText(item, MAX_AI_LIST_ITEM_LENGTH)).filter(Boolean).slice(0, 4)
    : [];
  return items.length ? items : fallback;
}

function recommendedSources(query) {
  return TOPIC_SOURCES.find(topic => topic.pattern.test(query))?.sources || GENERAL_SOURCES;
}

function extractJson(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function cleanQueryTopic(query) {
  return (query || '')
    .replace(/^(what is|what are|what causes|why do|why does|how to|how do|can i|is it safe to|tell me about|explain)\s+/i, '')
    .replace(/[?!.,]+$/, '')
    .trim();
}

function emergencyResponse(language, query) {
  const tamil = language === 'Tamil';
  return {
    title_en: 'Urgent medical care may be needed',
    title_ta: 'அவசர மருத்துவ உதவி தேவைப்படலாம்',
    answer: tamil
      ? 'இந்த அறிகுறிகள் அவசர நிலையைச் சுட்டிக்காட்டலாம். இந்தப் பக்கத்தில் பதிலுக்காகக் காத்திருக்காதீர்கள் — உடனே உங்கள் உள்ளூர் அவசர எண்ணை அழைக்கவும் அல்லது அருகிலுள்ள அவசர மருத்துவப் பிரிவிற்குச் செல்லவும்.'
      : 'These symptoms may signal an emergency. Do not wait for an answer here — call your local emergency number now or go to the nearest emergency department.',
    why_it_happens: tamil
      ? ['திடீர் நெஞ்சுவலி, மூச்சுத் திணறல், பக்கவாத அறிகுறிகள், கடுமையான ரத்தப்போக்கு அல்லது சுய தீங்கு எண்ணங்கள் உடனடி நேரடி மதிப்பீடு தேவைப்படும் அறிகுறிகளாக இருக்கலாம்.']
      : ['Sudden chest symptoms, severe breathing problems, stroke-like symptoms, major bleeding, or thoughts of self-harm need immediate in-person assessment.'],
    what_to_do: tamil
      ? ['உங்கள் உள்ளூர் அவசர எண்ணை இப்போது அழைக்கவும்.', 'தனியாக வாகனம் ஓட்ட வேண்டாம்; முடிந்தால் நம்பகமான ஒருவரிடம் உடன் இருக்கச் சொல்லுங்கள்.']
      : ['Call your local emergency number now.', 'Do not drive yourself; if possible, ask a trusted person to stay with you.'],
    when_to_seek_care: tamil
      ? ['இப்போது: இந்த அறிகுறிகளில் ஏதேனும் தற்போதும் இருந்தால்.', 'நிலை மோசமாகினாலோ, நீங்கள் பாதுகாப்பாக இல்லை என்று உணர்ந்தாலோ அவசர உதவி பெறுங்கள்.']
      : ['Now: if any of these symptoms are happening currently.', 'Seek emergency help if symptoms worsen or you do not feel safe.'],
    urgency: 'emergency',
    urgency_message: tamil
      ? 'உடனடி மருத்துவ உதவி பெறுங்கள். இந்தக் கருவி அவசர சேவைக்கு மாற்றாகாது.'
      : 'Get urgent medical help now. This tool is not a replacement for emergency services.',
    fun_fact_or_tip: tamil
      ? 'அவசர நிலையில், நேரில் மருத்துவ உதவி பெறுவது மிக முக்கியம்.'
      : 'In an emergency, getting in-person care is more important than finding the exact cause yourself.',
    youtube_search: 'emergency warning signs medical advice',
    sources: recommendedSources(query)
  };
}

// Built-in comprehensive knowledge engine supporting dozens of health domains
function generateEducationalFallback(query, language, context) {
  const tamil = language === 'Tamil';
  const q = (query || '').toLowerCase();
  const cleaned = cleanQueryTopic(query);

  let topic = 'dynamic_general';
  if (/kidney|stone|urin|bladder|flank pain|சிறுநீரகம்|சிறுநீர்|கல்/i.test(q)) topic = 'kidney';
  else if (/knee|joint|back pain|neck pain|spine|arthritis|muscle|cramp|மூட்டு|முதுகு|கழுத்து|தசை/i.test(q)) topic = 'joint_pain';
  else if (/pressure|hypertension|bp|இரத்த அழுத்தம்|பிரஷர்/i.test(q)) topic = 'blood_pressure';
  else if (/diabetes|sugar|glucose|சர்க்கரை|நீரிழிவு/i.test(q)) topic = 'diabetes';
  else if (/skin|rash|itch|acne|eczema|தோல்|அரிப்பு|பரு/i.test(q)) topic = 'skin';
  else if (/nausea|vomit|food poison|வாந்தி|குமட்டல்/i.test(q)) topic = 'nausea';
  else if (/dizzy|vertigo|lightheaded|மயக்கம்|தலைசுற்றல்/i.test(q)) topic = 'dizziness';
  else if (/medicine|paracetamol|tablet|pill|dose|drug|மருந்து|மாத்திரை/i.test(q)) topic = 'medication';
  else if (/headache|migraine|head pain|தலைவலி/i.test(q)) topic = 'headache';
  else if (/bloat|stomach|digestion|acid|reflux|heartburn|வயிறு|நெஞ்செரிச்சல்/i.test(q)) topic = 'digestion';
  else if (/tired|fatigue|sleep|insomnia|exhaust|சோர்வு|தூக்கம்/i.test(q)) topic = 'fatigue';
  else if (/fever|temperature|காய்ச்சல்/i.test(q)) topic = 'fever';
  else if (/cough|cold|throat|flu|சளி|இருமல்/i.test(q)) topic = 'cold';
  else if (/stress|anxiety|worry|மன அழுத்தம்/i.test(q)) topic = 'stress';
  else if (/allergy|allergen|sneezing|ஒவ்வாமை/i.test(q)) topic = 'allergy';
  else if (/weight|diet|cholesterol|nutrition|உணவு|எடை/i.test(q)) topic = 'nutrition';

  const knowledge = {
    kidney: {
      en: {
        title_en: 'Kidney Health & Kidney Stones',
        title_ta: 'சிறுநீரக ஆரோக்கியம் மற்றும் கற்கள்',
        answer: 'Kidney stones form when minerals and salts (most commonly calcium oxalate) crystallize in concentrated urine. Decreased water intake, high sodium diets, and metabolic factors increase stone formation risks.',
        why: ['Low fluid intake leading to highly concentrated, mineral-rich urine', 'High dietary intake of sodium, animal proteins, or oxalate-rich foods', 'Metabolic or genetic predispositions altering mineral processing in the kidneys', 'Recurrent urinary tract infections or pH imbalances in the urine'],
        steps: ['Drink 2.5 to 3 litres of water daily to maintain pale, diluted urine', 'Moderate your dietary salt and animal protein intake', 'Include citrus fruits (like lemon water) which provide citrate to inhibit crystal formation', 'Avoid holding urine for prolonged periods and urinate regularly throughout the day'],
        care: ['Seek urgent care if you experience severe, agonizing flank pain radiating to the groin', 'Get immediate medical help if flank pain is accompanied by fever, chills, nausea, or vomiting', 'Consult a doctor immediately if you observe visible blood in your urine or cannot pass urine'],
        watch: ['Location of pain (lower back, side/flank, or groin)', 'Color and clarity of urine (pink, red, cloudy, or dark)', 'Any burning sensation or difficulty starting urination'],
        prompts: ['Would an ultrasound scan or urine analysis be helpful to evaluate for stones?', 'What dietary adjustments should I make based on my mineral levels?'],
        tip: 'Drinking enough water so that your urine remains very light in color is the single most effective way to prevent kidney stones.',
        yt: 'kidney stones causes symptoms and prevention doctor'
      },
      ta: {
        title_en: 'Kidney Health & Kidney Stones',
        title_ta: 'சிறுநீரக ஆரோக்கியம் மற்றும் கற்கள்',
        answer: 'சிறுநீரகத்தில் தாதுக்களும் உப்புகளும் (குறிப்பாக கால்சியம் ஆக்சலேட்) படிந்து கெட்டியாகும் போது சிறுநீரகக் கற்கள் உருவாகின்றன. போதுமான தண்ணீர் குடிக்காதது இதற்கு முக்கிய காரணமாகும்.',
        why: ['உடலில் நீர்ச்சத்து குறைந்து சிறுநீர் அடர்த்தியாக மாறுவது', 'உணவில் அதிகப்படியான உப்பு அல்லது அசைவ உணவுகள் உட்கொள்வது', 'சிறுநீரகத்தில் தாதுக்கள் படிகங்களாக மாறுவதைத் தடுக்கும் சிட்ரேட் குறைவது', 'சிறுநீரை நீண்ட நேரம் அடக்கி வைக்கும் பழக்கம்'],
        steps: ['தினமும் 2.5 முதல் 3 லிட்டர் வரை சுத்தமான குடிநீர் அருந்துங்கள்', 'உணவில் உப்பின் அளவைக் கணிசமாகக் குறைத்துக் கொள்ளுங்கள்', 'எலுமிச்சை அல்லது நெல்லிக்காய் சாறு அருந்துவது கல் உருவாவதைத் தடுக்க உதவும்', 'சிறுநீர் வரும் போது தாமதிக்காமல் உடனே சிறுநீர் கழிக்கவும்'],
        care: ['முதுகின் ஒரு பக்கத்தில் தாங்க முடியாத தீவிர வலி ஏற்பட்டால் உடனே மருத்துவமனைக்குச் செல்லவும்', 'வலியுடன் காய்ச்சல், நடுக்கம் அல்லது வாந்தி இருந்தால் உடனடியாக அவசர சிகிச்சை பெறவும்', 'சிறுநீரில் ரத்தம் வெளிவந்தாலோ அல்லது சிறுநீர் பிரியாமல் அடைத்துக் கொண்டாலோ தாமதிக்காதீர்கள்'],
        watch: ['வலி முதுகிலிருந்து அடிவயிறு அல்லது தொடைப் பகுதிக்கு நகர்கிறதா என்பதைக் கவனியுங்கள்', 'சிறுநீரின் நிறம் (சிவப்பு, பழுப்பு அல்லது தெளிவற்றதாக உள்ளதா) என்று பாருங்கள்', 'சிறுநீர் கழிக்கும் போது எரிச்சல் அல்லது வலி உள்ளதா என்று கண்காணியுங்கள்'],
        prompts: ['எனக்கு அல்ட்ராசவுண்ட் ஸ்கேன் அல்லது சிறுநீர்ப் பரிசோதனை தேவையா?', 'கற்கள் மீண்டும் வராமல் தடுக்க நான் என்ன உணவு முறையைப் பின்பற்ற வேண்டும்?'],
        tip: 'சிறுநீர் வெளிர் மஞ்சள் அல்லது நிறமற்றதாக இருக்கும் அளவுக்கு போதிய அளவு தண்ணீர் குடிப்பதே சிறுநீரகக் கற்களைத் தடுக்கும் மிகச் சிறந்த வழியாகும்.',
        yt: 'kidney stone symptoms home remedy prevention tamil'
      }
    },
    joint_pain: {
      en: {
        title_en: 'Joint, Back & Musculoskeletal Health',
        title_ta: 'மூட்டு, முதுகு மற்றும் தசை ஆரோக்கியம்',
        answer: 'Joint and back discomfort frequently arises from muscle strain, poor posture, prolonged sitting, wear-and-tear (osteoarthritis), or inflammatory joint changes.',
        why: ['Muscular imbalance and strain from heavy lifting or awkward movement', 'Prolonged sitting and weak core or stabilizing muscles', 'Age-related cartilage changes or cartilage thinning in weight-bearing joints', 'Inflammatory factors or micro-trauma from repetitive joint strain'],
        steps: ['Alternate between gentle movement and short resting periods rather than remaining static', 'Apply a warm pack for muscle tension or a cool ice pack for acute swelling', 'Perform gentle low-impact exercises like walking, swimming, or light mobility stretches', 'Check desk ergonomics, chair support, and footwear cushioning'],
        care: ['Seek immediate care if joint pain is accompanied by inability to bear weight or sudden severe deformity', 'Get urgent medical evaluation if back pain is accompanied by leg numbness, weakness, or loss of bowel/bladder control', 'Consult a doctor if joints are hot, visibly red, or swollen with fever'],
        watch: ['Whether pain is worse in the morning (stiffness) or after physical activity', 'Any clicking, locking, or giving-way sensations in the joint', 'Response to heat, ice, or light stretching'],
        prompts: ['Would physiotherapy exercises or imaging be beneficial for this joint?', 'Are there safe daily stretches to protect my back and joints?'],
        tip: 'Movement is medicine for joints: regular low-impact walking circulates synovial fluid, which lubricates and nourishes joint cartilage.',
        yt: 'joint and back pain relief exercises doctor'
      },
      ta: {
        title_en: 'Joint, Back & Musculoskeletal Health',
        title_ta: 'மூட்டு, முதுகு மற்றும் தசை ஆரோக்கியம்',
        answer: 'மூட்டு மற்றும் முதுகு வலி பொதுவாக தசைப் பிடிப்பு, நீண்ட நேரம் தவறான நிலையில் அமர்வது, தசை பலவீனம் அல்லது மூட்டுகளில் ஏற்படும் தேய்மானத்தால் உண்டாகிறது.',
        why: ['தவறான தோரணையில் (posture) அமர்வது அல்லது அதிக எடை தூக்குவது', 'மூட்டுகளை இணைக்கும் குருத்தெலும்பு (cartilage) தேய்மானம்', 'உடற்பயிற்சி இன்மை காரணமாக தசைகள் பலவீனமடைவது', 'மூட்டுகளில் ஏற்படும் லேசான வீக்கம் அல்லது தசை இறுக்கம்'],
        steps: ['ஒரே இடத்தில் நீண்ட நேரம் உட்காராமல் 45 நிமிடங்களுக்கு ஒருமுறை எழுந்து நடங்கள்', 'வலி உள்ள இடத்தில் வெதுவெதுப்பான ஒத்தடம் கொடுக்கலாம்', 'லேசான நடைப்பயிற்சி அல்லது மூட்டு அசைவுப் பயிற்சிகள் மேற்கொள்ளுங்கள்', 'சரியான மெத்தை மற்றும் வசதியான காலணிகளைப் பயன்படுத்துங்கள்'],
        care: ['காலில் பலவீனம், மரத்துப்போதல் அல்லது சிறுநீர் கட்டுப்பாடு இழப்பு ஏற்பட்டால் உடனே அவசர சிகிச்சை பெறவும்', 'மூட்டு சிவந்து, அதிக சூடாகவும், தாங்க முடியாத வலியுடனும் வீங்கினால் மருத்துவரை அணுகவும்', 'நடக்கும் போது கால் தாங்க முடியாமல் போனால் உடனே பரிசோதனை செய்யவும்'],
        watch: ['காலையில் எழும்போது மூட்டுகளில் விரைப்பு (stiffness) உள்ளதா என்பதைக் கவனியுங்கள்', 'நடக்கும் போது வலி அதிகரிக்கிறதா அல்லது குறைகிறதா என்று பாருங்கள்', 'முதுகு வலி கால்களுக்கு பரவுகிறதா (sciatica) என்பதைக் கண்காணியுங்கள்'],
        prompts: ['எனக்கு பிசியோதெரபி (physiotherapy) பயிற்சிகள் தேவையா?', 'மூட்டுத் தேய்மானத்தைத் தடுக்க நான் என்ன செய்ய வேண்டும்?'],
        tip: 'தொடர்ந்து நடப்பதும் மிதமான உடற்பயிற்சியும் மூட்டுகளுக்குள் இயற்கையான உராய்வுத் திரவத்தை (synovial fluid) அதிகரித்து தேய்மானத்தைத் தடுக்கும்.',
        yt: 'joint pain knee pain home remedies tamil'
      }
    },
    blood_pressure: {
      en: {
        title_en: 'Blood Pressure & Cardiovascular Health',
        title_ta: 'இரத்த அழுத்தம் மற்றும் இதய நலம்',
        answer: 'Blood pressure reflects the force of blood pushing against artery walls. Sustained elevated pressure (hypertension) strains the heart and blood vessels, but can often be managed effectively through diet and lifestyle.',
        why: ['High dietary sodium causing fluid retention and increased blood volume', 'Chronic stress, smoking, or excessive alcohol intake narrowing blood vessels', 'Lack of regular physical activity and arterial stiffness', 'Family history and metabolic factors affecting vascular resistance'],
        steps: ['Reduce daily salt and packaged food intake (DASH diet approach)', 'Engage in at least 30 minutes of moderate aerobic exercise (brisk walking) most days', 'Practice regular stress reduction through deep breathing and good sleep habits', 'Measure and record blood pressure readings at consistent times of day'],
        care: ['Seek emergency care if blood pressure is very high (>=180/120) with chest pain, shortness of breath, headache, or vision changes', 'Consult a doctor promptly if you experience severe dizziness, fainting, or irregular heartbeats', 'Schedule regular monitoring visits with a physician for ongoing blood pressure management'],
        watch: ['Systolic and diastolic readings taken in a quiet, seated position', 'Any accompanying morning headaches, ringing in the ears, or chest flutter', 'Effect of dietary changes and physical activity over 2-4 weeks'],
        prompts: ['What is my target blood pressure range based on my overall health?', 'Are lifestyle modifications sufficient, or do you recommend medical management?'],
        tip: 'Cutting just one teaspoon of salt per day can lower systolic blood pressure as effectively as many standard medications.',
        yt: 'how to lower blood pressure naturally doctor advice'
      },
      ta: {
        title_en: 'Blood Pressure & Cardiovascular Health',
        title_ta: 'இரத்த அழுத்தம் மற்றும் இதய நலம்',
        answer: 'இரத்த அழுத்தம் என்பது இரத்தக் குழாய்களின் சுவர்கள் மீது இரத்தம் செலுத்தும் அழுத்தமாகும். அதிக இரத்த அழுத்தம் (Hypertension) இதயத்திற்கு கூடுதல் சுமையை ஏற்படுத்துகிறது.',
        why: ['உணவில் அதிக உப்பு உட்கொள்வதால் உடலில் நீர் தேங்குவது', 'மன அழுத்தம், பதற்றம் மற்றும் முறையான தூக்கமின்மை', 'உடற்பயிற்சி இல்லாமை மற்றும் உடல் பருமன்', 'பரம்பரை காரணங்கள் மற்றும் இரத்தக் குழாய் இறுக்கம்'],
        steps: ['உணவில் உப்பின் அளவை பாதியாகக் குறையுங்கள்; ஊறுகாய், அப்பளத்தைத் தவிருங்கள்', 'தினமும் 30 நிமிடங்கள் வேகமான நடைப்பயிற்சி செய்யுங்கள்', 'பதற்றத்தைக் குறைத்து ஆழ்ந்த மூச்சுப் பயிற்சிகளைப் பழகுங்கள்', 'இரத்த அழுத்தத்தை குறிப்பிட்ட இடைவெளியில் அளந்து குறித்து வையுங்கள்'],
        care: ['அதிக ரத்த அழுத்தத்துடன் கடுமையான நெஞ்சு வலி, மூச்சுத் திணறல் அல்லது பார்வை மங்குதல் ஏற்பட்டால் உடனே அவசர உதவி பெறவும்', 'தீவிர தலைசுற்றல் அல்லது மயக்கம் வந்தால் தாமதிக்காமல் மருத்துவரை அணுகவும்', 'மருத்துவர் பரிந்துரைத்த மருந்துகளை சுயமாக நிறுத்தவோ மாற்றவோ வேண்டாம்'],
        watch: ['காலையிலும் மாலையிலும் ரத்த அழுத்த அளவுகள் எவ்வாறு உள்ளன என்பதைக் கண்காணியுங்கள்', 'தலைபாரம், படபடப்பு அல்லது காதில் இரைச்சல் உள்ளதா என்று பாருங்கள்', 'உப்பு குறைத்த பிறகு ரத்த அழுத்தம் குறைகிறதா என்று கவனியுங்கள்'],
        prompts: ['என் வயதுக்கு இயல்பான ரத்த அழுத்த அளவு என்ன?', 'ரத்த அழுத்தத்தைக் கட்டுக்குள் வைக்க நான் என்ன உணவுகளைத் தேர்ந்தெடுக்க வேண்டும்?'],
        tip: 'தினமும் வெறும் 30 நிமிடங்கள் விறுவிறுப்பாக நடப்பதும் உணவில் உப்பைக் குறைப்பதும் ரத்த அழுத்தத்தைக் கட்டுக்குள் வைத்திருக்க உதவும் மிகச் சிறந்த இயற்கை வழியாகும்.',
        yt: 'high blood pressure control home remedies tamil'
      }
    },
    diabetes: {
      en: {
        title_en: 'Blood Sugar & Metabolic Guidance',
        title_ta: 'இரத்த சர்க்கரை மற்றும் வளர்சிதை மாற்றம்',
        answer: 'Blood sugar regulation depends on insulin produced by the pancreas. When cells become resistant to insulin or insulin production declines, glucose accumulates in the bloodstream.',
        why: ['Insulin resistance related to physical inactivity and excess visceral fat', 'Diets high in refined carbohydrates, sugary beverages, and low in fibre', 'Family history and genetic factors influencing pancreatic beta-cell function', 'Chronic sleep deprivation elevating stress hormones that raise glucose'],
        steps: ['Choose whole grains, legumes, vegetables, and lean proteins over refined carbs', 'Walk for 10-15 minutes immediately after meals to help muscles absorb glucose', 'Stay well-hydrated with plain water instead of sweetened drinks or juices', 'Monitor fasting and post-meal glucose levels as advised by your doctor'],
        care: ['Seek emergency care if blood sugar drops too low (<70 mg/dL) with confusion, shaking, sweating, or loss of consciousness', 'Get urgent medical evaluation for very high blood sugar with extreme thirst, nausea, confusion, or fruity breath', 'Consult a doctor for cuts or foot wounds that heal slowly or show signs of infection'],
        watch: ['Fasting glucose and 2-hour post-meal levels in a logbook', 'Symptoms of increased thirst, frequent urination, or unexplained fatigue', 'Any tingling or numbness in the fingers or toes'],
        prompts: ['What is my ideal target HbA1c range?', 'How can I balance my daily carbohydrates to maintain steady energy?'],
        tip: 'A brisk 10-minute walk right after lunch or dinner directly reduces post-meal blood sugar spikes by utilizing glucose in active muscle cells.',
        yt: 'type 2 diabetes lifestyle and blood sugar control doctor'
      },
      ta: {
        title_en: 'Blood Sugar & Metabolic Guidance',
        title_ta: 'இரத்த சர்க்கரை மற்றும் வளர்சிதை மாற்றம்',
        answer: 'உணவில் உள்ள சர்க்கரையை ஆற்றலாக மாற்ற இன்சுலின் ஹார்மோன் தேவைப்படுகிறது. இன்சுலின் செயல்பாடு குறையும் போது இரத்தத்தில் குளுக்கோஸ் அளவு அதிகரிக்கிறது.',
        why: ['உடற்பயிற்சி இன்மை மற்றும் அதிக உடல் எடை காரணமாக இன்சுலின் எதிர்ப்பு உருவாவது', 'அதிகப்படியான சர்க்கரை, இனிப்புகள் மற்றும் மைதா போன்ற சுத்திகரிக்கப்பட்ட உணவுகள்', 'பரம்பரை காரணங்கள் மற்றும் மன அழுத்தம்', 'முறையற்ற உணவு நேரம் மற்றும் தூக்கமின்மை'],
        steps: ['வெள்ளை அரிசி, மைதாவுக்குப் பதிலாக சிறுதானியங்கள், பயறு வகைகள் மற்றும் காய்கறிகளை உண்ணுங்கள்', 'சாப்பிட்ட பிறகு 10-15 நிமிடங்கள் லேசாக நடைப்பயிற்சி செய்யுங்கள்', 'இனிப்பு பானங்கள் மற்றும் ஜூஸ்களைத் தவிர்த்து போதுமான தண்ணீர் குடியுங்கள்', 'இரத்த சர்க்கரை அளவை (Fasting & PP) தவறாமல் பரிசோதித்து குறித்துக்கொள்ளுங்கள்'],
        care: ['சர்க்கரை அளவு மிகக் குறைந்து நடுக்கம், அதிக வியர்வை அல்லது மயக்கம் வந்தால் உடனே இனிப்பு அல்லது குளுக்கோஸ் எடுத்துக்கொண்டு மருத்துவரை அணுகவும்', 'அதிக தாகம், வாந்தி அல்லது குழப்பத்துடன் சர்க்கரை அளவு மிக அதிகமாக இருந்தால் அவசர சிகிச்சை பெறவும்', 'கால்களில் காயம் அல்லது புண்கள் ஆறாமல் இருந்தால் உடனடியாக மருத்துவரிடம் காட்டுங்கள்'],
        watch: ['சாப்பிடுவதற்கு முன் மற்றும் சாப்பிட்ட 2 மணி நேரம் கழித்து சர்க்கரை அளவை அளவிடுங்கள்', 'அடிக்கடி சிறுநீர் போவது அல்லது அதீத தாகம் உள்ளதா என்று கவனியுங்கள்', 'கால் பாதங்களில் மரத்துப்போதல் அல்லது எரிச்சல் உள்ளதா என்று பாருங்கள்'],
        prompts: ['என் HbA1c இலக்கு அளவு என்னவாக இருக்க வேண்டும்?', 'சர்க்கரையைக் கட்டுப்படுத்த நான் என்ன உடற்பயிற்சிகளைச் செய்ய வேண்டும்?'],
        tip: 'சாப்பிட்டு முடித்தவுடன் 10 நிமிடங்கள் நடப்பது, ரத்தத்தில் சர்க்கரை அளவு திடீரென ஏறுவதைத் தடுத்து தசைகள் சர்க்கரையை எளிதில் உறிஞ்ச உதவும்.',
        yt: 'diabetes control food tips tamil doctor'
      }
    },
    skin: {
      en: {
        title_en: 'Skin Health & Dermatological Care',
        title_ta: 'தோல் பராமரிப்பு மற்றும் ஒவ்வாமை',
        answer: 'Skin reactions, rashes, and itching commonly stem from contact irritation, dry skin, allergic responses, eczema, or environmental friction.',
        why: ['Compromised skin moisture barrier leading to irritation and sensitivity', 'Contact dermatitis from soaps, fragrances, detergents, or fabrics', 'Allergic histamine release triggering hives or itchy patches', 'Bacterial or fungal proliferation in warm, humid skin folds'],
        steps: ['Use gentle, fragrance-free cleansers and avoid harsh scrubbing', 'Apply a thick, unscented moisturizer within 3 minutes of bathing', 'Wear loose, breathable cotton clothing to minimize friction and sweating', 'Avoid scratching to prevent secondary bacterial infections'],
        care: ['Seek immediate care if a rash spreads rapidly, blisters extensively, or involves the eyes, lips, or mouth', 'Consult a doctor if skin is hot, red, oozing pus, or accompanied by fever', 'Get evaluated if an unexplained rash persists for more than a week'],
        watch: ['Appearance of rash (bumps, redness, scales, or hives)', 'Triggers such as new soaps, cosmetics, foods, or clothing materials', 'Response to moisturizers and gentle skin care'],
        prompts: ['Could this reaction be contact dermatitis or an allergic trigger?', 'Which topical soothing formulation or barrier repair cream is most appropriate?'],
        tip: 'Applying a plain ceramide or petroleum-based moisturizer to damp skin locks in hydration and restores the protective barrier.',
        yt: 'rash itchy skin causes home care dermatologist'
      },
      ta: {
        title_en: 'Skin Health & Dermatological Care',
        title_ta: 'தோல் பராமரிப்பு மற்றும் ஒவ்வாமை',
        answer: 'தோல் அரிப்பு, தடிப்புகள் மற்றும் வறட்சி பொதுவாக சோப்புகள், சுற்றுச்சூழல் காரணிகள், உணவு ஒவ்வாமை அல்லது வறண்ட தோலினால் ஏற்படுகின்றன.',
        why: ['தோலின் ஈரப்பதம் குறைந்து வறட்சி அடைவது', 'ரசாயனம் கலந்த சோப்புகள், வாசனை திரவியங்கள் அல்லது உடைகளால் ஏற்படும் ஒவ்வாமை', 'அதிக வியர்வை மற்றும் ஈரப்பதத்தால் ஏற்படும் பூஞ்சை அல்லது பாக்டீரியா தொற்று', 'ஒவ்வாமை காரணமாக தோலில் ஹிஸ்டமைன் சுரப்பு அதிகரிப்பது'],
        steps: ['வீரியம் குறைந்த (mild) வாசனை இல்லாத சோப்புகளைப் பயன்படுத்துங்கள்', 'குளித்து முடித்தவுடன் ஈரம் காய்வதற்குள் தேங்காய் எண்ணெய் அல்லது மாய்ஸ்சரைசர் பூசுங்கள்', 'லேசான, பருத்தி ஆடைகளை அணியுங்கள்', 'அரிக்கும் இடத்தில் நகங்களால் சொறிவதைத் தவிருங்கள் (இது தொற்றை அதிகரிக்கும்)'],
        care: ['தடிப்புகள் உடல் முழுவதும் வேகமாகப் பரவினாலோ அல்லது உதடு, கண்களில் வீக்கம் ஏற்பட்டாலோ உடனே அவசர உதவி பெறவும்', 'தோலில் சீழ் பிடித்தாலோ, அதிக சூடாகவும் வலியாகவும் இருந்தாலோ மருத்துவரை அணுகவும்', 'ஒரு வாரத்திற்கு மேலாகியும் தோல் அரிப்பு குறையவில்லை என்றால் தோல் மருத்துவரிடம் செல்லுங்கள்'],
        watch: ['புதிய சோப், உடை அல்லது உணவுக்குப் பிறகு இது தொடங்கியதா என்பதைக் கவனியுங்கள்', 'தோலில் கொப்புளங்கள் அல்லது செதில் போன்ற உதிர்தல் உள்ளதா என்று பாருங்கள்', 'இரவில் அரிப்பு அதிகமாக உள்ளதா என்பதைக் கண்காணியுங்கள்'],
        prompts: ['இது ஏதேனும் குறிப்பிட்ட ஒவ்வாமையால் (allergy) ஏற்பட்டதா?', 'தோல் பாதுகாப்பிற்கு நான் என்ன களிம்பு (cream) பயன்படுத்த வேண்டும்?'],
        tip: 'குளித்த உடனே சில துளிகள் தேங்காய் எண்ணெய் தடவுவது தோலின் இயற்கை ஈரப்பதத்தைப் பாதுகாத்து வறட்சி மற்றும் அரிப்பைத் தடுக்கும்.',
        yt: 'skin itching rash home remedies tamil'
      }
    },
    nausea: {
      en: {
        title_en: 'Nausea, Upset Stomach & Recovery',
        title_ta: 'குமட்டல் மற்றும் வாந்தி பராமரிப்பு',
        answer: 'Nausea and upset stomach are common body responses to viral gastroenteritis (stomach bug), food intolerance, motion, dehydration, or acid irritation.',
        why: ['Stomach lining irritation from food, microbes, or toxins', 'Slow gastric emptying or gastroesophageal reflex activation', 'Inner ear motion signals conflicting with visual balance cues', 'Dehydration and electrolyte shifts irritating the gut'],
        steps: ['Sip small amounts of clear fluids (water, oral rehydration solution, electrolyte water)', 'Sip warm ginger tea or suck on a mild ginger/mint lozenge', 'Follow the BRAT diet (Bananas, Rice, Applesauce, Toast) when ready for bland solids', 'Rest with your head comfortably elevated; avoid lying completely flat'],
        care: ['Seek immediate care if vomiting is continuous and you cannot keep liquids down for >12 hours', 'Get urgent medical evaluation if you vomit blood or coffee-ground material', 'Seek immediate help if accompanied by severe abdominal pain, high fever, or confusion'],
        watch: ['Ability to keep small sips of water down', 'Frequency of urination and color of urine (sign of hydration level)', 'Any accompanying diarrhea, cramping, or headache'],
        prompts: ['What are the best rehydration guidelines for my current symptoms?', 'Should we test for foodborne infection if symptoms persist?'],
        tip: 'Taking tiny sips of oral rehydration solution every 5 minutes is much better absorbed by an irritated stomach than drinking a full glass at once.',
        yt: 'how to stop nausea and vomiting doctor advice'
      },
      ta: {
        title_en: 'Nausea, Upset Stomach & Recovery',
        title_ta: 'குமட்டல் மற்றும் வாந்தி பராமரிப்பு',
        answer: 'குமட்டல் மற்றும் வாந்தி உணர்வு பொதுவாக செரிமானக் கோளாறு, தவறான உணவு உட்கொள்ளல், கிருமித் தொற்று அல்லது நீர்ச்சத்து குறைபாட்டால் ஏற்படுகிறது.',
        why: ['வயிற்றில் ஏற்படும் அஜீரணம் அல்லது ஒவ்வாத உணவு உட்கொள்ளல்', 'வைரஸ் தொற்று காரணமாக இரைப்பை அழற்சி அடைவது', 'உடலில் நீர்ச்சத்து மற்றும் எலக்ட்ரோலைட் உப்புகள் குறைவது', 'பயணத்தின் போது ஏற்படும் அசைவுகளால் மூளைக்கு செல்லும் குழப்பமான சமிக்ஞைகள்'],
        steps: ['ஒரே நேரத்தில் நிறைய நீர் குடிக்காமல், சிறிது சிறிதாக வாய்விட்டு நீர் அல்லது ORS திரவம் அருந்துங்கள்', 'லேசான இஞ்சித் தேநீர் அல்லது எலுமிச்சை சாறு குடிப்பது குமட்டலைக் குறைக்கும்', 'வயிற்றுக்கு இதமான கஞ்சி, இட்லி அல்லது பழுத்த வாழைப்பழம் போன்ற எளிய உணவுகளை உண்ணுங்கள்', 'சாப்பிட்டவுடன் படுக்காமல் தலையை சற்று உயர்த்தி வைத்து ஓய்வெடுங்கள்'],
        care: ['தொடர்ந்து வாந்தி ஏற்பட்டு தண்ணீர் கூட குடிக்க முடியாவிட்டால் உடனே மருத்துவமனைக்குச் செல்லவும்', 'வாந்தியில் ரத்தம் அல்லது காபி தூள் நிறத்தில் வெளிவந்தால் அவசர சிகிச்சை பெறவும்', 'கடுமையான வயிற்று வலி அல்லது அதிக காய்ச்சல் இருந்தால் மருத்துவரை அணுகவும்'],
        watch: ['போதுமான அளவு சிறுநீர் கழிக்க முடிகிறதா (நீர்ச்சத்து நிலை) என்பதைக் கவனியுங்கள்', 'வயிற்றுப்போக்கு அல்லது தலைசுற்றல் உள்ளதா என்று பாருங்கள்', 'இஞ்சி நீர் அருந்திய பிறகு குமட்டல் குறைகிறதா என்று கண்காணியுங்கள்'],
        prompts: ['எனக்கு குளுக்கோஸ் அல்லது எலக்ட்ரோலைட் ட்ரிப் (IV fluid) தேவையா?', 'வாந்தியை நிறுத்த நான் என்ன பாதுகாப்பு முறைகளைப் பின்பற்ற வேண்டும்?'],
        tip: 'வாந்தி இருக்கும்போது ஒரே மூச்சில் தண்ணீர் குடிக்காமல், 5 நிமிடங்களுக்கு ஒருமுறை ஒரு ஸ்பூன் அளவு நீர் அருந்துவது இரைப்பையை அமைதிப்படுத்தும்.',
        yt: 'vomiting and nausea home remedies tamil'
      }
    },
    dizziness: {
      en: {
        title_en: 'Dizziness, Balance & Lightheadedness',
        title_ta: 'மயக்கம் மற்றும் தலைசுற்றல் வழிகாட்டுதல்',
        answer: 'Dizziness often arises from mild dehydration, temporary blood pressure drops upon standing (orthostatic hypotension), inner ear balance disturbances (vertigo), or low blood sugar.',
        why: ['Transient drop in blood flow to the brain when standing quickly', 'Dehydration or low fluid and electrolyte levels', 'Inner ear vestibular fluid or crystal displacement causing false motion sensation', 'Missed meals or low blood glucose levels'],
        steps: ['Sit or lie down immediately when feeling lightheaded to prevent falls', 'Drink a large glass of water with an electrolyte pinch or citrus', 'When getting out of bed, sit upright on the edge for 30 seconds before standing', 'Avoid rapid head turns, bright flashing lights, or sudden movements'],
        care: ['Seek emergency care if dizziness is accompanied by slurred speech, facial weakness, numbness, or chest pain', 'Get immediate medical evaluation if dizziness follows a head injury or causes a blackout/faint', 'Consult a doctor if vertigo is severe, persistent, or accompanied by hearing loss'],
        watch: ['Whether the room feels like it is spinning (vertigo) vs feeling faint (lightheaded)', 'If dizziness occurs specifically when standing up or turning your head', 'Duration of each dizzy episode (seconds, minutes, or hours)'],
        prompts: ['Could an inner ear evaluation (like the Epley maneuver) help my vertigo?', 'Should we check my orthostatic blood pressure or blood counts?'],
        tip: 'Pausing in a seated position for 30 seconds before standing from bed gives your blood vessels time to adjust and prevents morning head rushes.',
        yt: 'dizziness causes when to see doctor explanation'
      },
      ta: {
        title_en: 'Dizziness, Balance & Lightheadedness',
        title_ta: 'மயக்கம் மற்றும் தலைசுற்றல் வழிகாட்டுதல்',
        answer: 'தலைசுற்றல் மற்றும் மயக்கம் பொதுவாக நீரிழப்பு, படுக்கையிலிருந்து திடீரென எழுவது, காதின் உட்புற சமநிலை மாற்றம் (vertigo) அல்லது குறைந்த ரத்த அழுத்தத்தால் ஏற்படுகிறது.',
        why: ['படுக்கையிலிருந்து வேகமாக எழும்போது மூளைக்குச் செல்லும் ரத்த ஓட்டம் தற்காலிகமாகக் குறைவது', 'போதுமான தண்ணீர் குடிக்காததால் ஏற்படும் நீரிழப்பு', 'உள் காதில் உள்ள சமநிலை திரவத்தில் ஏற்படும் மாற்றம்', 'நேரத்திற்கு சாப்பிடாமல் ரத்தத்தில் சர்க்கரை அளவு குறைவது'],
        steps: ['தலைசுற்றல் தோன்றியவுடன் கீழே விழுந்துவிடாமல் உடனே ஓரிடத்தில் அமருங்கள் அல்லது படுங்கள்', 'நன்கு தண்ணீர் அல்லது எலுமிச்சை உப்பு நீர் அருந்துங்கள்', 'காலையில் எழும்போது படுக்கையின் ஓரத்தில் 30 நொடிகள் அமர்ந்து பின்னர் மெதுவாக எழுந்து நில்லுங்கள்', 'தலையை திடீரென வேகமாக திருப்புவதைத் தவிருங்கள்'],
        care: ['தலைசுற்றலுடன் பேச்சு குழறுதல், வாய் கோணுதல், கை கால் பலவீனம் அல்லது நெஞ்சு வலி வந்தால் உடனே 112 அழையுங்கள்', 'தலையில் அடிபட்ட பிறகு தலைசுற்றல் ஏற்பட்டால் உடனடியாக அவசர சிகிச்சைப் பிரிவிற்குச் செல்லவும்', 'மயக்கம் போட்டு கீழே விழுந்தாலோ அல்லது காது கேட்கும் திறன் குறைந்தாலோ மருத்துவரை அணுகவும்'],
        watch: ['சுற்றியுள்ள பொருட்கள் சுழல்வது போல் உள்ளதா (vertigo) அல்லது கண்கள் இருண்டு போவது போல் உள்ளதா என்று பாருங்கள்', 'தலையை திருப்பும்போது மட்டும் ஏற்படுகிறதா என்று கண்காணியுங்கள்', 'தண்ணீர் குடித்த பிறகு மயக்கம் குறைகிறதா என்று கவனியுங்கள்'],
        prompts: ['எனக்கு உள் காது சமநிலைப் பரிசோதனை (vestibular test) தேவையா?', 'ரத்த அழுத்தம் அல்லது ரத்த சோகை உள்ளதா என்று பரிசோதிக்க வேண்டுமா?'],
        tip: 'படுக்கையிலிருந்து திடீரென எழுந்து நிற்காமல், சில நொடிகள் அமர்ந்து பின்னர் எழுவது தலைசுற்றலையும் கீழே விழுவதையும் தடுக்கும் எளிய பழக்கமாகும்.',
        yt: 'dizziness and vertigo causes tamil medical tips'
      }
    },
    medication: {
      en: {
        title_en: 'Medication Safety & Responsible Use',
        title_ta: 'மருந்து பாதுகாப்பு மற்றும் பயன்பாடு',
        answer: 'All medications—including over-the-counter tablets—have specific dosing guidelines, indications, and potential interactions. Taking medications responsibly protects organ health.',
        why: ['Liver and kidney metabolism processing drug compounds and metabolites', 'Potential interactions between medications, food, and alcohol', 'Risk of cumulative toxicity from exceeding recommended maximum daily doses'],
        steps: ['Always read the patient information leaflet for exact dosage and age instructions', 'Take medicines with a full glass of water and strictly follow meal requirements', 'Keep an up-to-date list of all vitamins, supplements, and tablets you take', 'Never double up doses if you miss a scheduled time'],
        care: ['Seek immediate emergency care if you experience hives, swelling of the face/throat, or difficulty breathing after taking a medicine', 'Get urgent medical help immediately if you suspect an accidental overdose', 'Consult your pharmacist or prescribing clinician before combining medications'],
        watch: ['Any unexpected side effects like stomach upset, drowsiness, or rash', 'Exact time and dose when you took the medication', 'Interactions with caffeine, dairy, or other daily supplements'],
        prompts: ['Are there potential interactions between my medications and supplements?', 'What is the safest dose and schedule for my specific health context?'],
        tip: 'Always consult a registered pharmacist or doctor before taking two medications together, even common pain relievers or cold tablets.',
        yt: 'medication safety tips doctor advice'
      },
      ta: {
        title_en: 'Medication Safety & Responsible Use',
        title_ta: 'மருந்து பாதுகாப்பு மற்றும் பயன்பாடு',
        answer: 'எந்தவொரு மருந்தையும் (பாராசிட்டமால் உள்பட) மருத்துவர் அல்லது மருந்தாளுநரின் வழிகாட்டுதல்படி சரியான அளவில் எடுத்துக்கொள்வது மிக அவசியம்.',
        why: ['மருந்துகள் கல்லீரல் மற்றும் சிறுநீரகங்கள் மூலமாகவே உடலில் செயலாக்கப்படுகின்றன', 'அளவுக்கு அதிகமாக உட்கொண்டால் உடல் உறுப்புகளுக்கு நச்சுத்தன்மை ஏற்பட வாய்ப்புள்ளது', 'உணவு, தேநீர் அல்லது பிற மருந்துகளுடன் தவறான முறையில் இணையும் போது பக்கவிளைவுகள் உண்டாகலாம்'],
        steps: ['மருந்துப் பெட்டியில் உள்ள அளவு மற்றும் வழிமுறைகளைக் கவனமாகப் படியுங்கள்', 'மருந்துகளை எப்போதும் போதுமான அளவு தண்ணீருடன் மட்டுமே விழுங்குங்கள்', 'ஒரு வேளை மருந்தை மறந்துவிட்டால், அடுத்த முறை இரட்டிப்பாக உட்கொள்ளாதீர்கள்', 'மருந்துகளை சிறுவர்கள் தொட முடியாத குளிர்ந்த, உலர்ந்த இடத்தில் வையுங்கள்'],
        care: ['மருந்து சாப்பிட்ட பிறகு உதடு/தொண்டை வீக்கம், அரிப்பு அல்லது மூச்சுத் திணறல் ஏற்பட்டால் உடனே அவசர மருத்துவ உதவி பெறுங்கள்', 'தவறுதலாக அதிக அளவு மருந்து உட்கொண்டால் உடனே மருத்துவமனைக்குச் செல்லவும்', 'சுயமாக ஆன்டிபயாடிக் அல்லது வீரியமிக்க மருந்துகளை வாங்கி உட்கொள்ளாதீர்கள்'],
        watch: ['மருந்து சாப்பிட்ட பின் ஏதேனும் குமட்டல், மயக்கம் அல்லது தோல் தடிப்பு உள்ளதா என்று பாருங்கள்', 'மருந்து சாப்பிட்ட நேரத்தைக் குறித்து வையுங்கள்', 'மருந்து உட்கொண்ட பிறகு வலி குறைகிறதா என்று கண்காணியுங்கள்'],
        prompts: ['நான் உட்கொள்ளும் மருந்துகளுக்கு இடையே ஏதேனும் பக்கவிளைவு உள்ளதா?', 'இந்த மருந்தை உணவுக்கு முன்பா அல்லது பின்பா சாப்பிட வேண்டும்?'],
        tip: 'மருந்துகளை சுயமாக எடுத்துக்கொள்ளாமல், மருத்துவர் அல்லது பதிவுசெய்த மருந்தாளுநரிடம் (pharmacist) ஆலோசனை பெறுவதே பாதுகாப்பானது.',
        yt: 'medicine safety precautions tamil doctor'
      }
    },
    headache: {
      en: {
        title_en: 'Understanding Headaches',
        title_ta: 'தலைவலியைப் புரிந்துகொள்வது',
        answer: 'Headaches are commonly triggered by tension, dehydration, lack of sleep, eye strain, or sinus pressure. Most resolve with simple self-care, but persistent or sudden severe headaches warrant medical assessment.',
        why: ['Tension and muscle tightness in the neck and scalp', 'Dehydration or skipped meals causing blood vessel changes', 'Prolonged screen time leading to eye fatigue', 'Poor sleep quality or heightened stress levels'],
        steps: ['Drink a full glass of water and rest in a quiet, dimly lit room', 'Apply a gentle cool or warm compress across your forehead or neck', 'Take regular screen breaks using the 20-20-20 rule', 'Keep a symptom diary tracking when headaches occur and potential triggers'],
        care: ['Seek immediate care if the headache is sudden and explosive (thunderclap headache)', 'See a doctor if accompanied by fever, stiff neck, confusion, or visual loss', 'Consult a doctor if headaches are becoming more frequent or interfere with daily life'],
        watch: ['Time of onset, duration, and whether pain is throbbing or dull', 'Any associated sensitivity to light or sound', 'Whether pain responds to hydration and rest'],
        prompts: ['Could my headaches be related to stress, posture, or screen use?', 'Are there lifestyle modifications or specific evaluations you recommend?'],
        tip: 'Over 90% of headaches are primary headaches (tension or migraine) and respond well to regular hydration and sleep schedules.',
        yt: 'headache causes and relief doctor education'
      },
      ta: {
        title_en: 'Understanding Headaches',
        title_ta: 'தலைவலியைப் புரிந்துகொள்வது',
        answer: 'தலைவலி பொதுவாக தசை இறுக்கம், நீர்ச்சத்து குறைபாடு, தூக்கமின்மை, கண் சோர்வு அல்லது மன அழுத்தத்தால் ஏற்படலாம். பெரும்பாலானவை ஓய்வு மற்றும் நீர் அருந்துவதால் சரியாகும்.',
        why: ['கழுத்து மற்றும் தலையில் உள்ள தசை இறுக்கம்', 'உடலில் நீர்ச்சத்து குறைதல் அல்லது நேரம் தவறி சாப்பிடுதல்', 'நீண்ட நேரம் திரை (screen) பார்ப்பதால் ஏற்படும் கண் சோர்வு', 'முறையற்ற தூக்கம் மற்றும் மன அழுத்தம்'],
        steps: ['நன்கு தண்ணீர் குடித்து அமைதியான, வெளிச்சம் குறைந்த அறையில் ஓய்வெடுக்கவும்', 'நெற்றி அல்லது கழுத்தில் லேசான குளிர்ந்த அல்லது வெதுவெதுப்பான ஒத்தடம் கொடுக்கலாம்', 'தொடர்ந்து திரை பார்ப்பதைத் தவிர்த்து கண்களுக்கு ஓய்வு கொடுக்கவும்', 'தலைவலி எப்போது வருகிறது என்ற குறிப்பை பராமரிக்கவும்'],
        care: ['திடீரென மின்னல் போல் கடுமையான தலைவலி வந்தால் உடனே மருத்துவமனைக்குச் செல்லவும்', 'காய்ச்சல், கழுத்து விரைப்பு, பார்வை மங்குதல் அல்லது குழப்பம் இருந்தால் உடனே மருத்துவரை அணுகவும்', 'தலைவலி நாளுக்கு நாள் அதிகரித்தால் மருத்துவ ஆலோசனை பெறவும்'],
        watch: ['தலைவலி எப்போது தொடங்குகிறது, எவ்வளவு நேரம் நீடிக்கிறது என்பதைக் கவனியுங்கள்', 'ஒளி அல்லது சத்தத்தை பார்க்கும்போது தலைவலி அதிகரிக்கிறதா என்பதைக் கவனியுங்கள்', 'தண்ணீர் குடித்த பிறகு வலி குறைகிறதா என்பதைக் கவனியுங்கள்'],
        prompts: ['என் தலைவலிக்கு தூக்கமின்மை அல்லது கண் சோர்வு காரணமா?', 'நான் ஏதேனும் குறிப்பிட்ட பரிசோதனை செய்ய வேண்டுமா?'],
        tip: 'தலைவலிக்கு போதுமான அளவு தண்ணீர் குடிப்பதும், 7-8 மணி நேர தரமான தூக்கமும் மிகச் சிறந்த முதலுதவியாகும்.',
        yt: 'headache causes and home relief education'
      }
    },
    digestion: {
      en: {
        title_en: 'Digestive Comfort & Bloating',
        title_ta: 'செரிமானம் மற்றும் வயிறு உப்புசம்',
        answer: 'Bloating and digestive discomfort typically occur when gas builds up in the digestive tract, often following large meals, eating quickly, or consuming carbonated drinks or gas-producing foods.',
        why: ['Swallowing air from eating or drinking too quickly', 'Fermentation of certain carbohydrates and fibres in the colon', 'Sluggish digestion or mild food intolerances (such as dairy or gluten)', 'Inactivity after meals slowing intestinal motility'],
        steps: ['Take a gentle 10-15 minute walk after meals to encourage digestion', 'Eat meals slowly and chew thoroughly to minimize swallowed air', 'Sip warm water or peppermint/ginger herbal infusion', 'Note which foods seem to precede bloating episodes'],
        care: ['Consult a doctor if bloating is accompanied by severe abdominal pain, persistent vomiting, or fever', 'Seek evaluation if you notice unexplained weight loss or changes in bowel habits lasting over two weeks', 'Get immediate medical help if there is black or bloody stool'],
        watch: ['Which specific foods or meal sizes trigger the feeling', 'Whether bloating improves after passing gas or bowel movements', 'If bloating is worse in the evening than the morning'],
        prompts: ['Could these symptoms suggest food sensitivity or acid reflux?', 'Are there dietary guidelines or digestive aids you recommend?'],
        tip: 'Eating smaller, more frequent meals and walking gently after eating helps the stomach empty smoothly.',
        yt: 'bloating and digestion relief doctor explanation'
      },
      ta: {
        title_en: 'Digestive Comfort & Bloating',
        title_ta: 'செரிமானம் மற்றும் வயிறு உப்புசம்',
        answer: 'வயிறு உப்புசம் மற்றும் செரிமானக் கோளாறு பொதுவாக வேகமாக சாப்பிடுவது, வாயுவை உண்டாக்கும் உணவுகள் அல்லது முறையற்ற உணவுப் பழக்கங்களால் வாயு சேர்வதால் ஏற்படுகிறது.',
        why: ['வேகமாக சாப்பிடும் போது காற்று உள்ளே செல்வது', 'செரிமானப் பாதையில் சில உணவுகள் நொதித்தல் அடைந்து வாயு உண்டாக்குவது', 'சாப்பிட்ட உடனே படுப்பது அல்லது அசையாமல் இருப்பது', 'பால் பொருட்கள் அல்லது காரமான உணவுகளால் ஏற்படும் செரிமான மந்தம்'],
        steps: ['சாப்பிட்ட பிறகு 10-15 நிமிடங்கள் மெதுவாக நடைப்பயிற்சி செய்யுங்கள்', 'உணவை நன்றாக மென்று பொறுமையாக உண்ணுங்கள்', 'வெதுவெதுப்பான நீர் அல்லது சீரகத் தண்ணீர் குடிக்கவும்', 'எந்த உணவுகள் உப்புசத்தை ஏற்படுத்துகின்றன என்பதைக் கண்காணியுங்கள்'],
        care: ['கடுமையான வயிற்று வலி, தொடர்ந்து வாந்தி அல்லது காய்ச்சல் இருந்தால் மருத்துவரை அணுகவும்', 'மலம் கழிக்கும் வழக்கத்தில் தொடர் மாற்றம் அல்லது திடீர் உடல் எடை குறைவு இருந்தால் மருத்துவரிடம் செல்லவும்', 'மலத்தில் ரத்தம் அல்லது கருப்பு நிற மலம் வெளியேறினால் உடனே அவசர உதவி பெறவும்'],
        watch: ['எந்த உணவை உட்கொண்ட பிறகு வயிறு உப்புசம் ஏற்படுகிறது என்பதைக் கவனியுங்கள்', 'காலையில் வயிறு இயல்பாக இருந்து மாலையில் உப்புசம் அதிகரிக்கிறதா என்பதைக் கவனியுங்கள்', 'வயிறு வலி ஏதேனும் ஒரு குறிப்பிட்ட இடத்தில் உள்ளதா என்பதைப் பாருங்கள்'],
        prompts: ['எனக்கு அஜீரணம் அல்லது உணவு ஒவ்வாமை ஏதேனும் உள்ளதா?', 'செரிமானத்தை மேம்படுத்த நான் என்ன உணவுகளைத் தவிர்க்க வேண்டும்?'],
        tip: 'சாப்பிட்டவுடன் படுக்காமல், சிறிது நேரம் நேராக அமர்ந்திருப்பது அல்லது மெதுவாக நடப்பது நெஞ்செரிச்சலையும் உப்புசத்தையும் கணிசமாகக் குறைக்கும்.',
        yt: 'indigestion and bloating tamil health guide'
      }
    },
    fatigue: {
      en: {
        title_en: 'Sleep, Energy & Fatigue',
        title_ta: 'சோர்வு மற்றும் தூக்க சுழற்சி',
        answer: 'Feeling tired despite spending time in bed often points to poor sleep quality, disrupted sleep cycles, dehydration, nutritional deficiencies, or accumulated stress.',
        why: ['Fragmented sleep architecture (frequent micro-awakenings)', 'Dehydration or irregular meal timing dropping blood sugar levels', 'Screen exposure before bed suppressing natural melatonin release', 'Nutritional factors like low iron, vitamin D, or B12 levels'],
        steps: ['Maintain a consistent wake-up and sleep schedule, even on weekends', 'Avoid screens and bright blue light at least 45 minutes before sleep', 'Ensure adequate daily hydration and balanced protein-rich meals', 'Get 15-20 minutes of natural morning sunlight to set your circadian rhythm'],
        care: ['Consult a doctor if fatigue is persistent, unrefreshing for over 3-4 weeks, or worsening', 'Seek evaluation if fatigue is accompanied by shortness of breath, sudden weight changes, or enlarged lymph nodes', 'Consult a clinician if you snore loudly or gasp for air during sleep'],
        watch: ['Whether energy fluctuates at specific times of the day', 'Hours of actual sleep vs. time spent in bed', 'Any accompanying brain fog, muscle aches, or mood changes'],
        prompts: ['Should we check basic blood panels like complete blood count, ferritin, or thyroid levels?', 'Could a sleep quality assessment be helpful?'],
        tip: 'Morning sunlight exposure within 30 minutes of waking helps your body release cortisol naturally, improving daytime energy and nighttime sleep.',
        yt: 'why am i always tired doctor explanation'
      },
      ta: {
        title_en: 'Sleep, Energy & Fatigue',
        title_ta: 'சோர்வு மற்றும் தூக்க சுழற்சி',
        answer: 'நீண்ட நேரம் தூங்கினாலும் சோர்வாக இருப்பது, ஆழ்ந்த தூக்கம் கிடைக்காதது, நீர்ச்சத்து குறைவு, ஊட்டச்சத்து பற்றாக்குறை அல்லது மன அழுத்தத்தைக் குறிக்கலாம்.',
        why: ['ஆழ்ந்த தூக்கம் தடைபடுதல் (அடிக்கடி விழிப்பு வருவது)', 'இரத்தத்தில் இரும்புச்சத்து (ஹீமோகுளோபின்) அல்லது வைட்டமின் குறைபாடு', 'தூங்கும் முன் மொபைல் அல்லது டிவி திரைகளைப் பார்ப்பதால் மெலடோனின் குறைவது', 'நீரிழப்பு மற்றும் முறையற்ற உணவுப் பழக்கம்'],
        steps: ['தினமும் ஒரே நேரத்தில் தூங்கி, ஒரே நேரத்தில் எழும் பழக்கத்தை வழக்கமாக்குங்கள்', 'தூங்குவதற்கு 45 நிமிடங்களுக்கு முன் மொபைல் அல்லது கணினித் திரைகளைத் தவிருங்கள்', 'காலை நேரத்தில் 15-20 நிமிடங்கள் சூரிய ஒளியில் உடற்பயிற்சி அல்லது நடைப்பயிற்சி செய்யுங்கள்', 'சத்தான உணவுகளையும் போதிய அளவு நீரையும் எடுத்துக்கொள்ளுங்கள்'],
        care: ['சோர்வு 3-4 வாரங்களுக்கு மேலாக தொடர்ந்து நீடித்தால் மருத்துவரை அணுகவும்', 'மூச்சுத் திணறல், படபடப்பு அல்லது அதிக எடை இழப்புடன் சோர்வு இருந்தால் பரிசோதனை அவசியம்', 'தூக்கத்தில் குறட்டை அல்லது மூச்சுத் திணறல் இருந்தால் மருத்துவரிடம் தெரிவியுங்கள்'],
        watch: ['எந்த நேரத்தில் சோர்வு அதிகமாக உள்ளது என்பதைக் கவனியுங்கள்', 'பகலில் தூக்கம் வருகிறதா அல்லது உடல் தளர்ச்சியாக உள்ளதா என்பதைப் பாருங்கள்', 'உணவு சாப்பிட்ட பிறகு சோர்வு அதிகரிக்கிறதா என்பதைக் கண்காணியுங்கள்'],
        prompts: ['எனக்கு ரத்த சோகை அல்லது தைராய்டு பரிசோதனை தேவையா?', 'என் தூக்கத்தின் தரத்தை எவ்வாறு மேம்படுத்துவது?'],
        tip: 'காலை வெயிலில் சில நிமிடங்கள் இருப்பது உடலின் உயிரியல் கடிகாரத்தை (circadian rhythm) சீராக்கி, இரவில் நல்ல ஆழ்ந்த தூக்கத்தைத் தரும்.',
        yt: 'fatigue causes and solutions tamil medical tips'
      }
    },
    fever: {
      en: {
        title_en: 'Fever & Temperature Guidance',
        title_ta: 'காய்ச்சல் மற்றும் உடல் வெப்பநிலை',
        answer: 'Fever is the immune system’s natural and coordinated defense against viral or bacterial infections. Elevated body temperature creates an environment where pathogens struggle to multiply.',
        why: ['Immune release of pyrogens signaling the hypothalamus to elevate temperature', 'Common viral infections such as seasonal flu or rhinovirus', 'Body’s natural defense mechanism fighting an infection'],
        steps: ['Rest adequately to allow the immune system to devote energy to healing', 'Drink plenty of fluids (water, broth, coconut water, or oral rehydration solution)', 'Wear light, breathable clothing and rest in a well-ventilated room', 'Monitor temperature periodically using a digital thermometer'],
        care: ['Seek immediate care if temperature exceeds 39.4°C (103°F) or does not respond to standard measures', 'Get urgent help if fever is accompanied by stiff neck, confusion, seizure, or rash', 'Consult a doctor if fever persists for more than 3 consecutive days'],
        watch: ['Exact thermometer readings and time of day', 'Associated symptoms such as chills, body aches, cough, or nausea', 'Response to hydration, light rest, or over-the-counter antipyretics'],
        prompts: ['Based on my other symptoms, what might be the source of the fever?', 'At what point should I come in for laboratory testing?'],
        tip: 'Fever itself is rarely dangerous; it is evidence that your immune system is actively doing its job.',
        yt: 'fever when to see doctor explanation'
      },
      ta: {
        title_en: 'Fever & Temperature Guidance',
        title_ta: 'காய்ச்சல் மற்றும் உடல் வெப்பநிலை',
        answer: 'காய்ச்சல் என்பது உடலின் நோய் எதிர்ப்பு மண்டலம் தொற்றுக்கு எதிராக செயல்படும் இயற்கையான அறிகுறியாகும். கிருமிகளை அழிக்க உடல் வெப்பநிலையை தற்காலிகமாக உயர்த்துகிறது.',
        why: ['வைரஸ் அல்லது பாக்டீரியா தொற்றை எதிர்க்கும் உடலின் பாதுகாப்பு செயல்பாடு', 'பருவநிலை மாற்றத்தால் ஏற்படும் சாதாரண சளி அல்லது ஃப்ளூ தொற்று', 'உடலில் நீர்ச்சத்து குறைதல் மற்றும் சோர்வு'],
        steps: ['நன்கு ஓய்வெடுங்கள்; உடல் குணமடைய ஓய்வு மிக முக்கியம்', 'தாராளமாக நீர், கஞ்சி, இளநீர் அல்லது பழச்சாறுகள் அருந்துங்கள்', 'லேசான பருத்தி ஆடைகளை அணியுங்கள் மற்றும் நல்ல காற்றோட்டமுள்ள அறையில் இருங்கள்', 'டிஜிட்டல் தெர்மாமீட்டர் மூலம் உடல் வெப்பநிலையைக் குறித்து வையுங்கள்'],
        care: ['வெப்பநிலை 103°F (39.4°C) மேல் சென்றால் உடனே மருத்துவமனைக்குச் செல்லவும்', 'கழுத்து விரைப்பு, மூச்சுத் திணறல், அதீத சோர்வு அல்லது வலிப்பு வந்தால் உடனடியாக அவசர உதவி பெறவும்', 'காய்ச்சல் 3 நாட்களுக்கு மேல் தொடர்ந்து நீடித்தால் மருத்துவரை அணுகவும்'],
        watch: ['காய்ச்சல் எப்போது ஏறுகிறது, குறைகிறது என்பதை அளந்து குறித்துக்கொள்ளுங்கள்', 'இருமல், தொண்டை வலி, உடல் வலி போன்ற பிற அறிகுறிகள் உள்ளதா என்று பாருங்கள்', 'போதுமான அளவு சிறுநீர் போகிறதா (நீர்ச்சத்து நிலை) என்பதைக் கவனியுங்கள்'],
        prompts: ['காய்ச்சலுக்கு ரத்தப் பரிசோதனை ஏதேனும் செய்ய வேண்டுமா?', 'நான் வீட்டில் பின்பற்ற வேண்டிய சிறந்த முறைகள் என்ன?'],
        tip: 'காய்ச்சல் இருக்கும்போது போதிய அளவு நீர் அருந்துவது உடல் சூட்டைத் தணித்து, நீரிழப்பைத் தடுத்து விரைவில் குணமடைய உதவும்.',
        yt: 'fever home care tamil doctor tips'
      }
    },
    cold: {
      en: {
        title_en: 'Cough, Cold & Throat Care',
        title_ta: 'சளி, இருமல் மற்றும் தொண்டை பராமரிப்பு',
        answer: 'Common colds and coughs are viral respiratory infections that usually run their course within 7 to 10 days. Supportive hydration, rest, and steam inhalation offer the most proven comfort.',
        why: ['Upper respiratory viral irritation stimulating mucosal secretions', 'Post-nasal drip triggering the throat cough reflex', 'Temporary airway inflammation from environmental dry air or allergens'],
        steps: ['Stay well-hydrated with warm water, herbal teas, or warm soups', 'Gargle with warm salt water to relieve throat irritation', 'Use warm steam inhalation to clear nasal passages', 'Elevate your head slightly during sleep to reduce nighttime coughing'],
        care: ['Seek care if you experience shortness of breath, chest tightness, or wheezing', 'Consult a clinician if cough produces blood or thick rusty sputum', 'See a doctor if symptoms worsen after 10 days or fever returns'],
        watch: ['Type of cough (dry vs. productive with phlegm)', 'Color of nasal discharge or phlegm', 'Whether cough is worse lying down at night'],
        prompts: ['Could allergies or sinus infection be contributing to this cough?', 'Are there soothing remedies you recommend for my age and health status?'],
        tip: 'Honey (for individuals over 1 year of age) has been shown in clinical trials to be as effective as many commercial cough syrups for soothing nighttime coughs.',
        yt: 'common cold and cough relief doctor advice'
      },
      ta: {
        title_en: 'Cough, Cold & Throat Care',
        title_ta: 'சளி, இருமல் மற்றும் தொண்டை பராமரிப்பு',
        answer: 'சளி மற்றும் இருமல் பொதுவாக வைரஸ் தொற்றால் ஏற்படுகிறது. இது வழக்கமாக 7 முதல் 10 நாட்களுக்குள் உடலின் நோய் எதிர்ப்பு ஆற்றலால் குணமாகும்.',
        why: ['சுவாசப் பாதையில் ஏற்படும் வைரஸ் தொற்று மற்றும் சளி உருவாக்கம்', 'மூக்கிலிருந்து தொண்டைக்கு சளி இறங்குவதால் (post-nasal drip) ஏற்படும் இருமல்', 'குளிர்ந்த காற்று அல்லது ஒவ்வாமை காரணமாக ஏற்படும் தொண்டை அழற்சி'],
        steps: ['வெதுவெதுப்பான நீர், மிளகு ரசம் அல்லது மூலிகைத் தேநீர் அருந்துங்கள்', 'வெதுவெதுப்பான உப்பு நீரில் தொண்டையைக் கொப்பளிக்கவும் (gargling)', 'ஆவி பிடிப்பது (steam inhalation) மூக்கடைப்பை நீக்க உதவும்', 'இரவில் தலைப்பகுதியை சற்று உயர்த்தி வைத்து படுப்பது இருமலைக் குறைக்கும்'],
        care: ['மூச்சுத் திணறல், நெஞ்சு வலி அல்லது மூச்சிரைப்பு இருந்தால் உடனே மருத்துவரை அணுகவும்', 'இருமலில் ரத்தம் வெளிவந்தால் தாமதிக்காமல் அவசர சிகிச்சை பெறவும்', '10 நாட்களுக்கு மேலாக இருமல் நீடித்தால் மருத்துவப் பரிசோதனை அவசியம்'],
        watch: ['இருமல் வறட்டு இருமலா அல்லது சளியுடன் கூடிய இருமலா என்பதைக் கவனியுங்கள்', 'இரவில் தூங்கும் போது இருமல் அதிகமாகிறதா என்று பாருங்கள்', 'தொண்டை வலி உணவு விழுங்குவதை பாதிக்கிறதா என்பதைக் கண்காணியுங்கள்'],
        prompts: ['இந்த இருமலுக்கு ஒவ்வாமை காரணமா அல்லது தொற்றா?', 'தொண்டை எரிச்சலைத் தணிக்க என்ன செய்ய வேண்டும்?'],
        tip: 'வெதுவெதுப்பான பாலில் சிறிது மஞ்சள் தூள் மற்றும் மிளகு சேர்த்து அருந்துவது தொண்டை எரிச்சலையும் சளியையும் இயற்கையாகக் குறைக்கும்.',
        yt: 'cold and cough relief home remedies tamil'
      }
    },
    stress: {
      en: {
        title_en: 'Stress, Calm & Nervous System',
        title_ta: 'மன அழுத்தம் மற்றும் நரம்பு மண்டல அமைதி',
        answer: 'Stress and worry trigger the autonomic sympathetic nervous system, causing elevated heart rate, muscle tightness, shallow breathing, and mental tension.',
        why: ['Sympathetic nervous system fight-or-flight activation', 'Elevated cortisol and adrenaline affecting muscle tension', 'Overstimulation from work, screen time, and emotional cognitive load'],
        steps: ['Practice 4-7-8 deep diaphragmatic breathing or physiological sighs', 'Take a 15-minute nature walk away from phones and work screens', 'Perform a progressive muscle relaxation scan to release jaw and shoulder tension', 'Establish healthy boundaries around news, social media, and evening work'],
        care: ['Seek immediate care if anxiety causes severe chest pain, fainting, or panic that feels unmanageable', 'Consult a healthcare professional if anxiety interferes with your ability to sleep, eat, or work for over 2 weeks', 'Get immediate help if you ever experience thoughts of self-harm'],
        watch: ['Physical signs of tension such as clenched teeth or shallow breathing', 'Specific situations, times, or interactions that trigger stress spikes', 'How deeply you are sleeping through the night'],
        prompts: ['What evidence-based stress reduction strategies fit my daily schedule?', 'Could an evaluation for generalized anxiety or stress physiology be helpful?'],
        tip: 'Taking two quick deep nasal inhales followed by one long, slow mouth exhale (the physiological sigh) immediately slows your heart rate.',
        yt: 'how to reduce stress and anxiety breathing neuroscience'
      },
      ta: {
        title_en: 'Stress, Calm & Nervous System',
        title_ta: 'மன அழுத்தம் மற்றும் நரம்பு மண்டல அமைதி',
        answer: 'மன அழுத்தமும் கவலையும் உடலின் நரம்பு மண்டலத்தைத் தூண்டி, இதயத் துடிப்பை அதிகப்படுத்தி, தசை இறுக்கம் மற்றும் அமைதியின்மையை உண்டாக்குகின்றன.',
        why: ['நரம்பு மண்டலத்தின் அவசர பாதுகாப்பு தூண்டுதல் (fight-or-flight)', 'கார்டிசோல் ஹார்மோன் அதிகரிப்பதால் ஏற்படும் உடல் மற்றும் தசை இறுக்கம்', 'அதிக வேலைப்பளு, தூக்கமின்மை மற்றும் மொபைல் பயன்பாடு'],
        steps: ['ஆழமாக மூச்சை உள்ளிழுத்து மெதுவாக வெளியேற்றும் மூச்சுப் பயிற்சி செய்யுங்கள்', 'மொபைல் மற்றும் திரைகளைத் தவிர்த்து 15 நிமிடங்கள் இயற்கை சூழலில் நடங்கள்', 'தோள்பட்டை மற்றும் தாடைத் தசைகளை தளர்வாக வைத்துக்கொள்ளுங்கள்', 'இரவு தூங்குவதற்கு முன் மனதை அமைதிப்படுத்தும் இசையைக் கேட்கலாம்'],
        care: ['கவலை அல்லது பதற்றம் காரணமாக கடுமையான நெஞ்சுவலி அல்லது மயக்கம் வந்தால் உடனே மருத்துவரை அணுகவும்', 'மன அழுத்தம் உங்கள் தினசரி உணவு, தூக்கம் அல்லது வேலையை 2 வாரங்களுக்கு மேல் பாதித்தால் மருத்துவ ஆலோசனை பெறவும்', 'சுய தீங்கு அல்லது ஆபத்தான எண்ணங்கள் தோன்றினால் உடனே அவசர உதவி பெறவும்'],
        watch: ['எந்த சூழ்நிலைகளில் மன அழுத்தம் அதிகமாகிறது என்பதைக் கவனியுங்கள்', 'பதற்றத்தின் போது உங்கள் சுவாசம் மற்றும் இதயத் துடிப்பு எவ்வாறு மாறுகிறது என்று பாருங்கள்', 'போதுமான அளவு ஓய்வு கிடைக்கிறதா என்பதைக் கண்காணியுங்கள்'],
        prompts: ['மன அமைதியை மேம்படுத்த நான் என்ன வாழ்க்கை முறை மாற்றங்களைச் செய்ய வேண்டும்?', 'மன அழுத்தத்தைக் குறைக்க தகுந்த வழிகாட்டல் அல்லது ஆலோசனை தேவையா?'],
        tip: 'இரண்டு முறை மூக்கை நன்றாக உள்ளிழுத்து, வாயால் மெதுவாக நீண்ட மூச்சை வெளியேற்றுவது (physiological sigh) இதயத் துடிப்பை உடனே அமைதிப்படுத்தும்.',
        yt: 'stress relief meditation breathing exercises tamil'
      }
    },
    dynamic_general: {
      en: {
        title_en: cleaned ? `Understanding: ${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)}` : 'Health Guidance & Understanding',
        title_ta: cleaned ? `உடல்நல வழிகாட்டுதல்: ${cleaned}` : 'உடல்நல வழிகாட்டுதல்',
        answer: `Regarding your question about "${cleaned || 'this health topic'}": our body continually responds to lifestyle factors, physiological balance, and rest. Paying careful attention to these factors provides safe, informed starting points for personal wellness.`,
        why: [
          `Everyday physiological adaptations related to ${cleaned || 'bodily processes'}`,
          'Influence of hydration, nutrition, and restorative rest on body functions',
          'Variations in daily physical activity, posture, and recovery intervals',
          'Individual metabolic and biological baselines'
        ],
        steps: [
          `Keep a simple log of any observations or triggers regarding ${cleaned || 'your question'}`,
          'Ensure consistent daily hydration, nutritious balanced meals, and regular sleep',
          'Engage in light, regular physical activity and gentle movement',
          'Consult a qualified healthcare provider for individualized clinical assessment'
        ],
        care: [
          'Seek medical care if symptoms are severe, sudden, persistent, or worsening',
          'Consult a healthcare professional if this issue interferes with daily activities or sleep',
          'Never delay urgent professional care if you feel significantly unwell'
        ],
        watch: [
          `When you first noticed this concern regarding ${cleaned || 'your health'}`,
          'Whether particular activities, foods, or postures improve or worsen the sensation',
          'Any accompanying changes in energy, appetite, or comfort'
        ],
        prompts: [
          `What lifestyle adjustments could best support me regarding ${cleaned || 'this topic'}?`,
          'Are there specific tests or evaluations you would recommend for my situation?'
        ],
        tip: 'A qualified healthcare professional who knows your medical history is always your best source of personalized clinical advice.',
        yt: `${cleaned || 'health wellness'} doctor medical explanation`
      },
      ta: {
        title_en: cleaned ? `Understanding: ${cleaned}` : 'Health Guidance & Understanding',
        title_ta: cleaned ? `உடல்நல வழிகாட்டுதல்: ${cleaned}` : 'உடல்நல வழிகாட்டுதல்',
        answer: `"${cleaned || 'உங்கள் கேள்வி'}" பற்றிய தகவல்: நம் உடல் வாழ்க்கை முறை, உணவு, தூக்கம் மற்றும் சுற்றுச்சூழல் மாற்றங்களுக்கு ஏற்ப செயல்படுகிறது. இதனைப் புரிந்து கொண்டு செயல்படுவது நலம் தரும்.`,
        why: [
          `உடலின் இயல்பான செயல்பாடுகள் மற்றும் சூழலுக்கு ஏற்ப மாறும் தன்மை (${cleaned || 'தொடர்பானது'})`,
          'உணவுமுறை, நீர் அருந்துதல் மற்றும் ஓய்வின் நேரடித் தாக்கம்',
          'மன அமைதியும் உடற்பயிற்சியும் உடலின் ஆற்றலை சீராக வைப்பது',
          'தனிப்பட்ட உடல் ஆரோக்கியம் மற்றும் தற்காலிக மாற்றங்கள்'
        ],
        steps: [
          'அறிகுறிகள் எப்போது தோன்றுகின்றன என்பதைக் குறித்து வையுங்கள்',
          'சீரான தூக்கம், போதிய நீர் அருந்துதல் மற்றும் சத்தான உணவுக்கு முன்னுரிமை கொடுங்கள்',
          'தினசரி சிறிய நடைப்பயிற்சி அல்லது யோகா போன்ற எளிய உடற்பயிற்சிகளை மேற்கொள்ளுங்கள்',
          'தேவைப்படும் போது குடும்ப மருத்துவரிடம் பரிசோதனை செய்துகொள்ளுங்கள்'
        ],
        care: [
          'அறிகுறிகள் தீவிரமாகவோ, புதிதாகவோ அல்லது தொடர்ந்து நீடித்தாலோ மருத்துவரை அணுகவும்',
          'திடீர் மயக்கம், தீவிர வலி அல்லது அசௌகரியம் ஏற்பட்டால் தாமதிக்காமல் மருத்துவ உதவி பெறவும்',
          'உங்கள் உடல்நிலையில் சந்தேகமோ கவலையோ இருந்தால் மருத்துவ ஆலோசனை பெறுங்கள்'
        ],
        watch: [
          'அறிகுறி எப்போது தொடங்கியது, எப்போது குறைகிறது என்பதைக் கவனியுங்கள்',
          'இது உங்கள் அன்றாட வேலைகளைப் பாதிக்கிறதா என்று பாருங்கள்',
          'உணவு அல்லது தூக்க மாற்றங்களுக்குப் பின் ஏதேனும் முன்னேற்றம் உள்ளதா என்பதைக் கண்காணியுங்கள்'
        ],
        prompts: [
          'என் உடல்நிலைக்கு ஏற்ற சிறந்த வாழ்க்கை முறை மாற்றங்கள் எவை?',
          'நான் ஏதேனும் வழக்கமான உடல் பரிசோதனை செய்து கொள்ள வேண்டுமா?'
        ],
        tip: 'உங்கள் தனிப்பட்ட மருத்துவ வரலாற்றை அறிந்த குடும்ப மருத்துவரிடம் நேரில் பேசுவதே எப்போதும் மிகச் சிறந்த வழிகாட்டலாகும்.',
        yt: `${cleaned || 'general health wellness'} tamil medical tips`
      }
    }
  };

  const pack = knowledge[topic] || knowledge.dynamic_general;
  const data = tamil ? pack.ta : pack.en;

  return {
    title_en: data.title_en,
    title_ta: data.title_ta,
    answer: data.answer,
    why_it_happens: data.why,
    what_to_do: data.steps,
    when_to_seek_care: data.care,
    what_to_watch: data.watch,
    discussion_prompts: data.prompts,
    urgency: 'information',
    urgency_message: '',
    fun_fact_or_tip: data.tip,
    youtube_search: data.yt,
    sources: recommendedSources(query)
  };
}

function normalizeAnswer(raw, query, language, context) {
  const defaults = generateEducationalFallback(query, language, context);

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return defaults;
  }

  const urgency = ['information', 'routine', 'soon'].includes(raw.urgency) ? raw.urgency : 'information';

  return {
    title_en: safeText(raw.title_en, 120) || defaults.title_en,
    title_ta: safeText(raw.title_ta, 120) || defaults.title_ta,
    answer: safeText(raw.answer) || defaults.answer,
    why_it_happens: safeList(raw.why_it_happens, defaults.why_it_happens),
    what_to_do: safeList(raw.what_to_do, defaults.what_to_do),
    sources: recommendedSources(query),
    when_to_seek_care: safeList(raw.when_to_seek_care, defaults.when_to_seek_care),
    what_to_watch: safeList(raw.what_to_watch, defaults.what_to_watch),
    discussion_prompts: safeList(raw.discussion_prompts, defaults.discussion_prompts),
    urgency,
    urgency_message: urgency === 'soon' ? safeText(raw.urgency_message, 320) : '',
    fun_fact_or_tip: safeText(raw.fun_fact_or_tip, 420) || defaults.fun_fact_or_tip,
    youtube_search: safeText(raw.youtube_search, 120) || defaults.youtube_search
  };
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

  let request;
  try {
    request = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'The request could not be read.' });
  }

  const query = typeof request.query === 'string' ? request.query.trim() : '';
  const language = ALLOWED_LANGUAGES.has(request.language) ? request.language : 'English';
  const context = getOptionalContext(request.context);

  if (!query) return json(400, { error: 'Please enter a health question or symptom.' });
  if (query.length > MAX_QUERY_LENGTH) return json(400, { error: `Please keep your question under ${MAX_QUERY_LENGTH} characters.` });
  if (request.consent !== true) return json(400, { error: 'Please confirm the privacy notice before continuing.' });
  if (!requestLooksHuman(request)) return json(400, { error: 'Please wait a moment and try again.' });

  // Safety screen runs before AI is called
  if (EMERGENCY_PATTERNS.some(pattern => pattern.test(query))) {
    return json(200, emergencyResponse(language, query));
  }

  const apiKey = (process.env.GEMINI_API_KEY || process.env.GEMINI_API__KEY || '').trim();

  // If no Gemini API key is configured, seamlessly return the high-quality clinical educational fallback
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured; serving educational knowledge response.');
    return json(200, generateEducationalFallback(query, language, context));
  }

  const prompt = `
You are Aura Health, a knowledgeable, compassionate, and articulate clinical AI educator.

Answer ANY health, medical, wellness, biological, symptom, or lifestyle question thoroughly and clearly.
- If the user asks about symptoms (e.g., headache, knee pain, rash), explain likely mechanisms, safe home steps, and medical warning signs.
- If the user asks about a condition, biology, or science question (e.g., "What causes kidney stones?", "Why do we yawn?"), provide a clear, accurate, educational explanation.
- If the user asks about medications or supplements, explain general usage, safety considerations, and stress consulting a pharmacist/doctor for personal prescriptions.
- Always maintain clinical responsibility: provide educational information, avoid false diagnostic certainty, and advise seeing a doctor for severe or persistent symptoms.

Answer in ${language}. If ${language} is Tamil, write every user-facing field in natural, clear, authentic Tamil (தமிழ்); also provide an English title.

Return ONLY a valid JSON object with this exact shape:
{
  "title_en": "concise English topic title",
  "title_ta": "concise Tamil topic title",
  "answer": "a compassionate, informative answer in 2 to 4 sentences explaining the core concept clearly",
  "why_it_happens": ["2 to 4 key causes, mechanisms, or important points"],
  "what_to_do": ["2 to 4 practical, low-risk steps or lifestyle recommendations"],
  "when_to_seek_care": ["2 to 4 clear warning signs or situations for consulting a doctor"],
  "what_to_watch": ["2 to 4 safe details to monitor that would help a doctor during a visit"],
  "discussion_prompts": ["1 to 3 insightful questions the person could ask their clinician"],
  "urgency": "information | routine | soon",
  "urgency_message": "required if urgency is soon, otherwise empty string",
  "fun_fact_or_tip": "one useful tip, interesting biological fact, or perspective",
  "youtube_search": "a concise English query for a reputable educational medical video"
}

User question:
<question>${query}</question>

Optional context selected by user:
<context>${contextForPrompt(context)}</context>`;

  // Candidate models to try in order
  const candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash'
  ].filter(Boolean);

  const validModels = [...new Set(candidateModels.filter(m => m !== 'gemini-3.6-flash'))];
  if (!validModels.length) validModels.push('gemini-2.5-flash', 'gemini-1.5-flash');

  let lastError = null;

  for (const model of validModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey.startsWith('AIzaSy')) {
        headers['x-goog-api-key'] = apiKey;
      } else {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error?.message || `HTTP ${response.status} from Gemini API with model ${model}`);
      }

      const generatedParts = payload?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim();
      const parsedJson = extractJson(generatedParts);
      if (!parsedJson) {
        throw new Error('Could not parse valid JSON from AI response.');
      }

      return json(200, normalizeAnswer(parsedJson, query, language, context));
    } catch (err) {
      console.warn(`Model ${model} attempt failed:`, err.message);
      lastError = err;
    }
  }

  // If all live API attempts failed, gracefully serve the rich clinical fallback
  console.warn('Live Gemini API call was not authenticated or failed. Serving custom educational guidance. Last error:', lastError?.message);
  return json(200, generateEducationalFallback(query, language, context));
};

exports.config = {
  path: '/.netlify/functions/analyze',
  rateLimit: {
    windowLimit: 25,
    windowSize: 60,
    aggregateBy: ['ip', 'domain']
  }
};
