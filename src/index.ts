import {CommandBus} from './application/bus/commandBus'
import {AddWidgetCommand} from './application/commands/addWidgetCommand'
import {GetWidgetCommand} from './application/commands/getWidgetCommand'
import {AddWidgetHandler} from './application/handlers/addWidgetHandler'
import {GetWidgetHandler} from './application/handlers/getWidgetHandler'
import {InMemoryWidgetRepository} from './infrastructure/InMemoryWidgetRepository'
import {WidgetController} from './presentation/widgetController'

const widgetRepository = new InMemoryWidgetRepository()
const addWidgetHandler = new AddWidgetHandler(widgetRepository)
const getWidgetHandler = new GetWidgetHandler(widgetRepository)

const commandBus = new CommandBus()
const widgetController = new WidgetController(commandBus)

commandBus.register(AddWidgetCommand, addWidgetHandler)
commandBus.register(GetWidgetCommand, getWidgetHandler)

async function main() {
  const addResult = await widgetController.addWidget(
    'Widget 1',
    'Description 1',
    10,
  )
  console.log('Add:', addResult)

  const getResult = await widgetController.getWidget(addResult.id)
  console.log('Get:', getResult)
}

main().catch(console.error)
