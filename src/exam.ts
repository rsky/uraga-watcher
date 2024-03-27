import { SCHEDULE_URL_24_HOURS, SCHEDULE_URL_72_HOURS } from './common';
import { spider } from './spider';

async function main() {
  const result24hours = spider(SCHEDULE_URL_24_HOURS, null);
  const result72hours = spider(SCHEDULE_URL_72_HOURS);

  console.log('24時間：すべて');
  console.log(await result24hours);

  console.log('72時間：官船のみ');
  console.log(await result72hours);
}

main().then(() => {}).catch(console.error);
