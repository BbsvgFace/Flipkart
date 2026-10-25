'use strict';
// Saath prototype: one state object, string-template screens, event delegation. No framework.

const $ = s => document.querySelector(s);
const app = $('#app');
const KEY = 'saath-redesign-v1';
const HOUR = 3600e3;

/* ---------- domain ---------- */
const ZONES = { A: 'Shanti Nagar', B: 'Lake Road' };
const WHO = { daily: 'Needs daily care', child: 'Child without a caregiver', medical: 'Needs medical help', essentials: 'Can’t get essentials', alone: 'May be alone or unreachable', other: 'Other / not sure' };
const HELP = { food: 'Food / meals', water: 'Drinking water', supplies: 'Essential supplies', care: 'Everyday care', medication: 'Medication access', welfare: 'Welfare check', protected: 'Protected referral', other: 'Other / not sure' };
const REL = { family: 'Family member', friend: 'Friend', neighbour: 'Neighbour', caregiver: 'Caregiver or guardian', professional: 'Health or support worker', volunteer: 'Volunteer or community worker', bystander: 'Passer-by / stranger', other: 'Prefer not to say' };
const KNOW = { spoke: 'Spoke to them', saw: 'Saw it myself', told: 'Someone told me', unreachable: 'Can’t reach them' };
const CONSENT = { agreed: 'Agreed to share', declined: 'Did not agree', unable: 'Couldn’t ask', unknown: 'Not asked' };
const GENDER = { woman: 'Woman / girl', man: 'Man / boy', other: 'Other / not stated' };
const URG = { urgent: 'Urgent review', priority: 'Priority review', routine: 'Routine' };
const ORDER = { urgent: 0, priority: 1, routine: 2 };
const STAGES = ['received', 'reviewed', 'assigned', 'visited', 'closed'];
const STAGE = { received: 'Report received', reviewed: 'Coordinator reviewed', assigned: 'Volunteer on it', visited: 'Visit done', closed: 'Care delivered' };
const NEXT = { received: '', reviewed: 'Usually within 2 hours', assigned: 'A nearby volunteer with the right skills', visited: 'They’ll check in person', closed: 'You’ll see the outcome here' };
const OUT = { delivered: ['Care delivered', 'They got what they needed'], referred: ['Referred onward', 'Passed to a doctor, shelter or official service'], unreachable: ['Couldn’t reach them', 'Nobody home, or they declined'] };
// ponytail: demo roster with one shared code; real auth comes from the coordinator system.
const VOLS = {
  'SAATH-V101': { name: 'Rohan', zone: 'A', scopes: ['general'], skill: 'General care' },
  'SAATH-V102': { name: 'Meera', zone: 'A', scopes: ['general', 'medical'], skill: 'Medical scope' },
  'SAATH-V103': { name: 'Imran', zone: 'B', scopes: ['general'], skill: 'General care' },
};
const SAMPLE = 'There’s an old uncle near the community library in Shanti Nagar. He lives alone. His daughter usually brings his food and medicines, but she’s been in hospital for a week. He looked weak and said he hasn’t had a proper meal in two days.';
const SAMPLE_NOTE = 'Older man, lives alone. His daughter usually brings food and medicines but has been in hospital for a week. He looked weak and said he hasn’t had a proper meal in two days.';

const GUIDES = {
  danger: { t: 'Immediate danger', num: '112', body: ['Call 112, India’s emergency number. Saath does not send emergency help.', 'Keep yourself safe. Help from a distance if you need to.', 'Don’t move an injured person unless where they are is more dangerous.', 'Once help is on the way, report here so care continues after the emergency.'] },
  caregiver: { t: 'Someone’s caregiver is missing', body: ['Ask simple questions: Have you eaten today? Do you have your medicines? Who usually helps you?', 'Write down what you see and hear, not what you think it means.', 'Choose “Needs daily care” so a volunteer can check in regularly.'] },
  child: { t: 'A child without a caregiver', num: '1098', body: ['If it’s safe, stay with the child in a visible public place.', 'Call Childline on 1098.', 'Don’t take the child home and don’t post photos.', 'Choose “Protected referral”. Only trained coordinators see these reports.'] },
  medical: { t: 'Medicine and medical needs', body: ['Note medicine names if you can see the packets.', 'Don’t give anyone medicine yourself.', 'Choose “Medication access”. Only volunteers with medical training can take these tasks.'] },
  offline: { t: 'Reporting without a connection', body: ['Your report is saved on this phone as you fill it in.', 'It is only sent when you tap Send report and see the confirmation screen.', 'Unsent reports show as “Unfinished report” on your home screen.'] },
  welfare: { t: 'A respectful welfare check', body: ['Introduce yourself and say why you came.', 'Ask before sharing anyone’s details. “Not asked” is an honest answer.', 'Tell them what will happen next, and only promise what you know will happen.'] },
};

/* ---------- Hindi (falls back to English for anything missing) ---------- */
const HI = {
  'Welcome to Saath': 'साथ में आपका स्वागत है', 'Care starts with understanding.': 'देखभाल समझ से शुरू होती है।',
  'Choose the language you’re comfortable with. You can change it anytime.': 'वह भाषा चुनें जिसमें आप सहज हैं। आप इसे कभी भी बदल सकते हैं।',
  'Continue': 'आगे बढ़ें', 'Back': 'वापस', 'Prototype': 'प्रोटोटाइप', 'Switch language': 'भाषा बदलें',
  'How are you joining?': 'आप कैसे जुड़ रहे हैं?', 'Two ways in. One care network for the ward.': 'जुड़ने के दो रास्ते। पूरे वार्ड के लिए एक देखभाल नेटवर्क।',
  'Report a need': 'ज़रूरत बताएँ', 'For someone nearby, or yourself': 'किसी पास वाले के लिए, या अपने लिए',
  'I’m a volunteer': 'मैं स्वयंसेवक हूँ', 'Sign in with your volunteer ID': 'अपनी स्वयंसेवक आईडी से साइन इन करें',
  'You only share what you know. Nothing is sent until you review it.': 'आप सिर्फ़ वही बताएँ जो आप जानते हैं। जाँचने से पहले कुछ नहीं भेजा जाता।',
  'Neighbour sign-in': 'पड़ोसी साइन-इन', 'Your phone number': 'आपका फ़ोन नंबर', 'Enter the 6-digit code': '6 अंकों का कोड डालें',
  'We sent it to': 'हमने यहाँ भेजा है', 'We use it to send you updates on the care you asked for.': 'इससे हम आपको आपके अनुरोध की जानकारी भेजते हैं।',
  'Mobile number': 'मोबाइल नंबर', 'Prototype: no SMS is sent.': 'प्रोटोटाइप: कोई SMS नहीं भेजा जाता।', 'Prototype code': 'प्रोटोटाइप कोड', 'Code': 'कोड',
  'Send code': 'कोड भेजें', 'Verify': 'पुष्टि करें', 'Change number': 'नंबर बदलें',
  'Can’t get a code? Report without verifying': 'कोड नहीं मिला? बिना पुष्टि के बताएँ',
  'Enter a 10-digit mobile number.': '10 अंकों का मोबाइल नंबर डालें।',
  'That code doesn’t match. Check the 6 digits and try again.': 'कोड मेल नहीं खाता। 6 अंक जाँचकर फिर कोशिश करें।',
  'You’re signed in.': 'आप साइन इन हैं।', 'You can report now. Updates need a verified number.': 'आप अब रिपोर्ट कर सकते हैं। अपडेट के लिए पुष्ट नंबर चाहिए।',
  'Volunteer sign-in': 'स्वयंसेवक साइन-इन', 'Your zone. Your team.': 'आपका ज़ोन। आपकी टीम।',
  'Use the ID your ward coordinator gave you. Your skills decide which tasks you can take.': 'वार्ड समन्वयक की दी हुई आईडी इस्तेमाल करें। आपके कौशल तय करते हैं कि आप कौन-से काम ले सकते हैं।',
  'Volunteer ID': 'स्वयंसेवक आईडी', 'Access code': 'एक्सेस कोड', 'Enter workspace': 'वर्कस्पेस खोलें', 'Prototype volunteers': 'प्रोटोटाइप स्वयंसेवक', 'code': 'कोड',
  'Zone': 'ज़ोन', 'General care': 'सामान्य देखभाल', 'Medical scope': 'चिकित्सा दायरा',
  'That ID and code don’t match. Check with your ward coordinator.': 'आईडी और कोड मेल नहीं खाते। अपने वार्ड समन्वयक से पूछें।', 'Welcome': 'स्वागत है',
  'Kanpur · Ward 12': 'कानपुर · वार्ड 12', 'Who needs care today?': 'आज किसे देखभाल की ज़रूरत है?', 'speak freely': 'खुलकर बोलें',
  'Tap to tell us': 'बताने के लिए टैप करें', 'Say what you saw. We turn it into a report you can check before sending.': 'जो देखा, वह बोलिए। हम उसे रिपोर्ट बना देंगे, जिसे भेजने से पहले आप जाँच सकते हैं।',
  'Type it instead': 'लिखकर बताएँ', 'Three short steps': 'तीन छोटे क़दम', 'Someone in danger?': 'कोई ख़तरे में है?', 'Call 112 first': 'पहले 112 पर कॉल करें',
  'Your requests': 'आपके अनुरोध', 'See all': 'सब देखें', 'Requests you send will show up here.': 'आपके भेजे अनुरोध यहाँ दिखेंगे।',
  'Updates need a verified number. You can still report.': 'अपडेट के लिए पुष्ट नंबर चाहिए। आप फिर भी रिपोर्ट कर सकते हैं।',
  'Unfinished report': 'अधूरी रिपोर्ट', 'Saved on this phone · not sent': 'इस फ़ोन पर सहेजी गई · भेजी नहीं गई', 'Discard': 'हटाएँ', 'Resume': 'जारी रखें', 'Example': 'उदाहरण',
  'Home': 'होम', 'Requests': 'अनुरोध', 'Guides': 'मार्गदर्शन', 'Today': 'आज', 'Cases': 'केस',
  'Tell us what’s happening': 'बताइए क्या हो रहा है', 'Cancel': 'रद्द करें', 'Listening…': 'सुन रहे हैं…',
  'Got it. Next, a quick safety check.': 'समझ गए। अब एक छोटी सुरक्षा जाँच।',
  'Prototype: a sample recording plays. Your microphone is not used.': 'प्रोटोटाइप: एक नमूना रिकॉर्डिंग चलती है। आपका माइक इस्तेमाल नहीं होता।',
  'Check the report': 'रिपोर्ट जाँचें', 'Step': 'क़दम', 'Safety': 'सुरक्षा', 'Details': 'विवरण', 'Review': 'जाँच',
  'Is anyone in immediate danger?': 'क्या कोई अभी ख़तरे में है?', 'Choose what you know right now. This doesn’t send an alert.': 'अभी जो पता है वह चुनें। इससे कोई अलर्ट नहीं जाता।',
  'Yes, there’s danger now': 'हाँ, अभी ख़तरा है', 'Injury, violence, fire, or someone can’t breathe': 'चोट, हिंसा, आग, या किसी को साँस नहीं आ रही',
  'No immediate danger': 'अभी कोई ख़तरा नहीं', 'They need help, but not this minute': 'मदद चाहिए, पर इसी पल नहीं',
  'I’m not sure': 'पक्का नहीं पता', 'We’ll treat it as urgent': 'हम इसे ज़रूरी मानेंगे', 'Call 112 now': 'अभी 112 पर कॉल करें',
  'Saath does not send emergency help. Call the national emergency number, then come back to report so care can continue.': 'साथ आपातकालीन मदद नहीं भेजता। राष्ट्रीय आपात नंबर पर कॉल करें, फिर लौटकर रिपोर्ट करें ताकि देखभाल जारी रहे।',
  'What do you know?': 'आप क्या जानते हैं?', 'Filled in from what you said. Check each part and fix anything we got wrong.': 'आपकी बात से भरा गया है। हर हिस्सा जाँचें और जो ग़लत हो उसे ठीक करें।',
  'Share only what you know. Skip anything you’re unsure of.': 'सिर्फ़ वही बताएँ जो पता है। जो पक्का न हो, छोड़ दें।',
  'Who needs support?': 'किसे मदद चाहिए?', 'Choose all that fit.': 'जो भी लागू हों, सब चुनें।', 'What help is needed?': 'कैसी मदद चाहिए?',
  'Where can a volunteer find them?': 'स्वयंसेवक उन्हें कहाँ ढूँढ़ें?', 'A landmark people know, e.g. near the temple': 'कोई जानी-पहचानी जगह, जैसे मंदिर के पास',
  'Landmark': 'पहचान की जगह', 'We don’t detect your location.': 'हम आपकी लोकेशन नहीं लेते।', 'About them': 'उनके बारे में',
  'Optional. Leave blank if you don’t know.': 'वैकल्पिक। न पता हो तो ख़ाली छोड़ें।', 'Name': 'नाम', 'Age': 'उम्र',
  'How do you know them?': 'आप उन्हें कैसे जानते हैं?', 'Choose one': 'एक चुनें', 'Did they agree to share their details?': 'क्या वे अपनी जानकारी साझा करने को राज़ी हैं?',
  'If they didn’t agree, we share only the need and the place.': 'राज़ी न हों तो हम सिर्फ़ ज़रूरत और जगह साझा करते हैं।',
  'Anything else?': 'और कुछ?', 'What you saw or heard. Not a diagnosis.': 'जो देखा या सुना। कोई निदान नहीं।', 'Please answer this.': 'कृपया इसका जवाब दें।',
  'Save for later': 'बाद के लिए सहेजें', 'Saved on this phone. Resume it from home.': 'इस फ़ोन पर सहेजा गया। होम से जारी रखें।',
  'Check before you send': 'भेजने से पहले जाँचें', 'Edit': 'बदलें', 'Who': 'कौन', 'Help': 'मदद', 'Where': 'कहाँ', 'You are their': 'आप उनके', 'Consent': 'सहमति', 'Notes': 'नोट', 'yrs': 'वर्ष',
  'The ward coordinator and the volunteer who takes this will see these details.': 'वार्ड समन्वयक और यह काम लेने वाला स्वयंसेवक ये विवरण देखेंगे।',
  'Without consent, volunteers see only the need and the place. Name and age stay with the coordinator.': 'सहमति के बिना स्वयंसेवक सिर्फ़ ज़रूरत और जगह देखते हैं। नाम और उम्र समन्वयक के पास रहते हैं।',
  'A report asks for care. It does not send emergency help. In danger, call 112.': 'रिपोर्ट देखभाल माँगती है। यह आपातकालीन मदद नहीं भेजती। ख़तरे में 112 पर कॉल करें।',
  'Send report': 'रिपोर्ट भेजें', 'Report sent': 'रिपोर्ट भेज दी गई', 'Thank you. A ward coordinator will look at it soon.': 'धन्यवाद। वार्ड समन्वयक जल्द इसे देखेंगे।',
  'What happens next': 'आगे क्या होगा', 'Track this request': 'इस अनुरोध को देखें', 'Back to home': 'होम पर जाएँ',
  'Report received': 'रिपोर्ट मिली', 'Coordinator reviewed': 'समन्वयक ने देखा', 'Volunteer on it': 'स्वयंसेवक लगे हैं', 'Visit done': 'मुलाक़ात हुई', 'Care delivered': 'देखभाल पहुँची', 'Referred onward': 'आगे भेजा गया',
  'Usually within 2 hours': 'आमतौर पर 2 घंटे में', 'A nearby volunteer with the right skills': 'सही कौशल वाला पास का स्वयंसेवक', 'They’ll check in person': 'वे ख़ुद जाकर देखेंगे', 'You’ll see the outcome here': 'नतीजा यहीं दिखेगा',
  'Every report, every step.': 'हर रिपोर्ट, हर क़दम।', 'Report another need': 'एक और ज़रूरत बताएँ', 'Progress': 'प्रगति', 'What you told us': 'आपने क्या बताया',
  'A little guidance helps.': 'थोड़ा मार्गदर्शन काम आता है।', 'Short, practical notes. Not medical advice.': 'छोटे, काम के नोट। चिकित्सा सलाह नहीं।',
  'Volunteer': 'स्वयंसेवक', 'Good to have you': 'आपका स्वागत है', 'Tasks you can take': 'काम जो आप ले सकते हैं', 'of {n} open in your zone': 'ज़ोन के {n} खुले केस में से',
  'Review tasks': 'काम देखें', 'Your active tasks': 'आपके चालू काम', 'Closed by you': 'आपने पूरे किए', 'Needs attention': 'ध्यान चाहिए', 'All cases': 'सभी केस',
  'Nothing open in your zone right now.': 'अभी आपके ज़ोन में कुछ खुला नहीं है।', 'Your neighbourhood': 'आपका मोहल्ला',
  'Illustrative map, not for navigation': 'सांकेतिक नक्शा, रास्ता ढूँढ़ने के लिए नहीं', 'Illustrative map of zones A and B': 'ज़ोन A और B का सांकेतिक नक्शा',
  'You’re on it': 'आप इस पर हैं', 'Taken by': 'इनके पास:', 'You can take this': 'आप यह ले सकते हैं', 'Outside your zone': 'आपके ज़ोन से बाहर', 'Needs medical scope': 'चिकित्सा दायरा चाहिए', 'Coordinator only': 'सिर्फ़ समन्वयक',
  'Where you can help': 'आप कहाँ मदद कर सकते हैं', 'You can take': 'आप ले सकते हैं', 'All in zone': 'पूरा ज़ोन', 'Yours': 'आपके',
  'You haven’t taken a task yet.': 'आपने अभी कोई काम नहीं लिया।', 'Nothing here right now. New reports appear as neighbours send them.': 'अभी यहाँ कुछ नहीं। पड़ोसियों की नई रिपोर्ट यहाँ आएँगी।',
  'Within your scope': 'आपके दायरे में', 'Not in your scope': 'आपके दायरे में नहीं', 'This case is outside your zone.': 'यह केस आपके ज़ोन से बाहर है।',
  'Needs a volunteer with medical training. The coordinator will find one.': 'चिकित्सा प्रशिक्षण वाले स्वयंसेवक की ज़रूरत है। समन्वयक ढूँढ़ेंगे।',
  'Protected referrals are handled by trained coordinators only.': 'संरक्षित रेफ़रल सिर्फ़ प्रशिक्षित समन्वयक संभालते हैं।',
  'What the reporter saw': 'रिपोर्ट करने वाले ने क्या देखा', 'Not shared': 'साझा नहीं', 'Reporter': 'रिपोर्ट करने वाला',
  'Accept this task': 'यह काम लें', 'Record the visit': 'मुलाक़ात दर्ज करें', 'I can’t do this after all': 'मैं यह नहीं कर पाऊँगा',
  'Task accepted. The reporter can see a volunteer is on it.': 'काम ले लिया। रिपोर्ट करने वाला देख सकता है कि स्वयंसेवक लगे हैं।',
  'How did the visit go?': 'मुलाक़ात कैसी रही?', 'They got what they needed': 'उन्हें ज़रूरत की चीज़ मिल गई', 'Passed to a doctor, shelter or official service': 'डॉक्टर, आश्रय या सरकारी सेवा को भेजा',
  'Couldn’t reach them': 'उन तक नहीं पहुँच पाए', 'Nobody home, or they declined': 'घर पर कोई नहीं था, या उन्होंने मना किया',
  'Next step for the coordinator': 'समन्वयक के लिए अगला क़दम', 'e.g. Needs rations again next Monday': 'जैसे, अगले सोमवार फिर राशन चाहिए',
  'Choose how it went.': 'चुनें कि कैसा रहा।', 'Save and close': 'सहेजें और बंद करें', 'Saved. The reporter will see the outcome.': 'सहेजा गया। रिपोर्ट करने वाला नतीजा देखेगा।',
  'Volunteer couldn’t reach them. Back in the queue.': 'स्वयंसेवक नहीं पहुँच पाए। फिर से कतार में।', 'Volunteer released the task. Back in the queue.': 'स्वयंसेवक ने काम छोड़ा। फिर से कतार में।',
  'This is a working prototype': 'यह एक चलता हुआ प्रोटोटाइप है', 'People, places and cases are made up.': 'लोग, जगहें और केस काल्पनिक हैं।',
  'Nothing is sent anywhere. No SMS, no dispatch.': 'कुछ भी कहीं नहीं भेजा जाता। न SMS, न मदद।', 'Please don’t enter real personal or medical details.': 'कृपया असली निजी या चिकित्सा जानकारी न डालें।',
  'In a real emergency, call 112.': 'असली आपात स्थिति में 112 पर कॉल करें।', 'Switch role': 'भूमिका बदलें', 'Reset prototype data': 'प्रोटोटाइप डेटा रीसेट करें',
  'Zone A · Shanti Nagar': 'ज़ोन A · शांति नगर', 'Zone B · Lake Road': 'ज़ोन B · लेक रोड', 'Near the community library, Shanti Nagar': 'सामुदायिक पुस्तकालय के पास, शांति नगर',
  // categories
  'Needs daily care': 'रोज़ की देखभाल चाहिए', 'Child without a caregiver': 'बिना देखभाल करने वाले के बच्चा', 'Needs medical help': 'चिकित्सा मदद चाहिए',
  'Can’t get essentials': 'ज़रूरी चीज़ें नहीं मिल रहीं', 'May be alone or unreachable': 'शायद अकेले हैं या संपर्क नहीं हो रहा', 'Other / not sure': 'अन्य / पक्का नहीं',
  'Food / meals': 'खाना', 'Drinking water': 'पीने का पानी', 'Essential supplies': 'ज़रूरी सामान', 'Everyday care': 'रोज़मर्रा की देखभाल', 'Medication access': 'दवाइयाँ', 'Welfare check': 'हालचाल जाँच', 'Protected referral': 'संरक्षित रेफ़रल',
  'Family member': 'परिवार के सदस्य', 'Friend': 'दोस्त', 'Neighbour': 'पड़ोसी', 'Caregiver or guardian': 'देखभालकर्ता या अभिभावक', 'Health or support worker': 'स्वास्थ्य या सहायता कर्मी',
  'Volunteer or community worker': 'स्वयंसेवक या सामुदायिक कार्यकर्ता', 'Passer-by / stranger': 'राहगीर / अनजान', 'Prefer not to say': 'नहीं बताना चाहते',
  'Spoke to them': 'उनसे बात की', 'Saw it myself': 'ख़ुद देखा', 'Someone told me': 'किसी ने बताया', 'Can’t reach them': 'संपर्क नहीं हो रहा',
  'Agreed to share': 'साझा करने को राज़ी', 'Did not agree': 'राज़ी नहीं', 'Couldn’t ask': 'पूछ नहीं पाए', 'Not asked': 'पूछा नहीं',
  'Woman / girl': 'महिला / लड़की', 'Man / boy': 'पुरुष / लड़का', 'Other / not stated': 'अन्य / नहीं बताया',
  'Urgent review': 'तुरंत समीक्षा', 'Priority review': 'प्राथमिक समीक्षा', 'Routine': 'सामान्य',
  // guides
  'Immediate danger': 'तुरंत ख़तरा',
  'Call 112, India’s emergency number. Saath does not send emergency help.': '112 पर कॉल करें, यह भारत का आपात नंबर है। साथ आपातकालीन मदद नहीं भेजता।',
  'Keep yourself safe. Help from a distance if you need to.': 'ख़ुद को सुरक्षित रखें। ज़रूरत हो तो दूरी से मदद करें।',
  'Don’t move an injured person unless where they are is more dangerous.': 'घायल व्यक्ति को तभी हिलाएँ जब वहाँ रहना ज़्यादा ख़तरनाक हो।',
  'Once help is on the way, report here so care continues after the emergency.': 'मदद रास्ते में हो, तब यहाँ रिपोर्ट करें ताकि आपात स्थिति के बाद भी देखभाल जारी रहे।',
  'Someone’s caregiver is missing': 'किसी की देखभाल करने वाला नहीं है',
  'Ask simple questions: Have you eaten today? Do you have your medicines? Who usually helps you?': 'सीधे सवाल पूछें: आज खाना खाया? दवाइयाँ हैं? आमतौर पर कौन मदद करता है?',
  'Write down what you see and hear, not what you think it means.': 'जो देखें और सुनें वह लिखें, उसका मतलब नहीं।',
  'Choose “Needs daily care” so a volunteer can check in regularly.': '“रोज़ की देखभाल चाहिए” चुनें ताकि स्वयंसेवक नियमित हालचाल ले सकें।',
  'A child without a caregiver': 'बिना देखभाल करने वाले के बच्चा',
  'If it’s safe, stay with the child in a visible public place.': 'सुरक्षित हो तो बच्चे के साथ किसी खुली सार्वजनिक जगह पर रहें।', 'Call Childline on 1098.': 'चाइल्डलाइन 1098 पर कॉल करें।',
  'Don’t take the child home and don’t post photos.': 'बच्चे को घर न ले जाएँ और फ़ोटो पोस्ट न करें।',
  'Choose “Protected referral”. Only trained coordinators see these reports.': '“संरक्षित रेफ़रल” चुनें। ये रिपोर्ट सिर्फ़ प्रशिक्षित समन्वयक देखते हैं।',
  'Medicine and medical needs': 'दवा और चिकित्सा ज़रूरतें',
  'Note medicine names if you can see the packets.': 'पैकेट दिखें तो दवाओं के नाम लिख लें।', 'Don’t give anyone medicine yourself.': 'किसी को ख़ुद से दवा न दें।',
  'Choose “Medication access”. Only volunteers with medical training can take these tasks.': '“दवाइयाँ” चुनें। ये काम सिर्फ़ चिकित्सा प्रशिक्षण वाले स्वयंसेवक ले सकते हैं।',
  'Reporting without a connection': 'बिना इंटरनेट के रिपोर्ट',
  'Your report is saved on this phone as you fill it in.': 'भरते समय आपकी रिपोर्ट इस फ़ोन पर सहेजी जाती है।',
  'It is only sent when you tap Send report and see the confirmation screen.': 'यह तभी जाती है जब आप “रिपोर्ट भेजें” दबाते हैं और पुष्टि स्क्रीन दिखती है।',
  'Unsent reports show as “Unfinished report” on your home screen.': 'न भेजी गई रिपोर्ट होम पर “अधूरी रिपोर्ट” के रूप में दिखती है।',
  'A respectful welfare check': 'सम्मान से हालचाल जाँच',
  'Introduce yourself and say why you came.': 'अपना परिचय दें और बताएँ कि क्यों आए।',
  'Ask before sharing anyone’s details. “Not asked” is an honest answer.': 'किसी की जानकारी साझा करने से पहले पूछें। “पूछा नहीं” भी सच्चा जवाब है।',
  'Tell them what will happen next, and only promise what you know will happen.': 'बताएँ कि आगे क्या होगा, और वही वादा करें जो पक्का हो।',
  [SAMPLE]: 'शांति नगर में सामुदायिक पुस्तकालय के पास एक बुज़ुर्ग अंकल हैं। वे अकेले रहते हैं। उनकी बेटी आमतौर पर खाना और दवाइयाँ लाती है, लेकिन वह एक हफ़्ते से अस्पताल में है। वे कमज़ोर दिख रहे थे और बोले कि दो दिन से ठीक से खाना नहीं खाया।',
  [SAMPLE_NOTE]: 'बुज़ुर्ग व्यक्ति, अकेले रहते हैं। बेटी आमतौर पर खाना और दवाइयाँ लाती है, पर एक हफ़्ते से अस्पताल में है। कमज़ोर दिखे और बोले कि दो दिन से ठीक से खाना नहीं खाया।',
};

Object.assign(HI, {
  'Sounds': 'आवाज़', 'Call 112': '112 पर कॉल करें', 'Your relationship': 'उनसे आपका रिश्ता', 'Phone or ID needed': 'फ़ोन या आईडी चाहिए',
  // v2
  'Photo': 'फ़ोटो', 'Add a photo': 'फ़ोटो जोड़ें', 'Remove photo': 'फ़ोटो हटाएँ', 'Attached photo': 'जोड़ी गई फ़ोटो',
  'Optional. Helps the volunteer find and recognise them. Ask before photographing someone.': 'वैकल्पिक। इससे स्वयंसेवक उन्हें ढूँढ़ और पहचान पाते हैं। किसी की फ़ोटो लेने से पहले पूछें।',
  'Photo attached. You’ll see it once you accept this task.': 'फ़ोटो जुड़ी है। काम लेने के बाद दिखेगी।',
  'We couldn’t read that file. Try a JPG or PNG photo.': 'यह फ़ाइल नहीं खुली। JPG या PNG फ़ोटो आज़माएँ।',
  'You’re offline. Reports are saved on this phone.': 'आप ऑफ़लाइन हैं। रिपोर्ट इस फ़ोन पर सहेजी जाती हैं।',
  'Simulate no connection': 'बिना इंटरनेट का अभ्यास', 'New reports are saved on this phone and sent when you switch this off.': 'नई रिपोर्ट इस फ़ोन पर सहेजी जाती हैं और इसे बंद करने पर भेजी जाती हैं।',
  'Report saved': 'रिपोर्ट सहेजी गई', 'It will upload as soon as you’re back online.': 'इंटरनेट आते ही यह भेज दी जाएगी।',
  'If you can, stay with the person until help arrives.': 'हो सके तो मदद आने तक उनके साथ रहें।', 'Saved · waiting for network': 'सहेजी गई · नेटवर्क का इंतज़ार',
  'Sends when you’re back online': 'इंटरनेट आने पर भेजी जाएगी', 'Back online.': 'फिर से ऑनलाइन।', 'Offline mode on. Reports will be saved on this phone.': 'ऑफ़लाइन मोड चालू। रिपोर्ट इस फ़ोन पर सहेजी जाएँगी।',
  '1 saved report sent.': '1 सहेजी गई रिपोर्ट भेजी गई।', '{n} saved reports sent.': '{n} सहेजी गई रिपोर्ट भेजी गईं।',
  'is on the way': 'रास्ते में हैं', '{n} m away': '{n} मीटर दूर', 'Arriving now': 'बस पहुँच रहे हैं',
  'Chats': 'चैट', 'Stay in touch': 'जुड़े रहें', 'Volunteers': 'स्वयंसेवक', 'Groups': 'समूह', 'Authorities': 'अधिकारी', 'You': 'आप', 'Message': 'संदेश', 'Send': 'भेजें',
  'Escalate': 'आगे बढ़ाएँ', 'Escalated': 'आगे बढ़ाया गया', 'Send this to the ward coordinator now?': 'इसे अभी वार्ड समन्वयक को भेजें?',
  'The case becomes urgent and the coordinator is alerted. The reporter sees that it was escalated. In danger, call 112 first.': 'केस ज़रूरी हो जाता है और समन्वयक को सूचना जाती है। रिपोर्ट करने वाला देखता है कि इसे आगे बढ़ाया गया। ख़तरे में पहले 112 पर कॉल करें।',
  'Worse than reported': 'बताए से ज़्यादा गंभीर', 'Needs medical help now': 'अभी चिकित्सा मदद चाहिए', 'Safety risk at the location': 'वहाँ सुरक्षा का ख़तरा', 'Something else': 'कुछ और',
  'What should the coordinator know?': 'समन्वयक को क्या जानना चाहिए?', 'Choose a reason.': 'कारण चुनें।', 'Escalate to coordinator': 'समन्वयक को भेजें',
  'Escalated to the ward coordinator': 'वार्ड समन्वयक को भेजा गया', 'Escalated. The coordinator has been alerted.': 'भेज दिया। समन्वयक को सूचना मिल गई।',
  'Alerts': 'अलर्ट', 'Report': 'रिपोर्ट करें', 'Overview': 'एक नज़र में', 'Volunteers on duty': 'ड्यूटी पर स्वयंसेवक', 'Open reports': 'खुली रिपोर्ट', 'out of {n}': '{n} में से', 'Open': 'खोलें', 'Live tracking': 'लाइव ट्रैकिंग',
  'Priority alert waiting': 'प्राथमिक अलर्ट इंतज़ार में', 'An urgent case in your zone needs someone now.': 'आपके ज़ोन के एक ज़रूरी केस को अभी किसी की ज़रूरत है।', 'View details': 'विवरण देखें',
  'You have new alerts': 'आपके लिए नए अलर्ट', 'New reports came in near you.': 'आपके पास नई रिपोर्ट आई हैं।', 'Go to alerts': 'अलर्ट देखें',
  'You have new messages': 'आपके लिए नए संदेश', '{n} unread in your chats.': 'चैट में {n} अनपढ़े संदेश।', 'Go to messages': 'संदेश देखें',
  'Awesome!': 'बढ़िया!', 'Nothing new came up. You’re all sorted.': 'कुछ नया नहीं आया। सब ठीक है।',
  '{n} need your attention': '{n} पर ध्यान चाहिए', 'No new alerts': 'कोई नया अलर्ट नहीं', 'You’ll see new reports and escalations here.': 'नई रिपोर्ट और आगे बढ़ाए गए केस यहाँ दिखेंगे।',
  'Map': 'नक्शा', 'Full map': 'पूरा नक्शा', 'All': 'सभी', 'Urgent': 'ज़रूरी', 'Open case': 'केस खोलें', 'Tap a pin to see the case.': 'केस देखने के लिए पिन पर टैप करें।',
  'Zoom in': 'बड़ा करें', 'Zoom out': 'छोटा करें', 'Back to me': 'मेरी जगह पर',
  'Where to go': 'कहाँ जाना है', '{n} min walk': '{n} मिनट पैदल',
  'New report nearby': 'पास में नई रिपोर्ट', 'Locate': 'जगह देखें', 'Later': 'बाद में',
  'New here? Register as a volunteer': 'नए हैं? स्वयंसेवक बनें', 'Check your application': 'अपना आवेदन देखें', 'Volunteer registration': 'स्वयंसेवक पंजीकरण',
  'About you': 'आपके बारे में', 'How you can help': 'आप कैसे मदद करेंगे', 'Verification': 'पुष्टि',
  'A helping hand.': 'मदद का एक हाथ।', 'Starting with you.': 'आपसे शुरुआत।', 'How can you help?': 'आप कैसे मदद कर सकते हैं?', 'Let’s build trust.': 'भरोसा बनाएँ।',
  'Just the basics. Your details stay with the ward coordinator.': 'बस ज़रूरी बातें। आपकी जानकारी वार्ड समन्वयक के पास रहती है।',
  'Your name': 'आपका नाम', 'Full name': 'पूरा नाम', 'Prototype: use any 10 digits. No SMS is sent.': 'प्रोटोटाइप: कोई भी 10 अंक डालें। कोई SMS नहीं जाता।', 'Where will you help?': 'आप कहाँ मदद करेंगे?',
  'Choose what you’re comfortable doing. You can change this later.': 'जो आपको ठीक लगे वह चुनें। बाद में बदल सकते हैं।', 'I can help with': 'मैं इसमें मदद कर सकता/सकती हूँ',
  'Food and supplies': 'खाना और सामान', 'Daily care and check-ins': 'रोज़ की देखभाल और हालचाल', 'Transport and errands': 'आने-जाने और छोटे काम', 'Medical support': 'चिकित्सा सहायता', 'Child protection': 'बाल सुरक्षा',
  'Medical support and child protection need an extra qualification check before you can take those tasks.': 'चिकित्सा सहायता और बाल सुरक्षा के काम लेने से पहले अलग योग्यता जाँच होती है।',
  'How often can you help?': 'आप कितनी बार मदद कर सकते हैं?', 'A few hours a week': 'हफ़्ते में कुछ घंटे', 'Most days': 'ज़्यादातर दिन', 'Only when called': 'सिर्फ़ बुलाने पर',
  'Your identity is checked before you can accept tasks.': 'काम लेने से पहले आपकी पहचान जाँची जाती है।', 'Identity document': 'पहचान पत्र', 'Document': 'दस्तावेज़', 'Choose a sample document': 'नमूना दस्तावेज़ चुनें',
  'Sample Aadhaar card': 'नमूना आधार कार्ड', 'Sample voter ID': 'नमूना वोटर आईडी', 'Sample driving licence': 'नमूना ड्राइविंग लाइसेंस',
  'Prototype documents only. Please don’t upload a real ID.': 'सिर्फ़ प्रोटोटाइप दस्तावेज़। असली आईडी न डालें।', 'Code of conduct': 'आचार संहिता',
  'I’ll respect people’s privacy, only take tasks I’m trained for, and follow the coordinator’s guidance.': 'मैं लोगों की निजता का सम्मान करूँगा/करूँगी, सिर्फ़ वही काम लूँगा/लूँगी जिसका प्रशिक्षण है, और समन्वयक की बात मानूँगा/मानूँगी।',
  'Send for verification': 'पुष्टि के लिए भेजें', 'Application sent': 'आवेदन भेजा गया', 'Thanks': 'धन्यवाद',
  'The ward coordinator usually replies within 2 days. We’ll send your volunteer ID to': 'वार्ड समन्वयक आमतौर पर 2 दिन में जवाब देते हैं। आपकी स्वयंसेवक आईडी यहाँ भेजेंगे:',
  'Application received': 'आवेदन मिला', 'ID check': 'पहचान जाँच', 'Call with the ward coordinator': 'वार्ड समन्वयक से बात', 'Short safety training': 'छोटा सुरक्षा प्रशिक्षण', 'Volunteer ID issued': 'स्वयंसेवक आईडी जारी',
  'You applied for': 'आपने आवेदन किया', 'Prototype: approve now': 'प्रोटोटाइप: अभी मंज़ूर करें', 'Approved. Your volunteer ID is': 'मंज़ूर। आपकी स्वयंसेवक आईडी है',
  'Report as a neighbour': 'पड़ोसी के रूप में', 'New report': 'नई रिपोर्ट', 'Call': 'कॉल करें', 'Done': 'हो गया',
  'Select all that fit': 'जो लागू हों, सब चुनें', 'task is ready for you': 'काम आपके लिए तैयार है', 'tasks are ready for you': 'काम आपके लिए तैयार हैं',
  '{n} open in your zone': 'आपके ज़ोन में {n} खुले', '{n} closed by you': 'आपने {n} पूरे किए', 'See all cases': 'सभी केस देखें',
  'Your tasks': 'आपके काम', 'Ready for you': 'आपके लिए तैयार', 'Nothing needs you right now. New tasks will show up here.': 'अभी आपके लिए कुछ नहीं। नए काम यहाँ दिखेंगे।',
});

/* Fluent 3D emoji (microsoft/fluentui-emoji, MIT) for content; line icons only for system controls. */
const WHO_E = { daily: 'heart_hands', child: 'baby', medical: 'medical', essentials: 'basket', alone: 'house', other: 'question' };
const HELP_E = { food: 'food', water: 'water', supplies: 'package', care: 'hug', medication: 'pill', welfare: 'wave', protected: 'shield', other: 'question' };
const GUIDE_LOOK = { danger: ['err', 'warning'], caregiver: ['warn', 'older'], child: ['lav', 'child'], medical: ['', 'stethoscope'], offline: ['', 'phone'], welfare: ['lav', 'hugging'] };
const OUT_E = { delivered: 'check', referred: 'handshake', unreachable: 'house' };
const VOL_E = 'handshake';

/* ---------- state ---------- */
function seed() {
  const now = Date.now();
  const ev = (...p) => p.map(([s, h]) => ({ s, t: now - h * HOUR }));
  return {
    v: 3, lang: null, role: null, user: null, draft: null, sound: true, offline: false, dismissed: [], stack: [{ n: 'lang', p: {} }],
    chats: seedChats(now),
    cases: [
      { id: 'ST-2044', zone: 'A', xy: [44, 128], who: ['alone'], help: ['welfare', 'food'], landmark: 'Near the community library, Shanti Nagar', summary: 'An older man sitting alone outside the library since morning. He says nobody has come to check on him.', rel: 'bystander', know: 'saw', consent: 'unknown', name: '', age: '', gender: 'man', safety: 'no', status: 'received', events: ev(['received', 0.4]) },
      { id: 'ST-2039', mine: true, example: true, zone: 'A', xy: [0, 0], who: ['medical'], help: ['medication'], landmark: 'Gali 3, near the Shanti Nagar temple', summary: 'Neighbour with a fever has run out of her medicines.', rel: 'neighbour', know: 'spoke', consent: 'agreed', name: '', age: '', gender: '', safety: 'no', status: 'assigned', helper: 'Meera', events: ev(['received', 2], ['reviewed', 1.5], ['assigned', 0.1]) },
      { id: 'ST-2042', zone: 'A', xy: [128, 108], who: ['medical'], help: ['medication', 'welfare'], landmark: 'Near the ward care desk, gate 2', summary: 'Man with diabetes missed his insulin pickup. His wife, who usually manages it, is in hospital.', rel: 'family', know: 'told', consent: 'unknown', name: '', age: '61', gender: 'man', safety: 'no', status: 'reviewed', events: ev(['received', 6], ['reviewed', 5]) },
      { id: 'ST-2041', zone: 'A', xy: [70, 62], who: ['daily', 'essentials'], help: ['food', 'supplies'], landmark: 'Lane 4, behind Shanti School', summary: 'Older woman living alone. Her son moved away for work and she has run out of rations.', rel: 'neighbour', know: 'spoke', consent: 'agreed', name: 'Kamla Devi', age: '74', gender: 'woman', safety: 'no', status: 'reviewed', events: ev(['received', 20], ['reviewed', 18]) },
      { id: 'ST-2043', zone: 'B', xy: [236, 74], who: ['alone'], help: ['water', 'welfare'], landmark: 'Blue house opposite the Lake Road bus stop', summary: 'Neighbours haven’t seen the elderly couple in two days. Their water drum is empty outside.', rel: 'bystander', know: 'saw', consent: 'unable', name: '', age: '', gender: '', safety: 'no', status: 'reviewed', events: ev(['received', 9], ['reviewed', 8]) },
      { id: 'ST-2036', mine: true, example: true, zone: 'B', xy: [262, 120], who: ['essentials'], help: ['water'], landmark: 'Community tap, Lake Road', summary: 'Family of five without drinking water after the tap broke.', rel: 'neighbour', know: 'saw', consent: 'agreed', name: '', age: '', gender: '', safety: 'no', status: 'closed', outcome: 'delivered', helper: 'Imran', events: ev(['received', 96], ['reviewed', 94], ['assigned', 90], ['visited', 80], ['closed', 79]) },
    ],
  };
}
function seedChats(now) {
  const m = (who, text, min, me = false) => ({ who, text, me, t: now - min * 60000 });
  return {
    meera: { kind: 'vol', name: 'Meera', unread: 1, msgs: [m('Meera', 'Picked up the insulin for ST-2042. Dropping it at gate 2 by 5.', 32), m('Meera', 'Can you check on Kamla Devi on Lane 4 tomorrow?', 14)] },
    imran: { kind: 'vol', name: 'Imran', unread: 0, msgs: [m('Imran', 'Lake Road tap is fixed. Closing ST-2036.', 180), m('You', 'Great, thanks Imran!', 170, true)] },
    sunita: { kind: 'vol', name: 'Sunita', unread: 0, msgs: [m('Sunita', 'Shanti School gate is locked after 6 pm. Use the side lane.', 1500)] },
    zoneA: { kind: 'grp', name: 'Zone A volunteers', members: 12, unread: 2, msgs: [m('Arjun', 'Ration kits restocked at the ward care desk.', 55), m('Meera', 'Insulin pickup for ST-2042 is sorted.', 30)] },
    medical: { kind: 'grp', name: 'Medical team', members: 5, unread: 0, msgs: [m('Dr. Rao', 'Shift handover at 8 pm today.', 240)] },
    rations: { kind: 'grp', name: 'Food & rations', members: 9, unread: 0, msgs: [m('Arjun', 'Need two people for Saturday’s distribution.', 600)] },
    desk: { kind: 'auth', name: 'Ward care desk', emoji: 'clipboard', unread: 1, msgs: [m('Ward care desk', 'A protected referral in Zone A is with the coordinator. No volunteer action needed.', 20)] },
    ambulance: { kind: 'auth', name: 'Ambulance services', emoji: 'medical', unread: 0, msgs: [m('Ambulance services', 'For emergencies call 112. Non-urgent hospital transport needs 2 hours’ notice.', 900)] },
    police: { kind: 'auth', name: 'Local police', emoji: 'siren', unread: 0, msgs: [m('Local police', 'Beat officer on Lake Road until 10 pm.', 120)] },
    water: { kind: 'auth', name: 'Water supply dept', emoji: 'water', unread: 0, msgs: [m('Water supply dept', 'Tanker at the Lake Road bus stop, 4–6 pm.', 75)] },
  };
}
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 3) return s; } catch {} return seed(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }
const blankDraft = () => ({ safety: '', who: [], help: [], landmark: '', zone: '', name: '', age: '', gender: '', rel: '', know: '', consent: '', notes: '', photo: '', fromVoice: false });

let S = load(), timer = 0, toastT = 0, outcomePick = '';
Object.assign(VOLS, S.newVols || {}); // volunteers approved through registration

/* volunteer registration (step shape borrowed from Relay: basics → how you can help → trust) */
const SKILLS = { supplies: ['Food and supplies', 'basket'], care: ['Daily care and check-ins', 'heart_hands'], transport: ['Transport and errands', 'package'], medical: ['Medical support', 'stethoscope'], child: ['Child protection', 'child'] };
const AVAIL = { few: 'A few hours a week', most: 'Most days', calls: 'Only when called' };
const DOCS = { aadhaar: 'Sample Aadhaar card', voter: 'Sample voter ID', licence: 'Sample driving licence' };
const blankReg = () => ({ name: '', phone: '', zone: '', skills: [], avail: '', doc: '', agree: false, status: 'draft' });
const t = s => (S.lang === 'hi' && HI[s]) || s;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- sound ---------- */
const SFX = {};
function sfx(n) {
  if (!S.sound || !n) return;
  try {
    const a = SFX[n] || (SFX[n] = new Audio(`sfx/${n}.mp3`));
    a.volume = n === 'click' || n === 'soft' ? .45 : .6;
    a.currentTime = 0;
    a.play()?.catch(() => {});
  } catch {}
}

/* ---------- helpers ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const I = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', back: '<path d="M19 12H5M11 6l-6 6 6 6"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>', list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>', chev: '<path d="M9 6l6 6-6 6"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>', phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  mute: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  minus: '<path d="M5 12h14"/>',
  expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
  locate: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  chat: '<path d="M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H10l-5 4v-4H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',
  send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/><path d="M11.5 13.5L20 4"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  wifioff: '<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01M3 3l18 18"/>',
};
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
const em = n => `<img class="emo" src="emoji/${n}.png" alt="" aria-hidden="true" draggable="false">`;
const btn = (label, attrs = '', { v = 'filled', icon = '', trail = false } = {}) =>
  `<button class="btn ${v}" ${attrs}>${icon && !trail ? ic(icon) : ''}<span>${label}</span>${icon && trail ? ic(icon) : ''}</button>`;
const orb = (emoji, cls = '', size = 168) => `<span class="liquid ${cls}" style="--s:${size}px" aria-hidden="true"><span class="ring"></span><span class="ring r2"></span><span class="ring r3"></span><span class="blob"></span><span class="blob b2"></span><span class="gloss"></span>${em(emoji)}</span>`;
const byId = id => S.cases.find(c => c.id === id);
const me = () => VOLS[S.user?.vid];
function ago(ts) {
  const rtf = new Intl.RelativeTimeFormat(S.lang === 'hi' ? 'hi' : 'en', { numeric: 'auto' });
  const m = Math.round((ts - Date.now()) / 60000);
  if (m > -60) return rtf.format(m, 'minute');
  const h = Math.round(m / 60);
  return h > -24 ? rtf.format(h, 'hour') : rtf.format(Math.round(h / 24), 'day');
}
function urgency(c) {
  if (c.escalated || c.safety === 'yes' || c.safety === 'unsure') return 'urgent';
  if (c.help.some(h => h === 'medication' || h === 'protected') || c.who.some(w => w === 'medical' || w === 'child')) return 'priority';
  return 'routine';
}
const needs = c => c.who.includes('child') || c.help.includes('protected') ? 'protected' : c.who.includes('medical') || c.help.includes('medication') ? 'medical' : 'general';
const canTake = c => { const v = me(); return !!v && c.zone === v.zone && v.scopes.includes(needs(c)); };
const isOpen = c => !c.assignedTo && c.status !== 'closed';
const helperName = c => c.helper || VOLS[c.assignedTo]?.name || '';
const helpText = c => c.help.map(h => t(HELP[h])).join(' · ');
const statusText = c => c.status === 'closed' ? t(c.outcome === 'referred' ? 'Referred onward' : 'Care delivered') : c.status === 'queued' ? t('Saved · waiting for network') : t(STAGE[c.status]);
const live = c => !c.example && c.status !== 'queued'; // what volunteers can see
const tint = c => c.status === 'closed' ? 'ok' : c.status === 'queued' ? 'q' : urgency(c);
const urgTag = c => c.escalated ? t('Escalated') : t(URG[urgency(c)]);
const step = c => STAGES.indexOf(c.status) + 1;
const lastT = c => c.events[c.events.length - 1].t;
const badge = c => { const u = urgency(c); return `<span class="badge u-${u}">${t(URG[u])}</span>`; };
const heroFor = c => c.status === 'closed' ? 'ok' : c.status === 'queued' ? 'warn' : { urgent: 'err', priority: 'warn', routine: '' }[urgency(c)];

/* live "volunteer on the way" tracker. ponytail: simulated at 1 m/s from the moment of assignment; real GPS comes later */
const TRACK_FROM = 900;
const trackDist = c => Math.max(30, Math.round(TRACK_FROM - (Date.now() - (c.events.find(e => e.s === 'assigned')?.t || Date.now())) / 1000));
const trackLabel = d => d < 50 ? t('Arriving now') : t('{n} m away').replace('{n}', d);
function tracker(c) {
  const d = trackDist(c);
  return `<div class="track" id="track" style="--f:${(1 - d / TRACK_FROM).toFixed(3)}" role="status">
    <div class="rc-row"><b>${esc(helperName(c))} ${t('is on the way')}</b><span id="track-d">${trackLabel(d)}</span></div>
    <div class="track-bar" aria-hidden="true"><span class="track-fill"></span><span class="track-me">${ic('user')}</span><span class="track-pin">${em('pin')}</span></div>
    <small>${esc(c.landmark)}</small></div>`;
}
function trackTick(c) {
  const el = $('#track');
  if (!el) return clearInterval(timer);
  const d = trackDist(c);
  el.style.setProperty('--f', (1 - d / TRACK_FROM).toFixed(3));
  $('#track-d').textContent = trackLabel(d);
}

/* photos: downscaled on the phone before they're stored */
function shrink(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 720 / Math.max(img.width, img.height)), cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(img.src);
      res(cv.toDataURL('image/jpeg', .72));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}
const photoBlock = d => d.photo
  ? `<div class="ph-prev"><img src="${d.photo}" alt="${t('Attached photo')}">${btn(t('Remove photo'), 'data-act="removePhoto"', { v: 'text', icon: 'x' })}</div>`
  : `<label class="btn tonal ph-add">${ic('camera')}<span>${t('Add a photo')}</span><input type="file" accept="image/*" id="f-photo" class="sr"></label>`;
const scopeShort = c => c.zone !== me().zone ? t('Outside your zone') : t(needs(c) === 'medical' ? 'Needs medical scope' : 'Coordinator only');

/* ---------- navigation ---------- */
const cur = () => S.stack[S.stack.length - 1];
function go(n, p = {}) { S.stack.push({ n, p }); show('fwd'); }
function reset(n, p = {}) { S.stack = [{ n, p }]; show('fade'); }
function back() { if (S.stack.length > 1) S.stack.pop(); show('back'); }
function goHome() { S.user ? reset(S.role === 'vol' ? 'vHome' : 'home') : reset('lang'); }
function show(dir = '') {
  clearInterval(timer);
  closeSheet();
  const { n, p } = cur();
  if (['safety', 'details', 'review'].includes(n) && !S.draft) return reset('home');
  if (['vReg', 'vRegDone'].includes(n) && !S.reg) return reset('lang');
  save();
  document.documentElement.lang = S.lang === 'hi' ? 'hi' : 'en';
  app.innerHTML = (V[n] || V.lang)(p || {});
  // Every signed-in screen keeps the nav bar; the tab that opened this stack stays highlighted.
  if (S.user && !app.querySelector('.nav')) app.firstElementChild.insertAdjacentHTML('beforeend', nav(S.stack[0].n));
  if (S.user && S.offline) {
    const banner = `<div class="offline" role="status">${ic('wifioff')}<span>${t('You’re offline. Reports are saved on this phone.')}</span></div>`;
    const b = app.querySelector('.bar');
    b ? b.insertAdjacentHTML('afterend', banner) : app.firstElementChild.insertAdjacentHTML('afterbegin', banner);
  }
  if (dir && !reduced()) app.firstElementChild.classList.add('in-' + dir);
  if (n === 'voice') listen();
  if (n === 'request' && $('#track')) { const c = byId(p.id); timer = setInterval(() => trackTick(c), 1000); }
  if (n === 'thread') { const m = $('.msgs'); if (m) m.scrollTop = m.scrollHeight; }
  if (n === 'vMap') { const c = p.id && byId(p.id); fitMap(...(c ? c.xy : HERE[me().zone])); }
}

/* ---------- shared pieces ---------- */
const logo = () => `<button class="logo" data-act="home" aria-label="Saath home"><span class="logo-m"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/></svg></span><span>Saath</span></button>`;
function bar({ back: showBack = false, title = '' } = {}) {
  return `<header class="bar">
    ${showBack ? `<button class="icon-btn" data-act="back" aria-label="${t('Back')}">${ic('back')}</button>` : logo()}
    ${title ? `<span class="bar-title">${title}</span>` : ''}
    <div class="bar-end">
      <button class="icon-btn tonal" data-act="toggleLang" aria-label="${t('Switch language')}"><span class="lang-g">${S.lang === 'hi' ? 'EN' : 'हिं'}</span></button>
      <button class="icon-btn" data-act="toggleSound" aria-pressed="${!!S.sound}" aria-label="${t('Sounds')}">${ic(S.sound ? 'sound' : 'mute')}</button>
      <button class="btn outlined sm" data-act="proto">${t('Prototype')}</button>
    </div>
  </header>`;
}
function nav(active) {
  const items = S.role === 'vol'
    ? [['vHome', 'home', 'Today'], ['vCases', 'list', 'Cases'], ['chats', 'chat', 'Chats'], ['guides', 'book', 'Guides']]
    : [['home', 'home', 'Home'], ['requests', 'list', 'Requests'], ['guides', 'book', 'Guides']];
  return `<nav class="nav">${items.map(([s, i, l]) => `<button class="nav-i ${active === s ? 'on' : ''}" data-go="${s}" data-tab="1" ${active === s ? 'aria-current="page"' : ''}><span class="nav-ind">${ic(i)}</span><span>${t(l)}</span></button>`).join('')}</nav>`;
}
const steps = (n, labels = ['Safety', 'Details', 'Review']) => `<div class="progbar"><div class="pb" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i < n ? 'on' : i === n ? 'cur' : ''}"></i>`).join('')}</div><span>${t('Step')} ${n} / 3 · ${t(labels[n - 1])}</span></div>`;
const prog = c => { const n = step(c); return `<div class="prog" role="img" aria-label="${t('Step')} ${n} / 5">${STAGES.map((_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>`; };
function ring(f) {
  const r = 70, C = 2 * Math.PI * r;
  return `<svg class="ring-svg" viewBox="0 0 160 160" aria-hidden="true"><circle class="ring-track" cx="80" cy="80" r="${r}"/><circle class="ring-fill" cx="80" cy="80" r="${r}" stroke-dasharray="${(C * f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 80 80)"/></svg>`;
}
function timeline(c) {
  const n = step(c);
  const rows = STAGES.map((s, i) => {
    const e = c.events.find(x => x.s === s), done = i < n, next = i === n;
    const label = s === 'closed' && c.outcome === 'referred' ? 'Referred onward' : STAGE[s];
    let sub = done && e ? ago(e.t) : next ? t(c.status === 'queued' ? 'Sends when you’re back online' : NEXT[s]) : '';
    if (done && s === 'assigned' && helperName(c)) sub += ' · ' + esc(helperName(c));
    return `<li class="${done ? 'done' : next ? 'next' : ''}"><span class="tl-dot">${done ? ic('check') : ''}</span><span><b>${t(label)}</b>${sub ? `<small>${sub}</small>` : ''}</span></li>`;
  }).join('');
  const notes = c.events.filter(e => e.s === 'note').map(e => `<p class="tl-note">${ic('info')}<span>${esc(t(e.text))} · ${ago(e.t)}</span></p>`).join('');
  return `<ol class="tl">${rows}</ol>${notes}`;
}
const draftCard = () => `<div class="card draft"><div><p class="tile-t">${t('Unfinished report')}</p><p class="fine">${t('Saved on this phone · not sent')}</p></div><div class="row">${btn(t('Discard'), 'data-act="discardDraft"', { v: 'text' })}${btn(t('Resume'), 'data-act="resumeDraft"', { v: 'tonal sm' })}</div></div>`;
const reqCard = c => `<button class="rcard t-${tint(c)}" data-go="request" data-p="${c.id}">
  <span class="rc-row"><span class="mono">${c.id}</span>${c.example ? `<span class="badge u-ex">${t('Example')}</span>` : badge(c)}</span>
  <span class="rc-title">${helpText(c)}</span>
  <span class="rc-meta">${em('pin')}${esc(c.landmark)}</span>
  ${prog(c)}
  <span class="rc-row fine"><span>${statusText(c)}</span><span>${ago(lastT(c))}</span></span>
</button>`;
function caseCard(c) {
  const state = c.assignedTo
    ? (c.assignedTo === S.user.vid ? t('You’re on it') : `${t('Taken by')} ${VOLS[c.assignedTo].name}`)
    : canTake(c) ? `<span class="ok">${ic('check')}${t('You can take this')}</span>` : scopeShort(c);
  return `<button class="rcard t-${tint(c)}" data-go="case" data-p="${c.id}">
    <span class="rc-row"><span class="mono">${c.id} · ${t('Zone')} ${c.zone}</span>${badge(c)}</span>
    <span class="rc-title">${helpText(c)}</span>
    <span class="rc-meta">${em('pin')}${esc(c.landmark)}</span>
    <span class="rc-row fine"><span>${state}</span><span>${ago(lastT(c))}</span></span>
  </button>`;
}
// ponytail: fixed "you are here" per zone; swap for the phone's location when there is a real backend
const HERE = { A: [150, 34], B: [274, 44] };
const M_PER_UNIT = 6; // map units → metres, so the illustrative map gives plausible walking distances
// opt.full: pins select (not navigate) and nothing is dimmed; opt.only filters the pins
function mapSvg(v, focus, opt = {}) {
  const pins = S.cases.filter(c => live(c) && c.status !== 'closed' && (!opt.only || opt.only(c))).map(c => {
    const f = focus && c.id === focus.id;
    const act = opt.full ? `data-act="pickPin" data-p="${c.id}" role="button" tabindex="0"` : f ? '' : `data-go="case" data-p="${c.id}" role="button" tabindex="0"`;
    const dim = !f && (c.zone !== v.zone || (focus && !opt.full));
    return `<g class="pin p-${urgency(c)} ${f ? 'focus' : dim ? 'far' : ''}" ${act} aria-label="${c.id} · ${helpText(c)}">${f ? `<circle class="pin-halo" cx="${c.xy[0]}" cy="${c.xy[1]}" r="18"/>` : ''}<circle cx="${c.xy[0]}" cy="${c.xy[1]}" r="${f ? 11 : 9}"/><circle class="pin-c" cx="${c.xy[0]}" cy="${c.xy[1]}" r="${f ? 4 : 3}"/></g>`;
  }).join('');
  const [x1, y1] = HERE[v.zone];
  let route = focus ? `<path class="route" d="M${x1} ${y1}Q${x1} ${focus.xy[1]} ${focus.xy[0]} ${focus.xy[1]}"/>` : '';
  route += `<g class="you"><circle class="you-halo" cx="${x1}" cy="${y1}" r="14"/><circle cx="${x1}" cy="${y1}" r="7"/></g><text class="m-you" x="${x1 + 12}" y="${y1 + 4}">${t('You')}</text>`;
  return `<svg viewBox="0 0 320 170" role="img" aria-label="${t('Illustrative map of zones A and B')}">
    <rect class="z-a" x="0" y="0" width="170" height="170"/><rect class="z-b" x="170" y="0" width="150" height="170"/>
    <path class="road" d="M0 92H320M170 0V170M40 0L96 170M230 0C220 60 270 110 320 130"/>
    <text class="m-l" x="12" y="20">${t('Zone A · Shanti Nagar')}</text><text class="m-l" x="180" y="20">${t('Zone B · Lake Road')}</text>
    <text class="m-s" x="72" y="44">Shanti School</text><text class="m-s" x="10" y="150">Community library</text><text class="m-s" x="104" y="160">Ward care desk</text>
    ${route}${pins}</svg>`;
}
const legend = () => `<div class="legend"><span class="lg-urgent">${t('Urgent review')}</span><span class="lg-priority">${t('Priority review')}</span><span class="lg-routine">${t('Routine')}</span></div>`;
const map = (v, focus) => `<div class="card map">${mapSvg(v, focus)}
  <button class="icon-btn map-exp" data-go="vMap" ${focus ? `data-p="${focus.id}"` : ''} aria-label="${t('Full map')}">${ic('expand')}</button>
  ${legend()}<p class="fine">${t('Illustrative map, not for navigation')}</p></div>`;
const walk = (c, v) => {
  const [x1, y1] = HERE[v.zone], [x2, y2] = c.xy;
  const m = Math.round((Math.abs(x2 - x1) + Math.abs(y2 - y1)) * M_PER_UNIT / 10) * 10;
  return `${m} m · ${t('{n} min walk').replace('{n}', Math.max(1, Math.round(m / 80)))}`;
};
function caseMap(c, v) {
  return `<section class="stack case-map"><div class="sec-h"><h2 class="h2">${t('Where to go')}</h2><span class="badge u-routine">${walk(c, v)}</span></div>${map(v, c)}</section>`;
}

/* full-screen map: the same SVG, sized by zoom level inside a scrolling frame */
function fitMap(cx, cy) {
  const fm = $('#fm'), svg = fm?.querySelector('svg');
  if (!svg) return;
  const h = fm.clientHeight * (S.mapZ || 1), k = h / 170;
  svg.style.height = h + 'px'; svg.style.width = h * 320 / 170 + 'px';
  fm.scrollLeft = cx * k - fm.clientWidth / 2;
  fm.scrollTop = cy * k - fm.clientHeight / 2;
}
function mapCenter() {
  const fm = $('#fm'), k = fm.clientHeight * (S.mapZ || 1) / 170;
  return [(fm.scrollLeft + fm.clientWidth / 2) / k, (fm.scrollTop + fm.clientHeight / 2) / k];
}
function scopeBox(c) {
  const v = me();
  if (canTake(c)) return `<div class="scope yes">${em('check')}<p><b>${t('Within your scope')}</b><br>${t(v.skill)} · ${t('Zone')} ${v.zone}</p></div>`;
  const why = c.zone !== v.zone ? 'This case is outside your zone.'
    : needs(c) === 'medical' ? 'Needs a volunteer with medical training. The coordinator will find one.'
    : 'Protected referrals are handled by trained coordinators only.';
  return `<div class="scope no">${em(needs(c) === 'medical' ? 'stethoscope' : 'shield')}<p><b>${t('Not in your scope')}</b><br>${t(why)}</p></div>`;
}
const DD = { who: WHO, help: HELP };
const ddText = f => S.draft[f].map(k => t(DD[f][k])).join(', ') || `<span class="muted">${t('Select all that fit')}</span>`;
const tf = (id, label, { value = '', attrs = '', cls = '', area = false, support = '' } = {}) =>
  `<label class="tf ${cls}">${area ? `<textarea id="${id}" placeholder=" " ${attrs}>${esc(value)}</textarea>` : `<input id="${id}" placeholder=" " value="${esc(value)}" ${attrs}>`}<span class="lab">${label}</span></label>${support ? `<p class="support">${support}</p>` : ''}`;
const radioItem = (act, v, on, title, sub, lead) => `<button class="li" role="radio" aria-checked="${on}" data-act="${act}" data-v="${v}">${lead}<span class="li-t"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span><span class="radio"></span></button>`;

/* ---------- screens ---------- */
const V = {};

V.lang = () => {
  const L = S.lang || 'en';
  const opt = (v, a, b, g) => `<button class="lang-opt" role="radio" aria-checked="${L === v}" data-act="setLang" data-v="${v}"><span class="radio"></span><span class="glyph">${g}</span><b>${a}</b><small>${b}</small></button>`;
  return `<div class="scr onboard"><div class="ob-bg" aria-hidden="true"><span></span><span></span><span></span></div><main class="body center">
    ${orb('wave', 'calm', 168)}
    <p class="greet" aria-label="Hello, नमस्ते"><span aria-hidden="true">Hello</span><span lang="hi" aria-hidden="true">नमस्ते</span></p>
    <h1 class="h1">${t('Care starts with understanding.')}</h1>
    <p class="lede">${t('Choose the language you’re comfortable with. You can change it anytime.')}</p>
    <div class="lang-grid" role="radiogroup" aria-label="Language">${opt('en', 'English', 'अंग्रेज़ी', 'Aa')}${opt('hi', 'हिंदी', 'Hindi', 'अ')}</div>
  </main><footer class="foot">${btn(t('Continue'), 'data-act="langNext"', { icon: 'arrow', trail: true })}<p class="fine center">${t('Welcome to Saath')}</p></footer></div>`;
};

V.role = () => `<div class="scr">${bar({ back: true })}<main class="body">
  <h1 class="h1">${t('How are you joining?')}</h1>
  <p class="lede">${t('Two ways in. One care network for the ward.')}</p>
  <div class="grid2">
    <button class="hero role-card" data-go="civLogin">${em('speech')}<span class="rc-t">${t('Report a need')}</span><small>${t('For someone nearby, or yourself')}</small><span class="rc-go">${ic('arrow')}</span></button>
    <button class="hero lav role-card" data-go="volLogin">${em(VOL_E)}<span class="rc-t">${t('I’m a volunteer')}</span><small>${t('Sign in with your volunteer ID')}</small><span class="rc-go">${ic('arrow')}</span></button>
  </div>
  <div class="note">${em('shield')}<p>${t('You only share what you know. Nothing is sent until you review it.')}</p></div>
</main></div>`;

V.civLogin = p => {
  const otp = p.step === 'otp', bad = p.err ? 'aria-invalid="true" aria-describedby="err"' : '';
  return `<div class="scr">${bar({ back: true })}<main class="body">
    <span class="emo-box lg">${em(otp ? 'lock' : 'phone')}</span>
    <div><p class="eyebrow">${t('Neighbour sign-in')}</p><h1 class="h1">${otp ? t('Enter the 6-digit code') : t('Your phone number')}</h1></div>
    <p class="lede">${otp ? `${t('We sent it to')} +91 ${esc(p.phone)}` : t('We use it to send you updates on the care you asked for.')}</p>
    <form id="civForm" class="stack" novalidate>
      ${otp
        ? `<label class="tf ${p.err ? 'bad' : ''}"><input id="otp" class="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-label="${t('Code')}" ${bad}></label>
           <button type="button" class="hint-chip" data-act="fill" data-target="otp" data-v="123456">${em('testtube')}${t('Prototype code')}: <b class="mono">123456</b></button>`
        : `<label class="tf pre ${p.err ? 'bad' : ''}"><span class="prefix">+91</span><input id="phone" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder=" " value="${esc(p.phone || '90000 00001')}" ${bad}><span class="lab">${t('Mobile number')}</span></label>
           <p class="support">${t('Prototype: no SMS is sent.')}</p>`}
      ${p.err ? `<p class="err" id="err" role="alert">${t(p.err)}</p>` : ''}
      <button class="btn filled" type="submit"><span>${otp ? t('Verify') : t('Send code')}</span>${ic('arrow')}</button>
    </form>
    ${btn(otp ? t('Change number') : t('Can’t get a code? Report without verifying'), `data-act="${otp ? 'changePhone' : 'unverified'}"`, { v: 'text' })}
  </main></div>`;
};

V.volLogin = p => `<div class="scr">${bar({ back: true })}<main class="body">
  <span class="emo-box lg">${em('idcard')}</span>
  <div><p class="eyebrow">${t('Volunteer sign-in')}</p><h1 class="h1">${t('Your zone. Your team.')}</h1></div>
  <p class="lede">${t('Use the ID your ward coordinator gave you. Your skills decide which tasks you can take.')}</p>
  <form id="volForm" class="stack" novalidate>
    ${tf('vid', t('Volunteer ID'), { value: p.vid || '', cls: p.err ? 'bad' : '', attrs: 'autocapitalize="characters" autocomplete="username"' })}
    ${tf('vcode', t('Access code'), { cls: p.err ? 'bad' : '', attrs: 'type="password" inputmode="numeric" autocomplete="current-password"' })}
    ${p.err ? `<p class="err" role="alert">${t(p.err)}</p>` : ''}
    <button class="btn filled" type="submit"><span>${t('Enter workspace')}</span>${ic('arrow')}</button>
  </form>
  ${btn(S.reg?.status === 'pending' ? t('Check your application') : t('New here? Register as a volunteer'), `data-act="startReg"`, { v: 'tonal', icon: 'arrow', trail: true })}
  <section class="stack"><p class="lbl">${t('Prototype volunteers')} · ${t('code')} <b class="mono">2468</b></p>
    <div class="list">${Object.entries(VOLS).map(([id, v]) => `<button class="li" data-act="pickVol" data-v="${id}"><span class="avatar">${v.name[0]}</span><span class="li-t"><b>${v.name}</b><small>${t('Zone')} ${v.zone} · ${t(v.skill)}</small></span><span class="mono">${id.slice(6)}</span></button>`).join('')}</div>
  </section>
</main></div>`;

const REG_STEPS = ['About you', 'How you can help', 'Verification'];
const regChips = (field, opts) => `<div class="chips">${Object.entries(opts).map(([k, l]) =>
  `<button type="button" class="chip" aria-pressed="${S.reg[field] === k}" data-act="chip" data-obj="reg" data-field="${field}" data-v="${k}">${ic('check', 'ck')}<span>${t(l)}</span></button>`).join('')}</div>`;
const regGrp = (key, label, inner, E, hint = '') => `<fieldset class="grp ${E.includes(key) ? 'bad' : ''}" id="g-${key}"><legend class="lbl">${t(label)}</legend>${hint ? `<p class="hint">${t(hint)}</p>` : ''}${inner}${E.includes(key) ? `<p class="err">${t('Please answer this.')}</p>` : ''}</fieldset>`;

V.vReg = p => {
  const r = S.reg, s = p.s || 1, E = p.errs || [];
  const head = [['A helping hand.', 'Starting with you.'], ['How can you help?', ''], ['Let’s build trust.', '']][s - 1];
  let inner = '';
  if (s === 1) inner = `<p class="lede">${t('Just the basics. Your details stay with the ward coordinator.')}</p>
    ${regGrp('name', 'Your name', tf('r-name', t('Full name'), { value: r.name, attrs: 'data-obj="reg" data-field="name" autocomplete="name"', cls: E.includes('name') ? 'bad' : '' }), E)}
    ${regGrp('phone', 'Mobile number', `<label class="tf pre ${E.includes('phone') ? 'bad' : ''}"><span class="prefix">+91</span><input id="r-phone" type="tel" inputmode="numeric" placeholder=" " autocomplete="tel-national" data-obj="reg" data-field="phone" value="${esc(r.phone)}"><span class="lab">${t('Mobile number')}</span></label><p class="support">${t('Prototype: use any 10 digits. No SMS is sent.')}</p>`, E)}
    ${regGrp('zone', 'Where will you help?', regChips('zone', { A: 'Zone A · Shanti Nagar', B: 'Zone B · Lake Road' }), E)}`;
  if (s === 2) inner = `<p class="lede">${t('Choose what you’re comfortable doing. You can change this later.')}</p>
    ${regGrp('skills', 'I can help with', `<div class="choices">${Object.entries(SKILLS).map(([k, [l, e]]) =>
      `<button type="button" class="choice" aria-pressed="${r.skills.includes(k)}" data-act="chip" data-obj="reg" data-field="skills" data-v="${k}" data-multi="1">${em(e)}<span>${t(l)}</span><span class="tick">${ic('check')}</span></button>`).join('')}</div>`, E, 'Choose all that fit.')}
    <div class="note">${em('shield')}<p>${t('Medical support and child protection need an extra qualification check before you can take those tasks.')}</p></div>
    ${regGrp('avail', 'How often can you help?', regChips('avail', AVAIL), E)}`;
  if (s === 3) inner = `<p class="lede">${t('Your identity is checked before you can accept tasks.')}</p>
    ${regGrp('doc', 'Identity document', `<label class="tf sel ${E.includes('doc') ? 'bad' : ''}"><select id="r-doc" data-obj="reg" data-field="doc"><option value="">${t('Choose a sample document')}</option>${Object.entries(DOCS).map(([k, l]) => `<option value="${k}" ${r.doc === k ? 'selected' : ''}>${t(l)}</option>`).join('')}</select><span class="lab">${t('Document')}</span></label><p class="support">${t('Prototype documents only. Please don’t upload a real ID.')}</p>`, E)}
    ${regGrp('agree', 'Code of conduct', `<label class="check"><input type="checkbox" id="r-agree" data-obj="reg" data-field="agree" ${r.agree ? 'checked' : ''}><span>${t('I’ll respect people’s privacy, only take tasks I’m trained for, and follow the coordinator’s guidance.')}</span></label>`, E)}`;
  return `<div class="scr">${bar({ back: true })}${steps(s, REG_STEPS)}<main class="body form">
    <div><p class="eyebrow">${t('Volunteer registration')}</p><h1 class="h1">${t(head[0])}${head[1] ? `<br>${t(head[1])}` : ''}</h1></div>
    ${inner}
  </main><footer class="foot">${btn(s === 3 ? t('Send for verification') : t('Continue'), 'data-act="regNext"', { icon: s === 3 ? 'check' : 'arrow', trail: s !== 3 })}</footer></div>`;
};

V.vRegDone = () => {
  const r = S.reg;
  const rows = [['Application received', true], ['ID check', false], ['Call with the ward coordinator', false], ['Short safety training', false], ['Volunteer ID issued', false]];
  return `<div class="scr">${bar({ back: true })}<main class="body">
    <div class="hero lav done">${orb('idcard', 'calm', 120)}<p class="eyebrow">${t('Application sent')}</p><h1 class="h1">${t('Thanks')}, ${esc(r.name.split(' ')[0])}.</h1><p>${t('The ward coordinator usually replies within 2 days. We’ll send your volunteer ID to')} +91 ${esc(r.phone)}.</p></div>
    <section class="card"><h2 class="h2">${t('What happens next')}</h2><ol class="tl">${rows.map(([l, d], i) => `<li class="${d ? 'done' : i === 1 ? 'next' : ''}"><span class="tl-dot">${d ? ic('check') : ''}</span><span><b>${t(l)}</b></span></li>`).join('')}</ol></section>
    <section class="card"><h2 class="h2">${t('You applied for')}</h2><p>${r.skills.map(k => `<span class="mini">${em(SKILLS[k][1])}${t(SKILLS[k][0])}</span>`).join('')}</p><p class="fine">${t('Zone')} ${r.zone} · ${ZONES[r.zone]} · ${t(AVAIL[r.avail])}</p></section>
  </main><footer class="foot">${btn(t('Prototype: approve now'), 'data-act="regApprove"', { v: 'tonal', icon: 'check' })}</footer></div>`;
};

V.home = () => {
  const latest = S.cases.find(c => c.mine);
  return `<div class="scr">${bar()}<main class="body">
    <div><p class="eyebrow">${t('Kanpur · Ward 12')}</p><h1 class="h1">${t('Who needs care today?')}</h1></div>
    <button class="hero voice" data-go="voice">
      <span class="tag">${S.lang === 'hi' ? 'हिंदी' : 'English'} · ${t('speak freely')}</span>
      ${orb('mic')}
      <span class="voice-t">${t('Tap to tell us')}</span>
      <span class="voice-s">${t('Say what you saw. We turn it into a report you can check before sending.')}</span>
    </button>
    <div class="grid2">
      <button class="tile" data-act="startReport">${em('memo')}<span class="tile-t">${t('Type it instead')}</span><small>${t('Three short steps')}</small></button>
      <button class="tile err" data-go="guide" data-p="danger">${em('warning')}<span class="tile-t">${t('Someone in danger?')}</span><small>${t('Call 112 first')}</small></button>
    </div>
    ${S.draft ? draftCard() : ''}
    <section class="stack">
      <div class="sec-h"><h2 class="h2">${t('Your requests')}</h2>${btn(t('See all'), 'data-go="requests"', { v: 'text' })}</div>
      ${latest ? reqCard(latest) : `<p class="fine">${t('Requests you send will show up here.')}</p>`}
    </section>
    ${S.user?.verified === false ? `<p class="fine">${t('Updates need a verified number. You can still report.')}</p>` : ''}
  </main>${nav('home')}</div>`;
};

V.voice = () => `<div class="scr">
  ${bar({ back: true })}
  <main class="body center">
    <h1 class="h2 center">${t('Tell us what’s happening')}</h1>
    ${orb('mic', 'live', 190).replace('class="liquid live"', 'class="liquid live" id="orb"')}
    <p class="voice-status" id="vstatus" aria-live="polite">${t('Listening…')}</p>
    <p class="transcript" id="transcript"></p>
    <p class="fine">${t('Prototype: a sample recording plays. Your microphone is not used.')}</p>
  </main>
  <footer class="foot"><div id="vdone" hidden>${btn(t('Check the report'), 'data-act="voiceDone"', { icon: 'arrow', trail: true })}</div></footer>
</div>`;

function listen() {
  const words = t(SAMPLE).split(' '), o = $('#orb');
  let i = 0;
  const tick = () => {
    $('#transcript').textContent = words.slice(0, ++i).join(' ');
    o.style.setProperty('--amp', (0.93 + Math.random() * 0.17).toFixed(3));
    if (i < words.length) return;
    clearInterval(timer);
    o.style.setProperty('--amp', 1);
    o.classList.replace('live', 'calm');
    $('#vstatus').textContent = t('Got it. Next, a quick safety check.');
    $('#vdone').hidden = false;
    sfx('notify');
  };
  if (reduced()) { i = words.length - 1; tick(); } else timer = setInterval(tick, 110);
}

V.safety = () => {
  const d = S.draft;
  const o = (v, e, a, b) => radioItem('safety', v, d.safety === v, t(a), t(b), `<span class="emo-box">${em(e)}</span>`);
  return `<div class="scr">${bar({ back: true })}${steps(1)}<main class="body">
    <h1 class="h1">${t('Is anyone in immediate danger?')}</h1>
    <p class="lede">${t('Choose what you know right now. This doesn’t send an alert.')}</p>
    <div class="list" role="radiogroup">
      ${o('yes', 'siren', 'Yes, there’s danger now', 'Injury, violence, fire, or someone can’t breathe')}
      ${o('no', 'check', 'No immediate danger', 'They need help, but not this minute')}
      ${o('unsure', 'thinking', 'I’m not sure', 'We’ll treat it as urgent')}
    </div>
    ${d.safety === 'yes' ? `<div class="hero err sos" role="alert">${em('telephone')}<p class="tile-t">${t('Call 112 now')}</p><p>${t('Saath does not send emergency help. Call the national emergency number, then come back to report so care can continue.')}</p><p class="num">112</p><a class="btn danger" href="tel:112">${ic('phone')}<span>${t('Call 112')}</span></a></div>` : ''}
  </main><footer class="foot">${btn(t('Continue'), `data-go="details" ${d.safety ? '' : 'disabled'}`, { icon: 'arrow', trail: true })}</footer></div>`;
};

V.details = p => {
  const d = S.draft, E = p.errs || [];
  const choices = (field, opts, emo) => `<div class="choices">${Object.entries(opts).map(([k, l]) =>
    `<button type="button" class="choice" aria-pressed="${d[field].includes(k)}" data-act="chip" data-field="${field}" data-v="${k}" data-multi="1">${em(emo[k])}<span>${t(l)}</span><span class="tick">${ic('check')}</span></button>`).join('')}</div>`;
  const dropdown = (field, opts, emo) => `<details class="dd"><summary class="dd-sum" id="dd-${field}">${ddText(field)}</summary><div class="dd-menu">${Object.entries(opts).map(([k, l]) =>
    `<button type="button" class="dd-i" aria-pressed="${d[field].includes(k)}" data-act="chip" data-field="${field}" data-v="${k}" data-multi="1">${em(emo[k])}<span>${t(l)}</span><span class="cb">${ic('check')}</span></button>`).join('')}</div></details>`;
  const chips = (field, opts, cls = 'chip', wrap = 'chips') => `<div class="${wrap}">${Object.entries(opts).map(([k, l]) =>
    `<button type="button" class="${cls}" aria-pressed="${d[field] === k}" data-act="chip" data-field="${field}" data-v="${k}">${ic('check', 'ck')}<span>${t(l)}</span></button>`).join('')}</div>`;
  const grp = (key, label, inner, { hint = '', count = '' } = {}) => `<fieldset class="grp ${E.includes(key) ? 'bad' : ''}" id="g-${key}"><legend class="lbl">${t(label)}${count !== '' ? `<span class="count" id="c-${key}">${count || ''}</span>` : ''}</legend>${hint ? `<p class="hint">${t(hint)}</p>` : ''}${inner}${E.includes(key) ? `<p class="err">${t('Please answer this.')}</p>` : ''}</fieldset>`;
  return `<div class="scr">${bar({ back: true })}${steps(2)}<main class="body form">
    <h1 class="h1">${t('What do you know?')}</h1>
    ${d.fromVoice ? `<div class="note">${em('mic')}<p>${t('Filled in from what you said. Check each part and fix anything we got wrong.')}</p></div>` : `<p class="lede">${t('Share only what you know. Skip anything you’re unsure of.')}</p>`}
    ${grp('who', 'Who needs support?', dropdown('who', WHO, WHO_E), { count: d.who.length })}
    ${grp('help', 'What help is needed?', choices('help', HELP, HELP_E), { count: d.help.length })}
    ${grp('where', 'Where can a volunteer find them?', `<div>${tf('f-landmark', t('Landmark'), { value: d.landmark, attrs: 'data-field="landmark"', cls: E.includes('where') && !d.landmark ? 'bad' : '', support: `${t('A landmark people know, e.g. near the temple')}. ${t('We don’t detect your location.')}` })}</div>${chips('zone', { A: 'Zone A · Shanti Nagar', B: 'Zone B · Lake Road' })}`)}
    ${grp('photo', 'Photo', `<div class="ph">${photoBlock(d)}</div>`, { hint: 'Optional. Helps the volunteer find and recognise them. Ask before photographing someone.' })}
    ${grp('about', 'About them', `<div class="grid2">${tf('f-name', t('Name'), { value: d.name, attrs: 'data-field="name" autocomplete="off"' })}${tf('f-age', t('Age'), { value: d.age, attrs: 'data-field="age" inputmode="numeric"' })}</div>${chips('gender', GENDER)}`, { hint: 'Optional. Leave blank if you don’t know.' })}
    ${grp('rel', 'How do you know them?', `<label class="tf sel"><select id="f-rel" data-field="rel"><option value="">${t('Choose one')}</option>${Object.entries(REL).map(([k, l]) => `<option value="${k}" ${d.rel === k ? 'selected' : ''}>${t(l)}</option>`).join('')}</select><span class="lab">${t('Your relationship')}</span></label>${chips('know', KNOW)}`)}
    ${grp('consent', 'Did they agree to share their details?', chips('consent', CONSENT), { hint: 'If they didn’t agree, we share only the need and the place.' })}
    ${grp('notes', 'Anything else?', tf('f-notes', t('Notes'), { value: d.notes, area: true, attrs: 'data-field="notes" rows="4"', support: t('What you saw or heard. Not a diagnosis.') }))}
  </main><footer class="foot two">${btn(t('Save for later'), 'data-act="saveDraft"', { v: 'tonal' })}${btn(t('Review'), 'data-act="toReview"', { icon: 'arrow', trail: true })}</footer></div>`;
};

V.review = () => {
  const d = S.draft;
  const row = (k, v) => v ? `<div class="kv"><dt>${t(k)}</dt><dd>${v}</dd></div>` : '';
  const about = [d.name && esc(d.name), d.age && `${esc(d.age)} ${t('yrs')}`, d.gender && t(GENDER[d.gender])].filter(Boolean).join(' · ');
  return `<div class="scr">${bar({ back: true })}${steps(3)}<main class="body">
    <h1 class="h1">${t('Check before you send')}</h1>
    <div class="card"><div class="rc-row">${badge(d)}${btn(t('Edit'), 'data-act="back"', { v: 'text', icon: 'pen' })}</div>
      <dl class="kvs">
        ${row('Who', d.who.map(w => `<span class="mini">${em(WHO_E[w])}${t(WHO[w])}</span>`).join(''))}
        ${row('Help', d.help.map(h => `<span class="mini">${em(HELP_E[h])}${t(HELP[h])}</span>`).join(''))}
        ${row('Where', `<span class="mini">${em('pin')}${esc(d.landmark)} · ${t('Zone')} ${d.zone}</span>`)}
        ${row('About them', about)}
        ${row('You are their', d.rel && t(REL[d.rel]) + (d.know ? ' · ' + t(KNOW[d.know]) : ''))}
        ${row('Consent', t(CONSENT[d.consent]))}
        ${row('Notes', esc(d.notes))}
        ${row('Photo', d.photo && `<img class="thumb" src="${d.photo}" alt="${t('Attached photo')}">`)}
      </dl></div>
    <div class="note">${em('shield')}<p>${d.consent === 'agreed' ? t('The ward coordinator and the volunteer who takes this will see these details.') : t('Without consent, volunteers see only the need and the place. Name and age stay with the coordinator.')}</p></div>
    <p class="fine">${t('A report asks for care. It does not send emergency help. In danger, call 112.')}</p>
  </main><footer class="foot">${btn(t('Send report'), 'data-act="submit"', { icon: 'check' })}</footer></div>`;
};

V.sent = p => {
  const c = byId(p.id), q = c.status === 'queued';
  return `<div class="scr">${bar()}<main class="body">
    ${q
      ? `<div class="hero warn done">${orb('phone', 'calm', 120)}<p class="eyebrow">${t('Report saved')}</p><h1 class="h1">${t('It will upload as soon as you’re back online.')}</h1><p>${t('If you can, stay with the person until help arrives.')}</p><p class="mono big-id">${c.id}</p></div>`
      : `<div class="hero ok done">${orb('check', 'calm', 120)}<p class="eyebrow">${t('Report sent')}</p><h1 class="h1">${t('Thank you. A ward coordinator will look at it soon.')}</h1><p class="mono big-id">${c.id}</p></div>`}
    <section class="card"><h2 class="h2">${t('What happens next')}</h2>${timeline(c)}</section>
  </main><footer class="foot">${btn(t('Track this request'), `data-act="track" data-p="${c.id}"`, { icon: 'arrow', trail: true })}${btn(t('Back to home'), 'data-act="home"', { v: 'text' })}</footer></div>`;
};

V.requests = () => `<div class="scr">${bar()}<main class="body has-fab">
  <div><p class="eyebrow">${t('Your requests')}</p><h1 class="h1">${t('Every report, every step.')}</h1></div>
  ${S.draft ? draftCard() : ''}
  <div class="stack">${S.cases.filter(c => c.mine).map(reqCard).join('')}</div>
</main><button class="fab" data-act="startReport">${ic('pen')}<span>${t('Report another need')}</span></button>${nav('requests')}</div>`;

V.request = p => {
  const c = byId(p.id), n = step(c);
  return `<div class="scr">${bar({ back: true })}<main class="body">
    <div class="hero ${heroFor(c)}">
      <div class="rc-row"><span class="mono">${c.id}</span><span class="tag">${c.example ? t('Example') : urgTag(c)}</span></div>
      <div class="hero-ring">${ring(n / 5)}<div class="ring-c"><span class="big-n">${n}<small>/5</small></span><span>${statusText(c)}</span></div></div>
      <p class="hero-t">${helpText(c)}</p>
      <p class="rc-meta">${em('pin')}${esc(c.landmark)}</p>
    </div>
    ${c.status === 'assigned' ? tracker(c) : ''}
    <section class="card"><h2 class="h2">${t('Progress')}</h2>${timeline(c)}</section>
    <section class="card"><h2 class="h2">${t('What you told us')}</h2><p>${esc(t(c.summary))}</p>${c.photo ? `<img class="photo" src="${c.photo}" alt="${t('Attached photo')}">` : ''}</section>
  </main></div>`;
};

V.guides = () => `<div class="scr">${bar()}<main class="body">
  <div><p class="eyebrow">${t('Guides')}</p><h1 class="h1">${t('A little guidance helps.')}</h1></div>
  <p class="lede">${t('Short, practical notes. Not medical advice.')}</p>
  <div class="list">${Object.entries(GUIDES).map(([k, g]) => `<button class="li" data-go="guide" data-p="${k}"><span class="emo-box">${em(GUIDE_LOOK[k][1])}</span><span class="li-t"><b>${t(g.t)}</b></span>${ic('chev', 'chev')}</button>`).join('')}</div>
</main>${nav('guides')}</div>`;

V.guide = p => {
  const k = GUIDES[p.id] ? p.id : 'danger', g = GUIDES[k], [look, e] = GUIDE_LOOK[k];
  return `<div class="scr">${bar({ back: true })}<main class="body">
    <div class="hero guide-hero ${look}">${em(e)}<h1 class="h1">${t(g.t)}</h1>${g.num ? `<p class="num">${g.num}</p><a class="btn ${look === 'err' ? 'danger' : 'filled'}" href="tel:${g.num}">${ic('phone')}<span>${t('Call')} ${g.num}</span></a>` : ''}</div>
    <ol class="steps-list">${g.body.map(b => `<li>${t(b)}</li>`).join('')}</ol>
  </main>${nav('guides')}</div>`;
};

V.vHome = () => {
  const v = me();
  const zone = S.cases.filter(c => live(c) && c.zone === v.zone && c.status !== 'closed');
  const can = zone.filter(c => isOpen(c) && canTake(c));
  const mine = S.cases.filter(c => c.assignedTo === S.user.vid && c.status !== 'closed');
  const ready = can.sort((a, b) => ORDER[urgency(a)] - ORDER[urgency(b)]).slice(0, 3);
  const st = vState(v), all = S.cases.filter(c => live(c) && c.zone === v.zone), team = TEAM[v.zone];
  const unseen = alerts(v).filter(x => !S.dismissed.includes(x.c.id)).length;
  return `<div class="scr vdash"><div class="vd-glow tone-${st.tone}" aria-hidden="true"><span></span><span></span></div>${bar()}<main class="body">
    <div class="vd-hero tone-${st.tone}" role="status">
      <p class="eyebrow">${t('Zone')} ${v.zone} · ${ZONES[v.zone]} · ${esc(v.name)}</p>
      <h1 class="vd-title">${t(st.title)}</h1>
      <p class="vd-sub">${t(st.sub)}</p>
      ${st.cta ? `<button class="vd-cta" ${st.cta[1]}>${t(st.cta[0])}</button>` : ''}
    </div>
    <div class="vd-sheet">
      <div class="grid2">
        <button class="btn outlined vd-alerts" data-act="alerts">${ic('bell')}<span>${t('Alerts')}</span>${unseen ? `<span class="count">${unseen}</span>` : ''}</button>
        ${btn(t('Report'), 'data-act="startReport"', { icon: 'plus' })}
      </div>
      ${mine.length ? `<section class="stack"><h2 class="h2">${t('Your tasks')}</h2>${mine.map(caseCard).join('')}</section>` : ''}
      <section class="stack"><h2 class="h2">${t('Overview')}</h2>
        <div class="grid2">
          <div class="stat"><span class="stat-l">${t('Volunteers on duty')}</span><span class="stat-row">${miniRing(team.on / team.all)}<span><span class="stat-n">${team.on}</span><small>${t('out of {n}').replace('{n}', team.all)}</small></span></span></div>
          <div class="stat"><span class="stat-l">${t('Open reports')}</span><span class="stat-row">${miniRing(all.length ? zone.length / all.length : 0)}<span><span class="stat-n">${zone.length}</span><small>${t('out of {n}').replace('{n}', all.length)}</small></span></span>${btn(t('Open'), 'data-go="vCases" data-f="zone"', { v: 'filled sm' })}</div>
        </div>
      </section>
      <section class="stack"><div class="sec-h"><h2 class="h2">${t('Live tracking')}</h2>${btn(t('All cases'), 'data-go="vCases" data-f="zone"', { v: 'text' })}</div>${map(v)}</section>
      <section class="stack"><h2 class="h2">${t('Ready for you')}</h2>
        ${ready.map(caseCard).join('') || `<div class="card">${em('sparkles')}<p>${t('Nothing needs you right now. New tasks will show up here.')}</p></div>`}
      </section>
    </div>
  </main>${nav('vHome')}</div>`;
};
// ponytail: duty roster is illustrative; the real number comes from the coordinator's shift sheet
const TEAM = { A: { on: 18, all: 26 }, B: { on: 11, all: 19 } };
const miniRing = f => { const C = 2 * Math.PI * 18; return `<svg class="mini-ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="18"/><circle class="mr-fill" cx="22" cy="22" r="18" stroke-dasharray="${(C * f).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 22 22)"/></svg>`; };
function alerts(v) {
  const zone = S.cases.filter(c => live(c) && c.zone === v.zone && c.status !== 'closed');
  const out = zone.filter(c => c.escalated).map(c => ({ c, kind: 'Escalated' }));
  zone.filter(c => c.status === 'received' && !c.escalated).forEach(c => out.push({ c, kind: 'New report nearby' }));
  return out.sort((x, y) => lastT(y.c) - lastT(x.c));
}
// Home headline, in priority order: urgent work, unseen reports, unread messages, all clear (Figma home variants)
function vState(v) {
  const zone = S.cases.filter(c => live(c) && c.zone === v.zone && c.status !== 'closed');
  const hot = zone.find(c => urgency(c) === 'urgent' && !c.assignedTo);
  if (hot) return { tone: 'err', title: 'Priority alert waiting', sub: 'An urgent case in your zone needs someone now.', cta: ['View details', `data-go="case" data-p="${hot.id}"`] };
  if (zone.some(c => c.status === 'received' && !S.dismissed.includes(c.id))) return { tone: 'warn', title: 'You have new alerts', sub: 'New reports came in near you.', cta: ['Go to alerts', 'data-act="alerts"'] };
  const unread = Object.values(S.chats).reduce((n, c) => n + c.unread, 0);
  if (unread) return { tone: 'blue', title: 'You have new messages', sub: t('{n} unread in your chats.').replace('{n}', unread), cta: ['Go to messages', 'data-go="chats" data-tab="1"'] };
  return { tone: 'ok', title: 'Awesome!', sub: 'Nothing new came up. You’re all sorted.' };
}

V.vMap = p => {
  const v = me(), f = p.f || 'all', sel = p.id ? byId(p.id) : null;
  const only = { all: null, can: c => isOpen(c) && canTake(c), urgent: c => urgency(c) === 'urgent' }[f];
  const chip = (k, l) => `<button type="button" class="chip" aria-pressed="${f === k}" data-act="mapFilter" data-v="${k}">${ic('check', 'ck')}<span>${t(l)}</span></button>`;
  const card = sel ? `<div class="fm-card t-${tint(sel)}" role="status">
      <div class="rc-row"><span class="mono">${sel.id} · ${t('Zone')} ${sel.zone}</span>${badge(sel)}</div>
      <b class="rc-title">${helpText(sel)}</b>
      <span class="rc-meta">${em('pin')}${esc(sel.landmark)}</span>
      <div class="rc-row"><span class="fine">${walk(sel, v)}</span>${btn(t('Open case'), `data-go="case" data-p="${sel.id}"`, { v: 'filled sm', icon: 'arrow', trail: true })}</div>
    </div>` : `<p class="fm-hint">${t('Tap a pin to see the case.')}</p>`;
  return `<div class="scr">${bar({ back: true, title: t('Map') })}
    <div class="fm-tools chips">${chip('all', 'All')}${chip('can', 'You can take')}${chip('urgent', 'Urgent')}</div>
    <div class="fm-wrap"><div class="fm" id="fm">${mapSvg(v, sel, { full: true, only })}</div>
      ${legend()}
      <div class="fm-zoom">
        <button class="icon-btn" data-act="zoom" data-v="1" aria-label="${t('Zoom in')}">${ic('plus')}</button>
        <button class="icon-btn" data-act="zoom" data-v="-1" aria-label="${t('Zoom out')}">${ic('minus')}</button>
        <button class="icon-btn" data-act="recenter" aria-label="${t('Back to me')}">${ic('locate')}</button>
      </div>
    </div>
    ${card}
  </div>`;
};

V.vCases = p => {
  const f = p.f || 'can', v = me();
  const list = S.cases.filter(live).filter(c => f === 'mine'
    ? c.assignedTo === S.user.vid || c.closedBy === S.user.vid
    : c.status !== 'closed' && (f === 'zone' ? c.zone === v.zone : isOpen(c) && canTake(c)));
  const seg = (k, l) => `<button class="seg-b" aria-pressed="${f === k}" data-act="filter" data-v="${k}">${ic('check', 'ck')}<span>${t(l)}</span></button>`;
  const empty = f === 'mine' ? 'You haven’t taken a task yet.' : 'Nothing here right now. New reports appear as neighbours send them.';
  return `<div class="scr">${bar()}<main class="body">
    <div><p class="eyebrow">${t('Cases')} · ${t('Zone')} ${v.zone}</p><h1 class="h1">${t('Where you can help')}</h1></div>
    <div class="seg">${seg('can', 'You can take')}${seg('zone', 'All in zone')}${seg('mine', 'Yours')}</div>
    <div class="stack">${list.map(caseCard).join('') || `<div class="card">${em('clipboard')}<p>${t(empty)}</p></div>`}</div>
    ${f === 'zone' ? `<section class="stack"><h2 class="h2">${t('Your neighbourhood')}</h2>${map(v)}</section>` : ''}
  </main>${nav('vCases')}</div>`;
};

V.case = p => {
  const c = byId(p.id), mine = c.assignedTo === S.user.vid;
  const about = c.consent === 'agreed' ? [c.name, c.age && `${c.age} ${t('yrs')}`, c.gender && t(GENDER[c.gender])].filter(Boolean).map(esc).join(' · ') : '';
  let action = '';
  if (c.status === 'closed') action = `<div class="scope yes">${em('check')}<p><b>${statusText(c)}</b></p></div>`;
  else if (mine) action = `${btn(t('Record the visit'), 'data-act="outcome"', { icon: 'check' })}${btn(t('I can’t do this after all'), 'data-act="release"', { v: 'text' })}`;
  else if (c.assignedTo) action = `<p class="fine center">${t('Taken by')} ${VOLS[c.assignedTo].name}</p>`;
  else if (canTake(c)) action = btn(t('Accept this task'), 'data-act="accept"', { icon: 'check' });
  if (c.status !== 'closed' && !c.escalated && c.zone === me().zone) action += btn(t('Escalate'), 'data-act="escalate"', { v: 'outlined warn-o', icon: 'up' });
  const photo = !c.photo ? '' : mine ? `<img class="photo" src="${c.photo}" alt="${t('Attached photo')}">` : `<p class="muted ph-lock">${ic('camera')}${t('Photo attached. You’ll see it once you accept this task.')}</p>`;
  return `<div class="scr">${bar({ back: true })}<main class="body">
    <div class="hero ${heroFor(c)}">
      <div class="rc-row"><span class="mono">${c.id} · ${t('Zone')} ${c.zone}</span><span class="tag">${urgTag(c)}</span></div>
      <div class="row">${c.help.map(h => em(HELP_E[h])).join('')}</div>
      <h1 class="h1">${helpText(c)}</h1>
      <p class="rc-meta">${em('pin')}${esc(c.landmark)}</p>
    </div>
    ${scopeBox(c)}
    ${c.zone === me().zone && c.status !== 'closed' ? caseMap(c, me()) : ''}
    <section class="card"><h2 class="h2">${t('What the reporter saw')}</h2><p>${esc(t(c.summary))}</p>${photo}
      <dl class="kvs">
        <div class="kv"><dt>${t('Who')}</dt><dd>${c.who.map(w => `<span class="mini">${em(WHO_E[w])}${t(WHO[w])}</span>`).join('')}</dd></div>
        <div class="kv"><dt>${t('About them')}</dt><dd>${about || `<span class="muted">${t('Not shared')} · ${t(CONSENT[c.consent] || 'Not asked')}</span>`}</dd></div>
        <div class="kv"><dt>${t('Reporter')}</dt><dd>${t(REL[c.rel] || 'Prefer not to say')}${c.know ? ' · ' + t(KNOW[c.know]) : ''}</dd></div>
      </dl></section>
    <section class="card"><h2 class="h2">${t('Progress')}</h2>${timeline(c)}</section>
  </main>${action ? `<footer class="foot">${action}</footer>` : ''}</div>`;
};

const chatTime = ts => new Date(ts).toDateString() === new Date().toDateString()
  ? new Date(ts).toLocaleTimeString(S.lang === 'hi' ? 'hi' : 'en-IN', { hour: '2-digit', minute: '2-digit' }) : ago(ts);
const chatAvatar = c => c.emoji ? `<span class="emo-box">${em(c.emoji)}</span>` : `<span class="avatar ${c.kind}">${esc(c.name[0])}</span>`;

V.chats = p => {
  const f = p.f || 'vol';
  const seg = (k, l) => `<button class="seg-b" aria-pressed="${f === k}" data-act="filter" data-v="${k}">${ic('check', 'ck')}<span>${t(l)}</span></button>`;
  const rows = Object.entries(S.chats).filter(([, c]) => c.kind === f).map(([id, c]) => {
    const last = c.msgs[c.msgs.length - 1];
    return `<button class="li chat-li" data-go="thread" data-p="${id}">${chatAvatar(c)}<span class="li-t"><b>${esc(c.name)}${c.members ? ` <small class="mono">· ${c.members}</small>` : ''}</b><small>${last.me ? t('You') + ': ' : c.kind === 'grp' ? esc(last.who) + ': ' : ''}${esc(last.text)}</small></span>
      <span class="chat-meta"><small>${chatTime(last.t)}</small>${c.unread ? `<span class="count">${c.unread}</span>` : ''}</span></button>`;
  }).join('');
  return `<div class="scr">${bar()}<main class="body">
    <div><p class="eyebrow">${t('Chats')} · ${t('Zone')} ${me().zone}</p><h1 class="h1">${t('Stay in touch')}</h1></div>
    <div class="seg">${seg('vol', 'Volunteers')}${seg('grp', 'Groups')}${seg('auth', 'Authorities')}</div>
    <div class="list">${rows}</div>
  </main>${nav('chats')}</div>`;
};

V.thread = p => {
  const c = S.chats[p.id];
  return `<div class="scr">${bar({ back: true, title: esc(c.name) })}<main class="body msgs">
    ${c.msgs.map(m => `<div class="msg ${m.me ? 'me' : ''}">${!m.me && c.kind === 'grp' ? `<b>${esc(m.who)}</b>` : ''}<span>${esc(m.text)}</span><small>${chatTime(m.t)}</small></div>`).join('')}
  </main><form class="composer" id="chatForm"><label class="tf"><input id="msg" placeholder=" " autocomplete="off"><span class="lab">${t('Message')}</span></label><button class="icon-btn send" type="submit" aria-label="${t('Send')}">${ic('send')}</button></form></div>`;
};

/* ---------- sheets & snackbar ---------- */
function sheet(html) {
  const w = $('#sheet');
  w.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><span class="grab"></span>${html}</div>`;
  w.hidden = false;
  w.querySelector('button, input, textarea')?.focus();
}
function closeSheet() { const w = $('#sheet'); w.hidden = true; w.innerHTML = ''; }
function toast(msg, snd = 'notify') {
  const el = $('#toast');
  el.textContent = msg; el.classList.add('on');
  sfx(snd);
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2800);
}
function protoSheet() {
  sheet(`<div class="sheet-head"><span class="emo-box lg">${em('testtube')}</span><div><p class="eyebrow">${t('Prototype')}</p><h2 class="h2">${t('This is a working prototype')}</h2></div></div>
    <ul class="plist"><li>${t('People, places and cases are made up.')}</li><li>${t('Nothing is sent anywhere. No SMS, no dispatch.')}</li><li>${t('Please don’t enter real personal or medical details.')}</li><li>${t('In a real emergency, call 112.')}</li></ul>
    <div class="seg">${['en', 'hi'].map(l => `<button class="seg-b" aria-pressed="${(S.lang || 'en') === l}" data-act="setLang" data-v="${l}">${ic('check', 'ck')}<span>${l === 'en' ? 'English' : 'हिंदी'}</span></button>`).join('')}</div>
    <div class="list"><button class="li" role="switch" aria-checked="${!!S.offline}" data-act="toggleOffline"><span class="emo-box">${em('phone')}</span><span class="li-t"><b>${t('Simulate no connection')}</b><small>${t('New reports are saved on this phone and sent when you switch this off.')}</small></span><span class="switch"></span></button></div>
    <div class="stack">
      ${S.user ? btn(t('Switch role'), 'data-act="signout"', { v: 'tonal' }) : ''}
      ${btn(t('Reset prototype data'), 'data-act="resetAll"', { v: 'outlined' })}
    </div>`);
}
function alertsSheet(list) {
  sheet(`<div class="sheet-head"><span class="emo-box lg">${em('warning')}</span><div><p class="eyebrow">${t('Alerts')}</p><h2 class="h2">${list.length ? t('{n} need your attention').replace('{n}', list.length) : t('No new alerts')}</h2></div></div>
    <div class="stack">${list.map(({ c, kind }) => `<div class="pop t-${tint(c)}"><span class="pop-img">${em(HELP_E[c.help[0]])}</span><div class="pop-t"><p class="eyebrow">${t(kind)}</p><b>${helpText(c)}</b><small>${esc(c.landmark)} · ${ago(lastT(c))}</small><div class="row">${btn(t('Locate'), `data-go="case" data-p="${c.id}"`, { v: 'filled sm', icon: 'arrow', trail: true })}</div></div></div>`).join('') || `<p class="fine">${t('You’ll see new reports and escalations here.')}</p>`}</div>`);
}
const ESC_WHY = { worse: ['Worse than reported', 'thinking'], medical: ['Needs medical help now', 'medical'], safety: ['Safety risk at the location', 'siren'], other: ['Something else', 'question'] };
let escPick = '';
function escalateSheet() {
  escPick = '';
  sheet(`<div class="sheet-head"><span class="emo-box lg">${em('warning')}</span><div><p class="eyebrow">${t('Escalate')}</p><h2 class="h2">${t('Send this to the ward coordinator now?')}</h2></div></div>
    <p class="fine">${t('The case becomes urgent and the coordinator is alerted. The reporter sees that it was escalated. In danger, call 112 first.')}</p>
    <div class="list" role="radiogroup">${Object.entries(ESC_WHY).map(([k, [a, e]]) => radioItem('pickEsc', k, false, t(a), '', `<span class="emo-box">${em(e)}</span>`)).join('')}</div>
    ${tf('esc-note', t('What should the coordinator know?'), { area: true, attrs: 'rows="2"' })}
    <p class="err" id="esc-err" hidden>${t('Choose a reason.')}</p>
    ${btn(t('Escalate to coordinator'), 'data-act="saveEscalate"', { v: 'danger', icon: 'up' })}`);
}
function outcomeSheet() {
  outcomePick = '';
  sheet(`<h2 class="h2">${t('How did the visit go?')}</h2>
    <div class="list" role="radiogroup">${Object.entries(OUT).map(([k, [a, b]]) => radioItem('pickOutcome', k, false, t(a), t(b), `<span class="emo-box">${em(OUT_E[k])}</span>`)).join('')}</div>
    ${tf('o-note', t('Next step for the coordinator'), { area: true, attrs: 'rows="3"', support: t('e.g. Needs rations again next Monday') })}
    <p class="err" id="o-err" hidden>${t('Choose how it went.')}</p>
    ${btn(t('Save and close'), 'data-act="saveOutcome"', { icon: 'check' })}`);
}

/* ---------- actions ---------- */
function signIn(user, role) { S.lang = S.lang || 'en'; S.user = user; S.role = role; reset(role === 'vol' ? 'vHome' : 'home'); }
function submitReport() {
  const d = S.draft, n = S.cases.filter(c => c.mine && !c.example).length;
  const c = {
    ...d, id: `ST-${2051 + n}`, mine: true,
    xy: d.zone === 'A' ? [40 + (n % 4) * 16, 120] : [282, 140 - (n % 4) * 12],
    summary: d.notes.trim() || helpText(d), status: S.offline ? 'queued' : 'received', verified: S.user?.verified !== false,
    events: [{ s: S.offline ? 'queued' : 'received', t: Date.now() }],
  };
  delete c.fromVoice; delete c.notes;
  S.cases.unshift(c);
  S.draft = null;
  S.stack = [{ n: S.role === 'vol' ? 'vHome' : 'home', p: {} }, { n: 'sent', p: { id: c.id } }];
  show('fwd');
}
function validate(d) {
  const e = [];
  if (!d.who.length) e.push('who');
  if (!d.help.length) e.push('help');
  if (!d.landmark.trim() || !d.zone) e.push('where');
  if (!d.consent) e.push('consent');
  return e;
}

// Sound per action; null = the action plays its own (or none). Anything unlisted gets a click.
const SND = {
  chip: el => el.classList.contains('choice') ? 'pop' : 'soft',
  setLang: 'soft', filter: 'soft', pickOutcome: 'soft', pickVol: 'soft', fill: 'soft',
  safety: el => el.dataset.v === 'yes' ? 'alert' : 'soft',
  proto: 'pop', outcome: 'pop', escalate: 'pop', pickEsc: 'soft', langNext: 'open', submit: null,
  toReview: null, saveOutcome: null, saveEscalate: null, toggleSound: null, toggleOffline: null, accept: null, unverified: null, saveDraft: null, removePhoto: 'soft', alerts: 'pop', pickPin: 'pop', mapFilter: 'soft', zoom: 'soft', recenter: 'soft', regNext: null, regApprove: null,
};

const ACT = {
  back, home: goHome, proto: protoSheet,
  setLang: el => { S.lang = el.dataset.v; show(); },
  toggleLang: () => { S.lang = S.lang === 'hi' ? 'en' : 'hi'; show(); },
  toggleSound: () => { S.sound = !S.sound; show(); sfx('soft'); },
  langNext: () => { S.lang = S.lang || 'en'; go('role'); },
  fill: el => { $('#' + el.dataset.target).value = el.dataset.v; },
  pickVol: el => { $('#vid').value = el.dataset.v; $('#vcode').value = '2468'; },
  changePhone: () => { cur().p = { phone: cur().p.phone }; show(); },
  unverified: () => { signIn({ verified: false }, 'civ'); toast(t('You can report now. Updates need a verified number.')); },
  signout: () => { S.user = null; S.role = null; S.stack = [{ n: 'lang', p: {} }, { n: 'role', p: {} }]; show('back'); },
  resetAll: () => { const { lang, sound } = S; S = seed(); Object.assign(S, { lang, sound }); show('fade'); },
  startReport: () => { S.draft = S.draft || blankDraft(); go('safety'); },
  resumeDraft: () => go(S.draft.safety ? 'details' : 'safety'),
  discardDraft: () => { S.draft = null; show(); },
  voiceDone: () => {
    S.draft = { ...blankDraft(), who: ['daily', 'alone'], help: ['food', 'medication', 'welfare'], landmark: t('Near the community library, Shanti Nagar'), zone: 'A', gender: 'man', rel: 'neighbour', know: 'spoke', notes: t(SAMPLE_NOTE), fromVoice: true };
    S.stack.pop();
    go('safety');
  },
  safety: el => { S.draft.safety = el.dataset.v; show(); },
  startReg: () => {
    if (S.reg?.status === 'pending') return go('vRegDone');
    S.reg = S.reg || blankReg(); go('vReg', { s: 1 });
  },
  regNext: () => {
    const r = S.reg, s = cur().p.s || 1, e = [];
    if (s === 1) { if (!r.name.trim()) e.push('name'); if (r.phone.replace(/\D/g, '').length !== 10) e.push('phone'); if (!r.zone) e.push('zone'); }
    if (s === 2) { if (!r.skills.length) e.push('skills'); if (!r.avail) e.push('avail'); }
    if (s === 3) { if (!r.doc) e.push('doc'); if (!r.agree) e.push('agree'); }
    if (e.length) { sfx('error'); cur().p = { s, errs: e }; show(); return $(`#g-${e[0]}`)?.scrollIntoView({ block: 'center' }); }
    if (s < 3) { sfx('click'); return go('vReg', { s: s + 1 }); }
    r.status = 'pending';
    S.stack = [{ n: 'lang', p: {} }, { n: 'role', p: {} }, { n: 'volLogin', p: {} }, { n: 'vRegDone', p: {} }];
    show('fwd'); sfx('complete');
  },
  regApprove: () => {
    const r = S.reg, id = `SAATH-V${200 + Object.keys(S.newVols || {}).length + 1}`;
    // ponytail: approval grants general tasks only; medical/child scopes still wait for the separate qualification check
    const v = { name: r.name.trim().split(' ')[0], zone: r.zone, scopes: ['general'], skill: 'General care' };
    S.newVols = { ...(S.newVols || {}), [id]: v };
    VOLS[id] = v;
    S.reg = null;
    signIn({ vid: id }, 'vol');
    toast(`${t('Approved. Your volunteer ID is')} ${id}`, 'complete');
  },
  chip: el => {
    const { field, v, multi } = el.dataset, d = el.dataset.obj === 'reg' ? S.reg : S.draft;
    if (multi) {
      d[field] = d[field].includes(v) ? d[field].filter(x => x !== v) : [...d[field], v];
      el.setAttribute('aria-pressed', d[field].includes(v));
      const c = $('#c-' + field);
      if (c) { c.textContent = d[field].length || ''; c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; }
      const s = $('#dd-' + field);
      if (s) s.innerHTML = ddText(field);
    } else {
      d[field] = d[field] === v ? '' : v;
      el.parentElement.querySelectorAll('[data-act="chip"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === d[field]));
    }
    const g = el.closest('.grp');
    g?.classList.remove('bad'); g?.querySelector(':scope > .err')?.remove();
    save();
  },
  saveDraft: () => { goHome(); toast(t('Saved on this phone. Resume it from home.')); },
  toReview: () => {
    const errs = validate(S.draft);
    if (!errs.length) { sfx('click'); return go('review'); }
    sfx('error');
    cur().p = { errs }; show();
    $(`#g-${errs[0]}`)?.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
  },
  submit: () => { sfx(S.offline ? 'notify' : 'complete'); submitReport(); },
  toggleOffline: () => {
    S.offline = !S.offline;
    const q = S.offline ? [] : S.cases.filter(c => c.status === 'queued');
    q.forEach(c => { c.status = 'received'; c.events.push({ s: 'received', t: Date.now() }); });
    show();
    if (q.length) toast(t(q.length === 1 ? '1 saved report sent.' : '{n} saved reports sent.').replace('{n}', q.length), 'complete');
    else toast(t(S.offline ? 'Offline mode on. Reports will be saved on this phone.' : 'Back online.'), 'soft');
  },
  removePhoto: () => { S.draft.photo = ''; save(); $('#g-photo .ph').innerHTML = photoBlock(S.draft); },
  escalate: escalateSheet,
  pickEsc: el => {
    escPick = el.dataset.v;
    el.parentElement.querySelectorAll('.li').forEach(o => o.setAttribute('aria-checked', o === el));
    $('#esc-err').hidden = true;
  },
  saveEscalate: () => {
    if (!escPick) { $('#esc-err').hidden = false; return sfx('error'); }
    const c = byId(cur().p.id), note = $('#esc-note').value.trim();
    c.escalated = true;
    c.events.push({ s: 'note', text: `${t('Escalated to the ward coordinator')}: ${t(ESC_WHY[escPick][0])}${note ? ' · ' + note : ''}`, t: Date.now() });
    show(); toast(t('Escalated. The coordinator has been alerted.'), 'alert');
  },
  track: el => {
    S.stack = S.role === 'vol' ? [{ n: 'vHome', p: {} }, { n: 'case', p: { id: el.dataset.p } }] : [{ n: 'home', p: {} }, { n: 'request', p: { id: el.dataset.p } }];
    show('fwd');
  },
  pickPin: el => { cur().p = { ...cur().p, id: el.dataset.p }; show(); },
  mapFilter: el => { cur().p = { ...cur().p, f: el.dataset.v }; show(); },
  zoom: el => { const c = mapCenter(); S.mapZ = Math.min(3, Math.max(.6, (S.mapZ || 1) + +el.dataset.v * .4)); fitMap(...c); save(); },
  recenter: () => fitMap(...HERE[me().zone]),
  alerts: () => {
    const list = alerts(me());
    list.forEach(({ c }) => S.dismissed.includes(c.id) || S.dismissed.push(c.id));
    show(); alertsSheet(list);
  },
  filter: el => { cur().p = { ...cur().p, f: el.dataset.v }; show(); },
  accept: () => {
    const c = byId(cur().p.id), now = Date.now();
    if (!c.events.some(e => e.s === 'reviewed')) c.events.push({ s: 'reviewed', t: now });
    c.events.push({ s: 'assigned', t: now });
    c.assignedTo = S.user.vid; c.status = 'assigned';
    show(); toast(t('Task accepted. The reporter can see a volunteer is on it.'));
  },
  release: () => {
    const c = byId(cur().p.id);
    c.assignedTo = null; c.status = 'reviewed';
    c.events.push({ s: 'note', text: 'Volunteer released the task. Back in the queue.', t: Date.now() });
    show();
  },
  outcome: outcomeSheet,
  pickOutcome: el => {
    outcomePick = el.dataset.v;
    el.parentElement.querySelectorAll('.li').forEach(o => o.setAttribute('aria-checked', o === el));
    $('#o-err').hidden = true;
  },
  saveOutcome: () => {
    if (!outcomePick) { $('#o-err').hidden = false; return sfx('error'); }
    const c = byId(cur().p.id), now = Date.now(), note = $('#o-note').value.trim();
    if (outcomePick === 'unreachable') {
      c.assignedTo = null; c.status = 'reviewed';
      c.events.push({ s: 'note', text: 'Volunteer couldn’t reach them. Back in the queue.', t: now });
    } else {
      c.events.push({ s: 'visited', t: now }, { s: 'closed', t: now });
      Object.assign(c, { status: 'closed', outcome: outcomePick, closedBy: S.user.vid, helper: me().name });
    }
    if (note) c.events.push({ s: 'note', text: note, t: now });
    show(); toast(t('Saved. The reporter will see the outcome.'), outcomePick === 'unreachable' ? 'notify' : 'complete');
  },
};

/* ---------- wiring ---------- */
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('button');
  if (!b || b.disabled || reduced()) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2, k = document.createElement('span');
  k.className = 'rip';
  k.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
  b.appendChild(k);
  k.addEventListener('animationend', () => k.remove());
});

// drag to pan the full map with a mouse (touch already scrolls natively); a drag never counts as a tap
let pan = null, dragged = false;
document.addEventListener('pointerdown', e => {
  const fm = e.target.closest('#fm');
  if (fm && e.pointerType === 'mouse') pan = { fm, x: e.clientX, y: e.clientY, l: fm.scrollLeft, t: fm.scrollTop };
});
document.addEventListener('pointermove', e => {
  if (!pan) return;
  const dx = e.clientX - pan.x, dy = e.clientY - pan.y;
  if (Math.abs(dx) + Math.abs(dy) > 5) { dragged = true; pan.fm.classList.add('grabbing'); }
  pan.fm.scrollLeft = pan.l - dx; pan.fm.scrollTop = pan.t - dy;
});
document.addEventListener('pointerup', () => { pan?.fm.classList.remove('grabbing'); pan = null; });

document.addEventListener('click', e => {
  if (dragged) { dragged = false; return; }
  if (e.target.id === 'sheet') return closeSheet();
  document.querySelectorAll('details.dd[open]').forEach(dd => { if (!dd.contains(e.target)) dd.open = false; });
  const el = e.target.closest('[data-go],[data-act],[data-demo]');
  if (!el || el.disabled) return;
  if (el.dataset.demo) {
    sfx('open');
    if (el.dataset.demo === 'civ') signIn({ phone: '90000 00001', verified: true }, 'civ');
    else if (el.dataset.demo === 'vol') signIn({ vid: 'SAATH-V101' }, 'vol');
    else { const { sound } = S; S = seed(); S.sound = sound; show('fade'); }
    return;
  }
  if (el.dataset.go) {
    sfx(el.dataset.tab ? 'soft' : 'click');
    const p = { id: el.dataset.p, f: el.dataset.f };
    if (el.dataset.go === 'thread') S.chats[p.id].unread = 0;
    return el.dataset.tab ? reset(el.dataset.go, p) : go(el.dataset.go, p);
  }
  const act = el.dataset.act, a = ACT[act];
  if (!a) return;
  e.preventDefault();
  const snd = act in SND ? SND[act] : 'click';
  sfx(typeof snd === 'function' ? snd(el) : snd);
  a(el);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSheet();
  const g = e.target.closest?.('g[role="button"]');
  if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); g.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
});

document.addEventListener('input', e => {
  const f = e.target.dataset?.field, o = e.target.dataset.obj === 'reg' ? S.reg : S.draft;
  if (!f || !o) return;
  o[f] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  save();
  const g = e.target.closest('.grp');
  if (g?.classList.contains('bad')) { g.classList.remove('bad'); g.querySelector(':scope > .err')?.remove(); g.querySelector('.tf.bad')?.classList.remove('bad'); }
});

document.addEventListener('change', e => {
  if (e.target.id !== 'f-photo' || !e.target.files[0]) return;
  shrink(e.target.files[0])
    .then(url => { S.draft.photo = url; save(); $('#g-photo .ph').innerHTML = photoBlock(S.draft); sfx('pop'); })
    .catch(() => toast(t('We couldn’t read that file. Try a JPG or PNG photo.'), 'error'));
});

document.addEventListener('submit', e => {
  e.preventDefault();
  const p = cur().p;
  if (e.target.id === 'chatForm') {
    const text = $('#msg').value.trim();
    if (!text) return;
    S.chats[p.id].msgs.push({ who: 'You', text, me: true, t: Date.now() });
    sfx('soft'); show();
    $('#msg').focus();
  }
  if (e.target.id === 'civForm') {
    if (p.step === 'otp') {
      if ($('#otp').value.trim() === '123456') { signIn({ phone: p.phone, verified: true }, 'civ'); toast(t('You’re signed in.')); }
      else { sfx('error'); cur().p = { ...p, err: 'That code doesn’t match. Check the 6 digits and try again.' }; show(); $('#otp').focus(); }
    } else {
      const raw = $('#phone').value, digits = raw.replace(/\D/g, '');
      if (digits.length !== 10) { sfx('error'); cur().p = { phone: raw, err: 'Enter a 10-digit mobile number.' }; show(); }
      else { sfx('click'); cur().p = { step: 'otp', phone: digits.replace(/(\d{5})(\d{5})/, '$1 $2') }; show('fwd'); $('#otp').focus(); }
    }
  }
  if (e.target.id === 'volForm') {
    const id = $('#vid').value.trim().toUpperCase();
    if (VOLS[id] && $('#vcode').value.trim() === '2468') { signIn({ vid: id }, 'vol'); toast(`${t('Welcome')}, ${VOLS[id].name}`); }
    else { sfx('error'); cur().p = { vid: id, err: 'That ID and code don’t match. Check with your ward coordinator.' }; show(); }
  }
});

show('fade');
