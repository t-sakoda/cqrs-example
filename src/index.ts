import {CommandBus} from './application/bus/commandBus'
import {AddWidgetCommand} from './application/commands/addWidgetCommand'
import {GetWidgetCommand} from './application/commands/getWidgetCommand'
import {ListWidgetCommand} from './application/commands/listWidgetCommand'
import {AddWidgetHandler} from './application/handlers/addWidgetHandler'
import {GetWidgetHandler} from './application/handlers/getWidgetHandler'
import {ListWidgetHandler} from './application/handlers/listWidgetHandler'
import {InMemoryWidgetRepository} from './infrastructure/InMemoryWidgetRepository'
import {WidgetController} from './presentation/widgetController'

const widgetRepository = new InMemoryWidgetRepository()
const addWidgetHandler = new AddWidgetHandler(widgetRepository)
const getWidgetHandler = new GetWidgetHandler(widgetRepository)
const listWidgetHandler = new ListWidgetHandler(widgetRepository)

const commandBus = new CommandBus()
const widgetController = new WidgetController(commandBus)

commandBus.register(AddWidgetCommand, addWidgetHandler)
commandBus.register(GetWidgetCommand, getWidgetHandler)
commandBus.register(ListWidgetCommand, listWidgetHandler)

async function main() {
  const addResult = await widgetController.addWidget(
    'Widget 1',
    'Description 1',
    10,
  )
  console.log('Add:', addResult)

  const getResult = await widgetController.getWidget(addResult.id)
  console.log('Get:', getResult)

  const listResult = await widgetController.listWidgets()
  console.log('List:', listResult)
}

main().catch(console.error)
