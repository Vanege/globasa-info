(function () {
  // Fetch required dictionary data
  async function fetchDictionaries() {
    try {
      const [standardResp, searchTermsResp] = await Promise.all([
        fetch('https://cdn.globasa.net/api2/standard.json'),
        fetch('https://cdn.globasa.net/api2/search_terms_eng.json')
      ]);
      return {
        globasaDictionary: await standardResp.json(),
        engSearchTerms: await searchTermsResp.json()
      };
    } catch (error) {
      console.error('Failed to fetch dictionaries:', error);
      return null;
    }
  }

  // Constants from your application
  const prefixes = ['be', 'du', 'aw', 'awto', 'dis', 'eko', 'fin', 'fron', 'ja', 'nen', 'pos', 'pre', 'ri', 'ru', 'xor', 'anti', 'bax', 'pas', 'ex', 'in', 'infra', 'intre', 'le', 'lefe', 'moy', 'of', 'se', 'supra', 'ton', 'tras', 'ultra', 'xa', 'xafe', 'gami', 'hawa', 'bon', 'bur', 'colo', 'cuyo', 'day', 'fem', 'godo', 'juni', 'kwasi', 'lama', 'lao', 'leli', 'lil', 'mal', 'man', 'meli', 'midi', 'neo', 'semi', 'un', 'dua'];
  const suffixes = ['su', 'li', 'mo', 'ya', 'gi', 'cu', 'do', 'ne', 'ple', 'yum', 'gone', 'ina', 'je', 'sa', 'abil', 'bimar', 'bon', 'bur', 'ible', 'fil', 'kal', 'kolordo', 'laye', 'musi', 'peldo', 'pul', 'sim', 'bol', 'din', 'dom', 'doku', 'dukan', 'ente', 'fon', 'hole', 'grafi', 'ismo', 'ista', 'itis', 'kaxa', 'kef', 'krasi', 'kumax', 'lari', 'lexi', 'logi', 'maso', 'medis', 'meter', 'mon', 'mosem', 'osis', 'tim', 'tora', 'tul', 'xey', 'yen'];

  // Create popup element
  const popup = document.createElement('div');
  popup.style.cssText = `
        position: fixed;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        border-radius: 4px;
        font-size: 14px;
        pointer-events: none;
        z-index: 999999;
        display: none;
        transform: translate(-50%, -100%);
        margin-top: -8px;
        max-width: 400px;
        white-space: pre-line;
    `;
  document.body.appendChild(popup);

  let dictionaries = null;

  const replaceEntities = (str) => {
    const replacements = {
      '&ldquo;': '\u201C',  // LEFT DOUBLE QUOTATION MARK
      '&rdquo;': '\u201D',  // RIGHT DOUBLE QUOTATION MARK
      '&uacute;': '\u00FA', // LATIN SMALL LETTER U WITH ACUTE
      '&oacute;': '\u00F3', // LATIN SMALL LETTER O WITH ACUTE
      '&eacute;': '\u00E9', // LATIN SMALL LETTER E WITH ACUTE
      '&egrave;': 'è',
      '&lrm;': '\u200E',    // LEFT-TO-RIGHT MARK
      '&ecirc;': '\u00EA',  // LATIN SMALL LETTER E WITH CIRCUMFLEX
      '&ocirc;': '\u00F4',   // LATIN SMALL LETTER O WITH CIRCUMFLEX
      '&aacute;': 'á'
    };

    return str.replace(
      new RegExp(Object.keys(replacements).join('|'), 'g'),
      match => replacements[match]
    );
  };

  // Format etymology like in your original code
  function formatEtymology(etymology) {
    if (!etymology) return '';
    if (etymology.derived) {
      return etymology.derived.join(' ');
    }
    if (etymology.natlang) {
      return Object.entries(etymology.natlang)
        .map(([key, value]) => {
          return `${key}: ${replaceEntities(value)}`
        })
        .join('\n');
    }
    return '';
  }

  // Word to label conversion like in your original code
  function wordToLabel(word) {
    if (!word?.trans) return '';
    const { eng, epo } = word.trans;
    const engString = eng?.flatMap(item => item).join(', ');
    const epoString = epo?.flatMap(item => item).join(', ');
    const wordClass = word["word class"] ? `(${word["word class"]})` : '';
    const etymologyString = formatEtymology(word.etymology);

    let label = `${engString}\n${epoString}\n${wordClass}\n${etymologyString}`
    return label.replace(/(<([^>]+)>)/gi, '');
  }

  // Get word node and info with improved word boundary detection
  function getWordNode(element, x, y) {
    if (element.nodeType === Node.TEXT_NODE) {
      const range = document.createRange();
      // Improved regex to handle compound words and punctuation
      const words = element.textContent.split(/(?<=[\s\-])|(?=[\s\-])/);
      let currentPos = 0;

      for (const word of words) {
        if (!word.trim()) {
          currentPos += word.length;
          continue;
        }
        const wordLength = word.length;
        range.setStart(element, currentPos);
        range.setEnd(element, currentPos + wordLength);
        const rect = range.getBoundingClientRect();

        if (x >= rect.left && x <= rect.right &&
          y >= rect.top && y <= rect.bottom) {
          // Clean the word by removing punctuation and special characters
          const cleanWord = word.replace(/[!.,;?:'")\]}]/g, '');
          return { word: cleanWord, rect };
        }

        currentPos += wordLength;
      }
    }
    return null;
  }

  // Modified check for compound words
  function checkCompoundWord(word, allWords) {
    // Try direct lookup first
    if (allWords.includes(word)) {
      return null; // Not a compound word
    }

    // Check for common compound separators
    const parts = word.split(/[-+]/);
    if (parts.length > 1 && parts.every(part => allWords.includes(part))) {
      return {
        firstMorpheme: parts[0],
        secondMorpheme: parts.slice(1).join('-')
      };
    }

    // Try to find valid word combinations
    for (let i = 1; i < word.length - 1; i++) {
      const first = word.substring(0, i);
      const second = word.substring(i);
      if (allWords.includes(first) && allWords.includes(second)) {
        return {
          firstMorpheme: first,
          secondMorpheme: second
        };
      }
    }

    return null;
  }

  // Check for affixation
  function checkAffixation(word, allWords) {
    for (const suffix of suffixes) {
      if (word.endsWith(suffix)) {
        const wordWithoutSuffix = word.substring(0, word.length - suffix.length);
        if (allWords.includes(wordWithoutSuffix)) {
          return {
            firstMorpheme: wordWithoutSuffix,
            secondMorpheme: `-${suffix}`
          };
        }
      }
    }
    for (const prefix of prefixes) {
      if (word.startsWith(prefix)) {
        const wordWithoutPrefix = word.substring(prefix.length);
        if (allWords.includes(wordWithoutPrefix)) {
          return {
            firstMorpheme: `${prefix}-`,
            secondMorpheme: wordWithoutPrefix
          };
        }
      }
    }
    return null;
  }

  // Debounce function
  function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Show popup with fragment info
  const showPopup = debounce(async (e) => {
    if (!dictionaries) {
      dictionaries = await fetchDictionaries();
      if (!dictionaries) return;
    }

    const { globasaDictionary } = dictionaries;
    const allWords = Object.keys(globasaDictionary);

    const x = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const y = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    let node = document.elementFromPoint(x, y);
    while (node && node !== document.body) {
      const wordInfo = Array.from(node.childNodes)
        .map(child => getWordNode(child, x, y))
        .find(info => info !== null);

      if (wordInfo) {
        const lowercaseWord = wordInfo.word.toLowerCase();
        const word = globasaDictionary[lowercaseWord];

        let label = '';
        if (word) {
          label = wordToLabel(word);
        } else {
          // Check for compound words first
          const compound = checkCompoundWord(lowercaseWord, allWords);
          if (compound) {
            const firstWord = globasaDictionary[compound.firstMorpheme];
            const secondWord = globasaDictionary[compound.secondMorpheme];
            if (firstWord && secondWord) {
              label = `${compound.firstMorpheme} + ${compound.secondMorpheme}\n\n${wordToLabel(firstWord)}\n\n${wordToLabel(secondWord)}`;
            }
          } else {
            // Check for affixation if not a compound word
            const affixation = checkAffixation(lowercaseWord, allWords);
            if (affixation) {
              const firstWord = globasaDictionary[affixation.firstMorpheme];
              const secondWord = globasaDictionary[affixation.secondMorpheme];
              if (firstWord && secondWord) {
                label = `${affixation.firstMorpheme} + ${affixation.secondMorpheme}\n\n${wordToLabel(firstWord)}\n\n${wordToLabel(secondWord)}`;
              }
            }
          }
        }

        if (label) {
          popup.style.display = 'block';
          popup.textContent = label;

          // Get popup dimensions
          const popupRect = popup.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // Calculate position
          let posX = x;
          let posY = y;

          // Adjust horizontal position if needed
          if (x + (popupRect.width / 2) > viewportWidth) {
            posX = viewportWidth - (popupRect.width / 2) - 10;
          } else if (x - (popupRect.width / 2) < 0) {
            posX = (popupRect.width / 2) + 10;
          }

          // Adjust vertical position if needed
          if (y - popupRect.height < 10) {
            // If not enough space above, show below
            popup.style.transform = 'translate(-50%, 20px)';
            posY = y;
          } else {
            // Show above
            popup.style.transform = 'translate(-50%, -100%)';
            posY = y - 10;
          }

          // Apply position
          popup.style.left = `${posX}px`;
          popup.style.top = `${posY}px`;
        }
        return;
      }
      node = node.parentNode;
    }

    popup.style.display = 'none';
  }, 50);

  // Hide popup
  const hidePopup = debounce(() => {
    popup.style.display = 'none';
  }, 100);

  // Event listeners
  document.addEventListener('mousemove', showPopup, { passive: true });
  document.addEventListener('mouseout', hidePopup, { passive: true });
  document.addEventListener('touchstart', showPopup, { passive: true });
  document.addEventListener('touchend', hidePopup, { passive: true });
})();