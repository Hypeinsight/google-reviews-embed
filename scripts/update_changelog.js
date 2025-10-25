#!/usr/bin/env node

/**
 * update_changelog.js
 * 
 * Automatically updates /docs/CHANGE_LOG.md with the latest commit information.
 * Called by git hooks: post-commit, post-merge, post-checkout
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHANGELOG_PATH = path.join(__dirname, '..', 'docs', 'CHANGE_LOG.md');

/**
 * Execute a git command and return output
 */
function gitCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.error(`Error executing git command: ${command}`);
    return '';
  }
}

/**
 * Get the latest commit information
 */
function getLatestCommitInfo() {
  const timestamp = new Date().toISOString();
  const branch = gitCommand('git rev-parse --abbrev-ref HEAD');
  const shortHash = gitCommand('git log -1 --pretty=format:%h');
  const authorName = gitCommand('git log -1 --pretty=format:%an');
  const authorEmail = gitCommand('git log -1 --pretty=format:%ae');
  const commitMessage = gitCommand('git log -1 --pretty=format:%s');
  const changedFiles = gitCommand('git show --name-only --pretty="" HEAD').split('\n').filter(Boolean);

  return {
    timestamp,
    branch,
    shortHash,
    authorName,
    authorEmail,
    commitMessage,
    changedFiles
  };
}

/**
 * Build markdown entry for a commit
 */
function buildChangelogEntry(info) {
  const fileList = info.changedFiles.length > 0 
    ? info.changedFiles.map(f => `  - ${f}`).join('\n')
    : '  - (no files changed)';

  return `
---

**${info.timestamp}** | Branch: \`${info.branch}\` | Commit: \`${info.shortHash}\`

**Author:** ${info.authorName} <${info.authorEmail}>

**Message:** ${info.commitMessage}

**Files changed:**
${fileList}
`.trim() + '\n';
}

/**
 * Check if an entry for this commit hash already exists in the last N lines
 */
function isDuplicate(content, shortHash, lastNLines = 10) {
  const lines = content.split('\n');
  const recentLines = lines.slice(-lastNLines).join('\n');
  return recentLines.includes(`Commit: \`${shortHash}\``);
}

/**
 * Main function
 */
function main() {
  try {
    // Get commit info
    const info = getLatestCommitInfo();

    if (!info.shortHash) {
      console.warn('No commit hash found. Skipping changelog update.');
      return;
    }

    // Ensure changelog exists
    if (!fs.existsSync(CHANGELOG_PATH)) {
      console.log('Creating CHANGE_LOG.md...');
      fs.writeFileSync(CHANGELOG_PATH, '# Change Log\n\nThis file is automatically updated by git hooks.\n\n## Entries\n\n<!-- Automated entries will appear below -->\n');
    }

    // Read current content
    let content = fs.readFileSync(CHANGELOG_PATH, 'utf-8');

    // Check for duplicates
    if (isDuplicate(content, info.shortHash)) {
      console.log(`Changelog already contains entry for commit ${info.shortHash}. Skipping.`);
      return;
    }

    // Build and append new entry
    const entry = buildChangelogEntry(info);
    content += '\n' + entry;

    // Write back
    fs.writeFileSync(CHANGELOG_PATH, content);
    console.log(`✓ Changelog updated with commit ${info.shortHash}`);

  } catch (error) {
    console.error('Error updating changelog:', error.message);
    process.exit(0); // Exit cleanly so git operation continues
  }
}

main();
