import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
const client = new DynamoDB({})
const ddbDocClient = DynamoDBDocument.from(client)

export {ddbDocClient}
