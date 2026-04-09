import type { DeckTemplate } from '@presentation-studio/schema';
import { brochureEnterprise } from './brochureEnterprise.js';
import { brochurePremium } from './brochurePremium.js';
import { caseStudyModern } from './caseStudyModern.js';
import { salesProposal } from './salesProposal.js';
import { execUpdate } from './execUpdate.js';
import { quarterlyReview } from './quarterlyReview.js';
import { trainingDeck } from './trainingDeck.js';

export {
  brochureEnterprise,
  brochurePremium,
  caseStudyModern,
  salesProposal,
  execUpdate,
  quarterlyReview,
  trainingDeck,
};

export const ALL_TEMPLATES: DeckTemplate[] = [
  brochureEnterprise,
  brochurePremium,
  caseStudyModern,
  salesProposal,
  execUpdate,
  quarterlyReview,
  trainingDeck,
];

export function findTemplate(id: string): DeckTemplate | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id);
}
