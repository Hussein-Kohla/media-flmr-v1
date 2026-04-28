const { execSync } = require('child_process');
try {
  const out = execSync('npx.cmd convex dev --once');
  console.log(out.toString());
} catch(e) {
  console.error("Error:", e.message);
  if (e.stdout) console.log(e.stdout.toString());
  if (e.stderr) console.error(e.stderr.toString());
}
