// ────────────────────────────────────────────────────────────
// AI Vision — Akıllı Sorun Sınıflandırma Servisi
// ────────────────────────────────────────────────────────────
// Görsel meta verisi ve metin tabanlı anahtar kelime analizi ile
// kategori, aciliyet, başlık önerisi ve etiket üreten heuristic motor.
// İleride gerçek bir Vision API'ye (Google Cloud Vision, OpenAI GPT-4V)
// tek dosya değişikliğiyle geçiş yapılabilir.
// ────────────────────────────────────────────────────────────

/** AI analiz sonuç tipi */
export interface AIAnalysisResult {
  /** Önerilen kategori adı (DB'deki categories tablosuyla eşleşir) */
  category: string
  /** Önerilen aciliyet seviyesi */
  priority: 'low' | 'medium' | 'high' | 'urgent'
  /** Otomatik üretilen başlık önerisi */
  suggestedTitle: string
  /** İlgili etiketler */
  tags: string[]
  /** Güven skoru (0–100) */
  confidence: number
  /** AI'ın kısa açıklaması */
  reasoning: string
}

/** analyzeIssueWithAI parametreleri */
export interface AIAnalysisParams {
  imageFile?: File | null
  description?: string
}

// ────────────────────────────────────────────────────────────
// Kategori Anahtar Kelime Sözlükleri (Türkçe)
// ────────────────────────────────────────────────────────────

interface CategoryKeywords {
  name: string
  keywords: string[]
  /** Acil durum anahtar kelimeleri */
  urgentKeywords: string[]
  titleTemplates: string[]
}

const CATEGORY_KEYWORDS: CategoryKeywords[] = [
  {
    name: 'Altyapı',
    keywords: [
      'yol', 'kaldırım', 'çukur', 'asfalt', 'inşaat', 'çatlak', 'göçük',
      'beton', 'köprü', 'tünel', 'yıkılmış', 'hasar', 'tamir', 'onarım',
      'döşeme', 'parke', 'bordür', 'bariyer', 'duvar', 'yapı',
      'zemin', 'temel', 'viyadük', 'geçit', 'merdiven',
    ],
    urgentKeywords: ['göçük', 'yıkılmış', 'çökme', 'tehlikeli', 'acil'],
    titleTemplates: [
      'Yolda hasar / çukur bildirimi',
      'Kaldırım hasarı onarım talebi',
      'Altyapı sorunu — bakım gerekli',
      'Yol/kaldırım bozulması bildirimi',
    ],
  },
  {
    name: 'Çevre/Temizlik',
    keywords: [
      'çöp', 'moloz', 'pis', 'koku', 'atık', 'kirli', 'temizlik',
      'süpürge', 'konteyner', 'çöp kutusu', 'dökülmüş', 'birikinti',
      'hijyen', 'dezenfekte', 'pislik', 'lağım', 'fare', 'haşere',
      'böcek', 'sivrisinek', 'karasinek', 'sinek', 'bakımsız',
      'duman', 'hava kirliliği', 'gürültü',
    ],
    urgentKeywords: ['lağım', 'fare', 'haşere', 'salgın', 'zehirli', 'kimyasal'],
    titleTemplates: [
      'Çevre kirliliği / temizlik talebi',
      'Çöp birikintisi bildirimi',
      'Haşere sorunu bildirimi',
      'Temizlik ve hijyen talebi',
    ],
  },
  {
    name: 'Ulaşım',
    keywords: [
      'trafik', 'otobüs', 'durak', 'sinyal', 'işaret', 'levha',
      'otopark', 'park yeri', 'geçit', 'yaya', 'bisiklet', 'metro',
      'tramvay', 'kavşak', 'hız', 'radar', 'kaza', 'tıkanıklık',
      'çizgi', 'şerit', 'tabela', 'sürücü', 'araç', 'minibüs',
      'dolmuş', 'taksi', 'servis',
    ],
    urgentKeywords: ['kaza', 'çarpma', 'yaralı', 'kapanmış', 'tehlike'],
    titleTemplates: [
      'Trafik düzenleme / levha sorunu',
      'Toplu ulaşım sorunu bildirimi',
      'Yaya güvenliği talebi',
      'Trafik sinyalizasyon arızası',
    ],
  },
  {
    name: 'Park/Bahçe',
    keywords: [
      'ağaç', 'park', 'çim', 'bank', 'oyun alanı', 'bahçe', 'yeşil alan',
      'çiçek', 'fidanlık', 'peyzaj', 'çeşme', 'süs havuzu', 'çocuk parkı',
      'salıncak', 'kaydırak', 'spor alanı', 'yürüyüş', 'patika', 'bankı',
      'kırık bank', 'devrilmiş', 'budama', 'dal', 'yaprak',
    ],
    urgentKeywords: ['devrilmiş ağaç', 'kırık', 'tehlikeli oyun', 'düşme'],
    titleTemplates: [
      'Park / yeşil alan bakım talebi',
      'Oyun alanı güvenlik sorunu',
      'Ağaç bakımı / budama talebi',
      'Park donatı onarım talebi',
    ],
  },
  {
    name: 'Aydınlatma',
    keywords: [
      'lamba', 'aydınlatma', 'karanlık', 'ışık', 'direk', 'ampul',
      'led', 'sokak lambası', 'projektör', 'yanmıyor', 'sönük',
      'titriyor', 'kırık lamba', 'elektrik direği', 'aydınlık',
      'loş', 'gece', 'güvenlik aydınlatma',
    ],
    urgentKeywords: ['elektrik çarpması', 'kablo kopuk', 'kıvılcım', 'devrilmiş direk'],
    titleTemplates: [
      'Sokak aydınlatması arızası',
      'Aydınlatma direği sorunu',
      'Karanlık bölge aydınlatma talebi',
      'Lamba / ışık arızası bildirimi',
    ],
  },
  {
    name: 'Su / Kanalizasyon',
    keywords: [
      'su', 'patlak', 'kanalizasyon', 'taşma', 'boru', 'musluk',
      'sızıntı', 'sel', 'su baskını', 'rögar', 'mazgal', 'drenaj',
      'fosseptik', 'arıtma', 'içme suyu', 'şebeke', 'vana', 'sayaç',
      'su kesintisi', 'basınç', 'bulanık su', 'su kaçağı',
    ],
    urgentKeywords: ['patlak', 'sel', 'su baskını', 'taşma', 'kanalizasyon taşması'],
    titleTemplates: [
      'Su şebekesi arızası / patlak bildirimi',
      'Kanalizasyon taşması bildirimi',
      'Su kesintisi / basınç sorunu',
      'Rögar / mazgal sorunu bildirimi',
    ],
  },
]

// ────────────────────────────────────────────────────────────
// Aciliyet Anahtar Kelimeleri (genel)
// ────────────────────────────────────────────────────────────

const GENERAL_URGENT_KEYWORDS = [
  'acil', 'tehlike', 'tehlikeli', 'hayati', 'ölüm', 'yaralanma',
  'çökme', 'patlama', 'yangın', 'deprem', 'felaket', 'yıkım',
]

const HIGH_PRIORITY_KEYWORDS = [
  'ciddi', 'büyük', 'geniş', 'yaygın', 'kronik', 'sürekli',
  'şiddetli', 'kötü', 'berbat', 'korkunç', 'vahim', 'ağır',
  'çok fazla', 'dayanılmaz', 'uzun süredir',
]

const LOW_PRIORITY_KEYWORDS = [
  'küçük', 'ufak', 'minör', 'hafif', 'az', 'basit',
  'öneri', 'güzelleştirme', 'estetik', 'istek', 'talep',
]

// ────────────────────────────────────────────────────────────
// Analiz Yardımcı Fonksiyonları
// ────────────────────────────────────────────────────────────

/** Metinde kaç anahtar kelime bulunduğunu sayar */
function countKeywordMatches(text: string, keywords: string[]): number {
  const normalizedText = text.toLowerCase().replace(/[.,!?;:'"()]/g, ' ')
  let count = 0
  for (const keyword of keywords) {
    // Her anahtar kelimeyi bağımsız olarak ara
    const regex = new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}`, 'gi')
    const matches = normalizedText.match(regex)
    if (matches) {
      count += matches.length
    }
  }
  return count
}

/** Regex özel karakterlerini escape eder */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Görsel dosya adından ipuçları çıkarır */
function analyzeImageFileName(fileName: string): string[] {
  const hints: string[] = []
  const lower = fileName.toLowerCase()

  // Yaygın dosya adlandırma kalıpları
  if (lower.includes('yol') || lower.includes('road')) hints.push('yol')
  if (lower.includes('çöp') || lower.includes('trash') || lower.includes('garbage')) hints.push('çöp')
  if (lower.includes('park')) hints.push('park')
  if (lower.includes('lamba') || lower.includes('light')) hints.push('lamba')
  if (lower.includes('su') || lower.includes('water')) hints.push('su')
  if (lower.includes('trafik') || lower.includes('traffic')) hints.push('trafik')
  if (lower.includes('çukur') || lower.includes('hole') || lower.includes('pothole')) hints.push('çukur')
  if (lower.includes('kırık') || lower.includes('broken')) hints.push('kırık')
  if (lower.includes('patlak') || lower.includes('leak')) hints.push('patlak')
  if (lower.includes('ağaç') || lower.includes('tree')) hints.push('ağaç')

  return hints
}

/** Görsel boyutundan aciliyet ipucu çıkarır (büyük dosya = detaylı fotoğraf = potansiyel ciddi sorun) */
function getImageSizeHint(fileSize: number): 'none' | 'low' | 'medium' | 'high' {
  if (fileSize > 5_000_000) return 'high'
  if (fileSize > 2_000_000) return 'medium'
  if (fileSize > 500_000) return 'low'
  return 'none'
}

// ────────────────────────────────────────────────────────────
// Ana Analiz Fonksiyonu
// ────────────────────────────────────────────────────────────

/**
 * Sorun fotoğrafı ve/veya açıklama metnini analiz ederek
 * otomatik kategori, aciliyet, başlık ve etiket önerisi üretir.
 *
 * @example
 * const result = await analyzeIssueWithAI({
 *   description: 'Sokak lambası 3 gündür yanmıyor, çok karanlık',
 *   imageFile: selectedFile,
 * })
 */
export async function analyzeIssueWithAI(
  params: AIAnalysisParams
): Promise<AIAnalysisResult> {
  const { imageFile, description } = params

  // Gerçekçi bir AI deneyimi için yapay gecikme (1.5–3 saniye)
  await simulateProcessing()

  // ── 1. Metin + görsel ipuçlarını birleştir ──
  let combinedText = (description || '').trim()

  const imageHints: string[] = []
  let imageSizeHint: 'none' | 'low' | 'medium' | 'high' = 'none'

  if (imageFile) {
    const fileNameHints = analyzeImageFileName(imageFile.name)
    imageHints.push(...fileNameHints)
    imageSizeHint = getImageSizeHint(imageFile.size)
    // Dosya adı ipuçlarını da metne ekle
    combinedText += ' ' + fileNameHints.join(' ')
  }

  // ── 2. Her kategori için skor hesapla ──
  const categoryScores = CATEGORY_KEYWORDS.map((cat) => {
    const keywordHits = countKeywordMatches(combinedText, cat.keywords)
    const urgentHits = countKeywordMatches(combinedText, cat.urgentKeywords)
    // imageHints kategoriye katkı sağlıyor mu?
    const imageBonus = imageHints.filter((h) =>
      cat.keywords.some((k) => k.includes(h) || h.includes(k))
    ).length

    return {
      category: cat,
      score: keywordHits * 2 + urgentHits * 5 + imageBonus * 3,
      urgentHits,
    }
  })

  // En yüksek skorlu kategoriyi seç
  categoryScores.sort((a, b) => b.score - a.score)
  const bestMatch = categoryScores[0]
  const secondBest = categoryScores[1]

  // ── 3. Kategori belirle ──
  let selectedCategory: CategoryKeywords
  let confidence: number

  if (bestMatch.score === 0) {
    // Hiçbir kelime eşleşmedi — Diğer kategorisi
    selectedCategory = {
      name: 'Diğer',
      keywords: [],
      urgentKeywords: [],
      titleTemplates: ['Genel sorun bildirimi'],
    }
    confidence = 25
  } else {
    selectedCategory = bestMatch.category
    // Güven skoru: en iyi ile ikinci en iyi arasındaki farka göre
    const scoreDiff = secondBest ? bestMatch.score - secondBest.score : bestMatch.score
    confidence = Math.min(95, 40 + scoreDiff * 8 + bestMatch.score * 3)
  }

  // ── 4. Aciliyet seviyesi belirle ──
  let priority: AIAnalysisResult['priority'] = 'medium'
  const urgentGeneral = countKeywordMatches(combinedText, GENERAL_URGENT_KEYWORDS)
  const highHits = countKeywordMatches(combinedText, HIGH_PRIORITY_KEYWORDS)
  const lowHits = countKeywordMatches(combinedText, LOW_PRIORITY_KEYWORDS)

  if (urgentGeneral > 0 || bestMatch.urgentHits > 0) {
    priority = 'urgent'
  } else if (highHits > 0 || imageSizeHint === 'high') {
    priority = 'high'
  } else if (lowHits > 0 && highHits === 0) {
    priority = 'low'
  } else {
    priority = 'medium'
  }

  // ── 5. Başlık önerisi ──
  const templateIndex = Math.floor(Math.random() * selectedCategory.titleTemplates.length)
  let suggestedTitle = selectedCategory.titleTemplates[templateIndex]

  // Açıklamadan önemli ilk kelimeyi ekle
  if (description && description.length > 10) {
    const firstSentence = description.split(/[.!?]/)[0].trim()
    if (firstSentence.length > 5 && firstSentence.length < 60) {
      suggestedTitle = firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1)
    }
  }

  // ── 6. Etiketler ──
  const tags: string[] = [selectedCategory.name.toLowerCase().replace(/[\/\s]/g, '-')]

  // Aciliyet etiketi
  if (priority === 'urgent') tags.push('acil')
  if (priority === 'high') tags.push('yüksek-öncelik')

  // Eşleşen anahtar kelimelerden ilk 3 tanesini ekle
  const matchedKeywords = selectedCategory.keywords
    .filter((kw) => combinedText.toLowerCase().includes(kw.toLowerCase()))
    .slice(0, 3)
  tags.push(...matchedKeywords)

  // Görsel etiketi
  if (imageFile) tags.push('fotoğraflı')

  // ── 7. Reasoning ──
  const reasoningParts: string[] = []
  if (description) {
    reasoningParts.push(`Metin analizi: "${selectedCategory.name}" kategorisine ait ${countKeywordMatches(combinedText, selectedCategory.keywords)} anahtar kelime bulundu`)
  }
  if (imageFile) {
    reasoningParts.push(`Görsel analizi: ${imageFile.name} (${(imageFile.size / 1024).toFixed(0)} KB)`)
    if (imageHints.length > 0) {
      reasoningParts.push(`Dosya adı ipuçları: ${imageHints.join(', ')}`)
    }
  }
  if (priority === 'urgent' || priority === 'high') {
    reasoningParts.push(`Aciliyet tespiti: Yüksek öncelikli anahtar kelimeler algılandı`)
  }

  const reasoning = reasoningParts.join('. ') + '.'

  return {
    category: selectedCategory.name,
    priority,
    suggestedTitle,
    tags: [...new Set(tags)], // de-duplicate
    confidence: Math.round(confidence),
    reasoning,
  }
}

// ────────────────────────────────────────────────────────────
// Yardımcılar
// ────────────────────────────────────────────────────────────

/** Gerçekçi AI işlem süresi simülasyonu (1.5–3s) */
function simulateProcessing(): Promise<void> {
  const delay = 1500 + Math.random() * 1500
  return new Promise((resolve) => setTimeout(resolve, delay))
}

// ────────────────────────────────────────────────────────────
// AI Birim ve Çözüm (SLA) Yönlendirme
// ────────────────────────────────────────────────────────────

export interface AIRoutingResult {
  department: string
  sla: string
  actionPlan: string[]
}

/**
 * Kategori ve aciliyete göre ilgili belediye birimini, Tahmini Çözüm Süresi (SLA)'ni
 * ve 2-3 maddelik aksiyon planını belirler.
 */
export function getAISolutionAndRouting(
  categoryName: string,
  priority: 'low' | 'medium' | 'high' | 'urgent'
): AIRoutingResult {
  let department = 'Destek Hizmetleri'
  let sla = '5 İş Günü'
  let actionPlan: string[] = []

  const lowerCategory = categoryName.toLowerCase()

  // Birim Belirleme
  if (lowerCategory.includes('altyapı') || lowerCategory.includes('yol')) {
    department = 'Fen İşleri Müdürlüğü'
    actionPlan = [
      'Bölgeye teknik ekip sevk edilecek',
      'Hasar tespiti ve güvenlik önlemleri alınacak',
      'Onarım/yapım çalışmaları başlatılacak'
    ]
  } else if (lowerCategory.includes('park') || lowerCategory.includes('bahçe') || lowerCategory.includes('ağaç')) {
    department = 'Park ve Bahçeler Müdürlüğü'
    actionPlan = [
      'İlgili alanda peyzaj ekibi inceleme yapacak',
      'Gerekli budama veya onarım işlemi gerçekleştirilecek',
      'Alan temizlenip kullanıma hazır hale getirilecek'
    ]
  } else if (lowerCategory.includes('çevre') || lowerCategory.includes('temizlik') || lowerCategory.includes('çöp')) {
    department = 'Temizlik İşleri Müdürlüğü'
    actionPlan = [
      'Temizlik araçları bölgeye yönlendirilecek',
      'Atıklar/kirlilik kaynağı temizlenecek',
      'Bölge dezenfekte edilip hijyen sağlanacak'
    ]
  } else if (lowerCategory.includes('su') || lowerCategory.includes('kanalizasyon')) {
    department = 'Su ve Kanalizasyon İdaresi'
    actionPlan = [
      'Altyapı arıza ekibi yönlendirilecek',
      'Sızıntı/taşma veya arıza kaynağı tespit edilecek',
      'Onarım yapılıp sistem test edilecek'
    ]
  } else if (lowerCategory.includes('ulaşım') || lowerCategory.includes('trafik')) {
    department = 'Ulaşım Hizmetleri Müdürlüğü'
    actionPlan = [
      'Trafik kontrol veya bakım ekibi yönlendirilecek',
      'Sorunlu levha, sinyalizasyon veya yol durumu düzeltilecek',
      'Trafik akışı güvenli hale getirilecek'
    ]
  } else if (lowerCategory.includes('aydınlatma') || lowerCategory.includes('lamba')) {
    department = 'Elektrik ve Aydınlatma Birimi'
    actionPlan = [
      'Bölgedeki elektrik/aydınlatma arızası tespit edilecek',
      'Gerekli lamba veya kablo değişimi yapılacak',
      'Sistem test edilerek aydınlatma sağlanacak'
    ]
  } else {
    department = 'Zabıta Müdürlüğü'
    actionPlan = [
      'Bölgeye zabıta ekibi intikal edecek',
      'Durum tespiti ve tutanak işlemi yapılacak',
      'İlgili müdahale gerçekleştirilip süreç sonlandırılacak'
    ]
  }

  // SLA Belirleme (Aciliyet bazlı dinamik)
  if (priority === 'urgent') {
    sla = '2-4 Saat'
  } else if (priority === 'high') {
    sla = '24 Saat'
  } else if (priority === 'medium') {
    sla = '3 İş Günü'
  } else {
    sla = '5-7 İş Günü'
  }

  return {
    department,
    sla,
    actionPlan
  }
}
