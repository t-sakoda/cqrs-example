import {CommandBus} from './application/bus/commandBus'
import {AddWidgetCommand} from './application/commands/addWidgetCommand'
import {AddWidgetHandler} from './application/handlers/addWidgetHandler'
import {InMemoryWidgetRepository} from './infrastructure/InMemoryWidgetRepository'
import {WidgetController} from './presentation/widgetController'

const widgetRepository = new InMemoryWidgetRepository()
const addWidgetHandler = new AddWidgetHandler(widgetRepository)

const commandBus = new CommandBus()
const widgetController = new WidgetController(commandBus)

commandBus.register(AddWidgetCommand, addWidgetHandler)

async function main() {
  const addResult = await widgetController.addWidget(
    'Widget 1',
    'Description 1',
    10,
  )
  console.log(addResult)
}

main().catch(console.error)
