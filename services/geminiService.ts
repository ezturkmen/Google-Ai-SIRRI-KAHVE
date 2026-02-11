
import { GoogleGenAI, Type } from "@google/genai";
import { FortuneResult, FortuneCategory, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_CONFIG = {
  responseMimeType: "application/json",
};

export const analyzeFortune = async (
  category: FortuneCategory, 
  data: any, 
  profile: UserProfile | null
): Promise<FortuneResult> => {
  let contents: any[] = [];
  const model = category === 'astrology' ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';

  // Yaş hesaplama
  const age = profile ? new Date().getFullYear() - new Date(profile.birthDate).getFullYear() : 'belirsiz';

  const profileContext = profile 
    ? `Kullanıcı Bilgileri: 
       İsim: ${profile.name}
       Yaş: ${age}
       Doğum Tarihi: ${profile.birthDate}
       Analizinde bu kişinin yaş evresini, ismindeki karakter enerjisini ve olgunluk seviyesini dikkate al. Bilge, gizemli ve yol gösterici bir üslup kullan.`
    : "";

  const symbolKnowledgeBase = `
    KAHVE FALI SEMBOL VERİ TABANI TALİMATI:
    Gördüğün şekilleri Faldiyari, Mocaco, Kahvecini, Yorumcu, Ayvalıkzade ve Pandora gibi otorite kaynaklardaki geleneksel anlamlarıyla analiz et. 
    
    ÖNEMLİ KURALLAR:
    1. Yorumunda asla kaynak isimlerini (örn: "Faldiyari'ye göre" gibi) belirtme. Bilgiyi kendinden geliyormuş gibi bilgece sun.
    2. Geçmiş, şimdi ve geleceği ayrı başlıklar halinde değil, tek bir akıcı ve bütüncül yorum (interpretation) içinde sun.
    3. Fotoğraflardaki sembolleri (telvenin yoğunluğu, figürler, yollar) çok detaylı analiz et.
  `;

  if (category === 'coffee') {
    const imageParts = data.images.map((img: string) => ({
      inlineData: { mimeType: "image/jpeg", data: img.split(',')[1] }
    }));
    contents = [...imageParts, { text: `
      Sen kadim semboller veritabanına sahip, geleneksel Türk kahvesi falında uzmanlaşmış bir kahinisin. 
      ${profileContext}
      ${symbolKnowledgeBase}
      
      ANALİZ GÖREVİ:
      - Fotoğraflardaki telve şekillerini tanımla.
      - Geçmişten gelen etkileri, şimdiki durumu ve geleceğe dair somut öngörüleri tek bir paragraf zinciri halinde birleştirerek yaz.
      - "advice" kısmında kullanıcıya ismiyle hitap eden, şiirsel bir mesaj ver.
    ` }];
  } else if (category === 'tarot') {
    contents = [{ text: `
      ${profileContext}
      Kullanıcı şu 3 gizem dehlizinden Tarot kartını seçti: ${data.cards.join(", ")}.
      Bu kartların enerjilerini geçmişten geleceğe uzanan tek bir akış halinde yorumla. Kaynak belirtme.
    ` }];
  } else if (category === 'astrology') {
    contents = [{ text: `
      ${profileContext}
      Burç: ${data.sign}.
      Gökyüzündeki anlık gezegen dizilimlerini bu burcun karakteriyle sentezleyerek tek bir bütüncül analiz sun.
    ` }];
  }

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      symbols: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Analiz edilen sembollerin isimleri" },
      interpretation: { type: Type.STRING, description: "Geçmiş, şimdi ve geleceği içeren tek bir bütüncül yorum" },
      advice: { type: Type.STRING }
    },
    required: ["interpretation", "advice"]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contents },
      config: { ...BASE_CONFIG, responseSchema }
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      id: crypto.randomUUID(),
      category,
      date: new Date().toISOString(),
      ...parsed,
      imageUrl: category === 'coffee' ? data.images[0] : undefined,
      sign: category === 'astrology' ? data.sign : undefined,
      cards: category === 'tarot' ? data.cards : undefined,
      userProfile: profile || undefined
    };
  } catch (error) {
    console.error("Analiz hatası:", error);
    throw new Error("Kozmik frekansta bir parazit oluştu. Lütfen telveni tekrar tara.");
  }
};
