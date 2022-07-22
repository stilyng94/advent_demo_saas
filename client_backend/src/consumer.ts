import { Consumer, Kafka, ConsumerSubscribeTopics, EachMessagePayload, EachBatchPayload } from "kafkajs"

import avro from "avsc"
import dotenv from "dotenv"

dotenv.config()


export const dataType = avro.Type.forSchema({
  type: "record",
  name: "calendarEventBody",
  fields: [
    {
      name: "event",
      type: { type: "enum", name: "eventType", symbols: ["UPDATE", "DELETE", "CREATE"] }
    },
    {
      name: "data", type: "int"
    }
  ]
})


class ConsumerFactory {
  private kafkaConsumer: Consumer

  public constructor() {
    this.kafkaConsumer = this.createKafkaConsumer()
  }

  public async start(): Promise<void> {

    try {
      await this.kafkaConsumer.connect()
    } catch (error) {
      console.log('Error connecting the consumer: ', error)
    }
  }

  public async startConsumer(): Promise<void> {
    const topic: ConsumerSubscribeTopics = {
      topics: ['producer-topic'],
      fromBeginning: true
    }

    try {
      await this.kafkaConsumer.subscribe(topic)

      await this.kafkaConsumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          const { topic, message } = messagePayload
          console.log(`Topic: ${topic}`)
          console.log(`converted: ${dataType.fromBuffer(message.value!)}`);

        }
      })
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  public async startBatchConsumer(): Promise<void> {
    const topic: ConsumerSubscribeTopics = {
      topics: ['producer-topic'],
      fromBeginning: false
    }

    try {
      await this.kafkaConsumer.subscribe(topic)
      await this.kafkaConsumer.run({
        eachBatch: async (eachBatchPayload: EachBatchPayload) => {
          const { batch } = eachBatchPayload
          console.log(`Topic: ${batch.topic}`)
          for (const message of batch.messages) {
            console.log(`converted: ${dataType.fromBuffer(message.value!)}`);

          }
        }
      })
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  public async shutdown(): Promise<void> {
    await this.kafkaConsumer.disconnect()
  }

  private createKafkaConsumer(): Consumer {
    const kafka = new Kafka({
      clientId: "hello",
      brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`]
    })
    return kafka.consumer({ groupId: process.env.KAFKA_CONSUMER_GROUP_ID! })
  }
}


const consumer = new ConsumerFactory()

export default consumer