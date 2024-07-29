require('dotenv').config();
var Imap = require('imap');
const { simpleParser } = require('mailparser');

// Configure IMAP connection
var imap = new Imap({
  user: process.env.user,
  password: process.env.password,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }  // Allow self-signed certificates
});

// Function to open inbox
function openInbox(cb) {
  imap.openBox('INBOX', true, cb);
}

// Listener for when the connection is ready
imap.once('ready', function () {
  openInbox(function (err, box) {
    if (err) throw err;
    imap.search(['UNSEEN', ['SINCE', 'July 15, 2024']], function (err, results) {
      if (err) throw err;
      if (results.length === 0) {
        console.log('No unseen messages since the specified date.');
        imap.end();
        return;
      }
      var f = imap.fetch(results, { bodies: '' });
      f.on('message', function (msg, seqno) {
        var buffer = '';

        msg.on('body', function (stream, info) {
          stream.on('data', function (chunk) {
            buffer += chunk.toString('utf8');
          });
          stream.once('end', function () {

            simpleParser(buffer)
              .then(parsed => {
                console.log('Subject:', parsed.subject);
                console.log('From:', parsed.from.text);
                console.log('To:', parsed.to.text);
                console.log('Date:', parsed.date);
              })
              .catch(err => {
                console.error('Error parsing email:', err);
              });
          });
        });
      });
      f.once('error', function (err) {
        console.error('Fetch error: ' + err);
      });
      f.once('end', function () {
        console.log('Done fetching all messages!');
        imap.end();
      });
    });
  });
});


// Listener for connection errors
imap.once('error', function (err) {
  console.error('Connection error: ' + err);
});

// Listener for when the connection ends
imap.once('end', function () {
  console.log('Connection ended');
});

// Connect to the server
imap.connect();
