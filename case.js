import axios from "axios";

import util from "util";
import cp from "child_process";

export default async function Command(conn, m) {
  let quoted = m.isQuoted ? m.quoted : m;
  let downloadM = async (filename) =>
    await conn.downloadMedia(quoted, filename);
  switch (m.body.startsWith(".") ? m.command.toLowerCase() : false) {
    case "ping":
      const start = performance.now();
      m.reply(`Kecepatan respon: ${(performance.now() - start).toFixed(2)} ms`);
      break;
    case "rvo":
      if (!m.quoted?.msg?.viewOnce) return m.reply("Reply Pesan Sekali Lihat");
      m.quoted.msg.viewOnce = false;
      await conn.sendMessage(m.chat, { forward: m.quoted, force: true });
      break;
    default:
  }

  if ([">", "eval", "=>"].some((a) => m.body.toLowerCase().startsWith(a))) {
    try {
      let code = m.text;
      let result = /await/i.test(code)
        ? await eval(`(async () => { ${code} })()`)
        : eval(code);

      m.reply(util.format(result));
    } catch (err) {
      m.reply(util.format(err));
    }
  }

  if (m.body.startsWith("$")) {
    const exec = util.promisify(cp.exec).bind(cp);
    let o;
    try {
      o = await exec(m.text);
    } catch (e) {
      o = e;
    } finally {
      let { stdout, stderr } = o;
      if (stdout.trim()) m.reply(stdout);
      if (stderr.trim()) m.reply(stderr);
    }
  }
}
