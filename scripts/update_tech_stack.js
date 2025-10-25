#!/usr/bin/env node

/**
 * update_tech_stack.js
 * 
 * Automatically updates /docs/TECH_STACK.md with current dependencies from package.json.
 * Tracks changes and appends a dated note when dependencies are added, removed, or updated.
 */

const fs = require('fs');
const path = require('path');

const TECH_STACK_PATH = path.join(__dirname, '..', 'docs', 'TECH_STACK.md');
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const STATE_FILE = path.join(__dirname, '.tech_stack_state.json');

/**
 * Read and parse package.json
 */
function getPackageInfo() {
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    console.warn('package.json not found');
    return {};
  }

  const content = fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8');
  const pkg = JSON.parse(content);

  const dependencies = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  };

  return dependencies;
}

/**
 * Build a markdown table from dependencies
 */
function buildDependencyTable(dependencies) {
  const entries = Object.entries(dependencies).sort((a, b) => a[0].localeCompare(b[0]));

  if (entries.length === 0) {
    return '| Package | Version |\n|---------|---------|\n| (none) | - |';
  }

  let table = '| Package | Version |\n|---------|---------|\n';
  for (const [pkg, version] of entries) {
    table += `| ${pkg} | ${version} |\n`;
  }

  return table.trim();
}

/**
 * Load previous state
 */
function loadPreviousState() {
  if (!fs.existsSync(STATE_FILE)) {
    return null;
  }

  try {
    const content = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Save current state
 */
function saveCurrentState(dependencies) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(dependencies, null, 2));
}

/**
 * Compare dependencies and generate change summary
 */
function generateChangeSummary(oldDeps, newDeps) {
  if (!oldDeps) return null;

  const oldKeys = new Set(Object.keys(oldDeps));
  const newKeys = new Set(Object.keys(newDeps));

  const added = [...newKeys].filter(k => !oldKeys.has(k));
  const removed = [...oldKeys].filter(k => !newKeys.has(k));
  const changed = [...newKeys].filter(k => {
    if (!oldKeys.has(k)) return false;
    const oldVer = oldDeps[k];
    const newVer = newDeps[k];
    return oldVer !== newVer;
  });

  if (added.length === 0 && removed.length === 0 && changed.length === 0) {
    return null;
  }

  const parts = [];
  if (added.length > 0) {
    parts.push(`Added: ${added.join(', ')}`);
  }
  if (removed.length > 0) {
    parts.push(`Removed: ${removed.join(', ')}`);
  }
  if (changed.length > 0) {
    const changes = changed.map(k => `${k} (${oldDeps[k]} → ${newDeps[k]})`);
    parts.push(`Updated: ${changes.join(', ')}`);
  }

  return parts.join('; ');
}

/**
 * Update TECH_STACK.md
 */
function updateTechStack() {
  if (!fs.existsSync(TECH_STACK_PATH)) {
    console.warn('TECH_STACK.md not found');
    return;
  }

  const dependencies = getPackageInfo();
  const previousDeps = loadPreviousState();

  // Read current tech stack content
  let content = fs.readFileSync(TECH_STACK_PATH, 'utf-8');

  // Build new table
  const newTable = buildDependencyTable(dependencies);

  // Replace table between markers
  const startMarker = '<!-- AUTO-GENERATED: Do not edit this section manually -->';
  const endMarker = '<!-- END AUTO-GENERATED -->';

  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    console.warn('Could not find auto-generated markers in TECH_STACK.md');
    return;
  }

  const before = content.substring(0, startIdx + startMarker.length);
  const after = content.substring(endIdx);

  content = `${before}\n${newTable}\n\n${after}`;

  // Check for changes and append note
  const changeSummary = generateChangeSummary(previousDeps, dependencies);
  if (changeSummary) {
    const timestamp = new Date().toISOString().split('T')[0];
    const changeNote = `\n- **${timestamp}**: ${changeSummary}`;

    // Append to Changes section
    content = content.trimEnd() + changeNote + '\n';
    console.log(`✓ Tech stack updated with changes: ${changeSummary}`);
  } else {
    console.log('✓ Tech stack table updated (no dependency changes)');
  }

  // Write back
  fs.writeFileSync(TECH_STACK_PATH, content);

  // Save state
  saveCurrentState(dependencies);
}

/**
 * Main function
 */
function main() {
  try {
    updateTechStack();
  } catch (error) {
    console.error('Error updating tech stack:', error.message);
    process.exit(0); // Exit cleanly so git operation continues
  }
}

main();
