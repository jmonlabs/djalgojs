#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

function parseNbCell(lines, startIndex) {
  const cell = {
    code: '',
    status: '',
    output: '',
    type: 'code'
  };

  let i = startIndex;
  const cellType = lines[i].trim();

  if (cellType === '#%% [markdown]') {
    cell.type = 'html';
    i++;
    
    while (i < lines.length && !lines[i].startsWith('#%%')) {
      let line = lines[i];
      if (line.startsWith('# ')) {
        line = line.substring(2);
      } else if (line === '#') {
        line = '';
      }
      cell.code += line + '\n';
      i++;
    }
    
    cell.code = cell.code.trim();
    cell.output = convertMarkdownToHtml(cell.code);
  } else if (cellType === '#%% [esm]' || cellType === '#%% [javascript]') {
    cell.type = 'code';
    i++;
    
    while (i < lines.length && !lines[i].startsWith('#%%')) {
      cell.code += lines[i] + '\n';
      i++;
    }
    
    cell.code = cell.code.trim();
  } else if (cellType === '#%% [html]') {
    cell.type = 'code';
    i++;
    
    while (i < lines.length && !lines[i].startsWith('#%%')) {
      cell.code += lines[i] + '\n';
      i++;
    }
    
    cell.code = cell.code.trim();
  }

  return { cell, nextIndex: i };
}

function convertMarkdownToHtml(markdown) {
  return markdown
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')  
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p>\n<p>')
    .replace(/^(?!<[h|u|l|p])/gm, '<p>')
    .replace(/(?<!>)$/gm, '</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<[h|u])/g, '$1')
    .replace(/(<\/[h|u|l]>)<\/p>/g, '$1')
    .trim();
}

function extractTitle(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ') && !line.includes('#%%')) {
      return line.substring(2).trim();
    }
  }
  return 'Untitled';
}

function convertNbToJsnb(nbFilePath) {
  const content = fs.readFileSync(nbFilePath, 'utf8');
  const lines = content.split('\n');
  
  const title = extractTitle(content);
  
  const jsnb = {
    metadata: {
      name: title,
      language_info: {
        name: "JavaScript",
        version: "8.0"
      }
    },
    jsnbversion: "v0.1",
    cells: [],
    source: "https://github.com/jmonlabs/djalgojs",
    run_on_load: false
  };

  let i = 0;
  while (i < lines.length) {
    if (lines[i].startsWith('#%%')) {
      const { cell, nextIndex } = parseNbCell(lines, i);
      jsnb.cells.push(cell);
      i = nextIndex;
    } else {
      i++;
    }
  }

  return jsnb;
}

function convertAllNbFiles() {
  const nbFiles = fs.readdirSync('.').filter(file => file.endsWith('.nb'));
  
  for (const nbFile of nbFiles) {
    try {
      console.log(`Converting ${nbFile}...`);
      const jsnb = convertNbToJsnb(nbFile);
      const outputFile = nbFile.replace('.nb', '.jsnb');
      fs.writeFileSync(outputFile, JSON.stringify(jsnb, null, 2));
      console.log(`✓ Created ${outputFile}`);
    } catch (error) {
      console.error(`✗ Error converting ${nbFile}:`, error.message);
    }
  }
}

convertAllNbFiles();

export { convertNbToJsnb, convertAllNbFiles };