const { execSync } = require('child_process');
const fs = require('fs');
try {
  const result = execSync('git ls-tree -r HEAD components/ui', { encoding: 'utf-8' });
  fs.writeFileSync('git_test_out.txt', result);
} catch(e) {
  fs.writeFileSync('git_test_out.txt', "ERROR:\n" + e.message + "\nSTDOUT:\n" + (e.stdout ? e.stdout.toString() : ''));
}
