import { Rem } from '@remnote/plugin-sdk';

export const parseSortRule = (sortRuleString: string) => {
  return sortRuleString.split(',')
    .map(r => r.match(/([^+-]+)([+-]?)/))
    .flatMap(match => {
      return match && match[1] ? {
        byWhat: match[1],
        desc: match[2] == '-'
      } : [];
    })
}

export type SortRuleExecutor = (
  rems: Rem[],
  desc: boolean,
  args?: string[]
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
    .map(a => {
      console.log(a.rem.text + ", " + a.status);
      return a;
    })
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
]);