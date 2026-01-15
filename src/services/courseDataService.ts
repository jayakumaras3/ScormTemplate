import { TemplateConfig, Toc } from '../types';

export const loadTemplateConfig = async (): Promise<TemplateConfig> => {
  const response = await fetch('/assets/json/template.json');
  if (!response.ok) {
    throw new Error('Failed to load template.json');
  }
  const data = await response.json();
  return data;
};

export const loadToc = async (): Promise<Toc> => {
  const response = await fetch('/assets/json/toc.json');
  if (!response.ok) {
    throw new Error('Failed to load toc.json');
  }
  const data = await response.json();
  return data;
};
