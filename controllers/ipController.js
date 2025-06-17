
const fs = require('fs');
const path = require('path');

exports.getActiveIps = (req, res) => {
  const filePath = path.join(__dirname, 'product-actions.log');
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send({ message: 'Could not read log file' });

    const lines = data.split('\n');
    const activeIps = new Set();

    lines.forEach(line => {
      const match = line.match(/\[(.*?)\].*?IP.*?(::ffff:)?([\d.]+)/);
      if (match) {
        const timestamp = new Date(match[1]);
        if (timestamp > fiveMinutesAgo) {
          activeIps.add(match[3]); // group(3) = IPv4 address
        }
      }
    });

    res.json({ active_ips: Array.from(activeIps) });
  });
};
