import { Rem, RemType, RNPlugin, usePlugin } from '@remnote/plugin-sdk';

export const parseSortRule = (sortRuleString: string) => {
  return sortRuleString.split(',')
    .map(r => r.match(/([^()+-]+)(?:\((\w+)\))?([+-]?)/))
    .flatMap(match => {
      return match && match[1] ? {
        byWhat: match[1],
        desc: match[3] == '-',
        arg: match[2],
      } : [];
    })
}

export type SortRuleExecutor = (
  rems: Rem[],
  desc: boolean,
  arg: string,
  plugin: RNPlugin,
) => Rem[] | Promise<Rem[]>;

const sortByStatus: SortRuleExecutor = async (
  rems: Rem[],
  desc: boolean
) => {
  return (await Promise.all(
    rems.map(async (rem) => {
      const status = await rem.isTodo()
        ? await rem.getTodoStatus()
        : undefined;
      return { rem, status };
    })))
    .sort((a, b) => (desc ? -1 : 1) * compareByStatus(a.status, b.status))
    // .map(a => {
    //   console.log(a.rem.text + ", " + a.status);
    //   return a;
    // })
    .map(a => a.rem);
}

const getSlotValue = async (rem: Rem, key: string, plugin: RNPlugin) => {
  const children = await rem.getChildrenRem();
  if (children) {
    for (const rem of children) {
      const remType = await rem.getType();
      if (remType != RemType.DESCRIPTOR)
        continue;
      const frontText = await plugin.richText.toString(rem.text);
      if (frontText.trim() == key) {
        return await plugin.richText.toString(rem.backText!);
      }
    }
  }
}

const sortBySlot: SortRuleExecutor = async (
  rems: Rem[],
  desc: boolean,
  arg: string,
  plugin: RNPlugin
) => {
  return (await Promise.all(
    rems.map(async (rem) => {
      const slotValue = await getSlotValue(rem, arg, plugin);
      return { rem, slotValue };
    })))
    .sort((a, b) => {
      if (a.slotValue == b.slotValue)
        return 0;
      if (!a.slotValue)
        return 1;
      if (!b.slotValue)
        return -1;
      return (desc ? -1 : 1) * a.slotValue.localeCompare(b.slotValue);
    })
    // .map(a => {
    //   console.log(a.rem.text + ", " + a.slotValue);
    //   return a;
    // })
    .map(a => a.rem);
}

const compareByStatus = (
  aStatus: "Finished" | "Unfinished" | undefined,
  bStatus: "Finished" | "Unfinished" | undefined
) => {
  if (!aStatus && !bStatus)
    return 0;
  if (!aStatus && bStatus)
    return 1;
  if (aStatus && !bStatus)
    return -1;

  if (aStatus == bStatus)
    return 0;
  else if (aStatus == 'Unfinished')
    return -1;
  else return 1;
}

export const sortRuleHandlers = new Map([
  ['byStatus', sortByStatus],
  ['bySlot', sortBySlot],
]);