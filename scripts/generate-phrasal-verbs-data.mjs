import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const curriculumOutputPath = path.resolve(
  __dirname,
  '../packages/shared/src/data/en/phrasal-verbs.json'
);
const sentenceOutputPath = path.resolve(
  __dirname,
  '../packages/shared/src/data/en/phrasal-verbs-sentence-expansion.json'
);

const unitDefinitions = [
  {
    id: 'phrasal-verbs-core-01',
    title: 'Conversation And Coordination',
    entries: [
      'ask around|수소문하다|comp|at school|학교에서',
      'ask out|데이트를 신청하다|obj|my classmate|반 친구에게',
      'back down|양보하다|comp|during practice|연습 중에',
      'back up|지원하다|obj|my team|우리 팀을',
      'bring up|제기하다|obj|the idea|그 생각을',
      'call back|다시 전화하다|obj|my client|고객에게',
      'call off|취소하다|obj|the meeting|회의를',
      'carry on|계속하다|comp|after lunch|점심 후에',
      'catch on|이해하다|comp|after a while|잠시 후에',
      'catch up|따라가다|comp|with the group|팀과 보조를 맞춰',
      'check in|체크인하다|comp|at the hotel|호텔에서',
      'check out|체크아웃하다|comp|before noon|정오 전에',
      'cheer up|기운을 내다|comp|after the call|통화 후에',
      'chip in|돈을 보태다|obj|some money|돈을',
      'clear up|명확해지다|comp|by tomorrow|내일까지',
      'close down|폐쇄하다|obj|the shop|가게를',
      'come across|우연히 발견하다|obj|an old photo|오래된 사진을',
      'come back|돌아오다|comp|after work|일을 마치고',
      'come by|들르다|comp|in the evening|저녁에',
      'count on|믿고 의지하다|obj|my friend|내 친구를',
      'cut off|끊다|obj|the power|전기를',
      'dress up|차려입다|comp|for the party|파티에 가려고',
      'drop by|잠깐 들르다|comp|before dinner|저녁 전에',
      'drop off|내려주다|obj|my sister|여동생을',
      'figure out|알아내다|obj|the answer|답을'
    ]
  },
  {
    id: 'phrasal-verbs-core-02',
    title: 'Everyday Progress',
    entries: [
      'fill in|작성하다|obj|the form|서류를',
      'fill out|작성하다|obj|the survey|설문지를',
      'find out|알아내다|obj|the truth|사실을',
      'get ahead|앞서가다|comp|at work|직장에서',
      'get along|잘 지내다|comp|with everyone|모두와',
      'get around|이동하다|comp|in the city|도시에서',
      'get away|떠나다|comp|for the weekend|주말에',
      'get back|돌아오다|comp|before sunset|해 지기 전에',
      'get by|버텨내다|comp|with a small budget|적은 예산으로',
      'get in|도착하다|comp|before class|수업 전에',
      'get off|내리다|comp|at the station|역에서',
      'get on|타다|comp|on the bus|버스에',
      'get out|나가다|comp|after the show|공연 후에',
      'get over|극복하다|obj|the mistake|그 실수를',
      'get through|끝내다|obj|the report|보고서를',
      'get up|일어나다|comp|before six|여섯 시 전에',
      'give away|나누어 주다|obj|old clothes|헌 옷을',
      'give back|돌려주다|obj|the book|책을',
      'give in|굴복하다|comp|under pressure|압박 속에서',
      'give up|포기하다|obj|the plan|그 계획을',
      'go ahead|진행하다|comp|with confidence|자신 있게',
      'go away|떠나다|comp|for a day|하루 동안',
      'go back|되돌아가다|comp|to the office|사무실로',
      'go out|외출하다|comp|after dinner|저녁 식사 후에',
      'go over|검토하다|obj|the notes|메모를'
    ]
  },
  {
    id: 'phrasal-verbs-core-03',
    title: 'Work And Support',
    entries: [
      'go through|겪다|obj|a hard time|힘든 시간을',
      'grow up|성장하다|comp|in Seoul|서울에서',
      'hand in|제출하다|obj|the homework|숙제를',
      'hand out|배포하다|obj|the flyers|전단지를',
      'hang around|어슬렁거리다|comp|after school|방과 후에',
      'hang on|기다리다|comp|for a minute|잠깐',
      'hang out|어울리다|comp|with friends|친구들과',
      'hold back|참다|obj|my opinion|내 의견을',
      'hold on|기다리다|comp|for a second|잠시',
      'hold up|지연시키다|obj|the line|줄을',
      'keep away|멀리하다|comp|from stress|스트레스에서',
      'keep on|계속하다|comp|with the lesson|수업을 계속',
      'keep up|유지하다|obj|the pace|속도를',
      'kick off|시작하다|obj|the event|행사를',
      'knock out|기절시키다|obj|the boxer|권투 선수를',
      'lay off|해고하다|obj|two workers|직원 두 명을',
      'leave out|빼다|obj|one detail|한 가지 세부 사항을',
      'let down|실망시키다|obj|the team|팀을',
      'let in|들여보내다|obj|the guest|손님을',
      'line up|줄을 세우다|obj|the kids|아이들을',
      'live on|먹고 살다|comp|on noodles|면으로',
      'log in|로그인하다|comp|with my password|비밀번호로',
      'look after|돌보다|obj|my nephew|조카를',
      'look around|둘러보다|comp|in the store|가게에서',
      'look for|찾다|obj|my keys|내 열쇠를'
    ]
  },
  {
    id: 'phrasal-verbs-core-04',
    title: 'Planning And Review',
    entries: [
      'look forward to|기대하다|obj|the vacation|휴가를',
      'look into|조사하다|obj|the problem|문제를',
      'look out|조심하다|comp|near the road|길가에서',
      'look over|살펴보다|obj|the document|문서를',
      'look up|찾아보다|obj|the word|단어를',
      'make up|만들어 내다|obj|an excuse|변명을',
      'mix up|혼동하다|obj|the names|이름을',
      'move in|이사 오다|comp|next month|다음 달에',
      'move on|넘어가다|comp|after the lesson|수업 후에',
      'move out|이사 나가다|comp|this spring|이번 봄에',
      'nod off|깜빡 잠들다|comp|on the sofa|소파에서',
      'open up|마음을 열다|comp|during the talk|대화 중에',
      'pass away|세상을 떠나다|comp|last year|작년에',
      'pass on|전달하다|obj|the message|메시지를',
      'pay back|갚다|obj|the money|돈을',
      'pay for|지불하다|obj|the meal|식사를',
      'pay off|성과를 내다|comp|in the end|결국',
      'pick out|고르다|obj|a gift|선물을',
      'pick up|집어 들다|obj|the package|소포를',
      'plan ahead|미리 계획하다|comp|for the trip|여행을 위해',
      'point out|지적하다|obj|the error|오류를',
      'print out|출력하다|obj|the ticket|티켓을',
      'put away|치우다|obj|the dishes|접시를',
      'put back|제자리에 두다|obj|the chair|의자를',
      'put down|적어 두다|obj|the idea|그 생각을'
    ]
  },
  {
    id: 'phrasal-verbs-core-05',
    title: 'Handling Situations',
    entries: [
      'put off|미루다|obj|the appointment|약속을',
      'put on|입다|obj|a jacket|재킷을',
      'put out|끄다|obj|the fire|불을',
      'put together|조립하다|obj|the shelf|선반을',
      'run across|우연히 만나다|obj|an old friend|오랜 친구를',
      'run away|도망가다|comp|from home|집에서',
      'run into|우연히 만나다|obj|my teacher|선생님을',
      'run out of|다 써 버리다|obj|milk|우유를',
      'save up|저축하다|comp|for a bike|자전거를 사려고',
      'sell out|매진되다|comp|before noon|정오 전에',
      'send back|반송하다|obj|the order|주문품을',
      'set aside|따로 두다|obj|some time|시간을',
      'set off|출발하다|comp|before dawn|새벽 전에',
      'set up|설치하다|obj|the camera|카메라를',
      'show up|나타나다|comp|on time|제시간에',
      'shut down|중단하다|obj|the system|시스템을',
      'sign in|서명하고 들어가다|comp|at the desk|안내 데스크에서',
      'sign up|신청하다|comp|for the class|수업을 위해',
      'sit down|앉다|comp|near the window|창가에',
      'sleep in|늦잠 자다|comp|on Sundays|일요일마다',
      'speak up|크게 말하다|comp|during the meeting|회의 중에',
      'speed up|속도를 높이다|obj|the process|과정을',
      'stand by|대기하다|comp|for updates|업데이트를 기다리며',
      'stand out|두드러지다|comp|in the crowd|사람들 사이에서',
      'start over|다시 시작하다|comp|after the mistake|실수 후에'
    ]
  },
  {
    id: 'phrasal-verbs-core-06',
    title: 'Habits And Decisions',
    entries: [
      'stay in|집에 머물다|comp|on rainy days|비 오는 날에',
      'stay up|늦게까지 깨어 있다|comp|for the game|경기를 보려고',
      'step down|사임하다|comp|after the vote|투표 후에',
      'step in|개입하다|comp|during the argument|말다툼 중에',
      'stick to|고수하다|obj|the schedule|일정을',
      'switch off|끄다|obj|the light|불을',
      'switch on|켜다|obj|the heater|난방기를',
      'take after|닮다|obj|my father|아버지를',
      'take away|치우다|obj|the tray|쟁반을',
      'take back|철회하다|obj|my words|내 말을',
      'take down|메모하다|obj|the address|주소를',
      'take off|벗다|obj|my shoes|신발을',
      'take on|맡다|obj|the task|그 일을',
      'take out|꺼내다|obj|the trash|쓰레기를',
      'talk over|상의하다|obj|the issue|문제를',
      'tear down|철거하다|obj|the wall|벽을',
      'think over|곰곰이 생각하다|obj|the offer|제안을',
      'throw away|버리다|obj|old papers|낡은 종이를',
      'tidy up|정리하다|obj|the room|방을',
      'try on|입어 보다|obj|the coat|코트를',
      'turn around|돌아서다|comp|at the door|문 앞에서',
      'turn down|거절하다|obj|the invitation|초대를',
      'turn in|제출하다|obj|the report|보고서를',
      'turn off|끄다|obj|the TV|텔레비전을',
      'turn on|켜다|obj|the radio|라디오를'
    ]
  },
  {
    id: 'phrasal-verbs-core-07',
    title: 'Movement And Change',
    entries: [
      'turn out|드러나다|comp|to be true|사실로',
      'turn up|나타나다|comp|at the station|역에',
      'use up|다 써 버리다|obj|all the paper|종이를 모두',
      'wait for|기다리다|obj|the bus|버스를',
      'wake up|잠에서 깨다|comp|before sunrise|해 뜨기 전에',
      'walk in|걸어 들어오다|comp|without knocking|노크 없이',
      'walk out|걸어 나가다|comp|during the break|쉬는 시간에',
      'warm up|몸을 풀다|comp|before practice|연습 전에',
      'wash up|씻다|comp|after dinner|저녁 식사 후에',
      'watch out|조심하다|comp|near the stairs|계단 근처에서',
      'wear out|닳게 하다|obj|my sneakers|내 운동화를',
      'wind down|긴장을 풀다|comp|after work|퇴근 후에',
      'work out|해결하다|obj|the plan|계획을',
      'write down|적다|obj|the number|번호를',
      'zone out|멍해지다|comp|during the lecture|강의 중에',
      'add up|합산되다|comp|in the end|결국',
      'blow up|폭발하다|comp|in the movie|영화에서',
      'boil down|요약되다|comp|to one point|한 가지 요점으로',
      'book in|예약하다|obj|a table|자리를',
      'break down|고장 나다|comp|on the road|길에서',
      'break in|침입하다|comp|at night|밤에',
      'break out|발생하다|comp|in the city|도시에서',
      'break up|헤어지다|comp|after a year|일 년 후에',
      'bring about|초래하다|obj|a change|변화를',
      'bring back|되살리다|obj|old memories|옛 기억을'
    ]
  },
  {
    id: 'phrasal-verbs-core-08',
    title: 'Results And Causes',
    entries: [
      'bring down|낮추다|obj|the price|가격을',
      'bring in|도입하다|obj|a new rule|새 규칙을',
      'bring out|드러내다|obj|the flavor|맛을',
      'calm down|진정하다|comp|after the news|소식을 들은 후에',
      'call for|요구하다|obj|more time|더 많은 시간을',
      'come down with|걸리다|obj|the flu|독감에',
      'come from|출신이다|comp|from Busan|부산에서',
      'come in|들어오다|comp|through the door|문으로',
      'come off|성공하다|comp|as planned|계획대로',
      'come out|나오다|comp|next month|다음 달에',
      'come over|방문하다|comp|after lunch|점심 후에',
      'come through|해내다|comp|in the end|결국',
      'cut back|줄이다|obj|our spending|지출을',
      'cut down on|줄이다|obj|sugar|설탕을',
      'do over|다시 하다|obj|the task|그 일을',
      'do without|없이 지내다|obj|a car|자동차 없이',
      'drag on|질질 끌다|comp|for hours|몇 시간 동안',
      'draw up|작성하다|obj|a contract|계약서를',
      'eat out|외식하다|comp|on Fridays|금요일마다',
      'end up|결국 ~하게 되다|comp|at the wrong place|엉뚱한 곳에서',
      'fall apart|무너지다|comp|under stress|스트레스 속에서',
      'fall behind|뒤처지다|comp|in class|수업에서',
      'fall for|속다|obj|the trick|속임수에',
      'finish off|끝내다|obj|the cake|케이크를',
      'focus on|집중하다|obj|the goal|목표에'
    ]
  },
  {
    id: 'phrasal-verbs-core-09',
    title: 'Problem Solving',
    entries: [
      'follow up|후속 조치하다|obj|the email|이메일을',
      'knock down|쓰러뜨리다|obj|the sign|표지판을',
      'lead to|이어지다|obj|a delay|지연으로',
      'leave behind|남겨 두다|obj|my bag|내 가방을',
      'live up to|부응하다|obj|the promise|약속에',
      'make for|향하다|obj|the exit|출구로',
      'pass out|기절하다|comp|during the game|경기 중에',
      'pick on|괴롭히다|obj|the new kid|새로 온 아이를',
      'pull over|차를 세우다|comp|by the curb|길가에',
      'put up with|참다|obj|the noise|소음을',
      'reach out|손을 내밀다|comp|to a neighbor|이웃에게',
      'rule out|제외하다|obj|that option|그 선택지를',
      'see off|배웅하다|obj|my parents|부모님을',
      'settle down|정착하다|comp|in one town|한 도시에',
      'show off|자랑하다|obj|my new phone|새 휴대전화를',
      'sort out|정리하다|obj|the files|파일을',
      'step up|강화하다|obj|our efforts|노력을',
      'stick with|계속하다|obj|the project|프로젝트를',
      'stop by|잠깐 들르다|comp|after class|수업 후에',
      'sum up|요약하다|obj|the meeting|회의 내용을',
      'take in|이해하다|obj|the news|소식을',
      'team up|협력하다|comp|with another group|다른 팀과',
      'think ahead|앞을 내다보다|comp|for the future|미래를 생각하며',
      'track down|추적하다|obj|the source|근원을',
      'try out|시험해 보다|obj|the app|앱을'
    ]
  },
  {
    id: 'phrasal-verbs-core-10',
    title: 'Media And Action',
    entries: [
      'tune in|채널을 맞추다|comp|for the show|방송을 보려고',
      'turn back|되돌아가다|comp|before the bridge|다리 앞에서',
      'turn to|의지하다|obj|my teacher|선생님에게',
      'walk away|떠나 버리다|comp|from the argument|말다툼에서',
      'wear off|사라지다|comp|by midnight|자정까지',
      'win over|설득하다|obj|the crowd|사람들을',
      'work on|작업하다|obj|the design|디자인을',
      'wrap up|마무리하다|obj|the lesson|수업을',
      'zero in on|집중하다|obj|the key issue|핵심 문제에',
      'zoom in|확대하다|comp|on the image|이미지에',
      'bail out|구해 주다|obj|my friend|내 친구를',
      'block out|차단하다|obj|the noise|소음을',
      'branch out|영역을 넓히다|comp|into new markets|새 시장으로',
      'brush up on|복습하다|obj|my English|영어를',
      'build up|쌓다|obj|my strength|체력을',
      'buy out|인수하다|obj|the company|회사를',
      'cash in on|이익을 얻다|obj|the trend|유행에서',
      'check over|점검하다|obj|the machine|기계를',
      'close out|마감하다|obj|the account|계정을',
      'crack down on|단속하다|obj|late payments|연체를',
      'cut in|끼어들다|comp|during the talk|대화 중에',
      'deal with|처리하다|obj|the complaint|불만을',
      'dig into|파고들다|obj|the data|데이터를',
      'ease off|누그러지다|comp|after noon|정오 이후에',
      'face up to|직면하다|obj|the truth|진실에'
    ]
  },
  {
    id: 'phrasal-verbs-core-11',
    title: 'Advanced Use',
    entries: [
      'fall back on|의지하다|obj|my savings|저축에',
      'fight back|맞서다|comp|against pressure|압박에 맞서',
      'filter out|걸러 내다|obj|bad comments|나쁜 댓글을',
      'fit in|잘 어울리다|comp|at school|학교에서',
      'gear up for|준비하다|obj|the launch|출시를',
      'go with|잘 어울리다|obj|this shirt|이 셔츠에',
      'hand over|건네주다|obj|the keys|열쇠를',
      'head for|향하다|obj|the station|역으로',
      'iron out|해결하다|obj|the problem|문제를',
      'jump in|끼어들다|comp|without waiting|기다리지 않고',
      'keep up with|따라가다|obj|the news|뉴스를',
      'lean on|의지하다|obj|my family|가족에게',
      'lock in|확정하다|obj|the price|가격을',
      'look back on|돌아보다|obj|my school days|학창 시절을',
      'map out|계획하다|obj|the route|경로를',
      'narrow down|압축하다|obj|the list|목록을',
      'opt out|빠지다|comp|of the program|프로그램에서',
      'own up to|인정하다|obj|the mistake|실수를',
      'phase out|단계적으로 없애다|obj|old machines|오래된 기계를',
      'play along|맞장구치다|comp|for fun|재미로',
      'point to|가리키다|obj|the map|지도를',
      'pull through|회복하다|comp|after surgery|수술 후에',
      'put up|세우다|obj|a tent|텐트를',
      'read through|끝까지 읽다|obj|the report|보고서를',
      'ring back|다시 전화하다|obj|my uncle|삼촌에게'
    ]
  },
  {
    id: 'phrasal-verbs-core-12',
    title: 'Final Practice Set',
    entries: [
      'roll out|출시하다|obj|the update|업데이트를',
      'rope in|끌어들이다|obj|a volunteer|자원봉사자를',
      'root for|응원하다|obj|our team|우리 팀을',
      'scare away|겁주어 쫓아내다|obj|the birds|새들을',
      'screen out|걸러 내다|obj|weak candidates|약한 지원자를',
      'settle for|감수하다|obj|a smaller room|더 작은 방을',
      'shop around|여러 곳을 둘러보다|comp|before buying|사기 전에',
      'shrug off|대수롭지 않게 넘기다|obj|the criticism|비판을',
      'size up|가늠하다|obj|the situation|상황을',
      'smooth over|수습하다|obj|the conflict|갈등을',
      'speak out|공개적으로 말하다|comp|about the issue|그 문제에 대해',
      'split up|헤어지다|comp|after the trip|여행 후에',
      'stand for|의미하다|obj|that symbol|그 상징을',
      'stay away|멀리하다|comp|from junk food|정크푸드에서',
      'stick around|계속 머물다|comp|after the show|공연 후에',
      'take over|인수하다|obj|the store|가게를',
      'talk through|차근차근 설명하다|obj|the process|과정을',
      'tear up|찢어 버리다|obj|the letter|편지를',
      'think back|되돌아보다|comp|on my childhood|어린 시절을',
      'top up|충전하다|obj|my card|내 카드를',
      'toss out|버리다|obj|old toys|오래된 장난감을',
      'touch on|간단히 언급하다|obj|the topic|그 주제를',
      'wear down|지치게 하다|obj|the staff|직원들을',
      'whip up|재빨리 만들다|obj|a snack|간식을',
      'wipe out|완전히 없애다|obj|the data|데이터를'
    ]
  }
];

const subjectPool = [
  { en: 'I', ko: '나는' },
  { en: 'We', ko: '우리는' },
  { en: 'My friend', ko: '내 친구는' },
  { en: 'They', ko: '그들은' }
];

const detailPool = [
  { en: 'at work', ko: '직장에서' },
  { en: 'after class', ko: '수업 후에' },
  { en: 'this week', ko: '이번 주에' },
  { en: 'before dinner', ko: '저녁 전에' },
  { en: 'in the morning', ko: '아침에' },
  { en: 'during practice', ko: '연습 중에' }
];

const timePool = [
  { en: 'today', ko: '오늘' },
  { en: 'every day', ko: '매일' },
  { en: 'at night', ko: '밤에' },
  { en: 'on weekends', ko: '주말마다' }
];

const ipaByToken = {
  a: '/ə/',
  about: '/əˈbaʊt/',
  across: '/əˈkrɔːs/',
  act: '/ækt/',
  add: '/æd/',
  after: '/ˈæftər/',
  ahead: '/əˈhed/',
  along: '/əˈlɔːŋ/',
  apart: '/əˈpɑːrt/',
  around: '/əˈraʊnd/',
  aside: '/əˈsaɪd/',
  ask: '/æsk/',
  away: '/əˈweɪ/',
  back: '/bæk/',
  bail: '/beɪl/',
  be: '/biː/',
  before: '/bɪˈfɔːr/',
  behind: '/bɪˈhaɪnd/',
  block: '/blɑːk/',
  blow: '/bloʊ/',
  boil: '/bɔɪl/',
  book: '/bʊk/',
  branch: '/bræntʃ/',
  break: '/breɪk/',
  bring: '/brɪŋ/',
  brush: '/brʌʃ/',
  build: '/bɪld/',
  buy: '/baɪ/',
  by: '/baɪ/',
  call: '/kɔːl/',
  calm: '/kɑːm/',
  carry: '/ˈkæri/',
  cash: '/kæʃ/',
  catch: '/kætʃ/',
  check: '/tʃek/',
  cheer: '/tʃɪr/',
  chip: '/tʃɪp/',
  clear: '/klɪr/',
  close: '/kloʊz/',
  come: '/kʌm/',
  count: '/kaʊnt/',
  crack: '/kræk/',
  cut: '/kʌt/',
  deal: '/diːl/',
  dig: '/dɪɡ/',
  do: '/duː/',
  down: '/daʊn/',
  drag: '/dræɡ/',
  draw: '/drɔː/',
  dress: '/dres/',
  drop: '/drɑːp/',
  ease: '/iːz/',
  eat: '/iːt/',
  end: '/end/',
  face: '/feɪs/',
  fall: '/fɔːl/',
  fight: '/faɪt/',
  figure: '/ˈfɪɡjər/',
  fill: '/fɪl/',
  filter: '/ˈfɪltər/',
  find: '/faɪnd/',
  finish: '/ˈfɪnɪʃ/',
  fit: '/fɪt/',
  focus: '/ˈfoʊkəs/',
  follow: '/ˈfɑːloʊ/',
  for: '/fɔːr/',
  forward: '/ˈfɔːrwərd/',
  from: '/frʌm/',
  gear: '/ɡɪr/',
  get: '/ɡet/',
  give: '/ɡɪv/',
  go: '/ɡoʊ/',
  grow: '/ɡroʊ/',
  hand: '/hænd/',
  hang: '/hæŋ/',
  head: '/hed/',
  hold: '/hoʊld/',
  in: '/ɪn/',
  into: '/ˈɪntuː/',
  iron: '/ˈaɪərn/',
  jump: '/dʒʌmp/',
  keep: '/kiːp/',
  kick: '/kɪk/',
  knock: '/nɑːk/',
  lay: '/leɪ/',
  lead: '/liːd/',
  lean: '/liːn/',
  leave: '/liːv/',
  let: '/let/',
  line: '/laɪn/',
  live: '/lɪv/',
  lock: '/lɑːk/',
  log: '/lɔːɡ/',
  look: '/lʊk/',
  make: '/meɪk/',
  map: '/mæp/',
  mix: '/mɪks/',
  move: '/muːv/',
  narrow: '/ˈnæroʊ/',
  nod: '/nɑːd/',
  of: '/əv/',
  off: '/ɔːf/',
  on: '/ɑːn/',
  open: '/ˈoʊpən/',
  opt: '/ɑːpt/',
  out: '/aʊt/',
  over: '/ˈoʊvər/',
  own: '/oʊn/',
  pass: '/pæs/',
  pay: '/peɪ/',
  phase: '/feɪz/',
  pick: '/pɪk/',
  plan: '/plæn/',
  play: '/pleɪ/',
  point: '/pɔɪnt/',
  print: '/prɪnt/',
  pull: '/pʊl/',
  put: '/pʊt/',
  reach: '/riːtʃ/',
  read: '/riːd/',
  ring: '/rɪŋ/',
  roll: '/roʊl/',
  root: '/ruːt/',
  rope: '/roʊp/',
  rule: '/ruːl/',
  run: '/rʌn/',
  save: '/seɪv/',
  scare: '/sker/',
  screen: '/skriːn/',
  see: '/siː/',
  sell: '/sel/',
  send: '/send/',
  set: '/set/',
  settle: '/ˈsetəl/',
  shop: '/ʃɑːp/',
  show: '/ʃoʊ/',
  shrug: '/ʃrʌɡ/',
  shut: '/ʃʌt/',
  sign: '/saɪn/',
  sit: '/sɪt/',
  size: '/saɪz/',
  sleep: '/sliːp/',
  smooth: '/smuːð/',
  sort: '/sɔːrt/',
  speak: '/spiːk/',
  speed: '/spiːd/',
  split: '/splɪt/',
  stand: '/stænd/',
  start: '/stɑːrt/',
  stay: '/steɪ/',
  step: '/step/',
  stick: '/stɪk/',
  stop: '/stɑːp/',
  sum: '/sʌm/',
  switch: '/swɪtʃ/',
  take: '/teɪk/',
  talk: '/tɔːk/',
  team: '/tiːm/',
  tear: '/ter/',
  think: '/θɪŋk/',
  through: '/θruː/',
  throw: '/θroʊ/',
  tidy: '/ˈtaɪdi/',
  together: '/təˈɡeðər/',
  to: '/tuː/',
  top: '/tɑːp/',
  toss: '/tɔːs/',
  touch: '/tʌtʃ/',
  track: '/træk/',
  try: '/traɪ/',
  tune: '/tuːn/',
  turn: '/tɝːn/',
  up: '/ʌp/',
  use: '/juːz/',
  wait: '/weɪt/',
  wake: '/weɪk/',
  walk: '/wɔːk/',
  warm: '/wɔːrm/',
  wash: '/wɑːʃ/',
  watch: '/wɑːtʃ/',
  wear: '/wer/',
  whip: '/wɪp/',
  while: '/waɪl/',
  wind: '/waɪnd/',
  win: '/wɪn/',
  with: '/wɪð/',
  without: '/wɪˈðaʊt/',
  work: '/wɝːk/',
  wrap: '/ræp/',
  write: '/raɪt/',
  wipe: '/waɪp/',
  zero: '/ˈzɪroʊ/',
  zone: '/zoʊn/',
  zoom: '/zuːm/'
};

const englishLocaleKeys = ['en', 'ja', 'zh', 'de'];

function toSlug(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseEntry(serialized) {
  const [term, meaning, type, focusEn, focusKo] = serialized.split('|');

  if (!term || !meaning || !type || !focusEn || !focusKo) {
    throw new Error(`Invalid entry: ${serialized}`);
  }

  return {
    term,
    meaning,
    type,
    focusEn,
    focusKo
  };
}

function buildIpa(term) {
  return term
    .split(' ')
    .map((token) => {
      const normalized = token.toLowerCase();
      const ipa = ipaByToken[normalized];

      if (!ipa) {
        throw new Error(`Missing IPA token: ${normalized}`);
      }

      return ipa.slice(1, -1);
    })
    .join(' ')
    .replace(/^/, '/')
    .replace(/$/, '/');
}

function conjugateKorean(dictionaryForm) {
  if (dictionaryForm.endsWith('하다')) {
    return `${dictionaryForm.slice(0, -2)}한다`;
  }
  if (dictionaryForm.endsWith('되다')) {
    return `${dictionaryForm.slice(0, -2)}된다`;
  }
  if (dictionaryForm.endsWith('있다')) {
    return dictionaryForm;
  }
  if (dictionaryForm.endsWith('오다')) {
    return `${dictionaryForm.slice(0, -2)}온다`;
  }
  if (dictionaryForm.endsWith('가다')) {
    return `${dictionaryForm.slice(0, -2)}간다`;
  }
  if (dictionaryForm.endsWith('서다')) {
    return `${dictionaryForm.slice(0, -2)}선다`;
  }
  if (dictionaryForm.endsWith('들다')) {
    return `${dictionaryForm.slice(0, -2)}든다`;
  }
  if (dictionaryForm.endsWith('보다')) {
    return `${dictionaryForm.slice(0, -2)}본다`;
  }
  if (dictionaryForm.endsWith('주다')) {
    return `${dictionaryForm.slice(0, -2)}준다`;
  }
  if (dictionaryForm.endsWith('나다')) {
    return `${dictionaryForm.slice(0, -2)}난다`;
  }
  if (dictionaryForm.endsWith('쓰다')) {
    return `${dictionaryForm.slice(0, -2)}쓴다`;
  }
  if (dictionaryForm.endsWith('끄다')) {
    return `${dictionaryForm.slice(0, -2)}끈다`;
  }
  if (dictionaryForm.endsWith('켜다')) {
    return `${dictionaryForm.slice(0, -2)}켠다`;
  }
  if (dictionaryForm.endsWith('치다')) {
    return `${dictionaryForm.slice(0, -2)}친다`;
  }
  if (dictionaryForm.endsWith('두다')) {
    return `${dictionaryForm.slice(0, -2)}둔다`;
  }
  if (dictionaryForm.endsWith('들르다')) {
    return `${dictionaryForm.slice(0, -3)}들른다`;
  }
  if (dictionaryForm.endsWith('고르다')) {
    return `${dictionaryForm.slice(0, -3)}고른다`;
  }
  if (dictionaryForm.endsWith('머물다')) {
    return `${dictionaryForm.slice(0, -3)}머문다`;
  }
  if (dictionaryForm.endsWith('살다')) {
    return `${dictionaryForm.slice(0, -2)}산다`;
  }
  if (dictionaryForm.endsWith('풀다')) {
    return `${dictionaryForm.slice(0, -2)}푼다`;
  }
  if (dictionaryForm.endsWith('끌다')) {
    return `${dictionaryForm.slice(0, -2)}끈다`;
  }
  if (dictionaryForm.endsWith('닮다')) {
    return `${dictionaryForm.slice(0, -2)}닮는다`;
  }
  if (dictionaryForm.endsWith('맡다')) {
    return `${dictionaryForm.slice(0, -2)}맡는다`;
  }
  if (dictionaryForm.endsWith('앉다')) {
    return `${dictionaryForm.slice(0, -2)}앉는다`;
  }
  if (dictionaryForm.endsWith('씻다')) {
    return `${dictionaryForm.slice(0, -2)}씻는다`;
  }
  if (dictionaryForm.endsWith('깨다')) {
    return `${dictionaryForm.slice(0, -2)}깬다`;
  }
  if (dictionaryForm.endsWith('세우다')) {
    return `${dictionaryForm.slice(0, -3)}세운다`;
  }
  if (dictionaryForm.endsWith('찾다')) {
    return `${dictionaryForm.slice(0, -2)}찾는다`;
  }
  if (dictionaryForm.endsWith('잡다')) {
    return `${dictionaryForm.slice(0, -2)}잡는다`;
  }
  if (dictionaryForm.endsWith('먹다')) {
    return `${dictionaryForm.slice(0, -2)}먹는다`;
  }
  if (dictionaryForm.endsWith('읽다')) {
    return `${dictionaryForm.slice(0, -2)}읽는다`;
  }
  if (dictionaryForm.endsWith('입다')) {
    return `${dictionaryForm.slice(0, -2)}입는다`;
  }
  if (dictionaryForm.endsWith('놓다')) {
    return `${dictionaryForm.slice(0, -2)}놓는다`;
  }
  if (dictionaryForm.endsWith('받다')) {
    return `${dictionaryForm.slice(0, -2)}받는다`;
  }
  if (dictionaryForm.endsWith('타다')) {
    return `${dictionaryForm.slice(0, -2)}탄다`;
  }
  if (dictionaryForm.endsWith('내다')) {
    return `${dictionaryForm.slice(0, -2)}낸다`;
  }
  if (dictionaryForm.endsWith('지다')) {
    return `${dictionaryForm.slice(0, -2)}진다`;
  }
  return `${dictionaryForm} 한다`;
}

function withPeriod(input) {
  return input.endsWith('.') ? input : `${input}.`;
}

function makeGoalSegments(blocks) {
  return blocks.map((block, index) => {
    if (index === blocks.length - 1) {
      return block;
    }

    return `${block} `;
  });
}

function makeDirectTranslations(goal, goalSegments) {
  return Object.fromEntries(
    englishLocaleKeys.map((locale) => [
      locale,
      {
        text: goal,
        segments: goalSegments,
        segmentBlockIndexes: goalSegments.map((_, index) => index)
      }
    ])
  );
}

function makeKoreanTranslationForObject(subject, objectKo, predicateKo) {
  return {
    text: `${subject.ko} ${objectKo} ${predicateKo}.`,
    segments: [`${subject.ko} `, `${objectKo} `, `${predicateKo}.`],
    segmentBlockIndexes: [0, 2, 1]
  };
}

function makeKoreanTranslationForObjectWithDetail(
  subject,
  detail,
  objectKo,
  predicateKo
) {
  return {
    text: `${subject.ko} ${detail.ko} ${objectKo} ${predicateKo}.`,
    segments: [`${subject.ko} `, `${detail.ko} `, `${objectKo} `, `${predicateKo}.`],
    segmentBlockIndexes: [0, 3, 2, 1]
  };
}

function makeKoreanTranslationForObjectWithTime(
  subject,
  detail,
  time,
  objectKo,
  predicateKo
) {
  return {
    text: `${time.ko} ${subject.ko} ${detail.ko} ${objectKo} ${predicateKo}.`,
    segments: [
      `${time.ko} `,
      `${subject.ko} `,
      `${detail.ko} `,
      `${objectKo} `,
      `${predicateKo}.`
    ],
    segmentBlockIndexes: [4, 0, 3, 2, 1]
  };
}

function makeKoreanTranslationForComp(subject, predicateKo) {
  return {
    text: `${subject.ko} ${predicateKo}.`,
    segments: [`${subject.ko} `, `${predicateKo}.`],
    segmentBlockIndexes: [0, 1]
  };
}

function makeKoreanTranslationForCompWithFocus(subject, focusKo, predicateKo) {
  return {
    text: `${subject.ko} ${focusKo} ${predicateKo}.`,
    segments: [`${subject.ko} `, `${focusKo} `, `${predicateKo}.`],
    segmentBlockIndexes: [0, 2, 1]
  };
}

function makeKoreanTranslationForCompWithTime(
  subject,
  focusKo,
  time,
  predicateKo
) {
  return {
    text: `${time.ko} ${subject.ko} ${focusKo} ${predicateKo}.`,
    segments: [`${time.ko} `, `${subject.ko} `, `${focusKo} `, `${predicateKo}.`],
    segmentBlockIndexes: [3, 0, 2, 1]
  };
}

function buildTranslations(goal, goalSegments, koTranslation) {
  return {
    ko: koTranslation,
    ...makeDirectTranslations(goal, goalSegments)
  };
}

function pickAlt(items, currentIndex, offset = 1) {
  return items[(currentIndex + offset) % items.length];
}

function buildCurriculum() {
  return unitDefinitions.map((unitDefinition, unitIndex) => {
    const entries = unitDefinition.entries.map(parseEntry);

    return {
      id: unitDefinition.id,
      language: 'en',
      standardLevel: 'phrasal_verbs',
      level: 7,
      order: unitIndex + 1,
      title: unitDefinition.title,
      words: entries.map((entry, entryIndex) => {
        const subject = subjectPool[(unitIndex + entryIndex) % subjectPool.length];
        const example =
          entry.type === 'obj'
            ? `${subject.en} ${entry.term} ${entry.focusEn}.`
            : `${subject.en} ${entry.term} ${entry.focusEn}.`;
        const distractorSource = [
          pickAlt(entries, entryIndex, 1)?.term,
          pickAlt(entries, entryIndex, 2)?.term,
          pickAlt(entries, entryIndex, 3)?.term
        ].filter((term) => Boolean(term) && term !== entry.term);

        return {
          id: toSlug(entry.term),
          term: entry.term,
          meaning: entry.meaning,
          example,
          reading: buildIpa(entry.term),
          partOfSpeech: 'verb',
          quiz: {
            distractors: distractorSource.slice(0, 3)
          }
        };
      })
    };
  });
}

function createStage(stageInput) {
  const { blocks, title, focus, selectionAdvice, completionAdvice, distractorTexts, goal, koTranslation, stageId } =
    stageInput;
  const goalSegments = makeGoalSegments(blocks.map((block) => block.text));

  return {
    id: stageId,
    title,
    goal,
    goalSegments,
    goalTranslations: buildTranslations(goal, goalSegments, koTranslation),
    focus,
    selectionAdvice,
    completionAdvice,
    correctBlocks: blocks,
    distractorBlocks: distractorTexts.map((item, index) => ({
      id: `${stageId}-d${index + 1}`,
      text: item.text,
      advice: item.advice
    }))
  };
}

function buildSentenceExercises() {
  const flattenedEntries = unitDefinitions.flatMap((unitDefinition) =>
    unitDefinition.entries.map((serialized, indexInUnit) => ({
      unitId: unitDefinition.id,
      unitTitle: unitDefinition.title,
      indexInUnit,
      entry: parseEntry(serialized)
    }))
  );

  return flattenedEntries.map((item, index) => {
    const subject = subjectPool[index % subjectPool.length];
    const detail = detailPool[index % detailPool.length];
    const time = timePool[index % timePool.length];
    const predicateKo = conjugateKorean(item.entry.meaning);
    const next = flattenedEntries[(index + 1) % flattenedEntries.length].entry;
    const nextTwo = flattenedEntries[(index + 2) % flattenedEntries.length].entry;
    const exerciseId = `phrasal-verbs-${String(index + 1).padStart(3, '0')}`;
    const title = `Phrasal Verb Practice ${String(index + 1).padStart(3, '0')}`;
    const description =
      'Build a natural English sentence with a phrasal verb step by step.';

    if (item.entry.type === 'obj') {
      const stage1Blocks = [
        { id: `${exerciseId}-s1-b1`, text: subject.en },
        { id: `${exerciseId}-s1-b2`, text: item.entry.term },
        { id: `${exerciseId}-s1-b3`, text: withPeriod(item.entry.focusEn) }
      ];
      const stage1Goal = `${subject.en} ${item.entry.term} ${item.entry.focusEn}.`;

      const stage2Blocks = [
        { id: `${exerciseId}-s2-b1`, text: subject.en },
        { id: `${exerciseId}-s2-b2`, text: item.entry.term },
        { id: `${exerciseId}-s2-b3`, text: item.entry.focusEn },
        { id: `${exerciseId}-s2-b4`, text: withPeriod(detail.en) }
      ];
      const stage2Goal = `${subject.en} ${item.entry.term} ${item.entry.focusEn} ${detail.en}.`;

      const stage3Blocks = [
        { id: `${exerciseId}-s3-b1`, text: subject.en },
        { id: `${exerciseId}-s3-b2`, text: item.entry.term },
        { id: `${exerciseId}-s3-b3`, text: item.entry.focusEn },
        { id: `${exerciseId}-s3-b4`, text: detail.en },
        { id: `${exerciseId}-s3-b5`, text: withPeriod(time.en) }
      ];
      const stage3Goal = `${subject.en} ${item.entry.term} ${item.entry.focusEn} ${detail.en} ${time.en}.`;

      return {
        id: exerciseId,
        language: 'en',
        level: 'phrasal_verbs',
        title,
        description,
        stages: [
          createStage({
            stageId: `${exerciseId}-stage-1`,
            title: 'Step 1',
            goal: stage1Goal,
            blocks: stage1Blocks,
            focus: 'subject + phrasal verb + object',
            selectionAdvice: 'Start with the subject, then add the phrasal verb and object.',
            completionAdvice: 'Good. Add a context phrase next.',
            koTranslation: makeKoreanTranslationForObject(
              subject,
              item.entry.focusKo,
              predicateKo
            ),
            distractorTexts: [
              {
                text: next.term,
                advice: 'Choose the target phrasal verb for this sentence.'
              },
              {
                text: withPeriod(next.focusEn),
                advice: 'Choose the target object for this sentence.'
              }
            ]
          }),
          createStage({
            stageId: `${exerciseId}-stage-2`,
            title: 'Step 2',
            goal: stage2Goal,
            blocks: stage2Blocks,
            focus: 'add a context phrase',
            selectionAdvice: 'Keep the object before the context phrase.',
            completionAdvice: 'Good. Add the time expression last.',
            koTranslation: makeKoreanTranslationForObjectWithDetail(
              subject,
              detail,
              item.entry.focusKo,
              predicateKo
            ),
            distractorTexts: [
              {
                text: nextTwo.focusEn,
                advice: 'Use the target object for this sentence.'
              },
              {
                text: withPeriod(pickAlt(detailPool, index).en),
                advice: 'Use the target context phrase here.'
              }
            ]
          }),
          createStage({
            stageId: `${exerciseId}-stage-3`,
            title: 'Step 3',
            goal: stage3Goal,
            blocks: stage3Blocks,
            focus: 'add the time expression at the end',
            selectionAdvice: 'Place the time expression after the context phrase.',
            completionAdvice: 'Sentence complete.',
            koTranslation: makeKoreanTranslationForObjectWithTime(
              subject,
              detail,
              time,
              item.entry.focusKo,
              predicateKo
            ),
            distractorTexts: [
              {
                text: next.term,
                advice: 'Keep the target phrasal verb in this sentence.'
              },
              {
                text: withPeriod(pickAlt(timePool, index).en),
                advice: 'Use the target time expression for this step.'
              }
            ]
          })
        ]
      };
    }

    const stage1Blocks = [
      { id: `${exerciseId}-s1-b1`, text: subject.en },
      { id: `${exerciseId}-s1-b2`, text: withPeriod(item.entry.term) }
    ];
    const stage1Goal = `${subject.en} ${item.entry.term}.`;

    const stage2Blocks = [
      { id: `${exerciseId}-s2-b1`, text: subject.en },
      { id: `${exerciseId}-s2-b2`, text: item.entry.term },
      { id: `${exerciseId}-s2-b3`, text: withPeriod(item.entry.focusEn) }
    ];
    const stage2Goal = `${subject.en} ${item.entry.term} ${item.entry.focusEn}.`;

    const stage3Blocks = [
      { id: `${exerciseId}-s3-b1`, text: subject.en },
      { id: `${exerciseId}-s3-b2`, text: item.entry.term },
      { id: `${exerciseId}-s3-b3`, text: item.entry.focusEn },
      { id: `${exerciseId}-s3-b4`, text: withPeriod(time.en) }
    ];
    const stage3Goal = `${subject.en} ${item.entry.term} ${item.entry.focusEn} ${time.en}.`;

    return {
      id: exerciseId,
      language: 'en',
      level: 'phrasal_verbs',
      title,
      description,
      stages: [
        createStage({
          stageId: `${exerciseId}-stage-1`,
          title: 'Step 1',
          goal: stage1Goal,
          blocks: stage1Blocks,
          focus: 'subject + phrasal verb',
          selectionAdvice: 'Start with the subject, then choose the phrasal verb.',
          completionAdvice: 'Good. Add the context phrase next.',
          koTranslation: makeKoreanTranslationForComp(subject, predicateKo),
          distractorTexts: [
            {
              text: next.term,
              advice: 'Choose the target phrasal verb for this sentence.'
            },
            {
              text: pickAlt(subjectPool, index).en,
              advice: 'Choose the target subject first.'
            }
          ]
        }),
        createStage({
          stageId: `${exerciseId}-stage-2`,
          title: 'Step 2',
          goal: stage2Goal,
          blocks: stage2Blocks,
          focus: 'add the context phrase',
          selectionAdvice: 'Place the context phrase after the phrasal verb.',
          completionAdvice: 'Good. Add the time expression last.',
          koTranslation: makeKoreanTranslationForCompWithFocus(
            subject,
            item.entry.focusKo,
            predicateKo
          ),
          distractorTexts: [
            {
              text: withPeriod(pickAlt(detailPool, index).en),
              advice: 'Use the target context phrase for this sentence.'
            },
            {
              text: next.term,
              advice: 'Keep the target phrasal verb here.'
            }
          ]
        }),
        createStage({
          stageId: `${exerciseId}-stage-3`,
          title: 'Step 3',
          goal: stage3Goal,
          blocks: stage3Blocks,
          focus: 'add the time expression at the end',
          selectionAdvice: 'Finish the sentence with the time expression.',
          completionAdvice: 'Sentence complete.',
          koTranslation: makeKoreanTranslationForCompWithTime(
            subject,
            item.entry.focusKo,
            time,
            predicateKo
          ),
          distractorTexts: [
            {
              text: withPeriod(pickAlt(timePool, index).en),
              advice: 'Use the target time expression for this step.'
            },
            {
              text: next.term,
              advice: 'Keep the target phrasal verb in this sentence.'
            }
          ]
        })
      ]
    };
  });
}

async function main() {
  const curriculum = buildCurriculum();
  const sentenceExercises = buildSentenceExercises();

  if (curriculum.flatMap((unit) => unit.words).length !== 300) {
    throw new Error('Expected exactly 300 phrasal verbs.');
  }

  if (sentenceExercises.length !== 300) {
    throw new Error('Expected exactly 300 sentence exercises.');
  }

  await fs.writeFile(curriculumOutputPath, `${JSON.stringify(curriculum, null, 2)}\n`);
  await fs.writeFile(
    sentenceOutputPath,
    `${JSON.stringify(sentenceExercises, null, 2)}\n`
  );

  console.log(
    `Generated ${curriculum.flatMap((unit) => unit.words).length} phrasal verbs and ${sentenceExercises.length} sentence exercises.`
  );
}

await main();
