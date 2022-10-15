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

  await plugin.event.addListener(
    AppEvents.FocusedRemChange,
    undefined,
    async ({nextRemId}) => {

      const nextRem = await plugin.rem.findOne(nextRemId);

      if (!nextRem || !await nextRem.hasPowerup('sorted'))
        return;

      const targetRems = await nextRem.getChildrenRem();

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

      const setIndex = (rem: Rem, index: number) => plugin.rem.moveRems([rem], nextRem, index + i);

      // try to get sort rules from slot
      const sortRuleString = await nextRem.getPowerupProperty('sorted', 'sortRule');
      for (const { byWhat, desc } of parseSortRule(sortRuleString)) {
        const handler = sortRuleHandlers.get(byWhat);
        if (handler) {
          handler(targetRems, setIndex, desc);
          break;
        }
      }
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
