import {
  Rem,
  RemType,
  renderWidget,
  RNPlugin,
  usePlugin,
  useRunAsync,
  useTracker,
  WidgetLocation,
} from '@remnote/plugin-sdk';
import { parseSortRule } from '../lib/sort-rules';

export const RefreshButton = () => {

  const plugin = usePlugin();

  const rem = useTracker(async (reactivePlugin) => {
    const context = await reactivePlugin.widget.getWidgetContext<WidgetLocation.RightSideOfEditor>();
    return context && await reactivePlugin.rem.findOne(context.remId);
  });

  const parentRem = useRunAsync(async () => await rem?.getParentRem(), [rem]);

  const frontText = useTracker(async (reactivePlugin) => {
    const text = rem?.text;
    return text && await reactivePlugin.richText.toString(text);
  }, [rem]);

  const getSlotValue = async (rem: Rem, key: string) => {
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

  const compareByStatus = (
    objA: { status: 'Finished' | 'Unfinished' | undefined },
    objB: { status: 'Finished' | 'Unfinished' | undefined }
  ) => {
      const statusA = objA.status;
      const statusB = objB.status;
      let ret;
      if (!statusA && !statusB)
        ret = 0;
      else if (!statusA && statusB)
        ret = 1;
      else if (statusA && !statusB)
        ret = -1;
      else if (statusA == statusB)
        ret = 0;
      else if (statusA == 'Unfinished')
        ret = -1;
      else ret = 1;
      return ret;
    }

  const compareByText = (
    objA: { remText: string },
    objB: { remText: string }
  ) => {
      return objA.remText.localeCompare(objB.remText);
    }

  const compareBySlotValue = (
    objA: { slotValue: string },
    objB: { slotValue: string }
  ) => {
      const slotValueA = objA.slotValue;
      const slotValueB = objB.slotValue;
      let ret;
      if (slotValueA == slotValueB)
        ret = 0.0;
      else if (!slotValueA)
        ret = 1.0;
      else if (!slotValueB)
        ret = 2.0;
      else ret = slotValueA.localeCompare(slotValueB);
      return ret;
    }

  const comparators = {
    byStatus: compareByStatus,
    byText: compareByText,
    bySlotValue: compareBySlotValue,
  }

  const statusFetcher = async (objs: { rem: Rem }[]) => {
    return await Promise.all(objs.map(async obj => {
      const rem = obj.rem;
      const status = await rem.isTodo()
        ? await rem.getTodoStatus()
        : undefined;
      return { ...obj, status };
    }));
  }

  const remTextFetcher = async (objs: { rem: Rem }[]) => {
    return await Promise.all(objs.map(async obj => {
      const remText = await plugin.richText.toString(obj.rem.text);
      return { ...obj, remText: remText.trim() };
    }));
  }

  const slotValueFetcher = async (objs: { rem: Rem }[], slotName: string) => {
    return await Promise.all(objs.map(async obj => {
      const rem = obj.rem;
      const slotValue = await getSlotValue(rem, slotName);
      return { ...obj, slotValue };
    }))
  }

  const fetchers = {
    byStatus: statusFetcher,
    byText: remTextFetcher,
    bySlotValue: slotValueFetcher,
  };

  return frontText == 'Sort Rule' ?
    <div
      className="refresh-button"
      onClick={ async () => {

        if (!parentRem || !await parentRem.hasPowerup('sorted'))
          return;

        const targetRems = await parentRem.getChildrenRem();
        let targets: any[] = targetRems.map(rem => { return { rem }});
        const numTargets = targets.length;

        // ignore leading powerup slots & empty rems
        let i = 0;
        for (const targetRem of targetRems) {
          if (await targetRem.isPowerupSlot()
            || await targetRem.isSlot()
            || await targetRem.isPowerupProperty()
            || (await plugin.richText.toString(targetRem.text)).trim() == '')
            i += 1;
          else break;
        }
        targets.splice(0, i);

        // try to get sort rules from slot
        const sortRuleString = await parentRem.getPowerupProperty('sorted', 'sortRule');

        const sortRules = parseSortRule(sortRuleString);

        // fetch all the required data
        const requiredComparators: any[] = [];
        for (const { byWhat, arg } of sortRules) {
          const fetcher = (fetchers as any)[byWhat];
          const comparator = (comparators as any)[byWhat];
          if (fetcher && comparator) {
            targets = await fetcher(targets, arg);
            requiredComparators.push(comparator);
          }
        }

        // sort
        targets.sort((objA, objB) => {
          let finalResult = 0.0;
          for (const comparator of requiredComparators) {
            finalResult = comparator(objA, objB);
            if (finalResult != 0.0)
              break;
          }
          return finalResult;
        });

        const tempRem = await plugin.rem.createRem();
        if (!tempRem) return;
        const sortedRems = targets.map(obj => obj.rem);
        for (const rem of sortedRems)
          await plugin.rem.moveRems([rem], tempRem, numTargets + i);
        await plugin.rem.moveRems(sortedRems, parentRem, i);
        await tempRem.remove();
      }}
    >
      <svg t="1665817435338" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
           p-id="1336" width="16" height="16">
        <path

          d="M874.666667 426.666667h-213.333334a21.333333 21.333333 0 0 1-21.333333-21.333334v-12.373333a20.906667 20.906667 0 0 1 6.4-15.36l75.946667-75.946667A295.68 295.68 0 0 0 512 213.333333a298.666667 298.666667 0 1 0 298.666667 318.72 21.333333 21.333333 0 0 1 21.333333-20.053333h42.666667a22.186667 22.186667 0 0 1 15.36 6.826667 21.333333 21.333333 0 0 1 5.546666 15.786666 384 384 0 1 1-111.786666-293.973333l63.573333-63.573333a20.906667 20.906667 0 0 1 14.933333-6.4h12.373334a21.333333 21.333333 0 0 1 21.333333 21.333333v213.333333a21.333333 21.333333 0 0 1-21.333333 21.333334z"
          p-id="1337"></path>
      </svg>
    </div> : null;
}

renderWidget(RefreshButton);