import { AppEvents, BuiltInPowerupCodes, declareIndexPlugin, ReactRNPlugin, Rem } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
import { parseSortRule, sortRuleHandlers } from '../lib/sort-rules';

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerPowerup(
    'Sorted',
    'sorted',
    '',
    {
      slots: [{
        code: 'sortRule',
        name: 'Sort Rule',
        onlyProgrammaticModifying: false,
        hidden: false,
      }]
    }
  );

  await plugin.app.registerCommand({
    name: 'test',
    id: 'test',
    action: async () => {
      const focusedRem = await plugin.focus.getFocusedRem();
      const parentRem = await focusedRem!.getParentRem();
      const siblings = await parentRem!.getChildrenRem();
      await plugin.rem.moveRems([focusedRem!], parentRem!, siblings!.length);
    }
  });

  await plugin.event.addListener(
    AppEvents.FocusedRemChange,
    undefined,
    async ({nextRemId}) => {

      const nextRem = await plugin.rem.findOne(nextRemId);

      if (!nextRem || !await nextRem.hasPowerup('sorted'))
        return;

      const targetRems = await nextRem.getChildrenRem();
      const numTargets = targetRems.length;

      // ignore leading powerup slots & empty rems
      let i = 0;
      for (const targetRem of targetRems) {
        if (await targetRem.isPowerupSlot()
          || await targetRem.isPowerupProperty()
          || (await plugin.richText.toString(targetRem.text)).trim() == '')
          i += 1;
        else break;
      }
      targetRems.splice(0, i);

      // try to get sort rules from slot
      const sortRuleString = await nextRem.getPowerupProperty('sorted', 'sortRule');

      // try execute
      for (const { byWhat, desc } of parseSortRule(sortRuleString)) {
        const handler = sortRuleHandlers.get(byWhat);
        if (handler) {
          const sortedRems = await handler(targetRems, desc);
          // TODO to be optimized
          // if switch to async call, order will be broken
          // move to a stub rem first will greatly improve the performance
          const newStubRem = (await plugin.rem.createRem())!;
          for (const rem of sortedRems)
            await plugin.rem.moveRems([rem], newStubRem, numTargets + i);
          await plugin.rem.moveRems(sortedRems, nextRem, i);
          await newStubRem.remove();
          break;
        }
      }
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
