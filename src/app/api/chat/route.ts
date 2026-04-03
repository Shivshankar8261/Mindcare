import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

import { translateEnToMindcareLang } from "@/lib/googleTranslate";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptString, decryptString } from "@/lib/encryption";
import { type Prisma } from "@/generated/prisma/client";

const payloadSchema = z.object({
  message: z.string().min(1).max(4000),
  lang: z.string().min(2).max(10).optional().default("en"),
  isAnonymous: z.boolean().optional().default(false),
});

const crisisKeywords: string[] = [
  // English (common)
  "suicide",
  "kill myself",
  "end my life",
  "i want to die",
  "i want to die",
  "can't go on",
  "cant go on",
  "hopeless",
  "worthless",
  // Hindi / common Devanagari substrings
  "मरना",
  "आत्महत्या",
  "खुदकुशी",
  "मैं मरना चाहता",
  // Bengali
  "আত্মহত্যা",
  "মরে যেতে",
  // Tamil
  "தற்கொலை",
  // Urdu
  "خودکشی",
];

function detectCrisis(text: string) {
  const lower = text.toLowerCase();
  return crisisKeywords.some((k) => lower.includes(k.toLowerCase()));
}

const crisisByLang: Record<string, { title: string; body: string; cta: string }> = {
  en: {
    title: "Crisis support",
    body:
      "If you feel in immediate danger or might act on these thoughts, please contact emergency services right now.",
    cta: "Tap “Appointments” to talk to a counselor, or call a helpline below.",
  },
  hi: {
    title: "संकट सहायता",
    body:
      "यदि आप तुरंत खतरे में हैं या इन विचारों पर कदम उठाने का डर है, तो अभी आपातकालीन सेवाओं से संपर्क करें।",
    cta: "काउंसलर से बात करने के लिए “Appointments” पर जाएं, या हेल्पलाइन पर कॉल करें।",
  },
  bn: {
    title: "সঙ্কট সহায়তা",
    body:
      "আপনি যদি তাৎক্ষণিক বিপদে থাকেন বা এসব চিন্তা অনুযায়ী কিছু করার আশঙ্কা থাকে, এখনই জরুরি পরিষেবায় যোগাযোগ করুন।",
    cta: "কাউন্সেলরের সাথে কথা বলতে “Appointments” এ যান, অথবা হেল্পলাইনে কল করুন।",
  },
  te: {
    title: "సంక్షోభ సహాయం",
    body:
      "మీరు తక్షణ ప్రమాదంలో ఉన్నారనుకుంటే లేదా ఈ ఆలోచనలపై చర్య తీసుకునే ప్రమాదం ఉంటే, ఇప్పుడే అత్యవసర సేవలను సంప్రదించండి.",
    cta: "కౌన్సిలర్‌తో మాట్లాడేందుకు “Appointments” చూడండి లేదా హెల్ప్‌లైన్‌కు కాల్ చేయండి.",
  },
  mr: {
    title: "संकट मदत",
    body:
      "जर तुम्हाला तातडीचा धोका वाटत असेल किंवा या विचारांवर कृती करण्याची शक्यता असेल, तर आत्ताच आपत्कालीन सेवांना संपर्क करा.",
    cta: "काउन्सेलरशी बोलण्यासाठी “Appointments” निवडा किंवा हेल्पलाइनला कॉल करा.",
  },
  ta: {
    title: "அவசர உதவி",
    body:
      "நீங்கள் உடனடி ஆபத்தில் இருக்கிறீர்கள் அல்லது இந்த எண்ணங்களில் செயல்பட வாய்ப்பிருப்பதாக உணர்கிறீர்கள் என்றால், உடனே அவசர சேவைகளை தொடர்புகொள்ளுங்கள்.",
    cta: "“Appointments” மூலம் ஆலோசகரிடம் பேசுங்கள் அல்லது ஹெல்ப்லைனுக்கு அழைக்கவும்.",
  },
  ur: {
    title: "بحران میں مدد",
    body:
      "اگر آپ فوری خطرے میں ہیں یا ان خیالات پر عمل کرنے کا خدشہ ہے تو ابھی ہنگامی سروسز سے رابطہ کریں۔",
    cta: "کونسلر سے بات کرنے کے لیے “Appointments” دیکھیں یا ہیلپ لائن پر کال کریں۔",
  },
  gu: {
    title: "સંકટ સહાય",
    body:
      "જો તમને તાત્કાલિક જોખમ લાગે છે અથવા આ વિચારો પર પગલાં લેવાનું મન થાય તો હમણાં જ ઇમર્જન્સી સેવાઓનો સંપર્ક કરો.",
    cta: "કાઉન્સેલર સાથે વાત કરવા માટે “Appointments” પર જાઓ અથવા હેલ્પલાઇન પર કોલ કરો.",
  },
  kn: {
    title: "ತುರ್ತು ಸಹಾಯ",
    body:
      "ನೀವು ತಕ್ಷಣದ ಅಪಾಯದಲ್ಲಿದ್ದರೆ ಅಥವಾ ಈ ಚಿಂತನೆಗಳ ಮೇಲೆ ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಸಾಧ್ಯತೆ ಇದೆ ಎಂದು ಭಾವಿಸಿದರೆ, ಈಗಲೇ ತುರ್ತು ಸೇವೆಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    cta: "ಕೌನ್ಸಿಲರ್ ಜೊತೆ ಮಾತನಾಡಲು “Appointments” ನೋಡಿ ಅಥವಾ ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಕರೆ ಮಾಡಿ.",
  },
  od: {
    title: "ସଂକଟ ସହାୟତା",
    body:
      "ଯଦି ଆପଣ ତୁରନ୍ତ ଜୋଖିମରେ ଅଛନ୍ତି କିମ୍ବା ଏହି ଭାବନା ଉପରେ ପଦକ୍ଷେପ ନେବେ ବୋଲି ଭୟ ଲାଗୁଛି, ତେବେ ଏବେ ଜରୁରୀ ସେବା ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ।",
    cta: "କାଉନସେଲରଙ୍କୁ କଥାହେବାକୁ “Appointments” ଯାନ୍ତୁ କିମ୍ବା ହେଲ୍ପଲାଇନକୁ ଫୋନ୍ କରନ୍ତୁ।",
  },
  ml: {
    title: "അടിയന്തര സഹായം",
    body:
      "നിങ്ങൾക്ക് ഉടനടി അപകടം തോന്നുകയോ ഈ ചിന്തകളിൽ പ്രവർത്തിക്കാനുള്ള സാധ്യത ഉണ്ടെന്നു തോന്നുകയോ ചെയ്താൽ, ഇപ്പോൾ തന്നെ അടിയന്തര സേവനങ്ങളെ ബന്ധപ്പെടുക.",
    cta: "കൗൺസിലറോട് സംസാരിക്കാൻ “Appointments” സന്ദർശിക്കൂ അല്ലെങ്കിൽ ഹെൽപ്പ്ലൈനിൽ വിളിക്കൂ.",
  },
  pa: {
    title: "ਸੰਕਟ ਸਹਾਇਤਾ",
    body:
      "ਜੇ ਤੁਸੀਂ ਤੁਰੰਤ ਖਤਰੇ ਵਿੱਚ ਹੋ ਜਾਂ ਇਹਨਾਂ ਵਿਚਾਰਾਂ ਉੱਤੇ ਕਦਮ ਚੁੱਕਣ ਦਾ ਡਰ ਹੈ ਤਾਂ ਹੁਣੇ ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
    cta: "ਕਾਉਂਸਲਰ ਨਾਲ ਗੱਲ ਕਰਨ ਲਈ “Appointments” ਵੇਖੋ ਜਾਂ ਹੈਲਪਲਾਈਨ ‘ਤੇ ਕਾਲ ਕਰੋ।",
  },
  as: {
    title: "সঙ্কট সহায়তা",
    body:
      "যদি আপুনি তৎক্ষণাত বিপদত থাকিব পাৰে বা এই চিন্তাসমূহৰ ওপৰত কিবা কৰিব পাৰে বুলি ভবা থাকে, তেন্তে বৰ্তমানেই জরুরি সেৱাৰ সৈতে যোগাযোগ কৰক।",
    cta: "কাউন্সেলাৰৰ সৈতে কথা পাতিবলৈ “Appointments” লওঁক, বা হেলপলাইনলৈ ফোন কৰক।",
  },
  mai: {
    title: "संकट सहायता",
    body:
      "यदि अहाँ तात्कालिक ख़तरा में छी अथवा ई सोच पर कदम उठाबै छै तऽ अभी आपातकालीन सेवा से संपर्क करू।",
    cta: "काउन्सलर संग बात करए लेल “Appointments” देखू, अथवा हेल्पलाइन पर कॉल करू।",
  },
  sa: {
    title: "संकट-सहायता",
    body:
      "यदि भयंकरं तत्क्षणं अस्ति वा एतानि चिन्तानि क्रियायां प्रवर्तयन्ति इति भवति, तर्हि अतिसंयमे आपातसेवाः सम्पर्कं कुर्वन्तु।",
    cta: "काउन्सिलर-संगं वार्तायै “Appointments” इति गच्छतु, अथवा हेल्पलाइनं कल्यतु।",
  },
  kok: {
    title: "संकट सहाय्य",
    body:
      "तुम्हाला तातडीचा धोका वाटत असेल किंवा या विचारांवर कृती होण्याची शक्यता असेल तर, आत्ता आपत्कालीन सेवांशी संपर्क करा.",
    cta: "काउन्सिलरशी बोलण्यासाठी “Appointments” उघडा किंवा हेल्पलाइनला कॉल करा.",
  },
  sd: {
    title: "بحران ۾ مدد",
    body:
      "جيڪڏهن توهان کي فوري خطرو محسوس ٿئي ٿو يا انهن خيالن تي عمل ڪرڻ جو خدشو آهي ته، هاڻي ئي هنگامي خدمتن سان رابطو ڪريو.",
    cta: "ڪونسلر سان ڳالهائڻ لاءِ “Appointments” ڏسو يا هيلپ لائن تي ڪال ڪريو.",
  },
  doi: {
    title: "संकट सहायता",
    body:
      "अगर तुसी तुंरत ख़तरे में हो जां इन ख्यालां पर ऐक्शन लेन दा डर हो, तां अभी इमर्जेन्सी सेवाएं तेकै।",
    cta: "काउन्सलर नाल गल्लां करन खातिर “Appointments” खोलो, जा हेल्पलाइन तेकै।",
  },
  mni: {
    title: "ꯀ꯭ꯔꯥꯏꯁꯤꯁ ꯁꯄꯣꯔꯠ ꯇꯧꯕꯥ꯫",
    body:
      "ꯀꯔꯤꯒꯨꯝꯕꯥ ꯅꯍꯥꯛꯅꯥ ꯈꯨꯗꯛꯀꯤ ꯑꯣꯏꯕꯥ ꯈꯨꯗꯣꯡꯊꯤꯕꯥ ꯑꯃꯥ ꯐꯥꯎꯔꯕꯗꯤ ꯅꯠꯠꯔꯒꯥ ꯋꯥꯈꯜꯂꯣꯅꯁꯤꯡ ꯑꯁꯤꯒꯤ ꯃꯇꯨꯡꯏꯟꯅꯥ ꯊꯕꯛ ꯄꯥꯌꯈꯠꯄꯥ ꯌꯥꯕꯥ ꯑꯣꯏꯔꯕꯗꯤ, ꯆꯥꯅꯕꯤꯗꯨꯅꯥ ꯍꯧꯖꯤꯛ ꯍꯧꯖꯤꯛ ꯑꯦꯃꯔꯖꯦꯟꯁꯤ ꯁꯔꯚꯤꯁꯁꯤꯡꯒꯥ ꯄꯥꯎ ꯐꯥꯎꯅꯕꯤꯌꯨ꯫",
    cta:
      "ꯀꯥꯎꯟꯁꯦꯂꯔ ꯑꯃꯒꯥ ꯋꯥꯔꯤ ꯁꯥꯟꯅꯅꯕꯥ “ꯑꯦꯄꯣꯏꯟꯇꯃꯦꯟꯇꯁꯤꯡ” ꯍꯥꯌꯅꯥ ꯇꯦꯞ ꯇꯧ, ꯅꯠꯠꯔꯒꯥ ꯃꯈꯥꯗꯥ ꯄꯤꯔꯤꯕꯥ ꯍꯦꯜꯄꯂꯥꯏꯟ ꯑꯃꯗꯥ ꯀꯣꯜ ꯇꯧ꯫",
  },
  brx: {
    title: "संकट सहायता",
    body:
      "यदि आप तत्काल खतरे में महसूस करते हैं या इन विचारों पर कार्रवाई कर सकते हैं, तो कृपया अभी आपातकालीन सेवाओं से संपर्क करें।",
    cta: "किसी परामर्शदाता से बात करने के लिए “Appointments” पर टैप करें, या नीचे दी गई हेल्पलाइन पर कॉल करें।",
  },
  sat: {
    title: "संकट सहायता",
    body:
      "तुम्हाड़ा तुरन्त जोखिम त है, जां एह सोचे म काम कराबे के डर त है, ता अभी आपातकालीन सेवा से संपर्क करो।",
    cta: "काउन्सेलर से बात करै खातिर “Appointments” देख, अँवा हेल्पलाइन पर फोन करो।",
  },
  ks: {
    title: "بحرانۍ مدد",
    body:
      "اگر تم فوری خطروں میں ہو یا خیالوں پر عمل کرن کا اندیشہ ہو، تَہ ابھی ایمرجنسی سروسز نال رابطہ کرن۔",
    cta: "کونسلر نال بات کرن کیلئے “Appointments” دِکھ، یا ہیلپ لائن تے کال کرو۔",
  },
  ne: {
    title: "संकट सहायता",
    body:
      "यदि तपाईं तत्कालै जोखिममा हुनुहुन्छ वा यी विचारमा कदम चाल्ने डर छ भने, अहिले नै आपतकालीन सेवासँग सम्पर्क गर्नुहोस्।",
    cta: "काउन्सेलरसँग कुरा गर्न “Appointments” खोल्नुहोस् वा हेल्पलाइनमा कल गर्नुहोस्।",
  },
};

const generalPrefixByLang: Record<string, string> = {
  en: "I’m here with you.",
  hi: "मैं यहाँ आपकी मदद के लिए हूँ।",
  bn: "আমি আপনার পাশে আছি।",
  te: "నేను మీకు తోడుగా ఉంటాను.",
  mr: "मी तुमच्या मदतीसाठी इथे आहे.",
  ta: "நான் உங்களுக்கு உதவ இருக்கிறேன்.",
  ur: "میں آپ کی مدد کے لیے حاضر ہوں۔",
  gu: "હું તમારા માટે અહીં છું.",
  kn: "ನಾನು ನಿಮ್ಮ ಜೊತೆ ಇದ್ದೇನೆ.",
  od: "ମୁଁ ଆପଣଙ୍କ ସହିତ ଅଛି।",
  ml: "ഞാൻ നിങ്ങളുടെ കൂടെയുണ്ട്.",
  pa: "ਮੈਂ ਤੁਹਾਡੇ ਨਾਲ ਹਾਂ।",
  as: "আমি তোমাৰ লগত আছোঁ।",
  mai: "हम अहाँक साथ छी।",
  sa: "अहं तव सहायकः अस्मि।",
  kok: "मी तुमच्या सोबत आहे.",
  sd: "مان توهان جي مدد لاءِ آهيان.",
  doi: "मैं तुहाडे नाल हाँ.",
  mni: "ꯑꯩꯍꯥꯛ ꯅꯈꯣꯌꯒꯥ ꯂꯣꯌꯅꯅꯥ ꯃꯐꯝ ꯑꯁꯤꯗꯥ ꯂꯩꯔꯤ꯫",
  brx: "मैं यहाँ आपकी मदद के लिए हूँ।",
  sat: "मैं तुम्हारे संग आछି.",
  ks: "ونہی تہہ مدد کرन آئی छूं.",
  ne: "म तपाईंको साथमा छु।",
};

async function assistantResponse(message: string, lang: string) {
  const crisisDetected = detectCrisis(message);
  if (crisisDetected) {
    const pack = crisisByLang[lang] ?? crisisByLang.en;
    return {
      crisisDetected: true,
      assistantText: `${pack.title}\n\n${pack.body}\n\n${pack.cta}`,
    };
  }

  const lower = message.toLowerCase();
  let tag = "support";
  if (lower.includes("exam") || lower.includes("pressure") || lower.includes("tests")) tag = "exam";
  if (lower.includes("lonely") || lower.includes("alone")) tag = "lonely";
  if (lower.includes("sleep") || lower.includes("insomnia")) tag = "sleep";

  const generalPrefix =
    generalPrefixByLang[lang] ?? generalPrefixByLang.en;

  // Keep MindBot steps language-aware. For languages we don't have native step text for,
  // we translate the English steps on-demand via Google Translate.
  const stepsByTagByLang: Record<
    string,
    { exam: string[]; lonely: string[]; sleep: string[]; support: string[] }
  > = {
    hi: {
      exam: [
        "अभी एक धीमी सांस लें और छोड़ें (फिलहाल कुछ ठीक नहीं करना है)।",
        "10 मिनट में जो अगला एक काम आप कर सकते हैं, उसे लिखें।",
        "अगर दिमाग घूमने लगे, तो 2 मिनट का 4-7-8 ब्रीदिंग चक्र ट्राय करें।",
      ],
      lonely: [
        "किसी भरोसेमंद व्यक्ति को एक संदेश भेजें (छोटा भी चलेगा)।",
        "इस भावना को 'मेहमान' की तरह देखें, 'फैसला' की तरह नहीं।",
        "छोटी ग्राउंडिंग ट्राय करें: 5 चीजें बताइए जो आप देख सकते हैं।",
      ],
      sleep: [
        "रोशनी हल्की करें और 10 मिनट तक समय चेक करने से बचें।",
        "जेंटल बॉडी स्कैन करें (जबड़ा, कंधे, पेट रिलैक्स)।",
        "अगर विचार तेज़ हों, तो उन्हें बाद के लिए लिख लें।",
      ],
      support: [
        "एक पल धीमे चलते हैं—अभी सबसे मजबूत भावना क्या है?",
        "एक दयालु काम करें: पानी पिएँ, स्ट्रेच करें, या थोड़ी सी सैर करें।",
        "हम मिलकर एक छोटा अगला कदम प्लान कर सकते हैं।",
      ],
    },
  };

  const englishSteps =
    tag === "exam"
      ? [
          "Take one slow breath in, then out (no fixing yet).",
          "Write the single next task you can do in 10 minutes.",
          "If your mind spirals, try a 2-minute 4-7-8 breathing cycle.",
        ]
      : tag === "lonely"
        ? [
            "Send one message to someone safe (even a short one).",
            "Notice the feeling as a visitor, not a verdict.",
            "Try a small grounding: name 5 things you can see.",
          ]
        : tag === "sleep"
          ? [
              "Dim lights and avoid checking time for 10 minutes.",
              "Do a gentle body scan (relax jaw, shoulders, belly).",
              "If thoughts race, write them down for later.",
            ]
          : [
              "Let’s slow down for a moment—what’s the strongest feeling right now?",
              "Try one kind action: water, stretch, or a short walk.",
              "We can plan a small next step together.",
            ];

  const langSteps = stepsByTagByLang[lang];

  const steps =
    langSteps
      ? tag === "exam"
        ? langSteps.exam
        : tag === "lonely"
          ? langSteps.lonely
          : tag === "sleep"
            ? langSteps.sleep
            : langSteps.support
      : englishSteps;

  const needsStepTranslation = !langSteps && steps === englishSteps;
  // If we don't have native step text for the chosen language, translate the English steps.
  if (needsStepTranslation && lang !== "en") {
    const translatedSteps: string[] = [];
    for (const s of steps) {
      // Sequential keeps things stable and avoids hitting rate limits.
      translatedSteps.push(await translateEnToMindcareLang(s, lang));
    }
    return {
      crisisDetected: false,
      assistantText: `${generalPrefix}\n\n${translatedSteps
        .map((s) => `• ${s}`)
        .join("\n")}`,
    };
  }

  return {
    crisisDetected: false,
    assistantText: `${generalPrefix}\n\n${steps
      .map((s) => `• ${s}`)
      .join("\n")}`,
  };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { message, lang } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const chatSession = await prisma.chatSession.findFirst({
    where: { userId: user.id, createdAt: { gte: startOfToday } },
    orderBy: { createdAt: "desc" },
  });

  const currentMessages =
    (chatSession?.messages as Array<{ role: string; content: string; timestamp: string }> | null) ??
    [];

  const assistant = await assistantResponse(message, lang);

  const updatedMessages = [
    ...currentMessages,
    {
      role: "user",
      content: encryptString(message),
      timestamp: new Date().toISOString(),
    },
    {
      role: "assistant",
      content: encryptString(assistant.assistantText),
      timestamp: new Date().toISOString(),
    },
  ];

  const saved =
    chatSession
      ? await prisma.chatSession.update({
          where: { id: chatSession.id },
          data: {
            messages: updatedMessages as Prisma.InputJsonValue,
            crisisDetected: assistant.crisisDetected,
          },
          select: { id: true, createdAt: true },
        })
      : await prisma.chatSession.create({
          data: {
            userId: user.id,
            messages: updatedMessages as Prisma.InputJsonValue,
            isAnonymous: false,
            crisisDetected: assistant.crisisDetected,
          },
          select: { id: true, createdAt: true },
        });

  // Decrypt for UI delivery.
  const decryptedMessages = updatedMessages.map((m) => ({
    role: m.role,
    content: (() => {
      try {
        return decryptString(m.content);
      } catch {
        return "";
      }
    })(),
    timestamp: m.timestamp,
  }));

  return NextResponse.json({
    ok: true,
    chatSessionId: saved.id,
    crisisDetected: assistant.crisisDetected,
    messages: decryptedMessages,
  });
}

