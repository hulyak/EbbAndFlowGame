import { redis } from '@devvit/web/server';
import type { PuzzleChain, Riddle, RiddleType, RiddleDifficulty, UserStats, AttemptResult } from '../../shared/types/api';

const CHAIN_KEY = 'reddit-riddles:chain';
const USER_STATS_KEY = 'reddit-riddles:user';
const DAILY_ATTEMPTS_KEY = 'reddit-riddles:daily';

// Game configuration
const DAILY_ATTEMPT_LIMIT = 10; // Each user gets 10 attempts per day
const MAX_RIDDLE_ATTEMPTS = 3; // 3 tries per riddle before it locks

// Scoring system based on difficulty and attempts
const BASE_SCORES = {
  easy: 25,
  medium: 50,
  hard: 100,
  expert: 200,
};

// Riddle generation system - multiple approaches for infinite content
const RIDDLE_GENERATORS = {
  // Math sequence generators
  generateFibonacci: (start: number = 1) => ({
    question: `What are the next two numbers in this sequence? ${start}, ${start}, ${start * 2}, ${start * 3}, ${start * 5}, ${start * 8}, ?, ?`,
    answer: `${start * 13}, ${start * 21}`,
    type: 'sequence' as RiddleType,
    difficulty: 'medium' as RiddleDifficulty,
  }),

  // Word transformation generators
  generateWordLadder: (start: string, end: string, steps: string[]) => ({
    question: `Transform "${start}" into "${end}" by changing one letter at a time. Each step must be a valid word. How many steps minimum?`,
    answer: steps.length.toString(),
    type: 'wordplay' as RiddleType,
    difficulty: 'hard' as RiddleDifficulty,
  }),

  // Logic puzzle generators
  generateWeighingPuzzle: (items: number, different: number) => ({
    question: `You have ${items} identical-looking objects. ${different} of them weigh differently. Using a balance scale, what's the minimum number of weighings needed to identify all different objects?`,
    answer: Math.ceil(Math.log(items) / Math.log(3)).toString(),
    type: 'logic' as RiddleType,
    difficulty: 'expert' as RiddleDifficulty,
  }),
};

// Community-generated riddle system
const COMMUNITY_RIDDLE_TEMPLATES = {
  // Users can submit riddles that get reviewed and added
  userSubmissions: [],

  // AI-generated riddles based on patterns
  aiGenerated: [],

  // Seasonal/themed riddles
  seasonal: {
    winter: [],
    spring: [],
    summer: [],
    fall: [],
    holidays: [],
  },

  // Difficulty-scaled versions of base riddles
  scaledVersions: [],
};

// Base riddle templates that can be modified and expanded
const RIDDLE_TEMPLATES = {
  detective_mystery: {
    title: "🕵️ The Mystery of the Missing Logic",
    description: "A series of puzzles has appeared, each more challenging than the last. Use your wits to solve them all!",
    theme: "detective",
    riddles: [
      {
        id: "entry_1",
        type: "logic" as RiddleType,
        difficulty: "easy" as RiddleDifficulty,
        question: "A man lives on the 20th floor of an apartment building. Every morning he takes the elevator down to the ground floor. When he comes home, he takes the elevator to the 10th floor and walks the rest of the way... except on rainy days, when he takes the elevator all the way to the 20th floor. Why?",
        correctAnswer: "he's too short",
        alternativeAnswers: ["short", "can't reach", "height", "too short to reach button", "can't reach the button"],
        explanation: "He's too short to reach the button for the 20th floor, but can reach the 10th floor button. On rainy days, he has an umbrella to help him reach higher.",
        misdirection: "You might think it's about exercise or preference, but it's a physical limitation.",
        points: 25,
        unlocks: ["logic_1", "wordplay_1"],
        requires: [],
        category: "Classic Logic",
        maxAttempts: 3,
      },
      {
        id: "logic_1",
        type: "logic" as RiddleType,
        difficulty: "medium" as RiddleDifficulty,
        question: "You have 12 balls that look identical. 11 weigh the same, but one is either heavier or lighter. Using a balance scale only 3 times, how do you find the different ball and determine if it's heavier or lighter?",
        correctAnswer: "divide into groups of 4",
        alternativeAnswers: ["split into 4s", "groups of 4", "4-4-4", "three groups of four"],
        explanation: "Divide into 3 groups of 4. Weigh two groups - if balanced, the odd ball is in the third group. If unbalanced, it's in the heavier/lighter group. Then use similar logic to narrow down.",
        hint: "Think about dividing the balls into equal groups and using process of elimination.",
        points: 50,
        unlocks: ["cipher_1"],
        requires: ["entry_1"],
        category: "Logic Puzzle",
        maxAttempts: 3,
      },
      {
        id: "wordplay_1",
        type: "wordplay" as RiddleType,
        difficulty: "medium" as RiddleDifficulty,
        question: "I'm a 6-letter word. Remove my first letter, I'm a crime. Remove my first two letters, I'm an animal. Remove my first and last letters, I'm a form of music. What am I?",
        correctAnswer: "grapes",
        alternativeAnswers: ["grape"],
        explanation: "GRAPES → RAPES (crime) → APES (animal) → RAPE → RAP (music)",
        misdirection: "Don't overthink it - it's simpler than you might expect.",
        points: 50,
        unlocks: ["lateral_1"],
        requires: ["entry_1"],
        category: "Word Puzzle",
        maxAttempts: 3,
      },
      {
        id: "cipher_1",
        type: "cipher" as RiddleType,
        difficulty: "hard" as RiddleDifficulty,
        question: "Decode this secret message: 'WKLV LV D VHFUHW PHVVDJH' (Hint: Caesar's favorite number is 3)",
        correctAnswer: "THIS IS A SECRET MESSAGE",
        alternativeAnswers: ["this is a secret message", "thisisasecretmessage"],
        explanation: "It's a Caesar cipher with a shift of 3. W→T, K→H, L→I, V→S, etc.",
        hint: "Julius Caesar used this cipher with a shift of 3 positions in the alphabet.",
        points: 100,
        unlocks: ["sequence_1"],
        requires: ["logic_1"],
        category: "Cryptography",
        maxAttempts: 3,
      },
      {
        id: "lateral_1",
        type: "lateral" as RiddleType,
        difficulty: "hard" as RiddleDifficulty,
        question: "A woman shoots her husband, then holds him underwater for 5 minutes. Next, she hangs him. Right after, they go out for a lovely dinner. How is this possible?",
        correctAnswer: "photography",
        alternativeAnswers: ["photo", "photograph", "camera", "developing photos", "darkroom"],
        explanation: "She's a photographer! She shoots him with a camera, develops the photo in water, and hangs it to dry.",
        misdirection: "The violent imagery is designed to make you think of actual harm, but it's all photography terms.",
        points: 100,
        unlocks: ["math_1"],
        requires: ["wordplay_1"],
        category: "Lateral Thinking",
        maxAttempts: 3,
      },
      {
        id: "sequence_1",
        type: "sequence" as RiddleType,
        difficulty: "expert" as RiddleDifficulty,
        question: "What comes next in this sequence? 1, 1, 2, 3, 5, 8, 13, 21, ?, ?",
        correctAnswer: "34, 55",
        alternativeAnswers: ["34 55", "34,55", "34 and 55", "thirty-four fifty-five"],
        explanation: "It's the Fibonacci sequence: each number is the sum of the two preceding ones. 13+21=34, 21+34=55",
        hint: "Each number is related to the two before it. Look for a mathematical relationship.",
        points: 200,
        unlocks: ["final_riddle"],
        requires: ["cipher_1"],
        category: "Pattern Recognition",
        maxAttempts: 3,
      },
      {
        id: "math_1",
        type: "math" as RiddleType,
        difficulty: "expert" as RiddleDifficulty,
        question: "If you have a pond with lily pads that double in coverage every day, and it takes 30 days to cover the entire pond, on what day was the pond half covered? (There's a twist...)",
        correctAnswer: "29",
        alternativeAnswers: ["day 29", "29th day", "twenty-nine", "29th"],
        explanation: "Day 29! If the coverage doubles each day and the pond is fully covered on day 30, then it was half covered the day before. The 'twist' was just misdirection!",
        misdirection: "The mention of a 'twist' is designed to make you overthink a straightforward exponential growth problem.",
        points: 200,
        unlocks: ["final_riddle"],
        requires: ["lateral_1"],
        category: "Mathematical Logic",
        maxAttempts: 3,
      },
      {
        id: "final_riddle",
        type: "riddle" as RiddleType,
        difficulty: "expert" as RiddleDifficulty,
        question: "I am the beginning of eternity, the end of time and space, the beginning of every end, and the end of every place. What am I?",
        correctAnswer: "e",
        alternativeAnswers: ["the letter e", "letter e"],
        explanation: "The letter 'E' - it's at the beginning of 'eternity', end of 'time' and 'space', beginning of 'end', and end of 'place'.",
        hint: "Think literally about the words in the riddle.",
        points: 300,
        unlocks: [],
        requires: ["sequence_1", "math_1"],
        category: "Classic Riddle",
        maxAttempts: 3,
      },
    ],
    finalReveal: "🎉 MYSTERY SOLVED! You've proven that the greatest puzzles can be solved through collective intelligence and creative thinking. The real treasure was the mental exercise along the way!",
  },

  space_adventure: {
    title: "🚀 Cosmic Brain Challenge",
    description: "Journey through the cosmos solving mind-bending puzzles from across the galaxy!",
    theme: "space",
    riddles: [
      {
        id: "space_entry",
        type: "logic" as RiddleType,
        difficulty: "easy" as RiddleDifficulty,
        question: "An astronaut drops a hammer on the Moon. It falls to the ground in 2 seconds. On Earth, the same hammer would fall in 0.8 seconds. Why does it take longer on the Moon?",
        correctAnswer: "less gravity",
        alternativeAnswers: ["lower gravity", "weaker gravity", "moon gravity", "gravity difference"],
        explanation: "The Moon has about 1/6th the gravity of Earth, so objects fall more slowly.",
        points: 25,
        unlocks: ["space_logic", "space_math"],
        requires: [],
        category: "Space Physics",
        maxAttempts: 3,
      },
      {
        id: "space_logic",
        type: "logic" as RiddleType,
        difficulty: "medium" as RiddleDifficulty,
        question: "A space station has 3 airlocks. Each can be opened from inside or outside, but never both at once. If all 3 are opened from outside simultaneously, what happens to the air inside?",
        correctAnswer: "nothing",
        alternativeAnswers: ["stays the same", "no change", "remains unchanged"],
        explanation: "If opened from outside, the airlocks prevent air from escaping - they're designed as one-way systems for safety.",
        hint: "Think about how airlocks are designed to work.",
        points: 50,
        unlocks: ["space_cipher"],
        requires: ["space_entry"],
        category: "Space Engineering",
        maxAttempts: 3,
      },
      {
        id: "space_math",
        type: "math" as RiddleType,
        difficulty: "medium" as RiddleDifficulty,
        question: "A spacecraft travels at 0.1c (10% speed of light) to a star 10 light-years away. How long does the journey take from Earth's perspective?",
        correctAnswer: "100 years",
        alternativeAnswers: ["100", "one hundred years", "a century"],
        explanation: "Distance ÷ Speed = Time. 10 light-years ÷ 0.1c = 100 years.",
        points: 50,
        unlocks: ["space_sequence"],
        requires: ["space_entry"],
        category: "Space Mathematics",
        maxAttempts: 3,
      },
      {
        id: "space_cipher",
        type: "cipher" as RiddleType,
        difficulty: "hard" as RiddleDifficulty,
        question: "Decode this alien message: 'VSDFH WUDYHO LV GDQJHURXV' (Hint: Ancient Earth encryption)",
        correctAnswer: "SPACE TRAVEL IS DANGEROUS",
        alternativeAnswers: ["space travel is dangerous"],
        explanation: "Caesar cipher with shift of 3: V→S, S→P, D→A, F→C, H→E, etc.",
        hint: "Caesar cipher with shift of 3 positions.",
        points: 100,
        unlocks: ["space_final"],
        requires: ["space_logic"],
        category: "Alien Communication",
        maxAttempts: 3,
      },
      {
        id: "space_sequence",
        type: "sequence" as RiddleType,
        difficulty: "hard" as RiddleDifficulty,
        question: "Planetary distances from sun: Mercury 0.4, Venus 0.7, Earth 1.0, Mars 1.5, Jupiter 5.2, Saturn 9.5, Uranus ?, Neptune ?",
        correctAnswer: "19.2, 30.1",
        alternativeAnswers: ["19.2 30.1", "19.2,30.1", "19.2 and 30.1"],
        explanation: "These are the actual distances in Astronomical Units (AU) from the Sun.",
        hint: "This follows the real distances of planets in our solar system.",
        points: 100,
        unlocks: ["space_final"],
        requires: ["space_math"],
        category: "Astronomy",
        maxAttempts: 3,
      },
      {
        id: "space_final",
        type: "riddle" as RiddleType,
        difficulty: "expert" as RiddleDifficulty,
        question: "I am not alive, but I grow. I don't have lungs, but I need air. I don't have a mouth, but water kills me. In space, I cannot exist. What am I?",
        correctAnswer: "fire",
        alternativeAnswers: ["flame"],
        explanation: "Fire grows by consuming fuel, needs oxygen from air, is extinguished by water, and cannot exist in the vacuum of space.",
        hint: "Think about something that needs oxygen but isn't alive.",
        points: 200,
        unlocks: [],
        requires: ["space_cipher", "space_sequence"],
        category: "Cosmic Riddle",
        maxAttempts: 3,
      },
    ],
    finalReveal: "🚀 MISSION ACCOMPLISHED! You've navigated the cosmos of knowledge and proven that no puzzle is too vast for collective human intelligence!",
  },

  ancient_secrets: {
    title: "🏛️ Ancient Wisdom Challenge",
    description: "Unlock the secrets of ancient civilizations through timeless puzzles and riddles!",
    theme: "ancient",
    riddles: [
      {
        id: "ancient_entry",
        type: "riddle" as RiddleType,
        difficulty: "easy" as RiddleDifficulty,
        question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
        correctAnswer: "map",
        alternativeAnswers: ["a map", "chart"],
        explanation: "A map shows geographical features but not the living things or structures within them.",
        points: 25,
        unlocks: ["ancient_logic", "ancient_wordplay"],
        requires: [],
        category: "Ancient Wisdom",
        maxAttempts: 3,
      },
      {
        id: "ancient_logic",
        type: "logic" as RiddleType,
        difficulty: "medium" as RiddleDifficulty,
        question: "A pharaoh has 100 slaves. He lines them up and puts a hat on each - either black or white, randomly. Each slave can see all the hats in front of them but not their own. Starting from the back, each must say 'black' or 'white'. How can they save the most lives?",
        correctAnswer: "first person counts",
        alternativeAnswers: ["count system", "counting strategy", "first counts odd/even"],
        explanation: "The first person counts the black hats they see. If odd, they say 'black', if even 'white'. Others use this info to deduce their hat color.",
        hint: "The first person can give information to help the others.",
        points: 75,
        unlocks: ["ancient_math"],
        requires: ["ancient_entry"],
        category: "Ancient Logic",
        maxAttempts: 3,
      },
      {
        id: "ancient_wordplay",
        type: "wordplay" as RiddleType,
        difficulty: "medium" as RiddleDifficulty,
        question: "What 8-letter word can have a letter taken away and it still makes a word? Take another letter away and it still makes a word. Keep on doing that until you have one letter left. What is the word?",
        correctAnswer: "starting",
        alternativeAnswers: ["startling"],
        explanation: "STARTING → STARING → STRING → STING → SING → SIN → IN → I",
        misdirection: "There might be multiple valid answers, but this is the most elegant one.",
        points: 75,
        unlocks: ["ancient_cipher"],
        requires: ["ancient_entry"],
        category: "Ancient Wordcraft",
        maxAttempts: 3,
      },
      {
        id: "ancient_final",
        type: "lateral" as RiddleType,
        difficulty: "expert" as RiddleDifficulty,
        question: "A man lives in a 30-story building. Every day he takes the elevator to the 1st floor. When he comes home, he takes the elevator to the 20th floor and walks the rest of the way... except on rainy days, when he takes the elevator all the way up. Why?",
        correctAnswer: "he's short",
        alternativeAnswers: ["too short", "can't reach", "height", "short person"],
        explanation: "He's too short to reach the button for the 30th floor, but can reach the 20th. On rainy days, he has an umbrella to help him reach higher.",
        hint: "Think about physical limitations and how weather might help.",
        points: 150,
        unlocks: [],
        requires: ["ancient_logic", "ancient_wordplay"],
        category: "Ancient Mystery",
        maxAttempts: 3,
      },
    ],
    finalReveal: "🏛️ ANCIENT WISDOM UNLOCKED! You have proven worthy of the greatest secrets, showing that timeless puzzles yield to timeless intelligence!",
  }
};

// Riddle content management system
class RiddleContentManager {
  // Generate new riddles dynamically
  static generateDailyRiddles(): Riddle[] {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // Use date as seed for consistent daily riddles
    const riddles: Riddle[] = [];

    // Generate math sequences
    const fibStart = (seed % 10) + 1;
    const fibRiddle = RIDDLE_GENERATORS.generateFibonacci(fibStart);
    riddles.push({
      id: `daily_fib_${seed}`,
      ...fibRiddle,
      state: 'available',
      attempts: 0,
      points: 75,
      unlocks: [],
      requires: [],
      category: 'Daily Challenge',
      maxAttempts: 3,
      correctAnswer: fibRiddle.answer,
    });

    return riddles;
  }

  // Rotate riddle chains daily for testing, weekly for production
  static getWeeklyChain(): string {
    // For testing: change daily. For production: change weekly
    const dayNumber = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    const chains = ['detective_mystery', 'space_adventure', 'ancient_secrets'];
    return chains[dayNumber % chains.length];
  }

  // Scale difficulty based on community performance
  static adjustDifficultyBasedOnCommunity(baseRiddle: any, communitySuccessRate: number): any {
    if (communitySuccessRate > 0.8) {
      // Too easy, make harder
      return {
        ...baseRiddle,
        maxAttempts: Math.max(1, baseRiddle.maxAttempts - 1),
        points: baseRiddle.points + 25,
        difficulty: baseRiddle.difficulty === 'easy' ? 'medium' :
          baseRiddle.difficulty === 'medium' ? 'hard' : 'expert',
      };
    } else if (communitySuccessRate < 0.3) {
      // Too hard, make easier
      return {
        ...baseRiddle,
        maxAttempts: baseRiddle.maxAttempts + 1,
        hint: baseRiddle.hint || "Think step by step and consider simpler solutions.",
        points: Math.max(10, baseRiddle.points - 15),
      };
    }
    return baseRiddle;
  }

  // Generate themed riddle chains
  static generateThemedChain(theme: string): any {
    const themes = {
      space_adventure: {
        title: "🚀 Cosmic Puzzle Expedition",
        description: "Journey through space and time with mind-bending puzzles from across the galaxy!",
        riddles: [
          {
            question: "An astronaut drops a wrench in space. It falls 'down' toward the space station. Why?",
            answer: "artificial gravity",
            explanation: "The space station is rotating to create artificial gravity through centrifugal force.",
            type: 'logic',
            difficulty: 'medium',
          },
          {
            question: "If you travel at light speed for 1 year and return, how much time passed on Earth?",
            answer: "infinite",
            explanation: "At light speed, time dilation approaches infinity - this is a trick question as nothing with mass can reach light speed.",
            type: 'lateral',
            difficulty: 'expert',
          }
        ]
      },
      ancient_secrets: {
        title: "🏛️ Ancient Mysteries Unveiled",
        description: "Solve puzzles that have challenged minds for millennia!",
        riddles: [
          {
            question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
            answer: "map",
            explanation: "A map shows cities, mountains, and water, but not the living things within them.",
            type: 'riddle',
            difficulty: 'easy',
          }
        ]
      }
    };

    return themes[theme as keyof typeof themes] || themes.space_adventure;
  }
}

export class RiddleManager {
  private static async saveChain(chain: PuzzleChain): Promise<void> {
    await redis.set(CHAIN_KEY, JSON.stringify(chain));
  }

  private static async createNewChain(): Promise<PuzzleChain> {
    // Determine which chain to create based on time/community
    const currentChainType = RiddleContentManager.getWeeklyChain();

    // Get template from our available templates
    const template = RIDDLE_TEMPLATES[currentChainType as keyof typeof RIDDLE_TEMPLATES] || RIDDLE_TEMPLATES.detective_mystery;

    // Add daily bonus riddles
    const dailyRiddles = RiddleContentManager.generateDailyRiddles();

    const riddles: Riddle[] = [
      ...template.riddles.map((r: any) => ({
        ...r,
        state: r.requires.length === 0 ? 'available' : 'locked',
        attempts: 0,
      })),
      ...dailyRiddles
    ];

    const chain: PuzzleChain = {
      id: `chain-${Date.now()}-${currentChainType}`,
      title: template.title,
      description: template.description,
      theme: template.theme || 'mystery',
      totalRiddles: riddles.length,
      solvedRiddles: 0,
      status: 'active',
      createdAt: Date.now(),
      riddles,
      storyProgression: [
        "🔍 The challenge begins...",
        "🧩 Patterns are emerging...",
        "💡 Understanding grows...",
        "🎯 The solution is near...",
        "🏆 Almost there...",
        "🎉 Challenge complete!",
      ],
      finalReveal: template.finalReveal,
    };

    console.log(`Creating new riddle chain: ${currentChainType} with ${riddles.length} riddles`);
    await this.saveChain(chain);
    return chain;
  }

  private static async getUserStats(username: string): Promise<UserStats> {
    const userKey = `${USER_STATS_KEY}:${username}`;
    const userData = await redis.get(userKey);

    if (!userData) {
      const newUser: UserStats = {
        username,
        riddlesSolved: 0,
        totalScore: 0,
        averageDifficulty: 0,
        specialtiesUnlocked: [],
        lastSolveTime: 0,
        dailyAttemptsUsed: 0,
        rank: 0,
        achievements: [],
        currentStreak: 0,
        longestStreak: 0,
      };
      await redis.set(userKey, JSON.stringify(newUser));
      return newUser;
    }

    return JSON.parse(userData);
  }

  private static async saveUserStats(userStats: UserStats): Promise<void> {
    const userKey = `${USER_STATS_KEY}:${userStats.username}`;
    await redis.set(userKey, JSON.stringify(userStats));
  }

  private static async getDailyAttemptsUsed(username: string): Promise<number> {
    const today = new Date().toDateString();
    const dailyKey = `${DAILY_ATTEMPTS_KEY}:${username}:${today}`;
    const count = await redis.get(dailyKey);
    return count ? parseInt(count) : 0;
  }

  private static async incrementDailyAttempts(username: string): Promise<number> {
    const today = new Date().toDateString();
    const dailyKey = `${DAILY_ATTEMPTS_KEY}:${username}:${today}`;
    const count = await redis.incrBy(dailyKey, 1);
    await redis.expire(dailyKey, 24 * 60 * 60);
    return count;
  }

  public static async canUserAttempt(username: string): Promise<{ canAttempt: boolean; remaining: number }> {
    const used = await this.getDailyAttemptsUsed(username);
    const remaining = Math.max(0, DAILY_ATTEMPT_LIMIT - used);
    return {
      canAttempt: remaining > 0,
      remaining,
    };
  }

  private static normalizeAnswer(answer: string): string {
    return answer.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
  }

  public static async attemptRiddle(username: string, riddleId: string, answer: string): Promise<AttemptResult> {
    // Check if user can attempt
    const { canAttempt } = await this.canUserAttempt(username);
    if (!canAttempt) {
      return {
        correct: false,
        message: "You've used all your daily attempts! Come back tomorrow for more brain teasers! 🧠",
      };
    }

    const chain = await this.getCurrentChain();
    const riddle = chain.riddles.find(r => r.id === riddleId);

    if (!riddle) {
      return {
        correct: false,
        message: "Riddle not found! 🤔",
      };
    }

    if (riddle.state === 'locked') {
      return {
        correct: false,
        message: "This riddle is still locked! Solve the required riddles first. 🔒",
      };
    }

    if (riddle.state === 'solved') {
      return {
        correct: false,
        message: "This riddle has already been solved! 🎉",
      };
    }

    if (riddle.state === 'failed') {
      return {
        correct: false,
        message: "This riddle has failed too many times and is locked. 😔",
      };
    }

    // Increment attempts
    riddle.attempts++;
    await this.incrementDailyAttempts(username);

    // Check answer
    const normalizedAnswer = this.normalizeAnswer(answer);
    const correctAnswers = [riddle.correctAnswer, ...(riddle.alternativeAnswers || [])].map(a => this.normalizeAnswer(a));

    const isCorrect = correctAnswers.includes(normalizedAnswer);

    if (isCorrect) {
      // Correct answer!
      riddle.state = 'solved';
      riddle.solvedBy = username;
      riddle.solvedAt = Date.now();
      chain.solvedRiddles++;

      // Calculate score with bonus for fewer attempts
      const attemptBonus = Math.max(0, (riddle.maxAttempts - riddle.attempts + 1) * 10);
      const finalScore = riddle.points + attemptBonus;

      // Unlock dependent riddles
      const unlockedRiddles: string[] = [];
      riddle.unlocks.forEach(unlockId => {
        const unlockRiddle = chain.riddles.find(r => r.id === unlockId);
        if (unlockRiddle && unlockRiddle.state === 'locked') {
          // Check if all requirements are met
          const allRequirementsMet = unlockRiddle.requires.every(reqId => {
            const reqRiddle = chain.riddles.find(r => r.id === reqId);
            return reqRiddle?.state === 'solved';
          });

          if (allRequirementsMet) {
            unlockRiddle.state = 'available';
            unlockedRiddles.push(unlockId);
          }
        }
      });

      // Check if chain is completed
      const chainCompleted = chain.solvedRiddles === chain.totalRiddles;
      if (chainCompleted) {
        chain.status = 'completed';
        chain.completedAt = Date.now();
      }

      await this.saveChain(chain);

      // Update user stats
      const userStats = await this.getUserStats(username);
      userStats.riddlesSolved++;
      userStats.totalScore += finalScore;
      userStats.lastSolveTime = Date.now();
      userStats.currentStreak++;
      userStats.longestStreak = Math.max(userStats.longestStreak, userStats.currentStreak);

      // Update average difficulty
      const difficultyValues = { easy: 1, medium: 2, hard: 3, expert: 4 };
      const currentAvg = userStats.averageDifficulty;
      const newAvg = (currentAvg * (userStats.riddlesSolved - 1) + difficultyValues[riddle.difficulty]) / userStats.riddlesSolved;
      userStats.averageDifficulty = Math.round(newAvg * 100) / 100;

      await this.saveUserStats(userStats);

      return {
        correct: true,
        message: `🎉 Correct! ${riddle.explanation || 'Well done!'} (+${finalScore} points)`,
        explanation: riddle.explanation,
        unlockedRiddles,
        chainCompleted,
        finalReveal: chainCompleted ? chain.finalReveal : undefined,
      };
    } else {
      // Wrong answer
      if (riddle.attempts >= riddle.maxAttempts) {
        riddle.state = 'failed';
        await this.saveChain(chain);

        return {
          correct: false,
          message: `❌ Incorrect. This riddle has failed after ${riddle.maxAttempts} attempts and is now locked. 😔`,
          hint: riddle.hint,
        };
      } else {
        await this.saveChain(chain);

        const attemptsLeft = riddle.maxAttempts - riddle.attempts;
        return {
          correct: false,
          message: `❌ Not quite right. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`,
          hint: riddle.attempts >= 2 ? riddle.hint : undefined,
        };
      }
    }
  }

  public static async getLeaderboard(limit: number = 10): Promise<UserStats[]> {
    // Simplified implementation - in production you'd use Redis sorted sets
    return [];
  }

  public static async getRecentSolves(limit: number = 10): Promise<Array<{
    username: string;
    riddleId: string;
    riddleType: RiddleType;
    difficulty: RiddleDifficulty;
    timestamp: number;
    pointsEarned: number;
  }>> {
    const chain = await this.getCurrentChain();
    const recentSolves = chain.riddles
      .filter(riddle => riddle.state === 'solved' && riddle.solvedBy && riddle.solvedAt)
      .sort((a, b) => (b.solvedAt || 0) - (a.solvedAt || 0))
      .slice(0, limit)
      .map(riddle => ({
        username: riddle.solvedBy!,
        riddleId: riddle.id,
        riddleType: riddle.type,
        difficulty: riddle.difficulty,
        timestamp: riddle.solvedAt!,
        pointsEarned: riddle.points,
      }));

    return recentSolves;
  }

  // Force refresh the riddle chain (for testing/admin)
  public static async refreshChain(): Promise<void> {
    await redis.del(CHAIN_KEY);
  }

  // Check if we need to create a new chain (daily refresh)
  private static async shouldCreateNewChain(): Promise<boolean> {
    const chainData = await redis.get(CHAIN_KEY);
    if (!chainData) return true;

    const chain: PuzzleChain = JSON.parse(chainData);
    const now = Date.now();
    const chainAge = now - chain.createdAt;
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Create new chain if current one is completed or older than 1 day
    return chain.status === 'completed' || chainAge > oneDayMs;
  }

  private static async getCurrentChain(): Promise<PuzzleChain> {
    const shouldRefresh = await this.shouldCreateNewChain();
    if (shouldRefresh) {
      await this.refreshChain();
      return await this.createNewChain();
    }

    const chainData = await redis.get(CHAIN_KEY);
    if (!chainData) {
      return await this.createNewChain();
    }
    return JSON.parse(chainData);
  }

  public static async initializeGame(username: string): Promise<{
    puzzleChain: PuzzleChain;
    userStats: UserStats;
    canAttempt: boolean;
    dailyAttemptsRemaining: number;
    leaderboard: UserStats[];
    recentSolves: Array<{
      username: string;
      riddleId: string;
      riddleType: RiddleType;
      difficulty: RiddleDifficulty;
      timestamp: number;
      pointsEarned: number;
    }>;
  }> {
    const [puzzleChain, userStats, attemptInfo, leaderboard, recentSolves] = await Promise.all([
      this.getCurrentChain(),
      this.getUserStats(username),
      this.canUserAttempt(username),
      this.getLeaderboard(10),
      this.getRecentSolves(10),
    ]);

    return {
      puzzleChain,
      userStats,
      canAttempt: attemptInfo.canAttempt,
      dailyAttemptsRemaining: attemptInfo.remaining,
      leaderboard,
      recentSolves,
    };
  }
}