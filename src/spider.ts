import { Parser } from 'htmlparser2';
import type { Course, Ship } from './common';

/**
 * @param url 大型船入航予定情報 - 浦賀水道航路 のURL
 * @param shipType 船種。「官船」は軍艦の場合が多い。護衛艦もUSSも含まれる。
 */
export async function spider(url: string, shipType: string | null = '官船'): Promise<Record<Course, Ship[]>> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  const result: Record<Course, Ship[]> = {
    '北航船': [],
    '南航船': []
  };
  let currentTag: string = '';
  let currentCaption: string = '';
  let currentCourse: Course | null = null;
  let currentColumnIndex: number = -1;
  let currentShip: Ship = createShip();

  const parser = new Parser({
    onopentag(name: string) {
      currentTag = name.toLowerCase();
      switch (currentTag) {
        case 'caption': {
          // 南北の判定をリセット
          currentCaption = '';
          currentCourse = null;
          break;
        }
        case 'tr': {
          if (currentCourse === null) {
            // 入航予定情報のテーブル内でない場合は無視
            break;
          }
          // 列番号と船舶情報をリセット
          currentColumnIndex = -1;
          currentShip = createShip();
          break;
        }
        case 'td': {
          if (currentCourse === null) {
            // 入航予定情報のテーブル内でない場合は無視
            break;
          }
          // 列番号をインクリメント
          currentColumnIndex++;
          break;
        }
      }
    },
    ontext(data: string) {
      switch (currentTag) {
        case 'caption': {
          if (currentCourse !== null) {
            // 既に南北の判定が終わっている場合は無視
            break;
          }
          // キャプションの中身を取得して南北の判定を行う
          currentCaption += data;
          const match = currentCaption.match(/入航予定船（([北南]航船)）/u);
          if (match && match[1]) {
            currentCourse = match[1] as Course;
          }
          break;
        }
        case 'td': {
          if (currentCourse === null) {
            // 入航予定情報のテーブル内でない場合は無視
            break;
          }
          // 0: 入航予定時刻, 1: 船名, 2: 船種, 3: 総トン数, 4: 長さ, 5: 種別, 6: 船籍,
          // 7: 仕向港（入航航路）/ 仕出港（出航航路）, 8: 中ノ瀬航路, 9: 水先人
          switch (currentColumnIndex) {
            case 0:
              currentShip.time += data;
              break;
            case 1:
              currentShip.name += data;
              break;
            case 2:
              currentShip.type += data;
              break;
            case 6:
              currentShip.registry += data;
              break;
            case 7:
              currentShip.port += data;
              break;
          }
          break;
        }
      }
    },
    onclosetag(name: string) {
      switch (name.toLowerCase()) {
        case 'table': {
          // 南北の判定をリセット
          currentCaption = '';
          currentCourse = null;
          break;
        }
        case 'tr': {
          if (currentCourse === null) {
            // 入航予定情報のテーブル内でない場合は無視
            break;
          }
          const ship = cleanupShip(currentShip);
          if (ship.time === '') {
            // thead>trの場合はtdが存在しないので
            break;
          }
          // 船舶情報を追加
          if (ship.type === shipType || shipType === null) {
            result[currentCourse].push(ship);
          }
          break;
        }
      }
    }
  });

  parser.write(await response.text());
  parser.end();

  return result;
}

function cleanupShip(ship: Ship): Ship {
  return {
    time: ship.time.trim(),
    name: ship.name.trim(),
    type: ship.type.trim(),
    registry: ship.registry.trim(),
    port: ship.port.trim()
  };
}

function createShip(): Ship {
  return {
    time: '',
    name: '',
    type: '',
    registry: '',
    port: ''
  };
}
