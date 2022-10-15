import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';

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

  // await plugin.app.registerCommand({
  //   name: 'test',
  //   id: 'test',
  //   action: async () => {
  //     const focusedRem = await plugin.focus.getFocusedRem();
  //     console.log(await getPropertyValue(focusedRem!, 'Year', plugin));
  //   }
  // });

  await plugin.app.registerWidget(
    'refresh',
    WidgetLocation.RightSideOfEditor,
    {
      powerupFilter: 'sorted',
      dimensions: {
        width: 'auto',
        height: 'auto',
      }
    }
  )
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
