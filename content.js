/* Reference data and plain-language texts */
(function (root) {
  'use strict';
  const T = '︎';
  const SIGNS = [
    ['Aries', 'Mesha', 'मेष', '♈', 'Fire', 'Movable'], ['Taurus', 'Vrishabha', 'वृषभ', '♉', 'Earth', 'Fixed'], ['Gemini', 'Mithuna', 'मिथुन', '♊', 'Air', 'Dual'],
    ['Cancer', 'Karka', 'कर्क', '♋', 'Water', 'Movable'], ['Leo', 'Simha', 'सिंह', '♌', 'Fire', 'Fixed'], ['Virgo', 'Kanya', 'कन्या', '♍', 'Earth', 'Dual'],
    ['Libra', 'Tula', 'तुला', '♎', 'Air', 'Movable'], ['Scorpio', 'Vrishchika', 'वृश्चिक', '♏', 'Water', 'Fixed'], ['Sagittarius', 'Dhanu', 'धनु', '♐', 'Fire', 'Dual'],
    ['Capricorn', 'Makara', 'मकर', '♑', 'Earth', 'Movable'], ['Aquarius', 'Kumbha', 'कुंभ', '♒', 'Air', 'Fixed'], ['Pisces', 'Meena', 'मीन', '♓', 'Water', 'Dual']
  ].map((s, i) => ({ i, name: s[0], sa: s[1], dev: s[2], glyph: s[3] + T, element: s[4], quality: s[5] }));

  const PLANETS = {
    Su: { name: 'Sun', sa: 'Surya', dev: 'सूर्य', glyph: '☉', nature: 'malefic', themes: 'self-confidence, authority, father, vitality and recognition', short: 'soul, authority, father' },
    Mo: { name: 'Moon', sa: 'Chandra', dev: 'चंद्र', glyph: '☽', nature: 'benefic', themes: 'mind, emotions, mother, comfort and the public', short: 'mind, emotions, mother' },
    Ma: { name: 'Mars', sa: 'Mangal', dev: 'मंगल', glyph: '♂', nature: 'malefic', themes: 'energy, courage, siblings, property and conflict', short: 'energy, courage, drive' },
    Me: { name: 'Mercury', sa: 'Budha', dev: 'बुध', glyph: '☿', nature: 'benefic', themes: 'intellect, speech, learning, trade and skill', short: 'intellect, speech, skill' },
    Ju: { name: 'Jupiter', sa: 'Guru', dev: 'गुरु', glyph: '♃', nature: 'benefic', themes: 'wisdom, growth, teachers, children, wealth and good fortune', short: 'wisdom, growth, fortune' },
    Ve: { name: 'Venus', sa: 'Shukra', dev: 'शुक्र', glyph: '♀', nature: 'benefic', themes: 'love, marriage, beauty, comfort, vehicles and the arts', short: 'love, comfort, beauty' },
    Sa: { name: 'Saturn', sa: 'Shani', dev: 'शनि', glyph: '♄', nature: 'malefic', themes: 'discipline, hard work, delay, responsibility and longevity', short: 'discipline, karma, delay' },
    Ra: { name: 'Rahu', sa: 'Rahu', dev: 'राहु', glyph: '☊', nature: 'malefic', themes: 'ambition, obsession, foreign things, technology and sudden change', short: 'ambition, the unusual' },
    Ke: { name: 'Ketu', sa: 'Ketu', dev: 'केतु', glyph: '☋', nature: 'malefic', themes: 'detachment, intuition, endings, past-life skill and liberation', short: 'detachment, intuition' }
  };
  Object.values(PLANETS).forEach(p => p.glyph += T);

  const HOUSES = [
    ['Tanu', 'Self', 'body, personality, vitality and the way you meet the world'],
    ['Dhana', 'Wealth and family', 'savings, family of birth, speech and food'],
    ['Sahaja', 'Courage and siblings', 'effort, initiative, siblings, communication and short travel'],
    ['Sukha', 'Home and mother', 'home, mother, property, vehicles and peace of mind'],
    ['Putra', 'Children and intellect', 'children, intelligence, creativity, romance and past merit'],
    ['Ari', 'Obstacles and service', 'illness, debts, rivals, daily work and service'],
    ['Kalatra', 'Marriage and partners', 'spouse, business partners and dealings with the public'],
    ['Ayu', 'Transformation', 'longevity, sudden change, secrets, inheritance and research'],
    ['Dharma', 'Fortune', 'luck, father, teachers, beliefs, higher learning and long journeys'],
    ['Karma', 'Career', 'profession, status, reputation and public action'],
    ['Labha', 'Gains', 'income, networks, elder siblings and fulfilled wishes'],
    ['Vyaya', 'Release', 'expenses, foreign lands, sleep, solitude and liberation']
  ].map((h, i) => ({ num: i + 1, sa: h[0], title: h[1], themes: h[2] }));

  const NAK = [
    ['Ashwini', 'Ashwini Kumaras', "horse's head", 'quick, pioneering and healing; loves speed and fresh starts'],
    ['Bharani', 'Yama', 'the womb', 'intense and creative, with a strong will and capacity to carry responsibility'],
    ['Krittika', 'Agni', 'razor or flame', 'sharp, purifying and protective; a critic and a leader'],
    ['Rohini', 'Brahma', 'ox cart', 'charming, creative and sensuous; drawn to growth and beauty'],
    ['Mrigashira', 'Soma', "deer's head", 'curious, gentle and searching; a restless seeker'],
    ['Ardra', 'Rudra', 'teardrop', 'intense and analytical; grows through storms and renewal'],
    ['Punarvasu', 'Aditi', 'quiver of arrows', 'optimistic and philosophical; bounces back after setbacks'],
    ['Pushya', 'Brihaspati', "cow's udder", 'nourishing, dutiful and steady; regarded as the most auspicious star'],
    ['Ashlesha', 'the Nagas', 'coiled serpent', 'perceptive, shrewd and intense, with hypnotic insight'],
    ['Magha', 'the Pitris (ancestors)', 'royal throne', 'regal and proud of lineage; leads and honours tradition'],
    ['Purva Phalguni', 'Bhaga', 'front legs of a bed', 'pleasure-loving, creative, affectionate and sociable'],
    ['Uttara Phalguni', 'Aryaman', 'back legs of a bed', 'helpful and dependable; thrives through friendships and agreements'],
    ['Hasta', 'Savitar', 'open hand', 'skilful, witty and resourceful, with clever hands'],
    ['Chitra', 'Vishwakarma', 'bright jewel', 'artistic and charismatic; a designer and builder'],
    ['Swati', 'Vayu', 'sprout in the wind', 'independent, flexible and diplomatic, with business sense'],
    ['Vishakha', 'Indra and Agni', 'triumphal arch', 'goal-driven, determined and competitive'],
    ['Anuradha', 'Mitra', 'lotus', 'a devoted friend; cooperative, disciplined and successful away from the birthplace'],
    ['Jyeshtha', 'Indra', 'protective earring', 'senior, protective and powerful; shoulders responsibility'],
    ['Mula', 'Nirriti', 'bunch of roots', 'gets to the root of things; investigative, uproots and rebuilds'],
    ['Purva Ashadha', 'Apas (waters)', 'winnowing fan', 'persuasive and proud, with an unbeatable spirit'],
    ['Uttara Ashadha', 'the Vishvedevas', "elephant's tusk", 'principled and responsible; wins lasting victories'],
    ['Shravana', 'Vishnu', 'ear', 'a listener and learner; connects people and preserves knowledge'],
    ['Dhanishta', 'the Vasus', 'drum', 'rhythmic, ambitious and generous; drawn to wealth and music'],
    ['Shatabhisha', 'Varuna', 'empty circle', 'independent, scientific and private; a healer with a mystical side'],
    ['Purva Bhadrapada', 'Aja Ekapada', 'front of a funeral cot', 'intense and idealistic; transforms through fire'],
    ['Uttara Bhadrapada', 'Ahir Budhnya', 'back of a funeral cot', 'wise, calm and compassionate, with great depth'],
    ['Revati', 'Pushan', 'fish', 'nurturing and gentle; protects travellers and brings things to completion']
  ].map((n, i) => ({ i, name: n[0], deity: n[1], symbol: n[2], trait: n[3] }));

  const TITHI = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'];
  const YOGA27 = ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
  const KARANA = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'];
  const VARA = [['Sunday', 'Ravivara', 'Su'], ['Monday', 'Somavara', 'Mo'], ['Tuesday', 'Mangalavara', 'Ma'], ['Wednesday', 'Budhavara', 'Me'], ['Thursday', 'Guruvara', 'Ju'], ['Friday', 'Shukravara', 'Ve'], ['Saturday', 'Shanivara', 'Sa']];

  const LAGNA = [
    'Aries rising gives a direct, energetic and pioneering nature. You act first and reflect later, dislike being told what to do, and are at your best when starting things.',
    'Taurus rising gives a steady, patient and comfort-loving nature. You build slowly and securely, value beauty and good food, and can be very stubborn once decided.',
    'Gemini rising gives a curious, talkative and quick-minded nature. You learn fast, juggle several interests, and need variety and conversation to stay engaged.',
    'Cancer rising gives a caring, sensitive and protective nature. Home and family are central, moods move like tides, and your intuition about people is strong.',
    'Leo rising gives a dignified, warm and confident nature. You like to lead and to be respected, are generous and loyal, and take pride in doing things with style.',
    'Virgo rising gives an analytical, careful and service-minded nature. You notice details others miss, like order and usefulness, and can be your own harshest critic.',
    'Libra rising gives a graceful, fair-minded and sociable nature. You seek balance and partnership, have a good eye for design, and dislike open conflict.',
    'Scorpio rising gives an intense, private and determined nature. You feel deeply, see through pretence, and have great staying power and capacity for renewal.',
    'Sagittarius rising gives an optimistic, principled and freedom-loving nature. You are drawn to learning, teaching and travel, and speak your mind frankly.',
    'Capricorn rising gives a serious, practical and ambitious nature. You are patient with long climbs, respect structure, and usually grow happier with age.',
    'Aquarius rising gives an independent, thoughtful and humanitarian nature. You think in systems, value friends and causes, and keep a certain emotional distance.',
    'Pisces rising gives a gentle, imaginative and compassionate nature. You absorb the mood around you, are drawn to art and spirituality, and need quiet time to recharge.'
  ];
  const MOONSIGN = [
    'Emotionally quick, brave and impatient; feelings flare up and pass fast. You need action and independence to feel well.',
    'Emotionally steady, affectionate and comfort-seeking; the Moon is at its strongest here. You need security and beauty around you.',
    'Emotionally curious and changeable; you process feelings by talking and thinking. You need mental stimulation.',
    'Emotionally deep, nurturing and protective; the Moon is in its own sign. You need home, belonging and people to care for.',
    'Emotionally proud, warm and dramatic; you give generously and need appreciation and respect in return.',
    'Emotionally careful, analytical and modest; you show love through service and worry over details.',
    'Emotionally sociable and harmony-seeking; you need companionship and fairness, and dislike discord.',
    'Emotionally intense, private and all-or-nothing; the Moon is at its weakest here, which brings depth through emotional trials.',
    'Emotionally optimistic, frank and freedom-loving; you need meaning, learning and room to roam.',
    'Emotionally reserved, dutiful and realistic; you feel secure through achievement and responsibility.',
    'Emotionally detached, friendly and idealistic; you need space, friends and a cause larger than yourself.',
    'Emotionally sensitive, dreamy and compassionate; you need solitude, art or devotion to stay balanced.'
  ];

  const PIH = {
    Su: ['Strong sense of self, pride and vitality. Natural authority, though ego and a hot temper need tempering.', 'Earnings linked to authority or the father\'s line. Commanding speech; pride can enter family matters.', 'Courage, initiative and self-made effort. Shines through writing, media or leadership among peers.', 'Seeks status through home and property. Inner restlessness until career brings recognition.', 'Creative intelligence, leadership and love of recognition. Good for advisory roles and proud of children.', 'Defeats rivals and handles pressure well. Good for service, administration, medicine or law; watch overwork.', 'Draws prominent or strong-willed partners. Ego clashes in marriage need care; gains through public dealings.', 'A private, research-minded nature. Ups and downs in vitality and with father figures; gains through hidden knowledge.', 'Principled and dharmic, with strong opinions. Fortune through higher learning, teachers and travel.', 'A classic placement for career authority, recognition and leadership. Suits government, management and public roles.', 'Gains through influential networks and elders. Ambitions are fulfilled over time.', 'Energy turns inward or abroad. Suits work in foreign lands, hospitals, ashrams or behind the scenes.'],
    Mo: ['Sensitive, expressive and changeable. Popular and caring, with strong intuition and moods that show on the face.', 'Sweet speech and attachment to family. Income rises and falls with public-facing work.', 'A curious, communicative mind. Fond of short travel, writing and siblings; courage varies with mood.', 'Very strong here: love of home and mother, emotional contentment, comforts, vehicles and property.', 'Imaginative, romantic and fond of children. Good intuition for advice; emotions shape creativity.', 'Worries easily. Service-oriented and helpful, but digestion and emotional health need routine.', 'Seeks emotional fulfilment through partnership. A caring spouse; public-facing work is favoured.', 'Deep, private feelings and emotional upheavals that transform. Interest in mysticism; guard peace of mind.', 'A fortunate, devotional mind. Love of pilgrimage, philosophy and travel; mother or teachers shape beliefs.', 'Public popularity and a career that changes shape. Work connected with people, care or the masses.', 'Many friends and gains through networks and the public. Wishes are fulfilled in waves.', 'A rich inner life, vivid dreams and need for solitude. Ties to foreign places or retreats.'],
    Ma: ['Energetic, direct and competitive. A self-starter with a quick temper.', 'Blunt, forceful speech. Earns through effort, engineering or property; restraint needed in family disputes.', 'Excellent placement: courage, stamina and drive. Success through initiative, sport, sales or technical skill.', 'Drive toward property and vehicles, with restlessness at home. Protect domestic peace.', 'Sharp, tactical intelligence and passion in love. Keen on sport and risk; impatient with children.', 'Powerful for beating competition, debt and illness. Suits defence, surgery, law and troubleshooting.', 'Passionate, assertive partnerships and a strong-willed spouse. Arguments need cooling.', 'Intense, investigative energy. Sudden events call for caution; gains through a partner\'s assets.', 'Fights for beliefs and enjoys adventurous travel. Strong but argumentative ties with father and teachers.', 'Very strong: ambition, executive power and achievement. Suits engineering, command and enterprise.', 'Gains through bold action, land and technical work. Goals are pursued hard and achieved.', 'Energy is spent behind the scenes or abroad. Hidden anger or expenses; suits foreign lands, hospitals and research.'],
    Me: ['Youthful, witty and quick to learn. A communicator and analyst; adaptable, sometimes nervous.', 'Clever speech and financial sense. Earns through writing, trade, teaching or numbers.', 'Gifted in writing, media, technology and negotiation. Lively ties with siblings and skilled hands.', 'An educated mind and a home full of books. Gains through study and property dealings.', 'Sharp intellect, good with mathematics, advice and analysis. Playful creativity.', 'An analytical problem-solver. Excels in service, accounts, health or legal detail; prone to nervous strain.', 'Business sense and a clever, youthful partner. Success in trade, consulting and contracts.', 'Research-minded and good at uncovering what is hidden. Interest in finance, insurance or the occult.', 'A philosophical, scholarly mind. Fortune through education, publishing and teaching.', 'Career through communication, commerce, technology, writing or analysis. Versatile professional skills.', 'Gains through networks, trade and intellect. Many friends and several income streams.', 'An imaginative, reflective mind. Study or work abroad; guard against overthinking.'],
    Ju: ['Wise, optimistic and generous. A natural guide with good fortune and a protective grace over life.', 'Wealth, truthful speech and a cultured family. Earnings through teaching, finance or counsel.', 'Wise communication and helpful siblings. Effort is guided by ethics, though ambition can be mild.', 'Happiness at home, good education, property and a blessed bond with mother.', 'Excellent placement: intelligence, good children and advisory ability. Fortune through learning and investments.', 'Overcomes opponents through wisdom. Service in health, law or teaching; watch over-giving and diet.', 'A wise, virtuous spouse and beneficial partnerships. Respect in public dealings.', 'Protection in crises and long-term gains through inheritance or a partner. Interest in deeper truths.', 'The most fortunate placement: dharma, wisdom, good teachers, higher learning and long journeys.', 'An honourable career, ethical leadership and good reputation. Suits teaching, law, advisory and management.', 'Abundant gains, influential friends and fulfilled aspirations.', 'Spiritual inclination, charity and protection abroad. Spending on good causes; a peaceful later life.'],
    Ve: ['Charming, attractive and fond of beauty. Diplomatic, artistic and well liked.', 'Wealth, sweet speech and love of fine food and family. Income through arts, beauty or finance.', 'Artistic communication, media and design. Affectionate siblings and pleasant short travels.', 'Comforts, a beautiful home, vehicles and domestic happiness. A strong placement for the good life.', 'Romantic, creative and artistic. Joy from children and entertainment; a refined intellect.', 'Relationships need conscious work. Service in arts, hospitality or health; watch indulgence.', 'A loving, attractive spouse and strong desire for partnership. Success in business with the public.', 'Gains through marriage, inheritance or a partner\'s wealth. Intense, private romances.', 'Fortune through arts, spouse and travel. Refined beliefs and love of culture.', 'Career in arts, design, luxury, entertainment or diplomacy. A pleasant public image.', 'Strong gains, well-off friends and fulfilled desires. Income through arts, luxury or networks.', 'Enjoys private pleasures, comfort and foreign places. Generous spending; love takes a spiritual turn.'],
    Sa: ['Serious, disciplined and self-reliant. Early life is demanding; maturity brings authority.', 'Careful with money and words. Wealth builds slowly through hard work; duty toward family.', 'Excellent placement: persistence, courage and lasting effort. Success through patience.', 'Heavy responsibilities at home. Property comes after delay; emotional reserve.', 'Serious, structured thinking. Delay or duty around children and romance; deep, traditional learning.', 'Very strong: endurance against rivals, debt and illness. Excels in service, law and hard routine.', 'Late or mature marriage. A serious, dutiful partner and lasting commitments.', 'Endurance through slow obstacles. Research ability; inheritance comes late.', 'Self-earned beliefs and duty to father. Fortune arrives after sustained effort, often after the mid-thirties.', 'Powerful: rise through sheer hard work to lasting authority. Career in administration, industry or organisation.', 'Excellent for steady gains, long-term wealth and loyal older friends. Ambitions are fulfilled late but fully.', 'Solitude, foreign residence or service in secluded places. Expenses and sleep need care; spiritual discipline.'],
    Ra: ['An unconventional, ambitious personality that wants to stand out. Magnetic but restless.', 'Hunger for wealth and unusual speech or diet. Gains from foreign or unconventional sources.', 'Excellent placement: bold and media-savvy. Success in technology, communication and marketing.', 'Restlessness at home; foreign residence or unusual property. Strong worldly drive.', 'Clever, unorthodox intelligence and sudden ideas. Unusual circumstances around children or romance.', 'Very strong: wins competitions and overcomes illness. Thrives in tough, foreign or technical work.', 'An unconventional or foreign partner. Strong desire for relationships and business; honesty is essential.', 'Sudden ups and downs and interest in research or the occult. Unexpected gains or losses.', 'Questions tradition. Foreign teachers, beliefs or travel; a break from the father\'s path.', 'Strong worldly ambition and sudden rise. Recognition in technology, politics or mass media.', 'Excellent for large gains and influential, foreign networks. Desires are fulfilled in a big way.', 'Foreign lands, hidden expenses and vivid dreams. Spiritual seeking through unusual paths.'],
    Ke: ['Detached, intuitive and introspective. An unusual sense of identity and little concern for image.', 'Detached from family wealth. Sparse or sharp speech; earns in unconventional ways.', 'Good placement: quiet courage and intuitive skill. Proficient with hands, tools or code.', 'Detachment from home and homeland. Changes of residence and an inner search for peace.', 'An intuitive, abstract mind with past-life learning. Detachment or worry around children.', 'Strong: overcomes opponents and illness. Good for healing work; ailments can be hard to diagnose.', 'Detachment within partnership. A spiritual or unusual spouse; staying engaged takes conscious effort.', 'Deep research and occult ability. Sudden events; strong intuition.', 'Inherited spirituality and unconventional beliefs. Pilgrimage; distance from father or teachers.', 'Skilled yet detached from status. Career changes; work in research, technology, healing or spirituality.', 'Gains without attachment. Few but meaningful friends; sudden income.', 'Regarded as the best place for Ketu: meditation, spiritual release and retreats in distant places.']
  };

  const DASHA = {
    Su: 'A period that pushes you toward visibility, authority and self-definition. Matters of father, government and status come forward.',
    Mo: 'A period ruled by feelings, home, mother and the public. Life becomes more changeable; travel and care for others increase.',
    Ma: 'A period of action, courage and competition. Property, siblings, technical work and conflicts come forward; energy is high.',
    Me: 'A period of learning, communication, business and skill-building. Good for study, writing, trade and networking.',
    Ju: 'A period of growth, learning and good counsel. Children, teachers, wealth and a sense of purpose tend to expand.',
    Ve: 'A period focused on relationships, comfort, creativity and enjoyment. Marriage, vehicles, home and the arts are highlighted.',
    Sa: 'A period of hard work, responsibility and slow, lasting results. It rewards discipline and tests patience.',
    Ra: 'A period of ambition, worldly hunger and sudden turns. Foreign links, technology and unconventional choices come forward; clarity can waver.',
    Ke: 'A period of turning inward, letting go and endings that clear space. Spiritual interests rise; worldly direction can feel uncertain.'
  };

  // Bhrigu Nandi Nadi style planet combinations
  const PAIR = {
    JuSu: 'A respected, principled person with a link to authority or government; pride in name and reputation.',
    JuMo: 'Good fortune through travel and change of place; an emotionally wise, popular nature.',
    JuMa: 'Courage, technical or leadership ability and a firm ego; gains through land or siblings.',
    JuMe: 'Intelligence, good education and business sense; a persuasive speaker or writer.',
    JuVe: 'Comfort, money and a good marriage; artistic taste and enjoyment of life.',
    JuSa: 'The dharma–karma combination: a dignified, steady profession that earns respect over time.',
    JuRa: 'An unconventional path with foreign or technological links; expansion with phases of confusion and breaks from tradition.',
    JuKe: 'A spiritual, advisory streak; detachment from worldly reward and interest in deeper knowledge.',
    SaSu: 'Work connected with government, management or authority; friction with father or superiors and recognition that comes late.',
    MoSa: 'Work involving travel, change or the public; career fluctuates, bringing repeated new starts.',
    MaSa: 'A technical, engineering or hands-on profession; hard struggle and clashes at work that build toughness.',
    MeSa: 'Work through intellect: business, communication, writing, accounts or analysis.',
    SaVe: 'Money through profession; work tied to finance, design, arts or comfort, and gains after marriage.',
    RaSa: 'Work in large, foreign or technology organisations; an unconventional career with sharp rises and dips.',
    KeSa: 'Breaks and changes of direction in career; suits research, law, spirituality or behind-the-scenes work.',
    MoSu: 'Father and mother both prominent; travel on official work and a public role.',
    MaSu: 'Strong will, command and courage; an engineering or leadership temperament and a hot temper.',
    MeSu: 'A sharp, educated mind; skill in administration, numbers or writing.',
    SuVe: 'Love of status and luxury; wealth through authority, with some friction in married life.',
    RaSu: 'Strained or distant relationship with father or authority; a strong urge for recognition and unusual status.',
    KeSu: 'A spiritual or detached father figure; humility about status and an interest in the inner life.',
    MaMo: 'Chandra–Mangala: emotional drive, enterprise and earning power; quick temper.',
    MeMo: 'A lively, imaginative and commercial mind; skill with words, also restless thoughts.',
    MoVe: 'Charm, artistic taste, comforts and travel for pleasure; gains through women or the public.',
    MoRa: 'A restless, ambitious mind and foreign travel; anxiety and intense imagination.',
    KeMo: 'An intuitive, inward-looking mind; emotional detachment and spiritual sensitivity.',
    MaMe: 'Sharp, technical intellect and debating skill; disputes over land or with siblings are possible.',
    MaVe: 'Passion and strong attraction; an energetic spouse and gains through property.',
    MaRa: 'Bold, risk-taking energy and technical power; guard against impulsive conflict.',
    KeMa: 'Precise, surgical or technical skill; sudden bursts of energy and legal or property matters.',
    MeVe: 'Refined intelligence, art, design and commerce; pleasant speech and many friendships.',
    MeRa: 'A clever, unconventional thinker; skill in technology, media or foreign languages.',
    KeMe: 'Abstract, mathematical or coding ability; interest in research and symbolic knowledge.',
    RaVe: 'Strong desire for luxury and romance; an unconventional or foreign link in marriage or money.',
    KeVe: 'Detachment or delay in relationships; refined, spiritual taste in art and devotion.'
  };
  const NADI_KARAKA = {
    Ju: ['You (Jiva)', 'Jupiter stands for the person themselves in the Nadi method. Planets linked to it describe your nature and life direction.'],
    Sa: ['Work and karma', 'Saturn stands for profession and the work you are here to do. Planets linked to it describe the kind of career.'],
    Ve: ['Money and marriage', 'Venus stands for wealth and comfort, and for the wife in a man\'s chart.'],
    Ma: ['Drive and siblings', 'Mars stands for energy, brothers and land, and for the husband in a woman\'s chart.'],
    Su: ['Father and status', 'The Sun stands for father, name, authority and the soul.'],
    Mo: ['Mother and mind', 'The Moon stands for mother, the mind, travel and change.'],
    Me: ['Intellect and learning', 'Mercury stands for education, intelligence, trade, friends and younger siblings.']
  };

  const GLOSSARY = {
    kundali: ['Kundali', 'Your birth chart: a map of where the Sun, Moon and planets were, seen from your birthplace at your birth time. Also called Janma Patri.'],
    lagna: ['Lagna (Ascendant)', 'The zodiac sign rising on the eastern horizon at birth. It sets the first house and is the starting point for reading the whole chart. It changes about every two hours, which is why birth time matters.'],
    rashi: ['Rashi', 'A zodiac sign. "Your Rashi" usually means the sign the Moon was in at birth, which describes your mind and emotions.'],
    nakshatra: ['Nakshatra', 'One of 27 star groups, each 13°20\' wide, that the Moon passes through. Your birth star (Janma Nakshatra) is the one holding the Moon. It refines the Moon sign and sets the dasha timeline.'],
    pada: ['Pada', 'A quarter of a nakshatra (3°20\'). Each nakshatra has four.'],
    bhava: ['Bhava (House)', 'One of 12 areas of life, counted from the Lagna. The 1st house is the self, the 7th marriage, the 10th career, and so on.'],
    graha: ['Graha (Planet)', 'The nine movers of Vedic astrology: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, and the two lunar nodes Rahu and Ketu.'],
    rahuketu: ['Rahu and Ketu', 'Not physical bodies but the two points where the Moon\'s path crosses the Sun\'s path. They are always exactly opposite each other and always move backward through the zodiac. Eclipses happen near them.'],
    dasha: ['Dasha', 'A planetary period. The Vimshottari system divides 120 years among the nine planets in a fixed order; where you start depends on your Moon\'s nakshatra. The planet whose period is running colours that stretch of life.'],
    mahadasha: ['Mahadasha', 'A major planetary period, lasting from 6 to 20 years.'],
    antardasha: ['Antardasha (Bhukti)', 'A sub-period inside a Mahadasha, lasting months to a few years. Each Antardasha further divides into Pratyantar periods.'],
    gochar: ['Gochar (Transit)', 'Where the planets are in the sky now, compared with your birth chart. Transits time events; the birth chart shows the promise.'],
    sadesati: ['Sade Sati', 'The roughly seven and a half years when Saturn passes through the sign before your Moon sign, your Moon sign, and the sign after it. It comes about every 30 years and is a period of pressure, responsibility and maturing.'],
    dhaiya: ['Dhaiya', 'A two and a half year period when Saturn passes through the 4th or 8th sign from your Moon. A smaller version of Sade Sati.'],
    drishti: ['Drishti (Aspect)', 'A planet\'s "glance". Every planet influences the house directly opposite it (the 7th from itself). Mars also looks at the 4th and 8th, Jupiter the 5th and 9th, Saturn the 3rd and 10th.'],
    vakri: ['Vakri (Retrograde)', 'When a planet appears to move backward in the sky as seen from Earth. A retrograde planet is close to Earth and bright. Its results turn inward, repeat or arrive in an unusual way.'],
    asta: ['Asta (Combust)', 'A planet too close to the Sun to be seen. Its qualities are overpowered by the Sun and need effort to express.'],
    uccha: ['Uccha (Exalted)', 'A planet in the sign where it is strongest and gives its best results.'],
    neecha: ['Neecha (Debilitated)', 'A planet in the sign where it is weakest. Its matters take more effort, though other factors can cancel the weakness (Neecha Bhanga).'],
    ayanamsa: ['Ayanamsa', 'The gap, currently about 24°, between the tropical zodiac used in the West and the star-based (sidereal) zodiac used in India. Lahiri is the Indian government standard.'],
    navamsa: ['Navamsa (D9)', 'A second chart made by dividing each sign into nine parts. It shows the inner strength of planets and is the main chart for marriage.'],
    dasamsa: ['Dasamsa (D10)', 'A chart made by dividing each sign into ten parts. It gives detail on career.'],
    yoga: ['Yoga', 'A specific planetary combination that produces a named result, such as Raja Yoga for success and status.'],
    dosha: ['Dosha', 'A combination regarded as a flaw or challenge, such as Mangal Dosha. Most have cancelling conditions and none is a verdict on its own.'],
    karaka: ['Karaka', 'A planet as the natural indicator of something: Jupiter for children and wisdom, Venus for marriage, Saturn for work.'],
    kendra: ['Kendra', 'The angular houses 1, 4, 7 and 10. Planets here are strong and act visibly.'],
    trikona: ['Trikona', 'The trine houses 1, 5 and 9. The most fortunate houses.'],
    dusthana: ['Dusthana', 'The difficult houses 6, 8 and 12, linked with obstacles, upheaval and loss.'],
    upachaya: ['Upachaya', 'The growth houses 3, 6, 10 and 11. Results here improve with age and effort, and tough planets do well in them.'],
    panchang: ['Panchang', 'The five limbs of the Vedic day: weekday (Vara), lunar day (Tithi), Moon\'s star (Nakshatra), Yoga and Karana.'],
    tithi: ['Tithi', 'A lunar day: each 12° the Moon gains on the Sun. There are 15 in the waxing half (Shukla Paksha) and 15 in the waning half (Krishna Paksha).'],
    vargottama: ['Vargottama', 'A planet in the same sign in both the birth chart and the Navamsa. It gains strength and consistency.'],
    mangal: ['Mangal Dosha', 'Mars in the 1st, 2nd, 4th, 7th, 8th or 12th house. Traditionally checked for marriage because Mars brings heat to partnership. It is very common and has many cancellations.'],
    sandhi: ['Sandhi (Cusp)', 'A planet at the very edge of a sign. A small change in birth time or calculation method can move it to the next sign.'],
    nadi: ['Nadi astrology', 'A family of South Indian methods. The Bhrigu Nandi Nadi used here reads planets as fixed significators and looks at which planets sit in the same, trine, adjacent and opposite signs, without using houses.'],
    dispositor: ['Sign lord (Dispositor)', 'Every sign is owned by a planet. A planet placed in a sign depends on that sign\'s lord, a little like a guest depends on the host.']
  };

  // name|region|lat|lon|tz
  const IN = 'Asia/Kolkata';
  const CITY_RAW = `Secunderabad|Telangana|17.4399|78.4983
Hyderabad|Telangana|17.385|78.4867
Warangal|Telangana|17.9689|79.5941
Nizamabad|Telangana|18.6725|78.0941
Karimnagar|Telangana|18.4386|79.1288
Khammam|Telangana|17.2473|80.1514
Visakhapatnam|Andhra Pradesh|17.6868|83.2185
Vijayawada|Andhra Pradesh|16.5062|80.648
Guntur|Andhra Pradesh|16.3067|80.4365
Tirupati|Andhra Pradesh|13.6288|79.4192
Nellore|Andhra Pradesh|14.4426|79.9865
Kurnool|Andhra Pradesh|15.8281|78.0373
Rajahmundry|Andhra Pradesh|17.0005|81.804
Kakinada|Andhra Pradesh|16.9891|82.2475
Anantapur|Andhra Pradesh|14.6819|77.6006
Kadapa|Andhra Pradesh|14.4673|78.8242
New Delhi|Delhi|28.6139|77.209
Delhi|Delhi|28.7041|77.1025
Mumbai|Maharashtra|19.076|72.8777
Pune|Maharashtra|18.5204|73.8567
Nagpur|Maharashtra|21.1458|79.0882
Nashik|Maharashtra|19.9975|73.7898
Thane|Maharashtra|19.2183|72.9781
Aurangabad|Maharashtra|19.8762|75.3433
Solapur|Maharashtra|17.6599|75.9064
Kolhapur|Maharashtra|16.705|74.2433
Amravati|Maharashtra|20.9374|77.7796
Nanded|Maharashtra|19.1383|77.321
Bengaluru|Karnataka|12.9716|77.5946
Bangalore|Karnataka|12.9716|77.5946
Mysuru|Karnataka|12.2958|76.6394
Mangaluru|Karnataka|12.9141|74.856
Hubballi|Karnataka|15.3647|75.124
Belagavi|Karnataka|15.8497|74.4977
Kalaburagi|Karnataka|17.3297|76.8343
Davanagere|Karnataka|14.4644|75.9218
Ballari|Karnataka|15.1394|76.9214
Udupi|Karnataka|13.3409|74.7421
Chennai|Tamil Nadu|13.0827|80.2707
Coimbatore|Tamil Nadu|11.0168|76.9558
Madurai|Tamil Nadu|9.9252|78.1198
Tiruchirappalli|Tamil Nadu|10.7905|78.7047
Salem|Tamil Nadu|11.6643|78.146
Tirunelveli|Tamil Nadu|8.7139|77.7567
Erode|Tamil Nadu|11.341|77.7172
Vellore|Tamil Nadu|12.9165|79.1325
Thanjavur|Tamil Nadu|10.787|79.1378
Kanchipuram|Tamil Nadu|12.8342|79.7036
Puducherry|Puducherry|11.9416|79.8083
Thiruvananthapuram|Kerala|8.5241|76.9366
Kochi|Kerala|9.9312|76.2673
Kozhikode|Kerala|11.2588|75.7804
Thrissur|Kerala|10.5276|76.2144
Kollam|Kerala|8.8932|76.6141
Kannur|Kerala|11.8745|75.3704
Kottayam|Kerala|9.5916|76.5222
Palakkad|Kerala|10.7867|76.6548
Kolkata|West Bengal|22.5726|88.3639
Howrah|West Bengal|22.5958|88.2636
Durgapur|West Bengal|23.5204|87.3119
Asansol|West Bengal|23.6739|86.9524
Siliguri|West Bengal|26.7271|88.3953
Darjeeling|West Bengal|27.041|88.2663
Ahmedabad|Gujarat|23.0225|72.5714
Surat|Gujarat|21.1702|72.8311
Vadodara|Gujarat|22.3072|73.1812
Rajkot|Gujarat|22.3039|70.8022
Bhavnagar|Gujarat|21.7645|72.1519
Jamnagar|Gujarat|22.4707|70.0577
Gandhinagar|Gujarat|23.2156|72.6369
Junagadh|Gujarat|21.5222|70.4579
Dwarka|Gujarat|22.2442|68.9685
Jaipur|Rajasthan|26.9124|75.7873
Jodhpur|Rajasthan|26.2389|73.0243
Udaipur|Rajasthan|24.5854|73.7125
Kota|Rajasthan|25.2138|75.8648
Bikaner|Rajasthan|28.0229|73.3119
Ajmer|Rajasthan|26.4499|74.6399
Alwar|Rajasthan|27.553|76.6346
Lucknow|Uttar Pradesh|26.8467|80.9462
Kanpur|Uttar Pradesh|26.4499|80.3319
Varanasi|Uttar Pradesh|25.3176|82.9739
Prayagraj|Uttar Pradesh|25.4358|81.8463
Allahabad|Uttar Pradesh|25.4358|81.8463
Agra|Uttar Pradesh|27.1767|78.0081
Meerut|Uttar Pradesh|28.9845|77.7064
Ghaziabad|Uttar Pradesh|28.6692|77.4538
Noida|Uttar Pradesh|28.5355|77.391
Bareilly|Uttar Pradesh|28.367|79.4304
Aligarh|Uttar Pradesh|27.8974|78.088
Moradabad|Uttar Pradesh|28.8386|78.7733
Gorakhpur|Uttar Pradesh|26.7606|83.3732
Mathura|Uttar Pradesh|27.4924|77.6737
Ayodhya|Uttar Pradesh|26.7922|82.1998
Jhansi|Uttar Pradesh|25.4484|78.5685
Saharanpur|Uttar Pradesh|29.968|77.5552
Patna|Bihar|25.5941|85.1376
Gaya|Bihar|24.7914|85.0002
Bhagalpur|Bihar|25.2425|86.9842
Muzaffarpur|Bihar|26.1209|85.3647
Darbhanga|Bihar|26.1542|85.8918
Ranchi|Jharkhand|23.3441|85.3096
Jamshedpur|Jharkhand|22.8046|86.2029
Dhanbad|Jharkhand|23.7957|86.4304
Bokaro|Jharkhand|23.6693|86.1511
Bhopal|Madhya Pradesh|23.2599|77.4126
Indore|Madhya Pradesh|22.7196|75.8577
Gwalior|Madhya Pradesh|26.2183|78.1828
Jabalpur|Madhya Pradesh|23.1815|79.9864
Ujjain|Madhya Pradesh|23.1765|75.7885
Sagar|Madhya Pradesh|23.8388|78.7378
Raipur|Chhattisgarh|21.2514|81.6296
Bhilai|Chhattisgarh|21.1938|81.3509
Bilaspur|Chhattisgarh|22.0797|82.1409
Bhubaneswar|Odisha|20.2961|85.8245
Cuttack|Odisha|20.4625|85.8828
Puri|Odisha|19.8135|85.8312
Rourkela|Odisha|22.2604|84.8536
Chandigarh|Chandigarh|30.7333|76.7794
Amritsar|Punjab|31.634|74.8723
Ludhiana|Punjab|30.901|75.8573
Jalandhar|Punjab|31.326|75.5762
Patiala|Punjab|30.3398|76.3869
Bathinda|Punjab|30.211|74.9455
Mohali|Punjab|30.7046|76.7179
Pathankot|Punjab|32.2643|75.6421
Gurugram|Haryana|28.4595|77.0266
Faridabad|Haryana|28.4089|77.3178
Panipat|Haryana|29.3909|76.9635
Ambala|Haryana|30.3782|76.7767
Rohtak|Haryana|28.8955|76.6066
Hisar|Haryana|29.1492|75.7217
Karnal|Haryana|29.6857|76.9905
Kurukshetra|Haryana|29.9695|76.8783
Shimla|Himachal Pradesh|31.1048|77.1734
Dharamshala|Himachal Pradesh|32.219|76.3234
Manali|Himachal Pradesh|32.2432|77.1892
Dehradun|Uttarakhand|30.3165|78.0322
Haridwar|Uttarakhand|29.9457|78.1642
Rishikesh|Uttarakhand|30.0869|78.2676
Nainital|Uttarakhand|29.3803|79.4636
Srinagar|Jammu and Kashmir|34.0837|74.7973
Jammu|Jammu and Kashmir|32.7266|74.857
Leh|Ladakh|34.1526|77.5771
Guwahati|Assam|26.1445|91.7362
Dibrugarh|Assam|27.4728|94.912
Silchar|Assam|24.8333|92.7789
Shillong|Meghalaya|25.5788|91.8933
Imphal|Manipur|24.817|93.9368
Aizawl|Mizoram|23.7271|92.7176
Agartala|Tripura|23.8315|91.2868
Kohima|Nagaland|25.6751|94.1086
Itanagar|Arunachal Pradesh|27.0844|93.6053
Gangtok|Sikkim|27.3389|88.6065
Panaji|Goa|15.4909|73.8278
Margao|Goa|15.2832|73.9862
Port Blair|Andaman and Nicobar|11.6234|92.7265
Kathmandu|Nepal|27.7172|85.324|Asia/Kathmandu
Pokhara|Nepal|28.2096|83.9856|Asia/Kathmandu
Colombo|Sri Lanka|6.9271|79.8612|Asia/Colombo
Dhaka|Bangladesh|23.8103|90.4125|Asia/Dhaka
Chittagong|Bangladesh|22.3569|91.7832|Asia/Dhaka
Karachi|Pakistan|24.8607|67.0011|Asia/Karachi
Lahore|Pakistan|31.5204|74.3587|Asia/Karachi
Islamabad|Pakistan|33.6844|73.0479|Asia/Karachi
Rawalpindi|Pakistan|33.5651|73.0169|Asia/Karachi
Thimphu|Bhutan|27.4728|89.639|Asia/Thimphu
Male|Maldives|4.1755|73.5093|Indian/Maldives
Kabul|Afghanistan|34.5553|69.2075|Asia/Kabul
Dubai|UAE|25.2048|55.2708|Asia/Dubai
Abu Dhabi|UAE|24.4539|54.3773|Asia/Dubai
Sharjah|UAE|25.3463|55.4209|Asia/Dubai
Doha|Qatar|25.2854|51.531|Asia/Qatar
Muscat|Oman|23.588|58.3829|Asia/Muscat
Kuwait City|Kuwait|29.3759|47.9774|Asia/Kuwait
Manama|Bahrain|26.2285|50.586|Asia/Bahrain
Riyadh|Saudi Arabia|24.7136|46.6753|Asia/Riyadh
Jeddah|Saudi Arabia|21.4858|39.1925|Asia/Riyadh
Tehran|Iran|35.6892|51.389|Asia/Tehran
Tel Aviv|Israel|32.0853|34.7818|Asia/Jerusalem
Istanbul|Turkey|41.0082|28.9784|Europe/Istanbul
Singapore|Singapore|1.3521|103.8198|Asia/Singapore
Kuala Lumpur|Malaysia|3.139|101.6869|Asia/Kuala_Lumpur
Bangkok|Thailand|13.7563|100.5018|Asia/Bangkok
Jakarta|Indonesia|-6.2088|106.8456|Asia/Jakarta
Denpasar|Indonesia|-8.6705|115.2126|Asia/Makassar
Manila|Philippines|14.5995|120.9842|Asia/Manila
Hanoi|Vietnam|21.0278|105.8342|Asia/Bangkok
Ho Chi Minh City|Vietnam|10.8231|106.6297|Asia/Ho_Chi_Minh
Hong Kong|China|22.3193|114.1694|Asia/Hong_Kong
Beijing|China|39.9042|116.4074|Asia/Shanghai
Shanghai|China|31.2304|121.4737|Asia/Shanghai
Taipei|Taiwan|25.033|121.5654|Asia/Taipei
Seoul|South Korea|37.5665|126.978|Asia/Seoul
Tokyo|Japan|35.6762|139.6503|Asia/Tokyo
Osaka|Japan|34.6937|135.5023|Asia/Tokyo
Sydney|Australia|-33.8688|151.2093|Australia/Sydney
Melbourne|Australia|-37.8136|144.9631|Australia/Melbourne
Brisbane|Australia|-27.4698|153.0251|Australia/Brisbane
Perth|Australia|-31.9505|115.8605|Australia/Perth
Adelaide|Australia|-34.9285|138.6007|Australia/Adelaide
Auckland|New Zealand|-36.8485|174.7633|Pacific/Auckland
Wellington|New Zealand|-41.2866|174.7756|Pacific/Auckland
Suva|Fiji|-18.1248|178.4501|Pacific/Fiji
London|United Kingdom|51.5074|-0.1278|Europe/London
Birmingham|United Kingdom|52.4862|-1.8904|Europe/London
Manchester|United Kingdom|53.4808|-2.2426|Europe/London
Leicester|United Kingdom|52.6369|-1.1398|Europe/London
Edinburgh|United Kingdom|55.9533|-3.1883|Europe/London
Dublin|Ireland|53.3498|-6.2603|Europe/Dublin
Paris|France|48.8566|2.3522|Europe/Paris
Berlin|Germany|52.52|13.405|Europe/Berlin
Frankfurt|Germany|50.1109|8.6821|Europe/Berlin
Munich|Germany|48.1351|11.582|Europe/Berlin
Amsterdam|Netherlands|52.3676|4.9041|Europe/Amsterdam
Brussels|Belgium|50.8503|4.3517|Europe/Brussels
Zurich|Switzerland|47.3769|8.5417|Europe/Zurich
Geneva|Switzerland|46.2044|6.1432|Europe/Zurich
Vienna|Austria|48.2082|16.3738|Europe/Vienna
Rome|Italy|41.9028|12.4964|Europe/Rome
Milan|Italy|45.4642|9.19|Europe/Rome
Madrid|Spain|40.4168|-3.7038|Europe/Madrid
Barcelona|Spain|41.3874|2.1686|Europe/Madrid
Lisbon|Portugal|38.7223|-9.1393|Europe/Lisbon
Stockholm|Sweden|59.3293|18.0686|Europe/Stockholm
Oslo|Norway|59.9139|10.7522|Europe/Oslo
Copenhagen|Denmark|55.6761|12.5683|Europe/Copenhagen
Helsinki|Finland|60.1699|24.9384|Europe/Helsinki
Warsaw|Poland|52.2297|21.0122|Europe/Warsaw
Prague|Czechia|50.0755|14.4378|Europe/Prague
Budapest|Hungary|47.4979|19.0402|Europe/Budapest
Athens|Greece|37.9838|23.7275|Europe/Athens
Moscow|Russia|55.7558|37.6173|Europe/Moscow
Kyiv|Ukraine|50.4501|30.5234|Europe/Kyiv
Cairo|Egypt|30.0444|31.2357|Africa/Cairo
Nairobi|Kenya|-1.2921|36.8219|Africa/Nairobi
Mombasa|Kenya|-4.0435|39.6682|Africa/Nairobi
Dar es Salaam|Tanzania|-6.7924|39.2083|Africa/Dar_es_Salaam
Kampala|Uganda|0.3476|32.5825|Africa/Kampala
Lagos|Nigeria|6.5244|3.3792|Africa/Lagos
Accra|Ghana|5.6037|-0.187|Africa/Accra
Johannesburg|South Africa|-26.2041|28.0473|Africa/Johannesburg
Durban|South Africa|-29.8587|31.0218|Africa/Johannesburg
Cape Town|South Africa|-33.9249|18.4241|Africa/Johannesburg
Port Louis|Mauritius|-20.1609|57.5012|Indian/Mauritius
New York|USA|40.7128|-74.006|America/New_York
Jersey City|USA|40.7178|-74.0431|America/New_York
Edison|USA|40.5187|-74.4121|America/New_York
Boston|USA|42.3601|-71.0589|America/New_York
Philadelphia|USA|39.9526|-75.1652|America/New_York
Washington DC|USA|38.9072|-77.0369|America/New_York
Atlanta|USA|33.749|-84.388|America/New_York
Miami|USA|25.7617|-80.1918|America/New_York
Detroit|USA|42.3314|-83.0458|America/Detroit
Chicago|USA|41.8781|-87.6298|America/Chicago
Houston|USA|29.7604|-95.3698|America/Chicago
Dallas|USA|32.7767|-96.797|America/Chicago
Austin|USA|30.2672|-97.7431|America/Chicago
Denver|USA|39.7392|-104.9903|America/Denver
Phoenix|USA|33.4484|-112.074|America/Phoenix
Los Angeles|USA|34.0522|-118.2437|America/Los_Angeles
San Francisco|USA|37.7749|-122.4194|America/Los_Angeles
San Jose|USA|37.3382|-121.8863|America/Los_Angeles
Fremont|USA|37.5485|-121.9886|America/Los_Angeles
San Diego|USA|32.7157|-117.1611|America/Los_Angeles
Seattle|USA|47.6062|-122.3321|America/Los_Angeles
Honolulu|USA|21.3069|-157.8583|Pacific/Honolulu
Toronto|Canada|43.6532|-79.3832|America/Toronto
Brampton|Canada|43.7315|-79.7624|America/Toronto
Montreal|Canada|45.5017|-73.5673|America/Toronto
Ottawa|Canada|45.4215|-75.6972|America/Toronto
Calgary|Canada|51.0447|-114.0719|America/Edmonton
Edmonton|Canada|53.5461|-113.4938|America/Edmonton
Vancouver|Canada|49.2827|-123.1207|America/Vancouver
Surrey|Canada|49.1913|-122.849|America/Vancouver
Mexico City|Mexico|19.4326|-99.1332|America/Mexico_City
Port of Spain|Trinidad and Tobago|10.6549|-61.5019|America/Port_of_Spain
Georgetown|Guyana|6.8013|-58.1551|America/Guyana
Paramaribo|Suriname|5.852|-55.2038|America/Paramaribo
Sao Paulo|Brazil|-23.5505|-46.6333|America/Sao_Paulo
Rio de Janeiro|Brazil|-22.9068|-43.1729|America/Sao_Paulo
Buenos Aires|Argentina|-34.6037|-58.3816|America/Argentina/Buenos_Aires
Santiago|Chile|-33.4489|-70.6693|America/Santiago
Lima|Peru|-12.0464|-77.0428|America/Lima
Bogota|Colombia|4.711|-74.0721|America/Bogota`;
  const CITIES = CITY_RAW.split('\n').map(r => { const a = r.split('|'); return { name: a[0], region: a[1], lat: +a[2], lon: +a[3], tz: a[4] || IN }; });

  root.JD = { SIGNS, PLANETS, HOUSES, NAK, TITHI, YOGA27, KARANA, VARA, LAGNA, MOONSIGN, PIH, DASHA, PAIR, NADI_KARAKA, GLOSSARY, CITIES };
})(typeof window !== 'undefined' ? window : globalThis);
