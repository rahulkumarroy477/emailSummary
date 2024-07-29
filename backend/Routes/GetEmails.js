require('dotenv').config();
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const express = require('express');
const ensureAuthenticated = require('../Middlewares/Auth');
const { format, subDays } = require('date-fns');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
const apiKey = process.env.API_KEY;

const Email = require('../Models/Email');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

function getFormattedDate(days) {
  const currentDate = new Date();
  const newDate = subDays(currentDate, days);
  const formattedDate = format(newDate, 'MMMM dd, yyyy');
  return formattedDate;
}


router.get('/', ensureAuthenticated, async (req, res) => {
  const emails = []; // Reset the emails array
  const user = req.user;
  console.log(user);
  console.log(req.appPassword);

  const imap = new Imap({
    user: user.email,
    password: req.appPassword,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  });

  const openInbox = (cb) => {
    imap.openBox('INBOX', true, cb);
  };

  imap.once('ready', () => {
    openInbox((err, box) => {
      if (err) {
        console.error('Error opening inbox:', err);
        return res.status(500).json({ error: 'Error opening inbox' });
      }

      imap.search(['UNSEEN', ['SINCE', getFormattedDate(7)]], async (err, results) => {
        if (err) {
          console.error('Search error:', err);
          return res.status(500).json({ error: 'Error searching emails' });
        }

        if (results.length === 0) {
          console.log('No unseen messages since the specified date.');
          imap.end();
          return res.status(200).json({ message: 'No unseen messages since the specified date.' });
        }

        const f = imap.fetch(results, { bodies: '' });
        f.on('message', (msg) => {
          let buffer = '';

          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });

            stream.once('end', async () => {
              try {
                const parsed = await simpleParser(buffer);
                console.log(parsed.date);

                // Check if the email exists in the database
                const emailDb = await Email.findOne({ date: parsed.date.toString(), userId: user._id });

                if (!emailDb) {
                  const prompt = `Filter out everything and generate a clean summary as plain text for the given string in a single sentence: ${parsed.text}`;
                  let text = 'Cannot generate summary for the given mail';

                  try {
                    const result = await model.generateContent(prompt);
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    text = result.response.text();
                  } catch (err) {
                    // console.error('Error generating summary:', err);
                  }

                  const newEmail = new Email({
                    userId: user._id,
                    subject: parsed.subject,
                    from: parsed.from.text,
                    date: parsed.date.toString(),
                    body: text,
                  });

                  await newEmail.save();
                  emails.push({ ...newEmail, date: format(parsed.date, 'dd MMMM, yyyy') });
                } else {
                  console.log('Email already exists in the database');
                  emails.push({ ...emailDb.toObject(), date: format(emailDb.date, 'dd MMMM, yyyy') });
                  console.log(emailDb._id);
                }
              } catch (err) {
                console.error('Error parsing email:', err);
              }
            });
          });
        });

        f.once('error', (err) => {
          console.error('Fetch error: ' + err);
          res.status(500).json({ error: 'Error fetching emails' });
        });

        f.once('end', async () => {
          console.log('Done fetching all messages!');
          imap.end();
          console.log(emails.length);
          res.status(200).json({ message: 'Emails fetched successfully', success: true, emails });
        });
      });
    });
  });

  imap.once('error', (err) => {
    console.error('Connection error: ' + err);
    res.status(500).json({ error: 'Connection error' });
  });

  imap.once('end', () => {
    console.log('Connection ended');
  });

  imap.connect();
});

module.exports = router;
