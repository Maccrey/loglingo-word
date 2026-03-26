const fs = require('fs');
const path = require('path');

const stages = {
  junior: "An active juvenile cream-colored junior cat",
  adult: "A fully-grown, elegant cream-colored adult cat",
  "middle-age": "A middle-aged, comfortable-looking cream-colored cat with a slightly softer body",
  senior: "An elderly, gentle senior cream-colored cat with very soft, fluffy fur",
  veteran: "A highly dignified, majestic veteran cream-colored cat with wise eyes"
};

const statuses = {
  hungry: "looking very hungry and expectant, with an empty food bowl nearby. Mood: hungry, begging.",
  smelly: "looking a bit dirty, with subtle small dust or smelly lines around it. Mood: needs a bath but still cute.",
  stressed: "with ears slightly lowered, expressing stress or annoyance, looking tense. Mood: stressed, annoyed, needs playtime.",
  sick: "looking unwell, with a subtle thermometer or tissue, looking droopy but no gore. Mood: sick, needs medicine.",
  critical: "looking very weak and urgently needing help, with a glowing red warning-like ambiance around. Mood: critical, urgent, needs immediate care.",
  dead: "sleeping very deeply like an angel with a small subtle halo, presented in a faded, slightly grayscale or sepia tone. Mood: peaceful, sad, memorial."
};

const dir = path.join(__dirname, 'assets/prompts/nano-banana/cats');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

for (const [stage, desc] of Object.entries(stages)) {
  for (const [status, statDesc] of Object.entries(statuses)) {
    const prompt = `Create a 2D mobile game pet care status screen.
${desc} ${statDesc} Amber eyes, wearing a blue collar.
Scene: notebook-themed learning room, soft paper textures, cozy study desk corner.
Style: warm casual tamagotchi-like game illustration, expressive face, consistent character design, soft shading.
No text, no watermark.`;
    fs.writeFileSync(path.join(dir, `${stage}-${status}.txt`), prompt.trim());
  }
}
console.log('Successfully wrote 30 prompt files.');
