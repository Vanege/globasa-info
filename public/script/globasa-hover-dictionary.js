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

  // Constants for prefixes and suffixes
  const prefixes = ['be', 'du', 'aw', 'awto', 'dis', 'eko', 'fin', 'fron', 'ja', 'nen', 'pos', 'pre', 'ri', 'ru', 'xor', 'anti', 'bax', 'pas', 'ex', 'in', 'infra', 'intre', 'le', 'lefe', 'moy', 'of', 'se', 'supra', 'ton', 'tras', 'ultra', 'xa', 'xafe', 'gami', 'hawa', 'bon', 'bur', 'colo', 'cuyo', 'day', 'fem', 'godo', 'juni', 'kwasi', 'lama', 'lao', 'leli', 'lil', 'mal', 'man', 'meli', 'midi', 'neo', 'semi', 'un', 'dua'];
  const suffixes = ['su', 'li', 'mo', 'ya', 'gi', 'cu', 'do', 'ne', 'ple', 'yum', 'gone', 'ina', 'je', 'sa', 'abil', 'bimar', 'bon', 'bur', 'ible', 'fil', 'kal', 'kolordo', 'laye', 'musi', 'peldo', 'pul', 'sim', 'bol', 'din', 'dom', 'doku', 'dukan', 'ente', 'fon', 'hole', 'grafi', 'ismo', 'ista', 'itis', 'kaxa', 'kef', 'krasi', 'kumax', 'lari', 'lexi', 'logi', 'maso', 'medis', 'meter', 'mon', 'mosem', 'osis', 'tim', 'tora', 'tul', 'xey', 'yen'];

  // Create popup element with improved touch handling styles
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    border-radius: 4px;
    font-size: 14px;
    z-index: 999999;
    display: none;
    transform: translate(-50%, -100%);
    margin-top: -8px;
    max-width: 400px;
    white-space: pre-line;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  `;
  document.body.appendChild(popup);

  let dictionaries = null;
  let touchTimeout = null;
  let lastTapTime = 0;
  const doubleTapDelay = 300; // milliseconds

  // Format etymology
  function formatEtymology(etymology) {
    if (!etymology) return '';
    if (etymology.derived) {
      return etymology.derived.join(' ');
    }
    if (etymology.natlang) {
      return Object.entries(etymology.natlang)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }
    return '';
  }

  // Word to label conversion
  function wordToLabel(word) {
    if (!word?.trans) return '';
    const { eng, epo } = word.trans;
    const engString = eng?.flatMap(item => item).join(', ');
    const epoString = epo?.flatMap(item => item).join(', ');
    const wordClass = word["word class"] ? `(${word["word class"]})` : '';
    const etymologyString = formatEtymology(word.etymology);

    let label = `${engString}\n${epoString}\n${wordClass}\n${etymologyString}`;
    return label.replace(/(<([^>]+)>)/gi, '');
  }

  // Get word node and info with improved word boundary detection
  function getWordNode(element, x, y) {
    if (element.nodeType === Node.TEXT_NODE) {
      const range = document.createRange();
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
          const cleanWord = word.replace(/[!.,;?'")\]}]/g, '');
          return { word: cleanWord, rect };
        }

        currentPos += wordLength;
      }
    }
    return null;
  }

  // Check for compound words
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

  // Unified event handler for both mouse and touch
  async function handleInteraction(e) {
    e.preventDefault(); // Prevent default only for touch events

    if (!dictionaries) {
      dictionaries = await fetchDictionaries();
      if (!dictionaries) return;
    }

    const { globasaDictionary } = dictionaries;
    const allWords = Object.keys(globasaDictionary);

    // Get coordinates based on event type
    const coords = e.type.startsWith('touch')
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };

    // For touch events, implement double-tap detection
    if (e.type === 'touchstart') {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTime;

      if (tapLength < doubleTapDelay && tapLength > 0) {
        // Double tap detected
        clearTimeout(touchTimeout);
        showWordPopup(coords.x, coords.y, globasaDictionary, allWords);
      } else {
        // Single tap - set timeout to show popup
        touchTimeout = setTimeout(() => {
          showWordPopup(coords.x, coords.y, globasaDictionary, allWords);
        }, 500); // Long press delay
      }

      lastTapTime = currentTime;
    } else if (e.type === 'mousemove') {
      // For mouse events, show immediately
      showWordPopup(coords.x, coords.y, globasaDictionary, allWords);
    }
  }

  // Show word popup with given coordinates
  function showWordPopup(x, y, globasaDictionary, allWords) {
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
          const compound = checkCompoundWord(lowercaseWord, allWords);
          if (compound) {
            const firstWord = globasaDictionary[compound.firstMorpheme];
            const secondWord = globasaDictionary[compound.secondMorpheme];
            if (firstWord && secondWord) {
              label = `${compound.firstMorpheme} + ${compound.secondMorpheme}\n\n${wordToLabel(firstWord)}\n\n${wordToLabel(secondWord)}`;
            }
          } else {
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
          positionAndShowPopup(x, y, label);
        }
        return;
      }
      node = node.parentNode;
    }

    hidePopup();
  }

  // Position and show popup
  function positionAndShowPopup(x, y, label) {
    popup.style.display = 'block';
    popup.textContent = label;

    const popupRect = popup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate position with improved mobile positioning
    let posX = Math.min(Math.max(x, popupRect.width / 2), viewportWidth - popupRect.width / 2);
    let posY = y;

    // Check if popup would appear below finger/cursor
    if (y - popupRect.height < 10) {
      popup.style.transform = 'translate(-50%, 20px)';
      posY = y + 20; // Show below with offset
    } else {
      popup.style.transform = 'translate(-50%, -100%)';
      posY = y - 10; // Show above with offset
    }

    popup.style.left = `${posX}px`;
    popup.style.top = `${posY}px`;
  }

  // Hide popup
  function hidePopup() {
    popup.style.display = 'none';
    if (touchTimeout) {
      clearTimeout(touchTimeout);
      touchTimeout = null;
    }
  }

  // Event listeners with improved touch handling
  document.addEventListener('mousemove', debounce(handleInteraction, 50), { passive: false });
  document.addEventListener('mouseout', hidePopup);
  document.addEventListener('touchstart', handleInteraction, { passive: false });
  document.addEventListener('touchend', hidePopup);
  document.addEventListener('touchcancel', hidePopup);

  // Prevent default touch events on popup
  popup.addEventListener('touchstart', e => e.preventDefault());
  popup.addEventListener('touchmove', e => e.preventDefault());
  popup.addEventListener('touchend', e => e.preventDefault());
})();