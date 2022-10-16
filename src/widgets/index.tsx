import { AppEvents, declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
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

  await plugin.app.registerWidget(
    'refresh',
    WidgetLocation.RightSideOfEditor,
    {
      powerupFilter: undefined,
      dimensions: {
        width: '22px',
        height: 'auto',
      }
    }
  );
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
