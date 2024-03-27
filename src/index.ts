import { SCHEDULE_URL_72_HOURS } from './common';
import { spider } from './spider';
import { buildBlocks, sendIncomingWebhook } from './slack';

export interface Env {
  SLACK_WEBHOOK_URL: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const url = SCHEDULE_URL_72_HOURS;
    const result = await spider(url);
    const blocks = buildBlocks(url, result.北航船, result.南航船);
    await sendIncomingWebhook(env.SLACK_WEBHOOK_URL, blocks);
  }
};
