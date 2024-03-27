import type { Block, ContextBlock, DividerBlock, HeaderBlock, KnownBlock, RichTextBlock } from '@slack/types';
import type { Ship } from './common';

export async function sendIncomingWebhook(webhookUrl: string, payload: object) {
  return await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function buildBlocks(sourceUrl: string, north: Ship[], south: Ship[]) {
  const blocks: (KnownBlock | Block)[] = [];
  const divider: DividerBlock = {
    type: 'divider'
  };
  const totalShipCount = north.length + south.length;

  blocks.push(buildHeader());
  blocks.push(buildContext(totalShipCount));
  blocks.push(divider);
  if (totalShipCount > 0) {
    blocks.push(buildShipList('北航船（入港）', north));
    blocks.push(divider);
    blocks.push(buildShipList('南航船（出港）', south));
    blocks.push(divider);
  }
  blocks.push(buildLink('東京湾海上交通センター', sourceUrl));

  return { blocks };
}

function buildHeader(): HeaderBlock {
  return {
    type: 'header',
    text: {
      type: 'plain_text',
      text: '浦賀水道航路 大型船入航予定',
      emoji: false
    }
  };
}

function buildContext(totalShipCount: number): ContextBlock {
  let emoji, text;
  if (totalShipCount === 0) {
    emoji = 'ring_buoy'; // 🛟
    text = '官船の入航予定はありません';
  } else {
    emoji = 'ship'; // 🚢
    text = '官船の入航予定があります';
  }
  return {
    type: 'context',
    elements: [
      {
        type: 'plain_text',
        text: `:${emoji}: ${text}`,
        emoji: true
      }
    ]
  };
}

function buildShipList(title: string, ships: Ship[]): RichTextBlock {
  const disp = ships.slice(0, 5);
  const rest = ships.slice(5);

  const richText: RichTextBlock = {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_section',
        elements: [
          {
            type: 'emoji',
            name: 'anchor' // ⚓
          },
          {
            type: 'text',
            text: ' ' + title,
            style: {
              bold: true
            }
          }
        ]
      }
    ]
  };

  if (disp.length === 0) {
    richText.elements.push({
      type: 'rich_text_section',
      elements: [
        {
          type: 'text',
          text: 'なし'
        }
      ]
    });
    return richText;
  }

  richText.elements.push({
    type: 'rich_text_list',
    style: 'bullet',
    elements: disp.map(ship => ({
      type: 'rich_text_section',
      elements: [
        {
          type: 'text',
          text: ship.time,
          style: {
            code: true
          }
        },
        {
          type: 'text',
          text: ` ${ship.name} (${ship.registry}) ${ship.port}`
        }
      ]
    }))
  });

  if (rest.length > 0) {
    richText.elements.push({
      type: 'rich_text_section',
      elements: [
        {
          type: 'text',
          text: `他${rest.length}件`
        }
      ]
    });
  }

  return richText;
}

function buildLink(text: string, url: string): RichTextBlock {
  return {
    type: 'rich_text',
    elements: [
      {
        type: 'rich_text_section',
        elements: [
          {
            type: 'emoji',
            name: 'link' // 🔗
          },
          {
            type: 'link',
            url,
            text
          }
        ]
      }
    ]
  };
}
