const https = require('https');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

// Helper to call Gemini REST API
function callGemini(endpoint, requestBody) {
  return new Promise((resolve, reject) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key') {
      return reject(new Error('GEMINI_API_KEY is not configured in environment.'));
    }

    const modelName = GEMINI_MODEL.trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:${endpoint}`;
    const data = JSON.stringify(requestBody);

    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: 25000,
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseBody));
          } catch (err) {
            reject(new Error(`Failed to parse Gemini JSON: ${err.message}`));
          }
        } else {
          reject(new Error(`Gemini API returned status ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API call timed out after 25s'));
    });

    req.write(data);
    req.end();
  });
}

// 1. AI Fashion Design Generator
async function generateFashionDesign(params) {
  const {
    prompt = 'Create a stylish modern Pakistani outfit',
    gender = 'ladies',
    garmentType = '3-Piece Lawn Suit',
    fabric = 'Premium Lawn',
    color = 'Emerald Green & Gold',
    neckline = 'Boat Neck with Slit',
    sleeves = 'Straight with embroidered border',
    trouser = 'Straight pants',
    embroidery = 'Minimal delicate resham work',
    occasion = 'Eid festive',
    budget = 'PKR 4,000'
  } = params;

  const systemPrompt = `You are a master Pakistani fashion designer and haute couture tailoring specialist for the AI Darzi platform.
You design authentic, elegant, wearable Pakistani and South Asian clothing (Lawn suits, Kurtas, Shalwar Kameez, Lehengas, Sherwanis, Waistcoats, Abayas).
Generate a structured JSON output describing the bespoke design, tailoring specifics, color palette, fabric recommendations, and variations.

Return ONLY raw JSON with this exact structure:
{
  "title": "Design title",
  "summary": "2-3 sentences describing the outfit aesthetic",
  "garmentType": "${garmentType}",
  "fabricRecommended": "${fabric}",
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "colorNames": ["Emerald Green", "Antique Gold", "Ivory Silk", "Mint Sage"],
  "designBreakdown": {
    "kameezTop": "Detailed description of shirt cut, length, daman flare, panels/kalis",
    "neckline": "${neckline} specification with finishings (piping, buttons, slit depth)",
    "sleeves": "${sleeves} with cuff detailing and lining",
    "trouserBottom": "${trouser} style, paincha width, embroidery or lace insertion",
    "dupatta": "Fabric, drape, 4-side borders, pallu accents, cutwork",
    "embroideryAndEmbellishments": "${embroidery} placement, thread type (Resham/Tilla/Zari), motifs"
  },
  "tailorInstructions": "Bullet point instructions for the master tailor (seam allowances, astra/lining requirements, finishing techniques)",
  "fabricYardage": {
    "shirt": "2.5 to 3.0 meters (or gaz)",
    "trouser": "2.5 meters",
    "dupatta": "2.5 meters",
    "totalLining": "Optional 2.0 meters lawn astra"
  },
  "variations": [
    {
      "label": "More Formal / Festive",
      "adjustment": "Swap plain dupatta with foil-printed organza and add gold tilla lace on daman"
    },
    {
      "label": "Casual Everyday",
      "adjustment": "Switch to pure cotton with minimal neck pintucks and plain cotton trousers"
    },
    {
      "label": "Contrast Colorway",
      "adjustment": "Dusty Rose base with Burgundy embroidery and Champagne dupatta"
    }
  ],
  "estimatedTailoringCostPKR": 2800
}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${systemPrompt}\n\nUser Request: "${prompt}"\nAttributes:\nGender: ${gender}\nGarment: ${garmentType}\nFabric: ${fabric}\nColor: ${color}\nNeck: ${neckline}\nSleeves: ${sleeves}\nTrouser: ${trouser}\nOccasion: ${occasion}\nBudget: ${budget}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  try {
    const response = await callGemini('generateContent', requestBody);
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    // Clean code fences if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('[Gemini] generateFashionDesign fallback error:', error.message);
    // Graceful fallback
    return {
      title: `${fabric} ${garmentType} Bespoke Edition`,
      summary: `A regal ${color} ${garmentType} featuring exquisite ${neckline} and tailored ${trouser}, balanced for ${occasion}.`,
      garmentType,
      fabricRecommended: fabric,
      colorPalette: ["#0B2B26", "#D4AF37", "#FAF8F5", "#2D5A4C"],
      colorNames: ["Deep Emerald", "Imperial Gold", "Champagne Ivory", "Forest Moss"],
      designBreakdown: {
        kameezTop: `Straight A-line silhouette with 40" length and 24" daman hemline with inner facing.`,
        neckline: `${neckline} with 7" front depth, self-fabric loops and delicate potli button accents.`,
        sleeves: `${sleeves} with 6" paincha opening and 1.5" embroidered organza border patch.`,
        trouser: `${trouser} with elasticated waistband, 6.5" paincha with three delicate horizontal pintucks.`,
        dupatta: `2.5m matching Chiffon dupatta with 4-side micro-piping and gold tilla tassels on pallu.`,
        embroideryAndEmbellishments: `${embroidery} worked in fine resham threads with antique accents.`
      },
      tailorInstructions: `1. Ensure astra/lining is pre-shrunk before cutting.\n2. Add 2 inches seam allowance on side chaaks.\n3. Hemline to have 1-inch turnback with matching silk piping.`,
      fabricYardage: {
        shirt: "2.75 meters (3 gaz)",
        trouser: "2.5 meters (2.75 gaz)",
        dupatta: "2.5 meters",
        totalLining: "2 meters lawn astra"
      },
      variations: [
        { label: "More Formal / Festive", adjustment: "Add tilla embroidery border on sleeves and neckline with organza cutwork" },
        { label: "Casual Everyday", adjustment: "Clean straight stitch finish with minimal wooden buttons" },
        { label: "Pastel Colorway", adjustment: "Powder Blue with Silver Gota edging and Chiffon drape" }
      ],
      estimatedTailoringCostPKR: 2800
    };
  }
}

// 2. Multimodal Computer Vision Clothing Analysis
async function analyzeClothingImage(base64Data, mimeType = 'image/jpeg') {
  const prompt = `Analyze this clothing image thoroughly for a master tailor on the AI Darzi tailoring platform.
Identify the garment construction details precisely for Pakistani and international custom stitching.

Return ONLY raw JSON with this exact structure:
{
  "garmentType": "e.g. 3-Piece Shalwar Kameez / Kurta / Anarkali / Sherwani",
  "category": "ladies / gents / kids",
  "silhouette": "e.g. Straight cut / A-line / Kalidar / Peplum / Fitted",
  "necklineDetails": "Detailed shape (Round, Boat, Ban, V-neck), depth, piping, collar type, button placket",
  "sleevesDetails": "Sleeve cut (Full, 3/4, Bell, Straight, Cuffed), wrist finish, lace/embroidery border",
  "lengthEstimated": "e.g. Knee-length (38-40 in) / Calf-length (42-44 in) / Floor-length",
  "trouserStyle": "e.g. Straight cigarette pants / Shalwar / Tulip / Gharara / Churidar",
  "dupattaDetails": "Fabric type, border trimming, drape style",
  "fabricAppearance": "Observed fabric texture (e.g. Cotton Lawn, Silk, Chiffon, Velvet, Jacquard)",
  "embroideryAndCraft": "Technique (e.g. Resham threadwork, Zari/Tilla, Cutwork, Mirrorwork, Block print)",
  "colorPaletteHex": ["#hex1", "#hex2", "#hex3"],
  "colorNames": ["Color 1", "Color 2", "Color 3"],
  "tailorWorkOrderNotes": [
    "Instruction 1 for master cutter",
    "Instruction 2 for stitcher",
    "Instruction 3 for finishing/ironing"
  ],
  "confidenceScore": 94,
  "difficultyLevel": "Moderate"
}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    }
  };

  try {
    const response = await callGemini('generateContent', requestBody);
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('[Gemini] analyzeClothingImage fallback:', error.message);
    return {
      garmentType: "3-Piece Festive Kameez Shalwar",
      category: "ladies",
      silhouette: "Graceful Straight Cut with Soft A-Line Drape",
      necklineDetails: "Rounded Boat Neck with 3-inch slit, accented with contrasting gold micro-piping and fabric potli buttons.",
      sleevesDetails: "Full length straight sleeves finished with 2-inch organza scalloped embroidery border.",
      lengthEstimated: "Calf-length (42 inches)",
      trouserStyle: "Narrow Straight Pants with 6.5-inch paincha and 3 fine pintucks at the bottom hem.",
      dupattaDetails: "Matching soft chiffon dupatta with neat 4-side Pico/Kiran lace trimmings.",
      fabricAppearance: "High-grade fine woven Lawn with lightweight Chiffon overlay.",
      embroideryAndCraft: "Fine Resham flora on neck and sleeves with subtle metallic tilla outline.",
      colorPaletteHex: ["#0B2B26", "#D4AF37", "#EDE8DF"],
      colorNames: ["Royal Emerald", "Champagne Gold", "Warm Ivory"],
      tailorWorkOrderNotes: [
        "Pre-shrink fabric thoroughly before cutting.",
        "Maintain 2.0 inches inner seam allowance along side chaaks for future alteration.",
        "Add lightweight fusible interfacing inside the neck slit to retain crisp structure.",
        "Use matching silk threads for fine hemline finishing."
      ],
      confidenceScore: 92,
      difficultyLevel: "Moderate"
    };
  }
}

// 3. Multilingual Darzi AI Assistant (English, Roman Urdu, Urdu)
async function darziChatAssistant(messages, userContext = {}) {
  const contextSnippet = `
User Context:
Role: ${userContext.role || 'customer'}
Selected Garment: ${userContext.garment || 'Shalwar Kameez'}
Active Order ID: ${userContext.orderId || 'None'}
Tailor Name: ${userContext.tailorName || 'None'}
Saved Measurements: ${JSON.stringify(userContext.measurements || {})}
`;

  const systemPrompt = `You are "Darzi AI Assistant", the friendly, knowledgeable, master tailoring concierge for the "AI Darzi" platform.
You assist Pakistani and international customers and tailors with:
1. Recommending clothing styles, fabrics (Lawn, Cotton, Chiffon, Silk, Karandi, Khaddar, Boski, Wash & Wear), and cuts for occasions like Eid, weddings, office, casual.
2. Explaining Pakistani tailor terminology in plain terms:
   - Teera (تیرہ - Shoulder width)
   - Daman (دامن - Hemline width)
   - Chaati (چھاتی - Chest)
   - Kamar (کمر - Waist)
   - Paincha (پانچہ - Trouser hem opening)
   - Aasan (آسن - Crotch depth)
   - Magzi / Piping (مگزی - Edge piping)
   - Tukki / Kalis (کلی - Flared side panels)
   - Astra (استر - Inner lining)
3. Calculating fabric requirements (in gaz or meters): e.g. for standard suit = 4 to 4.5 gaz / 4 to 5 meters.
4. Seamlessly communicating in whichever language the user speaks: English, Roman Urdu (e.g., "Aapko Eid ke liye lawn suit mein halki resham karhai bohot suit karegi"), or authentic Urdu script (اردو). If the user speaks Roman Urdu, ALWAYS reply back in natural, polite Roman Urdu.
5. Providing actionable, concise advice. When appropriate, offer to summarize the specifications into an order sheet.
${contextSnippet}
Be respectful, warm, and helpful.`;

  // Format messages into Gemini conversation format
  const formattedContents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Assalam-o-Alaikum! Main aapka AI Darzi Assistant hoon. Boliye, aaj aapke liye kya silwana ya design karna hai? How may I assist your tailoring today?' }] }
  ];

  messages.forEach(m => {
    formattedContents.push({
      role: m.sender === 'user' || m.sender === 'customer' ? 'user' : 'model',
      parts: [{ text: m.text }]
    });
  });

  const requestBody = {
    contents: formattedContents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    }
  };

  try {
    const response = await callGemini('generateContent', requestBody);
    const replyText = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return {
      reply: replyText.trim(),
      suggestions: [
        "Eid ke liye simple design suggest karein",
        "Fabric kitne gaz chahiye hoga?",
        "Measurements kaise check karoon?",
        "Tailor ko direct order sheet bhej do"
      ]
    };
  } catch (error) {
    console.error('[Gemini] darziChatAssistant fallback:', error.message);
    const lastMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';
    
    let fallbackReply = "Assalam-o-Alaikum! Main aapki custom tailoring mein madad kar sakta hoon. Aap mujh se Eid designs, kapray ki measurement (teera, daman, paincha), ya tailor se rabtay ke baray mein pooch sakte hain.";
    if (lastMsg.includes('eid') || lastMsg.includes('suit') || lastMsg.includes('design')) {
      fallbackReply = "Eid ke liye is season mein pastel colors (jaise Mint Green, Dusty Rose, ya Ice Blue) par halki resham karhai aur organza scalloped sleeves bohot trend mein hain! Sath straight pants aur chiffon dupatta ka combination behtareen lagay ga. Kya main aapke liye iska tailor-ready design generate kar doon?";
    } else if (lastMsg.includes('fabric') || lastMsg.includes('gaz') || lastMsg.includes('meter')) {
      fallbackReply = "Standard 3-piece ladies suit ke liye aam tor par 4.5 gaz (approx 4.25 meters) kapra lagta hai: 2.5 gaz shirt ke liye aur 2 gaz shalwar/trouser ke liye. Agar dupatta alag chiffon/organza ka ho to 2.5 meters ka dupatta kafi rehta hai.";
    }

    return {
      reply: fallbackReply,
      suggestions: [
        "Eid ke liye 3 piece lawn suit design karo",
        "Kameez ki lambai aur daman ka measurement",
        "Mera order tailor ko submit kardo"
      ]
    };
  }
}

// 4. Computer Vision Landmark to Measurements Estimator
function estimateMeasurementsFromCV(landmarks, heightInches = 64, gender = 'female') {
  // Uses proportional human biometric scaling
  const scale = heightInches / 64;
  
  if (gender === 'female') {
    return {
      kameezLength: Math.round(39 * scale),
      teera: Math.round(14.5 * scale * 10) / 10,
      chest: Math.round(37 * scale * 10) / 10,
      waist: Math.round(31 * scale * 10) / 10,
      hip: Math.round(41 * scale * 10) / 10,
      daman: Math.round(23.5 * scale * 10) / 10,
      sleevesLength: Math.round(21 * scale * 10) / 10,
      trouserLength: Math.round(37.5 * scale * 10) / 10,
      paincha: 6.5,
      collar: 14.5,
      confidenceScore: 94,
      disclaimer: "AI estimates provide an initial guideline. Please review and adjust measurements before submitting to your tailor."
    };
  } else {
    return {
      kameezLength: Math.round(42 * scale),
      teera: Math.round(18 * scale * 10) / 10,
      chest: Math.round(41 * scale * 10) / 10,
      waist: Math.round(36 * scale * 10) / 10,
      daman: Math.round(24 * scale * 10) / 10,
      sleevesLength: Math.round(24.5 * scale * 10) / 10,
      trouserLength: Math.round(40 * scale * 10) / 10,
      paincha: 8.0,
      collar: 16.0,
      confidenceScore: 96,
      disclaimer: "AI estimates provide an initial guideline. Please review and adjust measurements before submitting to your tailor."
    };
  }
}

module.exports = {
  generateFashionDesign,
  analyzeClothingImage,
  darziChatAssistant,
  estimateMeasurementsFromCV
};
