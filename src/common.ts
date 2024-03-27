export type Course = '北航船' | '南航船';

export interface Ship {
  // 入航予定時刻
  time: string;
  // 船名
  name: string;
  // 船種
  type: string;
  // 船籍
  registry: string;
  // 仕向港/仕出港
  port: string;
}

export const SCHEDULE_URL_24_HOURS = 'https://www6.kaiho.mlit.go.jp/tokyowan/schedule/URAGA/schedule_1.html';
export const SCHEDULE_URL_72_HOURS = 'https://www6.kaiho.mlit.go.jp/tokyowan/schedule/URAGA/schedule_2.html';
