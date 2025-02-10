const axios = require('axios');
const fs = require('fs');
const figlet = require('figlet');
const chalk = require('chalk');
const readline = require('readline');
const { Worker, isMainThread, parentPort } = require('worker_threads');

// AI Agents
const agents = {
  "1": { id: "deployment_p5J9lz1Zxe7CYEoo0TZpRVay", name: "Professor 🧠" },
  "2": { id: "deployment_7sZJSiCqCNDy9bBHTEh7dwd9", name: "Crypto Buddy 💰" },
  "3": { id: "deployment_SoFftlsf9z4fyA3QCHYkaANq", name: "Sherlock 🔎" }
};

function displayAppTitle() {
    console.log(chalk.cyan(figlet.textSync(' TEAM HUNTER ', { horizontalLayout: 'full' })));

    console.log(chalk.magentaBright(`
    ░▀▀█░█▀█░▀█▀░█▀█
    ░▄▀░░█▀█░░█░░█░█
    ░▀▀▀░▀░▀░▀▀▀░▀░▀
    `));

    console.log(chalk.blueBright('╔══════════════════════════════════╗'));
    console.log(chalk.blueBright('║                                  ║'));
    console.log(chalk.greenBright('║  ZAIN ARAIN                      ║'));
    console.log(chalk.greenBright('║  AUTO SCRIPT MASTER              ║'));
    console.log(chalk.blueBright('║                                  ║'));
    console.log(chalk.yellowBright('║  JOIN TELEGRAM CHANNEL NOW!      ║'));
    console.log(chalk.yellowBright('║  https://t.me/AirdropScript6     ║'));
    console.log(chalk.yellowBright('║  @AirdropScript6 - OFFICIAL      ║'));
    console.log(chalk.yellowBright('║  CHANNEL                         ║'));
    console.log(chalk.blueBright('║                                  ║'));
    console.log(chalk.redBright('║  FAST - RELIABLE - SECURE        ║'));
    console.log(chalk.redBright('║  SCRIPTS EXPERT                  ║'));
    console.log(chalk.blueBright('║                                  ║'));
    console.log(chalk.blueBright('╚══════════════════════════════════╝'));

    console.log(chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.gray('Bot '));
    console.log(chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.yellow('🔗 Telegram: https://t.me/AirdropScript6'));
    console.log(chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}

// Call the function to display the banner


// Get Wallet Addresses from File
function getWallets() {
  if (!fs.existsSync('wallet.txt')) {
    console.log(chalk.red('⚠️ wallet.txt not found! Add wallets inside the file.'));
    process.exit(1);
  }
  return fs.readFileSync('wallet.txt', 'utf-8').split('\n').map(w => w.trim()).filter(Boolean);
}

// Fetch Random Question
function getRandomQuestion() {
  try {
    if (!fs.existsSync('random_questions.json')) {
      console.log(chalk.red('⚠️ random_questions.json not found! Using default questions.'));
      return ["What is AI?", "Explain blockchain.", "How does machine learning work?"];
    }
    const questions = JSON.parse(fs.readFileSync('random_questions.json', 'utf-8'));
    return questions.length ? questions : ["What is AI?", "Explain blockchain.", "How does machine learning work?"];
  } catch (error) {
    console.error(chalk.red('⚠️ Error reading questions file:'), error.message);
    return ["What is AI?", "Explain blockchain.", "How does machine learning work?"];
  }
}

// Send Question to AI Agent
async function sendRandomQuestion(agent) {
  const questions = getRandomQuestion();
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  const payload = { message: randomQuestion, stream: false };
  const url = `https://${agent.toLowerCase().replace('_', '-')}.stag-vxzy.zettablock.com/main`;

  let attempts = 3;
  while (attempts > 0) {
    try {
      const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
      if (response.data?.choices?.[0]?.message) {
        return { question: randomQuestion, response: response.data.choices[0].message };
      }
    } catch (error) {
      console.error(chalk.red(`⚠️ API request failed (Retries left: ${attempts - 1})`), error.message);
      attempts--;
      await new Promise(res => setTimeout(res, 2000));
    }
  }

  return null; // Return null if no successful response
}

// Report API Usage
async function reportUsage(wallet, options) {
  try {
    const payload = {
      wallet_address: wallet,
      agent_id: options.agent_id,
      request_text: options.question,
      response_text: options.response,
      request_metadata: {}
    };

    await axios.post("https://quests-usage-dev.prod.zettablock.com/api/report_usage", payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(chalk.green('✅ Usage data successfully reported!\n'));
    return true;
  } catch (error) {
    console.error(chalk.red('⚠️ Failed to report usage:'), error.message);
    return false;
  }
}

// Worker Function (Handles Multi-threading)
function runWorker(wallet, agentIds, iterations) {
  const worker = new Worker(__filename, { workerData: { wallet, agentIds, iterations } });
  worker.on('message', msg => console.log(chalk.blue(`[Worker ${wallet}]`), msg));
  worker.on('error', err => console.error(chalk.red(`[Worker ${wallet} Error]:`), err));
  worker.on('exit', code => console.log(chalk.yellow(`[Worker ${wallet} Exited with code ${code}]`)));
}

// Execute for a Single Wallet Sequentially
async function runSequential(wallet, agentIds, iterations) {
  for (const agentChoice of agentIds) {
    const agent = agents[agentChoice];

    console.log(chalk.magenta(`\n🤖 Using Agent: ${agent.name} for Wallet: ${wallet}`));
    console.log(chalk.dim('----------------------------------------'));

    let successCount = 0;
    while (successCount < iterations) {
      console.log(chalk.yellow(`🔄 Attempt ${successCount + 1}`));

      const nanya = await sendRandomQuestion(agent.id);
      if (!nanya || !nanya.question) {
        console.log(chalk.red('⚠️ Failed to retrieve a valid question. Retrying...'));
        continue;
      }

      console.log(chalk.cyan('❓ Question:'), chalk.bold(nanya.question));
      console.log(chalk.green('💡 Answer:'), chalk.italic(nanya?.response?.content ?? 'No response received.'));

      const reported = await reportUsage(wallet.toLowerCase(), {
        agent_id: agent.id,
        question: nanya.question,
        response: nanya?.response?.content ?? 'No response'
      });

      if (reported) successCount++; // Only count successful reports
    }

    console.log(chalk.dim('----------------------------------------'));
  }
}

// Main Execution Function
async function main() {
  displayAppTitle();
  const wallets = getWallets();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  rl.question(chalk.yellow('🤖 Select Agent (1: Professor 🧠, 2: Crypto Buddy 💰, 3: Sherlock 🔎, 4: All): '), (agentChoice) => {
    rl.question(chalk.yellow('🔢 Enter the number of iterations per agent: '), (input) => {
      rl.question(chalk.yellow('⚡ Enable Multi-threading? (yes/no): '), (multiThread) => {
        const iterations = parseInt(input) || 1;
        let agentIds = [];

        if (agentChoice === "4") {
          agentIds = Object.keys(agents);
        } else if (agents[agentChoice]) {
          agentIds.push(agentChoice);
        } else {
          console.log(chalk.red("⚠️ Invalid selection! Exiting..."));
          process.exit(1);
        }

        console.log(chalk.blue(`\n📊 Iterations per agent: ${iterations}`));
        console.log(chalk.blue(`⚡ Multi-threading: ${multiThread.toLowerCase() === "yes" ? "Enabled" : "Disabled"}\n`));

        if (multiThread.toLowerCase() === "yes") {
          wallets.forEach(wallet => runWorker(wallet, agentIds, iterations));
        } else {
          (async () => {
            for (const wallet of wallets) {
              await runSequential(wallet, agentIds, iterations);
            }
          })();
        }

        rl.close();
      });
    });
  });
}

// Start the script
if (!isMainThread) {
  (async () => {
    const { workerData } = require('worker_threads');
    await runSequential(workerData.wallet, workerData.agentIds, workerData.iterations);
    process.exit(0);
  })();
} else {
  main();
}