import type { Meeting, NewsItem, PulseMetric, MeetingMaterial } from '../types';
import { mockCalendarEvents } from '../data/mockCalendar';

export interface SelectedItem {
  type: 'operation-metric' | 'news' | 'financial-kpi';
  id: string;
  name: string;
  data: PulseMetric | NewsItem;
}

export interface RelevantMeeting {
  meeting: Meeting;
  relevanceType:
    | 'title-match'
    | 'description-match'
    | 'material-match'
    | 'keyword-match';
  matchedKeywords: string[];
}

/**
 * Extract keywords from selected items for matching
 */
function extractKeywords(item: SelectedItem): string[] {
  const keywords: string[] = [];

  if (item.type === 'news') {
    const news = item.data as NewsItem;
    // Extract keywords from headline and summary
    const text = `${news.headline} ${news.summary}`.toLowerCase();
    // Split by common words and extract meaningful terms
    const words = text
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .filter(
        (w) =>
          !['this', 'that', 'with', 'from', 'will', 'could', 'should'].includes(
            w
          )
      );
    keywords.push(...words);
    // Also add category-specific terms
    if (news.category === 'suppliers')
      keywords.push('procurement', 'supply', 'supplier');
    if (news.category === 'customers')
      keywords.push('customer', 'revenue', 'sales');
    if (news.category === 'competitors')
      keywords.push('competitor', 'market', 'industry');
    if (news.category === 'macro') keywords.push('macro', 'economic', 'policy');
  } else {
    // For metrics, use the name and related terms
    const metricName = item.name.toLowerCase();
    keywords.push(...metricName.split(/\s+/));

    // Add related terms based on metric type
    if (item.type === 'operation-metric') {
      if (metricName.includes('upph') || metricName.includes('oee')) {
        keywords.push('manufacturing', 'production', 'operations');
      }
      if (metricName.includes('copq') || metricName.includes('quality')) {
        keywords.push('quality', 'defect', 'rework');
      }
      if (
        metricName.includes('gold') ||
        metricName.includes('copper') ||
        metricName.includes('material')
      ) {
        keywords.push('procurement', 'material', 'supply chain', 'cost');
      }
      if (metricName.includes('inventory')) {
        keywords.push('inventory', 'supply chain', 'logistics');
      }
    } else if (item.type === 'financial-kpi') {
      if (metricName.includes('profit')) {
        keywords.push('profit', 'financial', 'p&l', 'earnings');
      }
      if (metricName.includes('revenue')) {
        keywords.push('revenue', 'sales', 'topline', 'financial');
      }
      if (metricName.includes('working capital')) {
        keywords.push('working capital', 'cash', 'financial', 'liquidity');
      }
    }
  }

  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Check if a meeting is relevant to selected items
 */
function isMeetingRelevant(
  meeting: Meeting,
  keywords: string[]
): RelevantMeeting | null {
  const matchedKeywords: string[] = [];
  let relevanceType: RelevantMeeting['relevanceType'] | null = null;

  // Check meeting materials first (most specific match)
  const materialMatches = meeting.materials.some((material) => {
    return keywords.some((keyword) => {
      // This is a simplified check - in real app, would match against actual item IDs
      return keyword.length > 3;
    });
  });

  if (materialMatches) {
    relevanceType = 'material-match';
    matchedKeywords.push(...keywords.filter((k) => k.length > 3));
  }

  // Check title
  const titleLower = meeting.title.toLowerCase();
  const titleMatches = keywords.filter((keyword) => {
    if (keyword.length <= 3) return false;
    return titleLower.includes(keyword);
  });

  if (titleMatches.length > 0 && !relevanceType) {
    relevanceType = 'title-match';
    matchedKeywords.push(...titleMatches);
  }

  // Check description
  if (meeting.description) {
    const descLower = meeting.description.toLowerCase();
    const descMatches = keywords.filter((keyword) => {
      if (keyword.length <= 3) return false;
      return descLower.includes(keyword);
    });

    if (descMatches.length > 0 && !relevanceType) {
      relevanceType = 'description-match';
      matchedKeywords.push(...descMatches);
    } else if (descMatches.length > 0) {
      matchedKeywords.push(...descMatches);
    }
  }

  // Check for keyword matches in title/description
  const keywordMatches = keywords.filter((keyword) => {
    if (keyword.length <= 3) return false;
    const inTitle = titleLower.includes(keyword);
    const inDesc =
      meeting.description?.toLowerCase().includes(keyword) || false;
    return inTitle || inDesc;
  });

  if (keywordMatches.length > 0 && !relevanceType) {
    relevanceType = 'keyword-match';
    matchedKeywords.push(...keywordMatches);
  }

  if (relevanceType && matchedKeywords.length > 0) {
    return {
      meeting,
      relevanceType,
      matchedKeywords: [...new Set(matchedKeywords)],
    };
  }

  return null;
}

/**
 * Find meetings relevant to selected items
 */
export function findRelevantMeetings(
  selectedItems: SelectedItem[]
): RelevantMeeting[] {
  if (selectedItems.length === 0) return [];

  // Extract all keywords from selected items
  const allKeywords = new Set<string>();
  selectedItems.forEach((item) => {
    const keywords = extractKeywords(item);
    keywords.forEach((k) => allKeywords.add(k));
  });

  // Check each meeting for relevance
  const relevantMeetings: RelevantMeeting[] = [];

  mockCalendarEvents.forEach((meeting) => {
    const relevance = isMeetingRelevant(meeting, Array.from(allKeywords));
    if (relevance) {
      relevantMeetings.push(relevance);
    }
  });

  // Sort by relevance (material-match > title-match > description-match > keyword-match)
  const relevanceOrder: Record<RelevantMeeting['relevanceType'], number> = {
    'material-match': 0,
    'title-match': 1,
    'description-match': 2,
    'keyword-match': 3,
  };

  relevantMeetings.sort((a, b) => {
    const orderDiff =
      relevanceOrder[a.relevanceType] - relevanceOrder[b.relevanceType];
    if (orderDiff !== 0) return orderDiff;
    // If same type, sort by number of matched keywords
    return b.matchedKeywords.length - a.matchedKeywords.length;
  });

  return relevantMeetings;
}

/**
 * Generate meeting title from selected items
 */
export function generateMeetingTitle(selectedItems: SelectedItem[]): string {
  if (selectedItems.length === 0) return 'New Meeting';

  const topics: string[] = [];
  const categories = new Set<string>();

  selectedItems.forEach((item) => {
    if (item.type === 'news') {
      const news = item.data as NewsItem;
      categories.add(news.category);
      // Extract key topic from headline (first few words)
      const headlineWords = news.headline.split(' ').slice(0, 3).join(' ');
      topics.push(headlineWords);
    } else {
      topics.push(item.name);
    }
  });

  // Build title based on categories and topics
  if (categories.size === 1) {
    const category = Array.from(categories)[0];
    const categoryName =
      category === 'suppliers'
        ? 'Procurement'
        : category === 'customers'
        ? 'Customer'
        : category === 'competitors'
        ? 'Competitive'
        : category === 'macro'
        ? 'Market'
        : 'Business';
    return `${categoryName} Review - ${topics.slice(0, 2).join(', ')}`;
  }

  // Multiple categories or mixed types
  if (topics.length <= 2) {
    return `Review: ${topics.join(' & ')}`;
  }

  return `Review: ${topics[0]} & ${topics.length - 1} more topic${
    topics.length > 2 ? 's' : ''
  }`;
}
