import React, { createContext, useContext, useState, useEffect } from 'react';
import { CONTENT_DEFAULTS } from '../content/defaults';

const ContentContext = createContext({ c: (name) => CONTENT_DEFAULTS[name] ?? '' });

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ apiUrl, children }) => {
  // Seeded with the defaults so the very first paint is real copy, not blanks.
  const [content, setContent] = useState(CONTENT_DEFAULTS);

  useEffect(() => {
    const controller = new AbortController();

    const fetchContent = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/content`, { signal: controller.signal });
        const data = await res.json();
        if (data?.data && typeof data.data === 'object') {
          // Merged over the defaults rather than replacing them, so a key added
          // in the frontend before it is seeded still renders.
          setContent({ ...CONTENT_DEFAULTS, ...data.data });
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        // Non-fatal by design: the defaults are already in state.
        console.error('Failed to fetch site content:', error);
      }
    };

    fetchContent();
    return () => controller.abort();
  }, [apiUrl]);

  const c = (name) => content[name] ?? CONTENT_DEFAULTS[name] ?? '';

  return <ContentContext.Provider value={{ c, content }}>{children}</ContentContext.Provider>;
};
