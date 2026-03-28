import type { SupportedAppLanguage } from './types';

const adviceTranslations: Record<
  string,
  Record<SupportedAppLanguage, string>
> = {
  'Add the time expression last.': {
    ko: '시간 표현은 마지막에 두세요.',
    en: 'Add the time expression last.',
    ja: '時間表現は最後に置きましょう。',
    zh: '时间表达放在最后。',
    de: 'Setze den Zeitausdruck zuletzt.'
  },
  'Add the verb, then the object.': {
    ko: '동사 다음에 목적어를 붙이세요.',
    en: 'Add the verb, then the object.',
    ja: '動詞のあとに目的語を入れましょう。',
    zh: '先放动词，再放宾语。',
    de: 'Füge zuerst das Verb, dann das Objekt hinzu.'
  },
  'Add the verb, then the place.': {
    ko: '동사 다음에 장소를 붙이세요.',
    en: 'Add the verb, then the place.',
    ja: '動詞のあとに場所を入れましょう。',
    zh: '先放动词，再放地点。',
    de: 'Füge zuerst das Verb, dann den Ort hinzu.'
  },
  'Basic sentence done. Add the object next.': {
    ko: '기본 문장은 완성됐습니다. 다음은 목적어입니다.',
    en: 'Basic sentence done. Add the object next.',
    ja: '基本文はできました。次は目的語です。',
    zh: '基础句完成了，下一步加宾语。',
    de: 'Der Grundsatz steht. Als Nächstes kommt das Objekt.'
  },
  'Basic sentence done. Add the place next.': {
    ko: '기본 문장은 완성됐습니다. 다음은 장소입니다.',
    en: 'Basic sentence done. Add the place next.',
    ja: '基本文はできました。次は場所です。',
    zh: '基础句完成了，下一步加地点。',
    de: 'Der Grundsatz steht. Als Nächstes kommt der Ort.'
  },
  'Object done. Add time next.': {
    ko: '목적어까지 완성됐습니다. 다음은 시간입니다.',
    en: 'Object done. Add time next.',
    ja: '目的語までできました。次は時間です。',
    zh: '宾语完成了，下一步加时间。',
    de: 'Das Objekt ist fertig. Als Nächstes kommt die Zeitangabe.'
  },
  'Place done. Add time next.': {
    ko: '장소까지 완성됐습니다. 다음은 시간입니다.',
    en: 'Place done. Add time next.',
    ja: '場所までできました。次は時間です。',
    zh: '地点完成了，下一步加时间。',
    de: 'Der Ort ist fertig. Als Nächstes kommt die Zeitangabe.'
  },
  'Start with the subject and verb.': {
    ko: '주어와 동사부터 고르세요.',
    en: 'Start with the subject and verb.',
    ja: '主語と動詞から選びましょう。',
    zh: '先选主语和动词。',
    de: 'Beginne mit Subjekt und Verb.'
  },
  'The object comes later.': {
    ko: '목적어는 아직 아닙니다.',
    en: 'The object comes later.',
    ja: '目的語はまだです。',
    zh: '宾语还不到这一步。',
    de: 'Das Objekt kommt später.'
  },
  'The place comes later.': {
    ko: '장소는 아직 아닙니다.',
    en: 'The place comes later.',
    ja: '場所はまだです。',
    zh: '地点还不到这一步。',
    de: 'Der Ort kommt später.'
  },
  'This sentence is complete.': {
    ko: '이 문장은 완성되었습니다.',
    en: 'This sentence is complete.',
    ja: 'この文は完成です。',
    zh: '这句话已经完成了。',
    de: 'Dieser Satz ist vollständig.'
  },
  'This sentence needs buy, not drink.': {
    ko: '여기서는 마시다가 아니라 사다가 맞습니다.',
    en: 'This sentence needs buy, not drink.',
    ja: 'ここでは drink ではなく buy です。',
    zh: '这里需要的是 buy，不是 drink。',
    de: 'Hier brauchst du buy, nicht drink.'
  },
  'This sentence needs drink, not eat.': {
    ko: '여기서는 먹다가 아니라 마시다가 맞습니다.',
    en: 'This sentence needs drink, not eat.',
    ja: 'ここでは eat ではなく drink です。',
    zh: '这里需要的是 drink，不是 eat。',
    de: 'Hier brauchst du drink, nicht eat.'
  },
  'This sentence needs eat, not read.': {
    ko: '여기서는 읽다가 아니라 먹다가 맞습니다.',
    en: 'This sentence needs eat, not read.',
    ja: 'ここでは read ではなく eat です。',
    zh: '这里需要的是 eat，不是 read。',
    de: 'Hier brauchst du eat, nicht read.'
  },
  'This sentence needs read, not eat.': {
    ko: '여기서는 먹다가 아니라 읽다가 맞습니다.',
    en: 'This sentence needs read, not eat.',
    ja: 'ここでは eat ではなく read です。',
    zh: '这里需要的是 read，不是 eat。',
    de: 'Hier brauchst du read, nicht eat.'
  },
  'This sentence needs write, not read.': {
    ko: '여기서는 읽다가 아니라 쓰다가 맞습니다.',
    en: 'This sentence needs write, not read.',
    ja: 'ここでは read ではなく write です。',
    zh: '这里需要的是 write，不是 read。',
    de: 'Hier brauchst du write, nicht read.'
  },
  'Time done. Add want to next.': {
    ko: '시간까지 완성됐습니다. 다음은 희망 표현입니다.',
    en: 'Time done. Add want to next.',
    ja: '時間までできました。次は希望表現です。',
    zh: '时间完成了，下一步加想要表达。',
    de: 'Die Zeitangabe ist fertig. Als Nächstes kommt want to.'
  },
  'Use go, not come.': {
    ko: '여기서는 오다가 아니라 가다가 맞습니다.',
    en: 'Use go, not come.',
    ja: 'ここでは come ではなく go です。',
    zh: '这里用 go，不用 come。',
    de: 'Hier passt go, nicht come.'
  },
  'Use the target drink for this sentence.': {
    ko: '이 문장에 맞는 음료를 고르세요.',
    en: 'Use the target drink for this sentence.',
    ja: 'この文に合う飲み物を選びましょう。',
    zh: '请选择这句话对应的饮料。',
    de: 'Wähle das passende Getränk für diesen Satz.'
  },
  'Use the target food for this sentence.': {
    ko: '이 문장에 맞는 음식을 고르세요.',
    en: 'Use the target food for this sentence.',
    ja: 'この文に合う食べ物を選びましょう。',
    zh: '请选择这句话对应的食物。',
    de: 'Wähle das passende Essen für diesen Satz.'
  },
  'Use the target item for this sentence.': {
    ko: '이 문장에 맞는 대상을 고르세요.',
    en: 'Use the target item for this sentence.',
    ja: 'この文に合う対象を選びましょう。',
    zh: '请选择这句话对应的对象。',
    de: 'Wähle das passende Element für diesen Satz.'
  },
  'Use the target object for this sentence.': {
    ko: '이 문장에 맞는 목적어를 고르세요.',
    en: 'Use the target object for this sentence.',
    ja: 'この文に合う目的語を選びましょう。',
    zh: '请选择这句话对应的宾语。',
    de: 'Wähle das passende Objekt für diesen Satz.'
  },
  'Use the target place for this sentence.': {
    ko: '이 문장에 맞는 장소를 고르세요.',
    en: 'Use the target place for this sentence.',
    ja: 'この文に合う場所を選びましょう。',
    zh: '请选择这句话对应的地点。',
    de: 'Wähle den passenden Ort für diesen Satz.'
  },
  'Use the target time expression here.': {
    ko: '여기서는 목표 시간 표현을 써야 합니다.',
    en: 'Use the target time expression here.',
    ja: 'ここでは目標の時間表現を使いましょう。',
    zh: '这里要用目标时间表达。',
    de: 'Verwende hier die vorgesehene Zeitangabe.'
  },
  'Use want to for this step.': {
    ko: '이 단계에서는 희망 표현을 고르세요.',
    en: 'Use want to for this step.',
    ja: 'この段階では希望表現を使いましょう。',
    zh: '这一步要用想要表达。',
    de: 'Verwende in diesem Schritt want to.'
  },
  'Use want to go for this step.': {
    ko: '이 단계에서는 가고 싶다 표현이 필요합니다.',
    en: 'Use want to go for this step.',
    ja: 'この段階では want to go を使いましょう。',
    zh: '这一步要用 want to go。',
    de: 'Verwende in diesem Schritt want to go.'
  },
  'Want to comes later.': {
    ko: '희망 표현은 아직 아닙니다.',
    en: 'Want to comes later.',
    ja: '希望表現はまだです。',
    zh: '想要表达还不到这一步。',
    de: 'Want to kommt später.'
  },
  '간접화법 완성. 다음은 의도입니다.': {
    ko: '간접화법 완성. 다음은 의도입니다.',
    en: 'Indirect speech is done. Next is intention.',
    ja: '間接話法は完成です。次は意図です。',
    zh: '间接引语完成了，下一步是意图。',
    de: 'Die indirekte Rede ist fertig. Als Nächstes kommt die Absicht.'
  },
  '감정 표현은 아직 아닙니다.': {
    ko: '감정 표현은 아직 아닙니다.',
    en: 'The feeling expression comes later.',
    ja: '感情表現はまだです。',
    zh: '情感表达还不到这一步。',
    de: 'Der Gefühlsausdruck kommt später.'
  },
  '감정 표현을 고르세요.': {
    ko: '감정 표현을 고르세요.',
    en: 'Choose the feeling expression.',
    ja: '感情表現を選びましょう。',
    zh: '请选择情感表达。',
    de: 'Wähle den Gefühlsausdruck.'
  },
  '감정까지 완성. 다음은 시간입니다.': {
    ko: '감정까지 완성. 다음은 시간입니다.',
    en: 'The feeling part is done. Next is time.',
    ja: '感情までできました。次は時間です。',
    zh: '情感部分完成了，下一步是时间。',
    de: 'Der Gefühlsausdruck ist fertig. Als Nächstes kommt die Zeit.'
  },
  '결과보다 의도가 필요합니다.': {
    ko: '결과보다 의도가 필요합니다.',
    en: 'You need the intention before the result.',
    ja: '結果より先に意図が必要です。',
    zh: '结果之前要先放意图。',
    de: 'Vor dem Ergebnis brauchst du zuerst die Absicht.'
  },
  '기본 문장 완성. 다음은 대상입니다.': {
    ko: '기본 문장 완성. 다음은 대상입니다.',
    en: 'The basic sentence is done. Next is the target.',
    ja: '基本文は完成です。次は対象です。',
    zh: '基础句完成了，下一步是对象。',
    de: 'Der Grundsatz ist fertig. Als Nächstes kommt das Ziel.'
  },
  '기본 문장 완성. 다음은 장소입니다.': {
    ko: '기본 문장 완성. 다음은 장소입니다.',
    en: 'The basic sentence is done. Next is the place.',
    ja: '基本文は完成です。次は場所です。',
    zh: '基础句完成了，下一步是地点。',
    de: 'Der Grundsatz ist fertig. Als Nächstes kommt der Ort.'
  },
  '대상 블록을 붙이세요.': {
    ko: '대상 블록을 붙이세요.',
    en: 'Add the target block.',
    ja: '対象ブロックを入れましょう。',
    zh: '加入对象模块。',
    de: 'Füge den Zielblock hinzu.'
  },
  '대상과 행동을 이어 보세요.': {
    ko: '대상과 행동을 이어 보세요.',
    en: 'Connect the target and the action.',
    ja: '対象と行動をつなげましょう。',
    zh: '把对象和动作连起来。',
    de: 'Verbinde Ziel und Handlung.'
  },
  '대상까지 완성. 다음은 시간입니다.': {
    ko: '대상까지 완성. 다음은 시간입니다.',
    en: 'The target part is done. Next is time.',
    ja: '対象までできました。次は時間です。',
    zh: '对象部分完成了，下一步是时间。',
    de: 'Der Zielteil ist fertig. Als Nächstes kommt die Zeit.'
  },
  '대상은 아직 아닙니다.': {
    ko: '대상은 아직 아닙니다.',
    en: 'The target comes later.',
    ja: '対象はまだです。',
    zh: '对象还不到这一步。',
    de: 'Das Ziel kommt später.'
  },
  '마지막은 희망 표현을 고르세요.': {
    ko: '마지막은 희망 표현을 고르세요.',
    en: 'Choose the want-to expression last.',
    ja: '最後に希望表現を選びましょう。',
    zh: '最后选择想要表达。',
    de: 'Wähle am Ende den want-to-Ausdruck.'
  },
  '말한 내용을 붙이세요.': {
    ko: '말한 내용을 붙이세요.',
    en: 'Add the quoted content.',
    ja: '話した内容を入れましょう。',
    zh: '加入所说的内容。',
    de: 'Füge den gesprochenen Inhalt hinzu.'
  },
  '문맥이 반대입니다.': {
    ko: '문맥이 반대입니다.',
    en: 'The meaning goes in the opposite direction.',
    ja: '文脈の向きが逆です。',
    zh: '语境方向相反。',
    de: 'Die Bedeutung läuft in die entgegengesetzte Richtung.'
  },
  '문장 맨 앞에 시간 블록을 두세요.': {
    ko: '문장 맨 앞에 시간 블록을 두세요.',
    en: 'Put the time block at the very front.',
    ja: '時間ブロックを文頭に置きましょう。',
    zh: '把时间模块放在句首。',
    de: 'Setze den Zeitblock ganz an den Satzanfang.'
  },
  '보는 동작은 아닙니다.': {
    ko: '보는 동작은 아닙니다.',
    en: 'This is not a reading action.',
    ja: '読む動作ではありません。',
    zh: '这里不是阅读动作。',
    de: 'Das ist keine Lesehandlung.'
  },
  '시간 블록을 앞에 두세요.': {
    ko: '시간 블록을 앞에 두세요.',
    en: 'Place the time block first.',
    ja: '時間ブロックを前に置きましょう。',
    zh: '把时间模块放在前面。',
    de: 'Setze den Zeitblock nach vorn.'
  },
  '시간까지 완성. 다음은 이유와 행동입니다.': {
    ko: '시간까지 완성. 다음은 이유와 행동입니다.',
    en: 'The time part is done. Next are reason and action.',
    ja: '時間までできました。次は理由と行動です。',
    zh: '时间部分完成了，下一步是原因和动作。',
    de: 'Der Zeitteil ist fertig. Als Nächstes kommen Grund und Handlung.'
  },
  '시간까지 완성. 다음은 희망 표현입니다.': {
    ko: '시간까지 완성. 다음은 희망 표현입니다.',
    en: 'The time part is done. Next is the want-to expression.',
    ja: '時間までできました。次は希望表現です。',
    zh: '时间部分完成了，下一步是想要表达。',
    de: 'Der Zeitteil ist fertig. Als Nächstes kommt der want-to-Ausdruck.'
  },
  '시간보다 감정이 먼저입니다.': {
    ko: '시간보다 감정이 먼저입니다.',
    en: 'The feeling comes before the time phrase.',
    ja: '時間より先に感情が来ます。',
    zh: '情感要先于时间表达。',
    de: 'Der Gefühlsausdruck kommt vor der Zeitangabe.'
  },
  '엄마는 대상입니다.': {
    ko: '엄마는 대상입니다.',
    en: 'Mother is the target here.',
    ja: 'お母さんは対象です。',
    zh: '妈妈在这里是对象。',
    de: 'Die Mutter ist hier das Ziel.'
  },
  '엄마에게 말하는 건 아직 아닙니다.': {
    ko: '엄마에게 말하는 건 아직 아닙니다.',
    en: 'Talking to mother comes later.',
    ja: 'お母さんに言うのはまだです。',
    zh: '对妈妈说话还不到这一步。',
    de: 'Das Sprechen mit der Mutter kommt später.'
  },
  '여기는 마시다가 아니라 먹다입니다.': {
    ko: '여기는 마시다가 아니라 먹다입니다.',
    en: 'This one uses eat, not drink.',
    ja: 'ここは drink ではなく eat です。',
    zh: '这里用 eat，不用 drink。',
    de: 'Hier ist eat richtig, nicht drink.'
  },
  '여기는 먹다가 아니라 마시다입니다.': {
    ko: '여기는 먹다가 아니라 마시다입니다.',
    en: 'This one uses drink, not eat.',
    ja: 'ここは eat ではなく drink です。',
    zh: '这里用 drink，不用 eat。',
    de: 'Hier ist drink richtig, nicht eat.'
  },
  '여기는 쓰다가 아니라 읽다입니다.': {
    ko: '여기는 쓰다가 아니라 읽다입니다.',
    en: 'This one uses read, not write.',
    ja: 'ここは write ではなく read です。',
    zh: '这里用 read，不用 write。',
    de: 'Hier ist read richtig, nicht write.'
  },
  '여기는 오늘의 상황입니다.': {
    ko: '여기는 오늘의 상황입니다.',
    en: 'This sentence is about today.',
    ja: 'ここは今日の場面です。',
    zh: '这里说的是今天的情境。',
    de: 'Dieser Satz bezieht sich auf heute.'
  },
  '여기는 읽다가 아니라 쓰다입니다.': {
    ko: '여기는 읽다가 아니라 쓰다입니다.',
    en: 'This one uses write, not read.',
    ja: 'ここは read ではなく write です。',
    zh: '这里用 write，不用 read。',
    de: 'Hier ist write richtig, nicht read.'
  },
  '여기서는 기본 동작보다 희망 표현이 필요합니다.': {
    ko: '여기서는 기본 동작보다 희망 표현이 필요합니다.',
    en: 'This step needs the want-to expression, not the base action.',
    ja: 'ここでは基本動作より希望表現が必要です。',
    zh: '这一步需要想要表达，不是基本动作。',
    de: 'Hier brauchst du den want-to-Ausdruck, nicht die Grundhandlung.'
  },
  '여기서는 길이 아니라 이름이 맞습니다.': {
    ko: '여기서는 길이 아니라 이름이 맞습니다.',
    en: 'This sentence uses name, not street.',
    ja: 'ここでは道ではなく名前です。',
    zh: '这里要用名字，不是路。',
    de: 'Hier passt name, nicht street.'
  },
  '여기서는 다른 장소가 아니라 현재 장소가 맞습니다.': {
    ko: '여기서는 다른 장소가 아니라 현재 장소가 맞습니다.',
    en: 'Use the target place for this sentence.',
    ja: 'ここでは別の場所ではなく今の場所です。',
    zh: '这里要用当前目标地点，不是别的地点。',
    de: 'Hier passt der aktuelle Zielort, nicht ein anderer Ort.'
  },
  '여기서는 물보다 차가 맞습니다.': {
    ko: '여기서는 물보다 차가 맞습니다.',
    en: 'This sentence uses tea, not water.',
    ja: 'ここでは水ではなくお茶です。',
    zh: '这里要用茶，不是水。',
    de: 'Hier passt Tee, nicht Wasser.'
  },
  '여기서는 마시다가 아니라 사다입니다.': {
    ko: '여기서는 마시다가 아니라 사다입니다.',
    en: 'This one uses buy, not drink.',
    ja: 'ここでは drink ではなく buy です。',
    zh: '这里用 buy，不用 drink。',
    de: 'Hier ist buy richtig, nicht drink.'
  },
  '여기서는 밥보다 빵이 맞습니다.': {
    ko: '여기서는 밥보다 빵이 맞습니다.',
    en: 'This sentence uses bread, not rice.',
    ja: 'ここではごはんではなくパンです。',
    zh: '这里要用面包，不是米饭。',
    de: 'Hier passt Brot, nicht Reis.'
  },
  '여기서는 빵보다 밥이 맞습니다.': {
    ko: '여기서는 빵보다 밥이 맞습니다.',
    en: 'This sentence uses rice, not bread.',
    ja: 'ここではパンではなくごはんです。',
    zh: '这里要用米饭，不是面包。',
    de: 'Hier passt Reis, nicht Brot.'
  },
  '여기서는 설정된 시간 표현이 먼저입니다.': {
    ko: '여기서는 설정된 시간 표현이 먼저입니다.',
    en: 'The target time phrase comes first here.',
    ja: 'ここでは設定された時間表現が先です。',
    zh: '这里目标时间表达要先出现。',
    de: 'Hier kommt die vorgegebene Zeitangabe zuerst.'
  },
  '여기서는 오다가 아니라 가고 싶다가 맞습니다.': {
    ko: '여기서는 오다가 아니라 가고 싶다가 맞습니다.',
    en: 'This one uses want to go, not come.',
    ja: 'ここでは come ではなく want to go です。',
    zh: '这里要用 want to go，不是 come。',
    de: 'Hier passt want to go, nicht come.'
  },
  '여기서는 오다가 아니라 가다입니다.': {
    ko: '여기서는 오다가 아니라 가다입니다.',
    en: 'This one uses go, not come.',
    ja: 'ここでは come ではなく go です。',
    zh: '这里要用 go，不是 come。',
    de: 'Hier passt go, nicht come.'
  },
  '여기서는 차보다 물이 맞습니다.': {
    ko: '여기서는 차보다 물이 맞습니다.',
    en: 'This sentence uses water, not tea.',
    ja: 'ここではお茶ではなく水です。',
    zh: '这里要用水，不是茶。',
    de: 'Hier passt Wasser, nicht Tee.'
  },
  '여긴 감정 표현이 필요합니다.': {
    ko: '여긴 감정 표현이 필요합니다.',
    en: 'This step needs the feeling expression.',
    ja: 'ここでは感情表現が必要です。',
    zh: '这一步需要情感表达。',
    de: 'Hier brauchst du den Gefühlsausdruck.'
  },
  '여긴 목적어 구조입니다.': {
    ko: '여긴 목적어 구조입니다.',
    en: 'This sentence uses the object pattern.',
    ja: 'ここは目的語の構造です。',
    zh: '这里是宾语结构。',
    de: 'Hier wird die Objektstruktur verwendet.'
  },
  '의도 표현을 고르세요.': {
    ko: '의도 표현을 고르세요.',
    en: 'Choose the intention expression.',
    ja: '意図表現を選びましょう。',
    zh: '请选择意图表达。',
    de: 'Wähle den Absichtsausdruck.'
  },
  '의도까지 완성. 전체를 읽어 보세요.': {
    ko: '의도까지 완성. 전체를 읽어 보세요.',
    en: 'The intention part is done. Read the whole sentence.',
    ja: '意図まで完成です。全文を読んでみましょう。',
    zh: '意图部分完成了，读一遍整句吧。',
    de: 'Der Absichtsteil ist fertig. Lies jetzt den ganzen Satz.'
  },
  '의미가 반대입니다.': {
    ko: '의미가 반대입니다.',
    en: 'The meaning is the opposite.',
    ja: '意味が反対です。',
    zh: '意思相反。',
    de: 'Die Bedeutung ist umgekehrt.'
  },
  '장소 블록을 붙이세요.': {
    ko: '장소 블록을 붙이세요.',
    en: 'Add the place block.',
    ja: '場所ブロックを入れましょう。',
    zh: '加入地点模块。',
    de: 'Füge den Ortsblock hinzu.'
  },
  '장소까지 완성. 다음은 감정입니다.': {
    ko: '장소까지 완성. 다음은 감정입니다.',
    en: 'The place part is done. Next is the feeling.',
    ja: '場所までできました。次は感情です。',
    zh: '地点部分完成了，下一步是情感。',
    de: 'Der Ortsteil ist fertig. Als Nächstes kommt das Gefühl.'
  },
  '장소까지 완성. 다음은 시간입니다.': {
    ko: '장소까지 완성. 다음은 시간입니다.',
    en: 'The place part is done. Next is time.',
    ja: '場所までできました。次は時間です。',
    zh: '地点部分完成了，下一步是时间。',
    de: 'Der Ortsteil ist fertig. Als Nächstes kommt die Zeit.'
  },
  '장소는 아직 아닙니다.': {
    ko: '장소는 아직 아닙니다.',
    en: 'The place comes later.',
    ja: '場所はまだです。',
    zh: '地点还不到这一步。',
    de: 'Der Ort kommt später.'
  },
  '장소는 학교여야 합니다.': {
    ko: '장소는 학교여야 합니다.',
    en: 'The place must be school here.',
    ja: '場所は学校でなければなりません。',
    zh: '这里地点必须是学校。',
    de: 'Der Ort muss hier Schule sein.'
  },
  '주어와 동사부터 고르세요.': {
    ko: '주어와 동사부터 고르세요.',
    en: 'Start with the subject and verb.',
    ja: '主語と動詞から選びましょう。',
    zh: '先选主语和动词。',
    de: 'Beginne mit Subjekt und Verb.'
  },
  '행동까지 완성. 다음은 말한 내용입니다.': {
    ko: '행동까지 완성. 다음은 말한 내용입니다.',
    en: 'The action part is done. Next is the quoted content.',
    ja: '行動までできました。次は話した内容です。',
    zh: '动作部分完成了，下一步是所说内容。',
    de: 'Der Handlungsteil ist fertig. Als Nächstes kommt der gesagte Inhalt.'
  },
  '희망 표현까지 완성했습니다.': {
    ko: '희망 표현까지 완성했습니다.',
    en: 'The want-to expression is complete.',
    ja: '希望表現まで完成しました。',
    zh: '想要表达部分完成了。',
    de: 'Der want-to-Ausdruck ist vollständig.'
  },
  '희망 표현은 아직 아닙니다.': {
    ko: '희망 표현은 아직 아닙니다.',
    en: 'The want-to expression comes later.',
    ja: '希望表現はまだです。',
    zh: '想要表达还不到这一步。',
    de: 'Der want-to-Ausdruck kommt später.'
  }
};

const messageTemplates: Record<
  | 'check_choice_first'
  | 'wrong_block'
  | 'correct_block'
  | 'stage_completed'
  | 'all_completed'
  | 'check_next_sentence',
  Record<SupportedAppLanguage, string>
> = {
  check_choice_first: {
    ko: '어떤 블록을 골라야 하는지 먼저 확인하세요.',
    en: 'Check which block should come next.',
    ja: '次に選ぶブロックを確認しましょう。',
    zh: '先确认下一步该选哪个模块。',
    de: 'Prüfe zuerst, welcher Block als Nächstes kommt.'
  },
  wrong_block: {
    ko: '{block} 블록은 이 문장에 맞지 않습니다.',
    en: 'The block "{block}" does not fit this sentence.',
    ja: '「{block}」ブロックはこの文に合いません。',
    zh: '“{block}”这个模块不适合这句话。',
    de: 'Der Block „{block}“ passt nicht zu diesem Satz.'
  },
  correct_block: {
    ko: '{block} 블록이 맞습니다.',
    en: 'The block "{block}" is correct.',
    ja: '「{block}」ブロックが正解です。',
    zh: '“{block}”这个模块是正确的。',
    de: 'Der Block „{block}“ ist richtig.'
  },
  stage_completed: {
    ko: '현재 문장을 완성했습니다.',
    en: 'You completed the current sentence.',
    ja: '現在の文を完成しました。',
    zh: '你完成了当前句子。',
    de: 'Du hast den aktuellen Satz abgeschlossen.'
  },
  all_completed: {
    ko: '모든 문자조립훈련 문제를 완료했습니다.',
    en: 'You completed all sentence assembly exercises.',
    ja: 'すべての文字組み立て練習を完了しました。',
    zh: '你已完成所有文字拼装训练。',
    de: 'Du hast alle Satzbau-Übungen abgeschlossen.'
  },
  check_next_sentence: {
    ko: '다음 문장에서 어떤 블록이 먼저 필요한지 확인하세요.',
    en: 'Check which block should come first in the next sentence.',
    ja: '次の文で最初に必要なブロックを確認しましょう。',
    zh: '确认下一句最先需要哪个模块。',
    de: 'Prüfe, welcher Block im nächsten Satz zuerst gebraucht wird.'
  }
};

function fillTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template
  );
}

export function translateSentenceAdvice(
  advice: string,
  appLanguage: SupportedAppLanguage
): string {
  return adviceTranslations[advice]?.[appLanguage] ?? advice;
}

export function getSentenceFeedbackMessage(
  key: keyof typeof messageTemplates,
  appLanguage: SupportedAppLanguage,
  values: Record<string, string> = {}
): string {
  return fillTemplate(messageTemplates[key][appLanguage], values);
}
