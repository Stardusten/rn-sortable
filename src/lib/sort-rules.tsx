import { Rem, RemType, RNPlugin, usePlugin } from '@remnote/plugin-sdk';

export const parseSortRule = (sortRuleString: string) => {
  return sortRuleString.split(',')
    .map(r => r.match(/([^()+-]+)(?:\((\w+)\))?([+-]?)/))
    .flatMap(match => {
      return match && match[1] ? {
        byWhat: match[1].trim(),
        desc: match[3] == '-',
        arg: match[2],
      } : [];
    })
}