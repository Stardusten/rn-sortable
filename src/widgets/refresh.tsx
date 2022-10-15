import { renderWidget, usePlugin, useRunAsync, useTracker, WidgetLocation } from '@remnote/plugin-sdk';
import { parseSortRule, sortRuleHandlers } from '../lib/sort-rules';

export const RefreshButton = () => {

  const plugin = usePlugin();

  const rem = useRunAsync(async () => {
    const context = await plugin.widget.getWidgetContext<WidgetLocation.RightSideOfEditor>();
    return plugin.rem.findOne(context.remId);
  }, []);

  return <div
    className="refresh-button"
    onClick={ async () => {
      if (!rem || !await rem.hasPowerup('sorted'))
        return;

      const targetRems = await rem.getChildrenRem();
      const numTargets = targetRems.length;

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
      targetRems.splice(0, i);

      // try to get sort rules from slot
      const sortRuleString = await rem.getPowerupProperty('sorted', 'sortRule');

      // try execute
      for (const { byWhat, desc, arg } of parseSortRule(sortRuleString)) {
        const handler = sortRuleHandlers.get(byWhat);
        // console.log(byWhat, desc, arg);
        if (handler) {
          const sortedRems = await handler(targetRems, desc, arg, plugin);
          // TODO to be optimized
          // if switch to async call, order will be broken
          // move to a stub rem first will greatly improve the performance
          const newStubRem = (await plugin.rem.createRem())!;
          for (const rem of sortedRems)
            await plugin.rem.moveRems([rem], newStubRem, numTargets + i);
          await plugin.rem.moveRems(sortedRems, rem, i);
          await newStubRem.remove();
          break;
        }
      }
    }}
  >
    <svg t="1665817435338" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
         p-id="1336" width="16" height="16">
      <path

        d="M874.666667 426.666667h-213.333334a21.333333 21.333333 0 0 1-21.333333-21.333334v-12.373333a20.906667 20.906667 0 0 1 6.4-15.36l75.946667-75.946667A295.68 295.68 0 0 0 512 213.333333a298.666667 298.666667 0 1 0 298.666667 318.72 21.333333 21.333333 0 0 1 21.333333-20.053333h42.666667a22.186667 22.186667 0 0 1 15.36 6.826667 21.333333 21.333333 0 0 1 5.546666 15.786666 384 384 0 1 1-111.786666-293.973333l63.573333-63.573333a20.906667 20.906667 0 0 1 14.933333-6.4h12.373334a21.333333 21.333333 0 0 1 21.333333 21.333333v213.333333a21.333333 21.333333 0 0 1-21.333333 21.333334z"
        p-id="1337"></path>
    </svg>
  </div>
}

renderWidget(RefreshButton);