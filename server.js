import express from 'express';
import config from './config.js';
import OpenAI from 'openai';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const port = config.PORT;

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

// Load assistant ID from a function or create a new one
const assistantId = 'asst_GRK390wZY6qCSOka4Kvj4QPx';

app.get('/start', async (req, res) => {
  try {
    const thread = await openai.beta.threads.create();
    console.log('New conversation started with thread ID:', thread.id);
    res.json({ thread_id: thread.id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error starting a new conversation');
  }
});

app.post('/chat', async (req, res) => {
  const { thread_id: threadId, message: userInput } = req.body;
  if (!threadId) {
    console.log('Error: Missing thread_id in /chat');
    return res.status(400).json({ error: 'Missing thread_id' });
  }

  console.log(
    'Received message for thread ID:',
    threadId,
    'Message:',
    userInput
  );

  try {
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userInput,
    });
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });
    console.log('Run started with ID:', run.id);
    res.json({ run_id: run.id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during chat');
  }
});

app.post('/check', async (req, res) => {
  const { thread_id: threadId, run_id: runId } = req.body;
  if (!threadId || !runId) {
    console.log('Error: Missing thread_id or run_id in /check');
    return res.json({ response: 'error' });
  }

  const startTime = Date.now();
  while (Date.now() - startTime < 9000) {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    console.log('Checking run status:', runStatus.status);

    if (runStatus.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(threadId);
      const messageContent = messages.data[0].content; // Adapt based on actual response structure
      // Assuming you need to process the message content further
      console.log('Run completed, returning response');
      return res.json({
        response: messageContent,
        status: 'completed',
      });
    }
  }

  console.log('Run timed out');
  return res.json({ response: 'timeout' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
