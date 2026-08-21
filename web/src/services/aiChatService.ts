export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const FAQ_DICTIONARY = [
  {
    keywords: ['çöp', 'atık', 'toplama'],
    response: 'Çöp toplama hizmetlerimiz mahallenizde Pazartesi, Çarşamba ve Cuma günleri 08:00 - 10:00 saatleri arasında yapılmaktadır.'
  },
  {
    keywords: ['su', 'kesinti', 'arıza', 'boru'],
    response: 'Şu an planlı bir su kesintisi bulunmamaktadır. Ancak bulunduğunuz bölgede anlık bir arıza yaşıyorsanız, "Bildirim Oluştur" sayfasından veya 153 çağrı merkezinden bize ulaşabilirsiniz.'
  },
  {
    keywords: ['şikayet', 'sorun', 'bildirim', 'nasıl'],
    response: 'Bir sorun bildirmek için:\n1. Sisteme giriş yapın.\n2. Sol menüden "Bildirimlerim" veya "Yeni Bildirim" seçeneğine tıklayın.\n3. Sorunun kategorisini seçip fotoğraf ve konum ekleyerek bize iletebilirsiniz.'
  },
  {
    keywords: ['hava', 'kalite', 'sıcaklık', 'iot', 'sensör', 'kirlilik'],
    response: 'IoT sensörlerimizden alınan anlık verilere göre şehir merkezinde hava kalitesi "İyi" (AQI: 42) seviyesindedir. Detaylı sensör verilerini "Dashboard" üzerinden canlı takip edebilirsiniz.'
  },
  {
    keywords: ['iletişim', 'telefon', 'adres', 'ulaşım', '153'],
    response: 'Bize her zaman 153 Beyaz Masa hattından, iletisim@smartcity.bel.tr adresinden veya uygulamamızdaki "Bildirimlerim" kısmından ulaşabilirsiniz.'
  },
  {
    keywords: ['merhaba', 'selam', 'hey', 'günaydın', 'iyi günler'],
    response: 'Merhaba! Size belediye hizmetlerimiz, güncel duyurular veya şehirdeki IoT verileri hakkında nasıl yardımcı olabilirim?'
  },
  {
    keywords: ['teşekkür', 'sağol'],
    response: 'Rica ederim! Başka bir sorunuz olursa buradayım. İyi günler dilerim.'
  }
];

const DEFAULT_RESPONSE = 'Maalesef bu sorunun yanıtını bulamadım. Ancak sorununuzu "Yeni Bildirim" olarak iletebilir veya 153 destek hattımızı arayabilirsiniz. Başka bir konuda yardımcı olabilir miyim?';

export const sendChatMessageToAI = async (message: string): Promise<string> => {
  // Simulate network request / AI processing delay
  const delay = Math.floor(Math.random() * 1000) + 1000; // 1 to 2 seconds
  await new Promise(resolve => setTimeout(resolve, delay));

  const lowerMessage = message.toLowerCase();

  // Find the best matching rule based on keywords
  for (const rule of FAQ_DICTIONARY) {
    if (rule.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return rule.response;
    }
  }

  return DEFAULT_RESPONSE;
};
