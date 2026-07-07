#!/usr/bin/env node
'use strict';

/**
 * משחרר פורט לפני עליית שרת פיתוח (ts-node-dev / vite), כדי שהרצה חוזרת של
 * `pnpm dev` לעולם לא "תיתקע" עם EADDRINUSE בגלל תהליך ישן שנשאר תקוע על
 * הפורט (למשל אחרי סגירה לא נקייה של הטרמינל/VS Code).
 *
 * רץ אוטומטית כ-"predev" בכל אחד מה-workspaces (backend/frontend) - ר'
 * package.json של כל אחד מהם. לא נכשל אף פעם בצורה שתחסום את pnpm dev;
 * במקרה של שגיאה בלתי צפויה רק מדפיס אזהרה וממשיך.
 *
 * שימוש: node scripts/free-port.js <port> [port2 ...]
 */

const { execSync } = require('child_process');

const ports = process.argv.slice(2);

function freePortWindows(port) {
  let output;
  try {
    output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
  } catch {
    // findstr מחזיר קוד יציאה שאינו 0 כשאין תוצאות - כלומר הפורט כבר פנוי.
    return;
  }

  const pids = new Set();
  output.split('\n').forEach((line) => {
    const trimmed = line.trim();
    // רק שורות LISTENING חוסמות עלייה של שרת חדש על הפורט - שורות TIME_WAIT/
    // CLOSE_WAIT הן חיבורים ישנים שנסגרים לבד ולא צריך (וגם לא כדאי) לגעת בהן.
    if (!trimmed.includes('LISTENING')) return;
    const parts = trimmed.split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== '0') pids.add(pid);
  });

  pids.forEach((pid) => {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`[free-port] פורט ${port} שוחרר (נסגר תהליך ${pid})`);
    } catch {
      // ייתכן שהתהליך כבר נסגר לבד בין netstat ל-taskkill - זה בסדר גמור.
    }
  });
}

function freePortUnix(port) {
  let pids;
  try {
    pids = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  } catch {
    return;
  }
  pids.forEach((pid) => {
    try {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
      console.log(`[free-port] פורט ${port} שוחרר (נסגר תהליך ${pid})`);
    } catch {
      // ignore
    }
  });
}

for (const port of ports) {
  try {
    if (process.platform === 'win32') {
      freePortWindows(port);
    } else {
      freePortUnix(port);
    }
  } catch (err) {
    // לעולם לא נכשיל את pnpm dev בגלל שגיאה כאן - המטרה היא נוחות, לא חסימה.
    console.warn(`[free-port] לא הצלחתי לבדוק/לנקות פורט ${port} (לא קריטי):`, err.message);
  }
}
